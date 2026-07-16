import { createHash } from "node:crypto";

export const HARNESS_AGENT_CONTRACT_SCHEMA = "helix-agent-contract.v1" as const;

export type AgentRoleArchetype = "worker" | "verifier" | "consult";
export type AgentContractStatus = "registered" | "eligible" | "quarantined" | "retired";

export interface HarnessAgentContractV1 {
  schema_version: typeof HARNESS_AGENT_CONTRACT_SCHEMA;
  agent_id: string;
  contract_version: string;
  supersedes: string | null;
  capability_class: string;
  applicable_layers: string[];
  applicable_drives: string[];
  task_kinds: string[];
  verification_patterns: string[];
  role_archetype: AgentRoleArchetype;
  provider_policy_id: string;
  model_policy_id: string;
  context_pack_id: string;
  required_skills: string[];
  required_reads: string[];
  generates: string[];
  forbidden_paths: string[];
  blind_policy: "none" | "claim-blind" | "spec-blind";
  compatibility: string[];
  status: AgentContractStatus;
  source_digest: string;
}

export type AgentStandardFailureCode =
  | "HIL_AGENT_CONTRACT_INCOMPLETE"
  | "HIL_AGENT_RETIRED_RECLAIM"
  | "HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED"
  | "HIL_MUSTER_RESOLUTION_INVALID"
  | "HIL_AGENT_MUSTER_NO_ELIGIBLE"
  | "HIL_AGENT_MUSTER_NONDETERMINISTIC"
  | "HIL_AGENT_STATE_TRANSITION_INVALID"
  | "HIL_AGENT_LIFECYCLE_INVALID"
  | "HIL_AGENT_EVENT_SEQUENCE_INVALID"
  | "HIL_AGENT_CHECKPOINT_INVALID"
  | "HIL_AGENT_FENCING_REJECTED"
  | "HIL_AGENT_FENCING_VIOLATION"
  | "HIL_AGENT_LEASE_ALREADY_ACTIVE"
  | "HIL_AGENT_LEASE_EXPIRED"
  | "HIL_AGENT_BLIND_CONTEXT_LEAK"
  | "HIL_AGENT_VERIFIER_NOT_INDEPENDENT"
  | "HIL_ROLE_SEPARATION_VIOLATION";

export type AgentStandardResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: AgentStandardFailureCode; findings: string[] };

export interface HarnessAgentTaskV1 {
  task_identity_digest: string;
  plan_or_issue_id: string;
  layer: string;
  drive: string;
  task_kind: string;
  task_risk: string;
  capability_class: string;
  required_role: AgentRoleArchetype;
  compatibility: string;
}

export interface AgentAvailabilityV1 {
  provider_family: string;
  model_family: string;
  available: boolean;
}

export interface EligibleAgentV1 {
  contract: HarnessAgentContractV1;
  provider_family: string;
  model_family: string;
  context_digest: string;
}

export interface AgentMusterMemberV1 {
  member_index: number;
  agent_id: string;
  contract_version: string;
  role: AgentRoleArchetype;
  provider_family: string;
  model_family: string;
  context_digest: string;
  verification_pattern_digest: string;
}

export interface AgentMusterV1 {
  schema_version: "helix-agent-muster.v1";
  task_identity_digest: string;
  verification_patterns: string[];
  registry_snapshot_digest: string;
  policy_snapshot_digest: string;
  members: AgentMusterMemberV1[];
  team_digest: string;
}

export interface BlindAgentPacketV1 {
  schema_version: "helix-blind-agent-packet.v1";
  agent_id: string;
  frozen_input_digest: string;
  allowed_read_paths: string[];
  oracle_ids: string[];
  artifact_digests: string[];
  redacted_evidence_digests: string[];
  author_claim_count: 0;
  private_context_count: 0;
  packet_digest: string;
}

export interface AgentContractRevisionApprovalV1 {
  approval_digest: string;
  approved_agent_id: string;
  approved_candidate_version: string;
}

export interface AgentContractRevisionDecisionV1 {
  current_agent_id: string;
  current_version: string;
  candidate_version: string;
  supersedes: string;
  action: "register" | "reject" | "quarantine_supersession";
  approval_digest: string | null;
  pass: boolean;
  decision_digest: string;
}

export interface AgentMusterExpectationV1 {
  normalized_input_digest: string;
  registry_snapshot_digest: string;
  policy_snapshot_digest: string;
  verification_pattern_digest: string;
  member_set_digest: string;
  context_set_digest: string;
  expected_team_digest: string;
}

export interface AgentMusterComparisonReceiptV1 {
  normalized_input_digest: string;
  expected_member_set_digest: string;
  candidate_member_set_digest: string;
  expected_context_set_digest: string;
  candidate_context_set_digest: string;
  expected_team_digest: string;
  candidate_team_digest: string;
  equal: true;
  receipt_digest: string;
}

export type AgentLifecycleState =
  | "mustered"
  | "leased"
  | "running"
  | "checkpointed"
  | "completed"
  | "verification_pending"
  | "verified"
  | "released"
  | "failed"
  | "cancelled"
  | "quarantined"
  | "retired";

export interface AgentLifecycleInstanceSeedV1 {
  schema_version: "helix-agent-instance-seed.v1";
  instance_id: string;
  muster_id: string;
  member_index: number;
  contract_id: string;
  contract_revision: number;
  task_identity_digest: string;
  attempt: number;
  initial_state: "mustered";
  seed_digest: string;
}

export interface AgentLifecycleTransitionDecisionV1 {
  from_state: AgentLifecycleState;
  to_state: AgentLifecycleState;
  receipt_set_digest: string;
  prerequisite_failures: string[];
  allowed: boolean;
  failure_code: "HIL_AGENT_STATE_TRANSITION_INVALID" | "HIL_AGENT_LIFECYCLE_INVALID" | null;
  decision_digest: string;
}

export interface AgentLifecycleEventHeadV1 {
  instance_id: string;
  state: AgentLifecycleState;
  sequence: number;
  event_digest: string;
  operation_ids: string[];
}

export interface AgentLifecycleEventV1 {
  schema_version: "helix-agent-lifecycle-event.v1";
  instance_id: string;
  sequence: number;
  operation_id: string;
  from_state: AgentLifecycleState;
  to_state: AgentLifecycleState;
  fence: number;
  previous_event_digest: string;
  payload_digest: string;
  event_digest: string;
}

export interface AgentLeaseV1 {
  schema_version: "helix-agent-lease.v1";
  lease_id: string;
  instance_id: string;
  owner_session_id: string;
  owner_run_id: string;
  fence: number;
  acquired_at: string;
  heartbeat_at: string;
  expires_at: string;
  state: "active" | "released" | "expired" | "revoked";
}

