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

  it("S1: blocks destructive git hidden in shell evaluation surfaces", () => {
    for (const command of [
      'bash -c "git reset --hard HEAD"',
      "sh -c 'git restore src/cli.ts'",
      'eval "git push --force origin main"',
      "echo $(git checkout -- src/cli.ts)",
      '/bin/bash -c "git reset --hard HEAD"',
      "/usr/bin/sh -c 'git restore src/cli.ts'",
      'eval -- "git revert HEAD"',
      "bash -c \"sh -c 'git push --force origin main'\"",
      'echo $(printf %s "$(git reset --hard HEAD)")',
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
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

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-004] classifies destructive cleanup and ref deletion", () => {
    for (const command of [
      "git clean -f",
      "git clean -fdx",
      "git branch -D feature",
      "git branch --delete --force feature",
      "git stash drop stash@{0}",
      "git stash clear",
      "git -C repo clean -df",
      "git clean -f; echo ok",
      "git stash clear&&echo ok",
      "git branch -df feature",
      "git branch -d -f feature",
      "git stash -q drop stash@{0}",
    ]) expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
    for (const command of ["git clean -nfd", "git clean --dry-run", "git branch -d merged", "git stash list", "git stash show"])
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] fails closed on incomplete shell grammar", () => {
    for (const command of ["git clean '-f", 'git stash "clear']) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
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
      expect(audit).toContain('"schemaVersion":"guard-override-audit.v1"');
      expect(audit).toContain('"reasonDigest":"sha256:');
      expect(audit).not.toContain("manual recovery after log/reflog review");

      const second = runHook(input, cwd);
      expect(second.status).toBe(2);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("S4: safe command does not consume a destructive override marker", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-safe-marker-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "approved recovery");
      const safe = runHook({ session_id: "s-git", tool_input: { command: "git status" } }, cwd);
      expect(safe.status).toBe(0);
      expect(existsSync(markerPath)).toBe(true);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006/007] dev hook and CLI fail closed when durable audit cannot commit", () => {
    for (const adapter of ["dev-hook", "cli"] as const) {
      const cwd = mkdtempSync(join(tmpdir(), `helix-gitguard-audit-failure-${adapter}-`));
      try {
        const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
        const auditPath = join(cwd, ".helix", "logs", "destructive-git-overrides.jsonl");
        mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
        mkdirSync(auditPath, { recursive: true });
        writeFileSync(markerPath, "reviewed recovery");
        const input = { session_id: "s-failure", tool_input: { command: "git clean -f" } };
        const result = adapter === "dev-hook" ? runHook(input, cwd) : runCliGuard(input, cwd);
        expect(result.status, adapter).toBe(2);
        expect(result.stderr, adapter).toContain("blocked_audit_failure");
        expect(existsSync(markerPath), adapter).toBe(true);
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    }
  });

  it("S3: Bash write to a foreign uncommitted file is blocked", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-bash-workguard-"));
    try {
      spawnSync("git", ["init"], { cwd });
      writeFileSync(join(cwd, "foreign.ts"), "export const foreign = true;\n");
      const blocked = runHook(
        { session_id: "s-bash", tool_input: { command: "sed -i s/true/false/ foreign.ts" } },
        cwd,
      );
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("helix-work-guard");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
