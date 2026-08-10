import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkCrossAgentModelPair, modelProviderFromId } from "../schema";
import { claudeMemoryRuntimeRoot, publishClaudePrReviewRequest } from "./claude-memory-wake";
import { canonicalJson, sha256Digest } from "./digest";

export const CLAUDE_PR_REVIEW_RECEIPT_SCHEMA = "helix-claude-pr-review-receipt.v3" as const;
export const CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2 = "helix-claude-pr-review-receipt.v2" as const;
export const INDEPENDENT_PR_REVIEW_COMMENT_MARKER =
  "<!-- HELIX:independent-pr-review-receipt:v1 -->" as const;

/**
 * canonical receipt が識別できる AI runtime。
 *
 * Issue #489 の Required behavior は「authoring runtime と reviewer runtime の独立性」という
 * 対称条件であり、どちらの向きが author かを固定していない。ここを literal 固定にすると
 * author=claude の PR が canonical receipt を発行できず、cross-review そのものが片方向にしか
 * 成立しなくなる（Issue #514）。
 */
export type IndependentReviewRuntime = "claude" | "codex";

export const INDEPENDENT_REVIEW_RUNTIMES: readonly IndependentReviewRuntime[] = ["claude", "codex"];

/**
 * Claude runtime の commit は `Co-Authored-By: Claude ...` trailer を運用規約として持つ。
 * PR に含まれる commit message からその整合を実測する（consistency attestation）。
 *
 * これは Issue #534 の是正: `authorRuntime` を申告値のまま信じると、Claude 著の PR に
 * `authorRuntime: "codex"` と偽って seal した receipt が gate を通る（PR #525 で実際に発生）。
 *
 * 限界（cryptographic identity ではない）: trailer は author が commit message を書き換えれば
 * 偽装・除去できる。本 attestation は「申告 1 フィールドの書き換え」で成立していた捏造を
 * 「PR 全 commit の履歴改変」まで引き上げる自己整合検査であり、runtime identity の証明ではない。
 * より強い identity が導入されたら置き換える（PLAN-RECOVERY-42 removal_trigger）。
 */
const CLAUDE_TRAILER_PATTERN = /^co-authored-by:[ \t]*claude\b/imu;

export type MeasuredAuthorRuntime = IndependentReviewRuntime | "mixed";

/**
 * 判定規則: merge commit（`Merge ` 始まり）を除いた実装 commit を母集団とし、
 * - 全件に Claude trailer → `claude`
 * - 全件に trailer 無し → `codex`
 * - 混在（trailer 有りと無しが同居）→ `mixed`（どちらの申告も通さない fail-close 対象）
 * 実装 commit が 0 件で merge commit に trailer があれば `claude`、無ければ `codex`。
 */
export function measuredAuthorRuntimeFromCommitMessages(
  messages: readonly string[],
): MeasuredAuthorRuntime {
  const implementation = messages.filter((message) => !/^Merge /u.test(message));
  const population = implementation.length > 0 ? implementation : messages;
  const withTrailer = population.filter((message) => CLAUDE_TRAILER_PATTERN.test(message)).length;
  if (withTrailer === 0) return "codex";
  if (withTrailer === population.length || implementation.length === 0) return "claude";
  return "mixed";
}

export type AuthorRuntimeAttestationFailure =
  | "author_runtime_evidence_missing"
  | "author_runtime_evidence_mixed"
  | "author_runtime_attestation_mismatch";

/**
 * 申告 `authorRuntime` と、PR head commits から実測した runtime の突き合わせ。
 * commit message が 1 件も取れない場合（evidence 無し）と、trailer の有無が実装 commit 間で
 * 混在する場合（部分偽装または多 runtime 混在の疑い）は、どの申告も通さず fail-close する。
 */
export function authorRuntimeAttestationFailure(
  claimedAuthorRuntime: unknown,
  commitMessages: readonly string[],
): AuthorRuntimeAttestationFailure | null {
  if (commitMessages.length === 0) return "author_runtime_evidence_missing";
  const measured = measuredAuthorRuntimeFromCommitMessages(commitMessages);
  if (measured === "mixed") return "author_runtime_evidence_mixed";
  return measured === claimedAuthorRuntime ? null : "author_runtime_attestation_mismatch";
}

