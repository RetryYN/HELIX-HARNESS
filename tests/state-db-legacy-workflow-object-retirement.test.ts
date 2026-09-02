import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkStateDbSchemaAuthority } from "../src/doctor/state-db-schema-authority";
import { SCHEMA_VERSION } from "../src/schema/harness-db";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

// PLAN-L7-695-state-db-legacy-workflow-object-retirement / U-SDLW-001..005

function seedRevision46LegacyDb() {
  const db = openHarnessDb(":memory:");
  db.exec(`
    CREATE TABLE project_current_location (
      snapshot_id TEXT PRIMARY KEY,
      current_status TEXT,
      selected_drive_model TEXT,
      default_drive_model TEXT,
      drive_route_status TEXT
    );
    CREATE INDEX idx_project_current_location_status
      ON project_current_location (current_status, selected_drive_model, drive_route_status);
    CREATE TABLE project_drive_model_candidates (
      candidate_id TEXT PRIMARY KEY,
      snapshot_id TEXT,
      model TEXT
    );
    CREATE INDEX idx_project_drive_model_candidates_status
      ON project_drive_model_candidates (model);
    CREATE TABLE event_log (event_id TEXT PRIMARY KEY, payload_json TEXT);
    INSERT INTO event_log VALUES ('event-1', '{"authority":"keep"}');
    INSERT INTO project_current_location VALUES ('latest', 'active', 'Reverse', 'Forward', 'ready');
    INSERT INTO project_drive_model_candidates VALUES ('candidate-1', 'latest', 'Reverse');
  `);
  db.setUserVersion(46);
  return db;
}

function schemaNames(db: ReturnType<typeof openHarnessDb>): string[] {
  return db
    .prepare("SELECT name FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((row) => String(row.name));
}

describe("STATE-DB-WORKFLOW-RETIREMENT-001", () => {
  it("U-SDLW-001: revision 46から旧workflow objectを除去する", () => {
    const db = seedRevision46LegacyDb();
    try {
      migrate(db);
      const columns = db
        .prepare("PRAGMA table_info(project_current_location)")
        .all()
        .map((row) => String(row.name));
      expect(SCHEMA_VERSION).toBe(48);
      expect(db.userVersion()).toBe(48);
      expect(columns).not.toContain("selected_drive_model");
      expect(columns).not.toContain("default_drive_model");
      expect(schemaNames(db)).not.toContain("project_drive_model_candidates");
      expect(schemaNames(db)).not.toContain("idx_project_drive_model_candidates_status");
      expect(
        db
          .prepare("SELECT sql FROM sqlite_schema WHERE name='idx_project_current_location_status'")
          .get(),
      ).toEqual({
        sql: expect.stringMatching(
          /ON project_current_location \(current_status, workflow_target_axis, workflow_target_id\)/,
        ),
      });
    } finally {
      db.close();
    }
  });

  it("U-SDLW-002: migration対象外のauthoritative rowを保持する", () => {
    const db = seedRevision46LegacyDb();
    try {
      migrate(db);
      expect(
        db.prepare("SELECT payload_json FROM event_log WHERE event_id='event-1'").get(),
      ).toEqual({ payload_json: '{"authority":"keep"}' });
    } finally {
      db.close();
    }
  });

  it("U-SDLW-003: DROP依存で失敗した場合はschemaとversionを全rollbackする", () => {
    const db = seedRevision46LegacyDb();
    try {
      db.exec(
        "CREATE VIEW legacy_workflow_view AS SELECT selected_drive_model FROM project_current_location",
      );
      expect(() => migrate(db)).toThrow();
      expect(db.userVersion()).toBe(46);
      expect(schemaNames(db)).toEqual(
        expect.arrayContaining([
          "legacy_workflow_view",
          "project_drive_model_candidates",
          "idx_project_drive_model_candidates_status",
        ]),
      );
      expect(
        db
          .prepare("PRAGMA table_info(project_current_location)")
          .all()
          .map((row) => String(row.name)),
      ).toEqual(expect.arrayContaining(["selected_drive_model", "default_drive_model"]));
    } finally {
      db.close();
    }
  });

  it("U-SDLW-004: revision 47再適用はschema exact setを変えない", () => {
    const db = seedRevision46LegacyDb();
    try {
      migrate(db);
      const before = schemaNames(db);
      expect(migrate(db).applied).toBe(false);
      expect(schemaNames(db)).toEqual(before);
    } finally {
      db.close();
    }
  });

  it("U-SDLW-005: 各legacy objectの復活をdoctor hard gateが個別に拒否する", () => {
    const mutations = [
      {
        name: "旧candidate table",
        mutate: (db: ReturnType<typeof openHarnessDb>) =>
          db.exec("CREATE TABLE project_drive_model_candidates (candidate_id TEXT PRIMARY KEY)"),
        marker: "project_drive_model_candidates",
      },
      {
        name: "旧candidate index",
        mutate: (db: ReturnType<typeof openHarnessDb>) =>
          db.exec(`
          CREATE TABLE project_drive_model_candidates (candidate_id TEXT PRIMARY KEY, status TEXT);
          CREATE INDEX idx_project_drive_model_candidates_status
            ON project_drive_model_candidates (status);
        `),
        marker: "idx_project_drive_model_candidates_status",
      },
      {
        name: "旧selected drive model列",
        mutate: (db: ReturnType<typeof openHarnessDb>) =>
          db.exec("ALTER TABLE project_current_location ADD COLUMN selected_drive_model TEXT"),
        marker: "project_current_location",
      },
      {
        name: "旧default drive model列",
        mutate: (db: ReturnType<typeof openHarnessDb>) =>
          db.exec("ALTER TABLE project_current_location ADD COLUMN default_drive_model TEXT"),
        marker: "project_current_location",
      },
    ];
    for (const { name, mutate, marker } of mutations) {
      const db = openHarnessDb(":memory:");
      try {
        migrate(db);
        mutate(db);
        const result = checkStateDbSchemaAuthority({ actualDb: db });
        expect(result.ok, name).toBe(false);
        expect(result.messages.join("\n"), name).toContain(marker);
      } finally {
        db.close();
      }
    }
  });

  it("U-SDLW-006: full doctorがschema authority結果をhard gateへ接続する", () => {
    const source = readFileSync("src/doctor/index.ts", "utf8");
    expect(source).toContain("checkStateDbSchemaAuthority({ repoRoot: deps.repoRoot })");
    expect(source).toContain('["stateDbSchemaAuthority", stateDbSchemaAuthority.ok]');
    expect(source).toContain("aggregateInternalDoctorChecks(doctorCheckDefinitions)");
    expect(source).toContain("ok: doctorAllChecksOk");
    expect(source).toContain("...stateDbSchemaAuthority.messages.map");
  });
});
