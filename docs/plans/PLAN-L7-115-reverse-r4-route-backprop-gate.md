---
plan_id: PLAN-L7-115-reverse-r4-route-backprop-gate
title: "PLAN-L7-115: Reverse R4 route backprop gate の整備"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - Reverse R4 route backprop gate の確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-115-reverse-r4-route-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-115-reverse-r4-route-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-112-reverse-r4-claimed-artifact-gate.md
  requires:
    - docs/plans/PLAN-L7-112-reverse-r4-claimed-artifact-gate.md
    - docs/plans/PLAN-REVERSE-115-reverse-r4-route-backprop-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:22:00+09:00"
    tests_green_at: "2026-06-23T12:21:00+09:00"
    verdict: approve
    scope: "route-level R4 backprop evidence lint と regression tests の確認。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\plan-lint.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T12:21:00+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: lint
        command: "bun run src\\cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23T12:21:00+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
---

# PLAN-L7-115: Reverse R4 route backprop gate の整備

## 目的

route-only Reverse R4 の trace hole を閉じる。L1-L6 へ routing する
non-fullback R4 Reverse PLAN は、上流の design/governance/test-design artifact
を生成するか、上流 backprop が不要であることを明示しなければならない。

## スコープ

- `plan-governance` に `reverse_r4_route_backprop_missing` を追加する。
- fullback R4 PLAN は、既存のより強い fullback scope rule の管理下に残す。
- enforcement date より前に記録された legacy Reverse debt を遡及的に失敗扱いしない。

## 受入条件

- `forward_routing=L1..L6` を持ち、upstream artifact も no-backprop decision もない
  新規 non-fullback R4 Reverse PLAN は失敗する。
- 対応する generated upstream artifact がある場合は通過する。
- 明示的な `backprop_decision: not_required` reason がある場合は通過する。
