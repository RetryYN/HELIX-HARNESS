---
plan_id: PLAN-REVERSE-87-hosted-preflight-nonce-order
title: "PLAN-REVERSE-87: hosted preflight nonce順序の終端fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L5
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1451
behavior_contract_id: HOSTED-PREFLIGHT-OVERRIDE-NONCE-ORDER-001
responsibility_owner: hosted-preflight
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals: [regression_dev]
contract_preconditions: "PLAN-RECOVERY-87の実装、PR #1455のexact-HEAD review、canonical merge、post-main CIが存在する"
contract_postconditions: "Forward RecoveryとReverse fullbackが同一Issue・contract・current-main証拠へ束縛される"
contract_invariants: "production timeout、override nonce identity、fail-close条件、新要求意味を変更しない"
contract_failures: "wrong HEAD、stale review、双方向link欠落、CI failure、DB非収束、main read-after欠落では終端化しない"
tdd_red_required: false
tdd_red_waiver_reason: "実装済みRecoveryのdocs-only終端照合であり、既存U-HOSTPRE-001〜011とmutationを再利用する"
mutation_oracle_required: true
mutation_oracle_evidence: "PR #1455でcommitOverrideUseをpreflight判定前へ戻すmutationがred、復元後11 tests greenを実測済み"
complexity_effect: net_neutral
complexity_justification: "runtimeを追加せずForward／Reverse／GitHub／CI証拠を再接着する"
removal_trigger: "なし。終端履歴として保持する"
backprop_decision: not_required
backprop_decision_reason: "既存Recovery契約のmain実測を再接着し、新しい要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
pair_artifact: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "既存fail-close要求を変更せずnonce commit順序の実装一致だけを確認する。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md
    reason: "外部境界やactor責務を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
    reason: "既存の判定後commit設計と実装を照合する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md
    reason: "既存oracleとmutationを再利用する。"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md, oracle_id: U-HOSTPRE-011, test_path: tests/hosted-preflight.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-87-hosted-preflight-nonce-order.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/plans/PLAN-RECOVERY-87-hosted-preflight-nonce-order.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-87-hosted-preflight-nonce-order.md
  requires:
    - docs/plans/PLAN-RECOVERY-87-hosted-preflight-nonce-order.md
  references:
    - "issue:1451"
    - "pr:1455"
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — nonce順序、双方向link、main証拠の反例" }
  - { role: tl, slot_label: "TL — #1451 terminal境界とIssue close" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-02T14:07:28Z"
    tests_green_at: "2026-09-02T14:07:28Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: f174f7b5ef428ff6800a9d13a6cbc2c347c062f2
    scope: "PR #1455 exact HEADのRecovery実装、mutation、CI、DB convergenceを確認した独立review。terminal bundle自体は本PRで再検収する。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1455#issuecomment-5510860825"
    green_commands:
      - kind: smoke
        command: "gh run view 33626819164 --json status,conclusion,headSha,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-02T14:07:28Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:93ca20f5deeeac689fd02e93338dea682c41c889cfa077dd0011d7f6fa642f6c"
---

# hosted preflight nonce順序の終端Reverse fullback

## R0 現状採取

PR #1455のexact HEAD `f174f7b5ef428ff6800a9d13a6cbc2c347c062f2`、Claude blocker 0 receipt、
CI run `33626819164`、merge commit `b2c84de73254c358d8b4fc9f979f34a64ddf9223`を採取した。

## R1〜R3 意味照合

deny時はnonce未消費、全preflight allow後だけcommit、成功nonce再利用は拒否する実装が、Forward Recoveryと
U-HOSTPRE-011の契約に一致する。要求、外部境界、production timeoutは変更しない。

## R4 Forward再入

Forward Recoveryと本Reverseを双方向接続し、completion stateを同一terminal bundleで確定する。
Issue #1451は本PRのcanonical mergeとmain read-after後にのみcloseする。
