---
plan_id: PLAN-L5-88-worker-isolation-broker
title: "PLAN-L5-88 (add-design): worker isolation broker詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #226 WCC-FR-03をL5/L8へ降下する"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 226
engineering_discipline_required: true
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-62がcomponent境界とL9 oracleを固定する"
contract_postconditions: "failure exact set、snapshot制限、sealed broker launch、process contractが実装可能になる"
contract_invariants: "1 behavior、1 owner、永続ledger 0、workflow 0、raw provider launch 0"
contract_failures: "7 prepare failureと1 execution capability failureを実行oracleで到達可能にする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "copy-based snapshotでgit worktree、git history、provider別brokerを不要にする"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — failure／resource contract" }
  - { role: qa, slot_label: "QA — reachability／mutation oracle" }
  - { role: tl, slot_label: "TL — Design Reality Binding監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md, artifact_type: test_design }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T05:19:07Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-03T05:19:07Z"
    evidence_digest: "sha256:c05cc6702b33e58e107c5bcab8d50d9612822cb2271d0c329cca3363cac081ae"
  entries: []

review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T05:19:07Z"
    tests_green_at: "2026-08-03T05:18:15Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "HEAD 779e4b2cをclean exact-HEAD read-only監査。canonical authority root、catalog exact digest、cross-root拒否、immutable wrapper、bounded O_NOFOLLOW capture、backend/runtime FD 3/4 pin、WCC-FR-04以降非混載を確認。Critical/High/Medium 0、approve_for_status_transition。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts tests/worker-wrapper-admission.test.ts tests/worker-descriptor-admission.test.ts tests/digest.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T05:18:15Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:8d05b90ced54acc4a2738cea6de25130f747c1ca4fdb14314dace2524f9c1b84", result: "5 files / 50 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false --incremental false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T05:18:15Z", evidence_path: src/runtime/worker-isolation-broker.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }

dependencies:
  parent: docs/plans/PLAN-L4-62-worker-isolation-broker.md
  blocks:
    - docs/plans/PLAN-L6-96-worker-isolation-broker.md
---

# PLAN-L5-88: worker isolation broker詳細設計

Design Reality Binding、failure reachability、mutation oracleを同一candidate HEADで閉じる。
