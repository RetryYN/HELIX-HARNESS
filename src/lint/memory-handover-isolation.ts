import { execFileSync } from "node:child_process";

/**
 * memory-handover-isolation (PLAN-L7-459, L6-64 §6 MEMX-S6):
 * hybrid 運用の引き継ぎ基準点は commit/push 済み HEAD ただ一つ (CLAUDE.md)。
 * `.helix/memory/` を触るコミットがどの remote branch にも到達しないまま残ると、
 * 相手ランタイムへ memory 引き継ぎが届かない (2026-07-19 の孤立 18 コミット実インシデント)。
 * 本 lint はその孤立を機械検出する。git 情報が取れない場合は fail-close。
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
  /** remote branch に未到達な local コミットのうち `.helix/memory/` を触るもの */
  unreachedMemoryCommits: MemoryHandoverCommit[];
}

export interface MemoryHandoverIsolationResult {
  ok: boolean;
  /** 閾値超過で violation となった孤立コミット */
  isolated: MemoryHandoverCommit[];
  /** 閾値内の未 push コミット (violation にせず件数 surface のみ) */
  stale: MemoryHandoverCommit[];
}

export function loadMemoryHandoverIsolationInput(
  repoRoot: string = process.cwd(),
): MemoryHandoverIsolationInput {
  const gitLines = (args: string[]): string[] =>
    execFileSync("git", ["-C", repoRoot, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean);

  // どの remote branch にも含まれない local commit (全 local branch 起点)
  const unreached = gitLines(["log", "--branches", "--not", "--remotes", "--format=%H %ct %s"]);
  const commits: MemoryHandoverCommit[] = [];
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
    commits.push({
      hash,
      subject,
      committedAtEpochSeconds: Number(epoch),
      memoryPaths,
    });
  }
  return { unreachedMemoryCommits: commits };
}

export function analyzeMemoryHandoverIsolation(
  input: MemoryHandoverIsolationInput,
  options: { nowEpochSeconds: number; thresholdHours?: number },
): MemoryHandoverIsolationResult {
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
  return { ok: isolated.length === 0, isolated, stale };
}

export function memoryHandoverIsolationMessages(result: MemoryHandoverIsolationResult): string[] {
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
