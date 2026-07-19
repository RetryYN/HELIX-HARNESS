---
plan_id: PLAN-L7-172-harness-db-catalog-section-split
title: "PLAN-L7-172: harness DB catalog section split の分割"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "harness DB table/index catalog sections の挙動不変な分割。Schema table と index definitions は同じ export order で維持する。"
agent_slots:
  - role: se
    slot_label: "SE - harness DB catalog split 実装"
  - role: tl
    slot_label: "TL - DB schema invariant review 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-172-harness-db-catalog-section-split.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/harness-db-catalog.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-table-builders.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-core.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-graph.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-evaluation.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-indexes.ts
    artifact_type: source_module
  - artifact_path: tests/state-db.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-171-workflow-contracts-type-cleanup.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T21:54:10+09:00"
    tests_green_at: "2026-06-25T21:54:10+09:00"
    verdict: approve
    scope: "harness DB catalog の tables と indexes を section modules へ分割し、schema migration behavior は維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: tests/state-db.test.ts
        output_digest: "sha256:bfb3698fc15d79cd071c389e1b2cd1c805cd8e561526bb26eeed839bb829d587"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:f8473f1164e98f02ca1d0e825386dae7504dd29580edd87fed3a86d17c2df15b"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: src/schema/harness-db-catalog.ts
        output_digest: "sha256:81f4c66394128721249f900d053d0c6e377289f91069bde588f812224b69ff2c"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: src/schema/harness-db-tables-core.ts
        output_digest: "sha256:04157ef889e9c9acd14c57f26dfb8101347f8198eb2625f35a02b24a70c6c1c5"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: src/schema/harness-db-tables-graph.ts
        output_digest: "sha256:bf52681a3595d148483c2778a79bb20aabd9b95b7c14d1983ce830a4d2828937"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: src/schema/harness-db-tables-evaluation.ts
        output_digest: "sha256:6a7998736d30a0ccbc43cb997655d357d4a177096f63be2a16e822f18c4149c7"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\state-db.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:53:34+09:00"
        evidence_path: src/schema/harness-db-indexes.ts
        output_digest: "sha256:3a3cd34a0ed9e64491d936054634d2a1992d814cc37f650714709cc0837a93a9"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:53:33+09:00"
        evidence_path: src/schema/harness-db-table-builders.ts
        output_digest: "sha256:b84c3c8c379c25828716c8749efae34a7614f1405dd1305077377b30bc17d6d2"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:53:22+09:00"
        evidence_path: src/schema/harness-db-catalog.ts
        output_digest: "sha256:81f4c66394128721249f900d053d0c6e377289f91069bde588f812224b69ff2c"
---

# PLAN-L7-172: harness DB catalog section split の分割

## 目的

schema definitions や migration behavior を変更せずに、
`src/schema/harness-db-catalog.ts` に残る `split-module` pressure を下げる。

## スコープ

- table-builder helpers を `src/schema/harness-db-table-builders.ts` へ移す。
- table definitions を core、graph/export、evaluation/screen table catalog modules に分割する。
- index definitions を `src/schema/harness-db-indexes.ts` へ移す。
- `src/schema/harness-db-catalog.ts` は compatibility export surface として維持する。

## 受入条件

- `tests/state-db.test.ts`、`tests/db-projection-ingestion.test.ts`、
  typecheck、lint、DB rebuild、doctor が pass する。
- `src/schema/harness-db-catalog.ts` が `split-module` threshold を下回る。
- refactor detector が `src/schema/harness-db-catalog.ts` を
  `split-module` candidate として報告しなくなる。
