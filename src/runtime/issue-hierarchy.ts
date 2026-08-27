import { parse as parseYaml } from "yaml";

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

export const ISSUE_DEPENDENCY_SCHEMA = "helix-issue-dependency.v1" as const;

export interface IssueDependencyNode {
  number: number;
  state: "open" | "closed";
  dependsOn: number[];
  blocks: number[];
  planId: string | null;
  /**
   * A parent/capability Issue may own several atomic PLANs.  `plan_id` stays
   * the compatibility scalar; new multi-PLAN contracts use `plan_id: null`
   * plus this explicit set.
   */
  planIds?: string[];
}

export interface IssuePlanBinding {
  planId: string;
  githubIssueId: number;
}

export interface IssueDependencyFinding {
  issueNumber: number;
  code:
    | "dependency_target_missing"
    | "closed_with_open_dependency"
    | "dependency_relation_not_symmetric"
    | "issue_plan_missing"
    | "issue_plan_binding_mismatch"
    | "plan_issue_missing"
    | "plan_issue_binding_mismatch"
    | "issue_dependency_contract_invalid";
  detail: string;
}

export interface IssueDependencyContractSource {
  number: number;
  state: "open" | "closed";
  body: string | null;
}

export function collectIssueHierarchyContracts(
  sources: readonly IssueDependencyContractSource[],
): IssueHierarchyNode[] {
  return sources.flatMap((source) => {
    try {
      return [
        {
          number: source.number,
          state: source.state,
          ...parseIssueHierarchyContract(source.body ?? ""),
        },
      ];
    } catch {
      return [];
    }
  });
}

export interface IssueHierarchyDependencyAlignmentFinding {
  issueNumber: number;
  code:
    | "dependency_contract_missing_for_hierarchy_relation"
    | "hierarchy_dependency_blocked_by_mismatch"
    | "hierarchy_dependency_blocks_mismatch";
  detail: string;
}

export interface IssueHierarchyRelationClosureCandidate {
  issueNumber: number;
  blocks: number[];
  blockedBy: number[];
  contractBlock: string;
}

export function renderIssueHierarchyContract(
  node: Pick<
    IssueHierarchyNode,
    | "role"
    | "parentIssue"
    | "blocks"
    | "blockedBy"
    | "duplicateSearch"
    | "disposition"
    | "duplicateOf"
  >,
): string {
  return [
    "```yaml",
    `issue_role: ${node.role}`,
    `parent_issue: ${node.parentIssue ?? "null"}`,
    `blocks: [${uniqueNumbers(node.blocks).join(", ")}]`,
    `blocked_by: [${uniqueNumbers(node.blockedBy).join(", ")}]`,
    `duplicate_search: ${node.duplicateSearch}`,
    `disposition: ${node.disposition}`,
    `duplicate_of: ${node.duplicateOf ?? "null"}`,
    "```",
  ].join("\n");
}

export function projectIssueHierarchyRelationClosure(
  nodes: readonly IssueHierarchyNode[],
  dependencyNodes: readonly IssueDependencyNode[] = [],
): IssueHierarchyRelationClosureCandidate[] {
  const desired = new Map(
    nodes.map((node) => [
      node.number,
      { blocks: new Set(node.blocks), blockedBy: new Set(node.blockedBy) },
    ]),
  );
  for (const dependency of dependencyNodes) {
    const relation = desired.get(dependency.number);
    if (!relation) continue;
    for (const target of dependency.blocks) relation.blocks.add(target);
    for (const target of dependency.dependsOn) relation.blockedBy.add(target);
  }
  for (const [issueNumber, relation] of desired) {
    for (const target of relation.blocks) desired.get(target)?.blockedBy.add(issueNumber);
    for (const target of relation.blockedBy) desired.get(target)?.blocks.add(issueNumber);
  }
  return nodes.flatMap((node) => {
    const relation = desired.get(node.number);
    if (!relation) return [];
    const blocks = uniqueNumbers([...relation.blocks]);
    const blockedBy = uniqueNumbers([...relation.blockedBy]);
    if (
      JSON.stringify(blocks) === JSON.stringify(uniqueNumbers(node.blocks)) &&
      JSON.stringify(blockedBy) === JSON.stringify(uniqueNumbers(node.blockedBy))
    ) {
      return [];
    }
    const projected = { ...node, blocks, blockedBy };
    return [
      {
        issueNumber: node.number,
        blocks,
        blockedBy,
        contractBlock: renderIssueHierarchyContract(projected),
      },
    ];
  });
}

