---
plan_id: PLAN-L7-496-pr-context-current-snapshot
title: "PLAN-L7-496 (add-impl): current PR context snapshot"
kind: add-impl
layer: L7
drive: agent
status: confirmed
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
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-02T05:43:08Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-02T05:43:08Z"
    evidence_digest: "sha256:a0defdfa08cc18b428e41e76393a78e68040af51b64f84bec990217761ca8a8a"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-02T05:43:08Z"
    tests_green_at: "2026-08-02T05:43:45Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #347 exact HEAD 5fa8eed51ae9d56f70a450a34cdeca9afa922fa3をClaude AI-Bがread-only再判定。前回B1/B2解消、Critical／High／Medium 0、blockerCount 0、verdict approve。非blockerはIssue #348へ分離。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/347#issuecomment-5155721048"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/branch-kind.test.ts tests/harness-check-workflow.test.ts tests/design-language.test.ts tests/plan-lint.test.ts tests/plan-descent-specific-parent-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-02T05:43:45Z", evidence_path: tests/branch-kind.test.ts, output_digest: "sha256:e0bda2c0302d07d09bb7ccc722a4ad4291767ad4a31ca3cc99a93cf579c4dff8", result: "Codex author runtime: 5 files / 135 tests pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-02T05:43:45Z", evidence_path: src/lint/github-guards.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "Codex author runtime: exit 0; command stdout is empty" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-02T05:43:45Z", evidence_path: docs/plans/PLAN-L7-496-pr-context-current-snapshot.md, output_digest: "sha256:6ecb6779292438ca9271a3d024d4c3e8ac6c1917c7b3af1a40626e8d9211d1e1", result: "plan-governance OK: 786 PLANs" }
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
