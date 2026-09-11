---
plan_id: PLAN-RECOVERY-1753-closure-probe-exact-head
title: "PLAN-RECOVERY-1753: closure evidence-probeをclean exact HEADへ固定する"
kind: recovery
layer: L6
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1753
behavior_contract_id: CLOSURE-PROBE-EXACT-HEAD-001
responsibility_owner: closure-evidence-probe
engineering_discipline_required: true
change_slice: atomic
refactor_step: extract_helper
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: policy
entry_signals: [regression_dev]
contract_preconditions: "probe commandとrepository/worktree/remote identityをcommand起動前にreadできる"
contract_postconditions: "clean exact remote HEADだけがprobe commandを実行し、実行contextをrecordへ保存する"
contract_invariants: "dirty admission失敗はrecord/DB/failure evidenceを生成せず、foreign treeを変更しない"
contract_failures: "dirty、HEAD drift、別worktree、remote未到達、git identity不明をexit 2でfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
complexity_effect: net_negative
complexity_justification: "CLI内の暗黙process.cwd依存を単一typed admissionへ抽出し、既存probe実行経路へ一度だけ接続する"
removal_trigger: "全証拠commandが共通exact-HEAD execution brokerへ統合された時"
backprop_decision: required
backprop_decision_reason: "共有dirty rootでの誤実行をL6/L7 pairと管理Recoveryへ戻すため"
parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md
pair_artifact: docs/test-design/helix/closure-probe-exact-head-admission.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md, oracle_id: U-CLPROBE-001, test_path: tests/closure-evidence-probe-context.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md, oracle_id: U-CLPROBE-002, test_path: tests/closure-evidence-probe-context.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md, oracle_id: U-CLPROBE-003, test_path: tests/closure-evidence-probe-context.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md, oracle_id: U-CLPROBE-004, test_path: tests/closure-evidence-probe-context.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  parent: null
  requires: []
  references: ["issue:1753", "issue:1110"]
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — Git execution admissionとCLI結合" }
  - { role: qa, slot_label: "QA — dirty/HEAD/worktree/remote negative oracle" }
  - { role: aim, slot_label: "AIM — failure evidence非生成境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1753-closure-probe-exact-head.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/closure-probe-exact-head-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/closure-probe-exact-head-admission.md, artifact_type: test_design }
  - { artifact_path: src/runtime/closure-evidence-probe-context.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-evidence-probe-context.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/operation-scope.md, artifact_type: design_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# clean exact HEADによるprobe実行

## 実装順序

1. Git観測から純粋admission判定を分離し、4 negative oracleをRed→Greenにする。
2. `--execute`のDB rebuildとcommand起動より前へadmissionを接続する。
3. blocked時にrecordとfailure evidenceを生成しないCLI実証を行う。
4. commit/push済みclean worktreeでremote exactnessとrecord contextを実証する。
5. exact-HEAD独立reviewとCIを通し、Recoveryから正規Vモデルへ返す。

## 非対象

- closure承認、対象PLANの証拠補完、release/tag/cutover
- foreign rootのreset、削除、stash
- probe command自体の成功への書換え
