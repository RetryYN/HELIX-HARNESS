import { createHash } from "node:crypto";

export type EffectDigest = `sha256:${string}`;
export type EffectStatus = "accepted" | "blocked" | "uncertain";

export interface EffectSnapshot {
  head: string;
  worktreeDigest: EffectDigest;
  inputsDigest: EffectDigest;
}

export interface EffectAuthorization {
  issuer: string;
  signature: string;
  capabilityId: string;
  actor: string;
  tool: string;
  target: string;
  paramsDigest: EffectDigest;
  effectPayloadDigest: EffectDigest;
  revocationEpoch: number;
  expiresAt: string;
}

interface EffectIntent {
  operationId: string;
  capabilityId: string;
  actor: string;
  tool: string;
  target: string;
  params: Readonly<Record<string, unknown>>;
  snapshot: EffectSnapshot;
  idempotencyKey: string;
  expiresAt: string;
  authorization: EffectAuthorization;
}

export interface ProbeIntent extends EffectIntent {
  kind: "probe";
  command: string;
  args: readonly string[];
  timeoutMs: number;
}

export interface MaterializeIntent extends EffectIntent {
  kind: "materialize";
  path: string;
  beforeDigest: EffectDigest;
  /** Signed payload; it is never copied into the receipt. */
  content: string;
  contentDigest: EffectDigest;
}

export interface ProbePort {
  execute(intent: ProbeIntent): {
    exitCode: number | null;
    timedOut: boolean;
    stdout?: string;
    stderr?: string;
    binaryVersion?: string;
  };
}

export interface WritePort {
  materialize(intent: MaterializeIntent): {
    changedPath: string;
    beforeDigest: EffectDigest;
    afterDigest: EffectDigest;
    durable: boolean;
    partial: boolean;
  };
}

export interface IdempotencyClaimPort {
  /** Durable, atomic claim. A key reused with another scope must return conflict. */
  claim(input: { key: string; scopeDigest: EffectDigest }): "claimed" | "duplicate" | "conflict";
}

export interface SnapshotProvider {
  /** Reads the current execution snapshot immediately before and after a dispatched effect. */
  observe(): EffectSnapshot;
}

export interface ExecutorContext {
  snapshotProvider: SnapshotProvider;
  trustedIssuers: ReadonlySet<string>;
  revocationEpoch: number;
  idempotency: IdempotencyClaimPort;
  verifyAuthorization(receipt: EffectAuthorization): boolean;
  now?: () => string;
}

interface ReceiptBase {
  operationId: string;
  status: EffectStatus;
  reason: string;
  actor: string;
  tool: string;
  target: string;
  paramsDigest: EffectDigest;
  snapshotDigest: EffectDigest;
  startedAt: string;
  completedAt: string;
  outputDigest: EffectDigest;
}

export interface ProbeReceipt extends ReceiptBase {
  kind: "probe";
  timedOut: boolean;
  exitCode: number | null;
  binary: string;
  binaryVersion: string;
}

export interface MaterializeReceipt extends ReceiptBase {
  kind: "materialize";
  changedPath: string;
  beforeDigest: EffectDigest;
  afterDigest: EffectDigest;
  durable: boolean;
}

const SHA256 = /^sha256:[0-9a-f]{64}$/;

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function digest(value: unknown): EffectDigest {
  return `sha256:${createHash("sha256").update(stable(value)).digest("hex")}`;
}

function safeDigest(value: unknown): EffectDigest {
  try {
    return digest(value);
  } catch {
    return digest("invalid_canonical_input");
  }
}

export function paramsDigest(params: Readonly<Record<string, unknown>>): EffectDigest {
  return digest(params);
}

export function contentDigest(content: string): EffectDigest {
  return digest(content);
}

export function effectPayloadDigest(intent: ProbeIntent | MaterializeIntent): EffectDigest {
  return intent.kind === "probe"
    ? digest({
        command: intent.command,
        args: intent.args,
        timeoutMs: intent.timeoutMs,
      })
    : digest({
        path: intent.path,
        beforeDigest: intent.beforeDigest,
        contentDigest: intent.contentDigest,
      });
}

function idempotencyScopeDigest(intent: ProbeIntent | MaterializeIntent): EffectDigest {
  return digest({
    capabilityId: intent.capabilityId,
    actor: intent.actor,
    tool: intent.tool,
    target: intent.target,
    paramsDigest: paramsDigest(intent.params),
    effectPayloadDigest: effectPayloadDigest(intent),
    snapshot: intent.snapshot,
  });
}

