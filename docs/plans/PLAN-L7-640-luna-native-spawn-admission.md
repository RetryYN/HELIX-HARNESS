---
plan_id: PLAN-L7-640-luna-native-spawn-admission
title: "PLAN-L7-640 (impl): Luna xhigh native spawn admissionを実payloadへ接合する"
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
behavior_contract_id: CODEX-NATIVE-WORKER-SPAWN-001
responsibility_owner: codex-native-spawn-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: policy
review_evidence: []
entry_signals:
  - "po_directive:Codex native workerをLuna xhighで起動可能にする"
agent_slots:
  - { role: se, slot_label: "SE — hook payload／tool contract接合" }
  - { role: qa, slot_label: "QA — arbitrary override negative oracle" }
contract_preconditions: "PLAN-L7-639でcurrent worker modelとeffortがLuna／xhighへ確定済み"
contract_postconditions: "version／digest検証済みpolicyが導出するLuna／xhigh／concrete taskだけがnative単体spawnを通過する"
contract_invariants: "Sol／Terra／任意model、bulk spawn、task欠落を許可しない"
contract_failures: "公開schemaにないfield要求、effort未束縛、任意override許可をfail-closeする"
tdd_red_required: true
red_test: "U-LUNASPAWN-001で現行agent_type必須guardが実payloadを拒否することを先行検出"
complexity_effect: net_neutral
complexity_justification: "存在しないrole fieldをmodel／effort exact pairへ置換し契約を狭める"
removal_trigger: "Codex native spawnがsigned policy receiptを直接受理するsurfaceへ移行した時"
parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md
pair_artifact: docs/test-design/helix/L8-luna-native-spawn-admission-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L7-639-luna-worker-model-registry.md
  blocks:
    - issue:624-runtime-receipt
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-001, test_path: tests/agent-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-004, test_path: tests/tool-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-006, test_path: tests/codex-native-worker-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-009, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-640-luna-native-spawn-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-luna-native-spawn-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/agent-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/codex-native-worker-policy.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/tool-contract.ts, artifact_type: source_module }
  - { artifact_path: tests/agent-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tool-contract.test.ts, artifact_type: test_code }
  - { artifact_path: tests/codex-native-worker-policy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# PLAN-L7-640: Luna native spawn admission実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | hosted payloadとguard差分を実測 | `agent_type`不在blockを再現 |
| 2 | versioned model／effort policyへ移行 | version／digest検証済みLuna／xhighだけpass |
| 3 | negative oracleとCLI smoke | stale policy／arbitrary overrideがfail |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |
