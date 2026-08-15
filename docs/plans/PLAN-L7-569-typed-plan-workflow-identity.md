---
plan_id: PLAN-L7-569-typed-plan-workflow-identity
title: "PLAN-L7-569 (impl): PLAN current identityをrequirements registryへ束縛する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.2
  registry_source_digest: sha256:73de8b942e4d352ba22b1ac2e46543878d2e894ced4b9294c724458536080045
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals: ["po_directive:Issue #205 typed PLAN identity projection slice"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: TYPED-PLAN-WORKFLOW-IDENTITY-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "新規PLANが旧route_modeを必須とされ、PLAN kindとworkflow modelが同一enumで照合される"
contract_postconditions: "新規PLANがversion／digest束縛済みtyped identityだけをcurrent fieldとして保持する"
contract_invariants: "PLAN kind、specialist drive、workflow identityを別軸で保持し、legacy route_modeをtyped PLANへ再出力しない"
contract_failures: "未知axis／ID、stale version／digest、route_mode併記をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #205のsurface inventoryと既存U-PROUTE-009が旧route_mode必須化を既存Redとして実証済みであり、schema／lint／oracleを同一atomic patchで置換する"
complexity_effect: net_negative
complexity_justification: "PLAN kindと旧modeの誤った対応表をcurrent authoring pathから除去し、requirements registry tupleへ一本化する"
removal_trigger: "workflow identity schema major version更新時にversioned successorへ置換する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-001, test_path: tests/frontmatter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-002, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-003, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-004, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWID-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — frontmatter typed value object" }
  - { role: qa, slot_label: "QA — stale tuple／legacy再出力反例" }
  - { role: tl, slot_label: "TL — requirements axis分離境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/frontmatter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  blocks: []
---

# PLAN current workflow identity移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | typed frontmatter tupleを追加 | [直列] | U-TPWID-001 green |
| 2 | plan-entry gateをcatalog exact bindingへ移行 | [直列] | U-TPWID-002..004 green |
| 3 | targeted、full CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

DB projection、Issue／PR ingest、execution episode、right-arm bindingは#205の後続原子的sliceとする。
