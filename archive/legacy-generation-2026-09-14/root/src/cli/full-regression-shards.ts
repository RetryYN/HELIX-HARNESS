import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { Sha256Digest } from "../runtime/digest";
import {
  createFullRegressionShardPlan,
  FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
  type FullRegressionShardPlan,
  type FullRegressionShardReceipt,
  validateFullRegressionShardPlan,
  validateFullRegressionShardReceipts,
} from "../runtime/full-regression-shards";

const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;

function option(args: readonly string[], name: string): string {
  const index = args.indexOf(name);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`missing_option:${name}`);
  return value;
}

function repeatedOption(args: readonly string[], name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name) values.push(option(args.slice(index), name));
  }
  return values;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function inventory(path: string): string[] {
  const value = readJson<unknown>(path);
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error("inventory_file_invalid");
  }
  return value as string[];
}

export function runFullRegressionShardCommand(args: readonly string[]): unknown {
  const command = args[0];
  if (command === "plan") {
    return createFullRegressionShardPlan({
      candidateHead: option(args, "--candidate-head"),
      baseSha: option(args, "--base-sha"),
      testFiles: inventory(option(args, "--inventory-file")),
    });
  }
  if (command === "files") {
    const plan = readJson<FullRegressionShardPlan>(option(args, "--plan-file"));
    const shardId = option(args, "--shard-id");
    const shard = plan.shards.find((entry) => entry.shard_id === shardId);
    if (!shard) throw new Error(`unknown_shard:${shardId}`);
    return shard.files;
  }
  if (command === "receipt") {
    const plan = readJson<FullRegressionShardPlan>(option(args, "--plan-file"));
    const shardId = option(args, "--shard-id");
    const shard = plan.shards.find((entry) => entry.shard_id === shardId);
    if (!shard) throw new Error(`unknown_shard:${shardId}`);
    const exitCode = Number(option(args, "--exit-code"));
    if (!Number.isSafeInteger(exitCode) || exitCode < 0) throw new Error("exit_code_invalid");
    const outputDigest = option(args, "--output-digest");
    if (!SHA256_DIGEST_PATTERN.test(outputDigest)) throw new Error("output_digest_invalid");
    const startedAt = option(args, "--started-at");
    const completedAt = option(args, "--completed-at");
    if (!Number.isFinite(Date.parse(startedAt))) throw new Error("started_at_invalid");
    if (!Number.isFinite(Date.parse(completedAt))) throw new Error("completed_at_invalid");
    if (Date.parse(completedAt) < Date.parse(startedAt))
      throw new Error("receipt_time_order_invalid");
    return {
      schema_version: FULL_REGRESSION_SHARD_RECEIPT_SCHEMA,
      candidate_head: plan.candidate_head,
      base_sha: plan.base_sha,
      partition_digest: plan.partition_digest,
      shard_id: shard.shard_id,
      files_digest: shard.files_digest,
      exit_code: exitCode,
      output_digest: outputDigest as Sha256Digest,
      started_at: startedAt,
      completed_at: completedAt,
    } satisfies FullRegressionShardReceipt;
  }
  if (command === "validate") {
    const plan = readJson<FullRegressionShardPlan>(option(args, "--plan-file"));
    const planResult = validateFullRegressionShardPlan(
      plan,
      inventory(option(args, "--inventory-file")),
    );
    const receipts = repeatedOption(args, "--receipt-file").map((path) =>
      readJson<FullRegressionShardReceipt>(path),
    );
    const receiptResult = validateFullRegressionShardReceipts(plan, receipts);
    return {
      ok: planResult.ok && receiptResult.ok,
      plan_errors: planResult.errors,
      receipt_errors: receiptResult.errors,
      partition_digest: plan.partition_digest,
    };
  }
  throw new Error(`unknown_command:${command ?? ""}`);
}

function main(): void {
  try {
    const result = runFullRegressionShardCommand(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (
      result &&
      typeof result === "object" &&
      "ok" in result &&
      (result as { ok?: unknown }).ok !== true
    ) {
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
