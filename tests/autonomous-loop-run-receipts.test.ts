import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loopEpochPaths } from "../src/orchestration/durable-loop-epoch-node";
import { durableFileLoopStore } from "../src/orchestration/loop-store";
import { buildAutonomousLoopRunReceipt } from "../src/runtime/autonomous-loop-run-receipts";

describe("autonomous loop run receipts", () => {
  it("fails closed when an autonomous loop claim has no receipt", () => {
    const report = buildAutonomousLoopRunReceipt("/missing", "PLAN-L7-366");

    expect(report.ok).toBe(false);
    expect(report.status).toBe("missing");
    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: "receipt_missing", severity: "error" }),
    );
  });

  it("S2: rejects traversal before resolving loop state paths", () => {
    expect(() => buildAutonomousLoopRunReceipt("/tmp", "../../escape")).toThrow(
      "invalid loop plan id",
    );
    expect(() => buildAutonomousLoopRunReceipt("/tmp", "PLAN-L7-431/../../escape")).toThrow(
      "invalid loop plan id",
    );
  });

  it("IT-DUR-002: classifies a legacy artifact as blocked rather than missing", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-loop-receipt-legacy-"));
    try {
      const legacy = join(root, ".helix", "state", "loop", "PLAN-L7-366.json");
      mkdirSync(join(root, ".helix", "state", "loop"), { recursive: true });
      writeFileSync(legacy, "{");
      const report = buildAutonomousLoopRunReceipt(root, "PLAN-L7-366");
      expect(report.status).toBe("blocked");
      expect(report.findings[0]?.code).toBe("receipt_legacy_state_unimported");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("surfaces restartable next action and iteration evidence", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-loop-receipt-"));
    try {
      const store = durableFileLoopStore({ root });
      await store.runSideEffect(
        {
          planId: "PLAN-L7-366",
          status: "running",
          iteration: 0,
          maxIterations: 3,
          lastVerdict: "pending",
          workerProvider: "codex",
          verifierProvider: null,
          blockedReason: null,
          windowOpensAt: "2026-07-09T09:00:00.000Z",
          windowClosesAt: "2026-07-09T11:00:00.000Z",
          costUsd: 0,
          updatedAt: "2026-07-09T10:00:00.000Z",
        },
        "worker",
        async () => null,
      );
      await store.runSideEffect(
        {
          planId: "PLAN-L7-366",
          status: "running",
          iteration: 0,
          maxIterations: 3,
          lastVerdict: "pending",
          workerProvider: "codex",
          verifierProvider: null,
          blockedReason: null,
          windowOpensAt: "2026-07-09T09:00:00.000Z",
          windowClosesAt: "2026-07-09T11:00:00.000Z",
          costUsd: 0,
          updatedAt: "2026-07-09T10:00:00.000Z",
        },
        "verifier",
        async () => "pending",
      );
      store.recordIteration({
        planId: "PLAN-L7-366",
        iteration: 0,
        workerProvider: "codex",
        verifierProvider: "claude",
        verdict: "pending",
        stopReason: null,
        blockedReason: null,
      });
      store.write({
        planId: "PLAN-L7-366",
        status: "running",
        iteration: 1,
        maxIterations: 3,
        lastVerdict: "pending",
        workerProvider: "codex",
        verifierProvider: "claude",
        blockedReason: null,
        windowOpensAt: "2026-07-09T09:00:00.000Z",
        windowClosesAt: "2026-07-09T11:00:00.000Z",
        costUsd: 0,
        updatedAt: "2026-07-09T10:00:00.000Z",
      });

      const report = buildAutonomousLoopRunReceipt(root, "PLAN-L7-366");

      expect(report.ok).toBe(true);
      expect(report.iteration_count).toBe(1);
      expect(report.stop_kind).toBe("running");
      expect(report.restartable_next_action).toBe("helix loop run --plan PLAN-L7-366 --once");
      expect(report.evidence_paths).toHaveLength(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-DUR-002: preserves corrupt epoch classification instead of reporting missing", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-loop-receipt-corrupt-"));
    try {
      const paths = loopEpochPaths(root, "PLAN-L7-366");
      const store = durableFileLoopStore({ root });
      store.write({
        planId: "PLAN-L7-366",
        status: "stopped",
        iteration: 0,
        maxIterations: 1,
        lastVerdict: "error",
        workerProvider: "codex",
        verifierProvider: null,
        blockedReason: "test",
        windowOpensAt: "2026-07-09T09:00:00.000Z",
        windowClosesAt: "2026-07-09T11:00:00.000Z",
        costUsd: 0,
        updatedAt: "2026-07-09T10:00:00.000Z",
      });
      writeFileSync(paths.manifest, "{");
      const report = buildAutonomousLoopRunReceipt(root, "PLAN-L7-366");
      expect(report.status).toBe("blocked");
      expect(report.findings[0]?.code).toBe("receipt_corrupt");
      expect(report.findings[0]?.code).not.toBe("receipt_missing");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-DUR-005: rejects a state commit whose verdict does not match its receipt", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-loop-receipt-mismatch-"));
    try {
      const store = durableFileLoopStore({ root });
      store.recordIteration({
        planId: "PLAN-L7-366",
        iteration: 0,
        workerProvider: "codex",
        verifierProvider: "claude",
        verdict: "fail",
        stopReason: null,
        blockedReason: null,
      });
      expect(() =>
        store.write({
          planId: "PLAN-L7-366",
          status: "running",
          iteration: 1,
          maxIterations: 3,
          lastVerdict: "pending",
          workerProvider: "codex",
          verifierProvider: "claude",
          blockedReason: null,
          windowOpensAt: "2026-07-09T09:00:00.000Z",
          windowClosesAt: "2026-07-09T11:00:00.000Z",
          costUsd: 0,
          updatedAt: "2026-07-09T10:00:00.000Z",
        }),
      ).toThrow("invalid initial loop state commit");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
