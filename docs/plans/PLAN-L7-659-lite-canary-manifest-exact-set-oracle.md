---
plan_id: PLAN-L7-659-lite-canary-manifest-exact-set-oracle
title: "PLAN-L7-659 (impl): Lite canaryのarchive／manifest exact-set oracleを固定する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 965
behavior_contract_id: DISTRIBUTION-LITE-CANARY-MANIFEST-EXACT-SET-001
responsibility_owner: distribution-lite-consumer-canary
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "canary admissionがtar実体とmanifest artifact_pathsのexact setを比較する"
contract_postconditions: "manifest申告不足／過多の両方をarchive_exact_set_mismatchで拒否するoracleが存在する"
contract_invariants: "production code、failure code体系、Windows同一artifact chainを変更しない"
contract_failures: "exact-set判定の除去または片方向比較への退行をU-DISTCAN-001aがredにする"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #965にarchive_exact_set_mismatch除去mutationのSURVIVED実測と不足manifestが誤admitされる反例が記録済みであり、未記録timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "production実装を増やさず、既存fail-close境界へ不足／過多fixtureを追加する"
removal_trigger: "archive listingとmanifest生成が同一unforgeable receiptへ統合され比較境界が消滅した時"
mutation_oracle_evidence: "archive_exact_set_mismatch判定を一時除去するとU-DISTCAN-001aが不足fixtureの誤admitを検出して1 test redとなり、判定復元後10 tests green"
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:ForwardレーンでPR #962の独立レビュー由来Issue #965を回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-001a, test_path: tests/distribution-lite-consumer-canary.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — manifest申告不足／過多mutation" }
  - { role: tl, slot_label: "TL — production source無変更と既存chainの確認" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-659-lite-canary-manifest-exact-set-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  requires:
    - docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  references:
    - issue:965
  blocks:
    - issue:965
---

# Lite canary archive／manifest exact-set oracle

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 申告不足fixture | tar実体を変えずmanifestから1 path除去してexact codeでred |
| 2 | 申告過多fixture | tarにないportable pathをmanifestへ追加してexact codeでred |
| 3 | mutation確認 | exact-set判定除去でU-DISTCAN-001aが失敗 |
| 4 | 回帰確認 | canary targeted、typecheck、Biome、PLAN lintがgreen |

## 境界

production code、failure code、Windows workflow、配布publishは変更しない。
