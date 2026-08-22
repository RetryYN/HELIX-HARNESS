---
plan_id: PLAN-L7-580-workflow-classification-catalog-doctor
title: "PLAN-L7-580 (refactor): catalog doctorをtyped requirements projection正本へ移行する"
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
  target_id: REFACTOR
entry_signals: ["po_directive:Issue #742 requirements-owned catalog doctor migration"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 742
behavior_contract_id: WORKFLOW-CLASSIFICATION-CATALOG-DOCTOR-001
responsibility_owner: workflow-classification-catalog-doctor
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "drive-route-catalog doctorが旧15-route／model／signal意味をcurrent authorityとして判定できる"
contract_postconditions: "requirements由来typed catalogだけがcurrent意味を検査し、旧catalogはfrozen compatibility inventoryとして構造だけを検査する"
contract_invariants: "requirements registryが唯一の意味authorityであり、legacy側greenでcurrent側failureを相殺しない"
contract_failures: "typed catalog version／digest／identity／parent／signal driftとlegacy bytes／schema／参照／graph driftを別findingでfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存doctor gateをcurrent／compatibilityへ分割する原子的Reverse是正であり、未記録Red timestampを捏造しない。current gate相殺禁止をmutationで実測する"
mutation_oracle_evidence: "2026-08-16T06:25:43Zにdoctor admissionのANDをORへ一時mutationし、U-WFCATL-004が1 failed／3 passed、exit 1となってcompatibility greenによるcurrent failure相殺をkillした。即時復元後にtargeted greenを再確認する"
complexity_effect: net_negative
complexity_justification: "旧mode schema／signal map／15-route exact set依存を削除し、typed generated projection検査へ一本化する"
removal_trigger: "legacy drive-route inventory consumerが0になった時点でcompatibility loaderとfrozen inventoryを削除する"
backprop_decision: not_required
backprop_decision_reason: "requirementsのcatalog path二重roleは先行PLAN-L3-60でv1.3.11へ是正済みであり、本sliceはその確定済み意味をdoctorへ投影するReverse実装だけを行う"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-WFCATL-001, test_path: tests/workflow-classification-catalog-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-WFCATL-002, test_path: tests/workflow-classification-catalog-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-WFCATL-003, test_path: tests/workflow-classification-catalog-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-WFCATL-004, test_path: tests/workflow-classification-catalog-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-014, test_path: tests/drive-route-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed authority／legacy compatibility境界" }
  - { role: qa, slot_label: "QA — catalog drift／相殺禁止反例" }
  - { role: tl, slot_label: "TL — requirements唯一正本と後続consumer境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T07:09:58Z"
    tests_green_at: "2026-08-16T07:09:58Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #742のcatalog doctor authority deltaを独立reviewした。初回blocker 2件／high 1件／medium 1件に加え、requirements path二重roleのHighとL6／L8 PLAN ownershipのMediumを検出した。先行PLAN-L3-60でrequirements v1.3.11を確定し、registry 1.1.4、current fixture、requires、ownershipを追従後に再確認した。実checkDriveRouteCatalogを通る非相殺oracle、typed current authority、legacy frozen compatibility境界を確認し、最終blocker／high／medium 0。Claude exact-HEAD reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run --project fast tests/workflow-classification-catalog-lint.test.ts tests/drive-route-catalog.test.ts tests/workflow-classification-registry.test.ts tests/workflow-classification-catalog.test.ts tests/workflow-execution-policy-registry.test.ts tests/workflow-execution-policy-projection.test.ts tests/github-execution-episode-state.test.ts tests/github-execution-episode-location.test.ts tests/github-execution-episode-right-arm.test.ts tests/digest.test.ts tests/design-language.test.ts tests/ddd-tdd-rules.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/fe-roster-orchestration.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T07:09:58Z"
        evidence_path: tests/workflow-classification-catalog-lint.test.ts
        output_digest: "sha256:5dd06a84d2442dcf598f842785ce00b591809afaa990ea99d7b6f12c2494d739"
        result: "14 files／149 tests green。別実行でtypecheck、slow projection-writer 37 tests、PLAN lint green。独立review最終blocker／high／medium 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T07:09:58Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T07:09:58Z"
    evidence_digest: "sha256:ebdf76c397361b5c36d237b9d198faa566d5145e3ff9218fc75fc43e782e9f33"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
  - { artifact_path: config/drive-route-catalog.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: src/lint/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-catalog-lint.test.ts, artifact_type: test_code }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
  requires:
    - docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md
    - docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md
  references:
    - docs/plans/PLAN-L3-55-workflow-classification-registry.md
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  blocks: []
---

# typed workflow分類catalog doctor

## 工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | 旧catalog意味判定を棚卸し | 直列 | old mode／signal／15-route exact set依存を列挙 |
| 2 | requirements generated catalog lintを追加 | 直列 | version／digest／typed relation oracle green |
| 3 | 旧catalogをfrozen compatibility inventoryへ降格 | 並列 | bytes／schema／graphだけを検査 |
| 4 | doctorへ両gateを非相殺で接続 | 直列 | current failureをlegacy greenで相殺しない |
| 5 | 独立review・CI・Reverse read-after | review | blocker 0、canonical merge |

## Scope境界

本sliceはcatalog doctor authorityだけを所有する。branch-kind、skill recommendation、runtime export、
DB `route_modes`、README／process文書の移行は後続の原子的sliceへ分離する。
