import { createHash } from "node:crypto";
import type { HarnessDb } from "./index";

type Sha256Digest = `sha256:${string}`;

function sha256Digest(value: string): Sha256Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export const EXPECTED_SCHEMA_DDL_DIGEST: Sha256Digest =
  "sha256:8b83ada993acce14d7b5511fdf82c8390690a6765dd93e1345e4285c2dc3e7d7";

export const EXPECTED_SQLITE_SCHEMA_OBJECT_DIGEST: Sha256Digest =
  "sha256:b88a85687fa7fde1a9165438dbf47f3ce34bab46d53ecc90ea20cb8246577e6c";

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
