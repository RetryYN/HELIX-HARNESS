import { describe, expect, it } from "vitest";
import {
  analyzeBranches,
  parseBranchRefs,
  parseWorktreeBranches,
  renderBranchAudit,
} from "../src/audit/branches";

// PLAN-L7-690-branch-audit-delete-candidate-safety
describe("branch audit", () => {
  it("U-BRAS-001: marks only main-reachable and unoccupied branches as delete candidates", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      now: new Date("2026-06-23T00:00:00.000Z"),
      staleDays: 30,
      mergedBranchNames: ["feature/gone", "feature/merged"],
      checkedOutBranchNames: [],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: true,
      branches: [
        {
          name: "main",
          upstream: "origin/main",
          upstreamTrack: "",
          commitDate: "2026-06-22T00:00:00.000Z",
        },
        {
          name: "release/1.0",
          upstream: "origin/release/1.0",
          upstreamTrack: "",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
        {
          name: "feature/gone",
          upstream: "origin/feature/gone",
          upstreamTrack: "[gone]",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
        {
          name: "feature/merged",
          upstream: "origin/feature/merged",
          upstreamTrack: "",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
    });

    expect(result.byStatus.keep).toBe(2);
    expect(result.byStatus["delete-candidate"]).toBe(2);
    expect(result.rows.find((row) => row.name === "feature/gone")).toMatchObject({
      status: "delete-candidate",
      reason: "gone-merged",
    });
    expect(result.rows.find((row) => row.name === "release/1.0")).toMatchObject({
      status: "keep",
      reason: "protected",
    });
    expect(renderBranchAudit(result)).toContain("branch audit:");
  });

  it("marks old unmerged branches for review instead of delete", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      now: new Date("2026-06-23T00:00:00.000Z"),
      staleDays: 30,
      mergedBranchNames: [],
      checkedOutBranchNames: [],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: true,
      branches: [
        {
          name: "feature/old",
          upstream: "origin/feature/old",
          upstreamTrack: "",
          commitDate: "2026-04-01T00:00:00.000Z",
        },
      ],
    });

    expect(result.rows[0]).toMatchObject({ status: "review", reason: "stale" });
  });

  it("U-BRAS-002: never treats a gone upstream as deletable without main reachability proof", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      now: new Date("2026-08-28T00:00:00.000Z"),
      staleDays: 30,
      mergedBranchNames: [],
      checkedOutBranchNames: [],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: true,
      branches: [
        {
          name: "feature/gone-but-unmerged",
          upstream: "origin/feature/gone-but-unmerged",
          upstreamTrack: "[gone]",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
    });

    expect(result.byStatus["delete-candidate"]).toBe(0);
    expect(result.rows[0]).toMatchObject({
      status: "review",
      reason: "gone-unmerged",
      merged: false,
    });
  });

  it("U-BRAS-003: keeps current and protected branches despite merged evidence", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      now: new Date("2026-08-28T00:00:00.000Z"),
      staleDays: 30,
      mergedBranchNames: ["main", "release/1.0"],
      checkedOutBranchNames: [],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: true,
      branches: [
        {
          name: "main",
          upstream: "origin/main",
          upstreamTrack: "",
          commitDate: "2026-08-27T00:00:00.000Z",
        },
        {
          name: "release/1.0",
          upstream: "origin/release/1.0",
          upstreamTrack: "",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
    });

    expect(result.rows).toEqual([
      expect.objectContaining({ name: "main", status: "keep", reason: "current" }),
      expect.objectContaining({ name: "release/1.0", status: "keep", reason: "protected" }),
    ]);
  });

  it("U-BRAS-004: keeps branches checked out by any worktree even when merged and gone", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      now: new Date("2026-08-28T00:00:00.000Z"),
      mergedBranchNames: ["feature/in-use"],
      checkedOutBranchNames: ["feature/in-use"],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: true,
      branches: [
        {
          name: "feature/in-use",
          upstream: "origin/feature/in-use",
          upstreamTrack: "[gone]",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
    });

    expect(result.rows[0]).toMatchObject({
      status: "keep",
      reason: "worktree-in-use",
      checkedOutInWorktree: true,
    });
  });

  it("U-BRAS-005: fails closed when the canonical main ref is unresolved", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      branches: [
        {
          name: "feature/candidate",
          upstream: "origin/feature/candidate",
          upstreamTrack: "[gone]",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
      mergedBranchNames: ["feature/candidate"],
      checkedOutBranchNames: [],
      mainRef: null,
      mainRefResolved: false,
      historyComplete: true,
    });

    expect(result.ok).toBe(false);
    expect(result.byStatus["delete-candidate"]).toBe(0);
    expect(result.rows[0]).toMatchObject({ status: "review", reason: "main-ref-unresolved" });
  });

  it("U-BRAS-006: fails closed when shallow history prevents reachability proof", () => {
    const result = analyzeBranches({
      currentBranch: "main",
      branches: [
        {
          name: "feature/candidate",
          upstream: "origin/feature/candidate",
          upstreamTrack: "[gone]",
          commitDate: "2026-06-01T00:00:00.000Z",
        },
      ],
      mergedBranchNames: ["feature/candidate"],
      checkedOutBranchNames: [],
      mainRef: "origin/main",
      mainRefResolved: true,
      historyComplete: false,
    });

    expect(result.ok).toBe(false);
    expect(result.byStatus["delete-candidate"]).toBe(0);
    expect(result.rows[0]).toMatchObject({ status: "review", reason: "shallow-history" });
  });

  it("parses git for-each-ref rows", () => {
    expect(
      parseBranchRefs(
        "main\torigin/main\t\t2026-06-23T00:00:00+09:00\nfeature/x\torigin/feature/x\t[gone]\t2026-06-01T00:00:00+09:00\n",
      ),
    ).toEqual([
      {
        name: "main",
        upstream: "origin/main",
        upstreamTrack: "",
        commitDate: "2026-06-23T00:00:00+09:00",
      },
      {
        name: "feature/x",
        upstream: "origin/feature/x",
        upstreamTrack: "[gone]",
        commitDate: "2026-06-01T00:00:00+09:00",
      },
    ]);
  });

  it("U-BRAS-007: parses only named branches from worktree porcelain output", () => {
    expect(
      parseWorktreeBranches(
        [
          "worktree /repo",
          "HEAD aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "branch refs/heads/main",
          "",
          "worktree /repo-wt",
          "HEAD bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "branch refs/heads/feature/in-use",
          "",
          "worktree /repo-detached",
          "HEAD cccccccccccccccccccccccccccccccccccccccc",
          "detached",
          "",
        ].join("\n"),
      ),
    ).toEqual(["main", "feature/in-use"]);
  });
});
