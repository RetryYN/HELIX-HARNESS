---
plan_id: PLAN-REVERSE-126-route-config-dependency-gate
title: "PLAN-REVERSE-126: route config dependency gate の fullback"
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
    reason: "route config dependency の acceptance item は実装済みで、検査対象になっている。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "Route eval は config dependency validation と fail-close behavior を文書化している。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "この変更は既存の route evaluation contract と local config boundary の範囲内に留まる。"
agent_slots:
  - role: tl
    slot_label: "TL - route config dependency fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-126-route-config-dependency-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-126-route-config-dependency-gate.md
  requires:
    - docs/plans/PLAN-L7-126-route-config-dependency-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T17:05:00+09:00"
    tests_green_at: "2026-06-23T17:05:00+09:00"
    verdict: approve
    scope: "route config dependency gate から requirements と L4 design への R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T17:05:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T17:05:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-REVERSE-126: route config dependency gate の fullback

## 目的

route config dependency validation を requirements と L4 function design へ back-fill する。

## スコープ

- Requirements §7.8.6 に route-map config dependency gate を記録する。
- L4 function design では、legacy DB または personal absolute paths を含む route-map config が fail-close することを示す。

## 受入条件

- Requirements と L4 design の両方で config dependency fail-close に触れる。
- Reverse record は実装を local route evaluation contracts の範囲内に維持する。
