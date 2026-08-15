import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkCrossAgentModelPair, modelProviderFromId } from "../schema";
import * as authorEvidence from "./author-runtime-evidence";
import { claudeMemoryRuntimeRoot, dispatchMeasuredPrToClaude } from "./claude-memory-wake";
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
export type MeasuredAuthorRuntime = IndependentReviewRuntime | "mixed" | "external";

export interface AuthorRuntimeCommit {
  message: string;
  parentCount: number;
  /** GitHub API の `author.type == "Bot"`。未指定は非 bot（PLAN-RECOVERY-51）。 */
  bot?: boolean;
}

/**
 * receipt に申告できる authoring runtime。
 *
 * `CLAUDE.md`「Hybrid 多ランタイム commit 協調」は、相手 runtime の commit の上へ自分の成果を
 * 積むこと（stack / rebase）を必須運用として規定している。したがって両 runtime の実装 commit が
 * 同居するブランチは事故ではなく規定運用の正常な帰結であり、`mixed` はその正直な申告である
 * （Issue #539）。`mixed` を単一 runtime と同格に扱うのではなく、admission 側で
 * 「寄与した各 runtime の分を相手がレビューした receipt を両方要求する」ことで独立性を維持する。
 */
export type AttestedAuthorRuntime = IndependentReviewRuntime | "mixed" | "external";

/**
 * attestation evidence を取得する `gh api -q` の jq query（`parseAuthorRuntimeEvidence` と対）。
 *
 * jq の文字列補間 `\(...)` は TypeScript の文字列リテラルでもエスケープとして解釈されるため、
 * ソース上は `\\(` と書かなければ実行時に `(` へ潰れ、query が literal `(.parents | length):...`
 * を返して evidence が常に不正になる（seal / merge が全件 `author_runtime_evidence_unavailable`
 * へ落ちる — Codex round-1 Critical 指摘）。定数として切り出し、U-CPRCONV-018 で固定する。
 */
export const AUTHOR_RUNTIME_EVIDENCE_QUERY = authorEvidence.AUTHOR_RUNTIME_EVIDENCE_QUERY;

/**
 * attestation evidence を取得する `gh` の実引数（call site を core 側へ束縛する）。
 *
 * query を定数化しても、cli 側が定数を使わず別 query を渡せば evidence は壊れる。
 * 引数構築ごと pure function にして U-CPRCONV-018 が exact 配列を固定し、
 * cli は本関数の戻り値をそのまま `spawnSync` へ渡す（Codex round-2 Important 指摘）。
 * `--paginate` は全 commit を母集団に入れるための必須条件であり、欠落すると
 * page 境界の commit が evidence から落ちる。
 */
export function authorRuntimeEvidenceArgs(repository: string, prNumber: number): string[] {
  return authorEvidence.authorRuntimeEvidenceArgs(repository, prNumber);
}

/**
 * 判定規則: merge commit（parent 2 個以上）を除いた実装 commit を母集団とし、
 * - 全件に Claude trailer → `claude`
 * - 全件に trailer 無し → `codex`
 * - 混在（trailer 有りと無しが同居）→ `mixed`（どちらの申告も通さない fail-close 対象）
 * 実装 commit が 0 件で merge commit に trailer があれば `claude`、無ければ `codex`。
 *
 * merge commit の判定は commit message ではなく parent 数で行う（PLAN-RECOVERY-43）。
 * 旧実装は `Merge ` 始まりの subject で判定していたが、`git merge` に任意 subject を与えた
 * main 同期 merge（例: `chore(memory): sync ... with latest main`）を実装 commit と誤認し、
 * trailer 無しとして `mixed` へ落とす false fail-close を起こしていた（PR #517 で実測）。
 * parent 数は commit graph の事実であり subject 表記の影響を受けない（PLAN-RECOVERY-43）。
 */
export function measuredAuthorRuntimeFromCommits(
  commits: readonly AuthorRuntimeCommit[],
): MeasuredAuthorRuntime {
  return authorEvidence.measuredAuthorRuntimeFromCommits(commits);
}

export type AuthorRuntimeAttestationFailure =
  | "author_runtime_evidence_missing"
  | "author_runtime_evidence_mixed"
  | "author_runtime_attestation_mismatch";

/**
 * 申告 `authorRuntime` と、PR head commits から実測した runtime の突き合わせ。
 * commit message が 1 件も取れない場合（evidence 無し）はどの申告も通さず fail-close する。
 *
 * 実装 commit 間で trailer の有無が混在する場合、単一 runtime の申告は部分偽装の疑いとして
 * 従来どおり `author_runtime_evidence_mixed` で遮断する。一方 `mixed` の申告は、規定運用である
 * Hybrid commit stacking の正直な自己申告として受理する（Issue #539）。この受理は独立性の
 * 緩和ではない: mixed receipt は単独では admission を通らず、寄与した各 runtime の分を
 * 相手がレビューした receipt が両方揃うことを admission 側が要求する。
 * 逆向きの偽装（単一 runtime authored なのに `mixed` と申告して dual-receipt 経路へ逃がす）は
 * 実測値と一致しないため `author_runtime_attestation_mismatch` で遮断される。
 */
