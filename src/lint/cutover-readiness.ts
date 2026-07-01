import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  allowedOutcomeSetViolation,
  fmValue,
  isClosedPlanStatus,
  missingRecordFields,
  recordFieldValue,
} from "./shared";
import {
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
} from "./source-ledger-freshness";

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
  missingSourceLedgerRows: string[];
  sourceLedgerViolations: CutoverReadinessViolation[];
  violations: CutoverReadinessViolation[];
  ok: boolean;
}

const CUTOVER_RECORD_MARKERS = [
  "cutover_decision_record",
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
  "Cutover source ledger meaning review",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "Date-only refresh",
] as const;

const CUTOVER_RECORD_NAME = "cutover_decision_record";
const CUTOVER_RECORD_FIELDS = [
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
] as const;
const CUTOVER_ALLOWED_OUTCOMES = [
  "approve_cutover",
  "reject_or_defer",
  "request_runbook_changes",
] as const;

const OUTSTANDING_MARKERS = [
  "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
  "cutover_snapshot_id from the current cutoverSnapshot.snapshotId recorded before irreversible migration approval",
  "trigger_condition and blast_radius_baseline recorded before irreversible migration",
  "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
  "execution_window_or_freeze_policy recorded before irreversible apply",
  "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
] as const;

const REQUIRED_SOURCE_LEDGER_COLUMNS = [
  "source",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "cutover use",
  "required field impact",
] as const;

const REQUIRED_SOURCE_LEDGER_ROWS = [
  "NIST SSDF SP 800-218",
  "GitHub Environments required reviewers",
  "GitHub Actions concurrency",
  "Google SRE Release Engineering",
  "OWASP LLM06:2025 Excessive Agency",
  "SLSA Provenance",
] as const;

const STATE_DIR_RENAME_PATTERN = "\\.ut" + "-tdd\\/.*\\.helix";
const IRREVERSIBLE_CUTOVER = new RegExp(
  `cutover_decision_record|PLAN-M-02|state dir|atomic migration|${STATE_DIR_RENAME_PATTERN}|(?:irreversible|不可逆).*(?:migration|rename|state dir|\\.ut-tdd|\\.helix|cutover)`,
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
  if (isClosedPlanStatus(plan.status)) return false;
  return isIrreversibleCutoverPlan(plan);
}

function requiresCutoverRecordValidation(plan: CutoverReadinessPlan): boolean {
  if (plan.status.trim().toLowerCase() === "archived") return false;
  return isIrreversibleCutoverPlan(plan);
}

function isIrreversibleCutoverPlan(plan: CutoverReadinessPlan): boolean {
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

  const sourceLedger = parseCutoverSourceLedger(input.rightArmMd);
  const missingSourceLedgerRows = REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) => !sourceLedger.rows.some((row) => row.source === source),
  );
  const freshnessViolation = sourceLedgerCheckedDateViolation(
    input.rightArmMd,
    "Cutover source ledger",
  );
  const sourceLedgerViolations: CutoverReadinessViolation[] = [
    ...(freshnessViolation
      ? [
          {
            subject: "docs/process/forward/L08-L14-verification-phase.md",
            reason: freshnessViolation,
          },
        ]
      : []),
    ...REQUIRED_SOURCE_LEDGER_COLUMNS.filter(
      (column) => !sourceLedger.columns.includes(column),
    ).map((column) => ({
      subject: "docs/process/forward/L08-L14-verification-phase.md",
      reason: `cutover source ledger missing column: ${column}`,
    })),
    ...sourceLedger.rows.flatMap((row) =>
      REQUIRED_SOURCE_LEDGER_COLUMNS.flatMap((column) => {
        const value = row[column] ?? "";
        if (value.trim() === "" || /^(TBD|TODO|-)$/.test(value.trim())) {
          return [
            {
              subject: "docs/process/forward/L08-L14-verification-phase.md",
              reason: `cutover source ledger ${row.source} has empty ${column}`,
            },
          ];
        }
        return [];
      }),
    ),
    ...sourceLedger.rows.flatMap((row) =>
      row["official URL"]?.includes("https://")
        ? []
        : [
            {
              subject: "docs/process/forward/L08-L14-verification-phase.md",
              reason: `cutover source ledger ${row.source} official URL is not https`,
            },
          ],
    ),
  ];

  for (const source of missingSourceLedgerRows) {
    violations.push({
      subject: "docs/process/forward/L08-L14-verification-phase.md",
      reason: `cutover source ledger missing row: ${source}`,
    });
  }
  violations.push(...sourceLedgerViolations);

  const pending = input.plans.filter(isPendingIrreversibleCutover);
  const recordValidationTargets = input.plans.filter(requiresCutoverRecordValidation);
  for (const plan of recordValidationTargets) {
    const missingFields = missingRecordFields(
      plan.text,
      CUTOVER_RECORD_NAME,
      CUTOVER_RECORD_FIELDS,
    );
    for (const field of missingFields) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
    const outcomeViolation = allowedOutcomeSetViolation(
      plan.text,
      CUTOVER_RECORD_NAME,
      CUTOVER_ALLOWED_OUTCOMES,
    );
    if (outcomeViolation) {
      violations.push({ subject: plan.plan_id, reason: outcomeViolation });
    }
    if (missingFields.length === 0 && !outcomeViolation) {
      violations.push(...validateCutoverExecutionSemantics(plan));
    }
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    missingSourceLedgerRows,
    sourceLedgerViolations,
    violations,
    ok: violations.length === 0,
  };
}

