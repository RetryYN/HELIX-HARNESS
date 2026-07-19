---
plan_id: PLAN-L7-133-refactor-brush-up-workflow
title: "PLAN-L7-133: refactor brush-up workflow の堅牢化"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
agent_slots:
  - role: tl
    slot_label: "TL - refactor brush-up workflow の堅牢化"
generates:
  - artifact_path: docs/process/modes/refactor.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L3-functional/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - docs/plans/PLAN-L6-00-master.md
    - docs/plans/PLAN-REVERSE-133-refactor-brush-up-workflow.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:11:57+09:00"
    tests_green_at: "2026-06-23T18:11:57+09:00"
    verdict: approve
    scope: "Refactor mode は test ID に紐づく green evidence を要求し、DB trigger / dependency impact の境界を記録する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts -t \"implements routing\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:11:57+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T18:11:57+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-133: refactor brush-up workflow の堅牢化

## 目的

既存の Refactor drive model を明示し、TDD-style brush-up refactoring と将来の
DB-triggered refactor candidate を扱える水準にする。

## スコープ

- 読みにくい Refactor mode 文書を、明確な canonical workflow に置き換える。
- Refactor における Red / Yellow / Green の意味を定義する。
- `harness.db` が findings、quality signals、feedback events、relation-graph impact、
  artifact progress projection rows から Refactor candidates を trigger できることを記録する。
- Green には linked regression test IDs が必要になるよう `assertRefactorInvariant` を強化する。
- missing-test-ID failure の regression coverage を追加する。

## 受入条件

- Refactor mode states が behaviour-invariant brush-up states として文書化されている。
- DB を authoring source にせず、DB-triggered Refactor が文書化されている。
- relation-graph dependency impact が Refactor Green condition に含まれている。
- regression test ID が紐づかない場合、`assertRefactorInvariant` が失敗する。
- targeted workflow contract tests が pass する。
