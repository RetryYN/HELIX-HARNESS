import { describe, expect, it } from "vitest";
import {
  analyzeBranches,
  parseBranchRefs,
  parseWorktreeBranches,
  renderBranchAudit,
} from "../src/audit/branches";

describe("branch audit", () => {
  it("keeps current/protected branches and marks gone or merged branches as delete candidates", () => {
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

  it("never treats a gone upstream as deletable without main reachability proof", () => {
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

  it("keeps branches checked out by any worktree even when merged and gone", () => {
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

  it.each([
    {
      name: "missing main ref",
      mainRefResolved: false,
      historyComplete: true,
      reason: "main-ref-unresolved",
    },
    {
      name: "shallow history",
      mainRefResolved: true,
      historyComplete: false,
      reason: "shallow-history",
    },
  ])("fails closed when $name prevents reachability proof", (fixture) => {
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
      mainRef: fixture.mainRefResolved ? "origin/main" : null,
      mainRefResolved: fixture.mainRefResolved,
      historyComplete: fixture.historyComplete,
    });

    expect(result.ok).toBe(false);
    expect(result.byStatus["delete-candidate"]).toBe(0);
    expect(result.rows[0]).toMatchObject({ status: "review", reason: fixture.reason });
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

  it("parses only named branches from worktree porcelain output", () => {
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
