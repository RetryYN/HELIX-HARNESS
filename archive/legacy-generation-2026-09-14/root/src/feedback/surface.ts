import type { HarnessDb } from "../state-db/index";
import { type FeedbackSourceLike, feedbackSourceIdentity } from "./lifecycle";

/**
 * Takeover feedback surface (PLAN-L7-110).
 *
 * Session takeover must receive actionable feedback from harness.db, not from a
 * stale prose handover or a transient shared working tree. This reader is
 * intentionally read-only so SessionStart can run while another runtime is
 * rebuilding the projection database.
 */

export interface SurfacedFeedback {
  feedback_event_id: string;
  signal_type: string;
  severity: string;
  plan_id: string;
  next_action: string;
  bucket: FeedbackSurfaceBucket;
  /** group-first cap の代表行が保持する group 実件数 (省略時 1、PLAN-L7-404)。 */
  surface_count?: number;
  /** group 内の distinct plan_id (表示は先頭 3 件のみ)。 */
  surface_plan_ids?: string[];
  /** receipt writer用canonical `table:id@generation`。 */
  surface_source_refs?: string[];
}

export interface TakeoverFeedbackResult {
  /** Total open feedback count before applying the display limit. */
  total: number;
  /** Count by normalized severity. */
  bySeverity: Record<string, number>;
  /** Count by display bucket. */
  byBucket: Record<FeedbackSurfaceBucket, number>;
  /** Count by signal type for telemetry items that are intentionally summarized. */
  telemetryBySignal: Record<string, number>;
  /**
   * bucket/severity/signal_type の group 代表行 (group-first cap 適用後)。limit は表示 group 数の
   * 予算であり、単一クラスタが他 signal_type を追い出さない (PLAN-L7-404)。
   */
  items: SurfacedFeedback[];
  /** group-first cap 適用後に隠れた残余 (group 数と実件数)。 */
  hidden: { groups: number; items: number };
  /** lifecycleで通常表示から退避した未解決/terminal件数。 */
  lifecycleHidden?: Record<FeedbackSurfaceBucket, number>;
  /** 同一sessionですでに表示済みの件数。 */
  sessionReceiptHidden?: Record<FeedbackSurfaceBucket, number>;
}

export type FeedbackSurfaceBucket = "gate" | "actionable" | "telemetry";

export interface FeedbackEventRowLike {
  feedback_event_id?: unknown;
  signal_type?: unknown;
  severity?: unknown;
  plan_id?: unknown;
  next_action?: unknown;
}

const BUCKET_RANK: Record<FeedbackSurfaceBucket, number> = { gate: 0, actionable: 1, telemetry: 2 };
const SEVERITY_RANK: Record<string, number> = { error: 0, fail: 0, warn: 1, info: 2 };

const TELEMETRY_SIGNAL_TYPES = new Set([
  "artifact_progress_yellow",
  "drive_firing_rate",
  "large-document-split",
  "missing-test-oracle-id",
  "skill_acceptance_rate",
  "skill_firing_rate",
  "trouble_event_rate",
  "workflow_human_required_rate",
]);

const REFACTOR_CANDIDATE_SIGNAL_PREFIX = "refactor_candidate:";

function severityRank(severity: string): number {
  return SEVERITY_RANK[severity] ?? SEVERITY_RANK.warn;
}

function isRefactorCandidateSignal(signalType: string): boolean {
  return signalType.startsWith(REFACTOR_CANDIDATE_SIGNAL_PREFIX);
}

function qualitySignalSeverity(status: string, signalType: string): string {
  if (isRefactorCandidateSignal(signalType) && (status === "warn" || status === "fail")) {
    return "warn";
  }
  return status === "fail" ? "warn" : "info";
}

function qualitySignalNextAction(input: {
  signalId: string;
  signalType: string;
  subject: string;
}): string {
  if (isRefactorCandidateSignal(input.signalType)) {
    return `triage refactor candidate ${input.signalId || input.subject}: attach/create refactor PLAN or record accepted debt`;
  }
  return `review quality signal ${input.signalId || input.subject}`;
}

