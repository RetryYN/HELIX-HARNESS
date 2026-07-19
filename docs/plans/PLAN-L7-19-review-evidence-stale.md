---
plan_id: PLAN-L7-19-review-evidence-stale
title: "PLAN-L7-19 (add-impl): review-evidence stale approval 実装 (IMP-080)"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-08
updated: 2026-06-12
owner: PM / Codex TL
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-12"
    tests_green_at: "2026-06-12"
    verdict: approve_after_fixes
    scope: "L7 completion audit A-135: U-REVIEW stale approval artifacts exist, target tests and full npm test green, G4/G7 codex-only checklist review passed with .helix/audit/A-135-l7-completion-review-checklist.yaml."
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:48:30+09:00"
    tests_green_at: "2026-07-09T15:48:30+09:00"
    verdict: approve
    scope: "PLAN-L7-19 の execution evidence 欠落を、現行 review-evidence / plan-lint / trace gates / runtime adapter / doctor targeted green と typecheck で補い、stale approval gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/review-evidence.test.ts tests/plan-lint.test.ts tests/g1-trace.test.ts tests/gate-static.test.ts tests/runtime-hook-entrypoints.test.ts tests/runtime-adapter.test.ts tests/session-log.test.ts tests/doctor.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:48:30+09:00"
        evidence_path: tests/review-evidence.test.ts
        output_digest: "sha256:42b5abf78d614ed444d71293375df0343e2c27add5712c97bc5f02504612e806"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:48:30+09:00"
        evidence_path: src/lint/review-evidence.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
agent_slots:
  - role: tl
    slot_label: "TL - review-evidence analyzer 拡張"
  - role: qa
    slot_label: "QA - U-REVIEW stale approval oracle を確認"
generates:
  - artifact_path: src/lint/review-evidence.ts
    artifact_type: source_module
  - artifact_path: tests/review-evidence.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
dependencies:
  parent: docs/plans/PLAN-L6-18-review-evidence-stale.md
  requires: []
---

# PLAN-L7-19 (add-impl): review-evidence stale approval 実装 (IMP-080)

## §0 位置づけ

PLAN-L6-18 の機能設計を `src/lint/review-evidence.ts` と `tests/review-evidence.test.ts` に実装する。

## §3 工程表 (Step + 進捗)

### Step 1: [直列] ReviewEntry / parser 拡張
直列理由: file_conflict
`verdict` を抽出し、既存 tests_green_at / model 抽出を壊さない。

### Step 2: [直列] analyzer 拡張
直列理由: downstream_dependency
`staleApprovalViolations` を追加し、ok 条件へ連動する。

### Step 3: [直列] tests 追加
直列理由: downstream_dependency
draft+approve -> violation、confirmed+approve -> ok、draft+none -> ok を追加する。

### Step 4: [直列] review
直列理由: downstream_dependency
self/pmo-sonnet review で IMP-071/076/077 既存 oracle の回帰がないことを確認する。

## §3.1 実装計画

- 情報源: PLAN-L6-18、既存 `review-evidence.ts`、`tests/review-evidence.test.ts`。
- add-impl back-fill は PLAN-REVERSE-18 で受ける。

## §6 用語更新

新規 glossary term は追加しない。review_evidence の既存語彙を拡張する。

## §8 DoD

- [x] stale approval oracle が追加されている
- [x] 既存 U-REVIEW/U-XREVIEW/U-TORDER が green
- [x] PLAN-REVERSE-18 が本 PLAN を requires している
