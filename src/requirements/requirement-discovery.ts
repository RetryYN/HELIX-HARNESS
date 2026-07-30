import { createHash } from "node:crypto";
import { z } from "zod";

const id = z.string().min(1).max(200);
const digest = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const nonEmpty = z.string().trim().min(1);

export const requirementDiscoveryEventTypes = [
  "initiative_ingested",
  "requirement_candidate_created",
  "question_asked",
  "answer_recorded",
  "prototype_generated",
  "prototype_reaction_recorded",
  "candidate_derived",
  "candidate_split",
  "candidate_merged",
  "candidate_rejected",
  "candidate_accepted",
  "contradiction_detected",
  "unresolved_deferred",
  "prototype_agreement_recorded",
  "l3_compile_requested",
  "l3_backflow_requested",
  "l3_compile_completed",
] as const;

export const requirementCandidateStates = [
  "hypothesis",
  "elicited",
  "prototyped",
  "observed",
  "accepted",
  "specified",
  "frozen",
  "rejected",
  "deferred",
  "challenged",
  "superseded",
  "stale",
] as const;

export const questionClasses = [
  "value",
  "actor",
  "task",
  "workflow",
  "data",
  "permission",
  "state",
  "exception",
  "integration",
  "security",
  "privacy",
  "accessibility",
  "performance",
  "availability",
  "recovery",
  "observability",
  "cost",
  "legal",
  "operation",
  "migration",
  "rollback",
] as const;

export const surfaceKinds = [
  "screen",
  "cli",
  "api",
  "event",
  "batch",
  "notification",
  "external_service",
  "none",
] as const;

const actorSchema = z
  .object({
    actor_id: id,
    actor_kind: z.enum(["human", "ai", "system"]),
    authority: nonEmpty,
  })
  .strict();

const candidateSchema = z
  .object({
    candidate_id: id,
    revision: z.number().int().positive(),
    statement: nonEmpty,
    priority: z.enum(["P0", "P1", "P2", "P3"]),
    state: z.enum(requirementCandidateStates),
    actor_ids: z.array(id),
    task_ids: z.array(id),
    surface_ids: z.array(id),
    non_ui_na: z.boolean(),
    non_ui_na_reason: nonEmpty.optional(),
    non_ui_na_reevaluation_condition: nonEmpty.optional(),
    source_event_ids: z.array(id).min(1),
    iteration: z.number().int().nonnegative(),
    semantic_digest: digest,
  })
  .strict()
  .superRefine((candidate, context) => {
    const noneFieldsPresent =
      candidate.non_ui_na_reason !== undefined ||
      candidate.non_ui_na_reevaluation_condition !== undefined;
    if (
      candidate.non_ui_na &&
      (!candidate.non_ui_na_reason || !candidate.non_ui_na_reevaluation_condition)
    ) {
      context.addIssue({
        code: "custom",
        message: "non-UI none requires reason and reevaluation condition",
      });
    } else if (!candidate.non_ui_na && noneFieldsPresent) {
      context.addIssue({
        code: "custom",
        message: "non-UI none fields are forbidden when a surface is assigned",
      });
    }
  });

const questionSchema = z
  .object({
    question_id: id,
    question_class: z.enum(questionClasses),
    text: nonEmpty,
    reason: nonEmpty,
    affected_candidate_ids: z.array(id),
    affected_surface_ids: z.array(id),
    impact_if_unanswered: nonEmpty,
    answer_type: nonEmpty,
    suggested_answers: z.array(nonEmpty),
    free_text_allowed: z.boolean(),
    defer_allowed: z.boolean(),
    selection_factors: z
      .object({
        impact: z.number().nonnegative(),
        uncertainty: z.number().nonnegative(),
        downstream_change_cost: z.number().nonnegative(),
        human_only_decision: z.number().nonnegative(),
      })
      .strict(),
    semantic_key: id,
  })
  .strict();

