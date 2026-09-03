---
title: "Issue native graph projection 単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
authority: docs/design/helix/L5-detail/issue-native-graph-projection.md
plan: docs/plans/PLAN-RECOVERY-103-issue-native-graph-projection.md
pair_artifact: docs/design/helix/L5-detail/issue-native-graph-projection.md
---

# Issue native graph projection 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-IHIER-018 | `auditIssueNativeGraphProjection` | bodyにだけ存在するparent／child／dependencyとnative-only dependencyを個別findingへ分解する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-019 | `auditIssueNativeGraphProjection` | pagination不完了、stable node ID欠落、body-governed Issue欠落を推測せず拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-020 | `auditIssueNativeGraphProjection` | exact graphは入力順と重複edgeによらずgreenかつ同一digestになる | `tests/issue-hierarchy.test.ts` |

## Mutation

pagination完了検査を除去するとU-IHIER-019がRedになること、dependency missing比較を除去すると
U-IHIER-018がRedになることを確認する。
