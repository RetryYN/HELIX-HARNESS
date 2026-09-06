import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertProviderProcessLifecycleSupported,
  type ProviderProcessLaunch,
  type ProviderProcessLifecycleOutcome,
  runBudgetedProviderProcess,
} from "../src/runtime/provider-process-lifecycle";

// PLAN-RECOVERY-1601-worker-deadline — U-WBL-001..004, U-WBL-006..008

const roots: string[] = [];
const pidFiles: string[] = [];

interface ProcessTreePids {
  readonly parent_pid: number;
  readonly child_pid: number;
}

function temporaryRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-provider-lifecycle-"));
  roots.push(root);
  return root;
}

function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

function readProcessTreePids(path: string): ProcessTreePids {
  return JSON.parse(readFileSync(path, "utf8")) as ProcessTreePids;
}

function killRecordedProcessGroups(): void {
  for (const path of pidFiles.splice(0)) {
    if (!existsSync(path)) continue;
    const pids = readProcessTreePids(path);
    try {
      process.kill(-pids.parent_pid, "SIGKILL");
    } catch {
      // The lifecycle helper normally removed the process group before test cleanup.
    }
  }
}

afterEach(() => {
  killRecordedProcessGroups();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function baseLaunch(timeMs: number): ProviderProcessLaunch {
  return {
    command: process.execPath,
    args: [],
    env: { ...process.env },
    shell: false,
    windowsVerbatimArguments: false,
    timeMs,
  };
}

const descendantSource = String.raw`
const { writeFileSync } = require("node:fs");
process.on("SIGTERM", () => {});
const markerPath = process.argv[1];
const markerDelay = Number(process.argv[2]);
if (markerPath !== "-") {
  setTimeout(() => writeFileSync(markerPath, "late\n"), markerDelay);
}
setInterval(() => {}, 1_000);
`;

const stubbornParentSource = String.raw`
const { spawn } = require("node:child_process");
const { writeFileSync } = require("node:fs");
process.on("SIGTERM", () => {});
const pidPath = process.argv[1];
const markerPath = process.argv[2];
const markerDelay = process.argv[3];
const child = spawn(process.execPath, ["-e", ${JSON.stringify(descendantSource)}, markerPath, markerDelay], {
  stdio: "ignore",
});
const pids = { parent_pid: process.pid, child_pid: child.pid };
writeFileSync(pidPath, JSON.stringify(pids));
process.stdout.write(JSON.stringify(pids) + "\n");
setInterval(() => {}, 1_000);
`;

function stubbornLaunch(
  root: string,
  timeMs: number,
  markerPath = "-",
  markerDelay = 10_000,
): ProviderProcessLaunch {
  const pidPath = join(root, `pids-${timeMs}-${pidFiles.length}.json`);
  pidFiles.push(pidPath);
  return {
    ...baseLaunch(timeMs),
    args: ["-e", stubbornParentSource, pidPath, markerPath, String(markerDelay)],
  };
}

async function measured(
  launch: ProviderProcessLaunch,
): Promise<{ readonly outcome: ProviderProcessLifecycleOutcome; readonly elapsedMs: number }> {
  const startedAt = process.hrtime.bigint();
  const outcome = await runBudgetedProviderProcess(launch);
  const elapsedMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
  return { outcome, elapsedMs };
}

describe.skipIf(process.platform === "win32")("provider process budget lifecycle", () => {
  it("U-WBL-001: deadline前の正常終了はstatus、出力、reap結果を保持する", async () => {
    const outcome = await runBudgetedProviderProcess({
      ...baseLaunch(1_000),
      args: [
        "-e",
        'process.stdin.setEncoding("utf8"); let input = ""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { process.stdout.write(input); process.stderr.write("diagnostic"); });',
      ],
      stdin: "provider-complete",
    });

    expect(outcome).toMatchObject({
      status: 0,
      stdout: "provider-complete",
      stderr: "diagnostic",
      timed_out: false,
      interrupted_by: null,
      deadline_ms: 1_000,
      termination_stage: "none",
      signal: null,
      reaped: true,
    });
    expect(outcome.error).toBeUndefined();
    expect(outcome.duration_ms).toBeGreaterThanOrEqual(0);
    expect(outcome.duration_ms).toBeLessThan(1_000);
  });

  it("U-WBL-002: SIGTERMを無視する親と孫をgrace後にSIGKILLして回収する", async () => {
    const root = temporaryRoot();
    const outcome = await runBudgetedProviderProcess(stubbornLaunch(root, 200));
    const pids = JSON.parse(outcome.stdout.trim()) as ProcessTreePids;

    expect(outcome).toMatchObject({
      status: null,
      timed_out: true,
      interrupted_by: null,
      deadline_ms: 200,
      termination_stage: "kill_sent",
      signal: "SIGKILL",
      reaped: true,
    });
    expect(outcome.error).toBeUndefined();
    expect(processAlive(pids.parent_pid)).toBe(false);
    expect(processAlive(pids.child_pid)).toBe(false);
  });

  it("U-WBL-003: 200msと800msのbudget差を実測終了時刻へ反映する", async () => {
    const root = temporaryRoot();
    const short = await measured(stubbornLaunch(root, 200));
    const long = await measured(stubbornLaunch(root, 800));

    expect(short.outcome.deadline_ms).toBe(200);
    expect(long.outcome.deadline_ms).toBe(800);
    expect(short.outcome.timed_out).toBe(true);
    expect(long.outcome.timed_out).toBe(true);
    expect(short.outcome.duration_ms).toBeGreaterThanOrEqual(190);
    expect(long.outcome.duration_ms).toBeGreaterThanOrEqual(790);
    expect(long.outcome.duration_ms - short.outcome.duration_ms).toBeGreaterThanOrEqual(450);
    expect(long.elapsedMs - short.elapsedMs).toBeGreaterThanOrEqual(450);
    expect(Math.abs(short.elapsedMs - short.outcome.duration_ms)).toBeLessThan(30);
    expect(Math.abs(long.elapsedMs - long.outcome.duration_ms)).toBeLessThan(30);
  });

  it("U-WBL-004: timeout return後に孫processのlate markerを生成しない", async () => {
    const root = temporaryRoot();
    const markerPath = join(root, "late-marker");
    const outcome = await runBudgetedProviderProcess(stubbornLaunch(root, 200, markerPath, 600));

    expect(outcome.reaped).toBe(true);
    expect(existsSync(markerPath)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(existsSync(markerPath)).toBe(false);
  });

  it("U-WBL-007: wrapperへのSIGINTをprovider process groupへ転送して孤児化を防ぐ", async () => {
    const root = temporaryRoot();
    const lifecycle = runBudgetedProviderProcess(stubbornLaunch(root, 10_000));
    const pidPath = pidFiles.at(-1);
    if (pidPath === undefined) throw new Error("provider_pid_path_missing");
    while (!existsSync(pidPath)) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    process.emit("SIGINT", "SIGINT");
    const outcome = await lifecycle;
    const pids = readProcessTreePids(pidPath);

    expect(outcome).toMatchObject({
      timed_out: false,
      interrupted_by: "SIGINT",
      termination_stage: "kill_sent",
      signal: "SIGKILL",
      reaped: true,
    });
    expect(outcome.error).toBeUndefined();
    expect(processAlive(pids.parent_pid)).toBe(false);
    expect(processAlive(pids.child_pid)).toBe(false);
  });

  it("U-WBL-008: direct child正常終了後の残存treeをdeadline誤報なしで回収する", async () => {
    const root = temporaryRoot();
    const pidPath = join(root, "lingering-child.json");
    const source = `
const { spawn } = require("node:child_process");
const { writeFileSync } = require("node:fs");
const child = spawn(process.execPath, ["-e", ${JSON.stringify(descendantSource)}, "-", "10000"], { stdio: "ignore" });
writeFileSync(process.argv[1], JSON.stringify({ parent_pid: process.pid, child_pid: child.pid }));
child.unref();
process.stdout.write("done");
`;
    const measuredOutcome = await measured({
      ...baseLaunch(1_500),
      args: ["-e", source, pidPath],
    });
    const pids = readProcessTreePids(pidPath);

    expect(measuredOutcome.outcome).toMatchObject({
      status: 0,
      stdout: "done",
      timed_out: false,
      tree_lingered: true,
      interrupted_by: null,
      termination_stage: "kill_sent",
      signal: null,
      reaped: true,
    });
    expect(measuredOutcome.elapsedMs).toBeLessThan(1_000);
    expect(processAlive(pids.child_pid)).toBe(false);
  });
});

describe("provider process lifecycle OS boundary", () => {
  it("U-WBL-006: Windows process tree terminationは未実装のためspawn前にfail-closeする", () => {
    expect(() => assertProviderProcessLifecycleSupported("win32")).toThrowError(
      "provider_process_tree_termination_unsupported:win32",
    );
  });
});
