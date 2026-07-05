import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { computeOutstandingWork, type OutstandingWork } from "./outstanding";
import { sourceLedgerCheckedDateViolation } from "./source-ledger-freshness";

export interface ObjectiveEvidenceAuditInput {
  auditText: string;
  outstanding: OutstandingWork;
  repoRoot: string;
  externalObserved?: Record<string, string>;
  trackedFiles?: ReadonlySet<string> | null;
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
  auditOk: boolean;
  auditViolationCount: number;
  progressEvidenceTrusted: boolean;
  evidenceTrustReason: string;
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
    requirementId: "G-09",
    label: "meaning-based frontier hard-gate artifact",
    artifacts: [
      "docs/governance/helix-l0-l8-design-consistency-audit.md",
      "src/lint/semantic-frontier-consistency.ts",
      "tests/semantic-frontier-consistency.test.ts",
    ],
  },
  {
    requirementId: "G-06",
    label: "HELIX L0-L14 layer coverage artifact",
    artifacts: [
      "docs/design/helix/L0-charter/helix-charter_v0.1.md",
      "docs/design/helix/L1-requirements/pillar-requirements.md",
      "docs/design/helix/L2-screen/screen-mock-boundary.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "docs/design/helix/L5-detail/pillar-detail-design.md",
      "docs/design/helix/L6-function-design/pillar-function-design.md",
      "docs/design/helix/L7-implementation/implementation-evidence-index.md",
      "docs/design/helix/L8-integration/integration-evidence-index.md",
      "docs/design/helix/L9-system/system-evidence-index.md",
      "docs/design/helix/L10-ux/ux-evidence-boundary.md",
      "docs/design/helix/L11-uat/uat-evidence-boundary.md",
      "docs/design/helix/L12-acceptance/acceptance-evidence-index.md",
      "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
      "docs/design/helix/L14-operations/operations-feedback-boundary.md",
      "docs/test-design/helix/L1-pillar-operational-test-design.md",
      "docs/test-design/helix/L2-screen-ux-test-design.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/test-design/helix/L4-pillar-system-test-design.md",
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      "docs/test-design/harness/L7-unit-test-design.md",
    ],
    requireTracked: true,
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
      "外部ソース HEAD 確認日: 2026-07-05",
      "RetryYN/HELIX-HARNESS",
      "b828fcf64c204d1cfa65c729fa590ca9562adccc",
      "RetryYN/HELIX-HARNESS-OS",
      "unpublished",
      "検証 / 進捗 source basis 再確認日: 2026-07-05",
    ],
  },
  {
    requirementId: "G-09",
    label: "meaning-based frontier hard-gate marker",
    markers: [
      "semantic-frontier-consistency",
      "C-18",
      "live `semanticFeatureFrontierRecords[]`",
      "prose-only feature list",
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
    command: "git ls-remote https://github.com/RetryYN/HELIX-HARNESS.git refs/heads/main",
    ref: "refs/heads/main",
    observed: "b828fcf64c204d1cfa65c729fa590ca9562adccc",
    latestOfficialStatus: "main branch reachable",
    sourceStatusDelta: "development repo renamed from old upstream basis",
    adoptionDecision: "current HELIX-HARNESS source of truth",
    workflowRouteImpact: "none",
  },
  {
    source: "distribution_pack_repo",
    command: "git ls-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git refs/heads/main",
    ref: "refs/heads/main",
    observed: "unpublished",
    latestOfficialStatus: "repository reachable; main branch unpublished",
    sourceStatusDelta: "distribution repo moved to current HELIX-HARNESS-OS surface",
    adoptionDecision:
      "current distribution surface; publish/tag activation required before adoption",
    workflowRouteImpact: "distribution-version-binding gate retained",
  },
  {
    source: "distribution_pack_latest_tag",
    command: "git ls-remote --tags https://github.com/RetryYN/HELIX-HARNESS-OS.git",
    ref: "refs/tags/unpublished",
    observed: "unpublished",
    latestOfficialStatus: "no distribution tag published",
    sourceStatusDelta: "distribution tag check moved to current HELIX-HARNESS-OS surface",
    adoptionDecision: "local distribution tag remains v0.1.0 until publish activation",
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
    trackedFiles: readGitTrackedFiles(repoRoot),
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
      } else if (
        "requireTracked" in group &&
        group.requireTracked &&
        input.trackedFiles &&
        !input.trackedFiles.has(artifact)
      ) {
        violations.push(`${group.requirementId}: ${group.label} not git tracked ${artifact}`);
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
    objectiveProgress: objectiveProgressForAudit(input, provedRows, {
      auditOk: violations.length === 0,
      auditViolationCount: violations.length,
    }),
  };
}

function readGitTrackedFiles(repoRoot: string): ReadonlySet<string> | null {
  try {
    const stdout = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    if (stdout.length > 0 && !stdout.includes("\0")) return null;
    return new Set(stdout.split("\0").filter(Boolean));
  } catch {
    return null;
  }
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
  const externalObserved = input.externalObserved;
  if (externalObserved !== undefined) {
    for (const expected of EXPECTED_EXTERNAL_SOURCE_LEDGER_ROWS) {
      if (externalObserved[expected.source] === undefined) {
        violations.push(
          `G-01: ${EXTERNAL_SOURCE_LEDGER_LABEL} externalObserved missing ${expected.source}`,
        );
      }
    }
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
    const observed = externalObserved?.[expected.source];
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
  const header = splitMarkdownTableRow(tableLines[0]).map(normalizeExternalSourceLedgerColumn);
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

function normalizeExternalSourceLedgerColumn(column: string): string {
  const baseColumn = column.replace(/（.*）$/, "");
  const aliases: Record<string, string> = {
    "source key": "source",
    "確認 command": "command",
    "latest official status": "latestOfficialStatus",
    "source status delta": "sourceStatusDelta",
    "adoption decision": "adoptionDecision",
    "workflow route impact": "workflowRouteImpact",
  };
  return aliases[baseColumn] ?? baseColumn;
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
    "現行配布 latest tag: `unpublished`",
    "version-up activation required before publishing/adopting distribution tag",
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
  auditState: { auditOk?: boolean; auditViolationCount?: number } = {},
): ObjectiveProgress {
  const readiness = input.outstanding.completionReadiness;
  const auditOk = auditState.auditOk ?? false;
  const auditViolationCount = auditState.auditViolationCount ?? 1;
  const progressEvidenceTrusted = auditOk && auditViolationCount === 0;
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
    completionClaimAllowed: progressEvidenceTrusted && readiness.ok && percent === 100,
    auditOk,
    auditViolationCount,
    progressEvidenceTrusted,
    evidenceTrustReason: progressEvidenceTrusted
      ? "objective evidence audit passed; percent may be shown as trusted progress indicator"
      : "objective evidence audit has violations; percent is diagnostic only and must not be used as completion evidence",
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
