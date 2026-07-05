---
plan_id: PLAN-REVERSE-29-test-oracle-strength
title: "PLAN-REVERSE-29 (reverse): test-oracle-strength の back-fill"
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
agent_slots:
  - role: tl
    slot_label: "TL - test oracle strength back-fill 対応"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-29-test-oracle-strength.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-30-test-oracle-strength.md
  requires:
    - docs/plans/PLAN-L6-29-test-oracle-strength.md
    - docs/plans/PLAN-L7-30-test-oracle-strength.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は content 変更なしで close 済み。"
---

# PLAN-REVERSE-29 (reverse): test-oracle-strength の back-fill

## §0 位置づけ

IMP-100 の Reverse 側を記録する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-29-test-oracle-strength.md`
- `docs/plans/PLAN-L7-30-test-oracle-strength.md`

実装:

- test-oracle-strength の reverse trace を保持する。

## §3 工程表

### Step 1: [並列] observed gap の記録

弱い test oracle 検出が不足していたことを記録する。

### Step 2: [直列] Forward PLAN との接続

直列理由: downstream_dependency。L6/L7 PLAN ids が確定した後にのみ Reverse を close できる。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に backfill lint と doctor が green である必要がある。

## §6 用語更新

- **DDD/TDD back-fill**: DDD/TDD strictness automation の Reverse trace。

## §8 DoD

- [x] PLAN-L7-30 がこの Reverse PLAN を要求している。
