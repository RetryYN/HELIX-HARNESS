/**
 * work-guard hook 実行本体 — dev repo hook (`.claude/hooks/work-guard.ts`) と consumer 配布経路の
 * `helix hook work-guard` (PLAN-L7-433 C1) が共有する orchestration runner。
 *
 * 判定純関数は work-guard.ts。ここは stdin JSON の解釈、git status / session log の収集、
 * override marker の one-shot 消費と audit を担う。方針は hook 側 docstring と同一:
 * 内部エラー (git 失敗 / parse 失敗 / state 不明) は **fail-open** (exit 0)、block は
 * 「衝突を確実に検知できた時」のみ。
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  evaluateWorkGuard,
  extractEditTargets,
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

/** marker 経由 override を durable log へ追記 (silent bypass を許さない = 証跡を残す)。 */
function auditOverride(
  repoRoot: string,
  entry: { target: string; reason: string; sessionId: string },
): void {
  try {
    const auditPath = join(repoRoot, ".helix", "logs", "foreign-edit-overrides.jsonl");
    mkdirSync(dirname(auditPath), { recursive: true });
    appendFileSync(auditPath, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`);
  } catch {
    // audit 失敗は override 自体を妨げない (fail-open)。
  }
}

/**
 * marker を one-shot 消費する (使用後に削除)。stale marker が以後の foreign edit を
 * 恒久バイパスし続けるのを防ぐ。次の foreign 編集には新しい理由 marker が要る。
 */
function consumeOverrideMarker(repoRoot: string): void {
  try {
    rmSync(join(repoRoot, ".helix", "state", "foreign-edit-override"), { force: true });
  } catch {
    // 削除失敗は block 判断に影響させない (fail-open)。audit は残る。
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
    return { exitCode: 0 };
  }
  try {
    // apply_patch は複数ファイルを 1 patch で編集しうる。全対象を評価し、1 つでも foreign なら block。
    const targets = extractEditTargets(input.tool_input)
      .map((t) => normalizeRepoRelative(t, opts.repoRoot))
      .filter((t) => t.length > 0);
    const override = resolveForeignEditOverride({
      env: env.HELIX_ALLOW_FOREIGN_EDIT,
      markerReason: readOverrideMarker(opts.repoRoot),
    });
    const uncommitted = gitUncommittedFiles(opts.repoRoot);
    const touched = sessionTouchedFiles(opts.repoRoot, input.session_id ?? "unknown");
    let blocked: WorkGuardResult | null = null;
    let wouldBlock = false;
    for (const target of targets) {
      if (
        evaluateWorkGuard({
          targetPath: target,
          uncommittedFiles: uncommitted,
          sessionTouchedFiles: touched,
          bypass: false,
        }).decision === "block"
      ) {
        wouldBlock = true;
      }
      const result = evaluateWorkGuard({
        targetPath: target,
        uncommittedFiles: uncommitted,
        sessionTouchedFiles: touched,
        bypass: override.bypass,
      });
      if (result.decision === "block") {
        blocked = result;
        break;
      }
    }
    if (override.source === "marker" && wouldBlock) {
      // agent-accessible override は silent にせず durable に audit する (証跡を残す)。
      auditOverride(opts.repoRoot, {
        target: targets.join(", "),
        reason: override.reason,
        sessionId: input.session_id ?? "unknown",
      });
      // 使用したら marker を消費 (one-shot)。残置による恒久バイパスを防ぐ。
      consumeOverrideMarker(opts.repoRoot);
    }
    if (blocked) {
      return { exitCode: 2, message: blocked.message };
    }
    return { exitCode: 0 };
  } catch {
    // git 不在 / 権限 / その他 I/O 失敗 → ガードを諦めて通す (作業を止めない)。
    return { exitCode: 0 };
  }
}
