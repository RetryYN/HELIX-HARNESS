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

const LEGACY_WORKFLOW_SCHEMA_RETIREMENT_VERSION = 47;
const LEGACY_WORKFLOW_LOCATION_COLUMNS = new Set(["selected_drive_model", "default_drive_model"]);

function dropIndexesReferencingLegacyWorkflowColumns(db: HarnessDb): void {
  const indexes = db.prepare("PRAGMA index_list(project_current_location)").all();
  for (const row of indexes) {
    if (String(row.origin) !== "c") continue;
    const indexName = String(row.name);
    assertSqlIdentifier(indexName);
    const indexedColumns = db
      .prepare(`PRAGMA index_info(${indexName})`)
      .all()
      .map((column) => String(column.name));
    if (!indexedColumns.some((column) => LEGACY_WORKFLOW_LOCATION_COLUMNS.has(column))) continue;
    db.exec(`DROP INDEX ${indexName}`);
  }
}

function retireLegacyWorkflowSchemaObjects(db: HarnessDb, fromVersion: number): void {
  if (fromVersion >= LEGACY_WORKFLOW_SCHEMA_RETIREMENT_VERSION) return;
  db.exec("DROP INDEX IF EXISTS idx_project_drive_model_candidates_status");
  db.exec("DROP TABLE IF EXISTS project_drive_model_candidates");
  if (!tableNames(db).includes("project_current_location")) return;
  dropIndexesReferencingLegacyWorkflowColumns(db);
  const columns = columnNames(db, "project_current_location");
  for (const column of LEGACY_WORKFLOW_LOCATION_COLUMNS) {
    if (columns.has(column)) db.exec(`ALTER TABLE project_current_location DROP COLUMN ${column}`);
  }
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
  if (tableNames(db).includes("closure_terminal_boundaries")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_terminal_boundaries_no_update
      BEFORE UPDATE ON closure_terminal_boundaries BEGIN SELECT RAISE(ABORT, 'closure terminal boundary immutable projection'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_terminal_boundaries_no_delete
      BEFORE DELETE ON closure_terminal_boundaries BEGIN SELECT RAISE(ABORT, 'closure terminal boundary immutable projection'); END`);
  }
  if (tableNames(db).includes("closure_process_receipts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipts_no_update
      BEFORE UPDATE ON closure_process_receipts BEGIN SELECT RAISE(ABORT, 'closure process receipt immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipts_no_delete
      BEFORE DELETE ON closure_process_receipts BEGIN SELECT RAISE(ABORT, 'closure process receipt immutable'); END`);
  }
  if (tableNames(db).includes("closure_process_receipt_migration_conflicts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipt_migration_conflicts_no_update
      BEFORE UPDATE ON closure_process_receipt_migration_conflicts BEGIN SELECT RAISE(ABORT, 'closure process receipt migration conflict immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_process_receipt_migration_conflicts_no_delete
      BEFORE DELETE ON closure_process_receipt_migration_conflicts BEGIN SELECT RAISE(ABORT, 'closure process receipt migration conflict immutable'); END`);
  }
  if (tableNames(db).includes("closure_authority_review_receipts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_authority_review_receipts_no_update
      BEFORE UPDATE ON closure_authority_review_receipts BEGIN SELECT RAISE(ABORT, 'closure authority review receipt immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS closure_authority_review_receipts_no_delete
      BEFORE DELETE ON closure_authority_review_receipts BEGIN SELECT RAISE(ABORT, 'closure authority review receipt immutable'); END`);
  }
  if (tableNames(db).includes("team_member_run_receipts")) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS team_member_run_receipts_no_update
      BEFORE UPDATE ON team_member_run_receipts BEGIN SELECT RAISE(ABORT, 'team member run receipt immutable'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS team_member_run_receipts_no_delete
      BEFORE DELETE ON team_member_run_receipts BEGIN SELECT RAISE(ABORT, 'team member run receipt immutable'); END`);
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
 * v48以前はdedupe tupleが非uniqueだった。unique index作成前に、決定的な最小keyを
 * canonical rowとして残し、それ以外をappend-only監査表へ退避する。
 */
function archiveLegacyClosureProcessReceiptDuplicates(db: HarnessDb, fromVersion: number): void {
  if (fromVersion >= 48 || !tableNames(db).includes("closure_process_receipts")) return;
  db.exec("DROP TRIGGER IF EXISTS closure_process_receipts_no_update");
  db.exec("DROP TRIGGER IF EXISTS closure_process_receipts_no_delete");
  db.exec(`INSERT OR IGNORE INTO closure_process_receipt_migration_conflicts (
      archive_key, process_receipt_key, canonical_process_receipt_key, schema_version,
      materialization_id, kind, repository_head, executable, argv_json, dedupe_key,
      exit_code, signal, timed_out, stdout_digest, stderr_digest, stdout_path, stderr_path,
      completed_at, archive_reason, archived_at
    )
    SELECT
      'legacy-dedupe:' || receipt.process_receipt_key,
      receipt.process_receipt_key,
      duplicates.canonical_process_receipt_key,
      receipt.schema_version, receipt.materialization_id, receipt.kind,
      receipt.repository_head, receipt.executable, receipt.argv_json, receipt.dedupe_key,
      receipt.exit_code, receipt.signal, receipt.timed_out, receipt.stdout_digest,
      receipt.stderr_digest, receipt.stdout_path, receipt.stderr_path, receipt.completed_at,
      'legacy_duplicate_dedupe_tuple', 'schema-v48-migration'
    FROM closure_process_receipts AS receipt
    JOIN (
      SELECT repository_head, dedupe_key, completed_at,
             MIN(process_receipt_key) AS canonical_process_receipt_key
      FROM closure_process_receipts
      WHERE repository_head IS NOT NULL AND dedupe_key IS NOT NULL AND completed_at IS NOT NULL
      GROUP BY repository_head, dedupe_key, completed_at
      HAVING COUNT(*) > 1
    ) AS duplicates
      ON receipt.repository_head = duplicates.repository_head
     AND receipt.dedupe_key = duplicates.dedupe_key
     AND receipt.completed_at = duplicates.completed_at
    WHERE receipt.process_receipt_key <> duplicates.canonical_process_receipt_key`);
  db.exec(`DELETE FROM closure_process_receipts
    WHERE process_receipt_key IN (
      SELECT process_receipt_key FROM closure_process_receipt_migration_conflicts
      WHERE archive_reason = 'legacy_duplicate_dedupe_tuple'
    )`);
}

/**
 * SQLiteのlegacy TEXT PRIMARY KEYはNULLを暗黙拒否しない。既存tableを破壊的に作り直さず、
 * canonical DDLと同じNOT NULL境界をINSERT/UPDATE triggerで補強する。
 */
function ensurePrimaryKeyNotNullTriggers(db: HarnessDb): void {
  for (const table of HARNESS_DB_TABLES) {
    const primaryKey = table.columns.find((column) => column.primaryKey);
    if (!primaryKey || !tableNames(db).includes(table.name)) continue;
    const triggerPrefix = `${table.name}_${primaryKey.name}_pk_not_null`;
    db.exec(`CREATE TRIGGER IF NOT EXISTS ${triggerPrefix}_insert
      BEFORE INSERT ON ${table.name}
      WHEN NEW.${primaryKey.name} IS NULL
      BEGIN SELECT RAISE(ABORT, 'primary key must not be null'); END`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS ${triggerPrefix}_update
      BEFORE UPDATE OF ${primaryKey.name} ON ${table.name}
      WHEN NEW.${primaryKey.name} IS NULL
      BEGIN SELECT RAISE(ABORT, 'primary key must not be null'); END`);
  }
}

