---
plan_id: PLAN-REVERSE-27-invariant-test-trace
title: "PLAN-REVERSE-27 (reverse): invariant-test-trace の back-fill"
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
    slot_label: "TL - invariant trace back-fill 対応"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-27-invariant-test-trace.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-28-invariant-test-trace.md
  requires:
    - docs/plans/PLAN-L6-27-invariant-test-trace.md
    - docs/plans/PLAN-L7-28-invariant-test-trace.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO の closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで close。"
---

# PLAN-REVERSE-27 (reverse): invariant-test-trace の back-fill

## §0 位置付け

IMP-098 に対する Reverse 側の記録を残す。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-27-invariant-test-trace.md`
- `docs/plans/PLAN-L7-28-invariant-test-trace.md`

実装:

- invariant-test-trace の reverse trace を維持する。

## §3 工程表

### Step 1: [並列] observed gap の記録

invariant trace が以前は machine-checkable ではなかったことを記録する。

### Step 2: [直列] Forward PLAN との接続

直列理由: downstream_dependency。L6/L7 PLAN ids が確定した後にのみ Reverse を close できる。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に backfill lint と doctor が green である必要がある。

## §6 用語更新

- **DDD/TDD back-fill**: DDD/TDD strictness automation のための Reverse trace。

## §8 DoD

- [x] PLAN-L7-28 はこの Reverse PLAN を必要とする。
