---
title: "xhigh reasoning effort schema単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / QA
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md
pair_artifact: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md
---

# xhigh reasoning effort schema 単体テスト設計

## 対象

`docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md`のexact setとpolicy-bounded adaptationを検証する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-XHIGH-001 | team schemaのeffort exact set | `xhigh`はparse後も保持し、未知値はreject | `tests/team-schema.test.ts` |
| U-XHIGH-002 | policy導出前後のhigh／xhigh境界 | generic high→high、explicit xhigh→xhigh、tooSlow xhigh→highから逸脱したらfail | `tests/model-effort.test.ts` |
| U-XHIGH-003 | registry validatorのeffort exact set | `xhigh`はpass、未知値または旧3値validatorはfail | `tests/model-registry.test.ts` |

## mutation

exact setから`xhigh`を除去、generic highをxhighへ自動昇格させる、xhigh下降を壊す、validator message／setを
旧3値へ戻す変異を各oracleが検知することを確認する。
