---
plan_id: PLAN-L7-383-harness-taxonomy-curation-policy
title: "PLAN-L7-383: harness taxonomy curation policy"
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
backprop_decision_reason: "awesome harness / topic ledger の分類基準を HELIX catalog watch の L7 policy へ追加する。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - taxonomy / curation policy"
  - role: qa
    slot_label: "QA - source verification / freshness"
generates:
  - artifact_path: docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/harness-taxonomy-curation-policy.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/harness-taxonomy-curation-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-361-agent-catalog-watch
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:48:28+09:00"
    tests_green_at: "2026-07-09T17:48:15+09:00"
    verdict: approve
    scope: "PLAN-L7-383 harness taxonomy curation policy。source verification、license risk、activity freshness、scope fit、capability taxonomy、topic result digest delta を持つ audit report を追加し、unclassified/unverified/unknown license は fail-close、star count は advisory metadata に限定した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:48:15+09:00"
        evidence_path: tests/harness-taxonomy-curation-policy.test.ts
        output_digest: "sha256:aacd5ffe6d9d4108787c6da2eb98cb36386a624776616192928bcac709725a8b"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/harness-taxonomy-curation-policy.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "npx --no-install biome check --write src/cli.ts src/runtime/review-feedback-session-intake.ts src/runtime/agent-ssot-runtime-projection.ts src/runtime/skill-efficacy-evaluation.ts src/runtime/harness-taxonomy-curation-policy.ts src/runtime/source-content-mirror-completeness.ts tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/harness-taxonomy-curation-policy.ts
        output_digest: "sha256:d882754bdc2f00af7547738d2f103cc9efe10e47156c97ef8c65165c83c7e3eb"
---

# PLAN-L7-383: harness taxonomy curation policy 整備

## 目的

GitHub topic `agent-harness` と awesome harness catalog を、HELIX の採用判断に使える taxonomy と
curation policy へ変換する。

## スコープ

- harness taxonomy を定義する。
- source verification、license risk、activity freshness、scope fit、capability family を記録する。
- topic search query と result digest を audit evidence として保存する。
- star count は補助 metadata に限定し、採用根拠にしない。

## 対象外

- topic 全 repo の自動 install。
- popularity ranking による採用。
- license 不明 source の code import。

## 受入条件

- unclassified source は fail-close し、黙って捨てない。
- topic result digest が変わった場合は差分だけを追突する。
- curation policy は PLAN と audit doc の両方から参照できる。

## 検証予定

- `npm test tests/harness-taxonomy-curation-policy.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md`
