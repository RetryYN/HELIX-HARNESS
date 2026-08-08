import {
  canonicalizeRegistryDeclaration,
  REGISTRY_POLICY_V1,
  type RegistryDeclarationV1,
} from "../../src/design/design-registry";

// PLAN-L7-516-design-registry-core slice1 の共有 fixture。requirement→acceptance の完備 chain（L6 §1 adjacency 準拠）
// と HR-FR-DHR-006 の 6 原子親グラフを 1 宣言で構築する。

export interface FixtureNodeInputV1 {
  entity_id: string;
  kind: string;
  atom_role?: string | null;
  service_role?: string | null;
  authority?: string;
  revision?: number;
}

export interface FixtureEdgeInputV1 {
  from_entity_id: string;
  to_entity_id: string;
  relation: string;
  authority?: string;
}

export function fixtureNode(input: FixtureNodeInputV1) {
  return {
    entity_id: input.entity_id,
    kind: input.kind,
    atom_role: input.atom_role ?? null,
    service_role: input.service_role ?? null,
    authority: input.authority ?? "canonical",
    revision: input.revision ?? 1,
    source_pointer: "docs/design/helix/L2-screen/example.md",
  };
}

export function fixtureEdge(input: FixtureEdgeInputV1) {
  return {
    from_entity_id: input.from_entity_id,
    to_entity_id: input.to_entity_id,
    relation: input.relation,
    authority: input.authority ?? "canonical",
    revision: 1,
  };
}

export const FULL_CHAIN_NODES: FixtureNodeInputV1[] = [
  { entity_id: "VDH-FR-001", kind: "requirement" },
  { entity_id: "VDH-FR-002", kind: "requirement", atom_role: "user_task" },
  { entity_id: "VDH-FR-003", kind: "requirement", atom_role: "business_outcome" },
  { entity_id: "VDH-FR-004", kind: "requirement", atom_role: "scenario" },
  { entity_id: "VDH-FR-005", kind: "requirement", atom_role: "context" },
  { entity_id: "VDH-FR-006", kind: "requirement", atom_role: "success_result" },
  { entity_id: "VDH-FR-007", kind: "requirement", atom_role: "decision_rationale" },
  { entity_id: "SCR-pm-01", kind: "screen" },
  { entity_id: "INT-approve-click", kind: "interaction" },
  { entity_id: "SVC-approve-permission", kind: "service", service_role: "permission" },
  { entity_id: "SVC-approve-command", kind: "service", service_role: "command" },
  { entity_id: "SVC-approve-api", kind: "service", service_role: "api" },
  { entity_id: "DOM-approval", kind: "domain_object" },
  { entity_id: "AEV-approve-submitted", kind: "analytics_event" },
  { entity_id: "VDH-AC-001", kind: "acceptance" },
];

export const FULL_CHAIN_EDGES: FixtureEdgeInputV1[] = [
  { from_entity_id: "VDH-FR-001", to_entity_id: "SCR-pm-01", relation: "decomposes_to" },
  { from_entity_id: "SCR-pm-01", to_entity_id: "INT-approve-click", relation: "presents" },
  {
    from_entity_id: "INT-approve-click",
    to_entity_id: "SVC-approve-permission",
    relation: "guarded_by",
  },
  {
    from_entity_id: "SVC-approve-permission",
    to_entity_id: "SVC-approve-command",
    relation: "invokes",
  },
  { from_entity_id: "SVC-approve-command", to_entity_id: "SVC-approve-api", relation: "invokes" },
  { from_entity_id: "SVC-approve-api", to_entity_id: "DOM-approval", relation: "emits" },
  { from_entity_id: "DOM-approval", to_entity_id: "AEV-approve-submitted", relation: "measures" },
  { from_entity_id: "AEV-approve-submitted", to_entity_id: "VDH-AC-001", relation: "accepted_by" },
  { from_entity_id: "SCR-pm-01", to_entity_id: "VDH-FR-002", relation: "parents" },
  { from_entity_id: "SCR-pm-01", to_entity_id: "VDH-FR-003", relation: "parents" },
  { from_entity_id: "INT-approve-click", to_entity_id: "VDH-FR-002", relation: "parents" },
  { from_entity_id: "INT-approve-click", to_entity_id: "VDH-FR-003", relation: "parents" },
  { from_entity_id: "VDH-FR-002", to_entity_id: "VDH-FR-004", relation: "parents" },
  { from_entity_id: "VDH-FR-002", to_entity_id: "VDH-FR-005", relation: "parents" },
  { from_entity_id: "VDH-FR-002", to_entity_id: "VDH-FR-006", relation: "parents" },
  { from_entity_id: "VDH-FR-002", to_entity_id: "VDH-FR-007", relation: "parents" },
];

export function buildDeclaration(
  nodes: FixtureNodeInputV1[] = FULL_CHAIN_NODES,
  edges: FixtureEdgeInputV1[] = FULL_CHAIN_EDGES,
): RegistryDeclarationV1 {
  const result = canonicalizeRegistryDeclaration(
    {
      schema_version: "design-registry-declaration.v1",
      nodes: nodes.map(fixtureNode),
      edges: edges.map(fixtureEdge),
    },
    REGISTRY_POLICY_V1,
  );
  if (!result.ok) {
    throw new Error(`fixture declaration must canonicalize: ${JSON.stringify(result.failures)}`);
  }
  return result.value;
}