export function applyIssueHierarchyRelationClosureCandidate(
  body: string,
  candidate: IssueHierarchyRelationClosureCandidate,
): string {
  const currentBlock = extractIssueHierarchyContractBlock(body);
  if (!currentBlock) throw new Error("issue_hierarchy_migration_expected_present");
  const current = parseIssueHierarchyContract(currentBlock);
  const projected = parseIssueHierarchyContract(candidate.contractBlock);
  const metadataChanged =
    current.role !== projected.role ||
    current.parentIssue !== projected.parentIssue ||
    current.duplicateSearch !== projected.duplicateSearch ||
    current.disposition !== projected.disposition ||
    current.duplicateOf !== projected.duplicateOf;
  const removesEdge =
    current.blocks.some((number) => !candidate.blocks.includes(number)) ||
    current.blockedBy.some((number) => !candidate.blockedBy.includes(number));
  if (metadataChanged) throw new Error("issue_hierarchy_migration_metadata_drift");
  if (removesEdge) throw new Error("issue_hierarchy_migration_edge_removal");
  return body.replace(currentBlock, candidate.contractBlock);
}

export interface IssueDependencyMigrationCandidate {
  issueNumber: number;
  action: "add" | "replace";
  dependsOn: number[];
  blocks: number[];
  planId: string | null;
  planIds?: string[];
  contractBlock: string;
}

export function renderIssueDependencyContract(
  node: Pick<IssueDependencyNode, "dependsOn" | "blocks" | "planId" | "planIds">,
): string {
  const planIds = uniqueStrings(node.planIds ?? []);
  if (node.planId !== null && planIds.length > 0) {
    throw new Error("issue_plan_scalar_and_set_conflict");
  }
  return [
    "```yaml",
    `# ${ISSUE_DEPENDENCY_SCHEMA}`,
    `depends_on: [${uniqueNumbers(node.dependsOn).join(", ")}]`,
    `blocks: [${uniqueNumbers(node.blocks).join(", ")}]`,
    `plan_id: ${node.planId ?? "null"}`,
    ...(planIds.length > 0 ? [`plan_ids: [${planIds.join(", ")}]`] : []),
    "```",
  ].join("\n");
}

export function applyIssueDependencyMigrationCandidate(
  body: string,
  candidate: IssueDependencyMigrationCandidate,
): string {
  const adoptedBlock = extractIssueDependencyContractBlock(body);
  if (candidate.action === "add" && adoptedBlock !== null) {
    throw new Error("issue_dependency_migration_expected_absent");
  }
  if (candidate.action === "replace" && adoptedBlock === null) {
    throw new Error("issue_dependency_migration_expected_present");
  }
  if (adoptedBlock !== null) {
    return body.replace(adoptedBlock, candidate.contractBlock);
  }
  const prefix = body.trimEnd();
  return `${prefix}${prefix === "" ? "" : "\n\n"}${candidate.contractBlock}\n`;
}

/** Project the exact dependency contract required by the active hierarchy. */
export function projectIssueDependencyMigrationCandidates(
  hierarchyNodes: readonly IssueHierarchyNode[],
  dependencyNodes: readonly IssueDependencyNode[],
  plans: readonly IssuePlanBinding[] = [],
): IssueDependencyMigrationCandidate[] {
  const dependencyByNumber = new Map(dependencyNodes.map((node) => [node.number, node]));
  const planIdsByIssue = new Map<number, string[]>();
  for (const plan of plans) {
    planIdsByIssue.set(
      plan.githubIssueId,
      uniqueStrings([...(planIdsByIssue.get(plan.githubIssueId) ?? []), plan.planId]),
    );
  }
  return hierarchyNodes
    .filter(
      (node) =>
        node.disposition === "active" && (node.blocks.length > 0 || node.blockedBy.length > 0),
    )
    .flatMap((hierarchyNode) => {
      const current = dependencyByNumber.get(hierarchyNode.number);
      const dependsOn = uniqueNumbers(hierarchyNode.blockedBy);
      const blocks = uniqueNumbers(hierarchyNode.blocks);
      const projectedPlanIds = planIdsByIssue.get(hierarchyNode.number) ?? [];
      const planId =
        projectedPlanIds.length === 1
          ? (projectedPlanIds[0] ?? null)
          : projectedPlanIds.length > 1
            ? null
            : (current?.planId ?? null);
      const planIds =
        projectedPlanIds.length > 1
          ? projectedPlanIds
          : projectedPlanIds.length === 1
            ? undefined
            : current?.planIds
              ? uniqueStrings(current.planIds)
              : undefined;
      if (
        current &&
        JSON.stringify(uniqueNumbers(current.dependsOn)) === JSON.stringify(dependsOn) &&
        JSON.stringify(uniqueNumbers(current.blocks)) === JSON.stringify(blocks) &&
        current.planId === planId &&
        JSON.stringify(uniqueStrings(current.planIds ?? [])) ===
          JSON.stringify(uniqueStrings(planIds ?? []))
      ) {
        return [];
      }
      const candidate: IssueDependencyMigrationCandidate = {
        issueNumber: hierarchyNode.number,
        action: current ? "replace" : "add",
        dependsOn,
        blocks,
        planId,
        ...(planIds && planIds.length > 0 ? { planIds } : {}),
        contractBlock: renderIssueDependencyContract({ dependsOn, blocks, planId, planIds }),
      };
      return [candidate];
    })
    .sort((left, right) => left.issueNumber - right.issueNumber);
}

