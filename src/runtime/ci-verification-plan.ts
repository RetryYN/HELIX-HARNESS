import {
  type CiResponsibilityFinding,
  type CiResponsibilityRegistry,
  ciResponsibilityRegistryDigest,
  deriveVerificationObligations,
  type VerificationDeferTarget,
  type VerificationObligationClass,
} from "./ci-responsibility-registry";
import { canonicalJson, sha256Digest } from "./digest";
import type { ImpactDecision } from "./impact-ci";

export const CI_VERIFICATION_PLAN_SCHEMA = "helix-ci-verification-plan.v1";

export type VerificationExecutionContext =
  | "pull_request"
  | "main"
  | "nightly"
  | "release_candidate";
export type DeferredExecutionTarget = VerificationDeferTarget;
export type FullFallbackReason =
  | "unknown_identity"
  | "high_risk"
  | "selector_change"
  | "registry_change"
  | "security_change"
  | "schema_change"
  | "migration_change"
  | "rollback_change"
  | "lockfile_change"
  | "legacy_full_admission";

export interface VerificationWorkAuthority {
  kind: "issue" | "plan";
  id: string;
}

export interface DeferredObligationAssignment {
  capability_id: string;
  target: DeferredExecutionTarget;
  candidate_head: string;
  receipt_status: "pending" | "succeeded";
  receipt_digest?: `sha256:${string}`;
}

export interface VerificationPlanInput {
  registry: CiResponsibilityRegistry;
  expected_registry_digest: `sha256:${string}`;
  work_authority: VerificationWorkAuthority;
  candidate_head: string;
  expected_candidate_head: string;
  base_head: string;
  execution_context: VerificationExecutionContext;
  authority_node_ids: readonly string[];
  changed_artifact_node_ids: readonly string[];
  changed_test_capability_ids: readonly string[];
  risk_signals: readonly string[];
  required_obligation_ids: readonly string[];
  defer_assignments: readonly DeferredObligationAssignment[];
  compatibility_capability_ids?: readonly string[];
}

export interface VerificationDagNode {
  capability_id: string;
  depends_on_capability_ids: readonly string[];
}

export interface DeferredVerificationObligation {
  capability_id: string;
  target: DeferredExecutionTarget;
  candidate_head: string;
  receipt_status: "pending" | "succeeded";
  receipt_digest?: `sha256:${string}`;
}

export type VerificationPlanFindingCode =
  | "head_invalid"
  | "head_mismatch"
  | "work_authority_invalid"
  | "registry_digest_stale"
  | "unknown_capability"
  | "duplicate_obligation"
  | "defer_assignment_invalid"
  | "deferred_dependency_invalid"
  | "deferred_receipt_invalid"
  | "unknown_risk_signal"
  | "required_obligation_missing"
  | "registry_invalid";

export interface VerificationPlanFinding {
  code: VerificationPlanFindingCode;
  subject: string;
  detail: string;
}

export interface CiVerificationPlan {
  schema_version: typeof CI_VERIFICATION_PLAN_SCHEMA;
  candidate_head: string;
  base_head: string;
  work_authority: VerificationWorkAuthority;
  local_obligations: readonly string[];
  boundary_obligations: readonly string[];
  global_invariants: readonly string[];
  deferred_obligations: readonly DeferredVerificationObligation[];
  execution_dag: readonly VerificationDagNode[];
  full_fallback_reasons: readonly FullFallbackReason[];
  registry_digest: `sha256:${string}`;
  plan_digest: `sha256:${string}`;
  findings: readonly VerificationPlanFinding[];
  ok: boolean;
}

export interface LegacyImpactCiAdapterInput {
  decision: ImpactDecision;
  item_capability_map: Readonly<Record<string, string>>;
}

export interface LegacyImpactCiAdapterResult {
  candidate_head: string;
  base_head: string;
  compatibility_capability_ids: readonly string[];
  defer_assignments: readonly DeferredObligationAssignment[];
  risk_signals: readonly FullFallbackReason[];
  findings: readonly VerificationPlanFinding[];
}

const SHA = /^[a-f0-9]{40}$/;
const AUTHORITY_ID = /^(issue:[1-9][0-9]*|plan:[a-z0-9][a-z0-9._/-]*)$/;
const FULL_REASON_SET = new Set<FullFallbackReason>([
  "unknown_identity",
  "high_risk",
  "selector_change",
  "registry_change",
  "security_change",
  "schema_change",
  "migration_change",
  "rollback_change",
  "lockfile_change",
  "legacy_full_admission",
]);

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function finding(
  code: VerificationPlanFindingCode,
  subject: string,
  detail: string,
): VerificationPlanFinding {
  return { code, subject, detail };
}

function findingFromRegistry(item: CiResponsibilityFinding): VerificationPlanFinding {
  const code = item.code === "unknown_node" ? "unknown_capability" : "registry_invalid";
  return finding(code, item.subject, `${item.code}:${item.detail}`);
}

