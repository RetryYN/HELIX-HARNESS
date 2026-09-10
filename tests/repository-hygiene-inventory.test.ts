import { describe, expect, it } from "vitest";
import { analyzeRepositoryHygiene } from "../src/audit/repository-hygiene";

// PLAN-L7-1110-repository-hygiene-inventory
describe("repository hygiene inventory", () => {
  const mainHead = "a".repeat(40);
  const mergedHead = "b".repeat(40);

  it("U-RHYG-001: permits reclamation only for clean main-reachable unowned worktrees", () => {
    const result = analyzeRepositoryHygiene({
      main: {
        status: "available",
        ref: "origin/main",
        default_branch: "main",
        head: mainHead,
        history_complete: true,
      },
      open_pr_heads: { status: "available", branches: [] },
      active_writer_branches: { status: "available", branches: [] },
      worktrees: [
        {
          path: "/repo/merged",
          head: mergedHead,
          branch: "feature/merged",
          cleanliness: "clean",
          main_reachable: true,
          prunable: false,
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.worktrees[0]).toMatchObject({
      disposition: "reclaim_candidate",
      reasons: ["clean_main_reachable_unowned"],
    });
  });

  it("U-RHYG-002: protects dirty, unmerged, open PR, and active writer worktrees", () => {
    for (const [caseName, override, reason] of [
      ["dirty", { cleanliness: "dirty" as const }, "dirty"],
      ["unmerged", { main_reachable: false }, "not_main_reachable"],
      ["open PR", {}, "open_pr"],
      ["active writer", {}, "active_writer"],
    ] as const) {
      const branch = `feature/${caseName.replaceAll(" ", "-")}`;
      const result = analyzeRepositoryHygiene({
        main: {
          status: "available",
          ref: "origin/main",
          default_branch: "main",
          head: mainHead,
          history_complete: true,
        },
        open_pr_heads: {
          status: "available",
          branches: reason === "open_pr" ? [{ branch, head: mergedHead }] : [],
        },
        active_writer_branches: {
          status: "available",
          branches:
            reason === "active_writer"
              ? [
                  {
                    branch,
                    head: mergedHead,
                    assignment_id: "assignment-1",
                    lease_id: "lease-1",
                    fence_token: "1",
                  },
                ]
              : [],
        },
        worktrees: [
          {
            path: `/repo/${caseName}`,
            head: mergedHead,
            branch,
            cleanliness: "clean",
            main_reachable: true,
            prunable: false,
            ...override,
          },
        ],
      });

      expect(result.worktrees[0]).toMatchObject({ disposition: "protected" });
      expect(result.worktrees[0]?.reasons).toContain(reason);
    }
  });

  it("U-RHYG-003: fails closed for detached worktrees and unavailable evidence", () => {
    const unavailable = analyzeRepositoryHygiene({
      main: {
        status: "available",
        ref: "origin/main",
        default_branch: "main",
        head: mainHead,
        history_complete: true,
      },
      open_pr_heads: { status: "unavailable", error_digest: `sha256:${"c".repeat(64)}` },
      active_writer_branches: { status: "available", branches: [] },
      worktrees: [
        {
          path: "/repo/detached",
          head: mergedHead,
          branch: null,
          cleanliness: "clean",
          main_reachable: true,
          prunable: false,
        },
      ],
    });

    expect(unavailable.ok).toBe(false);
    expect(unavailable.worktrees[0]).toMatchObject({ disposition: "unknown_fail_closed" });
    expect(unavailable.worktrees[0]?.reasons).toEqual(
      expect.arrayContaining(["detached", "open_pr_evidence_unavailable"]),
    );
  });

  it("U-RHYG-004: fails closed when history or worktree evidence is unknown", () => {
    const result = analyzeRepositoryHygiene({
      main: {
        status: "available",
        ref: "origin/main",
        default_branch: "main",
        head: mainHead,
        history_complete: false,
      },
      open_pr_heads: { status: "available", branches: [] },
      active_writer_branches: { status: "available", branches: [] },
      worktrees: [
        {
          path: "/repo/unknown",
          head: mergedHead,
          branch: "feature/unknown",
          cleanliness: "unknown",
          main_reachable: null,
          prunable: false,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.worktrees[0]).toMatchObject({ disposition: "unknown_fail_closed" });
    expect(result.worktrees[0]?.reasons).toEqual(
      expect.arrayContaining(["shallow_history", "cleanliness_unknown", "reachability_unknown"]),
    );
  });

  it("U-RHYG-005: always protects the canonical default branch worktree", () => {
    const result = analyzeRepositoryHygiene({
      main: {
        status: "available",
        ref: "origin/main",
        default_branch: "main",
        head: mainHead,
        history_complete: true,
      },
      open_pr_heads: { status: "available", branches: [] },
      active_writer_branches: { status: "available", branches: [] },
      worktrees: [
        {
          path: "/repo",
          head: mainHead,
          branch: "main",
          cleanliness: "clean",
          main_reachable: true,
          prunable: false,
        },
      ],
    });

    expect(result.worktrees[0]).toMatchObject({
      disposition: "protected",
      reasons: ["default_branch"],
    });
  });
});
