---
plan_id: PLAN-L7-31-integration-gwt-lint
title: "PLAN-L7-31 (add-impl): integration-gwt lint"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - integration GWT 実装"
  - role: qa
    slot_label: "QA - integration GWT oracle"
generates:
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-30-integration-gwt-lint.md
  requires:
    - docs/plans/PLAN-L6-30-integration-gwt-lint.md
    - docs/plans/PLAN-REVERSE-30-integration-gwt-lint.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は content changes なしで close。"
---

# PLAN-L7-31 (add-impl): integration-gwt lint 実装

## §0 位置づけ

IMP-101 を実装する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-30-integration-gwt-lint.md`
- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L8-integration-test-design.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-005

実装:

- L8 IT table を parse し、Given / When / Then を必須にする。
- missing-GWT fixture と real repo guard を追加する。

## §3 工程表

### Step 1: [直列] L8 table 解析

直列理由: downstream_dependency。L8 parsing が GWT violation oracle を定義する。

### Step 2: [並列] unit oracle

missing-GWT fixture と real repo guard を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor を green にする。

## §6 用語更新

- **integration-gwt**: 実装済みの L8 GWT detector。
- **DDD/TDD back-fill**: この add-impl slice に対する Reverse record。

## §8 DoD

- [x] U-DDDTDD-005 が pass する。
