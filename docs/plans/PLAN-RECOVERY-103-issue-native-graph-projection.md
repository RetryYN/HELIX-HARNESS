---
plan_id: PLAN-RECOVERY-103-issue-native-graph-projection
title: "PLAN-RECOVERY-103: Issue本文とGitHub native graphのtyped差分を投影する"
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
behavior_contract_id: ISSUE-NATIVE-GRAPH-PROJECTION-001
responsibility_owner: issue-hierarchy
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "Issue本文contractとGitHub native parent／sub-issue／dependencyが別々に存在し、scheduled auditが差分を一つのgraphとして収束できない"
contract_postconditions: "本文authorityからdesired graphを導出し、native read-side snapshotとの差分をstable ID・pagination状態・canonical digest付きtyped findingへ投影する"
contract_invariants: "native値を意味正本へ逆流させず、missing／extra／identity／paginationをfail-closeし、入力順や重複edgeでdigestを変えない"
contract_failures: "native Issue・stable ID・全page取得の欠落、parent／child／dependency片側差分、identity衝突を個別findingとして拒否する"
tdd_red_required: true
red_test: "U-IHIER-018〜020がauditIssueNativeGraphProjection未実装でTypeErrorとなり3件Red"
red_at: "2026-09-03T20:53:53+09:00"
green_at: "2026-09-03T20:54:54+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T20:56:08+09:00にnative_snapshot_incomplete finding生成を除去し、U-IHIER-019がexpected finding欠落でRed／exit 1となった。復元後にGreenへ戻した"
complexity_effect: net_neutral
complexity_justification: "既存IssueHierarchyNodeをdesired authorityとして再利用し、native比較だけを同一runtimeへ追加する。GitHub write／DB／schedulerは後続へ分離する"
removal_trigger: "Issue graphがprovider-neutral external projection registryへ統合され、同じfinding schemaを生成できる時"
backprop_decision: not_required
backprop_decision_reason: "既存Issue graph authorityのprojection漏れを回復するもので、新しい要求意味を追加しない"
parent_design: docs/design/helix/L5-detail/issue-native-graph-projection.md
pair_artifact: docs/test-design/helix/L8-issue-native-graph-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/issue-native-graph-projection.md, oracle_id: U-IHIER-018, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L5-detail/issue-native-graph-projection.md, oracle_id: U-IHIER-019, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L5-detail/issue-native-graph-projection.md, oracle_id: U-IHIER-020, test_path: tests/issue-hierarchy.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
  requires:
    - docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
    - docs/plans/PLAN-L7-675-issue-dependency-cross-contract-audit.md
  references: ["issue:1322", "issue:179", "issue:1292", "issue:1318", "issue:1481"]
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — body／native／DB三面driftのlive failure分析" }
  - { role: se, slot_label: "SE — desired graphとnative projectionのtyped境界" }
  - { role: qa, slot_label: "QA — pagination／identity／片側edge mutation" }
  - { role: tl, slot_label: "TL — read-only sliceとapply／DB後続責務の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-103-issue-native-graph-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/issue-native-graph-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-issue-native-graph-projection-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
review_evidence: []
---

# Issue native graph projection

## 目的

Issue本文authorityとGitHub native graphを同じ意味として混同せず、native側のprojection driftを
deterministicに検出する最初のread-only sliceを実装する。

## 非対象

- GitHub native graphへのwrite／repair
- DB table／replay／checkpoint
- scheduled workflowへの全repository接続
- READY leaf計算の切替

## 完了条件

- [ ] U-IHIER-018〜020のRed→Greenとmutation killを記録する。
- [ ] PLAN lint、targeted、typecheck、Biome、Claude exact-HEAD review、CIがgreenになる。
- [ ] 後続apply／DB／scheduled E2Eが同じtyped reportを再利用できる。
