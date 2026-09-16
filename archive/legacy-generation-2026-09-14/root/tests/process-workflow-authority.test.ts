import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexPath = "docs/process/modes/README.md";

function readIndex(): string {
  return readFileSync(indexPath, "utf8");
}

describe("process workflow authority projection", () => {
  it("U-PWFA-001: requirements registryを唯一の意味authorityとして束縛する", () => {
    const body = readIndex();
    expect(body).toContain("authority: docs/governance/helix-harness-requirements_v1.3.md");
    expect(body).toContain(
      "registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
    );
    expect(body).toContain("catalog_projection: config/workflow-classification-catalog.v1.json");
    expect(body).toContain("legacy_catalog_role: compatibility_inventory");
    expect(body).toContain("registry_version + registry_source_digest + target_axis + target_id");
  });

  it("U-PWFA-002: 異なるaxisを共通route enumへ戻さない", () => {
    const body = readIndex();
    for (const binding of [
      "| development style | `PRODUCTION_SCRUM` |",
      "| case-driven model | `DISCOVERY_POC` |",
      "| workflow model | `REVERSE` |",
      "| subroute | `SCRUM_REVERSE` |",
    ]) {
      expect(body).toContain(binding);
    }
    expect(body).toContain("この表は異なるaxisを一つのroute enumへ畳み込む一覧ではない。");
    expect(body).not.toContain("## 2. 15 route exact set");
    expect(body).not.toContain("機械経路正本は`config/drive-route-catalog.json`");
  });

  it("U-PWFA-003: DiscoveryとScrumのstate machineを分離する", () => {
    const body = readIndex();
    expect(body).toContain("`DISCOVERY_POC_S0_S4`は`DISCOVERY_POC`だけを親とする。");
    expect(body).toContain("`SCRUM_REVERSE_SR0_SR4`は`SCRUM_REVERSE`だけを親とする。");
    expect(body).toContain(
      "Production Scrum自体をDiscoveryのS0–S4へ入れず、DiscoveryをScrum phaseとして扱わない。",
    );
  });

  it("U-PWFA-004: legacy入力はinput-onlyかつ曖昧値をfail-closeする", () => {
    const body = readIndex();
    expect(body).toContain("input-only compatibility adapter");
    expect(body).toContain(
      "曖昧な`forward`、`scrum`、`design-bottomup`、`verification`は推測せずfail-closeする。",
    );
    expect(body).toContain(
      "legacy identityをcurrent PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力しない。",
    );
  });
});