function ensureExecutionEpisodeRightArmEvidenceImmutability(db: HarnessDb): void {
  if (!tableNames(db).includes("github_execution_episode_right_arm_evidence")) return;
  db.exec(`CREATE TRIGGER IF NOT EXISTS github_execution_episode_right_arm_evidence_no_update
    BEFORE UPDATE ON github_execution_episode_right_arm_evidence BEGIN SELECT RAISE(ABORT, 'execution episode right-arm evidence immutable'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS github_execution_episode_right_arm_evidence_no_delete
    BEFORE DELETE ON github_execution_episode_right_arm_evidence BEGIN SELECT RAISE(ABORT, 'execution episode right-arm evidence immutable'); END`);
}

function ensureOrchestrationEventProjectionImmutability(db: HarnessDb): void {
  if (!tableNames(db).includes("orchestration_event_projections")) return;
  db.exec(`CREATE TRIGGER IF NOT EXISTS orchestration_event_projections_no_update
    BEFORE UPDATE ON orchestration_event_projections BEGIN SELECT RAISE(ABORT, 'orchestration event projection immutable'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS orchestration_event_projections_no_delete
    BEFORE DELETE ON orchestration_event_projections BEGIN SELECT RAISE(ABORT, 'orchestration event projection immutable'); END`);
}

