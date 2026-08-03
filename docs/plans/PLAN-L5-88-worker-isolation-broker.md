---
plan_id: PLAN-L5-88-worker-isolation-broker
title: "PLAN-L5-88 (add-design): worker isolation broker詳細設計"
kind: recovery
layer: L5
drive: agent
status: draft
route_mode: recovery
entry_signals: ["po_directive:Issue #226 WCC-FR-03をL5/L8へ降下する"]
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
contract_preconditions: "PLAN-L4-62がcomponent境界とL9 oracleを固定する"
contract_postconditions: "failure exact set、snapshot制限、sealed broker launch、process contractが実装可能になる"
contract_invariants: "1 behavior、1 owner、永続ledger 0、workflow 0、raw provider launch 0"
contract_failures: "7 prepare failureと1 execution capability failureを実行oracleで到達可能にする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "copy-based snapshotでgit worktree、git history、provider別brokerを不要にする"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — failure／resource contract" }
  - { role: qa, slot_label: "QA — reachability／mutation oracle" }
  - { role: tl, slot_label: "TL — Design Reality Binding監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-62-worker-isolation-broker.md
  blocks:
    - docs/plans/PLAN-L6-96-worker-isolation-broker.md
---

# PLAN-L5-88: worker isolation broker詳細設計

Design Reality Binding、failure reachability、mutation oracleを同一candidate HEADで閉じる。
