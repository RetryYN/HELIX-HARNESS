import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeOutstandingWork,
  completionDecisionPacketForOutstanding,
  completionReadinessForOutstanding,
  completionReadinessLine,
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

  it("approval 証跡フィールド名だけでは human approval blocker にしない", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DOCS-ONLY",
          layer: "L7",
          kind: "impl",
          status: "draft",
          text: [
            "approval_scope: docs-only review boundary.",
            "review_approval_evidence: approval packet template.",
            "Cloudflare source ledger row is reference material only.",
          ].join("\n"),
        },
      ],
      0,
    );

    expect(o.blockersByKind).toEqual({ active_draft: 1 });
    expect(o.items[0]).toMatchObject({
      planId: "PLAN-DOCS-ONLY",
      blockers: ["active_draft"],
      reason: "active_draft",
    });
  });

  it("自然文の高影響実行前 PO signoff は human approval blocker にする", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DEPLOY",
          layer: "L12",
          kind: "impl",
          status: "draft",
          text: "production auth infrastructure deploy requires PO signoff before execution.",
        },
      ],
      0,
    );

    expect(o.blockersByKind).toEqual({ human_approval_pending: 1 });
    expect(o.items[0]).toMatchObject({
      planId: "PLAN-DEPLOY",
      blockers: ["human_approval_pending"],
      reason: "human_approval_pending",
    });
  });

  it("version-up parked 本文があるのに version_target frontmatter が無い PLAN を frontier から落とさない", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: null,
          text: [
            "version-up parked",
            "mode=version-up",
            "activation_decision_record:",
            "- allowed_outcome: activate_future_version / reject_or_archive / keep_parked_with_review_date",
            "parked_review_record:",
            "- review_owner: PO + TL",
          ].join("\n"),
        },
      ],
      0,
    );

    expect(o.versionUpParked).toBe(1);
    expect(o.activeDraftTotal).toBe(0);
    expect(o.blockersByKind).toMatchObject({
      version_up_frontmatter_missing: 1,
      version_up_parked: 1,
    });
    expect(o.items[0]).toMatchObject({
      planId: "PLAN-L7-146",
      reason: "version_up_frontmatter_missing",
      blockers: ["version_up_frontmatter_missing", "version_up_parked"],
      requiredAction:
        "record version_target frontmatter before treating version-up parked work as a valid future-version frontier",
    });
    expect(o.semanticFeatureFrontierRecords).toEqual([
      expect.objectContaining({
        planId: "PLAN-L7-146",
        featureId: "serverless_readonly_share",
        classification: "parked_future_version",
        completionClaimAllowed: false,
      }),
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
    expect(o.completionReadiness).toMatchObject({
      authorityBoundary: "human_decision_required",
      humanDecisionRequired: true,
      humanDecisionBlockers: ["human_approval_pending", "irreversible_migration_pending"],
      workflowStateBlockers: ["non_terminal_plans"],
      autonomousWorkBlockers: ["open_defers"],
      nextAuthority: "human",
    });
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
      authorityBoundary: "none",
      humanDecisionRequired: false,
      humanDecisionBlockers: [],
      workflowStateBlockers: [],
      autonomousWorkBlockers: [],
      nextAuthority: "none",
      requiredActions: [],
      requiredActionsJa: [],
    });
  });

  it("keeps autonomous blockers separate from human decision blockers", () => {
    const readiness = completionReadinessForOutstanding({
      nonTerminalPlansByLayer: { L7: 1 },
      nonTerminalPlansTotal: 1,
      versionUpParked: 0,
      activeDraftTotal: 1,
      openDefers: 0,
      blockersByKind: {
        active_draft: 1,
      },
      items: [
        {
          planId: "PLAN-L7-WORK",
          layer: "L7",
          kind: "impl",
          status: "draft",
          workflowPhase: null,
          versionTarget: null,
          reason: "active_draft",
          blockers: ["active_draft"],
          requiredAction:
            "continue the PLAN through its declared workflow before claiming completion",
          requiredActionJa: "PLAN を宣言済み workflow に沿って進めてから completion を主張する",
          requiredActions: [
            "continue the PLAN through its declared workflow before claiming completion",
          ],
          requiredActionsJa: ["PLAN を宣言済み workflow に沿って進めてから completion を主張する"],
          requiredEvidence: [],
        },
      ],
    });

    expect(readiness).toMatchObject({
      ok: false,
      authorityBoundary: "automation_work_required",
      humanDecisionRequired: false,
      humanDecisionBlockers: [],
      workflowStateBlockers: ["non_terminal_plans"],
      autonomousWorkBlockers: ["active_draft"],
      nextAuthority: "automation",
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
          text: "S4 decision_outcome is PO gated; external visualization activation requires human approval before execution.",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "version-up parked Cloudflare HMAC webhook activation requires action-binding approval before external execution.",
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
      authorityBoundary: "human_decision_required",
      humanDecisionRequired: true,
      humanDecisionBlockers: [
        "human_approval_pending",
        "irreversible_migration_pending",
        "po_decision_pending",
        "version_up_parked",
      ],
      workflowStateBlockers: ["non_terminal_plans"],
      autonomousWorkBlockers: [],
      nextAuthority: "human",
      decisionCount: 3,
      blockers: expect.arrayContaining([
        "irreversible_migration_pending",
        "non_terminal_plans",
        "po_decision_pending",
        "version_up_parked",
      ]),
      semanticMeaningSummary: {
        frontierRecordCount: 3,
        confirmedCurrentMeaningRecordCount: 11,
        completionClaimAllowed: false,
        sourcePaths: [
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
        ],
      },
    });
    expect(packet.semanticFeatureFrontierRecords.map((record) => record.featureId)).toEqual([
      "asset_progress_visualization",
      "serverless_readonly_share",
      "name_cutover",
    ]);
    expect(packet.confirmedCurrentMeaningRecords).toHaveLength(11);
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
      [
        "PLAN-M-02",
        "ut-tdd rename plan --json",
        ["ut-tdd rename plan --json", "ut-tdd action-binding approval-packet --json"],
      ],
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
    expect(packet.decisions[2].allowedOutcomesByRecord).toEqual([
      {
        recordName: "cutover_decision_record",
        allowedOutcomes: ["approve_cutover", "reject_or_defer", "request_runbook_changes"],
      },
      {
        recordName: "action_binding_approval_record",
        allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
      },
    ]);
    expect(packet.decisions[2].nextWorkflowRoutesByRecord).toEqual([
      {
        recordName: "cutover_decision_record",
        nextWorkflowRoute: expect.stringContaining("L14 cutover decision"),
      },
      {
        recordName: "action_binding_approval_record",
        nextWorkflowRoute: expect.stringContaining("action-binding approval gate"),
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
      authorityBoundary: "none",
      humanDecisionRequired: false,
      humanDecisionBlockers: [],
      workflowStateBlockers: [],
      autonomousWorkBlockers: [],
      nextAuthority: "none",
      semanticMeaningSummary: {
        frontierRecordCount: 0,
        confirmedCurrentMeaningRecordCount: 11,
        completionClaimAllowed: true,
        sourcePaths: [
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
        ],
      },
      semanticFeatureFrontierRecords: [],
      confirmedCurrentMeaningRecords: expect.any(Array),
      decisionCount: 0,
      blockers: [],
      humanReviewBundle: {
        schemaVersion: "completion-decision-human-review-bundle.v1",
        status: "ready",
        sourceCommand: "ut-tdd completion decision-packet --json",
        generatedAt: expect.any(String),
        decisionCount: 0,
        nextAuthority: "none",
        completionClaimAllowed: true,
        items: [],
      },
      decisions: [],
    });
    expect(packet.confirmedCurrentMeaningRecords).toHaveLength(11);
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
          authorityBoundary: "automation_work_required",
          humanDecisionRequired: false,
          humanDecisionBlockers: [],
          workflowStateBlockers: [],
          autonomousWorkBlockers: [],
          nextAuthority: "automation",
          requiredActions: [],
          requiredActionsJa: [],
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
          authorityBoundary: "none",
          humanDecisionRequired: false,
          humanDecisionBlockers: [],
          workflowStateBlockers: [],
          autonomousWorkBlockers: [],
          nextAuthority: "none",
          requiredActions: [],
          requiredActionsJa: [],
        },
      }),
    ).toBe("outstanding: non-terminal PLANs=0 (none); blockers=none; open defers=0");
  });
});

