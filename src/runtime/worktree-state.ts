import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import type { GitMutationContext } from "./git-command-guard";
import {
  evaluateWorkGuard,
  normalizeRepoRelative,
  type WorkGuardTargetsResult,
} from "./work-guard";

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
  const out = gitOutput(repoRoot, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  if (!out) return [];
  if (!out.endsWith("\0")) throw new Error("Incomplete Git status path inventory");
  const records = out.slice(0, -1).split("\0");
  const files = new Set<string>();
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.length < 4 || record[2] !== " ") throw new Error("Invalid Git status record");
    // -zは引用escapeをせずrepo-relative pathを返す。trimやOS表記変換はidentityを損なう。
    files.add(record.slice(3));
    if (/[RC]/.test(record.slice(0, 2))) {
      // -zのrename/copyは移動先、移動元の順。両方が保護対象になる。
      const source = records[++i];
      if (!source) throw new Error("Missing Git status rename source");
      files.add(source);
    }
  }
  return [...files];
}

/** 旧sessionのtool名prefixはログ入力だけで解釈し、通常pathへ逆流させない。 */
export function normalizeSessionTarget(target: string, repoRoot: string): string {
  return normalizeRepoRelative(sessionTargetPath(target), repoRoot);
}

function sessionTargetPath(target: string): string {
  const legacy = /^(?:Write|Edit|MultiEdit|apply_patch|write_file) ([\s\S]+)$/.exec(target);
  return legacy ? legacy[1] : target;
}

export function sessionTouchedFiles(
  repoRoot: string,
  sessionId: string,
  targetRoot = repoRoot,
): string[] {
  const safe = sessionId.replace(/[\\/]+/g, "_");
  const file = join(repoRoot, ".helix", "logs", "session", `${safe}.jsonl`);
  if (!existsSync(file)) return [];
  const crossWorktree = !samePhysicalDirectory(repoRoot, targetRoot);
  const touched: string[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as { target?: string };
      if (typeof event.target !== "string") continue;
      const path = sessionTargetPath(event.target);
      // 共有側の相対pathだけでは別worktreeの対象を特定できない。
      if (crossWorktree && !isAbsolute(path)) continue;
      const normalized = normalizeRepoRelative(path, targetRoot);
      if (isAbsolute(normalized) || normalized.split(sep).includes("..")) continue;
      touched.push(normalized);
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
    return isAbsolute(value) ? value : `${fallbackCwd}${sep}${value}`;
  }
  return fallbackCwd;
}

/** 編集先の所属worktreeを検証し、そのworktreeだけの所有権入力を返す。 */
export function resolveWorkGuardTargetState(opts: {
  repoRoot: string;
  executionCwd: string;
  target: string;
  sessionId: string;
}): { repoRoot: string; targetPath: string; uncommittedFiles: string[]; touchedFiles: string[] } {
  if (opts.target.includes("\0")) throw new Error("Invalid target path");
  const executionCwd = realpathSync(opts.executionCwd);
  // resolveより前に成分を順に検査する。symlink/..を字句的に畳むと別対象を検査してしまう。
  const targetRoot = isAbsolute(opts.target) ? parse(opts.target).root : "";
  let rawComponent = targetRoot || executionCwd;
  const parts = opts.target.slice(targetRoot.length).split(sep === "\\" ? /[\\/]/ : /\//);
  for (const part of parts) {
    if (!part || part === ".") continue;
    rawComponent = join(rawComponent, part);
    try {
      if (lstatSync(rawComponent).isSymbolicLink()) throw new Error("Ambiguous target symlink");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const target = resolve(executionCwd, opts.target);
  let ancestor = dirname(target);
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) throw new Error("Unknown target ancestor");
    ancestor = parent;
  }
  const gitPath = (cwd: string, args: string[]) => gitOutput(cwd, args).replace(/\r?\n$/, "");
  const root = gitPath(ancestor, ["rev-parse", "--show-toplevel"]);
  const commonArgs = ["rev-parse", "--path-format=absolute", "--git-common-dir"];
  if (!samePhysicalDirectory(gitPath(opts.repoRoot, commonArgs), gitPath(root, commonArgs))) {
    throw new Error("Target repository differs from governed repository");
  }
  const targetPath = relative(root, target);
  if (
    !targetPath ||
    targetPath === ".." ||
    targetPath.startsWith(`..${sep}`) ||
    isAbsolute(targetPath)
  ) {
    throw new Error("Target is outside worktree");
  }
  let component = root;
  for (const part of targetPath.split(sep)) {
    component = join(component, part);
    try {
      if (lstatSync(component).isSymbolicLink()) throw new Error("Ambiguous target symlink");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return {
    repoRoot: realpathSync(root),
    targetPath: sep === "\\" ? targetPath.replace(/\\/g, "/") : targetPath,
    uncommittedFiles: gitUncommittedFiles(root),
    touchedFiles: [
      ...sessionTouchedFiles(root, opts.sessionId),
      ...(!samePhysicalDirectory(root, opts.repoRoot)
        ? sessionTouchedFiles(opts.repoRoot, opts.sessionId, root)
        : []),
    ],
  };
}

export function evaluateResolvedWorkGuardTargets(
  states: Array<ReturnType<typeof resolveWorkGuardTargetState>>,
  displayRoot: string,
  bypass = false,
): WorkGuardTargetsResult {
  const results = states.map((state) => {
    const targetPath = normalizeRepoRelative(join(state.repoRoot, state.targetPath), displayRoot);
    return {
      ...evaluateWorkGuard({
        targetPath,
        uncommittedFiles: state.uncommittedFiles.includes(state.targetPath) ? [targetPath] : [],
        sessionTouchedFiles: state.touchedFiles.includes(state.targetPath) ? [targetPath] : [],
        bypass,
      }),
      targetPath,
    };
  });
  const blocked = results.find((result) => result.decision === "block") ?? null;
  return {
    decision: blocked ? "block" : "pass",
    reason: blocked
      ? blocked.reason
      : results.length === 0
        ? "no-target"
        : bypass
          ? "bypass"
          : "clean-or-own",
    results,
    blocked,
  };
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
