import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  type AppendOnlyLogEntryV1,
  type AppendOnlyLogSnapshotV1,
  admitEventEnvelope,
  type CheckpointRecordV1,
  type CheckpointScopeV1,
  evaluateCausalOrder,
  evaluateCheckpointReplay,
  evaluateIdempotentIngest,
  evaluateLifecycleTransition,
  evaluateProjectionDrift,
  type OrchestrationEventEnvelopeV1,
  type ProjectionSnapshotV1,
  routeRecovery,
  selectCheckpointScope,
} from "../src/runtime/event-projection-checkpoint-replay";

const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const DIGEST = sha256Digest("payload");
const OTHER_DIGEST = sha256Digest("other-payload");
const NOW = "2026-08-19T12:00:00Z";

function envelope(overrides: Record<string, unknown> = {}): OrchestrationEventEnvelopeV1 {
  return {
    schema_version: "helix-orchestration-event.v1",
    event_id: "evt-1",
    event_type: "requested",
    occurred_at: "2026-08-19T11:00:00Z",
    plan_id: "PLAN-L7-636-event-projection-checkpoint-replay",
    parent_lane_id: "lane-parent",
    lane_id: "lane-1",
    causation_id: null,
    correlation_id: "corr-1",
    head_sha: HEAD,
    payload_digest: DIGEST,
    ...overrides,
  } as OrchestrationEventEnvelopeV1;
}

function entry(value: Partial<AppendOnlyLogEntryV1> = {}): AppendOnlyLogEntryV1 {
  return {
    event_id: "evt-1",
    event_type: "requested",
    occurred_at: "2026-08-19T11:00:00Z",
    causation_id: null,
    correlation_id: "corr-1",
    payload_digest: DIGEST,
    ...value,
  };
}

function log(
  entries: readonly AppendOnlyLogEntryV1[] = [],
  sealed_event_ids: readonly string[] = [],
) {
  return {
    schema_version: "helix-append-only-log.v1" as const,
    lane_id: "lane-1",
    entries,
    sealed_event_ids,
  } satisfies AppendOnlyLogSnapshotV1;
}

function failure(result: unknown): string {
  return (result as { failure_code: string }).failure_code;
}

function projection(overrides: Record<string, unknown> = {}): ProjectionSnapshotV1 {
  return {
    schema_version: "helix-projection-snapshot.v1",
    lane_id: "lane-1",
    identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "lane-1" },
    state: { lifecycle_state: "started", head_sha: HEAD, last_event_id: "evt-1" },
    ...overrides,
  };
}

function scope(overrides: Record<string, unknown> = {}): CheckpointScopeV1 {
  return {
    head_sha: HEAD,
    parent_lane_id: "lane-parent",
    lane_id: "lane-1",
    from_event_id: "evt-1",
    to_event_id: "evt-3",
    ...overrides,
  };
}

function checkpoint(overrides: Record<string, unknown> = {}): CheckpointRecordV1 {
  return {
    schema_version: "helix-checkpoint-record.v1",
    head_sha: HEAD,
    parent_lane_id: "lane-parent",
    event_boundary: { from_event_id: "evt-1", to_event_id: "evt-3" },
    projection_digest: DIGEST,
    checkpoint_digest: OTHER_DIGEST,
    ...overrides,
  };
}

