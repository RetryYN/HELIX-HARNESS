---
plan_id: PLAN-L6-59-reverse-feedback-closure
title: "PLAN-L6-59 (add-design): リバース駆動フィードバック閉塞の機能設計 — doc oracle 分離 / reverse 候補導出 / telemetry 最適化"
kind: add-design
layer: L6
drive: be
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-07 「リバース駆動モデルが実行されずデータベースで赤になるパターン多くないか？直して最適化してくれ。ちゃんとリバースするように」"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "artifact_progress / findings / feedback_events の既存 schema と Reverse workflow の意味論は変更せず、oracle の適用誤り是正と導出・配線の追加のみ。上位要求の変更なし。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-44-harness-db-master.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - doc oracle 分離と reverse 候補導出の機能設計"
  - role: tl
    slot_label: "TL - fail-close 維持（red 優先・捏造 green 禁止）のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-59-reverse-feedback-closure.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/reverse-feedback-closure.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-44-harness-db-master.md
  references:
    - src/state-db/artifact-progress-decision.ts
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

# PLAN-L6-59 (add-design): リバース駆動フィードバック閉塞の機能設計

## 0. 目的

DB の赤/黄が Reverse workflow へ接続されず堆積する問題（PO 指摘 2026-07-07）を、
(1) doc 系 artifact の検証 oracle 分離、(2) reverse 起票候補の deterministic 導出、
(3) info 級 telemetry の feedback 流入停止、の 3 点で設計する。
設計正本 = `docs/design/harness/L6-function-design/reverse-feedback-closure.md`。

## 1. スコープ

- doc oracle: `DOC_ARTIFACT_TYPES` は docStatus（registry/frontmatter）で green/yellow を判定。
  red（open dependency impact）は全 type で最優先を維持。
- reverse 候補: `collectReverseCandidates(db)` + `helix feedback reverse-candidates` + 赤 next_action 配線。
- telemetry: severity=info findings は feedback_events へ流さない（findings table には残す）。

## 2. 対象外

- Reverse workflow（R0..R4）自体の工程定義変更。
- findings / artifact_progress schema 変更。
- reverse PLAN の自動起票（候補提示まで。起票は AI/PO の判断操作）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc + pair test-design 追記。
- step 2 (mode: serial): L7 実装（PLAN-L7-353、test 同時新設）。
- step 3 (mode: serial): レビュー → 是正 → confirmed。

## 4. 受入条件

- L6 設計 doc が §2 の 3 規則を oracle 付きで規定し、pair test-design と 1:1。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-59-reverse-feedback-closure.md` green。
- レビュー evidence 記録後に confirmed。
