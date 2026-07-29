import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const PATHS = {
  plan: "docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md",
  requirements: "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
  acceptance: "docs/test-design/helix/L1-infinity-loop-operational-test-design.md",
  functional: "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
  system: "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
  definition: "docs/governance/infinity-loop-requirement-definition-ledger.md",
  coverage: "docs/governance/infinity-loop-requirement-coverage-ledger.md",
  assertions: "docs/governance/infinity-loop-assertion-coverage-ledger.md",
} as const;

type Metadata = Record<string, unknown>;

function text(path: string): string {
  return readFileSync(path, "utf8");
}

function metadata(path: string): Metadata {
  const source = text(path);
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match?.[1]) {
    throw new Error(`frontmatter missing: ${path}`);
  }
  return parse(match[1]) as Metadata;
}

function exactIds(source: string, pattern: RegExp): string[] {
  return [...new Set(source.match(pattern) ?? [])].sort();
}

function numbered(prefix: string, first: number, last: number, width: number): string[] {
  return Array.from(
    { length: last - first + 1 },
    (_, index) => `${prefix}-${String(first + index).padStart(width, "0")}`,
  );
}

function assertPair(
  actual: Metadata,
  layer: string,
  pair: string,
  legacyPhysicalLayer: string,
): void {
  expect(actual.canonical_vmodel).toBe("L1-L12");
  expect(actual.canonical_layer).toBe(layer);
  expect(actual.layer).toBe(layer);
  expect(actual.canonical_pair).toBe(pair);
  expect(actual.legacy_physical_layer).toBe(legacyPhysicalLayer);
}

function section(textValue: string, current: number, next: number): string {
  const startMarker = `## §${current} `;
  const endMarker = `## §${next} `;
  const afterStart = textValue.split(startMarker)[1];
  if (afterStart === undefined) throw new Error(`section missing: ${startMarker}`);
  const beforeEnd = afterStart.split(endMarker)[0];
  if (beforeEnd === undefined) throw new Error(`section missing: ${endMarker}`);
  return beforeEnd;
}

describe("Infinity Loop current authority metadata", () => {
  it("binds the compatibility PLAN and physical paths to current L2↔L11 and L3↔L10", () => {
    const plan = metadata(PATHS.plan);
    expect(plan.layer).toBe("L2");
    expect(plan.canonical_layer).toBe("L2");
    expect(plan.canonical_pair).toBe("L11");
    expect(plan.next_pair_freeze).toBe("L11");
    expect(plan.legacy_physical_layer).toBe("L1");

    assertPair(metadata(PATHS.requirements), "L2", "L11", "L1");
    assertPair(metadata(PATHS.acceptance), "L11", "L2", "L1");
    expect(metadata(PATHS.acceptance).legacy_vmodel_layer).toBe("L14");

    assertPair(metadata(PATHS.functional), "L3", "L10", "L3");
    assertPair(metadata(PATHS.system), "L10", "L3", "L3");
    expect(metadata(PATHS.system).legacy_executed_at_layer).toBe("L12");
  });

  it("rejects old layers when they are restored to an active metadata field", () => {
    expect(() =>
      assertPair(
        { ...metadata(PATHS.requirements), layer: "L1" },
        "L2",
        "L11",
        "L1",
      ),
    ).toThrow();
    expect(() =>
      assertPair(
        { ...metadata(PATHS.acceptance), canonical_layer: "L14" },
        "L11",
        "L2",
        "L1",
      ),
    ).toThrow();
    expect(() =>
      assertPair(
        { ...metadata(PATHS.system), canonical_pair: "L12" },
        "L10",
        "L3",
        "L3",
      ),
    ).toThrow();
  });

  it("keeps the exact requirement, assertion, acceptance, and system denominators", () => {
    const requirements = text(PATHS.requirements);
    const assertions = text(PATHS.assertions);

    for (const [category, last] of [
      ["BR", 33],
      ["FR", 69],
      ["TR", 11],
      ["NFR", 40],
    ] as const) {
      expect(exactIds(requirements, new RegExp(`HIL-${category}-\\d{2}`, "g"))).toEqual(
        numbered(`HIL-${category}`, 1, last, 2),
      );
      expect(exactIds(assertions, new RegExp(`HIA-${category}-\\d{3}`, "g"))).toEqual(
        numbered(`HIA-${category}`, 1, last, 3),
      );
    }

    expect(
      exactIds(text(PATHS.acceptance), /HOT-HIL-\d{2}/g),
    ).toEqual(numbered("HOT-HIL", 1, 57, 2));
    const functional = text(PATHS.functional);
    expect(exactIds(functional, /HR-FR-HIL-\d{2}/g)).toEqual(
      numbered("HR-FR-HIL", 1, 24, 2),
    );
    expect(exactIds(functional, /HAC-HIL-\d{2}[abc]/g)).toEqual(
      numbered("HAC-HIL", 1, 24, 2).flatMap((id) => [
        `${id}a`,
        `${id}b`,
        `${id}c`,
      ]),
    );
    expect(
      exactIds(text(PATHS.system), /HAT-HIL-\d{2}/g),
    ).toEqual(numbered("HAT-HIL", 1, 24, 2));

    for (const requirementEngineId of [
      "HIL-BR-22",
      "HIL-BR-23",
      "HIL-BR-24",
      "HIL-FR-41",
      "HIL-FR-42",
      "HIL-FR-43",
      "HIL-FR-44",
      "HIL-FR-45",
      "HR-FR-HIL-17",
      "HAC-HIL-17a",
      "HAC-HIL-17b",
      "HAC-HIL-17c",
    ]) {
      expect(`${requirements}\n${functional}`).toContain(requirementEngineId);
    }
  });

  it("removes stale current-scope claims while preserving explicit compatibility identity", () => {
    const plan = text(PATHS.plan);
    expect(plan).not.toMatch(
      /(?:^|\n)layer: L1\n|next_pair_freeze: L14|L0[–-]L14|L1\/L14 pair|全115 HIL|115 stable ID/,
    );

    const coverage = text(PATHS.coverage);
    expect(coverage).toContain("L2要求正本（物理pathはcompatibility L1）");
    expect(coverage).toContain("## §1 業務要求（33/33採番）");
    expect(coverage).toContain("## §2 機能要求（69/69採番）");
    expect(coverage).toContain("## §3 技術要求（11/11採番）");
    expect(coverage).toContain("## §4 非機能要求（40/40採番）");

    const assertions = text(PATHS.assertions);
    for (const [category, currentSection, last] of [
      ["BR", 1, 33],
      ["FR", 2, 69],
      ["TR", 3, 11],
      ["NFR", 4, 40],
    ] as const) {
      const coverageSection = section(coverage, currentSection, currentSection + 1);
      const assertionSection = section(assertions, currentSection, currentSection + 1);
      expect(exactIds(coverageSection, /HIL-(?:BR|FR|TR|NFR)-\d{2}/g)).toEqual(
        numbered(`HIL-${category}`, 1, last, 2),
      );
      expect(exactIds(assertionSection, /HIL-(?:BR|FR|TR|NFR)-\d{2}/g)).toEqual(
        numbered(`HIL-${category}`, 1, last, 2),
      );
    }

    const assertionCoverage = assertions;
    expect(assertionCoverage).toContain("153件のHIL要求");
    expect(assertionCoverage).toContain(
      "L2要求正本（物理pathはcompatibility L1）の現在集合",
    );
    expect(assertionCoverage).not.toContain("115件のHIL");

    expect(text(PATHS.definition)).toContain(
      "L2要求正本（物理pathはcompatibility L1）",
    );
  });
});
