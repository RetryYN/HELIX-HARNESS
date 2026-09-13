export const CURSOR_CLOUD_ASSIGNMENT_SCHEMA_VERSION = "cursor-cloud-assignment.v1" as const;

export type CursorCloudAssignmentV1 = {
  schema_version: typeof CURSOR_CLOUD_ASSIGNMENT_SCHEMA_VERSION;
  repository: string;
  assignment_id: string;
  action_id: string;
  owner: string;
  issued_at: string;
  expires_at: string;
  generation: number;
  scope_kind: "issue" | "plan";
  issue_number?: number;
  plan_id?: string;
  requirement_ids: string[];
  test_ids: string[];
  responsibility_owner: string;
  branch: string;
  base_head: string;
  allowed_paths: string[];
  forbidden_paths: string[];
  context_digest: string;
  policy_digest: string;
  descriptor_digest: string;
  requested_model: string;
  allowed_effective_models: string[];
  budget_snapshot_digest: string;
  budget_reservation_id: string;
  absolute_deadline: string;
  max_attempts: number;
  max_parallelism: number;
  secret_profile: string;
  network_profile: string;
  completion_schema_digest: string;
};

export type CursorCloudPredispatchObservationV1 = {
  observed_at: string;
  repository: string;
  assignment_id: string;
  owner: string;
  branch: string;
  base_head: string;
  branch_preissued: boolean;
  generation: number;
  budget_reservation_id: string;
  budget_current: boolean;
};

export type CursorCloudAssignmentFailure =
  | "CURSOR_ASSIGNMENT_SCHEMA_INVALID"
  | "CURSOR_ASSIGNMENT_AUTHORITY_STALE"
  | "CURSOR_BRANCH_NOT_PREISSUED"
  | "CURSOR_BUDGET_UNAVAILABLE"
  | "CURSOR_PREDISPATCH_IDENTITY_MISMATCH";

export type CursorBranchOwnershipV1 = {
  repository: string;
  branch: string;
  assignment_id: string;
  action_id: string;
  owner: string;
  generation: number;
  fence_token: number;
  acquired_at: string;
  expires_at: string;
  renewal_count: number;
  state: "active" | "released";
};

const OWNERSHIP_KEYS = new Set<keyof CursorBranchOwnershipV1>([
  "repository",
  "branch",
  "assignment_id",
  "action_id",
  "owner",
  "generation",
  "fence_token",
  "acquired_at",
  "expires_at",
  "renewal_count",
  "state",
]);

export type CursorExternalRunObservationV1 = {
  schema_version: "cursor-external-run-observation.v1";
  run_id: string;
  assignment_id: string;
  action_id: string;
  owner: string;
  branch: string;
  base_head: string;
  candidate_head: string;
  pr_number: number;
  requested_model: string;
  effective_model: string;
  usage_state: "known" | "unknown";
  cost_state: "known" | "unknown";
  changed_paths: string[];
  diff_bytes_digest: string;
  test_receipt_digests: string[];
  launch_observed_at: string;
  collection_observed_at: string;
  launch_reader_identity: string;
  collection_reader_identity: string;
  observation_digest: string;
};

const OBSERVATION_KEYS = new Set<keyof CursorExternalRunObservationV1>([
  "schema_version",
  "run_id",
  "assignment_id",
  "action_id",
  "owner",
  "branch",
  "base_head",
  "candidate_head",
  "pr_number",
  "requested_model",
  "effective_model",
  "usage_state",
  "cost_state",
  "changed_paths",
  "diff_bytes_digest",
  "test_receipt_digests",
  "launch_observed_at",
  "collection_observed_at",
  "launch_reader_identity",
  "collection_reader_identity",
  "observation_digest",
]);

