---
plan_id: PLAN-L7-380-review-feedback-session-intake
title: "PLAN-L7-380: review feedback session intake"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "AO の feedback loop を HELIX session / GitHub ops guard の L7 intake へ追加する。外部 GitHub write は含めない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - CI/review/merge feedback intake"
  - role: qa
    slot_label: "QA - feedback routing evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-380-review-feedback-session-intake.md
    artifact_type: markdown_doc
  - artifact_path: tests/review-feedback-session-intake.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-360-github-ops-guard-parity
    - PLAN-L7-364-agent-session-command-center
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-380: review feedback session intake

## 目的

CI failure、review comment、requested changes、merge conflict を正しい worker session / PLAN / branch へ戻す
feedback intake を追加する。

## スコープ

- feedback event schema を定義する。
- GitHub check / review / conflict signal を read-only に取り込み、session board に紐づける。
- feedback は retry task、needs-you、blocked、resolved の状態を持つ。

## 対象外

- GitHub comment への自動返信。
- auto merge / auto rebase。
- credential activation。

## 受入条件

- feedback event は source URL/ref と target session id を持つ。
- session が見つからない feedback は orphan として失敗扱いにせず triage 待ちにする。
- same feedback の重複 intake は idempotent になる。

## 検証予定

- `bun test tests/review-feedback-session-intake.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-380-review-feedback-session-intake.md`
