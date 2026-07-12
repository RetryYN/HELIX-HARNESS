---
plan_id: PLAN-L6-73-closure-authority-backfill
title: "PLAN-L6-73 (add-design): closure authority backfill"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-434 followup authority backfill"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-72のauthority_backfill_required境界を独立機能へ具体化する。L0-L3要求は変更しない。"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE - authority source joinとatomic registry apply設計" }
  - { role: qa, slot_label: "QA - 361件保存則、曖昧性、CAS、human境界検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-authority-backfill.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L6-72-closure-evidence-materialization.md
  requires: [docs/plans/PLAN-L6-72-closure-evidence-materialization.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T02:04:49Z"
    reviewed_at: "2026-07-12T02:04:00Z"
    verdict: approve_after_fixes
    scope: "authority非推測、Vペアjoin、review receipt、process lock、crash recovery、cycle ledgerを敵対監査し、初回HIGH 3/MEDIUM 3/LOW 1と再review LOW 2を全件是正した。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/design-coverage.test.ts tests/design-language.test.ts tests/l6-completion.test.ts tests/plan-entry-routing.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T02:04:49Z", evidence_path: docs/design/harness/L6-function-design/closure-authority-backfill.md, output_digest: "sha256:8809b3aa9222011650e0ea2cb838befcfb46ff4917f9af4468d4b44b1329a951" }
---

# PLAN-L6-73: closure authority backfill（authority補完）

## 1. 目的

361件のauthority欠落を、Vペアの一意joinと独立reviewを通じて段階的に解消する。

## 2. 完了条件

- authority source hierarchy、proposal bundle、review、atomic apply、再分類保存則がL6でfreezeされる。
- `U-CABF-001..010`がL8と一対一で対応する。
- authorityを推測する経路とhuman境界迂回が設計上存在しない。

## 3. 非目標

- 本PLANではregistryへ実rowを適用しない。
- 根拠欠落PLANをeligibleへ分類しない。
