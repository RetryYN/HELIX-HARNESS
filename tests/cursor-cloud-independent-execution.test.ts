// PLAN-L7-1690-cursor-cloud-independent-execution / CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
import { describe, expect, it } from "vitest";

import {
  admitCursorBranchOwnership,
  admitCursorCloudAssignment,
  admitCursorExternalObservation,
  admitCursorIndependentReview,
  admitCursorPhaseTransition,
  type CursorCloudAssignmentV1,
  decideCursorBoundedRetry,
  evaluateCursorRuntimePolicy,
  evaluateCursorSafeRelease,
  resolveCursorLaunchOutcome,
  routeCursorReviewChanges,
} from "../src/runtime/cursor-cloud-independent-execution.js";

const assignment = (overrides: Partial<CursorCloudAssignmentV1> = {}): CursorCloudAssignmentV1 => ({
  schema_version: "cursor-cloud-assignment.v1",
  repository: "RetryYN/HELIX-HARNESS",
  assignment_id: "assignment-1293",
  action_id: "action-1",
  owner: "cursor-cloud-execution",
  issued_at: "2026-09-12T23:00:00Z",
  expires_at: "2026-09-13T01:00:00Z",
  generation: 1,
  scope_kind: "issue",
  issue_number: 1293,
  requirement_ids: ["3L-R-05", "3L-R-12"],
  test_ids: ["U-CCI-001"],
  responsibility_owner: "cursor-cloud-execution",
  branch: "feature/1293-cursor-cloud-runtime",
  base_head: "a".repeat(40),
  allowed_paths: ["src/runtime/cursor-cloud-independent-execution.ts", "tests/"],
  forbidden_paths: [".git/", ".helix/"],
  context_digest: `sha256:${"1".repeat(64)}`,
  policy_digest: `sha256:${"2".repeat(64)}`,
  descriptor_digest: `sha256:${"3".repeat(64)}`,
  requested_model: "cursor/auto",
  allowed_effective_models: ["cursor/model-a"],
  budget_snapshot_digest: `sha256:${"4".repeat(64)}`,
  budget_reservation_id: "budget-1",
  absolute_deadline: "2026-09-13T00:30:00Z",
  max_attempts: 1,
  max_parallelism: 1,
  secret_profile: "none",
  network_profile: "deny-default",
  completion_schema_digest: `sha256:${"5".repeat(64)}`,
  ...overrides,
});

const current = {
  observed_at: "2026-09-12T23:30:00Z",
  repository: "RetryYN/HELIX-HARNESS",
  assignment_id: "assignment-1293",
  owner: "cursor-cloud-execution",
  branch: "feature/1293-cursor-cloud-runtime",
  base_head: "a".repeat(40),
  branch_preissued: true,
  generation: 1,
  budget_reservation_id: "budget-1",
  budget_current: true,
};

