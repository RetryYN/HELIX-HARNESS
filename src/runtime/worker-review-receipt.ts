import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  resolveWorkerIsolationExecutionOrigin,
  type WorkerAdmissionBinding,
  type WorkerIsolationExecutionOrigin,
} from "./worker-isolation-broker";
import {
  isWorkerValidatedOutput,
  type WorkerValidatedOutputCapability,
} from "./worker-output-admission";

const RECEIPT_KEYS = ["finding_digest", "proposal_digest", "schema_version", "verdict"] as const;

export interface WorkerReviewActorV1 {
  readonly identity: string;
  readonly session: string;
  readonly context_digest: Sha256Digest;
  readonly runtime: string;
  readonly provider: string;
  readonly model: string;
}

export interface WorkerIndependentReviewReceiptV1 {
  readonly schema_version: "helix-worker-independent-review-receipt.v1";
  readonly proposal_digest: Sha256Digest;
  readonly finding_digest: Sha256Digest;
  readonly verdict: "approve" | "reject";
  readonly worker_model: WorkerReviewActorV1;
  readonly reviewer_model: WorkerReviewActorV1;
}

export interface WorkerIndependentReviewCapability {
  readonly kind: "worker_independent_review";
  readonly proposal_digest: Sha256Digest;
  readonly finding_digest: Sha256Digest;
  readonly receipt_digest: Sha256Digest;
  readonly verdict: "approve" | "reject";
  readonly worker_model: WorkerReviewActorV1;
  readonly reviewer_model: WorkerReviewActorV1;
}

export type WorkerReviewFailureCode =
  | "WORKER_REVIEW_PROPOSAL_UNSEALED"
  | "WORKER_REVIEW_FINDING_OUTPUT_UNSEALED"
  | "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED"
  | "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID"
  | "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH"
  | "WORKER_REVIEW_FINDING_DIGEST_MISMATCH"
  | "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED"
  | "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED"
  | "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT";

export type WorkerReviewAdmissionResult =
  | { ok: true; receipt: WorkerIndependentReviewCapability }
  | { ok: false; failure_code: WorkerReviewFailureCode };

const admittedReceipts = new WeakSet<WorkerIndependentReviewCapability>();

export type WorkerReviewEvaluationResult =
  | { ok: true; receipt: WorkerIndependentReviewReceiptV1 }
  | {
      ok: false;
      failure_code: Exclude<WorkerReviewFailureCode, "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED">;
    };

export interface WorkerReviewEvaluationRequest {
  readonly input: unknown;
  readonly proposalOutput: WorkerValidatedOutputCapability;
  readonly reviewerOutput: WorkerValidatedOutputCapability;
  readonly workerOrigin: WorkerIsolationExecutionOrigin;
  readonly reviewerOrigin: WorkerIsolationExecutionOrigin;
}

export interface WorkerReviewAdmissionRequest {
  readonly input: unknown;
  readonly proposalOutput: WorkerValidatedOutputCapability;
  readonly reviewerOutput: WorkerValidatedOutputCapability;
  readonly workerCurrent: WorkerAdmissionBinding;
  readonly reviewerCurrent: WorkerAdmissionBinding;
}

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

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function actorFromOrigin(origin: WorkerIsolationExecutionOrigin): WorkerReviewActorV1 {
  return Object.freeze({
    identity: origin.identity,
    session: origin.session,
    context_digest: origin.context_digest,
    runtime: origin.runtime,
    provider: origin.provider,
    model: origin.model,
  });
}

export function workerProposalCapabilityDigest(
  output: WorkerValidatedOutputCapability,
): Sha256Digest | null {
  if (!isWorkerValidatedOutput(output)) return null;
  return sha256Digest(
    canonicalJson({
      descriptor_digest: output.descriptor_digest,
      kind: output.kind,
      output_schema_digest: output.output_schema_digest,
      payload_digest: output.payload_digest,
    }),
  );
}

export function evaluateWorkerIndependentReview(
  request: WorkerReviewEvaluationRequest,
): WorkerReviewEvaluationResult {
  const { input, proposalOutput, reviewerOutput, workerOrigin, reviewerOrigin } = request;
  const proposalDigest = workerProposalCapabilityDigest(proposalOutput);
  if (!proposalDigest) return { ok: false, failure_code: "WORKER_REVIEW_PROPOSAL_UNSEALED" };
  if (!isWorkerValidatedOutput(reviewerOutput))
    return { ok: false, failure_code: "WORKER_REVIEW_FINDING_OUTPUT_UNSEALED" };
  if (!isRecord(input) || !exactKeys(input, RECEIPT_KEYS))
    return { ok: false, failure_code: "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID" };
  if (
    input.schema_version !== "helix-worker-independent-review-receipt.v1" ||
    !isDigest(input.proposal_digest) ||
    !isDigest(input.finding_digest) ||
    (input.verdict !== "approve" && input.verdict !== "reject")
  ) {
    return { ok: false, failure_code: "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID" };
  }
  if (input.proposal_digest !== proposalDigest)
    return { ok: false, failure_code: "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH" };
  if (input.finding_digest !== reviewerOutput.payload_digest)
    return { ok: false, failure_code: "WORKER_REVIEW_FINDING_DIGEST_MISMATCH" };
  const worker = actorFromOrigin(workerOrigin);
  const reviewer = actorFromOrigin(reviewerOrigin);
  if (worker.identity === reviewer.identity)
    return { ok: false, failure_code: "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED" };
  if (worker.session === reviewer.session)
    return { ok: false, failure_code: "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED" };
  if (worker.context_digest === reviewer.context_digest)
    return { ok: false, failure_code: "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT" };

  const canonicalReceipt: WorkerIndependentReviewReceiptV1 = {
    schema_version: "helix-worker-independent-review-receipt.v1",
    proposal_digest: proposalDigest,
    finding_digest: input.finding_digest,
    verdict: input.verdict,
    worker_model: worker,
    reviewer_model: reviewer,
  };
  return {
    ok: true,
    receipt: Object.freeze(canonicalReceipt),
  };
}

export function admitWorkerIndependentReview(
  request: WorkerReviewAdmissionRequest,
): WorkerReviewAdmissionResult {
  const { input, proposalOutput, reviewerOutput, workerCurrent, reviewerCurrent } = request;
  const workerOrigin = resolveWorkerIsolationExecutionOrigin(proposalOutput, workerCurrent);
  const reviewerOrigin = resolveWorkerIsolationExecutionOrigin(reviewerOutput, reviewerCurrent);
  if (!workerOrigin || !reviewerOrigin)
    return { ok: false, failure_code: "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED" };
  const evaluated = evaluateWorkerIndependentReview({
    input,
    proposalOutput,
    reviewerOutput,
    workerOrigin,
    reviewerOrigin,
  });
  if (!evaluated.ok) return evaluated;
  const receipt = Object.freeze({
    kind: "worker_independent_review" as const,
    proposal_digest: evaluated.receipt.proposal_digest,
    finding_digest: evaluated.receipt.finding_digest,
    receipt_digest: sha256Digest(canonicalJson(evaluated.receipt)),
    verdict: evaluated.receipt.verdict,
    worker_model: evaluated.receipt.worker_model,
    reviewer_model: evaluated.receipt.reviewer_model,
  });
  admittedReceipts.add(receipt);
  return { ok: true, receipt };
}

export function isWorkerIndependentReview(
  value: unknown,
): value is WorkerIndependentReviewCapability {
  return (
    isRecord(value) && admittedReceipts.has(value as unknown as WorkerIndependentReviewCapability)
  );
}
