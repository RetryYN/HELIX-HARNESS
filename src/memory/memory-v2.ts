import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { type HarnessDb, isSecretLike, openHarnessDb } from "../state-db";

export const MEMORY_V2_SCHEMA_VERSION = 2 as const;
export const TAKEOVER_MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type MemoryLayerV2 = "harness" | "project" | "takeover";
export type MemoryType = "decision" | "constraint" | "feedback" | "state" | "reference";
export type MemoryLifecycleState = "active" | "consumed" | "expired";
export type MemoryRuntime = "claude" | "codex" | "human" | "system";

export interface MemoryEntryV2 {
  schemaVersion: typeof MEMORY_V2_SCHEMA_VERSION;
  id: string;
  layer: MemoryLayerV2;
  key: string;
  body: string;
  type: MemoryType;
  provenance: {
    planId: string | null;
    sessionId: string | null;
    runtime: MemoryRuntime;
    origin: string;
  };
  lifecycle: {
    state: MemoryLifecycleState;
    expiresAt: string | null;
    consumedAt: string | null;
    consumedBy: string | null;
  };
  links: string[];
  supersedes: string | null;
  createdAt: string;
}

export interface WriteMemoryV2Input {
  /** retry/crash recoveryを同一論理writeへ束縛するcaller生成id。 */
  operationId: string;
  layer: MemoryLayerV2;
  key: string;
  body: string;
  type?: MemoryType;
  provenance?: Partial<MemoryEntryV2["provenance"]>;
  expiresAt?: string | null;
  links?: string[];
  dryRun?: boolean;
}

export type MemoryV2Diagnostic =
  | "session_event_persist_failed"
  | "coordination_commit_unknown_recovered"
  | "idempotent_replay"
  | "unresolved_link"
  | "damaged_event";

export type WriteMemoryV2Result =
  | { ok: true; entry: MemoryEntryV2; diagnostics: MemoryV2Diagnostic[] }
  | { ok: false; reason: string; field?: string };

export interface MemoryViewV2 {
  activeEntries: MemoryEntryV2[];
  tombstones: MemoryEntryV2[];
  damaged: number;
  unresolvedLinks: Array<{ entryId: string; link: string }>;
}

export interface SurfaceMemoryV2Input {
  layers?: MemoryLayerV2[];
  maxEntries?: number;
  maxChars?: number;
  maxBodyChars?: number;
  perTypeMin?: number;
  now?: string;
}

export interface SurfaceMemoryV2Result {
  lines: string[];
  selectedIds: string[];
  hidden: Record<MemoryLayerV2, Partial<Record<MemoryType, number>>>;
  lifecycle: { consumed: number; expired: number; damaged: number };
}

export interface ConsumeResult {
  id: string;
  reason:
    | "consumed"
    | "already_consumed"
    | "unknown_id"
    | "expired"
    | "wrong_layer"
    | "persist_failed";
}

export interface MemoryDepsV2 {
  now(): string;
  isSecret(value: string): boolean;
  stableId(layer: MemoryLayerV2, key: string, createdAt: string): string;
  readEvents(layer: MemoryLayerV2): unknown[];
  withLayerLock<T>(layer: MemoryLayerV2, owner: string, fn: (fence: number) => T): T;
  appendEvent(layer: MemoryLayerV2, entry: MemoryEntryV2, fence: number): void;
  replaceEvents(layer: MemoryLayerV2, entries: MemoryEntryV2[], fence: number): void;
  writeSessionEvent(event: {
    eventId: string;
    type: "memory_write";
    entryId: string;
    layer: MemoryLayerV2;
    memoryType: MemoryType;
    key: string;
  }): void;
  writeOutput(lines: string[]): void;
}

type NormalizeResult =
  | { ok: true; entry: MemoryEntryV2 }
  | { ok: false; reason: "parse_error" | "schema_invalid" | "layer_mismatch" };

const LAYERS: readonly MemoryLayerV2[] = ["harness", "project", "takeover"];
const TYPES: readonly MemoryType[] = ["decision", "constraint", "feedback", "state", "reference"];
const RUNTIMES: readonly MemoryRuntime[] = ["claude", "codex", "human", "system"];
const STATES: readonly MemoryLifecycleState[] = ["active", "consumed", "expired"];
const LAYER_PRIORITY: readonly MemoryLayerV2[] = ["takeover", "harness", "project"];
const TYPE_PRIORITY: readonly MemoryType[] = [
  "constraint",
  "decision",
  "state",
  "feedback",
  "reference",
];

