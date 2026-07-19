---
plan_id: PLAN-L7-382-skill-efficacy-evaluation
title: "PLAN-L7-382: skill efficacy evaluation"
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
backprop_decision_reason: "oh-my-openagent の with/without skill eval pattern を HELIX skill hygiene の L7 evidence へ追加する。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: qa
    slot_label: "QA - skill efficacy fixture / grading"
  - role: se
    slot_label: "SE - eval evidence schema"
generates:
  - artifact_path: docs/plans/PLAN-L7-382-skill-efficacy-evaluation.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/skill-efficacy-evaluation.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/skill-efficacy-evaluation.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/orchestration-memory.md
  requires: []
  references:
    - PLAN-L7-369-skill-memory-hygiene
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:48:28+09:00"
    tests_green_at: "2026-07-09T17:48:15+09:00"
    verdict: approve
    scope: "PLAN-L7-382 skill efficacy evaluation。with-skill / without-skill reproducible evidence、artifact path、command digest、grade delta を持つ dry-run evaluation report を追加し、promotion は再現可能 evidence がある場合だけ許可、regression は quarantine candidate にする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:48:15+09:00"
        evidence_path: tests/skill-efficacy-evaluation.test.ts
        output_digest: "sha256:aacd5ffe6d9d4108787c6da2eb98cb36386a624776616192928bcac709725a8b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/skill-efficacy-evaluation.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "bunx biome check --write src/cli.ts src/runtime/review-feedback-session-intake.ts src/runtime/agent-ssot-runtime-projection.ts src/runtime/skill-efficacy-evaluation.ts src/runtime/harness-taxonomy-curation-policy.ts src/runtime/source-content-mirror-completeness.ts tests/review-feedback-session-intake.test.ts tests/agent-ssot-runtime-projection.test.ts tests/skill-efficacy-evaluation.test.ts tests/harness-taxonomy-curation-policy.test.ts tests/source-content-mirror-completeness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:45:41+09:00"
        evidence_path: src/runtime/skill-efficacy-evaluation.ts
        output_digest: "sha256:d882754bdc2f00af7547738d2f103cc9efe10e47156c97ef8c65165c83c7e3eb"
---

# PLAN-L7-382: skill efficacy evaluation 整備

## 目的

skill が本当に作業品質を上げるかを、with-skill / without-skill fixture、grading、timing、evidence digest で測る。

## スコープ

- skill eval manifest を定義する。
- fixture、expected artifacts、grading rubric、timing、command evidence を保存する。
- skill quarantine / promotion decision を efficacy evidence に接続する。

## 対象外

- 人間評価を不要にすること。
- private data を含む fixture。
- model benchmark の一般化 claim。

## 受入条件

- skill promotion は少なくとも 1 件の reproducible eval evidence を要求する。
- regression は quarantine candidate になる。
- grading は artifact path と command digest を持つ。

## 検証予定

- `bun test tests/skill-efficacy-evaluation.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-382-skill-efficacy-evaluation.md`
