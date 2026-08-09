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

/**
 * L5 §5: `EVENT_RECOVERY_REQUIRED` は `EventFailureCode` union に含めない。
 * bounded retry の枯渇と retry 不能な失敗は `routeRecovery` の `route: "recovery"` として
 * 表現し、呼び出し側が完了へ進めないことを型で保証する。
 */
export type RecoveryRoute = "bounded_retry" | "recovery";

export type EventType =
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

export type LifecycleState = EventType;

export interface OrchestrationEventEnvelopeV1 {
  readonly schema_version: string;
  readonly event_id: string;
  readonly event_type: EventType;
  readonly occurred_at: string;
  readonly plan_id: string;
  readonly parent_lane_id: string;
  readonly lane_id: string;
  readonly causation_id: string | null;
  readonly correlation_id: string;
  readonly head_sha: string;
  readonly payload_digest: string;
}

export interface AppendOnlyLogEntryV1 {
  readonly event_id: string;
  readonly event_type: EventType;
  readonly occurred_at: string;
  readonly causation_id: string | null;
  readonly correlation_id: string;
  readonly payload_digest: string;
}

export interface AppendOnlyLogSnapshotV1 {
  readonly lane_id: string;
  readonly entries: readonly AppendOnlyLogEntryV1[];
  readonly sealed_event_ids: readonly string[];
}

export interface ProjectionIdentityV1 {
  readonly plan_id: string;
  readonly parent_lane_id: string;
  readonly lane_id: string;
}

export interface ProjectionStateV1 {
  readonly lifecycle_state: LifecycleState;
  readonly head_sha: string;
  readonly last_event_id: string;
}

export interface ProjectionSnapshotV1 {
  readonly lane_id: string;
  readonly identity: ProjectionIdentityV1;
  readonly state: ProjectionStateV1;
}

export interface EventBoundaryV1 {
  readonly from_event_id: string;
  readonly to_event_id: string;
}

