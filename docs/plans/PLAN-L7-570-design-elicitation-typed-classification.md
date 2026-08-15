---
plan_id: PLAN-L7-570-design-elicitation-typed-classification
title: "PLAN-L7-570 (impl): design elicitationをtyped workflow分類へ移行する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.3
  registry_source_digest: sha256:240060052c365a6c4f339bd4b634e1c8cb2a194f33e489ed36672338a91f6c8b
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #694 design elicitation legacy mode consumer migration"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: DESIGN-ELICITATION-TYPED-CLASSIFICATION-001
responsibility_owner: design-elicitation
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "design elicitationがrouteSignalToModeとdesign-bottomup mode identityをcurrent outputへ使用している"
contract_postconditions: "SCREEN_DESIGN、backend_derived、DISCOVERY_POCを別軸のtyped identityとして返す"
contract_invariants: "specialist workflow、trigger condition、case-driven modelを同一modeへ畳み込まず、current outputへmode／modelを再出力しない"
contract_failures: "design_uncertainがDISCOVERY_POCへ一意に分類できない場合はdiscoveryを生成せずfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存oracleがdesign-bottomup mode出力とrouteSignalToMode依存を固定しており、旧identity再出力を既存Redとして実証済み"
complexity_effect: net_negative
complexity_justification: "旧mode consumerとDriveTddFit mode taxonomy assertionを削除し、requirements-owned typed routerへ一本化する"
removal_trigger: "design elicitation consumerがversioned successorへ置換される場合に本adapter-free compositionを更新する"
parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md
pair_artifact: docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-001, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-002, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-003, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-004, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed classification composition境界" }
  - { role: qa, slot_label: "QA — legacy identity再出力とaxis混同反例" }
  - { role: tl, slot_label: "TL — requirements registryとconsumer migration境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/workflow/design-elicitation.ts, artifact_type: source_module }
  - { artifact_path: tests/design-elicitation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# design elicitation typed分類移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | legacy mode consumerをtyped routerへ置換 | [直列] | U-DESIGNELIC-001 green |
| 2 | specialist workflow／trigger／case modelを別軸出力 | [直列] | U-DESIGNELIC-002..003 green |
| 3 | targeted、full CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

旧routing export自体の削除、DB projection、doctor全surface gateは後続原子的sliceで扱う。
