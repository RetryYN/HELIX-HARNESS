import { z } from "zod";
import {
  type UniversalWorkflowEnvelope,
  validateUniversalWorkflowEnvelope,
} from "./universal-workflow-envelope";

export const DERIVED_REQUIREMENT_TRACE_VERSION = "helix-derived-requirement-trace.v1" as const;
export const DERIVED_SYSTEM_KINDS = [
  "business_flow",
  "screen_flow",
  "api",
  "data",
  "permission",
  "notification",
  "audit",
  "test_scenario",
] as const;
export const REQUIREMENT_KINDS = [
  "functional_requirement",
  "acceptance_criterion",
  "test_scenario",
] as const;
export const VMODEL_LAYERS = [
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "L6",
  "L7",
  "L8",
  "L9",
  "L10",
  "L11",
  "L12",
] as const;
export const VMODEL_PAIRS = [
  ["L1", "L12"],
  ["L2", "L11"],
  ["L3", "L10"],
  ["L4", "L9"],
  ["L5", "L8"],
  ["L6", "L7"],
] as const;

const idSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const layerSchema = z.enum(VMODEL_LAYERS);

const artifactBase = {
  artifact_id: idSchema,
  source_transition_id: idSchema,
  source_revision: idSchema,
  source_snapshot: digestSchema,
  oracle_id: idSchema,
};

const traceGraphSchema = z
  .object({
    schema_version: z.literal(DERIVED_REQUIREMENT_TRACE_VERSION),
    workflow_id: idSchema,
    source_revision: idSchema,
    source_snapshot: digestSchema,
    requirements: z.array(
      z
        .object({
          ...artifactBase,
          requirement_kind: z.enum(REQUIREMENT_KINDS),
          statement: z.string().trim().min(1),
        })
        .strict(),
    ),
    derived_systems: z.array(
      z
        .object({
          ...artifactBase,
          system_kind: z.enum(DERIVED_SYSTEM_KINDS),
          status: z.enum(["candidate", "confirmed", "rejected"]),
        })
        .strict(),
    ),
    reverse_trace: z.array(
      z
        .object({
          source_transition_id: idSchema,
          source_revision: idSchema,
          source_snapshot: digestSchema,
          artifact_ids: z.array(idSchema),
        })
        .strict(),
    ),
    layer_placements: z.array(
      z
        .object({
          placement_id: idSchema,
          obligation_id: idSchema,
          source_transition_id: idSchema,
          layer: layerSchema,
          source_revision: idSchema,
          source_snapshot: digestSchema,
          oracle_id: idSchema,
        })
        .strict(),
    ),
    pair_edges: z.array(
      z
        .object({
          pair_id: idSchema,
          obligation_id: idSchema,
          source_transition_id: idSchema,
          left_layer: layerSchema,
          right_layer: layerSchema,
          left_placement_id: idSchema,
          right_placement_id: idSchema,
          source_revision: idSchema,
          source_snapshot: digestSchema,
          oracle_id: idSchema,
        })
        .strict(),
    ),
  })
  .strict();

export type DerivedRequirementTraceGraph = z.infer<typeof traceGraphSchema>;
export interface DerivedRequirementTraceFinding {
  code: string;
  path: string;
  message: string;
}
export interface DerivedRequirementTraceResult {
  ok: boolean;
  graph: DerivedRequirementTraceGraph | null;
  findings: DerivedRequirementTraceFinding[];
}

function transitionIds(envelope: UniversalWorkflowEnvelope): string[] {
  return envelope.workflow_model.atoms
    .filter((atom) => atom.kind === "transition")
    .map((atom) => atom.transition_id)
    .sort();
}

function artifactId(
  namespace: "requirement" | "system",
  transitionId: string,
  kind: string,
): string {
  return `derived:${namespace}:${transitionId}:${kind}`;
}

function obligationId(transitionId: string): string {
  return `obligation:${transitionId}`;
}

function oracleId(transitionId: string): string {
  return `oracle:${transitionId}`;
}

