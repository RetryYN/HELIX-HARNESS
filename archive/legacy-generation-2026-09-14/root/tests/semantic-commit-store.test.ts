// PLAN-L7-525-psc-transaction-consumer / U-PSC-003・U-PSC-004（#230 slice3）。
// L8テスト設計スライス3表を機械検査する。
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildSemanticCommit,
  commitSemanticResult,
  createSqliteSemanticCommitStore,
  ensureSemanticCommitTables,
  listSemanticOperations,
  readSemanticCommitStatus,
  seedSqliteSemanticHead,
} from "../src/semantic/semantic-commit-store";
import {
  canonicalizeSidecarDescriptor,
  computeCanonicalJsonDigest,
  computeEnvelopeDigest,
  computeSidecarDigest,
  revalidateSemanticEnvelope,
  type SemanticResultEnvelopeV1,
  type SidecarDescriptorV1,
} from "../src/semantic/semantic-contract-revalidator";
import { openHarnessDb } from "../src/state-db";

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function makeSidecar(): SidecarDescriptorV1 {
  const base = {
    schema_version: "psc-sidecar.v1",
    document_path: "docs/design/harness/L2-screen/screen-list.md",
    document_digest: sha256("doc"),
    contract_id: "PSC-screen-intake",
    contract_version: 1,
    payload_schema_digest: sha256("payload-schema"),
  };
  const result = canonicalizeSidecarDescriptor({
    ...base,
    sidecar_digest: computeSidecarDigest(base),
  });
  if (!result.ok) throw new Error("fixture sidecar must canonicalize");
  return result.value;
}

function makeEnvelope(
  sidecar: SidecarDescriptorV1,
  payload: unknown = { atoms: ["SCR-pm-01"] },
  sourceDigest = sha256("source"),
): SemanticResultEnvelopeV1 {
  const base = {
    schema_version: "psc-semantic-result.v1",
    contract_id: sidecar.contract_id,
    contract_version: sidecar.contract_version,
    payload_schema_digest: sidecar.payload_schema_digest,
    source_digest: sourceDigest,
    payload,
    payload_digest: computeCanonicalJsonDigest(payload),
    provenance: {
      worker_id: "psc-worker-screen",
      worker_version: "1.0.0",
      contract_digest: sha256("contract"),
    },
  };
  const result = revalidateSemanticEnvelope(
    { ...base, envelope_digest: computeEnvelopeDigest(base) },
    sidecar,
  );
  if (!result.ok) throw new Error(`fixture envelope must revalidate: ${JSON.stringify(result)}`);
  return result.value;
}

function makeDb() {
  const db = openHarnessDb(":memory:");
  ensureSemanticCommitTables(db);
  seedSqliteSemanticHead(db, "semantic-head-genesis");
  return db;
}

