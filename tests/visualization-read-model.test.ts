import { describe, expect, it } from "vitest";
import { openHarnessDb, upsertRow } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import { buildVisualizationSnapshot } from "../src/state-db/visualization-read-model";

describe("visualization read model", () => {
  it("builds a deterministic snapshot without treating projection-only evidence as accepted", () => {
    // U-VISUAL-001 / U-VISUAL-002: deterministic first response and runtime evidence class separation.
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          kind: "add-impl",
          layer: "L7",
          drive: "be",
          status: "confirmed",
          updated_at: "2026-06-30T03:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_progress",
        primaryKey: "artifact_path",
        row: {
          artifact_path: "src/state-db/visualization-read-model.ts",
          artifact_type: "source_module",
          artifact_hash: "sha256:source",
          state: "covered",
          color: "green",
          linked_test_count: 1,
          passed_test_run_count: 1,
          dependency_checked: 1,
          open_dependency_impacts: 0,
          indexed_at: "2026-06-30T03:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_progress",
        primaryKey: "artifact_path",
        row: {
          artifact_path: "docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md",
          artifact_type: "markdown_doc",
          artifact_hash: "sha256:plan",
          state: "dependency-unchecked",
          color: "red",
          linked_test_count: 0,
          passed_test_run_count: 0,
          dependency_checked: 0,
          open_dependency_impacts: 1,
          indexed_at: "2026-06-30T03:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "gate_runs",
        primaryKey: "gate_run_id",
        row: {
          gate_run_id: "gate:visualization",
          gate_id: "G7",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          status: "passed",
          checked_at: "2026-06-30T03:03:00.000Z",
          evidence_path: "tests/visualization-read-model.test.ts",
        },
      });
      upsertRow(db, {
        table: "graph_nodes",
        primaryKey: "node_id",
        row: {
          node_id: "node:plan",
          node_type: "plan",
          subject_id: "PLAN-L7-206-visualization-read-model-response",
          indexed_at: "2026-06-30T03:04:00.000Z",
        },
      });
      upsertRow(db, {
        table: "dependency_edges",
        primaryKey: "edge_id",
        row: {
          edge_id: "edge:plan-source",
          from_node_id: "node:plan",
          to_node_id: "node:source",
          edge_kind: "implements",
          strength: 1,
          indexed_at: "2026-06-30T03:05:00.000Z",
        },
      });
      upsertRow(db, {
        table: "graph_snapshots",
        primaryKey: "graph_snapshot_id",
        row: {
          graph_snapshot_id: "snapshot:visualization",
          scope: "repo",
          node_count: 1,
          edge_count: 1,
          hash: "sha256:graph",
          created_at: "2026-06-30T03:06:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "test:visualization",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          command: "bun run vitest run tests/visualization-read-model.test.ts",
          runner: "bun",
          exit_code: 0,
          status: "passed",
          completed_at: "2026-06-30T03:07:00.000Z",
          evidence_path: "tests/visualization-read-model.test.ts",
        },
      });
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "runtime:accepted",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          claim: "progress snapshot command executed",
          session_id: "session-1",
          source: "runtime-hook",
          runtime_surface: "cli",
          evidence_path: ".ut-tdd/evidence/run-debug/runtime-verification.jsonl",
          occurred_at: "2026-06-30T03:08:00.000Z",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
      });
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "runtime:projection-only",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          claim: "projection row exists",
          evidence_path: ".ut-tdd/evidence/run-debug/runtime-verification.jsonl",
          occurred_at: "2026-06-30T03:09:00.000Z",
          verification_class: "projection_only_unverified",
          accept_status: "blocked",
        },
      });
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "runtime:inconsistent-projection-accepted",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          claim: "bad projection row should not count as accepted",
          evidence_path: ".ut-tdd/evidence/run-debug/runtime-verification.jsonl",
          occurred_at: "2026-06-30T03:09:30.000Z",
          verification_class: "projection_only_unverified",
          accept_status: "accepted",
        },
      });
      upsertRow(db, {
        table: "skill_invocations",
        primaryKey: "skill_invocation_id",
        row: {
          skill_invocation_id: "skill:visualization",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          skill_id: "skill:design",
          fired_at: "2026-06-30T03:10:00.000Z",
          accepted: 1,
        },
      });
      upsertRow(db, {
        table: "model_runs",
        primaryKey: "run_id",
        row: {
          run_id: "model:visualization",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          model: "codex",
          completed_at: "2026-06-30T03:11:00.000Z",
        },
      });
      upsertRow(db, {
        table: "guardrail_decisions",
        primaryKey: "guardrail_decision_id",
        row: {
          guardrail_decision_id: "guard:visualization",
          plan_id: "PLAN-L7-206-visualization-read-model-response",
          guardrail: "readonly-visualization",
          decision: "allow",
          human_signoff_required: 0,
          decided_at: "2026-06-30T03:12:00.000Z",
        },
      });

      const first = buildVisualizationSnapshot(db);
      const second = buildVisualizationSnapshot(db);

      expect(first).toEqual(second);
      expect(first.source_clock).toBe("2026-06-30T03:12:00.000Z");
      expect(first.progress.artifacts).toMatchObject({ total: 2, red: 1, green: 1 });
      expect(first.progress.gates).toMatchObject({ total: 1, passed: 1 });
      expect(first.graph).toMatchObject({
        nodes: 1,
        edges: 1,
        snapshots: 1,
        latest_snapshot_hash: "sha256:graph",
      });
      expect(first.evidence.test_runs).toMatchObject({ total: 1, passed: 1, failed: 0 });
      expect(first.evidence.runtime_verification).toMatchObject({
        total: 3,
        runtime_verified: 1,
        projection_only_unverified: 2,
        accepted: 1,
        blocked: 1,
      });
      expect(first.evidence.skill_invocations).toEqual({ total: 1, accepted: 1 });
      expect(first.evidence.model_runs.total).toBe(1);
      expect(first.evidence.guardrail_decisions).toMatchObject({ total: 1, allow: 1 });
      expect(first.warnings).toContain(
        "runtime verification includes non-accepted projection-only or missing-provenance rows",
      );
    } finally {
      db.close();
    }
  });

  it("returns cold-start zeros and a rebuild warning", () => {
    // U-VISUAL-001: cold-start is explicit zeros, not fabricated success.
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const snapshot = buildVisualizationSnapshot(db);
      expect(snapshot.source_clock).toBeNull();
      expect(snapshot.progress.artifacts.total).toBe(0);
      expect(snapshot.progress.plans.by_status).toEqual({});
      expect(snapshot.evidence.runtime_verification.total).toBe(0);
      expect(snapshot.warnings).toEqual(["artifact_progress is empty; run `ut-tdd db rebuild`"]);
    } finally {
      db.close();
    }
  });
});
