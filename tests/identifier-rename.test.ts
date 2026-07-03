import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditIdentifierRenameBlastRadius,
  buildIdentifierRenameCutoverPlan,
  buildIdentifierRenameDistSmokeDryRun,
  buildIdentifierRenameEvidencePack,
  type IdentifierRenameWorktreeSnapshot,
  identifierRenameRunbookCommandViolations,
  identifierRenameStateBackupManifestViolations,
  identifierRenameVerificationCommandViolations,
} from "../src/lint/identifier-rename";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const CONCRETE_SNAPSHOT_ID =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_HEAD_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_TEST_HEAD_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const CLEAN_WORKTREE: IdentifierRenameWorktreeSnapshot = {
  readable: true,
  clean: true,
  statusDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  dirtyPathCount: 0,
  dirtyPaths: [],
};
const DIRTY_WORKTREE: IdentifierRenameWorktreeSnapshot = {
  readable: true,
  clean: false,
  statusDigest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  dirtyPathCount: 1,
  dirtyPaths: ["README.md"],
};

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

function writeCutoverSourceLedger(root: string, checkedDate = "2026-07-02"): void {
  mkdirSync(join(root, "docs", "process", "forward"), { recursive: true });
  writeFileSync(
    join(root, "docs", "process", "forward", "L08-L14-verification-phase.md"),
    [
      `Cutover source ledger (checked ${checkedDate}):`,
      "",
      "| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 | Rev. 1 draft | adopt-final-1.1 | release integrity | `audit_record`, `state_backup_plan`, `blast_radius_baseline` |",
      "| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding approval | `decision_owner`, `allowed_outcome`, `approval_policy_or_named_approver`, `approval_scope`, `approved_actor`, `approved_tool`, `approved_target`, `approved_params`, `review_approval_evidence`, `expires_at_or_trigger` |",
      "| GitHub Actions concurrency | <https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs> | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | cutover apply must not run concurrently | `execution_window_or_freeze_policy` |",
      "| GitHub repository rename | <https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository> | live GitHub repository rename docs | live official GitHub docs; redirects and Pages exception documented | adopt-live-docs-for-repository-rename-redirect-review | review repo/package/docs references and remote update before external rename | `blast_radius_baseline`, `rollback_plan`, `post_cutover_monitoring`, `legacy_alias_policy` |",
      "| VS Code Tasks and Workspace Trust automatic task execution | <https://code.visualstudio.com/docs/debugtest/tasks> / <https://code.visualstudio.com/docs/editing/workspaces/workspace-trust> | live VS Code Tasks / Workspace Trust docs | live official VS Code docs | adopt-live-docs-for-consumer-task-execution-boundary | consumer template and `.vscode/tasks.json` automatic execution boundary | `blast_radius_baseline`, `approval_scope`, `post_cutover_monitoring`, `legacy_alias_policy` |",
      "| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | SRE book | live official Google SRE book | adopt-operational-guidance | rollback and release process | `dry_run_plan`, `rollback_plan`, `post_cutover_monitoring` |",
      "| Google SRE Canarying Releases | <https://sre.google/workbook/canarying-releases/> | SRE workbook canarying chapter | live official Google SRE workbook | adopt-canary-risk-reduction-for-staged-cutover-review | staged exposure, health comparison, rollback trigger review before full cutover | `dry_run_plan`, `post_cutover_monitoring`, `rollback_plan` |",
      "| Microsoft Safe Deployment Practices | <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments> | Azure Well-Architected safe deployment guidance | live official Microsoft Learn guidance | adopt-safe-deployment-risk-controls | progressive exposure, health model, rollback and blast-radius reduction for L14 cutover | `execution_window_or_freeze_policy`, `post_cutover_monitoring`, `rollback_plan` |",
      "| Microsoft Testing Strategy | <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/testing> | Azure Well-Architected testing guidance | live official Microsoft Learn guidance | adopt-testing-strategy-for-cutover-evidence | pre-release security/regression/load evidence before irreversible state move | `dry_run_plan`, `audit_record`, `blast_radius_baseline` |",
      "| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 entry | 2025 official LLM risk entry | adopt-2025-entry | constrained authority | `approval_scope`, `legacy_alias_policy`, `audit_record` |",
      "| SLSA Provenance | <https://slsa.dev/spec/v1.2/provenance> | SLSA Provenance v1.2 | current SLSA provenance specification | adopt-v1.2-for-cutover-artifact-provenance | reproducible cutover provenance | `audit_record`, `blast_radius_baseline`, `state_backup_plan` |",
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
      "- source_ledger_freshness: fresh Cutover source ledger checked 2026-07-02",
      "- source_status_delta: none; live source status reviewed for cutover",
      "- adoption_decision_delta: none; adoption decisions unchanged for cutover",
      "- workflow_route_impact: none; L14 cutover route remains approval-gated",
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

function writeCutoverEvidenceArtifacts(root: string) {
  const paths = [
    ".ut-tdd/evidence/rename/blast-radius-baseline.json",
    ".ut-tdd/evidence/rename/codemod-rehearsal.json",
    ".ut-tdd/evidence/rename/github-repository-redirect-review.json",
    ".ut-tdd/evidence/rename/state-backup-restore-drill.json",
    ".ut-tdd/evidence/rename/static-state-gates.txt",
    ".ut-tdd/evidence/rename/dist-smoke-rehearsal.txt",
    ".ut-tdd/evidence/rename/full-regression.txt",
    ".ut-tdd/evidence/rename/restore-harness-db.json",
    ".ut-tdd/evidence/rename/restore-memory.json",
    ".ut-tdd/evidence/rename/restore-state.json",
    ".ut-tdd/evidence/rename/restore-logs.json",
    ".ut-tdd/evidence/rename/restore-handover.json",
    ".ut-tdd/evidence/rename/restore-provider-handover.json",
    ".ut-tdd/evidence/rename/restore-approval-policy.json",
    ".ut-tdd/evidence/rename/restore-claude-settings.json",
    ".ut-tdd/evidence/rename/restore-codex-hooks.json",
  ];
  for (const path of paths) {
    const absolutePath = join(root, path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, `${JSON.stringify({ path, ok: true })}\n`, "utf8");
  }
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
      mkdirSync(join(root, "scripts"), { recursive: true });
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
        join(root, "scripts", "ut-tdd"),
        '#!/usr/bin/env bash\nexec bun run src/cli.ts "$@" # ut-tdd wrapper\n',
      );
      writeFileSync(join(root, ".gitignore"), ".ut-tdd/backups/\n");
      writeFileSync(
        join(root, "docs", "templates", "adapter", "AGENTS.md"),
        "Generated projects use ut-tdd until cutover.\n",
      );
      writeFileSync(join(root, ".ut-tdd", "state", "setup.json"), '{"cli":"ut-tdd"}\n');
      writeFileSync(join(root, ".codex", "hooks.json"), '{"marker":"area=harness"}\n');

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("blocked_pending_cutover_approval");
      expect(audit.cutoverApproved).toBe(false);
      expect(audit.approvalRecordsConcrete).toBe(false);
      expect(audit.hitsByToken["ut-tdd"]).toBeGreaterThanOrEqual(2);
      expect(audit.hitsByToken[".ut-tdd"]).toBeGreaterThanOrEqual(2);
      expect(audit.hitsByToken["area=harness"]).toBe(2);
      expect(audit.hits).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "src/sample.ts", category: "source_code" }),
          expect.objectContaining({ path: "tests/sample.test.ts", category: "test_code" }),
          expect.objectContaining({
            path: "scripts/ut-tdd",
            category: "distribution_surface",
          }),
          expect.objectContaining({
            path: ".gitignore",
            category: "distribution_surface",
          }),
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
        "distribution_surface",
      ]) {
        expect(audit.hitsByCategory).toEqual(
          expect.arrayContaining([expect.objectContaining({ category, hits: expect.any(Number) })]),
        );
        expect(
          audit.hitsByCategory.find((entry) => entry.category === category)?.hits,
        ).toBeGreaterThan(0);
        expect(
          audit.hitsByCategory.find((entry) => entry.category === category)?.files,
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
      expect(audit.approvalRecordsConcrete).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps audit blocked even when approval records are concrete because snapshot freshness belongs to rename plan", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-approved-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const audit = auditIdentifierRenameBlastRadius(root);
      expect(audit.status).toBe("blocked_pending_cutover_approval");
      expect(audit.cutoverApproved).toBe(false);
      expect(audit.approvalRecordsConcrete).toBe(true);
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
        approvalRecordsConcrete: false,
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

  it("U-DECISIONREC-010/U-DECISIONREC-011: builds a non-destructive cutover packet with snapshot review, category samples, verification commands, dry-run, rollback, and monitoring plans", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root, undefined, TEST_HEAD_SHA);
      expect(plan).toMatchObject({
        schemaVersion: "identifier-rename-cutover-plan.v1",
        status: "blocked_pending_cutover_approval",
        planOnly: true,
        mustNotApply: true,
        applyCommandAvailable: false,
        approvalMaterialReady: false,
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
            samplePaths: expect.arrayContaining(["AGENTS.md"]),
            cutoverAction: expect.stringContaining("adapter markers"),
            verificationCommand: "bun run src/cli.ts doctor",
          }),
        ]),
      );
      expect(plan.verificationCommandMatrix).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            phase: "baseline",
            command: "bun run src/cli.ts rename audit --json",
            writePolicy: "no-write",
            sourceUrl: "docs/process/forward/L08-L14-verification-phase.md",
            sourceCheckedAt: "2026-07-02",
            latestOfficialStatus: expect.stringContaining("Microsoft safe deployment/testing"),
            sourceStatusDelta: expect.stringContaining("90-day freshness"),
            adoptionDecision: "adopt-cutover-source-ledger-for-l14-approval-review",
            adoptionDecisionDelta: expect.stringContaining("approval-gated"),
            workflowRouteImpact: expect.stringContaining("request_runbook_changes"),
          }),
          expect.objectContaining({
            phase: "repository-redirect-review",
            command: "bun run src/cli.ts rename plan --json",
            writePolicy: "no-write",
            source: "GitHub repository rename",
            sourceUrl:
              "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
            latestOfficialStatus: expect.stringContaining("project site URLs are an exception"),
            adoptionDecision: "adopt-live-docs-for-repository-rename-redirect-review",
            workflowRouteImpact: expect.stringContaining("distribution references"),
          }),
          expect.objectContaining({
            phase: "targeted-regression",
            command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts",
            writePolicy: "no-write",
            sourceCheckedAt: "2026-07-02",
            adoptionDecision: "adopt-targeted-regression-before-cutover-approval-review",
          }),
          expect.objectContaining({
            phase: "current-dist-smoke",
            command: "bun run build && ./dist/ut-tdd doctor",
            writePolicy: "local-artifact-write",
            sourceUrl: "docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md",
            sourceStatusDelta: expect.stringContaining("pre-cutover baseline"),
          }),
          expect.objectContaining({
            phase: "renamed-helix-dist-smoke",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
            writePolicy: "no-write",
            adoptionDecision: "adopt-renamed-helix-dist-smoke-as-cutover-rehearsal-only",
            workflowRouteImpact: expect.stringContaining("does not authorize apply"),
          }),
          expect.objectContaining({
            phase: "post-cutover-consumer-setup-smoke",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
            writePolicy: "no-write",
            expected: expect.stringContaining("helix setup project dry-run smoke"),
            evidence: expect.stringContaining("postCutoverConsumerSetupPreview"),
            source: "HELIX project setup command transition contract",
            sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
            adoptionDecision: "adopt-post-cutover-helix-setup-smoke-as-cutover-review-material",
            workflowRouteImpact: expect.stringContaining("request_runbook_changes"),
          }),
          expect.objectContaining({
            phase: "legacy-alias-smoke",
            command: "bun run build && ./dist/ut-tdd doctor",
            writePolicy: "local-artifact-write",
            adoptionDecision: expect.stringContaining("legacy-alias-smoke"),
          }),
        ]),
      );
      for (const row of plan.verificationCommandMatrix) {
        expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(row.sourceCheckedAt, row.phase).toBe(plan.sourceLedgerFreshness.checkedDate);
        expect(row.writePolicy, row.phase).toMatch(/^(no-write|state-write|local-artifact-write)$/);
        expect(row.latestOfficialStatus, row.phase).not.toBe("");
        expect(row.sourceStatusDelta, row.phase).not.toBe("");
        expect(row.adoptionDecision, row.phase).not.toBe("");
        expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
        expect(row.workflowRouteImpact, row.phase).not.toBe("");
      }
      expect(plan.verificationCommandMatrix).toHaveLength(10);
      expect(identifierRenameVerificationCommandViolations(plan)).toEqual([]);
      expect(
        identifierRenameVerificationCommandViolations({
          verificationCommandMatrix: plan.verificationCommandMatrix.map((row) =>
            row.phase === "renamed-helix-dist-smoke"
              ? { ...row, command: "bun run build && ./dist/ut-tdd doctor" }
              : row,
          ),
        }),
      ).toEqual([
        {
          subject: "renamed-helix-dist-smoke",
          reason:
            "verificationCommandMatrix command is not an executable approved surface for its writePolicy: bun run build && ./dist/ut-tdd doctor",
        },
        {
          subject: "renamed-helix-dist-smoke",
          reason:
            "verificationCommandMatrix no-write command may write local state or artifacts: bun run build && ./dist/ut-tdd doctor",
        },
      ]);
      expect(
        identifierRenameVerificationCommandViolations({
          verificationCommandMatrix: plan.verificationCommandMatrix.map((row) =>
            row.phase === "current-dist-smoke"
              ? {
                  ...row,
                  command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
                }
              : row,
          ),
        }),
      ).toEqual([
        {
          subject: "current-dist-smoke",
          reason:
            "verificationCommandMatrix command is not an executable approved surface for its writePolicy: bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
        },
        {
          subject: "current-dist-smoke",
          reason:
            "verificationCommandMatrix local-artifact-write command must be explicit about local artifact output: bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
        },
      ]);
      expect(
        identifierRenameVerificationCommandViolations({
          verificationCommandMatrix: plan.verificationCommandMatrix.map((row) =>
            row.phase === "baseline"
              ? {
                  ...row,
                  sourceCheckedAt: "2026-01-01",
                }
              : row,
          ),
        }),
      ).toEqual([
        {
          subject: "baseline",
          reason: expect.stringMatching(
            /^verificationCommandMatrix sourceCheckedAt is stale: 2026-01-01 \(\d+d > 90d\)$/,
          ),
        },
      ]);
      expect(
        identifierRenameVerificationCommandViolations({
          verificationCommandMatrix: plan.verificationCommandMatrix.map((row) =>
            row.phase === "baseline"
              ? {
                  ...row,
                  sourceCheckedAt: "2999-01-01",
                }
              : row,
          ),
        }),
      ).toEqual([
        {
          subject: "baseline",
          reason: "verificationCommandMatrix sourceCheckedAt is in the future: 2999-01-01",
        },
      ]);
      expect(
        identifierRenameVerificationCommandViolations({
          verificationCommandMatrix: plan.verificationCommandMatrix.map((row) =>
            row.phase === "baseline"
              ? {
                  ...row,
                  latestOfficialStatus: "TODO",
                  workflowRouteImpact: "-",
                }
              : row,
          ),
        }),
      ).toEqual([
        {
          subject: "baseline",
          reason: "verificationCommandMatrix latestOfficialStatus is missing or placeholder",
        },
        {
          subject: "baseline",
          reason: "verificationCommandMatrix workflowRouteImpact is missing or placeholder",
        },
      ]);
      expect(plan.recordTemplates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recordName: "cutover_decision_record",
            yamlLines: expect.arrayContaining([
              "cutover_decision_record:",
              '  - cutover_snapshot_id: "<cutoverSnapshot.snapshotId>"',
            ]),
          }),
          expect.objectContaining({
            recordName: "action_binding_approval_record",
            yamlLines: expect.arrayContaining([
              "action_binding_approval_record:",
              '  - reviewed_snapshot_binding: "<activationSnapshot.snapshotId|cutoverSnapshot.snapshotId|no-snapshot basis>"',
            ]),
          }),
        ]),
      );
      expect(plan.sourceLedgerFreshness).toEqual({
        ledgerLabel: "Cutover source ledger",
        checkedDate: "2026-07-02",
        stale: false,
        violation: null,
        maxAgeDays: 90,
        rowCount: 11,
        missingRows: [],
        rowViolations: [],
        rowsDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      });
      expect(plan.cutoverRunbook).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "cutover-rb-01",
            writePolicy: "no-write",
            evidencePath: ".ut-tdd/evidence/rename/blast-radius-baseline.json",
          }),
          expect.objectContaining({
            id: "cutover-rb-04",
            phase: "static-and-state-gates",
            writePolicy: "state-write",
          }),
          expect.objectContaining({
            id: "cutover-rb-03",
            phase: "state-backup-restore-drill",
            command: "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
          }),
          expect.objectContaining({
            id: "cutover-rb-02a",
            phase: "repository-redirect-and-remote-review",
            command: "bun run src/cli.ts rename plan --json",
            writePolicy: "no-write",
            evidencePath: ".ut-tdd/evidence/rename/github-repository-redirect-review.json",
            source: "GitHub repository rename",
          }),
          expect.objectContaining({
            id: "cutover-rb-05",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
            passCriteria: expect.stringContaining("post-cutover consumer setup smoke"),
          }),
        ]),
      );
      expect(identifierRenameRunbookCommandViolations(plan)).toEqual([]);
      expect(
        identifierRenameRunbookCommandViolations({
          cutoverRunbook: plan.cutoverRunbook.map((step) =>
            step.id === "cutover-rb-02"
              ? { ...step, command: "ut-tdd rename rehearsal --no-write --target helix" }
              : step,
          ),
        }),
      ).toEqual([
        {
          subject: "cutover-rb-02",
          reason:
            "cutoverRunbook command is not an executable approved surface for its writePolicy: ut-tdd rename rehearsal --no-write --target helix",
        },
      ]);
      expect(
        identifierRenameRunbookCommandViolations({
          cutoverRunbook: plan.cutoverRunbook.map((step) =>
            step.id === "cutover-rb-02"
              ? { ...step, command: "bun run build && ./dist/ut-tdd doctor" }
              : step,
          ),
        }),
      ).toEqual([
        {
          subject: "cutover-rb-02",
          reason:
            "cutoverRunbook command is not an executable approved surface for its writePolicy: bun run build && ./dist/ut-tdd doctor",
        },
        {
          subject: "cutover-rb-02",
          reason:
            "cutoverRunbook no-write command may write local state or artifacts: bun run build && ./dist/ut-tdd doctor",
        },
      ]);
      expect(
        identifierRenameRunbookCommandViolations({
          cutoverRunbook: plan.cutoverRunbook.map((step) =>
            step.id === "cutover-rb-01"
              ? {
                  ...step,
                  evidencePath:
                    "https://example.invalid/review the blast radius evidence before approval",
                }
              : step,
          ),
        }),
      ).toEqual([
        {
          subject: "cutover-rb-01",
          reason:
            "cutoverRunbook.evidencePath must be a repo-local relative path, not a URL: https://example.invalid/review the blast radius evidence before approval",
        },
      ]);
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
            restoreDrillRequired: true,
          }),
          expect.objectContaining({
            path: ".ut-tdd/handover/provider",
            restoreEvidencePath: ".ut-tdd/evidence/rename/restore-provider-handover.json",
          }),
          expect.objectContaining({
            path: ".ut-tdd/config/approval-policy.yaml",
            checksumRequired: true,
          }),
          expect.objectContaining({
            path: ".codex/hooks.json",
            restoreRequired: true,
          }),
        ]),
      );
      expect(identifierRenameStateBackupManifestViolations(plan)).toEqual([]);
      expect(
        identifierRenameStateBackupManifestViolations({
          stateBackupManifest: plan.stateBackupManifest.map((entry) =>
            entry.path === ".ut-tdd/harness.db"
              ? {
                  ...entry,
                  backupTargetPattern: "../outside/harness.db",
                  restoreEvidencePath: "review restore drill evidence in the approval packet",
                  restoreRequired: false as true,
                }
              : entry,
          ),
        }),
      ).toEqual([
        {
          subject: ".ut-tdd/harness.db",
          reason:
            "stateBackupManifest.backupTargetPattern must not traverse outside the repository: ../outside/harness.db",
        },
        {
          subject: ".ut-tdd/harness.db",
          reason:
            "stateBackupManifest.restoreEvidencePath must be a concrete repo-local artifact path, not prose: review restore drill evidence in the approval packet",
        },
        {
          subject: ".ut-tdd/harness.db",
          reason: "stateBackupManifest.restoreRequired must be true",
        },
      ]);
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
        repoHeadSha: TEST_HEAD_SHA,
        headDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        worktreeStatusReadable: false,
        worktreeClean: false,
        worktreeStatusDigest: null,
        worktreeDirtyPathCount: 0,
        worktreeDirtyPaths: [],
        blastRadiusDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        approvalScopeDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        evidenceDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        evidenceArtifactsDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        evidenceArtifactsRequired: 16,
        evidenceArtifactsPresent: 0,
        missingEvidenceArtifacts: expect.arrayContaining([
          ".ut-tdd/evidence/rename/blast-radius-baseline.json",
          ".ut-tdd/evidence/rename/restore-harness-db.json",
        ]),
        sourceLedgerCheckedDate: "2026-07-02",
        sourceLedgerRowsDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        invalidatedBy: plan.freezePolicy.reapprovalTriggers,
      });
      expect(plan.snapshotReview).toMatchObject({
        recordedCutoverSnapshotId: null,
        recordedActionBindingSnapshotId: null,
        currentSnapshotId: plan.cutoverSnapshot.snapshotId,
        cutoverSnapshotMatchesCurrent: false,
        actionBindingSnapshotMatchesCurrent: false,
        driftWarning: null,
      });
      expect(plan.snapshotReview.requiredAction).toContain(
        "current cutoverSnapshot.snapshotId before approval",
      );
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
            scopedCommand: "ut-tdd rename plan --json",
          }),
          expect.objectContaining({
            role: "supporting",
            command: "ut-tdd action-binding approval-packet --json",
            scopedCommand:
              "ut-tdd action-binding approval-packet --json --plan PLAN-M-02-helix-identifier-rename",
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
      const changedPlan = buildIdentifierRenameCutoverPlan(root, undefined, TEST_HEAD_SHA);
      expect(changedPlan.cutoverSnapshot.blastRadiusDigest).not.toBe(beforeDigest);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds cutover snapshots to git HEAD and changes snapshotId when HEAD changes", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-head-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const first = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );
      const second = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        NEXT_TEST_HEAD_SHA,
      );

      expect(first.cutoverSnapshot.repoHeadSha).toBe(TEST_HEAD_SHA);
      expect(second.cutoverSnapshot.repoHeadSha).toBe(NEXT_TEST_HEAD_SHA);
      expect(first.cutoverSnapshot.headDigest).not.toBe(second.cutoverSnapshot.headDigest);
      expect(first.cutoverSnapshot.snapshotId).not.toBe(second.cutoverSnapshot.snapshotId);
      expect(first.cutoverSnapshot.invalidatedBy).toContain("HEAD changes after approval");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds cutover snapshots to clean git worktree status", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-worktree-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const clean = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: CLEAN_WORKTREE,
      });
      const dirty = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: DIRTY_WORKTREE,
      });

      expect(clean.cutoverSnapshot).toMatchObject({
        worktreeStatusReadable: true,
        worktreeClean: true,
        worktreeDirtyPathCount: 0,
      });
      expect(dirty.cutoverSnapshot).toMatchObject({
        worktreeStatusReadable: true,
        worktreeClean: false,
        worktreeDirtyPathCount: 1,
        worktreeDirtyPaths: ["README.md"],
      });
      expect(dirty.blockedReasons).toContain(
        "cutover snapshot requires a clean git worktree before approval; dirtyPathCount=1",
      );
      expect(clean.cutoverSnapshot.worktreeStatusDigest).not.toBe(
        dirty.cutoverSnapshot.worktreeStatusDigest,
      );
      expect(clean.cutoverSnapshot.snapshotId).not.toBe(dirty.cutoverSnapshot.snapshotId);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds cutover snapshots to concrete evidence artifact file hashes", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-evidence-artifacts-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const missing = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: CLEAN_WORKTREE,
      });
      writeCutoverEvidenceArtifacts(root);
      const present = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: CLEAN_WORKTREE,
      });

      expect(missing.cutoverSnapshot.evidenceArtifactsRequired).toBe(16);
      expect(missing.cutoverSnapshot.evidenceArtifactsPresent).toBe(0);
      expect(missing.cutoverSnapshot.missingEvidenceArtifacts).toContain(
        ".ut-tdd/evidence/rename/blast-radius-baseline.json",
      );
      expect(present.cutoverSnapshot.evidenceArtifactsPresent).toBe(16);
      expect(present.cutoverSnapshot.missingEvidenceArtifacts).toEqual([]);
      expect(present.cutoverSnapshot.evidenceArtifacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/blast-radius-baseline.json",
            exists: true,
            sha256: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
          }),
        ]),
      );
      expect(missing.cutoverSnapshot.evidenceArtifactsDigest).not.toBe(
        present.cutoverSnapshot.evidenceArtifactsDigest,
      );
      expect(missing.cutoverSnapshot.snapshotId).not.toBe(present.cutoverSnapshot.snapshotId);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("generates a safe local evidence pack while keeping command-result evidence pending", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-evidence-pack-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const dryRun = buildIdentifierRenameEvidencePack(root);
      expect(dryRun).toMatchObject({
        schemaVersion: "identifier-rename-evidence-pack.v1",
        sourceCommand: "ut-tdd rename evidence-pack --dry-run --json",
        planOnly: true,
        mustNotApply: true,
        appliesCutover: false,
        approvalStillRequired: true,
        writePolicy: "no-write",
        targetDir: ".ut-tdd/evidence/rename",
      });
      expect(dryRun.generatedArtifacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/blast-radius-baseline.json",
            schemaVersion: "identifier-rename-audit.v1",
            written: false,
          }),
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/codemod-rehearsal.json",
            schemaVersion: "identifier-rename-rehearsal.v1",
            written: false,
          }),
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/github-repository-redirect-review.json",
            schemaVersion: "identifier-rename-github-repository-redirect-review.v1",
            written: false,
          }),
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/state-backup-restore-drill.json",
            schemaVersion: "identifier-rename-state-backup-dry-run.v1",
            written: false,
          }),
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/dist-smoke-rehearsal.txt",
            schemaVersion: "identifier-rename-dist-smoke-dry-run.v1",
            written: false,
          }),
          expect.objectContaining({
            path: ".ut-tdd/evidence/rename/restore-harness-db.json",
            source: "stateBackupManifest",
            schemaVersion: "identifier-rename-restore-check-evidence.v1",
            written: false,
          }),
        ]),
      );
      expect(dryRun.generatedArtifacts).toHaveLength(14);
      for (const artifact of dryRun.generatedArtifacts) {
        expect(artifact.contentSha256).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(artifact.sizeBytes).toBeGreaterThan(0);
      }
      expect(dryRun.pendingArtifacts).toEqual([
        expect.objectContaining({
          path: ".ut-tdd/evidence/rename/full-regression.txt",
          source: "cutoverRunbook",
          reason: expect.stringContaining("実コマンドの成功出力"),
        }),
        expect.objectContaining({
          path: ".ut-tdd/evidence/rename/static-state-gates.txt",
          source: "cutoverRunbook",
          reason: expect.stringContaining("実コマンドの成功出力"),
        }),
      ]);
      expect(dryRun.blockedUntil).toEqual(
        expect.arrayContaining([
          expect.stringContaining("pendingArtifacts"),
          expect.stringContaining("cutover_decision_record"),
          expect.stringContaining("action_binding_approval_record"),
        ]),
      );

      const writePacket = buildIdentifierRenameEvidencePack(root, { write: true });
      expect(writePacket).toMatchObject({
        sourceCommand: "ut-tdd rename evidence-pack --write --json",
        writePolicy: "local-evidence-write",
      });
      expect(writePacket.generatedArtifacts.every((artifact) => artifact.written)).toBe(true);
      expect(writePacket.pendingArtifacts.map((artifact) => artifact.path)).toEqual([
        ".ut-tdd/evidence/rename/full-regression.txt",
        ".ut-tdd/evidence/rename/static-state-gates.txt",
      ]);

      const blastRadius = JSON.parse(
        readFileSync(join(root, ".ut-tdd/evidence/rename/blast-radius-baseline.json"), "utf8"),
      );
      expect(blastRadius).toMatchObject({
        status: "blocked_pending_cutover_approval",
        targetCli: "helix",
        targetStateDir: ".helix",
      });
      const redirectReview = JSON.parse(
        readFileSync(
          join(root, ".ut-tdd/evidence/rename/github-repository-redirect-review.json"),
          "utf8",
        ),
      );
      expect(redirectReview).toMatchObject({
        schemaVersion: "identifier-rename-github-repository-redirect-review.v1",
        appliesRemote: false,
        sourceUrl:
          "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
      });
      expect(redirectReview.reviewedFacts).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Pages project site URLs"),
          expect.stringContaining("actions hosted from renamed repositories are not redirected"),
        ]),
      );
      expect(
        readFileSync(join(root, ".ut-tdd/evidence/rename/dist-smoke-rehearsal.txt"), "utf8"),
      ).toContain("identifier-rename-dist-smoke-dry-run.v1");
      expect(
        auditIdentifierRenameBlastRadius(root).hits.some((hit) =>
          hit.path.startsWith(".ut-tdd/evidence/rename/"),
        ),
      ).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds cutover snapshots to source ledger row content", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-ledger-digest-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const first = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );
      const ledgerPath = join(root, "docs", "process", "forward", "L08-L14-verification-phase.md");
      writeFileSync(
        ledgerPath,
        readFileSync(ledgerPath, "utf8").replace(
          "live official GitHub docs | adopt-live-docs-for-approval-shape",
          "updated official GitHub docs | adopt-live-docs-for-approval-shape",
        ),
        "utf8",
      );
      const second = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(first.sourceLedgerFreshness.rowsDigest).not.toBe(
        second.sourceLedgerFreshness.rowsDigest,
      );
      expect(first.cutoverSnapshot.sourceLedgerRowsDigest).not.toBe(
        second.cutoverSnapshot.sourceLedgerRowsDigest,
      );
      expect(first.cutoverSnapshot.evidenceDigest).not.toBe(second.cutoverSnapshot.evidenceDigest);
      expect(first.cutoverSnapshot.snapshotId).not.toBe(second.cutoverSnapshot.snapshotId);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds cutover snapshots to path-only .ut-tdd blast-radius hits", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-path-hit-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd until cutover.\n");

      const before = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );
      mkdirSync(join(root, ".ut-tdd", "state"), { recursive: true });
      writeFileSync(join(root, ".ut-tdd", "state", "path-only.json"), '{"ready":true}\n');
      const after = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(after.audit.hitsByToken[".ut-tdd"]).toBeGreaterThan(
        before.audit.hitsByToken[".ut-tdd"],
      );
      expect(after.cutoverCategoryChecklist).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "runtime_state",
            samplePaths: expect.arrayContaining([".ut-tdd/state/path-only.json"]),
          }),
        ]),
      );
      expect(after.cutoverSnapshot.blastRadiusDigest).not.toBe(
        before.cutoverSnapshot.blastRadiusDigest,
      );
      expect(after.cutoverSnapshot.snapshotId).not.toBe(before.cutoverSnapshot.snapshotId);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("derives all cutover verification source dates from the Cutover source ledger heading", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-ledger-date-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root, "2026-01-01");
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(plan.sourceLedgerFreshness.checkedDate).toBe("2026-01-01");
      expect(new Set(plan.verificationCommandMatrix.map((row) => row.sourceCheckedAt))).toEqual(
        new Set(["2026-01-01"]),
      );
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            /^source ledger must be refreshed before cutover: Cutover source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
          ),
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails cutover source ledger rows with stale official URLs or missing field impact", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-ledger-row-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      const ledgerPath = join(root, "docs", "process", "forward", "L08-L14-verification-phase.md");
      writeFileSync(
        ledgerPath,
        readFileSync(ledgerPath, "utf8")
          .replace(
            "https://sre.google/workbook/canarying-releases/",
            "https://sre.google/sre-book/release-engineering/",
          )
          .replace(
            "`execution_window_or_freeze_policy`, `post_cutover_monitoring`, `rollback_plan`",
            "`post_cutover_monitoring`, `rollback_plan`",
          ),
        "utf8",
      );
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(plan.sourceLedgerFreshness.rowViolations).toEqual(
        expect.arrayContaining([
          "cutover source ledger Google SRE Canarying Releases official URL missing expected https://sre.google/workbook/canarying-releases/",
          "cutover source ledger Microsoft Safe Deployment Practices required field impact missing expected execution_window_or_freeze_policy",
        ]),
      );
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([expect.stringContaining("source ledger cutover row violations:")]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("blocks cutover authorization when the cutover snapshot is not bound to git HEAD", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-missing-head-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], null);

      expect(plan.applyAuthorized).toBe(false);
      expect(plan.cutoverSnapshot).toMatchObject({
        repoHeadSha: null,
        headDigest: null,
      });
      expect(plan.blockedReasons).toContain(
        "cutover snapshot is not bound to a readable git HEAD sha",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps rename plan blocked when concrete approval records cite a stale cutover snapshot", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-approved-"));
    try {
      writeApprovedRenamePlan(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );
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
      expect(plan.snapshotReview).toMatchObject({
        recordedCutoverSnapshotId: CONCRETE_SNAPSHOT_ID,
        recordedActionBindingSnapshotId: CONCRETE_SNAPSHOT_ID,
        currentSnapshotId: plan.cutoverSnapshot.snapshotId,
        cutoverSnapshotMatchesCurrent: false,
        actionBindingSnapshotMatchesCurrent: false,
        driftWarning: expect.stringContaining(
          "does not match the current cutoverSnapshot.snapshotId",
        ),
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not authorize rename cutover when current-snapshot records still contain future-bound fields", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-current-future-bound-"));
    try {
      writeApprovedRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const currentSnapshotId = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      ).cutoverSnapshot.snapshotId;
      const planPath = join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md");
      const futureBound = readFileSync(planPath, "utf8")
        .replaceAll(CONCRETE_SNAPSHOT_ID, currentSnapshotId)
        .replace(
          "- approved_params: reviewed command params hash abc123",
          "- approved_params: Future approval will be recorded before apply",
        )
        .replace(
          "- review_approval_evidence: dry-run risk review rollback full test doctor evidence",
          "- review_approval_evidence: pending review evidence will be recorded",
        )
        .replace(
          "- audit_record: approver action command result incident rollback route",
          "- audit_record: audit record予定",
        );
      writeFileSync(planPath, futureBound);

      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );
      expect(plan.status).toBe("blocked_pending_cutover_approval");
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.mustNotApply).toBe(true);
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          "missing concrete action_binding_approval_record.approved_params",
          "missing concrete action_binding_approval_record.review_approval_evidence",
          "missing concrete action_binding_approval_record.audit_record",
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not mark approval material ready when current snapshot records lack evidence artifacts", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-current-snapshot-no-evidence-"));
    try {
      writeApprovedRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const currentSnapshotId = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        { repoHeadSha: TEST_HEAD_SHA, worktreeSnapshot: CLEAN_WORKTREE },
      ).cutoverSnapshot.snapshotId;
      writeApprovedRenamePlan(root, currentSnapshotId);
      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: CLEAN_WORKTREE,
      });

      expect(plan.approvalMaterialReady).toBe(false);
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          expect.stringContaining("cutover evidence artifacts missing before approval"),
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("marks approval material ready only when concrete approval records cite the current cutover snapshot with clean evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-current-snapshot-"));
    try {
      writeApprovedRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");
      writeCutoverEvidenceArtifacts(root);

      const currentSnapshotId = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        { repoHeadSha: TEST_HEAD_SHA, worktreeSnapshot: CLEAN_WORKTREE },
      ).cutoverSnapshot.snapshotId;
      writeApprovedRenamePlan(root, currentSnapshotId);
      const plan = buildIdentifierRenameCutoverPlan(root, [nameCutoverSemanticRecord()], {
        repoHeadSha: TEST_HEAD_SHA,
        worktreeSnapshot: CLEAN_WORKTREE,
      });

      expect(plan.status).toBe("ready_for_cutover_packet");
      expect(plan.approvalMaterialReady).toBe(true);
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.mustNotApply).toBe(true);
      expect(plan.applyCommandAvailable).toBe(false);
      expect(plan.blockedReasons).toEqual([]);
      expect(plan.snapshotReview).toMatchObject({
        recordedCutoverSnapshotId: currentSnapshotId,
        recordedActionBindingSnapshotId: currentSnapshotId,
        currentSnapshotId,
        cutoverSnapshotMatchesCurrent: true,
        actionBindingSnapshotMatchesCurrent: true,
        driftWarning: null,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not authorize cutover when source ledger meaning-review fields are omitted", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-missing-source-review-"));
    try {
      writeApprovedRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const currentSnapshotId = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      ).cutoverSnapshot.snapshotId;
      writeApprovedRenamePlan(root, currentSnapshotId);
      const planPath = join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md");
      writeFileSync(
        planPath,
        readFileSync(planPath, "utf8")
          .split("\n")
          .filter(
            (line) =>
              !/source_ledger_freshness|source_status_delta|adoption_decision_delta|workflow_route_impact/.test(
                line,
              ),
          )
          .join("\n"),
      );

      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(plan.status).toBe("blocked_pending_cutover_approval");
      expect(plan.applyAuthorized).toBe(false);
      expect(plan.blockedReasons).toEqual(
        expect.arrayContaining([
          "missing concrete cutover_decision_record.source_ledger_freshness",
          "missing concrete cutover_decision_record.source_status_delta",
          "missing concrete cutover_decision_record.adoption_decision_delta",
          "missing concrete cutover_decision_record.workflow_route_impact",
        ]),
      );
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
      writeCutoverSourceLedger(root);
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
      expect(payload.cutoverCategoryChecklist).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            samplePaths: expect.arrayContaining(["AGENTS.md"]),
            verificationCommand: "bun run src/cli.ts doctor",
          }),
        ]),
      );
      expect(payload.dryRunPlan.length).toBeGreaterThan(0);
      expect(payload.verificationCommandMatrix).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            phase: "full-regression",
            command: "bun run test",
            writePolicy: "no-write",
            sourceCheckedAt: "2026-07-02",
            adoptionDecision: "adopt-full-regression-before-irreversible-cutover",
          }),
          expect.objectContaining({
            phase: "renamed-helix-dist-smoke",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
            writePolicy: "no-write",
            adoptionDecision: "adopt-renamed-helix-dist-smoke-as-cutover-rehearsal-only",
          }),
        ]),
      );
      expect(payload.cutoverRunbook.length).toBeGreaterThan(0);
      expect(identifierRenameRunbookCommandViolations(payload)).toEqual([]);
      expect(payload.recordTemplates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recordName: "cutover_decision_record" }),
          expect.objectContaining({ recordName: "action_binding_approval_record" }),
        ]),
      );
      expect(payload.sourceLedgerFreshness).toMatchObject({
        ledgerLabel: "Cutover source ledger",
      });
      expect(payload.rollbackPlan.length).toBeGreaterThan(0);
      expect(payload.monitoringPlan.length).toBeGreaterThan(0);
      expect(payload.stateBackupManifest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ".ut-tdd/harness.db", restoreRequired: true }),
        ]),
      );
      expect(payload.freezePolicy.concurrencyPolicy).toBe("single-run-no-concurrent-apply");
      expect(payload.snapshotReview).toMatchObject({
        currentSnapshotId: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        recordedCutoverSnapshotId: null,
        recordedActionBindingSnapshotId: null,
        driftWarning: null,
      });
      expect(payload.provenanceRequirements).toEqual(
        expect.arrayContaining([expect.objectContaining({ item: "audit_record" })]),
      );

      const text = runCliIn(root, ["rename", "plan"]);
      expect(text.status).toBe(0);
      expect(text.stdout).toContain("snapshot-review: current=sha256:");
      expect(text.stdout).toContain("cutover-snapshot-head:");
      expect(text.stdout).toContain("source-ledger: label=Cutover source ledger");
      expect(text.stdout).toContain("rowsDigest=sha256:");
      expect(text.stdout).toContain("sourceLedgerRowsDigest=sha256:");
      expect(text.stdout).toContain("blastRadiusDigest=sha256:");
      expect(text.stdout).toContain("approvalScopeDigest=sha256:");
      expect(text.stdout).toContain("evidenceDigest=sha256:");
      expect(text.stdout).toContain("cutover-snapshot-worktree:");
      expect(text.stdout).toContain("dirtyPathCount=");
      expect(text.stdout).toContain("cutover-snapshot-evidence:");
      expect(text.stdout).toContain("artifactsDigest=sha256:");
      expect(text.stdout).toContain("cutover-checklist=");
      expect(text.stdout).toContain("runbook=");
      expect(text.stdout).toContain("verification-commands=");
      expect(text.stdout).toContain("record-template cutover_decision_record");
      expect(text.stdout).toContain("record-template action_binding_approval_record");
      expect(text.stdout).toContain("record-template-hint-ja:");
      expect(text.stdout).toContain("record-template-ja:");
      expect(text.stdout).toContain(
        "verification-source: baseline source=HELIX identifier cutover source ledger sourceUrl=docs/process/forward/L08-L14-verification-phase.md checked=2026-07-02",
      );
      expect(text.stdout).toContain(
        "writePolicy=no-write command=bun run src/cli.ts rename audit --json",
      );
      expect(text.stdout).toContain("adoption=adopt-cutover-source-ledger-for-l14-approval-review");
      expect(text.stdout).toContain(
        "statusDelta=none; ledger remains inside the 90-day freshness window",
      );
      expect(text.stdout).toContain(
        "routeImpact=none; stale or incomplete source ledger routes cutover back",
      );
      expect(text.stdout).toContain(
        "verification-source: current-dist-smoke source=ADR-001 TypeScript/Bun single-binary distribution decision sourceUrl=docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md checked=2026-07-02",
      );
      expect(text.stdout).toContain(
        "verification-source: renamed-helix-dist-smoke source=PLAN-M-02 HELIX identifier rename runbook sourceUrl=docs/plans/PLAN-M-02-helix-identifier-rename.md checked=2026-07-02",
      );
      expect(text.stdout).toContain(
        "verification-source: post-cutover-consumer-setup-smoke source=HELIX project setup command transition contract sourceUrl=docs/design/helix/L3-requirements/pillar-functional-requirements.md checked=2026-07-02",
      );
      expect(text.stdout).toContain("recordedCutover=-");
      expect(text.stdout).toContain("recordedActionBinding=-");
      expect(text.stdout).toContain("drift=no");

      const rehearsal = runCliIn(root, [
        "rename",
        "rehearsal",
        "--no-write",
        "--target",
        "helix",
        "--json",
      ]);
      expect(rehearsal.status, rehearsal.stderr || rehearsal.stdout).toBe(0);
      const rehearsalPayload = JSON.parse(rehearsal.stdout);
      expect(rehearsalPayload).toMatchObject({
        schemaVersion: "identifier-rename-rehearsal.v1",
        planOnly: true,
        mustNotApply: true,
        writePolicy: "no-write",
        target: "helix",
      });
      expect(rehearsalPayload.previewCommands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            phase: "codemod-preview",
            command: "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
            description: expect.stringContaining("preview ut-tdd/.ut-tdd/area=harness"),
            writesRepo: false,
          }),
          expect.objectContaining({
            phase: "renamed-binary-smoke-preview",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
            description: expect.stringContaining("after approval"),
            writesRepo: false,
          }),
        ]),
      );
      for (const previewCommand of rehearsalPayload.previewCommands) {
        expect(previewCommand.command).toMatch(/^bun run src\/cli\.ts rename /);
        expect(previewCommand.command).not.toMatch(/^preview |^after approval/);
      }

      const stateBackup = runCliIn(root, [
        "rename",
        "state-backup",
        "--dry-run",
        "--restore-drill",
        "--json",
      ]);
      expect(stateBackup.status, stateBackup.stderr || stateBackup.stdout).toBe(0);
      const stateBackupPayload = JSON.parse(stateBackup.stdout);
      expect(stateBackupPayload).toMatchObject({
        schemaVersion: "identifier-rename-state-backup-dry-run.v1",
        planOnly: true,
        mustNotApply: true,
        writePolicy: "no-write",
        restoreDrillRequested: true,
      });
      expect(stateBackupPayload.restoreChecks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".ut-tdd/harness.db",
            restoreEvidencePath: ".ut-tdd/evidence/rename/restore-harness-db.json",
          }),
        ]),
      );

      const distSmoke = runCliIn(root, [
        "rename",
        "dist-smoke",
        "--no-write",
        "--target",
        "helix",
        "--json",
      ]);
      expect(distSmoke.status, distSmoke.stderr || distSmoke.stdout).toBe(0);
      const distSmokePayload = JSON.parse(distSmoke.stdout);
      expect(distSmokePayload).toMatchObject({
        schemaVersion: "identifier-rename-dist-smoke-dry-run.v1",
        planOnly: true,
        mustNotApply: true,
        writePolicy: "no-write",
        target: "helix",
        currentBinary: {
          path: "dist/ut-tdd",
          smokeCommand: "bun run build && ./dist/ut-tdd doctor",
        },
        renamedBinaryPreview: {
          path: "dist/helix",
          smokeCommandAfterApproval:
            "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix doctor",
        },
        postCutoverConsumerSetupPreview: {
          commandAfterApproval:
            "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix setup project --dry-run --json",
          expected:
            "helix setup project emits the same consumer readiness, artifactReadiness, importReport, and blocked PLAN-M-02 boundary after cutover",
          evidencePath: ".ut-tdd/evidence/rename/post-cutover-consumer-setup-smoke.json",
          currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json",
        },
      });
      expect(distSmokePayload.blockedUntil).toEqual(
        expect.arrayContaining([
          expect.stringContaining("cutover_decision_record approves"),
          expect.stringContaining("helix setup project --dry-run --json"),
          expect.stringContaining("legacy ut-tdd alias disposition"),
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exposes rename evidence-pack as a CLI surface with explicit write mode", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-evidence-pack-cli-"));
    try {
      writeDraftRenamePlan(root);
      writeCutoverSourceLedger(root);
      writeFileSync(join(root, "AGENTS.md"), "Use ut-tdd and .ut-tdd until cutover.\n");

      const missingMode = runCliIn(root, ["rename", "evidence-pack", "--json"]);
      expect(missingMode.status).toBe(1);
      expect(missingMode.stderr).toContain(
        "rename evidence-pack requires exactly one of --dry-run or --write",
      );

      const bothModes = runCliIn(root, [
        "rename",
        "evidence-pack",
        "--dry-run",
        "--write",
        "--json",
      ]);
      expect(bothModes.status).toBe(1);
      expect(bothModes.stderr).toContain(
        "rename evidence-pack requires exactly one of --dry-run or --write",
      );

      const dryRun = runCliIn(root, ["rename", "evidence-pack", "--dry-run", "--json"]);
      expect(dryRun.status, dryRun.stderr || dryRun.stdout).toBe(0);
      const dryRunPayload = JSON.parse(dryRun.stdout);
      expect(dryRunPayload).toMatchObject({
        schemaVersion: "identifier-rename-evidence-pack.v1",
        sourceCommand: "ut-tdd rename evidence-pack --dry-run --json",
        writePolicy: "no-write",
        appliesCutover: false,
        approvalStillRequired: true,
      });
      expect(dryRunPayload.generatedArtifacts).toHaveLength(14);
      expect(dryRunPayload.pendingArtifacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ".ut-tdd/evidence/rename/static-state-gates.txt" }),
          expect.objectContaining({ path: ".ut-tdd/evidence/rename/full-regression.txt" }),
        ]),
      );

      const write = runCliIn(root, ["rename", "evidence-pack", "--write", "--json"]);
      expect(write.status, write.stderr || write.stdout).toBe(0);
      const writePayload = JSON.parse(write.stdout);
      expect(writePayload).toMatchObject({
        sourceCommand: "ut-tdd rename evidence-pack --write --json",
        writePolicy: "local-evidence-write",
      });
      expect(
        writePayload.generatedArtifacts.every((artifact: { written: boolean }) => artifact.written),
      ).toBe(true);
      expect(
        readFileSync(join(root, ".ut-tdd/evidence/rename/blast-radius-baseline.json"), "utf8"),
      ).toContain("blocked_pending_cutover_approval");

      const text = runCliIn(root, ["rename", "evidence-pack", "--dry-run"]);
      expect(text.status, text.stderr || text.stdout).toBe(0);
      expect(text.stdout).toContain("rename evidence-pack: writePolicy=no-write");
      expect(text.stdout).toContain(
        "pending-artifact: .ut-tdd/evidence/rename/full-regression.txt",
      );
      expect(text.stdout).toContain("blocked-until: pendingArtifacts");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("builds a no-write dist smoke packet without requiring the future helix binary to exist", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-dist-smoke-"));
    try {
      const packet = buildIdentifierRenameDistSmokeDryRun(root);
      expect(packet).toMatchObject({
        schemaVersion: "identifier-rename-dist-smoke-dry-run.v1",
        planOnly: true,
        mustNotApply: true,
        writePolicy: "no-write",
        target: "helix",
        currentBinary: {
          path: "dist/ut-tdd",
          exists: false,
        },
        renamedBinaryPreview: {
          path: "dist/helix",
          exists: false,
        },
        postCutoverConsumerSetupPreview: {
          commandAfterApproval:
            "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix setup project --dry-run --json",
          currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json",
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