/**
 * `gh api -q '.[].commit.message | @base64'` の raw stdout を commit message 配列へ復号する。
 * canonical base64 でない行（文字種・padding・長さ不正・非正規 encoding）が 1 つでもあれば
 * evidence 全体を無効として `null` を返す（呼出側は `author_runtime_evidence_unavailable` で
 * fail-close する）。文字種 regex だけでは `A` / `AA=` / `AAAAA` のような長さ不正を受理して
 * しまうため（Codex round-2 指摘）、検証の単一 authority を decode → re-encode の round-trip
 * 一致に置く。Node の base64 decoder は不正文字を黙って読み飛ばすが、その場合 re-encode が
 * 元の行と一致しないため、ここで漏れなく拒否される。
 */
export function parseAuthorRuntimeEvidence(stdout: string): string[] | null {
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const messages: string[] = [];
  for (const line of lines) {
    const decoded = Buffer.from(line, "base64");
    if (decoded.toString("base64") !== line) return null;
    messages.push(decoded.toString("utf8"));
  }
  return messages;
}

export interface ClaudePrReviewReceiptInput {
  repository: string;
  prNumber: number;
  prUrl: string;
  headSha: string;
  authorRuntime: IndependentReviewRuntime;
  reviewerRuntime: IndependentReviewRuntime;
  authorModel: string;
  reviewerModel: string;
  reviewerSessionId: string;
  verdict: "approve" | "block";
  blockerCount: number;
  ciRunId: number;
  ciConclusion: "success" | "failure";
  dbReceiptSchemaVersion: string | null;
  dbProjectionDigest: string | null;
  dbReplayProjectionDigest: string | null;
  dbCheckpointDigest: string | null;
  dbReplayCheckpointDigest: string | null;
  dbReceiptDigest: string | null;
  dbConverged: boolean;
  commentUrl: string;
  reviewedAt: string;
}

export interface CanonicalLogicalDbReceipt {
  schema_version: string;
  projection_digest: string;
  replay_projection_digest: string;
  checkpoint_digest: string;
  replay_checkpoint_digest: string;
  receipt_digest: string;
  converged: boolean;
}

export interface ClaudePrReviewReceipt extends ClaudePrReviewReceiptInput {
  schemaVersion: typeof CLAUDE_PR_REVIEW_RECEIPT_SCHEMA;
  receiptId: string;
  receiptDigest: string;
}

/** v2 is a byte-compatible historical decoder only; it is never current Ready evidence. */
export interface ClaudePrReviewReceiptV2
  extends Omit<ClaudePrReviewReceiptInput, "authorModel" | "reviewerModel"> {
  schemaVersion: typeof CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2;
  receiptId: string;
  receiptDigest: string;
}

export type ClaudePrReviewReceiptAny = ClaudePrReviewReceipt | ClaudePrReviewReceiptV2;

type ReviewReceiptCommonInput = Omit<ClaudePrReviewReceiptInput, "authorModel" | "reviewerModel">;

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

export interface RequiredCheckEntry {
  bucket?: string | null;
}

export interface CreatedPrDispatchInput {
  pullRequestUrl: string;
  headSha: string;
  baseBranch: string;
}

export function areRequiredChecksGreen(checks: readonly RequiredCheckEntry[]): boolean {
  return checks.length > 0 && checks.every((check) => check.bucket === "pass");
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
    authorModel,
    reviewerModel,
    reviewerSessionId,
    verdict,
    blockerCount,
    ciRunId,
    ciConclusion,
    dbReceiptSchemaVersion,
    dbProjectionDigest,
    dbReplayProjectionDigest,
    dbCheckpointDigest,
    dbReplayCheckpointDigest,
    dbReceiptDigest,
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
    authorModel,
    reviewerModel,
    reviewerSessionId,
    verdict,
    blockerCount,
    ciRunId,
    ciConclusion,
    dbReceiptSchemaVersion,
    dbProjectionDigest,
    dbReplayProjectionDigest,
    dbCheckpointDigest,
    dbReplayCheckpointDigest,
    dbReceiptDigest,
    dbConverged,
    commentUrl,
    reviewedAt,
  };
}

function assertSha256(value: string, field: string): void {
  if (!/^sha256:[0-9a-f]{64}$/.test(value)) throw new Error(`${field}_invalid`);
}

