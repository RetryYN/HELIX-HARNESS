import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AGENT_TOOL_NAMES } from "../src/runtime/agent-guard-policy";
import { BUILTIN_GITHUB_TEMPLATES } from "../src/setup/templates";

const cli = join(process.cwd(), "src", "cli.ts");

function repo(): string {
  const cwd = mkdtempSync(join(tmpdir(), "helix-work-guard-"));
  execFileSync("git", ["init", "-q"], { cwd });
  writeFileSync(join(cwd, "owned.txt"), "base\n");
  execFileSync("git", ["add", "owned.txt"], { cwd });
  execFileSync(
    "git",
    ["-c", "user.name=test", "-c", "user.email=test@example.invalid", "commit", "-qm", "init"],
    { cwd },
  );
  return cwd;
}

function run(cwd: string, payload: unknown) {
  return spawnSync(
    "npx",
    ["--prefix", process.cwd(), "--no-install", "tsx", cli, "hook", "work-guard"],
    {
      cwd,
      encoding: "utf8",
      input: JSON.stringify(payload),
    },
  );
}

describe("PLAN-L7-433 C1 consumer hook command", () => {
  it("U-SETUP-040: real CLI blocks a foreign uncommitted edit and passes a clean target", () => {
    const cwd = repo();
    writeFileSync(join(cwd, "owned.txt"), "foreign\n");
    const blocked = run(cwd, { session_id: "new", tool_input: { file_path: "owned.txt" } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("helix-work-guard");

    const passed = run(cwd, { session_id: "new", tool_input: { file_path: "clean.txt" } });
    expect(passed.status).toBe(0);
    expect(passed.stdout).toContain("work-guard: pass");
  });

  it("U-SETUP-041: every hook command declared by consumer templates exists in CLI help", () => {
    const commands = [
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/settings.json"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.codex/hooks.json"],
    ]
      .flatMap((text) => [...text.matchAll(/"command":\s*"helix hook ([a-z-]+)(?: [^"]*)?"/g)])
      .map((match) => match[1]);
    const help = spawnSync(
      "npx",
      ["--prefix", process.cwd(), "--no-install", "tsx", cli, "hook", "--help"],
      {
        encoding: "utf8",
      },
    );
    expect(help.status).toBe(0);
    for (const command of new Set(commands)) expect(help.stdout).toContain(command);
    expect(commands).toContain("work-guard");
  });

  it("U-SETUP-042: dev matcher, policy, and consumer template share Agent|Task", () => {
    const settings = JSON.parse(
      readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8"),
    );
    const devMatcher = settings.hooks.PreToolUse.find(
      (entry: { hooks?: Array<{ command?: string }> }) =>
        entry.hooks?.some((hook) => hook.command?.includes("agent-guard")),
    )?.matcher;
    const templateMatcher = JSON.parse(
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/settings.json"],
    ).hooks.PreToolUse.find((entry: { hooks?: Array<{ command?: string }> }) =>
      entry.hooks?.some((hook) => hook.command === "helix hook agent-guard"),
    )?.matcher;
    const policyMatcher = [...AGENT_TOOL_NAMES].join("|");
    expect({ devMatcher, templateMatcher, policyMatcher }).toEqual({
      devMatcher: "Agent|Task",
      templateMatcher: "Agent|Task",
      policyMatcher: "Agent|Task",
    });
  });
});
