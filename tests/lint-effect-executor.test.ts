import { describe, expect, it } from "vitest";
import {
  type EffectAuthorization,
  type EffectSnapshot,
  type ExecutorContext,
  effectPayloadDigest,
  type MaterializeIntent,
  materializeLintArtifact,
  type ProbeIntent,
  paramsDigest,
  runProbe,
} from "../src/runtime/lint-effect-executor";

// PLAN-L7-451-lint-effect-port-separation

const sha = (char: string) => `sha256:${char.repeat(64)}` as const;
const snapshot: EffectSnapshot = {
  head: "a".repeat(40),
  worktreeDigest: sha("b"),
  inputsDigest: sha("c"),
};
const params = { profile: "bun-unit" } as const;

function authorization(effectDigest = sha("e")): EffectAuthorization {
  return {
    issuer: "helix-policy",
    signature: "verified",
    capabilityId: "lint.probe",
    actor: "helix",
    tool: "bun",
    target: "bun --version",
    paramsDigest: paramsDigest(params),
    effectPayloadDigest: effectDigest,
    revocationEpoch: 7,
    expiresAt: "2026-07-15T00:00:00.000Z",
  };
}

function probe(): ProbeIntent {
  const intent = {
    kind: "probe",
    operationId: "probe-1",
    capabilityId: "lint.probe",
    actor: "helix",
    tool: "bun",
    target: "bun --version",
    params,
    snapshot,
    idempotencyKey: "probe-key",
    expiresAt: "2026-07-15T00:00:00.000Z",
    authorization: authorization(),
    command: "bun",
    args: ["--version"],
    timeoutMs: 10_000,
  } satisfies ProbeIntent;
  intent.authorization = authorization(effectPayloadDigest(intent));
  return intent;
}

function durableClaims() {
  const claims = new Map<string, string>();
  return {
    claim({ key, scopeDigest }: { key: string; scopeDigest: string }) {
      const previous = claims.get(key);
      if (previous === scopeDigest) return "duplicate" as const;
      if (previous !== undefined) return "conflict" as const;
      claims.set(key, scopeDigest);
      return "claimed" as const;
    },
  };
}

function context(overrides: Partial<ExecutorContext> = {}): ExecutorContext {
  return {
    snapshotProvider: { observe: () => snapshot },
    trustedIssuers: new Set(["helix-policy"]),
    revocationEpoch: 7,
    idempotency: durableClaims(),
    verifyAuthorization: (receipt) => receipt.signature === "verified",
    now: () => "2026-07-14T00:00:00.000Z",
    ...overrides,
  };
}

