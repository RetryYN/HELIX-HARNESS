import { loopEpochPaths, readLoopEpochFromFs } from "../orchestration/durable-loop-epoch-node";
import type { LoopState } from "../orchestration/loop-state";
import { assertLoopPlanId } from "../schema/loop-plan-id";

export const AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION = "autonomous-loop-run-receipts.v1";

export type LoopReceiptStopKind = "success_stop" | "budget_stop" | "blocker_stop" | "running";

export type AutonomousLoopRunReceipt = {
  schema_version: typeof AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION;
  ok: boolean;
  plan_id: string;
  status: "present" | "missing" | "blocked";
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
  const snapshot = readLoopEpochFromFs(repoRoot, safePlanId);
  const paths = loopEpochPaths(repoRoot, safePlanId);
  if (snapshot.status === "missing") {
    const legacyPath = join(repoRoot, ".helix", "state", "loop", `${safePlanId}.json`);
    if (existsSync(legacyPath)) {
      return {
        schema_version: AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION,
        ok: false,
        plan_id: planId,
        status: "blocked",
        loop_state: null,
        iteration_count: 0,
        stop_kind: "blocker_stop",
        restartable_next_action: `helix loop run --plan ${planId} --dry-run`,
        retry: { allowed: false, max_iterations: null, reason: "legacy_state_requires_import" },
        evidence_paths: [legacyPath],
        findings: [
          {
            code: "receipt_legacy_state_unimported",
            severity: "error",
            detail: "legacy loop state exists and must pass strict epoch import before receipt use",
          },
        ],
        source_command: options.sourceCommand ?? "helix loop receipt --json",
      };
    }
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
  if (snapshot.status !== "committed" || snapshot.payload === null) {
    return {
      schema_version: AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION,
      ok: false,
      plan_id: planId,
      status: "blocked",
      loop_state: snapshot.payload?.state ?? null,
      iteration_count: snapshot.payload?.state.iteration ?? 0,
      stop_kind: "blocker_stop",
      restartable_next_action: null,
      retry: { allowed: false, max_iterations: null, reason: snapshot.reason },
      evidence_paths: [paths.manifest],
      findings: [
        {
          code: `receipt_${snapshot.status}`,
          severity: "error",
          detail: `loop epoch cannot produce a receipt: ${snapshot.reason}`,
        },
      ],
      source_command: options.sourceCommand ?? "helix loop receipt --json",
    };
  }
  const state = snapshot.payload.state;
  const latestIteration = snapshot.payload.iteration;
  const iterationEvidenceMatches =
    state.iteration === 0
      ? latestIteration === null
      : latestIteration !== null && latestIteration.iteration === state.iteration - 1;
  const iterationCount = iterationEvidenceMatches ? state.iteration : 0;
  const kind = stopKind(state);
  const remainingIterations = Math.max(0, state.maxIterations - state.iteration);
  return {
    schema_version: AUTONOMOUS_LOOP_RECEIPT_SCHEMA_VERSION,
    ok: iterationEvidenceMatches && (iterationCount > 0 || state.status !== "running"),
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
    evidence_paths: [paths.manifest, paths.payloadFor(snapshot.manifest?.payloadFile ?? "")],
    findings: !iterationEvidenceMatches
      ? [
          {
            code: "iteration_receipt_mismatch",
            severity: "error",
            detail: "latest durable iteration receipt does not match loop state progression",
          },
        ]
      : iterationCount === 0 && state.status === "running"
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

import { existsSync } from "node:fs";
import { join } from "node:path";
