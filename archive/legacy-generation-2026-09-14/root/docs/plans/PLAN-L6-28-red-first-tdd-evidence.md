---
plan_id: PLAN-L6-28-red-first-tdd-evidence
title: "PLAN-L6-28 (add-design): red-first-tdd-evidence 設計"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - Red-first evidence 設計"
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

# PLAN-L6-28 (add-design): red-first-tdd-evidence の設計

## §0 位置づけ

IMP-099 を後追いで補完する。confirmed の実装 PLAN では、TDD Red-first evidence を明示しなければならない。

## §3.1 実装計画 (情報源)

情報源:

- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-003

実装:

- `tdd_red_required: true` を持つ confirmed PLAN には `red_at` と `green_at` を必須にする。
- `red_at <= green_at` を必須にする。

## §3 工程表

### Step 1: [並列] evidence contract 設計

Red-first PLAN evidence の field を定義する。

### Step 2: [並列] oracle 配置

U-DDDTDD-003 を unit oracle として追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency. review 前に evidence contract と oracle が存在している必要がある。

## §6 用語更新

- **red-first evidence**: TDD の Red が Green より前にあることを求める PLAN evidence rule。
- **evidence bundle**: gate 上で重要な decision evidence のまとまり。

## §8 DoD

- [x] 欠落または順序が逆転した Red-first evidence を機械検出できる。
