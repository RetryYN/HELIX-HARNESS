import {
  acquireWorkGraphLease,
  type WorkGraphFailureCode,
  type WorkGraphLeaseV1,
} from "./work-graph-receipt-acceptance";

export type SchedulerFailureCode =
  | "SCHEDULER_INPUT_INVALID"
  | "SCHEDULER_SLOT_ACCOUNTING_INVALID"
  | "SCHEDULER_CAPACITY_EXCEEDED"
  | "SCHEDULER_DEPENDENCY_NOT_READY"
  | "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION"
  | "SCHEDULER_QUEUE_UNBOUNDED"
  | "SCHEDULER_QUEUE_BACKPRESSURE"
  | "SCHEDULER_LEASE_DOUBLE_OWNERSHIP"
  | "SCHEDULER_QUOTA_EXHAUSTED"
  | "SCHEDULER_HANDOVER_PACKET_MISSING"
  | "SCHEDULER_HANDOVER_TARGET_MISMATCH"
  | "SCHEDULER_HANDOVER_ACK_REPLAY"
  | "SCHEDULER_FAILURE_ISOLATION_BREACH"
  | "SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED"
  | "SCHEDULER_TIME_ORDER_INVALID"
  | "SCHEDULER_MERGE_AUTHORITY_VIOLATION";

/** capacity の上限。8-lane fixture だけが製品合格の capacity evidence となる（L4 §1）。 */
export const MAX_SCHEDULER_CAPACITY = 8;

export type SlotState =
  | "queued"
  | "dispatched"
  | "leased"
  | "running"
  | "handover_pending"
  | "handover_completed"
  | "terminal"
  | "failed"
  | "backpressured";

export interface QuotaSnapshotV1 {
  readonly consumed: number;
  readonly limit: number;
  readonly threshold: number;
}

export interface SlotAccountingRowV1 {
  readonly slot_id: string;
  readonly parent_id: string;
  readonly task_id: string;
  readonly dependency_ids: readonly string[];
  readonly slot_state: SlotState;
  readonly quota_snapshot: QuotaSnapshotV1;
  readonly writer_lease: WorkGraphLeaseV1;
  readonly started_at: string | null;
  readonly terminated_at: string | null;
}

export interface BoundedQueueSnapshotV1 {
  readonly capacity: number;
  readonly queue_limit: number;
  readonly entries: readonly string[];
  readonly running: readonly string[];
}

export interface ConflictScopeV1 {
  readonly task_id: string;
  readonly issue_id: string;
  readonly behavior_contract_id: string;
  readonly responsibility_owner: string;
  readonly allowed_paths: readonly string[];
  readonly shared_authority_ids: readonly string[];
}

export interface RemainingScopeV1 {
  readonly allowed_paths: readonly string[];
  readonly forbidden_paths: readonly string[];
}

export interface QuotaHandoverPacketV1 {
  readonly lane_id: string;
  readonly task_id: string;
  readonly candidate_head: string;
  readonly writer_lease: WorkGraphLeaseV1;
  readonly remaining_scope: RemainingScopeV1;
  readonly target_runtime: string;
  readonly target_reviewer: string;
  readonly issued_at: string;
}

export interface CapacityEvidenceV1 {
  readonly lane_count: number;
  readonly claimed_capacity: number;
  readonly fixture_path: string;
}

export interface DispatchAdmissionRequest {
  readonly queue: BoundedQueueSnapshotV1;
  readonly candidate: SlotAccountingRowV1;
  readonly candidateScope: ConflictScopeV1;
  readonly running: readonly SlotAccountingRowV1[];
  readonly runningScopes: Readonly<Record<string, ConflictScopeV1>>;
  readonly readyDependencyIds: readonly string[];
}

export interface QueueEntryRequest {
  readonly queue: BoundedQueueSnapshotV1;
  readonly taskId: string;
}

export interface QuotaHandoverRequest {
  readonly current: SlotAccountingRowV1;
  readonly packet: QuotaHandoverPacketV1;
  readonly successorOwner: string;
  /** 旧 owner の lease が releaseWorkGraphLease で解放済みか。 */
  readonly predecessorReleased: boolean;
  /** 当該 packet が既に ack 済みか（ack 後の再配送検知）。 */
  readonly alreadyAcked: boolean;
  readonly expected: {
    readonly lane_id: string;
    readonly target_reviewer: string;
    readonly candidate_head: string;
  };
}

