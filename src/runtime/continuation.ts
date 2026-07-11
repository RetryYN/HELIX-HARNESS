import { createHash } from "node:crypto";
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
import { type MemoryEntryV2, resolveMemoryView } from "../memory/memory-v2";
import { defaultHarnessDbPath, type HarnessDb, openHarnessDb } from "../state-db";
import { migrate } from "../state-db/migration";

export type RetirementPhase =
  | "prerequisite"
  | "shadow_read"
  | "memory_primary"
  | "legacy_write_disabled"
  | "cleanup"
  | "complete"
  | "rolled_back";
export type RetirementJournalStatus = "started" | "completed" | "failed";
export type RetirementWriterPolicy = "frozen" | "disabled";

export interface RetirementIntent {
  roots: string[];
  inventoryDigest: string;
  targetPhase: RetirementPhase;
  writerPolicy: RetirementWriterPolicy;
}
export interface RetirementArtifactDigests {
  backup: string;
  inventory: string;
  source: string;
  target: string;
}
export interface RetirementCheckpoint {
  phase: RetirementPhase;
  artifactDigests: RetirementArtifactDigests;
}
export interface RetirementJournalEntry {
  runId: string;
  operationId: string;
  intentDigest: string;
  phase: RetirementPhase;
  status: RetirementJournalStatus;
  error?: string | null;
  checkpoint: RetirementCheckpoint | null;
  backupDigest: string;
  inventoryDigest: string;
  sourceCount: number;
  targetCount: number;
  sourceDigest: string;
  targetDigest: string;
  occurredAt: string;
}
export interface RetirementPrerequisites {
  reverseR4Green: boolean;
  memoryGreenDigest: string | null;
  lifecycleGreenDigest: string | null;
  crossRuntimeGreenDigest: string | null;
}
export interface RetirementTransitionInput {
  currentPhase: RetirementPhase;
  targetPhase: RetirementPhase;
  operationId: string;
  intentDigest: string;
  prerequisites: RetirementPrerequisites;
  journal: readonly RetirementJournalEntry[];
}
export interface RetirementManifestEntry {
  path: string;
  digest: string;
  mode: number;
  tracked: boolean;
}

const PHASES: readonly RetirementPhase[] = [
  "prerequisite",
  "shadow_read",
  "memory_primary",
  "legacy_write_disabled",
  "cleanup",
  "complete",
  "rolled_back",
];
const STATUSES: readonly RetirementJournalStatus[] = ["started", "completed", "failed"];
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const RFC3339_INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const ROLLBACK_PHASES = new Set<RetirementPhase>(["prerequisite", "shadow_read", "memory_primary"]);
const ALLOWED_FORWARD_EDGE: Readonly<Partial<Record<RetirementPhase, RetirementPhase>>> = {
  prerequisite: "shadow_read",
  shadow_read: "memory_primary",
  memory_primary: "legacy_write_disabled",
  legacy_write_disabled: "cleanup",
  cleanup: "complete",
};

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function validDigest(value: unknown): value is string {
  return typeof value === "string" && SHA256.test(value);
}
function validRelativePath(value: string): boolean {
  const segments = value.split("/");
  return (
    value.length > 0 &&
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.includes("\0") &&
    segments.every((segment) => segment !== "" && segment !== "." && segment !== "..")
  );
}
function validRfc3339Instant(value: string): boolean {
  const match = value.match(RFC3339_INSTANT);
  if (!match || Number.isNaN(Date.parse(value))) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return (
    calendar.getUTCFullYear() === year &&
    calendar.getUTCMonth() === month - 1 &&
    calendar.getUTCDate() === day
  );
}
function canonicalJson(value: unknown, stack = new Set<object>()): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (typeof value !== "object") throw new Error("retirement intent contains non-JSON value");
  if (stack.has(value)) throw new Error("retirement intent contains cycle");
  stack.add(value);
  const result = Array.isArray(value)
    ? `[${value.map((item) => canonicalJson(item, stack)).join(",")}]`
    : `{${Object.keys(value as Record<string, unknown>)
        .sort()
        .map(
          (key) =>
            `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key], stack)}`,
        )
        .join(",")}}`;
  stack.delete(value);
  return result;
}

export function buildRetirementIntentDigest(intent: RetirementIntent): string {
  if (
    !Array.isArray(intent.roots) ||
    intent.roots.length === 0 ||
    intent.roots.some((root) => typeof root !== "string" || !validRelativePath(root)) ||
    new Set(intent.roots).size !== intent.roots.length
  ) {
    throw new Error("invalid retirement intent roots");
  }
  if (!validDigest(intent.inventoryDigest)) throw new Error("invalid retirement intent digest");
  if (!PHASES.includes(intent.targetPhase)) throw new Error("invalid retirement intent phase");
  if (intent.writerPolicy !== "frozen" && intent.writerPolicy !== "disabled") {
    throw new Error("invalid retirement intent writer policy");
  }
  return sha256(canonicalJson({ ...intent, roots: [...intent.roots].sort() }));
}

function prerequisiteReasons(input: RetirementPrerequisites): string[] {
  const reasons: string[] = [];
  if (!input.reverseR4Green) reasons.push("reverse_r4_not_green");
  if (!validDigest(input.memoryGreenDigest)) reasons.push("missing_memory_green_digest");
  if (!validDigest(input.lifecycleGreenDigest)) reasons.push("missing_lifecycle_green_digest");
  if (!validDigest(input.crossRuntimeGreenDigest))
    reasons.push("missing_cross_runtime_green_digest");
  return reasons;
}
function entryArtifactDigests(entry: RetirementJournalEntry): RetirementArtifactDigests {
  return {
    backup: entry.backupDigest,
    inventory: entry.inventoryDigest,
    source: entry.sourceDigest,
    target: entry.targetDigest,
  };
}
function checkpointMatchesPrior(
  checkpoint: RetirementCheckpoint | null,
  prior: RetirementJournalEntry | null,
): boolean {
  if (!prior) return checkpoint === null;
  if (!checkpoint || checkpoint.phase !== prior.phase) return false;
  const expected = entryArtifactDigests(prior);
  return (Object.keys(expected) as (keyof RetirementArtifactDigests)[]).every(
    (key) => checkpoint.artifactDigests[key] === expected[key],
  );
}
function scopedCompleted(
  journal: readonly RetirementJournalEntry[],
  operationId: string,
  intentDigest: string,
): RetirementJournalEntry[] {
  return journal.filter(
    (entry) =>
      entry.operationId === operationId &&
      entry.intentDigest === intentDigest &&
      entry.status === "completed",
  );
}
function journalPrefixReasons(entries: readonly RetirementJournalEntry[]): string[] {
  const reasons: string[] = [];
  const forward = PHASES.filter((phase) => phase !== "rolled_back");
  let previous = -1;
  let priorEntry: RetirementJournalEntry | null = null;
  let terminal = false;
  for (const entry of entries) {
    if (terminal) {
      reasons.push("journal_phase_prefix_invalid");
      continue;
    }
    if (!checkpointMatchesPrior(entry.checkpoint, priorEntry)) {
      reasons.push("journal_checkpoint_invalid");
    }
    if (entry.phase === "rolled_back") {
      const previousPhase = previous >= 0 ? forward[previous] : undefined;
      if (!previousPhase || !ROLLBACK_PHASES.has(previousPhase)) {
        reasons.push("journal_phase_prefix_invalid");
      }
      terminal = true;
      continue;
    }
    const index = forward.indexOf(entry.phase);
    if (
      index < 0 ||
      (previous === -1 && index !== 0) ||
      (previous >= 0 && (index <= previous || index > previous + 1))
    ) {
      reasons.push("journal_phase_prefix_invalid");
    }
    previous = index;
    priorEntry = entry;
  }
  return [...new Set(reasons)];
}

