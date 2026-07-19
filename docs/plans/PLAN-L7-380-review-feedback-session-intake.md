---
plan_id: PLAN-L7-380-review-feedback-session-intake
title: "PLAN-L7-380: review feedback session intake"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-09
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "AO の feedback loop を HELIX session / GitHub ops guard の L7 intake へ追加する。外部 GitHub write は含めない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - CI/review/merge feedback intake"
  - role: qa
    slot_label: "QA - feedback routing evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-380-review-feedback-session-intake.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/review-feedback-session-intake.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/review-feedback-session-intake.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-360-github-ops-guard-parity
    - PLAN-L7-364-agent-session-command-center
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:48:28+09:00"
    tests_green_at: "2026-07-09T17:48:15+09:00"
    verdict: approve
    scope: "PLAN-L7-380 review feedback session intake。CI/review/requested-changes/merge-conflict feedback を source URL/ref と target session id 付きで read-only intake し、known session へ retry/needs-you/blocked/resolved として routing する。unknown session は orphan triage として warning に留め、同一 feedback は stable id で idempotent に扱う。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:48:15+09:00"
        evidence_path: tests/review-feedback-session-intake.test.ts
        output_digest: "sha256:aacd5ffe6d9d4108787c6da2eb98cb36386a624776616192928bcac709725a8b"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/review-feedback-session-intake.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "npx --no-install biome check --write src/cli.ts src/runtime/review-feedback-session-intake.ts src/runtime/agent-ssot-runtime-projection.ts src/runtime/skill-efficacy-evaluation.ts src/runtime/harness-taxonomy-curation-policy.ts src/runtime/source-content-mirror-completeness.ts tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/review-feedback-session-intake.ts
        output_digest: "sha256:d882754bdc2f00af7547738d2f103cc9efe10e47156c97ef8c65165c83c7e3eb"
---

# PLAN-L7-380: review feedback session intake 整備

## 目的

CI failure、review comment、requested changes、merge conflict を正しい worker session / PLAN / branch へ戻す
feedback intake を追加する。

## スコープ

- feedback event schema を定義する。
- GitHub check / review / conflict signal を read-only に取り込み、session board に紐づける。
- feedback は retry task、needs-you、blocked、resolved の状態を持つ。

## 対象外

- GitHub comment への自動返信。
- auto merge / auto rebase は対象外。
- credential activation。

## 受入条件

- feedback event は source URL/ref と target session id を持つ。
- session が見つからない feedback は orphan として失敗扱いにせず triage 待ちにする。
- same feedback の重複 intake は idempotent になる。

## 検証予定

- `npm test tests/review-feedback-session-intake.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-380-review-feedback-session-intake.md`
