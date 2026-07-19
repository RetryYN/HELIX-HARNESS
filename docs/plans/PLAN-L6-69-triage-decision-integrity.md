---
plan_id: PLAN-L6-69-triage-decision-integrity
title: "PLAN-L6-69 (add-design): triage判断整合性"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I4/I7の判断を機械固定"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存triage判断を具体化し上位要求は変更しない。"
parent_design: docs/design/harness/L3-functional/gate-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: se, slot_label: "SE - triage判断契約" }
  - { role: qa, slot_label: "QA - 同時縮退敵対検証" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-69-triage-decision-integrity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/triage-decision-integrity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/system-review-triage-decisions.yaml, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L6-68-active-plan-selection.md
  requires: [docs/plans/PLAN-L6-68-active-plan-selection.md]
review_evidence:
  - reviewer: codex-active-plan-final-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T20:40:19Z"
    tests_green_at: "2026-07-11T20:39:57Z"
    verdict: approve_after_fixes
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "triage exact pin、同時縮退、未列挙10件authority、terminal gate、doctor配線、L6 exact contractを再監査しblocker/high 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/triage-decision-integrity.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T20:21:44Z", evidence_path: tests/triage-decision-integrity.test.ts, output_digest: "sha256:33ed5bf76eb85c8cf725d63889f8173733094850ae13dcbafd604bc6664c9be4" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T20:21:44Z", evidence_path: src/lint/triage-decision-integrity.ts, output_digest: "sha256:b22b2fc1692230f659b20acc0db4af0d9894dd8c1fc6d2dbda99892c2d36236c" }
---

# PLAN-L6-69: triage判断整合性設計

## 1. 目的

PLAN-L7-425 I4/I7の判断を、独立pinを持つfail-close契約へ落とす。

## 2. 完了条件

- L6契約とL8 oracleがVペアを作る。
- catalog 3件、system保留、backlog 14件、IMP-118残差、未列挙10件を網羅する。
