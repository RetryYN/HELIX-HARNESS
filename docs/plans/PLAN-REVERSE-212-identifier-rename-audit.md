---
plan_id: PLAN-REVERSE-212-identifier-rename-audit
title: "PLAN-REVERSE-212: HELIX identifier rename audit backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "The audit does not change HELIX pillar requirements; it only makes the existing P6 rename/cutover safety boundary measurable before PLAN-M-02 apply."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The pillar boundary remains unchanged: irreversible rename/cutover stays gated by PLAN-M-02 approval and is not promoted as a routine command."
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "HC-P6 distribution-contract now includes identifier rename cutover input, rename audit JSON boundary, IdentifierRenameAudit output, and concrete approval as the fail-close condition."
  - layer: L5-integration-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    reason: "LIT-P6-04 now covers PLAN-M-02 identifier rename audit alongside tag bump migration safety."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P6 now names auditIdentifierRenameBlastRadius(input) as the non-destructive precursor for PLAN-M-02, and keeps cutover apply blocked until cutover/action-binding approval records are concrete."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P6-04 now covers rename audit output and blocked apply semantics before any irreversible 旧 state path -> .helix move."
  - layer: L14-cutover-plan
    decision: updated
    evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    reason: "PLAN-M-02 Step 1 records partial progress for blast-radius audit and structured cutover safety packet only; state migration, CLI/bin rename, and adapter marker rewrite remain blocked."
agent_slots:
  - role: tl
    slot_label: "TL - identifier rename audit backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-212-identifier-rename-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-212-identifier-rename-audit.md
  requires:
    - docs/plans/PLAN-L7-212-identifier-rename-audit.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:35:00+09:00"
    tests_green_at: "2026-07-01T02:35:00+09:00"
    verdict: pass
    scope: "Backfilled the identifier rename blast-radius audit from PLAN-L7-212 into L6 function/test design and PLAN-M-02 without authorizing irreversible rename cutover."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:35:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:4b05fe6be6b15f71728b2f363f092f27c79bd207dadc65b8ad4b478618403464"
---

# PLAN-REVERSE-212: HELIX identifier rename audit の backfill

## 目的

`PLAN-L7-212` を backfill し、新しい identifier rename audit が孤立した L7 tool にならないようにする。
意味上の正本は引き続き `PLAN-M-02` である。HELIX identifier cutover は不可逆であり、必要な
cutover decision と action-binding approval record が具体化するまで blocked のままにする。

## Backfill 結果

- `HC-P6` は rename apply の安全な前段として `auditIdentifierRenameBlastRadius(input)` を含む。
- `HU-PILLAR-P6-04` は audit output と fail-closed approval semantics の両方を検証する。
- `PLAN-M-02` は Step 1 の部分進捗だけを記録する。`旧 state path -> .helix` state migration、CLI/bin rename、
  hook/adapter marker rewrite、action binding は承認しない。
- cutover packet は structured backup、freeze、re-approval、provenance field を持つため、apply 前に
  approval を意味面で判断できる。
- 2026-07-01 continuation: audit output は `hitsByCategory` を持ち、cutover packet は
  `cutoverCategoryChecklist` を持つ。これにより approval review は、不可逆 apply 前に legacy identifier が
  source、test、runtime state、adapter config、consumer template、design/governance docs、distribution surface に
  残っているかを確認できる。

## 受入条件

- `PLAN-L7-212` とこの Reverse PLAN は required add-impl backfill pairing として相互に require する。
- `helix rename audit` は現在の `helix`、`.helix`、`area=helix` blast radius を token と category 別に報告できる。
- `PLAN-M-02` に draft approval placeholder が残る間、audit は `blocked_pending_cutover_approval` のままにする。
- `helix rename plan --json` は backup manifest、freeze policy、provenance requirement、category-specific
  cutover action を公開するが、apply command は公開しない。
- DB rebuild 後に `doctor` が pass する。
