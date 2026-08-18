/**
 * Kimi 独立レビュー lane の admission bench（issue #390 / PLAN-DISCOVERY-13 S4 用途限定 admit 配下）。
 *
 * `buildKimiReviewFallbackAdmission` は 5 件の bench case と 7 件の negative mutation が
 * **exact set かつ全 pass / 全 kill** であることを要求する。本 script はその evidence を
 * 実測で採取する。旧 S2 smoke が「digest の preimage 未定義」で再現不能と判定された反省から、
 * 各 case の evidence_digest は **out-dir へ書いた生成物 bytes の sha256** とし、preimage を
 * 常に artifact として残す（第三者が Kimi を起動せず digest を再計算できる）。
 *
 * case の内訳:
 * - clean_approve / seeded_blocker: 隔離 sandbox 内で実 Kimi を起動し、bounded review packet に
 *   対する verdict を観測する（proposal-only。lane 実装の executeKimiFallbackReview をそのまま通す）。
 * - tool_request / schema_drift: lane の output 検証境界を直接叩く決定的 oracle。
 * - quota_switch: Claude quota 枯渇 evidence を封緘し、provider 選択が kimi へ切り替わることを見る。
 *
 * negative mutation は「gate を意図的に緩めた入力」を与え、lane が fail-close するか
 * （= mutation が kill されるか）を確認する。1 件でも生き残れば admission を発行してはならない。
 *
 * 使い方: npx tsx run-admission-bench.ts <out-dir>
 * exit 0 = 5/5 pass かつ 7/7 kill。summary.json を admission 発行の入力に使う。
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../../../src/runtime/digest";
import {
  buildKimiFallbackInvocation,
  classifyReviewProviderFailure,
  executeKimiFallbackReview,
  parseKimiReviewOutput,
  selectIndependentReviewProvider,
  validateKimiReviewFallbackAdmission,
  validateKimiReviewFallbackAdmissionForImplementation,
} from "../../../src/runtime/independent-review-fallback";
import {
  buildReviewLaneClosureManifest,
  computeReviewLaneClosureDigest,
  digestReviewLaneClosureManifest,
  resolveReviewLaneProviderMaterial,
} from "../../../src/runtime/review-lane-closure";
import {
  type AdmissionCaseResult,
  type AdmissionMutationResult,
  buildAdmissionBenchmarkEvidence,
  buildAdmissionNegativeOracleEvidence,
} from "./admission-evidence";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const outDir = process.argv[2];
if (!outDir) {
  process.stderr.write("usage: run-admission-bench.ts <out-dir>\n");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const KIMI_MODEL = "kimi-code/k3-256k";
const ADMITTED_TASK_CLASSES = ["pr_convergence_review"] as const;

/** 生成物を out-dir へ書き、その bytes の digest を evidence とする（preimage 常時 tracked）。 */
function recordEvidence(name: string, body: string): Sha256Digest {
  writeFileSync(join(outDir, name), body);
  return sha256Digest(body);
}

function resolveExecutable(candidates: readonly string[], label: string): string {
  const found = candidates.find((candidate) => candidate.startsWith("/") && existsSync(candidate));
  if (!found) throw new Error(`${label} not found`);
  return found;
}

const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
const kimiHome = join(homedir(), ".kimi-code");
const kimiBin = resolveExecutable([join(kimiHome, "bin", "kimi"), "/usr/local/bin/kimi"], "kimi");
const bwrap = resolveExecutable(
  [join(homedir(), ".local", "bin", "bwrap"), "/usr/bin/bwrap"],
  "bubblewrap",
);
// 受け入れ試験は「どの lane 実装を試験したか」を evidence に刻む。admission の gate は
// repository の HEAD ではなくこの digest で行うため、bench 側も同じ値を実測する。
const providerMaterial = resolveReviewLaneProviderMaterial(kimiBin, KIMI_MODEL);
const laneClosureDigest = computeReviewLaneClosureDigest(repoRoot, providerMaterial);

const cases: AdmissionCaseResult[] = [];
const mutations: AdmissionMutationResult[] = [];

