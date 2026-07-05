---
plan_id: PLAN-L6-29-test-oracle-strength
title: "PLAN-L6-29 (add-design): test-oracle-strength 設計"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - test oracle strength 設計"
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

# PLAN-L6-29 (add-design): test-oracle-strength テスト oracle 強度

## §0 位置づけ

IMP-100 を後追いで補完する。コードを実行するだけのテストは、TDD 証跡として十分ではない。

## §3.1 実装計画 (情報源)

情報源:

- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-004

実装:

- 各 `it` / `test` block に明示的な assertion oracle を含めることを必須にする。
- truthiness のみの assertions は weak oracle として検出する。

## §3 工程表

### Step 1: [並列] oracle strength 設計

strong assertion と weak assertion の判定基準を定義する。

### Step 2: [並列] unit oracle 配置

U-DDDTDD-004 を unit oracle として追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に criteria と oracle が存在している必要がある。

## §6 用語更新

- **test-oracle-strength**: assertion strength rule を扱う規則。
- **quantitative check**: test strength に対する機械的な pass/fail 証跡。

## §8 DoD

- [x] no-assertion と weak-oracle tests が機械検出できる。
