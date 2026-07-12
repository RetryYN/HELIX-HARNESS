/**
 * work-guard hook 実行本体 — dev repo hook (`.claude/hooks/work-guard.ts`) と consumer 配布経路の
 * `helix hook work-guard` (PLAN-L7-433 C1) が共有する orchestration runner。
 *
 * 判定純関数は work-guard.ts。ここは stdin JSON の解釈、git status / session log の収集、
 * override marker のone-shot消費とauditを担う。入力解析、git、state、transactionを検証できない場合は
 * fail-closeし、adapterが例外をpassへ縮退させない。
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { defaultHarnessDbPath, openHarnessDb } from "../state-db";
import { migrate } from "../state-db/migration";
import { createGuardOverrideAuditPort, guardOverrideDigest } from "./git-command-guard-hook";
import { commitOverrideUse } from "./guard-override-transaction";
import {
  evaluateWorkGuard,
  extractEditTargets,
  extractShellWriteTargets,
  normalizeRepoRelative,
  resolveForeignEditOverride,
  type WorkGuardResult,
} from "./work-guard";

export interface WorkGuardHookOutcome {
  exitCode: 0 | 2;
  message?: string;
}

function gitUncommittedFiles(repoRoot: string): string[] {
  // porcelain v1: "XY <path>" / rename "R  old -> new"。path 部のみを repo-relative で取る。
  const out = execFileSync("git", ["status", "--porcelain"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const files: string[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const rest = line.slice(3).trim();
    const path = rest.includes(" -> ") ? rest.split(" -> ")[1] : rest;
    files.push(normalizeRepoRelative(path.replace(/^"|"$/g, ""), repoRoot));
  }
  return files;
}

function sessionTouchedFiles(repoRoot: string, sessionId: string): string[] {
  const safe = sessionId.replace(/[\\/]+/g, "_");
  const file = join(repoRoot, ".helix", "logs", "session", `${safe}.jsonl`);
  if (!existsSync(file)) return [];
  const touched: string[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const ev = JSON.parse(line) as { target?: string };
      if (ev.target) touched.push(normalizeRepoRelative(ev.target, repoRoot));
    } catch {
      // 壊れ行は skip (fail-open)。
    }
  }
  return touched;
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
 * fail-open: 検証不能 (stdin/JSON/git/state) は exit 0。block は衝突を確証できた時のみ。
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
    const targets = (editTargets.length > 0 ? editTargets : extractShellWriteTargets(command))
      .map((t) => normalizeRepoRelative(t, opts.repoRoot))
      .filter((t) => t.length > 0);
    if (targets.length === 0) return { exitCode: 0 };
    const override = resolveForeignEditOverride({
      env: env.HELIX_ALLOW_FOREIGN_EDIT,
      markerReason: readOverrideMarker(opts.repoRoot),
    });
    const uncommitted = gitUncommittedFiles(opts.repoRoot);
    const touched = sessionTouchedFiles(opts.repoRoot, input.session_id ?? "unknown");
    let blocked: WorkGuardResult | null = null;
    for (const target of targets) {
      const result = evaluateWorkGuard({
        targetPath: target,
        uncommittedFiles: uncommitted,
        sessionTouchedFiles: touched,
        bypass: false,
      });
      if (result.decision === "block") {
        blocked = result;
        break;
      }
    }
    if (!blocked) return { exitCode: 0 };
    if (override.source === "env") {
      const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), { repoRoot: opts.repoRoot });
      try {
        migrate(db);
        const transaction = commitOverrideUse({
          nonce: guardOverrideDigest(
            `env:foreign_edit:${input.session_id ?? "unknown"}:${guardOverrideDigest(targets.join("\n"))}`,
          ),
          reason: override.reason,
          classification: {
            guardKind: "foreign_edit",
            operationClass: "foreign uncommitted edit",
            subjectDigest: guardOverrideDigest(targets.join("\n")),
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
    const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), { repoRoot: opts.repoRoot });
    try {
      migrate(db);
      const transaction = commitOverrideUse({
        nonce,
        reason: override.reason,
        classification: {
          guardKind: "foreign_edit",
          operationClass: "foreign uncommitted edit",
          subjectDigest: guardOverrideDigest(targets.join("\n")),
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
