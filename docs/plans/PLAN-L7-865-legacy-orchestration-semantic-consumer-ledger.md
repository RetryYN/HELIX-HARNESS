---
plan_id: PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger
title: "PLAN-L7-865 (refactor): 旧orchestration semantic consumer ledger"
kind: refactor
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "structural"
created: 2026-09-07
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 865
parent_plan: PLAN-L7-729-legacy-orchestration-new-use-freeze
behavior_contract_id: LEGACY-ORCH-SEMANTIC-CONSUMER-001
responsibility_owner: legacy-orchestration-retirement
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "Phase 1は既存retirement契約を変更せず、現行production consumerの観測・分類と退役前提だけを追加する。"
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "PLAN-L7-729のstring ratchetが存在し、現行production sourceのsymbol／callsiteを読み取れること"
contract_postconditions: "team／pair／loop direct、fire／release、max_parallel、LoopState write-back、legacy importと追加で確認した8つのsemantic consumerが、凍結base＋署名付きrevision overlayのJOINとしてexact ledgerへ束縛され、欠落・偽装・未成立退役をfail-closeする"
contract_invariants: "既存string ratchetのcapとentry上限および公開済みsemantic ledger baseのraw bytesは不変とする。追加consumerは別revisionへ隔離し、base digest、revision payload digest、採取source headのancestor条件を検証する。scheduler追加、旧engine削除、snapshot／catalog／CLI／team-run変更、historical／read-onlyとwrite／controlの混在を行わない"
contract_failures: "必須entry欠落、symbol／anchor不一致、識別可能なdirect callの互換偽装、fireSlot／releaseSlot／max_parallel／write-backの欠落、直代入alias／静的dynamic import／require member・destructuring alias／CLI argv形の分割commandによる隠蔽、successor／E2E／rollback／read-afterなしの移行・退役を拒否する。tick／store.write／plan.max_parallel等の汎用tokenはexact ledger anchorで検査し、repo-wide hidden-consumer markerには使わない"
tdd_red_required: true
red_test: "semantic consumer validator未実装時にtests/legacy-orchestration-semantic-consumers.test.tsがmodule missingで失敗することを確認し、その後validatorとledgerを追加して同じテストをgreen化する"
red_at: "2026-09-07T08:05:08Z"
green_at: "2026-09-07T10:32:54Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/legacy-orchestration-semantic-consumers.test.tsでconsumer role、必須entry、successor callsite、退役precondition、alias／dynamic import／分割command、test fixture path、revision overlayの欠落・payload改変を変異させ、各反例がfail-closeすることを検証する"
complexity_effect: net_negative
complexity_justification: "分散した旧consumerの意味分類を純粋なledger validatorへ集約するが、実行engineや新しいschedulerは追加しない"
removal_trigger: "production consumer zero、successor parity、E2E、rollback、read-afterが揃い、semantic ledgerをretirement read-afterへ置換できる時点"
parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md
pair_artifact: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md
dependencies:
  parent: PLAN-L7-729-legacy-orchestration-new-use-freeze
  requires:
    - docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md
  references:
    - "issue:865"
    - "issue:863"
    - "issue:819"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-001, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-002, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-003, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-004, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-005, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-006, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-007, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-008, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-009, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-010, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-011, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-012, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-013, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-014, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-015, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-016, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-017, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-018, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-019, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-020, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-021, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-022, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-023, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-SEM-024, test_path: tests/legacy-orchestration-semantic-consumers.test.ts }
generates:
  - { artifact_path: .helix/evidence/review-865/vitest-targeted.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger.md, artifact_type: markdown_doc }
  - { artifact_path: config/legacy-orchestration-semantic-consumers.json, artifact_type: json_config }
  - { artifact_path: config/legacy-orchestration-semantic-consumers-revision-2026-09-10.json, artifact_type: json_config }
  - { artifact_path: src/lint/legacy-orchestration-semantic-consumers.ts, artifact_type: source_module }
  - { artifact_path: tests/legacy-orchestration-semantic-consumers.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: config/legacy-orchestration-surface-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/legacy-orchestration-surface.ts, artifact_type: source_module }
  - { artifact_path: tests/legacy-orchestration-surface.test.ts, artifact_type: test_code }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md, artifact_type: test_design }
