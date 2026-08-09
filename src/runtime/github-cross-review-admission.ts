import {
  type ClaudePrReviewReceipt,
  INDEPENDENT_PR_REVIEW_COMMENT_MARKER,
  validateClaudePrReviewReceipt,
} from "./claude-pr-convergence";
import { canonicalJson, sha256Digest } from "./digest";
import {
  type KimiReviewFallbackAdmissionReceiptV1,
  type KimiReviewOutputCapability,
  kimiReviewPacketDigest,
  type ProviderNeutralReviewReceiptV3,
  type ReviewFallbackLeaseCapability,
  type ReviewProviderFailureCapability,
  validateKimiReviewFallbackAdmissionForImplementation,
  validateProviderNeutralReviewReceipt,
} from "./independent-review-fallback";

export interface ReviewAdmissionComment {
  readonly html_url: string;
  readonly created_at: string;
  readonly body: string;
}

export interface ReviewAdmissionCiRun {
  readonly id: number;
  readonly head_sha: string;
  readonly name: string;
  readonly path: string;
  readonly event: string;
  readonly status: string;
  readonly conclusion: string | null;
  readonly updated_at: string;
  readonly pull_request_numbers: readonly number[];
}

export interface GitHubCrossReviewAdmissionInput {
  readonly repository: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly is_draft: boolean;
  readonly observed_at: string;
  readonly review_packet: string;
  readonly comments: readonly ReviewAdmissionComment[];
  readonly ci_runs: readonly ReviewAdmissionCiRun[];
}

export interface GitHubCrossReviewAdmissionDecision {
  readonly ok: boolean;
  readonly deferred: boolean;
  readonly receipt_digest: string | null;
  readonly reasons: readonly string[];
}

type CanonicalReceipt = ClaudePrReviewReceipt | ProviderNeutralReviewReceiptV3;

export interface KimiReviewCommentProvenanceV1 {
  readonly admission_receipt: KimiReviewFallbackAdmissionReceiptV1;
  readonly admission_verifier_receipt: ClaudePrReviewReceipt;
  readonly admission_verifier_comment: ReviewAdmissionComment;
  readonly fallback_evidence: ReviewProviderFailureCapability;
  readonly lease: ReviewFallbackLeaseCapability;
  readonly output: KimiReviewOutputCapability;
  readonly logical_db_receipt: Readonly<Record<string, unknown>>;
}

interface IndependentReviewCommentEnvelopeV1 {
  readonly schema_version: "helix-independent-pr-review-comment.v1";
  readonly receipt: CanonicalReceipt;
  readonly kimi_provenance: KimiReviewCommentProvenanceV1 | null;
}

export function renderProviderNeutralPrReviewComment(
  receipt: ProviderNeutralReviewReceiptV3,
  provenance: KimiReviewCommentProvenanceV1,
): string {
  const validated = validateProviderNeutralReviewReceipt(receipt);
  const envelope: IndependentReviewCommentEnvelopeV1 = {
    schema_version: "helix-independent-pr-review-comment.v1",
    receipt: validated,
    kimi_provenance: provenance,
  };
  return [INDEPENDENT_PR_REVIEW_COMMENT_MARKER, "```json", JSON.stringify(envelope), "```"].join(
    "\n",
  );
}

function extractReceipt(body: string): IndependentReviewCommentEnvelopeV1 | null {
  if (!body.includes(INDEPENDENT_PR_REVIEW_COMMENT_MARKER)) return null;
  const match = body.match(/```json\s*([\s\S]*)\s*```/u);
  if (!match?.[1]) return null;
  let value: unknown;
  try {
    value = JSON.parse(match[1]);
  } catch {
    return null;
  }
  try {
    if (!value || typeof value !== "object") return null;
    const raw = value as Partial<IndependentReviewCommentEnvelopeV1>;
    if (raw.schema_version !== "helix-independent-pr-review-comment.v1") return null;
    const receiptValue = raw.receipt;
    if (
      receiptValue &&
      typeof receiptValue === "object" &&
      (receiptValue as { schemaVersion?: unknown }).schemaVersion ===
        "helix-claude-pr-review-receipt.v2"
    ) {
      return {
        schema_version: raw.schema_version,
        receipt: validateClaudePrReviewReceipt(receiptValue),
        kimi_provenance: null,
      };
    }
    return {
      schema_version: raw.schema_version,
      receipt: validateProviderNeutralReviewReceipt(receiptValue),
      kimi_provenance: raw.kimi_provenance ?? null,
    };
  } catch {
    return null;
  }
}

