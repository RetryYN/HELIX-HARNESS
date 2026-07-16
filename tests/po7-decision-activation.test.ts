import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  activatePo7Decision,
  transitionPo7Authority,
} from "../src/state-db/po7-decision-activation";

const repoRoot = resolve(import.meta.dirname, "..");
// PLAN-L7-459-design-freeze-authority-transition
const base = (suffix = "1") => ({
  repoRoot,
  operationId: `PO7-ACT-${suffix}`,
  idempotencyKey: `PO7-IDEMP-${suffix}`,
  expectedActivationEpoch: 0,
  expectedPreviousEventDigest: null,
});
const count = (db: ReturnType<typeof openHarnessDb>, table: string) =>
  Number(db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()?.n);
const tables = [
  "po7_activation_operations",
  "po7_group_option_receipts",
  "po7_question_answer_receipts",
  "po7_vmodel_authority_events",
  "po7_activation_projections",
  "po7_activation_terminal_receipts",
];

describe("PO7 decision activation writer", () => {
  it("U-DFA-002: current repo authorityからA×6/22/VMAUTHをatomic activationしexact replayする", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    expect(() =>
      db.exec("INSERT INTO po7_activation_terminal_receipts(receipt_id) VALUES (NULL)"),
    ).toThrow();
    const first = activatePo7Decision(db, base());
    expect(first).toMatchObject({ replay: false, authorityEpoch: 1 });
    expect(count(db, "po7_group_option_receipts")).toBe(6);
    expect(count(db, "po7_question_answer_receipts")).toBe(22);
    expect(count(db, "po7_vmodel_authority_events")).toBe(1);
    expect(count(db, "po7_activation_projections")).toBe(1);
    expect(count(db, "po7_activation_terminal_receipts")).toBe(1);
    expect(
      db
        .prepare(
          "SELECT COUNT(*) n FROM po7_question_answer_receipts WHERE queue_id='' OR selected_option_id<>'A'",
        )
        .get()?.n,
    ).toBe(0);
    expect(activatePo7Decision(db, base())).toMatchObject({
      replay: true,
      operationId: "PO7-ACT-1",
      eventDigest: first.eventDigest,
    });
    expect(() =>
      activatePo7Decision(db, {
        ...base(),
        operationId: "PO7-ACT-CONFLICT",
        expectedActivationEpoch: 1,
      }),
    ).toThrow(/idempotency conflict/);
    db.close();
  });

  it("全32 write境界faultを全rollbackする", () => {
    for (let point = 1; point <= 32; point += 1) {
      const db = openHarnessDb(":memory:");
      migrate(db);
      expect(() =>
        activatePo7Decision(db, { ...base(String(point)), faultAfterWrite: point }),
      ).toThrow(new RegExp(`injected fault ${point}`));
      for (const table of tables) expect(count(db, table)).toBe(0);
      db.close();
    }
  });

  it("DB CHECK・immutability・CASを機械強制する", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    expect(() =>
      db
        .prepare(`INSERT INTO po7_group_option_receipts VALUES (${Array(18).fill("?").join(",")})`)
        .run(
          "R",
          "O",
          "UWR-PO-DG-01",
          "B",
          "a".repeat(64),
          "b".repeat(64),
          "c".repeat(64),
          "PO",
          "requirements-and-authoring-authority",
          "d".repeat(64),
          "I",
          1,
          "",
          "E",
          "e".repeat(64),
          "f".repeat(64),
          new Date().toISOString(),
          "active",
        ),
    ).toThrow();
    const active = activatePo7Decision(db, base("CHECK"));
    expect(() => db.prepare("UPDATE po7_group_option_receipts SET status='revoked'").run()).toThrow(
      /immutable/,
    );
    expect(() => db.prepare("DELETE FROM po7_activation_projections").run()).toThrow(/immutable/);
    expect(() =>
      activatePo7Decision(db, {
        ...base("CAS"),
        expectedActivationEpoch: 0,
        expectedPreviousEventDigest: null,
      }),
    ).toThrow(/CAS conflict/);
    const revokeInput = {
      repoRoot,
      operationId: "PO7-REVOKE-1",
      idempotencyKey: "PO7-REVOKE-IDEMP-1",
      expectedActivationEpoch: 1,
      expectedPreviousEventDigest: active.eventDigest,
      status: "revoked" as const,
      reason: "PO explicit revoke test",
    };
    const lifecycle = transitionPo7Authority(db, revokeInput);
    expect(lifecycle.authorityEpoch).toBe(2);
    expect(transitionPo7Authority(db, revokeInput)).toMatchObject({
      replay: true,
      eventDigest: lifecycle.eventDigest,
    });
    expect(count(db, "po7_group_option_receipts")).toBe(12);
    expect(count(db, "po7_question_answer_receipts")).toBe(44);
    expect(
      db
        .prepare(
          "SELECT freeze_blocker_status,status FROM po7_activation_projections ORDER BY authority_epoch DESC LIMIT 1",
        )
        .get(),
    ).toMatchObject({ freeze_blocker_status: "reopened", status: "revoked" });
    expect(() =>
      activatePo7Decision(db, {
        ...base("REUSE"),
        expectedActivationEpoch: 2,
        expectedPreviousEventDigest: lifecycle.eventDigest,
      }),
    ).toThrow(/consumed authority event/);
    expect(() =>
      transitionPo7Authority(db, {
        repoRoot,
        operationId: "PO7-SUPERSEDE-1",
        idempotencyKey: "PO7-SUPERSEDE-IDEMP-1",
        expectedActivationEpoch: 2,
        expectedPreviousEventDigest: lifecycle.eventDigest,
        status: "superseded",
        reason: "unverified replacement",
      } as never),
    ).toThrow();
    db.close();
  });

  it("別connectionのsame-key replayをterminalへ収束する", () => {
    const dir = mkdtempSync(resolve(tmpdir(), "helix-po7-"));
    mkdirSync(resolve(dir, ".helix"));
    const dbPath = resolve(dir, ".helix", "state.sqlite");
    const firstDb = openHarnessDb(dbPath, { repoRoot: dir });
    migrate(firstDb);
    const first = activatePo7Decision(firstDb, base("RACE"));
    firstDb.close();
    const secondDb = openHarnessDb(dbPath, { repoRoot: dir });
    expect(activatePo7Decision(secondDb, base("RACE"))).toMatchObject({
      replay: true,
      eventDigest: first.eventDigest,
    });
    secondDb.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
