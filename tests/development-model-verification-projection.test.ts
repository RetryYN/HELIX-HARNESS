import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeScrumReverse,
  type ParsedSrPlan,
  scrumReverseMessages,
} from "../src/lint/scrum-reverse";

const STYLE_EXACT = ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"];

const TEST_DESIGNS = [
  "docs/test-design/helix/hybrid-rebaseline-v0.5.0-intake-acceptance.md",
  "docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md",
  "docs/test-design/helix/L4-pillar-system-test-design.md",
] as const;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function currentVerificationSurface(path: string): string {
  const source = read(path);
  const boundary = "## Compatibility-only historical inventory（current判定入力外）";
  const index = source.indexOf(boundary);
  return index > 0 ? source.slice(0, index) : source;
}

describe("development model verification projection", () => {
  it("U-AUTH-VERIFY-001: review authority keeps the exact three production styles", () => {
    for (const path of TEST_DESIGNS) {
      const source = currentVerificationSurface(path);
      for (const style of STYLE_EXACT) expect(source, `${path}: ${style}`).toContain(style);
      expect(source, `${path}: case axis`).toContain("case-driven");
      expect(source, `${path}: PoC polarity`).toContain("Scrum非内包");
    }
  });

  it("U-AUTH-VERIFY-002: current right-arm test designs use only L1-L12 pairs", () => {
    const authority = read("docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md");
    for (const [left, right] of [
      ["L1", "L12"],
      ["L2", "L11"],
      ["L3", "L10"],
      ["L4", "L9"],
      ["L5", "L8"],
      ["L6", "L7"],
    ] as const) {
      expect(authority, `current pair: ${left}↔${right}`).toMatch(
        new RegExp(`\\| ${left} \\|[^\\n]+⇔ ${right}(?: | \\|)`),
      );
    }
    for (const path of TEST_DESIGNS) {
      const testDesign = currentVerificationSurface(path);
      expect(testDesign).not.toMatch(/L1↔L14|L2↔L13|L3↔L12|L4↔L11|L5↔L10|L6↔L9|L7↔L8/);
      expect(testDesign).not.toMatch(/L0\s*[-–—〜~]\s*L14/);
    }
  });

  it("U-AUTH-VERIFY-003: current verification commands do not execute Bun", () => {
    for (const path of TEST_DESIGNS) {
      expect(currentVerificationSurface(path), `${path}: active Bun command inventory`).not.toMatch(
        /`?\b(?:bunx|bun\s+(?:run|test|x|install|audit|add|build|pm))\b/i,
      );
    }
  });

  it("U-AUTH-VERIFY-004: Design HARNESS oracle rejects legacy route output", () => {
    const source = read("docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md");
    expect(source).toContain("V_DESIGN_SCRUM_IMPLEMENTATION");
    expect(source).toContain("Discovery／PoCはScrum非内包の別軸case-driven model");
    expect(source).not.toContain("`DISCOVERY_POC`をproduction style");
  });

  it("U-AUTH-VERIFY-005: case result reentry is not a Scrum completion rule", () => {
    const poc: ParsedSrPlan = {
      file: "PLAN-DISCOVERY-TEST.md",
      plan_id: "PLAN-DISCOVERY-TEST",
      kind: "poc",
      status: "confirmed",
      decision_outcome: "confirmed",
      promotion_strategy: "reuse-with-hardening",
      links: [],
      generates: [],
      created: "2026-08-01",
    };
    const result = analyzeScrumReverse([poc]);
    expect(result.pocOrphans).toEqual([
      { plan_id: "PLAN-DISCOVERY-TEST", promotion_strategy: "reuse-with-hardening" },
    ]);
    expect(
      scrumReverseMessages(result).some(
        (message) =>
          message.includes("confirmed case-driven poc") &&
          message.includes("Reverse specialist reentry が無い") &&
          message.includes("PLAN-DISCOVERY-TEST"),
      ),
    ).toBe(true);
  });
});
