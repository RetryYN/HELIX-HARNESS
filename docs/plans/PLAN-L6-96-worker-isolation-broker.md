---
plan_id: PLAN-L6-96-worker-isolation-broker
title: "PLAN-L6-96 (add-design): worker isolation broker関数設計"
kind: recovery
layer: L6
drive: agent
status: draft
route_mode: recovery
entry_signals: ["po_directive:Issue #226 WCC-FR-03をL6/L7へ降下する"]
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-88がfailure exact setとdata contractを固定する"
contract_postconditions: "prepareとrunの2段階APIがcopy-only snapshotとbubblewrap processを成立させる"
contract_invariants: "sealed object identity、bounded bytes、fixed env、absolute backend/runtime executable"
contract_failures: "prepare failureはspawn 0、copied launchはspawn 0"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "broker 1 moduleへvalidation/staging/process boundaryを集約する"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L5-detail/worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — prepare/run関数境界" }
  - { role: qa, slot_label: "QA — sealed launch／process oracle" }
  - { role: tl, slot_label: "TL — bounded resource／authority監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-88-worker-isolation-broker.md
  blocks:
    - docs/plans/PLAN-L7-499-worker-isolation-broker.md
---

# PLAN-L6-96: worker isolation broker関数設計

`prepareWorkerIsolationLaunch`と`runWorkerIsolationLaunch`を分離し、検証済み同一objectだけをprocess境界へ渡す。
