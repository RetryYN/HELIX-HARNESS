import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { readLoopEpochFromFs } from "../../src/orchestration/durable-loop-epoch-node";
import { type ExecAdapterInput, nodeTickDeps } from "../../src/orchestration/loop-bridge";
import type { LoopIterationRecord } from "../../src/orchestration/loop-runner";
import { tick } from "../../src/orchestration/loop-runner";
import type { LoopState } from "../../src/orchestration/loop-state";
import type { LoopStore } from "../../src/orchestration/loop-store";
import { installTestWorkerContextBoundary } from "../helpers/worker-context";

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
    // Codex native worker transport preserves the policy-derived xhigh value;
    // Claude's historical compatibility mapping remains covered separately.
    expect(calls[0]?.plan.effort).toBe("xhigh");
    expect(calls[0]?.plan.args).toEqual(
      expect.arrayContaining(["-c", "model_reasoning_effort=xhigh"]),
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

  // U-WCP-013 は context 無しでの拒否（negative）のみを固定する。WCC-FR-09 で
  // --worker-context-file が必須化された際に旧 U-ORCH-BRIDGE-02 が置換され、loop 実行の
  // 正例カバレッジが消失していた（issue #374）。本 oracle は sealed worker context を
  // 渡した正常 dispatch 側を回復し、tick 進行 / durable epoch commit / provider 呼出回数 /
  // iteration・lastVerdict 遷移を固定する。
  it("U-ORCH-BRIDGE-02: loop runはsealed worker contextでcanResumeの間tickを進めdurable epochをcommitする", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-loop-bridge-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
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

      const once = runCli(
        cwd,
        ["loop", "run", "--plan", "PLAN-L7-177", "--once", "--worker-context-file", contextPath],
        env,
      );
      expect(once.status, once.stderr || once.stdout).toBe(0);
      expect(once.stdout).toContain("ticks=1");
      expect(once.stdout).toContain("iteration=1");

      const run = runCli(
        cwd,
        ["loop", "run", "--plan", "PLAN-L7-177", "--worker-context-file", contextPath],
        env,
      );
      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(run.stdout).toContain("ticks=1");
      expect(run.stdout).toContain("iteration=2");

      const snapshot = readLoopEpochFromFs(cwd, "PLAN-L7-177");
      expect(snapshot.status).toBe("committed");
      const state = snapshot.payload?.state as LoopState;
      expect(state.iteration).toBe(2);
      expect(state.lastVerdict).toBe("fail");
      expect(snapshot.payload?.iteration).toMatchObject({
        iteration: 1,
        verifierProvider: "claude",
      });
      expect(readFileSync(join(cwd, "codex-calls.txt"), "utf8").trim().split(/\r?\n/)).toHaveLength(
        2,
      );
      expect(
        readFileSync(join(cwd, "claude-calls.txt"), "utf8").trim().split(/\r?\n/),
      ).toHaveLength(2);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});

// PLAN-L7-498-worker-wrapper-admission / Issue #362 §1
// loop sink が admission を通していることを sink 単独で固定する fence。
// U-WCP-013 は CLI 段の WORKER_CONTEXT_UNSEALED を固定しており、sink 手前で止まるため
// defaultExecAdapter の admission が外れても検出できない。
describe("loop bridge wrapper admission sink fence", () => {
  /** spawn されたら絶対 path の marker へ追記するだけの偽 provider。 */
  function writeSpawnMarkerProvider(binDir: string, marker: string): string {
    mkdirSync(binDir, { recursive: true });
    if (process.platform === "win32") {
      const providerPath = join(binDir, "codex.cmd");
      writeFileSync(
        providerPath,
        ["@echo off", `echo spawned>> "${marker}"`, "exit /b 0", ""].join("\r\n"),
      );
      return providerPath;
    }
    const providerPath = join(binDir, "codex");
    writeFileSync(providerPath, ["#!/bin/sh", `printf 'spawned\\n' >> "${marker}"`, ""].join("\n"));
    chmodSync(providerPath, 0o755);
    return providerPath;
  }

  it("U-LSAF-001: worker context を持たない plan では provider を spawn しない", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-loop-sink-fence-"));
    const binDir = join(cwd, "bin");
    const marker = join(cwd, "spawned.txt");
    try {
      const codexBin = writeSpawnMarkerProvider(binDir, marker);
      // adapter は HELIX_CODEX_BIN を PATH より優先する。両方を偽 provider へ固定し、
      // admission mutant でも operator 環境の実 provider を起動できないようにする。
      vi.stubEnv("PATH", binDir);
      vi.stubEnv("HELIX_CODEX_BIN", codexBin);

      // workerContext を渡さない = wrapper route は通るが worker context packet が無い状態。
      const deps = nodeTickDeps({ mode: "hybrid", store: memoryLoopStore() });

      await expect(deps.runWorker(runningState())).rejects.toThrow(/WRAPPER_CONTEXT_REQUIRED/);
      expect(existsSync(marker)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
