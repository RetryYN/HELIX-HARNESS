---
plan_id: PLAN-RECOVERY-1659-ci-status-head-binding
title: "PLAN-RECOVERY-1659: GitHub CI statusのexact HEAD／workflow束縛"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / Luna worker
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1659
behavior_contract_id: GH-CI-STATUS-001
responsibility_owner: github-ci-status
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存ci-statusの判定基準をbranch windowからcurrent HEAD／workflowへ修復し、要求意味や権限を拡張しない。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "GitHub Actions runがheadShaとworkflow identityを返し、local Gitが判定対象refの完全SHAを解決できる"
contract_postconditions: "ci-statusは完全SHAとworkflowに一致するrunだけを集計し、対象run不在をgreenにもredにも推測しない"
contract_invariants: "current HEADのfailure/cancelledは従来どおりredとし、別HEAD・別workflowの結果で相殺しない。判定はread-onlyである"
contract_failures: "expected HEADまたはworkflow不明、query failure、対象run不在、取得window外を別状態でfail-closeする"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "既存loader/analyzerへexact selectorを追加し、誤ったCI再待機と偽greenによる手戻りを除く。新service、DB、workflowを追加しない"
removal_trigger: "GitHub providerがcurrent HEADとrequired workflowの単一typed verdictを直接返し、branch window集計が不要になった時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md
pair_artifact: docs/test-design/helix/L8-github-ci-status-head-binding-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-001, test_path: tests/github-merge-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-002, test_path: tests/github-merge-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-003, test_path: tests/github-merge-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-004, test_path: tests/github-merge-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, oracle_id: U-GHCI-006, test_path: tests/cli-surface.test.ts }
mutation_oracle_evidence: "tests/cli-surface.test.ts::U-GHCI-006 killed M-1（expectedHeadSha配線削除）をexit 1で検出し、U-GHCI-005 killed M-2（旧red-only exit式）をwindow_missのexit 0として検出。tests/github-merge-readiness.test.tsの補助oracleはM-3（exit helperを常時0）を5 assertionで検出。Node 24 targeted mutation実測。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1659
    - docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md
    - docs/plans/PLAN-L7-473-claude-pr-convergence.md
  blocks: []
generates:
  - { artifact_path: docs/design/helix/L6-function-design/github-ci-status-head-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-ci-status-head-binding-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1659-ci-status-head-binding.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/audit/github-merge-readiness.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-merge-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — candidate HEAD／workflow identityのauthority境界を照合" }
  - { role: se, slot_label: "Luna worker — exact HEAD／workflow selector実装" }
  - { role: qa, slot_label: "QA — old HEAD／別workflow／window miss反例" }
  - { role: tl, slot_label: "Codex — scope・CLI residual・独立review収束" }
review_evidence: []
---

# GitHub CI statusのexact HEAD／workflow束縛

Issue #1659で、branchの直近run windowをcommit・workflow非束縛で集計し、current HEADにrunがなくても
greenを返せることが実測された。既存loader/analyzerを完全SHAとworkflow identityへ束縛し、別世代の結果を
現在の検収へ混入させない。

## このslice

1. `expectedHeadSha`と`targetWorkflow`を明示入力にする。
2. exact pairだけを判定し、空queryとwindow missを区別する。
3. current HEADのfailure/cancelledはredを維持する。
4. Issue記載のA/B/C/window外反例を`U-GHCI-001..004`へ固定する。

## 後続

`src/cli.ts`はPR #1628のactive writer scopeと重なるため、このsliceでは変更しない。#1628 main到達後、
`no_runs`／`window_miss`／`unavailable`を実CLI exit codeへfail-closeで接続し、Issue #1659の最終受入を閉じる。
本sliceだけでIssue完了を主張しない。
