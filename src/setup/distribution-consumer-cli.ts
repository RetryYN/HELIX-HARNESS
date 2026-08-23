#!/usr/bin/env node
import type { LiteConsumerCommandHandlers } from "./distribution-consumer-command-composition";
import { dispatchLiteConsumerCommand } from "./distribution-consumer-command-composition";
import {
  createLiteConsumerNodeHandlers,
  nodeLiteConsumerAdapterDeps,
} from "./distribution-consumer-node-adapter";
import { createLiteConsumerServices } from "./distribution-lite-consumer-services";

declare const __HELIX_LITE_VERSION__: string;
declare const __HELIX_LITE_EXECUTABLE__: boolean;

export interface LiteConsumerCliIo {
  stdout(text: string): void;
  stderr(text: string): void;
}

const DEFAULT_IO: LiteConsumerCliIo = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
};

export async function runLiteConsumerCli(
  argv: readonly string[],
  handlers: LiteConsumerCommandHandlers | null,
  io: LiteConsumerCliIo = DEFAULT_IO,
): Promise<number> {
  if (argv.length === 1 && (argv[0] === "--version" || argv[0] === "-V")) {
    io.stdout(`${__HELIX_LITE_VERSION__}\n`);
    return 0;
  }
  if (argv.length === 0 || (argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h"))) {
    io.stdout(
      [
        "Usage: helix <command>",
        "",
        "HELIX-HARNESS-LITE consumer entrypoint",
        "Run `helix --version` to inspect the installed package identity.",
        "",
      ].join("\n"),
    );
    return 0;
  }
  if (handlers === null) {
    io.stderr("lite_consumer_services_not_bound\n");
    return 1;
  }
  const result = await dispatchLiteConsumerCommand(argv, handlers);
  if (!result.ok) {
    io.stderr(`${result.failure.code}${result.failure.token ? `:${result.failure.token}` : ""}\n`);
    return 1;
  }
  io.stdout(result.execution.output);
  return result.execution.exit_code;
}

if (typeof __HELIX_LITE_EXECUTABLE__ !== "undefined" && __HELIX_LITE_EXECUTABLE__) {
  const services = createLiteConsumerServices(process.cwd());
  const handlers = createLiteConsumerNodeHandlers(
    nodeLiteConsumerAdapterDeps(process.cwd(), services),
  );
  process.exitCode = await runLiteConsumerCli(process.argv.slice(2), handlers);
}
