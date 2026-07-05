import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const AUDIT_PATH = "docs/governance/helix-l0-l8-design-consistency-audit.md";
const PLAN_L7_141 = "docs/plans/PLAN-L7-141-web-dashboard-component-derived.md";
const PLAN_L7_146 = "docs/plans/PLAN-L7-146-serverless-readonly-share.md";
const VERSION_UP_MODE = "docs/process/modes/version-up.md";
const VERSION_UP_DISCOVERY = "docs/plans/PLAN-DISCOVERY-09-version-up-mode.md";
const FORWARD_DESIGN = "docs/process/forward/L00-L06-design-phase.md";
const FORWARD_OVERVIEW = "docs/process/forward/overview.md";
const DISCOVERY_MODE = "docs/process/modes/discovery.md";
const ADD_FEATURE_MODE = "docs/process/modes/add-feature.md";
const REVERSE_MODE = "docs/process/modes/reverse.md";

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
      "C-17",
      "C-18",
    ];
    const frontier = ["C-12", "C-16"];

    for (const id of proved) {
      expect(auditRow(id), `${id} should be proved`).toContain("| proved |");
    }

    for (const id of frontier) {
      expect(auditRow(id), `${id} should be frontier`).toContain("| frontier |");
    }

    expect(auditRow("C-13")).toContain("| warning |");
    expect(auditText()).toContain("2026-07-04 時点の機械証跡では、全体進捗は **90%**");
    expect(auditText()).toContain("revised request は L0-L8 complete ではない");
    expect(auditText()).toContain("G-L7PACK.C");
    expect(auditText()).toContain("frontier: なし");
    expect(auditText()).toContain("PLAN-L7-141-web-dashboard-component-derived");
    expect(auditText()).toContain("PLAN-L7-146");
    expect(auditText()).toContain("PLAN-DISCOVERY-10");
    expect(auditText()).toContain("version-up parked");
  });

  it("cites the semantic design and test-design artifacts that substantiate L0-L8 descent", () => {
    const text = auditText();
    const requiredArtifacts = [
      "docs/design/helix/L0-charter/helix-charter_v0.1.md",
      "docs/design/helix/L1-requirements/pillar-requirements.md",
      "docs/test-design/helix/L1-pillar-operational-test-design.md",
      "docs/design/helix/L2-screen/screen-mock-boundary.md",
      "docs/test-design/helix/L2-screen-ux-test-design.md",
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "docs/test-design/helix/L4-pillar-system-test-design.md",
      "docs/design/helix/L5-detail/pillar-detail-design.md",
      "docs/test-design/helix/L5-pillar-integration-test-design.md",
      "docs/design/helix/L6-function-design/pillar-function-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      "docs/design/helix/L7-implementation/implementation-evidence-index.md",
      "docs/design/helix/L8-integration/integration-evidence-index.md",
      "docs/design/helix/L9-system/system-evidence-index.md",
      "docs/design/helix/L10-ux/ux-evidence-boundary.md",
      "docs/design/helix/L11-uat/uat-evidence-boundary.md",
      "docs/design/helix/L12-acceptance/acceptance-evidence-index.md",
      "docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md",
      "docs/design/helix/L14-operations/operations-feedback-boundary.md",
      "docs/test-design/harness/L8-integration-test-design.md",
      "tests/g8-integration-workflow.test.ts",
      "docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md",
      "tests/roadmap.test.ts",
      "docs/plans/PLAN-L7-141-web-dashboard-component-derived.md",
      "tests/web.test.ts",
      "docs/plans/PLAN-L7-146-serverless-readonly-share.md",
      "docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md",
      "docs/plans/PLAN-L7-206-visualization-read-model-response.md",
      "src/lint/semantic-frontier-consistency.ts",
      "docs/process/modes/version-up.md",
      "tests/semantic-frontier-consistency.test.ts",
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
    expect(text).toContain("low-drive-confidence");
    expect(text).toContain("proposal-coverage-team");
    expect(text).toContain("design_drift");
    expect(text).toContain("mode=reverse");
    expect(text).toContain("version_deferral");
    expect(text).toContain("mode=version-up");
    expect(text).toContain("安い docs lane だけでは risk を close しない");
  });

  it("records P5 absorption and modified visualization requirements without overclaiming descent", () => {
    const text = auditText();
    const normalized = text.replace(/\s+/g, " ");

    expect(auditRow("C-15")).toContain("HNFR-P5");
    expect(text).toContain("`HBR-P5` / `HB-P5` / `HC-P5` が無いことは意図的 meaning decision");
    expect(text).toContain("意図的 meaning decision");

    expect(auditRow("C-16")).toContain("| frontier |");
    expect(auditRow("C-16")).toContain("S4 PO decision pending");
    expect(text).toContain("asset/progress visualization request は記録済み");
    expect(normalized).toContain("revised request fully descended と扱わない");
    expect(text).toContain("frozen 43-item pillar overlay");
    expect(text).toContain(
      "visualization amendment を含む revised request は L0-L8 complete ではない",
    );
    expect(text).toContain("downstream L3/L4/L5/L6/L7 route");
  });

  it("answers PO semantic completeness questions without false completion wording", () => {
    const text = auditText();

    expect(text).toContain("## PO 質問台帳");
    expect(text).toContain("要求と要件定義はずれていないのか");
    expect(text).toContain("機能一覧は本当に合っているのか");
    expect(text).toContain("要求修正が入ったのに中身も合っているのか");
    expect(text).toContain("ワークフローに従っているのか");
    expect(text).toContain("全部終わっているのか");
    expect(text).toContain("いいえ。whole-program completion は blocked");
    expect(text).toContain("confirmed 43 items と explicit frontiers");
    expect(text).toContain("visualization S4");
    expect(text).toContain("rename cutover approval");
    expect(text).toContain("version-up parked work");
    expect(text).toContain("Pair-agent and setup/rename are aligned");
  });

  it("records the 2026-07-01 semantic re-read across feature list and blockers", () => {
    const text = auditText();
    const row = auditRow("C-17");

    expect(text).toContain("## 2026-07-01 再読追補");
    expect(text).toContain("## 2026-07-02 hard gate 追補");
    expect(row).toContain("| proved |");
    expect(row).toContain("pair-agent");
    expect(row).toContain("setup/rename");
    expect(row).toContain("handover status");
    expect(row).toContain("whole-program completion claim は不可");
    expect(text).toContain("Pair-agent TDD route");
    expect(text).toContain("Red/oracle markers before light implementation");
    expect(text).toContain("Pair-agent evidence and DB convergence");
    expect(text).toContain("model_runs");
    expect(text).toContain("gate_runs");
    expect(text).toContain("guardrail_decisions");
    expect(text).toContain("Setup and HELIX command naming");
    expect(text).toContain("`helix setup project` は future target");
    expect(text).toContain("Asset/progress visualization amendment");
    expect(text).toContain("Whole-program/L14 completion");
    expect(text).toContain("human_approval_pending");
    expect(text).toContain("irreversible_migration_pending");
    expect(text).toContain("po_decision_pending");
    expect(text).toContain("version_up_parked");

    const hardGateRow = auditRow("C-18");
    expect(hardGateRow).toContain("| proved |");
    expect(hardGateRow).toContain("semantic-frontier-consistency");
    expect(text).toContain("design_bottomup_mode");
    expect(text).toContain("asset_progress_visualization");
    expect(text).toContain("serverless_readonly_share");
    expect(text).toContain("name_cutover");
    expect(text).toContain("機能一覧を整合済みと扱える");
  });

  it("binds requirement amendments to the G-SF semantic feature frontier gate", () => {
    const forwardDesign = fileText(FORWARD_DESIGN);
    const forwardOverview = fileText(FORWARD_OVERVIEW);
    const discovery = fileText(DISCOVERY_MODE);
    const addFeature = fileText(ADD_FEATURE_MODE);
    const reverse = fileText(REVERSE_MODE);
    const l3 = fileText("docs/design/helix/L3-requirements/pillar-functional-requirements.md");
    const l4 = fileText("docs/design/helix/L4-basic-design/pillar-basic-design.md");
    const l5 = fileText("docs/design/helix/L5-detail/pillar-detail-design.md");
    const l6 = fileText("docs/design/helix/L6-function-design/pillar-function-design.md");
    const l12 = fileText("docs/test-design/helix/L3-pillar-acceptance-test-design.md");
    const l9System = fileText("docs/test-design/helix/L4-pillar-system-test-design.md");
    const l8Integration = fileText("docs/test-design/helix/L5-pillar-integration-test-design.md");
    const l7Unit = fileText("docs/test-design/helix/L6-pillar-unit-test-design.md");

    for (const text of [
      forwardDesign,
      discovery,
      addFeature,
      reverse,
      l3,
      l4,
      l5,
      l6,
      l12,
      l9System,
      l8Integration,
      l7Unit,
    ]) {
      expect(text).toContain("semantic_feature_frontier_record");
      expect(text).toContain("frontier_pending_decision");
    }

    for (const text of [forwardDesign, l3, l4, l5, l6, l12, l9System, l8Integration, l7Unit]) {
      expect(text).toContain("parked_future_version");
      expect(text).toContain("approval_gated_cutover");
    }

    expect(forwardDesign).toContain("## G-SF: semantic feature frontier gate");
    expect(forwardDesign).toContain("completion_claim_allowed");
    expect(forwardDesign).toContain("green command や doctor green");
    expect(forwardOverview).toContain("G-SF semantic feature frontier gate");
    expect(discovery).toContain("S3 evidence は `frontier_pending_decision` のまま");
    expect(addFeature).toContain("bottom-up build で機能意味が増えた場合");
    expect(reverse).toContain("実装や green command があっても意味ベース設計の完了根拠にならない");
    expect(l3).toContain("confirmed 43 件: `classification=confirmed_current`");
    expect(l3).toContain(
      "asset/progress visualization: `classification=frontier_pending_decision`",
    );
    expect(l3).toContain("version-up-activation-packet.v1");
    expect(l3).toContain("plan-only activation packet");
    expect(l3).toContain("apply surface を持たない");
    expect(l4).toContain("L4 UI-data boundary を未 confirmed");
    expect(l5).toContain("first-response artifact をもって revised request が fully descended");
    expect(l6).toContain("実装済み path の存在だけでは `completion_claim_allowed=true` にならない");
    expect(l12).toContain("G-SF oracle");
    expect(l9System).toContain("selected HST green");
    expect(l8Integration).toContain("current 43 件の integration completion に混ぜない");
    expect(l7Unit).toContain("G-SF | semantic frontier records");
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
