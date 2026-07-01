import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeOutstandingWork,
  completionDecisionPacketForOutstanding,
  completionReadinessForOutstanding,
  computeOutstandingWork,
  loadOutstandingPlanRows,
  type OutstandingPlanRow,
  outstandingSummaryLine,
  workflowNextActionForOutstanding,
  workflowNextActionsForOutstanding,
} from "../src/lint/outstanding";

// IMP-139: 「未了の正の集計シグナル」(非終端 PLAN 層別 + open defer) の additive surface 回帰。

const sourceLedgerMeaningReviewEvidence = [
  "source_ledger_freshness records the fresh checked ledger label before terminal decision use",
  "source_status_delta records none/changed official source status impact before terminal decision use",
  "adoption_decision_delta records none/changed adoption decision impact before terminal decision use",
  "workflow_route_impact records none or the named workflow reroute before terminal decision use",
] as const;

describe("analyzeOutstandingWork", () => {
  const rows: OutstandingPlanRow[] = [
    { layer: "L7", status: "draft" },
    { layer: "L7", status: "in_progress" },
    { layer: "cross", status: "draft" },
    { layer: "L4", status: "confirmed" }, // 終端 → 除外
    { layer: "L5", status: "completed" }, // 終端 → 除外
    { layer: "L6", status: "accepted" }, // 終端 → 除外
    { layer: "L3", status: "archived" }, // archived → 除外
    { layer: "L8", status: "merged" }, // schema 外 status は終端扱いしない
    { layer: "L8", status: "rejected" }, // decision_outcome と混同しない
    { layer: "L8", status: "superseded" }, // feedback/memory status と混同しない
  ];

  it("非終端のみを layer 別に集計し、終端/archived を除外する", () => {
    const o = analyzeOutstandingWork(rows, 2);
    expect(o.nonTerminalPlansByLayer).toEqual({ L7: 2, L8: 3, cross: 1 });
    expect(o.nonTerminalPlansTotal).toBe(6);
    expect(o.openDefers).toBe(2);
    expect(o.blockersByKind).toEqual({ active_draft: 6 });
    expect(o.items).toHaveLength(6);
    expect(o.completionReadiness).toMatchObject({
      ok: false,
      status: "blocked",
      blockers: ["active_draft", "non_terminal_plans", "open_defers"],
    });
  });

  it("layer key は昇順 (決定論順)", () => {
    const o = analyzeOutstandingWork(
      [
        { layer: "L9", status: "draft" },
        { layer: "L2", status: "draft" },
        { layer: "L5", status: "draft" },
      ],
      0,
    );
    expect(Object.keys(o.nonTerminalPlansByLayer)).toEqual(["L2", "L5", "L9"]);
  });

  it("layer 空は unknown へ寄せる", () => {
    const o = analyzeOutstandingWork([{ layer: "  ", status: "draft" }], 0);
    expect(o.nonTerminalPlansByLayer).toEqual({ unknown: 1 });
  });

  it("非終端 PLAN を意味別 blocker に分類する", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "migration",
          status: "draft",
          text: "不可逆 state dir cutover は PO サインオフ後に実施する。",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "Cloudflare HMAC webhook access control activation requires human approval.",
        },
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    );

    expect(o.blockersByKind).toEqual({
      human_approval_pending: 1,
      irreversible_migration_pending: 1,
      po_decision_pending: 1,
      version_up_parked: 1,
    });
    expect(o.items.map((item) => [item.planId, item.reason])).toEqual([
      ["PLAN-DISCOVERY-10", "po_decision_pending"],
      ["PLAN-L7-146", "version_up_parked"],
      ["PLAN-M-02", "irreversible_migration_pending"],
    ]);
    expect(o.items.map((item) => [item.planId, item.requiredAction])).toEqual([
      [
        "PLAN-DISCOVERY-10",
        "record the PO/S4 decision before promotion, rejection, or Forward merge",
      ],
      [
        "PLAN-L7-146",
        "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
      ],
      [
        "PLAN-M-02",
        "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      ],
    ]);
    expect(o.items.find((item) => item.planId === "PLAN-M-02")?.requiredEvidence).toContain(
      "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
    );
    expect(o.items.find((item) => item.planId === "PLAN-M-02")?.requiredEvidence).toContain(
      "cutover_snapshot_id from the current cutoverSnapshot.snapshotId recorded before irreversible migration approval",
    );
    expect(o.items.find((item) => item.planId === "PLAN-M-02")?.requiredEvidence).toContain(
      "execution_window_or_freeze_policy recorded before irreversible apply",
    );
    expect(o.items.find((item) => item.planId === "PLAN-M-02")?.requiredEvidence).toEqual(
      expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
    );
    expect(o.items.find((item) => item.planId === "PLAN-DISCOVERY-10")?.requiredEvidence).toEqual(
      expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
    );
    expect(o.items.find((item) => item.planId === "PLAN-L7-146")?.requiredEvidence).toEqual(
      expect.arrayContaining([
        "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date, target_version_or_release_trigger, and activation_route",
        "activation_snapshot_id from the current activationSnapshot.snapshotId recorded before activation approval",
        "parked_review_record with review_owner, review_trigger, review_by_policy, stale_action, activation_dependency, and decision_packet_route",
        "approval_scope, dry_run_plan, and rollback_plan recorded before external infra/auth/secret activation",
        "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
        ...sourceLedgerMeaningReviewEvidence,
      ]),
    );
    expect(o.items.find((item) => item.planId === "PLAN-L7-146")?.requiredActions).toEqual(
      expect.arrayContaining([
        "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
        "record required human/action-binding approval before executing the high-impact action",
      ]),
    );
    expect(o.semanticFeatureFrontierRecords).toEqual([
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-DISCOVERY-10",
        featureId: "asset_progress_visualization",
        classification: "frontier_pending_decision",
        completionClaimAllowed: false,
        blockers: ["po_decision_pending"],
        requiredRoute: expect.stringContaining("S4 decide"),
        reason: "po_decision_pending",
        sourcePaths: expect.arrayContaining([
          "docs/process/modes/discovery.md",
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        ]),
      },
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-L7-146",
        featureId: "serverless_readonly_share",
        classification: "parked_future_version",
        completionClaimAllowed: false,
        blockers: ["human_approval_pending", "version_up_parked"],
        requiredRoute: expect.stringContaining("version-up activation"),
        reason: "version_up_parked",
        sourcePaths: expect.arrayContaining(["docs/process/modes/version-up.md"]),
      },
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-M-02",
        featureId: "name_cutover",
        classification: "approval_gated_cutover",
        completionClaimAllowed: false,
        blockers: ["irreversible_migration_pending"],
        requiredRoute: expect.stringContaining("L14 cutover"),
        reason: "irreversible_migration_pending",
        sourcePaths: expect.arrayContaining([
          "docs/process/forward/L08-L14-verification-phase.md",
          "docs/plans/PLAN-M-02-helix-identifier-rename.md",
        ]),
      },
    ]);
  });

  it("does not classify no-snapshot approval wording as irreversible cutover", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DISCOVERY-10-helix-asset-visualization",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: [
            "S4 decision pending.",
            "action_binding_approval_record:",
            "- reviewed_snapshot_binding: No snapshot-bearing activation/cutover packet applies to this Discovery S4 approval.",
            "future write-capable action surfaces require action-binding approval.",
          ].join("\n"),
        },
      ],
      0,
    );

    expect(o.blockersByKind).toEqual({
      human_approval_pending: 1,
      po_decision_pending: 1,
    });
    expect(o.items[0]).toMatchObject({
      planId: "PLAN-DISCOVERY-10-helix-asset-visualization",
      blockers: ["human_approval_pending", "po_decision_pending"],
      reason: "po_decision_pending",
    });
    expect(o.semanticFeatureFrontierRecords?.[0]).toMatchObject({
      classification: "frontier_pending_decision",
      reason: "po_decision_pending",
    });
  });

  it("負の openDefers は 0 にクランプ / 全終端なら total=0", () => {
    const o = analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], -5);
    expect(o.nonTerminalPlansTotal).toBe(0);
    expect(o.nonTerminalPlansByLayer).toEqual({});
    expect(o.openDefers).toBe(0);
    expect(o.blockersByKind).toEqual({});
    expect(o.items).toEqual([]);
    expect(o.semanticFeatureFrontierRecords).toEqual([]);
  });
});

