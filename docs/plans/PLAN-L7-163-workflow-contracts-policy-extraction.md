---
plan_id: PLAN-L7-163-workflow-contracts-policy-extraction
title: "PLAN-L7-163: workflow contracts policy extraction の方針抽出"
kind: refactor
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "workflow TDD drive-fit 方針定数の挙動不変な抽出。公開 CLI/API contract、永続化 schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - workflow contracts policy extraction の抽出"
  - role: tl
    slot_label: "TL - workflow invariant review の確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-163-workflow-contracts-policy-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts-policy.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-162-team-run-policy-extraction.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T20:15:00+09:00"
    tests_green_at: "2026-06-25T20:15:00+09:00"
    verdict: approve
    scope: "workflow TDD drive-fit policy catalog を sidecar module へ抽出し、classifyDriveTddFits は composition logic として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:11:58+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:11:58+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:11:58+09:00"
        evidence_path: src/workflow/contracts-policy.ts
        output_digest: "sha256:dfe68d29ecaf344bb33153dae76408dfa596172be9a98d250eb3f59c3eacfa50"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:15:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:15:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
---

# PLAN-L7-163: workflow contracts policy extraction の方針抽出

## 目的

残っている `externalize-policy` candidate を、workflow TDD drive-fit catalog を
`src/workflow/contracts.ts` から抽出することで解消する。

## スコープ

- `DriveTddFit`、`TddCompatibility`、`DRIVE_TDD_FITS` を
  `src/workflow/contracts-policy.ts` へ移す。
- `classifyDriveTddFits` は `src/workflow/contracts.ts` に残し、policy catalog
  に対する composition logic として維持する。
- sidecar policy catalog に対する直接の test coverage を追加する。

## 受入条件

- Workflow contract behavior は変更しない。
- `tests/workflow-contracts.test.ts` が pass し、sidecar policy を直接 import する。
- Typecheck、lint、DB rebuild、doctor が pass する。
