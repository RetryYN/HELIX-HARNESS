import { describe, expect, it } from "vitest";
import type { L1L2ConsistencyInput } from "../src/lint/l1-l2-consistency";
import {
  buildL1L2GapCheckPacket,
  L1_L2_GAP_CHECK_MAX_ROUNDS,
  L1_L2_GAP_CHECK_SCHEMA_VERSION,
  l1L2GapCheckMessages,
} from "../src/lint/l1-l2-gap-check";

function baseInput(overrides: Partial<L1L2ConsistencyInput> = {}): L1L2ConsistencyInput {
  return {
    screenDesignPresent: true,
    l1ScreenIds: ["PM-01", "PM-06"],
    screenListIds: ["PM-01", "PM-06"],
    uiElementIds: ["PM-01", "PM-06"],
    wireframeIds: ["PM-01"],
    flowReferencedIds: ["PM-01", "PM-06"],
    mockPairArtifact: "self",
    ...overrides,
  };
}

describe("buildL1L2GapCheckPacket", () => {
  it("U-L1L2-007: emits a read-only packet with the 8-viewpoint checklist and A-40 route", () => {
    const packet = buildL1L2GapCheckPacket(baseInput());
    expect(packet.schemaVersion).toBe(L1_L2_GAP_CHECK_SCHEMA_VERSION);
    expect(packet.planOnly).toBe(true);
    expect(packet.writePolicy).toBe("no-write");
    expect(packet.mustNotMutate).toBe(true);
    expect(packet.viewpoints).toHaveLength(8);
    expect(packet.maxRounds).toBe(L1_L2_GAP_CHECK_MAX_ROUNDS);
    expect(packet.authorityBoundary).toContain("read-only gap-check");
    expect(packet.a40Route).toContain("A-40");
    expect(packet.completionClaimAllowed).toBe(false);
  });

  it("U-L1L2-008: maps structural consistency violations to read-only gap candidates", () => {
    const packet = buildL1L2GapCheckPacket(
      baseInput({
        screenListIds: ["PM-01"],
        uiElementIds: ["PM-01"],
        flowReferencedIds: ["PM-01", "PM-99"],
      }),
    );
    expect(packet.consistency.ok).toBe(false);
    expect(packet.gapCandidates.map((candidate) => candidate.code)).toEqual([
      "missing-l2-screen:PM-06",
      "dangling-flow-screen:PM-99",
    ]);
    expect(new Set(packet.gapCandidates.map((candidate) => candidate.route))).toEqual(
      new Set(["a40_change_log"]),
    );
  });

  it("U-L1L2-010: emits text-mode messages with boundary and A-40 route", () => {
    const messages = l1L2GapCheckMessages(buildL1L2GapCheckPacket(baseInput()));
    expect(messages[0]).toContain("l1-l2 gap-check - OK");
    expect(messages[1]).toContain("authority-boundary");
    expect(messages[2]).toContain("a40-route");
  });
});
