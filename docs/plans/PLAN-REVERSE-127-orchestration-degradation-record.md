---
plan_id: PLAN-REVERSE-127-orchestration-degradation-record
title: "PLAN-REVERSE-127: orchestration degradation 記録の fullback"
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
    reason: "execution-mode degradation の acceptance item は実装済みで検査対象になった。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "L4 は実装済みの degraded_from/degraded_to 記録 surface を指すようになった。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "実装は既存の V-model injection CLI 境界内に留まる。"
agent_slots:
  - role: tl
    slot_label: "TL - orchestration degradation fullback 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-127-orchestration-degradation-record.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-127-orchestration-degradation-record.md
  requires:
    - docs/plans/PLAN-L7-127-orchestration-degradation-record.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T17:35:00+09:00"
    tests_green_at: "2026-06-23T17:35:00+09:00"
    verdict: approve
    scope: "orchestration degradation 実装から requirements と L4 design への R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\vmodel-injection.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T17:35:00+09:00"
        evidence_path: tests/vmodel-injection.test.ts
        output_digest: "sha256:2f96c00b1a8110ee1717e291a594c68faa1eb0a9d6fe711ee5b157b3b88ff920"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T17:35:00+09:00"
        evidence_path: src/vmodel/injection.ts
        output_digest: "sha256:09dfbf69280399fc50b720af5b68e4ee8b22e3d28d484997df818edcfceb9a10"
---

# PLAN-REVERSE-127: orchestration degradation 記録の fullback

## 目的

execution-mode degradation 記録を requirements と L4 function design へ
back-fill する。

## 範囲

- Requirements §7.8.7 は実装済みの degradation surface を記録する。
- L4 function design は `degraded_from` / `degraded_to` を remaining stub として保持しない。

## 受入条件

- Requirements と L4 design はどちらも、実装済みの V-model injection degradation record を指す。
- Reverse record は degradation を human escalation boundary enforcement と分離したまま保持する。
