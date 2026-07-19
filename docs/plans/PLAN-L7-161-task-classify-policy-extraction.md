---
plan_id: PLAN-L7-161-task-classify-policy-extraction
title: "PLAN-L7-161: task classify policy の抽出"
kind: refactor
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "task classification policy constants の振る舞い不変な抽出。public CLI/API contract、persisted schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - task classify policy 抽出"
  - role: tl
    slot_label: "TL - classifier 不変性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-161-task-classify-policy-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: src/task/classify-policy.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-160-runtime-adapter-policy-extraction.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T19:39:00+09:00"
    tests_green_at: "2026-06-25T19:39:00+09:00"
    verdict: approve
    scope: "task classification の kind、risk、uncertainty、baseline coverage、guardrail policy を sidecar module へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:37:29+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:5f3b411831eaf5df7f40ac95cce1623fd7f47b85ebc2ff6012b53b5610dd519d"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:37:29+09:00"
        evidence_path: src/task/classify.ts
        output_digest: "sha256:33574ac2f312fdc154f7aef077c47a89d433e9093b077f8e9dc93ff45502f10f"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:37:29+09:00"
        evidence_path: src/task/classify-policy.ts
        output_digest: "sha256:7781c8d712eab28fa8cffc2ade45c855c1600c921175d175b7efd67ec4900587"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:39:00+09:00"
        evidence_path: src/task/classify.ts
        output_digest: "sha256:33574ac2f312fdc154f7aef077c47a89d433e9093b077f8e9dc93ff45502f10f"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:39:00+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:5f3b411831eaf5df7f40ac95cce1623fd7f47b85ebc2ff6012b53b5610dd519d"
---

# PLAN-L7-161: task classify policy の抽出

## 目的

`src/task/classify.ts` から task classification policy constants を抽出し、
残っている `externalize-policy` candidate を減らす。

## スコープ

- kind 推論 patterns、risk terms、uncertainty terms、baseline proposal
  coverage、routing test doc policy、proposal guardrails を
  `src/task/classify-policy.ts`.
- `src/task/classify.ts` は deterministic composition と result construction の責務を維持する。
- sidecar policy constants に対する直接の test coverage を追加する。

## 受入条件

- Task classification と proposal document coverage の振る舞いは変えない。
- `tests/task-classify.test.ts` が pass し、sidecar policy を直接 import する。
- Typecheck、lint、DB rebuild、doctor が pass する。