export function authorRuntimeAttestationFailure(
  claimedAuthorRuntime: unknown,
  commits: readonly AuthorRuntimeCommit[],
): AuthorRuntimeAttestationFailure | null {
  return authorEvidence.authorRuntimeAttestationFailure(claimedAuthorRuntime, commits);
}

/**
 * `gh api -q '.[] | "\(.parents|length):\(.commit.message|@base64)"'` の raw stdout を
 * commit 配列へ復号する。各行は `<parent 数>:<base64 message>` であり、parent 数は
 * merge commit の判定に使う（message 表記に依存しないため、subject を偽装しても
 * 除外/非除外を操作できない）。
 * canonical base64 でない行（文字種・padding・長さ不正・非正規 encoding）が 1 つでもあれば
 * evidence 全体を無効として `null` を返す（呼出側は `author_runtime_evidence_unavailable` で
 * fail-close する）。文字種 regex だけでは `A` / `AA=` / `AAAAA` のような長さ不正を受理して
 * しまうため（Codex round-2 指摘）、検証の単一 authority を decode → re-encode の round-trip
 * 一致に置く。Node の base64 decoder は不正文字を黙って読み飛ばすが、その場合 re-encode が
 * 元の行と一致しないため、ここで漏れなく拒否される。
 */
export function parseAuthorRuntimeEvidence(stdout: string): AuthorRuntimeCommit[] | null {
  return authorEvidence.parseAuthorRuntimeEvidence(stdout);
}

/** evidence 取得の実行系（cli は `spawnSync("gh", ...)` を渡す。test は spy を渡す）。 */
export type AuthorRuntimeEvidenceRunner = (args: readonly string[]) => {
  status: number | null;
  stdout: string;
};

/** `spawnSync` 互換の最小 signature（core は node:child_process へ直接依存しない）。 */
export type EvidenceSpawn = (
  command: string,
  args: readonly string[],
  options: { cwd: string; encoding: "utf8" },
) => { status: number | null; stdout: string | null };

/**
 * `gh` 実行 adapter。cli 側に adapter を残すと、そこが oracle の届かない面になり
 * 実引数の欠落（`[...args].slice(0, 1)`）が生存する（Codex round-4 Important）。
 * spawn を注入可能にして core へ移し、U-CPRCONV-018 が spy で command と実引数を観測する。
 */
export function ghEvidenceRunner(spawn: EvidenceSpawn, cwd: string): AuthorRuntimeEvidenceRunner {
  return authorEvidence.ghEvidenceRunner(spawn, cwd);
}

/**
 * attestation の全経路（引数構築 → 実行 → 復号 → 突き合わせ）を core が所有する。
 *
 * cli 側に引数構築や分岐を残すと、そこが oracle の届かない面になり、実引数の欠落や
 * query 差し替えを green のまま通してしまう（Codex round-2/3 Important）。cli は
 * runner を渡すだけにして、判断は本関数へ寄せる。runner の非 0 exit と evidence の
 * 形式不正はいずれも `author_runtime_evidence_unavailable` で fail-close する。
 */
export interface AuthorRuntimeAttestationInput {
  repository: string;
  prNumber: number;
  claimedAuthorRuntime: unknown;
  run: AuthorRuntimeEvidenceRunner;
}

export function authorRuntimeAttestation(
  input: AuthorRuntimeAttestationInput,
): { ok: true } | { ok: false; failure: string } {
  return authorEvidence.authorRuntimeAttestation(input);
}

/**
 * dispatch側が宛先を決めるための実測。attestationは「申告が正しいか」を検査するのに対し、
 * 本関数は申告が存在しない段階で「誰が書いたか」を返す（Issue #551）。evidenceが取れない場合は
 * fail-closeし、推測でinboxへ流さない。
 */
export function measureAuthorRuntime(input: {
  repository: string;
  prNumber: number;
  run: AuthorRuntimeEvidenceRunner;
}): { ok: true; measured: MeasuredAuthorRuntime } | { ok: false; failure: string } {
  return authorEvidence.measureAuthorRuntime(input);
}

