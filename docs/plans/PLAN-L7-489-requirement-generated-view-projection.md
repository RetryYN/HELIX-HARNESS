---
plan_id: PLAN-L7-489-requirement-generated-view-projection
title: "PLAN-L7-489 (add-impl): Requirement generated view／DB shadow projection"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-30 JSON generated viewとharness.db shadow projectionを閉じる"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 286
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-IR-GENERATED-VIEW-PROJECTION
responsibility_owner: requirement-ir-generated-view-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-90がloader、round-trip、DB shadow table／projection境界をpair freezeする"
contract_postconditions: "generated view byte再現、normalized root digest一致、DB 273 row rebuild x2、stale/orphan 0が成立する"
contract_invariants: "shadow_noncanonical、legacy Markdown current、別DB 0、raw requirement本文のDB複製0"
contract_failures: "path escape、manifest/shard drift、record欠落、canonical過大claim、DB row drift／orphanをfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T16:06:00Z"
green_at: "2026-07-30T16:09:02Z"
mutation_oracle_evidence: "tests/requirement-generated-view.test.ts のU-RGV-004でshard record改変、generated marker除去、repository path escapeを注入し、digest mismatch／record count mismatch／escape拒否で失敗（red）させて各mutationをkillする。tests/requirement-generated-view-db.test.ts のU-RGV-007はowner/oracle LEFT JOIN orphanを0に固定する。final targeted run U-RGV-001..007は7/7 green"
complexity_effect: justified_positive
complexity_justification: "pure loader/generator/parser、生成adapter、既存schema v40の1 table／1 indexを追加するが、別DB／service／dependencyを増やさない"
removal_trigger: "PR5 canonical cutover後にshadow固有authority／projectionがcanonical readerへ置換されconsumer 0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-001, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-002, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-003, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-004, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-005, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-006, test_path: tests/requirement-generated-view-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-007, test_path: tests/requirement-generated-view-db.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — generated view／DB projection実装"
  - role: qa
    slot_label: "QA — semantic round-trip／rebuild x2／orphan mutation"
  - role: tl
    slot_label: "TL — shadow authorityとschema revision独立review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-489-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: src/requirements/requirement-generated-view-generator.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-generated-view.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-shadow.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  requires:
    - docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  references:
    - generated/requirements-ir/manifest.json
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
---

# PLAN-L7-489: 要求・要件生成ビュー／DB shadow投影

1. Red: path escape、marker欠落、owner/oracle orphanを反例化する。
2. Green: loader、human view、semantic parser、schema v40 shadow projectionを最小実装する。
3. Refactor: digest/root calculationをPR3 ownerへ集約し、raw payloadと別DBを追加しない。

PLAN-L6-90 pair freeze、U-RGV-001..007、typecheck、full CI、DB convergenceの成立と、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
