import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import { reserveForwardReverseTerminalPair } from "../src/runtime/forward-reverse-terminal-reservation";
import {
  OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
  type OpenBranchPlanReservationSnapshot,
} from "../src/runtime/open-branch-plan-identity-reservation";

const MAIN = "1".repeat(40);
const HEAD = "2".repeat(40);

// PLAN-L7-720-forward-reverse-terminal-reservation

function snapshot(): OpenBranchPlanReservationSnapshot {
  return {
    schema_version: OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
    repository: "RetryYN/HELIX-HARNESS",
    captured_at: "2026-09-01T00:00:00.000Z",
    evidence: {
      current_main: { status: "available", error_digest: null },
      open_pr_heads: { status: "available", error_digest: null },
      active_writer_branches: { status: "available", error_digest: null },
    },
    reservations: [
      {
        plan_id: "PLAN-L7-700-main-plan",
        owner_issue: 1200,
        responsibility_owner: "main-plan",
        plan_path: "docs/plans/PLAN-L7-700-main-plan.md",
        plan_blob_digest: sha256Digest("main"),
        head_sha: MAIN,
        ancestor_head_shas: [],
        source: { kind: "current_main", branch: "main" },
        lifecycle: "current",
        terminal_evidence: null,
      },
    ],
  };
}

function input() {
  return {
    forward: {
      plan_id: "PLAN-L7-720-forward-reverse-reservation",
      kind: "add-impl" as const,
      target_axis: "workflow_model" as const,
      target_id: "ADD_FEATURE" as const,
      owner_issue: 1297,
      responsibility_owner: "forward-reverse-terminal-reservation",
      plan_blob_digest: sha256Digest("forward"),
    },
    allocation: {
      allocation_id: "allocation-1297",
      forward_plan_id: "PLAN-L7-720-forward-reverse-reservation",
      reverse_plan_id: "PLAN-REVERSE-720-forward-reverse-reservation",
      reverse_plan_blob_digest: sha256Digest("reverse"),
      receipt_digest: sha256Digest("allocation"),
    },
    branch: "feature/1297-forward-reverse-reservation",
    assignment_id: "assignment-1297",
    lease_id: "lease-1297",
    fence_token: "fence-1297",
    candidate_head: HEAD,
    ancestor_head_shas: [MAIN],
    expected_main_head: MAIN,
    observed_main_head: MAIN,
    reservation_snapshot: snapshot(),
  };
}

describe("Forward／pending Reverse terminal reservation", () => {
  it("U-FRTR-001: allocator receiptから双方向pending pairを同時予約する", () => {
    const result = reserveForwardReverseTerminalPair(input());
    expect(result).toMatchObject({ ok: true, findings: [] });
    expect(result.forward).toMatchObject({
      backfill_state: "pending_reverse",
      completion_claim_allowed: false,
      references: ["docs/plans/PLAN-REVERSE-720-forward-reverse-reservation.md"],
    });
    expect(result.reverse).toMatchObject({
      backfill_state: "pending_reverse",
      completion_claim_allowed: false,
      references: ["docs/plans/PLAN-L7-720-forward-reverse-reservation.md"],
    });
    expect(result.reservations).toHaveLength(2);
    expect(result.reservation_projection?.ok).toBe(true);
  });

  it("U-FRTR-002: wrong allocator identityとstale mainをfail-closeする", () => {
    for (const [_name, override, code] of [
      [
        "wrong allocator forward",
        { allocation: { ...input().allocation, forward_plan_id: "PLAN-L7-721-wrong" } },
        "allocator_forward_identity_mismatch",
      ],
      [
        "wrong Reverse family",
        { allocation: { ...input().allocation, reverse_plan_id: "PLAN-REVERSE-721-wrong" } },
        "allocator_reverse_identity_mismatch",
      ],
      ["stale main", { observed_main_head: "3".repeat(40) }, "stale_main"],
    ] as const) {
      const result = reserveForwardReverseTerminalPair({ ...input(), ...override });
      expect(result.ok).toBe(false);
      expect(result.findings).toContain(code);
      expect(result.reservations).toEqual([]);
    }
  });

  it("U-FRTR-003: active reservation collisionを既存projectionで拒否する", () => {
    const base = input();
    const result = reserveForwardReverseTerminalPair({
      ...base,
      reservation_snapshot: {
        ...base.reservation_snapshot,
        reservations: [
          ...base.reservation_snapshot.reservations,
          {
            ...base.reservation_snapshot.reservations[0],
            plan_id: base.forward.plan_id,
            plan_path: `docs/plans/${base.forward.plan_id}.md`,
            owner_issue: 999,
            responsibility_owner: "other-owner",
            plan_blob_digest: sha256Digest("other"),
            head_sha: "4".repeat(40),
            ancestor_head_shas: [MAIN],
            source: {
              kind: "active_writer",
              branch: "feature/other",
              assignment_id: "assignment-other",
              lease_id: "lease-other",
              fence_token: "fence-other",
            },
            lifecycle: "active",
          },
        ],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toContain("reservation_projection_rejected");
  });

  it("U-FRTR-004: legacy route identityとReverse証拠を予約出力へ生成しない", () => {
    const result = reserveForwardReverseTerminalPair(input());
    expect(JSON.stringify(result)).not.toMatch(/route_mode|review_evidence|mode/);
  });
});