function compile(envelope: UniversalWorkflowEnvelope): DerivedRequirementTraceGraph {
  const revision = envelope.workflow_model.revision;
  const snapshot = envelope.source.digest;
  const transitions = transitionIds(envelope);
  const requirements = transitions.flatMap((source_transition_id) =>
    REQUIREMENT_KINDS.map((requirement_kind) => ({
      artifact_id: artifactId("requirement", source_transition_id, requirement_kind),
      source_transition_id,
      source_revision: revision,
      source_snapshot: snapshot,
      oracle_id: oracleId(source_transition_id),
      requirement_kind,
      statement: `${source_transition_id} transition の ${requirement_kind}`,
    })),
  );
  const derived_systems = transitions.flatMap((source_transition_id) =>
    DERIVED_SYSTEM_KINDS.map((system_kind) => ({
      artifact_id: artifactId("system", source_transition_id, system_kind),
      source_transition_id,
      source_revision: revision,
      source_snapshot: snapshot,
      oracle_id: oracleId(source_transition_id),
      system_kind,
      status: "candidate" as const,
    })),
  );
  const allArtifacts = [...requirements, ...derived_systems];
  const layer_placements = transitions.flatMap((source_transition_id) =>
    VMODEL_LAYERS.map((layer) => ({
      placement_id: `placement:${source_transition_id}:${layer}`,
      obligation_id: obligationId(source_transition_id),
      source_transition_id,
      layer,
      source_revision: revision,
      source_snapshot: snapshot,
      oracle_id: oracleId(source_transition_id),
    })),
  );
  const pair_edges = transitions.flatMap((source_transition_id) =>
    VMODEL_PAIRS.map(([left_layer, right_layer]) => ({
      pair_id: `pair:${source_transition_id}:${left_layer}:${right_layer}`,
      obligation_id: obligationId(source_transition_id),
      source_transition_id,
      left_layer,
      right_layer,
      left_placement_id: `placement:${source_transition_id}:${left_layer}`,
      right_placement_id: `placement:${source_transition_id}:${right_layer}`,
      source_revision: revision,
      source_snapshot: snapshot,
      oracle_id: oracleId(source_transition_id),
    })),
  );
  return {
    schema_version: DERIVED_REQUIREMENT_TRACE_VERSION,
    workflow_id: envelope.workflow_model.workflow_id,
    source_revision: revision,
    source_snapshot: snapshot,
    requirements,
    derived_systems,
    reverse_trace: transitions.map((source_transition_id) => ({
      source_transition_id,
      source_revision: revision,
      source_snapshot: snapshot,
      artifact_ids: allArtifacts
        .filter((artifact) => artifact.source_transition_id === source_transition_id)
        .map((artifact) => artifact.artifact_id)
        .sort(),
    })),
    layer_placements,
    pair_edges,
  };
}

export function compileDerivedRequirementTrace(input: unknown): DerivedRequirementTraceResult {
  const envelopeResult = validateUniversalWorkflowEnvelope(input);
  if (!envelopeResult.ok || !envelopeResult.envelope) {
    return {
      ok: false,
      graph: null,
      findings: envelopeResult.findings.map((finding) => ({
        code: "source_envelope_invalid",
        path: finding.path,
        message: finding.message,
      })),
    };
  }
  const graph = compile(envelopeResult.envelope);
  return { ok: true, graph, findings: [] };
}

