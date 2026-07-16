import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  activatePo7Decision,
  transitionPo7Authority,
} from "../src/state-db/po7-decision-activation";
import { commitPostPoDesignFreezeTransition } from "../src/state-db/post-po-design-freeze-transition";

const repoRoot = resolve(import.meta.dirname, "..");
const transitionTables = [
  "design_freeze_transition_operations",
  "design_freeze_authority_link_events",
  "design_freeze_receipts",
  "design_freeze_projections",
  "design_freeze_progress_projections",
  "design_freeze_l01_candidates",
  "design_freeze_l01_handoffs",
  "design_freeze_transition_outbox",
  "design_freeze_transition_terminal_receipts",
];
const deps = { allowUnpushedHeadForTest: true };
const count = (db: ReturnType<typeof openHarnessDb>, table: string) =>
  Number(db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()?.n);
function seeded(suffix: string) {
  const db = openHarnessDb(":memory:");
  migrate(db);
  const authority = activatePo7Decision(db, {
    repoRoot,
    operationId: `PO7-DF-${suffix}`,
    idempotencyKey: `PO7-DF-ID-${suffix}`,
    expectedActivationEpoch: 0,
    expectedPreviousEventDigest: null,
  });
  return {
    db,
    authority,
    input: {
      repoRoot,
      operationId: `DF-${suffix}`,
      idempotencyKey: `DF-ID-${suffix}`,
      expectedAuthorityEpoch: 1,
      expectedPo7EventDigest: authority.eventDigest,
    },
  };
}

describe("post-PO Design Freeze transition", () => {
  it("sealed PO7を参照してfreeze/progress/L01 handoffをatomic commitしexact replayする", () => {
    const { db, input } = seeded("OK");
    const beforeTags = db
      .prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name LIKE '%tag%'")
      .get()?.n;
    const first = commitPostPoDesignFreezeTransition(db, input, deps);
    expect(first.replay).toBe(false);
    for (const table of transitionTables) expect(count(db, table)).toBe(1);
    expect(
      db
        .prepare(
          "SELECT design_open_rows,implementation_credit,verification_credit,coverage_credit,status FROM design_freeze_progress_projections",
        )
        .get(),
    ).toMatchObject({
      design_open_rows: 0,
      implementation_credit: 0,
      verification_credit: 0,
      coverage_credit: 0,
      status: "current",
    });
    expect(
      db
        .prepare(
          "SELECT local_state,pair_state,freeze_state,counted,remote_creation_state FROM design_freeze_l01_candidates",
        )
        .get(),
    ).toMatchObject({
      local_state: "proposed",
      pair_state: "pending_pair",
      freeze_state: "not_frozen",
      counted: 0,
      remote_creation_state: "not_created",
    });
    expect(
      db.prepare("SELECT delivery_class,status FROM design_freeze_transition_outbox").get(),
    ).toMatchObject({ delivery_class: "local_reconcile_only", status: "pending" });
    expect(commitPostPoDesignFreezeTransition(db, input, deps)).toMatchObject({
      replay: true,
      writeSetDigest: first.writeSetDigest,
    });
    expect(() =>
      commitPostPoDesignFreezeTransition(db, { ...input, operationId: "DF-CONFLICT" }, deps),
    ).toThrow(/idempotency conflict/);
    expect(
      db.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name LIKE '%tag%'").get()?.n,
    ).toBe(beforeTags);
    db.close();
  });

  it("9 write境界すべてで全transition rowをrollbackする", () => {
    for (let point = 1; point <= 9; point += 1) {
      const { db, input } = seeded(`FAULT-${point}`);
      expect(() =>
        commitPostPoDesignFreezeTransition(db, { ...input, faultAfterWrite: point }, deps),
      ).toThrow(new RegExp(`injected fault ${point}`));
      for (const table of transitionTables) expect(count(db, table)).toBe(0);
      db.close();
    }
  });

  it("current receiptの更新削除と二重freezeをDBで拒否する", () => {
    const { db, input } = seeded("IMMUTABLE");
    commitPostPoDesignFreezeTransition(db, input, deps);
    expect(() => db.prepare("UPDATE design_freeze_receipts SET status='stale'").run()).toThrow(
      /immutable/,
    );
    expect(() => db.prepare("DELETE FROM design_freeze_l01_candidates").run()).toThrow(/immutable/);
    expect(() =>
      commitPostPoDesignFreezeTransition(
        db,
        { ...input, operationId: "DF-SECOND", idempotencyKey: "DF-SECOND-ID" },
        deps,
      ),
    ).toThrow(/already exists/);
    db.close();
  });

  it("後続revoke後は旧active PO7 headを再利用しない", () => {
    const { db, authority, input } = seeded("REVOKED");
    transitionPo7Authority(db, {
      repoRoot,
      operationId: "PO7-DF-REVOKE",
      idempotencyKey: "PO7-DF-REVOKE-ID",
      expectedActivationEpoch: 1,
      expectedPreviousEventDigest: authority.eventDigest,
      status: "revoked",
      reason: "latest-head rejection oracle",
    });
    expect(() => commitPostPoDesignFreezeTransition(db, input, deps)).toThrow(
      /latest head is not active/,
    );
    for (const table of transitionTables) expect(count(db, table)).toBe(0);
    db.close();
  });
});
