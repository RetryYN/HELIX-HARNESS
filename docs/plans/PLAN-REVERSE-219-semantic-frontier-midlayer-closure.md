---
plan_id: PLAN-REVERSE-219-semantic-frontier-midlayer-closure
title: "PLAN-REVERSE-219: semantic frontier midlayer closure"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
drive: fullstack
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
agent_slots:
  - role: tl
    slot_label: "TL - semantic design re-read"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-219-semantic-frontier-midlayer-closure.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: tests/l0-l8-design-consistency-audit.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-REVERSE-210-l0-l8-design-consistency-audit.md
  requires:
    - docs/plans/PLAN-REVERSE-210-l0-l8-design-consistency-audit.md
  blocks: []
backprop_scope:
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "L4 now preserves G-SF semantic frontier classifications rather than only saying visualization is outside the confirmed block set."
  - layer: L5-detail-design
    decision: updated
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "L5 now preserves G-SF classifications across contract boundaries so first-response artifacts cannot be mistaken for revised-request descent."
  - layer: L9-system-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L4-pillar-system-test-design.md
    reason: "L9 system expectations now keep frontier/parked/cutover states out of system pass."
  - layer: L8-integration-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    reason: "L8 integration expectations now require semantic frontier preservation across projection/evidence joins."
---

# PLAN-REVERSE-219: semantic frontier midlayer closure

## Reason

The PO challenged whether the work was being checked by meaning rather than by
file count or quick green tests. Re-reading the chain showed that L3, L6, L12,
and L7 unit design already carried `semantic_feature_frontier_record`, but the
middle design layers L4/L5 and their L9/L8 pair tests only said that the
visualization amendment was out of scope. They did not preserve the full
classification vocabulary.

That was a real design weakness: a requirement amendment could be kept visible
at L3, then be absorbed into generic L4/L5 blocks, making a first response or
selected green test look like full descent.

## R4 Forward Routing

Forward route is the existing HELIX pillar design chain. This plan hardens the
middle layers without approving new runtime work:

- `frontier_pending_decision` remains outside current L4/L5/L8/L9 pass until S4
  routing.
- `parked_future_version` remains outside current completion until activation
  decision.
- `approval_gated_cutover` remains audit/plan-only until cutover and
  action-binding approval.

## Review

This is a design-only correction. It does not apply `.ut-tdd -> .helix`, does
not activate serverless/version-up work, and does not promote
`PLAN-DISCOVERY-10` out of S3.
