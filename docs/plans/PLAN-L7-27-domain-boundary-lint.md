---
plan_id: PLAN-L7-27-domain-boundary-lint
title: "PLAN-L7-27 (add-impl): domain-boundary lint の実装"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
agent_slots:
  - role: tl
    slot_label: "TL - domain-boundary 実装"
  - role: qa
    slot_label: "QA - domain-boundary oracle 確認"
generates:
  - artifact_path: src/lint/ddd-tdd-rules.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-26-domain-boundary-lint.md
  requires:
    - docs/plans/PLAN-L6-26-domain-boundary-lint.md
    - docs/plans/PLAN-REVERSE-26-domain-boundary-lint.md
review_evidence:
  - reviewer: PO/A-114-ddd-tdd-strengthening-reaudit
    review_kind: human
    tests_green_at: "2026-06-09T16:53:00+09:00"
    reviewed_at: "2026-06-09T16:55:00+09:00"
    verdict: approve
    scope: "A-114 independent re-audit と PO closure instruction。confirmation 前に typecheck/lint/vitest/doctor が green。add-feature triad は内容変更なしで closure 済み。"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:55:31+09:00"
    tests_green_at: "2026-07-09T15:55:31+09:00"
    verdict: approve
    scope: "PLAN-L7-27 の execution evidence 欠落を、現行 coding-rules / ddd-tdd-rules / doctor targeted green と typecheck で補い、domain-boundary lint の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/coding-rules.test.ts tests/ddd-tdd-rules.test.ts tests/doctor.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:55:31+09:00"
        evidence_path: tests/ddd-tdd-rules.test.ts
        output_digest: "sha256:6dba1c6d8889daffd8e73ba0f5151b7db303421d13f466d1a62a2b9eed9d989d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:55:31+09:00"
        evidence_path: src/lint/ddd-tdd-rules.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-27 (add-impl): domain-boundary lint の実装計画

## §0 位置づけ

IMP-097 を add-feature slice として実装する。

## §3.1 実装計画 (情報源)

情報源:

- `docs/plans/PLAN-L6-26-domain-boundary-lint.md`
- `docs/governance/ddd-tdd-rules.md`
- `docs/test-design/harness/L7-unit-test-design.md` U-DDDTDD-007

実装:

- `src/lint/ddd-tdd-rules.ts` に domain-boundary source import analysis を追加する。
- synthetic negative test と real repo guard を追加する。
- `checkDddTddRules` を doctor へ接続する。

## §3 工程表

### Step 1: [直列] analyzer implementation

直列理由: downstream_dependency。tests と doctor messages より前に analyzer input shape を固定する必要がある。

### Step 2: [並列] unit oracle

reverse-import fixture と real repo guard を追加する。

### Step 3: [直列] review (self/pmo-sonnet)

直列理由: downstream_dependency。qualitative review より前に lint / typecheck / vitest / doctor を green にする必要がある。

## §6 用語更新

- **domain-boundary**: 実装済み import-boundary detector。
- **DDD/TDD back-fill**: この add-impl slice の Reverse record。

## §8 DoD

- [x] U-DDDTDD-007 が pass する。
- [x] doctor が DDD/TDD strictness findings を surface する。
