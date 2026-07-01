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
  "reviewed_snapshot_binding",
  "expires_at_or_trigger",
  "audit_record",
  "action-binding-approval-packet.v1",
  "planOnly=true",
  "mustNotApprove=true",
  "approvalCommandAvailable=false",
  "approvalAllowed=false",
  "approvalBindingChecks",
  "GitHub Environments required reviewers",
  "OWASP LLM06:2025 Excessive Agency",
].join("\n");

const OUTSTANDING = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
  "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
  "review/approval evidence, reviewed snapshot binding, and expiry or trigger condition recorded before activation",
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
  "- reviewed_snapshot_binding: no snapshot-bearing packet applies to this approval",
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

  it("validates terminal high-impact approval records without emitting terminal packets", () => {
    const plans = [
      {
        file: "PLAN-CONFIRMED.md",
        plan_id: "PLAN-CONFIRMED",
        status: "confirmed",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-COMPLETED.md",
        plan_id: "PLAN-COMPLETED",
        status: "completed",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-ACCEPTED.md",
        plan_id: "PLAN-ACCEPTED",
        status: "accepted",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-ARCHIVED.md",
        plan_id: "PLAN-ARCHIVED",
        status: "archived",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-MERGED.md",
        plan_id: "PLAN-MERGED",
        status: "merged",
        text: "requires action-binding approval before deployment",
      },
    ];
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans,
    });

    expect(result.pendingPlanIds).toEqual(["PLAN-MERGED"]);
    expect(result.ok).toBe(false);
    for (const subject of ["PLAN-CONFIRMED", "PLAN-COMPLETED", "PLAN-ACCEPTED", "PLAN-MERGED"]) {
      expect(result.violations).toContainEqual({
        subject,
        reason: "missing structured action_binding_approval_record",
      });
    }
    expect(result.violations.some((violation) => violation.subject === "PLAN-ARCHIVED")).toBe(
      false,
    );

    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans,
    });
    expect(packets.map((packet) => packet.planId)).toEqual(["PLAN-MERGED"]);
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
      generatedAt: expect.any(String),
      sourceCommand: "ut-tdd action-binding approval-packet --json",
      freshness: {
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
    });
    expect(packet.approvalRecord.approved_actor).toBe("PO-named operator");
    expect(packet.approvalBindingChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "allowed_outcome",
          status: "pending",
          reason: "allowed_outcome lists the enum but does not select a decision outcome",
        }),
        expect.objectContaining({
          field: "approved_actor",
          status: "concrete",
        }),
      ]),
    );
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
    expect(packet.relatedDecisionPackets).toEqual([
      expect.objectContaining({
        role: "primary",
        command: "ut-tdd action-binding approval-packet --json",
      }),
    ]);
  });

  it("U-OUTSTANDING-011: keeps sibling S4, version-up, and rename decision packets visible", () => {
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-DISCOVERY-10.md",
          plan_id: "PLAN-DISCOVERY-10",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          decisionOutcome: null,
          text: `requires action-binding approval\n${RECORD}`,
        },
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(packets.find((p) => p.planId === "PLAN-DISCOVERY-10")?.relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command: "ut-tdd s4 decision-packet --json" }),
      ]),
    );
    expect(packets.find((p) => p.planId === "PLAN-L7-146")?.relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command: "ut-tdd version-up activation-packet --json" }),
      ]),
    );
    expect(
      packets.find((p) => p.planId === "PLAN-M-02-helix-identifier-rename")?.relatedDecisionPackets,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ command: "ut-tdd rename plan --json" })]),
    );
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
      "- reviewed_snapshot_binding: missing",
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

  it("rejects version-up and cutover approvals that do not bind the current snapshot packet", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "cutoverSnapshot.snapshotId",
          )}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "activationSnapshot.snapshotId",
          )}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-L7-146",
          reason:
            "reviewed_snapshot_binding must cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
        },
        {
          subject: "PLAN-M-02-helix-identifier-rename",
          reason:
            "reviewed_snapshot_binding must cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
        },
      ]),
    );
  });

  it("keeps snapshot field placeholders pending until the concrete current snapshot id is recorded", () => {
    const concreteSnapshot =
      "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "activationSnapshot.snapshotId",
          )}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            `cutoverSnapshot.snapshotId ${concreteSnapshot}`,
          )}`,
        },
      ],
    });

    const versionUpCheck = packets
      .find((packet) => packet.planId === "PLAN-L7-146")
      ?.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding");
    expect(versionUpCheck).toMatchObject({
      status: "pending",
      reason: "snapshot binding names the packet field but not the concrete current snapshot id",
    });
    expect(packets.find((packet) => packet.planId === "PLAN-L7-146")?.blockedReasons).toContain(
      "reviewed_snapshot_binding lacks concrete current snapshot id",
    );

    const cutoverCheck = packets
      .find((packet) => packet.planId === "PLAN-M-02-helix-identifier-rename")
      ?.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding");
    expect(cutoverCheck).toMatchObject({
      status: "concrete",
      reason: "snapshot binding matches this PLAN route",
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
    expect(
      packets.every((packet) =>
        packet.approvalBindingChecks.some(
          (check) => check.field === "allowed_outcome" && check.status === "pending",
        ),
      ),
    ).toBe(true);
    expect(
      packets.every((packet) =>
        packet.approvalBindingChecks.some(
          (check) => check.field === "approved_actor" && check.status === "pending",
        ),
      ),
    ).toBe(true);
    expect(packets.flatMap((packet) => packet.blockedReasons)).toContain(
      "missing concrete approve_action_binding decision",
    );
  });
});
