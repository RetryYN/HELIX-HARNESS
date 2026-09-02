import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  createFullRegressionShardPlan,
  FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
  type FullRegressionShardPlan,
  type FullRegressionShardReceipt,
  validateFullRegressionShardPlan,
  validateFullRegressionShardReceipts,
} from "../src/runtime/full-regression-shards";

// PLAN-L7-684-full-regression-shard-contract — U-FULLSHARD-001..006

const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);
const INVENTORY = [
  "tests/alpha.test.ts",
  "tests/bravo.test.ts",
  "tests/charlie.test.ts",
  "tests/delta.test.ts",
  "tests/echo.test.ts",
  "tests/cli-surface.test.ts",
  "tests/slow/acceptance.test.ts",
];

function plan(): FullRegressionShardPlan {
  return createFullRegressionShardPlan({
    candidateHead: HEAD,
    baseSha: BASE,
    testFiles: INVENTORY,
  });
}

function receipts(value: FullRegressionShardPlan): FullRegressionShardReceipt[] {
  return value.shards.map((shard) => ({
    schema_version: FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
    candidate_head: value.candidate_head,
    base_sha: value.base_sha,
    partition_digest: value.partition_digest,
    shard_id: shard.shard_id,
    files_digest: shard.files_digest,
    exit_code: 0,
    output_digest: sha256Digest(`output:${shard.shard_id}`),
    started_at: "2026-08-27T00:00:00Z",
    completed_at: "2026-08-27T00:01:00Z",
  }));
}

describe("Full regression exact shard contract", () => {
  it("U-FULLSHARD-001: 入力順に依存せずbulk 3件とstatefulへexact partitionする", () => {
    const first = plan();
    const reversed = createFullRegressionShardPlan({
      candidateHead: HEAD,
      baseSha: BASE,
      testFiles: [...INVENTORY].reverse(),
    });

    expect(reversed).toEqual(first);
    expect(first.shards.map((shard) => shard.shard_id)).toEqual([
      "bulk-1",
      "bulk-2",
      "bulk-3",
      "stateful",
    ]);
    expect(first.shards.at(-1)?.files).toEqual([
      "tests/cli-surface.test.ts",
      "tests/slow/acceptance.test.ts",
    ]);
    expect(validateFullRegressionShardPlan(first, INVENTORY)).toEqual({ ok: true, errors: [] });
  });

  it("U-FULLSHARD-002: inventoryの欠落／重複／余剰をfail-closeする", () => {
    const value = plan();
    const missing = structuredClone(value);
    missing.shards[0].files = missing.shards[0].files.slice(1);
    expect(validateFullRegressionShardPlan(missing, INVENTORY).errors).toContain(
      "inventory_partition_mismatch",
    );

    const duplicate = structuredClone(value);
    duplicate.shards[0].files = [...duplicate.shards[0].files, duplicate.shards[1].files[0]];
    expect(validateFullRegressionShardPlan(duplicate, INVENTORY).errors).toContain(
      "duplicate_test_path",
    );

    expect(
      validateFullRegressionShardPlan(value, [...INVENTORY, "tests/extra.test.ts"]).errors,
    ).toContain("inventory_partition_mismatch");

    const extraShard = {
      ...value,
      shards: [
        ...value.shards,
        {
          shard_id: "bulk-4",
          kind: "bulk" as const,
          files: [],
          files_digest: sha256Digest("[]"),
        },
      ],
    };
    expect(validateFullRegressionShardPlan(extraShard, INVENTORY).errors).toContain(
      "shard_id_set_mismatch",
    );

    const wrongKind = structuredClone(value);
    wrongKind.shards[0].kind = "stateful";
    expect(validateFullRegressionShardPlan(wrongKind, INVENTORY).errors).toContain(
      `shard_kind_mismatch:${wrongKind.shards[0].shard_id}`,
    );
  });

  it("U-FULLSHARD-003: partition／file digest改竄を個別拒否する", () => {
    const value = plan();
    const partitionMutation = { ...value, partition_digest: sha256Digest("forged") };
    expect(validateFullRegressionShardPlan(partitionMutation, INVENTORY).errors).toContain(
      "partition_digest_mismatch",
    );

    const fileMutation = structuredClone(value);
    fileMutation.shards[0].files_digest = sha256Digest("forged");
    expect(validateFullRegressionShardPlan(fileMutation, INVENTORY).errors).toContain(
      `files_digest_mismatch:${fileMutation.shards[0].shard_id}`,
    );
  });

  it("U-FULLSHARD-004: stateful pathのbulk混入とcli-surface欠落を拒否する", () => {
    const value = plan();
    const bulkMutation = structuredClone(value);
    bulkMutation.shards[0].files = [
      ...bulkMutation.shards[0].files,
      "tests/slow/acceptance.test.ts",
    ];
    expect(validateFullRegressionShardPlan(bulkMutation, INVENTORY).errors).toContain(
      `bulk_contains_stateful_path:${bulkMutation.shards[0].shard_id}`,
    );

    const statefulMutation = {
      ...value,
      shards: value.shards.map((shard) =>
        shard.shard_id === "stateful" ? { ...shard, files: shard.files.slice(1) } : shard,
      ),
    };
    expect(validateFullRegressionShardPlan(statefulMutation, INVENTORY).errors).toContain(
      "stateful_contract_mismatch",
    );
  });

  it("U-FULLSHARD-005: receipt exact setとHEAD／base／partition／filesを照合する", () => {
    const value = plan();
    expect(validateFullRegressionShardReceipts(value, receipts(value))).toEqual({
      ok: true,
      errors: [],
    });
    const mutations = [
      ["candidate_head", "receipt_head_mismatch"],
      ["base_sha", "receipt_base_mismatch"],
      ["partition_digest", "receipt_partition_mismatch"],
      ["files_digest", "receipt_files_mismatch"],
    ] as const;
    for (const [field, reason] of mutations) {
      const changed = receipts(value);
      changed[0] = { ...changed[0], [field]: sha256Digest(`wrong:${field}`) };
      expect(validateFullRegressionShardReceipts(value, changed).errors).toContain(
        `${reason}:${changed[0].shard_id}`,
      );
    }
  });

  it("U-FULLSHARD-006: shard欠落／重複／nonzero／時刻逆転を相殺しない", () => {
    const value = plan();
    const valid = receipts(value);
    expect(validateFullRegressionShardReceipts(value, valid.slice(1)).errors).toContain(
      "receipt_shard_set_mismatch",
    );
    expect(validateFullRegressionShardReceipts(value, [...valid, valid[0]]).errors).toContain(
      "duplicate_receipt_shard_id",
    );
    expect(
      validateFullRegressionShardReceipts(value, [{ ...valid[0], exit_code: 1 }, ...valid.slice(1)])
        .errors,
    ).toContain(`receipt_nonzero_exit:${valid[0].shard_id}`);
    expect(
      validateFullRegressionShardReceipts(value, [
        { ...valid[0], completed_at: "2025-08-27T00:00:00Z" },
        ...valid.slice(1),
      ]).errors,
    ).toContain(`receipt_time_order_invalid:${valid[0].shard_id}`);
    expect(
      validateFullRegressionShardReceipts(value, [
        { ...valid[0], output_digest: "invalid" as `sha256:${string}` },
        ...valid.slice(1),
      ]).errors,
    ).toContain(`receipt_output_digest_invalid:${valid[0].shard_id}`);
  });
});
