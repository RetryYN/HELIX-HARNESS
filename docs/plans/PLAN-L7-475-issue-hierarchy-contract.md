---
plan_id: PLAN-L7-475-issue-hierarchy-contract
title: "PLAN-L7-475 (impl): GitHub Issue階層化とREADY leaf抽出契約"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 Issue増殖を防ぎ、親子・依存・重複・次タスク抽出を階層化する"
created: 2026-07-27
updated: 2026-07-27
owner: Codex / TL
github_issue_id: 81
engineering_discipline_required: true
behavior_contract_id: U-IHIER-001
responsibility_owner: github-issue-hierarchy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue候補がrole、parent、依存、duplicate search、dispositionを機械可読blockで提示する"
contract_postconditions: "孤児・cycle・非対称依存・上限超過を拒否し、open active non-blocked leafだけを次dispatch候補にする"
contract_invariants: "GitHubを第二正本にせず、新DB schema、新CI job、外部dependencyを追加しない"
contract_failures: "親欠落、親不在、cycle、深さ8超、子100超、依存非対称、duplicate不整合をfail-closeする"
tdd_red_required: true
red_at: "2026-07-27T23:18:00+09:00"
green_at: "2026-07-27T23:24:00+09:00"
mutation_oracle_evidence: "tests/issue-hierarchy.test.tsがorphan、parent cycle、非対称blocks、欠落contractのseeded反例を拒否し、valid treeのREADY leafだけを返す"
complexity_effect: justified_positive
complexity_justification: "単一pure validatorと既存Issue template拡張だけで、平坦Issue探索と重複起票を削減する。DB schema、network client、CI jobは増やさない"
removal_trigger: "GitHub sub-issue projectionとharness.db issue graphが既存共通graph validatorへ統合された時点で本moduleを統合する"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-001, test_path: tests/issue-hierarchy.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — Issue hierarchy value objectとaudit"
  - role: qa
    slot_label: "QA — orphan、cycle、duplicate、READY leaf反例"
  - role: tl
    slot_label: "TL — GitHub projection正本境界とIssue #81収束"
generates:
  - { artifact_path: docs/plans/PLAN-L7-475-issue-hierarchy-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/github-issue-hierarchy-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: .github/ISSUE_TEMPLATE/add-feature.md, artifact_type: template }
  - { artifact_path: .github/ISSUE_TEMPLATE/recovery.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/add-feature.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/recovery.md, artifact_type: template }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-27T14:24:00Z"
  review_binding:
    reviewer: "pending independent AI-B"
    reviewed_at: "2026-07-27T14:24:00Z"
    evidence_digest: "sha256:pending"
  entries: []
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L3-19-github-operations-projection.md
  requires:
    - docs/design/helix/L3-requirements/github-operations-projection.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks: []
---

# PLAN-L7-475: GitHub Issue階層化とREADY leaf抽出契約

## 目的

Issueをroot/capability/task/findingへ型付けし、親子・依存・重複・終端関係を保持する。
次dispatchは全Issueの平坦走査ではなく、検証済みREADY leafからだけ選ぶ。

## 非対象

- GitHub Projects v2へのwrite adapter。
- GitHubを正本にする双方向同期。
- 新DB schema、CI job、常駐daemon。
- PR #156のClaude convergence変更。

## 完了条件

- Issue templateが機械可読hierarchy blockを持つ。
- pure auditが孤児、cycle、上限、非対称依存、duplicate不整合を拒否する。
- READY leaf抽出がparked、duplicate、blocked、親Issueを除外する。
- targeted tests、plan lint、typecheck、full CI、独立reviewがgreenになる。
