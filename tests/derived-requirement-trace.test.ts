import { describe, expect, it } from "vitest";
import {
  compileDerivedRequirementTrace,
  DERIVED_SYSTEM_KINDS,
  validateDerivedRequirementTrace,
} from "../src/workflow/derived-requirement-trace";
import {
  RUNTIME_ORCHESTRATION_SCHEMA_VERSION,
  UNIVERSAL_WORKFLOW_ENVELOPE_VERSION,
  UNIVERSAL_WORKFLOW_SCHEMA_VERSION,
} from "../src/workflow/universal-workflow-envelope";

// PLAN-L7-559-derived-requirement-trace / UWJ-AC-005 / UWJ-AC-008 / UWJ-AC-016
const DIGEST = `sha256:${"a".repeat(64)}`;

function envelope(): Record<string, unknown> {
  return {
    schema_version: UNIVERSAL_WORKFLOW_ENVELOPE_VERSION,
    source: { source_id: "source:order", revision: "r1", digest: DIGEST },
    workflow_model: {
      schema_version: UNIVERSAL_WORKFLOW_SCHEMA_VERSION,
      workflow_id: "workflow:order",
      revision: "r1",
      source_digest: DIGEST,
      atoms: [
        { atom_id: "target:order", kind: "target", value: "注文を完了する" },
        { atom_id: "actor:buyer", kind: "actor", actor_id: "buyer", responsibility: "注文者" },
        { atom_id: "state:draft", kind: "state", state_id: "draft", name: "下書き" },
        { atom_id: "state:done", kind: "state", state_id: "done", name: "完了" },
        { atom_id: "trigger:submit", kind: "trigger", trigger_id: "submit", event: "送信" },
        {
          atom_id: "data:amount",
          kind: "data",
          data_id: "amount",
          data_type: "integer",
          required: true,
          validation: "1以上",
          nullable: false,
          ssot: "order",
          mutable: false,
          sensitive: false,
          retention: "7年",
        },
        {
          atom_id: "condition:valid",
          kind: "condition",
          condition_id: "valid",
          expression: "amount > 0",
          data_ids: ["amount"],
        },
        {
          atom_id: "condition:retry",
          kind: "condition",
          condition_id: "retry",
          expression: "attempt < 3",
          data_ids: ["amount"],
        },
        {
          atom_id: "condition:stop",
          kind: "condition",
          condition_id: "stop",
          expression: "attempt >= 3",
          data_ids: ["amount"],
        },
        {
          atom_id: "action:commit",
          kind: "action",
          action_id: "commit",
          operation: "注文を確定する",
        },
        {
          atom_id: "transition:submit",
          kind: "transition",
          transition_id: "submit-order",
          current_state_id: "draft",
          trigger_id: "submit",
          condition_ids: ["valid"],
          action_ids: ["commit"],
          next_state_id: "done",
        },
        {
          atom_id: "loop:retry",
          kind: "loop",
          loop_id: "retry",
          return_state_id: "draft",
          continue_condition_id: "retry",
          stop_condition_id: "stop",
          max_iterations: 3,
          on_limit: "dead_letter",
        },
        {
          atom_id: "notification:done",
          kind: "notification",
          notification_id: "done-note",
          event: "注文完了",
          recipient_actor_ids: ["buyer"],
        },
        {
          atom_id: "audit:done",
          kind: "audit",
          audit_id: "done-audit",
          event: "注文完了",
          retained_for: "7年",
        },
        {
          atom_id: "terminal:done",
          kind: "terminal",
          terminal_id: "done",
          terminal_kind: "normal",
          state_id: "done",
          post_updates: [],
          notification_ids: ["done-note"],
          audit_ids: ["done-audit"],
          restartable: false,
        },
        {
          atom_id: "exception:commit",
          kind: "exception",
          exception_id: "commit-failed",
          source_transition_id: "submit-order",
          recovery_state_id: "draft",
        },
        {
          atom_id: "permission:commit",
          kind: "permission",
          permission_id: "commit-order",
          actor_id: "buyer",
          action_ids: ["commit"],
        },
        {
          atom_id: "timeout:submit",
          kind: "timeout",
          timeout_id: "submit-timeout",
          transition_id: "submit-order",
          duration_ms: 30000,
          on_timeout_state_id: "draft",
        },
      ],
    },
    unresolved_items: [],
    derived_requirements: [],
    coverage_report: {
      required_atom_kinds: [
        "target",
        "actor",
        "state",
        "trigger",
        "condition",
        "action",
        "transition",
        "loop",
        "terminal",
        "exception",
        "permission",
        "timeout",
        "notification",
        "audit",
        "data",
      ],
      covered_atom_kinds: [
        "target",
        "actor",
        "state",
        "trigger",
        "condition",
        "action",
        "transition",
        "loop",
        "terminal",
        "exception",
        "permission",
        "timeout",
        "notification",
        "audit",
        "data",
      ],
      missing_atom_kinds: [],
    },
    contract_candidates: [],
    runtime_orchestration: {
      schema_version: RUNTIME_ORCHESTRATION_SCHEMA_VERSION,
      source_digest: DIGEST,
      execution_id: "execution:order",
      capability_constraints: ["order-write"],
      capacity_limit: 10,
      concurrency_limit: 2,
      fallback: "manual",
      dead_letter: "dead",
    },
  };
}

