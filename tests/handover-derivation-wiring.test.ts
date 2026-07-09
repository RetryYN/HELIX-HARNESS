import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkHandoverDerivedPointerDrift,
  type HandoverDeps,
  runHandover,
} from "../src/handover/index";
import { type HarnessDb, openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const NOW = "2026-07-09T00:00:00.000Z";
const POINTER_PATH = ".helix/handover/CURRENT.json";

describe("PLAN-L7-396 handover derivation wiring", () => {
  let root: string | null = null;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("U-HOVER-021: runHandover writes DB-derived snapshot, preserves takeover note, and records prior drift", () => {
    root = mkdtempSync(join(tmpdir(), "helix-handover-wiring-"));
    const dbPath = join(root, ".helix", "harness.db");
    const db = openHarnessDb(dbPath, { repoRoot: root });
    migrate(db);
    insertPlan(db, "PLAN-L7-396-handover-derivation-wiring", "draft", "2026-07-09T00:01:00.000Z");
    insertPlan(db, "PLAN-L7-001-closed", "completed", "2026-07-09T00:02:00.000Z");
    db.prepare(
      `INSERT INTO feedback_events
       (feedback_event_id, finding_id, plan_id, source_table, source_id, source_color, signal_type, severity, status, next_action, created_at)
       VALUES ('feedback:1', '', 'PLAN-L7-396-handover-derivation-wiring', 'findings', 'f1', '', 'missing-test-coverage', 'warn', 'open', 'add wiring test', '2026-07-09T00:03:00.000Z')`,
    ).run();
    db.close();

    const deps = depsFor(root, dbPath);
    deps.files.set(
      join(root, ".helix", "state", "current-plan"),
      "PLAN-L7-396-handover-derivation-wiring",
    );
    deps.files.set(
      join(root, ".helix", "logs", "plan", "PLAN-L7-396-handover-derivation-wiring.digest.json"),
      JSON.stringify({
        plan_id: "PLAN-L7-396-handover-derivation-wiring",
        sessions: ["s1"],
        commits: ["abc123"],
        files_touched: ["src/handover/index.ts"],
        failures: [],
        updated_at: NOW,
      }),
    );
    deps.files.set(
      join(root, POINTER_PATH),
      JSON.stringify({
        generated_by: "helix-handover",
        active_plan: "PLAN-L7-396-handover-derivation-wiring",
        updated_at: NOW,
        takeover_note: "keep this note",
        derivedSnapshot: {
          activePlans: [],
          outstanding: {
            nonTerminalPlansByLayer: {},
            nonTerminalPlansTotal: 0,
            blockersByKind: {},
            completionReadiness: {
              ok: true,
              status: "ready",
              reason: "stale",
              blockers: [],
              authorityScope: "structural_only",
            },
          },
          feedback: { open: 0, bySeverity: {}, recent: [] },
          git: { headSha: "old", branch: "old-branch" },
        },
      }),
    );

    const first = runHandover({ date: "2026-07-09" }, deps);

    expect(first.written).toContain(POINTER_PATH);
    expect(first.pointer.takeover_note).toBe("keep this note");
    expect(first.pointer.derivedSnapshot?.activePlans.map((plan) => plan.planId)).toEqual([
      "PLAN-L7-396-handover-derivation-wiring",
    ]);
    expect(first.pointer.derivedSnapshot?.feedback.bySeverity).toEqual({ warn: 1 });
    expect(first.pointer.derivedPointerDrift?.map((item) => item.field)).toEqual([
      "active_plans",
      "outstanding",
      "feedback",
      "git",
    ]);
    expect(checkHandoverDerivedPointerDrift(deps)[0]).toContain("active_plans");

    const second = runHandover({ date: "2026-07-09" }, deps);

    expect(second.pointer.takeover_note).toBe("keep this note");
    expect(second.pointer.derivedPointerDrift).toEqual([]);
    expect(checkHandoverDerivedPointerDrift(deps)).toEqual([]);
  });
});

function depsFor(root: string, dbPath: string): HandoverDeps & { files: Map<string, string> } {
  const files = new Map<string, string>();
  return {
    files,
    repoRoot: root,
    now: () => NOW,
    readText: (path) => files.get(path) ?? null,
    writeText: (path, content) => files.set(path, content),
    listDir: (dir) =>
      [...files.keys()]
        .filter((path) => path.startsWith(`${dir}/`))
        .map((path) => path.slice(dir.length + 1)),
    openDb: () => openHarnessDb(dbPath, { repoRoot: root }),
    resolveGit: () => ({ headSha: "abc123", branch: "feature/handover" }),
  };
}

function insertPlan(db: HarnessDb, planId: string, status: string, updatedAt: string): void {
  db.prepare(
    `INSERT INTO plan_registry
     (plan_id, kind, layer, sub_doc, drive, status, parent, updated_at, decision_outcome, source_hash)
     VALUES (?, 'impl', 'L7', '', 'be', ?, '', ?, '', '')`,
  ).run(planId, status, updatedAt);
}
