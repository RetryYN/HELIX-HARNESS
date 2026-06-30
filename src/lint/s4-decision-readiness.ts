import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue, missingRecordFields } from "./shared";

export interface S4DecisionPlan {
  file: string;
  plan_id: string;
  kind: string;
  status: string;
  workflowPhase: string | null;
  decisionOutcome: string | null;
  text: string;
}

export interface S4DecisionReadinessInput {
  discoveryMd: string;
  scrumMd: string;
  outstandingTs: string;
  plans: S4DecisionPlan[];
}

export interface S4DecisionViolation {
  subject: string;
  reason: string;
}

export interface S4DecisionReadinessResult {
  pendingPlanIds: string[];
  violations: S4DecisionViolation[];
  ok: boolean;
}

const MODE_DOC_MARKERS = [
  "s4_decision_record",
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "forward_route",
  "reverse_fullback_required",
] as const;

const OUTSTANDING_MARKERS = [
  "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
  "decision_owner and decision_basis recorded before terminal status",
  "forward_route / reverse_fullback_required recorded when confirmed",
] as const;

const S4_RECORD_NAME = "s4_decision_record";
const S4_RECORD_FIELDS = [
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "forward_route",
  "reverse_fullback_required",
] as const;

function parsePlan(file: string, content: string): S4DecisionPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    kind: fmValue(content, "kind") ?? "unknown",
    status: fmValue(content, "status") ?? "unknown",
    workflowPhase: fmValue(content, "workflow_phase") ?? null,
    decisionOutcome: fmValue(content, "decision_outcome") ?? null,
    text: content,
  };
}

export function loadS4DecisionReadinessInput(repoRoot = process.cwd()): S4DecisionReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
  return {
    discoveryMd: readFileSync(join(repoRoot, "docs", "process", "modes", "discovery.md"), "utf8"),
    scrumMd: readFileSync(join(repoRoot, "docs", "process", "modes", "scrum.md"), "utf8"),
    outstandingTs: readFileSync(join(repoRoot, "src", "lint", "outstanding.ts"), "utf8"),
    plans: readdirSync(plansDir)
      .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
      .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8"))),
  };
}

function isS3PocPendingDecision(plan: S4DecisionPlan): boolean {
  return (
    plan.kind === "poc" &&
    plan.status === "draft" &&
    plan.workflowPhase === "S3" &&
    !plan.decisionOutcome
  );
}

export function analyzeS4DecisionReadiness(
  input: S4DecisionReadinessInput,
): S4DecisionReadinessResult {
  const violations: S4DecisionViolation[] = [];

  for (const doc of [
    ["docs/process/modes/discovery.md", input.discoveryMd],
    ["docs/process/modes/scrum.md", input.scrumMd],
  ] as const) {
    for (const marker of MODE_DOC_MARKERS) {
      if (!doc[1].includes(marker)) {
        violations.push({ subject: doc[0], reason: `missing ${marker}` });
      }
    }
  }

  for (const marker of OUTSTANDING_MARKERS) {
    if (!input.outstandingTs.includes(marker)) {
      violations.push({ subject: "src/lint/outstanding.ts", reason: `missing ${marker}` });
    }
  }

  const pending = input.plans.filter(isS3PocPendingDecision);
  for (const plan of pending) {
    const missingFields = missingRecordFields(plan.text, S4_RECORD_NAME, S4_RECORD_FIELDS);
    for (const field of missingFields) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    violations,
    ok: violations.length === 0,
  };
}

export function s4DecisionReadinessMessages(result: S4DecisionReadinessResult): string[] {
  if (result.ok) {
    const pending = result.pendingPlanIds.length > 0 ? result.pendingPlanIds.join(", ") : "none";
    return [`s4-decision-readiness - OK (pending=${result.pendingPlanIds.length}: ${pending})`];
  }
  const detail = result.violations
    .slice(0, 8)
    .map((v) => `${v.subject}:${v.reason}`)
    .join(", ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`s4-decision-readiness - violation: ${detail}${more}`];
}
