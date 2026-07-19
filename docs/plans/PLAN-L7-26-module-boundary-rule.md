---
plan_id: PLAN-L7-26-module-boundary-rule
title: "PLAN-L7-26 (add-impl): module-boundary coding rule 実装"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - module-boundary rule 実装"
  - role: qa
    slot_label: "QA - module-boundary oracle"
generates:
  - artifact_path: src/lint/coding-rules.ts
    artifact_type: source_module
  - artifact_path: tests/coding-rules.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-25-module-boundary-rule.md
  requires:
    - docs/plans/PLAN-L6-25-module-boundary-rule.md
    - docs/plans/PLAN-REVERSE-25-module-boundary-rule.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 independent re-audit と PO closure instruction。confirmation 前に typecheck/lint/vitest/doctor は green。add-feature triad は内容変更なしで close。"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:55:31+09:00"
    tests_green_at: "2026-07-09T15:55:31+09:00"
    verdict: approve
    scope: "PLAN-L7-26 の execution evidence 欠落を、現行 coding-rules / ddd-tdd-rules / doctor targeted green と typecheck で補い、module-boundary rule の passed evidence を harness.db に投影できる状態へ回復した。"
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

# PLAN-L7-26 (add-impl): module-boundary coding rule 実装

## §0 位置づけ

`analyzeCodingRules` に IMP-096 を実装する。

## §3.1 実装計画（情報源）

情報源:

- `docs/plans/PLAN-L6-25-module-boundary-rule.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-CODE-009

実装:

- `src/lint/coding-rules.ts`: import declaration の boundary 検査
- `tests/coding-rules.test.ts`: 禁止 import の negative fixture

## §3 工程表

### Step 1: [直列] import 解析器

直列理由: downstream_dependency。oracle assertion より前に import resolution が存在している必要がある。

### Step 2: [並列] unit oracle

`../runtime/*` を import する合成 `src/lint/*` case を追加する。

### Step 3: [直列] review

直列理由: downstream_dependency。review 前に lint / typecheck / vitest / doctor が green である必要がある。

## §6 用語更新

- **reverse import**: 下位の governance module が上位の runtime/CLI feature module を import すること。

## §8 DoD

- [x] U-CODE-009 が pass する。
- [x] 実 repo guard の `module-boundary` violation が 0 件である。
