import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { rebuildHarnessDb } from "../composition/db-rebuild-composition";
import { canonicalJson, sha256Digest } from "../runtime/digest";
import { assertSqlIdentifier } from "../schema/harness-db";
import { type HarnessDb, openHarnessDb } from "../state-db";
import { tableNames } from "../state-db/migration";

const POLICY_PATH = "docs/governance/l3-g3-logical-db-bootstrap-policy.json";
const SCRIPT_PATH = "src/doctor/l3-g3-logical-db-receipt.ts";

export interface BootstrapPolicy {
  schema_version: string;
  canonical_json: {
    object_keys: string;
    array_order: string;
    binary: string;
    encoding: string;
    digest: string;
  };
  table_order: string;
  column_order: string;
  row_order: {
    columns: string;
    fallback: string;
  };
  normalization_marker: string;
  observation_columns: string[];
  projection_input_policy: {
    tracked_workspace_required: boolean;
    runtime_logs: "exclude";
    excluded_paths: string[];
    excluded_projection_steps: string[];
  };
  checkpoint_tables: string[];
  stale_rules: Array<{
    table: string;
    column: string;
    stale_value: string;
    minimum_rows: number;
  }>;
  orphan_rules: Array<{
    child_table: string;
    child_column: string;
    parent_table: string;
    parent_column: string;
    minimum_child_rows: number;
  }>;
  rebuild_count: number;
}

type Digest = `sha256:${string}`;

export interface L3G3LogicalDbReceiptDeps {
  afterRebuild?: (db: HarnessDb, ordinal: 1 | 2) => void;
}

const CANONICAL_JSON_CONTRACT = {
  object_keys: "lexicographic_ascending",
  array_order: "preserve",
  binary: "unsigned_byte_array",
  encoding: "utf8",
  digest: "sha256",
} as const;
const ROW_ORDER_CONTRACT = {
  columns: "all non-observation columns in lexicographic order",
  fallback: "all columns in lexicographic order",
} as const;
const NORMALIZATION_MARKER = "<rebuild-observation>";
const OBSERVATION_COLUMNS_DIGEST =
  "sha256:ffc07b28f618078f3ff4966203e5cf4317221891b8e95e4ce9a59bf66ee87455";
const EXCLUDED_RUNTIME_LOG_PATHS = [
  ".helix/logs/plan/*.digest.json",
  ".helix/logs/session/*.jsonl",
  ".helix/logs/feedback-lifecycle.jsonl",
  ".helix/handover/provider/*.json",
  ".helix/evidence/run-debug/runtime-verification.jsonl",
  ".helix/evidence/pair-agent/*.json",
  ".helix/state/loop/*.iterations.jsonl",
  ".helix/config/model-opt-in.yaml",
] as const;
const EXCLUDED_RUNTIME_PROJECTION_STEPS = [
  "projectDriveRuns",
  "projectHookEvents",
  "projectRuntimeVerificationEvents",
  "projectPairAgentRunEvidence",
  "projectLoopIterations",
  "projectFeedbackLifecycle",
  "projectModelEvaluations",
] as const;

export function assertL3G3BootstrapPolicyContract(policy: BootstrapPolicy): void {
  if (policy.schema_version !== "helix-l3-g3-logical-db-bootstrap-policy.v2") {
    throw new Error("unsupported logical DB bootstrap policy schema_version");
  }
  if (canonicalJson(policy.canonical_json) !== canonicalJson(CANONICAL_JSON_CONTRACT)) {
    throw new Error("canonical_json does not match the executable digest contract");
  }
  if (policy.table_order !== "lexicographic_ascending") {
    throw new Error("table_order must be lexicographic_ascending");
  }
  if (policy.column_order !== "lexicographic_ascending") {
    throw new Error("column_order must be lexicographic_ascending");
  }
  if (canonicalJson(policy.row_order) !== canonicalJson(ROW_ORDER_CONTRACT)) {
    throw new Error("row_order does not match the executable row sorting contract");
  }
  if (policy.normalization_marker !== NORMALIZATION_MARKER) {
    throw new Error("normalization_marker does not match the executable normalization contract");
  }
  if (digestValue(policy.observation_columns) !== OBSERVATION_COLUMNS_DIGEST) {
    throw new Error("observation_columns does not match the reviewed exact-set digest");
  }
  if (policy.rebuild_count !== 2) {
    throw new Error("bootstrap policy must require exactly 2 rebuilds");
  }
  if (!policy.projection_input_policy.tracked_workspace_required) {
    throw new Error("bootstrap policy must require a tracked workspace");
  }
  if (policy.projection_input_policy.runtime_logs !== "exclude") {
    throw new Error("bootstrap policy must exclude runtime logs");
  }
  if (
    canonicalJson(policy.projection_input_policy.excluded_paths) !==
    canonicalJson(EXCLUDED_RUNTIME_LOG_PATHS)
  ) {
    throw new Error("excluded_paths does not match the executable runtime-log exclusion contract");
  }
  if (
    canonicalJson(policy.projection_input_policy.excluded_projection_steps) !==
    canonicalJson(EXCLUDED_RUNTIME_PROJECTION_STEPS)
  ) {
    throw new Error(
      "excluded_projection_steps does not match the executable runtime-log exclusion contract",
    );
  }
}

