---
title: "AI判断proposal authority L8詳細テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: detail-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/design/helix/L5-detail/ai-decision-proposal-authority.md
---

# AI判断proposal authority L8詳細テスト設計

| D-ID | 詳細契約 | 局所oracle |
|---|---|---|
| D-UWPROP-001 | 判断chain exact field | 各field削除を`schema_invalid`へ変換 |
| D-UWPROP-002 | enabled candidate参照 | scored/fallbackの未知・disabled参照を拒否 |
| D-UWPROP-003 | 実行可能性式 | policy、unresolved、oracle、verifierの各違反で`ok=false` |
