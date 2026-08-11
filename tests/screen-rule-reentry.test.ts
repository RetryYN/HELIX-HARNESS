// PLAN-L7-533-screen-rule-digest-reentry / U-SAPRULE-001（#175 申し送り「rule digest 差分 reentry」）。
//
// L6 設計 §1 は `evaluateScreenReentry` を「scope/capability/**rule** 差で stale ＋ task 一件」と
// 規定し、decision / no-UI receipt も `reentry_trigger: "scope_or_rule_digest_change"` を宣言する。
// しかし実装は scope_digest 差だけを trigger にしており、`canonicalizeScreenScope` は
// rule_set_digest を scope_digest に混ぜていない。結果として **適用ルールだけが変わった場合に
// 既存の no-UI skip receipt が再判定されない**。
//
// 下流の identity 照合（evaluateScreenFreeze の `skip.rule_digest !== decision.rule_digest`、
// store の commitStageClosureAndGate が返す no_ui_identity）は skip と decision の
// **双方が古い rule_digest を持つ**ため一致してしまい、
// この漏れを捕まえない。よって本 oracle が唯一の観測点になる。
import { describe, expect, it } from "vitest";
import type { NoUiReceiptV1 } from "../src/design/screen-applicability";
import { canonicalizeScreenScope, evaluateScreenReentry } from "../src/design/screen-applicability";

const RULE_A = "sha256:rule-a";
const RULE_B = "sha256:rule-b";

function scopeFor(ruleDigest: string, surface = "sha256:surface") {
  const result = canonicalizeScreenScope(
    {
      snapshot_id: "snap-1",
      revision: 1,
      capability_ids: ["cap-x"],
      phase: "L2",
      public_surface_digest: surface,
    },
    {
      policy_id: "policy-1",
      revision: 1,
      capability_ids: ["cap-x", "cap-y"],
      rule_set_digest: ruleDigest,
    },
  );
  if (!result.ok) throw new Error("fixture scope must canonicalize");
  return result.value;
}

const baseScope = scopeFor(RULE_A);

function priorReceipt(overrides: Partial<NoUiReceiptV1> = {}): NoUiReceiptV1 {
  return {
    receipt_id: "skip-1",
    decision_id: "dec-1",
    decision_revision: 2,
    capability_id: "cap-x",
    capability_revision: 1,
    scope_digest: baseScope.scope_digest,
    rule_digest: RULE_A,
    reason_code: "no_public_ui_surface",
    evidence_digest: "sha256:evidence",
    actor_id: "actor-1",
    reentry_trigger_digest: "sha256:trigger",
    issued_at: "2026-08-07T00:00:00Z",
    expires_at: "2026-09-07T00:00:00Z",
    receipt_digest: "sha256:receipt",
    ...overrides,
  };
}

describe("rule digest 差分での再入場 (PLAN-L7-533)", () => {
  it("U-SAPRULE-001: scope 不変でも rule digest が変われば stale + 再判定 task を exactly-one 返す", () => {
    // scope_digest は rule set を含まないため、rule だけ変えても不変であること（前提の固定）。
    expect(scopeFor(RULE_B).scope_digest).toBe(baseScope.scope_digest);

    const result = evaluateScreenReentry(priorReceipt(), baseScope, RULE_B);
    expect(result.ok, JSON.stringify(result).slice(0, 300)).toBe(true);
    if (!result.ok) return;
    expect(result.value.stale_receipt_id).toBe("skip-1");
    expect(result.value.capability_id).toBe("cap-x");
    expect(result.value.expected_revision).toBe(3);
  });

  it("scope も rule も不変なら再入場しない（stale 0 / task 0）", () => {
    const result = evaluateScreenReentry(priorReceipt(), baseScope, RULE_A);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((failure) => failure.code)).toContain("HIL_SCREEN_RECEIPT_STALE");
  });

  it("trigger は scope 差と rule 差を区別する（同一 task_id に潰れない）", () => {
    const ruleOnly = evaluateScreenReentry(priorReceipt(), baseScope, RULE_B);
    const scopeOnly = evaluateScreenReentry(
      priorReceipt(),
      scopeFor(RULE_A, "sha256:surface-2"),
      RULE_A,
    );
    expect(ruleOnly.ok && scopeOnly.ok).toBe(true);
    if (!ruleOnly.ok || !scopeOnly.ok) return;
    expect(ruleOnly.value.trigger_digest).not.toBe(scopeOnly.value.trigger_digest);
    expect(ruleOnly.value.task_id).not.toBe(scopeOnly.value.task_id);
  });

  it("trigger は遷移元 rule も束縛する（to だけ同じでも別 identity）", () => {
    // 同一 receipt_id・同一 scope・同一の遷移先 rule で、遷移元 rule だけが異なる 2 件。
    // trigger が to 側しか畳んでいないと同一 digest に潰れる。
    const fromA = evaluateScreenReentry(priorReceipt({ rule_digest: RULE_A }), baseScope, RULE_B);
    const fromC = evaluateScreenReentry(
      priorReceipt({ rule_digest: "sha256:rule-c" }),
      baseScope,
      RULE_B,
    );
    expect(fromA.ok && fromC.ok).toBe(true);
    if (!fromA.ok || !fromC.ok) return;
    expect(fromA.value.trigger_digest).not.toBe(fromC.value.trigger_digest);
  });

  it("同一入力の再送は決定的同値（増分 0）", () => {
    const a = evaluateScreenReentry(priorReceipt(), baseScope, RULE_B);
    const b = evaluateScreenReentry(priorReceipt(), baseScope, RULE_B);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.value.task_id).toBe(b.value.task_id);
    expect(a.value.trigger_digest).toBe(b.value.trigger_digest);
  });

  it("現行 rule digest が不正なら判定せず fail-close する", () => {
    for (const invalid of ["", "rule-b", "sha256:"]) {
      const result = evaluateScreenReentry(priorReceipt(), baseScope, invalid);
      expect(result.ok, `invalid rule digest: ${JSON.stringify(invalid)}`).toBe(false);
      if (!result.ok)
        expect(result.failures.map((failure) => failure.code)).toContain(
          "HIL_SCREEN_APPLICABILITY_INVALID",
        );
    }
  });
});
