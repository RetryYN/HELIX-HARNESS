import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const REQUIREMENTS = "docs/governance/helix-harness-requirements_v1.3.md";
const DESIGN = "docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md";
const ACCEPTANCE = "docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md";
const AUDIT = "docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md";

function ids(text: string, prefix: string): string[] {
  return [...text.matchAll(new RegExp(`\\b${prefix}-(\\d{3})\\b`, "g"))].map((match) => match[1]);
}

describe("AI Vision Design HARNESS requirements binding", () => {
  it("binds the independently re-audited package and rejects the stale same-name intake", () => {
    const design = readFileSync(DESIGN, "utf8");
    const audit = readFileSync(AUDIT, "utf8");
    expect(design).toContain("1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd");
    expect(design).toContain("211 physical files");
    expect(design).toContain("04e9c88a9214e77654787b9e1301eb35bc69a2f264d179d14211e849c58aca61");
    expect(audit).toContain("superseded扱い");
  });

  it("keeps 18 FR and paired AC exactly closed", () => {
    const design = readFileSync(DESIGN, "utf8");
    const acceptance = readFileSync(ACCEPTANCE, "utf8");
    const expected = Array.from({ length: 18 }, (_, index) => String(index + 1).padStart(3, "0"));
    expect([...new Set(ids(design, "VDH-FR"))]).toEqual(expected);
    expect([...new Set(ids(design, "VDH-AC"))]).toEqual(expected);
    expect([...new Set(ids(acceptance, "VDH-AC"))]).toEqual(expected);
    expect(design).toContain(`pair_artifact: ${ACCEPTANCE}`);
    expect(acceptance).toContain(`pair_artifact: ${DESIGN}`);
  });

  it("places the three-contract continuity across L1-L12 and the six V pairs", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const design = readFileSync(DESIGN, "utf8");
    for (let layer = 1; layer <= 12; layer += 1) expect(design).toContain(`| L${layer} |`);
    expect(requirements).toContain("Experience Contract");
    expect(requirements).toContain("UI Contract");
    expect(requirements).toContain("Frontend Contract");
    expect(design).toContain("six_V_pairs_current");
  });

  it("binds Full V and Scrum Reverse without adding a design-only layer", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const design = readFileSync(DESIGN, "utf8");
    expect(requirements).toContain("Full VではL1のproduct visionからL12");
    expect(requirements).toContain("SR4 pair-freeze");
    expect(design).toContain("新gateを作らず現行layer gateへ配置");
    expect(design).toContain("独立文書体系・独立engine・別authoring DBを作らない");
  });

  it("separates implementation evidence from UX verification and human authority", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const acceptance = readFileSync(ACCEPTANCE, "utf8");
    expect(requirements).toContain("`implemented`はL6↔L7 receipt");
    expect(requirements).toContain("`ux_verified`はL10〜L12");
    expect(acceptance).toContain("implemented=true, ux_verified=false");
    expect(acceptance).toContain("AI自己承認fixtureを全て拒否");
  });

  it("remaps legacy layers and runtime authority instead of copying them", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const design = readFileSync(DESIGN, "utf8");
    expect(requirements).toContain("旧L6 missionはL5 test contract");
    expect(requirements).toContain("Python意味workerはproposal-only");
    expect(design).toContain("Hybrid Python単独正本、既存Python path維持");
    expect(design).toContain("reject");
  });
});
