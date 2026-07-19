---
plan_id: PLAN-L7-395-visualization-treeview-prototype
title: "PLAN-L7-395-visualization-treeview-prototype (impl): VSCode Tree View prototype — Project/Harness 2 root の read-only 表示"
kind: impl
layer: L7
drive: fe
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 可視化 forward route の L7 降下（L4-52/L6-58/L7-372 confirmed 後の first surface 実装）"
created: 2026-07-07
updated: 2026-07-08
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
  - artifact_path: src/vscode/extension-adapter.ts
    artifact_type: source_module
  - artifact_path: src/vscode/extension-manifest.ts
    artifact_type: source_module
  - artifact_path: src/vscode/extension.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-treeview.test.ts
    artifact_type: test_code
  - artifact_path: tests/vscode-extension-adapter.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-58-visualization-view-model.md
  requires:
    - docs/plans/PLAN-L6-58-visualization-view-model.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-08T07:57:06+09:00"
    tests_green_at: "2026-07-08T07:57:06+09:00"
    verdict: approve
    worker_model: claude-sonnet-5 + codex
    reviewer_model: codex-intra-runtime
    scope: "Project/HARNESS 2 root の read-only Tree View、VSCode extension adapter、copy pointer command、Project current-location の ZIP/L12 fit 表示が実装済みで、対象テストと関連回帰で退行なしを確認した。"
    green_commands:
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:58d6182559414d8a12831ddad23bfb949d51944c5a78f49628e432870c90e0bd"
      - kind: unit_test
        command: "npx --no-install vitest run tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:973b345a06682be9837cef500c59358d9ddcbf54c4fd91d09fefdb1c6bda47e0"
---

# PLAN-L7-395-visualization-treeview-prototype (impl): VSCode Tree View prototype — Project/Harness 2 root の read-only 表示

## 0. 目的

PLAN-L4-52（surface/CSP/read-only 境界、confirmed）と PLAN-L7-372 の
`buildVisualizationViewModel`（confirmed）を用い、VSCode Tree View prototype を実装する。
scope: Tree View provider の view-model → TreeItem 変換（純関数、テスト可能な形で src/ に置く）、
Project/Harness 2 root、空状態 banner、CLI copy command 定義。extension packaging /
marketplace 配布・Webview graph panel は対象外（後続 PLAN）。root config 増殖は
repository-structure gate に従い、必要になった場合のみ専用 PLAN で扱う。

## 0.1 実装スライス

- `src/vscode/tree-view-provider.ts` を追加し、`VisualizationViewModel` から VSCode TreeItem 相当の
  `VisualizationTreeViewModel` へ変換する純関数を実装する。
- `helix progress tree-view --json` を追加し、VSCode extension が CLI 経由でも同じ read-only tree payload を
  取得できるようにする。
- `src/vscode/extension-adapter.ts` / `src/vscode/extension-manifest.ts` を追加し、VSCode API への
  TreeDataProvider 登録、refresh、copy pointer command、`onView` activation / view contribution 定義を
  実装する。VSIX packaging と marketplace 配布は引き続き対象外。

## 1. 受入条件

- 新設 test green + 既存関連 suite green（full 検証で退行 0）。
- oracle 行を pair test-design へ test 新設と同時に宣言（oracle-test-trace gate 準拠）。
- レビュー evidence 記録後に confirmed。2026-07-08 に Project current-location の ZIP/L12 fit 表示を追加し、
  `V-model fit` node が `helix vmodel fit --json` と同じ判定を表示することを確認した。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 宣言（fe-lead/fe-ui レーンへ委譲）。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
