---
plan_id: PLAN-L7-30-test-oracle-strength
title: "PLAN-L7-30 (add-impl): test-oracle-strength"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - test oracle strength 実装"
  - role: qa
    slot_label: "QA - test oracle strength 検証"
generates:
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-29-test-oracle-strength.md
  requires:
    - docs/plans/PLAN-L6-29-test-oracle-strength.md
    - docs/plans/PLAN-REVERSE-29-test-oracle-strength.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再監査と PO の closure 指示。確認前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closure 済み。"
---

# PLAN-L7-30 (add-impl): test-oracle-strength 実装計画

## §0 位置づけ

IMP-100 を実装する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-29-test-oracle-strength.md`
- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-004

実装:

- test block を走査し、`expect` / `assert` を確認する。
- truthiness-only assertion を検出する。
- synthetic fixture と real repo guard を追加する。

## §3 工程表

### Step 1: [直列] test block analyzer 実装

直列理由: downstream_dependency。Assertion scanning が violation oracle を定義する。

### Step 2: [並列] unit oracle 追加

no-assertion fixture と truthiness-only fixture を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor を green にする。

## §6 用語更新

- **test-oracle-strength**: assertion-strength detector の実装済み状態。
- **DDD/TDD back-fill**: この add-impl slice に対応する Reverse record。

## §8 DoD

- [x] U-DDDTDD-004 が pass する。
