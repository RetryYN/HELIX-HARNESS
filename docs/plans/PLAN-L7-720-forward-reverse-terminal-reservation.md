---
plan_id: PLAN-L7-720-forward-reverse-terminal-reservation
title: "PLAN-L7-720: Forward作成時にpending Reverse終端契約を予約する"
kind: add-impl
layer: L7
drive: agent
status: draft
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
contract_preconditions: "typed ADD_FEATURE semantic slug、remote main、availableな既存reservation authority、同branch／HEAD／assignment／lease／fenceのactive_writer anchorが一致し、caller exact ID／receiptを含まない"
contract_postconditions: "Forward／Reverse PLAN、issuer receipt、更新reservation authorityをsealed durable transactionで同時materializeし再読込projectionを照合する"
contract_invariants: "Reverse本文／review evidence／完了証拠を捏造せず、Forward merge前にReverse完了を要求せず、legacy modeを出力しない"
contract_failures: "caller自己署名、stale main／HEAD、authority／digest drift、TOCTOU collision、seal／lock／realpath不正、片方向をfail-closeする"
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
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-001, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-002, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-003, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-004, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-005, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-006, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-007, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-008, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-009, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-010, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-011, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-012, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-013, test_path: tests/forward-plan-authoring-transaction.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, oracle_id: U-FPATR-014, test_path: tests/forward-plan-authoring-transaction.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-720-forward-reverse-terminal-reservation.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/forward-reverse-terminal-reservation.ts, artifact_type: source_module }
  - { artifact_path: tests/forward-reverse-terminal-reservation.test.ts, artifact_type: test_code }
  - { artifact_path: src/runtime/forward-plan-authoring-transaction.ts, artifact_type: source_module }
  - { artifact_path: tests/forward-plan-authoring-transaction.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: se, slot_label: "SE — Forward／Reverse identityとreservation transaction" }
  - { role: qa, slot_label: "QA — stale main／collision／片方向／legacy mutation" }
---

# Forward／pending Reverse終端予約

## 工程表

1. semantic slugとremote main／assignment／lease境界をtyped inputへ固定し、caller exact ID／receiptを禁止する。
2. Forward／Reverseの2予約を既存projectionへ同時追加する。
3. `helix plan author-forward`からjournal付きNode transaction内issuerへ接続し、両PLAN、receipt、reservation authorityを同時materializeする。
4. identity、remote main／candidate HEAD、digest drift、collision、legacy output、冪等retry、prepared外部write、path非正規slug、anchor欠落、journal-first crashの負極性oracleを通す。
5. mutation、Claude exact-HEAD review、CI後にconfirmし、Forward merge後は別ReverseでR0〜R4とmain read-afterを行う。

本PLANは予約kernel、open-branch authorityからnext free familyを選ぶexact ID receipt発行境界、その最小production authoring consumerを所有する。汎用allocator policy、Reverse検証、Issue close、review省略、
provider routing、PLAN completionは非対象とする。
