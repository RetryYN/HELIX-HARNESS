// PLAN-L7-531-psc-l9-gate-system / U-PSC-007（L9 の SA-PSC-03a を実現する oracle）。
//
// oracle ID は harness の PLAN schema が U-/IT- 接頭辞のみを許すため U-PSC-007 とし、
// L9 設計側（L4-python-semantic-core-node-boundary-system-test-design.md）が SA-PSC-03a の
// citation として本 test を指す。
//
// L8（U-PSC-003/004/006）は合成 fixture で pure 関数と型/段間契約を検査する。本書はそれを
// 再実行しない。L9 として次を system 粒度で通す:
//
//   1. 実 repository の実 doc（ディスクから読んだ実 digest）を source とする
//   2. 違反 1 件ごとに **DB が 1 行も動かない**（partial write 0）ことを実 sqlite で確認する
//      （head 不変だけでは result 行だけ残る partial write を見逃す）
//
// SA-PSC-03a のうち **別 authoring DB / reverse write の実 gate 面は本書で重複させない**。
// tests/semantic-boundary.test.ts（U-PSC-006）が既に実 repo に対して analyzeSemanticBoundary と
// checkSemanticBoundary を実行し、違反注入で fence の実効性まで実証している。L9 設計は
// SA-PSC-03a の citation として本書とその test の 2 本を指す。
//
// SA-PSC-03 のうち browser evidence 偽装（L4 §2-6）は対象外である。検知の受け皿
// （SemanticCommitBundleV1 の evidence 面と gate）が未実装であり、書けば「実装が無いのに
// green」になる。SA-PSC-03b として L9 設計側に未実装ブロックを明示し、本書では扱わない。
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

const repoRoot = process.cwd();
const GENESIS = "semantic-head-genesis";
/** commit 時刻は Node 側の trusted 値。テスト内で固定し再現性を持たせる。 */
const TRUSTED_NOW = "2026-08-09T00:00:00Z";

/** L9 は合成文字列ではなく実 repo の doc を source にする。 */
const REAL_DOCUMENT_PATH =
  "docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md";

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function realDocumentDigest(path: string): string {
  return `sha256:${createHash("sha256")
    .update(readFileSync(join(repoRoot, path)))
    .digest("hex")}`;
}

function realSidecar(documentPath = REAL_DOCUMENT_PATH): SidecarDescriptorV1 {
  const base = {
    schema_version: "psc-sidecar.v1",
    document_path: documentPath,
    document_digest: realDocumentDigest(documentPath),
    contract_id: "PSC-semantic-core-boundary",
    contract_version: 1,
    payload_schema_digest: sha256("psc-l9-payload-schema"),
  };
  const result = canonicalizeSidecarDescriptor({
    ...base,
    sidecar_digest: computeSidecarDigest(base),
  });
  if (!result.ok) throw new Error(`real sidecar must canonicalize: ${JSON.stringify(result)}`);
  return result.value;
}

function realEnvelope(
  sidecar: SidecarDescriptorV1,
  overrides: { payload?: unknown; sourceDigest?: string; payloadSchemaDigest?: string } = {},
): SemanticResultEnvelopeV1 {
  const payload = overrides.payload ?? { atoms: ["PSC-boundary-01"] };
  const base = {
    schema_version: "psc-semantic-result.v1",
    contract_id: sidecar.contract_id,
    contract_version: sidecar.contract_version,
    payload_schema_digest: overrides.payloadSchemaDigest ?? sidecar.payload_schema_digest,
    source_digest: overrides.sourceDigest ?? sidecar.document_digest,
    payload,
    payload_digest: computeCanonicalJsonDigest(payload),
    provenance: {
      worker_id: "psc-worker-boundary",
      worker_version: "1.0.0",
      contract_digest: sha256("psc-l9-contract"),
    },
  };
  return { ...base, envelope_digest: computeEnvelopeDigest(base) } as SemanticResultEnvelopeV1;
}

function freshDb() {
  const db = openHarnessDb(":memory:");
  ensureSemanticCommitTables(db);
  seedSqliteSemanticHead(db, GENESIS);
  return db;
}

/**
 * partial write 0 の観測点。head だけでなく semantic 全テーブルの行数を取る。
 * head 不変だけを見ると、result だけ書かれて receipt が落ちた状態を見逃す。
 */
function snapshot(db: ReturnType<typeof openHarnessDb>) {
  const status = readSemanticCommitStatus(db);
  return { head: status.semantic_head, counts: { ...status.counts } };
}