export interface AgentLeaseAcquisitionBundleV1 {
  operation_id: string;
  payload_digest: string;
  instance_id: string;
  owner_id: string;
  expected_instance_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  expected_lease_head: string | null;
  next_fence: number;
  lease_row_digest: string;
  instance_state_fence_digest: string;
  transition_event_digest: string;
  projection_digest: string;
  receipt_digest: string;
}

export interface AgentLeaseAcquisitionReceiptV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: "lease_acquisition";
  instance_id: string;
  fence: number;
  before_event_head: string;
  after_event_head: string;
  before_projection_head: string;
  after_projection_head: string;
  write_set_digest: string;
  row_count_digest: string;
}

export type AgentLeaseAcquisitionResultV1 =
  | { ok: true; value: AgentLeaseAcquisitionReceiptV1 }
  | {
      ok: false;
      code: "HIL_AGENT_LEASE_ALREADY_ACTIVE" | "HIL_AGENT_LIFECYCLE_INVALID";
      findings: string[];
    };

export interface AgentLeaseAcquisitionStoreV1 {
  /** lease/event/projection/instance fence/receiptを一つのtransactionでCASする。 */
  commitLeaseAcquisition(
    bundle: AgentLeaseAcquisitionBundleV1,
  ): Promise<AgentLeaseAcquisitionResultV1>;
}

export interface LeaseLivenessDecisionV1 {
  lease_id: string;
  instance_id: string;
  owner_match: boolean;
  fence_match: boolean;
  heartbeat_current: boolean;
  expired: boolean;
  live: boolean;
  trusted_now: string;
  failure_code: "HIL_AGENT_LEASE_EXPIRED" | null;
  decision_digest: string;
}

export type AgentFencedOperationKind = "tool" | "checkpoint" | "artifact" | "completion" | "resume";

export interface FenceDecisionV1 {
  instance_id: string;
  lease_id: string;
  operation_kind: AgentFencedOperationKind;
  current_fence: number;
  operation_fence: number;
  accepted: boolean;
  failure_code: "HIL_AGENT_FENCING_REJECTED" | "HIL_AGENT_FENCING_VIOLATION" | null;
  decision_digest: string;
}

export interface AgentCheckpointInstanceV1 {
  instance_id: string;
  state: AgentLifecycleState;
  current_fence: number;
  checkpoint_sequence: number;
  contract_digest: string;
  input_digest: string;
  context_digest: string;
}

export interface AgentCheckpointPayloadV1 {
  schema_version: "helix-agent-checkpoint-state.v1";
  sequence: number;
  fence: number;
  contract_digest: string;
  input_digest: string;
  context_digest: string;
  state_digest: string;
}

export interface AgentArtifactManifestEntryV1 {
  schema_version: "helix-agent-artifact-manifest-entry.v1";
  relative_path: string;
  digest: string;
}

export interface AgentCheckpointV1 {
  schema_version: "helix-agent-checkpoint.v1";
  payload_schema_version: "helix-agent-checkpoint-state.v1";
  instance_id: string;
  lease_id: string;
  sequence: number;
  fence: number;
  contract_digest: string;
  input_digest: string;
  context_digest: string;
  state_digest: string;
  artifact_manifest_digest: string;
  state: "staged" | "durable" | "invalid" | "superseded";
  checkpoint_digest: string;
}

export type AgentCheckpointResultV1 =
  | { ok: true; value: AgentCheckpointV1 }
  | { ok: false; code: "HIL_AGENT_CHECKPOINT_INVALID"; findings: string[] };

export type AgentResumeCheckpointDecisionV1 =
  | { ok: true; checkpoint: AgentCheckpointV1; decision_digest: string }
  | {
      ok: false;
      code: "HIL_AGENT_CHECKPOINT_INVALID" | "HIL_AGENT_FENCING_VIOLATION";
      findings: string[];
      requires_new_instance: boolean;
      decision_digest: string;
    };

export interface AgentResultArtifactInputV1 {
  schema_version: "helix-agent-result-artifact.v1";
  relative_path: string;
  digest: string;
  fence: number;
  state: "staged";
}

export interface AgentResultArtifactAdmissionDecisionV1 {
  schema_version: "helix-agent-result-artifact-admission.v1";
  instance_id: string;
  relative_path: string;
  digest: string;
  fence: number;
  state: "admitted" | "rejected";
  admitted: boolean;
  acceptance_authority: false;
  terminal: false;
  verification_pending: true;
  failure_code: "HIL_AGENT_FENCING_REJECTED" | null;
  decision_digest: string;
}

export interface AgentVerificationSubjectV1 {
  schema_version: "helix-agent-verification-subject.v1";
  instance_id: string;
  role: "worker" | "verifier";
  provider_family: string;
  model_family: string;
}

export interface AgentVerificationResultV1 {
  schema_version: "helix-agent-verification-result.v1";
  worker_instance_id: string;
  oracle_id: string;
  input_digest: string;
  result_digest: string;
  evidence_digest: string;
  artifact_admission_decision_digest: string;
}

export interface AgentVerificationReceiptV1 {
  schema_version: "helix-agent-verification-receipt.v1";
  worker_instance_id: string;
  verifier_instance_id: string;
  oracle_id: string;
  input_digest: string;
  result_digest: string;
  evidence_digest: string;
  artifact_admission_decision_digest: string;
  receipt_state: "valid" | "stale" | "revoked";
  decision: "pass" | "fail" | "inconclusive";
  receipt_digest: string;
}

export interface AgentVerificationDecisionV1 {
  schema_version: "helix-agent-verification-decision.v1";
  worker_instance_id: string;
  verifier_instance_id: string;
  oracle_id: string;
  input_digest: string;
  result_digest: string;
  evidence_digest: string;
  artifact_admission_decision_digest: string;
  receipt_state: "valid" | "stale" | "revoked";
  decision: "pass" | "fail" | "inconclusive";
  accepted: boolean;
  release_authority: false;
  terminal: false;
  failure_code: "HIL_AGENT_VERIFIER_NOT_INDEPENDENT" | "HIL_ROLE_SEPARATION_VIOLATION" | null;
  decision_digest: string;
}

const CONTRACT_KEYS = [
  "schema_version",
  "agent_id",
  "contract_version",
  "supersedes",
  "capability_class",
  "applicable_layers",
  "applicable_drives",
  "task_kinds",
  "verification_patterns",
  "role_archetype",
  "provider_policy_id",
  "model_policy_id",
  "context_pack_id",
  "required_skills",
  "required_reads",
  "generates",
  "forbidden_paths",
  "blind_policy",
  "compatibility",
  "status",
  "source_digest",
] as const;

