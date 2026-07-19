import { execFileSync } from "node:child_process";

/**
 * memory-handover-isolation (PLAN-L7-459, L6-64 §6 MEMX-S6):
 * hybrid 運用の引き継ぎ基準点は commit/push 済み HEAD ただ一つ (CLAUDE.md)。
 * `.helix/memory/` を触るコミットがどの remote branch にも到達しないまま残ると、
 * 相手ランタイムへ memory 引き継ぎが届かない (2026-07-19 の孤立 18 コミット実インシデント)。
 *
 * 走査は全 local branch + HEAD (detached 含む) を対象にする。実インシデントは非 checkout
 * branch 上で起きたため HEAD 限定では検出できない。無関係 branch の巻き込み (rebase 済み
 * 等価コミット) は patch-id 等価判定で除外し、真に未到達な内容だけを報告する。
 * remote 未設定・git 情報取得不能は fail-close。
 */

export const MEMORY_HANDOVER_PATH_PREFIX = ".helix/memory/";
export const MEMORY_HANDOVER_STALE_THRESHOLD_HOURS = 24;

export interface MemoryHandoverCommit {
  hash: string;
  subject: string;
  committedAtEpochSeconds: number;
  memoryPaths: string[];
}

export interface MemoryHandoverIsolationInput {
  /** remote 未到達かつ patch-id 等価でも remote に無い `.helix/memory/` 変更コミット */
  unreachedMemoryCommits: MemoryHandoverCommit[];
  /** remote が 1 つも設定されていない (検証不能 → fail-close) */
  noRemote: boolean;
}

export interface MemoryHandoverIsolationResult {
  ok: boolean;
  /** remote 未設定で検証不能 (fail-close) */
  noRemote: boolean;
  /** 閾値超過で violation となった孤立コミット */
  isolated: MemoryHandoverCommit[];
  /** 閾値内の未 push コミット (violation にせず件数 surface のみ) */
  stale: MemoryHandoverCommit[];
}

function gitLinesFactory(repoRoot: string) {
  return (args: string[]): string[] =>
    execFileSync("git", ["-C", repoRoot, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean);
}

/** commit の patch-id (等価 diff 判定用)。空 diff (merge 等) は null。 */
function patchIdOf(repoRoot: string, hash: string): string | null {
  const patch = execFileSync("git", ["-C", repoRoot, "show", "--format=", hash], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (patch.trim() === "") return null;
  const out = execFileSync("git", ["-C", repoRoot, "patch-id", "--stable"], {
    encoding: "utf8",
    input: patch,
    stdio: ["pipe", "pipe", "ignore"],
  });
  return out.split(" ")[0] || null;
}

export function loadMemoryHandoverIsolationInput(
  repoRoot: string = process.cwd(),
): MemoryHandoverIsolationInput {
  const gitLines = gitLinesFactory(repoRoot);

  if (gitLines(["remote"]).length === 0) {
    return { unreachedMemoryCommits: [], noRemote: true };
  }

  // 全 local branch + HEAD (detached HEAD の取りこぼし防止) から remote 未到達 commit を列挙
  const unreached = gitLines([
    "log",
    "--branches",
    "HEAD",
    "--not",
    "--remotes",
    "--format=%H %ct %s",
  ]);
  const candidates: MemoryHandoverCommit[] = [];
  for (const line of unreached) {
    const match = line.match(/^([0-9a-f]{40}) (\d+) (.*)$/);
    if (!match) continue;
    const [, hash, epoch, subject] = match;
    const memoryPaths = gitLines([
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "-r",
      hash,
      "--",
      MEMORY_HANDOVER_PATH_PREFIX,
    ]);
    if (memoryPaths.length === 0) continue;
    candidates.push({
      hash,
      subject,
      committedAtEpochSeconds: Number(epoch),
      memoryPaths,
    });
  }
  if (candidates.length === 0) return { unreachedMemoryCommits: [], noRemote: false };

  // rebase/merge 済み等価コミットの除外: remote 側の `.helix/memory/` 変更 commit と patch-id 突合
  const remotePatchIds = new Set<string>();
  const remoteMemoryCommits = gitLines([
    "log",
    "--remotes",
    "--format=%H",
    "--",
    MEMORY_HANDOVER_PATH_PREFIX,
  ]);
  for (const hash of remoteMemoryCommits) {
    const id = patchIdOf(repoRoot, hash);
    if (id) remotePatchIds.add(id);
  }
  const unreachedMemoryCommits = candidates.filter((commit) => {
    const id = patchIdOf(repoRoot, commit.hash);
    return id === null || !remotePatchIds.has(id);
  });
  return { unreachedMemoryCommits, noRemote: false };
}

export function analyzeMemoryHandoverIsolation(
  input: MemoryHandoverIsolationInput,
  options: { nowEpochSeconds: number; thresholdHours?: number },
): MemoryHandoverIsolationResult {
  if (input.noRemote) {
    return { ok: false, noRemote: true, isolated: [], stale: [] };
  }
  const thresholdSeconds = (options.thresholdHours ?? MEMORY_HANDOVER_STALE_THRESHOLD_HOURS) * 3600;
  const isolated: MemoryHandoverCommit[] = [];
  const stale: MemoryHandoverCommit[] = [];
  for (const commit of input.unreachedMemoryCommits) {
    const age = options.nowEpochSeconds - commit.committedAtEpochSeconds;
    if (age > thresholdSeconds) {
      isolated.push(commit);
    } else {
      stale.push(commit);
    }
  }
  return { ok: isolated.length === 0, noRemote: false, isolated, stale };
}

export function memoryHandoverIsolationMessages(result: MemoryHandoverIsolationResult): string[] {
  if (result.noRemote) {
    return [
      "memory-handover-isolation - violation: remote が未設定のため引き継ぎ到達を検証できない (fail-close)",
    ];
  }
  if (result.ok && result.stale.length === 0) {
    return ["memory-handover-isolation - OK (remote 未到達の memory 引き継ぎコミット 0)"];
  }
  if (result.ok) {
    const sample = result.stale
      .slice(0, 3)
      .map((c) => `${c.hash.slice(0, 8)}:${c.subject}`)
      .join(", ");
    return [
      `memory-handover-isolation - OK (閾値内の未 push memory コミット ${result.stale.length} 件: ${sample}。push で相手ランタイムへ引き継がれるまで基準点にならない)`,
    ];
  }
  const sample = result.isolated
    .slice(0, 5)
    .map((c) => `${c.hash.slice(0, 8)}:${c.subject}`)
    .join(", ");
  return [
    `memory-handover-isolation - violation: remote 未到達の memory 引き継ぎコミットが閾値超過 ${result.isolated.length} 件 (閾値内 ${result.stale.length} 件): ${sample} → 相手ランタイムへ届いていない。branch を push し main へ収束させよ (基準点 = commit/push 済み HEAD)`,
  ];
}
