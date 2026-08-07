// PLAN-L7-510-screen-applicability-core / U-SAP-003（HST-CASE-012-04）
import { describe, expect, it } from "vitest";
import type { NoUiReceiptV1, ScreenDecisionV1 } from "../src/design/screen-applicability";
import { validateNoUiReceipt } from "../src/design/screen-applicability";

const decision: ScreenDecisionV1 = {
  decision_id: "dec-1",
  decision_revision: 3,
  scope_digest: "sha256:scope",
  capability_id: "cap-noui",
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
  reentry_trigger: "scope_or_rule_digest_change",
  decision_digest: "sha256:decision",
};

const receipt: NoUiReceiptV1 = {
  receipt_id: "skip-1",
  decision_id: "dec-1",
  decision_revision: 3,
  capability_id: "cap-noui",
  capability_revision: 1,
  scope_digest: "sha256:scope",
  rule_digest: "sha256:rule",
  reason_code: "no_public_ui_surface",
  evidence_digest: "sha256:evidence",
  actor_id: "actor-1",
  reentry_trigger_digest: "sha256:trigger",
  issued_at: "2026-08-07T00:00:00Z",
  expires_at: "2026-09-07T00:00:00Z",
  receipt_digest: "sha256:receipt",
};

const NOW = "2026-08-07T12:00:00Z";

describe("U-SAP-003 validateNoUiReceipt", () => {
  it("U-SAP-003: 完全一致のreceiptだけをvalidとする", () => {
    const result = validateNoUiReceipt(decision, receipt, NOW);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.receipt_id).toBe("skip-1");
  });

  it.each([
    ["reason空", { ...receipt, reason_code: "" }],
    ["actor空", { ...receipt, actor_id: "" }],
    ["evidence空", { ...receipt, evidence_digest: "" }],
    ["reentry trigger空", { ...receipt, reentry_trigger_digest: "" }],
    ["scope digest不一致", { ...receipt, scope_digest: "sha256:other" }],
    ["rule digest不一致", { ...receipt, rule_digest: "sha256:other" }],
    ["decision identity不一致", { ...receipt, decision_id: "dec-2" }],
    ["decision revision不一致", { ...receipt, decision_revision: 4 }],
  ])("HST-CASE-012-04: %s はHIL_SCREEN_SKIP_EVIDENCE_MISSINGでvalid 0", (_label, candidate) => {
    const result = validateNoUiReceipt(decision, candidate, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_SKIP_EVIDENCE_MISSING");
  });

  it("expiry超過はHIL_SCREEN_RECEIPT_STALEでvalid 0", () => {
    const result = validateNoUiReceipt(decision, receipt, "2026-10-01T00:00:00Z");
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_RECEIPT_STALE");
  });

  it("stale decisionへのreceiptはvalid 0", () => {
    const result = validateNoUiReceipt({ ...decision, status: "stale" }, receipt, NOW);
    expect(result.ok).toBe(false);
  });
});
