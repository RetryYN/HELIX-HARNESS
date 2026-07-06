---
plan_id: PLAN-L7-355-handover-db-derivation-impl
title: "PLAN-L7-355-handover-db-derivation-impl (impl): handover DB 導出の実装"
kind: impl
layer: L7
drive: be
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 さっさとやってくれ（PLAN-L6-57-handover-db-derivation step 2 の実装解禁）"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-57-handover-db-derivation の L6 設計どおりの L7 実装。schema・意味論の変更なし。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/handover-db-derivation.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - 実装 + test 新設"
  - role: qa
    slot_label: "QA - oracle 網の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
    artifact_type: markdown_doc
  - artifact_path: src/handover/handover-derivation.ts
    artifact_type: source_module
  - artifact_path: tests/handover-db-derivation.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-57-handover-db-derivation.md
  requires:
    - docs/plans/PLAN-L6-57-handover-db-derivation.md
review_evidence: []
---

# PLAN-L7-355-handover-db-derivation-impl (impl)

## 0. 目的

docs/design/harness/L6-function-design/handover-db-derivation.md の契約（deriveHandoverSnapshot / renderCurrentPointer / detectPointerDrift、U-HDRV-001..004）を実装し、test 新設と同時に pair test-design へ oracle 行を宣言する。

## 1. 受入条件

- 新設 test green、既存関連 suite green。
- oracle 行が pair test-design に宣言され test citation を持つ（oracle-test-trace gate green）。
- レビュー evidence 記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 行宣言。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
