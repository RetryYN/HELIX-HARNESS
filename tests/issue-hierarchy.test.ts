import { describe, expect, it } from "vitest";
// PLAN-L7-475-issue-hierarchy-contract / U-IHIER-001
import {
  auditIssueHierarchy,
  type IssueHierarchyNode,
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
