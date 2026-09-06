import { spawn } from "node:child_process";

const POSIX_PROCESS_GROUP_PLATFORMS = new Set<NodeJS.Platform>([
  "aix",
  "darwin",
  "freebsd",
  "linux",
  "openbsd",
  "sunos",
]);
const TERMINATION_GRACE_MS = 100;
const REAP_CONFIRMATION_MS = 2_000;
const REAP_POLL_MS = 5;
const FORWARDED_SIGNALS = ["SIGINT", "SIGTERM", "SIGHUP"] as const;

export interface ProviderProcessLaunch {
  readonly command: string;
  readonly args: readonly string[];
  readonly stdin?: string;
  readonly cwd?: string;
  readonly env: NodeJS.ProcessEnv;
  readonly shell: boolean;
  readonly windowsVerbatimArguments: boolean;
  readonly timeMs: number;
  readonly stdout?: "capture" | "inherit" | 2;
  readonly stderr?: "capture" | "inherit";
}

export type ProviderProcessTerminationStage = "none" | "term_sent" | "kill_sent";

export interface ProviderProcessLifecycleOutcome {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly timed_out: boolean;
  readonly tree_lingered: boolean;
  readonly interrupted_by: NodeJS.Signals | null;
  readonly deadline_ms: number;
  readonly termination_stage: ProviderProcessTerminationStage;
  readonly signal: NodeJS.Signals | null;
  readonly duration_ms: number;
  readonly reaped: boolean;
  readonly error?: unknown;
}

interface ChildClose {
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
}

interface ChildState {
  close?: ChildClose;
  error?: unknown;
}

export function assertProviderProcessLifecycleSupported(
  platform: NodeJS.Platform = process.platform,
): void {
  if (!POSIX_PROCESS_GROUP_PLATFORMS.has(platform)) {
    throw new Error(`provider_process_tree_termination_unsupported:${platform}`);
  }
}

function assertDeadline(timeMs: number): void {
  if (!Number.isSafeInteger(timeMs) || timeMs <= 0) {
    throw new TypeError("provider process timeMs must be a positive safe integer");
  }
}

function elapsedMilliseconds(startedAt: bigint): number {
  return Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
}

