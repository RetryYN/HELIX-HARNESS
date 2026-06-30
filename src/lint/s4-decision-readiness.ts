import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue, missingRecordFields } from "./shared";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
} from "./source-ledger-freshness";

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
  missingSourceLedgerRows: string[];
  sourceLedgerViolations: S4DecisionViolation[];
  violations: S4DecisionViolation[];
  ok: boolean;
}

const MODE_DOC_MARKERS = [
  "s4_decision_record",
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "verified_evidence",
  "stakeholder_review_or_proxy",
  "acceptance_gap",
  "unresolved_risk",
  "external_source_basis",
  "route_impact",
  "forward_route",
  "reverse_fullback_required",
  "promotion_strategy_or_rejection_pivot_rationale",
  "S4 decision source ledger",
  "Scrum Guide 2020",
  "ISO/IEC/IEEE 29148",
  "ISTQB Glossary",
  "NIST SSDF SP 800-218",
  "adopted version/date",
  "latest official status",
  "adoption decision",
] as const;

const OUTSTANDING_MARKERS = [
  "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
  "decision_owner and decision_basis recorded before terminal status",
  "forward_route / reverse_fullback_required recorded when confirmed",
  "promotion_strategy_or_rejection_pivot_rationale recorded before terminal status",
] as const;

const S4_RECORD_NAME = "s4_decision_record";
const S4_RECORD_FIELDS = [
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "verified_evidence",
  "stakeholder_review_or_proxy",
  "acceptance_gap",
  "unresolved_risk",
  "external_source_basis",
  "route_impact",
  "forward_route",
  "reverse_fullback_required",
  "promotion_strategy_or_rejection_pivot_rationale",
] as const;

const REQUIRED_SOURCE_LEDGER_COLUMNS = [
  "source",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "S4 decision use",
  "required field impact",
] as const;

const REQUIRED_SOURCE_LEDGER_ROWS = [
  "Scrum Guide 2020",
  "ISO/IEC/IEEE 29148",
  "ISTQB Glossary",
  "NIST SSDF SP 800-218",
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

function isMisplacedPocDecisionOutcome(plan: S4DecisionPlan): boolean {
  return plan.kind === "poc" && !!plan.decisionOutcome && plan.workflowPhase !== "S4";
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
    if (!hasSourceLedgerCheckedDate(doc[1], "S4 decision source ledger")) {
      violations.push({
        subject: doc[0],
        reason: "missing S4 decision source ledger checked date",
      });
    }

    const sourceLedger = parseS4DecisionSourceLedger(doc[1]);
    for (const source of REQUIRED_SOURCE_LEDGER_ROWS.filter(
      (source) => !sourceLedger.rows.some((row) => row.source === source),
    )) {
      violations.push({
        subject: doc[0],
        reason: `S4 decision source ledger missing row: ${source}`,
      });
    }
    for (const violation of sourceLedgerViolations(doc[0], sourceLedger, doc[1])) {
      violations.push(violation);
    }
  }

  for (const marker of OUTSTANDING_MARKERS) {
    if (!input.outstandingTs.includes(marker)) {
      violations.push({ subject: "src/lint/outstanding.ts", reason: `missing ${marker}` });
    }
  }

  for (const plan of input.plans.filter(isMisplacedPocDecisionOutcome)) {
    violations.push({
      subject: plan.plan_id,
      reason: "decision_outcome requires workflow_phase=S4",
    });
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
    missingSourceLedgerRows: missingSourceLedgerRowsForDocs(input.discoveryMd, input.scrumMd),
    sourceLedgerViolations: [
      ...sourceLedgerViolations(
        "docs/process/modes/discovery.md",
        parseS4DecisionSourceLedger(input.discoveryMd),
        input.discoveryMd,
      ),
      ...sourceLedgerViolations(
        "docs/process/modes/scrum.md",
        parseS4DecisionSourceLedger(input.scrumMd),
        input.scrumMd,
      ),
    ],
    violations,
    ok: violations.length === 0,
  };
}

function missingSourceLedgerRowsForDocs(discoveryMd: string, scrumMd: string): string[] {
  const discovery = parseS4DecisionSourceLedger(discoveryMd);
  const scrum = parseS4DecisionSourceLedger(scrumMd);
  return REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) =>
      !discovery.rows.some((row) => row.source === source) ||
      !scrum.rows.some((row) => row.source === source),
  );
}

function sourceLedgerViolations(
  subject: string,
  sourceLedger: { columns: string[]; rows: Record<string, string>[] },
  sourceText = "",
): S4DecisionViolation[] {
  const freshnessViolation = sourceLedgerCheckedDateViolation(
    sourceText,
    "S4 decision source ledger",
  );
  return [
    ...(freshnessViolation ? [{ subject, reason: freshnessViolation }] : []),
    ...REQUIRED_SOURCE_LEDGER_COLUMNS.filter(
      (column) => !sourceLedger.columns.includes(column),
    ).map((column) => ({
      subject,
      reason: `S4 decision source ledger missing column: ${column}`,
    })),
    ...sourceLedger.rows.flatMap((row) =>
      REQUIRED_SOURCE_LEDGER_COLUMNS.flatMap((column) => {
        const value = row[column] ?? "";
        if (value.trim() === "" || /^(TBD|TODO|-)$/.test(value.trim())) {
          return [
            {
              subject,
              reason: `S4 decision source ledger ${row.source} has empty ${column}`,
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
              subject,
              reason: `S4 decision source ledger ${row.source} official URL is not https`,
            },
          ],
    ),
  ];
}

function parseS4DecisionSourceLedger(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("S4 decision source ledger");
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
