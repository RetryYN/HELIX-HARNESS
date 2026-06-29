import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const AUDIT_PATH = "docs/governance/helix-l0-l8-design-consistency-audit.md";

function auditText(): string {
  return readFileSync(AUDIT_PATH, "utf8");
}

function auditRow(id: string): string {
  const row = auditText()
    .split("\n")
    .find((line) => line.startsWith(`| ${id} |`));
  expect(row, `${id} row missing`).toBeTruthy();
  return row ?? "";
}

describe("HELIX L0-L8 semantic design consistency audit", () => {
  it("records every audit decision and does not falsely mark all L7/L8 work complete", () => {
    const proved = [
      "C-01",
      "C-02",
      "C-03",
      "C-04",
      "C-05",
      "C-06",
      "C-07",
      "C-08",
      "C-09",
      "C-10",
      "C-11",
    ];
    const frontier = ["C-12"];

    for (const id of proved) {
      expect(auditRow(id), `${id} should be proved`).toContain("| proved |");
    }

    for (const id of frontier) {
      expect(auditRow(id), `${id} should be frontier`).toContain("| frontier |");
    }

    expect(auditRow("C-13")).toContain("| warning |");
    expect(auditText()).toContain(
      'The stronger claim "L7/L8 are fully complete" is still not true',
    );
    expect(auditText()).toContain("G-L7PACK.C");
    expect(auditText()).toContain("frontier: なし");
    expect(auditText()).toContain("PLAN-L7-141-web-dashboard-component-derived");
  });

  it("cites the semantic design and test-design artifacts that substantiate L0-L8 descent", () => {
    const text = auditText();
    const requiredArtifacts = [
      "docs/design/helix/L0-charter/helix-charter_v0.1.md",
      "docs/design/helix/L1-requirements/pillar-requirements.md",
      "docs/test-design/helix/L1-pillar-operational-test-design.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "docs/test-design/helix/L4-pillar-system-test-design.md",
      "docs/design/helix/L5-detail/pillar-detail-design.md",
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "docs/design/helix/L6-function-design/pillar-function-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      "docs/test-design/harness/L8-integration-test-design.md",
      "tests/g8-integration-workflow.test.ts",
      "docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md",
      "tests/roadmap.test.ts",
      "docs/plans/PLAN-L7-141-web-dashboard-component-derived.md",
      "tests/web.test.ts",
    ];

    for (const artifact of requiredArtifacts) {
      expect(text, `${artifact} not cited`).toContain(artifact);
      expect(existsSync(artifact), `${artifact} missing`).toBe(true);
    }
  });

  it("captures drive-model execution and optimization decisions", () => {
    const text = auditText();

    expect(text).toContain("drive=fullstack");
    expect(text).toContain("drive_confidence=0.6");
    expect(text).toContain("low-drive-confidence");
    expect(text).toContain("proposal-coverage-team");
    expect(text).toContain("design_drift");
    expect(text).toContain("mode=reverse");
    expect(text).toContain("cheap docs lanes cannot close risk");
  });
});
