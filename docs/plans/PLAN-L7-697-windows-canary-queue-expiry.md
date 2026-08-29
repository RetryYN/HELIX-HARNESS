---
plan_id: PLAN-L7-697-windows-canary-queue-expiry
title: "PLAN-L7-697 (impl): Windows canary bounded queue／expiryを実装する"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1135 Windows Lite canary bounded queue／backpressure／expiry"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1135
behavior_contract_id: WINDOWS-LITE-CANARY-QUEUE-EXPIRY-001
responsibility_owner: windows-lite-canary-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "#1134のpolicy／lease bindingがexact validatorとして成立している"
contract_postconditions: "active／waiting bound、決定的queue、lease expiry／heartbeat／fence、completion bindingがpure evaluatorで判定される"
contract_invariants: "既存scheduler／WorkGraph lease authorityを再利用し、drop／無制限待機／暗黙skip／後段success相殺を許さない"
contract_failures: "invalid policy、unknown state、duplicate、backpressure、expired heartbeat、stale fence／owner、wrong HEAD／artifact／profile／attemptを個別fail-closeする"
tdd_red_required: true
red_test: "U-WLCA-002〜010／015を先行追加し、evaluator不在で5 tests Redを確認する"
red_at: "2026-08-28T16:44:35+09:00"
green_at: "2026-08-28T16:46:54+09:00"
mutation_oracle_evidence: "tests/windows-lite-canary-admission.test.tsで2026-08-28T16:48:13+09:00にwaiting.length>=max_waitingを>へ変異し、U-WLCA-002〜004が1 failed／8 passed（exit 1）として満杯queueへの誤追加をkillした。2026-08-28T19:39:00+09:00にobservedAt<issuedAt guardを無効化するとU-WLCA-006が1 failed／15 passedでfailure分類退行をkillし、19:39:12+09:00にheartbeatAt<issuedAt guardを無効化すると同oracleが発行前heartbeatの成功化を1 failed／15 passedでkillした。全mutantを復元後に同suiteをgreenへ戻した。"
complexity_effect: justified_positive
complexity_justification: "Windows固有snapshot照合を副作用なしkernelへ閉じ、Actions adapterが独自queue／lease判定を持つことを防ぐ"
removal_trigger: "Windows heavy laneが汎用host-global admission evaluatorへ型互換のまま統合された時"
parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
pair_artifact: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-002, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-003, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-004, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-006, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-007, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-008, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-010, test_path: tests/windows-lite-canary-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-015, test_path: tests/windows-lite-canary-admission.test.ts }
dependencies:
  parent: PLAN-L3-70-windows-lite-canary-admission
  requires:
    - docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
    - docs/plans/PLAN-L7-696-windows-canary-policy-lease.md
  blocks: []
  references:
    - "issue:1135"
    - "issue:1106"
    - docs/plans/PLAN-REVERSE-697-windows-canary-queue-expiry.md
agent_slots:
  - { role: se, slot_label: "SE — bounded queue／lease expiry pure evaluator" }
  - { role: qa, slot_label: "QA — duplicate／capacity／heartbeat／binding mutation" }
  - { role: tl, slot_label: "TL — scheduler authority reuseとActions adapter境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-697-windows-canary-queue-expiry.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/windows-lite-canary-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/windows-lite-canary-admission.test.ts, artifact_type: test_code }
---

# Windows canary bounded queue／expiry実装

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | U-WLCA-002〜010／015をRed固定 | evaluator不在を5 testsで反証する |
| 2 | queue／lease／completion evaluatorを実装 | pure、決定的、failure precedenceが成立する |
| 3 | boundary mutationを実行 | capacityまたはexpiry退行をoracleがkillする |
| 4 | 全gate／独立review | current HEAD blocker 0、main read-afterまで成立する |

Actions workflow配線、external queue、measurement percentile、実runner canaryは#1136以降へ分離する。
