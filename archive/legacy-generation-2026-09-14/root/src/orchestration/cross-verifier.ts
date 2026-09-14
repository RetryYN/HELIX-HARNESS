import type { ExecutionMode } from "../runtime/detect";
import type { Provider } from "./loop-state";

export interface VerifierSelection {
  provider: Provider;
  blockedReason: string | null;
}

export function selectVerifier(workerProvider: Provider, mode: ExecutionMode): VerifierSelection {
  if (mode === "hybrid") {
    return {
      provider: workerProvider === "codex" ? "claude" : "codex",
      blockedReason: null,
    };
  }

  return {
    provider: workerProvider,
    blockedReason: "intra_runtime_fallback",
  };
}
