---
plan_id: PLAN-L7-730-management-relation-admission
title: "PLAN-L7-730: PLAN管理field owner inventoryとdual-read admission"
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
entry_signals: [feature_request]
created: 2026-09-13
updated: 2026-09-13
owner: Codex / TL
github_issue_id: 1771
behavior_contract_id: HELIX-PLAN-MANAGEMENT-RELATION-ADMISSION-001
responsibility_owner: management-relation-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "#1771で確定済みの第一pure evaluator sliceをL6/L8 pairへ投影する。"
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "#860 Assignment lifecycle、既存TraceEdge、#1500 portfolio authorityを再利用する"
contract_postconditions: "PLAN管理fieldのownerとlegacy/relation dual-read不一致をpure decisionで一意に判定する"
contract_invariants: "旧readerとsemantic digestを維持し、第二writer・台帳・Assignment lifecycleを作らない"
contract_failures: "unknown、split required、mismatch、unavailable、dual-write、失効、premature retirementをfail-closeする"
tdd_red_required: true
red_at: "2026-09-13T08:44:23Z"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: "U-MREL-001..014がowner・phase・digest・失効・順序・writer境界の反例を個別に拒否する"
complexity_effect: net_negative
complexity_justification: "PLAN consumerに散在する管理field判定を一つのpure evaluatorへ集約し、既存authorityへの参照だけを持つ"
removal_trigger: "全fieldのconsumer-zeroとwriter cutover後にlegacy dual-read分岐を削除する時点"
parent_design: docs/design/helix/L6-function-design/management-relation-admission.md
pair_artifact: docs/test-design/helix/L8-management-relation-admission.md
dependencies:
  parent: null
  requires: []
  references: ["issue:1771", "issue:1770", "issue:860", "issue:1500", "issue:1741"]
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-001, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-002, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-003, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-004, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-005, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-006, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-007, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-008, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-009, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-010, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-011, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-012, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-013, test_path: tests/management-relation-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/management-relation-admission.md, oracle_id: U-MREL-014, test_path: tests/management-relation-admission.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/management-relation-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-730-management-relation-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-management-relation-admission.md, artifact_type: test_design }
  - { artifact_path: src/runtime/management-relation-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/management-relation-admission.test.ts, artifact_type: test_code }
modifies: []
agent_slots:
  - { role: se, slot_label: "SE — owner inventoryとpure relation schema" }
  - { role: qa, slot_label: "QA — mismatch・失効・二重遷移反例" }
  - { role: tl, slot_label: "TL — 既存authority再利用とwriter境界" }
review_evidence: []
---

# PLAN-L7-730: PLAN管理field owner inventoryとdual-read admission

## 対象

#1771の第一sliceとして、versioned owner inventory、4種のrelation schema、pure dual-read admission、
transition/evidence検証を追加する。旧PLAN field、loader、writer、semantic digestは変更しない。

## 完了条件

U-MREL-001〜014、型検査、PLAN governance、design-language、full CI、独立exact-HEAD review、
DB replay、main read-afterがgreenになること。production writer切替とlegacy field削除は後続義務として残す。
---
