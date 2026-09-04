---
plan_id: PLAN-L3-86-harness-memory-coordination-boundary
title: "PLAN-L3-86 (add-design): harness memoryのcoordination-only境界"
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
  # 現行routerのcompatibility input。本文の意味authorityまたは承認記録ではない。
  - "po_directive:Issue #1448 harness memoryのcoordination-only境界をL1/L3/L10候補へ戻す"
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1448
behavior_contract_id: HARNESS-MEMORY-COORDINATION-ONLY-001
responsibility_owner: harness-memory-coordination-boundary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存のmemory runtimeに先行した意味混入をL1/L3/L10のsource authority候補へ戻す。既存memoryの削除・再解釈は行わない。"
no_code_decision: no_change
ddd_modeling_decision: policy
contract_preconditions: "#1449のauthority語彙境界、#1188のretention責務、#397のRequirement IR境界を参照できる"
contract_postconditions: "coordination-onlyのL1/L3/L10候補、20件以上の受入候補、legacy隔離方針がplan固有承認境界へ束縛される"
contract_invariants: "memoryは正本・知識・個人設定・承認を保持せず、typed pointerと有期限coordinationだけを運ぶ。候補は承認前にcurrentへ投影しない"
contract_failures: "AI解釈のhuman authority化、暗黙current-plan継承、stale pointer、偽のsession provenance、superseded再浮上、personalization混入、legacy成功によるcurrent失敗相殺を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認のL1/L3/L10 source authority候補と受入候補を起草し、runtime／schema／DB／SessionStartの変更は承認後の後続sliceへ分離する。"
complexity_effect: net_negative
complexity_justification: "harness memory、project memory、provider native memoryの責務混在を一つのbounded coordination contractへ整理し、既存の正本を複製しない。"
removal_trigger: "candidateがplan固有承認、canonical merge、#397 IR admissionを経てcurrent source authorityへ置換された時"
parent_design: docs/governance/candidates/harness-memory-coordination-boundary-requests.md
pair_artifact: docs/governance/candidates/harness-memory-coordination-boundary-acceptance.md
dependencies:
  parent: docs/governance/candidates/harness-memory-coordination-boundary-requests.md
  requires:
    - issue:1449
  references:
    - issue:1188
    - issue:1420
    - issue:397
    - issue:1448
    - docs/design/helix/L3-requirements/orchestration-memory.md
    - docs/design/helix/L3-requirements/orchestration-memory-runtime.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-86-harness-memory-coordination-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/harness-memory-coordination-boundary-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/harness-memory-coordination-boundary-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/harness-memory-coordination-boundary-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — memoryとknowledge／authorityの責務境界" }
  - { role: se, slot_label: "SE — envelope、pointer freshness、session provenance" }
  - { role: qa, slot_label: "QA — authority昇格、再浮上、再生、汚染隔離の反例" }
  - { role: tl, slot_label: "TL — #1449／#1188／#397との依存と承認境界" }
review_evidence: []
---

# harness memory coordination-only境界

本PLANは未承認のAuthority Sliceである。plan固有の承認、L3/L10対形成、#397 Requirement IR admission、canonical
main read-afterが完了するまで、候補の意味をcurrent requirements、runtime、schema、DB、CLI、SessionStart、Claude／Codex
managed ruleへ投影しない。

`po_directive:`は現行routerが受理するcompatibility inputであり、Issue本文や会話をPO authorityへ読み替える記録ではない。
#1448の監査事象は対象Issueとsource authority候補へ束縛し、承認実体がない状態ではcandidateのまま保持する。

## 実装・移行順

1. L1／L3／L10候補のplan固有承認とcanonical source authority化
2. #397 Requirement IR admissionとmain read-after
3. 現行harness／project／provider memoryのexact HEAD inventoryと汚染分類
4. coordination envelope、pointer freshness、TTL、ack、replayの型・受入実装
5. memory writerをcoordination envelopeへ移行し、暗黙current-plan継承を停止
6. current resolved view、DB projection、JSONL compaction、SessionStartのexact-set一致を実装
7. `#1188` retention／purgeと接続し、履歴非改竄と物理削除境界を検証
8. doctor、CI、mutation、Claude／Codex parityを検査し、Reverse fullbackとmain read-afterを完了する

## 完了境界

既存記録は削除・改竄・発言の再解釈をせず、`valid_coordination_pointer`、`unverified_human_claim`、
`runtime_interpretation`、`wrong_plan_provenance`、`retracted`、`audit_history`の分類候補へ隔離する。
current viewへ出してよいのは、現在のassignment等を再取得するためのtyped pointerと有期限の受渡し情報だけである。
memoryの候補を理由にRequirement、Design、ADR、Approval、Release、Assignmentの正本を直接変更してはならない。
