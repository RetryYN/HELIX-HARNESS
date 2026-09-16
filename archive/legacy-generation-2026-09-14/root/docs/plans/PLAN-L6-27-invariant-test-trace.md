---
plan_id: PLAN-L6-27-invariant-test-trace
title: "PLAN-L6-27 (add-design): invariant-test-trace 設計"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - invariant trace 設計"
generates:
  - artifact_path: docs/governance/ddd-tdd-rules.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - docs/plans/PLAN-L6-00-master.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 independent re-audit と PO closure instruction。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closure 済み。"
---

# PLAN-L6-27 (add-design): invariant-test-trace 設計

## §0 位置付け

IMP-098 を back-fill する。DDD invariant declaration は L7 test oracle へ trace できなければならない。

## §3.1 実装計画 (情報源)

情報源:

- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-002

実装:

- invariant declaration を `DDD-INV-*` と `oracle: U-*` で定義する。
- 宣言されたすべての oracle が L7 test design に存在することを必須にする。

## §3 工程表

### Step 1: [並列] invariant SSoT 設計

`ddd-tdd-rules.md` で invariant declaration format を定義する。

### Step 2: [並列] oracle trace 設計

unit oracle として U-DDDTDD-002 を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review が trace closure を確認する前に、invariants と oracle list が存在していなければならない。

## §6 用語更新

- **invariant-test-trace**: invariant から L7 oracle への trace rule。
- **DDD/TDD strictness**: この rule を担う policy family。

## §8 DoD

- [x] DDD invariants と L7 oracle trace が machine-checkable である。
