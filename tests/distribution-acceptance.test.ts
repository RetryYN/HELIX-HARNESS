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

// PLAN-L7-458-node-minimum-p0-p1
import {
  buildCleanDistributionPlan,
  CONSUMER_CI_RUN_COMMANDS,
  CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS,
  CONSUMER_VERSION_UP_DRY_RUN_BUN_COMMAND,
  cleanDistributionSourcePath,
  extractWorkflowRunCommands,
} from "../src/setup/index";

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
  const bunArgs =
    args[0] === "install"
      ? [args[0], "--cache-dir", join(cwd, ".bun-cache"), ...args.slice(1)]
      : args;
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", ...bunArgs], {
      cwd,
      encoding: "utf8",
      env,
      timeout: 120_000,
    });
  }
  return spawnSync("bun", bunArgs, { cwd, encoding: "utf8", env, timeout: 120_000 });
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

function writeFakeRemoteTagGit(root: string, tag: string): string {
  const binDir = join(root, ".fake-git-bin");
  mkdirSync(binDir, { recursive: true });
  const remoteUrl = "https://github.com/RetryYN/HELIX-HARNESS-OS.git";
  const ref = `refs/tags/${tag}`;
  if (process.platform === "win32") {
    const path = join(binDir, "git.cmd");
    writeFileSync(
      path,
      [
        "@echo off",
        'if not "%1"=="ls-remote" exit /b 11',
        'if not "%2"=="--tags" exit /b 12',
        `if not "%3"=="${remoteUrl}" exit /b 13`,
        `if not "%4"=="${ref}" exit /b 14`,
        `echo a148fd304a455e21e631d4dab3c36d59725b1034	${ref}`,
        "",
      ].join("\r\n"),
      "utf8",
    );
    return binDir;
  }
  const path = join(binDir, "git");
  writeFileSync(
    path,
    [
      "#!/bin/sh",
      `test "$1" = "ls-remote" || exit 11`,
      `test "$2" = "--tags" || exit 12`,
      `test "$3" = "${remoteUrl}" || exit 13`,
      `test "$4" = "${ref}" || exit 14`,
      `printf '%s\\t%s\\n' 'a148fd304a455e21e631d4dab3c36d59725b1034' '${ref}'`,
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
  return binDir;
}

function pathWith(...parts: string[]): string {
  return parts.filter(Boolean).join(process.platform === "win32" ? ";" : ":");
}

function runWorkflowHelix(
  cwd: string,
  workflowCommand: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const prefix = "bun run helix ";
  expect(workflowCommand.startsWith(prefix)).toBe(true);
  return runBun(cwd, ["run", "helix", ...workflowCommand.slice(prefix.length).split(" ")], env);
}

function runWorkflowCommand(
  cwd: string,
  workflowCommand: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (workflowCommand === "bun install --frozen-lockfile") {
    return runBun(cwd, ["install", "--frozen-lockfile"], env);
  }
  if (workflowCommand === "bun run typecheck") {
    return runBun(cwd, ["run", "typecheck"], env);
  }
  if (workflowCommand === "bun run test") {
    return runBun(cwd, ["run", "test"], env);
  }
  if (workflowCommand === CONSUMER_VERSION_UP_DRY_RUN_BUN_COMMAND) {
    const fakeGitBin = writeFakeRemoteTagGit(cwd, "v0.1.4");
    return runWorkflowHelix(cwd, workflowCommand, {
      ...env,
      PATH: pathWith(fakeGitBin, env.PATH ?? ""),
    });
  }
  if (workflowCommand.startsWith("bun run helix ")) {
    return runWorkflowHelix(cwd, workflowCommand, env);
  }
  throw new Error(`unsupported generated workflow command: ${workflowCommand}`);
}

describe("clean distribution local acceptance smoke", () => {
  it("IT-NCUT-004: Node source CLIとESM build artifactのversion・schema・exitを比較する", () => {
    const tsxCli = join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
    const sourceCli = join(repoRoot, "src", "cli.ts");
    const buildCli = join(repoRoot, "src", "build", "node-build-cli.ts");
    const artifact = join(repoRoot, "dist", "helix");
    const runNode = (args: string[]) =>
      spawnSync(process.execPath, args, {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
        timeout: 120_000,
      });

    const build = runNode([tsxCli, buildCli]);
    expect(build.status, build.stderr || build.stdout).toBe(0);
    expect(existsSync(artifact)).toBe(true);
    expect(readFileSync(artifact, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);

    for (const args of [["--version"], ["doctor", "--help"]]) {
      const source = runNode([tsxCli, sourceCli, ...args]);
      const built = runNode([artifact, ...args]);
      expect(source.status, source.stderr || source.stdout).toBe(0);
      expect(built.status, built.stderr || built.stdout).toBe(source.status);
      expect(built.stdout).toBe(source.stdout);
      expect(built.stderr).toBe(source.stderr);
    }

    const sourceStatus = runNode([tsxCli, sourceCli, "status", "--json"]);
    const builtStatus = runNode([artifact, "status", "--json"]);
    expect(sourceStatus.status, sourceStatus.stderr || sourceStatus.stdout).toBe(0);
    expect(builtStatus.status, builtStatus.stderr || builtStatus.stdout).toBe(0);
    const sourcePayload = JSON.parse(sourceStatus.stdout);
    const builtPayload = JSON.parse(builtStatus.stdout);
    expect(Object.keys(builtPayload).sort()).toEqual(Object.keys(sourcePayload).sort());
    expect(builtPayload).toMatchObject({ mode: sourcePayload.mode });
  });

  it("U-SETUP-013 / AT-DIST-001: clean artifact installs and exposes the same core CLI surfaces", () => {
    const plan = buildCleanDistributionPlan({
      paths: walkCandidatePaths(repoRoot),
      sourceTag: "v0.1.0",
    });
    expect(plan.ok).toBe(true);
    expect(plan.missingRequired).toEqual([]);
    expect(plan.denylistViolations).toEqual([]);

    const cleanRoot = mkdtempSync(join(tmpdir(), "helix-clean-acceptance-"));
    try {
      const sourcePaths = walkCandidatePaths(repoRoot);
      for (const rel of plan.artifactPaths) {
        const from = join(repoRoot, cleanDistributionSourcePath(rel, sourcePaths));
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
        HELIX_CODEX_BIN: fakeCodex,
      };

      const install = runBun(cleanRoot, ["install", "--frozen-lockfile"], env);
      expect(install.status, install.stderr || install.stdout).toBe(0);

      const build = runBun(cleanRoot, ["run", "build"], env);
      expect(build.status, build.stderr || build.stdout).toBe(0);
      const packageJson = JSON.parse(readFileSync(join(cleanRoot, "package.json"), "utf8")) as {
        bin?: { helix?: string };
        scripts?: { helix?: string };
      };
      expect(packageJson.bin?.helix).toBe("./dist/helix");
      expect(packageJson.scripts?.helix).toBe("tsx src/cli.ts");
      expect(existsSync(join(cleanRoot, packageJson.bin?.helix ?? ""))).toBe(true);

      const packageScriptVersion = runBun(cleanRoot, ["run", "helix", "--version"], env);
      expect(
        packageScriptVersion.status,
        packageScriptVersion.stderr || packageScriptVersion.stdout,
      ).toBe(0);
      expect(packageScriptVersion.stdout.trim()).toBe("0.1.0");

      const registerLink = runBun(cleanRoot, ["link"], env);
      expect(registerLink.status, registerLink.stderr || registerLink.stdout).toBe(0);

      const linkedS4Packet = runCommand(
        cleanRoot,
        "helix",
        ["s4", "decision-packet", "--help"],
        env,
      );
      expect(linkedS4Packet.status, linkedS4Packet.stderr || linkedS4Packet.stdout).toBe(0);
      expect(linkedS4Packet.stdout).toContain("Usage: helix s4 decision-packet");

      const linkedCompletionPacket = runCommand(
        cleanRoot,
        "helix",
        ["completion", "decision-packet", "--help"],
        env,
      );
      expect(
        linkedCompletionPacket.status,
        linkedCompletionPacket.stderr || linkedCompletionPacket.stdout,
      ).toBe(0);
      expect(linkedCompletionPacket.stdout).toContain("Usage: helix completion decision-packet");

      const linkedVersionUpPacket = runCommand(
        cleanRoot,
        "helix",
        ["version-up", "activation-packet", "--help"],
        env,
      );
      expect(
        linkedVersionUpPacket.status,
        linkedVersionUpPacket.stderr || linkedVersionUpPacket.stdout,
      ).toBe(0);
      expect(linkedVersionUpPacket.stdout).toContain("Usage: helix version-up activation-packet");

      const linkedRenamePacket = runCommand(cleanRoot, "helix", ["rename", "plan", "--help"], env);
      expect(
        linkedRenamePacket.status,
        linkedRenamePacket.stderr || linkedRenamePacket.stdout,
      ).toBe(0);
      expect(linkedRenamePacket.stdout).toContain("Usage: helix rename plan");

      const linkedRenameDistSmoke = runCommand(
        cleanRoot,
        "helix",
        ["rename", "dist-smoke", "--help"],
        env,
      );
      expect(
        linkedRenameDistSmoke.status,
        linkedRenameDistSmoke.stderr || linkedRenameDistSmoke.stdout,
      ).toBe(0);
      expect(linkedRenameDistSmoke.stdout).toContain("Usage: helix rename dist-smoke");

      const linkedActionBindingPacket = runCommand(
        cleanRoot,
        "helix",
        ["action-binding", "approval-packet", "--help"],
        env,
      );
      expect(
        linkedActionBindingPacket.status,
        linkedActionBindingPacket.stderr || linkedActionBindingPacket.stdout,
      ).toBe(0);
      expect(linkedActionBindingPacket.stdout).toContain(
        "Usage: helix action-binding approval-packet",
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
              repo: "RetryYN/HELIX-HARNESS-OS",
              mainHead: "unpublished",
              targetTag: "v0.1.4",
            },
            versionBinding: {
              localPackageVersion: "0.1.0",
              localDistributionTag: "v0.1.0",
              requestedDistributionTag: "v0.1.0",
              requestedTagMatchesPackageVersion: true,
              distributionTargetTag: "v0.1.4",
              distributionTargetRequiresVersionUpActivation: true,
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
        mkdirSync(join(consumerRoot, "packages", "noop"), { recursive: true });
        writeFileSync(
          join(consumerRoot, "packages", "noop", "package.json"),
          `${JSON.stringify({ name: "@consumer/noop", version: "0.0.0" }, null, 2)}\n`,
          "utf8",
        );
        writeFileSync(
          join(consumerRoot, "package.json"),
          `${JSON.stringify(
            {
              dependencies: {
                "@consumer/noop": "file:./packages/noop",
              },
              scripts: {
                helix: "helix",
                typecheck: 'bun -e "process.exit(0)"',
                test: 'bun -e "process.exit(0)"',
              },
            },
            null,
            2,
          )}\n`,
          "utf8",
        );
        const consumerInstall = runBun(consumerRoot, ["install"], env);
        expect(consumerInstall.status, consumerInstall.stderr || consumerInstall.stdout).toBe(0);

        const linkConsumer = runBun(consumerRoot, ["link", "helix", "--no-save"], env);
        expect(linkConsumer.status, linkConsumer.stderr || linkConsumer.stdout).toBe(0);
        const linkedEnv = {
          ...env,
          PATH: pathWith(join(consumerRoot, "node_modules", ".bin"), env.PATH ?? ""),
        };

        const linkedVersion = runCommand(consumerRoot, "helix", ["--version"], linkedEnv);
        expect(linkedVersion.status, linkedVersion.stderr || linkedVersion.stdout).toBe(0);
        expect(linkedVersion.stdout.trim()).toBe("0.1.0");

        const setup = runCommand(consumerRoot, "helix", ["setup", "project", "--json"], linkedEnv);
        expect(setup.status, setup.stderr || setup.stdout).toBe(0);
        const setupJson = JSON.parse(setup.stdout);
        const expectedPostSetupVerificationCommands = [
          "helix setup project --dry-run",
          "helix status --json",
          "helix setup project --dry-run --json",
          "helix completion decision-packet --json",
          "helix completion review-bundle --json",
          "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          "helix doctor --profile consumer",
          "helix rename plan --json",
          "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        ];
        const expectedDryRunVerificationCommands = expectedPostSetupVerificationCommands.filter(
          (command) =>
            command !== "helix doctor --profile consumer" &&
            command !==
              "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        );
        const expectedPostApplyVerificationCommands = [
          "helix doctor --profile consumer",
          "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        ];
        expect(setupJson).toMatchObject({
          schemaVersion: "helix-project-setup.v1",
          importReport: { mode: "brownfield", requiresReview: false },
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
                distributionTargetRequiresVersionUpActivation: true,
              },
            },
            ci: {
              distributionPackageSurface: {
                checked: true,
                ok: true,
                source: "package-script-probe",
                requiredCommands: expect.arrayContaining([
                  "bun run helix setup project --dry-run --json",
                  "bun run helix completion review-bundle --json",
                  "bun run helix doctor --profile consumer --json",
                ]),
                workflowRouteImpact: expect.stringContaining("fix_consumer_readiness"),
              },
            },
          },
          postSetupWorkflow: { nextRoute: "ready", manualDocSearchRequired: false },
        });
        expect(setupJson.postSetupWorkflow.verificationCommands).toEqual(
          expectedPostSetupVerificationCommands,
        );
        expect(setupJson.postSetupWorkflow.manualVerificationCommands).toEqual([
          "code --profile HELIX .",
        ]);
        expect(setupJson.postSetupWorkflow.dryRunVerificationCommands).toEqual(
          expectedDryRunVerificationCommands,
        );
        expect(setupJson.postSetupWorkflow.postApplyVerificationCommands).toEqual(
          expectedPostApplyVerificationCommands,
        );
        expect(
          setupJson.postSetupWorkflow.verificationMatrix.map((row: { phase: string }) => row.phase),
        ).toEqual([
          "setup-dry-run",
          "vscode-profile-open",
          "status-frontier",
          "github-ci-safety",
          "completion-decision-packet",
          "completion-review-bundle",
          "version-up-dry-run",
          "consumer-doctor",
          "identifier-cutover-packet",
          "continuation-status",
          "team-run-dry-run",
        ]);
        expect(setupJson.consumerReadiness.ci.requires).toEqual([
          "actions/checkout@v4 with persist-credentials=false",
          "oven-sh/setup-bun@v2",
          ...CONSUMER_CI_RUN_COMMANDS,
        ]);
        expect(setupJson.consumerReadiness.ci.packagePreflight).toMatchObject({
          installCommand: "bun install --frozen-lockfile",
          lockfiles: ["bun.lock", "bun.lockb"],
          requiredScripts: ["helix", "typecheck", "test"],
          scriptCommands: ["bun run helix --version", "bun run typecheck", "bun run test"],
          sourceUrl: "https://bun.com/docs/pm/cli/install",
          lockfileSourceUrl: "https://bun.com/docs/pm/lockfile",
          scriptsSourceUrl: "https://bun.com/docs/quickstart",
          sourceCheckedAt: "2026-07-03",
          latestOfficialStatus: expect.stringContaining("bun.lock"),
          adoptionDecision: expect.stringContaining("package.json scripts.helix/typecheck/test"),
        });
        expect(setupJson.consumerReadiness.objectiveBoundary.cutoverPacketCommand).toBe(
          "helix rename plan --json",
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
        ).toContain("helix doctor --profile consumer");
        expect(
          readFileSync(join(consumerRoot, ".claude", "commands", "helix-test.md"), "utf8"),
        ).toContain("helix status --json");
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
            "HELIX: status",
            "HELIX: team run dry-run",
          ]),
        );
        expect(tasks.tasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: "HELIX: doctor",
              command: "bun run helix doctor --profile consumer",
            }),
            expect.objectContaining({
              label: "HELIX: rename plan",
              command: "bun run helix rename plan --json",
            }),
            expect.objectContaining({
              label: "HELIX: team run dry-run",
              command:
                "bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
            }),
          ]),
        );
        const generatedTeamDefinition = readFileSync(
          join(consumerRoot, ".helix", "teams", "default-hybrid.yaml"),
          "utf8",
        );
        expect(generatedTeamDefinition).toContain("name: default-hybrid");
        expect(generatedTeamDefinition).toContain("engine: codex-se");
        expect(generatedTeamDefinition).toContain("engine: pmo-sonnet");
        const workflow = readFileSync(
          join(consumerRoot, ".github", "workflows", "harness-check.yml"),
          "utf8",
        );
        expect(extractWorkflowRunCommands(workflow)).toEqual([...CONSUMER_CI_RUN_COMMANDS]);
        expect(workflow).toContain("permissions:");
        expect(workflow).toContain("contents: read");
        expect(workflow).toContain("uses: actions/checkout@v4");
        expect(workflow).toContain("persist-credentials: false");
        expect(workflow).toContain("bun run helix --version");
        expect(workflow).toContain("bun run helix setup project --dry-run --json");
        expect(workflow).toContain("bun run helix status --json");
        expect(workflow).toContain("bun run helix completion decision-packet --json");
        expect(workflow).toContain("bun run helix completion review-bundle --json");
        expect(workflow).toContain("bun run helix doctor --profile consumer --json");
        expect(workflow).toContain("bun run helix rename plan --json");
        expect(workflow).toContain("bun run helix status --json");
        expect(workflow).toContain(
          "bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        );
        expect(CONSUMER_CI_RUN_COMMANDS).toEqual(
          expect.arrayContaining([
            "bun install --frozen-lockfile",
            "bun run helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
            "bun run typecheck",
            "bun run test",
          ]),
        );
        for (const command of CONSUMER_CI_RUN_COMMANDS) {
          expect(workflow).toContain(command);
        }
        const escalationWorkflow = readFileSync(
          join(consumerRoot, ".github", "workflows", "escalation-stale.yml"),
          "utf8",
        );
        expect(escalationWorkflow).toContain("name: escalation-stale");
        expect(escalationWorkflow).toContain("permissions:");
        expect(escalationWorkflow).toContain("contents: read");
        expect(escalationWorkflow).toContain("uses: actions/checkout@v4");
        expect(escalationWorkflow).toContain("persist-credentials: false");
        expect(escalationWorkflow).not.toMatch(/\b(?:placeholder|TODO|TBD|FIXME)\b/i);
        for (const command of CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS) {
          expect(escalationWorkflow).toContain(command);
        }
        const branchProtectionScript = readFileSync(
          join(consumerRoot, "scripts", "setup-branch-protection.sh"),
          "utf8",
        );
        expect(branchProtectionScript).toContain("gh auth status");
        expect(branchProtectionScript).toContain(".permissions.admin");
        expect(branchProtectionScript).toContain("gh api -X PUT");
        expect(branchProtectionScript).toContain("/branches/main/protection");
        expect(branchProtectionScript).toContain("harness-check");
        expect(branchProtectionScript).toContain("required_approving_review_count");
        expect(branchProtectionScript).not.toContain("GITHUB_TOKEN");
        expect(branchProtectionScript).not.toContain("secret");

        const statusFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          ["status", "--json"],
          linkedEnv,
        );
        expect(statusFromGeneratedPath.status, statusFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(statusFromGeneratedPath.stdout).availableRuntimes).toContain("codex");

        const completionPacketFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          ["completion", "decision-packet", "--json"],
          linkedEnv,
        );
        expect(
          completionPacketFromGeneratedPath.status,
          completionPacketFromGeneratedPath.stderr || completionPacketFromGeneratedPath.stdout,
        ).toBe(0);
        expect(JSON.parse(completionPacketFromGeneratedPath.stdout)).toMatchObject({
          ok: false,
          status: "blocked",
          semanticMeaningSummary: {
            completionClaimAllowed: false,
          },
          blockers: expect.arrayContaining(["consumer_setup_boundary"]),
          decisions: [
            expect.objectContaining({
              planId: "CONSUMER-SETUP-BOUNDARY",
              blockerReason: "consumer_setup_boundary",
              decisionPacketCommand: "helix completion decision-packet --json",
            }),
          ],
        });

        const doctorFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          ["doctor", "--profile", "consumer", "--json"],
          linkedEnv,
        );
        expect(
          doctorFromGeneratedPath.status,
          doctorFromGeneratedPath.stderr || doctorFromGeneratedPath.stdout,
        ).toBe(0);
        expect(JSON.parse(doctorFromGeneratedPath.stdout)).toMatchObject({ ok: true });

        const renamePlanFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          ["rename", "plan", "--json"],
          linkedEnv,
        );
        expect(renamePlanFromGeneratedPath.status, renamePlanFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(renamePlanFromGeneratedPath.stdout)).toMatchObject({
          status: "blocked_pending_cutover_approval",
          planOnly: true,
          mustNotApply: true,
        });

        const continuationFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          ["status", "--json"],
          linkedEnv,
        );
        expect(continuationFromGeneratedPath.status, continuationFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(continuationFromGeneratedPath.stdout)).toHaveProperty(
          "availableRuntimes",
        );

        const teamRunFromGeneratedPath = runCommand(
          consumerRoot,
          "helix",
          [
            "team",
            "run",
            "--definition",
            ".helix/teams/default-hybrid.yaml",
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
          "helix",
          ["setup", "project", "--dry-run", "--json"],
          linkedEnv,
        );
        expect(setupDryRunFromGeneratedPath.status, setupDryRunFromGeneratedPath.stderr).toBe(0);
        expect(JSON.parse(setupDryRunFromGeneratedPath.stdout)).toMatchObject({
          schemaVersion: "helix-project-setup.v1",
          importReport: { dryRun: true },
          postSetupWorkflow: {
            manualDocSearchRequired: false,
            verificationCommands: expectedPostSetupVerificationCommands,
            manualVerificationCommands: ["code --profile HELIX ."],
            dryRunVerificationCommands: expectedDryRunVerificationCommands,
            postApplyVerificationCommands: expectedPostApplyVerificationCommands,
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
        for (const command of CONSUMER_CI_RUN_COMMANDS) {
          const run = runWorkflowCommand(consumerRoot, command, linkedEnv);
          expect(run.status, run.stderr || run.stdout).toBe(0);
          if (command.endsWith("--version")) {
            expect(run.stdout.trim()).toBe("0.1.0");
          } else if (command === "bun run helix completion decision-packet --json") {
            expect(JSON.parse(run.stdout)).toMatchObject({
              ok: false,
              status: "blocked",
              semanticMeaningSummary: {
                completionClaimAllowed: false,
              },
              blockers: expect.arrayContaining(["consumer_setup_boundary"]),
            });
          } else if (command === "bun run helix completion review-bundle --json") {
            expect(JSON.parse(run.stdout)).toMatchObject({
              schemaVersion: "completion-review-bundle.v1",
              planOnly: true,
              mustNotDecide: true,
              mustNotApply: true,
              completionClaimAllowed: false,
              semanticBundleDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
            });
          } else if (command === "bun install --frozen-lockfile") {
            expect(readFileSync(join(consumerRoot, "bun.lock"), "utf8")).toContain(
              "lockfileVersion",
            );
            const relinkCurrentCleanArtifact = runBun(
              consumerRoot,
              ["link", "helix", "--no-save"],
              env,
            );
            expect(
              relinkCurrentCleanArtifact.status,
              relinkCurrentCleanArtifact.stderr || relinkCurrentCleanArtifact.stdout,
            ).toBe(0);
          } else if (command === "bun run typecheck" || command === "bun run test") {
            expect(run.stderr).toContain('bun -e "process.exit(0)"');
          } else {
            expect(JSON.parse(run.stdout)).toBeTruthy();
          }
        }
        for (const command of CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS) {
          if (!command.startsWith("bun run helix ")) continue;
          const run = runWorkflowHelix(consumerRoot, command, linkedEnv);
          expect(run.status, run.stderr || run.stdout).toBe(0);
          expect(JSON.parse(run.stdout)).toBeTruthy();
        }
      } finally {
        rmSync(consumerRoot, { recursive: true, force: true });
      }

      const freshConsumerRoot = mkdtempSync(join(tmpdir(), "helix-fresh-consumer-"));
      try {
        const freshLinkedEnv = {
          ...env,
          PATH: pathWith(join(freshConsumerRoot, "node_modules", ".bin"), env.PATH ?? ""),
        };
        const freshSetup = runCommand(
          freshConsumerRoot,
          "helix",
          ["setup", "project", "--json"],
          freshLinkedEnv,
        );
        expect(freshSetup.status, freshSetup.stderr || freshSetup.stdout).toBe(0);
        const freshSetupJson = JSON.parse(freshSetup.stdout);
        expect(freshSetupJson).toMatchObject({
          schemaVersion: "helix-project-setup.v1",
          importReport: { mode: "fresh", requiresReview: false },
          consumerReadiness: { ok: true },
          postSetupWorkflow: { nextRoute: "ready", readinessOk: true },
        });
        expect(freshSetupJson.written).toEqual(
          expect.arrayContaining(["package.json", "bun.lock", ".vscode/tasks.json"]),
        );
        const generatedPackage = JSON.parse(
          readFileSync(join(freshConsumerRoot, "package.json"), "utf8"),
        ) as {
          devDependencies?: Record<string, string>;
          scripts?: Record<string, string>;
        };
        expect(generatedPackage.scripts).toMatchObject({
          helix: "helix",
          typecheck: "bun run helix status --json",
          test: "bun run helix completion review-bundle --json",
        });
        expect(generatedPackage.devDependencies?.helix).toBe("github:RetryYN/HELIX-HARNESS");
        expect(generatedPackage.devDependencies?.typescript).toBe("^5.6.3");
        expect(readFileSync(join(freshConsumerRoot, "bun.lock"), "utf8")).toContain(
          "lockfileVersion",
        );
        const linkFreshConsumer = runBun(freshConsumerRoot, ["link", "helix", "--no-save"], env);
        expect(linkFreshConsumer.status, linkFreshConsumer.stderr || linkFreshConsumer.stdout).toBe(
          0,
        );
        for (const args of [
          ["run", "helix", "--version"],
          ["run", "typecheck"],
          ["run", "test"],
        ]) {
          const run = runBun(freshConsumerRoot, args, freshLinkedEnv);
          expect(run.status, run.stderr || run.stdout).toBe(0);
        }
        const freshDoctor = runCommand(
          freshConsumerRoot,
          "helix",
          ["doctor", "--profile", "consumer", "--json"],
          freshLinkedEnv,
        );
        expect(freshDoctor.status, freshDoctor.stderr || freshDoctor.stdout).toBe(0);
        expect(JSON.parse(freshDoctor.stdout)).toMatchObject({ ok: true });
      } finally {
        rmSync(freshConsumerRoot, { recursive: true, force: true });
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
        expect(brownfieldAgents.match(/HELIX:managed:start/g) ?? []).toHaveLength(1);
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
