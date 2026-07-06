import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  MODE_ALLOWED_KINDS,
  normalizeRouteMode,
  workflowModeForPlan,
} from "../schema/mode-catalog";
import { defaultHarnessDbPath, openHarnessDb, type HarnessDb } from "../state-db/index";
import { routeSignalToMode } from "../workflow/routing-contracts";

export const PLAN_ENTRY_ROUTING_BASELINE_PATH =
  "docs/governance/plan-entry-routing-baseline.json";

const EXCLUDED_PLAN_PREFIXES = ["PLAN-DISCOVERY-", "PLAN-M-"];

export type PlanEntryRoutingReason =
  | "entry_signal_absent"
  | "entry_signal_unresolvable"
  | "kind_signal_mismatch"
  | "route_mode_absent"
  | "kind_route_mode_mismatch";

export interface PlanEntrySignalResolution {
  value: string;
  token: string | null;
  kind: "po_directive" | "feedback" | "issue_queue" | "unresolvable";
}

export interface PlanEntryRoutingDoc {
  file: string;
  planId: string;
  kind: string | null;
  status: string | null;
  routeMode: string | null;
  entrySignals: string[];
  resolvedSignals: PlanEntrySignalResolution[];
  workflowMode: string;
}

export interface PlanEntryRoutingBaseline {
  recorded: string | null;
  grandfathered: string[];
}

export interface PlanEntryRoutingViolation {
  planId: string;
  file: string;
  reason: PlanEntryRoutingReason;
  detail?: string;
}

export interface PlanEntryRoutingResult {
  checked: number;
  newViolations: PlanEntryRoutingViolation[];
  grandfathered: PlanEntryRoutingViolation[];
  baselineCount: number;
  ok: boolean;
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function markdownFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!match) return null;
  try {
    const parsed = parseYaml(match[1]);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function feedbackSignalToken(db: HarnessDb, value: string): string | null {
  const row = db
    .prepare(
      `SELECT signal_type, source_table
         FROM feedback_events
        WHERE source_id = ? OR feedback_event_id = ?
        LIMIT 1`,
    )
    .get(value, value);
  const signalType = stringField(row?.signal_type);
  const sourceTable = stringField(row?.source_table);
  return signalType ?? sourceTable;
}

function issueQueueSignalToken(db: HarnessDb, value: string): string | null {
  const queue = db
    .prepare("SELECT source_event_id FROM issue_queue WHERE issue_queue_id = ? LIMIT 1")
    .get(value);
  const sourceEventId = stringField(queue?.source_event_id);
  return sourceEventId ? feedbackSignalToken(db, sourceEventId) : null;
}

function resolveEntrySignals(
  repoRoot: string,
  entrySignals: string[],
): PlanEntrySignalResolution[] {
  const dbPath = defaultHarnessDbPath(repoRoot);
  if (!existsSync(dbPath)) {
    return entrySignals.map((value) =>
      value.startsWith("po_directive:")
        ? { value, token: "po_directive", kind: "po_directive" }
        : { value, token: null, kind: "unresolvable" },
    );
  }

  let db: HarnessDb | null = null;
  try {
    db = openHarnessDb(dbPath, { repoRoot });
    return entrySignals.map((value) => {
      if (value.startsWith("po_directive:")) {
        return { value, token: "po_directive", kind: "po_directive" };
      }
      const feedbackToken = feedbackSignalToken(db as HarnessDb, value);
      if (feedbackToken) return { value, token: feedbackToken, kind: "feedback" };
      const queueToken = issueQueueSignalToken(db as HarnessDb, value);
      if (queueToken) return { value, token: queueToken, kind: "issue_queue" };
      return { value, token: null, kind: "unresolvable" };
    });
  } catch {
    return entrySignals.map((value) =>
      value.startsWith("po_directive:")
        ? { value, token: "po_directive", kind: "po_directive" }
        : { value, token: null, kind: "unresolvable" },
    );
  } finally {
    try {
      db?.close();
    } catch {
      // fail-close の判定は上で完了済み。close 失敗は lint 結果へ影響させない。
    }
  }
}

export function loadPlanEntryRoutingDocs(
  repoRoot: string = process.cwd(),
  target?: string,
): PlanEntryRoutingDoc[] {
  const plansDir = join(repoRoot, "docs", "plans");
  if (!existsSync(plansDir)) return [];
  const files = target
    ? [target]
    : readdirSync(plansDir)
        .filter((name) => name.startsWith("PLAN-") && name.endsWith(".md"))
        .map((name) => join("docs", "plans", name));
  const docs: PlanEntryRoutingDoc[] = [];
  for (const rel of files) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    const raw = markdownFrontmatter(readFileSync(abs, "utf-8"));
    if (!raw) continue;
    const planId = stringField(raw.plan_id) ?? rel;
    const kind = stringField(raw.kind);
    const routeMode = stringField(raw.route_mode);
    const entrySignals = stringArray(raw.entry_signals);
    docs.push({
      file: rel,
      planId,
      kind,
      status: stringField(raw.status),
      routeMode,
      entrySignals,
      resolvedSignals: resolveEntrySignals(repoRoot, entrySignals),
      workflowMode: workflowModeForPlan({ planId, kind, routeMode }),
    });
  }
  return docs;
}

