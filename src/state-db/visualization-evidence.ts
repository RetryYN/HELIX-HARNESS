export interface VisualizationTreeSummary {
  schema_version: string;
  source_clock: string | null;
  root_ids: string[];
  root_count: number;
  node_count: number;
  warnings_count: number;
  snapshot_hash: string;
}

export interface VisualizationTreeEvidenceRow
  extends Omit<VisualizationTreeSummary, "source_clock" | "root_ids">,
    Record<string, unknown> {
  tree_view_id: "visualization-tree-view:latest";
  source_clock: string;
  root_ids: string;
  indexed_at: string;
}

/** L6 `projectVisualizationEvidence`: summaryだけから永続rowを決定論的に作る。 */
export function projectVisualizationEvidence(
  summary: VisualizationTreeSummary,
  indexedAt: string,
): VisualizationTreeEvidenceRow {
  return {
    tree_view_id: "visualization-tree-view:latest",
    schema_version: summary.schema_version,
    source_clock: summary.source_clock ?? "",
    root_ids: [...summary.root_ids].sort().join(","),
    root_count: summary.root_count,
    node_count: summary.node_count,
    warnings_count: summary.warnings_count,
    snapshot_hash: summary.snapshot_hash,
    indexed_at: indexedAt,
  };
}
