---
plan_id: PLAN-L7-704-ci-execution-telemetry
title: "PLAN-L7-704: CI execution telemetryと証明責務baselineを実装する"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
entry_signals:
  - "po_directive:Issue #1204 CI実行をcost nodeと証明責務へ束縛し、CI改革の実測基盤を作る"
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1204
engineering_discipline_required: true
behavior_contract_id: CI-EXECUTION-TELEMETRY-001
responsibility_owner: ci-execution-telemetry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存Impact CIの選定とfull-regression shardを置換せず、実行事実を後段で観測する境界を追加する。"
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L3-73のCI System Synthesis、Impact CI、full-regression shard、canonical digest authorityが存在する"
contract_postconditions: "job／step／test／setup／artifact_transfer eventのstrict validatorとrun/attempt projectionが、runner identityとartifact edgeを含めて再利用可能になる"
contract_invariants: "required verificationを変更せず、raw log／secretを保持せず、rerun successで過去failureを消さず、profile／surface／runner／environment／cache／resourceを混在させず、標本なしを0msまたは検出率100%と解釈させず、artifact input/output/lockfile digestの不整合を許容しない"
contract_failures: "wrong HEAD、unknown runner、batch内のNode/cache/resource drift、invalid time、sensitive field、duplicate node、missing/cyclic dependency、依存時間逆転、artifact field欠落・edge・lockfile/digest drift、非failure detector、digest driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存Impact CIの選定変更ではなく、純粋なtelemetry schema／validator／projectionを追加する。"
green_at: 2026-08-30T10:40:45+09:00
mutation_oracle_evidence: "独立内部レビューでartifact field欠落時例外、lockfile未束縛、batch内cache/resource drift、failure 0件を検出率1とする反例をblockerとして検出した。artifact欠落をtyped failureへ変換し、lockfile digest edge、cache hit／CPU／memory batch bindingとseries軸、failureなしratio=nullを追加した。2026-08-30T10:40:45+09:00に全反例を含むtargeted 1 file／10 tests、typecheck、Biome、PLAN lintがgreen。"
complexity_effect: justified_positive
complexity_justification: "既存selection／shard責務を再実装せず、後続のCI局所最適とcritical-path統制へ共通の観測境界を一つ追加する。"
removal_trigger: "後継CI telemetry schemaが全consumerを移行し、本schemaのevent／projectionが0件になった時。"
parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md
pair_artifact: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-001, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-002, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-003, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-004, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-005, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-006, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-007, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-008, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-009, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-010, test_path: tests/ci-execution-telemetry.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed event、canonical digest、既存Impact CIとの責務境界" }
  - { role: qa, slot_label: "QA — time／runner／secret／DAG／percentile反例" }
  - { role: tl, slot_label: "TL — required obligation非縮退とrerun failure保持" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-704-ci-execution-telemetry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-execution-telemetry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-execution-telemetry.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-execution-telemetry.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/design/helix/L6-function-design/impact-ci-recovery.md
    - src/runtime/full-regression-shards.ts
  blocks:
    - issue:1205
references:
  - issue:1034
  - issue:1205
  - issue:1206
  - issue:1207
  - issue:1208
  - issue:1002
  - issue:1084
---

# CI execution telemetryと証明責務baseline

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | 既存Impact CI、shard、digest authorityとの境界を確定 | [直列] | 重複writer／責務横取りが0 |
| 2 | typed event、strict validator、digest再計算を実装 | [直列] | U-TELE-001〜008がgreen |
| 3 | run/attempt projection、critical path、setup重複、percentileを実装 | [直列] | U-TELE-009〜010がgreen |
| 4 | targeted、typecheck、Biome、PLAN lintを実行 | [直列] | current HEADの実測証拠が残る |
| 5 | Claude exact-HEAD reviewとmain read-after | [review] | 後続#1205を解放できる |

## 受入境界

- 本sliceは実行事実のpure contractであり、CI選定、scheduler、workflow、DB ingestionを変更しない。
- wrong HEAD、未知runner、時刻逆転、secret-like field、依存DAG破壊、digest driftはsuccessへ縮退しない。
- cancelled／supersededをperformance母集団から除外しても、件数と元failureはprojectionへ保持する。
- p50/p95/p99はprofile、surface、environment、cache classを分離し、異なるseriesを合算しない。
- telemetryから要求／Issue／PLAN authorityへの直接writeはなく、後続UIL-02／#1205が観測入力を再取得する。