export interface ClaudePrReviewReceiptInput {
  repository: string;
  prNumber: number;
  prUrl: string;
  headSha: string;
  authorRuntime: AttestedAuthorRuntime;
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

export function areRequiredChecksGreen(checks: readonly RequiredCheckEntry[]): boolean {
  return checks.length > 0 && checks.every((check) => check.bucket === "pass");
}

export function reviewedMergeArgs(prNumber: number, reviewedHead: string): string[] {
  if (!Number.isSafeInteger(prNumber) || prNumber < 1) throw new Error("pr_number_invalid");
  if (!/^[0-9a-f]{40}$/.test(reviewedHead)) throw new Error("head_sha_invalid");
  return ["pr", "merge", String(prNumber), "--merge", "--match-head-commit", reviewedHead];
}

export { dispatchMeasuredPrToClaude };

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
  const mixedAuthor = input.authorRuntime === "mixed";
  // external（bot 著）は HELIX の 2 runtime のどちらでもないため、author 側の runtime /
  // model 束縛を適用しない。守るべき HELIX 著者 runtime が存在せず、どちらの reviewer でも
  // 自己レビューにならないからである（PLAN-RECOVERY-51 / Issue #553）。reviewer 側の束縛は
  // 一切緩めない。
  const externalAuthor = input.authorRuntime === "external";
  if (
    (!mixedAuthor &&
      !externalAuthor &&
      !INDEPENDENT_REVIEW_RUNTIMES.includes(input.authorRuntime as IndependentReviewRuntime)) ||
    !INDEPENDENT_REVIEW_RUNTIMES.includes(input.reviewerRuntime as IndependentReviewRuntime)
  ) {
    return "runtime_identity_invalid";
  }
  if (externalAuthor) {
    // bot に model は存在しない。authorModel は audit のため bot identity（例 `dependabot[bot]`）を
    // 記録するだけで、model id としては解釈しない。ただし「誰が書いたか」の記録を空にはさせない。
    if (input.authorModel.trim() === "") return "runtime_identity_invalid";
    return modelProviderFromId(input.reviewerModel) === input.reviewerRuntime
      ? null
      : "model_runtime_binding_mismatch";
  }
  if (!mixedAuthor && input.authorRuntime === input.reviewerRuntime) {
    return "runtime_independence_missing";
  }
  const authorProvider = modelProviderFromId(input.authorModel);
  // mixed では authorRuntime 単体と reviewer を比較しても独立性を測れない。各 receipt は
  // 「相手 runtime が書いた分を自分がレビューした」証跡なので、独立性の authority を
  // 「authorModel の runtime が reviewer と異なること」に置く（Issue #539）。model pair 検査より
  // 前に評価し、runtime 独立性の失敗が model 独立性の失敗として報告されないようにする。
  if (mixedAuthor) {
    if (!INDEPENDENT_REVIEW_RUNTIMES.includes(authorProvider as IndependentReviewRuntime)) {
      return "model_runtime_binding_mismatch";
    }
    if (authorProvider === input.reviewerRuntime) return "runtime_independence_missing";
  }
  const modelPair = checkCrossAgentModelPair(input.authorModel, input.reviewerModel);
  if (!modelPair.ok) return "model_independence_missing";
  if (!mixedAuthor && authorProvider !== input.authorRuntime) {
    return "model_runtime_binding_mismatch";
  }
  if (modelProviderFromId(input.reviewerModel) !== input.reviewerRuntime) {
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

export function safeClaudePrReviewReceiptName(receipt: ClaudePrReviewReceipt): string {
  return (
    `${receipt.repository.replaceAll("/", "_")}_${receipt.prNumber}_${receipt.headSha}_` +
    `${receipt.reviewerRuntime}.json`
  );
}

export interface ReviewReceiptCommentSealIntent {
  commentUrl: string;
  requiresPost: boolean;
}

/**
 * 未sealed inputのcomment URL境界を正規化する。
 *
 * `null`や空文字をplaceholder URLへ置換した後でraw fieldの有無を再判定すると、実comment投稿を
 * 飛ばしたままplaceholder receiptをpersistできる。投稿要否とbuild用placeholderを同じpure判定から
 * 返し、CLI adapterが別条件へ分岐しないようにする。
 */
export function resolveReviewReceiptCommentSealIntent(
  prUrl: string,
  rawCommentUrl: unknown,
): ReviewReceiptCommentSealIntent {
  const placeholderCommentUrl = `${prUrl}#issuecomment-1`;
  if (rawCommentUrl === undefined || rawCommentUrl === null || rawCommentUrl === "") {
    return {
      commentUrl: placeholderCommentUrl,
      requiresPost: true,
    };
  }
  if (typeof rawCommentUrl !== "string") throw new Error("comment_url_invalid");
  const commentPrefix = `${prUrl}#issuecomment-`;
  const commentId = rawCommentUrl.startsWith(commentPrefix)
    ? rawCommentUrl.slice(commentPrefix.length)
    : "";
  if (rawCommentUrl === placeholderCommentUrl || !/^[1-9]\d*$/u.test(commentId)) {
    throw new Error("comment_url_invalid");
  }
  return { commentUrl: rawCommentUrl, requiresPost: false };
}

export function assertClaudePrReviewReceiptSlotAvailable(
  repoRoot: string,
  receipt: ClaudePrReviewReceipt,
): void {
  validateClaudePrReviewReceipt(receipt);
  const path = join(convergenceRoot(repoRoot), "receipts", safeClaudePrReviewReceiptName(receipt));
  if (existsSync(path)) throw new Error("review_receipt_slot_occupied");
}

export function persistClaudePrReviewReceipt(
  repoRoot: string,
  receipt: ClaudePrReviewReceipt,
): string {
  validateClaudePrReviewReceipt(receipt);
  const dir = join(convergenceRoot(repoRoot), "receipts");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, safeClaudePrReviewReceiptName(receipt));
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
