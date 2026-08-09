import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
// PLAN-L7-528-event-projection-checkpoint-replay
import {
  type AppendOnlyLogEntryV1,
  type AppendOnlyLogSnapshotV1,
  admitEventEnvelope,
  type CheckpointRecordV1,
  type CheckpointScopeV1,
  type EventFailureCode,
  type EventType,
  evaluateCausalOrder,
  evaluateCheckpointReplay,
  evaluateIdempotentIngest,
  evaluateLifecycleTransition,
  evaluateProjectionDrift,
  type OrchestrationEventEnvelopeV1,
  type ProjectionSnapshotV1,
  type RecoveryBudgetV1,
  routeRecovery,
  selectCheckpointScope,
} from "../src/runtime/event-projection-checkpoint-replay";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);
const DIGEST_A = `sha256:${"c".repeat(64)}`;
const DIGEST_B = `sha256:${"d".repeat(64)}`;
const T0 = "2026-08-09T00:00:00.000Z";
const T1 = "2026-08-09T00:01:00.000Z";
const T2 = "2026-08-09T00:02:00.000Z";
const NOW = "2026-08-09T12:00:00.000Z";

function envelope(
  overrides: Partial<OrchestrationEventEnvelopeV1> = {},
): OrchestrationEventEnvelopeV1 {
  return {
    schema_version: "helix-orchestration-event.v1",
    event_id: "ev-2",
    event_type: "dispatched",
    occurred_at: T1,
    plan_id: "PLAN-L7-528",
    parent_lane_id: "cell-mic",
    lane_id: "lane-a",
    causation_id: "ev-1",
    correlation_id: "corr-1",
    head_sha: HEAD_A,
    payload_digest: DIGEST_A,
    ...overrides,
  };
}

function entry(overrides: Partial<AppendOnlyLogEntryV1> = {}): AppendOnlyLogEntryV1 {
  return {
    event_id: "ev-1",
    event_type: "requested",
    occurred_at: T0,
    causation_id: null,
    correlation_id: "corr-1",
    payload_digest: DIGEST_A,
    ...overrides,
  };
}

function log(overrides: Partial<AppendOnlyLogSnapshotV1> = {}): AppendOnlyLogSnapshotV1 {
  return {
    lane_id: "lane-a",
    entries: [entry()],
    sealed_event_ids: [],
    ...overrides,
  };
}

function chain(types: readonly EventType[]): AppendOnlyLogEntryV1[] {
  return types.map((eventType, index) =>
    entry({
      event_id: `ev-${index + 1}`,
      event_type: eventType,
      occurred_at: new Date(Date.parse(T0) + index * 1000).toISOString(),
      causation_id: index === 0 ? null : `ev-${index}`,
    }),
  );
}

function projection(overrides: Partial<ProjectionSnapshotV1> = {}): ProjectionSnapshotV1 {
  return {
    lane_id: "lane-a",
    identity: { plan_id: "PLAN-L7-528", parent_lane_id: "cell-mic", lane_id: "lane-a" },
    state: { lifecycle_state: "started", head_sha: HEAD_A, last_event_id: "ev-4" },
    ...overrides,
  };
}

function scope(overrides: Partial<CheckpointScopeV1> = {}): CheckpointScopeV1 {
  return {
    head_sha: HEAD_A,
    parent_lane_id: "cell-mic",
    lane_id: "lane-a",
    from_event_id: "ev-1",
    to_event_id: "ev-3",
    ...overrides,
  };
}

function checkpoint(overrides: Partial<CheckpointRecordV1> = {}): CheckpointRecordV1 {
  return {
    head_sha: HEAD_A,
    parent_lane_id: "cell-mic",
    event_boundary: { from_event_id: "ev-1", to_event_id: "ev-3" },
    projection_digest: DIGEST_A,
    checkpoint_digest: DIGEST_B,
    ...overrides,
  };
}

function budget(overrides: Partial<RecoveryBudgetV1> = {}): RecoveryBudgetV1 {
  return { attempt: 1, max_attempts: 3, ...overrides };
}

function withoutKey<T extends object>(value: T, key: string): Record<string, unknown> {
  const copy = { ...value } as Record<string, unknown>;
  delete copy[key];
  return copy;
}

function failureCode(result: { ok: boolean; failure_code?: EventFailureCode }): string {
  return result.ok ? "ok" : (result.failure_code ?? "missing");
}

