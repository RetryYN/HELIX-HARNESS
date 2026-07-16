import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeObjectiveEvidenceAudit,
  loadObjectiveEvidenceAuditInput,
  objectiveEvidenceAuditMessages,
} from "../src/lint/objective-evidence-audit";
import { analyzeOutstandingWork } from "../src/lint/outstanding";

const AUDIT_PATH = "docs/governance/helix-objective-evidence-audit.md";
const LIVE_OUTSTANDING_COUNT = 10;
const NEW_OUTSTANDING_PLAN_IDS = [
  "PLAN-L1-07-infinity-loop-platform-requirements",
  "PLAN-L7-459-design-freeze-authority-transition",
] as const;

function auditText(): string {
  return readFileSync(AUDIT_PATH, "utf8");
}

describe("HELIX objective evidence audit", () => {
  it("tracks active objective requirements and allows completion only when readiness is true", () => {
    const input = loadObjectiveEvidenceAuditInput();
    const text = input.auditText;
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
    expect(input.outstanding.items).toHaveLength(LIVE_OUTSTANDING_COUNT);
    expect(completionRow).toContain(`decisionCount=${input.outstanding.items.length}`);
    for (const planId of NEW_OUTSTANDING_PLAN_IDS) {
      expect(completionRow).toContain(planId);
    }

    expect(text).toContain("外部ソース HEAD 確認日: 2026-07-13");
    expect(text).toContain("外部 source ledger (checked 2026-07-13)");
    expect(text).toContain(
      "git ls-remote https://github.com/RetryYN/HELIX-HARNESS.git refs/heads/main",
    );
    expect(text).toContain(
      "git ls-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git refs/heads/main",
    );

    const l12Coverage = readFileSync(
      "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
      "utf8",
    );
    expect(l12Coverage).toContain("status: confirmed");
    expect(l12Coverage).toContain("## §3 機械ゲート対応");
    expect(l12Coverage).toContain("`recovery_runway` / `approval_review` / `attention_boundary`");
    expect(text).toContain("distribution_latest_tag");
    expect(text).toContain("sourceStatusDelta");
    expect(text).toContain("workflowRouteImpact");
    expect(text).toContain("6624ae45874e1fabdca26fada7327c5544bb1264");
    expect(text).toContain("RetryYN/HELIX-HARNESS");
    expect(text).toContain("RetryYN/HELIX-HARNESS-OS");
    expect(text).toContain("unpublished");
    expect(text).toContain("package.json version: `0.1.0`");
    expect(text).toContain("local distribution tag: `v0.1.0`");
    expect(text).toContain("現行配布 latest tag: `unpublished`");
    expect(text).toContain(
      "version-up activation required before publishing/adopting distribution tag",
    );
    expect(text).toContain("検証 / 進捗 source basis 再確認日: 2026-07-13");
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
      "docs/test-design/harness/L8-unit-test-design.md",
      "docs/test-design/harness/L8-integration-test-design.md",
      "docs/test-design/harness/L9-integration-test-design.md",
      "docs/test-design/harness/L9-system-test-design.md",
      "docs/test-design/harness/proposal-document-coverage-routing.md",
      "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
      "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
      "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
      "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
      "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
      "src/vmodel/zip-manifest.ts",
      "src/vmodel/fit.ts",
      "src/schema/harness-db-tables-design.ts",
      "src/state-db/projection-writer.ts",
      "src/lint/db-projection-ingestion.ts",
      "src/state-db/current-location.ts",
      "src/state-db/visualization-view-model.ts",
      "src/runtime/summary-surface-audit.ts",
      "src/vscode/tree-view-provider.ts",
      "src/vscode/extension-adapter.ts",
      "tests/vmodel-zip-manifest.test.ts",
      "tests/current-location.test.ts",
      "tests/visualization-treeview.test.ts",
      "tests/visualization-view-model.test.ts",
      "tests/summary-surface-audit.test.ts",
      "tests/vscode-extension-adapter.test.ts",
      "tests/slow/doctor.test.ts",
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
      "docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md",
      "docs/plans/PLAN-L7-456-document-agent-metadata-phase-b-apply.md",
      "docs/plans/PLAN-L7-457-document-diff-local-artifact-output.md",
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
      .replaceAll("外部ソース HEAD 確認日: 2026-07-13", "外部ソース HEAD 確認日: 2026-06-30")
      .replaceAll(
        "外部 source ledger (checked 2026-07-13)",
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
        "検証 / 進捗 source basis 再確認日: 2026-07-13",
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
        "G-01: missing external source marker 外部ソース HEAD 確認日: 2026-07-13",
        "G-01: missing external source marker RetryYN/HELIX-HARNESS-OS",
        "G-01: missing external source marker unpublished",
        "G-01: missing external source marker 検証 / 進捗 source basis 再確認日: 2026-07-13",
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
        development_repo: "6624ae45874e1fabdca26fada7327c5544bb1264",
        distribution_repo: "unpublished",
        distribution_latest_tag: "unpublished",
      },
    });
    expect(ok.ok).toBe(true);

    const partial = analyzeObjectiveEvidenceAudit({
      ...baseInput,
      externalObserved: {
        development_repo: "6624ae45874e1fabdca26fada7327c5544bb1264",
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
        development_repo: "6624ae45874e1fabdca26fada7327c5544bb1264",
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
        "docs/test-design/harness/L8-unit-test-design.md",
        "docs/test-design/harness/L8-unit-test-design-removed.md",
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
        "G-06: missing HELIX L0-L14 layer coverage artifact citation docs/test-design/harness/L8-unit-test-design.md",
      ]),
    );
  });

  it("fails when V-model ZIP/L12 redesign evidence is detached from objective progress", () => {
    const text = auditText()
      .replaceAll(
        "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
        "docs/design/helix/L12-vmodel/vmodel-layer-coverage-removed.md",
      )
      .replaceAll(
        "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
        "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix-removed.md",
      )
      .replaceAll(
        "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
        "docs/test-design/helix/vmodel-docgen-fit-acceptance-removed.md",
      )
      .replaceAll("src/vmodel/zip-manifest.ts", "src/vmodel/zip-manifest-removed.ts")
      .replaceAll("src/vmodel/fit.ts", "src/vmodel/fit-removed.ts")
      .replaceAll(
        "src/schema/harness-db-tables-design.ts",
        "src/schema/harness-db-tables-design-removed.ts",
      )
      .replaceAll("src/state-db/projection-writer.ts", "src/state-db/projection-writer-removed.ts")
      .replaceAll(
        "src/lint/db-projection-ingestion.ts",
        "src/lint/db-projection-ingestion-removed.ts",
      )
      .replaceAll("src/state-db/current-location.ts", "src/state-db/current-location-removed.ts")
      .replaceAll(
        "src/state-db/visualization-view-model.ts",
        "src/state-db/visualization-view-model-removed.ts",
      )
      .replaceAll(
        "src/runtime/summary-surface-audit.ts",
        "src/runtime/summary-surface-audit-removed.ts",
      )
      .replaceAll("src/vscode/extension-adapter.ts", "src/vscode/extension-adapter-removed.ts")
      .replaceAll(
        "tests/visualization-view-model.test.ts",
        "tests/visualization-view-model-removed.test.ts",
      )
      .replaceAll(
        "tests/summary-surface-audit.test.ts",
        "tests/summary-surface-audit-removed.test.ts",
      )
      .replaceAll("zip-source-integrity", "zip source integrity removed")
      .replaceAll("zip-adoption-binding", "zip adoption binding removed")
      .replaceAll("project_zip_adoption_decisions", "project zip adoption decisions removed")
      .replaceAll("project_tailoring_decisions", "project tailoring decisions removed")
      .replaceAll("project_vmodel_regression_guards", "project vmodel regression guards removed")
      .replaceAll("project_vmodel_fit_blockers", "project vmodel fit blockers removed")
      .replaceAll("project_vmodel_handoff_summary", "project vmodel handoff summary removed")
      .replaceAll("vmodel-zip-source-bindings", "vmodel zip source bindings removed")
      .replaceAll(
        "function-design-absorption-binding",
        "function design absorption binding removed",
      )
      .replaceAll("roadmap-current-binding", "roadmap current binding removed")
      .replaceAll("project_roadmap_current_actions", "project roadmap current actions removed")
      .replaceAll("drive-model-binding", "drive model binding removed")
      .replaceAll("reverse-dependency-closure", "reverse dependency closure removed")
      .replaceAll("candidate-dependency-closure", "candidate dependency closure removed")
      .replaceAll("vscode-extension-dynamic-binding", "vscode extension dynamic binding removed")
      .replaceAll("operation-scope-binding", "operation scope binding removed")
      .replaceAll("summary-surface semantic_status=pass", "summary surface semantic status removed")
      .replaceAll("attention_boundary", "attention boundary removed")
      .replaceAll("vmodel_zip_source_bindings", "vmodel zip source binding table removed")
      .replaceAll("human_approval blocked_by=human_approval", "human approval boundary removed")
      .replaceAll("needs_recovery approval count=343", "needs recovery approval count removed")
      .replaceAll("view-nodes=observation-gap:6/6", "operation observation gap view nodes removed")
      .replaceAll("L0-slide-to-L1-planning", "L0 slide to L1 planning removed");

    const result = analyzeObjectiveEvidenceAudit({
      auditText: text,
      outstanding: loadObjectiveEvidenceAuditInput().outstanding,
      repoRoot: process.cwd(),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "G-06: missing V-model ZIP/L12 redesign artifact citation docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
        "G-06: missing V-model ZIP/L12 redesign artifact citation docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
        "G-06: missing V-model ZIP/L12 redesign artifact citation docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/vmodel/zip-manifest.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/vmodel/fit.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/schema/harness-db-tables-design.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/state-db/projection-writer.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/lint/db-projection-ingestion.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/state-db/current-location.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/state-db/visualization-view-model.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/runtime/summary-surface-audit.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation src/vscode/extension-adapter.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation tests/visualization-view-model.test.ts",
        "G-06: missing V-model ZIP/L12 redesign artifact citation tests/summary-surface-audit.test.ts",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker zip-source-integrity",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker zip-adoption-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_zip_adoption_decisions",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_tailoring_decisions",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_vmodel_regression_guards",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_vmodel_fit_blockers",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_vmodel_handoff_summary",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker vmodel-zip-source-bindings",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker function-design-absorption-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker roadmap-current-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker project_roadmap_current_actions",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker drive-model-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker reverse-dependency-closure",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker candidate-dependency-closure",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker vscode-extension-dynamic-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker operation-scope-binding",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker summary-surface semantic_status=pass",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker attention_boundary",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker vmodel_zip_source_bindings",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker human_approval blocked_by=human_approval",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker needs_recovery approval count=343",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker view-nodes=observation-gap:6/6",
        "G-09: missing V-model ZIP/L12 objective hard-gate marker L0-slide-to-L1-planning",
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

  it("U-OBJAUD-001: fails closed when G-10 decisionCount drifts, collides, or contradicts live outstanding items", () => {
    const input = loadObjectiveEvidenceAuditInput();
    const liveMarker = `decisionCount=${input.outstanding.items.length}`;
    const staleMarker = `decisionCount=${input.outstanding.items.length + 1}`;
    const driftedAuditText = input.auditText
      .split("\n")
      .map((line) =>
        line.startsWith("| G-10 |") ? line.replaceAll(liveMarker, staleMarker) : line,
      )
      .join("\n");
    const result = analyzeObjectiveEvidenceAudit({
      ...input,
      auditText: driftedAuditText,
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      `G-10: completion row decisionCount markers must all equal ${input.outstanding.items.length} (actual=${input.outstanding.items.length + 1},${input.outstanding.items.length + 1})`,
    );
  });

  it("U-OBJAUD-001b: rejects decisionCount prefix collisions and contradictory markers", () => {
    const input = loadObjectiveEvidenceAuditInput();
    const expected = input.outstanding.items.length;
    const liveMarker = `decisionCount=${expected}`;
    const mutateG10 = (mutate: (line: string) => string): string =>
      input.auditText
        .split("\n")
        .map((line) => (line.startsWith("| G-10 |") ? mutate(line) : line))
        .join("\n");

    const prefixCollision = analyzeObjectiveEvidenceAudit({
      ...input,
      auditText: mutateG10((line) => line.replaceAll(liveMarker, `decisionCount=${expected + 10}`)),
    });
    expect(prefixCollision.ok).toBe(false);
    expect(prefixCollision.violations).toContain(
      `G-10: completion row decisionCount markers must all equal ${expected} (actual=${expected + 10},${expected + 10})`,
    );

    const contradictory = analyzeObjectiveEvidenceAudit({
      ...input,
      auditText: mutateG10((line) => `${line} decisionCount=${expected + 1}`),
    });
    expect(contradictory.ok).toBe(false);
    expect(contradictory.violations).toContain(
      `G-10: completion row decisionCount markers must all equal ${expected} (actual=${expected},${expected},${expected + 1})`,
    );
  });

  it("keeps completion claim blocked when readiness is ready but audit evidence is invalid", () => {
    const readyOutstanding = analyzeOutstandingWork([], 0);
    const invalidText = auditText().replace(
      "外部ソース HEAD 確認日: 2026-07-13",
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
