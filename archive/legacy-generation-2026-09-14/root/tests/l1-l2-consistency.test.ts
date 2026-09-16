import { describe, expect, it } from "vitest";
import {
  analyzeL1L2Consistency,
  type L1L2ConsistencyInput,
  l1L2ConsistencyMessages,
  loadL1L2ConsistencyInput,
} from "../src/lint/l1-l2-consistency";

function baseInput(overrides: Partial<L1L2ConsistencyInput> = {}): L1L2ConsistencyInput {
  return {
    screenDesignPresent: true,
    l1ScreenIds: ["PM-01", "PM-06", "HM-01"],
    screenListIds: ["PM-01", "PM-06", "HM-01"],
    uiElementIds: ["PM-01", "PM-06", "HM-01"],
    wireframeIds: ["PM-01", "PM-06", "HM-01"],
    flowReferencedIds: ["PM-01", "PM-06"],
    mockPairArtifact: "self",
    ...overrides,
  };
}

describe("analyzeL1L2Consistency", () => {
  it("U-L1L2-001: accepts fully bidirectional L1/L2 coverage with IMP-039 self pair", () => {
    const result = analyzeL1L2Consistency(baseInput());
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.checked).toBe(3);
    expect(result.selfPairSatisfied).toBe(true);
  });

  it("U-L1L2-002: rejects one-sided screens in both directions (fail-close)", () => {
    const result = analyzeL1L2Consistency(
      baseInput({
        l1ScreenIds: ["PM-01", "PM-06", "HM-01", "PM-99"],
        screenListIds: ["PM-01", "PM-06", "HM-01", "HM-99"],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations).toContain("missing-l2-screen:PM-99");
    expect(result.violations).toContain("missing-l1-requirement:HM-99");
  });

  it("U-L1L2-003: rejects missing ui-element row and dangling wireframe/flow references", () => {
    const result = analyzeL1L2Consistency(
      baseInput({
        uiElementIds: ["PM-01", "HM-01"],
        wireframeIds: ["PM-01", "PM-06", "GD-98"],
        flowReferencedIds: ["PM-01", "GD-99"],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations).toContain("missing-ui-element:PM-06");
    expect(result.violations).toContain("dangling-wireframe-screen:GD-98");
    expect(result.violations).toContain("dangling-flow-screen:GD-99");
    // G2 PASS 済み設計 (主要画面のみ Low-Fi) への false-positive を出さない:
    // wireframe セクションが無い画面 (HM-01) は violation にならない。
    expect(result.violations.join(" ")).not.toContain("HM-01");
  });

  it("U-L1L2-004: requires a declared mock pair but treats IMP-039 self pair as satisfied", () => {
    const missingPair = analyzeL1L2Consistency(baseInput({ mockPairArtifact: null }));
    expect(missingPair.ok).toBe(false);
    expect(missingPair.violations).toContain("missing-mock-pair");

    const selfPair = analyzeL1L2Consistency(baseInput({ mockPairArtifact: "self" }));
    expect(selfPair.ok).toBe(true);
    expect(selfPair.selfPairSatisfied).toBe(true);

    const absentDesign = analyzeL1L2Consistency(
      baseInput({
        screenDesignPresent: false,
        l1ScreenIds: [],
        screenListIds: [],
        uiElementIds: [],
        wireframeIds: [],
        flowReferencedIds: [],
        mockPairArtifact: null,
      }),
    );
    expect(absentDesign.ok).toBe(true);
    expect(absentDesign.checked).toBe(0);
  });

  it("U-L1L2-005: current repo keeps 15 screens bidirectionally covered (live oracle)", () => {
    const input = loadL1L2ConsistencyInput();
    const result = analyzeL1L2Consistency(input);
    expect(input.screenDesignPresent).toBe(true);
    expect(result.checked).toBe(15);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });
});

describe("l1L2ConsistencyMessages", () => {
  it("U-L1L2-006: emits ASCII decision tokens for OK and violation states", () => {
    const okMessages = l1L2ConsistencyMessages(analyzeL1L2Consistency(baseInput()));
    expect(okMessages[0]).toContain("l1-l2-consistency - OK");

    const badMessages = l1L2ConsistencyMessages(
      analyzeL1L2Consistency(baseInput({ screenListIds: ["PM-01"] })),
    );
    expect(badMessages[0]).toContain("l1-l2-consistency - violation");
  });
});
