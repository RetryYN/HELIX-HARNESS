// PLAN-L7-535-plan-number-uniqueness / U-PLANNUM-001（#175 キャリー「採番重複」）。
//
// 並行レーンが同時に「次の空き番号」を取ると、意味の異なる PLAN が同じ番号を名乗る。
// 実 repo で 15 組（うち 2 組は 3 本）発生しており、prose 中の裸の `PLAN-L7-525` 参照が
// どちらを指すか判別できなくなっていた。この gate は **新規の衝突** を塞ぐ。
//
// 既存 15 組は confirmed PLAN の改番（identity と全参照の移動）を要する migration であり、
// gate では直さず baseline として凍結する。baseline は「許可」ではなく「既知の負債」であり、
// 改番が進んだら下げる（`resolvedBaselineKeys` がそれを検出する）。
import { describe, expect, it } from "vitest";
import {
  analyzePlanNumberUniqueness,
  checkPlanNumberUniqueness,
  groupPlanNumbers,
  PLAN_NUMBER_COLLISION_BASELINE,
  planNumberUniquenessMessages,
} from "../src/lint/plan-number-uniqueness";
import { lintPlanGate } from "../src/plan/lint";

describe("PLAN 採番の一意性 (PLAN-L7-535)", () => {
  it("U-PLANNUM-001: baseline 外の採番 key が 2 本になったら fail-close する", () => {
    const fresh = analyzePlanNumberUniqueness(
      ["PLAN-L7-900-alpha-lane.md", "PLAN-L7-900-beta-lane.md"],
      new Map(),
    );
    expect(fresh.ok).toBe(false);
    expect(fresh.violations).toHaveLength(1);
    expect(fresh.violations[0]?.key).toBe("PLAN-L7-900");
    expect(fresh.violations[0]?.actual).toBe(2);
    expect(fresh.violations[0]?.allowed).toBe(1);
    expect(fresh.violations[0]?.files).toEqual([
      "PLAN-L7-900-alpha-lane.md",
      "PLAN-L7-900-beta-lane.md",
    ]);
  });

  it("U-PLANNUM-002: baseline 登録済み key は許容本数まで通し、1 本増で拒否する", () => {
    const baseline = new Map([["PLAN-L7-900", 2]]);
    expect(
      analyzePlanNumberUniqueness(
        ["PLAN-L7-900-alpha-lane.md", "PLAN-L7-900-beta-lane.md"],
        baseline,
      ).ok,
    ).toBe(true);
    const grown = analyzePlanNumberUniqueness(
      ["PLAN-L7-900-alpha-lane.md", "PLAN-L7-900-beta-lane.md", "PLAN-L7-900-gamma-lane.md"],
      baseline,
    );
    expect(grown.ok).toBe(false);
    expect(grown.violations[0]?.allowed).toBe(2);
    expect(grown.violations[0]?.actual).toBe(3);
  });

  it("U-PLANNUM-003: 改番で baseline を下回ったら baseline を下げるよう報告する", () => {
    const baseline = new Map([["PLAN-L7-900", 2]]);
    const shrunk = analyzePlanNumberUniqueness(["PLAN-L7-900-alpha-lane.md"], baseline);
    expect(shrunk.ok).toBe(true);
    expect(shrunk.resolvedBaselineKeys).toEqual(["PLAN-L7-900"]);
    expect(planNumberUniquenessMessages(shrunk)[0]).toContain("baseline を下げる");
  });

  it("U-PLANNUM-004: 採番 key は layer と番号までで、slug を含まない", () => {
    // 番号違いは衝突ではない。
    expect(
      analyzePlanNumberUniqueness(["PLAN-L7-900-alpha.md", "PLAN-L7-901-alpha.md"], new Map()).ok,
    ).toBe(true);
    const groups = groupPlanNumbers([
      "PLAN-L7-525-psc-transaction-consumer.md",
      "PLAN-L7-525-work-graph-receipt-acceptance.md",
      "PLAN-RECOVERY-40-github-cross-review-admission.md",
      "not-a-plan.md",
      "PLAN-L7-INVALID-slug.md",
    ]);
    expect([...groups.keys()].sort()).toEqual(["PLAN-L7-525", "PLAN-RECOVERY-40"]);
    expect(groups.get("PLAN-L7-525")).toHaveLength(2);
  });

  it("U-PLANNUM-006: plan lint の既定経路と専用 gate の双方へ配線されている", () => {
    // gate を書いても既定経路に載っていなければ CI では発火しない。両方を固定する。
    const dedicated = lintPlanGate({ gate: "number-uniqueness" });
    expect(dedicated.ok, dedicated.messages.join("\n")).toBe(true);
    expect(dedicated.messages.join("\n")).toContain("plan-number-uniqueness");
    const combined = lintPlanGate({});
    expect(combined.messages.join("\n")).toContain("plan-number-uniqueness");
  });

  it("U-PLANNUM-005: 実 repo は baseline 超過 0 で、baseline に stale key が無い", () => {
    const live = checkPlanNumberUniqueness(process.cwd());
    expect(live.ok, planNumberUniquenessMessages(live).join("\n")).toBe(true);
    // fence が空振りしていないこと（PLAN を実際に読めている）。
    expect(live.checked).toBeGreaterThan(300);
    // baseline に載っているのに実在しない key（改番済み / typo）が無いこと。
    expect(live.resolvedBaselineKeys, "baseline に stale な key がある").toEqual([]);
    // 凍結値が実態と一致していること（過大な許容を防ぐ）。
    expect(PLAN_NUMBER_COLLISION_BASELINE.size).toBe(15);
  });
});
