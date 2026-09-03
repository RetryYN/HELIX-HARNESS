---
plan_id: PLAN-RECOVERY-97-ci-finalize-shard-fail-close-oracle
title: "PLAN-RECOVERY-97: full-regression finalizeのshard fail-close oracle"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1475
behavior_contract_id: CI-FINALIZE-SHARD-FAIL-CLOSE-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: harden_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "confirmed Full regression shard DAGとfinalize aggregateが全shardのjob_resultをfail-closeする"
contract_postconditions: "finalizeのいずれかのshard success要求を削除・常真化・別条件化した場合、workflow oracleがredとなり、正規条件ではgreenとなる"
contract_invariants: "全shardのreceipt／HEAD／base／partition exact validation、preflight failure、cancel／timeout／missingのfail-close、post-test gate順序を緩めず、testのみで実workflow成功を主張しない"
contract_failures: "任意shardのjob_result success条件欠落、常真化、continue-on-error、receipt欠落、wrong identity、gate短絡を黙って成功させない"
tdd_red_required: true
red_test: "U-FULLSHARD-WF-004でbulk-1/2/3またはstatefulのjob_result success条件をtrueへ変異するとfinalize_shard_fail_close_invalidでexit 1となることを実測する"
mutation_oracle_required: true
mutation_oracle_evidence: "未実施。実装前RedとしてU-FULLSHARD-WF-004を追加し、各shardのsuccess条件除去mutationを個別にkillする"
complexity_effect: net_neutral
complexity_justification: "既存finalize fail-close契約の欠落oracleだけを追加し、workflowの実行責務、receipt authority、DB projectionを増やさない"
removal_trigger: "finalizeのshard result fail-closeが別のtyped workflow contractへ統合され、重複oracleが不要になった時"
backprop_decision: not_required
backprop_decision_reason: "既存のCI shard/finalize fail-close意味を変更せず、falsifiable safety claimのoracleを補う"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-002, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-97-ci-finalize-shard-fail-close-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — finalize fail-close主張と既存契約の差分監査" }
  - { role: se, slot_label: "SE — workflow result条件の静的oracle配線" }
  - { role: qa, slot_label: "QA — 各shard success条件のmutation検証" }
  - { role: tl, slot_label: "TL — #1475と#1467／#1471の責務境界" }
dependencies:
  parent: docs/plans/PLAN-L7-685-full-regression-shard-jobs.md
  requires:
    - docs/plans/PLAN-L7-685-full-regression-shard-jobs.md
  references:
    - "issue:1475"
    - "issue:1467"
    - "issue:1471"
    - docs/plans/PLAN-RECOVERY-94-ci-shard-budget-headroom.md
  blocks: []
review_evidence: []
---

# PLAN-RECOVERY-97: full-regression finalizeのshard fail-close oracle

## 目的

Issue #1475で確認された、`full-regression-finalize` が全shardの `job_result=success` を要求する条件を
削除しても既存testがgreenになる欠落を回復する。現行workflowのfail-close動作自体は変更せず、4 shard
それぞれのsuccess条件を機械的に検査し、将来の条件削除・常真化・条件置換をredにする。

## 実装範囲

1. finalizeのbulk-1、bulk-2、bulk-3、statefulのsuccess条件をrequired contractとして列挙する。
2. 正常workflowは既存の `U-FULLSHARD-WF-002` とともにgreenを維持する。
3. 各success条件を削除・常真化するmutationを個別にredへ写像する。

## 非対象

- shardの分割、timeout、receipt validator、DB transaction boundaryの変更
- `continue-on-error`、過去generation、別receipt、targeted testによるsuccess補完
- GitHub Issue／PRの自動close、release／publish

## 完了条件

- [ ] U-FULLSHARD-WF-004のRed→Greenと4種mutation killをcurrent HEADで確認する。
- [ ] 正常workflowのfinalize fail-close条件を維持する。
- [ ] typecheck、targeted test、全回帰、doctor、Claude exact-HEAD reviewがgreenになる。
- [ ] #1475へmain read-afterの実測証拠を接続する。

本PLANは既存CI契約のfalsifiable oracle追加であり、実workflowのfail-close条件を弱めない。
