---
plan_id: PLAN-L7-666-issue-dependency-contract-attribution
title: "PLAN-L7-666 (add-impl): Issue依存契約の採用判定と失敗帰属を収束する"
kind: add-impl
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
  - "po_directive:Issue #980 prose marker false-positive and unattributed parse failure"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 980
behavior_contract_id: ISSUE-DEPENDENCY-CONTRACT-ATTRIBUTION-001
responsibility_owner: issue-dependency-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue本文は任意proseと、採用時だけyaml fenced dependency contractを持つ"
contract_postconditions: "正式fenced blockだけをgoverned nodeとして採用し、不正な採用blockはIssue番号付きstable findingへ投影する"
contract_invariants: "schema field順と既存U-IHIER-001..009を変更せず、proseから契約採用を推測しない"
contract_failures: "散文markerの誤採用、malformed blockによるaudit全体throw、原因Issue番号の欠落"
tdd_red_required: true
red_test: "U-IHIER-010のprose-only bodyとmalformed adopted blockを現行live selectionへ入力すると誤採用または全体throwになる"
red_at: "2026-08-24T19:18:08Z"
green_at: "2026-08-24T19:18:20Z"
mutation_oracle_evidence: "2026-08-24T19:18:08ZにhasIssueDependencyContractBlockを旧includes判定へ一時変異し、tests/issue-hierarchy.test.tsのU-IHIER-010がprose-only bodyをtrueとして1 failed / 8 passed（exit 1）になるkillを実測した。正規fenced判定へ復元後、2026-08-24T19:18:20Zに9/9 greenを再確認した。"
complexity_effect: net_negative
complexity_justification: "CLI内の曖昧なincludes判定とunattributed exceptionをtyped selection resultへ集約する"
removal_trigger: "Issue dependency contractがGitHub本文以外のversioned typed storeへ完全移行した時"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-010, test_path: tests/issue-hierarchy.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-666-issue-dependency-contract-attribution.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - issue: 980
    - issue: 634
agent_slots:
  - { role: se, slot_label: "SE — fenced contract selection and stable finding projection" }
  - { role: qa, slot_label: "QA — prose false-positive and malformed block regression" }
  - { role: tl, slot_label: "TL — adoption boundary and fail-close attribution" }
---

# Issue依存契約の採用判定と失敗帰属

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 正式yaml fenced blockの候補抽出をpure化 | prose markerだけでは採用されない |
| 2 | malformed採用blockのfinding化 | audit全体をthrowせずIssue番号とstable codeを返す |
| 3 | L6/L8とU-IHIER-010を接続 | 既存U-IHIER-001..009を含めtargeted green |
| 4 | PLAN confirm・CI・Claude検収 | exact HEADでblocker 0、main read-afterまで成立 |

本sliceは契約schemaや依存グラフ意味を変更しない。採用境界と診断可能性だけを是正し、
live GitHub Issue本文の一括編集や別のdependency authorityは導入しない。
