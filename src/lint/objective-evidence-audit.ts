import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { computeOutstandingWork, type OutstandingWork } from "./outstanding";
import { sourceLedgerCheckedDateViolation } from "./source-ledger-freshness";

export interface ObjectiveEvidenceAuditInput {
  auditText: string;
  outstanding: OutstandingWork;
  repoRoot: string;
  externalObserved?: Record<string, string>;
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
      "外部ソース HEAD 確認日: 2026-07-02",
      "unison-ai-product/UT-TDD_AGENT-HARNESS",
      "7f83ca811353ed90b3e981178a1b0c9977dd5863",
      "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
      "c583953f5fda9c406ff180ae700deefa0d6206ae",
      "v0.1.3",
      "検証 / 進捗 source basis 再確認日: 2026-07-02",
    ],
  },
] as const;

const EXTERNAL_SOURCE_LEDGER_LABEL = "外部 source ledger";
const EXTERNAL_SOURCE_LEDGER_COLUMNS = [
  "source",
  "command",
  "ref",
  "observed",
  "latestOfficialStatus",
  "sourceStatusDelta",
  "adoptionDecision",
  "workflowRouteImpact",
] as const;
const EXPECTED_EXTERNAL_SOURCE_LEDGER_ROWS = [
  {
    source: "development_repo",
    command:
      "git ls-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git refs/heads/main",
    ref: "refs/heads/main",
    observed: "7f83ca811353ed90b3e981178a1b0c9977dd5863",
    latestOfficialStatus: "main branch reachable",
    sourceStatusDelta: "none",
    adoptionDecision: "meaning-only adoption; no bulk import",
    workflowRouteImpact: "none",
  },
  {
    source: "distribution_pack_repo",
    command:
      "git ls-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git refs/heads/main",
    ref: "refs/heads/main",
    observed: "c583953f5fda9c406ff180ae700deefa0d6206ae",
    latestOfficialStatus: "main branch reachable",
    sourceStatusDelta: "changed from previous audit; objective audit refreshed",
    adoptionDecision:
      "reference source only; version-up activation required before adopting Pack latest",
    workflowRouteImpact: "distribution-version-binding gate retained",
  },
  {
    source: "distribution_pack_latest_tag",
    command:
      "git ls-remote --tags https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git",
    ref: "refs/tags/v0.1.3",
    observed: "v0.1.3",
    latestOfficialStatus: "latest tag reachable",
    sourceStatusDelta: "none",
    adoptionDecision: "reference source only; local distribution tag remains v0.1.0",
    workflowRouteImpact: "version-up activation packet required before tag adoption",
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
  checkExternalSourceLedger(input, violations);
  checkDistributionVersionBinding(input, violations);

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

function checkExternalSourceLedger(input: ObjectiveEvidenceAuditInput, violations: string[]): void {
  const freshnessViolation = sourceLedgerCheckedDateViolation(
    input.auditText,
    EXTERNAL_SOURCE_LEDGER_LABEL,
  );
  if (freshnessViolation) {
    violations.push(`G-01: ${freshnessViolation}`);
  }
  const rows = parseExternalSourceLedgerRows(input.auditText);
  if (rows.length === 0) {
    violations.push(`G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} rows missing`);
    return;
  }
  for (const expected of EXPECTED_EXTERNAL_SOURCE_LEDGER_ROWS) {
    const row = rows.find((candidate) => candidate.source === expected.source);
    if (!row) {
      violations.push(`G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} missing row ${expected.source}`);
      continue;
    }
    for (const column of EXTERNAL_SOURCE_LEDGER_COLUMNS) {
      if (!row[column]) {
        violations.push(`G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} ${expected.source} empty ${column}`);
        continue;
      }
      const expectedValue = expected[column];
      if (!row[column].includes(expectedValue)) {
        violations.push(
          `G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} ${expected.source} ${column} missing ${expectedValue}`,
        );
      }
    }
    const observed = input.externalObserved?.[expected.source];
    if (observed !== undefined && row.observed !== observed) {
      violations.push(
        `G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} ${expected.source} observed drift expected=${row.observed} actual=${observed}`,
      );
    }
  }
}

type ExternalSourceLedgerRow = Record<(typeof EXTERNAL_SOURCE_LEDGER_COLUMNS)[number], string>;

function parseExternalSourceLedgerRows(text: string): ExternalSourceLedgerRow[] {
  const lines = text.split("\n");
  const headingIndex = lines.findIndex((line) =>
    new RegExp(`${EXTERNAL_SOURCE_LEDGER_LABEL} \\(checked \\d{4}-\\d{2}-\\d{2}\\)`).test(line),
  );
  if (headingIndex === -1) return [];
  const tableLines = lines.slice(headingIndex + 1).filter((line) => line.trim().startsWith("|"));
  if (tableLines.length < 2) return [];
  const header = splitMarkdownTableRow(tableLines[0]);
  const expectedHeader = [...EXTERNAL_SOURCE_LEDGER_COLUMNS];
  if (header.join("\0") !== expectedHeader.join("\0")) return [];
  return tableLines
    .slice(2)
    .map(splitMarkdownTableRow)
    .filter((cells) => cells.length === expectedHeader.length)
    .map((cells) =>
      Object.fromEntries(expectedHeader.map((column, index) => [column, cells[index] ?? ""])),
    ) as ExternalSourceLedgerRow[];
}

function splitMarkdownTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/`/g, ""));
}

function checkDistributionVersionBinding(
  input: ObjectiveEvidenceAuditInput,
  violations: string[],
): void {
  const packageVersion = readPackageVersion(input.repoRoot);
  if (!packageVersion) {
    violations.push("G-01: package.json version missing for distribution version binding");
    return;
  }
  const localTag = `v${packageVersion}`;
  const requiredMarkers = [
    `package.json version: \`${packageVersion}\``,
    `local distribution tag: \`${localTag}\``,
    "Pack latest tag: `v0.1.3`",
    "version-up activation required before adopting Pack latest tag",
  ];
  for (const marker of requiredMarkers) {
    if (!input.auditText.includes(marker)) {
      violations.push(`G-01: missing distribution version binding marker ${marker}`);
    }
  }
}

function readPackageVersion(repoRoot: string): string | null {
  try {
    const parsed = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      version?: unknown;
    };
    return typeof parsed.version === "string" && parsed.version.length > 0 ? parsed.version : null;
  } catch {
    return null;
  }
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
