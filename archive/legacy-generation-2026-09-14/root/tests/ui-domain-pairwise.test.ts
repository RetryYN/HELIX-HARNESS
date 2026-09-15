import { describe, expect, it } from "vitest";
import {
  type PairwiseInputV1,
  selectPairwiseFixtures,
  UDP_AXES,
} from "../src/design/ui-domain-pattern-profile";

// PLAN-L7-521-ui-domain-pairwise: UI Domain slice2。L8テスト設計 U-UDP-005 行を機械検査する。

function validInput(): PairwiseInputV1 {
  return {
    schema_version: "ui-pairwise-input.v1",
    axes: {
      device: ["desktop", "tablet", "mobile"],
      input: ["pointer", "touch", "keyboard"],
      role: ["admin", "member"],
      locale: ["ja", "en"],
      data_volume: ["empty", "typical", "huge"],
      network: ["fast", "slow", "offline"],
      concurrent_update: ["none", "rival"],
      destructive_undo: ["none", "destructive", "destructive_with_undo"],
    },
    risk_matrix: [
      { levels: { device: "mobile", network: "offline" }, risk_class: "high" },
      {
        levels: { destructive_undo: "destructive", concurrent_update: "rival" },
        risk_class: "high",
      },
      { levels: { locale: "en" }, risk_class: "medium" },
    ],
    mode: "pairwise",
  };
}

function pairCovered(
  fixtures: readonly { levels: Readonly<Record<string, string>> }[],
  axisA: string,
  levelA: string,
  axisB: string,
  levelB: string,
): boolean {
  return fixtures.some((f) => f.levels[axisA] === levelA && f.levels[axisB] === levelB);
}

describe("ui-domain pairwise selector (PLAN-L7-521)", () => {
  it("U-UDP-005: ペア被覆100%とhigh risk seed包含と決定性を同時充足し、逸脱をfail-closeする", () => {
    const input = validInput();
    const result = selectPairwiseFixtures(input);
    expect(result.ok, JSON.stringify(result).slice(0, 300)).toBe(true);
    if (!result.ok) return;
    const selection = result.value;
    expect(selection.pair_coverage).toBe(1);
    expect(selection.selection_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    // 全積の禁止: fixture 数は全 Cartesian（3*3*2*2*3*3*2*3=1944）より大幅に小さい
    expect(selection.fixtures.length).toBeLessThan(200);
    expect(selection.fixtures.length).toBeGreaterThan(0);

    // 全 2 軸ペア被覆 100% を独立検算（mutation: 被覆ロジックを弱めると red）
    const axes = Object.entries(input.axes);
    for (let i = 0; i < axes.length; i += 1) {
      for (let j = i + 1; j < axes.length; j += 1) {
        const [axisA, levelsA] = axes[i] as [string, readonly string[]];
        const [axisB, levelsB] = axes[j] as [string, readonly string[]];
        for (const levelA of levelsA) {
          for (const levelB of levelsB) {
            expect(
              pairCovered(selection.fixtures, axisA, levelA, axisB, levelB),
              `${axisA}=${levelA} x ${axisB}=${levelB}`,
            ).toBe(true);
          }
        }
      }
    }

    // high risk entry の seed 包含（mutation: seed 包含を外すと red）
    expect(
      selection.fixtures.some(
        (f) =>
          f.levels.device === "mobile" && f.levels.network === "offline" && f.risk_class === "high",
      ),
    ).toBe(true);
    expect(
      selection.fixtures.some(
        (f) =>
          f.levels.destructive_undo === "destructive" &&
          f.levels.concurrent_update === "rival" &&
          f.risk_class === "high",
      ),
    ).toBe(true);
    expect(selection.high_risk_included).toBe(2);

    // 全 fixture が全軸の level を持ち、fixture_id は一意
    for (const fixture of selection.fixtures) {
      for (const axis of UDP_AXES) {
        expect(input.axes[axis]).toContain(fixture.levels[axis]);
      }
    }
    expect(new Set(selection.fixtures.map((f) => f.fixture_id)).size).toBe(
      selection.fixtures.length,
    );

    // 決定性: 同一入力 2 回で deep-equal（mutation: 順序決定性を壊すと red）
    expect(selectPairwiseFixtures(validInput())).toEqual(result);

    // 決定性（意味的同一・object key 順違い）: axes / risk levels の宣言キー順を
    // 入れ替えても selection_digest は一致する（review round1 反例の恒久 oracle）
    const permuted = validInput();
    (permuted as { axes: unknown }).axes = Object.fromEntries(
      Object.entries(validInput().axes).reverse(),
    );
    permuted.risk_matrix = [
      { levels: { network: "offline", device: "mobile" }, risk_class: "high" },
      {
        levels: { concurrent_update: "rival", destructive_undo: "destructive" },
        risk_class: "high",
      },
      { levels: { locale: "en" }, risk_class: "medium" },
    ];
    const permutedResult = selectPairwiseFixtures(permuted);
    expect(permutedResult.ok).toBe(true);
    if (permutedResult.ok) {
      expect(permutedResult.value.selection_digest).toBe(selection.selection_digest);
    }

    // 完全重複する high risk entry は dedup され、fixture 重複を生まない
    const dupRisk = validInput();
    dupRisk.risk_matrix = [
      ...validInput().risk_matrix,
      { levels: { device: "mobile", network: "offline" }, risk_class: "high" },
    ];
    const dupResult = selectPairwiseFixtures(dupRisk);
    expect(dupResult.ok).toBe(true);
    if (dupResult.ok) {
      // dedup により fixture 列は元入力と同一（selection_digest 一致）で、
      // dup entry も既存 fixture に包含済みとして数えられる
      expect(dupResult.value.selection_digest).toBe(selection.selection_digest);
      expect(dupResult.value.high_risk_included).toBe(3);
    }

    // mode 逸脱（全積要求）= UDP_CARTESIAN_EXPLOSION
    const cartesian = selectPairwiseFixtures({
      ...validInput(),
      mode: "cartesian" as never,
    });
    expect(cartesian.ok).toBe(false);
    if (!cartesian.ok) expect(cartesian.failures[0]?.code).toBe("UDP_CARTESIAN_EXPLOSION");

    // 未知 level を参照する risk entry / 空軸 / schema 不一致は fail-close
    const badRisk = validInput();
    (badRisk.risk_matrix as unknown as unknown[]).push({
      levels: { device: "watch" },
      risk_class: "high",
    });
    expect(selectPairwiseFixtures(badRisk).ok).toBe(false);
    const emptyAxis = validInput();
    (emptyAxis.axes as Record<string, readonly string[]>).network = [];
    const emptied = selectPairwiseFixtures(emptyAxis);
    expect(emptied.ok).toBe(false);
    if (!emptied.ok) expect(emptied.failures[0]?.code).toBe("UDP_STALE_INPUT");
    // 軸キー自体の欠落（undefined）も同じ fail-close 経路
    const missingAxis = validInput();
    delete (missingAxis.axes as Record<string, unknown>).network;
    const missed = selectPairwiseFixtures(missingAxis);
    expect(missed.ok).toBe(false);
    if (!missed.ok) expect(missed.failures[0]?.code).toBe("UDP_STALE_INPUT");
    const badSchema = selectPairwiseFixtures({
      ...validInput(),
      schema_version: "ui-pairwise-input.v0" as never,
    });
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });
});
