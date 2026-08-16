import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const scrum = readFileSync("docs/process/modes/scrum.md", "utf8");
const discovery = readFileSync("docs/process/modes/discovery.md", "utf8");

describe("Production Scrum / Discovery typed process authority", () => {
  it("U-PSDA-001: Production ScrumとHybridをdevelopment styleへ固定する", () => {
    expect(scrum).toContain("target_axis | target_id");
    expect(scrum).toContain("| `development_style` | `PRODUCTION_SCRUM` |");
    expect(scrum).toContain("| `development_style` | `V_DESIGN_SCRUM_IMPLEMENTATION` |");
    expect(scrum).not.toContain("# Scrum 駆動モデル");
  });

  it("U-PSDA-002: Scrum ReverseだけをsubrouteとSR0-SR4 state machineへ束縛する", () => {
    expect(scrum).toContain("| `subroute` | `SCRUM_REVERSE` |");
    expect(scrum).toContain("subroute_state_machine: SCRUM_REVERSE_SR0_SR4");
    for (const state of [
      "SR0 evidence capture",
      "SR1 observed contract",
      "SR2 V-layer mapping",
      "SR3 design/refactor proposal",
      "SR4 pair freeze and Forward reentry",
    ]) {
      expect(scrum).toContain(state);
    }
  });

  it("U-PSDA-003: Discoveryだけをcase-driven modelとS0-S4へ束縛する", () => {
    expect(discovery).toContain("target_axis: case_driven_model");
    expect(discovery).toContain("target_id: DISCOVERY_POC");
    expect(discovery).toContain("state_machine: DISCOVERY_POC_S0_S4");
    expect(discovery).toContain("S4 `decision_outcome=confirmed` → **L1 要求定義**");
  });

  it("U-PSDA-004: ScrumをDiscoveryのphaseまたはpoc identityへ戻さない", () => {
    expect(scrum).toContain("production sliceをDiscoveryの`DISCOVERY_POC_S0_S4`へ入れず");
    expect(scrum).toContain("旧Scrum PLANに残るS3／S4 fieldはcompatibility evidenceとしてだけ読み");
    expect(scrum).not.toContain("Discovery と同じ `kind=poc`");
    expect(scrum).not.toContain("workflow_phase | `S0-S4`");
  });

  it("U-PSDA-005: active Bun commandと旧L0-L14正本を再導入しない", () => {
    for (const body of [scrum, discovery]) {
      expect(body).not.toContain("`bun run");
      expect(body).not.toContain("`bun test");
      expect(body).not.toContain("Forward L0-L14");
      expect(body).not.toContain("L0-L14 doc 体系");
    }
  });
});
