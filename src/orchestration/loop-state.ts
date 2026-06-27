export type Provider = "claude" | "codex";
export type Verdict = "pass" | "fail" | "error" | "pending";

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
