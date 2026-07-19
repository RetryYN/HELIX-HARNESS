---
plan_id: PLAN-REVERSE-118-required-backfill-bidirectional-gate
title: "PLAN-REVERSE-118: required backfill の双方向 gate"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L3
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "requirements は required add-impl backfill pairing の双方向性を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "この gate は PLAN governance のみを変更し、外部 basic design の振る舞いは変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "この gate は PLAN governance のみを変更し、詳細な runtime design の振る舞いは変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - 双方向 backfill fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-118-required-backfill-bidirectional-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-118-required-backfill-bidirectional-gate.md
  requires:
    - docs/plans/PLAN-L7-118-required-backfill-bidirectional-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:05:00+09:00"
    tests_green_at: "2026-06-23T13:05:00+09:00"
    verdict: approve
    scope: "双方向 required add-impl backfill pairing の requirements fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\backfill-pairing.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:05:00+09:00"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:4677eff98f8f122d395b94c7f70527358f358152a310e93d926a60ad3cc46512"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:05:00+09:00"
        evidence_path: src/lint/backfill-pairing.ts
        output_digest: "sha256:cb69e5f9425f57492a0760eb7574201d4d361689feb2229db46d773509485b07"
---

# PLAN-REVERSE-118: required backfill の双方向 gate

## 目的

required add-impl の双方向 pairing rule を requirements へ backfill する。
以前の rule は Reverse PLAN が implementation を参照していることを証明したが、
implementation PLAN が自身の Reverse dependency を公開していることまでは証明していなかった。

## スコープ

- Requirements は `reverseLinkMissing` backfill-pairing violation を記録する。
- 新規または更新された required add-impl PLAN は、自身を backfill する Reverse PLAN を
  require しなければならない。
- legacy の一方向 pairing は、更新されるまで non-blocking のままとする。

## 受入条件

- 新規 PLAN では、一方向の required add-impl/Reverse pair が失敗する。
- 双方向の required add-impl/Reverse pair は通過する。
- Fullback evidence は requirements 更新を指す。