function validateKimiProvenance(
  receipt: ProviderNeutralReviewReceiptV3,
  provenance: KimiReviewCommentProvenanceV1 | null,
  input: GitHubCrossReviewAdmissionInput,
): boolean {
  if (!provenance || !Number.isFinite(Date.parse(input.observed_at))) return false;
  try {
    const admission = validateKimiReviewFallbackAdmissionForImplementation(
      provenance.admission_receipt,
      input.observed_at,
      receipt.fallback_implementation_head,
    );
    const verifier = validateClaudePrReviewReceipt(provenance.admission_verifier_receipt);
    const verifierEnvelope = extractReceipt(provenance.admission_verifier_comment.body);
    if (
      verifier.receiptDigest !== admission.independent_verifier_receipt_digest ||
      verifier.headSha !== admission.admission_implementation_head ||
      verifier.verdict !== "approve" ||
      verifier.blockerCount !== 0 ||
      verifier.commentUrl !== provenance.admission_verifier_comment.html_url ||
      !verifierEnvelope ||
      !("schemaVersion" in verifierEnvelope.receipt) ||
      verifierEnvelope.receipt.receiptDigest !== verifier.receiptDigest
    ) {
      return false;
    }
    const db = provenance.logical_db_receipt;
    const { converged, receipt_digest: dbDigest, ...dbBody } = db;
    if (
      db.schema_version !== "helix-l3-g3-logical-db-bootstrap-receipt.v2" ||
      db.source_head !== receipt.candidate_head ||
      converged !== true ||
      db.projection_digest !== db.replay_projection_digest ||
      db.checkpoint_digest !== db.replay_checkpoint_digest ||
      db.stale_count !== 0 ||
      db.replay_stale_count !== 0 ||
      db.orphan_count !== 0 ||
      db.replay_orphan_count !== 0 ||
      db.finding_count !== 0 ||
      db.replay_finding_count !== 0 ||
      dbDigest !== sha256Digest(canonicalJson(dbBody)) ||
      dbDigest !== receipt.db_receipt_digest
    ) {
      return false;
    }
    const failure = provenance.fallback_evidence;
    const failureDigest = sha256Digest(
      canonicalJson({
        provider: failure.provider,
        candidate_head: failure.candidate_head,
        exit_code: failure.exit_code,
        stderr_digest: failure.stderr_digest,
        observed_at: failure.observed_at,
        reason: failure.reason,
      }),
    );
    const lease = provenance.lease;
    const leaseDigest = sha256Digest(
      canonicalJson({
        schema_version: "helix-review-fallback-lease.v1",
        repository: lease.repository,
        pr_number: lease.pr_number,
        candidate_head: lease.candidate_head,
        generation: lease.generation,
        provider: lease.provider,
        issued_at: lease.issued_at,
        expires_at: lease.expires_at,
      }),
    );
    const output = provenance.output;
    const outputPayload = {
      schema_version: "helix-kimi-pr-review-output.v1",
      candidate_head: output.candidate_head,
      verdict: output.verdict,
      blocker_count: output.blocker_count,
      findings: output.findings,
    };
    const result =
      admission.receipt_digest === receipt.admission_receipt_digest &&
      failureDigest === failure.evidence_digest &&
      failure.evidence_digest === receipt.fallback_evidence_digest &&
      failure.candidate_head === receipt.candidate_head &&
      failure.reason === receipt.fallback_reason &&
      leaseDigest === lease.lease_digest &&
      lease.lease_digest === receipt.lease_digest &&
      lease.repository === receipt.repository &&
      lease.pr_number === receipt.pr_number &&
      lease.candidate_head === receipt.candidate_head &&
      lease.provider === receipt.reviewer_provider &&
      lease.issued_at === receipt.lease_issued_at &&
      lease.expires_at === receipt.lease_expires_at &&
      Date.parse(failure.observed_at) <= Date.parse(lease.issued_at) &&
      sha256Digest(canonicalJson(outputPayload)) === output.output_digest &&
      output.output_digest === receipt.output_digest &&
      sha256Digest(canonicalJson(output.findings)) === output.findings_digest &&
      output.findings_digest === receipt.findings_digest &&
      output.candidate_head === receipt.candidate_head &&
      output.verdict === receipt.verdict &&
      output.blocker_count === receipt.blocker_count &&
      kimiReviewPacketDigest(input.review_packet) === receipt.review_packet_digest;
    return result;
  } catch {
    return false;
  }
}

