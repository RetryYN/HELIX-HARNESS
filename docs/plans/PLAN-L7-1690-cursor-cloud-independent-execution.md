---
plan_id: PLAN-L7-1690-cursor-cloud-independent-execution
title: "PLAN-L7-1690 (add-impl): Cursor Cloud第三者実行admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
runtime_activation_allowed: false
created: 2026-09-13
updated: 2026-09-13
red_at: "2026-09-12T15:24:34Z"
green_at: "2026-09-12T15:25:08Z"
owner: Codex / TL
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L5/L8 typed contractがdraftとして固定され、実cloud dispatchとは分離されている"
contract_postconditions: "assignment schema、scope択一、path、期限、budget、pre-dispatch external identityを純粋Node admissionで決定する"
contract_invariants: "副作用、credential、provider通信、第二台帳・scheduler・approvalを追加せず、未知入力をfail-closeする"
contract_failures: "schema→authority stale→branch preissue→budget→identityの順序で最初のfailureだけを返す"
tdd_red_required: true
tdd_red_waiver_reason: "module missing Redを2026-09-13に実測した"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-13、親#1776追従後の現行source digest sha256:d74f8b8d2cdde8719d27628245155d4c6e5609073c12a77aae8be87717989decに対し、admitCursorCloudAssignmentのvalidAssignment fail-close分岐をfalseで迂回する変異を1件適用した。tests/cursor-cloud-independent-execution.test.tsのU-CCI-001／002が2 failed・17 passed・exit 1となり、unknown field／unsafe pathの誤受理をkillした。production分岐へ復元後は19/19 green、source digest一致、source差分0を確認した。旧HEAD 2d4c28645／37f915d30での12変異測定は履歴であり、現行完了根拠には使用しない。本測定のsurvived 0はこの現行sourceへの列挙1変異だけを母集団とし、網羅的変異試験を主張しない。"
complexity_effect: net_negative
complexity_justification: "散在する起動前条件を副作用なしの単一admissionへ集約する"
removal_trigger: "後継schemaへ全consumerが移行しv1参照が0になった時"
entry_signals: [feature_addition]
parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md
pair_artifact: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
backprop_decision: not_required
backprop_decision_reason: "L5契約の起動前admissionだけを実装し、要求意味を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — exact schemaとfailure precedence" }
  - { role: qa, slot_label: "QA — negative oracleとmutation" }
  - { role: tl, slot_label: "TL — provider副作用との分離" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-001, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-002, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-003, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-004, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-005, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-006, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-007, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-008, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-009, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-010, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-011, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-012, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-013, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-014, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-015, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-016, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-017, test_path: tests/cursor-cloud-independent-execution.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, oracle_id: U-CCI-018, test_path: tests/cursor-cloud-independent-execution.test.ts }
dependencies:
  parent: docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md
  requires:
    - docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md
  references: ["issue:1293"]
  blocks: ["issue:1362"]
generates:
  - { artifact_path: docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/cursor-cloud-independent-execution.ts, artifact_type: source_module }
  - { artifact_path: tests/cursor-cloud-independent-execution.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude independent reviewer / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-13T13:28:40Z"
    tests_green_at: "2026-09-13T13:28:40Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: 255ab92e6c1d221d3e4eaf02e93d1ad0c1b44bde
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1789#issuecomment-5653593816"
    ci_evidence_generation: "run:34759455262:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1789:255ab92e6c1d221d3e4eaf02e93d1ad0c1b44bde:claude:run:34759455262:attempt:1:failure"
    receipt_digest: "sha256:e38d3063fdfa6cfb4348daf203a6b15faebe9c7216c2f5f4a5f0b8d1fee5c942"
    scope: "exact HEAD 255ab92e6の独立監査で内容blocker 0。Cursor L6/L7契約、U-CCI-001..018、#1293から#1362への依存、catalog pin、DB replay、PR scopeを確認した。reviewer clean worktreeで対象60 tests green。CI failureはreceipt転記前draftによるPOST_MERGE_PLANだけであり、本receiptはconfirmed化にのみ用い、merge admissionはsuccess世代で受け直す。先の散文レビュー誤帰属は本HEADで完全撤回済み。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/cursor-cloud-independent-execution.test.ts tests/l3-g3-freeze-packet-v2.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-09-13T13:28:40Z", evidence_path: tests/cursor-cloud-independent-execution.test.ts, output_digest: "sha256:e38d3063fdfa6cfb4348daf203a6b15faebe9c7216c2f5f4a5f0b8d1fee5c942", result: "reviewer clean worktreeで2 files / 60 tests green。receipt 5653593816。" }
---

# Cursor Cloud第三者実行admission

## §工程表 schedule

| Step | 作業 | 終端 |
|---|---|---|
| 1 | module missing Red | 実測済み |
| 2 | U-CCI-001..018のadmission lifecycleをGreen化 | 対象testがgreen |
| 3 | mutation／独立review | blocker 0 |

実cloud dispatch、credential、課金、副作用は本PLANに含めない。後続E2E義務を完了扱いにしない。
