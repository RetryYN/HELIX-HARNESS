---
plan_id: PLAN-L4-62-worker-isolation-broker
title: "PLAN-L4-62 (add-design): worker isolation broker基本設計"
kind: recovery
layer: L4
drive: agent
status: draft
route_mode: recovery
entry_signals: ["po_directive:Feature #92 Issue #226 WCC-FR-03を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "WCC-FR-01/02がmainでgreenでありLinux bubblewrap backendを利用できる"
contract_postconditions: "入力snapshotとworker processだけを隔離scratchへ束縛しrepo/state/DB/credentialを不可視にする"
contract_invariants: "git history 0、host env継承0、main write 0、WCC-FR-04以降混載0"
contract_failures: "platform/backend/boundary/source/wrapper/admission/runtimeをspawn前にfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存adapter capabilityとdescriptor admissionを再利用しbroker module 1件だけを追加する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-isolation-broker-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — isolation boundary／runtime inventory" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — WCC-FR-04以降の非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-isolation-broker-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-497-worker-descriptor-admission.md
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  blocks:
    - docs/plans/PLAN-L5-88-worker-isolation-broker.md
---

# PLAN-L4-62: worker isolation broker基本設計

実在sourceと外部隔離backendをinventoryし、snapshot-only input、sealed launch、fresh admission、repo/state/DB/credential不可視の
L4 componentとL9 oracleを固定する。secret classificationとnetwork policyはWCC-FR-04へ分離する。
