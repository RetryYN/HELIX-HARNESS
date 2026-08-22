---
plan_id: PLAN-L7-654-project-hook-process-adapter
title: "PLAN-L7-654 (impl): project hook OS process termination adapterを実装する"
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
  - "po_directive:Issue #895 bounded lifecycleのOS child terminationを実装する"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-PROCESS-001
responsibility_owner: project-hook-process-adapter
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_adapter
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: service
contract_preconditions: "PLAN-L7-653がtimeout後のchild terminal確認をpure dependencyとして定義している"
contract_postconditions: "捕捉済みchildだけをSIGTERM、bounded grace、必要時SIGKILLの順で停止しterminalを実測する"
contract_invariants: "process探索、shell、foreign PID推測を行わず、不正identityでsignalを送らない"
contract_failures: "hook_process_identity_invalid、hook_child_not_terminal"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "hook別のprocess停止処理を単一adapterへ集約する"
removal_trigger: "後継process capability brokerへ移行しv1 callerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md
pair_artifact: docs/test-design/helix/L8-project-hook-process-adapter-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md, oracle_id: U-CNWHOOKPROC-001, test_path: tests/project-hook-process-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md, oracle_id: U-CNWHOOKPROC-002, test_path: tests/project-hook-process-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md, oracle_id: U-CNWHOOKPROC-003, test_path: tests/project-hook-process-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md, oracle_id: U-CNWHOOKPROC-004, test_path: tests/project-hook-process-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-process-adapter.md, oracle_id: U-CNWHOOKPROC-005, test_path: tests/project-hook-process-adapter.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-654-project-hook-process-adapter.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-process-adapter.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-process-adapter-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/project-hook-process-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-process-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-653-project-hook-lifecycle-supervisor.md
  requires:
    - docs/design/helix/L5-detail/project-hook-authority-schema.md
  blocks:
    - issue:895-surface-wiring
---

# project hook OS process termination adapter

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | terminal／SIGTERM経路をRed→Green | 既終端は無操作、aliveはSIGTERM |
| 2 | grace／SIGKILL経路 | bounded grace後だけ昇格 |
| 3 | terminal再確認 | aliveを成功へ降格しない |
| 4 | identity負例 | 不正入力のside effect 0 |
| 5 | targeted／typecheck／Biome | 全green |
