---
plan_id: PLAN-L7-379-extension-preset-bundle-registry
title: "PLAN-L7-379: extension preset bundle registry"
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
backprop_decision_reason: "本 PLAN は extension/preset/bundle lifecycle の L7 採用候補を起票する。setup/distribution surface の L6 / distribution policy 昇格は後続 add-design/backprop PLAN で扱う。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - extension/preset/bundle registry"
  - role: tl
    slot_label: "Security - install policy / hash manifest"
generates:
  - artifact_path: docs/plans/PLAN-L7-379-extension-preset-bundle-registry.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/extension-preset-bundle-registry.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/extension-preset-bundle-registry.test.ts
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
    scope: "PLAN-L7-379 extension preset bundle registry。extension/preset/bundle manifest、official/community/local catalog policy、dry-run install plan、hash manifest、remove ownership policy を追加した。community は既定 discovery-only、secret config bundle は blocked、remove は registry-owned unchanged file のみ許可する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:30:19+09:00"
        evidence_path: tests/extension-preset-bundle-registry.test.ts
        output_digest: "sha256:06c4e5669254051fed11b76d72b1c1bdee9dbdc12a09d729daecfd769f792b7c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:27:45+09:00"
        evidence_path: src/runtime/extension-preset-bundle-registry.ts
        output_digest: "sha256:71e408ef639249ee67decd22162fdbc40b9f0042b38fd78107ba80b0ea87ad35"
      - kind: lint
        command: "bunx biome check --write src/cli.ts src/runtime/constitution-template-stack.ts src/runtime/artifact-convergence-analyzer.ts src/runtime/state-machine-tool-policy.ts src/runtime/state-machine-template-planner.ts src/runtime/extension-preset-bundle-registry.ts tests/spec-driven-constitution-template-stack.test.ts tests/artifact-convergence-analyzer.test.ts tests/state-machine-tool-policy.test.ts tests/state-machine-template-planner.test.ts tests/extension-preset-bundle-registry.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:27:16+09:00"
        evidence_path: src/runtime/extension-preset-bundle-registry.ts
        output_digest: "sha256:3b52f8a933c601c80cde85accacaa0f2b86c8fa217931c5f503ba887b775d072"
---

# PLAN-L7-379: extension preset bundle registry 整備

## 目的

Spec Kit の extension / preset / bundle lifecycle と oh-my-agent の preset distribution pattern を、
HELIX の opt-in registry、install policy、hash manifest へ変換する。

## スコープ

- extension / preset / bundle manifest schema を定義する。
- official / community / local catalog と install-allowed / discovery-only を分ける。
- installed files は hash manifest で追跡し、user modified file を上書きしない。
- bundle は role-oriented setup として component set を固定する。

## 対象外

- 外部 marketplace からの自動 install。
- network install の default enablement。
- secrets を含む config bundle。

## 受入条件

- install は dry-run plan と hash manifest を出す。
- remove は自分が置いた未変更ファイルだけを対象にする。
- community catalog は既定で discovery-only になる。

## 検証予定

- `bun test tests/extension-preset-bundle-registry.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-379-extension-preset-bundle-registry.md`
