import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { durableFileLoopStore } from "../../src/orchestration/loop-store";
import { commitLoopEpoch } from "../../src/orchestration/durable-loop-epoch";
import {
  type DurableEpochBoundary,
  nodeDurableEpochPort,
} from "../../src/orchestration/durable-loop-epoch-node";

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
  while (!existsSync(path)) await new Promise((resolve) => setTimeout(resolve, 5));
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

await store.runSideEffect(state, "worker", async () => {
  appendFileSync(join(root, "effects.log"), `${id}\n`);
  if (mode === "kill") process.kill(process.pid, "SIGKILL");
  return null;
});