function deadlineFromNow(milliseconds: number): bigint {
  return process.hrtime.bigint() + BigInt(milliseconds) * 1_000_000n;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function processGroupAlive(processGroupId: number): boolean {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

function childAndProcessGroupReaped(
  state: ChildState,
  processGroupId: number | undefined,
): boolean {
  if (state.close === undefined) return false;
  return processGroupId === undefined || !processGroupAlive(processGroupId);
}

async function waitUntilReaped(
  state: ChildState,
  processGroupId: number | undefined,
  deadline: bigint,
): Promise<boolean> {
  while (!childAndProcessGroupReaped(state, processGroupId)) {
    const remainingNanoseconds = deadline - process.hrtime.bigint();
    if (remainingNanoseconds <= 0n) return false;
    const remainingMilliseconds = Number(remainingNanoseconds / 1_000_000n);
    await delay(Math.max(1, Math.min(REAP_POLL_MS, remainingMilliseconds)));
  }
  return true;
}

function signalProcessGroup(processGroupId: number | undefined, signal: NodeJS.Signals): unknown {
  if (processGroupId === undefined) {
    return new Error(`provider_process_group_unavailable:${signal}`);
  }
  try {
    process.kill(-processGroupId, signal);
    return undefined;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return undefined;
    return error;
  }
}

function combineErrors(current: unknown, next: unknown): unknown {
  if (current === undefined) return next;
  if (next === undefined) return current;
  return new AggregateError([current, next], "provider_process_lifecycle_failed");
}

/**
 * Runs one provider invocation in a dedicated POSIX process group. The returned promise does not
 * settle until the direct child emitted `close` and the process group no longer exists. Windows is
 * rejected before spawn because killing only the direct child would leave an unbounded tree alive.
 */
export async function runBudgetedProviderProcess(
  launch: ProviderProcessLaunch,
): Promise<ProviderProcessLifecycleOutcome> {
  assertDeadline(launch.timeMs);
  const startedAt = process.hrtime.bigint();
  try {
    assertProviderProcessLifecycleSupported();
  } catch (error) {
    return {
      status: null,
      stdout: "",
      stderr: "",
      timed_out: false,
      tree_lingered: false,
      interrupted_by: null,
      deadline_ms: launch.timeMs,
      termination_stage: "none",
      signal: null,
      duration_ms: elapsedMilliseconds(startedAt),
      reaped: true,
      error,
    };
  }
  const executionDeadline = startedAt + BigInt(launch.timeMs) * 1_000_000n;
  let stdout = "";
  let stderr = "";
  const state: ChildState = {};
  let child: ReturnType<typeof spawn>;

  try {
    const stdoutMode = launch.stdout ?? "capture";
    const stderrMode = launch.stderr ?? "capture";
    child = spawn(launch.command, [...launch.args], {
      cwd: launch.cwd,
      env: launch.env,
      shell: launch.shell,
      windowsVerbatimArguments: launch.windowsVerbatimArguments,
      windowsHide: true,
      detached: true,
      stdio: [
        "pipe",
        stdoutMode === "capture" ? "pipe" : stdoutMode,
        stderrMode === "capture" ? "pipe" : "inherit",
      ],
    });
  } catch (error) {
    return {
      status: null,
      stdout,
      stderr,
      timed_out: false,
      tree_lingered: false,
      interrupted_by: null,
      deadline_ms: launch.timeMs,
      termination_stage: "none",
      signal: null,
      duration_ms: elapsedMilliseconds(startedAt),
      reaped: true,
      error,
    };
  }

  const processGroupId = child.pid;
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr?.on("data", (chunk: string) => {
    stderr += chunk;
  });
  child.once("error", (error) => {
    state.error = combineErrors(state.error, error);
  });
  child.once("close", (status, signal) => {
    state.close = { status, signal };
  });
  child.stdin?.on("error", () => undefined);
  child.stdin?.end(launch.stdin);

  let resolveInterruption: ((signal: NodeJS.Signals) => void) | undefined;
  const interruption = new Promise<NodeJS.Signals>((resolve) => {
    resolveInterruption = resolve;
  });
  const signalHandlers = new Map<NodeJS.Signals, () => void>();
  for (const signal of FORWARDED_SIGNALS) {
    const handler = () => resolveInterruption?.(signal);
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }
  const exitHandler = () => {
    signalProcessGroup(processGroupId, "SIGKILL");
  };
  process.once("exit", exitHandler);
  const removeLifecycleHandlers = () => {
    for (const [signal, handler] of signalHandlers) process.off(signal, handler);
    process.off("exit", exitHandler);
    resolveInterruption = undefined;
  };

  const firstBoundary = await Promise.race([
    waitUntilReaped(state, undefined, executionDeadline).then((closed) =>
      closed ? ({ kind: "child_closed" } as const) : ({ kind: "deadline" } as const),
    ),
    interruption.then((signal) => ({ kind: "interrupted", signal }) as const),
  ]);

  if (firstBoundary.kind === "child_closed") {
    const reaped = await waitUntilReaped(
      state,
      processGroupId,
      deadlineFromNow(TERMINATION_GRACE_MS),
    );
    if (!reaped) {
      state.error = combineErrors(state.error, signalProcessGroup(processGroupId, "SIGTERM"));
    } else {
      removeLifecycleHandlers();
      return {
        status: state.close?.status ?? null,
        stdout,
        stderr,
        timed_out: false,
        tree_lingered: false,
        interrupted_by: null,
        deadline_ms: launch.timeMs,
        termination_stage: "none",
        signal: state.close?.signal ?? null,
        duration_ms: elapsedMilliseconds(startedAt),
        reaped: true,
        ...(state.error === undefined ? {} : { error: state.error }),
      };
    }
  }

  const treeLingered = firstBoundary.kind === "child_closed";
  if (firstBoundary.kind === "child_closed") {
    let terminationStage: ProviderProcessTerminationStage = "term_sent";
    let reaped = await waitUntilReaped(state, processGroupId, deadlineFromNow(TERMINATION_GRACE_MS));
    if (!reaped && processGroupId !== undefined && processGroupAlive(processGroupId)) {
      terminationStage = "kill_sent";
      state.error = combineErrors(state.error, signalProcessGroup(processGroupId, "SIGKILL"));
    }
    if (!reaped) {
      reaped = await waitUntilReaped(state, processGroupId, deadlineFromNow(REAP_CONFIRMATION_MS));
    }
    if (!reaped) {
      state.error = combineErrors(state.error, new Error("provider_process_tree_reap_timeout"));
    }
    removeLifecycleHandlers();
    return {
      status: state.close?.status ?? null,
      stdout,
      stderr,
      timed_out: false,
      tree_lingered: true,
      interrupted_by: null,
      deadline_ms: launch.timeMs,
      termination_stage: terminationStage,
      signal: state.close?.signal ?? null,
      duration_ms: elapsedMilliseconds(startedAt),
      reaped,
      ...(state.error === undefined ? {} : { error: state.error }),
    };
  }

  let terminationStage: ProviderProcessTerminationStage = "term_sent";
  state.error = combineErrors(state.error, signalProcessGroup(processGroupId, "SIGTERM"));
  let reaped = await waitUntilReaped(state, processGroupId, deadlineFromNow(TERMINATION_GRACE_MS));

  if (!reaped && processGroupId !== undefined && processGroupAlive(processGroupId)) {
    terminationStage = "kill_sent";
    state.error = combineErrors(state.error, signalProcessGroup(processGroupId, "SIGKILL"));
  }
  if (!reaped) {
    reaped = await waitUntilReaped(state, processGroupId, deadlineFromNow(REAP_CONFIRMATION_MS));
  }
  if (!reaped) {
    state.error = combineErrors(state.error, new Error("provider_process_tree_reap_timeout"));
  }
  removeLifecycleHandlers();

  return {
    status: state.close?.status ?? null,
    stdout,
    stderr,
    timed_out: firstBoundary.kind === "deadline",
    tree_lingered: treeLingered,
    interrupted_by: firstBoundary.kind === "interrupted" ? firstBoundary.signal : null,
    deadline_ms: launch.timeMs,
    termination_stage: terminationStage,
    signal: state.close?.signal ?? null,
    duration_ms: elapsedMilliseconds(startedAt),
    reaped,
    ...(state.error === undefined ? {} : { error: state.error }),
  };
}
