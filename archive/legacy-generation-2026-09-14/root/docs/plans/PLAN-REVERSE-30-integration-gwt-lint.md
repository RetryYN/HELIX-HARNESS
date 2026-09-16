---
plan_id: PLAN-REVERSE-30-integration-gwt-lint
title: "PLAN-REVERSE-30 (reverse): integration-gwt lint の back-fill"
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
    slot_label: "TL - integration GWT back-fill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-30-integration-gwt-lint.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-31-integration-gwt-lint.md
  requires:
    - docs/plans/PLAN-L6-30-integration-gwt-lint.md
    - docs/plans/PLAN-L7-31-integration-gwt-lint.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 independent re-audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は content 変更なしで close。"
---

# PLAN-REVERSE-30 (reverse): integration-gwt lint の back-fill

## §0 位置づけ

IMP-101 の Reverse 側を記録する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-30-integration-gwt-lint.md`
- `docs/plans/PLAN-L7-31-integration-gwt-lint.md`

実装:

- integration-gwt の reverse trace を保持する。

## §3 工程表

### Step 1: [並列] 観測 gap 記録

L8 GWT 粒度が機械的に強制されていなかったことを記録する。

### Step 2: [直列] Forward PLAN 接続

直列理由: downstream_dependency。L6/L7 PLAN ids が固定された後にだけ Reverse を close できる。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に backfill lint と doctor が green でなければならない。

## §6 用語更新

- **DDD/TDD back-fill**: DDD/TDD strictness automation の Reverse trace。

## §8 DoD

- [x] PLAN-L7-31 はこの Reverse PLAN を requires に含める。
