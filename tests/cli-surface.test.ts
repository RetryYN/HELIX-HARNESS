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

describe("L7 CLI surface closure", () => {
  it("U-HOVER-018: exposes normal handover status as a read-only JSON preflight surface", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-cli-handover-status-"));
    try {
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

      const text = runCliIn(root, ["handover", "status"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain(
        "handover status: active=PLAN-L7-04-handover-mechanism status=in_progress stale=false",
      );
      expect(text.stdout).toContain("latest_doc:");

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
          "irreversible cutover requires PO signoff.",
        ].join("\n"),
        "utf8",
      );

      const blockedJson = runCliIn(blockedRoot, ["status", "--json"]);
      expect(blockedJson.status).toBe(0);
      const blockedPayload = JSON.parse(blockedJson.stdout);
      expect(blockedPayload.nextAction).toEqual(expect.stringMatching(/^[a-z][a-z-]*: /));
      expect(blockedPayload.workflowNextAction).toContain(
        "obtain explicit PO signoff before irreversible migration/cutover",
      );
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
        decisionCount: 1,
      });
      expect(blockedPayload.completionDecisionPacket.generatedAt).toEqual(expect.any(String));
      expect(blockedPayload.completionDecisionPacket.freshness.expiresAt).toEqual(
        expect.any(String),
      );
      expect(blockedPayload.completionDecisionPacket.decisions[0]).toMatchObject({
        planId: "PLAN-M-02-fixture",
        decisionKind: "irreversible_migration_signoff",
      });

      const blockedText = runCliIn(blockedRoot, ["status"]);
      expect(blockedText.status).toBe(0);
      expect(blockedText.stdout).toContain("workflow-next: completion-blocked:");
      expect(blockedText.stdout).toContain("completion: blocked");
      expect(blockedText.stdout).toContain(
        "decision-packet: ut-tdd completion decision-packet --json",
      );
    } finally {
      rmSync(readyRoot, { recursive: true, force: true });
      rmSync(blockedRoot, { recursive: true, force: true });
    }
  }, 15_000);

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
          "irreversible cutover requires PO signoff and rollback evidence.",
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
      });
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
      expect(packet.decisions[0].requiredRecords[0]).toMatchObject({
        recordName: "s4_decision_record",
        sourcePaths: ["docs/process/modes/discovery.md", "docs/process/modes/scrum.md"],
      });
      expect(packet.decisions[0].requiredRecords[0].fields).toContain("verified_evidence");
      expect(packet.decisions[1].requiredRecords[0]).toMatchObject({
        recordName: "cutover_decision_record",
        sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
      });
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
      expect(text.stdout).toContain("completion decision-packet: blocked decisions=2");
      expect(text.stdout).toContain("PLAN-DISCOVERY-10-fixture");
      expect(text.stdout).toContain("PLAN-M-02-fixture");
      expect(text.stdout).toContain("record-outcomes cutover_decision_record");
      expect(text.stdout).toContain("record-route cutover_decision_record");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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
    expect(payload.checks).toContain("bun run src\\cli.ts doctor");
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
      const fakeCodex = writeFakeProvider(binDir, "codex");
      const run = runCliIn(repoRoot, ["distribution", "plan", "--tag", "v0.1.0", "--json"], {
        ...process.env,
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
        },
      });
      expect(payload.export.artifactPaths).toContain("LICENSE");
      expect(payload.export.artifactPaths).not.toContain(
        "docs/plans/PLAN-L7-157-distribution-clean-pull.md",
      );
      expect(payload.readiness.rollback.managedPaths).toContain("AGENTS.md");
      expect(payload.readiness.contracts.tagPin).toContain("#v0.1.0");
      expect(payload.readiness.ci.forkPullRequestSecrets).toBe("not-required");
    } finally {
      rmSync(join(repoRoot, "codex-env.txt"), { force: true });
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
