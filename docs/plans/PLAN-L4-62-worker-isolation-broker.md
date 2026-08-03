---
plan_id: PLAN-L4-62-worker-isolation-broker
title: "PLAN-L4-62 (add-design): worker isolation broker基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: recovery
entry_signals: ["po_directive:Feature #92 Issue #226 WCC-FR-03を連続dispatchする"]
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
contract_preconditions: "WCC-FR-01/02がmainでgreenでありLinux bubblewrap backendを利用できる"
contract_postconditions: "入力snapshotとworker processだけを隔離scratchへ束縛しrepo/state/DB/credentialを不可視にする"
contract_invariants: "git history 0、host env継承0、main write 0、WCC-FR-04以降混載0"
contract_failures: "platform/backend/boundary/source/wrapper/admission/runtimeをspawn前にfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存adapter capabilityとdescriptor admissionを再利用しbroker module 1件だけを追加する"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-isolation-broker-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — isolation boundary／runtime inventory" }
  - { role: qa, slot_label: "QA — L9 negative oracle" }
  - { role: tl, slot_label: "TL — WCC-FR-04以降の非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-isolation-broker-system-test-design.md, artifact_type: test_design }
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
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L7-497-worker-descriptor-admission.md
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  blocks:
    - docs/plans/PLAN-L5-88-worker-isolation-broker.md
---

# PLAN-L4-62: worker isolation broker基本設計

実在sourceと外部隔離backendをinventoryし、snapshot-only input、sealed launch、fresh admission、repo/state/DB/credential不可視の
L4 componentとL9 oracleを固定する。secret classificationとnetwork policyはWCC-FR-04へ分離する。