export function validateDerivedRequirementTrace(
  graphInput: unknown,
  envelopeInput: unknown,
): DerivedRequirementTraceResult {
  const parsedGraph = traceGraphSchema.safeParse(graphInput);
  const envelopeResult = validateUniversalWorkflowEnvelope(envelopeInput);
  if (!parsedGraph.success || !envelopeResult.ok || !envelopeResult.envelope) {
    const findings: DerivedRequirementTraceFinding[] = [];
    if (!parsedGraph.success) {
      findings.push(
        ...parsedGraph.error.issues.map((issue) => ({
          code: "trace_schema_invalid",
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }
    findings.push(
      ...envelopeResult.findings.map((finding) => ({
        code: "source_envelope_invalid",
        path: finding.path,
        message: finding.message,
      })),
    );
    return { ok: false, graph: parsedGraph.success ? parsedGraph.data : null, findings };
  }

  const graph = parsedGraph.data;
  const envelope = envelopeResult.envelope;
  const findings: DerivedRequirementTraceFinding[] = [];
  const transitions = new Set(transitionIds(envelope));
  const revision = envelope.workflow_model.revision;
  const snapshot = envelope.source.digest;
  const allArtifacts = [...graph.requirements, ...graph.derived_systems];
  const add = (code: string, path: string, message: string) =>
    findings.push({ code, path, message });

  if (
    graph.workflow_id !== envelope.workflow_model.workflow_id ||
    graph.source_revision !== revision ||
    graph.source_snapshot !== snapshot
  ) {
    add("graph_source_mismatch", "graph", "graph must bind the current workflow identity");
  }
  const artifactIds = new Set<string>();
  for (const [index, artifact] of allArtifacts.entries()) {
    if (artifactIds.has(artifact.artifact_id))
      add("artifact_id_duplicate", `artifacts.${index}`, "artifact ID is duplicated");
    artifactIds.add(artifact.artifact_id);
    if (!transitions.has(artifact.source_transition_id))
      add("source_transition_orphan", `artifacts.${index}`, "source transition does not exist");
    if (artifact.source_revision !== revision)
      add("source_revision_mismatch", `artifacts.${index}`, "artifact revision is stale");
    if (artifact.source_snapshot !== snapshot)
      add("source_snapshot_mismatch", `artifacts.${index}`, "artifact snapshot is stale");
    if (artifact.oracle_id !== oracleId(artifact.source_transition_id))
      add("trace_binding_mismatch", `artifacts.${index}.oracle_id`, "artifact oracle is stale");
  }
  graph.derived_systems.forEach((artifact, index) => {
    if (artifact.status !== "candidate")
      add(
        "derived_system_premature_confirmation",
        `derived_systems.${index}.status`,
        "derived systems remain candidate until their layer gate confirms them",
      );
  });
  for (const transition of transitions) {
    for (const kind of REQUIREMENT_KINDS) {
      if (
        graph.requirements.filter(
          (item) => item.source_transition_id === transition && item.requirement_kind === kind,
        ).length !== 1
      )
        add("requirement_cardinality_invalid", transition, `exactly one ${kind} is required`);
    }
    for (const kind of DERIVED_SYSTEM_KINDS) {
      if (
        graph.derived_systems.filter(
          (item) => item.source_transition_id === transition && item.system_kind === kind,
        ).length !== 1
      )
        add("derived_system_cardinality_invalid", transition, `exactly one ${kind} is required`);
    }
    const expectedArtifacts = allArtifacts
      .filter((artifact) => artifact.source_transition_id === transition)
      .map((artifact) => artifact.artifact_id)
      .sort();
    const reverse = graph.reverse_trace.filter((item) => item.source_transition_id === transition);
    if (
      reverse.length !== 1 ||
      JSON.stringify([...(reverse[0]?.artifact_ids ?? [])].sort()) !==
        JSON.stringify(expectedArtifacts)
    )
      add(
        "reverse_trace_mismatch",
        transition,
        "reverse trace must exactly cover forward artifacts",
      );

    for (const layer of VMODEL_LAYERS) {
      const placements = graph.layer_placements.filter(
        (item) => item.source_transition_id === transition && item.layer === layer,
      );
      if (placements.length === 0)
        add("layer_placement_missing", `${transition}.${layer}`, "layer placement is missing");
      if (placements.length > 1)
        add("layer_placement_duplicate", `${transition}.${layer}`, "layer placement is duplicated");
      for (const placement of placements) {
        if (
          placement.placement_id !== `placement:${transition}:${layer}` ||
          placement.obligation_id !== obligationId(transition) ||
          placement.oracle_id !== oracleId(transition)
        )
          add("trace_binding_mismatch", placement.placement_id, "placement binding is stale");
      }
    }
    for (const [left, right] of VMODEL_PAIRS) {
      const edges = graph.pair_edges.filter(
        (item) =>
          item.source_transition_id === transition &&
          item.left_layer === left &&
          item.right_layer === right,
      );
      if (edges.length === 0)
        add(
          "pair_edge_missing",
          `${transition}.${left}.${right}`,
          "canonical pair edge is missing",
        );
      if (edges.length > 1)
        add(
          "pair_edge_duplicate",
          `${transition}.${left}.${right}`,
          "canonical pair edge is duplicated",
        );
      for (const edge of edges) {
        if (
          edge.pair_id !== `pair:${transition}:${left}:${right}` ||
          edge.obligation_id !== obligationId(transition) ||
          edge.left_placement_id !== `placement:${transition}:${left}` ||
          edge.right_placement_id !== `placement:${transition}:${right}` ||
          edge.oracle_id !== oracleId(transition)
        )
          add("trace_binding_mismatch", edge.pair_id, "pair binding is stale");
      }
    }
    const canonicalPairs = new Set(VMODEL_PAIRS.map(([left, right]) => `${left}:${right}`));
    for (const edge of graph.pair_edges.filter(
      (item) => item.source_transition_id === transition,
    )) {
      if (!canonicalPairs.has(`${edge.left_layer}:${edge.right_layer}`))
        add("pair_edge_noncanonical", edge.pair_id, "pair edge is not canonical");
    }
  }
  for (const [index, item] of [
    ...graph.reverse_trace,
    ...graph.layer_placements,
    ...graph.pair_edges,
  ].entries()) {
    if (!transitions.has(item.source_transition_id))
      add("source_transition_orphan", `trace.${index}`, "source transition does not exist");
    if (item.source_revision !== revision)
      add("source_revision_mismatch", `trace.${index}`, "trace revision is stale");
    if (item.source_snapshot !== snapshot)
      add("source_snapshot_mismatch", `trace.${index}`, "trace snapshot is stale");
  }
  return { ok: findings.length === 0, graph, findings };
}
