---
plan_id: PLAN-L7-168-verification-profile-type-split
title: "PLAN-L7-168: verification profile 型分割"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "verification profile 型定義の振る舞い不変な分割。Verification recommendation、probe、safety、evidence の semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - verification profile 型分割"
  - role: tl
    slot_label: "TL - verification profile 不変条件レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-168-verification-profile-type-split.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-types.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-safety.ts
    artifact_type: source_module
  - artifact_path: tests/verification-profile.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-167-descent-obligation-type-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T21:08:15+09:00"
    tests_green_at: "2026-06-25T21:08:15+09:00"
    verdict: approve
    scope: "public re-export surface を維持しながら、verification-profile の型定義を sidecar module へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\verification-profile.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:07:53+09:00"
        evidence_path: tests/verification-profile.test.ts
        output_digest: "sha256:3bf8064e662b9071536985fbf4b850d478b5f7f2362e10721fd3ceeeff17324c"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\verification-profile.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:07:53+09:00"
        evidence_path: src/lint/verification-profile.ts
        output_digest: "sha256:de1e9833b9e8ba36d7fb558c4ad711420398000db24a47f9f13d8753aa33d648"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\verification-profile.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T21:07:53+09:00"
        evidence_path: src/lint/verification-profile-types.ts
        output_digest: "sha256:0078453928c4e73da41e6ec6e0386a0f2d56bea94d6b033a12c35f49e08d7602"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:08:03+09:00"
        evidence_path: src/lint/verification-profile-catalog.ts
        output_digest: "sha256:914fa6a5a96e7d94cf8fc4598410dfd8371efe80b18695e6b8c94497a1b4b80c"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T21:08:09+09:00"
        evidence_path: src/lint/verification-profile-safety.ts
        output_digest: "sha256:294d53ff3dbe303be1bd92315676de35ac5126040240b876fa4096e415fdc1d5"
---

# PLAN-L7-168: verification profile 型分割

## 目的

共有 verification profile 型モデルを sidecar module へ抽出し、
`src/lint/verification-profile.ts` に残っている `split-module` 圧力を下げる。

## 範囲

- verification profile、recommendation、gate、probe、evidence、MCP、safety の型定義を
  `src/lint/verification-profile-types.ts` へ移動する。
- 移動した symbols を `src/lint/verification-profile.ts` から re-export し、既存の public API を維持する。
- catalog と safety helper の参照先を type sidecar に向け、内部 coupling を減らす。

## 受入条件

- `tests/verification-profile.test.ts`、typecheck、lint、DB rebuild、doctor が pass する。
- `src/lint/verification-profile.ts` からの public imports が引き続き動作する。
- refactor detector が `src/lint/verification-profile.ts` を `split-module` candidate として報告しなくなる。
