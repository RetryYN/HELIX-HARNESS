import type { VisualizationViewModel } from "./visualization-view-model";

export interface VisualizationEvidenceSummary {
  schema_version: "visualization-evidence.v1";
  source_clock: string | null;
  root_ids: readonly ["project", "harness"];
  root_count: 2;
  node_count: number;
  warnings_count: number;
  evidence: unknown;
}

function countEvidenceNodes(value: unknown): number {
  if (value === null || typeof value !== "object") return 1;
  if (Array.isArray(value))
    return 1 + value.reduce((sum, entry) => sum + countEvidenceNodes(entry), 0);
  return (
    1 +
    Object.values(value as Record<string, unknown>).reduce(
      (sum: number, entry) => sum + countEvidenceNodes(entry),
      0,
    )
  );
}

/** PLAN-L7-450 / U-SBOUND-001: persistence evidenceをpresentation treeから独立投影する。 */
export function buildVisualizationEvidence(
  viewModel: VisualizationViewModel,
): VisualizationEvidenceSummary {
  const evidence = { project: viewModel.project, harness: viewModel.harness };
  return {
    schema_version: "visualization-evidence.v1",
    source_clock: viewModel.source_clock,
    root_ids: ["project", "harness"],
    root_count: 2,
    node_count: countEvidenceNodes(evidence),
    warnings_count: viewModel.shared_warnings.length,
    evidence,
  };
}
