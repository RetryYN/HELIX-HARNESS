/**
 * semantic contract 層 — Node transaction consumer（PLAN-L7-525、Issue #230 slice3）。
 *
 * L6設計 docs/design/helix/L6-function-design/semantic-contract-revalidator.md §3 を正本とする。
 * 再検証済み envelope だけを `harness.db` へ atomic に projection する。ADR-010 の
 * 「Node 実行境界が唯一の transaction writer」に従い、Python 意味コアは本経路の write
 * authority を持たない（DB path / credential を渡さない）。
 */
import { createHash } from "node:crypto";
import { createIndexSql, createTableSql } from "../schema/harness-db";
import { HARNESS_DB_INDEXES } from "../schema/harness-db-indexes";
import { HARNESS_DB_SEMANTIC_TABLES } from "../schema/harness-db-tables-semantic";
import type { HarnessDb } from "../state-db";
import {
  computeCanonicalJsonDigest,
  computeEnvelopeDigest,
  computeSidecarDigest,
  type PscFailureV1,
  type PscResultV1,
  type SemanticResultEnvelopeV1,
  type SidecarDescriptorV1,
} from "./semantic-contract-revalidator";

export type SemanticCommitStepV1 = "result" | "receipt" | "head";

export const SEMANTIC_APPEND_ORDER: readonly SemanticCommitStepV1[] = [
  "result",
  "receipt",
  "head",
] as const;

export interface SemanticCommitInputV1 {
  envelope: SemanticResultEnvelopeV1;
  sidecar: SidecarDescriptorV1;
  operation_id: string;
  expected_semantic_head: string;
}

export interface SemanticCommitBundleV1 {
  operation_id: string;
  operation_digest: string;
  before_semantic_head: string;
  after_semantic_head: string;
  append_order: readonly SemanticCommitStepV1[];
  envelope: SemanticResultEnvelopeV1;
  sidecar_digest: string;
  receipt_id: string;
}

export interface SemanticCommitReceiptV1 {
  operation_id: string;
  operation_digest: string;
  before_semantic_head: string;
  after_semantic_head: string;
  envelope_digest: string;
  status: "committed";
}

export interface SemanticCommitStoreV1 {
  commit(bundle: SemanticCommitBundleV1): Promise<PscResultV1<SemanticCommitReceiptV1>>;
}

const OPERATION_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SEMANTIC_TABLE_NAMES = new Set(HARNESS_DB_SEMANTIC_TABLES.map((table) => table.name));

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: PscFailureV1["code"], evidence: string): PscFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function failures<T>(items: readonly PscFailureV1[]): PscResultV1<T> {
  return { ok: false, failures: items };
}

/** semantic 系 table / index を作成する（test / setup 用、DDL は schema registry 単一正本）。 */
export function ensureSemanticCommitTables(db: HarnessDb): void {
  for (const table of HARNESS_DB_SEMANTIC_TABLES) db.exec(createTableSql(table));
  for (const index of HARNESS_DB_INDEXES) {
    if (SEMANTIC_TABLE_NAMES.has(index.table)) db.exec(createIndexSql(index));
  }
}

/** heads 行（head_id='semantic-head'）を seed する。test / 初期化 lane 用。 */
export function seedSqliteSemanticHead(db: HarnessDb, semanticHead: string): void {
  db.prepare(
    "INSERT OR REPLACE INTO semantic_result_heads (head_id, semantic_head, updated_at) VALUES ('semantic-head', ?, '')",
  ).run(semanticHead);
}

/**
 * U-PSC-003: 再検証済み envelope + sidecar から決定的な commit bundle を組む。
 * 宣言 digest を信用せず envelope から再計算し、改ざん入力を fail-close する。
 */
