import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkTeamReviewReceipts } from "../src/doctor";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

describe("[PLAN-L7-444/U-TEAMRUN-004] team review receipt doctor", () => {
  it("accepts explicit cross-provider PASS and rejects an unbound completed reviewer", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-team-receipt-doctor-"));
    mkdirSync(join(root, ".helix"));
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    try {
      migrate(db);
      const insert = db.prepare(`INSERT INTO team_member_run_receipts
        (receipt_id, team_run_id, plan_id, team, member_index, role, engine, provider, model,
         repository_head, slot_id, exit_code, status, verdict, verdict_status, output_digest,
         output_bytes, output_truncated, completed_at)
        VALUES (?, ?, ?, 't', ?, ?, 'e', ?, 'm', ?, ?, 0, 'completed', ?, ?, ?, 1, 0, '2026-07-13')`);
      insert.run(
        "r:0",
        "r",
        "PLAN-L7-444",
        0,
        "se",
        "codex",
        "head",
        "s0",
        null,
        "not_required",
        `sha256:${"a".repeat(64)}`,
      );
      insert.run(
        "r:1",
        "r",
        "PLAN-L7-444",
        1,
        "tl",
        "claude",
        "head",
        "s1",
        "pass",
        "accepted",
        `sha256:${"b".repeat(64)}`,
      );
      expect(checkTeamReviewReceipts(root).ok).toBe(true);
      db.exec(`INSERT INTO team_member_run_receipts
        SELECT 'null:0', 'null', plan_id, team, 0, 'se', engine, 'codex', model,
               repository_head, 'null-worker', 0, 'completed', NULL, 'not_required', output_digest,
               output_bytes, output_truncated, completed_at
        FROM team_member_run_receipts WHERE receipt_id='r:0'`);
      db.exec(`INSERT INTO team_member_run_receipts
        SELECT 'null:1', 'null', plan_id, team, 1, 'tl', engine, 'claude', model,
               repository_head, 'null-reviewer', NULL, 'completed', NULL, 'accepted', output_digest,
               output_bytes, output_truncated, completed_at
        FROM team_member_run_receipts WHERE receipt_id='r:1'`);
      expect(checkTeamReviewReceipts(root)).toMatchObject({ ok: false });
      insert.run(
        "bad:0",
        "bad",
        "PLAN-L7-444",
        0,
        "se",
        "codex",
        "old-head",
        "s2",
        null,
        "not_required",
        `sha256:${"c".repeat(64)}`,
      );
      insert.run(
        "bad:1",
        "bad",
        "PLAN-L7-444",
        1,
        "qa",
        "claude",
        "current-head",
        "s3",
        "pass",
        "accepted",
        `sha256:${"d".repeat(64)}`,
      );
      expect(checkTeamReviewReceipts(root)).toMatchObject({ ok: false });
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
