---
plan_id: PLAN-L7-497-worker-descriptor-admission
title: "PLAN-L7-497 (add-impl): worker descriptor admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-03 Feature #92 Issue #225 WCC-FR-01をTDD実装する"
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L6-94がsource projection、digest、resolver、stale predicateをpair freezeする"
contract_postconditions: "WCC-FR-01の起動前admission decisionが13 executable oracleで決定的に成立する"
contract_invariants: "source write 0、spawn 0、I/O 0、新永続registry 0、後続WCC責務混載0"
contract_failures: "13 U-WDAの各mutationが最低1 executable testをredにする"
tdd_red_required: true
red_at: "2026-08-03T01:08:00+09:00"
green_at: "2026-08-03T01:15:24+09:00"
mutation_oracle_evidence: "tests/worker-descriptor-admission.test.ts::U-WDA-001..013でunknown key、version/capability、digest forge、identity drift、0/複数/inactive、source/snapshot drift、同一descriptor/source差分のsort tie、stale、I/O依存のseeded mutantsをkilled"
complexity_effect: net_negative
complexity_justification: "pure production module 1件、persistent state／I/O／workflow 0でsource別判断を共通decisionへ縮約する"
removal_trigger: "not_applicable: compatibility layerや重複ownerを追加しない"
parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md
pair_artifact: docs/test-design/helix/L8-worker-descriptor-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-001, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-002, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-003, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-004, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-005, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-006, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-007, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-008, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-009, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-010, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-011, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-012, test_path: tests/worker-descriptor-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-descriptor-admission.md, oracle_id: U-WDA-013, test_path: tests/worker-descriptor-admission.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure source projection／resolver／decision実装" }
  - { role: qa, slot_label: "QA — 13 executable mutation oracle" }
  - { role: tl, slot_label: "TL — L5 fidelityとWCC-FR-02以降の非混載監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-497-worker-descriptor-admission.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worker-descriptor-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-descriptor-admission.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-94-worker-descriptor-admission.md
  requires:
    - docs/plans/PLAN-L6-94-worker-descriptor-admission.md
    - docs/design/helix/L5-detail/worker-descriptor-admission.md
    - docs/plans/PLAN-L4-60-worker-descriptor-admission.md
    - docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-02T16:15:24Z"
  review_binding:
    reviewer: "Codex independent reviewer / gpt-5.6-terra"
    reviewed_at: "2026-08-02T16:53:04Z"
    evidence_digest: "sha256:efa38a4383d25538ebf796f9d63b2f9642420a281ccf913bb6c50b46ac466b96"
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-02T16:53:04Z"
    tests_green_at: "2026-08-02T16:53:04Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "PR #355 HEAD ebfa49ece8e75c6dc9bede42635feeaa16d25880をread-only再照合。WCC-FR-01の19-path exact scope、source実在性、identity/capability、digest連鎖、decision forge、stale、13 oracle、後続非混載を確認。Critical/High/Medium 0、content blocker 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-descriptor-admission.test.ts tests/worker-descriptor-admission-design.test.ts tests/worker-descriptor-admission-detail-design.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-02T16:53:04Z", evidence_path: tests/worker-descriptor-admission.test.ts, output_digest: "sha256:55a9beac5c3372af0c1a4f6b2e2aa58a8757b20e6d972287450aea4087afaa29", result: "3 files / 25 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit --pretty false", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-02T16:53:04Z", evidence_path: src/runtime/worker-descriptor-admission.ts, output_digest: "sha256:de9f3a3e20bc6727d81567c2067302d474f6870d3ae848bc5b118b4db1058ce6", result: "exit 0; stdout empty" }
---

# PLAN-L7-497: worker descriptor admission実装

1. Red: production module未存在で13 executable oracleをmodule resolution failureにする。
2. Green: strict parser、2 source projection、snapshot canonicalizer、resolver、decision、stale predicateをpure moduleへ最小実装する。
3. Refactor: canonical JSON、digest payload、failure orderを共有helperへ集約しI/Oを増やさない。
4. 独立AI-B content review後、targeted green、full CI、DB convergence、exact-HEAD reviewを一巡してmergeする。
5. WCC-FR-02以降のwrapper／sandbox／receiptを本PRへ混載しない。
