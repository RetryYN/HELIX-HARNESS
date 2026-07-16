import { describe, expect, it } from "vitest";
import {
  evaluateNodeMinimum,
  type NodeMinimumInventoryV1,
  validateNodeLock,
  validateNodeRuntime,
} from "../src/runtime/node-runtime-cutover";

const D = "a".repeat(64);
const inventory: NodeMinimumInventoryV1 = {
  snapshot_digest: D,
  inventory_digest: "i".repeat(64),
  artifact_report_digest: "r".repeat(64),
  complete: true,
  stale: false,
  failures: [],
};
const runtime = validateNodeRuntime(
  {
    snapshot_digest: D,
    version: "24.15.0",
    lts: true,
    available_features: ["esm", "node:sqlite"],
  },
  {
    minimum_version: "24.15.0",
    maximum_exclusive_version: "25.0.0",
    required_features: ["node:sqlite", "esm"],
  },
);
const lock = validateNodeLock(
  {
    snapshot_digest: D,
    manifest_digest: "m".repeat(64),
    canonical_lock_path: "package-lock.json",
  },
  {
    path: "package-lock.json",
    digest: "l".repeat(64),
    manifest_digest: "m".repeat(64),
    canonical_lock_paths: ["package-lock.json"],
  },
  {
    tree_digest: "t".repeat(64),
    lock_digest: "l".repeat(64),
    frozen_install: true,
  },
);

describe("NodeMinimumGate U-NCUT-011", () => {
  it("全P0-P1 evidence greenでもterminal=falseのprovisional PASSだけを返す", () => {
    const receipt = evaluateNodeMinimum(
      inventory,
      runtime,
      lock,
      ["install", "typecheck", "test", "source-cli", "build", "sqlite"].map((workflow_id) => ({
        workflow_id,
        evidence_digest: `${workflow_id[0]}`.repeat(64),
        green: true,
        stale: false,
      })),
    );
    expect(receipt).toMatchObject({
      status: "pass",
      terminal: false,
      failures: [],
    });
    expect(receipt.required_workflow_ids).toEqual([
      "build",
      "install",
      "source-cli",
      "sqlite",
      "test",
      "typecheck",
    ]);
    expect(receipt.green_workflow_ids).toEqual(receipt.required_workflow_ids);
  });

  it("workflow欠落相当のred/staleとincomplete inventoryをfail-closeする", () => {
    expect(
      evaluateNodeMinimum(inventory, runtime, lock, [
        {
          workflow_id: "build",
          evidence_digest: D,
          green: false,
          stale: false,
        },
      ]),
    ).toMatchObject({
      status: "blocked",
      terminal: false,
    });
    expect(
      evaluateNodeMinimum(inventory, runtime, lock, [
        { workflow_id: "build", evidence_digest: D, green: true, stale: true },
      ]),
    ).toMatchObject({
      status: "stale",
      terminal: false,
    });
    expect(
      evaluateNodeMinimum({ ...inventory, complete: false }, runtime, lock, []).failures.map(
        (row) => row.code,
      ),
    ).toContain("HIL_NODE_CONTROL_PLANE_INVALID");
  });

  it("同一入力は時刻や実行順に依存せず同じreceipt digestになる", () => {
    const a = {
      workflow_id: "a",
      evidence_digest: D,
      green: true,
      stale: false,
    };
    const b = {
      workflow_id: "b",
      evidence_digest: "b".repeat(64),
      green: true,
      stale: false,
    };
    expect(evaluateNodeMinimum(inventory, runtime, lock, [a, b]).evidence_root_digest).toBe(
      evaluateNodeMinimum(inventory, runtime, lock, [b, a]).evidence_root_digest,
    );
  });
});
