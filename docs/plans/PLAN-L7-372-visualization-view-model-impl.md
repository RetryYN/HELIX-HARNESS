---
plan_id: PLAN-L7-372-visualization-view-model-impl
title: "PLAN-L7-372 (impl): 可視化 view-model の実装 — 6 view builder / Mermaid 互換 graph IR / snapshot 拡張 field"
kind: impl
layer: L7
drive: fe
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 進めて（PLAN-L6-58 step 3 の実装解禁、Tree View prototype の前提）"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-58 の設計どおりの L7 実装。VisualizationSnapshot 既存 field の意味は変えず、L6 契約の拡張 field と純関数 view-model を追加する。"
owner: Claude (Fable)
parent_design: docs/design/helix/L6-function-design/visualization-view-model.md
pair_artifact: docs/test-design/helix/visualization-view-model.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: uiux
    slot_label: "FE lead (Opus) - 実装分割とレビュー主導"
  - role: se
    slot_label: "fe-ui (Sonnet) - view-model builder 実装 worker"
generates:
  - artifact_path: docs/plans/PLAN-L7-372-visualization-view-model-impl.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/visualization-view-model.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-view-model.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-58-visualization-view-model.md
  requires:
    - docs/plans/PLAN-L6-58-visualization-view-model.md
  references:
    - src/state-db/visualization-read-model.ts
review_evidence: []
---

# PLAN-L7-372 (impl): 可視化 view-model の実装

## 0. 目的

PLAN-L6-58 の契約（`buildVisualizationViewModel` 純関数、Project/Harness 2 root × 6 view builder、
Mermaid 互換 graph IR、pair フィルタ済み count / view 別空状態 warnings / growth 時系列 series の
snapshot 拡張 field）を TS で実装し、Tree View prototype（後続 PLAN）のデータ層を完成させる。

## 1. 受入条件

- `bunx vitest run tests/visualization-view-model.test.ts --project fast` green
  （U-VVM 系 oracle を test 名に含め、pair test-design へ oracle 行を同時宣言）。
- 純関数性（同一 snapshot → deep equal、DB 再クエリ・時刻依存なし）と count 一致 oracle。
- レビュー evidence 記録後に confirmed（L6-58 confirmed が前提、plan-descent gate）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6-58 レビュー→confirm 後、fe-lead/fe-ui で実装 + test 新設。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
