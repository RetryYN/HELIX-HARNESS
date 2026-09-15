import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  verifyWorkerLifecycleReceipt,
  type WorkerLifecycleReceiptCapability,
} from "./worker-lifecycle-receipt";
import type { WorkerIndependentReviewCapability } from "./worker-review-receipt";

export type WorkGraphFailureCode =
  | "WORK_GRAPH_INPUT_INVALID"
  | "WORK_GRAPH_DEPENDENCY_NOT_READY"
  | "WORK_GRAPH_CELL_BINDING_INVALID"
  | "WORK_GRAPH_SCOPE_PATH_VIOLATION"
  | "WORK_GRAPH_TARGET_REVIEWER_MISMATCH"
  | "WORK_GRAPH_LEASE_CAS_STALE"
  | "WORK_GRAPH_LEASE_EARLY_RELEASE"
  | "WORK_GRAPH_RECEIPT_FUTURE_WRITE"
  | "WORK_GRAPH_ORDER_DIGEST_MISSING"
  | "WORK_GRAPH_HEAD_DRIFT"
  | "WORK_GRAPH_REVIEW_NOT_APPROVED"
  | "WORK_GRAPH_TERMINAL_MISSING"
  | "WORK_GRAPH_SELF_ACCEPTANCE";

export interface WorkGraphLeaseV1 {
  readonly fence_token: number;
  readonly owner: string;
  readonly acquired_at: string;
}

export interface LaneReadyReceiptV1 {
  readonly graph_snapshot_digest: Sha256Digest | null;
  readonly dependency_edge_ids: readonly string[];
}

export interface RequiredCellBindingV1 {
  readonly lane_id: string;
  readonly issue_id: string;
  readonly behavior_contract_id: string;
  readonly responsibility_owner: string;
  readonly base_head: string;
  readonly candidate_head: string;
  readonly writer_lease: WorkGraphLeaseV1;
  readonly target_reviewer: string;
  readonly effective_rule_packet_digest: Sha256Digest;
  readonly allowed_paths: readonly string[];
  readonly forbidden_paths: readonly string[];
  readonly lane_ready_receipt: LaneReadyReceiptV1;
}

export interface DelegationRequestReceiptCapability {
  readonly kind: "delegation_request_receipt";
  readonly schema_version: "helix-delegation-request-receipt.v1";
  readonly required_cell_binding: RequiredCellBindingV1;
  readonly graph_snapshot_digest: Sha256Digest;
  readonly issued_at: string;
  readonly receipt_digest: Sha256Digest;
}

export interface WorkGraphActorV1 {
  readonly identity: string;
  readonly session: string;
  readonly context_digest: Sha256Digest;
}

export interface ParentAcceptanceReceiptCapability {
  readonly kind: "parent_acceptance_receipt";
  readonly schema_version: "helix-parent-acceptance-receipt.v1";
  readonly lane_id: string;
  readonly issue_id: string;
  readonly repository_head: string;
  readonly delegation_receipt_digest: Sha256Digest;
  readonly review_receipt_digest: Sha256Digest;
  readonly review_head_sha: string;
  readonly terminal_receipt_digest: Sha256Digest;
  readonly evaluator: WorkGraphActorV1;
  readonly sealed_at: string;
  readonly receipt_digest: Sha256Digest;
}

export interface WorkGraphLeaseAcquireRequest {
  readonly laneId: string;
  readonly currentLease: WorkGraphLeaseV1 | null;
  readonly expectedFenceToken: number;
  readonly owner: string;
  readonly acquiredAt: string;
}

export interface WorkGraphLeaseReleaseRequest {
  readonly lease: WorkGraphLeaseV1;
  readonly terminal: WorkerLifecycleReceiptCapability | null;
}

export interface DelegationRequestOrderingRequest {
  readonly requiredCellBinding: unknown;
  readonly requiredDependencyEdgeIds: readonly string[];
  readonly changedPaths: readonly string[];
  readonly expectedBaseHead: string;
  readonly lease: WorkGraphLeaseV1;
  readonly issuedAt: string;
}

