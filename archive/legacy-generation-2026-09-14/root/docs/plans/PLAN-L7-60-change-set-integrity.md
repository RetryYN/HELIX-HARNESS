---
plan_id: PLAN-L7-60-change-set-integrity
title: "PLAN-L7-60: change-set integrity warning/block detector"
kind: impl
layer: L7
drive: fullstack
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "change-set integrity detector with singleton/incomplete artifact warnings and dependent regression blockers"
agent_slots:
  - role: tl
    slot_label: "TL - change-set integrity detector"
generates:
  - artifact_path: src/lint/change-impact.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/change-impact.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L7-59-detector-hardening
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-60: change-set integrity warning/block detector の実装記録

## 目的

review 前に incomplete implementation set を harness が検出できるようにする。

- change set が 1 つの artifact category (`source` / `design` / `test`) だけに触れる場合は warning alert を出す。
- `source` 変更に design/plan または test/test-design の対応変更が無い場合は warning alert を出す。
- source change が dependent module に影響し、mapped regression test が触られていない場合は doctor progression を block する。
- warning は non-blocking、blocker は fail-closed とする。

## 範囲

- Add `analyzeChangeSetIntegrity` and `changeSetIntegrityMessages`.
- dependent module 検出には `dependency-drift` の dependency graph を再利用する。
- Wire `change-set-integrity` into `runDoctor.ok`.
- fail-closed doctor meta coverage を追加する。
- singleton warning、dependent regression block、mapped regression pass の unit test を追加する。

## Verification

- [x] `bunx vitest run tests\change-impact.test.ts tests\doctor.test.ts`
- [x] `bun run lint`
- [x] `bun run typecheck`
- [x] `bun src\cli.ts doctor`
- [x] `bun run test`

## DoD

- [x] 1 category だけの change set は warning alert を出す。
- [x] source-only / incomplete source set は warning alert を出す。
- [x] mapped regression test が触られていない dependent module change は progression を block する。
- [x] repo / dependency input が読めない場合、detector 自体が fail closed する。
- [x] detector は doctor hard-gate aggregation に含まれる。
