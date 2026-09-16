import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
} from "./source-ledger-freshness";

export interface RightArmVerificationStrategyInput {
  gatesMd: string;
  rightArmMd: string;
  now?: string;
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
  "G9-G12 have defined",
  "evidence profiles",
  "test-basis",
  "test-condition",
  "execution-evidence",
  "defect-routing",
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "NASA Systems Engineering Handbook Appendix",
  "W3C WCAG 2.2",
  "Playwright Test",
  "official source ledger checked",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "date-only refresh is not gate evidence",
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "https://scrumguides.org/scrum-guide.html",
  "https://glossary.istqb.org/",
  "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
  "https://www.nasa.gov/reference/system-engineering-handbook-appendix/",
  "https://www.w3.org/TR/WCAG22/",
  "https://playwright.dev/docs/intro",
  "https://playwright.dev/docs/test-snapshots",
  "https://playwright.dev/docs/accessibility-testing",
  "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
  "https://code.visualstudio.com/api/extension-guides/webview#security",
  "https://sre.google/sre-book/release-engineering/",
  "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
  "PLAN-L7-130-right-arm-gate-planning",
  "IMP-052** は implemented",
] as const;

const RIGHT_ARM_MARKERS = [
  "### 右腕 evidence profile (G8-G12)",
  "### Verification source ledger",
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "NASA Systems Engineering Handbook Appendix",
  "W3C WCAG 2.2",
  "Playwright Test",
  "GitHub Environments required reviewers",
  "VS Code Webview Security",
  "Google SRE Release Engineering",
  "公式 URL",
  "採用 version/date",
  "最新公式 status",
  "adoption decision",
  "検証用途",
  "gate 影響",
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
  "https://www.nasa.gov/reference/system-engineering-handbook-appendix/",
  "https://www.w3.org/TR/WCAG22/",
  "https://playwright.dev/docs/intro",
  "https://playwright.dev/docs/test-snapshots",
  "https://playwright.dev/docs/accessibility-testing",
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
  "L12→L1/L0 feedback record",
] as const;

const REQUIRED_GATE_ROWS = ["G8", "G9", "G10", "G11", "G12"] as const;
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

const SOURCE_LEDGER_COLUMN_ALIASES: Record<
  string,
  (typeof REQUIRED_SOURCE_LEDGER_COLUMNS)[number]
> = {
  "公式 URL": "official URL",
  "採用 version/date": "adopted version/date",
  "最新公式 status": "latest official status",
  採用判断: "adoption decision",
  検証用途: "verification use",
  "gate 影響": "gate impact",
};

const REQUIRED_SOURCE_LEDGER_MEANING_REVIEW_FIELDS = [
  "source_ledger_freshness",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
] as const;

const REQUIRED_WORKFLOW_ROUTE_IMPACT_SCOPES = [
  "G8-G12",
  "S4",
  "version-up",
  "action-binding",
  "cutover",
  "completion",
] as const;

export const VERIFICATION_SOURCE_LEDGER_CHECKED_AT = "2026-07-02";

export const REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS = [
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "NASA Systems Engineering Handbook Appendix",
  "W3C WCAG 2.2",
  "Playwright Test",
  "GitHub Environments required reviewers",
  "VS Code Webview Security",
  "Google SRE Release Engineering",
] as const;

export const EXPECTED_VERIFICATION_SOURCE_LEDGER_BINDINGS: Record<
  (typeof REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS)[number],
  { urls: string[]; gateImpacts: string[] }
> = {
  "NIST SSDF SP 800-218": {
    urls: [
      "https://csrc.nist.gov/pubs/sp/800/218/final",
      "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd",
    ],
    gateImpacts: ["G8", "G9", "G12"],
  },
  "Scrum Guide 2020": {
    urls: ["https://scrumguides.org/scrum-guide.html"],
    gateImpacts: ["S3", "S4", "G11", "G12"],
  },
  "ISTQB Glossary": {
    urls: ["https://glossary.istqb.org/"],
    gateImpacts: ["G8", "G9", "G10", "G11", "G12"],
  },
  "OWASP LLM06:2025 Excessive Agency": {
    urls: ["https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"],
    gateImpacts: ["G11", "G12"],
  },
  "NASA Systems Engineering Handbook Appendix": {
    urls: ["https://www.nasa.gov/reference/system-engineering-handbook-appendix/"],
    gateImpacts: ["G8", "G9", "G10", "G11", "G12"],
  },
  "W3C WCAG 2.2": {
    urls: ["https://www.w3.org/TR/WCAG22/"],
    gateImpacts: ["G10", "G11"],
  },
  "Playwright Test": {
    urls: [
      "https://playwright.dev/docs/intro",
      "https://playwright.dev/docs/test-snapshots",
      "https://playwright.dev/docs/accessibility-testing",
    ],
    gateImpacts: ["G10", "G11"],
  },
  "GitHub Environments required reviewers": {
    urls: [
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
    ],
    gateImpacts: ["G12", "action-binding approval"],
  },
  "VS Code Webview Security": {
    urls: ["https://code.visualstudio.com/api/extension-guides/webview#security"],
    gateImpacts: ["G10", "G11"],
  },
  "Google SRE Release Engineering": {
    urls: ["https://sre.google/sre-book/release-engineering/"],
    gateImpacts: ["G12"],
  },
};

