import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  readWorkerBlindBenchmarkReceiptRisk,
  type WorkerBlindBenchmarkReceiptV1,
  type WorkerBlindRankingRowV1,
} from "./worker-blind-benchmark";

const RISK_CLASSES = ["low", "medium", "high", "critical"] as const;
const CRITICAL_FAILURE_CLASSES = ["scope_violation", "secret_leak", "schema_violation"] as const;

type RiskClass = (typeof RISK_CLASSES)[number];
type CriticalFailureClass = (typeof CRITICAL_FAILURE_CLASSES)[number];

export type WorkerRiskAdmissionFailureCode =
  | "WORKER_RISK_ADMISSION_INPUT_INVALID"
  | "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED"
  | "WORKER_RISK_ADMISSION_RISK_DUPLICATE"
  | "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED";

export type WorkerRiskAdmissionReasonCode =
  | "WORKER_RISK_CRITICAL_SCOPE_VIOLATION"
  | "WORKER_RISK_CRITICAL_SECRET_LEAK"
  | "WORKER_RISK_CRITICAL_SCHEMA_VIOLATION"
  | "WORKER_RISK_EVIDENCE_MISSING"
  | "WORKER_RISK_SCORE_BELOW_THRESHOLD"
  | "WORKER_RISK_COST_ABOVE_LIMIT"
  | "WORKER_RISK_FIXED_EFFORT_MISMATCH";

export interface WorkerStandaloneFindingV1 {
  finding_id: string;
  candidate_id: string;
  failure_class: CriticalFailureClass;
  risk_class: RiskClass;
  evidence_digest: Sha256Digest;
}

export interface WorkerUseAdmissionPolicyV1 {
  use_case_id: string;
  required_risk_classes: readonly RiskClass[];
  min_blind_score: number;
  max_effective_cost: number;
  fixed_effort: string | null;
  effort_justification_receipt_digest: Sha256Digest | null;
}

export interface WorkerRiskAdmissionRequestV1 {
  schema_version: "helix-worker-risk-admission-request.v1";
  candidate_ids: readonly string[];
  benchmark_receipts: readonly WorkerBlindBenchmarkReceiptV1[];
  standalone_findings: readonly WorkerStandaloneFindingV1[];
  use_policies: readonly WorkerUseAdmissionPolicyV1[];
}

export interface WorkerUseCandidateDecisionV1 {
  candidate_id: string;
  disposition: "admit" | "retire";
  reason_codes: readonly WorkerRiskAdmissionReasonCode[];
  standalone_finding_ids: readonly string[];
  minimum_blind_score: number | null;
  aggregate_effective_cost: number | null;
  effort: string | null;
}

export interface WorkerUseAdmissionDecisionV1 {
  use_case_id: string;
  selected_candidate_id: string | null;
  candidates: readonly WorkerUseCandidateDecisionV1[];
}

export interface WorkerRiskAdmissionReceiptV1 {
  schema_version: "helix-worker-risk-admission-receipt.v1";
  benchmark_receipt_digests: readonly Sha256Digest[];
  standalone_finding_digests: readonly Sha256Digest[];
  use_decisions: readonly WorkerUseAdmissionDecisionV1[];
  receipt_digest: Sha256Digest;
}

type Failure = { ok: false; failure_code: WorkerRiskAdmissionFailureCode };

const admittedRiskReceipts = new WeakSet<WorkerRiskAdmissionReceiptV1>();

function failure(failure_code: WorkerRiskAdmissionFailureCode): Failure {
  return { ok: false, failure_code };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]{0,127}$/u.test(value);
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isRiskClass(value: unknown): value is RiskClass {
  return RISK_CLASSES.includes(value as RiskClass);
}

function isCriticalFailureClass(value: unknown): value is CriticalFailureClass {
  return CRITICAL_FAILURE_CLASSES.includes(value as CriticalFailureClass);
}

function validFinding(value: unknown): value is WorkerStandaloneFindingV1 {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "candidate_id",
      "evidence_digest",
      "failure_class",
      "finding_id",
      "risk_class",
    ]) &&
    isSafeId(value.finding_id) &&
    isSafeId(value.candidate_id) &&
    isCriticalFailureClass(value.failure_class) &&
    isRiskClass(value.risk_class) &&
    isDigest(value.evidence_digest)
  );
}

