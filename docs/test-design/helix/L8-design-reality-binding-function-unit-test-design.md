---
title: "Design Reality Binding L6関数単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/design/helix/L6-function-design/design-reality-binding.md
related_l5_test_design: docs/test-design/helix/L8-design-reality-binding-unit-test-design.md
---

# Design Reality Binding L6関数単体テスト設計

この成果物はL6関数境界のpairを担い、failure意味契約の詳細oracleは関連L5/L8テスト設計を再利用する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRB-FN-001 | `analyzeDesignRealityBinding` | typed asset、source digest、failure witnessを一括検査しfindingを相殺しない | `tests/design-reality-binding.test.ts` |
| U-DRB-FN-002 | `evaluateFailureWitness`相当の純粋評価 | identity解決後のcapability mismatchが宣言reasonへ到達する | `tests/design-reality-binding.test.ts` |
| U-DRB-FN-003 | `designRealityBindingMessages` | PLAN lintとdoctorが同一finding集合をfail-close表示する | `tests/design-reality-binding.test.ts` |
| U-DRB-025 | `analyzeDesignRealityBinding`の空binding baseline境界 | baseline外の新規空bindingが`empty_failure_binding_not_in_baseline`として未検出にならない | `tests/design-reality-binding.test.ts` |
| U-DRB-026 | 既知baselineと本文failure方針のadvisory分離 | doctor表示が既知負債をhard failureへ誤昇格しない | `tests/design-reality-binding.test.ts` |
| U-DRB-027 | baseline集合のコード固定初期集合との比較 | 設定ファイルだけでbaselineを拡張できない | `tests/design-reality-binding.test.ts` |
| U-DRB-028 | 現行repositoryの空binding件数とbaseline digest照合 | 空bindingの追加・baseline driftを見逃さない | `tests/design-reality-binding.test.ts` |
| U-DRB-029 | baseline外拒否分岐のmutation oracle | 拒否分岐を除去した実装がU-DRB-025でRedになる | `tests/design-reality-binding.test.ts` |

実行oracleは`tests/design-reality-binding.test.ts`のU-DRB-001〜011へ束縛し、特にU-DRB-011で6つの実branch mutationがRedになることを要求する。
