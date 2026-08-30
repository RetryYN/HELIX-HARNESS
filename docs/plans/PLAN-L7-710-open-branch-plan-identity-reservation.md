---
plan_id: PLAN-L7-710-open-branch-plan-identity-reservation
title: "PLAN-L7-710: open branch PLAN identity reservation"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1255
behavior_contract_id: CROSS-BRANCH-PLAN-IDENTITY-RESERVATION-001
responsibility_owner: open-branch-plan-identity-reservation
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: pure_function
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1255 open branch間のPLAN identity予約競合をfail-closeする"
contract_preconditions: "current main、open PR heads、active assignment／writer branchesのtyped snapshotが同じcapture epochに束縛される"
contract_postconditions: "stable plan ID、family／number、owner Issue、responsibility、blob、HEAD、assignment／leaseからactive reservation exact setを生成する"
contract_invariants: "local plan-number-uniquenessを維持し、stack inheritanceだけをpassし、provider名／branch名をidentity authorityにしない"
contract_failures: "異責務同一plan ID／number、terminal evidence欠落、schema drift、GitHub／writer evidence取得不能を曖昧greenにしない"
tdd_red_required: true
red_at: "2026-08-30T21:42:00+09:00"
green_at: "2026-08-30T21:49:00+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-08-30 21:47-21:49 JSTに単一mutationを順次適用し、U-OBPIR-002(number conflict)、003(ancestry)、005/007(terminal evidence)、006(unavailable)、007(dedupe)が各exit 1でkillした。各mutationは直後に復元した"
complexity_effect: justified_positive
complexity_justification: "既存local gateを変更せず、cross-branch reservation判断を一つのpure projectionへ収束する"
removal_trigger: "PLAN identityが単一transactional allocatorからlease付きで発行され、open branch観測projectionが不要になった時"
parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md
pair_artifact: docs/test-design/helix/L8-open-branch-plan-identity-reservation-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-535-plan-number-uniqueness.md
  requires:
    - docs/plans/PLAN-L7-535-plan-number-uniqueness.md
  references:
    - issue:1255
  blocks: []
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-001, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-002, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-003, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-004, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-005, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-006, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-007, test_path: tests/open-branch-plan-identity-reservation.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, oracle_id: U-OBPIR-008, test_path: tests/open-branch-plan-identity-reservation.test.ts }
review_evidence:
  - reviewer: codex-hosted-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-30T13:07:10Z"
    tests_green_at: "2026-08-30T13:07:10Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex:gpt-5
    reviewer_session_id: "019febe1-8983-7820-bee4-4cd62876f9b6"
    scope: >-
      exact HEAD d5b81236cb9d2998630d216c3e414cf10c65202b の source/test/L6/L8/PLAN を
      静的レビューし、identity、lifecycle、current main、stack inheritance、
      conflict precedence、projection digest、provider/branch 非 authority と
      Issue #1256 境界を確認した。blocker は 0 件。
    green_commands:
      - kind: unit_test
        command: >-
          npm exec -- vitest run tests/open-branch-plan-identity-reservation.test.ts
          tests/plan-number-uniqueness.test.ts && npm run typecheck && npm exec -- biome
          check src/lint/open-branch-plan-identity-reservation.ts
          tests/open-branch-plan-identity-reservation.test.ts && npm exec -- tsx src/cli.ts
          plan lint docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-30T13:07:10Z"
        evidence_path: tests/open-branch-plan-identity-reservation.test.ts
        output_digest: "sha256:c730a7806e71d2057262669ca5b1b0ae525a38032281f6a0faea37ef61e2231b"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-30T13:07:10Z"
  review_binding:
    reviewer: codex-hosted-tl
    reviewed_at: "2026-08-30T13:07:10Z"
    evidence_digest: "sha256:f86610552bd5a04e1efee03232dc5859df07f8d610be9ad18a7fc3e64c0ec4e4"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/open-branch-plan-identity-reservation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-open-branch-plan-identity-reservation-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/open-branch-plan-identity-reservation.ts, artifact_type: source_module }
  - { artifact_path: tests/open-branch-plan-identity-reservation.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — reservation identity／lifecycle projection" }
  - { role: qa, slot_label: "QA — conflict／inheritance／degraded／release mutation" }
---

# open branch PLAN identity reservation

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | #1255 gapと既存local gateの境界固定 | 直列 | local gate置換0 |
| 2 | typed projectionとU-OBPIR-001..007 | 直列 | targeted／mutation green |
| 3 | TL review後にeffect adapter／PR preflight／doctor／DB replayへ接続 | 直列 | 同じprojection authorityを再利用 |

本sliceはprojection semantic coreだけを実装する。GitHub write、既存PLAN再採番、branch cleanup、別counter追加は行わない。

初回検証ではbehavior 7件はgreenだったが、`npm run typecheck` が実行対象Nodeで未対応の
`Map.groupBy` を検出してredとなった。互換helperへ置換後にstrict typecheckを再実測する。
