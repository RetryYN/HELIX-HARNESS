import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync("docs/process/README.md", "utf8");

describe("process README typed authority", () => {
  it("U-PRTA-001: requirementsからgenerated projectionまでの正本列を固定する", () => {
    expect(readme).toContain("docs/governance/helix-harness-requirements_v1.3.md");
    expect(readme).toContain(
      "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
    );
    expect(readme).toContain("config/workflow-classification-catalog.v1.json");
    expect(readme).toContain("config/drive-route-catalog.json");
    expect(readme).toContain("compatibility inventory");
    expect(readme).toContain("registry_version + registry_source_digest + target_axis + target_id");
    expect(readme).not.toContain("config/drive-route-catalog.json`をauthority");
  });

  it("U-PRTA-002: current identityのaxisを独立して案内する", () => {
    for (const marker of [
      "development style",
      "case-driven model",
      "workflow model",
      "subroute",
      "state machine",
      "specialist drive",
      "PLAN kind",
      "execution mode",
      "specialist workflow",
      "specialist capability",
    ]) {
      expect(readme.toLowerCase()).toContain(marker.toLowerCase());
    }
    expect(readme).toContain("`PRODUCTION_SCRUM`");
    expect(readme).toContain("`V_DESIGN_SCRUM_IMPLEMENTATION`");
    expect(readme).toContain("`DISCOVERY_POC`");
    expect(readme).toContain("`SCRUM_REVERSE`");
  });

  it("U-PRTA-003: Production Scrum、Discovery、Scrum Reverseの境界を固定する", () => {
    expect(readme).toContain("Production ScrumとV設計＋Scrum実装Hybridはdevelopment style");
    expect(readme).toContain("Discoveryはcase-driven model");
    expect(readme).toContain("Production Scrumのphaseや\n同じstate machineではない");
    expect(readme).toContain("Scrum ReverseはProduction ScrumまたはHybridを親に持つsubroute");
    expect(readme).toContain("`DISCOVERY_POC`");
    expect(readme).toContain("`S0→S1→S2→S3→S4`");
    expect(readme).toContain("`SR0 evidence capture");
    expect(readme).not.toContain("kind=poc");
  });

  it("U-PRTA-004: L1-L12と正規pairをcurrent入口へ固定する", () => {
    expect(readme).toContain("ForwardはL1からL12へ進み");
    for (const pair of ["L1 企画", "L2 要求・画面プロト", "L3 要件定義・凍結", "L6 実装"]) {
      expect(readme).toContain(pair);
    }
    for (const pair of ["L12 運用テスト", "L11 受入テスト", "L10 総合テスト"]) {
      expect(readme).toContain(pair);
    }
    expect(readme).toContain("L0 charterは層外のauthority anchor");
    expect(readme).not.toContain("L0-L14");
  });

  it("U-PRTA-005: signalからtyped identityとevidenceへの導出線を固定する", () => {
    expect(readme).toContain("signal / work item");
    expect(readme).toContain("target_axis + target_id");
    expect(readme).toContain("execution policy / state machine");
    expect(readme).toContain("receipt（HEAD、contract、digest、owner、evidence）");
    expect(readme).toContain("signalからbranch名、PLAN kind、専門職、runtime構成を直接推測しない");
    expect(readme).toContain("high-impact action、正本state更新、gate passを自己承認しない");
  });

  it("U-PRTA-006: 旧定義をcurrent guidanceへ再導入しない", () => {
    expect(readme).not.toContain("駆動モデル");
    expect(readme).not.toContain("15 route");
    expect(readme).not.toContain("旧入口分類");
    expect(readme).not.toContain("Bun");
    expect(readme).toContain("compatibility-only");
    expect(readme).toContain(
      "legacy identityは\ncurrent PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力しない",
    );
  });
});