describe("completionReadinessLine", () => {
  it("prints authority blocker classes in text status output", () => {
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

    expect(completionReadinessLine(o)).toContain(
      "authority-blockers=human:human_approval_pending,irreversible_migration_pending workflow-state:non_terminal_plans automation:open_defers",
    );
  });

  it("prints ready without blocker classes when completion is ready", () => {
    const o = analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], 0);

    expect(completionReadinessLine(o)).toBe("completion: ready (no outstanding work)");
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
        requiredAction: "record the PO/S4 decision before promotion, rejection, or Forward merge",
        nextWorkflowRoute:
          "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded",
        decisionPacketCommand: "ut-tdd s4 decision-packet --json",
        packetCommands: ["ut-tdd s4 decision-packet --json"],
        scopedDecisionPacketCommand: "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07",
        scopedPacketCommands: ["ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-07"],
        supportingPacketSummaries: [
          {
            command: "ut-tdd s4 decision-packet --json",
            schemaVersion: "s4-decision-packet.v1",
            matrixField: "decisionVerificationCommandMatrix",
            expectedMatrixCount: 8,
            requiredReviewFields: expect.arrayContaining([
              "planOnly",
              "mustNotDecide",
              "decisionCommandAvailable",
              "decisionAllowed",
              "allowedOutcomes",
              "decisionRecord",
              "decisionRecord.allowed_outcome",
              "decisionRecord.decision_owner",
              "decisionRecord.decision_basis",
              "decisionRecord.verified_evidence",
              "decisionRecord.stakeholder_review_or_proxy",
              "decisionRecord.acceptance_gap",
              "decisionRecord.unresolved_risk",
              "decisionRecord.external_source_basis",
              "decisionRecord.route_impact",
              "decisionRecord.forward_route",
              "decisionRecord.reverse_fullback_required",
              "decisionRecord.promotion_strategy_or_rejection_pivot_rationale",
              "recordTemplates",
              "decisionEvidenceChecklist",
              "outcomeRouteMatrix",
              "outcomeRouteMatrix.outcome",
              "outcomeRouteMatrix.routePolicy",
              "outcomeRouteMatrix.requiredEvidence",
              "semanticFeatureFrontierRecord",
              "provenanceRequirements",
              "provenanceRequirements.evidence",
              "decisionVerificationCommandMatrix.command",
              "decisionVerificationCommandMatrix.writePolicy",
              "decisionVerificationCommandMatrix.evidence",
              "relatedDecisionPackets",
              "relatedDecisionPackets.scopedCommand",
              "nextWorkflowRoutes",
              "nextWorkflowRoutes.route",
              "blockedReasons",
            ]),
            requiredMatrixFields: expect.arrayContaining([
              "sourceCheckedAt",
              "latestOfficialStatus",
              "sourceStatusDelta",
              "adoptionDecision",
              "adoptionDecisionDelta",
              "workflowRouteImpact",
            ]),
          },
        ],
      },
      {
        order: 2,
        planId: "PLAN-L7-146",
        reason: "version_up_parked",
        decisionKind: "version_up_activation",
        requiredAction:
          "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
        nextWorkflowRoute:
          "version-up activation -> add-feature/rejection path, with approval boundary preserved",
        decisionPacketCommand: "ut-tdd version-up activation-packet --json",
        packetCommands: ["ut-tdd version-up activation-packet --json"],
        scopedDecisionPacketCommand:
          "ut-tdd version-up activation-packet --json --plan PLAN-L7-146",
        scopedPacketCommands: ["ut-tdd version-up activation-packet --json --plan PLAN-L7-146"],
        supportingPacketSummaries: [
          {
            command: "ut-tdd version-up activation-packet --json",
            schemaVersion: "version-up-activation-packet.v1",
            matrixField: "activationVerificationCommandMatrix",
            expectedMatrixCount: 10,
            requiredReviewFields: expect.arrayContaining([
              "semanticFeatureFrontierRecord",
              "activationDecision",
              "activationDecision.activation_snapshot_id",
              "activationDecision.target_version_or_release_trigger",
              "activationDecision.dry_run_plan",
              "activationDecision.rollback_plan",
              "parkedReview",
              "parkedReview.decision_packet_route",
              "actionBindingApproval",
              "recordTemplates",
              "activationReadinessSummary",
              "activationReadinessSummary.status",
              "activationReadinessSummary.pendingCheckNames",
              "activationReadinessSummary.activationAllowed",
              "activationReadinessChecks",
              "activationReadinessChecks.status",
              "activationReadinessChecks.evidence",
              "activationSnapshot",
              "activationSnapshot.snapshotId",
              "activationSnapshot.sourceLedgerRowsDigest",
              "activationSnapshot.versionDryRunDigest",
              "activationSnapshot.evidenceDigest",
              "externalRehearsalPlan",
              "externalRehearsalPlan.evidence",
              "costGuardrails",
              "costGuardrails.freeLimit",
              "costGuardrails.activationImpact",
              "provenanceRequirements",
              "provenanceRequirements.evidence",
              "sourceLedgerFreshness",
              "sourceLedgerFreshness.rowsDigest",
              "versionDryRunEvidence",
              "versionDryRunEvidence.digest",
              "versionDryRunEvidence.semverChange",
              "versionDryRunEvidence.releaseTagExists",
              "versionDryRunEvidence.releaseTriggerResolved",
              "securityChecklistPacket.securityChecks",
              "securityChecklistPacket.securityChecks.status",
              "securityChecklistPacket.securityChecks.evidence",
              "securityChecklistPacket.securityChecks.reason",
              "securityChecklistPacket.securityChecks.requiredEvidence",
              "securityChecklistPacket.securityChecks.adoptionDecision",
              "securityChecklistPacket.securityChecks.workflowRouteImpact",
              "reapprovalTriggers",
              "reapprovalTriggers.requiredAction",
              "relatedDecisionPackets",
              "nextWorkflowRoutes",
              "blockedReasons",
            ]),
            requiredMatrixFields: expect.arrayContaining([
              "sourceCheckedAt",
              "latestOfficialStatus",
              "sourceStatusDelta",
              "adoptionDecision",
              "adoptionDecisionDelta",
              "workflowRouteImpact",
            ]),
          },
        ],
      },
      {
        order: 3,
        planId: "PLAN-M-02",
        reason: "irreversible_migration_pending",
        decisionKind: "irreversible_migration_signoff",
        requiredAction:
          "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
        nextWorkflowRoute:
          "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
        decisionPacketCommand: "ut-tdd rename plan --json",
        packetCommands: [
          "ut-tdd rename plan --json",
          "ut-tdd action-binding approval-packet --json",
        ],
        scopedDecisionPacketCommand: "ut-tdd rename plan --json",
        scopedPacketCommands: [
          "ut-tdd rename plan --json",
          "ut-tdd action-binding approval-packet --json --plan PLAN-M-02",
        ],
        supportingPacketSummaries: [
          {
            command: "ut-tdd rename plan --json",
            schemaVersion: "identifier-rename-cutover-plan.v1",
            matrixField: "verificationCommandMatrix",
            expectedMatrixCount: 10,
            requiredReviewFields: expect.arrayContaining([
              "semanticFeatureFrontierRecord",
              "recordTemplates",
              "cutoverSnapshot",
              "cutoverSnapshot.snapshotId",
              "cutoverSnapshot.repoHeadSha",
              "cutoverSnapshot.worktreeClean",
              "cutoverSnapshot.worktreeStatusDigest",
              "cutoverSnapshot.worktreeDirtyPathCount",
              "cutoverSnapshot.blastRadiusDigest",
              "cutoverSnapshot.approvalScopeDigest",
              "cutoverSnapshot.evidenceDigest",
              "cutoverSnapshot.evidenceArtifactsDigest",
              "cutoverSnapshot.evidenceArtifactsPresent",
              "cutoverSnapshot.missingEvidenceArtifacts",
              "cutoverSnapshot.evidenceArtifacts.sha256",
              "cutoverSnapshot.sourceLedgerRowsDigest",
              "snapshotReview",
              "snapshotReview.currentSnapshotId",
              "snapshotReview.cutoverSnapshotMatchesCurrent",
              "snapshotReview.actionBindingSnapshotMatchesCurrent",
              "snapshotReview.requiredAction",
              "cutoverCategoryChecklist",
              "cutoverCategoryChecklist.samplePaths",
              "cutoverCategoryChecklist.verificationCommand",
              "sourceLedgerFreshness",
              "sourceLedgerFreshness.rowsDigest",
              "cutoverRunbook",
              "cutoverRunbook.command",
              "cutoverRunbook.writePolicy",
              "cutoverRunbook.evidencePath",
              "dryRunPlan",
              "rollbackPlan",
              "monitoringPlan",
              "stateBackupManifest",
              "stateBackupManifest.path",
              "stateBackupManifest.restoreEvidencePath",
              "stateBackupManifest.restoreDrillRequired",
              "freezePolicy",
              "freezePolicy.concurrencyPolicy",
              "freezePolicy.reapprovalTriggers",
              "provenanceRequirements",
              "provenanceRequirements.evidence",
              "relatedDecisionPackets",
              "blockedReasons",
              "approvalGate",
              "approvalGate.requiredDecision",
              "approvalGate.requiredActionBinding",
              "approvalGate.reviewedSnapshotBindingRequired",
            ]),
            requiredMatrixFields: expect.arrayContaining([
              "sourceCheckedAt",
              "latestOfficialStatus",
              "sourceStatusDelta",
              "adoptionDecision",
              "adoptionDecisionDelta",
              "workflowRouteImpact",
            ]),
          },
          {
            command: "ut-tdd action-binding approval-packet --json",
            schemaVersion: "action-binding-approval-packet.v1",
            matrixField: "approvalVerificationCommandMatrix",
            expectedMatrixCount: 10,
            requiredReviewFields: expect.arrayContaining([
              "planOnly",
              "approvalAllowed",
              "approvalRecord.approved_actor",
              "approvalRecord.approved_tool",
              "approvalRecord.approved_target",
              "approvalRecord.approved_params",
              "approvalRecord.reviewed_snapshot_binding",
              "approvalBindingChecks.approved_actor",
              "approvalBindingChecks.approved_tool",
              "approvalBindingChecks.approved_target",
              "approvalBindingChecks.approved_params",
              "approvalBindingChecks.reviewed_snapshot_binding",
              "approvalBindingChecks.status",
              "approvalVerificationCommandMatrix.command",
              "relatedDecisionPackets.scopedCommand",
              "nextWorkflowRoutes.route",
            ]),
            requiredMatrixFields: expect.arrayContaining([
              "sourceCheckedAt",
              "latestOfficialStatus",
              "sourceStatusDelta",
              "adoptionDecision",
              "adoptionDecisionDelta",
              "workflowRouteImpact",
            ]),
          },
        ],
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
          text: "S4 decision pending; external visualization activation requires human approval before execution.",
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
        scopedDecisionPacketCommand: "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10",
        scopedPacketCommands: [
          "ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10",
          "ut-tdd action-binding approval-packet --json --plan PLAN-DISCOVERY-10",
        ],
        supportingPacketSummaries: [
          expect.objectContaining({
            command: "ut-tdd s4 decision-packet --json",
            matrixField: "decisionVerificationCommandMatrix",
          }),
          expect.objectContaining({
            command: "ut-tdd action-binding approval-packet --json",
            matrixField: "approvalVerificationCommandMatrix",
            requiredReviewFields: expect.arrayContaining([
              "planOnly",
              "mustNotApprove",
              "approvalCommandAvailable",
              "approvalAllowed",
              "allowedOutcomes",
              "approvalRecord",
              "approvalRecord.approved_actor",
              "approvalRecord.approved_tool",
              "approvalRecord.approved_target",
              "approvalRecord.approved_params",
              "approvalRecord.reviewed_snapshot_binding",
              "approvalRecord.expires_at_or_trigger",
              "recordTemplates",
              "approvalBindingChecks",
              "approvalBindingChecks.approved_actor",
              "approvalBindingChecks.approved_tool",
              "approvalBindingChecks.approved_target",
              "approvalBindingChecks.approved_params",
              "approvalBindingChecks.status",
              "approvalBindingChecks.reason",
              "approvalBindingChecks.requiredAction",
              "approvalVerificationCommandMatrix.command",
              "approvalVerificationCommandMatrix.writePolicy",
              "approvalVerificationCommandMatrix.evidence",
              "semanticFeatureFrontierRecords",
              "relatedDecisionPackets",
              "relatedDecisionPackets.scopedCommand",
              "nextWorkflowRoutes",
              "nextWorkflowRoutes.route",
              "blockedReasons",
            ]),
          }),
        ],
      },
      {
        planId: "PLAN-L7-146",
        decisionPacketCommand: "ut-tdd version-up activation-packet --json",
        packetCommands: [
          "ut-tdd version-up activation-packet --json",
          "ut-tdd action-binding approval-packet --json",
        ],
        scopedDecisionPacketCommand:
          "ut-tdd version-up activation-packet --json --plan PLAN-L7-146",
        scopedPacketCommands: [
          "ut-tdd version-up activation-packet --json --plan PLAN-L7-146",
          "ut-tdd action-binding approval-packet --json --plan PLAN-L7-146",
        ],
        supportingPacketSummaries: [
          expect.objectContaining({
            command: "ut-tdd version-up activation-packet --json",
            matrixField: "activationVerificationCommandMatrix",
            requiredReviewFields: expect.arrayContaining([
              "activationDecision.activation_snapshot_id",
              "activationDecision.dry_run_plan",
              "activationSnapshot.versionDryRunDigest",
              "activationSnapshot.evidenceDigest",
              "activationReadinessChecks.evidence",
              "externalRehearsalPlan.evidence",
              "costGuardrails.activationImpact",
              "versionDryRunEvidence.releaseTriggerResolved",
              "securityChecklistPacket.securityChecks.status",
              "securityChecklistPacket.securityChecks.evidence",
              "securityChecklistPacket.securityChecks.reason",
              "securityChecklistPacket.securityChecks.workflowRouteImpact",
              "reapprovalTriggers.requiredAction",
            ]),
          }),
          expect.objectContaining({
            command: "ut-tdd action-binding approval-packet --json",
            matrixField: "approvalVerificationCommandMatrix",
            requiredReviewFields: expect.arrayContaining([
              "planOnly",
              "mustNotApprove",
              "approvalCommandAvailable",
              "approvalAllowed",
              "approvalRecord",
              "approvalRecord.approved_actor",
              "approvalRecord.approved_tool",
              "approvalRecord.approved_target",
              "approvalRecord.approved_params",
              "approvalRecord.reviewed_snapshot_binding",
              "approvalRecord.expires_at_or_trigger",
              "recordTemplates",
              "approvalBindingChecks",
              "approvalBindingChecks.approved_actor",
              "approvalBindingChecks.approved_tool",
              "approvalBindingChecks.approved_target",
              "approvalBindingChecks.approved_params",
              "approvalBindingChecks.status",
              "approvalBindingChecks.requiredAction",
              "approvalVerificationCommandMatrix.command",
              "approvalVerificationCommandMatrix.evidence",
              "semanticFeatureFrontierRecords",
              "relatedDecisionPackets",
              "relatedDecisionPackets.scopedCommand",
              "nextWorkflowRoutes",
              "nextWorkflowRoutes.route",
              "blockedReasons",
            ]),
          }),
        ],
      },
      {
        planId: "PLAN-M-02",
        decisionPacketCommand: "ut-tdd rename plan --json",
        packetCommands: [
          "ut-tdd rename plan --json",
          "ut-tdd action-binding approval-packet --json",
        ],
        scopedDecisionPacketCommand: "ut-tdd rename plan --json",
        scopedPacketCommands: [
          "ut-tdd rename plan --json",
          "ut-tdd action-binding approval-packet --json --plan PLAN-M-02",
        ],
        supportingPacketSummaries: [
          expect.objectContaining({
            command: "ut-tdd rename plan --json",
            matrixField: "verificationCommandMatrix",
            requiredReviewFields: expect.arrayContaining([
              "cutoverSnapshot.blastRadiusDigest",
              "cutoverSnapshot.worktreeClean",
              "cutoverSnapshot.evidenceArtifactsDigest",
              "cutoverSnapshot.sourceLedgerRowsDigest",
              "snapshotReview.currentSnapshotId",
              "snapshotReview.requiredAction",
              "cutoverCategoryChecklist.verificationCommand",
              "sourceLedgerFreshness.rowsDigest",
              "cutoverRunbook.writePolicy",
              "cutoverRunbook.evidencePath",
              "stateBackupManifest.restoreEvidencePath",
              "freezePolicy.concurrencyPolicy",
              "provenanceRequirements.evidence",
              "approvalGate.reviewedSnapshotBindingRequired",
            ]),
          }),
          expect.objectContaining({
            command: "ut-tdd action-binding approval-packet --json",
            matrixField: "approvalVerificationCommandMatrix",
            requiredReviewFields: expect.arrayContaining([
              "planOnly",
              "approvalAllowed",
              "approvalRecord.approved_actor",
              "approvalRecord.approved_tool",
              "approvalRecord.approved_target",
              "approvalRecord.approved_params",
              "approvalRecord.reviewed_snapshot_binding",
              "approvalBindingChecks.approved_actor",
              "approvalBindingChecks.approved_tool",
              "approvalBindingChecks.approved_target",
              "approvalBindingChecks.approved_params",
              "approvalBindingChecks.reviewed_snapshot_binding",
              "approvalBindingChecks.status",
              "approvalVerificationCommandMatrix.command",
              "relatedDecisionPackets.scopedCommand",
              "nextWorkflowRoutes.route",
            ]),
          }),
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

  it("consumer setup state は setup ready を whole-program completion に読み替えない", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-consumer-setup-"));
    try {
      mkdirSync(join(root, ".ut-tdd", "state"), { recursive: true });
      writeFileSync(
        join(root, ".ut-tdd", "state", "project-setup.json"),
        `${JSON.stringify(
          {
            schemaVersion: "helix-project-setup-state.v1",
            setupCommand: "ut-tdd setup project",
            phase: "0-A",
            decidedAt: "2026-07-02T00:00:00.000Z",
            decidedBy: "fallback",
            objectiveBoundary: {
              scope: "consumer_setup_readiness_not_whole_program_completion",
              progressPercent: 90,
              completionClaimAllowed: false,
            },
            postSetupWorkflow: {
              nextRoute: "ready",
              readinessOk: true,
              verificationCommands: ["ut-tdd completion decision-packet --json"],
            },
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const o = computeOutstandingWork(root);
      expect(o.completionReadiness).toMatchObject({
        ok: false,
        status: "blocked",
        blockers: ["consumer_setup_boundary", "non_terminal_plans"],
      });
      expect(o.items).toEqual([
        expect.objectContaining({
          planId: "CONSUMER-SETUP-BOUNDARY",
          layer: "L14",
          kind: "setup",
          status: "in_progress",
          reason: "consumer_setup_boundary",
          requiredAction:
            "start or select the project PLAN and record real project acceptance evidence before claiming whole-program completion",
        }),
      ]);

      const packet = completionDecisionPacketForOutstanding(o, {
        generatedAt: "2026-07-02T00:00:00.000Z",
        now: "2026-07-02T00:00:00.000Z",
      });
      expect(packet).toMatchObject({
        ok: false,
        status: "blocked",
        semanticMeaningSummary: {
          completionClaimAllowed: false,
        },
        decisions: [
          {
            planId: "CONSUMER-SETUP-BOUNDARY",
            blockerReason: "consumer_setup_boundary",
            decisionKind: "workflow_continuation",
            decisionPacketCommand: "ut-tdd completion decision-packet --json",
            allowedOutcomes: ["start_project_plan", "keep_setup_only", "record_first_run_evidence"],
            requiredRecords: [
              expect.objectContaining({
                recordName: "consumer_setup_boundary_record",
                sourcePaths: expect.arrayContaining([".ut-tdd/state/project-setup.json"]),
              }),
            ],
          },
        ],
      });
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