function normalizeBytes(value: unknown): unknown {
  if (value instanceof Uint8Array) return [...value];
  if (Array.isArray(value)) return value.map(normalizeBytes);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      normalizeBytes(item),
    ]),
  );
}

function digestValue(value: unknown): Digest {
  return digestBytes(canonicalJson(normalizeBytes(value)));
}

function digestBytes(value: string | Buffer): Digest {
  return sha256Digest(value);
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function workspaceAttestation(repoRoot: string) {
  const statusLines = git(repoRoot, ["status", "--porcelain=v1", "--untracked-files=all"])
    .split(/\r?\n/)
    .filter(Boolean);
  const disallowed = statusLines.filter((line) => {
    const path = line.slice(3).replace(/^"|"$/g, "");
    return path !== "node_modules" && !path.startsWith("node_modules/");
  });
  return {
    tracked_workspace_required: true,
    status_entry_count: disallowed.length,
    status_digest: digestValue(disallowed),
    clean: disallowed.length === 0,
  };
}

function columns(db: HarnessDb, table: string): string[] {
  assertSqlIdentifier(table);
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((row) => String(row.name))
    .sort();
}

function assertPolicySchema(db: HarnessDb, policy: BootstrapPolicy): void {
  const tables = new Set(tableNames(db));
  const assertLocator = (table: string, column: string, label: string) => {
    if (!tables.has(table)) throw new Error(`${label} references unknown table: ${table}`);
    if (!columns(db, table).includes(column)) {
      throw new Error(`${label} references unknown column: ${table}.${column}`);
    }
  };
  for (const locator of policy.observation_columns) {
    const separator = locator.indexOf(".");
    if (separator <= 0 || separator === locator.length - 1) {
      throw new Error(`invalid observation column locator: ${locator}`);
    }
    assertLocator(locator.slice(0, separator), locator.slice(separator + 1), "observation_columns");
  }
  for (const table of policy.checkpoint_tables) {
    if (!tables.has(table)) throw new Error(`checkpoint_tables references unknown table: ${table}`);
  }
  for (const rule of policy.stale_rules) {
    assertLocator(rule.table, rule.column, "stale_rules");
  }
  for (const rule of policy.orphan_rules) {
    assertLocator(rule.child_table, rule.child_column, "orphan_rules");
    assertLocator(rule.parent_table, rule.parent_column, "orphan_rules");
  }
}

function normalizedRows(input: {
  db: HarnessDb;
  table: string;
  names: string[];
  observationColumns: Set<string>;
  marker: string;
}): unknown[] {
  const { db, table, names, observationColumns, marker } = input;
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
        rows: normalizedRows({
          db,
          table,
          names,
          observationColumns,
          marker: policy.normalization_marker,
        }),
      };
    }),
  );
}

function rowCount(db: HarnessDb, table: string): number {
  assertSqlIdentifier(table);
  return Number(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n ?? 0);
}

function staleMetrics(db: HarnessDb, policy: BootstrapPolicy) {
  const rows = policy.stale_rules.map((rule) => {
    assertSqlIdentifier(rule.table);
    assertSqlIdentifier(rule.column);
    return {
      locator: `${rule.table}.${rule.column}`,
      row_count: rowCount(db, rule.table),
      minimum_rows: rule.minimum_rows,
      stale_count: Number(
        db
          .prepare(`SELECT COUNT(*) AS n FROM ${rule.table} WHERE ${rule.column} = ?`)
          .get(rule.stale_value)?.n ?? 0,
      ),
    };
  });
  return {
    rows,
    stale_count: rows.reduce((sum, row) => sum + row.stale_count, 0),
    population_valid: rows.every((row) => row.row_count >= row.minimum_rows),
  };
}

