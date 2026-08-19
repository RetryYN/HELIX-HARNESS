import type { Sha256Digest } from "./digest";

export const EVENT_PROJECTION_CHECKPOINT_REPLAY_SCHEMA_VERSION =
  "helix-event-projection-checkpoint-replay.v1" as const;

export type OrchestrationEventType =
  | "requested"
  | "dispatched"
  | "leased"
  | "started"
  | "handover_requested"
  | "handover_completed"
  | "terminated"
  | "failed"
  | "reviewed"
  | "accepted";

export type EventFailureCode =
  | "EVENT_ENVELOPE_INVALID"
  | "EVENT_ENVELOPE_INCOMPLETE"
  | "EVENT_LOG_SNAPSHOT_INVALID"
  | "EVENT_DUPLICATE_DIGEST_MISMATCH"
  | "EVENT_FUTURE_TIMESTAMP"
  | "EVENT_CAUSATION_UNRESOLVED"
  | "EVENT_CORRELATION_MISMATCH"
  | "EVENT_CAUSAL_INVERSION"
  | "EVENT_TRANSITION_ILLEGAL"
  | "EVENT_TRANSITION_AFTER_SEAL"
  | "EVENT_PROJECTION_DRIFT"
  | "EVENT_ORPHAN_LANE"
  | "EVENT_CHECKPOINT_SCOPE_MISSING"
  | "EVENT_CHECKPOINT_BINDING_MISSING"
  | "EVENT_STALE_HEAD"
  | "EVENT_REPLAY_NOT_IDEMPOTENT"
  | "EVENT_RATE_LIMIT_INTERRUPTED"
  | "EVENT_RETRY_UNBOUNDED";

export interface OrchestrationEventEnvelopeV1 {
  readonly schema_version: "helix-orchestration-event.v1";
  readonly event_id: string;
  readonly event_type: OrchestrationEventType;
  readonly occurred_at: string;
  readonly plan_id: string;
  readonly parent_lane_id: string;
  readonly lane_id: string;
  readonly causation_id: string | null;
  readonly correlation_id: string;
  readonly head_sha: string;
  readonly payload_digest: Sha256Digest;
}

export interface AppendOnlyLogEntryV1 {
  readonly event_id: string;
  readonly event_type: OrchestrationEventType;
  readonly occurred_at: string;
  readonly causation_id: string | null;
  readonly correlation_id: string;
  readonly payload_digest: Sha256Digest;
}

export interface AppendOnlyLogSnapshotV1 {
  readonly schema_version: "helix-append-only-log.v1";
  readonly lane_id: string;
  readonly entries: readonly AppendOnlyLogEntryV1[];
  readonly sealed_event_ids: readonly string[];
}

export interface ProjectionSnapshotV1 {
  readonly schema_version: "helix-projection-snapshot.v1";
  readonly lane_id: string;
  readonly identity: {
    readonly plan_id: string;
    readonly parent_lane_id: string;
    readonly lane_id: string;
  };
  readonly state: {
    readonly lifecycle_state: OrchestrationEventType;
    readonly head_sha: string;
    readonly last_event_id: string;
  };
}

export interface CheckpointRecordV1 {
  readonly schema_version: "helix-checkpoint-record.v1";
  readonly head_sha: string;
  readonly parent_lane_id: string;
  readonly event_boundary: {
    readonly from_event_id: string;
    readonly to_event_id: string;
  };
  readonly projection_digest: Sha256Digest;
  readonly checkpoint_digest: Sha256Digest;
}

export interface CheckpointScopeV1 {
  readonly head_sha: string;
  readonly parent_lane_id: string;
  readonly lane_id: string;
  readonly from_event_id: string;
  readonly to_event_id: string;
}

export interface RecoveryBudgetV1 {
  readonly attempt: number;
  readonly max_attempts: number;
}

export type EnvelopeAdmissionResult =
  | { readonly ok: true; readonly envelope: OrchestrationEventEnvelopeV1 }
  | { readonly ok: false; readonly failure_code: EventFailureCode };

export type CausalOrderResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failure_code: EventFailureCode };

