import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../src/schema/harness-db";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

describe("[PLAN-L7-444/U-TEAMRUN-004] team review receipt schema", () => {
  it("adds an indexed append-only receipt table", () => {
    const db = openHarnessDb(":memory:");
    try {
      const result = migrate(db);
      expect(result.toVersion).toBe(SCHEMA_VERSION);
      expect(result.tables).toContain("team_member_run_receipts");
      db.prepare(`INSERT INTO team_member_run_receipts
        (receipt_id, team_run_id, plan_id, team, member_index, role, engine, provider, model,
         repository_head, slot_id, exit_code, status, verdict, verdict_status, output_digest,
         output_bytes, output_truncated, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        "run-1:1",
        "run-1",
        "PLAN-L7-444-team-review-evidence-capture",
        "review-team",
        1,
        "tl",
        "pmo-sonnet",
        "claude",
        "claude-sonnet-5",
        "abc",
        "slot-1",
        0,
        "completed",
        "pass",
        "accepted",
        `sha256:${"a".repeat(64)}`,
        14,
        0,
        "2026-07-13T00:00:00.000Z",
      );
      expect(db.prepare("SELECT verdict FROM team_member_run_receipts").get()).toEqual({
        verdict: "pass",
      });
      expect(() => db.exec("UPDATE team_member_run_receipts SET verdict='fail'")).toThrow(
        /immutable/,
      );
      expect(() => db.exec("DELETE FROM team_member_run_receipts")).toThrow(/immutable/);
    } finally {
      db.close();
    }
  });
});
