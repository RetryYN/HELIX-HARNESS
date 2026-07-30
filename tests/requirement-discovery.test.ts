import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createRequirementDiscoveryEvent,
  parseRequirementDiscoveryEvent,
  type RequirementDiscoveryEvent,
  type RequirementDiscoveryEventInput,
  rebuildRequirementCandidateProjection,
  requirementCandidateStates,
  requirementDiscoveryEventSchema,
  requirementDiscoveryEventTypes,
  surfaceKinds,
} from "../src/requirements/requirement-discovery";

// PLAN-L7-487-requirement-discovery-event-projection
const d = (character: string): `sha256:${string}` =>
  `sha256:${character.repeat(64)}` as `sha256:${string}`;

const human = {
  actor_id: "human-po",
  actor_kind: "human" as const,
  authority: "initiative-owner",
};
const ai = {
  actor_id: "requirement-worker",
  actor_kind: "ai" as const,
  authority: "proposal-only",
};

function append(
  events: RequirementDiscoveryEvent[],
  input: Omit<
    RequirementDiscoveryEventInput,
    "schema_version" | "sequence" | "previous_event_digest" | "occurred_at" | "initiative_id"
  >,
): RequirementDiscoveryEvent {
  const event = createRequirementDiscoveryEvent({
    ...input,
    schema_version: "helix-requirement-discovery-event.v1",
    initiative_id: "INIT-001",
    sequence: events.length + 1,
    occurred_at: `2026-07-30T00:00:${String(events.length).padStart(2, "0")}Z`,
    previous_event_digest: events.at(-1)?.event_digest ?? null,
  } as RequirementDiscoveryEventInput);
  events.push(event);
  return event;
}

function candidate(
  sourceEventId: string,
  state: (typeof requirementCandidateStates)[number] = "hypothesis",
) {
  return {
    candidate_id: "REQ-CAND-001",
    revision: 1,
    statement: "利用者は処理結果を確認できる",
    priority: "P0" as const,
    state,
    actor_ids: ["ACTOR-USER"],
    task_ids: ["TASK-CONFIRM"],
    surface_ids: ["SURFACE-CLI"],
    non_ui_na: false,
    source_event_ids: [sourceEventId],
    iteration: 0,
    semantic_digest: d("a"),
  };
}

