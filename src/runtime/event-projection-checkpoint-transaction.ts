import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  writeSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { defaultHarnessDbPath, type HarnessDb } from "../state-db";
import { migrate, SCHEMA_VERSION } from "../state-db/migration";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  type AppendOnlyLogEntryV1,
  type AppendOnlyLogSnapshotV1,
  admitEventEnvelope,
  type CheckpointRecordV1,
  type EventFailureCode,
  evaluateCausalOrder,
  evaluateCheckpointReplay,
  evaluateIdempotentIngest,
  evaluateLifecycleTransition,
  evaluateProjectionDrift,
  type OrchestrationEventEnvelopeV1,
  type ProjectionSnapshotV1,
  selectCheckpointScope,
} from "./event-projection-checkpoint-replay";

export const ORCHESTRATION_EVENT_PROJECTION_SCHEMA_VERSION =
  "helix-orchestration-event-projection.v1" as const;

export type TransactionFailureCode =
  | EventFailureCode
  | "EVENT_JOURNAL_APPEND_FAILED"
  | "EVENT_PROJECTION_WRITE_FAILED"
  | "EVENT_TRANSACTION_ABORTED"
  | "EVENT_CHECKPOINT_PUBLISH_FAILED";

export interface OrchestrationEventPaths {
  readonly journal: string;
  readonly checkpoint: string;
  readonly database: string;
}

export interface OrchestrationEventTransactionInput {
  readonly db: HarnessDb;
  readonly journalPath: string;
  readonly checkpointPath: string;
  readonly envelope: OrchestrationEventEnvelopeV1;
  readonly observedAt: string;
  readonly currentHeadSha: string;
  /** テスト専用fault injection。commit前にthrowし、DB transactionだけをrollbackする。 */
  readonly beforeCommit?: () => void;
}

export interface OrchestrationEventTransactionSuccess {
  readonly ok: true;
  readonly outcome: "appended" | "duplicate_absorbed";
  readonly journalAppended: boolean;
  readonly projectionCommitted: boolean;
  readonly checkpointPublished: boolean;
  readonly projection: ProjectionSnapshotV1;
  readonly checkpoint: CheckpointRecordV1;
  readonly replayedEventCount: number;
}

export interface OrchestrationEventTransactionFailure {
  readonly ok: false;
  readonly failure_code: TransactionFailureCode;
  readonly journalAppended: boolean;
  readonly projectionCommitted: boolean;
  readonly checkpointPublished: boolean;
  readonly replayedEventCount: number;
}

export type OrchestrationEventTransactionResult =
  | OrchestrationEventTransactionSuccess
  | OrchestrationEventTransactionFailure;

interface JournalReadResult {
  readonly events: readonly OrchestrationEventEnvelopeV1[];
  readonly bytes: number;
}

interface ExpectedProjectionRow {
  readonly envelope: OrchestrationEventEnvelopeV1;
  readonly globalSequence: number;
  readonly laneSequence: number;
  readonly projection: ProjectionSnapshotV1;
  readonly checkpoint: CheckpointRecordV1;
}

class TransactionFailure extends Error {
  readonly failureCode: TransactionFailureCode;

  constructor(failureCode: TransactionFailureCode) {
    super(failureCode);
    this.failureCode = failureCode;
  }
}

export function orchestrationEventPaths(repoRoot: string): OrchestrationEventPaths {
  return {
    journal: join(repoRoot, ".helix", "audit", "orchestration-events.jsonl"),
    checkpoint: join(repoRoot, ".helix", "state", "orchestration-checkpoint.json"),
    database: defaultHarnessDbPath(repoRoot),
  };
}

function appendOnlyLog(
  events: readonly OrchestrationEventEnvelopeV1[],
  laneId: string,
): AppendOnlyLogSnapshotV1 {
  return {
    schema_version: "helix-append-only-log.v1",
    lane_id: laneId,
    entries: events.map(toLogEntry),
    sealed_event_ids: [],
  };
}

