---
plan_id: PLAN-L3-79-requirements-authority-materialization-gate
title: "PLAN-L3-79 (redesign): 要求・要件authority materialization gate"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-04T18:03:15Z"
  plan_id: PLAN-L3-79-requirements-authority-materialization-gate
  approval_record_id: L3-PO-1364-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1364#issuecomment-5544537978"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #825で確認したIssue本文先行4件をsource authorityへmaterializeする"
created: 2026-09-02
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1364
behavior_contract_id: REQUIREMENTS-AUTHORITY-MATERIALIZATION-GATE-001
responsibility_owner: requirements-authority-materialization-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
backprop_decision: not_required
backprop_decision_reason: "本PLAN自身がIssue-only意味契約をsource L1/L3/L10へ戻し、runtime先行を止めるRequirement Re-entry authority sliceであるため、別のbackprop vehicleは不要。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#825のexact 4件inventoryと#397のsemantic synthesis non-scopeをread-afterできる"
contract_postconditions: "L1/L3/L10 candidateと14 oracleがplan固有承認境界へ束縛され、JSON-only semantic authorityとhuman freezeを分離する"
contract_invariants: "Issue prose非正本、source-of-derivation先行、IR JSON一方向投影、dual authority禁止、auto-admit/freeze分離、composite非相殺、slice dependency分離を維持する"
contract_failures: "Issue直IR、candidate直runtime、confirmed Markdownの第二正本化、AI自己freeze、stale digest、複合coverage相殺、過剰block、依存漏れを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはrequirements candidateとhuman gate recordを束縛し、runtime gateとtest codeは独立review・canonical freeze後のL4以降へ分離する。"
complexity_effect: net_negative
complexity_justification: "散在するIssue prose→authority gapを1つのmaterialization contractとtyped dispositionへ収束する。"
removal_trigger: "candidateがplan固有承認とcanonical promotionを経てcurrent source authorityへ置換された時"
parent_design: docs/governance/candidates/requirements-authority-materialization-requests.md
pair_artifact: docs/governance/candidates/requirements-authority-materialization-acceptance.md
dependencies:
  parent: docs/governance/candidates/requirements-authority-materialization-requests.md
  requires: []
  references:
    - issue:825
    - issue:397
    - issue:1017
    - issue:1169
    - issue:1292
    - issue:1318
    - issue:1364
  blocks:
    - issue:397
generates:
  - { artifact_path: docs/plans/PLAN-L3-79-requirements-authority-materialization-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirements-authority-materialization-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirements-authority-materialization-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirements-authority-materialization-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — Issue discoveryからsource authorityへの一方向還流" }
  - { role: se, slot_label: "SE — composite capabilityとslice dependencyの別軸化" }
  - { role: qa, slot_label: "QA — 12 negative oracleとstale／partial trace" }
  - { role: tl, slot_label: "TL — #825／#397／4 ownerの責務分離" }
review_evidence: []
---

# 要求・要件authority materialization gate

## Authority境界

本PLANのL3 human gateは成立済みである。独立技術review、canonical L1/L3/L10 promotion、main read-afterまで、candidateをRequirement IR、runtime、DB、generated current docsへ昇格しない。

## 実装順

1. candidateのplan固有承認とcanonical source authority化
2. #1169／#1017／#1292／#1318のAuthority Sliceをowner別に起草
3. #397へsource revision/digest付きでIR admission
4. Issue intake gate
5. PLAN/runtime admission gate
6. 複合capability／slice依存oracle
7. 変更scope PR gate、定期全体監査、doctor／DB projection
