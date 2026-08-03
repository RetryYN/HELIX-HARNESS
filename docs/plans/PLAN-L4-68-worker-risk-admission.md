---
plan_id: PLAN-L4-68-worker-risk-admission
title: "PLAN-L4-68 (add-design): worker risk admission基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Feature #92 WCC-FR-08をFR-07後に連続dispatchする"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "WCC-FR-07 sealed benchmark receiptがgreen"
contract_postconditions: "standalone finding、use policy、admit/retire、L9 oracleを固定"
contract_invariants: "critical finding平均相殺0、用途別decision、根拠なしeffort固定0"
contract_failures: "critical相殺、全用途一括admit、unsealed evidence、effort固定"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存receipt/digestを再利用するpure service一件、DB/workflow/provider fork 0"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — 用途別admission基本設計" }
  - { role: qa, slot_label: "QA — L9 critical非相殺oracle" }
  - { role: tl, slot_label: "TL — FR-07/08境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires: [docs/plans/PLAN-L7-504-worker-blind-benchmark.md]
  blocks: [docs/plans/PLAN-L5-94-worker-risk-admission.md]
+left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T21:15:44Z"
  review_binding: { reviewer: "Claude Code / independent AI-B", reviewed_at: "2026-08-03T21:15:44Z", evidence_digest: "sha256:3906aaa091589d5203c007c8bdf4f47537ae681afa82354028466777c7261204" }
  entries: []
review_evidence:
  - reviewer: "Claude Code / independent AI-B"
    review_kind: cross_agent
    reviewed_at: "2026-08-03T21:15:44Z"
    tests_green_at: "2026-08-03T21:23:58Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: claude-opus-5
    scope: "PR #380 exact HEAD 4067e811でcross-risk最小score、decision reason 7/7、risk provenance、design/PLAN status境界を再監査し、WCC-FR-08の設計・実装finding全件解消を確認。PR全体は追随artifact 2件のCI blockerだけを理由にblock。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/380#issuecomment-5171814471"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/worker-isolation-broker.test.ts tests/design-reality-binding.test.ts --pool=forks --maxWorkers=1", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T21:23:58Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:645e7b0e74a329488640540767762f7bc374c7b99502418ac0820089f54869f6", result: "2 files / 46 passed / 1 skipped" }
---

# PLAN-L4-68: worker risk admission基本設計

WCC-FR-08だけをL4/L9へ降下する。
