---
plan_id: PLAN-L5-103-project-hook-authority-schema
title: "PLAN-L5-103 (add-design): project hook authorityのtyped contractを定義する"
kind: add-design
layer: L5
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
  - "po_directive:Issue #895 CNW-R-06..08／CNW-AC-009..013をL4境界からL5 typed contractへForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-SCHEMA-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-76がphysical identity、assignment root、4 surface、bounded lifecycleのsystem境界を確定している"
contract_postconditions: "authority receipt、typed failure、deadline、terminal payload preservationのexact schemaがL5↔L8で固定される"
contract_invariants: "physical identityとlexical path、Codex identityとClaude conformance、terminal resultとwake workerを同一fieldへ畳み込まない"
contract_failures: "missing／unknown／unsupported physical evidence、stale root／HEAD／digest、期限超過、親process残留、terminal payload改変をtyped failureへ束縛する"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。production parser／resolver／supervisorは後続L6/L7がRed→Greenを所有する"
complexity_effect: net_negative
complexity_justification: "cwd・環境変数・provider別payloadの暗黙推測を一つのstrict contractへ収束する"
removal_trigger: "後継schemaへreceipt付きmigrationしv1 consumerが0になった時"
parent_design: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — identity／receipt／failure schema" }
  - { role: qa, slot_label: "QA — exact field／mutation／side-effect oracle" }
  - { role: tl, slot_label: "TL — assignment authority／terminal result境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-103-project-hook-authority-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/project-hook-authority-schema.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/project-hook-authority-schema-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md
  requires:
    - docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
  blocks:
    - issue:895-l6-l7-runtime
---

# project hook authorityのL5↔L8 Forward

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | physical repository identityとsource identityをexact化 | lexical pathだけでsameを作れない |
| 2 | assignment bindingと4 surface receiptをexact化 | primary fallbackとsurface別推測を拒否できる |
| 3 | deadline／process terminal／result preservationをexact化 | timeout後hangとterminal payload消失を反証できる |
| 4 | L8 mutation oracleを定義 | field削除、stale digest、unsupported stat、payload mutationを捕捉する |
| 5 | Claude exact-HEAD独立review | blocker 0、runtime実装claim 0 |

本PLANはschema設計だけを所有する。production parser、filesystem adapter、process supervisor、SessionStart／doctor／status／dispatch
wiring、Luna spawn read-afterは後続L6/L7へ分離する。
