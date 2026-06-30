import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const AUDIT_PATH = "docs/governance/helix-l0-l8-design-consistency-audit.md";
const PLAN_L7_141 = "docs/plans/PLAN-L7-141-web-dashboard-component-derived.md";
const PLAN_L7_146 = "docs/plans/PLAN-L7-146-serverless-readonly-share.md";
const VERSION_UP_MODE = "docs/process/modes/version-up.md";
const VERSION_UP_DISCOVERY = "docs/plans/PLAN-DISCOVERY-09-version-up-mode.md";

function auditText(): string {
  return readFileSync(AUDIT_PATH, "utf8");
}

function fileText(path: string): string {
  return readFileSync(path, "utf8");
}

function frontmatterValue(path: string, key: string): string | null {
  const match = fileText(path).match(/^---\n([\s\S]*?)\n---/);
  expect(match, `${path} frontmatter missing`).toBeTruthy();
  const row = (match?.[1] ?? "").split("\n").find((line) => line.startsWith(`${key}:`));
  return row ? row.slice(key.length + 1).trim() : null;
}

function auditRow(id: string): string {
  const row = auditText()
    .split("\n")
    .find((line) => line.startsWith(`| ${id} |`));
  expect(row, `${id} row missing`).toBeTruthy();
  return row ?? "";
}

describe("HELIX L0-L8 semantic design consistency audit", () => {
  it("records every audit decision and separates L0-L8 completion from post-L8 work", () => {
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
      "C-14",
      "C-15",
    ];
    const frontier = ["C-12", "C-16"];

    for (const id of proved) {
      expect(auditRow(id), `${id} should be proved`).toContain("| proved |");
    }

    for (const id of frontier) {
      expect(auditRow(id), `${id} should be frontier`).toContain("| frontier |");
    }

    expect(auditRow("C-13")).toContain("| warning |");
    expect(auditText()).toContain("For the pre-amendment L0-L8 boundary");
    expect(auditText()).toContain("revised user request is not L0-L8 complete");
    expect(auditText()).toContain("G-L7PACK.C");
    expect(auditText()).toContain("frontier: なし");
    expect(auditText()).toContain("PLAN-L7-141-web-dashboard-component-derived");
    expect(auditText()).toContain("PLAN-L7-146");
    expect(auditText()).toContain("PLAN-DISCOVERY-10");
    expect(auditText()).toContain("versionUpParked=1");
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
      "docs/plans/PLAN-L7-146-serverless-readonly-share.md",
      "docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md",
      "docs/plans/PLAN-L7-206-visualization-read-model-response.md",
      "docs/process/modes/version-up.md",
      "tests/visualization-read-model.test.ts",
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
    expect(text).toContain("version_deferral");
    expect(text).toContain("mode=version-up");
    expect(text).toContain("cheap docs lanes cannot close risk");
  });

  it("records P5 absorption and modified visualization requirements without overclaiming descent", () => {
    const text = auditText();
    const normalized = text.replace(/\s+/g, " ");

    expect(auditRow("C-15")).toContain("HNFR-P5");
    expect(auditRow("C-15")).toContain("HB-P1");
    expect(auditRow("C-15")).toContain("HB-P3");
    expect(text).toContain("The absence of `HBR-P5` / `HB-P5` / `HC-P5`");
    expect(text).toContain("intentional meaning decision");

    expect(auditRow("C-16")).toContain("| frontier |");
    expect(auditRow("C-16")).toContain("S4 PO decision pending");
    expect(text).toContain(
      "asset/progress visualization requirement is captured at L1 §2.8 / HOT-P9",
    );
    expect(normalized).toContain("must not be counted as L3/L4/L5/L6/L7 fully descended");
    expect(text).toContain("frozen 43-item pillar overlay");
    expect(text).toContain("visualization amendment is not L0-L8 complete");
    expect(text).toContain("downstream L3/L4/L5/L6/L7 route");
  });

  it("keeps version-up parking aligned after PLAN-L7-141 activation", () => {
    expect(frontmatterValue(PLAN_L7_141, "status")).toBe("confirmed");
    expect(frontmatterValue(PLAN_L7_141, "version_target")).toBeNull();
    expect(frontmatterValue(PLAN_L7_146, "status")).toBe("draft");
    expect(frontmatterValue(PLAN_L7_146, "version_target")).toBe("future");

    expect(fileText(VERSION_UP_MODE)).toContain("PLAN-L7-141 は component-derived");
    expect(fileText(VERSION_UP_MODE)).toContain("PLAN-L7-146 は外部 serverless");
    expect(fileText(VERSION_UP_DISCOVERY)).toContain("activation note (2026-06-30)");
    expect(fileText(PLAN_L7_146)).toContain("version-up parked");
    expect(fileText(PLAN_L7_146)).toContain("mode=version-up");
  });
});