const ARRAY_KEYS = [
  "applicable_layers",
  "applicable_drives",
  "task_kinds",
  "verification_patterns",
  "required_skills",
  "required_reads",
  "generates",
  "forbidden_paths",
  "compatibility",
] as const;

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function semanticVersion(value: unknown): [number, number, number] | null {
  if (typeof value !== "string") return null;
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function versionIsAfter(candidate: string, current: string): boolean {
  const left = semanticVersion(candidate);
  const right = semanticVersion(current);
  if (!left || !right) return false;
  for (let index = 0; index < left.length; index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) return (left[index] ?? 0) > (right[index] ?? 0);
  }
  return false;
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function parseHarnessAgentContract(
  raw: unknown,
): AgentStandardResult<HarnessAgentContractV1> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, code: "HIL_AGENT_CONTRACT_INCOMPLETE", findings: ["contract_object"] };
  }
  const record = raw as Record<string, unknown>;
  const findings: string[] = [];
  for (const key of Object.keys(record)) {
    if (!(CONTRACT_KEYS as readonly string[]).includes(key)) findings.push(`unknown:${key}`);
  }
  const stringKeys = [
    "agent_id",
    "contract_version",
    "capability_class",
    "provider_policy_id",
    "model_policy_id",
    "context_pack_id",
    "source_digest",
  ] as const;
  for (const key of stringKeys) if (!nonEmptyString(record[key])) findings.push(`required:${key}`);
  for (const key of ARRAY_KEYS) {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => !nonEmptyString(item)))
      findings.push(`array:${key}`);
  }
  if (record.schema_version !== HARNESS_AGENT_CONTRACT_SCHEMA) findings.push("schema_version");
  if (!semanticVersion(record.contract_version)) findings.push("contract_version");
  if (typeof record.source_digest !== "string" || !/^[0-9a-f]{64}$/.test(record.source_digest))
    findings.push("source_digest");
  if (record.supersedes !== null && !nonEmptyString(record.supersedes)) findings.push("supersedes");
  if (!["worker", "verifier", "consult"].includes(String(record.role_archetype)))
    findings.push("role_archetype");
  if (!["none", "claim-blind", "spec-blind"].includes(String(record.blind_policy)))
    findings.push("blind_policy");
  if (!["registered", "eligible", "quarantined", "retired"].includes(String(record.status)))
    findings.push("status");
  if (findings.length > 0)
    return { ok: false, code: "HIL_AGENT_CONTRACT_INCOMPLETE", findings: sortedUnique(findings) };
  return { ok: true, value: raw as HarnessAgentContractV1 };
}

/** 同一agent/versionが異なるbytesを名乗るregistry equivocationを拒否する。 */
export function parseHarnessAgentRegistry(
  rawContracts: readonly unknown[],
): AgentStandardResult<HarnessAgentContractV1[]> {
  const parsed: HarnessAgentContractV1[] = [];
  const identityDigests = new Map<string, string>();
  const findings: string[] = [];
  for (const raw of rawContracts) {
    const result = parseHarnessAgentContract(raw);
    if (!result.ok) {
      findings.push(...result.findings);
      continue;
    }
    const key = `${result.value.agent_id}@${result.value.contract_version}`;
    const prior = identityDigests.get(key);
    if (prior && prior !== result.value.source_digest) findings.push(`identity_conflict:${key}`);
    else if (!prior) {
      identityDigests.set(key, result.value.source_digest);
      parsed.push(result.value);
    }
  }
  if (findings.length > 0)
    return { ok: false, code: "HIL_AGENT_CONTRACT_INCOMPLETE", findings: sortedUnique(findings) };
  return {
    ok: true,
    value: parsed.sort((left, right) =>
      `${left.agent_id}\0${left.contract_version}`.localeCompare(
        `${right.agent_id}\0${right.contract_version}`,
      ),
    ),
  };
}

export function resolveAgentContractSupersession(
  current: HarnessAgentContractV1,
  candidate: HarnessAgentContractV1,
  approval: AgentContractRevisionApprovalV1 | null,
): AgentStandardResult<AgentContractRevisionDecisionV1> {
  const commonInvalid =
    candidate.agent_id !== current.agent_id ||
    !versionIsAfter(candidate.contract_version, current.contract_version) ||
    candidate.supersedes !== current.contract_version;
  if (current.status === "retired")
    return { ok: false, code: "HIL_AGENT_RETIRED_RECLAIM", findings: ["retired_irreversible"] };
  const needsApproval = current.status === "quarantined";
  const approvalValid =
    approval !== null &&
    nonEmptyString(approval.approval_digest) &&
    approval.approved_agent_id === candidate.agent_id &&
    approval.approved_candidate_version === candidate.contract_version;
  if (needsApproval && !approvalValid)
    return {
      ok: false,
      code: "HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED",
      findings: ["approval_missing_or_mismatched"],
    };
  if (commonInvalid)
    return {
      ok: false,
      code: "HIL_AGENT_CONTRACT_INCOMPLETE",
      findings: ["supersession_chain"],
    };
  const payload = {
    current_agent_id: current.agent_id,
    current_version: current.contract_version,
    candidate_version: candidate.contract_version,
    supersedes: current.contract_version,
    action: needsApproval ? ("quarantine_supersession" as const) : ("register" as const),
    approval_digest: approvalValid ? approval.approval_digest : null,
    pass: true,
  };
  return { ok: true, value: { ...payload, decision_digest: digest(payload) } };
}

const VERIFICATION_PRESETS: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> =
  {
    "helix-verification.v1": {
      implementation: ["artifact-contract", "independent-verifier"],
      design: ["design-trace", "independent-verifier"],
      audit: ["evidence-replay", "independent-verifier"],
    },
  };

export function resolveAgentVerificationPatterns(
  taskKind: string,
  presetVersion: string,
  taskRisk: string,
): AgentStandardResult<{ pattern_ids: string[]; pattern_set_digest: string }> {
  const preset = VERIFICATION_PRESETS[presetVersion];
  const base = preset?.[taskKind];
  if (!base || !nonEmptyString(taskRisk)) {
    return {
      ok: false,
      code: "HIL_MUSTER_RESOLUTION_INVALID",
      findings: ["unknown_task_or_preset"],
    };
  }
  const pattern_ids = sortedUnique([
    ...base,
    ...(taskRisk === "high" ? ["adversarial-review"] : []),
  ]);
  return { ok: true, value: { pattern_ids, pattern_set_digest: digest(pattern_ids) } };
}

