import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAgentSessionBoardReport } from "../src/runtime/agent-session-command-center";
import { buildContinuationEvent, projectContinuationEvent } from "../src/runtime/continuation";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

describe("agent session command center", () => {
  it("separates active and stale sessions deterministically", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-session-board-"));
    try {
      mkdirSync(join(root, ".helix", "state"), { recursive: true });
      writeFileSync(
        join(root, ".helix", "state", "agent-slots.json"),
        `${JSON.stringify(
          [
            {
              slot_id: "slot-active",
              agent_kind: "codex-se",
              role: "se",
              slot_source: "manual",
              fired_at: "2026-07-09T10:00:00.000Z",
              released_at: null,
              status: "running",
              exit_code: null,
            },
            {
              slot_id: "slot-stale",
              agent_kind: "codex-qa",
              role: "qa",
              slot_source: "manual",
              fired_at: "2026-07-09T09:00:00.000Z",
              released_at: null,
              status: "running",
              exit_code: null,
            },
          ],
          null,
          2,
        )}\n`,
      );
      const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
      migrate(db);
      projectContinuationEvent(
        db,
        buildContinuationEvent({
          eventId: "continuation-board-1",
          operationId: "board-operation-1",
          sessionId: "session-current",
          eventSeq: 1,
          recordedAt: "2026-07-09T10:02:00.000Z",
          payload: {
            eventKind: "plan_completed",
            planId: "PLAN-L7-364",
            nextAction: "次の証跡を集める",
            memoryRef: "memory://continuation/session-current",
          },
        }),
      );
      db.close();

      const report = buildAgentSessionBoardReport(root, {
        now: "2026-07-09T10:06:00.000Z",
        staleMinutes: 30,
      });

      expect(report.ok).toBe(true);
      expect(report.counts.active).toBe(2);
      expect(report.counts.stale).toBe(1);
      expect(report.rows.find((row) => row.session_id === "slot-stale")).toMatchObject({
        state: "stale",
        needs_you_reason: "stale_session",
      });
      expect(report.rows.find((row) => row.session_id === "session-current")).toMatchObject({
        plan_id: "PLAN-L7-364",
        next_action: "次の証跡を集める",
        source: "continuation_projection",
        continuation_ref: "harness.db:session_events#continuation-board-1",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails closed instead of degrading to slot-only when continuation is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-session-board-missing-"));
    try {
      mkdirSync(join(root, ".helix", "state"), { recursive: true });
      writeFileSync(join(root, ".helix", "state", "agent-slots.json"), "[]\n");
      const report = buildAgentSessionBoardReport(root);
      expect(report.ok).toBe(false);
      expect(report.findings).toContainEqual(
        expect.objectContaining({ code: "continuation_projection_missing", severity: "error" }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