export function buildSemanticCommit(
  input: SemanticCommitInputV1,
): PscResultV1<SemanticCommitBundleV1> {
  const found: PscFailureV1[] = [];
  const { envelope, sidecar, operation_id, expected_semantic_head } = input;
  if (typeof operation_id !== "string" || !OPERATION_ID_PATTERN.test(operation_id)) {
    found.push(fail("PSC_SCHEMA_INVALID", `commit:operation_id:${String(operation_id)}`));
  }
  if (typeof expected_semantic_head !== "string" || expected_semantic_head.length === 0) {
    found.push(fail("PSC_SCHEMA_INVALID", "commit:expected_semantic_head"));
  }
  if (found.length > 0) return failures(found);

  // 再検証済みを名乗る入力でも digest を再計算する（caller が revalidator を通さずに
  // 組み立てた／通した後に書き換えた場合を入口で遮断する）。sidecar 側も envelope 側と
  // 対称に扱う: SidecarDescriptorV1 は構造的型付けのため canonicalizeSidecarDescriptor を
  // 経由しない組み立てを型システムでは防げない。
  if (
    computeSidecarDigest(sidecar as unknown as Record<string, unknown>) !== sidecar.sidecar_digest
  ) {
    found.push(fail("PSC_DIGEST_MISMATCH", `commit:sidecar_digest:${operation_id}`));
  }
  if (computeCanonicalJsonDigest(envelope.payload) !== envelope.payload_digest) {
    found.push(fail("PSC_DIGEST_MISMATCH", `commit:payload_digest:${operation_id}`));
  }
  const recomputedEnvelope = computeEnvelopeDigest({
    schema_version: envelope.schema_version,
    contract_id: envelope.contract_id,
    contract_version: envelope.contract_version,
    payload_schema_digest: envelope.payload_schema_digest,
    source_digest: envelope.source_digest,
    payload: envelope.payload,
    payload_digest: envelope.payload_digest,
    provenance: envelope.provenance,
  });
  if (recomputedEnvelope !== envelope.envelope_digest) {
    found.push(fail("PSC_DIGEST_MISMATCH", `commit:envelope_digest:${operation_id}`));
  }
  if (
    envelope.contract_id !== sidecar.contract_id ||
    envelope.contract_version !== sidecar.contract_version ||
    envelope.payload_schema_digest !== sidecar.payload_schema_digest
  ) {
    found.push(fail("PSC_CONTRACT_UNBOUND", `commit:binding:${operation_id}`));
  }
  if (found.length > 0) return failures(found);

  const operation_digest = computeCanonicalJsonDigest({
    envelope_digest: envelope.envelope_digest,
    operation_id,
    sidecar_digest: sidecar.sidecar_digest,
  });
  return {
    ok: true,
    value: {
      operation_id,
      operation_digest,
      before_semantic_head: expected_semantic_head,
      after_semantic_head: sha256(`${expected_semantic_head}${operation_digest}`),
      append_order: SEMANTIC_APPEND_ORDER,
      envelope,
      sidecar_digest: sidecar.sidecar_digest,
      receipt_id: computeCanonicalJsonDigest({ operation_digest, receipt_of: operation_id }),
    },
  };
}

/** U-PSC-004: store 契約への委譲（transaction 境界は store 実装が持つ）。 */
export function commitSemanticResult(
  bundle: SemanticCommitBundleV1,
  store: SemanticCommitStoreV1,
): Promise<PscResultV1<SemanticCommitReceiptV1>> {
  return store.commit(bundle);
}

export interface SqliteSemanticStoreOptionsV1 {
  /** test 専用: receipt append 直前に fault を起こし rollback（partial write 0）を検証する。 */
  injectReceiptFault?: boolean;
  /** test 専用: BEGIN IMMEDIATE を故意に失敗させ typed failure への正規化を検証する。 */
  injectBeginFault?: boolean;
  /** test 専用: head 更新直前に他 writer の割り込みを注入し in-lock CAS を検証する。 */
  onBeforeHeadUpdate?: () => void;
}

interface OperationRow {
  operation_digest: string;
  before_semantic_head: string;
  after_semantic_head: string;
}