export function classifyAgentEligibility(
  contract: HarnessAgentContractV1,
  task: HarnessAgentTaskV1,
  patterns: readonly string[],
  availability: AgentAvailabilityV1,
): AgentStandardResult<EligibleAgentV1> {
  const failed: string[] = [];
  if (contract.status !== "eligible") failed.push("status");
  if (!contract.applicable_layers.includes(task.layer)) failed.push("layer");
  if (!contract.applicable_drives.includes(task.drive)) failed.push("drive");
  if (!contract.task_kinds.includes(task.task_kind)) failed.push("task_kind");
  if (!patterns.every((pattern) => contract.verification_patterns.includes(pattern)))
    failed.push("verification_patterns");
  if (contract.capability_class !== task.capability_class) failed.push("capability_class");
  if (contract.role_archetype !== task.required_role) failed.push("role");
  if (!contract.compatibility.includes(task.compatibility)) failed.push("compatibility");
  if (!availability.available) failed.push("provider_unavailable");
  if (failed.length > 0)
    return { ok: false, code: "HIL_AGENT_MUSTER_NO_ELIGIBLE", findings: failed };
  return {
    ok: true,
    value: {
      contract,
      provider_family: availability.provider_family,
      model_family: availability.model_family,
      context_digest: digest([
        contract.context_pack_id,
        contract.required_skills,
        contract.required_reads,
      ]),
    },
  };
}

export function resolveDeterministicAgentMuster(
  task: HarnessAgentTaskV1,
  patterns: readonly string[],
  eligible: readonly EligibleAgentV1[],
  authority: { registry_snapshot_digest: string; policy_snapshot_digest: string } = {
    registry_snapshot_digest: digest([]),
    policy_snapshot_digest: digest([]),
  },
): AgentStandardResult<AgentMusterV1> {
  const workers = eligible.filter((entry) => entry.contract.role_archetype === "worker");
  const verifiers = eligible.filter((entry) => entry.contract.role_archetype === "verifier");
  const rank = (left: EligibleAgentV1, right: EligibleAgentV1) =>
    [
      left.contract.agent_id,
      left.contract.contract_version,
      left.provider_family,
      left.model_family,
    ]
      .join("\0")
      .localeCompare(
        [
          right.contract.agent_id,
          right.contract.contract_version,
          right.provider_family,
          right.model_family,
        ].join("\0"),
      );
  const worker = [...workers].sort(rank)[0];
  const verifier = [...verifiers]
    .sort(rank)
    .find(
      (candidate) =>
        candidate.provider_family !== worker?.provider_family &&
        candidate.model_family !== worker?.model_family,
    );
  if (!worker || !verifier) {
    return { ok: false, code: "HIL_AGENT_MUSTER_NO_ELIGIBLE", findings: ["worker_verifier_pair"] };
  }
  const verificationPatternDigest = digest(sortedUnique([...patterns]));
  const members = [worker, verifier].map((entry, member_index) => ({
    member_index,
    agent_id: entry.contract.agent_id,
    contract_version: entry.contract.contract_version,
    role: entry.contract.role_archetype,
    provider_family: entry.provider_family,
    model_family: entry.model_family,
    context_digest: entry.context_digest,
    verification_pattern_digest: verificationPatternDigest,
  }));
  const verification_patterns = sortedUnique([...patterns]);
  return {
    ok: true,
    value: {
      schema_version: "helix-agent-muster.v1",
      task_identity_digest: task.task_identity_digest,
      verification_patterns,
      registry_snapshot_digest: authority.registry_snapshot_digest,
      policy_snapshot_digest: authority.policy_snapshot_digest,
      members,
      team_digest: digest([
        task.task_identity_digest,
        verification_patterns,
        authority.registry_snapshot_digest,
        authority.policy_snapshot_digest,
        members,
      ]),
    },
  };
}

export function compareAgentMusterRerun(
  expected: AgentMusterExpectationV1,
  normalizedInputDigest: string,
  candidate: AgentMusterV1,
): AgentStandardResult<AgentMusterComparisonReceiptV1> {
  const memberSetDigest = digest(candidate.members);
  const contextSetDigest = digest(candidate.members.map((member) => member.context_digest));
  const patternDigest = digest(candidate.verification_patterns);
  const findings: string[] = [];
  if (expected.normalized_input_digest !== normalizedInputDigest) findings.push("normalized_input");
  if (expected.registry_snapshot_digest !== candidate.registry_snapshot_digest)
    findings.push("registry_snapshot");
  if (expected.policy_snapshot_digest !== candidate.policy_snapshot_digest)
    findings.push("policy_snapshot");
  if (expected.verification_pattern_digest !== patternDigest) findings.push("patterns");
  if (expected.member_set_digest !== memberSetDigest) findings.push("members");
  if (expected.context_set_digest !== contextSetDigest) findings.push("contexts");
  if (expected.expected_team_digest !== candidate.team_digest) findings.push("team");
  if (findings.length > 0)
    return {
      ok: false,
      code: "HIL_AGENT_MUSTER_NONDETERMINISTIC",
      findings: sortedUnique(findings),
    };
  const payload = {
    normalized_input_digest: normalizedInputDigest,
    expected_member_set_digest: expected.member_set_digest,
    candidate_member_set_digest: memberSetDigest,
    expected_context_set_digest: expected.context_set_digest,
    candidate_context_set_digest: contextSetDigest,
    expected_team_digest: expected.expected_team_digest,
    candidate_team_digest: candidate.team_digest,
    equal: true as const,
  };
  return { ok: true, value: { ...payload, receipt_digest: digest(payload) } };
}

export function buildBlindAgentPacket(input: {
  contract: HarnessAgentContractV1;
  frozen_input_digest: string;
  allowed_read_paths: string[];
  oracle_ids: string[];
  artifact_digests: string[];
  redacted_evidence_digests: string[];
  author_context?: {
    author_claims?: string[];
    chat_context?: string[];
    worker_reasoning?: string[];
  };
}): AgentStandardResult<BlindAgentPacketV1> {
  const context = input.author_context;
  if (
    input.contract.blind_policy !== "none" &&
    ((context?.author_claims?.length ?? 0) > 0 ||
      (context?.chat_context?.length ?? 0) > 0 ||
      (context?.worker_reasoning?.length ?? 0) > 0)
  ) {
    return {
      ok: false,
      code: "HIL_AGENT_BLIND_CONTEXT_LEAK",
      findings: ["author_private_context"],
    };
  }
  const payload = {
    schema_version: "helix-blind-agent-packet.v1" as const,
    agent_id: input.contract.agent_id,
    frozen_input_digest: input.frozen_input_digest,
    allowed_read_paths: sortedUnique(input.allowed_read_paths),
    oracle_ids: sortedUnique(input.oracle_ids),
    artifact_digests: sortedUnique(input.artifact_digests),
    redacted_evidence_digests: sortedUnique(input.redacted_evidence_digests),
    author_claim_count: 0 as const,
    private_context_count: 0 as const,
  };
  return { ok: true, value: { ...payload, packet_digest: digest(payload) } };
}

