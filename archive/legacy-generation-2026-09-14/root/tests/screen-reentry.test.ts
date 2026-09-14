// PLAN-L7-510-screen-applicability-core / U-SAP-004（HST-CASE-012-03）
import { describe, expect, it } from "vitest";
import type { NoUiReceiptV1 } from "../src/design/screen-applicability";
import { canonicalizeScreenScope, evaluateScreenReentry } from "../src/design/screen-applicability";

function currentScope(overrides: { capabilityIds?: string[]; surface?: string } = {}) {
  const result = canonicalizeScreenScope(
    {
      snapshot_id: "snap-2",
      revision: 2,
      capability_ids: overrides.capabilityIds ?? ["cap-noui"],
      phase: "L2",
      public_surface_digest: overrides.surface ?? "sha256:surface",
    },
    {
      policy_id: "policy-1",
      revision: 1,
      capability_ids: ["cap-noui", "cap-other"],
      rule_set_digest: "sha256:rule",
    },
  );
  if (!result.ok) throw new Error("fixture scope must canonicalize");
  return result.value;
}

const baseline = currentScope();

const prior: NoUiReceiptV1 = {
  receipt_id: "skip-1",
  decision_id: "dec-1",
  decision_revision: 3,
  capability_id: "cap-noui",
  capability_revision: 1,
  scope_digest: baseline.scope_digest,
  rule_digest: "sha256:rule",
  reason_code: "no_public_ui_surface",
  evidence_digest: "sha256:evidence",
  actor_id: "actor-1",
  reentry_trigger_digest: "sha256:trigger",
  issued_at: "2026-08-07T00:00:00Z",
  expires_at: "2026-09-07T00:00:00Z",
  receipt_digest: "sha256:receipt",
};

describe("U-SAP-004 evaluateScreenReentry", () => {
  it("scope digest不変なら再入場しない（stale 0・task 0）", () => {
    const result = evaluateScreenReentry(prior, baseline, prior.rule_digest);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_RECEIPT_STALE");
  });

  it.each([
    ["public surface変更", currentScope({ surface: "sha256:surface2" })],
    ["capability集合変更", currentScope({ capabilityIds: ["cap-noui", "cap-other"] })],
  ])("HST-CASE-012-03: %s でstale + 再判定task exactly-one", (_label, scope) => {
    const result = evaluateScreenReentry(prior, scope, prior.rule_digest);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.stale_receipt_id).toBe("skip-1");
      expect(result.value.capability_id).toBe("cap-noui");
      expect(result.value.task_id.length).toBeGreaterThan(0);
      expect(result.value.expected_revision).toBe(prior.decision_revision + 1);
    }
  });

  it("U-SAP-004: 同一入力の再送は同一task_id/trigger_digest（増分0の決定的同値）", () => {
    const changed = currentScope({ surface: "sha256:surface2" });
    const a = evaluateScreenReentry(prior, changed, prior.rule_digest);
    const b = evaluateScreenReentry(prior, changed, prior.rule_digest);
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.task_id).toBe(b.value.task_id);
      expect(a.value.trigger_digest).toBe(b.value.trigger_digest);
    }
  });
});