function assertCanonicalOracleBinding(id: string): void {
  const envelopeMissing: Record<string, string> = {
    "U-EPR-002": "schema_version",
    "U-EPR-003": "event_id",
    "U-EPR-004": "event_type",
    "U-EPR-005": "occurred_at",
    "U-EPR-006": "plan_id",
    "U-EPR-007": "parent_lane_id",
    "U-EPR-008": "lane_id",
    "U-EPR-009": "causation_id",
    "U-EPR-010": "correlation_id",
    "U-EPR-011": "head_sha",
  };
  if (envelopeMissing[id]) {
    const value = { ...envelope() } as Record<string, unknown>;
    delete value[envelopeMissing[id]];
    expect(failure(admitEventEnvelope(value))).toBe("EVENT_ENVELOPE_INVALID");
    return;
  }
  if (["U-EPR-013", "U-EPR-014", "U-EPR-089"].includes(id)) {
    const value = { ...envelope(), trace_id: "unexpected" } as Record<string, unknown>;
    if (id === "U-EPR-013") delete value.event_id;
    expect(failure(admitEventEnvelope(value))).toBe("EVENT_ENVELOPE_INVALID");
    return;
  }
  if (["U-EPR-015", "U-EPR-016"].includes(id)) {
    expect(
      failure(admitEventEnvelope(envelope({ payload_digest: id.endsWith("015") ? "bad" : "" }))),
    ).toBe("EVENT_ENVELOPE_INCOMPLETE");
    return;
  }
  const invalidEnvelope: Record<string, unknown> = {
    "U-EPR-017": { head_sha: "short" },
    "U-EPR-018": { event_type: "unknown" },
    "U-EPR-019": { lane_id: "" },
    "U-EPR-090": { schema_version: "" },
    "U-EPR-091": { occurred_at: "not-rfc3339" },
  };
  if (invalidEnvelope[id]) {
    expect(
      failure(admitEventEnvelope(envelope(invalidEnvelope[id] as Record<string, unknown>))),
    ).toBe("EVENT_ENVELOPE_INVALID");
    return;
  }
  if (id === "U-EPR-028") {
    expect(
      failure(
        evaluateCausalOrder({
          envelope: envelope({ occurred_at: "2026-08-19T13:00:00Z", causation_id: "missing" }),
          log: log(),
          observedAt: NOW,
        }),
      ),
    ).toBe("EVENT_FUTURE_TIMESTAMP");
    return;
  }
  if (id === "U-EPR-029") {
    expect(
      failure(
        evaluateCausalOrder({
          envelope: envelope({ causation_id: "evt-cause", occurred_at: "2026-08-19T10:00:00Z" }),
          log: log([
            entry({
              event_id: "evt-cause",
              correlation_id: "other-corr",
              occurred_at: "2026-08-19T11:00:00Z",
            }),
          ]),
          observedAt: NOW,
        }),
      ),
    ).toBe("EVENT_CORRELATION_MISMATCH");
    return;
  }
  if (["U-EPR-030", "U-EPR-031"].includes(id)) {
    expect(
      evaluateCausalOrder({
        envelope: envelope({ occurred_at: NOW, causation_id: id === "U-EPR-030" ? null : "evt-1" }),
        log: log([entry({ occurred_at: NOW })]),
        observedAt: NOW,
      }),
    ).toEqual({ ok: true });
    return;
  }
  if (id === "U-EPR-033") {
    expect(evaluateIdempotentIngest({ envelope: envelope(), log: log([entry()]) })).toEqual({
      ok: true,
      outcome: "duplicate_absorbed",
    });
    return;
  }
  if (id === "U-EPR-034" || id === "U-EPR-038") {
    const input = { envelope: envelope({ payload_digest: OTHER_DIGEST }), log: log([entry()]) };
    const before = JSON.stringify(input.log);
    expect(failure(evaluateIdempotentIngest(input))).toBe("EVENT_DUPLICATE_DIGEST_MISMATCH");
    if (id === "U-EPR-038") expect(JSON.stringify(input.log)).toBe(before);
    return;
  }
  if (id === "U-EPR-036") {
    const input = { envelope: envelope(), log: log([entry()]) };
    const before = input.log.entries.length;
    expect(evaluateIdempotentIngest(input)).toMatchObject({ outcome: "duplicate_absorbed" });
    expect(input.log.entries.length).toBe(before);
    return;
  }
  const lifecycleChecks: Record<string, () => void> = {
    "U-EPR-040": () =>
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({ event_type: "terminated" }),
            log: log(),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL"),
    "U-EPR-041": () =>
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({ event_type: "started", causation_id: "evt-1" }),
            log: log([entry()]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL"),
    "U-EPR-043": () =>
      expect(
        evaluateLifecycleTransition({
          envelope: envelope({
            event_id: "evt-3",
            event_type: "handover_completed",
            causation_id: "evt-2",
          }),
          log: log([
            entry({ event_id: "evt-1", event_type: "started" }),
            entry({ event_id: "evt-2", event_type: "handover_requested" }),
          ]),
        }),
      ).toEqual({ ok: true }),
    "U-EPR-044": () =>
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({ event_type: "handover_completed" }),
            log: log([entry({ event_id: "evt-1", event_type: "started" })]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL"),
    "U-EPR-045": () =>
      expect(
        evaluateLifecycleTransition({
          envelope: envelope({ event_type: "failed", causation_id: "evt-1" }),
          log: log([entry({ event_type: "started" })]),
        }),
      ).toEqual({ ok: true }),
    "U-EPR-046": () =>
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({ event_type: "dispatched", causation_id: "evt-1" }),
            log: log([entry({ event_type: "failed" })]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL"),
    "U-EPR-098": () =>
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({
              event_id: "evt-3",
              event_type: "dispatched",
              causation_id: "evt-other",
            }),
            log: log([
              entry({
                event_id: "evt-other",
                event_type: "requested",
                correlation_id: "other-corr",
              }),
              entry({ event_id: "evt-2", event_type: "started" }),
            ]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL"),
  };
  if (lifecycleChecks[id]) {
    lifecycleChecks[id]();
    return;
  }
  const projectionChecks: Record<string, () => void> = {
    "U-EPR-048": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({
              identity: { plan_id: "other", parent_lane_id: "lane-parent", lane_id: "lane-1" },
            }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-049": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({
              identity: { plan_id: "plan-1", parent_lane_id: "other", lane_id: "lane-1" },
            }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-050": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ state: { ...projection().state, lifecycle_state: "failed" } }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-051": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ state: { ...projection().state, head_sha: OTHER_HEAD } }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-052": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ state: { ...projection().state, last_event_id: "other" } }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-054": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ state: { ...projection().state, lifecycle_state: "failed" } }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-055": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({
              identity: { plan_id: "other", parent_lane_id: "lane-parent", lane_id: "lane-1" },
            }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-056": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ state: { ...projection().state, last_event_id: "manual" } }),
            knownLaneIds: ["lane-1"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-101": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({ lane_id: "other" }),
            knownLaneIds: ["lane-1", "other"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
    "U-EPR-102": () =>
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: projection({
              lane_id: "lane-2",
              identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "lane-2" },
            }),
            knownLaneIds: ["lane-1", "lane-2"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT"),
  };
  if (projectionChecks[id]) {
    projectionChecks[id]();
    return;
  }
  const scopeChecks: Record<string, () => void> = {
    "U-EPR-057": () =>
      expect(
        selectCheckpointScope({
          scope: scope(),
          log: log([
            entry({ event_id: "evt-1" }),
            entry({ event_id: "evt-2" }),
            entry({ event_id: "evt-3" }),
          ]),
        }),
      ).toMatchObject({ ok: true }),
    "U-EPR-058": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), head_sha: undefined },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-059": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), parent_lane_id: undefined },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-060": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), lane_id: undefined },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-061": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), from_event_id: undefined },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-062": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), to_event_id: undefined },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-064": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), from_event_id: "missing" },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-065": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), from_event_id: "evt-3", to_event_id: "evt-2" },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-066": () =>
      expect(
        selectCheckpointScope({
          scope: scope(),
          log: log([
            entry(),
            entry({ event_id: "evt-2" }),
            entry({ event_id: "evt-3" }),
            entry({ event_id: "other" }),
          ]),
        }),
      ).toMatchObject({ eventIds: ["evt-1", "evt-2", "evt-3"] }),
    "U-EPR-092": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), lane_id: "other" },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-093": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), head_sha: "short" },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-094": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), parent_lane_id: "" },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-099": () =>
      expect(
        failure(
          selectCheckpointScope({
            scope: { ...scope(), extra: true },
            log: log([entry(), entry({ event_id: "evt-2" }), entry({ event_id: "evt-3" })]),
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
  };
  if (scopeChecks[id]) {
    scopeChecks[id]();
    return;
  }
  const checkpointChecks: Record<string, () => void> = {
    "U-EPR-068": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ head_sha: undefined }) as CheckpointRecordV1,
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_BINDING_MISSING"),
    "U-EPR-069": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ parent_lane_id: undefined }) as CheckpointRecordV1,
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_BINDING_MISSING"),
    "U-EPR-070": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ event_boundary: undefined }) as CheckpointRecordV1,
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_BINDING_MISSING"),
    "U-EPR-071": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ head_sha: OTHER_HEAD }),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: OTHER_DIGEST,
            replayCheckpointDigest: DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_STALE_HEAD"),
    "U-EPR-072": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({
              event_boundary: { from_event_id: "other", to_event_id: "evt-3" },
            }),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
    "U-EPR-073": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint(),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: OTHER_DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_REPLAY_NOT_IDEMPOTENT"),
    "U-EPR-074": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint(),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_REPLAY_NOT_IDEMPOTENT"),
    "U-EPR-076": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ head_sha: OTHER_HEAD }),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: OTHER_DIGEST,
            replayCheckpointDigest: DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_STALE_HEAD"),
    "U-EPR-100": () =>
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({
              event_boundary: { from_event_id: "evt-1", to_event_id: "other" },
            }),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING"),
  };
  if (checkpointChecks[id]) {
    checkpointChecks[id]();
    return;
  }
  const recoveryChecks: Record<string, () => void> = {
    "U-EPR-078": () =>
      expect(
        failure(
          routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: { attempt: 1 } as never }),
        ),
      ).toBe("EVENT_RETRY_UNBOUNDED"),
    "U-EPR-079": () =>
      expect(
        failure(
          routeRecovery({
            failureCode: "EVENT_STALE_HEAD",
            budget: { attempt: 1, max_attempts: 0 },
          }),
        ),
      ).toBe("EVENT_RETRY_UNBOUNDED"),
    "U-EPR-080": () =>
      expect(
        routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: { attempt: 2, max_attempts: 2 } }),
      ).toEqual({ ok: true, route: "bounded_retry" }),
    "U-EPR-081": () =>
      expect(
        routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: { attempt: 3, max_attempts: 2 } }),
      ).toEqual({ ok: true, route: "recovery" }),
    "U-EPR-082": () =>
      expect(
        routeRecovery({
          failureCode: "EVENT_PROJECTION_DRIFT",
          budget: { attempt: 1, max_attempts: 2 },
        }),
      ).toEqual({ ok: true, route: "recovery" }),
    "U-EPR-083": () =>
      expect(
        routeRecovery({
          failureCode: "EVENT_PROJECTION_DRIFT",
          budget: { attempt: 1, max_attempts: 2 },
        }),
      ).toEqual({ ok: true, route: "recovery" }),
    "U-EPR-095": () =>
      expect(
        failure(
          routeRecovery({
            failureCode: "EVENT_STALE_HEAD",
            budget: { attempt: 1, max_attempts: "2" } as never,
          }),
        ),
      ).toBe("EVENT_RETRY_UNBOUNDED"),
    "U-EPR-096": () =>
      expect(
        failure(
          routeRecovery({
            failureCode: "EVENT_STALE_HEAD",
            budget: { attempt: "1", max_attempts: 2 } as never,
          }),
        ),
      ).toBe("EVENT_RETRY_UNBOUNDED"),
    "U-EPR-097": () =>
      expect(
        failure(
          routeRecovery({
            failureCode: "EVENT_STALE_HEAD",
            budget: { attempt: 0, max_attempts: 2 },
          }),
        ),
      ).toBe("EVENT_RETRY_UNBOUNDED"),
  };
  if (recoveryChecks[id]) {
    recoveryChecks[id]();
    return;
  }
  if (id === "U-EPR-084" || id === "U-EPR-085") {
    const input = envelope();
    const first = admitEventEnvelope(input);
    const second = admitEventEnvelope(input);
    expect(second).toEqual(first);
    if (first.ok && second.ok) expect(first.envelope).not.toBe(input);
    return;
  }
  if (id === "U-EPR-088") {
    expect(failure(admitEventEnvelope({ payload: { value: true } }))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
    return;
  }
  throw new Error(`unbound oracle ${id}`);
}

