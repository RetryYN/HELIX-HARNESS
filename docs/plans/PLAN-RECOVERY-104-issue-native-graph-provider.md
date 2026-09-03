---
plan_id: PLAN-RECOVERY-104-issue-native-graph-provider
title: "PLAN-RECOVERY-104: GitHub native Issue graph providerを追加する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1322
behavior_contract_id: ISSUE-NATIVE-GRAPH-PROVIDER-001
responsibility_owner: issue-hierarchy
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: adapter
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "native graph comparatorはtyped snapshotを要求するが、GitHub parent／sub-issue／dependencyを同じidentityへ正規化するprovider portがない"
contract_postconditions: "GraphQLのstable node IDと4面graphをquery variablesで取得し、pagination完了状態付きIssueNativeGraphSnapshotへ正規化する"
contract_invariants: "providerは本文authorityを解釈せず、query値を文字列補間せず、未取得pageをcompleteへ偽装しない"
contract_failures: "不正repository／Issue、runner非0、JSON／repository／Issue／identity／connection／pageInfo不正をfail-closeする"
tdd_red_required: true
red_test: "provider module不在によりtest suite importが失敗してRed"
red_at: "2026-09-03T21:07:13+09:00"
green_at: "2026-09-03T21:07:55+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T21:08:08+09:00にconnection completeを常時trueへ変更し、U-IGNPROV-002がblockedByComplete expected false／received trueでRed・exit 1となった。復元後Green"
complexity_effect: net_neutral
complexity_justification: "GitHub process実行をrunner portへ隔離し、既存pure comparatorへprovider固有responseを漏らさない"
removal_trigger: "Notification Fabric共通GitHub Graph adapterが同じsnapshot schemaとpagination receiptを供給できる時"
backprop_decision: not_required
backprop_decision_reason: "既存Issue graph requirementのprovider接続であり、新しい要求意味を追加しない"
parent_design: docs/design/helix/L5-detail/github-issue-native-graph-provider.md
pair_artifact: docs/test-design/helix/L8-github-issue-native-graph-provider-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-issue-native-graph-provider.md, oracle_id: U-IGNPROV-001, test_path: tests/github-issue-native-graph-provider.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-issue-native-graph-provider.md, oracle_id: U-IGNPROV-002, test_path: tests/github-issue-native-graph-provider.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-issue-native-graph-provider.md, oracle_id: U-IGNPROV-003, test_path: tests/github-issue-native-graph-provider.test.ts }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-103-issue-native-graph-projection.md
  requires:
    - docs/plans/PLAN-RECOVERY-103-issue-native-graph-projection.md
  references: ["issue:1322", "issue:179", "issue:1481"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — GitHub native fieldと取得限界の実測" }
  - { role: se, slot_label: "SE — provider responseからtyped snapshotへの変換" }
  - { role: qa, slot_label: "QA — identity／pagination／malformed mutation" }
  - { role: tl, slot_label: "TL — providerとmeaning authorityの分離監査" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-104-issue-native-graph-provider.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-issue-native-graph-provider.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-issue-native-graph-provider-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/github-issue-native-graph-provider.ts, artifact_type: source_module }
  - { artifact_path: tests/github-issue-native-graph-provider.test.ts, artifact_type: test_code }
review_evidence: []
---

# GitHub Issue native graph provider

## 完了条件

- [ ] U-IGNPROV-001〜003のRed→Greenとpagination mutation killを確認する。
- [ ] PLAN lint、targeted、typecheck、Biome、Claude exact-HEAD review、CIがgreenになる。
- [ ] 後続CLI／scheduled adapterが同じrunner portを再利用する。
