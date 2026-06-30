import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  allowedOutcomeSetViolation,
  fmValue,
  missingRecordFields,
  recordFieldValue,
} from "./shared";

export interface ActionBindingApprovalPlan {
  file: string;
  plan_id: string;
  status: string;
  text: string;
}

export interface ActionBindingApprovalReadinessInput {
  rightArmMd: string;
  outstandingTs: string;
  plans: ActionBindingApprovalPlan[];
}

export interface ActionBindingApprovalViolation {
  subject: string;
  reason: string;
}

export interface ActionBindingApprovalReadinessResult {
  pendingPlanIds: string[];
  violations: ActionBindingApprovalViolation[];
  ok: boolean;
}

export interface ActionBindingApprovalPacket {
  schemaVersion: "action-binding-approval-packet.v1";
  planId: string;
  status: "pending_action_binding_approval" | "invalid_not_pending_approval";
  planOnly: true;
  mustNotApprove: true;
  approvalCommandAvailable: false;
  approvalAllowed: false;
  allowedOutcomes: string[];
  approvalRecord: Record<string, string>;
  blockedReasons: string[];
  nextWorkflowRoutes: Array<{ outcome: string; route: string }>;
}

const ACTION_BINDING_RECORD_NAME = "action_binding_approval_record";
const ACTION_BINDING_RECORD_FIELDS = [
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
] as const;
const ACTION_BINDING_ALLOWED_OUTCOMES = [
  "approve_action_binding",
  "deny_action",
  "request_scope_reduction",
] as const;

const RIGHT_ARM_MARKERS = [
  "Action-binding approval decision record",
  ACTION_BINDING_RECORD_NAME,
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
] as const;

const OUTSTANDING_MARKERS = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, expires_at_or_trigger, and audit_record",
  "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
  "review/approval evidence and expiry or trigger condition recorded before activation",
] as const;

const HIGH_IMPACT_APPROVAL = /approval|承認|action-binding|human signoff|人間サインオフ|人間承認/i;

function parsePlan(file: string, content: string): ActionBindingApprovalPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    status: fmValue(content, "status") ?? "unknown",
    text: content,
  };
}

export function loadActionBindingApprovalReadinessInput(
  repoRoot = process.cwd(),
): ActionBindingApprovalReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
  return {
    rightArmMd: readFileSync(
      join(repoRoot, "docs", "process", "forward", "L08-L14-verification-phase.md"),
      "utf8",
    ),
    outstandingTs: readFileSync(join(repoRoot, "src", "lint", "outstanding.ts"), "utf8"),
    plans: readdirSync(plansDir)
      .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
      .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8"))),
  };
}

function isPendingHighImpactApproval(plan: ActionBindingApprovalPlan): boolean {
  if (plan.status === "archived" || ["confirmed", "completed", "accepted"].includes(plan.status)) {
    return false;
  }
  return HIGH_IMPACT_APPROVAL.test([plan.plan_id, plan.file, plan.status, plan.text].join("\n"));
}

export function analyzeActionBindingApprovalReadiness(
  input: ActionBindingApprovalReadinessInput,
): ActionBindingApprovalReadinessResult {
  const violations: ActionBindingApprovalViolation[] = [];

  for (const marker of RIGHT_ARM_MARKERS) {
    if (!input.rightArmMd.includes(marker)) {
      violations.push({
        subject: "docs/process/forward/L08-L14-verification-phase.md",
        reason: `missing ${marker}`,
      });
    }
  }
  for (const marker of OUTSTANDING_MARKERS) {
    if (!input.outstandingTs.includes(marker)) {
      violations.push({ subject: "src/lint/outstanding.ts", reason: `missing ${marker}` });
    }
  }

  const pending = input.plans.filter(isPendingHighImpactApproval);
  for (const plan of pending) {
    const missingFields = missingRecordFields(
      plan.text,
      ACTION_BINDING_RECORD_NAME,
      ACTION_BINDING_RECORD_FIELDS,
    );
    for (const field of missingFields) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
    const outcomeViolation = allowedOutcomeSetViolation(
      plan.text,
      ACTION_BINDING_RECORD_NAME,
      ACTION_BINDING_ALLOWED_OUTCOMES,
    );
    if (outcomeViolation) {
      violations.push({ subject: plan.plan_id, reason: outcomeViolation });
    }
    if (missingFields.length === 0 && !outcomeViolation) {
      violations.push(...validateActionBindingSemantics(plan));
    }
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    violations,
    ok: violations.length === 0,
  };
}

