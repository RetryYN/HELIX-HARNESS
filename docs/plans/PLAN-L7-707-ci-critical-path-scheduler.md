---
plan_id: PLAN-L7-707-ci-critical-path-scheduler
title: "PLAN-L7-707: required obligationを保存するCI critical-path scheduler"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1207
behavior_contract_id: CI-CRITICAL-PATH-SCHEDULER-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1207 duration-aware critical-path schedulerとartifact reuse"
contract_preconditions: "#1204のtyped telemetryと#1206のimmutable Verification Planがcandidate HEADへexactに束縛される"
contract_postconditions: "required obligation exact setを変えず、runner互換性・resource・lease・artifact localityからbounded execution DAGを決定的に生成する"
contract_invariants: "schedulerはobligationを追加削除せず、配置・並列度・artifact reuseだけを決定し、unknown/stale telemetryでは安全な既定DAGへfallbackする"
contract_failures: "wrong expected HEAD／platform／lockfile／toolchain artifact、resource conflict、lease/fence欠落、runner/resource/timeout非互換、quota超過を個別fail-closeする"
tdd_red_required: true
red_at: "2026-08-30T12:55:50+09:00"
green_at: "2026-08-30T12:59:45+09:00"
tdd_red_evidence: "2026-08-30T12:55:50+09:00 tests/ci-critical-path-scheduler.test.ts initial red: ci-critical-path-scheduler module不在"
tdd_green_evidence: "2026-08-30T12:59:45+09:00 tests/ci-critical-path-scheduler.test.ts 8 tests green、typecheck green"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/ci-critical-path-scheduler.test.ts U-CISCHED-002〜010でclass/resource barrier、valid-shaped wrong HEAD、artifact identity各dimension、exclusive resource、telemetry、quota、runner/resource/timeout、backpressure、phase逆依存を個別mutationしredになる"
complexity_effect: net_negative
complexity_justification: "workflow内へ散在するjob配置とsetup重複判断をtyped schedulerへ収束する"
removal_trigger: "後継System Synthesis schedulerへ全consumerとrollback traceが移行した時"
parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md
pair_artifact: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L7-704-ci-execution-telemetry.md
    - docs/plans/PLAN-L7-706-ci-verification-plan.md
  references:
    - "issue:1207"
    - "issue:1204"
    - "issue:1206"
  blocks:
    - "issue:1208"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-001, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-002, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-003, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-004, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-005, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-006, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-007, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-008, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-009, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-010, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-011, test_path: tests/ci-critical-path-scheduler.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, oracle_id: U-CISCHED-012, test_path: tests/ci-critical-path-scheduler.test.ts }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/left-arm-carry-log.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
generates:
  - { artifact_path: docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-critical-path-scheduler.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-critical-path-scheduler.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — obligation-preserving placement contract" }
  - { role: qa, slot_label: "QA — wrong artifact／resource／stale telemetry mutation" }
  - { role: tl, slot_label: "TL — critical pathと安全fallback境界" }
---

# CI critical-path scheduler実装

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | Verification Planとtelemetryの入力境界をfreeze | 直列 | required obligation不変条件をL6/L8へ固定 |
| 2 | placement／resource／artifact reuse／fallbackを実装 | 直列 | targeted mutation oracle green |
| 3 | baseline比較、独立review、CI、Reverse fullback | 直列 | wall-clock／runner-minute／feedback latencyをread-after |

本PLANは#1204と#1206のstack上で実装し、両依存がcanonical mergeするまでReady化しない。
