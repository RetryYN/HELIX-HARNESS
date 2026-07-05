---
plan_id: PLAN-REVERSE-24-structured-error-handling
title: "PLAN-REVERSE-24 (reverse): structured error-handling rule の back-fill"
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
    slot_label: "TL - structured error rule back-fill 担当"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-24-structured-error-handling.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-25-structured-error-handling.md
  requires:
    - docs/plans/PLAN-L6-24-structured-error-handling.md
    - docs/plans/PLAN-L7-25-structured-error-handling.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立 re-audit と PO の closure instruction。confirmation 前に typecheck/lint/vitest/doctor green を確認。add-feature triad は content changes なしで close 済み。"
---

# PLAN-REVERSE-24 (reverse): structured error-handling rule の back-fill

## §0 位置づけ

IMP-095 の Reverse trace を記録し、実装が governance design から orphan にならないようにする。

## §3.1 実装計画（情報源）

情報源:

- `docs/plans/PLAN-L6-24-structured-error-handling.md`
- `docs/plans/PLAN-L7-25-structured-error-handling.md`

実装:

- Reverse trace はこの PLAN と、PLAN-L7-25 からの `requires` edge で構成する。

## §3 工程表

### Step 1: [並列] 観測 gap 記録

manual-review-only の error handling を coding-rule gap として記録する。

### Step 2: [直列] Forward PLAN 接続

直列理由: downstream_dependency。Reverse は L6/L7 PLAN ids の確定後にのみ close できる。

### Step 3: [直列] レビュー

直列理由: downstream_dependency。review 前に backfill / doctor が green である必要がある。

## §6 用語更新

- **error-handling back-fill**: structured error handling rule を PLAN trace に戻す Reverse 記録。

## §8 完了条件 (DoD)

- [x] PLAN-L7-25 がこの Reverse PLAN を require している。
- [x] backfill doctor がこの add-impl を orphan として報告しない。
