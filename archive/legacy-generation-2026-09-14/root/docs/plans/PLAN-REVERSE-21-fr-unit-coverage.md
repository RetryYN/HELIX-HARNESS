---
plan_id: PLAN-REVERSE-21-fr-unit-coverage
title: "PLAN-REVERSE-21 (reverse): L6 FR coverage back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "L6 FR coverage は既存 FR-L1 registry の closure gate 化であり、新規 requirements は追加しない。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "coverage rule は L6 function design / L7 unit oracle の整合補正であり、L4 基本構造は変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "coverage rule は doc/test trace gate であり、L5 物理データ・内部処理 schema は変更しない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "FR coverage を L6 closure rule として function-spec へ戻した。"
  - layer: L7-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-FR-L1-* を Red entry contract として L7 unit test design へ戻した。"
agent_slots:
  - role: tl
    slot_label: "TL - L6 coverage back-fill review"
generates:
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-22-fr-unit-coverage.md
  requires:
    - docs/plans/PLAN-L7-22-fr-unit-coverage.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:58:00+09:00"
    reviewed_at: "2026-06-09T17:00:00+09:00"
    verdict: approve
    scope: "L6 FR coverage reverse back-fill reviewed after lint/typecheck/vitest/doctor green; add-impl pairing closed."
---

# PLAN-REVERSE-21 (reverse): L6 FR coverage の戻し込み (back-fill)

## §0 位置づけ

L7 lint 実装で確定した coverage rule を L6 function-spec と L7 unit-test design へ戻す Reverse fullback。L1 FR registry の現行 FR-L1 47 件の coverage を L6 closure gate として扱う。

## §2 工程表

### Step 1: [並列] R0 証跡収集 (evidence collection)

`fr-unit-coverage.md`、`l6-fr-coverage.ts`、`l6-fr-coverage.test.ts` を証跡 (evidence) とする。

### Step 2: [直列] L6 design への戻し込み (back-fill)

直列理由: downstream_dependency。R0 証跡 (evidence) を L6 function-spec closure rule に戻す。

### Step 3: [直列] L7 test-design への戻し込み (back-fill)

直列理由: downstream_dependency。L6 closure rule を L7 Red entry contract に接続する。

### Step 4: [直列] レビュー (review)

直列理由: downstream_dependency。doctor green 後に review を行う。

## §6 用語更新

- **L6 FR unit coverage**: PLAN-L6-21 で導入した coverage matrix。L0 glossary への back-merge 対象。

## §8 DoD

- [x] L6 function-spec が FR coverage を L6 closure rule として明示する。
- [x] L7 unit test design が U-FR-L1-* を Red entry contract として明示する。
- [x] Reverse が PLAN-L7-22 を requires に持ち、add-impl を orphaned にしない。
- [x] lint / typecheck / vitest / doctor / review が green である。
