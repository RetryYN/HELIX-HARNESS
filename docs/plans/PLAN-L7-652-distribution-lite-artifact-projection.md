---
plan_id: PLAN-L7-652-distribution-lite-artifact-projection
title: "PLAN-L7-652 (impl): Lite capabilityをexact artifact setへ投影する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #856を先行再開しconsumer_core_v1を実artifactへ投影する"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 856
behavior_contract_id: DISTRIBUTION-LITE-ARTIFACT-PROJECTION-001
responsibility_owner: distribution-lite-artifact-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "DIST-LITE-FR-001とvalidated consumer_core_v1 profileが存在する"
contract_postconditions: "allowlist capabilityがsource tree上の決定的exact artifact setとdigestへ投影される"
contract_invariants: "Full HELIXを唯一のauthorityとし、Lite専用builder、推測fallback、development state混入を許さない"
contract_failures: "catalog、unknown／missing／excluded capability、duplicate／absolute／forbidden／missing source pathをtyped failureで拒否する"
tdd_red_required: true
red_test: "U-DISTART-002..004でfail-close境界の欠落を検出する"
red_at: null
green_at: null
mutation_oracle_evidence: null
complexity_effect: justified_positive
complexity_justification: "汎用builderの前段をpure typed projectionへ限定し、手編集path allowlistと暗黙prefix包含を除去する"
removal_trigger: "distribution profileとartifact catalogが同一Requirement IR generated projectionへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — capability／artifact ownershipとpure projection" }
  - { role: qa, slot_label: "QA — unknown／excluded／unsafe path negative oracle" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-001, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-002, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-003, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-004, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-006, test_path: tests/distribution-artifact-projection.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: src/setup/distribution-artifact-projection.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-artifact-projection.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:937
    - issue:938
  blocks:
    - issue:856-profile-bound-builder
review_evidence: []
---

# PLAN-L7-652: Lite capability artifact projection実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L6/L8 contractを固定 | pure input/outputとfail-close境界が反証可能になる |
| 2 | projection coreをTDD実装 | U-DISTART-001..004がgreenになる |
| 3 | current profile artifact catalogへ接続 | 11 allowlist／10 exclusionのexact setがsource treeへ解決する |
| 4 | PLAN lint、typecheck、targeted test、独立review | blocker 0、candidate exact HEADが一致する |

## 非対象

archive builder、consumer canary、Windows smoke、tag、publish、promotion、DevOS cutoverは後続原子PRへ分離する。
