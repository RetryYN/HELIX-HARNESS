import { describe, expect, it } from "vitest";

// PLAN-L7-527-slot-scheduler-quota-handover
import {
  admitCapacityEvidence,
  admitQueueEntry,
  admitSlotAccountingRow,
  type BoundedQueueSnapshotV1,
  type ConflictScopeV1,
  evaluateDispatchAdmission,
  evaluateFrontierRecalculation,
  evaluateQuotaHandover,
  evaluateSlotFailureIsolation,
  type QuotaHandoverPacketV1,
  type SlotAccountingRowV1,
} from "../src/runtime/slot-scheduler-quota-handover";
import type { WorkGraphLeaseV1 } from "../src/runtime/work-graph-receipt-acceptance";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);
const DIGEST = `sha256:${"c".repeat(64)}`;

function lease(owner: string, fenceToken = 1): WorkGraphLeaseV1 {
  return { fence_token: fenceToken, owner, acquired_at: "2026-08-09T00:00:00Z" };
}

function row(overrides: Partial<SlotAccountingRowV1> = {}): SlotAccountingRowV1 {
  return {
    slot_id: "slot-1",
    parent_id: "cell-mic",
    task_id: "task-1",
    dependency_ids: ["dep-1"],
    slot_state: "running",
    quota_snapshot: { consumed: 10, limit: 100, threshold: 80 },
    writer_lease: lease("writer-1"),
    started_at: "2026-08-09T00:00:00Z",
    terminated_at: null,
    ...overrides,
  };
}

function scope(overrides: Partial<ConflictScopeV1> = {}): ConflictScopeV1 {
  return {
    task_id: "task-1",
    issue_id: "issue-1",
    behavior_contract_id: "contract-1",
    responsibility_owner: "owner-1",
    allowed_paths: ["src/a"],
    shared_authority_ids: ["authority-1"],
    ...overrides,
  };
}

/** 4 軸すべてが candidate と交差しない稼働側 scope。1 軸ずつ崩して負例を作る。 */
function peerScope(overrides: Partial<ConflictScopeV1> = {}): ConflictScopeV1 {
  return {
    task_id: "task-2",
    issue_id: "issue-2",
    behavior_contract_id: "contract-2",
    responsibility_owner: "owner-2",
    allowed_paths: ["src/b"],
    shared_authority_ids: ["authority-2"],
    ...overrides,
  };
}

function queue(overrides: Partial<BoundedQueueSnapshotV1> = {}): BoundedQueueSnapshotV1 {
  return { capacity: 8, queue_limit: 4, entries: [], running: [], ...overrides };
}

function packet(overrides: Partial<QuotaHandoverPacketV1> = {}): QuotaHandoverPacketV1 {
  return {
    lane_id: "lane-1",
    task_id: "task-1",
    candidate_head: HEAD_A,
    writer_lease: lease("writer-1"),
    remaining_scope: { allowed_paths: ["src/a"], forbidden_paths: ["src/z"] },
    target_runtime: "codex",
    target_reviewer: "reviewer-1",
    issued_at: "2026-08-09T00:10:00Z",
    ...overrides,
  };
}

function withoutKey<T extends object>(value: T, key: string): unknown {
  const clone: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  delete clone[key];
  return clone;
}

function dispatch(overrides: {
  candidate?: SlotAccountingRowV1;
  candidateScope?: ConflictScopeV1;
  running?: SlotAccountingRowV1[];
  runningScopes?: Record<string, ConflictScopeV1>;
  queue?: BoundedQueueSnapshotV1;
  readyDependencyIds?: string[];
}) {
  return evaluateDispatchAdmission({
    queue: overrides.queue ?? queue(),
    candidate: overrides.candidate ?? row(),
    candidateScope: overrides.candidateScope ?? scope(),
    running: overrides.running ?? [],
    runningScopes: overrides.runningScopes ?? {},
    readyDependencyIds: overrides.readyDependencyIds ?? ["dep-1"],
  });
}

function handover(overrides: {
  current?: SlotAccountingRowV1;
  packet?: unknown;
  alreadyAcked?: boolean;
  predecessorReleased?: boolean;
}) {
  return evaluateQuotaHandover({
    current: overrides.current ?? row(),
    packet: (overrides.packet ?? packet()) as QuotaHandoverPacketV1,
    successorOwner: "writer-2",
    predecessorReleased: overrides.predecessorReleased ?? true,
    alreadyAcked: overrides.alreadyAcked ?? false,
    expected: { lane_id: "lane-1", target_reviewer: "reviewer-1", candidate_head: HEAD_A },
  });
}