export function classifyFeedbackBucket(input: {
  severity: string;
  signal_type: string;
}): FeedbackSurfaceBucket {
  const severity = input.severity.toLowerCase();
  if (severity === "error" || severity === "fail") return "gate";
  if (isRefactorCandidateSignal(input.signal_type) && severity === "warn") return "actionable";
  if (severity === "info" || TELEMETRY_SIGNAL_TYPES.has(input.signal_type)) return "telemetry";
  return "actionable";
}

function feedbackId(prefix: string, subject: string): string {
  return `${prefix}:${subject}`.replace(/[^A-Za-z0-9._:-]+/g, "-");
}

function planIdOf(subject: string): string {
  return subject.startsWith("PLAN-") ? subject : "";
}

function feedbackGroupKey(item: SurfacedFeedback): string {
  return `${item.bucket}:${item.severity}:${item.signal_type}`;
}

function renderGroupedItems(items: SurfacedFeedback[], indent = "    "): string[] {
  const groups = new Map<
    string,
    {
      bucket: FeedbackSurfaceBucket;
      severity: string;
      signalType: string;
      count: number;
      planIds: Set<string>;
      nextAction: string;
    }
  >();
  for (const item of items) {
    const key = feedbackGroupKey(item);
    const group = groups.get(key) ?? {
      bucket: item.bucket,
      severity: item.severity,
      signalType: item.signal_type,
      count: 0,
      planIds: new Set<string>(),
      nextAction: item.next_action,
    };
    group.count += item.surface_count ?? 1;
    for (const planId of item.surface_plan_ids ?? (item.plan_id ? [item.plan_id] : [])) {
      group.planIds.add(planId);
    }
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort(
      (a, b) =>
        BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket] ||
        severityRank(a.severity) - severityRank(b.severity) ||
        b.count - a.count ||
        a.signalType.localeCompare(b.signalType),
    )
    .map((group) => {
      const plans = [...group.planIds].slice(0, 3);
      const planText =
        plans.length > 0
          ? ` [${plans.join(", ")}${group.planIds.size > plans.length ? ", ..." : ""}]`
          : "";
      return `${indent}- (${group.severity}) ${group.signalType}${planText}: count=${group.count}; ${group.nextAction}`;
    });
}

/**
 * Read takeover feedback directly from harness.db projection tables.
 *
 * This mirrors the feedback source used by emitFeedbackEvents without writing to
 * feedback_events. It keeps SessionStart fail-open and avoids write-lock
 * contention with parallel database rebuilds.
 */
