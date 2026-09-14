---
plan_id: PLAN-L4-53-universal-workflow-envelope
title: "PLAN-L4-53 (add-design): Universal Workflow envelope基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Issue #184 Universal Workflow atom/envelopeをL4-L9へ降下する"
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
contract_preconditions: "L3 UWJ-FR-002/006/007/017/018がconfirmed"
contract_postconditions: "atom/envelope/runtime compositionのcomponent authorityとL9反例が閉じる"
contract_invariants: "AI proposalとNode activation/write authorityを分離する"
contract_failures: "旧schema、欠落atom、digest drift、authority昇格を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "後続4責務が共有するschemaを一つだけ追加し、別engine schemaの増殖を防ぐ"
removal_trigger: "Universal Workflow全責務が別canonical schemaへatomic cutoverした時点"
pair_artifact: docs/test-design/helix/L4-universal-workflow-envelope-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — component/authority境界" }
  - { role: qa, slot_label: "QA — L9 negative system design" }
  - { role: tl, slot_label: "TL — 後続4slice共通境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-53-universal-workflow-envelope.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/universal-workflow-envelope.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-universal-workflow-envelope-system-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T02:14:00Z"
    tests_green_at: "2026-07-28T02:12:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #189 の current HEAD 4f2f2e30 を clean detached worktree で独立レビューした。L4 basic design が Universal Workflow の 15 atom 種と 5 出力 envelope、runtime composition の境界を U-UWENV-001 として定義していることを確認した。専門工程を同じ workflow 語彙へ降下させる共通境界の宣言であり、interview/compiler/proposal/allocation は後続 Issue へ分離すると明記されている。 実装 src/workflow/universal-workflow-envelope.ts は zod discriminated union と .strict() で全 atom 種を閉じ、副作用を持たない純関数である。独立 review で docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md の layer を L6 から L8 へ訂正し、plan-descent の pair_artifact_not_l8_unit_test_design を解消した (直近 merge 済みの L8-drive-route-catalog.md / L8-route-action-approval-stage.md と同じ型へ統一)。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/universal-workflow-envelope.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T02:12:00Z"
        evidence_path: docs/design/helix/L4-basic-design/universal-workflow-envelope.md
        output_digest: "sha256:ffc5523456cdc949a958e473a918a3feb0851b2e3d6e311a1ceaf401420ac3b8"
        result: "6 passed"
dependencies:
  parent: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  requires: []
  references:
    - docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md
  blocks:
    - docs/plans/PLAN-L5-80-universal-workflow-envelope.md
---

# PLAN-L4-53: Universal Workflow envelope基本設計

## 完了条件

- L4 component、authority、state、failure境界がL9反例とpairになる。
- interview/compiler/proposal/allocationを本責務へ混載しない。
