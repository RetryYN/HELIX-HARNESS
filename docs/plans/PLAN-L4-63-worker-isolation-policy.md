---
plan_id: PLAN-L4-63-worker-isolation-policy
title: "PLAN-L4-63 (add-design): worker isolation policy基本設計"
kind: add-design
layer: L4
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
contract_preconditions: "WCC-FR-03 brokerがmainでgreenである"
contract_postconditions: "secret／unknown、network、scope外diffを実行境界でfail-closeする"
contract_invariants: "1 behavior、1 owner、deny-all network、repo write 0、FR-05/06混載0"
contract_failures: "policy unresolved、secret、egress unsupported、scope invalid／violation"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "provider別policyやfirewall ledgerを作らず既存brokerへpolicy module 1件を接続する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-isolation-policy-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — secret/network/scope境界" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — FR-05/06非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-policy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-isolation-policy-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-499-worker-isolation-broker.md
  blocks:
    - docs/plans/PLAN-L5-89-worker-isolation-policy.md
---

# PLAN-L4-63: worker isolation policy基本設計

task sensitivity、deny-all network、post-state write scopeを同一policy capabilityへ束縛する。
