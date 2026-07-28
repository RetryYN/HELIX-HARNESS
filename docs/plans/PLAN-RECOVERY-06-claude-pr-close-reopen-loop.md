---
plan_id: PLAN-RECOVERY-06-claude-pr-close-reopen-loop
title: "PLAN-RECOVERY-06 (recovery): Claude PR close/reopen CI循環を停止する"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-28 Issue #196 PR close/reopen CI循環をRecoveryで停止する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 196
engineering_discipline_required: true
behavior_contract_id: GH-CLAUDE-CONVERGE-CI-001
responsibility_owner: claude-pr-convergence-ci-terminal
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "Claude/Codex Bash実行がrepo-local PreToolUse git-command-guardを通る"
contract_postconditions: "AI runtimeのdirect PR close/reopenを拒否し、current runのterminal結果を保持する"
contract_invariants: "read-only PR参照、reviewed merge wrapper、通常git guardの判定を変更しない"
contract_failures: "close/reopenを許可してactive CIをcancelする、またはview/checks/wrapperを誤拒否する"
tdd_red_required: true
red_at: "2026-07-28T03:14:09Z"
green_at: "2026-07-28T03:14:34Z"
mutation_oracle_evidence: "tests/git-command-guard.test.ts U-CPRCONV-005でclose、reopen、nested shell、absolute gh pathの旧実装がredとなり、read-only view/checksとreviewed wrapperを維持してgreen"
complexity_effect: net_neutral
complexity_justification: "既存git-command-guard hookへPR lifecycle regexを1件追加し、新service、schema、CLI、dependencyを追加しない"
removal_trigger: "Claude CodeがPR lifecycle mutationをruntime policyとして公式に拒否した時点"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-005, test_path: tests/git-command-guard.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — PR lifecycle command guard" }
  - { role: qa, slot_label: "QA — close/reopen mutation oracle" }
  - { role: tl, slot_label: "TL — convergence boundary review" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-06-claude-pr-close-reopen-loop.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  references:
    - docs/test-design/harness/L8-unit-test-design.md
  blocks: []
---

# PLAN-RECOVERY-06: Claude PR close/reopen CI循環停止

## 目的

PR #189の同一HEADでClaude収束レーンが`gh pr close`と`gh pr reopen`を反復し、実行中full CIを
`cancelled`へ変えて再runした。CIをrefreshする操作がCI証拠を自己破壊する循環をPreToolUseで止める。

## 根本原因

direct `gh pr merge`は既存guardが拒否する一方、PR lifecycle mutationは対象外だった。Claudeは
cancelled runを回復するためclose/reopenを選び、そのcloseが次のactive runを再びcancelした。

## 原子的修復

- direct `gh pr close`／`gh pr reopen`を既存shell surfaceとnested shellで拒否する。
- `gh pr view`、`gh pr checks`、`helix github pr-merge-reviewed`は許可する。
- CI再実行、PR更新、別detector、DB schemaを追加しない。

## 完了条件

- U-CPRCONV-005のpositive／negative oracleがgreen。
- typecheck、既存git-command-guard回帰、Claude/Codex hook parityがgreen。
- Claude独立review後にstatusをconfirmedへ遷移する。
