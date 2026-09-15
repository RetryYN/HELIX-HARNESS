import { spawnSync } from "node:child_process";
import { join } from "node:path";

export const ISOLATED_WORKTREE_SCHEMA_VERSION = "isolated-worktree-sandbox-runner.v1";

export type IsolatedWorktreePlan = {
  schema_version: typeof ISOLATED_WORKTREE_SCHEMA_VERSION;
  ok: boolean;
  mode: "dry-run";
  base_ref: string;
  worktree_path: string;
  allowed_paths: string[];
  network_policy: "disabled" | "limited" | "approval_required";
  credential_policy: "no_credentials";
  rollback_command: string;
  cleanup_requires: {
    explicit_target_path: boolean;
    dry_run_evidence: boolean;
  };
  dirty_worktree: {
    status: "clean" | "dirty" | "unknown";
    allow_dirty: boolean;
    entries: string[];
  };
  warnings: string[];
  source_command: string;
};

export type BuildIsolatedWorktreePlanOptions = {
  repoRoot: string;
  baseRef?: string;
  worktreePath?: string;
  allowedPaths?: string[];
  networkPolicy?: "disabled" | "limited" | "approval_required";
  allowDirty?: boolean;
  gitStatusOutput?: string;
  sourceCommand?: string;
};

function readGitStatus(repoRoot: string): {
  status: "clean" | "dirty" | "unknown";
  entries: string[];
} {
  const run = spawnSync("git", ["status", "--porcelain"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (run.status !== 0) return { status: "unknown", entries: [] };
  const entries = run.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  return { status: entries.length > 0 ? "dirty" : "clean", entries };
}

export function buildIsolatedWorktreePlan(
  options: BuildIsolatedWorktreePlanOptions,
): IsolatedWorktreePlan {
  const baseRef = options.baseRef ?? "HEAD";
  const worktreePath =
    options.worktreePath ?? join(options.repoRoot, ".helix", "worktrees", "dry-run");
  const allowedPaths =
    options.allowedPaths && options.allowedPaths.length > 0
      ? [...new Set(options.allowedPaths)].sort()
      : ["docs/", "src/", "tests/"];
  const status =
    options.gitStatusOutput !== undefined
      ? {
          status:
            options.gitStatusOutput.trim().length > 0 ? ("dirty" as const) : ("clean" as const),
          entries: options.gitStatusOutput
            .split(/\r?\n/)
            .map((line) => line.trimEnd())
            .filter((line) => line.length > 0),
        }
      : readGitStatus(options.repoRoot);
  const warnings: string[] = [];
  if (status.status === "dirty") {
    warnings.push("main worktree is dirty; isolated run must not treat this as a clean baseline");
  }
  if (status.status === "unknown") {
    warnings.push("git status could not be read; isolated run must fail closed");
  }

  const ok =
    status.status === "clean" || (status.status === "dirty" && options.allowDirty === true);
  return {
    schema_version: ISOLATED_WORKTREE_SCHEMA_VERSION,
    ok,
    mode: "dry-run",
    base_ref: baseRef,
    worktree_path: worktreePath,
    allowed_paths: allowedPaths,
    network_policy: options.networkPolicy ?? "disabled",
    credential_policy: "no_credentials",
    rollback_command: `git worktree remove --force ${JSON.stringify(worktreePath)}`,
    cleanup_requires: {
      explicit_target_path: true,
      dry_run_evidence: true,
    },
    dirty_worktree: {
      status: status.status,
      allow_dirty: options.allowDirty === true,
      entries: status.entries,
    },
    warnings,
    source_command: options.sourceCommand ?? "helix run isolate --dry-run --json",
  };
}
