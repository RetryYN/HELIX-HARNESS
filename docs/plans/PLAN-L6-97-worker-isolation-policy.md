---
plan_id: PLAN-L6-97-worker-isolation-policy
title: "PLAN-L6-97 (add-design): worker isolation policy関数設計"
kind: add-design
layer: L6
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-89がfailureとdata contractを固定する"
contract_postconditions: "attest／capability check／scope auditをbrokerへ結線できる"
contract_invariants: "deny-all egress、exact origin、bounded O_NOFOLLOW scan"
contract_failures: "policy failureはspawn 0、scope violationはresult/commit 0"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "policy module 1件とbroker接続だけでsecurity境界を閉じる"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L5-detail/worker-isolation-policy.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed policy API" }
  - { role: qa, slot_label: "QA — negative/mutation oracle" }
  - { role: tl, slot_label: "TL — network/scope実行監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-isolation-policy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-89-worker-isolation-policy.md
  blocks:
    - docs/plans/PLAN-L7-500-worker-isolation-policy.md
---

# PLAN-L6-97: worker isolation policy関数設計

policy attest、identity再検査、deny-all argv、post-state auditを関数単位へ固定する。
