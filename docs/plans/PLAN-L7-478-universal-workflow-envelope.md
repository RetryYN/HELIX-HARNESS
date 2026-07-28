---
plan_id: PLAN-L7-478-universal-workflow-envelope
title: "PLAN-L7-478 (add-impl): Universal Workflow envelope admission"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 Issue #184 Universal Workflow envelopeをTDD実装する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 184
engineering_discipline_required: true
behavior_contract_id: U-UWENV-001
responsibility_owner: universal-workflow-envelope
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9、L5/L8、L6/L7のschema/authority/oracleがdraft pairとして存在する"
contract_postconditions: "strict Zod schemaとsemantic validatorが完全fixtureだけをactivation可能にする"
contract_invariants: "AI/adapter write authorityを追加せず、invalid入力でside effect 0"
contract_failures: "unknown version/field、欠落、参照、coverage、digest、blocking unresolvedを拒否する"
tdd_red_required: true
red_at: "2026-07-28T10:05:00+09:00"
green_at: "2026-07-28T10:11:09+09:00"
mutation_oracle_evidence: "tests/universal-workflow-envelope.test.tsがloop max、data retention、5出力、digest、runtime version欠落変異を個別にkillする"
complexity_effect: justified_positive
complexity_justification: "Zod既存依存とpure validatorだけで後続4sliceの共通schemaを提供する"
removal_trigger: "version cutover時にconsumer=0とdual-greenを確認して旧schemaを除去する"
parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md
pair_artifact: docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-001, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-002, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-003, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-004, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-005, test_path: tests/universal-workflow-envelope.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — schema/semantic validator" }
  - { role: qa, slot_label: "QA — exact executable oracle" }
  - { role: tl, slot_label: "TL — authority/minimality convergence" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-478-universal-workflow-envelope.md, artifact_type: markdown_doc }
  - { artifact_path: src/workflow/universal-workflow-envelope.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-workflow-envelope.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-83-universal-workflow-envelope.md
  requires: []
  references:
    - docs/plans/PLAN-L6-83-universal-workflow-envelope.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks: []
---

# PLAN-L7-478: Universal Workflow envelope受入

## 完了条件

- U-UWENV-001〜005、typecheck、Biome、PLAN gateがgreen。
- 独立AI-Bがschemaの過不足、write authority、後続責務分離を確認する。