const prototypeSchema = z
  .object({
    prototype_id: id,
    revision: z.number().int().positive(),
    surface_kind: z.enum(surfaceKinds),
    none_reason: nonEmpty.optional(),
    none_reevaluation_condition: nonEmpty.optional(),
    artifact_ref: nonEmpty,
    covered_candidate_ids: z.array(id).min(1),
    actor_ids: z.array(id),
    action_ids: z.array(id),
    state_ids: z.array(id),
    normal_flow: z.array(nonEmpty).min(1),
    cancel_flow: z.array(nonEmpty).min(1),
    failure_flow: z.array(nonEmpty).min(1),
    timeout_flow: z.array(nonEmpty).min(1),
    assumptions: z.array(nonEmpty),
    unresolved_item_ids: z.array(id),
    artifact_digest: digest,
  })
  .strict()
  .superRefine((prototype, context) => {
    const noneFieldsPresent =
      prototype.none_reason !== undefined || prototype.none_reevaluation_condition !== undefined;
    if (
      prototype.surface_kind === "none" &&
      (!prototype.none_reason || !prototype.none_reevaluation_condition)
    ) {
      context.addIssue({
        code: "custom",
        message: "none surface requires reason and reevaluation condition",
      });
    } else if (prototype.surface_kind !== "none" && noneFieldsPresent) {
      context.addIssue({
        code: "custom",
        message: "none surface fields are forbidden for an assigned surface",
      });
    }
  });

const reactionSchema = z
  .object({
    reaction_id: id,
    prototype_id: id,
    prototype_revision: z.number().int().positive(),
    actor_id: id,
    reaction_type: z.enum([
      "accept",
      "reject",
      "confusing",
      "missing",
      "unnecessary",
      "risky",
      "alternative",
      "priority_change",
    ]),
    statement: nonEmpty,
    affected_region_or_action: nonEmpty,
    derived_candidate_ids: z.array(id),
    decision: z.enum([
      "revise_requirement",
      "revise_prototype",
      "split_candidate",
      "merge_candidate",
      "reject_candidate",
      "accept_candidate",
      "ask_followup",
    ]),
  })
  .strict();

const unresolvedSchema = z
  .object({
    unresolved_id: id,
    kind: z.enum(["contradiction", "unanswered", "authority", "deferred", "backflow"]),
    candidate_ids: z.array(id),
    owner: nonEmpty,
    reentry_condition: nonEmpty,
    blocking: z.boolean(),
    evidence_digest: digest,
  })
  .strict();

const agreementSchema = z
  .object({
    agreement_id: id,
    accepted_candidate_ids: z.array(id),
    rejected_candidate_ids: z.array(id),
    deferred_candidate_ids: z.array(id),
    accepted_prototype_revisions: z.array(
      z.object({ prototype_id: id, revision: z.number().int().positive() }).strict(),
    ),
    unresolved_item_ids: z.array(id),
    human_approver: nonEmpty,
    approved_at: z.string().datetime(),
    source_event_digest: digest,
    ready_for_l3_compile: z.literal(true),
  })
  .strict();

const coverageSchema = z
  .object({
    actor_ids: z.array(id),
    task_ids: z.array(id),
    implicit_matrix_items: z.array(nonEmpty),
    implicit_matrix_complete: z.boolean(),
  })
  .strict();