export function selectTakeoverFeedback(
  db: HarnessDb,
  opts: { limit?: number; sessionId?: string } = {},
): TakeoverFeedbackResult {
  const limit = opts.limit ?? 10;
  let items: SurfacedFeedback[] = [];
  const lifecycleSources = new Map<string, FeedbackSourceLike>();
  const lifecycleHidden: Record<FeedbackSurfaceBucket, number> = {
    gate: 0,
    actionable: 0,
    telemetry: 0,
  };
  const sessionReceiptHidden: Record<FeedbackSurfaceBucket, number> = {
    gate: 0,
    actionable: 0,
    telemetry: 0,
  };

  const openFindings = db
    .prepare("SELECT finding_id, kind, severity, subject_id FROM findings WHERE status = 'open'")
    .all() as Array<Record<string, unknown>>;
  for (const finding of openFindings) {
    const subject = String(finding.subject_id ?? finding.finding_id ?? "");
    const feedbackEventId = feedbackId("feedback:finding", String(finding.finding_id ?? subject));
    const severity = String(finding.severity ?? "warn");
    items.push({
      feedback_event_id: feedbackEventId,
      signal_type: String(finding.kind ?? "finding"),
      severity,
      plan_id: planIdOf(subject),
      next_action: `review finding ${finding.finding_id ?? subject}`,
      bucket: classifyFeedbackBucket({
        severity,
        signal_type: String(finding.kind ?? "finding"),
      }),
    });
    lifecycleSources.set(feedbackEventId, {
      sourceTable: "findings",
      sourceId: String(finding.finding_id ?? subject),
      status: "open",
      severity,
      kind: String(finding.kind ?? "finding"),
      subject,
    });
  }

  const failedSignals = db
    .prepare(
      "SELECT signal_id, metric, status, subject_id, value, threshold FROM quality_signals WHERE status IN ('fail', 'warn')",
    )
    .all() as Array<Record<string, unknown>>;
  for (const signal of failedSignals) {
    const subject = String(signal.subject_id ?? signal.signal_id ?? "");
    const signalType = String(signal.metric ?? "quality_signal");
    const severity = qualitySignalSeverity(String(signal.status ?? "warn"), signalType);
    const feedbackEventId = feedbackId("feedback:signal", String(signal.signal_id ?? subject));
    items.push({
      feedback_event_id: feedbackEventId,
      signal_type: signalType,
      severity,
      plan_id: planIdOf(subject),
      next_action: qualitySignalNextAction({
        signalId: String(signal.signal_id ?? ""),
        signalType,
        subject,
      }),
      bucket: classifyFeedbackBucket({ severity, signal_type: signalType }),
    });
    lifecycleSources.set(feedbackEventId, {
      sourceTable: "quality_signals",
      sourceId: String(signal.signal_id ?? subject),
      status: String(signal.status ?? "warn"),
      severity,
      metric: signalType,
      value: signal.value,
      threshold: signal.threshold,
      subject,
    });
  }

  const directKeys = new Set(
    [...lifecycleSources.values()].map((source) => feedbackSourceIdentity(source).key),
  );
  const feedbackRows = db
    .prepare(
      "SELECT feedback_event_id, source_table, source_id, signal_type, severity, plan_id, next_action, status FROM feedback_events WHERE status = 'open'",
    )
    .all();
  for (const row of feedbackRows) {
    const originTable = String(row.source_table ?? "");
    const source: FeedbackSourceLike = {
      sourceTable: "feedback_events",
      sourceId: String(row.feedback_event_id ?? ""),
      status: "open",
      severity: String(row.severity ?? "warn"),
      kind: String(row.signal_type ?? "feedback"),
      subject: String(row.plan_id ?? row.source_id ?? ""),
      ...((originTable === "findings" || originTable === "quality_signals") && row.source_id
        ? {
            source_table: originTable as "findings" | "quality_signals",
            source_id: String(row.source_id),
          }
        : {}),
    };
    const identity = feedbackSourceIdentity(source);
    if (directKeys.has(identity.key)) continue;
    const feedbackEventId = String(row.feedback_event_id ?? "");
    const signalType = String(row.signal_type ?? "feedback");
    const severity = String(row.severity ?? "warn");
    items.push({
      feedback_event_id: feedbackEventId,
      signal_type: signalType,
      severity,
      plan_id: String(row.plan_id ?? ""),
      next_action: String(row.next_action ?? "review feedback"),
      bucket: classifyFeedbackBucket({ severity, signal_type: signalType }),
    });
    lifecycleSources.set(feedbackEventId, source);
    directKeys.add(identity.key);
  }

  items = filterByLifecycleProjection({
    db,
    items,
    sources: lifecycleSources,
    hidden: lifecycleHidden,
    receiptHidden: sessionReceiptHidden,
    sessionId: opts.sessionId,
  });

  items.sort(
    (a, b) =>
      BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket] ||
      severityRank(a.severity) - severityRank(b.severity) ||
      a.feedback_event_id.localeCompare(b.feedback_event_id),
  );

  const bySeverity: Record<string, number> = {};
  for (const item of items) {
    bySeverity[item.severity] = (bySeverity[item.severity] ?? 0) + 1;
  }

  const byBucket: Record<FeedbackSurfaceBucket, number> = {
    gate: 0,
    actionable: 0,
    telemetry: 0,
  };
  const telemetryBySignal: Record<string, number> = {};
  for (const item of items) {
    byBucket[item.bucket] += 1;
    if (item.bucket === "telemetry") {
      telemetryBySignal[item.signal_type] = (telemetryBySignal[item.signal_type] ?? 0) + 1;
    }
  }

  // group-first cap (PLAN-L7-404): limit は「表示 group 数」の予算。単一 signal_type の大量クラスタが
  // 予算を独占して他の問題種別を不可視化しないよう、bucket:severity:signal_type で畳んでから選定する。
  const nonTelemetry = items.filter((item) => item.bucket !== "telemetry");
  const groups = new Map<
    string,
    {
      representative: SurfacedFeedback;
      count: number;
      planIds: Set<string>;
      sourceRefs: Set<string>;
    }
  >();
  for (const item of nonTelemetry) {
    const group = groups.get(feedbackGroupKey(item));
    if (group) {
      group.count += 1;
      if (item.plan_id) group.planIds.add(item.plan_id);
      for (const ref of item.surface_source_refs ?? []) group.sourceRefs.add(ref);
    } else {
      groups.set(feedbackGroupKey(item), {
        representative: item,
        count: 1,
        planIds: new Set(item.plan_id ? [item.plan_id] : []),
        sourceRefs: new Set(item.surface_source_refs ?? []),
      });
    }
  }
  const orderedGroups = [...groups.values()].sort(
    (a, b) =>
      BUCKET_RANK[a.representative.bucket] - BUCKET_RANK[b.representative.bucket] ||
      severityRank(a.representative.severity) - severityRank(b.representative.severity) ||
      b.count - a.count ||
      a.representative.signal_type.localeCompare(b.representative.signal_type),
  );
  const selected = orderedGroups.slice(0, limit);
  const surfaced = selected.map((group) => ({
    ...group.representative,
    surface_count: group.count,
    surface_plan_ids: [...group.planIds],
    surface_source_refs: [...group.sourceRefs],
  }));
  const representedItems = selected.reduce((sum, group) => sum + group.count, 0);
  const lifecycleHiddenTotal = Object.values(lifecycleHidden).reduce(
    (sum, count) => sum + count,
    0,
  );
  const sessionReceiptHiddenTotal = Object.values(sessionReceiptHidden).reduce(
    (sum, count) => sum + count,
    0,
  );
  return {
    total: items.length,
    bySeverity,
    byBucket,
    telemetryBySignal,
    items: surfaced,
    hidden: {
      groups: orderedGroups.length - selected.length,
      items: nonTelemetry.length - representedItems,
    },
    ...(lifecycleHiddenTotal > 0 ? { lifecycleHidden } : {}),
    ...(sessionReceiptHiddenTotal > 0 ? { sessionReceiptHidden } : {}),
  };
}

