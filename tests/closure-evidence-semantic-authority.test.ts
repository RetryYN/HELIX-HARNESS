import { describe, expect, it } from "vitest";
import {
  buildProjectClosureEvidenceApplyPlan,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureEvidenceProbePacket,
  buildProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

function fixture() {
  const db = openHarnessDb(":memory:", { repoRoot: process.cwd() });
  rebuildHarnessDb({ repoRoot: process.cwd(), db });
  const snapshot = buildProjectCurrentLocationSnapshot(db);
  const execution = {
    command: "npm run test:fast",
    session_id: "closure-probe:semantic-authority",
    correlation_id: "closure-correlation:semantic-authority",
    started_at: "2026-07-12T12:00:00.000Z",
    completed_at: "2026-07-12T12:01:00.000Z",
    exit_code: 0,
    status: "passed" as const,
    output_digest: `sha256:${"a".repeat(64)}`,
    stdout_bytes: 1,
    stderr_bytes: 0,
    output_excerpt: {
      stdout_head: "ok",
      stdout_tail: "ok",
      stderr_head: "",
      stderr_tail: "",
      truncated: false,
      limit: 4000,
    },
    error_message: null,
  };
  return { db, snapshot, execution };
}

describe("closure evidence semantic authority", () => {
  it("U-CESA-001: probe receiptはreview authorityをfail-closeする (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const probe = buildProjectClosureEvidenceProbePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        execution,
      });
      expect(probe.placeholder_resolution.fillable_placeholders).toEqual(
        expect.arrayContaining(["<green command>", "<probe_completed_at>", "<output>"]),
      );
      expect(probe.placeholder_resolution.fillable_placeholders).not.toContain("<reviewer>");
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialize_readiness.status).toBe("blocked_placeholders");
      expect(packet.materialize_readiness.allowed_to_apply).toBe(false);
      expect(packet.materialized_candidates).toHaveLength(3);
      for (const candidate of packet.materialized_candidates) {
        expect(candidate.ready_for_approval).toBe(false);
        expect(candidate.remaining_placeholder_count).toBeGreaterThan(0);
      }
      const semantic = packet.materialized_candidates.flatMap(
        (candidate) => candidate.remaining_placeholders,
      );
      expect(semantic).toEqual(
        expect.arrayContaining([
          "<reviewer>",
          "<reviewed_at>",
          "<oracle_id>",
          "<test case name>",
          "<recorded_at>",
          "<requirement_id>",
          "<test_oracle_id>",
          "<runtime verification claim>",
          "<runtime_occurred_at>",
        ]),
      );
      expect(semantic).not.toContain("<probe_completed_at>");
    } finally {
      db.close();
    }
  });

  it("U-CESA-002: generic suiteはPLAN固有oracleを確定しない (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialized_candidates[1]?.remaining_placeholders).toEqual(
        expect.arrayContaining(["<oracle_id>", "<test case name>", "<recorded_at>"]),
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-003: probe時刻をruntime観測時刻へ昇格しない (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      const runtime = packet.materialized_candidates[2];
      expect(runtime?.remaining_placeholders).toContain("<runtime_occurred_at>");
      expect(runtime?.materialized_preview_lines.join("\n")).not.toContain(
        `occurred_at: "${execution.completed_at}"`,
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-004: probe receiptはprocess fieldだけを埋める (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialized_candidates[0]?.filled_placeholders).toEqual(
        expect.arrayContaining(["<green command>", "<probe_completed_at>", "<output>"]),
      );
      expect(packet.materialized_candidates[0]?.remaining_placeholders).toEqual(
        expect.arrayContaining(["<reviewer>", "<reviewed_at>"]),
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-005: rollbackは物理削除でなくappend-only compensationを要求する (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const plan = buildProjectClosureEvidenceApplyPlan(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        approvalRecordText: null,
      });
      expect(plan.allowed_to_apply).toBe(false);
      for (const candidate of plan.patch_candidates) {
        expect(candidate.rollback_note).toMatch(/supersede|compensation/);
        expect(candidate.rollback_note).not.toMatch(/を削除|artifactを削除|blockだけを削除/);
      }
    } finally {
      db.close();
    }
  });
});
