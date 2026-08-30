---
plan_id: PLAN-L7-715-confirmed-pending-reverse-pairing
title: "PLAN-L7-715: confirmed pending Reverseのpair identityをdependency readinessから分離する"
kind: recovery
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1273
behavior_contract_id: PENDING-REVERSE-PAIRING-READINESS-001
responsibility_owner: plan-backfill-pairing-governance
change_slice: atomic
refactor_step: repair_contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: pure_function
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1273 confirmed pending Reverse pairing Recovery"
contract_preconditions: "Forward／Reverse PLAN identity、status、backfill_state、dependencies references/requiresを解析できる"
contract_postconditions: "draft pendingはreferences、confirmed pendingはreferencesまたは明示requires、terminal Reverseはrequiresでpairingする"
contract_invariants: "pair identityをexecution readinessへ推測昇格せず、plan-governanceのrequires_missingを緩和しない"
contract_failures: "片方向、wrong ID、state不一致、draft pending requires-only、terminal references-onlyをfail-closeする"
tdd_red_required: true
red_at: "2026-08-31T03:52:29+09:00"
green_at: "2026-08-31T04:00:00+09:00"
tdd_red_evidence: "PR #1271 CI run 33329257688がconfirmed pending Reverseへのrequires_missingでRed、PR #1267はreferences欠落でRedとなる循環を実測した"
tdd_green_evidence: "tests/backfill-pairing.test.ts U-BACKFILL-008..010とtypecheck green"
mutation_oracle_required: true
mutation_oracle_evidence: "U-BACKFILL-009でconfirmed pending references/requiresの片側受理を除去するmutation、U-BACKFILL-010でpending/terminal分岐を除去するmutationをkillする"
complexity_effect: net_negative
complexity_justification: "PLAN statusとbackfill lifecycleを混同した二重判定をbackfill_state authorityへ収束する"
removal_trigger: "typed pairing edgeとexecution dependency edgeが別fieldとしてschema正本化された時"
parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
  requires: []
  references:
    - docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
    - "issue:1273"
    - "issue:1155"
    - "pull:1271"
    - "pull:1267"
  blocks:
    - "issue:1206"
    - "issue:1207"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-BACKFILL-008, test_path: tests/backfill-pairing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-BACKFILL-009, test_path: tests/backfill-pairing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-BACKFILL-010, test_path: tests/backfill-pairing.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-715-confirmed-pending-reverse-pairing.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/backfill-pairing.ts, artifact_type: source_module }
  - { artifact_path: tests/backfill-pairing.test.ts, artifact_type: test_code }
agent_slots:
  - { role: qa, slot_label: "QA — confirmed pending／terminal state mutation" }
  - { role: tl, slot_label: "TL — pair identityとdependency readiness分離" }
---

# confirmed pending Reverse pairingのRecovery

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | confirmed pending循環をRed固定 | 直列 | #1271/#1267の相反gateを再現 |
| 2 | backfill_state authorityへ修正 | 直列 | U-BACKFILL-008..010 green |
| 3 | CI、独立review、main read-after | 直列 | #1271/#1267を正規順序で解放 |