function causal(
  envelopeOverrides: Partial<OrchestrationEventEnvelopeV1> = {},
  logOverrides: Partial<AppendOnlyLogSnapshotV1> = {},
  observedAt = NOW,
) {
  return evaluateCausalOrder({
    envelope: envelope(envelopeOverrides),
    log: log(logOverrides),
    observedAt,
  });
}

function ingest(
  envelopeOverrides: Partial<OrchestrationEventEnvelopeV1> = {},
  logOverrides: Partial<AppendOnlyLogSnapshotV1> = {},
) {
  return evaluateIdempotentIngest({
    envelope: envelope(envelopeOverrides),
    log: log(logOverrides),
  });
}

function transition(
  envelopeOverrides: Partial<OrchestrationEventEnvelopeV1> = {},
  logOverrides: Partial<AppendOnlyLogSnapshotV1> = {},
) {
  return evaluateLifecycleTransition({
    envelope: envelope(envelopeOverrides),
    log: log(logOverrides),
  });
}

function drift(
  rebuiltOverrides: Partial<ProjectionSnapshotV1> = {},
  readBackOverrides: Partial<ProjectionSnapshotV1> = {},
) {
  return evaluateProjectionDrift({
    rebuilt: projection(rebuiltOverrides),
    readBack: projection(readBackOverrides),
  });
}

function selectScope(scopeInput: unknown, logOverrides: Partial<AppendOnlyLogSnapshotV1> = {}) {
  return selectCheckpointScope({
    scope: scopeInput,
    log: log({ entries: chain(["requested", "dispatched", "leased"]), ...logOverrides }),
  });
}

function replay(
  checkpointOverrides: Partial<CheckpointRecordV1> = {},
  extra: Partial<{
    scopedEventIds: readonly string[];
    replayProjectionDigest: string;
    replayCheckpointDigest: string;
    currentHeadSha: string;
  }> = {},
) {
  return evaluateCheckpointReplay({
    checkpoint: checkpoint(checkpointOverrides),
    scopedEventIds: extra.scopedEventIds ?? ["ev-1", "ev-2", "ev-3"],
    replayProjectionDigest: extra.replayProjectionDigest ?? DIGEST_A,
    replayCheckpointDigest: extra.replayCheckpointDigest ?? DIGEST_B,
    currentHeadSha: extra.currentHeadSha ?? HEAD_A,
  });
}

