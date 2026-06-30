import { describe, expect, it } from "vitest";
import {
  analyzeCutoverReadiness,
  type CutoverReadinessInput,
  cutoverReadinessMessages,
  loadCutoverReadinessInput,
} from "../src/lint/cutover-readiness";

const cutoverMarkers = [
  "cutover_decision_record:",
  "- allowed_outcome: `approve_cutover` / `reject_or_defer` / `request_runbook_changes`",
  "- decision_owner: PO",
  "- trigger_condition: L1 re-freeze",
  "- blast_radius_baseline: measured",
  "- dry_run_plan: dry-run",
  "- rollback_plan: rollback",
  "- state_backup_plan: backup",
  "- execution_window_or_freeze_policy: single cutover window with frozen HEAD and no concurrent apply",
  "- approval_scope: rename",
  "- audit_record: A-NNN",
  "- post_cutover_monitoring: quiet window",
  "- legacy_alias_policy: decide",
  "Cutover source ledger (checked 2026-06-30):",
  "| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |",
  "|---|---|---|---|---|---|---|",
  "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | release integrity | audit_record |",
  "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub Actions environments docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding approval | decision_owner |",
  "| GitHub Actions concurrency | https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | prevent concurrent cutover apply | execution_window_or_freeze_policy |",
  "| Google SRE Release Engineering | https://sre.google/sre-book/release-engineering/ | SRE book release engineering chapter | live official Google SRE book | adopt-operational-guidance | rollback process | rollback_plan |",
  "| OWASP LLM06:2025 Excessive Agency | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | constrained authority | approval_scope |",
  "| SLSA Provenance | https://slsa.dev/spec/v1.2/provenance | SLSA Provenance v1.2 | current SLSA provenance specification | adopt-v1.2-for-cutover-artifact-provenance | artifact provenance | audit_record |",
].join("\n");

function input(overrides: Partial<CutoverReadinessInput> = {}): CutoverReadinessInput {
  return {
    rightArmMd: cutoverMarkers,
    outstandingTs: [
      "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
      "trigger_condition and blast_radius_baseline recorded before irreversible migration",
      "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
      "execution_window_or_freeze_policy recorded before irreversible apply",
      "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
    ].join("\n"),
    plans: [
      {
        file: "PLAN-M-900.md",
        plan_id: "PLAN-M-900",
        layer: "L14",
        kind: "design",
        status: "draft",
        text: `irreversible state dir cutover\n${cutoverMarkers}`,
      },
    ],
    ...overrides,
  };
}

describe("cutover readiness", () => {
  it("U-DECISIONREC-003: passes when pending irreversible L14 cutover plans carry a full decision record", () => {
    const result = analyzeCutoverReadiness(input());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-M-900"]);
    expect(cutoverReadinessMessages(result)[0]).toContain("cutover-readiness - OK");
  });

  it("U-DECISIONREC-003: fails irreversible cutover plans that only say PO signoff", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-901.md",
            plan_id: "PLAN-M-901",
            layer: "L14",
            kind: "design",
            status: "draft",
            text: "irreversible cutover requires PO signoff",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-M-901", reason: "missing structured cutover_decision_record" },
        { subject: "PLAN-M-901", reason: "missing structured allowed_outcome" },
        { subject: "PLAN-M-901", reason: "missing structured dry_run_plan" },
        { subject: "PLAN-M-901", reason: "missing structured rollback_plan" },
        { subject: "PLAN-M-901", reason: "missing structured execution_window_or_freeze_policy" },
        { subject: "PLAN-M-901", reason: "missing structured audit_record" },
      ]),
    );
  });

  it("U-DECISIONREC-003: fails irreversible cutover plans that mention fields without a structured record", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-903.md",
            plan_id: "PLAN-M-903",
            layer: "L14",
            kind: "design",
            status: "draft",
            text: "irreversible cutover cutover_decision_record allowed_outcome decision_owner trigger_condition blast_radius_baseline dry_run_plan rollback_plan state_backup_plan execution_window_or_freeze_policy approval_scope audit_record post_cutover_monitoring legacy_alias_policy",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing structured cutover_decision_record",
    );
  });

  it("fails when the cutover source ledger loses adoption decisions or provenance rows", () => {
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: [
          "cutover_decision_record",
          "allowed_outcome",
          "decision_owner",
          "trigger_condition",
          "blast_radius_baseline",
          "dry_run_plan",
          "rollback_plan",
          "state_backup_plan",
          "execution_window_or_freeze_policy",
          "approval_scope",
          "audit_record",
          "post_cutover_monitoring",
          "legacy_alias_policy",
          "Cutover source ledger (checked 2026-06-30):",
          "| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |",
          "|---|---|---|---|---|---|---|",
          "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final | final publication 1.1 | Rev. 1 initial public draft v1.2 | - | release integrity | audit_record |",
        ].join("\n"),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.missingSourceLedgerRows).toContain("SLSA Provenance");
    expect(result.missingSourceLedgerRows).toContain("GitHub Actions concurrency");
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/forward/L08-L14-verification-phase.md",
      reason: "cutover source ledger NIST SSDF SP 800-218 has empty adoption decision",
    });
  });

  it("fails when the cutover source ledger checked date is stale", () => {
    // U-SOURCELEDGER-004
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: cutoverMarkers.replace(
          "Cutover source ledger (checked 2026-06-30):",
          "Cutover source ledger (checked 2026-01-01):",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/forward/L08-L14-verification-phase.md",
      reason: "Cutover source ledger checked date is stale: 2026-01-01 (180d > 90d)",
    });
  });

  it("accepts refreshed cutover source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: cutoverMarkers.replace(
          "Cutover source ledger (checked 2026-06-30):",
          "Cutover source ledger (checked 2026-06-15):",
        ),
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });

  it("ignores terminal or non-L14 migration prose", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-902.md",
            plan_id: "PLAN-M-902",
            layer: "L14",
            kind: "design",
            status: "confirmed",
            text: "irreversible cutover requires PO signoff",
          },
          {
            file: "PLAN-L7-902.md",
            plan_id: "PLAN-L7-902",
            layer: "L7",
            kind: "impl",
            status: "draft",
            text: "cutover helper",
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([]);
  });

  it("passes against the live repository and lists the current L14 cutover decision", () => {
    const result = analyzeCutoverReadiness(loadCutoverReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-M-02-helix-identifier-rename"]);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });
});
