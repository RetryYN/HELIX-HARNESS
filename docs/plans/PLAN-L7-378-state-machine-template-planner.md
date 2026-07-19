---
plan_id: PLAN-L7-378-state-machine-template-planner
title: "PLAN-L7-378: state-machine template planner"
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
backprop_decision_reason: "Statewright の gen_sm / template library pattern を HELIX の role/lens selection へ追加する L7 planning helper。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - workflow template planner"
  - role: qa
    slot_label: "QA - template replay evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-378-state-machine-template-planner.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/state-machine-template-planner.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/state-machine-template-planner.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-338-task-lens-injection
  references:
    - PLAN-L7-377-state-machine-tool-policy
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:31:02+09:00"
    tests_green_at: "2026-07-09T17:30:19+09:00"
    verdict: approve
    scope: "PLAN-L7-378 state-machine template planner。task lens から workflow template を選択し、allowed tools/transitions/exit criteria と validation を出す。生成 workflow は executable=false のままにし、execution triple に secret-like material がある場合は出力から除去して error finding にする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:30:19+09:00"
        evidence_path: tests/state-machine-template-planner.test.ts
        output_digest: "sha256:06c4e5669254051fed11b76d72b1c1bdee9dbdc12a09d729daecfd769f792b7c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:27:45+09:00"
        evidence_path: src/runtime/state-machine-template-planner.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "bunx biome check --write src/cli.ts src/runtime/constitution-template-stack.ts src/runtime/artifact-convergence-analyzer.ts src/runtime/state-machine-tool-policy.ts src/runtime/state-machine-template-planner.ts src/runtime/extension-preset-bundle-registry.ts tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:27:16+09:00"
        evidence_path: src/runtime/state-machine-template-planner.ts
        output_digest: "sha256:3b52f8a933c601c80cde85accacaa0f2b86c8fa217931c5f503ba887b775d072"
---

# PLAN-L7-378: state-machine template planner 整備

## 目的

task type から workflow state machine template を選び、必要に応じて生成候補を出す planner を追加する。

## スコープ

- workflow template catalog を定義する。
- task lens / role judgment から template selection を行う。
- success / failure execution triples を将来学習できる schema で保存する。
- generated template は human-readable diff と validation result を持つ。

## 対象外

- model fine-tuning。
- template の無検証自動適用。
- hosted visual editor。

## 受入条件

- template は allowed tools / transitions / exit criteria を持つ。
- generated workflow は validator を通らない限り実行不可。
- execution triple は secret / PII を含まない。

## 検証予定

- `bun test tests/state-machine-template-planner.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-378-state-machine-template-planner.md`
