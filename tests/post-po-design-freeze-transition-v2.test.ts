import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { observeCanonicalDesignDenominator } from "../src/state-db/design-denominator-observer";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  activatePo7Decision,
  transitionPo7Authority,
} from "../src/state-db/po7-decision-activation";
import {
  commitPostPoDesignFreezeTransitionV2,
  DESIGN_FREEZE_V2_GENESIS_HEAD,
  observeDesignFreezeEvidenceV2,
} from "../src/state-db/post-po-design-freeze-transition-v2";

const repoRoot = resolve(import.meta.dirname, "..");
// PLAN-L7-459-design-freeze-authority-transition
const tables = [
  "design_freeze_v2_transition_operations",
  "design_freeze_v2_authority_link_events",
  "design_freeze_v2_receipts",
  "design_freeze_v2_projections",
  "design_freeze_v2_progress_projections",
  "design_freeze_v2_l01_candidates",
  "design_freeze_v2_l01_handoffs",
  "design_freeze_v2_transition_outbox",
  "design_freeze_v2_transition_terminal_receipts",
];
const count = (db: ReturnType<typeof openHarnessDb>, table: string) =>
  Number(db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()?.n);
const denominator = observeCanonicalDesignDenominator({ repoRoot });
const testDenominator = { ...denominator, headDigestMatchCount: 76, headDigestMismatchCount: 0 };
const repository = {
  ...denominator.sourceRepository,
  remoteRefs: [{ ref: "refs/heads/test", oid: denominator.sourceRepository.headOid }],
  remoteObservationDigest: "a".repeat(64),
  indexPolicyDigest: "b".repeat(64),
};
const evidence = observeDesignFreezeEvidenceV2(repoRoot, false);
const deps = {
  observeDenominator: () => testDenominator,
  observeRepository: () => repository,
  observeEvidence: () => evidence,
  trustedNow: () => "2026-07-16T10:00:00.000Z",
};
const genesis = {
  authority: DESIGN_FREEZE_V2_GENESIS_HEAD,
  freeze: DESIGN_FREEZE_V2_GENESIS_HEAD,
  progress: DESIGN_FREEZE_V2_GENESIS_HEAD,
  candidate: DESIGN_FREEZE_V2_GENESIS_HEAD,
};
function seeded(suffix: string) {
  const db = openHarnessDb(":memory:");
  migrate(db);
  const po7 = activatePo7Decision(db, {
    repoRoot,
    operationId: `PO7-V2-${suffix}`,
    idempotencyKey: `PO7-V2-ID-${suffix}`,
    expectedActivationEpoch: 0,
    expectedPreviousEventDigest: null,
  });
  return {
    db,
    po7,
    input: {
      repoRoot,
      operationId: `DF-V2-${suffix}`,
      idempotencyKey: `DF-V2-ID-${suffix}`,
      expectedPo7Epoch: 1,
      expectedPo7EventDigest: po7.eventDigest,
      expectedHeads: genesis,
      expiresAt: "2026-07-17T10:00:00.000Z",
      supersedesReceiptDigest: DESIGN_FREEZE_V2_GENESIS_HEAD,
    },
  };
}

