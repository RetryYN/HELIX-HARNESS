import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rebuildHarnessDb } from "../src/composition/db-rebuild-composition";
import { assertSqlIdentifier } from "../src/schema/harness-db";
import { type HarnessDb, openHarnessDb } from "../src/state-db";
import { tableNames } from "../src/state-db/migration";

const POLICY_PATH = "docs/governance/l3-g3-logical-db-bootstrap-policy.json";
const SCRIPT_PATH = "scripts/l3-g3-logical-db-receipt.ts";

interface BootstrapPolicy {
  schema_version: string;
  normalization_marker: string;
  observation_columns: string[];
  checkpoint_table_selector: {
    kind: "name_contains_any";
    tokens: string[];
  };
  rebuild_count: number;
}

type Digest = `sha256:${string}`;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value instanceof Uint8Array) return canonicalJson([...value]);
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function digestValue(value: unknown): Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function digestBytes(value: string | Buffer): Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function columns(db: HarnessDb, table: string): string[] {
  assertSqlIdentifier(table);
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((row) => String(row.name))
    .sort();
}

function normalizedRows(
  db: HarnessDb,
  table: string,
  names: string[],
  observationColumns: Set<string>,
  marker: string,
): unknown[] {
  assertSqlIdentifier(table);
  for (const name of names) assertSqlIdentifier(name);
  if (names.length === 0) return [];
  const stableNames = names.filter((name) => !observationColumns.has(`${table}.${name}`));
  const orderNames = stableNames.length > 0 ? stableNames : names;
  return db
    .prepare(`SELECT * FROM ${table} ORDER BY ${orderNames.join(", ")}`)
    .all()
    .map((row) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          observationColumns.has(`${table}.${name}`) ? marker : row[name],
        ]),
      ),
    );
}

function logicalDatabaseDigest(
  db: HarnessDb,
  policy: BootstrapPolicy,
  includeTable: (table: string) => boolean = () => true,
): Digest {
  const observationColumns = new Set(policy.observation_columns);
  const tables = tableNames(db).filter(includeTable).sort();
  return digestValue(
    tables.map((table) => {
      const names = columns(db, table);
      return {
        table,
        columns: names,
        rows: normalizedRows(
          db,
          table,
          names,
          observationColumns,
          policy.normalization_marker,
        ),
      };
    }),
  );
}

