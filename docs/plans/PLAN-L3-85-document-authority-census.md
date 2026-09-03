---
plan_id: PLAN-L3-85-document-authority-census
title: "PLAN-L3-85 (redesign): Document Authority Census"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #1381 Document Authority CensusをL1/L3/L10へmaterializeする"
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1381
behavior_contract_id: DOCUMENT-AUTHORITY-CENSUS-001
responsibility_owner: document-authority-census
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
backprop_decision: not_required
backprop_decision_reason: "本PLANがIssue上で先行した複合CapabilityをL1/L3/L10 source authorityへ戻すAuthority Sliceである。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1372、#825、#1370、#397、#206の責務境界をread-afterできる"
contract_postconditions: "5 business request、10 functional request、13 requirement、23 acceptanceがplan固有承認候補になる"
contract_invariants: "候補非authority、exact HEAD、class/disposition分離、scanner非書換え、legacy非昇格を維持する"
contract_failures: "startup leak、dual authority、dead binding、generator drift、semantic epoch drift、新規debt相殺、自動削除を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認requirements candidateのみを起草し、runtime／rule enforcementは承認後のL4以降へ分離する。"
complexity_effect: net_negative
complexity_justification: "散在する文書規則とconsumer edgeを一つのtyped censusへ束ね、重複scannerと人手棚卸しを削減する。"
removal_trigger: "candidateがplan固有承認とcanonical promotionを経てcurrent source authorityへ置換された時"
parent_design: docs/governance/candidates/document-authority-census-requests.md
pair_artifact: docs/governance/candidates/document-authority-census-acceptance.md
dependencies:
  parent: docs/governance/candidates/document-authority-census-requests.md
  requires: []
  references:
    - issue:206
    - issue:397
    - issue:825
    - issue:1370
    - issue:1372
    - issue:1381
  blocks:
    - issue:1372
generates:
  - { artifact_path: docs/plans/PLAN-L3-85-document-authority-census.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/document-authority-census-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/document-authority-census-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/document-authority-census-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — 文書利用者と誤読影響" }
  - { role: se, slot_label: "SE — class／lifecycle／consumer graph" }
  - { role: qa, slot_label: "QA — stale authority／generator drift／baseline反例" }
  - { role: tl, slot_label: "TL — #825／#1370／#206との責務境界" }
review_evidence: []
---

# Document Authority Census（文書正本センサス）

## Authority境界

本PLANはdraftである。plan固有human approval前はcandidateをcanonical L1/L3/L10、Requirement IR、runtime、
schema、DB、CLI、doctor、startup packetへ昇格しない。

## 実装順

1. candidateのplan固有承認とcanonical source authority化
2. main反映後の再読と#397 Requirement IR admission
3. #1372 DC-01からDC-10
4. #825／#1370とのaggregate gate
5. #206優先是正のfinding receipt接続
6. Reverse fullbackとmain収束
