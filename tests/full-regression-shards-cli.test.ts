import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runFullRegressionShardCommand } from "../src/cli/full-regression-shards";
import { sha256Digest } from "../src/runtime/digest";
import {
  FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
  type FullRegressionShardPlan,
} from "../src/runtime/full-regression-shards";

// PLAN-L7-685-full-regression-shard-jobs — U-FULLSHARD-CLI-001..003

const roots: string[] = [];
const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);

function fixture(): { root: string; inventoryPath: string; planPath: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-full-shard-cli-"));
  roots.push(root);
  const inventoryPath = join(root, "inventory.json");
  const planPath = join(root, "plan.json");
  writeFileSync(
    inventoryPath,
    JSON.stringify([
      "tests/a.test.ts",
      "tests/b.test.ts",
      "tests/c.test.ts",
      "tests/d.test.ts",
      "tests/cli-surface.test.ts",
      "tests/slow/a.test.ts",
    ]),
  );
  return { root, inventoryPath, planPath };
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop() as string, { recursive: true, force: true });
});

describe("Full regression shard CLI adapter", () => {
  it("U-FULLSHARD-CLI-001: inventory JSONからtyped planとshard file exact setを返す", () => {
    const value = fixture();
    const plan = runFullRegressionShardCommand([
      "plan",
      "--candidate-head",
      HEAD,
      "--base-sha",
      BASE,
      "--inventory-file",
      value.inventoryPath,
    ]) as FullRegressionShardPlan;
    writeFileSync(value.planPath, JSON.stringify(plan));
    expect(
      runFullRegressionShardCommand([
        "files",
        "--plan-file",
        value.planPath,
        "--shard-id",
        "stateful",
      ]),
    ).toEqual(["tests/cli-surface.test.ts", "tests/slow/a.test.ts"]);
  });

  it("U-FULLSHARD-CLI-002: receiptをplan identityからだけ生成しunknown shardを拒否する", () => {
    const value = fixture();
    const plan = runFullRegressionShardCommand([
      "plan",
      "--candidate-head",
      HEAD,
      "--base-sha",
      BASE,
      "--inventory-file",
      value.inventoryPath,
    ]) as FullRegressionShardPlan;
    writeFileSync(value.planPath, JSON.stringify(plan));
    expect(
      runFullRegressionShardCommand([
        "receipt",
        "--plan-file",
        value.planPath,
        "--shard-id",
        "bulk-1",
        "--exit-code",
        "0",
        "--output-digest",
        sha256Digest("output"),
        "--started-at",
        "2026-08-27T00:00:00Z",
        "--completed-at",
        "2026-08-27T00:01:00Z",
      ]),
    ).toMatchObject({
      schema_version: FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
      candidate_head: HEAD,
      base_sha: BASE,
      shard_id: "bulk-1",
    });
    expect(() =>
      runFullRegressionShardCommand([
        "files",
        "--plan-file",
        value.planPath,
        "--shard-id",
        "unknown",
      ]),
    ).toThrow("unknown_shard:unknown");
  });

  it("U-FULLSHARD-CLI-003: validatorはreceipt exact set欠落をexit対象のtyped redにする", () => {
    const value = fixture();
    mkdirSync(join(value.root, "receipts"));
    const plan = runFullRegressionShardCommand([
      "plan",
      "--candidate-head",
      HEAD,
      "--base-sha",
      BASE,
      "--inventory-file",
      value.inventoryPath,
    ]) as FullRegressionShardPlan;
    writeFileSync(value.planPath, JSON.stringify(plan));
    expect(
      runFullRegressionShardCommand([
        "validate",
        "--plan-file",
        value.planPath,
        "--inventory-file",
        value.inventoryPath,
      ]),
    ).toMatchObject({ ok: false, receipt_errors: ["receipt_shard_set_mismatch"] });
  });

  it("U-FULLSHARD-CLI-004: receipt境界はdigest、exit code、時刻をfail-closeする", () => {
    const value = fixture();
    const plan = runFullRegressionShardCommand([
      "plan",
      "--candidate-head",
      HEAD,
      "--base-sha",
      BASE,
      "--inventory-file",
      value.inventoryPath,
    ]) as FullRegressionShardPlan;
    writeFileSync(value.planPath, JSON.stringify(plan));
    const receiptArgs = [
      "receipt",
      "--plan-file",
      value.planPath,
      "--shard-id",
      "bulk-1",
      "--exit-code",
      "0",
      "--output-digest",
      sha256Digest("output"),
      "--started-at",
      "2026-08-27T00:00:00Z",
      "--completed-at",
      "2026-08-27T00:01:00Z",
    ];
    expect(() =>
      runFullRegressionShardCommand(
        receiptArgs.map((value) => (value === sha256Digest("output") ? "not-a-digest" : value)),
      ),
    ).toThrow("output_digest_invalid");
    expect(() =>
      runFullRegressionShardCommand(
        receiptArgs.map((value, index) =>
          receiptArgs[index - 1] === "--exit-code" ? "-1" : value,
        ),
      ),
    ).toThrow("exit_code_invalid");
    expect(() =>
      runFullRegressionShardCommand(
        receiptArgs.map((value, index) =>
          receiptArgs[index - 1] === "--completed-at" ? "2026-08-26T23:59:00Z" : value,
        ),
      ),
    ).toThrow("receipt_time_order_invalid");
  });
});
