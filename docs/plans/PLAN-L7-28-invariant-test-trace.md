---
plan_id: PLAN-L7-28-invariant-test-trace
title: "PLAN-L7-28 (add-impl): invariant-test-trace"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - invariant trace 実装"
  - role: qa
    slot_label: "QA - invariant trace oracle"
generates:
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-27-invariant-test-trace.md
  requires:
    - docs/plans/PLAN-L6-27-invariant-test-trace.md
    - docs/plans/PLAN-REVERSE-27-invariant-test-trace.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 独立再 audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closure。"
---

# PLAN-L7-28 (add-impl): invariant-test-trace 実装

## §0 位置づけ

IMP-098 を実装する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-27-invariant-test-trace.md`
- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-002

実装:

- invariant oracle references を parse する。
- L7 test design に存在しない invariant oracle ids を flag する。
- negative test と real repo test を追加する。

## §3 工程表

### Step 1: [直列] invariant parser

直列理由: downstream_dependency。parser が oracle comparison の入力を定義する。

### Step 2: [並列] unit oracle

missing-oracle fixture と real repo guard を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor を green にする。

## §6 用語更新

- **invariant-test-trace**: 実装済みの invariant oracle detector。
- **DDD/TDD back-fill**: この add-impl slice の Reverse record。

## §8 DoD

- [x] U-DDDTDD-002 が pass する。
