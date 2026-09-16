---
plan_id: PLAN-REVERSE-119-conditional-backfill-audit-sync
title: "PLAN-REVERSE-119: 条件付き backfill 監査同期"
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
    reason: "requirements は legacy conditional debt の監査同期を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "この gate は PLAN governance だけを変更し、外部 basic design の挙動は変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "この gate は PLAN governance だけを変更し、詳細 runtime design の挙動は変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - 条件付き backfill 監査 fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-119-conditional-backfill-audit-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-119-conditional-backfill-audit-sync.md
  requires:
    - docs/plans/PLAN-L7-119-conditional-backfill-audit-sync.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:30:00+09:00"
    tests_green_at: "2026-06-23T13:30:00+09:00"
    verdict: approve
    scope: "legacy conditional audit synchronization の requirements/concept fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\backfill-pairing.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:30:00+09:00"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:4677eff98f8f122d395b94c7f70527358f358152a310e93d926a60ad3cc46512"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:30:00+09:00"
        evidence_path: src/lint/backfill-pairing.ts
        output_digest: "sha256:cb69e5f9425f57492a0760eb7574201d4d361689feb2229db46d773509485b07"
---

# PLAN-REVERSE-119: 条件付き backfill 監査同期

## 目的

legacy conditional audit synchronization rule を requirements と concept terminology へ backfill する。

## スコープ

- requirements は `legacyAuditGaps` を hard backfill-pairing violation として記録する。
- concept glossary は現在の backfill-pairing outputs を列挙する。
- legacy debt は可視のまま維持するが、allowlist は audit table と一致しなければならない。

## 受入条件

- audit-only または allowlist-only の legacy debt entry は失敗する。
- 現在の repository audit synchronization は成功する。
- fullback evidence は requirements と concept updates を指す。
