---
plan_id: PLAN-RECOVERY-79-review-db-candidate-tree-binding
title: "PLAN-RECOVERY-79: review DB candidate tree binding"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1383
behavior_contract_id: REVIEW-DB-CANDIDATE-TREE-BINDING-001
responsibility_owner: claude-pr-convergence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:PR #1357のexact HEAD receiptが共有dirty root由来DB digestを封緘しReady admissionで拒否されたため、正規経路で回復する"
contract_preconditions: "candidate HEAD、CI generation、reviewer sessionが既存contractで検証済みである"
contract_postconditions: "同一candidate HEADのclean workspace由来DB receiptだけがreview receiptへ束縛される"
contract_invariants: "共有rootのforeign変更を破棄せず、invalid receiptをadmin overrideしない"
contract_failures: "wrong HEAD、invalid tree、dirty workspace、status digest不正をstable errorで拒否する"
tdd_red_required: true
red_test: "U-CPRCONV-038/039がproduction source check不在により2件failed"
red_at: "2026-09-02T06:07:15+09:00"
green_at: "2026-09-02T06:18:58+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "source_head比較を!==から===へ反転するとU-CPRCONV-038が1/1 failedし、復元後はclaude-pr-convergence 49/49 green"
complexity_effect: net_negative
complexity_justification: "既存canonical DB receiptに既に存在するsource/workspace attestationをproducer境界で再利用し、別receipt系を作らない"
removal_trigger: "なし。review provenanceの恒久不変条件"
backprop_decision: not_required
backprop_decision_reason: "#769のgeneration binding意図を変えず、欠けていたcandidate workspace拘束を復旧する"
parent_design: docs/design/helix/L6-function-design/review-db-candidate-tree-binding.md
pair_artifact: docs/test-design/helix/L8-review-db-candidate-tree-binding-unit-test-design.md
dependencies:
  parent: PLAN-RECOVERY-59-same-head-ci-review-rearm
  requires:
    - docs/plans/PLAN-RECOVERY-59-same-head-ci-review-rearm.md
  references:
    - "issue:1383"
    - "issue:769"
    - "pr:1357"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-79-review-db-candidate-tree-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-db-candidate-tree-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-db-candidate-tree-binding-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — review receipt provenanceとcandidate workspace境界の監査" }
  - { role: se, slot_label: "SE — candidate treeとDB receipt source拘束" }
  - { role: qa, slot_label: "QA — wrong HEAD／dirty workspace mutation" }
  - { role: tl, slot_label: "TL — #1357正規再封緘と#769境界" }
review_evidence: []
---

# review DB candidate tree bindingの復旧

review HEADが一致していてもDB receiptの生成workspaceが異なる経路を閉じる。#1357は新CI generationと
clean dedicated worktreeのClaude review receiptで再封緘し、invalidな既存receiptを再解釈しない。
