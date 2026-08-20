---
plan_id: PLAN-L7-638-xhigh-reasoning-effort-schema
title: "PLAN-L7-638 (impl): xhigh reasoning effortをcurrent schemaへ追加する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-EFFORT-001
responsibility_owner: codex-native-worker-effort-schema
engineering_discipline_required: true
change_slice: atomic
refactor_step: extend_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence: []
entry_signals:
  - "po_directive:Codex native workerのreasoning effortをxhighへ固定する"
agent_slots:
  - { role: se, slot_label: "SE — effort exact setと適応ladder" }
  - { role: qa, slot_label: "QA — schema／validator／境界oracle" }
contract_preconditions: "CNW-FR-001とCNW-R-02がcurrent Requirement IR refinementへ投影されている"
contract_postconditions: "ReasoningEffortの全current consumerがlow／medium／high／xhighを同じexact setとして扱う"
contract_invariants: "model identity、pricing、spawn admission、historical receiptを本sliceで変更しない"
contract_failures: "xhighのschema拒否、validator drift、high上限据え置き、xhigh超過をfail-closeする"
tdd_red_required: true
red_test: "tests/team-schema.test.tsとtests/model-effort.test.tsでxhigh受理／ladder境界を先行固定する"
complexity_effect: net_neutral
complexity_justification: "既存4 consumerのexact setと1本の適応ladderを同じvalueへ同期する"
removal_trigger: "ReasoningEffortがversioned external registryへ完全移行し本exact setが生成projectionになった時"
parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md
pair_artifact: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L3-63-codex-native-worker-routing.md
  blocks:
    - issue:624-model-registry
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-001, test_path: tests/team-schema.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-002, test_path: tests/model-effort.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, oracle_id: U-XHIGH-003, test_path: tests/model-registry.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/xhigh-reasoning-effort-schema.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/team.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-policy.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-effort.ts, artifact_type: source_module }
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/team-schema.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-effort.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-registry.test.ts, artifact_type: test_code }
---

# PLAN-L7-638: xhigh reasoning effort schema

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | effort exact setの全consumerを棚卸し | runtime exact setが列挙される |
| 2 | schema／policy／registry validatorへxhighを追加 | 同じ4値を受理する |
| 3 | adaptive ladderへxhigh境界を追加 | high→xhigh、xhigh上限、xhigh→highを固定する |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD review | blocker 0 |

## 非対象

Luna model identity、価格、standard effort、spawn admission、Terra／Sol route退役は後続PRで扱う。
