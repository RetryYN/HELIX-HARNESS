import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import {
  closeSync,
  cpSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { z } from "zod";
import { parseClaudeIndependentPrReviewComment } from "./claude-pr-convergence";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export type IndependentReviewProvider = "claude" | "kimi";
export type ReviewRiskClass = "low" | "medium" | "high" | "critical";
export type ReviewFallbackReason =
  | "provider_quota_exhausted"
  | "provider_unavailable"
  | "provider_claim_timeout";

export function validateClaudeAdmissionCommentEvidence(input: {
  repository: string;
  pr_number: number;
  comment_url: string;
  head_sha: string;
  verdict: "approve" | "block";
  blocker_count: number;
  ci_run_id: number;
  ci_conclusion: "success" | "failure";
  db_receipt_schema_version: string | null;
  db_receipt_digest: string | null;
  receipt_digest: string;
  fetched_html_url: string | undefined;
  fetched_body: string | undefined;
}): void {
  const comment = input.comment_url.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)#issuecomment-(\d+)$/u,
  );
  const receipt =
    typeof input.fetched_body === "string"
      ? parseClaudeIndependentPrReviewComment(input.fetched_body)
      : null;
  if (
    comment &&
    input.fetched_html_url === input.comment_url &&
    receipt?.repository === input.repository &&
    receipt.prNumber === input.pr_number &&
    receipt.headSha === input.head_sha &&
    receipt.verdict === input.verdict &&
    receipt.blockerCount === input.blocker_count &&
    receipt.ciRunId === input.ci_run_id &&
    receipt.ciConclusion === input.ci_conclusion &&
    receipt.dbReceiptSchemaVersion === input.db_receipt_schema_version &&
    receipt.dbReceiptDigest === input.db_receipt_digest &&
    receipt.receiptDigest === input.receipt_digest
  )
    return;
  const required = [
    "<!-- HELIX:claude-pr-review-receipt:v2 -->",
    `Claude Code convergence review: verdict=${input.verdict}, blockers=${input.blocker_count}`,
    `HEAD: \`${input.head_sha}\``,
    `CI run: ${input.ci_run_id} (${input.ci_conclusion})`,
    `DB receipt: ${input.db_receipt_schema_version} / \`${input.db_receipt_digest}\``,
    `receipt digest: \`${input.receipt_digest}\``,
  ];
  if (
    !comment ||
    comment[1] !== input.repository ||
    Number(comment[2]) !== input.pr_number ||
    input.fetched_html_url !== input.comment_url ||
    typeof input.fetched_body !== "string" ||
    required.some((line) => !input.fetched_body?.includes(line))
  ) {
    throw new Error("kimi_review_admission_verifier_comment_unverified");
  }
}

export interface ReviewProviderFailureCapability {
  readonly kind: "review_provider_failure";
  readonly provider: "claude";
  readonly candidate_head: string;
  readonly exit_code: number | null;
  readonly stderr_digest: Sha256Digest;
  readonly reason: ReviewFallbackReason;
  readonly observed_at: string;
  readonly evidence_digest: Sha256Digest;
}

export interface ReviewFallbackLeaseCapability {
  readonly kind: "review_fallback_lease";
  readonly repository: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly generation: number;
  readonly provider: IndependentReviewProvider;
  readonly issued_at: string;
  readonly expires_at: string;
  readonly lease_digest: Sha256Digest;
}

export interface KimiReviewOutputCapability {
  readonly kind: "kimi_review_output";
  readonly candidate_head: string;
  readonly verdict: "approve" | "block";
  readonly blocker_count: number;
  readonly findings: readonly z.infer<typeof findingSchema>[];
  readonly findings_digest: Sha256Digest;
  readonly output_digest: Sha256Digest;
}

export interface KimiReviewFallbackAdmissionReceiptV2 {
  readonly schema_version: "helix-kimi-review-fallback-admission.v2";
  readonly provider: "kimi";
  readonly task_class: "pr_convergence_review";
  readonly admitted_risk_classes: readonly ["low", "medium"];
  /**
   * 受け入れ試験を通した lane 実装の material digest。利用時の gate はこの digest で行う。
   * v1 は `admission_implementation_head` を gate に使っていたが、merge commit 方式では
   * lane PR の head sha は merge 後の HEAD と一致せず、lane と無関係な merge でも失効した。
   */
  readonly admission_lane_closure_digest: Sha256Digest;
  /** 受け入れ試験を実施した commit。provenance として残すが gate には使わない。 */
  readonly admission_implementation_head: string;
  readonly benchmark_fixture_digest: Sha256Digest;
  readonly negative_oracle_digest: Sha256Digest;
  readonly independent_verifier_provider: "claude";
  readonly independent_verifier_receipt_digest: Sha256Digest;
  readonly verdict: "admit";
  readonly issued_at: string;
  readonly expires_at: string;
  readonly receipt_digest: Sha256Digest;
}

export type KimiReviewExecutionFailureCode =
  | "KIMI_REVIEW_SANDBOX_UNAVAILABLE"
  | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
  | "KIMI_REVIEW_ACP_PROTOCOL_INVALID"
  | "KIMI_REVIEW_PROCESS_FAILED"
  | "KIMI_REVIEW_OUTPUT_INVALID"
  | "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"
  | "KIMI_REVIEW_HEAD_MISMATCH";

const providerFailures = new WeakSet<ReviewProviderFailureCapability>();
const fallbackLeases = new WeakSet<ReviewFallbackLeaseCapability>();
const kimiOutputs = new WeakSet<KimiReviewOutputCapability>();
const activeLeaseKeys = new Set<string>();

// S4 admission は「期限付き」を契約に掲げる。上限が無いと発行側が任意の遠い expires_at を
// 置けてしまい bounded validity が名目化するため、有効期間そのものに上限を課す。
const MAX_ADMISSION_VALIDITY_MS = 24 * 60 * 60 * 1000;

function validHead(value: string): boolean {
  return /^[a-f0-9]{40}$/u.test(value);
}

function validIso(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function validateKimiReviewFallbackAdmission(
  value: unknown,
  now: string,
): KimiReviewFallbackAdmissionReceiptV2 {
  if (!value || typeof value !== "object" || !validIso(now)) {
    throw new Error("kimi_review_admission_invalid");
  }
  const receipt = value as KimiReviewFallbackAdmissionReceiptV2;
  const { receipt_digest: claimed, ...payload } = receipt;
  if (
    receipt.schema_version !== "helix-kimi-review-fallback-admission.v2" ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.admission_lane_closure_digest) ||
    receipt.provider !== "kimi" ||
    receipt.task_class !== "pr_convergence_review" ||
    !Array.isArray(receipt.admitted_risk_classes) ||
    receipt.admitted_risk_classes.length !== 2 ||
    receipt.admitted_risk_classes[0] !== "low" ||
    receipt.admitted_risk_classes[1] !== "medium" ||
    !validHead(receipt.admission_implementation_head) ||
    receipt.independent_verifier_provider !== "claude" ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.independent_verifier_receipt_digest) ||
    receipt.verdict !== "admit" ||
    !validIso(receipt.issued_at) ||
    !validIso(receipt.expires_at) ||
    Date.parse(receipt.issued_at) >= Date.parse(receipt.expires_at) ||
    Date.parse(receipt.expires_at) - Date.parse(receipt.issued_at) > MAX_ADMISSION_VALIDITY_MS ||
    Date.parse(now) > Date.parse(receipt.expires_at) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.benchmark_fixture_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.negative_oracle_digest) ||
    claimed !== sha256Digest(canonicalJson(payload))
  ) {
    throw new Error("kimi_review_admission_invalid");
  }
  return Object.freeze(receipt);
}

/**
 * 実行しようとしている lane 実装の closure digest と admission を照合する。
 * 「受け入れ試験を通した実装＝いま動く実装」の同一性はここで担保する。
 */
