---
plan_id: PLAN-L7-491-design-template-json-authority
title: "PLAN-L7-491 (add-impl): Design Template JSON純粋コア"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-31 Design Template JSON authorityをL7 TDDへ降下する"
created: 2026-07-31
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 290
engineering_discipline_required: true
behavior_contract_id: DESIGN-TEMPLATE-JSON-AUTHORITY
responsibility_owner: design-template-json-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L6-86が5 pure function、stable finding、capacityとU-DTJ-001..017をfreezeする"
contract_postconditions: "template/registry/applicability/shadow/viewのpure validationが17 oracleで成立する"
contract_invariants: "filesystem/network/DB write 0、current L1-L12 pairだけを受理し、legacy authority昇格を拒否する"
contract_failures: "schema、identity、predicate、trace、pair、measurement、digest、parity、capacity違反をstable findingでfail-closeする"
tdd_red_required: true
red_at: "2026-07-31T09:42:02Z"
green_at: "2026-07-31T09:45:32Z"
mutation_oracle_evidence: "tests/design-template-authority.test.tsのU-DTJ-001..017でunknown property、unsafe integer、legacy pair、trace/measurement欠落、digest drift、registry missing、owner重複、deprecated lifecycle欠落、missing fact、空all、unmapped atom、legacy昇格、reviewなしdelta、view digest drift、capacity、入力mutationを注入し全反例をkillした。targeted 7/7 green、typecheck green"
complexity_effect: justified_positive
complexity_justification: "5 pure functionを単一moduleへ閉じ、class、DB、CLI、writer、dependencyを追加しない"
removal_trigger: "schema major cutover後にv1 consumer=0になった時点"
parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md
pair_artifact: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-001, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-002, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-003, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-004, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-005, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-006, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-007, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-008, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-009, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-010, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-011, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-012, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-013, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-014, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-015, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-016, test_path: tests/design-template-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-017, test_path: tests/design-template-authority.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure core実装" }
  - { role: qa, slot_label: "QA — 17 mutation oracle" }
  - { role: tl, slot_label: "TL — authority/side-effect/最小code監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-491-design-template-json-authority.md, artifact_type: markdown_doc }
  - { artifact_path: src/design/design-template-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/design-template-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-86-design-template-json-authority.md
  requires:
    - docs/design/helix/L6-function-design/design-template-json-authority.md
    - docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-31T11:13:59Z"
    tests_green_at: "2026-07-31T11:11:48Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #308 HEAD c1cad5d30c587a09dadd75dc255fce7ce34f7d6dをclean detached worktreeで独立review。5 pure function、副作用0、U-DTJ-001..017、current L1-L12 pair、三値applicability、capacity、semantic digest、module boundary、architecture接続を確認しblocker 0。Actions run 30624707340 terminal green、DB projection/replayとcheckpoint/replay一致、converged=true。Reverse backfill、Portfolio Planner、Design Instanceは本承認に含めない。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/308#issuecomment-5142250282"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run", runner: ci, scope: full, exit_code: 0, completed_at: "2026-07-31T11:11:48Z", evidence_path: tests/design-template-authority.test.ts, output_digest: "sha256:55bde6dba261f8f2e90f914f733fe8fbb6212faed0f5d889799587f383d6a494", result: "Actions run 30624707340 terminal green。windows smoke、typecheck、DB rebuild x2、3178 tests、Biome、doctor green。output_digestはClaude review receipt digest" }
---

# PLAN-L7-491: Design Template JSON純粋コア

1. Red: U-DTJ-001..017を実テストとして追加し、module未実装で失敗を記録する。
2. Green: 5 pure functionを単一moduleへ最小実装する。
3. Refactor: canonical JSON/digestを既存ownerへ委譲し、永続化・CLI・writerを追加しない。
