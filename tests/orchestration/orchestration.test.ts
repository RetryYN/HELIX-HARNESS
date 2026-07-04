import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { selectVerifier } from "../../src/orchestration/cross-verifier";
import { openJobQueue } from "../../src/orchestration/job-queue";
import {
  createLoopEffortBudget,
  deriveLoopEffortLimits,
  tickLoopEffortBudget,
} from "../../src/orchestration/loop-effort-budget";
import { classifyRecovery, DIFF_ESCALATION_THRESHOLD } from "../../src/orchestration/loop-recovery";
import { canResume, type TickDeps, tick } from "../../src/orchestration/loop-runner";
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

  function makeTickDeps(input: Partial<TickDeps> = {}): TickDeps {
    return {
      mode: "hybrid",
      now: vi.fn(() => "2026-06-28T00:30:00.000Z"),
      providerAvailable: vi.fn(() => true),
      runWorker: vi.fn(async () => {}),
      runVerifier: vi.fn(async () => "pass" as const),
      recordIteration: vi.fn(),
      ...input,
    };
  }

  it("U-ORCH-004: tick は resume 偽で不変 / stop 経路 / iteration++ で token を漏らさない", async () => {
    const paused = { ...runningState, status: "paused" as const };
    const pausedDeps = makeTickDeps();

    await expect(tick(paused, [], pausedDeps)).resolves.toBe(paused);
    expect(pausedDeps.runWorker).not.toHaveBeenCalled();
    expect(pausedDeps.runVerifier).not.toHaveBeenCalled();
    expect(pausedDeps.recordIteration).not.toHaveBeenCalled();

    const stopDeps = makeTickDeps();
    await expect(
      tick(runningState, [{ reason: "count", threshold: 1, onFailure: "abort" }], stopDeps),
    ).resolves.toEqual({ ...runningState, status: "stopped" });
    expect(stopDeps.runWorker).not.toHaveBeenCalled();
    expect(stopDeps.runVerifier).not.toHaveBeenCalled();
    expect(stopDeps.recordIteration).toHaveBeenCalledWith({
      planId: runningState.planId,
      iteration: runningState.iteration,
      workerProvider: "codex",
      verifierProvider: null,
      verdict: "fail",
      stopReason: "count",
      blockedReason: null,
      costUsd: runningState.costUsd,
      recordedAt: "2026-06-28T00:30:00.000Z",
    });

    const normalDeps = makeTickDeps({
      runVerifier: vi.fn(async () => "fail" as const),
    });
    await expect(tick(runningState, [], normalDeps)).resolves.toEqual({
      ...runningState,
      iteration: 2,
      lastVerdict: "fail",
      verifierProvider: "claude",
      blockedReason: null,
      updatedAt: "2026-06-28T00:30:00.000Z",
    });
    expect(normalDeps.runWorker).toHaveBeenCalledWith(runningState);
    expect(normalDeps.runVerifier).toHaveBeenCalledWith("claude", runningState);
    expect(normalDeps.recordIteration).toHaveBeenCalledWith({
      planId: runningState.planId,
      iteration: runningState.iteration,
      workerProvider: "codex",
      verifierProvider: "claude",
      verdict: "fail",
      stopReason: null,
      blockedReason: null,
      costUsd: runningState.costUsd,
      recordedAt: "2026-06-28T00:30:00.000Z",
    });

    const unavailableDeps = makeTickDeps({
      providerAvailable: vi.fn(() => false),
    });
    await expect(tick(runningState, [], unavailableDeps)).resolves.toEqual({
      ...runningState,
      status: "stopped",
      verifierProvider: null,
      blockedReason: "cross_runtime_unavailable",
    });
    expect(unavailableDeps.runWorker).not.toHaveBeenCalled();
    expect(unavailableDeps.runVerifier).not.toHaveBeenCalled();
    expect(unavailableDeps.recordIteration).toHaveBeenCalledWith({
      planId: runningState.planId,
      iteration: runningState.iteration,
      workerProvider: "codex",
      verifierProvider: null,
      verdict: "error",
      stopReason: null,
      blockedReason: "cross_runtime_unavailable",
      costUsd: runningState.costUsd,
      recordedAt: "2026-06-28T00:30:00.000Z",
    });
  });

  it("HU-PILLAR-P2-02: tickLoopEffortBudget は plan size / role / iteration / tool use 超過を止める", () => {
    const smartLimits = deriveLoopEffortLimits("M", "smart_review_agent");
    const lightLimits = deriveLoopEffortLimits("M", "light_implementation_agent");

    expect(smartLimits.maxToolCalls).toBeGreaterThan(lightLimits.maxToolCalls);
    expect(smartLimits.maxIterations).toBeGreaterThanOrEqual(lightLimits.maxIterations);

    const budgeted = {
      ...runningState,
      effortBudget: createLoopEffortBudget({
        planSize: "M",
        modelRole: "light_implementation_agent",
        usage: { iteration: 1, toolCalls: 2, costUsd: 0.1, elapsedMs: 1000 },
        limits: { maxIterations: 3, maxToolCalls: 4, maxCostUsd: 0.5, maxElapsedMs: 5000 },
      }),
    };

    expect(tickLoopEffortBudget({ state: budgeted, stage: "before_worker" })).toMatchObject({
      kind: "continue",
      allowContinue: true,
      allowWorkerPass: true,
      violations: [],
    });

    expect(
      tickLoopEffortBudget({
        state: budgeted,
        stage: "before_worker",
        usage: { toolCalls: 4 },
      }),
    ).toMatchObject({
      kind: "stop",
      allowContinue: false,
      allowWorkerPass: false,
      blockedReason: "loop_effort_budget_overrun",
      violations: ["tool_calls_over_limit"],
    });

    expect(
      tickLoopEffortBudget({
        state: budgeted,
        stage: "after_verifier",
        usage: { iteration: 3, costUsd: 0.5 },
        proposedVerdict: "pass",
      }),
    ).toMatchObject({
      kind: "stop",
      allowContinue: false,
      allowWorkerPass: false,
      blockedReason: "loop_effort_budget_overrun_blocks_worker_pass",
      violations: expect.arrayContaining(["iteration_over_limit", "cost_usd_over_limit"]),
    });
  });

  it("HU-PILLAR-P2-02: tick は effort-budget 超過時に worker dispatch/pass/continue を記録しない", async () => {
    const overBefore = {
      ...runningState,
      effortBudget: createLoopEffortBudget({
        planSize: "S",
        modelRole: "worker",
        usage: { iteration: 1, toolCalls: 8, costUsd: 0.1, elapsedMs: 1000 },
        limits: { maxIterations: 3, maxToolCalls: 8, maxCostUsd: 1, maxElapsedMs: 5000 },
      }),
    };
    const beforeDeps = makeTickDeps();

    await expect(tick(overBefore, [], beforeDeps)).resolves.toEqual({
      ...overBefore,
      status: "stopped",
      blockedReason: "loop_effort_budget_overrun",
    });
    expect(beforeDeps.runWorker).not.toHaveBeenCalled();
    expect(beforeDeps.runVerifier).not.toHaveBeenCalled();
    expect(beforeDeps.recordIteration).toHaveBeenCalledWith({
      planId: overBefore.planId,
      iteration: overBefore.iteration,
      workerProvider: "codex",
      verifierProvider: null,
      verdict: "fail",
      stopReason: "effort_budget",
      blockedReason: "loop_effort_budget_overrun",
      costUsd: overBefore.costUsd,
      recordedAt: "2026-06-28T00:30:00.000Z",
    });

    const overAfter = {
      ...runningState,
      effortBudget: createLoopEffortBudget({
        planSize: "S",
        modelRole: "worker",
        usage: { iteration: 1, toolCalls: 2, costUsd: 0.1, elapsedMs: 1000 },
        limits: { maxIterations: 2, maxToolCalls: 3, maxCostUsd: 1, maxElapsedMs: 5000 },
      }),
    };
    const afterDeps = makeTickDeps({
      runVerifier: vi.fn(async () => "pass" as const),
      readEffortUsage: vi.fn((state: LoopState) =>
        state.iteration > overAfter.iteration
          ? { iteration: 2, toolCalls: 3, costUsd: 0.2, elapsedMs: 1200 }
          : overAfter.effortBudget?.usage,
      ),
    });

    await expect(tick(overAfter, [], afterDeps)).resolves.toEqual({
      ...overAfter,
      status: "stopped",
      iteration: 2,
      lastVerdict: "error",
      verifierProvider: "claude",
      blockedReason: "loop_effort_budget_overrun_blocks_worker_pass",
      updatedAt: "2026-06-28T00:30:00.000Z",
    });
    expect(afterDeps.runWorker).toHaveBeenCalledWith(overAfter);
    expect(afterDeps.runVerifier).toHaveBeenCalledWith("claude", overAfter);
    expect(afterDeps.recordIteration).toHaveBeenCalledWith({
      planId: overAfter.planId,
      iteration: overAfter.iteration,
      workerProvider: "codex",
      verifierProvider: "claude",
      verdict: "error",
      stopReason: "effort_budget",
      blockedReason: "loop_effort_budget_overrun_blocks_worker_pass",
      costUsd: overAfter.costUsd,
      recordedAt: "2026-06-28T00:30:00.000Z",
    });
  });

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

  it("U-ORCH-006: claimNextJob は BEGIN IMMEDIATE で競合 claim を二重取得しない", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-job-queue-"));
    const dbPath = join(root, "jobs.sqlite");
    const queue = openJobQueue(dbPath);

    try {
      queue.enqueue({
        id: "job-late",
        planId: "PLAN-L7-176",
        priority: 20,
        createdAt: "2026-06-28T00:00:02.000Z",
      });
      queue.enqueue({
        id: "job-first",
        planId: "PLAN-L7-176",
        priority: 10,
        createdAt: "2026-06-28T00:00:01.000Z",
      });
      queue.enqueue({
        id: "job-second",
        planId: "PLAN-L7-176",
        priority: 10,
        createdAt: "2026-06-28T00:00:02.000Z",
      });

      const first = queue.claimNextJob("codex");
      const second = queue.claimNextJob("claude");
      const third = queue.claimNextJob("codex");
      const drained = queue.claimNextJob("claude");

      expect(first).toMatchObject({
        id: "job-first",
        planId: "PLAN-L7-176",
        priority: 10,
        status: "claimed",
        provider: "codex",
        retryCount: 0,
      });
      expect(second).toMatchObject({
        id: "job-second",
        status: "claimed",
        provider: "claude",
      });
      expect(third).toMatchObject({
        id: "job-late",
        status: "claimed",
        provider: "codex",
      });
      expect(new Set([first?.id, second?.id, third?.id]).size).toBe(3);
      expect(drained).toBeNull();
    } finally {
      queue.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
