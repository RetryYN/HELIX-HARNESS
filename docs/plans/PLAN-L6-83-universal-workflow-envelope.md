---
plan_id: PLAN-L6-83-universal-workflow-envelope
title: "PLAN-L6-83 (add-design): Universal Workflow envelope機能設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Issue #184 envelope admissionをL6-L7へ降下する"
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
contract_preconditions: "L5/L8がschemaとmutation exact setを定義する"
contract_postconditions: "untrusted unknownをtyped activation decisionへpure変換する"
contract_invariants: "validatorはwrite/dispatch/補正を行わない"
contract_failures: "schema/semantic findingをactivation deniedへ変換する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "pure validator一関数とschema定数だけを追加する"
removal_trigger: "workflow admission ownerへ統合し公開consumer=0になった時点"
pair_artifact: docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — pure validator設計" }
  - { role: qa, slot_label: "QA — U oracle/mutation" }
  - { role: tl, slot_label: "TL — Node authority review" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-83-universal-workflow-envelope.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/universal-workflow-envelope.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T02:14:00Z"
    tests_green_at: "2026-07-28T02:12:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #189 の current HEAD 4f2f2e30 を clean detached worktree で独立レビューした。L6 function design が validateUniversalWorkflowEnvelope の関数境界 (schema parse → semantic findings → activation_allowed) と finding code 体系を定義していることを確認した。activation_allowed は findings 0 のときだけ true になる fail-close であり、実装と一致する。 実装 src/workflow/universal-workflow-envelope.ts は zod discriminated union と .strict() で全 atom 種を閉じ、副作用を持たない純関数である。独立 review で docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md の layer を L6 から L8 へ訂正し、plan-descent の pair_artifact_not_l8_unit_test_design を解消した (直近 merge 済みの L8-drive-route-catalog.md / L8-route-action-approval-stage.md と同じ型へ統一)。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/universal-workflow-envelope.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T02:12:00Z"
        evidence_path: docs/design/helix/L6-function-design/universal-workflow-envelope.md
        output_digest: "sha256:511192e4979ccf3ace9339471c25bc163ecee3784d3728abe6b8635f7942cf96"
        result: "6 passed"
dependencies:
  parent: docs/plans/PLAN-L5-80-universal-workflow-envelope.md
  requires: []
  references:
    - docs/plans/PLAN-L5-80-universal-workflow-envelope.md
  blocks:
    - docs/plans/PLAN-L7-478-universal-workflow-envelope.md
---

# PLAN-L6-83: Universal Workflow envelope機能設計

## 完了条件

- DbCとU-UWENV-001〜005がone-to-oneで実装testへ降りる。
