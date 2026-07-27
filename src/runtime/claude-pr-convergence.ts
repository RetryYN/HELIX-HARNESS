import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { claudeMemoryRuntimeRoot, publishClaudePrReviewRequest } from "./claude-memory-wake";
import { canonicalJson, sha256Digest } from "./digest";

export const CLAUDE_PR_REVIEW_RECEIPT_SCHEMA = "helix-claude-pr-review-receipt.v1" as const;

export interface ClaudePrReviewReceiptInput {
  repository: string;
  prNumber: number;
  prUrl: string;
  headSha: string;
  authorRuntime: "codex";
  reviewerRuntime: "claude";
  reviewerSessionId: string;
  verdict: "approve" | "block";
  blockerCount: number;
  ciRunId: number;
  ciConclusion: "success" | "failure";
  dbCheckpointDigest: string | null;
  dbConverged: boolean;
  commentUrl: string;
  reviewedAt: string;
}

export interface ClaudePrReviewReceipt extends ClaudePrReviewReceiptInput {
  schemaVersion: typeof CLAUDE_PR_REVIEW_RECEIPT_SCHEMA;
  receiptId: string;
  receiptDigest: string;
}

export interface ClaudePrMergeState {
  repository: string;
  prNumber: number;
  prUrl: string;
  headSha: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  requiredChecksGreen: boolean;
  receiptCiMatchesHead: boolean;
}

export interface ClaudePrMergeDecision {
  ok: boolean;
  reasons: string[];
}

export interface CreatedPrDispatchInput {
  pullRequestUrl: string;
  headSha: string;
  baseBranch: string;
}

export function reviewedMergeArgs(prNumber: number, reviewedHead: string): string[] {
  if (!Number.isSafeInteger(prNumber) || prNumber < 1) throw new Error("pr_number_invalid");
  if (!/^[0-9a-f]{40}$/.test(reviewedHead)) throw new Error("head_sha_invalid");
  return ["pr", "merge", String(prNumber), "--merge", "--match-head-commit", reviewedHead];
}

export function dispatchCreatedPrToClaude(
  repoRoot: string,
  input: CreatedPrDispatchInput,
): { memoryId: string; deliveryPath: string } {
  const match = input.pullRequestUrl.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)$/);
  if (!match) throw new Error("created_pr_url_invalid");
  if (!/^[0-9a-f]{40}$/.test(input.headSha)) throw new Error("created_pr_head_invalid");
  const dispatched = publishClaudePrReviewRequest(repoRoot, {
    repository: match[1] ?? "",
    prNumber: Number(match[2]),
    prUrl: input.pullRequestUrl,
    headSha: input.headSha,
    baseBranch: input.baseBranch,
  });
  return {
    memoryId: dispatched.entry.id,
    deliveryPath: dispatched.deliveryPath,
  };
}

function receiptPayload(input: ClaudePrReviewReceiptInput): object {
  const {
    repository,
    prNumber,
    prUrl,
    headSha,
    authorRuntime,
    reviewerRuntime,
    reviewerSessionId,
    verdict,
    blockerCount,
    ciRunId,
    ciConclusion,
    dbCheckpointDigest,
    dbConverged,
    commentUrl,
    reviewedAt,
  } = input;
  return {
    schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA,
    repository,
    prNumber,
    prUrl,
    headSha,
    authorRuntime,
    reviewerRuntime,
    reviewerSessionId,
    verdict,
    blockerCount,
    ciRunId,
    ciConclusion,
    dbCheckpointDigest,
    dbConverged,
    commentUrl,
    reviewedAt,
  };
}

function assertSha256(value: string, field: string): void {
  if (!/^sha256:[0-9a-f]{64}$/.test(value)) throw new Error(`${field}_invalid`);
}

