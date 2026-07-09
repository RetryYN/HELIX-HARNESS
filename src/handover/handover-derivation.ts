import { analyzeOutstandingWork } from "../lint/outstanding";
import { isClosedPlanStatus } from "../lint/shared";
import type { HarnessDb } from "../state-db/index";

export interface HandoverDerivationDeps {
  openDb(): HarnessDb;
  resolveGit(): GitBaseline;
}

export interface RenderCurrentPointerDeps {
  now(): string;
}

export interface GitBaseline {
  headSha: string;
  branch: string | null;
}

export interface DerivedActivePlan {
  planId: string;
  layer: string;
  kind: string;
  status: string;
  updatedAt: string;
}

export interface DerivedFeedbackEvent {
  feedbackEventId: string;
  planId: string;
  signalType: string;
  severity: string;
  status: string;
  nextAction: string;
  createdAt: string;
}

/**
 * plan_registry 射影は workflow_phase / version_target / PLAN 本文を持たないため、
 * この経路では authority 判定 (humanDecisionRequired / nextAuthority / authorityBoundary) を
 * 導出できない (false negative の fail-open になる)。構造的 blocker のみを持ち、
 * authority 判定は正本 (`helix status` / analyzeOutstandingWork のフル入力経路) に委ねる。
 */
export interface StructuralCompletionSummary {
  ok: boolean;
  status: "ready" | "blocked";
  reason: string;
  blockers: string[];
  authorityScope: "structural_only";
}

export interface DerivedHandoverSnapshot {
  activePlans: DerivedActivePlan[];
  outstanding: {
    nonTerminalPlansByLayer: Record<string, number>;
    nonTerminalPlansTotal: number;
    blockersByKind: Record<string, number>;
    completionReadiness: StructuralCompletionSummary;
  };
  feedback: {
    open: number;
    bySeverity: Record<string, number>;
    recent: DerivedFeedbackEvent[];
  };
  git: GitBaseline;
}

export interface PointerDrift {
  field: string;
  expected: unknown;
  actual: unknown;
}

const POINTER_GENERATOR = "helix handover";

interface DerivedPlanRow {
  planId: string;
  layer: string;
  kind: string;
  status: string;
  updatedAt: string;
}

export function deriveHandoverSnapshot(deps: HandoverDerivationDeps): DerivedHandoverSnapshot {
  const db = deps.openDb();
  try {
    const git = deps.resolveGit();
    const planRows = loadPlanRows(db);
    const outstanding = analyzeOutstandingWork(
      planRows.map((row) => ({
        planId: row.planId,
        layer: row.layer,
        kind: row.kind,
        status: row.status,
        workflowPhase: null,
        versionTarget: null,
        text: "",
      })),
      0,
    );
    return {
      activePlans: planRows
        .filter((row) => !isClosedPlanStatus(row.status))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.planId.localeCompare(b.planId))
        .map(({ planId, layer, kind, status, updatedAt }) => ({
          planId,
          layer,
          kind,
          status,
          updatedAt,
        })),
      outstanding: {
        nonTerminalPlansByLayer: outstanding.nonTerminalPlansByLayer,
        nonTerminalPlansTotal: outstanding.nonTerminalPlansTotal,
        blockersByKind: outstanding.blockersByKind,
        completionReadiness: {
          ok: outstanding.completionReadiness.ok,
          status: outstanding.completionReadiness.status,
          reason: outstanding.completionReadiness.reason,
          blockers: outstanding.completionReadiness.blockers,
          authorityScope: "structural_only",
        },
      },
      feedback: loadFeedbackSummary(db),
      git,
    };
  } finally {
    db.close();
  }
}

export function renderCurrentPointer(
  snapshot: DerivedHandoverSnapshot,
  note: string | null,
  deps: RenderCurrentPointerDeps,
): string {
  return `${JSON.stringify(pointerDerivedFields(snapshot, deps.now(), note), null, 2)}\n`;
}

