import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateGitCommandGuard,
  extractShellCommand,
  resolveDestructiveGitOverride,
} from "../src/runtime/git-command-guard";

const cliPath = join(process.cwd(), "src", "cli.ts");
const hookPath = join(process.cwd(), ".claude", "hooks", "git-command-guard.ts");

function runCliGuard(input: unknown, cwd = process.cwd()) {
  return spawnSync("bun", [cliPath, "hook", "git-command-guard"], {
    cwd,
    encoding: "utf8",
    input: JSON.stringify(input),
  });
}

function runHook(input: unknown, cwd: string) {
  return spawnSync("bun", [hookPath], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
    input: JSON.stringify(input),
  });
}

describe("git-command-guard", () => {
  it("U-GITGUARD-001: blocks destructive git operations that can destroy another runtime's work", () => {
    for (const command of [
      "git reset --hard HEAD~1",
      "git checkout -- src/cli.ts",
      "git checkout -f main",
      "git restore src/cli.ts",
      "git restore --staged --worktree src/cli.ts",
      "git revert HEAD",
      "git push --force origin main",
      "git push --force-with-lease origin main",
    ]) {
      const result = evaluateGitCommandGuard({ command });
      expect(result.decision, command).toBe("block");
      expect(result.reason).toBe("destructive-git");
    }
  });

  it("U-GITGUARD-001: passes non-destructive git commands and branch creation", () => {
    for (const command of [
      "git status --short",
      "git diff --staged",
      "git log --oneline -5",
      "git push origin feature",
      "git checkout -b feature/git-guard",
      "git checkout main",
      "git reset HEAD src/cli.ts",
      "git reset -- src/cli.ts",
      "git restore --staged src/cli.ts",
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
    }
  });

  it("U-GITGUARD-002: extracts Claude and Codex shell command payload shapes", () => {
    expect(extractShellCommand({ command: "git reset --hard" })).toBe("git reset --hard");
    expect(extractShellCommand({ cmd: "git status" })).toBe("git status");
    expect(extractShellCommand("git diff")).toBe("git diff");
  });

  it("requires an explicit override reason path for destructive operations", () => {
    expect(evaluateGitCommandGuard({ command: "git reset --hard", bypass: false }).decision).toBe(
      "block",
    );
    expect(evaluateGitCommandGuard({ command: "git reset --hard", bypass: true }).decision).toBe(
      "pass",
    );
    expect(resolveDestructiveGitOverride({ markerReason: "  " }).bypass).toBe(false);
    expect(
      resolveDestructiveGitOverride({ markerReason: "manual rollback approved" }),
    ).toMatchObject({ bypass: true, source: "marker" });
  });

  it("U-GITGUARD-002: exposes a blocking CLI hook surface", () => {
    const blocked = runCliGuard({ tool_input: { command: "git reset --hard HEAD" } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("BLOCK");

    const pass = runCliGuard({ tool_input: { command: "git status --short" } });
    expect(pass.status).toBe(0);
    expect(pass.stdout).toContain("git-command-guard: pass");
  });

  it("U-GITGUARD-002: hook marker override is one-shot and audited", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-marker-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "manual recovery after log/reflog review");
      const input = { session_id: "s-git", tool_input: { command: "git reset --hard HEAD" } };

      const first = runHook(input, cwd);
      expect(first.status).toBe(0);
      expect(existsSync(markerPath)).toBe(false);
      const audit = readFileSync(
        join(cwd, ".helix", "logs", "destructive-git-overrides.jsonl"),
        "utf8",
      );
      expect(audit).toContain("manual recovery after log/reflog review");

      const second = runHook(input, cwd);
      expect(second.status).toBe(2);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
