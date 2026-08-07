// PLAN-L7-510-screen-applicability-core / U-SAP-002（HST-CASE-012-01 / 012-06 / 012-08）
import { describe, expect, it } from "vitest";
import type { ScreenPolicyV1, ScreenRuleSetV1 } from "../src/design/screen-applicability";
import {
  canonicalizeScreenScope,
  computeScreenRuleSetDigest,
  evaluateScreenApplicability,
} from "../src/design/screen-applicability";

const policy: ScreenPolicyV1 = {
  policy_id: "policy-1",
  revision: 1,
  capability_ids: ["cap-ui", "cap-ui2", "cap-noui"],
  rule_set_digest: "sha256:rule",
};

const ruleBase = {
  rule_set_id: "rules-1",
  revision: 1,
  authority_receipt_id: "authority-1",
  ui_capability_ids: ["cap-ui", "cap-ui2"],
  no_ui_capability_ids: ["cap-noui"],
  detector_id: "detector-1",
  detector_version: "1.0.0",
};

const rules: ScreenRuleSetV1 = {
  ...ruleBase,
  rules_digest: computeScreenRuleSetDigest(ruleBase),
};

function scope(capabilityIds: string[]) {
  const result = canonicalizeScreenScope(
    {
      snapshot_id: "snap-1",
      revision: 1,
      capability_ids: capabilityIds,
      phase: "L2",
      public_surface_digest: "sha256:surface",
    },
    { ...policy, capability_ids: ["cap-ui", "cap-ui2", "cap-noui", "cap-unknown-to-rules"] },
  );
  if (!result.ok) throw new Error("fixture scope must canonicalize");
  return result.value;
}

describe("U-SAP-002 evaluateScreenApplicability", () => {
  it("HST-CASE-012-01: no-UI capabilityはnot_applicableへdeterministicに評価する", () => {
    const result = evaluateScreenApplicability(scope(["cap-noui"]), rules);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.route).toBe("not_applicable");
      expect(result.value.status).toBe("current");
      expect(result.value.detector_id).toBe("detector-1");
      expect(result.value.decision_digest).toMatch(/^sha256:/);
    }
  });

  it("HST-CASE-012-06: UI capabilityはprototype_requiredへ評価する（二route同時選択0）", () => {
    const result = evaluateScreenApplicability(scope(["cap-ui"]), rules);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.route).toBe("prototype_required");
  });

  it("複数UI capabilityの同一routeはsorted capability_idをカンマ結合packingで保持する", () => {
    const result = evaluateScreenApplicability(scope(["cap-ui2", "cap-ui"]), rules);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.route).toBe("prototype_required");
      expect(result.value.capability_id).toBe("cap-ui,cap-ui2");
    }
  });

  it("U-SAP-002: 同一入力の再評価は同一decision_digestを返す（deterministic）", () => {
    const a = evaluateScreenApplicability(scope(["cap-ui"]), rules);
    const b = evaluateScreenApplicability(scope(["cap-ui"]), rules);
    expect(a.ok && b.ok && a.value.decision_digest === b.value.decision_digest).toBe(true);
  });

  it.each([
    ["rule未分類capabilityはfree-text passしない", ["cap-unknown-to-rules"]],
    ["UI/no-UI混在scopeは単一decisionへpassしない", ["cap-ui", "cap-noui"]],
  ])("HST-CASE-012-08: %s", (_label, capabilityIds) => {
    const result = evaluateScreenApplicability(scope(capabilityIds), rules);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_APPLICABILITY_INVALID");
  });

  it("rule digestとscopeのrule前提が食い違う場合は評価しない", () => {
    const result = evaluateScreenApplicability(scope(["cap-ui"]), {
      ...rules,
      rules_digest: "sha256:tampered",
    });
    expect(result.ok).toBe(false);
  });
});