describe("PLAN-L7-451 lint effect executor", () => {
  it("U-SBOUND-006: successだけをacceptedにしraw出力をreceiptへ残さない", () => {
    const receipt = runProbe(
      probe(),
      {
        execute: () => ({
          exitCode: 0,
          timedOut: false,
          stdout: "secret output",
          binaryVersion: "1.0",
        }),
      },
      context(),
    );
    expect(receipt).toMatchObject({
      status: "accepted",
      reason: "probe_succeeded",
      exitCode: 0,
    });
    expect(JSON.stringify(receipt)).not.toContain("secret output");
  });

  it.each([
    [{ exitCode: 1, timedOut: false }, "probe_nonzero"],
    [{ exitCode: null, timedOut: true }, "probe_timeout"],
  ] as const)("U-SBOUND-006: timeout/nonzeroをblocked receiptにする", (result, reason) => {
    expect(runProbe(probe(), { execute: () => result }, context())).toMatchObject({
      status: "blocked",
      reason,
    });
  });

  it("U-SBOUND-009: authority/snapshot/idempotency変異でeffect callback 0", () => {
    const untrusted = probe();
    untrusted.authorization = { ...untrusted.authorization, issuer: "self" };
    const revoked = probe();
    revoked.authorization = { ...revoked.authorization, revocationEpoch: 6 };
    const cases: Array<[ProbeIntent, ExecutorContext, string]> = [
      [untrusted, context(), "untrusted_issuer"],
      [revoked, context(), "authorization_revoked"],
      [
        probe(),
        context({ snapshotProvider: { observe: () => ({ ...snapshot, head: "d".repeat(40) }) } }),
        "snapshot_drift_preflight",
      ],
      [
        probe(),
        context({
          idempotency: {
            claim: () => "duplicate",
          },
        }),
        "duplicate_intent",
      ],
    ];
    for (const [intent, executorContext, reason] of cases) {
      let calls = 0;
      const receipt = runProbe(
        intent,
        {
          execute: () => {
            calls += 1;
            return { exitCode: 0, timedOut: false };
          },
        },
        executorContext,
      );
      expect(receipt).toMatchObject({ status: "blocked", reason });
      expect(calls).toBe(0);
    }
  });

  it("IT-SBOUND-007: dispatch直前のsnapshot driftはeffect 0、dispatch後はacceptedにしない", () => {
    let current = snapshot;
    const preDispatch = context({
      idempotency: {
        claim: () => {
          current = { ...snapshot, head: "d".repeat(40) };
          return "claimed";
        },
      },
      snapshotProvider: { observe: () => current },
    });
    let preDispatchCalls = 0;
    expect(
      runProbe(
        probe(),
        {
          execute: () => {
            preDispatchCalls += 1;
            return { exitCode: 0, timedOut: false };
          },
        },
        preDispatch,
      ),
    ).toMatchObject({ status: "blocked", reason: "snapshot_drift_pre_dispatch" });
    expect(preDispatchCalls).toBe(0);

    current = snapshot;
    let postDispatchCalls = 0;
    expect(
      runProbe(
        probe(),
        {
          execute: () => {
            postDispatchCalls += 1;
            current = { ...snapshot, inputsDigest: sha("d") };
            return { exitCode: 0, timedOut: false };
          },
        },
        context({ snapshotProvider: { observe: () => current } }),
      ),
    ).toMatchObject({ status: "uncertain", reason: "snapshot_drift_after_dispatch" });
    expect(postDispatchCalls).toBe(1);
  });

  it("U-SBOUND-009: 無効な期限と認可検証例外をeffect前のtyped receiptにする", () => {
    const invalidIntentExpiry = probe();
    invalidIntentExpiry.expiresAt = "not-a-date";
    const invalidAuthorizationExpiry = probe();
    invalidAuthorizationExpiry.authorization = {
      ...invalidAuthorizationExpiry.authorization,
      expiresAt: "not-a-date",
    };
    for (const [intent, executorContext, reason] of [
      [invalidIntentExpiry, context(), "invalid_intent_expiry"],
      [invalidAuthorizationExpiry, context(), "invalid_authorization_expiry"],
      [
        probe(),
        context({
          verifyAuthorization: () => {
            throw new Error("verifier unavailable");
          },
        }),
        "authorization_verification_failed",
      ],
    ] as const) {
      let calls = 0;
      const receipt = runProbe(
        intent,
        {
          execute: () => {
            calls += 1;
            return { exitCode: 0, timedOut: false };
          },
        },
        executorContext,
      );
      expect(receipt).toMatchObject({ status: "blocked", reason });
      expect(calls).toBe(0);
    }
  });

  it("scope拡大と署名改ざんをeffect前に拒否する", () => {
    const scope = probe();
    scope.params = { profile: "all" };
    const tampered = probe();
    tampered.authorization = {
      ...tampered.authorization,
      signature: "tampered",
    };
    for (const intent of [scope, tampered]) {
      let calls = 0;
      expect(
        runProbe(
          intent,
          {
            execute: () => {
              calls += 1;
              return { exitCode: 0, timedOut: false };
            },
          },
          context(),
        ).status,
      ).toBe("blocked");
      expect(calls).toBe(0);
    }
  });

  it("effect payload変異とdurable replay/conflictをeffect前に拒否する", () => {
    const original = probe();
    const mutated = [
      { ...original, command: "node" },
      { ...original, args: ["--help"] },
      { ...original, timeoutMs: 1 },
    ] satisfies ProbeIntent[];
    for (const intent of mutated) {
      let calls = 0;
      const receipt = runProbe(
        intent,
        {
          execute: () => {
            calls += 1;
            return { exitCode: 0, timedOut: false };
          },
        },
        context(),
      );
      expect(receipt).toMatchObject({
        status: "blocked",
        reason: "authorization_scope_mismatch",
      });
      expect(calls).toBe(0);
    }

    const idempotency = durableClaims();
    expect(
      runProbe(
        probe(),
        { execute: () => ({ exitCode: 0, timedOut: false }) },
        context({ idempotency }),
      ).status,
    ).toBe("accepted");
    expect(
      runProbe(
        probe(),
        { execute: () => ({ exitCode: 0, timedOut: false }) },
        context({ idempotency }),
      ),
    ).toMatchObject({ status: "blocked", reason: "duplicate_intent" });
    const conflict = probe();
    conflict.params = { profile: "other" };
    conflict.authorization = {
      ...conflict.authorization,
      paramsDigest: paramsDigest(conflict.params),
    };
    expect(
      runProbe(
        conflict,
        { execute: () => ({ exitCode: 0, timedOut: false }) },
        context({ idempotency }),
      ),
    ).toMatchObject({ status: "blocked", reason: "idempotency_conflict" });
  });

  it("U-SBOUND-010: exact CASかつdurableなwriteだけacceptedにする", () => {
    const intent: MaterializeIntent = {
      ...probe(),
      kind: "materialize",
      operationId: "write-1",
      idempotencyKey: "write-key",
      path: ".helix/evidence/result.json",
      beforeDigest: sha("0"),
      contentDigest: sha("1"),
    };
    intent.authorization = authorization(effectPayloadDigest(intent));
    const exact = {
      changedPath: intent.path,
      beforeDigest: intent.beforeDigest,
      afterDigest: intent.contentDigest,
      durable: true,
      partial: false,
    };
    expect(materializeLintArtifact(intent, { materialize: () => exact }, context()).status).toBe(
      "accepted",
    );
    for (const result of [
      { ...exact, partial: true },
      { ...exact, durable: false },
      { ...exact, beforeDigest: sha("f") },
    ])
      expect(materializeLintArtifact(intent, { materialize: () => result }, context()).status).toBe(
        "uncertain",
      );
  });

  it("port throwをacceptedにしない", () => {
    const intent: MaterializeIntent = {
      ...probe(),
      kind: "materialize",
      path: "result.json",
      beforeDigest: sha("0"),
      contentDigest: sha("1"),
    };
    intent.authorization = authorization(effectPayloadDigest(intent));
    expect(
      materializeLintArtifact(
        intent,
        {
          materialize: () => {
            throw new Error("partial");
          },
        },
        context(),
      ),
    ).toMatchObject({
      status: "uncertain",
      reason: "materialize_port_threw",
      durable: false,
    });
  });
});