export type IdempotentIngestResult =
  | { readonly ok: true; readonly outcome: "appended" | "duplicate_absorbed" }
  | { readonly ok: false; readonly failure_code: EventFailureCode };

export type ProjectionDriftResult = CausalOrderResult;
export type CheckpointScopeResult =
  | { readonly ok: true; readonly eventIds: readonly string[] }
  | { readonly ok: false; readonly failure_code: EventFailureCode };
export type CheckpointReplayResult = CausalOrderResult;
export type RecoveryRouteResult =
  | { readonly ok: true; readonly route: "bounded_retry" | "recovery" }
  | { readonly ok: false; readonly failure_code: EventFailureCode };

const EVENT_TYPES = new Set<OrchestrationEventType>([
  "requested",
  "dispatched",
  "leased",
  "started",
  "handover_requested",
  "handover_completed",
  "terminated",
  "failed",
  "reviewed",
  "accepted",
]);

const ENVELOPE_KEYS = [
  "causation_id",
  "correlation_id",
  "event_id",
  "event_type",
  "head_sha",
  "lane_id",
  "parent_lane_id",
  "payload_digest",
  "plan_id",
  "schema_version",
  "occurred_at",
] as const;

const ENVELOPE_KEYS_WITHOUT_PAYLOAD = ENVELOPE_KEYS.filter((key) => key !== "payload_digest");

const SCOPE_KEYS = [
  "from_event_id",
  "head_sha",
  "lane_id",
  "parent_lane_id",
  "to_event_id",
] as const;

const RETRYABLE_FAILURES = new Set<EventFailureCode>([
  "EVENT_RATE_LIMIT_INTERRUPTED",
  "EVENT_STALE_HEAD",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return (
    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isHeadSha(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/u.test(value);
}

function isRfc3339(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function duplicateEventIds(entries: readonly AppendOnlyLogEntryV1[]): boolean {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.event_id)) return true;
    ids.add(entry.event_id);
  }
  return false;
}

function eventIndex(entries: readonly AppendOnlyLogEntryV1[], eventId: string): number {
  return entries.findIndex((entry) => entry.event_id === eventId);
}

function cloneEnvelope(value: OrchestrationEventEnvelopeV1): OrchestrationEventEnvelopeV1 {
  return { ...value };
}

export function admitEventEnvelope(input: unknown): EnvelopeAdmissionResult {
  if (!isRecord(input)) return { ok: false, failure_code: "EVENT_ENVELOPE_INVALID" };

  if (hasExactKeys(input, ENVELOPE_KEYS_WITHOUT_PAYLOAD)) {
    return { ok: false, failure_code: "EVENT_ENVELOPE_INCOMPLETE" };
  }
  if (!hasExactKeys(input, ENVELOPE_KEYS)) {
    return { ok: false, failure_code: "EVENT_ENVELOPE_INVALID" };
  }
  if (!isSha256Digest(input.payload_digest)) {
    return { ok: false, failure_code: "EVENT_ENVELOPE_INCOMPLETE" };
  }
  if (
    input.schema_version !== "helix-orchestration-event.v1" ||
    !isNonEmptyString(input.event_id) ||
    !EVENT_TYPES.has(input.event_type as OrchestrationEventType) ||
    !isRfc3339(input.occurred_at) ||
    !isNonEmptyString(input.plan_id) ||
    !isNonEmptyString(input.parent_lane_id) ||
    !isNonEmptyString(input.lane_id) ||
    !(input.causation_id === null || isNonEmptyString(input.causation_id)) ||
    !isNonEmptyString(input.correlation_id) ||
    !isHeadSha(input.head_sha)
  ) {
    return { ok: false, failure_code: "EVENT_ENVELOPE_INVALID" };
  }
  if (input.causation_id === null && input.event_type !== "requested") {
    return { ok: false, failure_code: "EVENT_CAUSATION_UNRESOLVED" };
  }
  return {
    ok: true,
    envelope: cloneEnvelope(input as unknown as OrchestrationEventEnvelopeV1),
  };
}

export function evaluateCausalOrder(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
  observedAt: string;
}): CausalOrderResult {
  if (Date.parse(input.envelope.occurred_at) > Date.parse(input.observedAt)) {
    return { ok: false, failure_code: "EVENT_FUTURE_TIMESTAMP" };
  }
  if (input.envelope.causation_id === null) return { ok: true };
  const cause = input.log.entries.find((entry) => entry.event_id === input.envelope.causation_id);
  if (!cause) return { ok: false, failure_code: "EVENT_CAUSATION_UNRESOLVED" };
  if (cause.correlation_id !== input.envelope.correlation_id) {
    return { ok: false, failure_code: "EVENT_CORRELATION_MISMATCH" };
  }
  if (Date.parse(cause.occurred_at) > Date.parse(input.envelope.occurred_at)) {
    return { ok: false, failure_code: "EVENT_CAUSAL_INVERSION" };
  }
  return { ok: true };
}

