import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateWorkGuard,
  evaluateWorkGuardTargets,
  extractEditTargets,
  extractShellWriteTargets,
  normalizeRepoRelative,
  resolveForeignEditOverride,
} from "../src/runtime/work-guard";
import { runWorkGuardHook as runWorkGuardCore } from "../src/runtime/work-guard-hook";
import {
  foreignUncommittedFiles,
  gitUncommittedFiles,
  normalizeSessionTarget,
  sessionTouchedFiles,
} from "../src/runtime/worktree-state";
import { defaultHarnessDbPath, openHarnessDb } from "../src/state-db";

const hookRepoRoot = process.cwd();
const workGuardHook = join(hookRepoRoot, ".claude", "hooks", "work-guard.ts");
const cliPath = join(hookRepoRoot, "src", "cli.ts");

// PLAN-L7-691-shared-root-git-mutation-guard / U-GITGUARD-015
// PLAN-RECOVERY-1566-worktree-path-identity / U-WORKPATH-001..006

/** work-guard hook を temp repo の cwd で spawn する (win32 は System32 canonical な cmd 経由)。 */
function runWorkGuardHook(cwd: string, input: unknown) {
  const stdin = JSON.stringify(input);
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "node", workGuardHook], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
      input: stdin,
    });
  }
  return spawnSync("npx", ["--prefix", hookRepoRoot, "--no-install", "tsx", workGuardHook], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
    input: stdin,
  });
}