export function loadPlanEntryRoutingBaseline(
  repoRoot: string = process.cwd(),
): PlanEntryRoutingBaseline {
  const abs = join(repoRoot, PLAN_ENTRY_ROUTING_BASELINE_PATH);
  if (!existsSync(abs)) return { recorded: null, grandfathered: [] };
  try {
    const parsed = JSON.parse(readFileSync(abs, "utf-8")) as Partial<PlanEntryRoutingBaseline>;
    return {
      recorded: typeof parsed.recorded === "string" ? parsed.recorded : null,
      grandfathered: Array.isArray(parsed.grandfathered)
        ? parsed.grandfathered.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { recorded: null, grandfathered: [] };
  }
}

function isExcluded(doc: PlanEntryRoutingDoc): boolean {
  return doc.status === "archived" || EXCLUDED_PLAN_PREFIXES.some((p) => doc.planId.startsWith(p));
}

function kindAllowed(mode: string, kind: string | null): boolean {
  if (!kind) return false;
  return MODE_ALLOWED_KINDS[normalizeRouteMode(mode)]?.has(kind) ?? false;
}

function collectViolations(doc: PlanEntryRoutingDoc): PlanEntryRoutingViolation[] {
  const violations: PlanEntryRoutingViolation[] = [];
  if (doc.entrySignals.length === 0) {
    violations.push({ planId: doc.planId, file: doc.file, reason: "entry_signal_absent" });
  }
  for (const signal of doc.resolvedSignals) {
    if (signal.kind === "po_directive") continue;
    if (!signal.token) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: "entry_signal_unresolvable",
        detail: signal.value,
      });
      continue;
    }
    const routedMode = routeSignalToMode({ signal: signal.token }).candidates[0];
    if (!routedMode || !kindAllowed(routedMode, doc.kind)) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: "kind_signal_mismatch",
        detail: `${signal.token}->${routedMode ?? "no-route"} kind=${doc.kind ?? "-"}`,
      });
    }
  }
  if (!doc.routeMode) {
    violations.push({ planId: doc.planId, file: doc.file, reason: "route_mode_absent" });
  } else if (!kindAllowed(doc.routeMode, doc.kind)) {
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "kind_route_mode_mismatch",
      detail: `${doc.routeMode} kind=${doc.kind ?? "-"}`,
    });
  }
  return violations;
}

export function analyzePlanEntryRouting(
  docs: PlanEntryRoutingDoc[],
  baseline: PlanEntryRoutingBaseline,
): PlanEntryRoutingResult {
  const grandfatheredIds = new Set(baseline.grandfathered);
  const newViolations: PlanEntryRoutingViolation[] = [];
  const grandfathered: PlanEntryRoutingViolation[] = [];
  let checked = 0;
  for (const doc of docs) {
    if (isExcluded(doc)) continue;
    checked += 1;
    for (const violation of collectViolations(doc)) {
      if (grandfatheredIds.has(violation.planId)) grandfathered.push(violation);
      else newViolations.push(violation);
    }
  }
  const grandfatheredPlanIds = new Set(grandfathered.map((v) => v.planId));
  return {
    checked,
    newViolations,
    grandfathered,
    baselineCount: baseline.grandfathered.length,
    ok: newViolations.length === 0 && grandfatheredPlanIds.size <= baseline.grandfathered.length,
  };
}

export function buildPlanEntryRoutingBaseline(
  docs: PlanEntryRoutingDoc[],
  recorded: string,
): PlanEntryRoutingBaseline {
  const empty: PlanEntryRoutingBaseline = { recorded: null, grandfathered: [] };
  const result = analyzePlanEntryRouting(docs, empty);
  const ids = [...new Set(result.newViolations.map((v) => v.planId))].sort();
  return { recorded, grandfathered: ids };
}

export function planEntryRoutingMessages(result: PlanEntryRoutingResult): string[] {
  const grandfatheredIds = new Set(result.grandfathered.map((v) => v.planId)).size;
  if (result.ok) {
    return [
      `plan-entry-routing - OK (PLAN checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})`,
    ];
  }
  const sample = result.newViolations
    .slice(0, 8)
    .map((v) => `${v.planId}:${v.reason}${v.detail ? `(${v.detail})` : ""}`)
    .join(", ");
  return [
    `plan-entry-routing - violation ${result.newViolations.length} 件 (checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})。entry_signals と route_mode、signal→mode→kind 整合を確認 (PLAN-L6-55)`,
    `plan-entry-routing - sample: ${sample}`,
  ];
}
