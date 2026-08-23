---
plan_id: PLAN-L7-661-lite-requirements-manifest-oracle
title: "PLAN-L7-661 (impl): Lite Requirement IR manifest宣言値のmutation oracleを固定する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 964
behavior_contract_id: DISTRIBUTION-LITE-REQUIREMENTS-MANIFEST-ORACLE-001
responsibility_owner: distribution-lite-profile-package
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "Lite profile packageのRequirement IR resolverがcanonical shard count／digestを照合する"
contract_postconditions: "manifest宣言値だけをdriftさせるcount／digest fixtureがrequirements_identity_invalidで拒否される"
contract_invariants: "production resolver、Requirement IR schema、shard実体、root digestの計算方式を変更しない"
contract_failures: "per-shard count／digest照合を除去するmutationをU-DISTPKG-009jがredにする"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #964でper-shard照合除去時にmanifest-only driftが32 existing testsをgreenのまま通過する実測を記録済みであり、未記録timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "production sourceを変更せず、既存resolverのcount／digest fail-close境界へmanifest-only fixtureを追加する"
removal_trigger: "Requirement IR manifest宣言値とshard実体が単一のunforgeable receiptへ統合され、個別照合が不要になった時"
mutation_oracle_evidence: "Issue #964の実測でper-shard照合除去はcount／digest driftをadmitする。2 fixtureで各経路を独立red化する"
parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-bound-package-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:PR #960 Claude独立レビュー由来Issue #964のmanifest宣言値oracle gapをForwardレーンで回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009r, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009s, test_path: tests/distribution-lite-profile-package.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — manifest count／digest mutation oracle" }
  - { role: tl, slot_label: "TL — production source無変更とroot digest非退行確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-661-lite-requirements-manifest-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-profile-bound-package-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-lite-profile-package.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
  requires:
    - docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
  references:
    - issue:964
  blocks:
    - issue:964
---

# Lite Requirement IR manifest宣言値のmutation oracle

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | count-only fixture | shard実体とroot digestを変更せず、manifest `shards[].count` driftを`requirements_identity_invalid`で拒否 |
| 2 | digest-only fixture | shard実体とroot digestを変更せず、manifest `shards[].digest` driftを`requirements_identity_invalid`で拒否 |
| 3 | mutation確認 | per-shard照合除去時にcount／digestの各oracleがred、復元後targeted green |
| 4 | 回帰確認 | typecheck、Biome、PLAN lint、full CI、doctor、Claude exact-HEAD reviewがgreen |

## 境界

production resolver、Requirement IR schema、shard実体、root digest計算、Full package経路は変更しない。
fixtureにはcredential、PII、absolute path、task本文を含めない。
