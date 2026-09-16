import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../src/schema/harness-db";
import {
  type ClosureAuthorityReviewDbReceipt,
  recordClosureAuthorityReviewReceipt,
} from "../src/state-db/closure-authority-backfill";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const sha = (char: string) => `sha256:${char.repeat(64)}` as const;
const row = (): ClosureAuthorityReviewDbReceipt => ({
  receipt_id: "review-task-1",
  worker_run_id: "worker-run-1",
  reviewer_run_id: "reviewer-run-1",
  artifact_path: ".helix/evidence/review.json",
  artifact_digest: sha("a"),
  repository_head: "b".repeat(40),
  bundle_digest: sha("c"),
  proposal_set_digest: sha("d"),
  recompute_digest: sha("e"),
  verdict_digest: sha("f"),
  status: "completed",
  exit_code: 0,
  completed_at: "2026-07-12T00:30:00.000Z",
});

describe("closure authority review receipt canonical schema", () => {
  it("legacy DBへadditive tableを追加し既存table rowを保存する", () => {
    const db = openHarnessDb(":memory:");
    try {
      db.exec("CREATE TABLE plan_registry (plan_id TEXT PRIMARY KEY, status TEXT)");
      db.prepare("INSERT INTO plan_registry (plan_id, status) VALUES (?, ?)").run(
        "PLAN-L7-1-existing",
        "completed",
      );
      const result = migrate(db);
      expect(result.toVersion).toBe(SCHEMA_VERSION);
      expect(result.tables).toContain("closure_authority_review_receipts");
      expect(
        db.prepare("SELECT status FROM plan_registry WHERE plan_id=?").get("PLAN-L7-1-existing"),
      ).toEqual({ status: "completed" });
    } finally {
      db.close();
    }
  });

  it("writerはimmutable insertをidempotent化し同ID conflict/update/deleteを拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const receipt = row();
      recordClosureAuthorityReviewReceipt(db, receipt);
      recordClosureAuthorityReviewReceipt(db, receipt);
      expect(
        db.prepare("SELECT COUNT(*) AS n FROM closure_authority_review_receipts").get()?.n,
      ).toBe(1);
      expect(() =>
        recordClosureAuthorityReviewReceipt(db, { ...receipt, artifact_digest: sha("9") }),
      ).toThrow(/conflict/);
      expect(() =>
        db
          .prepare("UPDATE closure_authority_review_receipts SET exit_code=1 WHERE receipt_id=?")
          .run(receipt.receipt_id),
      ).toThrow(/immutable/);
      expect(() =>
        db
          .prepare("DELETE FROM closure_authority_review_receipts WHERE receipt_id=?")
          .run(receipt.receipt_id),
      ).toThrow(/immutable/);
    } finally {
      db.close();
    }
  });
});