/** bounded review packet を実 Kimi へ渡し、lane が受理した verdict を観測する。 */
async function runReviewCase(caseId: string, fixture: string): Promise<void> {
  const packet = readFileSync(join(here, "fixtures", fixture), "utf8");
  const invocation = buildKimiFallbackInvocation({
    executable: kimiBin,
    model: KIMI_MODEL,
    review_packet: [`candidate_head: ${head}`, "", packet].join("\n"),
    kimi_code_home: kimiHome,
  });
  if (!invocation.ok) throw new Error(`${caseId}: ${invocation.failure_code}`);
  const executed = await executeKimiFallbackReview({
    invocation,
    candidate_head: head,
    bubblewrap_path: bwrap,
    host_kimi_code_home: kimiHome,
    scratch_base: tmpdir(),
  });
  const observed = executed.ok ? executed.capability.verdict : executed.failure_code;
  const evidence = recordEvidence(
    `${caseId}.evidence.json`,
    `${canonicalJson({
      case_id: caseId,
      candidate_head: head,
      packet_digest: invocation.packet_digest,
      model: KIMI_MODEL,
      observed_outcome: observed,
      ...(executed.ok
        ? {
            blocker_count: executed.capability.blocker_count,
            findings_digest: executed.capability.findings_digest,
            output_digest: executed.capability.output_digest,
            policy_digest: executed.policy_digest,
          }
        : {}),
    })}\n`,
  );
  cases.push({
    case_id: caseId,
    observed_outcome: observed,
    passed: observed === (caseId === "clean_approve" ? "approve" : "block"),
    evidence_digest: evidence,
  });
}

/** tool 実行痕跡がある応答は verdict へ落とさず拒否されること。 */
function runToolRequestCase(): void {
  const result = parseKimiReviewOutput(
    `HELIX_REVIEW_JSON_START${JSON.stringify({
      schema_version: "helix-kimi-pr-review-output.v1",
      candidate_head: head,
      verdict: "approve",
      blocker_count: 0,
      findings: [],
    })}HELIX_REVIEW_JSON_END`,
    head,
    true,
  );
  const observed = result.ok ? "approve" : result.failure_code;
  cases.push({
    case_id: "tool_request",
    observed_outcome: observed,
    passed: observed === "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED",
    evidence_digest: recordEvidence(
      "tool_request.evidence.json",
      `${canonicalJson({
        case_id: "tool_request",
        candidate_head: head,
        tool_activity_detected: true,
        observed_outcome: observed,
      })}\n`,
    ),
  });
}

/** 契約外 schema の応答は受理されないこと。 */
function runSchemaDriftCase(): void {
  const drifted = `HELIX_REVIEW_JSON_START${JSON.stringify({
    schema_version: "helix-kimi-pr-review-output.v1",
    candidate_head: head,
    verdict: "looks-good",
    blocker_count: "zero",
  })}HELIX_REVIEW_JSON_END`;
  const result = parseKimiReviewOutput(drifted, head, false);
  const observed = result.ok ? result.capability.verdict : result.failure_code;
  cases.push({
    case_id: "schema_drift",
    observed_outcome: observed,
    passed: observed === "KIMI_REVIEW_OUTPUT_INVALID",
    evidence_digest: recordEvidence(
      "schema_drift.evidence.json",
      `${canonicalJson({
        case_id: "schema_drift",
        candidate_head: head,
        drifted_output_digest: sha256Digest(drifted),
        observed_outcome: observed,
      })}\n`,
    ),
  });
}

/** Claude quota 枯渇時に provider 選択が kimi へ切り替わること。 */
function runQuotaSwitchCase(): void {
  const stderr = "Claude usage limit reached for this week";
  const failure = classifyReviewProviderFailure({
    provider: "claude",
    candidate_head: head,
    exit_code: 1,
    stderr,
    observed_at: "2026-08-08T09:00:00.000Z",
  });
  if (!failure.ok) throw new Error(`quota_switch: ${failure.failure_code}`);
  const selected = selectIndependentReviewProvider({
    primary: "claude",
    fallback: "kimi",
    primary_failure: failure.capability,
    candidate_head: head,
    task_class: "pr_convergence_review",
    risk_class: "low",
    admitted_fallback_task_classes: ADMITTED_TASK_CLASSES,
  });
  const observed = selected.ok ? selected.provider : selected.failure_code;
  cases.push({
    case_id: "quota_switch",
    observed_outcome: observed,
    passed: observed === "kimi",
    evidence_digest: recordEvidence(
      "quota_switch.evidence.json",
      `${canonicalJson({
        case_id: "quota_switch",
        candidate_head: head,
        failure_reason: failure.capability.reason,
        failure_evidence_digest: failure.capability.evidence_digest,
        observed_outcome: observed,
      })}\n`,
    ),
  });
}

