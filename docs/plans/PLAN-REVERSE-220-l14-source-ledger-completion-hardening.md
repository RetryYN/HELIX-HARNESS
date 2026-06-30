---
plan_id: PLAN-REVERSE-220-l14-source-ledger-completion-hardening
title: "PLAN-REVERSE-220: L14 source ledger completion hardening"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
drive: fullstack
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
forward_routing: L1
promotion_strategy: reuse-with-hardening
agent_slots:
  - role: tl
    slot_label: "TL - L14 completion evidence hardening"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-220-l14-source-ledger-completion-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: tests/vmodel-pair.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
  requires:
    - docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    - docs/process/forward/L08-L14-verification-phase.md
    - docs/process/gates.md
  blocks: []
backprop_scope:
  - layer: L14-operational-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "L14 operational tests now require fresh source ledgers and fresh completion decision packets before accepting whole-program completion."
  - layer: regression-test
    decision: updated
    evidence_path: tests/vmodel-pair.test.ts
    reason: "V-pair regression now fails if the L1↔L14 pair drops source ledger freshness, source meaning review, or completion packet freshness wording."
---

# PLAN-REVERSE-220: L14 source ledger completion hardening

## Reason

The active objective asks for L14 completion, version-up handling, and stronger
test/verification strategy based on external grounding. The lower completion
lint already rejects stale completion decision packets, and the right-arm
process document defines source ledger freshness. The L1↔L14 operational test
pair, however, did not directly require those same conditions.

That left a semantic gap: the completion machinery could be strong while the
L14 operational oracle remained too broad.

## R4 Forward Routing

Route back to L1 because this is the L1 requirement pair executed at L14. The
change hardens the test-design side only:

- source ledgers older than 90 days, future-dated ledgers, and date-only refresh
  are not completion evidence;
- source refresh must record `source_status_delta`, `adoption_decision_delta`,
  and `workflow_route_impact`;
- `completionDecisionPacket` must be fresh and aligned with
  `outstanding.completionReadiness`;
- `outstanding.completionReadiness.ok=false` still blocks whole-program and L14
  completion.

## External Basis

- NIST SSDF SP 800-218: evidence must be traceable to implemented software,
  environment, review, and remediation records.
- GitHub Environments required reviewers: deployment approvals are scoped
  reviewer evidence, not generic prose approval.
- SLSA Provenance v1.2: provenance ties generated artifacts to builder,
  materials, and timestamps.
- OWASP LLM06:2025 Excessive Agency: irreversible agentic actions require
  constrained authority and oversight.

## Non-Goals

This plan does not approve `.ut-tdd -> .helix` cutover, does not activate
serverless/version-up work, and does not decide pending S4 Discovery work.
