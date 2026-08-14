---
title: "workflow分類typed routing機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
plan: docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-typed-routing-unit-test-design.md
---

# workflow分類typed routing機能設計

## 責務

requirementsから生成された`workflow-classification-catalog.v1`の`signal_bindings`だけを使い、観測signalを
typed axisとidentityの組へ分類する。共通route identity、旧`mode`、旧`model`、旧`route_class`をcurrent出力へ
再生成しない。

## 契約

- `U-WFROUTE-001`: 最長一致したsignal bindingを`target_axis`と`target_id`へ無損失で返す。
- `U-WFROUTE-002`: `unresolved_until_decision`はidentityを確定せず`decision_required`でfail-closeする。
- `U-WFROUTE-003`: 同一precedenceで複数のtyped identityが成立する入力を推測せず`ambiguous`で拒否する。
- `U-WFROUTE-004`: unknownまたは旧identity文字列をlegacy routeへ推測変換しない。

## 境界

本sliceはcurrent typed resolverを追加する。既存`routeSignalToMode`、`RouteEvalResult.mode`、route-map YAML、
approval policyのlegacy入力隔離とCLI／DB consumer切替は後続sliceで行う。後続は本resolverを唯一のcurrent
分類境界として利用し、legacy adapterからcurrent出力への逆流を禁止する。
