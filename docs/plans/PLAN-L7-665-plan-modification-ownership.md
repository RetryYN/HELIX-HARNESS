---
plan_id: PLAN-L7-665-plan-modification-ownership
title: "PLAN-L7-665 (impl): 既存artifact修正sliceのPLAN所有権を分離する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #855 existing artifact modification ownership cycle"
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 855
behavior_contract_id: PLAN-MODIFICATION-OWNERSHIP-001
responsibility_owner: plan-governance-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "generatesが新規生成所有、既存差分は別のownership fieldを必要とする"
contract_postconditions: "modifiesを用いる既存artifact修正PLANがdraftのreview前にmerged-plan-statusで停止せず、V-pair traceを保持する"
contract_invariants: "generatesの完了所有とmodifiesの差分所有を混同しない。review evidenceやconfirmを自動生成しない"
contract_failures: "新設testのgenerates欠落、modifies testのoracle未接続、generates/modifiesの意味混同"
tdd_red_required: true
red_test: "U-PLANMOD-001..004のmodifies ownership oracleを除去すると既存test修正sliceのtraceがredになる"
red_at: "2026-08-24T11:28:12Z"
green_at: "2026-08-24T11:28:26Z"
mutation_oracle_evidence: "2026-08-24T11:28:12ZにdeclaredTestPathsからmodifies test_codeを一時除去し、tests/plan-modification-ownership.test.tsのU-PLANMOD-001がfailed（1 failed, 2 passed, exit 1）となるkillを実測した。復元後、関連6ファイル98 tests passedでgreenを再確認した。"
complexity_effect: net_negative
complexity_justification: "既存artifact修正のための重複generates宣言とconfirm前review循環を除去する"
removal_trigger: "全plan artifact ownershipがappend-only immutable manifestへ移行し、modifiesが不要になった時"
parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md
pair_artifact: docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-001, test_path: tests/plan-modification-ownership.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-002, test_path: tests/plan-modification-ownership.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-003, test_path: tests/plan-modification-ownership.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-665-plan-modification-ownership.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/plan-modification-ownership.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/plan-modification-ownership.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .claude/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-descent.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: src/graph/loader.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph-types.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph.ts, artifact_type: source_module }
  - { artifact_path: tests/frontmatter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/relation-graph.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - issue:855
agent_slots:
  - { role: se, slot_label: "SE — modifies ownership schema and projection" }
  - { role: qa, slot_label: "QA — draft cycle and V-pair regression oracle" }
  - { role: tl, slot_label: "TL — generates/modifies authority boundary" }
---

# 既存artifact修正sliceのPLAN所有権

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | `generates`と`modifies`の意味をschema・規則へ分離 | 新規生成と既存差分の入力が別typed fieldになる |
| 2 | descent／V-pair／relation graphへ接続 | 既存test修正がtraceを失わず、既存sourceへ`modifies` edgeが出る |
| 3 | regression oracle | #855の両状態とgeneratesの従来fail-closeを再現できる |
| 4 | targeted／typecheck／doctor／CI | current HEADで全gateがgreen、Claude検収へ進める |

本sliceは既存artifactの所有権表現を追加する。PR、review、status confirm、GitHub通知の権限を変更しない。
