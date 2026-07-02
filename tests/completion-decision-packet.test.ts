import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeCompletionDecisionPacket,
  completionDecisionPacketMessages,
  loadCompletionDecisionPacketInput,
  recordTemplateContractViolations,
} from "../src/lint/completion-decision-packet";
import {
  analyzeOutstandingWork,
  type CompletionDecisionPacket,
  completionDecisionPacketForOutstanding,
  requiredRecordsForBlockers,
} from "../src/lint/outstanding";

function basePacket(): CompletionDecisionPacket {
  return completionDecisionPacketForOutstanding(
    analyzeOutstandingWork(
      [
        {
          planId: "PLAN-S3",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    ),
    {
      generatedAt: "2026-06-30T00:00:00.000Z",
      now: "2026-06-30T00:30:00.000Z",
      validForMinutes: 60,
      sourceCommand: "ut-tdd completion decision-packet --json",
    },
  );
}

function versionUpPacket(): CompletionDecisionPacket {
  return completionDecisionPacketForOutstanding(
    analyzeOutstandingWork(
      [
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "serverless share activation is future parked.",
        },
      ],
      0,
    ),
    {
      generatedAt: "2026-06-30T00:00:00.000Z",
      now: "2026-06-30T00:30:00.000Z",
      validForMinutes: 60,
      sourceCommand: "ut-tdd completion decision-packet --json",
    },
  );
}

function actionBindingPacket(): CompletionDecisionPacket {
  return completionDecisionPacketForOutstanding(
    analyzeOutstandingWork(
      [
        {
          planId: "PLAN-ACTION",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "requires action-binding approval before high-impact deployment.",
        },
      ],
      0,
    ),
    {
      generatedAt: "2026-06-30T00:00:00.000Z",
      now: "2026-06-30T00:30:00.000Z",
      validForMinutes: 60,
      sourceCommand: "ut-tdd completion decision-packet --json",
    },
  );
}

describe("completion decision packet lint", () => {
  // U-OUTSTANDING-002
  it("accepts a fresh packet with source command and matching freshness metadata", () => {
    const result = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    expect(completionDecisionPacketMessages(result)[0]).toContain(
      "completion-decision-packet - OK",
    );
  });

  it("U-OUTSTANDING-014: carries supporting packet summaries for dedicated matrix review", () => {
    const packet = basePacket();

    expect(packet).toMatchObject({
      authorityBoundary: "human_decision_required",
      humanDecisionRequired: true,
      humanDecisionBlockers: ["po_decision_pending"],
      workflowStateBlockers: ["non_terminal_plans"],
      autonomousWorkBlockers: [],
      nextAuthority: "human",
    });
    expect(packet.semanticMeaningSummary).toMatchObject({
      frontierRecordCount: 1,
      confirmedCurrentMeaningRecordCount: 11,
      completionClaimAllowed: false,
    });
    expect(packet.semanticFeatureFrontierRecords).toHaveLength(1);
    expect(packet.confirmedCurrentMeaningRecords).toHaveLength(11);
    expect(packet.decisions[0].supportingPacketSummaries).toEqual([
      expect.objectContaining({
        command: "ut-tdd s4 decision-packet --json",
        runnableCommand: "bun run ut-tdd s4 decision-packet --json",
        scopedCommand: "ut-tdd s4 decision-packet --json --plan PLAN-S3",
        runnableScopedCommand: "bun run ut-tdd s4 decision-packet --json --plan PLAN-S3",
        schemaVersion: "s4-decision-packet.v1",
        matrixField: "decisionVerificationCommandMatrix",
        expectedMatrixCount: 8,
        requiredReviewFields: expect.arrayContaining([
          "decisionRecord",
          "decisionRecord.source_ledger_freshness",
          "decisionRecord.source_status_delta",
          "decisionRecord.adoption_decision_delta",
          "decisionRecord.workflow_route_impact",
          "recordTemplates",
          "decisionEvidenceChecklist",
          "decisionEvidenceChecklist.verified_evidence",
          "decisionEvidenceChecklist.stakeholder_review_or_proxy",
          "decisionEvidenceChecklist.acceptance_gap",
          "decisionEvidenceChecklist.unresolved_risk",
          "decisionEvidenceChecklist.external_source_basis",
          "decisionEvidenceChecklist.route_impact",
          "outcomeRouteMatrix",
          "semanticFeatureFrontierRecord",
          "provenanceRequirements",
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
      }),
    ]);
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");
    expect(result.ok).toBe(true);
    expect(packet.decisions[0]).toMatchObject({
      runnableDecisionPacketCommand: "bun run ut-tdd s4 decision-packet --json",
      runnablePacketCommands: ["bun run ut-tdd s4 decision-packet --json"],
      runnableScopedDecisionPacketCommand:
        "bun run ut-tdd s4 decision-packet --json --plan PLAN-S3",
      runnableScopedPacketCommands: ["bun run ut-tdd s4 decision-packet --json --plan PLAN-S3"],
    });
    const versionPacket = versionUpPacket();
    const versionSummary = versionPacket.decisions[0].supportingPacketSummaries.find(
      (summary) => summary.command === "ut-tdd version-up activation-packet --json",
    );
    expect(versionSummary?.requiredReviewFields).toEqual(
      expect.arrayContaining([
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
        "securityChecklistPacket.securityChecks.requiredEvidence",
        "securityChecklistPacket.securityChecks.adoptionDecision",
        "securityChecklistPacket.securityChecks.workflowRouteImpact",
        "reapprovalTriggers",
        "reapprovalTriggers.requiredAction",
        "relatedDecisionPackets",
        "nextWorkflowRoutes",
        "blockedReasons",
      ]),
    );
    const approvalPacket = actionBindingPacket();
    const approvalSummary = approvalPacket.decisions[0].supportingPacketSummaries.find(
      (summary) => summary.command === "ut-tdd action-binding approval-packet --json",
    );
    expect(approvalSummary?.requiredReviewFields).toEqual(
      expect.arrayContaining([
        "approvalRecord.allowed_outcome",
        "approvalRecord.approval_policy_or_named_approver",
        "approvalRecord.approval_scope",
        "approvalRecord.approved_actor",
        "approvalRecord.approved_tool",
        "approvalRecord.approved_target",
        "approvalRecord.approved_params",
        "approvalRecord.review_approval_evidence",
        "approvalRecord.reviewed_snapshot_binding",
        "approvalRecord.expires_at_or_trigger",
        "approvalRecord.audit_record",
        "approvalBindingChecks.allowed_outcome",
        "approvalBindingChecks.approval_scope",
        "approvalBindingChecks.approved_actor",
        "approvalBindingChecks.approved_tool",
        "approvalBindingChecks.approved_target",
        "approvalBindingChecks.approved_params",
        "approvalBindingChecks.review_approval_evidence",
        "approvalBindingChecks.reviewed_snapshot_binding",
        "approvalBindingChecks.expires_at_or_trigger",
        "approvalBindingChecks.audit_record",
      ]),
    );
  });

  it("rejects packets whose authority boundary hides required human decisions", () => {
    const packet = {
      ...basePacket(),
      authorityBoundary: "automation_work_required" as const,
      humanDecisionRequired: false,
      humanDecisionBlockers: [],
      workflowStateBlockers: [],
      autonomousWorkBlockers: ["non_terminal_plans", "po_decision_pending"],
      nextAuthority: "automation" as const,
    };

    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_authority_boundary",
          detail: "authorityBoundary=automation_work_required expected=human_decision_required",
        },
        {
          reason: "invalid_authority_boundary",
          detail: "humanDecisionRequired=false expected=true",
        },
        {
          reason: "invalid_authority_boundary",
          detail: "humanDecisionBlockers= expected=po_decision_pending",
        },
        {
          reason: "invalid_authority_boundary",
          detail: "workflowStateBlockers= expected=non_terminal_plans",
        },
        {
          reason: "invalid_authority_boundary",
          detail: "autonomousWorkBlockers=non_terminal_plans,po_decision_pending expected=",
        },
        {
          reason: "invalid_authority_boundary",
          detail: "nextAuthority=automation expected=human",
        },
      ]),
    );
  });

  it("rejects packets that drop or drift the semantic meaning summary", () => {
    const packet = {
      ...basePacket(),
      semanticMeaningSummary: {
        ...basePacket().semanticMeaningSummary,
        frontierRecordCount: 99,
        confirmedCurrentMeaningRecordCount: 0,
        completionClaimAllowed: true,
        sourcePaths: ["docs/design/helix/L3-requirements/pillar-functional-requirements.md"],
      },
    };

    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_semantic_meaning_summary",
          detail: "frontierRecordCount=99 actual=1",
        },
        {
          reason: "invalid_semantic_meaning_summary",
          detail: "confirmedCurrentMeaningRecordCount=0 actual=11",
        },
        {
          reason: "invalid_semantic_meaning_summary",
          detail: "completionClaimAllowed=true expected=false",
        },
        {
          reason: "invalid_semantic_meaning_summary",
          detail:
            "semanticMeaningSummary sourcePaths missing docs/test-design/helix/L3-pillar-acceptance-test-design.md",
        },
      ]),
    );
  });

  it("rejects supporting packet summaries that drift from packet commands or matrix contracts", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        supportingPacketSummaries: [
          {
            ...decision.supportingPacketSummaries[0],
            matrixField: "approvalVerificationCommandMatrix" as const,
            expectedMatrixCount: 9,
            requiredReviewFields: ["decisionEvidenceChecklist"],
            requiredMatrixFields: ["sourceCheckedAt"],
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json drift expected=s4-decision-packet.v1/decisionVerificationCommandMatrix/8 actual=s4-decision-packet.v1/approvalVerificationCommandMatrix/9",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing review field=outcomeRouteMatrix",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing review field=provenanceRequirements",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing matrix field=latestOfficialStatus",
        },
      ]),
    );
  });

  it("rejects version-up summaries that omit rehearsal, cost, or security checklist review fields", () => {
    const packet = {
      ...versionUpPacket(),
      decisions: versionUpPacket().decisions.map((decision) => ({
        ...decision,
        supportingPacketSummaries: decision.supportingPacketSummaries.map((summary) =>
          summary.command === "ut-tdd version-up activation-packet --json"
            ? {
                ...summary,
                requiredReviewFields: [
                  "activationReadinessSummary",
                  "activationSnapshot.snapshotId",
                  "reapprovalTriggers",
                ],
              }
            : summary,
        ),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=externalRehearsalPlan",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=activationDecision.activation_snapshot_id",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=activationReadinessChecks.evidence",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=activationSnapshot.versionDryRunDigest",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=costGuardrails",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=versionDryRunEvidence.releaseTriggerResolved",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=securityChecklistPacket.securityChecks",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd version-up activation-packet --json missing review field=securityChecklistPacket.securityChecks.workflowRouteImpact",
        },
      ]),
    );
  });

  it("rejects S4 summaries that omit source-ledger and evidence checklist review fields", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        supportingPacketSummaries: decision.supportingPacketSummaries.map((summary) => ({
          ...summary,
          requiredReviewFields: [
            "decisionRecord",
            "recordTemplates",
            "decisionEvidenceChecklist",
            "outcomeRouteMatrix",
            "semanticFeatureFrontierRecord",
            "provenanceRequirements",
            "relatedDecisionPackets",
            "nextWorkflowRoutes",
            "blockedReasons",
          ],
        })),
      })),
    };

    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing review field=decisionRecord.source_ledger_freshness",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing review field=decisionEvidenceChecklist.verified_evidence",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json missing review field=decisionEvidenceChecklist.unresolved_risk",
        },
      ]),
    );
  });

  it("rejects action-binding summaries that omit concrete approval binding fields", () => {
    const packet = {
      ...actionBindingPacket(),
      decisions: actionBindingPacket().decisions.map((decision) => ({
        ...decision,
        supportingPacketSummaries: decision.supportingPacketSummaries.map((summary) => ({
          ...summary,
          requiredReviewFields: [
            "approvalRecord",
            "recordTemplates",
            "approvalBindingChecks",
            "semanticFeatureFrontierRecords",
            "relatedDecisionPackets",
            "nextWorkflowRoutes",
            "blockedReasons",
          ],
        })),
      })),
    };

    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd action-binding approval-packet --json missing review field=approvalRecord.approved_actor",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd action-binding approval-packet --json missing review field=approvalRecord.reviewed_snapshot_binding",
        },
        {
          reason: "invalid_supporting_packet_summary",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd action-binding approval-packet --json missing review field=approvalBindingChecks.approved_params",
        },
      ]),
    );
  });

  it("U-OUTSTANDING-015: rejects packets whose Japanese display fields drift from machine actions and routes", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredActionJa: "record the PO/S4 decision before promotion, rejection, or Forward merge",
        requiredActionsJa: [
          "record the PO/S4 decision before promotion, rejection, or Forward merge",
        ],
        nextWorkflowRouteJa:
          "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded",
        supportingPacketSummaries: decision.supportingPacketSummaries.map((summary) => ({
          ...summary,
          reviewRouteJa: summary.reviewRoute,
        })),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "invalid_japanese_display_field",
          detail:
            "decision[0] requiredActionJa mismatch expected=PO/S4 判断を記録してから昇格・却下・Forward merge へ進める actual=record the PO/S4 decision before promotion, rejection, or Forward merge",
        }),
        expect.objectContaining({
          reason: "invalid_japanese_display_field",
          detail:
            "decision[0] requiredActionsJa[0] mismatch expected=PO/S4 判断を記録してから昇格・却下・Forward merge へ進める actual=record the PO/S4 decision before promotion, rejection, or Forward merge",
        }),
        expect.objectContaining({
          reason: "invalid_japanese_display_field",
          detail:
            "decision[0] supportingPacketSummary command=ut-tdd s4 decision-packet --json reviewRouteJa mismatch expected=S4 decision evidence / outcome route / verification command を確認する actual=review S4 decision evidence, outcome routes, and verification commands",
        }),
        expect.objectContaining({
          reason: "invalid_japanese_display_field",
          detail:
            "decision[0] nextWorkflowRouteJa mismatch expected=S4 decide -> decision_outcome 記録後にのみ Reverse / Forward merge へ進む actual=S4 decide -> Reverse/Forward merge only after decision_outcome is recorded",
        }),
      ]),
    );
  });

  it("rejects stale packets after the freshness window", () => {
    const result = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T01:00:00.001Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("stale_packet");
  });

  it("rejects missing or unknown source commands", () => {
    const packet = { ...basePacket(), sourceCommand: "copied-from-chat" };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_source_command");
  });

  it("accepts packets generated by handover CURRENT.json", () => {
    const packet = { ...basePacket(), sourceCommand: "ut-tdd handover" };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(true);
    expect(result.sourceCommand).toBe("ut-tdd handover");
  });

  it("rejects freshness metadata that does not match generatedAt/window", () => {
    const packet = {
      ...basePacket(),
      freshness: {
        ...basePacket().freshness,
        expiresAt: "2026-06-30T03:00:00.000Z",
      },
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_expires_at");
  });

  it("rejects decisionCount drift from the decisions array", () => {
    const packet = { ...basePacket(), decisionCount: 99 };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("decision_count_mismatch");
  });

  it("rejects decisions without structured required records", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredRecords: [],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("missing_required_records");
  });

  it("rejects required records without fields or source paths", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredRecords: [
          {
            recordName: "s4_decision_record",
            fields: [],
            sourcePaths: [],
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_required_record");
  });

  // U-OUTSTANDING-006
  it("rejects required record source paths that are not repo-relative", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredRecords: decision.requiredRecords.map((record) => ({
          ...record,
          sourcePaths: ["/tmp/not-a-repo-source.md"],
        })),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_required_record_source_path");
  });

  // U-OUTSTANDING-006
  it("rejects missing required record source paths when repo existence is checked", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredRecords: decision.requiredRecords.map((record) => ({
          ...record,
          sourcePaths: ["docs/process/modes/missing-source.md"],
        })),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z", {
      sourcePathExists: () => false,
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_required_record_source_path");
  });

  it("rejects required record source ledgers with stale, future, or missing checked dates", () => {
    const stale = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T00:30:00.000Z", {
      sourceText: () => "S4 decision source ledger (checked 2026-01-01):",
    });
    expect(stale.ok).toBe(false);
    expect(stale.violations).toContainEqual({
      reason: "invalid_required_record_source_ledger",
      detail:
        "decision[0].requiredRecords[0] S4 decision source ledger checked date is stale: 2026-01-01 (180d > 90d) sourcePath=docs/process/modes/discovery.md",
    });

    const future = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T00:30:00.000Z", {
      sourceText: () => "S4 decision source ledger (checked 2026-07-02):",
    });
    expect(future.ok).toBe(false);
    expect(future.violations.map((violation) => violation.detail)).toContain(
      "decision[0].requiredRecords[0] S4 decision source ledger checked date is in the future: 2026-07-02 sourcePath=docs/process/modes/discovery.md",
    );

    const missing = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T00:30:00.000Z", {
      sourceText: () => "source ledger without a checked heading",
    });
    expect(missing.ok).toBe(false);
    expect(missing.violations.map((violation) => violation.detail)).toContain(
      "decision[0].requiredRecords[0] sourceLedger missing checked date label=S4 decision source ledger sourcePath=docs/process/modes/discovery.md",
    );
  });

  // U-OUTSTANDING-005
  it("rejects decisions whose required records lack record templates", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        recordTemplates: [],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("missing_record_templates");
  });

  // U-OUTSTANDING-005
  it("rejects record templates that do not cover every required field", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        recordTemplates: [
          {
            recordName: "s4_decision_record",
            insertionHint: "Add this block before S4 decision.",
            yamlLines: ["s4_decision_record:", '  - allowed_outcome: "<confirmed|rejected|pivot>"'],
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_record_template");
    expect(result.violations.map((v) => v.detail).join("\n")).toContain(
      "template missing field=decision_owner",
    );
  });

  it("U-OUTSTANDING-007: rejects record templates that cover fields but omit workflow semantic guidance", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        recordTemplates: decision.requiredRecords.map((record) => ({
          recordName: record.recordName,
          insertionHint: "Add this block before S4 decision.",
          yamlLines: [
            `${record.recordName}:`,
            ...record.fields.map((field) => `  - ${field}: "<${field}>"`),
          ],
        })),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      reason: "invalid_record_template",
      detail: "decision[0] s4_decision_record template missing guidance=confirmed",
    });
  });

  it("rejects decisions whose required records lack record-level allowed outcomes", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        allowedOutcomesByRecord: [],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("missing_allowed_outcomes_by_record");
  });

  it("rejects decisions when record-level allowed outcomes do not cover required records", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        allowedOutcomesByRecord: [
          {
            recordName: "other_record",
            allowedOutcomes: ["record_decision"],
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_allowed_outcomes_by_record");
  });

  it("U-OUTSTANDING-008: rejects record-level allowed outcomes that drift from the canonical record enum", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        allowedOutcomesByRecord: decision.allowedOutcomesByRecord.map((entry) =>
          entry.recordName === "s4_decision_record"
            ? {
                ...entry,
                allowedOutcomes: ["confirmed", "pivot", "approve_everything"],
              }
            : entry,
        ),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      reason: "invalid_allowed_outcomes_by_record",
      detail:
        "decision[0] s4_decision_record allowedOutcomes mismatch expected=confirmed,pivot,rejected actual=approve_everything,confirmed,pivot",
    });
  });

  it("rejects decisions whose required records lack record-level workflow routes", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        nextWorkflowRoutesByRecord: [],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("missing_next_routes_by_record");
  });

  it("rejects decisions when record-level workflow routes do not cover required records", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        nextWorkflowRoutesByRecord: [
          {
            recordName: "other_record",
            nextWorkflowRoute: "other route",
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_next_routes_by_record");
  });

  it("U-OUTSTANDING-008: rejects record-level workflow routes that omit canonical route semantics", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        nextWorkflowRoutesByRecord: decision.nextWorkflowRoutesByRecord.map((entry) =>
          entry.recordName === "s4_decision_record"
            ? { ...entry, nextWorkflowRoute: "S4 decide later" }
            : entry,
        ),
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      reason: "invalid_next_routes_by_record",
      detail: "decision[0] s4_decision_record route missing guidance=decision_outcome",
    });
  });

  it("U-OUTSTANDING-009: rejects duplicate or extra record metadata entries even when required records are covered", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        requiredRecords: [...decision.requiredRecords, decision.requiredRecords[0]],
        allowedOutcomesByRecord: [
          ...decision.allowedOutcomesByRecord,
          {
            recordName: "other_record",
            allowedOutcomes: ["record_decision"],
          },
        ],
        nextWorkflowRoutesByRecord: [
          ...decision.nextWorkflowRoutesByRecord,
          decision.nextWorkflowRoutesByRecord[0],
        ],
        recordTemplates: [
          ...decision.recordTemplates,
          {
            recordName: "other_record",
            insertionHint: "extra template",
            yamlLines: ["other_record:", '  - allowed_outcome: "record_decision"'],
          },
        ],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_required_record",
          detail: "decision[0].requiredRecords duplicate recordName=s4_decision_record",
        },
        {
          reason: "invalid_allowed_outcomes_by_record",
          detail: "decision[0].allowedOutcomesByRecord unexpected recordName=other_record",
        },
        {
          reason: "invalid_next_routes_by_record",
          detail: "decision[0].nextWorkflowRoutesByRecord duplicate recordName=s4_decision_record",
        },
        {
          reason: "invalid_record_template",
          detail: "decision[0].recordTemplates unexpected recordName=other_record",
        },
      ]),
    );
  });

  it("U-OUTSTANDING-011: applies the same record template contract to dedicated packet surfaces", () => {
    const decision = basePacket().decisions[0];

    expect(
      recordTemplateContractViolations({
        subject: "dedicated.s4DecisionPacket",
        requiredRecords: requiredRecordsForBlockers(["po_decision_pending"]),
        recordTemplates: decision.recordTemplates,
      }),
    ).toEqual([]);

    const weakTemplates = decision.recordTemplates.map((template) =>
      template.recordName === "s4_decision_record"
        ? {
            ...template,
            insertionHint: "Add this record before deciding.",
            yamlLines: template.yamlLines.filter((line) => !line.includes("decision_owner")),
          }
        : template,
    );

    expect(
      recordTemplateContractViolations({
        subject: "dedicated.s4DecisionPacket",
        requiredRecords: requiredRecordsForBlockers(["po_decision_pending"]),
        recordTemplates: weakTemplates,
      }),
    ).toEqual(
      expect.arrayContaining([
        {
          subject: "dedicated.s4DecisionPacket",
          reason:
            "dedicated.s4DecisionPacket s4_decision_record template missing field=decision_owner",
        },
        {
          subject: "dedicated.s4DecisionPacket",
          reason: "dedicated.s4DecisionPacket s4_decision_record template missing guidance=archive",
        },
      ]),
    );
  });

  it("U-OUTSTANDING-010: rejects top-level decision kind, outcomes, or route that drift from the blocker reason", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        decisionKind: "human_action_approval" as const,
        allowedOutcomes: ["approve_action_binding", "deny_action"],
        nextWorkflowRoute: "handle later",
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_decision_kind",
          detail:
            "decision[0] blockerReason=po_decision_pending decisionKind=human_action_approval expected=po_s4_decision",
        },
        {
          reason: "invalid_decision_allowed_outcomes",
          detail:
            "decision[0] top-level allowedOutcomes mismatch expected=confirmed,pivot,rejected actual=approve_action_binding,deny_action",
        },
        {
          reason: "invalid_decision_next_route",
          detail: "decision[0] top-level route missing guidance=S4 decide",
        },
      ]),
    );
  });

  it("rejects decision packet command drift from the blocker reason and secondary blockers", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        decisionPacketCommand: "ut-tdd completion decision-packet --json" as const,
        packetCommands: ["ut-tdd completion decision-packet --json" as const],
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_decision_packet_command",
          detail:
            "decision[0] blockerReason=po_decision_pending decisionPacketCommand=ut-tdd completion decision-packet --json expected=ut-tdd s4 decision-packet --json",
        },
        {
          reason: "invalid_decision_packet_command",
          detail:
            "decision[0] packetCommands mismatch expected=ut-tdd s4 decision-packet --json actual=ut-tdd completion decision-packet --json",
        },
      ]),
    );
  });

  it("rejects scoped packet command drift even when base packet commands are correct", () => {
    const packet = {
      ...basePacket(),
      decisions: basePacket().decisions.map((decision) => ({
        ...decision,
        scopedDecisionPacketCommand: decision.decisionPacketCommand,
        scopedPacketCommands: decision.packetCommands,
      })),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          reason: "invalid_scoped_decision_packet_command",
          detail:
            "decision[0] scopedDecisionPacketCommand mismatch expected=ut-tdd s4 decision-packet --json --plan PLAN-S3 actual=ut-tdd s4 decision-packet --json",
        },
        {
          reason: "invalid_scoped_decision_packet_command",
          detail:
            "decision[0] scopedPacketCommands mismatch expected=ut-tdd s4 decision-packet --json --plan PLAN-S3 actual=ut-tdd s4 decision-packet --json",
        },
      ]),
    );
  });

  it("rejects required record drift from secondary blockers", () => {
    const source = loadCompletionDecisionPacketInput(process.cwd(), "2026-06-30T03:00:00.000Z");
    const packet = {
      ...source,
      decisions: source.decisions.map((decision) =>
        decision.planId === "PLAN-DISCOVERY-10-helix-asset-visualization"
          ? {
              ...decision,
              requiredRecords: decision.requiredRecords.filter(
                (record) => record.recordName !== "action_binding_approval_record",
              ),
            }
          : decision,
      ),
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T03:00:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      reason: "invalid_required_record",
      detail: "decision[1].requiredRecords missing recordName=action_binding_approval_record",
    });
  });

  // U-OUTSTANDING-003
  // U-OUTSTANDING-006
  it("loads the current repo packet as fresh doctor input", () => {
    const packet = loadCompletionDecisionPacketInput(process.cwd(), "2026-07-02T03:00:00.000Z");
    const result = analyzeCompletionDecisionPacket(packet, "2026-07-02T03:00:00.000Z", {
      sourcePathExists: (sourcePath) => existsSync(join(process.cwd(), sourcePath)),
      sourceText: (sourcePath) => {
        const path = join(process.cwd(), sourcePath);
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      },
    });

    expect(result.ok).toBe(true);
    expect(result.sourceCommand).toBe("ut-tdd completion decision-packet --json");
    expect(result.validForMinutes).toBe(1440);
  });

  it("U-OUTSTANDING-014: carries source ledger freshness and meaning-review fields into terminal decision records", () => {
    const packet = loadCompletionDecisionPacketInput(process.cwd(), "2026-06-30T03:00:00.000Z");
    const sourceLedgerFields = [
      "source_ledger_freshness",
      "source_status_delta",
      "adoption_decision_delta",
      "workflow_route_impact",
    ];

    for (const recordName of [
      "s4_decision_record",
      "activation_decision_record",
      "cutover_decision_record",
    ]) {
      const record = packet.decisions
        .flatMap((decision) => decision.requiredRecords)
        .find((candidate) => candidate.recordName === recordName);
      expect(record?.fields).toEqual(expect.arrayContaining(sourceLedgerFields));
    }
  });

  it("carries activation and cutover snapshot binding fields into approval decision records", () => {
    const packet = loadCompletionDecisionPacketInput(process.cwd(), "2026-06-30T03:00:00.000Z");
    const records = packet.decisions.flatMap((decision) => decision.requiredRecords);

    expect(
      records.find((record) => record.recordName === "activation_decision_record")?.fields,
    ).toContain("activation_snapshot_id");
    expect(
      records.find((record) => record.recordName === "cutover_decision_record")?.fields,
    ).toContain("cutover_snapshot_id");
    expect(
      records.find((record) => record.recordName === "action_binding_approval_record")?.fields,
    ).toContain("reviewed_snapshot_binding");
  });

  it("carries external activation rehearsal, cost, and provenance records for version-up parked work", () => {
    const packet = loadCompletionDecisionPacketInput(process.cwd(), "2026-06-30T03:00:00.000Z");
    const versionUpDecision = packet.decisions.find(
      (decision) => decision.planId === "PLAN-L7-146-serverless-readonly-share",
    );

    expect(versionUpDecision?.requiredRecords.map((record) => record.recordName)).toEqual(
      expect.arrayContaining([
        "external_rehearsal_plan",
        "cost_guardrails",
        "activation_provenance_requirements",
      ]),
    );
    expect(
      versionUpDecision?.requiredRecords.find(
        (record) => record.recordName === "external_rehearsal_plan",
      )?.fields,
    ).toEqual(
      expect.arrayContaining([
        "official_source_basis",
        "no_prod_write_check",
        "rollback_rehearsal",
      ]),
    );
    expect(versionUpDecision?.recordTemplates.map((template) => template.recordName)).toEqual(
      expect.arrayContaining([
        "external_rehearsal_plan",
        "cost_guardrails",
        "activation_provenance_requirements",
      ]),
    );
  });
});