const REQUIRED_KEYS = [
  "schema_version",
  "repository",
  "assignment_id",
  "action_id",
  "owner",
  "issued_at",
  "expires_at",
  "generation",
  "scope_kind",
  "requirement_ids",
  "test_ids",
  "responsibility_owner",
  "branch",
  "base_head",
  "allowed_paths",
  "forbidden_paths",
  "context_digest",
  "policy_digest",
  "descriptor_digest",
  "requested_model",
  "allowed_effective_models",
  "budget_snapshot_digest",
  "budget_reservation_id",
  "absolute_deadline",
  "max_attempts",
  "max_parallelism",
  "secret_profile",
  "network_profile",
  "completion_schema_digest",
] as const;
const ALLOWED_KEYS = new Set<string>([...REQUIRED_KEYS, "issue_number", "plan_id"]);
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const SHA = /^[a-f0-9]{40}$/;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(nonEmpty) &&
    new Set(value).size === value.length
  );
}

function safePath(value: string): boolean {
  const normalized = value.endsWith("/") ? value.slice(0, -1) : value;
  return (
    normalized.length > 0 &&
    !normalized.startsWith("/") &&
    !normalized.includes("\\") &&
    !normalized.includes("\0") &&
    normalized.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function pathsOverlap(left: string, right: string): boolean {
  const a = left.endsWith("/") ? left : `${left}/`;
  const b = right.endsWith("/") ? right : `${right}/`;
  return left === right || a.startsWith(b) || b.startsWith(a);
}

function validAssignment(value: unknown): value is CursorCloudAssignmentV1 {
  if (!record(value)) return false;
  if (Object.keys(value).some((key) => !ALLOWED_KEYS.has(key))) return false;
  if (REQUIRED_KEYS.some((key) => !(key in value))) return false;
  const strings = [
    "repository",
    "assignment_id",
    "action_id",
    "owner",
    "issued_at",
    "expires_at",
    "responsibility_owner",
    "branch",
    "requested_model",
    "budget_reservation_id",
    "absolute_deadline",
    "secret_profile",
    "network_profile",
  ];
  if (strings.some((key) => !nonEmpty(value[key]))) return false;
  if (value.schema_version !== CURSOR_CLOUD_ASSIGNMENT_SCHEMA_VERSION) return false;
  if (!Number.isInteger(value.generation) || (value.generation as number) < 1) return false;
  if (!Number.isInteger(value.max_attempts) || (value.max_attempts as number) < 1) return false;
  if (!Number.isInteger(value.max_parallelism) || (value.max_parallelism as number) < 1)
    return false;
  if (!SHA.test(String(value.base_head))) return false;
  for (const key of [
    "context_digest",
    "policy_digest",
    "descriptor_digest",
    "budget_snapshot_digest",
    "completion_schema_digest",
  ])
    if (!DIGEST.test(String(value[key]))) return false;
  const timestamps = [value.issued_at, value.expires_at, value.absolute_deadline];
  if (
    !timestamps.every(
      (item) => UTC_TIMESTAMP.test(String(item)) && Number.isFinite(Date.parse(String(item))),
    )
  )
    return false;
  const issuedAt = Date.parse(String(value.issued_at));
  if (
    issuedAt >= Date.parse(String(value.expires_at)) ||
    issuedAt >= Date.parse(String(value.absolute_deadline))
  )
    return false;
  if (
    !stringList(value.requirement_ids) ||
    !stringList(value.test_ids) ||
    !stringList(value.allowed_effective_models)
  )
    return false;
  if (!stringList(value.allowed_paths) || !stringList(value.forbidden_paths)) return false;
  const allPaths = [...value.allowed_paths, ...value.forbidden_paths];
  if (!allPaths.every(safePath)) return false;
  for (let i = 0; i < allPaths.length; i += 1)
    for (let j = i + 1; j < allPaths.length; j += 1)
      if (pathsOverlap(allPaths[i], allPaths[j])) return false;
  const issueScope =
    value.scope_kind === "issue" &&
    Number.isInteger(value.issue_number) &&
    (value.issue_number as number) > 0 &&
    !value.plan_id;
  const planScope =
    value.scope_kind === "plan" && nonEmpty(value.plan_id) && value.issue_number === undefined;
  return issueScope || planScope;
}

export function admitCursorCloudAssignment(input: {
  assignment: unknown;
  current: CursorCloudPredispatchObservationV1;
}):
  | { accepted: true; assignment: CursorCloudAssignmentV1 }
  | { accepted: false; reason: CursorCloudAssignmentFailure } {
  if (!validAssignment(input.assignment))
    return { accepted: false, reason: "CURSOR_ASSIGNMENT_SCHEMA_INVALID" };
  const assignment = input.assignment;
  const observedAt = Date.parse(input.current.observed_at);
  if (
    !Number.isFinite(observedAt) ||
    observedAt >= Date.parse(assignment.expires_at) ||
    observedAt >= Date.parse(assignment.absolute_deadline)
  )
    return { accepted: false, reason: "CURSOR_ASSIGNMENT_AUTHORITY_STALE" };
  if (!input.current.branch_preissued)
    return { accepted: false, reason: "CURSOR_BRANCH_NOT_PREISSUED" };
  if (
    !input.current.budget_current ||
    input.current.budget_reservation_id !== assignment.budget_reservation_id
  )
    return { accepted: false, reason: "CURSOR_BUDGET_UNAVAILABLE" };
  if (
    input.current.repository !== assignment.repository ||
    input.current.assignment_id !== assignment.assignment_id ||
    input.current.owner !== assignment.owner ||
    input.current.branch !== assignment.branch ||
    input.current.base_head !== assignment.base_head ||
    input.current.generation !== assignment.generation
  )
    return { accepted: false, reason: "CURSOR_PREDISPATCH_IDENTITY_MISMATCH" };
  return { accepted: true, assignment };
}

export function admitCursorBranchOwnership(input: {
  assignment: CursorCloudAssignmentV1;
  ownership: unknown;
  observed_at: string;
}):
  | { accepted: true; fence_token: number }
  | { accepted: false; reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" } {
  const { assignment } = input;
  if (
    !record(input.ownership) ||
    Object.keys(input.ownership).length !== OWNERSHIP_KEYS.size ||
    !Object.keys(input.ownership).every((key) =>
      OWNERSHIP_KEYS.has(key as keyof CursorBranchOwnershipV1),
    )
  )
    return { accepted: false, reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" };
  const ownership = input.ownership as CursorBranchOwnershipV1;
  const acquiredAt = Date.parse(ownership.acquired_at);
  const expiresAt = Date.parse(ownership.expires_at);
  const observedAt = Date.parse(input.observed_at);
  const valid =
    ownership.state === "active" &&
    Number.isInteger(ownership.fence_token) &&
    ownership.fence_token > 0 &&
    Number.isInteger(ownership.renewal_count) &&
    ownership.renewal_count >= 0 &&
    Number.isInteger(ownership.generation) &&
    ownership.generation === assignment.generation &&
    ownership.repository === assignment.repository &&
    ownership.branch === assignment.branch &&
    ownership.assignment_id === assignment.assignment_id &&
    ownership.action_id === assignment.action_id &&
    ownership.owner === assignment.owner &&
    Number.isFinite(acquiredAt) &&
    Number.isFinite(expiresAt) &&
    Number.isFinite(observedAt) &&
    acquiredAt < expiresAt &&
    observedAt >= acquiredAt &&
    observedAt < expiresAt;
  return valid
    ? { accepted: true, fence_token: ownership.fence_token }
    : { accepted: false, reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" };
}

export function resolveCursorLaunchOutcome(
  input:
    | { kind: "transport_unknown" }
    | { kind: "http_response"; status_code: number }
    | { kind: "accepted"; run_id: string },
):
  | {
      action: "hold_and_read_after" | "read_after";
      retry_allowed: false;
      reason: "CURSOR_LAUNCH_OUTCOME_UNKNOWN";
    }
  | { action: "read_after"; retry_allowed: false; run_id: string } {
  if (input.kind === "accepted" && nonEmpty(input.run_id))
    return { action: "read_after", retry_allowed: false, run_id: input.run_id };
  if (input.kind === "transport_unknown")
    return {
      action: "hold_and_read_after",
      retry_allowed: false,
      reason: "CURSOR_LAUNCH_OUTCOME_UNKNOWN",
    };
  return { action: "read_after", retry_allowed: false, reason: "CURSOR_LAUNCH_OUTCOME_UNKNOWN" };
}

export function evaluateCursorSafeRelease(input: {
  provider_terminal: boolean;
  writer_disabled: boolean;
  pending_writes: number;
  cost_state: "reconciled" | "unknown";
  generation: number;
  observed_generation: number;
}): { safe: true } | { safe: false; reason: "CURSOR_SAFE_RELEASE_UNPROVEN" } {
  return input.provider_terminal &&
    input.writer_disabled &&
    input.pending_writes === 0 &&
    input.cost_state === "reconciled" &&
    input.generation === input.observed_generation
    ? { safe: true }
    : { safe: false, reason: "CURSOR_SAFE_RELEASE_UNPROVEN" };
}

function pathIsWithin(path: string, allowed: string): boolean {
  return allowed.endsWith("/") ? path.startsWith(allowed) : path === allowed;
}

export function admitCursorExternalObservation(input: {
  assignment: CursorCloudAssignmentV1;
  observation: unknown;
}):
  | { accepted: true; observation: CursorExternalRunObservationV1 }
  | { accepted: false; reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" } {
  const { assignment } = input;
  if (!record(input.observation))
    return { accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" };
  if (
    !Object.keys(input.observation).every((key) =>
      OBSERVATION_KEYS.has(key as keyof CursorExternalRunObservationV1),
    )
  )
    return { accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" };
  const observation = input.observation as CursorExternalRunObservationV1;
  const launchAt = Date.parse(observation.launch_observed_at);
  const collectionAt = Date.parse(observation.collection_observed_at);
  const identityValid =
    observation.schema_version === "cursor-external-run-observation.v1" &&
    nonEmpty(observation.run_id) &&
    observation.assignment_id === assignment.assignment_id &&
    observation.action_id === assignment.action_id &&
    observation.owner === assignment.owner &&
    observation.branch === assignment.branch &&
    observation.base_head === assignment.base_head &&
    SHA.test(observation.candidate_head) &&
    Number.isInteger(observation.pr_number) &&
    observation.pr_number > 0 &&
    observation.requested_model === assignment.requested_model &&
    assignment.allowed_effective_models.includes(observation.effective_model);
  const evidenceValid =
    observation.usage_state === "known" &&
    observation.cost_state === "known" &&
    DIGEST.test(observation.diff_bytes_digest) &&
    DIGEST.test(observation.observation_digest) &&
    stringList(observation.test_receipt_digests) &&
    observation.test_receipt_digests.every((digest) => DIGEST.test(digest)) &&
    nonEmpty(observation.launch_reader_identity) &&
    nonEmpty(observation.collection_reader_identity) &&
    Number.isFinite(launchAt) &&
    Number.isFinite(collectionAt) &&
    collectionAt > launchAt;
  const pathsValid =
    stringList(observation.changed_paths) &&
    observation.changed_paths.every(
      (path) =>
        safePath(path) &&
        assignment.allowed_paths.some((allowed) => pathIsWithin(path, allowed)) &&
        !assignment.forbidden_paths.some((forbidden) => pathIsWithin(path, forbidden)),
    );
  return identityValid && evidenceValid && pathsValid
    ? { accepted: true, observation }
    : { accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" };
}

export type CursorRuntimePolicyProofV1 = {
  scope_enforced: boolean;
  secret_profile: string;
  network_profile: string;
  cost_within_reservation: boolean;
  deadline_enforced: boolean;
  observed_at: string;
};

export function evaluateCursorRuntimePolicy(input: {
  assignment: CursorCloudAssignmentV1;
  proof: CursorRuntimePolicyProofV1;
}): { accepted: true } | { accepted: false; reason: "CURSOR_RUNTIME_POLICY_VIOLATION" } {
  const observedAt = Date.parse(input.proof.observed_at);
  const valid =
    input.proof.scope_enforced &&
    input.proof.secret_profile === input.assignment.secret_profile &&
    input.proof.network_profile === input.assignment.network_profile &&
    input.proof.cost_within_reservation &&
    input.proof.deadline_enforced &&
    Number.isFinite(observedAt) &&
    observedAt < Date.parse(input.assignment.absolute_deadline);
  return valid
    ? { accepted: true }
    : { accepted: false, reason: "CURSOR_RUNTIME_POLICY_VIOLATION" };
}

export type CursorIndependentReviewV1 = {
  assignment_id: string;
  branch: string;
  candidate_head: string;
  reviewer: string;
  worker: string;
  verdict: "approve" | "changes_requested";
};

const REVIEW_KEYS = new Set<keyof CursorIndependentReviewV1>([
  "assignment_id",
  "branch",
  "candidate_head",
  "reviewer",
  "worker",
  "verdict",
]);

export function admitCursorIndependentReview(input: {
  assignment: CursorCloudAssignmentV1;
  expected_candidate_head: string;
  review: unknown;
}):
  | { accepted: true; verdict: CursorIndependentReviewV1["verdict"] }
  | { accepted: false; reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" } {
  if (
    !record(input.review) ||
    Object.keys(input.review).length !== REVIEW_KEYS.size ||
    !Object.keys(input.review).every((key) =>
      REVIEW_KEYS.has(key as keyof CursorIndependentReviewV1),
    )
  )
    return { accepted: false, reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" };
  const review = input.review as CursorIndependentReviewV1;
  const valid =
    review.assignment_id === input.assignment.assignment_id &&
    review.branch === input.assignment.branch &&
    review.candidate_head === input.expected_candidate_head &&
    SHA.test(review.candidate_head) &&
    nonEmpty(review.reviewer) &&
    review.reviewer !== review.worker &&
    review.worker === input.assignment.owner &&
    (review.verdict === "approve" || review.verdict === "changes_requested");
  return valid
    ? { accepted: true, verdict: review.verdict }
    : { accepted: false, reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" };
}

export function routeCursorReviewChanges(input: {
  assignment: CursorCloudAssignmentV1;
  review_assignment_id: string;
  review_branch: string;
  verdict: "approve" | "changes_requested";
}):
  | { action: "return_same_assignment"; assignment_id: string; branch: string }
  | { action: "accepted" }
  | { action: "deny"; reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" } {
  if (
    input.review_assignment_id !== input.assignment.assignment_id ||
    input.review_branch !== input.assignment.branch
  )
    return { action: "deny", reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" };
  return input.verdict === "changes_requested"
    ? {
        action: "return_same_assignment",
        assignment_id: input.assignment.assignment_id,
        branch: input.assignment.branch,
      }
    : { action: "accepted" };
}

export function admitCursorPhaseTransition(input: {
  predecessor_terminal: boolean;
  predecessor_writer_disabled: boolean;
  dual_writer_count: number;
  fresh_fence_observed: boolean;
}): { accepted: true } | { accepted: false; reason: "CURSOR_SAFE_RELEASE_UNPROVEN" } {
  return input.predecessor_terminal &&
    input.predecessor_writer_disabled &&
    input.dual_writer_count === 0 &&
    input.fresh_fence_observed
    ? { accepted: true }
    : { accepted: false, reason: "CURSOR_SAFE_RELEASE_UNPROVEN" };
}

export function decideCursorBoundedRetry(input: {
  attempt: number;
  max_attempts: number;
  elapsed_ms: number;
  max_elapsed_ms: number;
  cost_current: boolean;
}): { action: "retry_same_action" | "remain_unresolved"; peer_lanes_affected: false } {
  const canRetry =
    Number.isInteger(input.attempt) &&
    Number.isInteger(input.max_attempts) &&
    input.attempt >= 0 &&
    input.attempt < input.max_attempts &&
    input.max_attempts > 0 &&
    Number.isFinite(input.elapsed_ms) &&
    Number.isFinite(input.max_elapsed_ms) &&
    input.elapsed_ms >= 0 &&
    input.elapsed_ms < input.max_elapsed_ms &&
    input.max_elapsed_ms > 0 &&
    input.cost_current;
  return {
    action: canRetry ? "retry_same_action" : "remain_unresolved",
    peer_lanes_affected: false,
  };
}
