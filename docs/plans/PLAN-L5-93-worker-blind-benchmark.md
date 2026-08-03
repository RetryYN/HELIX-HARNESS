---
plan_id: PLAN-L5-93-worker-blind-benchmark
title: "PLAN-L5-93 (add-design): worker blind benchmark詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 WCC-FR-07をFR-09後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-67がcomponentとblind boundaryを固定"
contract_postconditions: "definition/packet/judge output/host observation/receipt exact schemaと11 failureを固定"
contract_invariants: "weight合計100、pre-execution binding、identity blind、sealed provenance、stable ranking、FR-08非混載"
contract_failures: "11 failureのfixtureとmutation witnessをL8へ束縛"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "definition/packet/receipt capabilityと既存broker/output sealを再利用し永続ledgerを持たない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — exact schema/failure" }
  - { role: qa, slot_label: "QA — reachability" }
  - { role: tl, slot_label: "TL — design refactor gate" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-67-worker-blind-benchmark.md
  blocks:
    - docs/plans/PLAN-L6-101-worker-blind-benchmark.md
---

# PLAN-L5-93: worker blind benchmark詳細設計

blind scoreとeffective costを同じselection receiptへ固定する。
