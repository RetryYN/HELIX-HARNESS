---
plan_id: PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger
title: "PLAN-L7-865 (refactor): 旧orchestration semantic consumer ledger"
kind: refactor
layer: L7
drive: agent
status: draft
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
updated: 2026-09-07
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
contract_postconditions: "team／pair／loop direct、fire／release、max_parallel、LoopState write-back、legacy importがexact ledgerへ束縛され、欠落・偽装・未成立退役をfail-closeする"
contract_invariants: "既存string ratchetを変更しない。scheduler追加、旧engine削除、snapshot／catalog／CLI／team-run変更、historical／read-onlyとwrite／controlの混在を行わない"
contract_failures: "必須entry欠落、symbol／anchor不一致、direct callの互換偽装、fireSlot／releaseSlot／max_parallel／write-backの欠落、alias／dynamic import／分割commandによる隠蔽、successor／E2E／rollback／read-afterなしの移行・退役を拒否する"
tdd_red_required: true
red_test: "semantic consumer validator未実装時にtests/legacy-orchestration-semantic-consumers.test.tsがmodule missingで失敗することを確認し、その後validatorとledgerを追加して同じテストをgreen化する"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/legacy-orchestration-semantic-consumers.test.tsでconsumer role、必須entry、successor callsite、退役precondition、alias／dynamic import／分割command、test fixture pathを変異させ、各反例がfail-closeすることを検証する"
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
generates:
  - { artifact_path: docs/plans/PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger.md, artifact_type: markdown_doc }
  - { artifact_path: config/legacy-orchestration-semantic-consumers.json, artifact_type: json_config }
  - { artifact_path: src/lint/legacy-orchestration-semantic-consumers.ts, artifact_type: source_module }
  - { artifact_path: tests/legacy-orchestration-semantic-consumers.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: config/legacy-orchestration-surface-inventory.json, artifact_type: json_config }
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
review_evidence: []
---

# PLAN-L7-865: 旧orchestration semantic consumer ledger

## 目的

Issue #865 Phase 1として、旧orchestrationの既知文字列inventoryに加え、実際のproduction
symbol／callsiteを意味上のconsumerとして記録・検証する。既存engineの実行挙動は変更せず、
旧engine削除や新scheduler実装の前提となる観測契約だけを先に固定する。

## 実装範囲

1. `config/legacy-orchestration-semantic-consumers.json`へ、team／pair／loop CLI direct、
   `fireSlot`／`releaseSlot`、`max_parallel`、LoopState write-back、legacy importを登録する。
2. `src/lint/legacy-orchestration-semantic-consumers.ts`で、必須field、role、source symbol、
   再解決可能なanchor、source path、migration state、successor、退役前提を検証する。
3. alias、dynamic import、分割command、direct callの互換・read-only偽装をnegative oracleで
   fail-closeする。
4. `tests/legacy-orchestration-semantic-consumers.test.ts`でRed→Greenとmutation反例を固定する。

## 境界

`status: draft`と`completion_claim_allowed: false`を維持する。本Phaseでは、既存の
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
verification bindingとdoctor hard checkが成立し、許可path以外を変更していないことを意味する。main／DB projection、
successor E2E、rollback、read-after、旧engine削除は後続phaseであり、本PLANの完了主張には含めない。
