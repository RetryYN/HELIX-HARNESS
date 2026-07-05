---
plan_id: PLAN-L6-25-module-boundary-rule
title: "PLAN-L6-25 (add-design): module-boundary coding rule の追加"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - module-boundary rule 設計"
generates:
  - artifact_path: docs/governance/coding-rules.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - docs/plans/PLAN-L6-23-coding-rules-workflow.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再監査と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closure 済み。"
---

# PLAN-L6-25 (add-design): module-boundary coding rule の追加

## §0 位置づけ

IMP-096 を定義する。module 依存方向を機械監査可能にし、governance/lint code が runtime や CLI implementation に依存しないようにする。

## §3.1 実装計画（情報源）

情報源:

- `docs/governance/coding-rules.md`
- `docs/design/harness/L6-function-design/module-drift.md`
- `docs/test-design/harness/L7-unit-test-design.md`

実装:

- `src/lint/coding-rules.ts`: `module-boundary`
- `tests/coding-rules.test.ts`: U-CODE-009

## §3 工程表

### Step 1: [並列] boundary matrix 設計

`lint`、`runtime`、`schema` について、禁止する最小限の逆方向依存を定義する。

### Step 2: [直列] oracle 設計

直列理由: downstream_dependency。oracle は、禁止 import matrix の正確な内容に依存する。

### Step 3: [直列] レビュー

直列理由: downstream_dependency。レビュー前に lint / typecheck / vitest / doctor が green であること。

## §6 用語更新

- **module-boundary**: source module 間の依存方向を coding rule として検証する境界。

## §8 完了条件 (DoD)

- [x] 禁止された逆方向 import が機械検出される。
- [x] 実 repository の guard に violation が 0 件である。