describe("completionReadinessForOutstanding", () => {
  it("blocks whole-program completion while non-terminal PLANs or open defers remain", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "irreversible cutover requires PO signoff and approval",
        },
      ],
      1,
    );

    expect(o.completionReadiness.ok).toBe(false);
    expect(o.completionReadiness.blockers).toEqual([
      "human_approval_pending",
      "irreversible_migration_pending",
      "non_terminal_plans",
      "open_defers",
    ]);
    expect(o.completionReadiness.reason).toContain("doctor green is not a substitute");
    expect(o.completionReadiness.requiredActions).toEqual(
      expect.arrayContaining([
        "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
        "resolve open placeholder/spec-backfill defers before claiming whole-program completion",
      ]),
    );
  });

  it("is ready only when non-terminal PLANs and open defers are zero", () => {
    expect(
      completionReadinessForOutstanding({
        nonTerminalPlansByLayer: {},
        nonTerminalPlansTotal: 0,
        versionUpParked: 0,
        activeDraftTotal: 0,
        openDefers: 0,
        blockersByKind: {},
        items: [],
      }),
    ).toEqual({
      ok: true,
      status: "ready",
      reason: "no non-terminal PLANs or open defers remain",
      blockers: [],
      requiredActions: [],
    });
  });
});

describe("completionDecisionPacketForOutstanding", () => {
  // U-OUTSTANDING-001
  it("turns outstanding blockers into explicit decision items for PO/human gates", () => {
    const outstanding = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision_outcome is PO gated and requires human approval.",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "version-up parked Cloudflare HMAC webhook action-binding approval",
        },
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "irreversible cutover requires PO signoff",
        },
      ],
      0,
    );

    const packet = completionDecisionPacketForOutstanding(outstanding, {
      generatedAt: "2026-06-30T00:00:00.000Z",
      now: "2026-06-30T00:30:00.000Z",
      validForMinutes: 60,
      sourceCommand: "ut-tdd completion decision-packet --json",
    });

    expect(packet).toMatchObject({
      ok: false,
      status: "blocked",
      generatedFrom: "outstanding.completionReadiness",
      generatedAt: "2026-06-30T00:00:00.000Z",
      sourceCommand: "ut-tdd completion decision-packet --json",
      freshness: {
        validForMinutes: 60,
        expiresAt: "2026-06-30T01:00:00.000Z",
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
      decisionCount: 3,
      blockers: expect.arrayContaining([
        "irreversible_migration_pending",
        "non_terminal_plans",
        "po_decision_pending",
        "version_up_parked",
      ]),
    });
    expect(packet.decisions.map((d) => [d.planId, d.decisionKind])).toEqual([
      ["PLAN-DISCOVERY-10", "po_s4_decision"],
      ["PLAN-L7-146", "version_up_activation"],
      ["PLAN-M-02", "irreversible_migration_signoff"],
    ]);
    expect(
      packet.decisions.map((d) => [d.planId, d.decisionPacketCommand, d.packetCommands]),
    ).toEqual([
      [
        "PLAN-DISCOVERY-10",
        "ut-tdd s4 decision-packet --json",
        ["ut-tdd s4 decision-packet --json", "ut-tdd action-binding approval-packet --json"],
      ],
      [
        "PLAN-L7-146",
        "ut-tdd version-up activation-packet --json",
        [
          "ut-tdd version-up activation-packet --json",
          "ut-tdd action-binding approval-packet --json",
        ],
      ],
      ["PLAN-M-02", "ut-tdd rename plan --json", ["ut-tdd rename plan --json"]],
    ]);
    expect(packet.decisions[0].allowedOutcomes).toEqual(["confirmed", "rejected", "pivot"]);
    expect(packet.decisions[0].allowedOutcomesByRecord).toEqual([
      {
        recordName: "s4_decision_record",
        allowedOutcomes: ["confirmed", "rejected", "pivot"],
      },
      {
        recordName: "action_binding_approval_record",
        allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
      },
    ]);
    expect(packet.decisions[0].nextWorkflowRoutesByRecord).toEqual([
      {
        recordName: "s4_decision_record",
        nextWorkflowRoute: expect.stringContaining("S4 decide"),
      },
      {
        recordName: "action_binding_approval_record",
        nextWorkflowRoute: expect.stringContaining("action-binding approval gate"),
      },
    ]);
    expect(packet.decisions[0].requiredRecords).toEqual([
      {
        recordName: "s4_decision_record",
        fields: [
          "allowed_outcome",
          "decision_owner",
          "decision_basis",
          "verified_evidence",
          "stakeholder_review_or_proxy",
          "acceptance_gap",
          "unresolved_risk",
          "external_source_basis",
          "source_ledger_freshness",
          "source_status_delta",
          "adoption_decision_delta",
          "workflow_route_impact",
          "route_impact",
          "forward_route",
          "reverse_fullback_required",
          "promotion_strategy_or_rejection_pivot_rationale",
        ],
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
      },
      {
        recordName: "action_binding_approval_record",
        fields: [
          "allowed_outcome",
          "approval_policy_or_named_approver",
          "approval_scope",
          "approved_actor",
          "approved_tool",
          "approved_target",
          "approved_params",
          "review_approval_evidence",
          "reviewed_snapshot_binding",
          "expires_at_or_trigger",
          "audit_record",
        ],
        sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
      },
    ]);
    const s4Template = packet.decisions[0].recordTemplates[0];
    expect(s4Template?.recordName).toBe("s4_decision_record");
    expect(s4Template?.insertionHint).toContain("S4 decision evidence");
    expect(s4Template?.insertionHint).toContain("Forward/Reverse");
    expect(s4Template?.insertionHint).toContain("archive/backlog");
    expect(s4Template?.insertionHint).toContain("route_impact");
    expect(s4Template?.yamlLines).toEqual(
      expect.arrayContaining([
        "s4_decision_record:",
        '  - allowed_outcome: "<confirmed|rejected|pivot>"',
        '  - verified_evidence: "<verified_evidence>"',
        '  - reverse_fullback_required: "<true|false plus route basis>"',
      ]),
    );
    const actionBindingTemplate = packet.decisions[0].recordTemplates[1];
    expect(actionBindingTemplate?.recordName).toBe("action_binding_approval_record");
    expect(actionBindingTemplate?.insertionHint).toContain("actor/tool/target/params");
    expect(actionBindingTemplate?.insertionHint).toContain("dry-run");
    expect(actionBindingTemplate?.insertionHint).toContain("risk");
    expect(actionBindingTemplate?.insertionHint).toContain("approver/action/result/incident");
    expect(actionBindingTemplate?.yamlLines).toEqual(
      expect.arrayContaining([
        "action_binding_approval_record:",
        '  - allowed_outcome: "<approve_action_binding|deny_action|request_scope_reduction>"',
        '  - approved_actor: "<approved_actor>"',
        '  - reviewed_snapshot_binding: "<activationSnapshot.snapshotId|cutoverSnapshot.snapshotId|no-snapshot basis>"',
        '  - audit_record: "<evidence path or audit id>"',
      ]),
    );
    expect(packet.decisions[0].requiredEvidence).toContain(
      "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
    );
    expect(packet.decisions[0].requiredEvidence).toEqual(
      expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
    );
    expect(packet.decisions[0].requiredActions).toEqual(
      expect.arrayContaining([
        "record the PO/S4 decision before promotion, rejection, or Forward merge",
        "record required human/action-binding approval before executing the high-impact action",
      ]),
    );
    expect(packet.decisions[0].requiredEvidence).toContain(
      "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
    );
    expect(packet.decisions[1].nextWorkflowRoute).toContain("version-up activation");
    expect(packet.decisions[1].requiredRecords.map((record) => record.recordName)).toEqual([
      "activation_decision_record",
      "parked_review_record",
      "external_rehearsal_plan",
      "cost_guardrails",
      "activation_provenance_requirements",
      "action_binding_approval_record",
    ]);
    expect(packet.decisions[1].allowedOutcomesByRecord).toEqual([
      {
        recordName: "activation_decision_record",
        allowedOutcomes: [
          "activate_future_version",
          "reject_or_archive",
          "keep_parked_with_review_date",
        ],
      },
      {
        recordName: "parked_review_record",
        allowedOutcomes: ["review_scheduled", "mark_stale", "route_to_activation_decision"],
      },
      {
        recordName: "external_rehearsal_plan",
        allowedOutcomes: ["evidence_present", "pending_evidence", "request_scope_reduction"],
      },
      {
        recordName: "cost_guardrails",
        allowedOutcomes: ["within_guardrails", "pending_limits", "request_scope_reduction"],
      },
      {
        recordName: "activation_provenance_requirements",
        allowedOutcomes: ["provenance_complete", "pending_evidence", "deny_activation"],
      },
      {
        recordName: "action_binding_approval_record",
        allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
      },
    ]);
    expect(packet.decisions[1].nextWorkflowRoutesByRecord).toEqual([
      {
        recordName: "activation_decision_record",
        nextWorkflowRoute: expect.stringContaining("version-up activation"),
      },
      {
        recordName: "parked_review_record",
        nextWorkflowRoute: expect.stringContaining("version-up parked review"),
      },
      {
        recordName: "external_rehearsal_plan",
        nextWorkflowRoute: expect.stringContaining("version-up external rehearsal"),
      },
      {
        recordName: "cost_guardrails",
        nextWorkflowRoute: expect.stringContaining("version-up cost guardrails"),
      },
      {
        recordName: "activation_provenance_requirements",
        nextWorkflowRoute: expect.stringContaining("version-up provenance"),
      },
      {
        recordName: "action_binding_approval_record",
        nextWorkflowRoute: expect.stringContaining("action-binding approval gate"),
      },
    ]);
    expect(packet.decisions[1].requiredRecords[0]?.fields).toEqual([
      "allowed_outcome",
      "target_version_or_release_trigger",
      "activation_snapshot_id",
      "activation_route",
      "review_by",
      "approval_scope",
      "dry_run_plan",
      "rollback_plan",
      "source_ledger_freshness",
      "source_status_delta",
      "adoption_decision_delta",
      "workflow_route_impact",
    ]);
    expect(packet.decisions[1].recordTemplates.map((template) => template.recordName)).toEqual([
      "activation_decision_record",
      "parked_review_record",
      "external_rehearsal_plan",
      "cost_guardrails",
      "activation_provenance_requirements",
      "action_binding_approval_record",
    ]);
    expect(packet.decisions[1].recordTemplates[0]?.yamlLines).toEqual(
      expect.arrayContaining([
        "activation_decision_record:",
        '  - allowed_outcome: "<activate_future_version|reject_or_archive|keep_parked_with_review_date>"',
        '  - activation_snapshot_id: "<activationSnapshot.snapshotId>"',
        '  - rollback_plan: "<rollback_plan evidence path or runbook id>"',
      ]),
    );
    expect(packet.decisions[1].requiredEvidence).toContain(
      "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date, target_version_or_release_trigger, and activation_route",
    );
    expect(packet.decisions[1].requiredEvidence).toContain(
      "activation_snapshot_id from the current activationSnapshot.snapshotId recorded before activation approval",
    );
    expect(packet.decisions[1].requiredEvidence).toContain(
      "parked_review_record with review_owner, review_trigger, review_by_policy, stale_action, activation_dependency, and decision_packet_route",
    );
    expect(packet.decisions[1].requiredEvidence).toEqual(
      expect.arrayContaining([
        "external_rehearsal_plan records official source basis, budget, signature, access, no-secret/PII, no-prod-write, and rollback rehearsal evidence",
        "cost_guardrails records provider free-tier limits and exceed_action before activation",
        "activation_provenance_requirements records source ledger, dry-run evidence, approval evidence, and audit record before activation",
      ]),
    );
    expect(packet.decisions[1].requiredEvidence).toEqual(
      expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
    );
    expect(packet.decisions[2].requiredEvidence).toContain(
      "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
    );
    expect(packet.decisions[2].requiredEvidence).toEqual(
      expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
    );
    expect(packet.decisions[2].requiredRecords).toEqual([
      {
        recordName: "cutover_decision_record",
        fields: [
          "allowed_outcome",
          "decision_owner",
          "cutover_snapshot_id",
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
          "source_ledger_freshness",
          "source_status_delta",
          "adoption_decision_delta",
          "workflow_route_impact",
        ],
        sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
        sourceLedgerChecks: [
          {
            sourcePath: "docs/process/forward/L08-L14-verification-phase.md",
            ledgerLabel: "Cutover source ledger",
          },
        ],
      },
    ]);
    expect(packet.decisions[2].allowedOutcomesByRecord).toEqual([
      {
        recordName: "cutover_decision_record",
        allowedOutcomes: ["approve_cutover", "reject_or_defer", "request_runbook_changes"],
      },
    ]);
    expect(packet.decisions[2].nextWorkflowRoutesByRecord).toEqual([
      {
        recordName: "cutover_decision_record",
        nextWorkflowRoute: expect.stringContaining("L14 cutover decision"),
      },
    ]);
    expect(packet.decisions[2].recordTemplates[0]).toMatchObject({
      recordName: "cutover_decision_record",
      insertionHint: expect.stringContaining("irreversible apply"),
      yamlLines: expect.arrayContaining([
        "cutover_decision_record:",
        '  - allowed_outcome: "<approve_cutover|reject_or_defer|request_runbook_changes>"',
        '  - cutover_snapshot_id: "<cutoverSnapshot.snapshotId>"',
        '  - execution_window_or_freeze_policy: "<execution_window_or_freeze_policy>"',
      ]),
    });
    expect(packet.decisions[2].nextWorkflowRoute).toContain("cutover_decision_record");
  });

  it("marks old decision packets stale after the configured freshness window", () => {
    const packet = completionDecisionPacketForOutstanding(
      analyzeOutstandingWork(
        [{ planId: "PLAN-S3", layer: "cross", kind: "poc", status: "draft", workflowPhase: "S3" }],
        0,
      ),
      {
        generatedAt: "2026-06-30T00:00:00.000Z",
        now: "2026-06-30T02:00:00.001Z",
        validForMinutes: 120,
      },
    );

    expect(packet.freshness).toEqual({
      validForMinutes: 120,
      expiresAt: "2026-06-30T02:00:00.000Z",
      stale: true,
      policy: "decision-packet-freshness.v1",
    });
  });

  it("is ready and has no decisions when no outstanding work remains", () => {
    const packet = completionDecisionPacketForOutstanding(
      analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], 0),
    );

    expect(packet).toEqual({
      ok: true,
      status: "ready",
      generatedFrom: "outstanding.completionReadiness",
      generatedAt: expect.any(String),
      sourceCommand: "ut-tdd completion decision-packet --json",
      freshness: {
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
      decisionCount: 0,
      blockers: [],
      decisions: [],
    });
  });
});

