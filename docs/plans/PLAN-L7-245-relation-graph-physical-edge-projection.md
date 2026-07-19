---
plan_id: PLAN-L7-245-relation-graph-physical-edge-projection
title: "PLAN-L7-245: relation graph physical edge projection"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-148 のうち DB dependency_edges.edge_kind の物理語彙化に限定した L7 実装。内部 RelationEdgeKind、impact expansion、trace_edges、projects_to / visualizes は後続に残す。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - dependency_edges physical vocabulary projection"
  - role: qa
    slot_label: "Explorer - edge vocabulary mapping risk review"
generates:
  - artifact_path: docs/plans/PLAN-L7-245-relation-graph-physical-edge-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L7-243-relation-graph-db-diagram-projection-hardening.md
    - docs/plans/PLAN-L7-244-relation-graph-scope-filter.md
    - docs/improvement-backlog.md
    - src/state-db/projection-writer.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T11:12:00+09:00"
    tests_green_at: "2026-07-03T11:12:00+09:00"
    verdict: approve
    scope: "DB dependency_edges.edge_kind に出る relation graph edge のうち、方向を安全に定義できる derives-from / generates / covered-by / behavioral-contract を L5 §9.5 物理語彙へ投影した。内部 RelationEdgeKind と trace_edges は維持し、pairs / upstream / projects_to / visualizes / impact_rules 語彙同期は残差にした。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/projection-writer.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:4ef333fe533e9e4a1af5c88b2418b02a2dac0d7a58b4043fc94a9ca37520c224"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:b30b6233d9ac1a0b7d3ccc62ca896e6b3e9255184ecfb7e295e63914b7c85ffd"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: docs/plans/PLAN-L7-245-relation-graph-physical-edge-projection.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: docs/improvement-backlog.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts db rebuild"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:0dde9073a0e1dba18c96d36e94ebd37c0520d5e5e4684b4c9ed602e389448c6d"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:12:00+09:00"
        evidence_path: docs/plans/PLAN-L7-245-relation-graph-physical-edge-projection.md
        output_digest: "sha256:77ba05b15102b56b45990459f0f68aad8dc5344f643e7008e40057e41eb98fe8"
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-245: relation graph の physical edge projection

## 0. 目的

`IMP-148` のうち、`dependency_edges.edge_kind` が内部 `RelationEdgeKind`
(`derives-from` / `generates` / `covered-by` 等) のまま DB に出ており、L5 physical-data §9.5 の
物理語彙 (`references` / `implements` / `tests` / `declares_module` 等) とズレていた。

本 PLAN は DB projection の境界だけを補正する。内部 relation graph の edge 型、impact expansion、
`trace_edges` は既存互換のため維持する。

## 1. 写像

`src/state-db/projection-writer.ts` の `dependency_edges` 投影時に次の写像を行う。

| 内部 edge | DB physical edge | 向き |
|---|---|---|
| `derives-from` | `references` | plan -> requirement |
| `generates` | `implements` | source -> plan |
| `covered-by` | `tests` | test -> source |
| `behavioral-contract` | `declares_module` | design -> source |

`pairs` は V-model artifact pair で required edge kinds に直接対応しないため維持する。
`upstream` は DB table -> requirement/ADR/PLAN の既存意味を持つが、L5 §9.5 の `projects_to`
(source doc/state/log -> DB table) とは方向も意味も異なるため、今回の写像対象にしない。

## 2. テスト

`tests/projection-writer.test.ts` に、`rebuildHarnessDb` の `dependency_edges` が
`references` / `implements` / `tests` / `declares_module` として保存されることを追加した。

## 3. 残す範囲

- `pairs` / `upstream` の物理語彙化方針。
- `impact_rules.trigger_edge_kind` と `dependency_edges.edge_kind` の語彙同期方針。
- `projects_to` edge の collector 設計。
- `visualizes` edge / diagram refresh action の collector・impact expansion 接続。
- Graphviz / D2 CLI renderer の実行と成果物ファイル保存。

これらは `IMP-148` の継続 scope とする。
