---
plan_id: PLAN-L3-659-commercial-license-policy
title: "HELIX全体の商用ライセンス方針と版管理候補"
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
  - "po_directive: HELIX全体の有償商用提供方針とPR作成の明示依頼。条文・発効版は未確定"
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 659
behavior_contract_id: DISTRIBUTION-PACKAGE-RELEASE-001
responsibility_owner: distribution-package-release
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "未発効の上流差分候補のみを作成し、正本化前のruntime変更を行わない"
no_code_decision: no_change
ddd_modeling_decision: policy
contract_preconditions: "現行MITと既存配布要件を確認し、全体の有償提供意向と第三者権利を区別する"
contract_postconditions: "全体対象・権利範囲・発効版・consumer条件を要求10件と受入10件で追跡する"
contract_invariants: "過去許諾を遡及撤回せず、独自権利と第三者/利用者の権利を混同しない"
contract_failures: "Liteへの無断縮小、許諾の創作、候補からの発効・publish主張を拒否する"
tdd_red_required: false
mutation_oracle_required: false
complexity_effect: net_neutral
complexity_justification: "既存Releaseとlicense inventoryを再利用し別課金基盤を追加しない"
removal_trigger: "候補を既存要求へ正規移管し、契約と全surface切替の検証が完了した時点"
parent_design: docs/governance/candidates/helix-commercial-license-requirements.md
pair_artifact: docs/governance/candidates/helix-commercial-license-acceptance.md
dependencies:
  parent: docs/governance/candidates/helix-commercial-license-requirements.md
  requires: []
  references:
    - docs/plans/PLAN-L3-54-distribution-package-release.md
    - issue:958
    - issue:1494
    - issue:1500
  blocks: []
generates:
  - { artifact_path: docs/governance/candidates/helix-commercial-license-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/helix-commercial-license-acceptance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-659-commercial-license-policy.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 要求と適用範囲" }
  - { role: qa, slot_label: "QA — 独立検収" }
review_evidence: []
---

# 実施範囲

全体の商用化方向を要求候補へ整理する。現行LICENSE/package.json、runtime、課金、GitHub公開設定は変更しない。
根拠と未確定事項は要求候補へ集約し、memoryを契約正本にしない。
独立レビュー、CI、main read-afterは未完了。検証結果を得る前に完了を主張しない。

## ローカル検証

- `npm run helix -- plan lint`: entry signalを正規形式へ是正後、entry routingと採番検査はOK。既存design-reality advisoryは残る。
- 要求10件と受入10件の一対一対応、相対参照、MIT metadata不変更をNode assertionで確認した。
- `npm run helix -- db rebuild`: exit 0、80278 rows。outstandingは新規draftを含め80件。
- 宣伝表示については相談のみであり、義務や利用条件へ追加していない。
