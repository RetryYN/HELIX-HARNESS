import { describe, expect, it } from "vitest";
import {
  analyzeGithubCiStatus,
  analyzeGithubMergeReadiness,
  buildGithubPrBodyDraft,
  type GithubCiStatusResult,
  githubCiStatusExitCode,
  validateAtomicContractBody,
  verifyCreatedPrBody,
} from "../src/audit/github-merge-readiness";

// PLAN-RECOVERY-1659-ci-status-head-binding — U-GHCI-001..004

const EXPECTED_HEAD_SHA = "1111111111111111111111111111111111111111";
const OLD_HEAD_SHA = "2222222222222222222222222222222222222222";

// PLAN-L7-677-outstanding-snapshot-semantic-merge-guard: U-OUTMERGE-004

describe("github merge readiness", () => {
  it("allows authenticated HELIX agents to proceed when local branch evidence is ready", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/github-readiness",
      headSha: EXPECTED_HEAD_SHA,
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      ghInstalled: true,
      ghAuthenticated: true,
      viewerPermission: "WRITE",
    });

    expect(result).toMatchObject({
      ok: true,
      localReady: true,
      canOpenPullRequest: true,
      delegatedAuthRequired: false,
      externalPermissionBlocked: false,
      githubAccessState: "ready",
    });
    expect(result.commands.createDraftPullRequest).toContain("gh pr create --draft");
  });

  it("keeps local readiness true when only GitHub authentication is missing", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/github-readiness",
      headSha: EXPECTED_HEAD_SHA,
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      ghInstalled: true,
      ghAuthenticated: false,
      viewerPermission: null,
    });

    expect(result).toMatchObject({
      ok: true,
      localReady: true,
      canOpenPullRequest: false,
      delegatedAuthRequired: true,
      externalPermissionBlocked: false,
      githubAccessState: "delegated_auth_required",
    });
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "gh_auth_required", severity: "info" }),
    );
  });

  it("requires repository write permission before marking PR creation as available", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/github-readiness",
      headSha: EXPECTED_HEAD_SHA,
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      ghInstalled: true,
      ghAuthenticated: true,
      viewerPermission: "READ",
    });

    expect(result).toMatchObject({
      ok: true,
      localReady: true,
      canOpenPullRequest: false,
      delegatedAuthRequired: false,
      externalPermissionBlocked: true,
      githubAccessState: "repo_write_permission_required",
      viewerPermission: "READ",
    });
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "repo_write_permission_required", severity: "info" }),
    );
  });

  it("blocks merge readiness for local evidence defects", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "main",
      headSha: EXPECTED_HEAD_SHA,
      originUrl: null,
      worktreeClean: false,
      ahead: 0,
      behind: 1,
      ghInstalled: false,
      ghAuthenticated: false,
      viewerPermission: null,
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

  it("U-OUTMERGE-004: snapshot semantic driftはpush/PR作成前にfail-closeする", () => {
    const result = analyzeGithubMergeReadiness({
      baseBranch: "main",
      currentBranch: "feature/snapshot-guard",
      headSha: EXPECTED_HEAD_SHA,
      originUrl: "git@github.com:RetryYN/HELIX-HARNESS.git",
      worktreeClean: true,
      ahead: 2,
      behind: 0,
      outstandingSnapshotViolations: [
        "G-10: outstanding snapshot decision_count must equal plan_ids.length (actual=30/31)",
      ],
      ghInstalled: true,
      ghAuthenticated: true,
      viewerPermission: "WRITE",
    });

    expect(result.localReady).toBe(false);
    expect(result.canOpenPullRequest).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "outstanding_snapshot_semantic_drift",
        severity: "error",
      }),
    );
    expect(result.commands.repairOutstandingSnapshot).toBe("helix db rebuild");
    expect(
      result.findings.find((finding) => finding.code === "outstanding_snapshot_semantic_drift")
        ?.message,
    ).toContain("helix db rebuild");
  });

  // PLAN-L7-473-claude-pr-convergence / U-CPRCONV-003
  it("U-CPRCONV-003: drafts a Japanese-first PR body with local branch evidence", () => {
    const result = buildGithubPrBodyDraft({
      baseBranch: "main",
      headBranch: "feature/github-readiness",
      headSha: EXPECTED_HEAD_SHA,
      templateText: "## 概要\n\n## 検証\n",
      commitSubjects: ["feat: add github readiness"],
      changedPaths: ["src/audit/github-merge-readiness.ts"],
      atomicScope: {
        behaviorContract: "U-CPRCONV-001",
        responsibilityOwner: "claude-pr-convergence",
        requiredCompanionPaths: ["docs/plans/PLAN-L7-473-claude-pr-convergence.md"],
      },
    });

    expect(result).toMatchObject({
      schemaVersion: "helix-github-pr-body-draft.v1",
      title: "feat: add github readiness",
      baseBranch: "main",
      headBranch: "feature/github-readiness",
    });
    expect(result.markdown).toContain("## HELIX マージ準備状況");
    expect(result.markdown).toContain("PR 経由。main 直 merge ではない。");
    expect(result.markdown).toContain("`src/audit/github-merge-readiness.ts`");
    expect(result.markdown).toContain("Behavior contract: U-CPRCONV-001");
    expect(result.markdown).toContain("Responsibility owner: claude-pr-convergence");
  });

  // Issue #381: pr-create --applyはplaceholder残存・exact set不一致をfail-closeする。
  it("U-PRCREATE-381-001: 原子契約が完成したPR bodyだけを合格させる", () => {
    const changed = ["docs/plans/PLAN-X.md", "src/a.ts", "tests/a.test.ts"];
    const body = [
      "## 関連 PLAN / Issue",
      "Refs #93",
      "",
      "## 原子契約scope",
      "Behavior contract: GH-AC-040",
      "Responsibility owner: impact-ci-recovery",
      `Allowed path families: ${changed.join(", ")}`,
      `Expected changed paths: ${changed.join(", ")}`,
      "Required companion paths: docs/plans/PLAN-X.md, tests/a.test.ts",
      "Scope expansion: none",
    ].join("\n");
    expect(validateAtomicContractBody(body, changed)).toEqual([]);
  });

  it.each([
    [
      "placeholder残存",
      (body: string) =>
        body.replace(
          "Behavior contract: GH-AC-040",
          "Behavior contract: <!-- 1件だけ。例 GH-AC-040 -->",
        ),
      "Behavior contract",
    ],
    [
      "空フィールド",
      (body: string) =>
        body.replace("Responsibility owner: impact-ci-recovery", "Responsibility owner: "),
      "Responsibility owner",
    ],
    [
      "契約行欠落",
      (body: string) => body.replace(/^Expected changed paths:.*$\n/m, ""),
      "Expected changed paths",
    ],
    ["issue番号placeholder", (body: string) => body.replace("Refs #93", "Closes #"), "Closes #"],
  ])("U-PRCREATE-381-002: %s をfail-closeする", (_label, mutate, subject) => {
    const changed = ["docs/plans/PLAN-X.md", "src/a.ts", "tests/a.test.ts"];
    const body = [
      "## 関連 PLAN / Issue",
      "Refs #93",
      "",
      "## 原子契約scope",
      "Behavior contract: GH-AC-040",
      "Responsibility owner: impact-ci-recovery",
      `Allowed path families: ${changed.join(", ")}`,
      `Expected changed paths: ${changed.join(", ")}`,
      "Required companion paths: docs/plans/PLAN-X.md, tests/a.test.ts",
      "Scope expansion: none",
    ].join("\n");
    const violations = validateAtomicContractBody(mutate(body), changed);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.join("\n")).toContain(subject);
  });

  it("U-PRCREATE-381-003: Expected changed pathsのexact set不一致をfail-closeする", () => {
    const changed = ["docs/plans/PLAN-X.md", "src/a.ts", "tests/a.test.ts"];
    const body = [
      "Behavior contract: GH-AC-040",
      "Responsibility owner: impact-ci-recovery",
      "Allowed path families: src/a.ts",
      "Expected changed paths: src/a.ts, tests/a.test.ts",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    const violations = validateAtomicContractBody(body, changed);
    expect(violations.join("\n")).toContain("Expected changed paths");
    // 順序違いは不一致にしない (canonical sort 比較)。
    const reordered = body.replace(
      "Expected changed paths: src/a.ts, tests/a.test.ts",
      "Expected changed paths: tests/a.test.ts, docs/plans/PLAN-X.md, src/a.ts",
    );
    expect(validateAtomicContractBody(reordered, changed)).toEqual([]);
  });

  it("U-PRCREATE-381-004: 重複契約行をfail-closeする", () => {
    const changed = ["src/a.ts"];
    const body = [
      "Behavior contract: GH-AC-040",
      "Behavior contract: GH-AC-041",
      "Responsibility owner: impact-ci-recovery",
      "Allowed path families: src/a.ts",
      "Expected changed paths: src/a.ts",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    const violations = validateAtomicContractBody(body, changed);
    expect(violations.join("\n")).toContain(
      "Behavior contract: contract line appears more than once",
    );
  });

  it("U-PRCREATE-381-005: read-after-GitHub検証は読み戻し不能とdriftをok=false系へ分類する", () => {
    const changed = ["src/a.ts"];
    const goodBody = [
      "Behavior contract: GH-AC-040",
      "Responsibility owner: impact-ci-recovery",
      "Allowed path families: src/a.ts",
      "Expected changed paths: src/a.ts",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    expect(verifyCreatedPrBody({ status: 0, stdout: goodBody }, changed)).toBeUndefined();
    expect(verifyCreatedPrBody({ status: 1, stdout: "" }, changed)).toContain(
      "pr_body_contract_unverified",
    );
    const drifted = goodBody.replace(
      "Behavior contract: GH-AC-040",
      "Behavior contract: <!-- placeholder -->",
    );
    expect(verifyCreatedPrBody({ status: 0, stdout: drifted }, changed)).toContain(
      "pr_body_contract_drift_after_create",
    );
  });

  it("separates unavailable CI status from red CI status", () => {
    const unavailable = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: false,
      runs: [],
    });
    expect(unavailable).toMatchObject({
      ok: false,
      status: "unavailable",
      delegatedAuthRequired: true,
      externalPermissionBlocked: false,
      githubAccessState: "delegated_auth_required",
    });

    const green = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "success",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/run",
        },
      ],
    });
    expect(green).toMatchObject({
      ok: true,
      status: "green",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
    });
    expect(green.commands.listRuns).toContain("--workflow harness-check");

    const red = analyzeGithubCiStatus({
      ref: "feature/github-readiness",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "failure",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/run",
        },
      ],
    });
    expect(red).toMatchObject({ ok: false, status: "red" });
  });

  it("does not treat an empty successful query as green", () => {
    const result = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [],
    });

    expect(result).toMatchObject({ ok: false, status: "no_runs" });
  });

  it.each([
    "abc123",
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "111111111111111111111111111111111111111",
    "1111111111111111111111111111111111111111 ",
  ])("rejects non-canonical expected HEAD SHA %s", (expectedHeadSha) => {
    const result = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [],
    });

    expect(result).toMatchObject({ ok: false, status: "unavailable" });
    expect(result.queryError).toContain("full lowercase 40-hex SHA");
  });

  it("U-GHCI-001: ignores old HEAD success when the expected HEAD has no run", () => {
    const result = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "success",
          headSha: OLD_HEAD_SHA,
          url: "https://example.test/old",
        },
      ],
    });

    expect(result).toMatchObject({ ok: false, status: "window_miss", runs: [] });
  });

  it("U-GHCI-002: ignores old HEAD failure when the expected HEAD succeeds", () => {
    const result = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "failure",
          headSha: OLD_HEAD_SHA,
          url: "https://example.test/old",
        },
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "success",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/current",
        },
      ],
    });

    expect(result).toMatchObject({ ok: true, status: "green" });
    expect(result.runs).toHaveLength(1);
    expect(result.runs[0]?.headSha).toBe(EXPECTED_HEAD_SHA);
  });

  it("U-GHCI-003: ignores another workflow failure for the expected HEAD", () => {
    const result = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "CodeQL",
          workflowName: "CodeQL",
          status: "completed",
          conclusion: "failure",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/codeql",
        },
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "success",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/harness",
        },
      ],
    });

    expect(result).toMatchObject({ ok: true, status: "green" });
    expect(result.runs.map((run) => run.workflowName)).toEqual(["harness-check"]);
  });

  it("U-GHCI-004: distinguishes a window omission from a real current-head failure", () => {
    const windowMiss = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check.yml",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "failure",
          headSha: OLD_HEAD_SHA,
          url: "https://example.test/old",
        },
      ],
    });
    const currentFailure = analyzeGithubCiStatus({
      ref: "main",
      expectedHeadSha: EXPECTED_HEAD_SHA,
      targetWorkflow: "harness-check.yml",
      ghInstalled: true,
      ghAuthenticated: true,
      runs: [
        {
          name: "harness-check",
          workflowName: "harness-check",
          status: "completed",
          conclusion: "failure",
          headSha: EXPECTED_HEAD_SHA,
          url: "https://example.test/current",
        },
      ],
    });

    expect(windowMiss).toMatchObject({ ok: false, status: "window_miss" });
    expect(currentFailure).toMatchObject({ ok: false, status: "red" });
  });

  it.each(["no_runs", "window_miss", "unavailable", "red"] as const)(
    "U-GHCI-005: maps non-green status %s to a failing CLI exit",
    (status) => {
      expect(githubCiStatusExitCode({ ok: false, status } as GithubCiStatusResult)).toBe(1);
    },
  );

  it("U-GHCI-006: maps only an admitted green status to a successful CLI exit", () => {
    expect(githubCiStatusExitCode({ ok: true, status: "green" } as GithubCiStatusResult)).toBe(0);
    expect(githubCiStatusExitCode({ ok: false, status: "green" } as GithubCiStatusResult)).toBe(1);
  });
});
