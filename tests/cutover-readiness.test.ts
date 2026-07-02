import { describe, expect, it } from "vitest";
import {
  analyzeCutoverReadiness,
  type CutoverReadinessInput,
  cutoverReadinessMessages,
  loadCutoverReadinessInput,
} from "../src/lint/cutover-readiness";

const CONCRETE_CUTOVER_SNAPSHOT_ID =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const cutoverMarkers = [
  "cutover_decision_record:",
  "- allowed_outcome: `approve_cutover` / `reject_or_defer` / `request_runbook_changes`",
  "- decision_owner: PO",
  `- cutover_snapshot_id: cutoverSnapshot.snapshotId ${CONCRETE_CUTOVER_SNAPSHOT_ID}`,
  "- trigger_condition: L1 re-freeze",
  "- blast_radius_baseline: measured",
  "- dry_run_plan: codemod/state move dry-run rehearsal on a non-destructive branch with no apply",
  "- rollback_plan: rollback via branch/tag, state restore, alias/shim recovery, and revert route",
  "- state_backup_plan: backup and restore harness.db, memory, logs, and handover state",
  "- execution_window_or_freeze_policy: single cutover quiet window with frozen HEAD, no concurrent apply, and re-approval trigger for HEAD/scope/evidence drift",
  "- approval_scope: rename",
  "- audit_record: A-NNN records commands, git hash, approver, result, and rollback decision",
  "- post_cutover_monitoring: quiet window with smoke, doctor, status, feedback, and backlog monitoring",
  "- legacy_alias_policy: decide",
  "- source_ledger_freshness: fresh Cutover source ledger checked 2026-06-30",
  "- source_status_delta: none",
  "- adoption_decision_delta: none",
  "- workflow_route_impact: none while draft",
  "Cutover source ledger (checked 2026-06-30):",
  "| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |",
  "|---|---|---|---|---|---|---|",
  "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | release integrity | audit_record state_backup_plan blast_radius_baseline |",
  "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub Actions environments docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding approval | decision_owner allowed_outcome approval_policy_or_named_approver approval_scope approved_actor approved_tool approved_target approved_params review_approval_evidence expires_at_or_trigger |",
  "| GitHub Actions concurrency | https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | prevent concurrent cutover apply | execution_window_or_freeze_policy |",
  "| Google SRE Release Engineering | https://sre.google/sre-book/release-engineering/ | SRE book release engineering chapter | live official Google SRE book | adopt-operational-guidance | rollback process | dry_run_plan rollback_plan post_cutover_monitoring |",
  "| OWASP LLM06:2025 Excessive Agency | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | constrained authority | approval_scope legacy_alias_policy audit_record |",
  "| SLSA Provenance | https://slsa.dev/spec/v1.2/provenance | SLSA Provenance v1.2 | current SLSA provenance specification | adopt-v1.2-for-cutover-artifact-provenance | artifact provenance | audit_record blast_radius_baseline state_backup_plan |",
  "Cutover source ledger meaning review",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "Date-only refresh",
].join("\n");

