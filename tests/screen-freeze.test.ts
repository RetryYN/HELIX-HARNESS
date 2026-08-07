// PLAN-L7-512-screen-freeze-plan-route / U-SAP-010（HST-CASE-012-02/05/07/09/10）
import { describe, expect, it } from "vitest";
import type {
  BackpropReceiptV1,
  NoUiReceiptV1,
  PrototypeAgreementV1,
  ScreenDecisionV1,
  ScreenScopeSnapshotV1,
} from "../src/design/screen-applicability";
import { evaluateScreenFreeze } from "../src/design/screen-applicability";

const scope: ScreenScopeSnapshotV1 = {
  snapshot_id: "snap-1",
  revision: 1,
  capability_ids: ["cap-a"],
  phase: "L2",
  public_surface_digest: "sha256:surface",
  scope_digest: "sha256:scope",
};

function decision(overrides: Partial<ScreenDecisionV1> = {}): ScreenDecisionV1 {
  return {
    decision_id: "dec-1",
    decision_revision: 1,
    scope_digest: "sha256:scope",
    capability_id: "cap-a",
    phase: "L2",
    status: "current",
    route: "not_applicable",
    reason_code: "no_public_ui_surface",
    evidence_digest: "sha256:evidence",
    detector_id: "detector-1",
    detector_version: "1.0.0",
    detector_result_digest: "sha256:result",
    detector_provenance_digest: "sha256:provenance",
    actor_id: "actor-1",
    rule_digest: "sha256:rule",
    reentry_trigger: "scope_digest_change",
    decision_digest: "sha256:decision",
    ...overrides,
  };
}

const skip: NoUiReceiptV1 = {
  receipt_id: "skip-1",
  decision_id: "dec-1",
  decision_revision: 1,
  capability_id: "cap-a",
  capability_revision: 1,
  scope_digest: "sha256:scope",
  rule_digest: "sha256:rule",
  reason_code: "no_public_ui_surface",
  evidence_digest: "sha256:evidence",
  actor_id: "actor-1",
  reentry_trigger_digest: "sha256:trigger",
  issued_at: "2026-08-07T00:00:00Z",
  expires_at: "2026-09-07T00:00:00Z",
  receipt_digest: "sha256:skip",
};

const agreement: PrototypeAgreementV1 = {
  agreement_id: "agreement-1",
  capability_id: "cap-a",
  artifact_revision: 2,
  walkthrough_set_digest: "sha256:walk-set",
  review_digest: "sha256:review",
  agreement_digest: "sha256:agreement",
};

const backprop: BackpropReceiptV1 = {
  receipt_id: "backprop-1",
  agreement_id: "agreement-1",
  from_requirement_revision: 3,
  to_requirement_revision: 4,
  delta_disposition_digest: "sha256:disposition",
  receipt_digest: "sha256:backprop",
};

describe("U-SAP-010 evaluateScreenFreeze", () => {
  it("U-SAP-010: no-UI route + skip receipt で verdict=passed の candidate を決定的生成する（commit系fieldはplaceholder）", () => {
    const a = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: skip,
      agreement: null,
      backprop: null,
    });
    const b = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: skip,
      agreement: null,
      backprop: null,
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.verdict).toBe("passed");
      expect(a.value.route).toBe("not_applicable");
      expect(a.value.skip_digest).toBe("sha256:skip");
      expect(a.value.agreement_digest).toBeNull();
      expect(a.value.commit_receipt_digest).toBe("");
      expect(a.value.before_revision).toBe(0);
      expect(a.value.event_head).toBe("");
      expect(a.value.gate_receipt_id).toBe(b.value.gate_receipt_id);
      expect(a.value.operation_digest).toBe(b.value.operation_digest);
    }
  });

  it("UI route + agreement + backprop で verdict=passed（l1_revision を bind）", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ route: "prototype_required" }),
      skip: null,
      agreement: agreement,
      backprop: backprop,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.route).toBe("prototype_required");
      expect(result.value.agreement_digest).toBe("sha256:agreement");
      expect(result.value.skip_digest).toBeNull();
      expect(result.value.l1_revision).toBe(4);
    }
  });

  it("HST-CASE-012-09: skip/agreement両欠落はHIL_SCREEN_GATE_EVIDENCE_MISSING", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: null,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });

  it("HST-CASE-012-10: skipとagreementの両方同時はHIL_SCREEN_IMPLICIT_SKIP", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: skip,
      agreement: agreement,
      backprop: backprop,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_IMPLICIT_SKIP");
  });

  it("HST-CASE-012-02: decision staleはHIL_SCREEN_DECISION_MISSING", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ status: "stale" }),
      skip: skip,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DECISION_MISSING");
  });

  it("HST-CASE-012-07: scope digest不一致のdecisionはHIL_SCREEN_DECISION_MISSING", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ scope_digest: "sha256:other" }),
      skip: skip,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DECISION_MISSING");
  });

  it("HST-CASE-012-05: route deferredはHIL_SCREEN_DEFERRED_NOT_CLOSED", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ route: "deferred" }),
      skip: null,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DEFERRED_NOT_CLOSED");
  });

  it("partial transaction（agreement有りbackprop無し）はHIL_SCREEN_GATE_EVIDENCE_MISSING", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ route: "prototype_required" }),
      skip: null,
      agreement: agreement,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });

  it("UI routeへskipだけを渡す偽装はHIL_SCREEN_IMPLICIT_SKIP", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ route: "prototype_required" }),
      skip: skip,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_IMPLICIT_SKIP");
  });

  it("no-UI routeへagreement+backpropを渡す誤evidenceはHIL_SCREEN_GATE_EVIDENCE_MISSING", () => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: null,
      agreement: agreement,
      backprop: backprop,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });

  it.each([
    ["skipのdecision_id不一致", { ...skip, decision_id: "dec-other" }],
    ["skipのdecision_revision不一致", { ...skip, decision_revision: 2 }],
    ["skipのscope_digest不一致", { ...skip, scope_digest: "sha256:other" }],
    ["skipのrule_digest不一致", { ...skip, rule_digest: "sha256:other" }],
  ])("skip identity改変（%s）はHIL_SCREEN_GATE_EVIDENCE_MISSING", (_label, badSkip) => {
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision(),
      skip: badSkip,
      agreement: null,
      backprop: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });

  it("backpropのagreement_id不一致はHIL_SCREEN_GATE_EVIDENCE_MISSING", () => {
    const foreign = { ...backprop, agreement_id: "agreement-other" };
    const result = evaluateScreenFreeze({
      scope: scope,
      decision: decision({ route: "prototype_required" }),
      skip: null,
      agreement: agreement,
      backprop: foreign,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });
});
