---
plan_id: PLAN-REVERSE-134-tdd-drive-fit-classification
title: "PLAN-REVERSE-134: TDD drive fit classification の fullback"
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
    reason: "Requirements は strong/partial/weak の TDD fit と DB firing 境界を定義する。"
  - layer: L3-functional
    decision: updated
    evidence_path: docs/design/harness/L3-functional/functional-requirements.md
    reason: "Functional AC は classifyDriveTddFits と DB-triggered Red を定義する。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "Basic design は cross-drive TDD fit table と trigger sources を記録する。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "Module boundary の変更はない。既存の workflow contract module を拡張する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "L6 は classifyDriveTddFits contract を追加する。"
  - layer: implementation
    decision: updated
    evidence_path: src/workflow/contracts.ts
    reason: "Contract は TDD fit、Red triggers、Yellow state、Green requirements を返す。"
agent_slots:
  - role: tl
    slot_label: "TL - TDD drive fit classification の fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-134-tdd-drive-fit-classification.md
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
  - artifact_path: docs/process/modes/README.md
    artifact_type: markdown_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-134-tdd-drive-fit-classification.md
  requires:
    - docs/plans/PLAN-L7-134-tdd-drive-fit-classification.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:11:57+09:00"
    tests_green_at: "2026-06-23T18:11:57+09:00"
    verdict: approve
    scope: "TDD drive fit classification の Reverse fullback。"
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

# PLAN-REVERSE-134: TDD drive fit classification の fullback

## 目的

cross-drive TDD fit classification を requirements と design へ逆伝播する。

## R4 ルーティング

Forward routing は L3 とする。理由は functional workflow behavior が変わり、
drive models と design specialties が machine-readable な TDD fit と DB firing
sources を公開するためである。

L5 は影響なし。
`docs/design/harness/L5-detailed-design/module-decomposition.md` はすでに workflow
contracts を `src/workflow/contracts.ts` へ対応付けている。この slice は module
boundaries を変えずに、その module へ pure contract を追加する。

## 受入条件

- Requirements に strong/partial/weak classification と DB firing limits が含まれる。
- L3 に classification と DB-triggered Red の acceptance criteria がある。
- L4 に cross-drive table と projection boundary がある。
- L6 が `classifyDriveTddFits` を文書化している。
