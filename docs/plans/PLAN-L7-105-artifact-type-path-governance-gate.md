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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:16:23+09:00"
    tests_green_at: "2026-07-09T15:16:23+09:00"
    verdict: approve
    scope: "PLAN-L7-105 の execution evidence 欠落を、現行 plan-lint / improvement-backlog / gate-confirm / merged-plan-status targeted green と typecheck で補い、artifact path/type governance gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/plan-lint.test.ts tests/improvement-backlog.test.ts tests/gate-confirm.test.ts tests/merged-plan-status.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:e50d9080733a80eafd2463820e4d0e72d7ea2482e71459043e79b8ad2efa72ec"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
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