function frontier(overrides: {
  requestsMergeOrderDecision?: boolean;
  base_head?: string;
  ci_passed?: boolean;
  review_approved?: boolean;
  db_receipt_digest?: string | null;
}) {
  return evaluateFrontierRecalculation({
    mergedLaneId: "lane-a",
    mergedHead: HEAD_B,
    candidate: row({ task_id: "task-b", slot_id: "slot-b" }),
    candidateScope: scope({ task_id: "task-b" }),
    revalidated: {
      base_head: overrides.base_head ?? HEAD_B,
      ci_passed: overrides.ci_passed ?? true,
      review_approved: overrides.review_approved ?? true,
      db_receipt_digest:
        overrides.db_receipt_digest === undefined ? DIGEST : overrides.db_receipt_digest,
    },
    requestsMergeOrderDecision: overrides.requestsMergeOrderDecision ?? false,
  });
}

function failureCode(result: { ok: boolean } & Record<string, unknown>): string | undefined {
  return result.ok ? undefined : (result.failure_code as string);
}

describe("slot accounting row の exact set 検証", () => {
  it("U-SSQ-001: admits a nine-field accounting row", () => {
    const result = admitSlotAccountingRow(row());
    expect(result.ok).toBe(true);
  });

  it("U-SSQ-002: rejects a row missing slot_id", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "slot_id")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-003: rejects a row missing parent_id", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "parent_id")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-004: rejects a row missing task_id", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "task_id")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-005: rejects a row missing dependency_ids", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "dependency_ids")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-006: rejects a row missing slot_state", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "slot_state")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-007: rejects a row missing quota_snapshot", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "quota_snapshot")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-008: rejects a row missing writer_lease", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "writer_lease")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-009: rejects a row missing started_at", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "started_at")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-010: rejects a row missing terminated_at", () => {
    expect(failureCode(admitSlotAccountingRow(withoutKey(row(), "terminated_at")))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-011: rejects an unknown field compensating a missing one", () => {
    const compensated = { ...(withoutKey(row(), "slot_id") as object), slot_identifier: "slot-1" };
    expect(failureCode(admitSlotAccountingRow(compensated))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
    const surplus = { ...row(), lane_hint: "cell-mic" };
    expect(failureCode(admitSlotAccountingRow(surplus))).toBe("SCHEDULER_SLOT_ACCOUNTING_INVALID");
  });

  it("U-SSQ-012: rejects a slot_state outside the enum", () => {
    expect(failureCode(admitSlotAccountingRow({ ...row(), slot_state: "sprinting" }))).toBe(
      "SCHEDULER_INPUT_INVALID",
    );
  });

  it("U-SSQ-013: rejects a nested quota_snapshot missing limit", () => {
    const mutated = { ...row(), quota_snapshot: { consumed: 10, threshold: 80 } };
    expect(failureCode(admitSlotAccountingRow(mutated))).toBe("SCHEDULER_SLOT_ACCOUNTING_INVALID");
  });

  it("U-SSQ-014: rejects a nested writer_lease missing fence_token", () => {
    const mutated = {
      ...row(),
      writer_lease: { owner: "writer-1", acquired_at: "2026-08-09T00:00:00Z" },
    };
    expect(failureCode(admitSlotAccountingRow(mutated))).toBe("SCHEDULER_SLOT_ACCOUNTING_INVALID");
  });
});

