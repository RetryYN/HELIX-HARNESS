---
plan_id: PLAN-L6-30-integration-gwt-lint
title: "PLAN-L6-30 (add-design): integration-gwt lint 設計"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - integration GWT design"
generates:
  - artifact_path: docs/governance/ddd-tdd-rules.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
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
    scope: "A-114 の独立再監査と PO の完了指示。確定前に typecheck/lint/vitest/doctor が green。add-feature 三点は内容変更なしで完了。"
---

# PLAN-L6-30 (add-design): integration-gwt lint 設計

## §0 位置づけ

IMP-101 を back-fill する。L8 integration test design は Given/When/Then 粒度で確認可能でなければならない。

## §3.1 実装計画 (情報源)

情報源:

- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L8-integration-test-design.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-005

実装内容:

- confirmed な L8 IT 行に Given / When / Then を要求する。
- DDD/TDD workflow placement にこの rule を追加する。

## §3 工程表

### Step 1: [並列] integration GWT 方針

L8 行の粒度を machine-checkable evidence として定義する。

### Step 2: [並列] oracle 配置

U-DDDTDD-005 を unit oracle として追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review の前に L8 granularity contract が存在している必要がある。

## §6 用語更新

- **integration-gwt**: L8 の Given/When/Then 粒度 rule。
- **qualitative review**: quantitative check 後の reviewer evidence。

## §8 DoD

- [x] GWT のない L8 IT 行を machine-detectable にする。
