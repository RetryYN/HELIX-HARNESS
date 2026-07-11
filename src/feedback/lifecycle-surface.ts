import { createHash } from "node:crypto";
import {
  decodeFeedbackLifecycleEvent,
  FEEDBACK_LIFECYCLE_POLICY_VERSION,
  type FeedbackLifecycleDeps,
  type FeedbackLifecycleEventV1,
  type FeedbackLifecycleProjection,
  type FeedbackSourceBucket,
  type FeedbackSourceIdentity,
  type FeedbackSourceLike,
  feedbackSourceIdentity,
  resolveFeedbackLifecycle,
} from "./lifecycle";

const TELEMETRY_TTL_MS = 24 * 60 * 60 * 1000;

export interface AutoAckTelemetryInput {
  operationId: string;
  now: string;
}

export interface AutoAckTelemetryResult {
  ok: boolean;
  appended: FeedbackLifecycleEventV1[];
  diagnostics: string[];
  reason?: string;
}

/** TTL mutation is fail-close: an unreadable journal never becomes an acknowledgement. */
export function autoAckTelemetry(
  input: AutoAckTelemetryInput,
  deps: FeedbackLifecycleDeps,
): AutoAckTelemetryResult {
  const nowMs = Date.parse(input.now);
  if (!isCanonicalUtc(input.now) || !validOperationId(input.operationId)) {
    return { ok: false, appended: [], diagnostics: [], reason: "invalid_input" };
  }
  try {
    return deps.withLock(`auto-ack:${input.operationId}`, (fence) => {
      const resolved = resolveFeedbackLifecycle(deps.readEvents(), input.now);
      if (resolved.damaged.length > 0) {
        return {
          ok: false,
          appended: [],
          diagnostics: resolved.damaged.map((row) => `damaged:${row.reason}`),
          reason: "damaged_lifecycle",
        };
      }
      const existing = deps.readEvents().flatMap((raw) => {
        const decoded = decodeFeedbackLifecycleEvent(raw);
        return decoded.ok && decoded.event.operationId === input.operationId ? [decoded.event] : [];
      });
      if (existing.some((event) => event.occurredAt !== input.now || event.action !== "ack")) {
        return {
          ok: false,
          appended: [],
          diagnostics: [],
          reason: "operation_intent_conflict",
        };
      }
      const appended: FeedbackLifecycleEventV1[] = [];
      const diagnostics: string[] = [];
      for (const projection of [...resolved.active.values()].sort(compareProjection)) {
        if (projection.state !== "open" || projection.bucket !== "telemetry") continue;
        const firstMs = Date.parse(projection.firstObservedAt);
        if (!Number.isFinite(firstMs) || firstMs > nowMs) {
          diagnostics.push(`clock_invalid:${projectionKey(projection)}`);
          continue;
        }
        if (nowMs - firstMs < TELEMETRY_TTL_MS) continue;
        const event = ttlAckEvent(projection, input);
        deps.appendEvent(event, fence);
        appended.push(event);
      }
      if (appended.length === 0 && existing.length > 0) diagnostics.push("idempotent_replay");
      return { ok: true, appended, diagnostics };
    });
  } catch (error) {
    return {
      ok: false,
      appended: [],
      diagnostics: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export interface LifecycleSurfaceSource extends FeedbackSourceLike {
  severity?: string;
  fingerprint?: string;
  signalType?: string;
  planId?: string;
  nextAction?: string;
}

export interface LifecycleSurfaceItem {
  source: LifecycleSurfaceSource;
  sourceIdentities: string[];
  bucket: FeedbackSourceBucket;
}

export interface LifecycleHiddenCounts {
  gate: number;
  actionable: number;
  telemetry: number;
}

export interface LifecycleSurfaceBreadcrumb {
  hiddenByLifecycle: LifecycleHiddenCounts;
  hiddenBySessionReceipt: LifecycleHiddenCounts;
  hiddenByBudget: LifecycleHiddenCounts;
  damaged: number;
}

export interface SelectFeedbackLifecycleInput {
  sources: LifecycleSurfaceSource[];
  lifecycleEvents?: readonly unknown[];
  lifecycleUnavailable?: boolean;
  sessionId: string;
  budget: number;
}

export interface SelectFeedbackLifecycleResult {
  items: LifecycleSurfaceItem[];
  breadcrumb: LifecycleSurfaceBreadcrumb;
  diagnostics: string[];
}

/**
 * Canonical alias left join followed by lifecycle filter, semantic dedupe and cap.
 * Missing/damaged lifecycle state deliberately preserves visibility.
 */
export function selectFeedbackWithLifecycle(
  input: SelectFeedbackLifecycleInput,
): SelectFeedbackLifecycleResult {
  const breadcrumb = emptyBreadcrumb();
  const diagnostics: string[] = [];
  const unavailable = input.lifecycleUnavailable === true || input.lifecycleEvents === undefined;
  const resolved = unavailable
    ? undefined
    : resolveFeedbackLifecycle(input.lifecycleEvents ?? [], new Date(0).toISOString());
  if (unavailable) diagnostics.push("lifecycle_unavailable_fail_open");
  if (resolved?.damaged.length) {
    breadcrumb.damaged = resolved.damaged.length;
    diagnostics.push(`lifecycle_damaged_fail_open:${resolved.damaged.length}`);
  }
  const damagedKeys = new Set(resolved?.damaged.flatMap((row) => row.sourceKey ?? []) ?? []);
  const candidates: LifecycleSurfaceItem[] = [];
  for (const source of input.sources) {
    let identity: FeedbackSourceIdentity;
    try {
      identity = feedbackSourceIdentity(source);
    } catch {
      diagnostics.push("source_identity_invalid");
      continue;
    }
    if (identity.diagnostic) diagnostics.push(`${identity.diagnostic}:${identity.key}`);
    const projection = resolved?.active.get(identity.key);
    // source identityを復元できない破損行は影響範囲を限定できないため、surface全体を安全側表示にする。
    const mustFailOpen =
      unavailable || (resolved?.damaged.length ?? 0) > 0 || damagedKeys.has(identity.key);
    if (!mustFailOpen && projection && projection.payloadDigest === identity.payloadDigest) {
      if (projection.state !== "open") {
        increment(breadcrumb.hiddenByLifecycle, identity.bucket);
        continue;
      }
      if (projection.surfacedSessions.includes(input.sessionId)) {
        increment(breadcrumb.hiddenBySessionReceipt, identity.bucket);
        continue;
      }
    } else if (projection && projection.payloadDigest !== identity.payloadDigest) {
      diagnostics.push(`payload_digest_mismatch_fail_open:${identity.key}`);
    }
    candidates.push({ source, sourceIdentities: [identity.key], bucket: identity.bucket });
  }

  const deduped = dedupeCandidates(candidates);
  const budget = Math.max(0, Math.trunc(input.budget));
  const items = deduped.slice(0, budget);
  for (const hidden of deduped.slice(budget)) increment(breadcrumb.hiddenByBudget, hidden.bucket);
  return { items, breadcrumb, diagnostics };
}

function ttlAckEvent(
  projection: FeedbackLifecycleProjection,
  input: AutoAckTelemetryInput,
): FeedbackLifecycleEventV1 {
  const semantic = {
    operationId: input.operationId,
    sourceTable: projection.sourceTable,
    sourceId: projection.sourceId,
    generation: projection.sourceGeneration,
    action: "ack",
  };
  return {
    schemaVersion: 1,
    eventId: `flife:${hash(semantic)}`,
    operationId: input.operationId,
    sourceTable: projection.sourceTable,
    sourceId: projection.sourceId,
    activityEpoch: projection.activityEpoch,
    policyEpoch: projection.policyEpoch,
    sourceGeneration: projection.sourceGeneration,
    sourcePayloadDigest: projection.payloadDigest,
    sourceBucket: "telemetry",
    action: "ack",
    fromState: "open",
    toState: "ack",
    actor: "system",
    reason: "telemetry_ttl_24h",
    policyVersion: FEEDBACK_LIFECYCLE_POLICY_VERSION,
    sessionId: null,
    occurredAt: input.now,
  };
}

function dedupeCandidates(candidates: LifecycleSurfaceItem[]): LifecycleSurfaceItem[] {
  const groups = new Map<string, LifecycleSurfaceItem>();
  for (const candidate of candidates) {
    const key = candidate.source.fingerprint?.trim() || candidate.sourceIdentities[0] || "";
    const current = groups.get(key);
    if (!current) {
      groups.set(key, candidate);
      continue;
    }
    const winner = compareUrgency(candidate, current) < 0 ? candidate : current;
    groups.set(key, {
      ...winner,
      sourceIdentities: [
        ...new Set([...current.sourceIdentities, ...candidate.sourceIdentities]),
      ].sort(),
    });
  }
  return [...groups.values()].sort(compareUrgency);
}

function compareUrgency(a: LifecycleSurfaceItem, b: LifecycleSurfaceItem): number {
  return (
    bucketRank(a.bucket) - bucketRank(b.bucket) ||
    severityRank(a.source.severity) - severityRank(b.source.severity) ||
    (a.sourceIdentities[0] ?? "").localeCompare(b.sourceIdentities[0] ?? "")
  );
}

function emptyCounts(): LifecycleHiddenCounts {
  return { gate: 0, actionable: 0, telemetry: 0 };
}

function emptyBreadcrumb(): LifecycleSurfaceBreadcrumb {
  return {
    hiddenByLifecycle: emptyCounts(),
    hiddenBySessionReceipt: emptyCounts(),
    hiddenByBudget: emptyCounts(),
    damaged: 0,
  };
}

function increment(counts: LifecycleHiddenCounts, bucket: FeedbackSourceBucket): void {
  counts[bucket] += 1;
}

function bucketRank(bucket: FeedbackSourceBucket): number {
  return bucket === "gate" ? 0 : bucket === "actionable" ? 1 : 2;
}

function severityRank(value = "warn"): number {
  const severity = value.toLowerCase();
  return severity === "error" || severity === "fail" ? 0 : severity === "warn" ? 1 : 2;
}

function projectionKey(value: FeedbackLifecycleProjection): string {
  return `${value.sourceTable}:${value.sourceId}`;
}

function compareProjection(a: FeedbackLifecycleProjection, b: FeedbackLifecycleProjection): number {
  return projectionKey(a).localeCompare(projectionKey(b));
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function validOperationId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
}

function isCanonicalUtc(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace(".000Z", "Z");
}