describe("work guard (PLAN-L7-114) — 作業衝突ガードレール", () => {
  it("U-WORKPATH-001: Gitの日本語・空白・nested pathをexact集合として保つ", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workpath-exact-"));
    const paths = ["日本語.txt", "space name.txt", "nested/child.txt"];
    if (process.platform !== "win32") paths.push("report ", "line\nbreak", "a -> b", "a\\b");
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd, stdio: "ignore" });
      mkdirSync(join(cwd, "nested"));
      for (const path of paths) writeFileSync(join(cwd, path), "foreign\n");
      expect(gitUncommittedFiles(cwd).sort()).toEqual([...paths].sort());
      for (const path of paths) {
        expect(
          runWorkGuardCore({
            repoRoot: cwd,
            rawInput: JSON.stringify({ session_id: "s-path", tool_input: { file_path: path } }),
            env: {},
          }).exitCode,
        ).toBe(2);
      }
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-WORKPATH-002: 別POSIX pathのtouchをforeign targetの所有権へ流用しない", () => {
    const root = "/fixture/repo";
    for (const [foreign, own] of [
      ["report ", "report"],
      ["a\\b", "a/b"],
      ["/fixture/repo/x.ts", "/other/fixture/repo/x.ts"],
    ]) {
      const target = normalizeRepoRelative(foreign, root);
      const touched = normalizeRepoRelative(own, root);
      expect(target).not.toBe(touched);
      expect(
        evaluateWorkGuard({
          targetPath: target,
          uncommittedFiles: [target],
          sessionTouchedFiles: [touched],
          bypass: false,
        }).decision,
      ).toBe("block");
    }
  });

  it("U-WORKPATH-003: renameの移動元・移動先と削除pathを保持する", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workpath-rename-"));
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd, stdio: "ignore" });
      writeFileSync(join(cwd, "旧名.txt"), "rename\n");
      writeFileSync(join(cwd, "deleted.txt"), "delete\n");
      execFileSync("git", ["add", "旧名.txt", "deleted.txt"], { cwd });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX Test",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-m",
          "test: seed",
        ],
        { cwd, stdio: "ignore" },
      );
      execFileSync("git", ["mv", "旧名.txt", "新名.txt"], { cwd });
      execFileSync("git", ["rm", "deleted.txt"], { cwd, stdio: "ignore" });
      expect(gitUncommittedFiles(cwd).sort()).toEqual(
        ["deleted.txt", "旧名.txt", "新名.txt"].sort(),
      );
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-WORKPATH-004: 通常pathと旧session prefixを別の入力境界として扱う", () => {
    const root = "/fixture/repo";
    expect(normalizeRepoRelative("Write /fixture/repo/x", root)).toBe("Write /fixture/repo/x");
    expect(normalizeSessionTarget("Write /fixture/repo/x", root)).toBe("x");
    expect(normalizeSessionTarget("untrusted /fixture/repo/x", root)).not.toBe("x");
    expect(normalizeRepoRelative("/fixture/REPO/x", root)).not.toBe("x");
    expect(extractEditTargets({ file_path: "report " })).toEqual(["report "]);
  });

  it("U-WORKPATH-005: 対象worktreeのdirtyとtouchだけで所有権を評価する", () => {
    const base = mkdtempSync(join(tmpdir(), "helix-workpath-linked-"));
    const root = join(base, "root");
    const linked = join(base, "linked");
    mkdirSync(root);
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd: root, stdio: "ignore" });
      writeFileSync(join(root, ".gitignore"), ".helix/\n");
      writeFileSync(join(root, "same.txt"), "base\n");
      execFileSync("git", ["add", ".gitignore", "same.txt"], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX Test",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-m",
          "test: seed",
        ],
        { cwd: root, stdio: "ignore" },
      );
      execFileSync("git", ["worktree", "add", "--detach", linked, "HEAD"], {
        cwd: root,
        stdio: "ignore",
      });
      const run = (filePath: string, workdir: string) =>
        runWorkGuardCore({
          repoRoot: root,
          rawInput: JSON.stringify({
            session_id: "s-linked",
            tool_input: { file_path: filePath, workdir },
          }),
          env: {},
        });
      writeFileSync(join(root, "same.txt"), "main foreign\n");
      expect(run("same.txt", linked).exitCode).toBe(0);
      const runCli = () =>
        spawnSync(
          "npx",
          [
            "--prefix",
            hookRepoRoot,
            "--no-install",
            "tsx",
            cliPath,
            "guard",
            "preflight",
            "--target",
            join(linked, "same.txt"),
            "--session",
            "s-linked",
            "--acknowledge-hook-non-enforcement",
            "--json",
          ],
          { cwd: root, encoding: "utf8" },
        );
      const cleanCli = runCli();
      expect(cleanCli.status, cleanCli.stderr).toBe(0);
      expect(JSON.parse(cleanCli.stdout).apiToolPathEnforced).toBe(false);
      writeFileSync(join(linked, "same.txt"), "linked foreign\n");
      mkdirSync(join(root, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(root, ".helix", "logs", "session", "s-linked.jsonl"),
        `${JSON.stringify({ target: `Write ${join(root, "same.txt")}` })}\n`,
      );
      expect(run(join(linked, "same.txt"), root).exitCode).toBe(2);
      const foreignCli = runCli();
      expect(foreignCli.status, foreignCli.stderr).toBe(2);
      expect(JSON.parse(foreignCli.stdout).reason).toBe("foreign-uncommitted");
      writeFileSync(
        join(root, ".helix", "logs", "session", "s-linked.jsonl"),
        `${JSON.stringify({ target: `Write ${join(linked, "same.txt")}` })}\n`,
      );
      expect(run("same.txt", linked).exitCode).toBe(0);
      writeFileSync(
        join(root, ".helix", "logs", "session", "s-linked.jsonl"),
        `${JSON.stringify({ target: "Write same.txt" })}\n`,
      );
      expect(run("same.txt", linked).exitCode).toBe(2);
      mkdirSync(join(linked, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(linked, ".helix", "logs", "session", "s-linked.jsonl"),
        `${JSON.stringify({ target: `Write ${join(linked, "same.txt")}` })}\n`,
      );
      expect(run("same.txt", linked).exitCode).toBe(0);
      expect(run(join(base, "outside.txt"), root).exitCode).toBe(2);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("U-WORKPATH-006: symlink後の親参照を別のclean fileへ丸めない", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workpath-parent-"));
    const rootAlias = `${cwd}-root-alias`;
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd, stdio: "ignore" });
      writeFileSync(join(cwd, "victim.txt"), "clean\n");
      execFileSync("git", ["add", "victim.txt"], { cwd });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX Test",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-m",
          "test: seed",
        ],
        { cwd, stdio: "ignore" },
      );
      mkdirSync(join(cwd, "nested", "deeper"), { recursive: true });
      writeFileSync(join(cwd, "nested", "victim.txt"), "foreign\n");
      symlinkSync(
        join(cwd, "nested", "deeper"),
        join(cwd, "alias"),
        process.platform === "win32" ? "junction" : "dir",
      );
      const run = (target: string) =>
        runWorkGuardCore({
          repoRoot: cwd,
          rawInput: JSON.stringify({ session_id: "s-parent", tool_input: { file_path: target } }),
          env: {},
        });
      expect(run("victim.txt").exitCode).toBe(0);
      expect(run("nested/../victim.txt").exitCode).toBe(0);
      expect(run("alias/../victim.txt").exitCode).toBe(2);
      symlinkSync(cwd, rootAlias, process.platform === "win32" ? "junction" : "dir");
      expect(run(join(rootAlias, "victim.txt")).exitCode).toBe(0);
      expect(
        runWorkGuardCore({
          repoRoot: rootAlias,
          rawInput: JSON.stringify({
            session_id: "s-parent",
            tool_input: { file_path: join(rootAlias, "victim.txt") },
          }),
          env: {},
        }).exitCode,
      ).toBe(0);
      expect(run(`${rootAlias}/alias/../victim.txt`).exitCode).toBe(2);
      writeFileSync(join(cwd, "victim.txt"), "foreign edit\n");
      expect(run(join(rootAlias, "victim.txt")).exitCode).toBe(2);
    } finally {
      rmSync(rootAlias, { recursive: true, force: true });
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-GITGUARD-015: Git guardとwork-guardが同じdirty／session touched sourceを使う", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-worktree-state-source-"));
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd });
      writeFileSync(join(cwd, ".gitignore"), ".helix/\n");
      writeFileSync(join(cwd, "tracked.txt"), "base\n");
      execFileSync("git", ["add", ".gitignore", "tracked.txt"], { cwd });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX Test",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-m",
          "test: seed",
        ],
        { cwd },
      );
      writeFileSync(join(cwd, "owned.txt"), "owned\n");
      writeFileSync(join(cwd, "foreign.txt"), "foreign\n");
      mkdirSync(join(cwd, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(cwd, ".helix", "logs", "session", "s-source.jsonl"),
        `${JSON.stringify({ target: `Write ${join(cwd, "owned.txt")}` })}\n`,
      );
      expect(gitUncommittedFiles(cwd).sort()).toEqual(["foreign.txt", "owned.txt"]);
      expect(sessionTouchedFiles(cwd, "s-source")).toContain("owned.txt");
      expect(foreignUncommittedFiles(cwd, "s-source")).toEqual(["foreign.txt"]);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("blocks editing an uncommitted file this session never touched (他ランタイムの in-flight)", () => {
    const result = evaluateWorkGuard({
      targetPath: "src/plan/lint.ts",
      uncommittedFiles: ["src/plan/lint.ts", "src/feedback/surface.ts"],
      sessionTouchedFiles: ["src/feedback/surface.ts"],
      bypass: false,
    });
    expect(result.decision).toBe("block");
    expect(result.reason).toBe("foreign-uncommitted");
    expect(result.message).toContain("src/plan/lint.ts");
  });

  it("passes editing a file this session already touched (自分の作業の継続)", () => {
    const result = evaluateWorkGuard({
      targetPath: "src/feedback/surface.ts",
      uncommittedFiles: ["src/feedback/surface.ts"],
      sessionTouchedFiles: ["src/feedback/surface.ts"],
      bypass: false,
    });
    expect(result.decision).toBe("pass");
    expect(result.reason).toBe("clean-or-own");
  });

  it("passes editing a clean (committed) file not in the uncommitted set", () => {
    const result = evaluateWorkGuard({
      targetPath: "src/cli.ts",
      uncommittedFiles: ["src/plan/lint.ts"],
      sessionTouchedFiles: [],
      bypass: false,
    });
    expect(result.decision).toBe("pass");
  });

  it("passes a foreign uncommitted file only when override is set (+evidence)", () => {
    const base = {
      targetPath: "src/plan/lint.ts",
      uncommittedFiles: ["src/plan/lint.ts"],
      sessionTouchedFiles: [],
    };
    expect(evaluateWorkGuard({ ...base, bypass: false }).decision).toBe("block");
    expect(evaluateWorkGuard({ ...base, bypass: true }).decision).toBe("pass");
    expect(evaluateWorkGuard({ ...base, bypass: true }).reason).toBe("bypass");
  });

  it("passes when there is no target path (fail-open, not our concern)", () => {
    expect(
      evaluateWorkGuard({
        targetPath: "",
        uncommittedFiles: ["src/plan/lint.ts"],
        sessionTouchedFiles: [],
        bypass: false,
      }).decision,
    ).toBe("pass");
  });

  it("normalizes Windows absolute paths and backslashes to repo-relative", () => {
    const repoRoot = "C:\\Users\\dev\\HELIX-HARNESS";
    expect(
      normalizeRepoRelative("C:\\Users\\dev\\HELIX-HARNESS\\src\\plan\\lint.ts", repoRoot),
    ).toBe("src/plan/lint.ts");
    expect(normalizeRepoRelative("./src/feedback/surface.ts", repoRoot)).toBe(
      "src/feedback/surface.ts",
    );
    expect(normalizeRepoRelative("src/cli.ts", repoRoot)).toBe("src/cli.ts");
    // 旧tool prefixの読取互換はsession adapterだけに残す。
    expect(
      normalizeSessionTarget(
        "Write C:\\Users\\dev\\HELIX-HARNESS\\src\\runtime\\attempt-escalation.ts",
        repoRoot,
      ),
    ).toBe("src/runtime/attempt-escalation.ts");
  });

  it("blocks the real collision shape from this session (Codex's surface.ts vs my plan/lint.ts)", () => {
    // 実際に起きた衝突: Codex が触っていた src/plan/lint.ts を私が未 touch のまま編集しようとする。
    const repoRoot = "C:/repo";
    const target = normalizeRepoRelative("C:/repo/src/plan/lint.ts", repoRoot);
    const result = evaluateWorkGuard({
      targetPath: target,
      uncommittedFiles: ["src/plan/lint.ts", "tests/plan-lint.test.ts"],
      sessionTouchedFiles: ["CLAUDE.md", "AGENTS.md", "src/cli.ts"],
      bypass: false,
    });
    expect(result.decision).toBe("block");
  });

  it("blocks a multi-target preflight when any target is foreign-uncommitted", () => {
    const result = evaluateWorkGuardTargets({
      targetPaths: ["src/own.ts", "src/foreign.ts", "src/clean.ts"],
      uncommittedFiles: ["src/own.ts", "src/foreign.ts"],
      sessionTouchedFiles: ["src/own.ts"],
      bypass: false,
    });
    expect(result.decision).toBe("block");
    expect(result.blocked?.targetPath).toBe("src/foreign.ts");
  });

  it("passes a no-target preflight so hosted callers can dry-run safely", () => {
    const result = evaluateWorkGuardTargets({
      targetPaths: [],
      uncommittedFiles: ["src/foreign.ts"],
      sessionTouchedFiles: [],
      bypass: false,
    });
    expect(result.decision).toBe("pass");
    expect(result.reason).toBe("no-target");
  });
});

