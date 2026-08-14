---
plan_id: PLAN-L7-469-claude-memory-async-wake
title: "PLAN-L7-469 (impl): Claude宛てmemory eventのasync wake"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-26 Claude Codeへの送信を最適化する"
created: 2026-07-26
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 125
continuation_issue_ids: [151]
engineering_discipline_required: true
behavior_contract_id: U-MEMWAKE-001
responsibility_owner: claude-memory-wake
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "ClaudeまたはCodex等のsender runtimeがcaller-stable operation ID付きの宛先harness memoryを生成し、receiver sessionがavailabilityを持つ"
contract_postconditions: "候補branch外のGit共通dir runtime memory eventをsenderが一度だけARMし、receiverが原子的にCLAIMし、通知digestのACK後だけDELIVEREDへ進め、review receiptまたはclose/mergeでterminal tombstoneを残す"
contract_invariants: "同一repository+PR+HEAD+review_purposeを一度だけ扱い、同じHEADを再ARMせず、新HEADだけを新generationとして旧HEADからSUPERSEDEDへ進める。PR commentや通常memoryを自動実行せず、通知本文だけを権威にせず、blocker/改善の収束規律を変更しない"
contract_failures: "宛先なし・Claude自己送信・invalid ACK digest・damaged/superseded/expired・CLAIMED以降の再wake・配信済みIDをwakeせず、timeoutは暗黙rearmしない。旧watcher supersedeはexit 0で終了し、旧FSMのlegacy claim markerが残っていても新HEAD generationをblockしない"
tdd_red_required: true
red_at: "2026-07-26T05:15:00+09:00"
green_at: "2026-07-26T05:20:44+09:00"
mutation_oracle_evidence: "tests/claude-memory-wake.test.tsの22 testsで通常key、Claude起点、既配信ID、重複・0 byte・切り詰めclaimによる後続starvation、本文data fence escape、Git共通dir未投影、同一PR/HEAD再通知、ACK digest不一致、旧HEAD supersede、legacy claimを残した新HEAD supersede、review/close terminal tombstoneのseeded mutationをkilled"
complexity_effect: justified_positive
complexity_justification: "15分GitHub/HEAD pollingを既存memory v2とClaude公式Stop asyncRewakeへ統合し、新service・dependency・CI jobを追加せず通知待ちのtoken消費とworktree取りこぼしを減らす"
removal_trigger: "Claude Codeが宛先付き外部event mailboxを公式提供し、同一memory IDの冪等配送とidle wakeを保証した時点で共通dir spoolとStop watcherを削除する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-001, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-002, test_path: tests/runtime-hook-entrypoints.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-003, test_path: tests/setup.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-004, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-005, test_path: tests/claude-memory-wake.test.ts }
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
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/project-hook.ts, artifact_type: source_module }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-25T22:10:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-25T22:10:00Z"
    evidence_digest: "sha256:3279939b6581b685169474c642c62fa7efbdae1318f9dbdc8df2347d7e5e9222"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-25T22:10:00Z"
    tests_green_at: "2026-07-25T21:50:59Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #138のClaude宛てmemory async wake (U-MEMWAKE-001) をclean detached checkoutで独立検証した。Claude AI-BはHEAD 627479b6でclaim済みmanifest未追記による恒久starvationをHigh blockerとして返却し、834d3087で0バイト・切り詰めclaimの同型経路が残ることを実測して再返却、8ce2fcdbで解消を確認した (A/B/C 3ケースともsecond eventを配送。前HEADではB/Cがtimeout)。通知本文のdata fence escapeも5変種すべてfenceIntact=trueで解消を確認した。これはIssue #125のPR exact-HEAD lease/lifecycle全体の完了ではなく、#141 (spool prune) と #139 (CI flake) は独立Issueとして維持する。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/138#issuecomment-5080722650"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/claude-memory-wake.test.ts tests/runtime-hook-entrypoints.test.ts tests/setup.test.ts tests/feedback-refactor-disposition.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-25T21:50:59Z"
        evidence_path: tests/claude-memory-wake.test.ts
        output_digest: "sha256:e745555ffee64de272f98fc1fd95df34a4c4bc23954cd0be7a26a4aa3bbe7a5e"
        result: "73 passed"
dependencies:
  parent: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
  requires:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  references:
    - docs/test-design/harness/L8-unit-test-design.md
  blocks: []
---

# PLAN-L7-469: Claude宛てmemory eventのasync wake

## 2026-08-14 CI flake是正

main `harness-check` run `31777254574` では、close済みPRをskipして後続通知を即時claimする
`tests/claude-memory-wake.test.ts` の回帰oracleが、Git/file I/Oをhost wall clock 100ms以内に完了できると
仮定したため `timeout` になった。production timeoutやpolling挙動は変更せず、test failure deadlineだけを
5秒へ広げる。成功経路はclaim時点で即時returnするため待機時間は増えない。同一case 20連続greenと
関連suite 30/30 greenで、starvation検出力を保ったまま負荷依存を除去した。

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
- 同一`repository+PR+HEAD+review_purpose`をone-shot idempotency keyとして、senderの`OFF -> ARMED`、receiverの原子的`ARMED -> CLAIMED`、digest ACK後の`CLAIMED -> DELIVERED`、review/close/mergeのterminal tombstone、新HEADによる旧generationの`SUPERSEDED`を検証する。
- targeted test、typecheck、process E2E、full CI、独立Claude収束reviewがgreenになる。
