---
plan_id: PLAN-L7-477-route-action-approval-stage
title: "PLAN-L7-477 (add-impl): route action承認stage"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 Issue #169 route recommendationとaction applyのapproval分離"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 169
engineering_discipline_required: true
behavior_contract_id: U-RAAS-001
responsibility_owner: route-action-approval
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
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
complexity_effect: net_neutral
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
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-28T00:20:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-28T00:20:00Z"
    evidence_digest: "sha256:3e4c4b893fc28502b698b0045827d6ae694caacfcc30c7cbc8d7acc4907b6231"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T00:20:00Z"
    tests_green_at: "2026-07-28T00:18:19Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #182 の current HEAD aa3d980c を clean detached worktree で独立レビューした。承認境界の緩和を含むため実 CLI で段階別に実測し、production_incident は apply のみ approval 必須 (exit 1)、route_selection/diagnosis/scope_decision は exit 0、config_drift credential rotation は scope_decision と apply で approval 必須となることを確認した。escalation boundary は read-only 段階でも検出され (['credential'])、auto_apply: false は据え置き。evaluateRouteCommand の production caller は route eval CLI 1 箇所のみで助言と exit code を返す read-only 評価器であり、外部状態を変える段階の承認は失われていない。action_stage 省略時は route_selection として既存 call shape を受理する。前 HEAD で検出した機械判定違反は全て解消済み: enum 外 3 種、artifact_type_mismatch、route_mode の recovery 残存 (独立 review で add-feature へ訂正し backfill の reverseOrphan も同時解消)、entry_signal_unresolvable。非 blocker: 既定 text format では escalation boundary が表示されず (JSON 経路のみ)、stage 分離の安全前提を弱めるため Issue #183 へ分離した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/workflow-contracts.test.ts tests/route-action-approval-cli.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T00:18:19Z"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:07265c07939b66fc3e7980d2272bb34f477db1f23b077b55b266e4bbee26a83b"
        result: "16 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T00:18:00Z"
        evidence_path: src/workflow/routing-contracts.ts
        output_digest: "sha256:ff0c6578d92656c1d6cbe7aea1d7bc569509322066952ed0b7f33826c9082d56"
        result: "exit 0"
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
