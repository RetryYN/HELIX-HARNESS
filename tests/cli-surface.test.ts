import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SUMMARY_SURFACE_CONTRACTS } from "../src/runtime/summary-surface-audit";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const helixEnvPrefix = ["HE", "LIX"].join("");

function runCli(args: string[]) {
  return runCliIn(repoRoot, args);
}

function runCliIn(
  cwd: string,
  args: string[],
  env: NodeJS.ProcessEnv = { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", cliPath, ...args], {
      cwd,
      encoding: "utf8",
      env,
    });
  }
  return spawnSync("bun", [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env,
  });
}

function runRepoScriptHelix(args: string[]) {
  if (process.platform === "win32") {
    return spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(repoRoot, "scripts", "helix.ps1"),
        ...args,
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );
  }
  return spawnSync(join(repoRoot, "scripts", "helix"), args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function writeObjectiveAuditFixture(root: string): void {
  const governanceDir = join(root, "docs", "governance");
  mkdirSync(governanceDir, { recursive: true });
  writeFileSync(
    join(governanceDir, "helix-objective-evidence-audit.md"),
    [
      "| ID | Requirement | Status | Evidence | Note |",
      "|---|---|---|---|---|",
      "| G-01 | fixture | proved | fixture | fixture |",
      "| G-02 | fixture | proved | fixture | fixture |",
      "| G-03 | fixture | proved | fixture | fixture |",
      "| G-04 | fixture | proved | fixture | fixture |",
      "| G-05 | fixture | proved | fixture | fixture |",
      "| G-06 | fixture | proved | fixture | fixture |",
      "| G-07 | fixture | proved | fixture | fixture |",
      "| G-08 | fixture | proved | fixture | fixture |",
      "| G-09 | fixture | proved | fixture | fixture |",
      "| G-10 | fixture | proved | fixture | outstanding.completionReadiness.ok=true |",
    ].join("\n"),
    "utf8",
  );
}

function writeFakeProvider(binDir: string, name: "codex" | "claude"): string {
  const rawEnv = [helixEnvPrefix, "ALLOW", "RAW", name.toUpperCase()].join("_");
  const reasonEnv = [helixEnvPrefix, "RAW", name.toUpperCase(), "REASON"].join("_");
  if (process.platform === "win32") {
    const path = join(binDir, `${name}.cmd`);
    writeFileSync(
      path,
      [
        "@echo off",
        `echo noisy-${name}`,
        `echo raw=%${rawEnv}% > ${name}-env.txt`,
        `echo reason=%${reasonEnv}% >> ${name}-env.txt`,
        `echo effort=%CLAUDE_CODE_EFFORT_LEVEL% >> ${name}-env.txt`,
        `echo args=%* >> ${name}-env.txt`,
        "exit /b 0",
        "",
      ].join("\r\n"),
    );
    return path;
  }
  const path = join(binDir, name);
  writeFileSync(
    path,
    [
      "#!/bin/sh",
      `echo noisy-${name}`,
      `printf "raw=%s\\nreason=%s\\neffort=%s\\nargs=%s\\n" "$${rawEnv}" "$${reasonEnv}" "$CLAUDE_CODE_EFFORT_LEVEL" "$*" > ${name}-env.txt`,
      "exit 0",
      "",
    ].join("\n"),
  );
  chmodSync(path, 0o755);
  return path;
}

function writeFakeCommand(binDir: string, name: string, output = "0.0.0", exitCode = 0): string {
  if (process.platform === "win32") {
    const path = join(binDir, `${name}.cmd`);
    writeFileSync(path, `@echo off\r\necho ${name} ${output}\r\nexit /b ${exitCode}\r\n`, "utf8");
    return path;
  }
  const path = join(binDir, name);
  writeFileSync(path, `#!/bin/sh\necho ${name} ${output}\nexit ${exitCode}\n`, {
    encoding: "utf8",
    mode: 0o755,
  });
  chmodSync(path, 0o755);
  return path;
}

function writeFakeGitLsRemote(
  binDir: string,
  packHead = "unpublished",
  latestTag = "unpublished",
): string {
  if (process.platform === "win32") {
    const path = join(binDir, "git.cmd");
    writeFileSync(
      path,
      [
        "@echo off",
        "set args=%*",
        'echo %args% | findstr /C:"credential.helper=" >nul',
        "if errorlevel 1 (",
        "  echo missing credential helper isolation 1>&2",
        "  exit /b 2",
        ")",
        'echo %args% | findstr /C:"--tags" >nul',
        "if not errorlevel 1 (",
        latestTag === "unpublished"
          ? "  exit /b 0"
          : `  echo a148fd304a455e21e631d4dab3c36d59725b1034 refs/tags/${latestTag}`,
        "  exit /b 0",
        ")",
        'echo %args% | findstr /C:"HELIX-HARNESS-OS.git" >nul',
        "if not errorlevel 1 (",
        `  echo ${packHead} refs/heads/main`,
        "  exit /b 0",
        ")",
        "echo b828fcf64c204d1cfa65c729fa590ca9562adccc refs/heads/main",
        "exit /b 0",
        "",
      ].join("\r\n"),
      "utf8",
    );
    return path;
  }
  const path = join(binDir, "git");
  writeFileSync(
    path,
    [
      "#!/bin/sh",
      'case "$*" in',
      '  *"credential.helper="*) ;;',
      '  *) echo "missing credential helper isolation" >&2; exit 2 ;;',
      "esac",
      'case "$*" in',
      latestTag === "unpublished"
        ? '  *"HELIX-HARNESS-OS.git"*"--tags"*|*"--tags"*"HELIX-HARNESS-OS.git"*) ;;'
        : `  *"HELIX-HARNESS-OS.git"*"--tags"*|*"--tags"*"HELIX-HARNESS-OS.git"*) echo 'a148fd304a455e21e631d4dab3c36d59725b1034 refs/tags/${latestTag}' ;;`,
      '  *"HELIX-HARNESS-OS.git"*)',
      `    echo '${packHead} refs/heads/main'`,
      "    ;;",
      "  *)",
      "    echo 'b828fcf64c204d1cfa65c729fa590ca9562adccc refs/heads/main'",
      "    ;;",
      "esac",
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
  chmodSync(path, 0o755);
  return path;
}

describe("L7 CLI surface closure", () => {
  it("keeps CLI --version bound to package.json version", () => {
    const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      version: string;
    };
    const run = runCli(["--version"]);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(run.stdout.trim()).toBe(packageJson.version);
  });

  it("exposes external agent catalog watch as a read-only audit surface", () => {
    const run = runCli(["audit", "agent-catalog", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      schema_version: "agent-catalog-watch.v1",
      source_command: "helix audit agent-catalog --json",
      unclassified_count: 0,
    });
    expect(payload.inventory_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.capability_family_counts.code_automation).toBeGreaterThan(0);
  });

  it("exposes runtime capability route decisions with evidence paths", () => {
    const run = runCli([
      "runtime",
      "capabilities",
      "--runtime",
      "codex",
      "--requires",
      "tool_shell",
      "hooks",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      schema_version: "runtime-capability-matrix.v1",
      route_decision: {
        runtime: "codex",
        missing: [],
      },
    });
    expect(payload.route_decision.evidence_paths).toContain("src/runtime/hosted-preflight.ts");
  });

  it("exposes isolated worktree dry-run packets without creating worktrees", () => {
    const run = runCli(["run", "isolate", "--dry-run", "--allow-dirty", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      schema_version: "isolated-worktree-sandbox-runner.v1",
      mode: "dry-run",
      credential_policy: "no_credentials",
      cleanup_requires: {
        explicit_target_path: true,
        dry_run_evidence: true,
      },
    });
    expect(payload.rollback_command).toContain("git worktree remove --force");
  });

  it("exposes the agent session board as a read-only command-center surface", () => {
    const run = runCli(["sessions", "board", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      schema_version: "agent-session-command-center.v1",
      source_command: "helix sessions board --json",
    });
    expect(Array.isArray(payload.rows)).toBe(true);
  });

  it("exposes agent locks and mailbox dry-run packets", () => {
    const locks = runCli([
      "agent",
      "locks",
      "--lock",
      "a:s1:src/cli.ts",
      "--lock",
      "b:s2:src/cli.ts",
      "--json",
    ]);
    const lockPayload = JSON.parse(locks.stdout);
    expect(locks.status).toBe(1);
    expect(lockPayload).toMatchObject({
      ok: false,
      schema_version: "agent-mailbox-conflict-locks.v1",
      conflicts: [expect.objectContaining({ path: "src/cli.ts" })],
    });

    const message = runCli([
      "agent",
      "message",
      "--dry-run",
      "--from",
      "s1",
      "--to",
      "s2",
      "--plan",
      "PLAN-L7-365",
      "--task",
      "coordinate",
      "--body",
      "hello",
      "--json",
    ]);
    const messagePayload = JSON.parse(message.stdout);
    expect(message.status, message.stderr || message.stdout).toBe(0);
    expect(messagePayload).toMatchObject({
      dry_run: true,
      from_session_id: "s1",
      to_session_id: "s2",
      plan_id: "PLAN-L7-365",
    });
  });

  it("exposes autonomous loop receipts as restartable JSON packets", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-loop-receipt-"));
    try {
      mkdirSync(join(root, ".helix", "state", "loop"), { recursive: true });
      writeFileSync(
        join(root, ".helix", "state", "loop", "PLAN-L7-366.json"),
        JSON.stringify({
          planId: "PLAN-L7-366",
          status: "running",
          iteration: 1,
          maxIterations: 2,
          lastVerdict: "pending",
          workerProvider: "codex",
          verifierProvider: "claude",
          blockedReason: null,
          windowOpensAt: "2026-07-09T09:00:00.000Z",
          windowClosesAt: "2026-07-09T11:00:00.000Z",
          costUsd: 0,
          updatedAt: "2026-07-09T10:00:00.000Z",
        }),
      );
      writeFileSync(
        join(root, ".helix", "state", "loop", "PLAN-L7-366.iterations.jsonl"),
        `${JSON.stringify({ iteration: 1 })}\n`,
      );
      const run = runCliIn(root, ["loop", "receipt", "--plan", "PLAN-L7-366", "--json"]);
      const payload = JSON.parse(run.stdout);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        schema_version: "autonomous-loop-run-receipts.v1",
        restartable_next_action: "helix loop run --plan PLAN-L7-366 --once",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes candidate council decisions without applying candidates", () => {
    const candidateJson = JSON.stringify([
      {
        candidate_id: "candidate-a",
        worker_session_id: "s1",
        verifier_session_id: "s2",
        worktree_path: ".helix/worktrees/a",
        replay_command: "bun test tests/a.test.ts",
        diff_summary: "changed implementation",
        risk_findings: [],
        evidence_path: "tests/a.test.ts",
      },
    ]);
    const run = runCli(["candidate", "council", "--candidate-json", candidateJson, "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      schema_version: "parallel-candidate-verifier-council.v1",
      selected_candidate_id: "candidate-a",
      merge_policy: "delegate_to_existing_github_gate",
    });
  });

  it("exposes telemetry session provenance as a read-only surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-telemetry-sessions-"));
    try {
      const codexDir = join(root, "codex");
      mkdirSync(codexDir, { recursive: true });
      writeFileSync(
        join(codexDir, "session-a.jsonl"),
        [
          JSON.stringify({ payload: { model: "gpt-5.3-codex" } }),
          JSON.stringify({
            tool_call: { command: "bun test tests/example.test.ts" },
          }),
        ].join("\n"),
      );
      const run = runCliIn(root, [
        "telemetry",
        "sessions",
        "--claude-dir",
        join(root, "claude"),
        "--codex-dir",
        codexDir,
        "--json",
      ]);
      const payload = JSON.parse(run.stdout);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        schema_version: "agent-observability-provenance.v1",
        read_only: true,
        source_command: "helix telemetry sessions --json",
      });
      expect(payload.command_digests[0].command_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes skill hygiene as a dry-run report", () => {
    const run = runCli(["skill", "hygiene", "--dry-run", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      dry_run: true,
      schema_version: "skill-memory-hygiene.v1",
      source_command: "helix skill hygiene --dry-run --json",
    });
    expect(payload.memory_retention.provenance_preserved).toBe(true);
  });

  it("exposes credential and egress policy as a fail-close dry-run guard", () => {
    const run = runCli([
      "security",
      "egress-check",
      "--dry-run",
      "--external",
      "--tool",
      "external-search",
      "--egress-policy",
      "undefined",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      dry_run: true,
      schema_version: "security-credential-egress-guard.v1",
      findings: [expect.objectContaining({ code: "undefined_egress_policy_fail_close" })],
    });
  });

  it("exposes tool augmentation registry as non-executable task-lens suggestions", () => {
    const run = runCli([
      "tools",
      "registry",
      "--task",
      "設計と検証で browser と LSP の候補を見る",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      read_only: true,
      schema_version: "tool-augmentation-registry.v1",
      source_command: "helix tools registry --json",
    });
    expect(
      payload.suggestions.every(
        (item: { auto_execute_allowed: boolean }) => !item.auto_execute_allowed,
      ),
    ).toBe(true);
    expect(
      payload.suggestions.every((item: { evidence_claim: boolean }) => !item.evidence_claim),
    ).toBe(true);
  });

  it("exposes change package archive validation as a dry-run fail-close packet", () => {
    const run = runCli([
      "change",
      "package",
      "--dry-run",
      "--package-id",
      "change:PLAN-L7-373",
      "--plan",
      "PLAN-L7-373",
      "--status",
      "draft",
      "--archive-requested",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      dry_run: true,
      schema_version: "change-package-delta-archive.v1",
    });
    expect(payload.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "archive_without_design_or_test_delta",
        }),
      ]),
    );
  });

  it("exposes cross-repo spec store validation as a dry-run fail-close packet", () => {
    const run = runCli([
      "spec-store",
      "check",
      "--dry-run",
      "--store",
      "store:shared-spec",
      "--source",
      "git@github.com:RetryYN/shared-spec.git",
      "--ref",
      "main",
      "--operation",
      "sync",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      dry_run: true,
      schema_version: "cross-repo-spec-store.v1",
    });
    expect(payload.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "unpinned_store_ref_fail_close" })]),
    );
  });

  it("exposes constitution template resolution with non-silent conflict detection", () => {
    const run = runCli([
      "constitution",
      "check",
      "--entry",
      "plan-scaffold:core:10:core",
      "--entry",
      "plan-scaffold:project:10:project",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      read_only: true,
      schema_version: "constitution-template-stack.v1",
      source_command: "helix constitution check --json",
    });
    expect(payload.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "template_conflict_not_silent",
          severity: "error",
        }),
      ]),
    );
    expect(payload.resolved_artifacts[0].digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("exposes artifact convergence analysis that blocks unsafe completion claims", () => {
    const run = runCli([
      "artifacts",
      "converge",
      "--artifact",
      "src-feature:code:src/feature.ts:sha256-code:12",
      "--existing-plan",
      "converge:missing_test:src-feature",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      completion_claim_allowed: false,
      read_only: true,
      schema_version: "artifact-convergence-analyzer.v1",
    });
    expect(payload.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "implemented_without_design",
          severity: "critical",
        }),
        expect.objectContaining({ kind: "missing_test", severity: "critical" }),
      ]),
    );
    expect(payload.generated_tasks).toEqual(
      expect.arrayContaining([expect.objectContaining({ duplicate: true })]),
    );
  });

  it("exposes state-machine policy fail-close and transition evidence", () => {
    const missing = runCli(["state-machine", "policy", "--missing-policy", "--json"]);
    expect(missing.status).toBe(1);
    expect(JSON.parse(missing.stdout)).toMatchObject({
      ok: false,
      run_allowed: false,
      schema_version: "state-machine-tool-policy.v1",
      findings: [expect.objectContaining({ code: "state_policy_missing_fail_close" })],
    });

    const advisory = runCli([
      "state-machine",
      "policy",
      "--state",
      "state:implement",
      "--enforcement",
      "unsupported",
      "--allowed-tool",
      "apply_patch",
      "--requested-tool",
      "apply_patch",
      "--transition",
      "trace-freeze",
      "--exit-criteria",
      "tests green",
      "--json",
    ]);
    const payload = JSON.parse(advisory.stdout);

    expect(advisory.status, advisory.stderr || advisory.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      run_allowed: false,
      enforcement_claim: "advisory",
      state_transition_evidence: {
        from_state: "state:implement",
        to_states: ["trace-freeze"],
      },
    });
  });

  it("exposes state-machine template planning without executing generated workflows", () => {
    const run = runCli([
      "state-machine",
      "template",
      "--task",
      "設計と検証",
      "--triple-json",
      JSON.stringify([
        {
          task: "safe",
          template_id: "workflow:design-verify",
          outcome: "success",
          evidence_digest: "sha256:safe",
        },
        {
          task: "unsafe",
          template_id: "workflow:design-verify",
          outcome: "failure",
          evidence_digest: "api_key=secret",
        },
      ]),
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      executable: false,
      schema_version: "state-machine-template-planner.v1",
      selected_template_id: "workflow:design-verify",
    });
    expect(payload.execution_triples).toHaveLength(1);
    expect(run.stdout).not.toContain("api_key=secret");
  });

  it("exposes extension preset bundle registry as discovery-only dry-run by default", () => {
    const run = runCli([
      "extensions",
      "registry",
      "--dry-run",
      "--manifest",
      "bundle:community",
      "--catalog",
      "community",
      "--component",
      "docs/skills/ui.md:ui:true:false",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      dry_run: true,
      catalog_policy: "discovery-only",
      schema_version: "extension-preset-bundle-registry.v1",
    });
    expect(payload.install_plan).toEqual([
      expect.objectContaining({ path: "docs/skills/ui.md", action: "skip" }),
    ]);
    expect(payload.hash_manifest[0].digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("exposes review feedback intake as idempotent read-only routing", () => {
    const eventJson = JSON.stringify([
      {
        feedback_key: "ci:1",
        kind: "ci_failure",
        source_url: "https://github.com/org/repo/actions/runs/1",
        source_ref: "refs/heads/work",
        target_session_id: "session-a",
      },
      {
        feedback_key: "ci:1",
        kind: "ci_failure",
        source_url: "https://github.com/org/repo/actions/runs/1",
        source_ref: "refs/heads/work",
        target_session_id: "session-a",
      },
    ]);
    const sessionJson = JSON.stringify([{ session_id: "session-a", plan_id: "PLAN-L7-380" }]);
    const run = runCli([
      "feedback",
      "intake",
      "--event-json",
      eventJson,
      "--session-json",
      sessionJson,
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      read_only: true,
      duplicate_intake_count: 1,
      schema_version: "review-feedback-session-intake.v1",
    });
    expect(payload.routed_events[0]).toMatchObject({
      source_ref: "refs/heads/work",
      target_session_id: "session-a",
      plan_id: "PLAN-L7-380",
    });
  });

  it("exposes agent SSoT runtime projection without overwriting user-modified files", () => {
    const run = runCli([
      "agent",
      "ssot-project",
      "--dry-run",
      "--item-json",
      JSON.stringify([
        {
          artifact_id: "agent:test",
          kind: "agent",
          runtime: "codex",
          source_path: "docs/agents/test.md",
          source_content: "source",
          target_path: ".codex/agents/test.md",
          generated_content: "generated",
          existing_content: "user edit",
          user_modified: true,
          cleanup_policy: "preserve_user_modified",
          required_capability: "hooks",
        },
      ]),
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      read_only: true,
      schema_version: "agent-ssot-runtime-projection.v1",
      projected_files: [expect.objectContaining({ action: "skip", user_modified: true })],
    });
  });

  it("exposes skill efficacy as a dry-run with reproducible grading evidence", () => {
    const run = runCli([
      "skill",
      "efficacy",
      "--dry-run",
      "--eval-json",
      JSON.stringify([
        {
          skill_id: "skill:test",
          eval_id: "eval:1",
          with_skill: {
            artifact_path: "tests/with.md",
            command_digest: "sha256:0123456789abcdef",
            reproducible: true,
            grade: 0.9,
          },
          without_skill: {
            artifact_path: "tests/without.md",
            command_digest: "sha256:fedcba9876543210",
            reproducible: true,
            grade: 0.5,
          },
        },
      ]),
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status, run.stderr || run.stdout).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      dry_run: true,
      promotion_allowed_count: 1,
      schema_version: "skill-efficacy-evaluation.v1",
    });
    expect(payload.evaluations[0].grading[0]).toMatchObject({
      artifact_path: "tests/with.md",
      command_digest: "sha256:0123456789abcdef",
    });
  });

  it("exposes harness taxonomy curation as fail-close source classification", () => {
    const run = runCli([
      "audit",
      "taxonomy",
      "--source-json",
      JSON.stringify([
        {
          source_id: "repo:unknown",
          source_url: "https://github.com/org/unknown",
          source_verified: false,
          license_risk: "unknown",
          topic_result_digest: "sha256:unknown",
        },
      ]),
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      read_only: true,
      schema_version: "harness-taxonomy-curation-policy.v1",
    });
    expect(payload.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "unclassified_source_fail_close" })]),
    );
  });

  it("exposes source mirror completeness with retry ledger and completion blocking", () => {
    const run = runCli([
      "source",
      "mirror-check",
      "--repo-json",
      JSON.stringify([
        {
          repo: "org/incomplete",
          refs_digest: null,
          default_tree_digest: null,
          default_branch_content_digest: "sha256:0011223344556677",
          all_ref_content_status: "pending",
          retry_status: "queued",
          chunks: [
            {
              chunk_id: "0002",
              status: "pending",
              object_ids: ["blob:c"],
              size_bytes: 512,
            },
          ],
        },
      ]),
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      completion_claim_allowed: false,
      read_only: true,
      schema_version: "source-content-mirror-completeness.v1",
      retry_ledger: [{ repo: "org/incomplete", status: "pending", retry_status: "queued" }],
    });
    expect(payload.chunk_resume_plan).toEqual([
      {
        repo: "org/incomplete",
        next_chunk_id: "0002",
        reason: "chunk status pending",
      },
    ]);
  });

  it("exposes GitHub operation guards as HELIX CLI surfaces", () => {
    const branchKind = runCli([
      "guard",
      "branch-kind",
      "--branch",
      "unknown/work",
      "--strict-unknown-prefix",
      "--json",
    ]);
    expect(branchKind.status).toBe(1);
    expect(JSON.parse(branchKind.stdout)).toMatchObject({
      ok: false,
      findings: [expect.objectContaining({ code: "unknown_branch_prefix" })],
    });

    const goodCommit = runCli([
      "guard",
      "commitlint",
      "--subject",
      "fix: close guard gap",
      "--json",
    ]);
    expect(goodCommit.status, goodCommit.stderr || goodCommit.stdout).toBe(0);
    expect(JSON.parse(goodCommit.stdout)).toMatchObject({
      ok: true,
      subjectCount: 1,
    });

    const badCommit = runCli(["guard", "commitlint", "--subject", "close guard gap", "--json"]);
    expect(badCommit.status).toBe(1);
    expect(JSON.parse(badCommit.stdout)).toMatchObject({
      ok: false,
      findings: [expect.objectContaining({ code: "non_conventional_subject" })],
    });

    const poc = runCli([
      "guard",
      "pr-context",
      "--event-name",
      "pull_request",
      "--head",
      "poc/demo",
      "--base",
      "main",
      "--json",
    ]);
    expect(poc.status).toBe(1);
    expect(JSON.parse(poc.stdout)).toMatchObject({
      ok: false,
      findings: [expect.objectContaining({ code: "poc_main_direct_merge" })],
    });

    const hotfix = runCli([
      "guard",
      "pr-context",
      "--event-name",
      "pull_request",
      "--head",
      "hotfix/recovery",
      "--base",
      "main",
      "--body",
      "## Postmortem\n\nRecovery evidence: PLAN-L7-999",
      "--json",
    ]);
    expect(hotfix.status, hotfix.stderr || hotfix.stdout).toBe(0);
    expect(JSON.parse(hotfix.stdout)).toMatchObject({ ok: true });
  });

  it("exposes GitHub ops guard and release publication plan as non-destructive packets", () => {
    const blocked = runCli([
      "github",
      "guard",
      "--head",
      "refs/heads/poc/demo",
      "--base",
      "refs/heads/main",
      "--commit-subject",
      "feat: try demo",
      "--json",
    ]);
    expect(blocked.status).toBe(1);
    expect(JSON.parse(blocked.stdout)).toMatchObject({
      schemaVersion: "helix-github-ops-guard.v1",
      ok: false,
      normalizedHeadRef: "poc/demo",
      normalizedBaseRef: "main",
      findings: [expect.objectContaining({ code: "poc-no-main-merge" })],
    });

    const releasePlan = runCli([
      "github",
      "release-plan",
      "--tag",
      "v0.1.0",
      "--repo",
      "RetryYN/HELIX-HARNESS-OS",
      "--json",
    ]);
    expect(releasePlan.status, releasePlan.stderr || releasePlan.stdout).toBe(0);
    expect(JSON.parse(releasePlan.stdout)).toMatchObject({
      schemaVersion: "helix-github-release-publication-plan.v1",
      ok: true,
      dryRun: true,
      externalPublishRequiresApproval: true,
      mustNotApplyWithoutApproval: true,
      commands: expect.arrayContaining([
        expect.stringContaining("git tag -a v0.1.0"),
        expect.stringContaining("gh release create v0.1.0"),
      ]),
    });
  });

  it("PLAN-L7-359: exposes doctor scope and timing as a lightweight diagnostic surface", () => {
    const timed = runCli(["doctor", "--scope", "toolchain", "--timing", "--json"]);
    expect(timed.status, timed.stderr || timed.stdout).toBe(0);
    expect(JSON.parse(timed.stdout)).toMatchObject({
      ok: true,
      scope: "toolchain",
      timings: [
        expect.objectContaining({
          id: "toolchain-pin",
          duration_ms: expect.any(Number),
          ok: true,
          message_count: expect.any(Number),
        }),
      ],
    });
    const summary = runCli(["doctor", "--scope", "toolchain", "--timing", "--summary-json"]);
    expect(summary.status, summary.stderr || summary.stdout).toBe(0);
    expect(JSON.parse(summary.stdout)).toMatchObject({
      schema_version: "doctor-summary.v1",
      ok: true,
      profile: null,
      scope: "toolchain",
      timing_enabled: true,
      timing_count: expect.any(Number),
      write_policy: "read-only",
      source_command: "helix doctor --summary-json",
      full_source_command: "helix doctor --json",
    });

    const invalid = runCli(["doctor", "--scope", "unknown", "--json"]);
    expect(invalid.status).toBe(1);
    expect(JSON.parse(invalid.stdout)).toMatchObject({
      ok: false,
      messages: ["doctor: scope - violation unknown scope unknown"],
    });
    const invalidSummary = runCli(["doctor", "--scope", "unknown", "--summary-json"]);
    expect(invalidSummary.status).toBe(1);
    expect(JSON.parse(invalidSummary.stdout)).toMatchObject({
      schema_version: "doctor-summary.v1",
      ok: false,
      scope: "unknown",
      violation_count: 1,
      violations: ["doctor: scope - violation unknown scope unknown"],
    });
  });

  it("exposes GitHub merge readiness as a read-only HELIX operation packet", () => {
    const help = runCli(["github", "merge-readiness", "--help"]);

    expect(help.status, help.stderr || help.stdout).toBe(0);
    expect(help.stdout).toContain("merge-readiness");
    expect(help.stdout).toContain("--base");
    expect(help.stdout).toContain("--json");
  });

  it("exposes PR body and CI status as read-only GitHub operation packets", () => {
    const prBody = runCli(["github", "pr-body", "--help"]);
    expect(prBody.status, prBody.stderr || prBody.stdout).toBe(0);
    expect(prBody.stdout).toContain("pr-body");
    expect(prBody.stdout).toContain("--markdown");

    const ciStatus = runCli(["github", "ci-status", "--help"]);
    expect(ciStatus.status, ciStatus.stderr || ciStatus.stdout).toBe(0);
    expect(ciStatus.stdout).toContain("ci-status");
    expect(ciStatus.stdout).toContain("--ref");
    expect(ciStatus.stdout).toContain("--json");

    const prCreate = runCli(["github", "pr-create", "--help"]);
    expect(prCreate.status, prCreate.stderr || prCreate.stdout).toBe(0);
    expect(prCreate.stdout).toContain("pr-create");
    expect(prCreate.stdout).toContain("--apply");
    expect(prCreate.stdout).toContain("--json");
  });

  it("U-L1L2-009: exposes L1/L2 gap-check as a read-only packet", () => {
    const result = runCli(["l1-l2", "gap-check", "--json"]);
    expect(result.status, result.stderr || result.stdout).toBe(0);
    const packet = JSON.parse(result.stdout) as {
      schemaVersion: string;
      writePolicy: string;
      mustNotMutate: boolean;
      viewpoints: unknown[];
      maxRounds: number;
      authorityBoundary: string;
      a40Route: string;
      completionClaimAllowed: boolean;
    };
    expect(packet.schemaVersion).toBe("l1-l2-gap-check.v1");
    expect(packet.writePolicy).toBe("no-write");
    expect(packet.mustNotMutate).toBe(true);
    expect(packet.viewpoints).toHaveLength(8);
    expect(packet.maxRounds).toBe(3);
    expect(packet.authorityBoundary).toContain("read-only gap-check");
    expect(packet.a40Route).toContain("A-40");
    expect(packet.completionClaimAllowed).toBe(false);
  });

  it("keeps repo wrapper decision packet commands aligned with live source", () => {
    const s4 = runRepoScriptHelix(["s4", "decision-packet", "--json"]);
    expect(s4.status, s4.stderr || s4.stdout).toBe(0);
    const s4Packets = JSON.parse(s4.stdout);
    expect(s4Packets).toEqual([]);

    const completion = runRepoScriptHelix(["completion", "decision-packet", "--json"]);
    expect(completion.status, completion.stderr || completion.stdout).toBe(0);
    const completionPacket = JSON.parse(completion.stdout);
    expect(completionPacket.sourceCommand).toBe("helix completion decision-packet --json");

    const direct = runCli(["completion", "decision-packet", "--json"]);
    expect(direct.status, direct.stderr || direct.stdout).toBe(0);
    const directPacket = JSON.parse(direct.stdout);
    expect(completionPacket.decisionCount).toBe(directPacket.decisionCount);
    expect(
      completionPacket.humanReviewBundle.items.map((item: { planId: string }) => item.planId),
    ).toEqual(directPacket.humanReviewBundle.items.map((item: { planId: string }) => item.planId));
    expect(
      completionPacket.humanReviewBundle.items.map((item: { planId: string }) => item.planId),
    ).toContain("PLAN-M-02-helix-identifier-rename");
  }, 40_000);

  it("U-HOVER-018: exposes normal handover status as a read-only JSON preflight surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-handover-status-"));
    try {
      writeObjectiveAuditFixture(root);
      const missing = runCliIn(root, ["handover", "status", "--json"]);
      expect(missing.status).toBe(0);
      expect(JSON.parse(missing.stdout)).toMatchObject({
        exists: false,
        stale: false,
        stale_reasons: [],
        active_plan: null,
      });

      const handoverDir = join(root, ".helix", "handover");
      const pointerPath = join(handoverDir, "CURRENT.json");
      mkdirSync(handoverDir, { recursive: true });
      writeFileSync(pointerPath, "{not json", "utf8");
      const invalid = runCliIn(root, ["handover", "status", "--json"]);
      expect(invalid.status).toBe(1);
      expect(JSON.parse(invalid.stdout)).toMatchObject({
        exists: true,
        stale: true,
        stale_reasons: ["CURRENT.json is unreadable or invalid"],
      });

      const generated = runCliIn(root, [
        "handover",
        "--plan",
        "PLAN-L7-04-handover-mechanism",
        "--scope-active",
      ]);
      expect(generated.status).toBe(0);
      expect(generated.stdout).toContain("handover: active=PLAN-L7-04-handover-mechanism");

      const json = runCliIn(root, ["handover", "status", "--json"]);
      expect(json.status).toBe(0);
      const payload = JSON.parse(json.stdout);
      expect(payload).toMatchObject({
        active_plan: "PLAN-L7-04-handover-mechanism",
        status: "in_progress",
        generated_by: "helix-handover",
        exists: true,
        stale: false,
        stale_reasons: [],
      });
      expect(payload.latest_doc).toMatch(/^docs[/\\]handover[/\\]session-handover-/);
      expect(payload.outstanding.completionReadiness).toMatchObject({
        ok: true,
        status: "ready",
      });
      expect(payload.objectiveProgress).toMatchObject({
        method: "objective-evidence-audit.v1",
        percent: 100,
        completionStatus: "ready",
        completionClaimAllowed: false,
        auditOk: false,
        progressEvidenceTrusted: false,
      });
      expect(payload.objectiveProgress.auditViolationCount).toBeGreaterThan(0);
      expect(payload.completionDecisionPacket).toMatchObject({
        ok: true,
        status: "ready",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "helix handover",
        decisionCount: 0,
      });

      const text = runCliIn(root, ["handover", "status"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain(
        "handover status: active=PLAN-L7-04-handover-mechanism status=in_progress owner=- stale=false",
      );
      expect(text.stdout).toContain("latest_doc:");
      expect(text.stdout).toContain("completion: ready");
      expect(text.stdout).toContain(
        "objective-progress: 100% (ready; completion-claim-allowed=false; evidence=invalid; audit-ok=false; violations=",
      );
      expect(text.stdout).toContain(
        "objective-progress-evidence: invalid audit-ok=false violations=",
      );

      const stalePointer = {
        ...payload,
        updated_at: "2026-06-01T00:00:00.000Z",
      };
      writeFileSync(pointerPath, JSON.stringify(stalePointer), "utf8");
      const stale = runCliIn(root, ["handover", "status", "--json"]);
      expect(stale.status).toBe(0);
      const stalePayload = JSON.parse(stale.stdout);
      expect(stalePayload).toMatchObject({
        exists: true,
        stale: true,
      });
      expect(stalePayload.stale_reasons[0]).toContain("updated_at is older than 24h");

      const update = runCliIn(root, ["handover", "update", "--owner", "codex", "--json"]);
      expect(update.status).toBe(0);
      const updatePayload = JSON.parse(update.stdout);
      expect(updatePayload).toMatchObject({
        ok: true,
        pointer: {
          owner: "codex",
          updated_at: "2026-06-01T00:00:00.000Z",
        },
        written: [".helix/handover/CURRENT.json"],
      });
      expect(updatePayload.pointer.owner_updated_at).toEqual(expect.any(String));

      const stillStale = runCliIn(root, ["handover", "status", "--json"]);
      expect(stillStale.status).toBe(0);
      expect(JSON.parse(stillStale.stdout)).toMatchObject({
        owner: "codex",
        stale: true,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes completion decision packet templates through handover status JSON", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-handover-packet-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writeObjectiveAuditFixture(root);
      writeFileSync(
        join(root, "docs", "plans", "PLAN-M-02-fixture.md"),
        [
          "---",
          "plan_id: PLAN-M-02-fixture",
          "kind: design",
          "layer: L14",
          "status: draft",
          "---",
          "",
          "# fixture",
          "irreversible cutover requires PO signoff and action-binding approval.",
        ].join("\n"),
        "utf8",
      );

      const generated = runCliIn(root, ["handover", "--plan", "PLAN-M-02-fixture"]);
      expect(generated.status).toBe(0);
      const pointerPath = join(root, ".helix", "handover", "CURRENT.json");
      const oldPointer = JSON.parse(readFileSync(pointerPath, "utf8"));
      delete oldPointer.outstanding?.semanticFeatureFrontierRecords;
      writeFileSync(pointerPath, JSON.stringify(oldPointer), "utf8");

      const json = runCliIn(root, ["handover", "status", "--json"]);
      expect(json.status).toBe(0);
      const payload = JSON.parse(json.stdout);
      expect(payload.outstanding.completionReadiness).toMatchObject({
        ok: false,
        status: "blocked",
      });
      expect(payload.completionDecisionPacket).toMatchObject({
        ok: false,
        status: "blocked",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "helix handover",
        decisionCount: 1,
      });
      expect(payload.completionReviewBundle).toMatchObject({
        schemaVersion: "completion-review-bundle.v1",
        sourceCommand: "helix completion review-bundle --json",
        runnableSourceCommand: "bun run helix completion review-bundle --json",
        planOnly: true,
        mustNotDecide: true,
        mustNotApply: true,
        completionClaimAllowed: false,
        humanDecisionRequired: true,
        decisionCount: 1,
        reviewCoveredBlockers: ["human_approval_pending", "irreversible_migration_pending"],
        nonPacketBlockers: ["non_terminal_plans", "semantic_frontier_blocked"],
      });
      expect(payload.workflowNextAction).toContain(
        "obtain explicit PO signoff before irreversible migration/cutover",
      );
      expect(payload.workflowNextActions).toMatchObject([
        {
          order: 1,
          planId: "PLAN-M-02-fixture",
          reason: "irreversible_migration_pending",
          decisionKind: "irreversible_migration_signoff",
        },
      ]);
      expect(payload.completionDecisionPacket.decisions[0]).toMatchObject({
        planId: "PLAN-M-02-fixture",
        decisionKind: "irreversible_migration_signoff",
      });
      expect(payload.outstanding.semanticFeatureFrontierRecords).toEqual([
        expect.objectContaining({
          recordName: "semantic_feature_frontier_record",
          planId: "PLAN-M-02-fixture",
          classification: "approval_gated_cutover",
          completionClaimAllowed: false,
        }),
      ]);
      expect(payload.completionDecisionPacket.decisions[0].recordTemplates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recordName: "cutover_decision_record",
            yamlLines: expect.arrayContaining([
              "cutover_decision_record:",
              '  - allowed_outcome: "<approve_cutover|reject_or_defer|request_runbook_changes>"',
            ]),
          }),
          expect.objectContaining({
            recordName: "action_binding_approval_record",
            yamlLines: expect.arrayContaining(["action_binding_approval_record:"]),
          }),
        ]),
      );
      const text = runCliIn(root, ["handover", "status"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain("completion: blocked");
      expect(text.stdout).toContain(
        "authority-blockers=human:human_approval_pending,irreversible_migration_pending workflow-state:non_terminal_plans automation:semantic_frontier_blocked",
      );
      expect(text.stdout).toContain("objective-progress:");
      expect(text.stdout).toContain("completion-claim-allowed=false");
      expect(text.stdout).toContain("workflow-next:");
      expect(text.stdout).toContain("workflow-next-actions: 1");
      expect(text.stdout).toContain("workflow-next-action[1]: PLAN-M-02-fixture");
      expect(text.stdout).toContain(
        "packet=helix rename plan --json scoped=helix rename plan --json supporting=helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json scoped-supporting=helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(
        "action-id=obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      );
      expect(text.stdout).toContain(
        "route-id=L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
      );
      expect(text.stdout).toContain(
        "completion-decision-packet: helix completion decision-packet --json",
      );
      expect(text.stdout).toContain(
        "completion-review-bundle: helix completion review-bundle --json",
      );
      expect(text.stdout).toContain(
        "runnable-completion-review-bundle: bun run helix completion review-bundle --json",
      );
      expect(text.stdout).toContain(
        "completion-review-coverage: covered=human_approval_pending,irreversible_migration_pending non-packet=non_terminal_plans,semantic_frontier_blocked policy=review-packets-cover-decision-blockers-only",
      );
      expect(text.stdout).toContain(
        "supporting-decision-packets: helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json",
      );
      expect(text.stdout).toContain(
        "scoped-supporting-decision-packets: helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain("semantic_frontier_records: 1");
      expect(text.stdout).toContain("confirmed_current_meaning_records: 11");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes plan complete as the completed handover lifecycle entrypoint", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-plan-complete-"));
    try {
      const use = runCliIn(root, ["plan", "use", "PLAN-L7-04-handover-mechanism"]);
      expect(use.status).toBe(0);

      const complete = runCliIn(root, ["plan", "complete", "--dry-run"]);
      expect(complete.status).toBe(0);
      expect(complete.stdout).toContain("plan complete:");
      expect(complete.stdout).toContain("status=completed");
      expect(complete.stdout).toContain("(dry-run)");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes whole-program completion readiness on status surfaces", () => {
    const readyRoot = mkdtempSync(join(tmpdir(), "helix-cli-completion-ready-"));
    const blockedRoot = mkdtempSync(join(tmpdir(), "helix-cli-completion-blocked-"));
    try {
      const ready = runCliIn(readyRoot, ["status", "--json"]);
      expect(ready.status).toBe(0);
      const readyPayload = JSON.parse(ready.stdout);
      expect(readyPayload.workflowNextAction).toMatch(/^completion-ready:/);
      expect(readyPayload.workflowNextActions).toEqual([]);
      expect(readyPayload.outstanding.completionReadiness).toMatchObject({
        ok: true,
        status: "ready",
      });
      expect(readyPayload.update).toMatchObject({
        checked: false,
        updateAvailable: false,
      });
      expect(["disabled by HELIX_SKIP_UPDATE_CHECK", "disabled by VITEST_WORKER_ID"]).toContain(
        readyPayload.update.detail,
      );

      mkdirSync(join(blockedRoot, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(blockedRoot, "docs", "plans", "PLAN-M-02-fixture.md"),
        [
          "---",
          "plan_id: PLAN-M-02-fixture",
          "kind: design",
          "layer: L14",
          "status: draft",
          "---",
          "",
          "# fixture",
          "irreversible cutover requires PO signoff and human approval.",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(blockedRoot, "docs", "plans", "PLAN-DISCOVERY-07-fixture.md"),
        [
          "---",
          "plan_id: PLAN-DISCOVERY-07-fixture",
          "kind: poc",
          "layer: cross",
          "status: draft",
          "workflow_phase: S3",
          "---",
          "",
          "# fixture",
          "S4 decision_outcome is pending.",
        ].join("\n"),
        "utf8",
      );

      const blockedJson = runCliIn(blockedRoot, ["status", "--json"]);
      expect(blockedJson.status).toBe(0);
      const blockedPayload = JSON.parse(blockedJson.stdout);
      expect(blockedPayload.nextAction).toEqual(expect.stringMatching(/^[a-z][a-z-]*: /));
      expect(blockedPayload.runtimeNextAction).toBe(blockedPayload.nextAction);
      expect(blockedPayload.completionNextAction).toBe(blockedPayload.workflowNextAction);
      expect(blockedPayload.judgmentReview).toMatchObject({
        mode: expect.any(String),
        requiredReviewKind: expect.stringMatching(/^(cross_agent|intra_runtime_subagent|human)$/),
        gateCommandTemplate: expect.stringContaining("helix gate <gate-id>"),
      });
      expect(blockedPayload.judgmentReview.requiredEvidence.length).toBeGreaterThan(0);
      if (blockedPayload.judgmentReview.requiredReviewKind === "human") {
        expect(blockedPayload.judgmentReview.requiredEvidenceJa).toEqual(
          expect.arrayContaining(["human approval evidence を記録する"]),
        );
      } else {
        expect(blockedPayload.judgmentReview.requiredEvidenceJa).toEqual(
          expect.arrayContaining(["worker_model を記録する", "reviewer_model を記録する"]),
        );
      }
      expect(blockedPayload.judgmentReview.requiredEvidenceJa).toHaveLength(
        blockedPayload.judgmentReview.requiredEvidence.length,
      );
      expect(blockedPayload.workflowNextAction).toContain(
        "record the PO/S4 decision before promotion, rejection, or Forward merge",
      );
      expect(blockedPayload.workflowNextActions).toMatchObject([
        {
          order: 1,
          planId: "PLAN-DISCOVERY-07-fixture",
          reason: "po_decision_pending",
          decisionKind: "po_s4_decision",
          decisionPacketCommand: "helix s4 decision-packet --json",
          runnableDecisionPacketCommand: "bun run helix s4 decision-packet --json",
          packetCommands: ["helix s4 decision-packet --json"],
          runnablePacketCommands: ["bun run helix s4 decision-packet --json"],
          scopedDecisionPacketCommand:
            "helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          runnableScopedDecisionPacketCommand:
            "bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          scopedPacketCommands: [
            "helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          ],
          runnableScopedPacketCommands: [
            "bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          ],
          supportingPacketSummaries: [
            expect.objectContaining({
              command: "helix s4 decision-packet --json",
              runnableCommand: "bun run helix s4 decision-packet --json",
              scopedCommand: "helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
              runnableScopedCommand:
                "bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
              schemaVersion: "s4-decision-packet.v1",
              matrixField: "decisionVerificationCommandMatrix",
              expectedMatrixCount: 8,
              requiredReviewFields: expect.arrayContaining(["decisionEvidenceChecklist"]),
              requiredMatrixFields: expect.arrayContaining([
                "sourceCheckedAt",
                "latestOfficialStatus",
                "sourceStatusDelta",
                "adoptionDecision",
                "adoptionDecisionDelta",
                "workflowRouteImpact",
              ]),
            }),
          ],
        },
        {
          order: 2,
          planId: "PLAN-M-02-fixture",
          reason: "irreversible_migration_pending",
          decisionKind: "irreversible_migration_signoff",
          decisionPacketCommand: "helix rename plan --json",
          runnableDecisionPacketCommand: "bun run helix rename plan --json",
          packetCommands: [
            "helix rename plan --json",
            "helix rename approval-draft --json",
            "helix action-binding approval-packet --json",
          ],
          runnablePacketCommands: [
            "bun run helix rename plan --json",
            "bun run helix rename approval-draft --json",
            "bun run helix action-binding approval-packet --json",
          ],
          scopedDecisionPacketCommand: "helix rename plan --json",
          runnableScopedDecisionPacketCommand: "bun run helix rename plan --json",
          scopedPacketCommands: [
            "helix rename plan --json",
            "helix rename approval-draft --json",
            "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
          ],
          runnableScopedPacketCommands: [
            "bun run helix rename plan --json",
            "bun run helix rename approval-draft --json",
            "bun run helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
          ],
          supportingPacketSummaries: [
            expect.objectContaining({
              command: "helix rename plan --json",
              runnableCommand: "bun run helix rename plan --json",
              scopedCommand: "helix rename plan --json",
              runnableScopedCommand: "bun run helix rename plan --json",
              schemaVersion: "identifier-rename-cutover-plan.v1",
              matrixField: "verificationCommandMatrix",
              expectedMatrixCount: 10,
              requiredReviewFields: expect.arrayContaining(["cutoverSnapshot.snapshotId"]),
              requiredMatrixFields: expect.arrayContaining([
                "sourceCheckedAt",
                "latestOfficialStatus",
                "sourceStatusDelta",
                "adoptionDecision",
                "adoptionDecisionDelta",
                "workflowRouteImpact",
              ]),
            }),
            expect.objectContaining({
              command: "helix rename approval-draft --json",
              runnableCommand: "bun run helix rename approval-draft --json",
              scopedCommand: "helix rename approval-draft --json",
              runnableScopedCommand: "bun run helix rename approval-draft --json",
              schemaVersion: "identifier-rename-approval-draft.v1",
              matrixField: "none",
              expectedMatrixCount: 0,
              requiredReviewFields: expect.arrayContaining([
                "mustNotApply",
                "applyAuthorized",
                "currentSnapshot.cutoverSnapshotId",
                "draftRecords.unsafeToTreatAsApproval",
              ]),
              requiredMatrixFields: [],
            }),
            expect.objectContaining({
              command: "helix action-binding approval-packet --json",
              runnableCommand: "bun run helix action-binding approval-packet --json",
              scopedCommand: "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
              runnableScopedCommand:
                "bun run helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
              schemaVersion: "action-binding-approval-packet.v1",
              matrixField: "approvalVerificationCommandMatrix",
              expectedMatrixCount: 11,
              requiredReviewFields: expect.arrayContaining(["approvalBindingChecks"]),
              requiredMatrixFields: expect.arrayContaining([
                "sourceCheckedAt",
                "latestOfficialStatus",
                "sourceStatusDelta",
                "adoptionDecision",
                "adoptionDecisionDelta",
                "workflowRouteImpact",
              ]),
            }),
          ],
        },
      ]);
      expect(blockedPayload.outstanding.completionReadiness).toMatchObject({
        ok: false,
        status: "blocked",
        blockers: expect.arrayContaining(["irreversible_migration_pending", "non_terminal_plans"]),
      });
      expect(blockedPayload.completionDecisionPacket).toMatchObject({
        ok: false,
        status: "blocked",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "helix status --json",
        freshness: {
          validForMinutes: 1440,
          stale: false,
          policy: "decision-packet-freshness.v1",
        },
        decisionCount: 2,
      });
      expect(blockedPayload.completionReviewBundle).toMatchObject({
        schemaVersion: "completion-review-bundle.v1",
        sourceCommand: "helix completion review-bundle --json",
        runnableSourceCommand: "bun run helix completion review-bundle --json",
        planOnly: true,
        mustNotDecide: true,
        mustNotApply: true,
        completionClaimAllowed: false,
        humanDecisionRequired: true,
        decisionCount: 2,
        reviewCoveredBlockers: [
          "human_approval_pending",
          "irreversible_migration_pending",
          "po_decision_pending",
        ],
        nonPacketBlockers: ["non_terminal_plans", "semantic_frontier_blocked"],
      });
      expect(blockedPayload.completionDecisionPacket.generatedAt).toEqual(expect.any(String));
      expect(blockedPayload.completionDecisionPacket.freshness.expiresAt).toEqual(
        expect.any(String),
      );
      expect(blockedPayload.completionDecisionPacket.decisions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            planId: "PLAN-DISCOVERY-07-fixture",
            decisionKind: "po_s4_decision",
          }),
          expect.objectContaining({
            planId: "PLAN-M-02-fixture",
            decisionKind: "irreversible_migration_signoff",
          }),
        ]),
      );

      const blockedText = runCliIn(blockedRoot, ["status"]);
      expect(blockedText.status).toBe(0);
      const firstWorkflowAction = blockedPayload.workflowNextActions[0];
      const secondWorkflowAction = blockedPayload.workflowNextActions[1];
      expect(blockedText.stdout).toContain("judgment-review:");
      expect(blockedText.stdout).toContain("judgment-review-evidence:");
      expect(blockedText.stdout).toContain("runtime-next:");
      expect(blockedText.stdout).toContain("completion-next: completion-blocked:");
      expect(blockedText.stdout).not.toContain("\nnext:");
      expect(blockedText.stdout).toMatch(
        /evidence=(worker_model を記録する|human approval evidence を記録する)/,
      );
      expect(blockedText.stdout).toMatch(
        /evidence-id=(worker_model recorded|human approval evidence recorded)/,
      );
      expect(blockedText.stdout).toContain("workflow-next: completion-blocked:");
      expect(blockedText.stdout).toContain("workflow-next-actions: 2");
      expect(blockedText.stdout).toContain(
        `workflow-next-action: 1 PLAN-DISCOVERY-07-fixture reason=po_decision_pending action=${firstWorkflowAction.requiredActionJa} action-id=record the PO/S4 decision before promotion, rejection, or Forward merge route=${firstWorkflowAction.nextWorkflowRouteJa} route-id=S4 decide -> Reverse/Forward merge only after decision_outcome is recorded packet=helix s4 decision-packet --json scoped=helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture`,
      );
      expect(blockedText.stdout).toContain(
        "runnable-workflow-next-action: 1 PLAN-DISCOVERY-07-fixture packet=bun run helix s4 decision-packet --json scoped=bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
      );
      expect(blockedText.stdout).toContain(
        `workflow-next-action: 2 PLAN-M-02-fixture reason=irreversible_migration_pending action=${secondWorkflowAction.requiredActionJa} action-id=obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work route=${secondWorkflowAction.nextWorkflowRouteJa} route-id=L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply packet=helix rename plan --json scoped=helix rename plan --json`,
      );
      expect(blockedText.stdout).toContain(
        "scoped-supporting=helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 1 helix s4 decision-packet --json runnable=bun run helix s4 decision-packet --json scoped=helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture runnable-scoped=bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
      );
      expect(blockedText.stdout).toContain(
        "matrixFields=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 2 helix rename plan --json runnable=bun run helix rename plan --json scoped=helix rename plan --json runnable-scoped=bun run helix rename plan --json schema=identifier-rename-cutover-plan.v1 matrix=verificationCommandMatrix count=10",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 2 helix rename approval-draft --json runnable=bun run helix rename approval-draft --json scoped=helix rename approval-draft --json runnable-scoped=bun run helix rename approval-draft --json schema=identifier-rename-approval-draft.v1 matrix=none count=0",
      );
      expect(blockedText.stdout).toContain(
        "review=非承認の approval draft record / current snapshot binding / safety flag を確認してから人間承認へ進む review-id=review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 2 helix action-binding approval-packet --json runnable=bun run helix action-binding approval-packet --json scoped=helix action-binding approval-packet --json --plan PLAN-M-02-fixture runnable-scoped=bun run helix action-binding approval-packet --json --plan PLAN-M-02-fixture schema=action-binding-approval-packet.v1 matrix=approvalVerificationCommandMatrix count=11",
      );
      expect(blockedText.stdout).toContain("completion: blocked");
      expect(blockedText.stdout).toMatch(
        /update: check skipped \(disabled by (HELIX_SKIP_UPDATE_CHECK|VITEST_WORKER_ID)\)/,
      );
      expect(blockedText.stdout).toContain("authority-blockers=human:");
      expect(blockedText.stdout).toContain(
        "workflow-state:non_terminal_plans automation:semantic_frontier_blocked",
      );
      expect(blockedText.stdout).toContain("semantic_frontier_records: 2");
      expect(blockedText.stdout).toContain("confirmed_current_meaning_records: 11");
      expect(blockedText.stdout).toContain("decision-packet: helix s4 decision-packet --json");
      expect(blockedText.stdout).toContain(
        "supporting-decision-packets: helix s4 decision-packet --json | helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json",
      );
      expect(blockedText.stdout).toContain(
        "completion-decision-packet: helix completion decision-packet --json",
      );
      expect(blockedText.stdout).toContain(
        "completion-review-bundle: helix completion review-bundle --json",
      );
      expect(blockedText.stdout).toContain(
        "runnable-completion-review-bundle: bun run helix completion review-bundle --json",
      );
      expect(blockedText.stdout).toContain(
        "completion-review-coverage: covered=human_approval_pending,irreversible_migration_pending,po_decision_pending non-packet=non_terminal_plans,semantic_frontier_blocked policy=review-packets-cover-decision-blockers-only",
      );
    } finally {
      rmSync(readyRoot, { recursive: true, force: true });
      rmSync(blockedRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("U-OUTSTANDING-012: exposes active objective progress as a percentage on the live status surface", () => {
    const json = runCli(["status", "--json"]);
    expect(json.status).toBe(0);
    const payload = JSON.parse(json.stdout);
    expect(payload.objectiveProgress).toMatchObject({
      method: "objective-evidence-audit.v1",
      percent: 90,
      provedRequirements: 9,
      totalRequirements: 10,
      blockedRequirements: 1,
      completionStatus: "blocked",
      completionClaimAllowed: false,
      auditOk: true,
      auditViolationCount: 0,
      progressEvidenceTrusted: true,
    });

    const text = runCli(["status"]);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain(
      "objective-progress: 90% (blocked; completion-claim-allowed=false; evidence=trusted; audit-ok=true; violations=0)",
    );
    expect(text.stdout).not.toContain("objective-progress-evidence: invalid");
    expect(text.stdout).toContain("confirmed_current_meaning_records: 11");
  });

  it("verifies objective external ledger with git ls-remote observations", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-objective-external-"));
    try {
      writeFakeGitLsRemote(binDir);
      const run = runCliIn(repoRoot, ["audit", "objective-external", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        externalObserved: {
          development_repo: "b828fcf64c204d1cfa65c729fa590ca9562adccc",
          distribution_repo: "unpublished",
          distribution_latest_tag: "unpublished",
        },
        externalCheck: {
          ok: true,
        },
        audit: {
          ok: true,
          objectiveProgress: {
            percent: 90,
            completionClaimAllowed: false,
          },
        },
      });
      expect(payload.externalObserved.externalObserved).toBeUndefined();
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("blocks objective external audit when git observed HEAD drifts from the ledger", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-objective-external-drift-"));
    try {
      writeFakeGitLsRemote(binDir, "drifted-pack-head");
      const run = runCliIn(repoRoot, ["audit", "objective-external", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload.ok).toBe(false);
      expect(payload.audit.violations).toContain(
        "G-01: 外部 source ledger distribution_repo observed drift expected=unpublished actual=drifted-pack-head",
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("blocks objective external audit when distribution latest tag advances beyond the ledger", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-objective-external-tag-drift-"));
    try {
      writeFakeGitLsRemote(binDir, "unpublished", "v0.1.5");
      const run = runCliIn(repoRoot, ["audit", "objective-external", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload.ok).toBe(false);
      expect(payload.audit.violations).toContain(
        "G-01: 外部 source ledger distribution_latest_tag observed drift expected=unpublished actual=v0.1.5",
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("exposes a completion decision packet for outstanding PO and approval blockers", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-completion-packet-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-DISCOVERY-10-fixture.md"),
        [
          "---",
          "plan_id: PLAN-DISCOVERY-10-fixture",
          "kind: poc",
          "layer: cross",
          "status: draft",
          "workflow_phase: S3",
          "---",
          "",
          "# fixture",
          "S4 decision_outcome is PO gated.",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-M-02-fixture.md"),
        [
          "---",
          "plan_id: PLAN-M-02-fixture",
          "kind: design",
          "layer: L14",
          "status: draft",
          "---",
          "",
          "# fixture",
          "irreversible cutover requires PO signoff, rollback evidence, and action-binding approval.",
        ].join("\n"),
        "utf8",
      );

      const json = runCliIn(root, ["completion", "decision-packet", "--json"]);
      expect(json.status).toBe(0);
      const packet = JSON.parse(json.stdout);
      expect(packet).toMatchObject({
        schemaVersion: "completion-decision-packet.v1",
        ok: false,
        status: "blocked",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "helix completion decision-packet --json",
        freshness: {
          validForMinutes: 1440,
          stale: false,
          policy: "decision-packet-freshness.v1",
        },
        decisionCount: 2,
        semanticMeaningSummary: {
          frontierRecordCount: 2,
          confirmedCurrentMeaningRecordCount: 11,
          completionClaimAllowed: false,
        },
        humanReviewBundle: {
          schemaVersion: "completion-decision-human-review-bundle.v1",
          status: "blocked",
          decisionCount: 2,
          nextAuthority: "human",
          completionClaimAllowed: false,
          items: [
            {
              order: 1,
              planId: "PLAN-DISCOVERY-10-fixture",
              decisionKind: "po_s4_decision",
              scopedPrimaryPacketCommand:
                "helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
              requiredRecords: ["s4_decision_record"],
            },
            {
              order: 2,
              planId: "PLAN-M-02-fixture",
              decisionKind: "irreversible_migration_signoff",
              scopedPrimaryPacketCommand: "helix rename plan --json",
              scopedSupportingPacketCommands: [
                "helix rename plan --json",
                "helix rename approval-draft --json",
                "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
              ],
              requiredRecords: ["cutover_decision_record", "action_binding_approval_record"],
            },
          ],
        },
      });
      expect(packet.semanticFeatureFrontierRecords).toHaveLength(2);
      expect(packet.confirmedCurrentMeaningRecords).toHaveLength(11);
      expect(packet.generatedAt).toEqual(expect.any(String));
      expect(packet.freshness.expiresAt).toEqual(expect.any(String));
      expect(
        packet.decisions.map((d: { planId: string; decisionKind: string }) => [
          d.planId,
          d.decisionKind,
        ]),
      ).toEqual([
        ["PLAN-DISCOVERY-10-fixture", "po_s4_decision"],
        ["PLAN-M-02-fixture", "irreversible_migration_signoff"],
      ]);
      expect(
        packet.decisions.map(
          (d: {
            planId: string;
            decisionPacketCommand: string;
            packetCommands: string[];
            scopedDecisionPacketCommand: string;
            scopedPacketCommands: string[];
          }) => [
            d.planId,
            d.decisionPacketCommand,
            d.packetCommands,
            d.scopedDecisionPacketCommand,
            d.scopedPacketCommands,
          ],
        ),
      ).toEqual([
        [
          "PLAN-DISCOVERY-10-fixture",
          "helix s4 decision-packet --json",
          ["helix s4 decision-packet --json"],
          "helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
          ["helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture"],
        ],
        [
          "PLAN-M-02-fixture",
          "helix rename plan --json",
          [
            "helix rename plan --json",
            "helix rename approval-draft --json",
            "helix action-binding approval-packet --json",
          ],
          "helix rename plan --json",
          [
            "helix rename plan --json",
            "helix rename approval-draft --json",
            "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
          ],
        ],
      ]);
      expect(packet.decisions[0].requiredRecords[0]).toMatchObject({
        recordName: "s4_decision_record",
        sourcePaths: ["docs/process/modes/discovery.md", "docs/process/modes/scrum.md"],
        sourceLedgerChecks: [
          {
            sourcePath: "docs/process/modes/discovery.md",
            ledgerLabel: "S4 decision source ledger",
          },
          {
            sourcePath: "docs/process/modes/scrum.md",
            ledgerLabel: "S4 decision source ledger",
          },
        ],
      });
      expect(packet.decisions[0].requiredRecords[0].fields).toContain("verified_evidence");
      expect(packet.decisions[0].recordTemplates[0]).toMatchObject({
        recordName: "s4_decision_record",
        yamlLines: expect.arrayContaining([
          "s4_decision_record:",
          '  - allowed_outcome: "<confirmed|rejected|pivot>"',
        ]),
      });
      expect(packet.decisions[1].requiredRecords[0]).toMatchObject({
        recordName: "cutover_decision_record",
        sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
        sourceLedgerChecks: [
          {
            sourcePath: "docs/process/forward/L08-L14-verification-phase.md",
            ledgerLabel: "Cutover source ledger",
          },
        ],
      });
      expect(packet.decisions[1].requiredRecords[0].fields).toContain("cutover_snapshot_id");
      expect(packet.decisions[1].allowedOutcomesByRecord).toEqual(
        expect.arrayContaining([
          {
            recordName: "cutover_decision_record",
            allowedOutcomes: ["approve_cutover", "reject_or_defer", "request_runbook_changes"],
          },
        ]),
      );
      expect(packet.decisions[1].nextWorkflowRoutesByRecord).toEqual(
        expect.arrayContaining([
          {
            recordName: "cutover_decision_record",
            nextWorkflowRoute: expect.stringContaining("L14 cutover decision"),
          },
        ]),
      );

      const summaryJson = runCliIn(root, ["completion", "decision-packet", "--summary-json"]);
      expect(summaryJson.status).toBe(0);
      const summary = JSON.parse(summaryJson.stdout);
      expect(summary).toMatchObject({
        schema_version: "completion-decision-packet-summary.v1",
        status: "blocked",
        ok: false,
        completion_claim_allowed: false,
        human_decision_required: true,
        next_authority: "human",
        authority_boundary: "human_decision_required",
        decision_count: 2,
        semantic_frontier_count: 2,
        confirmed_current_meaning_count: 11,
        blockers: expect.arrayContaining([
          "human_approval_pending",
          "irreversible_migration_pending",
          "non_terminal_plans",
          "po_decision_pending",
          "semantic_frontier_blocked",
        ]),
        human_review_bundle: {
          schema_version: "completion-decision-human-review-bundle.v1",
          status: "blocked",
          decision_count: 2,
          next_authority: "human",
          completion_claim_allowed: false,
        },
        completion_frontier: {
          schema_version: "completion-frontier-summary.v1",
          completion_claim_allowed: false,
          status: expect.any(String),
          current: expect.objectContaining({
            status: expect.any(String),
            completion_boundary: expect.any(String),
          }),
          current_location_frontier: expect.objectContaining({
            schema_version: "current-location-frontier-summary.v1",
            frontier_type: expect.any(String),
            commands: expect.objectContaining({
              current_location: "helix current-location --summary-json",
              project_frontier: "helix progress frontier --summary-json",
            }),
          }),
          drive_model: expect.objectContaining({
            source_command: "helix drive model --summary-json",
          }),
          recovery_runway: expect.objectContaining({
            status: expect.any(String),
            machine_actionable_count: expect.any(Number),
            human_approval_count: expect.any(Number),
          }),
          reentry_forecast: expect.objectContaining({
            status: expect.any(String),
            next_command: expect.any(String),
          }),
          closure_frontier: expect.objectContaining({
            action: "close_ready",
            review_window_index: expect.any(Array),
            source_command: "helix closure review-bundle --action close_ready --summary-json",
          }),
          commands: expect.objectContaining({
            project_frontier: "helix progress frontier --summary-json",
            closure_review_window: expect.stringContaining("helix closure review-bundle"),
            closure_decision_draft: expect.stringContaining("helix closure decision-draft"),
          }),
          project_frontier_source_command: "helix progress frontier --summary-json",
        },
        decisions: [
          expect.objectContaining({
            plan_id: "PLAN-DISCOVERY-10-fixture",
            decision_kind: "po_s4_decision",
            scoped_primary_packet_command:
              "helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
            required_records: ["s4_decision_record"],
          }),
          expect.objectContaining({
            plan_id: "PLAN-M-02-fixture",
            decision_kind: "irreversible_migration_signoff",
            scoped_primary_packet_command: "helix rename plan --json",
            scoped_supporting_packet_commands: [
              "helix rename plan --json",
              "helix rename approval-draft --json",
              "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
            ],
            required_records: ["cutover_decision_record", "action_binding_approval_record"],
          }),
        ],
        review_bundle_command: "helix completion review-bundle --json",
        runnable_review_bundle_command: "bun run helix completion review-bundle --json",
        write_policy: "read-only",
        source_command: "helix completion decision-packet --summary-json",
        full_source_command: "helix completion decision-packet --json",
      });
      expect(summary.decisions[0].recordTemplates).toBeUndefined();
      expect(summary.decisions[0].supportingPacketSummaries).toBeUndefined();

      const text = runCliIn(root, ["completion", "decision-packet"]);
      expect(text.status).toBe(0);
      const cutoverDecision = packet.decisions[1];
      expect(text.stdout).toContain("completion decision-packet: blocked decisions=2");
      expect(text.stdout).toContain(
        "semantic-summary: frontier=2 confirmed=11 completion-claim-allowed=false",
      );
      expect(text.stdout).toContain(
        "packet-freshness: source=helix completion decision-packet --json",
      );
      expect(text.stdout).toContain(
        "human-review-bundle: schema=completion-decision-human-review-bundle.v1 decisions=2 next-authority=human completion-claim-allowed=false",
      );
      expect(text.stdout).toContain(
        "human-review-item: 1 PLAN-DISCOVERY-10-fixture kind=po_s4_decision primary=helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain("owner-fields=s4_decision_record.decision_owner");
      expect(text.stdout).toContain(
        "freshness-fields=s4_decision_record.source_ledger_freshness,s4_decision_record.source_status_delta,s4_decision_record.adoption_decision_delta,s4_decision_record.workflow_route_impact",
      );
      expect(text.stdout).toContain(
        "safety-fields=s4-decision-packet.v1.planOnly,s4-decision-packet.v1.mustNotDecide,s4-decision-packet.v1.decisionCommandAvailable,s4-decision-packet.v1.decisionAllowed",
      );
      expect(text.stdout).toContain(
        "human-review-item: 2 PLAN-M-02-fixture kind=irreversible_migration_signoff primary=helix rename plan --json",
      );
      expect(text.stdout).toContain(
        "timing-fields=cutover_decision_record.trigger_condition,cutover_decision_record.execution_window_or_freeze_policy,action_binding_approval_record.expires_at_or_trigger",
      );
      expect(text.stdout).toContain(
        "identifier-rename-cutover-plan.v1.approvalGate.requiredDecision",
      );
      expect(text.stdout).toContain("PLAN-DISCOVERY-10-fixture");
      expect(text.stdout).toContain("PLAN-M-02-fixture");
      expect(text.stdout).toContain(
        "packet-command: primary=helix s4 decision-packet --json scoped-primary=helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture packets=helix s4 decision-packet --json scoped-packets=helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain(
        "runnable-packet-command: primary=bun run helix s4 decision-packet --json scoped-primary=bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture packets=bun run helix s4 decision-packet --json scoped-packets=bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain(
        "packet-summary: helix s4 decision-packet --json runnable=bun run helix s4 decision-packet --json scoped=helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture runnable-scoped=bun run helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture schema=s4-decision-packet.v1 matrix=decisionVerificationCommandMatrix count=8",
      );
      expect(text.stdout).toContain(
        "matrixFields=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact",
      );
      expect(text.stdout).toContain(
        "packet-command: primary=helix rename plan --json scoped-primary=helix rename plan --json packets=helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json scoped-packets=helix rename plan --json | helix rename approval-draft --json | helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(
        "runnable-packet-command: primary=bun run helix rename plan --json scoped-primary=bun run helix rename plan --json packets=bun run helix rename plan --json | bun run helix rename approval-draft --json | bun run helix action-binding approval-packet --json scoped-packets=bun run helix rename plan --json | bun run helix rename approval-draft --json | bun run helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(`required-action: ${cutoverDecision.requiredActionsJa[0]}`);
      expect(text.stdout).toContain(
        "required-action-id: record required human/action-binding approval before executing the high-impact action",
      );
      expect(text.stdout).toContain(`required-action: ${cutoverDecision.requiredActionsJa[1]}`);
      expect(text.stdout).toContain(
        "required-action-id: obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      );
      expect(text.stdout).toContain(
        "required-evidence: cutover_decision_record に allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes のいずれかを記録する",
      );
      expect(text.stdout).toContain(
        "required-evidence-id: cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
      );
      expect(text.stdout).toContain(`route: ${cutoverDecision.nextWorkflowRouteJa}`);
      expect(text.stdout).toContain(
        "route-id: L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
      );
      expect(text.stdout).toContain("record-outcomes cutover_decision_record");
      expect(text.stdout).toContain("record-outcomes action_binding_approval_record");
      expect(text.stdout).toContain("record-route cutover_decision_record");
      expect(text.stdout).toContain("record-route action_binding_approval_record");
      expect(text.stdout).toContain("record-template cutover_decision_record");
      expect(text.stdout).toContain("record-template action_binding_approval_record");
      expect(text.stdout).toContain(
        '  - allowed_outcome: "<approve_cutover|reject_or_defer|request_runbook_changes>"',
      );
      expect(text.stdout).toContain('  - cutover_snapshot_id: "<cutoverSnapshot.snapshotId>"');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("U-OUTSTANDING-017: exposes a completion review bundle for scoped non-destructive packet review", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-completion-review-bundle-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-DISCOVERY-10-fixture.md"),
        [
          "---",
          "plan_id: PLAN-DISCOVERY-10-fixture",
          "kind: poc",
          "layer: cross",
          "status: draft",
          "workflow_phase: S3",
          "---",
          "",
          "# fixture",
          "S4 decision_outcome is PO gated.",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-M-02-fixture.md"),
        [
          "---",
          "plan_id: PLAN-M-02-fixture",
          "kind: design",
          "layer: L14",
          "status: draft",
          "---",
          "",
          "# fixture",
          "irreversible cutover requires PO signoff, rollback evidence, and action-binding approval.",
        ].join("\n"),
        "utf8",
      );

      const json = runCliIn(root, ["completion", "review-bundle", "--json"]);
      expect(json.status).toBe(0);
      const bundle = JSON.parse(json.stdout);
      expect(bundle).toMatchObject({
        schemaVersion: "completion-review-bundle.v1",
        sourceCommand: "helix completion review-bundle --json",
        planOnly: true,
        mustNotDecide: true,
        mustNotApply: true,
        completionClaimAllowed: false,
        humanDecisionRequired: true,
        nextAuthority: "human",
        status: "blocked",
        decisionCount: 2,
        reviewPacketCount: 4,
        runnableSourceCommand: "bun run helix completion review-bundle --json",
        completionDecisionPacketCommand: "helix completion decision-packet --json",
        runnableCompletionDecisionPacketCommand: "bun run helix completion decision-packet --json",
        reviewCoveredBlockers: [
          "human_approval_pending",
          "irreversible_migration_pending",
          "po_decision_pending",
        ],
        nonPacketBlockers: ["non_terminal_plans", "semantic_frontier_blocked"],
      });
      expect(bundle.bundleDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(bundle.semanticBundleDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(bundle.completionDecisionPacketDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(bundle.reviewPackets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            planId: "PLAN-DISCOVERY-10-fixture",
            command: "helix s4 decision-packet --json",
            scopedCommand: "helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
            writePolicy: "see-packet-matrix",
            requiredSafetyFields: expect.arrayContaining([
              "planOnly",
              "mustNotDecide",
              "decisionAllowed",
            ]),
          }),
          expect.objectContaining({
            planId: "PLAN-M-02-fixture",
            command: "helix rename approval-draft --json",
            scopedCommand: "helix rename approval-draft --json",
            writePolicy: "no-write",
            requiredSafetyFields: expect.arrayContaining(["planOnly", "approvalAllowed"]),
          }),
          expect.objectContaining({
            planId: "PLAN-M-02-fixture",
            command: "helix action-binding approval-packet --json",
            scopedCommand: "helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
            runnableScopedCommand:
              "bun run helix action-binding approval-packet --json --plan PLAN-M-02-fixture",
            writePolicy: "see-packet-matrix",
          }),
        ]),
      );

      const text = runCliIn(root, ["completion", "review-bundle"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain(
        "completion review-bundle: blocked decisions=2 reviewPackets=4 source=helix completion review-bundle --json runnable=bun run helix completion review-bundle --json",
      );
      expect(text.stdout).toContain(
        "safety: planOnly=true mustNotDecide=true mustNotApply=true completionClaimAllowed=false humanDecisionRequired=true nextAuthority=human",
      );
      expect(text.stdout).toContain("bundle-digest: sha256:");
      expect(text.stdout).toContain("semantic-bundle-digest: sha256:");
      expect(text.stdout).toContain(
        "completion-decision-packet: helix completion decision-packet --json runnable=bun run helix completion decision-packet --json digest=sha256:",
      );
      expect(text.stdout).toContain(
        "review-coverage: covered=human_approval_pending,irreversible_migration_pending,po_decision_pending non-packet=non_terminal_plans,semantic_frontier_blocked policy=review-packets-cover-decision-blockers-only",
      );
      expect(text.stdout).toContain(
        "review-packet: PLAN-DISCOVERY-10-fixture helix s4 decision-packet --json scoped=helix s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain("reviewFieldCount=");
      expect(text.stdout).toContain("reviewFields=planOnly,mustNotDecide");
      expect(text.stdout).toContain("decisionRecord.source_ledger_freshness");
      expect(text.stdout).toContain("decisionEvidenceChecklist.verified_evidence");
      expect(text.stdout).toContain(
        "route=S4 decision evidence / outcome route / verification command を確認する route-id=review S4 decision evidence, outcome routes, and verification commands",
      );
      expect(text.stdout).toContain(
        "review-packet: PLAN-M-02-fixture helix rename approval-draft --json scoped=helix rename approval-draft --json",
      );
      expect(text.stdout).toContain(
        "route=非承認の approval draft record / current snapshot binding / safety flag を確認してから人間承認へ進む route-id=review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy",
      );
      expect(text.stdout).toContain("writePolicy=no-write");
      expect(text.stdout).toContain(
        "packet-freshness: source=helix completion review-bundle --json",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes action-binding approval packets as a non-destructive planning surface", () => {
    const json = runCli(["action-binding", "approval-packet", "--json"]);

    expect(json.status).toBe(0);
    const packets = JSON.parse(json.stdout);
    expect(packets.map((packet: { planId: string }) => packet.planId)).toEqual([
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(
      packets.every(
        (packet: { planOnly: boolean; mustNotApprove: boolean; approvalAllowed: boolean }) =>
          packet.planOnly === true &&
          packet.mustNotApprove === true &&
          packet.approvalAllowed === false,
      ),
    ).toBe(true);

    const s4Text = runCli([
      "s4",
      "decision-packet",
      "--plan",
      "PLAN-DISCOVERY-10-helix-asset-visualization",
    ]);
    expect(s4Text.status).toBe(1);
    expect(`${s4Text.stdout}\n${s4Text.stderr}`).toContain(
      "s4 decision-packet: plan_not_matched plan=PLAN-DISCOVERY-10-helix-asset-visualization",
    );

    const text = runCli([
      "action-binding",
      "approval-packet",
      "--plan",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain("status=pending_action_binding_approval");
    expect(text.stdout).toContain("planOnly=true");
    expect(text.stdout).toContain("approvalAllowed=false");

    const renameText = runCli(["rename", "plan"]);
    expect(renameText.status).toBe(0);
    expect(renameText.stdout).toContain("rename plan: status=blocked_pending_cutover_approval");
    expect(renameText.stdout).toContain("mustNotApply=true");
  }, 20_000);

  it("writes version-up activation review bundles as local artifacts only", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-version-up-bundle-"));
    try {
      const run = runCli([
        "version-up",
        "activation-bundle",
        "--plan",
        "PLAN-L7-146-serverless-readonly-share",
        "--out",
        root,
        "--json",
      ]);
      const payload = JSON.parse(run.stdout);
      const manifestPath = join(root, "activation-review-manifest.json");

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        output_dir: root,
        schemaVersion: "version-up-activation-review-bundle.v1",
        planId: "PLAN-L7-146-serverless-readonly-share",
        planOnly: true,
        mustNotApply: true,
        activationAllowed: false,
        applyCommandAvailable: false,
        writePolicy: "local-artifact-write",
      });
      expect(payload.files.map((file: { path: string }) => file.path)).toEqual([
        "activation-packet.json",
        "activation-rehearsal.json",
        "security-checklist.json",
        "version-dry-run-evidence.json",
        "readonly-share-index.html",
        "readonly-share-manifest.json",
        "activation-review-manifest.json",
      ]);
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      expect(manifest).toMatchObject({
        planOnly: true,
        mustNotApply: true,
        activationAllowed: false,
        applyCommandAvailable: false,
        writePolicy: "local-artifact-write",
      });
      expect(readFileSync(join(root, "activation-packet.json"), "utf8")).toContain(
        '"activationAllowed": false',
      );
      expect(
        JSON.parse(readFileSync(join(root, "readonly-share-manifest.json"), "utf8")),
      ).toMatchObject({
        planOnly: true,
        mustNotDeploy: true,
        readOnly: true,
        noSecretOrPiiProjection: true,
        noProdWrite: true,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails scoped decision packet commands closed when the requested PLAN is not present", () => {
    for (const args of [
      ["version-up", "activation-packet", "--plan", "PLAN-NOT-FOUND", "--json"],
      ["s4", "decision-packet", "--plan", "PLAN-NOT-FOUND", "--json"],
      ["action-binding", "approval-packet", "--plan", "PLAN-NOT-FOUND", "--json"],
    ]) {
      const result = runCli(args);
      expect(result.status, args.join(" ")).toBe(1);
      expect(JSON.parse(result.stdout)).toEqual({
        ok: false,
        reason: "plan_not_matched",
        command: args.slice(0, 2).join(" "),
        planId: "PLAN-NOT-FOUND",
      });
    }

    const text = runCli(["s4", "decision-packet", "--plan", "PLAN-NOT-FOUND"]);
    expect(text.status).toBe(1);
    expect(text.stderr).toContain("s4 decision-packet: plan_not_matched plan=PLAN-NOT-FOUND");
    expect(text.stdout).toBe("");
  });

  it("exposes HELIX project setup for VSCode-ready new projects", () => {
    const json = runCli(["setup", "project", "--dry-run", "--json"]);

    expect(json.status).toBe(0);
    const payload = JSON.parse(json.stdout);
    expect(payload).toMatchObject({
      schemaVersion: "helix-project-setup.v1",
      setupCommand: "helix setup project",
      canonicalCommand: "helix setup project",
      githubPlan: {
        schemaVersion: "helix-project-github-plan.v1",
        planOnly: true,
        appliesRemote: false,
        applyCommandAvailable: true,
        workflowPath: ".github/workflows/harness-check.yml",
        requiredChecks: ["harness-check"],
      },
      doctorBaseline: {
        schemaVersion: "helix-project-doctor-baseline.v1",
        planOnly: true,
        baselineCommands: [
          "helix setup project --dry-run",
          "helix status --json",
          "helix setup project --dry-run --json",
          "helix completion decision-packet --json",
          "helix completion review-bundle --json",
          "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          "helix doctor --profile consumer",
          "helix rename plan --json",
          "helix handover status --json",
          "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        ],
        stateBaselinePaths: [".helix/memory", ".helix/handover", ".helix/evidence", ".helix/teams"],
        completionClaimAllowed: false,
      },
      branchProtection: { applied: false, reason: "dry-run" },
      vscode: {
        tasksPath: join(".vscode", "tasks.json"),
        profileName: "HELIX",
        profileOpenCommand: "code --profile HELIX .",
        profileSourceUrl: "https://code.visualstudio.com/docs/configure/command-line",
        profileSourceCheckedAt: "2026-07-03",
        statusTask: "HELIX: status",
        completionDecisionPacketTask: "HELIX: completion decision-packet",
        completionReviewBundleTask: "HELIX: completion review-bundle",
        doctorTask: "HELIX: doctor",
        handoverTask: "HELIX: handover status",
        teamRunTask: "HELIX: team run dry-run",
      },
      baseline: {
        memoryPath: join(".helix", "memory"),
        handoverPath: join(".helix", "handover"),
        teamsPath: join(".helix", "teams"),
      },
      identifierTransition: {
        currentStateDir: ".helix",
        remainingApprovalSurface: "external_apply_and_completion_decision",
        status: "blocked_pending_cutover_approval",
        mustNotApply: true,
        cutoverPlanCommand: "helix rename plan --json",
      },
      commandAvailability: {
        currentCommand: "helix setup project",
        canonicalCommand: "helix setup project",
        enablementStatus: "canonical_helix_surface",
        enablementPacketCommand: "helix rename plan --json",
      },
      postSetupWorkflow: {
        schemaVersion: "helix-project-post-setup-workflow.v1",
        nextRoute: "review_import_report",
        importReportRoute: "review_import_report",
        manualDocSearchRequired: false,
      },
    });
    expect(payload.written).toEqual(
      expect.arrayContaining([
        join(".vscode", "tasks.json"),
        join(".helix", "memory", ".gitkeep"),
        join(".helix", "handover", ".gitkeep"),
      ]),
    );
    expect(payload.importReport).toMatchObject({
      schemaVersion: "helix-project-import-report.v1",
      mode: "brownfield",
      dryRun: true,
      policy: "preserve_existing_then_review_import_report",
      writtenPaths: [],
      requiresReview: true,
      nextRoute: "review_import_report",
    });
    expect(payload.importReport.managedPaths).toEqual(
      expect.arrayContaining([join(".vscode", "tasks.json")]),
    );
    expect(payload.importReport.existingPaths).toEqual(
      expect.arrayContaining(["AGENTS.md", join(".codex", "config.toml")]),
    );
    expect(payload.importReport.identicalManagedPaths).toEqual(
      expect.arrayContaining([join(".codex", "config.toml")]),
    );
    expect(payload.importReport.skipSubDocs).toEqual(
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
          path: join(".codex", "hooks.json"),
          reason: "consumer_owned_path_preserved_for_staged_migration",
          nextRoute: "review_import_report",
          evidence: "importReport.skippedExistingPaths",
          followUpGate: "import_report_review",
        }),
      ]),
    );
    expect(payload.consumerReadiness).toMatchObject({
      workspace: { repoRoot },
      ci: { forkPullRequestSecrets: "not-required" },
    });
    expect(payload.consumerReadiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "helix-cli",
        }),
      ]),
    );
    expect(
      payload.consumerReadiness.checks.find((check: { name: string }) => check.name === "helix-cli")
        ?.message,
    ).toMatch(/projected hooks|bun link helix|bun run helix/);
    expect(payload.commandAvailability.currentCommandAvailable).toBe(
      payload.consumerReadiness.checks.find((check: { name: string }) => check.name === "helix-cli")
        ?.ok ?? false,
    );
    expect(payload.postSetupWorkflow.unmetGates).toEqual(
      expect.arrayContaining(["import_report_review"]),
    );
    expect(payload.postSetupWorkflow.verificationCommands).toEqual([
      "helix setup project --dry-run",
      "helix status --json",
      "helix setup project --dry-run --json",
      "helix completion decision-packet --json",
      "helix completion review-bundle --json",
      "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      "helix doctor --profile consumer",
      "helix rename plan --json",
      "helix handover status --json",
      "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
    ]);
    expect(payload.postSetupWorkflow.verificationMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "setup-dry-run",
          command: "helix setup project --dry-run",
          writePolicy: "no-write",
        }),
        expect.objectContaining({
          phase: "vscode-profile-open",
          command: "code --profile HELIX .",
          writePolicy: "no-write",
          availability: "manual-local",
          source: "VS Code command line profile launch",
          sourceUrl: "https://code.visualstudio.com/docs/configure/command-line",
          sourceCheckedAt: "2026-07-03",
          adoptionDecision: expect.stringContaining("HELIX 導入済み VSCode"),
        }),
        expect.objectContaining({
          phase: "github-ci-safety",
          command: "helix setup project --dry-run --json",
          writePolicy: "no-write",
          source: "GitHub Actions secure use and workflow token permissions",
          sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
          adoptionDecision: expect.stringContaining("pull_request_target"),
        }),
        expect.objectContaining({
          phase: "consumer-doctor",
          command: "helix doctor --profile consumer",
          writePolicy: "no-write",
          source: "VS Code Workspace Trust and consumer adapter safety contract",
          sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
          sourceCheckedAt: "2026-07-02",
          adoptionDecision: expect.stringContaining("task.allowAutomaticTasks=off"),
        }),
        expect.objectContaining({
          phase: "completion-decision-packet",
          command: "helix completion decision-packet --json",
          writePolicy: "no-write",
          source: "HELIX completion decision packet contract",
        }),
        expect.objectContaining({
          phase: "completion-review-bundle",
          command: "helix completion review-bundle --json",
          writePolicy: "no-write",
          source: "HELIX completion review-bundle contract",
          sourceUrl: "docs/plans/PLAN-L7-278-completion-review-bundle.md",
          expected: expect.stringContaining("semanticBundleDigest"),
          adoptionDecision: expect.stringContaining("semantic digest"),
        }),
        expect.objectContaining({
          phase: "version-up-dry-run",
          command:
            "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          writePolicy: "no-write",
          source: "Semantic Versioning 2.0.0 and HELIX version-up dry-run contract",
          sourceUrl: "https://semver.org/",
          sourceCheckedAt: "2026-07-03",
        }),
        expect.objectContaining({
          phase: "team-run-dry-run",
          command:
            "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
          writePolicy: "no-write",
          source: "HELIX team definition schema and provider handover contract",
        }),
      ]),
    );
    expect(payload.doctorBaseline.baselineCommands).toEqual(
      payload.postSetupWorkflow.verificationCommands,
    );
    expect(payload.nextCommands).toEqual(
      expect.arrayContaining([
        "helix status --json",
        "helix completion decision-packet --json",
        "helix completion review-bundle --json",
        "helix doctor --profile consumer",
        "helix rename plan --json",
        "helix handover status --json",
        "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
      ]),
    );

    const text = runCli(["setup", "project", "--dry-run"]);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain("import-report: review_required (review_import_report)");
    expect(text.stdout).toContain("skipSubDocs=");
    expect(text.stdout).toContain(
      "skip-sub-doc: docs/plans marker=skip_sub_doc route=consumer_doctor_profile reason=dogfood_sub_doc_not_required_for_consumer_setup gate=consumer_doctor",
    );
    expect(text.stdout).toContain(
      "skip-sub-doc: .codex/hooks.json marker=skip_sub_doc route=review_import_report reason=consumer_owned_path_preserved_for_staged_migration gate=import_report_review",
    );
    expect(text.stdout).toContain("consumer-readiness:");
    expect(text.stdout).toContain("post-setup-workflow: review_import_report");
    expect(text.stdout).toContain("verification-matrix: 11");
    expect(text.stdout).toContain("post-setup-next-action:");
    expect(text.stdout).toContain("blocked-until:");
    expect(text.stdout).toContain("verification-command: helix completion decision-packet --json");
    expect(text.stdout).toContain("verification-command: helix completion review-bundle --json");
    expect(text.stdout).toContain(
      "verification-command: helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
    );
    expect(text.stdout).toContain("verification-command: helix doctor --profile consumer");
    expect(text.stdout).toContain("verification-command: helix rename plan --json");
    expect(text.stdout).toContain(
      "verification-command: helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
    );
    expect(text.stdout).toContain("manual-verification-command: code --profile HELIX .");
    expect(text.stdout).toContain(
      "verification-check: vscode-profile-open availability=manual-local requiresMaterializedPaths=.vscode/tasks.json,.vscode/settings.json writePolicy=no-write command=code --profile HELIX . expected=opens the consumer folder in a named HELIX VS Code profile",
    );
    expect(text.stdout).toContain(
      "verification-check: consumer-doctor availability=post-apply-or-projected requiresMaterializedPaths=AGENTS.md,CLAUDE.md,.claude/CLAUDE.md,.vscode/tasks.json,.vscode/settings.json,.helix/memory,.helix/handover,.helix/evidence,.helix/teams writePolicy=no-write command=helix doctor --profile consumer expected=passes the consumer profile",
    );
    expect(text.stdout).toContain(
      "verification-check: completion-decision-packet availability=dry-run-immediate requiresMaterializedPaths=- writePolicy=no-write command=helix completion decision-packet --json expected=returns completionStatus=blocked",
    );
    expect(text.stdout).toContain(
      "verification-check: completion-review-bundle availability=dry-run-immediate requiresMaterializedPaths=- writePolicy=no-write command=helix completion review-bundle --json expected=returns completion-review-bundle.v1",
    );
    expect(text.stdout).toContain("semanticBundleDigest");
    expect(text.stdout).toContain(
      "verification-check: identifier-cutover-packet availability=dry-run-immediate requiresMaterializedPaths=- writePolicy=no-write command=helix rename plan --json expected=returns blocked_pending_cutover_approval",
    );
    expect(text.stdout).toContain(
      "verification-source: setup-dry-run source=VS Code workspace task contract sourceUrl=https://code.visualstudio.com/docs/debugtest/tasks",
    );
    expect(text.stdout).toContain(
      "verification-source: vscode-profile-open source=VS Code command line profile launch sourceUrl=https://code.visualstudio.com/docs/configure/command-line",
    );
    expect(text.stdout).toContain(
      "verification-source: github-ci-safety source=GitHub Actions secure use and workflow token permissions sourceUrl=https://docs.github.com/en/actions/reference/security/secure-use",
    );
    expect(text.stdout).toContain("adoption=harness-check は push/pull_request");
    expect(text.stdout).toContain(
      "writePolicy=no-write command=helix setup project --dry-run --json",
    );
    expect(text.stdout).toContain("checked=2026-07-02");
    expect(text.stdout).toContain("status=VS Code Tasks official docs current");
    expect(text.stdout).toContain("statusDelta=none; setup keeps generated tasks explicit");
    expect(text.stdout).toContain("adoption=VS Code Tasks は shell task");
    expect(text.stdout).toContain("adoptionDelta=none; keep task projection non-automatic");
    expect(text.stdout).toContain("routeImpact=task contract drift routes to consumer doctor");
    expect(text.stdout).toContain("writePolicy=no-write command=helix setup project --dry-run");
    expect(text.stdout).toContain(
      "verification-source: consumer-doctor source=VS Code Workspace Trust and consumer adapter safety contract sourceUrl=https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
    );
    expect(text.stdout).toContain("status=VS Code Workspace Trust official docs current");
    expect(text.stdout).toContain("adoption=Workspace Trust の自動コード実行境界");
    expect(text.stdout).toContain("github-plan: helix-project-github-plan.v1 planOnly=true");
    expect(text.stdout).toContain(
      'github-pr: status=preflight_required preferred=gh-cli connector=github-app failure=resource_not_accessible_by_integration command="gh pr create --draft --base <base> --head <branch> --title <title>"',
    );
    expect(text.stdout).toContain(
      "doctor-baseline: helix-project-doctor-baseline.v1 completionClaimAllowed=false",
    );
    expect(text.stdout).toContain("HELIX: handover status");
    expect(text.stdout).toContain(
      "vscode-profile: HELIX command=code --profile HELIX . source=https://code.visualstudio.com/docs/configure/command-line checked=2026-07-03",
    );
    const currentAvailable = payload.commandAvailability.currentCommandAvailable;
    expect(text.stdout).toContain(
      `command-availability: helix setup project available=${currentAvailable} status=canonical_helix_surface`,
    );
  }, 15_000);

  it("keeps legacy setup text scoped away from HELIX project completion", () => {
    const text = runCli(["setup", "--dry-run"]);

    expect(text.status).toBe(0);
    expect(text.stdout).toContain("setup-scope: legacy solo/team adapter setup");
    expect(text.stdout).toContain(
      "HELIX project bootstrap は `helix setup project` を使用してください",
    );
    expect(text.stdout).toContain("completion-boundary:");
    expect(text.stdout).toContain("L14 completion evidence ではありません");
    expect(text.stdout).not.toContain("helix project setup:");
    expect(text.stdout).not.toContain("verification-command: helix rename plan --json");
  }, 15_000);

  it("exposes HELIX project setup package-root evidence for monorepo consumers", () => {
    const json = runCli([
      "setup",
      "project",
      "--dry-run",
      "--json",
      "--package-root",
      "packages/app",
    ]);

    expect(json.status).toBe(0);
    const payload = JSON.parse(json.stdout);
    expect(payload.consumerReadiness.workspace).toMatchObject({
      repoRoot: process.cwd(),
      packageRoot: join(process.cwd(), "packages/app"),
      monorepo: true,
    });
    expect(payload.consumerReadiness.cliResolution).toMatchObject({
      command: "helix",
      checkedFrom: join(process.cwd(), "packages/app"),
      fallbackCommands: expect.arrayContaining([
        "bun run helix --version",
        "bun run helix setup project --dry-run --json",
      ]),
    });
    expect(payload.written).toEqual(
      expect.arrayContaining([join(".helix", "teams", "default-hybrid.yaml")]),
    );
  }, 15_000);

  it("exposes skill suggest as a JSON command surface", () => {
    const run = runCli(["skill", "suggest", "--plan", "PLAN-NO-SUCH", "--json"]);

    expect(run.status).toBe(0);
    expect(JSON.parse(run.stdout)).toEqual([]);
  }, 15_000);

  it("exposes Project current-location skill binding as a JSON command surface", () => {
    const run = runCli(["skill", "suggest", "--current-location", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      schema_version: "project-skill-binding.v1",
      source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
      status: "ready",
      selected_model: "Recovery",
      source_command: "helix skill suggest --current-location --json",
      view_command: "helix progress tree-view --json",
      write_policy: "read-only",
    });
    expect(payload.workflow_modes).toEqual(expect.arrayContaining(["Recovery", "Scrum"]));
    expect(payload.source_bindings).toEqual(
      expect.arrayContaining([
        "zip-source:scrum-product-backlog",
        "zip-source:scrum-sprint-plan",
        "zip-source:scrum-acceptance",
      ]),
    );
    expect(payload.implementation_dependencies).toEqual(
      expect.arrayContaining(["automation_assets", "skill_recommendations"]),
    );
    expect(payload.required_skills).toBeGreaterThan(0);
    expect(payload.items[0]).toMatchObject({
      skill_id: "skill:gate-planning",
      tier: "required",
      inject_at: "before_work",
      reasons: expect.arrayContaining(["scrum_operation_gap_signal"]),
    });
    expect(payload.items[1]).toMatchObject({
      skill_id: "skill:planning-and-task-breakdown",
      tier: "required",
      inject_at: "before_work",
      reasons: expect.arrayContaining(["scrum_operation_gap_signal"]),
    });
    expect(payload.items[0].skill_path).toMatch(/^docs\/skills\//);
  }, 30_000);

  it("exposes Project current-location skill binding as a summary JSON command surface", () => {
    const run = runCli(["skill", "suggest", "--current-location", "--summary-json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      schema_version: "project-skill-binding-summary.v1",
      source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
      status: "ready",
      selected_model: "Recovery",
      source_command: "helix skill suggest --current-location --summary-json",
      full_source_command: "helix skill suggest --current-location --json",
      full_inject_command: "helix skill suggest --current-location --inject --json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
      write_policy: "read-only",
    });
    expect(payload.workflow_modes).toEqual(expect.arrayContaining(["Recovery", "Scrum"]));
    expect(payload.item_count).toBeGreaterThan(0);
    expect(payload.top_items[0]).toMatchObject({
      tier: "required",
      inject_at: "before_work",
      skill_path: expect.stringMatching(/^docs\/skills\//),
      sample_reasons: expect.arrayContaining(["scrum_operation_gap_signal"]),
    });
  }, 30_000);

  it("exposes Project current-location skill binding as an injection manifest", () => {
    const run = runCli(["skill", "suggest", "--current-location", "--inject", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      plan_id: "project-current-location",
      source_command: "helix skill suggest --current-location --inject --json",
      write_policy: "read-only",
      missing_skill_ids: [],
    });
    expect(payload.entries.length).toBeGreaterThan(0);
    expect(payload.required_paths.length).toBeGreaterThan(0);
    expect(payload.entries[0]).toMatchObject({
      tier: "required",
      inject_at: "before_work",
    });
  }, 30_000);

  it("exposes skill injection as a provider-neutral JSON manifest", () => {
    const run = runCli([
      "skill",
      "suggest",
      "--text",
      "refactor regression test",
      "--inject",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      plan_id: "text:refactor-regression-test",
      missing_skill_ids: [],
    });
    expect(payload.entries.length).toBeGreaterThan(0);
    expect(payload.entries.every((entry: { skill_path: string }) => entry.skill_path)).toBe(true);
    expect(payload.required_paths.length).toBeGreaterThan(0);
  }, 20_000);

  it("passes plan skill injection through task route adapter plans", () => {
    const run = runCli([
      "task",
      "route",
      "--role",
      "se",
      "--plan",
      join(repoRoot, "docs", "plans", "PLAN-L7-135-dynamic-skill-injection-materialization.md"),
      "--mode",
      "codex-only",
      "--execute",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload.adapterPlan.context_injection.required_paths.length).toBeGreaterThan(0);
    expect(payload.adapterPlan.stdin).toContain("HELIX context injection:");
  }, 20_000);

  it("keeps proposal advisory lanes aligned with executable task routing", () => {
    const classify = runCli([
      "task",
      "classify",
      "--design-docs",
      "--json",
      "--text",
      "Rename a local docs helper and update README wording.",
    ]);
    const route = runCli([
      "task",
      "route",
      "--role",
      "se",
      "--primary",
      "codex",
      "--mode",
      "codex-only",
      "--json",
      "--text",
      "rename a field",
    ]);
    const classifyPayload = JSON.parse(classify.stdout);
    const routePayload = JSON.parse(route.stdout);

    expect(classify.status).toBe(0);
    expect(route.status).toBe(0);
    expect(classifyPayload.document_coverage.recommended_subagents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tier: "T2-mini",
          model: "gpt-5.4-mini",
          parallel_slots: 4,
          closing_authority: false,
          ownership: expect.stringContaining("disjoint"),
        }),
        expect.objectContaining({
          tier: "T2-spark",
          model: "gpt-5.3-codex-spark",
          parallel_slots: 3,
          closing_authority: false,
          ownership: expect.stringContaining("disjoint"),
        }),
      ]),
    );
    expect(routePayload.decision).toMatchObject({
      role: "se",
      tier: "T2",
      model: "gpt-5.3-codex-spark",
      status: "ready",
    });
    expect(routePayload.decision.model).not.toBe("gpt-5.4-mini");
  }, 20_000);

  it("U-ROUTE-001: routes pair-agent TDD signals to the pair-agent planning surface", () => {
    const run = runCli(["route", "eval", "--format", "json", "--signal", "pair-agent TDD route"]);
    expect(run.status).toBe(0);
    const payload = JSON.parse(run.stdout);
    expect(payload.mode).toBe("add-feature");
    expect(payload.suggest_command).toContain("helix pair-agent plan --plan-id <PLAN-ID>");
    expect(payload.recommended_command).toMatchObject({
      schema_version: "v1",
      command: "helix pair-agent plan",
      args: {
        signal: "pair-agent TDD route",
        mode: "add-feature",
        pair_route: "smart_test_author_to_light_implementation_to_smart_review",
        requires_plan_id: true,
      },
      safety: {
        auto_apply: false,
        requires_human_approval: false,
        requires_preflight: true,
      },
    });
  });

  it("exposes builder catalog as a JSON command surface", () => {
    const run = runCli(["builder", "catalog", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload.ok).toBe(true);
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "helix builder catalog",
    );
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "helix progress snapshot",
    );
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "helix progress view-model",
    );
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "helix graph export",
    );
  });

  it("exports relation graph diagrams through mermaid, dot, and d2 CLI formats without silent fallback", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-graph-export-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "src", "widget"), { recursive: true });
      mkdirSync(join(root, "tests"), { recursive: true });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-TEST-01-widget.md"),
        [
          "---",
          "plan_id: PLAN-TEST-01-widget",
          "status: confirmed",
          "kind: impl",
          "generates:",
          "  - artifact_path: src/widget/core.ts",
          "    artifact_type: source_module",
          "---",
          "",
          "fixture",
          "",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(join(root, "src", "widget", "core.ts"), "export const core = 1;\n", "utf8");
      mkdirSync(join(root, "src", "other"), { recursive: true });
      writeFileSync(join(root, "src", "other", "unused.ts"), "export const unused = 1;\n", "utf8");
      writeFileSync(
        join(root, "tests", "core.test.ts"),
        'import { core } from "../src/widget/core";\nexport const t = core;\n',
        "utf8",
      );

      const mermaid = runCliIn(root, ["graph", "export", "--format", "mermaid"]);
      expect(mermaid.status).toBe(0);
      expect(mermaid.stdout).toContain("flowchart TD");

      const dot = runCliIn(root, ["graph", "export", "--format", "dot"]);
      expect(dot.status).toBe(0);
      expect(dot.stdout).toContain("digraph relation_graph");

      const d2 = runCliIn(root, ["graph", "export", "--format", "d2"]);
      expect(d2.status).toBe(0);
      expect(d2.stdout).toContain('source_src_widget_core_ts: "source:src/widget/core.ts"');
      expect(d2.stdout).not.toContain("flowchart TD");

      const scoped = runCliIn(root, [
        "graph",
        "export",
        "--format",
        "mermaid",
        "--scope",
        "src/widget",
      ]);
      expect(scoped.status).toBe(0);
      expect(scoped.stdout).toContain("# scope=src/widget");
      expect(scoped.stdout).toContain("source:src/widget/core.ts");
      expect(scoped.stdout).not.toContain("source:src/other/unused.ts");

      const outsideScope = runCliIn(root, [
        "graph",
        "export",
        "--format",
        "mermaid",
        "--scope",
        "../src",
      ]);
      expect(outsideScope.status).toBe(1);
      expect(outsideScope.stderr).toContain("invalid-scope");

      const invalid = runCliIn(root, ["graph", "export", "--format", "svg"]);
      expect(invalid.status).toBe(1);
      expect(invalid.stderr).toContain("invalid-format");
      expect(invalid.stderr).toContain("mermaid, dot, or d2");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes progress snapshot as a deterministic visualization JSON surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-progress-snapshot-"));
    try {
      const run = runCliIn(root, ["progress", "snapshot", "--json"]);
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        schema_version: "visualization-snapshot.v1",
        progress: {
          artifacts: { total: 0, red: 0, yellow: 0, green: 0 },
        },
        graph: {
          nodes: 0,
          edges: 0,
        },
        evidence: {
          runtime_verification: {
            total: 0,
            accepted: 0,
            blocked: 0,
          },
        },
        drilldowns: {
          artifact_progress_command: "helix progress artifacts --json",
          runtime_verification_table: "runtime_verification_events",
        },
      });
      const artifactsSummary = runCliIn(root, ["progress", "artifacts", "--summary-json"]);
      expect(artifactsSummary.status).toBe(0);
      expect(JSON.parse(artifactsSummary.stdout)).toMatchObject({
        schema_version: "progress-artifacts-summary.v1",
        selected_color: null,
        total: 0,
        counts: {
          by_color: {},
          by_type: {},
          by_state: {},
        },
        sample_count: 0,
        sample_items: [],
        write_policy: "read-only",
        source_command: "helix progress artifacts --summary-json",
        full_source_command: "helix progress artifacts --json",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes Project view current-location and drive recommendation from DB projection", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-current-location-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "docs", "design", "helix", "L3-requirements"), {
        recursive: true,
      });
      mkdirSync(join(root, "docs", "test-design", "helix"), {
        recursive: true,
      });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L14-01-close.md"),
        [
          "---",
          "plan_id: PLAN-L14-01-close",
          "kind: impl",
          "layer: L14",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-08T00:00:00.000Z",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L7-999-new-impl.md"),
        [
          "---",
          "plan_id: PLAN-L7-999-new-impl",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: draft",
          "updated: 2026-07-08T00:01:00.000Z",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "design", "helix", "L3-requirements", "fixture.md"),
        [
          "---",
          "spec:",
          "  defines:",
          "    - id: HR-FR-CLI-01",
          "      kind: 機能要件",
          "      layer: L3",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "test-design", "helix", "fixture-acceptance.md"),
        [
          "---",
          "spec:",
          "  defines:",
          "    - id: HAT-CLI-01",
          "      kind: 受入テスト",
          "      layer: L11",
          "  refs:",
          "    - from: HAT-CLI-01",
          "      to: HR-FR-MISSING",
          "      kind: accepts",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );

      const json = runCliIn(root, ["current-location", "--json"]);
      const payload = JSON.parse(json.stdout);

      expect(json.status).toBe(0);
      expect(payload).toMatchObject({
        schema_version: "project-current-location.v1",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
          completion_boundary: "contradicted",
        },
        drive_recommendation: {
          model: "Recovery",
          reverseTargets: ["docs/design/**", "docs/test-design/**"],
        },
        drive_route: {
          routeId: "drive:Recovery:recover-current-location",
          status: "recovery_required",
          selectedModel: "Recovery",
          defaultModel: "Forward",
          mustReturnToDesign: true,
          forward: {
            allowed: false,
          },
          reverse: {
            required: true,
            targets: ["docs/design/**", "docs/test-design/**"],
            queueActions: ["collect_evidence"],
            ledgerIds: ["next-action:closure:collect_evidence"],
          },
        },
        recovery: {
          status: "active",
          selected_closure_action: "collect_evidence",
          exit_forecast: {
            status: "blocked",
            remaining_queue_items: 1,
            next_command: "helix closure batch --action collect_evidence --json",
          },
          automation_runway: {
            status: "machine_work_available",
            machine_actionable_count: 1,
            human_approval_count: 0,
            remaining_after_machine_lanes: 0,
            next_machine_action: "collect_evidence",
            next_machine_command: "helix closure batch --action collect_evidence --json",
            next_machine_probe_command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            next_machine_materialize_command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
          },
          reentry_forecast: {
            status: "machine_phase_pending",
            next_phase_action: "collect_evidence",
            next_phase_type: "machine",
            next_command: "helix closure batch --action collect_evidence --json",
            next_execution_command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
          },
        },
        roadmap_position: {
          status: "uncovered",
          rollup: {
            total_bands: 5,
            covered_bands: 0,
            parked_bands: 2,
            uncovered_bands: 3,
            total_gates: 0,
            reached_gates: 0,
          },
          frontier: ["design", "impl", "upstream"],
          current_band_ids: ["design", "impl", "upstream"],
          current_gate_ids: [],
        },
      });
      expect(payload.counts).toMatchObject({
        plans_total: 2,
        open_l7_plans: 1,
        terminal_l14_plans: 1,
        design_declarations: 2,
        design_references: 1,
        unresolved_design_references: 1,
      });
      expect(payload.closure).toMatchObject({
        status: "contradicted",
        l7_open_plan_ids: ["PLAN-L7-999-new-impl"],
        terminal_l14_plan_ids: ["PLAN-L14-01-close"],
        remediation: {
          done: 0,
          missing: 1,
          reverify: 2,
        },
        queue: {
          total: 1,
          route_counts: {
            close_ready: 0,
            collect_evidence: 1,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
          items: [
            expect.objectContaining({
              planId: "PLAN-L7-999-new-impl",
              sourcePath: "docs/plans/PLAN-L7-999-new-impl.md",
              priority: 30,
              driveModel: "Reverse",
              nextAction: "collect_evidence",
              evidence: expect.objectContaining({
                status: "partial",
                artifactPaths: ["docs/plans/PLAN-L7-999-new-impl.md"],
                testRuns: {
                  total: 0,
                  passed: 0,
                  failed: 0,
                  latestPassedAt: null,
                  latestFailedAt: null,
                },
              }),
            }),
          ],
        },
        packets: {
          total: 1,
          items: [
            expect.objectContaining({
              packetId: "closure:collect_evidence",
              nextAction: "collect_evidence",
              count: 1,
              planIds: ["PLAN-L7-999-new-impl"],
            }),
          ],
        },
      });
      expect(payload.coverage.l12_layers).toHaveLength(12);
      expect(payload.coverage.l12_layers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            layer: "L6",
            status: "reverify",
            legacyLayers: ["L7"],
          }),
          expect.objectContaining({
            layer: "L12",
            status: "reverify",
            legacyLayers: ["L14"],
          }),
        ]),
      );
      expect(payload.findings.map((finding: { code: string }) => finding.code)).toContain(
        "unresolved_design_reference",
      );

      const summaryJson = runCliIn(root, ["current-location", "--summary-json"]);
      const summaryPayload = JSON.parse(summaryJson.stdout);
      const summaryFindingCount = summaryPayload.finding_count;
      expect(summaryJson.status).toBe(0);
      expect(summaryPayload).toMatchObject({
        schema_version: "project-current-location-summary.v1",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
          completion_boundary: "contradicted",
        },
        drive_recommendation: {
          model: "Recovery",
          reverse_targets: ["docs/design/**", "docs/test-design/**"],
        },
        drive_route: {
          route_id: "drive:Recovery:recover-current-location",
          status: "recovery_required",
          selected_model: "Recovery",
          must_return_to_design: true,
          reverse: {
            required: true,
            queue_actions: ["collect_evidence"],
            ledger_count: 1,
          },
        },
        current_location_frontier: {
          schema_version: "current-location-frontier-summary.v1",
          frontier_type: "recovery_frontier",
          status: "recovery_required",
          classification: "l14_claim_with_l7_work",
          completion_boundary: "contradicted",
          selected_model: "Recovery",
          route_id: "drive:Recovery:recover-current-location",
          must_return_to_design: true,
          open_l7_count: 1,
          terminal_l14_claim_count: 1,
          sample_open_l7_plan_ids: ["PLAN-L7-999-new-impl"],
          sample_terminal_l14_plan_ids: ["PLAN-L14-01-close"],
          finding_codes: expect.arrayContaining(["l14_claim_with_l7_work"]),
          selected_closure_action: "collect_evidence",
          queue_total: 1,
          automation: expect.objectContaining({
            status: "machine_work_available",
            machine_actionable_count: 1,
            human_approval_count: 0,
          }),
          reentry: expect.objectContaining({
            status: "machine_phase_pending",
            next_gate: "recompute_drive_model",
            next_command: "helix closure batch --action collect_evidence --summary-json",
          }),
          commands: {
            current_location: "helix current-location --summary-json",
            drive_model: "helix drive model --summary-json",
            recovery_plan: "helix recovery plan --summary-json",
            roadmap_current: "helix roadmap current --summary-json",
            vmodel_fit: "helix vmodel fit --summary-json",
            project_frontier: "helix progress frontier --summary-json",
          },
        },
        function_design_policy: {
          status: expect.any(String),
          independent_layer_policy: "abolished",
          detail_contract_coverage_status: expect.any(String),
          tailoring_detail_contract_status: expect.any(String),
          accepted_layers: ["L5", "L7", "typed declaration", "runtime evidence"],
          absorbed_surfaces: expect.arrayContaining([
            "L5 detailed design",
            "design_declarations",
            "L7 TDD closure",
            "runtime_verification_events",
          ]),
          command: "helix current-location --summary-json",
          required_action:
            "独立した重い機能設計層を要求せず、必要な契約を L5 詳細設計・typed declaration・L7 TDD closure・runtime evidence へ吸収する",
        },
        operation_scope: {
          designed: expect.any(Number),
          observed: expect.any(Number),
          observed_gap: expect.any(Number),
          missing: expect.any(Number),
          reverify: expect.any(Number),
          source_command: "helix current-location --summary-json",
          items: expect.arrayContaining([
            expect.objectContaining({
              scope: "log_design",
              status: expect.any(String),
              design_count: expect.any(Number),
              observed_count: expect.any(Number),
              evidence_tables: expect.arrayContaining(["design_declarations"]),
            }),
            expect.objectContaining({
              scope: "kpi_metric",
              status: "observed",
              observation_gap: false,
              sample_observation_sources: expect.any(Array),
              evidence_tables: expect.arrayContaining(["quality_signals"]),
            }),
            expect.objectContaining({
              scope: "class_method_contract",
              status: expect.any(String),
              coverage_id: "L12-operation-observability",
            }),
          ]),
        },
        scrum_operation: {
          status: expect.any(String),
          source_package: expect.any(String),
          source_binding_count: expect.any(Number),
          source_bindings: expect.any(Array),
          backlog_items: expect.any(Number),
          sprint_items: expect.any(Number),
          acceptance_items: expect.any(Number),
          planning_items: expect.any(Number),
          ceremony_items: expect.any(Number),
          metric_items: expect.any(Number),
          active_sprint_plans: expect.any(Number),
          observed_count: expect.any(Number),
          missing_count: expect.any(Number),
          gap_items: expect.any(Array),
        },
        closure: {
          status: "contradicted",
          open_l7: 1,
          l14_claims: 1,
          queue_total: 1,
          route_counts: {
            collect_evidence: 1,
          },
        },
        approval_review_gate: {
          status: "none",
          action: "close_ready",
          count: 0,
          approval_window_count: 0,
          current_window_command:
            "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
          decision_draft_record_command:
            "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
          write_policy: "read-only",
        },
        recovery: {
          status: "active",
          selected_closure_action: "collect_evidence",
          automation_status: "machine_work_available",
          machine_actionable_count: 1,
          human_approval_count: 0,
          next_machine_command: "helix closure batch --action collect_evidence --summary-json",
        },
        skill_binding: expect.objectContaining({
          source_command: "helix skill suggest --current-location --summary-json",
          full_inject_command: "helix skill suggest --current-location --inject --json",
          top_items: expect.any(Array),
        }),
        commands: expect.objectContaining({
          current_location: "helix current-location --summary-json",
          closure_review_window:
            "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
          closure_decision_draft_record:
            "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
          skill_binding: "helix skill suggest --current-location --summary-json",
        }),
        finding_count: expect.any(Number),
        source_command: "helix current-location --summary-json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
      });
      expect(summaryFindingCount).toBeGreaterThanOrEqual(1);
      expect(summaryPayload.findings.map((finding: { code: string }) => finding.code)).toContain(
        "unresolved_design_reference",
      );
      expect(summaryPayload.closure.l7_open_plan_ids).toBeUndefined();
      expect(summaryPayload.closure.queue).toBeUndefined();
      expect(summaryPayload.closure.packets).toBeUndefined();

      const text = runCliIn(root, ["current-location"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain("current-location: layer=L14 l12=L12 status=needs_recovery");
      expect(text.stdout).toContain(
        "drive-route: drive:Recovery:recover-current-location status=recovery_required model=Recovery default=Forward return_to_design=true write=read-only",
      );
      expect(text.stdout).toContain(
        "drive-reverse-scope: targets=docs/design/**,docs/test-design/**",
      );
      expect(text.stdout).toContain(
        "recovery-exit: status=blocked remaining=1 blockers=2 next=helix closure batch --action collect_evidence --json",
      );
      expect(text.stdout).toContain(
        "recovery-runway: status=machine_work_available machine=1 approval=0 reverse=0 after_machine=0 next=helix closure batch --action collect_evidence --json next_probe=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(text.stdout).toContain(
        "recovery-reentry: status=machine_phase_pending effective=machine_phase_pending blocking=1 after_machine=0 phases=1 next=collect_evidence gate=recompute_drive_model command=helix closure batch --action collect_evidence --json execute=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(text.stdout).toContain("l12-coverage: done=");
      expect(text.stdout).toContain("design-impact: declarations=");
      expect(text.stdout).toContain(
        "roadmap-position: status=uncovered bands=0/5 parked=2 uncovered=3",
      );
      expect(text.stdout).toContain("operation-scope: designed=");
      expect(text.stdout).toContain("observed_gap=");
      expect(text.stdout).toContain("artifact-remap: done=");
      expect(text.stdout).toContain("artifact-remap-layers: L1=");
      expect(text.stdout).toContain("closure: status=contradicted open_l7=1 l14_claims=1");
      expect(text.stdout).toContain("closure-remediation: done=0 missing=1 reverify=2");
      expect(text.stdout).toContain("closure-queue: total=1 head=PLAN-L7-999-new-impl");
      expect(text.stdout).toContain("closure-queue-evidence: ready=0 partial=1 missing=0");
      expect(text.stdout).toContain("closure-queue-route: close=0 collect=1 repair=0 reverse=0");
      expect(text.stdout).toContain("closure-packets: total=1 collect_evidence=1");
      expect(text.stdout).toContain(
        "closure-automation: first=closure-batch:2:collect_evidence command=helix closure batch --action collect_evidence --json",
      );
      expect(text.stdout).toContain("drive=Recovery");
      expect(text.stdout).toContain("reverse-targets=docs/design/**,docs/test-design/**");

      const driveModelJson = runCliIn(root, ["drive", "model", "--json"]);
      expect(driveModelJson.status).toBe(0);
      const driveModelPayload = JSON.parse(driveModelJson.stdout);
      expect(driveModelPayload).toMatchObject({
        schema_version: "project-drive-model.v1",
        selected_model: "Recovery",
        default_model: "Forward",
        selection_status: "recovery_required",
        blocking_finding_codes: expect.arrayContaining(["l14_claim_with_l7_work"]),
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        selected_candidate: {
          model: "Recovery",
          route_id: "drive:Recovery:recover-current-location",
          command: "helix closure evidence-plan --summary-json",
          coverage_ids: expect.arrayContaining([
            "L12-operation-observability",
            "L5-detailed-contract",
            "L6-implementation-binding",
            "L7-tdd-closure",
          ]),
        },
        blocked_models: expect.arrayContaining(["Reverse", "Forward"]),
        available_models: expect.arrayContaining(["Recovery"]),
        write_policy: "read-only",
        source_command: "helix drive model --json",
      });
      expect(driveModelPayload.candidates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            model: "OperationVerification",
            route_id: "drive:OperationVerification:verify-runtime-scope",
            coverage_ids: ["L12-operation-observability"],
            doc_dependencies: ["docs/design/**", "docs/test-design/**"],
            implementation_dependencies: expect.arrayContaining([
              "design_declarations",
              "runtime_verification_events",
              "closure_next_action_ledger",
            ]),
          }),
          expect.objectContaining({
            model: "Add-feature",
            route_id: "drive:Add-feature:add-design-then-impl",
          }),
        ]),
      );
      const driveModelSummaryJson = runCliIn(root, ["drive", "model", "--summary-json"]);
      expect(driveModelSummaryJson.status).toBe(0);
      const driveModelSummary = JSON.parse(driveModelSummaryJson.stdout);
      expect(driveModelSummary).toMatchObject({
        schema_version: "project-drive-model-summary.v1",
        selected_model: "Recovery",
        default_model: "Forward",
        selection_status: "recovery_required",
        blocking_finding_codes: expect.arrayContaining(["l14_claim_with_l7_work"]),
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        selected_candidate: {
          model: "Recovery",
          route_id: "drive:Recovery:recover-current-location",
          command: "helix closure evidence-plan --summary-json",
          coverage_ids: expect.arrayContaining([
            "L12-operation-observability",
            "L5-detailed-contract",
            "L6-implementation-binding",
            "L7-tdd-closure",
          ]),
          doc_dependency_count: expect.any(Number),
        },
        blocked_models: expect.arrayContaining(["Reverse", "Forward"]),
        available_models: expect.arrayContaining(["Recovery"]),
        candidate_count: 12,
        forward_spine_model: "Forward",
        registered_entry_model_count: 10,
        missing_registered_entry_models: [],
        source_command: "helix drive model --summary-json",
        full_source_command: "helix drive model --json",
      });
      expect(driveModelSummary.candidates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            model: "Add-feature",
            route_id: "drive:Add-feature:add-design-then-impl",
            command: "helix artifact-remap batch --status reverify --summary-json",
          }),
        ]),
      );
      expect(driveModelSummary.candidates[0].doc_dependencies).toBeUndefined();
      const driveModelText = runCliIn(root, ["drive", "model"]);
      expect(driveModelText.status).toBe(0);
      expect(driveModelText.stdout).toContain(
        "drive model: selected=Recovery status=recovery_required default=Forward current=L14->L12 write=read-only",
      );
      expect(driveModelText.stdout).toContain(
        "selected-route=drive:Recovery:recover-current-location command=helix closure evidence-plan --summary-json",
      );
      expect(driveModelText.stdout).toMatch(/selected-coverage=.*L12-operation-observability/);
      expect(driveModelText.stdout).toMatch(/selected-coverage=.*L5-detailed-contract/);
      expect(driveModelText.stdout).toMatch(/selected-coverage=.*L6-implementation-binding/);
      expect(driveModelText.stdout).toMatch(/selected-coverage=.*L7-tdd-closure/);
      expect(driveModelText.stdout).toContain("candidate: 1.Recovery selected");

      const recoveryPlanJson = runCliIn(root, ["recovery", "plan", "--limit", "1", "--json"]);
      expect(recoveryPlanJson.status).toBe(0);
      const recoveryPlanPayload = JSON.parse(recoveryPlanJson.stdout);
      expect(recoveryPlanPayload).toMatchObject({
        schema_version: "project-recovery-plan.v1",
        status: "active",
        selected_closure_action: "collect_evidence",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        drive_model: {
          selected_model: "Recovery",
        },
        closure_evidence_plan: {
          schema_version: "project-closure-evidence-plan.v1",
          selected_action: "collect_evidence",
          total: 1,
          listed: 1,
        },
        automation_runway: {
          status: "machine_work_available",
          machine_actionable_count: 1,
          human_approval_count: 0,
          design_reverse_count: 0,
          remaining_after_machine_lanes: 0,
          next_machine_action: "collect_evidence",
          next_machine_command: "helix closure batch --action collect_evidence --json",
          next_machine_probe_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
          phases: [
            expect.objectContaining({
              sequence: 1,
              action: "collect_evidence",
              phase_type: "machine",
              count: 1,
              command: "helix closure batch --action collect_evidence --json",
              evidence_probe_command:
                "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            }),
          ],
        },
        automation_boundaries: expect.arrayContaining([
          expect.objectContaining({
            action: "collect_evidence",
            automation_class: "evidence_required",
            approval_required: true,
            dry_run_command:
              "helix closure evidence-apply --dry-run --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            execute_command:
              "helix closure evidence-apply --execute --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            required_record: "approval_scope_digest",
            evidence_probe_command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            evidence_materialize_command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
            evidence_approval_draft_command:
              "helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json",
            evidence_apply_dry_run_command:
              "helix closure evidence-apply --dry-run --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            evidence_apply_execute_command:
              "helix closure evidence-apply --execute --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            evidence_apply_write_policy: "approval-required",
          }),
        ]),
        reentry_forecast: {
          status: "machine_phase_pending",
          current_blocking_count: 1,
          blocking_after_machine_lanes: 0,
          required_phase_count: 1,
          next_phase_action: "collect_evidence",
          next_phase_type: "machine",
          next_gate: "recompute_drive_model",
          next_command: "helix closure batch --action collect_evidence --json",
          next_execution_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
        },
        write_policy: "read-only",
        source_command: "helix recovery plan --json",
      });
      expect(recoveryPlanPayload.steps.map((step: { step_id: string }) => step.step_id)).toEqual([
        "detect-current-location",
        "plan-closure-evidence",
        "review-or-repair-closure",
        "recompute-drive-model",
        "verify-vmodel-fit",
      ]);
      const recoveryPlanSummaryJson = runCliIn(root, [
        "recovery",
        "plan",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(recoveryPlanSummaryJson.status).toBe(0);
      const recoveryPlanSummary = JSON.parse(recoveryPlanSummaryJson.stdout);
      expect(recoveryPlanSummary).toMatchObject({
        schema_version: "project-recovery-plan-summary.v1",
        status: "active",
        selected_closure_action: "collect_evidence",
        closure_evidence_plan: {
          selected_action: "collect_evidence",
          total: 1,
          listed: 1,
        },
        automation_runway: {
          status: "machine_work_available",
          machine_actionable_count: 1,
          human_approval_count: 0,
          next_machine_command: "helix closure batch --action collect_evidence --summary-json",
        },
        reentry_forecast: {
          status: "machine_phase_pending",
          next_phase_action: "collect_evidence",
          next_command: "helix closure batch --action collect_evidence --summary-json",
          next_execution_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
        },
        source_command: "helix recovery plan --summary-json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
      });
      expect(recoveryPlanSummary.action_lanes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: "collect_evidence",
            count: 1,
            selected: true,
            evidence_materialize_command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
          }),
        ]),
      );
      const recoveryPlanText = runCliIn(root, ["recovery", "plan", "--limit", "1"]);
      expect(recoveryPlanText.status).toBe(0);
      expect(recoveryPlanText.stdout).toContain(
        "recovery plan: status=active selected=Recovery current=L14->L12 closure_action=collect_evidence write=read-only",
      );
      expect(recoveryPlanText.stdout).toContain(
        "automation-runway: status=machine_work_available machine=1 approval=0 reverse=0 after_machine=0 next=helix closure batch --action collect_evidence --json next_probe=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(recoveryPlanText.stdout).toContain(
        "reentry-forecast: status=machine_phase_pending effective=machine_phase_pending blocking=1 after_machine=0 phases=1 next=collect_evidence gate=recompute_drive_model command=helix closure batch --action collect_evidence --json execute=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(recoveryPlanText.stdout).toContain(
        "runway-phase: 1.collect_evidence machine count=1 selected=true human=false remaining=0 next_gate=recompute_drive_model command=helix closure batch --action collect_evidence --json",
      );
      expect(recoveryPlanText.stdout).toContain(
        "evidence-plan: action=collect_evidence total=1 listed=1",
      );
      expect(recoveryPlanText.stdout).toContain(
        "automation: collect_evidence class=evidence_required count=1 mutation=false approval=true",
      );
      expect(recoveryPlanText.stdout).toContain(
        "probe=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json materialize=helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json approval_draft=helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json apply_dry_run=helix closure evidence-apply --dry-run --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json apply_execute=helix closure evidence-apply --execute --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json apply_write=approval-required",
      );
      expect(recoveryPlanText.stdout).toContain("step: 1.detect-current-location ready");

      const roadmapCurrentJson = runCliIn(root, ["roadmap", "current", "--json"]);
      expect(roadmapCurrentJson.status).toBe(0);
      const roadmapCurrentPayload = JSON.parse(roadmapCurrentJson.stdout);
      const roadmapCurrentBlockers = roadmapCurrentPayload.counts.blockers;
      const roadmapCurrentActionCount = roadmapCurrentPayload.actions.length;
      expect(roadmapCurrentPayload).toMatchObject({
        schema_version: "project-roadmap-current.v1",
        status: "contradicted",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        drive_route: {
          routeId: "drive:Recovery:recover-current-location",
        },
        consistency: {
          aligned: false,
          db_current_l12_layer: "L12",
          roadmap_current_l12_layers: expect.arrayContaining(["L6", "L7"]),
          roadmap_projected_l12_layers: expect.arrayContaining(["L6", "L7"]),
          roadmap_terminal_l12_layers: [],
          alignment_basis: "frontier",
          blocking_findings: expect.arrayContaining(["unresolved_design_reference"]),
        },
        counts: expect.objectContaining({
          current_bands: 3,
        }),
        write_policy: "read-only",
        source_command: "helix roadmap current --json",
      });
      expect(roadmapCurrentPayload.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action_id: "drive:Recovery:recover-current-location",
            category: "drive_route",
            status: "blocked",
          }),
          expect.objectContaining({
            action_id: "closure-queue",
            category: "closure",
            status: "blocked",
            automation_class: "machine",
            phase_action: "collect_evidence",
            command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            batch_command: "helix closure batch --action collect_evidence --summary-json",
            review_command: "helix closure review-bundle --action collect_evidence --summary-json",
            evidence_patch_command:
              "helix closure evidence-patch --action collect_evidence --summary-json",
            evidence_probe_command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            evidence_materialize_command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
            evidence_approval_draft_command:
              "helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json",
            evidence_apply_dry_run_command:
              "helix closure evidence-apply --dry-run --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            evidence_apply_execute_command:
              "helix closure evidence-apply --execute --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
            evidence_apply_write_policy: "approval-required",
          }),
        ]),
      );
      expect(roadmapCurrentBlockers).toBeGreaterThanOrEqual(3);
      const roadmapCurrentSummaryJson = runCliIn(root, ["roadmap", "current", "--summary-json"]);
      expect(roadmapCurrentSummaryJson.status).toBe(0);
      const roadmapCurrentSummary = JSON.parse(roadmapCurrentSummaryJson.stdout);
      expect(roadmapCurrentSummary).toMatchObject({
        schema_version: "project-roadmap-current-summary.v1",
        status: "contradicted",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        drive_route: {
          route_id: "drive:Recovery:recover-current-location",
          must_return_to_design: true,
        },
        roadmap_position: {
          status: "uncovered",
          current_band_ids: expect.arrayContaining(["impl"]),
        },
        consistency: {
          aligned: false,
          db_current_l12_layer: "L12",
          alignment_basis: "frontier",
        },
        counts: expect.objectContaining({
          current_bands: 3,
        }),
        write_policy: "read-only",
        source_command: "helix roadmap current --summary-json",
        full_source_command: "helix roadmap current --json",
      });
      expect(roadmapCurrentSummary.action_count).toBe(roadmapCurrentActionCount);
      expect(roadmapCurrentSummary.sample_actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action_id: "closure-queue",
            category: "closure",
            status: "blocked",
            automation_class: "machine",
            phase_action: "collect_evidence",
            batch_command: "helix closure batch --action collect_evidence --summary-json",
            evidence_materialize_command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
            evidence_apply_write_policy: "approval-required",
          }),
        ]),
      );
      const roadmapCurrentText = runCliIn(root, ["roadmap", "current"]);
      expect(roadmapCurrentText.status).toBe(0);
      expect(roadmapCurrentText.stdout).toContain(
        "roadmap current: status=contradicted aligned=false basis=frontier db=L12",
      );
      expect(roadmapCurrentText.stdout).toContain("projected=L1,L2,L3,L4,L5,L6,L7");
      expect(roadmapCurrentText.stdout).toContain(
        "route=drive:Recovery:recover-current-location write=read-only",
      );
      expect(roadmapCurrentText.stdout).toContain(
        "postcheck=helix db rebuild && helix roadmap current --json && helix current-location --json && helix vmodel fit",
      );
      expect(roadmapCurrentText.stdout).toContain(
        "action: closure-queue closure/blocked auto=machine phase=collect_evidence",
      );
      expect(roadmapCurrentText.stdout).toContain(
        "command=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(roadmapCurrentText.stdout).toContain(
        "surfaces=batch:helix closure batch --action collect_evidence --summary-json review:helix closure review-bundle --action collect_evidence --summary-json patch:helix closure evidence-patch --action collect_evidence --summary-json probe:helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json materialize:helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json approval_draft:helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json apply_dry_run:helix closure evidence-apply --dry-run --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json apply_execute:helix closure evidence-apply --execute --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json apply_write:approval-required",
      );

      const remapBatchJson = runCliIn(root, [
        "artifact-remap",
        "batch",
        "--layer",
        "L6",
        "--status",
        "reverify",
        "--json",
      ]);
      expect(remapBatchJson.status).toBe(0);
      const remapBatchPayload = JSON.parse(remapBatchJson.stdout);
      expect(remapBatchPayload).toMatchObject({
        schema_version: "project-artifact-remap-batch.v1",
        selected_layer: "L6",
        selected_status: "reverify",
        total: 1,
        listed: 1,
        counts: {
          reverify: 1,
        },
        recommended_next_action: {
          model: "Reverse",
          command: "helix closure batch --action collect_evidence --json",
        },
        items: [
          expect.objectContaining({
            artifactId: "PLAN-L7-999-new-impl",
            status: "reverify",
            driveModel: "Reverse",
            zipSourceBindingIds: expect.arrayContaining([
              "zip-source:l12-level-definition",
              "zip-source:catalog",
            ]),
            tailoringRuleIds: ["HVM-TAILOR-DETAIL-CONTRACT"],
            tailoringDetailLevels: ["詳細"],
            closureLink: expect.objectContaining({
              nextAction: "collect_evidence",
              evidenceStatus: "partial",
              batchCommand: "helix closure batch --action collect_evidence --json",
            }),
          }),
        ],
      });
      const remapBatchSummaryJson = runCliIn(root, [
        "artifact-remap",
        "batch",
        "--layer",
        "L6",
        "--status",
        "reverify",
        "--summary-json",
      ]);
      expect(remapBatchSummaryJson.status).toBe(0);
      const remapBatchSummary = JSON.parse(remapBatchSummaryJson.stdout);
      expect(remapBatchSummary).toMatchObject({
        schema_version: "project-artifact-remap-batch-summary.v1",
        selected_layer: "L6",
        selected_status: "reverify",
        total: 1,
        listed: 1,
        counts: {
          reverify: 1,
        },
        recommended_next_action: {
          model: "Reverse",
          command: "helix closure batch --action collect_evidence --summary-json",
        },
        source_command: "helix artifact-remap batch --summary-json",
        full_source_command: "helix artifact-remap batch --json",
        sample_items: [
          expect.objectContaining({
            artifact_id: "PLAN-L7-999-new-impl",
            status: "reverify",
            drive_model: "Reverse",
            zip_source_binding_ids: expect.arrayContaining([
              "zip-source:l12-level-definition",
              "zip-source:catalog",
            ]),
            tailoring_rule_ids: ["HVM-TAILOR-DETAIL-CONTRACT"],
            tailoring_detail_levels: ["詳細"],
            closure_link: expect.objectContaining({
              next_action: "collect_evidence",
              evidence_status: "partial",
              batch_command: "helix closure batch --action collect_evidence --summary-json",
            }),
          }),
        ],
      });
      const remapBatchText = runCliIn(root, [
        "artifact-remap",
        "batch",
        "--layer",
        "L6",
        "--status",
        "reverify",
      ]);
      expect(remapBatchText.status).toBe(0);
      expect(remapBatchText.stdout).toContain(
        "artifact-remap batch: layer=L6 status=reverify total=1 listed=1",
      );
      expect(remapBatchText.stdout).toContain("item: PLAN-L7-999-new-impl");
      expect(remapBatchText.stdout).toContain("coverage: L6-implementation-binding");
      expect(remapBatchText.stdout).toContain("zip-source:l12-level-definition");
      expect(remapBatchText.stdout).toContain("zip-source:catalog");
      expect(remapBatchText.stdout).toContain("zip-source:spec-types-reference");
      expect(remapBatchText.stdout).toContain("tailoring=HVM-TAILOR-DETAIL-CONTRACT detail=詳細");
      expect(remapBatchText.stdout).toContain(
        "closure-link: next=collect_evidence evidence=partial command=helix closure batch --action collect_evidence --json",
      );

      const fitJson = runCliIn(root, ["vmodel", "fit", "--json"]);
      expect(fitJson.status).toBe(0);
      const fitPayload = JSON.parse(fitJson.stdout);
      expect(fitPayload).toMatchObject({
        schema_version: "vmodel-fit.v1",
        status: "needs_fit",
        write_policy: "read-only",
        source_command: "helix vmodel fit --json",
        current_location_command: "helix current-location --json",
        view_command: "helix progress tree-view --json",
        design_coverage_gate: {
          status: "needs_design",
        },
        zip_adoption: {
          status: "missing",
          missing: 9,
        },
        zip_manifest: {
          status: "advisory_missing",
          present: false,
          entries_total: 0,
          required_present: 0,
          required_total: 21,
        },
        tailoring_gate: {
          status: "needs_tailoring",
          missing_required: 4,
        },
        synthesis: {
          status: "needs_fit",
          common_adopted: 0,
          helix_complemented: 0,
          rejected: 0,
          missing_decisions: 9,
          tailoring_status: "needs_tailoring",
          function_design_policy: "abolished",
          current_reentry_status: "machine_phase_pending",
          next_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
        },
        next_actions: expect.arrayContaining([
          expect.objectContaining({
            priority: 20,
            blocker_code: "current_location",
            automation_class: "machine",
            count: 1,
            gate: "recompute_drive_model",
            command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            work_bucket: expect.objectContaining({
              evidence_patch_command:
                "helix closure evidence-patch --action collect_evidence --summary-json",
              evidence_patch_write_policy: "approval-required",
              evidence_patch_candidate_count: 3,
              evidence_approval_draft_command:
                "helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json",
            }),
          }),
        ]),
        regression_guards: {
          status: "needs_attention",
          pass: expect.any(Number),
          watch: expect.any(Number),
          fail: expect.any(Number),
          guards: expect.arrayContaining([
            expect.objectContaining({
              guard_id: "design-coverage",
              status: "fail",
              command: "helix current-location --json",
            }),
            expect.objectContaining({
              guard_id: "current-location-reentry",
              status: "watch",
              command:
                "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            }),
          ]),
        },
        operation_scope: {
          observed_gap: expect.any(Number),
          items: expect.arrayContaining([
            expect.objectContaining({
              scope: "kpi_metric",
              status: "observed",
              evidenceTables: expect.arrayContaining(["quality_signals"]),
            }),
            expect.objectContaining({
              scope: "class_method_contract",
              designIds: expect.any(Array),
              observedCount: expect.any(Number),
            }),
          ]),
        },
        current_location_gate: {
          status: "needs_recovery",
          current_status: "needs_recovery",
          completion_boundary: "contradicted",
          recommended_model: "Recovery",
          recovery_runway: {
            status: "machine_work_available",
            machine_actionable_count: 1,
            human_approval_count: 0,
            next_machine_action: "collect_evidence",
          },
          reentry_forecast: {
            status: "machine_phase_pending",
            current_blocking_count: 1,
            blocking_after_machine_lanes: 0,
            required_phase_count: 1,
            next_phase_action: "collect_evidence",
            next_gate: "recompute_drive_model",
            next_execution_command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
          },
        },
        recovery_runway_gate: {
          status: "machine_work_available",
          current_blocking_count: 1,
          machine_actionable_count: 1,
          human_approval_count: 0,
          design_reverse_count: 0,
          remaining_after_machine_lanes: 0,
          required_phase_count: 1,
          next_phase_action: "collect_evidence",
          next_phase_type: "machine",
          next_gate: "recompute_drive_model",
          next_execution_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
          phases: [
            expect.objectContaining({
              sequence: 1,
              action: "collect_evidence",
              phase_type: "machine",
              count: 1,
              listed: 1,
              omitted: 0,
              evidence_signature: "execution:missing",
              sample_plan_ids: ["PLAN-L7-999-new-impl"],
              sample_source_paths: ["docs/plans/PLAN-L7-999-new-impl.md"],
              remaining_after_phase: 0,
              next_gate: "recompute_drive_model",
              evidence_probe_command:
                "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
            }),
          ],
        },
        design_integrity: {
          unresolved_references: 1,
        },
      });
      const fitSummaryJson = runCliIn(root, ["vmodel", "fit", "--summary-json"]);
      expect(fitSummaryJson.status).toBe(0);
      const fitSummaryPayload = JSON.parse(fitSummaryJson.stdout);
      const fitSummaryNextActionCount = fitSummaryPayload.next_action_count;
      const fitSummaryBlockerCount = fitSummaryPayload.blocker_count;
      expect(fitSummaryPayload).toMatchObject({
        schema_version: "vmodel-fit-summary.v1",
        status: "needs_fit",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
          completion_boundary: "contradicted",
        },
        gates: {
          design_coverage: "needs_design",
          zip_adoption: "missing",
          zip_manifest: "advisory_missing",
          tailoring: "needs_tailoring",
          current_location: "needs_recovery",
          recovery_runway: "machine_work_available",
        },
        synthesis: {
          status: "needs_fit",
          missing_decisions: 9,
          function_design_policy: "abolished",
          current_reentry_status: "machine_phase_pending",
          effective_reentry_status: "machine_phase_pending",
          next_command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
        },
        current_location_gate: {
          status: "needs_recovery",
          current_status: "needs_recovery",
          completion_boundary: "contradicted",
          recommended_model: "Recovery",
          recovery_runway: {
            status: "machine_work_available",
            machine_actionable_count: 1,
            human_approval_count: 0,
            next_machine_action: "collect_evidence",
          },
        },
        current_location_frontier: expect.objectContaining({
          schema_version: "current-location-frontier-summary.v1",
          frontier_type: "recovery_frontier",
          classification: "l14_claim_with_l7_work",
          selected_model: "Recovery",
          commands: expect.objectContaining({
            current_location: "helix current-location --summary-json",
            project_frontier: "helix progress frontier --summary-json",
          }),
        }),
        recovery_runway_gate: {
          status: "machine_work_available",
          current_blocking_count: 1,
          machine_actionable_count: 1,
          human_approval_count: 0,
          next_phase_action: "collect_evidence",
          next_phase_type: "machine",
          phases: [
            expect.objectContaining({
              sequence: 1,
              action: "collect_evidence",
              phase_type: "machine",
              sample_plan_ids: ["PLAN-L7-999-new-impl"],
            }),
          ],
        },
        regression_guards: {
          status: "needs_attention",
          attention_guards: expect.arrayContaining([
            expect.objectContaining({
              guard_id: "current-location-reentry",
              status: "watch",
            }),
          ]),
          sample_guards: expect.arrayContaining([
            expect.objectContaining({
              status: expect.stringMatching(/fail|watch/),
            }),
          ]),
        },
        operation_scope: {
          observed_gap: expect.any(Number),
          source_command: "helix vmodel fit --summary-json",
          items: expect.arrayContaining([
            expect.objectContaining({
              scope: "kpi_metric",
              status: "observed",
              observation_gap: false,
              evidence_tables: expect.arrayContaining(["quality_signals"]),
            }),
            expect.objectContaining({
              scope: "class_method_contract",
              design_count: expect.any(Number),
              observed_count: expect.any(Number),
            }),
          ]),
        },
        scrum_operation: {
          status: expect.any(String),
          source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
          source_binding_count: expect.any(Number),
          observed_count: expect.any(Number),
          missing_count: expect.any(Number),
          source_command: "helix current-location --summary-json",
        },
        skill_binding: {
          status: expect.any(String),
          selected_model: "Recovery",
          source_command: "helix skill suggest --current-location --summary-json",
          full_source_command: "helix skill suggest --current-location --json",
          full_inject_command: "helix skill suggest --current-location --inject --json",
          top_items: expect.any(Array),
        },
        next_action_count: expect.any(Number),
        blocker_count: expect.any(Number),
        source_command: "helix vmodel fit --summary-json",
        current_location_command: "helix current-location --summary-json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
      });
      expect(fitSummaryNextActionCount).toBeGreaterThanOrEqual(1);
      expect(fitSummaryBlockerCount).toBeGreaterThanOrEqual(1);
      expect(fitSummaryPayload.sample_next_actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            blocker_code: "current_location",
            automation_class: "machine",
            command:
              "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
          }),
        ]),
      );
      expect(fitSummaryPayload.blockers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "current_location",
            command: "helix recovery plan --summary-json",
          }),
        ]),
      );
      expect(fitSummaryPayload.zip_manifest.required).toBeUndefined();
      expect(fitSummaryPayload.next_actions).toBeUndefined();
      const fitText = runCliIn(root, ["vmodel", "fit"]);
      expect(fitText.status).toBe(0);
      expect(fitText.stdout).toContain("vmodel fit: status=needs_fit");
      expect(fitText.stdout).toContain("current=needs_recovery");
      expect(fitText.stdout).toContain(
        "synthesis: status=needs_fit common=0 complement=0 reject=0 missing=9 tailoring=needs_tailoring function_policy=abolished reentry=machine_phase_pending effective=machine_phase_pending next=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(fitText.stdout).toContain("regression-guards: status=needs_attention");
      expect(fitText.stdout).toContain("operation-scope: designed=");
      expect(fitText.stdout).toContain("observed_gap=");
      expect(fitText.stdout).toContain(
        "recovery-runway-gate: status=machine_work_available blocking=1 machine=1 approval=0 reverse=0 after_machine=0 phases=1 next=collect_evidence phase=machine gate=recompute_drive_model command=helix closure batch --action collect_evidence --json execute=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(fitText.stdout).toContain(
        "recovery-runway-phases: 1:collect_evidence:machine:count=1:listed=1:remaining=0:gate=recompute_drive_model:signature=execution:missing:plans=PLAN-L7-999-new-impl",
      );
      expect(fitText.stdout).toContain("regression-guard: design-coverage fail count=");
      expect(fitText.stdout).toContain(
        "regression-guard: current-location-reentry watch count=1 command=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(fitText.stdout).toContain(
        "next-action: 20.current_location machine count=1 gate=recompute_drive_model command=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );
      expect(fitText.stdout).toContain("next-work-bucket: 20.current_location");
      expect(fitText.stdout).toContain(
        "command=helix closure batch --action collect_evidence --json",
      );
      expect(fitText.stdout).toContain(
        "patch=helix closure evidence-patch --action collect_evidence --summary-json patch_candidates=3 patch_write=approval-required",
      );
      expect(fitText.stdout).toContain(
        "approval_draft=helix closure evidence-approval-draft --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --out .helix/tmp/closure/collect_evidence-approval-draft.yml --summary-json",
      );
      expect(fitText.stdout).toContain(
        "handoff=generate_probe handoff_command=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json handoff_present=0 handoff_missing=2 handoff_unchecked=0",
      );
      mkdirSync(join(root, ".helix", "tmp", "closure"), { recursive: true });
      writeFileSync(
        join(root, ".helix", "tmp", "closure", "collect_evidence-probe-record.json"),
        "{}\n",
        "utf8",
      );
      writeFileSync(
        join(root, ".helix", "tmp", "closure", "collect_evidence-approval-draft.yml"),
        [
          "decision_id: closure-evidence-materialize:collect_evidence",
          "outcome: pending_human_review",
          "approval_scope_digest: sha256:test",
          "reviewed_candidate_count: 3",
          "reason: <日本語で判断理由>",
          "",
        ].join("\n"),
        "utf8",
      );
      const fitWithArtifactsJson = runCliIn(root, ["vmodel", "fit", "--json"]);
      expect(fitWithArtifactsJson.status).toBe(0);
      const fitWithArtifactsPayload = JSON.parse(fitWithArtifactsJson.stdout);
      const currentLocationAction = fitWithArtifactsPayload.next_actions.find(
        (action: { blocker_code: string }) => action.blocker_code === "current_location",
      );
      expect(fitWithArtifactsPayload.synthesis.next_command).toBe(
        "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
      );
      expect(currentLocationAction).toMatchObject({
        automation_class: "approval",
        command:
          "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
        work_bucket: {
          evidence_handoff_status: {
            present: 2,
            missing: 0,
            unchecked: 0,
            approval_record: {
              status: "pending_human_review",
              scope_status: "not_checked",
              materialize_status: null,
              valid_for_apply: false,
            },
          },
          evidence_handoff_next: {
            status: "approval_pending",
            command:
              "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
          },
        },
      });
      const currentLocationSummaryWithHandoff = runCliIn(root, [
        "current-location",
        "--summary-json",
      ]);
      expect(currentLocationSummaryWithHandoff.status).toBe(0);
      const currentLocationSummaryPayload = JSON.parse(currentLocationSummaryWithHandoff.stdout);
      expect(currentLocationSummaryPayload.recovery).toMatchObject({
        reentry_status: "machine_phase_pending",
        effective_reentry_status: "approval_pending",
        local_handoff: {
          status: "approval_pending",
          effective_phase: "approval",
          approval_status: "pending_human_review",
          approval_record_path: ".helix/tmp/closure/collect_evidence-approval-draft.yml",
          valid_for_apply: false,
          command:
            "helix closure evidence-materialize --action collect_evidence --limit 1 --probe-record .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
        },
      });
      const recoveryPlanSummaryWithHandoff = runCliIn(root, [
        "recovery",
        "plan",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(recoveryPlanSummaryWithHandoff.status).toBe(0);
      const recoveryPlanSummaryPayload = JSON.parse(recoveryPlanSummaryWithHandoff.stdout);
      expect(recoveryPlanSummaryPayload).toMatchObject({
        reentry_forecast: {
          status: "machine_phase_pending",
          effective_status: "approval_pending",
        },
        recovery_handoff_gate: {
          status: "approval_pending",
          effective_phase: "approval",
          approval_status: "pending_human_review",
          approval_record_path: ".helix/tmp/closure/collect_evidence-approval-draft.yml",
          valid_for_apply: false,
        },
      });
      const fitSummaryWithHandoff = runCliIn(root, ["vmodel", "fit", "--summary-json"]);
      expect(fitSummaryWithHandoff.status).toBe(0);
      expect(JSON.parse(fitSummaryWithHandoff.stdout)).toMatchObject({
        synthesis: {
          current_reentry_status: "machine_phase_pending",
          effective_reentry_status: "approval_pending",
        },
        current_location_gate: {
          reentry_forecast: {
            status: "machine_phase_pending",
            effective_status: "approval_pending",
          },
        },
        recovery_handoff_gate: {
          status: "approval_pending",
          effective_phase: "approval",
        },
      });
      const currentLocationTextWithHandoff = runCliIn(root, ["current-location"]);
      expect(currentLocationTextWithHandoff.status).toBe(0);
      expect(currentLocationTextWithHandoff.stdout).toContain(
        "recovery-reentry: status=machine_phase_pending effective=approval_pending",
      );
      const recoveryPlanTextWithHandoff = runCliIn(root, ["recovery", "plan", "--limit", "1"]);
      expect(recoveryPlanTextWithHandoff.status).toBe(0);
      expect(recoveryPlanTextWithHandoff.stdout).toContain(
        "reentry-forecast: status=machine_phase_pending effective=approval_pending",
      );
      const fitTextWithHandoff = runCliIn(root, ["vmodel", "fit"]);
      expect(fitTextWithHandoff.status).toBe(0);
      expect(fitTextWithHandoff.stdout).toContain(
        "synthesis: status=needs_fit common=0 complement=0 reject=0 missing=9 tailoring=needs_tailoring function_policy=abolished reentry=machine_phase_pending effective=approval_pending",
      );
      expect(fitTextWithHandoff.stdout).toContain(
        "recovery-reentry: status=machine_phase_pending effective=approval_pending",
      );
      expect(fitText.stdout).toContain("zip-adoption: adopt=0 complement=0 reject=0 missing=9");
      expect(fitText.stdout).toContain(
        "zip-manifest: present=false root=- entries=0 required=0/21",
      );
      expect(fitText.stdout).toContain(
        "tailoring-gate: profile=solo required=0 optional=0 na=2 missing=4",
      );
      expect(fitText.stdout).toContain("function-design-absorption: status=");
      expect(fitText.stdout).toContain("roadmap-current-gate: status=");
      expect(fitText.stdout).toContain("drive-model-gate: status=");
      expect(fitText.stdout).toContain("operation-scope: designed=");
      expect(fitText.stdout).toContain(
        "current-location-gate: status=needs_recovery current=needs_recovery/contradicted",
      );
      expect(fitText.stdout).toContain(
        "recovery-reentry: status=machine_phase_pending effective=machine_phase_pending blocking=1 after_machine=0 phases=1 next=collect_evidence gate=recompute_drive_model command=helix closure batch --action collect_evidence --json execute=helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
      );

      const overviewJson = runCliIn(root, ["closure", "overview", "--limit", "1", "--json"]);
      expect(overviewJson.status).toBe(0);
      const overviewPayload = JSON.parse(overviewJson.stdout);
      expect(overviewPayload).toMatchObject({
        schema_version: "project-closure-overview.v1",
        closure: {
          status: "contradicted",
          open_l7: 1,
          l14_claims: 1,
          queue_total: 1,
          route_counts: {
            close_ready: 0,
            collect_evidence: 1,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
          ledger_status_counts: {
            ready: 0,
            needs_evidence: 1,
            needs_repair: 0,
            needs_reverse: 0,
          },
        },
        recommended_next_action: {
          action: "collect_evidence",
          command: "helix closure review-bundle --action collect_evidence --summary-json",
          human_required: false,
        },
        write_policy: "read-only",
        source_command: "helix closure overview --summary-json",
      });
      expect(overviewPayload.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: "collect_evidence",
            count: 1,
            listed: 1,
            omitted: 0,
            batch_id: "closure-batch:2:collect_evidence",
            ledger_status: "needs_evidence",
            sample_plan_ids: ["PLAN-L7-999-new-impl"],
          }),
        ]),
      );

      const overviewSummary = runCliIn(root, [
        "closure",
        "overview",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(overviewSummary.status).toBe(0);
      const overviewSummaryPayload = JSON.parse(overviewSummary.stdout);
      expect(overviewSummaryPayload).toMatchObject({
        schema_version: "project-closure-overview-summary.v1",
        closure: {
          status: "contradicted",
          queue_total: 1,
          route_counts: {
            close_ready: 0,
            collect_evidence: 1,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
          apply_readiness: expect.objectContaining({
            status: "no_close_ready_candidates",
          }),
        },
        recommended_next_action: {
          action: "collect_evidence",
          command: "helix closure review-bundle --action collect_evidence --summary-json",
          human_required: false,
        },
        action_count: 4,
        write_policy: "read-only",
        source_command: "helix closure overview --summary-json",
      });
      expect(overviewSummaryPayload).not.toHaveProperty("work_buckets");

      const overviewText = runCliIn(root, ["closure", "overview", "--limit", "1"]);
      expect(overviewText.status).toBe(0);
      expect(overviewText.stdout).toContain(
        "closure overview: status=contradicted current=L14->L12 queue=1 close_ready=0 collect=1 repair=0 reverse=0 write=read-only",
      );
      expect(overviewText.stdout).toContain(
        "recommended=collect_evidence human_required=false command=helix closure review-bundle --action collect_evidence --summary-json",
      );

      const batchJson = runCliIn(root, [
        "closure",
        "batch",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--json",
      ]);
      expect(batchJson.status).toBe(0);
      const batchPayload = JSON.parse(batchJson.stdout);
      expect(batchPayload).toMatchObject({
        schema_version: "project-closure-batch.v1",
        selected_action: "collect_evidence",
        total: 1,
        listed: 1,
        omitted: 0,
        write_policy: "read-only",
        packet: {
          packetId: "closure:collect_evidence",
          automation: {
            batchId: "closure-batch:2:collect_evidence",
            reviewCommand: "helix closure batch --action collect_evidence --json",
          },
        },
        ledger: {
          ledgerId: "next-action:closure:collect_evidence",
          status: "needs_evidence",
        },
        work_buckets: [
          expect.objectContaining({
            action: "collect_evidence",
            evidence_signature: "execution:missing",
            count: 1,
            primary_command: "helix closure batch --action collect_evidence --json",
            repair_plan: expect.objectContaining({
              projection_items: [
                expect.objectContaining({
                  plan_id: "PLAN-L7-999-new-impl",
                  failed_evidence_count: 0,
                  projection_templates: expect.arrayContaining([
                    expect.objectContaining({ table: "test_runs" }),
                    expect.objectContaining({ table: "gate_runs" }),
                    expect.objectContaining({
                      table: "runtime_verification_events",
                    }),
                  ]),
                }),
              ],
              projection_templates: expect.arrayContaining([
                expect.objectContaining({ table: "test_runs" }),
                expect.objectContaining({ table: "gate_runs" }),
                expect.objectContaining({
                  table: "runtime_verification_events",
                }),
              ]),
            }),
          }),
        ],
        queue_items: [
          expect.objectContaining({
            planId: "PLAN-L7-999-new-impl",
            nextAction: "collect_evidence",
          }),
        ],
      });

      const batchText = runCliIn(root, [
        "closure",
        "batch",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(batchText.status).toBe(0);
      expect(batchText.stdout).toContain(
        "closure batch: action=collect_evidence batch=closure-batch:2:collect_evidence status=needs_evidence count=1 listed=1 omitted=0 drive=Reverse write=read-only",
      );
      expect(batchText.stdout).toContain("filter=closure.queue.items[nextAction=collect_evidence]");
      expect(batchText.stdout).toContain(
        "work-bucket: 1.execution:missing count=1 listed=1 omitted=0",
      );
      expect(batchText.stdout).toContain(
        "repair-plan=needs_evidence failed=0 latest=- green=test_runs,gate_runs,runtime_verification_events",
      );
      expect(batchText.stdout).toContain(
        "repair-automation=ready_to_execute runnable=1 label_only=0 resolution=1 safe_resolution=1 projections=1 next=bun run test:fast blockers=-",
      );
      expect(batchText.stdout).toContain(
        "repair-command: package script: test:fast verb=test:fast count=1 runnable=bun run test:fast",
      );
      expect(batchText.stdout).toContain(
        "repair-resolution: bun run test:fast source=package_script confidence=medium safe=true project=test_runs,gate_runs,runtime_verification_events",
      );
      expect(batchText.stdout).toContain(
        "evidence-probe=helix closure evidence-probe --action collect_evidence --json",
      );
      expect(batchText.stdout).toContain("repair-template: test_runs status=passed");
      expect(batchText.stdout).toContain("repair-template: gate_runs status=passed");
      expect(batchText.stdout).toContain(
        "repair-template: runtime_verification_events status=accepted",
      );
      expect(batchText.stdout).toContain(
        "projection-item: PLAN-L7-999-new-impl failed=0 latest=- tables=test_runs,gate_runs,runtime_verification_events",
      );
      expect(batchText.stdout).toContain(
        "evidence-artifact: plan_review_evidence path=docs/plans/PLAN-L7-999-new-impl.md format=yaml_frontmatter projects=review_evidence_registry,test_runs write=template_only",
      );
      expect(batchText.stdout).toContain(
        "evidence-artifact: structured_test_evidence path=docs/evidence/PLAN-L7-999-new-impl-test.json format=json projects=test_cases,test_results,test_artifact_edges write=template_only",
      );
      expect(batchText.stdout).toContain(
        "evidence-patch-plan: approval=true write=approval-required candidates=3 dry_run=helix closure batch --action collect_evidence --json execute=-",
      );
      expect(batchText.stdout).toContain(
        "evidence-patch: append_yaml_frontmatter path=docs/plans/PLAN-L7-999-new-impl.md digest=sha256:",
      );
      expect(batchText.stdout).toContain(
        "placeholders=<green command>,<iso8601>,<output>,<reviewer>",
      );
      expect(batchText.stdout).toContain("item: PLAN-L7-999-new-impl evidence=partial");
      expect(batchText.stdout).toContain("evidence-action=不足 evidence を収集する:");
      expect(batchText.stdout).toContain("gaps=execution:missing");

      const evidencePlanJson = runCliIn(root, [
        "closure",
        "evidence-plan",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--json",
      ]);
      expect(evidencePlanJson.status).toBe(0);
      const evidencePlanPayload = JSON.parse(evidencePlanJson.stdout);
      expect(evidencePlanPayload).toMatchObject({
        schema_version: "project-closure-evidence-plan.v1",
        selected_action: "collect_evidence",
        total: 1,
        listed: 1,
        omitted: 0,
        target_tables: expect.arrayContaining([
          "test_runs",
          "gate_runs",
          "runtime_verification_events",
        ]),
        write_policy: "read-only",
        source_command: "helix closure evidence-plan --json",
        expected_transition:
          "evidence 追加後に close_ready または repair_failed_evidence へ再分類される",
        evidence_gap_counts: [
          {
            component: "execution",
            status: "missing",
            count: 1,
            evidence_tables: ["test_runs", "gate_runs", "runtime_verification_events"],
          },
        ],
        items: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            next_action: "collect_evidence",
            evidence_status: "partial",
            target_tables: expect.arrayContaining([
              "test_runs",
              "gate_runs",
              "runtime_verification_events",
            ]),
          }),
        ],
      });

      const evidencePlanSummary = runCliIn(root, [
        "closure",
        "evidence-plan",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(evidencePlanSummary.status).toBe(0);
      const evidencePlanSummaryPayload = JSON.parse(evidencePlanSummary.stdout);
      expect(evidencePlanSummaryPayload).toMatchObject({
        schema_version: "project-closure-evidence-plan-summary.v1",
        selected_action: "collect_evidence",
        total: 1,
        listed: 1,
        omitted: 0,
        item_count: 1,
        target_tables: expect.arrayContaining([
          "test_runs",
          "gate_runs",
          "runtime_verification_events",
        ]),
        sample_items: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            next_action: "collect_evidence",
            evidence_status: "partial",
            template_tables: expect.arrayContaining([
              "test_runs",
              "gate_runs",
              "runtime_verification_events",
            ]),
          }),
        ],
        source_command: "helix closure evidence-plan --summary-json",
        write_policy: "read-only",
      });
      expect(evidencePlanSummaryPayload).not.toHaveProperty("items");

      const evidencePlanText = runCliIn(root, [
        "closure",
        "evidence-plan",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(evidencePlanText.status).toBe(0);
      expect(evidencePlanText.stdout).toContain(
        "closure evidence-plan: action=collect_evidence total=1 listed=1 omitted=0",
      );
      expect(evidencePlanText.stdout).toContain("tables=");
      expect(evidencePlanText.stdout).toContain("test_runs");
      expect(evidencePlanText.stdout).toContain("gate_runs");
      expect(evidencePlanText.stdout).toContain("runtime_verification_events");
      expect(evidencePlanText.stdout).toContain("gaps=execution:missing=1");
      expect(evidencePlanText.stdout).toContain(
        "templates=gate_runs:passed,runtime_verification_events:accepted,test_runs:passed",
      );
      expect(evidencePlanText.stdout).toContain(
        "postcheck=helix db rebuild && helix closure batch --action collect_evidence --json && helix current-location --json && helix vmodel fit",
      );

      const evidencePatchJson = runCliIn(root, [
        "closure",
        "evidence-patch",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--json",
      ]);
      expect(evidencePatchJson.status).toBe(0);
      const evidencePatchPayload = JSON.parse(evidencePatchJson.stdout);
      expect(evidencePatchPayload).toMatchObject({
        schema_version: "project-closure-evidence-patch-packet.v1",
        selected_action: "collect_evidence",
        queue_total: 1,
        queue_listed: 1,
        queue_omitted: 0,
        patch_candidate_count: 3,
        write_policy: "read-only",
        apply_readiness: {
          status: "blocked_placeholders",
          allowed_to_apply: false,
          execute_command: null,
        },
        approval: {
          required: true,
          decision_id: "closure-evidence-patch:collect_evidence",
          approval_scope_digest: expect.stringMatching(/^sha256:/),
        },
        safety_policy: {
          packet_write_policy: "read-only",
          patch_write_policy: "approval-required",
          execute_command: null,
        },
        patch_candidates: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            artifact_path: "docs/plans/PLAN-L7-999-new-impl.md",
            operation: "append_yaml_frontmatter",
            preview_digest: expect.stringMatching(/^sha256:/),
            placeholder_count: expect.any(Number),
            unresolved_placeholders: expect.arrayContaining(["<green command>"]),
            real_evidence_required: true,
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-new-impl-test.json",
            operation: "create_json_artifact",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-new-impl-runtime.json",
            operation: "create_json_artifact",
          }),
        ],
      });
      expect(evidencePatchPayload.apply_readiness.placeholder_count).toBeGreaterThan(0);
      expect(evidencePatchPayload.apply_readiness.blocked_candidate_count).toBeGreaterThan(0);

      const evidencePatchText = runCliIn(root, [
        "closure",
        "evidence-patch",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(evidencePatchText.status).toBe(0);
      expect(evidencePatchText.stdout).toContain(
        "closure evidence-patch: action=collect_evidence queue=1 listed=1 omitted=0 candidates=3 approval=true decision=closure-evidence-patch:collect_evidence write=read-only",
      );
      expect(evidencePatchText.stdout).toContain("approval-scope=sha256:");
      expect(evidencePatchText.stdout).toContain(
        "apply-readiness=blocked_placeholders allowed=false",
      );
      expect(evidencePatchText.stdout).toContain(
        "candidate: PLAN-L7-999-new-impl append_yaml_frontmatter path=docs/plans/PLAN-L7-999-new-impl.md digest=sha256:",
      );
      expect(evidencePatchText.stdout).toContain(
        "placeholders=<green command>,<iso8601>,<output>,<reviewer>",
      );
      expect(evidencePatchText.stdout).toContain("rollback=承認適用後に戻す場合は");
      expect(evidencePatchText.stdout).toContain(
        "postcheck=helix db rebuild && helix closure batch --action collect_evidence --json && helix current-location --json && helix vmodel fit",
      );

      const evidenceProbeJson = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--json",
      ]);
      expect(evidenceProbeJson.status).toBe(0);
      const evidenceProbePayload = JSON.parse(evidenceProbeJson.stdout);
      expect(evidenceProbePayload).toMatchObject({
        schema_version: "project-closure-evidence-probe.v1",
        selected_action: "collect_evidence",
        dry_run: true,
        can_execute: true,
        command: "bun run test:fast",
        target_plan_ids: ["PLAN-L7-999-new-impl"],
        apply_readiness: {
          status: "dry_run",
          allowed_to_materialize: false,
        },
        placeholder_resolution: {
          fillable_placeholders: [],
          remaining_placeholders: ["<green command>", "<iso8601>", "<output>"],
        },
        write_policy: "read-only",
      });

      const evidenceProbeSummaryJson = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(evidenceProbeSummaryJson.status).toBe(0);
      expect(JSON.parse(evidenceProbeSummaryJson.stdout)).toMatchObject({
        schema_version: "project-closure-evidence-probe-summary.v1",
        selected_action: "collect_evidence",
        dry_run: true,
        can_execute: true,
        command: "bun run test:fast",
        target_plan_ids: ["PLAN-L7-999-new-impl"],
        execution: null,
        probe_record_output: {
          requested: false,
          path: null,
          written: false,
          sha256: null,
        },
        placeholder_resolution: {
          fillable_count: 0,
          remaining_count: 3,
          remaining_placeholders: ["<green command>", "<iso8601>", "<output>"],
        },
        apply_readiness: {
          status: "dry_run",
          allowed_to_materialize: false,
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-probe --summary-json",
        full_source_command: "helix closure evidence-probe --json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
      });

      const evidenceProbeText = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(evidenceProbeText.status).toBe(0);
      expect(evidenceProbeText.stdout).toContain(
        "closure evidence-probe: action=collect_evidence dry_run=true can_execute=true command=bun run test:fast status=dry_run write=read-only",
      );
      expect(evidenceProbeText.stdout).toContain(
        "placeholders: fillable=- remaining=<green command>,<iso8601>,<output>",
      );

      const materializeNoProbe = runCliIn(root, [
        "closure",
        "evidence-materialize",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(materializeNoProbe.status).toBe(0);
      expect(materializeNoProbe.stdout).toContain(
        "closure evidence-materialize: action=collect_evidence status=no_probe_execution candidates=0 remaining=0 blocked=0 write=read-only",
      );

      const probeRecordPath = join(root, "probe-record.json");
      writeFileSync(
        probeRecordPath,
        JSON.stringify(
          {
            execution: {
              command: "bun run test:fast",
              started_at: "2026-07-08T00:03:00.000Z",
              completed_at: "2026-07-08T00:03:10.000Z",
              exit_code: 0,
              status: "passed",
              output_digest:
                "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              stdout_bytes: 10,
              stderr_bytes: 0,
              output_excerpt: {
                stdout_head: "passed output",
                stdout_tail: "passed output",
                stderr_head: "",
                stderr_tail: "",
                truncated: false,
                limit: 4000,
              },
              error_message: null,
            },
          },
          null,
          2,
        ),
        "utf8",
      );
      const materializeJson = runCliIn(root, [
        "closure",
        "evidence-materialize",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordPath,
        "--json",
      ]);
      expect(materializeJson.status).toBe(0);
      const materializePayload = JSON.parse(materializeJson.stdout);
      expect(materializePayload).toMatchObject({
        schema_version: "project-closure-evidence-materialize.v1",
        selected_action: "collect_evidence",
        materialized_candidate_count: 3,
        materialize_readiness: {
          status: "blocked_placeholders",
          allowed_to_apply: false,
          remaining_placeholder_count: 2,
          blocked_candidate_count: 1,
        },
      });
      expect(materializePayload.materialized_candidates[0]).toMatchObject({
        plan_id: "PLAN-L7-999-new-impl",
        artifact_path: "docs/plans/PLAN-L7-999-new-impl.md",
        filled_placeholders: ["<green command>", "<iso8601>", "<output>", "<reviewer>"],
        remaining_placeholders: [],
        ready_for_approval: true,
      });
      expect(
        materializePayload.materialized_candidates[0].placeholder_resolution_sources,
      ).toContainEqual({
        placeholder: "<reviewer>",
        source: "deterministic_closure_rule",
        value_digest: expect.stringMatching(/^sha256:/),
      });
      expect(materializePayload.materialized_candidates[2]).toMatchObject({
        remaining_placeholders: expect.arrayContaining(["<session_id>", "<correlation_id>"]),
        ready_for_approval: false,
      });
      expect(
        materializePayload.materialized_candidates[0].materialized_preview_lines.join("\n"),
      ).toContain("bun run test:fast");
      expect(
        materializePayload.materialized_candidates[0].materialized_preview_lines.join("\n"),
      ).toContain("sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

      const probeRecordWithProvenancePath = join(root, "probe-record-with-provenance.json");
      writeFileSync(
        probeRecordWithProvenancePath,
        JSON.stringify(
          {
            execution: {
              command: "bun run test:fast",
              session_id: "closure-probe:session1234",
              correlation_id: "closure-correlation:corr1234",
              started_at: "2026-07-08T00:03:00.000Z",
              completed_at: "2026-07-08T00:03:10.000Z",
              exit_code: 0,
              status: "passed",
              output_digest:
                "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              stdout_bytes: 10,
              stderr_bytes: 0,
              output_excerpt: {
                stdout_head: "passed output",
                stdout_tail: "passed output",
                stderr_head: "",
                stderr_tail: "",
                truncated: false,
                limit: 4000,
              },
              error_message: null,
            },
          },
          null,
          2,
        ),
        "utf8",
      );
      const materializeReadyJson = runCliIn(root, [
        "closure",
        "evidence-materialize",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--json",
      ]);
      expect(materializeReadyJson.status).toBe(0);
      const materializeReadyPayload = JSON.parse(materializeReadyJson.stdout);
      expect(materializeReadyPayload).toMatchObject({
        probe_execution: {
          output_excerpt: {
            stdout_head: "passed output",
            stdout_tail: "passed output",
            stderr_head: "",
            stderr_tail: "",
            truncated: false,
            limit: 4000,
          },
        },
        materialize_readiness: {
          status: "ready_for_approval",
          allowed_to_apply: false,
          remaining_placeholder_count: 0,
          blocked_candidate_count: 0,
        },
      });
      expect(materializeReadyPayload.materialized_candidates[2]).toMatchObject({
        filled_placeholders: expect.arrayContaining(["<session_id>", "<correlation_id>"]),
        remaining_placeholders: [],
        ready_for_approval: true,
      });
      const materializeSummaryJson = runCliIn(root, [
        "closure",
        "evidence-materialize",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--summary-json",
      ]);
      expect(materializeSummaryJson.status).toBe(0);
      const materializeSummaryPayload = JSON.parse(materializeSummaryJson.stdout);
      expect(materializeSummaryPayload).toMatchObject({
        schema_version: "project-closure-evidence-materialize-summary.v1",
        selected_action: "collect_evidence",
        queue_total: 1,
        queue_listed: 1,
        materialized_candidate_count: 3,
        materialize_readiness: {
          status: "ready_for_approval",
          remaining_placeholder_count: 0,
          blocked_candidate_count: 0,
        },
        approval: {
          approval_scope_digest: materializeReadyPayload.approval.approval_scope_digest,
        },
        probe_execution: {
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          session_id: "closure-probe:session1234",
          correlation_id: "closure-correlation:corr1234",
        },
      });
      expect(materializeSummaryPayload.materialized_candidates).toBeUndefined();
      expect(materializeSummaryPayload.sample_candidates).toHaveLength(3);
      expect(materializeSummaryPayload.sample_candidates[0]).toMatchObject({
        plan_id: "PLAN-L7-999-new-impl",
        operation: "append_yaml_frontmatter",
        ready_for_approval: true,
      });
      const approvalDraftJson = runCliIn(root, [
        "closure",
        "evidence-approval-draft",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--json",
      ]);
      expect(approvalDraftJson.status).toBe(0);
      const approvalDraftPayload = JSON.parse(approvalDraftJson.stdout);
      expect(approvalDraftPayload).toMatchObject({
        schema_version: "project-closure-evidence-approval-draft.v1",
        selected_action: "collect_evidence",
        plan_only: true,
        must_not_apply: true,
        approval_allowed: false,
        apply_authorized: false,
        materialize_readiness: {
          status: "ready_for_approval",
        },
        materialized_candidate_count: 3,
        approval: {
          decision_id: "closure-evidence-materialize:collect_evidence",
          approval_scope_digest: materializeReadyPayload.approval.approval_scope_digest,
          draft_outcome: "pending_human_review",
          non_authorizing: true,
        },
        approval_record_template: expect.arrayContaining([
          "outcome: pending_human_review",
          `approval_scope_digest: ${materializeReadyPayload.approval.approval_scope_digest}`,
        ]),
        write_policy: "read-only",
      });
      expect(approvalDraftPayload.approval_record_text).toContain("outcome: pending_human_review");
      const approvalDraftSummaryJson = runCliIn(root, [
        "closure",
        "evidence-approval-draft",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--summary-json",
      ]);
      expect(approvalDraftSummaryJson.status).toBe(0);
      const approvalDraftSummaryPayload = JSON.parse(approvalDraftSummaryJson.stdout);
      expect(approvalDraftSummaryPayload).toMatchObject({
        schema_version: "project-closure-evidence-approval-draft-summary.v1",
        selected_action: "collect_evidence",
        materialized_candidate_count: 3,
        candidate_digest_count: 3,
        approval: {
          approval_scope_digest: materializeReadyPayload.approval.approval_scope_digest,
          draft_outcome: "pending_human_review",
          non_authorizing: true,
        },
        approval_record_output: {
          requested: false,
          written: false,
          non_authorizing: true,
        },
      });
      expect(approvalDraftSummaryPayload.candidate_digests).toBeUndefined();
      expect(approvalDraftSummaryPayload.approval_record_text).toBeUndefined();
      expect(approvalDraftSummaryPayload.sample_candidate_digests).toHaveLength(3);
      const approvalDraftPath = join(root, "tmp", "closure-approval-draft.yml");
      const approvalDraftOutJson = runCliIn(root, [
        "closure",
        "evidence-approval-draft",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--out",
        approvalDraftPath,
        "--json",
      ]);
      expect(approvalDraftOutJson.status).toBe(0);
      const approvalDraftOutPayload = JSON.parse(approvalDraftOutJson.stdout);
      expect(approvalDraftOutPayload.approval_record_output).toMatchObject({
        requested: true,
        path: approvalDraftPath,
        written: true,
        non_authorizing: true,
      });
      const approvalDraftRecord = readFileSync(approvalDraftPath, "utf8");
      expect(approvalDraftRecord).toContain("outcome: pending_human_review");
      expect(approvalDraftRecord).not.toContain("outcome: approve_materialized_evidence");
      const evidenceApplyBlocked = runCliIn(root, [
        "closure",
        "evidence-apply",
        "--dry-run",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--json",
      ]);
      expect(evidenceApplyBlocked.status).toBe(0);
      const evidenceApplyBlockedPayload = JSON.parse(evidenceApplyBlocked.stdout);
      expect(evidenceApplyBlockedPayload).toMatchObject({
        schema_version: "project-closure-evidence-apply-plan.v1",
        selected_action: "collect_evidence",
        materialize_readiness: {
          status: "ready_for_approval",
          remaining_placeholder_count: 0,
          blocked_candidate_count: 0,
        },
        approval: {
          valid: false,
          reasons: ["approval record が指定されていない"],
        },
        allowed_to_apply: false,
        blocked_reasons: ["approval record が指定されていない"],
        patch_candidates: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            operation: "append_yaml_frontmatter",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-new-impl-test.json",
            operation: "create_json_artifact",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-new-impl-runtime.json",
            operation: "create_json_artifact",
          }),
        ],
        write_policy: "read-only",
      });
      const evidenceApplySummary = runCliIn(root, [
        "closure",
        "evidence-apply",
        "--dry-run",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordWithProvenancePath,
        "--summary-json",
      ]);
      expect(evidenceApplySummary.status).toBe(0);
      const evidenceApplySummaryPayload = JSON.parse(evidenceApplySummary.stdout);
      expect(evidenceApplySummaryPayload).toMatchObject({
        schema_version: "project-closure-evidence-apply-summary.v1",
        selected_action: "collect_evidence",
        allowed_to_apply: false,
        blocked_reasons: ["approval record が指定されていない"],
        patch_candidate_count: 3,
        executed: false,
        applied_artifacts: [],
        write_policy: "read-only",
      });
      expect(evidenceApplySummaryPayload.patch_candidates).toBeUndefined();
      expect(evidenceApplySummaryPayload.sample_patch_candidates).toHaveLength(3);

      const bundleJson = runCliIn(root, [
        "closure",
        "review-bundle",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--json",
      ]);
      expect(bundleJson.status).toBe(0);
      const bundlePayload = JSON.parse(bundleJson.stdout);
      expect(bundlePayload).toMatchObject({
        schema_version: "project-closure-review-bundle.v1",
        action: "collect_evidence",
        approval_required: false,
        total: 1,
        listed: 1,
        omitted: 0,
        write_policy: "read-only",
        decision: {
          decision_id: "closure-review:collect_evidence",
          allowed_outcomes: [
            "keep_current_queue",
            "move_after_evidence_change",
            "return_to_reverse_design",
          ],
          outcome_routes: expect.arrayContaining([
            expect.objectContaining({
              outcome: "keep_current_queue",
              projection_type: "reroute_closure_lane",
              target_action: "collect_evidence",
              drive_model: "Recovery",
            }),
          ]),
        },
        candidates: [
          expect.objectContaining({
            planId: "PLAN-L7-999-new-impl",
            nextAction: "collect_evidence",
          }),
        ],
      });
      const bundleSummaryJson = runCliIn(root, [
        "closure",
        "review-bundle",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(bundleSummaryJson.status).toBe(0);
      const bundleSummaryPayload = JSON.parse(bundleSummaryJson.stdout);
      expect(bundleSummaryPayload).toMatchObject({
        schema_version: "project-closure-review-bundle-summary.v1",
        action: "collect_evidence",
        approval_required: false,
        total: 1,
        listed: 1,
        omitted: 0,
        approval_window_count: 1,
        review_window_index: [
          {
            page_index: 1,
            page_count: 1,
            current: true,
            decision_id: "closure-review:collect_evidence",
            allowed_outcomes: [
              "keep_current_queue",
              "move_after_evidence_change",
              "return_to_reverse_design",
            ],
            draft_outcome: "pending_human_review",
            non_authorizing: true,
            offset: 0,
            limit: 1,
            start: 1,
            end: 1,
            listed: 1,
            omitted_before: 0,
            omitted_after: 0,
            approval_scope_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
            review_scope: expect.objectContaining({
              approval_scope_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
              plan_ids: ["PLAN-L7-999-new-impl"],
              source_paths: ["docs/plans/PLAN-L7-999-new-impl.md"],
              coverage_ids: ["L6-implementation-binding"],
              l12_layers: ["L6"],
              evidence_totals: expect.objectContaining({
                artifact_paths: 1,
                evidence_paths: 0,
                test_runs_total: 0,
                test_runs_passed: 0,
              }),
            }),
            decision_record_default_path:
              ".helix/tmp/closure/collect_evidence-decision-draft-offset-0.yml",
            review_window_command:
              "helix closure review-bundle --action collect_evidence --limit 1 --offset 0 --summary-json",
            transition_window_command:
              "helix closure transition-plan --action collect_evidence --limit 1 --offset 0 --summary-json",
            decision_draft_command:
              "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --summary-json",
            decision_draft_record_command:
              "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --out .helix/tmp/closure/collect_evidence-decision-draft-offset-0.yml --summary-json",
          },
        ],
        aggregate_review_scope: {
          plan_ids: ["PLAN-L7-999-new-impl"],
          source_paths: ["docs/plans/PLAN-L7-999-new-impl.md"],
          coverage_ids: ["L6-implementation-binding"],
          l12_layers: ["L6"],
          evidence_totals: expect.objectContaining({
            artifact_paths: 1,
            evidence_paths: 0,
            test_runs_total: 0,
            test_runs_passed: 0,
          }),
        },
        candidate_count: 1,
        decision: {
          decision_id: "closure-review:collect_evidence",
        },
        current_window_command:
          "helix closure review-bundle --action collect_evidence --limit 1 --offset 0 --summary-json",
        previous_window_command: null,
        next_window_command: null,
        transition_window_command:
          "helix closure transition-plan --action collect_evidence --limit 1 --offset 0 --summary-json",
        decision_draft_command:
          "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --summary-json",
        decision_draft_record_command:
          "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --out .helix/tmp/closure/collect_evidence-decision-draft-offset-0.yml --summary-json",
        approval_review_checklist: {
          schema_version: "project-closure-approval-review-checklist.v1",
          checklist_id: "closure-review:collect_evidence:offset:0",
          scope: "current_window",
          status: "ready_for_human_review",
          non_authorizing: true,
          must_not_apply: true,
          approval_required: false,
          approval_allowed: false,
          allowed_outcomes: [
            "keep_current_queue",
            "move_after_evidence_change",
            "return_to_reverse_design",
          ],
          required_checks: expect.arrayContaining([
            expect.objectContaining({
              check_id: "window_candidate_scope",
              status: "pass",
              evidence_field: "listed",
              expected: 1,
            }),
            expect.objectContaining({
              check_id: "approval_scope_digest",
              status: "pass",
              evidence_field: "review_scope.approval_scope_digest",
              expected: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
            }),
            expect.objectContaining({
              check_id: "window_evidence_totals",
              status: "review",
              evidence_field: "review_scope.evidence_totals",
            }),
            expect.objectContaining({
              check_id: "blocked_findings",
              status: "pass",
              evidence_field: "decision.blocked_by_findings",
              expected: [],
            }),
            expect.objectContaining({
              check_id: "decision_record_non_authorizing",
              status: "review",
              evidence_field: "decision_draft_record_command",
              expected:
                "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --out .helix/tmp/closure/collect_evidence-decision-draft-offset-0.yml --summary-json",
            }),
          ]),
          current_window_command:
            "helix closure review-bundle --action collect_evidence --limit 1 --offset 0 --summary-json",
          transition_window_command:
            "helix closure transition-plan --action collect_evidence --limit 1 --offset 0 --summary-json",
          decision_draft_command:
            "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --summary-json",
          decision_draft_record_command:
            "helix closure decision-draft --action collect_evidence --limit 1 --offset 0 --out .helix/tmp/closure/collect_evidence-decision-draft-offset-0.yml --summary-json",
          approval_route_command: null,
          approval_route_postcheck_commands: [],
        },
        source_command: "helix closure review-bundle --action collect_evidence --summary-json",
        full_source_command: "helix closure review-bundle --json",
        sample_candidates: [
          expect.objectContaining({
            planId: "PLAN-L7-999-new-impl",
            nextAction: "collect_evidence",
            evidence_status: "partial",
          }),
        ],
      });
      expect(bundleSummaryPayload.candidates).toBeUndefined();

      const bundleText = runCliIn(root, [
        "closure",
        "review-bundle",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(bundleText.status).toBe(0);
      expect(bundleText.stdout).toContain(
        "closure review-bundle: action=collect_evidence approval_required=false count=1 listed=1 omitted=0 decision=closure-review:collect_evidence write=read-only",
      );
      expect(bundleText.stdout).toContain(
        "outcome-routes=keep_current_queue->collect_evidence:Recovery",
      );
      expect(bundleText.stdout).toContain("review-scope: digest=sha256:");
      expect(bundleText.stdout).toContain("coverage: ids=L6-implementation-binding l12=L6");
      expect(bundleText.stdout).toContain(
        "candidate: PLAN-L7-999-new-impl coverage=L6-implementation-binding l12=L6 evidence=partial",
      );

      const closeReadyDecisionDraft = runCliIn(root, [
        "closure",
        "decision-draft",
        "--action",
        "close_ready",
        "--limit",
        "1",
        "--json",
      ]);
      expect(closeReadyDecisionDraft.status).toBe(0);
      const decisionDraftPayload = JSON.parse(closeReadyDecisionDraft.stdout);
      expect(decisionDraftPayload).toMatchObject({
        schema_version: "project-closure-decision-draft.v1",
        action: "close_ready",
        plan_only: true,
        must_not_apply: true,
        approval_allowed: false,
        apply_authorized: false,
        review: {
          total: 0,
          listed: 0,
          omitted: 0,
          limit: 1,
          offset: 0,
        },
        decision: {
          decision_id: "closure-review:close_ready",
          draft_outcome: "pending_human_review",
          non_authorizing: true,
          allowed_outcomes: [
            "approve_closure_claim",
            "reject_to_collect_evidence",
            "reject_to_repair_failed_evidence",
            "reject_to_reverse_design",
          ],
        },
        write_policy: "read-only",
      });
      expect(decisionDraftPayload.approval_record_text).toContain("outcome: pending_human_review");
      expect(decisionDraftPayload.approval_record_text).toContain("coverage_ids: none");
      expect(decisionDraftPayload.approval_record_text).toContain("l12_layers: none");
      const closeReadyDecisionDraftSummary = runCliIn(root, [
        "closure",
        "decision-draft",
        "--action",
        "close_ready",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(closeReadyDecisionDraftSummary.status).toBe(0);
      const decisionDraftSummaryPayload = JSON.parse(closeReadyDecisionDraftSummary.stdout);
      expect(decisionDraftSummaryPayload).toMatchObject({
        schema_version: "project-closure-decision-draft-summary.v1",
        action: "close_ready",
        plan_only: true,
        must_not_apply: true,
        approval_allowed: false,
        apply_authorized: false,
        review: {
          total: 0,
          listed: 0,
          omitted: 0,
          limit: 1,
          offset: 0,
        },
        decision: {
          decision_id: "closure-review:close_ready",
          draft_outcome: "pending_human_review",
          non_authorizing: true,
        },
        candidate_digest_count: 0,
        decision_record_output: {
          requested: false,
          written: false,
          non_authorizing: true,
        },
        current_window_command:
          "helix closure decision-draft --action close_ready --limit 1 --offset 0 --summary-json",
        decision_record_default_path: ".helix/tmp/closure/close_ready-decision-draft-offset-0.yml",
        decision_record_command:
          "helix closure decision-draft --action close_ready --limit 1 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
        source_command: "helix closure decision-draft --summary-json",
      });
      expect(decisionDraftSummaryPayload.candidate_digests).toBeUndefined();
      expect(decisionDraftSummaryPayload.approval_record_text).toBeUndefined();
      const decisionDraftPath = join(root, "tmp", "closure-decision-draft.yml");
      const closeReadyDecisionDraftOut = runCliIn(root, [
        "closure",
        "decision-draft",
        "--action",
        "close_ready",
        "--limit",
        "1",
        "--out",
        decisionDraftPath,
        "--json",
      ]);
      expect(closeReadyDecisionDraftOut.status).toBe(0);
      const decisionDraftOutPayload = JSON.parse(closeReadyDecisionDraftOut.stdout);
      expect(decisionDraftOutPayload.decision_record_output).toMatchObject({
        requested: true,
        path: decisionDraftPath,
        written: true,
        non_authorizing: true,
      });
      const decisionDraftRecord = readFileSync(decisionDraftPath, "utf8");
      expect(decisionDraftRecord).toContain("outcome: pending_human_review");
      expect(decisionDraftRecord).toContain("coverage_ids: none");
      expect(decisionDraftRecord).not.toContain("outcome: approve_closure_claim");

      const transitionJson = runCliIn(root, [
        "closure",
        "transition-plan",
        "--action",
        "collect_evidence",
        "--decision",
        "approve_closure_claim",
        "--limit",
        "1",
        "--json",
      ]);
      expect(transitionJson.status).toBe(0);
      const transitionPayload = JSON.parse(transitionJson.stdout);
      expect(transitionPayload).toMatchObject({
        schema_version: "project-closure-transition-plan.v1",
        action: "collect_evidence",
        decision_outcome: "approve_closure_claim",
        dry_run: true,
        target_plan_ids: ["PLAN-L7-999-new-impl"],
        total: 1,
        listed: 1,
        omitted: 0,
        limit: 1,
        offset: 0,
        window: {
          start: 1,
          end: 1,
          page_index: 1,
          page_count: 1,
          has_previous: false,
          has_next: false,
          previous_offset: null,
          next_offset: null,
        },
        allowed_to_apply: false,
        blocked_reasons: ["close_ready 以外は closure apply 対象ではなく再分類対象"],
        outcome_projection: {
          projection_type: "reroute_closure_lane",
          target_action: "collect_evidence",
          drive_model: "Recovery",
          command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --json",
          transition_command:
            "helix closure review-bundle --action collect_evidence --summary-json",
        },
        write_policy: "read-only",
      });
      expect(
        transitionPayload.planned_steps.map((step: { step_id: string }) => step.step_id),
      ).toEqual([
        "record-rejection",
        "reroute-closure-lane",
        "rebuild-projection",
        "postcheck-drive-model",
      ]);

      const transitionSummary = runCliIn(root, [
        "closure",
        "transition-plan",
        "--action",
        "collect_evidence",
        "--decision",
        "approve_closure_claim",
        "--limit",
        "1",
        "--summary-json",
      ]);
      expect(transitionSummary.status).toBe(0);
      const transitionSummaryPayload = JSON.parse(transitionSummary.stdout);
      expect(transitionSummaryPayload).toMatchObject({
        schema_version: "project-closure-transition-plan-summary.v1",
        action: "collect_evidence",
        decision_outcome: "approve_closure_claim",
        dry_run: true,
        total: 1,
        listed: 1,
        omitted: 0,
        allowed_to_apply: false,
        blocked_reasons: ["close_ready 以外は closure apply 対象ではなく再分類対象"],
        outcome_projection: {
          projection_type: "reroute_closure_lane",
          target_action: "collect_evidence",
          drive_model: "Recovery",
          command:
            "helix closure evidence-probe --action collect_evidence --limit 1 --execute --out .helix/tmp/closure/collect_evidence-probe-record.json --summary-json",
          transition_command:
            "helix closure review-bundle --action collect_evidence --summary-json",
        },
        planned_step_count: 4,
        current_window_command:
          "helix closure transition-plan --action collect_evidence --decision approve_closure_claim --limit 1 --offset 0 --summary-json",
        previous_window_command: null,
        next_window_command: null,
        source_command:
          "helix closure transition-plan --action collect_evidence --decision approve_closure_claim --summary-json",
        full_source_command:
          "helix closure transition-plan --action collect_evidence --decision approve_closure_claim --limit 1 --offset 0 --json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
        write_policy: "read-only",
      });
      expect(transitionSummaryPayload).not.toHaveProperty("target_plan_ids");

      const transitionText = runCliIn(root, [
        "closure",
        "transition-plan",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
      ]);
      expect(transitionText.status).toBe(0);
      expect(transitionText.stdout).toContain(
        "closure transition-plan: action=collect_evidence decision=approve_closure_claim dry_run=true allowed=false targets=1 listed=1 omitted=0 write=read-only",
      );
      expect(transitionText.stdout).toContain(
        "window=1/1 range=1-1 offset=0 limit=1 prev=- next=-",
      );
      expect(transitionText.stdout).toContain(
        "outcome-projection: type=reroute_closure_lane target=collect_evidence drive=Recovery",
      );
      expect(transitionText.stdout).toContain(
        "blockers=close_ready 以外は closure apply 対象ではなく再分類対象",
      );

      const applyBlocked = runCliIn(root, ["closure", "apply", "--dry-run", "--json"]);
      expect(applyBlocked.status).toBe(0);
      const applyBlockedPayload = JSON.parse(applyBlocked.stdout);
      expect(applyBlockedPayload).toMatchObject({
        schema_version: "project-closure-apply-plan.v1",
        dry_run: true,
        action: "close_ready",
        allowed_to_apply: false,
        approval: {
          required: true,
          valid: false,
          reasons: ["approval record が指定されていない"],
        },
        blocked_reasons: expect.arrayContaining([
          "対象 candidate が 0 件",
          "approval record が指定されていない",
        ]),
        patch_candidates: [],
        write_policy: "read-only",
      });
      const applyBlockedSummary = runCliIn(root, [
        "closure",
        "apply",
        "--dry-run",
        "--summary-json",
      ]);
      expect(applyBlockedSummary.status).toBe(0);
      expect(JSON.parse(applyBlockedSummary.stdout)).toMatchObject({
        schema_version: "project-closure-apply-plan-summary.v1",
        dry_run: true,
        executed: false,
        action: "close_ready",
        allowed_to_apply: false,
        approval: {
          required: true,
          valid: false,
          reasons: ["approval record が指定されていない"],
        },
        blocked_reasons: expect.arrayContaining([
          "対象 candidate が 0 件",
          "approval record が指定されていない",
        ]),
        patch_candidate_count: 0,
        applied_patch_count: 0,
        source_command: "helix closure apply --dry-run --summary-json",
        full_source_command: "helix closure apply --dry-run --limit 20 --json",
        write_policy: "read-only",
      });

      const closeReadyReviewForApproval = runCliIn(root, [
        "closure",
        "review-bundle",
        "--action",
        "close_ready",
        "--json",
      ]);
      expect(closeReadyReviewForApproval.status).toBe(0);
      const closeReadyReviewPayload = JSON.parse(closeReadyReviewForApproval.stdout);
      const approvalPath = join(root, "closure-approval.yaml");
      writeFileSync(
        approvalPath,
        [
          "decision_id: closure-review:close_ready",
          "outcome: approve_closure_claim",
          `approval_scope_digest: ${closeReadyReviewPayload.review_scope.approval_scope_digest}`,
          "reason: fixture approval",
        ].join("\n"),
        "utf8",
      );
      const applyWithApproval = runCliIn(root, [
        "closure",
        "apply",
        "--dry-run",
        "--approval-record",
        approvalPath,
        "--json",
      ]);
      expect(applyWithApproval.status).toBe(0);
      const applyWithApprovalPayload = JSON.parse(applyWithApproval.stdout);
      expect(applyWithApprovalPayload).toMatchObject({
        approval: {
          valid: true,
          decision_id: "closure-review:close_ready",
          outcome: "approve_closure_claim",
        },
        allowed_to_apply: false,
        blocked_reasons: expect.arrayContaining(["対象 candidate が 0 件"]),
      });

      const rebuild = runCliIn(root, ["db", "rebuild"]);
      expect(rebuild.status).toBe(0);
      const tree = runCliIn(root, ["progress", "tree-view", "--json"]);
      const treePayload = JSON.parse(tree.stdout);
      const treeRoots = JSON.parse(JSON.stringify(treePayload.roots)) as Array<{
        id: string;
        children: Array<{ id: string }>;
      }>;
      const treePayloadJson = JSON.stringify(treePayload);
      expect(tree.status).toBe(0);
      expect(treePayload).toMatchObject({
        schema_version: "visualization-tree-view.v1",
        roots: [
          expect.objectContaining({ id: "project", label: "Project" }),
          expect.objectContaining({ id: "harness", label: "HARNESS" }),
        ],
      });
      const projectRoot = treeRoots.find((root: { id: string }) => root.id === "project");
      if (!projectRoot) throw new Error("project root is missing from tree-view payload");
      const currentNode = projectRoot.children.find(
        (child: { id: string }) => child.id === "project/current-location",
      );
      expect(currentNode).toMatchObject({
        label: "Current location",
        description: "L14 -> L12 / needs_recovery",
      });
      expect(treePayloadJson).toContain("project/current-location/coverage/L6");
      expect(treePayloadJson).toContain("project/current-location/roadmap-position");
      const treeSummary = runCliIn(root, ["progress", "tree-view", "--summary-json"]);
      expect(treeSummary.status).toBe(0);
      const parsedTreeSummary = JSON.parse(treeSummary.stdout);
      expect(parsedTreeSummary).toMatchObject({
        schema_version: "visualization-tree-view-summary.v1",
        root_count: 2,
        roots: [
          expect.objectContaining({ id: "project", label: "Project" }),
          expect.objectContaining({ id: "harness", label: "HARNESS" }),
        ],
        node_count: expect.any(Number),
        command_count: expect.any(Number),
        warning_count: expect.any(Number),
        full_json_pointer_audit: {
          status: "pass",
          total_count: 0,
          allowed_count: 0,
          unexpected_count: 0,
          allowed_patterns: [],
          pointers: [],
          unexpected_pointers: [],
        },
        project_frontier_summary: {
          schema_version: "project-frontier-summary.v1",
          current: {
            layer: "L14",
            l12_layer: "L12",
            status: "needs_recovery",
            completion_boundary: "contradicted",
          },
          current_location_frontier: expect.objectContaining({
            schema_version: "current-location-frontier-summary.v1",
            frontier_type: "recovery_frontier",
            status: "recovery_required",
            classification: "l14_claim_with_l7_work",
            selected_model: "Recovery",
            route_id: "drive:Recovery:recover-current-location",
            commands: expect.objectContaining({
              current_location: "helix current-location --summary-json",
              project_frontier: "helix progress frontier --summary-json",
            }),
          }),
          function_design_policy: {
            status: expect.any(String),
            independent_layer_policy: "abolished",
            command: "helix current-location --summary-json",
          },
          operation_scope: {
            designed: expect.any(Number),
            observed: expect.any(Number),
            observed_gap: expect.any(Number),
            missing: expect.any(Number),
            reverify: expect.any(Number),
            source_command: "helix progress frontier --summary-json",
            items: expect.arrayContaining([
              expect.objectContaining({
                scope: "log_design",
                design_count: expect.any(Number),
                observed_count: expect.any(Number),
                evidence_tables: expect.any(Array),
              }),
              expect.objectContaining({
                scope: "class_method_contract",
                status: expect.any(String),
                coverage_id: "L12-operation-observability",
              }),
            ]),
          },
          scrum_operation: {
            status: expect.any(String),
            source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
            source_binding_count: expect.any(Number),
            observed_count: expect.any(Number),
            missing_count: expect.any(Number),
          },
          drive_model: {
            forward_spine_model: "Forward",
            registered_entry_model_count: 10,
            missing_registered_entry_models: [],
            candidate_count: 12,
            candidate_models: expect.arrayContaining([
              "Discovery",
              "Scrum",
              "Reverse",
              "Recovery",
              "Incident",
              "Refactor",
              "Retrofit",
              "Add-feature",
              "version-up",
              "Research",
              "OperationVerification",
              "Forward",
            ]),
            selected_model: "Recovery",
            selected_route_id: "drive:Recovery:recover-current-location",
            selection_status: "recovery_required",
            source_command: "helix drive model --summary-json",
          },
          closure_frontier: {
            action: "close_ready",
            approval_required: true,
            total: expect.any(Number),
            listed: expect.any(Number),
            omitted: expect.any(Number),
            approval_window_count: expect.any(Number),
            review_window_index: expect.any(Array),
            review_scope: expect.objectContaining({
              approval_scope_digest: expect.any(String),
            }),
            aggregate_review_scope: expect.objectContaining({
              evidence_totals: expect.objectContaining({
                artifact_paths: expect.any(Number),
                evidence_paths: expect.any(Number),
                test_runs_total: expect.any(Number),
                test_runs_passed: expect.any(Number),
              }),
            }),
            decision_id: "closure-review:close_ready",
            current_window_command:
              "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
            transition_window_command:
              "helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
            decision_draft_command:
              "helix closure decision-draft --action close_ready --limit 20 --offset 0 --summary-json",
            decision_draft_record_command:
              "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
            approval_review_checklist: expect.objectContaining({
              schema_version: "project-closure-approval-review-checklist.v1",
              checklist_id: "closure-review:close_ready:offset:0",
              status: expect.any(String),
              non_authorizing: true,
              must_not_apply: true,
              approval_required: true,
              approval_allowed: expect.any(Boolean),
              required_checks: expect.arrayContaining([
                expect.objectContaining({
                  check_id: "approval_scope_digest",
                  status: "pass",
                  evidence_field: "review_scope.approval_scope_digest",
                }),
                expect.objectContaining({
                  check_id: "decision_record_non_authorizing",
                  status: "review",
                  evidence_field: "decision_draft_record_command",
                }),
              ]),
              decision_draft_record_command:
                "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
            }),
            source_command: "helix closure review-bundle --action close_ready --summary-json",
          },
          vmodel_fit: {
            status: "needs_fit",
            current_location_gate: expect.objectContaining({
              status: "needs_recovery",
              completion_boundary: "contradicted",
            }),
            recovery_runway_gate: expect.objectContaining({
              status: expect.any(String),
              human_approval_count: expect.any(Number),
            }),
            approval_review_gate: expect.objectContaining({
              status: expect.any(String),
              action: "close_ready",
            }),
            function_design_policy: {
              status: expect.any(String),
              independent_layer_policy: "abolished",
              command: "helix current-location --summary-json",
            },
            source_command: "helix vmodel fit --summary-json",
          },
          skill_binding: {
            status: expect.any(String),
            selected_model: "Recovery",
            required_skills: expect.any(Number),
            item_count: expect.any(Number),
            source_command: "helix skill suggest --current-location --summary-json",
          },
          commands: {
            project_frontier: "helix progress frontier --summary-json",
            current_location: "helix current-location --summary-json",
            drive_model: "helix drive model --summary-json",
            closure_review_window:
              "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
            closure_transition_window:
              "helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
            closure_decision_draft:
              "helix closure decision-draft --action close_ready --limit 20 --offset 0 --summary-json",
            closure_decision_draft_record:
              "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
            vmodel_fit: "helix vmodel fit --summary-json",
            skill_binding: "helix skill suggest --current-location --summary-json",
          },
          write_policy: "read-only",
          source_command: "helix progress frontier --summary-json",
        },
        summary_surface_command_audit: {
          status: "pass",
          catalog_status: "pass",
          checked_surface_count: SUMMARY_SURFACE_CONTRACTS.length,
          excluded_surface_count: 2,
          unexpected_count: 0,
          allowed_fields: [
            "full_source_command",
            "full_view_command",
            "full_review_bundle_command",
            "full_inject_command",
          ],
          expected_surfaces: SUMMARY_SURFACE_CONTRACTS.map((contract) => contract.surface),
          missing_surfaces: [],
          unexpected_surfaces: [],
          source_command_mismatches: [],
          unexpected_commands: [],
          excluded_surfaces: expect.arrayContaining([
            expect.objectContaining({
              surface: "doctor-summary",
              source_command: "helix doctor --summary-json",
            }),
            expect.objectContaining({
              surface: "progress-tree-view",
              source_command: "helix progress tree-view --summary-json",
            }),
          ]),
          surfaces: expect.arrayContaining([
            expect.objectContaining({
              surface: "current-location",
              source_command: "helix current-location --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "progress-artifacts",
              source_command: "helix progress artifacts --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "vmodel-fit",
              source_command: "helix vmodel fit --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "project-frontier",
              source_command: "helix progress frontier --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "completion-decision-packet",
              source_command: "helix completion decision-packet --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "closure-evidence-probe",
              source_command: "helix closure evidence-probe --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "closure-review-bundle",
              source_command: "helix closure review-bundle --action close_ready --summary-json",
              unexpected_count: 0,
            }),
            expect.objectContaining({
              surface: "closure-apply",
              source_command: "helix closure apply --dry-run --summary-json",
              unexpected_count: 0,
            }),
          ]),
        },
        write_policy: "read-only",
        source_command: "helix progress tree-view --summary-json",
        full_source_command: "helix progress tree-view --json",
      });
      expect(
        parsedTreeSummary.summary_surface_command_audit.surfaces.map(
          (surface: { surface: string; source_command: string }) => ({
            surface: surface.surface,
            source_command: surface.source_command,
          }),
        ),
      ).toEqual(
        SUMMARY_SURFACE_CONTRACTS.map((contract) => ({
          surface: contract.surface,
          source_command: contract.source_command,
        })),
      );
      const frontierSummary = runCliIn(root, ["progress", "frontier", "--summary-json"]);
      expect(frontierSummary.status).toBe(0);
      const parsedFrontierSummary = JSON.parse(frontierSummary.stdout);
      expect(parsedFrontierSummary).toMatchObject({
        schema_version: "project-frontier-summary.v1",
        current: parsedTreeSummary.project_frontier_summary.current,
        current_location_frontier: expect.objectContaining({
          schema_version: "current-location-frontier-summary.v1",
          frontier_type: "recovery_frontier",
          classification: "l14_claim_with_l7_work",
          commands: expect.objectContaining({
            current_location: "helix current-location --summary-json",
            project_frontier: "helix progress frontier --summary-json",
          }),
        }),
        function_design_policy: expect.objectContaining({
          independent_layer_policy: "abolished",
          command: "helix current-location --summary-json",
        }),
        drive_model: expect.objectContaining({
          selected_model: "Recovery",
          source_command: "helix drive model --summary-json",
        }),
        closure_frontier: expect.objectContaining({
          action: "close_ready",
          approval_review_checklist: expect.objectContaining({
            schema_version: "project-closure-approval-review-checklist.v1",
            non_authorizing: true,
          }),
        }),
        commands: expect.objectContaining({
          project_frontier: "helix progress frontier --summary-json",
          current_location: "helix current-location --summary-json",
          vmodel_fit: "helix vmodel fit --summary-json",
        }),
        write_policy: "read-only",
        source_command: "helix progress frontier --summary-json",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);

  it("executes approved materialized evidence patches in a fixture repo only", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-evidence-apply-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "docs", "design", "helix", "L12-vmodel"), {
        recursive: true,
      });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L14-01-close.md"),
        [
          "---",
          "plan_id: PLAN-L14-01-close",
          "kind: impl",
          "layer: L14",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-08T00:00:00.000Z",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L7-999-evidence.md"),
        [
          "---",
          "plan_id: PLAN-L7-999-evidence",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: draft",
          "updated: 2026-07-08T00:01:00.000Z",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      const definitions = [
        ["HVC-L1", "企画", "L1"],
        ["HVC-L2", "要求 画面", "L2"],
        ["HVC-L3", "機能要件", "L3"],
        ["HVC-L4", "基本設計", "L4"],
        ["HVC-L5", "詳細設計 class/method contract", "L5"],
        ["HVC-L6", "implementation binding", "L6"],
        ["HVC-L7", "TDD closure trace", "L7"],
        ["HVC-L8", "unit test", "L8"],
        ["HVC-L9", "integration test", "L9"],
        ["HVC-L10", "system test", "L10"],
        ["HVC-L11", "acceptance test", "L11"],
        ["HVC-L12", "運用テスト ログ KPI runtime verification class/method contract", "L12"],
      ];
      writeFileSync(
        join(root, "docs", "design", "helix", "L12-vmodel", "coverage.md"),
        [
          "---",
          "spec:",
          "  defines:",
          ...definitions.flatMap(([id, kind, layer]) => [
            `    - id: ${id}`,
            `      kind: ${kind}`,
            `      layer: ${layer}`,
          ]),
          "---",
          "",
          "# coverage",
          "",
          ...definitions.map(([id]) => `- ${id}`),
        ].join("\n"),
        "utf8",
      );
      const probeRecordPath = join(root, "probe-record.json");
      writeFileSync(
        probeRecordPath,
        JSON.stringify(
          {
            execution: {
              command: "bun run test:fast",
              session_id: "closure-probe:session1234",
              correlation_id: "closure-correlation:corr1234",
              started_at: "2026-07-08T00:03:00.000Z",
              completed_at: "2026-07-08T00:03:10.000Z",
              exit_code: 0,
              status: "passed",
              output_digest:
                "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              stdout_bytes: 10,
              stderr_bytes: 0,
              error_message: null,
            },
          },
          null,
          2,
        ),
        "utf8",
      );
      const materialize = runCliIn(root, [
        "closure",
        "evidence-materialize",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordPath,
        "--json",
      ]);
      expect(materialize.status).toBe(0);
      const materializePayload = JSON.parse(materialize.stdout);
      expect(materializePayload.materialize_readiness.status).toBe("ready_for_approval");
      const approvalPath = join(root, "materialized-evidence-approval.yaml");
      writeFileSync(
        approvalPath,
        [
          "decision_id: closure-evidence-materialize:collect_evidence",
          "outcome: approve_materialized_evidence",
          `approval_scope_digest: ${materializePayload.approval.approval_scope_digest}`,
          "reason: fixture materialized evidence approval",
        ].join("\n"),
        "utf8",
      );

      const dryRun = runCliIn(root, [
        "closure",
        "evidence-apply",
        "--dry-run",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordPath,
        "--approval-record",
        approvalPath,
        "--json",
      ]);
      expect(dryRun.status).toBe(0);
      const dryRunPayload = JSON.parse(dryRun.stdout);
      expect(dryRunPayload).toMatchObject({
        schema_version: "project-closure-evidence-apply-plan.v1",
        allowed_to_apply: true,
        approval: {
          valid: true,
          decision_id: "closure-evidence-materialize:collect_evidence",
          outcome: "approve_materialized_evidence",
        },
        patch_candidates: [
          expect.objectContaining({
            artifact_path: "docs/plans/PLAN-L7-999-evidence.md",
            operation: "append_yaml_frontmatter",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-evidence-test.json",
            operation: "create_json_artifact",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-evidence-runtime.json",
            operation: "create_json_artifact",
          }),
        ],
      });

      const apply = runCliIn(root, [
        "closure",
        "evidence-apply",
        "--execute",
        "--action",
        "collect_evidence",
        "--limit",
        "1",
        "--probe-record",
        probeRecordPath,
        "--approval-record",
        approvalPath,
        "--json",
      ]);
      expect(apply.status).toBe(0);
      const applied = JSON.parse(apply.stdout);
      expect(applied).toMatchObject({
        executed: true,
        allowed_to_apply: true,
        applied_artifacts: [
          expect.objectContaining({
            artifact_path: "docs/plans/PLAN-L7-999-evidence.md",
            operation: "append_yaml_frontmatter",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-evidence-test.json",
            operation: "create_json_artifact",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-999-evidence-runtime.json",
            operation: "create_json_artifact",
          }),
        ],
      });
      const planText = readFileSync(join(root, "docs", "plans", "PLAN-L7-999-evidence.md"), "utf8");
      expect(planText).toContain("review_evidence:");
      expect(planText).toContain('command: "bun run test:fast"');
      expect(existsSync(join(root, "docs", "evidence", "PLAN-L7-999-evidence-test.json"))).toBe(
        true,
      );
      expect(
        readFileSync(join(root, "docs", "evidence", "PLAN-L7-999-evidence-runtime.json"), "utf8"),
      ).toContain('"correlation_id": "closure-correlation:corr1234"');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("writes executed evidence probe records as handoff artifacts without overwrite", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-evidence-probe-out-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(root, "package.json"),
        JSON.stringify({ scripts: { "test:fast": "bun --version" } }, null, 2),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L7-999-probe.md"),
        [
          "---",
          "plan_id: PLAN-L7-999-probe",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: draft",
          "updated: 2026-07-08T00:01:00.000Z",
          "review_evidence:",
          "  - reviewer: fixture",
          "    review_kind: intra_runtime_subagent",
          '    reviewed_at: "2026-07-08T00:02:00.000Z"',
          '    tests_green_at: "2026-07-08T00:02:00.000Z"',
          "    verdict: reject",
          "    scope: fixture",
          "    worker_model: codex",
          "    reviewer_model: codex",
          "    green_commands:",
          "      - kind: unit_test",
          '        command: "Bash (vitest)"',
          "        runner: bash",
          "        scope: targeted",
          "        exit_code: 1",
          '        completed_at: "2026-07-08T00:02:00.000Z"',
          "        evidence_path: docs/evidence/probe-test.json",
          "        output_digest: error",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );

      const probePath = join(root, "tmp", "probe-record.json");
      const probe = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "repair_failed_evidence",
        "--limit",
        "1",
        "--execute",
        "--out",
        probePath,
        "--json",
      ]);
      expect(probe.status).toBe(0);
      const payload = JSON.parse(probe.stdout);
      expect(payload).toMatchObject({
        schema_version: "project-closure-evidence-probe.v1",
        selected_action: "repair_failed_evidence",
        dry_run: false,
        command: "bun run test:fast",
        can_execute: true,
        execution: {
          status: "passed",
          exit_code: 0,
          command: "bun run test:fast",
          session_id: expect.stringMatching(/^closure-probe:/),
          correlation_id: expect.stringMatching(/^closure-correlation:/),
        },
        probe_record_output: {
          requested: true,
          path: probePath,
          written: true,
          sha256: expect.stringMatching(/^sha256:/),
        },
      });
      const record = JSON.parse(readFileSync(probePath, "utf8"));
      expect(record).toMatchObject({
        schema_version: "project-closure-evidence-probe.v1",
        execution: {
          status: "passed",
          command: "bun run test:fast",
        },
      });

      const summaryProbePath = join(root, "tmp", "probe-record-summary.json");
      const summaryProbe = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "repair_failed_evidence",
        "--limit",
        "1",
        "--execute",
        "--out",
        summaryProbePath,
        "--summary-json",
      ]);
      expect(summaryProbe.status).toBe(0);
      const summaryPayload = JSON.parse(summaryProbe.stdout);
      expect(summaryPayload).toMatchObject({
        schema_version: "project-closure-evidence-probe-summary.v1",
        selected_action: "repair_failed_evidence",
        dry_run: false,
        command: "bun run test:fast",
        can_execute: true,
        execution: {
          status: "passed",
          exit_code: 0,
          command: "bun run test:fast",
          session_id: expect.stringMatching(/^closure-probe:/),
          correlation_id: expect.stringMatching(/^closure-correlation:/),
          output_digest: expect.stringMatching(/^sha256:/),
        },
        probe_record_output: {
          requested: true,
          path: summaryProbePath,
          written: true,
          sha256: expect.stringMatching(/^sha256:/),
        },
        source_command: "helix closure evidence-probe --summary-json",
        full_source_command: "helix closure evidence-probe --json",
      });
      const summaryRecord = JSON.parse(readFileSync(summaryProbePath, "utf8"));
      expect(summaryRecord).toMatchObject({
        schema_version: "project-closure-evidence-probe.v1",
        execution: {
          status: "passed",
          command: "bun run test:fast",
        },
      });

      const overwrite = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "repair_failed_evidence",
        "--limit",
        "1",
        "--execute",
        "--out",
        probePath,
        "--json",
      ]);
      expect(overwrite.status).toBe(2);
      expect(overwrite.stderr).toContain("closure evidence-probe: output already exists:");

      writeFileSync(
        join(root, "package.json"),
        JSON.stringify(
          {
            scripts: {
              "test:fast":
                "bun -e \"require('node:fs').writeFileSync('probe-should-not-run.txt', 'ran')\"",
            },
          },
          null,
          2,
        ),
        "utf8",
      );
      const overwriteFailFast = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "repair_failed_evidence",
        "--limit",
        "1",
        "--execute",
        "--out",
        probePath,
        "--summary-json",
      ]);
      expect(overwriteFailFast.status).toBe(2);
      expect(overwriteFailFast.stderr).toContain("closure evidence-probe: output already exists:");
      expect(existsSync(join(root, "probe-should-not-run.txt"))).toBe(false);

      const dryRunOut = runCliIn(root, [
        "closure",
        "evidence-probe",
        "--action",
        "repair_failed_evidence",
        "--limit",
        "1",
        "--out",
        join(root, "tmp", "dry-run-probe.json"),
        "--json",
      ]);
      expect(dryRunOut.status).toBe(2);
      expect(dryRunOut.stderr).toContain(
        "closure evidence-probe: --out requires --execute with probe execution",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("executes approved close_ready closure patches in a fixture repo only", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-closure-apply-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "docs", "design", "helix", "L12-vmodel"), {
        recursive: true,
      });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L14-01-close.md"),
        [
          "---",
          "plan_id: PLAN-L14-01-close",
          "kind: impl",
          "layer: L14",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-08T00:00:00.000Z",
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L7-999-ready.md"),
        [
          "---",
          "plan_id: PLAN-L7-999-ready",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-08T00:01:00.000Z",
          "review_evidence:",
          "  - reviewer: fixture",
          "    review_kind: intra_runtime_subagent",
          '    reviewed_at: "2026-07-08T00:02:00.000Z"',
          '    tests_green_at: "2026-07-08T00:02:00.000Z"',
          "    verdict: approve",
          "    scope: fixture",
          "    worker_model: codex",
          "    reviewer_model: codex",
          "    green_commands:",
          "      - kind: unit_test",
          '        command: "bun test tests/fixture.test.ts"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 0",
          '        completed_at: "2026-07-08T00:02:00.000Z"',
          "        evidence_path: tests/fixture.test.ts",
          '        output_digest: "sha256:fixture"',
          "---",
          "",
          "# fixture",
        ].join("\n"),
        "utf8",
      );
      const definitions = [
        ["HVC-L1", "企画", "L1"],
        ["HVC-L2", "要求 画面", "L2"],
        ["HVC-L3", "機能要件", "L3"],
        ["HVC-L4", "基本設計", "L4"],
        ["HVC-L5", "詳細設計 class/method contract", "L5"],
        ["HVC-L6", "implementation binding", "L6"],
        ["HVC-L7", "TDD closure trace", "L7"],
        ["HVC-L8", "unit test", "L8"],
        ["HVC-L9", "integration test", "L9"],
        ["HVC-L10", "system test", "L10"],
        ["HVC-L11", "acceptance test", "L11"],
        ["HVC-L12", "運用テスト ログ KPI runtime verification class/method contract", "L12"],
      ];
      writeFileSync(
        join(root, "docs", "design", "helix", "L12-vmodel", "coverage.md"),
        [
          "---",
          "spec:",
          "  defines:",
          ...definitions.flatMap(([id, kind, layer]) => [
            `    - id: ${id}`,
            `      kind: ${kind}`,
            `      layer: ${layer}`,
          ]),
          "---",
          "",
          "# coverage",
          "",
          ...definitions.map(([id]) => `- ${id}`),
        ].join("\n"),
        "utf8",
      );
      const closeReadyReviewForExecution = runCliIn(root, [
        "closure",
        "review-bundle",
        "--action",
        "close_ready",
        "--limit",
        "1",
        "--json",
      ]);
      expect(closeReadyReviewForExecution.status).toBe(0);
      const closeReadyExecutionReview = JSON.parse(closeReadyReviewForExecution.stdout);
      const decisionDraftPath = join(
        root,
        ".helix",
        "tmp",
        "closure",
        "close_ready-decision-draft.yml",
      );
      const decisionDraft = runCliIn(root, [
        "closure",
        "decision-draft",
        "--action",
        "close_ready",
        "--limit",
        "1",
        "--out",
        decisionDraftPath,
        "--summary-json",
      ]);
      expect(decisionDraft.status).toBe(0);
      const rebuildWithDecisionDraft = runCliIn(root, ["db", "rebuild"]);
      expect(rebuildWithDecisionDraft.status).toBe(0);
      const fitWithDecisionDraft = runCliIn(root, ["vmodel", "fit", "--json"]);
      expect(fitWithDecisionDraft.status).toBe(0);
      const fitWithDecisionDraftPayload = JSON.parse(fitWithDecisionDraft.stdout);
      expect(fitWithDecisionDraftPayload).toMatchObject({
        recovery_handoff_gate: {
          status: "approval_pending",
          effective_phase: "approval",
          approval_status: "pending_human_review",
          approval_record_path: ".helix/tmp/closure/close_ready-decision-draft.yml",
          decision_id: "closure-review:close_ready",
          materialize_status: null,
          valid_for_apply: false,
          handoff_present: 1,
          handoff_missing: 0,
          command: "helix closure review-bundle --action close_ready --summary-json",
        },
      });
      expect(fitWithDecisionDraftPayload.recovery_handoff_gate.reason_codes).toContain(
        "handoff.decision_draft.present",
      );
      const approvalPath = join(root, "closure-approval.yaml");
      writeFileSync(
        approvalPath,
        [
          "decision_id: closure-review:close_ready",
          "outcome: approve_closure_claim",
          `approval_scope_digest: ${closeReadyExecutionReview.review_scope.approval_scope_digest}`,
          "reason: fixture approval",
        ].join("\n"),
        "utf8",
      );

      const before = runCliIn(root, ["closure", "batch", "--action", "close_ready", "--json"]);
      expect(before.status).toBe(0);
      expect(JSON.parse(before.stdout)).toMatchObject({ total: 1 });

      const apply = runCliIn(root, [
        "closure",
        "apply",
        "--execute",
        "--approval-record",
        approvalPath,
        "--limit",
        "1",
        "--json",
      ]);
      expect(apply.status).toBe(0);
      const applied = JSON.parse(apply.stdout);
      expect(applied).toMatchObject({
        executed: true,
        allowed_to_apply: true,
        applied_patches: [
          {
            plan_id: "PLAN-L7-999-ready",
            source_path: "docs/plans/PLAN-L7-999-ready.md",
            next_status: "accepted",
          },
        ],
      });
      expect(readFileSync(join(root, "docs", "plans", "PLAN-L7-999-ready.md"), "utf8")).toContain(
        "status: accepted",
      );

      const current = runCliIn(root, ["current-location", "--json"]);
      expect(current.status).toBe(0);
      expect(JSON.parse(current.stdout).counts.open_l7_plans).toBe(0);
      const after = runCliIn(root, ["closure", "batch", "--action", "close_ready", "--json"]);
      expect(after.status).toBe(0);
      expect(JSON.parse(after.stdout)).toMatchObject({ total: 0 });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes VSCode visualization manifest as a read-only CLI surface", () => {
    const run = runCli(["vscode", "manifest", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      name: "helix-visualization",
      main: "./dist/vscode/extension.js",
      extensionKind: ["workspace"],
      activationEvents: ["onView:helix.projectView", "onView:helix.harnessView"],
      readOnlyCommands: ["helix.refreshVisualization", "helix.copyPointer"],
    });
    expect(payload.contributes.views.helix.map((view: { id: string }) => view.id)).toEqual([
      "helix.projectView",
      "helix.harnessView",
    ]);
  });

  it("exposes progress view-model as a Project/HARNESS boundary JSON surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-progress-view-model-"));
    try {
      const run = runCliIn(root, ["progress", "view-model", "--json"]);
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        generated_from: "visualization-snapshot.v1",
        view_boundaries: {
          project: {
            root: "project",
            owned_views: expect.arrayContaining(["current_location", "layer_progress"]),
            source_fields: expect.arrayContaining(["project_current_location"]),
            excluded_fields: expect.arrayContaining(["evidence.skill_invocations"]),
            view_command: "helix progress tree-view --json",
          },
          harness: {
            root: "harness",
            owned_views: expect.arrayContaining(["harness_growth", "skill_agent_telemetry"]),
            source_fields: expect.arrayContaining([
              "evidence.skill_invocations",
              "evidence.model_runs",
            ]),
            excluded_fields: expect.arrayContaining(["project_current_location.vmodel_fit"]),
            view_command: "helix progress tree-view --json",
          },
        },
        project: {
          current_location: {
            status: expect.any(String),
            vmodel_fit: expect.any(Object),
          },
        },
        harness: {
          harness_growth: {
            current_sections: {
              artifacts: expect.any(Array),
              plans: expect.any(Array),
              gates: expect.any(Array),
            },
          },
        },
      });

      const text = runCliIn(root, ["progress", "view-model"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain("progress view-model: project=current_location");
      expect(text.stdout).toContain("harness=harness_growth,skill_agent_telemetry");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails review command closed unless the current uncommitted scope is explicit", () => {
    const run = runCli(["review", "--json"]);

    expect(run.status).toBe(1);
    expect(run.stderr).toContain("review requires --uncommitted");
  });

  it("emits a non-destructive cutover dry-run plan", () => {
    const run = runCli(["cutover", "--to", "staging", "--dry-run", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      ok: true,
      mode: "dry-run",
      to: "staging",
      humanApprovalRequired: true,
    });
    expect(payload.checks).toContain("bun run src/cli.ts doctor");
    expect(payload.checks).toContain("bun run src/cli.ts db status --json");
  });

  it("quotes cutover rollback refs in dry-run output", () => {
    const run = runCli([
      "cutover",
      "--from",
      "release candidate; echo unsafe",
      "--to",
      "staging",
      "--dry-run",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload.rollback).toBe("git switch 'release candidate; echo unsafe'");
  });

  it("labels cutover text output as approval-required, not approved", () => {
    const run = runCli(["cutover", "--to", "staging", "--dry-run"]);

    expect(run.status).toBe(0);
    expect(run.stdout).toContain("humanApprovalRequired=true");
    expect(run.stdout).not.toContain("approval=true");
  });

  it("refuses cutover apply without a human-approved runbook", () => {
    const run = runCli(["cutover", "--to", "staging", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(payload).toMatchObject({
      ok: false,
      mode: "requires-human-approval",
      humanApprovalRequired: true,
    });
    expect(run.stderr).toContain("explicit human-approved runbook");
  });

  it("exposes clean distribution planning with preflight, rollback, and contract metadata", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-cli-dist-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "helix", "0.1.0");
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.0", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        actualCutRequiresPoApproval: true,
        export: {
          ok: true,
          channel: "clean-repo-plus-signed-tarball",
          sourceTag: "v0.1.0",
        },
        readiness: {
          ok: true,
          objectiveBoundary: {
            scope: "consumer_setup_readiness_not_whole_program_completion",
            progressPercent: 90,
            completionClaimAllowed: false,
            completionReviewBundleCommand: "helix completion review-bundle --json",
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
      expect(payload.export.artifactPaths).toContain("LICENSE");
      expect(payload.export.cleanRepo).toBe("RetryYN/HELIX-HARNESS-OS");
      expect(payload.readiness.contracts.tagPin).toBe("github:RetryYN/HELIX-HARNESS-OS#v0.1.0");
      expect(payload.readiness.contracts.tagPin).not.toContain("helix-agent-harness-clean");
      expect(payload.export.artifactPaths).not.toContain(
        "docs/plans/PLAN-L7-157-distribution-clean-pull.md",
      );
      expect(payload.readiness.rollback.managedPaths).toContain("AGENTS.md");
      expect(payload.readiness.contracts.tagPin).toContain("#v0.1.0");
      expect(payload.readiness.ci.forkPullRequestSecrets).toBe("not-required");
      expect(payload.readiness.ci.packageResolution).toMatchObject({
        command: "bun run helix --version",
        remediation: expect.stringContaining("consumer package.json"),
      });
      expect(payload.readiness.ci.packagePreflight).toMatchObject({
        installCommand: "bun install --frozen-lockfile",
        lockfiles: ["bun.lock", "bun.lockb"],
        requiredScripts: ["helix", "typecheck", "test"],
        scriptCommands: ["bun run helix --version", "bun run typecheck", "bun run test"],
        source: "Bun install / lockfile / package scripts official documentation",
        sourceUrl: "https://bun.com/docs/pm/cli/install",
        lockfileSourceUrl: "https://bun.com/docs/pm/lockfile",
        scriptsSourceUrl: "https://bun.com/docs/quickstart",
        sourceCheckedAt: "2026-07-03",
        sourceStatusDelta: expect.stringContaining("structured CI preflight metadata"),
        workflowRouteImpact: expect.stringContaining("fix_consumer_readiness"),
      });
      expect(payload.readiness.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "distribution-version-binding",
            ok: true,
          }),
        ]),
      );
      expect(payload.readiness.objectiveBoundary.reason).toContain("does not approve");
    } finally {
      rmSync(join(repoRoot, "codex-env.txt"), { force: true });
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("PLAN-L7-357: exposes distribution sync/package/release surfaces without remote mutation", () => {
    const outDir = mkdtempSync(join(tmpdir(), "helix-cli-dist-package-"));
    try {
      const syncPlan = runCli([
        "distribution",
        "sync-plan",
        "--tag",
        "v0.1.0",
        "--staging-dir",
        outDir,
        "--json",
      ]);
      expect(syncPlan.status, syncPlan.stderr || syncPlan.stdout).toBe(0);
      const syncPayload = JSON.parse(syncPlan.stdout);
      expect(syncPayload).toMatchObject({
        ok: true,
        actualRemoteMutationRequiresPoApproval: true,
        sync: {
          mode: "non-destructive-sync-plan",
          destructiveRemoteMutation: false,
          publishRequiresPoApproval: true,
        },
      });
      expect(syncPayload.sync.commands).toEqual(
        expect.arrayContaining([
          expect.stringContaining("git -C "),
          expect.stringContaining("add --"),
        ]),
      );

      const releasePlan = runCli([
        "distribution",
        "release-plan",
        "--tag",
        "v0.1.0",
        "--repo",
        "RetryYN/HELIX-HARNESS-OS",
        "--json",
      ]);
      expect(releasePlan.status, releasePlan.stderr || releasePlan.stdout).toBe(0);
      expect(JSON.parse(releasePlan.stdout)).toMatchObject({
        schemaVersion: "helix-github-release-publication-plan.v1",
        ok: true,
        dryRun: true,
        externalPublishRequiresApproval: true,
        mustNotApplyWithoutApproval: true,
      });

      const packaged = runCli([
        "distribution",
        "package",
        "--tag",
        "v0.1.0",
        "--out",
        outDir,
        "--json",
      ]);
      expect(packaged.status, packaged.stderr || packaged.stdout).toBe(0);
      const packagePayload = JSON.parse(packaged.stdout);
      expect(packagePayload).toMatchObject({
        ok: true,
        actualPublishRequiresPoApproval: true,
        artifacts: {
          signatureRequired: true,
          signatureCreated: false,
        },
      });
      expect(packagePayload.artifacts.tarball).toContain(outDir);
      expect(packagePayload.artifacts.checksum).toContain(outDir);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }, 30_000);

  it("blocks distribution planning when the requested tag is not bound to package version", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-cli-dist-version-drift-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "helix", "0.1.0");
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.4", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload).toMatchObject({
        ok: false,
        export: {
          ok: true,
          sourceTag: "v0.1.4",
        },
        readiness: {
          ok: false,
          objectiveBoundary: {
            completionReviewBundleCommand: "helix completion review-bundle --json",
            versionBinding: {
              localDistributionTag: "v0.1.0",
              requestedDistributionTag: "v0.1.4",
              requestedTagMatchesPackageVersion: false,
              distributionTargetRequiresVersionUpActivation: true,
            },
          },
        },
      });
      expect(payload.readiness.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "distribution-version-binding",
            ok: false,
            message: expect.stringContaining("version-up activation decision"),
          }),
        ]),
      );
    } finally {
      rmSync(join(repoRoot, "codex-env.txt"), { force: true });
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("blocks distribution planning when the bare helix CLI is not available", () => {
    const binDir = mkdtempSync(join(tmpdir(), "helix-cli-dist-missing-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "helix", "not-linked", 127);
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.0", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        HELIX_CODEX_BIN: fakeCodex,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload).toMatchObject({
        ok: false,
        export: { ok: true },
        readiness: { ok: false },
      });
      expect(payload.readiness.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "helix-cli",
            ok: false,
          }),
        ]),
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("exposes telemetry scan as a JSON command surface without provider CLI execution", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-telemetry-"));
    try {
      const run = runCliIn(root, [
        "telemetry",
        "scan",
        "--claude-dir",
        join(root, "missing-claude"),
        "--codex-dir",
        join(root, "missing-codex"),
        "--json",
      ]);
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        totalRuns: 0,
        claudeRuns: 0,
        codexRuns: 0,
        inputTokens: 0,
        outputTokens: 0,
      });
      expect(payload.claudeDir).toBe(join(root, "missing-claude"));
      expect(payload.codexDir).toBe(join(root, "missing-codex"));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("appends L7.5 RUN & Debug runtime verification logs", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-run-debug-"));
    try {
      const run = runCliIn(root, [
        "run-debug",
        "log",
        "--plan",
        "PLAN-L7-202-run-debug-runtime-verification",
        "--claim",
        "works",
        "--session",
        "session-1",
        "--correlation",
        "corr-1",
        "--evidence-path",
        ".helix/evidence/run-debug/session-1.jsonl",
        "--oracle",
        "U-RUNDEBUG-006",
        "--occurred-at",
        "2026-06-30T00:00:00.000Z",
        "--json",
      ]);
      const payload = JSON.parse(run.stdout);
      const logPath = join(root, ".helix", "evidence", "run-debug", "runtime-verification.jsonl");
      const rows = readFileSync(logPath, "utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));

      expect(run.status).toBe(0);
      expect(payload.path).toBe(".helix/evidence/run-debug/runtime-verification.jsonl");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        plan_id: "PLAN-L7-202-run-debug-runtime-verification",
        claim: "works",
        session_id: "session-1",
        source: "run-debug",
        runtime_surface: "helix-cli",
        test_oracle_id: "U-RUNDEBUG-006",
      });

      const refused = runCliIn(root, [
        "run-debug",
        "log",
        "--plan",
        "PLAN-L7-202-run-debug-runtime-verification",
        "--claim",
        "works",
        "--session",
        "session-1",
        "--correlation",
        "corr-2",
        "--evidence-path",
        ".helix/evidence/run-debug/session-1.jsonl",
        "--source",
        "projection",
      ]);
      expect(refused.status).toBe(1);
      expect(refused.stderr).toContain("invalid: source");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes quality audit as a JSON command surface", () => {
    const run = runCli(["audit", "quality", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toHaveProperty("byBucket");
    expect(payload.byBucket).toHaveProperty("gate");
    expect(payload).toHaveProperty("byCode");
  }, 20_000);

  it("exposes branch audit as a read-only JSON command surface", () => {
    const run = runCli(["branch", "audit", "--json"]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toHaveProperty("byStatus");
    expect(payload.byStatus).toHaveProperty("delete-candidate");
    expect(Array.isArray(payload.rows)).toBe(true);
  }, 20_000);

  it("exposes team run as a shared Claude/Codex dry-run launch plan", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-team-"));
    try {
      const teamPath = join(root, "team.yaml");
      writeFileSync(
        teamPath,
        [
          "name: speed-team",
          "strategy: parallel",
          "max_parallel: 2",
          "members:",
          "  - role: se",
          "    engine: codex-se",
          "    task: implement slice A",
          "  - role: tl",
          "    engine: pmo-sonnet",
          "    task: review slice A",
          "",
        ].join("\n"),
      );

      const run = runCli(["team", "run", "--definition", teamPath, "--mode", "hybrid", "--json"]);
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        team: "speed-team",
        strategy: "parallel",
        dry_run: true,
      });
      expect(payload.members.map((member: { provider: string }) => member.provider)).toEqual([
        "codex",
        "claude",
      ]);
      expect(
        payload.members.map((member: { adapter: { command: string } }) => member.adapter.command),
      ).toEqual(["codex", "claude"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes team suggest as a deterministic launch policy surface", () => {
    const run = runCli([
      "team",
      "suggest",
      "--task",
      "production security schema migration",
      "--mode",
      "hybrid",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      should_launch: true,
      mode: "hybrid",
      difficulty: "critical",
      trigger: "risk",
    });
    expect(
      payload.definition.members.map((member: { provider?: string; role: string }) => member.role),
    ).toEqual(["se", "tl", "qa"]);
  });

  it("exposes proposal document coverage lanes as a parallel team suggestion", () => {
    const run = runCli([
      "team",
      "suggest",
      "--task",
      "Rename a local docs helper and update README wording.",
      "--mode",
      "hybrid",
      "--design-docs",
      "--json",
    ]);
    const payload = JSON.parse(run.stdout);

    expect(run.status).toBe(0);
    expect(payload).toMatchObject({
      should_launch: true,
      mode: "hybrid",
      trigger: "difficulty",
    });
    expect(payload.document_coverage.recommended_subagents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tier: "T2-mini", parallel_slots: 4 }),
        expect.objectContaining({ tier: "T2-spark", parallel_slots: 3 }),
      ]),
    );
    expect(payload.definition).toMatchObject({
      name: "proposal-coverage-team",
      strategy: "parallel",
      max_parallel: 7,
    });
    expect(
      payload.definition.members.filter(
        (member: { model?: string }) => member.model === "gpt-5.4-mini",
      ),
    ).toHaveLength(4);
    expect(
      payload.definition.members.filter(
        (member: { model?: string }) => member.model === "gpt-5.3-codex-spark",
      ),
    ).toHaveLength(3);
    expect(
      payload.definition.members.some((member: { model?: string }) => member.model === "gpt-5.5"),
    ).toBe(false);
    expect(
      payload.definition.members.every((member: { ownership?: string }) => member.ownership),
    ).toBe(true);
  }, 20_000);

  it("executes team run through fake Claude/Codex adapters while keeping JSON machine-readable", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-cli-team-exec-"));
    try {
      const binDir = join(root, "bin");
      mkdirSync(binDir);
      const fakeCodex = writeFakeProvider(binDir, "codex");
      const fakeClaude = writeFakeProvider(binDir, "claude");
      const teamPath = join(root, "team.yaml");
      writeFileSync(
        teamPath,
        [
          "name: speed-team",
          "strategy: parallel",
          "max_parallel: 2",
          "members:",
          "  - role: se",
          "    engine: codex-se",
          "    task: implement slice A",
          "  - role: tl",
          "    engine: pmo-sonnet",
          "    task: review slice A",
          "",
        ].join("\n"),
      );

      const currentPath = process.env.PATH ?? process.env.Path ?? "";
      const testPath = `${binDir}${process.platform === "win32" ? ";" : ":"}${currentPath}`;
      const env = {
        ...process.env,
        PATH: testPath,
        Path: testPath,
        HELIX_CODEX_BIN: fakeCodex,
        HELIX_CLAUDE_BIN: fakeClaude,
      };
      const run = runCliIn(
        root,
        ["team", "run", "--definition", teamPath, "--mode", "hybrid", "--execute", "--json"],
        env,
      );
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(run.stdout).not.toContain("noisy-codex");
      expect(run.stdout).not.toContain("noisy-claude");
      expect(payload).toMatchObject({
        ok: true,
        team: "speed-team",
        strategy: "parallel",
        dry_run: false,
      });
      expect(payload.executions.map((row: { status: string }) => row.status)).toEqual([
        "completed",
        "completed",
      ]);
      const slots = JSON.parse(
        readFileSync(join(root, ".helix", "state", "agent-slots.json"), "utf8"),
      );
      expect(slots).toHaveLength(2);
      expect(
        slots.every((slot: { slot_source: string }) => slot.slot_source === "team_runner"),
      ).toBe(true);
      expect(slots.every((slot: { released_at: string | null }) => slot.released_at !== null)).toBe(
        true,
      );
      expect(readFileSync(join(root, "codex-env.txt"), "utf8")).not.toContain("raw=1");
      expect(readFileSync(join(root, "codex-env.txt"), "utf8")).not.toContain(
        "reason=helix-runtime-adapter-wrapper",
      );
      expect(readFileSync(join(root, "claude-env.txt"), "utf8")).not.toContain("raw=1");
      expect(readFileSync(join(root, "claude-env.txt"), "utf8")).toContain("effort=medium");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("executes codex adapter under --execute --json and reports dry_run:false honestly", () => {
    // 回帰: 旧実装は --execute --json で provider を起動せず dry_run:false の plan JSON だけ
    // 返していた (実行していないのに実行済みに見える機械判定の罠)。実行 + 正直な JSON を要求する。
    const root = mkdtempSync(join(tmpdir(), "helix-cli-adapter-exec-"));
    try {
      const binDir = join(root, "bin");
      mkdirSync(binDir);
      const fakeCodex = writeFakeProvider(binDir, "codex");
      const fakeClaude = writeFakeProvider(binDir, "claude");
      const currentPath = process.env.PATH ?? process.env.Path ?? "";
      const testPath = `${binDir}${process.platform === "win32" ? ";" : ":"}${currentPath}`;
      const env = {
        ...process.env,
        PATH: testPath,
        Path: testPath,
        HELIX_CODEX_BIN: fakeCodex,
        HELIX_CLAUDE_BIN: fakeClaude,
      };
      const run = runCliIn(
        root,
        ["codex", "--role", "se", "--task", "implement slice A", "--execute", "--json"],
        env,
      );

      // provider の stdout (noisy-codex) は fd2(stderr) へ逃がし、stdout は実行結果 JSON 専用に保つ。
      expect(run.stdout).not.toContain("noisy-codex");
      const payload = JSON.parse(run.stdout);
      expect(payload).toMatchObject({
        provider: "codex",
        executed: true,
        dry_run: false,
        exit_code: 0,
        // 正常終了は signal=null (signal 終了時のみ exit_code=null + signal 名が入る)。
        signal: null,
      });
      // provider が実際に起動した証跡 (env dump)。「実行せず JSON だけ」だと生成されない。
      expect(readFileSync(join(root, "codex-env.txt"), "utf8")).toContain("args=");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);

  it("U-CLI-MEM-SURFACE: session start surfaces harness-layer memory (HELIX P7, not a per-agent silo)", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-mem-surface-"));
    try {
      mkdirSync(join(root, ".helix", "memory"), { recursive: true });
      const entry = {
        id: "harness:rule:2026-01-01T00:00:00.000Z",
        layer: "harness",
        key: "rule",
        body: "always inventory existing first",
        supersedes: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      writeFileSync(
        join(root, ".helix", "memory", "harness.jsonl"),
        `${JSON.stringify(entry)}\n`,
        "utf8",
      );
      const run = runCliIn(root, ["session", "start"]);
      // harness memory が SessionStart 出力に surface する (Claude 内蔵 silo でなく共有 SSoT を想起)。
      expect(run.stdout).toContain("harness-memory (1):");
      expect(run.stdout).toContain("- [rule] always inventory existing first");
      expect(run.stdout).toContain("session-log: start");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);
});
