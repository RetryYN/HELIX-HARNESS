---
plan_id: PLAN-L7-692-workflow-output-consumer-inventory
title: "PLAN-L7-692: workflow output consumerの旧model fieldをexact inventory化する"
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
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1119 current output legacy field inventory"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1119
behavior_contract_id: WORKFLOW-OUTPUT-CONSUMER-INVENTORY-001
responsibility_owner: workflow-output-consumer-inventory
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3と#204/#206がtyped workflow identityとlegacy input-only境界を既に所有する。本sliceは未分類consumerをexact inventoryへ投影し、意味要件を重複追加しない。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "current mainの6 runtime／CLI／schema／DB／visualization sourceとlegacy field exact setが読める"
contract_postconditions: "各path＋field tokenの実出現数、disposition、owner、producer、consumer、successorが一意に照合される"
contract_invariants: "文字列hitを意味判定へ直結せず、provider model語彙をworkflow identityへ畳み込まず、unknownを推測しない"
contract_failures: "source drift、未分類、重複、unknown disposition、owner／producer／consumer／successor欠落をfail-closeする"
tdd_red_required: true
red_test: "U-WFOCI-001..004を先行追加し、inventory未存在／count drift／duplicate／unknown dispositionでRedを確認する"
red_at: "2026-08-28T06:43:19+09:00"
green_at: "2026-08-28T06:47:52+09:00"
mutation_oracle_evidence: "2026-08-28T06:48:00+09:00にconfig/workflow-output-consumer-inventory.jsonのsrc/cli.ts:selected_model expected_occurrencesを32から31へseedし、tests/workflow-output-consumer-inventory.test.tsのU-WFOCI-002がactual 32との差を検出して1 fail／3 passとなった。値を32へ戻し、同一oracleを再green化する。"
complexity_effect: justified_positive
complexity_justification: "既存sourceを変更せずmachine-readable台帳と単一oracleで後続migration scopeを固定する"
removal_trigger: "#206の全successor migrationがmain到達し、legacy workflow output fieldのcurrent consumerが0になった時"
parent_design: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md
pair_artifact: docs/test-design/harness/L8-workflow-output-consumer-inventory.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-001, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-002, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-003, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-004, test_path: tests/workflow-output-consumer-inventory.test.ts }
dependencies:
  parent: PLAN-L7-482-drive-model-closure
  requires:
    - docs/plans/PLAN-L7-482-drive-model-closure.md
  blocks: []
  references:
    - "issue:1119"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: aim, slot_label: "AIM — #204/#206 current output境界とsuccessor責務を監査" }
  - { role: qa, slot_label: "QA — surface×token閉包とcount drift mutation" }
  - { role: tl, slot_label: "TL — workflow identityとprovider model語彙の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-692-workflow-output-consumer-inventory.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/workflow-output-consumer-inventory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-workflow-output-consumer-inventory.md, artifact_type: test_design }
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: tests/workflow-output-consumer-inventory.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
---

# PLAN-L7-692: workflow output consumer棚卸し

## 目的

#204/#206のcurrent typed identity収束を、raw token件数ではなくproducer／consumer責務に束縛した
machine-readable inventoryから進める。初期6 surfaceをexact固定し、後続schema／DB／CLI／visualization
migrationを原子的に分割できる状態にする。

## 非対象

本sliceではruntime fieldのrename／delete、旧値期待値の緩和、#188／#635／#659の実装を行わない。
