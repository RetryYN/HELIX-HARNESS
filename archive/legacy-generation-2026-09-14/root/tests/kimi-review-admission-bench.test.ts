import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  buildKimiReviewFallbackAdmission,
  validateKimiReviewFallbackAdmissionForImplementation,
} from "../src/runtime/independent-review-fallback";
import {
  buildReviewLaneClosureManifest,
  computeReviewLaneClosureDigest,
  digestReviewLaneClosureManifest,
  REVIEW_LANE_CLOSURE_PATHS,
} from "../src/runtime/review-lane-closure";
import {
  type AdmissionCaseResult,
  type AdmissionMutationResult,
  buildAdmissionBenchmarkEvidence,
  buildAdmissionNegativeOracleEvidence,
} from "./tools/kimi-review-admission/admission-evidence";

// PLAN-RECOVERY-39-kimi-review-lane-admission-bench
// PLAN-RECOVERY-40-kimi-admission-lane-closure-digest (U-IRF-012a / U-IRF-012b / U-IRF-012c)
// 対応 test design: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
//   U-IRF-011a / U-IRF-011b / U-IRF-011c / U-IRF-012a / U-IRF-012b / U-IRF-012c

const HEAD = "b6fb9c8e89378012dc2d2f7e20817e106d768160";
const CLOSURE = sha256Digest("lane-closure");

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
  "future_issued_at",
  "closure_member_drift",
  "closure_member_removed",
].map((mutation_id) => ({
  mutation_id,
  killed: true as const,
  evidence_digest: sha256Digest(`mutation:${mutation_id}`),
}));

function mint(cases: AdmissionCaseResult[], mutations: AdmissionMutationResult[]) {
  return buildKimiReviewFallbackAdmission({
    benchmark_evidence: buildAdmissionBenchmarkEvidence(HEAD, CLOSURE, cases),
    negative_oracle_evidence: buildAdmissionNegativeOracleEvidence(HEAD, CLOSURE, mutations),
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
    expect(receipt.admission_lane_closure_digest).toBe(CLOSURE);
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
        benchmark_evidence: buildAdmissionBenchmarkEvidence(HEAD, CLOSURE, FULL_CASES),
        negative_oracle_evidence: buildAdmissionNegativeOracleEvidence(
          "0".repeat(40),
          CLOSURE,
          FULL_MUTATIONS,
        ),
        independent_verifier_receipt_digest: sha256Digest("claude-verifier-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: "2026-08-08T09:00:00.000Z",
        expires_at: "2026-08-08T21:00:00.000Z",
      }),
    ).toThrow();
  });

  it("U-IRF-012a: gate は lane closure digest 一致で通り、HEAD 一致には依存しない", () => {
    const receipt = mint(FULL_CASES, FULL_MUTATIONS);
    // merge 後の HEAD は receipt の implementation_head と別物になるが、lane closure が
    // 同一である限り admission は有効であり続ける。
    expect(
      validateKimiReviewFallbackAdmissionForImplementation(
        receipt,
        "2026-08-08T12:00:00.000Z",
        CLOSURE,
      ).receipt_digest,
    ).toBe(receipt.receipt_digest);
  });

  it("U-IRF-012b: bench と negative oracle の closure digest 不一致は発行させない", () => {
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: buildAdmissionBenchmarkEvidence(HEAD, CLOSURE, FULL_CASES),
        negative_oracle_evidence: buildAdmissionNegativeOracleEvidence(
          HEAD,
          sha256Digest("other-lane-closure"),
          FULL_MUTATIONS,
        ),
        independent_verifier_receipt_digest: sha256Digest("claude-verifier-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: "2026-08-08T09:00:00.000Z",
        expires_at: "2026-08-08T21:00:00.000Z",
      }),
    ).toThrow();
  });

  it("U-IRF-012c: closure member の内容変更・member 削除はどちらも digest を動かして失効させる", () => {
    const receipt = mint(FULL_CASES, FULL_MUTATIONS);
    const manifest = buildReviewLaneClosureManifest(process.cwd(), {
      cli_binary_digest: sha256Digest("kimi-binary"),
      model: "kimi-code/k3-256k",
    });
    const baseline = digestReviewLaneClosureManifest(manifest);
    const drifted = digestReviewLaneClosureManifest({
      ...manifest,
      members: manifest.members.map((member, index) =>
        index === 0 ? { ...member, digest: sha256Digest(`${member.digest}:drift`) } : member,
      ),
    });
    const shrunk = digestReviewLaneClosureManifest({
      ...manifest,
      members: manifest.members.slice(1),
    });
    expect(drifted).not.toBe(baseline);
    expect(shrunk).not.toBe(baseline);
    // receipt は CLOSURE に束縛されている。drift / 削除で digest が動いた lane を
    // 実行しようとすると、payload を書き換えずとも gate が閉じる。
    for (const running of [drifted, shrunk]) {
      expect(() =>
        validateKimiReviewFallbackAdmissionForImplementation(
          receipt,
          "2026-08-08T12:00:00.000Z",
          running,
        ),
      ).toThrow("kimi_review_admission_lane_closure_digest_mismatch");
    }
  });

  it("U-IRF-012d: 実filesystemのmember bytes・欠落・provider materialをclosureへ束縛する", () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "helix-review-lane-closure-"));
    const provider = {
      cli_binary_digest: sha256Digest("kimi-binary"),
      model: "kimi-code/k3-256k",
    };
    try {
      for (const path of REVIEW_LANE_CLOSURE_PATHS) {
        const target = join(fixtureRoot, path);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(path, target);
      }
      const baseline = computeReviewLaneClosureDigest(fixtureRoot, provider);
      const firstMember = join(fixtureRoot, REVIEW_LANE_CLOSURE_PATHS[0] as string);
      appendFileSync(firstMember, "\n// closure drift oracle\n");
      expect(computeReviewLaneClosureDigest(fixtureRoot, provider)).not.toBe(baseline);

      copyFileSync(REVIEW_LANE_CLOSURE_PATHS[0] as string, firstMember);
      rmSync(firstMember);
      expect(() => computeReviewLaneClosureDigest(fixtureRoot, provider)).toThrow(
        "review_lane_closure_member_missing:ENOENT",
      );

      copyFileSync(REVIEW_LANE_CLOSURE_PATHS[0] as string, firstMember);
      expect(
        computeReviewLaneClosureDigest(fixtureRoot, {
          ...provider,
          cli_binary_digest: sha256Digest("other-kimi-binary"),
        }),
      ).not.toBe(baseline);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
