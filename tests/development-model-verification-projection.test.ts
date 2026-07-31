import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const STYLE_EXACT = ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"];

const TEST_DESIGNS = [
  "docs/test-design/helix/hybrid-rebaseline-v0.5.0-intake-acceptance.md",
  "docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md",
  "docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md",
  "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
  "docs/test-design/helix/L4-pillar-system-test-design.md",
  "docs/test-design/harness/L1-operational-test-design.md",
  "docs/test-design/harness/L3-acceptance-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
] as const;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function currentAuthority(path: string): string {
  const source = read(path);
  const boundary = "## Compatibility-only historical inventory（current判定入力外）";
  const index = source.indexOf(boundary);
  expect(index, `${path}: compatibility boundary`).toBeGreaterThan(0);
  return source.slice(0, index);
}

describe("development model verification projection", () => {
  it("U-AUTH-VERIFY-001: review authority keeps the exact three production styles", () => {
    for (const path of TEST_DESIGNS.slice(0, 5)) {
      const source = read(path);
      for (const style of STYLE_EXACT) expect(source, `${path}: ${style}`).toContain(style);
      expect(source, `${path}: case axis`).toContain("case-driven");
      expect(source, `${path}: PoC polarity`).toContain("Scrum非内包");
    }
  });

  it("U-AUTH-VERIFY-002: current right-arm test designs use only L1-L12 pairs", () => {
    const l1 = currentAuthority("docs/test-design/harness/L1-operational-test-design.md");
    const l3 = currentAuthority("docs/test-design/harness/L3-acceptance-test-design.md");
    const l7 = currentAuthority("docs/test-design/harness/L7-unit-test-design.md");
    expect(l1).toContain("L1↔L12");
    expect(l3).toContain("L3↔L10");
    expect(l7).toContain("L6↔L7");
    for (const [path, source] of [
      ["L1 operational", l1],
      ["L3 acceptance", l3],
      ["L7 unit", l7],
    ] as const) {
      expect(source, `${path}: compatibility boundary`).toContain(
        "旧layer／旧command記述はcompatibility-only",
      );
      expect(source, `${path}: executable contract`).toContain(
        "### Current executable verification contract",
      );
      expect(source, `${path}: old canonical pairs`).not.toMatch(/L1↔L14|L2↔L13|L3↔L12/);
      expect(source, `${path}: old layer range`).not.toContain("L0-L14");
    }
  });

  it("U-AUTH-VERIFY-003: current verification commands do not execute Bun", () => {
    for (const path of TEST_DESIGNS.slice(5)) {
      const source = currentAuthority(path);
      expect(source, `${path}: Node/npm authority`).toContain("Current command authority: Node/npm");
      expect(source, `${path}: Bun compatibility isolation`).toContain(
        "Bun文字列はhistorical fixtureのcompatibility-only入力",
      );
      expect(source, `${path}: active Bun command`).not.toMatch(/`?bun\s+(?:run|test|x|install|audit)\b/);
    }
  });

  it("U-AUTH-VERIFY-004: Design HARNESS oracle rejects legacy route output", () => {
    const source = read("tests/ai-vision-design-harness-requirements-binding.test.ts");
    expect(source).toContain("V_DESIGN_SCRUM_IMPLEMENTATION");
    expect(source).not.toContain('toContain("`DISCOVERY_POC`")');
  });

  it("U-AUTH-VERIFY-005: case result reentry is not a Scrum completion rule", () => {
    const source = read("src/lint/scrum-reverse.ts");
    expect(source).toContain("case-driven");
    expect(source).toContain("specialist reentry");
    expect(source).not.toContain("PoC (Discovery/Scrum)");
  });
});
