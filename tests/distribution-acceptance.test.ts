import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCleanDistributionPlan } from "../src/setup/index";

const repoRoot = process.cwd();

function walkCandidatePaths(root: string): string[] {
  const ignored = new Set([".git", "node_modules", "dist"]);
  const out: string[] = [];
  const walk = (dir: string, prefix = ""): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else {
        out.push(rel.replace(/\\/g, "/"));
      }
    }
  };
  walk(root);
  return out.sort();
}

function runBun(cwd: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", ...args], {
      cwd,
      encoding: "utf8",
      env,
      timeout: 120_000,
    });
  }
  return spawnSync("bun", args, { cwd, encoding: "utf8", env, timeout: 120_000 });
}

function runCommand(
  cwd: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", command, ...args], {
      cwd,
      encoding: "utf8",
      env,
      timeout: 120_000,
    });
  }
  return spawnSync(command, args, { cwd, encoding: "utf8", env, timeout: 120_000 });
}

function writeFakeCommand(root: string, name: string, output: string): string {
  const binDir = join(root, ".fake-bin");
  mkdirSync(binDir, { recursive: true });
  if (process.platform === "win32") {
    const path = join(binDir, `${name}.cmd`);
    writeFileSync(path, `@echo off\r\necho ${output}\r\nexit /b 0\r\n`, "utf8");
    return path;
  }
  const path = join(binDir, name);
  writeFileSync(path, `#!/bin/sh\necho ${output}\nexit 0\n`, { encoding: "utf8", mode: 0o755 });
  return path;
}

function pathWith(...parts: string[]): string {
  return parts.filter(Boolean).join(process.platform === "win32" ? ";" : ":");
}

function runWorkflowUtTdd(
  cwd: string,
  workflowCommand: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const prefix = "bun run ut-tdd ";
  expect(workflowCommand.startsWith(prefix)).toBe(true);
  return runBun(cwd, ["run", "ut-tdd", ...workflowCommand.slice(prefix.length).split(" ")], env);
}

