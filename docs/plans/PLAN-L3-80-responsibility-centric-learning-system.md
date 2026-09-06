---
plan_id: PLAN-L3-80-responsibility-centric-learning-system
title: "PLAN-L3-80 (redesign): 責務中心Learning System authority"
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
  plan_id: PLAN-L3-80-responsibility-centric-learning-system
  approval_record_id: L3-PO-1384-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1384#issuecomment-5544537975"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:責務中心ナレッジ学習システム指示書を最適化して要求・要件へ取り込む"
created: 2026-09-02
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1384
behavior_contract_id: RESPONSIBILITY-CENTRIC-LEARNING-001
responsibility_owner: responsibility-centric-learning-system
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLAN自身が指示書候補をL1/L3/L10へ戻すRequirement Re-entry authority sliceであるため、別backprop vehicleは不要。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1384と#1382/#1370/#1372/#1035/#1318/#1295のowner境界をread-afterできる"
contract_postconditions: "L1/L3/L10 candidate、23 requirement、20 oracle、12 implementation sliceがplan固有承認境界へ束縛される"
contract_invariants: "responsibility-first、channel分離、independent VERIFY、deterministic retrieval、段階昇格、失効、authority語彙分離、既存authority非侵害を維持する"
contract_failures: "agent/skill owner化、全知識注入、自己検証昇格、learningからのhuman authority生成、cross-project漏洩、vector authority化、DB第二正本、既存Capability再実装を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認requirements candidateだけを起草し、runtime gateとtest codeは承認後のL4以降へ分離する。"
complexity_effect: net_negative
complexity_justification: "散在するmemory/skill/pattern/bench/learning責務を一つの責務中心契約と既存owner edgeへ収束する。"
removal_trigger: "candidateがplan固有承認とcanonical promotionを経てcurrent source authorityへ置換された時"
parent_design: docs/governance/candidates/responsibility-centric-learning-requests.md
pair_artifact: docs/governance/candidates/responsibility-centric-learning-acceptance.md
dependencies:
  parent: docs/governance/candidates/responsibility-centric-learning-requests.md
  requires: []
  references:
    - issue:397
    - issue:826
    - issue:1033
    - issue:1035
    - issue:1282
    - issue:1295
    - issue:1296
    - issue:1318
    - issue:1324
    - issue:1370
    - issue:1372
    - issue:1382
    - issue:1384
    - issue:1580
    - issue:863
    - issue:865
  blocks:
    - issue:397
generates:
  - { artifact_path: docs/plans/PLAN-L3-80-responsibility-centric-learning-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/responsibility-centric-learning-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/responsibility-centric-learning-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/responsibility-centric-learning-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — responsibility-first learningと既存authority非侵害" }
  - { role: se, slot_label: "SE — asset、index、promotion、mechanization境界" }
  - { role: qa, slot_label: "QA — 20 negative oracleとbefore/after測定" }
  - { role: tl, slot_label: "TL — #1382等とのowner重複排除" }
review_evidence: []
---

# 責務中心Learning System authority

## Authority境界

本PLANはIssue #1384のtyped human gate recordでL3候補承認済みである。canonical昇格、Requirement IR admission、runtime、DB、generated current docsへの反映は別工程とし、draftとcompletion falseを維持する。候補authority statusのtyped lifecycleはIssue #1580が所有する。

承認対象は承認時点main `ab6126a89262c91ecc4b87a0b8f0b9724917c84b` の3候補本文である。frontmatterを除いたSHA-256はrequests `b70486bb7488e4a6c94e1fd562ea69985d64c27e49f0b23458beb38564fb304e`、requirements `7f4ae0538b9940eabd9459719ffb755ed7735278915ce6feb7d05afb97d77acd`、acceptance `27a0223bb6231fc0637b0d0bf70d0b27b256654462d178e1b9bad1da7c2a2e47`で、意味集合はBR 6件、FR 6件、AC 20件とする。後続のprovenance追記はこの承認対象本文を変更しない。

## 実装順

1. AuthorityとRequirement IR admission
2. Responsibility Learning Registry
3. CASE／SCENE／PATTERN／LOGの取込み
4. VERIFY ledger
5. 知識Index／Retrieval Packet
6. Promotion／demotion
7. Mechanization pipeline
8. #1382 surface rationalization接続
9. three-lane injection
10. external/cross-project隔離
11. HELIX-Bench dogfood
12. Reverse fullback／mainのread-after

初期dogfoodはGitHub Governance、Testing/CI、Cursor Cloud Execution、Requirement Authorityの4責務とする。
