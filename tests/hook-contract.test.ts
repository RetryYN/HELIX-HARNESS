/**
 * hook 契約テスト (PLAN-L7-441 = PLAN-L7-433 C1/C2 の実装スライス)。
 *
 * C1: setup template が consumer へ配る `helix hook <name>` が CLI に実在しない場合
 *     (配布先で保護 hook が不発になる契約バグ) を fail-close で検出する。
 * C2: agent-guard の matcher が settings (dev repo) / policy 正本 / consumer template の
 *     三面で一致することを固定する。
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AGENT_TOOL_NAMES } from "../src/runtime/agent-guard-policy";

const repoRoot = process.cwd();
const cli = join(repoRoot, "src", "cli.ts");

describe("hook contract (PLAN-L7-441)", () => {
  it("U-HKC-001: setup template が宣言する全 `helix hook <name>` が CLI subcommand として実在する", () => {
    const sources = [
      readFileSync(join(repoRoot, "src", "setup", "templates.ts"), "utf8"),
      readFileSync(join(repoRoot, "src", "setup", "index.ts"), "utf8"),
    ].join("\n");
    const declared = [
      ...new Set([...sources.matchAll(/helix hook ([a-z][a-z-]*)/g)].map((m) => m[1])),
    ];
    // work-guard を含む複数 hook が配布契約に載っていること自体も前提として検査する
    // (0 件 green の空回りを防ぐ)。
    expect(declared).toContain("work-guard");
    expect(declared.length).toBeGreaterThanOrEqual(2);
    const help = spawnSync("bun", [cli, "hook", "--help"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(help.status).toBe(0);
    const missing = declared.filter(
      (name) => !new RegExp(`^\\s{2}${name}(\\s|$)`, "m").test(help.stdout),
    );
    expect(missing).toEqual([]);
  }, 20_000);

  it("U-HKC-002: `helix hook work-guard` が foreign uncommitted を block し clean ファイルを pass する", () => {
    const dir = mkdtempSync(join(tmpdir(), "helix-work-guard-cli-"));
    try {
      const git = (...args: string[]) =>
        execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" });
      git("init", "-q");
      git("config", "user.email", "hkc@example.com");
      git("config", "user.name", "hkc");
      writeFileSync(join(dir, "clean.txt"), "committed\n");
      git("add", "clean.txt");
      git("commit", "-qm", "init");
      // untracked = 他ランタイムの in-flight とみなされる uncommitted ファイル。
      writeFileSync(join(dir, "foreign.txt"), "in-flight\n");
      const run = (file: string) =>
        spawnSync("bun", [cli, "hook", "work-guard"], {
          cwd: dir,
          encoding: "utf8",
          env: { ...process.env, HELIX_ALLOW_FOREIGN_EDIT: "" },
          input: JSON.stringify({
            tool_name: "Edit",
            tool_input: { file_path: join(dir, file) },
            session_id: "hkc-test",
          }),
        });
      const blocked = run("foreign.txt");
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("[helix-work-guard] BLOCK");
      const passed = run("clean.txt");
      expect(passed.status).toBe(0);
      expect(passed.stdout).toContain("work-guard: pass");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);

  it("U-HKC-003: agent-guard matcher が settings / policy / consumer template の三面で一致する", () => {
    const settings = JSON.parse(
      readFileSync(join(repoRoot, ".claude", "settings.json"), "utf8"),
    ) as {
      hooks: { PreToolUse: { matcher?: string; hooks?: { command?: string }[] }[] };
    };
    const agentEntry = settings.hooks.PreToolUse.find((entry) =>
      entry.hooks?.some((h) => String(h.command ?? "").includes("agent-guard")),
    );
    expect(agentEntry).toBeDefined();
    const settingsNames = new Set(String(agentEntry?.matcher ?? "").split("|"));
    expect(settingsNames).toEqual(new Set(AGENT_TOOL_NAMES));

    const template = readFileSync(join(repoRoot, "src", "setup", "templates.ts"), "utf8");
    const templateMatcher = template.match(/"matcher": "(Agent[^"]*)"/);
    expect(templateMatcher).not.toBeNull();
    expect(new Set((templateMatcher as RegExpMatchArray)[1].split("|"))).toEqual(
      new Set(AGENT_TOOL_NAMES),
    );
  });
});
