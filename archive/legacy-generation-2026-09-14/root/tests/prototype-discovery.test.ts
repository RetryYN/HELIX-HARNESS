// PLAN-L7-510-screen-applicability-core / U-SAP-005（HST-CASE-012-06 supporting oracle）
import { describe, expect, it } from "vitest";
import type { ScreenDecisionV1, ScreenRequirementV1 } from "../src/design/screen-applicability";
import { planPrototypeDiscovery } from "../src/design/screen-applicability";

const uiDecision: ScreenDecisionV1 = {
  decision_id: "dec-ui",
  decision_revision: 1,
  scope_digest: "sha256:scope",
  capability_id: "cap-ui",
  phase: "L2",
  status: "current",
  route: "prototype_required",
  reason_code: "public_ui_surface",
  evidence_digest: "sha256:evidence",
  detector_id: "detector-1",
  detector_version: "1.0.0",
  detector_result_digest: "sha256:result",
  detector_provenance_digest: "sha256:provenance",
  actor_id: "actor-1",
  rule_digest: "sha256:rule",
  reentry_trigger: "scope_or_rule_digest_change",
  decision_digest: "sha256:decision",
};

const requirement: ScreenRequirementV1 = {
  requirement_id: "req-1",
  revision: 2,
  capability_id: "cap-ui",
  screen_obligation_digest: "sha256:screen",
  interaction_obligation_digest: "sha256:interaction",
  state_obligation_digest: "sha256:state",
  data_obligation_digest: "sha256:data",
};

describe("U-SAP-005 planPrototypeDiscovery", () => {
  it("U-SAP-005: prototype_requiredからtask exactly-oneを生成し義務digestを全保持する", () => {
    const result = planPrototypeDiscovery(uiDecision, [requirement]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.capability_id).toBe("cap-ui");
      expect(result.value.requirement_revision).toBe(2);
      expect(result.value.status).toBe("planned");
      // obligation_digest は 4 義務すべてを束ねた合成digestであり、1義務でも変われば変わる
      const mutated = planPrototypeDiscovery(uiDecision, [
        { ...requirement, state_obligation_digest: "sha256:state2" },
      ]);
      expect(mutated.ok && mutated.value.obligation_digest !== result.value.obligation_digest).toBe(
        true,
      );
    }
  });

  it("no-UI routeへのtask生成はfail-close（task 0）", () => {
    const result = planPrototypeDiscovery({ ...uiDecision, route: "not_applicable" }, [
      requirement,
    ]);
    expect(result.ok).toBe(false);
  });

  it.each([
    ["screen義務欠落", { ...requirement, screen_obligation_digest: "" }],
    ["interaction義務欠落", { ...requirement, interaction_obligation_digest: "" }],
    ["state義務欠落", { ...requirement, state_obligation_digest: "" }],
    ["data義務欠落", { ...requirement, data_obligation_digest: "" }],
  ])("%s はtask 0でfail-closeする", (_label, broken) => {
    const result = planPrototypeDiscovery(uiDecision, [broken]);
    expect(result.ok).toBe(false);
  });

  it("capability対象requirementが0件ならtask 0", () => {
    const result = planPrototypeDiscovery(uiDecision, [
      { ...requirement, capability_id: "cap-other" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("複数capabilityのpacked decisionでも対象requirementを復元してtaskを生成する", () => {
    const result = planPrototypeDiscovery({ ...uiDecision, capability_id: "cap-ui,cap-ui2" }, [
      requirement,
      { ...requirement, requirement_id: "req-2", capability_id: "cap-ui2" },
    ]);
    expect(result.ok).toBe(true);
  });

  it("stale decisionからはtaskを生成しない", () => {
    const result = planPrototypeDiscovery({ ...uiDecision, status: "stale" }, [requirement]);
    expect(result.ok).toBe(false);
  });
});
