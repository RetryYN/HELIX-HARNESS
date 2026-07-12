import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { commitLoopEpoch } from "../src/orchestration/durable-loop-epoch";
import { loopEpochPaths, nodeDurableEpochPort } from "../src/orchestration/durable-loop-epoch-node";

const PLAN = "PLAN-L7-449-durability-boundary-implementation";
const roots: string[] = [];
const root = () => {
  const value = mkdtempSync(join(tmpdir(), "helix-loop-epoch-"));
  roots.push(value);
  return value;
};
afterEach(() => {
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

const state = {
  planId: PLAN,
  status: "running" as const,
  iteration: 0,
  maxIterations: 3,
  lastVerdict: "pending" as const,
  workerProvider: "codex" as const,
  verifierProvider: null,
  blockedReason: null,
  windowOpensAt: "2026-07-13T00:00:00.000Z",
  windowClosesAt: "2026-07-13T12:00:00.000Z",
  costUsd: 0,
  updatedAt: "2026-07-13T00:00:00.000Z",
};

describe("PLAN-L7-449 node durable epoch port", () => {
  it("IT-DUR-003/004: publishes payload+manifest and removes the exclusive claim", () => {
    const repo = root();
    const result = commitLoopEpoch({
      planId: PLAN,
      previousManifestText: null,
      payload: { state, iteration: null },
      sideEffectPhase: "not_started",
      port: nodeDurableEpochPort(repo),
    });
    const paths = loopEpochPaths(repo, PLAN);
    expect(result.status).toBe("committed");
    expect(existsSync(paths.payload)).toBe(true);
    expect(existsSync(paths.manifest)).toBe(true);
    expect(existsSync(paths.claim)).toBe(false);
    expect(JSON.parse(readFileSync(paths.manifest, "utf8")).planId).toBe(PLAN);
  });

  it("IT-DUR-004: O_EXCL permits at most one live claim", () => {
    const repo = root();
    expect(nodeDurableEpochPort(repo).acquireExclusiveClaim(PLAN)).toBe(true);
    expect(nodeDurableEpochPort(repo).acquireExclusiveClaim(PLAN)).toBe(false);
  });
});
