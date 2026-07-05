---
plan_id: PLAN-L7-101-db-projection-backprop-gate
title: "PLAN-L7-101: DB projection backprop gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
agent_slots:
  - role: tl
    slot_label: "TL - regression gate for DB projection backprop"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-56-artifact-progress-state.md
  requires:
    - docs/plans/PLAN-L7-56-artifact-progress-state.md
    - docs/plans/PLAN-REVERSE-56-artifact-progress-state.md
    - docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "plan-governance regression gate for progress color DB projection backprop"
    worker_model: codex
    reviewer_model: codex-intra-runtime
---

## 目的

L7 の DB 実装が、requirements、basic design、detailed design、Reverse fullback evidence が
揃う前に user-visible な state contract を導入してしまった artifact progress color の
見落としを再発させない。

## 根本原因

`PLAN-L7-56` では、artifact progress colors を implementation-local な DB projection として
扱っていた。既存の `descent-obligation` と `fr-unit-coverage` の gate は、FR が upstream に
登録された後なら十分強いが、upstream 登録がない段階で user-visible な `red` / `yellow` /
`green` contract を作る L7 DB projection を fail させなかった。

`plan-governance` は frontmatter validity、dependencies、parent drive、artifact existence も
確認していたが、「progress color DB projection には Reverse/fullback と V-model backprop
artifacts が必要」という category-specific rule を持っていなかった。

## 対策

`src/schema/harness-db.ts` または `src/state-db/projection-writer.ts` に触れ、`artifact_progress` /
`red/yellow/green` のような progress color semantics を導入する L7 DB implementation
plans に対して、`db_projection_backprop_missing` の plan-governance violation を追加する。

そのような plans には次を含めること:

- generated または required な `PLAN-REVERSE-*` による Reverse fullback evidence
- requirements document update
- L1 の functional と screen requirements
- L3 functional carry
- L4 function building block
- L5 physical-data semantics
- L6 function specification と FR/unit coverage

## 受入条件

- `artifact_progress` / `red/yellow/green` の projection code を追加する fixture PLAN が、
  upstream artifacts なしでは `db_projection_backprop_missing` で fail する。
- Reverse fullback と L1-L6 の generated artifacts を持つ fixture PLAN は、新しい gate を
  pass する。
- progress color semantics を導入しない foundation DB plans については、既存の plan governance
  checks と互換である。
- `bun test tests/plan-lint.test.ts` passes.
- `bun run typecheck` passes.
- `bun run lint` passes.
- `bun run src/cli.ts doctor` を実行し、その結果を記録する。
