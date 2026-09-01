import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md";
const acceptancePath = "docs/test-design/helix/universal-improvement-loop-acceptance.md";
const planPath = "docs/plans/PLAN-L3-76-uil-observation-generation-authority.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("UIL observation generation L3↔L10 authority", () => {
  it("UIL-GEN-AUTH-001: baseline／candidate／post-mainを別generationとして正本化する", () => {
    expect(requirement).toContain("### UIL-R-15 観測generationとhistorical baseline保全");
    expect(requirement).toContain("`baseline`、`candidate`、`post_main`を別generation");
    expect(requirement).toContain("generation identityを統合しない");
    expect(plan).toContain("behavior_contract_id: UIL-OBSERVATION-GENERATION-SEPARATION-001");
  });

  it("UIL-GEN-AUTH-002: historical baselineと比較不能をcandidate都合で上書きしない", () => {
    expect(requirement).toContain("in-place rewriteしない");
    for (const disposition of [
      "comparison_compatible",
      "reobservation_required",
      "baseline_incomparable",
      "detector_transition_required",
    ]) {
      expect(requirement).toContain(`\`${disposition}\``);
    }
    expect(requirement).toContain("比較不能をno-change、改善、悪化なし、greenへ変換しない");
  });

  it("UIL-GEN-AUTH-003: three-generation lifecycleとfirst-cause lineageをL10へ束縛する", () => {
    const rows = [...acceptance.matchAll(/^\| (UIL-AC-02[3-5]) \| (UIL-R-15) \|/gmu)];
    expect(rows.map((row) => row[1])).toEqual(["UIL-AC-023", "UIL-AC-024", "UIL-AC-025"]);
    expect(rows.every((row) => row[2] === "UIL-R-15")).toBe(true);
    expect(acceptance).toContain("post-main read-afterだけがnew baseline promotionを許可");
    expect(acceptance).toContain("generic missing error");
    expect(acceptance).toContain("25件すべてを独立oracleとして保持");
  });

  it("UIL-GEN-AUTH-004: runtime実装と別authorityの再実装をこのL3 sliceへ混載しない", () => {
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("completion_claim_allowed: false");
    expect(plan).toContain("runtime Red/Greenは後続UIL-GEN-01以降へ分離");
    expect(plan).toContain("別DB・別scanner・新workflow routeを作らない");
  });
});
