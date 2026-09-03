---
plan_id: PLAN-L3-84-helix-concept-v4-upgrade
title: "PLAN-L3-84 (redesign): HELIX Concept v4.0への更新"
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
  - "po_directive:Issue #1496でHELIX Concept v4.0候補をL1／L3／L10へ最適化して取り込む"
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1496
behavior_contract_id: HELIX-CONCEPT-V4-UPGRADE-001
responsibility_owner: concept-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "本PLAN自体がv3.1と現行機能の差をL1／L3／L10候補へ戻すAuthority Sliceである。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "v3.1、current requirements、L0 charter、#1364、#1448、#1494をread-afterできる"
contract_postconditions: "v4 Concept、L1 request、L3 requirement、L10 acceptance、capability evidence、人間向けREADME projectionが同一contractへ束縛される"
contract_invariants: "未承認candidateはcurrent authority／IR／runtime／DBへ投影しない。provider固定topology、進捗snapshot、旧identityを不変Conceptへ混在させない"
contract_failures: "runtime ahead of authority、READMEからのauthority生成、v3.1先行降格、approval捏造、legacy identity再出力を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認ConceptとL1／L3／L10候補の起草だけを行い、runtime／schema／DB変更は承認後の後続PLANへ分離する。"
complexity_effect: net_negative
complexity_justification: "Harness全体、Control Plane、DevOS、Adaptationの混在を8 Planeと責務境界へ整理する。"
removal_trigger: "candidateがplan固有承認、Requirement IR admission、canonical promotionを経てv4.0 current authorityへ置換された時"
parent_design: docs/governance/candidates/helix-concept-v4-requests.md
pair_artifact: docs/governance/candidates/helix-concept-v4-acceptance.md
dependencies:
  parent: docs/governance/helix-harness-concept_v3.1.md
  requires: []
  references:
    - "issue:204"
    - "issue:397"
    - "issue:1033"
    - "issue:1073"
    - "issue:1358"
    - "issue:1364"
    - "issue:1370"
    - "issue:1409"
    - "issue:1430"
    - "issue:1448"
    - "issue:1488"
    - "issue:1494"
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-84-helix-concept-v4-upgrade.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4.0.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4-acceptance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4-capability-delta.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-concept-v4-readme-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/README.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: po, slot_label: "PO — product identityと利用者価値" }
  - { role: se, slot_label: "SE — 8 Planeとtyped contract境界" }
  - { role: qa, slot_label: "QA — 22 acceptance／negative oracle" }
  - { role: tl, slot_label: "TL — v3.1移行、requirements、IR、runtime境界" }
review_evidence: []
---

# HELIX Concept v4.0更新PLAN

## Authority境界

本PLANはdraftである。plan固有human approvalまではcandidateをcurrent Concept、Requirement IR、runtime、
DB、root READMEへ昇格しない。

## 実装順

1. v3.1、requirements、L0、既存capabilityとのsemantic diffを確認する。
2. Conceptの不変定義と実装例、maturity snapshot、provider topologyを分離する。
3. L1 request、L3 requirement、L10 acceptanceをplan固有承認候補としてfreezeする。
4. 承認後にcurrent Conceptをv4へversion-upし、#397でRequirement IRへadmitする。
5. governance index、root README、AGENTS／CLAUDE、startup packetを同じauthority revisionから投影する。
6. v3.1をcompatibility／historicalへ降格し、旧identityのcurrent再出力をdoctorで拒否する。
7. targeted、mutation、full CI、DB replay、independent exact-HEAD review、main read-after、consumer smokeを行う。

## 今回の非対象

- current root READMEの書換え
- runtime、schema、DBの新規実装
- repository／CLI／state directoryのrename
- tag、publish、DevOSのcutover
- provider固定topologyの正本化
