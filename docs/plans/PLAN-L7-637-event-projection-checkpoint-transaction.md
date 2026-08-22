---
plan_id: PLAN-L7-637-event-projection-checkpoint-transaction
title: "PLAN-L7-637 (impl): orchestration event projectionのtransactional I/Oとcheckpoint durabilityを実装する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 499
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-IO-001
responsibility_owner: event-projection-checkpoint-transaction
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: aggregate
review_evidence:
  - reviewer: "Codex TL preflight"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-19T14:40:07Z"
    tests_green_at: "2026-08-19T14:40:07Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #499 transactional I/O sliceについて、#636 pure judgementとの責務分離、専用projection schema、durable append、checkpoint後公開、crash／race／replay、immutable DB boundaryをcurrent branchで確認した。Claude Code Opusの独立exact-HEAD reviewを代替しない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/event-projection-checkpoint-transaction.test.ts tests/event-projection-checkpoint-replay.test.ts tests/event-projection-plan-identity.test.ts tests/continuation-event-first.test.ts tests/state-db.test.ts tests/ddd-tdd-rules.test.ts tests/coding-rules.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-19T14:40:07Z"
        evidence_path: tests/event-projection-checkpoint-transaction.test.ts
        output_digest: "sha256:4402a53a88434d16b520aadd3bb8b3bf46353f3f7e1942c0f7d41db7485abeb4"
        result: "7 files / 245 tests passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-19T14:39:16Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "exit 0"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-19T14:39:16Z"
        evidence_path: docs/plans/PLAN-L7-637-event-projection-checkpoint-transaction.md
        output_digest: "sha256:9bbef389d601fbf5d32484f04f8c0ebabb1a4b6e071b02738a14c3c0b3fdba60"
        result: "plan-governance OK (990 records)"
  - reviewer: "Claude Code Opus follow-up"
    review_kind: cross_agent
    reviewed_at: "2026-08-19T18:45:04Z"
    tests_green_at: "2026-08-19T18:45:01Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    scope: "初回収束レビュー (PR #820) で指摘した未固定 fail-close 2件を実行可能 oracle へ固定した。EVENT_CHECKPOINT_PUBLISH_FAILED と EVENT_JOURNAL_APPEND_FAILED は、fail-close を除去する mutation で当初 survived だったが、U-EPR-IO-010/011 追加後は両方 killed になることを実測した。さらに Codex の独立レビュー (PR #823 blocker) を受けて、partial write 後の fault が壊れた JSONL 断片を残し次回 retry をEVENT_LOG_SNAPSHOT_INVALID で停止させる経路を是正し、append 失敗時に直前 byte offset へ切り戻す実装とU-EPR-IO-012 を追加した。切り戻しを外す mutation と切り戻し先を 1 byte ずらす mutation がいずれも killed であることを実測した。あわせて L8 test-design の U-ID 表を実テストへ一致させ、status を confirmed 化して oracle-test-trace の対象へ入れた。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/event-projection-checkpoint-transaction.test.ts tests/event-projection-checkpoint-replay.test.ts tests/event-projection-plan-identity.test.ts tests/oracle-test-trace.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-19T18:45:01Z"
        evidence_path: tests/event-projection-checkpoint-transaction.test.ts
        output_digest: "sha256:e885fceeae0164de4e983ae6262d93eb2d916c9429f3cdc65f607c11b986a743"
        result: "4 files / 185 tests passed"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-08-19T14:39:16ZにPLAN-L7-636のpure judgement mutation runnerを実行し、total=10 killed=10 survived=0 pattern_missing=0を確認した。transaction slice固有のfault／race／replay oracleはtests/event-projection-checkpoint-transaction.test.tsのU-EPR-IO-001..012で固定した。後続レビューで、EVENT_CHECKPOINT_PUBLISH_FAILEDとEVENT_JOURNAL_APPEND_FAILEDのfail-closeを除去するmutationが当初survivedだったため、U-EPR-IO-010/011を追加して両方killedへ転じることを実測した。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-19T14:40:07Z"
  review_binding:
    reviewer: "Codex TL preflight"
    reviewed_at: "2026-08-19T14:40:07Z"
    evidence_digest: "sha256:f7ea22e91e6499d6a471353cc31b42daca05a11f2401832f14e91aaa96b02a41"
  entries: []
entry_signals:
  - "po_directive:Issue #499 orchestration event projectionとcheckpoint transactional I/O"
  - "po_directive:Issue #215 terminal closureへ向けたevent projectionのcurrent-main接続"
agent_slots:
  - { role: tl, slot_label: "TL — transactional boundaryとpure judgement接続" }
contract_preconditions: "PLAN-L7-636-event-projection-checkpoint-replayのcompletion receiptがcurrent-mainへ束縛され、pure 8 exportsがcurrent authorityである"
contract_postconditions: "durable JSONL append、専用orchestration projection、atomic checkpoint、replay、race、crash windowが同一event identityで再現可能になる"
contract_invariants: "既存session_eventsへ11-field envelopeを詰め替えない。JSONLとSQLiteを同一transactionと偽装せず、append後projection前のcrashをreplayで回復する。純粋判定はPLAN-L7-636のexportを呼び、再実装しない"
contract_failures: "不正envelope、duplicate digest mismatch、causal inversion、illegal transition、stale HEAD、projection drift、orphan lane、DB write fault、checkpoint publish faultを成功へ丸めない"
tdd_red_required: false
tdd_red_waiver_reason: "existing continuation event-first contractをinventory-firstで再利用し、orchestration固有のschema、fault、race、replay oracleを同一atomic patchへ追加する"
complexity_effect: justified_positive
complexity_justification: "11-field orchestration envelopeを既存session_eventsへ混載せず、専用append-only projection rowへprojection/checkpoint digestを束縛するため"
removal_trigger: "親#215の後続orchestration storeが本contractを完全吸収し、旧adapterの参照が0になった時点"
parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md
    - docs/design/helix/L5-detail/event-projection-checkpoint-replay.md
  blocks:
    - issue:215-terminal-closure
    - issue:92-feature-terminal
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-001, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-002, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-003, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-004, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-005, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-006, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-007, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-008, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-009, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-010, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-011, test_path: tests/event-projection-checkpoint-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-IO-012, test_path: tests/event-projection-checkpoint-transaction.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-637-event-projection-checkpoint-transaction.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/event-projection-checkpoint-transaction.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/event-projection-checkpoint-transaction.test.ts, artifact_type: test_code }
---

