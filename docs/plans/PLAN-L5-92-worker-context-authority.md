---
plan_id: PLAN-L5-92-worker-context-authority
title: "PLAN-L5-92 (add-design): worker context authority詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #225 WCC-FR-09を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-66がcomponentとauthority境界を固定"
contract_postconditions: "18-field packet、13 failure、reachability witnessを固定"
contract_invariants: "unknown/missing field 0、3軸変換0、unbounded budget 0"
contract_failures: "schema/HEAD/authority/rule/axes/scope/budget/schema/role/lens/payload/seal"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "packet/envelope/capability三型だけで状態を表現し永続ledgerを持たない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — packet/failure契約" }
  - { role: qa, slot_label: "QA — failure reachability" }
  - { role: tl, slot_label: "TL — design refactor gate" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-66-worker-context-authority.md
  requires:
    - docs/design/helix/L4-basic-design/worker-context-authority.md
  blocks:
    - docs/plans/PLAN-L6-100-worker-context-authority.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T16:24:27Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T16:24:27Z", evidence_digest: "sha256:51b6b6c096771bb9f80323b41cba3ec257bffb6a08f1b91ffb6699cc645dd3a5" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T16:24:27Z"
    tests_green_at: "2026-08-03T16:24:27Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "pair/team/provider/loop全execute経路のcontext必須化、欠落fieldのtyped failure、exact HEAD reattest、fixture移行、非L4/L5 PLANのL4/L5 artifact marker迂回拒否、FR-07/08非混載を監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: smoke, command: "git diff --check", runner: bash, scope: changed-files, exit_code: 0, completed_at: "2026-08-03T16:10:45Z", evidence_path: src/runtime/worker-context-packet.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "出力0 byte。whitespace errorなし。" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-503-worker-context-authority.md", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-03T16:10:49Z", evidence_path: docs/plans/PLAN-L7-503-worker-context-authority.md, output_digest: "sha256:a6f12bdab345d169ea5b56e12c6ad31c54ae8f13675cd0f6b5eb6b7e92cb44a5", result: "plan schedule/descent/vpair/reality/routing green" }
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/design-reality-binding.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T16:24:27Z", evidence_path: tests/design-reality-binding.test.ts, output_digest: "sha256:d308cd0cd28c5e38665a953f5e914903fc3c37ab8ef312e5b7d41de6f33394a9", result: "1 file / 20 tests passed" }
---

# PLAN-L5-92: worker context authority詳細設計

failure exact setと実行fixture/mutationを一対一にする。