export interface CheckpointRecordV1 {
  readonly head_sha: string;
  readonly parent_lane_id: string;
  readonly event_boundary: EventBoundaryV1;
  readonly projection_digest: string;
  readonly checkpoint_digest: string;
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

export type EventFailure = { readonly ok: false; readonly failure_code: EventFailureCode };

export type EnvelopeAdmissionResult =
  | { readonly ok: true; readonly envelope: OrchestrationEventEnvelopeV1 }
  | EventFailure;

export type JudgementResult = { readonly ok: true } | EventFailure;

export type IngestOutcome = "appended" | "duplicate_absorbed";

export type IdempotentIngestResult =
  | { readonly ok: true; readonly outcome: IngestOutcome }
  | EventFailure;

export type CheckpointScopeResult =
  | { readonly ok: true; readonly eventIds: readonly string[] }
  | EventFailure;

export type RecoveryRouteResult =
  | { readonly ok: true; readonly route: RecoveryRoute }
  | EventFailure;

export interface CausalOrderRequest {
  readonly envelope: OrchestrationEventEnvelopeV1;
  readonly log: AppendOnlyLogSnapshotV1;
  readonly observedAt: string;
}

export interface IdempotentIngestRequest {
  readonly envelope: OrchestrationEventEnvelopeV1;
  readonly log: AppendOnlyLogSnapshotV1;
}

export interface LifecycleTransitionRequest {
  readonly envelope: OrchestrationEventEnvelopeV1;
  readonly log: AppendOnlyLogSnapshotV1;
}

export interface ProjectionDriftRequest {
  readonly rebuilt: ProjectionSnapshotV1;
  readonly readBack: ProjectionSnapshotV1;
}

export interface CheckpointScopeRequest {
  readonly scope: unknown;
  readonly log: AppendOnlyLogSnapshotV1;
}

export interface CheckpointReplayRequest {
  readonly checkpoint: CheckpointRecordV1;
  readonly scopedEventIds: readonly string[];
  readonly replayProjectionDigest: string;
  readonly replayCheckpointDigest: string;
  readonly currentHeadSha: string;
}

export interface RecoveryRouteRequest {
  readonly failureCode: EventFailureCode;
  readonly budget: RecoveryBudgetV1;
}

const ENVELOPE_KEYS = [
  "causation_id",
  "correlation_id",
  "event_id",
  "event_type",
  "head_sha",
  "lane_id",
  "occurred_at",
  "parent_lane_id",
  "payload_digest",
  "plan_id",
  "schema_version",
] as const;

const SCOPE_KEYS = [
  "from_event_id",
  "head_sha",
  "lane_id",
  "parent_lane_id",
  "to_event_id",
] as const;

const EVENT_TYPES: readonly EventType[] = [
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
];

/**
 * L5 §2.4 の state machine。key から value への遷移だけを許す。
 * `requested` は起点であり、遷移先を持たない event（`accepted`）が終端となる。
 */
const ALLOWED_TRANSITIONS: Readonly<Record<EventType, readonly EventType[]>> = {
  requested: ["dispatched"],
  dispatched: ["leased"],
  leased: ["started"],
  started: ["handover_requested", "terminated", "failed"],
  handover_requested: ["handover_completed"],
  handover_completed: ["handover_requested", "terminated", "failed"],
  terminated: ["reviewed"],
  failed: ["reviewed"],
  reviewed: ["accepted"],
  accepted: [],
};

/** L5 §2.8: bounded retry へ回してよい失敗だけを列挙する。他は全て Recovery。 */
const RETRYABLE_CODES: readonly EventFailureCode[] = [
  "EVENT_RATE_LIMIT_INTERRUPTED",
  "EVENT_STALE_HEAD",
];

/**
 * admit 結果を不変にする。複製せずに凍結すると呼び出し側が保持する入力オブジェクトまで
 * 凍結してしまう（pure judgement の前提を破る副作用）ため、必ず複製してから凍結する。
 *
 * 再帰凍結は行わない。本 module が返す値は envelope（全 field が scalar の平坦な object）と
 * `eventIds`（string の配列）だけであり、ネストした object を返す経路が存在しないため、
 * 再帰は到達不能な分岐になる（mutation で生存して判明したので削除した）。
 */
function frozenClone<T>(value: T): T {
  return Object.freeze(structuredClone(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return (
    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])
  );
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u.test(value);
}

function validSha(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/u.test(value);
}

function validDigest(value: unknown): value is string {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function failure(code: EventFailureCode): EventFailure {
  return { ok: false, failure_code: code };
}

function duplicateEventIds(log: AppendOnlyLogSnapshotV1): boolean {
  const ids = log.entries.map((entry) => entry.event_id);
  return new Set(ids).size !== ids.length;
}

function findEntry(
  log: AppendOnlyLogSnapshotV1,
  eventId: string,
): AppendOnlyLogEntryV1 | undefined {
  return log.entries.find((entry) => entry.event_id === eventId);
}

/**
 * L5 §2.1: envelope の exact set 11 field と形式・enum・起点規則を判定する。
 * exact set 検査を形式検査より先に置く。逆順にすると unknown field を持つ入力が
 * 形式検査を通過した時点で「形式は正しい」と読める code を返し、欠落相殺の拒否という
 * 本来の失敗理由が観測できなくなる。
 */
export function admitEventEnvelope(input: unknown): EnvelopeAdmissionResult {
  if (!isRecord(input) || !exactKeys(input, ENVELOPE_KEYS)) {
    return failure("EVENT_ENVELOPE_INVALID");
  }
  if (!validDigest(input.payload_digest)) {
    return failure("EVENT_ENVELOPE_INCOMPLETE");
  }
  if (!validSha(input.head_sha)) return failure("EVENT_ENVELOPE_INVALID");
  if (typeof input.schema_version !== "string" || input.schema_version.length === 0) {
    return failure("EVENT_ENVELOPE_INVALID");
  }
  if (!validIdentifier(input.event_id)) return failure("EVENT_ENVELOPE_INVALID");
  if (!validIdentifier(input.plan_id)) return failure("EVENT_ENVELOPE_INVALID");
  if (!validIdentifier(input.parent_lane_id)) return failure("EVENT_ENVELOPE_INVALID");
  if (!validIdentifier(input.lane_id)) return failure("EVENT_ENVELOPE_INVALID");
  if (!validIdentifier(input.correlation_id)) return failure("EVENT_ENVELOPE_INVALID");
  if (!validTimestamp(input.occurred_at)) return failure("EVENT_ENVELOPE_INVALID");
  if (!EVENT_TYPES.includes(input.event_type as EventType)) {
    return failure("EVENT_ENVELOPE_INVALID");
  }
  if (input.causation_id !== null && !validIdentifier(input.causation_id)) {
    return failure("EVENT_ENVELOPE_INVALID");
  }
  if (input.causation_id === null && input.event_type !== "requested") {
    return failure("EVENT_CAUSATION_UNRESOLVED");
  }
  return { ok: true, envelope: frozenClone(input as unknown as OrchestrationEventEnvelopeV1) };
}

/**
 * L5 §2.2: 未来先書き → 未解決 causation → correlation 一致 → 時刻順序 の順で判定する。
 * 未来先書きを最初に置くのは、未来 event を原因解決の前に無条件で拒否するため。
 * correlation 検査を causal inversion より前に置くのは、別 correlation の event を原因として
 * 時刻比較しても比較自体が無意味だから。
 */
export function evaluateCausalOrder(request: CausalOrderRequest): JudgementResult {
  const { envelope, log, observedAt } = request;
  if (Date.parse(envelope.occurred_at) > Date.parse(observedAt)) {
    return failure("EVENT_FUTURE_TIMESTAMP");
  }
  if (envelope.causation_id === null) return { ok: true };
  const cause = findEntry(log, envelope.causation_id);
  if (!cause) return failure("EVENT_CAUSATION_UNRESOLVED");
  if (cause.correlation_id !== envelope.correlation_id) {
    return failure("EVENT_CORRELATION_MISMATCH");
  }
  if (Date.parse(cause.occurred_at) > Date.parse(envelope.occurred_at)) {
    return failure("EVENT_CAUSAL_INVERSION");
  }
  return { ok: true };
}

/**
 * L5 §2.3: 同一 event_id の再投入を副作用なしで吸収する。
 * append-only 違反を別 code にしない理由は L5 §2.3 のとおり。`log.entries` は append 済み
 * event の exact list であり、digest 不一致で到達する入力は常に同時に「append 済み event の
 * 書き換え要求」でもある。入力が `{ envelope, log }` だけでは「訂正の再送」と「明示的な
 * 上書き要求」を区別できないため、分けると一方が到達不能になる。
 */
export function evaluateIdempotentIngest(
  request: IdempotentIngestRequest,
): IdempotentIngestResult {
  const { envelope, log } = request;
  if (duplicateEventIds(log)) return failure("EVENT_LOG_SNAPSHOT_INVALID");
  const existing = findEntry(log, envelope.event_id);
  if (!existing) return { ok: true, outcome: "appended" };
  if (existing.payload_digest === envelope.payload_digest) {
    return { ok: true, outcome: "duplicate_absorbed" };
  }
  return failure("EVENT_DUPLICATE_DIGEST_MISMATCH");
}

/** L5 §2.4: 同一 correlation の直前 event から本 event への遷移が state machine に存在するか。 */
export function evaluateLifecycleTransition(
  request: LifecycleTransitionRequest,
): JudgementResult {
  const { envelope, log } = request;
  const sameCorrelation = log.entries.filter(
    (entry) => entry.correlation_id === envelope.correlation_id,
  );
  if (sameCorrelation.length === 0) {
    return envelope.event_type === "requested"
      ? { ok: true }
      : failure("EVENT_TRANSITION_ILLEGAL");
  }
  const sealed = sameCorrelation.some((entry) => log.sealed_event_ids.includes(entry.event_id));
  if (sealed) return failure("EVENT_TRANSITION_AFTER_SEAL");
  const previous = sameCorrelation[sameCorrelation.length - 1];
  if (!previous) return failure("EVENT_TRANSITION_ILLEGAL");
  const allowed = ALLOWED_TRANSITIONS[previous.event_type];
  if (!allowed.includes(envelope.event_type)) return failure("EVENT_TRANSITION_ILLEGAL");
  return { ok: true };
}

/**
 * L5 §2.5: identity と state を別段で比較する。片方一致を成功へ読み替えない。
 * lane 不一致は drift ではなく orphan lane として区別する。
 */
export function evaluateProjectionDrift(request: ProjectionDriftRequest): JudgementResult {
  const { rebuilt, readBack } = request;
  if (readBack.lane_id !== rebuilt.lane_id) return failure("EVENT_ORPHAN_LANE");
  if (
    rebuilt.identity.plan_id !== readBack.identity.plan_id ||
    rebuilt.identity.parent_lane_id !== readBack.identity.parent_lane_id ||
    rebuilt.identity.lane_id !== readBack.identity.lane_id
  ) {
    return failure("EVENT_PROJECTION_DRIFT");
  }
  if (
    rebuilt.state.lifecycle_state !== readBack.state.lifecycle_state ||
    rebuilt.state.head_sha !== readBack.state.head_sha ||
    rebuilt.state.last_event_id !== readBack.state.last_event_id
  ) {
    return failure("EVENT_PROJECTION_DRIFT");
  }
  return { ok: true };
}

/**
 * L5 §2.6: scope が選ぶ event 集合を返す。scope 未指定時に全体スコープへ暗黙
 * フォールバックする経路を持たない。既存資産 `createL3G3LogicalDbReceipt` は
 * `checkpoint_tables` に対するリポジトリ全体スコープしか持たず、それを lane checkpoint へ
 * 流用すると無関係 lane の追記で恒常的に drift を誤検出するため fail-close する。
 */
export function selectCheckpointScope(request: CheckpointScopeRequest): CheckpointScopeResult {
  const { scope, log } = request;
  if (duplicateEventIds(log)) return failure("EVENT_LOG_SNAPSHOT_INVALID");
  if (!isRecord(scope) || !exactKeys(scope, SCOPE_KEYS)) {
    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  }
  if (
    !validSha(scope.head_sha) ||
    !validIdentifier(scope.parent_lane_id) ||
    !validIdentifier(scope.lane_id) ||
    !validIdentifier(scope.from_event_id) ||
    !validIdentifier(scope.to_event_id)
  ) {
    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  }
  const fromIndex = log.entries.findIndex((entry) => entry.event_id === scope.from_event_id);
  const toIndex = log.entries.findIndex((entry) => entry.event_id === scope.to_event_id);
  if (fromIndex < 0 || toIndex < 0) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  if (toIndex < fromIndex) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  if (log.lane_id !== scope.lane_id) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  const eventIds = log.entries
    .slice(fromIndex, toIndex + 1)
    .map((entry) => entry.event_id);
  return { ok: true, eventIds: frozenClone(eventIds) };
}

/**
 * L5 §2.7: 束縛検査 → stale HEAD → 区間端点 → digest 照合 の順で判定する。
 * 束縛検査を stale HEAD より先に置くのは、束縛が欠けた checkpoint に対して HEAD 比較を
 * 先に行うと比較対象が存在しないまま stale と誤診断されうるため。
 */
export function evaluateCheckpointReplay(request: CheckpointReplayRequest): JudgementResult {
  const { checkpoint, scopedEventIds, replayProjectionDigest, replayCheckpointDigest } = request;
  if (!isRecord(checkpoint)) return failure("EVENT_CHECKPOINT_BINDING_MISSING");
  if (!validSha(checkpoint.head_sha)) return failure("EVENT_CHECKPOINT_BINDING_MISSING");
  if (!validIdentifier(checkpoint.parent_lane_id)) {
    return failure("EVENT_CHECKPOINT_BINDING_MISSING");
  }
  const boundary: unknown = checkpoint.event_boundary;
  if (
    !isRecord(boundary) ||
    !validIdentifier(boundary.from_event_id) ||
    !validIdentifier(boundary.to_event_id)
  ) {
    return failure("EVENT_CHECKPOINT_BINDING_MISSING");
  }
  if (checkpoint.head_sha !== request.currentHeadSha) return failure("EVENT_STALE_HEAD");
  const first = scopedEventIds[0];
  const last = scopedEventIds[scopedEventIds.length - 1];
  if (boundary.from_event_id !== first || boundary.to_event_id !== last) {
    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");
  }
  if (checkpoint.projection_digest !== replayProjectionDigest) {
    return failure("EVENT_REPLAY_NOT_IDEMPOTENT");
  }
  if (checkpoint.checkpoint_digest !== replayCheckpointDigest) {
    return failure("EVENT_REPLAY_NOT_IDEMPOTENT");
  }
  return { ok: true };
}

/**
 * L5 §2.8: 返り値は `bounded_retry` / `recovery` の 2 値のみで、完了継続を表す値を持たない。
 * これにより呼び出し側が「retry も recovery も不要」と読み替えて完了へ進めない。
 */
export function routeRecovery(request: RecoveryRouteRequest): RecoveryRouteResult {
  const { failureCode, budget } = request;
  // `Number.isInteger` は非数値に対しても false を返すため、`typeof !== "number"` を
  // 併記すると到達不能な二重判定になる（mutation で生存して判明）。整数性と正値性だけを検査する。
  if (
    !isRecord(budget) ||
    !Number.isInteger(budget.max_attempts) ||
    Number(budget.max_attempts) <= 0 ||
    !Number.isInteger(budget.attempt) ||
    Number(budget.attempt) <= 0
  ) {
    return failure("EVENT_RETRY_UNBOUNDED");
  }
  if (budget.attempt > budget.max_attempts) return { ok: true, route: "recovery" };
  if (RETRYABLE_CODES.includes(failureCode)) return { ok: true, route: "bounded_retry" };
  return { ok: true, route: "recovery" };
}
