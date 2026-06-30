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
    expect(rightArmVerificationStrategyMessages(result)[0]).toContain(
      "right-arm-verification-strategy - OK",
    );
  });
});