function recordMutation(
  mutationId: string,
  killed: boolean,
  detail: Record<string, unknown>,
): void {
  mutations.push({
    mutation_id: mutationId,
    killed,
    evidence_digest: recordEvidence(
      `${mutationId}.mutation.json`,
      `${canonicalJson({ mutation_id: mutationId, candidate_head: head, killed, ...detail })}\n`,
    ),
  });
}

/** HEAD 束縛を外した failure evidence は provider 切替に使えないこと。 */
function mutateRemoveHeadBinding(): void {
  const otherHead = "0".repeat(40);
  const failure = classifyReviewProviderFailure({
    provider: "claude",
    candidate_head: otherHead,
    exit_code: 1,
    stderr: "Claude usage limit reached",
    observed_at: "2026-08-08T09:00:00.000Z",
  });
  if (!failure.ok) throw new Error(failure.failure_code);
  const selected = selectIndependentReviewProvider({
    primary: "claude",
    fallback: "kimi",
    primary_failure: failure.capability,
    candidate_head: head,
    task_class: "pr_convergence_review",
    risk_class: "low",
    admitted_fallback_task_classes: ADMITTED_TASK_CLASSES,
  });
  recordMutation("remove_head_binding", !selected.ok, {
    observed: selected.ok ? selected.provider : selected.failure_code,
  });
}

/** admitted 範囲外の high risk は切替を許さないこと。 */
function mutateAllowHighRisk(): void {
  const failure = classifyReviewProviderFailure({
    provider: "claude",
    candidate_head: head,
    exit_code: 1,
    stderr: "Claude usage limit reached",
    observed_at: "2026-08-08T09:00:00.000Z",
  });
  if (!failure.ok) throw new Error(failure.failure_code);
  const selected = selectIndependentReviewProvider({
    primary: "claude",
    fallback: "kimi",
    primary_failure: failure.capability,
    candidate_head: head,
    task_class: "pr_convergence_review",
    risk_class: "high",
    admitted_fallback_task_classes: ADMITTED_TASK_CLASSES,
  });
  recordMutation("allow_high_risk", !selected.ok, {
    observed: selected.ok ? selected.provider : selected.failure_code,
  });
}

/** tool 実行痕跡があるのに verdict を採用しようとする経路が塞がれていること。 */
function mutateAllowToolActivity(): void {
  const result = parseKimiReviewOutput(
    `HELIX_REVIEW_JSON_START${JSON.stringify({
      schema_version: "helix-kimi-pr-review-output.v1",
      candidate_head: head,
      verdict: "approve",
      blocker_count: 0,
      findings: [],
    })}HELIX_REVIEW_JSON_END`,
    head,
    true,
  );
  recordMutation("allow_tool_activity", !result.ok, {
    observed: result.ok ? result.capability.verdict : result.failure_code,
  });
}

/**
 * lane closure digest に束縛した有効な admission receipt を組み立てる。
 * closure 系 mutation は「この receipt が、別 closure では通らない」ことを示す。
 */
function admissionBoundTo(laneClosureDigest: Sha256Digest): Record<string, unknown> {
  const payload = {
    schema_version: "helix-kimi-review-fallback-admission.v2",
    provider: "kimi",
    task_class: "pr_convergence_review",
    admitted_risk_classes: ["low", "medium"],
    admission_lane_closure_digest: laneClosureDigest,
    admission_implementation_head: head,
    benchmark_fixture_digest: sha256Digest("closure-benchmark"),
    negative_oracle_digest: sha256Digest("closure-oracle"),
    independent_verifier_provider: "claude",
    independent_verifier_receipt_digest: sha256Digest("closure-verifier"),
    verdict: "admit",
    issued_at: "2026-08-09T00:00:00.000Z",
    expires_at: "2026-08-09T12:00:00.000Z",
  };
  return { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) };
}

function recordClosureMutation(
  mutationId: string,
  mutatedDigest: Sha256Digest,
  detail: Record<string, unknown>,
): void {
  let killed = false;
  let observed = "accepted";
  try {
    validateKimiReviewFallbackAdmissionForImplementation(
      admissionBoundTo(laneClosureDigest),
      "2026-08-09T06:00:00.000Z",
      mutatedDigest,
    );
  } catch (error) {
    killed = true;
    observed = error instanceof Error ? error.message : String(error);
  }
  recordMutation(mutationId, killed && mutatedDigest !== laneClosureDigest, {
    observed,
    admitted_lane_closure_digest: laneClosureDigest,
    running_lane_closure_digest: mutatedDigest,
    ...detail,
  });
}

