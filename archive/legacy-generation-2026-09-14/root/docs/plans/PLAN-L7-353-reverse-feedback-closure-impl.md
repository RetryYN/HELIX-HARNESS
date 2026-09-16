---
plan_id: PLAN-L7-353-reverse-feedback-closure-impl
title: "PLAN-L7-353 (impl): リバース駆動フィードバック閉塞の実装 — doc oracle / reverse-candidates / feedback 配線"
kind: impl
layer: L7
drive: be
status: confirmed
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
    artifact_type: source_module
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
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T06:20:00+09:00"
    tests_green_at: "2026-07-07T06:13:03+09:00"
    verdict: approve
    worker_model: claude-fable
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=approve-with-notes（Important 2 / Minor 1）。Important: (1) PLAN 実体未起票の参照 → PLAN-L6-59/PLAN-L7-353 起票で解消、(2) pair test-design への oracle 未宣言 → U-APDOC-001..004 / U-RVC-001..003 を宣言し test citation 済み。Minor: docStatusForPath の frontmatter 簡易走査 → 安全側（yellow 落ち）である旨を設計 doc に注記。red 優先の fail-close 維持と query-only 導出を確認。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/reverse-feedback-closure.test.ts --project fast"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T06:13:03+09:00"
        evidence_path: tests/reverse-feedback-closure.test.ts
        output_digest: "sha256:2deeac0213fcad68486db1c45c0eec3383a870f432c2ac4cf0f760a3b9426e02"
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
