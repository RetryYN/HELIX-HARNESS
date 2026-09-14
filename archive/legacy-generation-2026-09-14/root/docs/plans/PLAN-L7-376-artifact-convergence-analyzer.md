---
plan_id: PLAN-L7-376-artifact-convergence-analyzer
title: "PLAN-L7-376: artifact convergence analyzer"
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
backprop_decision_reason: "Spec Kit の clarify/analyze/checklist/converge pattern を HELIX の既存 lint / outstanding へ接続する L7 追加。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: qa
    slot_label: "QA - cross-artifact gap analyzer"
  - role: se
    slot_label: "SE - converge task generation"
generates:
  - artifact_path: docs/plans/PLAN-L7-376-artifact-convergence-analyzer.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/artifact-convergence-analyzer.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/artifact-convergence-analyzer.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-332-plan-filing-completeness
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:31:02+09:00"
    tests_green_at: "2026-07-09T17:30:19+09:00"
    verdict: approve
    scope: "PLAN-L7-376 artifact convergence analyzer。spec/plan/task/code/test/design artifact を横断し、missing digest、implemented-without-design、missing test、stale task を source artifact line/digest 付き finding として出す。critical 未解決時は completion claim を禁止し、generated task の重複を検出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:30:19+09:00"
        evidence_path: tests/artifact-convergence-analyzer.test.ts
        output_digest: "sha256:06c4e5669254051fed11b76d72b1c1bdee9dbdc12a09d729daecfd769f792b7c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:27:45+09:00"
        evidence_path: src/runtime/artifact-convergence-analyzer.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "bunx biome check --write src/cli.ts src/runtime/constitution-template-stack.ts src/runtime/artifact-convergence-analyzer.ts src/runtime/state-machine-tool-policy.ts src/runtime/state-machine-template-planner.ts src/runtime/extension-preset-bundle-registry.ts tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:27:16+09:00"
        evidence_path: src/runtime/artifact-convergence-analyzer.ts
        output_digest: "sha256:3b52f8a933c601c80cde85accacaa0f2b86c8fa217931c5f503ba887b775d072"
---

# PLAN-L7-376: artifact convergence analyzer 整備

## 目的

spec / plan / tasks / code / tests の gap を横断検査し、残作業を新しい task / PLAN 候補として返す
HELIX convergence analyzer を追加する。

## スコープ

- artifact coverage matrix を生成する。
- ambiguity、contradiction、missing test、stale task、implemented-without-design を分類する。
- finding は actionable task と escalation-needed に分ける。

## 対象外

- LLM judge のみの合否。
- code 自動修正。
- human approval の代替。

## 受入条件

- finding は source artifact と line / digest を持つ。
- unresolved critical finding がある場合は completion claim を許可しない。
- generated task は existing PLAN と重複検査される。

## 検証予定

- `bun test tests/artifact-convergence-analyzer.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-376-artifact-convergence-analyzer.md`