describe("event projection と checkpoint replay の判定", () => {
  it("U-EPR-001: 11 field 完備の envelope を admit する", () => {
    const result = admitEventEnvelope(envelope());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.envelope.event_id).toBe("ev-2");
  });

  it("U-EPR-002: schema_version 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "schema_version")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-003: event_id 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "event_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-004: event_type 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "event_type")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-005: occurred_at 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "occurred_at")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-006: plan_id 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "plan_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-007: parent_lane_id 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "parent_lane_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-008: lane_id 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "lane_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-009: causation_id のキー欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "causation_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-010: correlation_id 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "correlation_id")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-011: head_sha 欠落を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(withoutKey(envelope(), "head_sha")))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-012: payload_digest が null（キーは存在）の envelope を EVENT_ENVELOPE_INCOMPLETE で拒否する", () => {
    // キー自体を削除すると exact set 違反となりステップ1の EVENT_ENVELOPE_INVALID が先着する
    // （U-EPR-088）。片肺判定へ到達させるにはキーを残して値だけを欠く形にする。
    expect(failureCode(admitEventEnvelope({ ...envelope(), payload_digest: null }))).toBe(
      "EVENT_ENVELOPE_INCOMPLETE",
    );
  });

  it("U-EPR-013: 欠落 field を unknown 追加 field で埋めた envelope を拒否する", () => {
    const offset = { ...withoutKey(envelope(), "lane_id"), unknown_field: "lane-a" };
    expect(failureCode(admitEventEnvelope(offset))).toBe("EVENT_ENVELOPE_INVALID");
  });

  it("U-EPR-014: field 数 11 のまま unknown field を混ぜた envelope を拒否する", () => {
    const swapped = { ...withoutKey(envelope(), "plan_id"), unknown_field: "x" };
    expect(Object.keys(swapped)).toHaveLength(11);
    expect(failureCode(admitEventEnvelope(swapped))).toBe("EVENT_ENVELOPE_INVALID");
  });

  it("U-EPR-015: sha256 接頭辞を欠く payload_digest を EVENT_ENVELOPE_INCOMPLETE で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ payload_digest: "c".repeat(64) })))).toBe(
      "EVENT_ENVELOPE_INCOMPLETE",
    );
  });

  it("U-EPR-016: 空文字の payload_digest を EVENT_ENVELOPE_INCOMPLETE で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ payload_digest: "" })))).toBe(
      "EVENT_ENVELOPE_INCOMPLETE",
    );
  });

  it("U-EPR-017: 40 桁 hex でない head_sha を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ head_sha: "abc" })))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-018: enum 外の event_type を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ event_type: "merged" as EventType })))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-019: 空文字の lane_id を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ lane_id: "" })))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-020: 起点 event の causation_id null を admit する", () => {
    const result = admitEventEnvelope(
      envelope({ event_type: "requested", causation_id: null, event_id: "ev-1" }),
    );
    expect(result.ok).toBe(true);
  });

  it("U-EPR-021: 起点以外の causation_id null を EVENT_CAUSATION_UNRESOLVED で拒否する", () => {
    expect(
      failureCode(admitEventEnvelope(envelope({ event_type: "leased", causation_id: null }))),
    ).toBe("EVENT_CAUSATION_UNRESOLVED");
  });

  it("U-EPR-022: unknown field と形式不正の同時成立で exact set 検査が先着する", () => {
    const both = { ...withoutKey(envelope({ head_sha: "bad" }), "plan_id"), unknown_field: "x" };
    expect(failureCode(admitEventEnvelope(both))).toBe("EVENT_ENVELOPE_INVALID");
  });

  it("U-EPR-023: 正しい因果順序の envelope を受理する", () => {
    expect(causal().ok).toBe(true);
  });

  it("U-EPR-024: 未来 occurred_at を EVENT_FUTURE_TIMESTAMP で拒否する", () => {
    expect(failureCode(causal({ occurred_at: "2026-08-10T00:00:00.000Z" }))).toBe(
      "EVENT_FUTURE_TIMESTAMP",
    );
  });

  it("U-EPR-025: 未解決 causation_id を EVENT_CAUSATION_UNRESOLVED で拒否する", () => {
    expect(failureCode(causal({ causation_id: "ev-missing" }))).toBe("EVENT_CAUSATION_UNRESOLVED");
  });

  it("U-EPR-026: correlation 跨ぎの causation を EVENT_CORRELATION_MISMATCH で拒否する", () => {
    expect(failureCode(causal({}, { entries: [entry({ correlation_id: "corr-2" })] }))).toBe(
      "EVENT_CORRELATION_MISMATCH",
    );
  });

  it("U-EPR-027: 時刻逆行を EVENT_CAUSAL_INVERSION で拒否する", () => {
    expect(failureCode(causal({}, { entries: [entry({ occurred_at: T2 })] }))).toBe(
      "EVENT_CAUSAL_INVERSION",
    );
  });

  it("U-EPR-028: 未来時刻と未解決 causation の同時成立で未来先書きが先着する", () => {
    expect(
      failureCode(causal({ occurred_at: "2026-08-10T00:00:00.000Z", causation_id: "ev-missing" })),
    ).toBe("EVENT_FUTURE_TIMESTAMP");
  });

  it("U-EPR-029: correlation 不一致と時刻逆行の同時成立で correlation が先着する", () => {
    expect(
      failureCode(causal({}, { entries: [entry({ correlation_id: "corr-2", occurred_at: T2 })] })),
    ).toBe("EVENT_CORRELATION_MISMATCH");
  });

  it("U-EPR-030: observedAt と同時刻の envelope を受理する", () => {
    expect(causal({ occurred_at: NOW }, {}, NOW).ok).toBe(true);
  });

  it("U-EPR-031: 原因と同時刻の結果 event を受理する", () => {
    expect(causal({ occurred_at: T0 }).ok).toBe(true);
  });

  it("U-EPR-032: 未登録 event_id に appended を返す", () => {
    const result = ingest();
    expect(result.ok && result.outcome).toBe("appended");
  });

  it("U-EPR-033: 同一 digest の再投入に duplicate_absorbed を返す", () => {
    const result = ingest({ event_id: "ev-1" });
    expect(result.ok && result.outcome).toBe("duplicate_absorbed");
  });

  it("U-EPR-034: digest 不一致の再投入を EVENT_DUPLICATE_DIGEST_MISMATCH で拒否する", () => {
    expect(failureCode(ingest({ event_id: "ev-1", payload_digest: DIGEST_B }))).toBe(
      "EVENT_DUPLICATE_DIGEST_MISMATCH",
    );
  });

  it("U-EPR-035: event_id 重複の log snapshot を EVENT_LOG_SNAPSHOT_INVALID で拒否する", () => {
    expect(failureCode(ingest({}, { entries: [entry(), entry()] }))).toBe(
      "EVENT_LOG_SNAPSHOT_INVALID",
    );
  });

  it("U-EPR-036: duplicate_absorbed が log.entries の長さを変えない", () => {
    const snapshot = log();
    const before = snapshot.entries.length;
    evaluateIdempotentIngest({ envelope: envelope({ event_id: "ev-1" }), log: snapshot });
    expect(snapshot.entries).toHaveLength(before);
  });

  it("U-EPR-037: 3 回投入で 2 回目以降が全て duplicate_absorbed になる", () => {
    const outcomes = [1, 2, 3].map(() => ingest({ event_id: "ev-1" }));
    expect(outcomes.every((result) => result.ok && result.outcome === "duplicate_absorbed")).toBe(
      true,
    );
  });

  it("U-EPR-038: digest 不一致の拒否が log.entries を変更しない", () => {
    const snapshot = log();
    const before = JSON.stringify(snapshot.entries);
    evaluateIdempotentIngest({
      envelope: envelope({ event_id: "ev-1", payload_digest: DIGEST_B }),
      log: snapshot,
    });
    expect(JSON.stringify(snapshot.entries)).toBe(before);
  });

  it("U-EPR-039: 正規 5 段遷移を全段受理する", () => {
    const types: EventType[] = ["requested", "dispatched", "leased", "started", "terminated"];
    for (let index = 1; index < types.length; index += 1) {
      const result = transition(
        { event_type: types[index] as EventType, event_id: `ev-${index + 1}` },
        { entries: chain(types.slice(0, index)) },
      );
      expect(failureCode(result)).toBe("ok");
    }
  });

  it("U-EPR-040: 前段の無い terminated を EVENT_TRANSITION_ILLEGAL で拒否する", () => {
    expect(
      failureCode(transition({ event_type: "terminated" }, { entries: [], sealed_event_ids: [] })),
    ).toBe("EVENT_TRANSITION_ILLEGAL");
  });

  it("U-EPR-041: 段飛ばし遷移を EVENT_TRANSITION_ILLEGAL で拒否する", () => {
    expect(failureCode(transition({ event_type: "started" }))).toBe("EVENT_TRANSITION_ILLEGAL");
  });

  it("U-EPR-042: seal 後の追加遷移を EVENT_TRANSITION_AFTER_SEAL で拒否する", () => {
    expect(failureCode(transition({}, { sealed_event_ids: ["ev-1"] }))).toBe(
      "EVENT_TRANSITION_AFTER_SEAL",
    );
  });

  it("U-EPR-043: handover 反復を受理する", () => {
    const result = transition(
      { event_type: "handover_requested" },
      { entries: chain(["requested", "dispatched", "leased", "started", "handover_completed"]) },
    );
    expect(failureCode(result)).toBe("ok");
  });

  it("U-EPR-044: 対応要求の無い handover_completed を拒否する", () => {
    expect(
      failureCode(
        transition(
          { event_type: "handover_completed" },
          { entries: chain(["requested", "dispatched", "leased", "started"]) },
        ),
      ),
    ).toBe("EVENT_TRANSITION_ILLEGAL");
  });

  it("U-EPR-045: started から failed への遷移を受理する", () => {
    const result = transition(
      { event_type: "failed" },
      { entries: chain(["requested", "dispatched", "leased", "started"]) },
    );
    expect(failureCode(result)).toBe("ok");
  });

  it("U-EPR-046: failed 後の逆行遷移を拒否する", () => {
    expect(
      failureCode(
        transition(
          { event_type: "dispatched" },
          { entries: chain(["requested", "dispatched", "leased", "started", "failed"]) },
        ),
      ),
    ).toBe("EVENT_TRANSITION_ILLEGAL");
  });

  it("U-EPR-047: identity と state が全一致する対を受理する", () => {
    expect(drift().ok).toBe(true);
  });

  it("U-EPR-048: identity.plan_id 単独変異を EVENT_PROJECTION_DRIFT で拒否する", () => {
    expect(
      failureCode(
        drift(
          {},
          { identity: { plan_id: "OTHER", parent_lane_id: "cell-mic", lane_id: "lane-a" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-049: identity.parent_lane_id 単独変異を拒否する", () => {
    expect(
      failureCode(
        drift(
          {},
          { identity: { plan_id: "PLAN-L7-528", parent_lane_id: "other", lane_id: "lane-a" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-050: state.lifecycle_state 単独変異を拒否する", () => {
    expect(
      failureCode(
        drift(
          {},
          { state: { lifecycle_state: "leased", head_sha: HEAD_A, last_event_id: "ev-4" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-051: state.head_sha 単独変異を拒否する", () => {
    expect(
      failureCode(
        drift(
          {},
          { state: { lifecycle_state: "started", head_sha: HEAD_B, last_event_id: "ev-4" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-052: state.last_event_id 単独変異を拒否する", () => {
    expect(
      failureCode(
        drift(
          {},
          { state: { lifecycle_state: "started", head_sha: HEAD_A, last_event_id: "ev-9" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-053: lane 不一致の read-back を EVENT_ORPHAN_LANE で拒否する", () => {
    expect(failureCode(drift({}, { lane_id: "lane-z" }))).toBe("EVENT_ORPHAN_LANE");
  });

  it("U-EPR-054: identity 一致・state 不一致を成功へ読み替えない", () => {
    const result = drift(
      {},
      { state: { lifecycle_state: "terminated", head_sha: HEAD_A, last_event_id: "ev-4" } },
    );
    expect(result.ok).toBe(false);
  });

  it("U-EPR-055: state 一致・identity 不一致を成功へ読み替えない", () => {
    const result = drift(
      {},
      { identity: { plan_id: "OTHER", parent_lane_id: "cell-mic", lane_id: "lane-a" } },
    );
    expect(result.ok).toBe(false);
  });

  it("U-EPR-056: event 追記の無い read-back 変更を drift で拒否する", () => {
    // rebuilt は event 列から再構築した値なので動かない。read-back 側だけを手動編集相当で変える。
    expect(
      failureCode(
        drift(
          {},
          { state: { lifecycle_state: "accepted", head_sha: HEAD_A, last_event_id: "ev-4" } },
        ),
      ),
    ).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-057: 5 field 完備の scope が区間内 event_id を append 順で返す", () => {
    const result = selectScope(scope());
    expect(result.ok && result.eventIds).toEqual(["ev-1", "ev-2", "ev-3"]);
  });

  it("U-EPR-058: head_sha 欠落の scope を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(selectScope(withoutKey(scope(), "head_sha")))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-059: parent_lane_id 欠落の scope を拒否する", () => {
    expect(failureCode(selectScope(withoutKey(scope(), "parent_lane_id")))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-060: lane_id 欠落の scope を拒否する", () => {
    expect(failureCode(selectScope(withoutKey(scope(), "lane_id")))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-061: from_event_id 欠落の scope を拒否する", () => {
    expect(failureCode(selectScope(withoutKey(scope(), "from_event_id")))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-062: to_event_id 欠落の scope を拒否する", () => {
    expect(failureCode(selectScope(withoutKey(scope(), "to_event_id")))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-063: scope undefined で全体スコープへフォールバックしない", () => {
    expect(failureCode(selectScope(undefined))).toBe("EVENT_CHECKPOINT_SCOPE_MISSING");
  });

  it("U-EPR-064: log 不在の from_event_id を拒否する", () => {
    expect(failureCode(selectScope(scope({ from_event_id: "ev-missing" })))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-065: 逆転区間を拒否する", () => {
    expect(failureCode(selectScope(scope({ from_event_id: "ev-3", to_event_id: "ev-1" })))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-066: 別 lane の追記で eventIds が変化しない", () => {
    const base = selectScope(scope());
    const withPeer = selectCheckpointScope({
      scope: scope(),
      log: log({
        entries: [
          ...chain(["requested", "dispatched", "leased"]),
          entry({ event_id: "ev-peer", correlation_id: "corr-peer" }),
        ],
      }),
    });
    expect(base.ok && withPeer.ok && withPeer.eventIds).toEqual(
      base.ok ? base.eventIds : undefined,
    );
  });

  it("U-EPR-067: 束縛 3 件と digest 2 件が揃う checkpoint を受理する", () => {
    expect(replay().ok).toBe(true);
  });

  it("U-EPR-068: head_sha 欠落を EVENT_CHECKPOINT_BINDING_MISSING で拒否する", () => {
    const broken = withoutKey(checkpoint(), "head_sha") as unknown as CheckpointRecordV1;
    expect(
      failureCode(
        evaluateCheckpointReplay({
          checkpoint: broken,
          scopedEventIds: ["ev-1", "ev-2", "ev-3"],
          replayProjectionDigest: DIGEST_A,
          replayCheckpointDigest: DIGEST_B,
          currentHeadSha: HEAD_A,
        }),
      ),
    ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
  });

  it("U-EPR-069: parent_lane_id 欠落を拒否する", () => {
    const broken = withoutKey(checkpoint(), "parent_lane_id") as unknown as CheckpointRecordV1;
    expect(
      failureCode(
        evaluateCheckpointReplay({
          checkpoint: broken,
          scopedEventIds: ["ev-1", "ev-2", "ev-3"],
          replayProjectionDigest: DIGEST_A,
          replayCheckpointDigest: DIGEST_B,
          currentHeadSha: HEAD_A,
        }),
      ),
    ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
  });

  it("U-EPR-070: event_boundary 欠落を拒否する", () => {
    const broken = withoutKey(checkpoint(), "event_boundary") as unknown as CheckpointRecordV1;
    expect(
      failureCode(
        evaluateCheckpointReplay({
          checkpoint: broken,
          scopedEventIds: ["ev-1", "ev-2", "ev-3"],
          replayProjectionDigest: DIGEST_A,
          replayCheckpointDigest: DIGEST_B,
          currentHeadSha: HEAD_A,
        }),
      ),
    ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
  });

  it("U-EPR-071: HEAD 不一致を EVENT_STALE_HEAD で拒否する", () => {
    expect(failureCode(replay({}, { currentHeadSha: HEAD_B }))).toBe("EVENT_STALE_HEAD");
  });

  it("U-EPR-072: 境界端点の不一致を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(replay({}, { scopedEventIds: ["ev-2", "ev-3"] }))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-073: projection digest 不一致を EVENT_REPLAY_NOT_IDEMPOTENT で拒否する", () => {
    expect(failureCode(replay({}, { replayProjectionDigest: DIGEST_B }))).toBe(
      "EVENT_REPLAY_NOT_IDEMPOTENT",
    );
  });

  it("U-EPR-074: checkpoint digest 不一致を EVENT_REPLAY_NOT_IDEMPOTENT で拒否する", () => {
    expect(failureCode(replay({}, { replayCheckpointDigest: DIGEST_A }))).toBe(
      "EVENT_REPLAY_NOT_IDEMPOTENT",
    );
  });

  it("U-EPR-075: 束縛欠落と stale HEAD の同時成立で束縛検査が先着する", () => {
    const broken = withoutKey(checkpoint(), "head_sha") as unknown as CheckpointRecordV1;
    expect(
      failureCode(
        evaluateCheckpointReplay({
          checkpoint: broken,
          scopedEventIds: ["ev-1", "ev-2", "ev-3"],
          replayProjectionDigest: DIGEST_A,
          replayCheckpointDigest: DIGEST_B,
          currentHeadSha: HEAD_B,
        }),
      ),
    ).toBe("EVENT_CHECKPOINT_BINDING_MISSING");
  });

  it("U-EPR-076: stale HEAD と digest 不一致の同時成立で stale HEAD が先着する", () => {
    expect(
      failureCode(replay({}, { currentHeadSha: HEAD_B, replayProjectionDigest: DIGEST_B })),
    ).toBe("EVENT_STALE_HEAD");
  });

  it("U-EPR-077: rate limit かつ budget 残ありで bounded_retry を返す", () => {
    const result = routeRecovery({
      failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
      budget: budget(),
    });
    expect(result.ok && result.route).toBe("bounded_retry");
  });

  it("U-EPR-078: max_attempts 欠落を EVENT_RETRY_UNBOUNDED で拒否する", () => {
    const broken = withoutKey(budget(), "max_attempts") as unknown as RecoveryBudgetV1;
    expect(
      failureCode(routeRecovery({ failureCode: "EVENT_RATE_LIMIT_INTERRUPTED", budget: broken })),
    ).toBe("EVENT_RETRY_UNBOUNDED");
  });

  it("U-EPR-079: max_attempts が 0 の budget を拒否する", () => {
    expect(
      failureCode(
        routeRecovery({
          failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
          budget: budget({ max_attempts: 0 }),
        }),
      ),
    ).toBe("EVENT_RETRY_UNBOUNDED");
  });

  it("U-EPR-080: attempt == max_attempts で bounded_retry を返す", () => {
    const result = routeRecovery({
      failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
      budget: budget({ attempt: 3, max_attempts: 3 }),
    });
    expect(result.ok && result.route).toBe("bounded_retry");
  });

  it("U-EPR-081: 上限超過で recovery を返す", () => {
    const result = routeRecovery({
      failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
      budget: budget({ attempt: 4, max_attempts: 3 }),
    });
    expect(result.ok && result.route).toBe("recovery");
  });

  it("U-EPR-082: retry 不能 code で recovery を返す", () => {
    const result = routeRecovery({ failureCode: "EVENT_PROJECTION_DRIFT", budget: budget() });
    expect(result.ok && result.route).toBe("recovery");
  });

  it("U-EPR-083: route が 2 値のみで完了継続値を持たない", () => {
    const routes = (
      [
        "EVENT_RATE_LIMIT_INTERRUPTED",
        "EVENT_STALE_HEAD",
        "EVENT_PROJECTION_DRIFT",
        "EVENT_ORPHAN_LANE",
        "EVENT_REPLAY_NOT_IDEMPOTENT",
      ] as EventFailureCode[]
    ).map((code) => {
      const result = routeRecovery({ failureCode: code, budget: budget() });
      return result.ok ? result.route : "failed";
    });
    expect(new Set(routes)).toEqual(new Set(["bounded_retry", "recovery"]));
  });

  it("U-EPR-084: 入力オブジェクトを変更せず返り値が入力と構造を共有しない", () => {
    const input = envelope();
    const snapshot = JSON.stringify(input);
    const result = admitEventEnvelope(input);
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(result.ok && result.envelope).not.toBe(input);
    expect(Object.isFrozen(input)).toBe(false);
  });

  it("U-EPR-085: 同一入力の 2 回呼び出しが同一結果を返す", () => {
    const first = JSON.stringify(admitEventEnvelope(envelope()));
    const second = JSON.stringify(admitEventEnvelope(envelope()));
    expect(first).toBe(second);
    expect(JSON.stringify(causal())).toBe(JSON.stringify(causal()));
    expect(JSON.stringify(selectScope(scope()))).toBe(JSON.stringify(selectScope(scope())));
  });

  it("U-EPR-086: digest が canonicalJson / sha256Digest の出力と一致し第二の算出系を経由しない", () => {
    const payload = { lane_id: "lane-a", events: ["ev-1", "ev-2", "ev-3"] };
    const expected = sha256Digest(canonicalJson(payload));
    const accepted = replay(
      { projection_digest: expected, checkpoint_digest: expected },
      { replayProjectionDigest: expected, replayCheckpointDigest: expected },
    );
    expect(accepted.ok).toBe(true);
    expect(expected).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });

  it("U-EPR-087: event_id 重複の log snapshot を形式検査より先に EVENT_LOG_SNAPSHOT_INVALID で拒否する", () => {
    const result = selectCheckpointScope({
      scope: withoutKey(scope(), "head_sha"),
      log: log({ entries: [entry(), entry()] }),
    });
    expect(failureCode(result)).toBe("EVENT_LOG_SNAPSHOT_INVALID");
  });

  it("U-EPR-088: payload だけの入力が EVENT_ENVELOPE_INVALID を返す", () => {
    expect(failureCode(admitEventEnvelope({ payload_digest: DIGEST_A }))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-098: 別 correlation の後続 entry が直前 event の判定に混ざらない", () => {
    // corr-1 の直前は requested。corr-2 の entry が末尾にあっても遷移判定へ混入してはならない。
    const result = transition(
      {},
      {
        entries: [
          entry({ event_id: "ev-1", event_type: "requested", correlation_id: "corr-1" }),
          entry({ event_id: "ev-x", event_type: "accepted", correlation_id: "corr-2" }),
        ],
      },
    );
    expect(failureCode(result)).toBe("ok");
  });

  it("U-EPR-099: 5 field が全て妥当でも unknown field を持つ scope を exact set 違反で拒否する", () => {
    const surplus = { ...scope(), unknown_field: "x" };
    expect(failureCode(selectScope(surplus))).toBe("EVENT_CHECKPOINT_SCOPE_MISSING");
  });

  it("U-EPR-100: 区間始点が一致し終点だけ異なる scope を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(replay({}, { scopedEventIds: ["ev-1", "ev-2"] }))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-089: 11 field 完備に unknown field を 1 件足した envelope を拒否する", () => {
    // 全 field が個別 validator を通る形なので、exact set 検査を緩めた実装だけが admit してしまう。
    const surplus = { ...envelope(), unknown_field: "x" };
    expect(Object.keys(surplus)).toHaveLength(12);
    expect(failureCode(admitEventEnvelope(surplus))).toBe("EVENT_ENVELOPE_INVALID");
  });

  it("U-EPR-090: 空文字の schema_version（キーは存在）を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope({ ...envelope(), schema_version: "" }))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  // 独立レビュー（Codex, cross-runtime）指摘。非空でも別 schema の envelope は canonical ではない。
  it("U-EPR-103: 別 schema_version の envelope を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(
      failureCode(admitEventEnvelope({ ...envelope(), schema_version: "not-helix.v999" })),
    ).toBe("EVENT_ENVELOPE_INVALID");
    expect(admitEventEnvelope(envelope()).ok).toBe(true);
  });

  it("U-EPR-091: 日付として解釈できない occurred_at を EVENT_ENVELOPE_INVALID で拒否する", () => {
    expect(failureCode(admitEventEnvelope(envelope({ occurred_at: "not-a-timestamp" })))).toBe(
      "EVENT_ENVELOPE_INVALID",
    );
  });

  it("U-EPR-092: scope.lane_id が log の lane と異なる場合を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(selectScope(scope({ lane_id: "lane-other" })))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-093: 40 桁 hex でない scope.head_sha を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(selectScope(scope({ head_sha: "not-a-sha" })))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-094: 空文字の scope.parent_lane_id を EVENT_CHECKPOINT_SCOPE_MISSING で拒否する", () => {
    expect(failureCode(selectScope(scope({ parent_lane_id: "" })))).toBe(
      "EVENT_CHECKPOINT_SCOPE_MISSING",
    );
  });

  it("U-EPR-095: 非数値の max_attempts を EVENT_RETRY_UNBOUNDED で拒否する", () => {
    const broken = { attempt: 1, max_attempts: "3" } as unknown as RecoveryBudgetV1;
    expect(
      failureCode(routeRecovery({ failureCode: "EVENT_RATE_LIMIT_INTERRUPTED", budget: broken })),
    ).toBe("EVENT_RETRY_UNBOUNDED");
  });

  it("U-EPR-097: attempt が 0 の budget を EVENT_RETRY_UNBOUNDED で拒否する", () => {
    // L5 §1.6 で attempt は 1 起点と定めているため、0 以下は budget として不正。
    expect(
      failureCode(
        routeRecovery({
          failureCode: "EVENT_RATE_LIMIT_INTERRUPTED",
          budget: budget({ attempt: 0 }),
        }),
      ),
    ).toBe("EVENT_RETRY_UNBOUNDED");
  });

  it("U-EPR-096: 非数値の attempt を EVENT_RETRY_UNBOUNDED で拒否する", () => {
    const broken = { attempt: "1", max_attempts: 3 } as unknown as RecoveryBudgetV1;
    expect(
      failureCode(routeRecovery({ failureCode: "EVENT_RATE_LIMIT_INTERRUPTED", budget: broken })),
    ).toBe("EVENT_RETRY_UNBOUNDED");
  });

  it("U-EPR-101: identity 不一致と lane 不一致の同時成立で EVENT_PROJECTION_DRIFT が先着する", () => {
    // lane を先に判定する実装では EVENT_ORPHAN_LANE になり、実在する identity drift が
    // 「lane 違い」として記録から消える。L5 §2.5 の番号順 (identity → state → lane) を固定する。
    const result = drift(
      {},
      {
        lane_id: "lane-z",
        identity: { plan_id: "OTHER", parent_lane_id: "cell-mic", lane_id: "lane-a" },
      },
    );
    expect(failureCode(result)).toBe("EVENT_PROJECTION_DRIFT");
  });

  it("U-EPR-102: seal 済みと machine 違反の同時成立で EVENT_TRANSITION_AFTER_SEAL が先着する", () => {
    // machine 判定を先に置くと ILLEGAL に吸収され、AFTER_SEAL が到達不能になる。
    const result = transition(
      { event_type: "accepted" },
      { entries: chain(["requested"]), sealed_event_ids: ["ev-1"] },
    );
    expect(failureCode(result)).toBe("EVENT_TRANSITION_AFTER_SEAL");
  });
});
