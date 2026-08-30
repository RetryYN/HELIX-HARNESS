---
plan_id: PLAN-L7-713-layer-ledger-canonical-l1-l12
title: "PLAN-L7-713: layer ledger pair gateをcanonical L1-L12へ収束する"
kind: refactor
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / worker
github_issue_id: 1259
behavior_contract_id: LAYER-LEDGER-CANONICAL-PAIR-001
responsibility_owner: layer-ledger-pair-gate
change_slice: atomic
refactor_step: migrate_one_consumer
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "L1-L12 authorityは既にL1-L12 directiveとAGENTS.mdで確定済みであり、本sliceはlayer ledger設計・L7/L8・fixture consumerの一方向収束である。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1259 layer ledger pair gateをcanonical L1-L12へ収束"
contract_preconditions: "canonical layer authorityはL1-L12、L0は層外anchor、正規pairはL1↔L12からL6↔L7までの6組である"
contract_postconditions: "layer ledger current設計・L7/L8・fixtureが正規6 pairだけを出力し、L0 anchor projectionをpairから分離する"
contract_invariants: "legacy L0-L14はcompatibility/historical inputに限定し、legacy greenでcanonical failureを相殺しない"
contract_failures: "正規pair欠落、L0 pair化、旧failure identity再出力、fixture digest driftをfail-closeする"
tdd_red_required: true
red_at: "2026-08-30T00:00:00+09:00"
green_at: "2026-08-30T23:44:48+09:00"
tdd_red_evidence: "tests/layer-ledger-canonical-authority.test.tsで旧L0-L14 failure identityとcanonical authority欠落を2 failedとして検出"
tdd_green_evidence: "2026-08-30T23:44:48+09:00にnpx vitest run --project fast tests/layer-ledger-canonical-authority.test.tsを実行し、3 tests greenを確認"
mutation_oracle_required: true
mutation_oracle_evidence: "U-LLPG-053..055が5 artifact各々のcanonical 6 pair exact set欠落・旧pair identity混入、L0 pair化、legacy相殺文言欠落、case/receipt digest改変を判別する"
complexity_effect: net_negative
complexity_justification: "current判定から旧4 failure identityを除去し、canonical 6 pairとL0 anchor projectionへ一本化する"
removal_trigger: "layer ledger設計が実装済みruntime authorityへ置換され、同oracleがruntime testへ移管された時"
parent_design: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md
pair_artifact: docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md
dependencies:
  parent: issue:206
  requires:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  references:
    - issue:1259
    - issue:206
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md, oracle_id: U-LLPG-053, test_path: tests/layer-ledger-canonical-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md, oracle_id: U-LLPG-054, test_path: tests/layer-ledger-canonical-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md, oracle_id: U-LLPG-055, test_path: tests/layer-ledger-canonical-authority.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-713-layer-ledger-canonical-l1-l12.md, artifact_type: markdown_doc }
  - { artifact_path: tests/layer-ledger-canonical-authority.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L5-detail/layer-ledger-pair-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest, artifact_type: config }
  - { artifact_path: docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest, artifact_type: config }
  - { artifact_path: src/lint/canonical-reuse-consumer-baseline.ts, artifact_type: source_module }
  - { artifact_path: tests/canonical-reuse-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/regenerate-layer-ledger-progress-fixture.mjs, artifact_type: script }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — canonical layer/pair authority境界" }
  - { role: qa, slot_label: "QA — legacy混入とdigest mutation" }
---

# layer ledger canonical L1-L12収束

Issue #1259のlayer ledger authority consumerだけを変更する。L0-L14 compatibility sourceの削除、runtime実装、release/tag/cutover、他PR責務は含めない。PLANはpre-confirmのためdraftかつcompletion claim falseを維持する。
