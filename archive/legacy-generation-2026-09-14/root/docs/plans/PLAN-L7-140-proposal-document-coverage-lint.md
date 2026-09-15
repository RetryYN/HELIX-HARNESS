---
plan_id: PLAN-L7-140-proposal-document-coverage-lint
title: "PLAN-L7-140: Proposal document coverage routing and lint wiring"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-24
updated: 2026-06-24
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "Implements mechanical consistency checks for the existing FR-L1-39 proposal document coverage classifier and its test-design routing document. It does not add a new product requirement."
agent_slots:
  - role: tl
    slot_label: "TL - proposal document coverage lint"
  - role: aim
    slot_label: "AIM - dependency-neutral lint wiring review"
generates:
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/launch-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/schema/team.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/proposal-document-coverage.ts
    artifact_type: source_module
  - artifact_path: tests/proposal-document-coverage.test.ts
    artifact_type: test_code
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/model-id-ssot.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/proposal-document-coverage-routing.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
  requires:
    - PLAN-L7-95-lint-wiring-meta-gate
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-24T12:10:00+09:00"
    tests_green_at: "2026-06-24T12:06:05+09:00"
    verdict: approve
    scope: "Proposal document coverage lint, routing document consistency, lint-wiring deferred registration, team suggestion bridge, and dependency-neutral injection boundary."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/proposal-document-coverage.test.ts tests/lint-wiring.test.ts tests/task-classify.test.ts tests/dependency-drift.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-24T12:06:05+09:00"
        evidence_path: tests/proposal-document-coverage.test.ts
        output_digest: "sha256:b83eb982966a0e6fa019a4fd2bf59e2284cec83a168268f5c845e34243fb8fb1"
---

# PLAN-L7-140: Proposal Document Coverage Routing And Lint（文書 coverage routing lint）

## 1. 目的

proposal-to-document coverage routing に mechanical regression fence を追加し、
将来の template や classifier 変更が required design / test-design documents を無音で外せないようにする。

## 2. Scope

- representative `classifyProposalDocumentCoverage` scenarios 向けの pure lint module を追加する。
- required design/test-design document paths が存在することを verify する。
- cross-layer routing document が常に required であることを verify する。
- routing document が representative scenarios で使う classified pattern をすべて mention していることを verify する。
- lint module を dependency-neutral に保ったうえで、lint を doctor に wire する。
- proposal subagent recommendations を `team suggest --design-docs` に route しつつ、low-cost lanes が closing judgement owners にならないようにする。

## 3. 受入条件

- [x] lint module が missing routing docs、missing required doc paths、missing pattern markers、missing cross-artifact trace evidence、missing shrinkage guard behavior を検出する。
- [x] real repository が representative routing scenarios を pass する。
- [x] `lint-wiring` は module を dead ではなく explicitly deferred として記録する。
- [x] Dependency-neutral injection により lint-to-task module cycle を避け、doctor が coverage routing check を hard-gate できる。
- [x] Proposal mini/spark/T1 lanes は owned かつ parallelizable な team members になり、`T0-frontier` は executable team launch output の外側にある judgement recommendation のまま残る。

## 4. Verification

- `bun run vitest run tests/proposal-document-coverage.test.ts`
- `bun run vitest run tests/lint-wiring.test.ts`
- `bun run vitest run tests/task-classify.test.ts`
