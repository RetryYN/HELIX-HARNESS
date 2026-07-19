---
plan_id: PLAN-L7-25-structured-error-handling
title: "PLAN-L7-25 (add-impl): 構造化 error-handling coding rule"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - 構造化 error rule 実装"
  - role: qa
    slot_label: "QA - 構造化 error oracle"
generates:
  - artifact_path: src/lint/coding-rules.ts
    artifact_type: source_module
  - artifact_path: tests/coding-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-24-structured-error-handling.md
  requires:
    - docs/plans/PLAN-L6-24-structured-error-handling.md
    - docs/plans/PLAN-REVERSE-24-structured-error-handling.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 独立 re-audit と PO closure instruction。confirmation 前に typecheck/lint/vitest/doctor green。add-feature triad は content changes なしで close 済み。"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:55:31+09:00"
    tests_green_at: "2026-07-09T15:55:31+09:00"
    verdict: approve
    scope: "PLAN-L7-25 の execution evidence 欠落を、現行 coding-rules / ddd-tdd-rules / doctor targeted green と typecheck で補い、structured error-handling rule の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/coding-rules.test.ts tests/ddd-tdd-rules.test.ts tests/doctor.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:55:31+09:00"
        evidence_path: tests/coding-rules.test.ts
        output_digest: "sha256:6dba1c6d8889daffd8e73ba0f5151b7db303421d13f466d1a62a2b9eed9d989d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:55:31+09:00"
        evidence_path: src/lint/coding-rules.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-25 (add-impl): 構造化 error-handling coding rule

## §0 位置付け

`analyzeCodingRules` に IMP-095 を実装する。

## §3.1 実装計画（情報源）

情報源:

- `docs/plans/PLAN-L6-24-structured-error-handling.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-CODE-008

実装:

- `src/lint/coding-rules.ts`: catch clause AST 検査
- `tests/coding-rules.test.ts`: empty catch / rethrow catch の negative fixture

## §3 工程表

### Step 1: [直列] catch 解析器

直列理由: downstream_dependency。oracle assertion の前に AST detection が存在している必要がある。

### Step 2: [並列] unit oracle

synthetic empty catch と rethrow-only catch の case を追加する。

### Step 3: [直列] review

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor が green である必要がある。

## §6 用語更新

- **rethrow-only catch**: 唯一の statement が `throw` である catch block。

## §8 DoD

- [x] U-CODE-008 が pass する。
- [x] 実 repo guard の `structured-error-handling` violations が 0 件である。
