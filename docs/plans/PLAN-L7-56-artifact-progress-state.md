---
plan_id: PLAN-L7-56-artifact-progress-state
title: "PLAN-L7-56: DB-backed artifact progress color projection"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-23
owner: Codex
agent_slots:
  - role: se
    slot_label: "SE - artifact progress projection implementation"
  - role: tl
    slot_label: "TL - intra-runtime review for DB projection gates"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L1-requirements/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L1-requirements/screen-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L3-functional/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/fr-unit-coverage.md
    artifact_type: design_doc
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L7-44-harness-db-master
  requires:
    - PLAN-L7-32-cross-artifact-relation-graph
    - PLAN-L7-45-harness-db-foundation
    - PLAN-L7-46-projection-writer
    - PLAN-REVERSE-56-artifact-progress-state
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T19:50:00+09:00"
    tests_green_at: "2026-06-23T19:50:00+09:00"
    verdict: approve
    scope: "artifact_progress DB projection, CLI read model, schema/design coverage, and targeted Vitest evidence"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\projection-writer.test.ts tests\\db-projection-ingestion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T19:44:07+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T19:44:07+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
---

# PLAN-L7-56: DB-backed artifact progress color projection の実装

## 目的

実装状態を chat memory だけに保持せず、harness.db から query できるように、再構築可能な
`artifact_progress` projection を追加する。

color contract は次の通り。

- red: dependency check が欠落している、または open dependency impact がある。
- yellow: 実装済みだが linked passing test run がまだ無い、または recovery work が進行中。
- green: linked passing `test_runs` evidence が存在し、dependency impact が clear である。

## 範囲

- harness.db schema registry に `artifact_progress` table と index を追加する。
- relation graph の source/design/test-design/plan/requirement node、`covered-by` / `pairs` edge、passing
  `test_runs`、active recovery PLAN、open `impact_results` から row を projection する。
- `artifact_progress_events` を projection し、red/yellow progress row を `feedback_events` へ mirror することで、
  workflow recovery が DB state から開始できるようにする。
- projected color を read-only で確認する `helix progress artifacts` を追加する。
- color derivation と DB projection path を Vitest で覆う。
- requirements §6.8.6/§6.8.7、L1 FR-L1-51、L3 carry、L4 機能 building block、L5 物理 data、
  L6 function/unit coverage に requirement/design chain を記録し、この実装を lower-layer-only change のままにしない。

## 受入条件

- `npm test tests/projection-writer.test.ts tests/db-projection-ingestion.test.ts` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npx --no-install tsx src/cli.ts db rebuild --json` populates `artifact_progress`.
- `npx --no-install tsx src/cli.ts progress artifacts --json` returns rows with `red` / `yellow` / `green`,
  `passed_test_run_ids`, `dependency_check_run_id`, and `recovery_plan_ids` compatible fields.
- FR-L1-51 が L1 functional requirements、screen trace、L3 carry、L4 function building block に存在する。
- FR-L1-51 が L6 `function-spec.md` と `fr-unit-coverage.md` に存在する。
- `physical-data.md` は color invariant を定義する。red は missing dependency/back-propagation、yellow は
  implemented/recovery/unverified、green は linked passing test run + dependency clear を示す。
- `npx --no-install tsx src/cli.ts doctor` passes.

## 備考

この PLAN では、`artifact_progress` を意図的に derived data として扱う。relation graph、test catalog、
impact result projection から安全に削除・再構築できる。

2026-06-23 hardening: DB workflow coupling は `test_runs` pass evidence と relation-impact check metadata を使う。
static test link だけでは green ではなく yellow とする。red/yellow row は `source_table=artifact_progress` を持つ
`feedback_events` になり、`artifact_progress_events` は trigger consumer 向けの rebuildable event view を提供する。
