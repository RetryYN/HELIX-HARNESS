---
plan_id: PLAN-REVERSE-115-reverse-r4-route-backprop-gate
title: "PLAN-REVERSE-115: Reverse R4 route backprop gate の反映 gate"
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
    reason: "Requirements に route-level R4 backprop evidence gate を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "この gate は planning governance の変更であり、外部の basic design behavior には影響しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "この gate は planning governance の変更であり、detailed runtime design behavior には影響しない。"
agent_slots:
  - role: tl
    slot_label: "TL - Reverse R4 route backprop gate の反映"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-115-reverse-r4-route-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-115-reverse-r4-route-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-115-reverse-r4-route-backprop-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:22:00+09:00"
    tests_green_at: "2026-06-23T12:21:00+09:00"
    verdict: approve
    scope: "route-level R4 backprop evidence gate の Requirements fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T12:21:00+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: lint
        command: "npm run src\\cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23T12:21:00+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
---

# PLAN-REVERSE-115: Reverse R4 route backprop gate の反映 gate

## 目的

route-level Reverse R4 evidence rule を requirements に反映する。従来の
gate は文字どおりの upstream artifact claim を捕捉していたが、non-fullback
R4 Reverse PLAN は upstream artifact を生成せず、upstream reflection が不要で
あることも宣言しないまま L1-L6 へ route できていた。

## 対象範囲

- Requirements に `reverse_r4_route_backprop_missing` condition を追加する。
- この rule は 2026-06-23 以降に新規作成または更新された non-fullback R4
  Reverse PLAN のみに適用する。
- Legacy Reverse debt は retroactive hard-fail にせず、既存 audit に残す。

## 受入条件

- upstream generated artifact または明示的な no-backprop decision を持たない
  routed non-fullback R4 Reverse PLAN は fail する。
- generated upstream artifact がある場合は pass する。
- 具体的な reason を持つ `backprop_decision: not_required` は pass する。
