import {
  type ClaudePrReviewReceipt,
  INDEPENDENT_PR_REVIEW_COMMENT_MARKER,
  validateClaudePrReviewReceipt,
} from "./claude-pr-convergence";
import {
  type ProviderNeutralReviewReceiptV3,
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
  readonly conclusion: string | null;
}

export interface GitHubCrossReviewAdmissionInput {
  readonly repository: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly is_draft: boolean;
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

export function renderProviderNeutralPrReviewComment(
  receipt: ProviderNeutralReviewReceiptV3,
): string {
  const validated = validateProviderNeutralReviewReceipt(receipt);
  return [INDEPENDENT_PR_REVIEW_COMMENT_MARKER, "```json", JSON.stringify(validated), "```"].join(
    "\n",
  );
}

function extractReceipt(body: string): CanonicalReceipt | null {
  if (!body.includes(INDEPENDENT_PR_REVIEW_COMMENT_MARKER)) return null;
  const match = body.match(/```json\s*([\s\S]*?)\s*```/u);
  if (!match?.[1]) return null;
  let value: unknown;
  try {
    value = JSON.parse(match[1]);
  } catch {
    return null;
  }
  try {
    if (
      value &&
      typeof value === "object" &&
      (value as { schemaVersion?: unknown }).schemaVersion === "helix-claude-pr-review-receipt.v2"
    ) {
      return validateClaudePrReviewReceipt(value);
    }
    return validateProviderNeutralReviewReceipt(value);
  } catch {
    return null;
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
    const receipt = extractReceipt(comment.body);
    return receipt ? [{ comment, receipt, fields: receiptFields(receipt) }] : [];
  });
  if (candidates.length === 0) {
    return {
      ok: false,
      deferred: false,
      receipt_digest: null,
      reasons: ["current_head_review_receipt_missing"],
    };
  }
  const valid = candidates.filter(({ comment, fields }) => {
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
      (fields.commentUrl === null || fields.commentUrl === comment.html_url) &&
      Number.isFinite(Date.parse(comment.created_at)) &&
      Number.isFinite(Date.parse(fields.reviewedAt)) &&
      Date.parse(fields.reviewedAt) <= Date.parse(comment.created_at) &&
      ci?.head_sha === input.candidate_head &&
      ci.conclusion === "success"
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
