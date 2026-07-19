---
plan_id: PLAN-L7-116-required-agent-role-gate
title: "PLAN-L7-116: 必須 agent role gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - required role gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-116-required-agent-role-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-116-required-agent-role-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-115-reverse-r4-route-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-115-reverse-r4-route-backprop-gate.md
    - docs/plans/PLAN-REVERSE-116-required-agent-role-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:32:00+09:00"
    tests_green_at: "2026-06-23T12:32:00+09:00"
    verdict: approve
    scope: "Plan-governance mandatory role lint and regression tests."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T12:32:00+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: lint
        command: "npm run src\\cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23T12:32:00+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
---

# PLAN-L7-116: 必須 agent role gate

## 目的

drive-model PLAN の必須 agent role を機械検査可能にする。role enum の妥当性は
既に検査されていたが、PoC または recovery PLAN が AIM slot を省略でき、
Reverse R3 が PO intent-verification slot を省略できていた。

## スコープ

- `missing_required_agent_role` を `plan-governance` に追加する。
- 2026-06-23 以降に新規作成または更新された PLAN のみに適用する。
- `poc`、`recovery`、`troubleshoot`、Reverse R3 を対象にする。

## 受入条件

- 新規作成または更新された `poc`、`recovery`、`troubleshoot` が `aim` を持たない場合は失敗する。
- 新規作成または更新された Reverse R3 が `po` を持たない場合は失敗する。
- 必須 role が揃っている場合と legacy date の場合は成功する。
