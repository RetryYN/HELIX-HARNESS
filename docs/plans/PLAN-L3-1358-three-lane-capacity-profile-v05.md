---
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
title: "PLAN-L3-1358: 三社レーン動的capacity profile v0.5"
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
  - "po_directive:Codex／Cursor workerを定常3・最大5、Claude reviewerを定常2とする将来capacityを要求へ保持する"
created: 2026-09-09
updated: 2026-09-09
owner: Codex / TL
github_issue_id: 1358
behavior_contract_id: THREE-LANE-DYNAMIC-CAPACITY-PROFILE-001
responsibility_owner: three-lane-cloud-governance-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "現行三社レーンauthorityへadditiveなprovider別capacity profileを追加する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "PLAN-L3-78 confirmedと現行3L-R-11／RLO-FR-021..024／WCC-FR-14をread-afterできる"
contract_postconditions: "provider別pool、active WIP、review、merge capacityと段階拡張条件がL1/L3/L10/L12候補で閉じる"
contract_invariants: "三社lane exact set、Codex control reserve、Cursor 1→2→3 canary、Claude独立review、8-slot能力上限を維持する"
contract_failures: "pool上限の常時稼働化、無測定burst、下流詰まり時dispatch、stale review receiptを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは要求候補のみで、runtime oracleはcanonical promotionと実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "固定lane数の混同をprovider pool／active WIP／review／merge capacityへ分離し、backpressureを一元化する。"
removal_trigger: "v0.5候補がcanonical L1/L3/L10/L12とRequirement IRへ移管された時"
parent_design: docs/governance/candidates/three-lane-capacity-profile-requests.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-acceptance.md
dependencies:
  parent: PLAN-L3-78-three-lane-cloud-governance-authority
  requires:
    - docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md
  references:
    - issue:214
    - issue:819
    - issue:1293
    - issue:1358
    - issue:1359
    - issue:1649
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1358-three-lane-capacity-profile-v05.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-recognition.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — pool／active／review／merge capacity境界" }
  - { role: qa, slot_label: "QA — 段階拡張、backpressure、review lease、JIT receipt反例" }
review_evidence: []
---

# 三社レーン動的capacity profile v0.5

Issue #1358のcapacity delta追跡点を会話・コメントだけに残さず、L1/L3/L10/L12候補へmaterializeする。
既存PLAN-L3-78のconfirmed v0.4を遡及変更せず、v0.5 additive deltaとして独立review、承認束縛、canonical promotion、Requirement IR admissionを行う。

本PLANはruntime WIPを直ちに増やさない。Cursor 1レーンの継続投入、2→3への実測拡張、Codex／Cursor burst、Claude reviewer追加をそれぞれtyped admissionで有効化する。