/** closure member の内容が 1 byte でも変われば admission が失効すること。 */
function mutateClosureMemberDrift(): void {
  const manifest = buildReviewLaneClosureManifest(repoRoot, providerMaterial);
  const target = manifest.members[0];
  const drifted = digestReviewLaneClosureManifest({
    ...manifest,
    members: manifest.members.map((member, index) =>
      index === 0 ? { ...member, digest: sha256Digest(`${member.digest}:drift`) } : member,
    ),
  });
  recordClosureMutation("closure_member_drift", drifted, { drifted_member: target.path });
}

/** closure から member を落として digest を素通りさせられないこと。 */
function mutateClosureMemberRemoved(): void {
  const manifest = buildReviewLaneClosureManifest(repoRoot, providerMaterial);
  const removed = manifest.members[0];
  const shrunk = digestReviewLaneClosureManifest({
    ...manifest,
    members: manifest.members.slice(1),
  });
  recordClosureMutation("closure_member_removed", shrunk, { removed_member: removed.path });
}

/** 期限切れ admission receipt が再利用できないこと。 */
function mutateReuseStaleReceipt(): void {
  const payload = {
    schema_version: "helix-kimi-review-fallback-admission.v2",
    provider: "kimi",
    task_class: "pr_convergence_review",
    admitted_risk_classes: ["low", "medium"],
    admission_lane_closure_digest: laneClosureDigest,
    admission_implementation_head: head,
    benchmark_fixture_digest: sha256Digest("stale-benchmark"),
    negative_oracle_digest: sha256Digest("stale-oracle"),
    independent_verifier_provider: "claude",
    independent_verifier_receipt_digest: sha256Digest("stale-verifier"),
    verdict: "admit",
    issued_at: "2026-08-06T00:00:00.000Z",
    expires_at: "2026-08-06T12:00:00.000Z",
  };
  const stale = { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) };
  let killed = false;
  let observed = "accepted";
  try {
    validateKimiReviewFallbackAdmission(stale, "2026-08-08T09:00:00.000Z");
  } catch (error) {
    killed = true;
    observed = error instanceof Error ? error.message : String(error);
  }
  recordMutation("reuse_stale_receipt", killed, { observed });
}

/** 未来の issued_at で実効有効期間を24時間より長く見せられないこと。 */
function mutateFutureIssuedAt(): void {
  const future = admissionBoundTo(laneClosureDigest);
  let killed = false;
  let observed = "accepted";
  try {
    validateKimiReviewFallbackAdmission(future, "2026-08-08T09:00:00.000Z");
  } catch (error) {
    killed = true;
    observed = error instanceof Error ? error.message : String(error);
  }
  recordMutation("future_issued_at", killed, { observed });
}

async function main(): Promise<void> {
  runToolRequestCase();
  runSchemaDriftCase();
  runQuotaSwitchCase();
  await runReviewCase("clean_approve", "clean-approve.diff");
  await runReviewCase("seeded_blocker", "seeded-blocker.diff");

  mutateRemoveHeadBinding();
  mutateAllowHighRisk();
  mutateAllowToolActivity();
  mutateReuseStaleReceipt();
  mutateFutureIssuedAt();
  mutateClosureMemberDrift();
  mutateClosureMemberRemoved();

  const benchmark = buildAdmissionBenchmarkEvidence(head, laneClosureDigest, cases);
  const negativeOracle = buildAdmissionNegativeOracleEvidence(head, laneClosureDigest, mutations);
  const passCount = cases.filter((entry) => entry.passed).length;
  const killCount = mutations.filter((entry) => entry.killed).length;
  writeFileSync(
    join(outDir, "summary.json"),
    `${JSON.stringify(
      {
        implementation_head: head,
        lane_closure_digest: laneClosureDigest,
        kimi_version: execFileSync(kimiBin, ["--version"], { encoding: "utf8" }).trim(),
        kimi_binary_sha256: sha256Digest(readFileSync(kimiBin)),
        bubblewrap_sha256: sha256Digest(readFileSync(bwrap)),
        benchmark_evidence: benchmark,
        negative_oracle_evidence: negativeOracle,
        pass_count: passCount,
        kill_count: killCount,
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    `cases ${passCount}/${cases.length} pass, mutations ${killCount}/${mutations.length} killed\n`,
  );
  process.exit(passCount === cases.length && killCount === mutations.length ? 0 : 1);
}

await main();
