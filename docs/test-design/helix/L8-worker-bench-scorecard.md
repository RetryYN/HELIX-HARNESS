---
title: "HELIX L8 単体テスト設計 — worker 受入ベンチ / スコアカード"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-07-19
updated: 2026-07-19
pair_artifact: docs/design/helix/L6-function-design/worker-bench-scorecard.md
owner: QA / TL
---

# worker 受入ベンチ / スコアカード 単体 oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WBENCH-001 | スモークセット機械採点 | 同一入力（順序違い含む）で digest が一致し、値変更で digest が変わる | `tests/worker-scorecard.test.ts` |
| U-WBENCH-002 | 委譲 evidence 集計 | 第 1 段 4 フィールドが model×task 分類の projection に現れ、欠損 evidence は fail-close | `tests/worker-scorecard.test.ts` |
| U-WBENCH-003 | 拡張性採点 | 「1 回目サイズ + 2 回目 diff + テスト green」の実測式のみ。green でない入力は採点不能、静的 rubric 経路なし | `tests/worker-scorecard.test.ts` |
