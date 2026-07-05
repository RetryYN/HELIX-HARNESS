---
plan_id: PLAN-REVERSE-133-refactor-brush-up-workflow
title: "PLAN-REVERSE-133: refactor brush-up workflow fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L3
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Refactor Green now requires linked regression test IDs and relation impact closure; DB projection may trigger Refactor candidates."
  - layer: L3-functional
    decision: updated
    evidence_path: docs/design/harness/L3-functional/functional-requirements.md
    reason: "FR-25 ACs now cover test-ID-linked green, DB trigger, and dependency impact failure."
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "Refactor state colors and DB projection boundary are part of the mode building-block contract."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "No module boundary or storage structure changed; relation graph is reused as an existing dependency substrate."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "assertRefactorInvariant requires linked regression test IDs."
  - layer: implementation
    decision: updated
    evidence_path: src/workflow/contracts.ts
    reason: "The contract function fails Green without test IDs."
agent_slots:
  - role: tl
    slot_label: "TL - refactor brush-up workflow fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-133-refactor-brush-up-workflow.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L3-functional/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/process/modes/refactor.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
  requires:
    - docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:11:57+09:00"
    tests_green_at: "2026-06-23T18:11:57+09:00"
    verdict: approve
    scope: "Reverse fullback confirms Refactor mode changes returned to requirements and design."
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

# PLAN-REVERSE-133: refactor brush-up workflow fullback（Refactor 強化 workflow fullback）

## 目的

Refactor brush-up workflow の強化を requirements と design へ逆伝播し、
drive model の変更が implementation level だけに閉じない状態にする。

## R4 Routing

Forward routing は L3 とする。FR-L1-25 の機能 acceptance criteria が変更されたためである。
L4 と L6 は下流 design refinement として更新する。

L5 は明示的に not impacted とする。
`docs/design/harness/L5-detailed-design/module-decomposition.md` では、依存関係の substrate として
relation-graph reuse がすでに割り当てられている。この slice は新しい module boundary や
storage structure を導入しない。

## 受入条件

- Requirements に Refactor Green condition が記載されている。
- L3 FR-25 に DB trigger と dependency impact の AC がある。
- L4 に Red / Yellow / Green の意味と projection boundary が記載されている。
- L6 `assertRefactorInvariant` が implementation contract と一致している。
