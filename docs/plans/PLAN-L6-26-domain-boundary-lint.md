---
plan_id: PLAN-L6-26-domain-boundary-lint
title: "PLAN-L6-26 (add-design): domain-boundary lint"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - domain-boundary 設計"
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
    scope: "A-114 の独立再監査と PO の closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで close。"
---

# PLAN-L6-26 (add-design): domain-boundary lint 設計

## §0 位置づけ

IMP-097 を backfill する。DDD domain boundary は review 上の懸念だけでなく、機械的に検査する rule として扱う。

## §3.1 実装計画 (情報源)

情報源:

- `docs/governance/ddd-tdd-rules.md`
- `docs/design/harness/L6-function-design/module-drift.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-007

実装:

- DDD/TDD SSoT で `domain-boundary` を定義する。
- rule を `analyzeDddTddRules` 経由で評価する。
- 違反を doctor に表示する。

## §3 工程表

### Step 1: [並列] boundary policy 設計

lint/runtime/schema modules の許可される依存方向を定義する。

### Step 2: [並列] test oracle 配置

U-DDDTDD-007 を unit-level oracle として追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。qualitative review が boundary を確認する前に、policy と oracle が存在している必要がある。

## §6 用語更新

- **domain-boundary**: DDD の依存境界 rule。
- **DDD/TDD strictness**: この rule を担う policy family。

## §8 DoD

- [x] SSoT、L6 contract、L7 oracle、doctor route が接続されている。
- [x] domain-boundary 違反を unit test と doctor で検出できる。
