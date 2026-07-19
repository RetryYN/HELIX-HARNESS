import { describe, expect, it } from "vitest";
import { extensibilityScore, projectScorecard, smokeDigest } from "../src/runtime/worker-scorecard";

// PLAN-L7-458-worker-bench-and-scorecard
// 正本 = docs/design/helix/L6-function-design/worker-bench-scorecard.md の U-WBENCH oracle。
describe("worker-scorecard (PLAN-L7-458)", () => {
  it("U-WBENCH-001: スモークセット機械採点は同一入力で決定的（digest 一致）", () => {
    const a = [
      { model: "kimi-k2.7", dimension: "instruction", score: 0.95 },
      { model: "claude-sonnet-5", dimension: "instruction", score: 0.9 },
    ];
    const shuffled = [a[1], a[0]] as typeof a;
    expect(smokeDigest(a)).toBe(smokeDigest(shuffled));
    expect(smokeDigest(a)).toMatch(/^sha256:[0-9a-f]{64}$/);
    const mutated = [{ ...a[0], score: 0.94 }, a[1]] as typeof a;
    expect(smokeDigest(mutated)).not.toBe(smokeDigest(a));
  });

  it("U-WBENCH-002: 委譲 evidence の 4 フィールドがスコアカード projection に現れる", () => {
    const rows = projectScorecard([
      {
        model: "kimi-k2.7",
        taskClass: "impl",
        firstPass: true,
        retryCount: 0,
        proposalDiffSize: 120,
        lintViolationCount: 0,
      },
      {
        model: "kimi-k2.7",
        taskClass: "impl",
        firstPass: false,
        retryCount: 2,
        proposalDiffSize: 200,
        lintViolationCount: 3,
      },
    ]);
    expect(rows).toEqual([
      {
        model: "kimi-k2.7",
        taskClass: "impl",
        delegations: 2,
        firstPassRate: 0.5,
        meanRetryCount: 1,
        meanProposalDiffSize: 160,
        meanLintViolationCount: 1.5,
      },
    ]);
    expect(() =>
      projectScorecard([
        {
          model: "",
          taskClass: "impl",
          firstPass: true,
          retryCount: 0,
          proposalDiffSize: 1,
          lintViolationCount: 0,
        },
      ]),
    ).toThrow(RangeError);
  });

  it("U-WBENCH-003: 拡張性採点は実測式のみで静的 rubric 経路を持たない", () => {
    const simple = extensibilityScore({
      firstImplementationSize: 100,
      changeScenarioDiffSize: 10,
      testsGreenAfterChange: true,
    });
    const overbuilt = extensibilityScore({
      firstImplementationSize: 100,
      changeScenarioDiffSize: 80,
      testsGreenAfterChange: true,
    });
    expect(simple).toBeGreaterThan(overbuilt);
    expect(() =>
      extensibilityScore({
        firstImplementationSize: 100,
        changeScenarioDiffSize: 10,
        testsGreenAfterChange: false,
      }),
    ).toThrow(RangeError);
    expect(() =>
      extensibilityScore({
        firstImplementationSize: 0,
        changeScenarioDiffSize: 10,
        testsGreenAfterChange: true,
      }),
    ).toThrow(RangeError);
  });
});