export function evaluateIdempotentIngest(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
}): IdempotentIngestResult {
  if (duplicateEventIds(input.log.entries)) {
    return { ok: false, failure_code: "EVENT_LOG_SNAPSHOT_INVALID" };
  }
  const existing = input.log.entries.find((entry) => entry.event_id === input.envelope.event_id);
  if (!existing) return { ok: true, outcome: "appended" };
  if (existing.payload_digest === input.envelope.payload_digest) {
    return { ok: true, outcome: "duplicate_absorbed" };
  }
  return { ok: false, failure_code: "EVENT_DUPLICATE_DIGEST_MISMATCH" };
}

const TRANSITIONS: ReadonlyMap<
  OrchestrationEventType,
  ReadonlySet<OrchestrationEventType>
> = new Map([
  ["requested", new Set(["dispatched"])],
  ["dispatched", new Set(["leased"])],
  ["leased", new Set(["started"])],
  ["started", new Set(["handover_requested", "terminated", "failed"])],
  ["handover_requested", new Set(["handover_completed"])],
  ["handover_completed", new Set(["handover_requested", "terminated", "failed"])],
  ["terminated", new Set(["reviewed"])],
  ["failed", new Set(["reviewed"])],
  ["reviewed", new Set(["accepted"])],
  ["accepted", new Set()],
]);

export function evaluateLifecycleTransition(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
}): CausalOrderResult {
  const correlationEntries = input.log.entries.filter(
    (entry) => entry.correlation_id === input.envelope.correlation_id,
  );
  const previous = correlationEntries.at(-1);
  if (!previous) {
    return input.envelope.event_type === "requested"
      ? { ok: true }
      : { ok: false, failure_code: "EVENT_TRANSITION_ILLEGAL" };
  }
  if (input.log.sealed_event_ids.includes(previous.event_id)) {
    return { ok: false, failure_code: "EVENT_TRANSITION_AFTER_SEAL" };
  }
  const nextStates = TRANSITIONS.get(previous.event_type);
  if (!nextStates?.has(input.envelope.event_type)) {
    return { ok: false, failure_code: "EVENT_TRANSITION_ILLEGAL" };
  }
  return { ok: true };
}

function internallyConsistent(snapshot: ProjectionSnapshotV1): boolean {
  return snapshot.lane_id === snapshot.identity.lane_id;
}

export function evaluateProjectionDrift(input: {
  rebuilt: ProjectionSnapshotV1;
  readBack: ProjectionSnapshotV1;
  knownLaneIds: readonly string[];
}): ProjectionDriftResult {
  if (!internallyConsistent(input.rebuilt) || !internallyConsistent(input.readBack)) {
    return { ok: false, failure_code: "EVENT_PROJECTION_DRIFT" };
  }
  const known = new Set(input.knownLaneIds);
  if (!known.has(input.rebuilt.lane_id) || !known.has(input.readBack.lane_id)) {
    return { ok: false, failure_code: "EVENT_ORPHAN_LANE" };
  }
  if (
    input.rebuilt.identity.plan_id !== input.readBack.identity.plan_id ||
    input.rebuilt.identity.parent_lane_id !== input.readBack.identity.parent_lane_id ||
    input.rebuilt.identity.lane_id !== input.readBack.identity.lane_id
  ) {
    return { ok: false, failure_code: "EVENT_PROJECTION_DRIFT" };
  }
  if (
    input.rebuilt.state.lifecycle_state !== input.readBack.state.lifecycle_state ||
    input.rebuilt.state.head_sha !== input.readBack.state.head_sha ||
    input.rebuilt.state.last_event_id !== input.readBack.state.last_event_id
  ) {
    return { ok: false, failure_code: "EVENT_PROJECTION_DRIFT" };
  }
  return { ok: true };
}

