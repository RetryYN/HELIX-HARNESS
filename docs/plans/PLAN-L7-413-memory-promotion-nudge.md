---
plan_id: PLAN-L7-413-memory-promotion-nudge
title: "PLAN-L7-413 (impl): Stop時memory promotion nudge"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
created: 2026-07-11
updated: 2026-07-11
owner: Codex / SE
parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-63のsession event/nudge契約を実装する。"
entry_signals:
  - "po_directive:2026-07-11 harness memory記録忘れを機械検出する"
agent_slots:
  - role: se
    slot_label: "SE — pure nudge/session-log dedupe wiring"
  - role: qa
    slot_label: "QA — U-FLIFE-011..012 privacy/concurrency oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-413-memory-promotion-nudge.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/memory-promotion.ts
    artifact_type: source_module
  - artifact_path: src/runtime/session-log.ts
    artifact_type: source_module
  - artifact_path: tests/memory-promotion.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-63-feedback-lifecycle.md
  requires:
    - docs/plans/PLAN-L7-411-feedback-lifecycle-journal.md
review_evidence:
  - reviewer: l6_63_audit (independent Codex review agent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T04:48:55+09:00"
    tests_green_at: "2026-07-11T04:48:10+09:00"
    verdict: pass
    worker_model: gpt-5-codex
    reviewer_model: gpt-5-codex
    scope: "設計・Vペア・production call graphの敵対レビュー。Blocker/High 0。journal crash recovery、alias dedupe、TTL、damaged safe visibility、DB projection、SessionStart/feedback CLI、receipt、ack、promotion nudgeを確認しconfirm GO。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts tests/memory-promotion.test.ts tests/feedback-surface.test.ts tests/session-log.test.ts tests/state-db.test.ts tests/projection-writer.test.ts tests/oracle-test-trace.test.ts tests/vmodel-pair.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts tests/review-evidence.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T04:48:10+09:00"
        evidence_path: tests/feedback-lifecycle.test.ts
        output_digest: "sha256:1c7f642347a7f03d52e153ab6c0a553e633ff9bb6689020685dce48d38328920"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T04:48:10+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:66b7891ce526a88565ae7a744315255c3e05c6a6cc1b7392190855c5f35271d0"
---

# PLAN-L7-413: memory昇格通知

## 工程表

1. [直列] U-FLIFE-011..012をRed化する。
2. [直列] pure判定、session event、cross-process dedupe、Stop warningを実装する。
3. [直列] targeted test、typecheck、reviewで閉じる。

## 受入条件

- 成功commit/plan_switchあり、成功memory_writeなしの場合だけ1回通知する。
- body/diff/secretを保存せず、失敗はStopをblockしない。
