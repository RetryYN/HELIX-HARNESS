---
plan_id: PLAN-L7-480-specialist-agent-registry
title: "PLAN-L7-480 (add-impl): 専門agent registry admission"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:2026-07-28 駆動モデルの専門工程経路と担当agent authorityを整備する"]
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 190
engineering_discipline_required: true
behavior_contract_id: UTH-FR-033
responsibility_owner: specialist-agent-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9、L5/L8、L6/L7 pair draftが存在する"
contract_postconditions: "repository registryだけがadmitted team候補を返す"
contract_invariants: "worker/verifier authorityを分離しside effect 0"
contract_failures: "schema/digest/allowlist/capability/axis/runtime独立性欠落を拒否する"
tdd_red_required: true
red_at: "2026-07-28T10:58:00+09:00"
green_at: "2026-07-28T10:59:50+09:00"
mutation_oracle_evidence: "tests/specialist-agent-registry.test.tsがdefinition digestとprovider独立性の変異をkillする"
complexity_effect: justified_positive
complexity_justification: "既存allowlistをimportし、新config/loader/analyzer/selectorだけで統合する"
removal_trigger: "runtime rosterへatomic統合しconsumer=0になった時点"
parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md
pair_artifact: docs/test-design/helix/L8-specialist-agent-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-001, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-002, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-003, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-004, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-005, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-006, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-007, test_path: tests/specialist-agent-registry.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — registry admission実装" }
  - { role: qa, slot_label: "QA — digest/independence mutation" }
  - { role: tl, slot_label: "TL — cross-provider収束review" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-480-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: config/specialist-agent-registry.json, artifact_type: config }
  - { artifact_path: src/runtime/specialist-agent-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/specialist-agent-registry.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-85-specialist-agent-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L6-85-specialist-agent-registry.md
    - docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
  blocks: []
---

# PLAN-L7-480: 専門agent registry admission

U-SAREG-001〜004、typecheck、doctor、PLAN gateをgreenにし、独立AI-Bが既存roster再利用と
worker/verifier独立性を確認する。
