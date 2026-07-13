import type { ProjectCurrentLocationView } from "./visualization-current-location-contract";

/**
 * Adapter-neutral DTO primitives for visualization projections.
 * Builders and adapters may extend these values but must not add I/O ownership here.
 */
export type DrilldownKind = "cli" | "table" | "docs";

export interface Drilldown {
  kind: DrilldownKind;
  pointer: string;
}

export interface MetricRow {
  label: string;
  value: number;
  drilldown: Drilldown | null;
}

export interface GraphIrNode {
  id: string;
  label: string;
  group: string;
}

export interface GraphIrEdgeInput {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIrEdge {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIr {
  nodes: GraphIrNode[];
  edges: GraphIrEdge[];
}

export interface ClosureReviewScopeView {
  approval_scope_digest: string;
  plan_ids: string[];
  source_paths: string[];
  coverage_ids: string[];
  l12_layers: string[];
  evidence_totals: {
    artifact_paths: number;
    evidence_paths: number;
    trace_edges: number;
    test_runs_total: number;
    test_runs_passed: number;
    gate_runs_total: number;
    gate_runs_passed: number;
    runtime_verification_total: number;
    runtime_verification_accepted: number;
  };
  blocked_by_findings: string[];
}

export interface ClosureReviewWindowView {
  page_index: number;
  page_count: number;
  current: boolean;
  offset: number;
  limit: number;
  start: number;
  end: number;
  listed: number;
  omitted_before: number;
  omitted_after: number;
  approval_scope_digest: string;
  review_scope: ClosureReviewScopeView;
  review_window_command: string;
  transition_window_command: string;
  decision_draft_command: string;
  decision_draft_record_command: string;
  decision_record_default_path: string;
}

export interface LayerProgressView {
  artifacts: MetricRow[];
  plans: MetricRow[];
  gates: MetricRow[];
}

export interface DesignTestPairView {
  pair_edges: number | null;
  orphan_nodes: number | null;
  graph: GraphIr;
}

export interface RelationGraphView {
  node_count: number;
  edge_count: number;
  latest_snapshot_id: string | null;
  latest_snapshot_hash: string | null;
  graph: GraphIr;
  drilldown: Drilldown | null;
}

export interface RuntimeEvidenceView {
  test_runs: MetricRow[];
  runtime_verification: MetricRow[];
  guardrail_decisions: MetricRow[];
}

export interface GrowthSeriesPoint {
  at: string;
  class: string;
  value: number;
  recorded: boolean;
}

export interface HarnessGrowthCurrentSections {
  artifacts: MetricRow[];
  plans: MetricRow[];
  gates: MetricRow[];
}

export interface HarnessGrowthView {
  current_sections: HarnessGrowthCurrentSections;
  current: MetricRow[];
  growth_series: GrowthSeriesPoint[];
}

export interface SkillAgentTelemetryView {
  skill_invocations: MetricRow[];
  model_runs: MetricRow[];
}

export interface VisualizationRootBoundary {
  root: "project" | "harness";
  label: string;
  scope: string;
  owned_views: string[];
  source_fields: string[];
  excluded_fields: string[];
  view_command: "helix progress tree-view --json";
}

export interface VisualizationContract {
  generated_from: "visualization-snapshot.v1";
  source_clock: string | null;
  view_boundaries: {
    project: VisualizationRootBoundary;
    harness: VisualizationRootBoundary;
  };
  project: {
    current_location: ProjectCurrentLocationView;
    layer_progress: LayerProgressView;
    design_test_pair: DesignTestPairView;
    relation_graph: RelationGraphView;
    runtime_evidence: RuntimeEvidenceView;
  };
  harness: {
    harness_growth: HarnessGrowthView;
    skill_agent_telemetry: SkillAgentTelemetryView;
  };
  shared_warnings: string[];
}
