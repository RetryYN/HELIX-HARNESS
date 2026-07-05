---
plan_id: PLAN-L7-127-orchestration-degradation-record
title: "PLAN-L7-127: orchestration degradation record の記録"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - orchestration degradation record 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-127-orchestration-degradation-record.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-127-orchestration-degradation-record.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/vmodel/injection.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/vmodel-injection.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-122-vmodel-injection-show.md
  requires:
    - docs/plans/PLAN-L7-122-vmodel-injection-show.md
    - docs/plans/PLAN-REVERSE-127-orchestration-degradation-record.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T17:35:00+09:00"
    tests_green_at: "2026-06-23T17:35:00+09:00"
    verdict: approve
    scope: "V-model injection が hybrid-only orchestration modes の execution-mode degradation を記録する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\vmodel-injection.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T17:35:00+09:00"
        evidence_path: tests/vmodel-injection.test.ts
        output_digest: "sha256:2f96c00b1a8110ee1717e291a594c68faa1eb0a9d6fe711ee5b157b3b88ff920"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T17:35:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T17:35:00+09:00"
        evidence_path: src/vmodel/injection.ts
        output_digest: "sha256:09dfbf69280399fc50b720af5b68e4ee8b22e3d28d484997df818edcfceb9a10"
---

# PLAN-L7-127: orchestration degradation record の記録

## 目的

injected `orchestration_mode` が現在の execution mode では利用できない runtime を要求する場合、
明示的な degradation を記録する。

## スコープ

- V-model injection に execution-mode-aware degradation を追加する。
- `degraded_from`、`degraded_to`、`degradation_reason` を公開する。
- deterministic testing と local inspection のため、
  `helix vmodel show ... --injection` に `--mode <mode>` を追加する。
- requirements と L4 function design へ back-fill する。

## 受入条件

- `claude-only` の `agent/L7` は `claude_judge_codex_impl` から
  `claude_design_impl` への degradation を記録する。
- `hybrid` の `agent/L7` は degradation を記録しない。
- degradation が適用される場合、CLI JSON output は degradation fields を含む。
