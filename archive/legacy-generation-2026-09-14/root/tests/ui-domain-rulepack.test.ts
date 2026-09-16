import { describe, expect, it } from "vitest";
import { guardRulePackIsolation } from "../src/design/ui-domain-pattern-profile";
import { validPack, validProfile } from "./tools/ui-domain-fixture";

// PLAN-L7-520-ui-domain-core: UI Domain slice1。L8テスト設計 U-UDP-003 行を機械検査する。

describe("ui-domain rule pack isolation (PLAN-L7-520)", () => {
  it("U-UDP-003: 共通packへのproduct値混入を全列挙fail-closeし、順方向参照はgreen", () => {
    const green = guardRulePackIsolation(validPack(), validProfile());
    expect(green.ok, JSON.stringify(green)).toBe(true);
    if (green.ok) {
      expect(green.value.pack_id).toBe("PACK-common-a11y");
      expect(green.value.checked_rules).toBe(2);
      expect(green.value.receipt_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }

    // profile_id 参照と brand token 実値の混入を全列挙（mutation: 混入判定の各枝を外すと red）
    const dirty = validPack();
    (dirty.rules as unknown as unknown[]).push(
      {
        rule_id: "RULE-bad-profile-ref",
        target_kind: "ui_component",
        constraint: "only-for",
        value: "PRF-helix-central",
      },
      {
        rule_id: "RULE-bad-brand-value",
        target_kind: "design_token",
        constraint: "color",
        value: "#0a5cff",
      },
    );
    const violated = guardRulePackIsolation(dirty, validProfile());
    expect(violated.ok).toBe(false);
    if (!violated.ok) {
      expect(violated.failures).toHaveLength(2);
      expect(violated.failures.every((f) => f.code === "UDP_PRODUCT_VALUE_IN_COMMON_PACK")).toBe(
        true,
      );
    }

    // 部分埋め込み・大文字小文字違いも検出（mutation: 正規化 contains を完全一致へ
    // 戻すとこの fixture が red で kill）
    const sneaky = validPack();
    (sneaky.rules as unknown as unknown[]).push(
      {
        rule_id: "RULE-embedded-brand",
        target_kind: "design_token",
        constraint: "css",
        value: "background: #0A5CFF;",
      },
      {
        rule_id: "RULE-cased-profile",
        target_kind: "ui_component",
        constraint: "only-for",
        value: "PRF-HELIX-CENTRAL 限定",
      },
    );
    const sneaked = guardRulePackIsolation(sneaky, validProfile());
    expect(sneaked.ok).toBe(false);
    if (!sneaked.ok) {
      expect(sneaked.failures).toHaveLength(2);
      expect(sneaked.failures.every((f) => f.code === "UDP_PRODUCT_VALUE_IN_COMMON_PACK")).toBe(
        true,
      );
    }

    // schema 不一致 = UDP_STALE_INPUT
    const badSchema = guardRulePackIsolation(
      { ...validPack(), schema_version: "ui-common-rule-pack.v0" as never },
      validProfile(),
    );
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });
});
