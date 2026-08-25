---
plan_id: PLAN-L7-673-reverse-fullback-scope-all-entry-validation
title: "PLAN-L7-673 (impl): Reverse fullback backprop_scopeの全entry検証"
kind: impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1021 Reverse fullback backprop_scopeの全entry検証"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 1021
behavior_contract_id: REVERSE-FULLBACK-SCOPE-ALL-ENTRY-001
responsibility_owner: reverse-fullback-scope-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "R4 fullback PLANのbackprop_scopeに必須層以外のentryが存在し得る"
contract_postconditions: "宣言された全entryのdecision/reason/evidenceを検査し、曖昧なscopeをfail-closeする"
contract_invariants: "必須3層の検査を維持し、generated evidenceを同一PLANのgeneratesへ束縛する"
contract_failures: "invalid decision、layer欠落、重複layer、未生成updated evidenceを見逃さない"
tdd_red_required: true
red_test: "U-RFSCOPE-001/002が旧必須3層限定実装の必須外layer見逃しをfailにする"
mutation_oracle_evidence: "2026-08-25T09:51:49Zにtests/tools/reverse-fullback-scope-mutation/run-mutation.tsを実行し、必須3層限定へ戻すmutantをKILLED、total=1 killed=1 survived=0 pattern_missing=0として実測した。復元後のtests/plan-lint.test.tsは55 passed。"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-25T11:35:44Z"
    tests_green_at: "2026-08-25T11:29:26Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    scope: "PR #1025 current HEAD 0c2154ee658c369d71eb79ad4bc049736598a0bcをClaude Codeが独立検収し、必須外layerのdecision/evidence検査、negative oracle、mutation kill、CI、DB projection/replay、checkpoint/replayを確認した。blocker 0。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1025#issuecomment-5409785164"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1025#issuecomment-5409785164"
    green_commands:
      - kind: smoke
        command: "gh run view 32840778709 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-25T11:29:26Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:65f11495368cea6ddd51bae66e2dc0e93709b2172afdc881c89ece33e4fc277b"
        result: "completed / success / HEAD 0c2154ee658c369d71eb79ad4bc049736598a0bc"
complexity_effect: net_negative
complexity_justification: "必須層専用ループを全entry共通validatorへ集約し、検査の抜け道を削除する"
removal_trigger: "backprop_scopeがtyped schemaへ移行し、非構造化frontmatterを受理しなくなった時"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-RFSCOPE-001, test_path: tests/plan-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-RFSCOPE-002, test_path: tests/plan-lint.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-RFSCOPE-003, test_path: tests/plan-lint.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-673-reverse-fullback-scope-all-entry-validation.md, artifact_type: markdown_doc }
  - { artifact_path: tests/tools/reverse-fullback-scope-mutation/run-mutation.ts, artifact_type: script }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-lint.test.ts, artifact_type: test_code }
  - { artifact_path: docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-133-refactor-brush-up-workflow.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-343-asset-visualization-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-344-session-handover-retirement-backprop.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
dependencies:
  parent: PLAN-L7-107-reverse-fullback-scope-gate
  requires:
    - docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
  blocks: []
  references:
    - "issue:1021"
    - "issue:704"
agent_slots:
  - { role: se, slot_label: "SE — fullback scope validator" }
  - { role: qa, slot_label: "QA — required外layer negative oracle" }
  - { role: tl, slot_label: "TL — requirements／L6／L8 contract" }
---

# Reverse fullback backprop_scopeの全entry検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 必須外layerのinvalid decision／未生成updated evidenceをRed固定 | U-RFSCOPE-001/002が旧実装の見逃しを捕捉 |
| 2 | 全entry共通validatorへ移行 | valid not_impactedを含む既存scopeがGreen |
| 3 | #1020のscope実態を修正 | verification-designがnot_impactedで、未変更L8をupdatedと主張しない |
| 4 | L6/L8 authority・PLAN・回帰を同期 | plan lint、typecheck、targeted test、mutationがGreen |
| 5 | Claude exact-HEAD検収 | blocker 0、CI／DB convergence／main read-afterを満たす |

本sliceはR4 fullbackの意味や必須3層を変更せず、追加entryを無検査で通すlint gapだけを閉じる。
