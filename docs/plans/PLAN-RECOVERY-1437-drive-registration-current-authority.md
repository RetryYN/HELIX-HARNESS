---
plan_id: PLAN-RECOVERY-1437-drive-registration-current-authority
title: "旧drive必須集合をcurrent classification authorityへ分離する"
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
contract_preconditions: "current classification catalogがgenerated projectionとして検証可能で、drive_runsにlegacy modeとtyped workflow identityが併存している"
contract_postconditions: "legacy drive/mode行の存在をcurrent登録の必須条件にせず、typed target identityだけをcurrent catalogへ照合する"
contract_invariants: "legacy route inventory、旧mode列、DB物理schema、current catalogの意味authorityを混同せず、projectionとlintはread-onlyのまま維持する"
contract_failures: "旧modeの欠落をcurrent failureへ読み替えること、未知のtyped identityを受理すること、legacy inventoryをcurrent identityへ昇格することを拒否する"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "旧10モデルの重複必須判定を削除し、既存current catalogのidentity照合へ集約する"
removal_trigger: "drive/mode compatibility consumerが0となり、current typed projectionとDB schema移行の独立検収が完了した時"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: tests/drive-db-registration.test.ts
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-DDBREG-007, test_path: tests/drive-db-registration.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-DDBREG-009, test_path: tests/drive-db-registration.test.ts }
  - { parent_design: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, oracle_id: U-WFCAT-005, test_path: tests/workflow-classification-catalog.test.ts }
dependencies:
  parent: issue:1437
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - PLAN-RECOVERY-1437-current-route-identity-classification
  references:
    - issue:1437
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1437-drive-registration-current-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/drive-db-registration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/drive-registration.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-catalog.test.ts, artifact_type: test_code }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — current catalogとlegacy inventoryのauthority境界" }
  - { role: se, slot_label: "SE — current catalog identity setとlegacy mode境界" }
  - { role: qa, slot_label: "QA — old mode欠落とunknown typed identityの反例" }
  - { role: tl, slot_label: "TL — DB projectionを壊さない段階移行" }
review_evidence: []
---

# 旧drive必須集合とcurrent classification authorityの分離

Issue #1437の第二slice。`REQUIRED_DRIVE_MODELS`は互換inventoryとして残すが、
`drive-db-registration`のcurrent合格条件には使用しない。current側の`workflow_target_id`は
generated classification catalogに存在するidentityだけを受理する。

本sliceでは、`drive_runs.mode`／`route_modes`の物理移行、`drive-model-passage`の証明書構造変更、
旧route-map consumerの全面退役は行わない。これらは後続の個別sliceで、利用先・後継・rollbackを
確認してから扱う。
