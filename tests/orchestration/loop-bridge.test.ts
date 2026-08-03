import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { type ExecAdapterInput, nodeTickDeps } from "../../src/orchestration/loop-bridge";
import type { LoopIterationRecord } from "../../src/orchestration/loop-runner";
import { tick } from "../../src/orchestration/loop-runner";
import type { LoopState } from "../../src/orchestration/loop-state";
import type { LoopStore } from "../../src/orchestration/loop-store";

// PLAN-L7-503-worker-context-authority

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function runningState(input: Partial<LoopState> = {}): LoopState {
  return {
    planId: "PLAN-L7-177",
    status: "running",
    iteration: 0,
    maxIterations: 2,
    lastVerdict: "fail",
    workerProvider: "codex",
    verifierProvider: null,
    blockedReason: null,
    windowOpensAt: "2026-01-01T00:00:00.000Z",
    windowClosesAt: "2030-01-01T00:00:00.000Z",
    costUsd: 0,
    updatedAt: "2026-06-28T00:00:00.000Z",
    ...input,
  };
}

function memoryLoopStore(records: LoopIterationRecord[] = []): LoopStore {
  let state: LoopState | null = null;
  return {
    read: vi.fn(() => state),
    write: vi.fn((next: LoopState) => {
      state = next;
    }),
    recordIteration: vi.fn((record: LoopIterationRecord) => {
      records.push(record);
    }),
    runSideEffect: async (_state, _purpose, effect) => effect(),
  };
}

function runCli(cwd: string, args: string[], env?: NodeJS.ProcessEnv) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(
      cmdExe,
      ["/d", "/c", "npx", "--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args],
      {
        cwd,
        encoding: "utf8",
        env: { ...process.env, ...env },
      },
    );
  }
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function writeFakeProvider(input: {
  binDir: string;
  provider: "codex" | "claude";
  verdict?: string;
}): string {
  mkdirSync(input.binDir, { recursive: true });
  if (process.platform === "win32") {
    const path = join(input.binDir, `${input.provider}.cmd`);
    writeFileSync(
      path,
      [
        "@echo off",
        'if "%1"=="--version" (',
        `  echo ${input.provider} 0.0.0`,
        "  exit /b 0",
        ")",
        `echo %*>> ${input.provider}-calls.txt`,
        input.verdict ? `echo VERDICT: ${input.verdict}` : "echo worker ok",
        "exit /b 0",
        "",
      ].join("\r\n"),
    );
    return path;
  }
  const path = join(input.binDir, input.provider);
  writeFileSync(
    path,
    [
      "#!/bin/sh",
      'if [ "$1" = "--version" ]; then',
      `  echo "${input.provider} 0.0.0"`,
      "  exit 0",
      "fi",
      `printf '%s\\n' "$*" >> "${input.provider}-calls.txt"`,
      input.verdict ? `echo "VERDICT: ${input.verdict}"` : "echo worker ok",
      "",
    ].join("\n"),
  );
  chmodSync(path, 0o755);
  return path;
}

describe("P2 orchestration runtime bridge (PLAN-L7-177)", () => {
  it("U-ORCH-BRIDGE-01: runWorker dispatches worker provider and verifier uses the opposite provider", async () => {
    const records: LoopIterationRecord[] = [];
    const calls: ExecAdapterInput[] = [];
    const store = memoryLoopStore(records);
    const execAdapter = vi.fn(async (input: ExecAdapterInput) => {
      calls.push(input);
      return {
        status: 0,
        signal: null,
        stdout: input.purpose === "verifier" ? "VERDICT: fail\n" : "worker ok\n",
        stderr: "",
      };
    });
    const state = runningState({ workerProvider: "codex" });
    const deps = nodeTickDeps({
      mode: "hybrid",
      store,
      execAdapter,
      now: () => "2026-06-28T00:30:00.000Z",
    });

    await expect(tick(state, [], deps)).resolves.toEqual({
      ...state,
      iteration: 1,
      lastVerdict: "fail",
      verifierProvider: "claude",
      blockedReason: null,
      updatedAt: "2026-06-28T00:30:00.000Z",
    });
    expect(calls.map((call) => [call.purpose, call.provider, call.plan.command])).toEqual([
      ["worker", "codex", "codex"],
      ["verifier", "claude", "claude"],
    ]);
    expect(calls[0]?.plan.args).toContain("exec");
    expect(calls[0]?.plan.effort).toBe("high");
    expect(calls[0]?.plan.args).toEqual(
      expect.arrayContaining(["-c", "model_reasoning_effort=high"]),
    );
    expect(calls[1]?.plan.stdin).toContain("VERDICT: pass|fail|error|pending");
    expect(records).toEqual([
      {
        planId: "PLAN-L7-177",
        iteration: 0,
        workerProvider: "codex",
        verifierProvider: "claude",
        verdict: "fail",
        stopReason: null,
        blockedReason: null,
        costUsd: 0,
        recordedAt: "2026-06-28T00:30:00.000Z",
      },
    ]);
  });

  it("U-WCP-013: loop executeはcontext無しprocess dispatchを拒否する", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-loop-bridge-"));
    const binDir = join(cwd, "bin");
    try {
      const codexBin = writeFakeProvider({ binDir, provider: "codex" });
      const claudeBin = writeFakeProvider({ binDir, provider: "claude", verdict: "fail" });
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: codexBin,
        HELIX_CLAUDE_BIN: claudeBin,
      };
      const loopDir = join(cwd, ".helix", "state", "loop");
      mkdirSync(loopDir, { recursive: true });
      writeFileSync(
        join(loopDir, "PLAN-L7-177.json"),
        `${JSON.stringify(runningState(), null, 2)}\n`,
        "utf8",
      );

      const dryRun = runCli(cwd, ["loop", "run", "--plan", "PLAN-L7-177", "--dry-run"], env);
      expect(dryRun.status).toBe(0);
      expect(dryRun.stdout).toContain("dispatch=false");
      expect(dryRun.stdout).toContain("worker=codex available=true");
      expect(dryRun.stdout).toContain("verifier=claude available=true");
      expect(existsSync(join(cwd, "codex-calls.txt"))).toBe(false);
      expect(existsSync(join(cwd, "claude-calls.txt"))).toBe(false);

      const once = runCli(cwd, ["loop", "run", "--plan", "PLAN-L7-177", "--once"], env);
      expect(once.status).toBe(1);
      expect(once.stderr).toContain("WORKER_CONTEXT_UNSEALED");
      expect(existsSync(join(cwd, "codex-calls.txt"))).toBe(false);
      expect(existsSync(join(cwd, "claude-calls.txt"))).toBe(false);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
