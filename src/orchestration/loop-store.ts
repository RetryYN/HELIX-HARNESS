import { join } from "node:path";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import {
  commitLoopEpoch,
  type LoopEpochPayload,
  parseLoopEpochPayload,
} from "./durable-loop-epoch";
import { nodeDurableEpochPort, readLoopEpochFromFs } from "./durable-loop-epoch-node";
import type { LoopIterationRecord } from "./loop-runner";
import type { LoopState } from "./loop-state";

export interface LoopStore {
  read(planId: string): LoopState | null;
  write(state: LoopState): void;
  recordIteration(rec: LoopIterationRecord): void;
}

export function fileLoopStore(deps: {
  root: string;
  readText(p: string): string | null;
  writeText(p: string, c: string): void;
}): LoopStore {
  const pathFor = (planId: string) =>
    join(deps.root, ".helix", "state", "loop", `${assertLoopPlanId(planId)}.json`);
  const iterationsPathFor = (planId: string) =>
    join(deps.root, ".helix", "state", "loop", `${assertLoopPlanId(planId)}.iterations.jsonl`);

  return {
    read: (planId: string) => {
      const text = deps.readText(pathFor(planId));
      if (text == null) return null;

      try {
        return JSON.parse(text) as LoopState;
      } catch (error) {
        void error;
        return null;
      }
    },
    write: (state: LoopState) => {
      deps.writeText(pathFor(state.planId), `${JSON.stringify(state, null, 2)}\n`);
    },
    recordIteration: (rec: LoopIterationRecord) => {
      const path = iterationsPathFor(rec.planId);
      const current = deps.readText(path) ?? "";
      deps.writeText(path, `${current}${JSON.stringify(rec)}\n`);
    },
  };
}

export function durableFileLoopStore(deps: {
  root: string;
  readLegacyText?: (path: string) => string | null;
}): LoopStore {
  const port = nodeDurableEpochPort(deps.root);
  const pendingIterations = new Map<string, LoopIterationRecord>();
  const legacyPathFor = (planId: string) =>
    join(deps.root, ".helix", "state", "loop", `${assertLoopPlanId(planId)}.json`);

  function importLegacy(planId: string): LoopState | null {
    const text = deps.readLegacyText?.(legacyPathFor(planId)) ?? null;
    if (text === null) return null;
    let state: LoopState;
    try {
      state = JSON.parse(text) as LoopState;
    } catch {
      throw new Error(`legacy loop state is corrupt: ${planId}`);
    }
    const payload: LoopEpochPayload = { state, iteration: null };
    if (parseLoopEpochPayload(JSON.stringify(payload), planId) === null)
      throw new Error(`legacy loop state is invalid: ${planId}`);
    const committed = commitLoopEpoch({
      planId,
      previousManifestText: null,
      payload,
      sideEffectPhase: "not_started",
      port,
    });
    if (committed.status !== "committed")
      throw new Error(`legacy loop state import failed: ${planId}:${committed.reason}`);
    return state;
  }

  return {
    read: (rawPlanId) => {
      const planId = assertLoopPlanId(rawPlanId);
      const snapshot = readLoopEpochFromFs(deps.root, planId);
      if (snapshot.status === "missing") return importLegacy(planId);
      if (snapshot.status !== "committed" || snapshot.payload === null)
        throw new Error(
          `loop epoch is not readable: ${planId}:${snapshot.status}:${snapshot.reason}`,
        );
      return snapshot.payload.state;
    },
    recordIteration: (record) => {
      pendingIterations.set(assertLoopPlanId(record.planId), record);
    },
    write: (state) => {
      const planId = assertLoopPlanId(state.planId);
      const previousManifestText = port.readManifestText(planId);
      const iteration = pendingIterations.get(planId) ?? null;
      const committed = commitLoopEpoch({
        planId,
        previousManifestText,
        payload: { state, iteration },
        sideEffectPhase: "completed",
        port,
      });
      if (committed.status !== "committed")
        throw new Error(`loop epoch commit failed: ${planId}:${committed.reason}`);
      pendingIterations.delete(planId);
    },
  };
}