export function normalizeMemoryEntry(raw: unknown, expectedLayer?: MemoryLayerV2): NormalizeResult {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return { ok: false, reason: "parse_error" };
    }
  }
  if (!isRecord(value)) return { ok: false, reason: "schema_invalid" };
  if (!LAYERS.includes(value.layer as MemoryLayerV2)) {
    return { ok: false, reason: "schema_invalid" };
  }
  if (expectedLayer && value.layer !== expectedLayer) {
    return { ok: false, reason: "layer_mismatch" };
  }
  if (value.schemaVersion === undefined) return normalizeV1(value);
  if (value.schemaVersion !== MEMORY_V2_SCHEMA_VERSION) {
    return { ok: false, reason: "schema_invalid" };
  }
  if (!validV2Shape(value)) return { ok: false, reason: "schema_invalid" };
  return { ok: true, entry: value as unknown as MemoryEntryV2 };
}

export function validateMemoryEntry(
  input: WriteMemoryV2Input,
  now: string,
  isSecret: (value: string) => boolean,
): { ok: true } | { ok: false; reason: string; field: string } {
  if (!LAYERS.includes(input.layer)) return invalid("unknown_layer", "layer");
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input.operationId)) {
    return invalid("invalid_operation_id", "operationId");
  }
  if (!input.key.trim()) return invalid("empty_key", "key");
  const type = input.type ?? "reference";
  if (!TYPES.includes(type)) return invalid("unknown_type", "type");
  const runtime = input.provenance?.runtime ?? "system";
  if (!RUNTIMES.includes(runtime)) return invalid("unknown_runtime", "provenance.runtime");
  if ((input.provenance?.origin ?? "memory-v2").trim() === "") {
    return invalid("empty_origin", "provenance.origin");
  }
  const links = input.links ?? [];
  if (new Set(links).size !== links.length) return invalid("duplicate_link", "links");
  if (links.some((link) => !/^(harness|project|takeover):[^:\s]+$/.test(link))) {
    return invalid("invalid_link", "links");
  }
  const metadata = JSON.stringify({ key: input.key, provenance: input.provenance, links });
  if (isSecret(input.body) || isSecret(metadata)) return invalid("secret_like", "body_or_metadata");
  if (input.layer === "takeover") {
    if (!(["decision", "constraint", "state"] as MemoryType[]).includes(type)) {
      return invalid("takeover_type_not_allowed", "type");
    }
    if (!input.expiresAt) return invalid("takeover_expiry_required", "expiresAt");
    const nowMs = Date.parse(now);
    const expiryMs = Date.parse(input.expiresAt);
    if (!isIsoUtc(input.expiresAt)) return invalid("invalid_expiry", "expiresAt");
    if (expiryMs <= nowMs) return invalid("expiry_not_future", "expiresAt");
    if (expiryMs - nowMs > TAKEOVER_MAX_TTL_MS)
      return invalid("expiry_exceeds_policy", "expiresAt");
  } else if (input.expiresAt && !isIsoUtc(input.expiresAt)) {
    return invalid("invalid_expiry", "expiresAt");
  }
  return { ok: true };
}

export function resolveMemoryView(
  rawEvents: readonly unknown[],
  now: string,
  expectedLayer?: MemoryLayerV2,
): MemoryViewV2 {
  const entries: MemoryEntryV2[] = [];
  let damaged = 0;
  for (const raw of rawEvents) {
    const normalized = normalizeMemoryEntry(raw, expectedLayer);
    if (normalized.ok) entries.push(normalized.entry);
    else damaged += 1;
  }
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const invalidIds = detectInvalidSupersedeGraph(entries, byId);
  damaged += invalidIds.size;
  const validEntries = entries.filter((entry) => !invalidIds.has(entry.id));
  const superseded = new Set(
    validEntries.map((entry) => entry.supersedes).filter((id): id is string => id !== null),
  );
  const tombstones = validEntries
    .filter((entry) => entry.lifecycle.state !== "active" && !superseded.has(entry.id))
    .sort(compareEntries);
  const activeEntries = validEntries
    .filter(
      (entry) =>
        entry.lifecycle.state === "active" && !superseded.has(entry.id) && !isExpired(entry, now),
    )
    .sort(compareEntries);
  const knownKeys = new Set(validEntries.map((entry) => `${entry.layer}:${entry.key}`));
  const unresolvedLinks = activeEntries.flatMap((entry) =>
    entry.links.filter((link) => !knownKeys.has(link)).map((link) => ({ entryId: entry.id, link })),
  );
  return { activeEntries, tombstones, damaged, unresolvedLinks };
}

