import { join } from "node:path";
import { assertLoopPlanId } from "../schema/loop-plan-id";
import {
  authorizeLoopSideEffect,
  commitLoopEpoch,
  type LoopEpochPayload,
  parseLoopEpochPayload,
} from "./durable-loop-epoch";
import { nodeDurableEpochPort, readLoopEpochFromFs } from "./durable-loop-epoch-node";
import type { LoopIterationRecord } from "./loop-runner";
import type { LoopState, Verdict } from "./loop-state";

export interface LoopStore {
  read(planId: string): LoopState | null;
  write(state: LoopState): void;
  recordIteration(rec: LoopIterationRecord): void;
  runSideEffect(
    state: LoopState,
    purpose: "worker" | "verifier",
    effect: () => Promise<Verdict | null>,
  ): Promise<Verdict | null>;
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
    runSideEffect: async (_state, _purpose, effect) => effect(),
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
    runSideEffect: async (state, purpose, effect) => {
      const planId = assertLoopPlanId(state.planId);
      const current = readLoopEpochFromFs(deps.root, planId);
      const stage = current.payload?.orchestrationStage;
      if (
        current.status === "committed" &&
        stage?.iteration === state.iteration &&
        stage.status === "completed"
      ) {
        if (purpose === "worker" && ["worker", "verifier"].includes(stage.purpose)) return null;
        if (purpose === "verifier" && stage.purpose === "verifier") return stage.result;
      }
      const beforeIntent = port.readManifestText(planId);
      const intent = commitLoopEpoch({
        planId,
        previousManifestText: beforeIntent,
        payload: {
          state,
          iteration: null,
          orchestrationStage: {
            iteration: state.iteration,
            purpose,
            status: "intent",
            result: null,
          },
        },
        sideEffectPhase: "intent_recorded",
        port,
      });
      if (intent.status !== "committed" || intent.intentCapability === null)
        throw new Error(`loop intent commit failed: ${planId}:${intent.reason}`);
      const authorized = authorizeLoopSideEffect(intent.intentCapability, planId, effect);
      if (!authorized.allowed || authorized.value === undefined)
        throw new Error(`loop side effect authorization failed: ${planId}`);
      const value = await authorized.value;
      const intentManifestText = port.readManifestText(planId);
      const completed = commitLoopEpoch({
        planId,
        previousManifestText: intentManifestText,
        payload: {
          state,
          iteration: null,
          orchestrationStage: {
            iteration: state.iteration,
            purpose,
            status: "completed",
            result: value,
          },
        },
        sideEffectPhase: "completed",
        port,
      });
      if (completed.status !== "committed")
        throw new Error(`loop side effect completion failed: ${planId}:${completed.reason}`);
      return value;
    },
  };
}
