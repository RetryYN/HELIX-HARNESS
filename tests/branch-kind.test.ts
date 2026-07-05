import { describe, expect, it } from "vitest";
import { analyzeBranchKind, branchKindMessages, classifyBranchKind } from "../src/lint/branch-kind";
import { analyzeCommitSubjects, analyzePrContext } from "../src/lint/github-guards";

describe("branch-kind-check", () => {
  it("classifies governed branch prefixes", () => {
    expect(classifyBranchKind("feature/issue-spine")).toBe("feature");
    expect(classifyBranchKind("hotfix/recovery")).toBe("hotfix");
    expect(classifyBranchKind("main")).toBe("none");
  });

  it("hard-fails when a governed branch touches no PLAN", () => {
    const result = analyzeBranchKind({
      branch: "feature/issue-spine",
      changedPaths: ["src/cli.ts"],
      plans: [],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "missing_plan", severity: "error" }),
    );
  });

  it("hard-fails PLAN kind mismatch and warns missing github_issue_id", () => {
    const result = analyzeBranchKind({
      branch: "feature/issue-spine",
      changedPaths: ["docs/plans/PLAN-L7-121-branch-kind-check.md"],
      plans: [
        {
          file: "docs/plans/PLAN-L7-121-branch-kind-check.md",
          plan_id: "PLAN-L7-121",
          kind: "design",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "kind_mismatch", severity: "error" }),
    );
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "missing_github_issue_id", severity: "warn" }),
    );
  });

  it("allows feature impl PLAN and keeps missing issue as warning only", () => {
    const result = analyzeBranchKind({
      branch: "feature/issue-spine",
      changedPaths: ["docs/plans/PLAN-L7-121-branch-kind-check.md"],
      plans: [
        {
          file: "docs/plans/PLAN-L7-121-branch-kind-check.md",
          plan_id: "PLAN-L7-121",
          kind: "impl",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(branchKindMessages(result).join("\n")).toContain("warnings=1");
  });

  it("requires PLAN when docs/chore branches touch skill docs", () => {
    const result = analyzeBranchKind({
      branch: "docs/skill-update",
      changedPaths: ["docs/skills/review-checklist.md"],
      plans: [],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "skill_doc_plan_missing", severity: "error" }),
    );
  });

  it("keeps automation branches non-blocking but fails unknown prefixes in strict guard mode", () => {
    expect(
      analyzeBranchKind({
        branch: "codex/helix-l3-pillar-descent",
        changedPaths: [],
        plans: [],
        strictUnknownPrefix: true,
      }).ok,
    ).toBe(true);

    const result = analyzeBranchKind({
      branch: "unknown/work",
      changedPaths: [],
      plans: [],
      strictUnknownPrefix: true,
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "unknown_branch_prefix", severity: "error" }),
    );
  });

  it("checks conventional commit subjects", () => {
    expect(analyzeCommitSubjects(["fix: close guard gap"]).ok).toBe(true);

    const result = analyzeCommitSubjects(["close guard gap"]);
    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "non_conventional_subject", severity: "error" }),
    );
  });

  it("blocks poc direct-main PRs and requires hotfix postmortem evidence", () => {
    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "poc/demo",
        baseBranch: "main",
      }).ok,
    ).toBe(false);

    const hotfixBlocked = analyzePrContext({
      eventName: "pull_request",
      headBranch: "hotfix/recovery",
      baseBranch: "main",
      body: "fix production incident",
    });
    expect(hotfixBlocked.ok).toBe(false);
    expect(hotfixBlocked.findings.map((finding) => finding.code)).toEqual([
      "hotfix_postmortem_missing",
      "hotfix_recovery_plan_missing",
    ]);

    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "hotfix/recovery",
        baseBranch: "main",
        body: "## Postmortem\n\nRecovery evidence: PLAN-L7-999",
      }).ok,
    ).toBe(true);
  });
});