function convergedStream(): RequirementDiscoveryEvent[] {
  const events: RequirementDiscoveryEvent[] = [];
  append(events, {
    event_id: "EV-001",
    iteration: 0,
    event_type: "initiative_ingested",
    actor: human,
    payload: {
      brief_ref: "docs/discovery/INIT-001/brief.md",
      brief_digest: d("b"),
      coverage: {
        actor_ids: ["ACTOR-USER"],
        task_ids: ["TASK-CONFIRM"],
        implicit_matrix_items: ["security", "recovery", "observability"],
        implicit_matrix_complete: true,
      },
    },
  });
  append(events, {
    event_id: "EV-002",
    iteration: 0,
    event_type: "requirement_candidate_created",
    actor: ai,
    payload: { candidate: candidate("EV-002") },
  });
  append(events, {
    event_id: "EV-003",
    iteration: 0,
    event_type: "question_asked",
    actor: ai,
    payload: {
      question: {
        question_id: "Q-001",
        question_class: "workflow",
        text: "失敗時に利用者が確認すべき情報は何ですか",
        reason: "failure flowを確定するため",
        affected_candidate_ids: ["REQ-CAND-001"],
        affected_surface_ids: ["SURFACE-CLI"],
        impact_if_unanswered: "失敗受入条件を確定できない",
        answer_type: "structured_text",
        suggested_answers: ["reason and retry route"],
        free_text_allowed: true,
        defer_allowed: false,
        selection_factors: {
          impact: 4,
          uncertainty: 3,
          downstream_change_cost: 4,
          human_only_decision: 3,
        },
        semantic_key: "workflow.failure.result",
      },
    },
  });
  append(events, {
    event_id: "EV-004",
    iteration: 0,
    event_type: "answer_recorded",
    actor: human,
    payload: {
      answer_id: "A-001",
      question_id: "Q-001",
      statement: "理由と再試行経路を表示する",
      authority: "initiative-owner",
      source_ref: "agreement://A-001",
    },
  });
  append(events, {
    event_id: "EV-005",
    iteration: 0,
    event_type: "prototype_generated",
    actor: ai,
    payload: {
      prototype: {
        prototype_id: "PROTO-001",
        revision: 1,
        surface_kind: "cli",
        artifact_ref: "docs/discovery/INIT-001/prototypes/cli-v1.txt",
        covered_candidate_ids: ["REQ-CAND-001"],
        actor_ids: ["ACTOR-USER"],
        action_ids: ["ACTION-RUN"],
        state_ids: ["RUNNING", "SUCCEEDED", "FAILED", "TIMED_OUT"],
        normal_flow: ["run", "succeeded"],
        cancel_flow: ["run", "cancelled"],
        failure_flow: ["run", "failed", "retry"],
        timeout_flow: ["run", "timed_out", "retry"],
        assumptions: [],
        unresolved_item_ids: [],
        artifact_digest: d("c"),
      },
    },
  });
  append(events, {
    event_id: "EV-006",
    iteration: 0,
    event_type: "prototype_reaction_recorded",
    actor: human,
    payload: {
      reaction: {
        reaction_id: "REACTION-001",
        prototype_id: "PROTO-001",
        prototype_revision: 1,
        actor_id: "ACTOR-USER",
        reaction_type: "accept",
        statement: "状態と再試行経路を確認できる",
        affected_region_or_action: "result",
        derived_candidate_ids: [],
        decision: "accept_candidate",
      },
    },
  });
  append(events, {
    event_id: "EV-007",
    iteration: 0,
    event_type: "candidate_accepted",
    actor: human,
    payload: {
      candidate_id: "REQ-CAND-001",
      rationale: "prototype walkthroughで要求意図を確認した",
    },
  });
  append(events, {
    event_id: "EV-008",
    iteration: 0,
    event_type: "prototype_agreement_recorded",
    actor: human,
    payload: {
      agreement: {
        agreement_id: "AGREE-001",
        accepted_candidate_ids: ["REQ-CAND-001"],
        rejected_candidate_ids: [],
        deferred_candidate_ids: [],
        accepted_prototype_revisions: [{ prototype_id: "PROTO-001", revision: 1 }],
        unresolved_item_ids: [],
        human_approver: "human-po",
        approved_at: "2026-07-30T00:00:08Z",
        source_event_digest: d("d"),
        ready_for_l3_compile: true,
      },
    },
  });
  append(events, {
    event_id: "EV-009",
    iteration: 1,
    event_type: "question_asked",
    actor: ai,
    payload: {
      question: {
        question_id: "Q-002",
        question_class: "operation",
        text: "運用引継ぎのownerは誰ですか",
        reason: "ownerを確定するため",
        affected_candidate_ids: ["REQ-CAND-001"],
        affected_surface_ids: [],
        impact_if_unanswered: "運用責任が未確定になる",
        answer_type: "actor_id",
        suggested_answers: ["operations-owner"],
        free_text_allowed: false,
        defer_allowed: true,
        selection_factors: {
          impact: 2,
          uncertainty: 2,
          downstream_change_cost: 2,
          human_only_decision: 4,
        },
        semantic_key: "operation.owner",
      },
    },
  });
  append(events, {
    event_id: "EV-010",
    iteration: 2,
    event_type: "answer_recorded",
    actor: human,
    payload: {
      answer_id: "A-002",
      question_id: "Q-002",
      statement: "operations-owner",
      authority: "initiative-owner",
      source_ref: "agreement://A-002",
    },
  });
  return events;
}

