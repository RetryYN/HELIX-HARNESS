---
plan_id: PLAN-RECOVERY-1437-drive-passage-catalog-authority
title: "workflow-model passage certificateをcurrent catalog authorityへ移行する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 1437
behavior_contract_id: CURRENT-WORKFLOW-PASSAGE-IDENTITY-001
responsibility_owner: workflow-classification-generated-catalog
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "current workflow identityのcertificate consumerをcatalogへ移行する限定sliceであり、要求本文の意味を変更しない。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "drive-model-passageが旧Drive model／entry modeの固定10値をcurrent必須集合として参照し、current catalogを読んでいない"
contract_postconditions: "passage certificateの必須identity集合をgenerated catalogから取得し、旧identityはcurrent authorityとして拒否する"
contract_invariants: "catalogはregistryからの決定的projectionであり、旧inventoryからcurrent identityを推測しない。Forward targetとresidual statusの検査を維持する"
contract_failures: "catalog未登録identity、旧Drive model identity、current identityの欠落、certificate文書の欠落、Forward／residual証跡の欠落を受理しない"
tdd_red_required: true
red_at: "2026-09-10T18:47:17+09:00"
green_at: null
mutation_oracle_evidence: "2026-09-10T18:49:32+09:00にcurrentWorkflowModelPassageIdentities()を旧Drive modelの固定10値へ一時変異した。tests/drive-model-passage.test.tsを実行し、U-DMP-001、U-CAT1437-003、U-DMP-003が各々失敗（3 failed / 3 passed、exit 1）となり、current catalog authorityを参照しない退行を検出した。変異を復元後、同テスト6 passed／exit 0を再確認する。"
complexity_effect: net_negative
complexity_justification: "旧固定集合の重複定義を削除し、既存generated catalogのcurrent identity取得へ集約する"
removal_trigger: "passage certificate consumerがcurrent typed authorityへ収束し、旧certificate表のcurrent参照が0になった時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md
pair_artifact: docs/test-design/helix/L8-drive-model-passage-catalog-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-CAT1437-003, test_path: tests/drive-model-passage.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-DMP-001, test_path: tests/drive-model-passage.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-DMP-002, test_path: tests/drive-model-passage.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-DMP-002b, test_path: tests/drive-model-passage.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-DMP-003, test_path: tests/drive-model-passage.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, oracle_id: U-DMP-004, test_path: tests/drive-model-passage.test.ts }
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
    - issue:865
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1437-drive-passage-catalog-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-drive-model-passage-catalog-authority-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/lint/drive-model-passage.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-model-passage.test.ts, artifact_type: test_code }
  - { artifact_path: docs/plans/PLAN-L3-04-upstream-schedule-reconciliation.md, artifact_type: markdown_doc }
agent_slots:
  - { role: aim, slot_label: "AIM — current／legacy workflow identity責務境界の監査" }
  - { role: se, slot_label: "SE — current catalogからpassage identityを取得" }
  - { role: qa, slot_label: "QA — legacy identity混入と欠落の反例" }
  - { role: tl, slot_label: "TL — #1437／#865の後続移管境界" }
review_evidence: []
---

# workflow-model passage certificateをcurrent catalog authorityへ移行する

## 目的

#1437で確認された、旧Drive model固定集合がcurrent authorityのように扱われる問題のうち、passage
certificate consumerを一つだけcurrent generated catalogへ移行する。旧mode／route inventoryは
compatibility観測へ隔離し、旧engineやDB列の物理削除は行わない。

## 受入条件

1. 必須identity集合が`currentWorkflowModelIds()`から取得される。
2. 旧Drive model表をcurrent certificateとして受理しない。
3. current identity表の各行でForward targetとresidual statusを検査する。
4. #1437の後続であるDB物理移行、route-map consumer移行、旧engine退役をこのsliceの完了へ読み替えない。
5. current HEADでtargeted test、typecheck、PLAN lint、独立review、fresh CI、DB convergence、read-afterを確認するまで完了を主張しない。
