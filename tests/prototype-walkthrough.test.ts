// PLAN-L7-511-screen-applicability-proto / U-SAP-007（HST-CASE-024-05/08）
import { describe, expect, it } from "vitest";
import type {
  PrototypeReadyReceiptV1,
  WalkthroughInputV1,
  WalkthroughReceiptV1,
} from "../src/design/screen-applicability";
import {
  recordWalkthroughIteration,
  WALKTHROUGH_ITERATION_LIMIT,
} from "../src/design/screen-applicability";

const artifact: PrototypeReadyReceiptV1 = {
  artifact_id: "artifact-1",
  revision: 1,
  manifest_digest: "sha256:manifest",
  state_set_digest: "sha256:state-set",
  capability_id: "cap-ui",
  receipt_digest: "sha256:ready",
};

function input(overrides: Partial<WalkthroughInputV1> = {}): WalkthroughInputV1 {
  return {
    actor_id: "user-1",
    artifact_revision: 1,
    observation_digest: "sha256:observation",
    disposition: "no_delta",
    target_requirement_id: null,
    ...overrides,
  };
}

function receiptAt(iteration: number): WalkthroughReceiptV1 {
  return {
    receipt_id: `walk-${iteration}`,
    artifact_id: "artifact-1",
    iteration,
    actor_id: "user-1",
    observation_digest: `sha256:obs-${iteration}`,
    delta_digest: null,
    rebuilt_artifact_revision: null,
    receipt_digest: `sha256:walk-${iteration}`,
  };
}

describe("U-SAP-007 recordWalkthroughIteration", () => {
  it("U-SAP-007: no_delta観測でreceipt exactly-one（iteration=prior末尾+1、同一入力再送は決定的同値）", () => {
    const a = recordWalkthroughIteration(artifact, input(), [receiptAt(1)]);
    const b = recordWalkthroughIteration(artifact, input(), [receiptAt(1)]);
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.iteration).toBe(2);
      expect(a.value.delta_digest).toBeNull();
      expect(a.value.rebuilt_artifact_revision).toBeNull();
      expect(a.value.receipt_id).toBe(b.value.receipt_id);
      expect(a.value.receipt_digest).toBe(b.value.receipt_digest);
    }
  });

  it("delta観測はtarget requirementとrebuild先revisionをbindする", () => {
    const result = recordWalkthroughIteration(
      artifact,
      input({ disposition: "delta", target_requirement_id: "req-1" }),
      [],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.iteration).toBe(1);
      expect(result.value.delta_digest).not.toBeNull();
      expect(result.value.rebuilt_artifact_revision).toBe(artifact.revision + 1);
    }
  });

  it.each([
    ["actor欠落", input({ actor_id: "" })],
    ["observation欠落", input({ observation_digest: "" })],
    ["artifact revision不一致", input({ artifact_revision: 2 })],
  ])("HST-CASE-024-08: %s はHIL_WALKTHROUGH_RECEIPT_MISSING", (_label, badInput) => {
    const result = recordWalkthroughIteration(artifact, badInput, []);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_WALKTHROUGH_RECEIPT_MISSING");
  });

  it.each([
    ["delta なのにtarget欠落", input({ disposition: "delta", target_requirement_id: null })],
    ["delta なのにtarget空文字列", input({ disposition: "delta", target_requirement_id: "" })],
    ["no_delta なのにtarget指定", input({ target_requirement_id: "req-1" })],
  ])("HST-CASE-024-05: %s はHIL_PROTOTYPE_DELTA_MISSING", (_label, badInput) => {
    const result = recordWalkthroughIteration(artifact, badInput, []);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_DELTA_MISSING");
  });

  it("prior列の非連続iterationはHIL_WALKTHROUGH_RECEIPT_MISSING", () => {
    const result = recordWalkthroughIteration(artifact, input(), [receiptAt(1), receiptAt(3)]);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_WALKTHROUGH_RECEIPT_MISSING");
  });

  it("他artifactのreceipt混入はHIL_WALKTHROUGH_RECEIPT_MISSING", () => {
    const foreign = { ...receiptAt(1), artifact_id: "artifact-other" };
    const result = recordWalkthroughIteration(artifact, input(), [foreign]);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_WALKTHROUGH_RECEIPT_MISSING");
  });

  it("iterationちょうど上限（WALKTHROUGH_ITERATION_LIMIT件目）は成功する", () => {
    const prior = Array.from({ length: WALKTHROUGH_ITERATION_LIMIT - 1 }, (_, i) =>
      receiptAt(i + 1),
    );
    const result = recordWalkthroughIteration(artifact, input(), prior);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.iteration).toBe(WALKTHROUGH_ITERATION_LIMIT);
  });

  it("iteration上限超過（WALKTHROUGH_ITERATION_LIMIT）はfail-close", () => {
    const prior = Array.from({ length: WALKTHROUGH_ITERATION_LIMIT }, (_, i) => receiptAt(i + 1));
    const result = recordWalkthroughIteration(artifact, input(), prior);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_WALKTHROUGH_RECEIPT_MISSING");
  });
});
