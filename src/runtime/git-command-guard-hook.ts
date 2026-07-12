import { createHash } from "node:crypto";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { commitOverrideUse, type OverrideAuditPort } from "./guard-override-transaction";
import { evaluateGitCommandGuard, extractShellCommand, resolveDestructiveGitOverride } from "./git-command-guard";

export interface GitCommandGuardHookOutcome {
  exitCode: 0 | 2;
  message?: string;
  reason?: string;
}

function digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function auditPort(auditPath: string): OverrideAuditPort {
  return {
    commit(input) {
      mkdirSync(dirname(auditPath), { recursive: true });
      const reservationDir = `${auditPath}.nonces`;
      mkdirSync(reservationDir, { recursive: true });
      const reservationPath = join(reservationDir, input.nonce.replace(/^sha256:/, ""));
      let reservationFd: number;
      try {
        reservationFd = openSync(reservationPath, "wx", 0o600);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return { status: "reused" };
        throw error;
      }
      closeSync(reservationFd);
      try {
        appendFileSync(auditPath, `${JSON.stringify({
          schemaVersion: "guard-override-audit.v1",
          nonce: input.nonce,
          guardKind: input.classification.guardKind,
          operationClass: input.classification.operationClass,
          subjectDigest: input.classification.subjectDigest,
          reasonDigest: digest(input.reason),
        })}\n`, { flush: true });
        return { status: "committed" };
      } catch (error) {
        rmSync(reservationPath, { force: true });
        throw error;
      }
    },
    abort(input) {
      appendFileSync(auditPath, `${JSON.stringify({
        schemaVersion: "guard-override-abort.v1",
        nonce: input.nonce,
        reason: input.reason,
      })}\n`, { flush: true });
    },
  };
}

export function runGitCommandGuardHook(opts: {
  repoRoot: string;
  rawInput: string;
  env?: NodeJS.ProcessEnv;
}): GitCommandGuardHookOutcome {
  let input: { tool_input?: unknown };
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
  if (override.source === "env") return { exitCode: 0, reason: "bypass" };
  if (override.source !== "marker" || markerReason === null) return { exitCode: 2, message: base.message };
  try {
    const markerStat = statSync(markerPath);
    const nonce = digest(`${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:${markerReason}`);
    const result = commitOverrideUse({
      nonce,
      reason: override.reason,
      classification: {
        guardKind: "git",
        operationClass: base.destructiveOperation ?? "indeterminate",
        subjectDigest: digest(command),
      },
      audit: auditPort(join(opts.repoRoot, ".helix", "logs", "destructive-git-overrides.jsonl")),
      marker: {
        consume(expectedNonce) {
          const current = readFileSync(markerPath, "utf8");
          const currentStat = statSync(markerPath);
          const actual = digest(`${currentStat.dev}:${currentStat.ino}:${currentStat.mtimeMs}:${current}`);
          if (actual !== expectedNonce) return false;
          rmSync(markerPath);
          return !existsSync(markerPath);
        },
      },
    });
    if (result.status === "allowed") return { exitCode: 0, reason: "bypass" };
    return { exitCode: 2, message: `${base.message} override=${result.status}` };
  } catch {
    return { exitCode: 2, message: `${base.message} override=blocked_audit_failure` };
  }
}