const payloadSchemas = {
  initiative_ingested: z
    .object({ brief_ref: nonEmpty, brief_digest: digest, coverage: coverageSchema })
    .strict(),
  requirement_candidate_created: z.object({ candidate: candidateSchema }).strict(),
  question_asked: z.object({ question: questionSchema }).strict(),
  answer_recorded: z
    .object({
      answer_id: id,
      question_id: id,
      statement: nonEmpty,
      authority: nonEmpty,
      source_ref: nonEmpty,
    })
    .strict(),
  prototype_generated: z.object({ prototype: prototypeSchema }).strict(),
  prototype_reaction_recorded: z.object({ reaction: reactionSchema }).strict(),
  candidate_derived: z
    .object({
      candidate: candidateSchema,
      derivation_kind: z.enum(["reaction", "implicit_requirement", "backflow"]),
      human_decision_required: z.literal(true),
    })
    .strict(),
  candidate_split: z
    .object({ source_candidate_id: id, children: z.array(candidateSchema).min(2) })
    .strict(),
  candidate_merged: z
    .object({ source_candidate_ids: z.array(id).min(2), merged: candidateSchema })
    .strict(),
  candidate_rejected: z.object({ candidate_id: id, reason: nonEmpty }).strict(),
  candidate_accepted: z.object({ candidate_id: id, rationale: nonEmpty }).strict(),
  contradiction_detected: z.object({ unresolved: unresolvedSchema }).strict(),
  unresolved_deferred: z.object({ unresolved: unresolvedSchema }).strict(),
  prototype_agreement_recorded: z.object({ agreement: agreementSchema }).strict(),
  l3_compile_requested: z.object({ agreement_id: id, candidate_ids: z.array(id).min(1) }).strict(),
  l3_backflow_requested: z
    .object({
      unresolved: unresolvedSchema,
      question_ids: z.array(id),
      prototype_delta_refs: z.array(nonEmpty),
    })
    .strict(),
  l3_compile_completed: z
    .object({ requirement_record_ids: z.array(id).min(1), compiler_receipt_digest: digest })
    .strict(),
} satisfies Record<(typeof requirementDiscoveryEventTypes)[number], z.ZodTypeAny>;

const eventSchemas = requirementDiscoveryEventTypes.map((eventType) =>
  z
    .object({
      schema_version: z.literal("helix-requirement-discovery-event.v1"),
      event_id: id,
      initiative_id: id,
      sequence: z.number().int().positive(),
      iteration: z.number().int().nonnegative(),
      event_type: z.literal(eventType),
      occurred_at: z.string().datetime(),
      actor: actorSchema,
      previous_event_digest: digest.nullable(),
      payload_digest: digest,
      event_digest: digest,
      payload: payloadSchemas[eventType],
    })
    .strict(),
);

export const requirementDiscoveryEventSchema = z.discriminatedUnion(
  "event_type",
  eventSchemas as [
    (typeof eventSchemas)[0],
    (typeof eventSchemas)[1],
    ...(typeof eventSchemas)[number][],
  ],
);

type RequirementDiscoveryEventType = (typeof requirementDiscoveryEventTypes)[number];
type RequirementDiscoveryEventBase = {
  schema_version: "helix-requirement-discovery-event.v1";
  event_id: string;
  initiative_id: string;
  sequence: number;
  iteration: number;
  occurred_at: string;
  actor: z.infer<typeof actorSchema>;
  previous_event_digest: string | null;
  payload_digest: string;
  event_digest: string;
};
export type RequirementDiscoveryEvent = {
  [K in RequirementDiscoveryEventType]: RequirementDiscoveryEventBase & {
    event_type: K;
    payload: z.infer<(typeof payloadSchemas)[K]>;
  };
}[RequirementDiscoveryEventType];
export type RequirementDiscoveryEventInput = RequirementDiscoveryEvent extends infer Event
  ? Event extends RequirementDiscoveryEvent
    ? Omit<Event, "payload_digest" | "event_digest">
    : never
  : never;
export type RequirementCandidate = z.infer<typeof candidateSchema>;

export interface RequirementDiscoveryProjection {
  schema_version: "helix-requirement-candidate-projection.v1";
  initiative_id: string;
  event_head: string;
  event_count: number;
  projection_digest: string;
  candidates: Record<string, RequirementCandidate>;
  question_ids: string[];
  answered_question_ids: string[];
  prototype_revision_ids: string[];
  reaction_ids: string[];
  unresolved: Record<string, z.infer<typeof unresolvedSchema>>;
  agreement: z.infer<typeof agreementSchema> | null;
  compile_status: "not_requested" | "requested" | "backflow_required" | "completed";
  coverage: z.infer<typeof coverageSchema>;
  convergence: RequirementDiscoveryConvergence;
}

