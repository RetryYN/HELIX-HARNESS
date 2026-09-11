---
plan_id: PLAN-RECOVERY-1733-issue-contract-census
title: "PLAN-RECOVERY-1733: Issue hierarchy contractのsilent skipをtyped censusへ置換する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-11
updated: 2026-09-11
owner: Codex / TL
github_issue_id: 1733
behavior_contract_id: U-IHIER-021
responsibility_owner: github-issue-hierarchy
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "Issue hierarchy collectorがinvalid／missing contractをcatchして空配列へ落とし、全Issue母集団とgoverned node母集団の差をtyped evidenceとして保持していない"
contract_postconditions: "全入力Issueをvalid nodeまたはIssue番号付きtyped findingへ分離し、欠落field・不正role・不正disposition・malformed YAMLを一意に再現できる"
contract_invariants: "proseからcontractを推定せず、既存collector互換を維持し、GitHub write／migration apply／DB更新／意味的role推定を追加しない"
contract_failures: "contract不在、required field欠落、不正role、不正disposition、malformed YAMLをsilent skipせずcanonical findingへ投影する"
tdd_red_required: true
red_test: "2026-09-11T10:54:19+09:00、U-IHIER-021がcollectIssueHierarchyContractCensus未実装のTypeErrorで1 failed / 20 passed（exit 1）"
red_at: "2026-09-11T10:54:19+09:00"
green_at: "2026-09-11T10:57:36+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-11T10:58:23+09:00、issue_role_invalidのtyped分岐をgeneric invalidへ一時変異し、U-IHIER-021がfinding code不一致で1 failed / 20 passed（exit 1）となることを実測した。復元後にGreenへ戻した"
complexity_effect: net_neutral
complexity_justification: "既存Issue hierarchy parserとcollectorを再利用し、pure census result型と分類分岐だけを追加する。新graph、DB schema、GitHub client、writerは追加しない"
removal_trigger: "全Issueがvalid hierarchy contractを持ち、外部portfolio registryが同じtyped census schemaを正本として提供する時"
backprop_decision: not_required
backprop_decision_reason: "既存Issue hierarchy契約の母集団欠落を回復するsliceであり、新しい要求意味やrole分類を追加しない"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-021, test_path: tests/issue-hierarchy.test.ts }
dependencies:
  parent: null
  requires: []
  references: ["issue:1733", "issue:1732", "issue:1500", "issue:81"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 全Issue母集団とsilent skip原因の実測" }
  - { role: se, slot_label: "SE — parser互換とtyped census境界" }
  - { role: qa, slot_label: "QA — missing／partial／invalid／malformed反例" }
  - { role: tl, slot_label: "TL — read-only censusとmigration apply責務の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1733-issue-contract-census.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/issue-native-graph-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/infinity-loop-strict-design-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-direct.json, artifact_type: json_config }
review_evidence: []
---

# Issue階層契約の全数診断

## 目的

Issue契約が不正なときにcollectorがそのIssueを母集団から黙って除外する旧挙動を、read-only typed censusへ置換する。
これにより#1733の全Issue整理、#1682のCapability台帳、#1685の依存frontier、#1500/#81の工程表が
「parserを通ったIssueだけ」を全数と誤認しないようにする。

## 非対象

- contract本文の自動生成・自動書換え
- role／parent／dependencyの意味推定
- GitHub native graphへのwrite
- DB projection、Projects同期、READY計算の切替
- 288件の未parse Issueの一括修復

## 完了条件

- [ ] U-IHIER-021のRed→Greenとmutation killが実証される。
- [ ] valid nodeと全invalid findingがIssue番号付きで再現可能になる。
- [ ] L6設計・L8テスト設計・実装・oracleが同じbehavior contractへ束縛される。
- [ ] targeted、typecheck、Biome、PLAN lint、独立exact-HEAD review、CIがgreenになる。
- [ ] 後続migration candidateが互換collectorではなくtyped censusを入力にできる。
