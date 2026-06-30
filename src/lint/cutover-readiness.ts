import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue } from "./shared";

export interface CutoverReadinessPlan {
  file: string;
  plan_id: string;
  layer: string;
  kind: string;
  status: string;
  text: string;
}

export interface CutoverReadinessInput {
  rightArmMd: string;
  outstandingTs: string;
  plans: CutoverReadinessPlan[];
}

export interface CutoverReadinessViolation {
  subject: string;
  reason: string;
}

export interface CutoverReadinessResult {
  pendingPlanIds: string[];
  violations: CutoverReadinessViolation[];
  ok: boolean;
}

const CUTOVER_RECORD_MARKERS = [
  "cutover_decision_record",
  "allowed_outcome",
  "decision_owner",
  "trigger_condition",
  "blast_radius_baseline",
  "dry_run_plan",
  "rollback_plan",
  "state_backup_plan",
  "approval_scope",
  "audit_record",
  "post_cutover_monitoring",
  "legacy_alias_policy",
] as const;

const OUTSTANDING_MARKERS = [
  "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
  "trigger_condition and blast_radius_baseline recorded before irreversible migration",
  "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
  "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
] as const;

const STATE_DIR_RENAME_PATTERN = "\\.ut" + "-tdd\\/.*\\.helix";
const IRREVERSIBLE_CUTOVER = new RegExp(
  `irreversible|不可逆|state dir|cutover|atomic migration|${STATE_DIR_RENAME_PATTERN}`,
  "i",
);

function parsePlan(file: string, content: string): CutoverReadinessPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    layer: fmValue(content, "layer") ?? "unknown",
    kind: fmValue(content, "kind") ?? "unknown",
    status: fmValue(content, "status") ?? "unknown",
    text: content,
  };
}

export function loadCutoverReadinessInput(repoRoot = process.cwd()): CutoverReadinessInput {
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

function isPendingIrreversibleCutover(plan: CutoverReadinessPlan): boolean {
  if (plan.status === "archived" || ["confirmed", "completed", "accepted"].includes(plan.status)) {
    return false;
  }
  const haystack = [plan.plan_id, plan.file, plan.layer, plan.kind, plan.status, plan.text].join(
    "\n",
  );
  return plan.layer === "L14" && IRREVERSIBLE_CUTOVER.test(haystack);
}

export function analyzeCutoverReadiness(input: CutoverReadinessInput): CutoverReadinessResult {
  const violations: CutoverReadinessViolation[] = [];

  for (const marker of CUTOVER_RECORD_MARKERS) {
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

  const pending = input.plans.filter(isPendingIrreversibleCutover);
  for (const plan of pending) {
    for (const marker of CUTOVER_RECORD_MARKERS) {
      if (!plan.text.includes(marker)) {
        violations.push({ subject: plan.plan_id, reason: `missing ${marker}` });
      }
    }
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    violations,
    ok: violations.length === 0,
  };
}

export function cutoverReadinessMessages(result: CutoverReadinessResult): string[] {
  if (result.ok) {
    const pending = result.pendingPlanIds.length > 0 ? result.pendingPlanIds.join(", ") : "none";
    return [`cutover-readiness - OK (pending=${result.pendingPlanIds.length}: ${pending})`];
  }
  const detail = result.violations
    .slice(0, 8)
    .map((v) => `${v.subject}:${v.reason}`)
    .join(", ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`cutover-readiness - violation: ${detail}${more}`];
}
