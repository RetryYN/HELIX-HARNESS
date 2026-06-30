import { describe, expect, it } from "vitest";
import {
  actionBindingApprovalReadinessMessages,
  analyzeActionBindingApprovalReadiness,
  loadActionBindingApprovalReadinessInput,
} from "../src/lint/action-binding-approval-readiness";

const RIGHT_ARM = [
  "Action-binding approval decision record",
  "action_binding_approval_record",
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "review_approval_evidence",
  "expires_at_or_trigger",
  "audit_record",
  "GitHub Environments required reviewers",
  "OWASP LLM06:2025 Excessive Agency",
].join("\n");

const OUTSTANDING = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, review_approval_evidence, expires_at_or_trigger, and audit_record",
  "approval scope binds actor/tool/target/params before activation",
  "review/approval evidence and expiry or trigger condition recorded before activation",
].join("\n");

const RECORD = [
  "action_binding_approval_record:",
  "- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`",
  "- approval_policy_or_named_approver: PO approval policy",
  "- approval_scope: actor/tool/target/params for a high-impact action",
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
      ]),
    );
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
});
