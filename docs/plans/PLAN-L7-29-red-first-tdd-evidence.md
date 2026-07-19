---
plan_id: PLAN-L7-29-red-first-tdd-evidence
title: "PLAN-L7-29 (add-impl): red-first-tdd-evidence"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - Red-first evidence 実装"
  - role: qa
    slot_label: "QA - Red-first evidence oracle"
generates:
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-28-red-first-tdd-evidence.md
  requires:
    - docs/plans/PLAN-L6-28-red-first-tdd-evidence.md
    - docs/plans/PLAN-REVERSE-28-red-first-tdd-evidence.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 の独立再 audit と PO closure 指示。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで close 済み。"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:58:43+09:00"
    tests_green_at: "2026-07-09T15:58:43+09:00"
    verdict: approve
    scope: "PLAN-L7-29 の execution evidence 欠落を、現行 ddd-tdd-rules / doctor targeted green と typecheck で補い、red-first TDD evidence gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/ddd-tdd-rules.test.ts tests/doctor.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:58:43+09:00"
        evidence_path: tests/ddd-tdd-rules.test.ts
        output_digest: "sha256:da2a0cc8b4acc05e0b579e133d4e76a3ac164e961d10efa95b14e5e84885b9d9"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:58:43+09:00"
        evidence_path: src/lint/ddd-tdd-rules.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-29 (add-impl): red-first-tdd-evidence の実装

## §0 位置づけ

IMP-099 を実装する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-28-red-first-tdd-evidence.md`
- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-003

実装:

- confirmed PLAN frontmatter から TDD Red/Green evidence を検査する。
- 欠落 timestamp と逆転 timestamp の fixture を追加する。

## §3 工程表

### Step 1: [直列] PLAN evidence parser

直列理由: downstream_dependency。PLAN parsing が Red/Green 比較入力を定義する。

### Step 2: [並列] unit oracle

missing-evidence と inverted-evidence の tests を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor を green にする。

## §6 用語更新

- **red-first evidence**: 実装済みの Red/Green timestamp detector。
- **DDD/TDD back-fill**: この add-impl slice の Reverse record。

## §8 DoD

- [x] U-DDDTDD-003 が pass する。
