---
plan_id: PLAN-L7-476-drive-route-catalog-gate
title: "PLAN-L7-476 (add-impl): 全駆動モデル経路catalog gate"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 駆動モデル経路定義を機械gateで拘束する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 165
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-001
responsibility_owner: drive-route-catalog
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "drive-route-catalog.v1とrepository文書が存在する"
contract_postconditions: "catalog exact setと各参照をdoctorで再現検査する"
contract_invariants: "read-only lintとし、route選択やDB stateを暗黙変更しない"
contract_failures: "schema、exact set、kind、next route、documentのdriftをexit非0へ接続する"
tdd_red_required: true
red_at: "2026-07-28T02:55:00+09:00"
green_at: "2026-07-28T02:57:00+09:00"
mutation_oracle_evidence: "tests/drive-route-catalog.test.tsがroute削除、孤児next、不許可kind、重複signal、欠落文書のseeded反例を検出する"
complexity_effect: justified_positive
complexity_justification: "新runtimeやDB schemaを追加せず、JSON catalogと単一pure lintを既存doctorへ統合する"
removal_trigger: "workflow schemaが同じroute exact set検査を所有した時点で本lintを統合する"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-001, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-002, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-003, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-005, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-004, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-006, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-007, test_path: tests/drive-route-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — catalog validatorとdoctor配線" }
  - { role: qa, slot_label: "QA — exact setと孤児遷移mutation" }
  - { role: tl, slot_label: "TL — route意味と既存gate整合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-476-drive-route-catalog-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/mode-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/schema/route-map.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-81-drive-route-catalog.md
  requires:
    - docs/process/modes/README.md
  references:
    - docs/governance/drive-route-catalog.md
  blocks: []
---

# PLAN-L7-476: 全駆動モデル経路catalog gate

## 完了条件

- catalog validatorとdoctor hard gateがgreenになる。
- Forward／Scrum／Hybridだけでなく全entry routeの欠落が検出される。
- Add-feature Bを含むroute variantがkind／backfill規律と矛盾しない。
