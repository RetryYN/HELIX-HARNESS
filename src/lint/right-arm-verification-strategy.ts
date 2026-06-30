import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  "official source ledger checked 2026-06-30",
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "https://scrumguides.org/scrum-guide.html",
  "https://glossary.istqb.org/",
  "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
  "official URL / version/date / verification use / gate impact",
  "PLAN-L7-130-right-arm-gate-planning",
  "IMP-052** は implemented",
] as const;

const RIGHT_ARM_MARKERS = [
  "### 右腕 evidence profile (G8-G14)",
  "### Verification source ledger (checked 2026-06-30)",
  "NIST SSDF SP 800-218",
  "Scrum Guide 2020",
  "ISTQB Glossary",
  "OWASP LLM06:2025 Excessive Agency",
  "official URL",
  "version/date",
  "verification use",
  "gate impact",
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "https://scrumguides.org/scrum-guide.html",
  "https://glossary.istqb.org/",
  "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
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
  const missingRightArmMarkers = RIGHT_ARM_MARKERS.filter(
    (marker) => !input.rightArmMd.includes(marker),
  );
  const missingGateRows = REQUIRED_GATE_ROWS.filter(
    (gate) => !input.rightArmMd.includes(`| ${gate} |`),
  );

  const violations = [
    ...forbiddenGateMarkers.map((marker) => `forbidden stale gates.md marker remains: ${marker}`),
    ...missingGateMarkers.map((marker) => `gates.md missing marker: ${marker}`),
    ...missingRightArmMarkers.map(
      (marker) => `L08-L14 verification strategy missing marker: ${marker}`,
    ),
    ...missingGateRows.map((gate) => `right-arm evidence profile missing row: ${gate}`),
  ];

  return {
    ok: violations.length === 0,
    missingGateMarkers,
    forbiddenGateMarkers,
    missingRightArmMarkers,
    missingGateRows,
    violations,
  };
}

export function rightArmVerificationStrategyMessages(
  result: RightArmVerificationStrategyResult,
): string[] {
  if (result.ok) {
    return [
      `right-arm-verification-strategy - OK (G8-G14 evidence profiles=${REQUIRED_GATE_ROWS.length}, official sources=4)`,
    ];
  }
  return [`right-arm-verification-strategy - violation: ${result.violations.join("; ")}`];
}
