import { describe, expect, it } from "vitest";
import { evaluateNodeMinimumProvisional } from "../src/runtime/node-minimum-provisional-evidence";

// PLAN-L7-458-node-minimum-provisional-evidence

const D = "a".repeat(64);
const binding = {
  authority_head: "b".repeat(40),
  node_version: "24.15.0",
  npm_version: "11.12.1",
  lock_digest: D,
  tree_digest: "b".repeat(64),
  sqlite_api: "node:sqlite",
  sqlite_version: "3.50.4",
  sqlite_compile_options_digest: "c".repeat(64),
  artifact_digest: "d".repeat(64),
};
const exact = ["build", "install", "source-cli", "sqlite", "test", "typecheck"].map(
  (workflow_id) => ({ workflow_id, evidence_digest: D, green: true }),
);

describe("Node Minimum provisional evidence", () => {
  it("U-NMIN-001: exact 6 workflowだけをterminal false PASSへ束縛する", () => {
    expect(evaluateNodeMinimumProvisional(binding, exact)).toMatchObject({
      status: "pass",
      terminal: false,
      failures: [],
    });
  });

  it("U-NMIN-002: P0-P1外workflowを分母へ混入させない", () => {
    const result = evaluateNodeMinimumProvisional(binding, [
      ...exact,
      { workflow_id: "cutover-activation", evidence_digest: D, green: true },
    ]);
    expect(result.status).toBe("blocked");
    expect(result.failures).toContain("HIL_NODE_WORKFLOW_SET_INVALID");
  });

  it("U-NMIN-003: workflow ID重複を拒否する", () => {
    const result = evaluateNodeMinimumProvisional(binding, [...exact, exact[0]]);
    expect(result.status).toBe("blocked");
    expect(result.failures).toContain("HIL_NODE_WORKFLOW_SET_INVALID");
  });

  it("U-NMIN-004: fixed authority bindingの変更をreceipt digestへ反映する", () => {
    const first = evaluateNodeMinimumProvisional(binding, exact);
    const drift = evaluateNodeMinimumProvisional(
      { ...binding, authority_head: "c".repeat(40) },
      exact,
    );
    expect(first.receipt_digest).not.toBe(drift.receipt_digest);
  });
});