function validPolicy(value: unknown): value is WorkerUseAdmissionPolicyV1 {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "effort_justification_receipt_digest",
      "fixed_effort",
      "max_effective_cost",
      "min_blind_score",
      "required_risk_classes",
      "use_case_id",
    ]) ||
    !isSafeId(value.use_case_id) ||
    !Array.isArray(value.required_risk_classes) ||
    value.required_risk_classes.length === 0 ||
    !value.required_risk_classes.every(isRiskClass) ||
    new Set(value.required_risk_classes).size !== value.required_risk_classes.length ||
    typeof value.min_blind_score !== "number" ||
    !Number.isFinite(value.min_blind_score) ||
    typeof value.max_effective_cost !== "number" ||
    !Number.isFinite(value.max_effective_cost) ||
    value.max_effective_cost < 0 ||
    (value.fixed_effort !== null && !isSafeId(value.fixed_effort)) ||
    (value.effort_justification_receipt_digest !== null &&
      !isDigest(value.effort_justification_receipt_digest))
  ) {
    return false;
  }
  return true;
}

function criticalReason(failureClass: CriticalFailureClass): WorkerRiskAdmissionReasonCode {
  if (failureClass === "scope_violation") return "WORKER_RISK_CRITICAL_SCOPE_VIOLATION";
  if (failureClass === "secret_leak") return "WORKER_RISK_CRITICAL_SECRET_LEAK";
  return "WORKER_RISK_CRITICAL_SCHEMA_VIOLATION";
}

function rowForCandidate(
  receiptsByRisk: ReadonlyMap<RiskClass, WorkerBlindBenchmarkReceiptV1>,
  requiredRisks: readonly RiskClass[],
  candidateId: string,
): WorkerBlindRankingRowV1[] | null {
  const rows: WorkerBlindRankingRowV1[] = [];
  for (const risk of requiredRisks) {
    const row = receiptsByRisk
      .get(risk)
      ?.ranking.find((candidate) => candidate.candidate_id === candidateId);
    if (!row) return null;
    rows.push(row);
  }
  return rows;
}

