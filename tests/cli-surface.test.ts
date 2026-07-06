import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const helixEnvPrefix = ["HE", "LIX"].join("");

function runCli(args: string[]) {
  return runCliIn(repoRoot, args);
}

function runCliIn(cwd: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
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
    expect(JSON.parse(goodCommit.stdout)).toMatchObject({ ok: true, subjectCount: 1 });

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
      expect(blockedPayload.judgmentReview.requiredEvidenceJa).toEqual(
        expect.arrayContaining(["worker_model を記録する", "reviewer_model を記録する"]),
      );
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
      expect(blockedText.stdout).toContain("evidence=worker_model を記録する");
      expect(blockedText.stdout).toContain("evidence-id=worker_model recorded");
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
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

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
