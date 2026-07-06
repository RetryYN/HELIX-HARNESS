import type { VisualizationSnapshot } from "./visualization-read-model";

/**
 * L6 view-model layer for the visualization surface (PLAN-L6-58 / PLAN-L7-372).
 *
 * `buildVisualizationViewModel` is a pure function: `VisualizationSnapshot` in,
 * `VisualizationViewModel` out. No DB access, no clock reads, no LLM-generated
 * prose in any authoritative field. All numeric fields are derived directly from
 * the input snapshot. Fields the current snapshot cannot honestly populate
 * (pair-filtered graph counts, raw node/edge lists, growth history) are
 * represented as `null` / empty with an explicit warning instead of a
 * fabricated value ("honest degrade").
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

export interface HarnessGrowthView {
  current: MetricRow[];
  growth_series: GrowthSeriesPoint[];
}

export interface SkillAgentTelemetryView {
  skill_invocations: MetricRow[];
  model_runs: MetricRow[];
}

export interface VisualizationViewModel {
  generated_from: "visualization-snapshot.v1";
  source_clock: string | null;
  project: {
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

const WARN_DESIGN_TEST_PAIR_UNAVAILABLE =
  "design_test_pair: pair-filtered edge/orphan counts are not available in the current snapshot; showing null instead of a fabricated count.";
const WARN_RELATION_GRAPH_RAW_LIST_UNAVAILABLE =
  "relation_graph: raw node/edge lists are not available in the current snapshot; showing aggregate counts only.";
const WARN_RELATION_GRAPH_EMPTY = "relation_graph has no recorded nodes, edges, or snapshots.";
const WARN_RUNTIME_EVIDENCE_EMPTY =
  "runtime_evidence has no recorded test runs, verification events, or guardrail decisions.";
const WARN_SKILL_AGENT_TELEMETRY_EMPTY =
  "skill_agent_telemetry has no recorded skill invocations or model runs.";
const WARN_HARNESS_GROWTH_SERIES_UNAVAILABLE =
  "harness_growth: historical growth series is not recorded in the current snapshot; showing current values only.";

function row(label: string, value: number, drilldown: Drilldown | null): MetricRow {
  return { label, value, drilldown };
}

/**
 * Builds a Mermaid-compatible graph IR (§3): nodes/edges normalized by id
 * ascending order for determinism, and cycle-participant edges marked with
 * `kind: "cycle"`. Pure and deterministic — no dependency on Map iteration
 * order, randomness, or wall-clock time.
 */
export function buildGraphIr(nodes: GraphIrNode[], edges: GraphIrEdgeInput[]): GraphIr {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...edges].sort((a, b) => {
    const byFrom = a.from.localeCompare(b.from);
    if (byFrom !== 0) return byFrom;
    const byTo = a.to.localeCompare(b.to);
    if (byTo !== 0) return byTo;
    return a.kind.localeCompare(b.kind);
  });

  const adjacency = new Map<string, string[]>();
  for (const edge of sortedEdges) {
    const existing = adjacency.get(edge.from) ?? [];
    existing.push(edge.to);
    adjacency.set(edge.from, existing);
  }

  function canReach(start: string, target: string): boolean {
    const visited = new Set<string>();
    const stack = [start];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      if (current === target) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const neighbors = adjacency.get(current) ?? [];
      for (const neighbor of neighbors) stack.push(neighbor);
    }
    return false;
  }

  const outEdges: GraphIrEdge[] = sortedEdges.map((edge) => {
    const participatesInCycle = edge.from !== edge.to && canReach(edge.to, edge.from);
    const selfLoop = edge.from === edge.to;
    return {
      from: edge.from,
      to: edge.to,
      kind: participatesInCycle || selfLoop ? "cycle" : edge.kind,
    };
  });

  return { nodes: sortedNodes, edges: outEdges };
}

