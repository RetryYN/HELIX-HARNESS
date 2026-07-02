import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditIdentifierRenameBlastRadius,
  buildIdentifierRenameCutoverPlan,
  buildIdentifierRenameDistSmokeDryRun,
  identifierRenameRunbookCommandViolations,
  identifierRenameVerificationCommandViolations,
} from "../src/lint/identifier-rename";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const CONCRETE_SNAPSHOT_ID =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_HEAD_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_TEST_HEAD_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

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
      "| GitHub Actions concurrency | <https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency> | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | cutover apply must not run concurrently | `execution_window_or_freeze_policy` |",
      "| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | SRE book | live official Google SRE book | adopt-operational-guidance | rollback and release process | `dry_run_plan`, `rollback_plan`, `post_cutover_monitoring` |",
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
      expect(audit.approvalRecordsConcrete).toBe(false);
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
            latestOfficialStatus: expect.stringContaining("NIST SSDF"),
            sourceStatusDelta: expect.stringContaining("90-day freshness"),
            adoptionDecision: "adopt-cutover-source-ledger-for-l14-approval-review",
            adoptionDecisionDelta: expect.stringContaining("approval-gated"),
            workflowRouteImpact: expect.stringContaining("request_runbook_changes"),
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
            phase: "legacy-alias-smoke",
            command: "bun run build && ./dist/ut-tdd doctor",
            writePolicy: "local-artifact-write",
            adoptionDecision: expect.stringContaining("legacy-alias-smoke"),
          }),
        ]),
      );
      for (const row of plan.verificationCommandMatrix) {
        expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(row.writePolicy, row.phase).toMatch(/^(no-write|state-write|local-artifact-write)$/);
        expect(row.latestOfficialStatus, row.phase).not.toBe("");
        expect(row.sourceStatusDelta, row.phase).not.toBe("");
        expect(row.adoptionDecision, row.phase).not.toBe("");
        expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
        expect(row.workflowRouteImpact, row.phase).not.toBe("");
      }
      expect(plan.verificationCommandMatrix).toHaveLength(8);
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
        rowCount: 6,
        missingRows: [],
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
            id: "cutover-rb-05",
            command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
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
        blastRadiusDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        approvalScopeDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        evidenceDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
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

  it("authorizes only when concrete approval records cite the current cutover snapshot", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rename-plan-current-snapshot-"));
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
      const plan = buildIdentifierRenameCutoverPlan(
        root,
        [nameCutoverSemanticRecord()],
        TEST_HEAD_SHA,
      );

      expect(plan.status).toBe("ready_for_cutover_packet");
      expect(plan.applyAuthorized).toBe(true);
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
      expect(text.stdout).toContain("cutover-checklist=");
      expect(text.stdout).toContain("runbook=");
      expect(text.stdout).toContain("verification-commands=");
      expect(text.stdout).toContain("record-template cutover_decision_record");
      expect(text.stdout).toContain("record-template action_binding_approval_record");
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
          expect.objectContaining({ phase: "codemod-preview", writesRepo: false }),
          expect.objectContaining({ phase: "renamed-binary-smoke-preview", writesRepo: false }),
        ]),
      );

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
      });
      expect(distSmokePayload.blockedUntil).toEqual(
        expect.arrayContaining([
          expect.stringContaining("cutover_decision_record approves"),
          expect.stringContaining("legacy ut-tdd alias disposition"),
        ]),
      );
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
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
