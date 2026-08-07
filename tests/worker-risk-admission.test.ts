import { afterEach, describe, expect, it, vi } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import type { WorkerBlindBenchmarkReceiptV1 } from "../src/runtime/worker-blind-benchmark";
import {
  decideWorkerRiskAdmission,
  isWorkerRiskAdmissionReceipt,
} from "../src/runtime/worker-risk-admission";
import {
  cleanupWorkerIsolationFixtures,
  evaluatedBenchmark,
} from "./helpers/worker-isolation-fixture";

// PLAN-L7-505-worker-risk-admission

const originalCodexBin = process.env.HELIX_CODEX_BIN;
const originalGithubToken = process.env.GITHUB_TOKEN;

afterEach(() => {
  if (originalCodexBin === undefined) delete process.env.HELIX_CODEX_BIN;
  else process.env.HELIX_CODEX_BIN = originalCodexBin;
  if (originalGithubToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalGithubToken;
  vi.restoreAllMocks();
  cleanupWorkerIsolationFixtures();
});

describe("WCC-FR-08 worker risk admission", () => {
  const riskRequest = (receipt: WorkerBlindBenchmarkReceiptV1) => ({
    schema_version: "helix-worker-risk-admission-request.v1" as const,
    candidate_ids: ["candidate-a", "candidate-b"],
    benchmark_receipts: [receipt],
    standalone_findings: [
      {
        finding_id: "scope-a",
        candidate_id: "candidate-a",
        failure_class: "scope_violation" as const,
        risk_class: "high" as const,
        evidence_digest: sha256Digest("scope evidence"),
      },
    ],
    use_policies: [
      {
        use_case_id: "implementation",
        required_risk_classes: ["high" as const],
        min_blind_score: 80,
        max_effective_cost: 60_000,
        fixed_effort: null,
        effort_justification_receipt_digest: null,
      },
      {
        use_case_id: "security-review",
        required_risk_classes: ["high" as const],
        min_blind_score: 90,
        max_effective_cost: 60_000,
        fixed_effort: null,
        effort_justification_receipt_digest: null,
      },
    ],
  });

  it("U-WRA-001: critical findingを相殺せず用途別にadmit/retireする", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    const admission = decideWorkerRiskAdmission(request);
    expect(admission.ok).toBe(true);
    if (!admission.ok) return;
    expect(admission.receipt.use_decisions[0]).toMatchObject({
      use_case_id: "implementation",
      selected_candidate_id: "candidate-b",
      candidates: [
        {
          candidate_id: "candidate-a",
          disposition: "retire",
          reason_codes: ["WORKER_RISK_CRITICAL_SCOPE_VIOLATION"],
          standalone_finding_ids: ["scope-a"],
        },
        { candidate_id: "candidate-b", disposition: "admit", reason_codes: [] },
      ],
    });
    expect(admission.receipt.use_decisions[1]?.selected_candidate_id).toBeNull();
    expect(isWorkerRiskAdmissionReceipt(admission.receipt)).toBe(true);
    expect(isWorkerRiskAdmissionReceipt({ ...admission.receipt })).toBe(false);
  });

  it("U-WRA-002: unknown fieldを含むrequestを拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(decideWorkerRiskAdmission({ ...request, unknown_policy: true })).toEqual({
      ok: false,
      failure_code: "WORKER_RISK_ADMISSION_INPUT_INVALID",
    });
  });

  it("U-WRA-003: copied receiptと同risk重複を拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(decideWorkerRiskAdmission({ ...request, benchmark_receipts: [{ ...receipt }] })).toEqual(
      {
        ok: false,
        failure_code: "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED",
      },
    );
    expect(
      decideWorkerRiskAdmission({
        ...request,
        benchmark_receipts: [receipt, receipt],
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_RISK_ADMISSION_RISK_DUPLICATE" });
  });

  it("U-WRA-004: measured receiptのないfixed effortを拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(
      decideWorkerRiskAdmission({
        ...request,
        use_policies: [
          {
            ...request.use_policies[0],
            fixed_effort: "high",
            effort_justification_receipt_digest: null,
          },
        ],
      }),
    ).toEqual({
      ok: false,
      failure_code: "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED",
    });
    const justifiedEffort = decideWorkerRiskAdmission({
      ...request,
      use_policies: [
        {
          ...request.use_policies[0],
          fixed_effort: "medium",
          effort_justification_receipt_digest: receipt.receipt_digest,
        },
      ],
    });
    expect(justifiedEffort.ok).toBe(true);
  });

  it("U-WRA-005: risk別score下限を平均で相殺せずdecision reasonの境界を閉じる", () => {
    const lowReceipt = evaluatedBenchmark("low", 90, "medium");
    const criticalReceipt = evaluatedBenchmark("critical", 20, "high", 5);
    const base = riskRequest(lowReceipt);
    const admission = decideWorkerRiskAdmission({
      ...base,
      benchmark_receipts: [lowReceipt, criticalReceipt],
      standalone_findings: [
        {
          finding_id: "secret-a",
          candidate_id: "candidate-a",
          failure_class: "secret_leak",
          risk_class: "critical",
          evidence_digest: sha256Digest("secret evidence"),
        },
        {
          finding_id: "schema-a",
          candidate_id: "candidate-a",
          failure_class: "schema_violation",
          risk_class: "critical",
          evidence_digest: sha256Digest("schema evidence"),
        },
      ],
      use_policies: [
        {
          ...base.use_policies[0],
          required_risk_classes: ["low", "critical"],
          min_blind_score: 50,
          max_effective_cost: 0,
          fixed_effort: "high",
          effort_justification_receipt_digest: criticalReceipt.receipt_digest,
        },
      ],
    });
    expect(admission.ok).toBe(true);
    if (!admission.ok) return;
    expect(admission.receipt.use_decisions[0]?.candidates).toEqual([
      expect.objectContaining({
        candidate_id: "candidate-a",
        disposition: "retire",
        minimum_blind_score: 20,
        reason_codes: [
          "WORKER_RISK_COST_ABOVE_LIMIT",
          "WORKER_RISK_CRITICAL_SCHEMA_VIOLATION",
          "WORKER_RISK_CRITICAL_SECRET_LEAK",
          "WORKER_RISK_FIXED_EFFORT_MISMATCH",
          "WORKER_RISK_SCORE_BELOW_THRESHOLD",
        ],
      }),
      expect.objectContaining({
        candidate_id: "candidate-b",
        disposition: "retire",
        minimum_blind_score: 20,
        reason_codes: [
          "WORKER_RISK_COST_ABOVE_LIMIT",
          "WORKER_RISK_FIXED_EFFORT_MISMATCH",
          "WORKER_RISK_SCORE_BELOW_THRESHOLD",
        ],
      }),
    ]);

    const missing = decideWorkerRiskAdmission({
      ...base,
      use_policies: [{ ...base.use_policies[0], required_risk_classes: ["low", "critical"] }],
    });
    expect(missing.ok).toBe(true);
    if (missing.ok) {
      expect(missing.receipt.use_decisions[0]?.candidates[0]?.reason_codes).toContain(
        "WORKER_RISK_EVIDENCE_MISSING",
      );
    }
  });
});
