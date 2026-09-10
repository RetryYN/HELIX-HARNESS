import { describe, expect, it } from "vitest";
import {
  analyzeDriveModelPassage,
  currentWorkflowModelPassageIdentities,
  driveModelPassageMessages,
  loadDriveModelPassageDocs,
} from "../src/lint/drive-model-passage";

const compliant = `# PLAN-X

## Section 2.1 Workflow-model Passage Certificate Required

| Workflow model / identity | Required certificate columns |
|---|---|
| ADD_FEATURE | parent PLAN, Forward target, residual status |
| DESIGN_REFACTOR | behavior-invariance proof, Forward target, residual status |
| INCIDENT | permanent-fix Forward route, residual status |
| PERFORMANCE_REFACTOR | performance-invariance proof, measurement evidence, Forward target, residual status |
| RECOVERY | correction artifact, Forward target, residual status |
| REDESIGN | requirement/design change route, Forward target, residual status |
| REFACTOR | behavior-invariance proof, Forward target, residual status |
| RESEARCH | ADR, Forward target, residual status |
| RETROFIT | migration plan, Forward target, residual status |
| REVERSE | R4 routing, re-entry gate, residual status |
| VERSION_UP | version target, activation packet, Forward target, residual status |

## Section 2.2 Next
`;

describe("drive-model passage lint", () => {
  it("U-DMP-001: accepts the complete current workflow-model passage table", () => {
    const r = analyzeDriveModelPassage([{ file: "PLAN-X.md", content: compliant }]);

    expect(r.ok).toBe(true);
    expect(r.rows).toHaveLength(11);
    expect(r.expectedWorkflowModelIds).toEqual([
      "ADD_FEATURE",
      "DESIGN_REFACTOR",
      "INCIDENT",
      "PERFORMANCE_REFACTOR",
      "RECOVERY",
      "REDESIGN",
      "REFACTOR",
      "RESEARCH",
      "RETROFIT",
      "REVERSE",
      "VERSION_UP",
    ]);
    expect(driveModelPassageMessages(r)[0]).toContain("expected=11");
  });

  it("U-DMP-002: rejects a mode row without Forward re-entry", () => {
    const content = compliant.replace(
      "parent PLAN, Forward target, residual status",
      "parent PLAN, residual status",
    );
    const r = analyzeDriveModelPassage([{ file: "PLAN-X.md", content }]);

    expect(r.ok).toBe(false);
    expect(r.violations).toContainEqual({
      file: "PLAN-X.md",
      workflowIdentity: "ADD_FEATURE",
      reason: "missing_forward_target",
    });
  });

  it("U-CAT1437-003: rejects a legacy drive-model table as current authority", () => {
    const legacyOnly = compliant
      .replace("ADD_FEATURE", "Discovery")
      .replace("DESIGN_REFACTOR", "Scrum")
      .replace("INCIDENT", "Reverse")
      .replace("PERFORMANCE_REFACTOR", "Recovery")
      .replace("RECOVERY", "Incident")
      .replace("REDESIGN", "Refactor")
      .replace("REFACTOR", "Retrofit")
      .replace("RESEARCH", "Add-feature")
      .replace("RETROFIT", "version-up")
      .replace("REVERSE", "Research")
      .replace("VERSION_UP", "Discovery");
    const r = analyzeDriveModelPassage([{ file: "PLAN-X.md", content: legacyOnly }]);

    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.reason === "unexpected_identity")).toBe(true);
    expect(r.violations.some((v) => v.reason === "missing_expected_identity")).toBe(true);
  });

  it("U-DMP-004: rejects duplicate current identities", () => {
    const duplicate = compliant.replace(
      "| DESIGN_REFACTOR | behavior-invariance proof, Forward target, residual status |",
      "| ADD_FEATURE | behavior-invariance proof, Forward target, residual status |",
    );
    const r = analyzeDriveModelPassage([{ file: "PLAN-X.md", content: duplicate }]);

    expect(r.ok).toBe(false);
    expect(r.violations).toContainEqual({
      file: "PLAN-X.md",
      workflowIdentity: "ADD_FEATURE",
      reason: "duplicate_identity",
    });
  });

  it("U-DMP-002b: reports missing passage certificate docs as a violation", () => {
    const r = analyzeDriveModelPassage([]);

    expect(r.checked).toBe(0);
    expect(driveModelPassageMessages(r)[0]).toContain("violation");
  });

  it("U-DMP-003: current reconciliation PLAN has all passage certificate modes", () => {
    const docs = loadDriveModelPassageDocs(process.cwd());
    const r = analyzeDriveModelPassage(docs);

    expect(docs.length).toBeGreaterThan(0);
    expect(r.ok).toBe(true);
    expect(r.rows.map((row) => row.workflowIdentity)).toEqual(
      currentWorkflowModelPassageIdentities(),
    );
  });
});
