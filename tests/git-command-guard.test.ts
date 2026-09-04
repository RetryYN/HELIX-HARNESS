// @helix-repo-wide-guard
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ensureCliBundle, ensureHookBundle } from "./tools/cli-bundle";

// #93: spawn ごとの tsx transpile を避け、suite 起動時に 1 回だけ CLI を bundle する。
const CLI_BUNDLE_PATH = ensureCliBundle(process.cwd());
const HOOK_BUNDLE_PATH = ensureHookBundle(process.cwd(), "git-command-guard");

import {
  containsDirectGithubPrLifecycleMutation,
  containsDirectGithubPrMerge,
  evaluateGitCommandGuard,
  extractShellCommand,
  resolveDestructiveGitOverride,
} from "../src/runtime/git-command-guard";
// PLAN-L7-473-claude-pr-convergence / U-GITGUARD-010
import { defaultHarnessDbPath, openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

// PLAN-L7-691-shared-root-git-mutation-guard / U-GITGUARD-011..014 / IT-GITGUARD-005..007

function overrideRows(cwd: string): Record<string, unknown>[] {
  const db = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
  try {
    return db.prepare("SELECT * FROM guard_override_transactions ORDER BY nonce").all();
  } finally {
    db.close();
  }
}

function runCliGuard(input: unknown, cwd = process.cwd()) {
  return spawnSync(process.execPath, [CLI_BUNDLE_PATH, "hook", "git-command-guard"], {
    cwd,
    encoding: "utf8",
    input: JSON.stringify(input),
  });
}

function runHook(input: unknown, cwd: string, projectRoot = cwd) {
  return spawnSync(process.execPath, [HOOK_BUNDLE_PATH], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectRoot },
    input: JSON.stringify(input),
  });
}

function git(cwd: string, args: string[]): string {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function createWorktreeFixture(): { root: string; linked: string; cleanup: () => void } {
  const root = mkdtempSync(join(tmpdir(), "helix-shared-root-gitguard-"));
  const linkedParent = mkdtempSync(join(tmpdir(), "helix-linked-gitguard-"));
  const linked = join(linkedParent, "worktree");
  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "HELIX Test"]);
  git(root, ["config", "user.email", "helix-test@example.invalid"]);
  writeFileSync(join(root, "base.txt"), "base\n");
  writeFileSync(join(root, ".gitignore"), ".helix/\n");
  git(root, ["add", "base.txt", ".gitignore"]);
  git(root, ["commit", "-m", "test: seed"]);
  git(root, ["worktree", "add", "-b", "feature", linked]);
  writeFileSync(join(linked, "feature-only.txt"), "feature\n");
  git(linked, ["add", "feature-only.txt"]);
  git(linked, ["commit", "-m", "test: feature"]);
  return {
    root,
    linked,
    cleanup() {
      try {
        git(root, ["worktree", "remove", "--force", linked]);
      } catch {}
      rmSync(linkedParent, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    },
  };
}