export interface ParentAcceptanceOrderingRequest {
  readonly delegation: DelegationRequestReceiptCapability | null;
  readonly review: WorkerIndependentReviewCapability | null;
  readonly terminal: WorkerLifecycleReceiptCapability | null;
  readonly reviewHeadSha: string;
  readonly repositoryHead: string;
  readonly evaluator: WorkGraphActorV1;
  readonly sealedAt: string;
}

export type DelegationRequestOrderingResult =
  | { ok: true; receipt: DelegationRequestReceiptCapability }
  | { ok: false; failure_code: WorkGraphFailureCode };

export type ParentAcceptanceOrderingResult =
  | { ok: true; receipt: ParentAcceptanceReceiptCapability }
  | { ok: false; failure_code: WorkGraphFailureCode };

export type WorkGraphLeaseAcquireResult =
  | { ok: true; lease: WorkGraphLeaseV1 }
  | { ok: false; failure_code: WorkGraphFailureCode };

export type WorkGraphLeaseReleaseResult =
  | { ok: true; released: WorkGraphLeaseV1 }
  | { ok: false; failure_code: WorkGraphFailureCode };

const REVIEW_CAPABILITY_KEYS = [
  "finding_digest",
  "kind",
  "proposal_digest",
  "receipt_digest",
  "reviewer_model",
  "verdict",
  "worker_model",
] as const;

export function verifyWorkerIndependentReviewCapability(
  value: unknown,
): value is WorkerIndependentReviewCapability {
  if (!isRecord(value) || !exactKeys(value, REVIEW_CAPABILITY_KEYS)) return false;
  if (
    value.kind !== "worker_independent_review" ||
    !validDigest(value.proposal_digest) ||
    !validDigest(value.finding_digest) ||
    !validDigest(value.receipt_digest) ||
    (value.verdict !== "approve" && value.verdict !== "reject")
  ) {
    return false;
  }
  const canonical = {
    schema_version: "helix-worker-independent-review-receipt.v1",
    proposal_digest: value.proposal_digest,
    finding_digest: value.finding_digest,
    verdict: value.verdict,
    worker_model: value.worker_model,
    reviewer_model: value.reviewer_model,
  };
  return value.receipt_digest === sha256Digest(canonicalJson(canonical));
}

const sealedDelegationReceipts = new WeakSet<DelegationRequestReceiptCapability>();
const sealedAcceptanceReceipts = new WeakSet<ParentAcceptanceReceiptCapability>();

const CELL_BINDING_KEYS = [
  "allowed_paths",
  "base_head",
  "behavior_contract_id",
  "candidate_head",
  "effective_rule_packet_digest",
  "forbidden_paths",
  "issue_id",
  "lane_id",
  "lane_ready_receipt",
  "responsibility_owner",
  "target_reviewer",
  "writer_lease",
] as const;
const LEASE_KEYS = ["acquired_at", "fence_token", "owner"] as const;
const LANE_READY_KEYS = ["dependency_edge_ids", "graph_snapshot_digest"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return (
    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])
  );
}

function validDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function validSha(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/u.test(value);
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u.test(value);
}

function validPathList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length
  );
}

export function validateWorkGraphLease(value: unknown): value is WorkGraphLeaseV1 {
  return (
    isRecord(value) &&
    exactKeys(value, LEASE_KEYS) &&
    typeof value.fence_token === "number" &&
    Number.isInteger(value.fence_token) &&
    value.fence_token >= 0 &&
    validIdentifier(value.owner) &&
    typeof value.acquired_at === "string" &&
    value.acquired_at.length > 0
  );
}

function validLaneReady(value: unknown): value is LaneReadyReceiptV1 {
  return (
    isRecord(value) &&
    exactKeys(value, LANE_READY_KEYS) &&
    (value.graph_snapshot_digest === null || validDigest(value.graph_snapshot_digest)) &&
    Array.isArray(value.dependency_edge_ids) &&
    value.dependency_edge_ids.every(validIdentifier) &&
    new Set(value.dependency_edge_ids).size === value.dependency_edge_ids.length
  );
}

function validCellBinding(value: unknown): value is RequiredCellBindingV1 {
  return (
    isRecord(value) &&
    exactKeys(value, CELL_BINDING_KEYS) &&
    validSha(value.base_head) &&
    validSha(value.candidate_head) &&
    validDigest(value.effective_rule_packet_digest) &&
    validPathList(value.allowed_paths) &&
    validPathList(value.forbidden_paths) &&
    validateWorkGraphLease(value.writer_lease) &&
    validLaneReady(value.lane_ready_receipt)
  );
}

