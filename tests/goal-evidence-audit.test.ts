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
  it("tracks active objective requirements and allows completion only when readiness is true", () => {
    const text = auditText();
    const provedIds = [
      "G-01",
      "G-02",
      "G-03",
      "G-04",
      "G-05",
      "G-06",
      "G-07",
      "G-08",
      "G-09",
    ];

    for (const id of provedIds) {
      const row = text.split("\n").find((line) => line.startsWith(`| ${id} |`));
      expect(row, `${id} row missing`).toBeTruthy();
      expect(row).toContain("| proved |");
    }

    const completionRow = text.split("\n").find((line) => line.startsWith("| G-10 |"));
    expect(completionRow, "G-10 row missing").toBeTruthy();
    expect(completionRow).toContain("| blocked |");
    expect(completionRow).toContain("outstanding.completionReadiness.ok=false");
    expect(completionRow).toContain("decisionCount=2");

    expect(text).toContain("外部ソース HEAD 確認日: 2026-07-05");
    expect(text).toContain("外部 source ledger (checked 2026-07-05)");
    expect(text).toContain(
      "git ls-remote https://github.com/RetryYN/HELIX-HARNESS.git refs/heads/main",
    );
    expect(text).toContain(
      "git ls-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git refs/heads/main",
    );
    expect(text).toContain("distribution_latest_tag");
    expect(text).toContain("sourceStatusDelta");
    expect(text).toContain("workflowRouteImpact");
    expect(text).toContain("b828fcf64c204d1cfa65c729fa590ca9562adccc");
    expect(text).toContain("RetryYN/HELIX-HARNESS");
    expect(text).toContain("RetryYN/HELIX-HARNESS-OS");
    expect(text).toContain("unpublished");
    expect(text).toContain("package.json version: `0.1.0`");
    expect(text).toContain("local distribution tag: `v0.1.0`");
    expect(text).toContain("現行配布 latest tag: `unpublished`");
    expect(text).toContain(
      "version-up activation required before publishing/adopting distribution tag",
    );
    expect(text).toContain("検証 / 進捗 source basis 再確認日: 2026-07-05");
    expect(text).toContain("1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23");
    expect(text).toContain("HR-NFR-P5-03");
    expect(text).toContain("PLAN-M-02");
    expect(text).toContain("数量だけでなく意味");
    expect(text).toContain("100% の数値だけを L14 / whole-program completion 証跡として扱わない");
    expect(text).toContain("objectiveProgress");
    expect(text).toContain("percent: 90");
    expect(text).toContain("completionClaimAllowed: false");
    expect(text).toContain("version_up_parked");
    expect(completionRow).toContain("PLAN-L7-146-serverless-readonly-share");
    expect(completionRow).toContain("PLAN-M-02-helix-identifier-rename");
    expect(completionRow).toContain("completionClaimAllowed=false");
    expect(completionRow).toContain("archive で隠さず");
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
      "docs/governance/helix-l0-l8-design-consistency-audit.md",
      "src/lint/semantic-frontier-consistency.ts",
      "tests/semantic-frontier-consistency.test.ts",
      "docs/design/helix/L0-charter/helix-charter_v0.1.md",
      "docs/design/helix/L1-requirements/pillar-requirements.md",
      "docs/design/helix/L2-screen/screen-mock-boundary.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "docs/design/helix/L5-detail/pillar-detail-design.md",
      "docs/design/helix/L6-function-design/pillar-function-design.md",
      "docs/design/helix/L7-implementation/implementation-evidence-index.md",
      "docs/design/helix/L8-integration/integration-evidence-index.md",
      "docs/design/helix/L9-system/system-evidence-index.md",
      "docs/design/helix/L10-ux/ux-evidence-boundary.md",
      "docs/design/helix/L11-uat/uat-evidence-boundary.md",
      "docs/design/helix/L12-acceptance/acceptance-evidence-index.md",
      "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
      "docs/design/helix/L14-operations/operations-feedback-boundary.md",
      "docs/test-design/helix/L1-pillar-operational-test-design.md",
      "docs/test-design/helix/L2-screen-ux-test-design.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/test-design/helix/L4-pillar-system-test-design.md",
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      "docs/test-design/harness/L7-unit-test-design.md",
      "docs/test-design/harness/L8-integration-test-design.md",
      "docs/test-design/harness/L9-system-test-design.md",
      "docs/test-design/harness/proposal-document-coverage-routing.md",
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
      .replaceAll("外部ソース HEAD 確認日: 2026-07-05", "外部ソース HEAD 確認日: 2026-06-30")
      .replaceAll(
        "外部 source ledger (checked 2026-07-05)",
        "外部 source ledger (checked 2026-01-01)",
      )
      .replaceAll("RetryYN/HELIX-HARNESS-OS", "HELIX-HARNESS-OS-missing")
      .replaceAll("unpublished", "distribution-marker-missing")
      .replaceAll("distribution_latest_tag", "distribution_latest_tag_missing")
      .replaceAll("package.json version: `0.1.0`", "package.json version: `0.1.9`")
      .replaceAll("local distribution tag: `v0.1.0`", "local distribution tag: `v0.1.9`")
      .replaceAll("現行配布 latest tag: `unpublished`", "現行配布 latest tag: `missing`")
      .replaceAll(
        "version-up activation required before publishing/adopting distribution tag",
        "version-up activation marker missing",
      )
      .replaceAll(
        "検証 / 進捗 source basis 再確認日: 2026-07-05",
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
        "G-01: missing external source marker 外部ソース HEAD 確認日: 2026-07-05",
        "G-01: missing external source marker RetryYN/HELIX-HARNESS-OS",
        "G-01: missing external source marker unpublished",
        "G-01: missing external source marker 検証 / 進捗 source basis 再確認日: 2026-07-05",
        expect.stringMatching(/^G-01: 外部 source ledger checked date is stale: 2026-01-01/),
        "G-01: 外部 source ledger distribution_repo command missing git ls-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git refs/heads/main",
        "G-01: 外部 source ledger distribution_repo observed missing unpublished",
        "G-01: 外部 source ledger missing row distribution_latest_tag",
        "G-01: missing distribution version binding marker package.json version: `0.1.0`",
        "G-01: missing distribution version binding marker local distribution tag: `v0.1.0`",
        "G-01: missing distribution version binding marker 現行配布 latest tag: `unpublished`",
        "G-01: missing distribution version binding marker version-up activation required before publishing/adopting distribution tag",
      ]),
    );
  });

  it("fails when external observed source values drift from the ledger", () => {
    const baseInput = loadObjectiveEvidenceAuditInput();
    const ok = analyzeObjectiveEvidenceAudit({
      ...baseInput,
      externalObserved: {
        development_repo: "b828fcf64c204d1cfa65c729fa590ca9562adccc",
        distribution_repo: "unpublished",
        distribution_latest_tag: "unpublished",
      },
    });
    expect(ok.ok).toBe(true);

    const partial = analyzeObjectiveEvidenceAudit({
      ...baseInput,
      externalObserved: {
        development_repo: "b828fcf64c204d1cfa65c729fa590ca9562adccc",
      },
    });

    expect(partial.ok).toBe(false);
    expect(partial.violations).toEqual(
      expect.arrayContaining([
        "G-01: 外部 source ledger externalObserved missing distribution_repo",
        "G-01: 外部 source ledger externalObserved missing distribution_latest_tag",
      ]),
    );

    const drifted = analyzeObjectiveEvidenceAudit({
      ...baseInput,
      externalObserved: {
        development_repo: "b828fcf64c204d1cfa65c729fa590ca9562adccc",
        distribution_repo: "different-pack-head",
        distribution_latest_tag: "unpublished",
      },
    });

    expect(drifted.ok).toBe(false);
    expect(drifted.violations).toContain(
      "G-01: 外部 source ledger distribution_repo observed drift expected=unpublished actual=different-pack-head",
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

  it("fails when the meaning-based feature-list hard gate is detached from objective progress", () => {
    const text = auditText()
      .replaceAll(
        "docs/governance/helix-l0-l8-design-consistency-audit.md",
        "docs/governance/helix-l0-l8-design-consistency-audit-removed.md",
      )
      .replaceAll(
        "src/lint/semantic-frontier-consistency.ts",
        "src/lint/semantic-frontier-consistency-removed.ts",
      )
      .replaceAll(
        "tests/semantic-frontier-consistency.test.ts",
        "tests/semantic-frontier-consistency-removed.test.ts",
      )
      .replaceAll("C-18", "consistency-row-removed")
      .replaceAll("semantic-frontier-consistency", "frontier-hard-gate-removed")
      .replaceAll("live `semanticFeatureFrontierRecords[]`", "live frontier records removed")
      .replaceAll("prose-only feature list", "prose-only marker removed");

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding: loadObjectiveEvidenceAuditInput().outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-09: missing meaning-based frontier hard-gate artifact citation docs/governance/helix-l0-l8-design-consistency-audit.md",
        "G-09: missing meaning-based frontier hard-gate artifact citation src/lint/semantic-frontier-consistency.ts",
        "G-09: missing meaning-based frontier hard-gate artifact citation tests/semantic-frontier-consistency.test.ts",
        "G-09: missing meaning-based frontier hard-gate marker semantic-frontier-consistency",
        "G-09: missing meaning-based frontier hard-gate marker C-18",
        "G-09: missing meaning-based frontier hard-gate marker live `semanticFeatureFrontierRecords[]`",
        "G-09: missing meaning-based frontier hard-gate marker prose-only feature list",
      ]),
    );
  });

  it("fails when HELIX L0-L14 layer coverage citations are dropped", () => {
    const text = auditText()
      .replaceAll(
        "docs/design/helix/L2-screen/screen-mock-boundary.md",
        "docs/design/helix/L2-screen/screen-mock-boundary-removed.md",
      )
      .replaceAll(
        "docs/design/helix/L7-implementation/implementation-evidence-index.md",
        "docs/design/helix/L7-implementation/implementation-evidence-index-removed.md",
      )
      .replaceAll(
        "docs/design/helix/L14-operations/operations-feedback-boundary.md",
        "docs/design/helix/L14-operations/operations-feedback-boundary-removed.md",
      )
      .replaceAll(
        "docs/test-design/helix/L2-screen-ux-test-design.md",
        "docs/test-design/helix/L2-screen-ux-test-design-removed.md",
      )
      .replaceAll(
        "docs/test-design/helix/L5-pillar-integration-test-design.md",
        "docs/test-design/helix/L5-pillar-integration-test-design-removed.md",
      )
      .replaceAll(
        "docs/test-design/harness/L7-unit-test-design.md",
        "docs/test-design/harness/L7-unit-test-design-removed.md",
      );

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding: loadObjectiveEvidenceAuditInput().outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/design/helix/L2-screen/screen-mock-boundary.md",
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/design/helix/L7-implementation/implementation-evidence-index.md",
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/design/helix/L14-operations/operations-feedback-boundary.md",
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/test-design/helix/L2-screen-ux-test-design.md",
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/test-design/helix/L5-pillar-integration-test-design.md",
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/test-design/harness/L7-unit-test-design.md",
      ]),
    );
  });

  it("fails when required HELIX L0-L14 coverage artifacts are present but not git tracked", () => {
    const baseInput = loadObjectiveEvidenceAuditInput();
    const trackedFiles = new Set(
      Array.from(baseInput.trackedFiles ?? []).filter(
        (path) => path !== "docs/design/helix/L2-screen/screen-mock-boundary.md",
      ),
    );

    const result = analyzeObjectiveEvidenceAudit({
      ...baseInput,
      trackedFiles,
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-06: HELIX L0-L14 layer coverage artifact not git tracked docs/design/helix/L2-screen/screen-mock-boundary.md",
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
      auditOk: false,
      progressEvidenceTrusted: false,
    });
    expect(result.objectiveProgress.auditViolationCount).toBeGreaterThan(0);
    expect(result.objectiveProgress.evidenceTrustReason).toContain("diagnostic only");
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
      auditOk: true,
      auditViolationCount: 0,
      progressEvidenceTrusted: true,
    });
    expect(result.objectiveProgress.basis).toContain("G-10 is blocked by completionReadiness");
    expect(objectiveEvidenceAuditMessages(result)[0]).toContain(
      "objective-evidence-audit - OK (completion=blocked, progress=90%, proved=9/10)",
    );
  });

  it("keeps completion claim blocked when readiness is ready but audit evidence is invalid", () => {
    const readyOutstanding = analyzeOutstandingWork([], 0);
    const invalidText = auditText().replace(
      "外部ソース HEAD 確認日: 2026-07-05",
      "外部ソース HEAD 確認日: missing",
    );

    const result = analyzeObjectiveEvidenceAudit({
      auditText: invalidText.replace("| G-10 |", "| G-10 |").replace("| blocked |", "| proved |"),
      outstanding: readyOutstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.objectiveProgress).toMatchObject({
      percent: 100,
      completionStatus: "ready",
      completionClaimAllowed: false,
      auditOk: false,
      progressEvidenceTrusted: false,
    });
    expect(result.objectiveProgress.auditViolationCount).toBeGreaterThan(0);
  });
});