describe("outstandingSummaryLine", () => {
  it("非終端ありの 1 行サマリ", () => {
    expect(
      outstandingSummaryLine({
        nonTerminalPlansByLayer: { L7: 2, cross: 1 },
        nonTerminalPlansTotal: 3,
        versionUpParked: 0,
        activeDraftTotal: 3,
        openDefers: 1,
        blockersByKind: { active_draft: 3 },
        items: [],
        completionReadiness: {
          ok: false,
          status: "blocked",
          reason: "",
          blockers: [],
          requiredActions: [],
        },
      }),
    ).toBe(
      "outstanding: non-terminal PLANs=3 (L7:2, cross:1); blockers=active_draft:3; open defers=1",
    );
  });

  it("非終端ゼロは none 表記", () => {
    expect(
      outstandingSummaryLine({
        nonTerminalPlansByLayer: {},
        nonTerminalPlansTotal: 0,
        versionUpParked: 0,
        activeDraftTotal: 0,
        openDefers: 0,
        blockersByKind: {},
        items: [],
        completionReadiness: {
          ok: true,
          status: "ready",
          reason: "",
          blockers: [],
          requiredActions: [],
        },
      }),
    ).toBe("outstanding: non-terminal PLANs=0 (none); blockers=none; open defers=0");
  });
});

