---
plan_id: PLAN-L5-93-worker-blind-benchmark
title: "PLAN-L5-93 (add-design): worker blind benchmark詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 WCC-FR-07をFR-09後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-67がcomponentとblind boundaryを固定"
contract_postconditions: "definition/packet/judge output/host observation/receipt exact schemaと11 failureを固定"
contract_invariants: "weight合計100、pre-execution binding、identity blind、sealed provenance、stable ranking、FR-08非混載"
contract_failures: "11 failureのfixtureとmutation witnessをL8へ束縛"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "definition/packet/receipt capabilityと既存broker/output sealを再利用し永続ledgerを持たない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — exact schema/failure" }
  - { role: qa, slot_label: "QA — reachability" }
  - { role: tl, slot_label: "TL — design refactor gate" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-67-worker-blind-benchmark.md
  blocks:
    - docs/plans/PLAN-L6-101-worker-blind-benchmark.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T17:58:28Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T17:58:28Z", evidence_digest: "sha256:3d0f6ee441111f999e8e923b1e3f4b0e3995213c0f72dd5e5174f31523f2ee91" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T17:58:28Z"
    tests_green_at: "2026-08-03T17:58:28Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "definition→candidate launch、packet→judge launchのopaque capability因果束縛、broker host observation、blind provenance、copy/unbound/cross-task/cross-risk/different-packet/mutation oracleを監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: smoke, command: "git diff --check HEAD^ HEAD", runner: bash, scope: changed-files, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: src/runtime/worker-blind-benchmark.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "出力0 byte。whitespace errorなし。" }
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-blind-benchmark.test.ts tests/worker-isolation-broker.test.ts tests/worker-review-receipt.test.ts tests/design-reality-binding.test.ts -t 'U-WBB-00[1-5]|U-DRB-021|U-WRR-00[1-8]' --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:8d0e5228ddb6607c46a7d5dd9120c57449b3c72d3199e5583e3e29b4ab1cd0fd", result: "4 files / 13 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-03T17:58:28Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "TypeScript error 0。" }
---

# PLAN-L5-93: worker blind benchmark詳細設計

blind scoreとeffective costを同じselection receiptへ固定する。