describe("Cursor Cloud independent execution admission", () => {
  it("U-CCI-GREEN-001: accepts the exact issue-scoped envelope", () => {
    expect(admitCursorCloudAssignment({ assignment: assignment(), current })).toEqual({
      accepted: true,
      assignment: assignment(),
    });
  });

  it("U-CCI-001: rejects unknown fields and issue/PLAN ambiguity first", () => {
    expect(
      admitCursorCloudAssignment({ assignment: { ...assignment(), extra: true }, current }),
    ).toEqual({
      accepted: false,
      reason: "CURSOR_ASSIGNMENT_SCHEMA_INVALID",
    });
    expect(
      admitCursorCloudAssignment({
        assignment: { ...assignment(), plan_id: "PLAN-L7-X" },
        current,
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_ASSIGNMENT_SCHEMA_INVALID" });
    for (const invalid of [
      assignment({ issue_number: 0 }),
      assignment({ issued_at: "2026-09-13T02:00:00Z" }),
      assignment({ issued_at: "2026-09-12T23:00:00+00:00" }),
    ]) {
      expect(admitCursorCloudAssignment({ assignment: invalid, current })).toEqual({
        accepted: false,
        reason: "CURSOR_ASSIGNMENT_SCHEMA_INVALID",
      });
    }
  });

  it("U-CCI-002: rejects unsafe and overlapping paths", () => {
    for (const allowed_paths of [["/tmp/x"], ["../escape"], ["src/", "src/runtime/x.ts"]]) {
      expect(
        admitCursorCloudAssignment({ assignment: assignment({ allowed_paths }), current }),
      ).toEqual({
        accepted: false,
        reason: "CURSOR_ASSIGNMENT_SCHEMA_INVALID",
      });
    }
  });

  it("U-CCI-003: rejects a branch not pre-issued by HELIX", () => {
    expect(
      admitCursorCloudAssignment({
        assignment: assignment(),
        current: { ...current, branch_preissued: false },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_BRANCH_NOT_PREISSUED" });
  });

  it("U-CCI-006: rejects unknown or stale budget", () => {
    expect(
      admitCursorCloudAssignment({
        assignment: assignment(),
        current: { ...current, budget_current: false },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_BUDGET_UNAVAILABLE" });
    expect(
      admitCursorCloudAssignment({
        assignment: assignment(),
        current: { ...current, budget_reservation_id: "foreign-budget" },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_BUDGET_UNAVAILABLE" });
  });

  it("U-CCI-007: requires external read-after identity equality", () => {
    expect(
      admitCursorCloudAssignment({
        assignment: assignment({ expires_at: "2026-09-12T23:29:59Z" }),
        current: { ...current, owner: "foreign" },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_ASSIGNMENT_AUTHORITY_STALE" });
    expect(
      admitCursorCloudAssignment({
        assignment: assignment({ absolute_deadline: "2026-09-12T23:29:59Z" }),
        current,
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_ASSIGNMENT_AUTHORITY_STALE" });
    expect(
      admitCursorCloudAssignment({
        assignment: assignment(),
        current: { ...current, base_head: "b".repeat(40) },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_PREDISPATCH_IDENTITY_MISMATCH" });
  });

  it("U-CCI-004: ownership is repository+branch+generation fenced", () => {
    const owned = {
      repository: assignment().repository,
      branch: assignment().branch,
      assignment_id: assignment().assignment_id,
      action_id: assignment().action_id,
      owner: assignment().owner,
      generation: 1,
      fence_token: 7,
      acquired_at: "2026-09-12T23:00:00Z",
      expires_at: "2026-09-13T00:00:00Z",
      renewal_count: 0,
      state: "active" as const,
    };
    expect(
      admitCursorBranchOwnership({
        assignment: assignment(),
        ownership: owned,
        observed_at: current.observed_at,
      }),
    ).toEqual({ accepted: true, fence_token: 7 });
    expect(
      admitCursorBranchOwnership({
        assignment: assignment(),
        ownership: { ...owned, generation: 2 },
        observed_at: current.observed_at,
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" });
  });

  it("U-CCI-005: stale, released and invalid-fence ownership is rejected", () => {
    const owned = {
      repository: assignment().repository,
      branch: assignment().branch,
      assignment_id: assignment().assignment_id,
      action_id: assignment().action_id,
      owner: assignment().owner,
      generation: 1,
      fence_token: 7,
      acquired_at: "2026-09-12T23:00:00Z",
      expires_at: "2026-09-13T00:00:00Z",
      renewal_count: 0,
      state: "active" as const,
    };
    for (const ownership of [
      { ...owned, state: "released" as const },
      { ...owned, fence_token: 0 },
      { ...owned, expires_at: "2026-09-12T23:29:59Z" },
      { ...owned, renewal_count: -1 },
      { ...owned, acquired_at: "2026-09-13T00:01:00Z" },
    ]) {
      expect(
        admitCursorBranchOwnership({
          assignment: assignment(),
          ownership,
          observed_at: current.observed_at,
        }),
      ).toEqual({ accepted: false, reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" });
    }
    for (const ownership of [null, [], { repository: assignment().repository }]) {
      expect(
        admitCursorBranchOwnership({
          assignment: assignment(),
          ownership,
          observed_at: current.observed_at,
        }),
      ).toEqual({ accepted: false, reason: "CURSOR_BRANCH_OWNERSHIP_CONFLICT" });
    }
  });

  it("U-CCI-008: ambiguous launch never permits blind retry", () => {
    expect(resolveCursorLaunchOutcome({ kind: "transport_unknown" })).toEqual({
      action: "hold_and_read_after",
      retry_allowed: false,
      reason: "CURSOR_LAUNCH_OUTCOME_UNKNOWN",
    });
    expect(resolveCursorLaunchOutcome({ kind: "http_response", status_code: 409 })).toEqual({
      action: "read_after",
      retry_allowed: false,
      reason: "CURSOR_LAUNCH_OUTCOME_UNKNOWN",
    });
    expect(resolveCursorLaunchOutcome({ kind: "accepted", run_id: "run-1" })).toEqual({
      action: "read_after",
      retry_allowed: false,
      run_id: "run-1",
    });
  });

  it("U-CCI-016: release needs terminal, writer-disabled and cost reconciliation", () => {
    const proof = {
      provider_terminal: true,
      writer_disabled: true,
      pending_writes: 0,
      cost_state: "reconciled" as const,
      generation: 1,
      observed_generation: 1,
    };
    expect(evaluateCursorSafeRelease(proof)).toEqual({ safe: true });
    for (const invalid of [
      { ...proof, provider_terminal: false },
      { ...proof, writer_disabled: false },
      { ...proof, pending_writes: 1 },
      { ...proof, cost_state: "unknown" as const },
      { ...proof, observed_generation: 2 },
    ]) {
      expect(evaluateCursorSafeRelease(invalid)).toEqual({
        safe: false,
        reason: "CURSOR_SAFE_RELEASE_UNPROVEN",
      });
    }
  });

  it("U-CCI-011: external observation requires two independent legs", () => {
    const observation = {
      schema_version: "cursor-external-run-observation.v1" as const,
      run_id: "run-1",
      assignment_id: assignment().assignment_id,
      action_id: assignment().action_id,
      owner: assignment().owner,
      branch: assignment().branch,
      base_head: assignment().base_head,
      candidate_head: "b".repeat(40),
      pr_number: 1777,
      requested_model: "cursor/auto",
      effective_model: "cursor/model-a",
      usage_state: "known" as const,
      cost_state: "known" as const,
      changed_paths: ["src/runtime/cursor-cloud-independent-execution.ts"],
      diff_bytes_digest: `sha256:${"6".repeat(64)}`,
      test_receipt_digests: [`sha256:${"7".repeat(64)}`],
      launch_observed_at: "2026-09-12T23:31:00Z",
      collection_observed_at: "2026-09-12T23:40:00Z",
      launch_reader_identity: "node-reader-a",
      collection_reader_identity: "node-reader-b",
      observation_digest: `sha256:${"8".repeat(64)}`,
    };
    expect(admitCursorExternalObservation({ assignment: assignment(), observation })).toEqual({
      accepted: true,
      observation,
    });
    expect(
      admitCursorExternalObservation({
        assignment: assignment(),
        observation: { ...observation, collection_observed_at: observation.launch_observed_at },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" });
    for (const untrusted of [
      null,
      [],
      "observation",
      { schema_version: "cursor-external-run-observation.v1" },
    ]) {
      expect(
        admitCursorExternalObservation({ assignment: assignment(), observation: untrusted }),
      ).toEqual({
        accepted: false,
        reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID",
      });
    }
    expect(
      admitCursorExternalObservation({
        assignment: assignment(),
        observation: { ...observation, untrusted_extra: true } as typeof observation,
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" });
    const { collection_reader_identity: _missingReader, ...missingKnownField } = observation;
    expect(
      admitCursorExternalObservation({ assignment: assignment(), observation: missingKnownField }),
    ).toEqual({ accepted: false, reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID" });
  });

  it("U-CCI-012: rejects foreign HEAD lineage and unknown cost", () => {
    const base = {
      schema_version: "cursor-external-run-observation.v1" as const,
      run_id: "run-1",
      assignment_id: assignment().assignment_id,
      action_id: assignment().action_id,
      owner: assignment().owner,
      branch: assignment().branch,
      base_head: assignment().base_head,
      candidate_head: "b".repeat(40),
      pr_number: 1777,
      requested_model: "cursor/auto",
      effective_model: "cursor/model-a",
      usage_state: "known" as const,
      cost_state: "known" as const,
      changed_paths: ["src/runtime/cursor-cloud-independent-execution.ts"],
      diff_bytes_digest: `sha256:${"6".repeat(64)}`,
      test_receipt_digests: [`sha256:${"7".repeat(64)}`],
      launch_observed_at: "2026-09-12T23:31:00Z",
      collection_observed_at: "2026-09-12T23:40:00Z",
      launch_reader_identity: "node-reader-a",
      collection_reader_identity: "node-reader-b",
      observation_digest: `sha256:${"8".repeat(64)}`,
    };
    for (const observation of [
      { ...base, base_head: "c".repeat(40) },
      { ...base, requested_model: "cursor/foreign" },
      { ...base, usage_state: "unknown" as const },
      { ...base, cost_state: "unknown" as const },
    ]) {
      expect(admitCursorExternalObservation({ assignment: assignment(), observation })).toEqual({
        accepted: false,
        reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID",
      });
    }
  });

  it("U-CCI-013: rejects an unsafe remote output path", () => {
    const observation = {
      schema_version: "cursor-external-run-observation.v1" as const,
      run_id: "run-1",
      assignment_id: assignment().assignment_id,
      action_id: assignment().action_id,
      owner: assignment().owner,
      branch: assignment().branch,
      base_head: assignment().base_head,
      candidate_head: "b".repeat(40),
      pr_number: 1777,
      requested_model: "cursor/auto",
      effective_model: "cursor/model-a",
      usage_state: "known" as const,
      cost_state: "known" as const,
      changed_paths: ["../escape"],
      diff_bytes_digest: `sha256:${"6".repeat(64)}`,
      test_receipt_digests: [`sha256:${"7".repeat(64)}`],
      launch_observed_at: "2026-09-12T23:31:00Z",
      collection_observed_at: "2026-09-12T23:40:00Z",
      launch_reader_identity: "node-reader-a",
      collection_reader_identity: "node-reader-b",
      observation_digest: `sha256:${"8".repeat(64)}`,
    };
    expect(admitCursorExternalObservation({ assignment: assignment(), observation })).toEqual({
      accepted: false,
      reason: "CURSOR_EXTERNAL_OBSERVATION_INVALID",
    });
  });

  it("U-CCI-009: runtime policy needs effective scope, secret and network enforcement", () => {
    const proof = {
      scope_enforced: true,
      secret_profile: assignment().secret_profile,
      network_profile: assignment().network_profile,
      cost_within_reservation: true,
      deadline_enforced: true,
      observed_at: "2026-09-12T23:40:00Z",
    };
    expect(evaluateCursorRuntimePolicy({ assignment: assignment(), proof })).toEqual({
      accepted: true,
    });
    for (const invalid of [
      { ...proof, scope_enforced: false },
      { ...proof, secret_profile: "foreign" },
      { ...proof, network_profile: "open" },
    ]) {
      expect(evaluateCursorRuntimePolicy({ assignment: assignment(), proof: invalid })).toEqual({
        accepted: false,
        reason: "CURSOR_RUNTIME_POLICY_VIOLATION",
      });
    }
  });

  it("U-CCI-010: runtime policy requires current cost and deadline enforcement", () => {
    const proof = {
      scope_enforced: true,
      secret_profile: assignment().secret_profile,
      network_profile: assignment().network_profile,
      cost_within_reservation: true,
      deadline_enforced: true,
      observed_at: "2026-09-12T23:40:00Z",
    };
    for (const invalid of [
      { ...proof, cost_within_reservation: false },
      { ...proof, deadline_enforced: false },
      { ...proof, observed_at: "2026-09-13T00:30:00Z" },
    ]) {
      expect(evaluateCursorRuntimePolicy({ assignment: assignment(), proof: invalid })).toEqual({
        accepted: false,
        reason: "CURSOR_RUNTIME_POLICY_VIOLATION",
      });
    }
  });

  it("U-CCI-014: independent review is exact-head and cannot be self-review", () => {
    const review = {
      assignment_id: assignment().assignment_id,
      branch: assignment().branch,
      candidate_head: "b".repeat(40),
      reviewer: "claude-independent",
      worker: assignment().owner,
      verdict: "approve" as const,
    };
    expect(
      admitCursorIndependentReview({
        assignment: assignment(),
        expected_candidate_head: "b".repeat(40),
        review,
      }),
    ).toEqual({ accepted: true, verdict: "approve" });
    expect(
      admitCursorIndependentReview({
        assignment: assignment(),
        expected_candidate_head: "b".repeat(40),
        review: { ...review, reviewer: assignment().owner },
      }),
    ).toEqual({ accepted: false, reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" });
    for (const untrusted of [
      null,
      [],
      { assignment_id: assignment().assignment_id },
      { ...review, extra: true },
    ]) {
      expect(
        admitCursorIndependentReview({
          assignment: assignment(),
          expected_candidate_head: "b".repeat(40),
          review: untrusted,
        }),
      ).toEqual({ accepted: false, reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" });
    }
  });

  it("U-CCI-015: changes requested returns only to the same assignment and branch", () => {
    expect(
      routeCursorReviewChanges({
        assignment: assignment(),
        review_assignment_id: assignment().assignment_id,
        review_branch: assignment().branch,
        verdict: "changes_requested",
      }),
    ).toEqual({
      action: "return_same_assignment",
      assignment_id: assignment().assignment_id,
      branch: assignment().branch,
    });
    expect(
      routeCursorReviewChanges({
        assignment: assignment(),
        review_assignment_id: "foreign",
        review_branch: assignment().branch,
        verdict: "changes_requested",
      }),
    ).toEqual({ action: "deny", reason: "CURSOR_REVIEW_STALE_OR_FOREIGN" });
  });

  it("U-CCI-017: Phase A/B transition rejects dual writers and live predecessor", () => {
    const proof = {
      predecessor_terminal: true,
      predecessor_writer_disabled: true,
      dual_writer_count: 0,
      fresh_fence_observed: true,
    };
    expect(admitCursorPhaseTransition(proof)).toEqual({ accepted: true });
    for (const invalid of [
      { ...proof, predecessor_terminal: false },
      { ...proof, predecessor_writer_disabled: false },
      { ...proof, dual_writer_count: 1 },
      { ...proof, fresh_fence_observed: false },
    ])
      expect(admitCursorPhaseTransition(invalid)).toEqual({
        accepted: false,
        reason: "CURSOR_SAFE_RELEASE_UNPROVEN",
      });
  });

  it("U-CCI-018: retry is bounded without stopping peer lanes", () => {
    expect(
      decideCursorBoundedRetry({
        attempt: 1,
        max_attempts: 2,
        elapsed_ms: 10,
        max_elapsed_ms: 100,
        cost_current: true,
      }),
    ).toEqual({ action: "retry_same_action", peer_lanes_affected: false });
    expect(
      decideCursorBoundedRetry({
        attempt: 2,
        max_attempts: 2,
        elapsed_ms: 10,
        max_elapsed_ms: 100,
        cost_current: true,
      }),
    ).toEqual({ action: "remain_unresolved", peer_lanes_affected: false });
    expect(
      decideCursorBoundedRetry({
        attempt: 1,
        max_attempts: 2,
        elapsed_ms: 101,
        max_elapsed_ms: 100,
        cost_current: true,
      }),
    ).toEqual({ action: "remain_unresolved", peer_lanes_affected: false });
  });
});
