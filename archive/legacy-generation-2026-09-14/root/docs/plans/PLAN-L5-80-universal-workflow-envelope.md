---
plan_id: PLAN-L5-80-universal-workflow-envelope
title: "PLAN-L5-80 (add-design): Universal Workflow envelope詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Issue #184 atom/envelope schemaをL5-L8 pairへ降下する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 184
engineering_discipline_required: true
behavior_contract_id: U-UWENV-001
responsibility_owner: universal-workflow-envelope
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9がcomponentとactivation authorityを定義する"
contract_postconditions: "15 atom、5出力、runtime composition、参照/digest不変条件をexact schema化する"
contract_invariants: "unknown field/version、推測補正、blocking unresolvedのactivationを許可しない"
contract_failures: "field/参照/coverage/digest/runtime composition欠落をfail-closeする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "既存Zod runtimeへ一つのstrict schema familyとして集約する"
removal_trigger: "schema major version cutover時にconsumer=0を確認して旧versionを除去する"
pair_artifact: docs/test-design/helix/L5-universal-workflow-envelope-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — schema/ref不変条件" }
  - { role: qa, slot_label: "QA — L8 mutation design" }
  - { role: tl, slot_label: "TL — minimality/authority review" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-80-universal-workflow-envelope.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/universal-workflow-envelope.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-universal-workflow-envelope-integration-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T02:14:00Z"
    tests_green_at: "2026-07-28T02:12:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #189 の current HEAD 4f2f2e30 を clean detached worktree で独立レビューした。L5 detail design が atom 間の参照整合 (transition→state/trigger/condition/action、loop→state/condition、terminal→state/notification/audit、condition→data) と coverage report の意味を定義していることを確認した。実装側の requireRef 群と 1 対 1 に対応する。 実装 src/workflow/universal-workflow-envelope.ts は zod discriminated union と .strict() で全 atom 種を閉じ、副作用を持たない純関数である。独立 review で docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md の layer を L6 から L8 へ訂正し、plan-descent の pair_artifact_not_l8_unit_test_design を解消した (直近 merge 済みの L8-drive-route-catalog.md / L8-route-action-approval-stage.md と同じ型へ統一)。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/universal-workflow-envelope.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T02:12:00Z"
        evidence_path: docs/design/helix/L5-detail/universal-workflow-envelope.md
        output_digest: "sha256:d5983cd70491bcda0b99264d9ec9e12b3938579caced1c77508c21a4c57a16ed"
        result: "6 passed"
dependencies:
  parent: docs/plans/PLAN-L4-53-universal-workflow-envelope.md
  requires: []
  references:
    - docs/plans/PLAN-L4-53-universal-workflow-envelope.md
  blocks:
    - docs/plans/PLAN-L6-83-universal-workflow-envelope.md
---

# PLAN-L5-80: Universal Workflow envelope詳細設計

## 完了条件

- schema field、ID参照、digest、coverage、unresolvedの反例がL8へ降りる。