describe("dispatch 受理判定の順序", () => {
  it("U-SSQ-015: admits a candidate satisfying every ordered check", () => {
    expect(dispatch({}).ok).toBe(true);
  });

  it("U-SSQ-016: stops at the accounting check before any later check", () => {
    const invalid = withoutKey(row(), "slot_id") as SlotAccountingRowV1;
    expect(failureCode(dispatch({ candidate: invalid, queue: queue({ queue_limit: 0 }) }))).toBe(
      "SCHEDULER_SLOT_ACCOUNTING_INVALID",
    );
  });

  it("U-SSQ-017: rejects a queue whose queue_limit is absent", () => {
    const unbounded = withoutKey(queue(), "queue_limit") as BoundedQueueSnapshotV1;
    expect(failureCode(dispatch({ queue: unbounded }))).toBe("SCHEDULER_QUEUE_UNBOUNDED");
  });

  it("U-SSQ-018: rejects a queue whose queue_limit is null", () => {
    const unbounded = { ...queue(), queue_limit: null } as unknown as BoundedQueueSnapshotV1;
    expect(failureCode(dispatch({ queue: unbounded }))).toBe("SCHEDULER_QUEUE_UNBOUNDED");
  });

  it("U-SSQ-019: rejects a queue whose queue_limit is not positive", () => {
    expect(failureCode(dispatch({ queue: queue({ queue_limit: 0 }) }))).toBe(
      "SCHEDULER_QUEUE_UNBOUNDED",
    );
  });

  it("U-SSQ-020: rejects a capacity outside one through eight", () => {
    expect(failureCode(dispatch({ queue: queue({ capacity: 9 }) }))).toBe(
      "SCHEDULER_INPUT_INVALID",
    );
    expect(failureCode(dispatch({ queue: queue({ capacity: 0 }) }))).toBe(
      "SCHEDULER_INPUT_INVALID",
    );
  });

  it("U-SSQ-021: rejects a candidate whose dependency is not ready", () => {
    expect(failureCode(dispatch({ readyDependencyIds: [] }))).toBe(
      "SCHEDULER_DEPENDENCY_NOT_READY",
    );
  });

  it("U-SSQ-028: rejects a dispatch once capacity is saturated", () => {
    const running = Array.from({ length: 8 }, (_, index) =>
      row({ slot_id: `slot-r${index}`, task_id: `task-r${index}`, parent_id: `cell-r${index}` }),
    );
    const runningScopes = Object.fromEntries(
      running.map((entry, index) => [
        entry.task_id,
        peerScope({
          task_id: entry.task_id,
          issue_id: `issue-r${index}`,
          behavior_contract_id: `contract-r${index}`,
          responsibility_owner: `owner-r${index}`,
          allowed_paths: [`src/r${index}`],
          shared_authority_ids: [`authority-r${index}`],
        }),
      ]),
    );
    expect(failureCode(dispatch({ running, runningScopes }))).toBe("SCHEDULER_CAPACITY_EXCEEDED");
  });

  it("U-SSQ-029: reports unbounded queue before capacity when both hold", () => {
    const running = Array.from({ length: 8 }, (_, index) =>
      row({ slot_id: `slot-r${index}`, task_id: `task-r${index}`, parent_id: `cell-r${index}` }),
    );
    const runningScopes = Object.fromEntries(
      running.map((entry, index) => [
        entry.task_id,
        peerScope({
          task_id: entry.task_id,
          issue_id: `issue-r${index}`,
          behavior_contract_id: `contract-r${index}`,
          responsibility_owner: `owner-r${index}`,
          allowed_paths: [`src/r${index}`],
          shared_authority_ids: [`authority-r${index}`],
        }),
      ]),
    );
    const unbounded = withoutKey(queue(), "queue_limit") as BoundedQueueSnapshotV1;
    expect(failureCode(dispatch({ running, runningScopes, queue: unbounded }))).toBe(
      "SCHEDULER_QUEUE_UNBOUNDED",
    );
  });

  it("U-SSQ-031: rejects a row whose terminated_at precedes started_at", () => {
    const reversed = row({
      started_at: "2026-08-09T02:00:00Z",
      terminated_at: "2026-08-09T01:00:00Z",
    });
    expect(failureCode(dispatch({ candidate: reversed }))).toBe("SCHEDULER_TIME_ORDER_INVALID");
  });

  it("U-SSQ-053: produces identical results for repeated evaluation", () => {
    const first = dispatch({});
    const second = dispatch({});
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe("conflict exclusion の 4 軸", () => {
  const running = [row({ slot_id: "slot-2", task_id: "task-2", parent_id: "cell-other" })];

  function withPeer(peer: ConflictScopeV1) {
    return dispatch({ running, runningScopes: { "task-2": peer } });
  }

  it("U-SSQ-022: rejects a candidate sharing the issue axis", () => {
    expect(failureCode(withPeer(peerScope({ issue_id: "issue-1" })))).toBe(
      "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION",
    );
  });

  it("U-SSQ-023: rejects a candidate sharing the behavior contract axis", () => {
    expect(failureCode(withPeer(peerScope({ behavior_contract_id: "contract-1" })))).toBe(
      "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION",
    );
  });

  it("U-SSQ-024: rejects a candidate sharing the responsibility owner axis", () => {
    expect(failureCode(withPeer(peerScope({ responsibility_owner: "owner-1" })))).toBe(
      "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION",
    );
  });

  it("U-SSQ-025: rejects a candidate sharing the shared authority axis", () => {
    expect(failureCode(withPeer(peerScope({ shared_authority_ids: ["authority-1"] })))).toBe(
      "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION",
    );
  });

  it("U-SSQ-026: rejects a candidate whose paths intersect by prefix", () => {
    expect(failureCode(withPeer(peerScope({ allowed_paths: ["src/a/nested"] })))).toBe(
      "SCHEDULER_CONFLICT_EXCLUSION_VIOLATION",
    );
  });

  it("U-SSQ-027: admits eight mutually disjoint candidates with distinct lease owners", () => {
    const rows = Array.from({ length: 8 }, (_, index) =>
      row({
        slot_id: `slot-${index}`,
        task_id: `task-${index}`,
        parent_id: `cell-${index}`,
        writer_lease: lease(`writer-${index}`),
      }),
    );
    const scopes = Object.fromEntries(
      rows.map((entry, index) => [
        entry.task_id,
        peerScope({
          task_id: entry.task_id,
          issue_id: `issue-${index}`,
          behavior_contract_id: `contract-${index}`,
          responsibility_owner: `owner-${index}`,
          allowed_paths: [`src/p${index}`],
          shared_authority_ids: [`authority-${index}`],
        }),
      ]),
    );
    for (let index = 0; index < rows.length; index += 1) {
      const result = evaluateDispatchAdmission({
        queue: queue(),
        candidate: rows[index],
        candidateScope: scopes[rows[index].task_id],
        running: rows.slice(0, index),
        runningScopes: scopes,
        readyDependencyIds: ["dep-1"],
      });
      expect(result.ok).toBe(true);
    }
    expect(new Set(rows.map((entry) => entry.writer_lease.owner)).size).toBe(8);
  });
});

describe("lease 二重所有の判定キー", () => {
  it("U-SSQ-030: rejects a same-lane candidate held by a different owner", () => {
    const running = [row({ slot_id: "slot-2", writer_lease: lease("writer-other") })];
    expect(
      failureCode(
        dispatch({ running, runningScopes: { "task-1": peerScope({ task_id: "task-1" }) } }),
      ),
    ).toBe("SCHEDULER_LEASE_DOUBLE_OWNERSHIP");
  });

  it("U-SSQ-062: rejects a same-lane same-owner candidate holding another fence token", () => {
    const running = [row({ slot_id: "slot-2", writer_lease: lease("writer-1", 2) })];
    expect(
      failureCode(
        dispatch({ running, runningScopes: { "task-1": peerScope({ task_id: "task-1" }) } }),
      ),
    ).toBe("SCHEDULER_LEASE_DOUBLE_OWNERSHIP");
  });

  it("U-SSQ-058: treats an equal fence token in another lane as non-conflicting", () => {
    const running = [
      row({
        slot_id: "slot-2",
        task_id: "task-2",
        parent_id: "cell-other",
        writer_lease: lease("writer-2", 1),
      }),
    ];
    const result = dispatch({ running, runningScopes: { "task-2": peerScope() } });
    expect(result.ok).toBe(true);
  });
});

describe("bounded queue と backpressure", () => {
  it("U-SSQ-032: returns backpressure and leaves entries untouched at the limit", () => {
    const saturated = queue({ queue_limit: 2, entries: ["task-a", "task-b"] });
    const result = admitQueueEntry({ queue: saturated, taskId: "task-c" });
    expect(failureCode(result)).toBe("SCHEDULER_QUEUE_BACKPRESSURE");
    expect(saturated.entries).toEqual(["task-a", "task-b"]);
  });

  it("U-SSQ-054: never reports backpressure as an accepted entry", () => {
    const saturated = queue({ queue_limit: 1, entries: ["task-a"] });
    const result = admitQueueEntry({ queue: saturated, taskId: "task-c" });
    expect(result.ok).toBe(false);
  });

  it("U-SSQ-060: rejects a task id already queued or running", () => {
    const populated = queue({ entries: ["task-a"], running: ["task-b"] });
    expect(failureCode(admitQueueEntry({ queue: populated, taskId: "task-a" }))).toBe(
      "SCHEDULER_INPUT_INVALID",
    );
    expect(failureCode(admitQueueEntry({ queue: populated, taskId: "task-b" }))).toBe(
      "SCHEDULER_INPUT_INVALID",
    );
  });

  it("U-SSQ-061: rejects an unbounded queue before any entry check", () => {
    const unbounded = withoutKey(queue(), "queue_limit") as BoundedQueueSnapshotV1;
    expect(failureCode(admitQueueEntry({ queue: unbounded, taskId: "task-c" }))).toBe(
      "SCHEDULER_QUEUE_UNBOUNDED",
    );
  });
});

describe("quota handover", () => {
  it("U-SSQ-033: admits a handover below the quota threshold and continues the lease lineage", () => {
    const result = handover({});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.packet.writer_lease.owner).toBe("writer-2");
      expect(result.packet.writer_lease.fence_token).toBe(2);
    }
  });

  it("U-SSQ-034: rejects a handover attempted after the threshold is reached", () => {
    const exhausted = row({ quota_snapshot: { consumed: 80, limit: 100, threshold: 80 } });
    expect(failureCode(handover({ current: exhausted }))).toBe("SCHEDULER_QUOTA_EXHAUSTED");
  });

  it("U-SSQ-035: rejects a packet missing lane_id", () => {
    expect(failureCode(handover({ packet: withoutKey(packet(), "lane_id") }))).toBe(
      "SCHEDULER_HANDOVER_PACKET_MISSING",
    );
  });

  it("U-SSQ-036: rejects a packet missing task_id", () => {
    expect(failureCode(handover({ packet: withoutKey(packet(), "task_id") }))).toBe(
      "SCHEDULER_HANDOVER_PACKET_MISSING",
    );
  });

  it("U-SSQ-037: rejects a packet missing candidate_head", () => {
    expect(failureCode(handover({ packet: withoutKey(packet(), "candidate_head") }))).toBe(
      "SCHEDULER_HANDOVER_PACKET_MISSING",
    );
  });

  it("U-SSQ-038: rejects a packet missing writer_lease", () => {
    expect(failureCode(handover({ packet: withoutKey(packet(), "writer_lease") }))).toBe(
      "SCHEDULER_HANDOVER_PACKET_MISSING",
    );
  });

  it("U-SSQ-039: rejects a packet missing remaining_scope", () => {
    expect(failureCode(handover({ packet: withoutKey(packet(), "remaining_scope") }))).toBe(
      "SCHEDULER_HANDOVER_PACKET_MISSING",
    );
  });

  it("U-SSQ-040: rejects a notification whose lane alone was mutated", () => {
    expect(failureCode(handover({ packet: packet({ lane_id: "lane-other" }) }))).toBe(
      "SCHEDULER_HANDOVER_TARGET_MISMATCH",
    );
  });

  it("U-SSQ-041: rejects a notification whose target reviewer alone was mutated", () => {
    expect(failureCode(handover({ packet: packet({ target_reviewer: "reviewer-other" }) }))).toBe(
      "SCHEDULER_HANDOVER_TARGET_MISMATCH",
    );
  });

  it("U-SSQ-042: rejects a notification whose candidate head alone was mutated", () => {
    expect(failureCode(handover({ packet: packet({ candidate_head: HEAD_B }) }))).toBe(
      "SCHEDULER_HANDOVER_TARGET_MISMATCH",
    );
  });

  it("U-SSQ-043: rejects redelivery of an acknowledged packet", () => {
    expect(failureCode(handover({ alreadyAcked: true }))).toBe("SCHEDULER_HANDOVER_ACK_REPLAY");
  });

  it("U-SSQ-044: rejects a successor acquiring before the predecessor released", () => {
    expect(failureCode(handover({ predecessorReleased: false }))).toBe(
      "SCHEDULER_LEASE_DOUBLE_OWNERSHIP",
    );
  });

  it("U-SSQ-059: reports the missing packet before the acknowledgement replay", () => {
    expect(
      failureCode(handover({ packet: withoutKey(packet(), "lane_id"), alreadyAcked: true })),
    ).toBe("SCHEDULER_HANDOVER_PACKET_MISSING");
  });
});

describe("slot failure isolation", () => {
  const peers = [row({ slot_id: "slot-peer", task_id: "task-peer", parent_id: "cell-peer" })];

  function isolation(overrides: {
    after?: SlotAccountingRowV1[];
    queueAfter?: string[];
    failedLeaseReleased?: boolean;
  }) {
    return evaluateSlotFailureIsolation({
      failed: row({ slot_id: "slot-failed", slot_state: "failed" }),
      failedLeaseReleased: overrides.failedLeaseReleased ?? true,
      peers,
      after: overrides.after ?? peers,
      queueBefore: ["task-q1", "task-q2"],
      queueAfter: overrides.queueAfter ?? ["task-q1", "task-q2"],
    });
  }

  it("U-SSQ-045: accepts a failure that leaves peers and queue untouched", () => {
    expect(isolation({}).ok).toBe(true);
  });

  it("U-SSQ-046: rejects a failure that changed a peer slot state", () => {
    const after = [
      row({
        slot_id: "slot-peer",
        task_id: "task-peer",
        parent_id: "cell-peer",
        slot_state: "failed",
      }),
    ];
    expect(failureCode(isolation({ after }))).toBe("SCHEDULER_FAILURE_ISOLATION_BREACH");
  });

  it("U-SSQ-047: rejects a failure that released a peer lease", () => {
    const after = [
      row({
        slot_id: "slot-peer",
        task_id: "task-peer",
        parent_id: "cell-peer",
        writer_lease: lease("writer-released", 9),
      }),
    ];
    expect(failureCode(isolation({ after }))).toBe("SCHEDULER_FAILURE_ISOLATION_BREACH");
  });

  it("U-SSQ-048: rejects a failure that moved queue positions", () => {
    expect(failureCode(isolation({ queueAfter: ["task-q2", "task-q1"] }))).toBe(
      "SCHEDULER_FAILURE_ISOLATION_BREACH",
    );
  });

  it("U-SSQ-055: rejects removing a failed slot before releasing its lease", () => {
    expect(failureCode(isolation({ failedLeaseReleased: false }))).toBe(
      "SCHEDULER_LEASE_DOUBLE_OWNERSHIP",
    );
  });
});

describe("frontier 再計算と merge authority", () => {
  it("U-SSQ-052: rejects a merge order decision requested from the dispatcher", () => {
    expect(failureCode(frontier({ requestsMergeOrderDecision: true }))).toBe(
      "SCHEDULER_MERGE_AUTHORITY_VIOLATION",
    );
  });

  it("U-SSQ-056: rejects a candidate revalidated against the pre-merge head", () => {
    expect(failureCode(frontier({ base_head: HEAD_A }))).toBe("SCHEDULER_INPUT_INVALID");
  });

  it("U-SSQ-057: restores a candidate revalidated on every required signal", () => {
    expect(frontier({}).ok).toBe(true);
  });

  it("U-SSQ-063: rejects a candidate whose ci has not passed", () => {
    expect(failureCode(frontier({ ci_passed: false }))).toBe("SCHEDULER_INPUT_INVALID");
  });

  it("U-SSQ-064: rejects a candidate whose review is not approved", () => {
    expect(failureCode(frontier({ review_approved: false }))).toBe("SCHEDULER_INPUT_INVALID");
  });

  it("U-SSQ-065: rejects a candidate without a database receipt digest", () => {
    expect(failureCode(frontier({ db_receipt_digest: null }))).toBe("SCHEDULER_INPUT_INVALID");
  });
});

describe("capacity evidence", () => {
  it("U-SSQ-049: admits an eight-lane fixture claiming capacity eight", () => {
    const result = admitCapacityEvidence({
      lane_count: 8,
      claimed_capacity: 8,
      fixture_path: "tests/fixtures/eight-lane.json",
    });
    expect(result.ok).toBe(true);
  });

  it("U-SSQ-050: rejects a four-lane fixture claiming capacity eight", () => {
    const result = admitCapacityEvidence({
      lane_count: 4,
      claimed_capacity: 8,
      fixture_path: "tests/fixtures/four-lane.json",
    });
    expect(failureCode(result)).toBe("SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED");
  });

  it("U-SSQ-051: rejects evidence that records no lane count", () => {
    const result = admitCapacityEvidence({
      claimed_capacity: 8,
      fixture_path: "tests/fixtures/unknown-lane.json",
    });
    expect(failureCode(result)).toBe("SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED");
  });
});
