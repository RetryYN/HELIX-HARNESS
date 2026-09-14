import { describe, expect, it } from "vitest";
import { recommendTeamLaunch } from "../src/team/launch-policy";
import { buildTeamRunPlan } from "../src/team/run";

// PLAN-L7-639-luna-worker-model-registry / U-LUNA-003

describe("U-TEAM-003 team launch policy", () => {
  it("U-TEAM-003: does not launch a team for trivial work in hybrid mode", () => {
    const result = recommendTeamLaunch({
      task: "fix README typo",
      mode: "hybrid",
    });

    expect(result).toMatchObject({
      should_launch: false,
      difficulty: "trivial",
      trigger: "simple",
    });
    expect(result.definition).toBeUndefined();
  });

  it("U-TEAMRUN-003: recommends a cross-provider team for critical risk work", () => {
    const result = recommendTeamLaunch({
      task: "production security schema migration",
      mode: "hybrid",
    });

    expect(result).toMatchObject({
      should_launch: true,
      difficulty: "critical",
      trigger: "risk",
    });
    expect(result.definition?.members.map((member) => member.role)).toEqual(["se", "tl", "qa"]);
    expect(result.definition?.members.map((member) => member.engine)).toEqual([
      "codex-se",
      "pmo-sonnet",
      "claude-qa",
    ]);

    expect(result.definition).toBeDefined();
    if (!result.definition) throw new Error("expected team definition");
    const plan = buildTeamRunPlan(result.definition, "hybrid");
    expect(plan.ok).toBe(true);
    expect(plan.strategy).toBe("sequential");
    expect(plan.members.map((member) => member.provider)).toEqual(["codex", "claude", "claude"]);
    // effort は選定 model の標準 effort が既定 (PLAN-L7-310/311)。se=gpt-5.5(high) は frontier 標準 high、
    // tl=pmo-sonnet(claude-sonnet-5) は sonnet 標準 medium、qa=opus(medium) は opus 標準 medium
    // (2026-07-25 に opus 標準を high→medium へ是正、sonnet と同帯)。
    // 浅い回答を観測したら runtime が medium→high へ 1 段上げる。
    expect(plan.members.map((member) => member.model_selection.reasoning_effort)).toEqual([
      "high",
      "medium",
      "medium",
    ]);
    expect(plan.members.map((member) => member.model_selection.effort_source)).toEqual([
      "standard",
      "standard",
      "standard",
    ]);
  });

  it("U-TEAM-003: launches for standard non-risk work by difficulty", () => {
    const result = recommendTeamLaunch({
      task: "implement reporting workflow",
      mode: "hybrid",
    });

    expect(result).toMatchObject({
      should_launch: true,
      difficulty: "standard",
      trigger: "difficulty",
    });
    expect(result.definition?.members.map((member) => member.role)).toEqual(["se", "tl"]);
    expect(result.definition?.members.some((member) => member.serialize_after)).toBe(false);
  });

  it("U-TEAM-003: launches for trivial work when a risk term is present", () => {
    const result = recommendTeamLaunch({
      task: "fix README typo for windows setup",
      mode: "hybrid",
    });

    expect(result).toMatchObject({
      should_launch: true,
      difficulty: "trivial",
      trigger: "risk",
    });
    expect(result.definition?.members.map((member) => member.role)).toEqual(["se", "tl"]);
  });

  it("U-TEAMRUN-003: serializes complex review after implementation", () => {
    const result = recommendTeamLaunch({
      task: "refactor runtime adapter",
      mode: "hybrid",
    });

    expect(result).toMatchObject({
      should_launch: true,
      difficulty: "complex",
    });
    expect(result.definition?.members[1]).toMatchObject({
      role: "tl",
      serialize_after: "se",
    });
  });

  it("U-TEAM-003: does not silently launch team flow outside hybrid mode", () => {
    const result = recommendTeamLaunch({
      task: "subagent runtime adapter refactor",
      mode: "codex-only",
    });

    expect(result).toMatchObject({
      should_launch: false,
      difficulty: "complex",
      trigger: "unavailable",
    });
    expect(result.reason).toContain("requires hybrid mode");
  });

  it("U-LUNA-003: T1 proposal workerをLuna xhighへ投影する", () => {
    const result = recommendTeamLaunch({
      task: "implement bounded runtime slice",
      mode: "hybrid",
      proposalSubagents: [
        {
          role: "se",
          tier: "T1-worker",
          model: "gpt-5.6-luna",
          purpose: "bounded implementation",
          parallel_slots: 1,
          closing_authority: false,
          ownership: "src/example.ts",
        },
      ],
    });
    expect(result.definition?.members[0]).toMatchObject({
      model: "gpt-5.6-luna",
      effort: "xhigh",
    });
  });
  // PLAN-L7-649-proposal-lane-effort-binding / Issue #881 — U-LANEEFF-001〜004
  // 設計 = docs/design/helix/L6-function-design/proposal-lane-effort-binding.md
  const proposalLane = (
    tier: "T2-mini" | "T2-spark" | "T1-worker" | "T0-frontier",
    model: string,
  ) =>
    ({
      role: "se" as const,
      tier,
      model,
      purpose: "bounded implementation",
      parallel_slots: 1,
      closing_authority: false,
      ownership: "src/example.ts",
    }) as const;

  const laneEffort = (
    tier: "T2-mini" | "T2-spark" | "T1-worker" | "T0-frontier",
    model: string,
  ): string | undefined =>
    recommendTeamLaunch({
      task: "implement bounded runtime slice",
      mode: "hybrid",
      proposalSubagents: [proposalLane(tier, model)],
    }).definition?.members[0]?.effort;

  it("U-LANEEFF-001: T1 lane の effort は tier ではなく model の標準 effort から導出する", () => {
    // U-LUNA-003 の Luna=xhigh と対になる negative oracle。tier 固定実装ではこれらが xhigh になる。
    expect(laneEffort("T1-worker", "gpt-5.6-terra")).toBe("medium");
    expect(laneEffort("T1-worker", "gpt-5.4-codex")).toBe("medium");
    expect(laneEffort("T1-worker", "claude-haiku-4-5")).toBe("low");
  });

  it("U-LANEEFF-002: tier は上限としてのみ働く (T2 は model 標準が上でも low を超えない)", () => {
    expect(laneEffort("T2-mini", "gpt-5.6-mini")).toBe("low");
    expect(laneEffort("T2-mini", "gpt-5.6-luna")).toBe("low");
    expect(laneEffort("T2-spark", "gpt-5.6-sol")).toBe("low");
  });

  it("U-LANEEFF-003: T0 lane も model 由来で、上限 high を超えない", () => {
    expect(laneEffort("T0-frontier", "gpt-5.6-sol")).toBe("high");
    expect(laneEffort("T0-frontier", "gpt-5.6-terra")).toBe("medium");
    expect(laneEffort("T0-frontier", "gpt-5.6-luna")).toBe("high");
  });

  it("U-LANEEFF-004: 未知 model は安全側 medium へ解決し、tier 上限を適用する", () => {
    expect(laneEffort("T1-worker", "some-unlisted-model")).toBe("medium");
    expect(laneEffort("T2-mini", "some-unlisted-model")).toBe("low");
  });
});
