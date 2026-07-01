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
const CONCRETE_SNAPSHOT_ID =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function nameCutoverSemanticRecord() {
  return {
    recordName: "semantic_feature_frontier_record" as const,
    planId: "PLAN-M-02-helix-identifier-rename",
    featureId: "name_cutover",
    classification: "approval_gated_cutover" as const,
    completionClaimAllowed: false as const,
    blockers: ["human_approval_pending", "irreversible_migration_pending"],
    requiredRoute:
      "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
    reason: "irreversible_migration_pending",
    sourcePaths: [
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/process/forward/L08-L14-verification-phase.md",
    ],
  };
}

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

function writeCutoverSourceLedger(root: string, checkedDate = "2026-06-30"): void {
  mkdirSync(join(root, "docs", "process", "forward"), { recursive: true });
  writeFileSync(
    join(root, "docs", "process", "forward", "L08-L14-verification-phase.md"),
    [
      `Cutover source ledger (checked ${checkedDate}):`,
      "",
      "| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| GitHub Actions concurrency | <https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency> | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | cutover apply must not run concurrently | `execution_window_or_freeze_policy` |",
      "",
    ].join("\n"),
    "utf8",
  );
}

function writeDraftRenamePlan(root: string) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "layer: L14",
      "kind: design",
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
      "layer: L14",
      "kind: design",
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

function writeApprovedRenamePlan(root: string, snapshotId = CONCRETE_SNAPSHOT_ID) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "layer: L14",
      "kind: design",
      "status: confirmed",
      "---",
      "",
      "cutover_decision_record:",
      "- allowed_outcome: approve_cutover",
      "- decision_owner: PO RetryYN",
      `- cutover_snapshot_id: cutoverSnapshot.snapshotId ${snapshotId}`,
      "- trigger_condition: PLAN-L1-06 confirmed and Step 1-6 gates green",
      "- blast_radius_baseline: rename audit JSON at frozen HEAD",
      "- dry_run_plan: codemod/state migration rehearsal evidence .ut-tdd/evidence/rename/dry-run.json",
      "- rollback_plan: pre-cutover branch tag and state restore route",
      "- state_backup_plan: .ut-tdd/harness.db memory state logs handover backup manifest",
      "- execution_window_or_freeze_policy: frozen HEAD quiet window single-run concurrency",
      "- approval_scope: CLI/bin rename and .ut-tdd state dir migration only",
      "- audit_record: approver command result rollback monitoring route",
      "- post_cutover_monitoring: quiet window helix doctor status feedback backlog monitoring",
      "- legacy_alias_policy: temporary ut-tdd alias with sunset PLAN",
      "action_binding_approval_record:",
      "- allowed_outcome: approve_action_binding",
      "- approval_policy_or_named_approver: PO RetryYN",
      "- approval_scope: limited CLI/bin rename and .ut-tdd state dir migration only",
      "- approved_actor: codex",
      "- approved_tool: ut-tdd rename apply",
      "- approved_target: .ut-tdd -> .helix",
      "- approved_params: reviewed command params hash abc123",
      "- review_approval_evidence: dry-run risk review rollback full test doctor evidence",
      `- reviewed_snapshot_binding: cutoverSnapshot.snapshotId ${snapshotId}`,
      "- expires_at_or_trigger: expires if HEAD scope evidence or quiet window changes",
      "- audit_record: approver action command result incident rollback route",
    ].join("\n"),
  );
}

