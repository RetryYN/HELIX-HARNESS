---
plan_id: PLAN-L7-576-github-execution-episode-state
title: "PLAN-L7-576 (impl): GitHub execution episode状態をDB正本化する"
kind: impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #205 execution episode／current-location projection"]
created: 2026-08-16
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: GITHUB-EXECUTION-EPISODE-STATE-001
responsibility_owner: github-execution-episode-state
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: entity
contract_preconditions: "workflow identityはIssue／PLAN／PRへ投影済みだが、同じworkを束縛するexecution episode event／outbox／projectionが存在しない"
contract_postconditions: "episode event、transactional outbox、current projectionが単一transactionとreplayでexactly onceに収束する"
contract_invariants: "workflow identityとepisode identityを分離し、resource identityを差替えず、legacy identityをcurrent projectionへ出さない"
contract_failures: "identity欠落、順序飛越し、stale revision、resource差替え、idempotency conflict、partial write、terminal再利用、replay driftを別reasonで閉じる"
tdd_red_required: true
tdd_red_waiver_reason: null
red_at: "2026-08-16T00:44:25Z"
green_at: "2026-08-16T01:33:34Z"
mutation_oracle_evidence: "2026-08-16T00:55:42ZにNEXT_STATE.admittedをplannedからpr_openへ一時変異し、tests/github-execution-episode-state.test.tsのU-GHEP-002／003／006が3 failed・5 passed、exit 1となるkillを実測した。apply_patchで復元後greenを再確認した"
complexity_effect: justified_positive
complexity_justification: "proseと複数surfaceへ散在するwork lifecycleを一つのepisode reducerとtransactional projectionへ集約する"
removal_trigger: "execution episode schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-001, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-002, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-003, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-004, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-005, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-006, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-007, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-008, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — episode reducer／transaction" }
  - { role: qa, slot_label: "QA — replay／fault／conflict oracle" }
  - { role: tl, slot_label: "TL — requirements／DB authority境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T01:33:34Z"
    tests_green_at: "2026-08-16T01:33:34Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 execution episode stateの実装deltaを独立reviewした。初回blocker 3件と再review blocker 1件／high 2件を、active resource lease、HEAD event更新、terminal receipt／PO decisionのepisode・HEAD束縛、transaction内event replay convergence、shared base並行許可、反例拡充で是正し、実装deltaの最終判定はblocker／high／medium／low 0件。commit hashをPLAN内へ自己参照せず、current exact-HEAD freshnessはPRのClaude Code Opus sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npm run typecheck && npx vitest run tests/github-execution-episode-state.test.ts tests/state-db-schema-authority.test.ts tests/state-db.test.ts tests/digest.test.ts tests/design-coverage.test.ts tests/ddd-tdd-rules.test.ts tests/l3-g3-freeze-packet-v2.test.ts && npx tsx src/cli.ts plan lint docs/plans/PLAN-L7-576-github-execution-episode-state.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T01:33:34Z"
        evidence_path: tests/github-execution-episode-state.test.ts
        output_digest: "sha256:8ec282c3ec7874ddd86bec955f124d9a49745be82f7d3bc0ae9186f3796f4411"
        result: "7 files／102 tests passed、typecheck green、PLAN lint green、exact HEAD review blocker 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T01:33:34Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T01:33:34Z"
    evidence_digest: "sha256:099a45c52b1ef867f43346c3d14701955a58a07b38f33338e6ca2c5f706c97b6"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-576-github-execution-episode-state.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-state.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/github-merge-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/github-execution-episode-state.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
  references:
    - docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
    - docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md
  blocks: []
---

# GitHub execution episode状態

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-021／022とGH-AC-019／020をL3/L10へ追加 | [直列] | requirements pair current |
| 2 | reducerのRed oracleを実装 | [直列] | expected failureを記録 |
| 3 | event／outbox／projection schemaとtransactionを実装 | [直列] | U-GHEP-001..007 green |
| 4 | schema／pair／G3 digestを収束 | [直列] | U-GHEP-008 green |
| 5 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

current-location、right-arm evidence、terminal closure workerは後続の#205原子的sliceで接続する。

## TDD Red証跡

2026-08-16T00:44:25Z、実装moduleが存在しない状態で
`vitest run --project fast tests/github-execution-episode-state.test.ts`を実行し、module resolution error、
test file 1 failed、test 0件、exit 1を確認した。実装後のgreenと混同しない。

## 終端収束

PR #737のcanonical merge、exact-HEAD独立review、episode event／outbox／projectionのDB replay convergenceを
Reverse `PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill`のR0〜R4で再照合し、
同Reverse PLANの`references`から本PLANへの逆向きlinkを接続した。これにより双方向linkと
execution episode状態契約が成立したため、`backfill_state: complete`および
`completion_claim_allowed: true`へ遷移する。本PRのcurrent-HEAD CI、Claude Opus exact-HEAD review、
main read-afterをterminal acceptanceとして要求し、いずれかの失敗を完了へ丸めない。
