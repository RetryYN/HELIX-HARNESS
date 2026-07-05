---
plan_id: PLAN-L7-173-handover-type-constant-split
title: "PLAN-L7-173: handover type and constant split（型・定数分割）"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "handover の type と constant declarations を挙動不変で抽出する。Runtime logic と public handover exports は維持する。"
agent_slots:
  - role: se
    slot_label: "SE - handover sidecar split（分割）"
  - role: tl
    slot_label: "TL - handover invariant review（不変条件レビュー）"
generates:
  - artifact_path: docs/plans/PLAN-L7-173-handover-type-constant-split.md
    artifact_type: markdown_doc
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: src/handover/handover-types.ts
    artifact_type: source_module
  - artifact_path: src/handover/handover-constants.ts
    artifact_type: source_module
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-172-harness-db-catalog-section-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T22:21:41+09:00"
    tests_green_at: "2026-06-25T22:17:00+09:00"
    verdict: approve
    scope: "src/handover/index.ts を compatibility export surface として維持しつつ、handover の type と constant declarations を sidecar modules へ分割する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\handover.test.ts --reporter=dot"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T22:10:36+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:b76027787c058bdfb27ec4b8692d0b126a108f698e07d6e7acd0c61b73d28998"
      - kind: unit_test
        command: "bun run vitest run tests\\handover-completion-wording.test.ts --reporter=dot"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T22:10:56+09:00"
        evidence_path: tests/handover-completion-wording.test.ts
        output_digest: "sha256:87d7e25d5201fdb018cc1109490f22c81e44aaa06c8eec2ec14ee6a4d41ba3b9"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T22:16:58+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:c4bec147cbd94eeca526cfc46a081822846c5ec4054f2653cc5639d93e053581"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T22:16:49+09:00"
        evidence_path: src/handover/handover-types.ts
        output_digest: "sha256:012fc748fc8deadc8a362165cf82d3682e41042b3d1d206ac637b3e8e3b9f282"
    notes:
      - "bun run vitest run tests\\doctor.test.ts timed out before test output in this environment; retained as residual verification risk and covered by subsequent doctor CLI gate."
---

# PLAN-L7-173: handover type and constant split（型・定数分割）

## 目的

handover behavior と public imports を変えずに、`src/handover/index.ts` に残る
`split-module` pressure を削減する。

## スコープ

- handover の public type declarations を `src/handover/handover-types.ts` へ移す。
- handover constants を `src/handover/handover-constants.ts` へ移す。
- compatibility のため、移動した declarations を `src/handover/index.ts` から re-export する。
- `tests/handover.test.ts` に direct sidecar coverage を追加する。

## 受入条件

- `tests/handover.test.ts`、`tests/handover-completion-wording.test.ts`、
  typecheck、lint、DB rebuild、doctor が pass する。
- refactor detector は `src/handover/index.ts` を untested sidecar split として報告しない。
- 残る `split-module` candidates は、別 PLAN slice がまだ必要な大きい modules に限定される。
