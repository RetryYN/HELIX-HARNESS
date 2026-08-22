---
plan_id: PLAN-L7-635-workflow-guide-dynamic-injection
title: "PLAN-L7-635 (impl): requirements registryからtyped workflow guideを生成しboundedに注入する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #635 typed workflow guide and bounded dynamic injection"]
created: 2026-08-19
updated: 2026-08-20
owner: Codex / TL
github_issue_id: 635
behavior_contract_id: WORKFLOW-GUIDE-DYNAMIC-INJECTION-001
responsibility_owner: workflow-guide-dynamic-injection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements-owned typed classification registryとgenerated catalogが存在し、旧15-route catalogはcompatibility inventoryへ隔離されている"
contract_postconditions: "workflow_model exact set全件をcurrent authorityからdigest付きで生成し、明示されたSessionStart workflowだけへbounded注入できる。doctorがguide projectionのauthority driftを検出する"
contract_invariants: "workflow identityはtarget_axis + target_idで束縛し、--driveはspecialist driveだけを受理し、signalから別identityを推測せず、guideはcurrent registry/catalogから再生成する"
contract_failures: "axis混同、旧identity出力、unknown／ambiguous／decision待ち、registry／catalog stale、guide authority drift、非bounded注入をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでguide projectionとoracleを同一atomic sliceとして実装し、未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "既存route evalの意味authorityを変更せず、guideとSessionStart注入の明示入口を追加する"
removal_trigger: "workflow guide schema successorへ移行しv1 consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md
pair_artifact: docs/test-design/helix/L8-workflow-guide-dynamic-injection-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-001, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-002, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-003, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-004, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-005, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-006, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-007, test_path: tests/workflow-guide.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-008, test_path: tests/workflow-guide-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-009, test_path: tests/workflow-guide-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-010, test_path: tests/workflow-guide-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-011, test_path: tests/workflow-guide-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, oracle_id: U-WFGUIDE-012, test_path: tests/workflow-guide-authority.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — requirements registryからのguide projectionとdigest binding" }
  - { role: qa, slot_label: "QA — axis混同、legacy再出力、signal ambiguity、bounded surface" }
  - { role: tl, slot_label: "TL — #635 authority、SessionStart境界、Forward再合流" }
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-18T18:31:24Z"
    tests_green_at: "2026-08-18T18:31:24Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "#635のtyped workflow guide生成、specialist drive／signal境界、bounded SessionStart注入、設計catalog登録、左腕判定のcurrent sourceを確認する単一runtime検収。Claudeの独立検収は後続で必須とする。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-guide.test.ts tests/design-coverage.test.ts tests/left-arm-carry-log.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T18:31:24Z"
        evidence_path: tests/workflow-guide.test.ts
        output_digest: "sha256:0d3e5dfe6bc21b9ca4d7199cee0d90b030f95b9505893650a4d942fe80e37119"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-18T18:31:24Z"
  review_binding:
    reviewer: codex-tl
    reviewed_at: "2026-08-18T18:31:24Z"
    evidence_digest: "sha256:61c1f6c21df7899ab14a398f8699a5213759e0f381cdd5087e916ee67b8a80c8"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-635-workflow-guide-dynamic-injection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-guide-dynamic-injection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-guide-dynamic-injection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/workflow-guide.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/workflow.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/session-log.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/workflow-guide-authority.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/workflow-guide.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-guide-cli.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-guide-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
  references:
    - src/workflow/workflow-classification-routing.ts
    - src/runtime/task-lens.ts
  blocks: []
---

# typed workflow guide生成・bounded dynamic injection

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | registryのworkflow_model exact setからguide projectionを生成 | [直列] | U-WFGUIDE-001..006 green |
| 2 | CLI `workflow guide`とspecialist drive／signal拒否を接続 | [直列] | U-WFGUIDE-003..005、CLI smoke green |
| 3 | 明示workflowだけをSessionStartへbounded注入 | [直列] | U-WFGUIDE-007、SessionStart smoke green |
| 4 | current registry exact setのguide projectionをdoctorで再生成検査しauthority driftをfail-close | [直列] | U-WFGUIDE-010..012、doctor green |
| 5 | targeted、typecheck、全回帰、doctor、DB convergence | [直列] | 同一HEAD green |
| 6 | Claude Code Opus exact-HEAD独立reviewとForward再合流 | [review] | blocker 0、current-main read-after |

guideはrequirements registryのprojectionとして扱い、旧15-route catalog、旧mode／model、全量guide注入をcurrent経路へ戻さない。
