---
plan_id: PLAN-L7-427-active-plan-selection
title: "PLAN-L7-427 (impl): active PLAN選択fail-close"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-425 I5のlive orphan増加を停止"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "confirmed L6 active PLAN選択契約をCLIへ降下する。"
parent_design: docs/design/harness/L6-function-design/active-plan-selection.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-001, test_path: tests/session-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-002, test_path: tests/session-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-003, test_path: tests/session-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-004, test_path: tests/session-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-005, test_path: tests/drive-db-registration.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-006, test_path: tests/runtime-hook-entrypoints.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/active-plan-selection.md, oracle_id: U-APSEL-007, test_path: tests/cli-surface.test.ts }
agent_slots:
  - { role: se, slot_label: "SE - loaderとplan use配線" }
  - { role: qa, slot_label: "QA - exact/prefix/empty回帰" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-427-active-plan-selection.md, artifact_type: markdown_doc }
  - { artifact_path: src/policy/active-plan-selection.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/session-log.ts, artifact_type: source_module }
  - { artifact_path: tests/session-log.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/drive-db-registration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/drive-registration.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-db-registration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-68-active-plan-selection.md
  requires:
    - docs/plans/PLAN-L6-68-active-plan-selection.md
  references:
    - docs/plans/PLAN-L7-425-system-review-issue-handoff.md
review_evidence:
  - reviewer: codex-active-plan-final-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T19:39:21Z"
    tests_green_at: "2026-07-11T19:39:00Z"
    verdict: approve_after_fixes
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "active PLAN exact selection、3桁commit抽出、全writer/event attribution、raw writer非公開、post-watermark orphan、Vペア全artifactを3回レビューしblocker/high 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/session-log.test.ts tests/drive-db-registration.test.ts tests/runtime-hook-entrypoints.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/design-coverage.test.ts tests/l6-completion.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T19:38:45Z", evidence_path: tests/session-log.test.ts, output_digest: "sha256:71598e2f2a51ca9c661091127435c671aabdd991853e6e6634533ed6d891e7ea" }
      - { kind: unit_test, command: "bunx vitest run tests/cli-surface.test.ts -t U-APSEL-007", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T19:38:50Z", evidence_path: tests/cli-surface.test.ts, output_digest: "sha256:a19618c54345cae65fae55c1eff2edc24bb1ee529fb776affd6348d901a0b81e" }
      - { kind: typecheck, command: "bun run typecheck", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T19:38:55Z", evidence_path: src/policy/active-plan-selection.ts, output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T19:39:00Z", evidence_path: src/runtime/session-log.ts, output_digest: "sha256:f1e294de755981040a391248b615f8d6ac56e8aae6e27591e2c5644f15df2120" }
---

# PLAN-L7-427: active PLAN選択fail-close

## 完了条件

- `U-APSEL-001..007`、CLI/commit integration、post-watermark orphan gate、PLAN lint、typecheck、lint、doctorがgreen。
- 修正後に未知plan_idを持つ新規hook eventを生成できない。
