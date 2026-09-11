---
plan_id: PLAN-L3-85-document-authority-census
title: "PLAN-L3-85 (redesign): Document Authority Census"
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
  plan_id: PLAN-L3-85-document-authority-census
  approval_record_id: L3-PO-1381-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1381#issuecomment-5544538119"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #1381 Document Authority CensusをL1/L3/L10へmaterializeする"
created: 2026-09-04
updated: 2026-09-12
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
contract_postconditions: "承認済み5 business request、10 functional request、13 requirement、23 acceptanceがcanonical L1↔L12・L3↔L10 source pairとなる"
contract_invariants: "候補非authority、exact HEAD、class/disposition分離、scanner非書換え、legacy非昇格を維持する"
contract_failures: "startup leak、dual authority、dead binding、generator drift、semantic epoch drift、新規debt相殺、自動削除を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは承認済みsourceの配置とL12認識設計だけを所有し、runtime／rule enforcementはL4以降へ分離する。"
complexity_effect: net_negative
complexity_justification: "散在する文書規則とconsumer edgeを一つのtyped censusへ束ね、重複scannerと人手棚卸しを削減する。"
removal_trigger: "Requirement IR admissionと後続L4以降のPLANへ残義務が引き継がれ、candidate pathのconsumerが0になった時"
parent_design: docs/design/helix/L1-requirements/document-authority-census-requests.md
pair_artifact: docs/test-design/helix/document-authority-census-acceptance.md
dependencies:
  parent: docs/design/helix/L1-requirements/document-authority-census-requests.md
  requires: []
  references:
    - issue:206
    - issue:397
    - issue:825
    - issue:1370
    - issue:1372
    - issue:1381
    - issue:1580
  blocks:
    - issue:1372
generates:
  - { artifact_path: docs/plans/PLAN-L3-85-document-authority-census.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L1-requirements/document-authority-census-requests.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/document-authority-census-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/document-authority-census-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/document-authority-census-recognition.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/document-authority-census-source-promotion.test.ts, artifact_type: test_code }
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

本PLANはIssue #1381のtyped human gate recordで承認済みのL1/L3/L10 sourceをcanonical配置し、L1↔L12とL3↔L10を凍結する。
Requirement IR、runtime、schema、DB、CLI、doctor、startup packetへの反映は別工程とし、review完了まではdraftとcompletion falseを維持する。

承認対象は承認時点main `ab6126a89262c91ecc4b87a0b8f0b9724917c84b` の3候補本文である。frontmatterを除いたSHA-256はrequests `dbaacd0c908f507d4b77dd51782b35615c696c091069d771d638088f97db7a0f`、requirements `52380a9d84a3b9544f2650d2a7c3d2d54fa317338a5cc3f3c2990ec448ed0ee3`、acceptance `c64cd941e1c9839e655cf3c9291aa638ae285ee458e2e0005df89db6900aaf82`で、意味集合はBR 5件、FR 10件、R 13件、AC 23件とする。

承認記録commit `d5fdf560472d222616b6b58ab5d8b531481adf5a` はrequirements本文冒頭へ承認URLのprovenance行だけを追記したため、
main上の候補body digestは`d793764b0194c57b025d1efad55b34516c74ebd561417db9a1e33b6b267bf593`となる。要求表とID集合は承認対象から不変であり、
canonical配置では承認digestと配置後body digestを別fieldに保持する。provenance行の差を新しい要求承認へ読み替えない。

## 実装順

1. 承認済みcandidateのcanonical source authority化とL1↔L12・L3↔L10 pair freeze
2. main反映後の再読と#397 Requirement IR admission
3. #1372 DC-01からDC-10
4. #825／#1370とのaggregate gate
5. #206優先是正のfinding receipt接続
6. Reverse fullbackとmain収束