export function buildActionBindingApprovalPackets(
  input: ActionBindingApprovalReadinessInput,
): ActionBindingApprovalPacket[] {
  return input.plans
    .filter(isPendingHighImpactApproval)
    .map((plan) => buildActionBindingApprovalPacket(plan))
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

export function buildActionBindingApprovalPacket(
  plan: ActionBindingApprovalPlan,
): ActionBindingApprovalPacket {
  const approvalRecord = recordValues(plan.text, ACTION_BINDING_RECORD_NAME, [
    ...ACTION_BINDING_RECORD_FIELDS,
  ]);
  return {
    schemaVersion: "action-binding-approval-packet.v1",
    planId: plan.plan_id,
    status: isPendingHighImpactApproval(plan)
      ? "pending_action_binding_approval"
      : "invalid_not_pending_approval",
    planOnly: true,
    mustNotApprove: true,
    approvalCommandAvailable: false,
    approvalAllowed: false,
    allowedOutcomes: [...ACTION_BINDING_ALLOWED_OUTCOMES],
    approvalRecord,
    blockedReasons: actionBindingBlockedReasons(plan, approvalRecord),
    nextWorkflowRoutes: [
      {
        outcome: "approve_action_binding",
        route:
          "record named approver plus exact approved_actor/approved_tool/approved_target/approved_params, expiry, and audit evidence before any high-impact execution",
      },
      {
        outcome: "deny_action",
        route:
          "record denial rationale and route the PLAN to archive, redesign, or parked future work without executing the high-impact action",
      },
      {
        outcome: "request_scope_reduction",
        route:
          "narrow actor/tool/target/params or split the PLAN, then request a new action-binding approval packet",
      },
    ],
  };
}

function validateActionBindingSemantics(
  plan: ActionBindingApprovalPlan,
): ActionBindingApprovalViolation[] {
  const violations: ActionBindingApprovalViolation[] = [];
  const approvalScope = record(plan, "approval_scope");
  const approvedActor = record(plan, "approved_actor");
  const approvedTool = record(plan, "approved_tool");
  const approvedTarget = record(plan, "approved_target");
  const approvedParams = record(plan, "approved_params");
  const reviewEvidence = record(plan, "review_approval_evidence");
  const expiry = record(plan, "expires_at_or_trigger");
  const auditRecord = record(plan, "audit_record");

  if (!hasLimitedApprovalScope(approvalScope)) {
    violations.push({
      subject: plan.plan_id,
      reason: "approval_scope must limit the approved action scope",
    });
  }
  for (const [field, value] of [
    ["approved_actor", approvedActor],
    ["approved_tool", approvedTool],
    ["approved_target", approvedTarget],
    ["approved_params", approvedParams],
  ] as const) {
    if (isBroadApproval(value)) {
      violations.push({
        subject: plan.plan_id,
        reason: `${field} must not grant broad or wildcard approval`,
      });
    }
    if (
      mentions(value, [
        "no ",
        "no actor",
        "no tool",
        "no external",
        "no irreversible",
        "no params",
        "未承認",
      ])
    ) {
      if (!mentions(value, ["must name", "must record", "must write", "before", "承認"])) {
        violations.push({
          subject: plan.plan_id,
          reason: `${field} pending approval must state the future named binding condition`,
        });
      }
    }
  }
  if (
    !mentions(reviewEvidence, [
      "dry-run",
      "risk",
      "review",
      "evidence",
      "rollback",
      "no-secret",
      "full test",
      "doctor",
    ])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "review_approval_evidence must name concrete review evidence before approval",
    });
  }
  if (!hasExpiryOrTrigger(expiry)) {
    violations.push({
      subject: plan.plan_id,
      reason: "expires_at_or_trigger must define expiry or trigger-bound re-approval",
    });
  }
  if (
    !mentions(auditRecord, ["approver"]) ||
    !mentions(auditRecord, ["action", "command", "commands"]) ||
    !mentions(auditRecord, ["result", "結果"]) ||
    !mentions(auditRecord, ["incident", "backlog", "rollback", "monitoring"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
    });
  }

  return violations;
}

