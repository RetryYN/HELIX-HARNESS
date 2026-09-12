import { describe, expect, it } from "vitest";
import {
  type ClosureProbeGitObservation,
  evaluateClosureProbeExecutionContext,
} from "../src/runtime/closure-evidence-probe-context";

const head = "a".repeat(40);
const base = (overrides: Partial<ClosureProbeGitObservation> = {}): ClosureProbeGitObservation => ({
  repo_path: "/repo/worktree",
  top_level: "/repo/worktree",
  head_sha: head,
  branch: "recovery/1753",
  status_porcelain: "",
  git_dir: "/repo/common/worktrees/1753",
  git_common_dir: "/repo/common",
  worktree_porcelain: `worktree /repo/worktree\nHEAD ${head}\nbranch refs/heads/recovery/1753\n`,
  remote_url: "git@example.invalid:org/repo.git",
  remote_refs: `${head}\trefs/heads/recovery/1753`,
  ...overrides,
});

describe("closure evidence-probe execution context", () => {
  // PLAN-RECOVERY-1753-closure-probe-exact-head
  it("U-CLPROBE-001: clean worktreeとremote exact HEADだけをverifiedにする", () => {
    expect(evaluateClosureProbeExecutionContext(base())).toMatchObject({
      status: "verified",
      head_sha: head,
      clean: true,
      remote_ref_exact: true,
      blocked_reasons: [],
    });
  });

  it("U-CLPROBE-002: dirty/conflict/untrackedを実行前にfail-closeする", () => {
    const result = evaluateClosureProbeExecutionContext(
      base({ status_porcelain: "UU src/cli.ts\n?? foreign.tmp" }),
    );
    expect(result.status).toBe("blocked");
    expect(result.blocked_reasons).toContain("working_tree_dirty");
    expect(result.dirty_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-CLPROBE-003: HEAD driftまたはremote未到達をfail-closeする", () => {
    const result = evaluateClosureProbeExecutionContext(
      base({ remote_refs: `${"b".repeat(40)}\trefs/heads/recovery/1753` }),
    );
    expect(result).toMatchObject({ status: "blocked", remote_ref_exact: false });
    expect(result.blocked_reasons).toContain("remote_exact_head_absent");

    const otherBranch = evaluateClosureProbeExecutionContext(
      base({ remote_refs: `${head}\trefs/heads/recovery/other` }),
    );
    expect(otherBranch.status).toBe("blocked");
    expect(otherBranch.blocked_reasons).toContain("remote_exact_head_absent");
  });

  it("U-CLPROBE-004: 別worktree identityをfail-closeする", () => {
    const result = evaluateClosureProbeExecutionContext(
      base({ worktree_porcelain: `worktree /repo/other\nHEAD ${head}\ndetached\n` }),
    );
    expect(result.status).toBe("blocked");
    expect(result.blocked_reasons).toContain("worktree_identity_unresolved");
  });
});
