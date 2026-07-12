import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { sha256Digest } from "../runtime/digest";
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
  const loopDirectory = join(deps.root, ".helix", "state", "loop");
  const doneMarkerFor = (planId: string) =>
    join(loopDirectory, `${assertLoopPlanId(planId)}.legacy-import.done.json`);

  function fsyncFile(path: string): void {
    const fd = openSync(path, "r+");
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  }

  function sourceMarkerFor(planId: string): string | null {
    if (!existsSync(loopDirectory)) return null;
    const prefix = `${assertLoopPlanId(planId)}.legacy-source-`;
    const matches = readdirSync(loopDirectory).filter(
      (name) => name.startsWith(prefix) && name.endsWith(".json"),
    );
    if (matches.length > 1) throw new Error(`multiple legacy loop migration sources: ${planId}`);
    return matches[0] ? join(loopDirectory, matches[0]) : null;
  }

  function publishDoneMarker(planId: string, sourceDigest: string): void {
    const done = doneMarkerFor(planId);
    if (existsSync(done)) return;
    const manifestText = port.readManifestText(planId);
    if (manifestText === null) throw new Error(`legacy import manifest missing: ${planId}`);
    const temp = `${done}.${randomUUID()}.tmp`;
    writeFileSync(
      temp,
      `${JSON.stringify({
        schema: "helix.loop-legacy-import.v1",
        planId,
        sourceDigest,
        manifestDigest: sha256Digest(manifestText),
        importedAt: new Date().toISOString(),
      })}\n`,
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    fsyncFile(temp);
    renameSync(temp, done);
    port.fsyncClaimDirectory(planId);
  }

  function importLegacy(planId: string): LoopState | null {
    if (existsSync(doneMarkerFor(planId)))
      throw new Error(`durable loop epoch missing after completed legacy import: ${planId}`);
    const existingSource = sourceMarkerFor(planId);
    const rawPath = legacyPathFor(planId);
    const text =
      existingSource !== null
        ? readFileSync(existingSource, "utf8")
        : (deps.readLegacyText?.(rawPath) ?? null);
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
    const sourceDigest = sha256Digest(text);
    let sourcePath = existingSource;
    if (sourcePath === null) {
      if (!existsSync(rawPath))
        throw new Error(`legacy loop state cannot be retired durably: ${planId}`);
      mkdirSync(loopDirectory, { recursive: true });
      sourcePath = join(loopDirectory, `${planId}.legacy-source-${sourceDigest.slice(7)}.json`);
      renameSync(rawPath, sourcePath);
      port.fsyncClaimDirectory(planId);
    }
    const retiredText = readFileSync(sourcePath, "utf8");
    const digestFromName = /\.legacy-source-([a-f0-9]{64})\.json$/.exec(sourcePath)?.[1];
    if (
      retiredText !== text ||
      sha256Digest(retiredText) !== sourceDigest ||
      digestFromName !== sourceDigest.slice(7)
    )
      throw new Error(`legacy loop migration source changed: ${planId}`);
    const committed = commitLoopEpoch({
      planId,
      previousManifestText: null,
      payload,
      sideEffectPhase: "not_started",
      port,
    });
    if (committed.status !== "committed")
      throw new Error(`legacy loop state import failed: ${planId}:${committed.reason}`);
    publishDoneMarker(planId, sourceDigest);
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
      const source = sourceMarkerFor(planId);
      if (source !== null && !existsSync(doneMarkerFor(planId)))
        publishDoneMarker(planId, sha256Digest(readFileSync(source, "utf8")));
      return snapshot.payload.state;
    },
    recordIteration: (record) => {
      pendingIterations.set(assertLoopPlanId(record.planId), record);
    },
    write: (state) => {
      const planId = assertLoopPlanId(state.planId);
      const snapshot = readLoopEpochFromFs(deps.root, planId);
      const stage = snapshot.payload?.orchestrationStage;
      if (stage) {
        const iteration = pendingIterations.get(planId);
        if (
          snapshot.status !== "committed" ||
          stage.purpose !== "verifier" ||
          stage.status !== "completed" ||
          stage.result === null ||
          state.iteration !== stage.iteration + 1 ||
          state.lastVerdict !== stage.result ||
          iteration === undefined ||
          iteration.iteration !== stage.iteration ||
          iteration.workerProvider !== state.workerProvider ||
          iteration.verifierProvider !== state.verifierProvider ||
          iteration.verdict !== state.lastVerdict ||
          iteration.blockedReason !== state.blockedReason
        )
          throw new Error(`invalid loop stage finalization: ${planId}`);
      } else if (snapshot.status !== "missing" && snapshot.status !== "committed") {
        throw new Error(`loop epoch cannot be overwritten: ${planId}:${snapshot.status}`);
      }
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
      if (current.status !== "missing" && current.status !== "committed")
        throw new Error(`loop side effect blocked by epoch state: ${planId}:${current.status}`);
      if (
        current.payload !== null &&
        JSON.stringify(current.payload.state) !== JSON.stringify(state)
      )
        throw new Error(`loop side effect state snapshot mismatch: ${planId}`);
      const stage = current.payload?.orchestrationStage;
      if (purpose === "verifier" && stage?.purpose !== "worker" && stage?.purpose !== "verifier")
        throw new Error(`loop verifier requires completed worker stage: ${planId}`);
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
