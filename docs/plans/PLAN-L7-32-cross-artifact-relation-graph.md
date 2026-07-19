---
plan_id: PLAN-L7-32-cross-artifact-relation-graph
title: "PLAN-L7-32 (add-impl): cross-artifact relation graph と verification profile projection"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-15
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-10"
    tests_green_at: "2026-06-10"
    verdict: pass
    scope: "collect+impact 2 機能 (U-RELGRAPH-001..006)。code-reviewer APPROVE / Critical 0。Important I-1 (test-design→paired design の behavioral-contract 逆引き) / I-3 (test-design 変更 oracle 追加) / m-2/m-4/m-5 を同サイクルで反映。hybrid だが Codex CLI が壊れ legacy のため intra_runtime_subagent review (cross-agent 不在を evidence に記録)。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-sonnet-4-6
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:02:33+09:00"
    tests_green_at: "2026-07-09T16:02:33+09:00"
    verdict: approve
    scope: "PLAN-L7-32 の execution evidence 欠落を、現行 ddd-tdd-rules / relation-graph / doctor targeted green と typecheck で補い、cross-artifact relation graph collect/impact の passed evidence を harness.db に投影できる状態へ回復した。"
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
    slot_label: "TL - relation graph implementation"
  - role: qa
    slot_label: "QA - relation graph oracles"
generates:
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph.test.ts
    artifact_type: test_code
  # §9 discharge (2026-06-15): graph CLI loader + subcommand を実装済み
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
  requires:
    - docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
    - docs/plans/PLAN-REVERSE-32-cross-artifact-relation-graph.md
---

# PLAN-L7-32 (add-impl): cross-artifact relation graph と verification profile projection

## §0 位置づけ

この PLAN は、A-124 / A-125 の relation graph source work に対して承認された唯一の L7 実装 entry である。PLAN-RECOVERY-03 で ad-hoc な source 作成が危険だと確認されたため、この PLAN を正規経路とする。

## §1 Entry Conditions（開始条件）

実装は、次の条件が満たされるまで開始してはならない。

- PLAN-L6-31 で function signatures と U-* oracles が confirmed になっている。
- `tests/relation-graph.test.ts` を TDD Red entry として先に作成し、実装不在だけを理由に失敗している。
- 既存の `verification-profile` tests が green のまま維持されている。
- raw MCP response、browser trace、screenshot、provider transcript、secret、credential を projection rows に保存しない。

## §2 実装 Scope

> **粒度ドクトリン適用 (DISCOVERY-05 §4.4 D3、PO 2026-06-10)**: relation-graph 4 関数を 2 span に分割。
> 本 PLAN = **collect + impact の 2 機能** (U-RELGRAPH-001..006)。export + verification-evidence-projection
> (U-RELGRAPH-007..010) は **PLAN-L7-36** へ分離 (TDD 2× で 1 cycle に収める)。

entry conditions を満たした後に許可する実装範囲は次の通りである (本 span = 2 機能)。

- `src/lint/relation-graph.ts`: `collectRelationGraphProjection` (U-RELGRAPH-001..003) + `analyzeRelationImpact` (U-RELGRAPH-004..006) の pure projection / impact 解析。
- `tests/relation-graph.test.ts`: 上記 2 機能の unit fixtures (U-RELGRAPH-001..006 を it.todo → it 昇格)。
- CLI wiring (`helix graph impact`) は pure functions green 後。

本 PLAN の対象外は次の通りである。

- 実際の external tool installation。
- A-125 readiness gates を超える実際の MCP server invocation。
- DB collector / rebuild profile が confirmed になる前の SQLite write path。

## §3 作業 Schedule

### Step 1: [直列] TDD Red oracle

直列理由: downstream_dependency。source を追加する前に、relation graph contract が実装不在で失敗する必要がある。

### Step 2: [直列] Pure projection functions

直列理由: downstream_dependency。CLI / DB writer は deterministic な pure output に依存しなければならない。

