---
plan_id: PLAN-L7-669-project-hook-assignment-provider
title: "PLAN-L7-669 (add-impl): Assignment kernel snapshotをproject hook authority providerへ接続する"
kind: add-impl
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #895 Assignment＋branch＋lease kernelをauthority providerへ接続する"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-ASSIGNMENT-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
contract_preconditions: "Control Planeがassignment ID、専用worktree、branch、candidate/current HEAD、lease/fenceを明示snapshotで供給する"
contract_postconditions: "snapshotをphysical capture requestへ一方向変換しprovider inputとして返す"
contract_invariants: "cwd、env、primary shared tree、origin/mainから欠落値を補完しない"
contract_failures: "snapshot unavailable、schema不正、physical capture失敗はauthority_input_unavailableへ同一化する"
tdd_red_required: true
red_test: "U-CNWHOOKASSIGN-001..003がassignment provider module不在でsuite load failureになる"
red_at: "2026-08-24T20:03:13Z"
green_at: "2026-08-24T20:04:09Z"
mutation_oracle_evidence: "src/runtime/project-hook-assignment-provider.ts のstable ID schemaを任意stringへ緩和する変異を実測し、tests/project-hook-assignment-provider.test.ts のU-CNWHOOKASSIGN-002がempty lease IDの誤受理でfailしてkillした"
complexity_effect: net_negative
complexity_justification: "Assignment kernelとphysical adapter間の暗黙root推測を単一typed adapterへ置換する"
removal_trigger: "Assignment kernelがProjectHookAuthorityInputV1をnative projectionしadapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKASSIGN-001, test_path: tests/project-hook-assignment-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKASSIGN-002, test_path: tests/project-hook-assignment-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKASSIGN-003, test_path: tests/project-hook-assignment-provider.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-669-project-hook-assignment-provider.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/project-hook-assignment-provider.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-assignment-provider.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-668-project-hook-authority-surface-projector
  requires:
    - docs/plans/PLAN-L7-668-project-hook-authority-surface-projector.md
    - src/runtime/project-hook-authority-provider.ts
    - src/runtime/project-hook-physical-adapter.ts
  blocks:
    - "issue:895-clean-main-luna-read-after"
agent_slots:
  - { role: se, slot_label: "SE — Assignment snapshot adapter" }
  - { role: qa, slot_label: "QA — malformed／fallback negative oracle" }
  - { role: tl, slot_label: "TL — kernel境界とauthority監査" }
---

# Assignment project hook authority provider

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | adapterをRed→Green | 明示snapshotだけをcaptureへ渡す |
| 2 | fail-close | unavailable／malformed／capture errorを同一failureへ閉じる |
| 3 | fallback反証 | primary cwd／env／origin mainを読まない |
| 4 | targeted／typecheck／Biome | 全green |
| 5 | Claude exact-HEAD review | blocker 0 |

本sliceは既存Assignment kernelを再実装しない。kernel reader portから受けたsnapshotだけを変換し、dispatch実行、
hook source切替、Luna spawn canaryは後続read-afterへ分離する。
