---
plan_id: PLAN-L7-499-worker-isolation-broker
title: "PLAN-L7-499 (add-impl): worker isolation broker"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Issue #226 WCC-FR-03をTDD実装する"]
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-96がprepare/run、failure、resource boundを固定する"
contract_postconditions: "WCC-FR-03の9 executable oracleがcurrent Linux backendでgreenになる"
contract_invariants: "WCC-FR-04以降混載0、main/state/DB/credential bind 0、新DB/workflow 0"
contract_failures: "U-WIB-001..009が境界緩和、copy、stale、prose-only mutationをRedにする"
tdd_red_required: true
red_at: "2026-08-03T13:27:58+09:00"
green_at: "2026-08-03T13:29:30+09:00"
mutation_oracle_evidence: "tests/worker-isolation-broker.test.ts U-WIB-008とtests/design-reality-binding.test.ts U-DRB-014がauthority、TOCTOU、resource boundのseeded mutationをkillし、対象分岐を除去したmutationをRedにする"
complexity_effect: net_negative
complexity_justification: "broker 1 moduleとadapter identity helper 1関数でgit worktree/history/provider別実装を不要にする"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — isolated broker実装" }
  - { role: qa, slot_label: "QA — 9 executable oracle" }
  - { role: tl, slot_label: "TL — exact scope／Feature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-001, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-002, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-003, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-004, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-005, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-006, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-007, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-008, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-009, test_path: tests/worker-isolation-broker.test.ts }
generates:
  - { artifact_path: config/worker-isolation-runtime-catalog.json, artifact_type: json_config }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
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
  parent: docs/plans/PLAN-L6-96-worker-isolation-broker.md
  blocks:
    - issue:226
---

# PLAN-L7-499: worker isolation broker実装

Redでmodule不在を確認し、Greenで実bubblewrap processを含む9 oracleを成立させた。merge後は同IssueのWCC-FR-04へ連続dispatchする。
