---
plan_id: PLAN-L7-170-plan-lint-type-policy-split
title: "PLAN-L7-170: plan lint の型と policy 分離"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "plan lint の型と policy constants を挙動不変で分離する。Schedule、governance、G1、G3 lint の挙動は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - plan lint 型/policy 分離"
  - role: tl
    slot_label: "TL - plan lint 不変性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-170-plan-lint-type-policy-split.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint-types.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint-policy.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-169-relation-graph-type-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T21:25:20+09:00"
    tests_green_at: "2026-06-25T21:25:20+09:00"
    verdict: approve
    scope: "lint behavior と exports を維持したまま、plan lint の public types と policy constants を sidecar modules へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:24:52+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:24:52+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:24:52+09:00"
        evidence_path: src/plan/lint-types.ts
        output_digest: "sha256:49910128a5173585aa302aec334207b42aa97ee99ca1b30c5edeed072c783e3c"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:24:52+09:00"
        evidence_path: src/plan/lint-policy.ts
        output_digest: "sha256:ff2a6177eb10aeee0a7183ba27c2cbb6b3f9dc5c2dbf475c3d63bf57db3f64d6"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:25:03+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:24:53+09:00"
        evidence_path: src/plan/lint-policy.ts
        output_digest: "sha256:ff2a6177eb10aeee0a7183ba27c2cbb6b3f9dc5c2dbf475c3d63bf57db3f64d6"
---

# PLAN-L7-170: plan lint の型と policy 分離

## 目的

plan lint behavior を変更せずに、`src/plan/lint.ts` に残る `split-module`
pressure を減らす。

## 範囲

- public な plan lint result/doc/violation types を `src/plan/lint-types.ts` へ移す。
- schedule/governance policy constants を `src/plan/lint-policy.ts` へ移す。
- type re-exports により、`src/plan/lint.ts` からの imports を維持する。

## 受入条件

- `tests/plan-lint.test.ts`、typecheck、lint、DB rebuild、doctor が pass する。
- `src/plan/lint.ts` が `split-module` threshold を下回る。
- refactor detector が `src/plan/lint.ts` を `split-module` candidate として報告しなくなる。