function validateCutoverExecutionSemantics(
  plan: CutoverReadinessPlan,
): CutoverReadinessViolation[] {
  const violations: CutoverReadinessViolation[] = [];
  const executionWindow = cutoverField(plan, "execution_window_or_freeze_policy");
  const dryRunPlan = cutoverField(plan, "dry_run_plan");
  const rollbackPlan = cutoverField(plan, "rollback_plan");
  const stateBackupPlan = cutoverField(plan, "state_backup_plan");
  const auditRecord = cutoverField(plan, "audit_record");
  const postCutoverMonitoring = cutoverField(plan, "post_cutover_monitoring");

  if (!hasFrozenWindowPolicy(executionWindow)) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "execution_window_or_freeze_policy must bind frozen HEAD, quiet window, single-run/concurrency, and drift re-approval",
    });
  }
  if (
    !mentions(dryRunPlan, ["dry-run", "rehearsal"]) ||
    !mentions(dryRunPlan, ["non-destructive", "no apply", "no write", "branch"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "dry_run_plan must describe non-destructive rehearsal before apply",
    });
  }
  if (
    !mentions(rollbackPlan, ["tag", "branch"]) ||
    !mentions(rollbackPlan, ["restore", "revert", "rollback"]) ||
    !mentions(rollbackPlan, ["alias", "shim"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "rollback_plan must bind branch/tag, restore/revert route, and alias/shim recovery",
    });
  }
  if (
    !mentions(stateBackupPlan, ["harness.db"]) ||
    !mentions(stateBackupPlan, ["memory", "logs", "handover"]) ||
    !mentions(stateBackupPlan, ["backup", "restore"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "state_backup_plan must cover harness.db, memory/logs/handover, and restore path",
    });
  }
  if (
    !mentions(auditRecord, ["command", "commands"]) ||
    !mentions(auditRecord, ["hash", "git"]) ||
    !mentions(auditRecord, ["approver"]) ||
    !mentions(auditRecord, ["result", "結果"]) ||
    !mentions(auditRecord, ["rollback"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "audit_record must capture commands, git hash, approver, result, and rollback decision",
    });
  }
  if (
    !mentions(postCutoverMonitoring, ["quiet window"]) ||
    !mentions(postCutoverMonitoring, ["smoke", "doctor"]) ||
    !mentions(postCutoverMonitoring, ["status", "feedback", "backlog"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "post_cutover_monitoring must include quiet window, smoke/doctor, status, and feedback/backlog monitoring",
    });
  }

  return violations;
}

function cutoverField(plan: CutoverReadinessPlan, field: string): string {
  return recordFieldValue(plan.text, CUTOVER_RECORD_NAME, field) ?? "";
}

function hasFrozenWindowPolicy(value: string): boolean {
  return (
    mentions(value, ["frozen HEAD", "frozen head"]) &&
    mentions(value, ["quiet window", "apply window", "window"]) &&
    mentions(value, ["single-run", "single run", "concurrency", "concurrent"]) &&
    mentions(value, ["re-approval", "reapproval", "drift"])
  );
}

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function parseCutoverSourceLedger(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("Cutover source ledger");
  const headingIndex = lines.findIndex((line) => headingPattern.test(line));
  if (headingIndex < 0) {
    return { columns: [], rows: [] };
  }
  const tableLines: string[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (line.trim() === "") {
      if (tableLines.length === 0) {
        continue;
      }
      break;
    }
    if (!line.trim().startsWith("|")) {
      if (tableLines.length === 0) {
        continue;
      }
      break;
    }
    tableLines.push(line);
  }
  if (tableLines.length < 2) {
    return { columns: [], rows: [] };
  }
  const columns = tableCells(tableLines[0]);
  const rows = tableLines.slice(2).map((line) => {
    const rowCells = tableCells(line);
    return Object.fromEntries(columns.map((column, index) => [column, rowCells[index] ?? ""]));
  });
  return { columns, rows };
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^<(.+)>$/, "$1"));
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