export function latestCompletedRetirementCheckpoint(
  journal: readonly RetirementJournalEntry[],
  scope: { operationId: string; intentDigest: string },
): RetirementJournalEntry | null {
  const entries = scopedCompleted(journal, scope.operationId, scope.intentDigest);
  return entries.at(-1) ?? null;
}

export function evaluateRetirementTransition(input: RetirementTransitionInput): {
  ok: boolean;
  replay: boolean;
  reasons: string[];
} {
  const reasons = prerequisiteReasons(input.prerequisites);
  const sameOperation = input.journal.filter((entry) => entry.operationId === input.operationId);
  if (sameOperation.some((entry) => entry.intentDigest !== input.intentDigest)) {
    reasons.push("operation_intent_conflict");
  }
  const completed = scopedCompleted(input.journal, input.operationId, input.intentDigest);
  reasons.push(...journalPrefixReasons(completed));
  const replay = completed.some((entry) => entry.phase === input.targetPhase);
  if (replay && reasons.length === 0) return { ok: true, replay: true, reasons: [] };
  const latest = completed.at(-1) ?? null;
  if (latest && latest.phase !== input.currentPhase)
    reasons.push("current_phase_checkpoint_mismatch");
  const allowed =
    ALLOWED_FORWARD_EDGE[input.currentPhase] === input.targetPhase ||
    (input.targetPhase === "rolled_back" && ROLLBACK_PHASES.has(input.currentPhase));
  if (!allowed) reasons.push("invalid_phase_transition");
  return {
    ok: reasons.length === 0,
    replay: false,
    reasons: [...new Set(reasons)],
  };
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0)
    throw new Error(`invalid retirement journal ${key}`);
  return value;
}
function requiredDigest(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (!validDigest(value)) throw new Error(`invalid retirement journal ${key}`);
  return value;
}
function requiredCount(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (!Number.isInteger(value) || (value as number) < 0)
    throw new Error(`invalid retirement journal ${key}`);
  return value as number;
}
function parseCheckpoint(value: unknown): RetirementCheckpoint | null {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid retirement journal checkpoint");
  const record = value as Record<string, unknown>;
  const phase = requiredString(record, "phase");
  const digests = record.artifactDigests;
  if (
    !PHASES.includes(phase as RetirementPhase) ||
    !digests ||
    typeof digests !== "object" ||
    Array.isArray(digests)
  ) {
    throw new Error("invalid retirement journal checkpoint");
  }
  const d = digests as Record<string, unknown>;
  return {
    phase: phase as RetirementPhase,
    artifactDigests: {
      backup: requiredDigest(d, "backup"),
      inventory: requiredDigest(d, "inventory"),
      source: requiredDigest(d, "source"),
      target: requiredDigest(d, "target"),
    },
  };
}

export function parseRetirementJournalLine(line: string): RetirementJournalEntry {
  const parsed = JSON.parse(line) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("invalid retirement journal entry");
  const record = parsed as Record<string, unknown>;
  const phase = requiredString(record, "phase");
  const status = requiredString(record, "status");
  if (!PHASES.includes(phase as RetirementPhase))
    throw new Error(`invalid retirement journal phase: ${phase}`);
  if (!STATUSES.includes(status as RetirementJournalStatus))
    throw new Error(`invalid retirement journal status: ${status}`);
  const occurredAt = requiredString(record, "occurredAt");
  if (!validRfc3339Instant(occurredAt))
    throw new Error(`invalid retirement journal occurredAt: ${occurredAt}`);
  const error = record.error;
  if (status === "failed" && (typeof error !== "string" || error.length === 0)) {
    throw new Error("invalid retirement journal failed error");
  }
  if (status !== "failed" && error !== undefined && error !== null) {
    throw new Error("invalid retirement journal non-failed error");
  }
  const result: RetirementJournalEntry = {
    runId: requiredString(record, "runId"),
    operationId: requiredString(record, "operationId"),
    intentDigest: requiredDigest(record, "intentDigest"),
    phase: phase as RetirementPhase,
    status: status as RetirementJournalStatus,
    error: typeof error === "string" ? error : null,
    checkpoint: parseCheckpoint(record.checkpoint),
    backupDigest: requiredDigest(record, "backupDigest"),
    inventoryDigest: requiredDigest(record, "inventoryDigest"),
    sourceCount: requiredCount(record, "sourceCount"),
    targetCount: requiredCount(record, "targetCount"),
    sourceDigest: requiredDigest(record, "sourceDigest"),
    targetDigest: requiredDigest(record, "targetDigest"),
    occurredAt,
  };
  return result;
}

