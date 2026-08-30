import { canonicalJson, sha256Digest } from "./digest";

export const CI_RESPONSIBILITY_REGISTRY_SCHEMA = "helix-ci-responsibility-registry.v1";

export type CiSemanticNodeKind =
  | "issue"
  | "plan"
  | "requirement"
  | "design"
  | "contract"
  | "module"
  | "bundle"
  | "v_pair"
  | "runtime"
  | "db"
  | "distribution"
  | "security"
  | "artifact";
export type VerificationObligationClass =
  | "local"
  | "boundary"
  | "global_invariant"
  | "release_only";
export type VerificationEnvironment = "linux" | "windows" | "repository" | "consumer";
export type VerificationCostClass = "fast" | "bounded" | "heavy";
export type VerificationRiskClass = "low" | "medium" | "high" | "critical";
export type VerificationParallelism = "parallel_safe" | "exclusive_state" | "serial";
export type VerificationDeferTarget = "main" | "nightly" | "release";

export interface CiSemanticNode {
  id: string;
  kind: CiSemanticNodeKind;
  owner: string;
}

export interface CiSemanticEdge {
  from: string;
  to: string;
  relation: "refines" | "implements" | "verifies" | "contains" | "consumes" | "depends_on";
}

export interface VerificationCapability {
  capability_id: string;
  responsibility_id: string;
  owner: string;
  oracle_ids: readonly string[];
  environments: readonly VerificationEnvironment[];
  cost_class: VerificationCostClass;
  risk_class: VerificationRiskClass;
  obligation_class: VerificationObligationClass;
  parallelism: VerificationParallelism;
  artifact_inputs: readonly string[];
  artifact_outputs: readonly string[];
  freshness: "same_candidate_head" | "same_main_head" | "release_candidate";
  defer_targets: readonly VerificationDeferTarget[];
  applicability_node_ids: readonly string[];
  depends_on_capability_ids: readonly string[];
  status: "active" | "retired";
  replacement_capability_id: string | null;
  rollback_capability_id: string | null;
  retirement_consumer_capability_ids: readonly string[];
  retirement_history_refs: readonly string[];
}

export interface CiResponsibilityRegistry {
  schema_version: typeof CI_RESPONSIBILITY_REGISTRY_SCHEMA;
  registry_version: string;
  nodes: readonly CiSemanticNode[];
  edges: readonly CiSemanticEdge[];
  capabilities: readonly VerificationCapability[];
}

export type CiResponsibilityFindingCode =
  | "schema_invalid"
  | "identity_invalid"
  | "owner_missing"
  | "duplicate_identity"
  | "duplicate_responsibility_owner"
  | "oracle_missing"
  | "artifact_contract_invalid"
  | "unknown_node"
  | "orphan_node"
  | "dependency_cycle"
  | "retirement_contract_invalid";

export interface CiResponsibilityFinding {
  code: CiResponsibilityFindingCode;
  subject: string;
  detail: string;
}

export interface CiResponsibilityRegistryResult {
  ok: boolean;
  registry_digest: `sha256:${string}`;
  findings: readonly CiResponsibilityFinding[];
}

export interface VerificationObligationDerivationInput {
  registry: CiResponsibilityRegistry;
  authority_node_ids: readonly string[];
  changed_artifact_node_ids: readonly string[];
}

export interface VerificationObligationDerivation {
  ok: boolean;
  registry_digest: `sha256:${string}`;
  affected_node_ids: readonly string[];
  obligation_ids_by_class: Readonly<Record<VerificationObligationClass, readonly string[]>>;
  findings: readonly CiResponsibilityFinding[];
}

const ID = /^[a-z][a-z0-9_]*(?::[a-z0-9][a-z0-9._/-]*)+$/;

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export function ciResponsibilityRegistryDigest(
  registry: CiResponsibilityRegistry,
): `sha256:${string}` {
  return sha256Digest(canonicalJson(registry));
}

function addFinding(findings: CiResponsibilityFinding[], finding: CiResponsibilityFinding): void {
  findings.push(finding);
}

