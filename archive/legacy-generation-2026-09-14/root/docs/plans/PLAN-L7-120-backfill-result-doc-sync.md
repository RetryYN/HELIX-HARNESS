---
plan_id: PLAN-L7-120-backfill-result-doc-sync
title: "PLAN-L7-120: backfill result doc 同期"
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
    slot_label: "TL - backfill result doc 同期"
generates:
  - artifact_path: docs/plans/PLAN-L7-120-backfill-result-doc-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-120-backfill-result-doc-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/backfill-pairing.ts
    artifact_type: source_module
  - artifact_path: tests/backfill-pairing.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-119-conditional-backfill-audit-sync.md
  requires:
    - docs/plans/PLAN-L7-119-conditional-backfill-audit-sync.md
    - docs/plans/PLAN-REVERSE-120-backfill-result-doc-sync.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:45:00+09:00"
    tests_green_at: "2026-06-23T13:45:00+09:00"
    verdict: approve
    scope: "backfill result key の documentation sync gate と regression tests。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\backfill-pairing.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:4677eff98f8f122d395b94c7f70527358f358152a310e93d926a60ad3cc46512"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: src/lint/backfill-pairing.ts
        output_digest: "sha256:cb69e5f9425f57492a0760eb7574201d4d361689feb2229db46d773509485b07"
---

# PLAN-L7-120: backfill result doc 同期

## 目的

機械判定用の backfill result key を requirements と concept documentation に同期させ続ける。

## 範囲

- `backfill-pairing` から `BACKFILL_RESULT_KEYS` を export する。
- requirements と concept docs がすべての機械判定用 result key に言及することを必須にする。
- requirements の backfill mechanism note を更新する。

## 受入条件

- docs なしで backfill result key を追加または rename すると regression test が失敗する。
- 現在の requirements と concept docs がすべての backfill result key に言及している。