function writeMinimalApprovedRenamePlan(root: string) {
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md"),
    [
      "---",
      "plan_id: PLAN-M-02-helix-identifier-rename",
      "layer: L14",
      "kind: design",
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
      mkdirSync(join(root, "tests"), { recursive: true });
      mkdirSync(join(root, "docs", "templates", "adapter"), { recursive: true });
      mkdirSync(join(root, ".ut-tdd", "state"), { recursive: true });
      mkdirSync(join(root, ".codex"), { recursive: true });
      writeFileSync(
        join(root, "src", "sample.ts"),
        [
          'const cli = "ut-tdd status";',
          'const state = ".ut-tdd/harness.db";',
          'const marker = "area=harness";',
        ].join("\n"),
      );
      writeFileSync(join(root, "tests", "sample.test.ts"), 'expect(".ut-tdd").toBeTruthy();\n');
      writeFileSync(
        join(root, "docs", "templates", "adapter", "AGENTS.md"),
        "Generated projects use ut-tdd until cutover.\n",
      );
      writeFileSync(join(root, ".ut-tdd", "state", "setup.json"), '{"cli":"ut-tdd"}\n');
      writeFileSync(join(root, ".codex", "hooks.json"), '{"marker":"area=harness"}\n');

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("blocked_pending_cutover_approval");
      expect(audit.cutoverApproved).toBe(false);
      expect(audit.hitsByToken["ut-tdd"]).toBeGreaterThanOrEqual(2);
      expect(audit.hitsByToken[".ut-tdd"]).toBeGreaterThanOrEqual(2);
      expect(audit.hitsByToken["area=harness"]).toBe(2);
      expect(audit.hits).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "src/sample.ts", category: "source_code" }),
          expect.objectContaining({ path: "tests/sample.test.ts", category: "test_code" }),
          expect.objectContaining({
            path: "docs/templates/adapter/AGENTS.md",
            category: "consumer_template",
          }),
          expect.objectContaining({
            path: ".ut-tdd/state/setup.json",
            category: "runtime_state",
          }),
          expect.objectContaining({ path: ".codex/hooks.json", category: "adapter_config" }),
        ]),
      );
      for (const category of [
        "source_code",
        "test_code",
        "consumer_template",
        "runtime_state",
        "adapter_config",
      ]) {
        expect(audit.hitsByCategory).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ category, files: 1, hits: expect.any(Number) }),
          ]),
        );
        expect(
          audit.hitsByCategory.find((entry) => entry.category === category)?.hits,
        ).toBeGreaterThan(0);
      }
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

  it("marks the audit ready only when both approval records contain full concrete approval evidence", () => {
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

  it("does not authorize rename cutover with outcomes plus actor/tool/target only", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-minimal-approved-"));
    try {
      writeMinimalApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()]);
      expect(plan.status).toBe("blocked_pending_cutover_approval");
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          "missing concrete cutover_decision_record.cutover_snapshot_id sha256 snapshot id",
          "missing concrete action_binding_approval_record.approved_params",
          "missing concrete action_binding_approval_record.reviewed_snapshot_binding sha256 snapshot id",
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes rename audit as a CLI JSON surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-cli-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
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
      expect(payload.hitsByCategory).toEqual(
        expect.arrayContaining([expect.objectContaining({ category: "adapter_config" })]),
      );

      const text = runCliIn(root, ["rename", "audit"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain("category adapter_config:");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("builds a non-destructive cutover packet with dry-run, rollback, and monitoring plans", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
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
      expect(plan.semanticFeatureFrontierRecord).toMatchObject({
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-M-02-helix-identifier-rename",
        featureId: "name_cutover",
        classification: "approval_gated_cutover",
        completionClaimAllowed: false,
      });
      expect(plan.blockedReasons).toContain(
        "missing concrete cutover_decision_record.allowed_outcome=approve_cutover",
      );
      expect(plan.hitsByCategory).toEqual(
        expect.arrayContaining([expect.objectContaining({ category: "adapter_config" })]),
      );
      expect(plan.cutoverCategoryChecklist).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "adapter_config",
            cutoverAction: expect.stringContaining("adapter markers"),
          }),
        ]),
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
      expect(plan.cutoverSnapshot).toMatchObject({
        snapshotId: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        blastRadiusDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        approvalScopeDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        evidenceDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        sourceLedgerCheckedDate: "2026-06-30",
        invalidatedBy: plan.freezePolicy.reapprovalTriggers,
      });
      expect(plan.generatedAt).toEqual(expect.any(String));
      expect(plan.sourceCommand).toBe("ut-tdd rename plan --json");
      expect(plan.freshness).toEqual({
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      });
      expect(plan.provenanceRequirements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ item: "blast_radius_baseline" }),
          expect.objectContaining({ item: "state_backup_plan" }),
          expect.objectContaining({ item: "audit_record" }),
          expect.objectContaining({ item: "execution_window_or_freeze_policy" }),
        ]),
      );
      expect(plan.relatedDecisionPackets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: "primary",
            command: "ut-tdd rename plan --json",
          }),
          expect.objectContaining({
            role: "supporting",
            command: "ut-tdd action-binding approval-packet --json",
          }),
        ]),
      );
      expect(plan.approvalGate).toMatchObject({
        requiredDecision: "approve_cutover",
        requiredActionBinding: "approve_action_binding",
        approvedActorRequired: true,
        approvedToolRequired: true,
        approvedTargetRequired: true,
        approvedParamsRequired: true,
        reviewedSnapshotBindingRequired: true,
      });

      const beforeDigest = plan.cutoverSnapshot.blastRadiusDigest;
      writeFileSync(join(root, "README.md"), "Additional ut-tdd mention after baseline.\n");
      const changedPlan = buildIdentifierRenameCutoverPlan(root);
      expect(changedPlan.cutoverSnapshot.blastRadiusDigest).not.toBe(beforeDigest);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps rename plan blocked when concrete approval records cite a stale cutover snapshot", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-approved-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()]);
      expect(plan.status).toBe("blocked_pending_cutover_approval");
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.mustNotApply).toBe(true);
      expect(plan.applyCommandAvailable).toBe(false);
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          "cutover_decision_record.cutover_snapshot_id does not match current cutoverSnapshot.snapshotId",
          "action_binding_approval_record.reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId",
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("authorizes only when concrete approval records cite the current cutover snapshot", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-current-snapshot-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const currentSnapshotId = buildIdentifierRenameCutoverPlan(root, [
        nameCutoverSemanticRecord(),
      ]).cutoverSnapshot.snapshotId;
      writeApprovedRenamePlan(root, currentSnapshotId);
      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()]);

      expect(plan.status).toBe("ready_for_cutover_packet");
      expect(plan.applyAuthorized).toBe(true);
      expect(plan.blockedReasons).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("blocks rename cutover packets that are detached from the name_cutover semantic frontier", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-no-frontier-"));
    try {
      writeDraftRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root, []);
      expect(plan.semanticFeatureFrontierRecord).toMatchObject({
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-M-02-helix-identifier-rename",
        featureId: "name_cutover",
        classification: "approval_gated_cutover",
        completionClaimAllowed: false,
        reason: "missing_semantic_feature_frontier_record",
      });
      expect(plan.blockedReasons).toContain(
        "missing semantic_feature_frontier_record for approval_gated_cutover",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("blocks rename cutover packets whose semantic frontier classification or source path drifts", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-wrong-frontier-"));
    try {
      writeDraftRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const wrongClassification = buildIdentifierRenameCutoverPlan(root, [
        { ...nameCutoverSemanticRecord(), classification: "parked_future_version" },
      ]);
      expect(wrongClassification.blockedReasons).toContain(
        "semantic_feature_frontier_record classification parked_future_version expected approval_gated_cutover",
      );

      const missingL3 = buildIdentifierRenameCutoverPlan(root, [
        {
          ...nameCutoverSemanticRecord(),
          sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
        },
      ]);
      expect(missingL3.blockedReasons).toContain(
        "semantic_feature_frontier_record sourcePaths must include docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      );
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
        generatedAt: expect.any(String),
        sourceCommand: "ut-tdd rename plan --json",
        freshness: {
          validForMinutes: 1440,
          expiresAt: expect.any(String),
          stale: false,
          policy: "decision-packet-freshness.v1",
        },
        planOnly: true,
        mustNotApply: true,
        applyCommandAvailable: false,
      });
      expect(payload.hitsByCategory.length).toBeGreaterThan(0);
      expect(payload.cutoverCategoryChecklist.length).toBeGreaterThan(0);
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
