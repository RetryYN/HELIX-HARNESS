---
plan_id: PLAN-L7-429-triage-decision-integrity
title: "PLAN-L7-429 (impl): triage判断整合性検出器"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I4/I7のfalse completion防止"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "L6 triage判断契約を実装へ降下する。"
parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-001, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-002, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-003, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-004, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-005, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-006, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-007, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-008, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-009, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-010, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-011, test_path: tests/triage-decision-integrity.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/triage-decision-integrity.md, oracle_id: U-TRIAGE-012, test_path: tests/slow/doctor.test.ts }
agent_slots:
  - { role: se, slot_label: "SE - analyzerとdoctor配線" }
  - { role: qa, slot_label: "QA - adversarial fixture" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-429-triage-decision-integrity.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/triage-decision-integrity.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/triage-decision-integrity.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-69-triage-decision-integrity.md
  requires: [docs/plans/PLAN-L6-69-triage-decision-integrity.md]
review_evidence:
  - reviewer: codex-active-plan-final-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T20:21:44Z"
    tests_green_at: "2026-07-11T20:21:44Z"
    verdict: approve_after_fixes
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "実装・敵対fixture・PLAN固有Vペア・doctor hard gateを4巡監査しblocker/high 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/triage-decision-integrity.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T20:21:44Z", evidence_path: tests/triage-decision-integrity.test.ts, output_digest: "sha256:33ed5bf76eb85c8cf725d63889f8173733094850ae13dcbafd604bc6664c9be4" }
      - { kind: unit_test, command: "bunx vitest run tests/slow/doctor.test.ts -t U-TRIAGE-012", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T20:19:09Z", evidence_path: tests/slow/doctor.test.ts, output_digest: "sha256:d92d2265507772c9a9f85a42c19abe3467377d6366c7fd492ec565deced164d7" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T20:23:00Z", evidence_path: src/lint/triage-decision-integrity.ts, output_digest: "sha256:b22b2fc1692230f659b20acc0db4af0d9894dd8c1fc6d2dbda99892c2d36236c" }
---

# PLAN-L7-429 triage判断整合性検出器実装

## 1. 目的

triage判断manifestと実sourceを突合し、doctor hard gateへ接続する。

## 2. 実装範囲

- 厳密なloader・analyzer・message生成
- 独立期待集合pin
- adversarial unit testsとreal repository test
- doctor hard gateへの配線

## 3. 完了条件

`U-TRIAGE-001..012`と全体回帰がgreen、独立reviewのblocker/highが0。
