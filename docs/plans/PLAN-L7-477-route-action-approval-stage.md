---
plan_id: PLAN-L7-477-route-action-approval-stage
title: "PLAN-L7-477 (recovery): route action承認stage"
kind: recovery
layer: L7
drive: agent
status: draft
route_mode: recovery
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "issue:169 route recommendationとaction applyのapproval分離"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 169
engineering_discipline_required: true
behavior_contract_id: U-RAAS-001
responsibility_owner: route-action-approval
change_slice: atomic
refactor_step: split_responsibility
legacy_retirement_state: superseded_in_place
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "L6/L8 pairがstage exact setとmode別承認境界を定義する"
contract_postconditions: "CLIとpure evaluatorが同じstageを使い、read-only routeを止めずapplyをfail-closeする"
contract_invariants: "approval policyとescalation boundaryの既存証拠を保持する"
contract_failures: "全stage承認、全stage自律、未知stage、apply policy迂回を拒否する"
tdd_red_required: true
red_at: "2026-07-28T07:45:00+09:00"
green_at: "2026-07-28T07:46:00+09:00"
mutation_oracle_evidence: "tests/workflow-contracts.test.tsがRecovery/Incident/Retrofitのread-onlyとapply、security/production escalationの同一入力stage差を検査し、boolean requiresApprovalへ戻す変異とapply承認除去変異をkillする"
complexity_effect: neutral
complexity_justification: "新serviceやschemaを追加せず既存route evaluatorとCLI optionへstageを接着する"
removal_trigger: "workflow action transactionがstage/approvalを直接所有した時点で同ownerへ統合する"
parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md
pair_artifact: docs/test-design/harness/L8-route-action-approval-stage.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-001, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-002, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-003, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-004, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-005, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-006, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-007, test_path: tests/workflow-contracts.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/route-action-approval-stage.md, oracle_id: U-RAAS-008, test_path: tests/route-action-approval-cli.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — evaluator/CLI stage実装" }
  - { role: qa, slot_label: "QA — stage境界mutation" }
  - { role: tl, slot_label: "TL — action-bound approval収束" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-477-route-action-approval-stage.md, artifact_type: markdown_doc }
  - { artifact_path: src/workflow/routing-contracts.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/contracts.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/route.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-contracts.test.ts, artifact_type: test_code }
  - { artifact_path: tests/route-action-approval-cli.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-82-route-action-approval-stage.md
  requires:
    - docs/plans/PLAN-L7-124-route-approval-gate.md
  references:
    - docs/plans/PLAN-REVERSE-124-route-approval-gate.md
  blocks: []
---

# PLAN-L7-477: route action承認stage

## 完了条件

- targeted testsとtypecheckがgreen。
- CLIが未知stageをwrite前に拒否する。
- 独立AI-Bがread-only/action境界と既存fail-closeを同一HEADで確認する。