export function decideWorkerRiskAdmission(
  input: unknown,
): Failure | { ok: true; receipt: WorkerRiskAdmissionReceiptV1 } {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, [
      "benchmark_receipts",
      "candidate_ids",
      "schema_version",
      "standalone_findings",
      "use_policies",
    ]) ||
    input.schema_version !== "helix-worker-risk-admission-request.v1" ||
    !Array.isArray(input.candidate_ids) ||
    input.candidate_ids.length < 2 ||
    !input.candidate_ids.every(isSafeId) ||
    new Set(input.candidate_ids).size !== input.candidate_ids.length ||
    !Array.isArray(input.benchmark_receipts) ||
    input.benchmark_receipts.length === 0 ||
    !Array.isArray(input.standalone_findings) ||
    !input.standalone_findings.every(validFinding) ||
    new Set(input.standalone_findings.map((finding) => finding.finding_id)).size !==
      input.standalone_findings.length ||
    !Array.isArray(input.use_policies) ||
    input.use_policies.length === 0 ||
    !input.use_policies.every(validPolicy) ||
    new Set(input.use_policies.map((policy) => policy.use_case_id)).size !==
      input.use_policies.length
  ) {
    return failure("WORKER_RISK_ADMISSION_INPUT_INVALID");
  }
  const request = input as unknown as WorkerRiskAdmissionRequestV1;
  if (
    !request.standalone_findings.every((finding) =>
      request.candidate_ids.includes(finding.candidate_id),
    )
  ) {
    return failure("WORKER_RISK_ADMISSION_INPUT_INVALID");
  }

  const receiptsByRisk = new Map<RiskClass, WorkerBlindBenchmarkReceiptV1>();
  for (const receipt of request.benchmark_receipts) {
    const risk = readWorkerBlindBenchmarkReceiptRisk(receipt);
    if (!risk) return failure("WORKER_RISK_ADMISSION_RECEIPT_UNSEALED");
    if (receiptsByRisk.has(risk)) return failure("WORKER_RISK_ADMISSION_RISK_DUPLICATE");
    receiptsByRisk.set(risk, receipt);
  }
  if (
    request.use_policies.some(
      (policy) =>
        policy.fixed_effort !== null &&
        (policy.effort_justification_receipt_digest === null ||
          !request.benchmark_receipts.some(
            (receipt) =>
              receipt.receipt_digest === policy.effort_justification_receipt_digest &&
              receipt.ranking.some((row) => row.effort === policy.fixed_effort),
          )),
    )
  ) {
    return failure("WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED");
  }

  const useDecisions = request.use_policies.map((policy) => {
    const candidates = request.candidate_ids.map((candidateId) => {
      const findings = request.standalone_findings.filter(
        (finding) => finding.candidate_id === candidateId,
      );
      const reasons = findings.map((finding) => criticalReason(finding.failure_class));
      const rows = rowForCandidate(receiptsByRisk, policy.required_risk_classes, candidateId);
      if (!rows) reasons.push("WORKER_RISK_EVIDENCE_MISSING");
      const minimumBlindScore = rows ? Math.min(...rows.map((row) => row.blind_score)) : null;
      const aggregateEffectiveCost = rows
        ? rows.reduce((sum, row) => sum + row.effective_cost, 0)
        : null;
      const efforts = rows ? [...new Set(rows.map((row) => row.effort))] : [];
      const effort = efforts.length === 1 ? (efforts[0] ?? null) : null;
      if (minimumBlindScore !== null && minimumBlindScore < policy.min_blind_score) {
        reasons.push("WORKER_RISK_SCORE_BELOW_THRESHOLD");
      }
      if (aggregateEffectiveCost !== null && aggregateEffectiveCost > policy.max_effective_cost) {
        reasons.push("WORKER_RISK_COST_ABOVE_LIMIT");
      }
      if (policy.fixed_effort !== null && effort !== policy.fixed_effort) {
        reasons.push("WORKER_RISK_FIXED_EFFORT_MISMATCH");
      }
      const uniqueReasons = [...new Set(reasons)].sort();
      return Object.freeze({
        candidate_id: candidateId,
        disposition: uniqueReasons.length === 0 ? ("admit" as const) : ("retire" as const),
        reason_codes: Object.freeze(uniqueReasons),
        standalone_finding_ids: Object.freeze(findings.map((finding) => finding.finding_id).sort()),
        minimum_blind_score: minimumBlindScore,
        aggregate_effective_cost: aggregateEffectiveCost,
        effort,
      });
    });
    const selected = candidates
      .filter((candidate) => candidate.disposition === "admit")
      .sort(
        (left, right) =>
          (right.minimum_blind_score ?? Number.NEGATIVE_INFINITY) -
            (left.minimum_blind_score ?? Number.NEGATIVE_INFINITY) ||
          (left.aggregate_effective_cost ?? Number.POSITIVE_INFINITY) -
            (right.aggregate_effective_cost ?? Number.POSITIVE_INFINITY) ||
          left.candidate_id.localeCompare(right.candidate_id),
      )[0];
    return Object.freeze({
      use_case_id: policy.use_case_id,
      selected_candidate_id: selected?.candidate_id ?? null,
      candidates: Object.freeze(candidates),
    });
  });
  const payload = {
    schema_version: "helix-worker-risk-admission-receipt.v1" as const,
    benchmark_receipt_digests: Object.freeze(
      request.benchmark_receipts.map((receipt) => receipt.receipt_digest).sort(),
    ),
    standalone_finding_digests: Object.freeze(
      request.standalone_findings.map((finding) => sha256Digest(canonicalJson(finding))).sort(),
    ),
    use_decisions: Object.freeze(useDecisions),
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  admittedRiskReceipts.add(receipt);
  return { ok: true, receipt };
}

export function isWorkerRiskAdmissionReceipt(
  value: unknown,
): value is WorkerRiskAdmissionReceiptV1 {
  return (
    isRecord(value) && admittedRiskReceipts.has(value as unknown as WorkerRiskAdmissionReceiptV1)
  );
}
