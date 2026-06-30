import { describe, expect, it } from "vitest";
import {
  actionBindingApprovalReadinessMessages,
  analyzeActionBindingApprovalReadiness,
  buildActionBindingApprovalPackets,
  loadActionBindingApprovalReadinessInput,
} from "../src/lint/action-binding-approval-readiness";

const RIGHT_ARM = [
  "Action-binding approval decision record",
  "action_binding_approval_record",
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "approved_actor",
  "approved_tool",
  "approved_target",
  "approved_params",
  "review_approval_evidence",
  "expires_at_or_trigger",
  "audit_record",
  "action-binding-approval-packet.v1",
  "planOnly=true",
  "mustNotApprove=true",
  "approvalCommandAvailable=false",
  "approvalAllowed=false",
  "GitHub Environments required reviewers",
  "OWASP LLM06:2025 Excessive Agency",
].join("\n");

const OUTSTANDING = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, expires_at_or_trigger, and audit_record",
  "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
  "review/approval evidence and expiry or trigger condition recorded before activation",
].join("\n");

const RECORD = [
  "action_binding_approval_record:",
  "- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`",
  "- approval_policy_or_named_approver: PO approval policy",
  "- approval_scope: limited scope for actor/tool/target/params for a high-impact action only",
  "- approved_actor: PO-named operator",
  "- approved_tool: ut-tdd CLI action wrapper",
  "- approved_target: Cloudflare deployment target",
  "- approved_params: reviewed command parameters hash",
  "- review_approval_evidence: dry-run and risk review",
  "- expires_at_or_trigger: before activation or scope change",
  "- audit_record: approver/action/result/incident route",
].join("\n");

describe("action-binding approval readiness", () => {
  it("accepts pending high-impact approval plans only when they carry structured records", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-X"]);
    expect(actionBindingApprovalReadinessMessages(result)[0]).toContain(
      "action-binding-approval-readiness - OK",
    );
  });

  it("emits non-destructive approval packets that keep high-impact execution human-gated", () => {
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(packets).toHaveLength(1);
    const packet = packets[0];
    expect(packet).toMatchObject({
      schemaVersion: "action-binding-approval-packet.v1",
      planId: "PLAN-X",
      status: "pending_action_binding_approval",
      planOnly: true,
      mustNotApprove: true,
      approvalCommandAvailable: false,
      approvalAllowed: false,
      allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
    });
    expect(packet.approvalRecord.approved_actor).toBe("PO-named operator");
    expect(packet.blockedReasons).toEqual(
      expect.arrayContaining([
        "plan carries high-impact approval scope; execution remains human-gated",
        "missing concrete approve_action_binding decision",
      ]),
    );
    expect(packet.nextWorkflowRoutes.map((route) => route.outcome)).toEqual([
      "approve_action_binding",
      "deny_action",
      "request_scope_reduction",
    ]);
  });

  it("rejects prose-only approval mentions", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: "requires action-binding approval before Cloudflare activation",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-X", reason: "missing structured action_binding_approval_record" },
        { subject: "PLAN-X", reason: "missing structured allowed_outcome" },
        { subject: "PLAN-X", reason: "missing structured approval_scope" },
        { subject: "PLAN-X", reason: "missing structured approved_actor" },
        { subject: "PLAN-X", reason: "missing structured approved_tool" },
        { subject: "PLAN-X", reason: "missing structured approved_target" },
        { subject: "PLAN-X", reason: "missing structured approved_params" },
      ]),
    );
  });

  it("rejects approval records whose allowed_outcome set drifts from the design enum", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD.replace(
            "`approve_action_binding` / `deny_action` / `request_scope_reduction`",
            "`approve_action_binding` / `approve_everything`",
          )}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "invalid allowed_outcome set for action_binding_approval_record: missing allowed_outcome deny_action,request_scope_reduction; unknown allowed_outcome approve_everything",
    );
  });

  it("U-DECISIONREC-009: rejects action-binding records that grant broad approvals or omit review/audit semantics", () => {
    const weakRecord = [
      "action_binding_approval_record:",
      "- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`",
      "- approval_policy_or_named_approver: PO approval policy",
      "- approval_scope: approve deployment",
      "- approved_actor: any operator",
      "- approved_tool: all tools",
      "- approved_target: *",
      "- approved_params: everything",
      "- review_approval_evidence: looks fine",
      "- expires_at_or_trigger: never",
      "- audit_record: note",
    ].join("\n");
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-X", reason: "approval_scope must limit the approved action scope" },
        {
          subject: "PLAN-X",
          reason: "approved_actor must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_tool must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_target must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_params must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "review_approval_evidence must name concrete review evidence before approval",
        },
        {
          subject: "PLAN-X",
          reason: "expires_at_or_trigger must define expiry or trigger-bound re-approval",
        },
        {
          subject: "PLAN-X",
          reason:
            "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
        },
      ]),
    );
  });

  it("U-DECISIONREC-009: rejects approval scope that is limited in wording but has no concrete boundary", () => {
    const weakScopeRecord = RECORD.replace(
      "limited scope for actor/tool/target/params for a high-impact action only",
      "limited scope only",
    );
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakScopeRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-X",
      reason: "approval_scope must limit the approved action scope",
    });
  });

  it("loads the current repo pending approval records", () => {
    const result = analyzeActionBindingApprovalReadiness(loadActionBindingApprovalReadinessInput());

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([
      "PLAN-DISCOVERY-10-helix-asset-visualization",
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
  });

  it("emits current repo approval packets for every pending high-impact approval PLAN", () => {
    const packets = buildActionBindingApprovalPackets(loadActionBindingApprovalReadinessInput());

    expect(packets.map((packet) => packet.planId)).toEqual([
      "PLAN-DISCOVERY-10-helix-asset-visualization",
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(packets.every((packet) => packet.approvalAllowed === false)).toBe(true);
    expect(packets.flatMap((packet) => packet.blockedReasons)).toContain(
      "missing concrete approve_action_binding decision",
    );
  });
});
