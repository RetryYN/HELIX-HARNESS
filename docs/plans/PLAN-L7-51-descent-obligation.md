---
plan_id: PLAN-L7-51-descent-obligation
title: "PLAN-L7-51: descent-obligation ledger 実装"
kind: add-impl
layer: L7
drive: agent
status: completed
created: 2026-06-12
updated: 2026-06-12
agent_slots:
  - role: tl
    slot_label: "TL - descent-obligation lint、DB projection、doctor surface、U-DESC tests を実装する"
generates:
  - artifact_path: src/lint/descent-obligation.ts
    artifact_type: source_module
  - artifact_path: src/lint/plan-dod.ts
    artifact_type: source_module
  - artifact_path: src/lint/placeholder-deps.ts
    artifact_type: source_module
  - artifact_path: src/lint/drive-db-registration.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-coverage.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: src/lint/l7-completion.ts
    artifact_type: source_module
  - artifact_path: src/state-db/drive-registration.ts
    artifact_type: source_module
  - artifact_path: tests/descent-obligation.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/drive-db-registration.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-coverage.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
  - artifact_path: src/schema/harness-db.ts
    artifact_type: schema_migration
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L6-35-descent-obligation.md
  requires:
    - docs/design/harness/L6-function-design/descent-obligation.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-12"
    reviewed_at: "2026-06-12"
    verdict: pass
    scope: "PLAN-L6-35 の L7 add-impl: descent-obligation lint、descent_obligations projection、doctor hard/fail-close wiring、U-DESC-001..008 tests。"
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-51: descent-obligation ledger 実装

## 目的

PLAN-L6-35 の L6 descent-obligation contract を実装し、absence-blind な downstream gap を upstream trace key と layer adjacency から生成して、tests、doctor、harness.db に surface する。あわせて doctor completion precision を強化し、confirmed/completed の L7 PLAN が未チェックの DoD item を静かに残せないようにする。

## WBS

| WBS ID | 作業 | source target | test target | gate |
|---|---|---|---|---|
| WBS-L7-51-01 | pure analyzer と repo loader | `src/lint/descent-obligation.ts` | `tests/descent-obligation.test.ts` | `vitest tests/descent-obligation.test.ts` |
| WBS-L7-51-02 | harness.db projection | `src/schema/harness-db.ts`, `src/state-db/projection-writer.ts` | `tests/projection-writer.test.ts` | `vitest tests/projection-writer.test.ts` |
| WBS-L7-51-03 | doctor の hard/fail-close surface | `src/doctor/index.ts` | `tests/doctor.test.ts` | `helix doctor` |
| WBS-L7-51-04 | confirmed L7 DoD completion guard の実装 | `src/lint/plan-dod.ts`, `src/doctor/index.ts` | `tests/doctor.test.ts` | `helix doctor` |
| WBS-L7-51-05 | active L7 placeholder dependency guard の実装 | `src/lint/placeholder-deps.ts`, `src/doctor/index.ts` | `tests/doctor.test.ts` | `helix doctor` |
| WBS-L7-51-06 | drive/model DB registration hard gate の実装 | `src/lint/drive-db-registration.ts`, `src/state-db/drive-registration.ts`, `src/doctor/index.ts` | `tests/drive-db-registration.test.ts`, `tests/doctor.test.ts` | `helix doctor` |

## 受入条件

- U-DESC-001..008 は `it.todo` ではなく実行可能な tests である。
- `generateObligations` は upstream-driven であり、downstream の自己申告 link に依存しない。
- `analyzeDescentObligations` は untraceable、duplicate、satisfied、unmet、valid/invalid defer、impl-ahead、park/placeholder の各 case を扱う。
- `descent_obligations` rows は `rebuildHarnessDb` 中に projection される。
- `helix doctor` は descent-obligation messages を hard/fail-close として surface し、結果を `runDoctor.ok` に接続する。
- confirmed/completed の `PLAN-L7-*` に未チェックの DoD items が残る場合、`helix doctor` は fail closed する。
- active な design/test-design docs に L7-waiting の `placeholder_deps` が残る場合、または専用 placeholder-deps rule が未実装だと主張する場合、`helix doctor` は fail closed する。
- harness.db に automatic drive/model/workflow/skill registration evidence がない場合、current workflow/model/skill projection rows が `drive_runs` / `plan_registry` へ解決できない場合、または required current drive modes が欠ける場合、`helix doctor` は fail closed する。
