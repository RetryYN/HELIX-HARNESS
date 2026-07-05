---
plan_id: PLAN-REVERSE-26-domain-boundary-lint
title: "PLAN-REVERSE-26 (reverse): back-fill domain-boundary lint"
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
    slot_label: "TL - domain-boundary back-fill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-26-domain-boundary-lint.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-27-domain-boundary-lint.md
  requires:
    - docs/plans/PLAN-L6-26-domain-boundary-lint.md
    - docs/plans/PLAN-L7-27-domain-boundary-lint.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 independent re-audit plus PO closure instruction; typecheck/lint/vitest/doctor green before confirmation; add-feature triad closed without content changes."
---

# PLAN-REVERSE-26（reverse）back-fill domain-boundary lint の記録

## §0 位置づけ

IMP-097 の Reverse 側を記録する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-26-domain-boundary-lint.md`
- `docs/plans/PLAN-L7-27-domain-boundary-lint.md`

実装:

- DDD domain-boundary enforcement の reverse trace を保持する。

## §3 工程表

### Step 1: [並列] observed gap の記録

DDD boundary checking が manual-review-only だったことを記録する。

### Step 2: [直列] Forward PLAN 接続

直列理由: downstream_dependency。L6/L7 PLAN ID が確定した後にだけ Reverse を close できる。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に backfill lint と doctor が green である必要がある。

## §6 用語更新

- **DDD/TDD back-fill**: DDD/TDD strictness automation の Reverse trace。

## §8 DoD

- [x] PLAN-L7-27 requires this Reverse PLAN.
- [x] backfill doctor がこの add-impl を orphan として報告しない。
