---
plan_id: PLAN-L7-678-skill-applicability-authoring
title: "PLAN-L7-678 (redesign): typed skill applicability authoring"
kind: redesign
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:typed skill applicabilityをauthoring surfaceへ接続する"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 248
behavior_contract_id: SKILL-APPLICABILITY-AUTHORING-001
responsibility_owner: typed-skill-authoring
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_consumer
legacy_retirement_state: compatibility_input_only
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "PLAN-L7-677のtyped value objectとrequirements-owned registryがcandidate branchに存在する"
contract_postconditions: "current assignment／scaffold／CLIがtyped identityだけを生成し、既存legacy skillをcompatibility-onlyへ隔離する"
contract_invariants: "L1-L12とclassification exact pairを正本とし、legacy drive modelをcurrent metadataへ再出力しない"
contract_failures: "unknown pair、axis mismatch、極性衝突、current／legacy混在、L0／L13／L14、曖昧legacy入力を個別拒否する"
tdd_red_required: true
red_at: "2026-08-26T04:48:30+09:00"
green_at: "2026-08-26T04:51:49+09:00"
mutation_oracle_evidence: "2026-08-26T04:54:10+09:00にcurrent／legacy field混在拒否を除去し、tests/skill-assignment.test.tsが1 failed・4 passedとなることを実測した。復元後はauthoring関連5 suite 40 testsとtypecheckをgreen化する。"
complexity_effect: net_negative
complexity_justification: "旧drive_models生成をtyped pairの単一authoring経路へ置換し、既存61 skillは#322までcompatibility-onlyとして明示する"
removal_trigger: "#322で全skillがtyped metadataへbackfillされcompatibility inventoryが0件になった時"
parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-004, test_path: tests/skill-scaffold.test.ts }
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-009, test_path: tests/skill-assignment.test.ts }
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-010, test_path: tests/skill-scaffold-cli.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — assignment／scaffold／CLI接合" }
  - { role: qa, slot_label: "QA — legacy混在と曖昧入力mutation" }
  - { role: tl, slot_label: "TL — current／compatibility境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-678-skill-applicability-authoring.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L5-detail/development-model-runtime-routing.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/skill-assignment.ts, artifact_type: source_module }
  - { artifact_path: src/schema/skill-applicability-registry.ts, artifact_type: source_module }
  - { artifact_path: src/skill-engine/scaffold.ts, artifact_type: source_module }
  - { artifact_path: tests/skill-assignment.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-quality.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-scaffold-cli.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-scaffold.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
  requires: [docs/plans/PLAN-L7-677-skill-applicability-value-object.md]
  blocks: [issue:322, issue:243]
---

# typed skill applicability authoring実装

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | assignmentをcurrent／compatibilityへ分離 | currentはtyped pair、legacyは隔離件数として可視化 |
| 2 | scaffold／CLIをtyped入力へ移行 | current outputに`drive_models`が存在しない |
| 3 | legacy CLI adapterをinput-only化 | 一意tokenだけ変換し曖昧tokenを拒否 |
| 4 | mutation、targeted test、typecheck | 混在拒否mutation killと全targeted green |

本sliceはDB、recommendation、61 skillのbackfillを完了主張しない。