export interface RequirementDiscoveryConvergence {
  ready: boolean;
  checks: Record<string, boolean>;
  blocking_reasons: string[];
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
}

function eventPayloadDigest(event: RequirementDiscoveryEvent): string {
  return sha256(event.payload);
}

function eventDigest(event: RequirementDiscoveryEvent): string {
  const { event_digest: _eventDigest, ...withoutEventDigest } = event;
  return sha256(withoutEventDigest);
}

function requireHuman(event: RequirementDiscoveryEvent, action: string): void {
  if (event.actor.actor_kind !== "human") {
    throw new Error(`${action} requires a human actor`);
  }
}

function currentCandidate(
  candidates: Record<string, RequirementCandidate>,
  candidateId: string,
): RequirementCandidate {
  const candidate = candidates[candidateId];
  if (!candidate) throw new Error(`unknown candidate: ${candidateId}`);
  return candidate;
}

function setCandidateState(
  candidates: Record<string, RequirementCandidate>,
  candidateId: string,
  state: RequirementCandidate["state"],
): void {
  const candidate = currentCandidate(candidates, candidateId);
  const allowed: Record<RequirementCandidate["state"], readonly RequirementCandidate["state"][]> = {
    hypothesis: ["elicited", "rejected", "deferred", "challenged", "superseded", "stale"],
    elicited: ["prototyped", "rejected", "deferred", "challenged", "superseded", "stale"],
    prototyped: ["observed", "rejected", "deferred", "challenged", "superseded", "stale"],
    observed: ["accepted", "rejected", "deferred", "challenged", "superseded", "stale"],
    accepted: ["specified", "challenged", "superseded", "stale"],
    specified: ["frozen", "challenged", "superseded", "stale"],
    frozen: ["superseded", "stale"],
    rejected: [],
    deferred: ["elicited", "rejected", "superseded", "stale"],
    challenged: ["elicited", "rejected", "deferred", "superseded", "stale"],
    superseded: [],
    stale: [],
  };
  if (!allowed[candidate.state].includes(state)) {
    throw new Error(`invalid candidate transition: ${candidate.state}->${state}`);
  }
  candidates[candidateId] = { ...candidate, state };
}

function convergenceOf(
  candidates: Record<string, RequirementCandidate>,
  coverage: z.infer<typeof coverageSchema>,
  unresolved: Record<string, z.infer<typeof unresolvedSchema>>,
  agreement: z.infer<typeof agreementSchema> | null,
  prototypes: Map<string, z.infer<typeof prototypeSchema>>,
  events: readonly RequirementDiscoveryEvent[],
): RequirementDiscoveryConvergence {
  const active = Object.values(candidates).filter(
    (candidate) => !["rejected", "superseded", "stale"].includes(candidate.state),
  );
  const priority = active.filter(
    (candidate) => candidate.priority === "P0" || candidate.priority === "P1",
  );
  const latestIteration = Math.max(0, ...events.map((event) => event.iteration));
  const recentNewPriority = events.some((event) => {
    if (event.iteration < Math.max(0, latestIteration - 1)) return false;
    if (
      event.event_type !== "requirement_candidate_created" &&
      event.event_type !== "candidate_derived"
    ) {
      return false;
    }
    return event.payload.candidate.priority === "P0" || event.payload.candidate.priority === "P1";
  });
  const flowCoverage = [...prototypes.values()].some(
    (prototype) =>
      prototype.normal_flow.length > 0 &&
      prototype.cancel_flow.length > 0 &&
      prototype.failure_flow.length > 0 &&
      prototype.timeout_flow.length > 0,
  );
  const checks = {
    actors_present: coverage.actor_ids.length > 0,
    tasks_present: coverage.task_ids.length > 0,
    required_flows_present: flowCoverage,
    priority_surface_or_na: priority.every(
      (candidate) => candidate.surface_ids.length > 0 || candidate.non_ui_na,
    ),
    all_candidates_dispositioned: active.every((candidate) =>
      ["accepted", "specified", "deferred", "challenged"].includes(candidate.state),
    ),
    contradiction_zero_or_typed_defer: Object.values(unresolved).every(
      (item) =>
        item.kind !== "contradiction" ||
        (!item.blocking && item.owner.length > 0 && item.reentry_condition.length > 0),
    ),
    unresolved_owned: Object.values(unresolved).every(
      (item) => item.owner.length > 0 && item.reentry_condition.length > 0,
    ),
    implicit_matrix_complete: coverage.implicit_matrix_complete,
    stable_priority_iterations: latestIteration >= 2 && !recentNewPriority,
    human_prototype_agreement: agreement !== null,
  };
  const blocking_reasons = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  return { ready: blocking_reasons.length === 0, checks, blocking_reasons };
}

