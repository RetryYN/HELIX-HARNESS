---
plan_id: PLAN-L7-653-distribution-lite-dependency-closure
title: "PLAN-L7-653 (impl): Lite consumer entrypointをdependency-closed exact setへ分離する"
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
  - "po_directive:Lite tarballをclean consumerで実利用可能にする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 941
behavior_contract_id: DISTRIBUTION-LITE-DEPENDENCY-CLOSURE-001
responsibility_owner: distribution-lite-dependency-closure
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "DIST-LITE-R-02/R-04、consumer_core_v1 profile、capability artifact projectionが存在する"
contract_postconditions: "consumer entrypointからのstatic/dynamic dependencyとowned asset exact setがmissing 0になる"
contract_invariants: "Full HELIX唯一正本、Lite fork 0、全src fallback 0、excluded capability到達0"
contract_failures: "entrypoint欠落、relative import ownership欠落、dynamic asset未登録、excluded capability到達をtyped redにする"
tdd_red_required: true
red_test: "U-DISTCLOSE-004でcurrent src/cli.tsから267 missingを実測"
red_at: 2026-08-22T23:49:00+09:00
green_at: null
mutation_oracle_evidence: null
complexity_effect: justified_positive
complexity_justification: "monolithic Full CLIをarchiveへ混入させずconsumer-safe compositionを再利用可能な境界へ分離する"
removal_trigger: "Full／consumer command registryが単一generated capability graphへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — consumer command registry／doctor composition" }
  - { role: qa, slot_label: "QA — import closure／excluded reachability mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-dependency-closure-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-001, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-002, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-003, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-005, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-006, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-007, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-008, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-009, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-010, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-011, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-012, test_path: tests/distribution-consumer-node-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-013, test_path: tests/distribution-consumer-node-adapter.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-dependency-closure-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/setup/distribution-dependency-closure.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-command-registry.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-command-composition.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-node-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-dependency-closure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-command-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-command-composition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-node-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:937
    - issue:938
  blocks:
    - issue:856-profile-bound-builder
review_evidence: []
---

# PLAN-L7-653: Lite consumer dependency closure

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | AST dependency closureをRed→Green | fixtureでstatic／dynamic exact ownershipを反証可能にする |
| 2 | consumer-safe entrypoint／doctor compositionを分離 | Full monolithをLite artifactから除外する |
| 3 | current profileへ接続 | missing 0、excluded reachability 0 |
| 4 | clean staged build smoke | help／setup／status／consumer doctorが起動する |
| 5 | Claude exact-HEAD review | blocker 0 |

## 現在のRed evidence

44 artifact、visited 12、missing 267。主因は`src/cli.ts`／`src/doctor/index.ts`のFull機能集約であり、
全`src/`包含ではなくconsumer composition分離で解消する。

## 非対象

archive生成、publish、tag、promotion、DevOS cutoverは実行しない。
