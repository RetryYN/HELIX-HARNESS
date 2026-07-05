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

# PLAN-REVERSE-219: semantic frontier midlayer closure の反映

## Reason

PO は、作業が file count や短時間の green test ではなく、意味で検査されているかを問い直した。
chain を再読すると、L3、L6、L12、L7 unit design はすでに `semantic_feature_frontier_record` を保持していた。
しかし middle design layer の L4/L5 と、その pair test である L9/L8 は、visualization amendment が
out of scope であることだけを述べていた。そこでは分類語彙全体が保持されていなかった。

これは実際の design weakness だった。requirement amendment が L3 では可視のままでも、汎用的な L4/L5 block に
吸収されると、first response や選択された green test が full descent のように見えてしまう。

## R4 Forward Routing の扱い

Forward route は既存の HELIX pillar design chain である。この PLAN は新しい runtime work を承認せずに、
middle layer を hardening する。

- `frontier_pending_decision` は S4 routing まで、現在の L4/L5/L8/L9 pass の外側に残す。
- `parked_future_version` は activation decision まで、現在の completion の外側に残す。
- `approval_gated_cutover` は cutover と action-binding approval まで、audit / plan-only のまま残す。

## Review

これは design-only correction である。`.helix -> .helix` は適用せず、serverless / version-up work も有効化しない。
また、`PLAN-DISCOVERY-10` を S3 から昇格させない。
