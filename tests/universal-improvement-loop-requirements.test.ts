import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementsPath =
  "docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md";
const acceptancePath = "docs/test-design/helix/universal-improvement-loop-acceptance.md";

const requirements = readFileSync(requirementsPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");

const ids = (source: string, pattern: RegExp): string[] =>
  [...source.matchAll(pattern)].map((match) => match[1]);

describe("PLAN-L3-74 Universal Improvement Loop requirements", () => {
  it("7 FRと14 Rを重複なく量閉じする", () => {
    expect(new Set(ids(requirements, /## (UIL-FR-\d{3})/g))).toEqual(
      new Set(
        Array.from({ length: 7 }, (_, index) => `UIL-FR-${String(index + 1).padStart(3, "0")}`),
      ),
    );
    expect(new Set(ids(requirements, /### (UIL-R-\d{2})/g))).toEqual(
      new Set(
        Array.from({ length: 14 }, (_, index) => `UIL-R-${String(index + 1).padStart(2, "0")}`),
      ),
    );
  });

  it("L10が22 ACを持ち、全Rを少なくとも一度検証する", () => {
    expect(new Set(ids(acceptance, /\| (UIL-AC-\d{3}) \|/g))).toEqual(
      new Set(
        Array.from({ length: 22 }, (_, index) => `UIL-AC-${String(index + 1).padStart(3, "0")}`),
      ),
    );
    for (let index = 1; index <= 14; index += 1) {
      expect(acceptance).toContain(`UIL-R-${String(index).padStart(2, "0")}`);
    }
  });

  it("AI間loopと機械的自己改善loopを分離する", () => {
    expect(requirements).toContain("AI間の作成・レビュー循環");
    expect(requirements).toContain("AI proposalを除去しても");
    expect(requirements).toContain("新しいUniversal Improvement routeの追加");
  });

  it("change class、capability expansion、routeを別軸として保持する", () => {
    expect(requirements).toContain("`system_change_class`");
    expect(requirements).toContain("`capability_expansion_kind`");
    expect(requirements).toContain("`workflow_route`");
    expect(acceptance).toContain("同一enumへ畳み込まない");
  });

  it("UniversalImprovementCandidateV1の必須field exact setを固定する", () => {
    const expected = [
      "candidate_id",
      "source_event_ids",
      "evidence_snapshot_digest",
      "baseline_revision",
      "observed_revision",
      "detector_id",
      "detector_version",
      "invariant_ids",
      "finding_class",
      "confidence_and_counterevidence",
      "affected_requirements",
      "affected_designs",
      "affected_contracts",
      "affected_modules",
      "affected_v_pairs",
      "proposed_change_set",
      "expected_benefit",
      "expected_cost",
      "risk_and_blast_radius",
      "semantic_parity_status",
      "system_change_class",
      "capability_expansion_kind",
      "workflow_route",
      "verification_obligations",
      "rollback_contract",
      "human_decision_required",
      "expiry",
    ];
    const block = requirements.match(/required_fields:\n(?<rows>(?: {2}- [a-z_]+\n)+)/)?.groups
      ?.rows;
    expect(block).toBeDefined();
    expect(block?.match(/^ {2}- ([a-z_]+)$/gm)?.map((row) => row.slice(4))).toEqual(expected);
  });

  it("局所最適、予測偽装、authority直書きをnegative oracleで拒否する", () => {
    expect(acceptance).toContain("test時間短縮だけでadoptedにしない");
    expect(acceptance).toContain("予測を実測完了証拠にしない");
    expect(acceptance).toContain("Requirement、merge、publishを直接実行しない");
  });

  it("state machineを順序付きで固定する", () => {
    const expected = [
      "OBSERVED",
      "NORMALIZED",
      "BASELINE_COMPARED",
      "FINDING_QUALIFIED",
      "ROOT_AND_IMPACT_CLASSIFIED",
      "IMPROVEMENT_CANDIDATE_PROPOSED",
      "COUNTERFACTUAL_EVALUATED",
      "ROUTED",
      "CHANGE_VERIFIED",
      "OUTCOME_MEASURED",
      "RECIPE_CANDIDATE",
      "RECURRENCE_MONITORED",
      "TERMINAL",
    ];
    let cursor = -1;
    for (const state of expected) {
      const next = requirements.indexOf(state, cursor + 1);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }
  });
});
