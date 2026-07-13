import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import type { ProbeIntent, ProbePort } from "./lint-effect-executor";

const DEFAULT_TIMEOUT_CEILING_MS = 30_000;
const DEFAULT_OUTPUT_LIMIT_BYTES = 64 * 1024;
const MAX_ARGUMENTS = 128;
const MAX_ARGUMENT_BYTES = 8 * 1024;

type SpawnRunner = (
  command: string,
  args: readonly string[],
  options: Parameters<typeof spawnSync>[2],
) => SpawnSyncReturns<string>;

export interface LintProbeAdapterOptions {
  /** Fixed execution directory; ProbeIntent cannot select it. */
  cwd: string;
  timeoutCeilingMs?: number;
  outputLimitBytes?: number;
  env?: Readonly<Record<string, string | undefined>>;
  /** Test seam. Production uses node:child_process spawnSync. */
  spawn?: SpawnRunner;
}

function safeEnvironment(
  extra: Readonly<Record<string, string | undefined>> = {},
): NodeJS.ProcessEnv {
  const allowlisted = ["PATH", "SystemRoot", "ComSpec", "PATHEXT", "TEMP", "TMP", "TMPDIR"];
  const env: NodeJS.ProcessEnv = {};
  for (const name of allowlisted) {
    const value = extra[name] ?? process.env[name];
    if (value !== undefined) env[name] = value;
  }
  return env;
}

function validate(intent: ProbeIntent, timeoutCeilingMs: number): void {
  if (!intent.command || intent.command.includes("\0")) throw new Error("invalid_probe_command");
  if (
    !Number.isSafeInteger(intent.timeoutMs) ||
    intent.timeoutMs < 1 ||
    intent.timeoutMs > timeoutCeilingMs
  )
    throw new Error("invalid_probe_timeout");
  if (intent.args.length > MAX_ARGUMENTS) throw new Error("probe_argument_count_exceeded");
  if (intent.args.some((argument) => Buffer.byteLength(argument, "utf8") > MAX_ARGUMENT_BYTES))
    throw new Error("probe_argument_size_exceeded");
}

function text(value: string | Buffer | null | undefined): string {
  return typeof value === "string" ? value : (value?.toString("utf8") ?? "");
}

/** Creates the only Node child-process adapter for lint effect probes. */
export function createLintProbePort(options: LintProbeAdapterOptions): ProbePort {
  const timeoutCeilingMs = options.timeoutCeilingMs ?? DEFAULT_TIMEOUT_CEILING_MS;
  const outputLimitBytes = options.outputLimitBytes ?? DEFAULT_OUTPUT_LIMIT_BYTES;
  if (!Number.isSafeInteger(timeoutCeilingMs) || timeoutCeilingMs < 1)
    throw new Error("invalid_probe_timeout_ceiling");
  if (!Number.isSafeInteger(outputLimitBytes) || outputLimitBytes < 1)
    throw new Error("invalid_probe_output_limit");
  const runner = options.spawn ?? spawnSync;
  const env = safeEnvironment(options.env);

  return {
    execute(intent) {
      validate(intent, timeoutCeilingMs);
      const result = runner(intent.command, intent.args, {
        cwd: options.cwd,
        encoding: "utf8",
        env,
        shell: false,
        timeout: intent.timeoutMs,
        maxBuffer: outputLimitBytes,
        windowsHide: true,
        windowsVerbatimArguments: false,
      });
      return {
        exitCode: result.status,
        timedOut: result.error?.code === "ETIMEDOUT" || result.signal === "SIGTERM",
        stdout: text(result.stdout),
        stderr: text(result.stderr),
        binaryVersion: "",
      };
    },
  };
}