export function enforceAgentRoleSeparation(
  worker: AgentMusterMemberV1,
  verifier: AgentMusterMemberV1,
): AgentStandardResult<true> {
  if (
    worker.role !== "worker" ||
    verifier.role !== "verifier" ||
    worker.agent_id === verifier.agent_id
  ) {
    return { ok: false, code: "HIL_ROLE_SEPARATION_VIOLATION", findings: ["role_or_identity"] };
  }
  if (
    worker.provider_family === verifier.provider_family ||
    worker.model_family === verifier.model_family
  ) {
    return {
      ok: false,
      code: "HIL_AGENT_VERIFIER_NOT_INDEPENDENT",
      findings: ["provider_or_model_family"],
    };
  }
  return { ok: true, value: true };
}

/** Seedは実行権限を持たず、同じmuster/member/task/attemptから同じidentityだけを導出する。 */
export function createAgentLifecycleInstance(
  muster: AgentMusterV1,
  member: AgentMusterMemberV1,
  contract: HarnessAgentContractV1,
  task: HarnessAgentTaskV1,
  attempt: number,
): AgentStandardResult<AgentLifecycleInstanceSeedV1> {
  const version = semanticVersion(contract.contract_version);
  if (
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    !version ||
    member.agent_id !== contract.agent_id ||
    member.contract_version !== contract.contract_version ||
    muster.task_identity_digest !== task.task_identity_digest ||
    muster.members[member.member_index]?.agent_id !== member.agent_id
  ) {
    return { ok: false, code: "HIL_AGENT_LIFECYCLE_INVALID", findings: ["seed_binding"] };
  }
  const contractRevision = version[0] * 1_000_000 + version[1] * 1_000 + version[2];
  const identity = [
    muster.team_digest,
    member.member_index,
    contract.agent_id,
    contractRevision,
    task.task_identity_digest,
    attempt,
  ];
  const payload = {
    schema_version: "helix-agent-instance-seed.v1" as const,
    instance_id: digest(identity),
    muster_id: muster.team_digest,
    member_index: member.member_index,
    contract_id: contract.agent_id,
    contract_revision: contractRevision,
    task_identity_digest: task.task_identity_digest,
    attempt,
    initial_state: "mustered" as const,
  };
  return { ok: true, value: { ...payload, seed_digest: digest(payload) } };
}

const LIFECYCLE_EDGES: Readonly<Record<AgentLifecycleState, readonly AgentLifecycleState[]>> = {
  mustered: ["leased", "quarantined"],
  leased: ["running", "quarantined"],
  running: ["checkpointed", "completed", "failed", "cancelled", "quarantined"],
  checkpointed: ["running", "completed", "failed", "cancelled", "quarantined"],
  completed: ["verification_pending", "quarantined"],
  verification_pending: ["verified", "quarantined"],
  verified: ["released", "quarantined"],
  released: ["retired", "quarantined"],
  failed: ["quarantined"],
  cancelled: ["quarantined"],
  quarantined: ["retired"],
  retired: [],
};

export function validateAgentLifecycleTransition(
  current: AgentLifecycleState,
  next: AgentLifecycleState,
  receiptSet: readonly string[],
): AgentLifecycleTransitionDecisionV1 {
  const receipts = sortedUnique([...receiptSet]);
  const prerequisiteFailures: string[] = [];
  const requiredReceipt =
    next === "verification_pending"
      ? "result_accepted"
      : next === "verified"
        ? "verification_pass"
        : next === "released"
          ? "release_authorized"
          : null;
  if (requiredReceipt && !receipts.includes(requiredReceipt))
    prerequisiteFailures.push(requiredReceipt);
  const legalEdge = LIFECYCLE_EDGES[current].includes(next);
  const allowed = legalEdge && prerequisiteFailures.length === 0;
  const failureCode = !legalEdge
    ? ("HIL_AGENT_STATE_TRANSITION_INVALID" as const)
    : prerequisiteFailures.length > 0
      ? ("HIL_AGENT_LIFECYCLE_INVALID" as const)
      : null;
  const payload = {
    from_state: current,
    to_state: next,
    receipt_set_digest: digest(receipts),
    prerequisite_failures: prerequisiteFailures,
    allowed,
    failure_code: failureCode,
  };
  return { ...payload, decision_digest: digest(payload) };
}

export function appendAgentLifecycleEvent(
  head: AgentLifecycleEventHeadV1,
  operation: { operation_id: string; expected_sequence: number; payload_digest: string },
  transition: AgentLifecycleTransitionDecisionV1,
  fence: number,
): AgentStandardResult<AgentLifecycleEventV1> {
  const findings: string[] = [];
  if (!transition.allowed || transition.from_state !== head.state) findings.push("transition");
  if (operation.expected_sequence !== head.sequence + 1) findings.push("sequence");
  if (
    !nonEmptyString(operation.operation_id) ||
    head.operation_ids.includes(operation.operation_id)
  )
    findings.push("operation_id");
  if (!nonEmptyString(operation.payload_digest)) findings.push("payload_digest");
  if (!Number.isSafeInteger(fence) || fence < 0) findings.push("fence");
  if (!nonEmptyString(head.event_digest)) findings.push("previous_event_digest");
  if (findings.length > 0)
    return {
      ok: false,
      code: "HIL_AGENT_EVENT_SEQUENCE_INVALID",
      findings: sortedUnique(findings),
    };
  const payload = {
    schema_version: "helix-agent-lifecycle-event.v1" as const,
    instance_id: head.instance_id,
    sequence: operation.expected_sequence,
    operation_id: operation.operation_id,
    from_state: transition.from_state,
    to_state: transition.to_state,
    fence,
    previous_event_digest: head.event_digest,
    payload_digest: operation.payload_digest,
  };
  return { ok: true, value: { ...payload, event_digest: digest(payload) } };
}

/**
 * Acquisitionのwrite setを分解せず、保存層の単一CAS transactionへそのまま渡す。
 * この関数自身はleaseの存在確認やfence採番をread-then-writeで行わない。
 */
