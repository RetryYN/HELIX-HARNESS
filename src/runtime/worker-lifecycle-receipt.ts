import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  resolveWorkerIsolationRunReceipt,
  type WorkerIsolationRunReceiptCapability,
} from "./worker-isolation-broker";
import type { WorkerValidatedOutputCapability } from "./worker-output-admission";
import {
  isWorkerIndependentReview,
  type WorkerIndependentReviewCapability,
  workerProposalCapabilityDigest,
} from "./worker-review-receipt";

export type WorkerLifecycleState =
  | "requested"
  | "admitted"
  | "sandboxed"
  | "running"
  | "proposal_received"
  | "revalidated"
  | "accepted"
  | "rejected"
  | "quarantined";

export type WorkerLifecycleFailureCode =
  | "WORKER_LIFECYCLE_INPUT_INVALID"
  | "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED"
  | "WORKER_LIFECYCLE_REVIEW_UNSEALED"
  | "WORKER_LIFECYCLE_PROPOSAL_MISMATCH"
  | "WORKER_LIFECYCLE_TERMINAL_INVALID";

export interface WorkerLifecycleEventV1 {
  readonly sequence: number;
  readonly state: WorkerLifecycleState;
  readonly evidence_digest: Sha256Digest;
  readonly previous_event_digest: Sha256Digest | null;
  readonly event_digest: Sha256Digest;
}

export interface WorkerLifecycleReceiptCapability {
  readonly kind: "worker_lifecycle_receipt";
  readonly schema_version: "helix-worker-lifecycle-receipt.v1";
  readonly run_id: string;
  readonly parent_run_id: string | null;
  readonly child_run_ids: readonly string[];
  readonly head_sha: string;
  readonly terminal_state: "accepted" | "rejected" | "quarantined";
  readonly terminal_reason: string | null;
  readonly admission_digest: Sha256Digest;
  readonly sandbox_digest: Sha256Digest;
  readonly diff_digest: Sha256Digest;
  readonly egress_digest: Sha256Digest;
  readonly output_digest: Sha256Digest;
  readonly observation_digest: Sha256Digest;
  readonly reviewer_verdict: "approve" | "reject";
  readonly verifier_receipt_digest: Sha256Digest;
  readonly events: readonly WorkerLifecycleEventV1[];
  readonly receipt_digest: Sha256Digest;
}

export interface WorkerLifecycleReceiptRequest {
  readonly run_id: string;
  readonly parent_run_id: string | null;
  readonly child_run_ids: readonly string[];
  readonly head_sha: string;
  readonly output: WorkerValidatedOutputCapability;
  readonly run_receipt: WorkerIsolationRunReceiptCapability;
  readonly review: WorkerIndependentReviewCapability;
  readonly terminal_state: "accepted" | "rejected" | "quarantined";
  readonly terminal_reason: string | null;
}

export type WorkerLifecycleReceiptResult =
  | { ok: true; receipt: WorkerLifecycleReceiptCapability }
  | { ok: false; failure_code: WorkerLifecycleFailureCode };

const sealedLifecycleReceipts = new WeakSet<WorkerLifecycleReceiptCapability>();
const RECEIPT_KEYS = [
  "admission_digest",
  "child_run_ids",
  "diff_digest",
  "egress_digest",
  "events",
  "head_sha",
  "kind",
  "observation_digest",
  "output_digest",
  "parent_run_id",
  "receipt_digest",
  "run_id",
  "sandbox_digest",
  "schema_version",
  "terminal_reason",
  "terminal_state",
  "reviewer_verdict",
  "verifier_receipt_digest",
] as const;
const EVENT_KEYS = [
  "event_digest",
  "evidence_digest",
  "previous_event_digest",
  "sequence",
  "state",
] as const;

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

function validChildRunIds(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return false;
  return (
    value.every(validIdentifier) &&
    new Set(value).size === value.length &&
    value.every((runId, index) => (index === 0 ? true : runId > (value[index - 1] ?? "")))
  );
}

function validIdentifier(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value);
}

function appendEvent(
  events: WorkerLifecycleEventV1[],
  state: WorkerLifecycleState,
  evidenceDigest: Sha256Digest,
): void {
  const previous = events.at(-1)?.event_digest ?? null;
  const payload = {
    sequence: events.length + 1,
    state,
    evidence_digest: evidenceDigest,
    previous_event_digest: previous,
  };
  events.push(Object.freeze({ ...payload, event_digest: sha256Digest(canonicalJson(payload)) }));
}

