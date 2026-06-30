import { describe, expect, it } from "vitest";
import {
  analyzeCompletionDecisionPacket,
  completionDecisionPacketMessages,
  loadCompletionDecisionPacketInput,
} from "../src/lint/completion-decision-packet";
import {
  analyzeOutstandingWork,
  type CompletionDecisionPacket,
  completionDecisionPacketForOutstanding,
} from "../src/lint/outstanding";

function basePacket(): CompletionDecisionPacket {
  return completionDecisionPacketForOutstanding(
    analyzeOutstandingWork(
      [
        {
          planId: "PLAN-S3",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    ),
    {
      generatedAt: "2026-06-30T00:00:00.000Z",
      now: "2026-06-30T00:30:00.000Z",
      validForMinutes: 60,
      sourceCommand: "ut-tdd completion decision-packet --json",
    },
  );
}

describe("completion decision packet lint", () => {
  // U-OUTSTANDING-002
  it("accepts a fresh packet with source command and matching freshness metadata", () => {
    const result = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    expect(completionDecisionPacketMessages(result)[0]).toContain(
      "completion-decision-packet - OK",
    );
  });

  it("rejects stale packets after the freshness window", () => {
    const result = analyzeCompletionDecisionPacket(basePacket(), "2026-06-30T01:00:00.001Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("stale_packet");
  });

  it("rejects missing or unknown source commands", () => {
    const packet = { ...basePacket(), sourceCommand: "copied-from-chat" };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_source_command");
  });

  it("rejects freshness metadata that does not match generatedAt/window", () => {
    const packet = {
      ...basePacket(),
      freshness: {
        ...basePacket().freshness,
        expiresAt: "2026-06-30T03:00:00.000Z",
      },
    };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("invalid_expires_at");
  });

  it("rejects decisionCount drift from the decisions array", () => {
    const packet = { ...basePacket(), decisionCount: 99 };
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T00:30:00.000Z");

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain("decision_count_mismatch");
  });

  // U-OUTSTANDING-003
  it("loads the current repo packet as fresh doctor input", () => {
    const packet = loadCompletionDecisionPacketInput(process.cwd(), "2026-06-30T03:00:00.000Z");
    const result = analyzeCompletionDecisionPacket(packet, "2026-06-30T03:00:00.000Z");

    expect(result.ok).toBe(true);
    expect(result.sourceCommand).toBe("ut-tdd completion decision-packet --json");
    expect(result.validForMinutes).toBe(1440);
  });
});
