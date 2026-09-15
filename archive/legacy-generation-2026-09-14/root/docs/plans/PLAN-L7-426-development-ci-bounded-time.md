---
plan_id: PLAN-L7-426-development-ci-bounded-time
title: "PLAN-L7-426 (impl): 開発CI bounded-time fail-close"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-12 開発CIの無期限待機を自律的に解消"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "confirmed L6契約をworkflowと回帰検出へ降下する。"
parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-002, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md, oracle_id: U-CITIME-003, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - role: se
    slot_label: "SE - workflow timeout実装"
  - role: qa
    slot_label: "QA - YAML構造とfail-open反例検証"
generates:
  - { artifact_path: docs/plans/PLAN-L7-426-development-ci-bounded-time.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: source_module }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-67-development-ci-bounded-time.md
  requires:
    - docs/plans/PLAN-L6-67-development-ci-bounded-time.md
review_evidence:
  - reviewer: codex-ci-timeout-final-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T18:47:15Z"
    tests_green_at: "2026-07-11T18:47:00Z"
    verdict: approve
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "開発CI限定のjob 20分・全回帰step 15分、fail-close、consumer非変更、L6→L8→test binding、敵対fixture、design catalog登録を独立レビューしblocker/high 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/harness-check-workflow.test.ts tests/design-coverage.test.ts tests/l6-completion.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T18:46:45Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:32680e33f937386335cfe0ad515b490971225266c3c7550998f943627980e389" }
      - { kind: typecheck, command: "bun run typecheck", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T18:46:50Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T18:46:55Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:f1e294de755981040a391248b615f8d6ac56e8aae6e27591e2c5644f15df2120" }
---

# PLAN-L7-426: 開発CI bounded-time実装

## 完了条件

- `U-CITIME-001..003`、PLAN lint、typecheck、lint、全回帰、doctorがgreen。
- 独立reviewでtimeout階層、fail-close、consumer非変更を確認する。