describe("Requirement Discovery event / candidate projection", () => {
  it("U-RDJ-000: keeps the shadow JSON schema aligned with the executable validator", () => {
    const schema = JSON.parse(
      readFileSync("config/requirement-discovery-event-schema.json", "utf8"),
    );
    expect(schema).toMatchObject({
      schema_version: "helix-requirement-discovery-schema.v1",
      status: "shadow_migration_contract",
      authority_boundary: {
        l1: "human_markdown",
        l2: "append_only_events_and_noncanonical_projection",
        l3: "strict_json_after_atomic_cutover",
        write_authority: "none",
      },
      event: {
        event_types: requirementDiscoveryEventTypes,
        append_only: true,
        additional_properties: false,
      },
      candidate: {
        lifecycle: requirementCandidateStates.slice(0, 7),
        side_or_terminal_states: requirementCandidateStates.slice(7),
        l2_forbidden_states: ["frozen"],
      },
      projection: {
        canonical: false,
        direct_update_allowed: false,
        numeric_score_forbidden: true,
      },
    });
    expect(Object.keys(schema.event.payload_required_by_type).sort()).toEqual(
      [...requirementDiscoveryEventTypes].sort(),
    );
    expect(schema.prototype.surface_kinds).toEqual(surfaceKinds);
    const l3Authority = readFileSync(
      "docs/design/helix/L3-requirements/requirement-discovery-json-authority.md",
      "utf8",
    );
    expect(l3Authority).toContain(
      "`screen/cli/api/event/batch/notification/external_service/none`",
    );
    expect(surfaceKinds).toEqual([
      "screen",
      "cli",
      "api",
      "event",
      "batch",
      "notification",
      "external_service",
      "none",
    ]);
  });

  it("U-RDJ-007: requires reason and reevaluation condition only for none surface", () => {
    const event = convergedStream()[4];
    expect(event?.event_type).toBe("prototype_generated");
    if (event?.event_type !== "prototype_generated") throw new Error("fixture mismatch");
    const prototype = event.payload.prototype;
    expect(() =>
      requirementDiscoveryEventSchema.parse({
        ...event,
        payload: { prototype: { ...prototype, surface_kind: "none" } },
      }),
    ).toThrow("none surface requires reason and reevaluation condition");
    expect(() =>
      requirementDiscoveryEventSchema.parse({
        ...event,
        payload: {
          prototype: {
            ...prototype,
            surface_kind: "none",
            none_reason: "no interaction surface",
            none_reevaluation_condition: "reassess when an interaction boundary appears",
          },
        },
      }),
    ).not.toThrow();
    expect(() =>
      requirementDiscoveryEventSchema.parse({
        ...event,
        payload: {
          prototype: {
            ...prototype,
            none_reason: "not applicable",
            none_reevaluation_condition: "later",
          },
        },
      }),
    ).toThrow("none surface fields are forbidden");
    const candidateEvent = convergedStream()[1];
    expect(candidateEvent?.event_type).toBe("requirement_candidate_created");
    if (candidateEvent?.event_type !== "requirement_candidate_created") {
      throw new Error("candidate fixture mismatch");
    }
    expect(() =>
      requirementDiscoveryEventSchema.parse({
        ...candidateEvent,
        payload: {
          candidate: {
            ...candidateEvent.payload.candidate,
            surface_ids: [],
            non_ui_na: true,
          },
        },
      }),
    ).toThrow("non-UI none requires reason and reevaluation condition");
  });

  it("U-RDJ-001: accepts the exact event vocabulary and rejects unknown fields", () => {
    expect(requirementDiscoveryEventTypes).toHaveLength(17);
    const event = convergedStream()[0];
    expect(parseRequirementDiscoveryEvent(event)).toEqual(event);
    expect(() => parseRequirementDiscoveryEvent({ ...event, silent_authority: true })).toThrow();
    expect(() =>
      parseRequirementDiscoveryEvent({ ...event, event_type: "candidate_overwritten" }),
    ).toThrow();
  });

  it("U-RDJ-002: deterministically rebuilds a non-canonical candidate projection", () => {
    const events = convergedStream();
    const first = rebuildRequirementCandidateProjection(events);
    const second = rebuildRequirementCandidateProjection(structuredClone(events));

    expect(first).toEqual(second);
    expect(first.schema_version).toBe("helix-requirement-candidate-projection.v1");
    expect(first.candidates["REQ-CAND-001"].state).toBe("accepted");
    expect(first.event_count).toBe(10);
    expect(first.convergence).toEqual({
      ready: true,
      checks: expect.objectContaining({
        actors_present: true,
        tasks_present: true,
        required_flows_present: true,
        stable_priority_iterations: true,
        human_prototype_agreement: true,
      }),
      blocking_reasons: [],
    });
  });

  it("U-RDJ-003: rejects mutation, truncation, sequence gaps, and mixed initiatives", () => {
    const events = convergedStream();
    const tampered = structuredClone(events);
    tampered[3].occurred_at = "2026-07-31T00:00:00Z";
    expect(() => rebuildRequirementCandidateProjection(tampered)).toThrow("event digest mismatch");

    expect(() => rebuildRequirementCandidateProjection(events.slice(1))).toThrow(
      "event sequence must be contiguous",
    );
    const mixed = structuredClone(events);
    mixed[4].initiative_id = "INIT-OTHER";
    expect(() => rebuildRequirementCandidateProjection(mixed)).toThrow(
      "mixed initiative event stream",
    );
  });

  it("U-RDJ-004: keeps acceptance and prototype agreement human-only", () => {
    const events = convergedStream();
    const accepted = events.find((event) => event.event_type === "candidate_accepted");
    if (!accepted) throw new Error("candidate acceptance fixture missing");
    const prefix = events.slice(0, accepted.sequence - 1);
    append(prefix, {
      event_id: "EV-AI-ACCEPT",
      iteration: accepted.iteration,
      event_type: "candidate_accepted",
      actor: ai,
      payload: accepted.payload,
    });
    expect(() => rebuildRequirementCandidateProjection(prefix)).toThrow(
      "candidate acceptance requires a human actor",
    );

    const splitFrozen = convergedStream().slice(0, 2);
    append(splitFrozen, {
      event_id: "EV-SPLIT-FROZEN",
      iteration: 1,
      event_type: "candidate_split",
      actor: ai,
      payload: {
        source_candidate_id: "REQ-CAND-001",
        children: [
          { ...candidate("EV-SPLIT-FROZEN", "frozen"), candidate_id: "REQ-CHILD-001" },
          { ...candidate("EV-SPLIT-FROZEN"), candidate_id: "REQ-CHILD-002" },
        ],
      },
    });
    expect(() => rebuildRequirementCandidateProjection(splitFrozen)).toThrow(
      "L2 cannot create a frozen candidate",
    );

    const splitOverwrite = convergedStream().slice(0, 2);
    append(splitOverwrite, {
      event_id: "EV-SPLIT-OVERWRITE",
      iteration: 1,
      event_type: "candidate_split",
      actor: ai,
      payload: {
        source_candidate_id: "REQ-CAND-001",
        children: [
          candidate("EV-SPLIT-OVERWRITE", "accepted"),
          { ...candidate("EV-SPLIT-OVERWRITE"), candidate_id: "REQ-CHILD-002" },
        ],
      },
    });
    expect(() => rebuildRequirementCandidateProjection(splitOverwrite)).toThrow(
      "candidate already exists",
    );

    const splitAccepted = convergedStream().slice(0, 2);
    append(splitAccepted, {
      event_id: "EV-SPLIT-AI-ACCEPTED",
      iteration: 1,
      event_type: "candidate_split",
      actor: ai,
      payload: {
        source_candidate_id: "REQ-CAND-001",
        children: [
          { ...candidate("EV-SPLIT-AI-ACCEPTED", "accepted"), candidate_id: "REQ-CHILD-001" },
          { ...candidate("EV-SPLIT-AI-ACCEPTED"), candidate_id: "REQ-CHILD-002" },
        ],
      },
    });
    expect(() => rebuildRequirementCandidateProjection(splitAccepted)).toThrow(
      "candidate accepted requires a human actor",
    );

    const mergedAccepted = convergedStream().slice(0, 2);
    append(mergedAccepted, {
      event_id: "EV-CANDIDATE-SECOND",
      iteration: 1,
      event_type: "requirement_candidate_created",
      actor: ai,
      payload: {
        candidate: { ...candidate("EV-CANDIDATE-SECOND"), candidate_id: "REQ-CAND-002" },
      },
    });
    append(mergedAccepted, {
      event_id: "EV-MERGED-AI-ACCEPTED",
      iteration: 1,
      event_type: "candidate_merged",
      actor: ai,
      payload: {
        source_candidate_ids: ["REQ-CAND-001", "REQ-CAND-002"],
        merged: {
          ...candidate("EV-MERGED-AI-ACCEPTED", "accepted"),
          candidate_id: "REQ-MERGED-001",
        },
      },
    });
    expect(() => rebuildRequirementCandidateProjection(mergedAccepted)).toThrow(
      "candidate accepted requires a human actor",
    );
  });

  it("U-RDJ-005: blocks duplicate questions, unknown answers, and L2 frozen candidates", () => {
    const events = convergedStream().slice(0, 3);
    const question = events[2];
    if (question.event_type !== "question_asked") throw new Error("question fixture missing");
    append(events, {
      event_id: "EV-DUPLICATE-QUESTION",
      iteration: 1,
      event_type: "question_asked",
      actor: ai,
      payload: { question: { ...question.payload.question, question_id: "Q-OTHER" } },
    });
    expect(() => rebuildRequirementCandidateProjection(events)).toThrow(
      "semantically duplicate question",
    );

    const frozen: RequirementDiscoveryEvent[] = [convergedStream()[0]];
    append(frozen, {
      event_id: "EV-FROZEN",
      iteration: 0,
      event_type: "requirement_candidate_created",
      actor: ai,
      payload: { candidate: candidate("EV-FROZEN", "frozen") },
    });
    expect(() => rebuildRequirementCandidateProjection(frozen)).toThrow(
      "L2 cannot create a frozen candidate",
    );
  });

  it("U-RDJ-006: retains typed blockers instead of using a numeric convergence score", () => {
    const events = convergedStream().slice(0, 7);
    const projection = rebuildRequirementCandidateProjection(events);
    expect(projection.convergence.ready).toBe(false);
    expect(projection.convergence.blocking_reasons).toContain("stable_priority_iterations");
    expect(projection.convergence.blocking_reasons).toContain("human_prototype_agreement");
    expect(projection.convergence).not.toHaveProperty("score");
  });
});
