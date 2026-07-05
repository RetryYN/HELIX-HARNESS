---
plan_id: PLAN-REVERSE-131-plan-complete-handover
title: "PLAN-REVERSE-131: plan complete handover の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "requirement はすでに PLAN completion 時の handover を要求しており、この slice は CLI lifecycle entrypoint を追加する。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "handover function は同じままで、CLI が completed lifecycle path を公開する。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "storage schema と handover internals は変更しない。"
  - layer: implementation
    decision: updated
    evidence_path: src/cli.ts
    reason: "plan command group が plan complete を公開する。"
agent_slots:
  - role: tl
    slot_label: "TL - plan complete handover fullback 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-131-plan-complete-handover.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-131-plan-complete-handover.md
  requires:
    - docs/plans/PLAN-L7-131-plan-complete-handover.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:10:00+09:00"
    tests_green_at: "2026-06-23T16:10:00+09:00"
    verdict: approve
    scope: "plan complete handover CLI lifecycle entrypoint の R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\handover.test.ts -t \"marker を clear\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:b76027787c058bdfb27ec4b8692d0b126a108f698e07d6e7acd0c61b73d28998"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
---

# PLAN-REVERSE-131: plan complete handover の fullback

## 目的

PLAN completion が、既存の completed handover behavior を再利用する
CLI lifecycle entrypoint を持つことを記録する。

## スコープ

- handover storage schema は変更しない。
- `runHandover` は completed handover state の single writer のまま維持する。
- CLI 追加により、completion bookkeeping が operator の別 command 記憶に依存しないようにする。

## 受入条件

- `plan complete` が CLI surface tests で被覆される。
- Handover tests が `runHandover({ complete: true })` を引き続き被覆する。
- Doctor が green のまま維持される。
