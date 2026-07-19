---
plan_id: PLAN-L6-70-left-arm-carry-log
title: "PLAN-L6-70 (add-design): 左腕差し戻しcarry log"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I6のcarry log機械強制"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存L07工程の差し戻し規範を機械契約へ具体化する。"
parent_design: docs/design/harness/L3-functional/gate-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: se, slot_label: "SE - carry contractとgate binding" }
  - { role: qa, slot_label: "QA - 時系列と偽証拠の敵対検証" }
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-11T21:28:29Z"
    reviewed_at: "2026-07-11T21:28:40Z"
    verdict: approve_after_fixes
    scope: "左腕carryのL6/L8 Vペア、strict loader、時系列、global replay、legacy baseline、doctor/G7配線をseverity-firstで再監査した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/left-arm-carry-log.test.ts tests/frontmatter.test.ts tests/gate-static.test.ts tests/slow/doctor.test.ts tests/coding-rules.test.ts -t 'U-CARRY|G6|G7|real repo guard'", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T21:28:29Z", evidence_path: tests/left-arm-carry-log.test.ts, output_digest: "sha256:99b298447211e3550e0fa570d2a55959ac68282ec78bf98427fba90e8ed19657" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-430-left-arm-carry-log.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T21:28:29Z", evidence_path: docs/plans/PLAN-L7-430-left-arm-carry-log.md, output_digest: "sha256:93c52b5c93d1332e54aedae07b0e332aea6aa4a0c00d2ac7d54c4d0b8f42c37f" }
      - { kind: lint, command: "npm run lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T21:28:29Z", evidence_path: src/lint/left-arm-carry-log.ts, output_digest: "sha256:4661ed739cefa02fbd7eeab1d14207d4720cfa257cb848e50940434b9a2ccfa5" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T21:28:29Z", evidence_path: src/lint/left-arm-carry-log.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-70-left-arm-carry-log.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/left-arm-carry-log.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/process/forward/L07-implementation.md, artifact_type: doc_update }
dependencies:
  parent: docs/plans/PLAN-L6-69-triage-decision-integrity.md
  requires: [docs/plans/PLAN-L6-69-triage-decision-integrity.md]
---

# PLAN-L6-70: 左腕差し戻しcarry log設計

## 1. 完了条件

- 差し戻しmapping、resolution Vペア、gate再通過、review時系列をL6/L8で凍結する。
- no-pushback自己申告もtechnical reviewへ結合する。
