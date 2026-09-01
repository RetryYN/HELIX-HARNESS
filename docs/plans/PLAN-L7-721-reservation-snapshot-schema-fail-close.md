---
plan_id: PLAN-L7-721-reservation-snapshot-schema-fail-close
title: "PLAN-L7-721: Forward／Reverse予約snapshotをtyped schemaでfail-closeする"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1317
behavior_contract_id: FORWARD-REVERSE-RESERVATION-SNAPSHOT-SCHEMA-001
responsibility_owner: forward-reverse-terminal-reservation
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
backprop_decision: not_required
backprop_decision_reason: "Issue #1317は既存snapshot意味正本をconsumerへ再利用し、未検証z.customだけを除去する挙動修正であり、上位要求やallocator policyを変更しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "po_directive:Issue #1317 PR #1302 reservation_snapshot malformed inputをtyped fail-closeへ収束"
contract_preconditions: "open-branch reservation snapshot schemaがcurrent typed authorityとして存在し、#1302のForward／Reverse予約consumerが同型snapshotを受け取る"
contract_postconditions: "consumerがcanonical snapshot schemaを直接再利用し、malformed snapshotを例外なしのinput_invalid findingで拒否する"
contract_invariants: "valid production snapshot、allocator採番、semantic slug、stale main、collision、idempotent retry、#1256接続境界を変更しない"
contract_failures: "undefined、null、primitive、reservations欠落、nested reservation不正、unknown fieldをfail-closeする"
tdd_red_required: true
red_test: "U-FRTR-005追加前はundefined/null/42/{}で未捕捉TypeError、schema export改名の内部参照未追従時は既存25 tests red"
red_at: "2026-09-01T10:27:04+09:00"
green_at: "2026-09-01T10:27:32+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T10:29+09:00にreservation_snapshotをz.any()へ退化させると、npx vitest run tests/forward-reverse-terminal-reservation.test.tsでU-FRTR-005のみ1 failed／4 passedとなり、undefinedの未捕捉TypeErrorを検出してmutationをkillした。直後にcanonical schemaへ復元した。"
complexity_effect: net_negative
complexity_justification: "consumerの無検証z.customを削除し、snapshot validation authorityを既存schema 1件へ収束する"
removal_trigger: "Forward／Reverse reservation consumerがopen-branch projection APIだけを受け取りraw snapshotを受理しなくなった時"
parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-720-forward-reverse-terminal-reservation.md
  requires:
    - docs/plans/PLAN-L7-720-forward-reverse-terminal-reservation.md
    - docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
  references:
    - issue:1317
    - issue:1297
    - issue:1256
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FRTR-005, test_path: tests/forward-reverse-terminal-reservation.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-721-reservation-snapshot-schema-fail-close.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/runtime/open-branch-plan-identity-reservation.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/forward-reverse-terminal-reservation.ts, artifact_type: source_module }
  - { artifact_path: tests/forward-reverse-terminal-reservation.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: se, slot_label: "SE — canonical snapshot schema再利用境界" }
  - { role: qa, slot_label: "QA — malformed nested inputと未捕捉例外mutation" }
---

# Forward／Reverse予約snapshot typed fail-close

## 工程表

1. open-branch reservationの既存snapshot schemaをexportし、projection内部とconsumerで同じauthorityを使う。
2. `z.custom`をcanonical schemaへ置換する。
3. malformed exact setをU-FRTR-005へ固定し、既存reservation／authoring回帰とtypecheckを通す。
4. mutation、独立review、CI後にconfirmし、親#1302 merge後にmainへ載せ替える。

本PLANはschema validation gapだけを所有する。#1256 live provider接続、採番policy、semantic slug、Issue #1297終端は非対象とする。
