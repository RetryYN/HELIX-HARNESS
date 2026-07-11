import { describe, expect, it } from "vitest";
import {
  buildAgentLockReport,
  buildAgentMessageDryRun,
} from "../src/runtime/agent-mailbox-conflict-locks";

describe("agent mailbox conflict locks", () => {
  it("fails closed when active locks conflict on the same path", () => {
    const report = buildAgentLockReport(
      [
        {
          lock_id: "lock-a",
          owner_session_id: "s1",
          plan_id: "PLAN-L7-365",
          path: "src/cli.ts",
          symbol: null,
          acquired_at: "2026-07-09T09:00:00.000Z",
          expires_at: null,
        },
        {
          lock_id: "lock-b",
          owner_session_id: "s2",
          plan_id: "PLAN-L7-365",
          path: "src/cli.ts",
          symbol: null,
          acquired_at: "2026-07-09T09:01:00.000Z",
          expires_at: null,
        },
      ],
      { now: "2026-07-09T10:00:00.000Z" },
    );

    expect(report.ok).toBe(false);
    expect(report.conflicts).toEqual([
      { path: "src/cli.ts", active_lock_ids: ["lock-a", "lock-b"], owners: ["s1", "s2"] },
    ]);
    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: "active_lock_conflict", severity: "error" }),
    );
  });

  it("keeps stale locks visible instead of auto-releasing them", () => {
    const report = buildAgentLockReport(
      [
        {
          lock_id: "lock-old",
          owner_session_id: "s1",
          plan_id: "PLAN-L7-365",
          path: "docs/a.md",
          symbol: null,
          acquired_at: "2026-07-09T08:00:00.000Z",
          expires_at: "2026-07-09T09:00:00.000Z",
        },
      ],
      { now: "2026-07-09T10:00:00.000Z" },
    );

    expect(report.ok).toBe(true);
    expect(report.stale_locks).toHaveLength(1);
    expect(report.stale_locks[0]).toMatchObject({ lock_id: "lock-old", status: "stale" });
  });

  it("builds mailbox messages as dry-run packets bound to task and plan", () => {
    expect(
      buildAgentMessageDryRun({
        fromSessionId: "s1",
        toSessionId: "s2",
        planId: "PLAN-L7-365",
        task: "review lock conflict",
        body: "please inspect src/cli.ts",
      }),
    ).toMatchObject({
      dry_run: true,
      from_session_id: "s1",
      to_session_id: "s2",
      plan_id: "PLAN-L7-365",
      task: "review lock conflict",
    });
  });
});
