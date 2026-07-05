import { describe, expect, it } from "vitest";
import { analyzeGithubMergeReadiness } from "../src/audit/github-merge-readiness";

describe("github merge readiness", () => {
  it("allows authenticated HELIX agents to proceed when local branch evidence is ready", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/github-readiness",
      headSha: "abc123",
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      ghInstalled: true,
      ghAuthenticated: true,
    });

    expect(result).toMatchObject({
      ok: true,
      localReady: true,
      canOpenPullRequest: true,
      externalPermissionBlocked: false,
    });
    expect(result.commands.createDraftPullRequest).toContain("gh pr create --draft");
  });

  it("keeps local readiness true when only GitHub authentication is missing", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/github-readiness",
      headSha: "abc123",
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      ghInstalled: true,
      ghAuthenticated: false,
    });

    expect(result).toMatchObject({
      ok: true,
      localReady: true,
      canOpenPullRequest: false,
      externalPermissionBlocked: true,
    });
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "gh_auth_required", severity: "info" }),
    );
  });

  it("blocks merge readiness for local evidence defects", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "main",
      headSha: "abc123",
      originUrl: null,
      worktreeClean: false,
      ahead: 0,
      behind: 1,
      ghInstalled: false,
      ghAuthenticated: false,
    });

    expect(result.localReady).toBe(false);
    expect(result.canOpenPullRequest).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "worktree_dirty",
        "on_base_branch",
        "base_not_ancestor",
        "no_branch_delta",
        "gh_missing",
      ]),
    );
  });
});
