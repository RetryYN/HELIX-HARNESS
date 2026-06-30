import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { auditIdentifierRenameBlastRadius } from "../src/lint/identifier-rename";

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
});
