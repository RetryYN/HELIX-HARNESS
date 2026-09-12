---
plan_id: PLAN-M-03-in-review-repair-convergence
title: "PLAN-M-03: 検収内修復によるPR収束速度改善"
kind: design
layer: L1
sub_doc: functional
master_hub: true
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-13
updated: 2026-09-13
owner: PO / Codex TL
github_issue_id: 1778
behavior_contract_id: HELIX-IN-REVIEW-REPAIR-CONVERGENCE-001
responsibility_owner: resident-lane-requirements-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: reuse
ddd_modeling_decision: value_object
entry_signals:
  - "po_directive:収束速度改善要求を早期に管理層へ追加する"
contract_preconditions: "既存のAssignment、独立review、Node admission、GitHub PR管理境界を再利用できる"
contract_postconditions: "検収内修復と成功証拠継承のL1要求・L12認識対が成立し、L3以降の未実装義務がIssue #1778へ残る"
contract_invariants: "新しいscheduler、Assignment台帳、merge engine、承認制度を増設しない"
contract_failures: "要求変更や正本矛盾を検収担当が勝手に修復・承認・完了へ変換しない"
tdd_red_required: false
tdd_red_waiver_reason: "L1要求受領とL12認識対だけを固定する設計sliceであり、実装TDDはL3以降へ残す"
complexity_effect: net_negative
complexity_justification: "上流返却を契約内修復へ置換し、既存管理核へ責務を収束する"
removal_trigger: "後継のprovider-neutral検収episode契約へ全consumerが移管された時"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
agent_slots:
  - { role: po, slot_label: "PO — L1要求scopeと意味境界" }
  - { role: tl, slot_label: "TL — 既存管理責務への接続と下位降下" }
  - { role: qa, slot_label: "QA — L1↔L12対応と早期完了防止" }
dependencies:
  parent: null
  requires:
    - docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md
  references:
    - issue:1778
    - issue:1770
    - issue:860
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-M-03-in-review-repair-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/resident-lane-orchestration-recognition.md, artifact_type: test_design }
  - { artifact_path: tests/resident-lane-orchestration-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: .gitignore, artifact_type: config }
review_evidence:
  - reviewer: PO/directive
    review_kind: human
    tests_green_at: "2026-09-12T18:41:50Z"
    reviewed_at: "2026-09-12T18:41:50Z"
    verdict: approve
    scope: "収束速度改善要求を早期に追加し、管理層へ責務を寄せて下層を軽量化するPO指示。BR-3の従来差戻しはBR-9対象外の実装所見へ限定し、意味判断は原因ownerへ返す。L3実装完了の承認ではない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/resident-lane-orchestration-requirements.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-12T18:41:50Z"
        evidence_path: tests/resident-lane-orchestration-requirements.test.ts
        output_digest: "sha256:1784636a035bc62f2477c8ac23f1eeff1d4545d1c09c52a0d5d9563073e25f16"
---

# 検収内修復によるPR収束速度改善

## 目的

resident laneの検収episodeで、承認済み契約から結果を一意に導ける局所修復を元Workerへ返さず閉じる。
要求・責務・公開契約の変更は原因ownerへ返し、検収担当による意味変更や自己承認を許可しない。

## 工程と残義務

1. 本sliceで`BR-9`／`BR-10`とL12認識対を固定する。
2. L3で処理区分、権限、予算、停止条件、測定指標を要件化する。
3. L4↔L9、L5↔L8、L6↔L7を対で降下し、実PRでclosureを実証する。

## 受入境界

- L1とL12の双方が`BR-9`／`BR-10`を参照し、片肺変更を検出できる。
- 現行confirmed L3/L10をこのsliceだけで変更済みと扱わない。
- Issue #1778がL3以降の未解消義務と実PR closure実証を保持する。
