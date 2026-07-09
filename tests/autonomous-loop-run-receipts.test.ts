import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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

  it("surfaces restartable next action and iteration evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-loop-receipt-"));
    try {
      mkdirSync(join(root, ".helix", "state", "loop"), { recursive: true });
      writeFileSync(
        join(root, ".helix", "state", "loop", "PLAN-L7-366.json"),
        JSON.stringify({
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
      );
      writeFileSync(
        join(root, ".helix", "state", "loop", "PLAN-L7-366.iterations.jsonl"),
        `${JSON.stringify({ iteration: 1, verdict: "pending" })}\n`,
      );

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
});
