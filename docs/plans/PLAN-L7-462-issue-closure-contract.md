---
plan_id: PLAN-L7-462-issue-closure-contract
title: "PLAN-L7-462 (impl): Issue closure contractとGitHub close gate"
kind: impl
layer: L7
drive: agent
status: confirmed
review_evidence:
  - reviewer: claude-tl
    review_kind: cross_agent
    reviewed_at: "2026-07-20T17:20:00Z"
    tests_green_at: "2026-07-20T17:16:20Z"
    verdict: approve_after_fixes
    scope: "PR #78 cross-review: issue closure gate (analyzePrContext 5 outcome / closure receipt / child disposition / PO境界) をレビュー。指摘 2 件 (Outcome/Child Issues のテンプレ inline comment 非許容、rejected/quarantined の Decision receipt not_required 素通り) を修正し regression テスト 2 件を追加。entry_signal を po_directive 形式へ整合。"
    worker_model: codex-gpt-5
    reviewer_model: claude-fable-5
    green_commands:
      - kind: unit_test
        command: "vitest run tests/branch-kind.test.ts tests/harness-check-workflow.test.ts tests/setup.test.ts tests/goal-evidence-audit.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-20T17:16:20Z"
        evidence_path: tests/branch-kind.test.ts
        output_digest: "sha256:3bb2d732bc6e483efbfc12c671c13f77cf806060e3958525803a303f6ac5e09a"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-20T17:20:00Z"
  review_binding:
    reviewer: claude-tl
    reviewed_at: "2026-07-20T17:20:00Z"
    evidence_digest: "sha256:13e25e89e146fb82fb4fbb4cd3d8624c00b0a42212155c362ce2440c4af68cfc"
  entries: []
route_mode: forward
entry_signals:
  - "po_directive:2026-07-20 GitHub運用見直し方針に基づく Issue #76 close規則のCI強制"
created: 2026-07-21
updated: 2026-07-21
owner: Codex / TL
github_issue_id: 76
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICLOSE-001, test_path: tests/branch-kind.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICLOSE-002, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICLOSE-003, test_path: tests/setup.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICLOSE-004, test_path: tests/goal-evidence-audit.test.ts }
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — PR context closure contract、workflow、consumer template実装"
  - role: tl
    slot_label: "TL — GitHub close authority、terminal outcome、PO境界レビュー"
generates:
  - { artifact_path: docs/plans/PLAN-L7-462-issue-closure-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/github/common/PULL_REQUEST_TEMPLATE.md, artifact_type: template }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  requires:
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks: []
historical_provenance:
  - relation: historical_provenance
    authority_scope: compatibility_input_only
    plan_id: PLAN-L3-19-github-operations-projection
    path: docs/plans/PLAN-L3-19-github-operations-projection.md
    reason: "#1591: 旧PLANの来歴を保存し、現在の依存先はL3要件へ接続する"
---

# PLAN-L7-462: Issue closure contractとGitHub close gate

## 目的

Issue closeを終端PRのmergeとtyped evidenceへ束縛する。実装採用だけでなく、Discovery/PoCの
`rejected / quarantined`も終端decision receiptをmergeした場合は正当にcloseできるようにする。

## 実装範囲

1. GitHub自律運用要件とmode規則へ5 outcome、closure receipt、子Issue disposition、PO境界を追加する。
2. consumer PR templateへclosure blockを追加する。
3. `analyzePrContext`で`Closes #N`を持つ全PRを検査し、不完全なcloseをfail-closeする。
4. `harness-check`の全pull requestでPR context guardを実行する。

## 非対象

- GitHub IssueをAPIで直接close/reopenする新しいwrite command。
- release/tag/cutoverのaction-binding approval変更。
- Issue起点でない通常Forward PRへの`Closes`強制。

## 完了条件

- U-ICLOSE-001、workflow test、setup template test、typecheckがgreen。
- cross-runtime review evidenceを記録し、PLANをconfirmedへ遷移する。
- PRの`Closes #76`に完全なclosure blockを記録し、CI green後にauto-mergeする。