function envelopeWithSecondTransition(): Record<string, unknown> {
  const input = envelope();
  const model = input.workflow_model as { atoms: Record<string, unknown>[] };
  model.atoms.push({
    atom_id: "transition:retry",
    kind: "transition",
    transition_id: "retry-order",
    current_state_id: "draft",
    trigger_id: "submit",
    condition_ids: ["retry"],
    action_ids: ["commit"],
    next_state_id: "done",
  });
  return input;
}

function compiledGraph(input: Record<string, unknown> = envelope()) {
  const graph = compileDerivedRequirementTrace(input).graph;
  expect(graph).not.toBeNull();
  if (!graph) throw new Error("fixture compile failed");
  return graph;
}

describe("derived requirement trace compiler", () => {
  it("U-DTRACE-001: [PLAN-L7-559-derived-requirement-trace/U-DTRACE-001] transitionごとにFR/AC/testと双方向traceを生成する", () => {
    const result = compileDerivedRequirementTrace(envelope());
    expect(result.ok).toBe(true);
    expect(result.graph?.requirements.map((item) => item.requirement_kind).sort()).toEqual([
      "acceptance_criterion",
      "functional_requirement",
      "test_scenario",
    ]);
    expect(result.graph?.reverse_trace[0]).toMatchObject({ source_transition_id: "submit-order" });
    expect(result.graph?.reverse_trace[0]?.artifact_ids).toHaveLength(11);
    expect(new Set(result.graph?.reverse_trace[0]?.artifact_ids).size).toBe(11);

    const multiple = envelope();
    const model = multiple.workflow_model as { atoms: Record<string, unknown>[] };
    model.atoms.push({
      atom_id: "transition:retry",
      kind: "transition",
      transition_id: "retry-order",
      current_state_id: "draft",
      trigger_id: "submit",
      condition_ids: ["retry"],
      action_ids: ["commit"],
      next_state_id: "done",
    });
    const multiResult = compileDerivedRequirementTrace(multiple);
    expect(multiResult.graph?.requirements).toHaveLength(6);
    expect(multiResult.graph?.derived_systems).toHaveLength(16);
    expect(multiResult.graph?.reverse_trace).toHaveLength(2);
    expect(multiResult.graph?.layer_placements).toHaveLength(24);
    expect(multiResult.graph?.pair_edges).toHaveLength(12);
  });

  it("U-DTRACE-002: [PLAN-L7-559-derived-requirement-trace/U-DTRACE-002] 8派生系統をcandidateとして生成する", () => {
    const result = compileDerivedRequirementTrace(envelope());
    expect(result.graph?.derived_systems.map((item) => item.system_kind).sort()).toEqual(
      [...DERIVED_SYSTEM_KINDS].sort(),
    );
    expect(result.graph?.derived_systems.every((item) => item.status === "candidate")).toBe(true);
  });

  it("U-DTRACE-003: [PLAN-L7-559-derived-requirement-trace/U-DTRACE-003] orphan、片方向edge、別revision、先行confirmedをfail-closeする", () => {
    const compiled = compiledGraph();
    const requirement = compiled.requirements[0];
    const reverse = compiled.reverse_trace[0];
    const stale = compiled.derived_systems[0];
    const confirmed = compiled.derived_systems[1];
    if (!requirement || !reverse || !stale || !confirmed) throw new Error("fixture incomplete");
    requirement.source_transition_id = "missing";
    reverse.artifact_ids.pop();
    stale.source_revision = "r2";
    confirmed.status = "confirmed";
    const findings = validateDerivedRequirementTrace(compiled, envelope()).findings.map(
      (finding) => finding.code,
    );
    expect(findings).toEqual(
      expect.arrayContaining([
        "source_transition_orphan",
        "reverse_trace_mismatch",
        "source_revision_mismatch",
        "derived_system_premature_confirmation",
      ]),
    );
  });

  it("U-DTRACE-004: [PLAN-L7-559-derived-requirement-trace/U-DTRACE-004] L1〜L12と正規6 pairのexactly-once配置を検証する", () => {
    const compiled = compiledGraph();
    expect(validateDerivedRequirementTrace(compiled, envelope())).toMatchObject({ ok: true });
    const firstPlacement = compiled.layer_placements[0];
    const stalePlacement = compiled.layer_placements[1];
    if (!firstPlacement || !stalePlacement) throw new Error("fixture placements missing");
    compiled.layer_placements.push({ ...firstPlacement });
    compiled.pair_edges.pop();
    stalePlacement.source_revision = "r2";
    firstPlacement.oracle_id = "oracle:stale";
    const findings = validateDerivedRequirementTrace(compiled, envelope()).findings.map(
      (finding) => finding.code,
    );
    expect(findings).toEqual(
      expect.arrayContaining([
        "layer_placement_duplicate",
        "pair_edge_missing",
        "source_revision_mismatch",
        "trace_binding_mismatch",
      ]),
    );
  });

  it("U-DTRACE-005: [PLAN-L7-645-derived-trace-entry-failure-oracle/U-DTRACE-005] envelopeとtrace schemaの入口failure codeをexact固定する", () => {
    const malformedEnvelope = compileDerivedRequirementTrace({});
    expect(malformedEnvelope).toMatchObject({ ok: false, graph: null });
    expect(new Set(malformedEnvelope.findings.map((finding) => finding.code))).toEqual(
      new Set(["source_envelope_invalid"]),
    );

    const malformedTrace = validateDerivedRequirementTrace({}, envelope());
    expect(malformedTrace).toMatchObject({ ok: false, graph: null });
    expect(new Set(malformedTrace.findings.map((finding) => finding.code))).toEqual(
      new Set(["trace_schema_invalid"]),
    );
  });

  it("U-DTRACE-006: graph全体とsource identityの不一致をexact固定する", () => {
    for (const mutate of [
      (graph: ReturnType<typeof compiledGraph>) => {
        graph.workflow_id = "workflow:other";
      },
      (graph: ReturnType<typeof compiledGraph>) => {
        graph.source_revision = "r2";
      },
      (graph: ReturnType<typeof compiledGraph>) => {
        graph.source_snapshot = `sha256:${"b".repeat(64)}`;
      },
    ]) {
      const graph = compiledGraph();
      mutate(graph);
      expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
        expect.objectContaining({ code: "graph_source_mismatch", path: "graph" }),
      ]);
    }
  });

  it("U-DTRACE-007: artifact ID重複siteを原因固有pathでexact固定する", () => {
    const graph = compiledGraph();
    const first = graph.requirements[0];
    const second = graph.requirements[2];
    if (!first || !second) throw new Error("fixture requirements missing");
    second.artifact_id = first.artifact_id;

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({ code: "artifact_id_duplicate", path: "artifacts.2" }),
      expect.objectContaining({ code: "reverse_trace_mismatch", path: "submit-order" }),
    ]);
  });

  it("U-DTRACE-008: artifact／trace source identity driftをsite固有pathでexact固定する", () => {
    const input = envelopeWithSecondTransition();
    const artifactGraph = compiledGraph(input);
    const requirement = artifactGraph.requirements[1];
    if (!requirement) throw new Error("fixture requirement missing");
    requirement.source_snapshot = `sha256:${"b".repeat(64)}`;

    expect(validateDerivedRequirementTrace(artifactGraph, input).findings).toEqual([
      expect.objectContaining({ code: "source_snapshot_mismatch", path: "artifacts.1" }),
    ]);

    const artifactRevisionGraph = compiledGraph(input);
    const staleArtifact = artifactRevisionGraph.requirements[1];
    if (!staleArtifact) throw new Error("fixture requirement missing");
    staleArtifact.source_revision = "r2";
    expect(validateDerivedRequirementTrace(artifactRevisionGraph, input).findings).toEqual([
      expect.objectContaining({ code: "source_revision_mismatch", path: "artifacts.1" }),
    ]);

    const artifactOrphanGraph = compiledGraph(input);
    const orphanArtifact = artifactOrphanGraph.requirements[1];
    if (!orphanArtifact) throw new Error("fixture requirement missing");
    const replacement = {
      ...orphanArtifact,
      artifact_id: `${orphanArtifact.artifact_id}:replacement`,
    };
    const originalArtifactTransition = orphanArtifact.source_transition_id;
    orphanArtifact.source_transition_id = "missing";
    orphanArtifact.oracle_id = "oracle:missing";
    artifactOrphanGraph.requirements.push(replacement);
    const artifactReverse = artifactOrphanGraph.reverse_trace.find(
      (item) => item.source_transition_id === originalArtifactTransition,
    );
    if (!artifactReverse) throw new Error("fixture reverse trace missing");
    artifactReverse.artifact_ids = artifactReverse.artifact_ids.map((artifactId) =>
      artifactId === orphanArtifact.artifact_id ? replacement.artifact_id : artifactId,
    );
    expect(validateDerivedRequirementTrace(artifactOrphanGraph, input).findings).toEqual([
      expect.objectContaining({ code: "source_transition_orphan", path: "artifacts.1" }),
    ]);

    const traceSnapshotGraph = compiledGraph(input);
    const reverse = traceSnapshotGraph.reverse_trace[1];
    if (!reverse) throw new Error("fixture reverse trace missing");
    reverse.source_snapshot = `sha256:${"b".repeat(64)}`;
    expect(validateDerivedRequirementTrace(traceSnapshotGraph, input).findings).toEqual([
      expect.objectContaining({ code: "source_snapshot_mismatch", path: "trace.1" }),
    ]);

    const traceRevisionGraph = compiledGraph(input);
    const staleTrace = traceRevisionGraph.reverse_trace[1];
    if (!staleTrace) throw new Error("fixture reverse trace missing");
    staleTrace.source_revision = "r2";
    expect(validateDerivedRequirementTrace(traceRevisionGraph, input).findings).toEqual([
      expect.objectContaining({ code: "source_revision_mismatch", path: "trace.1" }),
    ]);

    const traceOrphanGraph = compiledGraph(input);
    const orphan = traceOrphanGraph.reverse_trace[1];
    if (!orphan) throw new Error("fixture reverse trace missing");
    const originalTransition = orphan.source_transition_id;
    orphan.source_transition_id = "missing";
    expect(validateDerivedRequirementTrace(traceOrphanGraph, input).findings).toEqual([
      expect.objectContaining({ code: "reverse_trace_mismatch", path: originalTransition }),
      expect.objectContaining({ code: "source_transition_orphan", path: "trace.1" }),
    ]);
  });

  it("U-DTRACE-009: requirement cardinalityの欠落と重複をtransition別にexact固定する", () => {
    const input = envelopeWithSecondTransition();
    const duplicateGraph = compiledGraph(input);
    const source = duplicateGraph.requirements.find(
      (item) =>
        item.source_transition_id === "retry-order" &&
        item.requirement_kind === "functional_requirement",
    );
    const reverse = duplicateGraph.reverse_trace.find(
      (item) => item.source_transition_id === "retry-order",
    );
    if (!source || !reverse) throw new Error("fixture requirement trace missing");
    const duplicate = { ...source, artifact_id: `${source.artifact_id}:duplicate` };
    duplicateGraph.requirements.push(duplicate);
    reverse.artifact_ids.push(duplicate.artifact_id);

    expect(validateDerivedRequirementTrace(duplicateGraph, input).findings).toEqual([
      expect.objectContaining({ code: "requirement_cardinality_invalid", path: "retry-order" }),
    ]);

    const missingGraph = compiledGraph(input);
    missingGraph.requirements = missingGraph.requirements.filter(
      (item) => item.artifact_id !== source.artifact_id,
    );
    const missingReverse = missingGraph.reverse_trace.find(
      (item) => item.source_transition_id === "retry-order",
    );
    if (!missingReverse) throw new Error("fixture reverse trace missing");
    missingReverse.artifact_ids = missingReverse.artifact_ids.filter(
      (artifactId) => artifactId !== source.artifact_id,
    );

    expect(validateDerivedRequirementTrace(missingGraph, input).findings).toEqual([
      expect.objectContaining({ code: "requirement_cardinality_invalid", path: "retry-order" }),
    ]);
  });

  it("U-DTRACE-010: derived system cardinalityの欠落と重複をtransition別にexact固定する", () => {
    const input = envelopeWithSecondTransition();
    const duplicateGraph = compiledGraph(input);
    const source = duplicateGraph.derived_systems.find(
      (item) => item.source_transition_id === "retry-order" && item.system_kind === "api",
    );
    const reverse = duplicateGraph.reverse_trace.find(
      (item) => item.source_transition_id === "retry-order",
    );
    if (!source || !reverse) throw new Error("fixture derived system trace missing");
    const duplicate = { ...source, artifact_id: `${source.artifact_id}:duplicate` };
    duplicateGraph.derived_systems.push(duplicate);
    reverse.artifact_ids.push(duplicate.artifact_id);

    expect(validateDerivedRequirementTrace(duplicateGraph, input).findings).toEqual([
      expect.objectContaining({
        code: "derived_system_cardinality_invalid",
        path: "retry-order",
      }),
    ]);

    const missingGraph = compiledGraph(input);
    missingGraph.derived_systems = missingGraph.derived_systems.filter(
      (item) => item.artifact_id !== source.artifact_id,
    );
    const missingReverse = missingGraph.reverse_trace.find(
      (item) => item.source_transition_id === "retry-order",
    );
    if (!missingReverse) throw new Error("fixture reverse trace missing");
    missingReverse.artifact_ids = missingReverse.artifact_ids.filter(
      (artifactId) => artifactId !== source.artifact_id,
    );

    expect(validateDerivedRequirementTrace(missingGraph, input).findings).toEqual([
      expect.objectContaining({
        code: "derived_system_cardinality_invalid",
        path: "retry-order",
      }),
    ]);
  });

  it("U-DTRACE-011: layer placement欠落をlayer pathへexact固定する", () => {
    const input = envelopeWithSecondTransition();
    const graph = compiledGraph(input);
    graph.layer_placements = graph.layer_placements.filter(
      (item) => !(item.source_transition_id === "retry-order" && item.layer === "L4"),
    );

    expect(validateDerivedRequirementTrace(graph, input).findings).toEqual([
      expect.objectContaining({ code: "layer_placement_missing", path: "retry-order.L4" }),
    ]);
  });

  it("U-DTRACE-012: V-pair／reverse multiplicityをidentityへexact固定する", () => {
    const input = envelopeWithSecondTransition();
    const noncanonicalGraph = compiledGraph(input);
    const edge = noncanonicalGraph.pair_edges.find(
      (item) => item.source_transition_id === "retry-order" && item.left_layer === "L1",
    );
    if (!edge) throw new Error("fixture pair edge missing");
    edge.right_layer = "L11";

    expect(validateDerivedRequirementTrace(noncanonicalGraph, input).findings).toEqual([
      expect.objectContaining({ code: "pair_edge_missing", path: "retry-order.L1.L12" }),
      expect.objectContaining({
        code: "pair_edge_noncanonical",
        path: "pair:retry-order:L1:L12",
      }),
    ]);

    const duplicatePairGraph = compiledGraph(input);
    const duplicateEdge = duplicatePairGraph.pair_edges.find(
      (item) => item.source_transition_id === "retry-order" && item.left_layer === "L2",
    );
    if (!duplicateEdge) throw new Error("fixture pair edge missing");
    duplicatePairGraph.pair_edges.push({ ...duplicateEdge });
    expect(validateDerivedRequirementTrace(duplicatePairGraph, input).findings).toEqual([
      expect.objectContaining({
        code: "pair_edge_duplicate",
        path: "retry-order.L2.L11",
      }),
    ]);

    const duplicateReverseGraph = compiledGraph(input);
    const duplicateReverse = duplicateReverseGraph.reverse_trace.find(
      (item) => item.source_transition_id === "retry-order",
    );
    if (!duplicateReverse) throw new Error("fixture reverse trace missing");
    duplicateReverseGraph.reverse_trace.push({
      ...duplicateReverse,
      artifact_ids: [...duplicateReverse.artifact_ids],
    });
    expect(validateDerivedRequirementTrace(duplicateReverseGraph, input).findings).toEqual([
      expect.objectContaining({ code: "reverse_trace_mismatch", path: "retry-order" }),
    ]);
  });

  it("U-DTRACE-013: validator側の不正source envelope siteをexact固定する", () => {
    const graph = compiledGraph();
    const result = validateDerivedRequirementTrace(graph, {});

    expect(result).toMatchObject({ ok: false, graph });
    expect(result.findings.map(({ code, path }) => ({ code, path }))).toEqual([
      { code: "source_envelope_invalid", path: "schema_version" },
      { code: "source_envelope_invalid", path: "source" },
      { code: "source_envelope_invalid", path: "workflow_model" },
      { code: "source_envelope_invalid", path: "unresolved_items" },
      { code: "source_envelope_invalid", path: "derived_requirements" },
      { code: "source_envelope_invalid", path: "coverage_report" },
      { code: "source_envelope_invalid", path: "contract_candidates" },
      { code: "source_envelope_invalid", path: "runtime_orchestration" },
    ]);
  });
});
