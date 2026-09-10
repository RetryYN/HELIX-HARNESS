---
plan_id: PLAN-RECOVERY-1713-workflow-classification-catalog-authority
title: "旧identity集合からcurrent classificationとdrive registration authorityへの分離"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1437
behavior_contract_id: LEGACY-CURRENT-IDENTITY-BOUNDARY-001
responsibility_owner: workflow-classification-generated-catalog-and-drive-db-registration
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "current classification registryから生成したcatalogが存在し、旧drive/mode inventoryがcurrent identity集合とregistration gateの代用になっている"
contract_postconditions: "current identity集合はcatalogから取得し、旧route/mode inventoryは意味authorityおよびcurrent registrationの必須条件として参照しない"
contract_invariants: "catalogはregistryの決定的projectionであり、legacy identityをcurrent outputへ再出力せず、unknown typed identityは推測せずfail-closeする"
contract_failures: "旧10モデル集合への依存、common route identityへの畳み込み、catalogの手編集、旧modeによる補完、未知identityの受理を許可しない"
tdd_red_required: true
mutation_oracle_evidence: "U-CAT1437-001はcurrent identity集合をlegacy route inventoryへ差し替える変異で失敗し、U-DDB1437-001/002は旧mode欠落とunknown typed identityをそれぞれ反例として拘束する。実測値は独立reviewで再確認する。"
complexity_effect: net_negative
complexity_justification: "current identity集合とregistration照合をtyped catalog境界へ集約し、旧集合の重複必須判定をcurrent判定から外す"
removal_trigger: "current catalogのconsumerが単一のtyped authorityへ収束し、legacy inventoryのcurrent参照が0になった時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-CAT1437-001, test_path: tests/workflow-classification-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DDB1437-001, test_path: tests/drive-db-registration.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DDB1437-002, test_path: tests/drive-db-registration.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  parent: issue:1437
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md
  references:
    - issue:1437
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1713-workflow-classification-catalog-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-db-registration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/drive-registration.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-catalog.test.ts, artifact_type: test_code }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — current catalogとlegacy identityのauthority境界を照合" }
  - { role: se, slot_label: "SE — catalog由来のcurrent identity集合取得を実装" }
  - { role: qa, slot_label: "QA — legacy集合参照とunknown identityの反例を検証" }
  - { role: tl, slot_label: "TL — #1437のcatalog authorityとDB registration boundaryを一つの移行sliceとして検収" }
review_evidence: []
---

# current classificationとdrive registration authorityへの分離

## 目的

旧drive/mode inventoryをcurrent identityの意味authorityおよびregistration gateとして扱う経路を止め、requirements registryから生成されたclassification catalogをcurrent identity集合とtyped registration照合の入力にする。

## 範囲

- catalogからworkflow model IDと全typed identity IDを決定的に取得する。
- 旧route/mode inventoryは互換参照として残し、current判定へ昇格させない。
- drive registrationはcollectorからworkflow target identityを取得し、current catalogへ照合する。
- legacy modeの欠落をcurrent登録失敗にせず、unknown typed identityはfail-closeする。
- catalog projectionの既存identity policy、digest、legacy非出力契約を維持する。

## 対象外

DB物理schemaの移行、route-map consumerの退役、legacy mode列の削除、drive-model passageの変更、配布・runtime経路の変更は別sliceとする。

## 受入条件

1. current identity集合がcatalog entityから取得され、旧inventoryへ依存しない。
2. legacy modeが欠落してもcurrent typed identityが有効ならregistrationを合格させる。
3. unknown typed identityはfail-closeし、旧modeを根拠に補完しない。
4. current catalogのlegacy/common route identity禁止とmanual drift検査を維持する。
5. `U-CAT1437-001` と `U-DDB1437-001/002` が実テスト・test-design・このPLANへ一意に束縛される。
6. current HEADのCI・独立review・DB projection確認が完了するまで完了を主張しない。