function requireSnapshotSchema(snapshot: VisualizationSnapshot): void {
  if (snapshot.schema_version !== "visualization-snapshot.v1") {
    throw new Error(
      `buildVisualizationViewModel: unsupported snapshot schema_version "${String(
        (snapshot as { schema_version?: unknown }).schema_version,
      )}"; expected "visualization-snapshot.v1"`,
    );
  }
}

export function buildLayerProgressView(snapshot: VisualizationSnapshot): LayerProgressView {
  const artifactDrilldown: Drilldown = {
    kind: "cli",
    pointer: snapshot.drilldowns.artifact_progress_command,
  };
  const artifacts: MetricRow[] = [
    row("total", snapshot.progress.artifacts.total, artifactDrilldown),
    row("red", snapshot.progress.artifacts.red, artifactDrilldown),
    row("yellow", snapshot.progress.artifacts.yellow, artifactDrilldown),
    row("green", snapshot.progress.artifacts.green, artifactDrilldown),
    row("unknown", snapshot.progress.artifacts.unknown, artifactDrilldown),
  ];

  const planStatusRows: MetricRow[] = Object.entries(snapshot.progress.plans.by_status)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, value]) => row(status, value, null));
  const plans: MetricRow[] = [row("total", snapshot.progress.plans.total, null), ...planStatusRows];

  const gates: MetricRow[] = [
    row("total", snapshot.progress.gates.total, null),
    row("passed", snapshot.progress.gates.passed, null),
    row("failed", snapshot.progress.gates.failed, null),
    row("blocked", snapshot.progress.gates.blocked, null),
    row("other", snapshot.progress.gates.other, null),
  ];

  return { artifacts, plans, gates };
}

export function buildDesignTestPairView(_snapshot: VisualizationSnapshot): DesignTestPairView {
  return {
    pair_edges: null,
    orphan_nodes: null,
    graph: buildGraphIr([], []),
  };
}

export function buildRelationGraphView(snapshot: VisualizationSnapshot): RelationGraphView {
  const nodeCount = snapshot.graph.latest_node_count ?? snapshot.graph.nodes;
  const edgeCount = snapshot.graph.latest_edge_count ?? snapshot.graph.edges;
  return {
    node_count: nodeCount,
    edge_count: edgeCount,
    latest_snapshot_id: snapshot.graph.latest_snapshot_id,
    latest_snapshot_hash: snapshot.graph.latest_snapshot_hash,
    graph: buildGraphIr([], []),
    drilldown: { kind: "cli", pointer: snapshot.drilldowns.relation_graph_command },
  };
}

export function buildRuntimeEvidenceView(snapshot: VisualizationSnapshot): RuntimeEvidenceView {
  const testRuns: MetricRow[] = [
    row("total", snapshot.evidence.test_runs.total, null),
    row("passed", snapshot.evidence.test_runs.passed, null),
    row("failed", snapshot.evidence.test_runs.failed, null),
    row("other", snapshot.evidence.test_runs.other, null),
  ];

  const runtimeDrilldown: Drilldown = {
    kind: "table",
    pointer: snapshot.drilldowns.runtime_verification_table,
  };
  const runtimeVerification: MetricRow[] = [
    row("total", snapshot.evidence.runtime_verification.total, runtimeDrilldown),
    row(
      "runtime_verified",
      snapshot.evidence.runtime_verification.runtime_verified,
      runtimeDrilldown,
    ),
    row(
      "projection_only_unverified",
      snapshot.evidence.runtime_verification.projection_only_unverified,
      runtimeDrilldown,
    ),
    row(
      "missing_runtime_provenance",
      snapshot.evidence.runtime_verification.missing_runtime_provenance,
      runtimeDrilldown,
    ),
    row("accepted", snapshot.evidence.runtime_verification.accepted, runtimeDrilldown),
    row("blocked", snapshot.evidence.runtime_verification.blocked, runtimeDrilldown),
    row("other", snapshot.evidence.runtime_verification.other, runtimeDrilldown),
  ];

  const guardrailDecisions: MetricRow[] = [
    row("total", snapshot.evidence.guardrail_decisions.total, null),
    row("block", snapshot.evidence.guardrail_decisions.block, null),
    row("allow", snapshot.evidence.guardrail_decisions.allow, null),
    row("human_required", snapshot.evidence.guardrail_decisions.human_required, null),
  ];

  return {
    test_runs: testRuns,
    runtime_verification: runtimeVerification,
    guardrail_decisions: guardrailDecisions,
  };
}

