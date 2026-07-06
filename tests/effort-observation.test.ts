import { describe, expect, it } from "vitest";
import {
  deriveEffortObservation,
  SHALLOW_OUTPUT_CHARS_MIN,
  TOO_SLOW_ELAPSED_MS,
} from "../src/orchestration/loop-effort-budget";
import { buildPairAgentAdapterPlans, buildPairAgentTddPlan } from "../src/orchestration/pair-agent";
import { buildAdapterPlan } from "../src/runtime/adapter";
import { CODEX_EFFORT_CONFIG_KEY, CODEX_EFFORT_FLAG } from "../src/runtime/adapter-policy";
import type { RuntimeDetection } from "../src/runtime/detect";
import { buildTeamRunPlan } from "../src/team/run";

const hybridDetection: RuntimeDetection = {
  mode: "hybrid",
  claude: true,
  codex: true,
  currentRuntime: "codex",
  availableRuntimes: ["claude", "codex"],
  missingRuntimes: [],
};

describe("effort observation wiring (PLAN-L7-343)", () => {
  it("U-EFF-001: codex intent.effort=high が args に -c model_reasoning_effort=high として現れる", () => {
    const plan = buildAdapterPlan(
      {
        provider: "codex",
        role: "se",
        task: "implement",
        model: "gpt-5.4",
        effort: "high",
      },
      "hybrid",
    );

    expect(plan.args).toContain(CODEX_EFFORT_FLAG);
    expect(plan.args).toContain(`${CODEX_EFFORT_CONFIG_KEY}=high`);
    expect(plan.effort).toBe("high");
  });

  it("U-EFF-002: effort 未指定の codex intent には effort 関連 args が追加されない", () => {
    const plan = buildAdapterPlan(
      { provider: "codex", role: "se", task: "implement", model: "gpt-5.4" },
      "hybrid",
    );

    expect(plan.args).not.toContain(CODEX_EFFORT_FLAG);
    expect(plan.args.some((arg) => arg.startsWith(`${CODEX_EFFORT_CONFIG_KEY}=`))).toBe(false);
    expect(plan.effort).toBeUndefined();
  });

  it("U-EFF-003/004: pair-agent adapter plans carry standard effort for light and smart phases", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-343",
      task: "implement effort observation wiring",
      detection: hybridDetection,
      primary: "codex",
      allowFrontier: true,
    });

    const adapterPlans = buildPairAgentAdapterPlans({ plan, mode: "hybrid" });
    const light = adapterPlans.find((adapterPlan) => adapterPlan.model === "gpt-5.3-codex-spark");
    const smart = adapterPlans.find((adapterPlan) => adapterPlan.model === "claude-opus-4-8");

    expect(light?.effort).toBe("low");
    expect(light?.args).toContain(`${CODEX_EFFORT_CONFIG_KEY}=low`);
    expect(smart?.effort).toBe("high");
    expect(smart?.args).toContain("--effort");
    expect(smart?.args).toContain("high");
  });

  it("U-EFF-005: verdictFail=true で shallow=true", () => {
    expect(deriveEffortObservation({ verdictFail: true })).toEqual({ shallow: true });
  });

  it("U-EFF-006: outputChars 閾値未満で shallow=true、十分な出力では false", () => {
    expect(deriveEffortObservation({ outputChars: 100 })).toEqual({ shallow: true });
    expect(deriveEffortObservation({ outputChars: SHALLOW_OUTPUT_CHARS_MIN })).toEqual({});
    expect(deriveEffortObservation({ outputChars: 4000 })).toEqual({});
  });

  it("U-EFF-007: elapsedMs 超過で tooSlow=true、truncated=true なら tooSlow にしない", () => {
    expect(deriveEffortObservation({ elapsedMs: TOO_SLOW_ELAPSED_MS + 1 })).toEqual({
      tooSlow: true,
    });
    expect(
      deriveEffortObservation({ elapsedMs: TOO_SLOW_ELAPSED_MS + 1, truncated: true }),
    ).toEqual({});
  });

  it("U-EFF-008: observations 供給時に effort_source が adaptive になり standard から 1 段動く", () => {
    const result = buildTeamRunPlan(
      {
        name: "effort-team",
        strategy: "parallel",
        max_parallel: 2,
        members: [
          { role: "se", engine: "codex-se", task: "implement simple change" },
          { role: "tl", engine: "pmo-sonnet", task: "review slice" },
        ],
      },
      "hybrid",
      {
        observations: {
          tl: { outputChars: 100 },
        },
      },
    );

    expect(result.members[1].model_selection).toMatchObject({
      model: "claude-sonnet-5",
      reasoning_effort: "high",
      effort_source: "adaptive",
    });
  });

  it("U-EFF-009: observations 無しの既存呼び出しは standard のまま", () => {
    const result = buildTeamRunPlan(
      {
        name: "effort-team",
        strategy: "parallel",
        max_parallel: 2,
        members: [
          { role: "se", engine: "codex-se", task: "implement simple change" },
          { role: "tl", engine: "pmo-sonnet", task: "review slice" },
        ],
      },
      "hybrid",
    );

    expect(result.members[1].model_selection).toMatchObject({
      model: "claude-sonnet-5",
      reasoning_effort: "medium",
      effort_source: "standard",
    });
  });
});
