---
plan_id: PLAN-L3-89-mechanism-adequacy-authority
title: "PLAN-L3-89 (add-design): 既存機構の充足性評価をUILへ統合する要求候補"
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
  - "po_directive: Issue #1248 機構充足性要求の取込依頼。意味承認・実行許可ではない"
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1248
behavior_contract_id: MECHANISM-ADEQUACY-AUTHORITY-001
responsibility_owner: universal-improvement-mechanism-adequacy
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "新要求を既存UILの拡張候補へ整理する上流slice。currentやruntimeへ意味を先行投影しない。"
no_code_decision: no_change
ddd_modeling_decision: policy
contract_preconditions: "原稿と現行UIL-R-04/05、UIL-R-06..15、対応L10を参照できる"
contract_postconditions: "原稿6要求を8要件候補・21受入候補へ分解し、原文と移管traceを保持する"
contract_invariants: "六分類はscope・change class・routeとは独立。新loop、DB正本、scheduler、承認gateを作らない"
contract_failures: "未接続・検索漏れ・予算切れ・AI主張の新機構必要への誤昇格、反証破棄、未知の成功化を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは未承認候補の分解のみ。原文一致、ID集合、双方向trace、リンクを明示検証し、runtimeとcurrent IRを変更しない。"
complexity_effect: net_negative
complexity_justification: "UIL-04をownerとし既存の配車・測定・Learningを参照する。機構台帳や独立発明engineの重複を避ける。"
removal_trigger: "候補承認、独立検収、canonical version-up、main read-after、IR admission後にcurrent sourceへ移管する"
parent_design: docs/governance/candidates/mechanism-adequacy-requests.md
pair_artifact: docs/governance/candidates/mechanism-adequacy-acceptance.md
dependencies:
  parent: docs/governance/candidates/mechanism-adequacy-requests.md
  requires: []
  references:
    - issue:1248
    - issue:1210
    - issue:1033
    - issue:1036
    - issue:1039
    - issue:1384
    - issue:1035
    - issue:1409
    - issue:1344
    - issue:397
    - issue:1494
    - issue:1500
    - docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
    - docs/test-design/helix/universal-improvement-loop-acceptance.md
  blocks: []
generates:
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-vision.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-recognition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-89-mechanism-adequacy-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-acceptance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/mechanism-adequacy-intake.md, artifact_type: markdown_doc }
agent_slots:
  - { role: tl, slot_label: "TL — UILとSystem Synthesisの責務境界" }
  - { role: qa, slot_label: "QA — 原文保存と六分類の反例・trace" }
review_evidence: []
---

# 機構充足性評価の要求候補

原稿追加依頼を意味承認へ読み替えない。status draftとcompletion falseを維持する。
既存#1248へ接続するが、そのruntime sliceを本候補の承認前に拡張しない。
候補受付の参照： https://github.com/RetryYN/HELIX-HARNESS/issues/1248#issuecomment-5548311084

## 収束境界

原文保存、8要件・21AC、移管traceを揃える。L1目的とL12の観測指標は既存UILへ接続する。
独立検収とPLAN/正本への保全前はroot原稿を削除しない。共有rootの他変更は触らない。
mainおよびopen branchの番号予約をPR admission時に再検査し、snapshotは正規生成手順で更新する。
要件正本のversion-up、IR、runtime、Web横断利用、Releaseは後続であり、本候補の完了と混同しない。
