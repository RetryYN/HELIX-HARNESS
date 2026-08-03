---
plan_id: PLAN-L6-102-worker-risk-admission
title: "PLAN-L6-102 (add-design): worker risk admission関数設計"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 WCC-FR-08をFR-07後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-94がfailure/reason exact setを固定"
contract_postconditions: "risk reader、decision、receipt guardのtyped APIを固定"
contract_invariants: "pure core、sealed input、critical非数値化、stable sort"
contract_failures: "copy、duplicate risk、critical finding、missing evidence、effort fixation"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存benchmark capabilityへ一方向importするpure module一件"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L6-worker-risk-admission-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed pure API" }
  - { role: qa, slot_label: "QA — mutation point" }
  - { role: tl, slot_label: "TL — implementation boundary" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-worker-risk-admission-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-94-worker-risk-admission.md
  blocks: [docs/plans/PLAN-L7-505-worker-risk-admission.md]
---

# PLAN-L6-102: worker risk admission関数設計

implementation可能なpure APIとmutation pointを固定する。
