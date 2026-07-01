import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeObjectiveEvidenceAudit,
  loadObjectiveEvidenceAuditInput,
  objectiveEvidenceAuditMessages,
} from "../src/lint/objective-evidence-audit";
import { analyzeOutstandingWork } from "../src/lint/outstanding";

const AUDIT_PATH = "docs/governance/helix-objective-evidence-audit.md";

function auditText(): string {
  return readFileSync(AUDIT_PATH, "utf8");
}

describe("HELIX objective evidence audit", () => {
  it("tracks active objective requirements and keeps full completion blocked until readiness is true", () => {
    const text = auditText();
    const provedIds = ["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09"];

    for (const id of provedIds) {
      const row = text.split("\n").find((line) => line.startsWith(`| ${id} |`));
      expect(row, `${id} row missing`).toBeTruthy();
      expect(row).toContain("| proved |");
    }

    const completionRow = text.split("\n").find((line) => line.startsWith("| G-10 |"));
    expect(completionRow, "G-10 row missing").toBeTruthy();
    expect(completionRow).toContain("| blocked |");
    expect(completionRow).toContain("outstanding.completionReadiness.ok=false");

    expect(text).toContain("7f83ca811353ed90b3e981178a1b0c9977dd5863");
    expect(text).toContain("1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23");
    expect(text).toContain("HR-NFR-P5-03");
    expect(text).toContain("PLAN-M-02");
    expect(text).toContain("semantic, not only quantitative");
    expect(text).toContain("objectiveProgress");
    expect(text).toContain("percent: 90");
    expect(text).toContain("completionClaimAllowed=false");
    expect(text).toContain("version_up_parked");
    expect(completionRow).toContain("PLAN-DISCOVERY-07-design-bottomup-mode");
    expect(completionRow).toContain("PLAN-DISCOVERY-10-helix-asset-visualization");
    expect(completionRow).toContain("PLAN-L7-146-serverless-readonly-share");
    expect(completionRow).toContain("PLAN-M-02-helix-identifier-rename");
    expect(completionRow).toContain("record the PO/S4 decision before promotion");
    expect(completionRow).toContain("record required human/action-binding approval");
    expect(completionRow).toContain("keep parked until a future version-up activation decision");
    expect(completionRow).toContain(
      "obtain explicit PO signoff before irreversible migration/cutover",
    );
  });

  it("references the core current-state artifacts needed to substantiate the audit", () => {
    const text = auditText();
    const requiredArtifacts = [
      "docs/design/helix/L3-requirements/upstream-substance-gap.md",
      "docs/design/helix/L6-function-design/upstream-substance-gap.md",
      "src/runtime/upstream-adoption.ts",
      "tests/upstream-adoption.test.ts",
      "docs/design/helix/L3-requirements/legacy-helix-extension.md",
      "docs/design/helix/L6-function-design/legacy-helix-extension.md",
      "src/runtime/legacy-adoption.ts",
      "tests/legacy-adoption.test.ts",
      "docs/design/harness/L6-function-design/session-log.md",
      "src/runtime/run-debug.ts",
      "tests/run-debug.test.ts",
      "docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md",
      "src/state-db/visualization-read-model.ts",
      "tests/visualization-read-model.test.ts",
      "docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md",
      "src/schema/roadmap.ts",
      "src/lint/roadmap-registry.ts",
      "tests/roadmap.test.ts",
      "src/lint/objective-evidence-audit.ts",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      ".claude/settings.json",
      ".codex/config.toml",
      ".codex/hooks.json",
      "src/lint/codex-hook-adapter.ts",
      "tests/codex-hook-adapter.test.ts",
      "src/lint/outstanding.ts",
      "src/lint/completion-decision-packet.ts",
      "tests/outstanding.test.ts",
      "tests/completion-decision-packet.test.ts",
      "docs/process/forward/L08-L14-verification-phase.md",
      "docs/process/gates.md",
    ];

    for (const artifact of requiredArtifacts) {
      expect(text, `${artifact} not cited`).toContain(artifact);
      expect(existsSync(artifact), `${artifact} missing`).toBe(true);
    }
  });

  it("fails false whole-program completion claims when outstanding blockers remain", () => {
    const outstanding = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02-helix-identifier-rename",
          layer: "L14",
          kind: "design",
          status: "draft",
          workflowPhase: null,
          versionTarget: null,
          text: "irreversible cutover PO signoff",
        },
      ],
      0,
    );
    const text = auditText()
      .replace("| blocked |", "| proved |")
      .replace("PLAN-M-02-helix-identifier-rename", "PLAN-M-XX-missing")
      .replace(
        "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
        "obtain signoff",
      );

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.objectiveProgress).toMatchObject({
      method: "objective-evidence-audit.v1",
      percent: 90,
      provedRequirements: 9,
      totalRequirements: 10,
      blockedRequirements: 1,
      completionStatus: "blocked",
      completionClaimAllowed: false,
    });
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-10: completion row must be blocked",
        "G-10: all rows cannot be proved while completionReadiness is blocked",
        "G-10: completion row missing outstanding plan PLAN-M-02-helix-identifier-rename",
        "G-10: completion row missing required action obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      ]),
    );
  });

  it("passes the live repository audit and reports completion as blocked", () => {
    const result = analyzeObjectiveEvidenceAudit(loadObjectiveEvidenceAuditInput());
    expect(result.ok).toBe(true);
    expect(result.completionStatus).toBe("blocked");
    expect(result.objectiveProgress).toMatchObject({
      method: "objective-evidence-audit.v1",
      percent: 90,
      provedRequirements: 9,
      totalRequirements: 10,
      blockedRequirements: 1,
      completionStatus: "blocked",
      completionClaimAllowed: false,
    });
    expect(result.objectiveProgress.basis).toContain("G-10 is blocked");
    expect(objectiveEvidenceAuditMessages(result)[0]).toContain(
      "objective-evidence-audit - OK (completion=blocked, progress=90%, proved=9/10)",
    );
  });
});
