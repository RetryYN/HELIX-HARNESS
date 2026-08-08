/**
 * SqliteDesignRegistryStore（Issue #177 / PLAN-L7-518、U-DRG-008）。
 *
 * slice2 の in-memory reference store と同一の RegistryStoreV1 意味契約を harness.db
 * （SQLite）上の Node transactional boundary として実装する（ADR-010: Node が唯一の
 * transaction writer）。commit 前の bundle 内容再検証は commitRegistry（slice2）が行い、
 * 本 store は BEGIN IMMEDIATE 単一 transaction 内で append 順（node→edge→version→head）
 * どおり書き、heads を lock 内 CAS で前進させる。二重 operation は同一 write-set の
 * PK / unique 制約違反（entity_id / edge_id / version_id / (from,to,relation) /
 * (entity_id,revision)）として rollback し、DB を正本に fail-close する。
 * append fault / CAS 不一致 / BEGIN 失敗の全経路で行増分 0。
 */
import { createHash } from "node:crypto";
import { createIndexSql, createTableSql, HARNESS_DB_INDEXES } from "../schema/harness-db";
import { HARNESS_DB_REGISTRY_TABLES } from "../schema/harness-db-tables-registry";
import type { HarnessDb } from "../state-db/index";
import type { RegistryFailureV1, RegistryResultV1 } from "./design-registry";
import type {
  RegistryCommitBundleV1,
  RegistryCommitReceiptV1,
  RegistryStoreV1,
} from "./design-registry-transaction";

const REGISTRY_TABLE_NAMES = new Set(HARNESS_DB_REGISTRY_TABLES.map((table) => table.name));

/**
 * design registry 系 table / index を作成する（test / setup 用）。DDL は schema registry
 * （HARNESS_DB_REGISTRY_TABLES / HARNESS_DB_INDEXES）から生成し、単一正本を維持する。
 */
export function ensureDesignRegistryTables(db: HarnessDb): void {
  for (const table of HARNESS_DB_REGISTRY_TABLES) db.exec(createTableSql(table));
  for (const index of HARNESS_DB_INDEXES) {
    if (REGISTRY_TABLE_NAMES.has(index.table)) db.exec(createIndexSql(index));
  }
}

/** heads 行（head_id='current'）を seed する。test / 初期化 lane 用。 */
export function seedSqliteDesignRegistryHead(db: HarnessDb, registryHead: string): void {
  db.prepare(
    "INSERT OR REPLACE INTO design_registry_heads (head_id, registry_head, updated_at) VALUES ('current', ?, '')",
  ).run(registryHead);
}

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function failCas(evidence: string): RegistryResultV1<never> {
  const failure: RegistryFailureV1 = {
    code: "DRG_CAS_CONFLICT",
    evidence_digest: sha256(evidence),
  };
  return { ok: false, failures: [failure] };
}

export interface SqliteRegistryStoreOptionsV1 {
  /** test 専用: 指定 table への INSERT 直前に故意に fault を起こし rollback を検証する。 */
  injectAppendFault?: string;
  /** test 専用: BEGIN IMMEDIATE を故意に失敗させ、typed failure への正規化を検証する。 */
  injectBeginFault?: boolean;
  /** test 専用: heads UPDATE 直前に競合書込を注入し、lock 内 CAS の拒否を検証する。 */
  onBeforeHeadUpdate?: () => void;
}

class SqliteDesignRegistryStore implements RegistryStoreV1 {
  readonly registry_write_authority = "design_registry_store" as const;
  private readonly db: HarnessDb;
  private readonly trustedNow: string;
  private readonly options: SqliteRegistryStoreOptionsV1;

  constructor(db: HarnessDb, trustedNow: string, options: SqliteRegistryStoreOptionsV1 = {}) {
    this.db = db;
    this.trustedNow = trustedNow;
    this.options = options;
  }

