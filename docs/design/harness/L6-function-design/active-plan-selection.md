---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-68-active-plan-selection.md
---

> **L6 contract marker**: `selectActivePlanId(requested, canonicalPlanIds) => ActivePlanSelection`
> はactive PLAN選択のunit-test粒度契約。pre: canonical PLAN ID集合を読める。post: exact matchだけを
> current-planへ書き、未知・截断・空IDは書込前に拒否する。

# Active PLAN選択整合性機能設計

## 1. 目的

`helix plan use <id>`が未検証文字列を`.helix/state/current-plan`へ保存し、以後のhook eventを
orphan PLANへ恒久的に誤登録する経路を閉じる。session hook自体のfail-open観測契約は変更せず、
明示的な状態変更commandである`plan use`だけをfail-closeにする。

## 2. 契約

| 契約 | 事前条件 | 事後条件 | 不変条件 |
|---|---|---|---|
| exact selection | `docs/plans/*.md`からcanonical ID集合を取得 | exact matchのみ受理 | slugを含む完全IDを保存 |
| truncated rejection | 未知IDを入力 | exit 1、current-plan非変更、prefix候補を最大10件提示 | 候補を自動選択しない |
| unavailable registry | canonical集合が空 | exit 1、current-plan非変更 | 検証不能を成功扱いしない |
| clear | `--clear`を明示 | current-planを削除 | registry照合を要求しない |

## 3. Vペア

- 右腕正本: `docs/test-design/harness/L8-unit-test-design.md`
- oracle: `U-APSEL-001..003`
- test: `tests/session-log.test.ts`