**進捗 (2026-06-10、塊C span)**:
- 第1段: `collectRelationGraphProjection` (U-RELGRAPH-001..003) を `src/lint/relation-graph.ts` に実装、001..003 を green 昇格 (node 安定 ID + typed edge + (kind,id,path) dedup / DB table upstream + orphan finding / sanitization で raw payload 非複製)。
- 第2段: `analyzeRelationImpact` (U-RELGRAPH-004..006) を実装、004..006 を green 昇格。source 変更→sibling test/L6 design contract/L7 oracle/PLAN/reverse-backprop へ展開、design/test-design/physical-data 変更→paired artifact/DB table/PLAN DoD/trace-freeze へ展開 (behavioral-contract edge 無ければ source test 非要求)、missing-projection/stale-edge は ok=false finding (`analyzeChangeImpact` へ無音 fallback しない)。

**これで PLAN-L7-32 (collect+impact 2 機能) 実装完了**。green + review 前置後に confirmed → G-L7.C1 reached。export+evidence (007..010) は PLAN-L7-36。

### Step 3: [並列] CLI smoke と docs back-fill

pure function が green になった後、CLI smoke と doc back-fill は並列に進めてよい。

### Step 4: [直列] review

直列理由: downstream_dependency。review evidence を記録する前に、typecheck / lint / vitest / doctor が green でなければならない。

## §8 DoD

- [x] source implementation より前に Red test が存在する。
- [x] `bun run test tests/relation-graph.test.ts tests/verification-profile.test.ts` passes.
- [x] `bun run typecheck`, `bun run lint`, and `bun run src/cli.ts doctor` pass.
- [x] Reverse fullback により governance / backlog additions が close されている。

## §9 Discharged — `helix graph impact|export` CLI (2026-06-15、PO 指示で前倒し実装)

2026-06-15 L7 完全実装監査 (PLAN-L7-52) で「PLAN §2 が予告した `helix graph impact` CLI が未実装・formal defer 記録なし」が指摘され、本節で `explicit_l7_defer` として明示記録していた。**2026-06-15 PO 指示 (キャリー解消) で前倒し実装し discharge した。**

- **実装内容 (discharge)**:
  - **repo→`RelationGraphSourceSet` loader** = `src/graph/loader.ts` (`loadRelationGraphSourceSet(repoRoot)`)。既存 loader を再利用 (`loadImplPlanTraceInput` で src/**, `loadReviewPlans` + frontmatter で plan generates/FR refs, `loadPairDocs` で design↔test-design pair, tests import 解析で source→test covered-by)。db-table node のみ projection-writer 経由 (`rebuildHarnessDb` の `input.relationGraph`) で別供給に集約 (loader は doc/source graph に集中)。
  - **CLI surface** = `helix graph impact --changed <path...>` (loader → `collectRelationGraphProjection` → `analyzeRelationImpact`、changedNodes/impacted/actions/findings 出力、error finding で exit 1) / `helix graph export --format mermaid|dot|d2 [--scope]` (→ `exportRelationDiagram`、mermaid 常時 / dot・d2 は純粋テキスト emit、外部 renderer は起動しない)。`src/cli.ts` の `graph` command group。
  - **テスト** = `tests/relation-graph-loader.test.ts` (plan→source / source→test / design→test-design edge 生成 + 純関数結合 impact/export + 空 repo fail-open)。
- **first slice (既存)**: `helix verify recommend --changed <path>` は引き続き changed-file → profile trigger の Mermaid impact evidence を emit (用途別の補完導線)。
- **残 follow-up (任意、別 scope)**: ① db-table node の loader 取り込み (現状 projection-writer 供給)、② `--scope` の per-scope 絞り込み (現状 full export + scope ラベル表示のみ)、③ dependency-cruiser / Graphviz 等の外部 adapter 連携 (ADR-002 A-124 の DB-backed expansion 本体)。これらは本 CLI slice の価値を阻害しない増分。