export function parseRetirementJournal(text: string): {
  entries: RetirementJournalEntry[];
  truncatedTail: boolean;
} {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const entries: RetirementJournalEntry[] = [];
  let truncatedTail = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) continue;
    try {
      entries.push(parseRetirementJournalLine(line));
    } catch (error) {
      if (index === lines.length - 1 && error instanceof SyntaxError) {
        truncatedTail = true;
        break;
      }
      throw error;
    }
  }
  const scopes = new Map<string, RetirementJournalEntry[]>();
  for (const entry of entries) {
    const key = `${entry.operationId}\0${entry.intentDigest}`;
    const scoped = scopes.get(key) ?? [];
    scoped.push(entry);
    scopes.set(key, scoped);
  }
  for (const scoped of scopes.values()) {
    const reasons = journalPrefixReasons(scoped.filter((entry) => entry.status === "completed"));
    if (reasons.length > 0)
      throw new Error(`invalid retirement journal sequence: ${reasons.join(",")}`);
  }
  return { entries, truncatedTail };
}

export function analyzeRetirementManifestReconcile(
  source: readonly RetirementManifestEntry[],
  target: readonly RetirementManifestEntry[],
): {
  ok: boolean;
  missing: string[];
  changed: string[];
  extra: string[];
  duplicateSource: string[];
  duplicateTarget: string[];
  invalidSource: string[];
  invalidTarget: string[];
} {
  const duplicates = (entries: readonly RetirementManifestEntry[]): string[] => {
    const seen = new Set<string>();
    const found = new Set<string>();
    for (const entry of entries) {
      if (seen.has(entry.path)) found.add(entry.path);
      seen.add(entry.path);
    }
    return [...found].sort();
  };
  const invalid = (entries: readonly RetirementManifestEntry[]): string[] =>
    entries
      .filter((entry) => {
        return (
          !validRelativePath(entry.path) ||
          !validDigest(entry.digest) ||
          !Number.isInteger(entry.mode) ||
          entry.mode < 0 ||
          entry.mode > 0o777 ||
          typeof entry.tracked !== "boolean"
        );
      })
      .map((entry) => entry.path)
      .sort();
  const duplicateSource = duplicates(source);
  const duplicateTarget = duplicates(target);
  const invalidSource = invalid(source);
  const invalidTarget = invalid(target);
  const sourceByPath = new Map(source.map((entry) => [entry.path, entry]));
  const targetByPath = new Map(target.map((entry) => [entry.path, entry]));
  const missing = [...sourceByPath.keys()].filter((path) => !targetByPath.has(path)).sort();
  const extra = [...targetByPath.keys()].filter((path) => !sourceByPath.has(path)).sort();
  const changed = [...sourceByPath.entries()]
    .filter(([path, a]) => {
      const b = targetByPath.get(path);
      return b && (a.digest !== b.digest || a.mode !== b.mode || a.tracked !== b.tracked);
    })
    .map(([path]) => path)
    .sort();
  const issueCount =
    missing.length +
    changed.length +
    extra.length +
    duplicateSource.length +
    duplicateTarget.length +
    invalidSource.length +
    invalidTarget.length;
  return {
    ok: issueCount === 0,
    missing,
    changed,
    extra,
    duplicateSource,
    duplicateTarget,
    invalidSource,
    invalidTarget,
  };
}

export function canRollbackRetirement(input: {
  currentPhase: RetirementPhase;
  operationId: string;
  intentDigest: string;
  journal: readonly RetirementJournalEntry[];
  backupManifestDigest: string;
  restoreDigest: string;
  incidentRecorded: boolean;
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!ROLLBACK_PHASES.has(input.currentPhase)) reasons.push("rollback_cutoff_reached");
  const completed = scopedCompleted(input.journal, input.operationId, input.intentDigest);
  const checkpoint = completed.at(-1) ?? null;
  if (
    journalPrefixReasons(completed).length > 0 ||
    !checkpoint ||
    checkpoint.phase !== input.currentPhase
  ) {
    reasons.push("rollback_checkpoint_invalid");
  }
  if (
    !checkpoint ||
    !validDigest(input.backupManifestDigest) ||
    input.backupManifestDigest !== checkpoint.backupDigest
  ) {
    reasons.push("backup_digest_mismatch");
  }
  if (!validDigest(input.restoreDigest) || input.restoreDigest !== input.backupManifestDigest) {
    reasons.push("restore_digest_mismatch");
  }
  if (!input.incidentRecorded) reasons.push("rollback_incident_missing");
  return { ok: reasons.length === 0, reasons };
}

export interface ContinuationEventPayload {
  planId: string | null;
  eventKind: string;
  nextAction: string | null;
  memoryRef: string | null;
}

export interface ContinuationEvent extends ContinuationEventPayload {
  schemaVersion: 1;
  eventId: string;
  operationId: string;
  sessionId: string;
  eventSeq: number;
  recordedAt: string;
  payloadHash: string;
}

export interface ContinuationCheckpoint {
  sessionId: string;
  eventSeq: number;
  eventId: string;
  payloadHash: string;
  byteOffset: number;
}

export type ContinuationFinding =
  | "event_append_failed"
  | "projection_failed"
  | "checkpoint_publish_failed"
  | "memory_breadcrumb_failed"
  | "sequence_payload_conflict"
  | "invalid_event_log";

export interface ContinuationWriteDeps {
  appendEvent(event: ContinuationEvent): {
    byteOffset: number;
    appended: boolean;
  };
  projectEvent(event: ContinuationEvent): "inserted" | "deduped";
  publishCheckpoint(checkpoint: ContinuationCheckpoint): void;
  writeMemoryBreadcrumb?(event: ContinuationEvent): void;
}

export interface ContinuationWriteResult {
  ok: boolean;
  published: boolean;
  projected: boolean;
  memoryWritten: boolean;
  event: ContinuationEvent;
  findings: ContinuationFinding[];
}

function requiredNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) throw new Error(`invalid ${field}`);
}

export function buildContinuationEvent(input: {
  eventId: string;
  operationId: string;
  sessionId: string;
  eventSeq: number;
  recordedAt: string;
  payload: ContinuationEventPayload;
}): ContinuationEvent {
  requiredNonEmpty(input.eventId, "continuation event id");
  requiredNonEmpty(input.operationId, "continuation operation id");
  requiredNonEmpty(input.sessionId, "continuation session id");
  requiredNonEmpty(input.payload.eventKind, "continuation event kind");
  if (!Number.isSafeInteger(input.eventSeq) || input.eventSeq < 0) {
    throw new Error("invalid continuation event sequence");
  }
  if (!validRfc3339Instant(input.recordedAt) || !input.recordedAt.endsWith("Z")) {
    throw new Error("invalid continuation timestamp");
  }
  const payloadHash = sha256(canonicalJson(input.payload));
  return {
    schemaVersion: 1,
    eventId: input.eventId,
    operationId: input.operationId,
    sessionId: input.sessionId,
    eventSeq: input.eventSeq,
    recordedAt: input.recordedAt,
    payloadHash,
    ...input.payload,
  };
}