export async function acquireAgentLease(
  bundle: AgentLeaseAcquisitionBundleV1,
  store: AgentLeaseAcquisitionStoreV1,
): Promise<AgentLeaseAcquisitionResultV1> {
  const strings = [
    bundle.operation_id,
    bundle.payload_digest,
    bundle.instance_id,
    bundle.owner_id,
    bundle.expected_event_head,
    bundle.expected_projection_head,
    bundle.lease_row_digest,
    bundle.instance_state_fence_digest,
    bundle.transition_event_digest,
    bundle.projection_digest,
    bundle.receipt_digest,
  ];
  const validRevision =
    Number.isSafeInteger(bundle.expected_instance_revision) &&
    bundle.expected_instance_revision >= 0;
  const validFence = Number.isSafeInteger(bundle.next_fence) && bundle.next_fence > 0;
  if (
    strings.some((value) => !nonEmptyString(value)) ||
    !validRevision ||
    !validFence ||
    (bundle.expected_lease_head !== null && !nonEmptyString(bundle.expected_lease_head))
  ) {
    return {
      ok: false,
      code: "HIL_AGENT_LIFECYCLE_INVALID",
      findings: ["lease_acquisition_bundle"],
    };
  }
  return store.commitLeaseAcquisition(bundle);
}

export function evaluateAgentLeaseLiveness(
  lease: AgentLeaseV1,
  owner: { session_id: string; run_id: string },
  fence: number,
  trustedNow: string,
): LeaseLivenessDecisionV1 {
  const acquiredAt = Date.parse(lease.acquired_at);
  const heartbeatAt = Date.parse(lease.heartbeat_at);
  const expiresAt = Date.parse(lease.expires_at);
  const now = Date.parse(trustedNow);
  const validTimeline =
    [acquiredAt, heartbeatAt, expiresAt, now].every(Number.isFinite) &&
    acquiredAt <= heartbeatAt &&
    heartbeatAt <= now &&
    acquiredAt < expiresAt;
  const ownerMatch =
    owner.session_id === lease.owner_session_id && owner.run_id === lease.owner_run_id;
  const fenceMatch = Number.isSafeInteger(fence) && fence === lease.fence;
  const heartbeatCurrent = validTimeline && heartbeatAt < expiresAt && now < expiresAt;
  const expired = !validTimeline || now >= expiresAt || lease.state !== "active";
  const live = ownerMatch && fenceMatch && heartbeatCurrent && !expired;
  const payload = {
    lease_id: lease.lease_id,
    instance_id: lease.instance_id,
    owner_match: ownerMatch,
    fence_match: fenceMatch,
    heartbeat_current: heartbeatCurrent,
    expired,
    live,
    trusted_now: trustedNow,
    failure_code: expired ? ("HIL_AGENT_LEASE_EXPIRED" as const) : null,
  };
  return { ...payload, decision_digest: digest(payload) };
}

export function fenceAgentOperation(
  instanceId: string,
  lease: AgentLeaseV1,
  operationFence: number,
  operationKind: AgentFencedOperationKind,
): FenceDecisionV1 {
  const accepted =
    nonEmptyString(instanceId) &&
    instanceId === lease.instance_id &&
    lease.state === "active" &&
    Number.isSafeInteger(operationFence) &&
    operationFence === lease.fence;
  const failureCode = accepted
    ? null
    : operationKind === "completion"
      ? ("HIL_AGENT_FENCING_REJECTED" as const)
      : ("HIL_AGENT_FENCING_VIOLATION" as const);
  const payload = {
    instance_id: instanceId,
    lease_id: lease.lease_id,
    operation_kind: operationKind,
    current_fence: lease.fence,
    operation_fence: operationFence,
    accepted,
    failure_code: failureCode,
  };
  return { ...payload, decision_digest: digest(payload) };
}

