---
plan_id: PLAN-L7-639-luna-worker-model-registry
title: "PLAN-L7-639 (impl): Codex current workerをLuna xhighへversion-upする"
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
behavior_contract_id: CODEX-NATIVE-WORKER-MODEL-001
responsibility_owner: codex-native-worker-model-registry
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence: []
entry_signals:
  - "po_directive:Codex native workerをLuna xhighへ移行しTerraを退役する"
agent_slots:
  - { role: se, slot_label: "SE — registry／router／team projection" }
  - { role: qa, slot_label: "QA — currentとhistorical identity分離" }
contract_preconditions: "PLAN-L7-638でxhighがcurrent effort exact setへ追加済み"
contract_postconditions: "Codex current worker、T1 route、proposal memberがLuna xhighへ一致する"
contract_invariants: "Sol parentをworker化しない。Terra historical pricing／receiptを保持し、spawn admissionを本sliceで緩和しない"
contract_failures: "Terra current fallback、Sol worker化、Luna price／effort drift、historical price削除をfail-closeする"
tdd_red_required: true
red_test: "U-LUNA-001..003で旧Terra／medium projectionを先行検出する"
complexity_effect: net_neutral
complexity_justification: "既存model registry SSoTからrouter／team projectionを一方向更新する"
removal_trigger: "model registryがversioned generated authorityへ移行し本projectionが吸収された時"
parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md
pair_artifact: docs/test-design/helix/L8-luna-worker-model-registry-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md
  blocks:
    - issue:624-spawn-admission
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-001, test_path: tests/model-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-002, test_path: tests/tier-router.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-003, test_path: tests/team-launch-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-004, test_path: tests/model-effort.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-639-luna-worker-model-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/luna-worker-model-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-luna-worker-model-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-effort.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-policy.ts, artifact_type: source_module }
  - { artifact_path: src/team/launch-policy.ts, artifact_type: source_module }
  - { artifact_path: tests/model-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-effort.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tier-router.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-launch-policy.test.ts, artifact_type: test_code }
---

# PLAN-L7-639: Luna worker model registry実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | current／historical model surfaceを棚卸し | Terra削除対象と保持対象が分離される |
| 2 | registryをLuna／xhigh／公式価格へ更新 | SSoTが一致する |
| 3 | T1 router／proposal teamへ投影 | current consumerがLuna xhighを返す |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |

## 非対象

policy-derived spawn admission、hook payload、receipt authority、Sol subagent退役は後続PRで扱う。