/**
 * Event append -> DB projection -> checkpoint publicationの順を固定するfail-close writer。
 * memory breadcrumbはprojection後の派生物であり、失敗してもDBを巻き戻したり上書きしない。
 */
export function writeContinuationEvent(
  event: ContinuationEvent,
  deps: ContinuationWriteDeps,
): ContinuationWriteResult {
  const base = {
    event,
    published: false,
    projected: false,
    memoryWritten: false,
  };
  let appendResult: { byteOffset: number; appended: boolean };
  try {
    appendResult = deps.appendEvent(event);
  } catch {
    return { ...base, ok: false, findings: ["event_append_failed"] };
  }
  try {
    deps.projectEvent(event);
  } catch (error) {
    const finding =
      error instanceof Error && error.message.includes("sequence_payload_conflict")
        ? "sequence_payload_conflict"
        : "projection_failed";
    return { ...base, ok: false, findings: [finding] };
  }
  const projected = { ...base, projected: true };
  try {
    deps.publishCheckpoint({
      sessionId: event.sessionId,
      eventSeq: event.eventSeq,
      eventId: event.eventId,
      payloadHash: event.payloadHash,
      byteOffset: appendResult.byteOffset,
    });
  } catch {
    return { ...projected, ok: false, findings: ["checkpoint_publish_failed"] };
  }
  if (!deps.writeMemoryBreadcrumb) {
    return { ...projected, ok: true, published: true, findings: [] };
  }
  try {
    deps.writeMemoryBreadcrumb(event);
    return {
      ...projected,
      ok: true,
      published: true,
      memoryWritten: true,
      findings: [],
    };
  } catch {
    return {
      ...projected,
      ok: true,
      published: true,
      findings: ["memory_breadcrumb_failed"],
    };
  }
}

export interface PlanCompletionContinuationInput {
  repoRoot: string;
  sessionId: string;
  operationId: string;
  completedPlanId: string;
  nextAction: string | null;
  memoryRef: string | null;
  recordedAt: string;
}

export interface PlanCompletionContinuationPaths {
  journal: string;
  checkpoint: string;
  database: string;
}

export interface PlanCompletionContinuationDeps {
  db?: HarnessDb;
  clearActivePlan(): void;
}

/**
 * productionで使うcontinuation path。既存session-logとはschemaが異なるためjournalを分離する。
 * checkpointはharness.db SSoTを置換しないreplay cursorである。
 */
export function planCompletionContinuationPaths(repoRoot: string): PlanCompletionContinuationPaths {
  return {
    journal: join(repoRoot, ".helix", "audit", "continuation-events.jsonl"),
    checkpoint: join(repoRoot, ".helix", "state", "continuation-checkpoint.json"),
    database: defaultHarnessDbPath(repoRoot),
  };
}

