---
plan_id: PLAN-L6-88-requirement-discovery-event-projection
title: "PLAN-L6-88 (add-design): Requirement Discovery event／candidate projection"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 Requirement Discovery LoopからL3 strict JSON正本へ収束する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 284
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-DISCOVERY-EVENT-PROJECTION
responsibility_owner: requirement-discovery-event-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PR #289のRDJ-FR-002/003/005/007契約と既存RequirementDefinitionLedgerが存在する"
contract_postconditions: "17種のappend-only eventと非canonical candidate projectionのL6/L7契約が実装可能な粒度で確定する"
contract_invariants: "別Requirement Engine／DBを作らず、L3 canonical write authorityを持たず、human decisionを捏造しない"
contract_failures: "event改変、sequence/digest不連続、unknown event、invalid lifecycle、AI acceptance、score-only convergenceを拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "17 event種のstrict schemaとpure projectionを新設するため正味増加するが、既存RequirementDefinitionLedger前段の一責務に限定し、DB/CLI/別engineを追加しない"
removal_trigger: "G1/G3後のRequirement Discovery Engineが同一schema/projectionを吸収し本移行componentのconsumerが0になった時点"
parent_design: docs/design/helix/L5-detail/requirement-translation-obligation.md
pair_artifact: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
generates:
  - { artifact_path: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  requires:
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  references:
    - docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks:
    - docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md
---

# PLAN-L6-88: Requirement Discovery event／candidate projection

既存Requirement Engineへ接続するL2 shadow event schema、candidate lifecycle、question／reaction／agreement、
deterministic projection、10条件収束を一つのpure component境界へ設計する。

本PLANのconfirmはL6設計とL7 test-designのpair freezeだけを意味し、実装、L3 canonical cutover、
G1/G3 freeze、Requirement Discovery Engine runtime完了を意味しない。
