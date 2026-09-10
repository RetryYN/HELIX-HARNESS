---
plan_id: PLAN-RECOVERY-1714-drive-registration-current-authority
title: "drive registrationのcurrent identity判定をtyped catalogへ移管"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1437
behavior_contract_id: LEGACY-DRIVE-REGISTRATION-BOUNDARY-001
responsibility_owner: drive-db-registration
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "drive_runsにlegacy modeとtyped workflow identityが併存し、current registration gateが旧mode集合を必須化している"
contract_postconditions: "legacy drive/mode行をcompatibility inventoryとして保持し、typed workflow target identityだけをcurrent catalogへ照合する"
contract_invariants: "legacy inventory、current catalog、DB projectionを混同せず、unknown typed identityはfail-closeする"
contract_failures: "旧mode欠落をcurrent failureへ読み替えること、unknown identityの受理、DB物理schemaの無断変更を拒否する"
tdd_red_required: true
mutation_oracle_evidence: "U-DDB1437-001/002は旧modeを欠落させてもcurrent登録を成功させ、unknown typed identityをfail-closeする反例を保持する。実測値は独立reviewで再確認する。"
complexity_effect: net_negative
complexity_justification: "旧10モデルの重複必須判定を除去し、current catalog identity照合へ集約する"
removal_trigger: "drive/mode compatibility consumerが0となり、current typed projectionとDB schema移行の独立検収が完了した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md
verification_bindings:
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
    - docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md
  references:
    - issue:1437
    - docs/plans/PLAN-RECOVERY-1713-workflow-classification-catalog-authority.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1714-drive-registration-current-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/drive-db-registration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/drive-registration.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — legacy modeとtyped registrationのauthority境界を照合" }
  - { role: se, slot_label: "SE — drive registration collectorとcurrent identity判定を移管" }
  - { role: qa, slot_label: "QA — legacy欠落、unknown typed identity、DB projectionを検証" }
  - { role: tl, slot_label: "TL — #1437のDB物理移行を後続へ分離" }
review_evidence: []
---

# drive registrationのcurrent identity判定

## 目的

`drive-db-registration` が旧mode集合の存在をcurrent登録の必須条件として扱う二重 authorityを解消する。旧行は履歴・互換inventoryとして保持し、current判定はtyped workflow identityとcatalogへ限定する。

## 範囲

- `workflow_target_id` をcollectorから取得する。
- current catalogに存在するtyped identityだけを受理する。
- 旧mode行の不足をcurrent登録失敗にしない。

## 対象外

DB列の物理削除・移行、legacy route-map consumerの退役、drive-model passageの証明書構造変更は本sliceに含めない。

## 受入条件

1. legacy modeが一部または全て欠落しても、current typed identityが有効なら合格する。
2. unknown typed identityはfail-closeし、旧modeを根拠に補完しない。
3. DB rebuild/replayの既存接続とlegacy inventory保持を壊さない。
4. `U-DDB1437-001/002` が実テストとtest-designへ一意に束縛される。
