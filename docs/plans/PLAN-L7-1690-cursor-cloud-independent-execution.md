---
plan_id: PLAN-L7-1690-cursor-cloud-independent-execution
title: "PLAN-L7-1690 (add-impl): Cursor Cloud第三者実行admission"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
runtime_activation_allowed: false
created: 2026-09-13
updated: 2026-09-13
red_at: "2026-09-12T15:24:34Z"
green_at: "2026-09-12T15:25:08Z"
owner: Codex / TL
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L5/L8 typed contractがdraftとして固定され、実cloud dispatchとは分離されている"
contract_postconditions: "assignment schema、scope択一、path、期限、budget、pre-dispatch external identityを純粋Node admissionで決定する"
contract_invariants: "副作用、credential、provider通信、第二台帳・scheduler・approvalを追加せず、未知入力をfail-closeする"
contract_failures: "schema→authority stale→branch preissue→budget→identityの順序で最初のfailureだけを返す"
tdd_red_required: true
tdd_red_waiver_reason: "module missing Redを2026-09-13に実測した"
mutation_oracle_required: true
mutation_oracle_evidence: "Claude独立reviewerがPR #1777 HEAD 2d4c28645で変異適用件数を確認し、branch_preissued、absolute_deadline、budget reservation ID/currentの4変異をU-CCI-003/007/006でkill。CodexがHEAD 37f915d30のsource digest sha256:c4ffbf48f53d0deafcebad6e3982187fcc1f2d163f000f301618c2c2bc633f35に対し、各置換適用件数1を確認してruntime scope、runtime cost、self review、review assignment、phase dual writer、retry attemptの列挙6変異を個別実行し、6/6 killを確認した。さらにU-CCI-012へrequested model不一致とusage unknownの反例を追加し、各判定をtrueへ置換する2変異が個別にtargeted test redとなることを確認した。ここでのsurvived 0は列挙した計12変異だけを母集団とし、網羅的変異試験の主張ではない。各変異後にsourceを復元した。"
complexity_effect: net_negative
complexity_justification: "散在する起動前条件を副作用なしの単一admissionへ集約する"
removal_trigger: "後継schemaへ全consumerが移行しv1参照が0になった時"
entry_signals: ["po_directive:第三者実行レーンをL6/L7へ実装する"]
parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md
pair_artifact: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
backprop_decision: not_required
backprop_decision_reason: "L5契約の起動前admissionだけを実装し、要求意味を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — exact schemaとfailure precedence" }
  - { role: qa, slot_label: "QA — negative oracleとmutation" }
  - { role: tl, slot_label: "TL — provider副作用との分離" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-001, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-002, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-003, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-004, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-005, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-006, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-007, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-008, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-009, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-010, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-011, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-012, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-013, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-014, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-015, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-016, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-017, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-018, test_path: tests/cursor-cloud-independent-execution.test.ts }
dependencies:
  parent: docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md
  requires:
    - docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md
  references: ["issue:1293"]
  blocks: ["issue:1293-provider-adapter-e2e"]
generates:
  - { artifact_path: docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/cursor-cloud-independent-execution.ts, artifact_type: source_module }
  - { artifact_path: tests/cursor-cloud-independent-execution.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence: []
---

# Cursor Cloud第三者実行admission

## §工程表 schedule

| Step | 作業 | 終端 |
|---|---|---|
| 1 | module missing Red | 実測済み |
| 2 | U-CCI-001..018 admission lifecycle Green | targeted green |
| 3 | mutation／独立review | blocker 0 |

実cloud dispatch、credential、課金、副作用は本PLANに含めない。後続E2E義務を完了扱いにしない。
