import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const guidance = readFileSync("docs/process/drive-route-system.md", "utf8");

describe("drive route typed authority guidance", () => {
  it("U-DRTA-001: requirements registryを意味正本として固定する", () => {
    expect(guidance).toContain("authority: docs/governance/helix-harness-requirements_v1.3.md");
    expect(guidance).toContain(
      "registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
    );
    expect(guidance).toContain("generated projection");
    expect(guidance).toContain("compatibility inventory");
    expect(guidance).not.toContain("authority: config/drive-route-catalog.json");
  });

  it("U-DRTA-002: classification axesを同一enumへ畳み込まない", () => {
    for (const marker of [
      "development style",
      "case-driven model",
      "workflow model",
      "subroute",
      "specialist drive",
      "PLAN kind",
      "execution mode",
      "specialist workflow",
      "specialist capability",
    ]) {
      expect(guidance.toLowerCase()).toContain(marker.toLowerCase());
    }
    expect(guidance).toContain("同じenum、CLI引数、DB fieldへ異なる軸を畳み込まない");
  });

  it("U-DRTA-003: signalからtyped identityへの導出線を固定する", () => {
    expect(guidance).toContain("signal／work item");
    expect(guidance).toContain("requirements registryのtarget_axis／target_id");
    expect(guidance).toContain("state machine／execution policy／specialist binding");
    expect(guidance).toContain(
      "signalから直接branch名、PLAN kind、専門職、runtime modeを推測しない",
    );
  });

  it("U-DRTA-004: legacy入力を一方向変換し、曖昧値をfail-closeする", () => {
    expect(guidance).toContain("compatibility adapter");
    expect(guidance).toContain("`unsupported`／`ambiguous`");
    expect(guidance).toContain("fail-close");
    expect(guidance).toContain("legacy identityは再出力しない");
    expect(guidance).not.toContain("15 route exact set");
  });

  it("U-DRTA-005: L1〜L12のevidence束縛を完了条件へ含める", () => {
    expect(guidance).toContain("L1〜L12");
    expect(guidance).toContain("Issue／work itemのtyped classification");
    expect(guidance).toContain("DB episodeとcurrent-location");
    expect(guidance).toContain("right-arm evidenceと独立exact-HEAD review");
    expect(guidance).toContain("Forward再入");
  });
});
