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

`docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md`のexact setとadaptive ladderを検証する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-XHIGH-001 | team schemaのeffort exact set | `xhigh`はparse後も保持し、未知値はreject | `tests/team-schema.test.ts` |
| U-XHIGH-002 | adaptive ladderのhigh／xhigh境界 | high→xhigh、xhigh→xhigh、xhigh→highから逸脱したらfail | `tests/model-effort.test.ts` |
| U-XHIGH-003 | registry validatorのeffort exact set | `xhigh`はpass、未知値または旧3値validatorはfail | `tests/model-registry.test.ts` |

## mutation

exact setから`xhigh`を除去、ladder末尾を`high`へ戻す、validator message／setを旧3値へ戻す変異を各oracleが
検知することを確認する。
