---
plan_id: PLAN-REVERSE-25-module-boundary-rule
title: "PLAN-REVERSE-25 (reverse): module-boundary rule の逆方向補完"
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
    slot_label: "TL - module-boundary rule 逆方向補完"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-25-module-boundary-rule.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-26-module-boundary-rule.md
  requires:
    - docs/plans/PLAN-L6-25-module-boundary-rule.md
    - docs/plans/PLAN-L7-26-module-boundary-rule.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO closure instruction。confirmation 前に typecheck/lint/vitest/doctor green を確認し、add-feature triad は content change なしで close。"
---

# PLAN-REVERSE-25 (reverse): module-boundary rule の逆方向補完

## §0 位置づけ

IMP-096 の実装が governance design から孤立しないように、Reverse trace を記録する。

## §3.1 実装計画（情報源）

情報源:

- `docs/plans/PLAN-L6-25-module-boundary-rule.md`
- `docs/plans/PLAN-L7-26-module-boundary-rule.md`

実装:

- Reverse trace は、この PLAN と PLAN-L7-26 からの `requires` edge で構成する。

## §3 工程表

### Step 1: [並列] 観測した gap の記録

manual review のみで実施されている module-boundary checking を coding-rule gap として記録する。

### Step 2: [直列] Forward PLAN 接続

直列理由: downstream_dependency。Reverse は L6/L7 PLAN ids が確定した後にだけ close できる。

### Step 3: [直列] review

直列理由: downstream_dependency。review 前に backfill / doctor が green である必要がある。

## §6 用語更新

- **module-boundary back-fill**: module-boundary rule を PLAN trace に戻す Reverse 記録。

## §8 DoD

- [x] PLAN-L7-26 がこの Reverse PLAN を require している。
- [x] backfill doctor がこの add-impl を orphan として報告しない。
