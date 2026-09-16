---
plan_id: PLAN-L7-160-runtime-adapter-policy-extraction
title: "PLAN-L7-160: runtime adapter policy extraction（policy 抽出）"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "runtime adapter provider policy constants の挙動不変な抽出。公開 CLI/API contract、永続化 schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - runtime adapter policy extraction（policy 抽出）"
  - role: tl
    slot_label: "TL - adapter invariant review（不変条件レビュー）"
generates:
  - artifact_path: docs/plans/PLAN-L7-160-runtime-adapter-policy-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-159-policy-sidecar-extraction-sweep.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T19:32:10+09:00"
    tests_green_at: "2026-06-25T19:32:10+09:00"
    verdict: approve
    scope: "adapter behavior を変えずに runtime adapter provider の argv/env/context policy を sidecar module へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\runtime-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:16:59+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:6d4c1257b646c3a744c0fc374bbb071ab2617deb86c63a49bcb44d69dd23681e"
      - kind: unit_test
        command: "bun run vitest run tests\\runtime-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:16:59+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:eb35c437e2188f32e5725b86e884e0b831ac721dc4f335279817934ca20a1c08"
      - kind: unit_test
        command: "bun run vitest run tests\\runtime-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:16:59+09:00"
        evidence_path: src/runtime/adapter-policy.ts
        output_digest: "sha256:7cd477f7854bd54ff62bdafb323a7459e1d107f0ae892a863a0ae7c394d459b7"
      - kind: unit_test
        command: "bun run vitest run tests\\doctor.test.ts -t \"U-ADAPTER-009\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:30:24+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:7ed7860b34c01fc2b864f5396880a87d7d71d63367424b190efe87bd5041af86"
      - kind: unit_test
        command: "bun run vitest run tests\\doctor.test.ts -t \"U-ADAPTER-009\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T19:30:24+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:4b05fe6be6b15f71728b2f363f092f27c79bd207dadc65b8ad4b478618403464"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:32:10+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:eb35c437e2188f32e5725b86e884e0b831ac721dc4f335279817934ca20a1c08"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T19:32:10+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:6d4c1257b646c3a744c0fc374bbb071ab2617deb86c63a49bcb44d69dd23681e"
---

# PLAN-L7-160: runtime adapter policy extraction（policy 抽出）

## 目的

runtime adapter provider policy literals を専用 sidecar module へ移し、残っている
`externalize-policy` candidates を減らす。

## スコープ

- Codex/Claude stdin argv policy、Claude effort env、context injection labels を
  `src/runtime/adapter-policy.ts` へ抽出する。
- Codex wrapper parity doctor gate が argv sentinel source として sidecar policy を読むよう更新する。
- `src/runtime/adapter.ts` は runtime command construction の責務を維持する。
- 既存の runtime adapter contract tests を通じて、policy constants への直接 test coverage を追加する。

## 受入条件

- Runtime adapter behavior は変更しない。
- `tests/runtime-adapter.test.ts` が pass し、sidecar policy を直接 import する。
- Typecheck、lint、DB rebuild、doctor が pass する。
