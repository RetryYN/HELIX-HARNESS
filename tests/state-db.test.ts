import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HARNESS_DB_TABLE_BY_NAME,
  primaryKeyOf,
  SCHEMA_VERSION,
  schemaDdl,
} from "../src/schema/harness-db";
import { HARNESS_DB_INDEXES, HARNESS_DB_TABLES } from "../src/schema/harness-db-catalog";
import { HARNESS_DB_INDEXES as SECTION_HARNESS_DB_INDEXES } from "../src/schema/harness-db-indexes";
import { col, pk } from "../src/schema/harness-db-table-builders";
import { HARNESS_DB_CORE_TABLES } from "../src/schema/harness-db-tables-core";
import { HARNESS_DB_DESIGN_TABLES } from "../src/schema/harness-db-tables-design";
import { HARNESS_DB_EVALUATION_TABLES } from "../src/schema/harness-db-tables-evaluation";
import { HARNESS_DB_GRAPH_EXPORT_TABLES } from "../src/schema/harness-db-tables-graph";
import { assertWithinHelixStateDir, openHarnessDb, upsertRow } from "../src/state-db/index";
import { ensureHarnessSchema, harnessDbStatus } from "../src/state-db/maintenance";
import { migrate, missingTables, rowCounts, tableNames } from "../src/state-db/migration";

/**
 * bun:sqlite releases the OS file handle on GC finalization rather than synchronously on
 * close(), so on Windows a plain rmSync of the temp repo right after close() can hit EBUSY
 * (the harness.db file is still mapped). Force GC where the runtime exposes it, then remove
 * with retries. node:sqlite releases on close(), so the GC hook is a Bun-only no-op there.
 */
