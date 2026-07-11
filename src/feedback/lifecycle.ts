import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeSync,
} from "node:fs";
import { join } from "node:path";
import { type HarnessDb, isSecretLike, openHarnessDb } from "../state-db";

export const FEEDBACK_LIFECYCLE_SCHEMA_VERSION = 1 as const;
export const FEEDBACK_LIFECYCLE_POLICY_VERSION = "feedback-lifecycle.v1";

export type FeedbackSourceTable = "findings" | "quality_signals" | "feedback_events";
export type FeedbackLifecycleState = "open" | "ack" | "closed" | "superseded";
export type FeedbackLifecycleAction =
  | "observed"
  | "refresh"
  | "ack"
  | "close"
  | "supersede"
  | "surface";
export type FeedbackSourceBucket = "gate" | "actionable" | "telemetry";

export interface FeedbackLifecycleEventV1 {
  schemaVersion: typeof FEEDBACK_LIFECYCLE_SCHEMA_VERSION;
  eventId: string;
  operationId: string;
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  activityEpoch: number;
  policyEpoch: number;
  sourceGeneration: string;
  sourcePayloadDigest: string;
  sourceBucket: FeedbackSourceBucket;
  action: FeedbackLifecycleAction;
  fromState: FeedbackLifecycleState | null;
  toState: FeedbackLifecycleState;
  actor: string;
  reason: string;
  policyVersion: string;
  sessionId: string | null;
  occurredAt: string;
}

export interface FeedbackSourceLike {
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  status: string;
  severity?: string;
  kind?: string;
  metric?: string;
  value?: unknown;
  threshold?: unknown;
  subject?: string;
  bucket?: FeedbackSourceBucket;
  source_table?: FeedbackSourceTable;
  source_id?: string;
}

export interface FeedbackSourceIdentity {
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  key: string;
  bucket: FeedbackSourceBucket;
  payloadDigest: string;
  diagnostic?: "feedback_origin_missing";
}

export interface FeedbackLifecycleProjection {
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  sourceGeneration: string;
  activityEpoch: number;
  policyEpoch: number;
  state: FeedbackLifecycleState;
  bucket: FeedbackSourceBucket;
  payloadDigest: string;
  policyVersion: string;
  firstObservedAt: string;
  lastTransitionAt: string;
  lastEventId: string;
  inactiveObserved: boolean;
  surfacedSessions: string[];
}

export interface ResolveFeedbackLifecycleResult {
  projections: FeedbackLifecycleProjection[];
  active: Map<string, FeedbackLifecycleProjection>;
  operationIntents: Map<string, string>;
  damaged: Array<{ index: number; reason: string; sourceKey?: string }>;
}

export interface FeedbackLifecycleDeps {
  now(): string;
  readEvents(): unknown[];
  withLock<T>(owner: string, fn: (fence: number) => T): T;
  appendEvent(event: FeedbackLifecycleEventV1, fence: number): void;
}

export interface ReconcileFeedbackLifecycleInput {
  sources: FeedbackSourceLike[];
  mode: "partial" | "full";
  completeTables?: FeedbackSourceTable[];
  operationId: string;
  actor?: string;
  policyVersion?: string;
}

export interface ReconcileFeedbackLifecycleResult {
  ok: boolean;
  appended: FeedbackLifecycleEventV1[];
  diagnostics: string[];
  recovered: boolean;
  reason?: string;
}

export interface AckFeedbackInput {
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  sourceGeneration: string;
  operationId: string;
  actor: "human";
  reason: string;
}

export interface SurfaceFeedbackInput {
  sourceTable: FeedbackSourceTable;
  sourceId: string;
  sourceGeneration: string;
  operationId: string;
  sessionId: string;
}

type DecodeResult =
  | { ok: true; event: FeedbackLifecycleEventV1 }
  | { ok: false; reason: string; sourceKey?: string };

const TABLES: readonly FeedbackSourceTable[] = ["findings", "quality_signals", "feedback_events"];
const STATES: readonly FeedbackLifecycleState[] = ["open", "ack", "closed", "superseded"];
const ACTIONS: readonly FeedbackLifecycleAction[] = [
  "observed",
  "refresh",
  "ack",
  "close",
  "supersede",
  "surface",
];
const BUCKETS: readonly FeedbackSourceBucket[] = ["gate", "actionable", "telemetry"];