describe("workflowNextActionForOutstanding (U-OUTSTANDING-004)", () => {
  it("keeps whole-program blockers machine-switchable instead of relying on runtime nextAction", () => {
    const outstanding = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    );

    expect(workflowNextActionForOutstanding(outstanding)).toBe(
      "completion-blocked: record the PO/S4 decision before promotion, rejection, or Forward merge",
    );
  });

  it("reports a completion-ready action only when no outstanding rows remain", () => {
    const outstanding = analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], 0);

    expect(workflowNextActionForOutstanding(outstanding)).toMatch(/^completion-ready:/);
  });

  it("prioritizes PO/S4 decisions ahead of parked version-up and L14 signoff when selecting the top workflow action", () => {
    const outstanding = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "irreversible cutover requires PO signoff.",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "serverless share activation is future parked.",
        },
        {
          planId: "PLAN-DISCOVERY-07",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    );

    expect(workflowNextActionForOutstanding(outstanding)).toBe(
      "completion-blocked: record the PO/S4 decision before promotion, rejection, or Forward merge",
    );
    expect(workflowNextActionsForOutstanding(outstanding)).toMatchObject([
      {
        order: 1,
        planId: "PLAN-DISCOVERY-07",
        reason: "po_decision_pending",
        decisionKind: "po_s4_decision",
        decisionPacketCommand: "ut-tdd s4 decision-packet --json",
        packetCommands: ["ut-tdd s4 decision-packet --json"],
      },
      {
        order: 2,
        planId: "PLAN-L7-146",
        reason: "version_up_parked",
        decisionKind: "version_up_activation",
        decisionPacketCommand: "ut-tdd version-up activation-packet --json",
        packetCommands: ["ut-tdd version-up activation-packet --json"],
      },
      {
        order: 3,
        planId: "PLAN-M-02",
        reason: "irreversible_migration_pending",
        decisionKind: "irreversible_migration_signoff",
        decisionPacketCommand: "ut-tdd rename plan --json",
        packetCommands: ["ut-tdd rename plan --json"],
      },
    ]);
  });

  it("keeps supporting packet commands for secondary approval blockers", () => {
    const outstanding = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending and requires human approval.",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "future activation requires action-binding approval.",
        },
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "irreversible cutover requires human approval.",
        },
      ],
      0,
    );

    expect(workflowNextActionsForOutstanding(outstanding)).toMatchObject([
      {
        planId: "PLAN-DISCOVERY-10",
        decisionPacketCommand: "ut-tdd s4 decision-packet --json",
        packetCommands: [
          "ut-tdd s4 decision-packet --json",
          "ut-tdd action-binding approval-packet --json",
        ],
      },
      {
        planId: "PLAN-L7-146",
        decisionPacketCommand: "ut-tdd version-up activation-packet --json",
        packetCommands: [
          "ut-tdd version-up activation-packet --json",
          "ut-tdd action-binding approval-packet --json",
        ],
      },
      {
        planId: "PLAN-M-02",
        decisionPacketCommand: "ut-tdd rename plan --json",
        packetCommands: [
          "ut-tdd rename plan --json",
          "ut-tdd action-binding approval-packet --json",
        ],
      },
    ]);
  });

  it("returns an empty workflow action queue only when completion is ready", () => {
    const outstanding = analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], 0);

    expect(workflowNextActionsForOutstanding(outstanding)).toEqual([]);
  });
});

