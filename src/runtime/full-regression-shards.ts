import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";

export const FULL_REGRESSION_SHARD_SCHEMA = "helix-full-regression-shards.v1" as const;
export const FULL_REGRESSION_SHARD_RECEIPT_SCHEMA =
  "helix-full-regression-shard-receipt.v1" as const;

export type FullRegressionShardKind = "bulk" | "stateful";

export interface FullRegressionShard {
  shard_id: string;
  kind: FullRegressionShardKind;
  files: readonly string[];
  files_digest: Sha256Digest;
}

export interface FullRegressionShardPlan {
  schema_version: typeof FULL_REGRESSION_SHARD_SCHEMA;
  candidate_head: string;
  base_sha: string;
  inventory_digest: Sha256Digest;
  partition_digest: Sha256Digest;
  shards: readonly FullRegressionShard[];
}

export interface FullRegressionShardReceipt {
  schema_version: typeof FULL_REGRESSION_SHARD_RECEIPT_SCHEMA;
  candidate_head: string;
  base_sha: string;
  partition_digest: Sha256Digest;
  shard_id: string;
  files_digest: Sha256Digest;
  exit_code: number;
  output_digest: Sha256Digest;
  started_at: string;
  completed_at: string;
}

export interface FullRegressionShardPlanInput {
  candidateHead: string;
  baseSha: string;
  testFiles: readonly string[];
  bulkShardCount?: 2;
}

export interface FullRegressionShardValidation {
  ok: boolean;
  errors: readonly string[];
}

interface PartitionDigestInput {
  candidateHead: string;
  baseSha: string;
  inventoryDigest: Sha256Digest;
  shards: readonly FullRegressionShard[];
}

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const TEST_PATH_PATTERN = /^tests\/(?:.+\/)?[^/]+\.test\.ts$/;
const CLI_SURFACE_PATH = "tests/cli-surface.test.ts";
const EXPECTED_SHARD_IDS = ["bulk-1", "bulk-2", "stateful"] as const;

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareBytewise);
}

function filesDigest(files: readonly string[]): Sha256Digest {
  return sha256Digest(canonicalJson([...files]));
}

function stableShardIndex(path: string, count: number): number {
  const digest = sha256Digest(path).slice("sha256:".length);
  return Number(BigInt(`0x${digest.slice(0, 13)}`) % BigInt(count));
}

function partitionDigest(input: PartitionDigestInput): Sha256Digest {
  return sha256Digest(
    canonicalJson({
      schema_version: FULL_REGRESSION_SHARD_SCHEMA,
      candidate_head: input.candidateHead,
      base_sha: input.baseSha,
      inventory_digest: input.inventoryDigest,
      shards: input.shards,
    }),
  );
}

export function createFullRegressionShardPlan(
  input: FullRegressionShardPlanInput,
): FullRegressionShardPlan {
  const bulkShardCount = input.bulkShardCount ?? 2;
  if (bulkShardCount !== 2) {
    throw new Error("invalid_bulk_shard_count");
  }
  if (!SHA_PATTERN.test(input.candidateHead)) throw new Error("invalid_candidate_head");
  if (!SHA_PATTERN.test(input.baseSha)) throw new Error("invalid_base_sha");

  const inventory = sortedUnique(input.testFiles);
  if (inventory.length !== input.testFiles.length) throw new Error("duplicate_inventory_path");
  if (inventory.length === 0) throw new Error("empty_test_inventory");
  if (inventory.some((path) => !TEST_PATH_PATTERN.test(path))) {
    throw new Error("invalid_test_inventory_path");
  }
  if (!inventory.includes(CLI_SURFACE_PATH)) throw new Error("cli_surface_missing");

  const stateful = inventory.filter(
    (path) => path === CLI_SURFACE_PATH || path.startsWith("tests/slow/"),
  );
  const bulkFiles = inventory.filter(
    (path) => path !== CLI_SURFACE_PATH && !path.startsWith("tests/slow/"),
  );
  const bulkBuckets = Array.from({ length: bulkShardCount }, () => [] as string[]);
  for (const path of bulkFiles) bulkBuckets[stableShardIndex(path, bulkShardCount)].push(path);

  const shards: FullRegressionShard[] = [
    ...bulkBuckets.map((files, index) => {
      const sortedFiles = files.sort(compareBytewise);
      if (sortedFiles.length === 0) throw new Error(`empty_bulk_shard:bulk-${index + 1}`);
      return {
        shard_id: `bulk-${index + 1}`,
        kind: "bulk" as const,
        files: sortedFiles,
        files_digest: filesDigest(sortedFiles),
      };
    }),
    {
      shard_id: "stateful",
      kind: "stateful",
      files: stateful,
      files_digest: filesDigest(stateful),
    },
  ];
  const inventoryDigest = filesDigest(inventory);

  return {
    schema_version: FULL_REGRESSION_SHARD_SCHEMA,
    candidate_head: input.candidateHead,
    base_sha: input.baseSha,
    inventory_digest: inventoryDigest,
    partition_digest: partitionDigest({
      candidateHead: input.candidateHead,
      baseSha: input.baseSha,
      inventoryDigest,
      shards,
    }),
    shards,
  };
}