function receiptFields(receipt: CanonicalReceipt): {
  repository: string;
  prNumber: number;
  headSha: string;
  ciRunId: number;
  ciConclusion: string;
  reviewedAt: string;
  verdict: string;
  blockerCount: number;
  dbConverged: boolean;
  digest: string;
  independent: boolean;
  commentUrl: string | null;
} {
  if ("schemaVersion" in receipt) {
    return {
      repository: receipt.repository,
      prNumber: receipt.prNumber,
      headSha: receipt.headSha,
      ciRunId: receipt.ciRunId,
      ciConclusion: receipt.ciConclusion,
      reviewedAt: receipt.reviewedAt,
      verdict: receipt.verdict,
      blockerCount: receipt.blockerCount,
      dbConverged: receipt.dbConverged,
      digest: receipt.receiptDigest,
      independent: receipt.authorRuntime === "codex" && receipt.reviewerRuntime === "claude",
      commentUrl: receipt.commentUrl,
    };
  }
  return {
    repository: receipt.repository,
    prNumber: receipt.pr_number,
    headSha: receipt.candidate_head,
    ciRunId: receipt.ci_run_id,
    ciConclusion: receipt.ci_conclusion,
    reviewedAt: receipt.reviewed_at,
    verdict: receipt.verdict,
    blockerCount: receipt.blocker_count,
    dbConverged: receipt.db_converged,
    digest: receipt.receipt_digest,
    independent: receipt.declared_author_runtime !== receipt.reviewer_runtime,
    commentUrl: null,
  };
}

export function evaluateGitHubCrossReviewAdmission(
  input: GitHubCrossReviewAdmissionInput,
): GitHubCrossReviewAdmissionDecision {
  if (input.state !== "OPEN") {
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: ["pr_not_open"],
    };
  }
  if (input.is_draft) {
    return { ok: true, deferred: true, receipt_digest: null, reasons: [] };
  }
  const candidates = input.comments.flatMap((comment) => {
    const envelope = extractReceipt(comment.body);
    return envelope
      ? [{ comment, envelope, receipt: envelope.receipt, fields: receiptFields(envelope.receipt) }]
      : [];
  });
  if (candidates.length === 0) {
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: ["current_head_review_receipt_missing"],
    };
  }
  const valid = candidates.filter(({ comment, envelope, receipt, fields }) => {
    const ci = input.ci_runs.find((run) => run.id === fields.ciRunId);
    return (
      fields.repository === input.repository &&
      fields.prNumber === input.pr_number &&
      fields.headSha === input.candidate_head &&
      fields.verdict === "approve" &&
      fields.blockerCount === 0 &&
      fields.ciConclusion === "success" &&
      fields.dbConverged &&
      fields.independent &&
      (!("schema_version" in receipt) ||
        validateKimiProvenance(receipt, envelope.kimi_provenance, input)) &&
      (fields.commentUrl === null || fields.commentUrl === comment.html_url) &&
      Number.isFinite(Date.parse(comment.created_at)) &&
      Number.isFinite(Date.parse(fields.reviewedAt)) &&
      Date.parse(fields.reviewedAt) <= Date.parse(comment.created_at) &&
      ci?.head_sha === input.candidate_head &&
      ci.name === "harness-check" &&
      ci.path === ".github/workflows/harness-check.yml" &&
      ci.event === "pull_request" &&
      ci.status === "completed" &&
      ci.conclusion === "success" &&
      ci.pull_request_numbers.includes(input.pr_number) &&
      Number.isFinite(Date.parse(ci.updated_at)) &&
      Date.parse(ci.updated_at) <= Date.parse(fields.reviewedAt)
    );
  });
  if (valid.length !== 1) {
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: [valid.length === 0 ? "review_receipt_invalid_or_stale" : "review_receipt_conflict"],
    };
  }
  return {
    ok: true,
    deferred: false,
    receipt_digest: valid[0]?.fields.digest ?? null,
    reasons: [],
  };
}
