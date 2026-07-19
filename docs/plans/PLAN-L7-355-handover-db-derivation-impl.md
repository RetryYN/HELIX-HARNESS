---
plan_id: PLAN-L7-355-handover-db-derivation-impl
title: "PLAN-L7-355-handover-db-derivation-impl (impl): handover DB 導出の実装"
kind: impl
layer: L7
drive: be
status: confirmed
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
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T06:45:00+09:00"
    tests_green_at: "2026-07-07T06:38:48+09:00"
    verdict: approve_after_fixes
    worker_model: codex
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=reject → 是正後 approve。Critical: deriveHandoverSnapshot が plan_registry 射影（workflow_phase / version_target / 本文なし）で authority 判定を導出し fail-open → completionReadiness を構造的 blocker のみ（authorityScope=structural_only）に限定し authority 判定を非導出に是正。Important: layer file 未作成時に backup ENOENT で非 dryRun だけ落ちる非対称 → 空 file short-circuit を追加（U-MEMC-003b 回帰テスト新設）。Good: temp+rename atomic、backup 失敗時中止、deps.now() 注入で Date.now 直接依存なし。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/memory-compaction.test.ts tests/handover-db-derivation.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T06:38:48+09:00"
        evidence_path: tests/memory-compaction.test.ts
        output_digest: "sha256:7274b69b656f8294b9441ec0b261b6a93b66fa02fe2f58d29452da4a1e14e87b"
---

# PLAN-L7-355 (impl): handover DB 導出の実装

## 0. 目的

docs/design/harness/L6-function-design/handover-db-derivation.md の契約（deriveHandoverSnapshot / renderCurrentPointer / detectPointerDrift、U-HDRV-001..004）を実装し、test 新設と同時に pair test-design へ oracle 行を宣言する。

## 1. 受入条件

- 新設 test green、既存関連 suite green。
- oracle 行が pair test-design に宣言され test citation を持つ（oracle-test-trace gate green）。
- レビュー evidence 記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 行宣言。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