export function loadFeedbackLifecycleSources(db: HarnessDb): FeedbackSourceLike[] {
  const findings = db
    .prepare("SELECT finding_id, kind, severity, subject_id, status FROM findings")
    .all()
    .map((row) => ({
      sourceTable: "findings" as const,
      sourceId: String(row.finding_id ?? ""),
      status: String(row.status ?? ""),
      severity: String(row.severity ?? "warn"),
      kind: String(row.kind ?? "finding"),
      subject: String(row.subject_id ?? row.finding_id ?? ""),
    }));
  const signals = db
    .prepare("SELECT signal_id, metric, status, subject_id, value, threshold FROM quality_signals")
    .all()
    .map((row) => {
      const signalType = String(row.metric ?? "quality_signal");
      return {
        sourceTable: "quality_signals" as const,
        sourceId: String(row.signal_id ?? ""),
        status: String(row.status ?? ""),
        severity: qualitySignalSeverity(String(row.status ?? "warn"), signalType),
        metric: signalType,
        value: row.value,
        threshold: row.threshold,
        subject: String(row.subject_id ?? row.signal_id ?? ""),
      };
    });
  const sources: FeedbackSourceLike[] = [...findings, ...signals];
  const keys = new Set(sources.map((source) => feedbackSourceIdentity(source).key));
  for (const row of db
    .prepare(
      "SELECT feedback_event_id, source_table, source_id, signal_type, severity, plan_id, status FROM feedback_events",
    )
    .all()) {
    const originTable = String(row.source_table ?? "");
    const source: FeedbackSourceLike = {
      sourceTable: "feedback_events",
      sourceId: String(row.feedback_event_id ?? ""),
      status: String(row.status ?? ""),
      severity: String(row.severity ?? "warn"),
      kind: String(row.signal_type ?? "feedback"),
      subject: String(row.plan_id ?? row.source_id ?? ""),
      ...((originTable === "findings" || originTable === "quality_signals") && row.source_id
        ? {
            source_table: originTable as "findings" | "quality_signals",
            source_id: String(row.source_id),
          }
        : {}),
    };
    const key = feedbackSourceIdentity(source).key;
    if (!keys.has(key)) {
      sources.push(source);
      keys.add(key);
    }
  }
  return sources;
}

