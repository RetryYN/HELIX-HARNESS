---
title: "Design Reality Binding L6関数単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L7-498-design-reality-binding.md
pair_artifact: docs/design/helix/L6-function-design/design-reality-binding.md
related_l5_test_design: docs/test-design/helix/L8-design-reality-binding-unit-test-design.md
---

# Design Reality Binding L6関数単体テスト設計

この成果物はL6関数境界のpairを担い、failure意味契約の詳細oracleは関連L5/L8テスト設計を再利用する。

| oracle | 関数境界 | 完了条件 |
|---|---|---|
| U-DRB-FN-001 | `analyzeDesignRealityBinding` | typed asset、source digest、failure witnessを一括検査しfindingを相殺しない |
| U-DRB-FN-002 | `evaluateFailureWitness`相当の純粋評価 | identity解決後のcapability mismatchが宣言reasonへ到達する |
| U-DRB-FN-003 | `designRealityBindingMessages` | PLAN lintとdoctorが同一finding集合をfail-close表示する |

実行oracleは`tests/design-reality-binding.test.ts`のU-DRB-001〜011へ束縛し、特にU-DRB-011で6つの実branch mutationがRedになることを要求する。
