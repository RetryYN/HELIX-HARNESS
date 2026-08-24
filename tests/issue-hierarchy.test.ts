import { describe, expect, it } from "vitest";
// PLAN-L7-475-issue-hierarchy-contract / U-IHIER-001
// PLAN-L7-556-issue-dependency-doctor / U-IHIER-002 / U-IHIER-003
import {
  auditIssueDependencies,
  auditIssueHierarchy,
  type IssueHierarchyNode,
  parseIssueDependencyContract,
  parseIssueHierarchyContract,
} from "../src/runtime/issue-hierarchy";

const node = (overrides: Partial<IssueHierarchyNode>): IssueHierarchyNode => ({
  number: 81,
  state: "open",
  role: "root",
  parentIssue: null,
  blocks: [],
  blockedBy: [],
  duplicateSearch: "completed",
  disposition: "active",
  duplicateOf: null,
  ...overrides,
});

describe("GitHub Issue dependency projection", () => {
  // PLAN-L7-556-issue-dependency-doctor / U-IHIER-002
  it("U-IHIER-002: open依存を残したclosed Issueをfail-closeする", () => {
    const report = auditIssueDependencies(
      [
        { number: 633, state: "open", dependsOn: [], blocks: [634], planId: null },
        { number: 634, state: "closed", dependsOn: [633], blocks: [], planId: null },
      ],
      [],
    );
    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.code)).toContain("closed_with_open_dependency");
    const inverseOnly = auditIssueDependencies(
      [
        { number: 633, state: "open", dependsOn: [], blocks: [634], planId: null },
        { number: 634, state: "open", dependsOn: [], blocks: [], planId: null },
      ],
      [],
    );
    expect(inverseOnly.ok).toBe(false);
    expect(inverseOnly.findings).toContainEqual({
      issueNumber: 633,
      code: "dependency_relation_not_symmetric",
      detail: "#633 blocks #634, but inverse depends_on is absent",
    });
  });

  // PLAN-L7-556-issue-dependency-doctor / U-IHIER-003
  it("U-IHIER-003: PLAN github_issue_idとIssue plan_idの双方向不整合を拒否する", () => {
    const report = auditIssueDependencies(
      [{ number: 634, state: "open", dependsOn: [], blocks: [], planId: "PLAN-L7-999" }],
      [{ planId: "PLAN-L7-634-issue-dependency", githubIssueId: 634 }],
    );
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["issue_plan_missing", "plan_issue_binding_mismatch"]),
    );
  });

  it("U-IHIER-005: PR focusは接続componentだけを監査し、無関係Issue driftを隔離する", () => {
    const report = auditIssueDependencies(
      [
        { number: 634, state: "open", dependsOn: [633], blocks: [], planId: "PLAN-L7-556" },
        { number: 633, state: "closed", dependsOn: [], blocks: [634], planId: null },
        { number: 900, state: "open", dependsOn: [901], blocks: [], planId: "PLAN-MISSING" },
        { number: 901, state: "open", dependsOn: [], blocks: [], planId: null },
      ],
      [{ planId: "PLAN-L7-556", githubIssueId: 634 }],
      { focusIssueNumbers: [634], requireReferencedPlans: false },
    );
    expect(report).toMatchObject({ ok: true, checkedIssues: 2, checkedPlans: 1 });
    expect(report.findings).toEqual([]);

    const full = auditIssueDependencies(
      [
        { number: 634, state: "open", dependsOn: [633], blocks: [], planId: "PLAN-L7-556" },
        { number: 633, state: "closed", dependsOn: [], blocks: [634], planId: null },
        { number: 900, state: "open", dependsOn: [901], blocks: [], planId: "PLAN-MISSING" },
        { number: 901, state: "open", dependsOn: [], blocks: [], planId: null },
      ],
      [{ planId: "PLAN-L7-556", githubIssueId: 634 }],
      { requireReferencedPlans: true },
    );
    expect(full.ok).toBe(false);
    expect(full.findings).toContainEqual({
      issueNumber: 900,
      code: "issue_plan_missing",
      detail: "issue references absent plan PLAN-MISSING",
    });
  });

  it("helix-issue-dependency.v1 blockをexact field orderでparseする", () => {
    expect(
      parseIssueDependencyContract(
        `dependency\n\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: [633]\nblocks: [635]\nplan_id: null\n\`\`\``,
      ),
    ).toEqual({ dependsOn: [633], blocks: [635], planId: null });
    expect(() => parseIssueDependencyContract("depends_on: []")).toThrow(
      "issue_dependency_contract_missing_or_invalid",
    );
  });

  it("U-IHIER-006: parent Issueの複数atomic PLANを明示的なplan_ids集合で束縛する", () => {
    expect(
      parseIssueDependencyContract(
        `dependency\n\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: null\nplan_ids: [PLAN-L7-639-luna-worker-model-registry, PLAN-L7-640-luna-native-spawn-admission]\n\`\`\``,
      ),
    ).toEqual({
      dependsOn: [],
      blocks: [],
      planId: null,
      planIds: [
        "PLAN-L7-639-luna-worker-model-registry",
        "PLAN-L7-640-luna-native-spawn-admission",
      ],
    });

    const report = auditIssueDependencies(
      [
        {
          number: 624,
          state: "open",
          dependsOn: [],
          blocks: [],
          planId: null,
          planIds: [
            "PLAN-L7-638-xhigh-reasoning-effort-schema",
            "PLAN-L7-639-luna-worker-model-registry",
          ],
        },
      ],
      [
        { planId: "PLAN-L7-638-xhigh-reasoning-effort-schema", githubIssueId: 624 },
        { planId: "PLAN-L7-639-luna-worker-model-registry", githubIssueId: 624 },
      ],
    );
    expect(report).toMatchObject({ ok: true, checkedIssues: 1, checkedPlans: 2 });
  });

  it("U-IHIER-007: scalar plan_idとplan_idsの同時指定を拒否する", () => {
    expect(() =>
      parseIssueDependencyContract(
        `\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: PLAN-L7-1-one\nplan_ids: [PLAN-L7-2-two]\n\`\`\``,
      ),
    ).toThrow("issue_plan_scalar_and_set_conflict");
  });
});

