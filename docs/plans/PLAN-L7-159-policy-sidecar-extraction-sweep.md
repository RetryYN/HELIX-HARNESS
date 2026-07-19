---
plan_id: PLAN-L7-159-policy-sidecar-extraction-sweep
title: "PLAN-L7-159: policy sidecar 抽出の総点検"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "既存の lint/runtime gate に対する挙動不変の sidecar policy 抽出。公開 CLI/API contract、永続化 schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - policy sidecar 抽出"
  - role: tl
    slot_label: "TL - gate 不変条件 review"
generates:
  - artifact_path: docs/plans/PLAN-L7-159-policy-sidecar-extraction-sweep.md
    artifact_type: markdown_doc
  - artifact_path: src/gate/review-tier.ts
    artifact_type: source_module
  - artifact_path: src/gate/review-tier-policy.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/lint/proposal-document-coverage.ts
    artifact_type: source_module
  - artifact_path: src/lint/proposal-document-coverage-policy.ts
    artifact_type: source_module
  - artifact_path: tests/codex-hook-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/gate-review-tier.test.ts
    artifact_type: test_code
  - artifact_path: tests/proposal-document-coverage.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-158-refactor-detector-precision-and-policy-extraction.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T19:05:09+09:00"
    tests_green_at: "2026-06-25T19:04:52+09:00"
    verdict: approve
    scope: "review tier、Codex hook adapter、proposal document coverage lint の sidecar policy modules を抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\gate-review-tier.test.ts tests\\codex-hook-adapter.test.ts tests\\proposal-document-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:04:17+09:00"
        evidence_path: tests/gate-review-tier.test.ts
        output_digest: "sha256:dcf1847da140deed0001426cc67711b82306528b12b10c5f5a7a76a30ae5fc06"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\gate-review-tier.test.ts tests\\codex-hook-adapter.test.ts tests\\proposal-document-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:04:17+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\gate-review-tier.test.ts tests\\codex-hook-adapter.test.ts tests\\proposal-document-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:04:17+09:00"
        evidence_path: tests/proposal-document-coverage.test.ts
        output_digest: "sha256:b83eb982966a0e6fa019a4fd2bf59e2284cec83a168268f5c845e34243fb8fb1"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:04:52+09:00"
        evidence_path: src/gate/review-tier.ts
        output_digest: "sha256:12d3c3b2f7c44765b760db084030bb98939e1fa399dc89f0870f74009e37c666"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:04:43+09:00"
        evidence_path: src/lint/proposal-document-coverage.ts
        output_digest: "sha256:ce9e78e072731ca2f3da364e0cfb1584e887ef205f7b14c319c6a79502cba4ee"
---

# PLAN-L7-159: policy sidecar 抽出の総点検

## 目的

小さな lint/runtime gate modules から policy data を sidecar policy modules へ抽出し、
`externalize-policy` refactor candidates を減らす。

## スコープ

- review-tier の judgment gate/checklist policy を `review-tier-policy.ts` へ移す。
- Codex required hook policy を `codex-hook-adapter-policy.ts` へ移す。
- proposal document coverage の routing/evidence/gate policy を
  `proposal-document-coverage-policy.ts` へ移す。
- 既存 tests または callers が依存する public re-exports を維持する。

## 受入条件

- 既存 gate behavior は変更しない。
- targeted tests が各 sidecar policy module を cover する。
- `externalize-policy` candidate count が減少する。
- targeted tests、typecheck、lint、DB rebuild、doctor が pass する。
