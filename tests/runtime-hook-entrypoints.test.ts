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
import { describe, expect, it } from "vitest";
import {
  CLAUDE_HEADLESS_EXECUTION_ENV,
  CLAUDE_HEADLESS_SETTING_ARGS,
} from "../src/runtime/adapter-policy";
import { installTestWorkerContextBoundary } from "./helpers/worker-context";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const helixEnvPrefix = ["HE", "LIX"].join("");

function runCli(cwd: string, args: string[], input?: unknown, env?: NodeJS.ProcessEnv) {
  const stdin = input === undefined ? undefined : JSON.stringify(input);
  if (process.platform === "win32") {
    // cmd.exe は PATH 探索でなく %SystemRoot% から canonical に解決する。
    // PATH 注入事故 (System32 欠落) でテストが環境誘発 fail しないため (A-128 F-7)。
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(
      cmdExe,
      ["/d", "/c", "npx", "--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args],
      {
        cwd,
        encoding: "utf8",
        env: { ...process.env, ...env },
        input: stdin,
      },
    );
  }
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
    input: stdin,
  });
}

function writePlanFixture(cwd: string, planId = "PLAN-L4-13"): void {
  mkdirSync(join(cwd, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(cwd, "docs", "plans", `${planId}.md`),
    `---\nplan_id: ${planId}\nstatus: confirmed\n---\n`,
  );
}

function writeFakeCodex(binDir: string): string {
  mkdirSync(binDir, { recursive: true });
  const rawEnv = [helixEnvPrefix, "ALLOW", "RAW", "CODEX"].join("_");
  const reasonEnv = [helixEnvPrefix, "RAW", "CODEX", "REASON"].join("_");
  if (process.platform === "win32") {
    const path = join(binDir, "codex.cmd");
    writeFileSync(
      path,
      `@echo off\r\necho %* > codex-called.txt\r\nfindstr "^" > codex-stdin.txt\r\n(echo raw=%${rawEnv}%)> codex-env.txt\r\n(echo reason=%${reasonEnv}%)>> codex-env.txt\r\nexit /b 0\r\n`,
    );
    return path;
  }
  const path = join(binDir, "codex");
  writeFileSync(
    path,
    `#!/bin/sh\necho "$@" > codex-called.txt\ncat > codex-stdin.txt\nprintf "raw=%s\\nreason=%s\\n" "$${rawEnv}" "$${reasonEnv}" > codex-env.txt\nexit 0\n`,
  );
  chmodSync(path, 0o755);
  return path;
}

function writeFakeClaude(binDir: string): string {
  mkdirSync(binDir, { recursive: true });
  const rawEnv = [helixEnvPrefix, "ALLOW", "RAW", "CLAUDE"].join("_");
  const reasonEnv = [helixEnvPrefix, "RAW", "CLAUDE", "REASON"].join("_");
  if (process.platform === "win32") {
    const path = join(binDir, "claude.cmd");
    writeFileSync(
      path,
      `@echo off\r\necho %* > claude-called.txt\r\nfindstr "^" > claude-stdin.txt\r\n(echo raw=%${rawEnv}%)> claude-env.txt\r\n(echo reason=%${reasonEnv}%)>> claude-env.txt\r\n(echo headless=%${CLAUDE_HEADLESS_EXECUTION_ENV}%)>> claude-env.txt\r\necho completed> claude-completed.txt\r\necho VERDICT: PASS\r\nexit /b 0\r\n`,
    );
    return path;
  }
  const path = join(binDir, "claude");
  writeFileSync(
    path,
    `#!/bin/sh\necho "$@" > claude-called.txt\ncat > claude-stdin.txt\nprintf "raw=%s\\nreason=%s\\nheadless=%s\\n" "$${rawEnv}" "$${reasonEnv}" "$${CLAUDE_HEADLESS_EXECUTION_ENV}" > claude-env.txt\nprintf "completed\\n" > claude-completed.txt\nprintf "VERDICT: PASS\\n"\nexit 0\n`,
  );
  chmodSync(path, 0o755);
  return path;
}

function writeHoldingFakeClaude(binDir: string): string {
  mkdirSync(binDir, { recursive: true });
  const path = join(binDir, "claude-hold");
  writeFileSync(
    path,
    '#!/bin/sh\nif [ "$1" = "--version" ]; then\n  printf "fake-claude 1.0.0\\n"\n  exit 0\nfi\ncat >/dev/null\nprintf "started\\n" > claude-hold-started.txt\nwhile :; do :; done\nprintf "completed\\n" > claude-hold-completed.txt\n',
  );
  chmodSync(path, 0o755);
  return path;
}

describe("runtime hook entrypoints", () => {
  it("U-APSEL-006: plan use rejects truncated IDs and preserves the active marker", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-plan-use-"));
    try {
      mkdirSync(join(cwd, "docs", "plans"), { recursive: true });
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(
        join(cwd, "docs", "plans", "PLAN-L7-427-active-plan-selection.md"),
        "---\nplan_id: PLAN-L7-427-active-plan-selection\nstatus: confirmed\n---\n",
      );
      const marker = join(cwd, ".helix", "state", "current-plan");
      writeFileSync(marker, "PLAN-L7-427-active-plan-selection\nold");

      const rejected = runCli(cwd, ["plan", "use", "PLAN-L7-42"]);
      expect(rejected.status).toBe(1);
      expect(rejected.stderr).toContain("unknown PLAN ID");
      expect(rejected.stderr).toContain("PLAN-L7-427-active-plan-selection");
      expect(readFileSync(marker, "utf8")).toBe("PLAN-L7-427-active-plan-selection\nold");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-MEMWAKE-002: PLAN-L7-469-claude-memory-async-wake Stop hookをasyncRewakeへ配線する", () => {
    const settings = JSON.parse(readFileSync(join(repoRoot, ".claude", "settings.json"), "utf8"));
    const hooks = settings.hooks;

    expect(hooks.SessionStart[0].hooks[0].command).toBe(
      'npx --no-install tsx "$CLAUDE_PROJECT_DIR/src/cli.ts" session start',
    );
    expect(hooks.PostToolUse[0].hooks[0].command).toBe(
      'npx --no-install tsx "$CLAUDE_PROJECT_DIR/src/cli.ts" hook post-tool-use',
    );
    expect(hooks.Stop[0].hooks[0].command).toBe(
      'npx --no-install tsx "$CLAUDE_PROJECT_DIR/src/cli.ts" session summary',
    );
    expect(hooks.Stop[1].hooks[0]).toEqual(
      expect.objectContaining({
        command: 'npx --no-install tsx "$CLAUDE_PROJECT_DIR/src/cli.ts" hook claude-memory-wake',
        asyncRewake: true,
        timeout: 7230,
      }),
    );
  });

  it("U-ADAPTER-012: headless marker中のmemory wakeはstateもclaimも作らず即時終了する", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-claude-headless-wake-"));
    try {
      const run = runCli(cwd, ["hook", "claude-memory-wake"], undefined, {
        [CLAUDE_HEADLESS_EXECUTION_ENV]: "1",
        HELIX_CLAUDE_WAKE_POLL_MS: "10",
        HELIX_CLAUDE_WAKE_MAX_MS: "10",
      });
      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(existsSync(join(cwd, ".helix", "state", "claude-memory-wake"))).toBe(false);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("shared CLI session/hook commands record a PLAN digest in a temp repo", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-hook-"));
    try {
      mkdirSync(join(cwd, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(cwd, "docs", "plans", "PLAN-L4-13.md"),
        "---\nplan_id: PLAN-L4-13\nstatus: confirmed\n---\n",
      );
      const start = runCli(cwd, ["plan", "use", "PLAN-L4-13"]);
      expect(start.status, start.stderr || start.stdout).toBe(0);

      const sessionStart = runCli(cwd, ["session", "start"], {
        hook_event_name: "SessionStart",
        session_id: "s-cli",
      });
      expect(sessionStart.status).toBe(0);
      expect(sessionStart.stdout).toContain("session-log: start s-cli");

      const postToolUse = runCli(cwd, ["hook", "post-tool-use"], {
        hook_event_name: "PostToolUse",
        session_id: "s-cli",
        tool_name: "Edit",
        tool_input: { file_path: "src/cli.ts" },
        tool_response: { outcome: "ok" },
      });
      expect(postToolUse.status).toBe(0);
      expect(postToolUse.stdout).toContain("session-log: post-tool-use s-cli");

      const stop = runCli(cwd, ["session", "summary"], {
        hook_event_name: "Stop",
        session_id: "s-cli",
      });
      expect(stop.status).toBe(0);
      expect(stop.stdout).toContain("session-log: summary s-cli");

      const digest = JSON.parse(
        readFileSync(join(cwd, ".helix", "logs", "plan", "PLAN-L4-13.digest.json"), "utf8"),
      );
      expect(digest.plan_id).toBe("PLAN-L4-13");
      expect(digest.sessions).toEqual(["s-cli"]);
      expect(digest.files_touched).toEqual(["Edit src/cli.ts"]);
      expect(digest.event_counts.session_start).toBe(1);
      expect(digest.event_counts.tool_use).toBe(1);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("helix codex --execute records the same session lifecycle through the adapter wrapper", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-codex-wrapper-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
      writePlanFixture(cwd);
      const fakeCodex = writeFakeCodex(binDir);
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      };

      expect(runCli(cwd, ["plan", "use", "PLAN-L4-13"]).status).toBe(0);
      const run = runCli(
        cwd,
        [
          "codex",
          "--role",
          "se",
          "--task",
          "implement parity",
          "--execute",
          "--worker-context-file",
          contextPath,
        ],
        undefined,
        env,
      );
      expect(run.status, run.stderr || run.stdout).toBe(0);

      const digest = JSON.parse(
        readFileSync(join(cwd, ".helix", "logs", "plan", "PLAN-L4-13.digest.json"), "utf8"),
      );
      expect(digest.sessions).toHaveLength(1);
      expect(digest.sessions[0]).toMatch(/^codex-/);
      expect(digest.event_counts.session_start).toBe(1);
      expect(digest.event_counts.tool_use).toBe(1);
      expect(readFileSync(join(cwd, "codex-called.txt"), "utf8")).toContain("exec");
      const envText = readFileSync(join(cwd, "codex-env.txt"), "utf8");
      expect(envText).not.toContain("raw=1");
      expect(envText).not.toContain("reason=helix-runtime-adapter-wrapper");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("helix codex --task-file feeds file content through the same adapter wrapper", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-codex-task-file-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
      writePlanFixture(cwd);
      const fakeCodex = writeFakeCodex(binDir);
      writeFileSync(join(cwd, "task.md"), "implement from task file");
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      };

      expect(runCli(cwd, ["plan", "use", "PLAN-L4-13"]).status).toBe(0);
      const run = runCli(
        cwd,
        [
          "codex",
          "--role",
          "se",
          "--task-file",
          "task.md",
          "--execute",
          "--worker-context-file",
          contextPath,
        ],
        undefined,
        env,
      );
      expect(run.status).toBe(0);

      const digest = JSON.parse(
        readFileSync(join(cwd, ".helix", "logs", "plan", "PLAN-L4-13.digest.json"), "utf8"),
      );
      expect(digest.event_counts.session_start).toBe(1);
      expect(digest.event_counts.tool_use).toBe(1);
      const called = readFileSync(join(cwd, "codex-called.txt"), "utf8");
      expect(called).toContain("exec");
      // プロンプトは args でなく stdin で渡る (PLAN-L7-77、cmd.exe shell-wrap の改行切り詰め回避)。
      const stdinText = readFileSync(join(cwd, "codex-stdin.txt"), "utf8");
      expect(stdinText).toContain("implement from task file");
      const envText = readFileSync(join(cwd, "codex-env.txt"), "utf8");
      expect(envText).not.toContain("raw=1");
      expect(envText).not.toContain("reason=helix-runtime-adapter-wrapper");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("helix codex --plan records wrapper lifecycle without forwarding plan flags to Codex", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-codex-plan-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
      writePlanFixture(cwd, "PLAN-L4-77-adapter");
      const fakeCodex = writeFakeCodex(binDir);
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      };

      const run = runCli(
        cwd,
        [
          "codex",
          "--role",
          "se",
          "--task",
          "implement explicit plan",
          "--plan",
          "PLAN-L4-77-adapter",
          "--execute",
          "--worker-context-file",
          contextPath,
        ],
        undefined,
        env,
      );
      expect(run.status).toBe(0);

      const digest = JSON.parse(
        readFileSync(join(cwd, ".helix", "logs", "plan", "PLAN-L4-77-adapter.digest.json"), "utf8"),
      );
      expect(digest.plan_id).toBe("PLAN-L4-77-adapter");
      expect(digest.event_counts.session_start).toBe(1);
      expect(digest.event_counts.tool_use).toBe(1);
      expect(digest.event_counts.session_end).toBe(1);
      const called = readFileSync(join(cwd, "codex-called.txt"), "utf8");
      expect(called).toContain("exec");
      expect(called).not.toContain("--plan-id");
      expect(called).not.toContain("PLAN-L4-77-adapter");
      const stdinText = readFileSync(join(cwd, "codex-stdin.txt"), "utf8");
      expect(stdinText).toContain("implement explicit plan");
      expect(stdinText).toContain("HELIX context injection");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("helix claude --execute records lifecycle without legacy raw-wrapper env", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-claude-wrapper-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
      writePlanFixture(cwd, "PLAN-L4-78-adapter");
      const fakeClaude = writeFakeClaude(binDir);
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CLAUDE_BIN: fakeClaude,
      };

      const run = runCli(
        cwd,
        [
          "claude",
          "--role",
          "pmo-sonnet",
          "--task",
          "review explicit plan",
          "--plan",
          "PLAN-L4-78-adapter",
          "--execute",
          "--worker-context-file",
          contextPath,
        ],
        undefined,
        env,
      );
      expect(run.status).toBe(0);
      expect(readFileSync(join(cwd, "claude-completed.txt"), "utf8")).toContain("completed");

      const digest = JSON.parse(
        readFileSync(join(cwd, ".helix", "logs", "plan", "PLAN-L4-78-adapter.digest.json"), "utf8"),
      );
      expect(digest.plan_id).toBe("PLAN-L4-78-adapter");
      expect(digest.event_counts.session_start).toBe(1);
      expect(digest.event_counts.tool_use).toBe(1);
      expect(digest.event_counts.session_end).toBe(1);
      const called = readFileSync(join(cwd, "claude-called.txt"), "utf8");
      expect(called).toContain("--print");
      expect(called).toContain("--input-format");
      expect(called).toContain("text");
      for (const token of CLAUDE_HEADLESS_SETTING_ARGS) expect(called).toContain(token);
      expect(called).not.toMatch(/(^|\s)"?-p"?(\s|$)/);
      expect(called).not.toContain("review explicit plan");
      const stdinText = readFileSync(join(cwd, "claude-stdin.txt"), "utf8");
      expect(stdinText).toContain("review explicit plan");
      expect(called).not.toContain("--role");
      expect(called).not.toContain("--task");
      expect(called).not.toContain("--plan-id");
      expect(called).not.toContain("PLAN-L4-78-adapter");
      const envText = readFileSync(join(cwd, "claude-env.txt"), "utf8");
      expect(envText).not.toContain("raw=1");
      expect(envText).not.toContain("reason=helix-runtime-adapter-wrapper");
      expect(envText).toContain("headless=1");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it.runIf(process.platform !== "win32")(
    "U-ADAPTER-013: Ubuntu実processでbudget超過ClaudeをSIGKILLしwrapperをbounded returnする",
    () => {
      const cwd = mkdtempSync(join(tmpdir(), "helix-claude-timeout-"));
      const binDir = join(cwd, "bin");
      try {
        const contextPath = installTestWorkerContextBoundary(cwd);
        const boundary = JSON.parse(readFileSync(contextPath, "utf8")) as {
          budget: { time_ms: number; token_limit: number };
        };
        boundary.budget.time_ms = 250;
        writeFileSync(contextPath, `${JSON.stringify(boundary)}\n`);
        writePlanFixture(cwd, "PLAN-L4-78-claude-timeout");
        const fakeClaude = writeHoldingFakeClaude(binDir);
        const startedAt = Date.now();
        const run = runCli(
          cwd,
          [
            "claude",
            "--role",
            "pmo-sonnet",
            "--task",
            "hold until hard deadline",
            "--plan",
            "PLAN-L4-78-claude-timeout",
            "--execute",
            "--json",
            "--worker-context-file",
            contextPath,
          ],
          undefined,
          { HELIX_CLAUDE_BIN: fakeClaude },
        );
        const elapsedMs = Date.now() - startedAt;

        expect(run.status, run.stderr || run.stdout).toBe(1);
        expect(elapsedMs).toBeLessThan(10_000);
        expect(readFileSync(join(cwd, "claude-hold-started.txt"), "utf8")).toContain("started");
        expect(existsSync(join(cwd, "claude-hold-completed.txt"))).toBe(false);
        const result = JSON.parse(run.stdout) as {
          error_class: string | null;
          provider_timeout_ms: number | null;
          signal: string | null;
        };
        expect(result).toMatchObject({
          error_class: "provider_timeout",
          provider_timeout_ms: 250,
          signal: "SIGKILL",
        });
        expect(run.stderr).toContain("claude: provider timeout after 250ms");
        const digest = JSON.parse(
          readFileSync(
            join(cwd, ".helix", "logs", "plan", "PLAN-L4-78-claude-timeout.digest.json"),
            "utf8",
          ),
        );
        expect(digest.event_counts.session_end).toBe(1);
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    },
  );

  it("helix team run --execute records lifecycle for each provider member", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-team-wrapper-"));
    const binDir = join(cwd, "bin");
    try {
      const contextPath = installTestWorkerContextBoundary(cwd);
      writePlanFixture(cwd, "PLAN-L4-79-team-wrapper");
      const fakeCodex = writeFakeCodex(binDir);
      const fakeClaude = writeFakeClaude(binDir);
      mkdirSync(join(cwd, ".helix", "teams"), { recursive: true });
      writeFileSync(
        join(cwd, ".helix", "teams", "speed.yaml"),
        [
          "name: speed",
          "strategy: sequential",
          "max_parallel: 2",
          "members:",
          "  - role: se",
          "    engine: codex-se",
          "    task: implement team lifecycle",
          "  - role: tl",
          "    engine: pmo-sonnet",
          "    task: review team lifecycle",
        ].join("\n"),
      );
      const env = {
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
        HELIX_CLAUDE_BIN: fakeClaude,
      };

      const run = runCli(
        cwd,
        [
          "team",
          "run",
          "--definition",
          ".helix/teams/speed.yaml",
          "--mode",
          "hybrid",
          "--execute",
          "--plan",
          "PLAN-L4-79-team-wrapper",
          "--json",
          "--worker-context-file",
          contextPath,
        ],
        undefined,
        env,
      );
      expect(run.status, run.stderr || run.stdout).toBe(0);

      const digest = JSON.parse(
        readFileSync(
          join(cwd, ".helix", "logs", "plan", "PLAN-L4-79-team-wrapper.digest.json"),
          "utf8",
        ),
      );
      expect(digest.plan_id).toBe("PLAN-L4-79-team-wrapper");
      expect(digest.sessions).toHaveLength(2);
      expect(digest.sessions).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^codex-team-/),
          expect.stringMatching(/^claude-team-/),
        ]),
      );
      expect(digest.event_counts.session_start).toBe(2);
      expect(digest.event_counts.tool_use).toBe(2);
      expect(digest.event_counts.session_end).toBe(2);
      expect(readFileSync(join(cwd, "codex-called.txt"), "utf8")).toContain("exec");
      expect(readFileSync(join(cwd, "claude-called.txt"), "utf8")).toContain("--print");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