describe("clean distribution local acceptance smoke", () => {
  it("U-SETUP-013 / AT-DIST-001: clean artifact installs and exposes the same core CLI surfaces", () => {
    const plan = buildCleanDistributionPlan({
      paths: walkCandidatePaths(repoRoot),
      sourceTag: "v0.1.0",
    });
    expect(plan.ok).toBe(true);
    expect(plan.missingRequired).toEqual([]);
    expect(plan.denylistViolations).toEqual([]);

    const cleanRoot = mkdtempSync(join(tmpdir(), "ut-tdd-clean-acceptance-"));
    try {
      for (const rel of plan.artifactPaths) {
        const from = join(repoRoot, rel);
        const to = join(cleanRoot, rel);
        mkdirSync(dirname(to), { recursive: true });
        cpSync(from, to, { recursive: true });
      }

      const fakeCodex = writeFakeCommand(cleanRoot, "codex", "codex 0.0.0");
      const fakeBin = dirname(fakeCodex);
      const bunInstall = join(cleanRoot, ".bun-install");
      const env = {
        ...process.env,
        BUN_INSTALL: bunInstall,
        PATH: pathWith(join(bunInstall, "bin"), fakeBin, process.env.PATH ?? ""),
        UT_TDD_CODEX_BIN: fakeCodex,
      };

      const install = runBun(cleanRoot, ["install", "--frozen-lockfile"], env);
      expect(install.status, install.stderr || install.stdout).toBe(0);

      const build = runBun(cleanRoot, ["run", "build"], env);
      expect(build.status, build.stderr || build.stdout).toBe(0);
      const packageJson = JSON.parse(readFileSync(join(cleanRoot, "package.json"), "utf8")) as {
        bin?: { "ut-tdd"?: string };
      };
      expect(packageJson.bin?.["ut-tdd"]).toBe("./dist/ut-tdd");
      expect(existsSync(join(cleanRoot, packageJson.bin?.["ut-tdd"] ?? ""))).toBe(true);

      const registerLink = runBun(cleanRoot, ["link"], env);
      expect(registerLink.status, registerLink.stderr || registerLink.stdout).toBe(0);

      const linkedS4Packet = runCommand(
        cleanRoot,
        "ut-tdd",
        ["s4", "decision-packet", "--help"],
        env,
      );
      expect(linkedS4Packet.status, linkedS4Packet.stderr || linkedS4Packet.stdout).toBe(0);
      expect(linkedS4Packet.stdout).toContain("Usage: ut-tdd s4 decision-packet");

      const linkedCompletionPacket = runCommand(
        cleanRoot,
        "ut-tdd",
        ["completion", "decision-packet", "--help"],
        env,
      );
      expect(
        linkedCompletionPacket.status,
        linkedCompletionPacket.stderr || linkedCompletionPacket.stdout,
      ).toBe(0);
      expect(linkedCompletionPacket.stdout).toContain("Usage: ut-tdd completion decision-packet");

      const linkedVersionUpPacket = runCommand(
        cleanRoot,
        "ut-tdd",
        ["version-up", "activation-packet", "--help"],
        env,
      );
      expect(
        linkedVersionUpPacket.status,
        linkedVersionUpPacket.stderr || linkedVersionUpPacket.stdout,
      ).toBe(0);
      expect(linkedVersionUpPacket.stdout).toContain("Usage: ut-tdd version-up activation-packet");

      const linkedRenamePacket = runCommand(cleanRoot, "ut-tdd", ["rename", "plan", "--help"], env);
      expect(
        linkedRenamePacket.status,
        linkedRenamePacket.stderr || linkedRenamePacket.stdout,
      ).toBe(0);
      expect(linkedRenamePacket.stdout).toContain("Usage: ut-tdd rename plan");

      const linkedRenameDistSmoke = runCommand(
        cleanRoot,
        "ut-tdd",
        ["rename", "dist-smoke", "--help"],
        env,
      );
      expect(
        linkedRenameDistSmoke.status,
        linkedRenameDistSmoke.stderr || linkedRenameDistSmoke.stdout,
      ).toBe(0);
      expect(linkedRenameDistSmoke.stdout).toContain("Usage: ut-tdd rename dist-smoke");

      const linkedActionBindingPacket = runCommand(
        cleanRoot,
        "ut-tdd",
        ["action-binding", "approval-packet", "--help"],
        env,
      );
      expect(
        linkedActionBindingPacket.status,
        linkedActionBindingPacket.stderr || linkedActionBindingPacket.stdout,
      ).toBe(0);
      expect(linkedActionBindingPacket.stdout).toContain(
        "Usage: ut-tdd action-binding approval-packet",
      );

      const status = runBun(cleanRoot, ["src/cli.ts", "status", "--json"], env);
      expect(status.status, status.stderr || status.stdout).toBe(0);
      const statusJson = JSON.parse(status.stdout);
      expect(statusJson.availableRuntimes).toContain("codex");

      const distribution = runBun(
        cleanRoot,
        ["src/cli.ts", "distribution", "plan", "--tag", "v0.1.0", "--json"],
        env,
      );
      expect(distribution.status, distribution.stderr || distribution.stdout).toBe(0);
      const distributionJson = JSON.parse(distribution.stdout);
      expect(distributionJson).toMatchObject({
        ok: true,
        export: {
          ok: true,
          missingRequired: [],
          denylistViolations: [],
        },
        readiness: {
          ok: true,
          objectiveBoundary: {
            progressPercent: 90,
            completionClaimAllowed: false,
            distributionReference: {
              repo: "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
              mainHead: "c583953f5fda9c406ff180ae700deefa0d6206ae",
              latestTag: "v0.1.3",
            },
            versionBinding: {
              localPackageVersion: "0.1.0",
              localDistributionTag: "v0.1.0",
              requestedDistributionTag: "v0.1.0",
              requestedTagMatchesPackageVersion: true,
              packLatestTag: "v0.1.3",
              packLatestRequiresVersionUpActivation: true,
            },
          },
        },
      });
      expect(distributionJson.export.artifactPaths).toContain("src/cli.ts");
      expect(
        distributionJson.export.artifactPaths.some((path: string) => path.startsWith("src/web/")),
      ).toBe(false);
      expect(distributionJson.export.artifactPaths).not.toContain("tests/web.test.ts");
      expect(distributionJson.export.artifactPaths).not.toContain(
        "docs/plans/PLAN-L7-157-distribution-clean-pull.md",
      );
      expect(distributionJson.actualCutRequiresPoApproval).toBe(true);

      const typecheck = runBun(cleanRoot, ["run", "typecheck"], env);
      expect(typecheck.status, typecheck.stderr || typecheck.stdout).toBe(0);

      const consumerRoot = mkdtempSync(join(tmpdir(), "helix-consumer-"));
      try {
        const linkConsumer = runBun(consumerRoot, ["link", "ut-tdd", "--no-save"], env);
        expect(linkConsumer.status, linkConsumer.stderr || linkConsumer.stdout).toBe(0);
        const linkedEnv = {
          ...env,
          PATH: pathWith(join(consumerRoot, "node_modules", ".bin"), env.PATH ?? ""),
        };

        const linkedVersion = runCommand(consumerRoot, "ut-tdd", ["--version"], linkedEnv);
        expect(linkedVersion.status, linkedVersion.stderr || linkedVersion.stdout).toBe(0);
        expect(linkedVersion.stdout.trim()).toBe("0.1.0");

        const setup = runCommand(consumerRoot, "ut-tdd", ["setup", "project", "--json"], linkedEnv);
        expect(setup.status, setup.stderr || setup.stdout).toBe(0);
        const setupJson = JSON.parse(setup.stdout);
        expect(setupJson).toMatchObject({
          schemaVersion: "helix-project-setup.v1",
          importReport: { mode: "fresh", requiresReview: false },
          consumerReadiness: {
            ok: true,
            objectiveBoundary: {
              scope: "consumer_setup_readiness_not_whole_program_completion",
              progressPercent: 90,
              completionClaimAllowed: false,
              versionBinding: {
                localDistributionTag: "v0.1.0",
                requestedDistributionTag: "v0.1.0",
                requestedTagMatchesPackageVersion: true,
                packLatestRequiresVersionUpActivation: true,
              },
            },
          },
          postSetupWorkflow: { nextRoute: "ready", manualDocSearchRequired: false },
        });
        expect(setupJson.consumerReadiness.objectiveBoundary.cutoverPacketCommand).toBe(
          "ut-tdd rename plan --json",
        );
        expect(["codex-only", "hybrid"]).toContain(setupJson.consumerReadiness.mode);
        expect(setupJson.written).toEqual(
          expect.arrayContaining(["AGENTS.md", ".vscode/tasks.json"]),
        );
        expect(readFileSync(join(consumerRoot, "AGENTS.md"), "utf8")).toContain("HELIX アダプター");
        expect(
          readFileSync(join(consumerRoot, ".claude", "agents", "code-reviewer.md"), "utf8"),
        ).toContain("consumer-safe な HELIX subagent");
        expect(
          readFileSync(join(consumerRoot, ".claude", "agents", "helix-tl.md"), "utf8"),
        ).toContain("ut-tdd doctor --profile consumer");
        expect(
          readFileSync(join(consumerRoot, ".claude", "commands", "helix-test.md"), "utf8"),
        ).toContain("ut-tdd status --json");
        expect(
          readFileSync(join(consumerRoot, ".github", "ISSUE_TEMPLATE", "recovery.md"), "utf8"),
        ).toContain("## 復旧手順");
        expect(
          readFileSync(join(consumerRoot, ".github", "ISSUE_TEMPLATE", "add-feature.md"), "utf8"),
        ).toContain("## 受け入れ条件");
        expect(
          readFileSync(join(consumerRoot, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf8"),
        ).toContain("## V-model artifact");
        const tasks = JSON.parse(readFileSync(join(consumerRoot, ".vscode", "tasks.json"), "utf8"));
        expect(tasks.tasks.map((task: { label: string }) => task.label)).toEqual(
          expect.arrayContaining([
            "HELIX: status",
            "HELIX: doctor",
            "HELIX: rename plan",
            "HELIX: handover status",
            "HELIX: team run dry-run",
          ]),
        );
        expect(tasks.tasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: "HELIX: doctor",
              command: "ut-tdd doctor --profile consumer",
            }),
            expect.objectContaining({
              label: "HELIX: rename plan",
              command: "ut-tdd rename plan --json",
            }),
            expect.objectContaining({
              label: "HELIX: team run dry-run",
              command:
                "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
            }),
          ]),
        );
        const generatedTeamDefinition = readFileSync(
          join(consumerRoot, ".ut-tdd", "teams", "default-hybrid.yaml"),
          "utf8",
        );
        expect(generatedTeamDefinition).toContain("name: default-hybrid");
        expect(generatedTeamDefinition).toContain("engine: codex-se");
        expect(generatedTeamDefinition).toContain("engine: pmo-sonnet");
        const workflow = readFileSync(
          join(consumerRoot, ".github", "workflows", "harness-check.yml"),
          "utf8",
        );
        expect(workflow).toContain("permissions:");
        expect(workflow).toContain("contents: read");
        expect(workflow).toContain("bun run ut-tdd --version");
        expect(workflow).toContain("bun run ut-tdd setup project --dry-run --json");
        expect(workflow).toContain("bun run ut-tdd status --json");
        expect(workflow).toContain("bun run ut-tdd doctor --profile consumer --json");
        expect(workflow).toContain("bun run ut-tdd rename plan --json");
        expect(workflow).toContain("bun run ut-tdd handover status --json");
        expect(workflow).toContain(
          "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        );
        const workflowUtTddCommands = [
          "bun run ut-tdd --version",
          "bun run ut-tdd setup project --dry-run --json",
          "bun run ut-tdd status --json",
          "bun run ut-tdd doctor --profile consumer --json",
          "bun run ut-tdd rename plan --json",
          "bun run ut-tdd handover status --json",
          "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
        ];
        for (const command of workflowUtTddCommands) {
          expect(workflow).toContain(command);
        }

        const statusFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          ["status", "--json"],
          linkedEnv,
        );
        expect(statusFromGeneratedPath.status, statusFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(statusFromGeneratedPath.stdout).availableRuntimes).toContain("codex");

        const doctorFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          ["doctor", "--profile", "consumer", "--json"],
          linkedEnv,
        );
        expect(doctorFromGeneratedPath.status, doctorFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(doctorFromGeneratedPath.stdout)).toMatchObject({ ok: true });

        const renamePlanFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          ["rename", "plan", "--json"],
          linkedEnv,
        );
        expect(renamePlanFromGeneratedPath.status, renamePlanFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(renamePlanFromGeneratedPath.stdout)).toMatchObject({
          status: "blocked_pending_cutover_approval",
          planOnly: true,
          mustNotApply: true,
        });

        const handoverFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          ["handover", "status", "--json"],
          linkedEnv,
        );
        expect(handoverFromGeneratedPath.status, handoverFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(handoverFromGeneratedPath.stdout)).toMatchObject({ exists: false });

        const teamRunFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          [
            "team",
            "run",
            "--definition",
            ".ut-tdd/teams/default-hybrid.yaml",
            "--mode",
            "hybrid",
            "--json",
          ],
          linkedEnv,
        );
        expect(teamRunFromGeneratedPath.status, teamRunFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(teamRunFromGeneratedPath.stdout)).toMatchObject({
          ok: true,
          team: "default-hybrid",
          dry_run: true,
        });

        const setupDryRunFromGeneratedPath = runCommand(
          consumerRoot,
          "ut-tdd",
          ["setup", "project", "--dry-run", "--json"],
          linkedEnv,
        );
        expect(setupDryRunFromGeneratedPath.status, setupDryRunFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(setupDryRunFromGeneratedPath.stdout)).toMatchObject({
          schemaVersion: "helix-project-setup.v1",
          importReport: { dryRun: true },
          postSetupWorkflow: {
            manualDocSearchRequired: false,
            verificationMatrix: expect.arrayContaining([
              expect.objectContaining({
                phase: "setup-dry-run",
                sourceUrl: "https://code.visualstudio.com/docs/debugtest/tasks",
              }),
              expect.objectContaining({
                phase: "consumer-doctor",
                sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
              }),
            ]),
          },
        });
        for (const command of workflowUtTddCommands) {
          const run = runWorkflowUtTdd(consumerRoot, command, linkedEnv);
          expect(run.status, run.stderr || run.stdout).toBe(0);
          if (command.endsWith("--version")) {
            expect(run.stdout.trim()).toBe("0.1.0");
          } else {
            expect(JSON.parse(run.stdout)).toBeTruthy();
          }
        }
      } finally {
        rmSync(consumerRoot, { recursive: true, force: true });
      }

      const brownfieldRoot = mkdtempSync(join(tmpdir(), "helix-brownfield-"));
      try {
        mkdirSync(join(brownfieldRoot, ".vscode"), { recursive: true });
        writeFileSync(
          join(brownfieldRoot, "AGENTS.md"),
          "# consumer rules\n\nこの行は consumer 側の既存ルール。\n",
          "utf8",
        );
        writeFileSync(
          join(brownfieldRoot, ".vscode", "tasks.json"),
          '{"version":"2.0.0","tasks":[{"label":"keep-existing"}]}\n',
          "utf8",
        );

        const firstBrownfieldSetup = runBun(
          brownfieldRoot,
          [join(cleanRoot, "src", "cli.ts"), "setup", "project", "--json"],
          env,
        );
        expect(firstBrownfieldSetup.status, firstBrownfieldSetup.stderr).toBe(0);
        const firstBrownfieldJson = JSON.parse(firstBrownfieldSetup.stdout);
        expect(firstBrownfieldJson).toMatchObject({
          importReport: {
            mode: "brownfield",
            requiresReview: true,
            nextRoute: "review_import_report",
          },
          postSetupWorkflow: { nextRoute: "review_import_report" },
        });
        expect(firstBrownfieldJson.importReport.skippedExistingPaths).toContain(
          ".vscode/tasks.json",
        );
        expect(firstBrownfieldJson.importReport.skipSubDocs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              marker: "skip_sub_doc",
              path: "docs/plans",
              reason: "dogfood_sub_doc_not_required_for_consumer_setup",
              nextRoute: "consumer_doctor_profile",
            }),
            expect.objectContaining({
              marker: "skip_sub_doc",
              path: ".vscode/tasks.json",
              reason: "consumer_owned_path_preserved_for_staged_migration",
              nextRoute: "review_import_report",
              followUpGate: "import_report_review",
            }),
          ]),
        );
        expect(firstBrownfieldJson.written).toContain("AGENTS.md");
        expect(firstBrownfieldJson.written).not.toContain(".vscode/tasks.json");

        const secondBrownfieldSetup = runBun(
          brownfieldRoot,
          [join(cleanRoot, "src", "cli.ts"), "setup", "project", "--json"],
          env,
        );
        expect(secondBrownfieldSetup.status, secondBrownfieldSetup.stderr).toBe(0);
        const secondBrownfieldJson = JSON.parse(secondBrownfieldSetup.stdout);
        expect(secondBrownfieldJson.importReport.nextRoute).toBe("review_import_report");

        const brownfieldAgents = readFileSync(join(brownfieldRoot, "AGENTS.md"), "utf8");
        expect(brownfieldAgents).toContain("この行は consumer 側の既存ルール。");
        expect(brownfieldAgents.match(/UT-TDD:managed:start/g) ?? []).toHaveLength(1);
        expect(brownfieldAgents).toContain("HELIX アダプター");
        expect(readFileSync(join(brownfieldRoot, ".vscode", "tasks.json"), "utf8")).toContain(
          "keep-existing",
        );
      } finally {
        rmSync(brownfieldRoot, { recursive: true, force: true });
      }
    } finally {
      rmSync(cleanRoot, { recursive: true, force: true });
    }
  }, 180_000);
});
