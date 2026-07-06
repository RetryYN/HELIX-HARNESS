import type { EffortObservation } from "../team/model-effort";
import type {
  LoopEffortBudgetState,
  LoopEffortLimits,
  LoopEffortUsage,
  LoopModelRole,
  LoopPlanSize,
  LoopState,
  Verdict,
} from "./loop-state";

export type LoopEffortBudgetStage = "before_worker" | "after_verifier";
export const SHALLOW_OUTPUT_CHARS_MIN = 400;
export const TOO_SLOW_ELAPSED_MS = 600_000;

export interface EffortObservationInput {
  verdictFail?: boolean;
  outputChars?: number;
  truncated?: boolean;
  elapsedMs?: number;
}

export interface LoopEffortBudgetInput {
  state: LoopState;
  stage: LoopEffortBudgetStage;
  usage?: Partial<LoopEffortUsage> | null;
  proposedVerdict?: Verdict | null;
}

export interface LoopEffortBudgetDecision {
  kind: "continue" | "stop" | "version_target" | "blocker";
  allowContinue: boolean;
  allowWorkerPass: boolean;
  blockedReason: string | null;
  violations: string[];
  usage: LoopEffortUsage | null;
  limits: LoopEffortLimits | null;
}

const CONTINUE_DECISION: LoopEffortBudgetDecision = {
  kind: "continue",
  allowContinue: true,
  allowWorkerPass: true,
  blockedReason: null,
  violations: [],
  usage: null,
  limits: null,
};

export function deriveEffortObservation(input: EffortObservationInput): EffortObservation {
  const shallow =
    input.verdictFail === true ||
    (positiveNumber(input.outputChars) && input.outputChars < SHALLOW_OUTPUT_CHARS_MIN);
  const tooSlow =
    input.truncated !== true &&
    positiveNumber(input.elapsedMs) &&
    input.elapsedMs > TOO_SLOW_ELAPSED_MS;
  return {
    ...(shallow ? { shallow: true } : {}),
    ...(tooSlow ? { tooSlow: true } : {}),
  };
}

const PLAN_SIZE_LIMITS: Record<LoopPlanSize, LoopEffortLimits> = {
  S: { maxIterations: 2, maxToolCalls: 16, maxCostUsd: 0.75, maxElapsedMs: 10 * 60 * 1000 },
  M: { maxIterations: 4, maxToolCalls: 32, maxCostUsd: 2, maxElapsedMs: 25 * 60 * 1000 },
  L: { maxIterations: 6, maxToolCalls: 64, maxCostUsd: 5, maxElapsedMs: 60 * 60 * 1000 },
  XL: { maxIterations: 8, maxToolCalls: 96, maxCostUsd: 9, maxElapsedMs: 2 * 60 * 60 * 1000 },
};

const ROLE_LIMIT_MULTIPLIER: Record<LoopModelRole, number> = {
  smart_review_agent: 1.1,
  light_implementation_agent: 0.8,
  worker: 1,
  verifier: 0.7,
  fast_checker: 0.35,
  tl: 1,
};

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeUsage(
  state: LoopState,
  budget: LoopEffortBudgetState,
  override?: Partial<LoopEffortUsage> | null,
): LoopEffortUsage {
  return {
    iteration: positiveNumber(override?.iteration)
      ? override.iteration
      : positiveNumber(budget.usage.iteration)
        ? budget.usage.iteration
        : state.iteration,
    toolCalls: positiveNumber(override?.toolCalls)
      ? override.toolCalls
      : positiveNumber(budget.usage.toolCalls)
        ? budget.usage.toolCalls
        : 0,
    costUsd: positiveNumber(override?.costUsd)
      ? override.costUsd
      : positiveNumber(budget.usage.costUsd)
        ? budget.usage.costUsd
        : state.costUsd,
    elapsedMs: positiveNumber(override?.elapsedMs)
      ? override.elapsedMs
      : positiveNumber(budget.usage.elapsedMs)
        ? budget.usage.elapsedMs
        : 0,
  };
}

function limitViolation(value: number, limit: number, name: string): string | null {
  if (!positiveNumber(limit) || limit === 0) return `${name}_limit_invalid`;
  return value >= limit ? `${name}_over_limit` : null;
}

export function deriveLoopEffortLimits(
  planSize: LoopPlanSize,
  modelRole: LoopModelRole,
): LoopEffortLimits {
  const base = PLAN_SIZE_LIMITS[planSize];
  const multiplier = ROLE_LIMIT_MULTIPLIER[modelRole];
  return {
    maxIterations: Math.max(1, Math.floor(base.maxIterations * multiplier)),
    maxToolCalls: Math.max(1, Math.floor(base.maxToolCalls * multiplier)),
    maxCostUsd: Number((base.maxCostUsd * multiplier).toFixed(4)),
    maxElapsedMs: Math.max(1, Math.floor(base.maxElapsedMs * multiplier)),
  };
}

export function createLoopEffortBudget(input: {
  planSize: LoopPlanSize;
  modelRole: LoopModelRole;
  usage?: Partial<LoopEffortUsage>;
  limits?: Partial<LoopEffortLimits>;
  overrunPolicy?: LoopEffortBudgetState["overrunPolicy"];
  versionTarget?: string | null;
}): LoopEffortBudgetState {
  const derived = deriveLoopEffortLimits(input.planSize, input.modelRole);
  return {
    planSize: input.planSize,
    modelRole: input.modelRole,
    usage: {
      iteration: input.usage?.iteration ?? 0,
      toolCalls: input.usage?.toolCalls ?? 0,
      costUsd: input.usage?.costUsd ?? 0,
      elapsedMs: input.usage?.elapsedMs ?? 0,
    },
    limits: {
      maxIterations: input.limits?.maxIterations ?? derived.maxIterations,
      maxToolCalls: input.limits?.maxToolCalls ?? derived.maxToolCalls,
      maxCostUsd: input.limits?.maxCostUsd ?? derived.maxCostUsd,
      maxElapsedMs: input.limits?.maxElapsedMs ?? derived.maxElapsedMs,
    },
    overrunPolicy: input.overrunPolicy ?? "stop",
    versionTarget: input.versionTarget ?? null,
  };
}

export function tickLoopEffortBudget(input: LoopEffortBudgetInput): LoopEffortBudgetDecision {
  const budget = input.state.effortBudget;
  if (!budget) return CONTINUE_DECISION;

  const usage = normalizeUsage(input.state, budget, input.usage);
  const limits = budget.limits;
  const violations = [
    limitViolation(usage.iteration, limits.maxIterations, "iteration"),
    limitViolation(usage.toolCalls, limits.maxToolCalls, "tool_calls"),
    limitViolation(usage.costUsd, limits.maxCostUsd, "cost_usd"),
    limitViolation(usage.elapsedMs, limits.maxElapsedMs, "elapsed_ms"),
  ].filter((v): v is string => v != null);

  if (violations.length === 0) {
    return {
      ...CONTINUE_DECISION,
      usage,
      limits,
    };
  }

  const attemptedPass = input.stage === "after_verifier" && input.proposedVerdict === "pass";
  const blockedReason = attemptedPass
    ? "loop_effort_budget_overrun_blocks_worker_pass"
    : "loop_effort_budget_overrun";
  const kind =
    budget.overrunPolicy === "version_target"
      ? "version_target"
      : budget.overrunPolicy === "escalate"
        ? "blocker"
        : "stop";

  return {
    kind,
    allowContinue: false,
    allowWorkerPass: false,
    blockedReason,
    violations,
    usage,
    limits,
  };
}
