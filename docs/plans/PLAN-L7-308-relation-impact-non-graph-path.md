---
plan_id: PLAN-L7-308-relation-impact-non-graph-path
title: "PLAN-L7-308 (impl): relation graph impact の非グラフ path 分類"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Claude
parent_design: docs/design/harness/L6-function-design/module-drift.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
backprop_decision: not_required
backprop_decision_reason: "既存 analyzeRelationImpact (PLAN-L7-32/36/142) の誤分類是正。missing-projection の対象を『グラフ走査対象クラス配下の node 欠落』に限定し、定義上グラフ外の path (config doc / skill doc / directory / archived plan) を non-graph-path (info) に分類する。新規 L1/L3 要求なし。U-RELGRAPH-006 の no-silent-fallback 規律は node 期待 path に対して維持。"
agent_slots:
  - role: tl
    slot_label: "TL - relation impact path 分類境界"
generates:
  - artifact_path: docs/plans/PLAN-L7-308-relation-impact-non-graph-path.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph-types.ts
    artifact_type: source_module
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-142-relation-graph-requirement-nodes.md
  requires:
    - docs/plans/PLAN-L7-142-relation-graph-requirement-nodes.md
review_evidence:
  - reviewer: codex-linnaeus
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T03:15:23+09:00"
    tests_green_at: "2026-07-04T03:14:11+09:00"
    verdict: approve
    scope: "PLAN-L7-308 の non-graph-path / missing-projection 境界をレビュー。初回 request_changes の後、未追跡 directory 丸め込みを `loadChangedFiles(--untracked-files=all)` で file 単位へ展開し、tracked prefix 配下 directory は missing-projection fail-close に是正。`src/new/` は missing-projection / exit 1、docs/skills と非走査対象 directory は non-graph-path を確認済み。"
    worker_model: claude
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/relation-graph.test.ts tests/relation-graph-loader.test.ts tests/change-impact.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T03:14:11+09:00"
        evidence_path: tests/relation-graph.test.ts
        output_digest: "sha256:f16191bca97863b5a66c2c6fe05da7b8ccc74e13b20b0868aa94ccbbca9a6bf5"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T03:14:11+09:00"
        evidence_path: src/lint/relation-graph.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: smoke
        command: "bun run src/cli.ts graph impact"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T03:14:11+09:00"
        evidence_path: src/lint/relation-graph.ts
        output_digest: "sha256:7fc51ead715bfeaf804db529d89ad895673e1e256769b54724c2458520ad7b9a"
---

# PLAN-L7-308: relation graph impact の非グラフ path 分類

## 0. 目的

`helix graph impact` が「変更 path に relation-graph node が無い」場合、その path が
**グラフ走査対象クラス配下か否かを問わず** `missing-projection` error にしていた。このため
config doc (`.claude/CLAUDE.md`)、skill doc (`docs/skills/*`)、非走査対象 directory、archived plan
(`docs/plans/*` の status=archived) を変更しただけで impact gate が fail していた
(Codex stop-review が Claude commit で検出)。

`analyzeRelationImpact` は loader (`src/graph/loader.ts`) が node 化する path クラス配下の
node 欠落のみを `missing-projection` (error) とし、定義上グラフ外の path は `non-graph-path`
(info) に分類する。これにより gate は正しい signal を返す。

## 1. スコープ

- `GRAPH_TRACKED_PATH_PREFIXES` / `isGraphTrackedPath` を relation-graph.ts に追加
  (loader の走査対象 = src/ tests/ docs/plans/ docs/design/ docs/test-design/ docs/process/
  .claude/agents/ .helix/review/ .helix/evidence/g8-integration/ と一致)。
- loader が archived plan の path を `trackedExcludedPaths` として source set → projection に運ぶ。
- `analyzeRelationImpact`: node 欠落 path が非走査対象 / archived plan なら
  `non-graph-path` (info、ok を落とさない)、走査対象配下の node 欠落は従来どおり
  `missing-projection` (error)。
- `loadChangedFiles`: git status の未追跡 directory 丸め込みで走査対象配下の新規 file 群が
  `non-graph-path` に倒れないよう、`--untracked-files=all` で file 単位へ展開する。

## 2. 対象外

- 走査対象クラス配下の node 欠落を error にする規律 (U-RELGRAPH-006) の緩和はしない。
- doctor `change-impact` gate (別実装、カテゴリ分類式) の変更。
- Codex 作業中 (in-flight) のファイル内容 (docs/skills、cli.ts distribution 等)。

## 3. 受入条件

- U-RELGRAPH-006b: config / skill / 非走査対象 directory / archived plan の変更は non-graph-path (info)
  で ok=true、走査対象 (src/) の node 欠落は directory 丸め込みを含め missing-projection (error) のまま
  とする (tests/relation-graph.test.ts)。
- `git status --porcelain --untracked-files=all` を使い、未追跡 directory 配下の file を change-impact /
  relation graph impact の入力から落とさない (tests/change-impact.test.ts)。
- `bun run vitest run tests/relation-graph.test.ts tests/relation-graph-loader.test.ts` green、
  `bun run typecheck` green、`helix graph impact` が現行 working tree で exit 0。