export interface SlotFailureIsolationRequest {
  readonly failed: SlotAccountingRowV1;
  readonly failedLeaseReleased: boolean;
  readonly peers: readonly SlotAccountingRowV1[];
  readonly after: readonly SlotAccountingRowV1[];
  readonly queueBefore: readonly string[];
  readonly queueAfter: readonly string[];
}

export interface FrontierRecalculationRequest {
  readonly mergedLaneId: string;
  readonly mergedHead: string;
  readonly candidate: SlotAccountingRowV1;
  readonly candidateScope: ConflictScopeV1;
  readonly revalidated: {
    readonly base_head: string;
    readonly ci_passed: boolean;
    readonly review_approved: boolean;
    readonly db_receipt_digest: string | null;
  };
  readonly requestsMergeOrderDecision: boolean;
}

/**
 * L5 §4: lease CAS の失敗は #213 の `WORK_GRAPH_*` をそのまま透過させ、scheduler 側で
 * 再判定・再命名しない。したがって failure code は両体系の union になる。
 */
export type SchedulerFailure = {
  readonly ok: false;
  readonly failure_code: SchedulerFailureCode | WorkGraphFailureCode;
};

export type SlotAccountingResult =
  | { readonly ok: true; readonly row: SlotAccountingRowV1 }
  | SchedulerFailure;

export type DispatchAdmissionResult =
  | { readonly ok: true; readonly admitted: SlotAccountingRowV1 }
  | SchedulerFailure;

export type QueueEntryResult =
  | { readonly ok: true; readonly queue: BoundedQueueSnapshotV1 }
  | SchedulerFailure;

export type QuotaHandoverResult =
  | { readonly ok: true; readonly packet: QuotaHandoverPacketV1 }
  | SchedulerFailure;

export type SlotFailureIsolationResult = { readonly ok: true } | SchedulerFailure;

export type FrontierRecalculationResult =
  | { readonly ok: true; readonly candidate: SlotAccountingRowV1 }
  | SchedulerFailure;

export type CapacityEvidenceResult =
  | { readonly ok: true; readonly evidence: CapacityEvidenceV1 }
  | SchedulerFailure;

const SLOT_ROW_KEYS = [
  "dependency_ids",
  "parent_id",
  "quota_snapshot",
  "slot_id",
  "slot_state",
  "started_at",
  "task_id",
  "terminated_at",
  "writer_lease",
] as const;
const QUOTA_SNAPSHOT_KEYS = ["consumed", "limit", "threshold"] as const;
const LEASE_KEYS = ["acquired_at", "fence_token", "owner"] as const;
const SLOT_STATES: readonly SlotState[] = [
  "queued",
  "dispatched",
  "leased",
  "running",
  "handover_pending",
  "handover_completed",
  "terminal",
  "failed",
  "backpressured",
];

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return Object.freeze(value);
  }
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) deepFreeze(item);
    return Object.freeze(value);
  }
  return value;
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

function validPathList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length
  );
}

function validIdList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every(validIdentifier) && new Set(value).size === value.length
  );
}

function validLease(value: unknown): value is WorkGraphLeaseV1 {
  return (
    isRecord(value) &&
    exactKeys(value, LEASE_KEYS) &&
    typeof value.fence_token === "number" &&
    Number.isInteger(value.fence_token) &&
    value.fence_token >= 0 &&
    validIdentifier(value.owner) &&
    typeof value.acquired_at === "string" &&
    value.acquired_at.length > 0
  );
}

function validQuotaSnapshot(value: unknown): value is QuotaSnapshotV1 {
  return (
    isRecord(value) &&
    exactKeys(value, QUOTA_SNAPSHOT_KEYS) &&
    typeof value.consumed === "number" &&
    Number.isInteger(value.consumed) &&
    value.consumed >= 0 &&
    typeof value.limit === "number" &&
    Number.isInteger(value.limit) &&
    value.limit > 0 &&
    typeof value.threshold === "number" &&
    Number.isInteger(value.threshold) &&
    value.threshold > 0 &&
    value.threshold <= value.limit
  );
}

function validTimestamp(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0);
}

function structurallyValidRow(value: unknown): value is SlotAccountingRowV1 {
  return (
    isRecord(value) &&
    exactKeys(value, SLOT_ROW_KEYS) &&
    validIdentifier(value.slot_id) &&
    validIdentifier(value.parent_id) &&
    validIdentifier(value.task_id) &&
    validIdList(value.dependency_ids) &&
    typeof value.slot_state === "string" &&
    validQuotaSnapshot(value.quota_snapshot) &&
    validLease(value.writer_lease) &&
    validTimestamp(value.started_at) &&
    validTimestamp(value.terminated_at)
  );
}

