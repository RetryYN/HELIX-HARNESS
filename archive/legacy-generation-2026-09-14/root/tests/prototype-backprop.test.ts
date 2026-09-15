// PLAN-L7-511-screen-applicability-proto / U-SAP-009（HST-CASE-024-06）
import { describe, expect, it } from "vitest";
import type {
  PrototypeAgreementV1,
  RequirementRevisionV1,
} from "../src/design/screen-applicability";
import { validateRequirementsBackprop } from "../src/design/screen-applicability";

function agreement(overrides: Partial<PrototypeAgreementV1> = {}): PrototypeAgreementV1 {
  return {
    agreement_id: "agreement-1",
    capability_id: "cap-ui",
    artifact_revision: 2,
    walkthrough_set_digest: "sha256:walk-set",
    review_digest: "sha256:review",
    agreement_digest: "sha256:agreement",
    ...overrides,
  };
}

function revision(overrides: Partial<RequirementRevisionV1> = {}): RequirementRevisionV1 {
  return {
    requirement_id: "req-1",
    revision: 4,
    content_digest: "sha256:req-content",
    previous_revision: 3,
    ...overrides,
  };
}

describe("U-SAP-009 validateRequirementsBackprop", () => {
  it("U-SAP-009: delta経路はrevision trace完備でbackprop receipt exactly-one（決定的同値）", () => {
    const a = validateRequirementsBackprop(agreement(), revision());
    const b = validateRequirementsBackprop(agreement(), revision());
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.agreement_id).toBe("agreement-1");
      expect(a.value.from_requirement_revision).toBe(3);
      expect(a.value.to_requirement_revision).toBe(4);
      expect(a.value.delta_disposition_digest.length).toBeGreaterThan(0);
      expect(a.value.receipt_digest).toBe(b.value.receipt_digest);
      expect(a.value.receipt_id).toBe(b.value.receipt_id);
    }
  });

  it("純no_delta経路（artifact_revision=1 + previous_revision null）はfrom=toのreceiptを発行する", () => {
    const result = validateRequirementsBackprop(
      agreement({ artifact_revision: 1 }),
      revision({ revision: 3, previous_revision: null }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.from_requirement_revision).toBe(3);
      expect(result.value.to_requirement_revision).toBe(3);
    }
  });

  it("HST-CASE-024-06: no_delta偽装（artifact_revision>1なのにprevious_revision null）はHIL_PROTOTYPE_BACKPROP_MISSING", () => {
    const result = validateRequirementsBackprop(agreement(), revision({ previous_revision: null }));
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_BACKPROP_MISSING");
  });

  it.each([
    [
      "delta未disposition（revisionがprevious+1へ進んでいない）",
      revision({ revision: 3, previous_revision: 3 }),
    ],
    ["wrong L1 revision（連鎖飛び）", revision({ revision: 5, previous_revision: 3 })],
    ["逆行revision", revision({ revision: 2, previous_revision: 3 })],
    ["content digest欠落", revision({ content_digest: "" })],
    ["requirement id欠落", revision({ requirement_id: "" })],
    ["非整数revision", revision({ revision: 3.5 })],
  ])("HST-CASE-024-06反例: %s はbackprop 0", (_label, badRevision) => {
    const result = validateRequirementsBackprop(agreement(), badRevision);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_BACKPROP_MISSING");
  });

  it("agreementのfield欠落はfail-close", () => {
    const result = validateRequirementsBackprop(agreement({ agreement_digest: "" }), revision());
    expect(result.ok).toBe(false);
  });

  it("no_delta経路でprevious_revision付きtraceを渡す偽装はfail-close", () => {
    const result = validateRequirementsBackprop(
      agreement({ artifact_revision: 1 }),
      revision({ revision: 4, previous_revision: 3 }),
    );
    expect(result.ok).toBe(false);
  });
});
