---
plan_id: PLAN-L7-134-tdd-drive-fit-classification
title: "PLAN-L7-134: TDD drive fit classification"
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
    slot_label: "TL - TDD drive fit classification"
generates:
  - artifact_path: docs/plans/PLAN-L7-134-tdd-drive-fit-classification.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-134-tdd-drive-fit-classification.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/README.md
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
  parent: docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
  requires:
    - docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
    - docs/plans/PLAN-REVERSE-134-tdd-drive-fit-classification.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:11:57+09:00"
    tests_green_at: "2026-06-23T18:11:57+09:00"
    verdict: approve
    scope: "Classifies drive models and design specialties by TDD fit and DB firing sources."
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

# PLAN-L7-134: TDD drive fit 分類

## 目的

Refactor brush-up の作業を cross-drive の TDD-style 分類へ拡張する。
どの drive model が Red/Yellow/Green loop に適合するか、どれが partial/weak か、
どの DB projection row が Red state を発火できるかを整理する。

## スコープ

- machine-readable contract として `classifyDriveTddFits` を追加する。
- drive model と design specialty について、strong/partial/weak の TDD fit を記録する。
- DB firing source として findings、quality signals、feedback events、relation graph nodes/edges、
  impact results、artifact progress を追加する。
- requirements、L3、L4、L6、process mode docs へ rule を back-propagate する。

## 受入条件

- strong target に design、add-feature、refactor、reverse、retrofit、recovery、incident、
  screen-design、frontend-design を含める。
- Discovery/Scrum は partial、Research は weak とする。
- DB firing source は PLAN input/workflow signal だけを作り、authored docs/source を直接 rewrite しない。
- targeted workflow contract test が pass する。