describe("PSC L9 gate system assertion (PLAN-L7-531)", () => {
  it("U-PSC-007: 実 doc を source に実 commit 経路が成立し、各 drift は DB を 1 行も動かさず fail-close する（SA-PSC-03a）", async () => {
    const sidecar = realSidecar();
    // 実 doc の digest であること（合成文字列の取り違えを塞ぐ）。
    expect(sidecar.document_digest).toBe(realDocumentDigest(REAL_DOCUMENT_PATH));

    const envelope = realEnvelope(sidecar);
    const revalidated = revalidateSemanticEnvelope(envelope, sidecar);
    expect(revalidated.ok, JSON.stringify(revalidated).slice(0, 300)).toBe(true);

    // 正常系: 実 doc 由来の envelope は実 sqlite 経路で commit できる。
    const db = freshDb();
    const store = createSqliteSemanticCommitStore(db, TRUSTED_NOW);
    const built = buildSemanticCommit({
      envelope,
      sidecar,
      operation_id: "op-l9-green",
      expected_semantic_head: GENESIS,
    });
    expect(built.ok, JSON.stringify(built).slice(0, 300)).toBe(true);
    if (!built.ok) return;
    const committed = await commitSemanticResult(built.value, store);
    expect(committed.ok, JSON.stringify(committed).slice(0, 300)).toBe(true);
    const afterGreen = snapshot(db);
    expect(afterGreen.head).toBe(built.value.after_semantic_head);
    // 3 テーブルすべてに 1 行ずつ入る（append_order = result → receipt → head）。
    for (const [table, count] of Object.entries(afterGreen.counts)) {
      expect(count, `${table} に 1 行`).toBe(1);
    }
    expect(listSemanticOperations(db, 10).map((row) => row.operation_id)).toEqual(["op-l9-green"]);

    // 異常系: 違反ごとに新しい DB を立て、commit 前後で head と operation 数が動かないことを見る。
    // 「失敗した」だけでは partial write を見逃すため、DB 状態そのものを観測点にする。
    const cases: ReadonlyArray<{
      label: string;
      code: string;
      build: () => ReturnType<typeof buildSemanticCommit>;
    }> = [
      {
        // source drift: 実 doc と異なる source を名乗る envelope。
        label: "source-drift",
        code: "PSC_DIGEST_MISMATCH",
        build: () => {
          const drifted = { ...realEnvelope(sidecar), source_digest: sha256("other-source") };
          return buildSemanticCommit({
            envelope: drifted as SemanticResultEnvelopeV1,
            sidecar,
            operation_id: "op-l9-source",
            expected_semantic_head: GENESIS,
          });
        },
      },
      {
        // sidecar drift: sidecar_digest 据え置きで document_digest を差し替える。
        label: "sidecar-drift",
        code: "PSC_DIGEST_MISMATCH",
        build: () =>
          buildSemanticCommit({
            envelope: realEnvelope(sidecar),
            sidecar: { ...sidecar, document_digest: sha256("forged-doc") },
            operation_id: "op-l9-sidecar",
            expected_semantic_head: GENESIS,
          }),
      },
      {
        // schema drift: envelope と sidecar の payload_schema_digest が食い違う。
        label: "schema-drift",
        code: "PSC_CONTRACT_UNBOUND",
        build: () =>
          buildSemanticCommit({
            envelope: realEnvelope(sidecar, { payloadSchemaDigest: sha256("other-schema") }),
            sidecar,
            operation_id: "op-l9-schema",
            expected_semantic_head: GENESIS,
          }),
      },
      {
        // digest drift: payload だけ差し替えて宣言 digest を据え置く。
        label: "digest-drift",
        code: "PSC_DIGEST_MISMATCH",
        build: () => {
          const forged = { ...realEnvelope(sidecar), payload: { atoms: ["forged"] } };
          return buildSemanticCommit({
            envelope: forged as SemanticResultEnvelopeV1,
            sidecar,
            operation_id: "op-l9-digest",
            expected_semantic_head: GENESIS,
          });
        },
      },
    ];

    for (const testCase of cases) {
      const caseDb = freshDb();
      const before = snapshot(caseDb);
      const result = testCase.build();
      expect(result.ok, testCase.label).toBe(false);
      if (!result.ok) {
        expect(
          result.failures.map((failure) => failure.code),
          testCase.label,
        ).toContain(testCase.code);
      }
      // build 段で落ちるため commit へ到達しない = DB は不変。
      expect(snapshot(caseDb), testCase.label).toEqual(before);
      expect(before.head, testCase.label).toBe(GENESIS);
      for (const [table, count] of Object.entries(before.counts)) {
        expect(count, `${testCase.label}:${table}`).toBe(0);
      }
    }

    // HEAD drift（CAS）: build は通り commit で落ちる経路。ここでも DB は不変でなければならない。
    const casDb = freshDb();
    const casStore = createSqliteSemanticCommitStore(casDb, TRUSTED_NOW);
    const casBuilt = buildSemanticCommit({
      envelope: realEnvelope(sidecar),
      sidecar,
      operation_id: "op-l9-cas",
      expected_semantic_head: "semantic-head-stale",
    });
    expect(casBuilt.ok).toBe(true);
    if (!casBuilt.ok) return;
    const casBefore = snapshot(casDb);
    const casResult = await commitSemanticResult(casBuilt.value, casStore);
    expect(casResult.ok).toBe(false);
    if (!casResult.ok) {
      expect(casResult.failures.map((failure) => failure.code)).toContain("PSC_CAS_CONFLICT");
    }
    expect(snapshot(casDb)).toEqual(casBefore);
    expect(casBefore.head).toBe(GENESIS);
  });
});
