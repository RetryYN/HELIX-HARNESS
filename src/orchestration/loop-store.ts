import { join } from "node:path";
import type { LoopState } from "./loop-state";

export interface LoopStore {
  read(planId: string): LoopState | null;
  write(state: LoopState): void;
}

export function fileLoopStore(deps: {
  root: string;
  readText(p: string): string | null;
  writeText(p: string, c: string): void;
}): LoopStore {
  const pathFor = (planId: string) => join(deps.root, ".ut-tdd", "state", "loop", `${planId}.json`);

  return {
    read: (planId: string) => {
      const text = deps.readText(pathFor(planId));
      if (text == null) return null;

      try {
        return JSON.parse(text) as LoopState;
      } catch (_error) {
        return null;
      }
    },
    write: (state: LoopState) => {
      deps.writeText(pathFor(state.planId), `${JSON.stringify(state, null, 2)}\n`);
    },
  };
}
