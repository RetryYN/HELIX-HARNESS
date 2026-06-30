export type Provider = "claude" | "codex";
export type Verdict = "pass" | "fail" | "error" | "pending";
export type LoopPlanSize = "S" | "M" | "L" | "XL";
export type LoopModelRole =
  | "smart_review_agent"
  | "light_implementation_agent"
  | "worker"
  | "verifier"
  | "fast_checker"
  | "tl";

export interface LoopEffortUsage {
  iteration: number;
  toolCalls: number;
  costUsd: number;
  elapsedMs: number;
}

export interface LoopEffortLimits {
  maxIterations: number;
  maxToolCalls: number;
  maxCostUsd: number;
  maxElapsedMs: number;
}

export interface LoopEffortBudgetState {
  planSize: LoopPlanSize;
  modelRole: LoopModelRole;
  usage: LoopEffortUsage;
  limits: LoopEffortLimits;
  overrunPolicy: "stop" | "version_target" | "escalate";
  versionTarget?: string | null;
}

export interface LoopState {
  planId: string;
  status: "running" | "paused" | "stopped";
  iteration: number;
  maxIterations: number;
  lastVerdict: Verdict;
  workerProvider: Provider;
  verifierProvider: Provider | null;
  blockedReason: string | null;
  windowOpensAt: string;
  windowClosesAt: string;
  costUsd: number;
  effortBudget?: LoopEffortBudgetState;
  updatedAt: string;
}

export type StopReason =
  | "verdict"
  | "count"
  | "file_exists"
  | "cost_budget"
  | "no_progress"
  | "custom";
export type OnFailure = "escalate" | "retry" | "abort";

export interface StopRule {
  reason: StopReason;
  threshold?: number;
  path?: string;
  onFailure: OnFailure;
}

export interface StopDecision {
  stop: boolean;
  reason: StopReason | null;
  onFailure: OnFailure | null;
}

export type LoopRuntimeStopReason = StopReason | "effort_budget";
