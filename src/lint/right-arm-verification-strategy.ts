import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
} from "./source-ledger-freshness";

export interface RightArmVerificationStrategyInput {
  gatesMd: string;
  rightArmMd: string;
}

export interface RightArmVerificationStrategyResult {
  ok: boolean;
  missingGateMarkers: string[];
  forbiddenGateMarkers: string[];
  missingRightArmMarkers: string[];
  missingGateRows: string[];
  missingSourceLedgerRows: string[];
  sourceLedgerViolations: string[];
  missingSourceLedgerGateCoverage: string[];
  violations: string[];
}

const FORBIDDEN_GATE_MARKERS = [
  "G8-G14 の機械検証条件は概念定義に留まる",
  "G8-G14 機械化 PLAN は**未起票のまま**",
] as const;

const GATE_MARKERS = [
  "G8 has an executable workflow gate",
  "G9-G14 have defined",
  "evidence profiles",
  "test-basis",
  "test-condition",
  "execution-evidence",
  "defect-routing",
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "official source ledger checked",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "date-only refresh is not gate evidence",
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "https://scrumguides.org/scrum-guide.html",
  "https://glossary.istqb.org/",
  "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
  "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
  "https://code.visualstudio.com/api/extension-guides/webview#security",
  "https://sre.google/sre-book/release-engineering/",
  "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
  "PLAN-L7-130-right-arm-gate-planning",
  "IMP-052** は implemented",
] as const;

const RIGHT_ARM_MARKERS = [
  "### 右腕 evidence profile (G8-G14)",
  "### Verification source ledger",
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "GitHub Environments required reviewers",
  "VS Code Webview Security",
  "Google SRE Release Engineering",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "verification use",
  "gate impact",
  "Source ledger meaning review",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "date-only refresh",
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd",
  "https://scrumguides.org/scrum-guide.html",
  "https://glossary.istqb.org/",
  "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
  "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
  "https://code.visualstudio.com/api/extension-guides/webview#security",
  "https://sre.google/sre-book/release-engineering/",
  "Rev. 1 initial public draft v1.2",
  "track-draft-do-not-adopt-until-final",
  "人間承認・権限境界・不可逆操作",
  "g8-integration-evidence-v1",
  "ST-* row",
  "screenshot / render smoke / accessibility finding",
  "UAT decision record",
  "acceptance command evidence",
  "smoke command evidence",
  "operational metric snapshot",
  "L14→L0 feedback record",
] as const;

const REQUIRED_GATE_ROWS = ["G8", "G9", "G10", "G11", "G12", "G13", "G14"] as const;
const ALLOWED_GATE_IMPACTS = new Set<string>([
  ...REQUIRED_GATE_ROWS,
  "S3",
  "S4",
  "action-binding approval",
]);

const REQUIRED_SOURCE_LEDGER_COLUMNS = [
  "source",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "verification use",
  "gate impact",
] as const;

const REQUIRED_SOURCE_LEDGER_ROWS = [
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "GitHub Environments required reviewers",
  "VS Code Webview Security",
  "Google SRE Release Engineering",
] as const;

export function loadRightArmVerificationStrategyInput(
  repoRoot = process.cwd(),
): RightArmVerificationStrategyInput {
  return {
    gatesMd: readFileSync(resolve(repoRoot, "docs/process/gates.md"), "utf8"),
    rightArmMd: readFileSync(
      resolve(repoRoot, "docs/process/forward/L08-L14-verification-phase.md"),
      "utf8",
    ),
  };
}