describe("semantic commit store (PLAN-L7-525)", () => {
  it("U-PSC-003: 再検証済み入力から決定的commit bundleを組み、改ざん入力をfail-closeする", () => {
    const sidecar = makeSidecar();
    const envelope = makeEnvelope(sidecar);
    const built = buildSemanticCommit({
      envelope,
      sidecar,
      operation_id: "op-1",
      expected_semantic_head: "semantic-head-genesis",
    });
    expect(built.ok, JSON.stringify(built).slice(0, 300)).toBe(true);
    if (!built.ok) return;

    // append 順は result → receipt → head 固定
    expect(built.value.append_order).toEqual(["result", "receipt", "head"]);
    expect(built.value.after_semantic_head).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(built.value.before_semantic_head).toBe("semantic-head-genesis");

    // 決定性: 同一入力 2 回で deep-equal
    const again = buildSemanticCommit({
      envelope: makeEnvelope(makeSidecar()),
      sidecar: makeSidecar(),
      operation_id: "op-1",
      expected_semantic_head: "semantic-head-genesis",
    });
    expect(again).toEqual(built);

    // after head は before head と operation_digest から導出される（決定的連鎖）
    expect(built.value.after_semantic_head).toBe(
      sha256(`${built.value.before_semantic_head}${built.value.operation_digest}`),
    );

    // 改ざん envelope（宣言 digest 据え置きで payload 差替）は再計算検査で fail-close
    const forged: SemanticResultEnvelopeV1 = {
      ...envelope,
      payload: { atoms: ["SCR-forged"] },
    };
    const forgedResult = buildSemanticCommit({
      envelope: forged,
      sidecar,
      operation_id: "op-2",
      expected_semantic_head: "semantic-head-genesis",
    });
    expect(forgedResult.ok).toBe(false);
    if (!forgedResult.ok) expect(forgedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // sidecar 束縛不一致（別 contract の sidecar）は PSC_CONTRACT_UNBOUND
    const otherBase = {
      schema_version: "psc-sidecar.v1",
      document_path: "docs/design/harness/L2-screen/wireframe.md",
      document_digest: sha256("doc2"),
      contract_id: "PSC-other-intake",
      contract_version: 1,
      payload_schema_digest: sha256("payload-schema"),
    };
    const otherSidecar = canonicalizeSidecarDescriptor({
      ...otherBase,
      sidecar_digest: computeSidecarDigest(otherBase),
    });
    expect(otherSidecar.ok).toBe(true);
    if (otherSidecar.ok) {
      const unbound = buildSemanticCommit({
        envelope,
        sidecar: otherSidecar.value,
        operation_id: "op-3",
        expected_semantic_head: "semantic-head-genesis",
      });
      expect(unbound.ok).toBe(false);
      if (!unbound.ok) expect(unbound.failures[0]?.code).toBe("PSC_CONTRACT_UNBOUND");
    }

    // sidecar の masked mutation（canonicalize を経由せず組み立て、field 書換 + digest 据え置き）も
    // envelope 側と対称に検出する（review round1 probe525_3 の恒久 oracle）
    const maskedSidecar: SidecarDescriptorV1 = { ...sidecar, document_digest: sha256("tampered") };
    const maskedResult = buildSemanticCommit({
      envelope,
      sidecar: maskedSidecar,
      operation_id: "op-masked-sidecar",
      expected_semantic_head: "semantic-head-genesis",
    });
    expect(maskedResult.ok).toBe(false);
    if (!maskedResult.ok) expect(maskedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // operation_id / expected head の形式不正は PSC_SCHEMA_INVALID
    const badOp = buildSemanticCommit({
      envelope,
      sidecar,
      operation_id: "",
      expected_semantic_head: "semantic-head-genesis",
    });
    expect(badOp.ok).toBe(false);
    if (!badOp.ok) expect(badOp.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
  });

  it("U-PSC-004: CASと冪等台帳でexactly-once commitし、fault時にpartial writeを残さない", async () => {
    const db = makeDb();
    try {
      const sidecar = makeSidecar();
      const envelope = makeEnvelope(sidecar);
      const store = createSqliteSemanticCommitStore(db, "2026-08-08T00:00:00Z");
      const bundle = buildSemanticCommit({
        envelope,
        sidecar,
        operation_id: "op-commit-1",
        expected_semantic_head: "semantic-head-genesis",
      });
      expect(bundle.ok).toBe(true);
      if (!bundle.ok) return;

      const committed = await commitSemanticResult(bundle.value, store);
      expect(committed.ok, JSON.stringify(committed).slice(0, 300)).toBe(true);
      if (!committed.ok) return;
      expect(committed.value.after_semantic_head).toBe(bundle.value.after_semantic_head);

      const status = readSemanticCommitStatus(db);
      expect(status.semantic_head).toBe(bundle.value.after_semantic_head);
      expect(status.counts.semantic_result_records).toBe(1);
      expect(status.counts.semantic_result_receipts).toBe(1);
      expect(status.counts.semantic_result_operations).toBe(1);

      // 冪等: 同一 operation_id の再実行は行を増やさず同一 receipt を返す
      const replay = await commitSemanticResult(bundle.value, store);
      expect(replay.ok).toBe(true);
      if (replay.ok) expect(replay.value).toEqual(committed.value);
      const afterReplay = readSemanticCommitStatus(db);
      expect(afterReplay.counts.semantic_result_records).toBe(1);
      expect(afterReplay.counts.semantic_result_operations).toBe(1);
      expect(afterReplay.semantic_head).toBe(bundle.value.after_semantic_head);

      // 同一 operation_id・異 digest は PSC_OPERATION_CONFLICT
      const divergent = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-02"] }, sha256("source-2")),
        sidecar,
        operation_id: "op-commit-1",
        expected_semantic_head: bundle.value.after_semantic_head,
      });
      expect(divergent.ok).toBe(true);
      if (divergent.ok) {
        const conflict = await commitSemanticResult(divergent.value, store);
        expect(conflict.ok).toBe(false);
        if (!conflict.ok) expect(conflict.failures[0]?.code).toBe("PSC_OPERATION_CONFLICT");
      }

      // CAS: stale expected head は rollback して head も行数も不変
      const stale = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-03"] }, sha256("source-3")),
        sidecar,
        operation_id: "op-commit-stale",
        expected_semantic_head: "semantic-head-genesis",
      });
      expect(stale.ok).toBe(true);
      if (stale.ok) {
        const casResult = await commitSemanticResult(stale.value, store);
        expect(casResult.ok).toBe(false);
        if (!casResult.ok) expect(casResult.failures[0]?.code).toBe("PSC_CAS_CONFLICT");
      }
      const afterCas = readSemanticCommitStatus(db);
      expect(afterCas.semantic_head).toBe(bundle.value.after_semantic_head);
      expect(afterCas.counts.semantic_result_records).toBe(1);

      // fault 注入: receipt append 失敗時に result 行が残らない（partial write 0）
      const faulty = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-04"] }, sha256("source-4")),
        sidecar,
        operation_id: "op-commit-fault",
        expected_semantic_head: bundle.value.after_semantic_head,
      });
      expect(faulty.ok).toBe(true);
      if (faulty.ok) {
        const faultStore = createSqliteSemanticCommitStore(db, "2026-08-08T00:00:00Z", {
          injectReceiptFault: true,
        });
        const faultResult = await commitSemanticResult(faulty.value, faultStore);
        expect(faultResult.ok).toBe(false);
        if (!faultResult.ok) expect(faultResult.failures[0]?.code).toBe("PSC_COMMIT_FAULT");
        const afterFault = readSemanticCommitStatus(db);
        expect(afterFault.counts.semantic_result_records).toBe(1);
        expect(afterFault.counts.semantic_result_receipts).toBe(1);
        expect(afterFault.semantic_head).toBe(bundle.value.after_semantic_head);
      }

      // transaction 内で他 writer が head を進めた場合も CAS で検出して rollback
      const rival = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-05"] }, sha256("source-5")),
        sidecar,
        operation_id: "op-commit-rival",
        expected_semantic_head: bundle.value.after_semantic_head,
      });
      expect(rival.ok).toBe(true);
      if (rival.ok) {
        const rivalStore = createSqliteSemanticCommitStore(db, "2026-08-08T00:00:00Z", {
          onBeforeHeadUpdate: () => {
            db.exec(
              `UPDATE semantic_result_heads SET semantic_head = '${sha256("rival")}' WHERE head_id = 'semantic-head'`,
            );
          },
        });
        const rivalResult = await commitSemanticResult(rival.value, rivalStore);
        expect(rivalResult.ok).toBe(false);
        if (!rivalResult.ok) expect(rivalResult.failures[0]?.code).toBe("PSC_CAS_CONFLICT");
        const afterRival = readSemanticCommitStatus(db);
        // rival の直書きは残るが、本 commit の行は 1 件も増えない（rollback 済み）
        expect(afterRival.counts.semantic_result_records).toBe(1);
        expect(afterRival.counts.semantic_result_receipts).toBe(1);
      }

      // 同一 (contract_id, contract_version, source_digest) の別 envelope は unique 制約で拒否
      // （同一 source から複数の意味結果が並立することを禁じる。head と行数は不変）
      const duplicateSource = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-06"] }, sha256("source")),
        sidecar,
        operation_id: "op-commit-dup-source",
        expected_semantic_head: bundle.value.after_semantic_head,
      });
      expect(duplicateSource.ok).toBe(true);
      if (duplicateSource.ok) {
        const dupResult = await commitSemanticResult(duplicateSource.value, store);
        expect(dupResult.ok).toBe(false);
        if (!dupResult.ok) expect(dupResult.failures[0]?.code).toBe("PSC_COMMIT_FAULT");
        const afterDup = readSemanticCommitStatus(db);
        expect(afterDup.counts.semantic_result_records).toBe(1);
        expect(afterDup.semantic_head).toBe(bundle.value.after_semantic_head);
      }

      // BEGIN IMMEDIATE 失敗（lock 競合相当）も typed failure へ正規化し、行/head は不変
      const beginFaulty = buildSemanticCommit({
        envelope: makeEnvelope(sidecar, { atoms: ["SCR-pm-07"] }, sha256("source-7")),
        sidecar,
        operation_id: "op-commit-begin-fault",
        expected_semantic_head: bundle.value.after_semantic_head,
      });
      expect(beginFaulty.ok).toBe(true);
      if (beginFaulty.ok) {
        const beginStore = createSqliteSemanticCommitStore(db, "2026-08-08T00:00:00Z", {
          injectBeginFault: true,
        });
        const beginResult = await commitSemanticResult(beginFaulty.value, beginStore);
        expect(beginResult.ok).toBe(false);
        if (!beginResult.ok) expect(beginResult.failures[0]?.code).toBe("PSC_COMMIT_FAULT");
        const afterBegin = readSemanticCommitStatus(db);
        expect(afterBegin.counts.semantic_result_records).toBe(1);
        expect(afterBegin.semantic_head).toBe(bundle.value.after_semantic_head);
      }

      const operations = listSemanticOperations(db, 10);
      expect(operations).toHaveLength(1);
      expect(operations[0]?.operation_id).toBe("op-commit-1");
      expect(listSemanticOperations(db, 0)).toEqual([]);
      expect(listSemanticOperations(db, Number.NaN)).toEqual([]);
    } finally {
      db.close();
    }
  });

  it("table 欠落 db では read helper が throw する（typed error 経路の入口）", () => {
    const db = openHarnessDb(":memory:");
    try {
      expect(() => readSemanticCommitStatus(db)).toThrow();
      expect(() => listSemanticOperations(db, 5)).toThrow();
    } finally {
      db.close();
    }
  });
});