describe("loadOutstandingPlanRows + computeOutstandingWork", () => {
  function writePlan(
    root: string,
    name: string,
    layer: string,
    status: string,
    options: { body?: string; frontmatter?: Record<string, string> } = {},
  ): void {
    writeFileSync(
      join(root, "docs", "plans", name),
      [
        "---",
        `plan_id: ${name.replace(/\.md$/, "")}`,
        `layer: ${layer}`,
        `status: ${status}`,
        `kind: ${options.frontmatter?.kind ?? "impl"}`,
        ...Object.entries(options.frontmatter ?? {})
          .filter(([key]) => key !== "kind")
          .map(([key, value]) => `${key}: ${value}`),
        "---",
        "",
        `# ${name}`,
        options.body ?? "本文。",
      ].join("\n"),
      "utf8",
    );
  }

  it("docs/plans の frontmatter から layer/status を読み非終端を集計する", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writePlan(root, "PLAN-A.md", "L7", "draft");
      writePlan(root, "PLAN-B.md", "L7", "confirmed");
      writePlan(root, "PLAN-C.md", "cross", "in_progress");

      const rows = loadOutstandingPlanRows(root);
      expect(rows).toHaveLength(3);

      const o = computeOutstandingWork(root);
      expect(o.nonTerminalPlansByLayer).toEqual({ L7: 1, cross: 1 });
      expect(o.nonTerminalPlansTotal).toBe(2);
      expect(o.openDefers).toBe(0); // design/test-design 不在 → 0 (fail-open)
      expect(o.items.map((item) => item.planId)).toEqual(["PLAN-A", "PLAN-C"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("frontmatter/body から workflow blocker を分類する", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-classify-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writePlan(root, "PLAN-FUTURE.md", "L7", "draft", {
        frontmatter: { version_target: "future" },
        body: "Action-binding activation requires approval before external webhook use.",
      });
      writePlan(root, "PLAN-S3.md", "cross", "draft", {
        frontmatter: { kind: "poc", workflow_phase: "S3" },
        body: "S4 decision pending.",
      });

      const o = computeOutstandingWork(root);
      expect(o.blockersByKind).toEqual({
        human_approval_pending: 1,
        po_decision_pending: 1,
        version_up_parked: 1,
      });
      expect(o.items.map((item) => [item.planId, item.reason])).toEqual([
        ["PLAN-FUTURE", "version_up_parked"],
        ["PLAN-S3", "po_decision_pending"],
      ]);
      expect(o.items[0]?.requiredEvidence).toContain(
        "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date, target_version_or_release_trigger, and activation_route",
      );
      expect(o.items[0]?.requiredEvidence).toContain(
        "activation_snapshot_id from the current activationSnapshot.snapshotId recorded before activation approval",
      );
      expect(o.items[0]?.requiredEvidence).toEqual(
        expect.arrayContaining([...sourceLedgerMeaningReviewEvidence]),
      );
      expect(o.items[0]?.requiredEvidence).not.toContain(
        "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("docs/plans 不在は空集計 (fail-open)", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-empty-"));
    try {
      const o = computeOutstandingWork(root);
      expect(o.nonTerminalPlansTotal).toBe(0);
      expect(o.openDefers).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
