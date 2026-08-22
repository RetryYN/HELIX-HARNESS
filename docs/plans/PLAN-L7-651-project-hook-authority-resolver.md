---
plan_id: PLAN-L7-651-project-hook-authority-resolver
title: "PLAN-L7-651 (impl): project hook authority pure resolverを実装する"
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
  - "po_directive:Issue #895 L5 typed contractをpure resolverへForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-RESOLVER-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L5-103が観測root／HEAD／sourceとcurrent authority比較値をstrict schemaへ固定している"
contract_postconditions: "pure resolverがexact schema、physical identity、HEAD、三digestを判定しdeterministic receiptまたはside effect 0 failureを返す"
contract_invariants: "lexical path、primary root、provider名からauthorityを推測せず、inputを変更しない"
contract_failures: "schema_invalidまたはproject_hook_source_stale_or_foreignをstableに返す"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "散在するcwd／HEAD／digest比較を一つのpure resolverへ集約する"
removal_trigger: "後継schemaへreceipt付きmigrationしv1 consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
verification_bindings:
  - { oracle_id: U-CNWHOOKSCHEMA-001, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-002, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-004, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-005, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-006, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-007, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-008, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
  - { oracle_id: U-CNWHOOKSCHEMA-012, parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, test_path: tests/project-hook-authority.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — strict resolver／deterministic receipt実装" }
  - { role: qa, slot_label: "QA — field deletion／identity drift／side effect 0 oracle" }
  - { role: tl, slot_label: "TL — L5 authority境界と後続adapter責務監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-651-project-hook-authority-resolver.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/project-hook-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-103-project-hook-authority-schema.md
  requires:
    - docs/design/helix/L5-detail/project-hook-authority-schema.md
  blocks:
    - issue:895-physical-adapter
    - issue:895-surface-wiring
---

# project hook authority pure resolver

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | exact input schemaをRed→Green | 全root field deletionとunknown追加を拒否 |
| 2 | physical／HEAD／source比較を実装 | lexical一致や一軸greenで相殺しない |
| 3 | deterministic receiptとside effect 0 failureを実装 | 同一input同一bytes、input mutation 0 |
| 4 | typecheck／targeted／Biome | 全green |
| 5 | Claude exact-HEAD独立review | blocker 0 |

本sliceはpure resolverだけを所有する。filesystem capture、process supervisor、CLI／hook wiring、Luna read-afterは後続PRとする。
