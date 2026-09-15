---
plan_id: PLAN-L7-119-conditional-backfill-audit-sync
title: "PLAN-L7-119: conditional backfill audit 同期"
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
    slot_label: "TL - conditional backfill audit 同期"
generates:
  - artifact_path: docs/plans/PLAN-L7-119-conditional-backfill-audit-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-119-conditional-backfill-audit-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/backfill-pairing.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/backfill-pairing.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-118-required-backfill-bidirectional-gate.md
  requires:
    - docs/plans/PLAN-L7-118-required-backfill-bidirectional-gate.md
    - docs/plans/PLAN-REVERSE-119-conditional-backfill-audit-sync.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:30:00+09:00"
    tests_green_at: "2026-06-23T13:30:00+09:00"
    verdict: approve
    scope: "legacy conditional audit 同期 gate と regression tests を backfill する。"
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

# PLAN-L7-119: conditional backfill audit 同期

## 目的

legacy conditional backfill allowlist が、人間が読める audit table から drift しないようにする。

## スコープ

- `conditional-backfill-decision-audit-2026-06-22.md` を parse する。
- Legacy Debt table を `LEGACY_CONDITIONAL_BACKFILL_DEBT_PLAN_IDS` と比較する。
- `backfill-pairing` に `legacyAuditGaps` を追加し、doctor へ配線する。
- requirements と concept glossary を更新する。

## 受入条件

- audit table に存在しない allowlist entries は fail する。
- allowlist に存在しない audit rows は fail する。
- 現在の repository audit と allowlist が同期している。
