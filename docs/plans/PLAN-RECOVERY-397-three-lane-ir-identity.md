---
plan_id: PLAN-RECOVERY-397-three-lane-ir-identity
title: "三社レーンの承認済み識別子をRequirement IRへ接合する"
kind: recovery
layer: cross
drive: agent
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
status: draft
completion_claim_allowed: false
created: 2026-09-08
updated: 2026-09-08
owner: Codex
github_issue_id: 397
behavior_contract_id: REQUIREMENT-JSON-DELTA-ADMISSION-001
responsibility_owner: requirement-json-delta-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-78の承認済み3L識別子と既存refinement schemaを照合する"
contract_postconditions: "承認済み3L識別子の構文をruntime、JSON schema、source projectionで同じ意味として扱える"
contract_invariants: "baselineの意味、承認、owner、digest、AC被覆検査を保持する"
contract_failures: "不正文字、空namespace、空segmentを拒否する"
tdd_red_required: true
red_test: "承認済み3L-FR-001を既存schemaがinvalid_stringで拒否する"
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "承認済みstable IDの取込不整合の是正であり、要求意味を追加しない"
parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-002, test_path: tests/requirement-refinement-authority.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-001, test_path: tests/requirement-refinement-authority.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - PLAN-L3-78-three-lane-cloud-governance-authority
    - PLAN-RECOVERY-12-requirement-refinement-authority
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-397-three-lane-ir-identity.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: src/requirements/requirement-refinement-authority.ts, artifact_type: source_module }
  - { artifact_path: config/requirement-ir-schema.json, artifact_type: json_config }
  - { artifact_path: tests/requirement-refinement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L5-detail/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "承認済みIDとschema境界" }
  - { role: se, slot_label: "schemaとprojection整合" }
  - { role: qa, slot_label: "正常と不正IDの独立反例" }
  - { role: tl, slot_label: "Cursor着手への接合" }
review_evidence: []
---

# 三社レーンID取込のRecovery

現在の英字開始限定schemaが承認済み`3L-*`を拒否する。source IDを改名せず、
namespaceに数字を含む承認済みIDを表現できるよう既存識別子契約を修復する。
数字だけのnamespaceや任意文字列の受理を目的にしない。

本sliceは識別子構文とprojectionの整合までを扱う。25要件／27 ACのfamily登録、
approval materialの接合、manifest／DB／generated view、Cursor実dispatchの成立は
#397／#1293の後続義務として保持する。schema成功をそれらの完了に読み替えない。