function toLogEntry(envelope: OrchestrationEventEnvelopeV1): AppendOnlyLogEntryV1 {
  return {
    event_id: envelope.event_id,
    event_type: envelope.event_type,
    occurred_at: envelope.occurred_at,
    causation_id: envelope.causation_id,
    correlation_id: envelope.correlation_id,
    payload_digest: envelope.payload_digest,
  };
}

function readJournal(path: string): JournalReadResult {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { events: [], bytes: 0 };
    throw new TransactionFailure("EVENT_JOURNAL_APPEND_FAILED");
  }
  const events: OrchestrationEventEnvelopeV1[] = [];
  for (const line of text.split(/\r?\n/u).filter((value) => value.trim().length > 0)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      // JSONLの一行を黙って捨てず、journal snapshot invalidへ変換する。
      const failureCode: TransactionFailureCode = "EVENT_LOG_SNAPSHOT_INVALID";
      throw new TransactionFailure(failureCode);
    }
    const admitted = admitEventEnvelope(parsed);
    if (!admitted.ok) throw new TransactionFailure(admitted.failure_code);
    events.push(admitted.envelope);
  }
  return { events, bytes: Buffer.byteLength(text) };
}

function appendJournalEvent(
  path: string,
  existing: JournalReadResult,
  envelope: OrchestrationEventEnvelopeV1,
): { appended: boolean; byteOffset: number } {
  const duplicate = existing.events.find((candidate) => candidate.event_id === envelope.event_id);
  if (duplicate) {
    if (canonicalJson(duplicate) !== canonicalJson(envelope)) {
      throw new TransactionFailure("EVENT_DUPLICATE_DIGEST_MISMATCH");
    }
    return { appended: false, byteOffset: existing.bytes };
  }
  mkdirSync(dirname(path), { recursive: true });
  const line = `${canonicalJson(envelope)}\n`;
  const handle = openSync(path, "a", 0o600);
  try {
    const bytes = Buffer.from(line);
    let written = 0;
    while (written < bytes.length) written += writeSync(handle, bytes, written);
    fsyncSync(handle);
  } catch {
    // partial writeを成功扱いせず、journal append failureへ変換してreplayへ送る。
    const failureCode: TransactionFailureCode = "EVENT_JOURNAL_APPEND_FAILED";
    throw new TransactionFailure(failureCode);
  } finally {
    closeSync(handle);
  }
  return { appended: true, byteOffset: existing.bytes + Buffer.byteLength(line) };
}

function writeAtomicJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  const handle = openSync(temporary, "w", 0o600);
  try {
    const bytes = Buffer.from(`${canonicalJson(value)}\n`);
    let written = 0;
    while (written < bytes.length) written += writeSync(handle, bytes, written);
    fsyncSync(handle);
  } finally {
    closeSync(handle);
  }
  renameSync(temporary, path);
  const directory = openSync(dirname(path), "r");
  try {
    fsyncSync(directory);
  } finally {
    closeSync(directory);
  }
}

function sameEnvelope(
  left: OrchestrationEventEnvelopeV1,
  right: OrchestrationEventEnvelopeV1,
): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function validateJournal(
  events: readonly OrchestrationEventEnvelopeV1[],
  observedAt: string,
  currentHeadSha: string,
): void {
  const prior: OrchestrationEventEnvelopeV1[] = [];
  for (const envelope of events) {
    if (envelope.head_sha !== currentHeadSha) {
      throw new TransactionFailure("EVENT_STALE_HEAD");
    }
    const log = appendOnlyLog(prior, envelope.lane_id);
    const causal = evaluateCausalOrder({ envelope, log, observedAt });
    if (!causal.ok) throw new TransactionFailure(causal.failure_code);
    const idempotency = evaluateIdempotentIngest({ envelope, log });
    if (!idempotency.ok) throw new TransactionFailure(idempotency.failure_code);
    const lifecycle = evaluateLifecycleTransition({ envelope, log });
    if (!lifecycle.ok) throw new TransactionFailure(lifecycle.failure_code);
    prior.push(envelope);
  }
}

