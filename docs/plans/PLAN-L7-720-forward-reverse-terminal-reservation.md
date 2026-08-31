---
plan_id: PLAN-L7-720-forward-reverse-terminal-reservation
title: "PLAN-L7-720: Forward作成時にpending Reverse終端契約を予約する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1297
behavior_contract_id: FORWARD-REVERSE-TERMINAL-RESERVATION-001
responsibility_owner: forward-reverse-terminal-reservation
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1297 Forward／pending Reverse vehicleを同一transactionで予約する"
contract_preconditions: "typed ADD_FEATUREのadd-impl、allocator receipt、current main HEAD、assignment／lease付きreservation snapshotが存在する"
contract_postconditions: "ForwardとReverseのexact identity、同一owner、双方向reference、pending stateを既存reservation projectionへ同時追加する"
contract_invariants: "Reverse本文／review evidence／完了証拠を捏造せず、Forward merge前にReverse完了を要求せず、legacy modeを出力しない"
contract_failures: "wrong allocator identity、stale main、片方向、active collision、旧identity再出力をfail-closeする"
tdd_red_required: true
red_test: "#1206／#1207／#1208でForward実装後にReverse vehicleを後付けし、PLAN confirmとCIが循環した実測をRed fixtureとする"
red_at: "2026-08-31T16:58:10Z"
green_at: "2026-09-01T03:48:31+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T04:19+09:00にsrc/runtime/forward-reverse-terminal-reservation.tsのReverse family checkを一時除去すると、npx vitest run tests/forward-reverse-terminal-reservation.test.tsでU-FRTR-002が1 failed／3 passedとなりmutationをkillした。直後に復元し同command 4 tests greenを実測した。"
complexity_effect: net_neutral
complexity_justification: "新ledgerを作らず、既存open-branch reservation projectionへpair transactionだけを追加する"
removal_trigger: "PLAN authoring transactionがForward／Reverseの物理文書作成まで同じDB transactionで所有する時"
parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
  requires:
    - docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
    - docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
  references:
    - issue:1297
    - issue:1208
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FRTR-001, test_path: tests/forward-reverse-terminal-reservation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FRTR-002, test_path: tests/forward-reverse-terminal-reservation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FRTR-003, test_path: tests/forward-reverse-terminal-reservation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FRTR-004, test_path: tests/forward-reverse-terminal-reservation.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-720-forward-reverse-terminal-reservation.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/forward-reverse-terminal-reservation.ts, artifact_type: source_module }
  - { artifact_path: tests/forward-reverse-terminal-reservation.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: se, slot_label: "SE — Forward／Reverse identityとreservation transaction" }
  - { role: qa, slot_label: "QA — stale main／collision／片方向／legacy mutation" }
---

# Forward／pending Reverse終端予約

## 工程表

1. allocator receiptとmain／assignment／lease境界をtyped inputへ固定する。
2. Forward／Reverseの2予約を既存projectionへ同時追加する。
3. identity、stale main、collision、legacy outputの負極性oracleを通す。
4. mutation、Claude exact-HEAD review、CI後にconfirmし、Forward merge後は別ReverseでR0〜R4とmain read-afterを行う。

本PLANは予約kernelだけを所有する。Reverse検証、Issue close、review省略、provider routingは非対象とする。