  async commitRegistry(
    bundle: RegistryCommitBundleV1,
  ): Promise<RegistryResultV1<RegistryCommitReceiptV1>> {
    const db = this.db;
    const headsRow = db
      .prepare("SELECT registry_head FROM design_registry_heads WHERE head_id = 'current'")
      .get() as { registry_head?: string } | undefined;
    // 未 seed の heads は silent genesis を許さず fail-close する。
    if (headsRow?.registry_head === undefined) {
      return failCas(`head-unseeded:${bundle.operation_id}`);
    }
    const before = String(headsRow.registry_head);
    if (bundle.expected_registry_head !== before) {
      return failCas(`head-cas:${bundle.expected_registry_head}!=${before}`);
    }
    // 二重 operation の DB 正本判定: operations 台帳（operation_id PK + operation_digest
    // unique）。将来 revision 更新が UPDATE ベースになっても冪等性検出を失わない。
    const duplicate = db
      .prepare("SELECT 1 AS hit FROM design_registry_operations WHERE operation_id = ?")
      .get(bundle.operation_id);
    if (duplicate) {
      return failCas(`duplicate-operation:${bundle.operation_id}`);
    }
    try {
      if (this.options.injectBeginFault) throw new Error("injected begin fault");
      db.exec("BEGIN IMMEDIATE");
    } catch (error) {
      // lock 競合（SQLITE_BUSY 等）も typed failure に正規化し、型契約を破らない。
      return failCas(`begin_failed:${bundle.operation_id}:${String(error)}`);
    }
    try {
      const insertNode = db.prepare(
        "INSERT INTO design_registry_nodes (entity_id, kind, atom_role, service_role, revision, authority, semantic_digest, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );
      const insertEdge = db.prepare(
        "INSERT INTO design_registry_edges (edge_id, from_entity_id, to_entity_id, relation, revision, authority, semantic_digest, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );
      const insertVersion = db.prepare(
        "INSERT INTO design_registry_versions (version_id, entity_id, revision, semantic_digest, supersedes_revision, payload) VALUES (?, ?, ?, ?, ?, ?)",
      );
      for (const step of bundle.append_order) {
        if (this.options.injectAppendFault !== undefined) {
          const faultTable = this.options.injectAppendFault;
          const stepTable = `design_registry_${step}s`;
          if (faultTable === stepTable) throw new Error(`injected append fault: ${faultTable}`);
        }
        if (step === "node") {
          for (const node of bundle.nodes) {
            insertNode.run(
              node.entity_id,
              node.kind,
              node.atom_role,
              node.service_role,
              node.revision,
              node.authority,
              node.semantic_digest,
              JSON.stringify(node),
            );
          }
        }
        if (step === "edge") {
          for (const edge of bundle.edges) {
            insertEdge.run(
              edge.edge_id,
              edge.from_entity_id,
              edge.to_entity_id,
              edge.relation,
              edge.revision,
              edge.authority,
              edge.semantic_digest,
              JSON.stringify(edge),
            );
          }
        }
        if (step === "version") {
          for (const version of bundle.versions) {
            insertVersion.run(
              version.version_id,
              version.entity_id,
              version.revision,
              version.semantic_digest,
              version.supersedes_revision,
              JSON.stringify(version),
            );
          }
        }
      }
      const after = sha256(`${before}:${bundle.operation_digest}`);
      if (this.options.injectAppendFault === "design_registry_operations")
        throw new Error("injected append fault: design_registry_operations");
      db.prepare(
        "INSERT INTO design_registry_operations (operation_id, operation_digest, before_registry_head, after_registry_head, payload) VALUES (?, ?, ?, ?, ?)",
      ).run(
        bundle.operation_id,
        bundle.operation_digest,
        before,
        after,
        JSON.stringify({ node_count: bundle.nodes.length, edge_count: bundle.edges.length }),
      );
      // lock 内 CAS: 読み取り時点の before-head を WHERE 条件へ含め、読み取り〜lock の間に
      // 他 commit が head を前進させていた場合は影響行数 0 → rollback（lost update 遮断）。
      this.options.onBeforeHeadUpdate?.();
      const updated = db
        .prepare(
          "UPDATE design_registry_heads SET registry_head = ?, updated_at = ? WHERE head_id = 'current' AND registry_head = ?",
        )
        .run(after, this.trustedNow, before);
      if (updated.changes !== 1) throw new Error(`cas_conflict:${bundle.operation_id}`);
      db.exec("COMMIT");
      return {
        ok: true,
        value: {
          operation_id: bundle.operation_id,
          operation_digest: bundle.operation_digest,
          before_registry_head: before,
          after_registry_head: after,
          inserted_node_count: bundle.nodes.length,
          inserted_edge_count: bundle.edges.length,
          status: "committed",
        },
      };
    } catch (error) {
      db.exec("ROLLBACK");
      return failCas(`append_fault:${bundle.operation_id}:${String(error)}`);
    }
  }
}

export function createSqliteDesignRegistryStore(
  db: HarnessDb,
  trustedNow: string,
  options: SqliteRegistryStoreOptionsV1 = {},
): SqliteDesignRegistryStore {
  return new SqliteDesignRegistryStore(db, trustedNow, options);
}

export interface DesignRegistryStatusV1 {
  registry_head: string;
  counts: Record<string, number>;
}

const REGISTRY_COUNT_TABLES = [
  "design_registry_nodes",
  "design_registry_edges",
  "design_registry_versions",
  "design_registry_operations",
] as const;

export interface DesignRegistryOperationRowV1 {
  operation_id: string;
  operation_digest: string;
  before_registry_head: string;
  after_registry_head: string;
}

/** CLI 用の operations 台帳一覧（読み取り専用、operation_id 昇順、limit 件まで）。 */
export function listDesignRegistryOperations(
  db: HarnessDb,
  limit: number,
): DesignRegistryOperationRowV1[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];
  return db
    .prepare(
      "SELECT operation_id, operation_digest, before_registry_head, after_registry_head FROM design_registry_operations ORDER BY operation_id LIMIT ?",
    )
    .all(limit) as unknown as DesignRegistryOperationRowV1[];
}

/** CLI / test 用の読み取り専用 status（head と row counts）。write は行わない。 */
export function readDesignRegistryStatus(db: HarnessDb): DesignRegistryStatusV1 {
  const heads = db
    .prepare("SELECT registry_head FROM design_registry_heads WHERE head_id = 'current'")
    .get() as { registry_head?: string } | undefined;
  const counts: Record<string, number> = {};
  for (const table of REGISTRY_COUNT_TABLES) {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
    counts[table] = Number(row.n);
  }
  return { registry_head: heads?.registry_head ?? "", counts };
}
