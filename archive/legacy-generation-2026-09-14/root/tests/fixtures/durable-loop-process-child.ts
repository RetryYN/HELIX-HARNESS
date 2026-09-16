import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { commitLoopEpoch } from "../../src/orchestration/durable-loop-epoch";
import {
  type DurableEpochBoundary,
  nodeDurableEpochPort,
} from "../../src/orchestration/durable-loop-epoch-node";
import { durableFileLoopStore } from "../../src/orchestration/loop-store";

const [root, mode, id] = process.argv.slice(2);
if (!root || !mode || !id) throw new Error("root, mode, and id are required");
const planId = "PLAN-L7-449-durability-boundary-implementation";
const state = {
  planId,
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

async function waitFor(path: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (!existsSync(path)) {
    if (Date.now() > deadline) throw new Error("fixture barrier timeout");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

if (mode === "stale-contender") {
  await waitFor(join(root, "effect-entered"));
  const result = commitLoopEpoch({
    planId,
    previousManifestText: null,
    payload: { state, iteration: null },
    sideEffectPhase: "intent_recorded",
    port: nodeDurableEpochPort(root, {
      afterBoundary: (boundary) => {
        if (boundary !== "claim_acquired") return;
        writeFileSync(join(root, "contender-acquired"), "ready");
        const deadline = Date.now() + 10_000;
        while (!existsSync(join(root, "completion-attempted"))) {
          if (Date.now() > deadline) throw new Error("contender barrier timeout");
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
        }
      },
    }),
  });
  writeFileSync(join(root, "contender-result.json"), JSON.stringify(result));
  writeFileSync(join(root, "contender-checked"), "done");
  process.exit(result.reason === "stale_previous" ? 2 : 3);
}

const store = durableFileLoopStore({
  root,
  beforeIntentCommit:
    mode === "barrier"
      ? async () => {
          writeFileSync(join(root, `ready-${id}`), "ready");
          await waitFor(join(root, "release"));
        }
      : undefined,
});

if (mode.startsWith("publish:")) {
  const firstPort = nodeDurableEpochPort(root);
  const first = commitLoopEpoch({
    planId,
    previousManifestText: null,
    payload: { state, iteration: null },
    sideEffectPhase: "completed",
    port: firstPort,
  });
  if (first.status !== "committed") throw new Error(`baseline failed: ${first.reason}`);
  const boundary = mode.slice("publish:".length) as DurableEpochBoundary;
  commitLoopEpoch({
    planId,
    previousManifestText: firstPort.readManifestText(planId),
    payload: { state: { ...state, updatedAt: "2026-07-13T00:01:00.000Z" }, iteration: null },
    sideEffectPhase: "completed",
    port: nodeDurableEpochPort(root, {
      afterBoundary: (observed) => {
        if (observed === boundary) process.kill(process.pid, "SIGKILL");
      },
    }),
  });
  process.exit(2);
}

if (mode.startsWith("gc:")) {
  const port = nodeDurableEpochPort(root);
  const first = commitLoopEpoch({
    planId,
    previousManifestText: null,
    payload: { state, iteration: null },
    sideEffectPhase: "completed",
    port,
  });
  if (first.status !== "committed") throw new Error(`baseline failed: ${first.reason}`);
  const boundary = mode.slice("gc:".length) as DurableEpochBoundary;
  nodeDurableEpochPort(root, {
    afterBoundary: (observed) => {
      if (observed === boundary) process.kill(process.pid, "SIGKILL");
    },
  }).acquireExclusiveClaim(planId);
  process.exit(2);
}

await store.runSideEffect(state, "worker", async () => {
  appendFileSync(join(root, "effects.log"), `${id}\n`);
  if (mode === "held-effect") {
    writeFileSync(join(root, "effect-entered"), "ready");
    const deadline = Date.now() + 10_000;
    while (
      !existsSync(join(root, "contender-acquired")) &&
      !existsSync(join(root, "contender-checked"))
    ) {
      if (Date.now() > deadline) throw new Error("effect barrier timeout");
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  }
  if (mode === "kill") process.kill(process.pid, "SIGKILL");
  return null;
});
