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
    expect(existsSync(paths.manifest)).toBe(true);
    expect(existsSync(paths.claim)).toBe(false);
    const manifest = JSON.parse(readFileSync(paths.manifest, "utf8"));
    expect(manifest.planId).toBe(PLAN);
    expect(existsSync(paths.payloadFor(manifest.payloadFile))).toBe(true);
  });

  it("IT-DUR-004: O_EXCL permits at most one live claim", () => {
    const repo = root();
    expect(nodeDurableEpochPort(repo).acquireExclusiveClaim(PLAN)).toBe(true);
    expect(nodeDurableEpochPort(repo).acquireExclusiveClaim(PLAN)).toBe(false);
  });

  it("IT-DUR-003: a second-epoch C4 crash preserves the previous committed payload", () => {
    const repo = root();
    const firstPort = nodeDurableEpochPort(repo);
    const first = commitLoopEpoch({
      planId: PLAN,
      previousManifestText: null,
      payload: { state, iteration: null },
      sideEffectPhase: "not_started",
      port: firstPort,
    });
    expect(first.status).toBe("committed");
    const paths = loopEpochPaths(repo, PLAN);
    const previousManifestText = readFileSync(paths.manifest, "utf8");
    const previousManifest = JSON.parse(previousManifestText);
    const previousPayloadText = readFileSync(
      paths.payloadFor(previousManifest.payloadFile),
      "utf8",
    );
    const realPort = nodeDurableEpochPort(repo);
    const faultPort = new Proxy(realPort, {
      get: (target, name, receiver) =>
        name === "writeManifestTemp"
          ? () => {
              throw new Error("C4 fault");
            }
          : Reflect.get(target, name, receiver),
    });
    const second = commitLoopEpoch({
      planId: PLAN,
      previousManifestText,
      payload: { state: { ...state, iteration: 1 }, iteration: null },
      sideEffectPhase: "not_started",
      port: faultPort,
    });
    expect(second.status).toBe("durability_uncertain");
    expect(readFileSync(paths.manifest, "utf8")).toBe(previousManifestText);
    expect(readFileSync(paths.payloadFor(previousManifest.payloadFile), "utf8")).toBe(
      previousPayloadText,
    );
  });
});
