---
plan_id: PLAN-RECOVERY-1713-workflow-classification-catalog-authority
title: "旧identity集合からcurrent workflow classification catalogへの分離"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1437
behavior_contract_id: LEGACY-WORKFLOW-CATALOG-AUTHORITY-001
responsibility_owner: workflow-classification-generated-catalog
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "current classification registryから生成したcatalogが存在し、旧drive/mode inventoryがcurrent identity集合の代用になっている"
contract_postconditions: "current identity集合をcatalogから取得し、旧route/mode inventoryを意味authorityとして参照しない"
contract_invariants: "catalogはregistryの決定的projectionであり、legacy identityをcurrent outputへ再出力せず、未知・曖昧なidentityは推測しない"
contract_failures: "旧10モデル集合への依存、common route identityへの畳み込み、catalogの手編集、未知identityの受理を許可しない"
tdd_red_required: true
mutation_oracle_evidence: "U-CAT1437-001はcurrent identity集合をlegacy route inventoryへ差し替える変異で失敗し、U-CAT1437-002は未登録typed workflow identityをcurrent catalogの許可集合へ差し替える変異で失敗する。current catalogのentity集合を使用する契約を拘束し、実測値は独立reviewで再確認する。"
complexity_effect: net_negative
complexity_justification: "current identity集合の取得をcatalog境界へ集約し、旧集合の重複定義をcurrent判定から外す"
removal_trigger: "current catalogのconsumerが単一のtyped authorityへ収束し、legacy inventoryのcurrent参照が0になった時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-CAT1437-001, test_path: tests/workflow-classification-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-CAT1437-002, test_path: tests/drive-db-registration.test.ts }
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
  references:
    - issue:1437
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1713-workflow-classification-catalog-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-db-registration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/drive-registration.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-catalog.test.ts, artifact_type: test_code }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, artifact_type: design }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — current catalogとlegacy identityのauthority境界を照合" }
  - { role: se, slot_label: "SE — catalog由来のcurrent identity集合取得を実装" }
  - { role: qa, slot_label: "QA — legacy集合参照とunknown identityの反例を検証" }
  - { role: tl, slot_label: "TL — #1437のcatalog authority sliceへDB consumer移行を含める" }
review_evidence: []
---

# current workflow classification catalogへの分離

## 目的

旧drive/mode inventoryをcurrent identityの意味authorityとして扱う経路を止め、requirements registryから生成されたclassification catalogをcurrent identity集合の唯一の入力にする。

## 範囲

- catalogからworkflow model IDと全typed identity IDを決定的に取得する。
- 旧route/mode inventoryは互換参照として残し、current判定へ昇格させない。
- catalog projectionの既存identity policy、digest、legacy非出力契約を維持する。
- DB registration consumerがtyped workflow identityをcurrent catalogへ照合し、legacy mode inventoryをcurrent authorityとして使わないことを保証する。

## 対象外

DB物理schemaの移行、route-map consumerの退役、legacy mode列の削除、配布・runtime経路の変更は別sliceとする。

## 受入条件

1. current identity集合がcatalog entityから取得され、旧inventoryへ依存しない。
2. current catalogのlegacy/common route identity禁止とmanual drift検査を維持する。
3. `U-CAT1437-001` が実際のテスト本文とtest-designへ一意に束縛される。
4. current HEADのCI・独立review・DB projection確認が完了するまで完了を主張しない。
5. DBに投影されたtyped workflow identityがcatalog未登録ならfail-closeし、旧`mode`列の欠落だけではcurrent greenを失敗させない。
