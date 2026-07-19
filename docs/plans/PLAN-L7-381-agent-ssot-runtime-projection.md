---
plan_id: PLAN-L7-381-agent-ssot-runtime-projection
title: "PLAN-L7-381: agent SSoT runtime projection"
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
backprop_decision_reason: "oh-my-agent の .agents SSoT pattern を HELIX adapter projection へ変換する L7 hardening。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - agent/rule/skill projection manifest"
  - role: qa
    slot_label: "QA - projection drift and cleanup"
generates:
  - artifact_path: docs/plans/PLAN-L7-381-agent-ssot-runtime-projection.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-ssot-runtime-projection.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-ssot-runtime-projection.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-362-runtime-capability-matrix
    - PLAN-L7-379-extension-preset-bundle-registry
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:48:28+09:00"
    tests_green_at: "2026-07-09T17:48:15+09:00"
    verdict: approve
    scope: "PLAN-L7-381 agent SSoT runtime projection。HELIX agent/rule/skill/hook pack から runtime-native target への dry-run projection report を追加し、source/generated digest、cleanup policy、runtime capability による unsupported report、drift finding、user-modified file の非上書きを機械化した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:48:15+09:00"
        evidence_path: tests/agent-ssot-runtime-projection.test.ts
        output_digest: "sha256:aacd5ffe6d9d4108787c6da2eb98cb36386a624776616192928bcac709725a8b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/agent-ssot-runtime-projection.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "bunx biome check --write src/cli.ts src/runtime/review-feedback-session-intake.ts src/runtime/agent-ssot-runtime-projection.ts src/runtime/skill-efficacy-evaluation.ts src/runtime/harness-taxonomy-curation-policy.ts src/runtime/source-content-mirror-completeness.ts tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/agent-ssot-runtime-projection.ts
        output_digest: "sha256:d882754bdc2f00af7547738d2f103cc9efe10e47156c97ef8c65165c83c7e3eb"
---

# PLAN-L7-381: agent SSoT runtime projection 整備

## 目的

agent、skill、rule、hook pack を HELIX の正本 manifest から Claude / Codex / OpenCode 等の runtime native layout へ
安全に投影する。

## スコープ

- projection manifest schema を定義する。
- runtime ごとの file layout、format、unsupported reason を記録する。
- generated file は source digest と cleanup policy を持つ。
- keyword / state hook は adapter capability matrix に従う。

## 対象外

- `.agents/` を HELIX 正本にすること。
- runtime native config の無条件上書き。
- external package manager install は対象外。

## 受入条件

- projection drift は doctor finding になる。
- user-modified generated file は上書きしない。
- unsupported runtime は silent skip せず report する。

## 検証予定

- `bun test tests/agent-ssot-runtime-projection.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-381-agent-ssot-runtime-projection.md`
