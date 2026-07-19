---
plan_id: PLAN-REVERSE-117-kind-layer-governance-gate
title: "PLAN-REVERSE-117: kind layer governance gate"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L3
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements define kind/layer compatibility as a plan-governance fail-close rule."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The gate changes PLAN governance only, not external basic design behavior."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The gate changes PLAN governance only, not detailed runtime design behavior."
agent_slots:
  - role: tl
    slot_label: "TL - kind layer fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-117-kind-layer-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-117-kind-layer-governance-gate.md
  requires:
    - docs/plans/PLAN-L7-117-kind-layer-governance-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:45:00+09:00"
    tests_green_at: "2026-06-23T12:45:00+09:00"
    verdict: approve
    scope: "Requirements fullback for kind/layer governance gate."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T12:45:00+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: lint
        command: "npm run src\\cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23T12:45:00+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
---

# PLAN-REVERSE-117: kind layer governance gate（kind/layer 互換性 governance gate）

## 目的

kind/layer 互換性ルールを requirements に反映する。従来の gate は PLAN token と enum の妥当性を検証していたが、
起票された kind がその作業を配置した layer と一致することまでは証明していなかった。

## スコープ

- Requirements に `kind_layer_mismatch` governance violation を記録する。
- design と add-design の work は、それぞれの起票 layer に制約する。
- implementation、refactor、retrofit、troubleshoot の work は L7 に制約する。
- research は L1-L4 に制約したままにする。
- enforcement date より前の legacy PLAN は、更新されない限り non-blocking とする。

## 受入条件

- 互換性のない kind/layer pair で新規起票された PLAN は fail する。
- 同じ PLAN が互換性のある kind/layer pair であれば pass する。
- fullback evidence が requirements update を指している。
