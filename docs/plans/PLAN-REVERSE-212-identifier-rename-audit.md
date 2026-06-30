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
    reason: "HU-PILLAR-P6-04 now covers rename audit output and blocked apply semantics before any irreversible .ut-tdd -> .helix move."
  - layer: L14-cutover-plan
    decision: updated
    evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    reason: "PLAN-M-02 Step 1 records partial progress for blast-radius audit only; state migration, CLI/bin rename, and adapter marker rewrite remain blocked."
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
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:35:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:139535e15e8e3557f3bd4c08e1a2406752183e6bf80f7c04640fb1cd7b0defaa"
---

# PLAN-REVERSE-212: HELIX identifier rename audit backfill

## Objective

Backfill `PLAN-L7-212` so the new identifier rename audit is not an isolated
L7 tool. The semantic source remains `PLAN-M-02`: HELIX identifier cutover is
irreversible and must stay blocked until the required cutover decision and
action-binding approval records are concrete.

## Backfill Result

- `HC-P6` now includes `auditIdentifierRenameBlastRadius(input)` as the safe
  precursor to any rename apply.
- `HU-PILLAR-P6-04` now tests both audit output and fail-closed approval
  semantics.
- `PLAN-M-02` records Step 1 partial progress only. It does not authorize
  `.ut-tdd -> .helix` state migration, CLI/bin rename, hook/adapter marker
  rewrite, or action binding.

## Acceptance Criteria

- `PLAN-L7-212` and this Reverse PLAN require each other for required
  add-impl backfill pairing.
- `ut-tdd rename audit` can report current `ut-tdd`, `.ut-tdd`, and
  `area=harness` blast radius.
- The audit remains `blocked_pending_cutover_approval` while PLAN-M-02 contains
  draft approval placeholders.
- `doctor` passes after DB rebuild.