export function createWorkerLifecycleReceipt(
  request: WorkerLifecycleReceiptRequest,
): WorkerLifecycleReceiptResult {
  if (
    !validIdentifier(request.run_id) ||
    (request.parent_run_id !== null && !validIdentifier(request.parent_run_id)) ||
    request.child_run_ids.some((runId) => !validIdentifier(runId)) ||
    new Set(request.child_run_ids).size !== request.child_run_ids.length ||
    request.child_run_ids.some((runId, index) =>
      index === 0 ? false : runId <= (request.child_run_ids[index - 1] ?? ""),
    ) ||
    !/^[a-f0-9]{40}$/u.test(request.head_sha)
  ) {
    return { ok: false, failure_code: "WORKER_LIFECYCLE_INPUT_INVALID" };
  }
  const runReceipt = resolveWorkerIsolationRunReceipt(request.run_receipt, request.output);
  if (!runReceipt) return { ok: false, failure_code: "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED" };
  if (!isWorkerIndependentReview(request.review))
    return { ok: false, failure_code: "WORKER_LIFECYCLE_REVIEW_UNSEALED" };
  const proposalDigest = workerProposalCapabilityDigest(request.output);
  if (!proposalDigest || request.review.proposal_digest !== proposalDigest)
    return { ok: false, failure_code: "WORKER_LIFECYCLE_PROPOSAL_MISMATCH" };
  if (
    (request.review.verdict === "approve" && request.terminal_state !== "accepted") ||
    (request.review.verdict === "reject" && request.terminal_state === "accepted") ||
    (request.terminal_state === "accepted" && request.terminal_reason !== null) ||
    (request.terminal_state !== "accepted" &&
      (!request.terminal_reason || request.terminal_reason.length > 256))
  ) {
    return { ok: false, failure_code: "WORKER_LIFECYCLE_TERMINAL_INVALID" };
  }

  const events: WorkerLifecycleEventV1[] = [];
  appendEvent(
    events,
    "requested",
    sha256Digest(canonicalJson({ run_id: request.run_id, parent_run_id: request.parent_run_id })),
  );
  appendEvent(
    events,
    "admitted",
    sha256Digest(
      canonicalJson({
        admission_digest: runReceipt.admission_digest,
        child_run_ids: request.child_run_ids,
        head_sha: request.head_sha,
      }),
    ),
  );
  appendEvent(events, "sandboxed", runReceipt.sandbox_digest);
  appendEvent(events, "running", runReceipt.observation_digest);
  appendEvent(events, "proposal_received", runReceipt.output_digest);
  appendEvent(events, "revalidated", request.review.receipt_digest);
  appendEvent(
    events,
    request.terminal_state,
    sha256Digest(
      canonicalJson({ reason: request.terminal_reason, review: request.review.receipt_digest }),
    ),
  );

  const payload = {
    kind: "worker_lifecycle_receipt" as const,
    schema_version: "helix-worker-lifecycle-receipt.v1" as const,
    run_id: request.run_id,
    parent_run_id: request.parent_run_id,
    child_run_ids: Object.freeze([...request.child_run_ids]),
    head_sha: request.head_sha,
    terminal_state: request.terminal_state,
    terminal_reason: request.terminal_reason,
    admission_digest: runReceipt.admission_digest,
    sandbox_digest: runReceipt.sandbox_digest,
    diff_digest: runReceipt.diff_digest,
    egress_digest: runReceipt.egress_digest,
    output_digest: runReceipt.output_digest,
    observation_digest: runReceipt.observation_digest,
    reviewer_verdict: request.review.verdict,
    verifier_receipt_digest: request.review.receipt_digest,
    events,
  };
  const receipt = Object.freeze({
    ...payload,
    events: Object.freeze([...events]),
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  sealedLifecycleReceipts.add(receipt);
  return { ok: true, receipt };
}

export function isWorkerLifecycleReceipt(
  value: unknown,
): value is WorkerLifecycleReceiptCapability {
  return (
    typeof value === "object" &&
    value !== null &&
    sealedLifecycleReceipts.has(value as WorkerLifecycleReceiptCapability)
  );
}

export function serializeWorkerLifecycleReceipt(
  receipt: WorkerLifecycleReceiptCapability,
): string | null {
  return isWorkerLifecycleReceipt(receipt) ? canonicalJson(receipt) : null;
}

export function verifyWorkerLifecycleReceipt(serialized: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return false;
  }
  if (!isRecord(parsed) || !exactKeys(parsed, RECEIPT_KEYS) || canonicalJson(parsed) !== serialized)
    return false;
  if (
    parsed.kind !== "worker_lifecycle_receipt" ||
    parsed.schema_version !== "helix-worker-lifecycle-receipt.v1" ||
    typeof parsed.run_id !== "string" ||
    !validIdentifier(parsed.run_id) ||
    (parsed.parent_run_id !== null &&
      (typeof parsed.parent_run_id !== "string" || !validIdentifier(parsed.parent_run_id))) ||
    !validChildRunIds(parsed.child_run_ids) ||
    typeof parsed.head_sha !== "string" ||
    !/^[a-f0-9]{40}$/u.test(parsed.head_sha) ||
    !["accepted", "rejected", "quarantined"].includes(String(parsed.terminal_state)) ||
    (parsed.terminal_reason !== null && typeof parsed.terminal_reason !== "string") ||
    (parsed.terminal_state === "accepted" && parsed.terminal_reason !== null) ||
    (parsed.terminal_state !== "accepted" &&
      (typeof parsed.terminal_reason !== "string" ||
        parsed.terminal_reason.length < 1 ||
        parsed.terminal_reason.length > 256)) ||
    !validDigest(parsed.admission_digest) ||
    !validDigest(parsed.sandbox_digest) ||
    !validDigest(parsed.diff_digest) ||
    !validDigest(parsed.egress_digest) ||
    !validDigest(parsed.output_digest) ||
    !validDigest(parsed.observation_digest) ||
    !["approve", "reject"].includes(String(parsed.reviewer_verdict)) ||
    (parsed.reviewer_verdict === "approve" && parsed.terminal_state !== "accepted") ||
    (parsed.reviewer_verdict === "reject" && parsed.terminal_state === "accepted") ||
    !validDigest(parsed.verifier_receipt_digest) ||
    !validDigest(parsed.receipt_digest) ||
    !Array.isArray(parsed.events) ||
    parsed.events.length !== 7
  ) {
    return false;
  }
  const expectedStates: WorkerLifecycleState[] = [
    "requested",
    "admitted",
    "sandboxed",
    "running",
    "proposal_received",
    "revalidated",
    parsed.terminal_state as "accepted" | "rejected" | "quarantined",
  ];
  let previous: Sha256Digest | null = null;
  for (const [index, event] of parsed.events.entries()) {
    if (!isRecord(event) || !exactKeys(event, EVENT_KEYS)) return false;
    if (
      event.sequence !== index + 1 ||
      event.state !== expectedStates[index] ||
      !validDigest(event.evidence_digest) ||
      event.previous_event_digest !== previous ||
      !validDigest(event.event_digest)
    ) {
      return false;
    }
    const eventPayload = {
      sequence: event.sequence,
      state: event.state,
      evidence_digest: event.evidence_digest,
      previous_event_digest: event.previous_event_digest,
    };
    if (event.event_digest !== sha256Digest(canonicalJson(eventPayload))) return false;
    previous = event.event_digest;
  }
  const expectedEvidence: Sha256Digest[] = [
    sha256Digest(canonicalJson({ run_id: parsed.run_id, parent_run_id: parsed.parent_run_id })),
    sha256Digest(
      canonicalJson({
        admission_digest: parsed.admission_digest,
        child_run_ids: parsed.child_run_ids,
        head_sha: parsed.head_sha,
      }),
    ),
    parsed.sandbox_digest,
    parsed.observation_digest,
    parsed.output_digest,
    parsed.verifier_receipt_digest,
    sha256Digest(
      canonicalJson({ reason: parsed.terminal_reason, review: parsed.verifier_receipt_digest }),
    ),
  ];
  if (
    parsed.events.some(
      (event, index) => !isRecord(event) || event.evidence_digest !== expectedEvidence[index],
    )
  )
    return false;
  const { receipt_digest: receiptDigest, ...payload } = parsed;
  return receiptDigest === sha256Digest(canonicalJson(payload));
}