function atomicPublishContinuationCheckpoint(
  path: string,
  checkpoint: ContinuationCheckpoint,
): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  const handle = openSync(temporary, "w", 0o600);
  try {
    const bytes = Buffer.from(`${JSON.stringify({ schemaVersion: 1, ...checkpoint })}\n`);
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

/**
 * PLAN completeのproduction adapter。
 * durable JSONL -> harness.db -> atomic replay cursorの全段成功後だけactive PLANをclearする。
 * operationId replayはjournal内の同一eventを再利用し、sequenceとpayloadを固定する。
 */
export function writePlanCompletionContinuation(
  input: PlanCompletionContinuationInput,
  deps: PlanCompletionContinuationDeps,
): ContinuationWriteResult {
  const paths = planCompletionContinuationPaths(input.repoRoot);
  mkdirSync(dirname(paths.journal), { recursive: true });
  const ownedDb = deps.db ? null : openHarnessDb(paths.database, { repoRoot: input.repoRoot });
  const database = deps.db ?? ownedDb;
  if (!database) throw new Error("continuation database unavailable");
  try {
    migrate(database);
    let journalEvents: ContinuationEvent[] = [];
    try {
      journalEvents = parseContinuationEventLog(readFileSync(paths.journal, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const replay = journalEvents.find((candidate) => candidate.operationId === input.operationId);
    const payload: ContinuationEventPayload = {
      planId: input.completedPlanId,
      eventKind: "plan_complete",
      nextAction: input.nextAction,
      memoryRef: input.memoryRef,
    };
    const payloadHash = sha256(canonicalJson(payload));
    if (replay && replay.sessionId !== input.sessionId) {
      throw new Error("continuation operation session conflict");
    }
    if (replay && replay.payloadHash !== payloadHash) {
      throw new Error("continuation operation intent conflict");
    }
    const projectedWatermark = database
      .prepare("SELECT MAX(event_seq) AS event_seq FROM session_events WHERE session_id = ?")
      .get(input.sessionId);
    const journalWatermark = journalEvents
      .filter((candidate) => candidate.sessionId === input.sessionId)
      .reduce((max, candidate) => Math.max(max, candidate.eventSeq), -1);
    const event =
      replay ??
      buildContinuationEvent({
        eventId: `continuation-${sha256(input.operationId).slice("sha256:".length)}`,
        operationId: input.operationId,
        sessionId: input.sessionId,
        eventSeq: Math.max(Number(projectedWatermark?.event_seq ?? -1), journalWatermark) + 1,
        recordedAt: input.recordedAt,
        payload,
      });
    const result = writeContinuationEvent(event, {
      appendEvent: (value) => appendContinuationEventFile(paths.journal, value, database),
      projectEvent: (value) => projectContinuationEvent(database, value),
      publishCheckpoint: (value) => atomicPublishContinuationCheckpoint(paths.checkpoint, value),
    });
    if (result.ok && result.published) deps.clearActivePlan();
    return result;
  } finally {
    ownedDb?.close();
  }
}

export function parseContinuationEventLine(line: string): ContinuationEvent {
  const raw = JSON.parse(line) as Record<string, unknown>;
  const event = buildContinuationEvent({
    eventId: requiredString(raw, "eventId"),
    operationId: requiredString(raw, "operationId"),
    sessionId: requiredString(raw, "sessionId"),
    eventSeq: requiredCount(raw, "eventSeq"),
    recordedAt: requiredString(raw, "recordedAt"),
    payload: {
      planId: raw.planId === null ? null : requiredString(raw, "planId"),
      eventKind: requiredString(raw, "eventKind"),
      nextAction: raw.nextAction === null ? null : requiredString(raw, "nextAction"),
      memoryRef: raw.memoryRef === null ? null : requiredString(raw, "memoryRef"),
    },
  });
  if (raw.schemaVersion !== 1) throw new Error("invalid continuation schema version");
  if (requiredDigest(raw, "payloadHash") !== event.payloadHash) {
    throw new Error("continuation payload hash mismatch");
  }
  return event;
}

export function parseContinuationEventLog(text: string): ContinuationEvent[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const events = lines.map(parseContinuationEventLine);
  const operations = new Map<string, ContinuationEvent>();
  const sequences = new Map<string, ContinuationEvent>();
  const eventIds = new Map<string, ContinuationEvent>();
  const watermarks = new Map<string, number>();
  for (const event of events) {
    const priorEventId = eventIds.get(event.eventId);
    if (
      priorEventId &&
      (priorEventId.operationId !== event.operationId ||
        priorEventId.payloadHash !== event.payloadHash ||
        priorEventId.eventSeq !== event.eventSeq)
    ) {
      throw new Error("continuation event id conflict");
    }
    eventIds.set(event.eventId, event);
    const priorOperation = operations.get(event.operationId);
    if (priorOperation && priorOperation.payloadHash !== event.payloadHash) {
      throw new Error("continuation operation intent conflict");
    }
    operations.set(event.operationId, event);
    const sequenceKey = `${event.sessionId}\0${event.eventSeq}`;
    const priorSequence = sequences.get(sequenceKey);
    if (
      priorSequence &&
      (priorSequence.eventId !== event.eventId || priorSequence.payloadHash !== event.payloadHash)
    ) {
      throw new Error("sequence_payload_conflict");
    }
    sequences.set(sequenceKey, event);
    const watermark = watermarks.get(event.sessionId);
    if (watermark !== undefined && event.eventSeq < watermark) {
      throw new Error("continuation sequence regression");
    }
    watermarks.set(event.sessionId, Math.max(watermark ?? -1, event.eventSeq));
  }
  return events;
}

/**
 * canonical continuation JSONLへfull lineをappend+fsyncする。
 * 同operation+同payloadはappend 0、異payloadまたは同sequence conflictはfail-close。
 */
export function appendContinuationEventFile(
  path: string,
  event: ContinuationEvent,
  coordinationDb: HarnessDb,
): { byteOffset: number; appended: boolean } {
  return withContinuationFence(
    {
      db: coordinationDb,
      scope: "continuation-journal",
      owner: event.operationId,
      acquiredAt: event.recordedAt,
    },
    () => appendContinuationEventFileLocked(path, event),
  );
}

function withContinuationFence<T>(
  input: {
    db: HarnessDb;
    scope: string;
    owner: string;
    acquiredAt: string;
  },
  fn: () => T,
): T {
  const { acquiredAt, db, owner, scope } = input;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "INSERT INTO continuation_fences(scope, fence_token, owner, acquired_at) VALUES (?, 1, ?, ?) ON CONFLICT(scope) DO UPDATE SET fence_token = fence_token + 1, owner = excluded.owner, acquired_at = excluded.acquired_at",
    ).run(scope, owner, acquiredAt);
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // SQLiteが既にtransactionを破棄した場合も元errorを優先する。
    }
    throw error;
  }
}

function appendContinuationEventFileLocked(
  path: string,
  event: ContinuationEvent,
): { byteOffset: number; appended: boolean } {
  parseContinuationEventLine(JSON.stringify(event));
  let existing = "";
  try {
    existing = readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const events = existing.length > 0 ? parseContinuationEventLog(existing) : [];
  const sameOperation = events.find((candidate) => candidate.operationId === event.operationId);
  if (sameOperation) {
    if (sameOperation.payloadHash !== event.payloadHash) {
      throw new Error("continuation operation intent conflict");
    }
    let offset = 0;
    for (const line of existing.match(/.*(?:\n|$)/g) ?? []) {
      if (line.length === 0) continue;
      offset += Buffer.byteLength(line);
      const parsed = parseContinuationEventLine(line.trimEnd());
      if (parsed.operationId === event.operationId) {
        return { byteOffset: offset, appended: false };
      }
    }
    throw new Error("continuation replay offset unresolved");
  }
  const sameSequence = events.find(
    (candidate) => candidate.sessionId === event.sessionId && candidate.eventSeq === event.eventSeq,
  );
  if (
    sameSequence &&
    (sameSequence.eventId !== event.eventId || sameSequence.payloadHash !== event.payloadHash)
  ) {
    throw new Error("sequence_payload_conflict");
  }
  if (events.some((candidate) => candidate.eventId === event.eventId)) {
    throw new Error("continuation event id conflict");
  }
  const sessionWatermark = events
    .filter((candidate) => candidate.sessionId === event.sessionId)
    .reduce((max, candidate) => Math.max(max, candidate.eventSeq), -1);
  if (event.eventSeq <= sessionWatermark) throw new Error("continuation sequence regression");
  const line = `${JSON.stringify(event)}\n`;
  const handle = openSync(path, "a");
  try {
    const bytes = Buffer.from(line);
    let written = 0;
    while (written < bytes.length) written += writeSync(handle, bytes, written);
    fsyncSync(handle);
  } finally {
    closeSync(handle);
  }
  return {
    byteOffset: Buffer.byteLength(existing) + Buffer.byteLength(line),
    appended: true,
  };
}

export interface LegacyContinuationNote {
  sourceDigest: string;
  body: string;
  recordedAt: string;
  expiresAt: string | null;
}

export interface LegacyNoteMigration {
  operationId: string;
  layer: "takeover";
  key: string;
  body: string;
  type: "state";
  provenance: { origin: "legacy-current-note"; runtime: "system" };
  links: string[];
  expiresAt: string;
}

export function planLegacyNoteMigration(
  notes: readonly LegacyContinuationNote[],
  input: {
    now: string;
    isSecret(value: string): boolean;
    isPii(value: string): boolean;
  },
): { migration: LegacyNoteMigration | null; diagnostics: string[] } {
  if (!validRfc3339Instant(input.now)) throw new Error("invalid migration clock");
  const diagnostics: string[] = [];
  const candidates = [...notes].sort((a, b) => a.sourceDigest.localeCompare(b.sourceDigest));
  for (const note of candidates) {
    if (!validDigest(note.sourceDigest)) {
      diagnostics.push("legacy_note_source_digest_invalid");
      continue;
    }
    if (note.body.trim().length === 0 || input.isSecret(note.body) || input.isPii(note.body)) {
      diagnostics.push("legacy_note_sensitive_or_invalid");
      continue;
    }
    if (!note.expiresAt || !validRfc3339Instant(note.expiresAt)) {
      diagnostics.push("legacy_note_expiry_missing");
      continue;
    }
    const ttl = Date.parse(note.expiresAt) - Date.parse(input.now);
    if (ttl <= 0 || ttl > 7 * 24 * 60 * 60 * 1000) {
      diagnostics.push("legacy_note_ttl_invalid");
      continue;
    }
    return {
      migration: {
        operationId: `handover-retirement:${note.sourceDigest}`,
        layer: "takeover",
        key: `legacy-current-note:${note.sourceDigest}`,
        body: note.body,
        type: "state",
        provenance: { origin: "legacy-current-note", runtime: "system" },
        links: [`harness:source-digest-${note.sourceDigest.slice("sha256:".length)}`],
        expiresAt: note.expiresAt,
      },
      diagnostics,
    };
  }
  return { migration: null, diagnostics };
}

export function projectContinuationEvent(
  db: HarnessDb,
  event: ContinuationEvent,
): "inserted" | "deduped" {
  const existingEventId = db
    .prepare("SELECT operation_id, event_seq, payload_hash FROM session_events WHERE event_id = ?")
    .get(event.eventId);
  if (existingEventId) {
    if (
      String(existingEventId.operation_id) === event.operationId &&
      Number(existingEventId.event_seq) === event.eventSeq &&
      String(existingEventId.payload_hash) === event.payloadHash
    ) {
      return "deduped";
    }
    throw new Error("continuation event id conflict");
  }
  const existingOperation = db
    .prepare("SELECT event_id, payload_hash FROM session_events WHERE operation_id = ?")
    .get(event.operationId);
  if (existingOperation) {
    if (String(existingOperation.payload_hash) === event.payloadHash) return "deduped";
    throw new Error("continuation operation intent conflict");
  }
  const existing = db
    .prepare(
      "SELECT event_id, payload_hash FROM session_events WHERE session_id = ? AND event_seq = ?",
    )
    .get(event.sessionId, event.eventSeq);
  if (existing) {
    if (
      String(existing.event_id) === event.eventId &&
      String(existing.payload_hash) === event.payloadHash
    ) {
      return "deduped";
    }
    throw new Error("sequence_payload_conflict");
  }
  const watermark = db
    .prepare("SELECT MAX(event_seq) AS event_seq FROM session_events WHERE session_id = ?")
    .get(event.sessionId);
  if (watermark?.event_seq !== null && Number(watermark?.event_seq ?? -1) >= event.eventSeq) {
    throw new Error("continuation sequence regression");
  }
  try {
    db.prepare(
      "INSERT INTO session_events (event_key, event_id, schema_version, operation_id, session_id, event_seq, plan_id, event_kind, next_action, memory_ref, recorded_at, payload_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      `${event.sessionId}:${event.eventSeq}`,
      event.eventId,
      event.schemaVersion,
      event.operationId,
      event.sessionId,
      event.eventSeq,
      event.planId,
      event.eventKind,
      event.nextAction,
      event.memoryRef,
      event.recordedAt,
      event.payloadHash,
    );
  } catch {
    const racedOperation = db
      .prepare("SELECT event_id, payload_hash FROM session_events WHERE operation_id = ?")
      .get(event.operationId);
    if (racedOperation) {
      if (String(racedOperation.payload_hash) === event.payloadHash) return "deduped";
      throw new Error("continuation operation intent conflict");
    }
    const raced = db
      .prepare(
        "SELECT event_id, payload_hash FROM session_events WHERE session_id = ? AND event_seq = ?",
      )
      .get(event.sessionId, event.eventSeq);
    if (
      raced &&
      String(raced.event_id) === event.eventId &&
      String(raced.payload_hash) === event.payloadHash
    ) {
      return "deduped";
    }
    throw new Error("sequence_payload_conflict");
  }
  return "inserted";
}

export function rebuildContinuationProjection(
  db: HarnessDb,
  events: readonly ContinuationEvent[],
): { inserted: number; deduped: number } {
  let inserted = 0;
  let deduped = 0;
  for (const event of events) {
    const result = projectContinuationEvent(db, event);
    if (result === "inserted") inserted += 1;
    else deduped += 1;
  }
  return { inserted, deduped };
}

export interface ContinuationMemoryView {
  planId: string | null;
  nextAction: string | null;
  sourceEventSeq: number;
}

export interface ContinuationDbView extends ContinuationMemoryView {
  sessionId: string;
  eventId: string;
  payloadHash: string;
  recordedAt: string;
  memoryRef: string | null;
  provenance: "harness.db:session_events";
}

export interface ContinuationFeedbackView {
  feedbackEventId: string;
  status: string;
}

export function queryContinuationReadModel(
  db: HarnessDb,
  sessionId: string,
): ContinuationDbView | null {
  const row = db
    .prepare(
      "SELECT event_id, event_seq, plan_id, next_action, memory_ref, payload_hash, recorded_at FROM session_events WHERE session_id = ? ORDER BY event_seq DESC LIMIT 1",
    )
    .get(sessionId);
  if (!row) return null;
  return {
    sessionId,
    eventId: String(row.event_id),
    sourceEventSeq: Number(row.event_seq),
    planId: row.plan_id === null ? null : String(row.plan_id),
    nextAction: row.next_action === null ? null : String(row.next_action),
    memoryRef: row.memory_ref === null ? null : String(row.memory_ref),
    payloadHash: String(row.payload_hash),
    recordedAt: String(row.recorded_at),
    provenance: "harness.db:session_events",
  };
}

/** 全sessionの最新continuationをDB provenance付きで返す。file fallbackは持たない。 */
export function queryLatestContinuationReadModel(db: HarnessDb): ContinuationDbView | null {
  const latest = db
    .prepare(
      "SELECT session_id FROM session_events ORDER BY recorded_at DESC, event_seq DESC, event_id DESC LIMIT 1",
    )
    .get();
  return latest ? queryContinuationReadModel(db, String(latest.session_id)) : null;
}

export function joinContinuationReadModel(input: {
  db: ContinuationDbView | null;
  memory: ContinuationMemoryView | null;
  feedback: readonly ContinuationFeedbackView[];
}): {
  continuation: ContinuationDbView | null;
  memoryRef: string | null;
  feedback: ContinuationFeedbackView[];
  findings: string[];
} {
  const precedence = resolveContinuationPrecedence({
    db: input.db,
    memory: input.memory,
  });
  return {
    continuation: input.db,
    memoryRef: input.db?.memoryRef ?? null,
    feedback: [...input.feedback],
    findings: precedence.findings,
  };
}

export function queryContinuationIntegration(input: {
  db: HarnessDb;
  sessionId: string;
  memoryEvents: readonly MemoryEntryV2[];
  now: string;
}): ReturnType<typeof joinContinuationReadModel> {
  const dbView = queryContinuationReadModel(input.db, input.sessionId);
  const memoryState = resolveMemoryView(input.memoryEvents, input.now, "takeover");
  const candidate = memoryState.activeEntries.find(
    (entry) => entry.key === `continuation:${input.sessionId}` && entry.type === "state",
  );
  let memory: ContinuationMemoryView | null = null;
  if (candidate) {
    try {
      const parsed = JSON.parse(candidate.body) as ContinuationMemoryView;
      if (
        (parsed.planId === null || typeof parsed.planId === "string") &&
        (parsed.nextAction === null || typeof parsed.nextAction === "string") &&
        Number.isSafeInteger(parsed.sourceEventSeq)
      ) {
        memory = parsed;
      }
    } catch {
      memory = null;
    }
  }
  const feedback = dbView?.planId
    ? input.db
        .prepare(
          "SELECT f.feedback_event_id, f.status FROM feedback_events f LEFT JOIN feedback_lifecycle l ON l.source_table = f.source_table AND l.source_id = f.source_id WHERE f.plan_id = ? AND (l.lifecycle_key IS NULL OR (l.state = 'open' AND instr(',' || l.surfaced_sessions || ',', ',' || ? || ',') = 0)) ORDER BY f.created_at, f.feedback_event_id",
        )
        .all(dbView.planId, input.sessionId)
        .map((row) => ({
          feedbackEventId: String(row.feedback_event_id),
          status: String(row.status),
        }))
    : [];
  const joined = joinContinuationReadModel({ db: dbView, memory, feedback });
  if (memoryState.damaged > 0 || (candidate && !memory)) {
    joined.findings.push("memory_event_invalid");
  }
  return joined;
}

export function resolveContinuationPrecedence(input: {
  db: ContinuationMemoryView | null;
  memory: ContinuationMemoryView | null;
}): { value: ContinuationMemoryView | null; findings: string[] } {
  if (!input.db)
    return {
      value: null,
      findings: input.memory ? ["db_projection_missing"] : [],
    };
  if (!input.memory) return { value: input.db, findings: ["memory_breadcrumb_missing"] };
  const conflict =
    input.db.planId !== input.memory.planId ||
    input.db.nextAction !== input.memory.nextAction ||
    input.db.sourceEventSeq !== input.memory.sourceEventSeq;
  return { value: input.db, findings: conflict ? ["db_memory_conflict"] : [] };
}

export type DeliveryStatus = "pending" | "delivered" | "acknowledged" | "expired";
export interface DeliveryEvent {
  deliveryId: string;
  entryId: string;
  consumerId: string;
  payloadDigest: string;
  status: DeliveryStatus;
  recordedAt: string;
  retentionUntil: string;
  sourceRetentionUntil: string;
}

export interface DeliveryWriteDeps {
  appendEvent(event: DeliveryEvent): { appended: boolean };
  projectEvent(event: DeliveryEvent): "inserted" | "updated" | "deduped";
}

export interface DeliveryJournalEvent extends DeliveryEvent {
  schemaVersion: 1;
  eventId: string;
  operationId: string;
  eventHash: string;
}

const DELIVERY_TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = {
  pending: ["delivered"],
  delivered: ["acknowledged", "expired"],
  acknowledged: [],
  expired: [],
};

export function buildDeliveryEvent(input: Omit<DeliveryEvent, "deliveryId">): DeliveryEvent {
  requiredNonEmpty(input.entryId, "delivery entry id");
  requiredNonEmpty(input.consumerId, "delivery consumer id");
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.entryId) ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.consumerId)
  ) {
    throw new Error("invalid delivery identity");
  }
  if (!validDigest(input.payloadDigest)) throw new Error("invalid delivery payload digest");
  if (
    !validRfc3339Instant(input.recordedAt) ||
    !input.recordedAt.endsWith("Z") ||
    !validRfc3339Instant(input.retentionUntil) ||
    !input.retentionUntil.endsWith("Z") ||
    Date.parse(input.retentionUntil) < Date.parse(input.recordedAt)
  ) {
    throw new Error("invalid delivery timestamp");
  }
  if (
    !validRfc3339Instant(input.sourceRetentionUntil) ||
    !input.sourceRetentionUntil.endsWith("Z") ||
    Date.parse(input.retentionUntil) < Date.parse(input.sourceRetentionUntil)
  ) {
    throw new Error("delivery retention shorter than source entry");
  }
  return { ...input, deliveryId: `${input.entryId}:${input.consumerId}` };
}

