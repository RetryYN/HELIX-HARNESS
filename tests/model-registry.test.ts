import { describe, expect, it } from "vitest";
import {
  CLAUDE_PRICING,
  EXACT_MODEL_STANDARD_EFFORT,
  FAMILY_STANDARD_EFFORT,
  MODEL_IDS,
  OPENAI_PRICING,
  parseModelRegistry,
} from "../src/schema/model-registry";
import { CLAUDE_PRICING as PRICING_VIA_TRACKER } from "../src/state-db/token-tracker";
import { FAMILY_STANDARD_EFFORT as EFFORT_VIA_MODEL_EFFORT } from "../src/team/model-effort";
import { MODEL_IDS as MODEL_IDS_VIA_POLICY } from "../src/team/model-policy";

// PLAN-L7-638-xhigh-reasoning-effort-schema / U-XHIGH-003
// PLAN-L7-639-luna-worker-model-registry / U-LUNA-001

/** 有効な最小 registry (fail-closed テストのベース: これを 1 箇所ずつ壊す)。 */
function validRegistry() {
  return {
    modelIds: {
      claude: {
        opus: "claude-opus-5",
        sonnet: "claude-sonnet-5",
        haiku: "claude-haiku-4-5",
        fable: "claude-fable-5",
      },
      codex: {
        frontier: "gpt-5.6-sol",
        worker: "gpt-5.6-luna",
        spark: "gpt-5.3-codex-spark",
        mini: "gpt-5.4-mini",
        codex: "gpt-5.3-codex",
      },
    },
    claudePricing: { "claude-opus-5": { input: 5, output: 25 } },
    openaiPricing: { "gpt-5.6-sol": { input: 5, cached: 0.5, output: 30 } },
    familyStandardEffort: { opus: "medium" },
    exactModelStandardEffort: { "claude-sonnet-5": "medium" },
  };
}

describe("U-MREG: model registry 外部化 loader (PLAN-L7-464)", () => {
  it("U-MREG-001: config 正本が読み込まれ opus=opus-5 / opus 標準 effort=medium / opus-5 単価が取れる", () => {
    expect(MODEL_IDS.claude.opus).toBe("claude-opus-5");
    expect(MODEL_IDS.claude.fable).toBe("claude-fable-5");
    expect(MODEL_IDS.codex.frontier).toBe("gpt-5.6-sol");
    expect(MODEL_IDS.codex.worker).toBe("gpt-5.6-luna");
    expect(FAMILY_STANDARD_EFFORT.opus).toBe("medium");
    expect(FAMILY_STANDARD_EFFORT.fable).toBe("high");
    expect(EXACT_MODEL_STANDARD_EFFORT["claude-sonnet-5"]).toBe("medium");
    expect(CLAUDE_PRICING["claude-opus-5"]).toEqual({ input: 5, output: 25 });
    // 歴史 usage 計算のため旧 opus 単価も残置。
    expect(CLAUDE_PRICING["claude-opus-4-8"]).toEqual({ input: 5, output: 25 });
    expect(OPENAI_PRICING["gpt-5.3-codex"]).toEqual({ input: 1.75, cached: 0.175, output: 14 });
    expect(OPENAI_PRICING["gpt-5.6-luna"]).toEqual({ input: 0.2, cached: 0.02, output: 1.2 });
    // cached=null (pro) は許容。
    expect(OPENAI_PRICING["gpt-5.5-pro"]?.cached).toBeNull();
  });

  it("U-MREG-002: re-export 経路 (model-policy/model-effort/token-tracker) が registry 正本と同一参照", () => {
    expect(MODEL_IDS_VIA_POLICY).toBe(MODEL_IDS);
    expect(EFFORT_VIA_MODEL_EFFORT).toBe(FAMILY_STANDARD_EFFORT);
    expect(PRICING_VIA_TRACKER).toBe(CLAUDE_PRICING);
  });

  it("U-LUNA-001: current worker identity・price・standard effortをLunaへ束縛する", () => {
    expect(MODEL_IDS.codex.worker).toBe("gpt-5.6-luna");
    expect(OPENAI_PRICING[MODEL_IDS.codex.worker]).toEqual({
      input: 0.2,
      cached: 0.02,
      output: 1.2,
    });
    expect(EXACT_MODEL_STANDARD_EFFORT[MODEL_IDS.codex.worker]).toBe("xhigh");
    expect(OPENAI_PRICING["gpt-5.6-terra"]).toEqual({ input: 2.5, cached: 0.25, output: 15 });
  });

  it("U-MREG-003: parseModelRegistry は正常 registry を検証して返す", () => {
    const parsed = parseModelRegistry(validRegistry());
    expect(parsed.modelIds.claude.opus).toBe("claude-opus-5");
    expect(parsed.familyStandardEffort.opus).toBe("medium");
  });

  it("U-MREG-004: 破損 registry は fail-closed で throw する (silent 受理しない)", () => {
    expect(() => parseModelRegistry(null)).toThrow(/model-registry/);
    expect(() => parseModelRegistry({})).toThrow(/modelIds/);
    // section 欠落
    const noPricing = validRegistry() as Record<string, unknown>;
    delete noPricing.claudePricing;
    expect(() => parseModelRegistry(noPricing)).toThrow(/claudePricing/);
    // effort 値が enum 外
    const badEffort = validRegistry();
    (badEffort.familyStandardEffort as Record<string, string>).opus = "extreme";
    expect(() => parseModelRegistry(badEffort)).toThrow(/low\|medium\|high\|xhigh/);

    // 単価が数値でない
    const badPrice = validRegistry();
    (badPrice.claudePricing["claude-opus-5"] as Record<string, unknown>).input = "5";
    expect(() => parseModelRegistry(badPrice)).toThrow(/input/);
    // model id が空
    const emptyId = validRegistry();
    emptyId.modelIds.claude.opus = "";
    expect(() => parseModelRegistry(emptyId)).toThrow(/modelIds\.claude\.opus/);
    // 空セクション
    const emptyEffort = validRegistry() as Record<string, unknown>;
    emptyEffort.familyStandardEffort = {};
    expect(() => parseModelRegistry(emptyEffort)).toThrow(/must not be empty/);
    // cached が null でも数値でもない
    const badCached = validRegistry();
    (badCached.openaiPricing["gpt-5.6-sol"] as Record<string, unknown>).cached = "cheap";
    expect(() => parseModelRegistry(badCached)).toThrow(/cached/);
  });

  it("U-XHIGH-003: registry validatorはxhighをcurrent exact valueとして受理する", () => {
    const xhighEffort = validRegistry();
    xhighEffort.exactModelStandardEffort["claude-sonnet-5"] = "xhigh";
    expect(parseModelRegistry(xhighEffort).exactModelStandardEffort["claude-sonnet-5"]).toBe(
      "xhigh",
    );
  });
});
