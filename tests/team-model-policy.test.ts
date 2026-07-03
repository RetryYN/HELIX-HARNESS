import { describe, expect, it } from "vitest";
import { inferTaskDifficulty, selectTeamModel } from "../src/team/model-policy";

describe("team model policy", () => {
  it("infers critical difficulty from high-risk task terms", () => {
    expect(inferTaskDifficulty({ task: "DB schema migration for production auth" })).toEqual({
      difficulty: "critical",
      source: "inferred",
    });
  });

  it("uses fast codex model and low effort for trivial work", () => {
    const selection = selectTeamModel({
      provider: "codex",
      role: "docs",
      engine: "codex-pg",
      task: "README typo",
    });

    expect(selection).toMatchObject({
      difficulty: "trivial",
      model_family: "fast",
      model: "gpt-5.3-codex-spark",
      reasoning_effort: "low",
    });
  });

  it("uses frontier model and high effort for critical codex work", () => {
    const selection = selectTeamModel({
      provider: "codex",
      role: "tl",
      engine: "codex-tl",
      task: "production security migration",
    });

    expect(selection).toMatchObject({
      difficulty: "critical",
      model_family: "frontier",
      // frontier = T0 最上位。tier-router TIER_TABLE.T0.codex (gpt-5.5) と整合 (PLAN-L7-75 reconcile)。
      model: "gpt-5.5",
      reasoning_effort: "high",
    });
  });

  it("keeps explicit Claude engine family instead of escalating pmo-sonnet to opus", () => {
    const selection = selectTeamModel({
      provider: "claude",
      role: "tl",
      engine: "pmo-sonnet",
      task: "production security migration",
    });

    expect(selection.model_family).toBe("frontier");
    expect(selection.model).toBe("claude-sonnet-5");
    expect(selection.model_source).toBe("engine");
    // effort は選定 model の標準 (PLAN-L7-310/311): engine-pin された claude-sonnet-5 の標準は medium。
    // family=frontier でも実 model が sonnet なら medium で投げ、浅い回答を観測したら high へ 1 段上げる
    // (旧 task-based 一律 high から是正)。
    expect(selection.reasoning_effort).toBe("medium");
    expect(selection.effort_source).toBe("standard");
  });

  it("U-EFFORT-WIRE: runtime 観測で標準 effort を 1 段適応する (shallow→上げ / too-slow→下げ)", () => {
    // 既定 (観測なし) = sonnet-5 標準 medium。
    const base = selectTeamModel({
      provider: "claude",
      role: "tl",
      engine: "pmo-sonnet",
      task: "review slice",
    });
    expect(base.reasoning_effort).toBe("medium");
    expect(base.effort_source).toBe("standard");

    // shallow 観測 → medium から high へ 1 段。
    const shallow = selectTeamModel({
      provider: "claude",
      role: "tl",
      engine: "pmo-sonnet",
      task: "review slice",
      observation: { shallow: true },
    });
    expect(shallow.reasoning_effort).toBe("high");
    expect(shallow.effort_source).toBe("adaptive");

    // too-slow 観測 → medium から low へ 1 段。
    const slow = selectTeamModel({
      provider: "claude",
      role: "tl",
      engine: "pmo-sonnet",
      task: "review slice",
      observation: { tooSlow: true },
    });
    expect(slow.reasoning_effort).toBe("low");
    expect(slow.effort_source).toBe("adaptive");

    // 明示 effort override は観測より優先。
    const explicit = selectTeamModel({
      provider: "claude",
      role: "tl",
      engine: "pmo-sonnet",
      task: "review slice",
      effort: "high",
      observation: { tooSlow: true },
    });
    expect(explicit.reasoning_effort).toBe("high");
    expect(explicit.effort_source).toBe("explicit");
  });

  it("honors explicit difficulty, model, and effort overrides", () => {
    const selection = selectTeamModel({
      provider: "codex",
      role: "se",
      engine: "codex-se",
      task: "implement",
      difficulty: "simple",
      model: "gpt-custom",
      effort: "high",
    });

    expect(selection).toMatchObject({
      difficulty: "simple",
      difficulty_source: "explicit",
      model: "gpt-custom",
      model_source: "explicit",
      reasoning_effort: "high",
      effort_source: "explicit",
    });
  });
});