/**
 * slot accounting row を exact set 9 field で admit する（L5 §1.1）。
 * unknown 追加 field による欠落相殺を拒否し、enum 外の slot_state は入力不正として分離報告する。
 */
export function admitSlotAccountingRow(input: unknown): SlotAccountingResult {
  if (!structurallyValidRow(input)) {
    return { ok: false, failure_code: "SCHEDULER_SLOT_ACCOUNTING_INVALID" };
  }
  if (!SLOT_STATES.includes(input.slot_state)) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  return { ok: true, row: deepFreeze({ ...input }) };
}

function validConflictScope(value: unknown): value is ConflictScopeV1 {
  return (
    isRecord(value) &&
    validIdentifier(value.task_id) &&
    validIdentifier(value.issue_id) &&
    validIdentifier(value.behavior_contract_id) &&
    validIdentifier(value.responsibility_owner) &&
    validPathList(value.allowed_paths) &&
    validIdList(value.shared_authority_ids)
  );
}

function pathsIntersect(left: readonly string[], right: readonly string[]): boolean {
  const covers = (a: string, b: string): boolean =>
    a === b || b.startsWith(a.endsWith("/") ? a : `${a}/`) || a.startsWith(`${b}/`);
  return left.some((a) => right.some((b) => covers(a, b)));
}

function conflicts(left: ConflictScopeV1, right: ConflictScopeV1): boolean {
  if (left.issue_id === right.issue_id) return true;
  if (left.behavior_contract_id === right.behavior_contract_id) return true;
  if (left.responsibility_owner === right.responsibility_owner) return true;
  if (left.shared_authority_ids.some((id) => right.shared_authority_ids.includes(id))) return true;
  return pathsIntersect(left.allowed_paths, right.allowed_paths);
}

function timeOrderValid(row: SlotAccountingRowV1): boolean {
  if (row.started_at === null || row.terminated_at === null) return true;
  return Date.parse(row.terminated_at) >= Date.parse(row.started_at);
}

function queueLimitValid(queue: BoundedQueueSnapshotV1): boolean {
  return (
    isRecord(queue) &&
    typeof queue.queue_limit === "number" &&
    Number.isInteger(queue.queue_limit) &&
    queue.queue_limit > 0
  );
}

/**
 * lease 二重所有の判定（L5 §2.1）。
 * fence_token は lane 内カウンタで lane 識別成分を持たないため、判定キーは
 * (parent_id, task_id) の lane 単位に限定し、lane をまたいだ値一致は衝突として扱わない。
 */
function leaseDoubleOwnership(
  candidate: SlotAccountingRowV1,
  running: readonly SlotAccountingRowV1[],
): boolean {
  return running.some((row) => {
    if (row.parent_id !== candidate.parent_id || row.task_id !== candidate.task_id) return false;
    if (row.writer_lease.owner !== candidate.writer_lease.owner) return true;
    return row.writer_lease.fence_token !== candidate.writer_lease.fence_token;
  });
}

/**
 * dispatch 受理判定（L5 §2 の判定順序 1..8）。
 * queue 判定を capacity 判定より先に置き、queue_limit 欠落を capacity 超過として誤報告しない。
 */
export function evaluateDispatchAdmission(
  request: DispatchAdmissionRequest,
): DispatchAdmissionResult {
  const admittedCandidate = admitSlotAccountingRow(request.candidate);
  if (!admittedCandidate.ok) return admittedCandidate;
  for (const row of request.running) {
    const admittedRow = admitSlotAccountingRow(row);
    if (!admittedRow.ok) return admittedRow;
  }
  if (!queueLimitValid(request.queue)) {
    return { ok: false, failure_code: "SCHEDULER_QUEUE_UNBOUNDED" };
  }
  if (
    !Number.isInteger(request.queue.capacity) ||
    request.queue.capacity < 1 ||
    request.queue.capacity > MAX_SCHEDULER_CAPACITY
  ) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  if (!validConflictScope(request.candidateScope) || !validIdList(request.readyDependencyIds)) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  const candidate = admittedCandidate.row;
  if (!candidate.dependency_ids.every((id) => request.readyDependencyIds.includes(id))) {
    return { ok: false, failure_code: "SCHEDULER_DEPENDENCY_NOT_READY" };
  }
  for (const row of request.running) {
    const scope = request.runningScopes[row.task_id];
    if (!validConflictScope(scope)) {
      return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
    }
    if (conflicts(request.candidateScope, scope)) {
      return { ok: false, failure_code: "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION" };
    }
  }
  if (request.running.length >= request.queue.capacity) {
    return { ok: false, failure_code: "SCHEDULER_CAPACITY_EXCEEDED" };
  }
  if (leaseDoubleOwnership(candidate, request.running)) {
    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };
  }
  if (!timeOrderValid(candidate)) {
    return { ok: false, failure_code: "SCHEDULER_TIME_ORDER_INVALID" };
  }
  return { ok: true, admitted: candidate };
}