function reviewPairFailure(input: {
  authorRuntime: unknown;
  reviewerRuntime: unknown;
  authorModel: string;
  reviewerModel: string;
}):
  | "runtime_identity_invalid"
  | "runtime_independence_missing"
  | "model_independence_missing"
  | "model_runtime_binding_mismatch"
  | null {
  if (
    !INDEPENDENT_REVIEW_RUNTIMES.includes(input.authorRuntime as IndependentReviewRuntime) ||
    !INDEPENDENT_REVIEW_RUNTIMES.includes(input.reviewerRuntime as IndependentReviewRuntime)
  ) {
    return "runtime_identity_invalid";
  }
  if (input.authorRuntime === input.reviewerRuntime) return "runtime_independence_missing";
  const modelPair = checkCrossAgentModelPair(input.authorModel, input.reviewerModel);
  if (!modelPair.ok) return "model_independence_missing";
  if (
    modelProviderFromId(input.authorModel) !== input.authorRuntime ||
    modelProviderFromId(input.reviewerModel) !== input.reviewerRuntime
  ) {
    return "model_runtime_binding_mismatch";
  }
  return null;
}

function assertReviewReceiptIdentity(input: ReviewReceiptCommonInput): void {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository)) {
    throw new Error("repository_invalid");
  }
  if (!Number.isSafeInteger(input.prNumber) || input.prNumber < 1) {
    throw new Error("pr_number_invalid");
  }
  if (!/^[0-9a-f]{40}$/.test(input.headSha)) throw new Error("head_sha_invalid");
}

function assertReviewReceiptEvidence(input: ReviewReceiptCommonInput): void {
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
  const dbDigests = [
    ["db_projection_digest", input.dbProjectionDigest],
    ["db_replay_projection_digest", input.dbReplayProjectionDigest],
    ["db_checkpoint_digest", input.dbCheckpointDigest],
    ["db_replay_checkpoint_digest", input.dbReplayCheckpointDigest],
    ["db_receipt_digest", input.dbReceiptDigest],
  ] as const;
  for (const [field, digest] of dbDigests) {
    if (digest != null) assertSha256(digest, field);
  }
  if (input.verdict === "approve") {
    if (
      input.dbReceiptSchemaVersion !== "helix-l3-g3-logical-db-bootstrap-receipt.v2" ||
      dbDigests.some(([, digest]) => digest == null)
    ) {
      throw new Error("canonical_db_receipt_required");
    }
    if (
      input.dbProjectionDigest !== input.dbReplayProjectionDigest ||
      input.dbCheckpointDigest !== input.dbReplayCheckpointDigest ||
      !input.dbConverged
    ) {
      throw new Error("canonical_db_receipt_not_converged");
    }
  }
  const expectedPrUrl = `https://github.com/${input.repository}/pull/${input.prNumber}`;
  if (input.prUrl !== expectedPrUrl) throw new Error("pr_url_binding_mismatch");
  if (!input.commentUrl.startsWith(`${expectedPrUrl}#issuecomment-`)) {
    throw new Error("comment_url_binding_mismatch");
  }
  if (!Number.isFinite(Date.parse(input.reviewedAt))) throw new Error("reviewed_at_invalid");
}

function assertReviewReceiptInput(input: ClaudePrReviewReceiptInput): void {
  assertReviewReceiptIdentity(input);
  const pairFailure = reviewPairFailure(input);
  if (pairFailure) throw new Error(pairFailure);
  assertReviewReceiptEvidence(input);
}

