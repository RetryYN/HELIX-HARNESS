---
plan_id: PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation
title: "PLAN-L7-579 (refactor): PLAN entry routingの旧mode入力をexact inventoryへ隔離する"
kind: refactor
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals: ["po_directive:Issue #740 requirements-owned PLAN identity migration"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 740
behavior_contract_id: TPW-LEGACY-ISOLATION-001
responsibility_owner: plan-entry-routing
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "typed PLANはcurrent registryへ束縛済みだが、inventory外の新規非typed PLANも旧route_mode／prefix／kind推測経路へ入れる"
contract_postconditions: "新規PLANはtyped identity必須、既存951件だけがexact inventory内のcompatibility inputとして読める"
contract_invariants: "requirements registryが意味authorityであり、legacy inventoryは増加せず、既存violation baselineと混同しない"
contract_failures: "inventory外非typed PLAN、schema／scope／sort／duplicate／digest drift、951件超過を別reasonでfail-closeする"
tdd_red_required: true
tdd_red_waiver_reason: null
red_at: "2026-08-16T05:41:21Z"
green_at: "2026-08-16T05:41:38Z"
mutation_oracle_evidence: "2026-08-16T05:41:21Zにinventory外拒否条件を一時無効化し、tests/plan-entry-routing.test.tsのU-TPWLEG-001が1 failed／26 skipped、exit 1となるkillを実測した。条件復元後にtargeted全件greenを再確認した"
complexity_effect: justified_positive
complexity_justification: "current判定と旧mode判定をmodule分離し、951件の互換集合を一つのdigest付きvalue objectへ集約する"
removal_trigger: "active legacy PLANが0件になった時点でinventoryとcompatibility moduleを削除する"
backprop_decision: not_required
backprop_decision_reason: "#204／#205と既存L6 typed PLAN identity契約を実装するReverse是正であり、L3 requirementsの意味追加はない"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLEG-001, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLEG-002, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLEG-003, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLEG-004, test_path: tests/plan-entry-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — current／legacy module boundary" }
  - { role: qa, slot_label: "QA — inventory growth／drift negative oracle" }
  - { role: tl, slot_label: "TL — requirements authority／compatibility境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T05:55:40Z"
    tests_green_at: "2026-08-16T05:55:23Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #740のPLAN legacy identity隔離deltaを独立reviewした。初回blocker 1件／high 3件、再review high 2件を是正し、identity admissionのbaseline非相殺、missing／invalid inventory再生成禁止、frozen 951集合digest、strict entry schema、inventory外／typed PLANの旧resolver呼出0、active legacy subsetを確認した。最終blocker／high／medium 0。current exact-HEAD freshnessはPRのClaude Code sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npm run typecheck && npx --no-install vitest run --project fast tests/plan-entry-routing.test.ts tests/plan-lint.test.ts tests/frontmatter.test.ts tests/workflow-classification-legacy-adapter.test.ts tests/workflow-classification-registry.test.ts tests/design-language.test.ts tests/ddd-tdd-rules.test.ts tests/digest.test.ts && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T05:55:23Z"
        evidence_path: tests/plan-entry-routing.test.ts
        output_digest: "sha256:3aae1b71d3b215cf0dd3308512594f6f85784d5df4c61adc347bc29838ff0d01"
        result: "typecheck green、8 files／165 tests green、対象PLAN lint全gate green、最終review blocker／high／medium 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T05:55:40Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T05:55:40Z"
    evidence_digest: "sha256:b92ffcd8931e37fca45ffd625194db1d4e9300d8cac7dcdb43fda15c08c9f66c"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/plan-entry-routing.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/plan-legacy-workflow-identity-inventory.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-entry-routing-legacy-input.ts, artifact_type: source_module }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/plan-entry-routing-input.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  references:
    - docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md
  blocks: []
---

# PLAN entry legacy workflow identity隔離

## 工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | current mainの非typed PLANを機械棚卸し | 直列 | exact 951件とdigestを固定 |
| 2 | inventory外／drift／growthの反例追加 | 直列 | U-TPWLEG-001..004 red→green |
| 3 | 旧mode依存をcompatibility moduleへ移動 | 直列 | current moduleの旧schema直import 0 |
| 4 | lint／doctor／CLI generatorを接続 | 並列 | repository-level gate green |
| 5 | 独立review・CI・Reverse read-after | review | blocker 0、canonical merge |

## Scope境界

本sliceはPLAN entry identity admissionだけを所有する。catalog lint、skill recommendation、runtime export、
DB `route_modes`、README／process文書は後続の原子的sliceへ分離する。
