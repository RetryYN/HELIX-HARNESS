---
plan_id: PLAN-L7-353-reverse-feedback-closure-impl
title: "PLAN-L7-353 (impl): リバース駆動フィードバック閉塞の実装 — doc oracle / reverse-candidates / feedback 配線"
kind: impl
layer: L7
drive: be
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 「リバース駆動モデルが実行されずデータベースで赤になるパターン多くないか？直して最適化してくれ」"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-59 の設計どおりの L7 実装。schema・workflow 意味論の変更なし。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/reverse-feedback-closure.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - decision/projection/CLI 実装"
  - role: qa
    slot_label: "QA - oracle 網（U-APDOC/U-RVC）の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-353-reverse-feedback-closure-impl.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/reverse-candidates.ts
    artifact_type: source_code
  - artifact_path: tests/reverse-feedback-closure.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-59-reverse-feedback-closure.md
  requires:
    - docs/plans/PLAN-L6-59-reverse-feedback-closure.md
  references:
    - src/state-db/artifact-progress-decision.ts
    - src/state-db/projection-writer.ts
    - src/state-db/feedback-projections.ts
review_evidence: []
---

# PLAN-L7-353 (impl): リバース駆動フィードバック閉塞の実装

## 0. 目的

PLAN-L6-59 の設計 3 規則を実装する。変更 file:

- `src/state-db/artifact-progress-decision.ts`: `DOC_ARTIFACT_TYPES` + docStatus 分岐（red 優先維持）。
- `src/state-db/projection-writer.ts`: docStatus index（plan_registry + frontmatter）読み取りと配線。
- `src/state-db/reverse-candidates.ts`（新規）: `collectReverseCandidates(db)` 導出。
- `src/state-db/feedback-projections.ts`: info findings の feedback 流入停止、赤 next_action の reverse 誘導化。
- `src/cli.ts`: `helix feedback reverse-candidates [--json]`。
- `tests/reverse-feedback-closure.test.ts`（新規）: U-APDOC-001..004 / U-RVC-001..003。

## 1. 受入条件

- `bunx vitest run tests/reverse-feedback-closure.test.ts --project fast` green（7 oracle）。
- 既存 projection 系 suite（db-projection-ingestion / projection-writer / feedback-surface /
  legacy-adoption）green。
- `helix db rebuild` 後の実 repo で doc 系永続 yellow が解消される（設計 §3 の実測記録）。
- レビュー evidence（intra_runtime_subagent 以上）記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + pair test-design へ oracle 行宣言。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