export function bindCanonicalLogicalDbReceipt(
  input: ClaudePrReviewReceiptInput,
  canonical: CanonicalLogicalDbReceipt,
): ClaudePrReviewReceiptInput {
  const claimed = {
    dbReceiptSchemaVersion: input.dbReceiptSchemaVersion,
    dbProjectionDigest: input.dbProjectionDigest,
    dbReplayProjectionDigest: input.dbReplayProjectionDigest,
    dbCheckpointDigest: input.dbCheckpointDigest,
    dbReplayCheckpointDigest: input.dbReplayCheckpointDigest,
    dbReceiptDigest: input.dbReceiptDigest,
    dbConverged: input.dbConverged,
  };
  const authoritative = {
    dbReceiptSchemaVersion: canonical.schema_version,
    dbProjectionDigest: canonical.projection_digest,
    dbReplayProjectionDigest: canonical.replay_projection_digest,
    dbCheckpointDigest: canonical.checkpoint_digest,
    dbReplayCheckpointDigest: canonical.replay_checkpoint_digest,
    dbReceiptDigest: canonical.receipt_digest,
    dbConverged: canonical.converged,
  };
  for (const key of Object.keys(authoritative) as Array<keyof typeof authoritative>) {
    const value = claimed[key];
    if (value !== null && value !== undefined && value !== authoritative[key]) {
      throw new Error(`caller_db_claim_mismatch:${key}`);
    }
  }
  return { ...input, ...authoritative };
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

export function renderIndependentPrReviewComment(receipt: ClaudePrReviewReceipt): string {
  const validated = validateClaudePrReviewReceipt(receipt);
  const envelope = {
    schema_version: "helix-independent-pr-review-comment.v1",
    receipt: validated,
    kimi_provenance: null,
  };
  return [INDEPENDENT_PR_REVIEW_COMMENT_MARKER, "```json", JSON.stringify(envelope), "```"].join(
    "\n",
  );
}

function validateV2Receipt(value: unknown): ClaudePrReviewReceiptV2 {
  if (!value || typeof value !== "object") throw new Error("receipt_object_required");
  const receipt = value as ClaudePrReviewReceiptV2;
  if (receipt.schemaVersion !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2)
    throw new Error("receipt_schema_invalid");
  if (receipt.authorRuntime !== "codex" || receipt.reviewerRuntime !== "claude") {
    throw new Error("receipt_v2_runtime_invalid");
  }
  const { schemaVersion: _schemaVersion, receiptId, receiptDigest, ...payload } = receipt;
  assertReviewReceiptIdentity(payload);
  assertReviewReceiptEvidence(payload);
  const expectedId = `claude-pr-review:${payload.repository}#${payload.prNumber}:${payload.headSha}`;
  if (
    receiptId !== expectedId ||
    receiptDigest !==
      sha256Digest(canonicalJson({ schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...payload }))
  ) {
    throw new Error("receipt_digest_invalid");
  }
  return receipt;
}

export function validateClaudePrReviewReceipt(value: unknown): ClaudePrReviewReceiptAny {
  if (!value || typeof value !== "object") throw new Error("receipt_object_required");
  if ((value as { schemaVersion?: unknown }).schemaVersion === CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2)
    return validateV2Receipt(value);
  const receipt = value as ClaudePrReviewReceipt;
  if (receipt.schemaVersion !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA)
    throw new Error("receipt_schema_invalid");
  const expected = buildClaudePrReviewReceipt(receipt);
  if (receipt.receiptId !== expected.receiptId) throw new Error("receipt_id_invalid");
  if (receipt.receiptDigest !== expected.receiptDigest) throw new Error("receipt_digest_invalid");
  return receipt;
}

/**
 * GitHub commentにsealしたClaude/Codex receiptの唯一のdecoder。
 *
 * current admissionは呼出側でv3だけを選び、Issue closureとKimi bootstrapだけがv2を
 * historical evidenceとして読む。human-readable proseはauthorityにしない。
 */
export function parseClaudeIndependentPrReviewComment(
  body: string,
): ClaudePrReviewReceiptAny | null {
  const markerIndex = body.indexOf(INDEPENDENT_PR_REVIEW_COMMENT_MARKER);
  if (markerIndex < 0 || markerIndex !== body.lastIndexOf(INDEPENDENT_PR_REVIEW_COMMENT_MARKER))
    return null;
  const sealedTail = body.slice(markerIndex + INDEPENDENT_PR_REVIEW_COMMENT_MARKER.length);
  const json = sealedTail.match(/^\s*```json\s*([\s\S]*?)```\s*$/u)?.[1];
  if (!json) return null;
  try {
    const envelope = JSON.parse(json) as { schema_version?: unknown; receipt?: unknown };
    if (envelope.schema_version !== "helix-independent-pr-review-comment.v1") return null;
    const schema = (envelope.receipt as { schemaVersion?: unknown } | null)?.schemaVersion;
    if (schema !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA && schema !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2)
      return null;
    return validateClaudePrReviewReceipt(envelope.receipt);
  } catch {
    return null;
  }
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
  const receipt = validateClaudePrReviewReceipt(JSON.parse(readFileSync(path, "utf8")) as unknown);
  if (receipt.schemaVersion !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA) {
    throw new Error("current_review_receipt_v3_required");
  }
  return receipt;
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
  const pairFailure = reviewPairFailure(receipt);
  if (pairFailure) reasons.push(pairFailure);
  if (receipt.verdict !== "approve" || receipt.blockerCount !== 0) {
    reasons.push("review_not_approved");
  }
  if (receipt.ciConclusion !== "success") reasons.push("receipt_ci_not_green");
  if (!receipt.dbConverged) reasons.push("db_not_converged");
  return { ok: reasons.length === 0, reasons };
}
