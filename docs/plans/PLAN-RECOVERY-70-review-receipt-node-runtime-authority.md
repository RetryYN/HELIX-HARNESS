---
plan_id: PLAN-RECOVERY-70-review-receipt-node-runtime-authority
title: "PLAN-RECOVERY-70: review receipt生成をNode runtime authorityへ束縛する"
kind: recovery
layer: cross
drive: fullstack
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1216 PR #1140 Node22 review receiptとNode24 Ready CIのlogical DB digest drift recovery"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1216
behavior_contract_id: REVIEW-RECEIPT-NODE-AUTHORITY-001
responsibility_owner: review-receipt-runtime-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: close_gate_bypass
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "ADR-009とrequirements §8およびIssue #660がNode runtime authorityを既に所有する。本sliceはreview receipt write consumerの迂回を閉じ、要求意味を変更しない。"
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "doctorはNode範囲外を拒否するがpr-review-receiptが同じgateを通らず、Node22でNode24 CIと異なるDB receiptを封緘できる"
contract_postconditions: "review receipt commandがinput解析・slot・GitHub write・DB projectionより前にengines.node適合をhard gateし、範囲外runtimeで証拠を一切書かない"
contract_invariants: "既存Node range判定を再利用し、別semver authorityを作らない。過去のNode22 receiptをNode24 evidenceへ再解釈しない"
contract_failures: "宣言欠落、unsupported range、範囲外runtime、package read失敗を固有codeでwrite前に拒否する"
tdd_red_required: true
red_test: "U-NODEENG-006／007を先行し、Node22 hard reject APIとpr-review-receipt前置配線の欠落を固定する"
red_at: "2026-08-29T18:34:00+09:00"
green_at: "2026-08-29T18:37:18+09:00"
mutation_oracle_evidence: "2026-08-29T18:37:42+09:00にpr-review-receipt actionからassertNodeEngineRuntimeAuthority callを除去するmutationを実測し、U-NODEENG-007が1 failed／6 passed、exit 1でkillした。call復元後はU-NODEENG-001..007の7 testsとworker-wrapper design 5 testsがgreen。U-NODEENG-006はIssue #1216実測値v22.23.1を固有failureでthrowし、v24.15.0を受理する。"
complexity_effect: net_negative
complexity_justification: "review receipt固有のruntime推測を追加せず、既存#660判定をthrow境界として再利用してdoctor-only迂回を除去する"
removal_trigger: "全evidence write commandが共通transaction preconditionへ統合され、本個別consumer配線が不要になった時"
parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md
pair_artifact: docs/test-design/helix/L8-node-engine-runtime-gate-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-006, test_path: tests/node-engine-runtime.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-007, test_path: tests/node-engine-runtime.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-643-node-engine-runtime-gate.md
  requires:
    - docs/plans/PLAN-L7-643-node-engine-runtime-gate.md
  blocks: []
  references:
    - "issue:1216"
    - "issue:660"
    - "pr:1140"
agent_slots:
  - { role: aim, slot_label: "AIM — recovery scopeとForward再合流判定" }
  - { role: se, slot_label: "SE — review receipt transaction precondition" }
  - { role: qa, slot_label: "QA — Node22反例とwrite-before-check mutation" }
  - { role: tl, slot_label: "TL — ADR-009 runtime authority再利用境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-70-review-receipt-node-runtime-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: generated_json }
  - { artifact_path: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-node-engine-runtime-gate-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/doctor/node-engine-runtime.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/node-engine-runtime.test.ts, artifact_type: test_code }
---

# review receipt Node runtime authority recovery

PR #1140で、同一HEADのreview receiptをNode22、Ready CIをNode24で生成した結果、logical DB digestが
一致せずmerge admissionが停止した。本PLANはDB digestを緩めず、不正runtime側のreceipt writeを入口で拒否する。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | Node22反例とCLI配線oracleを追加 | [直列] | U-NODEENG-006／007 Red |
| 2 | 既存Node authority判定をhard gate化 | [直列] | Node22 reject／Node24 pass |
| 3 | pr-review-receiptのwrite前へ配線 | [直列] | 部分write path 0 |
| 4 | mutation、targeted、typecheck、CI | [直列] | 全green |
| 5 | Claude exact-HEAD reviewとPR #1140 recovery | [review] | blocker 0、Ready merge成立 |
