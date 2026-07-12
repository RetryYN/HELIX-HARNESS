/**
 * harness.db migration — registry-driven DDL 適用 + user_version 管理 (PLAN-L7-45, span ①)。
 *
 * physical-data.md は migration/version 方式を明示しないため、SQLite 標準の `PRAGMA user_version`
 * で schema バージョンを追跡する (専用 schema table を増やさない最小設計、単一正本 = harness-db.ts)。
 * DDL は `CREATE TABLE/INDEX IF NOT EXISTS` で冪等。同 DB に複数回適用しても安全 (deterministic)。
 */

import type { ColumnDef } from "../schema/harness-db";
import {
  assertSqlIdentifier,
  HARNESS_DB_TABLE_BY_NAME,
  HARNESS_DB_TABLES,
  SCHEMA_VERSION,
  schemaDdl,
} from "../schema/harness-db";
import type { HarnessDb } from "./index";

export interface MigrationResult {
  /** 適用前の user_version。 */
  fromVersion: number;
  /** 適用後の user_version (= SCHEMA_VERSION)。 */
  toVersion: number;
  /** 実際に DDL を適用したか (既に最新なら false)。 */
  applied: boolean;
  /** 適用後に存在する table 名 (昇順)。 */
  tables: string[];
}

/** DB に存在する table 名を昇順で返す。 */
export function tableNames(db: HarnessDb): string[] {
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all();
  return rows.map((r) => String(r.name));
}

function columnNames(db: HarnessDb, table: string): Set<string> {
  assertSqlIdentifier(table);
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.map((r) => String(r.name)));
}

function tablePrimaryKeyColumns(db: HarnessDb, table: string): Set<string> {
  assertSqlIdentifier(table);
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.filter((r) => Number(r.pk ?? 0) > 0).map((r) => String(r.name)));
}

function addColumnSql(table: string, column: ColumnDef): string {
  assertSqlIdentifier(table);
  assertSqlIdentifier(column.name);
  return `ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.type}`;
}

function primaryKeyCompatibilityIndexName(table: string, column: string): string {
  const indexName = `idx_${table}_${column}_pk_compat`;
  assertSqlIdentifier(indexName);
  return indexName;
}

function addMissingPrimaryKeyCompatibility(db: HarnessDb, table: string, column: ColumnDef): void {
  db.exec(addColumnSql(table, { ...column, primaryKey: false }));
  const indexName = primaryKeyCompatibilityIndexName(table, column.name);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${table} (${column.name})`);
}

function addMissingColumns(db: HarnessDb): number {
  const present = new Set(tableNames(db));
  let added = 0;
  for (const table of HARNESS_DB_TABLES) {
    if (!present.has(table.name)) continue;
    const columns = columnNames(db, table.name);
    for (const column of table.columns) {
      if (columns.has(column.name)) continue;
      if (column.primaryKey) {
        addMissingPrimaryKeyCompatibility(db, table.name, column);
      } else {
        db.exec(addColumnSql(table.name, column));
      }
      columns.add(column.name);
      added += 1;
    }
  }
  return added;
}

function ensurePrimaryKeyCompatibilityIndexes(db: HarnessDb): void {
  const present = new Set(tableNames(db));
  for (const table of HARNESS_DB_TABLES) {
    if (!present.has(table.name)) continue;
    const columns = columnNames(db, table.name);
    const actualPrimaryKeys = tablePrimaryKeyColumns(db, table.name);
    for (const column of table.columns) {
      if (!column.primaryKey || !columns.has(column.name) || actualPrimaryKeys.has(column.name)) {
        continue;
      }
      const indexName = primaryKeyCompatibilityIndexName(table.name, column.name);
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${table.name} (${column.name})`);
    }
  }
}

/**
 * production gate receipt は一度 materialization identity と結合した後に書き換えない。
 * legacy gate row（receipt が全て NULL）は従来どおり更新でき、materializer が最初の
 * receipt を付与する migration path との互換性を保つ。
 */
