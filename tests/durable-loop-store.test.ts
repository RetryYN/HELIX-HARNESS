import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loopEpochPaths, readLoopEpochFromFs } from "../src/orchestration/durable-loop-epoch-node";
import { durableFileLoopStore } from "../src/orchestration/loop-store";

const PLAN = "PLAN-L7-449-durability-boundary-implementation";
const roots: string[] = [];
const root = () => {
  const value = mkdtempSync(join(tmpdir(), "helix-product-loop-"));
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

describe("PLAN-L7-449 production durable loop store", () => {
  it("IT-DUR-003/004: imports valid legacy state once and restarts from epoch zero", () => {
    const repo = root();
    const legacy = join(repo, ".helix", "state", "loop", `${PLAN}.json`);
    mkdirSync(dirname(legacy), { recursive: true });
    writeFileSync(legacy, JSON.stringify(state));
    const makeStore = () =>
      durableFileLoopStore({
        root: repo,
        readLegacyText: (path) => {
          try {
            return readFileSync(path, "utf8");
          } catch {
            return null;
          }
        },
      });

    expect(makeStore().read(PLAN)).toEqual(state);
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
    expect(existsSync(legacy)).toBe(false);
    expect(
      existsSync(join(repo, ".helix", "state", "loop", `${PLAN}.legacy-import.done.json`)),
    ).toBe(true);
    writeFileSync(legacy, "{");
    expect(makeStore().read(PLAN)).toEqual(state);
  });

  it("IT-DUR-002/003: refuses legacy rollback after a completed import loses its epoch pointer", () => {
    const repo = root();
    const legacy = join(repo, ".helix", "state", "loop", `${PLAN}.json`);
    mkdirSync(dirname(legacy), { recursive: true });
    writeFileSync(legacy, JSON.stringify(state));
    const store = durableFileLoopStore({
      root: repo,
      readLegacyText: (path) => readFileSync(path, "utf8"),
    });
    expect(store.read(PLAN)).toEqual(state);
    rmSync(loopEpochPaths(repo, PLAN).manifest);
    expect(() => store.read(PLAN)).toThrow("epoch missing after completed legacy import");
  });

  it("IT-DUR-002: refuses corrupt legacy state instead of mapping it to missing", () => {
    const repo = root();
    const legacy = join(repo, ".helix", "state", "loop", `${PLAN}.json`);
    mkdirSync(dirname(legacy), { recursive: true });
    writeFileSync(legacy, "{");
    const store = durableFileLoopStore({ root: repo, readLegacyText: () => "{" });
    expect(() => store.read(PLAN)).toThrow("legacy loop state is corrupt");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("missing");
  });

  it("IT-DUR-003/005: commits iteration and next state as one restart-readable epoch", () => {
    const repo = root();
    const store = durableFileLoopStore({ root: repo });
    expect(store.read(PLAN)).toBeNull();
    store.recordIteration({
      planId: PLAN,
      iteration: 1,
      workerProvider: "codex",
      verifierProvider: "claude",
      verdict: "pass",
      stopReason: null,
      blockedReason: null,
    });
    store.write({ ...state, iteration: 1, lastVerdict: "pass" });
    const snapshot = readLoopEpochFromFs(repo, PLAN);
    expect(snapshot.status).toBe("committed");
    expect(snapshot.payload?.iteration?.iteration).toBe(1);
    expect(durableFileLoopStore({ root: repo }).read(PLAN)?.iteration).toBe(1);
    expect(loopEpochPaths(repo, PLAN).durabilityCapability).toMatch(
      /^(posix_dir_fsync|file_fsync_same_volume_rename)$/,
    );
  });

  it("IT-DUR-005: persists ambiguous intent before dispatch and blocks restart after a crash", async () => {
    const repo = root();
    const store = durableFileLoopStore({ root: repo });
    await expect(
      store.runSideEffect(state, "worker", async () => {
        throw new Error("simulated provider crash");
      }),
    ).rejects.toThrow("simulated provider crash");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("ambiguous_side_effect");
    expect(() => durableFileLoopStore({ root: repo }).read(PLAN)).toThrow(
      "loop epoch is not readable",
    );
  });

  it("IT-DUR-005: records completed side effects before allowing the next transition", async () => {
    const repo = root();
    const store = durableFileLoopStore({ root: repo });
    await expect(store.runSideEffect(state, "verifier", async () => "pass")).resolves.toBe("pass");
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
    expect(durableFileLoopStore({ root: repo }).read(PLAN)).toEqual(state);
  });

  it("IT-DUR-005: restart skips completed worker and reuses the durable verifier result", async () => {
    const repo = root();
    let workerCalls = 0;
    let verifierCalls = 0;
    await durableFileLoopStore({ root: repo }).runSideEffect(state, "worker", async () => {
      workerCalls += 1;
      return null;
    });
    await durableFileLoopStore({ root: repo }).runSideEffect(state, "worker", async () => {
      workerCalls += 1;
      return null;
    });
    expect(workerCalls).toBe(1);
    await expect(
      durableFileLoopStore({ root: repo }).runSideEffect(state, "verifier", async () => {
        verifierCalls += 1;
        return "fail";
      }),
    ).resolves.toBe("fail");
    await expect(
      durableFileLoopStore({ root: repo }).runSideEffect(state, "verifier", async () => {
        verifierCalls += 1;
        return "pass";
      }),
    ).resolves.toBe("fail");
    expect(verifierCalls).toBe(1);
    expect(workerCalls).toBe(1);
  });
});
