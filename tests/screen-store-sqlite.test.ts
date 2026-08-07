// PLAN-L7-514-screen-applicability-projection / U-SAPDB-001（SQLite-backed store の共有 contract）
import { describe, expect, it } from "vitest";
import {
  createSqliteScreenApplicabilityStore,
  ensureScreenApplicabilityTables,
  seedSqliteScreenStore,
} from "../src/design/screen-applicability-sqlite-store";
import { buildScreenStageClosureCommit } from "../src/design/screen-applicability-store";
import { openHarnessDb } from "../src/state-db";
import {
  NOW,
  registerScreenStoreContractSuite,
  seed,
  validCommit,
} from "./tools/screen-store-contract";

function makeDb() {
  const db = openHarnessDb(":memory:");
  ensureScreenApplicabilityTables(db);
  return db;
}

describe("U-SAPDB-001 SqliteScreenApplicabilityStore", () => {
  it("U-SAPDB-001: SQLite transactionでstage/gateをatomic commitし、rowsとheadsが永続化される", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe("committed");
        expect(result.value.inserted_completion_count).toBe(2);
      }
      expect(store.committedGateReceiptCount()).toBe(1);
      const completions = db
        .prepare("SELECT COUNT(*) AS n FROM screen_stage_completions")
        .get() as { n: number };
      expect(completions.n).toBe(2);
      const gate = db.prepare("SELECT verdict, operation_id FROM screen_gate_receipts").get() as {
        verdict: string;
        operation_id: string;
      };
      expect(gate.verdict).toBe("passed");
      expect(gate.operation_id).toBe("op-stage-closure-1");
      const heads = db
        .prepare("SELECT stage_head, gate_head FROM screen_stage_heads WHERE head_id = 'current'")
        .get() as { stage_head: string; gate_head: string };
      expect(heads.stage_head).not.toBe("sha256:stage-head-1");
      // 再構築した store でも同じ head/committed 状態が読める（永続化の同値性）。
      const reopened = createSqliteScreenApplicabilityStore(db, NOW);
      expect(reopened.stageHead()).toBe(heads.stage_head);
      expect(reopened.committedGateReceiptCount()).toBe(1);
    } finally {
      db.close();
    }
  });

  it("同一snapshotへの連続commitでprojectionは最新1行・receiptsはappend-onlyに残る", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      const first = await store.commitStageClosureAndGate(validCommit());
      expect(first.ok).toBe(true);
      if (!first.ok) return;
      const world = seed();
      world.stage_head = first.value.after_stage_head;
      world.gate_head = first.value.after_gate_head;
      const rebuilt = buildScreenStageClosureCommit({
        plan_route_receipt: validCommit().plan_route_receipt,
        closure: validCommit().closure,
        gate: {
          ...validCommit().gate,
          operation_id: "op-stage-closure-2",
          gate_receipt_id: "gate-candidate-2",
        },
        expected_stage_head: first.value.after_stage_head,
        expected_gate_head: first.value.after_gate_head,
      });
      expect(rebuilt.ok).toBe(true);
      if (!rebuilt.ok) return;
      const second = await store.commitStageClosureAndGate(rebuilt.value);
      expect(second.ok).toBe(true);
      const gates = db.prepare("SELECT COUNT(*) AS n FROM screen_gate_receipts").get() as {
        n: number;
      };
      const terminals = db.prepare("SELECT COUNT(*) AS n FROM screen_terminal_receipts").get() as {
        n: number;
      };
      const projections = db
        .prepare("SELECT COUNT(*) AS n, MAX(operation_id) AS op FROM screen_stage_projections")
        .get() as { n: number; op: string };
      expect(terminals.n).toBe(2);
      expect(projections.n).toBe(1);
      expect(projections.op).toBe("op-stage-closure-2");
      expect(gates.n).toBe(2);
    } finally {
      db.close();
    }
  });

  it("BEGIN失敗（lock競合相当）はtyped failureへ正規化される", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW, { injectBeginFault: true });
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
      expect(store.stageHead()).toBe("sha256:stage-head-1");
    } finally {
      db.close();
    }
  });

  it("hydrate〜lockの間に他commitがheadを前進させた場合はcas_conflictでrollbackする", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW, {
        onBeforeHeadUpdate: () => {
          db.prepare(
            "UPDATE screen_stage_heads SET stage_head = 'sha256:advanced-by-rival' WHERE head_id = 'current'",
          ).run();
        },
      });
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
      // 競合注入は同一 transaction 内のため rollback で巻き戻り、head は元値へ戻る
      // （検証点は cas_conflict による fail-close と gate 増分 0）。
      const heads = db
        .prepare("SELECT stage_head FROM screen_stage_heads WHERE head_id = 'current'")
        .get() as { stage_head: string };
      expect(heads.stage_head).toBe("sha256:stage-head-1");
    } finally {
      db.close();
    }
  });

  it("未seed DBのheads読み取りは空文字列fallback（fail-safe）", () => {
    const db = makeDb();
    try {
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      expect(store.stageHead()).toBe("");
      expect(store.gateHead()).toBe("");
    } finally {
      db.close();
    }
  });

  it("validateAgreementBackpropPairはSQLite経路でも同一契約で判定する", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      const world = seed();
      const agreement = world.agreement_authorities[0].receipt;
      const backprop = world.backprop_authorities[0].receipt;
      const completion = validCommit().closure.ui_completions[0];
      const ok = await store.validateAgreementBackpropPair(agreement, backprop, completion);
      expect(ok.ok).toBe(true);
      const bad = await store.validateAgreementBackpropPair(
        agreement,
        { ...backprop, agreement_id: "agreement-other" },
        completion,
      );
      expect(bad.ok).toBe(false);
    } finally {
      db.close();
    }
  });

  it("append fault注入時はtransaction rollbackで全行増分0・headsも不変", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW, {
        injectAppendFault: "screen_terminal_receipts",
      });
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
      for (const table of [
        "screen_stage_completions",
        "screen_stage_projections",
        "screen_gate_receipts",
        "screen_terminal_receipts",
      ]) {
        const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
        expect(row.n).toBe(0);
      }
      expect(store.stageHead()).toBe("sha256:stage-head-1");
      expect(store.gateHead()).toBe("sha256:gate-head-1");
    } finally {
      db.close();
    }
  });
});

registerScreenStoreContractSuite("sqlite", (world, trustedNow) => {
  const db = makeDb();
  seedSqliteScreenStore(db, world);
  return createSqliteScreenApplicabilityStore(db, trustedNow);
});
