import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  aggregatePreflightGates,
  aggregationFailCloseMessage,
  formatPreflightGateLine,
  type PreflightGateAggregationResult,
} from "../runtime/preflight-gate-aggregation";

function option(args: readonly string[], name: string): string {
  const index = args.indexOf(name);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`missing_option:${name}`);
  return value;
}

function optionalOption(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`missing_option:${name}`);
  return value;
}

export function runPreflightGateAggregationCommand(
  args: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): PreflightGateAggregationResult {
  const outputPath = option(args, "--output");
  const observedAt = optionalOption(args, "--observed-at") ?? new Date().toISOString();
  const result = aggregatePreflightGates({
    eventName: env.EVENT_NAME ?? "",
    headBranch: env.HEAD_BRANCH ?? "",
    baseBranch: env.BASE_BRANCH ?? "",
    observedAt,
    outcomes: env,
  });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

function main(): void {
  try {
    const result = runPreflightGateAggregationCommand(process.argv.slice(2));
    for (const gate of result.gates) {
      process.stdout.write(`${formatPreflightGateLine(gate)}\n`);
    }
    if (!result.ok) {
      process.stderr.write(`${aggregationFailCloseMessage(result)}\n`);
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
