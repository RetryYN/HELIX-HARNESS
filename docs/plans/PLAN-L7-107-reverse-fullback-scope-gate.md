---
plan_id: PLAN-L7-107-reverse-fullback-scope-gate
title: "PLAN-L7-107: Reverse fullback backprop scope gate の適用範囲 gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - Reverse fullback scope gate の確認"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-107-reverse-fullback-scope-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-103-reverse-fullback-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-104-conditional-backfill-decision-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-105-artifact-type-path-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-106-backprop-classification-backlog-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/lint/screen-impl-pair-freeze.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
  - artifact_path: tests/screen-impl-pair-freeze.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-106-backprop-classification-backlog-gate.md
  requires:
    - docs/plans/PLAN-L7-106-backprop-classification-backlog-gate.md
    - docs/plans/PLAN-REVERSE-107-reverse-fullback-scope-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "Reverse fullback scope lint、live PLAN backfill、regression tests を確認"
    worker_model: codex
    reviewer_model: codex-intra-runtime
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:16:23+09:00"
    tests_green_at: "2026-07-09T15:16:23+09:00"
    verdict: approve
    scope: "PLAN-L7-107 の execution evidence 欠落を、現行 plan-lint / improvement-backlog / gate-confirm / merged-plan-status targeted green と typecheck で補い、Reverse fullback scope gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/plan-lint.test.ts tests/improvement-backlog.test.ts tests/gate-confirm.test.ts tests/merged-plan-status.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:e50d9080733a80eafd2463820e4d0e72d7ea2482e71459043e79b8ad2efa72ec"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-107: Reverse fullback backprop scope gate の適用範囲 gate

## 目的

Reverse/fullback PLAN が design back-propagation を主張しながら、requirements、L4 basic design、
L5 detailed design への影響分類を未記録のまま残すことを防ぐ。

## 対象範囲

- `plan-governance` に `reverse_fullback_scope_missing` を追加する。
- `requirements`、`L4-basic-design`、`L5-detailed-design` それぞれに対する `backprop_scope`
  entry を必須にする。
- `updated` entry が generated evidence path を引用することを必須にする。
- 2026-06-22 時点の fullback PLAN に、明示的な scope decision を backfill する。

## 受入条件

- `backprop_scope` を持たない新規 R4 fullback は fail する。
- `updated` scope が generated evidence を引用しない新規 R4 fullback は fail する。
- requirements evidence と明示的な L4/L5 no-impact decision を持つ fullback は pass する。
- live `docs/plans/PLAN-REVERSE-*.md` は `plan-governance` を pass する。
- `npm test tests/plan-lint.test.ts` は pass する。
- `npm run typecheck` は pass する。
- `npm run lint` は pass する。
- `npx --no-install tsx src\cli.ts doctor` は pass する。