function buildExpectedRows(
  events: readonly OrchestrationEventEnvelopeV1[],
): ExpectedProjectionRow[] {
  const laneSequences = new Map<string, number>();
  const laneHistory = new Map<string, OrchestrationEventEnvelopeV1[]>();
  return events.map((envelope, index) => {
    const history = laneHistory.get(envelope.lane_id) ?? [];
    const laneSequence = (laneSequences.get(envelope.lane_id) ?? 0) + 1;
    laneSequences.set(envelope.lane_id, laneSequence);
    history.push(envelope);
    laneHistory.set(envelope.lane_id, history);
    const first = history[0];
    if (history.some((candidate) => candidate.parent_lane_id !== first.parent_lane_id)) {
      throw new TransactionFailure("EVENT_CHECKPOINT_BINDING_MISSING");
    }
    if (history.some((candidate) => candidate.plan_id !== first.plan_id)) {
      throw new TransactionFailure("EVENT_PROJECTION_DRIFT");
    }
    const projection: ProjectionSnapshotV1 = {
      schema_version: "helix-projection-snapshot.v1",
      lane_id: envelope.lane_id,
      identity: {
        plan_id: envelope.plan_id,
        parent_lane_id: envelope.parent_lane_id,
        lane_id: envelope.lane_id,
      },
      state: {
        lifecycle_state: envelope.event_type,
        head_sha: envelope.head_sha,
        last_event_id: envelope.event_id,
      },
    };
    const projectionDigest = sha256Digest(canonicalJson(projection));
    const scope = {
      head_sha: envelope.head_sha,
      parent_lane_id: envelope.parent_lane_id,
      lane_id: envelope.lane_id,
      from_event_id: first.event_id,
      to_event_id: envelope.event_id,
    };
    const selected = selectCheckpointScope({
      scope,
      log: appendOnlyLog(history, envelope.lane_id),
    });
    if (!selected.ok) throw new TransactionFailure(selected.failure_code);
    const toEventId = selected.eventIds.at(-1);
    if (!toEventId) throw new TransactionFailure("EVENT_CHECKPOINT_SCOPE_MISSING");
    const checkpointWithoutDigest = {
      schema_version: "helix-checkpoint-record.v1" as const,
      head_sha: envelope.head_sha,
      parent_lane_id: envelope.parent_lane_id,
      event_boundary: {
        from_event_id: selected.eventIds[0],
        to_event_id: toEventId,
      },
      projection_digest: projectionDigest,
    };
    const checkpoint: CheckpointRecordV1 = {
      ...checkpointWithoutDigest,
      checkpoint_digest: sha256Digest(canonicalJson(checkpointWithoutDigest)),
    };
    return {
      envelope,
      globalSequence: index + 1,
      laneSequence,
      projection,
      checkpoint,
    };
  });
}

function rowEnvelope(row: Record<string, unknown>): OrchestrationEventEnvelopeV1 {
  const envelope: unknown = {
    schema_version: row.schema_version,
    event_id: row.event_id,
    event_type: row.event_type,
    occurred_at: row.occurred_at,
    plan_id: row.plan_id,
    parent_lane_id: row.parent_lane_id,
    lane_id: row.lane_id,
    causation_id: row.causation_id,
    correlation_id: row.correlation_id,
    head_sha: row.head_sha,
    payload_digest: row.payload_digest,
  };
  const admitted = admitEventEnvelope(envelope);
  if (!admitted.ok) throw new TransactionFailure(admitted.failure_code);
  return admitted.envelope;
}

function rowProjection(row: Record<string, unknown>): ProjectionSnapshotV1 {
  try {
    return JSON.parse(String(row.projection_json)) as ProjectionSnapshotV1;
  } catch {
    // 壊れたread modelをnullへ縮退させず、projection driftとして停止する。
    const failureCode: TransactionFailureCode = "EVENT_PROJECTION_DRIFT";
    throw new TransactionFailure(failureCode);
  }
}

