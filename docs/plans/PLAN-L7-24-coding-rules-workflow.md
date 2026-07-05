---
plan_id: PLAN-L7-24-coding-rules-workflow
title: "PLAN-L7-24 (add-impl): coding-rules SSoT workflow 実装"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - coding-rules workflow 実装"
  - role: qa
    slot_label: "QA - coding-rules workflow 判定基準"
generates:
  - artifact_path: src/lint/coding-rules.ts
    artifact_type: source_module
  - artifact_path: tests/coding-rules.test.ts
    artifact_type: test_code
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-23-coding-rules-workflow.md
  requires:
    - docs/plans/PLAN-L6-23-coding-rules-workflow.md
    - docs/plans/PLAN-REVERSE-23-coding-rules-workflow.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closed。"
---

# PLAN-L7-24 (add-impl): coding-rules SSoT workflow 実装

## §0 位置づけ

IMP-094 向けに、coding-rules workflow analyzer と doctor hard gate を実装する。

## §3.1 実装計画（情報源）

情報源:

- `docs/plans/PLAN-L6-23-coding-rules-workflow.md`
- `docs/governance/coding-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-CODE-001..007

実装:

- `src/lint/coding-rules.ts`: pure analyzer、loader、message を提供する
- `src/doctor/index.ts`: `checkCodingRules`
- `tests/coding-rules.test.ts`: negative fixture と real repo guard を検証する

## §3 工程表

### Step 1: [直列] analyzer 実装

直列理由: downstream_dependency。Policy/workflow loader が tests と doctor wiring の入力 shape を定義する。

### Step 2: [並列] unit oracle

synthetic negative fixture と real repo guard で analyzer を検証する。

### Step 3: [直列] review

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor を green にする必要がある。

## §6 用語更新

- **coding-rules workflow analyzer**: coding-rule SSoT と workflow anchor の欠落を検出する lint。

## §8 DoD

- [x] U-CODE-001..007 が pass する。
- [x] doctor hard gate が coding-rules を含む。