function record(plan: ActionBindingApprovalPlan, field: string): string {
  return recordFieldValue(plan.text, ACTION_BINDING_RECORD_NAME, field) ?? "";
}

function recordValues(
  text: string,
  recordName: string,
  fields: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field, recordFieldValue(text, recordName, field) ?? ""]),
  );
}

function actionBindingBlockedReasons(
  plan: ActionBindingApprovalPlan,
  approvalRecord: Record<string, string>,
): string[] {
  const reasons: string[] = [];
  if (isPendingHighImpactApproval(plan)) {
    reasons.push("plan carries high-impact approval scope; execution remains human-gated");
  } else {
    reasons.push("plan is not pending high-impact action-binding approval");
  }
  if (selectedOutcome(approvalRecord.allowed_outcome) !== "approve_action_binding") {
    reasons.push("missing concrete approve_action_binding decision");
  }
  for (const field of [
    "approved_actor",
    "approved_tool",
    "approved_target",
    "approved_params",
  ] as const) {
    const value = approvalRecord[field] ?? "";
    if (!value.trim()) {
      reasons.push(`action-binding approval lacks concrete ${field}`);
      continue;
    }
    if (isBroadApproval(value)) {
      reasons.push(`${field} must not grant broad or wildcard approval`);
    }
    if (mentions(value, ["no ", "not approved", "未承認", "while parked", "draft plan"])) {
      reasons.push(`action-binding approval lacks concrete ${field}`);
    }
  }
  if (!hasLimitedApprovalScope(approvalRecord.approval_scope ?? "")) {
    reasons.push("approval_scope must bind a limited actor/tool/target/params boundary");
  }
  if (!hasExpiryOrTrigger(approvalRecord.expires_at_or_trigger ?? "")) {
    reasons.push("approval requires expiry or trigger-bound re-approval");
  }
  return [...new Set(reasons)];
}

function selectedOutcome(value = ""): string | null {
  const normalized = value.replace(/`/g, "").trim();
  return ACTION_BINDING_ALLOWED_OUTCOMES.find((outcome) => normalized === outcome) ?? null;
}

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function isBroadApproval(value: string): boolean {
  return /\b(any|all|everything|unlimited|wildcard)\b/i.test(value) || value.includes("*");
}

function hasLimitedApprovalScope(value: string): boolean {
  if (isBroadApproval(value)) {
    return false;
  }
  const hasLimiter = mentions(value, [
    "only",
    "limited",
    "excluded",
    "out of scope",
    "限定",
    "範囲に限定",
    "対象外",
  ]);
  const hasConcreteBoundary = mentions(value, [
    ".ut-tdd",
    "access control",
    "actor",
    "adapter",
    "api",
    "bin",
    "cli",
    "cloudflare",
    "command",
    "config",
    "distribution",
    "docs/governance",
    "external",
    "github",
    "hook",
    "params",
    "read-only",
    "secret",
    "state dir",
    "target",
    "tool",
    "webhook",
    "write-capable",
  ]);
  return hasLimiter && hasConcreteBoundary;
}

function hasExpiryOrTrigger(value: string): boolean {
  return (
    /\d{4}-\d{2}-\d{2}/.test(value) ||
    mentions(value, [
      "trigger-bound",
      "expires",
      "expires if",
      "before",
      "scope change",
      "changes",
      "re-approval",
    ])
  );
}

export function actionBindingApprovalReadinessMessages(
  result: ActionBindingApprovalReadinessResult,
): string[] {
  if (result.ok) {
    const pending = result.pendingPlanIds.length > 0 ? result.pendingPlanIds.join(", ") : "none";
    return [
      `action-binding-approval-readiness - OK (pending=${result.pendingPlanIds.length}: ${pending})`,
    ];
  }
  const detail = result.violations
    .slice(0, 5)
    .map((v) => `${v.subject}: ${v.reason}`)
    .join("; ");
  const more = result.violations.length > 5 ? `; +${result.violations.length - 5} more` : "";
  return [`action-binding-approval-readiness - violation: ${detail}${more}`];
}
