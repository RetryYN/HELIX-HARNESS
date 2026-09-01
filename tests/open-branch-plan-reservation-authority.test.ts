import { describe, expect, it } from "vitest";
import { buildOpenBranchPlanReservationAuthoritySnapshot } from "../src/adapters/open-branch-plan-reservation-authority";
import { sha256Digest } from "../src/runtime/digest";
import { projectOpenBranchPlanReservations } from "../src/runtime/open-branch-plan-identity-reservation";

// PLAN-L7-722-open-branch-plan-reservation-production-authority

const MAIN = "a".repeat(40);
const HEAD = "b".repeat(40);
const PLAN = {
  plan_id: "PLAN-L7-722-reservation-production-adapter",
  owner_issue: 1256,
  responsibility_owner: "open-branch-plan-reservation-production",
  plan_path: "docs/plans/PLAN-L7-722-reservation-production-adapter.md",
  plan_blob_digest: sha256Digest("plan-722"),
};

function input() {
  return {
    repository: "RetryYN/HELIX-HARNESS",
    captured_at: "2026-09-01T04:30:00.000Z",
    current_main: { status: "available", head_sha: MAIN, plans: [PLAN] },
    open_pr_heads: {
      status: "available",
      pull_requests: [
        {
          pr_number: 1321,
          branch: "feature/1256-plan-reservation-production-authority",
          head_sha: HEAD,
          ancestor_head_shas: [MAIN],
          lifecycle: "open",
          terminal_evidence: null,
          plans: [PLAN],
        },
      ],
    },
    active_writer_branches: {
      status: "available",
      writers: [
        {
          assignment_id: "assignment-1256",
          branch: "feature/1256-plan-reservation-production-authority",
          head_sha: HEAD,
          ancestor_head_shas: [MAIN],
          lease_id: "lease-1256",
          fence_token: "fence-1",
          plans: [PLAN],
        },
      ],
    },
  } as const;
}

describe("open branch PLAN reservation production authority adapter", () => {
  it("U-OBPRA-001: main／open PR／active writerを同じcanonical snapshotへ投影する", () => {
    const snapshot = buildOpenBranchPlanReservationAuthoritySnapshot(input());
    expect(snapshot.reservations).toHaveLength(3);
    expect(projectOpenBranchPlanReservations(snapshot)).toMatchObject({
      ok: true,
      status: "admitted",
    });
  });

  it("U-OBPRA-002: GitHubまたはassignment unavailableをlocal greenへfallbackしない", () => {
    for (const surface of ["current_main", "open_pr_heads", "active_writer_branches"] as const) {
      const candidate = structuredClone(input()) as Record<string, unknown>;
      candidate[surface] = { status: "unavailable", error_digest: sha256Digest(surface) };
      const projection = projectOpenBranchPlanReservations(
        buildOpenBranchPlanReservationAuthoritySnapshot(candidate),
      );
      expect(projection.ok).toBe(false);
      expect(projection.unavailable_surfaces).toContain(surface);
    }
  });

  it("U-OBPRA-003: wrong lease／HEAD／unknown fieldをtyped inputで拒否する", () => {
    const original = input();
    const wrongLease = {
      ...original,
      active_writer_branches: {
        ...original.active_writer_branches,
        writers: [{ ...original.active_writer_branches.writers[0], lease_id: "" }],
      },
    };
    expect(() => buildOpenBranchPlanReservationAuthoritySnapshot(wrongLease)).toThrow();

    const wrongHead = {
      ...original,
      open_pr_heads: {
        ...original.open_pr_heads,
        pull_requests: [{ ...original.open_pr_heads.pull_requests[0], head_sha: "not-a-head" }],
      },
    };
    expect(() => buildOpenBranchPlanReservationAuthoritySnapshot(wrongHead)).toThrow();

    expect(() =>
      buildOpenBranchPlanReservationAuthoritySnapshot({ ...input(), extra: true }),
    ).toThrow();
  });

  it("U-OBPRA-004: terminal PRはmatching evidenceだけをcanonical lifecycleへ変換する", () => {
    const original = input();
    const merged = {
      ...original,
      open_pr_heads: {
        ...original.open_pr_heads,
        pull_requests: [
          {
            ...original.open_pr_heads.pull_requests[0],
            lifecycle: "merged",
            terminal_evidence: {
              recorded_at: "2026-09-01T04:29:00.000Z",
              evidence_digest: sha256Digest("merged"),
            },
          },
        ],
      },
    };
    const projection = projectOpenBranchPlanReservations(
      buildOpenBranchPlanReservationAuthoritySnapshot(merged),
    );
    expect(projection.released_reservations).toContainEqual(
      expect.objectContaining({
        lifecycle: "merged",
        terminal_evidence: expect.objectContaining({ kind: "merged" }),
      }),
    );
  });
});
