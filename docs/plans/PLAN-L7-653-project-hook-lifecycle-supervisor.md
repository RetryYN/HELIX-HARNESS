---
plan_id: PLAN-L7-653-project-hook-lifecycle-supervisor
title: "PLAN-L7-653 (impl): project hook bounded lifecycle supervisorを実装する"
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
  - "po_directive:Issue #895 CNW-R-08のbounded timeoutとterminal result保全をruntime化する"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-LIFECYCLE-001
responsibility_owner: project-hook-lifecycle
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_supervisor
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: service
contract_preconditions: "PLAN-L5-103が15秒既定／60秒上限、親子terminal、result preservationをexact化している"
contract_postconditions: "operation完了またはtimeoutをdeterministicに分岐し、timeout時にabort／child termination／parent terminal確認とterminal result保全を返す"
contract_invariants: "timeout＋child graceの合計を60秒hard ceiling内に保ち、timeout後のoperation完了で結果を上書きせず、review receipt bytesを変更しない"
contract_failures: "hook_lifecycle_policy_invalid、project_hook_lifecycle_timeout、terminal_result_mutation_detected"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "hook別timeout／kill処理を単一supervisorへ集約する"
removal_trigger: "後継lifecycle schemaへ移行しv1 callerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md
pair_artifact: docs/test-design/helix/L8-project-hook-lifecycle-supervisor-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-001, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-002, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-003, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-004, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-005, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-006, test_path: tests/project-hook-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, oracle_id: U-CNWHOOKLIFE-007, test_path: tests/project-hook-lifecycle.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded timeout／terminal result supervisor実装" }
  - { role: qa, slot_label: "QA — race／parent-child terminal／mutation oracle" }
  - { role: tl, slot_label: "TL — lifecycle authorityとOS adapter境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-653-project-hook-lifecycle-supervisor.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-lifecycle-supervisor-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/project-hook-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-lifecycle.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-103-project-hook-authority-schema.md
  requires:
    - docs/design/helix/L5-detail/project-hook-authority-schema.md
  blocks:
    - issue:895-surface-wiring
---

# project hookのbounded lifecycle supervisor実装

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | completion／timeout raceをRed→Green | operation完了時timer cancel、timeout時abort |
| 2 | child／parent terminal確認 | falseをsuccessへ降格せず、cleanup hangもhard ceilingで返す |
| 3 | terminal result seal／preservation | session／HEAD／verdict／commentの改変0 |
| 4 | policy bounds | 0以下／単独またはtimeout＋grace合計60001以上／改変receiptを拒否 |
| 5 | targeted／typecheck／Biome | 全green |

本sliceはpure lifecycle orchestrationだけを所有する。OS process kill adapter、notification worker、hook wiringは後続とする。
