import type { LoopState } from "./loop-state";

export const DIFF_ESCALATION_THRESHOLD = 400;

export interface RecoverySignals {
  diffSize: number;
  doctorRed: boolean;
  handoverStale: boolean;
  budgetOverWorker: boolean;
  budgetOverVerifier: boolean;
}

export interface RecoveryAction {
  kind: "escalate" | "retry" | "abort" | "continue";
  reason: string;
}

export function classifyRecovery(_s: LoopState, signals: RecoverySignals): RecoveryAction {
  if (signals.doctorRed) {
    return {
      kind: "escalate",
      reason: "doctor_red",
    };
  }

  if (signals.budgetOverWorker && signals.budgetOverVerifier) {
    return {
      kind: "escalate",
      reason: "budget_over_both",
    };
  }

  if (signals.handoverStale) {
    return {
      kind: "retry",
      reason: "handover_stale",
    };
  }

  if (signals.diffSize > DIFF_ESCALATION_THRESHOLD) {
    return {
      kind: "abort",
      reason: "diff_size_over_threshold",
    };
  }

  return {
    kind: "continue",
    reason: "within_threshold",
  };
}