function assertReviewReceiptInput(input: ClaudePrReviewReceiptInput): void {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository)) {
    throw new Error("repository_invalid");
  }
  if (!Number.isSafeInteger(input.prNumber) || input.prNumber < 1) {
    throw new Error("pr_number_invalid");
  }
  if (!/^[0-9a-f]{40}$/.test(input.headSha)) throw new Error("head_sha_invalid");
  if (input.reviewerSessionId.trim() === "") throw new Error("reviewer_session_id_required");
  if (!Number.isSafeInteger(input.ciRunId) || input.ciRunId < 1) {
    throw new Error("ci_run_id_invalid");
  }
  if (!Number.isSafeInteger(input.blockerCount) || input.blockerCount < 0) {
    throw new Error("blocker_count_invalid");
  }
  if (input.verdict === "approve" && input.blockerCount !== 0) {
    throw new Error("approve_with_blockers");
  }
  if (input.verdict === "block" && input.blockerCount === 0) {
    throw new Error("block_without_blockers");
  }
  if (input.dbConverged && input.dbCheckpointDigest === null) {
    throw new Error("db_checkpoint_digest_required");
  }
  if (input.dbCheckpointDigest !== null) {
    assertSha256(input.dbCheckpointDigest, "db_checkpoint_digest");
  }
  const expectedPrUrl = `https://github.com/${input.repository}/pull/${input.prNumber}`;
  if (input.prUrl !== expectedPrUrl) throw new Error("pr_url_binding_mismatch");
  if (!input.commentUrl.startsWith(`${expectedPrUrl}#issuecomment-`)) {
    throw new Error("comment_url_binding_mismatch");
  }
  if (!Number.isFinite(Date.parse(input.reviewedAt))) throw new Error("reviewed_at_invalid");
}

export function buildClaudePrReviewReceipt(
  input: ClaudePrReviewReceiptInput,
): ClaudePrReviewReceipt {
  assertReviewReceiptInput(input);
  const digest = sha256Digest(canonicalJson(receiptPayload(input)));
  return {
    ...input,
    schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA,
    receiptId: `claude-pr-review:${input.repository}#${input.prNumber}:${input.headSha}`,
    receiptDigest: digest,
  };
}

export function validateClaudePrReviewReceipt(value: unknown): ClaudePrReviewReceipt {
  if (!value || typeof value !== "object") throw new Error("receipt_object_required");
  const receipt = value as ClaudePrReviewReceipt;
  if (receipt.schemaVersion !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA) {
    throw new Error("receipt_schema_invalid");
  }
  const expected = buildClaudePrReviewReceipt(receipt);
  if (receipt.receiptId !== expected.receiptId) throw new Error("receipt_id_invalid");
  if (receipt.receiptDigest !== expected.receiptDigest) throw new Error("receipt_digest_invalid");
  return receipt;
}

function convergenceRoot(repoRoot: string): string {
  return join(claudeMemoryRuntimeRoot(repoRoot), "..", "claude-pr-convergence");
}

function safeReceiptName(receipt: ClaudePrReviewReceipt): string {
  return `${receipt.repository.replaceAll("/", "_")}_${receipt.prNumber}_${receipt.headSha}.json`;
}

export function persistClaudePrReviewReceipt(
  repoRoot: string,
  receipt: ClaudePrReviewReceipt,
): string {
  validateClaudePrReviewReceipt(receipt);
  const dir = join(convergenceRoot(repoRoot), "receipts");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, safeReceiptName(receipt));
  const content = `${canonicalJson(receipt)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("review_receipt_conflict");
  }
  const fd = openSync(path, "wx", 0o600);
  try {
    writeFileSync(fd, content);
  } finally {
    closeSync(fd);
  }
  return path;
}

export function loadClaudePrReviewReceipt(path: string): ClaudePrReviewReceipt {
  return validateClaudePrReviewReceipt(JSON.parse(readFileSync(path, "utf8")) as unknown);
}

export function evaluateClaudePrMerge(
  state: ClaudePrMergeState,
  receipt: ClaudePrReviewReceipt,
): ClaudePrMergeDecision {
  const reasons: string[] = [];
  if (state.repository !== receipt.repository) reasons.push("repository_mismatch");
  if (state.prNumber !== receipt.prNumber || state.prUrl !== receipt.prUrl) {
    reasons.push("pr_identity_mismatch");
  }
  if (state.headSha !== receipt.headSha) reasons.push("review_head_stale");
  if (state.state !== "OPEN") reasons.push("pr_not_open");
  if (!state.requiredChecksGreen) reasons.push("required_checks_not_green");
  if (!state.receiptCiMatchesHead) reasons.push("receipt_ci_head_mismatch");
  if (receipt.authorRuntime !== "codex" || receipt.reviewerRuntime !== "claude") {
    reasons.push("runtime_independence_missing");
  }
  if (receipt.verdict !== "approve" || receipt.blockerCount !== 0) {
    reasons.push("review_not_approved");
  }
  if (receipt.ciConclusion !== "success") reasons.push("receipt_ci_not_green");
  if (!receipt.dbConverged) reasons.push("db_not_converged");
  return { ok: reasons.length === 0, reasons };
}
