---
plan_id: PLAN-L7-34-tool-adapter-probes
title: "PLAN-L7-34 (add-impl): graph / diagram tool adapter probe 実装"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "U-TOOLADAPTER-001..010 を green tests へ昇格した。Tool adapter catalog/probe/normalization/diagram refresh は pure functions として実装済み。Critical 0 / Important 0。Missing packages/executables は findings のまま扱い、package install、external command execution、destructive auto-fix、raw adapter output gate truth は導入しない。"
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:05:58+09:00"
    tests_green_at: "2026-07-09T15:05:58+09:00"
    verdict: approve
    scope: "PLAN-L7-34 の過去 failed test evidence を削除せず、現行 fast suite の green evidence を追加して tool adapter probe 実装の passed test projection を回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:05:58+09:00"
        evidence_path: tests/tool-adapter.test.ts
        output_digest: "sha256:7d0cee1ae554c76191023c276a86d4c7de30817e13bfef210199234426869db4"
agent_slots:
  - role: tl
    slot_label: "TL - tool adapter probe 実装"
  - role: qa
    slot_label: "QA - U-TOOLADAPTER oracle"
generates:
  - artifact_path: src/lint/tool-adapter.ts
    artifact_type: source_module
  - artifact_path: tests/tool-adapter.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-33-tool-adapter-probes.md
  requires:
    - docs/plans/PLAN-L6-33-tool-adapter-probes.md
    - docs/plans/PLAN-REVERSE-34-tool-adapter-probes.md
---

# PLAN-L7-34 (add-impl): graph / diagram tool adapter probe 実装

## §0 位置づけ

これは optional graph/diagram tool adapter probes の将来 L7 実装エントリである。

> **スコープ改訂 (2026-06-10 PO 決定、IMP-131)**: 実装対象を「adapter probe profile」から **`helix setup graph-tools [--with ...]` セットアップコマンド + layer-context アナウンス**へ変更 (理由・境界は PLAN-L6-33 §0 / IMP-131 / A-124 境界注記)。adapter は insight 系 (gate truth でない) のため profile 化せず、setup で opt-in した project にのみ薄い正規化を配線する。MCP/verification profile (マストツール系) はこの降格対象外。`first slice = dependency-cruiser + Knip + Mermaid`、`Madge / Graphviz DOT / D2 は --with で conditional`。

## §1 エントリ条件

- PLAN-L6-33 で function contracts と U-TOOLADAPTER oracles が confirmed である。
- source changes の前に `tests/tool-adapter.test.ts` へ TDD Red case を追加する。
- package/executable readiness が証明されるまで optional adapters は disabled のままにする。

## §2 スコープ

エントリ条件を満たした後に許可する範囲:

- pure adapter catalog と probe functions。
- bounded evidence を `tool_runs`、`dependency_edges`、`diagram_artifacts`、findings へ normalization する。
- implicit package install や destructive auto-fix は行わない。

## §8 DoD

- [x] source implementation の前に Red test が存在する。
- [x] U-TOOLADAPTER-001..010 が pass する。
- [x] review の前に typecheck、lint、targeted tests が pass する。
- [x] lower-layer discoveries は Reverse fullback で close する。