export function auditIssueHierarchyDependencyAlignment(
  hierarchyNodes: readonly IssueHierarchyNode[],
  dependencyNodes: readonly IssueDependencyNode[],
) {
  const findings: IssueHierarchyDependencyAlignmentFinding[] = [];
  const dependencyByNumber = new Map(dependencyNodes.map((node) => [node.number, node]));
  const governedHierarchyNodes = hierarchyNodes.filter(
    (node) =>
      node.disposition === "active" && (node.blocks.length > 0 || node.blockedBy.length > 0),
  );

  for (const hierarchyNode of governedHierarchyNodes) {
    const dependencyNode = dependencyByNumber.get(hierarchyNode.number);
    if (!dependencyNode) {
      findings.push({
        issueNumber: hierarchyNode.number,
        code: "dependency_contract_missing_for_hierarchy_relation",
        detail: `issue #${hierarchyNode.number} declares hierarchy relations but has no ${ISSUE_DEPENDENCY_SCHEMA} contract`,
      });
      continue;
    }
    const hierarchyBlockedBy = uniqueNumbers(hierarchyNode.blockedBy);
    const dependencyDependsOn = uniqueNumbers(dependencyNode.dependsOn);
    if (JSON.stringify(hierarchyBlockedBy) !== JSON.stringify(dependencyDependsOn)) {
      findings.push({
        issueNumber: hierarchyNode.number,
        code: "hierarchy_dependency_blocked_by_mismatch",
        detail: `hierarchy blocked_by=[${hierarchyBlockedBy.join(",")}] dependency depends_on=[${dependencyDependsOn.join(",")}]`,
      });
    }
    const hierarchyBlocks = uniqueNumbers(hierarchyNode.blocks);
    const dependencyBlocks = uniqueNumbers(dependencyNode.blocks);
    if (JSON.stringify(hierarchyBlocks) !== JSON.stringify(dependencyBlocks)) {
      findings.push({
        issueNumber: hierarchyNode.number,
        code: "hierarchy_dependency_blocks_mismatch",
        detail: `hierarchy blocks=[${hierarchyBlocks.join(",")}] dependency blocks=[${dependencyBlocks.join(",")}]`,
      });
    }
  }

  return {
    schemaVersion: ISSUE_DEPENDENCY_SCHEMA,
    ok: findings.length === 0,
    checkedIssues: governedHierarchyNodes.length,
    findings,
  };
}

function extractIssueDependencyContractBlock(body: string): string | null {
  const fencedYamlBlock = /```yaml\b([\s\S]*?)```/g;
  for (const match of body.matchAll(fencedYamlBlock)) {
    const content = match[1] ?? "";
    if (/^\s*# helix-issue-dependency\.v1[ \t]*(?:\r?\n|$)/.test(content)) {
      return match[0];
    }
  }
  return null;
}

export function hasIssueDependencyContractBlock(body: string): boolean {
  return extractIssueDependencyContractBlock(body) !== null;
}

export function collectIssueDependencyContracts(
  sources: readonly IssueDependencyContractSource[],
): { nodes: IssueDependencyNode[]; findings: IssueDependencyFinding[] } {
  const nodes: IssueDependencyNode[] = [];
  const findings: IssueDependencyFinding[] = [];
  for (const source of sources) {
    if (!hasIssueDependencyContractBlock(source.body ?? "")) continue;
    try {
      nodes.push({
        number: source.number,
        state: source.state,
        ...parseIssueDependencyContract(source.body ?? ""),
      });
    } catch (error) {
      findings.push({
        issueNumber: source.number,
        code: "issue_dependency_contract_invalid",
        detail: `issue dependency contract invalid: ${
          error instanceof Error ? error.message : "unknown_parser_failure"
        }`,
      });
    }
  }
  return { nodes, findings };
}

