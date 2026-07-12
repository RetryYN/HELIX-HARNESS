import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { defaultHarnessDbPath, type HarnessDb, openHarnessDb } from "../state-db";
import { migrate } from "../state-db/migration";
import {
  evaluateGitCommandGuard,
  extractShellCommand,
  resolveDestructiveGitOverride,
} from "./git-command-guard";
import { commitOverrideUse, type OverrideAuditPort } from "./guard-override-transaction";

export interface GitCommandGuardHookOutcome {
  exitCode: 0 | 2;
  message?: string;
  reason?: string;
}

export function guardOverrideDigest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function createGuardOverrideAuditPort(db: HarnessDb): OverrideAuditPort {
  return {
    commit(input) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const inserted = db
          .prepare(`INSERT OR IGNORE INTO guard_override_transactions
          (nonce, guard_kind, operation_class, subject_digest, reason_digest, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'committed', ?)`)
          .run(
            input.nonce,
            input.classification.guardKind,
            input.classification.operationClass,
            input.classification.subjectDigest,
            guardOverrideDigest(input.reason),
            new Date().toISOString(),
          );
        db.exec("COMMIT");
        return { status: inserted.changes === 1 ? "committed" : "reused" };
      } catch (error) {
        try {
          db.exec("ROLLBACK");
        } catch {}
        throw error;
      }
    },
    abort(input) {
      db.prepare(`UPDATE guard_override_transactions
        SET status='consume_failed', abort_reason=? WHERE nonce=?`).run(input.reason, input.nonce);
    },
  };
}

export function runGitCommandGuardHook(opts: {
  repoRoot: string;
  rawInput: string;
  env?: NodeJS.ProcessEnv;
}): GitCommandGuardHookOutcome {
  let input: { tool_input?: unknown; session_id?: string };
  try {
    input = JSON.parse(opts.rawInput || "{}");
  } catch {
    return { exitCode: 2, message: "[helix-git-command-guard] BLOCK: invalid hook input" };
  }
  const command = extractShellCommand(input.tool_input);
  const base = evaluateGitCommandGuard({ command, bypass: false });
  if (base.decision === "pass") return { exitCode: 0, reason: base.reason };
  const markerPath = join(opts.repoRoot, ".helix", "state", "destructive-git-override");
  let markerReason: string | null = null;
  try {
    markerReason = existsSync(markerPath) ? readFileSync(markerPath, "utf8") : null;
  } catch {
    return { exitCode: 2, message: base.message };
  }
  const override = resolveDestructiveGitOverride({
    env: (opts.env ?? process.env).HELIX_ALLOW_DESTRUCTIVE_GIT,
    markerReason,
  });
  if (override.source === "env") {
    try {
      const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), { repoRoot: opts.repoRoot });
      try {
        migrate(db);
        const result = commitOverrideUse({
          nonce: guardOverrideDigest(
            `env:git:${input.session_id ?? "unknown"}:${guardOverrideDigest(command)}`,
          ),
          reason: override.reason,
          classification: {
            guardKind: "git",
            operationClass: base.destructiveOperation ?? "indeterminate",
            subjectDigest: guardOverrideDigest(command),
          },
          audit: createGuardOverrideAuditPort(db),
          marker: { consume: () => true },
        });
        if (result.status === "allowed") return { exitCode: 0, reason: "bypass" };
        return { exitCode: 2, message: `${base.message} override=${result.status}` };
      } finally {
        db.close();
      }
    } catch {
      return { exitCode: 2, message: `${base.message} override=blocked_audit_failure` };
    }
  }
  if (override.source !== "marker" || markerReason === null)
    return { exitCode: 2, message: base.message };
  try {
    const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), { repoRoot: opts.repoRoot });
    try {
      migrate(db);
      const markerStat = statSync(markerPath);
      const nonce = guardOverrideDigest(
        `${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:${markerReason}`,
      );
      const result = commitOverrideUse({
        nonce,
        reason: override.reason,
        classification: {
          guardKind: "git",
          operationClass: base.destructiveOperation ?? "indeterminate",
          subjectDigest: guardOverrideDigest(command),
        },
        audit: createGuardOverrideAuditPort(db),
        marker: {
          consume(expectedNonce) {
            const current = readFileSync(markerPath, "utf8");
            const currentStat = statSync(markerPath);
            const actual = guardOverrideDigest(
              `${currentStat.dev}:${currentStat.ino}:${currentStat.mtimeMs}:${current}`,
            );
            if (actual !== expectedNonce) return false;
            rmSync(markerPath);
            return !existsSync(markerPath);
          },
        },
      });
      if (result.status === "allowed") return { exitCode: 0, reason: "bypass" };
      return { exitCode: 2, message: `${base.message} override=${result.status}` };
    } finally {
      db.close();
    }
  } catch {
    return { exitCode: 2, message: `${base.message} override=blocked_audit_failure` };
  }
}
