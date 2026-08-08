import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import { buildKimiReviewFallbackAdmission } from "../src/runtime/independent-review-fallback";
import {
  type AdmissionCaseResult,
  type AdmissionMutationResult,
  buildAdmissionBenchmarkEvidence,
  buildAdmissionNegativeOracleEvidence,
} from "./tools/kimi-review-admission/admission-evidence";

// PLAN-L7-527-kimi-review-lane-admission-bench
// 対応 test design: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
//   U-IRF-011a / U-IRF-011b / U-IRF-011c

const HEAD = "b6fb9c8e89378012dc2d2f7e20817e106d768160";

const FULL_CASES: AdmissionCaseResult[] = [
  ["clean_approve", "approve"],
  ["seeded_blocker", "block"],
  ["tool_request", "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"],
  ["schema_drift", "KIMI_REVIEW_OUTPUT_INVALID"],
  ["quota_switch", "kimi"],
].map(([case_id, observed_outcome]) => ({
  case_id: case_id as string,
  observed_outcome: observed_outcome as string,
  passed: true as const,
  evidence_digest: sha256Digest(`case:${case_id}`),
}));

const FULL_MUTATIONS: AdmissionMutationResult[] = [
  "remove_head_binding",
  "allow_high_risk",
  "allow_tool_activity",
  "reuse_stale_receipt",
].map((mutation_id) => ({
  mutation_id,
  killed: true as const,
  evidence_digest: sha256Digest(`mutation:${mutation_id}`),
}));

function mint(cases: AdmissionCaseResult[], mutations: AdmissionMutationResult[]) {
  return buildKimiReviewFallbackAdmission({
    benchmark_evidence: buildAdmissionBenchmarkEvidence(HEAD, cases),
    negative_oracle_evidence: buildAdmissionNegativeOracleEvidence(HEAD, mutations),
    independent_verifier_receipt_digest: sha256Digest("claude-verifier-receipt"),
    independent_verifier_implementation_head: HEAD,
    issued_at: "2026-08-08T09:00:00.000Z",
    expires_at: "2026-08-08T21:00:00.000Z",
  });
}

describe("Kimi review lane admission bench evidence", () => {
  it("U-IRF-011a: 完全な bench 結果は admission 契約が受理する evidence へ畳まれる", () => {
    const receipt = mint(FULL_CASES, FULL_MUTATIONS);
    expect(receipt.verdict).toBe("admit");
    expect(receipt.admission_implementation_head).toBe(HEAD);
    expect(receipt.admitted_risk_classes).toEqual(["low", "medium"]);
  });

  it("U-IRF-011b: evidence は実行順に依存せず安定な digest を生む", () => {
    const forward = mint(FULL_CASES, FULL_MUTATIONS);
    const reversed = mint([...FULL_CASES].reverse(), [...FULL_MUTATIONS].reverse());
    expect(reversed.benchmark_fixture_digest).toBe(forward.benchmark_fixture_digest);
    expect(reversed.negative_oracle_digest).toBe(forward.negative_oracle_digest);
  });

  it("U-IRF-011c: case 欠落・mutation 生存・HEAD 不一致は admission を発行させない", () => {
    expect(() => mint(FULL_CASES.slice(1), FULL_MUTATIONS)).toThrow();
    expect(() =>
      mint(FULL_CASES, [
        ...FULL_MUTATIONS.slice(1),
        { ...(FULL_MUTATIONS[0] as AdmissionMutationResult), killed: false as unknown as true },
      ]),
    ).toThrow();
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: buildAdmissionBenchmarkEvidence(HEAD, FULL_CASES),
        negative_oracle_evidence: buildAdmissionNegativeOracleEvidence(
          "0".repeat(40),
          FULL_MUTATIONS,
        ),
        independent_verifier_receipt_digest: sha256Digest("claude-verifier-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: "2026-08-08T09:00:00.000Z",
        expires_at: "2026-08-08T21:00:00.000Z",
      }),
    ).toThrow();
  });
});
