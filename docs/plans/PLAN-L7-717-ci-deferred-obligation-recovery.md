---
plan_id: PLAN-L7-717-ci-deferred-obligation-recovery
title: "PLAN-L7-717: CI deferred obligation exactly-once回収"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1208
behavior_contract_id: CI-DEFERRED-OBLIGATION-RECOVERY-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:CI System Synthesisのdeferred obligation回収を実workflowへ接続する"
contract_preconditions: "#1206 Verification Planがdeferred obligationとexact targetを生成し、#1207 schedulerがrequired obligationを変更しない"
contract_postconditions: "origin PR、candidate HEAD、obligation、最初のterminal run、result、finding dispositionをexact receiptへ束縛する"
contract_invariants: "延期義務を削除せず、後段failureからauthorityを直接変更せず、安全性低下を時間短縮で相殺しない"
contract_failures: "missing、duplicate、expired、cancelled、stale HEAD、wrong profile、wrong origin、invalid quarantineをfail-closeする"
tdd_red_required: true
red_at: "2026-08-31T23:31:00+09:00"
green_at: "2026-08-31T23:34:10+09:00"
tdd_red_evidence: "U-CIDEFER-001..006を先行作成し、ci-deferred-obligation-recovery module欠落でimport failureとなった"
tdd_green_evidence: "npx vitest run tests/ci-deferred-obligation-recovery.test.tsで6 passed、npx tsc --noEmitもgreen"
mutation_oracle_required: true
mutation_oracle_evidence: "U-CIDEFER-002..006でterminal run削除／重複、profile／HEAD／origin変異、cancel、backprop edge欠落、期限切れquarantine、escaped defectとmutation未検出を個別にkillする"
complexity_effect: net_neutral
complexity_justification: "schedulerへ回収責務を混載せず、既存Verification Plan出力を単一domain projectionへ閉じる"
removal_trigger: "Verification Planと実行journalが同じexactly-once state machineへ統合された時"
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
pair_artifact: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-706-ci-verification-plan.md
  requires:
    - docs/plans/PLAN-L7-706-ci-verification-plan.md
    - docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md
  references:
    - issue:1208
    - issue:1206
    - issue:1207
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-001, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-002, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-003, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-004, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-005, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-006, test_path: tests/ci-deferred-obligation-recovery.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-deferred-obligation-recovery.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-deferred-obligation-recovery.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — exactly-once recovery domain設計" }
  - { role: qa, slot_label: "QA — selector fault injectionと安全性oracle" }
---

# CI deferred obligation exactly-once回収

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | typed recovery contractと反例oracle | 並列 | U-CIDEFER-001..006 green |
| 2 | workflow adapterとjournal／receipt接続 | 直列 | main／nightly／release candidate E2E green |
| 3 | selector fault injection exact set | 直列 | 5 mutation全検出 |
| 4 | Reverse fullbackとmain read-after | 直列 | #1208 terminal closure |

Step 1は依存PRの検収待ち中に先行できる。Step 2以降とPLAN confirmed化は#1207 canonical merge後に行う。