export function buildDeliveryJournalEvent(input: {
  eventId: string;
  operationId: string;
  delivery: DeliveryEvent;
}): DeliveryJournalEvent {
  requiredNonEmpty(input.eventId, "delivery event id");
  requiredNonEmpty(input.operationId, "delivery operation id");
  return {
    schemaVersion: 1,
    eventId: input.eventId,
    operationId: input.operationId,
    ...input.delivery,
    eventHash: sha256(canonicalJson(input.delivery)),
  };
}

export function parseDeliveryJournalLine(line: string): DeliveryJournalEvent {
  const raw = JSON.parse(line) as Record<string, unknown>;
  if (raw.schemaVersion !== 1) throw new Error("invalid delivery journal schema version");
  const delivery = buildDeliveryEvent({
    entryId: requiredString(raw, "entryId"),
    consumerId: requiredString(raw, "consumerId"),
    payloadDigest: requiredDigest(raw, "payloadDigest"),
    status: requiredString(raw, "status") as DeliveryStatus,
    recordedAt: requiredString(raw, "recordedAt"),
    retentionUntil: requiredString(raw, "retentionUntil"),
    sourceRetentionUntil: requiredString(raw, "sourceRetentionUntil"),
  });
  if (!Object.hasOwn(DELIVERY_TRANSITIONS, delivery.status)) {
    throw new Error("invalid delivery status");
  }
  const event = buildDeliveryJournalEvent({
    eventId: requiredString(raw, "eventId"),
    operationId: requiredString(raw, "operationId"),
    delivery,
  });
  if (requiredDigest(raw, "eventHash") !== event.eventHash) {
    throw new Error("delivery event hash mismatch");
  }
  if (raw.deliveryId !== event.deliveryId) throw new Error("delivery id mismatch");
  return event;
}

