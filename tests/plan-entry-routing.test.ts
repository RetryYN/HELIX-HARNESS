import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  analyzePlanEntryRouting,
  buildPlanEntryRoutingBaseline,
  loadPlanEntryRoutingBaseline,
  loadPlanEntryRoutingDocs,
  type PlanEntryRoutingBaseline,
} from "../src/lint/plan-entry-routing";
import { workflowModeForPlan } from "../src/schema/mode-catalog";
import { openHarnessDb, upsertRow } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import { loadPlanEntryRoutingDocsFromDb } from "../src/state-db/plan-entry-routing-input";
import { classifyTask } from "../src/task/classify";

const EMPTY_BASELINE: PlanEntryRoutingBaseline = { recorded: null, grandfathered: [] };

const roots: string[] = [];

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "plan-entry-routing-"));
  roots.push(root);
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  mkdirSync(join(root, "docs", "governance"), { recursive: true });
  return root;
}

function seedDb(root: string): void {
  const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
  try {
    migrate(db);
    upsertRow(db, {
      table: "feedback_events",
      primaryKey: "feedback_event_id",
      row: {
        feedback_event_id: "fb-1",
        finding_id: "finding-1",
        plan_id: "",
        source_table: "feedback_events",
        source_id: "source-1",
        source_color: "red",
        signal_type: "debt_degradation",
        severity: "warn",
        status: "open",
        next_action: "route to refactor",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
    upsertRow(db, {
      table: "feedback_events",
      primaryKey: "feedback_event_id",
      row: {
        feedback_event_id: "fb-refactor-candidate",
        finding_id: "finding-2",
        plan_id: "",
        source_table: "feedback_events",
        source_id: "source-refactor-candidate",
        source_color: "red",
        signal_type: "refactor_candidate:split-module",
        severity: "warn",
        status: "open",
        next_action: "route to refactor",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
    upsertRow(db, {
      table: "issue_queue",
      primaryKey: "issue_queue_id",
      row: {
        issue_queue_id: "queue-1",
        source_event_id: "fb-1",
        plan_id: "",
        target: "github",
        title: "Refactor queue",
        body: "Queue item",
        status: "queued_dry_run",
        human_approval_required: 0,
        approved_by: "",
        approved_at: "",
        external_issue_id: "",
        external_issue_url: "",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
  } finally {
    db.close();
  }
}

interface PlanSpec {
  planId: string;
  kind?: string;
  status?: string;
  routeMode?: string | null;
  entrySignals?: string[] | null;
}

function writePlan(root: string, spec: PlanSpec): void {
  const lines = [
    "---",
    `plan_id: ${spec.planId}`,
    "title: test plan",
    `kind: ${spec.kind ?? "refactor"}`,
    "layer: L7",
    "drive: agent",
    `status: ${spec.status ?? "draft"}`,
  ];
  if (spec.routeMode !== null) lines.push(`route_mode: ${spec.routeMode ?? "refactor"}`);
  if (spec.entrySignals !== null) {
    lines.push("entry_signals:");
    for (const signal of spec.entrySignals ?? ["source-1"]) lines.push(`  - ${signal}`);
  }
  lines.push("---", `# ${spec.planId}`, "");
  writeFileSync(join(root, "docs", "plans", `${spec.planId}.md`), lines.join("\n"), "utf8");
}

function analyze(root: string, baseline: PlanEntryRoutingBaseline = EMPTY_BASELINE) {
  return analyzePlanEntryRouting(loadPlanEntryRoutingDocsFromDb(root), baseline);
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("plan-entry-routing gate (U-PROUTE-001..012)", () => {
  it("U-PROUTE-001: 実在 feedback source_id + kind 整合は ok", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-900-good" });
    const result = analyze(root);
    expect(result.checked).toBe(1);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-PROUTE-002: entry_signals なしの新規 PLAN は entry_signal_absent", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-901-no-signal", entrySignals: null });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_absent");
    expect(result.ok).toBe(false);
  });

  it("U-PROUTE-003: DB/queue に実在しない signal は entry_signal_unresolvable", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-902-unresolvable",
      entrySignals: ["missing-source"],
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_unresolvable");
  });

  it("U-PROUTE-004: refactor_candidate:* signal に kind=impl は kind_signal_mismatch", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-903-mismatch",
      kind: "impl",
      routeMode: "forward",
      entrySignals: ["source-refactor-candidate"],
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("kind_signal_mismatch");
  });

  it("U-PROUTE-005: po_directive は実在検査対象外で ok", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-904-po-directive",
      entrySignals: ["po_directive:2026-07-06 direct request"],
    });
    expect(analyze(root).ok).toBe(true);
  });

  it("U-PROUTE-006: baseline 記載は grandfathered、baseline 外追加違反で ok=false", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-905-legacy",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-L7-906-new",
      routeMode: null,
      entrySignals: null,
    });
    const result = analyze(root, {
      recorded: "2026-07-06",
      grandfathered: ["PLAN-L7-905-legacy"],
    });
    expect(result.grandfathered.map((v) => v.planId)).toContain("PLAN-L7-905-legacy");
    expect(result.newViolations.map((v) => v.planId)).toContain("PLAN-L7-906-new");
    expect(result.ok).toBe(false);
  });

  it("U-PROUTE-007: 性能語彙は kind=refactor に分類される", () => {
    expect(classifyTask({ text: "テストが遅いので高速化したい" }).kind).toBe("refactor");
  });

  it("U-PROUTE-008: DB 不在の feedback source_id は fail-close unresolvable", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-907-no-db" });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_unresolvable");
  });

  it("U-PROUTE-009: route_mode 未宣言の新規 PLAN は route_mode_absent", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-908-no-mode", routeMode: null });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("route_mode_absent");
  });

  it("U-PROUTE-010: route_mode 未宣言 legacy は prefix -> kind fallback で workflow mode を導出する", () => {
    expect(workflowModeForPlan({ planId: "PLAN-REVERSE-99-sample", kind: "reverse" })).toBe(
      "reverse",
    );
    expect(workflowModeForPlan({ planId: "PLAN-L7-909-refactor", kind: "refactor" })).toBe(
      "refactor",
    );
  });

  it("U-PROUTE-011: kind と route_mode の不整合は kind_route_mode_mismatch", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-910-mode-mismatch",
      kind: "impl",
      routeMode: "refactor",
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("kind_route_mode_mismatch");
  });

  it("U-PROUTE-012: DISCOVERY / M prefix と archived は検査対象外", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-DISCOVERY-99-sample",
      kind: "poc",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-M-99-sample",
      kind: "design",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-L7-911-archived",
      status: "archived",
      routeMode: null,
      entrySignals: null,
    });
    const result = analyze(root);
    expect(result.checked).toBe(0);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("baseline 機械生成: buildPlanEntryRoutingBaseline は違反 plan_id を昇順で固定する", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-913-b", routeMode: null, entrySignals: null });
    writePlan(root, { planId: "PLAN-L7-912-a", routeMode: null, entrySignals: null });
    const docs = loadPlanEntryRoutingDocsFromDb(root);
    const baseline = buildPlanEntryRoutingBaseline(docs, "2026-07-06");
    expect(baseline.grandfathered).toEqual(["PLAN-L7-912-a", "PLAN-L7-913-b"]);
    expect(analyzePlanEntryRouting(docs, baseline).ok).toBe(true);
  });

  it("baseline loader: 不在時は空 baseline を返す", () => {
    const root = makeRepo();
    expect(loadPlanEntryRoutingBaseline(root)).toEqual({ recorded: null, grandfathered: [] });
  });

  it("pure loader: DB を読まず entry signal を unresolved として保持する", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-914-pure-loader" });
    const docs = loadPlanEntryRoutingDocs(root);
    expect(docs[0]?.resolvedSignals).toEqual([
      { value: "source-1", token: null, kind: "unresolvable" },
    ]);
  });
});
