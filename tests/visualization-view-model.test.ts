import { describe, expect, it } from "vitest";
import type { VisualizationSnapshot } from "../src/state-db/visualization-read-model";
import {
  buildGraphIr,
  buildVisualizationViewModel,
} from "../src/state-db/visualization-view-model";

function nonZeroSnapshot(): VisualizationSnapshot {
  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: "2026-07-01T00:00:00.000Z",
    progress: {
      artifacts: { total: 10, red: 2, yellow: 3, green: 5, unknown: 0 },
      plans: { total: 4, by_status: { confirmed: 3, draft: 1 } },
      gates: {
        total: 6,
        passed: 4,
        failed: 1,
        blocked: 1,
        other: 0,
        by_status: { passed: 4, failed: 1, blocked: 1 },
      },
    },
    graph: {
      nodes: 12,
      edges: 8,
      snapshots: 2,
      latest_snapshot_id: "snap-2",
      latest_snapshot_hash: "hash-2",
      latest_node_count: 12,
      latest_edge_count: 8,
    },
    evidence: {
      test_runs: { total: 20, passed: 18, failed: 2, other: 0 },
      runtime_verification: {
        total: 5,
        runtime_verified: 3,
        projection_only_unverified: 1,
        missing_runtime_provenance: 1,
        accepted: 3,
        blocked: 0,
        other: 2,
      },
      skill_invocations: { total: 7, accepted: 6 },
      model_runs: { total: 4 },
      guardrail_decisions: { total: 9, block: 1, allow: 7, human_required: 1 },
    },
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings: [],
  };
}

function emptySnapshot(): VisualizationSnapshot {
  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: null,
    progress: {
      artifacts: { total: 0, red: 0, yellow: 0, green: 0, unknown: 0 },
      plans: { total: 0, by_status: {} },
      gates: { total: 0, passed: 0, failed: 0, blocked: 0, other: 0, by_status: {} },
    },
    graph: {
      nodes: 0,
      edges: 0,
      snapshots: 0,
      latest_snapshot_id: null,
      latest_snapshot_hash: null,
      latest_node_count: null,
      latest_edge_count: null,
    },
    evidence: {
      test_runs: { total: 0, passed: 0, failed: 0, other: 0 },
      runtime_verification: {
        total: 0,
        runtime_verified: 0,
        projection_only_unverified: 0,
        missing_runtime_provenance: 0,
        accepted: 0,
        blocked: 0,
        other: 0,
      },
      skill_invocations: { total: 0, accepted: 0 },
      model_runs: { total: 0 },
      guardrail_decisions: { total: 0, block: 0, allow: 0, human_required: 0 },
    },
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings: ["artifact_progress is empty; run `helix db rebuild`"],
  };
}