function preflight(
  intent: ProbeIntent | MaterializeIntent,
  context: ExecutorContext,
  at: string,
): string | null {
  try {
    if (!intent.operationId || !intent.capabilityId || !intent.idempotencyKey)
      return "invalid_intent";
    if (!SHA256.test(intent.snapshot.worktreeDigest) || !SHA256.test(intent.snapshot.inputsDigest))
      return "invalid_snapshot";
    const now = Date.parse(at);
    const intentExpiry = Date.parse(intent.expiresAt);
    if (!Number.isFinite(now) || !Number.isFinite(intentExpiry)) return "invalid_intent_expiry";
    if (intentExpiry <= now) return "intent_expired";
    if (stable(intent.snapshot) !== stable(context.snapshotProvider.observe()))
      return "snapshot_drift_preflight";
    const authorization = intent.authorization;
    if (!context.trustedIssuers.has(authorization.issuer)) return "untrusted_issuer";
    let verified: boolean;
    try {
      verified = context.verifyAuthorization(authorization);
    } catch {
      return "authorization_verification_failed";
    }
    if (!verified) return "authorization_tampered";
    if (authorization.revocationEpoch !== context.revocationEpoch) return "authorization_revoked";
    const authorizationExpiry = Date.parse(authorization.expiresAt);
    if (!Number.isFinite(authorizationExpiry)) return "invalid_authorization_expiry";
    if (authorizationExpiry <= now) return "authorization_expired";
    if (
      authorization.capabilityId !== intent.capabilityId ||
      authorization.actor !== intent.actor ||
      authorization.tool !== intent.tool ||
      authorization.target !== intent.target ||
      authorization.paramsDigest !== paramsDigest(intent.params) ||
      authorization.effectPayloadDigest !== effectPayloadDigest(intent)
    )
      return "authorization_scope_mismatch";
    return null;
  } catch {
    return "invalid_canonical_input";
  }
}

function dispatchSnapshotRejection(
  intent: ProbeIntent | MaterializeIntent,
  context: ExecutorContext,
): "snapshot_drift_pre_dispatch" | "snapshot_observation_failed" | null {
  try {
    return stable(intent.snapshot) === stable(context.snapshotProvider.observe())
      ? null
      : "snapshot_drift_pre_dispatch";
  } catch {
    return "snapshot_observation_failed";
  }
}

function snapshotChangedAfterDispatch(
  intent: ProbeIntent | MaterializeIntent,
  context: ExecutorContext,
): boolean {
  try {
    return stable(intent.snapshot) !== stable(context.snapshotProvider.observe());
  } catch {
    return true;
  }
}

function claimIdempotency(
  intent: ProbeIntent | MaterializeIntent,
  context: ExecutorContext,
): "duplicate_intent" | "idempotency_conflict" | "idempotency_claim_failed" | null {
  try {
    const result = context.idempotency.claim({
      key: intent.idempotencyKey,
      scopeDigest: idempotencyScopeDigest(intent),
    });
    if (result === "duplicate") return "duplicate_intent";
    if (result === "conflict") return "idempotency_conflict";
    return null;
  } catch {
    return "idempotency_claim_failed";
  }
}

function receiptBase(
  intent: EffectIntent,
  startedAt: string,
  completedAt: string,
  status: EffectStatus,
  reason: string,
  output: unknown,
): ReceiptBase {
  return {
    operationId: intent.operationId,
    status,
    reason,
    actor: intent.actor,
    tool: intent.tool,
    target: intent.target,
    paramsDigest: safeDigest(intent.params),
    snapshotDigest: safeDigest(intent.snapshot),
    startedAt,
    completedAt,
    outputDigest: safeDigest(output),
  };
}

