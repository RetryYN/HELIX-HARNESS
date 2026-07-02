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
  objectiveProgress: ObjectiveProgress;
}

export interface ObjectiveProgress {
  method: "objective-evidence-audit.v1";
  percent: number;
  provedRequirements: number;
  totalRequirements: number;
  blockedRequirements: number;
  completionStatus: "ready" | "blocked";
  completionClaimAllowed: boolean;
  basis: string;
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
const TOTAL_OBJECTIVE_REQUIREMENTS = PROVED_REQUIREMENT_IDS.length + 1;

const REQUIRED_COMPLETION_ARTIFACTS = [
  "src/lint/outstanding.ts",
  "src/lint/completion-decision-packet.ts",
  "tests/outstanding.test.ts",
  "tests/completion-decision-packet.test.ts",
  "tests/cli-surface.test.ts",
  "docs/process/forward/L08-L14-verification-phase.md",
  "docs/process/gates.md",
] as const;

const REQUIRED_OBJECTIVE_ARTIFACT_GROUPS = [
  {
    requirementId: "G-07",
    label: "setup artifact",
    artifacts: ["src/setup/index.ts", "src/setup/templates.ts", "tests/setup.test.ts"],
  },
  {
    requirementId: "G-08",
    label: "language and rename artifact",
    artifacts: [
      "CLAUDE.md",
      "AGENTS.md",
      "src/lint/design-language.ts",
      "tests/design-language.test.ts",
      "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      "src/lint/cutover-readiness.ts",
      "tests/cutover-readiness.test.ts",
      "tests/identifier-rename.test.ts",
    ],
  },
  {
    requirementId: "G-10",
    label: "version-up and cutover blocker artifact",
    artifacts: [
      "docs/process/modes/version-up.md",
      "src/lint/version-up-readiness.ts",
      "tests/version-up-readiness.test.ts",
      "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      "src/lint/cutover-readiness.ts",
      "tests/cutover-readiness.test.ts",
      "tests/identifier-rename.test.ts",
    ],
  },
] as const;

const REQUIRED_OBJECTIVE_MARKER_GROUPS = [
  {
    requirementId: "G-01",
    label: "external source marker",
    markers: [
      "unison-ai-product/UT-TDD_AGENT-HARNESS",
      "7f83ca811353ed90b3e981178a1b0c9977dd5863",
      "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
      "a64622ac6dc5bb6d8c10ed26bfa9cee29b1dc721",
      "v0.1.3",
    ],
  },
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

  for (const group of REQUIRED_OBJECTIVE_ARTIFACT_GROUPS) {
    for (const artifact of group.artifacts) {
      if (!input.auditText.includes(artifact)) {
        violations.push(`${group.requirementId}: missing ${group.label} citation ${artifact}`);
      } else if (!existsSync(join(input.repoRoot, artifact))) {
        violations.push(`${group.requirementId}: cited ${group.label} missing ${artifact}`);
      }
    }
  }

  for (const group of REQUIRED_OBJECTIVE_MARKER_GROUPS) {
    for (const marker of group.markers) {
      if (!input.auditText.includes(marker)) {
        violations.push(`${group.requirementId}: missing ${group.label} ${marker}`);
      }
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
    objectiveProgress: objectiveProgressForAudit(input, provedRows),
  };
}

export function objectiveProgressForAudit(
  input: ObjectiveEvidenceAuditInput,
  provedRows: number = countRowsWithStatus(input.auditText, "proved"),
): ObjectiveProgress {
  const readiness = input.outstanding.completionReadiness;
  const effectiveProvedRows = readiness.ok
    ? Math.min(provedRows, TOTAL_OBJECTIVE_REQUIREMENTS)
    : Math.min(provedRows, PROVED_REQUIREMENT_IDS.length);
  const blockedRequirements = readiness.ok ? 0 : 1;
  const percent = Math.round((effectiveProvedRows / TOTAL_OBJECTIVE_REQUIREMENTS) * 100);
  const basis = readiness.ok
    ? `${effectiveProvedRows}/${TOTAL_OBJECTIVE_REQUIREMENTS} objective evidence rows proved; completionReadiness is ready`
    : `${effectiveProvedRows}/${TOTAL_OBJECTIVE_REQUIREMENTS} objective evidence rows proved; G-10 is blocked by completionReadiness`;
  return {
    method: "objective-evidence-audit.v1",
    percent,
    provedRequirements: effectiveProvedRows,
    totalRequirements: TOTAL_OBJECTIVE_REQUIREMENTS,
    blockedRequirements,
    completionStatus: readiness.status,
    completionClaimAllowed: readiness.ok && percent === 100,
    basis,
  };
}

export function loadObjectiveProgress(
  repoRoot: string = process.cwd(),
  outstanding?: OutstandingWork,
): ObjectiveProgress | null {
  try {
    const effectiveOutstanding = outstanding ?? computeOutstandingWork(repoRoot);
    const input: ObjectiveEvidenceAuditInput = {
      auditText: readFileSync(
        join(repoRoot, "docs", "governance", "helix-objective-evidence-audit.md"),
        "utf8",
      ),
      outstanding: effectiveOutstanding,
      repoRoot,
    };
    return analyzeObjectiveEvidenceAudit(input).objectiveProgress;
  } catch {
    return null;
  }
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
  for (const item of input.outstanding.items) {
    if (!row.includes(item.planId)) {
      violations.push(`G-10: completion row missing outstanding plan ${item.planId}`);
    }
  }
  for (const action of readiness.requiredActions) {
    if (!row.includes(action)) {
      violations.push(`G-10: completion row missing required action ${action}`);
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
      `objective-evidence-audit - OK (completion=${result.completionStatus}, progress=${result.objectiveProgress.percent}%, proved=${result.objectiveProgress.provedRequirements}/${result.objectiveProgress.totalRequirements})`,
    ];
  }
  const detail = result.violations.slice(0, 8).join("; ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`objective-evidence-audit - violation: ${detail}${more}`];
}
