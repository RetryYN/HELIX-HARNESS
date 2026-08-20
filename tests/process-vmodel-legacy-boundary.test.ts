import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DESIGN_PATH = "docs/process/forward/L00-L06-design-phase.md";
const OVERVIEW_PATH = "docs/process/forward/overview.md";

describe("V-model process guidance legacy boundary", () => {
  it("U-PWFA-005: current guidance stays on canonical L1-L12 pairs", () => {
    const design = readFileSync(DESIGN_PATH, "utf8");
    const currentDesign = design.split("## 左腕共通アンチパターン", 1)[0];
    expect(currentDesign).toContain("current canonicalはL1-L12");
    expect(currentDesign).toContain("V-pair (右腕) | **L12**");
    expect(currentDesign).toContain("L1↔L12 OT ペア孤児 0");
    expect(currentDesign).toContain("L8-L12 のどこへ降ろすか");
    expect(currentDesign).not.toMatch(/\| V-pair \(右腕\) \| \*\*L14\*\*/);
    expect(currentDesign).not.toMatch(/L1↔L14|L8-L14/);

    const overview = readFileSync(OVERVIEW_PATH, "utf8");
    const currentOverview = overview.split("> **旧L0-L14 compatibility要点", 1)[0];
    expect(currentOverview).toContain("canonical ForwardはL1-L12");
    expect(currentOverview).toContain("Production Scrum／Hybrid（development style）");
    expect(currentOverview).toContain("Discovery PoC（case-driven model）");
    expect(currentOverview).not.toMatch(/L1↔L14|L8-L14/);
  });
});
