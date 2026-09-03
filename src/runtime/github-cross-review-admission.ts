import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { claudeMemoryRuntimeRoot } from "./claude-memory-wake";
import {
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA,
  type ClaudePrReviewReceipt,
  type ClaudePrReviewReceiptAny,
  INDEPENDENT_PR_REVIEW_COMMENT_MARKER,
  INDEPENDENT_REVIEW_RUNTIMES,
  parseClaudeIndependentPrReviewComment,
  parseClaudePrCiEvidenceGeneration,
  validateClaudePrReviewReceipt,
} from "./claude-pr-convergence";
import { canonicalJson, sha256Digest } from "./digest";
import { selectLatestSuccessfulReviewCiGeneration } from "./github-review-ci-generation";
import {
  type KimiReviewFallbackAdmissionReceiptV2,
  type KimiReviewOutputCapability,
  kimiReviewPacketDigest,
  type ProviderNeutralReviewReceiptV4,
  type ReviewFallbackLeaseCapability,
  type ReviewProviderFailureCapability,
  validateKimiReviewFallbackAdmissionForImplementation,
  validateProviderNeutralReviewReceipt,
} from "./independent-review-fallback";

export interface ReviewAdmissionComment {
  readonly html_url: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly body: string;
}

export interface ReviewAdmissionCiRun {
  readonly id: number;
  readonly attempt: number;
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
  readonly current_db_receipt: Readonly<Record<string, unknown>>;
  readonly comments: readonly ReviewAdmissionComment[];
  readonly ci_runs: readonly ReviewAdmissionCiRun[];
}

export interface GitHubCrossReviewAdmissionDecision {
  readonly ok: boolean;
  readonly deferred: boolean;
  readonly receipt_digest: string | null;
  readonly reasons: readonly string[];
  readonly candidate_diagnostics?: readonly ReviewAdmissionCandidateDiagnostic[];
}

export type ReviewAdmissionCandidateFailure =
  | "review_receipt_envelope_invalid"
  | "review_receipt_schema_invalid"
  | "review_receipt_independence_invalid"
  | "review_receipt_ci_run_missing"
  | "review_receipt_repository_mismatch"
  | "review_receipt_pr_mismatch"
  | "review_receipt_head_mismatch"
  | "review_receipt_verdict_invalid"
  | "review_receipt_ci_claim_invalid"
  | "review_receipt_db_provenance_invalid"
  | "review_receipt_comment_binding_invalid"
  | "review_receipt_time_order_invalid"
  | "review_receipt_ci_provenance_invalid"
  | "review_receipt_ci_generation_invalid";

export interface ReviewAdmissionCandidateDiagnostic {
  readonly comment_url: string;
  readonly reason: ReviewAdmissionCandidateFailure;
}

export interface ReviewedMergeReadAfterInput {
  readonly repository: string;
  readonly pr_number: number;
  readonly pr_state: "OPEN" | "CLOSED" | "MERGED";
  readonly candidate_head: string;
  readonly candidate_commit: string | null;
  readonly candidate_tree: string | null;
  readonly reported_merge_commit: string | null;
  readonly merge_commit: string | null;
  readonly merge_tree: string | null;
  readonly merge_parents: readonly string[];
  readonly observed_at: string;
  readonly review_receipt_digest: string;
}

export interface ReviewedMergeReadAfterReceipt {
  readonly schema_version: "helix-reviewed-merge-read-after-receipt.v1";
  readonly repository: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly candidate_commit: string | null;
  readonly candidate_tree: string | null;
  readonly reported_merge_commit: string | null;
  readonly merge_commit: string | null;
  readonly merge_tree: string | null;
  readonly merge_parents: readonly string[];
  readonly observed_state: "OPEN" | "CLOSED" | "MERGED";
  readonly observed_at: string;
  readonly review_receipt_digest: string;
  readonly outcome: "verified" | "merged_unverified";
  readonly reasons: readonly string[];
  readonly receipt_digest: string;
}

export interface ReviewedMergeReadAfterDecision {
  readonly ok: boolean;
  readonly receipt: ReviewedMergeReadAfterReceipt;
  readonly reasons: readonly string[];
}

type CanonicalReceipt = ClaudePrReviewReceiptAny | ProviderNeutralReviewReceiptV4;