agent_slots:
  - { role: se, slot_label: "SE — exact ledger／source anchor validator" }
  - { role: qa, slot_label: "QA — negative oracle／mutation／hidden consumer" }
  - { role: tl, slot_label: "TL — Phase 1 boundaryとlegacy retirement条件" }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T19:10:00Z"
    tests_green_at: "2026-09-09T18:43:01Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: 0402d81ffd958f996ec2eb95418d1537fbec44ea
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1625#issuecomment-5607465674"
    ci_evidence_generation: "run:34394147122:attempt:1:failure"
    scope: "PR #1625 exact-HEAD delta review。branch固有patchは前回approve HEAD c1099fefdとbyte同一、main 282ec5219 resyncはconflictなし。targeted 49 tests、governance、post-merge-status、doctor legacy-orchestration両gate green。根拠: https://github.com/RetryYN/HELIX-HARNESS/pull/1625#issuecomment-5607312326"
    green_commands:
      - kind: unit_test
        command: "npx vitest run --project fast tests/legacy-orchestration-semantic-consumers.test.ts tests/legacy-orchestration-surface.test.ts tests/goal-evidence-audit.test.ts tests/digest.test.ts --reporter=json --outputFile=.helix/evidence/review-865/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T18:43:01Z"
        evidence_path: .helix/evidence/review-865/vitest-targeted.json
        output_digest: "sha256:4cfa6dbc627cba53e90c8c7ee6bc6f73ab3dceb9e8a73e0891a33fc2cda7ff58"
        result: "8 suites / 49 tests passed"
---

# PLAN-L7-865: 旧orchestration semantic consumer ledger

## 目的

Issue #865 Phase 1として、旧orchestrationの既知文字列inventoryに加え、実際のproduction
symbol／callsiteを意味上のconsumerとして記録・検証する。既存engineの実行挙動は変更せず、
旧engine削除や新scheduler実装の前提となる観測契約だけを先に固定する。

## 実装範囲

1. `config/legacy-orchestration-semantic-consumers.json`を凍結baseとして保持し、team／pair／loop CLI direct、
   `fireSlot`／`releaseSlot`、`max_parallel`、LoopState write-back、legacy importを登録する。
2. `config/legacy-orchestration-semantic-consumers-revision-2026-09-10.json`へ追加で確認した8件を
   revision overlayとして登録し、base raw bytesを直接変更せずにJOINできるようにする。
3. `src/lint/legacy-orchestration-semantic-consumers.ts`で、必須field、role、source symbol、
   再解決可能なanchor、source path、migration state、successor、退役前提と、base／revisionの
   digest・source head・entry集合を検証する。
4. alias、dynamic import、分割command、direct callの互換・read-only偽装をnegative oracleで
   fail-closeする。
5. `tests/legacy-orchestration-semantic-consumers.test.ts`でRed→Greenとmutation反例を固定する。

## 境界

`completion_claim_allowed: false`を維持する。本Phaseでは、既存の
文字列ratchetは本ledger実装3 pathだけを固定allowlistへ追加し、任意除外の増加は拒否する。`src/cli.ts`、`src/team/run.ts`、design catalogは
変更しない。semantic ledgerをdoctor hard checkへ接続するが、新しいschedulerやsuccessor runtimeを実装せず、team／pair／loopのdirect engineも
削除しない。ledgerはcompatibility-onlyの観測であり、旧実装の正当化やconsumer zeroの代替証拠
ではない。

## 退役遷移の条件

`migrated`または`retired`へ進めるには、predecessor Issueのcloseだけでは不十分である。
`production_consumer_zero`、`successor_production_callsite`、`parity_e2e_green`、
`rollback_verified`、`read_after_verified`と、実production sourceで解決できる
`successor_symbol`をすべて要求する。現行ledgerのentryはPhase 1では`frozen`とする。

## 完了境界

このPhaseの完了は、targeted test、Node 24 typecheck、PLAN lint、設計／テスト設計との
verification binding、凍結baseとrevision overlayのdigest／ancestor検証、およびdoctor hard checkが成立し、許可path以外を変更していないことを意味する。main／DB projection、
successor E2E、rollback、read-after、旧engine削除は後続phaseであり、本PLANの完了主張には含めない。