export function parseDeliveryJournal(text: string): DeliveryJournalEvent[] {
  const events = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseDeliveryJournalLine);
  const operations = new Map<string, DeliveryJournalEvent>();
  for (const event of events) {
    const prior = operations.get(event.operationId);
    if (prior && prior.eventHash !== event.eventHash) {
      throw new Error("delivery operation intent conflict");
    }
    operations.set(event.operationId, event);
  }
  return events;
}

export function appendDeliveryJournalFile(
  path: string,
  event: DeliveryJournalEvent,
  coordinationDb: HarnessDb,
): { appended: boolean } {
  return withContinuationFence(
    {
      db: coordinationDb,
      scope: "delivery-journal",
      owner: event.operationId,
      acquiredAt: event.recordedAt,
    },
    () => appendDeliveryJournalFileLocked(path, event),
  );
}

function appendDeliveryJournalFileLocked(
  path: string,
  event: DeliveryJournalEvent,
): { appended: boolean } {
  parseDeliveryJournalLine(JSON.stringify(event));
  let existing = "";
  try {
    existing = readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const events = existing.length > 0 ? parseDeliveryJournal(existing) : [];
  const sameOperation = events.find((candidate) => candidate.operationId === event.operationId);
  if (sameOperation) {
    if (sameOperation.eventHash !== event.eventHash) {
      throw new Error("delivery operation intent conflict");
    }
    return { appended: false };
  }
  const line = `${JSON.stringify(event)}\n`;
  const handle = openSync(path, "a");
  try {
    const bytes = Buffer.from(line);
    let written = 0;
    while (written < bytes.length) written += writeSync(handle, bytes, written);
    fsyncSync(handle);
  } finally {
    closeSync(handle);
  }
  return { appended: true };
}

/** append-only delivery eventを先にdurable化し、成功した場合だけreceiptへ投影する。 */
export function writeDeliveryEvent(
  event: DeliveryEvent,
  deps: DeliveryWriteDeps,
): { ok: boolean; appended: boolean; projected: boolean; reason?: string } {
  let appended: boolean;
  try {
    appended = deps.appendEvent(event).appended;
  } catch {
    return {
      ok: false,
      appended: false,
      projected: false,
      reason: "delivery_append_failed",
    };
  }
  try {
    deps.projectEvent(event);
    return { ok: true, appended, projected: true };
  } catch (error) {
    return {
      ok: false,
      appended,
      projected: false,
      reason: error instanceof Error ? error.message : "delivery_projection_failed",
    };
  }
}

export function projectDeliveryEvent(
  db: HarnessDb,
  event: DeliveryEvent,
): "inserted" | "updated" | "deduped" {
  const current = db
    .prepare(
      "SELECT entry_id, consumer_id, payload_digest, status, recorded_at, retention_until, source_retention_until FROM delivery_receipts WHERE delivery_id = ?",
    )
    .get(event.deliveryId);
  if (!current) {
    if (event.status !== "pending") throw new Error("delivery_transition_invalid");
    try {
      db.prepare(
        "INSERT INTO delivery_receipts (delivery_id, entry_id, consumer_id, payload_digest, status, recorded_at, retention_until, source_retention_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        event.deliveryId,
        event.entryId,
        event.consumerId,
        event.payloadDigest,
        event.status,
        event.recordedAt,
        event.retentionUntil,
        event.sourceRetentionUntil,
      );
    } catch {
      const raced = db
        .prepare(
          "SELECT entry_id, consumer_id, payload_digest, status FROM delivery_receipts WHERE delivery_id = ?",
        )
        .get(event.deliveryId);
      if (
        raced &&
        String(raced.entry_id) === event.entryId &&
        String(raced.consumer_id) === event.consumerId &&
        String(raced.payload_digest) === event.payloadDigest &&
        String(raced.status) === event.status
      ) {
        return "deduped";
      }
      throw new Error("delivery_payload_conflict");
    }
    return "inserted";
  }
  if (
    String(current.entry_id) !== event.entryId ||
    String(current.consumer_id) !== event.consumerId ||
    String(current.payload_digest) !== event.payloadDigest ||
    String(current.source_retention_until) !== event.sourceRetentionUntil
  )
    throw new Error("delivery_payload_conflict");
  const status = String(current.status) as DeliveryStatus;
  if (
    Date.parse(event.recordedAt) < Date.parse(String(current.recorded_at)) ||
    Date.parse(event.retentionUntil) < Date.parse(String(current.retention_until))
  ) {
    throw new Error("delivery_time_or_retention_regression");
  }
  if (status === event.status) return "deduped";
  if (!DELIVERY_TRANSITIONS[status]?.includes(event.status))
    throw new Error("delivery_transition_invalid");
  const mutation = db
    .prepare(
      "UPDATE delivery_receipts SET status = ?, recorded_at = ?, retention_until = ? WHERE delivery_id = ? AND status = ? AND payload_digest = ?",
    )
    .run(
      event.status,
      event.recordedAt,
      event.retentionUntil,
      event.deliveryId,
      status,
      event.payloadDigest,
    );
  const updated = db
    .prepare("SELECT status, payload_digest FROM delivery_receipts WHERE delivery_id = ?")
    .get(event.deliveryId);
  if (
    mutation.changes === 1 &&
    updated &&
    String(updated.status) === event.status &&
    String(updated.payload_digest) === event.payloadDigest
  ) {
    return "updated";
  }
  if (
    updated &&
    String(updated.status) === event.status &&
    String(updated.payload_digest) === event.payloadDigest
  ) {
    return "deduped";
  }
  throw new Error("delivery_transition_conflict");
}

export function rebuildDeliveryReceipts(
  db: HarnessDb,
  events: readonly DeliveryEvent[],
): { inserted: number; updated: number; deduped: number } {
  const result = { inserted: 0, updated: 0, deduped: 0 };
  for (const event of events) result[projectDeliveryEvent(db, event)] += 1;
  return result;
}
