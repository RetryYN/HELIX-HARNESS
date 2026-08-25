import { describe, expect, it } from "vitest";
// PLAN-L7-475-issue-hierarchy-contract / U-IHIER-001
// PLAN-L7-556-issue-dependency-doctor / U-IHIER-002 / U-IHIER-003
// PLAN-L7-675-issue-dependency-cross-contract-audit / U-IHIER-012 / U-IHIER-013
import {
  auditIssueDependencies,
  auditIssueHierarchy,
  auditIssueHierarchyDependencyAlignment,
  collectIssueDependencyContracts,
  collectIssueHierarchyContracts,
  hasIssueDependencyContractBlock,
  type IssueHierarchyNode,
  parseIssueDependencyContract,
  parseIssueHierarchyContract,
  projectIssueDependencyMigrationCandidates,
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
  it("U-IHIER-012: hierarchy relationのdependency block欠落と集合差をfail-closeする", () => {
    const hierarchy = [
      node({ number: 204, role: "capability", parentIssue: 81, blocks: [228] }),
      node({ number: 228, role: "task", parentIssue: 204, blockedBy: [204, 206] }),
      node({ number: 206, role: "task", parentIssue: 204, blocks: [228] }),
    ];
    const report = auditIssueHierarchyDependencyAlignment(hierarchy, [
      { number: 204, state: "open", dependsOn: [], blocks: [], planId: null },
      { number: 228, state: "open", dependsOn: [], blocks: [], planId: null },
    ]);

    expect(report.ok).toBe(false);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          issueNumber: 206,
          code: "dependency_contract_missing_for_hierarchy_relation",
        }),
        expect.objectContaining({
          issueNumber: 228,
          code: "hierarchy_dependency_blocked_by_mismatch",
        }),
        expect.objectContaining({
          issueNumber: 204,
          code: "hierarchy_dependency_blocks_mismatch",
        }),
      ]),
    );

    const parentOnly = auditIssueHierarchyDependencyAlignment(
      [node({ number: 300, role: "task", parentIssue: 81 })],
      [],
    );
    expect(parentOnly).toMatchObject({ ok: true, findings: [] });
  });

  it("U-IHIER-013: hierarchy正本からdependency migration candidateを決定的に投影する", () => {
    const candidates = projectIssueDependencyMigrationCandidates(
      [
        node({ number: 10, blocks: [30, 20], blockedBy: [5] }),
        node({ number: 20 }),
        node({ number: 30, blockedBy: [10] }),
      ],
      [
        {
          number: 10,
          state: "open",
          dependsOn: [],
          blocks: [20],
          planId: null,
          planIds: ["PLAN-L7-1"],
        },
        { number: 30, state: "open", dependsOn: [10], blocks: [], planId: "PLAN-L7-2" },
      ],
    );

    expect(candidates).toEqual([
      {
        issueNumber: 10,
        action: "replace",
        dependsOn: [5],
        blocks: [20, 30],
        planId: null,
        planIds: ["PLAN-L7-1"],
      },
    ]);
  });

  it("live sourceからhierarchy contractだけをtyped projectionへ収集する", () => {
    const body = [
      "```yaml",
      "issue_role: task",
      "parent_issue: 204",
      "blocks: [228]",
      "blocked_by: [206]",
      "duplicate_search: completed",
      "disposition: active",
      "duplicate_of: null",
      "```",
    ].join("\n");
    expect(
      collectIssueHierarchyContracts([
        { number: 243, state: "open", body },
        { number: 244, state: "open", body: "legacy prose only" },
      ]),
    ).toEqual([
      expect.objectContaining({
        number: 243,
        state: "open",
        blocks: [228],
        blockedBy: [206],
      }),
    ]);
  });

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

  it("U-IHIER-008: parent Issueの複数atomic PLANを明示的なplan_ids集合で束縛する", () => {
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

    const missingPlan = auditIssueDependencies(
      [
        {
          number: 624,
          state: "open",
          dependsOn: [],
          blocks: [],
          planId: null,
          planIds: ["PLAN-L7-999-absent", "PLAN-L7-638-x"],
        },
      ],
      [{ planId: "PLAN-L7-638-x", githubIssueId: 624 }],
    );
    expect(missingPlan.ok).toBe(false);
    expect(missingPlan.findings).toContainEqual({
      issueNumber: 624,
      code: "issue_plan_missing",
      detail: "issue references absent plan PLAN-L7-999-absent",
    });

    const mismatchedPlan = auditIssueDependencies(
      [
        {
          number: 624,
          state: "open",
          dependsOn: [],
          blocks: [],
          planId: null,
          planIds: ["PLAN-L7-638-x"],
        },
      ],
      [{ planId: "PLAN-L7-638-x", githubIssueId: 625 }],
    );
    expect(mismatchedPlan.ok).toBe(false);
    expect(mismatchedPlan.findings).toContainEqual({
      issueNumber: 624,
      code: "issue_plan_binding_mismatch",
      detail: "PLAN-L7-638-x binds github_issue_id=625, not 624",
    });
  });

  it("U-IHIER-009: scalar plan_idとplan_idsの同時指定を拒否する", () => {
    expect(() =>
      parseIssueDependencyContract(
        `\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: PLAN-L7-1-one\nplan_ids: [PLAN-L7-2-two]\n\`\`\``,
      ),
    ).toThrow("issue_plan_scalar_and_set_conflict");
  });

  // PLAN-L7-666-issue-dependency-contract-attribution / U-IHIER-010
  it("U-IHIER-010: prose markerを無視し、不正な採用blockをIssue番号付きfindingへ投影する", () => {
    const proseOnly =
      "監査では helix-issue-dependency.v1 というmarkerを利用するが、このIssueは契約を採用しない。";
    expect(hasIssueDependencyContractBlock(proseOnly)).toBe(false);

    const malformed = `\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: [not-a-number]\nblocks: []\nplan_id: null\n\`\`\``;
    const valid = `\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: null\n\`\`\``;
    const collected = collectIssueDependencyContracts([
      { number: 980, state: "open", body: proseOnly },
      { number: 981, state: "open", body: malformed },
      { number: 982, state: "open", body: valid },
    ]);

    expect(collected.nodes).toEqual([
      { number: 982, state: "open", dependsOn: [], blocks: [], planId: null },
    ]);
    expect(collected.findings).toEqual([
      {
        issueNumber: 981,
        code: "issue_dependency_contract_invalid",
        detail: "issue dependency contract invalid: issue_relation_number_invalid",
      },
    ]);
  });

  // PLAN-L7-671-issue-dependency-detector-parser-shape / U-IHIER-011
  it("U-IHIER-011: parserが受理する空白形状をdetectorも同じ採用blockとして扱う", () => {
    const immediate = `\`\`\`yaml\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: null\n\`\`\``;
    const blankLine = `\`\`\`yaml\n\n# helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: null\n\`\`\``;
    const sameLine = `\`\`\`yaml # helix-issue-dependency.v1\ndepends_on: []\nblocks: []\nplan_id: null\n\`\`\``;

    for (const body of [immediate, blankLine, sameLine]) {
      expect(parseIssueDependencyContract(body)).toMatchObject({
        dependsOn: [],
        blocks: [],
        planId: null,
      });
      expect(hasIssueDependencyContractBlock(body)).toBe(true);
    }

    const malformedBlankLine = `\`\`\`yaml\n\n# helix-issue-dependency.v1\ndepends_on: [invalid]\nblocks: []\nplan_id: null\n\`\`\``;
    expect(
      collectIssueDependencyContracts([{ number: 1010, state: "open", body: malformedBlankLine }]),
    ).toMatchObject({
      nodes: [],
      findings: [
        {
          issueNumber: 1010,
          code: "issue_dependency_contract_invalid",
          detail: "issue dependency contract invalid: issue_relation_number_invalid",
        },
      ],
    });
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