function cleanupRepo(repo: string): void {
  (globalThis as { Bun?: { gc: (sync: boolean) => void } }).Bun?.gc(true);
  rmSync(repo, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
}

/**
 * IT-DB-01: harness.db state-db foundation。
 * table 作成 (registry-driven migration) + idempotent upsert 基盤 + DB path guard。
 * 設計 pair: docs/test-design/harness/L8-integration-test-design.md IT-DB-01。
 */
describe("IT-DB-01: harness.db state-db foundation", () => {
  it("uses node:sqlite fallback when the test worker is running under Node", () => {
    const db = openHarnessDb(":memory:");
    try {
      const expectedDriver =
        typeof (globalThis as { Bun?: unknown }).Bun === "undefined" ? "node" : "bun";
      expect(db.driver).toBe(expectedDriver);
      db.exec("CREATE TABLE fallback_smoke (id TEXT PRIMARY KEY)");
      db.prepare("INSERT INTO fallback_smoke (id) VALUES (?)").run("ok");
      expect(db.prepare("SELECT id FROM fallback_smoke").get()?.id).toBe("ok");
    } finally {
      db.close();
    }
  });

  it("file-backed harness.db enables WAL and busy timeout for rebuild/read concurrency", () => {
    const repo = mkdtempSync(join(tmpdir(), "utdb-"));
    const db = openHarnessDb(join(repo, ".helix", "harness.db"), { repoRoot: repo });
    try {
      const journalMode = db.prepare("PRAGMA journal_mode").get();
      const busyTimeout = db.prepare("PRAGMA busy_timeout").get();
      const timeout = Number(busyTimeout?.timeout ?? busyTimeout?.busy_timeout ?? 0);

      expect(String(journalMode?.journal_mode ?? "").toLowerCase()).toBe("wal");
      expect(timeout).toBeGreaterThanOrEqual(5000);
    } finally {
      db.close();
      cleanupRepo(repo);
    }
  });

  it("file-backed harness.db readers keep the committed snapshot during a write transaction", () => {
    const repo = mkdtempSync(join(tmpdir(), "utdb-"));
    const dbPath = join(repo, ".helix", "harness.db");
    const writer = openHarnessDb(dbPath, { repoRoot: repo });
    const reader = openHarnessDb(dbPath, { repoRoot: repo });
    try {
      writer.exec("CREATE TABLE snapshot_smoke (id TEXT PRIMARY KEY, value TEXT)");
      writer.prepare("INSERT INTO snapshot_smoke (id, value) VALUES (?, ?)").run("row", "old");

      writer.exec("BEGIN IMMEDIATE");
      writer.prepare("UPDATE snapshot_smoke SET value = ? WHERE id = ?").run("new", "row");
      expect(
        reader.prepare("SELECT value FROM snapshot_smoke WHERE id = ?").get("row")?.value,
      ).toBe("old");
      writer.exec("ROLLBACK");
    } finally {
      reader.close();
      writer.close();
      cleanupRepo(repo);
    }
  });

  it("migrate が registry の全 table を作成し user_version を設定する", () => {
    const db = openHarnessDb(":memory:");
    const result = migrate(db);

    expect(result.applied).toBe(true);
    expect(result.fromVersion).toBe(0);
    expect(result.toVersion).toBe(SCHEMA_VERSION);
    expect(db.userVersion()).toBe(SCHEMA_VERSION);
    expect(pk("fixture_id")).toMatchObject({ name: "fixture_id", primaryKey: true });
    expect(col("fixture_count", "INTEGER")).toEqual({ name: "fixture_count", type: "INTEGER" });
    expect(HARNESS_DB_TABLES.map((t) => t.name)).toEqual(
      [
        ...HARNESS_DB_CORE_TABLES,
        ...HARNESS_DB_DESIGN_TABLES,
        ...HARNESS_DB_GRAPH_EXPORT_TABLES,
        ...HARNESS_DB_EVALUATION_TABLES,
      ].map((t) => t.name),
    );
    expect(HARNESS_DB_INDEXES.map((i) => i.name)).toEqual(
      SECTION_HARNESS_DB_INDEXES.map((i) => i.name),
    );

    const present = tableNames(db);
    for (const table of HARNESS_DB_TABLES) {
      expect(present).toContain(table.name);
    }
    const planRegistryColumns = db
      .prepare("PRAGMA table_info(plan_registry)")
      .all()
      .map((row) => String(row.name));
    expect(planRegistryColumns).toContain("source_hash");
    const currentLocationColumns = db
      .prepare("PRAGMA table_info(project_current_location)")
      .all()
      .map((row) => String(row.name));
    expect(currentLocationColumns).toEqual(
      expect.arrayContaining([
        "snapshot_id",
        "current_status",
        "selected_drive_model",
        "operation_observed_gap",
        "snapshot_hash",
      ]),
    );
    const artifactRemapColumns = db
      .prepare("PRAGMA table_info(project_artifact_remap)")
      .all()
      .map((row) => String(row.name));
    expect(artifactRemapColumns).toEqual(
      expect.arrayContaining([
        "zip_source_binding_ids",
        "tailoring_rule_ids",
        "tailoring_detail_levels",
      ]),
    );
    const zipSourceBindingColumns = db
      .prepare("PRAGMA table_info(vmodel_zip_source_bindings)")
      .all()
      .map((row) => String(row.name));
    expect(zipSourceBindingColumns).toEqual(
      expect.arrayContaining([
        "binding_id",
        "source_path",
        "source_category",
        "evidence_tables",
        "zip_source_binding_hash",
      ]),
    );
    const roadmapCurrentActionColumns = db
      .prepare("PRAGMA table_info(project_roadmap_current_actions)")
      .all()
      .map((row) => String(row.name));
    expect(roadmapCurrentActionColumns).toEqual(
      expect.arrayContaining([
        "action_id",
        "category",
        "automation_class",
        "doc_dependencies",
        "implementation_dependencies",
      ]),
    );
    const zipAdoptionDecisionColumns = db
      .prepare("PRAGMA table_info(project_zip_adoption_decisions)")
      .all()
      .map((row) => String(row.name));
    expect(zipAdoptionDecisionColumns).toEqual(
      expect.arrayContaining([
        "adoption_id",
        "category",
        "source_package",
        "source_document",
        "implementation_dependencies",
      ]),
    );
    const tailoringDecisionColumns = db
      .prepare("PRAGMA table_info(project_tailoring_decisions)")
      .all()
      .map((row) => String(row.name));
    expect(tailoringDecisionColumns).toEqual(
      expect.arrayContaining([
        "tailoring_id",
        "category",
        "detail_level",
        "profile",
        "source_document",
        "implementation_dependencies",
      ]),
    );
    const vmodelGuardColumns = db
      .prepare("PRAGMA table_info(project_vmodel_regression_guards)")
      .all()
      .map((row) => String(row.name));
    expect(vmodelGuardColumns).toEqual(
      expect.arrayContaining([
        "guard_id",
        "status",
        "protected_surface",
        "guard_count",
        "required_action",
      ]),
    );
    const vmodelBlockerColumns = db
      .prepare("PRAGMA table_info(project_vmodel_fit_blockers)")
      .all()
      .map((row) => String(row.name));
    expect(vmodelBlockerColumns).toEqual(
      expect.arrayContaining([
        "blocker_code",
        "status",
        "blocker_count",
        "doc_dependencies",
        "implementation_dependencies",
      ]),
    );
    const vmodelReadModelTables = [
      "project_current_location",
      "project_drive_model_candidates",
      "project_roadmap_current_actions",
      "project_zip_adoption_decisions",
      "project_tailoring_decisions",
      "project_vmodel_regression_guards",
      "project_vmodel_fit_blockers",
      "project_l12_layer_coverage",
      "design_coverage_gate",
      "project_operation_scopes",
      "project_artifact_remap",
      "vmodel_zip_manifest",
      "vmodel_zip_source_bindings",
      "visualization_view_model",
      "visualization_tree_view",
    ];
    for (const table of vmodelReadModelTables) {
      expect(HARNESS_DB_TABLE_BY_NAME.has(table)).toBe(true);
    }
    expect(missingTables(db)).toEqual([]);
    db.close();
  });

  it("loop_iterations schema と plan/iteration index を registry から作成する", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);

    const loopColumns = db
      .prepare("PRAGMA table_info(loop_iterations)")
      .all()
      .map((row) => String(row.name));
    expect(loopColumns).toEqual([
      "loop_iteration_id",
      "plan_id",
      "iteration",
      "worker_provider",
      "verifier_provider",
      "verdict",
      "stop_reason",
      "blocked_reason",
      "cost_usd",
      "evidence_path",
      "recorded_at",
    ]);

    const loopIndexes = db
      .prepare("PRAGMA index_list(loop_iterations)")
      .all()
      .map((row) => String(row.name));
    expect(loopIndexes).toContain("idx_loop_iterations_plan");

    const indexedColumns = db
      .prepare("PRAGMA index_info(idx_loop_iterations_plan)")
      .all()
      .map((row) => String(row.name));
    expect(indexedColumns).toEqual(["plan_id", "iteration"]);
    db.close();
  });

  it("migrate は冪等 (2 回目は no-op、version 安定、例外なし)", () => {
    const db = openHarnessDb(":memory:");
    const first = migrate(db);
    const second = migrate(db);

    expect(first.applied).toBe(true);
    expect(second.applied).toBe(false);
    expect(second.fromVersion).toBe(SCHEMA_VERSION);
    expect(second.toVersion).toBe(SCHEMA_VERSION);
    expect(missingTables(db)).toEqual([]);
    db.close();
  });

  it("migrate repairs missing added columns even when user_version is current", () => {
    const db = openHarnessDb(":memory:");
    db.exec(`
      CREATE TABLE issue_queue (
        issue_queue_id TEXT PRIMARY KEY,
        source_event_id TEXT,
        plan_id TEXT,
        target TEXT,
        title TEXT,
        body TEXT,
        status TEXT,
        human_approval_required INTEGER,
        created_at TEXT
      )
    `);
    db.setUserVersion(SCHEMA_VERSION);

    const result = migrate(db);
    const issueQueueColumns = db
      .prepare("PRAGMA table_info(issue_queue)")
      .all()
      .map((row) => String(row.name));

    expect(result.applied).toBe(true);
    expect(issueQueueColumns).toContain("approved_by");
    expect(issueQueueColumns).toContain("approved_at");
    expect(issueQueueColumns).toContain("external_issue_id");
    expect(issueQueueColumns).toContain("external_issue_url");
    expect(db.userVersion()).toBe(SCHEMA_VERSION);
    db.close();
  });

  it("upsertRow が PK conflict で idempotent (二重適用で重複せず更新)", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    const planTable = HARNESS_DB_TABLE_BY_NAME.get("plan_registry");
    if (!planTable) throw new Error("plan_registry が registry に存在しません");
    const pk = primaryKeyOf(planTable);

    const row = {
      plan_id: "PLAN-L7-45-harness-db-foundation",
      kind: "impl",
      layer: "L7",
      status: "draft",
    };
    upsertRow(db, { table: "plan_registry", primaryKey: pk, row });
    upsertRow(db, { table: "plan_registry", primaryKey: pk, row: { ...row, status: "confirmed" } });

    expect(rowCounts(db).plan_registry).toBe(1);
    const stored = db
      .prepare("SELECT status FROM plan_registry WHERE plan_id = ?")
      .get("PLAN-L7-45-harness-db-foundation");
    expect(stored?.status).toBe("confirmed");
    db.close();
  });

  it("upsertRow は primaryKey 列を含まない row を拒否する", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    expect(() =>
      upsertRow(db, { table: "plan_registry", primaryKey: "plan_id", row: { kind: "impl" } }),
    ).toThrow();
    db.close();
  });

  it("upsertRow は不正な SQL 識別子 (table/column) を拒否する (injection 防止)", () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    expect(() =>
      upsertRow(db, {
        table: "plan_registry; DROP TABLE plan_registry",
        primaryKey: "plan_id",
        row: { plan_id: "x" },
      }),
    ).toThrow();
    expect(() =>
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: { plan_id: "x", "evil)--": "y" },
      }),
    ).toThrow();
    db.close();
  });

  it("assertWithinHelixStateDir は .helix 配下と :memory: を許可し外を拒否する", () => {
    const repo = process.cwd();
    expect(() => assertWithinHelixStateDir(":memory:", repo)).not.toThrow();
    expect(() => assertWithinHelixStateDir(".helix/harness.db", repo)).not.toThrow();
    expect(() => assertWithinHelixStateDir(".helix/sub/x.db", repo)).not.toThrow();
    expect(() => assertWithinHelixStateDir("harness.db", repo)).toThrow();
    expect(() => assertWithinHelixStateDir("../escape.db", repo)).toThrow();
  });

  it("userVersion は setUserVersion と round-trip し負値を拒否する", () => {
    const db = openHarnessDb(":memory:");
    db.setUserVersion(3);
    expect(db.userVersion()).toBe(3);
    expect(() => db.setUserVersion(-1)).toThrow();
    db.close();
  });

  it("schemaDdl は deterministic (同一順序の DDL を返す)", () => {
    expect(schemaDdl()).toEqual(schemaDdl());
    expect(schemaDdl().some((s) => s.startsWith("CREATE TABLE IF NOT EXISTS plan_registry"))).toBe(
      true,
    );
  });
});

