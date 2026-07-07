---
plan_id: PLAN-L7-396-handover-derivation-wiring
title: "PLAN-L7-396-handover-derivation-wiring (impl): handover DB 導出の実配線 — helix handover / Stop hook での snapshot 再生成"
kind: impl
layer: L7
drive: be
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 PLAN-L6-57 step 3（実配線）の起票。Codex チャット側 cli.ts 作業の commit 後に着手"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-355-handover-db-derivation-impl の設計どおりの L7 実装。上位設計・schema の意味論は変更しない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/handover-db-derivation.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE (Codex se レーン) - handover/CLI 配線"
  - role: qa
    slot_label: "QA - drift 検出と note 保持の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-396-handover-derivation-wiring.md
    artifact_type: markdown_doc
  - artifact_path: tests/handover-derivation-wiring.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
  requires:
    - docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
review_evidence: []
---

# PLAN-L7-396-handover-derivation-wiring (impl): handover DB 導出の実配線 — helix handover / Stop hook での snapshot 再生成

## 0. 目的

PLAN-L7-355 で実装済みの `deriveHandoverSnapshot` / `renderCurrentPointer` /
`detectPointerDrift` を `helix handover` と Stop hook（session summary）に配線し、
CURRENT.json を自動生成 snapshot + takeover note 1 欄へ縮小する（PLAN-L6-57 §2/§3）。
derived field の手書き編集は drift warning として surface する。着手条件: Codex チャット側の
cli.ts in-flight 作業（PLAN-L7-357 系）が commit 済みであること（同 file 競合の回避）。
対象実装ファイルは既存 `src/handover/index.ts` であり、本 PLAN の draft 段階では生成済み deliverable として
`generates` に載せない。着手時に変更対象と新設テストを実体化してから generated artifact を追加する。

## 1. 受入条件

- 新設 test green + 既存関連 suite green（full 検証で退行 0）。
- oracle 行を pair test-design へ test 新設と同時に宣言（oracle-test-trace gate 準拠）。
- レビュー evidence 記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 宣言（Codex se レーンへ委譲）。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