describe("buildVisualizationViewModel", () => {
  it("U-VVM-001: returns 6 views + shared_warnings deterministically for a non-zero fixture snapshot", () => {
    const snapshot = nonZeroSnapshot();
    const first = buildVisualizationViewModel(snapshot);
    const second = buildVisualizationViewModel(nonZeroSnapshot());

    expect(first).toEqual(second);
    expect(first.project.layer_progress).toBeDefined();
    expect(first.project.design_test_pair).toBeDefined();
    expect(first.project.relation_graph).toBeDefined();
    expect(first.project.runtime_evidence).toBeDefined();
    expect(first.harness.harness_growth).toBeDefined();
    expect(first.harness.skill_agent_telemetry).toBeDefined();
    expect(Array.isArray(first.shared_warnings)).toBe(true);
    // input snapshot must remain untouched (no mutation side effect)
    expect(snapshot).toEqual(nonZeroSnapshot());
  });

  it("U-VVM-002: view counts match the corresponding snapshot fields", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    const artifactsTotalRow = vm.project.layer_progress.artifacts.find((r) => r.label === "total");
    expect(artifactsTotalRow?.value).toBe(snapshot.progress.artifacts.total);

    const gatesTotalRow = vm.project.layer_progress.gates.find((r) => r.label === "total");
    expect(gatesTotalRow?.value).toBe(snapshot.progress.gates.total);

    expect(vm.project.relation_graph.node_count).toBe(snapshot.graph.latest_node_count);
    expect(vm.project.relation_graph.edge_count).toBe(snapshot.graph.latest_edge_count);

    // §4 point 1: pair-filtered counts are not provided by the current
    // snapshot schema; must be null, not a fabricated 0 or total.
    expect(vm.project.design_test_pair.pair_edges).toBeNull();
    expect(vm.project.design_test_pair.orphan_nodes).toBeNull();
  });

  it("U-VVM-003: graph IR is deterministic, id-ordered, count-consistent, and marks cycle edges", () => {
    const nodes = [
      { id: "c", label: "C", group: "g" },
      { id: "a", label: "A", group: "g" },
      { id: "b", label: "B", group: "g" },
    ];
    const edges = [
      { from: "a", to: "b", kind: "dependency" },
      { from: "b", to: "c", kind: "dependency" },
      { from: "c", to: "a", kind: "dependency" },
    ];

    const first = buildGraphIr(nodes, edges);
    const second = buildGraphIr(nodes, edges);
    expect(first).toEqual(second);

    expect(first.nodes.map((n) => n.id)).toEqual(["a", "b", "c"]);
    expect(first.nodes.length).toBe(nodes.length);
    expect(first.edges.length).toBe(edges.length);
    expect(first.edges.every((e) => e.kind === "cycle")).toBe(true);

    const noCycle = buildGraphIr(nodes, [{ from: "a", to: "b", kind: "dependency" }]);
    expect(noCycle.edges[0]?.kind).toBe("dependency");

    // Relation view honestly degrades: raw lists unavailable in the current
    // snapshot schema, so its IR is empty and flagged via shared_warnings
    // rather than fabricated to match the declared counts.
    const vm = buildVisualizationViewModel(nonZeroSnapshot());
    expect(vm.project.relation_graph.graph).toEqual({ nodes: [], edges: [] });
    expect(
      vm.shared_warnings.some((w) => w.startsWith("relation_graph: raw node/edge lists")),
    ).toBe(true);
  });

  it("U-VVM-004: empty snapshot yields all-zero views plus shared empty-state banners, no fabricated data", () => {
    const snapshot = emptySnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    for (const r of vm.project.layer_progress.artifacts) expect(r.value).toBe(0);
    expect(vm.project.relation_graph.node_count).toBe(0);
    expect(vm.project.relation_graph.edge_count).toBe(0);
    for (const r of vm.project.runtime_evidence.test_runs) expect(r.value).toBe(0);
    for (const r of vm.harness.skill_agent_telemetry.skill_invocations) expect(r.value).toBe(0);

    // existing snapshot warning preserved, not overwritten
    expect(vm.shared_warnings).toContain("artifact_progress is empty; run `helix db rebuild`");
    // graph/evidence/skill empty-state banners appended to the shared banner
    expect(vm.shared_warnings.some((w) => w.startsWith("relation_graph has no recorded"))).toBe(
      true,
    );
    expect(vm.shared_warnings.some((w) => w.startsWith("runtime_evidence has no recorded"))).toBe(
      true,
    );
    expect(
      vm.shared_warnings.some((w) => w.startsWith("skill_agent_telemetry has no recorded")),
    ).toBe(true);
  });

  it("U-VVM-005: runtime evidence view separates runtime_verified / projection_only_unverified / missing_runtime_provenance from accepted", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);
    const rows = vm.project.runtime_evidence.runtime_verification;

    const find = (label: string) => rows.find((r) => r.label === label)?.value;
    expect(find("runtime_verified")).toBe(snapshot.evidence.runtime_verification.runtime_verified);
    expect(find("projection_only_unverified")).toBe(
      snapshot.evidence.runtime_verification.projection_only_unverified,
    );
    expect(find("missing_runtime_provenance")).toBe(
      snapshot.evidence.runtime_verification.missing_runtime_provenance,
    );
    expect(find("accepted")).toBe(snapshot.evidence.runtime_verification.accepted);
    // accepted must not silently absorb projection-only / missing-provenance rows
    expect(find("accepted")).not.toBe(snapshot.evidence.runtime_verification.total);
  });

  it("U-VVM-006: growth series is empty with a warning when snapshot has no history, and current values are reproducible from snapshot", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    expect(vm.harness.harness_growth.growth_series).toEqual([]);
    expect(
      vm.shared_warnings.some((w) => w.startsWith("harness_growth: historical growth series")),
    ).toBe(true);

    const currentTotal = vm.harness.harness_growth.current.find(
      (r) => r.label === "total" && r.value === snapshot.progress.artifacts.total,
    );
    expect(currentTotal).toBeDefined();
  });

  it("U-VVM-007: every drilldown is either a snapshot-defined pointer or explicitly null, never an absolute path", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);
    const knownPointers = new Set<string>(Object.values(snapshot.drilldowns));

    const allRows: Array<{ drilldown: { kind: string; pointer: string } | null }> = [
      ...vm.project.layer_progress.artifacts,
      ...vm.project.layer_progress.plans,
      ...vm.project.layer_progress.gates,
      ...vm.project.runtime_evidence.test_runs,
      ...vm.project.runtime_evidence.runtime_verification,
      ...vm.project.runtime_evidence.guardrail_decisions,
      ...vm.harness.skill_agent_telemetry.skill_invocations,
      ...vm.harness.skill_agent_telemetry.model_runs,
      ...vm.harness.harness_growth.current,
      { drilldown: vm.project.relation_graph.drilldown },
    ];

    for (const r of allRows) {
      if (r.drilldown === null) continue;
      expect(knownPointers.has(r.drilldown.pointer)).toBe(true);
      expect(r.drilldown.pointer.startsWith("/")).toBe(false);
    }
  });
});
