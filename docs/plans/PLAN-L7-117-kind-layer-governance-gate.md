---
plan_id: PLAN-L7-117-kind-layer-governance-gate
title: "PLAN-L7-117: kind layer governance gate"
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
    slot_label: "TL - kind layer governance gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-117-kind-layer-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-117-kind-layer-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-116-required-agent-role-gate.md
  requires:
    - docs/plans/PLAN-L7-116-required-agent-role-gate.md
    - docs/plans/PLAN-REVERSE-117-kind-layer-governance-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:45:00+09:00"
    tests_green_at: "2026-06-23T12:45:00+09:00"
    verdict: approve
    scope: "Plan-governance kind/layer compatibility lint and regression tests."
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

# PLAN-L7-117: kind layer governance gate（kind/layer governance gate の層制約）

## 目的

PLAN 作成作業が誤った layer に分類されることを防ぐ。Reverse と
additive implementation の作業では、design 更新を実行 layer の中に隠してはならない。

## スコープ

- `plan-governance` に `kind_layer_mismatch` を追加する。
- 2026-06-23 以降の新規または更新された PLAN のみを適用対象にする。
- `design`, `add-design`, `impl`, `add-impl`, `refactor`, `retrofit`,
  `troubleshoot`, `research` を対象にする。
- layer 集約 plan に対する明示的な例外として `master_hub=true` を維持する。

## 受入条件

- L1-L6 外の新規または更新された `design` 作業は失敗する。
- L3-L6 外の新規または更新された `add-design` 作業は失敗する。
- L7 外の新規または更新された implementation および recovery の実行 kind は失敗する。
- L1-L4 外の新規または更新された `research` 作業は失敗する。
- `master_hub=true` の plan は引き続き有効である。