function ensureMeasurementHistoryImmutability(db: HarnessDb): void {
  if (!tableNames(db).includes("measurement_history_events")) return;
  db.exec(`CREATE TRIGGER IF NOT EXISTS measurement_history_events_no_update
    BEFORE UPDATE ON measurement_history_events BEGIN SELECT RAISE(ABORT, 'measurement history event immutable'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS measurement_history_events_no_delete
    BEFORE DELETE ON measurement_history_events BEGIN SELECT RAISE(ABORT, 'measurement history event immutable'); END`);
  if (tableNames(db).includes("measurement_history_heads")) {
    db.prepare(
      "INSERT OR IGNORE INTO measurement_history_heads (head_id,last_event_digest,last_sequence,updated_at) VALUES ('measurement-history',NULL,0,'')",
    ).run();
  }
}

/**
 * schema を現行 SCHEMA_VERSION まで適用する。
 * user_version < SCHEMA_VERSION のときのみ DDL を流し、適用後に user_version を更新する。
 * 冪等 (既に最新なら applied=false で no-op)。
 */
export function migrate(db: HarnessDb): MigrationResult {
  const fromVersion = db.userVersion();
  let addedColumns = 0;
  db.exec("SAVEPOINT helix_schema_migration");
  try {
    if (fromVersion < 48) db.exec("DROP INDEX IF EXISTS idx_closure_process_receipts_dedupe");
    retireLegacyWorkflowSchemaObjects(db, fromVersion);
    const ddls = schemaDdl();
    for (const ddl of ddls.filter((s) => s.startsWith("CREATE TABLE"))) db.exec(ddl);
    addedColumns = addMissingColumns(db);
    archiveLegacyClosureProcessReceiptDuplicates(db, fromVersion);
    ensurePrimaryKeyCompatibilityIndexes(db);
    ensurePrimaryKeyNotNullTriggers(db);
    ensureGateRunReceiptImmutability(db);
    ensureClosureEvidenceImmutability(db);
    ensureExecutionEpisodeRightArmEvidenceImmutability(db);
    ensureOrchestrationEventProjectionImmutability(db);
    ensureMeasurementHistoryImmutability(db);
    for (const ddl of ddls.filter((s) => /^CREATE (?:UNIQUE )?INDEX/.test(s))) db.exec(ddl);
    if (fromVersion < SCHEMA_VERSION) db.setUserVersion(SCHEMA_VERSION);
    db.exec("RELEASE SAVEPOINT helix_schema_migration");
  } catch (error) {
    db.exec("ROLLBACK TO SAVEPOINT helix_schema_migration");
    db.exec("RELEASE SAVEPOINT helix_schema_migration");
    throw error;
  }
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
