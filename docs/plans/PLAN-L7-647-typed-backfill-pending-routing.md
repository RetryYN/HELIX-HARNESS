---
plan_id: PLAN-L7-647-typed-backfill-pending-routing
title: "PLAN-L7-647 (impl): pending Reverse判定をtyped workflow identityへ移行する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 887
behavior_contract_id: TYPED-BACKFILL-PENDING-ROUTING-001
responsibility_owner: backfill-pairing
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "pending Reverse判定がlegacy route_mode=add-featureに依存し、current typed PLANをorphanと誤判定する"
contract_postconditions: "typed workflow_model:ADD_FEATUREとpending_reverseの完全一致をconditionalPendingへ分類する"
contract_invariants: "別axis、別ID、不正identity、state欠落は推測せずorphanとし、legacy入力はcompatibility-onlyで維持する"
contract_failures: "target axis／ID／digest／backfill stateのmutationをU-BACKFILL-007が個別にredにする"
tdd_red_required: false
tdd_red_waiver_reason: "PR #885 run 32451221030でtyped PLANがreverseOrphansへ誤分類された既存Redを根拠とし、未記録timestampを捏造しない"
complexity_effect: net_negative
complexity_justification: "current判定からlegacy route_mode依存を除く移行の第一段階であり、既存frontmatter parserを再利用する"
removal_trigger: "legacy route_mode inventoryの全consumerが0になった時点でcompatibility分岐を削除する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #887 typed backfill pending判定gapを回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWBACK-001, test_path: tests/backfill-pairing.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — typed identity mutationとlegacy隔離の反証" }
  - { role: tl, slot_label: "TL — #204 authority境界とfail-close確認" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-647-typed-backfill-pending-routing.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/backfill-pairing.ts, artifact_type: source_module }
  - { artifact_path: tests/backfill-pairing.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks:
    - issue:874
---

# pending Reverse判定のtyped identity移行

## §工程表 schedule

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | typed identityをParsedPlanへ投影 | nested frontmatterをexact取得する |
| 2 | ADD_FEATURE＋pending_reverseを判定 | legacy route_modeなしでconditionalPendingになる |
| 3 | axis／ID／digest mutationを追加 | 近似入力をorphanとして維持する |
| 4 | L6／L8を再接着 | U-TPWBACK-001が同じ契約を返す |
| 5 | CIとClaudeによるexact-HEAD検収 | blocker 0を確認する |

実装と検証の接合は `src/lint/backfill-pairing.ts` と
`tests/backfill-pairing.test.ts` に固定し、U-TPWBACK-001でtyped identityの完全一致と
axis／ID／digest mutationのfail-closeを反証する。

## §境界

Reverse PLANのconfirmation、Issue #187/#874の終端、旧PLAN全件migrationは行わない。
