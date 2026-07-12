import { describe, expect, it } from "vitest";
import { classifyLoopEpochFiles, LOOP_EPOCH_SCHEMA } from "../src/orchestration/durable-loop-epoch";
import { sha256Digest } from "../src/runtime/digest";

const PLAN = "PLAN-L7-449-durability-boundary-implementation";
const payload = JSON.stringify({
  state: {
    planId: PLAN,
    status: "running",
    iteration: 1,
    maxIterations: 3,
    lastVerdict: "pending",
    workerProvider: "codex",
    verifierProvider: null,
    blockedReason: null,
    windowOpensAt: "2026-07-13T00:00:00.000Z",
    windowClosesAt: "2026-07-13T12:00:00.000Z",
    costUsd: 0,
    updatedAt: "2026-07-13T00:00:00.000Z",
  },
  iteration: null,
});

function manifest(phase: "not_started" | "intent_recorded" | "completed" = "completed") {
  return JSON.stringify({
    schema: LOOP_EPOCH_SCHEMA,
    planId: PLAN,
    epochId: 1,
    previousManifestDigest: null,
    payloadDigest: sha256Digest(payload),
    sideEffectPhase: phase,
  });
}

describe("PLAN-L7-449 loop epoch reader", () => {
  it("U-DUR-004: distinguishes missing, uncommitted, corrupt, and committed", () => {
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: null,
        payloadText: null,
        claimStatus: "absent",
      }).status,
    ).toBe("missing");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: null,
        payloadText: payload,
        claimStatus: "absent",
      }).status,
    ).toBe("uncommitted");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: "{",
        payloadText: payload,
        claimStatus: "absent",
      }).status,
    ).toBe("corrupt");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: manifest(),
        payloadText: `${payload} `,
        claimStatus: "absent",
      }).status,
    ).toBe("corrupt");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: manifest(),
        payloadText: payload,
        claimStatus: "absent",
      }).status,
    ).toBe("committed");
  });

  it("U-DUR-004: distinguishes live/stale claims and residual-claim uncertainty", () => {
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: null,
        payloadText: null,
        claimStatus: "live",
      }).status,
    ).toBe("live_claim");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: null,
        payloadText: null,
        claimStatus: "stale",
      }).status,
    ).toBe("stale_claim");
    for (const claimStatus of ["live", "stale"] as const) {
      expect(
        classifyLoopEpochFiles({
          planId: PLAN,
          manifestText: manifest(),
          payloadText: payload,
          claimStatus,
        }).status,
      ).toBe("durability_uncertain");
    }
  });

  it("U-DUR-005: blocks an intent-recorded epoch from automatic retry", () => {
    const result = classifyLoopEpochFiles({
      planId: PLAN,
      manifestText: manifest("intent_recorded"),
      payloadText: payload,
      claimStatus: "absent",
    });
    expect(result.status).toBe("ambiguous_side_effect");
    expect(result.reason).toBe("intent_without_completion");
  });

  it("U-DUR-004/007: rejects invalid state schema and detects a forked epoch", () => {
    const invalidPayload = JSON.stringify({ state: { planId: PLAN }, iteration: null });
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: JSON.stringify({
          ...JSON.parse(manifest()),
          payloadDigest: sha256Digest(invalidPayload),
        }),
        payloadText: invalidPayload,
        claimStatus: "absent",
      }).status,
    ).toBe("corrupt");
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: manifest(),
        payloadText: payload,
        claimStatus: "absent",
        conflictingManifestText: JSON.stringify({
          ...JSON.parse(manifest()),
          payloadDigest: `sha256:${"0".repeat(64)}`,
        }),
      }).status,
    ).toBe("concurrent_conflict");
  });

  it("U-DUR-007: rejects stale previous digest and non-monotonic epoch", () => {
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: manifest(),
        payloadText: payload,
        claimStatus: "absent",
        previousManifestText: null,
      }).status,
    ).toBe("concurrent_conflict");
  });
});
