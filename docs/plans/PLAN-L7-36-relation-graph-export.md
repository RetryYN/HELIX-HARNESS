---
plan_id: PLAN-L7-36-relation-graph-export
title: "PLAN-L7-36 (add-impl): relation graph export + verification-evidence projection (L7-32 分割の後半 2 機能)"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-10
updated: 2026-06-11
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "U-RELGRAPH-007..010 は it.todo から green tests へ昇格済み。exportRelationDiagram と collectVerificationEvidenceProjection は pure deterministic projections として実装済み。Critical 0 / Important 0。外部 adapter 実行は対象外のまま。利用不可の DOT/D2 は findings のみ返す。Raw MCP/tool payload、screenshots、traces、provider transcript、secret-like fields は projection しない。"
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:02:33+09:00"
    tests_green_at: "2026-07-09T16:02:33+09:00"
    verdict: approve
    scope: "PLAN-L7-36 の execution evidence 欠落を、現行 ddd-tdd-rules / relation-graph / doctor targeted green と typecheck で補い、relation graph export / verification-evidence projection の passed evidence を harness.db に投影できる状態へ回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/ddd-tdd-rules.test.ts tests/relation-graph.test.ts tests/relation-graph-loader.test.ts tests/doctor.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:02:33+09:00"
        evidence_path: tests/relation-graph.test.ts
        output_digest: "sha256:bfdf4b24481071c586289c2010d03c34e4020c94a8851e8fe931d2fafc49d40e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:02:33+09:00"
        evidence_path: src/lint/relation-graph.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
agent_slots:
  - role: tl
    slot_label: "TL - relation graph export 実装レビュー (別 runtime)"
  - role: qa
    slot_label: "QA - U-RELGRAPH-007..010 oracle"
generates:
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
    - docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
---

# PLAN-L7-36 (add-impl): relation graph export と verification-evidence projection の実装

## §0 位置づけ

DISCOVERY-05 §4.4 D3 (粒度 = 1〜3 機能) に従い、L7-32 (relation-graph 4 関数) を 2 span に分割した
**後半 2 機能**。前半 (collect + impact = L7-32) の pure projection が green になってから着手する
(同一 `src/lint/relation-graph.ts` を拡張するため downstream_dependency)。

## §1 開始条件

- PLAN-L7-32 (collect + impact、U-RELGRAPH-001..006) が green。
- `tests/relation-graph.test.ts` に U-RELGRAPH-007..010 の Red oracle が存在 (scaffold 済み `it.todo`)。
- projection 行に raw MCP response / browser trace / screenshot / provider transcript / secret を保存しない。

## §2 実装範囲 (本 span = 2 機能)

- `exportRelationDiagram` (U-RELGRAPH-007..008): snapshot → 決定的 Mermaid + DOT/D2 unavailable-adapter finding。
- `collectVerificationEvidenceProjection` (U-RELGRAPH-009..010): A-125 evidence record → projection 行 (raw payload 除外)。

対象外: 実外部ツール実行、SQLite write path。

## §3 作業予定

### Step 1: [直列] exportRelationDiagram を Red→Green (U-RELGRAPH-007..008)

直列理由: downstream_dependency. L7-32 の pure projection (snapshot 型) に依存。

### Step 2: [直列] collectVerificationEvidenceProjection を Red→Green (U-RELGRAPH-009..010)

直列理由: file_conflict. 同一 relation-graph.ts を Step 1 と続けて書く。

### Step 3: [直列] review (固定 review Step)

直列理由: downstream_dependency. typecheck / lint / vitest / doctor green 後に review evidence を記録する。

## §6 用語更新 (§G.9)

| 語 | 定義 | 確定経路 |
|---|---|---|
| exportRelationDiagram | relation graph snapshot を決定的 Mermaid/DOT/D2 へ。raw evidence payload 不含 | L7 impl で glossary back-merge |
| collectVerificationEvidenceProjection | A-125 verification-evidence-v1 を projection 行へ (summary/classification のみ) | 同上 |

## §8 完了条件

- [x] U-RELGRAPH-007..010 は `tests/relation-graph.test.ts` で `it.todo` から green の `it` に昇格済み。
- [x] review 前に `bun run typecheck`、`bun run lint`、targeted `bun run vitest run tests/relation-graph.test.ts` が green。
- [x] PLAN-REVERSE-32 (relation graph fullback) に L7-36 merge declaration がある。