export function selectCheckpointScope(input: {
  scope: unknown;
  log: AppendOnlyLogSnapshotV1;
}): CheckpointScopeResult {
  if (duplicateEventIds(input.log.entries)) {
    return { ok: false, failure_code: "EVENT_LOG_SNAPSHOT_INVALID" };
  }
  if (!isRecord(input.scope) || !hasExactKeys(input.scope, SCOPE_KEYS)) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_SCOPE_MISSING" };
  }
  if (
    !isHeadSha(input.scope.head_sha) ||
    !isNonEmptyString(input.scope.parent_lane_id) ||
    !isNonEmptyString(input.scope.lane_id) ||
    !isNonEmptyString(input.scope.from_event_id) ||
    !isNonEmptyString(input.scope.to_event_id)
  ) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_SCOPE_MISSING" };
  }
  if (input.scope.lane_id !== input.log.lane_id) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_SCOPE_MISSING" };
  }
  const from = eventIndex(input.log.entries, input.scope.from_event_id);
  const to = eventIndex(input.log.entries, input.scope.to_event_id);
  if (from < 0 || to < 0 || to < from) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_SCOPE_MISSING" };
  }
  return {
    ok: true,
    eventIds: input.log.entries.slice(from, to + 1).map((entry) => entry.event_id),
  };
}

export function evaluateCheckpointReplay(input: {
  checkpoint: CheckpointRecordV1;
  scopedEventIds: readonly string[];
  replayProjectionDigest: string;
  replayCheckpointDigest: string;
  currentHeadSha: string;
}): CheckpointReplayResult {
  const checkpoint = input.checkpoint as unknown as Record<string, unknown>;
  const boundary = checkpoint.event_boundary;
  if (
    !isHeadSha(checkpoint.head_sha) ||
    !isNonEmptyString(checkpoint.parent_lane_id) ||
    !isRecord(boundary) ||
    !isNonEmptyString(boundary.from_event_id) ||
    !isNonEmptyString(boundary.to_event_id)
  ) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_BINDING_MISSING" };
  }
  if (checkpoint.head_sha !== input.currentHeadSha) {
    return { ok: false, failure_code: "EVENT_STALE_HEAD" };
  }
  if (
    input.scopedEventIds.length === 0 ||
    boundary.from_event_id !== input.scopedEventIds[0] ||
    boundary.to_event_id !== input.scopedEventIds.at(-1)
  ) {
    return { ok: false, failure_code: "EVENT_CHECKPOINT_SCOPE_MISSING" };
  }
  if (input.replayProjectionDigest !== checkpoint.projection_digest) {
    return { ok: false, failure_code: "EVENT_REPLAY_NOT_IDEMPOTENT" };
  }
  if (input.replayCheckpointDigest !== checkpoint.checkpoint_digest) {
    return { ok: false, failure_code: "EVENT_REPLAY_NOT_IDEMPOTENT" };
  }
  return { ok: true };
}

export function routeRecovery(input: {
  failureCode: EventFailureCode;
  budget: RecoveryBudgetV1;
}): RecoveryRouteResult {
  if (!Number.isInteger(input.budget.max_attempts) || input.budget.max_attempts <= 0) {
    return { ok: false, failure_code: "EVENT_RETRY_UNBOUNDED" };
  }
  if (!Number.isInteger(input.budget.attempt) || input.budget.attempt < 1) {
    return { ok: false, failure_code: "EVENT_RETRY_UNBOUNDED" };
  }
  if (input.budget.attempt > input.budget.max_attempts) {
    return { ok: true, route: "recovery" };
  }
  return {
    ok: true,
    route: RETRYABLE_FAILURES.has(input.failureCode) ? "bounded_retry" : "recovery",
  };
}