export function writeMemoryV2(input: WriteMemoryV2Input, deps: MemoryDepsV2): WriteMemoryV2Result {
  const now = deps.now();
  const validation = validateMemoryEntry(input, now, deps.isSecret);
  if (!validation.ok) return { ok: false, reason: validation.reason, field: validation.field };
  if (input.dryRun) return { ok: false, reason: "dry_run" };
  const expectedId = `${input.layer}:${input.key}:op:${input.operationId}`;
  let entry: MemoryEntryV2;
  let appended = false;
  let recovered = false;
  try {
    entry = deps.withLayerLock(input.layer, `write:${input.key}`, (fence) => {
      const rawEvents = deps.readEvents(input.layer);
      const normalized = rawEvents.flatMap((event) => {
        const result = normalizeMemoryEntry(event, input.layer);
        return result.ok ? [result.entry] : [];
      });
      const existing = normalized.find((candidate) => candidate.id === expectedId);
      if (existing) {
        if (!sameWriteIntent(existing, input)) throw new Error("operation_id_conflict");
        return existing;
      }
      const view = resolveMemoryView(rawEvents, now, input.layer);
      const previous = [...view.activeEntries]
        .filter((candidate) => candidate.key === input.key)
        .sort(compareEntries)
        .at(-1);
      const type = input.type ?? "reference";
      const created: MemoryEntryV2 = {
        schemaVersion: MEMORY_V2_SCHEMA_VERSION,
        id: expectedId,
        layer: input.layer,
        key: input.key,
        body: input.body,
        type,
        provenance: {
          planId: input.provenance?.planId ?? null,
          sessionId: input.provenance?.sessionId ?? null,
          runtime: input.provenance?.runtime ?? "system",
          origin: input.provenance?.origin ?? "memory-v2",
        },
        lifecycle: {
          state: "active",
          expiresAt: input.expiresAt ?? null,
          consumedAt: null,
          consumedBy: null,
        },
        links: [...(input.links ?? [])],
        supersedes: previous?.id ?? null,
        createdAt: now,
      };
      deps.appendEvent(input.layer, created, fence);
      appended = true;
      return created;
    });
  } catch (error) {
    const existing = deps
      .readEvents(input.layer)
      .flatMap((event) => {
        const result = normalizeMemoryEntry(event, input.layer);
        return result.ok ? [result.entry] : [];
      })
      .find((candidate) => candidate.id === expectedId && sameWriteIntent(candidate, input));
    if (!existing) return { ok: false, reason: errorMessage(error) };
    entry = existing;
    recovered = true;
  }
  const diagnostics: MemoryV2Diagnostic[] = [];
  if (recovered) diagnostics.push("coordination_commit_unknown_recovered");
  if (!appended && !recovered) diagnostics.push("idempotent_replay");
  try {
    deps.writeSessionEvent({
      eventId: `memory-write:${entry.id}`,
      type: "memory_write",
      entryId: entry.id,
      layer: entry.layer,
      memoryType: entry.type,
      key: entry.key,
    });
  } catch {
    diagnostics.push("session_event_persist_failed");
  }
  return { ok: true, entry, diagnostics };
}

export function expireMemory(
  layer: MemoryLayerV2,
  now: string,
  deps: MemoryDepsV2,
): Array<{ id: string; reason: "expired" | "already_expired" | "persist_failed" }> {
  try {
    return deps.withLayerLock(layer, `expire:${layer}`, (fence) => {
      const raw = deps.readEvents(layer);
      const normalized = raw.flatMap((event) => {
        const result = normalizeMemoryEntry(event, layer);
        return result.ok ? [result.entry] : [];
      });
      const terminalTargets = new Set(
        normalized
          .filter((entry) => entry.lifecycle.state !== "active")
          .map((entry) => entry.supersedes)
          .filter((id): id is string => id !== null),
      );
      const superseded = new Set(
        normalized.map((entry) => entry.supersedes).filter((id): id is string => id !== null),
      );
      const candidates = normalized.filter(
        (entry) =>
          entry.lifecycle.state === "active" && !superseded.has(entry.id) && isExpired(entry, now),
      );
      return candidates.map((entry) => {
        if (terminalTargets.has(entry.id))
          return { id: entry.id, reason: "already_expired" as const };
        deps.appendEvent(layer, terminalEntry(entry, "expired", now, null), fence);
        return { id: entry.id, reason: "expired" as const };
      });
    });
  } catch {
    return [{ id: layer, reason: "persist_failed" }];
  }
}

