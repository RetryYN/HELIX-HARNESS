import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  type DerivedHandoverSnapshot,
  deriveHandoverSnapshot,
  detectPointerDrift,
  renderCurrentPointer,
} from "../src/handover/handover-derivation";
import { type HarnessDb, openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

describe("handover DB derivation (PLAN-L7-355)", () => {
  let root: string | null = null;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("U-HDRV-001: fixture db derives active plans, blockers, feedback counts, and HEAD deterministically", () => {
    root = mkdtempSync(join(tmpdir(), "helix-handover-derivation-"));
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    migrate(db);
    insertPlan(db, "PLAN-L7-001", "draft", "2026-07-07T00:01:00.000Z");
    insertPlan(db, "PLAN-L7-002", "draft", "2026-07-07T00:02:00.000Z");
    insertPlan(db, "PLAN-L7-003", "completed", "2026-07-07T00:03:00.000Z");
    db.prepare(
      `INSERT INTO feedback_events
       (feedback_event_id, finding_id, plan_id, source_table, source_id, source_color, signal_type, severity, status, next_action, created_at)
       VALUES ('f1', '', 'PLAN-L7-002', 'findings', 'f1', '', 'missing-test-coverage', 'warn', 'open', 'add tests', '2026-07-07T00:04:00.000Z')`,
    ).run();
    db.close();

    const deps = derivationDeps("abc123", "feature/handover");
    const first = deriveHandoverSnapshot(deps);
    const second = deriveHandoverSnapshot(deps);

    expect(second).toEqual(first);
    expect(first.git).toEqual({ headSha: "abc123", branch: "feature/handover" });
    expect(first.activePlans.map((plan) => plan.planId)).toEqual(["PLAN-L7-002", "PLAN-L7-001"]);
    expect(first.outstanding.nonTerminalPlansTotal).toBe(2);
    expect(first.outstanding.completionReadiness.status).toBe("blocked");
    expect(first.feedback.open).toBe(1);
    expect(first.feedback.bySeverity).toEqual({ warn: 1 });
  });

  it("U-HDRV-002: render overwrites derived fields, preserves takeover_note, and drift is field-scoped", () => {
    const snapshot = snapshotFixture();
    const rendered = JSON.parse(
      renderCurrentPointer(snapshot, "keep this note", {
        now: () => "2026-07-07T00:10:00.000Z",
      }),
    );

    expect(rendered.takeover_note).toBe("keep this note");
    expect(rendered.active_plans).toEqual(snapshot.activePlans);
    expect(rendered.generator).toBe("helix handover");

    const edited = {
      ...rendered,
      active_plans: [],
      takeover_note: "human edit is preserved",
      generated_at: "2026-07-07T99:99:99.999Z",
    };
    const drift = detectPointerDrift(edited, snapshot);

    expect(drift.map((item) => item.field)).toEqual(["active_plans"]);
    expect(drift[0]?.expected).toEqual(snapshot.activePlans);
    expect(drift[0]?.actual).toEqual([]);
  });

  it("U-HDRV-003: db open failure and HEAD failure fail close", () => {
    expect(() =>
      deriveHandoverSnapshot({
        openDb: () => {
          throw new Error("db unavailable");
        },
        resolveGit: () => ({ headSha: "abc123", branch: "main" }),
      }),
    ).toThrow(/db unavailable/);

    root = mkdtempSync(join(tmpdir(), "helix-handover-derivation-"));
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    migrate(db);
    db.close();
    expect(() =>
      deriveHandoverSnapshot({
        openDb: () =>
          openHarnessDb(join(rootOrThrow(), ".helix", "harness.db"), { repoRoot: rootOrThrow() }),
        resolveGit: () => {
          throw new Error("HEAD unavailable");
        },
      }),
    ).toThrow(/HEAD unavailable/);
  });

  it("U-HDRV-004: regenerated pointer is idempotent except generated_at", () => {
    const snapshot = snapshotFixture();
    const first = JSON.parse(
      renderCurrentPointer(snapshot, null, { now: () => "2026-07-07T00:10:00.000Z" }),
    );
    const second = JSON.parse(
      renderCurrentPointer(snapshot, null, { now: () => "2026-07-07T00:11:00.000Z" }),
    );
    const { generated_at: _firstGeneratedAt, ...firstStable } = first;
    const { generated_at: _secondGeneratedAt, ...secondStable } = second;

    expect(firstStable).toEqual(secondStable);
    expect(first.generated_at).not.toBe(second.generated_at);
  });

  function derivationDeps(headSha: string, branch: string) {
    return {
      openDb: () =>
        openHarnessDb(join(rootOrThrow(), ".helix", "harness.db"), { repoRoot: rootOrThrow() }),
      resolveGit: () => ({ headSha, branch }),
    };
  }

  function rootOrThrow(): string {
    if (!root) throw new Error("test root not initialized");
    return root;
  }
});

function insertPlan(db: HarnessDb, planId: string, status: string, updatedAt: string): void {
  db.prepare(
    `INSERT INTO plan_registry
     (plan_id, kind, layer, sub_doc, drive, status, parent, updated_at, decision_outcome, source_hash)
     VALUES (?, 'impl', 'L7', '', 'be', ?, '', ?, '', '')`,
  ).run(planId, status, updatedAt);
}

function snapshotFixture(): DerivedHandoverSnapshot {
  return {
    activePlans: [
      {
        planId: "PLAN-L7-002",
        layer: "L7",
        kind: "impl",
        status: "draft",
        updatedAt: "2026-07-07T00:02:00.000Z",
      },
    ],
    outstanding: {
      nonTerminalPlansByLayer: { L7: 1 },
      nonTerminalPlansTotal: 1,
      blockersByKind: { active_draft: 1 },
      completionReadiness: {
        ok: false,
        status: "blocked",
        reason: "non-terminal PLANs or open defers remain",
        blockers: ["active_draft", "non_terminal_plans"],
        // authority 判定 (humanDecisionRequired / nextAuthority) はこの経路では導出しない
        // (plan_registry 射影に workflow_phase / version_target / 本文が無く false negative になるため)。
        authorityScope: "structural_only",
      },
    },
    feedback: {
      open: 0,
      bySeverity: {},
      recent: [],
    },
    git: { headSha: "abc123", branch: "feature/handover" },
  };
}
