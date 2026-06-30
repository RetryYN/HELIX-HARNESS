---
plan_id: PLAN-REVERSE-202-run-debug-runtime-verification
title: "PLAN-REVERSE-202: L7.5 RUN & Debug runtime verification back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "L7.5 は既存の runtime verification / evidence discipline を閉じる実装検証ゲートであり、新規利用者要求や API 契約を増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "Runtime verification の基本構造は既存 verification / adapter / hook surface を再利用し、基本設計の分割を変えない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "DB schema 変更なし。append-only log event type は将来 projection の入力契約であり、物理テーブル追加はしない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "Runtime evidence classifier / RUN & Debug obligation / projection-only rejection / log event builder / completeness validation を L6 function contract として追加。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-RUNDEBUG-001..005 を追加し、projection-only rejection と runtime provenance completeness を oracle 化。"
agent_slots:
  - role: tl
    slot_label: "TL - RUN & Debug reverse back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-202-run-debug-runtime-verification.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
  references:
    - docs/plans/PLAN-L7-43-implementation-verification-group.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:15:00+09:00"
    tests_green_at: "2026-06-30T02:15:00+09:00"
    verdict: approve
    scope: "Reverse back-fill confirms L7.5 runtime verification descends into L6 function contracts and L7 U-RUNDEBUG oracles without changing L3 requirements, L4 structure, or L5 schema."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:79860ced577e4773101e17188af214ab8e29ae5fbe26f7f5d5e7ff61bac91c8a"
---

# PLAN-REVERSE-202: L7.5 RUN & Debug runtime verification back-fill

## R0-R4 Summary

- R0: `src/runtime/run-debug.ts` 追加により、runtime claim と projection-only evidence の境界を実装で明示する必要が発生。
- R1: 実装事実を L6 function contract へ戻し、5 つの純関数契約として固定。
- R2: L3/L4/L5 を精査し、新規 user requirement / basic structure / DB schema 変更は不要と判定。
- R3: L7 unit-test design へ `U-RUNDEBUG-001..005` を追加し、各 runtime verification contract に oracle を対応付け。
- R4: `PLAN-L7-202-run-debug-runtime-verification` と双方向 `requires` で結び、add-impl without Reverse backfill を閉じる。

## Back-Filled Meaning

この Reverse は「テストが増えた」ことを後追い登録するだけではない。L7.5 RUN & Debug の意味は、
静的 projection や DB row を「実際に動いた証拠」と誤認しないための gate である。

The back-filled invariant is:

- runtime behavior claims need runtime provenance
- projection-only rows can support trace but cannot close runtime acceptance
- unit-only helpers can skip RUN & Debug only with explicit reason and substitute oracle
- runtime verification logs must include correlation/evidence links and reject secret-like values

## Merge Boundary

L6 function design and L7 unit-test design are updated. Requirements, L4 architecture, and L5
physical data remain unchanged because no user-facing requirement, module boundary, or schema
change is introduced.