export function analyzeRightArmVerificationStrategy(
  input: RightArmVerificationStrategyInput,
): RightArmVerificationStrategyResult {
  const forbiddenGateMarkers = FORBIDDEN_GATE_MARKERS.filter((marker) =>
    input.gatesMd.includes(marker),
  );
  const missingGateMarkers = GATE_MARKERS.filter((marker) => !input.gatesMd.includes(marker));
  const missingRightArmMarkers: string[] = RIGHT_ARM_MARKERS.filter(
    (marker) => !input.rightArmMd.includes(marker),
  );
  if (!hasSourceLedgerCheckedDate(input.rightArmMd, "Verification source ledger")) {
    missingRightArmMarkers.push("### Verification source ledger (checked YYYY-MM-DD)");
  }
  const missingGateRows = REQUIRED_GATE_ROWS.filter(
    (gate) => !input.rightArmMd.includes(`| ${gate} |`),
  );
  const sourceLedger = parseVerificationSourceLedger(input.rightArmMd);
  const missingSourceLedgerRows = REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) => !sourceLedger.rows.some((row) => row.source === source),
  );
  const sourceLedgerFreshnessViolation = sourceLedgerCheckedDateViolation(
    input.rightArmMd,
    "Verification source ledger",
  );
  const sourceLedgerViolations = [
    ...(sourceLedgerFreshnessViolation ? [sourceLedgerFreshnessViolation] : []),
    ...REQUIRED_SOURCE_LEDGER_COLUMNS.filter(
      (column) => !sourceLedger.columns.includes(column),
    ).map((column) => `verification source ledger missing column: ${column}`),
    ...sourceLedger.rows.flatMap((row) =>
      REQUIRED_SOURCE_LEDGER_COLUMNS.flatMap((column) => {
        const value = row[column] ?? "";
        if (value.trim() === "" || /^(TBD|TODO|-)$/.test(value.trim())) {
          return [`verification source ledger ${row.source} has empty ${column}`];
        }
        return [];
      }),
    ),
    ...sourceLedger.rows.flatMap((row) =>
      row["official URL"]?.includes("https://")
        ? []
        : [`verification source ledger ${row.source} official URL is not https`],
    ),
    ...sourceLedger.rows.flatMap((row) =>
      row["adoption decision"]?.trim()
        ? []
        : [`verification source ledger ${row.source} missing adoption decision`],
    ),
    ...sourceLedger.rows.flatMap((row) => {
      const impacts = gateImpactTokens(row["gate impact"] ?? "");
      return impacts.length > 0 && impacts.every((impact) => ALLOWED_GATE_IMPACTS.has(impact))
        ? []
        : [
            `verification source ledger ${row.source} has invalid gate impact: ${row["gate impact"] ?? ""}`,
          ];
    }),
  ];
  const coveredGateImpacts = new Set(
    sourceLedger.rows.flatMap((row) => gateImpactTokens(row["gate impact"] ?? "")),
  );
  const missingSourceLedgerGateCoverage = REQUIRED_GATE_ROWS.filter(
    (gate) => !coveredGateImpacts.has(gate),
  );

  const violations = [
    ...forbiddenGateMarkers.map((marker) => `forbidden stale gates.md marker remains: ${marker}`),
    ...missingGateMarkers.map((marker) => `gates.md missing marker: ${marker}`),
    ...missingRightArmMarkers.map(
      (marker) => `L08-L14 verification strategy missing marker: ${marker}`,
    ),
    ...missingGateRows.map((gate) => `right-arm evidence profile missing row: ${gate}`),
    ...missingSourceLedgerRows.map((source) => `verification source ledger missing row: ${source}`),
    ...sourceLedgerViolations,
    ...missingSourceLedgerGateCoverage.map(
      (gate) => `verification source ledger gate impact missing coverage: ${gate}`,
    ),
  ];

  return {
    ok: violations.length === 0,
    missingGateMarkers,
    forbiddenGateMarkers,
    missingRightArmMarkers,
    missingGateRows,
    missingSourceLedgerRows,
    sourceLedgerViolations,
    missingSourceLedgerGateCoverage,
    violations,
  };
}

function gateImpactTokens(value: string): string[] {
  const tokens = value.match(/\bG(?:8|9|10|11|12|13|14)\b|\bS[34]\b|action-binding approval/g);
  return [...new Set(tokens ?? [])];
}

function parseVerificationSourceLedger(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("Verification source ledger");
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
  const columns = cells(tableLines[0]);
  const rows = tableLines.slice(2).map((line) => {
    const rowCells = cells(line);
    return Object.fromEntries(columns.map((column, index) => [column, rowCells[index] ?? ""]));
  });
  return { columns, rows };
}

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^<(.+)>$/, "$1"));
}

export function rightArmVerificationStrategyMessages(
  result: RightArmVerificationStrategyResult,
): string[] {
  if (result.ok) {
    return [
      `right-arm-verification-strategy - OK (G8-G14 evidence profiles=${REQUIRED_GATE_ROWS.length}, official sources=${REQUIRED_SOURCE_LEDGER_ROWS.length})`,
    ];
  }
  return [`right-arm-verification-strategy - violation: ${result.violations.join("; ")}`];
}
