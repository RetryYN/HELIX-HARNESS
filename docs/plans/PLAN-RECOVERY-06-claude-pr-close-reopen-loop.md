---
plan_id: PLAN-RECOVERY-06-claude-pr-close-reopen-loop
title: "PLAN-RECOVERY-06 (recovery): Claude PR close/reopen CI循環を停止する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-28 Issue #196 PR close/reopen CI循環をRecoveryで停止する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 196
supersedes_pr: 198
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
  - { role: aim, slot_label: "AIM — close/reopen 循環の再発監視と収束判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-06-claude-pr-close-reopen-loop.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T03:51:00Z"
    tests_green_at: "2026-07-28T03:49:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #199 の current HEAD 748b52c0 を clean detached worktree で独立レビューした。本 PLAN は reviewer 自身 (Claude 収束レーン) の挙動への統制である。PR #189 の close/reopen 2 回は私の操作であり、close が実行中 workflow を kill し、kill された job が statusCheckRollup へ CANCELLED として残り pr-merge-reviewed の required_checks_not_green を誘発していた。問題認識と根本原因の記述は事実と一致する。実装 containsDirectGithubPrLifecycleMutation は既存 containsDirectGithubPrMerge と同型の regex で gh pr close / gh pr reopen を nested shell 込みで検出し、gh pr view / gh pr checks / helix github pr-merge-reviewed は素通しする (test で positive/negative 両方を固定)。guard は .claude/settings.json と .codex/hooks.json の双方へ配線済みで runtime parity がある。独立 review で PLAN の agent_slots へ recovery kind 必須の aim role を追加し、src 変更に伴う config/digest-canonicalization-inventory.json を再生成した (rows 160 不変、行番号のみ)。非 blocker: close/reopen を無条件 block するため PR supersede 時の正当な close も塞がれ、override marker / env も効かない (hook 実装上 evaluateGitCommandGuard より前に return する)。本 session だけで #162 と #181 の 2 回、supersede のための close が必要だった。本 PLAN は recovery scope を最小に保つ方針を明記しているため blocker とはせず Issue へ分離する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/git-command-guard.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T03:49:00Z"
        evidence_path: tests/git-command-guard.test.ts
        output_digest: "sha256:1b3d7d9a80f3d17e66cd1771dffd4eb7229b6e61fdf6eb7178b0d1adc74a63e2"
        result: "27 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T03:48:00Z"
        evidence_path: src/runtime/git-command-guard.ts
        output_digest: "sha256:1b3f87997f4d2d24bd096ee2b7381b73d743e362112714f960c7e62fe0da7cf7"
        result: "exit 0"
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

## 後続分離

独立reviewで見つかった、正当なsupersede closeまで無条件拒否する制約は
Issue #200へ分離した。本RecoveryではCI refresh目的のlifecycle mutation停止を優先し、
successor束縛、review evidence、one-shot失効を伴う限定解除は後続契約で扱う。

## 完了条件

- U-CPRCONV-005のpositive／negative oracleがgreen。
- typecheck、既存git-command-guard回帰、Claude/Codex hook parityがgreen。
- Claude独立review後にstatusをconfirmedへ遷移する。
