---
plan_id: PLAN-L7-158-refactor-detector-precision-and-policy-extraction
title: "PLAN-L7-158: refactor detector の精度向上と policy 抽出"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "挙動不変の refactor candidate 精度向上と policy 抽出。公開 CLI/API contract、永続化 schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - detector 精度向上と policy 抽出"
  - role: tl
    slot_label: "TL - TDD 不変条件レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-158-refactor-detector-precision-and-policy-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/refactor-candidate-policy.ts
    artifact_type: source_module
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-156-top-level-reference-doc-graph-node.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T18:43:57+09:00"
    tests_green_at: "2026-06-25T18:43:35+09:00"
    verdict: approve
    scope: "重複する route/CLI literal を外部化し、agent guard と refactor detector の policy data を抽出し、medium policy candidate を精密な policy surface に絞る。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:23:38+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: unit_test
        command: "bun run vitest run tests\\cli.test.ts tests\\agent-guard.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:43:35+09:00"
        evidence_path: tests/cli.test.ts
        output_digest: "sha256:30f2d9a937ea941b48a55d82cc9a03120a96a23c66df5c3644b206901f209b13"
      - kind: unit_test
        command: "bun run vitest run tests\\cli.test.ts tests\\agent-guard.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:43:35+09:00"
        evidence_path: tests/agent-guard.test.ts
        output_digest: "sha256:2e77132180a05f588c6225cc5f6af92bdc87624b59445edb8e71a3a158f7bac2"
      - kind: unit_test
        command: "bun run vitest run tests\\agent-guard.test.ts tests\\workflow-contracts.test.ts tests\\cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:23:31+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: unit_test
        command: "bun run vitest run tests\\agent-guard.test.ts tests\\workflow-contracts.test.ts tests\\cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:23:31+09:00"
        evidence_path: tests/agent-guard.test.ts
        output_digest: "sha256:2e77132180a05f588c6225cc5f6af92bdc87624b59445edb8e71a3a158f7bac2"
      - kind: unit_test
        command: "bun run vitest run tests\\agent-guard.test.ts tests\\workflow-contracts.test.ts tests\\cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T18:23:31+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T18:24:17+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T18:24:02+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
---

# PLAN-L7-158: refactor detector の精度向上と policy 抽出

## 目的

挙動を維持しつつ detector の精度を高め、現在表示されている refactor candidate を削減する。

## スコープ

- 重複する route command と CLI option string を外部化する。
- agent guard の allowlist/bypass policy を専用 policy module へ移す。
- refactor detector の threshold と policy term を専用 policy module へ移す。
- sidecar の `*-policy.ts` module がすでに存在する場合、または広い orchestrator を
  `split-module` として表現する方が適切な場合は、policy 外部化の noise を避ける。

## 受入条件

- `externalize-literal` candidate が解消されている。
- refactor candidate test が精度変更をカバーしている。
- agent guard の挙動は変更されていない。
- targeted test、typecheck、lint、DB rebuild、doctor が pass している。
