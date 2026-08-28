import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import type { GitMutationContext } from "./git-command-guard";
import { normalizeRepoRelative } from "./work-guard";

function gitOutput(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

function samePhysicalDirectory(left: string, right: string): boolean {
  const leftReal = realpathSync(left);
  const rightReal = realpathSync(right);
  const leftStat = statSync(leftReal);
  const rightStat = statSync(rightReal);
  return (
    leftStat.isDirectory() &&
    rightStat.isDirectory() &&
    leftStat.dev === rightStat.dev &&
    leftStat.ino === rightStat.ino
  );
}

export function gitUncommittedFiles(repoRoot: string): string[] {
  const out = gitOutput(repoRoot, ["status", "--porcelain"]);
  const files: string[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const rest = line.slice(3).trim();
    const path = rest.includes(" -> ") ? rest.split(" -> ")[1] : rest;
    files.push(normalizeRepoRelative(path.replace(/^"|"$/g, ""), repoRoot));
  }
  return files;
}

export function sessionTouchedFiles(repoRoot: string, sessionId: string): string[] {
  const safe = sessionId.replace(/[\\/]+/g, "_");
  const file = join(repoRoot, ".helix", "logs", "session", `${safe}.jsonl`);
  if (!existsSync(file)) return [];
  const touched: string[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as { target?: string };
      if (event.target) touched.push(normalizeRepoRelative(event.target, repoRoot));
    } catch {
      // 壊れた行はtouch証拠に数えない。dirty pathはforeign側へ残るためfail-closeになる。
    }
  }
  return touched;
}

export function foreignUncommittedFiles(repoRoot: string, sessionId: string): string[] {
  const touched = new Set(sessionTouchedFiles(repoRoot, sessionId));
  return gitUncommittedFiles(repoRoot).filter((path) => !touched.has(path));
}

export function resolveHookExecutionCwd(toolInput: unknown, fallbackCwd: string): string {
  if (!toolInput || typeof toolInput !== "object" || Array.isArray(toolInput)) return fallbackCwd;
  const input = toolInput as Record<string, unknown>;
  for (const key of ["workdir", "cwd"]) {
    const value = input[key];
    if (typeof value !== "string" || !value.trim()) continue;
    return isAbsolute(value) ? value : resolve(fallbackCwd, value);
  }
  return fallbackCwd;
}

function resolveSingleGitMutationContext(opts: {
  repoRoot: string;
  executionCwd: string;
  sessionId: string;
}): GitMutationContext {
  try {
    gitOutput(opts.repoRoot, ["rev-parse", "--show-toplevel"]);
    const executionRoot = gitOutput(opts.executionCwd, ["rev-parse", "--show-toplevel"]).trim();
    const governedCommonDir = gitOutput(opts.repoRoot, [
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ]).trim();
    const executionCommonDir = gitOutput(opts.executionCwd, [
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ]).trim();
    if (!samePhysicalDirectory(governedCommonDir, executionCommonDir)) {
      return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
    }
    const worktrees = gitOutput(opts.executionCwd, ["worktree", "list", "--porcelain"]);
    const primaryLine = worktrees.split("\n").find((line) => line.startsWith("worktree "));
    const primaryRoot = primaryLine?.slice("worktree ".length).trim();
    if (!primaryRoot) {
      return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
    }
    if (!samePhysicalDirectory(executionRoot, primaryRoot)) {
      return { worktreeIdentity: "linked-worktree", foreignUncommittedCount: null };
    }
    return {
      worktreeIdentity: "shared-root",
      foreignUncommittedCount: foreignUncommittedFiles(primaryRoot, opts.sessionId).length,
    };
  } catch {
    return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
  }
}

export function resolveGitMutationContext(opts: {
  repoRoot: string;
  executionCwds: string[];
  sessionId: string;
}): GitMutationContext {
  if (opts.executionCwds.length === 0) {
    return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
  }
  const contexts = opts.executionCwds.map((executionCwd) =>
    resolveSingleGitMutationContext({
      repoRoot: opts.repoRoot,
      executionCwd,
      sessionId: opts.sessionId,
    }),
  );
  if (contexts.some((context) => context.worktreeIdentity === "unknown")) {
    return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
  }
  const shared = contexts.filter((context) => context.worktreeIdentity === "shared-root");
  if (shared.length > 0) {
    const counts = shared.map((context) => context.foreignUncommittedCount);
    if (counts.some((count) => count === null)) {
      return { worktreeIdentity: "unknown", foreignUncommittedCount: null };
    }
    return {
      worktreeIdentity: "shared-root",
      foreignUncommittedCount: Math.max(...(counts as number[])),
    };
  }
  return { worktreeIdentity: "linked-worktree", foreignUncommittedCount: null };
}
