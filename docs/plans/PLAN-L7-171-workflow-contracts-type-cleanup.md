---
plan_id: PLAN-L7-171-workflow-contracts-type-cleanup
title: "PLAN-L7-171: workflow contracts type cleanup"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "Behavior-invariant extraction of workflow contract public types and supplemental contract helpers, plus removal of obsolete commented policy data already represented in contracts-policy."
agent_slots:
  - role: se
    slot_label: "SE - workflow contracts type cleanup"
  - role: tl
    slot_label: "TL - workflow contracts invariant review"
generates:
  - artifact_path: docs/plans/PLAN-L7-171-workflow-contracts-type-cleanup.md
    artifact_type: markdown_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts-types.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts-extras.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-170-plan-lint-type-policy-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T21:40:10+09:00"
    tests_green_at: "2026-06-25T21:40:10+09:00"
    verdict: approve
    scope: "Extract workflow contract public types and supplemental helpers to sidecar modules while preserving the contracts.ts import surface."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:39:53+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:39:53+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:39:53+09:00"
        evidence_path: src/workflow/contracts-types.ts
        output_digest: "sha256:2b8dcac19d45cd742cd7f996537c26ea0fb24273762405963b2d8e66e25417da"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:39:53+09:00"
        evidence_path: src/workflow/contracts-extras.ts
        output_digest: "sha256:879610fc9bf5ec87218f823b8741dd4a861dcddf0cc78d74ebe0051d99ebd569"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:40:04+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:39:59+09:00"
        evidence_path: src/workflow/contracts-extras.ts
        output_digest: "sha256:879610fc9bf5ec87218f823b8741dd4a861dcddf0cc78d74ebe0051d99ebd569"
---

# PLAN-L7-171: workflow contract 型整理

## 目的

workflow contract の挙動を変えずに、`src/workflow/contracts.ts` に残る
`split-module` pressure を下げる。

## 対象範囲

- 公開 workflow contract の result/evidence types を
  `src/workflow/contracts-types.ts` へ移す。
- type re-exports により、`src/workflow/contracts.ts` からの import を維持する。
- 補助的な asset/model/skill/catalog contract helpers を
  `src/workflow/contracts-extras.ts` へ移し、`src/workflow/contracts.ts` から
  re-export する。
- `src/workflow/contracts-policy.ts` で既に表現されている古いコメント化済み policy
  data を削除する。

## 受入条件

- `tests/workflow-contracts.test.ts`、typecheck、lint、DB rebuild、doctor が通る。
- `src/workflow/contracts.ts` が `split-module` threshold を下回る。
- refactor detector が `src/workflow/contracts.ts` を `split-module` candidate として
  報告しなくなる。
