---
plan_id: PLAN-L7-706-ci-verification-plan
title: "PLAN-L7-706: CI Verification Planの決定的合成"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-31
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewer_session_id: 01a05061-f4c3-7b50-8fc4-b148dbd5375a
    reviewed_head_sha: 0eb5707fbe112cc6188bb0a492977106eaf06e5e
    reviewed_at: "2026-08-31T00:20:53+09:00"
    tests_green_at: "2026-08-31T00:20:53+09:00"
    verdict: approve
    scope: "PR #1240 pre-confirm review。4巡の反例監査でexact HEAD、unknown risk、deferred receipt、required obligation削除・重複を検証し、最終HEADでBLOCKER 0。receipt sealは行っていない。"
    green_commands:
      - { kind: unit_test, command: "npx vitest run --project fast tests/ci-verification-plan.test.ts tests/ci-responsibility-registry.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-31T00:20:53+09:00", evidence_path: tests/ci-verification-plan.test.ts, output_digest: "sha256:ef18c6503965fcb1be5d766e54d68a619409103eec3a20ab02a257fa1a250c8e" }
      - { kind: typecheck, command: "npm run typecheck", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-31T00:20:53+09:00", evidence_path: tsconfig.json, output_digest: "sha256:8aa23401265a522f6a9d04e6bdaaa1855432965d44e5721ea70b1c0e037d4011" }
      - { kind: lint, command: "npx biome check src/runtime/ci-verification-plan.ts tests/ci-verification-plan.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-31T00:20:53+09:00", evidence_path: biome.json, output_digest: "sha256:4c483b1ac160082a6c6a917381e82511d512ec00b152656ec5727c87673e260e" }
owner: Codex / TL
github_issue_id: 1206
behavior_contract_id: CI-VERIFICATION-PLAN-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: add_code
legacy_retirement_state: input_only
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1206 Verification Plan deterministic composition"
contract_preconditions: "#1205 CI Responsibility Registryがtyped capability、semantic graph、registry digestを提供する"
contract_postconditions: "work authorityとexact candidate HEADからlocal／boundary／global／deferred receipt exact partitionとplan digestを生成する"
contract_invariants: "path-only identity、LLM省略、別green相殺、scheduler／runner選択をcurrent planへ混載しない"
contract_failures: "wrong／mismatched HEAD、stale registry、unknown capability／risk、required obligation欠落、duplicate／missing defer、deferred receipt／dependency不整合をfail-closeする"
tdd_red_required: true
tdd_red_evidence: "2026-08-30T12:28:00+09:00 tests/ci-verification-plan.test.ts initial red: ci-verification-plan module不在"
tdd_green_evidence: "2026-08-31 tests/ci-verification-plan.test.ts 12 tests green、typecheck green（再検証予定）"
mutation_oracle_required: true
mutation_oracle_evidence: "U-CIVPLAN-002〜012でrequired test／aggregate obligation削除・重複、全high-risk downgrade、unknown risk、valid-shape wrong HEAD、stale digest、defer receipt未知state／欠落／重複／dependency、legacy unknown／overlapを個別mutationする"
complexity_effect: net_negative
complexity_justification: "Impact CI／Lite／Module別のpath decisionを一つのtyped Verification Planへ収束する"
removal_trigger: "CI System Synthesis replacementへ全consumer、legacy adapter、rollback traceが移行した時"
parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md
pair_artifact: docs/test-design/helix/L8-ci-verification-plan-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L7-711-ci-responsibility-registry.md
    - src/runtime/ci-responsibility-registry.ts
  references:
    - "issue:1206"
    - "issue:1205"
    - "issue:1002"
    - "issue:1084"
  blocks:
    - "issue:1207"
    - "issue:1208"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-001, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-002, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-003, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-004, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-005, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-006, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-007, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-008, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-009, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-010, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-011, test_path: tests/ci-verification-plan.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md, oracle_id: U-CIVPLAN-012, test_path: tests/ci-verification-plan.test.ts }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
generates:
  - { artifact_path: docs/plans/PLAN-L7-706-ci-verification-plan.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-verification-plan.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-verification-plan-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-verification-plan.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-verification-plan.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — typed Verification Plan composition" }
  - { role: qa, slot_label: "QA — fallback／defer／legacy mutation" }
---

# CI Verification Plan

CIS-R-07〜09だけを実装する。scheduler、runner、telemetry recoveryは#1207以降へ残す。