interface FilterByLifecycleProjectionInput {
  db: HarnessDb;
  items: SurfacedFeedback[];
  sources: ReadonlyMap<string, FeedbackSourceLike>;
  hidden: Record<FeedbackSurfaceBucket, number>;
  receiptHidden: Record<FeedbackSurfaceBucket, number>;
  sessionId?: string;
}

function filterByLifecycleProjection(params: FilterByLifecycleProjectionInput): SurfacedFeedback[] {
  const { db, items, sources, hidden, receiptHidden, sessionId } = params;
  try {
    const health = db
      .prepare(
        "SELECT damaged_count FROM feedback_lifecycle_health WHERE health_id = 'feedback-lifecycle'",
      )
      .get();
    if (!health || Number(health.damaged_count ?? 0) > 0) return items;
    const rows = db
      .prepare(
        "SELECT source_table, source_id, source_generation, activity_epoch, policy_epoch, state, payload_digest, surfaced_sessions FROM feedback_lifecycle",
      )
      .all();
    const latest = new Map<
      string,
      {
        sourceGeneration: string;
        activityEpoch: number;
        policyEpoch: number;
        state: string;
        payloadDigest: string;
        surfacedSessions: string[];
      }
    >();
    for (const row of rows) {
      const key = `${String(row.source_table ?? "")}:${String(row.source_id ?? "")}`;
      const candidate = {
        sourceGeneration: String(row.source_generation ?? ""),
        activityEpoch: Number(row.activity_epoch ?? 0),
        policyEpoch: Number(row.policy_epoch ?? 0),
        state: String(row.state ?? ""),
        payloadDigest: String(row.payload_digest ?? ""),
        surfacedSessions: String(row.surfaced_sessions ?? "")
          .split(",")
          .filter(Boolean),
      };
      const current = latest.get(key);
      if (
        !current ||
        candidate.activityEpoch > current.activityEpoch ||
        (candidate.activityEpoch === current.activityEpoch &&
          candidate.policyEpoch > current.policyEpoch)
      ) {
        latest.set(key, candidate);
      }
    }
    return items.filter((item) => {
      const source = sources.get(item.feedback_event_id);
      if (!source) return true;
      const identity = feedbackSourceIdentity(source);
      const lifecycle = latest.get(identity.key);
      if (
        lifecycle &&
        lifecycle.payloadDigest === identity.payloadDigest &&
        sessionId &&
        lifecycle.surfacedSessions.includes(sessionId)
      ) {
        receiptHidden[identity.bucket] += 1;
        return false;
      }
      // projection不在・digest drift・不正stateは安全側表示。正しく一致した非openだけ退避する。
      const visible =
        !lifecycle ||
        lifecycle.payloadDigest !== identity.payloadDigest ||
        lifecycle.state === "open" ||
        !["ack", "closed", "superseded"].includes(lifecycle.state);
      if (!visible) hidden[identity.bucket] += 1;
      if (visible && lifecycle?.state === "open") {
        item.surface_source_refs = [`${identity.key}@${lifecycle.sourceGeneration}`];
      }
      return visible;
    });
  } catch {
    return items;
  }
}

