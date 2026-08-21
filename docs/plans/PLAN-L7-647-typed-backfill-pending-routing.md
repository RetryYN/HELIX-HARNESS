---
plan_id: PLAN-L7-647-typed-backfill-pending-routing
title: "PLAN-L7-647 (impl): pending Reverse判定をtyped workflow identityへ移行する"
kind: impl
layer: L7
drive: agent
status: confirmed
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
contract_failures: "target axis／ID／digest／backfill stateのmutationをU-TPWBACK-001が個別にredにする"
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
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T07:29:32Z"
    tests_green_at: "2026-08-21T07:23:08Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    scope: "PR #889 exact HEAD 1f039497a7cc8c4f7aa58c2b1b7daecfbf59ac8fを独立検収。typed workflow_model:ADD_FEATURE＋pending_reverseの完全一致だけをconditionalPendingへ受理し、別axis／別ID／digest driftをorphanへfail-closeすること、legacy route_modeをcompatibility-onlyで維持することを確認してblocker 0。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/889#issuecomment-5366639046"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/backfill-pairing.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/fe-roster-orchestration.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-21T07:23:08Z"
        evidence_path: tests/backfill-pairing.test.ts
        output_digest: "sha256:7fa7a8a2dbbba722c6bd82b1ebfb29bf86f68bacb6658a82c4eb69427a8b1098"
        result: "3 files / 52 tests green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T07:29:32Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-21T07:29:32Z"
    evidence_digest: "sha256:4441f735154bc10a223d7394e2a55b4ba7aeaff5560afec15edca796b002e1dd"
  entries: []
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
