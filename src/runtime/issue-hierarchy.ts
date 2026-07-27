export const ISSUE_HIERARCHY_SCHEMA = "helix-github-issue-hierarchy.v1" as const;

export type IssueRole = "root" | "capability" | "task" | "finding";
export type IssueDisposition = "active" | "parked" | "duplicate" | "superseded";

export interface IssueHierarchyNode {
  number: number;
  state: "open" | "closed";
  role: IssueRole;
  parentIssue: number | null;
  blocks: number[];
  blockedBy: number[];
  duplicateSearch: "completed";
  disposition: IssueDisposition;
  duplicateOf: number | null;
}

export interface IssueHierarchyFinding {
  issueNumber: number;
  code:
    | "duplicate_issue_number"
    | "root_has_parent"
    | "orphan_issue"
    | "parent_missing"
    | "parent_cycle"
    | "hierarchy_depth_exceeded"
    | "child_limit_exceeded"
    | "relation_target_missing"
    | "relation_not_symmetric"
    | "duplicate_target_invalid"
    | "duplicate_disposition_invalid";
  detail: string;
}

export interface IssueHierarchyReport {
  schemaVersion: typeof ISSUE_HIERARCHY_SCHEMA;
  ok: boolean;
  findings: IssueHierarchyFinding[];
  readyLeafIssues: number[];
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

function isPositiveIssueNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function parseIssueHierarchyContract(
  body: string,
): Omit<IssueHierarchyNode, "number" | "state"> {
  const block = body.match(
    /```yaml\s+issue_role:\s*(root|capability|task|finding)\s+parent_issue:\s*(null|\d+)\s+blocks:\s*\[([^\]]*)\]\s+blocked_by:\s*\[([^\]]*)\]\s+duplicate_search:\s*(completed)\s+disposition:\s*(active|parked|duplicate|superseded)\s+duplicate_of:\s*(null|\d+)\s*```/m,
  );
  if (!block) throw new Error("issue_hierarchy_contract_missing_or_invalid");
  const numbers = (raw: string): number[] =>
    raw.trim() === ""
      ? []
      : uniqueNumbers(
          raw.split(",").map((item) => {
            const value = Number(item.trim().replace(/^#/, ""));
            if (!isPositiveIssueNumber(value)) throw new Error("issue_relation_number_invalid");
            return value;
          }),
        );
  return {
    role: block[1] as IssueRole,
    parentIssue: block[2] === "null" ? null : Number(block[2]),
    blocks: numbers(block[3] ?? ""),
    blockedBy: numbers(block[4] ?? ""),
    duplicateSearch: "completed",
    disposition: block[6] as IssueDisposition,
    duplicateOf: block[7] === "null" ? null : Number(block[7]),
  };
}

export function auditIssueHierarchy(nodes: IssueHierarchyNode[]): IssueHierarchyReport {
  const findings: IssueHierarchyFinding[] = [];
  const byNumber = new Map<number, IssueHierarchyNode>();
  for (const node of nodes) {
    if (byNumber.has(node.number)) {
      findings.push({
        issueNumber: node.number,
        code: "duplicate_issue_number",
        detail: `issue #${node.number} appears more than once`,
      });
    } else {
      byNumber.set(node.number, node);
    }
  }

  const children = new Map<number, number[]>();
  for (const node of byNumber.values()) {
    if (node.role === "root" && node.parentIssue !== null) {
      findings.push({
        issueNumber: node.number,
        code: "root_has_parent",
        detail: `root #${node.number} must not have a parent`,
      });
    }
    if (node.role !== "root" && node.parentIssue === null) {
      findings.push({
        issueNumber: node.number,
        code: "orphan_issue",
        detail: `${node.role} #${node.number} requires parent_issue`,
      });
    }
    if (node.parentIssue !== null) {
      if (!byNumber.has(node.parentIssue)) {
        findings.push({
          issueNumber: node.number,
          code: "parent_missing",
          detail: `parent #${node.parentIssue} is absent`,
        });
      }
      children.set(node.parentIssue, [...(children.get(node.parentIssue) ?? []), node.number]);
    }
    for (const target of uniqueNumbers([...node.blocks, ...node.blockedBy])) {
      if (!byNumber.has(target)) {
        findings.push({
          issueNumber: node.number,
          code: "relation_target_missing",
          detail: `relation target #${target} is absent`,
        });
      }
    }
    for (const target of node.blocks) {
      if (byNumber.has(target) && !byNumber.get(target)?.blockedBy.includes(node.number)) {
        findings.push({
          issueNumber: node.number,
          code: "relation_not_symmetric",
          detail: `#${node.number} blocks #${target}, but inverse blocked_by is absent`,
        });
      }
    }
    for (const target of node.blockedBy) {
      if (byNumber.has(target) && !byNumber.get(target)?.blocks.includes(node.number)) {
        findings.push({
          issueNumber: node.number,
          code: "relation_not_symmetric",
          detail: `#${node.number} is blocked by #${target}, but inverse blocks is absent`,
        });
      }
    }
    if (node.disposition === "duplicate") {
      if (
        node.duplicateOf === null ||
        node.duplicateOf === node.number ||
        !byNumber.has(node.duplicateOf)
      ) {
        findings.push({
          issueNumber: node.number,
          code: "duplicate_target_invalid",
          detail: "duplicate disposition requires an existing different duplicate_of target",
        });
      }
    } else if (node.duplicateOf !== null) {
      findings.push({
        issueNumber: node.number,
        code: "duplicate_disposition_invalid",
        detail: "duplicate_of is allowed only when disposition=duplicate",
      });
    }
  }

  for (const [parent, values] of children) {
    if (values.length > 100) {
      findings.push({
        issueNumber: parent,
        code: "child_limit_exceeded",
        detail: `parent has ${values.length} children; maximum is 100`,
      });
    }
  }

  for (const node of byNumber.values()) {
    const visited = new Set<number>();
    let current: IssueHierarchyNode | undefined = node;
    let depth = 0;
    while (current?.parentIssue !== null && current?.parentIssue !== undefined) {
      if (visited.has(current.number)) {
        findings.push({
          issueNumber: node.number,
          code: "parent_cycle",
          detail: `parent cycle detected from #${node.number}`,
        });
        break;
      }
      visited.add(current.number);
      depth += 1;
      if (depth > 8) {
        findings.push({
          issueNumber: node.number,
          code: "hierarchy_depth_exceeded",
          detail: `hierarchy depth exceeds 8 from #${node.number}`,
        });
        break;
      }
      current = byNumber.get(current.parentIssue);
    }
  }

  const issuesWithFindings = new Set(findings.map((finding) => finding.issueNumber));
  const readyLeafIssues = [...byNumber.values()]
    .filter(
      (node) =>
        node.state === "open" &&
        node.disposition === "active" &&
        (node.role === "task" || node.role === "finding") &&
        (children.get(node.number)?.length ?? 0) === 0 &&
        node.blockedBy.every((number) => byNumber.get(number)?.state === "closed") &&
        !issuesWithFindings.has(node.number),
    )
    .map((node) => node.number)
    .sort((a, b) => a - b);

  return {
    schemaVersion: ISSUE_HIERARCHY_SCHEMA,
    ok: findings.length === 0,
    findings,
    readyLeafIssues,
  };
}