function orphanMetrics(db: HarnessDb, policy: BootstrapPolicy) {
  const rows = policy.orphan_rules.map((rule) => {
    for (const identifier of [
      rule.child_table,
      rule.child_column,
      rule.parent_table,
      rule.parent_column,
    ]) {
      assertSqlIdentifier(identifier);
    }
    return {
      edge: `${rule.child_table}.${rule.child_column}->${rule.parent_table}.${rule.parent_column}`,
      child_row_count: rowCount(db, rule.child_table),
      minimum_child_rows: rule.minimum_child_rows,
      orphan_count: Number(
        db
          .prepare(
            `SELECT COUNT(*) AS n
             FROM ${rule.child_table} child
             LEFT JOIN ${rule.parent_table} parent
               ON parent.${rule.parent_column} = child.${rule.child_column}
             WHERE child.${rule.child_column} IS NOT NULL
               AND parent.${rule.parent_column} IS NULL`,
          )
          .get()?.n ?? 0,
      ),
    };
  });
  return {
    rows,
    orphan_count: rows.reduce((sum, row) => sum + row.orphan_count, 0),
    population_valid: rows.every((row) => row.child_row_count >= row.minimum_child_rows),
  };
}

function databaseSnapshot(
  db: HarnessDb,
  policy: BootstrapPolicy,
  rebuildResult: ReturnType<typeof rebuildHarnessDb>,
) {
  assertPolicySchema(db, policy);
  const checkpointTables = [...policy.checkpoint_tables].sort();
  const checkpointTableSet = new Set(checkpointTables);
  const checkpointRowCounts = Object.fromEntries(
    checkpointTables.map((table) => [table, rowCount(db, table)]),
  );
  const stale = staleMetrics(db, policy);
  const orphan = orphanMetrics(db, policy);
  return {
    projection_digest: logicalDatabaseDigest(db, policy),
    checkpoint_digest: logicalDatabaseDigest(db, policy, (table) => checkpointTableSet.has(table)),
    checkpoint_tables: checkpointTables,
    checkpoint_row_counts: checkpointRowCounts,
    checkpoint_population_valid: Object.values(checkpointRowCounts).every((count) => count > 0),
    schema_revision: db.userVersion(),
    stale_rule_rows: stale.rows,
    stale_population_valid: stale.population_valid,
    stale_count: stale.stale_count,
    orphan_rule_rows: orphan.rows,
    orphan_population_valid: orphan.population_valid,
    orphan_count: orphan.orphan_count,
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

export function createL3G3LogicalDbReceipt(
  repoRoot = process.cwd(),
  deps: L3G3LogicalDbReceiptDeps = {},
) {
  const policyText = readFileSync(join(repoRoot, POLICY_PATH), "utf8");
  const policy = JSON.parse(policyText) as BootstrapPolicy;
  assertL3G3BootstrapPolicyContract(policy);
  for (const [label, values] of [
    ["observation_columns", policy.observation_columns],
    ["checkpoint_tables", policy.checkpoint_tables],
    ["excluded_paths", policy.projection_input_policy.excluded_paths],
    ["excluded_projection_steps", policy.projection_input_policy.excluded_projection_steps],
  ] as const) {
    if (values.length === 0) throw new Error(`${label} must not be empty`);
    if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicates`);
  }
  if (policy.stale_rules.length === 0 || policy.orphan_rules.length === 0) {
    throw new Error("stale_rules and orphan_rules must not be empty");
  }
  if (
    policy.stale_rules.some((rule) => rule.minimum_rows < 1) ||
    policy.orphan_rules.some((rule) => rule.minimum_child_rows < 1)
  ) {
    throw new Error("policy populations must require at least one row");
  }

  const sourceHead = git(repoRoot, ["rev-parse", "HEAD"]);
  const sourceTree = git(repoRoot, ["rev-parse", "HEAD^{tree}"]);
  const workspace = workspaceAttestation(repoRoot);
  const firstDb = openHarnessDb(":memory:");
  const replayDb = openHarnessDb(":memory:");
  try {
    const firstProjectionSteps: string[] = [];
    const replayProjectionSteps: string[] = [];
    const firstResult = rebuildHarnessDb({
      repoRoot,
      db: firstDb,
      runtimeLogPolicy: "exclude",
      onProfile: (entry) => firstProjectionSteps.push(entry.name),
    });
    deps.afterRebuild?.(firstDb, 1);
    const replayResult = rebuildHarnessDb({
      repoRoot,
      db: replayDb,
      runtimeLogPolicy: "exclude",
      onProfile: (entry) => replayProjectionSteps.push(entry.name),
    });
    deps.afterRebuild?.(replayDb, 2);
    const first = databaseSnapshot(firstDb, policy, firstResult);
    const replay = databaseSnapshot(replayDb, policy, replayResult);
    const unexpectedUnstableColumns = unstableColumns(firstDb, replayDb, policy);
    const body = {
      schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      policy_schema_version: policy.schema_version,
      canonicalization_contract: policy.canonical_json,
      table_order: policy.table_order,
      column_order: policy.column_order,
      row_order: policy.row_order,
      normalization_marker: policy.normalization_marker,
      observation_columns: policy.observation_columns,
      observation_columns_digest: digestValue(policy.observation_columns),
      source_head: sourceHead,
      source_tree: sourceTree,
      workspace_attestation: workspace,
      projection_input_mode: "tracked-authority-runtime-logs-excluded",
      excluded_projection_inputs: policy.projection_input_policy.excluded_paths,
      excluded_projection_steps: policy.projection_input_policy.excluded_projection_steps,
      executed_excluded_projection_steps: firstProjectionSteps.filter((step) =>
        policy.projection_input_policy.excluded_projection_steps.includes(step),
      ),
      replay_executed_excluded_projection_steps: replayProjectionSteps.filter((step) =>
        policy.projection_input_policy.excluded_projection_steps.includes(step),
      ),
      event_head_digest: digestValue({ source_head: sourceHead, source_tree: sourceTree }),
      policy_digest: digestBytes(policyText),
      verifier_digest: digestBytes(readFileSync(join(repoRoot, SCRIPT_PATH))),
      projection_digest: first.projection_digest,
      replay_projection_digest: replay.projection_digest,
      checkpoint_digest: first.checkpoint_digest,
      replay_checkpoint_digest: replay.checkpoint_digest,
      checkpoint_tables: first.checkpoint_tables,
      replay_checkpoint_tables: replay.checkpoint_tables,
      checkpoint_row_counts: first.checkpoint_row_counts,
      replay_checkpoint_row_counts: replay.checkpoint_row_counts,
      checkpoint_population_valid: first.checkpoint_population_valid,
      replay_checkpoint_population_valid: replay.checkpoint_population_valid,
      schema_revision: first.schema_revision,
      replay_schema_revision: replay.schema_revision,
      stale_count: first.stale_count,
      replay_stale_count: replay.stale_count,
      stale_rule_rows: first.stale_rule_rows,
      replay_stale_rule_rows: replay.stale_rule_rows,
      stale_population_valid: first.stale_population_valid,
      replay_stale_population_valid: replay.stale_population_valid,
      orphan_count: first.orphan_count,
      replay_orphan_count: replay.orphan_count,
      orphan_rule_rows: first.orphan_rule_rows,
      replay_orphan_rule_rows: replay.orphan_rule_rows,
      orphan_population_valid: first.orphan_population_valid,
      replay_orphan_population_valid: replay.orphan_population_valid,
      finding_count: first.finding_count,
      replay_finding_count: replay.finding_count,
      unexpected_unstable_columns: unexpectedUnstableColumns,
    };
    return {
      ...body,
      converged:
        workspace.clean &&
        body.executed_excluded_projection_steps.length === 0 &&
        body.replay_executed_excluded_projection_steps.length === 0 &&
        first.projection_digest === replay.projection_digest &&
        first.checkpoint_digest === replay.checkpoint_digest &&
        canonicalJson(first.checkpoint_tables) === canonicalJson(replay.checkpoint_tables) &&
        canonicalJson(first.checkpoint_row_counts) ===
          canonicalJson(replay.checkpoint_row_counts) &&
        first.checkpoint_population_valid &&
        replay.checkpoint_population_valid &&
        first.schema_revision === replay.schema_revision &&
        first.stale_population_valid &&
        replay.stale_population_valid &&
        first.stale_count === 0 &&
        replay.stale_count === 0 &&
        first.orphan_population_valid &&
        replay.orphan_population_valid &&
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

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const receipt = createL3G3LogicalDbReceipt(process.cwd());
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  if (!receipt.converged) process.exitCode = 1;
}