function input(overrides: Partial<CutoverReadinessInput> = {}): CutoverReadinessInput {
  return {
    rightArmMd: cutoverMarkers,
    outstandingTs: [
      "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
      "cutover_snapshot_id from the current cutoverSnapshot.snapshotId recorded before irreversible migration approval",
      "trigger_condition and blast_radius_baseline recorded before irreversible migration",
      "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
      "execution_window_or_freeze_policy recorded before irreversible apply",
      "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
    ].join("\n"),
    semanticFeatureFrontierRecords: [
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-M-900",
        featureId: "name_cutover",
        classification: "approval_gated_cutover",
        completionClaimAllowed: false,
        blockers: ["human_approval_pending", "irreversible_migration_pending"],
        requiredRoute:
          "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
        reason: "irreversible_migration_pending",
        sourcePaths: [
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          "docs/process/forward/L08-L14-verification-phase.md",
        ],
      },
    ],
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

  it("fails cutover records whose source_ledger_freshness does not cite the current ledger checked date", () => {
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: cutoverMarkers.replace(
          "Cutover source ledger (checked 2026-06-30):",
          "Cutover source ledger (checked 2026-07-02):",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-M-900",
      reason:
        "source_ledger_freshness checked date must match current Cutover source ledger checked 2026-07-02",
    });
  });

  it("fails cutover records that omit source ledger meaning-review fields", () => {
    const base = input().plans[0];
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text
              .split("\n")
              .filter(
                (line) =>
                  !/source_ledger_freshness|source_status_delta|adoption_decision_delta|workflow_route_impact/.test(
                    line,
                  ),
              )
              .join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-M-900", reason: "missing structured source_ledger_freshness" },
        { subject: "PLAN-M-900", reason: "missing structured source_status_delta" },
        { subject: "PLAN-M-900", reason: "missing structured adoption_decision_delta" },
        { subject: "PLAN-M-900", reason: "missing structured workflow_route_impact" },
      ]),
    );
  });

  it("fails irreversible cutover plans that are detached from live semantic frontier records", () => {
    const result = analyzeCutoverReadiness(
      input({
        semanticFeatureFrontierRecords: [],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-M-900",
      reason: "missing semantic_feature_frontier_record for approval_gated_cutover",
    });
  });

  it("fails irreversible cutover semantic frontier records with wrong feature or missing L3 source", () => {
    const semanticRecord = input().semanticFeatureFrontierRecords?.[0];
    if (!semanticRecord) throw new Error("missing cutover semantic frontier fixture");
    const wrongFeature = analyzeCutoverReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            ...semanticRecord,
            featureId: "wrong_cutover",
          },
        ],
      }),
    );

    expect(wrongFeature.ok).toBe(false);
    expect(wrongFeature.violations).toContainEqual({
      subject: "PLAN-M-900",
      reason: "semantic_feature_frontier_record featureId wrong_cutover expected name_cutover",
    });

    const missingL3 = analyzeCutoverReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            ...semanticRecord,
            sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
          },
        ],
      }),
    );
    expect(missingL3.violations).toContainEqual({
      subject: "PLAN-M-900",
      reason:
        "semantic_feature_frontier_record sourcePaths must include docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    });
  });

  it("fails cutover records whose source ledger meaning-review fields are placeholders", () => {
    const base = input().plans[0];
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text
              .replace(
                "- source_ledger_freshness: fresh Cutover source ledger checked 2026-06-30",
                "- source_ledger_freshness: source_ledger_freshness",
              )
              .replace("- source_status_delta: none", "- source_status_delta: source_status_delta")
              .replace(
                "- adoption_decision_delta: none",
                "- adoption_decision_delta: adoption_decision_delta",
              )
              .replace(
                "- workflow_route_impact: none while draft",
                "- workflow_route_impact: workflow_route_impact",
              ),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.reason)).toEqual(
      expect.arrayContaining([
        "structured source_ledger_freshness must not be placeholder",
        "structured source_status_delta must not be placeholder",
        "structured adoption_decision_delta must not be placeholder",
        "structured workflow_route_impact must not be placeholder",
      ]),
    );
  });

  it("fails cutover records whose snapshot id is only a placeholder", () => {
    const base = input().plans[0];
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text.replace(
              `- cutover_snapshot_id: cutoverSnapshot.snapshotId ${CONCRETE_CUTOVER_SNAPSHOT_ID}`,
              "- cutover_snapshot_id: cutoverSnapshot.snapshotId",
            ),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-M-900",
      reason: "cutover_snapshot_id must record a concrete sha256 current cutover snapshot id",
    });
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
        { subject: "PLAN-M-901", reason: "missing structured cutover_snapshot_id" },
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
            text: "irreversible cutover cutover_decision_record allowed_outcome decision_owner cutover_snapshot_id trigger_condition blast_radius_baseline dry_run_plan rollback_plan state_backup_plan execution_window_or_freeze_policy approval_scope audit_record post_cutover_monitoring legacy_alias_policy",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing structured cutover_decision_record",
    );
  });

  it("U-DECISIONREC-004: fails cutover records whose allowed_outcome set drifts from the design enum", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-904.md",
            plan_id: "PLAN-M-904",
            layer: "L14",
            kind: "design",
            status: "draft",
            text: `irreversible state dir cutover\n${cutoverMarkers.replace(
              "`approve_cutover` / `reject_or_defer` / `request_runbook_changes`",
              "`approve_cutover` / `manual_override`",
            )}`,
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "invalid allowed_outcome set for cutover_decision_record: missing allowed_outcome reject_or_defer,request_runbook_changes; unknown allowed_outcome manual_override",
    );
  });

  it("U-DECISIONREC-008: fails cutover records whose execution controls are present but semantically too weak", () => {
    const weakRecord = cutoverMarkers
      .replace(
        "single cutover quiet window with frozen HEAD, no concurrent apply, and re-approval trigger for HEAD/scope/evidence drift",
        "tomorrow after approval",
      )
      .replace(
        "codemod/state move dry-run rehearsal on a non-destructive branch with no apply",
        "dry-run",
      )
      .replace(
        "rollback via branch/tag, state restore, alias/shim recovery, and revert route",
        "rollback if needed",
      )
      .replace("backup and restore harness.db, memory, logs, and handover state", "backup files")
      .replace("A-NNN records commands, git hash, approver, result, and rollback decision", "A-NNN")
      .replace(
        "quiet window with smoke, doctor, status, feedback, and backlog monitoring",
        "quiet window",
      );

    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-905.md",
            plan_id: "PLAN-M-905",
            layer: "L14",
            kind: "design",
            status: "draft",
            text: `irreversible state dir cutover\n${weakRecord}`,
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-M-905",
          reason:
            "execution_window_or_freeze_policy must bind frozen HEAD, quiet window, single-run/concurrency, and drift re-approval",
        },
        {
          subject: "PLAN-M-905",
          reason: "dry_run_plan must describe non-destructive rehearsal before apply",
        },
        {
          subject: "PLAN-M-905",
          reason:
            "rollback_plan must bind branch/tag, restore/revert route, and alias/shim recovery",
        },
        {
          subject: "PLAN-M-905",
          reason: "state_backup_plan must cover harness.db, memory/logs/handover, and restore path",
        },
        {
          subject: "PLAN-M-905",
          reason:
            "audit_record must capture commands, git hash, approver, result, and rollback decision",
        },
        {
          subject: "PLAN-M-905",
          reason:
            "post_cutover_monitoring must include quiet window, smoke/doctor, status, and feedback/backlog monitoring",
        },
      ]),
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

  it("U-SOURCELEDGER-007: fails when cutover source ledger rows drift from expected official URLs or field impacts", () => {
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: cutoverMarkers
          .replace("https://slsa.dev/spec/v1.2/provenance", "https://example.com/provenance")
          .replace("audit_record blast_radius_baseline state_backup_plan", "audit_record"),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toEqual(
      expect.arrayContaining([
        {
          subject: "docs/process/forward/L08-L14-verification-phase.md",
          reason:
            "cutover source ledger SLSA Provenance official URL missing expected https://slsa.dev/spec/v1.2/provenance",
        },
        {
          subject: "docs/process/forward/L08-L14-verification-phase.md",
          reason:
            "cutover source ledger SLSA Provenance required field impact missing expected blast_radius_baseline",
        },
      ]),
    );
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
      reason: expect.stringMatching(
        /^Cutover source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
    });
  });

  it("accepts refreshed cutover source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const base = input();
    const refreshedPlan = {
      ...base.plans[0],
      text: base.plans[0].text.replace(
        "fresh Cutover source ledger checked 2026-06-30",
        "fresh Cutover source ledger checked 2026-06-15",
      ),
    };
    const result = analyzeCutoverReadiness(
      input({
        rightArmMd: cutoverMarkers.replace(
          "Cutover source ledger (checked 2026-06-30):",
          "Cutover source ledger (checked 2026-06-15):",
        ),
        plans: [refreshedPlan],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });

  it("ignores archived or non-L14 migration prose", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-902.md",
            plan_id: "PLAN-M-902",
            layer: "L14",
            kind: "design",
            status: "archived",
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

  it("validates terminal cutover records without emitting terminal pending decisions", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-CONFIRMED.md",
            plan_id: "PLAN-CONFIRMED",
            layer: "L14",
            kind: "design",
            status: "confirmed",
            text: "irreversible state dir cutover requires PO signoff",
          },
          {
            file: "PLAN-COMPLETED.md",
            plan_id: "PLAN-COMPLETED",
            layer: "L14",
            kind: "design",
            status: "completed",
            text: "irreversible state dir cutover requires PO signoff",
          },
          {
            file: "PLAN-ACCEPTED.md",
            plan_id: "PLAN-ACCEPTED",
            layer: "L14",
            kind: "design",
            status: "accepted",
            text: "irreversible state dir cutover requires PO signoff",
          },
          {
            file: "PLAN-ARCHIVED.md",
            plan_id: "PLAN-ARCHIVED",
            layer: "L14",
            kind: "design",
            status: "archived",
            text: "irreversible state dir cutover requires PO signoff",
          },
          {
            file: "PLAN-MERGED.md",
            plan_id: "PLAN-MERGED",
            layer: "L14",
            kind: "design",
            status: "merged",
            text: "irreversible state dir cutover requires PO signoff",
          },
        ],
      }),
    );

    expect(result.pendingPlanIds).toEqual(["PLAN-MERGED"]);
    expect(result.ok).toBe(false);
    for (const subject of ["PLAN-CONFIRMED", "PLAN-COMPLETED", "PLAN-ACCEPTED", "PLAN-MERGED"]) {
      expect(result.violations).toContainEqual({
        subject,
        reason: "missing structured cutover_decision_record",
      });
    }
    expect(result.violations.some((violation) => violation.subject === "PLAN-ARCHIVED")).toBe(
      false,
    );
  });

  it("passes against the live repository and lists the current L14 cutover decision", () => {
    const result = analyzeCutoverReadiness(loadCutoverReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-M-02-helix-identifier-rename"]);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });
});
