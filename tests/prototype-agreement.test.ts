// PLAN-L7-511-screen-applicability-proto / U-SAP-008（HST-CASE-024-01/04）
import { describe, expect, it } from "vitest";
import type {
  HumanReviewV1,
  PrototypeReadyReceiptV1,
  WalkthroughReceiptV1,
} from "../src/design/screen-applicability";
import { evaluatePrototypeAgreement } from "../src/design/screen-applicability";

const artifact: PrototypeReadyReceiptV1 = {
  artifact_id: "artifact-1",
  revision: 2,
  manifest_digest: "sha256:manifest",
  state_set_digest: "sha256:state-set",
  capability_id: "cap-ui",
  receipt_digest: "sha256:ready",
};

function walkthrough(iteration: number, delta: boolean): WalkthroughReceiptV1 {
  return {
    receipt_id: `walk-${iteration}`,
    artifact_id: "artifact-1",
    iteration,
    actor_id: "user-1",
    observation_digest: `sha256:obs-${iteration}`,
    delta_digest: delta ? `sha256:delta-${iteration}` : null,
    rebuilt_artifact_revision: delta ? 2 : null,
    receipt_digest: `sha256:walk-${iteration}`,
  };
}

function review(overrides: Partial<HumanReviewV1> = {}): HumanReviewV1 {
  return {
    reviewer_id: "po-1",
    authority_receipt_id: "authority-1",
    artifact_revision: 2,
    verdict: "approved",
    review_digest: "sha256:review",
    ...overrides,
  };
}

const completeSet = [walkthrough(1, true), walkthrough(2, false)];

describe("U-SAP-008 evaluatePrototypeAgreement", () => {
  it("U-SAP-008: latest artifact + 完結walkthrough + approved人reviewを同digestへbindしたagreement exactly-one", () => {
    const a = evaluatePrototypeAgreement(artifact, completeSet, review());
    const b = evaluatePrototypeAgreement(artifact, completeSet, review());
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.capability_id).toBe("cap-ui");
      expect(a.value.artifact_revision).toBe(2);
      expect(a.value.review_digest).toBe("sha256:review");
      expect(a.value.walkthrough_set_digest.length).toBeGreaterThan(0);
      expect(a.value.agreement_digest).toBe(b.value.agreement_digest);
      expect(a.value.agreement_id).toBe(b.value.agreement_id);
    }
  });

  it("HST-CASE-024-04: walkthrough無しはHIL_PROTOTYPE_WALKTHROUGH_MISSING", () => {
    const result = evaluatePrototypeAgreement(artifact, [], review());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_WALKTHROUGH_MISSING");
  });

  it("最終iterationがdelta（未完結walkthrough）はfail-close", () => {
    const result = evaluatePrototypeAgreement(artifact, [walkthrough(1, true)], review());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_WALKTHROUGH_MISSING");
  });

  it("非連続iterationのwalkthrough集合はfail-close", () => {
    const result = evaluatePrototypeAgreement(
      artifact,
      [walkthrough(1, true), { ...walkthrough(3, false) }],
      review(),
    );
    expect(result.ok).toBe(false);
  });

  it.each([
    ["旧artifact revisionへのreview", review({ artifact_revision: 1 })],
    ["人以外review（authority receipt欠落）", review({ authority_receipt_id: "" })],
    ["reviewer欠落", review({ reviewer_id: "" })],
    ["review digest欠落", review({ review_digest: "" })],
    ["verdict=rejected", review({ verdict: "rejected" as const })],
  ])("HST-CASE-024-01反例: %s はagreement 0", (_label, badReview) => {
    const result = evaluatePrototypeAgreement(artifact, completeSet, badReview);
    expect(result.ok).toBe(false);
  });

  it("他artifactのwalkthrough混入はfail-close", () => {
    const foreign = { ...walkthrough(2, false), artifact_id: "artifact-other" };
    const result = evaluatePrototypeAgreement(artifact, [walkthrough(1, true), foreign], review());
    expect(result.ok).toBe(false);
  });
});