export function expectedVerificationSourceLedgerBinding(
  source: string,
): { urls: string[]; gateImpacts: string[] } | null {
  return Object.hasOwn(EXPECTED_VERIFICATION_SOURCE_LEDGER_BINDINGS, source)
    ? EXPECTED_VERIFICATION_SOURCE_LEDGER_BINDINGS[
        source as keyof typeof EXPECTED_VERIFICATION_SOURCE_LEDGER_BINDINGS
      ]
    : null;
}

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
  const missingSourceLedgerRows = REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS.filter(
    (source) => !sourceLedger.rows.some((row) => row.source === source),
  );
  const sourceLedgerFreshnessViolation = sourceLedgerCheckedDateViolation(
    input.rightArmMd,
    "Verification source ledger",
    input.now,
  );
  const sourceLedgerViolations = [
    ...(sourceLedgerFreshnessViolation ? [sourceLedgerFreshnessViolation] : []),
    ...sourceLedgerMeaningReviewViolations(input.rightArmMd, "Verification source ledger"),
    ...sourceLedgerMeaningReviewCoverageViolations(input.rightArmMd),
    ...sourceLedgerWorkflowRouteImpactScopeViolations(input.rightArmMd),
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
    ...REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS.flatMap((source) => {
      const row = sourceLedger.rows.find((candidate) => candidate.source === source);
      const expected = EXPECTED_VERIFICATION_SOURCE_LEDGER_BINDINGS[source];
      if (!row) return [];
      const officialUrl = row["official URL"] ?? "";
      const impacts = gateImpactTokens(row["gate impact"] ?? "");
      const missingUrls = expected.urls.filter((url) => !officialUrl.includes(url));
      const missingImpacts = expected.gateImpacts.filter((impact) => !impacts.includes(impact));
      return [
        ...missingUrls.map(
          (url) => `verification source ledger ${source} official URL missing expected ${url}`,
        ),
        ...missingImpacts.map(
          (impact) => `verification source ledger ${source} gate impact missing expected ${impact}`,
        ),
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

function sourceLedgerMeaningReviewViolations(text: string, ledgerLabel: string): string[] {
  const checkedDate = sourceLedgerCheckedDate(text, ledgerLabel);
  if (!checkedDate) return [];
  return REQUIRED_SOURCE_LEDGER_MEANING_REVIEW_FIELDS.flatMap((field) => {
    const fieldDatePattern = new RegExp(`${field}[^\\n]*${checkedDate}`);
    return fieldDatePattern.test(text)
      ? []
      : [`${ledgerLabel} missing ${field} evidence for checked date ${checkedDate}`];
  });
}

function sourceLedgerMeaningReviewCoverageViolations(text: string): string[] {
  const section = sourceLedgerMeaningReviewSection(text);
  if (!section.trim()) {
    return ["Verification source ledger meaning review missing source coverage section"];
  }
  return REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS.flatMap((source) =>
    section.includes(source)
      ? []
      : [`Verification source ledger meaning review missing source coverage: ${source}`],
  );
}

function sourceLedgerWorkflowRouteImpactScopeViolations(text: string): string[] {
  const section = sourceLedgerMeaningReviewSection(text);
  const workflowRouteImpactLine =
    section.split(/\r?\n/).find((line) => line.includes("`workflow_route_impact`")) ?? "";
  if (!workflowRouteImpactLine.trim()) {
    return ["Verification source ledger meaning review missing workflow_route_impact scope line"];
  }
  return REQUIRED_WORKFLOW_ROUTE_IMPACT_SCOPES.flatMap((scope) =>
    workflowRouteImpactLine.includes(scope)
      ? []
      : [`Verification source ledger workflow_route_impact missing route scope: ${scope}`],
  );
}

function sourceLedgerMeaningReviewSection(text: string): string {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "Source ledger 意味レビュー証跡:");
  if (start < 0) return "";
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s/.test(line)) break;
    body.push(line);
  }
  return body.join("\n");
}

function gateImpactTokens(value: string): string[] {
  const expandedRanges = value.replace(/\bG8-G12\b/g, "G8 G9 G10 G11 G12");
  const tokens = expandedRanges.match(
    /\bG(?:8|9|10|11|12|13|14)\b|\bS[34]\b|action-binding approval/g,
  );
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
  const columns = cells(tableLines[0]).map(
    (column) => SOURCE_LEDGER_COLUMN_ALIASES[column] ?? column,
  );
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
      `right-arm-verification-strategy - OK (G8-G12 evidence profiles=${REQUIRED_GATE_ROWS.length}, official sources=${REQUIRED_VERIFICATION_SOURCE_LEDGER_ROWS.length})`,
    ];
  }
  return [`right-arm-verification-strategy - violation: ${result.violations.join("; ")}`];
}
