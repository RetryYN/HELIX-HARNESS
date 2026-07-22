import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { rebuildHarnessDb } from "../composition/db-rebuild-composition";
import { assertSqlIdentifier } from "../schema/harness-db";
import { type HarnessDb, openHarnessDb } from "../state-db";
import { tableNames } from "../state-db/migration";
import {
  buildContextualPrReviewPacket,
  buildPrDatabaseConvergenceProbe,
  type ContextualPrReviewPacketInputV1,
  type MergeAdmissionResultV1,
  type PrDatabaseConvergenceObservationV1,
  type PrDatabaseConvergenceProbeV1,
  type ReviewContextMaterialV1,
} from "./pr-merge-admission";

type Digest = `sha256:${string}`;

const REBUILD_OBSERVATION_COLUMNS = new Set([
  "artifact_progress.dependency_checked_at",
  "artifact_progress.indexed_at",
  "artifact_progress_events.occurred_at",
  "artifact_registry.updated_at",
  "automation_assets.indexed_at",
  "descent_obligations.indexed_at",
  "dependency_edges.indexed_at",
  "design_coverage_gate.indexed_at",
  "diagram_artifacts.created_at",
  "design_declarations.indexed_at",
  "design_impact.indexed_at",
  "design_references.indexed_at",
  "feedback_events.created_at",
  "feedback_lifecycle_health.projected_at",
  "graph_nodes.indexed_at",
  "graph_snapshots.created_at",
  "gate_runs.checked_at",
  "guardrail_decisions.decided_at",
  "improvement_log.created_at",
  "issue_queue.created_at",
  "mcp_server_profiles.indexed_at",
  "poc_evaluations.evaluated_at",
  "project_artifact_remap.indexed_at",
  "project_current_location.indexed_at",
  "project_current_location.snapshot_hash",
  "project_current_location.source_clock",
  "project_drive_model_candidates.indexed_at",
  "project_l12_layer_coverage.indexed_at",
  "project_operation_scopes.indexed_at",
  "project_roadmap_current_actions.indexed_at",
  "project_tailoring_decisions.indexed_at",
  "project_vmodel_fit_blockers.indexed_at",
  "project_vmodel_handoff_summary.indexed_at",
  "project_vmodel_regression_guards.indexed_at",
  "project_zip_adoption_decisions.indexed_at",
  "quality_signals.computed_at",
  "review_evidence_registry.indexed_at",
  "roadmap_band_coverage.computed_at",
  "roadmap_gate_progress.computed_at",
  "roadmap_rollups.computed_at",
  "search_index.updated_at",
  "skill_evaluations.evaluated_at",
  "skill_invocations.fired_at",
  "skill_recommendations.recommended_at",
  "test_cases.first_seen_at",
  "test_cases.last_seen_at",
  "trouble_events.created_at",
  "visualization_tree_view.indexed_at",
  "visualization_tree_view.snapshot_hash",
  "visualization_tree_view.source_clock",
  "visualization_view_model.indexed_at",
  "visualization_view_model.snapshot_hash",
  "visualization_view_model.source_clock",
  "vmodel_zip_manifest.indexed_at",
  "vmodel_zip_source_bindings.indexed_at",
  "workflow_runs.checked_at",
]);
const CHECKPOINT_TABLE = /checkpoint|health|continuation/;

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

