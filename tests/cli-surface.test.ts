import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const legacyEnvPrefix = ["HE", "LIX"].join("");

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

function runRepoScriptUtTdd(args: string[]) {
  if (process.platform === "win32") {
    return spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(repoRoot, "scripts", "ut-tdd.ps1"),
        ...args,
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );
  }
  return spawnSync(join(repoRoot, "scripts", "ut-tdd"), args, {
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
  const rawEnv = [legacyEnvPrefix, "ALLOW", "RAW", name.toUpperCase()].join("_");
  const reasonEnv = [legacyEnvPrefix, "RAW", name.toUpperCase(), "REASON"].join("_");
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

function writeFakeGitLsRemote(binDir: string, packHead: string, latestTag = "v0.1.3"): string {
  if (process.platform === "win32") {
    const path = join(binDir, "git.cmd");
    writeFileSync(
      path,
      [
        "@echo off",
        "set args=%*",
        'echo %args% | findstr /C:"--tags" >nul',
        "if not errorlevel 1 (",
        `  echo a148fd304a455e21e631d4dab3c36d59725b1034 refs/tags/${latestTag}`,
        "  exit /b 0",
        ")",
        'echo %args% | findstr /C:"UT-TDD_AGENT-HARNESS-Pack.git" >nul',
        "if not errorlevel 1 (",
        `  echo ${packHead} refs/heads/main`,
        "  exit /b 0",
        ")",
        "echo 7f83ca811353ed90b3e981178a1b0c9977dd5863 refs/heads/main",
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
      '  *"UT-TDD_AGENT-HARNESS-Pack.git"*"--tags"*|*"--tags"*"UT-TDD_AGENT-HARNESS-Pack.git"*)',
      `    echo 'a148fd304a455e21e631d4dab3c36d59725b1034 refs/tags/${latestTag}'`,
      "    ;;",
      '  *"UT-TDD_AGENT-HARNESS-Pack.git"*)',
      `    echo '${packHead} refs/heads/main'`,
      "    ;;",
      "  *)",
      "    echo '7f83ca811353ed90b3e981178a1b0c9977dd5863 refs/heads/main'",
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

  it("keeps repo wrapper decision packet commands aligned with live source", () => {
    const s4 = runRepoScriptUtTdd(["s4", "decision-packet", "--json"]);
    expect(s4.status, s4.stderr || s4.stdout).toBe(0);
    const s4Packets = JSON.parse(s4.stdout);
    expect(s4Packets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          schemaVersion: "s4-decision-packet.v1",
          recordTemplates: expect.arrayContaining([
            expect.objectContaining({ recordName: "s4_decision_record" }),
          ]),
        }),
      ]),
    );

    const completion = runRepoScriptUtTdd(["completion", "decision-packet", "--json"]);
    expect(completion.status, completion.stderr || completion.stdout).toBe(0);
    const completionPacket = JSON.parse(completion.stdout);
    expect(completionPacket.sourceCommand).toBe("ut-tdd completion decision-packet --json");
    expect(completionPacket.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          decisionPacketCommand: "ut-tdd s4 decision-packet --json",
          runnableDecisionPacketCommand: "bun run ut-tdd s4 decision-packet --json",
        }),
      ]),
    );
  }, 20_000);

  it("U-HOVER-018: exposes normal handover status as a read-only JSON preflight surface", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-handover-status-"));
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

      const handoverDir = join(root, ".ut-tdd", "handover");
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
        generated_by: "ut-tdd-handover",
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
        completionClaimAllowed: true,
      });
      expect(payload.completionDecisionPacket).toMatchObject({
        ok: true,
        status: "ready",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "ut-tdd handover",
        decisionCount: 0,
      });

      const text = runCliIn(root, ["handover", "status"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain(
        "handover status: active=PLAN-L7-04-handover-mechanism status=in_progress stale=false",
      );
      expect(text.stdout).toContain("latest_doc:");
      expect(text.stdout).toContain("completion: ready");
      expect(text.stdout).toContain(
        "objective-progress: 100% (ready; completion-claim-allowed=true)",
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
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes completion decision packet templates through handover status JSON", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-handover-packet-"));
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
      const pointerPath = join(root, ".ut-tdd", "handover", "CURRENT.json");
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
        sourceCommand: "ut-tdd handover",
        decisionCount: 1,
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
        "authority-blockers=human:human_approval_pending,irreversible_migration_pending workflow-state:non_terminal_plans automation:none",
      );
      expect(text.stdout).toContain("objective-progress:");
      expect(text.stdout).toContain("completion-claim-allowed=false");
      expect(text.stdout).toContain("workflow-next:");
      expect(text.stdout).toContain("workflow-next-actions: 1");
      expect(text.stdout).toContain("workflow-next-action[1]: PLAN-M-02-fixture");
      expect(text.stdout).toContain(
        "packet=ut-tdd rename plan --json scoped=ut-tdd rename plan --json supporting=ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json scoped-supporting=ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(
        "action-id=obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      );
      expect(text.stdout).toContain(
        "route-id=L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
      );
      expect(text.stdout).toContain(
        "completion-decision-packet: ut-tdd completion decision-packet --json",
      );
      expect(text.stdout).toContain(
        "supporting-decision-packets: ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json",
      );
      expect(text.stdout).toContain(
        "scoped-supporting-decision-packets: ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain("semantic_frontier_records: 1");
      expect(text.stdout).toContain("confirmed_current_meaning_records: 11");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("exposes plan complete as the completed handover lifecycle entrypoint", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-plan-complete-"));
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
    const readyRoot = mkdtempSync(join(tmpdir(), "ut-tdd-cli-completion-ready-"));
    const blockedRoot = mkdtempSync(join(tmpdir(), "ut-tdd-cli-completion-blocked-"));
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
      expect(blockedPayload.judgmentReview).toMatchObject({
        mode: expect.any(String),
        requiredReviewKind: expect.stringMatching(/^(cross_agent|intra_runtime_subagent|human)$/),
        gateCommandTemplate: expect.stringContaining("ut-tdd gate <gate-id>"),
      });
      expect(blockedPayload.judgmentReview.requiredEvidence.length).toBeGreaterThan(0);
      expect(blockedPayload.workflowNextAction).toContain(
        "record the PO/S4 decision before promotion, rejection, or Forward merge",
      );
      expect(blockedPayload.workflowNextActions).toMatchObject([
        {
          order: 1,
          planId: "PLAN-DISCOVERY-07-fixture",
          reason: "po_decision_pending",
          decisionKind: "po_s4_decision",
          decisionPacketCommand: "ut-tdd s4 decision-packet --json",
          runnableDecisionPacketCommand: "bun run ut-tdd s4 decision-packet --json",
          packetCommands: ["ut-tdd s4 decision-packet --json"],
          runnablePacketCommands: ["bun run ut-tdd s4 decision-packet --json"],
          scopedDecisionPacketCommand:
            "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          runnableScopedDecisionPacketCommand:
            "bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          scopedPacketCommands: [
            "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          ],
          runnableScopedPacketCommands: [
            "bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
          ],
          supportingPacketSummaries: [
            expect.objectContaining({
              command: "ut-tdd s4 decision-packet --json",
              runnableCommand: "bun run ut-tdd s4 decision-packet --json",
              scopedCommand: "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
              runnableScopedCommand:
                "bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
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
          decisionPacketCommand: "ut-tdd rename plan --json",
          runnableDecisionPacketCommand: "bun run ut-tdd rename plan --json",
          packetCommands: [
            "ut-tdd rename plan --json",
            "ut-tdd action-binding approval-packet --json",
          ],
          runnablePacketCommands: [
            "bun run ut-tdd rename plan --json",
            "bun run ut-tdd action-binding approval-packet --json",
          ],
          scopedDecisionPacketCommand: "ut-tdd rename plan --json",
          runnableScopedDecisionPacketCommand: "bun run ut-tdd rename plan --json",
          scopedPacketCommands: [
            "ut-tdd rename plan --json",
            "ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
          ],
          runnableScopedPacketCommands: [
            "bun run ut-tdd rename plan --json",
            "bun run ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
          ],
          supportingPacketSummaries: [
            expect.objectContaining({
              command: "ut-tdd rename plan --json",
              runnableCommand: "bun run ut-tdd rename plan --json",
              scopedCommand: "ut-tdd rename plan --json",
              runnableScopedCommand: "bun run ut-tdd rename plan --json",
              schemaVersion: "identifier-rename-cutover-plan.v1",
              matrixField: "verificationCommandMatrix",
              expectedMatrixCount: 9,
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
              command: "ut-tdd action-binding approval-packet --json",
              runnableCommand: "bun run ut-tdd action-binding approval-packet --json",
              scopedCommand:
                "ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
              runnableScopedCommand:
                "bun run ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
              schemaVersion: "action-binding-approval-packet.v1",
              matrixField: "approvalVerificationCommandMatrix",
              expectedMatrixCount: 10,
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
        sourceCommand: "ut-tdd status --json",
        freshness: {
          validForMinutes: 1440,
          stale: false,
          policy: "decision-packet-freshness.v1",
        },
        decisionCount: 2,
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
      expect(blockedText.stdout).toContain("workflow-next: completion-blocked:");
      expect(blockedText.stdout).toContain("workflow-next-actions: 2");
      expect(blockedText.stdout).toContain(
        `workflow-next-action: 1 PLAN-DISCOVERY-07-fixture reason=po_decision_pending action=${firstWorkflowAction.requiredActionJa} action-id=record the PO/S4 decision before promotion, rejection, or Forward merge route=${firstWorkflowAction.nextWorkflowRouteJa} route-id=S4 decide -> Reverse/Forward merge only after decision_outcome is recorded packet=ut-tdd s4 decision-packet --json scoped=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture`,
      );
      expect(blockedText.stdout).toContain(
        "runnable-workflow-next-action: 1 PLAN-DISCOVERY-07-fixture packet=bun run ut-tdd s4 decision-packet --json scoped=bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
      );
      expect(blockedText.stdout).toContain(
        `workflow-next-action: 2 PLAN-M-02-fixture reason=irreversible_migration_pending action=${secondWorkflowAction.requiredActionJa} action-id=obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work route=${secondWorkflowAction.nextWorkflowRouteJa} route-id=L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply packet=ut-tdd rename plan --json scoped=ut-tdd rename plan --json`,
      );
      expect(blockedText.stdout).toContain(
        "scoped-supporting=ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 1 ut-tdd s4 decision-packet --json runnable=bun run ut-tdd s4 decision-packet --json scoped=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture runnable-scoped=bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07-fixture",
      );
      expect(blockedText.stdout).toContain(
        "matrixFields=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 2 ut-tdd rename plan --json runnable=bun run ut-tdd rename plan --json scoped=ut-tdd rename plan --json runnable-scoped=bun run ut-tdd rename plan --json schema=identifier-rename-cutover-plan.v1 matrix=verificationCommandMatrix count=9",
      );
      expect(blockedText.stdout).toContain(
        "packet-summary: 2 ut-tdd action-binding approval-packet --json runnable=bun run ut-tdd action-binding approval-packet --json scoped=ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture runnable-scoped=bun run ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture schema=action-binding-approval-packet.v1 matrix=approvalVerificationCommandMatrix count=10",
      );
      expect(blockedText.stdout).toContain("completion: blocked");
      expect(blockedText.stdout).toContain("authority-blockers=human:");
      expect(blockedText.stdout).toContain("workflow-state:non_terminal_plans automation:none");
      expect(blockedText.stdout).toContain("semantic_frontier_records: 2");
      expect(blockedText.stdout).toContain("confirmed_current_meaning_records: 11");
      expect(blockedText.stdout).toContain("decision-packet: ut-tdd s4 decision-packet --json");
      expect(blockedText.stdout).toContain(
        "supporting-decision-packets: ut-tdd s4 decision-packet --json | ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json",
      );
      expect(blockedText.stdout).toContain(
        "completion-decision-packet: ut-tdd completion decision-packet --json",
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
    });

    const text = runCli(["status"]);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain(
      "objective-progress: 90% (blocked; completion-claim-allowed=false)",
    );
    expect(text.stdout).toContain("confirmed_current_meaning_records: 11");
  });

  it("verifies objective external ledger with git ls-remote observations", () => {
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-objective-external-"));
    try {
      writeFakeGitLsRemote(binDir, "b9a42df867ceadbd24fc8e0a50ad756da0591c59");
      const run = runCliIn(repoRoot, ["audit", "objective-external", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        externalObserved: {
          development_repo: "7f83ca811353ed90b3e981178a1b0c9977dd5863",
          distribution_pack_repo: "b9a42df867ceadbd24fc8e0a50ad756da0591c59",
          distribution_pack_latest_tag: "v0.1.3",
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
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-objective-external-drift-"));
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
        "G-01: 外部 source ledger distribution_pack_repo observed drift expected=b9a42df867ceadbd24fc8e0a50ad756da0591c59 actual=drifted-pack-head",
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("blocks objective external audit when Pack latest tag advances beyond the ledger", () => {
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-objective-external-tag-drift-"));
    try {
      writeFakeGitLsRemote(binDir, "b9a42df867ceadbd24fc8e0a50ad756da0591c59", "v0.1.4");
      const run = runCliIn(repoRoot, ["audit", "objective-external", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload.ok).toBe(false);
      expect(payload.audit.violations).toContain(
        "G-01: 外部 source ledger distribution_pack_latest_tag observed drift expected=v0.1.3 actual=v0.1.4",
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("exposes a completion decision packet for outstanding PO and approval blockers", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-completion-packet-"));
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
        ok: false,
        status: "blocked",
        generatedFrom: "outstanding.completionReadiness",
        sourceCommand: "ut-tdd completion decision-packet --json",
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
                "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
              requiredRecords: ["s4_decision_record"],
            },
            {
              order: 2,
              planId: "PLAN-M-02-fixture",
              decisionKind: "irreversible_migration_signoff",
              scopedPrimaryPacketCommand: "ut-tdd rename plan --json",
              scopedSupportingPacketCommands: [
                "ut-tdd rename plan --json",
                "ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
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
          "ut-tdd s4 decision-packet --json",
          ["ut-tdd s4 decision-packet --json"],
          "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
          ["ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture"],
        ],
        [
          "PLAN-M-02-fixture",
          "ut-tdd rename plan --json",
          ["ut-tdd rename plan --json", "ut-tdd action-binding approval-packet --json"],
          "ut-tdd rename plan --json",
          [
            "ut-tdd rename plan --json",
            "ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
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
        "packet-freshness: source=ut-tdd completion decision-packet --json",
      );
      expect(text.stdout).toContain(
        "human-review-bundle: schema=completion-decision-human-review-bundle.v1 decisions=2 next-authority=human completion-claim-allowed=false",
      );
      expect(text.stdout).toContain(
        "human-review-item: 1 PLAN-DISCOVERY-10-fixture kind=po_s4_decision primary=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain(
        "human-review-item: 2 PLAN-M-02-fixture kind=irreversible_migration_signoff primary=ut-tdd rename plan --json",
      );
      expect(text.stdout).toContain("PLAN-DISCOVERY-10-fixture");
      expect(text.stdout).toContain("PLAN-M-02-fixture");
      expect(text.stdout).toContain(
        "packet-command: primary=ut-tdd s4 decision-packet --json scoped-primary=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture packets=ut-tdd s4 decision-packet --json scoped-packets=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain(
        "runnable-packet-command: primary=bun run ut-tdd s4 decision-packet --json scoped-primary=bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture packets=bun run ut-tdd s4 decision-packet --json scoped-packets=bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture",
      );
      expect(text.stdout).toContain(
        "packet-summary: ut-tdd s4 decision-packet --json runnable=bun run ut-tdd s4 decision-packet --json scoped=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture runnable-scoped=bun run ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-fixture schema=s4-decision-packet.v1 matrix=decisionVerificationCommandMatrix count=8",
      );
      expect(text.stdout).toContain(
        "matrixFields=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact",
      );
      expect(text.stdout).toContain(
        "packet-command: primary=ut-tdd rename plan --json scoped-primary=ut-tdd rename plan --json packets=ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json scoped-packets=ut-tdd rename plan --json | ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(
        "runnable-packet-command: primary=bun run ut-tdd rename plan --json scoped-primary=bun run ut-tdd rename plan --json packets=bun run ut-tdd rename plan --json | bun run ut-tdd action-binding approval-packet --json scoped-packets=bun run ut-tdd rename plan --json | bun run ut-tdd action-binding approval-packet --json --plan PLAN-M-02-fixture",
      );
      expect(text.stdout).toContain(`required-action: ${cutoverDecision.requiredActionsJa[0]}`);
      expect(text.stdout).toContain(
        "required-action-id: record required human/action-binding approval before executing the high-impact action",
      );
      expect(text.stdout).toContain(`required-action: ${cutoverDecision.requiredActionsJa[1]}`);
      expect(text.stdout).toContain(
        "required-action-id: obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
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

  it("exposes action-binding approval packets as a non-destructive planning surface", () => {
    const json = runCli(["action-binding", "approval-packet", "--json"]);

    expect(json.status).toBe(0);
    const packets = JSON.parse(json.stdout);
    expect(packets.map((packet: { planId: string }) => packet.planId)).toEqual([
      "PLAN-DISCOVERY-10-helix-asset-visualization",
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(packets[0]).toMatchObject({
      schemaVersion: "action-binding-approval-packet.v1",
      status: "pending_action_binding_approval",
      planOnly: true,
      mustNotApprove: true,
      approvalCommandAvailable: false,
      approvalAllowed: false,
      allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
    });
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining(["missing concrete approve_action_binding decision"]),
    );
    expect(packets[0].approvalBindingChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "allowed_outcome",
          status: "pending",
        }),
        expect.objectContaining({
          field: "approved_actor",
          status: "pending",
        }),
      ]),
    );
    expect(packets[0].approvalVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "approval-packet-baseline",
          command:
            "bun run src/cli.ts action-binding approval-packet --plan PLAN-DISCOVERY-10-helix-asset-visualization --json",
        }),
        expect.objectContaining({
          phase: "least-privilege-binding",
          sourceUrl: "https://csrc.nist.gov/glossary/term/least_privilege",
        }),
        expect.objectContaining({
          phase: "completion-frontier",
          command: "bun run src/cli.ts status --json",
        }),
      ]),
    );
    expect(packets[0].relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "ut-tdd s4 decision-packet --json",
          scopedCommand:
            "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-helix-asset-visualization",
        }),
      ]),
    );

    const s4Text = runCli([
      "s4",
      "decision-packet",
      "--plan",
      "PLAN-DISCOVERY-10-helix-asset-visualization",
    ]);
    expect(s4Text.status).toBe(0);
    expect(s4Text.stdout).toContain(
      "related-packet: primary ut-tdd s4 decision-packet --json scoped=ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10-helix-asset-visualization",
    );
    expect(s4Text.stdout).toContain(
      "related-packet: supporting ut-tdd action-binding approval-packet --json scoped=ut-tdd action-binding approval-packet --json --plan PLAN-DISCOVERY-10-helix-asset-visualization",
    );

    const text = runCli([
      "action-binding",
      "approval-packet",
      "--plan",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain(
      "action-binding approval-packet: PLAN-M-02-helix-identifier-rename",
    );
    expect(text.stdout).toContain("approvalAllowed=false");
    expect(text.stdout).toContain("approvalCommandAvailable=false");
    expect(text.stdout).toContain(
      "packet-freshness: source=ut-tdd action-binding approval-packet --json",
    );
    expect(text.stdout).toContain("binding-checks:");
    expect(text.stdout).toContain("verification-commands=10");
    expect(text.stdout).toContain("record-template action_binding_approval_record");
    expect(text.stdout).toContain('  - approved_params: "<approved_params>"');
    expect(text.stdout).toContain(
      "verification-source: least-privilege-binding source=NIST least privilege security principle sourceUrl=https://csrc.nist.gov/glossary/term/least_privilege",
    );
    expect(text.stdout).toContain(
      "writePolicy=no-write command=bun run src/cli.ts action-binding approval-packet --plan PLAN-M-02-helix-identifier-rename --json",
    );
    expect(text.stdout).toContain(
      "verification-source: security-boundary source=VS Code Workspace Trust execution boundary sourceUrl=https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
    );
    expect(text.stdout).toContain("binding-check: approved_actor status=pending");
    expect(text.stdout).toContain(
      "related-packet: primary ut-tdd action-binding approval-packet --json scoped=ut-tdd action-binding approval-packet --json --plan PLAN-M-02-helix-identifier-rename",
    );
    expect(text.stdout).toContain(
      "related-packet: supporting ut-tdd rename plan --json scoped=ut-tdd rename plan --json",
    );

    const renameText = runCli(["rename", "plan"]);
    expect(renameText.status).toBe(0);
    expect(renameText.stdout).toContain(
      "related-packet: primary ut-tdd rename plan --json scoped=ut-tdd rename plan --json",
    );
    expect(renameText.stdout).toContain(
      "related-packet: supporting ut-tdd action-binding approval-packet --json scoped=ut-tdd action-binding approval-packet --json --plan PLAN-M-02-helix-identifier-rename",
    );
  }, 20_000);

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
      setupCommand: "ut-tdd setup project",
      futureCommand: "helix setup project",
      githubPlan: {
        schemaVersion: "helix-project-github-plan.v1",
        planOnly: true,
        appliesRemote: false,
        applyCommandAvailable: false,
        workflowPath: ".github/workflows/harness-check.yml",
        requiredChecks: ["harness-check"],
      },
      doctorBaseline: {
        schemaVersion: "helix-project-doctor-baseline.v1",
        planOnly: true,
        baselineCommands: [
          "ut-tdd setup project --dry-run",
          "ut-tdd status --json",
          "ut-tdd setup project --dry-run --json",
          "ut-tdd completion decision-packet --json",
          "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json",
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
      },
      branchProtection: { applied: false, reason: "dry-run" },
      vscode: {
        tasksPath: join(".vscode", "tasks.json"),
        statusTask: "HELIX: status",
        completionDecisionPacketTask: "HELIX: completion decision-packet",
        doctorTask: "HELIX: doctor",
        handoverTask: "HELIX: handover status",
        teamRunTask: "HELIX: team run dry-run",
      },
      baseline: {
        memoryPath: join(".ut-tdd", "memory"),
        handoverPath: join(".ut-tdd", "handover"),
        teamsPath: join(".ut-tdd", "teams"),
      },
      identifierTransition: {
        currentStateDir: ".ut-tdd",
        targetStateDir: ".helix",
        status: "blocked_pending_cutover_approval",
        mustNotApply: true,
        cutoverPlanCommand: "ut-tdd rename plan --json",
      },
      commandAvailability: {
        currentCommand: "ut-tdd setup project",
        futureCommand: "helix setup project",
        futureCommandAvailable: false,
        enablementStatus: "blocked_pending_cutover_approval",
        enablementPacketCommand: "ut-tdd rename plan --json",
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
        join(".ut-tdd", "memory", ".gitkeep"),
        join(".ut-tdd", "handover", ".gitkeep"),
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
          name: "ut-tdd-cli",
        }),
      ]),
    );
    expect(
      payload.consumerReadiness.checks.find(
        (check: { name: string }) => check.name === "ut-tdd-cli",
      )?.message,
    ).toMatch(/projected hooks|bun link ut-tdd|bun run ut-tdd/);
    expect(payload.commandAvailability.currentCommandAvailable).toBe(
      payload.consumerReadiness.checks.find(
        (check: { name: string }) => check.name === "ut-tdd-cli",
      )?.ok ?? false,
    );
    expect(payload.postSetupWorkflow.unmetGates).toEqual(
      expect.arrayContaining(["import_report_review"]),
    );
    expect(payload.postSetupWorkflow.verificationCommands).toEqual([
      "ut-tdd setup project --dry-run",
      "ut-tdd status --json",
      "ut-tdd setup project --dry-run --json",
      "ut-tdd completion decision-packet --json",
      "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json",
      "ut-tdd doctor --profile consumer",
      "ut-tdd rename plan --json",
      "ut-tdd handover status --json",
      "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    ]);
    expect(payload.postSetupWorkflow.verificationMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "setup-dry-run",
          command: "ut-tdd setup project --dry-run",
          writePolicy: "no-write",
        }),
        expect.objectContaining({
          phase: "github-ci-safety",
          command: "ut-tdd setup project --dry-run --json",
          writePolicy: "no-write",
          source: "GitHub Actions secure use and workflow token permissions",
          sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
          adoptionDecision: expect.stringContaining("pull_request_target"),
        }),
        expect.objectContaining({
          phase: "consumer-doctor",
          command: "ut-tdd doctor --profile consumer",
          writePolicy: "no-write",
          source: "VS Code Workspace Trust and consumer adapter safety contract",
          sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
          sourceCheckedAt: "2026-07-02",
          adoptionDecision: expect.stringContaining("task.allowAutomaticTasks=off"),
        }),
        expect.objectContaining({
          phase: "completion-decision-packet",
          command: "ut-tdd completion decision-packet --json",
          writePolicy: "no-write",
          source: "HELIX completion decision packet contract",
        }),
        expect.objectContaining({
          phase: "version-up-dry-run",
          command: "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json",
          writePolicy: "no-write",
          source: "Semantic Versioning 2.0.0 and HELIX version-up dry-run contract",
          sourceUrl: "https://semver.org/",
          sourceCheckedAt: "2026-07-03",
        }),
        expect.objectContaining({
          phase: "team-run-dry-run",
          command:
            "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
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
        "ut-tdd status --json",
        "ut-tdd completion decision-packet --json",
        "ut-tdd doctor --profile consumer",
        "ut-tdd rename plan --json",
        "ut-tdd handover status --json",
        "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
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
    expect(text.stdout).toContain("verification-matrix: 9");
    expect(text.stdout).toContain("post-setup-next-action:");
    expect(text.stdout).toContain("blocked-until:");
    expect(text.stdout).toContain("verification-command: ut-tdd completion decision-packet --json");
    expect(text.stdout).toContain(
      "verification-command: ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json",
    );
    expect(text.stdout).toContain("verification-command: ut-tdd doctor --profile consumer");
    expect(text.stdout).toContain("verification-command: ut-tdd rename plan --json");
    expect(text.stdout).toContain(
      "verification-command: ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
    );
    expect(text.stdout).toContain(
      "verification-check: consumer-doctor availability=post-apply-or-projected requiresMaterializedPaths=AGENTS.md,CLAUDE.md,.claude/CLAUDE.md,.vscode/tasks.json,.vscode/settings.json,.ut-tdd/memory,.ut-tdd/handover,.ut-tdd/evidence,.ut-tdd/teams writePolicy=no-write command=ut-tdd doctor --profile consumer expected=passes the consumer profile",
    );
    expect(text.stdout).toContain(
      "verification-check: completion-decision-packet availability=dry-run-immediate requiresMaterializedPaths=- writePolicy=no-write command=ut-tdd completion decision-packet --json expected=returns completionStatus=blocked",
    );
    expect(text.stdout).toContain(
      "verification-check: identifier-cutover-packet availability=dry-run-immediate requiresMaterializedPaths=- writePolicy=no-write command=ut-tdd rename plan --json expected=returns blocked_pending_cutover_approval",
    );
    expect(text.stdout).toContain(
      "verification-source: setup-dry-run source=VS Code workspace task contract sourceUrl=https://code.visualstudio.com/docs/debugtest/tasks",
    );
    expect(text.stdout).toContain(
      "verification-source: github-ci-safety source=GitHub Actions secure use and workflow token permissions sourceUrl=https://docs.github.com/en/actions/reference/security/secure-use",
    );
    expect(text.stdout).toContain("adoption=harness-check は push/pull_request");
    expect(text.stdout).toContain(
      "writePolicy=no-write command=ut-tdd setup project --dry-run --json",
    );
    expect(text.stdout).toContain("checked=2026-07-02");
    expect(text.stdout).toContain("status=VS Code Tasks official docs current");
    expect(text.stdout).toContain("statusDelta=none; setup keeps generated tasks explicit");
    expect(text.stdout).toContain("adoption=VS Code Tasks は shell task");
    expect(text.stdout).toContain("adoptionDelta=none; keep task projection non-automatic");
    expect(text.stdout).toContain("routeImpact=task contract drift routes to consumer doctor");
    expect(text.stdout).toContain("writePolicy=no-write command=ut-tdd setup project --dry-run");
    expect(text.stdout).toContain(
      "verification-source: consumer-doctor source=VS Code Workspace Trust and consumer adapter safety contract sourceUrl=https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
    );
    expect(text.stdout).toContain("status=VS Code Workspace Trust official docs current");
    expect(text.stdout).toContain("adoption=Workspace Trust の自動コード実行境界");
    expect(text.stdout).toContain("github-plan: helix-project-github-plan.v1 planOnly=true");
    expect(text.stdout).toContain(
      "doctor-baseline: helix-project-doctor-baseline.v1 completionClaimAllowed=false",
    );
    expect(text.stdout).toContain("HELIX: handover status");
    const currentAvailable = payload.commandAvailability.currentCommandAvailable;
    expect(text.stdout).toContain(
      `command-availability: ut-tdd setup project available=${currentAvailable}; helix setup project available=false`,
    );
  }, 15_000);

  it("keeps legacy setup text scoped away from HELIX project completion", () => {
    const text = runCli(["setup", "--dry-run"]);

    expect(text.status).toBe(0);
    expect(text.stdout).toContain("setup-scope: legacy solo/team adapter setup");
    expect(text.stdout).toContain(
      "HELIX project bootstrap は `ut-tdd setup project` を使用してください",
    );
    expect(text.stdout).toContain("completion-boundary:");
    expect(text.stdout).toContain("L14 completion evidence ではありません");
    expect(text.stdout).not.toContain("helix project setup:");
    expect(text.stdout).not.toContain("verification-command: ut-tdd rename plan --json");
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
      command: "ut-tdd",
      checkedFrom: join(process.cwd(), "packages/app"),
      fallbackCommands: expect.arrayContaining([
        "bun run ut-tdd --version",
        "bun run ut-tdd setup project --dry-run --json",
      ]),
    });
    expect(payload.written).toEqual(
      expect.arrayContaining([join(".ut-tdd", "teams", "default-hybrid.yaml")]),
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
    expect(payload.adapterPlan.stdin).toContain("UT-TDD context injection:");
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
    expect(payload.suggest_command).toContain("ut-tdd pair-agent plan --plan-id <PLAN-ID>");
    expect(payload.recommended_command).toMatchObject({
      schema_version: "v1",
      command: "ut-tdd pair-agent plan",
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
      "ut-tdd builder catalog",
    );
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "ut-tdd progress snapshot",
    );
    expect(payload.commands.map((row: { command: string }) => row.command)).toContain(
      "ut-tdd graph export",
    );
  });

  it("exports relation graph diagrams through mermaid, dot, and d2 CLI formats without silent fallback", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-graph-export-"));
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
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-progress-snapshot-"));
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
          artifact_progress_command: "ut-tdd progress artifacts --json",
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
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-cli-dist-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "ut-tdd", "0.1.0");
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.0", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        UT_TDD_CODEX_BIN: fakeCodex,
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
            distributionReference: {
              repo: "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
              mainHead: "b9a42df867ceadbd24fc8e0a50ad756da0591c59",
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
      expect(payload.export.artifactPaths).toContain("LICENSE");
      expect(payload.export.artifactPaths).not.toContain(
        "docs/plans/PLAN-L7-157-distribution-clean-pull.md",
      );
      expect(payload.readiness.rollback.managedPaths).toContain("AGENTS.md");
      expect(payload.readiness.contracts.tagPin).toContain("#v0.1.0");
      expect(payload.readiness.ci.forkPullRequestSecrets).toBe("not-required");
      expect(payload.readiness.ci.packageResolution).toMatchObject({
        command: "bun run ut-tdd --version",
        remediation: expect.stringContaining("consumer package.json"),
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
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-cli-dist-version-drift-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "ut-tdd", "0.1.0");
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.3", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        UT_TDD_CODEX_BIN: fakeCodex,
      });
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(1);
      expect(payload).toMatchObject({
        ok: false,
        export: {
          ok: true,
          sourceTag: "v0.1.3",
        },
        readiness: {
          ok: false,
          objectiveBoundary: {
            versionBinding: {
              localDistributionTag: "v0.1.0",
              requestedDistributionTag: "v0.1.3",
              requestedTagMatchesPackageVersion: false,
              packLatestRequiresVersionUpActivation: true,
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

  it("blocks distribution planning when the bare ut-tdd CLI is not available", () => {
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-cli-dist-missing-"));
    try {
      writeFakeCommand(binDir, "git", "2.0.0");
      writeFakeCommand(binDir, "gh", "2.0.0");
      const fakeCodex = writeFakeProvider(binDir, "codex");
      writeFakeCommand(binDir, "ut-tdd", "not-linked", 127);
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.0", "--json"], {
        ...process.env,
        PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
        UT_TDD_CODEX_BIN: fakeCodex,
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
            name: "ut-tdd-cli",
            ok: false,
          }),
        ]),
      );
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  }, 20_000);

  it("exposes telemetry scan as a JSON command surface without provider CLI execution", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-telemetry-"));
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
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-run-debug-"));
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
        ".ut-tdd/evidence/run-debug/session-1.jsonl",
        "--oracle",
        "U-RUNDEBUG-006",
        "--occurred-at",
        "2026-06-30T00:00:00.000Z",
        "--json",
      ]);
      const payload = JSON.parse(run.stdout);
      const logPath = join(root, ".ut-tdd", "evidence", "run-debug", "runtime-verification.jsonl");
      const rows = readFileSync(logPath, "utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));

      expect(run.status).toBe(0);
      expect(payload.path).toBe(".ut-tdd/evidence/run-debug/runtime-verification.jsonl");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        plan_id: "PLAN-L7-202-run-debug-runtime-verification",
        claim: "works",
        session_id: "session-1",
        source: "run-debug",
        runtime_surface: "ut-tdd-cli",
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
        ".ut-tdd/evidence/run-debug/session-1.jsonl",
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
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-team-"));
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
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-team-exec-"));
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
        UT_TDD_CODEX_BIN: fakeCodex,
        UT_TDD_CLAUDE_BIN: fakeClaude,
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
        readFileSync(join(root, ".ut-tdd", "state", "agent-slots.json"), "utf8"),
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
        "reason=ut-tdd-runtime-adapter-wrapper",
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
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-adapter-exec-"));
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
        UT_TDD_CODEX_BIN: fakeCodex,
        UT_TDD_CLAUDE_BIN: fakeClaude,
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
      mkdirSync(join(root, ".ut-tdd", "memory"), { recursive: true });
      const entry = {
        id: "harness:rule:2026-01-01T00:00:00.000Z",
        layer: "harness",
        key: "rule",
        body: "always inventory existing first",
        supersedes: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      writeFileSync(
        join(root, ".ut-tdd", "memory", "harness.jsonl"),
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
