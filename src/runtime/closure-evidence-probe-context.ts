import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { parseWorktreePorcelain } from "./lane-hygiene";

const SHA = /^[a-f0-9]{40}$/;

export interface ClosureProbeGitObservation {
  repo_path: string;
  top_level: string;
  head_sha: string;
  branch: string | null;
  status_porcelain: string;
  git_dir: string;
  git_common_dir: string;
  worktree_porcelain: string;
  remote_url: string;
  remote_refs: string;
}

export interface ClosureProbeExecutionContext {
  schema_version: "closure-probe-execution-context.v1";
  status: "verified" | "blocked";
  repo_path: string;
  head_sha: string | null;
  branch: string | null;
  clean: boolean;
  dirty_digest: `sha256:${string}`;
  git_dir: string | null;
  git_common_dir: string | null;
  worktree_identity: string | null;
  remote_name: "origin" | null;
  remote_ref_exact: boolean;
  blocked_reasons: string[];
}

function digest(value: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function evaluateClosureProbeExecutionContext(
  observation: ClosureProbeGitObservation,
): ClosureProbeExecutionContext {
  const repoPath = resolve(observation.repo_path);
  const topLevel = resolve(observation.top_level);
  const head = SHA.test(observation.head_sha) ? observation.head_sha : null;
  const clean = observation.status_porcelain.length === 0;
  const worktrees = parseWorktreePorcelain(observation.worktree_porcelain);
  const matchingWorktrees = worktrees.filter(
    (row) => resolve(row.path) === repoPath && head !== null && row.head === head && !row.prunable,
  );
  const remoteRefExact =
    head !== null &&
    observation.remote_refs.split(/\r?\n/).some((line) => line.split(/\s+/, 1)[0] === head);
  const blockedReasons = [
    ...(topLevel === repoPath ? [] : ["repo_top_level_mismatch"]),
    ...(head === null ? ["head_unresolved"] : []),
    ...(clean ? [] : ["working_tree_dirty"]),
    ...(matchingWorktrees.length === 1 ? [] : ["worktree_identity_unresolved"]),
    ...(observation.git_dir && observation.git_common_dir ? [] : ["git_directory_unresolved"]),
    ...(observation.remote_url ? [] : ["origin_remote_unresolved"]),
    ...(remoteRefExact ? [] : ["remote_exact_head_absent"]),
  ];
  return {
    schema_version: "closure-probe-execution-context.v1",
    status: blockedReasons.length === 0 ? "verified" : "blocked",
    repo_path: repoPath,
    head_sha: head,
    branch: observation.branch,
    clean,
    dirty_digest: digest(observation.status_porcelain),
    git_dir: observation.git_dir || null,
    git_common_dir: observation.git_common_dir || null,
    worktree_identity: matchingWorktrees.length === 1 ? (matchingWorktrees[0]?.path ?? null) : null,
    remote_name: observation.remote_url ? "origin" : null,
    remote_ref_exact: remoteRefExact,
    blocked_reasons: blockedReasons,
  };
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

export function inspectClosureProbeExecutionContext(
  repoRoot: string,
): ClosureProbeExecutionContext {
  const physicalRoot = realpathSync(repoRoot);
  return evaluateClosureProbeExecutionContext({
    repo_path: physicalRoot,
    top_level: realpathSync(git(physicalRoot, ["rev-parse", "--show-toplevel"]).trim()),
    head_sha: git(physicalRoot, ["rev-parse", "HEAD"]).trim(),
    branch: git(physicalRoot, ["branch", "--show-current"]).trim() || null,
    status_porcelain: git(physicalRoot, ["status", "--porcelain=v1", "--untracked-files=all"]),
    git_dir: git(physicalRoot, ["rev-parse", "--path-format=absolute", "--git-dir"]).trim(),
    git_common_dir: git(physicalRoot, [
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ]).trim(),
    worktree_porcelain: git(physicalRoot, ["worktree", "list", "--porcelain"]),
    remote_url: git(physicalRoot, ["remote", "get-url", "origin"]).trim(),
    remote_refs: git(physicalRoot, ["-c", "credential.helper=", "ls-remote", "--refs", "origin"]),
  });
}
