import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { computeOutstandingWork, type OutstandingWork } from "./outstanding";

export interface ObjectiveEvidenceAuditInput {
  auditText: string;
  outstanding: OutstandingWork;
  repoRoot: string;
}

export interface ObjectiveEvidenceAuditResult {
  ok: boolean;
  violations: string[];
  completionStatus: "ready" | "blocked";
  provedRows: number;
}

const PROVED_REQUIREMENT_IDS = [
  "G-01",
  "G-02",
  "G-03",
  "G-04",
  "G-05",
  "G-06",
  "G-07",
  "G-08",
  "G-09",
] as const;

const COMPLETION_REQUIREMENT_ID = "G-10";

const REQUIRED_COMPLETION_ARTIFACTS = [
  "src/lint/outstanding.ts",
  "tests/outstanding.test.ts",
  "tests/cli-surface.test.ts",
  "docs/process/forward/L08-L14-verification-phase.md",
  "docs/process/gates.md",
] as const;

export function loadObjectiveEvidenceAuditInput(
  repoRoot: string = process.cwd(),
): ObjectiveEvidenceAuditInput {
  return {
    auditText: readFileSync(
      join(repoRoot, "docs", "governance", "helix-objective-evidence-audit.md"),
      "utf8",
    ),
    outstanding: computeOutstandingWork(repoRoot),
    repoRoot,
  };
}

export function analyzeObjectiveEvidenceAudit(
  input: ObjectiveEvidenceAuditInput,
): ObjectiveEvidenceAuditResult {
  const violations: string[] = [];

  for (const id of PROVED_REQUIREMENT_IDS) {
    const row = findAuditRow(input.auditText, id);
    if (!row) {
      violations.push(`${id}: row missing`);
      continue;
    }
    if (!row.includes("| proved |")) {
      violations.push(`${id}: implemented objective row must stay proved`);
    }
  }

  const completionRow = findAuditRow(input.auditText, COMPLETION_REQUIREMENT_ID);
  if (!completionRow) {
    violations.push("G-10: completion readiness row missing");
  } else {
    checkCompletionRow(input, completionRow, violations);
  }

  for (const artifact of REQUIRED_COMPLETION_ARTIFACTS) {
    if (!input.auditText.includes(artifact)) {
      violations.push(`G-10: missing completion artifact citation ${artifact}`);
    } else if (!existsSync(join(input.repoRoot, artifact))) {
      violations.push(`G-10: cited completion artifact missing ${artifact}`);
    }
  }

  const provedRows = countRowsWithStatus(input.auditText, "proved");
  if (
    !input.outstanding.completionReadiness.ok &&
    provedRows >= PROVED_REQUIREMENT_IDS.length + 1
  ) {
    violations.push("G-10: all rows cannot be proved while completionReadiness is blocked");
  }

  return {
    ok: violations.length === 0,
    violations,
    completionStatus: input.outstanding.completionReadiness.status,
    provedRows,
  };
}

function checkCompletionRow(
  input: ObjectiveEvidenceAuditInput,
  row: string,
  violations: string[],
): void {
  const readiness = input.outstanding.completionReadiness;
  const expectedStatus = readiness.ok ? "proved" : "blocked";
  const expectedOkMarker = `outstanding.completionReadiness.ok=${readiness.ok ? "true" : "false"}`;

  if (!row.includes(`| ${expectedStatus} |`)) {
    violations.push(`G-10: completion row must be ${expectedStatus}`);
  }
  if (!row.includes(expectedOkMarker)) {
    violations.push(`G-10: completion row must cite ${expectedOkMarker}`);
  }
  for (const blocker of readiness.blockers) {
    if (!row.includes(blocker)) {
      violations.push(`G-10: completion row missing blocker ${blocker}`);
    }
  }
}

function findAuditRow(text: string, id: string): string | undefined {
  return text.split("\n").find((line) => line.startsWith(`| ${id} |`));
}

function countRowsWithStatus(text: string, status: string): number {
  return text
    .split("\n")
    .filter((line) => /^\| G-\d\d \|/.test(line) && line.includes(`| ${status} |`)).length;
}

export function objectiveEvidenceAuditMessages(result: ObjectiveEvidenceAuditResult): string[] {
  if (result.ok) {
    return [
      `objective-evidence-audit - OK (completion=${result.completionStatus}, proved=${result.provedRows})`,
    ];
  }
  const detail = result.violations.slice(0, 8).join("; ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`objective-evidence-audit - violation: ${detail}${more}`];
}
