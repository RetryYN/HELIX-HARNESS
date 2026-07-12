import { describe, expect, it } from "vitest";
import {
  authorizeLoopSideEffect,
  classifyLoopEpochFiles,
  commitLoopEpoch,
  type DurableEpochPort,
  LOOP_EPOCH_SCHEMA,
} from "../src/orchestration/durable-loop-epoch";
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
    payloadFile: `${PLAN}.epoch-1-${sha256Digest(payload).slice(7)}.payload.json`,
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

  it("U-DUR-005/006: mints an intent capability only after the full durability sequence", () => {
    const calls: string[] = [];
    const port = Object.fromEntries(
      [
        "acquireExclusiveClaim",
        "readManifestText",
        "writePayloadTemp",
        "fsyncPayloadTemp",
        "renamePayload",
        "fsyncStateDirectory",
        "writeManifestTemp",
        "fsyncManifestTemp",
        "renameManifest",
        "unlinkClaim",
        "fsyncClaimDirectory",
      ].map((name) => [
        name,
        () => {
          calls.push(name);
          return name === "acquireExclusiveClaim" ? true : null;
        },
      ]),
    ) as unknown as DurableEpochPort;
    const committed = commitLoopEpoch({
      planId: PLAN,
      previousManifestText: null,
      payload: JSON.parse(payload),
      sideEffectPhase: "intent_recorded",
      port,
    });
    expect(committed.status).toBe("committed");
    expect(calls).toEqual([
      "acquireExclusiveClaim",
      "readManifestText",
      "writePayloadTemp",
      "fsyncPayloadTemp",
      "renamePayload",
      "fsyncStateDirectory",
      "writeManifestTemp",
      "fsyncManifestTemp",
      "renameManifest",
      "fsyncStateDirectory",
      "unlinkClaim",
      "fsyncClaimDirectory",
    ]);
    let effects = 0;
    expect(
      authorizeLoopSideEffect(null, PLAN, () => {
        effects += 1;
      }),
    ).toEqual({ allowed: false });
    expect(
      authorizeLoopSideEffect(committed.intentCapability, PLAN, () => {
        effects += 1;
        return "ok";
      }),
    ).toEqual({ allowed: true, value: "ok" });
    expect(authorizeLoopSideEffect(committed.intentCapability, PLAN, () => "replay")).toEqual({
      allowed: false,
    });
    expect(effects).toBe(1);
  });

  it("U-DUR-005/007: rejects wrong-plan capability use and phase-only forks", () => {
    const port = new Proxy({} as DurableEpochPort, {
      get: (_target, name) => {
        if (name === "acquireExclusiveClaim") return () => true;
        if (name === "readManifestText") return () => null;
        return () => undefined;
      },
    });
    const committed = commitLoopEpoch({
      planId: PLAN,
      previousManifestText: null,
      payload: JSON.parse(payload),
      sideEffectPhase: "intent_recorded",
      port,
    });
    expect(
      authorizeLoopSideEffect(
        committed.intentCapability,
        "PLAN-L7-448-qs4-test-infra-inventory",
        () => "unsafe",
      ),
    ).toEqual({ allowed: false });
    expect(
      classifyLoopEpochFiles({
        planId: PLAN,
        manifestText: manifest("intent_recorded"),
        payloadText: payload,
        claimStatus: "absent",
        conflictingManifestText: manifest("completed"),
      }).status,
    ).toBe("concurrent_conflict");
  });

  it("U-DUR-006/007: fails closed on claim conflict and every durability fault", () => {
    const methods = [
      "writePayloadTemp",
      "fsyncPayloadTemp",
      "renamePayload",
      "fsyncStateDirectory",
      "writeManifestTemp",
      "fsyncManifestTemp",
      "renameManifest",
      "unlinkClaim",
      "fsyncClaimDirectory",
    ] as const;
    for (const fault of methods) {
      const port = new Proxy({} as DurableEpochPort, {
        get: (_target, name) => {
          if (name === "acquireExclusiveClaim") return () => true;
          if (name === "readManifestText") return () => null;
          if (name === fault)
            return () => {
              throw new Error(`fault:${fault}`);
            };
          return () => undefined;
        },
      });
      const result = commitLoopEpoch({
        planId: PLAN,
        previousManifestText: null,
        payload: JSON.parse(payload),
        sideEffectPhase: "intent_recorded",
        port,
      });
      expect(result.status).toBe("durability_uncertain");
      expect(result.intentCapability).toBeNull();
    }
    const conflictPort = {
      acquireExclusiveClaim: () => false,
    } as unknown as DurableEpochPort;
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: null,
        payload: JSON.parse(payload),
        sideEffectPhase: "completed",
        port: conflictPort,
      }).status,
    ).toBe("concurrent_conflict");
  });

  it("U-DUR-006/007: rejects an invalid payload and durably releases its claim", () => {
    const calls: string[] = [];
    const port = new Proxy({} as DurableEpochPort, {
      get: (_target, name) => {
        if (name === "acquireExclusiveClaim") return () => true;
        if (name === "readManifestText") return () => null;
        return () => calls.push(String(name));
      },
    });
    const result = commitLoopEpoch({
      planId: PLAN,
      previousManifestText: null,
      payload: { state: { planId: PLAN } as never, iteration: null },
      sideEffectPhase: "not_started",
      port,
    });
    expect(result.status).toBe("corrupt");
    expect(result.intentCapability).toBeNull();
    expect(calls).toEqual(["unlinkClaim", "fsyncClaimDirectory"]);
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
          payloadFile: `${PLAN}.epoch-1-${"0".repeat(64)}.payload.json`,
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