export function parseRequirementDiscoveryEvent(raw: unknown): RequirementDiscoveryEvent {
  return requirementDiscoveryEventSchema.parse(raw) as RequirementDiscoveryEvent;
}

export function rebuildRequirementCandidateProjection(
  rawEvents: readonly unknown[],
): RequirementDiscoveryProjection {
  if (rawEvents.length === 0) throw new Error("at least one discovery event is required");
  const events = rawEvents.map(parseRequirementDiscoveryEvent);
  const initiativeId = events[0].initiative_id;
  const candidates: Record<string, RequirementCandidate> = {};
  const unresolved: Record<string, z.infer<typeof unresolvedSchema>> = {};
  const questions = new Map<string, z.infer<typeof questionSchema>>();
  const answered = new Set<string>();
  const prototypes = new Map<string, z.infer<typeof prototypeSchema>>();
  const reactions = new Set<string>();
  let agreement: z.infer<typeof agreementSchema> | null = null;
  let coverage: z.infer<typeof coverageSchema> = {
    actor_ids: [],
    task_ids: [],
    implicit_matrix_items: [],
    implicit_matrix_complete: false,
  };
  let compileStatus: RequirementDiscoveryProjection["compile_status"] = "not_requested";
  let previousDigest: string | null = null;
  const seenEvents = new Set<string>();
  const semanticQuestions = new Set<string>();

  for (const [index, event] of events.entries()) {
    if (event.initiative_id !== initiativeId) throw new Error("mixed initiative event stream");
    if (event.sequence !== index + 1) throw new Error("event sequence must be contiguous");
    if (event.previous_event_digest !== previousDigest)
      throw new Error("event digest chain mismatch");
    if (seenEvents.has(event.event_id)) throw new Error(`duplicate event_id: ${event.event_id}`);
    if (event.payload_digest !== eventPayloadDigest(event))
      throw new Error("payload digest mismatch");
    if (event.event_digest !== eventDigest(event)) throw new Error("event digest mismatch");
    seenEvents.add(event.event_id);

    switch (event.event_type) {
      case "initiative_ingested":
        if (index !== 0) throw new Error("initiative_ingested must be the first event");
        coverage = event.payload.coverage;
        break;
      case "requirement_candidate_created":
      case "candidate_derived": {
        const candidate = event.payload.candidate;
        if (candidate.state === "frozen") throw new Error("L2 cannot create a frozen candidate");
        if (candidates[candidate.candidate_id]) throw new Error("candidate already exists");
        candidates[candidate.candidate_id] = candidate;
        break;
      }
      case "question_asked":
        if (semanticQuestions.has(event.payload.question.semantic_key)) {
          throw new Error("semantically duplicate question");
        }
        semanticQuestions.add(event.payload.question.semantic_key);
        questions.set(event.payload.question.question_id, event.payload.question);
        break;
      case "answer_recorded":
        if (!questions.has(event.payload.question_id))
          throw new Error("answer references unknown question");
        answered.add(event.payload.question_id);
        break;
      case "prototype_generated": {
        const prototype = event.payload.prototype;
        for (const candidateId of prototype.covered_candidate_ids) {
          const candidate = currentCandidate(candidates, candidateId);
          if (candidate.state === "hypothesis")
            setCandidateState(candidates, candidateId, "elicited");
          setCandidateState(candidates, candidateId, "prototyped");
        }
        prototypes.set(`${prototype.prototype_id}@${prototype.revision}`, prototype);
        break;
      }
      case "prototype_reaction_recorded": {
        const prototype = prototypes.get(
          `${event.payload.reaction.prototype_id}@${event.payload.reaction.prototype_revision}`,
        );
        if (!prototype) {
          throw new Error("reaction references unknown prototype revision");
        }
        for (const candidateId of prototype.covered_candidate_ids) {
          const candidate = currentCandidate(candidates, candidateId);
          if (candidate.state === "prototyped")
            setCandidateState(candidates, candidateId, "observed");
        }
        reactions.add(event.payload.reaction.reaction_id);
        break;
      }
      case "candidate_split":
        setCandidateState(candidates, event.payload.source_candidate_id, "superseded");
        for (const child of event.payload.children) candidates[child.candidate_id] = child;
        break;
      case "candidate_merged":
        for (const sourceId of event.payload.source_candidate_ids) {
          setCandidateState(candidates, sourceId, "superseded");
        }
        candidates[event.payload.merged.candidate_id] = event.payload.merged;
        break;
      case "candidate_rejected":
        requireHuman(event, "candidate rejection");
        setCandidateState(candidates, event.payload.candidate_id, "rejected");
        break;
      case "candidate_accepted":
        requireHuman(event, "candidate acceptance");
        setCandidateState(candidates, event.payload.candidate_id, "accepted");
        break;
      case "contradiction_detected":
      case "unresolved_deferred":
        unresolved[event.payload.unresolved.unresolved_id] = event.payload.unresolved;
        break;
      case "prototype_agreement_recorded":
        requireHuman(event, "prototype agreement");
        agreement = event.payload.agreement;
        break;
      case "l3_compile_requested":
        if (!agreement || agreement.agreement_id !== event.payload.agreement_id) {
          throw new Error("L3 compile requires the current human agreement");
        }
        compileStatus = "requested";
        break;
      case "l3_backflow_requested":
        unresolved[event.payload.unresolved.unresolved_id] = event.payload.unresolved;
        compileStatus = "backflow_required";
        break;
      case "l3_compile_completed":
        if (compileStatus !== "requested") throw new Error("L3 compile was not requested");
        compileStatus = "completed";
        break;
    }
    previousDigest = event.event_digest;
  }

  const convergence = convergenceOf(
    candidates,
    coverage,
    unresolved,
    agreement,
    prototypes,
    events,
  );
  const projectionWithoutDigest = {
    schema_version: "helix-requirement-candidate-projection.v1" as const,
    initiative_id: initiativeId,
    event_head: previousDigest as string,
    event_count: events.length,
    candidates,
    question_ids: [...questions.keys()].sort(),
    answered_question_ids: [...answered].sort(),
    prototype_revision_ids: [...prototypes.keys()].sort(),
    reaction_ids: [...reactions].sort(),
    unresolved,
    agreement,
    compile_status: compileStatus,
    coverage,
    convergence,
  };
  return {
    ...projectionWithoutDigest,
    projection_digest: sha256(projectionWithoutDigest),
  };
}

export function createRequirementDiscoveryEvent(
  input: RequirementDiscoveryEventInput,
): RequirementDiscoveryEvent {
  const withPayload = {
    ...input,
    payload_digest: sha256(input.payload),
    event_digest: `sha256:${"0".repeat(64)}`,
  } as RequirementDiscoveryEvent;
  const parsed = requirementDiscoveryEventSchema.parse(withPayload) as RequirementDiscoveryEvent;
  return requirementDiscoveryEventSchema.parse({
    ...parsed,
    event_digest: eventDigest(parsed),
  }) as RequirementDiscoveryEvent;
}