describe("post-PO Design Freeze transition v2", () => {
  it("U-DFA-004: 4-head CAS・19/76・full preimageを9境界でcommitしexact replayする", () => {
    const { db, input } = seeded("OK");
    const first = commitPostPoDesignFreezeTransitionV2(db, input, deps);
    expect(first.replay).toBe(false);
    for (const table of tables) expect(count(db, table)).toBe(1);
    const op = db.prepare("SELECT * FROM design_freeze_v2_transition_operations").get();
    expect(op).toMatchObject({
      design_slice_denominator: 19,
      design_artifact_denominator: 76,
      expected_authority_head_digest: genesis.authority,
      current_authority_head_digest: genesis.authority,
      status: "current",
    });
    expect(
      JSON.parse(String(op?.full_preimage_json)).design_denominator.artifactObservations,
    ).toHaveLength(76);
    expect(commitPostPoDesignFreezeTransitionV2(db, input, deps)).toMatchObject({
      replay: true,
      writeSetDigest: first.writeSetDigest,
    });
    expect(() =>
      commitPostPoDesignFreezeTransitionV2(db, { ...input, operationId: "CONFLICT" }, deps),
    ).toThrow(/idempotency conflict/);
    db.close();
  });
  it("U-DFA-003: 9 write境界を全rollbackする", () => {
    for (let point = 1; point <= 9; point += 1) {
      const { db, input } = seeded(`FAULT-${point}`);
      expect(() =>
        commitPostPoDesignFreezeTransitionV2(db, { ...input, faultAfterWrite: point }, deps),
      ).toThrow(new RegExp(`injected fault ${point}`));
      for (const table of tables) expect(count(db, table)).toBe(0);
      db.close();
    }
  });
  it("4 headの各CAS不一致を拒否する", () => {
    for (const head of ["authority", "freeze", "progress", "candidate"] as const) {
      const { db, input } = seeded(`CAS-${head}`);
      expect(() =>
        commitPostPoDesignFreezeTransitionV2(
          db,
          { ...input, expectedHeads: { ...genesis, [head]: "c".repeat(64) } },
          deps,
        ),
      ).toThrow(/four-head CAS conflict/);
      for (const table of tables) expect(count(db, table)).toBe(0);
      db.close();
    }
  });
  it("PO7 revoke後の旧active headと期限切れを拒否する", () => {
    const { db, po7, input } = seeded("REVOKE");
    transitionPo7Authority(db, {
      repoRoot,
      operationId: "PO7-V2-REVOKE-LIFECYCLE",
      idempotencyKey: "PO7-V2-REVOKE-LIFECYCLE-ID",
      expectedActivationEpoch: 1,
      expectedPreviousEventDigest: po7.eventDigest,
      status: "revoked",
      reason: "v2 oracle",
    });
    expect(() => commitPostPoDesignFreezeTransitionV2(db, input, deps)).toThrow(
      /latest head is not active/,
    );
    db.close();
    const next = seeded("EXPIRED");
    expect(() =>
      commitPostPoDesignFreezeTransitionV2(
        next.db,
        { ...next.input, expiresAt: "2026-07-16T09:59:59.000Z" },
        deps,
      ),
    ).toThrow(/expired/);
    next.db.close();
  });
  it("receiptとprojectionはappend-only", () => {
    const { db, input } = seeded("IMMUTABLE");
    commitPostPoDesignFreezeTransitionV2(db, input, deps);
    expect(() => db.prepare("UPDATE design_freeze_v2_receipts SET status='stale'").run()).toThrow(
      /immutable/,
    );
    expect(() => db.prepare("DELETE FROM design_freeze_v2_l01_candidates").run()).toThrow(
      /immutable/,
    );
    db.close();
  });
  it("U-DFA-005: 後継transitionは4 current headsと直前receiptをexact supersedeする", () => {
    const { db, input } = seeded("SUPERSEDE");
    const first = commitPostPoDesignFreezeTransitionV2(db, input, deps);
    const latest = {
      authority: String(
        db
          .prepare(
            "SELECT event_digest value FROM design_freeze_v2_authority_link_events ORDER BY rowid DESC LIMIT 1",
          )
          .get()?.value,
      ),
      freeze: String(
        db
          .prepare(
            "SELECT event_digest value FROM design_freeze_v2_projections ORDER BY rowid DESC LIMIT 1",
          )
          .get()?.value,
      ),
      progress: String(
        db
          .prepare(
            "SELECT event_digest value FROM design_freeze_v2_progress_projections ORDER BY rowid DESC LIMIT 1",
          )
          .get()?.value,
      ),
      candidate: String(
        db
          .prepare(
            "SELECT event_digest value FROM design_freeze_v2_l01_candidates ORDER BY rowid DESC LIMIT 1",
          )
          .get()?.value,
      ),
    };
    expect(() =>
      commitPostPoDesignFreezeTransitionV2(
        db,
        {
          ...input,
          operationId: "DF-V2-BAD-SUPERSEDE",
          idempotencyKey: "DF-V2-BAD-SUPERSEDE",
          expectedHeads: latest,
          supersedesReceiptDigest: "d".repeat(64),
        },
        deps,
      ),
    ).toThrow(/supersession chain conflict/);
    const second = commitPostPoDesignFreezeTransitionV2(
      db,
      {
        ...input,
        operationId: "DF-V2-SUPERSEDE-2",
        idempotencyKey: "DF-V2-SUPERSEDE-ID-2",
        expectedHeads: latest,
        supersedesReceiptDigest: first.freezeReceiptDigest,
      },
      deps,
    );
    expect(second.replay).toBe(false);
    expect(count(db, "design_freeze_v2_receipts")).toBe(2);
    db.close();
  });
  it("U-DFA-006: immutable exportは後発の別PO7 operation rowを取り込まない", () => {
    const { db, po7, input } = seeded("OP-BOUND");
    commitPostPoDesignFreezeTransitionV2(
      db,
      {
        ...input,
        evidencePaths: {
          fullExport: ".helix/evidence/authority/op-bound/full.json",
          commandReceipt: ".helix/evidence/authority/op-bound/receipt.json",
        },
      },
      deps,
    );
    const before = String(
      db.prepare("SELECT full_export_json value FROM design_freeze_v2_evidence_outbox").get()
        ?.value,
    );
    transitionPo7Authority(db, {
      repoRoot,
      operationId: "PO7-V2-OP-BOUND-LATER",
      idempotencyKey: "PO7-V2-OP-BOUND-LATER-ID",
      expectedActivationEpoch: 1,
      expectedPreviousEventDigest: po7.eventDigest,
      status: "revoked",
      reason: "operation-bound export oracle",
    });
    const after = String(
      db.prepare("SELECT full_export_json value FROM design_freeze_v2_evidence_outbox").get()
        ?.value,
    );
    expect(after).toBe(before);
    const exported = JSON.parse(after);
    for (const table of [
      "po7_activation_operations",
      "po7_activation_projections",
      "po7_activation_terminal_receipts",
      "po7_vmodel_authority_events",
      "po7_group_option_receipts",
      "po7_question_answer_receipts",
    ]) {
      expect(
        exported.tables[table].every(
          (row: { operation_id: string }) => row.operation_id === po7.operationId,
        ),
      ).toBe(true);
    }
    expect(after).not.toContain("PO7-V2-OP-BOUND-LATER");
    db.close();
  });
});
