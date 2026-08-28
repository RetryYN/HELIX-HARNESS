---
plan_id: PLAN-L7-696-post-merge-plan-status-preflight
title: "PLAN-L7-696: merged-plan-statusをPRのpost-merge候補へ前倒しする"
kind: recovery
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1132 repeated post-merge merged-plan-status blind spot"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1132
behavior_contract_id: POST-MERGE-PLAN-STATUS-PREFLIGHT-001
responsibility_owner: merged-plan-status
engineering_discipline_required: true
change_slice: atomic
refactor_step: connect_existing_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存merged-plan-status契約の実行時点をpost-mergeからPR preflightへ前倒しするRecoveryであり、新しいproduct requirementやmerge policyを追加しない。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PR candidate HEAD、公開base、PLAN generates、既存merged-plan-status analyzerが読める"
contract_postconditions: "PR candidateをmerge後mainと見なしたHEAD treeでdraft deliverable PLANをmerge前にfail-closeする"
contract_invariants: "通常のpublished-base判定、S3 PoC例外、generates／modifies所有権、既存analyzerを変更しない"
contract_failures: "candidate HEAD不在、PLAN parse failure、draft deliverable、workflow配線欠落をfail-closeする"
tdd_red_required: true
red_test: "U-MPS-PRE-001..003を先行追加し、candidate HEAD modeとworkflow stepの欠落をRedで確認する"
red_at: "2026-08-28T13:39:24+09:00"
green_at: "2026-08-28T13:40:20+09:00"
mutation_oracle_evidence: "2026-08-28T13:40:32+09:00にcandidate_head分岐をHEADからorigin/main／mainへ一時退行させ、U-MPS-PRE-001がexpected HEAD／received origin/main,mainで1 failed・30 passed・exit 1となるkillを実測した。実装をHEADへ復元後、merged-plan-statusとworkflowの2 suite 86 tests、typecheck、post-merge-status gate greenを再確認する。"
complexity_effect: net_neutral
complexity_justification: "既存loaderへ明示base modeを1つ追加し、既存analyzerをpreflightから再利用する"
removal_trigger: "全PR admissionが常にmerge-result treeを直接検査し、明示candidate modeが不要になった時"
parent_design: docs/design/helix/L6-function-design/post-merge-plan-status-preflight.md
pair_artifact: docs/test-design/helix/L8-post-merge-plan-status-preflight-unit-test-design.md
refines:
  - PLAN-L7-54-merged-plan-status-gate
  - PLAN-L7-87-merged-plan-status-kind-independent
agent_slots:
  - { role: aim, slot_label: "AIM — repeated gate blind spotの帰責と既存authority監査" }
  - { role: tl, slot_label: "TL — merged-plan-status既存authorityの再利用境界" }
  - { role: qa, slot_label: "QA — branch-only deliverableとworkflow mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-696-post-merge-plan-status-preflight.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/post-merge-plan-status-preflight.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-post-merge-plan-status-preflight-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/merged-plan-status.ts, artifact_type: source_module }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/merged-plan-status.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-54-merged-plan-status-gate
  requires:
    - docs/plans/PLAN-L7-54-merged-plan-status-gate.md
  blocks: []
  references:
    - "issue:1132"
    - "pr:1116"
    - "pr:1122"
    - "pr:1127"
---

# merged-plan-status PR先取り検査

既存のstatus正確性契約を変更せず、PR candidate HEADをmerge後mainと見なした検査をpreflightへ追加する。

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | candidate HEAD base modeとworkflow oracleをRed化 | 欠落が2系統で検出される |
| 2 | loader optionとPLAN gateを実装 | 既存analyzerを再利用する |
| 3 | preflightへ配線 | plan lint直後、typecheck／全回帰前にfail-closeする |
| 4 | mutationと全回帰 | HEAD→published base退行、step削除をkillする |
