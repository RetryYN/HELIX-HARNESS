---
plan_id: PLAN-L7-688-l3-human-approval-git-provenance
title: "PLAN-L7-688 (fix): L3 human approval gateをGit履歴日付へ束縛する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1102 author制御のcreated／updatedをL3承認gateの判定鍵にしない"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1102
behavior_contract_id: L3-HUMAN-APPROVAL-GIT-PROVENANCE-001
responsibility_owner: l3-human-approval-git-provenance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "L3 human approval gateが基準日とPLANのterminal状態を検査し、CI checkoutがGit履歴を取得する"
contract_postconditions: "承認要否がPLAN frontmatterのauthor制御日付ではなく、対象ファイルのGit初出／最終変更日から導出される"
contract_invariants: "既存の基準日前の確定履歴へ承認を遡及要求せず、frontmatter日付の後付け変更でgrandfather境界を迂回できない"
contract_failures: "未追跡・浅い履歴・Git日付欠落・日付順序不整合は承認有無にかかわらずfail-closeする"
tdd_red_required: true
red_test: "created／updatedを基準日前へ戻したL3 PLANでもGit初出または最終変更が基準日以降なら承認欠落として拒否する"
complexity_effect: net_neutral
complexity_justification: "新しい承認台帳を作らず、既存review-evidence loaderへGit provenanceを追加して既存gateへ接続する"
removal_trigger: "外部approval provenanceが不変なL3 lifecycle eventを提供し、Git path date lookupを置換できる時"
parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md
pair_artifact: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "Issue #1102は既存HR-FRの承認境界を強化する実装欠陥であり、新しい承認意味やrouteを追加しない"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-008, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-009, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-010, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-011, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-012, test_path: tests/review-evidence.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-688-l3-human-approval-git-provenance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/l3-human-approval-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/design/helix/L6-function-design/l3-human-approval-gate.md
  requires: []
  blocks: []
  references:
    - issue:1102
    - plan:PLAN-L7-687-l3-human-approval-gate
agent_slots:
  - { role: se, slot_label: "SE — Git path provenance loaderとfail-close" }
  - { role: qa, slot_label: "QA — backdate／shallow history mutation oracle" }
  - { role: tl, slot_label: "TL — grandfather境界と既存L3 gate整合" }
---

# L3 human approval gateのGit provenance固定

## 目的

Issue #1102で確認された、PLAN frontmatterの`created`／`updated`を両方過去へ戻すと、
新規L3 PLANでもhuman approval gateを回避できる問題を是正する。承認の意味、record schema、
人間actorの真正性は既存の#1097契約を維持し、grandfather境界の判定入力だけを不変なGit履歴へ
束縛する。

## 実装契約

- `created`相当は対象PLANファイルのGit初出commit日、`updated`相当は同ファイルの最新変更commit日から導出する。
- `docs/plans`を浅いcheckout、未追跡ファイル、Git履歴取得不能として読んだ場合は、L3 terminal PLANを承認有無にかかわらずfail-closeする。
- frontmatterの日付は表示・暦日整合性の検査に残すが、grandfather判定のauthorityにはしない。
- 基準日前にGitで確定した既存履歴は遡及して承認を要求しない。基準日以降にファイルが作成または変更された場合はtyped PO approvalを要求する。
- CIはGit履歴を必要とするため、対象workflowの`fetch-depth: 0`を維持する。

## 非対象

承認者のGitHub actor真正性、署名、外部approval provenance台帳、既存のL3 approval record schema、
他のreview gate、L3以外のPLANの判定は変更しない。

## 受入条件

1. frontmatterの両日付を基準日前へ戻しても、Git初出が基準日以降なら`missing_human_po_approval`で拒否する。
2. frontmatterの両日付を基準日前へ戻しても、Git最終変更が基準日以降なら`missing_human_po_approval`で拒否する。
3. Git provenanceが無い、未追跡、取得不能、日付不正の場合は`missing_l3_plan_git_provenance`または`invalid_l3_plan_git_provenance`で拒否する。
4. 基準日前のGit provenanceを持つ既存L3 PLANは、従来どおり承認の遡及要求なしで通過する。
5. 既存のU-L3APP-001〜007、targeted test、typecheck、Biome、PLAN lint、full harness-check、Claude exact-HEAD review、main read-afterを維持する。