export function consumeTakeover(
  ids: readonly string[],
  consumerId: string,
  deps: MemoryDepsV2,
): ConsumeResult[] {
  try {
    return deps.withLayerLock("takeover", `consume:${consumerId}`, (fence) => {
      const events = LAYERS.flatMap((layer) => deps.readEvents(layer));
      const normalized = events.flatMap((event) => {
        const result = normalizeMemoryEntry(event);
        return result.ok ? [result.entry] : [];
      });
      const byId = new Map(normalized.map((entry) => [entry.id, entry]));
      const terminalTargets = new Map(
        normalized.flatMap((entry) =>
          entry.lifecycle.state !== "active" && entry.supersedes
            ? ([[entry.supersedes, entry.lifecycle.state]] as const)
            : [],
        ),
      );
      const activeIds = new Set(
        resolveMemoryView(deps.readEvents("takeover"), deps.now(), "takeover").activeEntries.map(
          (entry) => entry.id,
        ),
      );
      const now = deps.now();
      return ids.map((id): ConsumeResult => {
        const entry = byId.get(id);
        if (!entry) return { id, reason: "unknown_id" };
        if (entry.layer !== "takeover") return { id, reason: "wrong_layer" };
        if (terminalTargets.get(id) === "expired") return { id, reason: "expired" };
        if (terminalTargets.get(id) === "consumed") return { id, reason: "already_consumed" };
        if (isExpired(entry, now)) return { id, reason: "expired" };
        if (!activeIds.has(id)) return { id, reason: "unknown_id" };
        deps.appendEvent("takeover", terminalEntry(entry, "consumed", now, consumerId), fence);
        terminalTargets.set(id, "consumed");
        return { id, reason: "consumed" };
      });
    });
  } catch {
    return ids.map((id) => ({ id, reason: "persist_failed" }));
  }
}

export function surfaceMemoryV2(
  input: SurfaceMemoryV2Input,
  deps: Pick<MemoryDepsV2, "now" | "readEvents">,
): SurfaceMemoryV2Result {
  const maxEntries = validatedBudget(input.maxEntries, 12, "maxEntries");
  const maxChars = validatedBudget(input.maxChars, 0, "maxChars");
  const maxBodyChars = validatedBudget(input.maxBodyChars, 240, "maxBodyChars");
  const perTypeMin = validatedBudget(input.perTypeMin, 1, "perTypeMin");
  if (perTypeMin === 0) throw new Error("invalid_perTypeMin");
  const now = input.now ?? deps.now();
  const requestedLayers = input.layers ?? [...LAYER_PRIORITY];
  if (requestedLayers.some((layer) => !LAYERS.includes(layer))) {
    throw new Error("invalid_layers");
  }
  const layers = [...new Set(requestedLayers)];
  const views = new Map(
    layers.map((layer) => [layer, resolveMemoryView(deps.readEvents(layer), now, layer)]),
  );
  const candidates = selectRoundRobin(
    layers.flatMap((layer) => views.get(layer)?.activeEntries ?? []),
    perTypeMin,
  );
  const lifecycle = { consumed: 0, expired: 0, damaged: 0 };
  for (const view of views.values()) {
    lifecycle.consumed += view.tombstones.filter(
      (entry) => entry.lifecycle.state === "consumed",
    ).length;
    lifecycle.expired += view.tombstones.filter(
      (entry) => entry.lifecycle.state === "expired",
    ).length;
    lifecycle.damaged += view.damaged;
  }
  const selected = maxEntries === 0 ? [...candidates] : candidates.slice(0, maxEntries);
  const hidden = emptyHidden();
  for (const entry of candidates.slice(selected.length)) addHidden(hidden, entry);
  const lines = selected.map((entry) => renderEntry(entry, maxBodyChars));
  const selectedIds = selected.map((entry) => entry.id);
  if (maxChars > 0) {
    while (selectedIds.length > 0) {
      const preview = [...lines, ...renderBreadcrumbs(hidden, lifecycle)];
      if (codePointLength(preview.join("\n")) <= maxChars) break;
      const removed = selected.pop();
      lines.pop();
      selectedIds.pop();
      if (removed) addHidden(hidden, removed);
    }
  }
  const breadcrumbs = renderBreadcrumbs(hidden, lifecycle);
  if (
    maxChars > 0 &&
    breadcrumbs.length > 0 &&
    codePointLength(breadcrumbs.join("\n")) > maxChars
  ) {
    throw new Error("maxChars_too_small_for_breadcrumb");
  }
  if (maxChars === 0 || codePointLength([...lines, ...breadcrumbs].join("\n")) <= maxChars) {
    lines.push(...breadcrumbs);
  }
  return { lines, selectedIds, hidden, lifecycle };
}

