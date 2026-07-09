---
plan_id: PLAN-L7-104-conditional-backfill-decision-gate
title: "PLAN-L7-104: 条件付き backfill decision gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - 条件付き backfill gate"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-104-conditional-backfill-decision-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-104-conditional-backfill-decision-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/conditional-backfill-decision-audit-2026-06-22.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/backfill-pairing.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: tests/backfill-pairing.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-103-reverse-fullback-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-103-reverse-fullback-backprop-gate.md
    - docs/plans/PLAN-REVERSE-104-conditional-backfill-decision-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "条件付き backfill decision gate、legacy debt audit、regression tests"
    worker_model: codex
    reviewer_model: codex-intra-runtime
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:11:48+09:00"
    tests_green_at: "2026-07-09T15:11:48+09:00"
    verdict: approve
    scope: "PLAN-L7-104 の execution evidence 欠落を、現行 plan-lint / backfill-pairing targeted green と typecheck で補い、条件付き backfill decision gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/plan-lint.test.ts tests/backfill-pairing.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:11:48+09:00"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:227aa9fdbe8ceb942b51ab3c9dd5c1f281cd1df115889d08916880286c5df627"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:11:48+09:00"
        evidence_path: src/lint/backfill-pairing.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-104: 条件付き backfill decision gate

## 目的

`refactor`、`retrofit`、`troubleshoot` の PLAN で、contract、behavior、requirement、design、
test-design の意味が変わったときに Reverse back-fill が黙って省略されることを防ぐ。

## スコープ

- `backfill-pairing` に `conditionalDecisionMissing` を追加する。
- `backprop_decision: not_required` と `backprop_decision_reason` により、明示的な no-backprop 判断を許可する。
- 既存の conditional warning を governance audit table に baseline として記録する。
- 新規および更新済み PLAN へ rule を強制しつつ、現在の doctor を green に保つ。

## 受入条件

- Reverse または no-backprop 判断がない新規 conditional-kind PLAN は fail する。
- `backprop_decision: not_required` と具体的な reason を持つ conditional-kind PLAN は pass する。
- 既存の conditional debt が `conditional-backfill-decision-audit-2026-06-22.md` で可視化される。
- `bun test tests/backfill-pairing.test.ts` が pass する。
- `bun run typecheck` が pass する。
- `bun run lint` が pass する。
- `bun run src\cli.ts doctor` が pass する。
