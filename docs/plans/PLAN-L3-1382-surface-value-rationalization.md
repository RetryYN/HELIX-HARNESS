---
plan_id: PLAN-L3-1382-surface-value-rationalization
title: "PLAN-L3-1382: Skill／Agent／Command Surface価値・置換・authority整理"
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
  - "po_directive:既存要求・IR・PRと照合し最小authority materialization sliceを作る"
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1382
behavior_contract_id: SURFACE-VALUE-RATIONALIZATION-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "Issue #1382からL1/L3/L10候補へmaterializeする上流要求sliceである。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1372 inventory、#1594 Skill移行、#863 obsolete ledger、#865 retirement gate、#397 IR admissionのowner境界を再利用する"
contract_postconditions: "SVR-BR-001、SVR-R-01..12、SVR-AC-001..012を候補sourceとしてexact対応させ、#397 admission前提を固定する"
contract_invariants: "runtime削除なし、旧保護解除なし、Issue proseからIRへの直接収載なし、unknownのREMOVE昇格なし"
contract_failures: "多重分類、usageだけの処分、provider内部reviewの独立receipt昇格、successor未成立の退役を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "L1/L3/L10候補のmaterializationのみ。runtime退役oracleはcanonical promotionとIR admission後の実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "既存ownerをtyped joinし、Skill／Agent／Command横断の重複した処分判断を単一契約へ収束する。"
removal_trigger: "候補がplan固有承認、canonical promotion、main read-after、#397 IR admissionを経てcanonical sourceへ移管された時"
parent_design: docs/governance/candidates/surface-value-rationalization-requests.md
pair_artifact: docs/governance/candidates/surface-value-rationalization-acceptance.md
dependencies:
  parent: docs/governance/candidates/surface-value-rationalization-requests.md
  requires: []
  references:
    - issue:397
    - issue:826
    - issue:863
    - issue:865
    - issue:1370
    - issue:1372
    - issue:1382
    - issue:1594
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1382-surface-value-rationalization.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/surface-value-rationalization-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/surface-value-rationalization-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/surface-value-rationalization-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — owner境界・価値評価・IR接続を整理" }
  - { role: qa, slot_label: "QA — unknown、誤分類、早期削除の反例を検証" }
review_evidence: []
---

# Skill／Agent／Command Surface価値・置換・authority整理

本PLANはIssue #1382のL1／L3／L10候補化だけを所有する。候補mergeを意味承認、canonical authority、
Requirement IR admission、runtime実装、consumer移行、旧surface退役として扱わない。

## 重複回避

- #1372のinventory／consumer graphを入力にし、別inventoryを作らない。
- #1594のSkill供給・移行機構へ処置候補を渡し、別Skill機構を作らない。
- #863／#865のledger／retirement gateへjoinし、別退役engineを作らない。
- #397にはcanonical main read-after後のsource identityだけを渡し、Issue本文や候補を直接JSON化しない。

## 後続slice

1. plan固有L3承認と独立技術review
2. canonical L1／L3／L10へのpromotionとmain read-after
3. #397でfamily単位のRequirement IR classification／admission
4. #1372 inventoryを使う全surface評価とconsumer graph join
5. #863／#865／#1594へ対象単位で処置をdispatch
6. successor E2E、consumer migration、rollback成立後だけ物理退役
