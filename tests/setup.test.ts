import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyBranchProtection,
  buildCleanDistributionPlan,
  buildConsumerReadinessPlan,
  consumerCodexConfigEnablesHooks,
  detectProjectScale,
  emitSetup,
  loadTemplates,
  type ProjectScale,
  packageJsonDeclaresCommitlint,
  planHelixProjectSetup,
  planSetup,
  recommendPhase,
  recordSetupState,
  runHelixProjectSetup,
  runSetup,
  type SetupDeps,
  type SetupState,
} from "../src/setup/index";
import type { TemplateSet } from "../src/setup/templates";
import { BUILTIN_GITHUB_TEMPLATES, COMMON_FILES } from "../src/setup/templates";

/** in-memory file store + gh 呼び出し記録の mock deps (now 固定で決定論)。 */
function mockDeps(
  over: Partial<SetupDeps> = {},
): SetupDeps & { files: Map<string, string>; ghCalls: string[][] } {
  const files = new Map<string, string>();
  const ghCalls: string[][] = [];
  return {
    files,
    ghCalls,
    repoRoot: "/repo",
    now: () => "2026-06-02T00:00:00.000Z",
    gh: (args) => {
      ghCalls.push(args);
      return { ok: false, stdout: "" }; // 既定: gh 使えない
    },
    readText: (p) => files.get(p) ?? null,
    writeText: (p, c) => files.set(p, c),
    confirm: () => false,
    isInteractive: false,
    templates: {},
    ...over,
  };
}

const codeownersPath = join("/repo", ".github", "CODEOWNERS");
const statePath = join("/repo", ".ut-tdd", "state", "setup.json");
const projectSetupStatePath = join("/repo", ".ut-tdd", "state", "project-setup.json");

/** org + 4 collaborators + protection あり + admin を返す gh mock。 */
const ghTeam = (args: string[]): { ok: boolean; stdout: string } => {
  const key = args.join(" ");
  if (key === "api repos/{owner}/{repo}")
    return {
      ok: true,
      stdout: JSON.stringify({ owner: { type: "Organization" }, permissions: { admin: true } }),
    };
  if (key === "api repos/{owner}/{repo}/collaborators")
    return { ok: true, stdout: JSON.stringify([{}, {}, {}, {}]) };
  if (key === "api repos/{owner}/{repo}/branches/main/protection")
    return { ok: true, stdout: "{}" };
  if (key === "auth status") return { ok: true, stdout: "logged in" };
  return { ok: false, stdout: "" };
};

