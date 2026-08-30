---
plan_id: PLAN-L7-705-universal-improvement-observation-normalizer
title: "PLAN-L7-705 (add-impl): Universal Improvement観測正規化とbaseline分離を実装する"
kind: add-impl
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:Issue #1232 UIL-02 観測正規化とbaseline比較を実装する"
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1232
behavior_contract_id: UNIVERSAL-IMPROVEMENT-OBSERVATION-NORMALIZER-001
responsibility_owner: universal-improvement-observation-normalizer
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "confirmed UIL-R-02を実装し、既存UIL-01 admissionとdigest authorityを変更しない。"
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "#1231のrequirements-owned source registryとrepository-bound admissionがcanonical merge可能である"
contract_postconditions: "admit済みsource eventだけをstable identity、baseline／observed／predicted、causation、confidence、counterevidenceへ決定的に正規化する"
contract_invariants: "read-only、入力順非依存、baseline／observed／predicted非混同、AI非依存、部分成功なし、authority writeなし"
contract_failures: "forged source、wrong revision、invalid baseline／prediction／confidence／digest、duplicate event、unresolved causationをfail-closeする"
tdd_red_required: true
red_test: "U-UILNORM-001..006で未実装module、forged registry、baseline混同、順序依存、duplicate／causation不整合を検出する"
green_at: 2026-08-30T11:08:10+09:00
mutation_oracle_evidence: "U-UILNORM-003..007でregistry proof偽装、wrong revision、missing baselineへのrevision混入、duplicate event、unresolved causation、invalid confidence／digest／correlation、outer／nested input破壊を変異し、throwへ縮退せずfail-closeする。"
complexity_effect: justified_positive
complexity_justification: "UIL-01 admissionを再利用し、後続finding/candidate責務を混載せず、正規化境界を一つ追加する。"
removal_trigger: "後継normalized event schemaへ全consumerが移行し、本schemaのeventが0件になった時。"
parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-observation-normalizer-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-001, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-002, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-003, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-004, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-005, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-006, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-007, test_path: tests/universal-improvement-observation-normalizer.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — admitted source、stable event、baseline separation" }
  - { role: qa, slot_label: "QA — forgery／missing／duplicate／causation mutation" }
  - { role: tl, slot_label: "TL — UIL-01再利用と後続candidate境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-705-universal-improvement-observation-normalizer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-improvement-observation-normalizer-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/universal-improvement-observation-normalizer.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-improvement-observation-normalizer.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires:
    - docs/plans/PLAN-L7-703-universal-improvement-source-registry.md
  blocks:
    - issue:1211
references:
  - issue:1210
  - issue:1231
  - issue:1232
---

# Universal Improvement観測正規化とbaseline分離

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | UIL-R-02とUIL-01 admissionの境界を固定 | 直列 | source authority再実装0 |
| 2 | event schema／validator／normalizer実装 | 直列 | U-UILNORM-001〜006 green |
| 3 | 独立review、CI、Reverse fullback | 直列 | current HEAD receiptとmain read-after |

本PLANは#1231をstack baseとし、親がcanonical mergeするまでReady化しない。
