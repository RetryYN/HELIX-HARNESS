import { describe, expect, it } from "vitest";
import { buildIsolatedWorktreePlan } from "../src/runtime/isolated-worktree-sandbox-runner";

describe("isolated worktree sandbox runner", () => {
  it("emits a clean dry-run packet without mutating a worktree", () => {
    const plan = buildIsolatedWorktreePlan({
      repoRoot: "/repo",
      gitStatusOutput: "",
      baseRef: "main",
      worktreePath: "/repo/.helix/worktrees/run-1",
      allowedPaths: ["src/", "tests/", "src/"],
    });

    expect(plan).toMatchObject({
      ok: true,
      mode: "dry-run",
      base_ref: "main",
      worktree_path: "/repo/.helix/worktrees/run-1",
      credential_policy: "no_credentials",
      cleanup_requires: {
        explicit_target_path: true,
        dry_run_evidence: true,
      },
    });
    expect(plan.allowed_paths).toEqual(["src/", "tests/"]);
  });

  it("fails closed on dirty main worktree by default", () => {
    const plan = buildIsolatedWorktreePlan({
      repoRoot: "/repo",
      gitStatusOutput: " M src/cli.ts\n?? scratch.txt\n",
    });

    expect(plan.ok).toBe(false);
    expect(plan.dirty_worktree).toMatchObject({
      status: "dirty",
      allow_dirty: false,
    });
    expect(plan.warnings).toContain(
      "main worktree is dirty; isolated run must not treat this as a clean baseline",
    );
  });

  it("can allow a dirty baseline only when the warning is recorded", () => {
    const plan = buildIsolatedWorktreePlan({
      repoRoot: "/repo",
      gitStatusOutput: "?? codex-env.txt\n",
      allowDirty: true,
      networkPolicy: "approval_required",
    });

    expect(plan.ok).toBe(true);
    expect(plan.network_policy).toBe("approval_required");
    expect(plan.dirty_worktree.allow_dirty).toBe(true);
    expect(plan.warnings.length).toBe(1);
  });
});