export function feedbackSourceIdentity(source: FeedbackSourceLike): FeedbackSourceIdentity {
  let sourceTable = source.sourceTable;
  let sourceId = source.sourceId;
  let diagnostic: FeedbackSourceIdentity["diagnostic"];
  if (
    source.sourceTable === "feedback_events" &&
    TABLES.includes(source.source_table as FeedbackSourceTable) &&
    source.source_table !== "feedback_events" &&
    typeof source.source_id === "string" &&
    source.source_id.trim() !== ""
  ) {
    sourceTable = source.source_table as FeedbackSourceTable;
    sourceId = source.source_id;
  } else if (source.sourceTable === "feedback_events") {
    diagnostic = "feedback_origin_missing";
  }
  if (!TABLES.includes(sourceTable) || sourceId.trim() === "") {
    throw new Error("invalid_source_identity");
  }
  const bucket = source.bucket ?? classifyBucket(source);
  const payload = {
    severity: source.severity ?? null,
    status: source.status,
    kind: source.kind ?? null,
    metric: source.metric ?? null,
    value: source.value ?? null,
    threshold: source.threshold ?? null,
    subject: source.subject ?? null,
  };
  return {
    sourceTable,
    sourceId,
    key: `${sourceTable}:${sourceId}`,
    bucket,
    payloadDigest: digest(payload),
    ...(diagnostic ? { diagnostic } : {}),
  };
}

export function decodeFeedbackLifecycleEvent(raw: unknown): DecodeResult {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return { ok: false, reason: "parse_error" };
    }
  }
  if (!isRecord(value)) return { ok: false, reason: "schema_invalid" };
  const sourceKey =
    typeof value.sourceTable === "string" && typeof value.sourceId === "string"
      ? `${value.sourceTable}:${value.sourceId}`
      : undefined;
  if (value.schemaVersion !== FEEDBACK_LIFECYCLE_SCHEMA_VERSION) {
    return { ok: false, reason: "schema_version", sourceKey };
  }
  if (
    !nonEmpty(value.eventId) ||
    !nonEmpty(value.operationId) ||
    !TABLES.includes(value.sourceTable as FeedbackSourceTable) ||
    !validLimited(value.sourceId, 256) ||
    !positiveInt(value.activityEpoch) ||
    !positiveInt(value.policyEpoch) ||
    value.sourceGeneration !== `${value.activityEpoch}.${value.policyEpoch}` ||
    typeof value.sourcePayloadDigest !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.sourcePayloadDigest) ||
    !BUCKETS.includes(value.sourceBucket as FeedbackSourceBucket) ||
    !ACTIONS.includes(value.action as FeedbackLifecycleAction) ||
    !(value.fromState === null || STATES.includes(value.fromState as FeedbackLifecycleState)) ||
    !STATES.includes(value.toState as FeedbackLifecycleState) ||
    !validLimited(value.actor, 64) ||
    !validLimited(value.reason, 512) ||
    !nonEmpty(value.policyVersion) ||
    !(value.sessionId === null || validLimited(value.sessionId, 256)) ||
    !isIsoUtc(value.occurredAt) ||
    isSecretLike(JSON.stringify(value))
  ) {
    return { ok: false, reason: "schema_invalid", sourceKey };
  }
  if (!validTransition(value as unknown as FeedbackLifecycleEventV1)) {
    return { ok: false, reason: "transition_invalid", sourceKey };
  }
  return { ok: true, event: value as unknown as FeedbackLifecycleEventV1 };
}

