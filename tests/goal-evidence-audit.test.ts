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

    expect(text).toContain("外部ソース HEAD 確認日: 2026-07-02");
    expect(text).toContain("7f83ca811353ed90b3e981178a1b0c9977dd5863");
    expect(text).toContain("unison-ai-product/UT-TDD_AGENT-HARNESS-Pack");
    expect(text).toContain("e899c3a7c18c47380e102446de7fba702635ac6a");
    expect(text).toContain("v0.1.3");
    expect(text).toContain("package.json version: `0.1.0`");
    expect(text).toContain("local distribution tag: `v0.1.0`");
    expect(text).toContain("Pack latest tag: `v0.1.3`");
    expect(text).toContain("version-up activation required before adopting Pack latest tag");
    expect(text).toContain("検証 / 進捗 source basis 再確認日: 2026-07-02");
    expect(text).toContain("1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23");
    expect(text).toContain("HR-NFR-P5-03");
    expect(text).toContain("PLAN-M-02");
    expect(text).toContain("数量だけでなく意味");
    expect(text).toContain("L14 / whole-program completion を claim しない");
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
      "CLAUDE.md",
      "AGENTS.md",
      "src/lint/design-language.ts",
      "tests/design-language.test.ts",
      ".claude/settings.json",
      ".codex/config.toml",
      ".codex/hooks.json",
      "src/setup/index.ts",
      "src/setup/templates.ts",
      "tests/setup.test.ts",
      "src/lint/codex-hook-adapter.ts",
      "tests/codex-hook-adapter.test.ts",
      "src/lint/outstanding.ts",
      "src/lint/completion-decision-packet.ts",
      "tests/outstanding.test.ts",
      "tests/completion-decision-packet.test.ts",
      "docs/process/forward/L08-L14-verification-phase.md",
      "docs/process/gates.md",
      "docs/process/modes/version-up.md",
      "src/lint/version-up-readiness.ts",
      "tests/version-up-readiness.test.ts",
      "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      "src/lint/cutover-readiness.ts",
      "tests/cutover-readiness.test.ts",
      "tests/identifier-rename.test.ts",
    ];

    for (const artifact of requiredArtifacts) {
      expect(text, `${artifact} not cited`).toContain(artifact);
      expect(existsSync(artifact), `${artifact} missing`).toBe(true);
    }
  });

  it("fails when the external distribution reference repository marker is dropped", () => {
    const text = auditText()
      .replaceAll("外部ソース HEAD 確認日: 2026-07-02", "外部ソース HEAD 確認日: 2026-06-30")
      .replaceAll("unison-ai-product/UT-TDD_AGENT-HARNESS-Pack", "unison-ai-product/PACK-MISSING")
      .replaceAll("e899c3a7c18c47380e102446de7fba702635ac6a", "pack-head-missing")
      .replaceAll("v0.1.3", "pack-tag-missing")
      .replaceAll("package.json version: `0.1.0`", "package.json version: `0.1.9`")
      .replaceAll("local distribution tag: `v0.1.0`", "local distribution tag: `v0.1.9`")
      .replaceAll("Pack latest tag: `v0.1.3`", "Pack latest tag: `pack-tag-missing`")
      .replaceAll(
        "version-up activation required before adopting Pack latest tag",
        "version-up activation marker missing",
      )
      .replaceAll(
        "検証 / 進捗 source basis 再確認日: 2026-07-02",
        "検証 / 進捗 source basis 再確認日: 2026-07-01",
      );

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding: loadObjectiveEvidenceAuditInput().outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-01: missing external source marker 外部ソース HEAD 確認日: 2026-07-02",
        "G-01: missing external source marker unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
        "G-01: missing external source marker e899c3a7c18c47380e102446de7fba702635ac6a",
        "G-01: missing external source marker v0.1.3",
        "G-01: missing external source marker 検証 / 進捗 source basis 再確認日: 2026-07-02",
        "G-01: missing distribution version binding marker package.json version: `0.1.0`",
        "G-01: missing distribution version binding marker local distribution tag: `v0.1.0`",
        "G-01: missing distribution version binding marker Pack latest tag: `v0.1.3`",
        "G-01: missing distribution version binding marker version-up activation required before adopting Pack latest tag",
      ]),
    );
  });

  it("fails when objective audit drops permanent language, setup, version-up, or cutover evidence", () => {
    const text = auditText()
      .replaceAll("CLAUDE.md", "CLAUDE-REMOVED.md")
      .replaceAll("src/setup/index.ts", "src/setup/removed.ts")
      .replaceAll("docs/process/modes/version-up.md", "docs/process/modes/version-up-removed.md")
      .replaceAll("src/lint/cutover-readiness.ts", "src/lint/cutover-readiness-removed.ts");

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding: loadObjectiveEvidenceAuditInput().outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-08: missing language and rename artifact citation CLAUDE.md",
        "G-07: missing setup artifact citation src/setup/index.ts",
        "G-10: missing version-up and cutover blocker artifact citation docs/process/modes/version-up.md",
        "G-08: missing language and rename artifact citation src/lint/cutover-readiness.ts",
      ]),
    );
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
      .replaceAll("PLAN-M-02-helix-identifier-rename", "PLAN-M-XX-missing")
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
