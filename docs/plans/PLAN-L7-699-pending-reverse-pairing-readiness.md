---
plan_id: PLAN-L7-699-pending-reverse-pairing-readiness
title: "PLAN-L7-699: pending Reverse pairingをdependency readinessと整合させる"
kind: refactor
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "po_directive:Issue #1155 PR #1139 backfill-pairing／dependency readiness contradiction"
created: 2026-08-28
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1155
behavior_contract_id: PENDING-REVERSE-PAIRING-READINESS-001
responsibility_owner: plan-backfill-pairing-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "L3 pending Reverse pairing要件へcurrent契約を直接正本化し、旧requires方式をcompatibility inputへ隔離する。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "Forward add-implと対応Reverseのexact PLAN identity、status、backfill_state、dependencies linkが読める"
contract_postconditions: "draft／pending Reverseは双方向referencesでpairingされ、未ready dependencyへ推測昇格されない"
contract_invariants: "片方向、wrong ID、state不一致、archived linkをfail-closeし、legacy pre-enforcement入力だけを保持する"
contract_failures: "pending Reverseへrequiresを強制するgate矛盾、link欠落、state推測、旧方式のcurrent再出力を拒否する"
tdd_red_required: true
red_test: "PR #1139 CI run 33173316295のU-BACKFILL-006がPLAN-L7-696→PLAN-REVERSE-696の双方向referencesをreverseLinkMissingとしてRed固定した"
red_at: "2026-08-28T22:09:04+09:00"
green_at: "2026-08-28T22:19:33+09:00"
mutation_oracle_evidence: "2026-08-29T01:55:16+09:00のClaude exact-HEAD独立reviewで、pending Reverse判定からbackfill_state条件を除去するmutationをtests/backfill-pairing.test.tsのU-BACKFILL-008が1 failed／32 passed（exit 1）でkilledする一方、pending時にrequiresも許容するmutationが33/33 greenで生存すると実測した。requires-only負例追加後、同mutationを対象test filterで実測して1 failed／33 skipped（exit 1）でkilledし、復元後の全34 testsをgreenへ戻した。"
complexity_effect: net_neutral
complexity_justification: "link identityとexecution dependencyを一つのstate-aware判定へ集約し、相反gateを除去する"
removal_trigger: "PLAN dependency schemaがtyped pairing edgeを第一級fieldとして持ち、references compatibilityを廃止できる時"
parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-BACKFILL-008, test_path: tests/backfill-pairing.test.ts }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - "issue:1155"
    - "pr:1139"
agent_slots:
  - { role: qa, slot_label: "QA — pending／terminal state mutation" }
  - { role: tl, slot_label: "TL — requirements／dependency readiness整合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/backfill-pairing.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/backfill-pairing.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/backfill-pairing.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# pending Reverse pairing readiness工程

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | requirementsへlink identityとdependency readinessを分離 | current契約が一意になる |
| 2 | U-BACKFILL-008 Red→Green | pending双方向referencesとnegative stateを被覆 |
| 3 | design catalog登録とreviewed digest cascadeを更新 | dedicated V-pair、PR scope exact 10 paths、catalog／freeze packetが同一digestへ収束 |
| 4 | doctor／全回帰／独立review | #1139を正規に解放できる |