export function resolveFeedbackLifecycle(
  raws: readonly unknown[],
  _now: string,
): ResolveFeedbackLifecycleResult {
  const byGeneration = new Map<string, FeedbackLifecycleProjection>();
  const active = new Map<string, FeedbackLifecycleProjection>();
  const operationIntents = new Map<string, string>();
  const operationEvents = new Map<string, FeedbackLifecycleEventV1[]>();
  const damaged: ResolveFeedbackLifecycleResult["damaged"] = [];
  raws.forEach((raw, index) => {
    const decoded = decodeFeedbackLifecycleEvent(raw);
    if (!decoded.ok) {
      damaged.push({
        index,
        reason: decoded.reason,
        ...(decoded.sourceKey ? { sourceKey: decoded.sourceKey } : {}),
      });
      return;
    }
    const event = decoded.event;
    operationEvents.set(event.operationId, [
      ...(operationEvents.get(event.operationId) ?? []),
      event,
    ]);
    const generationKey = `${sourceKey(event)}@${event.sourceGeneration}`;
    const previous = byGeneration.get(generationKey);
    if ((previous?.state ?? null) !== event.fromState) {
      damaged.push({ index, reason: "state_chain_mismatch", sourceKey: sourceKey(event) });
      return;
    }
    const surfaced = new Set(previous?.surfacedSessions ?? []);
    if (event.action === "surface" && event.sessionId) surfaced.add(event.sessionId);
    const projection: FeedbackLifecycleProjection = {
      sourceTable: event.sourceTable,
      sourceId: event.sourceId,
      sourceGeneration: event.sourceGeneration,
      activityEpoch: event.activityEpoch,
      policyEpoch: event.policyEpoch,
      state: event.toState,
      bucket: event.sourceBucket,
      payloadDigest: event.sourcePayloadDigest,
      policyVersion: event.policyVersion,
      firstObservedAt: previous?.firstObservedAt ?? event.occurredAt,
      lastTransitionAt: event.occurredAt,
      lastEventId: event.eventId,
      inactiveObserved: event.action === "close" || previous?.inactiveObserved === true,
      surfacedSessions: [...surfaced].sort(),
    };
    byGeneration.set(generationKey, projection);
    const key = sourceKey(event);
    const current = active.get(key);
    if (!current || compareGeneration(current, projection) <= 0) active.set(key, projection);
  });
  for (const [operationId, events] of operationEvents) {
    operationIntents.set(operationId, operationIntent(events));
  }
  return {
    projections: [...byGeneration.values()].sort(compareProjection),
    active,
    operationIntents,
    damaged,
  };
}

