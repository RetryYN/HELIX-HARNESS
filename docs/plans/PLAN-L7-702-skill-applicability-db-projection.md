---
plan_id: PLAN-L7-702-skill-applicability-db-projection
title: "PLAN-L7-702 (refactor): typed skill applicability DB projection"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #248 typed applicabilityをnormalized DB projectionへ接続する"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 248
behavior_contract_id: SKILL-APPLICABILITY-DB-PROJECTION-001
responsibility_owner: typed-skill-db-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "confirmed L3/L5 authorityを変更せず、DB consumerを既定のtyped pair＋polarity projectionへ移す。"
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L7-678のrequirements-owned registry loaderとtyped value objectがcurrent mainに存在する"
contract_postconditions: "typed metadataだけがregistry version／digest付きの正規化行へexact replace投影され、legacy-only metadataへの変更時は旧current行を残さない"
contract_invariants: "target_axis／target_id／polarityをCSVまたは単一model fieldへ畳み込まず、registry bindingを各行で再現できる"
contract_failures: "unknown pair、axis mismatch、極性衝突、空positive、legacy-only metadataのcurrent投影をfail-closeする"
tdd_red_required: true
red_at: "2026-08-29T17:28:53+09:00"
green_at: "2026-08-29T17:29:52+09:00"
mutation_oracle_evidence: "2026-08-29T17:31:36+09:00にexcluded行のpolarityをapplicableへ弱め、tests/asset-catalog.test.tsが1 failed／1 passedでkillした。自主再監査でincremental catalog時のstale row残存を検出し、legacy-only metadataへ変更する反例とasset単位のexact replaceを追加した。2026-08-29T18:15:01+09:00にDELETEを除去するmutationが旧2行残存を1 failed／1 passedでkillし、復元後にtargeted testsとtypecheckを再実行した。"
complexity_effect: net_negative
complexity_justification: "旧model CSVを増築せず、既存typed value objectから単一のnormalized projectionを生成する。"
removal_trigger: "automation_assetsのlegacy applies_drive_models列と全consumerがretireされた時"
parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-005, test_path: tests/asset-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — normalized tableとprojection writer" }
  - { role: qa, slot_label: "QA — legacy-only非昇格と極性mutation" }
  - { role: tl, slot_label: "TL — registry bindingと原子scope" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-702-skill-applicability-db-projection.md, artifact_type: markdown_doc }
  - { artifact_path: src/assets/skill-applicability-projection.ts, artifact_type: source_module }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L5-detail/development-model-runtime-routing.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/assets/catalog.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/skill-applicability-registry.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/asset-catalog.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
  requires: [docs/plans/PLAN-L7-678-skill-applicability-value-object.md]
  blocks: [issue:322, issue:243]
---

# typed skill applicability DB projection実装

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | normalized tableを追加 | pair、polarity、registry bindingを行単位で保持 |
| 2 | catalog／deterministic rebuildを接続 | 同じhelperから同じ行集合を生成 |
| 3 | legacy-only非昇格oracle | 旧`drive_models`だけのskillはcurrent tableへ0行 |
| 4 | mutation、targeted test、typecheck | polarity／非昇格mutation killとgreen |

本sliceはrecommendation、current-location、CLI、metadata backfillを完了主張しない。