export function deliverTakeover(
  input: SurfaceMemoryV2Input & { consumerId: string },
  deps: MemoryDepsV2,
): { status: "delivered" | "output_failed" | "delivered_with_retry_required"; ids: string[] } {
  const now = input.now ?? deps.now();
  expireMemory("takeover", now, deps);
  const result = surfaceMemoryV2({ ...input, layers: ["takeover"], now }, deps);
  try {
    deps.writeOutput(result.lines);
  } catch {
    return { status: "output_failed", ids: result.selectedIds };
  }
  const consumed = consumeTakeover(result.selectedIds, input.consumerId, deps);
  return {
    status: consumed.some((item) => item.reason === "persist_failed")
      ? "delivered_with_retry_required"
      : "delivered",
    ids: result.selectedIds,
  };
}

export function compactMemoryV2(
  layer: MemoryLayerV2,
  deps: MemoryDepsV2,
): { applied: boolean; kept: number; removed: number; damaged: number } {
  expireMemory(layer, deps.now(), deps);
  return deps.withLayerLock(layer, `compact:${layer}`, (fence) => {
    const raw = deps.readEvents(layer);
    const before = resolveMemoryView(raw, deps.now(), layer);
    const kept = [...before.activeEntries, ...latestTombstones(before.tombstones)].sort(
      compareEntries,
    );
    const beforeDigest = observableDigest(before);
    const after = resolveMemoryView(kept, deps.now(), layer);
    if (beforeDigest !== observableDigest(after)) throw new Error("memory_v2_observable_drift");
    deps.replaceEvents(layer, kept, fence);
    return {
      applied: true,
      kept: kept.length,
      removed: raw.length - kept.length,
      damaged: before.damaged,
    };
  });
}

