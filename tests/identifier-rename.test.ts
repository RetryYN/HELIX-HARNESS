import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditIdentifierRenameBlastRadius,
  buildIdentifierRenameCutoverPlan,
} from "../src/lint/identifier-rename";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function runCliIn(cwd: string, args: string[]) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", cliPath, ...args], {
      cwd,
      encoding: "utf8",
      env: process.env,
    });
  }
  return spawnSync("bun", [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: process.env,
  });
}

function writeDraftRenamePlan(root: string) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "status: draft",
      "---",
      "",
      "cutover_decision_record:",
      "- allowed_outcome: `approve_cutover` / `reject_or_defer`",
      "action_binding_approval_record:",
      "- allowed_outcome: `approve_action_binding` / `deny_action`",
      "- approved_actor: No actor is approved by this draft PLAN.",
      "- approved_tool: No migration tool is approved by this draft PLAN.",
      "- approved_target: No irreversible target is approved by this draft PLAN.",
    ].join("\n"),
  );
}

function writeConcreteActorWithOutcomeChoices(root: string) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "status: draft",
      "---",
      "",
      "cutover_decision_record:",
      "- allowed_outcome: `approve_cutover` / `reject_or_defer`",
      "action_binding_approval_record:",
      "- allowed_outcome: `approve_action_binding` / `deny_action`",
      "- approved_actor: codex",
      "- approved_tool: ut-tdd rename apply",
      "- approved_target: .ut-tdd -> .helix",
    ].join("\n"),
  );
}

function writeApprovedRenamePlan(root: string) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "status: confirmed",
      "---",
      "",
      "cutover_decision_record:",
      "- allowed_outcome: approve_cutover",
      "action_binding_approval_record:",
      "- allowed_outcome: approve_action_binding",
      "- approved_actor: codex",
      "- approved_tool: ut-tdd rename apply",
      "- approved_target: .ut-tdd -> .helix",
    ].join("\n"),
  );
}

describe("PLAN-M-02 identifier rename blast-radius audit", () => {
  it("counts ut-tdd/.ut-tdd/area=harness hits and stays blocked without cutover approval", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-audit-"));
    try {
      writeDraftRenamePlan(root);
      mkdirSync(join(root, "src"), { recursive: true });
      writeFileSync(
        join(root, "src", "sample.ts"),
        [
          'const cli = "ut-tdd status";',
          'const state = ".ut-tdd/harness.db";',
          'const marker = "area=harness";',
        ].join("\n"),
      );

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("blocked_pending_cutover_approval");
      expect(audit.cutoverApproved).toBe(false);
      expect(audit.hitsByToken["ut-tdd"]).toBeGreaterThanOrEqual(2);
      expect(audit.hitsByToken[".ut-tdd"]).toBe(1);
      expect(audit.hitsByToken["area=harness"]).toBe(1);
      expect(audit.requiredRecords).toEqual([
        "cutover_decision_record",
        "action_binding_approval_record",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not treat allowed_outcome option lists as concrete cutover approval", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-options-"));
    try {
      writeConcreteActorWithOutcomeChoices(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("blocked_pending_cutover_approval");
      expect(audit.cutoverApproved).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("marks the audit ready only when both approval records contain concrete approved outcomes", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-approved-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("ready_for_cutover");
      expect(audit.cutoverApproved).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes rename audit as a CLI JSON surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-cli-"));
    try {
      writeDraftRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const result = runCliIn(root, ["rename", "audit", "--json"]);
      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload).toMatchObject({
        targetCli: "helix",
        targetStateDir: ".helix",
        status: "blocked_pending_cutover_approval",
        cutoverApproved: false,
      });
      expect(payload.hitsByToken["ut-tdd"]).toBeGreaterThan(0);
      expect(payload.hitsByToken[".ut-tdd"]).toBeGreaterThan(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("builds a non-destructive cutover packet with dry-run, rollback, and monitoring plans", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-"));
    try {
      writeDraftRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root);
      expect(plan).toMatchObject({
        schemaVersion: "identifier-rename-cutover-plan.v1",
        status: "blocked_pending_cutover_approval",
        planOnly: true,
        mustNotApply: true,
        applyCommandAvailable: false,
        applyAuthorized: false,
        targetCli: "helix",
        targetStateDir: ".helix",
      });
      expect(plan.renameMap).toEqual([
        { from: "ut-tdd", to: "helix" },
        { from: ".ut-tdd", to: ".helix" },
        { from: "area=harness", to: "area=helix" },
      ]);
      expect(plan.blockedReasons).toContain(
        "missing concrete cutover_decision_record.allowed_outcome=approve_cutover",
      );
      expect(plan.dryRunPlan.join("\n")).toContain("blast-radius baseline");
      expect(plan.rollbackPlan.join("\n")).toContain(".ut-tdd/harness.db");
      expect(plan.monitoringPlan.join("\n")).toContain("helix doctor");
      expect(plan.stateBackupManifest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".ut-tdd/harness.db",
            restoreRequired: true,
          }),
          expect.objectContaining({
            path: ".ut-tdd/logs",
            restoreRequired: true,
          }),
          expect.objectContaining({
            path: ".ut-tdd/handover",
            restoreRequired: true,
          }),
          expect.objectContaining({
            path: ".codex/hooks.json",
            restoreRequired: true,
          }),
        ]),
      );
      expect(plan.freezePolicy).toMatchObject({
        requiresFrozenHead: true,
        requiresQuietWindow: true,
        concurrencyPolicy: "single-run-no-concurrent-apply",
      });
      expect(plan.freezePolicy.reapprovalTriggers).toEqual(
        expect.arrayContaining([
          "HEAD changes after approval",
          "blast-radius hit set changes after approval",
        ]),
      );
      expect(plan.provenanceRequirements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ item: "blast_radius_baseline" }),
          expect.objectContaining({ item: "state_backup_plan" }),
          expect.objectContaining({ item: "audit_record" }),
          expect.objectContaining({ item: "execution_window_or_freeze_policy" }),
        ]),
      );
      expect(plan.approvalGate).toMatchObject({
        requiredDecision: "approve_cutover",
        requiredActionBinding: "approve_action_binding",
        approvedActorRequired: true,
        approvedToolRequired: true,
        approvedTargetRequired: true,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps rename plan non-applying even when approval records are concrete", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-approved-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root);
      expect(plan.status).toBe("ready_for_cutover_packet");
      expect(plan.applyAuthorized).toBe(true);
      expect(plan.mustNotApply).toBe(true);
      expect(plan.applyCommandAvailable).toBe(false);
      expect(plan.blockedReasons).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes rename plan as a CLI JSON surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-cli-"));
    try {
      writeDraftRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const result = runCliIn(root, ["rename", "plan", "--json"]);
      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload).toMatchObject({
        schemaVersion: "identifier-rename-cutover-plan.v1",
        status: "blocked_pending_cutover_approval",
        planOnly: true,
        mustNotApply: true,
        applyCommandAvailable: false,
      });
      expect(payload.dryRunPlan.length).toBeGreaterThan(0);
      expect(payload.rollbackPlan.length).toBeGreaterThan(0);
      expect(payload.monitoringPlan.length).toBeGreaterThan(0);
      expect(payload.stateBackupManifest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ".ut-tdd/harness.db", restoreRequired: true }),
        ]),
      );
      expect(payload.freezePolicy.concurrencyPolicy).toBe("single-run-no-concurrent-apply");
      expect(payload.provenanceRequirements).toEqual(
        expect.arrayContaining([expect.objectContaining({ item: "audit_record" })]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
