import { describe, expect, it } from "vitest";
import { schemaDdl } from "../src/schema/harness-db";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  compareSchemaAuthority,
  EXPECTED_SCHEMA_DDL_DIGEST,
  EXPECTED_SQLITE_SCHEMA_OBJECT_DIGEST,
  readSqliteSchemaObjects,
  schemaDdlDigest,
  sqliteSchemaObjectDigest,
} from "../src/state-db/schema-authority";

describe("STATE-DB-SCHEMA-DDL-AUTHORITY-001", () => {
  it("U-SDDA-001: canonical DDL bytesをpinned digestへ束縛する", () => {
    expect(schemaDdlDigest(schemaDdl())).toBe(EXPECTED_SCHEMA_DDL_DIGEST);
    expect(schemaDdlDigest([...schemaDdl(), "SELECT 1"])).not.toBe(EXPECTED_SCHEMA_DDL_DIGEST);
  });

  it("U-SDDA-002: fresh migrationのtable/index/trigger exact setを照合する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const actual = readSqliteSchemaObjects(db);
      expect(sqliteSchemaObjectDigest(actual)).toBe(EXPECTED_SQLITE_SCHEMA_OBJECT_DIGEST);
    } finally {
      db.close();
    }
  });

  it("U-SDDA-003/004/005: missing、extra、changedを個別にkillする", () => {
    const base = [
      { type: "table", name: "alpha", sql: "CREATE TABLE alpha (id TEXT)" },
      { type: "index", name: "idx_alpha", sql: "CREATE INDEX idx_alpha ON alpha (id)" },
    ];
    expect(compareSchemaAuthority(base, base.slice(1)).missing).toEqual([base[0]?.name]);
    expect(
      compareSchemaAuthority(base, [
        ...base,
        { type: "table", name: "unexpected", sql: "CREATE TABLE unexpected (id TEXT)" },
      ]).extra,
    ).toEqual(["unexpected"]);
    const changed = base.map((row, index) =>
      index === 0 ? { ...row, sql: `${row.sql} /* mutation */` } : row,
    );
    expect(compareSchemaAuthority(base, changed).changed).toEqual([base[0]?.name]);
  });
});
