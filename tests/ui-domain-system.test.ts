import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeUiDomainBundleGate,
  checkUiDomainBundleGate,
  loadUiDomainBundleRaw,
  REQUIRED_BUNDLE_SECTIONS,
  REQUIRED_UI_DOMAIN_ENTITY_IDS,
  UI_DOMAIN_BUNDLE_ASSET,
} from "../src/design/ui-domain-gate";
import type { PairwiseInputV1, UdpAxisV1 } from "../src/design/ui-domain-pattern-profile";
import { selectPairwiseFixtures, UDP_AXES } from "../src/design/ui-domain-pattern-profile";

/**
 * PLAN-L7-540-ui-domain-real-assets / L9 system assertion（Issue #209）。
 *
 * L8（U-UDP-001〜007）は合成 fixture で純関数を検査する。本書はそれを再実行せず、
 * 「実 repository の実 asset 正本を実 gate 配線経由で通す」system 粒度を検証する:
 *
 *   - U-UDP-008（SA-UDP-02）: 実 profile / 実 Pattern Contract / 実共通 Rule Pack を
 *     doctor 配線と同一の gate 経路で同時 load し、混入・競合の注入が実行環境で
 *     fail-close されることを確認する
 *   - U-UDP-009（SA-UDP-03）: 実 risk matrix 宣言から fixture 列を生成し、生成物が
 *     テスト実行計画（fixture consumer）へ接続可能で、軸 level の実バリエーション下でも
 *     被覆 3 条件（pair 被覆 100% / high risk 全件包含 / 決定的順序）を維持することを確認する
 *
 * SA-UDP-01（実 L2 正本 end-to-end intake）は上流 #257（Canonical Design IR intake）
 * 未到達のためここでは扱わない（L4 §2 の未実装ブロックとして残す）。
 */

function realBundle(): Record<string, unknown> {
  return JSON.parse(readFileSync(join(process.cwd(), UI_DOMAIN_BUNDLE_ASSET), "utf8")) as Record<
    string,
    unknown
  >;
}

