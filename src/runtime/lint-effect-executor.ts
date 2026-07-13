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

export interface ExecutorContext {
  currentSnapshot: EffectSnapshot;
  trustedIssuers: ReadonlySet<string>;
  revocationEpoch: number;
  consumedIdempotencyKeys: Set<string>;
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

export function paramsDigest(params: Readonly<Record<string, unknown>>): EffectDigest {
  return digest(params);
}

function preflight(intent: EffectIntent, context: ExecutorContext, at: string): string | null {
  if (!intent.operationId || !intent.capabilityId || !intent.idempotencyKey)
    return "invalid_intent";
  if (!SHA256.test(intent.snapshot.worktreeDigest) || !SHA256.test(intent.snapshot.inputsDigest))
    return "invalid_snapshot";
  if (Date.parse(intent.expiresAt) <= Date.parse(at)) return "intent_expired";
  if (context.consumedIdempotencyKeys.has(intent.idempotencyKey)) return "duplicate_intent";
  if (stable(intent.snapshot) !== stable(context.currentSnapshot)) return "snapshot_drift";
  const authorization = intent.authorization;
  if (!context.trustedIssuers.has(authorization.issuer)) return "untrusted_issuer";
  if (!context.verifyAuthorization(authorization)) return "authorization_tampered";
  if (authorization.revocationEpoch !== context.revocationEpoch) return "authorization_revoked";
  if (Date.parse(authorization.expiresAt) <= Date.parse(at)) return "authorization_expired";
  if (
    authorization.capabilityId !== intent.capabilityId ||
    authorization.actor !== intent.actor ||
    authorization.tool !== intent.tool ||
    authorization.target !== intent.target ||
    authorization.paramsDigest !== paramsDigest(intent.params)
  )
    return "authorization_scope_mismatch";
  return null;
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
    paramsDigest: paramsDigest(intent.params),
    snapshotDigest: digest(intent.snapshot),
    startedAt,
    completedAt,
    outputDigest: digest(output),
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
  context.consumedIdempotencyKeys.add(intent.idempotencyKey);
  try {
    const result = port.execute(intent);
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
  context.consumedIdempotencyKeys.add(intent.idempotencyKey);
  try {
    const result = port.materialize(intent);
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
