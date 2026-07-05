import { describe, expect, it } from "vitest";
import {
  analyzeGithubCiStatus,
  analyzeGithubMergeReadiness,
  buildGithubPrBodyDraft,
} from "../src/audit/github-merge-readiness";

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

  it("drafts a Japanese-first PR body with local branch evidence", () => {
    const result = buildGithubPrBodyDraft({
      baseBranch: "main",
      headBranch: "feature/github-readiness",
      headSha: "abc123",
      templateText: "## 概要\n\n## 検証\n",
      commitSubjects: ["feat: add github readiness"],
      changedPaths: ["src/audit/github-merge-readiness.ts"],
    });

    expect(result).toMatchObject({
      schemaVersion: "helix-github-pr-body-draft.v1",
      title: "feat: add github readiness",
      baseBranch: "main",
      headBranch: "feature/github-readiness",
    });
    expect(result.markdown).toContain("## HELIX merge readiness");
    expect(result.markdown).toContain("PR 経由。main 直 merge ではない。");
    expect(result.markdown).toContain("`src/audit/github-merge-readiness.ts`");
  });

  it("separates unavailable CI status from red CI status", () => {
    const unavailable = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      ghInstalled: true,
      ghAuthenticated: false,
      runs: [],
    });
    expect(unavailable).toMatchObject({
      ok: false,
      status: "unavailable",
      externalPermissionBlocked: true,
    });

    const green = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "success",
          headSha: "abc123",
          url: "https://example.test/run",
        },
      ],
    });
    expect(green).toMatchObject({ ok: true, status: "green" });

    const red = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "failure",
          headSha: "abc123",
          url: "https://example.test/run",
        },
      ],
    });
    expect(red).toMatchObject({ ok: false, status: "red" });
  });
});