export function runProbe(
  intent: ProbeIntent,
  port: ProbePort,
  context: ExecutorContext,
): ProbeReceipt {
  const now = context.now ?? (() => new Date().toISOString());
  const startedAt = now();
  const rejection = preflight(intent, context, startedAt);
  if (rejection)
    return {
      ...receiptBase(intent, startedAt, startedAt, "blocked", rejection, rejection),
      kind: "probe",
      timedOut: false,
      exitCode: null,
      binary: intent.command,
      binaryVersion: "",
    };
  const claimRejection = claimIdempotency(intent, context);
  if (claimRejection)
    return {
      ...receiptBase(intent, startedAt, startedAt, "blocked", claimRejection, claimRejection),
      kind: "probe",
      timedOut: false,
      exitCode: null,
      binary: intent.command,
      binaryVersion: "",
    };
  const dispatchRejection = dispatchSnapshotRejection(intent, context);
  if (dispatchRejection)
    return {
      ...receiptBase(intent, startedAt, startedAt, "blocked", dispatchRejection, dispatchRejection),
      kind: "probe",
      timedOut: false,
      exitCode: null,
      binary: intent.command,
      binaryVersion: "",
    };
  try {
    const result = port.execute(intent);
    if (snapshotChangedAfterDispatch(intent, context))
      return {
        ...receiptBase(
          intent,
          startedAt,
          now(),
          "uncertain",
          "snapshot_drift_after_dispatch",
          "snapshot_drift_after_dispatch",
        ),
        kind: "probe",
        timedOut: false,
        exitCode: null,
        binary: intent.command,
        binaryVersion: "",
      };
    const reason = result.timedOut
      ? "probe_timeout"
      : result.exitCode === 0
        ? "probe_succeeded"
        : "probe_nonzero";
    const status = result.timedOut || result.exitCode !== 0 ? "blocked" : "accepted";
    return {
      ...receiptBase(intent, startedAt, now(), status, reason, {
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        stdoutDigest: digest(result.stdout ?? ""),
        stderrDigest: digest(result.stderr ?? ""),
      }),
      kind: "probe",
      timedOut: result.timedOut,
      exitCode: result.exitCode,
      binary: intent.command,
      binaryVersion: result.binaryVersion ?? "",
    };
  } catch (error) {
    return {
      ...receiptBase(intent, startedAt, now(), "uncertain", "probe_port_threw", {
        error: error instanceof Error ? error.name : "unknown",
      }),
      kind: "probe",
      timedOut: false,
      exitCode: null,
      binary: intent.command,
      binaryVersion: "",
    };
  }
}

export function materializeLintArtifact(
  intent: MaterializeIntent,
  port: WritePort,
  context: ExecutorContext,
): MaterializeReceipt {
  const now = context.now ?? (() => new Date().toISOString());
  const startedAt = now();
  const rejection = preflight(intent, context, startedAt);
  const rejected = (reason: string): MaterializeReceipt => ({
    ...receiptBase(intent, startedAt, startedAt, "blocked", reason, reason),
    kind: "materialize",
    changedPath: "",
    beforeDigest: intent.beforeDigest,
    afterDigest: intent.beforeDigest,
    durable: false,
  });
  if (rejection) return rejected(rejection);
  if (!SHA256.test(intent.beforeDigest) || !SHA256.test(intent.contentDigest))
    return rejected("invalid_materialize_digest");
  if (contentDigest(intent.content) !== intent.contentDigest)
    return rejected("content_digest_mismatch");
  const claimRejection = claimIdempotency(intent, context);
  if (claimRejection) return rejected(claimRejection);
  const dispatchRejection = dispatchSnapshotRejection(intent, context);
  if (dispatchRejection) return rejected(dispatchRejection);
  try {
    const result = port.materialize(intent);
    if (snapshotChangedAfterDispatch(intent, context))
      return {
        ...receiptBase(
          intent,
          startedAt,
          now(),
          "uncertain",
          "snapshot_drift_after_dispatch",
          "snapshot_drift_after_dispatch",
        ),
        kind: "materialize",
        changedPath: "",
        beforeDigest: intent.beforeDigest,
        afterDigest: intent.beforeDigest,
        durable: false,
      };
    const accepted =
      !result.partial &&
      result.durable &&
      result.changedPath === intent.path &&
      result.beforeDigest === intent.beforeDigest &&
      result.afterDigest === intent.contentDigest;
    return {
      ...receiptBase(
        intent,
        startedAt,
        now(),
        accepted ? "accepted" : "uncertain",
        accepted ? "materialize_succeeded" : "materialize_postcondition_failed",
        result,
      ),
      kind: "materialize",
      changedPath: result.changedPath,
      beforeDigest: result.beforeDigest,
      afterDigest: result.afterDigest,
      durable: result.durable,
    };
  } catch (error) {
    return {
      ...receiptBase(intent, startedAt, now(), "uncertain", "materialize_port_threw", {
        error: error instanceof Error ? error.name : "unknown",
      }),
      kind: "materialize",
      changedPath: "",
      beforeDigest: intent.beforeDigest,
      afterDigest: intent.beforeDigest,
      durable: false,
    };
  }
}
