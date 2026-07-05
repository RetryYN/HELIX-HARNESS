---
plan_id: PLAN-REVERSE-121-branch-kind-check
title: "PLAN-REVERSE-121: branch-kind-check fullback の要件反映"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L3
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "要件は `github_issue_id` warning surface を branch-kind-check として明記した。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "この変更は既存 governance rule の実装であり、新しい architecture component は導入しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "checker は既存 doctor path へ配線された lint module である。"
agent_slots:
  - role: tl
    slot_label: "TL - branch-kind-check fullback 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-121-branch-kind-check.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-121-branch-kind-check.md
  requires:
    - docs/plans/PLAN-L7-121-branch-kind-check.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:45:00+09:00"
    tests_green_at: "2026-06-23T13:45:00+09:00"
    verdict: approve
    scope: "実装済み branch-kind-check を要件へ戻す R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\branch-kind.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: tests/branch-kind.test.ts
        output_digest: "sha256:d75b67733f22630222c3ddffdc379c691ba299b22da3109b1bb76114f93c630e"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: src/lint/branch-kind.ts
        output_digest: "sha256:27410a6c1ff6cad593bfa919427fb24189dd05dc1b7a63c12a15198ed6e84f08"
---

# PLAN-REVERSE-121: branch-kind-check fullback の要件反映

## 目的

branch-kind-check の実装結果を要件へ back-fill する。

## 範囲

- 要件 §6.8.2 は `github_issue_id` branch warning の surface として `branch-kind-check` を指す。
- 要件 §7.4 acceptance criteria は `github_issue_id` warning behavior を含む。

## 受入条件

- 実装済み checker と要件本文が同じ warning surface を明記している。
- R4 fullback evidence は L4/L5 impact が変わらないことを記録している。