describe("UI domain real-asset L9 gate system assertion (PLAN-L7-540)", () => {
  it("U-UDP-008: 実 asset 一式が実 gate 配線経由で green、混入・競合注入は fail-close する（SA-UDP-02）", () => {
    // 1) 実 repo の実 asset を doctor と同一経路で検査して green。
    const real = checkUiDomainBundleGate(process.cwd());
    expect(real.ok).toBe(true);
    expect(real.messages).toEqual([expect.stringContaining("ui-domain-bundle — OK")]);

    // 2) 実 asset へ product 値（profile brand 実値）を共通 Rule Pack へ混入注入 →
    //    同じ gate 経路で pack section が fail-close する。
    const contaminated = realBundle();
    const pack = contaminated.pack as { rules: { rule_id: string; value: string | null }[] };
    const profile = contaminated.profile as { brand: { tokens: { value: string }[] } };
    const brandValue = profile.brand.tokens[0]?.value as string;
    pack.rules.push({ rule_id: "RUL-injected", value: `既定色は ${brandValue} とする` });
    const packResult = analyzeUiDomainBundleGate(contaminated);
    expect(packResult.ok).toBe(false);
    expect(packResult.messages.join("\n")).toContain("pack");
    expect(packResult.messages.join("\n")).toContain("UDP_PRODUCT_VALUE_IN_COMMON_PACK");

    // 3) 実 contract へ required と同一 term の forbidden を注入 → contract 競合で fail-close。
    const conflicted = realBundle();
    const contract = conflicted.contract as {
      required: Record<string, unknown>[];
      forbidden: Record<string, unknown>[];
    };
    contract.forbidden.push({ ...contract.required[0] });
    const contractResult = analyzeUiDomainBundleGate(conflicted);
    expect(contractResult.ok).toBe(false);
    expect(contractResult.messages.join("\n")).toContain("contract");
    expect(contractResult.messages.join("\n")).toContain("UDP_CONTRACT_CONFLICT");

    // 4) section の骨抜き（実 asset から pack を削除）を実 gate が検知する。
    //    SA-UDP-02 は「3 者同時 load」であり、宣言を消して green を得る経路を許さない。
    for (const section of REQUIRED_BUNDLE_SECTIONS) {
      const gutted = realBundle();
      delete gutted[section];
      const guttedResult = analyzeUiDomainBundleGate(gutted);
      expect(guttedResult.ok).toBe(false);
      expect(guttedResult.messages.join("\n")).toContain(`section-missing:${section}`);
    }
  });

  it("U-UDP-008b: doctor が本 gate を集約に配線している（配線の機械確認）", () => {
    // gate 関数の存在だけでは doctor 集約から漏れても green になる。runFullDoctor が
    // ok 集計・全体 ok・メッセージ集約の 3 点で uiDomainBundle を参照することを機械確認する。
    const doctorSource = readFileSync(join(process.cwd(), "src/doctor/index.ts"), "utf8");
    expect(doctorSource).toContain('["uiDomainBundle", uiDomainBundle.ok]');
    expect(doctorSource).toContain("aggregateInternalDoctorChecks(doctorCheckDefinitions)");
    expect(doctorSource).toContain("ok: doctorAllChecksOk");
    expect(doctorSource).toContain("...uiDomainBundle.messages.map(");
  });

  it("U-UDP-008d: canonical 52 entity の欠落・余剰・重複を独立 manifest で拒否する", () => {
    for (const requiredId of REQUIRED_UI_DOMAIN_ENTITY_IDS) {
      const missing = realBundle();
      const domain = missing.domain as { entities: { entity_id: string }[] };
      domain.entities = domain.entities.filter((entity) => entity.entity_id !== requiredId);
      const result = analyzeUiDomainBundleGate(missing);
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain(`entity-missing:${requiredId}`);
    }

    const unexpected = realBundle();
    const unexpectedDomain = unexpected.domain as { entities: Record<string, unknown>[] };
    unexpectedDomain.entities.push({
      entity_id: "CMP-unexpected",
      kind: "ui_component",
      revision: 1,
      authority: "canonical",
    });
    expect(analyzeUiDomainBundleGate(unexpected).messages.join("\n")).toContain(
      "entity-unexpected:CMP-unexpected",
    );

    const duplicate = realBundle();
    const duplicateDomain = duplicate.domain as { entities: Record<string, unknown>[] };
    duplicateDomain.entities.push({ ...duplicateDomain.entities[0] });
    expect(analyzeUiDomainBundleGate(duplicate).messages.join("\n")).toContain(
      "entity-duplicate:SCR-pm-01",
    );
  });

  it("U-UDP-008c: 実 asset 欠落・破損 JSON を fail-close する（fail-open 禁止）", () => {
    const missing = checkUiDomainBundleGate("/nonexistent-helix-root");
    expect(missing.ok).toBe(false);
    expect(missing.messages.join("\n")).toContain("asset-missing");

    const broken = analyzeUiDomainBundleGate("not-a-record");
    expect(broken.ok).toBe(false);
  });

  it("U-UDP-009: 実 risk matrix から生成した fixture 列が被覆 3 条件を満たし consumer へ接続可能である（SA-UDP-03）", () => {
    const raw = loadUiDomainBundleRaw(process.cwd()) as { pairwise: PairwiseInputV1 };
    const expectedAssetAxes = [
      "concurrent_update",
      "data_volume",
      "destructive_undo",
      "device",
      "input",
      "locale",
      "network",
      "role",
    ];
    expect(Object.keys(raw.pairwise.axes).sort()).toEqual(expectedAssetAxes);
    const selection = selectPairwiseFixtures(raw.pairwise);
    if (!selection.ok) throw new Error(JSON.stringify(selection.failures));

    // 被覆条件 1: 全 2 軸ペア被覆 100%（selector の自己申告ではなく独立に検算する）。
    const fixtures = selection.value.fixtures;
    expect(selection.value.pair_coverage).toBe(1);
    const covered = new Set<string>();
    for (const fixture of fixtures) {
      for (let i = 0; i < UDP_AXES.length; i += 1) {
        for (let j = i + 1; j < UDP_AXES.length; j += 1) {
          const a = UDP_AXES[i] as UdpAxisV1;
          const b = UDP_AXES[j] as UdpAxisV1;
          covered.add(`${a}=${fixture.levels[a]}|${b}=${fixture.levels[b]}`);
        }
      }
    }
    for (let i = 0; i < UDP_AXES.length; i += 1) {
      for (let j = i + 1; j < UDP_AXES.length; j += 1) {
        const a = UDP_AXES[i] as UdpAxisV1;
        const b = UDP_AXES[j] as UdpAxisV1;
        for (const levelA of raw.pairwise.axes[a]) {
          for (const levelB of raw.pairwise.axes[b]) {
            expect(covered.has(`${a}=${levelA}|${b}=${levelB}`)).toBe(true);
          }
        }
      }
    }

    // 被覆条件 2: 実 risk matrix の high risk entry 全件包含。
    const highEntries = raw.pairwise.risk_matrix.filter((entry) => entry.risk_class === "high");
    expect(highEntries.length).toBeGreaterThan(0);
    for (const entry of highEntries) {
      const included = fixtures.some((fixture) =>
        Object.entries(entry.levels).every(
          ([axis, level]) => fixture.levels[axis as UdpAxisV1] === level,
        ),
      );
      expect(included).toBe(true);
    }
    expect(selection.value.high_risk_included).toBe(highEntries.length);

    // 被覆条件 3: 決定的順序（同一入力の再実行で同一 digest・同一列）。
    const again = selectPairwiseFixtures(raw.pairwise);
    if (!again.ok) throw new Error("re-run failed");
    expect(again.value.selection_digest).toBe(selection.value.selection_digest);
    expect(again.value.fixtures).toEqual(fixtures);

    // consumer 接続可能性: 各 fixture が 8 軸すべての level を持つ完全代入で、
    // fixture_id が一意（テスト実行計画の行としてそのまま消費できる形）。
    const ids = new Set<string>();
    for (const fixture of fixtures) {
      ids.add(fixture.fixture_id);
      for (const axis of UDP_AXES) {
        expect(raw.pairwise.axes[axis]).toContain(fixture.levels[axis]);
      }
    }
    expect(ids.size).toBe(fixtures.length);
  });

  it("U-UDP-009b: 軸 level の実バリエーション追加でも被覆 3 条件を維持する（SA-UDP-03 変動面）", () => {
    // 実 matrix の実バリエーション: L2 が許す範囲での level 追加（例: input へ
    // screen-reader 併用を追加）に対しても、同じ生成経路が被覆を保つことを確認する。
    const raw = loadUiDomainBundleRaw(process.cwd()) as { pairwise: PairwiseInputV1 };
    const varied: PairwiseInputV1 = {
      ...raw.pairwise,
      axes: { ...raw.pairwise.axes, input: [...raw.pairwise.axes.input, "keyboard-with-reader"] },
    };
    const selection = selectPairwiseFixtures(varied);
    if (!selection.ok) throw new Error(JSON.stringify(selection.failures));
    expect(selection.value.pair_coverage).toBe(1);
    const highCount = varied.risk_matrix.filter((entry) => entry.risk_class === "high").length;
    expect(selection.value.high_risk_included).toBe(highCount);
    // 追加 level が実際に fixture へ現れる（変動が生成経路に届いている）。
    expect(
      selection.value.fixtures.some((fixture) => fixture.levels.input === "keyboard-with-reader"),
    ).toBe(true);
  });
});
