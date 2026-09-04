---
plan_id: PLAN-RECOVERY-1411-review-checklist-validation
title: "PLAN-RECOVERY-1411: single-runtime checklistの不正入力受理を是正する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1411
behavior_contract_id: SINGLE-RUNTIME-CHECKLIST-VALIDATION-001
responsibility_owner: gate-review-tier
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "single-runtimeの検収は必須7項目の有効なchecklistを要求する"
contract_postconditions: "YAML loaderと直接evaluateの双方が不正shape・status・未知ID・重複・欠落を拒否する"
contract_invariants: "必須ID集合とhybrid/standaloneの既存契約を変更しない。自由文証拠の真正性を本検査だけで保証しない"
contract_failures: "status欠落・大文字・未知値・型違反・重複ID・未知ID・不正shapeをfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-05、src/gate/review-tier.tsの重複ID拒否を一時無効化し、tests/gate-review-tier.test.tsのU-CHKREV-001が1 failed / 19 skipped、exit 1でkill。復元後20 passed、exit 0を確認した。"
backprop_decision: not_required
backprop_decision_reason: "既存evaluateGateReviewの有効な証拠だけをpassとする契約の実装修復であり、新しい承認authorityを追加しない"
parent_design: docs/design/helix/L6-function-design/review-checklist-validation.md
pair_artifact: docs/test-design/helix/L8-review-checklist-validation.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-checklist-validation.md, oracle_id: U-CHKREV-001, test_path: tests/gate-review-tier.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - "issue:1411"
    - "issue:1500"
    - docs/design/harness/L6-function-design/governance-enforcement.md
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — checklist誤受理の原因と既存契約の確認" }
  - { role: se, slot_label: "SE — checklist入力境界" }
  - { role: qa, slot_label: "QA — 不正入力と正常対照" }
  - { role: tl, slot_label: "TL — 既存authorityと修復境界" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/review-checklist-validation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-checklist-validation.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1411-review-checklist-validation.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/gate/review-tier.ts, artifact_type: source_module }
  - { artifact_path: tests/gate-review-tier.test.ts, artifact_type: test_code }
review_evidence: []
---

# checklist入力境界のRecovery

## 正本と修復範囲

既存L6の `evaluateGateReview` 契約（有効な証拠だけをpassとする）と必須7IDを維持する。
単一runtimeのchecklistはstrictな構造、status enum、重複なしのexact ID集合を要求する。
YAML読込と直接呼出しで同じschemaを使い、後勝ちMapによるfailの消失を防ぐ。
旧skill templateのメタデータやplaceholderを完成したchecklistとして黙って取り込まない。

## 実測と未完了

main `d1606804c` の修正前コードに安全側oracleを追加し、2026-09-05に
`tests/gate-review-tier.test.ts` が7 failed / 11 passed、exit 1となった。
status欠落・PASS・skip・null・number、重複fail→pass、未知IDが意図したRedである。
修正後はloader/直接呼出しのshape反例と旧template拒否を含む20件が成功した。
関連gate-static、gate-confirm、judgment-core-coverageを含む49件と型検査も成功した。
これは作成者の検証であり、独立レビューではない。

採番はIssue番号を識別に使うRecovery候補である。ローカルとGitHub検索で同名なしを確認したが、
allocator発行済みreceiptやwriter lease取得済みとは主張しない。PR admission前に予約・所有整合を検査する。

## 非対象

- 必須ID変更、hybrid/standaloneの承認条件変更。
- 自由文evidenceの真正性・実行証跡のseal機構新設。
- 旧skillの分類全面移行、Release、外部認可設定変更。

## 完了条件

PLAN/所有権・test-design接続、mutation検証、全回帰、doctor、DB convergence、
current-HEAD独立レビュー、canonical mergeとmain read-afterを成立させる。
候補PLAN追加と局所greenだけでは完了としない。