describe("GitHub Issue hierarchy contract", () => {
  it("U-IHIER-001: orphan・cycle・非対称依存を拒否し、非blocked leafだけをREADYにする", () => {
    const valid = auditIssueHierarchy([
      node({}),
      node({ number: 125, role: "capability", parentIssue: 81 }),
      node({ number: 151, role: "task", parentIssue: 125, blocks: [141] }),
      node({ number: 141, role: "finding", parentIssue: 125, blockedBy: [151] }),
      node({ number: 111, role: "finding", parentIssue: 125, state: "closed" }),
    ]);
    expect(valid).toMatchObject({ ok: true, readyLeafIssues: [151] });

    const invalid = auditIssueHierarchy([
      node({}),
      node({ number: 2, role: "task", parentIssue: null }),
      node({ number: 3, role: "task", parentIssue: 4, blocks: [81] }),
      node({ number: 4, role: "task", parentIssue: 3 }),
    ]);
    expect(invalid.ok).toBe(false);
    expect(invalid.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["orphan_issue", "parent_cycle", "relation_not_symmetric"]),
    );
  });

  it("Issue bodyの機械可読contractをexact field orderでparseする", () => {
    expect(
      parseIssueHierarchyContract(`## HELIX Issue hierarchy
\`\`\`yaml
issue_role: task
parent_issue: 125
blocks: [#141]
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
\`\`\``),
    ).toEqual({
      role: "task",
      parentIssue: 125,
      blocks: [141],
      blockedBy: [],
      duplicateSearch: "completed",
      disposition: "active",
      duplicateOf: null,
    });
    expect(() => parseIssueHierarchyContract("## no contract")).toThrow(
      "issue_hierarchy_contract_missing_or_invalid",
    );
  });
});
