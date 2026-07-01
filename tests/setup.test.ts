import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyBranchProtection,
  buildCleanDistributionPlan,
  buildConsumerReadinessPlan,
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
  "adapter/AGENTS.md": [
    "<!-- UT-TDD:managed:start -->",
    "# HELIX アダプター",
    "",
    "- Status: `ut-tdd status`",
    "- Doctor: `ut-tdd doctor --profile consumer`",
    "- Handover: `ut-tdd handover`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/CLAUDE.md": [
    "<!-- UT-TDD:managed:start -->",
    "# HELIX 共有コンテキスト",
    "",
    "- `ut-tdd status`",
    "- `ut-tdd doctor --profile consumer`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/.claude/CLAUDE.md": [
    "<!-- UT-TDD:managed:start -->",
    "# Claude runtime アダプター",
    "",
    "- `ut-tdd handover`",
    "<!-- UT-TDD:managed:end -->",
    "",
  ].join("\n"),
  "adapter/.claude/settings.json": '{"hooks":{"SessionStart":[]}}\n',
  "adapter/.codex/config.toml": "[features]\nhooks = true\n",
  "project/.vscode/tasks.json": [
    "{",
    '  "version": "2.0.0",',
    '  "tasks": [',
    '    { "label": "HELIX: status", "type": "shell", "command": "ut-tdd status", "problemMatcher": [] },',
    '    { "label": "HELIX: doctor", "type": "shell", "command": "ut-tdd doctor --profile consumer", "problemMatcher": [] },',
    '    { "label": "HELIX: handover status", "type": "shell", "command": "ut-tdd handover status --json", "problemMatcher": [] },',
    '    { "label": "HELIX: setup dry-run", "type": "shell", "command": "ut-tdd setup project --dry-run", "problemMatcher": [] }',
    "  ]",
    "}",
    "",
  ].join("\n"),
  "project/.vscode/settings.json": '{"task.allowAutomaticTasks":"off"}\n',
  "project/.ut-tdd/memory/.gitkeep": "",
  "project/.ut-tdd/handover/.gitkeep": "",
  "project/.ut-tdd/evidence/.gitkeep": "",
  "common/harness-check.yml": "name: harness-check\n",
  "common/commitlint.config.js":
    "module.exports = { extends: ['@commitlint/config-conventional'] };\n",
  "common/escalation-stale.yml": "name: escalation-stale\n",
  "common/recovery.md": "# Recovery\n",
  "common/add-feature.md": "# Add-feature\n",
  "common/PULL_REQUEST_TEMPLATE.md": "## 概要\nCloses #\n",
  "team/CODEOWNERS": "* {{TL_TEAM}}\n/docs/ {{PO_TEAM}}\n/tests/ {{QA_TEAM}}\n",
  "team/setup-branch-protection.sh":
    "#!/usr/bin/env bash\ngh api -X PUT repos/{owner}/{repo}/branches/main/protection --input protection.json\n",
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
      expect(templates["adapter/.codex/config.toml"]).toContain("hooks = true");
      expect(templates["adapter/.codex/hooks.json"]).toContain("ut-tdd hook agent-guard");
      expect(templates["adapter/.codex/hooks.json"]).toContain("ut-tdd hook work-guard");
      expect(templates["adapter/.claude/agents/code-reviewer.md"]).toContain(
        "consumer-safe な HELIX subagent",
      );
      expect(templates["adapter/.claude/agents/helix-tl.md"]).toContain("HELIX workflow");
      expect(templates["adapter/.claude/commands/build.md"]).toContain("Command: build");
      expect(templates["adapter/.claude/commands/helix-status.md"]).toContain(
        "HELIX status と doctor 出力",
      );
      expect(templates["common/harness-check.yml"]).toContain("harness-check");
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
        ]),
      );
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
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
    expect(ready.checks.find((c) => c.name === "gh")).toMatchObject({ ok: false });
    expect(ready.checks.find((c) => c.name === "ut-tdd-cli")).toMatchObject({ ok: true });
    expect(ready.ci.requires).toContain("bun run test");
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
      "runtime-cli",
    ]);
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
          "ut-tdd doctor --profile consumer",
          "ut-tdd handover status --json",
        ],
        stateBaselinePaths: [".ut-tdd/memory", ".ut-tdd/handover", ".ut-tdd/evidence"],
        completionClaimAllowed: false,
        nextRouteSource: "postSetupWorkflow.nextRoute",
        evidencePath: ".ut-tdd/evidence",
      },
      branchProtection: { applied: false, reason: "dry-run" },
      vscode: {
        tasksPath: join(".vscode", "tasks.json"),
        statusTask: "HELIX: status",
        doctorTask: "HELIX: doctor",
        handoverTask: "HELIX: handover status",
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
        currentCommandAvailable: true,
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
      ]),
    );
    expect(preview.nextCommands).toEqual(
      expect.arrayContaining([
        "ut-tdd status --json",
        "ut-tdd doctor --profile consumer",
        "ut-tdd handover status --json",
      ]),
    );
    expect(preview.postSetupWorkflow.unmetGates).toEqual(
      expect.arrayContaining(["consumer_readiness:ut-tdd-cli", "consumer_readiness:runtime-cli"]),
    );
    expect(preview.postSetupWorkflow.nextActions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("bun link ut-tdd"),
        "HELIX work 開始前に `ut-tdd status --json`、`ut-tdd doctor --profile consumer`、`ut-tdd handover status --json` を実行する",
      ]),
    );
    expect(preview.postSetupWorkflow.verificationCommands).toEqual([
      "ut-tdd setup project --dry-run",
      "ut-tdd status --json",
      "ut-tdd doctor --profile consumer",
      "ut-tdd handover status --json",
    ]);
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
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "HELIX: handover status",
    );
    expect(wet.files.get(join("/repo", ".vscode", "tasks.json"))).toContain(
      "ut-tdd handover status --json",
    );
    expect(wet.files.get(statePath)).toContain('"phase": "0-A"');
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
    expect(result.importReport.reviewRequiredReasons).toContain(
      "existing_non_mergeable_paths_preserved",
    );
    expect(result.postSetupWorkflow).toMatchObject({
      schemaVersion: "helix-project-post-setup-workflow.v1",
      nextRoute: "review_import_report",
      importReportRoute: "review_import_report",
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
    });
    expect(result.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "ut-tdd-cli",
          ok: true,
          message: "projected hook 用の `ut-tdd` が PATH 上で解決できる",
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
        "`ut-tdd doctor --profile consumer` を実行する",
        "`ut-tdd handover status --json` を実行し、active handover または current PLAN route から開始する",
      ],
    });
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
    expect(result.doctorBaseline).toEqual({
      schemaVersion: "helix-project-doctor-baseline.v1",
      planOnly: true,
      baselineCommands: result.postSetupWorkflow.verificationCommands,
      stateBaselinePaths: [".ut-tdd/memory", ".ut-tdd/handover", ".ut-tdd/evidence"],
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
      repoTemplates["adapter/.claude/commands/build.md"],
      repoTemplates["adapter/.claude/commands/helix-status.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/AGENTS.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/CLAUDE.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/CLAUDE.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/agents/code-reviewer.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/commands/build.md"],
      BUILTIN_GITHUB_TEMPLATES["adapter/.claude/commands/helix-status.md"],
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

  it("U-SETUP-006: applyBranchProtection emit-only 既定 / 非対話封鎖 / 非 admin", () => {
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

    // 対話 + 認証ありだが admin でない → not-admin
    const ghNoAdmin = (args: string[]) => {
      const key = args.join(" ");
      if (key === "auth status") return { ok: true, stdout: "" };
      if (key === "api repos/{owner}/{repo}")
        return { ok: true, stdout: JSON.stringify({ permissions: { admin: false } }) };
      return { ok: false, stdout: "" };
    };
    const d3 = mockDeps({ isInteractive: true, gh: ghNoAdmin, confirm: () => true });
    expect(applyBranchProtection(plan, d3, { apply: true })).toEqual({
      applied: false,
      reason: "not-admin",
    });
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