export function buildSkillAgentTelemetryView(
  snapshot: VisualizationSnapshot,
): SkillAgentTelemetryView {
  return {
    skill_invocations: [
      row("total", snapshot.evidence.skill_invocations.total, null),
      row("accepted", snapshot.evidence.skill_invocations.accepted, null),
    ],
    model_runs: [row("total", snapshot.evidence.model_runs.total, null)],
  };
}

export function buildHarnessGrowthView(snapshot: VisualizationSnapshot): HarnessGrowthView {
  const layerProgress = buildLayerProgressView(snapshot);
  return {
    current: [...layerProgress.artifacts, ...layerProgress.plans, ...layerProgress.gates],
    // Current snapshot schema (visualization-snapshot.v1) holds no historical
    // series; interpolating one would fabricate growth data (HAC-VIS-07b), so
    // the series is honestly empty and flagged via shared_warnings instead.
    growth_series: [],
  };
}

function isGraphEmpty(snapshot: VisualizationSnapshot): boolean {
  return snapshot.graph.nodes === 0 && snapshot.graph.edges === 0 && snapshot.graph.snapshots === 0;
}

function isRuntimeEvidenceEmpty(snapshot: VisualizationSnapshot): boolean {
  return (
    snapshot.evidence.test_runs.total === 0 &&
    snapshot.evidence.runtime_verification.total === 0 &&
    snapshot.evidence.guardrail_decisions.total === 0
  );
}

function isSkillAgentTelemetryEmpty(snapshot: VisualizationSnapshot): boolean {
  return (
    snapshot.evidence.skill_invocations.total === 0 && snapshot.evidence.model_runs.total === 0
  );
}

function buildSharedWarnings(snapshot: VisualizationSnapshot): string[] {
  const warnings: string[] = [...snapshot.warnings];
  warnings.push(WARN_DESIGN_TEST_PAIR_UNAVAILABLE);
  warnings.push(WARN_RELATION_GRAPH_RAW_LIST_UNAVAILABLE);
  if (isGraphEmpty(snapshot)) warnings.push(WARN_RELATION_GRAPH_EMPTY);
  if (isRuntimeEvidenceEmpty(snapshot)) warnings.push(WARN_RUNTIME_EVIDENCE_EMPTY);
  if (isSkillAgentTelemetryEmpty(snapshot)) warnings.push(WARN_SKILL_AGENT_TELEMETRY_EMPTY);
  warnings.push(WARN_HARNESS_GROWTH_SERIES_UNAVAILABLE);
  return warnings;
}

export function buildVisualizationViewModel(
  snapshot: VisualizationSnapshot,
): VisualizationViewModel {
  requireSnapshotSchema(snapshot);

  return {
    generated_from: snapshot.schema_version,
    source_clock: snapshot.source_clock,
    project: {
      layer_progress: buildLayerProgressView(snapshot),
      design_test_pair: buildDesignTestPairView(snapshot),
      relation_graph: buildRelationGraphView(snapshot),
      runtime_evidence: buildRuntimeEvidenceView(snapshot),
    },
    harness: {
      harness_growth: buildHarnessGrowthView(snapshot),
      skill_agent_telemetry: buildSkillAgentTelemetryView(snapshot),
    },
    shared_warnings: buildSharedWarnings(snapshot),
  };
}