function rowCheckpoint(row: Record<string, unknown>): CheckpointRecordV1 {
  try {
    return JSON.parse(String(row.checkpoint_json)) as CheckpointRecordV1;
  } catch {
    // 壊れたcheckpointを推測復元せず、binding missingとして停止する。
    const failureCode: TransactionFailureCode = "EVENT_CHECKPOINT_BINDING_MISSING";
    throw new TransactionFailure(failureCode);
  }
}

function storedRows(db: HarnessDb): Record<string, unknown>[] {
  return db
    .prepare(
      "SELECT event_id, global_sequence, lane_sequence, schema_version, event_type, occurred_at, plan_id, parent_lane_id, lane_id, causation_id, correlation_id, head_sha, payload_digest, projection_json, checkpoint_json, projection_digest, checkpoint_digest FROM orchestration_event_projections ORDER BY global_sequence",
    )
    .all();
}

function assertStoredRowsMatchJournal(
  db: HarnessDb,
  expected: readonly ExpectedProjectionRow[],
): Map<string, Record<string, unknown>> {
  const rows = storedRows(db);
  const expectedById = new Map(expected.map((value) => [value.envelope.event_id, value]));
  const actualById = new Map(rows.map((row) => [String(row.event_id), row]));
  for (const row of rows) {
    const value = expectedById.get(String(row.event_id));
    if (!value) throw new TransactionFailure("EVENT_PROJECTION_DRIFT");
    const stored = rowEnvelope(row);
    if (
      !sameEnvelope(stored, value.envelope) ||
      Number(row.global_sequence) !== value.globalSequence ||
      Number(row.lane_sequence) !== value.laneSequence ||
      String(row.projection_digest) !== sha256Digest(canonicalJson(value.projection)) ||
      String(row.checkpoint_digest) !== value.checkpoint.checkpoint_digest ||
      canonicalJson(rowProjection(row)) !== canonicalJson(value.projection) ||
      canonicalJson(rowCheckpoint(row)) !== canonicalJson(value.checkpoint)
    ) {
      throw new TransactionFailure("EVENT_PROJECTION_DRIFT");
    }
  }
  return actualById;
}