/**
 * bounded queue への追加受理（L5 §2.2）。
 * 上限到達時は entries を一切変更せず backpressure を返す（受理せず drop もしない）。
 */
export function admitQueueEntry(request: QueueEntryRequest): QueueEntryResult {
  if (!queueLimitValid(request.queue)) {
    return { ok: false, failure_code: "SCHEDULER_QUEUE_UNBOUNDED" };
  }
  if (
    !validIdentifier(request.taskId) ||
    !validIdList(request.queue.entries) ||
    !validIdList(request.queue.running) ||
    request.queue.entries.includes(request.taskId) ||
    request.queue.running.includes(request.taskId)
  ) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  if (request.queue.entries.length >= request.queue.queue_limit) {
    return { ok: false, failure_code: "SCHEDULER_QUEUE_BACKPRESSURE" };
  }
  return {
    ok: true,
    queue: deepFreeze({
      ...request.queue,
      entries: [...request.queue.entries, request.taskId],
    }),
  };
}

/**
 * handover packet の 5 必須要素（lane_id / task_id / candidate_head / writer_lease /
 * remaining_scope）を検査する。各 field の型検査が欠落も同時に弾くため、キー存在の
 * 事前ループは置かない（到達不能な二重判定を作らない）。
 */
function handoverPacketComplete(packet: QuotaHandoverPacketV1): boolean {
  if (!isRecord(packet)) return false;
  return (
    validIdentifier(packet.lane_id) &&
    validIdentifier(packet.task_id) &&
    validSha(packet.candidate_head) &&
    validLease(packet.writer_lease) &&
    isRecord(packet.remaining_scope) &&
    validPathList(packet.remaining_scope.allowed_paths) &&
    validPathList(packet.remaining_scope.forbidden_paths)
  );
}

/**
 * quota threshold 到達前の handover 判定（L5 §2.2）。
 * packet 欠落を ack 判定より先に置き、必須要素を欠く packet の ack 状態を評価しない。
 */
export function evaluateQuotaHandover(request: QuotaHandoverRequest): QuotaHandoverResult {
  const current = admitSlotAccountingRow(request.current);
  if (!current.ok) return current;
  if (current.row.slot_state !== "running") {
    return { ok: false, failure_code: "SCHEDULER_SLOT_ACCOUNTING_INVALID" };
  }
  if (!handoverPacketComplete(request.packet)) {
    return { ok: false, failure_code: "SCHEDULER_HANDOVER_PACKET_MISSING" };
  }
  if (request.alreadyAcked) {
    return { ok: false, failure_code: "SCHEDULER_HANDOVER_ACK_REPLAY" };
  }
  if (
    request.packet.lane_id !== request.expected.lane_id ||
    request.packet.target_reviewer !== request.expected.target_reviewer ||
    request.packet.candidate_head !== request.expected.candidate_head
  ) {
    return { ok: false, failure_code: "SCHEDULER_HANDOVER_TARGET_MISMATCH" };
  }
  if (current.row.quota_snapshot.consumed >= current.row.quota_snapshot.threshold) {
    return { ok: false, failure_code: "SCHEDULER_QUOTA_EXHAUSTED" };
  }
  if (request.packet.writer_lease.owner !== current.row.writer_lease.owner) {
    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };
  }
  if (!request.predecessorReleased) {
    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };
  }
  if (!validIdentifier(request.successorOwner)) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  // CAS の observed 値は稼働 row が実際に保持する lease、expected 値は packet が主張する
  // fence token とする。両者を packet 由来にすると比較が自己参照になり CAS が無効化される。
  const successor = acquireWorkGraphLease({
    laneId: request.packet.lane_id,
    owner: request.successorOwner,
    expectedFenceToken: request.packet.writer_lease.fence_token,
    currentLease: current.row.writer_lease,
    acquiredAt: request.packet.issued_at,
  });
  if (!successor.ok) {
    // L5 §4: CAS 失敗は WORK_GRAPH_* をそのまま透過させ、scheduler 側で再判定しない。
    return { ok: false, failure_code: successor.failure_code };
  }
  return {
    ok: true,
    packet: deepFreeze({ ...request.packet, writer_lease: successor.lease }),
  };
}

