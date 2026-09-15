export type PrReviewRouteReviewKind = "cross_agent" | "intra_runtime_subagent";

export interface PrReviewEvidence {
  kind: PrReviewRouteReviewKind;
  reviewerId: string;
  reviewerRuntime: string;
  reviewerModel: string;
  evidencePath: string;
  greenCommand?: string;
}

export interface PrReviewRouteInput {
  workerId: string;
  workerRuntime: string;
  workerModel: string;
  reviewEvidence: PrReviewEvidence[];
  allowIntraRuntimeFallback?: boolean;
}

export interface PrReviewRouteFinding {
  code:
    | "review_evidence_missing"
    | "worker_reviewer_same_model"
    | "worker_reviewer_same_identity"
    | "intra_runtime_fallback_not_allowed"
    | "review_evidence_path_missing"
    | "green_command_missing";
  severity: "error";
  message: string;
}

export interface PrReviewRouteResult {
  schemaVersion: "helix-pr-review-route.v1";
  ok: boolean;
  reviewKind: PrReviewRouteReviewKind | "missing";
  workerId: string;
  workerRuntime: string;
  workerModel: string;
  reviewerId: string | null;
  reviewerRuntime: string | null;
  reviewerModel: string | null;
  crossModel: boolean;
  crossRuntime: boolean;
  evidencePath: string | null;
  findings: PrReviewRouteFinding[];
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validatePrReviewRoute(input: PrReviewRouteInput): PrReviewRouteResult {
  const evidence = input.reviewEvidence[0] ?? null;
  const findings: PrReviewRouteFinding[] = [];

  if (!evidence) {
    findings.push({
      code: "review_evidence_missing",
      severity: "error",
      message: "PR review route requires review evidence before merge readiness can pass",
    });
  }

  const reviewerId = evidence?.reviewerId ?? null;
  const reviewerRuntime = evidence?.reviewerRuntime ?? null;
  const reviewerModel = evidence?.reviewerModel ?? null;
  const evidencePath = evidence?.evidencePath ?? null;
  const crossModel =
    reviewerModel !== null && normalized(input.workerModel) !== normalized(reviewerModel);
  const crossRuntime =
    reviewerRuntime !== null && normalized(input.workerRuntime) !== normalized(reviewerRuntime);
  const sameIdentity = reviewerId !== null && normalized(input.workerId) === normalized(reviewerId);

  if (evidence) {
    if (sameIdentity) {
      findings.push({
        code: "worker_reviewer_same_identity",
        severity: "error",
        message: "worker and reviewer must not be the same agent identity",
      });
    }
    if (!crossModel) {
      findings.push({
        code: "worker_reviewer_same_model",
        severity: "error",
        message: "worker model and reviewer model must differ for PR cross-review",
      });
    }
    if (evidence.kind === "intra_runtime_subagent" && input.allowIntraRuntimeFallback !== true) {
      findings.push({
        code: "intra_runtime_fallback_not_allowed",
        severity: "error",
        message: "intra-runtime fallback requires explicit fallback evidence",
      });
    }
    if (!hasText(evidence.evidencePath)) {
      findings.push({
        code: "review_evidence_path_missing",
        severity: "error",
        message: "review evidence must point to a durable repo-local evidence path",
      });
    }
    if (!hasText(evidence.greenCommand)) {
      findings.push({
        code: "green_command_missing",
        severity: "error",
        message: "review evidence must include the green command used by the reviewer",
      });
    }
  }

  return {
    schemaVersion: "helix-pr-review-route.v1",
    ok: findings.length === 0,
    reviewKind: evidence?.kind ?? "missing",
    workerId: input.workerId,
    workerRuntime: input.workerRuntime,
    workerModel: input.workerModel,
    reviewerId,
    reviewerRuntime,
    reviewerModel,
    crossModel,
    crossRuntime,
    evidencePath,
    findings,
  };
}