function validAgentRelativePath(value: string): boolean {
  if (!nonEmptyString(value) || value.startsWith("/") || value.startsWith("\\")) return false;
  const parts = value.replaceAll("\\", "/").split("/");
  return (
    !/^[A-Za-z]:/.test(value) && parts.every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function validEvidenceDigest(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value);
}

function canonicalAgentEvidence(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalAgentEvidence).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalAgentEvidence(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function agentEvidenceDigest(value: unknown): string {
  return createHash("sha256").update(canonicalAgentEvidence(value)).digest("hex");
}

function hasExactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function checkpointPreimage(checkpoint: Omit<AgentCheckpointV1, "checkpoint_digest">): unknown {
  return checkpoint;
}

export function sealDurableAgentCheckpoint(
  instance: AgentCheckpointInstanceV1,
  lease: AgentLeaseV1,
  payload: AgentCheckpointPayloadV1,
  artifactManifest: readonly AgentArtifactManifestEntryV1[],
): AgentCheckpointResultV1 {
  const findings: string[] = [];
  if (
    ![instance.contract_digest, instance.input_digest, instance.context_digest].every(
      validEvidenceDigest,
    )
  )
    findings.push("instance_binding_digest");
  if (
    !hasExactKeys(payload, [
      "schema_version",
      "sequence",
      "fence",
      "contract_digest",
      "input_digest",
      "context_digest",
      "state_digest",
    ])
  )
    return {
      ok: false,
      code: "HIL_AGENT_CHECKPOINT_INVALID",
      findings: ["payload_schema"],
    };
  if (
    lease.state !== "active" ||
    lease.instance_id !== instance.instance_id ||
    lease.fence !== instance.current_fence
  )
    findings.push("lease_fence");
  if (payload.schema_version !== "helix-agent-checkpoint-state.v1") findings.push("schema_version");
  if (
    !Number.isSafeInteger(payload.sequence) ||
    payload.sequence !== instance.checkpoint_sequence + 1
  )
    findings.push("sequence");
  if (payload.fence !== instance.current_fence || payload.fence !== lease.fence)
    findings.push("fence");
  for (const key of ["contract_digest", "input_digest", "context_digest"] as const) {
    if (!validEvidenceDigest(payload[key]) || payload[key] !== instance[key]) findings.push(key);
  }
  if (!validEvidenceDigest(payload.state_digest)) findings.push("state_digest");
  const normalizedManifest = [...artifactManifest]
    .map((entry) => ({
      schema_version: entry.schema_version,
      relative_path: entry.relative_path,
      digest: entry.digest,
      ...Object.fromEntries(
        Object.entries(entry).filter(
          ([key]) => !["schema_version", "relative_path", "digest"].includes(key),
        ),
      ),
    }))
    .sort((left, right) => left.relative_path.localeCompare(right.relative_path));
  if (
    normalizedManifest.some(
      (entry) =>
        !hasExactKeys(entry, ["schema_version", "relative_path", "digest"]) ||
        entry.schema_version !== "helix-agent-artifact-manifest-entry.v1" ||
        !validAgentRelativePath(entry.relative_path) ||
        !validEvidenceDigest(entry.digest),
    ) ||
    new Set(normalizedManifest.map((entry) => entry.relative_path)).size !==
      normalizedManifest.length
  )
    findings.push("artifact_manifest");
  if (findings.length > 0)
    return {
      ok: false,
      code: "HIL_AGENT_CHECKPOINT_INVALID",
      findings: sortedUnique(findings),
    };
  const sealed = {
    schema_version: "helix-agent-checkpoint.v1" as const,
    payload_schema_version: payload.schema_version,
    instance_id: instance.instance_id,
    lease_id: lease.lease_id,
    sequence: payload.sequence,
    fence: payload.fence,
    contract_digest: payload.contract_digest,
    input_digest: payload.input_digest,
    context_digest: payload.context_digest,
    state_digest: payload.state_digest,
    artifact_manifest_digest: digest(normalizedManifest),
    state: "durable" as const,
  };
  return {
    ok: true,
    value: { ...sealed, checkpoint_digest: digest(checkpointPreimage(sealed)) },
  };
}

function checkpointHasClosedShape(checkpoint: AgentCheckpointV1): boolean {
  const exactKeys = hasExactKeys(checkpoint, [
    "schema_version",
    "payload_schema_version",
    "instance_id",
    "lease_id",
    "sequence",
    "fence",
    "contract_digest",
    "input_digest",
    "context_digest",
    "state_digest",
    "artifact_manifest_digest",
    "state",
    "checkpoint_digest",
  ]);
  return (
    exactKeys &&
    checkpoint.schema_version === "helix-agent-checkpoint.v1" &&
    checkpoint.payload_schema_version === "helix-agent-checkpoint-state.v1" &&
    nonEmptyString(checkpoint.instance_id) &&
    nonEmptyString(checkpoint.lease_id) &&
    Number.isSafeInteger(checkpoint.sequence) &&
    checkpoint.sequence >= 1 &&
    Number.isSafeInteger(checkpoint.fence) &&
    checkpoint.fence >= 0 &&
    ["staged", "durable", "invalid", "superseded"].includes(checkpoint.state) &&
    [
      checkpoint.contract_digest,
      checkpoint.input_digest,
      checkpoint.context_digest,
      checkpoint.state_digest,
      checkpoint.artifact_manifest_digest,
      checkpoint.checkpoint_digest,
    ].every(validEvidenceDigest)
  );
}

function checkpointDigestIsValid(checkpoint: AgentCheckpointV1): boolean {
  if (!checkpointHasClosedShape(checkpoint)) return false;
  const { checkpoint_digest: checkpointDigest, ...preimage } = checkpoint;
  return (
    validEvidenceDigest(checkpointDigest) &&
    digest(checkpointPreimage(preimage)) === checkpointDigest
  );
}

export function resolveAgentResumeCheckpoint(
  instance: AgentCheckpointInstanceV1,
  lease: AgentLeaseV1,
  checkpoints: readonly AgentCheckpointV1[],
  currentInput: Pick<
    AgentCheckpointInstanceV1,
    "contract_digest" | "input_digest" | "context_digest"
  >,
): AgentResumeCheckpointDecisionV1 {
  const fail = (
    code: "HIL_AGENT_CHECKPOINT_INVALID" | "HIL_AGENT_FENCING_VIOLATION",
    findings: string[],
    requiresNewInstance = false,
  ): AgentResumeCheckpointDecisionV1 => {
    const payload = {
      code,
      findings: sortedUnique(findings),
      requires_new_instance: requiresNewInstance,
    };
    return { ok: false, ...payload, decision_digest: digest(payload) };
  };
  if (
    lease.state !== "active" ||
    lease.instance_id !== instance.instance_id ||
    lease.fence !== instance.current_fence
  )
    return fail("HIL_AGENT_FENCING_VIOLATION", ["current_lease_fence"]);
  if (
    ![instance.contract_digest, instance.input_digest, instance.context_digest].every(
      validEvidenceDigest,
    ) ||
    ![currentInput.contract_digest, currentInput.input_digest, currentInput.context_digest].every(
      validEvidenceDigest,
    )
  )
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["current_input_digest"], true);
  if (
    instance.contract_digest !== currentInput.contract_digest ||
    instance.input_digest !== currentInput.input_digest ||
    instance.context_digest !== currentInput.context_digest
  )
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["instance_input_binding_drift"], true);
  if (checkpoints.some((checkpoint) => !checkpointHasClosedShape(checkpoint)))
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["checkpoint_schema"]);
  const durable = checkpoints.filter((checkpoint) => checkpoint.state === "durable");
  if (
    durable.some(
      (checkpoint) =>
        checkpoint.instance_id !== instance.instance_id ||
        checkpoint.lease_id !== lease.lease_id ||
        checkpoint.fence !== lease.fence,
    )
  )
    return fail("HIL_AGENT_FENCING_VIOLATION", ["foreign_or_old_fence_checkpoint"]);
  const currentFence = durable.filter(
    (checkpoint) =>
      checkpoint.instance_id === instance.instance_id &&
      checkpoint.lease_id === lease.lease_id &&
      checkpoint.fence === lease.fence,
  );
  if (currentFence.length === 0 && durable.length > 0)
    return fail("HIL_AGENT_FENCING_VIOLATION", ["checkpoint_fence"]);
  if (currentFence.length === 0) return fail("HIL_AGENT_CHECKPOINT_INVALID", ["durable_missing"]);
  if (currentFence.some((checkpoint) => !checkpointDigestIsValid(checkpoint)))
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["checkpoint_digest"]);
  const bindingDrift = currentFence.some(
    (checkpoint) =>
      checkpoint.contract_digest !== currentInput.contract_digest ||
      checkpoint.input_digest !== currentInput.input_digest ||
      checkpoint.context_digest !== currentInput.context_digest,
  );
  if (bindingDrift) return fail("HIL_AGENT_CHECKPOINT_INVALID", ["input_binding_drift"], true);
  const sequences = currentFence.map((checkpoint) => checkpoint.sequence);
  if (
    sequences.some((sequence) => !Number.isSafeInteger(sequence) || sequence < 1) ||
    new Set(sequences).size !== sequences.length
  )
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["checkpoint_sequence"]);
  const expectedSequences = Array.from(
    { length: instance.checkpoint_sequence },
    (_, index) => index + 1,
  );
  if (
    sequences.length !== expectedSequences.length ||
    [...sequences]
      .sort((left, right) => left - right)
      .some((sequence, index) => sequence !== expectedSequences[index])
  )
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["checkpoint_sequence_gap"]);
  const checkpoint = [...currentFence].sort((left, right) => right.sequence - left.sequence)[0];
  if (!checkpoint) return fail("HIL_AGENT_CHECKPOINT_INVALID", ["durable_missing"]);
  if (checkpoint.sequence !== instance.checkpoint_sequence)
    return fail("HIL_AGENT_CHECKPOINT_INVALID", ["committed_sequence_mismatch"]);
  const payload = {
    checkpoint_digest: checkpoint.checkpoint_digest,
    sequence: checkpoint.sequence,
  };
  return { ok: true, checkpoint, decision_digest: digest(payload) };
}