function samePeerState(left: SlotAccountingRowV1, right: SlotAccountingRowV1): boolean {
  return (
    left.slot_state === right.slot_state &&
    left.writer_lease.owner === right.writer_lease.owner &&
    left.writer_lease.fence_token === right.writer_lease.fence_token
  );
}

/**
 * slot 単位 failure isolation の判定（L5 §2.2）。
 * failure lane の lease 解放を先に要求し、依存の無い peer の state と queue 位置の不変を検査する。
 */
export function evaluateSlotFailureIsolation(
  request: SlotFailureIsolationRequest,
): SlotFailureIsolationResult {
  const failed = admitSlotAccountingRow(request.failed);
  if (!failed.ok) return failed;
  for (const row of [...request.peers, ...request.after]) {
    const admitted = admitSlotAccountingRow(row);
    if (!admitted.ok) return admitted;
  }
  if (!request.failedLeaseReleased) {
    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };
  }
  if (request.after.length !== request.peers.length) {
    return { ok: false, failure_code: "SCHEDULER_FAILURE_ISOLATION_BREACH" };
  }
  for (const peer of request.peers) {
    const observed = request.after.find((row) => row.slot_id === peer.slot_id);
    if (observed === undefined || !samePeerState(peer, observed)) {
      return { ok: false, failure_code: "SCHEDULER_FAILURE_ISOLATION_BREACH" };
    }
  }
  if (
    request.queueBefore.length !== request.queueAfter.length ||
    request.queueBefore.some((task, index) => task !== request.queueAfter[index])
  ) {
    return { ok: false, failure_code: "SCHEDULER_FAILURE_ISOLATION_BREACH" };
  }
  return { ok: true };
}

/**
 * merge 後の frontier 再計算（L5 §2.2）。
 * merge 順序の確定と親 acceptance 発行は #213 の Parent acceptance evaluator の authority であり、
 * dispatcher からの要求は他判定へ進まず拒否する（MIC-R-02 の権限非移譲）。
 */
export function evaluateFrontierRecalculation(
  request: FrontierRecalculationRequest,
): FrontierRecalculationResult {
  if (request.requestsMergeOrderDecision) {
    return { ok: false, failure_code: "SCHEDULER_MERGE_AUTHORITY_VIOLATION" };
  }
  const candidate = admitSlotAccountingRow(request.candidate);
  if (!candidate.ok) return candidate;
  if (
    !validIdentifier(request.mergedLaneId) ||
    !validSha(request.mergedHead) ||
    !validSha(request.revalidated.base_head)
  ) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  if (request.revalidated.base_head !== request.mergedHead) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  if (
    request.revalidated.ci_passed !== true ||
    request.revalidated.review_approved !== true ||
    !validDigest(request.revalidated.db_receipt_digest)
  ) {
    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };
  }
  return { ok: true, candidate: candidate.row };
}

/**
 * capacity evidence の admit（L5 §1.4）。
 * lane 数を記録しない evidence と、claimed capacity に満たない lane 数の evidence を拒否する。
 */
export function admitCapacityEvidence(input: unknown): CapacityEvidenceResult {
  if (
    !isRecord(input) ||
    typeof input.claimed_capacity !== "number" ||
    !Number.isInteger(input.claimed_capacity) ||
    input.claimed_capacity < 1 ||
    typeof input.fixture_path !== "string" ||
    input.fixture_path.length === 0
  ) {
    return { ok: false, failure_code: "SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED" };
  }
  if (
    typeof input.lane_count !== "number" ||
    !Number.isInteger(input.lane_count) ||
    input.lane_count < input.claimed_capacity
  ) {
    return { ok: false, failure_code: "SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED" };
  }
  return {
    ok: true,
    evidence: deepFreeze({
      lane_count: input.lane_count,
      claimed_capacity: input.claimed_capacity,
      fixture_path: input.fixture_path,
    }),
  };
}