class SqliteSemanticCommitStore implements SemanticCommitStoreV1 {
  constructor(
    private readonly db: HarnessDb,
    private readonly trustedNow: string,
    private readonly options: SqliteSemanticStoreOptionsV1 = {},
  ) {}

  async commit(bundle: SemanticCommitBundleV1): Promise<PscResultV1<SemanticCommitReceiptV1>> {
    const db = this.db;
    // 冪等: 同一 operation_id の再実行は既存 receipt を返す。digest 差異は別 commit の
    // 誤った再利用であり fail-close する。
    // TOCTOU: この SELECT は transaction 外のため、真の並行 commit では判定通過後に相手が
    // 先に同一 operation_id を commit しうる。その場合は operations の PK 制約違反で
    // PSC_COMMIT_FAULT へ落ち（データ破壊・二重 commit はしない）、再試行すれば冪等判定へ到達する。
    const existing = db
      .prepare(
        "SELECT operation_digest, before_semantic_head, after_semantic_head FROM semantic_result_operations WHERE operation_id = ?",
      )
      .get(bundle.operation_id) as OperationRow | undefined;
    if (existing !== undefined) {
      if (existing.operation_digest !== bundle.operation_digest) {
        return failures([
          fail("PSC_OPERATION_CONFLICT", `operation_digest_drift:${bundle.operation_id}`),
        ]);
      }
      return {
        ok: true,
        value: {
          operation_id: bundle.operation_id,
          operation_digest: existing.operation_digest,
          before_semantic_head: existing.before_semantic_head,
          after_semantic_head: existing.after_semantic_head,
          envelope_digest: bundle.envelope.envelope_digest,
          status: "committed",
        },
      };
    }
    // 事前 head 比較（#177 precedent と同型の早期 return）。真の並行実行では読み取り後に
    // head が進む race window が残るため、これは最適化であり authority は lock 内 CAS 側にある。
    const currentHead = db
      .prepare("SELECT semantic_head FROM semantic_result_heads WHERE head_id = 'semantic-head'")
      .get() as { semantic_head?: string } | undefined;
    if (currentHead?.semantic_head !== bundle.before_semantic_head) {
      return failures([fail("PSC_CAS_CONFLICT", `stale_expected_head:${bundle.operation_id}`)]);
    }
    try {
      if (this.options.injectBeginFault) throw new Error("injected begin fault");
      db.exec("BEGIN IMMEDIATE");
    } catch (error) {
      // lock 競合（SQLITE_BUSY 等）も typed failure へ正規化する。
      return failures([
        fail("PSC_COMMIT_FAULT", `begin_failed:${bundle.operation_id}:${String(error)}`),
      ]);
    }
    try {
      for (const step of bundle.append_order) {
        if (step === "result") {
          db.prepare(
            "INSERT INTO semantic_result_records (envelope_digest, contract_id, contract_version, payload_schema_digest, source_digest, payload_digest, sidecar_digest, worker_id, worker_version, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          ).run(
            bundle.envelope.envelope_digest,
            bundle.envelope.contract_id,
            bundle.envelope.contract_version,
            bundle.envelope.payload_schema_digest,
            bundle.envelope.source_digest,
            bundle.envelope.payload_digest,
            bundle.sidecar_digest,
            bundle.envelope.provenance.worker_id,
            bundle.envelope.provenance.worker_version,
            JSON.stringify(bundle.envelope.payload),
          );
        }
        if (step === "receipt") {
          if (this.options.injectReceiptFault) throw new Error("injected receipt fault");
          db.prepare(
            "INSERT INTO semantic_result_receipts (receipt_id, operation_id, envelope_digest, before_semantic_head, after_semantic_head, committed_at) VALUES (?, ?, ?, ?, ?, ?)",
          ).run(
            bundle.receipt_id,
            bundle.operation_id,
            bundle.envelope.envelope_digest,
            bundle.before_semantic_head,
            bundle.after_semantic_head,
            this.trustedNow,
          );
          db.prepare(
            "INSERT INTO semantic_result_operations (operation_id, operation_digest, before_semantic_head, after_semantic_head, payload) VALUES (?, ?, ?, ?, ?)",
          ).run(
            bundle.operation_id,
            bundle.operation_digest,
            bundle.before_semantic_head,
            bundle.after_semantic_head,
            JSON.stringify({ envelope_digest: bundle.envelope.envelope_digest }),
          );
        }
        if (step === "head") {
          // lock 内 CAS: bundle が前提とした before-head を WHERE へ含め、読み取り〜lock の
          // 間に他 commit が head を進めていた場合は影響行数 0 → rollback（lost update 遮断）。
          this.options.onBeforeHeadUpdate?.();
          const updated = db
            .prepare(
              "UPDATE semantic_result_heads SET semantic_head = ?, updated_at = ? WHERE head_id = 'semantic-head' AND semantic_head = ?",
            )
            .run(bundle.after_semantic_head, this.trustedNow, bundle.before_semantic_head);
          if (updated.changes !== 1) {
            db.exec("ROLLBACK");
            return failures([fail("PSC_CAS_CONFLICT", `cas_conflict:${bundle.operation_id}`)]);
          }
        }
      }
      db.exec("COMMIT");
      return {
        ok: true,
        value: {
          operation_id: bundle.operation_id,
          operation_digest: bundle.operation_digest,
          before_semantic_head: bundle.before_semantic_head,
          after_semantic_head: bundle.after_semantic_head,
          envelope_digest: bundle.envelope.envelope_digest,
          status: "committed",
        },
      };
    } catch (error) {
      db.exec("ROLLBACK");
      return failures([
        fail("PSC_COMMIT_FAULT", `append_fault:${bundle.operation_id}:${String(error)}`),
      ]);
    }
  }
}

