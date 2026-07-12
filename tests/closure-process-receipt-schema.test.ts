import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../src/schema/harness-db";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const receiptReferenceTables = ["test_runs", "gate_runs", "runner_attestations"];

// PLAN-L7-434-closure-evidence-materialization / U-CMAT-011
describe("U-CMAT-011: closure physical process receipt schema", () => {
  it("U-CMAT-011: legacy tablesへnullable receipt参照を加え、既存rowを保存する", () => {
    const db = openHarnessDb(":memory:");
    try {
      db.exec("CREATE TABLE test_runs (test_run_id TEXT PRIMARY KEY, status TEXT)");
      db.exec("CREATE TABLE gate_runs (gate_run_id TEXT PRIMARY KEY, status TEXT)");
      db.exec("CREATE TABLE runner_attestations (event_digest TEXT PRIMARY KEY, status TEXT)");
      db.prepare("INSERT INTO test_runs (test_run_id, status) VALUES (?, ?)").run(
        "test-1",
        "passed",
      );
      db.prepare("INSERT INTO gate_runs (gate_run_id, status) VALUES (?, ?)").run(
        "gate-1",
        "passed",
      );
      db.prepare("INSERT INTO runner_attestations (event_digest, status) VALUES (?, ?)").run(
        "event-1",
        "passed",
      );

      const result = migrate(db);
      expect(result.toVersion).toBe(SCHEMA_VERSION);
      expect(result.tables).toContain("closure_process_receipts");
      for (const table of receiptReferenceTables) {
        const columns = db
          .prepare(`PRAGMA table_info(${table})`)
          .all()
          .map((row) => String(row.name));
        expect(columns).toContain("process_receipt_key");
      }
      expect(
        db.prepare("SELECT process_receipt_key FROM test_runs WHERE test_run_id=?").get("test-1"),
      ).toEqual({ process_receipt_key: null });
      expect(
        db.prepare("SELECT process_receipt_key FROM gate_runs WHERE gate_run_id=?").get("gate-1"),
      ).toEqual({ process_receipt_key: null });
      expect(
        db
          .prepare("SELECT process_receipt_key FROM runner_attestations WHERE event_digest=?")
          .get("event-1"),
      ).toEqual({ process_receipt_key: null });
    } finally {
      db.close();
    }
  });

  it("receiptを一意保存し、更新・削除と同一HEAD+dedupe重複を拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const insert = db.prepare(`INSERT INTO closure_process_receipts
        (process_receipt_key, schema_version, materialization_id, kind, repository_head,
         executable, argv_json, dedupe_key, exit_code, signal, timed_out,
         stdout_digest, stderr_digest, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const values = [
        "receipt-1",
        "closure-process-receipt.v1",
        "mat-1",
        "test",
        "a".repeat(40),
        "bunx",
        '["vitest","run","tests/x.test.ts","--reporter=json"]',
        "sha256:dedupe",
        0,
        null,
        0,
        "sha256:stdout",
        "sha256:stderr",
        "2026-07-12T00:00:00Z",
      ];
      insert.run(...values);
      insert.run("receipt-2", ...values.slice(1));
      expect(db.prepare("SELECT COUNT(*) AS n FROM closure_process_receipts").get()?.n).toBe(2);
      expect(() =>
        db
          .prepare("UPDATE closure_process_receipts SET exit_code=1 WHERE process_receipt_key=?")
          .run("receipt-1"),
      ).toThrow(/closure process receipt immutable/);
      expect(() =>
        db
          .prepare("DELETE FROM closure_process_receipts WHERE process_receipt_key=?")
          .run("receipt-1"),
      ).toThrow(/closure process receipt immutable/);
    } finally {
      db.close();
    }
  });
});