export function validateFullRegressionShardPlan(
  plan: FullRegressionShardPlan,
  expectedInventory: readonly string[],
): FullRegressionShardValidation {
  const errors: string[] = [];
  const expected = sortedUnique(expectedInventory);
  const shardIds = plan.shards.map((shard) => shard.shard_id);
  const allFiles = plan.shards.flatMap((shard) => shard.files);
  const uniqueFiles = sortedUnique(allFiles);

  if (plan.schema_version !== FULL_REGRESSION_SHARD_SCHEMA) errors.push("schema_version_mismatch");
  if (expected.length !== expectedInventory.length) errors.push("expected_inventory_duplicate");
  if (expected.length === 0 || expected.some((path) => !TEST_PATH_PATTERN.test(path))) {
    errors.push("expected_inventory_invalid");
  }
  if (!SHA_PATTERN.test(plan.candidate_head)) errors.push("invalid_candidate_head");
  if (!SHA_PATTERN.test(plan.base_sha)) errors.push("invalid_base_sha");
  if (new Set(shardIds).size !== shardIds.length) errors.push("duplicate_shard_id");
  if (canonicalJson(sortedUnique(shardIds)) !== canonicalJson(sortedUnique(EXPECTED_SHARD_IDS))) {
    errors.push("shard_id_set_mismatch");
  }
  if (allFiles.length !== uniqueFiles.length) errors.push("duplicate_test_path");
  if (canonicalJson(uniqueFiles) !== canonicalJson(expected))
    errors.push("inventory_partition_mismatch");
  if (plan.inventory_digest !== filesDigest(expected)) errors.push("inventory_digest_mismatch");

  for (const shard of plan.shards) {
    if (
      (shard.shard_id === "stateful" && shard.kind !== "stateful") ||
      (shard.shard_id.startsWith("bulk-") && shard.kind !== "bulk")
    ) {
      errors.push(`shard_kind_mismatch:${shard.shard_id}`);
    }
    if (shard.files.length === 0) errors.push(`empty_shard:${shard.shard_id}`);
    if (canonicalJson(shard.files) !== canonicalJson(sortedUnique(shard.files))) {
      errors.push(`noncanonical_files:${shard.shard_id}`);
    }
    if (shard.files_digest !== filesDigest(shard.files)) {
      errors.push(`files_digest_mismatch:${shard.shard_id}`);
    }
    if (shard.kind === "stateful") {
      if (shard.shard_id !== "stateful" || !shard.files.includes(CLI_SURFACE_PATH)) {
        errors.push("stateful_contract_mismatch");
      }
      if (
        shard.files.some((path) => path !== CLI_SURFACE_PATH && !path.startsWith("tests/slow/"))
      ) {
        errors.push("stateful_contains_bulk_path");
      }
    } else if (
      shard.files.some((path) => path === CLI_SURFACE_PATH || path.startsWith("tests/slow/"))
    ) {
      errors.push(`bulk_contains_stateful_path:${shard.shard_id}`);
    }
  }

  if (
    plan.partition_digest !==
    partitionDigest({
      candidateHead: plan.candidate_head,
      baseSha: plan.base_sha,
      inventoryDigest: plan.inventory_digest,
      shards: plan.shards,
    })
  ) {
    errors.push("partition_digest_mismatch");
  }
  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

export function validateFullRegressionShardReceipts(
  plan: FullRegressionShardPlan,
  receipts: readonly FullRegressionShardReceipt[],
): FullRegressionShardValidation {
  const errors: string[] = [];
  const expectedById = new Map(plan.shards.map((shard) => [shard.shard_id, shard]));
  const receiptIds = receipts.map((receipt) => receipt.shard_id);
  if (new Set(receiptIds).size !== receiptIds.length) errors.push("duplicate_receipt_shard_id");
  if (
    canonicalJson(sortedUnique(receiptIds)) !==
    canonicalJson(sortedUnique([...expectedById.keys()]))
  ) {
    errors.push("receipt_shard_set_mismatch");
  }

  for (const receipt of receipts) {
    const expected = expectedById.get(receipt.shard_id);
    if (receipt.schema_version !== FULL_REGRESSION_SHARD_RECEIPT_SCHEMA) {
      errors.push(`receipt_schema_mismatch:${receipt.shard_id}`);
    }
    if (!expected) {
      errors.push(`unknown_receipt_shard:${receipt.shard_id}`);
      continue;
    }
    if (receipt.candidate_head !== plan.candidate_head) {
      errors.push(`receipt_head_mismatch:${receipt.shard_id}`);
    }
    if (receipt.base_sha !== plan.base_sha)
      errors.push(`receipt_base_mismatch:${receipt.shard_id}`);
    if (receipt.partition_digest !== plan.partition_digest) {
      errors.push(`receipt_partition_mismatch:${receipt.shard_id}`);
    }
    if (receipt.files_digest !== expected.files_digest) {
      errors.push(`receipt_files_mismatch:${receipt.shard_id}`);
    }
    if (!DIGEST_PATTERN.test(receipt.output_digest)) {
      errors.push(`receipt_output_digest_invalid:${receipt.shard_id}`);
    }
    if (receipt.exit_code !== 0) errors.push(`receipt_nonzero_exit:${receipt.shard_id}`);
    if (!Number.isFinite(Date.parse(receipt.started_at))) {
      errors.push(`receipt_started_at_invalid:${receipt.shard_id}`);
    }
    if (!Number.isFinite(Date.parse(receipt.completed_at))) {
      errors.push(`receipt_completed_at_invalid:${receipt.shard_id}`);
    } else if (Date.parse(receipt.completed_at) < Date.parse(receipt.started_at)) {
      errors.push(`receipt_time_order_invalid:${receipt.shard_id}`);
    }
  }
  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}