/** db status / rebuild (maintenance) — PLAN-L7-45 §4 DoD: runnable・deterministic。 */
describe("IT-DB-01: db status / rebuild maintenance", () => {
  it("harnessDbStatus は未初期化 path で initialized:false を返す (DB を作らない)", () => {
    const repo = mkdtempSync(join(tmpdir(), "utdb-"));
    try {
      const s = harnessDbStatus(repo);
      expect(s.initialized).toBe(false);
      expect(s.tableCount).toBe(0);
      expect(s.expectedVersion).toBe(SCHEMA_VERSION);
    } finally {
      cleanupRepo(repo);
    }
  });

  it("ensureHarnessSchema が schema を適用し harnessDbStatus が報告する (rebuild 冪等)", () => {
    const repo = mkdtempSync(join(tmpdir(), "utdb-"));
    try {
      const r = ensureHarnessSchema(repo);
      expect(r.migration.applied).toBe(true);
      expect(r.migration.tables.length).toBe(HARNESS_DB_TABLES.length);

      const s = harnessDbStatus(repo);
      expect(s.initialized).toBe(true);
      expect(s.schemaVersion).toBe(SCHEMA_VERSION);
      expect(s.tableCount).toBe(HARNESS_DB_TABLES.length);
      expect(s.missingTables).toEqual([]);
      expect(s.totalRows).toBe(0);
      expect(s.orphanTraceEdges).toBe(0);

      const again = ensureHarnessSchema(repo);
      expect(again.migration.applied).toBe(false);
    } finally {
      cleanupRepo(repo);
    }
  });
});