function cycleNodes(capabilities: readonly VerificationCapability[]): string[] {
  const active = new Map(
    capabilities
      .filter((item) => item.status === "active")
      .map((item) => [item.capability_id, item]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cyclic = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      cyclic.add(id);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of active.get(id)?.depends_on_capability_ids ?? []) {
      if (visiting.has(dependency)) {
        cyclic.add(id);
        cyclic.add(dependency);
      } else if (active.has(dependency)) visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of active.keys()) visit(id);
  return [...cyclic].sort();
}

export function validateCiResponsibilityRegistry(
  registry: CiResponsibilityRegistry,
): CiResponsibilityRegistryResult {
  const findings: CiResponsibilityFinding[] = [];
  if (registry.schema_version !== CI_RESPONSIBILITY_REGISTRY_SCHEMA) {
    addFinding(findings, {
      code: "schema_invalid",
      subject: "registry",
      detail: registry.schema_version,
    });
  }
  const nodes = new Map<string, CiSemanticNode>();
  for (const node of registry.nodes) {
    if (!ID.test(node.id))
      addFinding(findings, { code: "identity_invalid", subject: node.id, detail: "node id" });
    if (!node.owner.trim())
      addFinding(findings, { code: "owner_missing", subject: node.id, detail: "node owner" });
    if (nodes.has(node.id))
      addFinding(findings, { code: "duplicate_identity", subject: node.id, detail: "node" });
    else nodes.set(node.id, node);
  }
  const edgeParticipants = new Set<string>();
  for (const edge of registry.edges) {
    for (const id of [edge.from, edge.to]) {
      if (!nodes.has(id))
        addFinding(findings, {
          code: "unknown_node",
          subject: id,
          detail: `edge:${edge.from}->${edge.to}`,
        });
      edgeParticipants.add(id);
    }
  }
  const capabilities = new Map<string, VerificationCapability>();
  const responsibilityOwners = new Map<string, string>();
  for (const capability of registry.capabilities) {
    if (!ID.test(capability.capability_id) || !ID.test(capability.responsibility_id)) {
      addFinding(findings, {
        code: "identity_invalid",
        subject: capability.capability_id,
        detail: "capability/responsibility",
      });
    }
    if (!capability.owner.trim()) {
      addFinding(findings, {
        code: "owner_missing",
        subject: capability.capability_id,
        detail: "capability owner",
      });
    }
    if (capabilities.has(capability.capability_id)) {
      addFinding(findings, {
        code: "duplicate_identity",
        subject: capability.capability_id,
        detail: "capability",
      });
    } else capabilities.set(capability.capability_id, capability);
    const existingOwner = responsibilityOwners.get(capability.responsibility_id);
    if (existingOwner && existingOwner !== capability.owner && capability.status === "active") {
      addFinding(findings, {
        code: "duplicate_responsibility_owner",
        subject: capability.responsibility_id,
        detail: `${existingOwner},${capability.owner}`,
      });
    } else if (capability.status === "active") {
      responsibilityOwners.set(capability.responsibility_id, capability.owner);
    }
    if (capability.oracle_ids.length === 0 || capability.oracle_ids.some((id) => !ID.test(id))) {
      addFinding(findings, {
        code: "oracle_missing",
        subject: capability.capability_id,
        detail: "typed oracle exact set",
      });
    }
    if (
      capability.artifact_inputs.some((id) => !ID.test(id)) ||
      capability.artifact_outputs.some((id) => !ID.test(id))
    ) {
      addFinding(findings, {
        code: "artifact_contract_invalid",
        subject: capability.capability_id,
        detail: "artifact identity",
      });
    }
    if (
      new Set(capability.defer_targets).size !== capability.defer_targets.length ||
      (capability.obligation_class === "release_only" &&
        !capability.defer_targets.includes("release"))
    ) {
      addFinding(findings, {
        code: "schema_invalid",
        subject: capability.capability_id,
        detail: "defer target authority",
      });
    }
    for (const id of capability.applicability_node_ids) {
      if (!nodes.has(id))
        addFinding(findings, {
          code: "unknown_node",
          subject: id,
          detail: capability.capability_id,
        });
      edgeParticipants.add(id);
    }
    if (
      capability.status === "retired" &&
      (!capability.replacement_capability_id ||
        !capability.rollback_capability_id ||
        capability.retirement_consumer_capability_ids.length === 0 ||
        capability.retirement_history_refs.length === 0 ||
        capability.retirement_history_refs.some((reference) => !ID.test(reference)))
    ) {
      addFinding(findings, {
        code: "retirement_contract_invalid",
        subject: capability.capability_id,
        detail: "replacement, rollback, consumer exact set, and history trace are required",
      });
    }
  }
  for (const capability of registry.capabilities) {
    for (const dependency of capability.depends_on_capability_ids) {
      if (!capabilities.has(dependency)) {
        addFinding(findings, {
          code: "unknown_node",
          subject: dependency,
          detail: capability.capability_id,
        });
      }
    }
    for (const replacement of [
      capability.replacement_capability_id,
      capability.rollback_capability_id,
    ]) {
      if (replacement && !capabilities.has(replacement)) {
        addFinding(findings, {
          code: "unknown_node",
          subject: replacement,
          detail: capability.capability_id,
        });
      }
    }
    for (const consumer of capability.retirement_consumer_capability_ids) {
      if (!capabilities.has(consumer)) {
        addFinding(findings, {
          code: "unknown_node",
          subject: consumer,
          detail: capability.capability_id,
        });
      }
    }
  }
  for (const node of registry.nodes) {
    if (!edgeParticipants.has(node.id))
      addFinding(findings, { code: "orphan_node", subject: node.id, detail: node.kind });
  }
  for (const id of cycleNodes(registry.capabilities)) {
    addFinding(findings, {
      code: "dependency_cycle",
      subject: id,
      detail: "capability dependency",
    });
  }
  return {
    ok: findings.length === 0,
    registry_digest: ciResponsibilityRegistryDigest(registry),
    findings: findings.sort((a, b) =>
      `${a.code}:${a.subject}:${a.detail}`.localeCompare(`${b.code}:${b.subject}:${b.detail}`),
    ),
  };
}

export function deriveVerificationObligations(
  input: VerificationObligationDerivationInput,
): VerificationObligationDerivation {
  const admission = validateCiResponsibilityRegistry(input.registry);
  const findings = [...admission.findings];
  const nodes = new Map(input.registry.nodes.map((node) => [node.id, node]));
  const seeds = sortedUnique([...input.authority_node_ids, ...input.changed_artifact_node_ids]);
  for (const id of seeds) {
    if (!nodes.has(id)) {
      addFinding(findings, { code: "unknown_node", subject: id, detail: "derivation input" });
    }
  }
  const adjacency = new Map<string, Set<string>>();
  for (const edge of input.registry.edges) {
    const forward = adjacency.get(edge.from) ?? new Set<string>();
    forward.add(edge.to);
    adjacency.set(edge.from, forward);
  }
  const affected = new Set(seeds.filter((id) => nodes.has(id)));
  const queue = [...affected];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    for (const related of adjacency.get(current) ?? []) {
      if (!affected.has(related)) {
        affected.add(related);
        queue.push(related);
      }
    }
  }
  const partitions: Record<VerificationObligationClass, string[]> = {
    local: [],
    boundary: [],
    global_invariant: [],
    release_only: [],
  };
  for (const capability of input.registry.capabilities) {
    if (capability.status !== "active") continue;
    if (capability.applicability_node_ids.some((id) => affected.has(id))) {
      partitions[capability.obligation_class].push(capability.capability_id);
    }
  }
  for (const key of Object.keys(partitions) as VerificationObligationClass[]) {
    partitions[key] = sortedUnique(partitions[key]);
  }
  return {
    ok: findings.length === 0,
    registry_digest: admission.registry_digest,
    affected_node_ids: [...affected].sort(),
    obligation_ids_by_class: partitions,
    findings: findings.sort((a, b) =>
      `${a.code}:${a.subject}`.localeCompare(`${b.code}:${b.subject}`),
    ),
  };
}
