import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAgentSessionBoardReport } from "../src/runtime/agent-session-command-center";

describe("agent session command center", () => {
  it("separates active and stale sessions deterministically", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-session-board-"));
    try {
      mkdirSync(join(root, ".helix", "state"), { recursive: true });
      mkdirSync(join(root, ".helix", "handover"), { recursive: true });
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
      writeFileSync(
        join(root, ".helix", "handover", "CURRENT.json"),
        JSON.stringify({
          active_plan: "PLAN-L7-364",
          status: "in_progress",
          updated_at: "2026-07-09T10:02:00.000Z",
          latest_doc: "docs/handover/session.md",
          outstanding: {
            items: [{ planId: "PLAN-L7-364", requiredActionJa: "次の証跡を集める" }],
          },
        }),
      );

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
      expect(report.rows.find((row) => row.session_id === "handover-current")).toMatchObject({
        plan_id: "PLAN-L7-364",
        next_action: "次の証跡を集める",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
