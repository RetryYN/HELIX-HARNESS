import { type Sha256Digest, sha256Digest } from "../runtime/digest";
import type { HarnessDb } from "./index";

export const EXPECTED_SCHEMA_DDL_DIGEST: Sha256Digest =
  "sha256:352d16168ff2629248b69d0ce3a0e574965cee07250649071b8d8c6474209b85";

export const EXPECTED_SQLITE_SCHEMA_OBJECT_DIGEST: Sha256Digest =
  "sha256:7f97842c671c17ab29eb61e453a0632f315f8a09f86394aef57b3909d03ac12a";

export interface SqliteSchemaObject {
  type: string;
  name: string;
  sql: string;
}

export interface SchemaAuthorityComparison {
  ok: boolean;
  missing: string[];
  extra: string[];
  changed: string[];
}

function normalizeSql(sql: unknown): string {
  return String(sql ?? "")
    .replace(/\s+/gu, " ")
    .trim();
}

function canonicalObjects(objects: readonly SqliteSchemaObject[]): SqliteSchemaObject[] {
  return objects
    .map((row) => ({ type: row.type, name: row.name, sql: normalizeSql(row.sql) }))
    .sort((left, right) =>
      left.type === right.type
        ? left.name < right.name
          ? -1
          : left.name > right.name
            ? 1
            : 0
        : left.type < right.type
          ? -1
          : 1,
    );
}

export function schemaDdlDigest(ddls: readonly string[]): Sha256Digest {
  return sha256Digest(ddls.join(";\n"));
}

export function sqliteSchemaObjectDigest(objects: readonly SqliteSchemaObject[]): Sha256Digest {
  return sha256Digest(JSON.stringify(canonicalObjects(objects)));
}

export function readSqliteSchemaObjects(db: HarnessDb): SqliteSchemaObject[] {
  return canonicalObjects(
    db
      .prepare(
        "SELECT type, name, sql FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name",
      )
      .all()
      .map((row) => ({
        type: String(row.type),
        name: String(row.name),
        sql: normalizeSql(row.sql),
      })),
  );
}

export function compareSchemaAuthority(
  expectedInput: readonly SqliteSchemaObject[],
  actualInput: readonly SqliteSchemaObject[],
): SchemaAuthorityComparison {
  const expected = new Map(canonicalObjects(expectedInput).map((row) => [row.name, row]));
  const actual = new Map(canonicalObjects(actualInput).map((row) => [row.name, row]));
  const missing = [...expected.keys()].filter((name) => !actual.has(name)).sort();
  const extra = [...actual.keys()].filter((name) => !expected.has(name)).sort();
  const changed = [...expected.entries()]
    .filter(([name, row]) => {
      const candidate = actual.get(name);
      return candidate !== undefined && (candidate.type !== row.type || candidate.sql !== row.sql);
    })
    .map(([name]) => name)
    .sort();
  return {
    ok: missing.length === 0 && extra.length === 0 && changed.length === 0,
    missing,
    extra,
    changed,
  };
}
