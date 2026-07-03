import { describe, expect, it } from "vitest";
import {
  adaptReasoningEffort,
  EXACT_MODEL_STANDARD_EFFORT,
  normalizeEffortFamily,
  resolveAdaptiveEffort,
  standardEffortForModel,
} from "../src/team/model-effort";
import { MODEL_IDS } from "../src/team/model-policy";

describe("U-EFFORT: model 標準 effort + 適応ルール (PLAN-L7-310)", () => {
  it("U-EFFORT-001: sonnet-5 の標準 effort は medium、sonnet-4-6 は high (世代差)", () => {
    expect(standardEffortForModel("claude-sonnet-5")).toBe("medium");
    expect(standardEffortForModel("claude-sonnet-4-6")).toBe("high");
    expect(standardEffortForModel(MODEL_IDS.claude.sonnet)).toBe("medium");
  });

  it("U-EFFORT-002: family 既定 — opus/fable=high, haiku=low, worker=medium, spark=low", () => {
    expect(standardEffortForModel(MODEL_IDS.claude.opus)).toBe("high");
    expect(standardEffortForModel(MODEL_IDS.claude.fable)).toBe("high");
    expect(standardEffortForModel(MODEL_IDS.claude.haiku)).toBe("low");
    expect(standardEffortForModel(MODEL_IDS.codex.frontier)).toBe("high");
    expect(standardEffortForModel(MODEL_IDS.codex.worker)).toBe("medium");
    expect(standardEffortForModel(MODEL_IDS.codex.spark)).toBe("low");
  });

  it("U-EFFORT-003: 未知 model は安全側の medium、曖昧 family は解決しない", () => {
    expect(standardEffortForModel("some-unknown-model")).toBe("medium");
    expect(standardEffortForModel(null)).toBe("medium");
    expect(normalizeEffortFamily("opus-sonnet-mix")).toBeNull();
  });

  it("U-EFFORT-004: 適応ルール — shallow は一段上げ、too-slow は一段下げ、境界は据え置き", () => {
    expect(adaptReasoningEffort("medium", { shallow: true })).toBe("high");
    expect(adaptReasoningEffort("low", { shallow: true })).toBe("medium");
    expect(adaptReasoningEffort("high", { shallow: true })).toBe("high"); // 上限
    expect(adaptReasoningEffort("medium", { tooSlow: true })).toBe("low");
    expect(adaptReasoningEffort("high", { tooSlow: true })).toBe("medium");
    expect(adaptReasoningEffort("low", { tooSlow: true })).toBe("low"); // 下限
  });

  it("U-EFFORT-005: 矛盾 (shallow かつ too-slow) / 無信号は現状維持", () => {
    expect(adaptReasoningEffort("medium", { shallow: true, tooSlow: true })).toBe("medium");
    expect(adaptReasoningEffort("medium", {})).toBe("medium");
  });

  it("U-EFFORT-006: resolveAdaptiveEffort — 標準起点で観測を1段適応 (既定は標準そのまま)", () => {
    expect(resolveAdaptiveEffort("claude-sonnet-5")).toBe("medium"); // 既定=標準
    expect(resolveAdaptiveEffort("claude-sonnet-5", { shallow: true })).toBe("high");
    expect(resolveAdaptiveEffort("claude-sonnet-5", { tooSlow: true })).toBe("low");
    expect(resolveAdaptiveEffort(MODEL_IDS.claude.opus, { tooSlow: true })).toBe("medium");
  });

  it("U-EFFORT-007: EXACT_MODEL_STANDARD_EFFORT は MODEL_IDS の sonnet 現行値を含む (drift 防止)", () => {
    expect(EXACT_MODEL_STANDARD_EFFORT[MODEL_IDS.claude.sonnet]).toBe("medium");
    expect(EXACT_MODEL_STANDARD_EFFORT[MODEL_IDS.codex.frontier]).toBe("high");
    expect(EXACT_MODEL_STANDARD_EFFORT[MODEL_IDS.codex.worker]).toBe("medium");
  });
});
