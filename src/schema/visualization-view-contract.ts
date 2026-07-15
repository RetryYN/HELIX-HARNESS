import type {
  DesignTestPairView,
  HarnessGrowthView,
  LayerProgressView,
  RelationGraphView,
  RuntimeEvidenceView,
  SkillAgentTelemetryView,
  VisualizationRootBoundary,
} from "./visualization-contract";
import type { ProjectCurrentLocationView } from "./visualization-current-location-contract";

/** Aggregate adapter-neutral visualization contract. */
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
