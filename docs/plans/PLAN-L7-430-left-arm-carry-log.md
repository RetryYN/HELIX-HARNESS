---
plan_id: PLAN-L7-430-left-arm-carry-log
title: "PLAN-L7-430 (impl): 左腕差し戻しcarry log検出器"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I6の未記録差し戻しを防止"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "L6 carry log契約をplan codec、doctor、G7へ降下する。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-11T21:14:58Z"
  review_binding:
    reviewer: codex-independent-reviewer
    reviewed_at: "2026-07-11T21:15:00Z"
    evidence_digest: "sha256:e693dc3c5456d1e9e914b29827d13b7d5f1c5338dbccb7210da8186eff426742"
  entries: []
parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-001, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-002, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-003, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-004, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-005, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-006, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-007, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-008, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-009, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-010, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-011, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-012, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-013, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-014, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-015, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-016, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-017, test_path: tests/frontmatter.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-018, test_path: tests/slow/doctor.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-019, test_path: tests/gate-static.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-020, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-021, test_path: tests/left-arm-carry-log.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/left-arm-carry-log.md, oracle_id: U-CARRY-022, test_path: tests/left-arm-carry-log.test.ts }
agent_slots:
  - { role: se, slot_label: "SE - codec、analyzer、doctor/G7配線" }
  - { role: qa, slot_label: "QA - adversarial fixtureとreal repo回帰" }
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T06:14:58+09:00"
    reviewed_at: "2026-07-11T21:15:00Z"
    verdict: approve_after_fixes
    scope: "U-CARRY-001..022、strict loader、canonical gate argv、時系列、global replay、legacy exact baseline、doctor/G7配線を再監査した。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/left-arm-carry-log.test.ts tests/frontmatter.test.ts tests/gate-static.test.ts tests/slow/doctor.test.ts -t 'U-CARRY|G7'", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T06:14:58+09:00", evidence_path: tests/left-arm-carry-log.test.ts, output_digest: "sha256:778b1a6e2385d78d3aa4b418bfb5fa88dc1c1791b2cc562cdc710438a9f3b92f" }
      - { kind: lint, command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-430-left-arm-carry-log.md", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T06:14:58+09:00", evidence_path: docs/plans/PLAN-L7-430-left-arm-carry-log.md, output_digest: "sha256:93c52b5c93d1332e54aedae07b0e332aea6aa4a0c00d2ac7d54c4d0b8f42c37f" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T06:14:58+09:00", evidence_path: src/lint/left-arm-carry-log.ts, output_digest: "sha256:73b7c51f604ca34516b5fde0268a75b906e0eea651b662f9878e22a715ffcbd4" }
      - { kind: typecheck, command: "bunx tsc --noEmit", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T06:14:58+09:00", evidence_path: src/lint/left-arm-carry-log.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-430-left-arm-carry-log.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/left-arm-carry-log.ts, artifact_type: source_module }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/gate/static.ts, artifact_type: source_module }
  - { artifact_path: tests/left-arm-carry-log.test.ts, artifact_type: test_code }
  - { artifact_path: tests/frontmatter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/gate-static.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-70-left-arm-carry-log.md
  requires: [docs/plans/PLAN-L6-70-left-arm-carry-log.md]
---

# PLAN-L7-430: 左腕差し戻しcarry log検出器

## 1. 完了条件

`U-CARRY-001..022`、PLAN lint、doctor、G7/trace-freeze入口、全回帰がgreenである。
