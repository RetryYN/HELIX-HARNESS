import { describe, expect, it } from "vitest";

// PLAN-L7-462-issue-closure-contract
import {
  allowedPlanKindsForBranch,
  analyzeBranchKind,
  branchKindMessages,
  classifyBranchKind,
} from "../src/lint/branch-kind";
import { loadDriveRouteCatalog } from "../src/lint/drive-route-catalog";
import {
  analyzeCommitSubjects,
  analyzePrContext,
  parsePrContextSnapshot,
} from "../src/lint/github-guards";

describe("branch-kind-check", () => {
  it("feature branchは通常implとAdd-featureのadd-design/add-implを受理する", () => {
    const result = analyzeBranchKind({
      branch: "feature/issue-hierarchy-contract",
      changedPaths: ["docs/plans/PLAN-L6-80.md", "docs/plans/PLAN-L7-475.md"],
      plans: [
        {
          file: "docs/plans/PLAN-L6-80.md",
          plan_id: "PLAN-L6-80",
          kind: "add-design",
          github_issue_id: 164,
        },
        {
          file: "docs/plans/PLAN-L7-475.md",
          plan_id: "PLAN-L7-475",
          kind: "add-impl",
          github_issue_id: 164,
        },
      ],
    });
    expect(result.findings).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("classifies governed branch prefixes", () => {
    expect(classifyBranchKind("feature/issue-spine")).toBe("feature");
    expect(classifyBranchKind("hotfix/recovery")).toBe("hotfix");
    expect(classifyBranchKind("main")).toBe("none");
  });

  it("U-DRCAT-017: [PLAN-L7-482-drive-model-closure] catalogが宣言する全branch prefixをbranch admissionが認識する", () => {
    const catalog = loadDriveRouteCatalog(process.cwd()).catalog;
    const prefixes = [
      ...new Set(catalog?.routes.flatMap((route) => route.branch_prefixes) ?? []),
    ].sort();

    expect(prefixes).toEqual([
      "add/",
      "design/",
      "feature/",
      "hotfix/",
      "poc/",
      "recovery/",
      "refactor/",
      "research/",
      "retrofit/",
      "reverse/",
      "verify/",
      "version-up/",
    ]);
    for (const prefix of prefixes) {
      expect(classifyBranchKind(`${prefix}route-contract`)).not.toBe("none");
    }
  });

  it("U-DRCAT-018: [PLAN-L7-482-drive-model-closure] routeの全allowed kindが宣言branchのいずれかで受理可能である", () => {
    const catalog = loadDriveRouteCatalog(process.cwd()).catalog;
    for (const route of catalog?.routes ?? []) {
      for (const planKind of route.allowed_kinds) {
        expect(
          route.branch_prefixes.some((prefix) =>
            allowedPlanKindsForBranch(`${prefix}route-contract`).includes(planKind),
          ),
          `${route.route_id}:${planKind}`,
        ).toBe(true);
      }
    }
  });

  it.each([
    ["retrofit/dependency-migration", "retrofit"],
    ["recovery/current-location", "recovery"],
    ["version-up/future-capability", "add-design"],
    ["verify/runtime-scope", "impl"],
  ])("%s branchは対応PLAN kind %sを受理する", (branch, kind) => {
    const result = analyzeBranchKind({
      branch,
      changedPaths: ["docs/plans/PLAN-L7-999.md"],
      plans: [{ file: "docs/plans/PLAN-L7-999.md", kind, github_issue_id: 204 }],
      strictUnknownPrefix: true,
    });
    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
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

  it("U-ICGRAPH-008: read-after-GitHub graphが無い、または未完contractならcloseを拒否する", () => {
    const body = [
      "Closes #194",
      "Outcome: resolved",
      "Closure receipt: PLAN-L7-999 / HEAD=abcdef123 / CI tests / review",
      "Child Issues: #227 resolved",
    ].join("\n");
    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "fix/issue-closure-graph",
        baseBranch: "main",
        body,
        closureGraphRequired: true,
      }).findings,
    ).toContainEqual(expect.objectContaining({ code: "issue_closure_graph_missing" }));

    const incomplete = analyzePrContext({
      eventName: "pull_request",
      headBranch: "fix/issue-closure-graph",
      baseBranch: "main",
      body,
      closureGraphRequired: true,
      closureGraphSnapshots: [
        {
          parent_issue: { number: 194, state: "open" },
          contract: {
            schema_version: "helix-issue-closure-graph.v1",
            canonical_contracts: [{ contract_id: "WCC-FR-06", owner_issue: 227 }],
            child_issues: [{ number: 227, expected_state: "closed" }],
            successor_issues: [],
          },
          issues: [{ number: 227, state: "open" }],
          receipts: [],
          pull_requests: [],
        },
      ],
    });
    expect(incomplete.findings).toContainEqual(
      expect.objectContaining({
        code: "issue_closure_graph_invalid",
        message: expect.stringContaining("issue_closure_receipt_missing"),
      }),
    );

    const partialExactSet = analyzePrContext({
      eventName: "pull_request",
      headBranch: "fix/issue-closure-graph",
      baseBranch: "main",
      body: `${body}\nCloses #227`,
      closureGraphRequired: true,
      closureGraphSnapshots: [
        {
          parent_issue: { number: 194, state: "open" },
          contract: {
            schema_version: "helix-issue-closure-graph.v1",
            canonical_contracts: [{ contract_id: "WCC-FR-06", owner_issue: 227 }],
            child_issues: [{ number: 227, expected_state: "closed" }],
            successor_issues: [],
          },
          issues: [{ number: 227, state: "open" }],
          receipts: [],
          pull_requests: [],
        },
      ],
    });
    expect(partialExactSet.findings).toContainEqual(
      expect.objectContaining({
        code: "issue_closure_graph_missing",
        message: expect.stringContaining("issues=227"),
      }),
    );
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

  it("tolerates template inline HTML comments after Outcome / Child Issues values", () => {
    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "feature/issue-closure",
        baseBranch: "main",
        body: [
          "Closes #76",
          "- Outcome: resolved <!-- resolved / rejected / quarantined / superseded / cancelled -->",
          "- Closure receipt: PLAN-L7-462 / HEAD=abcdef123 / harness-check tests / cross-runtime review",
          "- Child Issues: none <!-- または #N resolved|deferred|split|superseded|cancelled -->",
        ].join("\n"),
      }).ok,
    ).toBe(true);
  });

  it("rejects template default not_required as a Decision receipt for rejected/quarantined", () => {
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/issue-closure",
      baseBranch: "main",
      body: [
        "Closes #76",
        "Outcome: rejected",
        "Closure receipt: PLAN-L7-462 / HEAD=abcdef123 / CI tests / review",
        "Child Issues: none",
        "Decision receipt: not_required <!-- rejected / quarantined の場合は終端decision evidence -->",
      ].join("\n"),
    });
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "issue_closure_decision_receipt_missing",
    ]);
  });

  it("U-PRSCOPE-001: accepts one atomic contract whose actual diff stays inside declared path families", () => {
    expect(
      analyzePrContext({
        eventName: "pull_request",
        headBranch: "feature/pr-scope",
        baseBranch: "main",
        changedPaths: [
          "docs/plans/PLAN-L7-466-pr-scope-contract.md",
          "docs/design/要件.md",
          "src/lint/github-guards.ts",
          "tests/branch-kind.test.ts",
        ],
        planContracts: [
          {
            path: "docs/plans/PLAN-L7-466-pr-scope-contract.md",
            behaviorContractId: "GH-AC-040",
            responsibilityOwner: "pr-scope-guard",
          },
        ],
        body: [
          "Behavior contract: GH-AC-040 <!-- exactly one -->",
          "Responsibility owner: pr-scope-guard <!-- kebab-case -->",
          "Allowed path families: docs/plans/PLAN-L7-466-pr-scope-contract.md, docs/design/要件.md, src/lint/github-guards.ts, tests/branch-kind.test.ts",
          "Expected changed paths: docs/plans/PLAN-L7-466-pr-scope-contract.md, docs/design/要件.md, src/lint/github-guards.ts, tests/branch-kind.test.ts",
          "Required companion paths: docs/plans/PLAN-L7-466-pr-scope-contract.md, tests/branch-kind.test.ts",
          "Scope expansion: none <!-- or approved receipt + reason -->",
        ].join("\n"),
      }).ok,
    ).toBe(true);
  });

  it("accepts the syntax of a reviewable GitHub comment receipt without claiming external approval", () => {
    expect(
      analyzePrContext({
        eventName: "pull_request",
        changedPaths: ["docs/plans/PLAN-L7-466-pr-scope-contract.md"],
        body: [
          "Behavior contract: GH-AC-040",
          "Responsibility owner: pr-scope-guard",
          "Allowed path families: docs/plans/PLAN-L7-466-pr-scope-contract.md",
          "Expected changed paths: docs/plans/PLAN-L7-466-pr-scope-contract.md",
          "Required companion paths: none",
          "Scope expansion: approved receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/1#issuecomment-2 reason=reviewer approved the exact additional path",
        ].join("\n"),
      }).ok,
    ).toBe(true);
  });

  it("U-PRSCOPE-002: rejects undeclared paths, duplicate contracts, and unsafe path patterns", () => {
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/pr-scope",
      baseBranch: "main",
      changedPaths: ["src/lint/github-guards.ts", "package.json"],
      body: [
        "Behavior contract: GH-AC-040",
        "Behavior contract: GH-AC-039",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: src/**, ../package.json, tests/",
        "Expected changed paths: src/lint/github-guards.ts, package.json",
        "Required companion paths: none",
        "Scope expansion: later",
      ].join("\n"),
    });
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "pr_scope_contract_invalid",
      "pr_scope_path_family_invalid",
      "pr_scope_source_companions_missing",
      "pr_scope_expansion_invalid",
    ]);

    const diagnostic = analyzePrContext({
      eventName: "pull_request",
      changedPaths: ["docs/design/current.md", "docs/test-design/current.md"],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: docs/design/, docs/test-design/",
        "Expected changed paths: docs/design/current.md, docs/old.md",
        "Required companion paths: none",
        "Scope expansion: none",
      ].join("\n"),
    });

    expect(diagnostic.ok).toBe(false);
    expect(diagnostic.findings).toContainEqual(
      expect.objectContaining({
        code: "pr_scope_changed_paths_mismatch",
        message: expect.stringContaining(
          "suggested Expected changed paths: docs/design/current.md, docs/test-design/current.md",
        ),
      }),
    );
    expect(diagnostic.findings[0]?.message).toContain(
      "reconcile both added and stale paths before rerunning CI",
    );

    const additionsOnly = analyzePrContext({
      eventName: "pull_request",
      changedPaths: ["docs/design/current.md", "docs/test-design/current.md"],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: docs/design/, docs/test-design/",
        "Expected changed paths: docs/design/current.md",
        "Required companion paths: none",
        "Scope expansion: none",
      ].join("\n"),
    });

    expect(additionsOnly.findings).toContainEqual(
      expect.objectContaining({
        code: "pr_scope_changed_paths_mismatch",
        message: expect.stringContaining("all actual paths are additions to the declaration"),
      }),
    );

    const staleOnly = analyzePrContext({
      eventName: "pull_request",
      changedPaths: ["docs/design/current.md"],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: docs/design/, docs/test-design/",
        "Expected changed paths: docs/design/current.md, docs/old.md",
        "Required companion paths: none",
        "Scope expansion: none",
      ].join("\n"),
    });

    expect(staleOnly.findings).toContainEqual(
      expect.objectContaining({
        code: "pr_scope_changed_paths_mismatch",
        message: expect.stringContaining("remove stale paths that are absent from the actual diff"),
      }),
    );
  });

  it("U-PRSCOPE-003: requires declared PLAN and test companions for source changes", () => {
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/pr-scope",
      baseBranch: "main",
      changedPaths: ["src/lint/github-guards.ts", "tests/branch-kind.test.ts"],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: src/lint/github-guards.ts, tests/branch-kind.test.ts",
        "Expected changed paths: src/lint/github-guards.ts, tests/branch-kind.test.ts",
        "Required companion paths: tests/missing.test.ts",
        "Scope expansion: none",
      ].join("\n"),
    });
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "pr_scope_companion_missing",
      "pr_scope_source_companions_missing",
    ]);
  });

  it("rejects file growth or phantom planned files outside the exact expected diff set", () => {
    const result = analyzePrContext({
      eventName: "pull_request",
      changedPaths: ["docs/plans/PLAN-L7-466-pr-scope-contract.md", "docs/extra.md"],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: docs/plans/PLAN-L7-466-pr-scope-contract.md, docs/extra.md",
        "Expected changed paths: docs/plans/PLAN-L7-466-pr-scope-contract.md, docs/phantom.md",
        "Required companion paths: none",
        "Scope expansion: none",
      ].join("\n"),
    });
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "pr_scope_changed_paths_mismatch",
    ]);
    expect(result.findings[0]?.message).toContain("undeclared=docs/extra.md");
    expect(result.findings[0]?.message).toContain("absent=docs/phantom.md");
    expect(result.findings[0]?.message).toContain(
      "suggested Expected changed paths: docs/extra.md, docs/plans/PLAN-L7-466-pr-scope-contract.md",
    );
  });

  it("U-PRSCOPE-005: rejects a PR manifest whose required PLAN binds a different behavior or owner", () => {
    const input = {
      eventName: "pull_request",
      headBranch: "feature/pr-scope",
      baseBranch: "main",
      changedPaths: [
        "docs/plans/PLAN-L7-466-pr-scope-contract.md",
        "src/lint/github-guards.ts",
        "tests/branch-kind.test.ts",
      ],
      planContracts: [
        {
          path: "docs/plans/PLAN-L7-466-pr-scope-contract.md",
          behaviorContractId: "U-PRSCOPE-001..005",
          responsibilityOwner: "src/lint/github-guards.ts",
        },
      ],
      body: [
        "Behavior contract: GH-AC-040",
        "Responsibility owner: pr-scope-guard",
        "Allowed path families: docs/plans/PLAN-L7-466-pr-scope-contract.md, src/lint/github-guards.ts, tests/branch-kind.test.ts",
        "Expected changed paths: docs/plans/PLAN-L7-466-pr-scope-contract.md, src/lint/github-guards.ts, tests/branch-kind.test.ts",
        "Required companion paths: docs/plans/PLAN-L7-466-pr-scope-contract.md, tests/branch-kind.test.ts",
        "Scope expansion: none",
      ].join("\n"),
    };
    const result = analyzePrContext(input);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "pr_scope_plan_contract_mismatch",
    ]);
    expect(
      analyzePrContext({ ...input, planContracts: [] }).findings.map((finding) => finding.code),
    ).toEqual(["pr_scope_plan_contract_missing"]);
  });

  it("U-PRSCOPE-006: [PLAN-L7-496-pr-context-current-snapshot] current PR snapshotをidentityとdigestへ束縛する", () => {
    const source = JSON.stringify({
      repository: "RetryYN/HELIX-HARNESS",
      number: 338,
      body: "Behavior contract: GH-AC-040",
      head_ref: "feature/pr-context-current-body-338",
      base_ref: "main",
      head_sha: "a".repeat(40),
      base_sha: "b".repeat(40),
    });
    const snapshot = parsePrContextSnapshot(source, {
      repository: "RetryYN/HELIX-HARNESS",
      prNumber: 338,
    });

    expect(snapshot).toMatchObject({
      body: "Behavior contract: GH-AC-040",
      headRef: "feature/pr-context-current-body-338",
      baseRef: "main",
      headSha: "a".repeat(40),
      baseSha: "b".repeat(40),
    });
    expect(snapshot.snapshotDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(
      parsePrContextSnapshot(source.replace("GH-AC-040", "GH-AC-041"), {
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 338,
      }).snapshotDigest,
    ).not.toBe(snapshot.snapshotDigest);
    expect(() =>
      parsePrContextSnapshot(source, {
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 337,
      }),
    ).toThrow("pr_context_snapshot_identity_mismatch");
    expect(() =>
      parsePrContextSnapshot(source.replace(`"${"a".repeat(40)}"`, '"stale"'), {
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 338,
      }),
    ).toThrow("pr_context_snapshot_schema_invalid");
    expect(() =>
      parsePrContextSnapshot("{", {
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 338,
      }),
    ).toThrow("pr_context_snapshot_json_invalid");
  });
});
