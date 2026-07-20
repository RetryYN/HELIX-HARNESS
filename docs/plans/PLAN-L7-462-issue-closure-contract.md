---
plan_id: PLAN-L7-462-issue-closure-contract
title: "PLAN-L7-462 (impl): Issue closure contractとGitHub close gate"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "github_issue:76 Issue close規則をGitHub運用とCIへ追加する"
created: 2026-07-21
updated: 2026-07-21
owner: Codex / TL
github_issue_id: 76
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ICLOSE-001, test_path: tests/branch-kind.test.ts }
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
  parent: docs/plans/PLAN-L3-19-github-operations-projection.md
  requires:
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks: []
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
