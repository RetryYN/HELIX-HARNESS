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
| writer集約 | CLIまたはcommit hookがactivation要求 | `activatePlan`を必ず経由 | invalid inferred IDは警告のみでmarker不変 |
| raw writer非公開 | module利用者がPLAN markerを変更 | `activatePlan`または`clearActivePlan`だけを公開 | 未検証文字列を書けるAPIを公開しない |
| event attribution | explicit/state/branchからPLAN候補を得る | productionではcanonical exact matchだけをeventへ付与。不正値は`null` | orphan IDを新規生成しない |
| historical orphan | fix前watermark以前の曖昧截断event | raw rowを保持しhistorical unresolvedと分類 | 推測remap・削除をしない。`2026-07-11T19:25:50.062Z`以降はnew orphan 0 |

## 3. Vペア

- 右腕正本: `docs/test-design/harness/L8-unit-test-design.md`
- oracle: `U-APSEL-001..006`
- test: `tests/session-log.test.ts`
