import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildProjectClosureEvidenceApprovalDraftPacket,
  buildProjectCurrentLocationSnapshot,
  closureEvidenceApprovalDraftRefreshPath,
  type ProjectClosureEvidenceProbeExecution,
} from "../src/state-db/current-location";
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
          evidence_path: ".helix/evidence/run-debug/runtime-verification.jsonl",
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
          evidence_path: ".helix/evidence/run-debug/runtime-verification.jsonl",
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
          evidence_path: ".helix/evidence/run-debug/runtime-verification.jsonl",
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
      expect(first.project_current_location.current).toMatchObject({
        layer: "L7",
        l12_layer: "L6",
        status: "forward",
      });
      expect(first.project_current_location.drive_recommendation.model).toBe("Reverse");
      expect(first.project_current_location.design_coverage_gate).toMatchObject({
        status: "needs_design",
        missing: 12,
      });
      expect(first.vmodel_zip_manifest).toMatchObject({
        present: false,
        ok: true,
        entriesTotal: 0,
      });
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
      expect(snapshot.project_current_location.current).toMatchObject({
        layer: null,
        l12_layer: null,
        status: "unknown",
        completion_boundary: "open",
      });
      expect(snapshot.evidence.runtime_verification.total).toBe(0);
      expect(snapshot.vmodel_zip_manifest).toMatchObject({
        present: false,
        ok: true,
      });
      expect(snapshot.warnings).toEqual(["artifact_progress is empty; run `helix db rebuild`"]);
    } finally {
      db.close();
    }
  });

  it("detects local recovery handoff artifacts when repoRoot is provided", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-visualization-handoff-"));
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      mkdirSync(join(root, ".helix/tmp/closure"), { recursive: true });
      writeFileSync(
        join(root, ".helix/tmp/closure/repair_failed_evidence-probe-record.json"),
        JSON.stringify({ schema_version: "project-closure-evidence-probe.v1" }),
      );

      const snapshot = buildVisualizationSnapshot(db, { repoRoot: root });
      const probe = snapshot.recovery_handoff_artifacts.items.find(
        (item) => item.action === "repair_failed_evidence" && item.kind === "probe_record",
      );
      const draft = snapshot.recovery_handoff_artifacts.items.find(
        (item) => item.action === "repair_failed_evidence" && item.kind === "approval_draft",
      );

      expect(snapshot.recovery_handoff_artifacts).toMatchObject({
        present: 1,
        missing: 3,
        unchecked: 0,
      });
      expect(probe).toMatchObject({
        path: ".helix/tmp/closure/repair_failed_evidence-probe-record.json",
        status: "present",
        generation_status: "present",
        generation_command:
          "helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
        bytes: expect.any(Number),
        write_policy: "local-artifact-new-file",
      });
      expect(probe?.bytes).toBeGreaterThan(0);
      expect(probe?.sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(draft).toMatchObject({
        path: ".helix/tmp/closure/repair_failed_evidence-approval-draft.yml",
        status: "missing",
        generation_status: "ready_to_generate",
        generation_command:
          "helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
        bytes: null,
        sha256: null,
      });
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("validates approval draft scope against the current materialize digest", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-visualization-approval-scope-"));
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      mkdirSync(join(root, ".helix/tmp/closure"), { recursive: true });
      const execution: ProjectClosureEvidenceProbeExecution = {
        command: "bun run test:fast",
        session_id: "session-read-model",
        correlation_id: "corr-read-model",
        started_at: "2026-07-08T00:00:00.000Z",
        completed_at: "2026-07-08T00:01:00.000Z",
        exit_code: 0,
        status: "passed",
        output_digest: "sha256:probe-output",
        stdout_bytes: 12,
        stderr_bytes: 0,
        output_excerpt: {
          stdout_head: "ok",
          stdout_tail: "ok",
          stderr_head: "",
          stderr_tail: "",
          truncated: false,
          limit: 2000,
        },
        error_message: null,
      };
      writeFileSync(
        join(root, ".helix/tmp/closure/repair_failed_evidence-probe-record.json"),
        JSON.stringify({
          schema_version: "project-closure-evidence-probe.v1",
          execution,
        }),
      );
      const draft = buildProjectClosureEvidenceApprovalDraftPacket(
        buildProjectCurrentLocationSnapshot(db),
        {
          action: "repair_failed_evidence",
          limit: 1,
          probeExecution: execution,
        },
      );
      writeFileSync(
        join(root, ".helix/tmp/closure/repair_failed_evidence-approval-draft.yml"),
        draft.approval_record_text,
      );

      const snapshot = buildVisualizationSnapshot(db, { repoRoot: root });
      const approvalDraft = snapshot.recovery_handoff_artifacts.items.find(
        (item) => item.action === "repair_failed_evidence" && item.kind === "approval_draft",
      );

      expect(approvalDraft?.approval_record).toMatchObject({
        status: "pending_human_review",
        approval_scope_digest: draft.approval.approval_scope_digest,
        expected_approval_scope_digest: draft.approval.approval_scope_digest,
        scope_status: "match",
        valid_for_apply: false,
      });
      expect(approvalDraft?.approval_record?.reasons).toContain(
        "approval_scope_digest は current materialize scope と一致",
      );
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("detects matching refresh approval drafts without overwriting stale canonical drafts", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-visualization-refresh-scope-"));
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      mkdirSync(join(root, ".helix/tmp/closure"), { recursive: true });
      const execution: ProjectClosureEvidenceProbeExecution = {
        command: "bun run test:fast",
        session_id: "session-refresh-read-model",
        correlation_id: "corr-refresh-read-model",
        started_at: "2026-07-09T00:00:00.000Z",
        completed_at: "2026-07-09T00:01:00.000Z",
        exit_code: 0,
        status: "passed",
        output_digest: "sha256:probe-output-refresh",
        stdout_bytes: 12,
        stderr_bytes: 0,
        output_excerpt: {
          stdout_head: "ok",
          stdout_tail: "ok",
          stderr_head: "",
          stderr_tail: "",
          truncated: false,
          limit: 2000,
        },
        error_message: null,
      };
      writeFileSync(
        join(root, ".helix/tmp/closure/repair_failed_evidence-probe-record.json"),
        JSON.stringify({
          schema_version: "project-closure-evidence-probe.v1",
          execution,
        }),
      );
      const draft = buildProjectClosureEvidenceApprovalDraftPacket(
        buildProjectCurrentLocationSnapshot(db),
        {
          action: "repair_failed_evidence",
          limit: 1,
          probeExecution: execution,
        },
      );
      writeFileSync(
        join(root, ".helix/tmp/closure/repair_failed_evidence-approval-draft.yml"),
        draft.approval_record_text.replace(draft.approval.approval_scope_digest, "sha256:stale"),
      );
      const refreshPath = closureEvidenceApprovalDraftRefreshPath(
        "repair_failed_evidence",
        draft.approval.approval_scope_digest,
      );
      writeFileSync(join(root, refreshPath), draft.approval_record_text);

      const snapshot = buildVisualizationSnapshot(db, { repoRoot: root });
      const canonicalDraft = snapshot.recovery_handoff_artifacts.items.find(
        (item) => item.action === "repair_failed_evidence" && item.kind === "approval_draft",
      );
      const refreshDraft = snapshot.recovery_handoff_artifacts.items.find(
        (item) =>
          item.action === "repair_failed_evidence" && item.kind === "approval_refresh_draft",
      );

      expect(canonicalDraft?.approval_record).toMatchObject({
        approval_scope_digest: "sha256:stale",
        expected_approval_scope_digest: draft.approval.approval_scope_digest,
        scope_status: "mismatch",
      });
      expect(refreshDraft).toMatchObject({
        path: refreshPath,
        status: "present",
        generation_command: `helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out ${refreshPath} --summary-json`,
        approval_record: {
          status: "pending_human_review",
          approval_scope_digest: draft.approval.approval_scope_digest,
          expected_approval_scope_digest: draft.approval.approval_scope_digest,
          scope_status: "match",
          valid_for_apply: false,
        },
      });
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
