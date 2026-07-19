---
plan_id: PLAN-L6-67-development-ci-bounded-time
title: "PLAN-L6-67 (add-design): 開発CI bounded-time fail-close契約"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 /goal 自律進行中のCI停止原因を有限時間で確定する"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存required checkの非機能実行境界を具体化する。上位要求やconsumer契約の変更はない。"
parent_design: docs/design/harness/L6-function-design/development-ci-bounded-time.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - GitHub Actions実行予算と開発/consumer境界"
  - role: qa
    slot_label: "QA - U-CITIME-001..003 fail-close検証"
generates:
  - { artifact_path: docs/plans/PLAN-L6-67-development-ci-bounded-time.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/development-ci-bounded-time.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-66-fe-roster-orchestration.md
  requires:
    - docs/plans/PLAN-L6-66-fe-roster-orchestration.md
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
      - { kind: unit_test, command: "npx --no-install vitest run tests/harness-check-workflow.test.ts tests/design-coverage.test.ts tests/l6-completion.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T18:46:45Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:32680e33f937386335cfe0ad515b490971225266c3c7550998f943627980e389" }
      - { kind: typecheck, command: "npm run typecheck", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T18:46:50Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1" }
      - { kind: lint, command: "npm run lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T18:46:55Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:f1e294de755981040a391248b615f8d6ac56e8aae6e27591e2c5644f15df2120" }
---

# PLAN-L6-67: 開発CI bounded-time

## 目的

開発側required checkのjobと全回帰stepへ階層的な時間上限を設け、timeoutをfail-closeで確定する。

## 受入条件

- jobは20分、全回帰stepは15分で、step上限がjob上限未満である。
- job/stepに`continue-on-error: true`がない。
- 後続lint、DB refresh、doctorは同じbounded jobに残る。
- consumer workflowを変更しない。
