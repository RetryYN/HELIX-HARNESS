---
plan_id: PLAN-L7-427-active-plan-selection
title: "PLAN-L7-427 (impl): active PLAN選択fail-close"
kind: impl
layer: L7
drive: agent
status: draft
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
  - { artifact_path: src/plan/active-plan-selection.ts, artifact_type: source_module }
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
    - docs/plans/PLAN-L7-425-system-review-issue-handoff.md
---

# PLAN-L7-427: active PLAN選択fail-close

## 完了条件

- `U-APSEL-001..007`、CLI/commit integration、post-watermark orphan gate、PLAN lint、typecheck、lint、doctorがgreen。
- 修正後に未知plan_idを持つ新規hook eventを生成できない。
