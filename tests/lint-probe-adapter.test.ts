import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  type EffectSnapshot,
  effectPayloadDigest,
  type ProbeIntent,
  paramsDigest,
  runProbe,
} from "../src/runtime/lint-effect-executor";
import { createLintProbePort } from "../src/runtime/lint-probe-adapter";

// PLAN-L7-451-lint-effect-port-separation

const sha = (char: string) => `sha256:${char.repeat(64)}` as const;
const snapshot: EffectSnapshot = {
  head: "a".repeat(40),
  worktreeDigest: sha("b"),
  inputsDigest: sha("c"),
};

function probe(): ProbeIntent {
  const params = { profile: "integration" } as const;
  const intent: ProbeIntent = {
    kind: "probe",
    operationId: "node-probe-1",
    capabilityId: "lint.probe",
    actor: "helix",
    tool: "node",
    target: "node -e probe",
    params,
    snapshot,
    idempotencyKey: "node-probe-key",
    expiresAt: "2026-07-15T00:00:00.000Z",
    authorization: {
      issuer: "helix-policy",
      signature: "verified",
      capabilityId: "lint.probe",
      actor: "helix",
      tool: "node",
      target: "node -e probe",
      paramsDigest: paramsDigest(params),
      effectPayloadDigest: sha("e"),
      revocationEpoch: 1,
      expiresAt: "2026-07-15T00:00:00.000Z",
    },
    command: process.execPath,
    args: ["-e", 'process.stdout.write("bounded-output")'],
    timeoutMs: 5_000,
  };
  intent.authorization = {
    ...intent.authorization,
    effectPayloadDigest: effectPayloadDigest(intent),
  };
  return intent;
}

function context() {
  const claims = new Set<string>();
  return {
    snapshotProvider: { observe: () => snapshot },
    trustedIssuers: new Set(["helix-policy"]),
    revocationEpoch: 1,
    idempotency: {
      claim: ({ key }: { key: string }) => {
        if (claims.has(key)) return "duplicate" as const;
        claims.add(key);
        return "claimed" as const;
      },
    },
    verifyAuthorization: () => true,
    now: () => "2026-07-14T00:00:00.000Z",
  };
}

describe("PLAN-L7-451 Node probe adapter", () => {
  it("U-SBOUND-015: IT-SBOUND-004 explicit argvをchild process一回だけ起動しbounded receiptを返す", () => {
    let spawns = 0;
    let observedShell: boolean | string | undefined;
    const port = createLintProbePort({
      cwd: process.cwd(),
      spawn: (command, args, options) => {
        spawns += 1;
        observedShell = options?.shell;
        return spawnSync(command, [...args], options) as SpawnSyncReturns<string>;
      },
    });

    const receipt = runProbe(probe(), port, context());

    expect(spawns).toBe(1);
    expect(observedShell).toBe(false);
    expect(receipt).toMatchObject({ status: "accepted", exitCode: 0, binary: process.execPath });
    expect(JSON.stringify(receipt)).not.toContain("bounded-output");
  });

  it("rejects over-ceiling timeout before the adapter runner", () => {
    let spawns = 0;
    const port = createLintProbePort({
      cwd: process.cwd(),
      timeoutCeilingMs: 100,
      spawn: () => {
        spawns += 1;
        throw new Error("must not spawn");
      },
    });
    expect(runProbe(probe(), port, context())).toMatchObject({
      status: "uncertain",
      reason: "probe_port_threw",
    });
    expect(spawns).toBe(0);
  });
});