export function detectPointerDrift(
  existing: string | Record<string, unknown> | null,
  snapshot: DerivedHandoverSnapshot,
): PointerDrift[] {
  const parsed = typeof existing === "string" ? parseJsonObject(existing) : existing;
  if (!parsed) {
    return [
      { field: "<pointer>", expected: pointerDerivedFields(snapshot, "", null), actual: null },
    ];
  }
  const expected = pointerDerivedFields(snapshot, "", null);
  const actualFields = pointerComparableFields(parsed);
  const drifts: PointerDrift[] = [];
  for (const field of derivedPointerFields()) {
    const expectedValue = expected[field];
    const actualValue = actualFields[field];
    if (stableJson(expectedValue) !== stableJson(actualValue)) {
      drifts.push({ field, expected: expectedValue, actual: actualValue });
    }
  }
  return drifts;
}

function loadPlanRows(db: HarnessDb): DerivedPlanRow[] {
  return db
    .prepare(
      `SELECT plan_id, layer, kind, status, updated_at
       FROM plan_registry
       ORDER BY updated_at DESC, plan_id ASC`,
    )
    .all()
    .map((row) => ({
      planId: String(row.plan_id ?? ""),
      layer: String(row.layer ?? "unknown") || "unknown",
      kind: String(row.kind ?? "unknown") || "unknown",
      status: String(row.status ?? "unknown") || "unknown",
      workflowPhase: null,
      versionTarget: null,
      text: "",
      updatedAt: String(row.updated_at ?? ""),
    }));
}

function loadFeedbackSummary(db: HarnessDb): DerivedHandoverSnapshot["feedback"] {
  const openRows = db
    .prepare(
      `SELECT severity, COUNT(*) AS n
       FROM feedback_events
       WHERE status = 'open'
       GROUP BY severity
       ORDER BY severity`,
    )
    .all();
  const bySeverity: Record<string, number> = {};
  for (const row of openRows) {
    bySeverity[String(row.severity ?? "unknown") || "unknown"] = Number(row.n ?? 0);
  }
  const recent = db
    .prepare(
      `SELECT feedback_event_id, plan_id, signal_type, severity, status, next_action, created_at
       FROM feedback_events
       ORDER BY created_at DESC, feedback_event_id ASC
       LIMIT 5`,
    )
    .all()
    .map((row) => ({
      feedbackEventId: String(row.feedback_event_id ?? ""),
      planId: String(row.plan_id ?? ""),
      signalType: String(row.signal_type ?? ""),
      severity: String(row.severity ?? ""),
      status: String(row.status ?? ""),
      nextAction: String(row.next_action ?? ""),
      createdAt: String(row.created_at ?? ""),
    }));
  return {
    open: Object.values(bySeverity).reduce((sum, n) => sum + n, 0),
    bySeverity,
    recent,
  };
}

function pointerDerivedFields(
  snapshot: DerivedHandoverSnapshot,
  generatedAt: string,
  takeoverNote: string | null,
) {
  return {
    generated_at: generatedAt,
    generator: POINTER_GENERATOR,
    active_plans: snapshot.activePlans,
    outstanding: snapshot.outstanding,
    feedback: snapshot.feedback,
    git: snapshot.git,
    takeover_note: takeoverNote,
  };
}

function derivedPointerFields(): Array<keyof ReturnType<typeof pointerDerivedFields>> {
  return ["generator", "active_plans", "outstanding", "feedback", "git"];
}

function pointerComparableFields(parsed: Record<string, unknown>) {
  const nested = parseNestedSnapshot(parsed.derivedSnapshot);
  if (nested) {
    return {
      generator: parsed.generator ?? POINTER_GENERATOR,
      active_plans: nested.activePlans,
      outstanding: nested.outstanding,
      feedback: nested.feedback,
      git: nested.git,
    };
  }
  return parsed;
}

function parseNestedSnapshot(value: unknown): DerivedHandoverSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<DerivedHandoverSnapshot>;
  if (
    !Array.isArray(candidate.activePlans) ||
    !candidate.outstanding ||
    !candidate.feedback ||
    !candidate.git
  ) {
    return null;
  }
  return candidate as DerivedHandoverSnapshot;
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!isRecord(value)) return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) out[key] = sortJson(value[key]);
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
