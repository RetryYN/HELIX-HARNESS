---
plan_id: PLAN-RECOVERY-1437-current-route-identity-classification
title: "current route identityのlegacy誤分類是正"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 1437
behavior_contract_id: CURRENT-ROUTE-IDENTITY-CLASSIFICATION-001
responsibility_owner: github-workflow-identity-contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
contract_preconditions: "GitHub workflow identity schemaがcurrent route projection語彙を旧modeと同じlegacy集合へ誤分類している"
contract_postconditions: "legacy identityはmode／model／route_modeに限定し、catalog_route_id／route_classの誤投入は専用route projection未接続のschema境界違反として診断する"
contract_invariants: "target_axis／target_idの既存GitHub contractとadmissionを維持し、旧15 route値集合、旧mode gate、DB物理移行を再活性化しない"
contract_failures: "current route identityのlegacy誤分類、route pairの無検証受理、既存typed identityの緩和を拒否する"
tdd_red_required: true
red_at: "2026-09-10T04:19:55+09:00"
green_at: "2026-09-09T20:32:22Z"
mutation_oracle_evidence: "LEGACY_IDENTITY_FIELDSへcatalog_route_id／route_classを再投入する変異を一時適用し、U-GWID-009がlegacy_field_forbiddenを受けて1 failed、exit 1となることを実測した。変異を復元後、targeted suite greenを再確認する。"
complexity_effect: net_negative
complexity_justification: "誤ったlegacy集合からcurrent fieldを除去し、既存schema境界内の明示診断へ集約する"
removal_trigger: "GitHub surfaceが専用route projection contractを受理し、当該contractへexact照合できる時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, oracle_id: U-GWID-009, test_path: tests/github-workflow-identity-contract.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1437
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1437-current-route-identity-classification.md, artifact_type: markdown_doc }
  - { artifact_path: .helix/evidence/review-1701/vitest-targeted-24e.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-contract.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/github-workflow-identity-contract.ts, artifact_type: source_module }
  - { artifact_path: tests/github-workflow-identity-contract.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — current／legacy identity責務境界の監査" }
  - { role: se, slot_label: "SE — legacy field分類とschema診断" }
  - { role: qa, slot_label: "QA — current route field誤分類の反例" }
  - { role: tl, slot_label: "TL — authority境界と後続分離" }
review_evidence:
  - reviewer: "Claude Code / claude-fable-5-1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T21:16:38Z"
    tests_green_at: "2026-09-09T20:32:22Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude-fable-5-1
    scope: "PR #1701 exact HEAD a271e8d3d5da7cd7738622154b28dcd1f137fd87を独立reviewしblocker 0。current route fieldをlegacy集合から除外し、schema境界違反へ収束する第一slice、mutation kill、後続のpolicy-registry同型是正を確認した。required CI run 34403253140 attempt 1 success、DB projection／checkpoint replay一致、converged=true。canonical receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1701#issuecomment-5608874094、digest sha256:af2f91dc24218a5330adf9343882872ac5ccc2d80ae4fc6d00c047cc78573329。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/github-workflow-identity-contract.test.ts --reporter=json --outputFile=.helix/evidence/review-1701/vitest-targeted-24e.json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-09-09T20:32:22Z", evidence_path: .helix/evidence/review-1701/vitest-targeted-24e.json, output_digest: "sha256:bbff0307d01e2a0654ff619dfa9c55125515546789c9d2c5452531793d76f654", result: "8 tests passed" }
---

# current route identityのlegacy誤分類是正

## 第一slice

Issue #1437のうち、GitHub workflow identity contractが`catalog_route_id`／`route_class`を旧modeと同じ
legacy集合へ入れている逆転だけを是正する。専用route projection contractが未接続のため無検証で受理せず、
schema境界違反としてcurrent語彙であることを明示する。

## 後続義務

- `route-map.ts`と旧mode gateのcompatibility adapter移管
- drive DB schemaの物理移行とconsumer 0確認
- 専用route projection contractの設計、current catalogへのexact照合、GitHub consumer接続
- current HEADの独立review、fresh CI、merge/read-after
- `src/schema/workflow-execution-policy-registry.ts:103-104`の同型legacy誤分類是正
