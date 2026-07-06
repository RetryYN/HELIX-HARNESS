---
plan_id: PLAN-L7-395-visualization-treeview-prototype
title: "PLAN-L7-395-visualization-treeview-prototype (impl): VSCode Tree View prototype — Project/Harness 2 root の read-only 表示"
kind: impl
layer: L7
drive: fe
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 可視化 forward route の L7 降下（L4-52/L6-58/L7-372 confirmed 後の first surface 実装）"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-58-visualization-view-model の設計どおりの L7 実装。上位設計・schema の意味論は変更しない。"
owner: Claude (Fable)
parent_design: docs/design/helix/L6-function-design/visualization-view-model.md
pair_artifact: docs/test-design/helix/visualization-view-model.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: uiux
    slot_label: "FE lead (Opus) - extension scaffold と分割"
  - role: se
    slot_label: "fe-ui (Sonnet) - Tree View provider 実装 worker"
generates:
  - artifact_path: docs/plans/PLAN-L7-395-visualization-treeview-prototype.md
    artifact_type: markdown_doc
  - artifact_path: src/vscode/tree-view-provider.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-treeview.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-58-visualization-view-model.md
  requires:
    - docs/plans/PLAN-L6-58-visualization-view-model.md
review_evidence: []
---

# PLAN-L7-395-visualization-treeview-prototype (impl): VSCode Tree View prototype — Project/Harness 2 root の read-only 表示

## 0. 目的

PLAN-L4-52（surface/CSP/read-only 境界、confirmed）と PLAN-L7-372 の
`buildVisualizationViewModel`（confirmed）を用い、VSCode Tree View prototype を実装する。
scope: Tree View provider の view-model → TreeItem 変換（純関数、テスト可能な形で src/ に置く）、
Project/Harness 2 root、空状態 banner、CLI copy command 定義。extension packaging /
marketplace 配布・Webview graph panel は対象外（後続 PLAN）。root config 増殖は
repository-structure gate に従い、必要になった場合のみ専用 PLAN で扱う。

## 1. 受入条件

- 新設 test green + 既存関連 suite green（full 検証で退行 0）。
- oracle 行を pair test-design へ test 新設と同時に宣言（oracle-test-trace gate 準拠）。
- レビュー evidence 記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 宣言（fe-lead/fe-ui レーンへ委譲）。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
