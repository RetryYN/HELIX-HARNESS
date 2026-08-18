import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync("README.md", "utf8");

describe("root README current typed authority (Issue #206)", () => {
  it("U-RRTA-001: Node24 source checkout guidance excludes retired Bun guidance", () => {
    expect(readme).toContain("Node.js 24.15.0以上25未満");
    expect(readme).toContain("npm install");
    expect(readme).toContain("node /path/to/HELIX-HARNESS/dist/helix.js");
    expect(readme).not.toMatch(/\bBun\b|bun run|bun install/i);
  });

  it("U-RRTA-002: current layer authority is L1-L12 with L0 as an anchor", () => {
    expect(readme).toContain("L1–L12がcurrent canonical");
    expect(readme).toContain("L0は層外のauthority anchor");
    expect(readme).not.toMatch(/L0-L14|L1-L14|L0 → L14|L0–L14/);
  });

  it("U-RRTA-003: typed axes remain distinct and use registry projection", () => {
    expect(readme).toContain("workflow-classification-registry.v1.json");
    expect(readme).toContain("workflow-classification-catalog.v1.json");
    expect(readme).toContain("compatibility inventoryのみ");
    expect(readme).toContain("target_axis");
    expect(readme).toContain("target_id");
    expect(readme).toContain("Production Scrumは `development_style`");
    expect(readme).toContain("Discovery／PoCは `case_driven_model`");
    expect(readme).not.toContain("駆動モデル");
  });

  it("U-RRTA-004: workflow identity is not reconstructed from the old drive input", () => {
    expect(readme).toContain("`--mode`はruntimeのexecution modeに限定");
    expect(readme).not.toMatch(
      /--drive\s+(scrum|reverse|recovery)|selected_model|default_model|available_models|drive_model/,
    );
  });
});
