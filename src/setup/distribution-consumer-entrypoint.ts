#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dispatchLiteConsumerCommand } from "./distribution-consumer-command-composition";
import { runLiteConsumerHook } from "./distribution-consumer-hook-adapter";
import {
  createLiteConsumerNodeHandlers,
  nodeLiteConsumerAdapterDeps,
} from "./distribution-consumer-node-adapter";
import { createLiteConsumerServices } from "./distribution-consumer-services";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const consumerRoot = process.cwd();
const services = createLiteConsumerServices({
  consumer_root: consumerRoot,
  package_root: packageRoot,
});
const argv = process.argv.slice(2);
if (argv[0] === "hook") {
  const outcome = runLiteConsumerHook({
    hook_id: argv[1] ?? "",
    repo_root: consumerRoot,
    raw_input: readFileSync(0, "utf8"),
  });
  process.stdout.write(`${JSON.stringify(outcome.payload)}\n`);
  process.exitCode = outcome.exit_code;
} else {
  const result = await dispatchLiteConsumerCommand(
    argv,
    createLiteConsumerNodeHandlers(nodeLiteConsumerAdapterDeps(consumerRoot, services)),
  );

  if (!result.ok) {
    process.stderr.write(`${JSON.stringify(result.failure)}\n`);
    process.exitCode = 2;
  } else {
    process.stdout.write(result.execution.output);
    process.exitCode = result.execution.exit_code;
  }
}