function digest(value: unknown): Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function contentDigest(value: string | Buffer): Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function git(repoRoot: string, args: readonly string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function trackedContent(repoRoot: string, path: string): string {
  return execFileSync("git", ["-C", repoRoot, "show", `HEAD:${path}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

const CONTEXT_PATHS = {
  authority_l0: ["docs/design/helix/L0-charter/helix-charter_v0.1.md"],
  prototype_l2: ["docs/design/helix/L2-screen/screen-mock-boundary.md"],
  requirements_l3: [
    "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
  ],
  basic_design_l4: ["docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"],
  issue_plan: ["docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md"],
  trace_consumers: [
    "docs/design/helix/L5-detail/github-pr-audit-promotion.md",
    "docs/design/helix/L6-function-design/github-pr-audit-promotion.md",
    "docs/test-design/helix/L5-github-pr-audit-promotion-integration-test-design.md",
    "docs/test-design/helix/L6-github-pr-audit-promotion-unit-test-design.md",
  ],
  security_blast_radius: [
    "docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md",
    "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
  ],
} as const;

function trackedBundleDigest(repoRoot: string, paths: readonly string[]): Digest {
  return digest(
    paths.map((path) => ({ path, content_digest: contentDigest(trackedContent(repoRoot, path)) })),
  );
}

export interface CollectContextualPrReviewPacketInputV1 {
  repoRoot: string;
  repositoryId: string;
  prNumber: number;
  baseRef: string;
  authorIdentity: string;
  authorSessionId: string;
  workerContextDigest: Digest;
}

export function collectContextualPrReviewPacket(
  input: CollectContextualPrReviewPacketInputV1,
): ReturnType<typeof buildContextualPrReviewPacket> {
  const headSha = git(input.repoRoot, ["rev-parse", "HEAD"]);
  const baseSha = git(input.repoRoot, ["rev-parse", input.baseRef]);
  const tree = git(input.repoRoot, ["rev-parse", "HEAD^{tree}"]);
  const authorityDigest = trackedBundleDigest(input.repoRoot, CONTEXT_PATHS.authority_l0);
  const materials: ReviewContextMaterialV1[] = Object.entries(CONTEXT_PATHS).map(
    ([kind, paths]) => ({
      kind: kind as keyof typeof CONTEXT_PATHS,
      locator: paths.join(","),
      content_digest: trackedBundleDigest(input.repoRoot, paths),
      decision: "required",
      authority_digest: authorityDigest,
    }),
  );
  const diff = execFileSync("git", [
    "-C",
    input.repoRoot,
    "diff",
    "--binary",
    `${baseSha}...${headSha}`,
  ]);
  materials.push({
    kind: "diff",
    locator: `git:diff:${baseSha}...${headSha}`,
    content_digest: contentDigest(diff),
    decision: "required",
    authority_digest: authorityDigest,
  });
  const packetInput: ContextualPrReviewPacketInputV1 = {
    repository_id: input.repositoryId,
    pr_number: input.prNumber,
    head_sha: headSha,
    head_tree_digest: contentDigest(tree),
    base_sha: baseSha,
    policy_digest: authorityDigest,
    author_identity: input.authorIdentity,
    author_session_id: input.authorSessionId,
    worker_context_digest: input.workerContextDigest,
    materials,
  };
  return buildContextualPrReviewPacket(packetInput);
}

export interface CollectPrDatabaseConvergenceProbeInputV1 {
  repoRoot: string;
  repositoryId: string;
  prNumber: number;
  expectedSchemaRevision: number;
}

export function collectPrDatabaseConvergenceProbe(
  input: CollectPrDatabaseConvergenceProbeInputV1,
): MergeAdmissionResultV1<PrDatabaseConvergenceProbeV1> {
  const headSha = git(input.repoRoot, ["rev-parse", "HEAD"]);
  const tree = git(input.repoRoot, ["rev-parse", "HEAD^{tree}"]);
  return buildPrDatabaseConvergenceProbe({
    repository_id: input.repositoryId,
    pr_number: input.prNumber,
    head_sha: headSha,
    event_head_digest: digest({ head_sha: headSha, tree }),
    checkpoint_locator_digest: digest({
      source: "tracked-head",
      checkpoint_tables: ["feedback_lifecycle_health", "continuation_projection"],
    }),
    expected_schema_revision: input.expectedSchemaRevision,
    rebuild_policy_digest: digest({
      implementation: "rebuildHarnessDb",
      database: "independent-in-memory-pair",
      logical_digest: "all-tables-all-rows-v1",
    }),
  });
}

function columns(db: HarnessDb, table: string): string[] {
  assertSqlIdentifier(table);
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((row) => String(row.name))
    .sort();
}

function normalizedRows(db: HarnessDb, table: string, names: readonly string[]): unknown[] {
  assertSqlIdentifier(table);
  for (const name of names) assertSqlIdentifier(name);
  if (names.length === 0) return [];
  const stableNames = names.filter((name) => !REBUILD_OBSERVATION_COLUMNS.has(`${table}.${name}`));
  const orderNames = stableNames.length > 0 ? stableNames : names;
  return db
    .prepare(`SELECT * FROM ${table} ORDER BY ${orderNames.join(", ")}`)
    .all()
    .map((row) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          REBUILD_OBSERVATION_COLUMNS.has(`${table}.${name}`) ? "<rebuild-observation>" : row[name],
        ]),
      ),
    );
}

export function logicalDatabaseDigest(
  db: HarnessDb,
  includeTable: (table: string) => boolean = () => true,
): Digest {
  const tables = tableNames(db).filter(includeTable).sort();
  return digest(
    tables.map((table) => {
      const names = columns(db, table);
      return { table, columns: names, rows: normalizedRows(db, table, names) };
    }),
  );
}

function staleCount(db: HarnessDb): number {
  let count = 0;
  for (const table of tableNames(db)) {
    const names = columns(db, table);
    if (!names.includes("status")) continue;
    assertSqlIdentifier(table);
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE status = ?`).get("stale");
    count += Number(row?.n ?? 0);
  }
  return count;
}

function orphanCount(db: HarnessDb): number {
  return db.prepare("PRAGMA foreign_key_check").all().length;
}

export interface ObservePrDatabaseConvergenceInputV1 {
  repoRoot: string;
  sourceHead: string;
  eventHeadDigest: Digest;
}

interface RebuildSnapshot {
  projectionDigest: Digest;
  checkpointDigest: Digest;
  schemaRevision: number;
  staleCount: number;
  orphanCount: number;
  findingCount: number;
}

function rebuildSnapshot(repoRoot: string): RebuildSnapshot {
  const db = openHarnessDb(":memory:");
  try {
    const result = rebuildHarnessDb({ repoRoot, db });
    return {
      projectionDigest: logicalDatabaseDigest(db),
      checkpointDigest: logicalDatabaseDigest(db, (table) => CHECKPOINT_TABLE.test(table)),
      schemaRevision: db.userVersion(),
      staleCount: staleCount(db),
      orphanCount: orphanCount(db),
      findingCount: result.findings.length + (result.ok ? 0 : 1),
    };
  } finally {
    db.close();
  }
}

export function observePrDatabaseConvergence(
  input: ObservePrDatabaseConvergenceInputV1,
): PrDatabaseConvergenceObservationV1 {
  const first = rebuildSnapshot(input.repoRoot);
  const replay = rebuildSnapshot(input.repoRoot);
  const body = {
    schema_version: "helix-pr-db-convergence-observation.v1" as const,
    source_head: input.sourceHead,
    event_head_digest: input.eventHeadDigest,
    projection_digest: first.projectionDigest,
    replay_projection_digest: replay.projectionDigest,
    checkpoint_digest: first.checkpointDigest,
    replay_checkpoint_digest: replay.checkpointDigest,
    schema_revision: first.schemaRevision,
    stale_count: first.staleCount + replay.staleCount,
    orphan_count: first.orphanCount + replay.orphanCount,
    rebuild_finding_count: first.findingCount + replay.findingCount,
  };
  if (first.schemaRevision !== replay.schemaRevision) body.rebuild_finding_count += 1;
  return { ...body, observation_digest: digest(body) };
}
