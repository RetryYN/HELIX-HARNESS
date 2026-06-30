import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function text(path: string): string {
  return readFileSync(path, "utf8");
}

describe("right-arm verification strategy", () => {
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
    ]) {
      expect(gates).toContain(marker);
    }

    expect(rightArm).toContain("### 右腕 evidence profile (G8-G14)");
    expect(rightArm).toContain("NIST SSDF SP 800-218");
    expect(rightArm).toContain("Scrum Guide 2020");
    expect(rightArm).toContain("ISTQB Glossary");
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
});
