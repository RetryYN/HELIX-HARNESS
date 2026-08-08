import { describe, expect, it } from "vitest";
import { validatePatternContract } from "../src/design/ui-domain-pattern-profile";
import { buildUiDomain, validContract } from "./tools/ui-domain-fixture";

// PLAN-L7-520-ui-domain-core: UI Domain slice1。L8テスト設計 U-UDP-002 行を機械検査する。

describe("ui-domain pattern contract (PLAN-L7-520)", () => {
  it("U-UDP-002: required/forbidden競合と対象非実在をfail-closeし、競合なしは索引を返す", () => {
    const domain = buildUiDomain();
    const green = validatePatternContract(validContract(), domain);
    expect(green.ok, JSON.stringify(green)).toBe(true);
    if (green.ok) {
      expect(green.value.pattern_id).toBe("PTN-form-submit");
      expect(green.value.required_index.length).toBe(2);
      expect(green.value.forbidden_index.length).toBe(1);
      expect(green.value.contract_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }

    // 同一対象への required/forbidden 競合 = UDP_CONTRACT_CONFLICT（mutation: 競合判定を
    // 外すと red）
    const conflict = validContract();
    (conflict.forbidden as unknown as unknown[]).push({
      target_kind: "ui_component",
      target_id: "CMP-approve-button",
      condition: "visible",
    });
    const conflicted = validatePatternContract(conflict, domain);
    expect(conflicted.ok).toBe(false);
    if (!conflicted.ok) {
      expect(conflicted.failures[0]?.code).toBe("UDP_CONTRACT_CONFLICT");
    }

    // wildcard（kind 全体）と具体 ID の交差も矛盾契約 = UDP_CONTRACT_CONFLICT（mutation:
    // 交差判定を外すと red）
    const wildcardCross = validContract();
    (wildcardCross.required as unknown as unknown[]).push({
      target_kind: "ui_component",
      target_id: null,
      condition: "hidden",
    });
    (wildcardCross.forbidden as unknown as unknown[]).push({
      target_kind: "ui_component",
      target_id: "CMP-approve-button",
      condition: "hidden",
    });
    const crossed = validatePatternContract(wildcardCross, domain);
    expect(crossed.ok).toBe(false);
    if (!crossed.ok) expect(crossed.failures[0]?.code).toBe("UDP_CONTRACT_CONFLICT");

    // 対象 entity 非実在は fail-close（mutation: 実在検査を外すと red）
    const orphan = validContract();
    (orphan.required as unknown as unknown[]).push({
      target_kind: "ui_component",
      target_id: "CMP-none",
      condition: "visible",
    });
    expect(validatePatternContract(orphan, domain).ok).toBe(false);

    // schema 不一致 = UDP_STALE_INPUT（共通入口検査）
    const badSchema = validatePatternContract(
      { ...validContract(), schema_version: "ui-pattern-contract.v0" as never },
      domain,
    );
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });
});
