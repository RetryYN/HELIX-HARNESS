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

function compiledGraph() {
  const graph = compileDerivedRequirementTrace(envelope()).graph;
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
    const graph = compiledGraph();
    graph.workflow_id = "workflow:other";

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({ code: "graph_source_mismatch", path: "graph" }),
    ]);
  });

  it("U-DTRACE-007: artifact ID重複siteを原因固有pathでexact固定する", () => {
    const graph = compiledGraph();
    const first = graph.requirements[0];
    const second = graph.requirements[1];
    if (!first || !second) throw new Error("fixture requirements missing");
    second.artifact_id = first.artifact_id;

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "artifact_id_duplicate", path: "artifacts.1" }),
      ]),
    );
  });

  it("U-DTRACE-008: artifact snapshot driftを原因固有pathでexact固定する", () => {
    const graph = compiledGraph();
    const requirement = graph.requirements[0];
    if (!requirement) throw new Error("fixture requirement missing");
    requirement.source_snapshot = `sha256:${"b".repeat(64)}`;

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({ code: "source_snapshot_mismatch", path: "artifacts.0" }),
    ]);
  });

  it("U-DTRACE-009: requirement cardinality欠落をexact固定する", () => {
    const graph = compiledGraph();
    const removed = graph.requirements.shift();
    const reverse = graph.reverse_trace[0];
    if (!removed || !reverse) throw new Error("fixture requirement trace missing");
    reverse.artifact_ids = reverse.artifact_ids.filter((id) => id !== removed.artifact_id);

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({ code: "requirement_cardinality_invalid", path: "submit-order" }),
    ]);
  });

  it("U-DTRACE-010: derived system cardinality欠落をexact固定する", () => {
    const graph = compiledGraph();
    const removed = graph.derived_systems.shift();
    const reverse = graph.reverse_trace[0];
    if (!removed || !reverse) throw new Error("fixture derived system trace missing");
    reverse.artifact_ids = reverse.artifact_ids.filter((id) => id !== removed.artifact_id);

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({
        code: "derived_system_cardinality_invalid",
        path: "submit-order",
      }),
    ]);
  });

  it("U-DTRACE-011: layer placement欠落をlayer pathへexact固定する", () => {
    const graph = compiledGraph();
    graph.layer_placements = graph.layer_placements.filter((item) => item.layer !== "L3");

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual([
      expect.objectContaining({ code: "layer_placement_missing", path: "submit-order.L3" }),
    ]);
  });

  it("U-DTRACE-012: 非正規V-pairをpair identityへexact固定する", () => {
    const graph = compiledGraph();
    const edge = graph.pair_edges[0];
    if (!edge) throw new Error("fixture pair edge missing");
    edge.right_layer = "L11";

    expect(validateDerivedRequirementTrace(graph, envelope()).findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "pair_edge_noncanonical", path: edge.pair_id }),
      ]),
    );
  });

  it("U-DTRACE-013: validator側の不正source envelope siteをexact固定する", () => {
    const graph = compiledGraph();
    const result = validateDerivedRequirementTrace(graph, {});

    expect(result).toMatchObject({ ok: false, graph });
    expect(new Set(result.findings.map((finding) => finding.code))).toEqual(
      new Set(["source_envelope_invalid"]),
    );
  });
});
