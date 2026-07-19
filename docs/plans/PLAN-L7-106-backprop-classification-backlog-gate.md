---
plan_id: PLAN-L7-106-backprop-classification-backlog-gate
title: "PLAN-L7-106: Backprop classification backlog gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - backlog backprop classification gate"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-106-backprop-classification-backlog-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-106-backprop-classification-backlog-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/improvement-backlog.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/improvement-backlog.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-105-artifact-type-path-governance-gate.md
  requires:
    - docs/plans/PLAN-L7-105-artifact-type-path-governance-gate.md
    - docs/plans/PLAN-REVERSE-106-backprop-classification-backlog-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-22"
    tests_green_at: "2026-06-22"
    verdict: approve
    scope: "Improvement backlog lower-layer backprop classification lint, doctor hard gate, and regression tests"
    worker_model: codex
    reviewer_model: codex-intra-runtime
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:16:23+09:00"
    tests_green_at: "2026-07-09T15:16:23+09:00"
    verdict: approve
    scope: "PLAN-L7-106 の execution evidence 欠落を、現行 plan-lint / improvement-backlog / gate-confirm / merged-plan-status targeted green と typecheck で補い、backprop classification backlog gate の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/plan-lint.test.ts tests/improvement-backlog.test.ts tests/gate-confirm.test.ts tests/merged-plan-status.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: tests/improvement-backlog.test.ts
        output_digest: "sha256:e50d9080733a80eafd2463820e4d0e72d7ea2482e71459043e79b8ad2efa72ec"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:16:23+09:00"
        evidence_path: src/lint/improvement-backlog.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-106: Backprop classification backlog gate（backprop classification backlog gate の分類管理）

## 目的

lower-layer Reverse の back-propagation findings が、機械可読な disposition を持たないまま
improvement backlog に残り続けることを防ぐ。

## Scope

- `improvement-backlog` lint に `missingBackpropClassification` を追加する。
- lower-layer または backprop handling を明示的に言及する backlog row には、6 つの
  classification fields を必須にする。
- 新しい finding を既存の doctor hard gate へ接続する。
- IMP-117 に、この gate が必須化する同じ classification fields を backfill する。

## 受入条件

- classification fields を持たない lower-layer/backprop backlog row は fail する。
- 6 つの fields をすべて持つ lower-layer/backprop backlog row は pass する。
- 現行の `docs/improvement-backlog.md` に missing backprop classifications が 0 件である。
- `bun test tests/improvement-backlog.test.ts` が pass する。
- `bun run typecheck` が pass する。
- `bun run lint` が pass する。
- `bun run src\cli.ts doctor` が pass する。
