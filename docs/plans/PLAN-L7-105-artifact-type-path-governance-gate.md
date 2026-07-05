---
plan_id: PLAN-L7-105-artifact-type-path-governance-gate
title: "PLAN-L7-105: Artifact path/type governance gate"
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
    slot_label: "TL - artifact path/type gate"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-105-artifact-type-path-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-105-artifact-type-path-governance-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-104-conditional-backfill-decision-gate.md
  requires:
    - docs/plans/PLAN-L7-104-conditional-backfill-decision-gate.md
    - docs/plans/PLAN-REVERSE-105-artifact-type-path-governance-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "PLAN governance artifact_path/artifact_type consistency gate and regression tests"
    worker_model: codex
    reviewer_model: codex-intra-runtime
---

# PLAN-L7-105: 成果物 path/type ガバナンス gate

## 目的

PLAN の `generates` entry が、design、test-design、PLAN の各 artifacts を誤った
`artifact_type` の背後に隠さないようにする。

## 範囲

- `docs/design/` は `design_doc` として強制する。
- `docs/test-design/` は `test_design` として強制する。
- `docs/plans/` は `markdown_doc` として強制する。
- enforcement は `plan-governance` 内に留め、既存の PLAN review と doctor flow が
  path/type 宣言の不一致を fail closed として扱うようにする。
- design backprop artifacts が generic markdown として登録されていた既存の
  artifact progress PLAN pair を修正する。

## 受入条件

- `docs/design/` の generated artifact が `markdown_doc` と宣言された場合、
  `artifact_type_mismatch` で fail する。
- `docs/test-design/` の generated artifact が `markdown_doc` と宣言された場合、
  `artifact_type_mismatch` で fail する。
- `docs/plans/` の generated artifact が `design_doc` と宣言された場合、
  `artifact_type_mismatch` で fail する。
- path/type 宣言が一致している場合、既存の DB projection と reverse fullback tests は
  引き続き pass する。
- 既存の `PLAN-L7-56` / `PLAN-REVERSE-56` の design backprop entries は
  `design_doc` として分類される。
- `bun test tests/plan-lint.test.ts` が pass する。
- `bun run typecheck` が pass する。
- `bun run lint` が pass する。
- `bun run src\cli.ts doctor` が pass する。
