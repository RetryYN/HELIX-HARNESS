import type { ExecutionMode } from "../runtime/detect";
import { selectVerifier } from "./cross-verifier";
import type { LoopState, Provider, StopReason, StopRule, Verdict } from "./loop-state";
import { evaluateStop, type StopProbe } from "./loop-stop-rules";

export interface TickDeps {
  mode: ExecutionMode;
  now(): string;
  providerAvailable(p: Provider): boolean;
  runWorker(s: LoopState): Promise<void>;
  runVerifier(provider: Provider, s: LoopState): Promise<Verdict>;
  recordIteration(rec: LoopIterationRecord): void;
}

export interface LoopIterationRecord {
  planId: string;
  iteration: number;
  workerProvider: Provider;
  verifierProvider: Provider | null;
  verdict: Verdict;
  stopReason: StopReason | null;
  blockedReason: string | null;
}

const TICK_STOP_PROBE: StopProbe = {
  exists: () => false,
  noProgress: () => false,
  custom: () => false,
};

export function canResume(s: LoopState, now: string): boolean {
  const currentTime = Date.parse(now);
  const opensAt = Date.parse(s.windowOpensAt);
  const closesAt = Date.parse(s.windowClosesAt);
  const withinTimeWindow = currentTime >= opensAt && currentTime <= closesAt;
  const shouldSchedule = s.lastVerdict !== "pass" && s.iteration < s.maxIterations;

  return s.status === "running" && withinTimeWindow && shouldSchedule;
}

export async function tick(s: LoopState, rules: StopRule[], deps: TickDeps): Promise<LoopState> {
  const { mode } = deps;
  if (!canResume(s, deps.now())) return s;

  const decision = evaluateStop(rules, s, TICK_STOP_PROBE);
  if (decision.stop) {
    deps.recordIteration({
      planId: s.planId,
      iteration: s.iteration,
      workerProvider: s.workerProvider,
      verifierProvider: null,
      verdict: s.lastVerdict,
      stopReason: decision.reason,
      blockedReason: null,
    });
    return { ...s, status: "stopped" };
  }

  const sel = selectVerifier(s.workerProvider, mode);
  if (mode === "hybrid" && !deps.providerAvailable(sel.provider)) {
    deps.recordIteration({
      planId: s.planId,
      iteration: s.iteration,
      workerProvider: s.workerProvider,
      verifierProvider: null,
      verdict: "error",
      stopReason: null,
      blockedReason: "cross_runtime_unavailable",
    });
    return {
      ...s,
      status: "stopped",
      verifierProvider: null,
      blockedReason: "cross_runtime_unavailable",
    };
  }

  await deps.runWorker(s);
  const verdict = await deps.runVerifier(sel.provider, s);
  deps.recordIteration({
    planId: s.planId,
    iteration: s.iteration,
    workerProvider: s.workerProvider,
    verifierProvider: sel.provider,
    verdict,
    stopReason: null,
    blockedReason: sel.blockedReason,
  });

  return {
    ...s,
    iteration: s.iteration + 1,
    lastVerdict: verdict,
    verifierProvider: sel.provider,
    blockedReason: sel.blockedReason,
    updatedAt: deps.now(),
  };
}
