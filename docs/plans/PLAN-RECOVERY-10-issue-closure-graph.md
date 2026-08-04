---
plan_id: PLAN-RECOVERY-10-issue-closure-graph
title: "PLAN-RECOVERY-10 (recovery): Issue closure graph Reality Binding"
kind: recovery
layer: cross
drive: agent
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 373
engineering_discipline_required: true
behavior_contract_id: ISSUE-CLOSURE-GRAPH-001
responsibility_owner: issue-closure-graph
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "Closes対象Issueがcanonical contract exact set、child/successor、completion receiptを機械可読に宣言する"
contract_postconditions: "GitHub actual Issue/PR/CI/review graphが全一致する場合だけ親Issue closeを許可する"
contract_invariants: "PR散文を証拠にせず、既存pr-context ownerとissue-closure-contract jobを再利用し、新workflow/service/DB tableを追加しない"
contract_failures: "missing/duplicate contract、missing/open child、unresolved successor、missing/duplicate/stale/別HEAD/CI/review receiptをtyped failureで拒否する"
tdd_red_required: true
red_at: "2026-08-04T08:10:00+09:00"
green_at: "2026-08-04T08:21:36+09:00"
mutation_oracle_evidence: "U-ICGRAPH-002/003/005/007/008がexact-set dedupe除去、child state比較除去、receipt HEAD/CI/review比較除去、100-comment切詰め許容、graph未入力許容のseeded反例を個別にRedへ戻す"
complexity_effect: justified_positive
complexity_justification: "既存pr-contextと単一CI stepへpure graph validatorとread-only adapterを統合し、Issue close後の未完契約回収と親子探索コストを除去する。新workflow/service/table/dependencyは0"
removal_trigger: "GitHub native sub-issueがcontract exact set、required CI、独立review receiptを同一immutable closure transactionとして提供した時点でread adapterを統合削除する"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-001, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-002, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-003, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-004, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-005, test_path: tests/issue-closure-graph.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-006, test_path: tests/github-issue-closure-graph-adapter.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-007, test_path: tests/github-issue-closure-graph-adapter.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICGRAPH-008, test_path: tests/branch-kind.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #227/#194未完close再発原因と既存gate gapの切分け" }
  - { role: se, slot_label: "SE — closure graph value object、GitHub read adapter、既存guard結線" }
  - { role: qa, slot_label: "QA — missing/duplicate/open/stale/別HEAD mutation oracle" }
  - { role: tl, slot_label: "TL — #227/#194 closure authorityとFeature #92復帰境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-10-issue-closure-graph.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: governance_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/issue-closure-graph.ts, artifact_type: source_module }
  - { artifact_path: src/adapters/github-issue-closure-graph.ts, artifact_type: source_module }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/issue-closure-graph.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-issue-closure-graph-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-462-issue-closure-contract.md
  requires:
    - docs/plans/PLAN-L7-462-issue-closure-contract.md
    - docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
---

# PLAN-RECOVERY-10: Issueクローズgraphの実在束縛

## 目的

Issue closeをPR本文の自己申告から切り離し、canonical behavior contract exact set、child/successorのGitHub実状態、
completion receiptのmerged HEAD・CI・独立reviewを同一graphとして検証する。未完contractを残す#227/#194を
close不能にし、本Recovery merge後はFeature #92の実装レーンへ直ちに戻る。

## 非対象

- 新規workflow、service、DB table、GitHub write command。
- AWS専用CI、Feature scheduler、worker lifecycle本体。
- Issue #373以外の可読性改善や既存closure authority全体の再設計。

## 完了条件

- U-ICGRAPH-001〜008、typecheck、Biome、PLAN governance、doctor、required CIがgreen。
- exact candidate HEADを独立AI-Bがreviewしblocker 0。
- #227/#194を本gate merge前または未完receipt状態でcloseしない。
