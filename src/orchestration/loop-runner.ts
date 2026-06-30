import type { ExecutionMode } from "../runtime/detect";
import { selectVerifier } from "./cross-verifier";
import { type LoopEffortBudgetDecision, tickLoopEffortBudget } from "./loop-effort-budget";
import type { LoopRuntimeStopReason, LoopState, Provider, StopRule, Verdict } from "./loop-state";
import { evaluateStop, type StopProbe } from "./loop-stop-rules";

export interface TickDeps {
  mode: ExecutionMode;
  now(): string;
  providerAvailable(p: Provider): boolean;
  runWorker(s: LoopState): Promise<void>;
  runVerifier(provider: Provider, s: LoopState): Promise<Verdict>;
  recordIteration(rec: LoopIterationRecord): void;
  readEffortUsage?(s: LoopState): Partial<NonNullable<LoopState["effortBudget"]>["usage"]> | null;
  recordEffortDecision?(decision: LoopEffortBudgetDecision): void;
}

export interface LoopIterationRecord {
  planId: string;
  iteration: number;
  workerProvider: Provider;
  verifierProvider: Provider | null;
  verdict: Verdict;
  stopReason: LoopRuntimeStopReason | null;
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

  const beforeBudget = tickLoopEffortBudget({
    state: s,
    stage: "before_worker",
    usage: deps.readEffortUsage?.(s),
  });
  deps.recordEffortDecision?.(beforeBudget);
  if (!beforeBudget.allowContinue) {
    deps.recordIteration({
      planId: s.planId,
      iteration: s.iteration,
      workerProvider: s.workerProvider,
      verifierProvider: null,
      verdict: s.lastVerdict === "pass" ? "error" : s.lastVerdict,
      stopReason: "effort_budget",
      blockedReason: beforeBudget.blockedReason,
    });
    return {
      ...s,
      status: "stopped",
      lastVerdict: s.lastVerdict === "pass" ? "error" : s.lastVerdict,
      blockedReason: beforeBudget.blockedReason,
    };
  }

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
  const candidateState: LoopState = {
    ...s,
    iteration: s.iteration + 1,
    lastVerdict: verdict,
    verifierProvider: sel.provider,
    blockedReason: sel.blockedReason,
    updatedAt: deps.now(),
  };
  const afterBudget = tickLoopEffortBudget({
    state: candidateState,
    stage: "after_verifier",
    usage: deps.readEffortUsage?.(candidateState),
    proposedVerdict: verdict,
  });
  deps.recordEffortDecision?.(afterBudget);
  const finalVerdict: Verdict = afterBudget.allowWorkerPass ? verdict : "error";
  deps.recordIteration({
    planId: s.planId,
    iteration: s.iteration,
    workerProvider: s.workerProvider,
    verifierProvider: sel.provider,
    verdict: finalVerdict,
    stopReason: afterBudget.allowContinue ? null : "effort_budget",
    blockedReason: afterBudget.blockedReason ?? sel.blockedReason,
  });

  return {
    ...candidateState,
    status: afterBudget.allowContinue ? candidateState.status : "stopped",
    lastVerdict: finalVerdict,
    blockedReason: afterBudget.blockedReason ?? sel.blockedReason,
  };
}