const baseTemplates: TemplateSet = {
  ...BUILTIN_GITHUB_TEMPLATES,
  "adapter/AGENTS.md": [
    "<!-- UT-TDD:managed:start -->",
    "# HELIX アダプター",
    "",
    "- Status: `ut-tdd status`",
    "- Completion packet: `ut-tdd completion decision-packet --json`",
    "- Version-up dry-run: `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`",
    "- Doctor: `ut-tdd doctor --profile consumer`",
    "- Rename packet: `ut-tdd rename plan --json`",
    "- Handover: `ut-tdd handover`",
    "- Team run dry-run: `ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/CLAUDE.md": [
    "<!-- UT-TDD:managed:start -->",
    "# HELIX 共有コンテキスト",
    "",
    "- `ut-tdd status`",
    "- `ut-tdd completion decision-packet --json`",
    "- `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`",
    "- `ut-tdd doctor --profile consumer`",
    "- `ut-tdd rename plan --json`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/.claude/CLAUDE.md": [
    "<!-- UT-TDD:managed:start -->",
    "# HELIX Claude runtime アダプター",
    "",
    "- `ut-tdd status`",
    "- `ut-tdd completion decision-packet --json`",
    "- `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`",
    "- `ut-tdd doctor --profile consumer`",
    "- `ut-tdd rename plan --json`",
    "- `ut-tdd handover`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/.claude/settings.json": BUILTIN_GITHUB_TEMPLATES["adapter/.claude/settings.json"],
  "adapter/.codex/config.toml": "[features]\nhooks = true\n",
  "project/.vscode/tasks.json": [
    "{",
    '  "version": "2.0.0",',
    '  "tasks": [',
    '    { "label": "HELIX: status", "type": "shell", "command": "bun run ut-tdd status", "problemMatcher": [] },',
    '    { "label": "HELIX: doctor", "type": "shell", "command": "bun run ut-tdd doctor --profile consumer", "problemMatcher": [] },',
    '    { "label": "HELIX: completion decision-packet", "type": "shell", "command": "bun run ut-tdd completion decision-packet --json", "problemMatcher": [] },',
    '    { "label": "HELIX: version-up dry-run", "type": "shell", "command": "bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json", "problemMatcher": [] },',
    '    { "label": "HELIX: rename plan", "type": "shell", "command": "bun run ut-tdd rename plan --json", "problemMatcher": [] },',
    '    { "label": "HELIX: handover status", "type": "shell", "command": "bun run ut-tdd handover status --json", "problemMatcher": [] },',
    '    { "label": "HELIX: setup dry-run", "type": "shell", "command": "bun run ut-tdd setup project --dry-run", "problemMatcher": [] },',
    '    { "label": "HELIX: team run dry-run", "type": "shell", "command": "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json", "problemMatcher": [] }',
    "  ]",
    "}",
    "",
  ].join("\n"),
  "project/.vscode/settings.json": '{"task.allowAutomaticTasks":"off"}\n',
  "project/.ut-tdd/memory/.gitkeep": "",
  "project/.ut-tdd/handover/.gitkeep": "",
  "project/.ut-tdd/evidence/.gitkeep": "",
  "project/.ut-tdd/teams/default-hybrid.yaml": [
    "name: default-hybrid",
    "strategy: sequential",
    "max_parallel: 2",
    "serialization:",
    "  file_conflict: false",
    "  downstream_dependency: true",
    "  shared_state: false",
    "members:",
    "  - role: se",
    "    engine: codex-se",
    "    difficulty: standard",
    "    task: implement",
    "  - role: tl",
    "    engine: pmo-sonnet",
    "    difficulty: standard",
    "    serialize_after: se",
    "    task: review",
    "",
  ].join("\n"),
  "common/harness-check.yml": [
    "name: harness-check",
    "on:",
    "  push:",
    "    branches: [main]",
    "  pull_request:",
    "    branches: [main]",
    "permissions:",
    "  contents: read",
    "jobs:",
    "  harness-check:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "        with:",
    "          persist-credentials: false",
    "      - uses: oven-sh/setup-bun@v2",
    "      - run: bun install --frozen-lockfile",
    "      - name: HELIX CLI dependency",
    "        run: bun run ut-tdd --version",
    "      - name: HELIX setup dry-run",
    "        run: bun run ut-tdd setup project --dry-run --json",
    "      - name: HELIX status",
    "        run: bun run ut-tdd status --json",
    "      - name: HELIX completion decision packet",
    "        run: bun run ut-tdd completion decision-packet --json",
    "      - name: HELIX version-up dry-run",
    "        run: bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
    "      - name: HELIX consumer doctor",
    "        run: bun run ut-tdd doctor --profile consumer --json",
    "      - name: HELIX rename plan",
    "        run: bun run ut-tdd rename plan --json",
    "      - name: Handover route",
    "        run: bun run ut-tdd handover status --json",
    "      - name: HELIX team run dry-run",
    "        run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    "      - run: bun run typecheck",
    "      - run: bun run test",
    "",
  ].join("\n"),
  "common/commitlint.config.js":
    "module.exports = { extends: ['@commitlint/config-conventional'] };\n",
  "common/escalation-stale.yml": [
    "name: escalation-stale",
    "on:",
    "  schedule:",
    "    - cron: '0 0 * * 1'",
    "permissions:",
    "  contents: read",
    "jobs:",
    "  escalation-audit:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "        with:",
    "          persist-credentials: false",
    "      - uses: oven-sh/setup-bun@v2",
    "      - run: bun install --frozen-lockfile",
    "      - name: Handover route",
    "        run: bun run ut-tdd handover status --json",
    "      - name: HELIX completion decision packet",
    "        run: bun run ut-tdd completion decision-packet --json",
    "      - name: HELIX consumer doctor",
    "        run: bun run ut-tdd doctor --profile consumer --json",
    "",
  ].join("\n"),
  "common/recovery.md": "# Recovery\n",
  "common/add-feature.md": "# Add-feature\n",
  "common/PULL_REQUEST_TEMPLATE.md": "## 概要\nCloses #\n",
  "team/CODEOWNERS": "* {{TL_TEAM}}\n/docs/ {{PO_TEAM}}\n/tests/ {{QA_TEAM}}\n",
  "team/setup-branch-protection.sh": [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"',
    'echo "main の branch protection は action-binding approval が必要です: ${REPO}"',
    'echo "harness-check required / review count / admin enforcement は approval packet で確認してください"',
    'echo "この script は remote GitHub API を呼びません"',
    "exit 2",
    "",
  ].join("\n"),
};

describe("setup solo/team (PLAN-L7-03 add-impl / U-SETUP)", () => {
  it("U-SETUP-001: detectProjectScale は never-throws / org 検出 / gh 失敗で unknown+null", () => {
    // org + collaborators + protection
    const org = mockDeps({ gh: ghTeam });
    const s = detectProjectScale(org);
    expect(s.ownerType).toBe("Organization");
    expect(s.collaborators).toBe(4);
    expect(s.hasBranchProtection).toBe(true);

    // gh 全失敗 (未認証/不在) → unknown / null、token 非読取、throw しない
    const down = mockDeps(); // 既定 gh = ok:false
    let scale: ProjectScale | undefined;
    expect(() => {
      scale = detectProjectScale(down);
    }).not.toThrow();
    expect(scale).toEqual({
      ownerType: "unknown",
      collaborators: null,
      hasCodeowners: false,
      hasBranchProtection: null,
    });

    // 既存 CODEOWNERS はローカル file で検出 (gh 不要)
    const local = mockDeps();
    local.files.set(codeownersPath, "* @team\n");
    expect(detectProjectScale(local).hasCodeowners).toBe(true);
  });

  it("U-SETUP-002: recommendPhase 純関数 / team・solo・fallback 信号", () => {
    const base: ProjectScale = {
      ownerType: "User",
      collaborators: 1,
      hasCodeowners: false,
      hasBranchProtection: false,
    };
    // team 信号
    expect(recommendPhase({ ...base, ownerType: "Organization" })).toMatchObject({
      phase: "0-B",
      confidence: "high",
    });
    expect(recommendPhase({ ...base, collaborators: 3 })).toMatchObject({ phase: "0-B" });
    expect(recommendPhase({ ...base, hasCodeowners: true })).toMatchObject({ phase: "0-B" });
    expect(recommendPhase({ ...base, hasBranchProtection: true })).toMatchObject({ phase: "0-B" });
    // solo (User + collaborators<=1)
    expect(recommendPhase(base)).toMatchObject({ phase: "0-A", confidence: "high" });
    // 不明信号 → solo low (安全フォールバック)
    expect(
      recommendPhase({
        ownerType: "unknown",
        collaborators: null,
        hasCodeowners: false,
        hasBranchProtection: null,
      }),
    ).toMatchObject({ phase: "0-A", confidence: "low" });
    // null 単独 (User だが collaborators 取得不可) → 0-B にしない
    expect(
      recommendPhase({
        ownerType: "User",
        collaborators: null,
        hasCodeowners: false,
        hasBranchProtection: null,
      }),
    ).toMatchObject({ phase: "0-A", confidence: "low" });
  });

  it("U-SETUP-003: planSetup 0-A=A のみ / 0-B=A+CODEOWNERS+bp script / teams 反映 / applied=false", () => {
    const solo = planSetup("0-A", { dryRun: false });
    expect(solo.files.every((f) => f.category === "A")).toBe(true);
    expect(solo.files.some((f) => f.path.endsWith("CODEOWNERS"))).toBe(false);
    expect(solo.actions).toEqual([]);

    const team = planSetup("0-B", {
      dryRun: false,
      teams: { tl: "@org/tl", qa: "@org/qa", po: "@org/po" },
    });
    expect(team.files.some((f) => f.path.endsWith("CODEOWNERS") && f.category === "B")).toBe(true);
    expect(team.files.some((f) => f.path.includes("setup-branch-protection.sh"))).toBe(true);
    // teams 名が CODEOWNERS GeneratedFile に反映
    const co = team.files.find((f) => f.path.endsWith("CODEOWNERS"));
    expect(co?.purpose).toContain("@org/tl");
    // action は宣言されるが applied=false (適用は別関数)
    expect(team.actions).toEqual([
      {
        kind: "branch-protection",
        script_path: join("scripts", "setup-branch-protection.sh"),
        applied: false,
      },
    ]);
  });

  it("U-SETUP-004: emitSetup dryRun 非書込 / 書込 / token 非埋込 / team 名 render", () => {
    // dryRun → 書かず path 一覧
    const dry = mockDeps({ templates: baseTemplates });
    const plan = planSetup("0-A", { dryRun: true });
    const paths = emitSetup(plan, baseTemplates, dry);
    expect(paths.length).toBe(plan.files.length);
    expect([...dry.files.keys()].length).toBe(0); // 何も書いていない

    // 書込
    const wet = mockDeps({ templates: baseTemplates });
    const teamPlan = planSetup("0-B", {
      dryRun: false,
      teams: { tl: "@org/tl-team", qa: "@org/qa-team", po: "@org/po-team" },
    });
    const written = emitSetup(teamPlan, baseTemplates, wet);
    expect(written).toContain(join(".github", "CODEOWNERS"));
    const co = wet.files.get(join("/repo", ".github", "CODEOWNERS")) as string;
    // team 名 render: プレースホルダ解決 / token 非含
    expect(co).toContain("@org/tl-team");
    expect(co).not.toContain("{{TL_TEAM}}");
    for (const v of wet.files.values()) {
      expect(v.toLowerCase()).not.toMatch(/(ghp_|github_pat_|token=|bearer )/);
    }
  });

  it("U-SETUP-004b: loadTemplates has built-in fallback for existing repos without harness docs", () => {
    const repo = mkdtempSync(join(tmpdir(), "ut-tdd-setup-existing-"));
    try {
      const templates = loadTemplates(repo);
      expect(templates["adapter/AGENTS.md"]).toContain("HELIX アダプター");
      expect(templates["adapter/AGENTS.md"]).toContain("PLAN-M-02");
      expect(templates["adapter/AGENTS.md"]).toContain("ut-tdd completion decision-packet --json");
      expect(templates["adapter/AGENTS.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["adapter/CLAUDE.md"]).toContain("ut-tdd completion decision-packet --json");
      expect(templates["adapter/CLAUDE.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["adapter/.claude/CLAUDE.md"]).toContain(
        "ut-tdd completion decision-packet --json",
      );
      expect(templates["adapter/.claude/CLAUDE.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["adapter/.codex/config.toml"]).toContain("hooks = true");
      expect(templates["adapter/.codex/hooks.json"]).toContain("ut-tdd hook agent-guard");
      expect(templates["adapter/.codex/hooks.json"]).toContain("ut-tdd hook work-guard");
      expect(templates["adapter/.codex/hooks.json"]).toContain("ut-tdd hook git-command-guard");
      expect(templates["adapter/.claude/agents/code-reviewer.md"]).toContain(
        "consumer-safe な HELIX subagent",
      );
      expect(templates["adapter/.claude/agents/helix-tl.md"]).toContain("HELIX workflow");
      expect(templates["adapter/.claude/agents/helix-tl.md"]).toContain(
        "ut-tdd doctor --profile consumer",
      );
      expect(templates["adapter/.claude/agents/helix-tl.md"]).toContain(
        "ut-tdd completion decision-packet --json",
      );
      expect(templates["adapter/.claude/agents/helix-tl.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["adapter/.claude/commands/build.md"]).toContain("Command: build");
      expect(templates["adapter/.claude/commands/helix-status.md"]).toContain(
        "HELIX status / completion packet / doctor 出力",
      );
      expect(templates["adapter/.claude/commands/helix-test.md"]).toContain("ut-tdd status --json");
      expect(templates["adapter/.claude/commands/helix-test.md"]).toContain(
        "ut-tdd completion decision-packet --json",
      );
      expect(templates["adapter/.claude/commands/helix-status.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["adapter/.claude/commands/helix-test.md"]).toContain(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      );
      expect(templates["project/.ut-tdd/teams/default-hybrid.yaml"]).toContain(
        "name: default-hybrid",
      );
      expect(templates["project/.ut-tdd/teams/default-hybrid.yaml"]).toContain("engine: codex-se");
      expect(templates["project/.ut-tdd/teams/default-hybrid.yaml"]).toContain(
        "engine: pmo-sonnet",
      );
      expect(templates["common/harness-check.yml"]).toContain("harness-check");
      expect(templates["common/harness-check.yml"]).toContain("permissions:");
      expect(templates["common/harness-check.yml"]).toContain("contents: read");
      expect(templates["common/escalation-stale.yml"]).toContain("escalation-audit");
      expect(templates["common/escalation-stale.yml"]).toContain(
        "bun run ut-tdd handover status --json",
      );
      expect(templates["common/escalation-stale.yml"]).not.toMatch(/placeholder|TODO|TBD/i);
      expect(templates["common/recovery.md"]).toContain("## 復旧手順");
      expect(templates["common/add-feature.md"]).toContain("## 受け入れ条件");
      expect(templates["common/PULL_REQUEST_TEMPLATE.md"]).toContain("## V-model artifact");
      expect(templates["team/CODEOWNERS"]).toContain("{{TL_TEAM}}");
      const deps = mockDeps({ repoRoot: repo, templates });
      const plan = planSetup("0-B", {
        dryRun: false,
        teams: { tl: "@org/tl", qa: "@org/qa", po: "@org/po" },
      });
      const written = emitSetup(plan, templates, deps);
      expect(written).toContain(join(".github", "CODEOWNERS"));
      expect(deps.files.get(join(repo, ".github", "CODEOWNERS"))).toContain("@org/tl");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("U-SETUP-004c: built-in adapter templates ship enforced portable guard hooks", () => {
    const repo = mkdtempSync(join(tmpdir(), "ut-tdd-setup-templates-"));
    const templates = loadTemplates(repo);
    try {
      const claude = JSON.parse(templates["adapter/.claude/settings.json"]) as {
        hooks: Record<
          string,
          { matcher?: string; hooks: { command: string; blockOnFailure?: boolean }[] }[]
        >;
      };
      const codex = JSON.parse(templates["adapter/.codex/hooks.json"]) as {
        hooks: Record<
          string,
          { matcher?: string; hooks: { command: string; blockOnFailure?: boolean }[] }[]
        >;
      };
      expect(templates["adapter/.codex/config.toml"]).toContain("[features]");
      expect(templates["adapter/.codex/config.toml"]).toContain("hooks = true");

      expect(claude.hooks.PreToolUse).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            matcher: "Agent|Task",
            hooks: [
              expect.objectContaining({ command: "ut-tdd hook agent-guard", blockOnFailure: true }),
            ],
          }),
          expect.objectContaining({
            matcher: "Edit|Write|MultiEdit",
            hooks: [
              expect.objectContaining({ command: "ut-tdd hook work-guard", blockOnFailure: true }),
            ],
          }),
          expect.objectContaining({
            matcher: "Bash",
            hooks: [
              expect.objectContaining({
                command: "ut-tdd hook git-command-guard",
                blockOnFailure: true,
              }),
            ],
          }),
        ]),
      );
      expect(claude.hooks.SubagentStop[0].hooks[0].command).toBe("ut-tdd hook subagent-stop");
      expect(codex.hooks.PreToolUse).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            matcher: "spawn_agent|spawn_agents_on_csv",
            hooks: [
              expect.objectContaining({
                command: "ut-tdd hook agent-guard",
                blockOnFailure: true,
              }),
            ],
          }),
          expect.objectContaining({
            matcher: "apply_patch|write_file",
            hooks: [
              expect.objectContaining({ command: "ut-tdd hook work-guard", blockOnFailure: true }),
            ],
          }),
          expect.objectContaining({
            matcher: "exec_command|local_shell",
            hooks: [
              expect.objectContaining({
                command: "ut-tdd hook git-command-guard",
                blockOnFailure: true,
              }),
            ],
          }),
        ]),
      );
      const repoTemplates = loadTemplates(process.cwd());
      const repoCodex = JSON.parse(repoTemplates["adapter/.codex/hooks.json"]) as {
        hooks: Record<
          string,
          { matcher?: string; hooks: { command: string; blockOnFailure?: boolean }[] }[]
        >;
      };
      expect(repoCodex.hooks.PreToolUse).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            matcher: "spawn_agent|spawn_agents_on_csv",
            hooks: [
              expect.objectContaining({
                command: "ut-tdd hook agent-guard",
                blockOnFailure: true,
              }),
            ],
          }),
          expect.objectContaining({
            matcher: "apply_patch|write_file",
            hooks: [
              expect.objectContaining({ command: "ut-tdd hook work-guard", blockOnFailure: true }),
            ],
          }),
          expect.objectContaining({
            matcher: "exec_command|local_shell",
            hooks: [
              expect.objectContaining({
                command: "ut-tdd hook git-command-guard",
                blockOnFailure: true,
              }),
            ],
          }),
        ]),
      );
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("U-SETUP-025: parses Codex hook config as a features-section contract", () => {
    expect(consumerCodexConfigEnablesHooks("[features]\nhooks = true\n")).toBe(true);
    expect(consumerCodexConfigEnablesHooks("# [features]\n[other]\nhooks = true\n")).toBe(false);
    expect(
      consumerCodexConfigEnablesHooks("[features]\nhooks = false\n[other]\nhooks = true\n"),
    ).toBe(false);
  });

  it("U-SETUP-014: emitSetup skips the commitlint dotfile when package.json already declares commitlint", () => {
    // 純関数: 宣言済み→true / 無し→false / 壊れ JSON→false / null→false。
    expect(packageJsonDeclaresCommitlint('{"commitlint":{"extends":["x"]}}')).toBe(true);
    expect(packageJsonDeclaresCommitlint('{"name":"x"}')).toBe(false);
    expect(packageJsonDeclaresCommitlint("{ not json")).toBe(false);
    expect(packageJsonDeclaresCommitlint(null)).toBe(false);

    const plan = planSetup("0-A", { dryRun: false });

    // package.json が commitlint を宣言 → governance 集約済み → dotfile を出さない。
    const declared = mockDeps({ templates: baseTemplates });
    declared.files.set(
      join("/repo", "package.json"),
      '{"name":"x","commitlint":{"extends":["c"]}}',
    );
    const writtenDeclared = emitSetup(plan, baseTemplates, declared);
    expect(writtenDeclared).not.toContain("commitlint.config.js");
    expect(declared.files.has(join("/repo", "commitlint.config.js"))).toBe(false);

    // package.json に key 無し (generic consumer) → 従来どおり dotfile を emit (非破壊・機能維持)。
    const undeclared = mockDeps({ templates: baseTemplates });
    undeclared.files.set(join("/repo", "package.json"), '{"name":"x"}');
    const writtenUndeclared = emitSetup(plan, baseTemplates, undeclared);
    expect(writtenUndeclared).toContain("commitlint.config.js");
    expect(undeclared.files.get(join("/repo", "commitlint.config.js"))).toContain(
      "config-conventional",
    );
  });

  it("U-SETUP-009: planSetup projects clean adapter templates for brownfield consumers", () => {
    const plan = planSetup("0-A", { dryRun: true });
    expect(plan.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "AGENTS.md", category: "A" }),
        expect.objectContaining({ path: "CLAUDE.md", category: "A" }),
        expect.objectContaining({ path: join(".codex", "config.toml"), category: "A" }),
        expect.objectContaining({ path: join(".codex", "hooks.json"), category: "A" }),
        expect.objectContaining({ path: join(".claude", "CLAUDE.md"), category: "A" }),
        expect.objectContaining({ path: join(".claude", "settings.json"), category: "A" }),
        expect.objectContaining({
          path: join(".claude", "agents", "code-reviewer.md"),
          category: "A",
        }),
        expect.objectContaining({
          path: join(".claude", "commands", "build.md"),
          category: "A",
        }),
      ]),
    );

    const deps = mockDeps({ templates: baseTemplates });
    const preview = emitSetup(plan, baseTemplates, deps);
    expect(preview).toEqual(
      expect.arrayContaining([
        "AGENTS.md",
        "CLAUDE.md",
        join(".codex", "hooks.json"),
        join(".codex", "config.toml"),
        join(".claude", "CLAUDE.md"),
        join(".claude", "agents", "code-reviewer.md"),
        join(".claude", "commands", "build.md"),
        join(".claude", "commands", "helix-status.md"),
      ]),
    );
    for (const p of preview) expect(p).not.toContain("UT-TDD-agent-harness");
  });

  it("U-SETUP-010: emitSetup preserves consumer-owned adapter files and merges only managed blocks", () => {
    const deps = mockDeps({ templates: baseTemplates, confirm: () => false });
    deps.files.set(join("/repo", "AGENTS.md"), "# Consumer Rules\n\nKeep this line.\n");
    deps.files.set(join("/repo", ".claude", "settings.json"), '{"consumer":true}\n');
    const plan = planSetup("0-A", { dryRun: false });

    const written = emitSetup(plan, baseTemplates, deps);
    expect(written).toContain("AGENTS.md");
    expect(written).not.toContain(join(".claude", "settings.json"));

    const agents = deps.files.get(join("/repo", "AGENTS.md")) as string;
    expect(agents).toContain("# Consumer Rules\n\nKeep this line.\n");
    expect(agents).toContain("<!-- UT-TDD:managed:start -->");
    expect(agents).toContain("HELIX アダプター");
    expect(agents).toContain("`ut-tdd doctor --profile consumer`");
    expect(agents).toContain(
      "`ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json`",
    );
    expect(agents).not.toContain(".ut-tdd/teams/<team>.yaml");
    expect(deps.files.get(join("/repo", ".claude", "settings.json"))).toBe('{"consumer":true}\n');

    const beforeSecondRun = deps.files.get(join("/repo", "AGENTS.md"));
    emitSetup(plan, baseTemplates, deps);
    expect(deps.files.get(join("/repo", "AGENTS.md"))).toBe(beforeSecondRun);
  });

  it("U-SETUP-011: clean distribution plan excludes dogfood, UI, and runtime state", () => {
    const plan = buildCleanDistributionPlan({
      sourceTag: "v0.1.0",
      cleanRepo: "UNISON-TECHNOLOGY/clean",
      paths: [
        "README.md",
        "LICENSE",
        "package.json",
        "src/cli.ts",
        "src/setup/index.ts",
        "docs/templates/project/.ut-tdd/teams/default-hybrid.yaml",
        "src/web/catalog.ts",
        "src/web/index.ts",
        "src/web/render.ts",
        "src/web/tokens.ts",
        "src/web/types.ts",
        ...COMMON_FILES.filter((entry) => entry.template.startsWith("adapter/")).map(
          (entry) => `docs/templates/${entry.template}`,
        ),
        "tests/web.test.ts",
        "src/web/page.tsx",
        ".claude/settings.json",
        ".codex/hooks.json",
        "docs/plans/PLAN-L7-157-distribution-clean-pull.md",
        "docs/design/harness/L6-function-design/setup-solo-team.md",
        ".ut-tdd/handover/CURRENT.json",
      ],
    });

    expect(plan.ok).toBe(true);
    expect(plan.channel).toBe("clean-repo-plus-signed-tarball");
    expect(plan.artifactPaths).toContain("LICENSE");
    expect(plan.artifactPaths.some((path) => path.startsWith("src/web/"))).toBe(false);
    expect(plan.artifactPaths).not.toContain("tests/web.test.ts");
    expect(plan.artifactPaths).toContain("docs/templates/adapter/AGENTS.md");
    expect(plan.artifactPaths).toContain("docs/templates/adapter/.codex/hooks.json");
    expect(plan.artifactPaths).toContain("docs/templates/adapter/.claude/agents/code-reviewer.md");
    expect(plan.artifactPaths).toContain("docs/templates/adapter/.claude/commands/build.md");
    expect(plan.artifactPaths).toContain(
      "docs/templates/project/.ut-tdd/teams/default-hybrid.yaml",
    );
    expect(plan.artifactPaths).not.toContain("src/web/page.tsx");
    expect(plan.artifactPaths).not.toContain(".claude/settings.json");
    expect(plan.artifactPaths).not.toContain(".codex/hooks.json");
    expect(plan.artifactPaths).not.toContain("docs/plans/PLAN-L7-157-distribution-clean-pull.md");
    expect(plan.artifactPaths).not.toContain(".ut-tdd/handover/CURRENT.json");
    expect(plan.releaseIntegrity.artifacts).toEqual([
      "v0.1.0.tar.gz",
      "v0.1.0.tar.gz.sha256",
      "v0.1.0.tar.gz.sig",
    ]);
  });

  it("U-SETUP-012: consumer readiness covers preflight, rollback, contracts, CI, and monorepo root", () => {
    const ready = buildConsumerReadinessPlan({
      bunVersion: "1.3.2",
      hasGit: true,
      hasGh: false,
      hasUtTddCli: true,
      hasClaude: false,
      hasCodex: true,
      repoRoot: "/repo",
      packageRoot: "/repo/packages/app",
      tag: "v0.1.0",
    });

    expect(ready.ok).toBe(true);
    expect(ready.mode).toBe("codex-only");
    expect(ready.workspace.monorepo).toBe(true);
    expect(ready.cliResolution).toEqual({
      command: "ut-tdd",
      checkedFrom: "/repo/packages/app",
      resolved: true,
      strategy: "path",
      bareCommandResolved: true,
      packageScriptAvailable: false,
      evidence: "`ut-tdd --version` resolved for consumer readiness",
      fallbackCommands: [
        "bun run ut-tdd --version",
        "bun link ut-tdd",
        "bun run ut-tdd setup project --dry-run --json",
      ],
    });
    expect(ready.checks.find((c) => c.name === "gh")).toMatchObject({ ok: false });
    expect(ready.checks.find((c) => c.name === "ut-tdd-cli")).toMatchObject({ ok: true });
    expect(ready.checks.find((c) => c.name === "distribution-version-binding")).toMatchObject({
      ok: true,
      message: expect.stringContaining("package.json version 0.1.0"),
    });
    expect(ready.objectiveBoundary.versionBinding).toMatchObject({
      localPackageVersion: "0.1.0",
      localDistributionTag: "v0.1.0",
      requestedDistributionTag: "v0.1.0",
      requestedTagMatchesPackageVersion: true,
      packLatestTag: "v0.1.3",
      packLatestRequiresVersionUpActivation: true,
      versionUpPacketCommand: "ut-tdd version-up activation-packet --json",
      adoptionDecision: expect.stringContaining("version-up activation decision"),
    });
    expect(ready.ci.security).toEqual({
      permissions: "contents:read",
      triggers: ["push:main", "pull_request:main"],
      disallowedTriggers: ["pull_request_target"],
      secrets: "not-required",
    });
    expect(ready.ci.packageResolution).toMatchObject({
      command: "bun run ut-tdd --version",
      requiredBefore: expect.arrayContaining([
        "bun run ut-tdd setup project --dry-run --json",
        "bun run ut-tdd completion decision-packet --json",
        "bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        "bun run ut-tdd doctor --profile consumer --json",
        "bun run ut-tdd rename plan --json",
      ]),
      remediation: expect.stringContaining("consumer package.json"),
    });
    expect(ready.ci.requires).toContain("bun run test");
    expect(ready.ci.requires).toEqual(
      expect.arrayContaining([
        "bun run ut-tdd --version",
        "bun run ut-tdd setup project --dry-run --json",
        "bun run ut-tdd status --json",
        "bun run ut-tdd completion decision-packet --json",
        "bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        "bun run ut-tdd doctor --profile consumer --json",
        "bun run ut-tdd rename plan --json",
        "bun run ut-tdd handover status --json",
        "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
      ]),
    );
    expect(ready.rollback.backupRequired).toBe(true);
    expect(ready.rollback.managedPaths).toContain("AGENTS.md");
    expect(ready.rollback.managedPaths).toContain(join(".codex", "hooks.json"));
    expect(ready.rollback.managedPaths).toContain(join(".claude", "agents", "code-reviewer.md"));
    expect(ready.rollback.managedPaths).toContain(join(".claude", "commands", "build.md"));
    expect(ready.contracts.tagPin).toContain("#v0.1.0");
    expect(ready.contracts.stable).toContain("adapter managed markers");
    expect(ready.contracts.stable).toContain("Claude/Codex adapter hook templates");
    expect(ready.contracts.stable).toContain("Claude subagent and slash-command templates");
    expect(ready.smokeScenarios).toEqual(
      expect.arrayContaining([
        "consumer CI -> repository secret 不要で harness-check green",
        "monorepo package root -> adapter path は repo-root scoped のまま",
      ]),
    );

    const packageScriptReady = buildConsumerReadinessPlan({
      bunVersion: "1.3.2",
      hasGit: true,
      hasGh: false,
      hasUtTddCli: false,
      hasUtTddPackageScript: true,
      hasClaude: false,
      hasCodex: true,
      repoRoot: "/repo",
      packageRoot: "/repo/packages/app",
      tag: "v0.1.0",
    });
    expect(packageScriptReady.ok).toBe(false);
    expect(packageScriptReady.checks.find((c) => c.name === "ut-tdd-cli")).toMatchObject({
      ok: false,
      message:
        "consumer packageRoot の `bun run ut-tdd` script は CI fallback として利用可能だが、projected hook / agent 用の bare `ut-tdd` は PATH 上で解決できない",
    });
    expect(packageScriptReady.checks.find((c) => c.name === "ut-tdd-package-script")).toMatchObject(
      {
        ok: true,
        message:
          "consumer CI / VSCode task fallback 用の `bun run ut-tdd` script が packageRoot で解決できる",
      },
    );
    expect(packageScriptReady.cliResolution).toMatchObject({
      checkedFrom: "/repo/packages/app",
      resolved: false,
      strategy: "package-script",
      bareCommandResolved: false,
      packageScriptAvailable: true,
      evidence:
        "`bun run ut-tdd --version` is available from consumer packageRoot scripts, but bare `ut-tdd --version` did not resolve for hooks",
    });

    const blocked = buildConsumerReadinessPlan({
      bunVersion: "1.2.9",
      hasGit: false,
      hasGh: false,
      hasUtTddCli: false,
      hasClaude: false,
      hasCodex: false,
      repoRoot: "/repo",
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.checks.filter((c) => !c.ok).map((c) => c.name)).toEqual([
      "bun>=1.3",
      "git",
      "gh",
      "ut-tdd-cli",
      "ut-tdd-package-script",
      "runtime-cli",
    ]);

    const omittedCli = buildConsumerReadinessPlan({
      bunVersion: "1.3.2",
      hasGit: true,
      hasGh: true,
      hasClaude: false,
      hasCodex: true,
      repoRoot: "/repo",
    });
    expect(omittedCli.ok).toBe(false);
    expect(omittedCli.checks.find((c) => c.name === "ut-tdd-cli")).toMatchObject({
      ok: false,
    });

    const tagDrift = buildConsumerReadinessPlan({
      bunVersion: "1.3.2",
      hasGit: true,
      hasGh: true,
      hasUtTddCli: true,
      hasClaude: false,
      hasCodex: true,
      repoRoot: "/repo",
      tag: "v0.1.3",
    });
    expect(tagDrift.ok).toBe(false);
    expect(tagDrift.checks.find((c) => c.name === "distribution-version-binding")).toMatchObject({
      ok: false,
      message: expect.stringContaining("version-up activation decision"),
    });
    expect(tagDrift.objectiveBoundary.versionBinding).toMatchObject({
      localDistributionTag: "v0.1.0",
      requestedDistributionTag: "v0.1.3",
      requestedTagMatchesPackageVersion: false,
      packLatestRequiresVersionUpActivation: true,
    });
  });

  it("U-SETUP-015: HELIX project setup adds VSCode tasks and project-local state baselines without external apply", () => {
    const plan = planHelixProjectSetup("0-A", { dryRun: true });

    expect(plan.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: join(".vscode", "tasks.json"), category: "A" }),
        expect.objectContaining({ path: join(".vscode", "settings.json"), category: "A" }),
        expect.objectContaining({ path: join(".ut-tdd", "memory", ".gitkeep"), category: "A" }),
        expect.objectContaining({ path: join(".ut-tdd", "handover", ".gitkeep"), category: "A" }),
        expect.objectContaining({ path: join(".ut-tdd", "evidence", ".gitkeep"), category: "A" }),
        expect.objectContaining({
          path: join(".ut-tdd", "teams", "default-hybrid.yaml"),
          category: "A",
        }),
      ]),
    );

    const dry = mockDeps({ templates: baseTemplates, isInteractive: false });
    const preview = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: true },
      dry,
    );
    expect(preview).toMatchObject({
      schemaVersion: "helix-project-setup.v1",
      setupCommand: "ut-tdd setup project",
      futureCommand: "helix setup project",
      phase: "0-A",
      githubPlan: {
        schemaVersion: "helix-project-github-plan.v1",
        planOnly: true,
        appliesRemote: false,
        applyCommandAvailable: false,
        workflowPath: ".github/workflows/harness-check.yml",
        requiredChecks: ["harness-check"],
        branchProtection: {
          status: "emit_only",
          scriptPath: "scripts/setup-branch-protection.sh",
          requiresHumanApproval: true,
        },
      },
      doctorBaseline: {
        schemaVersion: "helix-project-doctor-baseline.v1",
        planOnly: true,
        baselineCommands: [
          "ut-tdd setup project --dry-run",
          "ut-tdd status --json",
          "ut-tdd setup project --dry-run --json",
          "ut-tdd completion decision-packet --json",
          "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
          "ut-tdd doctor --profile consumer",
          "ut-tdd rename plan --json",
          "ut-tdd handover status --json",
          "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        ],
        stateBaselinePaths: [
          ".ut-tdd/memory",
          ".ut-tdd/handover",
          ".ut-tdd/evidence",
          ".ut-tdd/teams",
        ],
        completionClaimAllowed: false,
        nextRouteSource: "postSetupWorkflow.nextRoute",
        evidencePath: ".ut-tdd/evidence",
      },
      branchProtection: { applied: false, reason: "dry-run" },
      vscode: {
        tasksPath: join(".vscode", "tasks.json"),
        statusTask: "HELIX: status",
        completionDecisionPacketTask: "HELIX: completion decision-packet",
        doctorTask: "HELIX: doctor",
        renamePlanTask: "HELIX: rename plan",
        handoverTask: "HELIX: handover status",
        teamRunTask: "HELIX: team run dry-run",
      },
      identifierTransition: {
        currentCli: "ut-tdd",
        currentStateDir: ".ut-tdd",
        currentArea: "area=harness",
        targetCli: "helix",
        targetStateDir: ".helix",
        targetArea: "area=helix",
        status: "blocked_pending_cutover_approval",
        mustNotApply: true,
        cutoverPlanCommand: "ut-tdd rename plan --json",
      },
      commandAvailability: {
        currentCommand: "ut-tdd setup project",
        currentCommandAvailable: false,
        futureCommand: "helix setup project",
        futureCommandAvailable: false,
        enablementStatus: "blocked_pending_cutover_approval",
        enablementPacketCommand: "ut-tdd rename plan --json",
      },
      postSetupWorkflow: {
        schemaVersion: "helix-project-post-setup-workflow.v1",
        nextRoute: "fix_consumer_readiness",
        importReportRoute: "ready",
        readinessOk: false,
        manualDocSearchRequired: false,
      },
    });
    expect(preview.identifierTransition.reason).toContain("PLAN-M-02");
    expect(preview.commandAvailability.reason).toContain("package/bin alias activation");
    expect(preview.githubPlan.generatedPolicyFiles).toEqual(
      expect.arrayContaining([
        ".github/workflows/harness-check.yml",
        ".github/PULL_REQUEST_TEMPLATE.md",
      ]),
    );
    expect(preview.githubPlan.branchProtection.reason).toContain("human approval");
    expect(preview.githubPlan.branchProtection.reason).toContain("action-binding approval");
    expect(preview.doctorBaseline.baselineCommands).toEqual(
      preview.postSetupWorkflow.verificationCommands,
    );
    expect(preview.consumerReadiness).toMatchObject({
      ok: false,
      mode: "standalone",
      workspace: { repoRoot: "/repo", packageRoot: "/repo", monorepo: false },
    });
    expect(preview.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "ut-tdd-cli",
          ok: false,
          message: expect.stringContaining("bun link ut-tdd"),
        }),
      ]),
    );
    expect(preview.written).toContain(join(".vscode", "tasks.json"));
    expect(preview.written).toContain(join(".ut-tdd", "memory", ".gitkeep"));
    expect(preview.written).toContain(join(".ut-tdd", "teams", "default-hybrid.yaml"));
    expect(preview.written).toContain(preview.githubPlan.branchProtection.scriptPath);
    expect(preview.importReport).toMatchObject({
      schemaVersion: "helix-project-import-report.v1",
      mode: "fresh",
      dryRun: true,
      policy: "preserve_existing_then_review_import_report",
      requiresReview: false,
      nextRoute: "ready",
      writtenPaths: [],
    });
    expect(preview.importReport.previewPaths).toEqual(
      expect.arrayContaining([
        join(".vscode", "tasks.json"),
        join(".ut-tdd", "memory", ".gitkeep"),
        join(".ut-tdd", "teams", "default-hybrid.yaml"),
        preview.githubPlan.branchProtection.scriptPath,
      ]),
    );
    expect(preview.importReport.skipSubDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          marker: "skip_sub_doc",
          path: "docs/plans",
          reason: "dogfood_sub_doc_not_required_for_consumer_setup",
          nextRoute: "consumer_doctor_profile",
          followUpGate: "consumer_doctor",
        }),
        expect.objectContaining({
          marker: "skip_sub_doc",
          path: "docs/design/harness",
          reason: "dogfood_sub_doc_not_required_for_consumer_setup",
          nextRoute: "consumer_doctor_profile",
          followUpGate: "consumer_doctor",
        }),
        expect.objectContaining({
          marker: "skip_sub_doc",
          path: "docs/test-design",
          reason: "dogfood_sub_doc_not_required_for_consumer_setup",
          nextRoute: "consumer_doctor_profile",
          followUpGate: "consumer_doctor",
        }),
      ]),
    );
    expect(
      preview.importReport.skipSubDocs.filter(
        (record) => record.nextRoute === "review_import_report",
      ),
    ).toEqual([]);
    expect(preview.nextCommands).toEqual(
      expect.arrayContaining([
        "ut-tdd status --json",
        "ut-tdd completion decision-packet --json",
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        "ut-tdd doctor --profile consumer",
        "ut-tdd rename plan --json",
        "ut-tdd handover status --json",
        "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
      ]),
    );
    expect(preview.postSetupWorkflow.unmetGates).toEqual(
      expect.arrayContaining(["consumer_readiness:ut-tdd-cli", "consumer_readiness:runtime-cli"]),
    );
    expect(preview.postSetupWorkflow.nextActions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("bun link ut-tdd"),
        expect.stringContaining("ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml"),
      ]),
    );
    expect(preview.postSetupWorkflow.verificationCommands).toEqual([
      "ut-tdd setup project --dry-run",
      "ut-tdd status --json",
      "ut-tdd setup project --dry-run --json",
      "ut-tdd completion decision-packet --json",
      "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      "ut-tdd doctor --profile consumer",
      "ut-tdd rename plan --json",
      "ut-tdd handover status --json",
      "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    ]);
    expect(preview.postSetupWorkflow.dryRunVerificationCommands).toEqual([
      "ut-tdd setup project --dry-run",
      "ut-tdd status --json",
      "ut-tdd setup project --dry-run --json",
      "ut-tdd completion decision-packet --json",
      "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
      "ut-tdd rename plan --json",
      "ut-tdd handover status --json",
    ]);
    expect(preview.postSetupWorkflow.postApplyVerificationCommands).toEqual([
      "ut-tdd doctor --profile consumer",
      "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    ]);
    expect(preview.postSetupWorkflow.verificationMatrix).toEqual([
      expect.objectContaining({
        phase: "setup-dry-run",
        command: "ut-tdd setup project --dry-run",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        source: "VS Code workspace task contract",
        sourceUrl: "https://code.visualstudio.com/docs/debugtest/tasks",
        sourceCheckedAt: "2026-07-02",
        latestOfficialStatus: expect.stringContaining("VS Code Tasks official docs"),
        sourceStatusDelta: expect.stringContaining("none"),
        adoptionDecision: expect.stringContaining("自動実行"),
        adoptionDecisionDelta: expect.stringContaining("none"),
        workflowRouteImpact: expect.stringContaining("consumer doctor"),
      }),
      expect.objectContaining({
        phase: "status-frontier",
        command: "ut-tdd status --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        expected: expect.stringContaining("objective progress"),
        latestOfficialStatus: expect.stringContaining("local HELIX L3"),
      }),
      expect.objectContaining({
        phase: "github-ci-safety",
        command: "ut-tdd setup project --dry-run --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        expected: expect.stringContaining("contents:read permissions"),
        evidence: "setup project JSON attached to the first-run readiness record",
        source: "GitHub Actions secure use and workflow token permissions",
        sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
        sourceCheckedAt: "2026-07-02",
        latestOfficialStatus: expect.stringContaining("GITHUB_TOKEN"),
        adoptionDecision: expect.stringContaining("pull_request_target"),
        workflowRouteImpact: expect.stringContaining("CI permission"),
      }),
      expect.objectContaining({
        phase: "completion-decision-packet",
        command: "ut-tdd completion decision-packet --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        expected: expect.stringContaining("completionClaimAllowed=false"),
        evidence: "completion decision packet JSON attached to the first-run readiness record",
        source: "HELIX completion decision packet contract",
        sourceUrl: "docs/design/harness/L6-function-design/function-spec.md",
        adoptionDecision: expect.stringContaining("L14 完了 claim"),
        workflowRouteImpact: expect.stringContaining("fix_consumer_readiness"),
      }),
      expect.objectContaining({
        phase: "version-up-dry-run",
        command:
          "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        expected: expect.stringContaining("plan-only distribution tag upgrade packet"),
        source: "Semantic Versioning 2.0.0 and HELIX version-up dry-run contract",
        sourceUrl: "https://semver.org/",
        sourceCheckedAt: "2026-07-03",
        adoptionDecision: expect.stringContaining("distribution tag bump"),
        workflowRouteImpact: expect.stringContaining("fix_consumer_readiness"),
      }),
      expect.objectContaining({
        phase: "consumer-doctor",
        command: "ut-tdd doctor --profile consumer",
        writePolicy: "no-write",
        availability: "post-apply-or-projected",
        requiresMaterializedPaths: expect.arrayContaining([
          "AGENTS.md",
          ".vscode/tasks.json",
          ".ut-tdd/teams",
        ]),
        source: "VS Code Workspace Trust and consumer adapter safety contract",
        sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
        sourceCheckedAt: "2026-07-02",
        latestOfficialStatus: expect.stringContaining("VS Code Workspace Trust official docs"),
        sourceStatusDelta: expect.stringContaining("none"),
        adoptionDecision: expect.stringContaining("task.allowAutomaticTasks=off"),
        adoptionDecisionDelta: expect.stringContaining("none"),
        workflowRouteImpact: expect.stringContaining("fix_consumer_readiness"),
      }),
      expect.objectContaining({
        phase: "identifier-cutover-packet",
        command: "ut-tdd rename plan --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        expected: expect.stringContaining("blocked_pending_cutover_approval"),
        source: "PLAN-M-02 HELIX identifier rename cutover packet",
        sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
        adoptionDecision: expect.stringContaining("blocked packet"),
        workflowRouteImpact: expect.stringContaining("L14 cutover review"),
      }),
      expect.objectContaining({
        phase: "handover-route",
        command: "ut-tdd handover status --json",
        writePolicy: "no-write",
        availability: "dry-run-immediate",
        requiresMaterializedPaths: [],
        evidence: "handover status JSON attached to the first-run readiness record",
      }),
      expect.objectContaining({
        phase: "team-run-dry-run",
        command:
          "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        writePolicy: "no-write",
        availability: "post-apply-or-projected",
        requiresMaterializedPaths: [".ut-tdd/teams/default-hybrid.yaml"],
        source: "HELIX team definition schema and provider handover contract",
      }),
    ]);
    expect(
      preview.postSetupWorkflow.verificationMatrix.every(
        (row) =>
          row.latestOfficialStatus &&
          row.sourceStatusDelta &&
          row.writePolicy === "no-write" &&
          row.availability &&
          (row.availability === "dry-run-immediate" || row.requiresMaterializedPaths.length > 0) &&
          row.adoptionDecisionDelta &&
          row.workflowRouteImpact,
      ),
    ).toBe(true);
    expect(preview.postSetupWorkflow.blockedUntil).toContain(
      "PLAN-M-02 cutover/action-binding approval before using `helix setup project` or `.helix` state",
    );
    expect(dry.files.size).toBe(0);
    expect(dry.ghCalls.some((call) => call.includes("PUT"))).toBe(false);

    const wet = mockDeps({ templates: baseTemplates, isInteractive: false });
    const applied = runHelixProjectSetup(
      { phase: "0-A", dryRun: false, applyBranchProtection: false },
      wet,
    );
    expect(applied.written).toEqual(
      expect.arrayContaining([
        join(".vscode", "tasks.json"),
        join(".ut-tdd", "handover", ".gitkeep"),
      ]),
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain("2.0.0");
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain("HELIX: rename plan");
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "bun run ut-tdd rename plan --json",
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "HELIX: handover status",
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "bun run ut-tdd handover status --json",
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "HELIX: team run dry-run",
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    );
    const generatedTasks = JSON.parse(
      wet.files.get(join("/repo", ".vscode", "tasks.json")) ?? "{}",
    ) as {
      tasks?: Array<{
        label?: string;
        command?: string;
        type?: string;
        problemMatcher?: unknown;
        options?: unknown;
        runOptions?: unknown;
      }>;
    };
    expect(generatedTasks.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "HELIX: status",
          type: "shell",
          command: "bun run ut-tdd status",
          problemMatcher: [],
        }),
        expect.objectContaining({
          label: "HELIX: doctor",
          type: "shell",
          command: "bun run ut-tdd doctor --profile consumer",
          problemMatcher: [],
        }),
        expect.objectContaining({
          label: "HELIX: completion decision-packet",
          type: "shell",
          command: "bun run ut-tdd completion decision-packet --json",
          problemMatcher: [],
        }),
        expect.objectContaining({
          label: "HELIX: rename plan",
          type: "shell",
          command: "bun run ut-tdd rename plan --json",
          problemMatcher: [],
        }),
        expect.objectContaining({
          label: "HELIX: handover status",
          type: "shell",
          command: "bun run ut-tdd handover status --json",
          problemMatcher: [],
        }),
        expect.objectContaining({
          label: "HELIX: setup dry-run",
          type: "shell",
          command: "bun run ut-tdd setup project --dry-run",
          problemMatcher: [],
        }),
      ]),
    );
    for (const task of generatedTasks.tasks ?? []) {
      expect(task.options).toBeUndefined();
      expect(task.runOptions).toBeUndefined();
      expect(task.problemMatcher).toEqual([]);
    }
    expect(JSON.parse(wet.files.get(join("/repo", ".vscode", "settings.json")) ?? "{}")).toEqual({
      "task.allowAutomaticTasks": "off",
    });
    expect(wet.files.get(statePath)).toContain('"phase": "0-A"');
    expect(JSON.parse(wet.files.get(projectSetupStatePath) ?? "{}")).toMatchObject({
      schemaVersion: "helix-project-setup-state.v1",
      setupCommand: "ut-tdd setup project",
      phase: "0-A",
      objectiveBoundary: {
        scope: "consumer_setup_readiness_not_whole_program_completion",
        progressPercent: 90,
        completionClaimAllowed: false,
        completionPacketCommand: "ut-tdd completion decision-packet --json",
      },
      postSetupWorkflow: {
        verificationCommands: expect.arrayContaining(["ut-tdd completion decision-packet --json"]),
        verificationMatrix: expect.arrayContaining([
          expect.objectContaining({
            phase: "github-ci-safety",
            command: "ut-tdd setup project --dry-run --json",
            writePolicy: "no-write",
            evidence: "setup project JSON attached to the first-run readiness record",
          }),
          expect.objectContaining({
            phase: "team-run-dry-run",
            command:
              "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
            writePolicy: "no-write",
            requiresMaterializedPaths: [".ut-tdd/teams/default-hybrid.yaml"],
          }),
        ]),
      },
    });
    for (const value of wet.files.values()) {
      expect(value.toLowerCase()).not.toMatch(/(ghp_|github_pat_|token=|bearer )/);
    }
  });

  it("U-SETUP-016: brownfield HELIX project setup emits an import report instead of hiding skipped conflicts", () => {
    const deps = mockDeps({ templates: baseTemplates, isInteractive: false });
    deps.files.set(
      join("/repo", ".vscode", "tasks.json"),
      '{"version":"2.0.0","tasks":[{"label":"keep-existing"}]}\n',
    );
    deps.files.set(join("/repo", "AGENTS.md"), "# consumer rules\n");

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: false, applyBranchProtection: false },
      deps,
    );

    expect(result.importReport).toMatchObject({
      schemaVersion: "helix-project-import-report.v1",
      mode: "brownfield",
      dryRun: false,
      policy: "preserve_existing_then_review_import_report",
      requiresReview: true,
      nextRoute: "review_import_report",
    });
    expect(result.importReport.managedPaths).toEqual(
      expect.arrayContaining(["AGENTS.md", join(".vscode", "tasks.json")]),
    );
    expect(result.importReport.existingPaths).toEqual(
      expect.arrayContaining(["AGENTS.md", join(".vscode", "tasks.json")]),
    );
    expect(result.importReport.mergeableManagedBlockPaths).toContain("AGENTS.md");
    expect(result.importReport.writtenPaths).toContain("AGENTS.md");
    expect(result.importReport.skippedExistingPaths).toContain(join(".vscode", "tasks.json"));
    expect(result.importReport.skipSubDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          marker: "skip_sub_doc",
          path: "docs/plans",
          nextRoute: "consumer_doctor_profile",
          followUpGate: "consumer_doctor",
        }),
        expect.objectContaining({
          marker: "skip_sub_doc",
          path: join(".vscode", "tasks.json"),
          reason: "consumer_owned_path_preserved_for_staged_migration",
          nextRoute: "review_import_report",
          evidence: "importReport.skippedExistingPaths",
          followUpGate: "import_report_review",
        }),
      ]),
    );
    expect(result.importReport.reviewRequiredReasons).toContain(
      "existing_non_mergeable_paths_preserved",
    );
    expect(result.postSetupWorkflow).toMatchObject({
      schemaVersion: "helix-project-post-setup-workflow.v1",
      nextRoute: "review_import_report",
      importReportRoute: "review_import_report",
      readinessOk: false,
      manualDocSearchRequired: false,
    });
    expect(result.postSetupWorkflow.unmetGates).toContain("import_report_review");
    expect(result.postSetupWorkflow.nextActions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("importReport.skippedExistingPaths"),
        "import report 解消後に `ut-tdd setup project --dry-run` を再実行する",
      ]),
    );
    expect(result.written).not.toContain(join(".vscode", "tasks.json"));
    expect(deps.files.get(join("/repo", ".vscode", "tasks.json"))).toContain("keep-existing");
    expect(deps.files.get(join("/repo", "AGENTS.md"))).toContain("UT-TDD:managed:start");
  });

  it("U-SETUP-016: generated HELIX project setup reruns are idempotent and do not require import review", () => {
    const confirmMessages: string[] = [];
    const deps = mockDeps({
      templates: baseTemplates,
      isInteractive: false,
      confirm: (message) => {
        confirmMessages.push(message);
        return false;
      },
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const first = runHelixProjectSetup(
      { phase: "0-A", dryRun: false, applyBranchProtection: false },
      deps,
    );
    const second = runHelixProjectSetup(
      { phase: "0-A", dryRun: false, applyBranchProtection: false },
      deps,
    );

    expect(first.importReport).toMatchObject({
      mode: "fresh",
      requiresReview: false,
      nextRoute: "ready",
    });
    expect(second.importReport).toMatchObject({
      mode: "brownfield",
      requiresReview: false,
      nextRoute: "ready",
      skippedExistingPaths: [],
      reviewRequiredReasons: [],
    });
    expect(second.importReport.identicalManagedPaths).toEqual(
      expect.arrayContaining([
        "AGENTS.md",
        join(".vscode", "tasks.json"),
        join(".ut-tdd", "teams", "default-hybrid.yaml"),
      ]),
    );
    expect(second.importReport.skipSubDocs).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: join(".vscode", "tasks.json"),
          nextRoute: "review_import_report",
        }),
      ]),
    );
    expect(second.written).toEqual([]);
    expect(second.postSetupWorkflow).toMatchObject({
      nextRoute: "ready",
      importReportRoute: "ready",
      readinessOk: true,
      unmetGates: [],
    });
    expect(confirmMessages).toEqual([]);

    const agents = deps.files.get(join("/repo", "AGENTS.md")) as string;
    expect(agents.match(/UT-TDD:managed:start/g)).toHaveLength(1);
  });

  it("U-SETUP-017: HELIX project setup readiness records consumer CLI PATH resolution", () => {
    const deps = mockDeps({
      templates: baseTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness).toMatchObject({
      ok: true,
      mode: "codex-only",
      ci: { forkPullRequestSecrets: "not-required" },
      artifactReadiness: {
        ok: true,
        checks: expect.arrayContaining([
          expect.objectContaining({
            name: "adapter-guidance-connects-consumer-verification",
            ok: true,
            path: "AGENTS.md",
          }),
          expect.objectContaining({
            name: "claude-adapter-docs-carry-consumer-boundary",
            ok: true,
            path: "CLAUDE.md,.claude/CLAUDE.md",
          }),
          expect.objectContaining({
            name: "claude-surface-templates-carry-completion-preflight",
            ok: true,
            path: ".claude/agents,.claude/commands",
          }),
          expect.objectContaining({
            name: "vscode-tasks-are-manual-consumer-smoke",
            ok: true,
            path: join(".vscode", "tasks.json"),
          }),
          expect.objectContaining({
            name: "harness-check-ci-is-read-only-consumer-smoke",
            ok: true,
            path: join(".github", "workflows", "harness-check.yml"),
          }),
          expect.objectContaining({
            name: "escalation-stale-is-no-write-route-audit",
            ok: true,
            path: join(".github", "workflows", "escalation-stale.yml"),
          }),
          expect.objectContaining({
            name: "branch-protection-script-is-approval-only",
            ok: true,
            path: join("scripts", "setup-branch-protection.sh"),
          }),
          expect.objectContaining({
            name: "ut-tdd-baseline-paths-projected",
            ok: true,
            path: ".ut-tdd",
          }),
          expect.objectContaining({
            name: "default-hybrid-team-separates-worker-reviewer",
            ok: true,
            path: join(".ut-tdd", "teams", "default-hybrid.yaml"),
          }),
        ]),
      },
      objectiveBoundary: {
        scope: "consumer_setup_readiness_not_whole_program_completion",
        progressPercent: 90,
        completionClaimAllowed: false,
        objectiveAuditCommand: "ut-tdd status --json",
        completionPacketCommand: "ut-tdd completion decision-packet --json",
        versionUpPacketCommand: "ut-tdd version-up activation-packet --json",
        cutoverPacketCommand: "ut-tdd rename plan --json",
        distributionReference: {
          repo: "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
          mainHead: "e454190d433292f5e9409033823a05e9dad61b67",
          latestTag: "v0.1.3",
        },
        versionBinding: {
          localPackageVersion: "0.1.0",
          localDistributionTag: "v0.1.0",
          requestedDistributionTag: "v0.1.0",
          requestedTagMatchesPackageVersion: true,
          packLatestRequiresVersionUpActivation: true,
        },
      },
    });
    expect(result.consumerReadiness.objectiveBoundary.reason).toContain(
      "does not approve version-up activation",
    );
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "ut-tdd-cli",
          ok: true,
          message: "projected hook 用の `ut-tdd` が PATH 上で解決できる",
        }),
      ]),
    );
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "projected-consumer-artifacts",
          ok: true,
        }),
      ]),
    );
    expect(result.consumerReadiness.smokeScenarios).toContain(
      "consumer CI -> repository secret 不要で harness-check green",
    );
    expect(result.postSetupWorkflow).toMatchObject({
      nextRoute: "ready",
      importReportRoute: "ready",
      readinessOk: true,
      unmetGates: [],
      nextActions: [
        "`ut-tdd status --json` を実行する",
        "`ut-tdd setup project --dry-run --json` を実行し、githubPlan と consumerReadiness.ci.requires の read-only CI 境界を初回稼働証跡に保存する",
        "`ut-tdd completion decision-packet --json` を実行し、completionClaimAllowed=false と未完了 blocker queue を初回稼働証跡に保存する",
        "`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json` を実行し、distribution tag 更新が plan-only / mustNotApply のまま rollback と idempotency evidence を返すことを確認する",
        "`ut-tdd doctor --profile consumer` を実行する",
        "`ut-tdd rename plan --json` を実行し、PLAN-M-02 承認前の HELIX alias/state が blocked packet のままであることを確認する",
        "`ut-tdd handover status --json` を実行し、active handover または current PLAN route から開始する",
        "`ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json` を dry-run し、worker/reviewer の provider 分離を確認する",
      ],
    });
    expect(result.postSetupWorkflow.verificationMatrix.map((row) => row.phase)).toEqual([
      "setup-dry-run",
      "status-frontier",
      "github-ci-safety",
      "completion-decision-packet",
      "version-up-dry-run",
      "consumer-doctor",
      "identifier-cutover-packet",
      "handover-route",
      "team-run-dry-run",
    ]);
  });

  it("blocks setup readiness when projected VS Code tasks contain extra or automatic tasks", () => {
    const unsafeTasksTemplates = {
      ...baseTemplates,
      "project/.vscode/tasks.json": JSON.stringify(
        {
          version: "2.0.0",
          tasks: [
            {
              label: "HELIX: status",
              type: "shell",
              command: "bun run ut-tdd status",
              problemMatcher: [],
            },
            {
              label: "HELIX: doctor",
              type: "shell",
              command: "bun run ut-tdd doctor --profile consumer",
              problemMatcher: [],
              runOptions: { runOn: "folderOpen" },
            },
            {
              label: "HELIX: completion decision-packet",
              type: "shell",
              command: "bun run ut-tdd completion decision-packet --json",
              problemMatcher: [],
            },
            {
              label: "HELIX: rename plan",
              type: "shell",
              command: "bun run ut-tdd rename plan --json",
              problemMatcher: [],
            },
            {
              label: "HELIX: handover status",
              type: "shell",
              command: "bun run ut-tdd handover status --json",
              problemMatcher: [],
            },
            {
              label: "HELIX: setup dry-run",
              type: "shell",
              command: "bun run ut-tdd setup project --dry-run",
              problemMatcher: [],
            },
            {
              label: "HELIX: team run dry-run",
              type: "shell",
              command:
                "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
              problemMatcher: [],
            },
            {
              label: "consumer-extra",
              type: "shell",
              command: "echo unexpected extra task",
              problemMatcher: [],
            },
          ],
        },
        null,
        2,
      ),
    };
    const deps = mockDeps({
      templates: unsafeTasksTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "vscode-tasks-are-manual-consumer-smoke",
          ok: false,
          path: join(".vscode", "tasks.json"),
        }),
        expect.objectContaining({
          name: "vscode-automatic-tasks-disabled",
          ok: true,
          path: join(".vscode", "settings.json"),
        }),
      ]),
    );
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "projected-consumer-artifacts",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
    expect(result.postSetupWorkflow.unmetGates).toContain(
      "consumer_readiness:projected-consumer-artifacts",
    );
  });

  it("blocks setup readiness when VS Code settings only mention off outside task.allowAutomaticTasks", () => {
    const unsafeSettingsTemplates = {
      ...baseTemplates,
      "project/.vscode/settings.json": JSON.stringify({
        "task.allowAutomaticTasks": "on",
        note: "off",
      }),
    };
    const deps = mockDeps({
      templates: unsafeSettingsTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "vscode-automatic-tasks-disabled",
          ok: false,
          path: join(".vscode", "settings.json"),
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("U-SETUP-017: 0-B HELIX project setup readiness is bound to rendered team CODEOWNERS", () => {
    const deps = mockDeps({
      templates: baseTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      {
        phase: "0-B",
        dryRun: true,
        applyBranchProtection: false,
        teams: { tl: "@org/tl", qa: "@org/qa", po: "@org/po" },
      },
      deps,
    );

    expect(result.phase).toBe("0-B");
    expect(result.importReport.previewPaths).toContain(join(".github", "CODEOWNERS"));
    expect(result.consumerReadiness.ok).toBe(true);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "team-codeowners-are-rendered-for-0-b",
          path: join(".github", "CODEOWNERS"),
          ok: true,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("ready");
  });

  it("blocks 0-B readiness when CODEOWNERS keeps unresolved team placeholders", () => {
    const brokenTemplates = {
      ...baseTemplates,
      "team/CODEOWNERS": "* {{TL_TEAM}}\n/docs/ {{PO_TEAM}}\n/tests/ {{QA_TEAM}}\n",
    };
    const deps = mockDeps({
      templates: brokenTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-B", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "team-codeowners-are-rendered-for-0-b",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
    expect(result.postSetupWorkflow.unmetGates).toContain(
      "consumer_readiness:projected-consumer-artifacts",
    );
  });

  it("accepts consumer packageRoot scripts.ut-tdd as CLI resolution evidence", () => {
    const deps = mockDeps({
      templates: baseTemplates,
      packageRoot: "/repo/packages/app",
      commandAvailable: (name) => ["bun", "git", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });
    deps.files.set(
      join("/repo", "packages", "app", "package.json"),
      JSON.stringify({ scripts: { "ut-tdd": "bun run ../../src/cli.ts" } }),
    );

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness).toMatchObject({
      ok: false,
      workspace: {
        repoRoot: "/repo",
        packageRoot: "/repo/packages/app",
        monorepo: true,
      },
      cliResolution: {
        checkedFrom: "/repo/packages/app",
        resolved: false,
        strategy: "package-script",
        bareCommandResolved: false,
        packageScriptAvailable: true,
      },
    });
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "ut-tdd-cli",
          ok: false,
          message: expect.stringContaining("bare `ut-tdd`"),
        }),
        expect.objectContaining({
          name: "ut-tdd-package-script",
          ok: true,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
    expect(result.postSetupWorkflow.unmetGates).toContain("consumer_readiness:ut-tdd-cli");
  });

  it("blocks consumer readiness when projected setup artifacts do not carry the first-run HELIX route", () => {
    const brokenTemplates = {
      ...baseTemplates,
      "adapter/AGENTS.md": [
        "<!-- UT-TDD:managed:start -->",
        "# HELIX アダプター",
        "- Doctor: `ut-tdd doctor`",
        "<!-- UT-TDD:managed:end -->",
        "",
      ].join("\n"),
      "adapter/CLAUDE.md": [
        "<!-- UT-TDD:managed:start -->",
        "# HELIX 共有コンテキスト",
        "- `ut-tdd status`",
        "<!-- UT-TDD:managed:end -->",
        "",
      ].join("\n"),
      "adapter/.claude/commands/helix-test.md": "Run tests only.\n",
      "project/.ut-tdd/teams/default-hybrid.yaml": [
        "name: default-hybrid",
        "members:",
        "  - role: se",
        "    engine: codex-se",
        "",
      ].join("\n"),
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  pull_request_target:",
        "    branches: [main]",
        "permissions:",
        "  contents: write",
        "jobs:",
        "  harness-check:",
        "    steps:",
        "      - run: echo $" + "{{ secrets.GITHUB_TOKEN }}",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: brokenTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness).toMatchObject({
      ok: false,
      checks: expect.arrayContaining([
        expect.objectContaining({
          name: "adapter-guidance-connects-consumer-verification",
          ok: false,
        }),
        expect.objectContaining({
          name: "claude-adapter-docs-carry-consumer-boundary",
          ok: false,
        }),
        expect.objectContaining({
          name: "claude-surface-templates-carry-completion-preflight",
          ok: false,
        }),
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
          path: join(".github", "workflows", "harness-check.yml"),
        }),
        expect.objectContaining({
          name: "default-hybrid-team-separates-worker-reviewer",
          ok: false,
        }),
      ]),
    });
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "projected-consumer-artifacts",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow).toMatchObject({
      nextRoute: "fix_consumer_readiness",
      readinessOk: false,
    });
    expect(result.postSetupWorkflow.unmetGates).toContain(
      "consumer_readiness:projected-consumer-artifacts",
    );
  });

  it("blocks harness-check when workflow keeps contents read but adds any write permission", () => {
    const writePermissionTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "  pull-requests: write",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: writePermissionTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("U-SETUP-024: blocks consumer readiness when escalation workflow keeps placeholder or write-capable policy", () => {
    const brokenTemplates = {
      ...baseTemplates,
      "common/escalation-stale.yml": [
        "name: escalation-stale",
        "on:",
        "  schedule:",
        "    - cron: '0 0 * * 1'",
        "permissions:",
        "  issues: write",
        "jobs:",
        "  escalation-audit:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - run: echo escalation policy placeholder",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: brokenTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "escalation-stale-is-no-write-route-audit",
          ok: false,
          path: join(".github", "workflows", "escalation-stale.yml"),
        }),
      ]),
    );
    expect(result.postSetupWorkflow.unmetGates).toContain(
      "consumer_readiness:projected-consumer-artifacts",
    );
  });

  it("U-SETUP-022: blocks consumer readiness when branch protection script can mutate GitHub settings", () => {
    const mutatingTemplates = {
      ...baseTemplates,
      "team/setup-branch-protection.sh": [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "gh auth status",
        "gh api -X PUT repos/example/repo/branches/main/protection",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: mutatingTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "branch-protection-script-is-approval-only",
          ok: false,
          path: join("scripts", "setup-branch-protection.sh"),
        }),
      ]),
    );
  });

  it("U-SETUP-025: blocks consumer readiness when adapter hook JSON loses structured guard contract", () => {
    const brokenHookTemplates = {
      ...baseTemplates,
      "adapter/.claude/settings.json": JSON.stringify({
        hooks: {
          PreToolUse: [
            {
              matcher: "Agent|Task",
              hooks: [
                {
                  type: "command",
                  command: "ut-tdd hook agent-guard",
                  blockOnFailure: true,
                },
              ],
            },
            {
              matcher: "Edit|Write|MultiEdit",
              hooks: [
                {
                  type: "note",
                  command: "ut-tdd hook work-guard",
                  blockOnFailure: true,
                },
              ],
            },
            {
              matcher: "Bash",
              hooks: [
                {
                  type: "command",
                  command: "ut-tdd hook git-command-guard",
                  blockOnFailure: true,
                },
              ],
            },
          ],
          SessionStart: [{ hooks: [{ type: "command", command: "ut-tdd session start" }] }],
          Stop: [{ hooks: [{ type: "command", command: "ut-tdd session summary" }] }],
          SubagentStop: [{ hooks: [{ type: "command", command: "ut-tdd hook subagent-stop" }] }],
        },
      }),
      "adapter/.codex/hooks.json": JSON.stringify({
        hooks: {
          PreToolUse: [
            {
              matcher: "spawn_agent|spawn_agents_on_csv",
              hooks: [
                {
                  type: "command",
                  command: "ut-tdd hook agent-guard",
                  blockOnFailure: true,
                },
              ],
            },
            {
              matcher: "apply_patch|write_file",
              hooks: [
                {
                  type: "command",
                  command: "ut-tdd hook work-guard",
                  blockOnFailure: false,
                },
              ],
            },
            {
              matcher: "exec_command|local_shell",
              hooks: [
                {
                  type: "command",
                  command: "ut-tdd hook git-command-guard",
                  blockOnFailure: true,
                },
              ],
            },
          ],
          SessionStart: [{ hooks: [{ type: "command", command: "ut-tdd session start" }] }],
          PostToolUse: [
            {
              matcher: "apply_patch|write_file|exec_command|local_shell",
              hooks: [{ type: "command", command: "ut-tdd hook post-tool-use" }],
            },
          ],
          Stop: [{ hooks: [{ type: "command", command: "ut-tdd session summary" }] }],
        },
      }),
    };
    const deps = mockDeps({
      templates: brokenHookTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "claude-adapter-hooks-are-structured",
          ok: false,
          path: join(".claude", "settings.json"),
        }),
        expect.objectContaining({
          name: "codex-adapter-hooks-are-structured",
          ok: false,
          path: `${join(".codex", "config.toml")},${join(".codex", "hooks.json")}`,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when required smoke commands are present but an extra run command is added", () => {
    const extraRunTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "      - run: echo unexpected extra command",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: extraRunTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when exact commands exist but triggers or setup steps drift", () => {
    const driftedWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [develop]",
        "  pull_request:",
        "    branches: [develop]",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: driftedWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when checkout keeps git credentials after read-only checkout", () => {
    const credentialPersistingWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: credentialPersistingWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when custom env or setup-bun inputs are added to read-only smoke", () => {
    const inputExpandedWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "          token: $" + "{{ github.token }}",
        "      - uses: oven-sh/setup-bun@v2",
        "        with:",
        "          token: $" + "{{ github.token }}",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "        env:",
        "          HELIX_CI_MODE: read-only",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: inputExpandedWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when fixed commands can be skipped or soft-passed", () => {
    const softPassingWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "defaults:",
        "  run:",
        "    shell: bash",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    if: $" + "{{ false }}",
        "    continue-on-error: true",
        "    strategy:",
        "      fail-fast: false",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "        if: $" + "{{ false }}",
        "        continue-on-error: true",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: softPassingWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when job permissions or expression controls drift", () => {
    const controlledWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "concurrency: helix-consumer-smoke",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    permissions:",
        "      contents: write",
        "    environment: production",
        "    concurrency: helix-consumer-smoke-job",
        "    timeout-minutes: 1",
        "    continue-on-error: $" + "{{ true }}",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "        continue-on-error: false",
        "        shell: bash",
        "        timeout-minutes: 1",
        "        working-directory: .",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: controlledWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("blocks harness-check when extra triggers, actions, or bracket secret references are added", () => {
    const expandedWorkflowTemplates = {
      ...baseTemplates,
      "common/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "  workflow_dispatch:",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - uses: third-party/unpinned-action@v1",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd setup project --dry-run --json",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run ut-tdd completion decision-packet --json",
        "      - run: bun run ut-tdd doctor --profile consumer --json",
        "      - run: bun run ut-tdd rename plan --json",
        "        env:",
        "          TOKEN: $" + "{{ secrets [ 'API_TOKEN' ] }}",
        "      - run: bun run ut-tdd handover status --json",
        "      - run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
        "      - run: bun run test",
        "",
      ].join("\n"),
    };
    const deps = mockDeps({
      templates: expandedWorkflowTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: false },
      deps,
    );

    expect(result.consumerReadiness.ok).toBe(false);
    expect(result.consumerReadiness.artifactReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "harness-check-ci-is-read-only-consumer-smoke",
          ok: false,
        }),
      ]),
    );
    expect(result.postSetupWorkflow.nextRoute).toBe("fix_consumer_readiness");
  });

  it("U-SETUP-019: HELIX project setup exposes GitHub plan and doctor baseline as plan-only structures", () => {
    const deps = mockDeps({
      templates: baseTemplates,
      commandAvailable: (name) => ["bun", "git", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });
    const result = runHelixProjectSetup(
      { phase: "0-A", dryRun: true, applyBranchProtection: true },
      deps,
    );

    expect(result.branchProtection).toEqual({ applied: false, reason: "dry-run" });
    expect(result.githubPlan).toMatchObject({
      schemaVersion: "helix-project-github-plan.v1",
      planOnly: true,
      appliesRemote: false,
      applyCommandAvailable: false,
      workflowPath: ".github/workflows/harness-check.yml",
      requiredChecks: ["harness-check"],
      branchProtection: {
        status: "emit_only",
        scriptPath: "scripts/setup-branch-protection.sh",
        requiresHumanApproval: true,
      },
    });
    expect(result.written).toContain(result.githubPlan.branchProtection.scriptPath);
    expect(result.importReport.previewPaths).toContain(
      result.githubPlan.branchProtection.scriptPath,
    );
    expect(result.doctorBaseline).toEqual({
      schemaVersion: "helix-project-doctor-baseline.v1",
      planOnly: true,
      baselineCommands: result.postSetupWorkflow.verificationCommands,
      stateBaselinePaths: [
        ".ut-tdd/memory",
        ".ut-tdd/handover",
        ".ut-tdd/evidence",
        ".ut-tdd/teams",
      ],
      completionClaimAllowed: false,
      nextRouteSource: "postSetupWorkflow.nextRoute",
      evidencePath: ".ut-tdd/evidence",
    });
    expect(deps.ghCalls.some((call) => call.includes("PUT"))).toBe(false);
  });

  it("U-SETUP-021: HELIX project setup never applies branch protection without action-binding approval", () => {
    const ghAdmin = (args: string[]) => {
      const key = args.join(" ");
      if (key === "auth status") return { ok: true, stdout: "" };
      if (key === "api repos/{owner}/{repo}") {
        return { ok: true, stdout: JSON.stringify({ permissions: { admin: true } }) };
      }
      if (key.includes("-X PUT")) return { ok: true, stdout: "{}" };
      return { ok: true, stdout: "{}" };
    };
    const deps = mockDeps({
      templates: baseTemplates,
      isInteractive: true,
      gh: ghAdmin,
      confirm: () => true,
      commandAvailable: (name) => ["bun", "git", "gh", "ut-tdd", "codex"].includes(name),
      bunVersion: () => "1.3.14",
    });

    const result = runHelixProjectSetup(
      { phase: "0-B", dryRun: false, applyBranchProtection: true },
      deps,
    );

    expect(result.githubPlan).toMatchObject({
      planOnly: true,
      appliesRemote: false,
      applyCommandAvailable: false,
      branchProtection: {
        status: "emit_only",
        requiresHumanApproval: true,
      },
    });
    expect(result.branchProtection).toEqual({
      applied: false,
      reason: "action-binding-approval-required",
    });
    expect(deps.ghCalls).not.toContainEqual(["auth", "status"]);
    expect(deps.ghCalls.some((call) => call.includes("PUT"))).toBe(false);
  });

  it("U-SETUP-020: distributed HELIX adapter docs stay Japanese-first", () => {
    const repoTemplates = loadTemplates(process.cwd());
    const samples = [
      repoTemplates["adapter/AGENTS.md"],
      repoTemplates["adapter/CLAUDE.md"],
      repoTemplates["adapter/.claude/CLAUDE.md"],
      repoTemplates["adapter/.claude/agents/code-reviewer.md"],
      repoTemplates["adapter/.claude/agents/helix-tl.md"],
      repoTemplates["adapter/.claude/commands/build.md"],
      repoTemplates["adapter/.claude/commands/helix-status.md"],
      repoTemplates["adapter/.claude/commands/helix-test.md"],
      repoTemplates["project/.ut-tdd/teams/default-hybrid.yaml"],
      BUILTIN_GITHUB_TEMPLATES["adapter/AGENTS.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/CLAUDE.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/CLAUDE.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/agents/code-reviewer.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/agents/helix-tl.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/commands/build.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/commands/helix-status.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/commands/helix-test.md"],
      BUILTIN_GITHUB_TEMPLATES["project/.ut-tdd/teams/default-hybrid.yaml"],
      BUILTIN_GITHUB_TEMPLATES["common/recovery.md"],
      BUILTIN_GITHUB_TEMPLATES["common/add-feature.md"],
      BUILTIN_GITHUB_TEMPLATES["common/PULL_REQUEST_TEMPLATE.md"],
    ];

    for (const text of samples) {
      expect(text).toMatch(/[ぁ-んァ-ヶ一-龠]/);
      expect(text).not.toMatch(
        /This project uses|Use repository-local|Act as a|Required baseline|Run `ut-tdd|Do not put secrets|Project-owned instructions|Target: \$ARGUMENTS/,
      );
    }
  });

  it("U-SETUP-005: recordSetupState signals 4 フィールド strip / 上書き / token 非含", () => {
    const deps = mockDeps();
    const dirty = {
      ownerType: "Organization",
      collaborators: 4,
      hasCodeowners: true,
      hasBranchProtection: true,
      token: "ghp_secret", // 混入を試みる余分フィールド
    } as unknown as ProjectScale;
    recordSetupState(
      { phase: "0-B", decidedAt: "2026-06-02T00:00:00.000Z", decidedBy: "confirm", signals: dirty },
      deps,
    );
    const stored = JSON.parse(deps.files.get(statePath) as string) as SetupState;
    expect(Object.keys(stored.signals).sort()).toEqual([
      "collaborators",
      "hasBranchProtection",
      "hasCodeowners",
      "ownerType",
    ]);
    expect(deps.files.get(statePath)).not.toContain("ghp_secret"); // 余分フィールド strip
    expect(stored.phase).toBe("0-B");

    // 再実行 (phase 変更) → 上書きで最新のみ
    recordSetupState(
      { phase: "0-A", decidedAt: "2026-06-03T00:00:00.000Z", decidedBy: "flag", signals: dirty },
      deps,
    );
    const re = JSON.parse(deps.files.get(statePath) as string) as SetupState;
    expect(re.phase).toBe("0-A"); // append でなく上書き
  });

  it("U-SETUP-006: applyBranchProtection は承認未実装なら対話/adminでも gh 非実行", () => {
    const plan = planSetup("0-B", { dryRun: false });

    // apply≠true → emit-only、gh 呼ばれない
    const d1 = mockDeps({ isInteractive: true, gh: ghTeam });
    expect(applyBranchProtection(plan, d1, { apply: false })).toEqual({
      applied: false,
      reason: "emit-only",
    });
    expect(d1.ghCalls.length).toBe(0);

    // 非対話 + apply=true → non-interactive、gh 呼ばれない (ガバナンス封鎖)
    const d2 = mockDeps({ isInteractive: false, gh: ghTeam, confirm: () => true });
    expect(applyBranchProtection(plan, d2, { apply: true })).toEqual({
      applied: false,
      reason: "non-interactive",
    });
    expect(d2.ghCalls.length).toBe(0);

    // 対話 + admin + confirm が揃っても action-binding approval 入力が無ければ remote へ進まない。
    const d3 = mockDeps({ isInteractive: true, gh: ghTeam, confirm: () => true });
    expect(applyBranchProtection(plan, d3, { apply: true })).toEqual({
      applied: false,
      reason: "action-binding-approval-required",
    });
    expect(d3.ghCalls.length).toBe(0);
  });

  it("U-SETUP-007: runSetup 優先順 (flag > confirm > fallback) + 非対話 apply 封鎖", () => {
    // ① フラグあり → フラグ値採用
    const f = mockDeps({ templates: baseTemplates, isInteractive: true });
    expect(
      runSetup(
        {
          phase: "0-B",
          dryRun: true,
          applyBranchProtection: false,
          teams: { tl: "@a", qa: "@b", po: "@c" },
        },
        f,
      ).phase,
    ).toBe("0-B");

    // ② フラグ無し + 対話 + confirm yes → 推奨 phase (ここでは org 検出 → 0-B)
    const c = mockDeps({
      templates: baseTemplates,
      isInteractive: true,
      gh: ghTeam,
      confirm: () => true,
    });
    expect(runSetup({ dryRun: true, applyBranchProtection: false }, c).phase).toBe("0-B");

    // ③ フラグ無し + 非対話 → 0-A fallback (record は本実行=dryRun:false でのみ起きる)
    const nb = mockDeps({ templates: baseTemplates, isInteractive: false, gh: ghTeam });
    const r3 = runSetup({ dryRun: false, applyBranchProtection: false }, nb);
    expect(r3.phase).toBe("0-A");
    expect(JSON.parse(nb.files.get(statePath) as string).decidedBy).toBe("fallback");

    // ④ apply=true + 非対話 → branchProtection.applied=false (本実行で precondition 評価)
    const a = mockDeps({ templates: baseTemplates, isInteractive: false, gh: ghTeam });
    const r4 = runSetup({ phase: "0-B", dryRun: false, applyBranchProtection: true }, a);
    expect(r4.branchProtection.applied).toBe(false);
    expect(r4.branchProtection.reason).toBe("non-interactive");

    // ⑤ apply=true + 対話 + admin + confirm でも現行は action-binding approval が無いので止める。
    const ai = mockDeps({
      templates: baseTemplates,
      isInteractive: true,
      gh: ghTeam,
      confirm: () => true,
    });
    const r5 = runSetup({ phase: "0-B", dryRun: false, applyBranchProtection: true }, ai);
    expect(r5.branchProtection).toEqual({
      applied: false,
      reason: "action-binding-approval-required",
    });
    expect(ai.ghCalls).not.toContainEqual(["auth", "status"]);
    expect(ai.ghCalls.some((call) => call.includes("PUT"))).toBe(false);
  });

  it("U-SETUP-008: dryRun=true は副作用ゼロ (state 非書込 / gh 非呼出 / branch protection 非適用)", () => {
    // dry-run は preview のみ。--apply-branch-protection を併用しても remote へ進まない。
    const d = mockDeps({
      templates: baseTemplates,
      isInteractive: true,
      gh: ghTeam,
      confirm: () => true,
    });
    const r = runSetup({ phase: "0-B", dryRun: true, applyBranchProtection: true }, d);
    // state SSoT を書かない
    expect(d.files.get(statePath)).toBeUndefined();
    // 生成物 (CODEOWNERS 等) も書かない (path 一覧は返るが file store は空)
    expect(d.files.get(codeownersPath)).toBeUndefined();
    expect(r.written.length).toBeGreaterThan(0); // preview は path を列挙する
    // detectProjectScale の read-only gh は許容するが、applyBranchProtection の
    // mutating 経路 (auth status / -X PUT) には決して入らない。
    expect(d.ghCalls).not.toContainEqual(["auth", "status"]);
    expect(d.ghCalls.some((call) => call.includes("PUT"))).toBe(false);
    // branch protection は dry-run 理由で skip
    expect(r.branchProtection).toEqual({ applied: false, reason: "dry-run" });
  });

  it("U-SETUP-022: branch protection 生成 script は approval checklist のみで remote API を呼ばない", () => {
    const repoTemplates = loadTemplates(process.cwd());
    for (const script of [
      repoTemplates["team/setup-branch-protection.sh"],
      BUILTIN_GITHUB_TEMPLATES["team/setup-branch-protection.sh"],
    ]) {
      expect(script).toContain("action-binding approval");
      expect(script).toContain("remote GitHub API");
      expect(script).toContain("exit 2");
      expect(script).not.toContain("gh api -X PUT");
      expect(script).not.toContain("/branches/main/protection");
    }
  });

  it("U-SETUP-018: README quickstart points to the HELIX project setup workflow, not legacy setup shortcuts", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const quickstart = readme.match(/## 🚀 クイックスタート[\s\S]*?## ⚙️ セットアップ/)?.[0] ?? "";

    expect(readme).toContain("ut-tdd setup project --dry-run");
    expect(readme).toContain("ut-tdd rename plan --json");
    expect(readme).toContain("helix setup project");
    expect(readme).toContain("PLAN-M-02");
    expect(readme).toContain("`.ut-tdd`");
    expect(readme).toContain("`.helix`");
    expect(quickstart).not.toContain("setup --solo");
  });
});
