---
plan_id: PLAN-REVERSE-125-route-legacy-command-gate
title: "PLAN-REVERSE-125: route legacy command gate の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "legacy runtime command の acceptance item は実装済みで、検査対象になった。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "Route eval は route-map command validation と fail-close behavior を記載するようになった。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "この変更は既存の RecommendedCommandV1 schema と CLI/workflow boundaries を使う。"
agent_slots:
  - role: tl
    slot_label: "TL - route legacy command fullback レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-125-route-legacy-command-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-125-route-legacy-command-gate.md
  requires:
    - docs/plans/PLAN-L7-125-route-legacy-command-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:40:00+09:00"
    tests_green_at: "2026-06-23T16:40:00+09:00"
    verdict: approve
    scope: "route legacy command gate から requirements と L4 design への R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:40:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:40:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-REVERSE-125: route legacy command gate の fullback

## 目的

route legacy command gate を requirements と L4 function design へ back-fill する。

## 範囲

- Requirements §7.8.2 / §7.8.6 は、実行可能な `helix` command restriction を記録する。
- L4 function design は、route-map command outputs を検証し、fail closed することを明記する。

## 受入条件

- Requirements と L4 design の両方が legacy command fail-close rule に触れている。
- Reverse record は、この変更を既存の route evaluation contracts の内側に保つ。