export function createSqliteSemanticCommitStore(
  db: HarnessDb,
  trustedNow: string,
  options: SqliteSemanticStoreOptionsV1 = {},
): SemanticCommitStoreV1 {
  return new SqliteSemanticCommitStore(db, trustedNow, options);
}

export interface SemanticCommitStatusV1 {
  semantic_head: string;
  counts: Record<string, number>;
}

const SEMANTIC_COUNT_TABLES = [
  "semantic_result_records",
  "semantic_result_receipts",
  "semantic_result_operations",
] as const;

export interface SemanticOperationRowV1 {
  operation_id: string;
  operation_digest: string;
  before_semantic_head: string;
  after_semantic_head: string;
}

/** CLI / test 用の operations 台帳一覧（読み取り専用、operation_id 昇順、limit 件まで）。 */
export function listSemanticOperations(db: HarnessDb, limit: number): SemanticOperationRowV1[] {
  if (!Number.isInteger(limit) || limit <= 0) {
    // table 欠落を limit 検査より先に顕在化させ、fail-safe read と未初期化 DB を区別する。
    db.prepare("SELECT operation_id FROM semantic_result_operations LIMIT 1").get();
    return [];
  }
  return db
    .prepare(
      "SELECT operation_id, operation_digest, before_semantic_head, after_semantic_head FROM semantic_result_operations ORDER BY operation_id LIMIT ?",
    )
    .all(limit) as unknown as SemanticOperationRowV1[];
}

/** CLI / test 用の読み取り専用 status（head と row counts）。write は行わない。 */
export function readSemanticCommitStatus(db: HarnessDb): SemanticCommitStatusV1 {
  const head = db
    .prepare("SELECT semantic_head FROM semantic_result_heads WHERE head_id = 'semantic-head'")
    .get() as { semantic_head?: string } | undefined;
  const counts: Record<string, number> = {};
  for (const table of SEMANTIC_COUNT_TABLES) {
    const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
    counts[table] = row.count;
  }
  return { semantic_head: head?.semantic_head ?? "", counts };
}
