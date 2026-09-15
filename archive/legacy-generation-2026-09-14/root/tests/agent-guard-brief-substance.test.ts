import { describe, expect, it } from "vitest";
import {
  type AgentGuardContext,
  evaluateAgentGuard,
  thinBriefMarkers,
} from "../src/runtime/agent-guard";
import { BRIEF_MARKER_MIN_SUBSTANCE_CHARS } from "../src/runtime/agent-guard-policy";

const ctx: AgentGuardContext = {
  allowRaw: false,
  resolveAgentFamily: (subagentType) => (subagentType === "pmo-sonnet" ? "sonnet" : "missing"),
};

const enough = "これは実質文字数の下限を確実に超える委譲本文です";

describe("thinBriefMarkers", () => {
  it("U-BRIEF-001: 【目的】直後が実質文字数下限未満なら objective を返す", () => {
    const prompt = `【目的】短い【出力形式】${enough}【ツール方針】${enough}【境界】${enough}`;

    expect(BRIEF_MARKER_MIN_SUBSTANCE_CHARS).toBe(20);
    expect(thinBriefMarkers(prompt)).toEqual(["objective"]);
  });

  it("U-BRIEF-002: 全 marker に十分な本文があれば空配列を返す", () => {
    const prompt =
      `【目的】${enough}` +
      `【出力形式】${enough}` +
      `【ツール方針】${enough}` +
      `【境界】${enough}`;

    expect(thinBriefMarkers(prompt)).toEqual([]);
  });

  it("U-BRIEF-003: marker 欠落は thin 側では報告しない", () => {
    const prompt = `【目的】${enough}【出力形式】${enough}`;

    expect(thinBriefMarkers(prompt)).toEqual([]);
  });

  it("U-BRIEF-004: thin-brief があっても evaluateAgentGuard の allow/deny は変えず advisory を返す", () => {
    const decision = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: {
          subagent_type: "pmo-sonnet",
          model: "sonnet",
          prompt:
            `【目的】短い` +
            `【出力形式】${enough}` +
            `【ツール方針】${enough}` +
            `【境界】${enough}`,
        },
      },
      ctx,
    );

    expect(decision.code).toBe(0);
    expect(decision.message).toContain("WARN");
    expect(decision.message).toContain("thin delegation-brief");
    expect(decision.message).toContain("objective");
  });

  it("U-BRIEF-005: 英語ラベルでも同じ区間判定を行う", () => {
    const prompt =
      `【objective】${enough}` +
      "【output format】short" +
      `【tool guidance】${enough}` +
      `【task boundary】${enough}`;

    expect(thinBriefMarkers(prompt)).toEqual(["output format"]);
  });
});
