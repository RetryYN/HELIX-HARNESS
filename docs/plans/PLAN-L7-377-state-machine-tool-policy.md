---
plan_id: PLAN-L7-377-state-machine-tool-policy
title: "PLAN-L7-377: state-machine tool policy"
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
backprop_decision_reason: "本 PLAN は Statewright の per-state allowed tools / model / approval を L7 採用候補として起票する。workflow gate と adapter enforcement の L6 昇格は後続 add-design/backprop PLAN で扱う。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - state policy schema"
  - role: tl
    slot_label: "Security - hard/advisory enforcement boundary"
generates:
  - artifact_path: docs/plans/PLAN-L7-377-state-machine-tool-policy.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/state-machine-tool-policy.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/state-machine-tool-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-370-security-credential-egress-guard
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:31:02+09:00"
    tests_green_at: "2026-07-09T17:30:19+09:00"
    verdict: approve
    scope: "PLAN-L7-377 state-machine tool policy。state ごとの allowed tools、transition、exit criteria、hard/advisory/unsupported enforcement を read-only report 化し、policy 欠落時は fail-close、unsupported hard enforcement は advisory claim に落とす。approval-required tool の逸脱は error finding として検出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:30:19+09:00"
        evidence_path: tests/state-machine-tool-policy.test.ts
        output_digest: "sha256:06c4e5669254051fed11b76d72b1c1bdee9dbdc12a09d729daecfd769f792b7c"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:27:45+09:00"
        evidence_path: src/runtime/state-machine-tool-policy.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "npx --no-install biome check --write src/cli.ts src/runtime/constitution-template-stack.ts src/runtime/artifact-convergence-analyzer.ts src/runtime/state-machine-tool-policy.ts src/runtime/state-machine-template-planner.ts src/runtime/extension-preset-bundle-registry.ts tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:27:16+09:00"
        evidence_path: src/runtime/state-machine-tool-policy.ts
        output_digest: "sha256:3b52f8a933c601c80cde85accacaa0f2b86c8fa217931c5f503ba887b775d072"
---

# PLAN-L7-377: state-machine tool policy 整備

## 目的

HELIX workflow phase ごとの allowed tools、model routing、approval gate、interrupt、hard/advisory enforcement を
state machine policy として表現する。

## スコープ

- state policy schema を追加する。
- adapter hook が hard enforcement できる surface と advisory-only surface を区別する。
- privilege escalation は approval gate なしに通さない。
- state transition evidence を run receipt に紐づける。

## 対象外

- Statewright runtime の導入。
- FSL gateway の取り込み。
- external MCP server install。

## 受入条件

- unsupported hard enforcement は hard と claim しない。
- tool escalation は severity を持つ finding になる。
- state policy なしの autonomous run は fail-close する。

## 検証予定

- `npm test tests/state-machine-tool-policy.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-377-state-machine-tool-policy.md`