export function parseIssueDependencyContract(
  body: string,
): Omit<IssueDependencyNode, "number" | "state"> {
  const adoptedBlock = extractIssueDependencyContractBlock(body);
  if (!adoptedBlock) throw new Error("issue_dependency_contract_missing_or_invalid");
  const block = adoptedBlock.match(
    /```yaml\s+# helix-issue-dependency\.v1\s+depends_on:\s*\[([^\]]*)\]\s+blocks:\s*\[([^\]]*)\]\s+plan_id:\s*(null|PLAN-[A-Za-z0-9-]+)(?:\s+plan_ids:\s*\[([^\]]*)\])?\s*```/m,
  );
  if (!block) throw new Error("issue_dependency_contract_missing_or_invalid");
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
  const planIds = (raw: string): string[] =>
    raw.trim() === ""
      ? []
      : uniqueStrings(
          raw.split(",").map((item) => {
            const value = item.trim();
            if (!/^PLAN-[A-Za-z0-9-]+$/.test(value)) {
              throw new Error("issue_plan_id_invalid");
            }
            return value;
          }),
        );
  const planId = block[3] === "null" ? null : (block[3] ?? null);
  const explicitPlanIds = planIds(block[4] ?? "");
  if (planId !== null && explicitPlanIds.length > 0) {
    throw new Error("issue_plan_scalar_and_set_conflict");
  }
  return {
    dependsOn: numbers(block[1] ?? ""),
    blocks: numbers(block[2] ?? ""),
    planId,
    ...(explicitPlanIds.length > 0 ? { planIds: explicitPlanIds } : {}),
  };
}

function issuePlanIds(node: Pick<IssueDependencyNode, "planId" | "planIds">): string[] {
  return uniqueStrings([...(node.planId === null ? [] : [node.planId]), ...(node.planIds ?? [])]);
}

export function auditIssueDependencies(
  nodes: readonly IssueDependencyNode[],
  plans: readonly IssuePlanBinding[],
  options: { requireReferencedPlans?: boolean; focusIssueNumbers?: readonly number[] } = {},
) {
  const findings: IssueDependencyFinding[] = [];
  const byNumber = new Map(nodes.map((node) => [node.number, node]));
  const scopedNumbers = (() => {
    if (options.focusIssueNumbers === undefined) return null;
    const scoped = new Set(options.focusIssueNumbers.filter((number) => byNumber.has(number)));
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of nodes) {
        const relations = [...node.dependsOn, ...node.blocks];
        if (!scoped.has(node.number) && !relations.some((number) => scoped.has(number))) continue;
        for (const number of [node.number, ...relations]) {
          if (!byNumber.has(number) || scoped.has(number)) continue;
          scoped.add(number);
          changed = true;
        }
      }
    }
    return scoped;
  })();
  const scopedNodes =
    scopedNumbers === null ? [...nodes] : nodes.filter((node) => scopedNumbers.has(node.number));
  const referencedPlanIds = new Set(scopedNodes.flatMap((node) => issuePlanIds(node)));
  const scopedPlans =
    scopedNumbers === null
      ? [...plans]
      : plans.filter(
          (plan) => scopedNumbers.has(plan.githubIssueId) || referencedPlanIds.has(plan.planId),
        );
  const byPlan = new Map(scopedPlans.map((plan) => [plan.planId, plan]));

  for (const node of scopedNodes) {
    for (const dependency of node.dependsOn) {
      const target = byNumber.get(dependency);
      if (!target) {
        findings.push({
          issueNumber: node.number,
          code: "dependency_target_missing",
          detail: `depends_on target #${dependency} is absent`,
        });
        continue;
      }
      if (!target.blocks.includes(node.number)) {
        findings.push({
          issueNumber: node.number,
          code: "dependency_relation_not_symmetric",
          detail: `#${node.number} depends_on #${dependency}, but inverse blocks is absent`,
        });
      }
      if (node.state === "closed" && target.state === "open") {
        findings.push({
          issueNumber: node.number,
          code: "closed_with_open_dependency",
          detail: `closed issue #${node.number} still depends on open issue #${dependency}`,
        });
      }
    }
    for (const blockedIssue of node.blocks) {
      const target = byNumber.get(blockedIssue);
      if (!target) {
        findings.push({
          issueNumber: node.number,
          code: "dependency_target_missing",
          detail: `blocks target #${blockedIssue} is absent`,
        });
        continue;
      }
      if (!target.dependsOn.includes(node.number)) {
        findings.push({
          issueNumber: node.number,
          code: "dependency_relation_not_symmetric",
          detail: `#${node.number} blocks #${blockedIssue}, but inverse depends_on is absent`,
        });
      }
    }
    for (const planId of issuePlanIds(node)) {
      const plan = byPlan.get(planId);
      if (!plan && options.requireReferencedPlans !== false) {
        findings.push({
          issueNumber: node.number,
          code: "issue_plan_missing",
          detail: `issue references absent plan ${planId}`,
        });
      } else if (plan && plan.githubIssueId !== node.number) {
        findings.push({
          issueNumber: node.number,
          code: "issue_plan_binding_mismatch",
          detail: `${planId} binds github_issue_id=${plan.githubIssueId}, not ${node.number}`,
        });
      }
    }
  }

  for (const plan of scopedPlans) {
    const issue = byNumber.get(plan.githubIssueId);
    if (!issue) {
      findings.push({
        issueNumber: plan.githubIssueId,
        code: "plan_issue_missing",
        detail: `${plan.planId} references absent issue #${plan.githubIssueId}`,
      });
    } else if (!issuePlanIds(issue).includes(plan.planId)) {
      findings.push({
        issueNumber: issue.number,
        code: "plan_issue_binding_mismatch",
        detail: `${plan.planId} expects issue plan_id=${plan.planId}, found ${formatIssuePlanIds(issue)}`,
      });
    }
  }

  return {
    schemaVersion: ISSUE_DEPENDENCY_SCHEMA,
    ok: findings.length === 0,
    checkedIssues: scopedNodes.length,
    checkedPlans: scopedPlans.length,
    findings,
  };
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function formatIssuePlanIds(node: Pick<IssueDependencyNode, "planId" | "planIds">): string {
  const planIds = issuePlanIds(node);
  return planIds.length === 0
    ? "null"
    : planIds.length === 1
      ? planIds[0]
      : `[${planIds.join(", ")}]`;
}

function isPositiveIssueNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function extractIssueHierarchyContractBlock(body: string): string | null {
  for (const match of body.matchAll(/```yaml\b([\s\S]*?)```/g)) {
    let value: unknown;
    try {
      value = parseYaml((match[1] ?? "").replace(/([[,]\s*)#(\d+)/g, "$1$2"));
    } catch {
      continue;
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "issue_role" in value &&
      "parent_issue" in value &&
      "blocks" in value &&
      "blocked_by" in value &&
      "duplicate_search" in value &&
      "disposition" in value &&
      "duplicate_of" in value
    ) {
      return match[0];
    }
  }
  return null;
}

export function parseIssueHierarchyContract(
  body: string,
): Omit<IssueHierarchyNode, "number" | "state"> {
  const block = extractIssueHierarchyContractBlock(body);
  if (!block) throw new Error("issue_hierarchy_contract_missing_or_invalid");
  const value = parseYaml(
    block
      .slice(block.indexOf("\n") + 1, block.lastIndexOf("```"))
      .replace(/([[,]\s*)#(\d+)/g, "$1$2"),
  ) as Record<string, unknown>;
  const enumValue = <T extends string>(
    candidate: unknown,
    allowed: readonly T[],
    code: string,
  ): T => {
    if (typeof candidate !== "string" || !allowed.includes(candidate as T)) throw new Error(code);
    return candidate as T;
  };
  const nullableIssue = (candidate: unknown): number | null => {
    if (candidate === null) return null;
    if (!isPositiveIssueNumber(candidate as number))
      throw new Error("issue_relation_number_invalid");
    return candidate as number;
  };
  const numbers = (candidate: unknown): number[] => {
    if (!Array.isArray(candidate)) throw new Error("issue_relation_array_invalid");
    return uniqueNumbers(
      candidate.map((item) => {
        const normalized = typeof item === "string" ? Number(item.replace(/^#/, "")) : item;
        if (!isPositiveIssueNumber(normalized as number)) {
          throw new Error("issue_relation_number_invalid");
        }
        return normalized as number;
      }),
    );
  };
  const normalizedRole = value.issue_role === "feature" ? "capability" : value.issue_role;
  return {
    role: enumValue(
      normalizedRole,
      ["root", "capability", "task", "finding"],
      "issue_role_invalid",
    ),
    parentIssue: nullableIssue(value.parent_issue),
    blocks: numbers(value.blocks),
    blockedBy: numbers(value.blocked_by),
    duplicateSearch: enumValue(value.duplicate_search, ["completed"], "duplicate_search_invalid"),
    disposition: enumValue(
      value.disposition,
      ["active", "parked", "duplicate", "superseded"],
      "issue_disposition_invalid",
    ),
    duplicateOf: nullableIssue(value.duplicate_of),
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
