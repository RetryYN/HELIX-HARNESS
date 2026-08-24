---
title: "既存artifact修正sliceのPLAN所有権 L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-24
updated: 2026-08-24
owner: QA / TL
plan: docs/plans/PLAN-L7-665-plan-modification-ownership.md
pair_artifact: docs/design/helix/L6-function-design/plan-modification-ownership.md
---

# 既存artifact修正sliceのPLAN所有権 L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PLANMOD-001 | plan-descent / V-pair | `generates`にtest_codeが無くても、既存testを`modifies`へ記録しoracle bindingを持つPLANは受理する | `tests/plan-modification-ownership.test.ts` |
| U-PLANMOD-002 | relation graph | `modifies`を持つPLANが既存sourceへの`modifies` edgeを生成し、`generates` edgeと混同しない | `tests/plan-modification-ownership.test.ts` |
| U-PLANMOD-003 | frontmatter | `modifies`のpath/typeをtypedに保持し、`generates`の値を上書きしない | `tests/plan-modification-ownership.test.ts` |
| U-PLANMOD-004 | completion boundary | `modifies`相当の既存pathではdraft `merged-plan-status`を発火させず、`generates`のdraft違反は従来どおり検出する | `tests/plan-modification-ownership.test.ts` |

`modifies`は既存artifactの修正traceであり、review evidence、status confirm、completion claimの代替ではない。