function staleCount(db: HarnessDb): number {
  let count = 0;
  for (const table of tableNames(db)) {
    if (!columns(db, table).includes("status")) continue;
    assertSqlIdentifier(table);
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE status = ?`).get("stale");
    count += Number(row?.n ?? 0);
  }
  return count;
}

function databaseSnapshot(
  db: HarnessDb,
  policy: BootstrapPolicy,
  rebuildResult: ReturnType<typeof rebuildHarnessDb>,
) {
  const checkpointTables = tableNames(db)
    .filter((table) =>
      policy.checkpoint_table_selector.tokens.some((token) => table.includes(token)),
    )
    .sort();
  const checkpointTableSet = new Set(checkpointTables);
  return {
    projection_digest: logicalDatabaseDigest(db, policy),
    checkpoint_digest: logicalDatabaseDigest(db, policy, (table) =>
      checkpointTableSet.has(table),
    ),
    checkpoint_tables: checkpointTables,
    schema_revision: db.userVersion(),
    stale_count: staleCount(db),
    orphan_count: db.prepare("PRAGMA foreign_key_check").all().length,
    finding_count: rebuildResult.findings.length + (rebuildResult.ok ? 0 : 1),
  };
}

function unstableColumns(first: HarnessDb, replay: HarnessDb, policy: BootstrapPolicy): string[] {
  const knownObservations = new Set(policy.observation_columns);
  const unstable: string[] = [];
  for (const table of tableNames(first).sort()) {
    assertSqlIdentifier(table);
    for (const name of columns(first, table)) {
      const locator = `${table}.${name}`;
      if (knownObservations.has(locator)) continue;
      assertSqlIdentifier(name);
      const values = (db: HarnessDb) =>
        db
          .prepare(`SELECT ${name} AS value FROM ${table}`)
          .all()
          .map((row) => canonicalJson(row.value))
          .sort();
      if (canonicalJson(values(first)) !== canonicalJson(values(replay))) unstable.push(locator);
    }
  }
  return unstable;
}

export function createL3G3LogicalDbReceipt(repoRoot = process.cwd()) {
  const policyText = readFileSync(`${repoRoot}/${POLICY_PATH}`, "utf8");
  const policy = JSON.parse(policyText) as BootstrapPolicy;
  if (policy.rebuild_count !== 2) throw new Error("bootstrap policy must require exactly 2 rebuilds");
  if (policy.checkpoint_table_selector.kind !== "name_contains_any") {
    throw new Error("unsupported checkpoint table selector");
  }
  if (new Set(policy.observation_columns).size !== policy.observation_columns.length) {
    throw new Error("observation_columns contains duplicates");
  }

  const sourceHead = git(repoRoot, ["rev-parse", "HEAD"]);
  const sourceTree = git(repoRoot, ["rev-parse", "HEAD^{tree}"]);
  const firstDb = openHarnessDb(":memory:");
  const replayDb = openHarnessDb(":memory:");
  try {
    const firstResult = rebuildHarnessDb({ repoRoot, db: firstDb });
    const replayResult = rebuildHarnessDb({ repoRoot, db: replayDb });
    const first = databaseSnapshot(firstDb, policy, firstResult);
    const replay = databaseSnapshot(replayDb, policy, replayResult);
    const unexpectedUnstableColumns = unstableColumns(firstDb, replayDb, policy);
    const body = {
      schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v1",
      policy_schema_version: policy.schema_version,
      source_head: sourceHead,
      source_tree: sourceTree,
      event_head_digest: digestValue({ source_head: sourceHead, source_tree: sourceTree }),
      policy_digest: digestBytes(policyText),
      verifier_digest: digestBytes(readFileSync(`${repoRoot}/${SCRIPT_PATH}`)),
      projection_digest: first.projection_digest,
      replay_projection_digest: replay.projection_digest,
      checkpoint_digest: first.checkpoint_digest,
      replay_checkpoint_digest: replay.checkpoint_digest,
      checkpoint_tables: first.checkpoint_tables,
      replay_checkpoint_tables: replay.checkpoint_tables,
      schema_revision: first.schema_revision,
      replay_schema_revision: replay.schema_revision,
      stale_count: first.stale_count,
      replay_stale_count: replay.stale_count,
      orphan_count: first.orphan_count,
      replay_orphan_count: replay.orphan_count,
      finding_count: first.finding_count,
      replay_finding_count: replay.finding_count,
      unexpected_unstable_columns: unexpectedUnstableColumns,
    };
    return {
      ...body,
      converged:
        first.projection_digest === replay.projection_digest &&
        first.checkpoint_digest === replay.checkpoint_digest &&
        canonicalJson(first.checkpoint_tables) === canonicalJson(replay.checkpoint_tables) &&
        first.schema_revision === replay.schema_revision &&
        first.stale_count === 0 &&
        replay.stale_count === 0 &&
        first.orphan_count === 0 &&
        replay.orphan_count === 0 &&
        first.finding_count === 0 &&
        replay.finding_count === 0 &&
        unexpectedUnstableColumns.length === 0,
      receipt_digest: digestValue(body),
    };
  } finally {
    firstDb.close();
    replayDb.close();
  }
}

const invokedPath = process.argv[1] ? fileURLToPath(new URL(`file://${process.argv[1]}`)) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const receipt = createL3G3LogicalDbReceipt(process.cwd());
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  if (!receipt.converged) process.exitCode = 1;
}