describe("extractEditTargets (PLAN-L7-139) — Codex apply_patch / Claude file_path 両対応", () => {
  it("Claude Edit/Write/MultiEdit の tool_input.file_path を返す", () => {
    expect(extractEditTargets({ file_path: "src/cli.ts" })).toEqual(["src/cli.ts"]);
  });

  it("tool_input.path (Codex write_file) を返す", () => {
    expect(extractEditTargets({ path: "src/x.ts" })).toEqual(["src/x.ts"]);
  });

  it("apply_patch の patch 本文から全ファイルパスを抽出する (複数ファイル: Update/Add/Delete)", () => {
    // 偽パリティ回帰: file_path を持たない apply_patch でガードが no-op しないことの substance test。
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/a.ts",
      "@@ def x():",
      "-old",
      "+new",
      "*** Add File: src/b.ts",
      "+hello",
      "*** Delete File: src/c.ts",
      "*** End Patch",
    ].join("\n");
    expect([...extractEditTargets({ input: patch })].sort()).toEqual(
      ["src/a.ts", "src/b.ts", "src/c.ts"].sort(),
    );
  });

  it("apply_patch が command 配列形 ({command:['apply_patch', <patch>]}) でも抽出する", () => {
    const patch = "*** Begin Patch\n*** Update File: src/d.ts\n@@\n+x\n*** End Patch";
    expect(extractEditTargets({ command: ["apply_patch", patch] })).toEqual(["src/d.ts"]);
  });

  it("rename (Update File + Move to) の移動元・移動先を両方とも抽出する", () => {
    const patch =
      "*** Begin Patch\n*** Update File: old/x.ts\n*** Move to: new/x.ts\n*** End Patch";
    expect([...extractEditTargets({ input: patch })].sort()).toEqual(
      ["new/x.ts", "old/x.ts"].sort(),
    );
  });

  it("file_path がある時は content 本文の apply_patch 例文を誤抽出しない (false-block 防止)", () => {
    const docContent = "Example: *** Update File: docs/example.md\n+text";
    expect(extractEditTargets({ file_path: "docs/guide.md", content: docContent })).toEqual([
      "docs/guide.md",
    ]);
  });

  it("file_path も patch も無い入力は空配列 (no-target fail-open)", () => {
    expect(extractEditTargets({ command: "ls -la" })).toEqual([]);
    expect(extractEditTargets(null)).toEqual([]);
    expect(extractEditTargets("just a string")).toEqual([]);
    expect(extractEditTargets(undefined)).toEqual([]);
  });
});

