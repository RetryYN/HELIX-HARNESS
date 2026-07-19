---
plan_id: PLAN-REVERSE-135-dynamic-skill-injection-materialization
title: "PLAN-REVERSE-135: dynamic skill injection materialization の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements は `--inject` と adapter stdin materialization が dynamic skill injection closure の一部であることを明記する。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "L4 は provider-neutral skill manifest と Claude/Codex adapter materialization を記録する。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "module boundary の変更はない。既存の skills/runtime/team modules を接続する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "L6 は `buildSkillInjectionSet` と `buildAdapterPlan(contextInjection)` contracts を追加する。"
  - layer: implementation
    decision: updated
    evidence_path: src/runtime/adapter.ts
    reason: "adapter stdin と task-route adapter plans は、両 provider 向けに scoped skill paths を materialize する。"
agent_slots:
  - role: tl
    slot_label: "TL - dynamic skill injection fullback の確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-135-dynamic-skill-injection-materialization.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/skills/recommend.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-135-dynamic-skill-injection-materialization.md
  requires:
    - docs/plans/PLAN-L7-135-dynamic-skill-injection-materialization.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:42:32+09:00"
    tests_green_at: "2026-06-23T18:42:32+09:00"
    verdict: approve
    scope: "skill injection materialization の reverse fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\skill-recommend.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: tests/skill-recommend.test.ts
        output_digest: "sha256:5ff2a93bed92158fd45d452d57bc26f9594b9051bf00947f6f918b4aeb1f4df1"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\skill-recommend.test.ts tests\\runtime-adapter.test.ts tests\\team-run.test.ts tests\\tier-router.test.ts tests\\doctor.test.ts tests\\cli-surface.test.ts -t \"routeToAdapterPlan|codex-wrapper-parity|skill|inject|shared Claude/Codex launch plan|provider-neutral|stdin|task route\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:6d4c1257b646c3a744c0fc374bbb071ab2617deb86c63a49bcb44d69dd23681e"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:eb35c437e2188f32e5725b86e884e0b831ac721dc4f335279817934ca20a1c08"
---

# PLAN-REVERSE-135: dynamic skill injection materialization の fullback

## 目的

recommendation-only の skill surfaces から、実際の Claude/Codex provider context
materialization へ implementation correction を back-propagate する。

## R4 ルーティング

external behavior が変わるため、forward routing は L4 とする。PLAN が attached の場合、
provider execution surfaces は stdin 経由で scoped skill context manifest を受け取る。
L5 module boundaries は変更しない。

## 受入条件

- Requirements と L4 が `--inject` と adapter stdin materialization を定義している。
- L6 が `buildSkillInjectionSet` と `buildAdapterPlan(contextInjection)` を文書化している。
- implementation と tests が、同一 manifest が Claude、Codex、team-run、cost-tier task routing で
  機能することを証明している。
