/**
 * admission bench の観測結果を `buildKimiReviewFallbackAdmission` が受理する evidence 形へ畳む
 * 純関数（PLAN-RECOVERY-39）。runner（実 Kimi 起動あり）と unit test の双方がここを共有し、
 * 「evidence の形が admission 契約と一致しているか」を Kimi 非起動で検証できるようにする。
 *
 * admission 側は case / mutation の **exact set** を要求するため、本 module は集合の過不足を
 * 呼び出し側の実測結果のまま素通しし、勝手に補完しない（欠落は admission 発行時に fail-close する）。
 */
import type { Sha256Digest } from "../../../src/runtime/digest";

export interface AdmissionCaseResult {
  case_id: string;
  observed_outcome: string;
  passed: boolean;
  evidence_digest: Sha256Digest;
}

export interface AdmissionMutationResult {
  mutation_id: string;
  killed: boolean;
  evidence_digest: Sha256Digest;
}

export interface AdmissionBenchmarkEvidence {
  schema_version: "helix-kimi-review-fallback-benchmark.v1";
  provider: "kimi";
  task_class: "pr_convergence_review";
  implementation_head: string;
  cases: AdmissionCaseResult[];
}

export interface AdmissionNegativeOracleEvidence {
  schema_version: "helix-kimi-review-fallback-negative-oracle.v1";
  implementation_head: string;
  mutations: AdmissionMutationResult[];
}

/** case_id 昇順で安定化した benchmark evidence を返す（digest を実行順に依存させない）。 */
export function buildAdmissionBenchmarkEvidence(
  implementationHead: string,
  cases: readonly AdmissionCaseResult[],
): AdmissionBenchmarkEvidence {
  return {
    schema_version: "helix-kimi-review-fallback-benchmark.v1",
    provider: "kimi",
    task_class: "pr_convergence_review",
    implementation_head: implementationHead,
    cases: [...cases].sort((a, b) => a.case_id.localeCompare(b.case_id)),
  };
}

/** mutation_id 昇順で安定化した negative oracle evidence を返す。 */
export function buildAdmissionNegativeOracleEvidence(
  implementationHead: string,
  mutations: readonly AdmissionMutationResult[],
): AdmissionNegativeOracleEvidence {
  return {
    schema_version: "helix-kimi-review-fallback-negative-oracle.v1",
    implementation_head: implementationHead,
    mutations: [...mutations].sort((a, b) => a.mutation_id.localeCompare(b.mutation_id)),
  };
}
