---
plan_id: PLAN-RECOVERY-1753-closure-probe-exact-head
title: "PLAN-RECOVERY-1753: closure evidence-probeをclean exact HEADへ固定する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1753
behavior_contract_id: CLOSURE-PROBE-EXACT-HEAD-001
responsibility_owner: closure-evidence-probe
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
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
red_at: "2026-09-12T00:24:15Z"
green_at: "2026-09-12T00:24:23Z"
mutation_oracle_evidence: "tests/closure-evidence-probe-context.test.ts::U-CLPROBE-003 killed the seeded branch-ref omission mutant (1 failed, exit 1); restored implementation passed 4/4 (exit 0)"
complexity_effect: net_negative
complexity_justification: "CLI内の暗黙process.cwd依存を単一typed admissionへ抽出し、既存probe実行経路へ一度だけ接続する"
removal_trigger: "全証拠commandが共通exact-HEAD execution brokerへ統合された時"
backprop_decision: not_required
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
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-11T23:57:15Z"
    tests_green_at: "2026-09-11T23:50:39Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: 50c76d37bc70719e25c150ddfc48ca631a6cece0
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1754#issuecomment-5641979996"
    ci_evidence_generation: "run:34659312795:attempt:1:failure"
    scope: "exact HEADの独立レビュー。CI redはdraft→confirmed循環のみで、他preflight、local 153 tests、plan lint、V-pair、catalog／digest追従を照合しblocker 0。symlink rootとorigin不在はfail-close境界として設計へ追記した。全shard successは次世代CIで別途要求する。"
    green_commands:
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-11T23:50:39Z"
        evidence_path: docs/plans/PLAN-RECOVERY-1753-closure-probe-exact-head.md
        output_digest: "sha256:6d8ed7691c1413dbdef450cb460e2e99b3d3be799ccf46fb77daf45896221547"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-11T23:57:15Z"
  review_binding:
    reviewer: "Claude Code / Fable 5.1"
    reviewed_at: "2026-09-11T23:57:15Z"
    evidence_digest: "sha256:44abf7e56b2421a6a62f8bf28be82127de09618009790b6683dfbf9828076904"
  entries: []
---

# clean exact HEADによるprobe実行

confirmed世代のCIで、`tdd_red_required`および`mutation_oracle_required`に対応するRed／Green時刻と
resolvable mutation oracle evidenceの未登録が検出された。本PLANはdraftへ戻し、証跡取得前の
再confirmを禁止する。

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
