import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  evaluateAssignmentReviewReturn,
  evaluateAssignmentTakeover,
  projectResidentLaneAssignments,
  type ResidentLaneAssignmentV1,
} from "../src/runtime/resident-lane-assignment";

// PLAN-L7-860-resident-lane-assignment-kernel

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);

function assignment(overrides: Partial<ResidentLaneAssignmentV1> = {}): ResidentLaneAssignmentV1 {
  return {
    schema_version: "helix-resident-lane-assignment.v2",
    assignment_id: "assignment:RetryYN/HELIX-HARNESS#860:feature/860-assignment",
    repository: "RetryYN/HELIX-HARNESS",
    scope_ref: "issue:RetryYN/HELIX-HARNESS#860",
    scope_body_digest: sha256Digest("scope"),
    acceptance_digest: sha256Digest("acceptance"),
    branch: "feature/860-assignment",
    base_sha: BASE,
    candidate_head: HEAD,
    assigned_lane_id: "codex-worker-01",
    assigned_role: "worker",
    lease_id: "lease-860",
    lease_fence: 1,
    created_at: "2026-09-12T11:00:00.000Z",
    expires_at: "2026-09-12T12:00:00.000Z",
    ...overrides,
  };
}

describe("resident lane assignment kernel", () => {
  it("U-RLA-001: exactly-one scope authorityを持つassignmentを受理する", () => {
    const result = projectResidentLaneAssignments({
      observed_at: "2026-09-12T11:30:00.000Z",
      assignments: [assignment()],
    });
    expect(result).toMatchObject({ ok: true, active_assignments: [assignment()] });
  });

  it("U-RLA-002: scope欠落・Issue/PLAN併記・unknown fieldをfail-closeする", () => {
    for (const candidate of [
      { ...assignment(), scope_ref: "" },
      {
        ...assignment(),
        issue_ref: "issue:RetryYN/HELIX-HARNESS#860",
        plan_ref: "plan:PLAN-L7-860-resident-lane-assignment-kernel",
      },
      { ...assignment(), provider_session: "not-authority" },
      { ...assignment(), scope_ref: "issue:RetryYN/OTHER#860" },
      { ...assignment(), branch: "feature/invalid..branch" },
      { ...assignment(), branch: "feature/invalid branch" },
      { ...assignment(), branch: "feature/invalid.lock" },
      { ...assignment(), branch: "feature/.hidden" },
      { ...assignment(), branch: "refs/heads/main" },
      { ...assignment(), branch: "-invalid" },
    ]) {
      expect(
        projectResidentLaneAssignments({
          observed_at: "2026-09-12T11:30:00.000Z",
          assignments: [candidate],
        }),
      ).toMatchObject({ ok: false, failure_codes: ["ASSIGNMENT_INPUT_INVALID"] });
    }
  });

  it("U-RLA-003: expired leaseを独立dispositionで拒否する", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T12:00:00.000Z",
        assignments: [assignment()],
      }),
    ).toMatchObject({ ok: false, failure_codes: ["ASSIGNMENT_LEASE_EXPIRED"] });
  });

  it("U-RLA-016: 観測時刻より未来開始のleaseをactiveへ昇格させない", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T10:59:59.000Z",
        assignments: [assignment()],
      }),
    ).toMatchObject({
      ok: false,
      active_assignments: [],
      failure_codes: ["ASSIGNMENT_INPUT_INVALID"],
    });
  });

  it("U-RLA-017: 非有効leaseをactive競合判定から除外する", () => {
    const current = assignment({
      assignment_id: "assignment:current",
      created_at: "2026-09-12T12:00:00.000Z",
      expires_at: "2026-09-12T13:00:00.000Z",
    });
    const expired = assignment({
      assignment_id: "assignment:expired",
      assigned_lane_id: "codex-worker-old",
      lease_id: "lease-old",
      created_at: "2026-09-12T10:00:00.000Z",
      expires_at: "2026-09-12T11:00:00.000Z",
    });
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T12:30:00.000Z",
        assignments: [current, expired],
      }),
    ).toEqual({
      ok: false,
      active_assignments: [current],
      failure_codes: ["ASSIGNMENT_LEASE_EXPIRED"],
    });
  });

  it("U-RLA-018: 非active recordでもassignment ID改変を検出する", () => {
    const expired = assignment({ expires_at: "2026-09-12T11:30:00.000Z" });
    const altered = assignment({
      candidate_head: "c".repeat(40),
      expires_at: "2026-09-12T11:30:00.000Z",
    });
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T12:00:00.000Z",
        assignments: [expired, altered],
      }),
    ).toEqual({
      ok: false,
      active_assignments: [],
      failure_codes: ["ASSIGNMENT_ID_CONFLICT", "ASSIGNMENT_LEASE_EXPIRED"],
    });
  });

  it("U-RLA-010: 同じassignment IDの異内容replayを拒否する", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [assignment(), assignment({ candidate_head: "c".repeat(40) })],
      }),
    ).toMatchObject({
      ok: false,
      failure_codes: ["ASSIGNMENT_ID_CONFLICT"],
    });
  });

  it("U-RLA-004: 同一branchの二重writerを拒否する", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [
          assignment(),
          assignment({ assignment_id: "assignment:other", assigned_lane_id: "codex-worker-02" }),
        ],
      }),
    ).toMatchObject({
      ok: false,
      failure_codes: ["ASSIGNMENT_DUPLICATE_BRANCH_WRITER"],
    });
  });

  it("U-RLA-005: 一Issueの二active branchを拒否する", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [
          assignment(),
          assignment({
            assignment_id: "assignment:other",
            branch: "feature/860-other",
            assigned_lane_id: "codex-worker-02",
          }),
        ],
      }),
    ).toMatchObject({
      ok: false,
      failure_codes: ["ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT"],
    });
  });

  it("U-RLA-011: branchとscopeの競合をrepository内に限定する", () => {
    const otherRepository = assignment({
      assignment_id: "assignment:RetryYN/OTHER#860:feature/860-assignment",
      repository: "RetryYN/OTHER",
      scope_ref: "issue:RetryYN/OTHER#860",
      assigned_lane_id: "codex-worker-02",
      lease_id: "lease-other-860",
    });
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [assignment(), otherRepository],
      }),
    ).toMatchObject({ ok: true, active_assignments: [assignment(), otherRepository] });
  });

  it("U-RLA-012: repositoryの大小文字差でbranch writer競合を回避させない", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [
          assignment(),
          assignment({
            assignment_id: "assignment:other",
            repository: "retryyn/helix-harness",
            scope_ref: "issue:retryyn/helix-harness#861",
            assigned_lane_id: "codex-worker-02",
          }),
        ],
      }),
    ).toMatchObject({ ok: false, failure_codes: ["ASSIGNMENT_DUPLICATE_BRANCH_WRITER"] });
  });

  it("U-RLA-013: colonを含むwriter tupleを曖昧な連結keyへ畳み込まない", () => {
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [
          assignment({ assignment_id: "a:b", assigned_lane_id: "c", lease_id: "d" }),
          assignment({ assignment_id: "a", assigned_lane_id: "b:c", lease_id: "d" }),
        ],
      }),
    ).toMatchObject({ ok: false, failure_codes: ["ASSIGNMENT_DUPLICATE_BRANCH_WRITER"] });
  });

  it("U-RLA-014: Issue repositoryの大小文字差を同一GitHub identityとして受理する", () => {
    const mixedCase = assignment({ scope_ref: "issue:retryyn/helix-harness#860" });
    expect(
      projectResidentLaneAssignments({
        observed_at: "2026-09-12T11:30:00.000Z",
        assignments: [mixedCase],
      }),
    ).toMatchObject({ ok: true, active_assignments: [mixedCase] });
  });

  it("U-RLA-015: 同一IDの競合recordも入力順に依存せず投影する", () => {
    const left = assignment();
    const right = assignment({ candidate_head: "c".repeat(40) });
    const forward = projectResidentLaneAssignments({
      observed_at: "2026-09-12T11:30:00.000Z",
      assignments: [left, right],
    });
    const reversed = projectResidentLaneAssignments({
      observed_at: "2026-09-12T11:30:00.000Z",
      assignments: [right, left],
    });
    expect(reversed).toEqual(forward);
  });

  it("U-RLA-006: observed branch／HEAD／fenceのdriftを別々に拒否する", () => {
    const current = assignment();
    expect(
      evaluateAssignmentReviewReturn({
        assignment: current,
        worker_lane_id: current.assigned_lane_id,
        branch: "feature/foreign",
        candidate_head: HEAD,
        lease_fence: 1,
      }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_FOREIGN_BRANCH" });
    expect(
      evaluateAssignmentReviewReturn({
        assignment: current,
        worker_lane_id: current.assigned_lane_id,
        branch: current.branch,
        candidate_head: "c".repeat(40),
        lease_fence: 1,
      }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_STALE_CANDIDATE_HEAD" });
    expect(
      evaluateAssignmentReviewReturn({
        assignment: current,
        worker_lane_id: current.assigned_lane_id,
        branch: current.branch,
        candidate_head: HEAD,
        lease_fence: 0,
      }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_STALE_FENCE" });
  });

  it("U-RLA-007: changes requestedは元worker・同branchへだけ戻す", () => {
    const current = assignment();
    expect(
      evaluateAssignmentReviewReturn({
        assignment: current,
        worker_lane_id: current.assigned_lane_id,
        branch: current.branch,
        candidate_head: HEAD,
        lease_fence: 1,
      }),
    ).toEqual({ ok: true, disposition: "RETURN_TO_ORIGINAL_WRITER" });
    expect(
      evaluateAssignmentReviewReturn({
        assignment: current,
        worker_lane_id: "codex-worker-02",
        branch: current.branch,
        candidate_head: HEAD,
        lease_fence: 1,
      }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_FOREIGN_WRITER" });
  });

  it("U-RLA-008: takeoverは旧lease終端・handover・new fenceをすべて要求する", () => {
    const current = assignment();
    const valid = {
      assignment: current,
      previous_lease_ended: true,
      handover_receipt_digest: sha256Digest("handover"),
      remote_branch_head: HEAD,
      next_lane_id: "codex-worker-02",
      next_lease_id: "lease-861",
      next_lease_fence: 2,
      reassigned_at: "2026-09-12T12:00:01.000Z",
      expires_at: "2026-09-12T13:00:00.000Z",
    } as const;
    expect(evaluateAssignmentTakeover(valid)).toMatchObject({
      ok: true,
      assignment: {
        assigned_lane_id: "codex-worker-02",
        branch: current.branch,
        lease_fence: 2,
      },
    });
    expect(evaluateAssignmentTakeover({ ...valid, previous_lease_ended: false })).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE",
    });
    expect(evaluateAssignmentTakeover({ ...valid, handover_receipt_digest: null })).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_HANDOVER_RECEIPT_MISSING",
    });
    expect(evaluateAssignmentTakeover({ ...valid, remote_branch_head: "c".repeat(40) })).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_STALE_CANDIDATE_HEAD",
    });
    expect(evaluateAssignmentTakeover({ ...valid, next_lease_id: current.lease_id })).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_INPUT_INVALID",
    });
    expect(
      evaluateAssignmentTakeover({ ...valid, next_lane_id: current.assigned_lane_id }),
    ).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_INPUT_INVALID",
    });
    expect(evaluateAssignmentTakeover({ ...valid, next_lease_fence: 1 })).toEqual({
      ok: false,
      failure_code: "ASSIGNMENT_STALE_FENCE",
    });
    expect(
      evaluateAssignmentTakeover({ ...valid, reassigned_at: "2026-09-12T10:59:59.000Z" }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" });
    expect(
      evaluateAssignmentTakeover({
        ...valid,
        assignment: assignment({ lease_fence: Number.MAX_SAFE_INTEGER }),
        next_lease_fence: Number.MAX_SAFE_INTEGER,
      }),
    ).toEqual({ ok: false, failure_code: "ASSIGNMENT_STALE_FENCE" });
  });

  it("U-RLA-009: duplicate/replayを同一projectionへ収束させる", () => {
    const once = projectResidentLaneAssignments({
      observed_at: "2026-09-12T11:30:00.000Z",
      assignments: [assignment()],
    });
    const replayed = projectResidentLaneAssignments({
      observed_at: "2026-09-12T11:30:00.000Z",
      assignments: [assignment(), assignment()],
    });
    expect(replayed).toEqual(once);
  });
});
