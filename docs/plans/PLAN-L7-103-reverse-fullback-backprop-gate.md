---
plan_id: PLAN-L7-103-reverse-fullback-backprop-gate
title: "PLAN-L7-103: Reverse fullback backprop gate"
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
    slot_label: "TL - Reverse fullback governance gate"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-103-reverse-fullback-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-103-reverse-fullback-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/reverse-fullback-backprop-audit-2026-06-22.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
    - docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
    - docs/plans/PLAN-REVERSE-103-reverse-fullback-backprop-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "Reverse fullback backprop gate, legacy audit table, and plan-governance regression tests"
    worker_model: codex
    reviewer_model: codex-intra-runtime
---

# PLAN-L7-103: Reverse fullback backprop gate（Reverse fullback 逆伝播 gate）

## 目的

今後の Reverse PLAN が、backprop を受け取った design / governance / test-design artifact を明記せずに
`confirmed_reverse_type=fullback` を主張できないようにする。

## スコープ

- `plan-governance` に `reverse_fullback_backprop_missing` を追加する。
- 2026-06-22 以降に更新された confirmed/completed の R4 fullback PLAN にこの rule を適用する。
- 既存運用を壊さないため、古い gap は doctor を遡及的に壊さず audit table に記録する。
- 現在の slice も新しい rule に従うように PLAN-REVERSE-101 を修正する。

## 受入条件

- 自身だけを `generates` に持つ新規 R4 fullback PLAN は
  `reverse_fullback_backprop_missing` で失敗する。
- design/governance/test-design artifact を `generates` に持つ新規 R4 fullback PLAN は通過する。
- 2026-06-22 より前の legacy fullback debt は
  `reverse-fullback-backprop-audit-2026-06-22.md` に可視化されたまま、現行 doctor を壊さない。
- `bun test tests/plan-lint.test.ts` が通過する。
- `bun run typecheck` が通過する。
- `bun run lint` が通過する。
- `bun run src\cli.ts doctor` が通過する。
