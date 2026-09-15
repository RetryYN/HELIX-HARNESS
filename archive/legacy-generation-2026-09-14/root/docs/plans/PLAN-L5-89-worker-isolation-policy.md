---
plan_id: PLAN-L5-89-worker-isolation-policy
title: "PLAN-L5-89 (add-design): worker isolation policy詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #226 WCC-FR-04を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-63がcomponentとL9 oracleを固定する"
contract_postconditions: "failure exact set、sealed policy、scope diff contractが実装可能になる"
contract_invariants: "raw secret保存0、host egress 0、glob scope 0、repo promotion 0"
contract_failures: "5 failure codeをexecutable oracleとmutationへ束縛する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存secret SSoT、wrapper identity、broker scratchを再利用する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — failure／policy contract" }
  - { role: qa, slot_label: "QA — reachability／mutation" }
  - { role: tl, slot_label: "TL — Design Reality Binding監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-policy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md, artifact_type: test_design }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T07:39:41Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-03T07:39:41Z"
    evidence_digest: "sha256:c82fb6f266e96b5bd428133de8174b832b719592091ef637fd20ff8b8923d840"
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T07:39:41Z"
    tests_green_at: "2026-08-03T07:39:41Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "exact HEAD 3b5fb15bをclean read-only監査。secret/unknown/actual token spawn前deny、sealed wrapper origin、nonempty egress deny、--unshare-net、bounded streaming post-state scan、generic scope failure、FR-05/06非混載を確認。Critical/High/Medium 0、status transition可。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-policy.test.ts tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts tests/worker-wrapper-admission.test.ts tests/worker-descriptor-admission.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T07:39:41Z", evidence_path: tests/worker-isolation-policy.test.ts, output_digest: "sha256:d3645e333ad0532475117a1cdd0d6fe2600de8d18603e0d7ddee36e202ef3064", result: "6 files / 59 passed / 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T07:39:41Z", evidence_path: src/runtime/worker-isolation-policy.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
dependencies:
  parent: docs/plans/PLAN-L4-63-worker-isolation-policy.md
  blocks:
    - docs/plans/PLAN-L6-97-worker-isolation-policy.md
---

# PLAN-L5-89: worker isolation policy詳細設計

5 failure、bounded post-state、generic failure output、mutation reachabilityを固定する。