function activeCapabilityIds(registry: CiResponsibilityRegistry): string[] {
  return registry.capabilities
    .filter((capability) => capability.status === "active")
    .map((capability) => capability.capability_id)
    .sort();
}

function dependencyClosure(registry: CiResponsibilityRegistry, seeds: Set<string>): Set<string> {
  const capabilities = new Map(
    registry.capabilities.map((capability) => [capability.capability_id, capability]),
  );
  const closure = new Set(seeds);
  const queue = [...seeds];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    for (const dependency of capabilities.get(current)?.depends_on_capability_ids ?? []) {
      if (!closure.has(dependency)) {
        closure.add(dependency);
        queue.push(dependency);
      }
    }
  }
  return closure;
}

function partitionCapabilityIds(
  registry: CiResponsibilityRegistry,
  selected: Set<string>,
): Record<VerificationObligationClass, string[]> {
  const partitions: Record<VerificationObligationClass, string[]> = {
    local: [],
    boundary: [],
    global_invariant: [],
    release_only: [],
  };
  for (const capability of registry.capabilities) {
    if (capability.status === "active" && selected.has(capability.capability_id)) {
      partitions[capability.obligation_class].push(capability.capability_id);
    }
  }
  for (const key of Object.keys(partitions) as VerificationObligationClass[]) {
    partitions[key].sort();
  }
  return partitions;
}

function digestPlan(plan: Omit<CiVerificationPlan, "plan_digest">): `sha256:${string}` {
  return sha256Digest(canonicalJson(plan));
}

export function composeCiVerificationPlan(input: VerificationPlanInput): CiVerificationPlan {
  const findings: VerificationPlanFinding[] = [];
  if (!SHA.test(input.candidate_head)) {
    findings.push(finding("head_invalid", input.candidate_head, "candidate_head"));
  }
  if (
    !SHA.test(input.expected_candidate_head) ||
    input.candidate_head !== input.expected_candidate_head
  ) {
    findings.push(
      finding("head_mismatch", input.candidate_head, `expected=${input.expected_candidate_head}`),
    );
  }
  if (!SHA.test(input.base_head) || input.base_head === input.candidate_head) {
    findings.push(finding("head_invalid", input.base_head, "base_head"));
  }
  if (!AUTHORITY_ID.test(input.work_authority.id)) {
    findings.push(
      finding("work_authority_invalid", input.work_authority.id, input.work_authority.kind),
    );
  }
  if (
    (input.work_authority.kind === "issue" && !input.work_authority.id.startsWith("issue:")) ||
    (input.work_authority.kind === "plan" && !input.work_authority.id.startsWith("plan:"))
  ) {
    findings.push(finding("work_authority_invalid", input.work_authority.id, "kind mismatch"));
  }

  const registryDigest = ciResponsibilityRegistryDigest(input.registry);
  if (registryDigest !== input.expected_registry_digest) {
    findings.push(
      finding("registry_digest_stale", input.expected_registry_digest, `actual=${registryDigest}`),
    );
  }
  const derived = deriveVerificationObligations({
    registry: input.registry,
    authority_node_ids: input.authority_node_ids,
    changed_artifact_node_ids: input.changed_artifact_node_ids,
  });
  findings.push(...derived.findings.map(findingFromRegistry));

  const capabilities = new Map(
    input.registry.capabilities.map((capability) => [capability.capability_id, capability]),
  );
  const selected = new Set<string>();
  for (const ids of Object.values(derived.obligation_ids_by_class)) {
    for (const id of ids) selected.add(id);
  }
  for (const id of [
    ...input.changed_test_capability_ids,
    ...(input.compatibility_capability_ids ?? []),
  ]) {
    const capability = capabilities.get(id);
    if (capability?.status !== "active") {
      findings.push(finding("unknown_capability", id, "required selected capability"));
    } else {
      selected.add(id);
    }
  }

  const fallbackReasons = new Set<FullFallbackReason>();
  for (const reason of input.risk_signals) {
    if (FULL_REASON_SET.has(reason as FullFallbackReason)) {
      fallbackReasons.add(reason as FullFallbackReason);
    } else {
      findings.push(finding("unknown_risk_signal", reason, "risk signal is not registered"));
      fallbackReasons.add("unknown_identity");
    }
  }
  if (derived.findings.some((item) => item.code === "unknown_node")) {
    fallbackReasons.add("unknown_identity");
  }
  if (fallbackReasons.size > 0) {
    for (const id of activeCapabilityIds(input.registry)) selected.add(id);
  }

  const closed = dependencyClosure(input.registry, selected);
  for (const id of sortedUnique(input.required_obligation_ids)) {
    if (!closed.has(id)) {
      findings.push(finding("required_obligation_missing", id, "not present in selected closure"));
    }
  }
  const assignments = new Map<string, DeferredObligationAssignment>();
  for (const assignment of input.defer_assignments) {
    if (assignments.has(assignment.capability_id)) {
      findings.push(
        finding("duplicate_obligation", assignment.capability_id, "duplicate defer assignment"),
      );
      continue;
    }
    if (!closed.has(assignment.capability_id)) {
      findings.push(finding("defer_assignment_invalid", assignment.capability_id, "not selected"));
    }
    const capability = capabilities.get(assignment.capability_id);
    if (!capability?.defer_targets.includes(assignment.target)) {
      findings.push(
        finding(
          "defer_assignment_invalid",
          assignment.capability_id,
          `target_not_allowed:${assignment.target}`,
        ),
      );
      continue;
    }
    if (assignment.candidate_head !== input.candidate_head) {
      findings.push(
        finding(
          "deferred_receipt_invalid",
          assignment.capability_id,
          `candidate_head=${assignment.candidate_head}`,
        ),
      );
      continue;
    }
    if (
      assignment.receipt_status === "succeeded" &&
      !/^sha256:[a-f0-9]{64}$/.test(assignment.receipt_digest ?? "")
    ) {
      findings.push(
        finding("deferred_receipt_invalid", assignment.capability_id, "terminal digest required"),
      );
      continue;
    }
    if (assignment.receipt_status === "pending" && assignment.receipt_digest !== undefined) {
      findings.push(
        finding("deferred_receipt_invalid", assignment.capability_id, "pending receipt has digest"),
      );
      continue;
    }
    assignments.set(assignment.capability_id, assignment);
  }

  const partitions = partitionCapabilityIds(input.registry, closed);
  if (input.execution_context !== "release_candidate") {
    for (const id of partitions.release_only) {
      if (!assignments.has(id)) {
        findings.push(finding("defer_assignment_invalid", id, "release-only target is required"));
      }
    }
  }
  const deferred = [...assignments.values()]
    .filter((assignment) => closed.has(assignment.capability_id))
    .map((assignment) => ({ ...assignment }))
    .sort((a, b) => a.capability_id.localeCompare(b.capability_id));
  const deferredIds = new Set(deferred.map((item) => item.capability_id));
  const immediate = new Set([...closed].filter((id) => !deferredIds.has(id)));
  for (const id of immediate) {
    for (const dependency of capabilities.get(id)?.depends_on_capability_ids ?? []) {
      if (deferredIds.has(dependency)) {
        findings.push(finding("deferred_dependency_invalid", id, `dependency=${dependency}`));
      }
    }
  }
  const dag = [...immediate].sort().map((capability_id) => ({
    capability_id,
    depends_on_capability_ids: sortedUnique(
      (capabilities.get(capability_id)?.depends_on_capability_ids ?? []).filter((id) =>
        immediate.has(id),
      ),
    ),
  }));

  const base = {
    schema_version: CI_VERIFICATION_PLAN_SCHEMA,
    candidate_head: input.candidate_head,
    base_head: input.base_head,
    work_authority: input.work_authority,
    local_obligations: partitions.local.filter((id) => immediate.has(id)),
    boundary_obligations: partitions.boundary.filter((id) => immediate.has(id)),
    global_invariants: partitions.global_invariant.filter((id) => immediate.has(id)),
    deferred_obligations: deferred,
    execution_dag: dag,
    full_fallback_reasons: [...fallbackReasons].sort(),
    registry_digest: registryDigest,
    findings: findings.sort((a, b) =>
      `${a.code}:${a.subject}:${a.detail}`.localeCompare(`${b.code}:${b.subject}:${b.detail}`),
    ),
    ok: findings.length === 0,
  } satisfies Omit<CiVerificationPlan, "plan_digest">;
  return { ...base, plan_digest: digestPlan(base) };
}

