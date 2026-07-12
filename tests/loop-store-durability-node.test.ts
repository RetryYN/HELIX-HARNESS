import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { commitLoopEpoch } from "../src/orchestration/durable-loop-epoch";
import {
  loopEpochPaths,
  nodeDurableEpochPort,
  readLoopEpochFromFs,
} from "../src/orchestration/durable-loop-epoch-node";

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
    const pointer = JSON.parse(readFileSync(paths.manifest, "utf8"));
    const manifest = JSON.parse(readFileSync(paths.manifestFor(pointer.manifestFile), "utf8"));
    expect(manifest.planId).toBe(PLAN);
    expect(manifest.durabilityCapability).toMatch(
      /^(posix_dir_fsync|file_fsync_same_volume_rename)$/,
    );
    expect(existsSync(paths.payloadFor(manifest.payloadFile))).toBe(true);
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
  });

  it("IT-DUR-002/004: filesystem reader distinguishes corrupt, live, and provably stale claims", () => {
    const repo = root();
    const paths = loopEpochPaths(repo, PLAN);
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("missing");
    expect(nodeDurableEpochPort(repo).acquireExclusiveClaim(PLAN)).toBe(true);
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("live_claim");
    writeFileSync(
      paths.claim,
      `${JSON.stringify({
        pid: 999_999_999,
        bootIdentity: "different-boot",
        processStartToken: "missing",
        leaseDeadlineUptimeMs: 0,
      })}\n`,
    );
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("stale_claim");
    rmSync(paths.claim);
    writeFileSync(paths.manifest, "{");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("corrupt");
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: null,
        payload: { state, iteration: null },
        sideEffectPhase: "not_started",
        port: nodeDurableEpochPort(repo),
      }).status,
    ).toBe("durability_uncertain");
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
    const previousPointerText = readFileSync(paths.manifest, "utf8");
    const previousManifestText = firstPort.readManifestText(PLAN);
    expect(previousManifestText).not.toBeNull();
    const previousManifest = JSON.parse(previousManifestText as string);
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
      previousManifestText: previousManifestText as string,
      payload: { state: { ...state, iteration: 1 }, iteration: null },
      sideEffectPhase: "not_started",
      port: faultPort,
    });
    expect(second.status).toBe("durability_uncertain");
    expect(readFileSync(paths.manifest, "utf8")).toBe(previousPointerText);
    expect(readFileSync(paths.payloadFor(previousManifest.payloadFile), "utf8")).toBe(
      previousPayloadText,
    );
  });

  it("IT-DUR-002/003: restart verifies immutable previous-manifest history", () => {
    const repo = root();
    const port = nodeDurableEpochPort(repo);
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: null,
        payload: { state, iteration: null },
        sideEffectPhase: "not_started",
        port,
      }).status,
    ).toBe("committed");
    const paths = loopEpochPaths(repo, PLAN);
    const firstPointer = JSON.parse(readFileSync(paths.manifest, "utf8"));
    const previousManifestText = port.readManifestText(PLAN);
    expect(previousManifestText).not.toBeNull();
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: previousManifestText as string,
        payload: { state: { ...state, iteration: 1 }, iteration: null },
        sideEffectPhase: "completed",
        port,
      }).status,
    ).toBe("committed");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
    const secondManifestText = port.readManifestText(PLAN);
    expect(secondManifestText).not.toBeNull();
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: secondManifestText as string,
        payload: { state: { ...state, iteration: 2 }, iteration: null },
        sideEffectPhase: "completed",
        port,
      }).status,
    ).toBe("committed");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
    writeFileSync(paths.manifestFor(firstPointer.manifestFile), "{}");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("concurrent_conflict");
  });

  it("IT-DUR-002: writer refuses to heal a corrupt pointer envelope", () => {
    const repo = root();
    const port = nodeDurableEpochPort(repo);
    expect(
      commitLoopEpoch({
        planId: PLAN,
        previousManifestText: null,
        payload: { state, iteration: null },
        sideEffectPhase: "not_started",
        port,
      }).status,
    ).toBe("committed");
    const paths = loopEpochPaths(repo, PLAN);
    const validPointer = JSON.parse(readFileSync(paths.manifest, "utf8"));
    for (const patch of [
      { schema: "tampered" },
      { planId: "PLAN-L7-448-qs4-test-infra-inventory" },
      { epochId: 99 },
    ]) {
      const tampered = `${JSON.stringify({ ...validPointer, ...patch })}\n`;
      writeFileSync(paths.manifest, tampered);
      expect(
        commitLoopEpoch({
          planId: PLAN,
          previousManifestText: null,
          payload: { state, iteration: null },
          sideEffectPhase: "not_started",
          port: nodeDurableEpochPort(repo),
        }).status,
      ).toBe("durability_uncertain");
      expect(readFileSync(paths.manifest, "utf8")).toBe(tampered);
      rmSync(paths.claim, { force: true });
    }
  });
});
