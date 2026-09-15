# A-124 cross-artifact graph / diagram / tooling hardening 監査

Date: 2026-06-09
Context: ユーザーは、横断的な dependency detection、diagramming、development tool/plugin support を強化できるか確認した。

## 現状

本日時点で実装済み:

- `module-drift`: `src/` module set と L4 architecture listing の差分を検出する。
- `asset-drift`: internal agent/skill/prompt asset drift を検出する。
- `change-impact`: `src` changes に design と test/test-design update が含まれるかを粗く確認する。
- PLAN dependencies と V-model pair/trace checks。

未実装:

- cross-artifact relation graph の構築。
- import graph reverse dependency impact の算出。
- Doc/PLAN/FR reference graph impact の算出。
- DB projection dependency impact.
- graph snapshots からの diagram export。
- dependency-cruiser / Knip / Madge / Graphviz / Mermaid / D2 向け tool adapter normalization。

Doctor evidence は、これをまだ future work として報告している:

```text
doctor: scaffold stub (relation-graph / dependency-drift / regression expansion は後続 PLAN)
```

## External tool research の記録

詳細な source URLs と selection matrix は `docs/research/cross-artifact-graph-tooling-research-2026-06-09.md` に記録している。この audit では routing summary だけを残す。

primary/official sources の確認結果:

- dependency-cruiser: configurable rules と DOT output により JavaScript/TypeScript dependencies を validate / visualize する。
- Knip: JavaScript/TypeScript projects の unused dependencies、exports、files を検出する。
- Madge: dependency graphs を生成し、circular dependencies を検出する。
- Graphviz: DOT graphs を SVG などの output formats へ render する。
- GitHub/Mermaid: Mermaid diagrams は GitHub Markdown contexts で render される。
- D2: CLI export to SVG/PNG/PDF を持つ text-to-diagram language。

## 判断

core collector は TypeScript/Bun のまま維持し、normalized projection rows を `harness.db` へ書く。

External tools は optional adapters とする:

1. tool を実行する。
2. raw output を evidence として保存する。
3. `graph_nodes`, `dependency_edges`, `tool_runs`, `findings`, `graph_snapshots`, `diagram_artifacts` へ normalize する。
4. gate は tool-specific output ではなく normalized rows だけを根拠にする。

## 変更内容

- requirements §6.8.9 に cross-artifact relation graph、visualization、tool adapters を追加した。
- `docs/research/cross-artifact-graph-tooling-research-2026-06-09.md` を Web research evidence memo として追加した。
- physical-data §9.5 に DB projection tables と invariants を追加した。
- ADR-002 A-124 addendum を追加した。
- IMP-118 / IMP-119 / IMP-120 を追加した。
- A-124 を existing FR bundle extension として L1/L3 functional requirements へ back-propagate した。

## Back-propagation decision の記録

`backprop_decision`: `requires_requirement_backprop`

Reason: この request は lower-layer implementation の配置だけでなく、harness が検出・自動化できるべき対象を変える。V-model state、trace、feedback、learning、DB projection、internal asset drift、coding/DDD rules、automation まわりの existing FR bundles を拡張する。

## Residual work の一覧

future implementation では、以下に対応する L6/L7 PLANs を作る:

- `helix graph impact --changed <path>`
- `helix graph export --format mermaid|dot|d2`
- graph projections 向け DB collector/rebuild
- optional tool adapter probes と normalized `tool_runs`

現在の routing:

- Relation graph core の routing: PLAN-L6-31 / PLAN-L7-32 / PLAN-REVERSE-32。
- MCP/external verification profile safety の routing: PLAN-L6-32 / PLAN-L7-33 / PLAN-REVERSE-33。
- Optional graph/diagram tool adapter probes の routing: PLAN-L6-33 / PLAN-L7-34 / PLAN-REVERSE-34。

## Boundary revision — insight adapter vs must-tool profile (2026-06-10 PO 決定, IMP-131)

検証ツールを 2 種に分け、重さを変える:

- **insight 系 (gate truth でない)** = tool adapter (dependency-cruiser / Knip / Madge / Graphviz DOT / Mermaid / D2)。本 audit の「raw 出力を gate truth にしない」原則どおり、これらは開発者 insight であり gate を支えない。よって **harness core の profile カタログとしてモデル化せず、`helix setup graph-tools [--with ...]` の一括セットアップ + layer-context アナウンス**に降格する (PLAN-L6-33/L7-34 スコープ改訂)。adapter ごとの probe/normalize/findings/優先順位を core に持たない (保守表面積削減)。Madge⊂dependency-cruiser の重複・3 図化レンダラの選択は `--with` のユーザー選択に吸収。first slice = dependency-cruiser + Knip + Mermaid、Madge/DOT/D2 は conditional。
- **マストツール系 (gate を支える検証 = gate truth になる)** = MCP / verification profile (playwright=画面検証 / testcontainers=DB結合 / github-mcp=CI context / msw=API契約 / mcp-inspector / vitest-browser)。V-model gate (L2/L10 画面検証、L8 結合) を支えるため profile + 機械着地 (A-125 / physical-data §9.6) を維持し、setup+announce へ降格しない。これを単なるアナウンスに格下げすると柱2 の under-design (検証を要求して機械着地が無い) に戻るため不可。

判断根拠 = [[feedback_judge_tooling_by_mission_not_self_scope]] (土台のツールはミッションで測る) + insight/gate の性質差。adapter 降格は実害ゼロ (全 PLAN draft / 実装 pending)。
