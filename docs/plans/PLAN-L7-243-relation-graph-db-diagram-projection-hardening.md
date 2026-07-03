---
plan_id: PLAN-L7-243-relation-graph-db-diagram-projection-hardening
title: "PLAN-L7-243: relation graph DB/diagram projection hardening"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "既存 A-124 / L6-31 / L7-32 の範囲内で L7 実装穴を補正し、残差は docs/improvement-backlog.md の IMP-148 に分離する。新規上位要求 ID や schema 破壊変更は追加しない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - IMP-118/119 精読・実装修正・残差分離"
  - role: qa
    slot_label: "Explorer - IMP-118/119 実装実態の読み取り専用精査"
generates:
  - artifact_path: docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
    - docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
    - docs/improvement-backlog.md
    - src/lint/relation-graph.ts
    - src/schema/harness-db-tables-graph.ts
    - src/state-db/projection-writer.ts
    - tests/relation-graph.test.ts
    - tests/relation-graph-loader.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T20:40:00+09:00"
    tests_green_at: "2026-07-03T20:40:00+09:00"
    verdict: approve
    scope: "IMP-118/119 を精読し、CLI d2 fallback、diagram_artifacts projection 欠落、impact_results root/impacted 混同を修正した。edge vocabulary 完全同期、scope filtering、外部 renderer 実行は IMP-148 として残し、完了過大主張を避ける。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/relation-graph.test.ts tests/relation-graph-loader.test.ts tests/cli-surface.test.ts tests/projection-writer.test.ts tests/db-projection-ingestion.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:0c9be72517f3e5b02cf4b22a3e6dc8c835984dc83203a0ee8842aa79c0d9290a"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:b30b6233d9ac1a0b7d3ccc62ca896e6b3e9255184ecfb7e295e63914b7c85ffd"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: src/lint/db-projection-ingestion.ts
        output_digest: "sha256:0dde9073a0e1dba18c96d36e94ebd37c0520d5e5e4684b4c9ed602e389448c6d"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:40:00+09:00"
        evidence_path: docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
        output_digest: "sha256:77ba05b15102b56b45990459f0f68aad8dc5344f643e7008e40057e41eb98fe8"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-243: relation graph DB/diagram projection hardening

## 0. 目的

`IMP-118` / `IMP-119` は 2026-06-09 時点で relation graph / impact / diagram export が未実装として
残っていた。現 HEAD には `collectRelationGraphProjection`、`analyzeRelationImpact`、
`exportRelationDiagram`、`ut-tdd graph impact/export`、`graph_nodes` / `dependency_edges` /
`impact_rules` / `impact_results` / `graph_snapshots` の射影が存在する。

ただし精読で、以下の実装穴が残っていた:

- CLI `graph export --format d2` が `mermaid` に丸められ、要求された D2 surface を実際には持っていない。
- `diagram_artifacts` は table 定義だけで、`rebuildHarnessDb` から自動射影されていない。
- `impact_results.root_node_id` と `impacted_node_id` がどちらも `action.nodeId` になり、変更 root と波及先を分離できない。

本 PLAN はこの3点を L7 実装として修正する。同時に、L5 §9.5 の edge vocabulary 完全同期や
外部 renderer 実行までを今回の完了に含めず、`IMP-148` へ分離する。

## 1. 実装

- `src/cli.ts`: `graph export --format mermaid|dot|d2` を正式に受け付け、未知 format は
  `invalid-format` で fail-close にした。DOT/D2 はこの段階では外部コマンドを起動せず、組み込み text
  export として扱う。
- `src/state-db/projection-writer.ts`: `graph_snapshots` から標準3形式
  (`mermaid`, `dot`, `d2`) の `diagram_artifacts` 行を安定IDで射影する。
- `src/lint/db-projection-ingestion.ts`: `diagram_artifacts` を evidence-gated zero から自動射影必須表へ移し、
  空のまま doctor が通る穴を塞ぐ。
- `src/state-db/projection-writer.ts`: working-tree impact の永続化で、`root_node_id` を変更 node、
  `impacted_node_id` を required action target として分離する。

## 2. テスト

- `tests/cli-surface.test.ts`: Mermaid / DOT / D2 CLI export と unknown format fail-close を検証。
- `tests/projection-writer.test.ts`: rebuild で `diagram_artifacts` が非空になること、`impact_results` の
  root/impacted が分離されることを検証。
- `tests/db-projection-ingestion.test.ts`: `diagram_artifacts` が自動射影必須表として fail-close 対象になることを検証。

## 3. 残差分離

今回の実装で `IMP-119` の DB/CLI 欠落は閉じる。一方、次は本 PLAN の範囲外として残す:

- L5 §9.5 の `imports` / `references` / `declares_module` / `implements` / `tests` /
  `projects_to` / `visualizes` と、現 `RelationEdgeKind` の完全同期。
- `graph export --scope` の実フィルタリング (**PLAN-L7-244 で解消済み**)。
- Graphviz SVG/PDF/PNG や D2 CLI renderer の実行・成果物ファイル保存。
- `visualizes` edge と diagram refresh action の graph collector / impact expansion 接続。

これらは `IMP-148` として継続管理する。`IMP-118` は中核実装済みだが残差ありの `triaged`、
`IMP-119` は今回の補正で `implemented` とする。
