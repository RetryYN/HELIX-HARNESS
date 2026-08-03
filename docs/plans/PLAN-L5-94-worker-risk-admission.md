---
plan_id: PLAN-L5-94-worker-risk-admission
title: "PLAN-L5-94 (add-design): worker risk admission詳細設計"
kind: add-design
layer: L5
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
contract_preconditions: "PLAN-L4-68が用途別componentを固定"
contract_postconditions: "exact request/receipt/reason/failureを固定"
contract_invariants: "critical pre-filter後だけscore/cost選択、finding digest保持"
contract_failures: "4 failureと7 decision reasonをL8 oracleへ束縛"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "numeric scoreへcritical findingを混入せず分岐を単純化"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — exact schema/failure設計" }
  - { role: qa, slot_label: "QA — failure reachability" }
  - { role: tl, slot_label: "TL — design refactor gate" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-68-worker-risk-admission.md
  blocks: [docs/plans/PLAN-L6-102-worker-risk-admission.md]
---

# PLAN-L5-94: worker risk admission詳細設計

重大findingと用途別selectionのexact contractを固定する。