# PLAN-L7-637: orchestration event projectionのtransactional I/O

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | JSONLをdurable append journalとして固定 | fsync後に同一event identityをreplayでき、append前の不正入力はI/O 0 |
| 2 | orchestration専用projection rowを追加 | `session_events`へschema混載せず、event・projection・checkpoint digestを同一rowへ束縛 |
| 3 | pure judgementをtransaction境界へ接続 | #636の8 exportがfailure codeを透過し、reject時のDB増分を0にする |
| 4 | crash／race／replay oracleを追加 | append後crash、projection fault、同時再送、DB rebuildが同一digestへ収束 |
| 5 | current HEADでCI・独立レビューへ引き渡し | targeted、全回帰、doctor、DB convergence、Claude exact-HEAD receiptが成立 |

## 責務境界

本PLANは#636のpure judgementを再実装しない。既存`session_events`のContinuationEventも再解釈しない。
JSONL append、専用SQLite projection、atomic checkpoint publication、再生とsystem oracleだけを所有する。
checkpointはprojection commit後に公開し、checkpoint publication failureは既存projectionを巻き戻さず再試行可能なreceiptへする。

## 非対象

- #636のpure 8 judgement exportとU-EPR-001..102
- 新CLI、GitHub Projects API、allocator、lane routing
- `session_events`のschema変更や既存continuationの意味変更
- #215以外のFeature terminal closure
