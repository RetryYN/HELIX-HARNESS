---
plan_id: PLAN-REVERSE-203-legacy-adoption-decisions
title: "PLAN-REVERSE-203: old HELIX semantic adoption decision back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/legacy-helix-extension.md
    reason: "HLX-FR-01..12 は既に confirmed。今回の L7 は既存 L6 function contract の pure implementation であり、新規 user requirement を増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/legacy-helix-extension.md
    reason: "runtime building block 内の pure decision helper であり、module boundary / adapter boundary を変えない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L5-detail/legacy-helix-extension.md
    reason: "HLX-C01..12 の contract shape は維持。DB schema/API 契約は追加しない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/legacy-helix-extension.md
    reason: "RuntimeSurface を既存 RUN & Debug 語彙へ同期し、RunDebugTraceDecision / CoreInjectionDecision の返却 sketch を実装事実へ back-fill。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-HLX-001..013 を L7 unit oracle として登録。"
agent_slots:
  - role: tl
    slot_label: "TL - legacy adoption reverse back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-203-legacy-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/legacy-helix-extension.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
  requires:
    - docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
  references:
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:00:00+09:00"
    tests_green_at: "2026-06-30T03:00:00+09:00"
    verdict: approve
    scope: "Reverse back-fill confirms old HELIX semantic adoption L7 pure decisions map to existing L3-L6 contracts without changing user requirements, L4 module boundaries, or L5 data/API contracts."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:adcaf0a35af15962da14931847dd43fa3e7dc56b06c9c00ec42fe2b8be80057f"
---

# PLAN-REVERSE-203: old HELIX semantic adoption decision back-fill

## R0-R4 Summary

- R0: `src/runtime/legacy-adoption.ts` implements the old HELIX semantic adoption
  decisions that were lowered to L6.
- R1: The implementation is pure and does not port old Python/Bash runtime code.
- R2: L3/L4/L5 were checked; no new user requirement, module boundary, DB schema,
  or API contract is introduced by this slice.
- R3: L6 type sketch and L7 unit-test design were updated to match the current
  `RuntimeSurface` vocabulary and `U-HLX-001..013` implementation oracles.
- R4: `PLAN-L7-203-legacy-adoption-decisions` and this Reverse PLAN are linked
  through `dependencies.requires`.

## Back-Filled Meaning

The implementation makes legacy adoption decisions executable. HELIX can now
test whether a legacy capability should be adopted, hardened, deferred, rejected,
or routed to a new PLAN without treating old runtime files, global paths, or raw
state as current truth.

## Merge Boundary

This Reverse only back-fills L6 sketch and L7 unit oracle registration. It does
not claim full old-HELIX runtime parity, public CLI wiring, or DB projection for
every decision helper.