export function reconcileFeedbackLifecycle(
  input: ReconcileFeedbackLifecycleInput,
  deps: FeedbackLifecycleDeps,
): ReconcileFeedbackLifecycleResult {
  if (!validOperationId(input.operationId)) {
    return {
      ok: false,
      appended: [],
      diagnostics: [],
      recovered: false,
      reason: "invalid_operation_id",
    };
  }
  const policyVersion = input.policyVersion ?? FEEDBACK_LIFECYCLE_POLICY_VERSION;
  const actor = input.actor ?? "system";
  let planned: FeedbackLifecycleEventV1[] = [];
  const diagnostics: string[] = [];
  try {
    return deps.withLock(`reconcile:${input.operationId}`, (fence) => {
      const beforeRaw = deps.readEvents();
      const before = resolveFeedbackLifecycle(beforeRaw, deps.now());
      if (before.damaged.length > 0) {
        return {
          ok: false,
          appended: [],
          diagnostics: before.damaged.map((row) => `damaged:${row.reason}`),
          recovered: false,
          reason: "damaged_lifecycle",
        };
      }
      const priorIntent = before.operationIntents.get(input.operationId);
      if (priorIntent) {
        const operationEvents = validEvents(beforeRaw).filter(
          (event) => event.operationId === input.operationId,
        );
        const expected = expectedOperationEvents({
          allRaw: beforeRaw,
          input,
          actor,
          policyVersion,
          now: operationEvents[0]?.occurredAt ?? deps.now(),
        });
        if (isSemanticPrefix(operationEvents, expected)) {
          const missing = expected.slice(operationEvents.length);
          for (const event of missing) deps.appendEvent(event, fence);
          return {
            ok: true,
            appended: missing,
            diagnostics: [missing.length > 0 ? "partial_operation_recovered" : "idempotent_replay"],
            recovered: missing.length > 0,
          };
        }
        return {
          ok: false,
          appended: [],
          diagnostics: [],
          recovered: false,
          reason: "operation_intent_conflict",
        };
      }
      planned = planReconcileEvents({
        input,
        before,
        occurredAt: deps.now(),
        actor,
        policyVersion,
        diagnostics,
      });
      for (const event of planned) deps.appendEvent(event, fence);
      return { ok: true, appended: planned, diagnostics, recovered: false };
    });
  } catch (error) {
    const reread = validEvents(deps.readEvents()).filter(
      (event) => event.operationId === input.operationId,
    );
    if (
      reread.length > 0 &&
      (planned.length === 0 ||
        digest(reread.map((event) => event.eventId).sort()) ===
          digest(planned.map((event) => event.eventId).sort()))
    ) {
      return {
        ok: true,
        appended: reread,
        diagnostics: [...diagnostics, "coordination_commit_unknown_recovered"],
        recovered: true,
      };
    }
    return {
      ok: false,
      appended: [],
      diagnostics,
      recovered: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function ackFeedback(
  input: AckFeedbackInput,
  deps: FeedbackLifecycleDeps,
): ReconcileFeedbackLifecycleResult {
  if (
    !validOperationId(input.operationId) ||
    !validLimited(input.sourceId, 256) ||
    !validLimited(input.reason, 512) ||
    isSecretLike(JSON.stringify(input))
  ) {
    return { ok: false, appended: [], diagnostics: [], recovered: false, reason: "invalid_input" };
  }
  let planned: FeedbackLifecycleEventV1 | undefined;
  try {
    return deps.withLock(`ack:${input.operationId}`, (fence) => {
      const raw = deps.readEvents();
      const view = resolveFeedbackLifecycle(raw, deps.now());
      const prior = validEvents(raw).filter((event) => event.operationId === input.operationId);
      if (prior.length > 0) {
        const event = prior[0];
        const matches =
          prior.length === 1 &&
          event.action === "ack" &&
          event.sourceTable === input.sourceTable &&
          event.sourceId === input.sourceId &&
          event.sourceGeneration === input.sourceGeneration &&
          event.actor === input.actor &&
          event.reason === input.reason;
        return matches
          ? { ok: true, appended: [], diagnostics: ["idempotent_replay"], recovered: false }
          : {
              ok: false,
              appended: [],
              diagnostics: [],
              recovered: false,
              reason: "operation_intent_conflict",
            };
      }
      const current = view.active.get(`${input.sourceTable}:${input.sourceId}`);
      if (!current || current.sourceGeneration !== input.sourceGeneration) {
        return {
          ok: false,
          appended: [],
          diagnostics: [],
          recovered: false,
          reason: "stale_or_unknown_generation",
        };
      }
      if (current.state === "ack") {
        return { ok: true, appended: [], diagnostics: ["already_acknowledged"], recovered: false };
      }
      if (current.state !== "open") {
        return {
          ok: false,
          appended: [],
          diagnostics: [],
          recovered: false,
          reason: "terminal_generation",
        };
      }
      const identity = projectionIdentity(current);
      planned = makeEvent({
        identity,
        activityEpoch: current.activityEpoch,
        policyEpoch: current.policyEpoch,
        action: "ack",
        fromState: "open",
        toState: "ack",
        input: { sources: [], mode: "partial", operationId: input.operationId },
        occurredAt: deps.now(),
        actor: input.actor,
        policyVersion: current.policyVersion,
        ordinal: 0,
      });
      planned.reason = input.reason;
      deps.appendEvent(planned, fence);
      return { ok: true, appended: [planned], diagnostics: [], recovered: false };
    });
  } catch (error) {
    const recovered = validEvents(deps.readEvents()).find(
      (event) => event.operationId === input.operationId && event.eventId === planned?.eventId,
    );
    return recovered
      ? {
          ok: true,
          appended: [recovered],
          diagnostics: ["coordination_commit_unknown_recovered"],
          recovered: true,
        }
      : {
          ok: false,
          appended: [],
          diagnostics: [],
          recovered: false,
          reason: error instanceof Error ? error.message : String(error),
        };
  }
}

export function recordFeedbackSurface(
  input: SurfaceFeedbackInput,
  deps: FeedbackLifecycleDeps,
): ReconcileFeedbackLifecycleResult {
  if (
    !validOperationId(input.operationId) ||
    !validLimited(input.sourceId, 256) ||
    !validLimited(input.sessionId, 256) ||
    isSecretLike(JSON.stringify(input))
  ) {
    return { ok: false, appended: [], diagnostics: [], recovered: false, reason: "invalid_input" };
  }
  try {
    return deps.withLock(`surface:${input.operationId}`, (fence) => {
      const raw = deps.readEvents();
      const existing = validEvents(raw).find((event) => event.operationId === input.operationId);
      if (existing) {
        return existing.action === "surface" &&
          existing.sourceTable === input.sourceTable &&
          existing.sourceId === input.sourceId &&
          existing.sourceGeneration === input.sourceGeneration &&
          existing.sessionId === input.sessionId
          ? { ok: true, appended: [], diagnostics: ["idempotent_replay"], recovered: false }
          : {
              ok: false,
              appended: [],
              diagnostics: [],
              recovered: false,
              reason: "operation_intent_conflict",
            };
      }
      const current = resolveFeedbackLifecycle(raw, deps.now()).active.get(
        `${input.sourceTable}:${input.sourceId}`,
      );
      if (
        !current ||
        current.sourceGeneration !== input.sourceGeneration ||
        (current.state !== "open" && current.state !== "ack")
      ) {
        return {
          ok: false,
          appended: [],
          diagnostics: [],
          recovered: false,
          reason: "stale_or_unknown_generation",
        };
      }
      if (current.surfacedSessions.includes(input.sessionId)) {
        return { ok: true, appended: [], diagnostics: ["already_surfaced"], recovered: false };
      }
      const event = makeEvent({
        identity: projectionIdentity(current),
        activityEpoch: current.activityEpoch,
        policyEpoch: current.policyEpoch,
        action: "surface",
        fromState: current.state,
        toState: current.state,
        input: { sources: [], mode: "partial", operationId: input.operationId },
        occurredAt: deps.now(),
        actor: "system",
        policyVersion: current.policyVersion,
        ordinal: 0,
      });
      event.sessionId = input.sessionId;
      event.reason = "session_surface";
      deps.appendEvent(event, fence);
      return { ok: true, appended: [event], diagnostics: [], recovered: false };
    });
  } catch (error) {
    return {
      ok: false,
      appended: [],
      diagnostics: [],
      recovered: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

interface PlanReconcileEventsInput {
  input: ReconcileFeedbackLifecycleInput;
  before: ResolveFeedbackLifecycleResult;
  occurredAt: string;
  actor: string;
  policyVersion: string;
  diagnostics: string[];
}

function planReconcileEvents(params: PlanReconcileEventsInput): FeedbackLifecycleEventV1[] {
  const { input, before, occurredAt, actor, policyVersion, diagnostics } = params;
  if (!isIsoUtc(occurredAt)) throw new Error("invalid_occurred_at");
  const result: FeedbackLifecycleEventV1[] = [];
  const activeSourceKeys = new Set<string>();
  const canonicalSources = new Map<
    string,
    { source: FeedbackSourceLike; identity: FeedbackSourceIdentity }
  >();
  for (const source of input.sources) {
    const identity = feedbackSourceIdentity(source);
    const existing = canonicalSources.get(identity.key);
    if (!existing || bucketRank(identity.bucket) < bucketRank(existing.identity.bucket)) {
      canonicalSources.set(identity.key, { source, identity });
    } else if (existing.identity.payloadDigest !== identity.payloadDigest) {
      diagnostics.push(`alias_payload_drift:${identity.key}`);
    }
  }
  const identities = [...canonicalSources.values()];
  for (const { source, identity } of identities.sort((a, b) =>
    a.identity.key.localeCompare(b.identity.key),
  )) {
    if (identity.diagnostic) diagnostics.push(`${identity.diagnostic}:${identity.key}`);
    if (!isActive(source)) continue;
    activeSourceKeys.add(identity.key);
    const current = before.active.get(identity.key);
    if (!current) {
      result.push(
        makeEvent({
          identity,
          activityEpoch: 1,
          policyEpoch: 1,
          action: "observed",
          fromState: null,
          toState: "open",
          input,
          occurredAt,
          actor,
          policyVersion,
          ordinal: result.length,
        }),
      );
      continue;
    }
    if (
      current.policyVersion !== policyVersion ||
      (current.bucket !== identity.bucket &&
        bucketRank(identity.bucket) < bucketRank(current.bucket))
    ) {
      if (current.state !== "closed" && current.state !== "superseded") {
        result.push(
          makeEvent({
            identity: projectionIdentity(current),
            activityEpoch: current.activityEpoch,
            policyEpoch: current.policyEpoch,
            action: "supersede",
            fromState: current.state,
            toState: "superseded",
            input,
            occurredAt,
            actor,
            policyVersion,
            ordinal: result.length,
          }),
        );
      }
      result.push(
        makeEvent({
          identity,
          activityEpoch: current.activityEpoch,
          policyEpoch: current.policyEpoch + 1,
          action: "observed",
          fromState: null,
          toState: "open",
          input,
          occurredAt,
          actor,
          policyVersion,
          ordinal: result.length,
        }),
      );
      continue;
    }
    if (current.inactiveObserved || current.state === "closed") {
      result.push(
        makeEvent({
          identity,
          activityEpoch: current.activityEpoch + 1,
          policyEpoch: current.policyEpoch,
          action: "observed",
          fromState: null,
          toState: "open",
          input,
          occurredAt,
          actor,
          policyVersion,
          ordinal: result.length,
        }),
      );
    } else if (current.payloadDigest !== identity.payloadDigest) {
      result.push(
        makeEvent({
          identity,
          activityEpoch: current.activityEpoch,
          policyEpoch: current.policyEpoch,
          action: "refresh",
          fromState: current.state,
          toState: current.state,
          input,
          occurredAt,
          actor,
          policyVersion,
          ordinal: result.length,
        }),
      );
      diagnostics.push(`payload_digest_refreshed:${identity.key}`);
    }
  }
  if (input.mode === "full") {
    const complete = new Set(input.completeTables ?? []);
    for (const [key, current] of [...before.active.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      if (!complete.has(current.sourceTable) || activeSourceKeys.has(key)) continue;
      if (current.state === "open" || current.state === "ack") {
        result.push(
          makeEvent({
            identity: projectionIdentity(current),
            activityEpoch: current.activityEpoch,
            policyEpoch: current.policyEpoch,
            action: "close",
            fromState: current.state,
            toState: "closed",
            input,
            occurredAt,
            actor,
            policyVersion,
            ordinal: result.length,
          }),
        );
      }
    }
  }
  return result;
}

function makeEvent(args: {
  identity: FeedbackSourceIdentity;
  activityEpoch: number;
  policyEpoch: number;
  action: FeedbackLifecycleAction;
  fromState: FeedbackLifecycleState | null;
  toState: FeedbackLifecycleState;
  input: ReconcileFeedbackLifecycleInput;
  occurredAt: string;
  actor: string;
  policyVersion: string;
  ordinal: number;
}): FeedbackLifecycleEventV1 {
  const generation = `${args.activityEpoch}.${args.policyEpoch}`;
  const eventId = `flife:${digest({ operationId: args.input.operationId, key: args.identity.key, generation, action: args.action, ordinal: args.ordinal })}`;
  return {
    schemaVersion: FEEDBACK_LIFECYCLE_SCHEMA_VERSION,
    eventId,
    operationId: args.input.operationId,
    sourceTable: args.identity.sourceTable,
    sourceId: args.identity.sourceId,
    activityEpoch: args.activityEpoch,
    policyEpoch: args.policyEpoch,
    sourceGeneration: generation,
    sourcePayloadDigest: args.identity.payloadDigest,
    sourceBucket: args.identity.bucket,
    action: args.action,
    fromState: args.fromState,
    toState: args.toState,
    actor: args.actor,
    reason:
      args.action === "observed"
        ? "source_active"
        : args.action === "refresh"
          ? "source_payload_refreshed"
          : args.action === "close"
            ? "authoritative_source_inactive"
            : "source_policy_changed",
    policyVersion: args.policyVersion,
    sessionId: null,
    occurredAt: args.occurredAt,
  };
}

export function nodeFeedbackLifecycleDeps(
  root: string,
  now = () => new Date().toISOString(),
): FeedbackLifecycleDeps {
  const logDir = join(root, ".helix", "logs");
  const journalPath = join(logDir, "feedback-lifecycle.jsonl");
  const coordinationPath = join(logDir, "feedback-lifecycle.coordination.sqlite");
  let active: { db: HarnessDb; fence: number } | undefined;
  return {
    now,
    readEvents: () => readJsonLines(journalPath),
    withLock: (owner, fn) => {
      mkdirSync(logDir, { recursive: true });
      for (let attempt = 0; ; attempt += 1) {
        let db: HarnessDb | undefined;
        try {
          db = openHarnessDb(coordinationPath, { repoRoot: root });
          db.exec(
            "CREATE TABLE IF NOT EXISTS feedback_lifecycle_fence (singleton INTEGER PRIMARY KEY CHECK(singleton = 1), fence_token INTEGER NOT NULL, owner TEXT NOT NULL, acquired_at TEXT NOT NULL)",
          );
          db.exec("BEGIN IMMEDIATE");
          db.prepare(
            "INSERT INTO feedback_lifecycle_fence(singleton, fence_token, owner, acquired_at) VALUES (1, 1, ?, ?) ON CONFLICT(singleton) DO UPDATE SET fence_token = fence_token + 1, owner = excluded.owner, acquired_at = excluded.acquired_at",
          ).run(owner, now());
          const row = db
            .prepare("SELECT fence_token FROM feedback_lifecycle_fence WHERE singleton = 1")
            .get();
          const fence = Number(row?.fence_token);
          active = { db, fence };
          const result = fn(fence);
          db.exec("COMMIT");
          return result;
        } catch (error) {
          try {
            db?.exec("ROLLBACK");
          } catch {
            /* transaction may not have started */
          }
          if (attempt >= 100 || !isSqliteBusy(error)) throw error;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
        } finally {
          active = undefined;
          db?.close();
        }
      }
    },
    appendEvent: (event, fence) => {
      if (!active || active.fence !== fence) throw new Error("stale_fencing_token");
      const stored = active.db
        .prepare("SELECT fence_token FROM feedback_lifecycle_fence WHERE singleton = 1")
        .get();
      if (Number(stored?.fence_token) !== fence) throw new Error("stale_fencing_token");
      mkdirSync(logDir, { recursive: true });
      const fd = openSync(journalPath, "a");
      try {
        writeAllBytes(fd, Buffer.from(`${JSON.stringify(event)}\n`, "utf8"));
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    },
  };
}

function validTransition(event: FeedbackLifecycleEventV1): boolean {
  if (event.action === "observed") return event.fromState === null && event.toState === "open";
  if (event.action === "refresh") {
    return (
      event.fromState === event.toState && (event.toState === "open" || event.toState === "ack")
    );
  }
  if (event.action === "surface")
    return (
      event.fromState === event.toState &&
      (event.toState === "open" || event.toState === "ack") &&
      event.sessionId !== null
    );
  if (event.action === "ack")
    return event.toState === "ack" && (event.fromState === "open" || event.fromState === "ack");
  if (event.action === "close")
    return event.toState === "closed" && (event.fromState === "open" || event.fromState === "ack");
  return (
    event.action === "supersede" &&
    event.toState === "superseded" &&
    (event.fromState === "open" || event.fromState === "ack")
  );
}

function classifyBucket(source: FeedbackSourceLike): FeedbackSourceBucket {
  const severity = (source.severity ?? "warn").toLowerCase();
  if (severity === "error" || severity === "fail") return "gate";
  if (severity === "info") return "telemetry";
  return "actionable";
}

function isActive(source: FeedbackSourceLike): boolean {
  if (source.sourceTable === "findings") return source.status === "open";
  if (source.sourceTable === "quality_signals")
    return source.status === "warn" || source.status === "fail";
  return source.status === "open";
}

function projectionIdentity(value: FeedbackLifecycleProjection): FeedbackSourceIdentity {
  return {
    sourceTable: value.sourceTable,
    sourceId: value.sourceId,
    key: `${value.sourceTable}:${value.sourceId}`,
    bucket: value.bucket,
    payloadDigest: value.payloadDigest,
  };
}

function isSqliteBusy(error: unknown): boolean {
  return (
    error instanceof Error &&
    (String((error as Error & { code?: unknown }).code).includes("SQLITE_BUSY") ||
      /database is locked|SQLITE_BUSY/i.test(error.message))
  );
}

function operationIntent(events: FeedbackLifecycleEventV1[]): string {
  return digest(
    events
      .map((event) => ({
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
        generation: event.sourceGeneration,
        digest: event.sourcePayloadDigest,
        bucket: event.sourceBucket,
        action: event.action,
        from: event.fromState,
        to: event.toState,
      }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  );
}

function validEvents(raws: readonly unknown[]): FeedbackLifecycleEventV1[] {
  return raws.flatMap((raw) => {
    const decoded = decodeFeedbackLifecycleEvent(raw);
    return decoded.ok ? [decoded.event] : [];
  });
}

interface ExpectedOperationEventsInput {
  allRaw: readonly unknown[];
  input: ReconcileFeedbackLifecycleInput;
  actor: string;
  policyVersion: string;
  now: string;
}

function expectedOperationEvents(params: ExpectedOperationEventsInput): FeedbackLifecycleEventV1[] {
  const { allRaw, input, actor, policyVersion, now } = params;
  const priorRaw = allRaw.filter((raw) => {
    const decoded = decodeFeedbackLifecycleEvent(raw);
    return !decoded.ok || decoded.event.operationId !== input.operationId;
  });
  return planReconcileEvents({
    input,
    before: resolveFeedbackLifecycle(priorRaw, now),
    occurredAt: now,
    actor,
    policyVersion,
    diagnostics: [],
  });
}

function isSemanticPrefix(
  existing: FeedbackLifecycleEventV1[],
  expected: FeedbackLifecycleEventV1[],
): boolean {
  if (existing.length === 0 || existing.length > expected.length) return false;
  return existing.every(
    (event, index) =>
      JSON.stringify(semanticEvent(event)) === JSON.stringify(semanticEvent(expected[index])),
  );
}

function semanticEvent(event: FeedbackLifecycleEventV1): object {
  return {
    sourceTable: event.sourceTable,
    sourceId: event.sourceId,
    activityEpoch: event.activityEpoch,
    policyEpoch: event.policyEpoch,
    sourcePayloadDigest: event.sourcePayloadDigest,
    sourceBucket: event.sourceBucket,
    action: event.action,
    fromState: event.fromState,
    toState: event.toState,
    actor: event.actor,
    policyVersion: event.policyVersion,
  };
}

function sourceKey(event: Pick<FeedbackLifecycleEventV1, "sourceTable" | "sourceId">): string {
  return `${event.sourceTable}:${event.sourceId}`;
}

function compareGeneration(a: FeedbackLifecycleProjection, b: FeedbackLifecycleProjection): number {
  return a.activityEpoch - b.activityEpoch || a.policyEpoch - b.policyEpoch;
}

function compareProjection(a: FeedbackLifecycleProjection, b: FeedbackLifecycleProjection): number {
  return (
    `${a.sourceTable}:${a.sourceId}`.localeCompare(`${b.sourceTable}:${b.sourceId}`) ||
    compareGeneration(a, b)
  );
}

function bucketRank(bucket: FeedbackSourceBucket): number {
  return bucket === "gate" ? 0 : bucket === "actionable" ? 1 : 2;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readJsonLines(path: string): unknown[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
}

function writeAllBytes(fd: number, bytes: Uint8Array): void {
  let offset = 0;
  while (offset < bytes.length) {
    const written = writeSync(fd, bytes, offset, bytes.length - offset);
    if (written <= 0) throw new Error("feedback_lifecycle_short_write");
    offset += written;
  }
}

function validOperationId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function validLimited(value: unknown, max: number): value is string {
  return nonEmpty(value) && [...value].length <= max;
}

function positiveInt(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1;
}

function isIsoUtc(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  )
    return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace(".000Z", "Z");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
