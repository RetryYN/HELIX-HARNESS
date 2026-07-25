---
plan_id: PLAN-L7-469-claude-memory-async-wake
title: "PLAN-L7-469 (impl): Claude宛てmemory eventのasync wake"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-26 Claude Codeへの送信を最適化する"
created: 2026-07-26
updated: 2026-07-26
owner: Codex / TL
github_issue_id: 125
engineering_discipline_required: true
behavior_contract_id: U-MEMWAKE-001
responsibility_owner: claude-memory-wake
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "Codex等の非Claude runtimeがcaller-stable operation ID付きのClaude宛てharness memoryを生成し、Claude Code sessionがStop状態にある"
contract_postconditions: "候補branch外のGit共通dir runtime memory eventをClaude Stop hookが一度だけclaimし、asyncRewake exit 2と境界付き本文を同じsessionへ返す"
contract_invariants: "PR commentや通常memoryを自動実行せず、通知本文だけを権威にせず、blocker/改善の収束規律を変更しない"
contract_failures: "宛先なし・Claude自己送信・damaged/superseded/expired・配信済みIDをwakeせず、timeoutと旧watcher supersedeはexit 0で終了する"
tdd_red_required: true
red_at: "2026-07-26T05:15:00+09:00"
green_at: "2026-07-26T05:20:44+09:00"
mutation_oracle_evidence: "tests/claude-memory-wake.test.tsで通常key、Claude起点、既配信ID、重複claim、孤立claimによる後続starvation、Git共通dir未投影のseeded mutationをkilled"
complexity_effect: justified_positive
complexity_justification: "15分GitHub/HEAD pollingを既存memory v2とClaude公式Stop asyncRewakeへ統合し、新service・dependency・CI jobを追加せず通知待ちのtoken消費とworktree取りこぼしを減らす"
removal_trigger: "Claude Codeが宛先付き外部event mailboxを公式提供し、同一memory IDの冪等配送とidle wakeを保証した時点で共通dir spoolとStop watcherを削除する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-001, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-002, test_path: tests/runtime-hook-entrypoints.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-003, test_path: tests/setup.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — memory配送投影とasyncRewake hook"
  - role: qa
    slot_label: "QA —重複配信・別worktree・通知境界oracle"
  - role: tl
    slot_label: "TL — Claude収束レーンと権威境界review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-469-claude-memory-async-wake.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/settings.json, artifact_type: config }
  - { artifact_path: docs/templates/adapter/.claude/settings.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/project-hook.ts, artifact_type: source_module }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
  requires:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  references:
    - docs/test-design/harness/L8-unit-test-design.md
  blocks: []
---

# PLAN-L7-469: Claude宛てmemory eventのasync wake

## 目的

CodexがPR candidateを作った後、Claude Codeが15分巡回や同一worktreeのHEAD変化を待たず、
宛先付きharness memory eventで同じVS Code sessionを再開し、収束レビューへ入れるようにする。

## 非対象

- Claudeを複数review laneへ増やすこと。
- GitHub comment本文や任意memoryを自動実行すること。
- 新しいdaemon、外部API、dependency、CI job、永続DB schemaを追加すること。

## 完了条件

- `helix memory notify-claude`が候補branchを変更せずGit共通dir runtime memoryへ同一IDで保存する。
- Stop `asyncRewake`が宛先付きactive eventだけを一度claimし、exit 2のstderrへ境界付き通知を返す。
- 別worktree、重複配信、Claude自己送信、通常memory、superseded watcherをfail-safeに扱う。
- targeted test、typecheck、process E2E、full CI、独立Claude収束reviewがgreenになる。
