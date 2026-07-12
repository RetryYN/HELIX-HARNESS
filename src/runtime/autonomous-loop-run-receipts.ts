import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LoopState } from "../orchestration/loop-state";
import { assertLoopPlanId } from "../orchestration/loop-store";

export const AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION = "autonomous-loop-run-receipts.v1";

export type LoopReceiptStopKind = "success_stop" | "budget_stop" | "blocker_stop" | "running";

export type AutonomousLoopRunReceipt = {
  schema_version: typeof AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION;
  ok: boolean;
  plan_id: string;
  status: "present" | "missing";
  loop_state: LoopState | null;
  iteration_count: number;
  stop_kind: LoopReceiptStopKind;
  restartable_next_action: string | null;
  retry: {
    allowed: boolean;
    max_iterations: number | null;
    reason: string | null;
  };
  evidence_paths: string[];
  findings: Array<{ code: string; severity: "error" | "warning"; detail: string }>;
  source_command: string;
};

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function countJsonl(path: string): number {
  if (!existsSync(path)) return 0;
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
}

function stopKind(state: LoopState): LoopReceiptStopKind {
  if (state.status === "running") return "running";
  if (state.lastVerdict === "pass") return "success_stop";
  if (state.blockedReason?.includes("budget") || state.costUsd > 0) return "budget_stop";
  return "blocker_stop";
}

export function buildAutonomousLoopRunReceipt(
  repoRoot: string,
  planId: string,
  options: { sourceCommand?: string } = {},
): AutonomousLoopRunReceipt {
  const safePlanId = assertLoopPlanId(planId);
  const statePath = join(repoRoot, ".helix", "state", "loop", `${safePlanId}.json`);
  const iterationsPath = join(
    repoRoot,
    ".helix",
    "state",
    "loop",
    `${safePlanId}.iterations.jsonl`,
  );
  const state = readJson<LoopState>(statePath);
  if (!state) {
    return {
      schema_version: AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION,
      ok: false,
      plan_id: planId,
      status: "missing",
      loop_state: null,
      iteration_count: 0,
      stop_kind: "blocker_stop",
      restartable_next_action: null,
      retry: { allowed: false, max_iterations: null, reason: "missing_loop_state" },
      evidence_paths: [],
      findings: [
        {
          code: "receipt_missing",
          severity: "error",
          detail: `loop state is missing for ${planId}`,
        },
      ],
      source_command: options.sourceCommand ?? "helix loop receipt --json",
    };
  }
  const iterationCount = countJsonl(iterationsPath);
  const kind = stopKind(state);
  const remainingIterations = Math.max(0, state.maxIterations - state.iteration);
  return {
    schema_version: AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION,
    ok: iterationCount > 0 || state.status !== "running",
    plan_id: planId,
    status: "present",
    loop_state: state,
    iteration_count: iterationCount,
    stop_kind: kind,
    restartable_next_action:
      state.status === "running" && remainingIterations > 0
        ? `helix loop run --plan ${planId} --once`
        : null,
    retry: {
      allowed: state.status === "running" && remainingIterations > 0,
      max_iterations: state.maxIterations,
      reason: state.blockedReason,
    },
    evidence_paths: [statePath, ...(existsSync(iterationsPath) ? [iterationsPath] : [])],
    findings:
      iterationCount === 0 && state.status === "running"
        ? [
            {
              code: "running_without_iteration_receipt",
              severity: "error",
              detail: "running autonomous-loop state has no iteration receipt",
            },
          ]
        : [],
    source_command: options.sourceCommand ?? "helix loop receipt --json",
  };
}
