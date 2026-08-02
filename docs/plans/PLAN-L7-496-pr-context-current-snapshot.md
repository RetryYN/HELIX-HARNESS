---
plan_id: PLAN-L7-496-pr-context-current-snapshot
title: "PLAN-L7-496 (add-impl): current PR context snapshot"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-02 Issue #338 P1 CI収束コスト削減"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 338
engineering_discipline_required: true
behavior_contract_id: GH-AC-040
responsibility_owner: pr-scope-guard
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "GitHub pull request read権限とcurrent PR numberが利用可能である"
contract_postconditions: "manifest bodyと変更pathが同一current GitHub head/base snapshotから生成される"
contract_invariants: "event payloadをauthorityにせず既存pr-context ownerと単一harness-check jobを再利用する"
contract_failures: "API取得不能、別PR、schema不正、不正SHA、guard前後body/head/base driftをfail-closeする"
tdd_red_required: true
red_at: "2026-08-02T05:20:00Z"
green_at: "2026-08-02T05:27:15Z"
mutation_oracle_evidence: "U-PRSCOPE-006で別PR、invalid JSON/SHAとworkflowのevent body再利用・snapshot再取得/cmp欠落をredにする"
complexity_effect: net_neutral
complexity_justification: "既存pr-context parserと既存CI stepへtyped snapshot inputを追加し新job・detector・dependency・stateを増やさない"
removal_trigger: "GitHubがrerun時にもcurrent immutable PR contextをevent payloadとして保証した時点でAPI re-read adapterを削除する"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-006, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-007, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed snapshot parser／CLI／workflow接続" }
  - { role: qa, slot_label: "QA — identity／schema／drift mutation oracle" }
  - { role: tl, slot_label: "TL — current authorityとscope owner境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-496-pr-context-current-snapshot.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
dependencies:
  parent: docs/plans/PLAN-L7-466-pr-scope-contract.md
  requires:
    - docs/plans/PLAN-L7-466-pr-scope-contract.md
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
---

# PLAN-L7-496: 現在PR文脈snapshot

## 目的

GitHub Actions rerunが保持する古いevent bodyをPR scope authorityとして使わず、current GitHub API snapshotへ
body、head/base ref、head/base SHA、変更pathを束縛する。guard前後driftを拒否し、本文修正後のfalse-redと
stale manifest通過の両方を閉じる。

## 工程

1. Red: 別PR、不正JSON/SHA、event body依存、post-read drift未検出を`U-PRSCOPE-006`で固定する。
2. Green: 既存`pr-context`へtyped snapshot parserを追加し、既存workflow stepからcurrent API readを渡す。
3. Refactor: selected field集合とsnapshot pathを一箇所へ固定し、新job／detectorを作らない。
