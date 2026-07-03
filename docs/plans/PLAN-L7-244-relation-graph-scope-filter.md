---
plan_id: PLAN-L7-244-relation-graph-scope-filter
title: "PLAN-L7-244: relation graph export scope filter"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-148 のうち CLI scope filtering に限定した L7 実装。edge vocabulary 完全同期、visualizes refresh、外部 renderer 実行は引き続き IMP-148 に残す。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - graph export scope filter implementation"
  - role: qa
    slot_label: "Explorer - IMP-148 split recommendation"
generates:
  - artifact_path: docs/plans/PLAN-L7-244-relation-graph-scope-filter.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/relation-graph.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
    - docs/improvement-backlog.md
    - src/lint/relation-graph.ts
    - src/cli.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:20:00+09:00"
    tests_green_at: "2026-07-03T21:20:00+09:00"
    verdict: approve
    scope: "IMP-148 を一括実装せず、graph export --scope の安全な repo-relative filtering に限定して実装した。absolute path / .. は fail-close。edge vocabulary 完全同期、visualizes refresh、外部 renderer 実行は残差として維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/relation-graph.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: tests/relation-graph.test.ts
        output_digest: "sha256:d8ced877c29a42b401245caf8a4297922bbf4a9787f9205e124103811ec7b2cd"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: src/lint/relation-graph.ts
        output_digest: "sha256:b30b6233d9ac1a0b7d3ccc62ca896e6b3e9255184ecfb7e295e63914b7c85ffd"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: docs/plans/PLAN-L7-244-relation-graph-scope-filter.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:0dde9073a0e1dba18c96d36e94ebd37c0520d5e5e4684b4c9ed602e389448c6d"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:20:00+09:00"
        evidence_path: docs/plans/PLAN-L7-244-relation-graph-scope-filter.md
        output_digest: "sha256:77ba05b15102b56b45990459f0f68aad8dc5344f643e7008e40057e41eb98fe8"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-244: relation graph export scope filter

## 0. 目的

`IMP-148` は relation graph §9.5 の残差を束ねているが、edge vocabulary 完全同期、外部 renderer
実行、`visualizes` refresh 接続を同時に扱うと意味変更が大きい。

本 PLAN は安全な最小 slice として、既存 `graph export --scope` を「表示だけ」から実フィルタへ進める。

## 1. 実装

- `src/lint/relation-graph.ts`
  - `filterRelationGraphProjectionByScope(projection, scope)` を追加。
  - scope に一致する node と、その node に隣接する edge / endpoint node を残す。
  - `repo` / `.` / 未指定は no-op。
  - `isSafeRelationGraphScope(scope)` で repo-relative prefix だけを許可する。
- `src/cli.ts`
  - `graph export --scope <prefix>` で projection をフィルタしてから diagram export する。
  - absolute path や `..` を含む scope は `invalid-scope` で fail-close。

## 2. テスト

- `tests/relation-graph.test.ts`: pure filter と scope safety を検証。
- `tests/cli-surface.test.ts`: `graph export --scope src/widget` が scope 外 node を出さず、
  `--scope ../src` が fail-close することを検証。

## 3. 残す範囲

- L5 §9.5 required edge kinds と現 `RelationEdgeKind` の完全同期。
- `visualizes` edge / diagram refresh action の collector・impact expansion 接続。
- Graphviz / D2 CLI renderer の実行と成果物ファイル保存。

これらは `IMP-148` の継続 scope とする。
