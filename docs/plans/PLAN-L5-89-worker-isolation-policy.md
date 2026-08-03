---
plan_id: PLAN-L5-89-worker-isolation-policy
title: "PLAN-L5-89 (add-design): worker isolation policy詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Issue #226 WCC-FR-04を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-63がcomponentとL9 oracleを固定する"
contract_postconditions: "failure exact set、sealed policy、scope diff contractが実装可能になる"
contract_invariants: "raw secret保存0、host egress 0、glob scope 0、repo promotion 0"
contract_failures: "5 failure codeをexecutable oracleとmutationへ束縛する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存secret SSoT、wrapper identity、broker scratchを再利用する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — failure／policy contract" }
  - { role: qa, slot_label: "QA — reachability／mutation" }
  - { role: tl, slot_label: "TL — Design Reality Binding監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-policy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-63-worker-isolation-policy.md
  blocks:
    - docs/plans/PLAN-L6-97-worker-isolation-policy.md
---

# PLAN-L5-89: worker isolation policy詳細設計

5 failure、bounded post-state、generic failure output、mutation reachabilityを固定する。