export function validateKimiReviewFallbackAdmissionForImplementation(
  value: unknown,
  now: string,
  laneClosureDigest: string,
): KimiReviewFallbackAdmissionReceiptV2 {
  const receipt = validateKimiReviewFallbackAdmission(value, now);
  if (
    !/^sha256:[a-f0-9]{64}$/u.test(laneClosureDigest) ||
    receipt.admission_lane_closure_digest !== laneClosureDigest
  ) {
    throw new Error("kimi_review_admission_lane_closure_digest_mismatch");
  }
  return receipt;
}

const benchmarkCaseOutcomes = {
  clean_approve: "approve",
  seeded_blocker: "block",
  tool_request: "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED",
  schema_drift: "KIMI_REVIEW_OUTPUT_INVALID",
  quota_switch: "kimi",
} as const;

const admissionBenchmarkEvidenceSchema = z
  .object({
    schema_version: z.literal("helix-kimi-review-fallback-benchmark.v2"),
    provider: z.literal("kimi"),
    task_class: z.literal("pr_convergence_review"),
    implementation_head: z.string().regex(/^[a-f0-9]{40}$/u),
    lane_closure_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    cases: z.array(
      z
        .object({
          case_id: z.enum(
            Object.keys(benchmarkCaseOutcomes) as [
              keyof typeof benchmarkCaseOutcomes,
              ...(keyof typeof benchmarkCaseOutcomes)[],
            ],
          ),
          observed_outcome: z.string().min(1),
          passed: z.literal(true),
          evidence_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((value, context) => {
    const expected = Object.keys(benchmarkCaseOutcomes).sort();
    const actual = value.cases.map((entry) => entry.case_id).sort();
    if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
      context.addIssue({ code: "custom", message: "benchmark case exact set mismatch" });
    }
    for (const entry of value.cases) {
      if (entry.observed_outcome !== benchmarkCaseOutcomes[entry.case_id]) {
        context.addIssue({
          code: "custom",
          message: `benchmark outcome mismatch:${entry.case_id}`,
        });
      }
    }
  });

const negativeMutationIds = [
  "remove_head_binding",
  "allow_high_risk",
  "allow_tool_activity",
  "reuse_stale_receipt",
  // closure digest 束縛の完全性を証明する。member の内容が変わったとき、および closure から
  // member を落としたときに admission が失効しなければ、束縛は名目でしかない。
  "closure_member_drift",
  "closure_member_removed",
] as const;
const admissionNegativeOracleSchema = z
  .object({
    schema_version: z.literal("helix-kimi-review-fallback-negative-oracle.v2"),
    implementation_head: z.string().regex(/^[a-f0-9]{40}$/u),
    lane_closure_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    mutations: z.array(
      z
        .object({
          mutation_id: z.enum(negativeMutationIds),
          killed: z.literal(true),
          evidence_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((value, context) => {
    const actual = value.mutations.map((entry) => entry.mutation_id).sort();
    const expected = [...negativeMutationIds].sort();
    if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
      context.addIssue({ code: "custom", message: "negative mutation exact set mismatch" });
    }
  });

export function buildKimiReviewFallbackAdmission(input: {
  benchmark_evidence: unknown;
  negative_oracle_evidence: unknown;
  independent_verifier_receipt_digest: Sha256Digest;
  independent_verifier_implementation_head: string;
  issued_at: string;
  expires_at: string;
}): KimiReviewFallbackAdmissionReceiptV2 {
  const benchmark = admissionBenchmarkEvidenceSchema.parse(input.benchmark_evidence);
  const negativeOracle = admissionNegativeOracleSchema.parse(input.negative_oracle_evidence);
  if (
    benchmark.implementation_head !== negativeOracle.implementation_head ||
    benchmark.implementation_head !== input.independent_verifier_implementation_head ||
    // bench と negative oracle は同一 lane closure を観測していなければならない。
    // 片方だけ別実装の観測だと「試験した実装」が一意に定まらない。
    benchmark.lane_closure_digest !== negativeOracle.lane_closure_digest
  ) {
    throw new Error("kimi_review_admission_invalid");
  }
  const payload = {
    schema_version: "helix-kimi-review-fallback-admission.v2" as const,
    provider: "kimi" as const,
    task_class: "pr_convergence_review" as const,
    admitted_risk_classes: Object.freeze(["low", "medium"] as const),
    admission_lane_closure_digest: benchmark.lane_closure_digest as Sha256Digest,
    admission_implementation_head: benchmark.implementation_head,
    benchmark_fixture_digest: sha256Digest(canonicalJson(benchmark)),
    negative_oracle_digest: sha256Digest(canonicalJson(negativeOracle)),
    independent_verifier_provider: "claude" as const,
    independent_verifier_receipt_digest: input.independent_verifier_receipt_digest,
    verdict: "admit" as const,
    issued_at: input.issued_at,
    expires_at: input.expires_at,
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  return validateKimiReviewFallbackAdmission(receipt, input.issued_at);
}

export function persistKimiReviewFallbackAdmission(
  receiptRoot: string,
  receipt: KimiReviewFallbackAdmissionReceiptV2,
): string {
  const validated = validateKimiReviewFallbackAdmission(receipt, receipt.issued_at);
  if (!receiptRoot.startsWith("/")) throw new Error("admission_root_invalid");
  mkdirSync(receiptRoot, { recursive: true, mode: 0o700 });
  const path = join(receiptRoot, `${validated.receipt_digest.slice("sha256:".length)}.json`);
  const content = `${canonicalJson(validated)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("admission_receipt_conflict");
  }
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, content);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

export function classifyReviewProviderFailure(input: {
  provider: "claude";
  candidate_head: string;
  exit_code: number | null;
  stderr: string;
  observed_at: string;
}):
  | { ok: true; capability: ReviewProviderFailureCapability }
  | { ok: false; failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" } {
  if (!validHead(input.candidate_head) || !validIso(input.observed_at) || input.exit_code === 0) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" };
  }
  const stderr = input.stderr.toLowerCase();
  const reason: ReviewFallbackReason | null =
    stderr.includes("weekly limit") || stderr.includes("usage limit")
      ? "provider_quota_exhausted"
      : stderr.includes("unavailable") || stderr.includes("could not connect")
        ? "provider_unavailable"
        : stderr.includes("claim timeout")
          ? "provider_claim_timeout"
          : null;
  if (!reason) return { ok: false, failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" };
  const payload = {
    provider: input.provider,
    candidate_head: input.candidate_head,
    exit_code: input.exit_code,
    stderr_digest: sha256Digest(input.stderr),
    observed_at: input.observed_at,
    reason,
  };
  const capability = Object.freeze({
    kind: "review_provider_failure" as const,
    provider: input.provider,
    candidate_head: input.candidate_head,
    exit_code: input.exit_code,
    stderr_digest: payload.stderr_digest,
    reason,
    observed_at: input.observed_at,
    evidence_digest: sha256Digest(canonicalJson(payload)),
  });
  providerFailures.add(capability);
  return { ok: true, capability };
}

export function selectIndependentReviewProvider(input: {
  primary: "claude";
  fallback: "kimi";
  primary_failure: ReviewProviderFailureCapability | null;
  candidate_head: string;
  task_class: string;
  risk_class: ReviewRiskClass;
  admitted_fallback_task_classes: readonly string[];
}):
  | {
      ok: true;
      provider: IndependentReviewProvider;
      reason: "primary_healthy" | ReviewFallbackReason;
      evidence_digest?: Sha256Digest;
    }
  | {
      ok: false;
      failure_code:
        | "REVIEW_FALLBACK_EVIDENCE_UNSEALED"
        | "REVIEW_FALLBACK_HEAD_MISMATCH"
        | "REVIEW_FALLBACK_TASK_NOT_ADMITTED"
        | "REVIEW_FALLBACK_RISK_NOT_ADMITTED";
    } {
  if (!input.primary_failure) return { ok: true, provider: "claude", reason: "primary_healthy" };
  if (!providerFailures.has(input.primary_failure)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_EVIDENCE_UNSEALED" };
  }
  if (input.primary_failure.candidate_head !== input.candidate_head) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_HEAD_MISMATCH" };
  }
  if (!input.admitted_fallback_task_classes.includes(input.task_class)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_TASK_NOT_ADMITTED" };
  }
  if (input.risk_class === "high" || input.risk_class === "critical") {
    return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_NOT_ADMITTED" };
  }
  return {
    ok: true,
    provider: "kimi",
    reason: input.primary_failure.reason,
    evidence_digest: input.primary_failure.evidence_digest,
  };
}

const REVIEW_RISK_RANK: Readonly<Record<ReviewRiskClass, number>> = Object.freeze({
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
});

// third-party provider へ exact diff を渡す経路なので、security / authority surface は
// 一律 high として非 admitted 側へ落とす。router 側で導出できない限り risk 境界は
// 呼び出し側の自己申告に過ぎず、contract の「低・中 risk だけ」を強制できない。
const HIGH_RISK_REVIEW_PATH_PREFIXES = [
  // hook 配線と subagent allowlist は runtime authority surface。
  ".claude/",
  ".github/actions/",
  ".github/workflows/",
  "migrations/",
  "src/state-db/",
] as const;

// runtime への指示正本。path segment 語彙では拾えないため exact 指定する。
const HIGH_RISK_REVIEW_PATH_EXACT: ReadonlySet<string> = new Set(["AGENTS.md", "CLAUDE.md"]);

const HIGH_RISK_REVIEW_PATH_WORDS: ReadonlySet<string> = new Set([
  "admission",
  "auth",
  "authentication",
  "authorization",
  "authn",
  "authz",
  "billing",
  "credential",
  "credentials",
  "cutover",
  "distribution",
  "guard",
  "guards",
  "licence",
  "license",
  "merge",
  "payment",
  "payments",
  "pii",
  "release",
  "review",
  "reviewed",
  "secret",
  "secrets",
  "token",
  "tokens",
]);

function highRiskReviewPath(path: string): boolean {
  if (HIGH_RISK_REVIEW_PATH_EXACT.has(path)) return true;
  if (HIGH_RISK_REVIEW_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  return path
    .split("/")
    .flatMap((segment) => segment.split(/[.\-_]/u))
    .some((word) => HIGH_RISK_REVIEW_PATH_WORDS.has(word.toLowerCase()));
}

/**
 * 変更 path から review risk class を導出する。`--risk` の自己申告だけでは
 * high/critical な PR も `--risk low` で fallback 経路に乗せられるため、router 自身が
 * 分類して自己申告と突き合わせる。分類できない空集合は fail-close する。
 */
export function deriveReviewRiskClass(
  changedPaths: readonly string[],
):
  | { ok: true; risk_class: ReviewRiskClass }
  | { ok: false; failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE" } {
  const paths = changedPaths.filter((path) => path.trim().length > 0);
  if (paths.length === 0) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE" };
  }
  if (paths.some(highRiskReviewPath)) return { ok: true, risk_class: "high" };
  const documentationOnly = paths.every(
    (path) => path.startsWith("docs/") || path.endsWith(".md") || path.endsWith(".txt"),
  );
  return { ok: true, risk_class: documentationOnly ? "low" : "medium" };
}

/**
 * unified diff から changed path 集合を取り出す。git は `core.quotePath` 既定で空白・非 ASCII path を
 * `"a/..."` と quote するため、header 行を 1 行でも解釈できなければ過小分類せず fail-close する
 * （黙って読み飛ばすと該当 file が risk 導出から漏れる）。CLI へ埋め込まず純関数として切り出し、
 * oracle がこの分岐を直接通れるようにする。
 */
export function parseChangedPathsFromDiff(
  diff: string,
):
  | { ok: true; changed_paths: string[] }
  | { ok: false; failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE" } {
  const changed: string[] = [];
  for (const line of diff.split("\n")) {
    if (!line.startsWith("diff --git ")) continue;
    const header = /^diff --git a\/(\S+) b\/(\S+)$/u.exec(line);
    if (!header) return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE" };
    changed.push(header[1] as string, header[2] as string);
  }
  return { ok: true, changed_paths: [...new Set(changed)] };
}

/**
 * 導出 risk と申告 risk を突き合わせる。申告が導出を下回る（過小申告）場合と、
 * 導出 risk が admitted 集合に無い場合を fail-close する。
 */
export function admitDeclaredReviewRisk(input: {
  declared: ReviewRiskClass;
  changed_paths: readonly string[];
  admitted_risk_classes: readonly ReviewRiskClass[];
}):
  | { ok: true; risk_class: ReviewRiskClass }
  | {
      ok: false;
      failure_code:
        | "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE"
        | "REVIEW_FALLBACK_RISK_UNDERDECLARED"
        | "REVIEW_FALLBACK_RISK_NOT_ADMITTED";
    } {
  const derived = deriveReviewRiskClass(input.changed_paths);
  if (!derived.ok) return derived;
  if (REVIEW_RISK_RANK[input.declared] < REVIEW_RISK_RANK[derived.risk_class]) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_UNDERDECLARED" };
  }
  if (
    !input.admitted_risk_classes.includes(derived.risk_class) ||
    !input.admitted_risk_classes.includes(input.declared)
  ) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_NOT_ADMITTED" };
  }
  return { ok: true, risk_class: derived.risk_class };
}

export function issueReviewFallbackLease(input: {
  repository: string;
  pr_number: number;
  candidate_head: string;
  generation: number;
  provider: IndependentReviewProvider;
  issued_at: string;
  expires_at: string;
}):
  | { ok: true; capability: ReviewFallbackLeaseCapability }
  | {
      ok: false;
      failure_code: "REVIEW_FALLBACK_LEASE_INVALID" | "REVIEW_FALLBACK_LEASE_CONFLICT";
    } {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(input.repository) ||
    !Number.isSafeInteger(input.pr_number) ||
    input.pr_number <= 0 ||
    !validHead(input.candidate_head) ||
    !Number.isSafeInteger(input.generation) ||
    input.generation <= 0 ||
    !validIso(input.issued_at) ||
    !validIso(input.expires_at) ||
    Date.parse(input.expires_at) <= Date.parse(input.issued_at)
  ) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_LEASE_INVALID" };
  }
  const key = `${input.repository}#${input.pr_number}:${input.candidate_head}:${input.generation}`;
  if (activeLeaseKeys.has(key)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_LEASE_CONFLICT" };
  }
  const payload = { schema_version: "helix-review-fallback-lease.v1", ...input };
  const capability = Object.freeze({
    kind: "review_fallback_lease" as const,
    ...input,
    lease_digest: sha256Digest(canonicalJson(payload)),
  });
  activeLeaseKeys.add(key);
  fallbackLeases.add(capability);
  return { ok: true, capability };
}

export function persistReviewFallbackLease(
  leaseRoot: string,
  lease: ReviewFallbackLeaseCapability,
  maxAttemptsPerHead = 1,
): string | null {
  if (
    !fallbackLeases.has(lease) ||
    !leaseRoot.startsWith("/") ||
    !Number.isSafeInteger(maxAttemptsPerHead) ||
    maxAttemptsPerHead < 1
  ) {
    return null;
  }
  mkdirSync(leaseRoot, { recursive: true, mode: 0o700 });
  let attempts = 0;
  for (const name of readdirSync(leaseRoot)) {
    if (!name.endsWith(".json")) continue;
    try {
      const existing = JSON.parse(readFileSync(join(leaseRoot, name), "utf8")) as Record<
        string,
        unknown
      >;
      if (
        existing.repository === lease.repository &&
        existing.pr_number === lease.pr_number &&
        existing.candidate_head === lease.candidate_head &&
        existing.provider === "kimi"
      ) {
        attempts += 1;
      }
    } catch {
      return null;
    }
  }
  if (attempts >= maxAttemptsPerHead) return null;
  // 走査と作成の間には TOCTOU がある。generation はファイル名 digest に入るため、generation の
  // 異なる並行プロセスは別名で書けてしまい HEAD あたりの上限を超える。HEAD 単位のスロットを
  // O_EXCL で先に確保し、上限そのものを原子的に決める。
  const headSlotKey = sha256Digest(
    canonicalJson({
      repository: lease.repository,
      pr_number: lease.pr_number,
      candidate_head: lease.candidate_head,
      provider: lease.provider,
    }),
  ).slice("sha256:".length);
  let reservedSlot: string | null = null;
  for (let slot = 0; slot < maxAttemptsPerHead; slot += 1) {
    const slotPath = join(leaseRoot, `${headSlotKey}.${slot}.attempt`);
    try {
      closeSync(openSync(slotPath, "wx", 0o600));
      reservedSlot = slotPath;
      break;
    } catch {
      // 既に確保済みのスロットは次を試す。
    }
  }
  if (!reservedSlot) return null;
  const identity = sha256Digest(
    canonicalJson({
      repository: lease.repository,
      pr_number: lease.pr_number,
      candidate_head: lease.candidate_head,
      generation: lease.generation,
    }),
  );
  const path = join(leaseRoot, `${identity.slice("sha256:".length)}.json`);
  let descriptor: number;
  try {
    descriptor = openSync(path, "wx", 0o600);
  } catch {
    rmSync(reservedSlot, { force: true });
    return null;
  }
  try {
    writeFileSync(descriptor, `${canonicalJson(lease)}\n`);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

export function buildKimiFallbackInvocation(input: {
  executable: string;
  model: string;
  review_packet: string;
  kimi_code_home: string;
}):
  | {
      ok: true;
      command: string;
      args: string[];
      env: Record<string, string>;
      prompt: string;
      model: string;
      packet_digest: Sha256Digest;
    }
  | { ok: false; failure_code: "KIMI_REVIEW_INVOCATION_INVALID" } {
  if (
    !input.executable.startsWith("/") ||
    !input.kimi_code_home.startsWith("/") ||
    input.review_packet.length === 0 ||
    input.review_packet.length > 512 * 1024 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/u.test(input.model)
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_INVOCATION_INVALID" };
  }
  const boundedPacket = kimiReviewPrompt(input.review_packet);
  return {
    ok: true,
    command: input.executable,
    args: ["acp"],
    env: {
      KIMI_CODE_HOME: input.kimi_code_home,
      KIMI_CODE_EXPERIMENTAL_FLAG: "1",
      KIMI_DISABLE_TELEMETRY: "1",
      KIMI_CODE_NO_AUTO_UPDATE: "1",
    },
    prompt: boundedPacket,
    model: input.model,
    packet_digest: kimiReviewPacketDigest(input.review_packet),
  };
}

function kimiReviewPrompt(reviewPacket: string): string {
  return [
    "HELIX independent review output contract:",
    '{"schema_version":"helix-kimi-pr-review-output.v1","candidate_head":"<40 lowercase hex>","verdict":"approve|block","blocker_count":0,"findings":[{"severity":"critical|high|medium","path":"<relative path>","line":1,"code":"<stable code>","message":"<finding>"}]}',
    "blocker_count MUST equal findings.length; approve iff blocker_count is zero.",
    "Use only the bounded review packet below. Do not call tools, request permissions, read files, run commands, or inspect the workspace.",
    "Return only the required JSON between HELIX_REVIEW_JSON_START and HELIX_REVIEW_JSON_END.",
    "Review packet:",
    reviewPacket,
  ].join("\n");
}

export function kimiReviewPacketDigest(reviewPacket: string): Sha256Digest {
  return sha256Digest(kimiReviewPrompt(reviewPacket));
}

export interface KimiReviewSandboxPlan {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly policy_digest: Sha256Digest;
  readonly model: string;
}

export function buildKimiReviewSandboxPlan(input: {
  bubblewrap_path: string;
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  host_kimi_code_home: string;
  scratch_path: string;
}):
  | { ok: true; plan: KimiReviewSandboxPlan }
  | {
      ok: false;
      failure_code: "KIMI_REVIEW_SANDBOX_UNAVAILABLE" | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED";
    } {
  if (
    !input.bubblewrap_path.startsWith("/") ||
    !existsSync(input.bubblewrap_path) ||
    !existsSync(input.invocation.command)
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_SANDBOX_UNAVAILABLE" };
  }
  const authBindings = ["config.toml", "credentials", "oauth", "device_id"];
  if (authBindings.some((entry) => !existsSync(join(input.host_kimi_code_home, entry)))) {
    return { ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" };
  }
  const sandboxKimiHome = "/helix-kimi-home";
  const sandboxRuntime = "/helix-provider/kimi";
  const args = [
    "--unshare-user",
    "--unshare-pid",
    "--unshare-ipc",
    "--unshare-uts",
    "--die-with-parent",
    "--new-session",
    "--clearenv",
    "--ro-bind",
    "/usr",
    "/usr",
    "--ro-bind",
    "/lib",
    "/lib",
    "--ro-bind",
    "/lib64",
    "/lib64",
    "--ro-bind",
    "/etc/ssl",
    "/etc/ssl",
    "--ro-bind",
    "/etc/resolv.conf",
    "/etc/resolv.conf",
    "--ro-bind",
    "/etc/hosts",
    "/etc/hosts",
    "--ro-bind",
    "/etc/nsswitch.conf",
    "/etc/nsswitch.conf",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    "--dir",
    "/workspace",
    "--dir",
    sandboxKimiHome,
    "--dir",
    "/helix-provider",
    "--ro-bind",
    input.invocation.command,
    sandboxRuntime,
    "--ro-bind",
    join(input.host_kimi_code_home, "config.toml"),
    `${sandboxKimiHome}/config.toml`,
    "--bind",
    join(input.host_kimi_code_home, "credentials"),
    `${sandboxKimiHome}/credentials`,
    "--bind",
    join(input.host_kimi_code_home, "oauth"),
    `${sandboxKimiHome}/oauth`,
    "--ro-bind",
    join(input.host_kimi_code_home, "device_id"),
    `${sandboxKimiHome}/device_id`,
    "--setenv",
    "HOME",
    "/workspace",
    ...Object.entries({
      ...input.invocation.env,
      KIMI_CODE_HOME: sandboxKimiHome,
      PATH: "/usr/bin:/bin",
      LANG: "C.UTF-8",
      TMPDIR: "/tmp",
    }).flatMap(([key, value]) => ["--setenv", key, value]),
    "--chdir",
    "/workspace",
    "--",
    sandboxRuntime,
    ...input.invocation.args,
  ];
  const policy = {
    schema_version: "helix-kimi-review-sandbox.v1",
    filesystem: "bounded-empty-workspace",
    protocol: "acp-v1-json-rpc-stdio",
    client_filesystem: "disabled",
    client_terminal: "disabled",
    mcp_servers: "empty",
    permission_requests: "reject-and-fail",
    tool_activity: "fail-close",
    project_credentials: "not_mounted",
    provider_auth: ["config.toml", "credentials", "oauth", "device_id"],
    // bwrap alone does not implement a hostname egress allowlist. Keep this
    // claim explicit so admission cannot mistake an empty project filesystem
    // for network isolation.
    network: "host-network-provider-transport-unrestricted",
    telemetry: "disabled",
    update: "disabled",
    runtime_digest: sha256Digest(readFileSync(input.invocation.command)),
    requested_model: input.invocation.model,
  };
  return {
    ok: true,
    plan: Object.freeze({
      command: input.bubblewrap_path,
      args: Object.freeze(args),
      env: Object.freeze({}),
      cwd: input.scratch_path,
      policy_digest: sha256Digest(canonicalJson(policy)),
      model: input.invocation.model,
    }),
  };
}

interface AcpResponse {
  readonly jsonrpc?: string;
  readonly id?: number | string;
  readonly method?: string;
  readonly params?: Record<string, unknown>;
  readonly result?: Record<string, unknown>;
  readonly error?: unknown;
}

export interface KimiAcpTranscriptResult {
  readonly output: string;
  readonly session_id: string;
  readonly tool_activity: boolean;
  readonly completed: boolean;
}

export type KimiAcpRunResult =
  | { readonly ok: true; readonly transcript: KimiAcpTranscriptResult }
  | { readonly ok: false; readonly failure_code: KimiReviewExecutionFailureCode };

export function classifyKimiAcpError(message: unknown): KimiReviewExecutionFailureCode {
  if (!message || typeof message !== "object") return "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
  const error = (message as { readonly error?: unknown }).error;
  if (!error || typeof error !== "object") return "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
  const text = (error as { readonly message?: unknown }).message;
  return typeof text === "string" && /authentication required/iu.test(text)
    ? "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
    : "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
}

function acpResponseFor(
  messages: readonly AcpResponse[],
  id: number | string,
): AcpResponse | undefined {
  return messages.find(
    (message) => message.id === id && message.method === undefined && message.result !== undefined,
  );
}

export function evaluateKimiAcpTranscript(
  messages: readonly AcpResponse[],
  requestedModel = "kimi-code/k3-256k",
): KimiAcpTranscriptResult | null {
  const initialized = acpResponseFor(messages, 0)?.result;
  const protocolVersion = initialized?.protocolVersion;
  const agentInfo = initialized?.agentInfo as Record<string, unknown> | undefined;
  if (protocolVersion !== 1 || agentInfo?.name !== "Kimi Code CLI") return null;
  const sessionResult = acpResponseFor(messages, 1)?.result;
  const sessionId = sessionResult?.sessionId;
  if (typeof sessionId !== "string" || sessionId.length === 0) return null;
  const selectedValue = (result: Record<string, unknown> | undefined, id: string): unknown => {
    const options = result?.configOptions;
    if (!Array.isArray(options)) return undefined;
    return (
      options.find((option) => (option as Record<string, unknown>).id === id) as
        | Record<string, unknown>
        | undefined
    )?.currentValue;
  };
  if (selectedValue(acpResponseFor(messages, 2)?.result, "mode") !== "plan") {
    return null;
  }
  if (selectedValue(acpResponseFor(messages, 3)?.result, "model") !== requestedModel) {
    return null;
  }
  const promptResult = acpResponseFor(messages, 4)?.result;
  if (promptResult?.stopReason !== "end_turn") return null;
  let output = "";
  let toolActivity = false;
  for (const message of messages) {
    if (message.method === "session/request_permission") toolActivity = true;
    if (message.method === "fs/read_text_file" || message.method === "fs/write_text_file") {
      toolActivity = true;
    }
    if (message.method === "terminal/create" || message.method === "terminal/output") {
      toolActivity = true;
    }
    if (message.method !== "session/update") continue;
    const update = message.params?.update as Record<string, unknown> | undefined;
    if (typeof update?.sessionUpdate === "string" && update.sessionUpdate.includes("tool")) {
      toolActivity = true;
    }
    if (update?.sessionUpdate === "agent_message_chunk") {
      const content = update.content as Record<string, unknown> | undefined;
      if (content?.type === "text" && typeof content.text === "string") output += content.text;
    }
  }
  return { output, session_id: sessionId, tool_activity: toolActivity, completed: true };
}

export function runKimiAcp(
  plan: KimiReviewSandboxPlan,
  prompt: string,
  timeoutMs: number,
): Promise<KimiAcpRunResult> {
  return new Promise((resolve) => {
    const child: ChildProcessWithoutNullStreams = spawn(plan.command, [...plan.args], {
      cwd: plan.cwd,
      env: plan.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const messages: AcpResponse[] = [];
    let buffer = "";
    let settled = false;
    const send = (value: object): void => {
      child.stdin.write(`${JSON.stringify(value)}\n`);
    };
    const finish = (value: KimiAcpRunResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGTERM");
      resolve(value);
    };
    const protocolFailure = (): KimiAcpRunResult => ({
      ok: false,
      failure_code: "KIMI_REVIEW_ACP_PROTOCOL_INVALID",
    });
    const timer = setTimeout(() => finish(protocolFailure()), timeoutMs);
    child.once("error", () => finish({ ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" }));
    child.once("close", () => {
      if (!settled) {
        finish({ ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" });
      }
    });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      while (buffer.includes("\n")) {
        const newline = buffer.indexOf("\n");
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let message: AcpResponse;
        try {
          message = JSON.parse(line) as AcpResponse;
        } catch {
          finish(protocolFailure());
          return;
        }
        messages.push(message);
        if (message.method === undefined && message.error !== undefined) {
          finish({ ok: false, failure_code: classifyKimiAcpError(message) });
          return;
        }
        if (message.method === "session/request_permission" && message.id !== undefined) {
          const options = (message.params?.options ?? []) as Array<Record<string, unknown>>;
          const rejected = options.find((option) =>
            ["reject_always", "reject_once"].includes(String(option.kind)),
          );
          send({
            jsonrpc: "2.0",
            id: message.id,
            result: rejected
              ? { outcome: { outcome: "selected", optionId: rejected.optionId } }
              : { outcome: { outcome: "cancelled" } },
          });
        } else if (message.method && message.id !== undefined) {
          send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "denied" } });
        }
        const isResponse = message.method === undefined && message.result !== undefined;
        if (isResponse && message.id === 0) {
          send({
            jsonrpc: "2.0",
            id: 1,
            method: "session/new",
            params: { cwd: "/workspace", mcpServers: [] },
          });
        } else if (isResponse && message.id === 1) {
          send({
            jsonrpc: "2.0",
            id: 2,
            method: "session/set_config_option",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              configId: "mode",
              value: "plan",
            },
          });
        } else if (isResponse && message.id === 2) {
          send({
            jsonrpc: "2.0",
            id: 3,
            method: "session/set_config_option",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              configId: "model",
              value: plan.model,
            },
          });
        } else if (isResponse && message.id === 3) {
          send({
            jsonrpc: "2.0",
            id: 4,
            method: "session/prompt",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              prompt: [{ type: "text", text: prompt }],
            },
          });
        } else if (isResponse && message.id === 4) {
          const transcript = evaluateKimiAcpTranscript(messages, plan.model);
          finish(transcript ? { ok: true, transcript } : protocolFailure());
        }
      }
    });
    send({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: 1,
        clientCapabilities: {
          fs: { readTextFile: false, writeTextFile: false },
          terminal: false,
        },
        clientInfo: { name: "HELIX", version: "1" },
      },
    });
  });
}

/**
 * provider auth の scratch copy は rotation を取りこぼす。provider は sandbox 起動直後に refresh
 * token をローテーションし、新しい token は破棄される scratch copy にだけ書かれるため、sandbox 実行
 * 1 回ごとに host 認証が失効する（2026-08-06 実測: staged digest は実行開始 2 秒時点で変化し、同区間で
 * host digest / mtime は不変）。
 *
 * 対処は Node 境界（worker 外）での書き戻しであり、worker には host を触らせない。ただし書き戻しは
 * worker が書いたバイト列を host の認証面へ通す操作であるため、形の検証を fail-close で行う。検証できる
 * のは「形」であって「中身の正当性」ではない — provider CLI 自体が侵害された場合の blast radius は
 * 当該 provider の認証に限定される、という前提で受け入れている。
 */
export const MAX_PROVIDER_AUTH_WRITE_BACK_BYTES = 64 * 1024;

export type ProviderAuthWriteBackRejection =
  | "staged_missing"
  | "staged_not_regular_file"
  | "staged_too_large"
  | "staged_unreadable"
  | "staged_not_json_object"
  | "host_unreadable"
  | "host_not_json_object"
  | "key_set_mismatch"
  | "value_type_mismatch"
  | "empty_token"
  | "expiry_not_advanced";

export type ProviderAuthWriteBackDecision =
  | { action: "skip"; reason: "unchanged"; host_digest: Sha256Digest }
  | { action: "reject"; reason: ProviderAuthWriteBackRejection }
  | { action: "write"; host_digest: Sha256Digest; staged_digest: Sha256Digest };

function jsonObjectOrNull(bytes: Buffer): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

function valueShape(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * 書き戻しの可否を決める純関数。I/O を持たないため、oracle が全 reject 分岐を直接通れる。
 */
export function evaluateProviderAuthWriteBack(input: {
  host: Buffer;
  staged: Buffer | null;
  staged_exists: boolean;
  staged_is_regular_file: boolean;
}): ProviderAuthWriteBackDecision {
  // 「存在しない」と「存在するが regular file でない」を混同しない。後者は host 側の別 path へ
  // 書き込みを誘導し得る攻撃形であり、前者とは扱いが違う。
  if (!input.staged_exists) return { action: "reject", reason: "staged_missing" };
  if (!input.staged_is_regular_file) return { action: "reject", reason: "staged_not_regular_file" };
  // 存在して regular file なのに読めない (lstat と read の間の削除・権限変更) のは、不存在とも
  // JSON 破損とも別の失敗である。audit で原因を切り分けられるよう畳み込まない。
  if (input.staged === null) return { action: "reject", reason: "staged_unreadable" };
  if (input.staged.byteLength > MAX_PROVIDER_AUTH_WRITE_BACK_BYTES)
    return { action: "reject", reason: "staged_too_large" };
  const hostDigest = sha256Digest(input.host.toString("utf8"));
  const stagedDigest = sha256Digest(input.staged.toString("utf8"));
  if (hostDigest === stagedDigest)
    return { action: "skip", reason: "unchanged", host_digest: hostDigest };
  const staged = jsonObjectOrNull(input.staged);
  if (staged === null) return { action: "reject", reason: "staged_not_json_object" };
  // host が読めないと key 集合を比較できず、形の検証が成立しない。fail-close する。
  const host = jsonObjectOrNull(input.host);
  if (host === null) return { action: "reject", reason: "host_not_json_object" };
  const hostKeys = Object.keys(host).sort();
  const stagedKeys = Object.keys(staged).sort();
  if (hostKeys.length !== stagedKeys.length || hostKeys.some((k, i) => k !== stagedKeys[i]))
    return { action: "reject", reason: "key_set_mismatch" };
  for (const key of hostKeys) {
    if (valueShape(host[key]) !== valueShape(staged[key]))
      return { action: "reject", reason: "value_type_mismatch" };
  }
  for (const key of ["access_token", "refresh_token"] as const) {
    const value = staged[key];
    if (typeof value !== "string" || value.length === 0)
      return { action: "reject", reason: "empty_token" };
  }
  // 巻き戻し (古い credential の再投入) を拒否する。rotation は必ず期限を前進させる。
  const stagedExpiry = staged.expires_at;
  const hostExpiry = host.expires_at;
  if (
    typeof stagedExpiry !== "number" ||
    typeof hostExpiry !== "number" ||
    !(stagedExpiry > hostExpiry)
  )
    return { action: "reject", reason: "expiry_not_advanced" };
  return { action: "write", host_digest: hostDigest, staged_digest: stagedDigest };
}

/** 事前に存在し得ない staging directory 内へ新規作成する。既存 entry があれば `O_EXCL` で失敗する。 */
function writeNewFile(path: string, bytes: Buffer): void {
  const fd = openSync(path, "wx", 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

export interface ProviderAuthWriteBackResult {
  decision: ProviderAuthWriteBackDecision;
  wrote: boolean;
  /**
   * 書き込みフェーズの失敗理由。`decision.action === "write"` なのに `wrote === false` の状態を
   * 無言にすると、本来閉じたはずの「rotation 取りこぼしで実行ごとに host 認証が失効する」事象が
   * 恒久的な I/O 失敗 (権限変更、disk full 等) で再発しても切り分けられない。reject 系と同格の
   * 失敗理由として audit evidence へ残す。secret を含み得ないため errno code だけを添える。
   */
  write_error: string | null;
  /** staging directory の後片付けに失敗した。host 置換の成否には影響しない。 */
  cleanup_failed: boolean;
}

function errnoCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : "unknown";
}

/**
 * scratch 破棄前に、rotate された credential を host へ atomic に戻す。secret 値は返さず digest だけを
 * 返し、caller が audit evidence へ記録する。
 */
export function reclaimRotatedProviderAuth(input: {
  host_credentials_path: string;
  staged_credentials_path: string;
}): ProviderAuthWriteBackResult {
  let stagedBytes: Buffer | null = null;
  let stagedExists = false;
  let stagedIsRegularFile = false;
  try {
    stagedIsRegularFile = lstatSync(input.staged_credentials_path).isFile();
    stagedExists = true;
    if (stagedIsRegularFile) stagedBytes = readFileSync(input.staged_credentials_path);
  } catch {
    stagedBytes = null;
  }
  let hostBytes: Buffer;
  try {
    hostBytes = readFileSync(input.host_credentials_path);
  } catch {
    return {
      // host が読めないのは「JSON として壊れている」のとは別の失敗である。
      decision: { action: "reject", reason: "host_unreadable" },
      wrote: false,
      write_error: null,
      cleanup_failed: false,
    };
  }
  const decision = evaluateProviderAuthWriteBack({
    host: hostBytes,
    staged: stagedBytes,
    staged_exists: stagedExists,
    staged_is_regular_file: stagedIsRegularFile,
  });
  if (decision.action !== "write" || stagedBytes === null)
    return { decision, wrote: false, write_error: null, cleanup_failed: false };
  // 書き込み側も symlink を追従させない。固定 path へ直接書くと、事前に植えられた symlink を
  // `"w"` がたどって target を truncate し、backup path 経由では host credential の平文が任意 path へ
  // 流出する。読み側 (lstat) だけ塞いで書き側を放置すると防御が非対称になる。
  // 事前に存在し得ない staging directory の中で作成し、`rename` で所定 path へ移す。`rename` は
  // 宛先が symlink でも link 自体を置き換え、target へは書き込まない。`rm` してから作り直す方式と
  // 違って、削除と作成の間に再度植えられる TOCTOU 窓を持たない。
  const backupPath = `${input.host_credentials_path}.helix-bak`;
  let stagingDir: string | null = null;
  let wrote = false;
  let writeError: string | null = null;
  try {
    stagingDir = mkdtempSync(`${input.host_credentials_path}.helix-`);
    const stagedBackup = join(stagingDir, "bak");
    const stagedNext = join(stagingDir, "next");
    // 書き戻し中の中断で host credential を失わないよう、backup を先に確定させる。
    writeNewFile(stagedBackup, hostBytes);
    writeNewFile(stagedNext, stagedBytes);
    renameSync(stagedBackup, backupPath);
    renameSync(stagedNext, input.host_credentials_path);
    wrote = true;
  } catch (error) {
    writeError = `io_error:${errnoCode(error)}`;
  }
  // 後片付けの失敗で host 置換の結果を masking しない。staging directory が残っても害は無いが、
  // 例外を伝播させると成功した review を失敗として報告してしまう。
  let cleanupFailed = false;
  if (stagingDir !== null) {
    try {
      rmSync(stagingDir, { recursive: true, force: true });
    } catch {
      cleanupFailed = true;
    }
  }
  return { decision, wrote, write_error: writeError, cleanup_failed: cleanupFailed };
}

export async function executeKimiFallbackReview(input: {
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  candidate_head: string;
  bubblewrap_path: string;
  host_kimi_code_home: string;
  scratch_base: string;
  timeout_ms?: number;
}): Promise<
  | {
      ok: true;
      capability: KimiReviewOutputCapability;
      policy_digest: Sha256Digest;
      reviewer_session: string;
      provider_auth_write_back: ProviderAuthWriteBackResult | null;
    }
  | {
      ok: false;
      failure_code: KimiReviewExecutionFailureCode;
      provider_auth_write_back?: ProviderAuthWriteBackResult | null;
    }
> {
  const scratch = mkdtempSync(join(input.scratch_base, "kimi-review-"));
  let authWriteBack: ProviderAuthWriteBackResult | null = null;
  try {
    const stagedAuth = join(scratch, "provider-auth");
    mkdirSync(stagedAuth, { mode: 0o700 });
    for (const entry of ["config.toml", "credentials", "oauth", "device_id"] as const) {
      const source = join(input.host_kimi_code_home, entry);
      if (!existsSync(source)) {
        return { ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" };
      }
      cpSync(source, join(stagedAuth, entry), { recursive: true, force: false });
    }
    const planned = buildKimiReviewSandboxPlan({
      bubblewrap_path: input.bubblewrap_path,
      invocation: input.invocation,
      host_kimi_code_home: stagedAuth,
      scratch_path: scratch,
    });
    if (!planned.ok) return planned;
    let transcript: Awaited<ReturnType<typeof runKimiAcp>>;
    try {
      transcript = await runKimiAcp(
        planned.plan,
        input.invocation.prompt,
        input.timeout_ms ?? 10 * 60 * 1000,
      );
    } finally {
      // rotation は review の成否と無関係に起きるため、失敗経路でも必ず回収する。
      // 回収しないと sandbox 実行 1 回ごとに host 認証が失効する。
      authWriteBack = reclaimRotatedProviderAuth({
        host_credentials_path: join(input.host_kimi_code_home, "credentials", "kimi-code.json"),
        staged_credentials_path: join(stagedAuth, "credentials", "kimi-code.json"),
      });
    }
    if (!transcript.ok) return { ...transcript, provider_auth_write_back: authWriteBack };
    const parsed = parseKimiReviewOutput(
      transcript.transcript.output,
      input.candidate_head,
      transcript.transcript.tool_activity,
    );
    if (!parsed.ok) return { ...parsed, provider_auth_write_back: authWriteBack };
    return {
      ok: true,
      capability: parsed.capability,
      policy_digest: planned.plan.policy_digest,
      reviewer_session: transcript.transcript.session_id,
      provider_auth_write_back: authWriteBack,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const findingSchema = z
  .object({
    severity: z.enum(["critical", "high", "medium"]),
    path: z.string().min(1),
    line: z.number().int().positive(),
    code: z.string().min(1),
    message: z.string().min(1),
  })
  .strict();
const outputSchema = z
  .object({
    schema_version: z.literal("helix-kimi-pr-review-output.v1"),
    candidate_head: z.string().regex(/^[a-f0-9]{40}$/u),
    verdict: z.enum(["approve", "block"]),
    blocker_count: z.number().int().nonnegative(),
    findings: z.array(findingSchema),
  })
  .strict()
  .superRefine((value, context) => {
    if ((value.verdict === "approve") !== (value.blocker_count === 0)) {
      context.addIssue({ code: "custom", message: "verdict and blocker_count mismatch" });
    }
    if (value.blocker_count !== value.findings.length) {
      context.addIssue({ code: "custom", message: "blocker_count and findings mismatch" });
    }
  });

export function parseKimiReviewOutput(
  output: string,
  candidateHead: string,
  toolActivityDetected: boolean,
):
  | { ok: true; capability: KimiReviewOutputCapability }
  | {
      ok: false;
      failure_code:
        | "KIMI_REVIEW_OUTPUT_INVALID"
        | "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"
        | "KIMI_REVIEW_HEAD_MISMATCH";
    } {
  if (toolActivityDetected) {
    return { ok: false, failure_code: "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED" };
  }
  const start = "HELIX_REVIEW_JSON_START";
  const end = "HELIX_REVIEW_JSON_END";
  const startIndex = output.indexOf(start);
  const endIndex = output.indexOf(end);
  if (
    startIndex < 0 ||
    endIndex < 0 ||
    output.indexOf(start, startIndex + start.length) >= 0 ||
    output.indexOf(end, endIndex + end.length) >= 0 ||
    endIndex <= startIndex
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(output.slice(startIndex + start.length, endIndex).trim());
  } catch {
    return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  }
  const parsed = outputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  if (parsed.data.candidate_head !== candidateHead) {
    return { ok: false, failure_code: "KIMI_REVIEW_HEAD_MISMATCH" };
  }
  const outputDigest = sha256Digest(canonicalJson(parsed.data));
  const capability = Object.freeze({
    kind: "kimi_review_output" as const,
    candidate_head: parsed.data.candidate_head,
    verdict: parsed.data.verdict,
    blocker_count: parsed.data.blocker_count,
    findings: Object.freeze(parsed.data.findings.map((finding) => Object.freeze({ ...finding }))),
    findings_digest: sha256Digest(canonicalJson(parsed.data.findings)),
    output_digest: outputDigest,
  });
  kimiOutputs.add(capability);
  return { ok: true, capability };
}

export interface ProviderNeutralReviewReceiptV4 {
  schema_version: "helix-independent-pr-review-receipt.v4";
  repository: string;
  pr_number: number;
  candidate_head: string;
  declared_author_runtime: string;
  reviewer_provider: IndependentReviewProvider;
  reviewer_runtime: string;
  reviewer_model: string;
  reviewer_session: string;
  admission_receipt_digest: Sha256Digest;
  fallback_implementation_head: string;
  /** review 実行時に実測した lane closure digest。admission と一致しなければ receipt を出さない。 */
  fallback_lane_closure_digest: Sha256Digest;
  implementation_tree: string;
  fallback_reason: ReviewFallbackReason;
  fallback_evidence_digest: Sha256Digest;
  lease_digest: Sha256Digest;
  lease_issued_at: string;
  lease_expires_at: string;
  review_packet_digest: Sha256Digest;
  output_digest: Sha256Digest;
  findings_digest: Sha256Digest;
  verdict: "approve" | "block";
  blocker_count: number;
  ci_run_id: number;
  ci_conclusion: "success";
  db_receipt_digest: Sha256Digest;
  db_converged: true;
  reviewed_at: string;
  receipt_digest: Sha256Digest;
}

export function buildProviderNeutralReviewReceipt(input: {
  repository: string;
  pr_number: number;
  candidate_head: string;
  declared_author_runtime: string;
  reviewer_provider: "kimi";
  reviewer_runtime: string;
  reviewer_model: string;
  reviewer_session: string;
  admission_receipt: KimiReviewFallbackAdmissionReceiptV2;
  fallback_implementation_head: string;
  /** review 実行時に実測した lane closure digest。admission と一致しなければ receipt を出さない。 */
  fallback_lane_closure_digest: Sha256Digest;
  implementation_tree: string;
  fallback_evidence: ReviewProviderFailureCapability;
  lease: ReviewFallbackLeaseCapability;
  review_packet_digest: Sha256Digest;
  output: KimiReviewOutputCapability;
  ci_run_id: number;
  ci_conclusion: "success";
  db_receipt_digest: Sha256Digest;
  db_converged: true;
  reviewed_at: string;
}):
  | { ok: true; receipt: ProviderNeutralReviewReceiptV4 }
  | { ok: false; failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" } {
  if (
    !providerFailures.has(input.fallback_evidence) ||
    !fallbackLeases.has(input.lease) ||
    !kimiOutputs.has(input.output) ||
    input.admission_receipt.admission_lane_closure_digest !== input.fallback_lane_closure_digest ||
    !/^sha256:[a-f0-9]{64}$/u.test(input.fallback_lane_closure_digest) ||
    !validHead(input.fallback_implementation_head) ||
    !validHead(input.implementation_tree) ||
    input.fallback_evidence.candidate_head !== input.candidate_head ||
    input.lease.candidate_head !== input.candidate_head ||
    input.lease.repository !== input.repository ||
    input.lease.pr_number !== input.pr_number ||
    input.lease.provider !== input.reviewer_provider ||
    input.output.candidate_head !== input.candidate_head ||
    // build 側も validate と同じ強度で検査する。TypeScript の型は build 入力が任意 JSON 由来
    // (CLI 引数、receipt 再構成) のとき実行時保証にならず、非文字列だと `.length` が undefined に
    // なって独立性判定も長さ判定も素通りする。
    typeof input.declared_author_runtime !== "string" ||
    input.declared_author_runtime.length === 0 ||
    input.declared_author_runtime === input.reviewer_runtime ||
    !Number.isSafeInteger(input.ci_run_id) ||
    input.ci_run_id <= 0 ||
    !validIso(input.reviewed_at) ||
    // lease は 20 分の実行窓を意味する。発行後に一切参照しないと、期限切れ後に完了した実行や
    // failure evidence より前に発行された lease でも有効な receipt になってしまう。
    Date.parse(input.fallback_evidence.observed_at) > Date.parse(input.lease.issued_at) ||
    Date.parse(input.reviewed_at) < Date.parse(input.lease.issued_at) ||
    Date.parse(input.reviewed_at) > Date.parse(input.lease.expires_at)
  ) {
    return { ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" };
  }
  const payload = {
    schema_version: "helix-independent-pr-review-receipt.v4" as const,
    repository: input.repository,
    pr_number: input.pr_number,
    candidate_head: input.candidate_head,
    declared_author_runtime: input.declared_author_runtime,
    reviewer_provider: input.reviewer_provider,
    reviewer_runtime: input.reviewer_runtime,
    reviewer_model: input.reviewer_model,
    reviewer_session: input.reviewer_session,
    admission_receipt_digest: input.admission_receipt.receipt_digest,
    fallback_implementation_head: input.fallback_implementation_head,
    fallback_lane_closure_digest: input.fallback_lane_closure_digest,
    implementation_tree: input.implementation_tree,
    fallback_reason: input.fallback_evidence.reason,
    fallback_evidence_digest: input.fallback_evidence.evidence_digest,
    lease_digest: input.lease.lease_digest,
    lease_issued_at: input.lease.issued_at,
    lease_expires_at: input.lease.expires_at,
    review_packet_digest: input.review_packet_digest,
    output_digest: input.output.output_digest,
    findings_digest: input.output.findings_digest,
    verdict: input.output.verdict,
    blocker_count: input.output.blocker_count,
    ci_run_id: input.ci_run_id,
    ci_conclusion: input.ci_conclusion,
    db_receipt_digest: input.db_receipt_digest,
    db_converged: input.db_converged,
    reviewed_at: input.reviewed_at,
  };
  return {
    ok: true,
    receipt: Object.freeze({ ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) }),
  };
}

export function validateProviderNeutralReviewReceipt(
  value: unknown,
): ProviderNeutralReviewReceiptV4 {
  if (!value || typeof value !== "object") throw new Error("receipt_object_required");
  const receipt = value as ProviderNeutralReviewReceiptV4;
  const { receipt_digest: claimed, ...payload } = receipt;
  if (
    receipt.schema_version !== "helix-independent-pr-review-receipt.v4" ||
    receipt.reviewer_provider !== "kimi" ||
    // 旧 `!== "codex"` は非文字列を暗黙に拒否していた。自己申告へ緩めた分、型検証は明示する。
    // 非文字列だと `.length` が undefined になり長さ判定も独立性判定も素通りする。
    typeof receipt.declared_author_runtime !== "string" ||
    receipt.declared_author_runtime.length === 0 ||
    receipt.declared_author_runtime === receipt.reviewer_runtime ||
    receipt.reviewer_runtime !== "kimi-code-cli" ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(receipt.repository) ||
    !Number.isSafeInteger(receipt.pr_number) ||
    receipt.pr_number <= 0 ||
    !validHead(receipt.candidate_head) ||
    !validHead(receipt.fallback_implementation_head) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.fallback_lane_closure_digest) ||
    !validHead(receipt.implementation_tree) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.admission_receipt_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.fallback_evidence_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.lease_digest) ||
    !validIso(receipt.lease_issued_at) ||
    !validIso(receipt.lease_expires_at) ||
    Date.parse(receipt.lease_issued_at) >= Date.parse(receipt.lease_expires_at) ||
    Date.parse(receipt.reviewed_at) < Date.parse(receipt.lease_issued_at) ||
    Date.parse(receipt.reviewed_at) > Date.parse(receipt.lease_expires_at) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.review_packet_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.output_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.findings_digest) ||
    !Number.isSafeInteger(receipt.ci_run_id) ||
    receipt.ci_run_id <= 0 ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.db_receipt_digest) ||
    receipt.verdict !== "approve" ||
    receipt.blocker_count !== 0 ||
    receipt.ci_conclusion !== "success" ||
    receipt.db_converged !== true ||
    !validIso(receipt.reviewed_at) ||
    claimed !== sha256Digest(canonicalJson(payload))
  ) {
    throw new Error("provider_neutral_receipt_invalid");
  }
  return Object.freeze(receipt);
}

export function persistProviderNeutralReviewReceipt(
  receiptRoot: string,
  receipt: ProviderNeutralReviewReceiptV4,
): string {
  const validated = validateProviderNeutralReviewReceipt(receipt);
  if (!receiptRoot.startsWith("/")) throw new Error("receipt_root_invalid");
  mkdirSync(receiptRoot, { recursive: true, mode: 0o700 });
  const path = join(receiptRoot, `${validated.receipt_digest.slice("sha256:".length)}.json`);
  const content = `${canonicalJson(validated)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("review_receipt_conflict");
  }
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, content);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

export function loadProviderNeutralReviewReceipt(
  path: string,
  canonicalReceiptRoot?: string,
  canonicalAdmissionRoot?: string,
): ProviderNeutralReviewReceiptV4 {
  if (canonicalReceiptRoot && dirname(resolve(path)) !== resolve(canonicalReceiptRoot)) {
    throw new Error("provider_neutral_receipt_noncanonical_path");
  }
  const receipt = validateProviderNeutralReviewReceipt(
    JSON.parse(readFileSync(path, "utf8")) as unknown,
  );
  if (basename(path) !== `${receipt.receipt_digest.slice("sha256:".length)}.json`) {
    throw new Error("provider_neutral_receipt_filename_mismatch");
  }
  if (canonicalAdmissionRoot) {
    const admissionPath = join(
      resolve(canonicalAdmissionRoot),
      `${receipt.admission_receipt_digest.slice("sha256:".length)}.json`,
    );
    if (!existsSync(admissionPath))
      throw new Error("provider_neutral_admission_provenance_missing");
    const admission = validateKimiReviewFallbackAdmission(
      JSON.parse(readFileSync(admissionPath, "utf8")) as unknown,
      receipt.reviewed_at,
    );
    if (
      admission.receipt_digest !== receipt.admission_receipt_digest ||
      admission.admission_lane_closure_digest !== receipt.fallback_lane_closure_digest
    ) {
      throw new Error("provider_neutral_admission_provenance_invalid");
    }
  }
  return receipt;
}

export function evaluateProviderNeutralReviewMerge(
  state: {
    repository: string;
    pr_number: number;
    candidate_head: string;
    state: "OPEN" | "CLOSED" | "MERGED";
    required_checks_green: boolean;
    receipt_ci_matches_head: boolean;
  },
  receipt: ProviderNeutralReviewReceiptV4,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = ["provider_neutral_receipt_advisory_only"];
  if (state.repository !== receipt.repository || state.pr_number !== receipt.pr_number) {
    reasons.push("pr_identity_mismatch");
  }
  if (state.candidate_head !== receipt.candidate_head) reasons.push("review_head_stale");
  if (state.state !== "OPEN") reasons.push("pr_not_open");
  if (!state.required_checks_green) reasons.push("required_checks_not_green");
  if (!state.receipt_ci_matches_head) reasons.push("receipt_ci_head_mismatch");
  if (receipt.declared_author_runtime === receipt.reviewer_runtime)
    reasons.push("runtime_independence_missing");
  if (receipt.verdict !== "approve" || receipt.blocker_count !== 0) {
    reasons.push("review_not_approved");
  }
  if (!receipt.db_converged) reasons.push("db_not_converged");
  return { ok: reasons.length === 0, reasons };
}