describe("git-command-guard", () => {
  it("U-GITGUARD-010: direct gh pr mergeを検出し、reviewed wrapperは誤検出しない", () => {
    expect(containsDirectGithubPrMerge("gh pr merge 149 --merge")).toBe(true);
    expect(containsDirectGithubPrMerge("bash -c 'gh pr merge 149 --merge'")).toBe(true);
    expect(
      containsDirectGithubPrMerge(
        "npx --no-install tsx src/cli.ts github pr-merge-reviewed --pr 149 --receipt /tmp/r",
      ),
    ).toBe(false);
    const blocked = runCliGuard({ tool_input: { command: "gh pr merge 149 --merge" } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("pr-merge-reviewed");
    const wrapper = runCliGuard({
      tool_input: {
        command:
          "npx --no-install tsx src/cli.ts github pr-merge-reviewed --pr 149 --receipt /tmp/r",
      },
    });
    expect(wrapper.status).toBe(0);
  });
  it("U-CPRCONV-005: AI runtimeによるPR close/reopenを拒否しread-only参照を許可する", () => {
    for (const command of [
      "gh pr close 189",
      "gh pr reopen 189",
      "bash -c 'gh pr close 189; gh pr reopen 189'",
      "/usr/bin/gh pr close 189 --repo RetryYN/HELIX-HARNESS",
    ]) {
      expect(containsDirectGithubPrLifecycleMutation(command), command).toBe(true);
      const blocked = runCliGuard({ tool_input: { command } });
      expect(blocked.status, command).toBe(2);
      expect(blocked.stderr, command).toContain("PR close/reopen");
    }
    for (const command of [
      "gh pr view 189 --json state,headRefOid",
      "gh pr checks 189",
      "npx --no-install tsx src/cli.ts github pr-merge-reviewed --pr 189 --receipt /tmp/r",
    ]) {
      expect(containsDirectGithubPrLifecycleMutation(command), command).toBe(false);
    }
  });
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
      "git reset HEAD src/cli.ts",
      "git reset -- src/cli.ts",
      "git restore --staged src/cli.ts",
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
    }
    expect(
      evaluateGitCommandGuard({
        command: "git checkout main",
        checkoutTargetContext: { resolution: "refs-only" },
      }).decision,
    ).toBe("pass");
  });

  it("U-GITGUARD-015: checkout pathspecをblockし、ref-only checkoutだけを許可する", () => {
    const fixture = createWorktreeFixture();
    try {
      for (const command of [
        "git checkout .",
        "git checkout base.txt",
        "git checkout HEAD base.txt",
        "git checkout missing-target",
      ]) {
        const result = runCliGuard({ tool_input: { command } }, fixture.root);
        expect(result.status, command).toBe(2);
        expect(result.stderr, command).toContain("git checkout");
      }

      expect(
        runCliGuard({ tool_input: { command: "git checkout main" } }, fixture.linked).status,
      ).toBe(0);
      expect(
        runCliGuard({ tool_input: { command: "git checkout -b feature/new" } }, fixture.linked)
          .status,
      ).toBe(0);

      writeFileSync(join(fixture.root, "feature"), "branch/path ambiguity\n");
      const ambiguous = runCliGuard(
        { tool_input: { command: "git checkout feature" } },
        fixture.root,
      );
      expect(ambiguous.status).toBe(2);
    } finally {
      fixture.cleanup();
    }
  });

  it("U-GITGUARD-011: contextual mutationはcontext無しでfail-closeしread-only inspectionだけを通す", () => {
    for (const command of [
      "git merge --no-commit feature",
      "git rebase main",
      "git cherry-pick HEAD~1",
      "git stash pop",
      "git stash apply stash@{0}",
      "git am patch.mbox",
      "git apply patch.diff",
      "git --namespace=helix merge feature",
      "git -p merge feature",
      "git --no-optional-locks merge feature",
    ]) {
      const result = evaluateGitCommandGuard({ command });
      expect(result.decision, command).toBe("block");
      expect(result.reason, command).toBe("mutation-context-required");
    }
    expect(evaluateGitCommandGuard({ command: "git -c alias.m=merge m feature" })).toMatchObject({
      decision: "block",
      reason: "destructive-git",
      destructiveOperation: "git alias override",
    });
    for (const command of [
      "git merge --help",
      "git rebase --show-current-patch",
      "git cherry-pick --help",
      "git am --show-current-patch",
      "git apply --check patch.diff",
      "git apply --stat patch.diff",
      "git apply --numstat patch.diff",
      "git apply --summary patch.diff",
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
    }
  });

  it("U-GITGUARD-012: shared-root foreign dirtyを全contextual mutationでblockする", () => {
    const commands = [
      "git merge --no-commit feature",
      "git rebase main",
      "git cherry-pick HEAD~1",
      "git stash pop",
      "git stash apply stash@{0}",
      "git am patch.mbox",
      "git apply patch.diff",
    ];
    for (const command of commands) {
      expect(
        evaluateGitCommandGuard({
          command,
          mutationContext: { worktreeIdentity: "shared-root", foreignUncommittedCount: 1 },
        }).decision,
        command,
      ).toBe("block");
    }
  });

  it("U-GITGUARD-013: clean shared rootとlinked worktreeではcontextual mutationを通す", () => {
    const commands = [
      "git merge --no-commit feature",
      "git rebase main",
      "git cherry-pick HEAD~1",
      "git stash pop",
      "git stash apply stash@{0}",
      "git am patch.mbox",
      "git apply patch.diff",
    ];
    for (const command of commands) {
      expect(
        evaluateGitCommandGuard({
          command,
          mutationContext: { worktreeIdentity: "shared-root", foreignUncommittedCount: 0 },
        }).decision,
        command,
      ).toBe("pass");
      expect(
        evaluateGitCommandGuard({
          command,
          mutationContext: { worktreeIdentity: "linked-worktree", foreignUncommittedCount: null },
        }).decision,
        command,
      ).toBe("pass");
    }
  });

  it("U-GITGUARD-014: unknown worktree identityとdirty count欠落をsafeへ縮退しない", () => {
    for (const mutationContext of [
      { worktreeIdentity: "unknown", foreignUncommittedCount: null },
      { worktreeIdentity: "shared-root", foreignUncommittedCount: null },
    ] as const) {
      const result = evaluateGitCommandGuard({
        command: "git merge --no-commit feature",
        mutationContext,
      });
      expect(result.decision).toBe("block");
      expect(result.reason).toBe("mutation-context-unresolved");
    }
  });

  // IT-GITGUARD-006: clean primary／linked worktree allowも同じ実repository fixtureで検証する。
  it("IT-GITGUARD-005/006: 非重複foreign dirtyのshared rootをblockしclean rootとlinked worktreeを通す", () => {
    const fixture = createWorktreeFixture();
    try {
      const input = {
        session_id: "s-shared-root",
        tool_input: { command: "git merge --no-commit --no-ff feature" },
      };
      writeFileSync(join(fixture.root, "foreign-unrelated.txt"), "foreign\n");
      const blocked = runHook(input, fixture.root);
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("shared root");
      expect(blocked.stderr).toContain("foreign uncommitted");

      const explicitShared = runHook(
        {
          ...input,
          tool_input: {
            command: `git -C ${fixture.root} merge --no-commit --no-ff feature`,
          },
        },
        fixture.linked,
        fixture.root,
      );
      expect(explicitShared.status).toBe(2);
      expect(explicitShared.stderr).toContain("shared root");

      const explicitLinked = runHook(
        {
          ...input,
          tool_input: {
            command: `git -C ${fixture.linked} merge --no-commit --no-ff feature`,
          },
        },
        fixture.root,
      );
      expect(explicitLinked.status).toBe(0);

      const declaredLinked = runHook(
        {
          ...input,
          tool_input: {
            command: "git merge --no-commit --no-ff feature",
            workdir: fixture.linked,
          },
        },
        fixture.root,
      );
      expect(declaredLinked.status).toBe(0);

      const unresolvedGitDir = runHook(
        {
          ...input,
          tool_input: {
            command: `git --git-dir=${join(fixture.root, ".git")} merge --no-commit feature`,
          },
        },
        fixture.linked,
        fixture.root,
      );
      expect(unresolvedGitDir.status).toBe(2);
      expect(unresolvedGitDir.stderr).toContain("identity");

      rmSync(join(fixture.root, "foreign-unrelated.txt"));
      expect(runHook(input, fixture.root).status).toBe(0);
      expect(runHook(input, fixture.linked, fixture.root).status).toBe(0);
      expect(runHook(input, fixture.linked).status).toBe(0);
    } finally {
      fixture.cleanup();
    }
  });

  it("U-GITGUARD-014/015: cwd resetを実効cwdで検出しsession touched dirtyはforeign扱いしない", () => {
    const fixture = createWorktreeFixture();
    try {
      const sessionId = "s-cwd-reset";
      const dirty = join(fixture.root, "owned-uncommitted.txt");
      writeFileSync(dirty, "owned\n");
      mkdirSync(join(fixture.root, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(fixture.root, ".helix", "logs", "session", `${sessionId}.jsonl`),
        `${JSON.stringify({ target: `Write ${dirty}` })}\n`,
      );
      const input = {
        session_id: sessionId,
        tool_input: { command: "git merge --no-commit --no-ff feature" },
      };
      expect(runHook(input, fixture.root).status).toBe(0);

      writeFileSync(join(fixture.root, "foreign-after-reset.txt"), "foreign\n");
      const resetToSharedRoot = runHook(input, fixture.root, fixture.root);
      expect(resetToSharedRoot.status).toBe(2);
      expect(resetToSharedRoot.stderr).toContain("shared root");
    } finally {
      fixture.cleanup();
    }
  });

  it("IT-GITGUARD-007: shared-root mutation overrideは既存DB transactionでone-shotになる", () => {
    const fixture = createWorktreeFixture();
    try {
      writeFileSync(join(fixture.root, "foreign.txt"), "foreign\n");
      const markerPath = join(fixture.root, ".helix", "state", "destructive-git-override");
      mkdirSync(join(fixture.root, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed shared-root recovery");
      const input = {
        session_id: "s-shared-override",
        tool_input: { command: "git merge --no-commit --no-ff feature" },
      };
      expect(runHook(input, fixture.root).status).toBe(0);
      expect(existsSync(markerPath)).toBe(false);
      expect(overrideRows(fixture.root)).toHaveLength(1);
      expect(overrideRows(fixture.root)[0]).toMatchObject({
        guard_kind: "git",
        operation_class: "git merge",
        status: "committed",
      });
      const second = runHook(input, fixture.root);
      expect(second.status).toBe(2);
    } finally {
      fixture.cleanup();
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
    ])
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
    for (const command of [
      "git clean -nfd",
      "git clean --dry-run",
      "git branch -d merged",
      "git stash list",
      "git stash show",
    ])
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] fails closed on incomplete shell grammar", () => {
    for (const command of ["git clean '-f", 'git stash "clear', `bash -c "git clean '-f"`]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] does not treat string arguments as commands", () => {
    for (const command of [
      `echo "git reset --hard"`,
      `printf '%s' 'git clean -f'`,
      `rg 'git stash clear' docs`,
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("pass");
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] preserves blocking across supported shell and global-option transformations", () => {
    for (const command of [
      "echo ok\ngit clean -f",
      "env -i git clean -f",
      "env -u HOME git clean -f",
      "command -- git clean -f",
      "(git clean -f)",
      "git --no-pager clean -f",
      "git --paginate stash clear",
      "git -cfoo.bar=baz clean -f",
      "echo `git clean -f`",
    ]) {
      expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] preserves the block invariant for generated seed transformations", () => {
    const seeds = [
      "clean -f",
      "branch -D feature",
      "stash clear",
      "reset --hard HEAD",
      "restore src/cli.ts",
      "push --force origin main",
    ];
    const globalOptions = ["", "--no-pager ", "-cfoo.bar=baz ", "-C repo "];
    const wrap = (gitCommand: string) => [
      gitCommand,
      `env -i ${gitCommand}`,
      `command -- ${gitCommand}`,
      `echo safe; ${gitCommand}`,
      `bash -c '${gitCommand}'`,
      `echo $(${gitCommand})`,
      `echo \`${gitCommand}\``,
      `(${gitCommand})`,
    ];
    let generated = 0;
    for (const seed of seeds) {
      for (const option of globalOptions) {
        for (const command of wrap(`git ${option}${seed}`)) {
          generated += 1;
          expect(evaluateGitCommandGuard({ command }).decision, command).toBe("block");
        }
      }
    }
    expect(generated).toBe(seeds.length * globalOptions.length * 8);
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-003] fails closed on incomplete backtick substitution", () => {
    expect(evaluateGitCommandGuard({ command: "echo `git clean -f" }).decision).toBe("block");
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

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-005/IT-GITGUARD-004] audits env override as a virtual one-shot capability", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-env-"));
    try {
      const input = { session_id: "s-env", tool_input: { command: "git clean -f" } };
      const run = () =>
        spawnSync(process.execPath, [CLI_BUNDLE_PATH, "hook", "git-command-guard"], {
          cwd,
          encoding: "utf8",
          env: { ...process.env, HELIX_ALLOW_DESTRUCTIVE_GIT: "1" },
          input: JSON.stringify(input),
        });
      expect(run().status).toBe(0);
      const second = run();
      expect(second.status).toBe(2);
      expect(second.stderr).toContain("blocked_reuse");
      const rows = overrideRows(cwd);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ guard_kind: "git", status: "committed" });
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-GITGUARD-002: exposes a blocking CLI hook surface", () => {
    const blocked = runCliGuard({ tool_input: { command: "git reset --hard HEAD" } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("BLOCK");

    const pass = runCliGuard({ tool_input: { command: "git status --short" } });
    expect(pass.status).toBe(0);
    expect(pass.stdout).toContain("git-command-guard: pass");
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-007] dev adapter fails closed on malformed stdin", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-malformed-"));
    try {
      const result = spawnSync(process.execPath, [HOOK_BUNDLE_PATH], {
        cwd,
        encoding: "utf8",
        env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
        input: "{not-json",
      });
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("BLOCK");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
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
      const rows = overrideRows(cwd);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        guard_kind: "git",
        operation_class: "git reset",
        status: "committed",
      });
      expect(String(rows[0]?.reason_digest)).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(JSON.stringify(rows)).not.toContain("manual recovery after log/reflog review");

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
        mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
        mkdirSync(join(cwd, ".helix", "harness.db"), { recursive: true });
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

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-008/IT-GITGUARD-001] allows at most one of two competing processes", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-cas-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed concurrent recovery");
      const initialized = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
      migrate(initialized);
      initialized.close();
      const input = JSON.stringify({
        session_id: "s-cas",
        tool_input: { command: "git clean -f" },
      });
      const barrierDir = join(cwd, ".helix", "tmp", "guard-cas-barrier");
      const startWorker = () => {
        const child = spawn(process.execPath, [CLI_BUNDLE_PATH, "hook", "git-command-guard"], {
          cwd,
          stdio: ["pipe", "ignore", "pipe"],
          env: {
            ...process.env,
            NODE_ENV: "test",
            HELIX_GUARD_TEST_BARRIER_DIR: barrierDir,
          },
        });
        let stderr = "";
        child.stderr.on("data", (chunk) => {
          stderr += String(chunk);
        });
        return {
          child,
          completed: new Promise<{ status: number | null; stderr: string }>((resolve) =>
            child.once("close", (status) => resolve({ status, stderr })),
          ),
        };
      };
      const workers = [startWorker(), startWorker()];
      for (const worker of workers) worker.child.stdin.end(input);
      const outcomes = await Promise.all(workers.map((worker) => worker.completed));
      expect(outcomes.filter(({ status }) => status === 0)).toHaveLength(1);
      const blocked = outcomes.filter(({ status }) => status === 2);
      expect(blocked).toHaveLength(1);
      expect(blocked[0]?.stderr).toContain("blocked_reuse");
      expect(overrideRows(cwd)).toHaveLength(1);
      expect(existsSync(markerPath)).toBe(false);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/IT-GITGUARD-004] stores no raw secret, PII, command, or absolute path bytes", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-redaction-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      const reason = "recovery approved by alice@example.com";
      const absolutePath = "/home/alice/private-project";
      const secret = "private-token-value-123456789";
      const command = `git clean -f ${absolutePath}/${secret}`;
      writeFileSync(markerPath, reason);
      const result = runCliGuard({ session_id: "s-redact", tool_input: { command } }, cwd);
      expect(result.status).toBe(0);
      const bytes = readFileSync(join(cwd, ".helix", "harness.db")).toString("utf8");
      for (const raw of [reason, "alice@example.com", absolutePath, secret, command]) {
        expect(bytes, raw).not.toContain(raw);
      }
      expect(overrideRows(cwd)[0]).toMatchObject({ guard_kind: "git", status: "committed" });
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-009/IT-GITGUARD-003] blocks restart reuse after audit reservation", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-restart-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed crash recovery");
      const markerStat = statSync(markerPath);
      const nonce = `sha256:${createHash("sha256")
        .update(`${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:reviewed crash recovery`)
        .digest("hex")}`;
      const db = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
      migrate(db);
      db.prepare(`INSERT INTO guard_override_transactions
        (nonce, guard_kind, operation_class, subject_digest, reason_digest, status, created_at)
        VALUES (?, 'git', 'git clean --force', ?, ?, 'committed', ?)`).run(
        nonce,
        `sha256:${"0".repeat(64)}`,
        `sha256:${"1".repeat(64)}`,
        new Date().toISOString(),
      );
      db.close();
      const result = runCliGuard({ tool_input: { command: "git clean -f" } }, cwd);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("blocked_reuse");
      expect(existsSync(markerPath)).toBe(true);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it.skipIf(process.platform === "win32")(
    "[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-009/IT-GITGUARD-003] blocks restart after a real process crash between commit and consume",
    async () => {
      const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-real-crash-"));
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      try {
        mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
        writeFileSync(markerPath, "reviewed crash recovery");
        const input = JSON.stringify({
          session_id: "s-real-crash",
          tool_input: { command: "git clean -f" },
        });
        const child = spawn(process.execPath, [CLI_BUNDLE_PATH, "hook", "git-command-guard"], {
          cwd,
          stdio: ["pipe", "ignore", "ignore"],
          env: {
            ...process.env,
            NODE_ENV: "test",
            HELIX_GUARD_TEST_FAULT: "pause_after_audit",
          },
        });
        child.stdin.end(input);
        let committed = false;
        for (let attempt = 0; attempt < 200 && !committed; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          try {
            committed = overrideRows(cwd).length === 1;
          } catch {}
        }
        expect(committed).toBe(true);
        child.kill("SIGKILL");
        await new Promise((resolve) => child.once("close", resolve));
        expect(existsSync(markerPath)).toBe(true);
        const restarted = runCliGuard(JSON.parse(input), cwd);
        expect(restarted.status).toBe(2);
        expect(restarted.stderr).toContain("blocked_reuse");
        expect(existsSync(markerPath)).toBe(true);
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    },
    15_000,
  );

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-009/IT-GITGUARD-002] fails closed on corrupt transaction store", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-torn-"));
    try {
      const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed recovery");
      writeFileSync(join(cwd, ".helix", "harness.db"), "not-a-sqlite-database");
      const result = runCliGuard({ tool_input: { command: "git clean -f" } }, cwd);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("blocked_audit_failure");
      expect(existsSync(markerPath)).toBe(true);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006/009/IT-GITGUARD-002] retains marker after real SQLite commit contention and retries after rollback", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-db-lock-"));
    const markerPath = join(cwd, ".helix", "state", "destructive-git-override");
    let lockDb: ReturnType<typeof openHarnessDb> | null = null;
    try {
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed recovery after DB contention");
      lockDb = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
      migrate(lockDb);
      lockDb.exec("BEGIN IMMEDIATE");
      const input = { session_id: "s-lock", tool_input: { command: "git clean -f" } };
      const blocked = runCliGuard(input, cwd);
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("blocked_audit_failure");
      expect(existsSync(markerPath)).toBe(true);
      lockDb.exec("ROLLBACK");
      lockDb.close();
      lockDb = null;
      const retried = runCliGuard(input, cwd);
      expect(retried.status).toBe(0);
      expect(existsSync(markerPath)).toBe(false);
      expect(overrideRows(cwd)).toHaveLength(1);
    } finally {
      if (lockDb) {
        try {
          lockDb.exec("ROLLBACK");
        } catch {}
        lockDb.close();
      }
      rmSync(cwd, { recursive: true, force: true });
    }
  }, 45_000);

  it.skipIf(process.platform === "win32" || (process.getuid?.() ?? 0) === 0)(
    "[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006] fails closed when the real marker cannot be removed",
    () => {
      const cwd = mkdtempSync(join(tmpdir(), "helix-gitguard-marker-permission-"));
      const stateDir = join(cwd, ".helix", "state");
      const markerPath = join(stateDir, "destructive-git-override");
      try {
        mkdirSync(stateDir, { recursive: true });
        writeFileSync(markerPath, "reviewed recovery with protected marker");
        chmodSync(stateDir, 0o500);
        const result = runCliGuard(
          { session_id: "s-permission", tool_input: { command: "git clean -f" } },
          cwd,
        );
        expect(result.status).toBe(2);
        expect(result.stderr).toContain("blocked_consume_failure");
        expect(existsSync(markerPath)).toBe(true);
        expect(overrideRows(cwd)[0]).toMatchObject({ status: "consume_failed" });
      } finally {
        chmodSync(stateDir, 0o700);
        rmSync(cwd, { recursive: true, force: true });
      }
    },
  );

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