export interface KimiReviewCommentProvenanceV1 {
  readonly admission_receipt: KimiReviewFallbackAdmissionReceiptV2;
  readonly admission_verifier_receipt: ClaudePrReviewReceiptAny;
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

const LOGICAL_DB_RECEIPT_EXACT_KEYS = [
  "canonicalization_contract",
  "checkpoint_digest",
  "checkpoint_population_valid",
  "checkpoint_row_counts",
  "checkpoint_tables",
  "column_order",
  "converged",
  "event_head_digest",
  "excluded_projection_inputs",
  "excluded_projection_steps",
  "executed_excluded_projection_steps",
  "finding_count",
  "normalization_marker",
  "observation_columns",
  "observation_columns_digest",
  "orphan_count",
  "orphan_population_valid",
  "orphan_rule_rows",
  "policy_digest",
  "policy_schema_version",
  "projection_digest",
  "projection_input_mode",
  "receipt_digest",
  "replay_checkpoint_digest",
  "replay_checkpoint_population_valid",
  "replay_checkpoint_row_counts",
  "replay_checkpoint_tables",
  "replay_executed_excluded_projection_steps",
  "replay_finding_count",
  "replay_orphan_count",
  "replay_orphan_population_valid",
  "replay_orphan_rule_rows",
  "replay_projection_digest",
  "replay_schema_revision",
  "replay_stale_count",
  "replay_stale_population_valid",
  "replay_stale_rule_rows",
  "row_order",
  "schema_revision",
  "schema_version",
  "source_head",
  "source_tree",
  "stale_count",
  "stale_population_valid",
  "stale_rule_rows",
  "table_order",
  "unexpected_unstable_columns",
  "verifier_digest",
  "workspace_attestation",
] as const;

export function canonicalLogicalDbReceiptValid(
  db: Readonly<Record<string, unknown>>,
  candidateHead: string,
): boolean {
  const keys = Object.keys(db).sort();
  if (
    keys.length !== LOGICAL_DB_RECEIPT_EXACT_KEYS.length ||
    keys.some((key, index) => key !== LOGICAL_DB_RECEIPT_EXACT_KEYS[index])
  ) {
    return false;
  }
  const workspace = db.workspace_attestation as Record<string, unknown> | undefined;
  const emptyArrays = [
    db.executed_excluded_projection_steps,
    db.replay_executed_excluded_projection_steps,
    db.unexpected_unstable_columns,
  ];
  const { converged, receipt_digest: dbDigest, ...dbBody } = db;
  return (
    db.schema_version === "helix-l3-g3-logical-db-bootstrap-receipt.v2" &&
    db.policy_schema_version === "helix-l3-g3-logical-db-bootstrap-policy.v2" &&
    db.source_head === candidateHead &&
    workspace?.clean === true &&
    converged === true &&
    db.projection_digest === db.replay_projection_digest &&
    db.checkpoint_digest === db.replay_checkpoint_digest &&
    canonicalJson(db.checkpoint_tables) === canonicalJson(db.replay_checkpoint_tables) &&
    canonicalJson(db.checkpoint_row_counts) === canonicalJson(db.replay_checkpoint_row_counts) &&
    db.checkpoint_population_valid === true &&
    db.replay_checkpoint_population_valid === true &&
    db.schema_revision === db.replay_schema_revision &&
    db.stale_population_valid === true &&
    db.replay_stale_population_valid === true &&
    db.orphan_population_valid === true &&
    db.replay_orphan_population_valid === true &&
    db.stale_count === 0 &&
    db.replay_stale_count === 0 &&
    db.orphan_count === 0 &&
    db.replay_orphan_count === 0 &&
    db.finding_count === 0 &&
    db.replay_finding_count === 0 &&
    emptyArrays.every((value) => Array.isArray(value) && value.length === 0) &&
    dbDigest === sha256Digest(canonicalJson(dbBody))
  );
}

export function renderProviderNeutralPrReviewComment(
  receipt: ProviderNeutralReviewReceiptV4,
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

/**
 * comment 本文から canonical receipt を取り出す。
 *
 * runtime 独立性（author !== reviewer）の唯一の authority は receipt validator 側にある。
 * v2 は `validateClaudePrReviewReceipt`、v4 は `validateProviderNeutralReviewReceipt` が
 * 同一 runtime を例外で落とし、ここが `null` を返すため、admission へは非独立 receipt が
 * 到達しない。かつて admission 側にも独立性の再判定を置いていたが、v2 側へ構築時 fail-close を
 * 入れた時点で v2・v4 いずれの経路からも false へ到達しなくなったため削除した（Issue #514）。
 * 「多層 fail-close」として残すと、実行され得ない分岐を検証済みと誤読させる。
 */
function extractReceipt(
  body: string,
):
  | { envelope: IndependentReviewCommentEnvelopeV1; failure: null }
  | { envelope: null; failure: ReviewAdmissionCandidateFailure }
  | null {
  if (!body.includes(INDEPENDENT_PR_REVIEW_COMMENT_MARKER)) return null;
  const claudeReceipt = parseClaudeIndependentPrReviewComment(body);
  if (claudeReceipt) {
    return {
      envelope: {
        schema_version: "helix-independent-pr-review-comment.v1",
        receipt: claudeReceipt,
        kimi_provenance: null,
      },
      failure: null,
    };
  }
  const match = body.match(/```json\s*([\s\S]*)\s*```/u);
  if (!match?.[1]) return { envelope: null, failure: "review_receipt_envelope_invalid" };
  let value: unknown;
  try {
    value = JSON.parse(match[1]);
  } catch {
    return { envelope: null, failure: "review_receipt_envelope_invalid" };
  }
  try {
    if (!value || typeof value !== "object") {
      return { envelope: null, failure: "review_receipt_envelope_invalid" };
    }
    const raw = value as Partial<IndependentReviewCommentEnvelopeV1>;
    if (raw.schema_version !== "helix-independent-pr-review-comment.v1") {
      return { envelope: null, failure: "review_receipt_envelope_invalid" };
    }
    if (raw.receipt && typeof raw.receipt === "object" && "schemaVersion" in raw.receipt) {
      try {
        validateClaudePrReviewReceipt(raw.receipt);
        return { envelope: null, failure: "review_receipt_envelope_invalid" };
      } catch (error) {
        return {
          envelope: null,
          failure:
            error instanceof Error && error.message === "runtime_independence_missing"
              ? "review_receipt_independence_invalid"
              : "review_receipt_schema_invalid",
        };
      }
    }
    return {
      envelope: {
        schema_version: raw.schema_version,
        receipt: validateProviderNeutralReviewReceipt(raw.receipt),
        kimi_provenance: raw.kimi_provenance ?? null,
      },
      failure: null,
    };
  } catch {
    return { envelope: null, failure: "review_receipt_schema_invalid" };
  }
}

function validateKimiProvenance(
  receipt: ProviderNeutralReviewReceiptV4,
  provenance: KimiReviewCommentProvenanceV1 | null,
  input: GitHubCrossReviewAdmissionInput,
): boolean {
  if (!provenance || !Number.isFinite(Date.parse(input.observed_at))) return false;
  try {
    const admission = validateKimiReviewFallbackAdmissionForImplementation(
      provenance.admission_receipt,
      input.observed_at,
      receipt.fallback_lane_closure_digest,
    );
    const verifier = validateClaudePrReviewReceipt(provenance.admission_verifier_receipt);
    const verifierCommentReceipt = parseClaudeIndependentPrReviewComment(
      provenance.admission_verifier_comment.body,
    );
    if (
      verifier.receiptDigest !== admission.independent_verifier_receipt_digest ||
      verifier.headSha !== admission.admission_implementation_head ||
      verifier.verdict !== "approve" ||
      verifier.blockerCount !== 0 ||
      verifier.commentUrl !== provenance.admission_verifier_comment.html_url ||
      !verifierCommentReceipt ||
      verifierCommentReceipt.receiptDigest !== verifier.receiptDigest ||
      !Number.isFinite(Date.parse(provenance.admission_verifier_comment.created_at)) ||
      !Number.isFinite(Date.parse(provenance.admission_verifier_comment.updated_at)) ||
      Date.parse(provenance.admission_verifier_comment.created_at) >
        Date.parse(provenance.admission_verifier_comment.updated_at) ||
      Date.parse(verifier.reviewedAt) >
        Date.parse(provenance.admission_verifier_comment.updated_at) ||
      Date.parse(provenance.admission_verifier_comment.updated_at) > Date.parse(admission.issued_at)
    ) {
      return false;
    }
    const db = provenance.logical_db_receipt;
    const dbDigest = db.receipt_digest;
    if (
      !canonicalLogicalDbReceiptValid(db, receipt.candidate_head) ||
      canonicalJson(db) !== canonicalJson(input.current_db_receipt) ||
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

function validateClaudeDbProvenance(
  receipt: ClaudePrReviewReceipt,
  input: GitHubCrossReviewAdmissionInput,
): boolean {
  const db = input.current_db_receipt;
  return (
    canonicalLogicalDbReceiptValid(db, input.candidate_head) &&
    db.receipt_digest === receipt.dbReceiptDigest &&
    db.projection_digest === receipt.dbProjectionDigest &&
    db.replay_projection_digest === receipt.dbReplayProjectionDigest &&
    db.checkpoint_digest === receipt.dbCheckpointDigest &&
    db.replay_checkpoint_digest === receipt.dbReplayCheckpointDigest
  );
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
  commentUrl: string | null;
  ciEvidenceGeneration: string | null;
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
      commentUrl: receipt.commentUrl,
      ciEvidenceGeneration: "ciEvidenceGeneration" in receipt ? receipt.ciEvidenceGeneration : null,
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
    commentUrl: null,
    ciEvidenceGeneration: null,
  };
}

interface ParsedReviewCandidate {
  readonly comment: ReviewAdmissionComment;
  readonly envelope: IndependentReviewCommentEnvelopeV1;
  readonly receipt: CanonicalReceipt;
  readonly fields: ReturnType<typeof receiptFields>;
}

function reviewCandidateFailure(
  input: GitHubCrossReviewAdmissionInput,
  candidate: ParsedReviewCandidate,
): ReviewAdmissionCandidateFailure | null {
  const { comment, envelope, receipt, fields } = candidate;
  const ci = input.ci_runs.find((run) => run.id === fields.ciRunId);
  if (!ci) return "review_receipt_ci_run_missing";
  const isCurrentClaudeReceipt =
    "schemaVersion" in receipt && receipt.schemaVersion === CLAUDE_PR_REVIEW_RECEIPT_SCHEMA;
  const isProviderNeutralReceipt =
    "schema_version" in receipt &&
    receipt.schema_version === "helix-independent-pr-review-receipt.v4";
  if (!isCurrentClaudeReceipt && !isProviderNeutralReceipt) {
    return "review_receipt_schema_invalid";
  }
  if (fields.repository !== input.repository) return "review_receipt_repository_mismatch";
  if (fields.prNumber !== input.pr_number) return "review_receipt_pr_mismatch";
  if (fields.headSha !== input.candidate_head) return "review_receipt_head_mismatch";
  if (fields.verdict !== "approve" || fields.blockerCount !== 0) {
    return "review_receipt_verdict_invalid";
  }
  if (fields.ciConclusion !== "success" || !fields.dbConverged) {
    return "review_receipt_ci_claim_invalid";
  }
  if (
    !(isProviderNeutralReceipt
      ? validateKimiProvenance(receipt, envelope.kimi_provenance, input)
      : validateClaudeDbProvenance(receipt as ClaudePrReviewReceipt, input))
  ) {
    return "review_receipt_db_provenance_invalid";
  }
  if (fields.commentUrl !== null && fields.commentUrl !== comment.html_url) {
    return "review_receipt_comment_binding_invalid";
  }
  if (
    !Number.isFinite(Date.parse(comment.created_at)) ||
    !Number.isFinite(Date.parse(comment.updated_at)) ||
    !Number.isFinite(Date.parse(fields.reviewedAt)) ||
    Date.parse(comment.created_at) > Date.parse(comment.updated_at) ||
    Date.parse(fields.reviewedAt) > Date.parse(comment.updated_at)
  ) {
    return "review_receipt_time_order_invalid";
  }
  if (
    ci.head_sha !== input.candidate_head ||
    ci.name !== "harness-check" ||
    ci.path !== ".github/workflows/harness-check.yml" ||
    ci.event !== "pull_request" ||
    ci.status !== "completed" ||
    ci.conclusion !== "success" ||
    !ci.pull_request_numbers.includes(input.pr_number)
  ) {
    return "review_receipt_ci_provenance_invalid";
  }
  if (!latestCiRunMatches(input, ci)) return "review_receipt_ci_generation_invalid";
  if (isCurrentClaudeReceipt) {
    const generation =
      fields.ciEvidenceGeneration === null
        ? null
        : parseClaudePrCiEvidenceGeneration(fields.ciEvidenceGeneration);
    if (
      generation?.runId !== ci.id ||
      generation.attempt !== ci.attempt ||
      generation.conclusion !== ci.conclusion
    ) {
      return "review_receipt_ci_generation_invalid";
    }
  }
  if (
    !Number.isFinite(Date.parse(ci.updated_at)) ||
    Date.parse(ci.updated_at) > Date.parse(fields.reviewedAt)
  ) {
    return "review_receipt_time_order_invalid";
  }
  return null;
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
  const malformedDiagnostics: ReviewAdmissionCandidateDiagnostic[] = [];
  const candidates = input.comments.flatMap((comment): ParsedReviewCandidate[] => {
    const extracted = extractReceipt(comment.body);
    if (!extracted) return [];
    if (extracted.failure) {
      malformedDiagnostics.push({ comment_url: comment.html_url, reason: extracted.failure });
      return [];
    }
    const { envelope } = extracted;
    return [
      { comment, envelope, receipt: envelope.receipt, fields: receiptFields(envelope.receipt) },
    ];
  });
  if (candidates.length === 0) {
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: [
        malformedDiagnostics.length === 0
          ? "current_head_review_receipt_missing"
          : "review_receipt_invalid_or_stale",
      ],
      ...(malformedDiagnostics.length === 0 ? {} : { candidate_diagnostics: malformedDiagnostics }),
    };
  }
  const evaluated = candidates.map((candidate) => ({
    candidate,
    failure: reviewCandidateFailure(input, candidate),
  }));
  const valid = evaluated.filter((entry) => entry.failure === null).map((entry) => entry.candidate);
  // mixed authorship（両runtimeの実装commitが同居するHybrid stacking branch）は、
  // 各runtimeの実装commitを相手がreviewしたreceiptが両方揃って初めて独立review済みになる。
  // 単一runtime-authored PRの複数receiptは従来どおりconflictとする（Issue #539）。
  const mixedAuthored = valid.filter(
    ({ receipt }) => "schemaVersion" in receipt && receipt.authorRuntime === "mixed",
  );
  if (mixedAuthored.length > 0) {
    const reviewers = new Set(
      mixedAuthored.map(({ receipt }) => (receipt as ClaudePrReviewReceipt).reviewerRuntime),
    );
    const complete =
      mixedAuthored.length === valid.length &&
      mixedAuthored.length === INDEPENDENT_REVIEW_RUNTIMES.length &&
      INDEPENDENT_REVIEW_RUNTIMES.every((runtime) => reviewers.has(runtime));
    if (!complete) {
      return {
        ok: false,
        deferred: false,
        receipt_digest: null,
        reasons: ["mixed_author_dual_review_incomplete"],
      };
    }
    // digest は receipt 群全体を canonical 順で束ねた 1 値に確定させる（順序非依存）。
    const digests = mixedAuthored.map(({ fields }) => fields.digest).sort();
    return {
      ok: true,
      deferred: false,
      receipt_digest: sha256Digest(canonicalJson({ mixed_author_review_receipts: digests })),
      reasons: [],
    };
  }
  if (valid.length !== 1) {
    const diagnostics = evaluated
      .filter(
        (entry): entry is typeof entry & { failure: ReviewAdmissionCandidateFailure } =>
          entry.failure !== null,
      )
      .map(({ candidate, failure }) => ({
        comment_url: candidate.comment.html_url,
        reason: failure,
      }));
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: [valid.length === 0 ? "review_receipt_invalid_or_stale" : "review_receipt_conflict"],
      ...(valid.length === 0 && diagnostics.length > 0
        ? { candidate_diagnostics: [...malformedDiagnostics, ...diagnostics] }
        : {}),
    };
  }
  return {
    ok: true,
    deferred: false,
    receipt_digest: valid[0]?.fields.digest ?? null,
    reasons: [],
  };
}

export function evaluateReviewedMergeReadAfter(
  input: ReviewedMergeReadAfterInput,
): ReviewedMergeReadAfterDecision {
  const reasons: string[] = [];
  if (input.pr_state !== "MERGED") reasons.push("merge_not_observed");
  if (!Number.isFinite(Date.parse(input.observed_at))) reasons.push("observed_at_invalid");
  if (input.candidate_commit === null || input.candidate_tree === null) {
    reasons.push("candidate_commit_read_after_failed");
  } else if (input.candidate_commit !== input.candidate_head) {
    reasons.push("candidate_commit_mismatch");
  }
  if (
    input.reported_merge_commit === null ||
    input.merge_commit === null ||
    input.reported_merge_commit !== input.merge_commit
  ) {
    reasons.push("merge_commit_mismatch");
  }
  if (!input.merge_parents.includes(input.candidate_head)) {
    reasons.push("reviewed_head_not_merge_parent");
  }
  if (input.merge_tree === null || input.candidate_tree !== input.merge_tree) {
    reasons.push("reviewed_tree_not_merged_tree");
  }
  const payload = {
    schema_version: "helix-reviewed-merge-read-after-receipt.v1" as const,
    repository: input.repository,
    pr_number: input.pr_number,
    candidate_head: input.candidate_head,
    candidate_commit: input.candidate_commit,
    candidate_tree: input.candidate_tree,
    reported_merge_commit: input.reported_merge_commit,
    merge_commit: input.merge_commit,
    merge_tree: input.merge_tree,
    merge_parents: [...input.merge_parents].sort(),
    observed_state: input.pr_state,
    observed_at: input.observed_at,
    review_receipt_digest: input.review_receipt_digest,
    outcome: reasons.length === 0 ? ("verified" as const) : ("merged_unverified" as const),
    reasons,
  };
  const receipt = { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) };
  return { ok: reasons.length === 0, receipt, reasons };
}

export function validateReviewedMergeReadAfterReceipt(
  value: unknown,
): ReviewedMergeReadAfterReceipt {
  if (!value || typeof value !== "object") throw new Error("merge_read_after_receipt_required");
  const receipt = value as ReviewedMergeReadAfterReceipt;
  const decision = evaluateReviewedMergeReadAfter({
    repository: receipt.repository,
    pr_number: receipt.pr_number,
    pr_state: receipt.observed_state,
    candidate_head: receipt.candidate_head,
    candidate_commit: receipt.candidate_commit,
    candidate_tree: receipt.candidate_tree,
    reported_merge_commit: receipt.reported_merge_commit,
    merge_commit: receipt.merge_commit,
    merge_tree: receipt.merge_tree,
    merge_parents: receipt.merge_parents,
    observed_at: receipt.observed_at,
    review_receipt_digest: receipt.review_receipt_digest,
  });
  if (
    receipt.schema_version !== "helix-reviewed-merge-read-after-receipt.v1" ||
    receipt.receipt_digest !== decision.receipt.receipt_digest ||
    canonicalJson(receipt) !== canonicalJson(decision.receipt)
  ) {
    throw new Error("merge_read_after_receipt_invalid");
  }
  return receipt;
}

export function persistReviewedMergeReadAfterReceipt(
  repoRoot: string,
  receipt: ReviewedMergeReadAfterReceipt,
): string {
  const validated = validateReviewedMergeReadAfterReceipt(receipt);
  const dir = join(claudeMemoryRuntimeRoot(repoRoot), "..", "reviewed-merge", "receipts");
  mkdirSync(dir, { recursive: true });
  const name = `${validated.repository.replaceAll("/", "_")}_${validated.pr_number}_${validated.candidate_head}_${validated.receipt_digest.slice("sha256:".length)}.json`;
  const path = join(dir, name);
  const content = `${canonicalJson(validated)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("merge_read_after_receipt_conflict");
  }
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, content);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

function latestRelevantCiRun(input: GitHubCrossReviewAdmissionInput): ReviewAdmissionCiRun | null {
  const relevant = input.ci_runs.filter(
    (run) =>
      run.head_sha === input.candidate_head &&
      run.name === "harness-check" &&
      run.path === ".github/workflows/harness-check.yml" &&
      run.event === "pull_request" &&
      run.pull_request_numbers.includes(input.pr_number),
  );
  const selected = selectLatestSuccessfulReviewCiGeneration(
    relevant.map((run) => ({ ...run, updatedAt: run.updated_at })),
  );
  return selected;
}

function latestCiRunMatches(
  input: GitHubCrossReviewAdmissionInput,
  ci: ReviewAdmissionCiRun,
): boolean {
  const latest = latestRelevantCiRun(input);
  return (
    latest?.id === ci.id && latest.attempt === ci.attempt && latest.updated_at === ci.updated_at
  );
}
