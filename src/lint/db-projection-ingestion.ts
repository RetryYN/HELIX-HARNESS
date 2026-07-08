import { VMODEL_ZIP_FILENAME } from "../vmodel/zip-manifest";

export interface DbProjectionIngestionRequirement {
  table: string;
  reason: string;
}

export interface DbProjectionIngestionResult {
  checked: number;
  missingRows: DbProjectionIngestionRequirement[];
  optionalEvidenceTables: string[];
  rowCounts: Record<string, number>;
  ok: boolean;
}

export const AUTOMATIC_DB_PROJECTION_REQUIREMENTS: DbProjectionIngestionRequirement[] = [
  {
    table: "graph_nodes",
    reason: "relation graph nodes are derived from repo docs/src/test inputs",
  },
  { table: "dependency_edges", reason: "relation graph edges are derived from trace links" },
  { table: "trace_edges", reason: "trace edges are derived from relation graph edges" },
  { table: "graph_snapshots", reason: "graph snapshot is derived from the relation graph" },
  {
    table: "diagram_artifacts",
    reason: "standard relation graph diagram artifacts are derived from graph snapshots",
  },
  { table: "impact_rules", reason: "impact rules are built-in workflow policy" },
  { table: "verification_profiles", reason: "verification profile catalog is built-in" },
  {
    table: "mcp_server_profiles",
    reason: "MCP profile catalog is derived from verification profiles",
  },
  {
    table: "mcp_profile_triggers",
    reason: "MCP triggers are derived from profile trigger signals",
  },
  { table: "document_export_profiles", reason: "document export profile catalog is built-in" },
  { table: "document_export_triggers", reason: "document export triggers are built-in" },
  { table: "document_export_runs", reason: "canonical document dataset run is derived from docs" },
  { table: "document_export_datasets", reason: "canonical document dataset is derived from docs" },
  {
    table: "design_declarations",
    reason: "typed design declarations are derived from spec.defines in design docs",
  },
  {
    table: "design_references",
    reason: "typed design references are derived from spec.refs/spec.traces in design docs",
  },
  {
    table: "design_impact",
    reason: "typed design impact is derived from design references in both directions",
  },
  { table: "test_cases", reason: "test case catalog is derived from tests/**/*.test.ts" },
  { table: "test_artifact_edges", reason: "test artifact edges are derived from test imports" },
  {
    table: "artifact_progress",
    reason: "artifact progress colors are derived from relation graph, tests, and impact results",
  },
  {
    table: "project_current_location",
    reason:
      "L12 current location is derived from roadmap, design declarations, and evidence tables",
  },
  {
    table: "project_drive_model_candidates",
    reason: "drive model candidates are derived from the current-location read model",
  },
  {
    table: "project_roadmap_current_actions",
    reason: "roadmap current actions are derived from roadmap position and drive-route decisions",
  },
  {
    table: "project_zip_adoption_decisions",
    reason: "ZIP adoption/complement/reject decisions are derived from typed design declarations",
  },
  {
    table: "project_tailoring_decisions",
    reason:
      "solo tailoring required/optional/na decisions are derived from typed design declarations",
  },
  {
    table: "project_vmodel_regression_guards",
    reason: "V-model regression guards are derived from the V-model fit read model",
  },
  {
    table: "project_vmodel_fit_blockers",
    reason: "V-model fit blockers are derived from the V-model fit read model",
  },
  {
    table: "project_vmodel_handoff_summary",
    reason: "V-model recovery handoff approval state is derived from the Project view model",
  },
  {
    table: "project_l12_layer_coverage",
    reason: "L12 layer coverage is derived from remapped plans, design docs, and test design docs",
  },
  {
    table: "design_coverage_gate",
    reason: "L12 design coverage gate rows are derived from typed design declarations",
  },
  {
    table: "project_operation_scopes",
    reason: "operation scope rows are derived from L12 declarations and runtime evidence",
  },
  {
    table: "project_artifact_remap",
    reason: "legacy L0-L14 artifacts are remapped into L12 coverage buckets",
  },
  {
    table: "vmodel_zip_manifest",
    reason: `${VMODEL_ZIP_FILENAME} manifest is inspected during DB rebuild`,
  },
  {
    table: "vmodel_zip_source_bindings",
    reason: `${VMODEL_ZIP_FILENAME} source bindings are projected for L12/database coverage checks`,
  },
  {
    table: "visualization_view_model",
    reason: "Project/HARNESS visualization view model is derived from the DB snapshot",
  },
  {
    table: "visualization_tree_view",
    reason: "VSCode tree-view read model is derived from the visualization view model",
  },
];

export const EVIDENCE_GATED_DB_PROJECTION_TABLES = [
  "test_runs",
  "test_results",
  "test_flake_events",
  "impact_results",
  "tool_runs",
  "verification_recommendations",
  "mcp_server_runs",
  "external_tool_findings",
  "document_export_artifacts",
  "model_evaluations",
  "retry_events",
  // loop 実行が無い repo では 0 行が正常 (loop run 実行時のみ jsonl 証跡から投影される)。
  "loop_iterations",
];

export function analyzeDbProjectionIngestion(
  rowCounts: Record<string, number>,
  requirements: DbProjectionIngestionRequirement[] = AUTOMATIC_DB_PROJECTION_REQUIREMENTS,
): DbProjectionIngestionResult {
  const missingRows = requirements.filter(
    (requirement) => (rowCounts[requirement.table] ?? 0) <= 0,
  );
  return {
    checked: requirements.length,
    missingRows,
    optionalEvidenceTables: EVIDENCE_GATED_DB_PROJECTION_TABLES.filter(
      (table) => (rowCounts[table] ?? 0) <= 0,
    ),
    rowCounts,
    ok: requirements.length > 0 && missingRows.length === 0,
  };
}

export function dbProjectionIngestionMessages(result: DbProjectionIngestionResult): string[] {
  if (result.ok) {
    return [
      `db-projection-ingestion - OK (${result.checked} automatic projection tables populated; evidence-gated zero tables: ${result.optionalEvidenceTables.length})`,
    ];
  }
  const messages = ["db-projection-ingestion - violation"];
  for (const item of result.missingRows) {
    messages.push(`empty automatic projection table ${item.table}: ${item.reason}`);
  }
  return messages;
}
