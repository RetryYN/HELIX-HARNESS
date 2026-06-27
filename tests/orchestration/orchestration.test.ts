import { describe, expect, it } from "vitest";
import { selectVerifier } from "../../src/orchestration/cross-verifier";
import { classifyRecovery, DIFF_ESCALATION_THRESHOLD } from "../../src/orchestration/loop-recovery";
import { canResume } from "../../src/orchestration/loop-runner";
import type { LoopState, StopRule } from "../../src/orchestration/loop-state";
import { evaluateStop, type StopProbe } from "../../src/orchestration/loop-stop-rules";

describe("P2 orchestration (PLAN-L6-50 add-impl で実装)", () => {
  const runningState: LoopState = {
    planId: "PLAN-L7-175",
    status: "running",
    iteration: 1,
    maxIterations: 3,
    lastVerdict: "fail",
    workerProvider: "codex",
    verifierProvider: null,
    blockedReason: null,
    windowOpensAt: "2026-06-28T00:00:00.000Z",
    windowClosesAt: "2026-06-28T01:00:00.000Z",
    costUsd: 1.5,
    updatedAt: "2026-06-28T00:30:00.000Z",
  };

  const probe: StopProbe = {
    exists: (path: string) => path === "READY",
    noProgress: (threshold: number) => threshold <= 2,
    custom: () => true,
  };

  it("U-ORCH-001: canResume は status/window/lastVerdict/iteration の 3 条件 AND", () => {
    expect(canResume(runningState, "2026-06-28T00:00:00.000Z")).toBe(true);
    expect(canResume(runningState, "2026-06-28T01:00:00.000Z")).toBe(true);
    expect(canResume({ ...runningState, status: "paused" }, "2026-06-28T00:30:00.000Z")).toBe(
      false,
    );
    expect(canResume(runningState, "2026-06-27T23:59:59.999Z")).toBe(false);
    expect(canResume(runningState, "2026-06-28T01:00:00.001Z")).toBe(false);
    expect(canResume({ ...runningState, lastVerdict: "pass" }, "2026-06-28T00:30:00.000Z")).toBe(
      false,
    );
    expect(canResume({ ...runningState, iteration: 3 }, "2026-06-28T00:30:00.000Z")).toBe(false);
  });

  it("U-ORCH-002: evaluateStop は各 StopReason を判定し未知 reason を escalate で fail-close", () => {
    expect(
      evaluateStop(
        [
          { reason: "count", threshold: 10, onFailure: "retry" },
          { reason: "verdict", onFailure: "abort" },
        ],
        { ...runningState, lastVerdict: "pass" },
        probe,
      ),
    ).toEqual({ stop: true, reason: "verdict", onFailure: "abort" });
    expect(
      evaluateStop([{ reason: "count", threshold: 1, onFailure: "retry" }], runningState, probe),
    ).toEqual({ stop: true, reason: "count", onFailure: "retry" });
    expect(
      evaluateStop(
        [{ reason: "cost_budget", threshold: 1.25, onFailure: "escalate" }],
        runningState,
        probe,
      ),
    ).toEqual({ stop: true, reason: "cost_budget", onFailure: "escalate" });
    expect(
      evaluateStop(
        [{ reason: "file_exists", path: "READY", onFailure: "abort" }],
        runningState,
        probe,
      ),
    ).toEqual({ stop: true, reason: "file_exists", onFailure: "abort" });
    expect(
      evaluateStop(
        [{ reason: "no_progress", threshold: 2, onFailure: "escalate" }],
        runningState,
        probe,
      ),
    ).toEqual({ stop: true, reason: "no_progress", onFailure: "escalate" });
    expect(evaluateStop([{ reason: "custom", onFailure: "retry" }], runningState, probe)).toEqual({
      stop: true,
      reason: "custom",
      onFailure: "retry",
    });
    expect(
      evaluateStop(
        [
          { reason: "count", threshold: 1, onFailure: "retry" },
          { reason: "cost_budget", threshold: 1, onFailure: "abort" },
        ],
        runningState,
        probe,
      ),
    ).toEqual({ stop: true, reason: "count", onFailure: "retry" });
    expect(
      evaluateStop([{ reason: "count", threshold: 10, onFailure: "retry" }], runningState, probe),
    ).toEqual({ stop: false, reason: null, onFailure: null });
    expect(evaluateStop([{ reason: "count", onFailure: "retry" }], runningState, probe)).toEqual({
      stop: true,
      reason: null,
      onFailure: "escalate",
    });
    expect(
      evaluateStop([{ reason: "cost_budget", onFailure: "retry" }], runningState, probe),
    ).toEqual({ stop: true, reason: null, onFailure: "escalate" });
    expect(
      evaluateStop([{ reason: "no_progress", onFailure: "retry" }], runningState, probe),
    ).toEqual({ stop: true, reason: null, onFailure: "escalate" });
    expect(
      evaluateStop([{ reason: "file_exists", onFailure: "retry" }], runningState, probe),
    ).toEqual({ stop: true, reason: null, onFailure: "escalate" });
    expect(() =>
      evaluateStop(
        [{ reason: "unknown", onFailure: "retry" } as unknown as StopRule],
        runningState,
        probe,
      ),
    ).not.toThrow();
    expect(
      evaluateStop(
        [{ reason: "unknown", onFailure: "retry" } as unknown as StopRule],
        runningState,
        probe,
      ),
    ).toEqual({ stop: true, reason: null, onFailure: "escalate" });
  });

  it("U-ORCH-003: selectVerifier は hybrid で worker と別 provider / single は fallback 記録", () => {
    expect(selectVerifier("codex", "hybrid")).toEqual({
      provider: "claude",
      blockedReason: null,
    });
    expect(selectVerifier("claude", "hybrid")).toEqual({
      provider: "codex",
      blockedReason: null,
    });
    expect(selectVerifier("codex", "codex-only")).toEqual({
      provider: "codex",
      blockedReason: "intra_runtime_fallback",
    });
    expect(selectVerifier("claude", "claude-only")).toEqual({
      provider: "claude",
      blockedReason: "intra_runtime_fallback",
    });
    expect(selectVerifier("codex", "hybrid").provider).not.toBe("codex");
    expect(selectVerifier("claude", "hybrid").provider).not.toBe("claude");
  });

  it.todo("U-ORCH-004: tick は resume 偽で不変 / stop 経路 / iteration++ で token を漏らさない");

  it("U-ORCH-005: classifyRecovery は C1-C4 を escalate/retry/abort/continue へ分類", () => {
    const quietSignals = {
      diffSize: 10,
      doctorRed: false,
      handoverStale: false,
      budgetOverWorker: false,
      budgetOverVerifier: false,
    };

    expect(classifyRecovery(runningState, { ...quietSignals, doctorRed: true })).toEqual({
      kind: "escalate",
      reason: "doctor_red",
    });
    expect(
      classifyRecovery(runningState, {
        ...quietSignals,
        budgetOverWorker: true,
        budgetOverVerifier: true,
      }),
    ).toEqual({ kind: "escalate", reason: "budget_over_both" });
    expect(classifyRecovery(runningState, { ...quietSignals, handoverStale: true })).toEqual({
      kind: "retry",
      reason: "handover_stale",
    });
    expect(
      classifyRecovery(runningState, {
        ...quietSignals,
        diffSize: DIFF_ESCALATION_THRESHOLD + 1,
      }),
    ).toEqual({ kind: "abort", reason: "diff_size_over_threshold" });
    expect(classifyRecovery(runningState, quietSignals)).toEqual({
      kind: "continue",
      reason: "within_threshold",
    });
  });

  it.todo("U-ORCH-006: claimNextJob は BEGIN IMMEDIATE で競合 claim を二重取得しない");
});
