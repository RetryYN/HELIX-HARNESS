---
plan_id: PLAN-REVERSE-707-ci-critical-path-scheduler
title: "PLAN-REVERSE-707: CI critical-path schedulerのReverse fullback vehicle"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
pair_artifact: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1270
behavior_contract_id: CI-CRITICAL-PATH-SCHEDULER-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1270で#1207 schedulerのReverse vehicleを先行定義"
contract_preconditions: "Forward PLAN-L7-707がPERFORMANCE_REFACTORとしてrequired obligation保存schedulerを所有する"
contract_postconditions: "Forward merge後にR0〜R4 evidenceを採取し、L3／L6／L8へ再接着して#1208へ渡す"
contract_invariants: "本vehicle単独では実装完成、Reverse完成、Issue #1207 completionを主張しない"
contract_failures: "Forward双方向reference欠落、wrong HEAD、stale review、obligation縮退、実測前completion claimをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "実装を持たないReverse vehicleの先行定義であり、Forward oracleを捏造して再実行しない"
mutation_oracle_required: true
mutation_oracle_evidence: "backfill-pairingの双方向reference mutationとForward U-CISCHED oracleを実装merge後のR0〜R4で再実行する"
complexity_effect: net_neutral
complexity_justification: "exactly-one PLANを保ったままForwardとReverseの責務を分離する"
removal_trigger: "CI System Synthesis全体Reverseが本証拠を統合し、個別vehicle参照が不要になった時"
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
  references:
    - issue:1270
    - issue:1207
    - issue:1208
    - docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md
  blocks: []
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-707-ci-critical-path-scheduler.md, artifact_type: markdown_doc }
agent_slots:
  - { role: qa, slot_label: "QA — obligation保存とfallbackのR0〜R4再検証" }
  - { role: tl, slot_label: "TL — Forward双方向linkと#1208再接着" }
---

# CI critical-path schedulerのReverse vehicle

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | vehicleを先行定義 | 直列 | draft／pending_reverse、completion claimなし |
| 2 | Forward PLANから双方向reference | 直列 | backfill pairing green |
| 3 | Forward merge後にR0〜R4採取 | 直列 | exact HEAD、review、CI、main read-after |

本PLANはReverseの作業車両だけを先行定義する。#1241の実装、Claude exact-HEAD review、canonical merge、post-main read-afterが揃うまで`status:draft`、`completion_claim_allowed:false`、`backfill_state:pending_reverse`を維持する。
