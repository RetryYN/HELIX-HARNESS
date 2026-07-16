import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { defaultHarnessDbPath, type HarnessDb, openHarnessDb } from "../state-db";
import { migrate, SCHEMA_VERSION } from "../state-db/migration";
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
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          db.exec("BEGIN IMMEDIATE");
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
          } catch {
            // fail-close: retain the original transaction error; rollback is best-effort cleanup.
          }
          const code = String((error as NodeJS.ErrnoException).code ?? "");
          const message = String(error).toUpperCase();
          const busy =
            code.includes("BUSY") ||
            code.includes("LOCKED") ||
            message.includes("SQLITE_BUSY") ||
            message.includes("SQLITE_LOCKED") ||
            message.includes("DATABASE IS LOCKED");
          if (!busy) throw error;
          if (attempt === 4) {
            const committed = db
              .prepare(
                "SELECT 1 FROM guard_override_transactions WHERE nonce=? AND status='committed' LIMIT 1",
              )
              .get(input.nonce);
            if (committed) return { status: "reused" };
            throw error;
          }
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10 * (attempt + 1));
        }
      }
      throw new Error("guard override transaction retry exhausted");
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
  let markerNonce: string | null = null;
  try {
    markerReason = existsSync(markerPath) ? readFileSync(markerPath, "utf8") : null;
    if (markerReason !== null) {
      const markerStat = statSync(markerPath);
      markerNonce = guardOverrideDigest(
        `${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:${markerReason}`,
      );
    }
  } catch {
    return { exitCode: 2, message: base.message };
  }
  const override = resolveDestructiveGitOverride({
    env: (opts.env ?? process.env).HELIX_ALLOW_DESTRUCTIVE_GIT,
    markerReason,
  });
  const barrierDir = (opts.env ?? process.env).HELIX_GUARD_TEST_BARRIER_DIR;
  if ((opts.env ?? process.env).NODE_ENV === "test" && barrierDir) {
    mkdirSync(barrierDir, { recursive: true });
    writeFileSync(join(barrierDir, String(process.pid)), "ready");
    const deadline = Date.now() + 5_000;
    while (readdirSync(barrierDir).length < 2) {
      if (Date.now() >= deadline) throw new Error("guard test barrier timed out");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  }
  if (override.source === "env") {
    try {
      const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
        repoRoot: opts.repoRoot,
        skipPersistentPragmas: true,
      });
      try {
        if (db.userVersion() < SCHEMA_VERSION) migrate(db);
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
  if (override.source !== "marker" || markerReason === null || markerNonce === null)
    return { exitCode: 2, message: base.message };
  try {
    const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
      repoRoot: opts.repoRoot,
      skipPersistentPragmas: true,
    });
    try {
      if (db.userVersion() < SCHEMA_VERSION) migrate(db);
      const result = commitOverrideUse({
        nonce: markerNonce,
        reason: override.reason,
        classification: {
          guardKind: "git",
          operationClass: base.destructiveOperation ?? "indeterminate",
          subjectDigest: guardOverrideDigest(command),
        },
        audit: createGuardOverrideAuditPort(db),
        marker: {
          consume(expectedNonce) {
            if (
              (opts.env ?? process.env).NODE_ENV === "test" &&
              (opts.env ?? process.env).HELIX_GUARD_TEST_FAULT === "pause_after_audit"
            ) {
              Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30_000);
            }
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