/** 旧path-only decisionをinput-onlyでcapability identityへ変換し、旧test pathは再出力しない。 */
export function adaptLegacyImpactCiDecision(
  input: LegacyImpactCiAdapterInput,
): LegacyImpactCiAdapterResult {
  const findings: VerificationPlanFinding[] = [];
  const mapIds = (itemIds: readonly string[], target: "selected" | "deferred"): string[] => {
    const mapped: string[] = [];
    for (const itemId of itemIds) {
      const capabilityId = input.item_capability_map[itemId];
      if (!capabilityId) {
        findings.push(finding("unknown_capability", itemId, `legacy ${target} item`));
      } else {
        mapped.push(capabilityId);
      }
    }
    return sortedUnique(mapped);
  };
  const selected = mapIds(input.decision.selectedItemIds, "selected");
  const deferred = mapIds(input.decision.deferredItemIds, "deferred");
  const overlap = selected.filter((id) => deferred.includes(id));
  for (const id of overlap) findings.push(finding("duplicate_obligation", id, "legacy overlap"));
  return {
    candidate_head: input.decision.candidateHead,
    base_head: input.decision.baseHead,
    compatibility_capability_ids: sortedUnique([...selected, ...deferred]),
    defer_assignments: deferred.map((capability_id) => ({
      capability_id,
      target: "main",
      candidate_head: input.decision.candidateHead,
      receipt_status: "pending",
    })),
    risk_signals: input.decision.fullAdmissionRequired ? ["legacy_full_admission"] : [],
    findings,
  };
}
