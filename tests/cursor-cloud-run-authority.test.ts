// PLAN-RECOVERY-1707-cursor-v1-run-authority / CURSOR-V1-RUN-AUTHORITY-001
import { describe, expect, it } from "vitest";

import {
  classifyCursorV1Runs,
  decideCursorFollowUpDispatch,
  evaluateCursorCancelReadAfter,
  evaluateCursorFollowUpReadAfter,
  handleCursorFollowUpPostResult,
} from "../src/runtime/cursor-cloud-run-authority.js";

const NOW = "2026-09-10T03:00:00.000Z";

describe("Cursor v1 run authority", () => {
  it("U-CURSOR-RUN-001: v0 summaryを使わずv1 runを型付き分類する", () => {
    const result = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-fresh",
          status: "RUNNING",
          createdAt: "2026-09-10T02:55:00.000Z",
          updatedAt: "2026-09-10T02:59:00.000Z",
          cancellable: true,
        },
        {
          id: "run-phantom",
          status: "CREATING",
          createdAt: "2026-09-10T00:00:00.000Z",
          updatedAt: "2026-09-10T00:01:00.000Z",
          cancellable: false,
        },
        {
          id: "run-recovery",
          status: "CREATING",
          createdAt: "2026-09-10T00:02:00.000Z",
          updatedAt: "2026-09-10T00:03:00.000Z",
          cancellable: true,
        },
        {
          id: "run-finished",
          status: "FINISHED",
          createdAt: "2026-09-09T23:00:00.000Z",
          updatedAt: "2026-09-09T23:30:00.000Z",
          cancellable: false,
        },
      ],
    });

    expect(result.authoritativeActiveRunIds).toEqual(["run-fresh"]);
    expect(result.cancellableRecoveryRunIds).toEqual(["run-recovery"]);
    expect(result.phantomRunIds).toEqual(["run-phantom"]);
    expect(result.terminalRunIds).toEqual(["run-finished"]);
    expect(result.runs.map(({ id, classification }) => [id, classification])).toEqual([
      ["run-fresh", "active"],
      ["run-phantom", "phantom"],
      ["run-recovery", "cancellable_stale"],
      ["run-finished", "terminal"],
    ]);
  });

  it("U-CURSOR-RUN-002: cancellable stale runが一意ならcancel後read-afterだけを許可する", () => {
    const decision = decideCursorFollowUpDispatch({
      providerAvailable: true,
      classification: classifyCursorV1Runs({
        now: NOW,
        staleAfterMs: 30 * 60_000,
        runs: [
          {
            id: "run-oldest-cancellable",
            status: "CREATING",
            createdAt: "2026-09-10T00:00:00.000Z",
            updatedAt: "2026-09-10T00:01:00.000Z",
            cancellable: true,
          },
          {
            id: "run-phantom",
            status: "CREATING",
            createdAt: "2026-09-10T00:02:00.000Z",
            updatedAt: "2026-09-10T00:03:00.000Z",
            cancellable: false,
          },
        ],
      }),
    });

    expect(decision).toEqual({
      lane: "cursor_cloud_execution",
      laneStatus: "available",
      action: "cancel_then_read_after",
      cancelRunId: "run-oldest-cancellable",
      postAllowed: false,
      retryPostAllowed: false,
      reason: "single_cancellable_stale_run",
    });
  });

  it("U-CURSOR-RUN-003: activeまたは複数cancel候補ではfollow-upをfail-closeする", () => {
    const active = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-active",
          status: "RUNNING",
          createdAt: "2026-09-10T02:50:00.000Z",
          updatedAt: "2026-09-10T02:59:00.000Z",
          cancellable: true,
        },
      ],
    });
    expect(
      decideCursorFollowUpDispatch({ providerAvailable: true, classification: active }),
    ).toMatchObject({ action: "deny", reason: "active_run_present", postAllowed: false });

    const ambiguous = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: ["a", "b"].map((id, index) => ({
        id,
        status: "CREATING",
        createdAt: `2026-09-10T00:0${index}:00.000Z`,
        updatedAt: `2026-09-10T00:0${index}:30.000Z`,
        cancellable: true,
      })),
    });
    expect(
      decideCursorFollowUpDispatch({ providerAvailable: true, classification: ambiguous }),
    ).toMatchObject({
      action: "deny",
      reason: "multiple_cancellable_stale_runs",
      postAllowed: false,
    });
  });

  it("U-CURSOR-RUN-004: phantomだけなら一度だけPOST可能だが409を再POSTしない", () => {
    const classification = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-phantom",
          status: "CREATING",
          createdAt: "2026-09-10T00:00:00.000Z",
          updatedAt: "2026-09-10T00:01:00.000Z",
          cancellable: false,
        },
      ],
    });
    expect(decideCursorFollowUpDispatch({ providerAvailable: true, classification })).toMatchObject(
      { action: "post_once", postAllowed: true, retryPostAllowed: false },
    );
    expect(handleCursorFollowUpPostResult({ statusCode: 409 })).toEqual({
      action: "refresh_v1_runs",
      retryPostAllowed: false,
      reason: "agent_busy_or_run_conflict",
    });
  });

  it("U-CURSOR-RUN-005: POST後read-afterはsingle active runと期待IDをexact照合する", () => {
    const single = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-new",
          status: "RUNNING",
          createdAt: "2026-09-10T02:59:00.000Z",
          updatedAt: "2026-09-10T02:59:30.000Z",
          cancellable: true,
        },
      ],
    });
    expect(
      evaluateCursorFollowUpReadAfter({ expectedRunId: "run-new", classification: single }),
    ).toEqual({ accepted: true, reason: "single_expected_active_run", activeRunId: "run-new" });
    expect(
      evaluateCursorFollowUpReadAfter({ expectedRunId: "wrong", classification: single }),
    ).toEqual({ accepted: false, reason: "active_run_identity_mismatch" });
  });

  it("U-CURSOR-RUN-006: Cursor停止はCursor laneだけをdegradedにしPOSTしない", () => {
    expect(
      decideCursorFollowUpDispatch({
        providerAvailable: false,
        classification: classifyCursorV1Runs({ now: NOW, staleAfterMs: 30 * 60_000, runs: [] }),
      }),
    ).toEqual({
      lane: "cursor_cloud_execution",
      laneStatus: "degraded",
      action: "deny",
      postAllowed: false,
      retryPostAllowed: false,
      reason: "cursor_provider_unavailable",
    });
  });

  it("U-CURSOR-RUN-007: unknown statusと不正timestampをactiveへ推測しない", () => {
    const result = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-unknown",
          status: "QUEUED_ELSEWHERE",
          createdAt: "not-a-date",
          cancellable: true,
        },
      ],
    });
    expect(result.runs[0]?.classification).toBe("unknown");
    expect(result.unknownRunIds).toEqual(["run-unknown"]);
    expect(
      decideCursorFollowUpDispatch({ providerAvailable: true, classification: result }),
    ).toMatchObject({ action: "deny", reason: "unknown_run_state" });
  });

  it("U-CURSOR-RUN-008: cancel後は対象が占有から外れた最新GETだけで再dispatch可能になる", () => {
    const stillActive = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-cancelled-target",
          status: "RUNNING",
          createdAt: "2026-09-10T02:50:00.000Z",
          updatedAt: "2026-09-10T02:59:00.000Z",
          cancellable: true,
        },
      ],
    });
    expect(
      evaluateCursorCancelReadAfter({
        cancelledRunId: "run-cancelled-target",
        classification: stillActive,
      }),
    ).toEqual({ cleared: false, reason: "cancelled_run_still_occupies_agent" });

    const terminal = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-cancelled-target",
          status: "CANCELLED",
          createdAt: "2026-09-10T02:50:00.000Z",
          updatedAt: "2026-09-10T02:59:30.000Z",
          cancellable: false,
        },
      ],
    });
    expect(
      evaluateCursorCancelReadAfter({
        cancelledRunId: "run-cancelled-target",
        classification: terminal,
      }),
    ).toEqual({ cleared: true, reason: "cancelled_run_terminal_and_agent_clear" });
  });

  it("U-CURSOR-RUN-009: stale RUNNINGはcancel可能でも自動cancelせずdenyする", () => {
    const classification = classifyCursorV1Runs({
      now: NOW,
      staleAfterMs: 30 * 60_000,
      runs: [
        {
          id: "run-stale-running",
          status: "RUNNING",
          createdAt: "2026-09-10T00:00:00.000Z",
          updatedAt: "2026-09-10T00:01:00.000Z",
          cancellable: true,
        },
      ],
    });

    expect(classification.runs[0]?.classification).toBe("stale");
    expect(classification.cancellableRecoveryRunIds).toEqual([]);
    expect(decideCursorFollowUpDispatch({ providerAvailable: true, classification })).toMatchObject(
      { action: "deny", reason: "uncancellable_stale_run", postAllowed: false },
    );
  });
});