function withinScope(
  changedPaths: readonly string[],
  allowed: readonly string[],
  forbidden: readonly string[],
): boolean {
  const covered = (path: string, list: readonly string[]): boolean =>
    list.some(
      (entry) => path === entry || path.startsWith(entry.endsWith("/") ? entry : `${entry}/`),
    );
  return changedPaths.every((path) => !covered(path, forbidden) && covered(path, allowed));
}

function sameActor(left: WorkGraphActorV1, right: WorkGraphActorV1): boolean {
  return (
    left.identity === right.identity ||
    left.session === right.session ||
    left.context_digest === right.context_digest
  );
}

export function acquireWorkGraphLease(
  request: WorkGraphLeaseAcquireRequest,
): WorkGraphLeaseAcquireResult {
  if (
    !validIdentifier(request.laneId) ||
    !validIdentifier(request.owner) ||
    !Number.isInteger(request.expectedFenceToken) ||
    request.expectedFenceToken < 0 ||
    (request.currentLease !== null && !validateWorkGraphLease(request.currentLease))
  ) {
    return { ok: false, failure_code: "WORK_GRAPH_INPUT_INVALID" };
  }
  const currentToken = request.currentLease?.fence_token ?? 0;
  if (currentToken !== request.expectedFenceToken) {
    return { ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" };
  }
  return {
    ok: true,
    lease: Object.freeze({
      fence_token: currentToken + 1,
      owner: request.owner,
      acquired_at: request.acquiredAt,
    }),
  };
}

export function releaseWorkGraphLease(
  request: WorkGraphLeaseReleaseRequest,
): WorkGraphLeaseReleaseResult {
  if (!validateWorkGraphLease(request.lease)) {
    return { ok: false, failure_code: "WORK_GRAPH_INPUT_INVALID" };
  }
  if (request.terminal === null || !verifyWorkerLifecycleReceipt(canonicalJson(request.terminal))) {
    return { ok: false, failure_code: "WORK_GRAPH_LEASE_EARLY_RELEASE" };
  }
  return { ok: true, released: Object.freeze({ ...request.lease }) };
}

export function evaluateDelegationRequestOrdering(
  request: DelegationRequestOrderingRequest,
): DelegationRequestOrderingResult {
  const binding = request.requiredCellBinding;
  if (!validCellBinding(binding)) {
    return { ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" };
  }
  if (
    !validIdentifier(binding.lane_id) ||
    !validIdentifier(binding.issue_id) ||
    !validIdentifier(binding.behavior_contract_id) ||
    !validIdentifier(binding.responsibility_owner) ||
    !validIdentifier(binding.target_reviewer) ||
    !validSha(request.expectedBaseHead) ||
    !request.changedPaths.every((path) => typeof path === "string" && path.length > 0)
  ) {
    return { ok: false, failure_code: "WORK_GRAPH_INPUT_INVALID" };
  }
  const snapshot = binding.lane_ready_receipt.graph_snapshot_digest;
  if (snapshot === null) {
    return { ok: false, failure_code: "WORK_GRAPH_RECEIPT_FUTURE_WRITE" };
  }
  const completed = new Set(binding.lane_ready_receipt.dependency_edge_ids);
  if (!request.requiredDependencyEdgeIds.every((edge) => completed.has(edge))) {
    return { ok: false, failure_code: "WORK_GRAPH_DEPENDENCY_NOT_READY" };
  }
  if (binding.base_head !== request.expectedBaseHead) {
    return { ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" };
  }
  if (!withinScope(request.changedPaths, binding.allowed_paths, binding.forbidden_paths)) {
    return { ok: false, failure_code: "WORK_GRAPH_SCOPE_PATH_VIOLATION" };
  }
  if (
    !validateWorkGraphLease(request.lease) ||
    request.lease.fence_token !== binding.writer_lease.fence_token ||
    request.lease.owner !== binding.writer_lease.owner
  ) {
    return { ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" };
  }
  const payload = {
    kind: "delegation_request_receipt" as const,
    schema_version: "helix-delegation-request-receipt.v1" as const,
    required_cell_binding: binding,
    graph_snapshot_digest: snapshot,
    issued_at: request.issuedAt,
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  sealedDelegationReceipts.add(receipt);
  return { ok: true, receipt };
}

export function evaluateParentAcceptanceOrdering(
  request: ParentAcceptanceOrderingRequest,
): ParentAcceptanceOrderingResult {
  const { delegation, review, terminal, evaluator } = request;
  if (delegation === null || !verifyDelegationRequestReceipt(delegation)) {
    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };
  }
  if (terminal === null) {
    return { ok: false, failure_code: "WORK_GRAPH_TERMINAL_MISSING" };
  }
  if (!verifyWorkerLifecycleReceipt(canonicalJson(terminal))) {
    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };
  }
  if (review === null || !verifyWorkerIndependentReviewCapability(review)) {
    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };
  }
  if (delegation.required_cell_binding.target_reviewer !== review.reviewer_model.identity) {
    return { ok: false, failure_code: "WORK_GRAPH_TARGET_REVIEWER_MISMATCH" };
  }
  if (
    !validSha(request.repositoryHead) ||
    delegation.required_cell_binding.candidate_head !== request.repositoryHead ||
    request.reviewHeadSha !== request.repositoryHead ||
    terminal.head_sha !== request.repositoryHead
  ) {
    return { ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" };
  }
  if (terminal.verifier_receipt_digest !== review.receipt_digest) {
    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };
  }
  if (review.verdict !== "approve") {
    return { ok: false, failure_code: "WORK_GRAPH_REVIEW_NOT_APPROVED" };
  }
  if (sameActor(evaluator, review.worker_model) || sameActor(evaluator, review.reviewer_model)) {
    return { ok: false, failure_code: "WORK_GRAPH_SELF_ACCEPTANCE" };
  }
  const payload = {
    kind: "parent_acceptance_receipt" as const,
    schema_version: "helix-parent-acceptance-receipt.v1" as const,
    lane_id: delegation.required_cell_binding.lane_id,
    issue_id: delegation.required_cell_binding.issue_id,
    repository_head: request.repositoryHead,
    delegation_receipt_digest: delegation.receipt_digest,
    review_receipt_digest: review.receipt_digest,
    review_head_sha: request.reviewHeadSha,
    terminal_receipt_digest: terminal.receipt_digest,
    evaluator: {
      identity: evaluator.identity,
      session: evaluator.session,
      context_digest: evaluator.context_digest,
    },
    sealed_at: request.sealedAt,
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  sealedAcceptanceReceipts.add(receipt);
  return { ok: true, receipt };
}

const DELEGATION_RECEIPT_KEYS = [
  "graph_snapshot_digest",
  "issued_at",
  "kind",
  "receipt_digest",
  "required_cell_binding",
  "schema_version",
] as const;

export function isDelegationRequestReceipt(
  value: unknown,
): value is DelegationRequestReceiptCapability {
  return (
    typeof value === "object" &&
    value !== null &&
    sealedDelegationReceipts.has(value as DelegationRequestReceiptCapability)
  );
}

export function verifyDelegationRequestReceipt(
  value: unknown,
): value is DelegationRequestReceiptCapability {
  if (isDelegationRequestReceipt(value)) return true;
  if (!isRecord(value) || !exactKeys(value, DELEGATION_RECEIPT_KEYS)) return false;
  if (
    value.kind !== "delegation_request_receipt" ||
    value.schema_version !== "helix-delegation-request-receipt.v1" ||
    !validDigest(value.graph_snapshot_digest) ||
    !validDigest(value.receipt_digest) ||
    typeof value.issued_at !== "string" ||
    !validCellBinding(value.required_cell_binding)
  ) {
    return false;
  }
  const canonical = {
    kind: value.kind,
    schema_version: value.schema_version,
    required_cell_binding: value.required_cell_binding,
    graph_snapshot_digest: value.graph_snapshot_digest,
    issued_at: value.issued_at,
  };
  return value.receipt_digest === sha256Digest(canonicalJson(canonical));
}

export function isParentAcceptanceReceipt(
  value: unknown,
): value is ParentAcceptanceReceiptCapability {
  return (
    typeof value === "object" &&
    value !== null &&
    sealedAcceptanceReceipts.has(value as ParentAcceptanceReceiptCapability)
  );
}
