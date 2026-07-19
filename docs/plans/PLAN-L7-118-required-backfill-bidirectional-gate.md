---
plan_id: PLAN-L7-118-required-backfill-bidirectional-gate
title: "PLAN-L7-118: required backfill bidirectional gate"
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
    slot_label: "TL - required backfill bidirectional gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-118-required-backfill-bidirectional-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-118-required-backfill-bidirectional-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/backfill-pairing.ts
    artifact_type: source_module
  - artifact_path: tests/backfill-pairing.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-117-kind-layer-governance-gate.md
  requires:
    - docs/plans/PLAN-L7-117-kind-layer-governance-gate.md
    - docs/plans/PLAN-REVERSE-118-required-backfill-bidirectional-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:05:00+09:00"
    tests_green_at: "2026-06-23T13:05:00+09:00"
    verdict: approve
    scope: "Backfill-pairing bidirectional required add-impl gate and regression tests."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\backfill-pairing.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:05:00+09:00"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:4677eff98f8f122d395b94c7f70527358f358152a310e93d926a60ad3cc46512"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:05:00+09:00"
        evidence_path: src/lint/backfill-pairing.ts
        output_digest: "sha256:cb69e5f9425f57492a0760eb7574201d4d361689feb2229db46d773509485b07"
---

# PLAN-L7-118: required backfill bidirectional gate（必須 backfill 双方向 gate）

## 目的

必須 `add-impl` の backfill pairing を双方向にする。Reverse 側はすでに L7 実装 PLAN を
require する必要があったが、実装 PLAN 側も Reverse PLAN を require し、execution contract が
design fullback step を明示的に保持する状態へ揃える。

## スコープ

- `backfill-pairing` に `reverseLinkMissing` を追加する。
- 2026-06-23 以降に新規作成または更新された必須 `add-impl` PLAN だけを enforcement 対象にする。
- legacy の片方向 backfill debt は、当該 PLAN が更新されない限り non-blocking のまま扱う。
- この rule を requirements に記録する。

## 受入条件

- Reverse→L7 だけを持つ新規または更新済み `add-impl` は fail する。
- L7→Reverse と Reverse→L7 の両方を持つ新規または更新済み `add-impl` は pass する。
- 現在の repository backfill audit は green のまま維持される。
