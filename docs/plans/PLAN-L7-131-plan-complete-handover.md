---
plan_id: PLAN-L7-131-plan-complete-handover
title: "PLAN-L7-131: plan complete handover"
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
    slot_label: "TL - plan complete handover"
generates:
  - artifact_path: docs/plans/PLAN-L7-131-plan-complete-handover.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-131-plan-complete-handover.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-04-handover-mechanism.md
  requires:
    - docs/plans/PLAN-L7-04-handover-mechanism.md
    - docs/plans/PLAN-REVERSE-131-plan-complete-handover.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:10:00+09:00"
    tests_green_at: "2026-06-23T16:10:00+09:00"
    verdict: approve
    scope: "CLI plan complete routes to completed handover and clears current-plan through runHandover."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\cli-surface.test.ts -t \"plan complete\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
---

# PLAN-L7-131: plan complete handover の完了引き継ぎ

## 目的

PLAN が完了していても、operator が別途 `handover --complete` command を
覚えて実行した場合だけ completed handover state が生成される、という手動 gap を解消する。

## スコープ

- PLAN lifecycle の entrypoint として `helix plan complete [id]` を追加する。
- すべての write と current-plan clear behavior は `runHandover({ complete: true })` を再利用する。
- `plan lint` は read-only のまま維持し、`plan use` は active marker update に限定する。
- `plan complete` が `status=completed` の `CURRENT.json` を書き込み、
  `.helix/state/current-plan` を消すことを示す CLI surface coverage を追加する。

## 受入条件

- `plan complete` は active current-plan に対して exit code 0 で終了する。
- `CURRENT.json` は `status=completed` と completed plan id を記録する。
- current-plan marker は同じ `runHandover` path で消される。
- 既存の handover tests は引き続き pass する。
