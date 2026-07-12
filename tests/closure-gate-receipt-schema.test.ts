import { describe, expect, it } from "vitest";
// PLAN-L7-434-closure-evidence-materialization
import { SCHEMA_VERSION } from "../src/schema/harness-db";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const receiptColumns = [
  "session_id",
  "command",
  "exit_code",
  "output_digest",
  "materialization_id",
];

describe("U-CMAT-007: gate_runs production receipt schema", () => {
  it("legacy schemaを正式migrationし、既存行を保ったままreceiptをroundtripする", () => {
    const db = openHarnessDb(":memory:");
    try {
      db.exec(`CREATE TABLE gate_runs (
        gate_run_id TEXT PRIMARY KEY,
        gate_id TEXT,
        plan_id TEXT,
        status TEXT,
        checked_at TEXT,
        evidence_path TEXT
      )`);
      db.prepare(`INSERT INTO gate_runs
        (gate_run_id, gate_id, plan_id, status, checked_at, evidence_path)
        VALUES (?, ?, ?, ?, ?, ?)`).run(
        "gate-run-legacy",
        "harness-check",
        "PLAN-L7-434",
        "passed",
        "2026-07-12T00:00:00Z",
        "legacy.json",
      );

      const result = migrate(db);
      expect(result.applied).toBe(true);
      expect(result.toVersion).toBe(SCHEMA_VERSION);
      const columns = db
        .prepare("PRAGMA table_info(gate_runs)")
        .all()
        .map((row) => String(row.name));
      expect(columns).toEqual(expect.arrayContaining(receiptColumns));
      expect(
        db
          .prepare("SELECT status, materialization_id FROM gate_runs WHERE gate_run_id = ?")
          .get("gate-run-legacy"),
      ).toEqual({ status: "passed", materialization_id: null });

      db.prepare(`UPDATE gate_runs SET
        session_id = ?, command = ?, exit_code = ?, output_digest = ?, materialization_id = ?
        WHERE gate_run_id = ?`).run(
        "session-1",
        "bun run test:fast",
        0,
        "sha256:abc",
        "mat-1",
        "gate-run-legacy",
      );
      expect(
        db
          .prepare(`SELECT session_id, command, exit_code, output_digest, materialization_id
        FROM gate_runs WHERE gate_run_id = ?`)
          .get("gate-run-legacy"),
      ).toEqual({
        session_id: "session-1",
        command: "bun run test:fast",
        exit_code: 0,
        output_digest: "sha256:abc",
        materialization_id: "mat-1",
      });
    } finally {
      db.close();
    }
  });

  it("receipt設定後はgate row全体の意味変更と行削除を拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      db.prepare(`INSERT INTO gate_runs
        (gate_run_id, gate_id, plan_id, status, checked_at, evidence_path,
         session_id, command, exit_code, output_digest, materialization_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        "gate-run-1",
        "harness-check",
        "PLAN-L7-434",
        "passed",
        "2026-07-12T00:00:00Z",
        "gate.json",
        "session-1",
        "bun run test:fast",
        0,
        "sha256:abc",
        "mat-1",
      );

      expect(() =>
        db
          .prepare("UPDATE gate_runs SET status = ? WHERE gate_run_id = ?")
          .run("failed", "gate-run-1"),
      ).toThrow(/gate run receipt immutable/);
      expect(() =>
        db
          .prepare("UPDATE gate_runs SET output_digest = ? WHERE gate_run_id = ?")
          .run("sha256:tampered", "gate-run-1"),
      ).toThrow(/gate run receipt immutable/);
      expect(() =>
        db.prepare("DELETE FROM gate_runs WHERE gate_run_id = ?").run("gate-run-1"),
      ).toThrow(/gate run receipt immutable/);
      expect(
        db.prepare("SELECT output_digest FROM gate_runs WHERE gate_run_id = ?").get("gate-run-1"),
      ).toEqual({ output_digest: "sha256:abc" });
    } finally {
      db.close();
    }
  });
});