describe("S3 Bash write target extraction", () => {
  it("extracts common overwrite, move, delete, tee and redirect targets", () => {
    expect(extractShellWriteTargets("sed -i s/a/b/ foreign.ts")).toContain("foreign.ts");
    expect(extractShellWriteTargets("cp source.ts foreign.ts")).toContain("foreign.ts");
    expect(extractShellWriteTargets("mv source.ts foreign.ts")).toContain("foreign.ts");
    expect(extractShellWriteTargets("rm -f foreign.ts")).toContain("foreign.ts");
    expect(extractShellWriteTargets("printf x > foreign.ts")).toContain("foreign.ts");
    expect(extractShellWriteTargets("printf x | tee foreign.ts")).toContain("foreign.ts");
  });
});

describe("foreign-edit override resolution (PLAN-L7-114 correction)", () => {
  it("bypasses via env HELIX_ALLOW_FOREIGN_EDIT=1", () => {
    const r = resolveForeignEditOverride({ env: "1" });
    expect(r.bypass).toBe(true);
    expect(r.source).toBe("env");
  });

  it("bypasses via a marker file with a non-empty reason (agent-accessible)", () => {
    const r = resolveForeignEditOverride({
      markerReason: "completing Codex orphan-impl per review",
    });
    expect(r.bypass).toBe(true);
    expect(r.source).toBe("marker");
    expect(r.reason).toBe("completing Codex orphan-impl per review");
  });

  it("does NOT bypass on an empty/whitespace marker (no silent bypass without a reason)", () => {
    expect(resolveForeignEditOverride({ markerReason: "   \n" }).bypass).toBe(false);
    expect(resolveForeignEditOverride({ markerReason: null }).bypass).toBe(false);
    expect(resolveForeignEditOverride({}).source).toBe("none");
  });

  it("prefers env over marker as the source when both are present", () => {
    const r = resolveForeignEditOverride({ env: "1", markerReason: "marker reason" });
    expect(r.source).toBe("env");
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-007/IT-GITGUARD-004] audits env bypass once per session and subject", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workguard-env-"));
    try {
      execFileSync("git", ["init"], { cwd, stdio: "ignore" });
      const foreignTarget = "alice@example.com-private.ts";
      writeFileSync(join(cwd, foreignTarget), "export const x = 1;\n");
      const rawInput = JSON.stringify({
        session_id: "s-env",
        tool_input: { file_path: foreignTarget },
      });
      const run = () =>
        runWorkGuardCore({
          repoRoot: cwd,
          rawInput,
          env: { ...process.env, HELIX_ALLOW_FOREIGN_EDIT: "1" },
        });
      expect(run().exitCode).toBe(0);
      const second = run();
      expect(second.exitCode).toBe(2);
      expect(second.message).toContain("blocked_reuse");
      const db = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
      const rows = db
        .prepare("SELECT * FROM guard_override_transactions WHERE guard_kind='foreign_edit'")
        .all();
      db.close();
      expect(rows).toHaveLength(1);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});