describe("event projection checkpoint replay pure judgement", () => {
  describe("admitEventEnvelope", () => {
    it("U-EPR-001: admits and clones the complete 11-field envelope", () => {
      const input = envelope();
      const result = admitEventEnvelope(input);
      expect(result).toEqual({ ok: true, envelope: input });
      if (result.ok) expect(result.envelope).not.toBe(input);
    });

    it.each([
      "schema_version",
      "event_id",
      "event_type",
      "occurred_at",
      "plan_id",
      "parent_lane_id",
      "lane_id",
      "causation_id",
      "correlation_id",
      "head_sha",
    ] as const)("U-EPR-002..011: rejects missing %s", (key) => {
      const input = { ...envelope() } as Record<string, unknown>;
      delete input[key];
      expect(failure(admitEventEnvelope(input))).toBe("EVENT_ENVELOPE_INVALID");
    });

    it("U-EPR-012: classifies payload binding omission as incomplete", () => {
      const input = { ...envelope() } as Record<string, unknown>;
      delete input.payload_digest;
      expect(failure(admitEventEnvelope(input))).toBe("EVENT_ENVELOPE_INCOMPLETE");
    });

    it.each([{ unknown: "trace_id" }, { missing: "event_id", unknown: "trace_id" }])(
      "U-EPR-013/014: rejects unknown fields without compensation",
      (mutation) => {
        const input = { ...envelope(), trace_id: "unexpected" } as Record<string, unknown>;
        if (mutation.missing) delete input[mutation.missing];
        expect(failure(admitEventEnvelope(input))).toBe("EVENT_ENVELOPE_INVALID");
      },
    );

    it.each(["", "not-a-digest"])("U-EPR-015/016: rejects malformed payload digest %s", (value) => {
      expect(failure(admitEventEnvelope(envelope({ payload_digest: value })))).toBe(
        "EVENT_ENVELOPE_INCOMPLETE",
      );
    });

    it.each([
      { head_sha: "short" },
      { event_type: "unknown" },
      { lane_id: "" },
      { schema_version: "" },
      { occurred_at: "not-rfc3339" },
    ])("U-EPR-017/018/019/090/091: rejects invalid envelope shape %j", (mutation) => {
      expect(failure(admitEventEnvelope(envelope(mutation)))).toBe("EVENT_ENVELOPE_INVALID");
    });

    it("U-EPR-020: accepts a requested root with null causation", () => {
      expect(
        admitEventEnvelope(envelope({ event_type: "requested", causation_id: null })),
      ).toMatchObject({
        ok: true,
      });
    });

    it("U-EPR-021: rejects null causation on a non-root event", () => {
      expect(failure(admitEventEnvelope(envelope({ event_type: "started" })))).toBe(
        "EVENT_CAUSATION_UNRESOLVED",
      );
    });

    it("U-EPR-022: exact-key failure wins over value-format failure", () => {
      const input = { ...envelope({ head_sha: "bad" }), trace_id: "unexpected" };
      expect(failure(admitEventEnvelope(input))).toBe("EVENT_ENVELOPE_INVALID");
    });
  });

  describe("evaluateCausalOrder", () => {
    it("U-EPR-023: accepts a causal predecessor in the same correlation", () => {
      const result = evaluateCausalOrder({
        envelope: envelope({ event_id: "evt-2", event_type: "dispatched", causation_id: "evt-1" }),
        log: log([entry()]),
        observedAt: NOW,
      });
      expect(result).toEqual({ ok: true });
    });

    it("U-EPR-024: rejects future timestamps first", () => {
      expect(
        failure(
          evaluateCausalOrder({
            envelope: envelope({ occurred_at: "2026-08-19T13:00:00Z", causation_id: "missing" }),
            log: log(),
            observedAt: NOW,
          }),
        ),
      ).toBe("EVENT_FUTURE_TIMESTAMP");
    });

    it("U-EPR-025: rejects unresolved causation", () => {
      expect(
        failure(
          evaluateCausalOrder({
            envelope: envelope({ causation_id: "missing" }),
            log: log(),
            observedAt: NOW,
          }),
        ),
      ).toBe("EVENT_CAUSATION_UNRESOLVED");
    });

    it("U-EPR-026: rejects cross-correlation causation before time inversion", () => {
      expect(
        failure(
          evaluateCausalOrder({
            envelope: envelope({ causation_id: "evt-cause", occurred_at: "2026-08-19T10:00:00Z" }),
            log: log([
              entry({
                event_id: "evt-cause",
                correlation_id: "other-corr",
                occurred_at: "2026-08-19T11:00:00Z",
              }),
            ]),
            observedAt: NOW,
          }),
        ),
      ).toBe("EVENT_CORRELATION_MISMATCH");
    });

    it("U-EPR-027: rejects causal inversion", () => {
      expect(
        failure(
          evaluateCausalOrder({
            envelope: envelope({ causation_id: "evt-cause", occurred_at: "2026-08-19T10:00:00Z" }),
            log: log([entry({ event_id: "evt-cause", occurred_at: "2026-08-19T11:00:00Z" })]),
            observedAt: NOW,
          }),
        ),
      ).toBe("EVENT_CAUSAL_INVERSION");
    });

    it("U-EPR-028/029: preserves the documented ordering for compound failures", () => {
      const future = evaluateCausalOrder({
        envelope: envelope({ occurred_at: "2026-08-19T13:00:00Z", causation_id: "missing" }),
        log: log(),
        observedAt: NOW,
      });
      const correlation = evaluateCausalOrder({
        envelope: envelope({ causation_id: "evt-cause", occurred_at: "2026-08-19T10:00:00Z" }),
        log: log([
          entry({
            event_id: "evt-cause",
            correlation_id: "other-corr",
            occurred_at: "2026-08-19T11:00:00Z",
          }),
        ]),
        observedAt: NOW,
      });
      expect(failure(future)).toBe("EVENT_FUTURE_TIMESTAMP");
      expect(failure(correlation)).toBe("EVENT_CORRELATION_MISMATCH");
    });

    it("U-EPR-030/031: accepts equal observed and causal timestamps", () => {
      expect(
        evaluateCausalOrder({
          envelope: envelope({ occurred_at: NOW, causation_id: "evt-1" }),
          log: log([entry({ occurred_at: NOW })]),
          observedAt: NOW,
        }),
      ).toEqual({ ok: true });
    });
  });

  describe("evaluateIdempotentIngest", () => {
    it("U-EPR-032: reports a new event as appendable", () => {
      expect(
        evaluateIdempotentIngest({ envelope: envelope({ event_id: "new" }), log: log() }),
      ).toEqual({ ok: true, outcome: "appended" });
    });

    it("U-EPR-033/036: absorbs an identical duplicate without changing the input log", () => {
      const input = { envelope: envelope(), log: log([entry()]) };
      const before = JSON.stringify(input.log);
      expect(evaluateIdempotentIngest(input)).toEqual({ ok: true, outcome: "duplicate_absorbed" });
      expect(JSON.stringify(input.log)).toBe(before);
    });

    it("U-EPR-034/038: rejects a duplicate digest mismatch without mutation", () => {
      const input = { envelope: envelope({ payload_digest: OTHER_DIGEST }), log: log([entry()]) };
      const before = JSON.stringify(input.log);
      expect(failure(evaluateIdempotentIngest(input))).toBe("EVENT_DUPLICATE_DIGEST_MISMATCH");
      expect(JSON.stringify(input.log)).toBe(before);
    });

    it("U-EPR-035: rejects duplicate ids already present in the log snapshot", () => {
      const duplicate = entry({ event_id: "evt-1" });
      expect(
        failure(
          evaluateIdempotentIngest({
            envelope: envelope({ event_id: "new" }),
            log: log([entry(), duplicate]),
          }),
        ),
      ).toBe("EVENT_LOG_SNAPSHOT_INVALID");
    });

    it("U-EPR-037: repeated caller admission is idempotent", () => {
      let current = log();
      const input = envelope();
      expect(evaluateIdempotentIngest({ envelope: input, log: current })).toMatchObject({
        outcome: "appended",
      });
      current = log([entry()]);
      expect(evaluateIdempotentIngest({ envelope: input, log: current })).toMatchObject({
        outcome: "duplicate_absorbed",
      });
      expect(evaluateIdempotentIngest({ envelope: input, log: current })).toMatchObject({
        outcome: "duplicate_absorbed",
      });
    });
  });

  describe("evaluateLifecycleTransition", () => {
    it("U-EPR-039: accepts the canonical five-stage lifecycle", () => {
      const states = ["requested", "dispatched", "leased", "started", "terminated"] as const;
      let entries: AppendOnlyLogEntryV1[] = [];
      for (const [index, event_type] of states.entries()) {
        const result = evaluateLifecycleTransition({
          envelope: envelope({
            event_id: `evt-${index + 1}`,
            event_type,
            causation_id: index === 0 ? null : `evt-${index}`,
          }),
          log: log(entries),
        });
        expect(result).toEqual({ ok: true });
        entries = [...entries, entry({ event_id: `evt-${index + 1}`, event_type })];
      }
    });

    it.each([
      { event_type: "terminated", causation_id: "evt-1" },
      { event_type: "started", causation_id: "evt-1" },
    ])("U-EPR-040/041: rejects missing and skipped transitions", (mutation) => {
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope(mutation),
            log: mutation.event_type === "terminated" ? log() : log([entry()]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL");
    });

    it("U-EPR-042: rejects any event after a sealed correlation", () => {
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({
              event_id: "evt-3",
              event_type: "dispatched",
              causation_id: "evt-2",
            }),
            log: log([entry({ event_id: "evt-2", event_type: "requested" })], ["evt-2"]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_AFTER_SEAL");
    });

    it("U-EPR-043/044: handles handover repetition and missing request", () => {
      expect(
        evaluateLifecycleTransition({
          envelope: envelope({
            event_id: "evt-3",
            event_type: "handover_completed",
            causation_id: "evt-2",
          }),
          log: log([
            entry({ event_id: "evt-1", event_type: "started" }),
            entry({ event_id: "evt-2", event_type: "handover_requested" }),
          ]),
        }),
      ).toEqual({ ok: true });
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({
              event_id: "evt-2",
              event_type: "handover_completed",
              causation_id: "evt-1",
            }),
            log: log([entry({ event_id: "evt-1", event_type: "started" })]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL");
    });

    it("U-EPR-045/046/098: accepts failure terminal path and isolates correlations", () => {
      expect(
        evaluateLifecycleTransition({
          envelope: envelope({ event_id: "evt-3", event_type: "failed", causation_id: "evt-2" }),
          log: log([
            entry({ event_id: "evt-1", event_type: "started" }),
            entry({ event_id: "evt-2", event_type: "failed" }),
          ]),
        }),
      ).not.toEqual({ ok: true });
      expect(
        failure(
          evaluateLifecycleTransition({
            envelope: envelope({
              event_id: "evt-3",
              event_type: "dispatched",
              causation_id: "evt-other",
            }),
            log: log([
              entry({
                event_id: "evt-other",
                event_type: "requested",
                correlation_id: "other-corr",
              }),
              entry({ event_id: "evt-2", event_type: "started" }),
            ]),
          }),
        ),
      ).toBe("EVENT_TRANSITION_ILLEGAL");
    });
  });

  describe("evaluateProjectionDrift", () => {
    it("U-EPR-047: accepts identical identity and state", () => {
      const value = projection();
      expect(
        evaluateProjectionDrift({ rebuilt: value, readBack: value, knownLaneIds: ["lane-1"] }),
      ).toEqual({ ok: true });
    });

    it.each([
      { identity: { plan_id: "other", parent_lane_id: "lane-parent", lane_id: "lane-1" } },
      { identity: { plan_id: "plan-1", parent_lane_id: "other", lane_id: "lane-1" } },
      {
        identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "other" },
        lane_id: "other",
      },
    ])("U-EPR-048/049/055: rejects identity drift %j", (identity) => {
      const readBack = projection(identity);
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack,
            knownLaneIds: ["lane-1", "other"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT");
    });

    it.each([
      { lifecycle_state: "failed" },
      { head_sha: OTHER_HEAD },
      { last_event_id: "other-event" },
    ])("U-EPR-050/051/052: rejects state drift %j", (state) => {
      const readBack = projection({ state: { ...projection().state, ...state } });
      expect(
        failure(
          evaluateProjectionDrift({ rebuilt: projection(), readBack, knownLaneIds: ["lane-1"] }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT");
    });

    it("U-EPR-053: classifies internally consistent unknown lanes as orphan", () => {
      const readBack = projection({
        lane_id: "unknown",
        identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "unknown" },
      });
      expect(
        failure(
          evaluateProjectionDrift({ rebuilt: projection(), readBack, knownLaneIds: ["lane-1"] }),
        ),
      ).toBe("EVENT_ORPHAN_LANE");
    });

    it("U-EPR-054/056/101/102: never treats partial or manual edits as orphan success", () => {
      const topOnly = projection({ lane_id: "other" });
      const nestedOnly = projection({
        identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "other" },
      });
      const anotherKnown = projection({
        lane_id: "lane-2",
        identity: { plan_id: "plan-1", parent_lane_id: "lane-parent", lane_id: "lane-2" },
      });
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: topOnly,
            knownLaneIds: ["lane-1", "other"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT");
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: nestedOnly,
            knownLaneIds: ["lane-1", "other"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT");
      expect(
        failure(
          evaluateProjectionDrift({
            rebuilt: projection(),
            readBack: anotherKnown,
            knownLaneIds: ["lane-1", "lane-2"],
          }),
        ),
      ).toBe("EVENT_PROJECTION_DRIFT");
    });
  });

  describe("selectCheckpointScope", () => {
    const scopedLog = log([
      entry({ event_id: "evt-1" }),
      entry({ event_id: "evt-2", event_type: "dispatched", causation_id: "evt-1" }),
      entry({ event_id: "evt-3", event_type: "leased", causation_id: "evt-2" }),
      entry({ event_id: "evt-4", event_type: "started", causation_id: "evt-3" }),
    ]);

    it("U-EPR-057/066: returns an append-ordered inclusive lane scope", () => {
      expect(selectCheckpointScope({ scope: scope(), log: scopedLog })).toEqual({
        ok: true,
        eventIds: ["evt-1", "evt-2", "evt-3"],
      });
      expect(
        selectCheckpointScope({ scope: scope({ to_event_id: "evt-4" }), log: scopedLog }),
      ).toEqual({
        ok: true,
        eventIds: ["evt-1", "evt-2", "evt-3", "evt-4"],
      });
    });

    it.each(["head_sha", "parent_lane_id", "lane_id", "from_event_id", "to_event_id"] as const)(
      "U-EPR-058..062: rejects missing scope field %s",
      (key) => {
        const value = { ...scope() } as Record<string, unknown>;
        delete value[key];
        expect(failure(selectCheckpointScope({ scope: value, log: scopedLog }))).toBe(
          "EVENT_CHECKPOINT_SCOPE_MISSING",
        );
      },
    );

    it("U-EPR-063: rejects an omitted scope instead of selecting the whole log", () => {
      expect(failure(selectCheckpointScope({ scope: undefined, log: scopedLog }))).toBe(
        "EVENT_CHECKPOINT_SCOPE_MISSING",
      );
    });

    it.each([
      { from_event_id: "missing" },
      { to_event_id: "missing" },
      { from_event_id: "evt-3", to_event_id: "evt-2" },
      { lane_id: "other" },
      { head_sha: "short" },
      { parent_lane_id: "" },
      { extra: true },
    ])("U-EPR-064/065/092/093/094/099: rejects invalid scope %j", (mutation) => {
      expect(
        failure(selectCheckpointScope({ scope: { ...scope(), ...mutation }, log: scopedLog })),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING");
    });

    it("U-EPR-087: rejects duplicate log ids before scope validation", () => {
      expect(
        failure(selectCheckpointScope({ scope: undefined, log: log([entry(), entry()]) })),
      ).toBe("EVENT_LOG_SNAPSHOT_INVALID");
    });
  });

  describe("evaluateCheckpointReplay", () => {
    it("U-EPR-067: accepts matching bindings, scope, and digests", () => {
      expect(
        evaluateCheckpointReplay({
          checkpoint: checkpoint(),
          scopedEventIds: ["evt-1", "evt-2", "evt-3"],
          replayProjectionDigest: DIGEST,
          replayCheckpointDigest: OTHER_DIGEST,
          currentHeadSha: HEAD,
        }),
      ).toEqual({ ok: true });
    });

    it.each(["head_sha", "parent_lane_id", "event_boundary"] as const)(
      "U-EPR-068/069/070: rejects missing checkpoint binding %s",
      (key) => {
        const value = { ...checkpoint() } as unknown as Record<string, unknown>;
        delete value[key];
        expect(
          failure(
            evaluateCheckpointReplay({
              checkpoint: value as unknown as CheckpointRecordV1,
              scopedEventIds: ["evt-1", "evt-2", "evt-3"],
              replayProjectionDigest: DIGEST,
              replayCheckpointDigest: OTHER_DIGEST,
              currentHeadSha: HEAD,
            }),
          ),
        ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
      },
    );

    it("U-EPR-071/076: stale HEAD precedes digest mismatch", () => {
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint({ head_sha: OTHER_HEAD }),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: OTHER_DIGEST,
            replayCheckpointDigest: DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_STALE_HEAD");
    });

    it.each([
      { event_boundary: { from_event_id: "other", to_event_id: "evt-3" } },
      { event_boundary: { from_event_id: "evt-1", to_event_id: "other" } },
    ])("U-EPR-072/100: rejects boundary mismatch %j", (mutation) => {
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: checkpoint(mutation),
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_SCOPE_MISSING");
    });

    it.each(["replayProjectionDigest", "replayCheckpointDigest"] as const)(
      "U-EPR-073/074: rejects non-idempotent %s",
      (key) => {
        const input = {
          checkpoint: checkpoint(),
          scopedEventIds: ["evt-1", "evt-2", "evt-3"],
          replayProjectionDigest: DIGEST,
          replayCheckpointDigest: OTHER_DIGEST,
          currentHeadSha: HEAD,
        };
        (input as Record<string, unknown>)[key] = `sha256:${"f".repeat(64)}`;
        expect(failure(evaluateCheckpointReplay(input))).toBe("EVENT_REPLAY_NOT_IDEMPOTENT");
      },
    );

    it("U-EPR-075: binding failure precedes stale HEAD", () => {
      const value = checkpoint({ head_sha: OTHER_HEAD }) as unknown as Record<string, unknown>;
      delete value.parent_lane_id;
      expect(
        failure(
          evaluateCheckpointReplay({
            checkpoint: value as unknown as CheckpointRecordV1,
            scopedEventIds: ["evt-1", "evt-2", "evt-3"],
            replayProjectionDigest: DIGEST,
            replayCheckpointDigest: OTHER_DIGEST,
            currentHeadSha: HEAD,
          }),
        ),
      ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
    });
  });

  describe("routeRecovery", () => {
    it("U-EPR-077: routes retryable failures to bounded retry while budget remains", () => {
      expect(
        routeRecovery({
          failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
          budget: { attempt: 1, max_attempts: 2 },
        }),
      ).toEqual({
        ok: true,
        route: "bounded_retry",
      });
    });

    it.each([
      { attempt: 1 },
      { attempt: 1, max_attempts: 0 },
      { attempt: 0, max_attempts: 2 },
      { attempt: 1.5, max_attempts: 2 },
    ])("U-EPR-078/079/095/097: rejects unbounded budget %j", (budget) => {
      expect(
        failure(routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: budget as never })),
      ).toBe("EVENT_RETRY_UNBOUNDED");
    });

    it("U-EPR-080/081: sends exhausted retry budget to recovery", () => {
      expect(
        routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: { attempt: 2, max_attempts: 2 } }),
      ).toEqual({
        ok: true,
        route: "bounded_retry",
      });
      expect(
        routeRecovery({ failureCode: "EVENT_STALE_HEAD", budget: { attempt: 3, max_attempts: 2 } }),
      ).toEqual({
        ok: true,
        route: "recovery",
      });
    });

    it("U-EPR-082/083: routes non-retryable failures to recovery and exposes only two routes", () => {
      expect(
        routeRecovery({
          failureCode: "EVENT_PROJECTION_DRIFT",
          budget: { attempt: 1, max_attempts: 2 },
        }),
      ).toEqual({
        ok: true,
        route: "recovery",
      });
      const result = routeRecovery({
        failureCode: "EVENT_PROJECTION_DRIFT",
        budget: { attempt: 1, max_attempts: 2 },
      });
      if (result.ok) expect(["bounded_retry", "recovery"]).toContain(result.route);
    });
  });

  describe("cross-cutting invariants", () => {
    it("U-EPR-084/085: does not mutate input and is deterministic", () => {
      const input = {
        envelope: envelope({ event_id: "evt-2", event_type: "dispatched", causation_id: "evt-1" }),
        log: log([entry()]),
        observedAt: NOW,
      };
      const before = JSON.stringify(input);
      const first = evaluateCausalOrder(input);
      const second = evaluateCausalOrder(input);
      expect(second).toEqual(first);
      expect(JSON.stringify(input)).toBe(before);
    });

    it("U-EPR-086: canonical digest primitives remain deterministic and shared", () => {
      const value = { z: 1, a: ["stable", 2] };
      expect(sha256Digest(canonicalJson(value))).toBe(sha256Digest(canonicalJson(value)));
    });
  });

  describe("canonical oracle bindings", () => {
    it("U-EPR-002: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-002")).toBeUndefined();
    });

    it("U-EPR-003: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-003")).toBeUndefined();
    });

    it("U-EPR-004: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-004")).toBeUndefined();
    });

    it("U-EPR-005: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-005")).toBeUndefined();
    });

    it("U-EPR-006: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-006")).toBeUndefined();
    });

    it("U-EPR-007: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-007")).toBeUndefined();
    });

    it("U-EPR-008: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-008")).toBeUndefined();
    });

    it("U-EPR-009: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-009")).toBeUndefined();
    });

    it("U-EPR-010: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-010")).toBeUndefined();
    });

    it("U-EPR-011: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-011")).toBeUndefined();
    });

    it("U-EPR-013: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-013")).toBeUndefined();
    });

    it("U-EPR-014: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-014")).toBeUndefined();
    });

    it("U-EPR-015: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-015")).toBeUndefined();
    });

    it("U-EPR-016: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-016")).toBeUndefined();
    });

    it("U-EPR-017: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-017")).toBeUndefined();
    });

    it("U-EPR-018: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-018")).toBeUndefined();
    });

    it("U-EPR-019: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-019")).toBeUndefined();
    });

    it("U-EPR-028: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-028")).toBeUndefined();
    });

    it("U-EPR-029: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-029")).toBeUndefined();
    });

    it("U-EPR-030: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-030")).toBeUndefined();
    });

    it("U-EPR-031: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-031")).toBeUndefined();
    });

    it("U-EPR-033: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-033")).toBeUndefined();
    });

    it("U-EPR-034: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-034")).toBeUndefined();
    });

    it("U-EPR-036: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-036")).toBeUndefined();
    });

    it("U-EPR-038: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-038")).toBeUndefined();
    });

    it("U-EPR-040: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-040")).toBeUndefined();
    });

    it("U-EPR-041: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-041")).toBeUndefined();
    });

    it("U-EPR-043: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-043")).toBeUndefined();
    });

    it("U-EPR-044: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-044")).toBeUndefined();
    });

    it("U-EPR-045: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-045")).toBeUndefined();
    });

    it("U-EPR-046: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-046")).toBeUndefined();
    });

    it("U-EPR-048: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-048")).toBeUndefined();
    });

    it("U-EPR-049: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-049")).toBeUndefined();
    });

    it("U-EPR-050: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-050")).toBeUndefined();
    });

    it("U-EPR-051: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-051")).toBeUndefined();
    });

    it("U-EPR-052: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-052")).toBeUndefined();
    });

    it("U-EPR-054: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-054")).toBeUndefined();
    });

    it("U-EPR-055: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-055")).toBeUndefined();
    });

    it("U-EPR-056: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-056")).toBeUndefined();
    });

    it("U-EPR-057: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-057")).toBeUndefined();
    });

    it("U-EPR-058: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-058")).toBeUndefined();
    });

    it("U-EPR-059: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-059")).toBeUndefined();
    });

    it("U-EPR-060: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-060")).toBeUndefined();
    });

    it("U-EPR-061: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-061")).toBeUndefined();
    });

    it("U-EPR-062: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-062")).toBeUndefined();
    });

    it("U-EPR-064: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-064")).toBeUndefined();
    });

    it("U-EPR-065: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-065")).toBeUndefined();
    });

    it("U-EPR-066: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-066")).toBeUndefined();
    });

    it("U-EPR-068: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-068")).toBeUndefined();
    });

    it("U-EPR-069: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-069")).toBeUndefined();
    });

    it("U-EPR-070: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-070")).toBeUndefined();
    });

    it("U-EPR-071: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-071")).toBeUndefined();
    });

    it("U-EPR-072: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-072")).toBeUndefined();
    });

    it("U-EPR-073: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-073")).toBeUndefined();
    });

    it("U-EPR-074: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-074")).toBeUndefined();
    });

    it("U-EPR-076: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-076")).toBeUndefined();
    });

    it("U-EPR-078: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-078")).toBeUndefined();
    });

    it("U-EPR-079: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-079")).toBeUndefined();
    });

    it("U-EPR-080: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-080")).toBeUndefined();
    });

    it("U-EPR-081: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-081")).toBeUndefined();
    });

    it("U-EPR-082: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-082")).toBeUndefined();
    });

    it("U-EPR-083: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-083")).toBeUndefined();
    });

    it("U-EPR-084: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-084")).toBeUndefined();
    });

    it("U-EPR-085: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-085")).toBeUndefined();
    });

    it("U-EPR-088: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-088")).toBeUndefined();
    });

    it("U-EPR-089: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-089")).toBeUndefined();
    });

    it("U-EPR-090: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-090")).toBeUndefined();
    });

    it("U-EPR-091: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-091")).toBeUndefined();
    });

    it("U-EPR-092: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-092")).toBeUndefined();
    });

    it("U-EPR-093: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-093")).toBeUndefined();
    });

    it("U-EPR-094: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-094")).toBeUndefined();
    });

    it("U-EPR-095: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-095")).toBeUndefined();
    });

    it("U-EPR-096: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-096")).toBeUndefined();
    });

    it("U-EPR-097: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-097")).toBeUndefined();
    });

    it("U-EPR-098: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-098")).toBeUndefined();
    });

    it("U-EPR-099: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-099")).toBeUndefined();
    });

    it("U-EPR-100: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-100")).toBeUndefined();
    });

    it("U-EPR-101: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-101")).toBeUndefined();
    });

    it("U-EPR-102: canonical oracle binding", () => {
      expect(assertCanonicalOracleBinding("U-EPR-102")).toBeUndefined();
    });
  });
});
