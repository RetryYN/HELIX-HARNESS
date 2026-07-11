---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-70-left-arm-carry-log.md
---

# 左腕差し戻しcarry log 機能設計

> **L6 contract marker**: `analyzeLeftArmCarryLog(input) => LeftArmCarryResult`。
> pre: L7 PLAN、review evidence、resolution PLAN、再通過証拠を読める。post: finding単位の
> 差し戻しと再凍結を検証する。invariant: signature→L6/G6、API/Contract→L5/G5、architecture→L4/G4。

## 1. 目的

L7の3点レビューまたはG7で左腕設計との矛盾を発見した場合に、差し戻し先、設計Vペア差分、
対象gateの再通過、technical reviewを時系列で結合する。global gate ledgerの現在PASSだけでは
「finding発見後の再通過」を証明したことにしない。

## 2. 契約

enforcement後のterminal `impl/add-impl` PLANは`left_arm_carry`を必須とする。

- `decision=no_pushback`: `entries=[]`だけを許可する。
- `decision=pushback_resolved`: 1件以上のresolved entry、resolution PLAN、設計とtest-designの
  delta、対象gate green command、technical review bindingを要求する。
- draft PLANは未解決entryを保持できるが、terminal化時は全entryの再通過証拠を要求する。
- finding mappingは固定し、自由なlayer/gate指定を拒否する。

## 3. 機械可読形

```yaml
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: 2026-07-12T00:00:00Z
  review_binding:
    reviewer: reviewer-id
    reviewed_at: 2026-07-12T00:01:00Z
    evidence_digest: sha256:<64hex>
  entries: []
```

`pushback_resolved` entryは`carry_id`、`finding_kind`、`summary`、`detected_at`、
`finding_evidence`、`pushback_target`、`affected_artifacts`、`resolution_plan_id`、`gate_repass`を持つ。

## 4. Vペア

対象検証設計は`docs/test-design/harness/L8-unit-test-design.md`の`U-CARRY-001..016`。
実装PLANは`PLAN-L7-430-left-arm-carry-log`、検出器は`src/lint/left-arm-carry-log.ts`とする。
