---
plan_id: PLAN-L7-685-full-regression-shard-jobs
title: "PLAN-L7-685 (impl): Full regression shard jobsとfinalize aggregate"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1071 Full regression shard jobsとfinalize aggregate"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1071
behavior_contract_id: FULL-REGRESSION-SHARD-JOBS-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
backprop_decision: not_required
backprop_decision_reason: "既存GH-NFR-010／GH-AC-017とL6設計を変更せず、確定済みpartition contractをGitHub Actionsへ配線するL7 sliceである"
contract_preconditions: "#1070のtyped partition／receipt contract、Impact CI full decision、candidate HEAD／base SHAが存在する"
contract_postconditions: "preflight、bulk-1、bulk-2、stateful、finalizeが独立jobとなり、全receiptのexact validation後だけDB／Biome／doctor／full receiptへ進む"
contract_invariants: "tracked test inventory exact union、same HEAD／base、required harness-check、main／nightly／RC full、targeted selection、same-HEAD reuseを維持する"
contract_failures: "missing／duplicate／wrong identity／nonzero／cancel／timeout／artifact欠落を相殺せずfail-closeする"
tdd_red_required: true
red_test: "U-FULLSHARD-CLI-001..004とU-FULLSHARD-WF-001..006がadapter／job／receipt／aggregate欠落を検出する"
complexity_effect: justified_positive
complexity_justification: "同一runner内process管理を削除し、typed plan／receiptを介する独立job DAGへ置換してcritical pathを短縮する"
removal_trigger: "GitHub native matrixが同じtyped partition／receipt／finalize contractを直接表現でき、custom adapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-001, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-002, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-003, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-004, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-002, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-685-full-regression-shard-jobs.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli/full-regression-shards.ts, artifact_type: source_module }
  - { artifact_path: tests/full-regression-shards-cli.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-684-full-regression-shard-contract.md
  references:
    - issue:1069
    - issue:1071
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — workflow DAG／artifact handoff／finalize" }
  - { role: qa, slot_label: "QA — wrong HEAD／receipt欠落／cancel／timeout mutation" }
  - { role: tl, slot_label: "TL — required check／reuse／post-test gate非縮退" }
---

# PLAN-L7-685: Full regression shard jobsとfinalize aggregate

## 工程表

| Step | 作業 | 完了条件 |
|---:|---|---|
| 1 | pure contractをCLI adapterへ接続 | plan／files／receipt／validateがtyped JSONとexit codeを返す |
| 2 | preflightでinventoryとpartitionをseal | candidate HEAD／base／partition artifactが一意 |
| 3 | bulk-1／bulk-2／statefulを独立job化 | exact file set、同一Node install、job overlap成立 |
| 4 | finalizeでreceipt exact setを再検証 | 欠落、重複、wrong identity、nonzeroを拒否 |
| 5 | DB／Biome／doctor／full receiptを後段化 | 全shard green後だけ実行 |
| 6 | Actions read-after | wall-clock、overlap、required check、reuse非縮退を確認 |

## 非対象

test削除、timeout緩和、`continue-on-error`、targetedをFull代替にする変更、release／publishは含めない。
