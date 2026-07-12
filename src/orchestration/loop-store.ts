import { join } from "node:path";
import { assertLoopPlanId } from "../schema/loop-plan-id";
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