function insertExpectedRows(
  db: HarnessDb,
  expected: readonly ExpectedProjectionRow[],
  actualById: Map<string, Record<string, unknown>>,
): number {
  const insert = db.prepare(
    "INSERT INTO orchestration_event_projections (event_id, global_sequence, lane_sequence, schema_version, event_type, occurred_at, plan_id, parent_lane_id, lane_id, causation_id, correlation_id, head_sha, payload_digest, projection_json, checkpoint_json, projection_digest, checkpoint_digest) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  let inserted = 0;
  for (const value of expected) {
    if (actualById.has(value.envelope.event_id)) continue;
    try {
      insert.run(
        value.envelope.event_id,
        value.globalSequence,
        value.laneSequence,
        value.envelope.schema_version,
        value.envelope.event_type,
        value.envelope.occurred_at,
        value.envelope.plan_id,
        value.envelope.parent_lane_id,
        value.envelope.lane_id,
        value.envelope.causation_id,
        value.envelope.correlation_id,
        value.envelope.head_sha,
        value.envelope.payload_digest,
        canonicalJson(value.projection),
        canonicalJson(value.checkpoint),
        sha256Digest(canonicalJson(value.projection)),
        value.checkpoint.checkpoint_digest,
      );
      inserted += 1;
    } catch {
      // DB constraint/faultを成功へ丸めず、journalを保持したままreplay可能にする。
      const failureCode: TransactionFailureCode = "EVENT_PROJECTION_WRITE_FAILED";
      throw new TransactionFailure(failureCode);
    }
  }
  return inserted;
}

function assertLatestProjectionAndReplay(
  db: HarnessDb,
  expected: readonly ExpectedProjectionRow[],
  currentHeadSha: string,
): Map<string, ExpectedProjectionRow> {
  const rows = storedRows(db);
  const latest = new Map<
    string,
    { row: Record<string, unknown>; expected: ExpectedProjectionRow }
  >();
  for (const value of expected) {
    const row = rows.find((candidate) => String(candidate.event_id) === value.envelope.event_id);
    if (!row) throw new TransactionFailure("EVENT_PROJECTION_DRIFT");
    latest.set(value.envelope.lane_id, { row, expected: value });
  }
  const result = new Map<string, ExpectedProjectionRow>();
  for (const [laneId, current] of latest) {
    const readBack = rowProjection(current.row);
    const drift = evaluateProjectionDrift({
      rebuilt: current.expected.projection,
      readBack,
      knownLaneIds: [...latest.keys()],
    });
    if (!drift.ok) throw new TransactionFailure(drift.failure_code);
    const lane = expected.filter((value) => value.envelope.lane_id === laneId);
    const scope = selectCheckpointScope({
      scope: {
        head_sha: current.expected.envelope.head_sha,
        parent_lane_id: current.expected.envelope.parent_lane_id,
        lane_id: laneId,
        from_event_id: lane[0].envelope.event_id,
        to_event_id: current.expected.envelope.event_id,
      },
      log: appendOnlyLog(
        lane.map((value) => value.envelope),
        laneId,
      ),
    });
    if (!scope.ok) throw new TransactionFailure(scope.failure_code);
    const checkpoint = rowCheckpoint(current.row);
    const replay = evaluateCheckpointReplay({
      checkpoint,
      scopedEventIds: scope.eventIds,
      replayProjectionDigest: sha256Digest(canonicalJson(current.expected.projection)),
      replayCheckpointDigest: checkpoint.checkpoint_digest,
      currentHeadSha,
    });
    if (!replay.ok) throw new TransactionFailure(replay.failure_code);
    result.set(laneId, current.expected);
  }
  return result;
}

function rollback(db: HarnessDb): void {
  try {
    db.exec("ROLLBACK");
  } catch {
    // 元のtransaction failureを優先する。
  }
}

export function ingestOrchestrationEvent(
  input: OrchestrationEventTransactionInput,
): OrchestrationEventTransactionResult {
  const admitted = admitEventEnvelope(input.envelope);
  if (!admitted.ok) {
    return {
      ok: false,
      failure_code: admitted.failure_code,
      journalAppended: false,
      projectionCommitted: false,
      checkpointPublished: false,
      replayedEventCount: 0,
    };
  }
  if (admitted.envelope.head_sha !== input.currentHeadSha) {
    return {
      ok: false,
      failure_code: "EVENT_STALE_HEAD",
      journalAppended: false,
      projectionCommitted: false,
      checkpointPublished: false,
      replayedEventCount: 0,
    };
  }
  if (input.db.userVersion() < SCHEMA_VERSION) migrate(input.db);
  let transactionOpen = false;
  let journalAppended = false;
  let projectionCommitted = false;
  let replayedEventCount = 0;
  let latestProjection: ProjectionSnapshotV1 | undefined;
  let latestCheckpoint: CheckpointRecordV1 | undefined;
  let outcome: "appended" | "duplicate_absorbed" = "appended";
  try {
    input.db.exec("BEGIN IMMEDIATE");
    transactionOpen = true;
    const journal = readJournal(input.journalPath);
    const existing = journal.events.find((event) => event.event_id === admitted.envelope.event_id);
    if (existing && !sameEnvelope(existing, admitted.envelope)) {
      throw new TransactionFailure("EVENT_DUPLICATE_DIGEST_MISMATCH");
    }
    outcome = existing ? "duplicate_absorbed" : "appended";
    const allEvents = existing ? [...journal.events] : [...journal.events, admitted.envelope];
    validateJournal(allEvents, input.observedAt, input.currentHeadSha);
    const expected = buildExpectedRows(allEvents);
    const actualById = assertStoredRowsMatchJournal(input.db, expected);
    if (!existing) {
      const append = appendJournalEvent(input.journalPath, journal, admitted.envelope);
      journalAppended = append.appended;
    }
    replayedEventCount = expected.filter(
      (value) => !actualById.has(value.envelope.event_id),
    ).length;
    insertExpectedRows(input.db, expected, actualById);
    const latest = assertLatestProjectionAndReplay(input.db, expected, input.currentHeadSha);
    const current = latest.get(admitted.envelope.lane_id);
    if (!current) throw new TransactionFailure("EVENT_ORPHAN_LANE");
    latestProjection = current.projection;
    latestCheckpoint = current.checkpoint;
    input.beforeCommit?.();
    input.db.exec("COMMIT");
    transactionOpen = false;
    projectionCommitted = true;
  } catch (error) {
    if (transactionOpen) rollback(input.db);
    const failureCode =
      error instanceof TransactionFailure ? error.failureCode : "EVENT_TRANSACTION_ABORTED";
    return {
      ok: false,
      failure_code: failureCode,
      journalAppended,
      projectionCommitted,
      checkpointPublished: false,
      replayedEventCount,
    };
  }
  if (!latestProjection || !latestCheckpoint) {
    return {
      ok: false,
      failure_code: "EVENT_PROJECTION_DRIFT",
      journalAppended,
      projectionCommitted,
      checkpointPublished: false,
      replayedEventCount,
    };
  }
  try {
    writeAtomicJson(input.checkpointPath, latestCheckpoint);
  } catch {
    return {
      ok: false,
      failure_code: "EVENT_CHECKPOINT_PUBLISH_FAILED",
      journalAppended,
      projectionCommitted,
      checkpointPublished: false,
      replayedEventCount,
    };
  }
  return {
    ok: true,
    outcome,
    journalAppended,
    projectionCommitted,
    checkpointPublished: true,
    projection: latestProjection,
    checkpoint: latestCheckpoint,
    replayedEventCount,
  };
}

export interface OrchestrationProjectionRebuildInput {
  readonly db: HarnessDb;
  readonly journalPath: string;
  readonly checkpointPath: string;
  readonly observedAt: string;
  readonly currentHeadSha: string;
}

export function rebuildOrchestrationProjection(
  input: OrchestrationProjectionRebuildInput,
): OrchestrationEventTransactionResult | { readonly ok: true; readonly eventCount: 0 } {
  const journal = readJournal(input.journalPath);
  const last = journal.events.at(-1);
  if (!last) return { ok: true, eventCount: 0 };
  return ingestOrchestrationEvent({
    ...input,
    envelope: last,
  });
}

export function readOrchestrationLaneProjection(
  db: HarnessDb,
  laneId: string,
): { readonly projection: ProjectionSnapshotV1; readonly checkpoint: CheckpointRecordV1 } | null {
  const row = db
    .prepare(
      "SELECT projection_json, checkpoint_json FROM orchestration_event_projections WHERE lane_id = ? ORDER BY lane_sequence DESC LIMIT 1",
    )
    .get(laneId);
  if (!row) return null;
  return { projection: rowProjection(row), checkpoint: rowCheckpoint(row) };
}

export function orchestrationProjectionDigests(
  db: HarnessDb,
  laneId: string,
): { readonly projection: Sha256Digest; readonly checkpoint: Sha256Digest } | null {
  const row = db
    .prepare(
      "SELECT projection_digest, checkpoint_digest FROM orchestration_event_projections WHERE lane_id = ? ORDER BY lane_sequence DESC LIMIT 1",
    )
    .get(laneId);
  if (!row) return null;
  return {
    projection: String(row.projection_digest) as Sha256Digest,
    checkpoint: String(row.checkpoint_digest) as Sha256Digest,
  };
}
