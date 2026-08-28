---
plan_id: PLAN-L7-678-skill-applicability-value-object
title: "PLAN-L7-678 (refactor): typed skill applicability value object"
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
  target_id: REDESIGN
entry_signals:
  - "po_directive:新要求から旧4軸固定skill applicabilityを一新する"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 248
behavior_contract_id: SKILL-APPLICABILITY-VALUE-OBJECT-001
responsibility_owner: typed-skill-applicability-runtime
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "#1044のrequirements-owned skill applicability registryとL3承認provenanceがcurrent mainに存在する"
contract_postconditions: "typed pair、極性、registry digest、legacy input-only変換をruntime value objectがfail-closeで検証する"
contract_invariants: "workflow identityを複製せず、4軸固定fieldやlegacy model tokenをcurrent outputにしない"
contract_failures: "unknown identity、axis mismatch、duplicate、polarity conflict、implicit default、legacy ambiguityを個別拒否する"
tdd_red_required: true
red_at: "2026-08-26T04:28:02+09:00"
green_at: "2026-08-26T04:28:35+09:00"
mutation_oracle_evidence: "2026-08-26T04:29:03+09:00にpositive／negative polarity conflict拒否を除去し、tests/skill-applicability-registry.test.tsのrejects polarity conflictが1 failed・8 passedとなることを実測した。追加したloader oracleではrequirements digest、workflow digest、workflow versionの各照合を個別に検証し、各throwを除去したmutationが失敗することを確認する。"
complexity_effect: net_negative
complexity_justification: "旧4軸別enum／field案をregistry参照の同型pairへ統合し、意味軸自体はclassification registryに一元化する"
removal_trigger: "skill applicabilityがworkflow classification registryの次期major schemaへ統合された時"
parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-001, test_path: tests/skill-applicability-registry.test.ts }
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-002, test_path: tests/skill-applicability-registry.test.ts }
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-003, test_path: tests/skill-applicability-registry.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — registry loaderとtyped value object" }
  - { role: qa, slot_label: "QA — axis／polarity／legacy mutation" }
  - { role: tl, slot_label: "TL — requirementsとruntimeの境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-678-skill-applicability-value-object.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/skill-applicability-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/skill-applicability-registry.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L5-detail/development-model-runtime-routing.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/development-model-runtime-routing-design.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
  requires:
    - docs/plans/PLAN-L3-67-skill-applicability-authority.md
  blocks: [issue:322, issue:243]
---

# typed skill applicability value object実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 旧4軸固定設計とruntime surfaceを棚卸し | typed pairへ置換する境界が固定される |
| 2 | registry loaderとvalue objectを実装 | authority／classification digest、axis、極性をfail-close |
| 3 | legacy input-only adapterを実装 | 一意tokenだけ変換し、Forward／Scrumを拒否 |
| 4 | mutation、targeted test、typecheck | polarity mutation kill、全targeted green |

本sliceはDB、recommendation、CLIの移行を完了主張しない。後続の#248原子sliceで同じvalue objectを利用する。
