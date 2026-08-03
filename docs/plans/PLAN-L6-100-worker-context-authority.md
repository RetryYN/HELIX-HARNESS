---
plan_id: PLAN-L6-100-worker-context-authority
title: "PLAN-L6-100 (add-design): worker context authority関数設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
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
contract_preconditions: "PLAN-L5-92がpacket/failure順序を固定"
contract_postconditions: "attest/compile/verify/adapter/brokerのtyped APIを固定"
contract_invariants: "Node write authorityのみ、provider fork/DB/network 0"
contract_failures: "unsealed capabilityまたはsame-HEAD/schema/payload再検証failure"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存adapter/broker join pointへ一回ずつ接続"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L6-worker-context-authority-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed API" }
  - { role: qa, slot_label: "QA — L7 oracle" }
  - { role: tl, slot_label: "TL — implementation boundary" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-worker-context-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-92-worker-context-authority.md
  requires:
    - docs/design/helix/L5-detail/worker-context-authority.md
  blocks:
    - docs/plans/PLAN-L7-503-worker-context-authority.md
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

# PLAN-L6-100: worker context authority関数設計

実装可能な型、評価順、broker joinを固定する。
