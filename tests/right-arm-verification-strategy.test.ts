import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeRightArmVerificationStrategy,
  loadRightArmVerificationStrategyInput,
  rightArmVerificationStrategyMessages,
} from "../src/lint/right-arm-verification-strategy";

function text(path: string): string {
  return readFileSync(path, "utf8");
}

describe("right-arm verification strategy", () => {
  it("fails stale concept-only gate wording and missing L14 feedback evidence", () => {
    const result = analyzeRightArmVerificationStrategy({
      gatesMd:
        "G8-G14 の機械検証条件は概念定義に留まる。G8-G14 機械化 PLAN は**未起票のまま** = carry。",
      rightArmMd:
        "### 右腕 evidence profile (G8-G14)\n| G8 | x | y | `g8-integration-evidence-v1` | z |",
    });

    expect(result.ok).toBe(false);
    expect(result.forbiddenGateMarkers).toContain("G8-G14 の機械検証条件は概念定義に留まる");
    expect(result.missingGateRows).toContain("G14");
    expect(result.missingRightArmMarkers).toContain("L14→L0 feedback record");
    expect(result.missingSourceLedgerRows).toContain("NIST SSDF SP 800-218");
    expect(rightArmVerificationStrategyMessages(result)[0]).toContain("violation");
  });

  it("fails source ledger rows that omit latest official status or adoption decision", () => {
    const result = analyzeRightArmVerificationStrategy({
      gatesMd: [
        "G8 has an executable workflow gate",
        "G9-G14 have defined evidence profiles",
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
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
        "https://code.visualstudio.com/api/extension-guides/webview#security",
        "https://sre.google/sre-book/release-engineering/",
        "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
        "PLAN-L7-130-right-arm-gate-planning",
        "IMP-052** は implemented",
      ].join("\n"),
      rightArmMd: [
        "### Verification source ledger (checked 2026-06-30)",
        "| source | official URL | adopted version/date | latest official status | adoption decision | verification use | gate impact |",
        "|--------|--------------|----------------------|------------------------|-------------------|------------------|-------------|",
        "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final | final publication 1.1 | - | - | release evidence | G12 |",
        "### 右腕 evidence profile (G8-G14)",
        "| gate | left | condition | evidence | consumption |",
        "|------|------|-----------|----------|-------------|",
        "| G8 | x | y | g8-integration-evidence-v1 | z |",
        "| G9 | x | y | ST-* row | z |",
        "| G10 | x | y | screenshot / render smoke / accessibility finding | z |",
        "| G11 | x | y | UAT decision record | z |",
        "| G12 | x | y | acceptance command evidence | z |",
        "| G13 | x | y | smoke command evidence | z |",
        "| G14 | x | y | operational metric snapshot / L14→L0 feedback record | z |",
        "Scrum Guide 2020 ISTQB Glossary OWASP LLM06:2025 Excessive Agency",
        "GitHub Environments required reviewers VS Code Webview Security Google SRE Release Engineering",
        "https://scrumguides.org/scrum-guide.html https://glossary.istqb.org/ https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments https://code.visualstudio.com/api/extension-guides/webview#security https://sre.google/sre-book/release-engineering/",
        "official URL adopted version/date latest official status adoption decision verification use gate impact",
        "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd Rev. 1 initial public draft v1.2 track-draft-do-not-adopt-until-final 人間承認・権限境界・不可逆操作",
      ].join("\n"),
    });

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContain(
      "verification source ledger NIST SSDF SP 800-218 has empty latest official status",
    );
    expect(result.sourceLedgerViolations).toContain(
      "verification source ledger NIST SSDF SP 800-218 has empty adoption decision",
    );
    expect(result.missingSourceLedgerRows).toContain("Scrum Guide 2020");
  });

  it("fails source ledgers whose checked date is stale", () => {
    // U-SOURCELEDGER-001
    const result = analyzeRightArmVerificationStrategy({
      gatesMd: [
        "G8 has an executable workflow gate",
        "G9-G14 have defined evidence profiles",
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
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
        "https://code.visualstudio.com/api/extension-guides/webview#security",
        "https://sre.google/sre-book/release-engineering/",
        "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
        "PLAN-L7-130-right-arm-gate-planning",
        "IMP-052** は implemented",
      ].join("\n"),
      rightArmMd: [
        "### Verification source ledger (checked 2026-01-01)",
        "| source | official URL | adopted version/date | latest official status | adoption decision | verification use | gate impact |",
        "|--------|--------------|----------------------|------------------------|-------------------|------------------|-------------|",
        "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final | final publication 1.1 | current official page | adopt-final-1.1 | release evidence | G8 / G9 / G12 / G13 / G14 |",
        "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official page | adopt-current-guide | inspect-adapt | S3 / S4 / G11 / G12 |",
        "| ISTQB Glossary | https://glossary.istqb.org/ | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | terminology | G8 / G9 / G10 / G11 / G12 / G13 / G14 |",
        "| OWASP LLM06:2025 Excessive Agency | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | approval | G11 / G12 / G13 / G14 |",
        "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub docs | live official docs | adopt-live-docs-for-approval-shape | approval | G12 / action-binding approval |",
        "| VS Code Webview Security | https://code.visualstudio.com/api/extension-guides/webview#security | live VS Code docs | live official docs | adopt-live-docs-for-webview-risk | webview risk | G10 |",
        "| Google SRE Release Engineering | https://sre.google/sre-book/release-engineering/ | SRE book release engineering chapter | live official book | adopt-operational-guidance | release operations | G12 / G13 / G14 |",
        "### 右腕 evidence profile (G8-G14)",
        "| gate | left | condition | evidence | consumption |",
        "|------|------|-----------|----------|-------------|",
        "| G8 | x | y | g8-integration-evidence-v1 | z |",
        "| G9 | x | y | ST-* row | z |",
        "| G10 | x | y | screenshot / render smoke / accessibility finding | z |",
        "| G11 | x | y | UAT decision record | z |",
        "| G12 | x | y | acceptance command evidence | z |",
        "| G13 | x | y | smoke command evidence | z |",
        "| G14 | x | y | operational metric snapshot / L14→L0 feedback record | z |",
        "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd Rev. 1 initial public draft v1.2 track-draft-do-not-adopt-until-final 人間承認・権限境界・不可逆操作",
      ].join("\n"),
    });

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContain(
      "Verification source ledger checked date is stale: 2026-01-01 (180d > 90d)",
    );
  });

  it("fails source ledgers whose gate impact does not cover the G8-G14 verification band", () => {
    const gatesMd = [
      "G8 has an executable workflow gate",
      "G9-G14 have defined evidence profiles",
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
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
      "https://code.visualstudio.com/api/extension-guides/webview#security",
      "https://sre.google/sre-book/release-engineering/",
      "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
      "PLAN-L7-130-right-arm-gate-planning",
      "IMP-052** は implemented",
    ].join("\n");
    const rightArmMd = [
      "### Verification source ledger (checked 2026-06-30)",
      "| source | official URL | adopted version/date | latest official status | adoption decision | verification use | gate impact |",
      "|--------|--------------|----------------------|------------------------|-------------------|------------------|-------------|",
      "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final | final publication 1.1 | current official page | adopt-final-1.1 | release evidence | G8 / G9 |",
      "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official page | adopt-current-guide | inspect-adapt | S3 / S4 |",
      "| ISTQB Glossary | https://glossary.istqb.org/ | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | terminology | concept-only |",
      "| OWASP LLM06:2025 Excessive Agency | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | approval | G11 |",
      "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub docs | live official docs | adopt-live-docs-for-approval-shape | approval | G12 / action-binding approval |",
      "| VS Code Webview Security | https://code.visualstudio.com/api/extension-guides/webview#security | live VS Code docs | live official docs | adopt-live-docs-for-webview-risk | webview risk | G10 |",
      "| Google SRE Release Engineering | https://sre.google/sre-book/release-engineering/ | SRE book release engineering chapter | live official book | adopt-operational-guidance | release operations | G13 |",
      "### 右腕 evidence profile (G8-G14)",
      "| gate | left | condition | evidence | consumption |",
      "|------|------|-----------|----------|-------------|",
      "| G8 | x | y | g8-integration-evidence-v1 | z |",
      "| G9 | x | y | ST-* row | z |",
      "| G10 | x | y | screenshot / render smoke / accessibility finding | z |",
      "| G11 | x | y | UAT decision record | z |",
      "| G12 | x | y | acceptance command evidence | z |",
      "| G13 | x | y | smoke command evidence | z |",
      "| G14 | x | y | operational metric snapshot / L14→L0 feedback record | z |",
      "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd Rev. 1 initial public draft v1.2 track-draft-do-not-adopt-until-final 人間承認・権限境界・不可逆操作",
    ].join("\n");

    const result = analyzeRightArmVerificationStrategy({ gatesMd, rightArmMd });

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContain(
      "verification source ledger ISTQB Glossary has invalid gate impact: concept-only",
    );
    expect(result.missingSourceLedgerGateCoverage).toEqual(["G14"]);
    expect(result.violations).toContain(
      "verification source ledger gate impact missing coverage: G14",
    );
  });

  it("keeps G8-G14 gates aligned with evidence profiles instead of concept-only claims", () => {
    const gates = text("docs/process/gates.md");
    const rightArm = text("docs/process/forward/L08-L14-verification-phase.md");

    expect(gates).not.toContain("G8-G14 の機械検証条件は概念定義に留まる");
    expect(gates).not.toContain("G8-G14 機械化 PLAN は**未起票のまま**");
    expect(gates).toContain("G8 has an executable workflow gate");
    expect(gates).toMatch(/G9-G14 have defined\s+evidence profiles/);
    expect(gates).toContain("PLAN-L7-130-right-arm-gate-planning");
    expect(gates).toContain("IMP-052** は implemented");

    for (const marker of [
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
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
      "https://code.visualstudio.com/api/extension-guides/webview#security",
      "https://sre.google/sre-book/release-engineering/",
      "official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact",
    ]) {
      expect(gates).toContain(marker);
    }

    expect(rightArm).toContain("### 右腕 evidence profile (G8-G14)");
    expect(rightArm).toContain("### Verification source ledger (checked 2026-06-30)");
    expect(rightArm).toContain("NIST SSDF SP 800-218");
    expect(rightArm).toContain("Scrum Guide 2020");
    expect(rightArm).toContain("ISTQB Glossary");
    expect(rightArm).toContain("OWASP LLM06:2025 Excessive Agency");
    expect(rightArm).toContain("GitHub Environments required reviewers");
    expect(rightArm).toContain("VS Code Webview Security");
    expect(rightArm).toContain("Google SRE Release Engineering");
  });

  it("defines required evidence for every right-arm gate through L14 feedback", () => {
    const rightArm = text("docs/process/forward/L08-L14-verification-phase.md");

    for (const gate of ["G8", "G9", "G10", "G11", "G12", "G13", "G14"]) {
      expect(rightArm).toContain(`| ${gate} |`);
    }

    for (const requiredEvidence of [
      "g8-integration-evidence-v1",
      "ST-* row",
      "screenshot / render smoke / accessibility finding",
      "UAT decision record",
      "acceptance command evidence",
      "smoke command evidence",
      "operational metric snapshot",
      "L14→L0 feedback record",
    ]) {
      expect(rightArm).toContain(requiredEvidence);
    }
  });

  it("ties external sources to official URLs, adoption decisions, verification use, and gate impact", () => {
    const rightArm = text("docs/process/forward/L08-L14-verification-phase.md");

    for (const marker of [
      "official URL",
      "adopted version/date",
      "latest official status",
      "adoption decision",
      "verification use",
      "gate impact",
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
    ]) {
      expect(rightArm).toContain(marker);
    }
  });

  it("passes through the live repo loader", () => {
    const result = analyzeRightArmVerificationStrategy(loadRightArmVerificationStrategyInput());
    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerGateCoverage).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
    expect(rightArmVerificationStrategyMessages(result)[0]).toContain(
      "right-arm-verification-strategy - OK",
    );
  });
});
