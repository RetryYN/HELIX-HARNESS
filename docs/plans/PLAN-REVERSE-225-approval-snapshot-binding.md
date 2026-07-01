---
plan_id: PLAN-REVERSE-225-approval-snapshot-binding
title: "PLAN-REVERSE-225 (reverse): approval snapshot binding"
kind: reverse
layer: cross
workflow_phase: R4
drive: agent
status: confirmed
confirmed_reverse_type: code
forward_routing: L5
promotion_strategy: reuse-with-hardening
created: 2026-07-01
updated: 2026-07-01
owner: Codex
agent_slots:
  - role: tl
    slot_label: "TL - reverse stale approval material"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-225-approval-snapshot-binding.md
---

# PLAN-REVERSE-225: approval snapshot binding

## R0 Evidence Acquisition

`version-up activation-packet` and `rename plan` were both plan-only and
approval-gated, but neither exposed a single snapshot binding ID tying approval
materials to the current packet. The packet listed reapproval triggers, yet
operators still had to compare scope, evidence, and blast radius manually.

README also still led new consumers through legacy setup shortcuts even
though the implemented HELIX project workflow is `ut-tdd setup project` with
`identifierTransition`, `consumerReadiness`, and `postSetupWorkflow`.

## R1 Observed Contracts

- Version-up activation must not proceed on stale HEAD/scope/source/evidence.
- L14 rename/cutover must not proceed on stale blast radius or stale backup /
  provenance evidence.
- Setup before PLAN-M-02 approval must use current `ut-tdd` / `.ut-tdd`, while
  `helix setup project` and `.helix` remain future targets.

## R2 As-Is Design

The surfaces were non-destructive but lacked a digest-level binding for the
reviewed material. README also weakened the intended setup route by pointing at
older setup shortcuts.

## R3 Intent Hypothesis

Approval packets should expose stable, non-secret snapshot IDs so later approval
records can be tied to the exact packet reviewed. Setup documentation should
route users through the same packetized workflow that code and tests already
expect.

## R4 Gap & Routing

Route to L6/L7 add-impl:

- L6/process design: define activation/cutover snapshot binding as stale
  approval prevention, not approval.
- L7 code: add snapshot IDs to activation and rename packets.
- L7 tests: assert digest shape and blast-radius drift behavior.
- README: replace legacy setup shortcut with `ut-tdd setup project` route.
