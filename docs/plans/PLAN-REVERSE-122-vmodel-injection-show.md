---
plan_id: PLAN-REVERSE-122-vmodel-injection-show
title: "PLAN-REVERSE-122: vmodel injection show の fullback"
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
    reason: "vmodel injection acceptance item は実装済みで検査済み。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "以前の orchestration_mode cell-matrix stub note は実装済み CLI surface を指す。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "実装は既存の schema enums と CLI module boundary を使う。"
agent_slots:
  - role: tl
    slot_label: "TL - vmodel injection fullback 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-122-vmodel-injection-show.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-122-vmodel-injection-show.md
  requires:
    - docs/plans/PLAN-L7-122-vmodel-injection-show.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T14:20:00+09:00"
    tests_green_at: "2026-06-23T14:20:00+09:00"
    verdict: approve
    scope: "vmodel injection 実装から requirements と L4 design への R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\vmodel-injection.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T14:20:00+09:00"
        evidence_path: tests/vmodel-injection.test.ts
        output_digest: "sha256:2f96c00b1a8110ee1717e291a594c68faa1eb0a9d6fe711ee5b157b3b88ff920"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T14:20:00+09:00"
        evidence_path: src/vmodel/injection.ts
        output_digest: "sha256:09dfbf69280399fc50b720af5b68e4ee8b22e3d28d484997df818edcfceb9a10"
---

# PLAN-REVERSE-122: vmodel injection show の fullback

## 目的

実装済みの V-model injection CLI surface を requirements と L4 function design へ back-fill する。

## スコープ

- Requirements §7.8.4 acceptance は実装済み surface を記録する。
- L4 function design は cell matrix を pure stub として扱わない。
- Execution-mode degradation recording は別の §7.8.7 acceptance item として維持する。

## 受入条件

- Requirements と L4 design の両方が `helix vmodel show ... --injection` を指す。
- Reverse record は残りの degraded-mode scope を明示する。
