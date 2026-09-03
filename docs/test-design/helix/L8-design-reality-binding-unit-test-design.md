---
title: "Design Reality Binding L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-09-04
owner: QA
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/design/helix/L5-detail/design-reality-binding.md
related_l6: docs/design/helix/L6-function-design/design-reality-binding.md
---

# Design Reality Binding L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRB-001 | exact path/export/digest | missing path、別symbol、digest drift | `tests/design-reality-binding.test.ts` |
| U-DRB-002 | 実在export | `PythonWorkerRegistry`という非実在・類似名 | `tests/design-reality-binding.test.ts` |
| U-DRB-003 | planned/compatibility typed境界 | current runtime/authorityへの誤昇格 | `tests/design-reality-binding.test.ts` |
| U-DRB-004 | identity 2-tuple | capability込みidentityでmismatchがNOT_FOUND化 | `tests/design-reality-binding.test.ts` |
| U-DRB-005 | capability別検証 | post-check除去mutationがOK化しない | `tests/design-reality-binding.test.ts` |
| U-DRB-006 | executable reason assertion | comment、文字列、`toContain()`だけのoracle | `tests/design-reality-binding.test.ts` |
| U-DRB-007 | PLAN lint／doctor共通解析器 | stale digestを片方だけgreenにする結線drift | `tests/design-reality-binding.test.ts` |
| U-DRB-008 | planned未実装／current authority境界 | 実在済みplanned、archive／migrationのexisting昇格 | `tests/design-reality-binding.test.ts` |
| U-DRB-009 | source callとreason assertionの同一expect束縛 | 未使用import／hardcoded reasonの偽green | `tests/design-reality-binding.test.ts` |
| U-DRB-010 | declared failureとwitnessの双方向exact set | 未witness、余剰、重複reason | `tests/design-reality-binding.test.ts` |
| U-DRB-011 | 実runtime branchを一時moduleで除去し対応Vitest oracleを実行 | 6 mutantのいずれかがgreenで生存 | `tests/design-reality-binding.test.ts` |
| U-DRB-025 | failure bindingを空へ変異し、baseline外の新規負債を拒否 | `empty_failure_binding_not_in_baseline` が未検出 | `tests/design-reality-binding.test.ts` |
| U-DRB-026 | 既知baselineと本文failure方針をadvisoryへ分離 | doctor表示がhard failureへ誤昇格 | `tests/design-reality-binding.test.ts` |
| U-DRB-027 | baseline集合の追加をコード固定初期集合と比較 | 設定ファイルだけでbaselineを拡張 | `tests/design-reality-binding.test.ts` |
| U-DRB-028 | 現行repositoryの空binding件数とbaseline digestを照合 | 空bindingの追加・baseline driftを見逃す | `tests/design-reality-binding.test.ts` |
| U-DRB-029 | baseline外拒否分岐の実装mutationを実行 | 除去した分岐がU-DRB-025をRedにしない | `tests/design-reality-binding.test.ts` |
