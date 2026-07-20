import { describe, expect, it } from "vitest";

// PLAN-L7-462-issue-closure-contract
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

  it("ignores git-generated merge/revert subjects (PR 自走運用, PLAN-L7-418)", () => {
    // PR ベース運用では git 既定 subject の merge commit が正常に履歴へ入る。
    expect(
      analyzeCommitSubjects([
        "Merge remote-tracking branch 'origin/main' into codex/helix-l3-pillar-descent",
        "Merge pull request #2 from RetryYN/codex/helix-l3-pillar-descent",
        'Revert "feat(runtime): freeze event-first continuation"',
        "fix: close guard gap",
      ]).ok,
    ).toBe(true);
    // ignore は機械生成 subject に限る: 手書きの非規約 subject は引き続き block。
    expect(analyzeCommitSubjects(["Merged stuff manually"]).ok).toBe(false);
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

  it("U-ICLOSE-001: fails Issue-closing PRs closed when terminal closure evidence is incomplete", () => {
    const incomplete = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/issue-closure",
      baseBranch: "main",
      body: "## Related\nCloses #76\n",
    });
    expect(incomplete.ok).toBe(false);
    expect(incomplete.findings.map((finding) => finding.code)).toEqual([
      "issue_closure_outcome_missing",
      "issue_closure_receipt_missing",
      "issue_closure_children_missing",
    ]);
  });

  it.each(["resolved", "rejected", "quarantined"])(
    "accepts %s as a terminal Issue outcome with receipt and child disposition",
    (outcome) => {
      const decisionReceipt =
        outcome === "resolved" ? [] : [`Decision receipt: S4-${outcome}-receipt.json`];
      expect(
        analyzePrContext({
          eventName: "pull_request",
          headBranch: "feature/issue-closure",
          baseBranch: "main",
          body: [
            "Closes #76",
            `Outcome: ${outcome}`,
            "Closure receipt: PLAN-L7-462 / HEAD=abcdef123 / harness-check tests / cross-runtime review",
            "Child Issues: none",
            ...decisionReceipt,
          ].join("\n"),
        }).ok,
      ).toBe(true);
    },
  );

  it("requires PO decision evidence for cancelled or superseded closure", () => {
    const missingPo = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/issue-closure",
      baseBranch: "main",
      body: [
        "Closes #76",
        "Outcome: superseded",
        "Closure receipt: PLAN-L7-462 / HEAD=abcdef123 / tests / review",
        "Child Issues: #75 deferred",
      ].join("\n"),
    });
    expect(missingPo.findings).toContainEqual(
      expect.objectContaining({ code: "issue_closure_po_decision_missing" }),
    );

    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "feature/issue-closure",
        baseBranch: "main",
        body: [
          "Closes #76",
          "Outcome: cancelled",
          "Closure receipt: PLAN-L7-462 / HEAD=abcdef123 / CI tests / review",
          "Child Issues: none",
          "PO decision: issue comment with snapshot-bound cancellation decision",
        ].join("\n"),
      }).ok,
    ).toBe(true);
  });

  it("rejects template placeholders and requires terminal decision receipts", () => {
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/issue-closure",
      baseBranch: "main",
      body: [
        "Closes #76",
        "Outcome: rejected",
        "Closure receipt: PLAN-ID / HEAD=<SHA> / test・CI evidence / review evidence",
        "Child Issues: none",
      ].join("\n"),
    });
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "issue_closure_receipt_missing",
      "issue_closure_decision_receipt_missing",
    ]);
  });
});