export function admitAgentResultArtifact(
  instance: { instance_id: string; state: AgentLifecycleState; current_fence: number },
  lease: AgentLeaseV1,
  artifact: AgentResultArtifactInputV1,
): AgentResultArtifactAdmissionDecisionV1 {
  const admitted =
    hasExactKeys(artifact, ["schema_version", "relative_path", "digest", "fence", "state"]) &&
    artifact.schema_version === "helix-agent-result-artifact.v1" &&
    instance.state === "completed" &&
    lease.state === "active" &&
    lease.instance_id === instance.instance_id &&
    lease.fence === instance.current_fence &&
    artifact.fence === instance.current_fence &&
    artifact.state === "staged" &&
    validAgentRelativePath(artifact.relative_path) &&
    validEvidenceDigest(artifact.digest);
  const payload = {
    schema_version: "helix-agent-result-artifact-admission.v1" as const,
    instance_id: instance.instance_id,
    relative_path: artifact.relative_path,
    digest: artifact.digest,
    fence: artifact.fence,
    state: admitted ? ("admitted" as const) : ("rejected" as const),
    admitted,
    acceptance_authority: false as const,
    terminal: false as const,
    verification_pending: true as const,
    failure_code: admitted ? null : ("HIL_AGENT_FENCING_REJECTED" as const),
  };
  return { ...payload, decision_digest: digest(payload) };
}

export function evaluateAgentVerificationReceipt(
  worker: AgentVerificationSubjectV1,
  verifier: AgentVerificationSubjectV1,
  result: AgentVerificationResultV1,
  receipt: AgentVerificationReceiptV1,
): AgentVerificationDecisionV1 {
  const workerShape =
    hasExactKeys(worker, [
      "schema_version",
      "instance_id",
      "role",
      "provider_family",
      "model_family",
    ]) &&
    worker.schema_version === "helix-agent-verification-subject.v1" &&
    worker.role === "worker";
  const verifierShape =
    hasExactKeys(verifier, [
      "schema_version",
      "instance_id",
      "role",
      "provider_family",
      "model_family",
    ]) &&
    verifier.schema_version === "helix-agent-verification-subject.v1" &&
    verifier.role === "verifier";
  const independent =
    workerShape &&
    verifierShape &&
    nonEmptyString(worker.instance_id) &&
    nonEmptyString(verifier.instance_id) &&
    worker.instance_id !== verifier.instance_id &&
    nonEmptyString(worker.provider_family) &&
    nonEmptyString(verifier.provider_family) &&
    worker.provider_family !== verifier.provider_family &&
    nonEmptyString(worker.model_family) &&
    nonEmptyString(verifier.model_family) &&
    worker.model_family !== verifier.model_family;
  const resultShape =
    hasExactKeys(result, [
      "schema_version",
      "worker_instance_id",
      "oracle_id",
      "input_digest",
      "result_digest",
      "evidence_digest",
      "artifact_admission_decision_digest",
    ]) &&
    result.schema_version === "helix-agent-verification-result.v1" &&
    nonEmptyString(result.oracle_id) &&
    [
      result.input_digest,
      result.result_digest,
      result.evidence_digest,
      result.artifact_admission_decision_digest,
    ].every(validEvidenceDigest);
  const receiptShape =
    hasExactKeys(receipt, [
      "schema_version",
      "worker_instance_id",
      "verifier_instance_id",
      "oracle_id",
      "input_digest",
      "result_digest",
      "evidence_digest",
      "artifact_admission_decision_digest",
      "receipt_state",
      "decision",
      "receipt_digest",
    ]) &&
    receipt.schema_version === "helix-agent-verification-receipt.v1" &&
    ["valid", "stale", "revoked"].includes(receipt.receipt_state) &&
    ["pass", "fail", "inconclusive"].includes(receipt.decision) &&
    [
      receipt.input_digest,
      receipt.result_digest,
      receipt.evidence_digest,
      receipt.artifact_admission_decision_digest,
    ].every(validEvidenceDigest) &&
    validEvidenceDigest(receipt.receipt_digest);
  let receiptDigestValid = false;
  if (receiptShape) {
    const { receipt_digest: receiptDigest, ...preimage } = receipt;
    receiptDigestValid = agentEvidenceDigest(preimage) === receiptDigest;
  }
  const bindingValid =
    workerShape &&
    verifierShape &&
    resultShape &&
    receiptShape &&
    result.worker_instance_id === worker.instance_id &&
    receipt.worker_instance_id === worker.instance_id &&
    receipt.verifier_instance_id === verifier.instance_id &&
    receipt.oracle_id === result.oracle_id &&
    receipt.input_digest === result.input_digest &&
    receipt.result_digest === result.result_digest &&
    receipt.evidence_digest === result.evidence_digest &&
    receipt.artifact_admission_decision_digest === result.artifact_admission_decision_digest;
  const accepted =
    independent &&
    bindingValid &&
    receiptDigestValid &&
    receipt.receipt_state === "valid" &&
    receipt.decision === "pass";
  const sameProviderOrModel =
    workerShape &&
    verifierShape &&
    (worker.provider_family === verifier.provider_family ||
      worker.model_family === verifier.model_family);
  const failureCode = accepted
    ? null
    : sameProviderOrModel
      ? ("HIL_AGENT_VERIFIER_NOT_INDEPENDENT" as const)
      : ("HIL_ROLE_SEPARATION_VIOLATION" as const);
  const payload = {
    schema_version: "helix-agent-verification-decision.v1" as const,
    worker_instance_id: workerShape ? worker.instance_id : "invalid",
    verifier_instance_id: verifierShape ? verifier.instance_id : "invalid",
    oracle_id: resultShape ? result.oracle_id : "invalid",
    input_digest: resultShape ? result.input_digest : "invalid",
    result_digest: resultShape ? result.result_digest : "invalid",
    evidence_digest: resultShape ? result.evidence_digest : "invalid",
    artifact_admission_decision_digest: resultShape
      ? result.artifact_admission_decision_digest
      : "invalid",
    receipt_state: receiptShape ? receipt.receipt_state : ("revoked" as const),
    decision: receiptShape ? receipt.decision : ("inconclusive" as const),
    accepted,
    release_authority: false as const,
    terminal: false as const,
    failure_code: failureCode,
  };
  return { ...payload, decision_digest: digest(payload) };
}
