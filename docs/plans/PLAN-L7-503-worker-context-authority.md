---
plan_id: PLAN-L7-503-worker-context-authority
title: "PLAN-L7-503 (add-impl): worker context authority"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: true
entry_signals: ["po_directive:Issue #225 WCC-FR-09を連続dispatchする"]
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-100がtyped APIとbroker前検証を固定"
contract_postconditions: "U-WCP-001..010、U-WIB-015/016、U-WWA-008/009、U-DRB-019がgreen"
contract_invariants: "raw/legacy external launch 0、DB/Git/workflow write 0、FR07/08/06/lifecycle非混載"
contract_failures: "13 failureの比較/seal分岐除去が対応oracleをRedにする"
tdd_red_required: true
red_at: "2026-08-03T14:25:00Z"
green_at: "2026-08-03T14:30:34Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.ts::U-DRB-019がworker-context-packet.tsのHEAD、authority/rule、axes、scope、schema、role/lens、budget、payload、seal分岐を実source置換し、tests/worker-context-packet.test.tsの対応fixtureをRedにする。U-WIB-015/016はcontext無しとattestation後dirty authorityをbroker起動前に拒否し、U-WWA-008はCLI/team/pair/loop共通admissionのcontext無しprocess launchを拒否する"
complexity_effect: net_negative
complexity_justification: "新規module一件、既存adapter/brokerの最小join、永続surface 0"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/worker-context-authority.md
pair_artifact: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — context compiler実装" }
  - { role: qa, slot_label: "QA — executable/mutation oracle" }
  - { role: tl, slot_label: "TL — exact scope/Feature監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-001, test_path: tests/worker-context-packet.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-002, test_path: tests/worker-context-packet.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-003, test_path: tests/worker-context-packet.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-004, test_path: tests/worker-context-packet.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-005, test_path: tests/worker-context-packet.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WIB-015, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WIB-016, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WWA-008, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WWA-009, test_path: tests/worker-wrapper-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-011, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-012, test_path: tests/pair-agent.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-WCP-013, test_path: tests/orchestration/loop-bridge.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-context-authority.md, oracle_id: U-DRB-019, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: src/runtime/worker-context-packet.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/team/run.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/pair-agent.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/loop-bridge.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-context-packet.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-wrapper-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-run.test.ts, artifact_type: test_code }
  - { artifact_path: tests/pair-agent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/orchestration/loop-bridge.test.ts, artifact_type: test_code }
  - { artifact_path: tests/helpers/worker-context.ts, artifact_type: source_module }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-100-worker-context-authority.md
  blocks:
    - issue:225
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-03T16:10:49Z"
  review_binding: { reviewer: "Codex independent reviewer / gpt-5.6-terra", reviewed_at: "2026-08-03T16:10:49Z", evidence_digest: "sha256:2be5be2b065dcfc4f4b28f7ba8e76f7efabcc9cd289a5b53b2c119473ad6f261" }
  entries: []
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T16:10:49Z"
    tests_green_at: "2026-08-03T16:10:49Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "pair/team/provider/loop全execute経路のcontext必須化、欠落fieldのtyped failure、exact HEAD reattest、fixture移行、FR-07/08非混載を監査。Critical/High/Medium 0。"
    green_commands:
      - { kind: diff_check, command: "git diff --check", runner: git, scope: intent, exit_code: 0, completed_at: "2026-08-03T16:10:45Z", evidence_path: src/runtime/worker-context-packet.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "出力0 byte。whitespace errorなし。" }
      - { kind: plan_lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-503-worker-context-authority.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T16:10:49Z", evidence_path: docs/plans/PLAN-L7-503-worker-context-authority.md, output_digest: "sha256:a6f12bdab345d169ea5b56e12c6ad31c54ae8f13675cd0f6b5eb6b7e92cb44a5", result: "plan schedule/descent/vpair/reality/routing green" }
---

# PLAN-L7-503: worker context authority実装

module不在のRedから開始し、current authority→packet→adapter→brokerの唯一経路を実装する。