function ensureGateRunReceiptImmutability(db: HarnessDb): void {
  if (!tableNames(db).includes("gate_runs")) return;
  const columns = columnNames(db, "gate_runs");
  const receiptColumns = [
    "session_id",
    "command",
    "exit_code",
    "output_digest",
    "materialization_id",
  ];
  if (!receiptColumns.every((column) => columns.has(column))) return;

  const hadReceipt = receiptColumns.map((column) => `OLD.${column} IS NOT NULL`).join(" OR ");
  const immutableColumns = [
    "gate_run_id",
    "gate_id",
    "plan_id",
    "status",
    "checked_at",
    "evidence_path",
    ...receiptColumns,
  ];
  const receiptChanged = immutableColumns
    .map((column) => `NOT (NEW.${column} IS OLD.${column})`)
    .join(" OR ");
  db.exec(`CREATE TRIGGER IF NOT EXISTS gate_runs_receipt_no_update
    BEFORE UPDATE ON gate_runs
    WHEN (${hadReceipt}) AND (${receiptChanged})
    BEGIN SELECT RAISE(ABORT, 'gate run receipt immutable'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS gate_runs_receipt_no_delete
    BEFORE DELETE ON gate_runs
    WHEN (${hadReceipt})
    BEGIN SELECT RAISE(ABORT, 'gate run receipt immutable'); END`);
}

function ensureClosureEvidenceImmutability(db: HarnessDb): void {
  if (tableNames(db).includes("closure_process_receipts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipts_no_update
      BEFORE UPDATE ON closure_process_receipts BEGIN SELECT RAISE(ABORT, 'closure process receipt immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipts_no_delete
      BEFORE DELETE ON closure_process_receipts BEGIN SELECT RAISE(ABORT, 'closure process receipt immutable'); END`);
  }
  if (tableNames(db).includes("closure_authority_review_receipts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_authority_review_receipts_no_update
      BEFORE UPDATE ON closure_authority_review_receipts BEGIN SELECT RAISE(ABORT, 'closure authority review receipt immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_authority_review_receipts_no_delete
      BEFORE DELETE ON closure_authority_review_receipts BEGIN SELECT RAISE(ABORT, 'closure authority review receipt immutable'); END`);
  }
  if (tableNames(db).includes("runner_attestations")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS runner_attestations_no_update
      BEFORE UPDATE ON runner_attestations BEGIN SELECT RAISE(ABORT, 'runner attestation immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS runner_attestations_no_delete
      BEFORE DELETE ON runner_attestations BEGIN SELECT RAISE(ABORT, 'runner attestation immutable'); END`);
  }
  if (tableNames(db).includes("closure_materializations")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_materializations_no_update
      BEFORE UPDATE ON closure_materializations BEGIN SELECT RAISE(ABORT, 'closure materialization immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_materializations_no_delete
      BEFORE DELETE ON closure_materializations BEGIN SELECT RAISE(ABORT, 'closure materialization immutable'); END`);
  }
}

/**
 * schema を現行 SCHEMA_VERSION まで適用する。
 * user_version < SCHEMA_VERSION のときのみ DDL を流し、適用後に user_version を更新する。
 * 冪等 (既に最新なら applied=false で no-op)。
 */
export function migrate(db: HarnessDb): MigrationResult {
  const fromVersion = db.userVersion();
  if (fromVersion < 36) db.exec("DROP INDEX IF EXISTS idx_closure_process_receipts_dedupe");
  const ddls = schemaDdl();
  for (const ddl of ddls.filter((s) => s.startsWith("CREATE TABLE"))) db.exec(ddl);
  const addedColumns = addMissingColumns(db);
  ensurePrimaryKeyCompatibilityIndexes(db);
  ensureGateRunReceiptImmutability(db);
  ensureClosureEvidenceImmutability(db);
  for (const ddl of ddls.filter((s) => /^CREATE (?:UNIQUE )?INDEX/.test(s))) db.exec(ddl);
  if (fromVersion < SCHEMA_VERSION) db.setUserVersion(SCHEMA_VERSION);
  const toVersion = fromVersion > SCHEMA_VERSION ? fromVersion : SCHEMA_VERSION;
  return {
    fromVersion,
    toVersion,
    applied: fromVersion < SCHEMA_VERSION || addedColumns > 0,
    tables: tableNames(db),
  };
}

/** registry が宣言する全 table が DB に存在するか検査する (status 用)。 */
export function missingTables(db: HarnessDb): string[] {
  const present = new Set(tableNames(db));
  return HARNESS_DB_TABLES.map((t) => t.name).filter((name) => !present.has(name));
}

/** table 名 → 行数 (status 用、registry 宣言 table のみ)。 */
export function rowCounts(db: HarnessDb): Record<string, number> {
  const counts: Record<string, number> = {};
  const present = new Set(tableNames(db));
  for (const table of HARNESS_DB_TABLES) {
    if (!present.has(table.name)) continue;
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table.name}`).get();
    counts[table.name] = Number(row?.n ?? 0);
  }
  return counts;
}

export { HARNESS_DB_TABLE_BY_NAME, SCHEMA_VERSION };
