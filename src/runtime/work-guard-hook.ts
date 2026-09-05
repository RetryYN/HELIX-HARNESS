/**
 * work-guard hook 実行本体 — dev repo hook (`.claude/hooks/work-guard.ts`) と consumer 配布経路の
 * `helix hook work-guard` (PLAN-L7-433 C1) が共有する orchestration runner。
 *
 * 判定純関数は work-guard.ts。ここは stdin JSON の解釈、git status / session log の収集、
 * override marker のone-shot消費とauditを担う。入力解析、git、state、transactionを検証できない場合は
 * fail-closeし、adapterが例外をpassへ縮退させない。
 */
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { defaultHarnessDbPath, openHarnessDb } from "../state-db";
import { migrate, SCHEMA_VERSION } from "../state-db/migration";
import { createGuardOverrideAuditPort, guardOverrideDigest } from "./git-command-guard-hook";
import { commitOverrideUse } from "./guard-override-transaction";
import {
  evaluateWorkGuard,
  extractEditTargets,
  extractShellWriteTargets,
  resolveForeignEditOverride,
  type WorkGuardResult,
} from "./work-guard";
import { resolveHookExecutionCwd, resolveWorkGuardTargetState } from "./worktree-state";

export interface WorkGuardHookOutcome {
  exitCode: 0 | 2;
  message?: string;
}

/** agent-accessible override marker の本文 (=理由) を読む。 */
function readOverrideMarker(repoRoot: string): string | null {
  try {
    const marker = join(repoRoot, ".helix", "state", "foreign-edit-override");
    return existsSync(marker) ? readFileSync(marker, "utf8") : null;
  } catch {
    return null;
  }
}

/**
 * work-guard hook を 1 回評価する。rawInput は hook stdin の生テキスト。
 * 検証不能な入力・所属worktree・stateはexit 2とし、cleanとは推測しない。
 * tool_input は Claude (file_path) と Codex apply_patch (freeform patch 本文) で形が違うため
 * unknown で受け、extractEditTargets で両形を吸収する (PLAN-L7-139)。
 */
export function runWorkGuardHook(opts: {
  repoRoot: string;
  rawInput: string;
  env?: NodeJS.ProcessEnv;
}): WorkGuardHookOutcome {
  const env = opts.env ?? process.env;
  let input: { tool_input?: unknown; session_id?: string };
  if (!opts.rawInput.trim()) {
    return { exitCode: 2, message: "[helix-work-guard] BLOCK: empty hook input" };
  }
  try {
    input = JSON.parse(opts.rawInput || "{}");
  } catch {
    return { exitCode: 2, message: "[helix-work-guard] BLOCK: invalid hook input" };
  }
  try {
    // apply_patch は複数ファイルを 1 patch で編集しうる。全対象を評価し、1 つでも foreign なら block。
    const editTargets = extractEditTargets(input.tool_input);
    const command =
      input.tool_input && typeof input.tool_input === "object"
        ? String(
            (input.tool_input as Record<string, unknown>).command ??
              (input.tool_input as Record<string, unknown>).cmd ??
              "",
          )
        : "";
    const targets = (
      editTargets.length > 0 ? editTargets : extractShellWriteTargets(command)
    ).filter((t) => t.length > 0);
    if (targets.length === 0) return { exitCode: 0 };
    const override = resolveForeignEditOverride({
      env: env.HELIX_ALLOW_FOREIGN_EDIT,
      markerReason: readOverrideMarker(opts.repoRoot),
    });
    const states = targets.map((target) =>
      resolveWorkGuardTargetState({
        repoRoot: opts.repoRoot,
        executionCwd: resolveHookExecutionCwd(input.tool_input, opts.repoRoot),
        target,
        sessionId: input.session_id ?? "unknown",
      }),
    );
    const subject = JSON.stringify(states.map((state) => [state.repoRoot, state.targetPath]));
    let blocked: WorkGuardResult | null = null;
    for (const state of states) {
      const result = evaluateWorkGuard({
        targetPath: state.targetPath,
        uncommittedFiles: state.uncommittedFiles,
        sessionTouchedFiles: state.touchedFiles,
        bypass: false,
      });
      if (result.decision === "block") {
        blocked = result;
        break;
      }
    }
    if (!blocked) return { exitCode: 0 };
    if (override.source === "env") {
      const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
        repoRoot: opts.repoRoot,
        skipPersistentPragmas: true,
      });
      try {
        if (db.userVersion() < SCHEMA_VERSION) migrate(db);
        const transaction = commitOverrideUse({
          nonce: guardOverrideDigest(
            `env:foreign_edit:${input.session_id ?? "unknown"}:${guardOverrideDigest(subject)}`,
          ),
          reason: override.reason,
          classification: {
            guardKind: "foreign_edit",
            operationClass: "foreign uncommitted edit",
            subjectDigest: guardOverrideDigest(subject),
          },
          audit: createGuardOverrideAuditPort(db),
          marker: { consume: () => true },
        });
        if (transaction.status === "allowed") return { exitCode: 0 };
        return { exitCode: 2, message: `${blocked.message} override=${transaction.status}` };
      } finally {
        db.close();
      }
    }
    if (override.source !== "marker") return { exitCode: 2, message: blocked.message };
    const markerPath = join(opts.repoRoot, ".helix", "state", "foreign-edit-override");
    const markerStat = statSync(markerPath);
    const nonce = guardOverrideDigest(
      `${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:${override.reason}`,
    );
    const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
      repoRoot: opts.repoRoot,
      skipPersistentPragmas: true,
    });
    try {
      if (db.userVersion() < SCHEMA_VERSION) migrate(db);
      const transaction = commitOverrideUse({
        nonce,
        reason: override.reason,
        classification: {
          guardKind: "foreign_edit",
          operationClass: "foreign uncommitted edit",
          subjectDigest: guardOverrideDigest(subject),
        },
        audit: createGuardOverrideAuditPort(db),
        marker: {
          consume(expectedNonce) {
            const current = readFileSync(markerPath, "utf8");
            const currentStat = statSync(markerPath);
            const actual = guardOverrideDigest(
              `${currentStat.dev}:${currentStat.ino}:${currentStat.mtimeMs}:${current.trim()}`,
            );
            if (actual !== expectedNonce) return false;
            rmSync(markerPath);
            return !existsSync(markerPath);
          },
        },
      });
      if (transaction.status === "allowed") return { exitCode: 0 };
      return { exitCode: 2, message: `${blocked.message} override=${transaction.status}` };
    } finally {
      db.close();
    }
  } catch {
    return { exitCode: 2, message: "[helix-work-guard] BLOCK: guard transaction failed" };
  }
}
