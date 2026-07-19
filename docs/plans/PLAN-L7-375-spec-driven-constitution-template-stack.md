---
plan_id: PLAN-L7-375-spec-driven-constitution-template-stack
title: "PLAN-L7-375: spec-driven constitution template stack"
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
backprop_decision_reason: "Spec Kit の constitution / template stack を HELIX runtime artifact governance へ追加する L7 hardening。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - constitution / template resolver"
  - role: qa
    slot_label: "QA - priority and override regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-375-spec-driven-constitution-template-stack.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/constitution-template-stack.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/spec-driven-constitution-template-stack.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-317-skill-scaffold-generator
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:31:02+09:00"
    tests_green_at: "2026-07-09T17:30:19+09:00"
    verdict: approve
    scope: "PLAN-L7-375 constitution template stack。template entry の key/source/priority/content を決定的に解決し、同一 priority 競合は error、override reason 欠落は warning に分離する read-only surface を追加した。resolver source と sha256 digest を機械出力する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:30:19+09:00"
        evidence_path: tests/spec-driven-constitution-template-stack.test.ts
        output_digest: "sha256:06c4e5669254051fed11b76d72b1c1bdee9dbdc12a09d729daecfd769f792b7c"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:27:45+09:00"
        evidence_path: src/runtime/constitution-template-stack.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "npx --no-install biome check --write src/cli.ts src/runtime/constitution-template-stack.ts src/runtime/artifact-convergence-analyzer.ts src/runtime/state-machine-tool-policy.ts src/runtime/state-machine-template-planner.ts src/runtime/extension-preset-bundle-registry.ts tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:27:16+09:00"
        evidence_path: src/runtime/constitution-template-stack.ts
        output_digest: "sha256:3b52f8a933c601c80cde85accacaa0f2b86c8fa217931c5f503ba887b775d072"
---

# PLAN-L7-375: spec-driven constitution template stack 整備

## 目的

Spec Kit の constitution、template override、preset priority の pattern を、HELIX の adapter template、
role brief、task lens、PLAN scaffold の governance へ変換する。

## スコープ

- HELIX artifact template stack の優先順位を定義する。
- project override、role template、core template の競合時 resolution を deterministic にする。
- constitution violation を plan lint / doctor finding へ接続する。

## 対象外

- `.specify/` template の採用。
- 外部 preset install。
- AGENTS.md / CLAUDE.md の機械識別子 rename。

## 受入条件

- 同じ template key の競合は silent override にならない。
- constitution check は warning と blocker の区別を持つ。
- generated artifact は resolver source と digest を持つ。

## 検証予定

- `npm test tests/spec-driven-constitution-template-stack.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-375-spec-driven-constitution-template-stack.md`