export function nodeMemoryV2Deps(opts: {
  root: string;
  now?: () => string;
  owner?: string;
  writeSessionEvent?: MemoryDepsV2["writeSessionEvent"];
  writeOutput?: MemoryDepsV2["writeOutput"];
  /** deterministic concurrency fixture hook; production callers omit. */
  onLockAcquired?: (layer: MemoryLayerV2, fence: number) => void;
}): MemoryDepsV2 {
  const memoryDir = join(opts.root, ".helix", "memory");
  const coordinationPath = join(memoryDir, "coordination.sqlite");
  const now = opts.now ?? (() => new Date().toISOString());
  const pathFor = (layer: MemoryLayerV2) => join(memoryDir, `${layer}.jsonl`);
  const activeLocks = new Map<MemoryLayerV2, { db: HarnessDb; fence: number }>();
  const assertFence = (layer: MemoryLayerV2, fence: number) => {
    const active = activeLocks.get(layer);
    const row = active?.db
      .prepare("SELECT fence_token FROM memory_layer_fences WHERE layer = ?")
      .get(layer);
    if (!active || active.fence !== fence || row?.fence_token !== fence) {
      throw new Error("stale_fencing_token");
    }
  };
  return {
    now,
    isSecret: isSecretLike,
    stableId: (layer, key, createdAt) => `${layer}:${key}:${createdAt}`,
    readEvents: (layer) => readJsonLines(pathFor(layer)),
    withLayerLock: (layer, owner, fn) => {
      mkdirSync(memoryDir, { recursive: true });
      const db = openHarnessDb(coordinationPath, { repoRoot: opts.root });
      db.exec("PRAGMA journal_mode = WAL");
      db.exec("PRAGMA busy_timeout = 5000");
      db.exec(
        "CREATE TABLE IF NOT EXISTS memory_layer_fences (layer TEXT PRIMARY KEY, fence_token INTEGER NOT NULL, owner TEXT NOT NULL, acquired_at TEXT NOT NULL)",
      );
      try {
        db.exec("BEGIN IMMEDIATE");
        db.prepare(
          "INSERT INTO memory_layer_fences(layer, fence_token, owner, acquired_at) VALUES (?, 1, ?, ?) ON CONFLICT(layer) DO UPDATE SET fence_token = fence_token + 1, owner = excluded.owner, acquired_at = excluded.acquired_at",
        ).run(layer, owner || opts.owner || "memory-v2", now());
        const row = db
          .prepare("SELECT fence_token FROM memory_layer_fences WHERE layer = ?")
          .get(layer);
        if (!row) throw new Error("memory_fence_missing");
        const fence = Number(row.fence_token);
        activeLocks.set(layer, { db, fence });
        opts.onLockAcquired?.(layer, fence);
        const result = fn(fence);
        db.exec("COMMIT");
        return result;
      } catch (error) {
        try {
          db.exec("ROLLBACK");
        } catch {
          // transaction may not have started; preserve the original error
        }
        throw error;
      } finally {
        activeLocks.delete(layer);
        db.close();
      }
    },
    appendEvent: (layer, entry, fence) => {
      assertFence(layer, fence);
      mkdirSync(memoryDir, { recursive: true });
      const fd = openSync(pathFor(layer), "a");
      try {
        writeAllBytes(fd, Buffer.from(`${JSON.stringify(entry)}\n`, "utf8"));
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    },
    replaceEvents: (layer, entries, fence) => {
      assertFence(layer, fence);
      mkdirSync(memoryDir, { recursive: true });
      const target = pathFor(layer);
      const temp = `${target}.tmp-${fence}`;
      writeFileSync(
        temp,
        entries.length ? `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n` : "",
        "utf8",
      );
      const fd = openSync(temp, "r");
      try {
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      assertFence(layer, fence);
      renameSync(temp, target);
      const dirFd = openSync(dirname(target), "r");
      try {
        try {
          fsyncSync(dirFd);
        } catch (error) {
          if (!isUnsupportedDirectorySync(error)) throw error;
        }
      } finally {
        closeSync(dirFd);
      }
    },
    writeSessionEvent: opts.writeSessionEvent ?? (() => undefined),
    writeOutput: opts.writeOutput ?? (() => undefined),
  };
}

function normalizeV1(value: Record<string, unknown>): NormalizeResult {
  if (
    typeof value.id !== "string" ||
    typeof value.key !== "string" ||
    typeof value.body !== "string" ||
    typeof value.createdAt !== "string" ||
    (value.supersedes !== null && typeof value.supersedes !== "string")
  ) {
    return { ok: false, reason: "schema_invalid" };
  }
  return {
    ok: true,
    entry: {
      schemaVersion: MEMORY_V2_SCHEMA_VERSION,
      id: value.id,
      layer: value.layer as MemoryLayerV2,
      key: value.key,
      body: value.body,
      type: "reference",
      provenance: { planId: null, sessionId: null, runtime: "system", origin: "legacy-v1" },
      lifecycle: { state: "active", expiresAt: null, consumedAt: null, consumedBy: null },
      links: [],
      supersedes: value.supersedes,
      createdAt: value.createdAt,
    },
  };
}

function validV2Shape(value: Record<string, unknown>): boolean {
  const createdAtMs = Date.parse(String(value.createdAt));
  if (
    typeof value.id !== "string" ||
    typeof value.key !== "string" ||
    typeof value.body !== "string" ||
    typeof value.createdAt !== "string" ||
    !isIsoUtc(String(value.createdAt)) ||
    !TYPES.includes(value.type as MemoryType) ||
    !Array.isArray(value.links) ||
    value.links.some((link) => typeof link !== "string") ||
    (value.supersedes !== null && typeof value.supersedes !== "string") ||
    !isRecord(value.provenance) ||
    !isRecord(value.lifecycle)
  ) {
    return false;
  }
  const provenance = value.provenance;
  const lifecycle = value.lifecycle;
  const links = value.links as unknown[];
  if (isSecretLike(JSON.stringify({ body: value.body, key: value.key, provenance, links }))) {
    return false;
  }
  if (
    (provenance.planId !== null && typeof provenance.planId !== "string") ||
    (provenance.sessionId !== null && typeof provenance.sessionId !== "string") ||
    !RUNTIMES.includes(provenance.runtime as MemoryRuntime) ||
    typeof provenance.origin !== "string" ||
    !provenance.origin.trim() ||
    new Set(links).size !== links.length ||
    links.some(
      (link) => typeof link !== "string" || !/^(harness|project|takeover):[^:\s]+$/.test(link),
    ) ||
    !STATES.includes(lifecycle.state as MemoryLifecycleState) ||
    (lifecycle.expiresAt !== null && typeof lifecycle.expiresAt !== "string") ||
    (lifecycle.consumedAt !== null && typeof lifecycle.consumedAt !== "string") ||
    (lifecycle.consumedBy !== null && typeof lifecycle.consumedBy !== "string")
  ) {
    return false;
  }
  if (
    (lifecycle.expiresAt !== null && !isIsoUtc(String(lifecycle.expiresAt))) ||
    (lifecycle.consumedAt !== null && !isIsoUtc(String(lifecycle.consumedAt)))
  ) {
    return false;
  }
  if (
    value.layer === "takeover" &&
    lifecycle.state === "active" &&
    (!(["decision", "constraint", "state"] as MemoryType[]).includes(value.type as MemoryType) ||
      typeof lifecycle.expiresAt !== "string")
  ) {
    return false;
  }
  if (value.layer === "takeover" && lifecycle.state === "active") {
    const expiryMs = Date.parse(String(lifecycle.expiresAt));
    if (expiryMs <= createdAtMs || expiryMs - createdAtMs > TAKEOVER_MAX_TTL_MS) return false;
  }
  if (
    lifecycle.state === "consumed" &&
    (typeof lifecycle.consumedAt !== "string" || typeof lifecycle.consumedBy !== "string")
  ) {
    return false;
  }
  if (
    lifecycle.state !== "consumed" &&
    (lifecycle.consumedAt !== null || lifecycle.consumedBy !== null)
  ) {
    return false;
  }
  if (lifecycle.state !== "active") {
    if (typeof value.supersedes !== "string" || value.body !== "") return false;
    const expectedId =
      lifecycle.state === "consumed"
        ? `takeover-consumed:${value.supersedes}`
        : `memory-expired:${value.supersedes}`;
    if (value.id !== expectedId) return false;
  }
  return lifecycle.state !== "expired" || typeof lifecycle.expiresAt === "string";
}

function detectInvalidSupersedeGraph(
  entries: readonly MemoryEntryV2[],
  byId: ReadonlyMap<string, MemoryEntryV2>,
): Set<string> {
  const invalid = new Set<string>();
  for (const entry of entries) {
    const seen = new Set<string>();
    let current: MemoryEntryV2 | undefined = entry;
    while (current?.supersedes) {
      if (seen.has(current.id)) {
        for (const id of seen) invalid.add(id);
        invalid.add(entry.id);
        break;
      }
      seen.add(current.id);
      const next = byId.get(current.supersedes);
      // compaction後のactive eventは物理除去済みpredecessor idを保持できる。未知参照はchain終端。
      if (!next) break;
      current = next;
    }
  }
  return invalid;
}

function terminalEntry(
  target: MemoryEntryV2,
  state: "consumed" | "expired",
  at: string,
  consumerId: string | null,
): MemoryEntryV2 {
  return {
    ...target,
    id: state === "consumed" ? `takeover-consumed:${target.id}` : `memory-expired:${target.id}`,
    body: "",
    lifecycle: {
      state,
      expiresAt: target.lifecycle.expiresAt,
      consumedAt: state === "consumed" ? at : null,
      consumedBy: state === "consumed" ? consumerId : null,
    },
    supersedes: target.id,
    createdAt: at,
  };
}

function selectRoundRobin(entries: readonly MemoryEntryV2[], perTypeMin: number): MemoryEntryV2[] {
  const buckets = new Map<string, MemoryEntryV2[]>();
  for (const entry of entries) {
    const key = `${entry.layer}:${entry.type}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(entry);
    buckets.set(key, bucket);
  }
  for (const bucket of buckets.values()) bucket.sort(compareEntriesDesc);
  const orderedKeys = [...buckets.keys()].sort(
    (a, b) => groupRank(a) - groupRank(b) || a.localeCompare(b),
  );
  const selected: MemoryEntryV2[] = [];
  const initialRounds = Math.max(1, perTypeMin);
  for (let round = 0; round < initialRounds; round += 1) {
    for (const key of orderedKeys) {
      const entry = buckets.get(key)?.shift();
      if (entry) selected.push(entry);
    }
  }
  while ([...buckets.values()].some((bucket) => bucket.length > 0)) {
    for (const key of orderedKeys) {
      const entry = buckets.get(key)?.shift();
      if (entry) selected.push(entry);
    }
  }
  return selected;
}

function renderEntry(entry: MemoryEntryV2, maxBodyChars: number): string {
  const body = singleLine(entry.body);
  const clipped = maxBodyChars === 0 ? body : clipCodePoints(body, maxBodyChars);
  return `- [${entry.layer}:${entry.type}:${entry.key}#${entry.id}] ${clipped}`;
}

function renderBreadcrumbs(
  hidden: SurfaceMemoryV2Result["hidden"],
  lifecycle: SurfaceMemoryV2Result["lifecycle"],
): string[] {
  const hiddenParts = LAYER_PRIORITY.flatMap((layer) =>
    TYPE_PRIORITY.flatMap((type) => {
      const count = hidden[layer][type] ?? 0;
      return count > 0 ? [`${layer}:${type}=${count}`] : [];
    }),
  );
  const lines = hiddenParts.length ? [`- hidden: ${hiddenParts.join(" ")}`] : [];
  if (lifecycle.consumed || lifecycle.expired || lifecycle.damaged) {
    lines.push(
      `- lifecycle: consumed=${lifecycle.consumed} expired=${lifecycle.expired} damaged=${lifecycle.damaged}`,
    );
  }
  return lines;
}

function latestTombstones(entries: readonly MemoryEntryV2[]): MemoryEntryV2[] {
  const latest = new Map<string, MemoryEntryV2>();
  for (const entry of entries) {
    const target = entry.supersedes ?? entry.id;
    const previous = latest.get(target);
    if (!previous || compareEntries(previous, entry) < 0) latest.set(target, entry);
  }
  return [...latest.values()];
}

function observableDigest(view: MemoryViewV2): string {
  return JSON.stringify({
    active: view.activeEntries,
    tombstones: latestTombstones(view.tombstones),
    unresolvedLinks: view.unresolvedLinks,
  });
}

function isExpired(entry: MemoryEntryV2, now: string): boolean {
  return (
    entry.lifecycle.expiresAt !== null && Date.parse(now) >= Date.parse(entry.lifecycle.expiresAt)
  );
}

function compareEntries(a: MemoryEntryV2, b: MemoryEntryV2): number {
  return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

function compareEntriesDesc(a: MemoryEntryV2, b: MemoryEntryV2): number {
  return b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);
}

function groupRank(key: string): number {
  const [layer, type] = key.split(":") as [MemoryLayerV2, MemoryType];
  return LAYER_PRIORITY.indexOf(layer) * TYPE_PRIORITY.length + TYPE_PRIORITY.indexOf(type);
}

function validatedBudget(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 0) throw new Error(`invalid_${name}`);
  return resolved;
}

function emptyHidden(): SurfaceMemoryV2Result["hidden"] {
  return { harness: {}, project: {}, takeover: {} };
}

function addHidden(hidden: SurfaceMemoryV2Result["hidden"], entry: MemoryEntryV2): void {
  hidden[entry.layer][entry.type] = (hidden[entry.layer][entry.type] ?? 0) + 1;
}

function codePointLength(value: string): number {
  return [...value].length;
}

function clipCodePoints(value: string, max: number): string {
  const points = [...value];
  if (points.length <= max) return value;
  if (max === 0) return "";
  return `${points.slice(0, Math.max(0, max - 1)).join("")}…`;
}

function singleLine(value: string): string {
  return value.replace(/\r?\n/g, " ");
}

function readJsonLines(path: string): unknown[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
}

function invalid(reason: string, field: string) {
  return { ok: false as const, reason, field };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function writeAllBytes(
  fd: number,
  bytes: Uint8Array,
  writer: (fd: number, bytes: Uint8Array, offset: number, length: number) => number = writeSync,
): void {
  let offset = 0;
  while (offset < bytes.length) {
    const written = writer(fd, bytes, offset, bytes.length - offset);
    if (written <= 0) throw new Error("memory_jsonl_short_write");
    offset += written;
  }
}

export function sameWriteIntent(entry: MemoryEntryV2, input: WriteMemoryV2Input): boolean {
  const expected = {
    layer: input.layer,
    key: input.key,
    body: input.body,
    type: input.type ?? "reference",
    provenance: {
      planId: input.provenance?.planId ?? null,
      sessionId: input.provenance?.sessionId ?? null,
      runtime: input.provenance?.runtime ?? "system",
      origin: input.provenance?.origin ?? "memory-v2",
    },
    expiresAt: input.expiresAt ?? null,
    links: input.links ?? [],
  };
  const actual = {
    layer: entry.layer,
    key: entry.key,
    body: entry.body,
    type: entry.type,
    provenance: entry.provenance,
    expiresAt: entry.lifecycle.expiresAt,
    links: entry.links,
  };
  return digestJson(actual) === digestJson(expected);
}

function digestJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isUnsupportedDirectorySync(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    ["EINVAL", "EPERM", "ENOTSUP", "EISDIR"].includes(String((error as NodeJS.ErrnoException).code))
  );
}

function isIsoUtc(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace(".000Z", "Z");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