describe("work-guard hook marker is one-shot (stale marker は恒久バイパスしない)", () => {
  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-007] shared, standalone, and consumer adapters fail closed on malformed input", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workguard-malformed-"));
    try {
      expect(runWorkGuardCore({ repoRoot: cwd, rawInput: "{not-json" }).exitCode).toBe(2);
      expect(runWorkGuardCore({ repoRoot: cwd, rawInput: "" }).exitCode).toBe(2);
      const standalone = spawnSync(
        "npx",
        ["--prefix", hookRepoRoot, "--no-install", "tsx", workGuardHook],
        {
          cwd,
          encoding: "utf8",
          env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
          input: "{not-json",
        },
      );
      expect(standalone.status).toBe(2);
      expect(standalone.stderr).toContain("BLOCK");
      const consumer = spawnSync(
        "npx",
        ["--prefix", hookRepoRoot, "--no-install", "tsx", cliPath, "hook", "work-guard"],
        {
          cwd,
          encoding: "utf8",
          input: "{not-json",
        },
      );
      expect(consumer.status).toBe(2);
      expect(consumer.stderr).toContain("BLOCK");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("consumes the override marker after one foreign edit; the next identical edit re-blocks", () => {
    const cwd = mkdtempSync(join(tmpdir(), "helix-workguard-marker-"));
    try {
      // git repo + untracked foreign file = このセッションが触っていない uncommitted ファイル。
      execFileSync("git", ["init"], { cwd, stdio: "ignore" });
      const foreignTarget = "alice@example.com-private.ts";
      writeFileSync(join(cwd, foreignTarget), "export const x = 1;\n");
      const markerPath = join(cwd, ".helix", "state", "foreign-edit-override");
      mkdirSync(join(cwd, ".helix", "state"), { recursive: true });
      writeFileSync(markerPath, "reviewed recovery for /home/alice/private-project\n");

      const input = { session_id: "s-test", tool_input: { file_path: foreignTarget } };

      // 1回目: marker により foreign 編集を許可 (exit 0) し、marker を消費する。
      const first = runWorkGuardHook(cwd, input);
      expect(first.status).toBe(0);
      expect(existsSync(markerPath)).toBe(false); // one-shot 消費
      // audit 証跡はraw reason/pathを残さずharness.dbへ収束する。
      const db = openHarnessDb(defaultHarnessDbPath(cwd), { repoRoot: cwd });
      const rows = db
        .prepare("SELECT * FROM guard_override_transactions WHERE guard_kind='foreign_edit'")
        .all();
      db.close();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        status: "committed",
        operation_class: "foreign uncommitted edit",
      });
      expect(JSON.stringify(rows)).not.toContain(
        "reviewed recovery for /home/alice/private-project",
      );
      expect(JSON.stringify(rows)).not.toContain("alice@example.com");
      expect(JSON.stringify(rows)).not.toContain(foreignTarget);
      const dbBytes = readFileSync(defaultHarnessDbPath(cwd)).toString("utf8");
      expect(dbBytes).not.toContain("reviewed recovery for /home/alice/private-project");
      expect(dbBytes).not.toContain("/home/alice/private-project");
      expect(dbBytes).not.toContain("alice@example.com");
      expect(dbBytes).not.toContain(foreignTarget);

      // 2回目: marker は消費済み → bypass 無し → 同じ foreign 編集が block される (exit 2)。
      const second = runWorkGuardHook(cwd, input);
      expect(second.status).toBe(2);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  }, 20_000);
});
