import type { LoopState, StopDecision, StopReason, StopRule } from "./loop-state";

export interface StopProbe {
  exists(path: string): boolean;
  noProgress(threshold: number): boolean;
  custom(): boolean;
}

const FAIL_CLOSE_DECISION: StopDecision = {
  stop: true,
  reason: null,
  onFailure: "escalate",
};

const CONTINUE_DECISION: StopDecision = {
  stop: false,
  reason: null,
  onFailure: null,
};

function stopped(rule: StopRule): StopDecision {
  return {
    stop: true,
    reason: rule.reason,
    onFailure: rule.onFailure,
  };
}

function hasThreshold(rule: StopRule): rule is StopRule & { threshold: number } {
  return rule.threshold != null;
}

function isKnownReason(reason: string): reason is StopReason {
  return (
    reason === "verdict" ||
    reason === "count" ||
    reason === "file_exists" ||
    reason === "cost_budget" ||
    reason === "no_progress" ||
    reason === "custom"
  );
}

export function evaluateStop(rules: StopRule[], s: LoopState, probe: StopProbe): StopDecision {
  for (const rule of rules) {
    if (!isKnownReason(rule.reason)) return FAIL_CLOSE_DECISION;

    switch (rule.reason) {
      case "verdict":
        if (s.lastVerdict === "pass") return stopped(rule);
        break;
      case "count":
        if (!hasThreshold(rule)) return FAIL_CLOSE_DECISION;
        if (s.iteration >= rule.threshold) return stopped(rule);
        break;
      case "cost_budget":
        if (!hasThreshold(rule)) return FAIL_CLOSE_DECISION;
        if (s.costUsd >= rule.threshold) return stopped(rule);
        break;
      case "file_exists":
        if (rule.path == null) return FAIL_CLOSE_DECISION;
        if (probe.exists(rule.path)) return stopped(rule);
        break;
      case "no_progress":
        if (!hasThreshold(rule)) return FAIL_CLOSE_DECISION;
        if (probe.noProgress(rule.threshold)) return stopped(rule);
        break;
      case "custom":
        if (probe.custom()) return stopped(rule);
        break;
    }
  }

  return CONTINUE_DECISION;
}
