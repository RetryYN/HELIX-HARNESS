import { createHash } from "node:crypto";

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
  return { ok: reasons.length === 0, replay: false, reasons: [...new Set(reasons)] };
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
