---
plan_id: PLAN-L7-167-descent-obligation-type-split
title: "PLAN-L7-167: descent obligation 型分割"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "descent-obligation の型定義と default adjacency catalog を、挙動不変で分割する。doctor、DB projection、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - descent obligation 型分割"
  - role: tl
    slot_label: "TL - descent invariant レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-167-descent-obligation-type-split.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/descent-obligation.ts
    artifact_type: source_module
  - artifact_path: src/lint/descent-obligation-types.ts
    artifact_type: source_module
  - artifact_path: tests/descent-obligation.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-166-setup-template-catalog-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T20:57:43+09:00"
    tests_green_at: "2026-06-25T20:57:43+09:00"
    verdict: approve
    scope: "analyzer behavior を保ったまま、descent-obligation の型定義と default adjacency catalog を sidecar module へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\descent-obligation.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:56:09+09:00"
        evidence_path: tests/descent-obligation.test.ts
        output_digest: "sha256:01822bfe073715aab45d69f562d86884b2aa3497585b1031cb088dbf7c9eb589"
      - kind: unit_test
        command: "bun run vitest run tests\\descent-obligation.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:56:09+09:00"
        evidence_path: src/lint/descent-obligation.ts
        output_digest: "sha256:9e10ed6bb1e78391761787647ee1c1a8896f59fc32aa6d7db0d253129096b4c4"
      - kind: unit_test
        command: "bun run vitest run tests\\descent-obligation.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:56:09+09:00"
        evidence_path: src/lint/descent-obligation-types.ts
        output_digest: "sha256:ab277901716f72cd3da7ab0f4c75777b72a8482d51abfd76495e354a9e4452a5"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:57:30+09:00"
        evidence_path: src/lint/descent-obligation.ts
        output_digest: "sha256:9e10ed6bb1e78391761787647ee1c1a8896f59fc32aa6d7db0d253129096b4c4"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:57:33+09:00"
        evidence_path: src/lint/descent-obligation-types.ts
        output_digest: "sha256:ab277901716f72cd3da7ab0f4c75777b72a8482d51abfd76495e354a9e4452a5"
---

# PLAN-L7-167: descent obligation 型分割

## 目的

型モデルと default adjacency catalog を抽出し、
`src/lint/descent-obligation.ts` に残る `split-module` pressure を削減する。

## スコープ

- descent layer/type/result interfaces と `DEFAULT_DESCENT_ADJACENCY` を
  `src/lint/descent-obligation-types.ts` へ移す。
- `src/lint/descent-obligation.ts` は parsing、loading、analysis、filtering、
  messages を引き続き担当する。
- descent tests を更新し、type/catalog symbols を sidecar module から import する。

## 受入条件

- Descent-obligation analyzer behavior は変更されない。
- `tests/descent-obligation.test.ts`、typecheck、lint、DB rebuild、doctor が pass する。
- refactor detector は `src/lint/descent-obligation.ts` を `split-module`
  candidate として報告しなくなる。
