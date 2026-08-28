---
plan_id: PLAN-L7-698-cli-workflow-identity-projection
title: "PLAN-L7-698: CLI workflow identity projectionをtyped authorityへ移行する"
kind: impl
layer: L7
drive: fullstack
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #1125 CLI legacy workflow output convergence"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1125
behavior_contract_id: CLI-TYPED-WORKFLOW-IDENTITY-001
responsibility_owner: workflow-output-cli-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3.13 §4.2.1〜4.2.4がtyped identity、legacy input-only、current outputへの旧field再出力禁止を所有する。本sliceは既存要件をCLI consumerへ具体化する。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L7-692のconsumer inventory、PLAN-L7-693のtyped DB projection、PLAN-L7-694のvisualization projectionがcurrent mainで成立する"
contract_postconditions: "drive model、recovery、completion／Project frontier、tree viewがregistry version、registry digest、target_axis、target_idだけをcurrent workflow identityとして返す"
contract_invariants: "provider model、specialist drive、skill applicabilityをworkflow identityへ畳み込まず、#1044/#1059の所有surfaceへ触れない"
contract_failures: "旧selected_model／default_model／available_models／drive_modelの再出力、partial tuple、unknown axis／ID、stale digest、receipt不一致をfail-closeする"
tdd_red_required: true
red_test: "U-CLIWI-001..003を先行追加し、drive model／recovery current outputのtyped tuple欠落とlegacy field残存を実測する"
red_at: "2026-08-28T22:07:04+09:00"
green_at: "2026-08-28T22:34:55+09:00"
mutation_oracle_evidence: "2026-08-28T22:07:04+09:00にcurrent main bddf9029fでtests/cli-workflow-identity-projection.test.tsのU-CLIWI-001／002がtyped tuple欠落を2 failedとしてRed固定した。実装後、JSON／summary／textの6実CLI経路を含む4 testsが2026-08-28T22:34:55+09:00にgreen。2026-08-28T22:35:36+09:00にreceipt target_id exact照合を除去するmutationを実測し、U-CLIWI-004が1 failed（exit 1）でkillした後に照合を復元した。U-CLIWI-003はlegacy drive_model＋selected_model seedのexact pathを継続検出する。"
complexity_effect: net_negative
complexity_justification: "CLIごとのlegacy model projectionを既存current-location typed receipt由来の単一value objectへ集約する"
removal_trigger: "CLI current outputのlegacy workflow identity consumerが0となりinput-only adapter retention期限が満了した時"
parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md
pair_artifact: docs/test-design/helix/L8-cli-workflow-identity-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-001, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-002, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-003, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-004, test_path: tests/cli-workflow-identity-projection.test.ts }
dependencies:
  parent: PLAN-L7-692-workflow-output-consumer-inventory
  requires:
    - docs/plans/PLAN-L7-692-workflow-output-consumer-inventory.md
    - docs/plans/PLAN-L7-693-current-location-db-typed-workflow-identity.md
    - docs/plans/PLAN-L7-694-visualization-typed-workflow-identity.md
  blocks: []
  references:
    - "issue:1125"
    - "issue:206"
    - "issue:204"
    - "issue:1044"
    - "issue:1059"
agent_slots:
  - { role: se, slot_label: "SE — CLI typed identity value object／projection" }
  - { role: qa, slot_label: "QA — legacy resurrection／stale tuple mutation" }
  - { role: tl, slot_label: "TL — workflow identityとskill/provider軸の責務分離" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-698-cli-workflow-identity-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-cli-workflow-identity-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cli-workflow-identity-projection.test.ts, artifact_type: test_code }
  - { artifact_path: src/workflow/cli-workflow-identity-projection.ts, artifact_type: source_module }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# CLI typed workflow identity投影工程

Issue #1125のCLI ownerをconsumer単位で移行する第一sliceである。`helix drive model`と、その同じ
legacy reportを直接包む`helix recovery plan`のJSON／summary／textを対象とする。

skill bindingのapplicability語彙は#1044/#1059が所有するため、本PLANで名称置換や削除を行わない。
後続のfrontier／Project view／vmodel fitは、本value objectのgreen後に別の原子sliceとして接続する。