export function renderTakeoverFeedback(result: TakeoverFeedbackResult): string {
  if (result.total === 0 && !result.lifecycleHidden && !result.sessionReceiptHidden) return "";
  const counts = ["fail", "warn", "info"]
    .filter((sev) => (result.bySeverity[sev] ?? 0) > 0)
    .map((sev) => `${sev}=${result.bySeverity[sev]}`)
    .join(" ");
  const lines = [
    `harness.db feedback (open=${result.total}; gate=${result.byBucket.gate} actionable=${result.byBucket.actionable} telemetry=${result.byBucket.telemetry}; ${counts}) - source=DB, not prose handover`,
  ];
  const gateItems = result.items.filter((item) => item.bucket === "gate");
  const actionableItems = result.items.filter((item) => item.bucket === "actionable");
  if (gateItems.length > 0) lines.push("  gate:");
  lines.push(...renderGroupedItems(gateItems));
  if (actionableItems.length > 0) lines.push("  actionable:");
  lines.push(...renderGroupedItems(actionableItems));
  if (result.hidden.groups > 0) {
    lines.push(
      `  - (+${result.hidden.items} more actionable in ${result.hidden.groups} group(s) - helix feedback list --emit)`,
    );
  }
  if (result.byBucket.telemetry > 0) {
    const topTelemetry = Object.entries(result.telemetryBySignal)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([signal, count]) => `${signal}=${count}`)
      .join(" ");
    lines.push(`  telemetry summarized: ${topTelemetry}`);
  }
  if (result.lifecycleHidden) {
    lines.push(
      `  lifecycle hidden: gate=${result.lifecycleHidden.gate} actionable=${result.lifecycleHidden.actionable} telemetry=${result.lifecycleHidden.telemetry}`,
    );
  }
  if (result.sessionReceiptHidden) {
    lines.push(
      `  session receipt hidden: gate=${result.sessionReceiptHidden.gate} actionable=${result.sessionReceiptHidden.actionable} telemetry=${result.sessionReceiptHidden.telemetry}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function renderFeedbackEventRows(rows: FeedbackEventRowLike[], limit = 20): string {
  const items = rows.map((row) => {
    const severity = String(row.severity ?? "warn");
    const signalType = String(row.signal_type ?? "feedback");
    return {
      feedback_event_id: String(row.feedback_event_id ?? ""),
      signal_type: signalType,
      severity,
      plan_id: String(row.plan_id ?? ""),
      next_action: String(row.next_action ?? ""),
      bucket: classifyFeedbackBucket({ severity, signal_type: signalType }),
    } satisfies SurfacedFeedback;
  });
  const byBucket: Record<FeedbackSurfaceBucket, number> = { gate: 0, actionable: 0, telemetry: 0 };
  const telemetryBySignal: Record<string, number> = {};
  for (const item of items) {
    byBucket[item.bucket] += 1;
    if (item.bucket === "telemetry") {
      telemetryBySignal[item.signal_type] = (telemetryBySignal[item.signal_type] ?? 0) + 1;
    }
  }
  const nonTelemetry = items
    .filter((item) => item.bucket !== "telemetry")
    .sort(
      (a, b) =>
        BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket] ||
        severityRank(a.severity) - severityRank(b.severity) ||
        a.feedback_event_id.localeCompare(b.feedback_event_id),
    );
  const lines = [
    `feedback events: total=${items.length} gate=${byBucket.gate} actionable=${byBucket.actionable} telemetry=${byBucket.telemetry}`,
  ];
  const grouped = renderGroupedItems(nonTelemetry, "  ");
  lines.push(...grouped.slice(0, limit));
  const hiddenGroups = grouped.length - limit;
  if (hiddenGroups > 0) {
    lines.push(`  - (+${hiddenGroups} more actionable signal groups; use --json for raw rows)`);
  }
  if (byBucket.telemetry > 0) {
    const topTelemetry = Object.entries(telemetryBySignal)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([signal, count]) => `${signal}=${count}`)
      .join(" ");
    lines.push(`  telemetry summarized: ${topTelemetry}`);
  }
  return `${lines.join("\n")}\n`;
}
