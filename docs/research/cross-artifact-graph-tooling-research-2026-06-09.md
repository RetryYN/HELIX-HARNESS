---
artifact_type: research_memo
status: confirmed
created: 2026-06-09
updated: 2026-06-09
related_audit: .ut-tdd/audit/A-124-cross-artifact-graph-tooling.md
related_requirements: docs/governance/helix-harness-requirements_v1.2.md#689-cross-artifact-relation-graph--visualization--tool-adapters-a-124-2026-06-09
---

# Cross-Artifact Graph / Diagram Tooling 調査メモ

## 対象範囲

このメモは A-124 の Web 調査根拠を記録する調査成果物であり、実装の source of truth ではない。正本の範囲は requirements §6.8.9、ADR-002 A-124、physical-data §9.5、および L6/L7 relation-graph PLAN に残す。

調査観点:

- 依存 graph、dead-code / dead-node signal、diagram export の構築または検証に使える installable developer tool は何か。
- どの tool を core source of truth ではなく optional adapter として扱うべきか。
- どの出力を `harness.db` projection rows へ正規化すべきか。

## Source 確認

2026-06-09 に確認した。

| Source | URL | 関連する確認結果 | HELIX 判断 |
|---|---|---|---|
| dependency-cruiser | https://github.com/sverweij/dependency-cruiser | 公式 project は、custom rules、build reports、Graphviz へ渡せる DOT examples を含む graph outputs によって JS/TS dependencies を検証・可視化できると説明している。 | import/dependency rules、circular dependencies、forbidden dependencies、missing package dependencies、orphan detection、DOT graph evidence の preferred optional adapter とする。 |
| Knip docs | https://knip.dev/ | Knip は JavaScript/TypeScript project の unused dependencies、exports、files を検出し、多数の framework/tool plugin を提供する。 | dead-node と unused-edge signal の optional adapter とする。core graph source ではなく evidence/projection input として使う。 |
| Madge | https://github.com/pahen/madge | Madge は visual module dependency graph を生成し、circular dependencies を検出でき、Graphviz による visual graph output も利用できる。 | circular dependency と graph visualization の lightweight optional adapter とする。rule policy が必要な箇所では dependency-cruiser を優先する。 |
| Graphviz output formats | https://graphviz.org/docs/outputs/ | Graphviz は DOT language、JSON、PDF、PNG、SVG などの output format を持ち、`-T` で target format を選ぶ。 | 大きな graph snapshot と CI artifact 用の optional renderer とする。gate は renderer output 単独ではなく、正規化済み `diagram_artifacts` を見る。 |
| GitHub Mermaid diagrams | https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams | GitHub は Issues、Discussions、pull requests、wikis、Markdown files で fenced `mermaid` blocks を diagram として render する。 | GitHub Markdown で読めるため、review/handover 向け documentation diagram format として優先する。 |
| Mermaid project | https://github.com/mermaid-js/mermaid | Mermaid は text definitions から diagram を生成する Markdown-inspired diagramming/charting tool である。 | small/medium relation view と workflow view の default graph export として使う。 |
| D2 documentation | https://d2lang.com/ and https://www.d2lang.com/tour/exports/ | D2 は declarative text-to-diagram language で、CLI exports は SVG、PNG、PDF、PPTX、GIF、ASCII、stdout を含む。 | architecture/review diagram を整える optional renderer とする。利用には adapter readiness が必要。 |

## 選定マトリクス

| Adapter | Trigger / 用途 | 価値 | default state | 必須条件 |
|---|---|---|---|---|
| `dependency-cruiser` | source import graph、dependency rules、forbidden import policy | rule を持つ dependency validation と DOT/graph evidence を得られる。 | package 宣言まで optional・disabled。 | rule violations を `findings` へ正規化し、command/version/scope を `tool_runs` に保存する。 |
| `knip` | unused dependency/export/file audit | relation graph cleanup に使う dead-node と unused-edge signal を得られる。 | package 宣言まで optional・disabled。 | false positive は review が必要な finding として扱い、default では auto-delete しない。 |
| `madge` | circular dependency quick check、graph image helper | lightweight circular dependency と visual graph evidence を得られる。 | package 宣言まで optional・disabled。 | dependency-cruiser rules がある箇所で Madge を policy source にしない。 |
| `graphviz-dot` | DOT から SVG/PDF/PNG への rendering | large graph rendering と CI artifact output に使える。 | optional renderer。 | renderer availability は environment state として扱い、missing renderer は finding を返す。 |
| `mermaid` | Markdown-native relation/workflow diagrams | GitHub Markdown で render される review/handover diagram を生成できる。 | docs の preferred default export。 | node ID/order を deterministic にし、raw evidence payload を diagram text に含めない。 |
| `d2` | architecture/review diagram export | design review 向けのより整った diagram rendering を得られる。 | optional renderer。 | adapter readiness を必須にし、implicit installation は行わない。 |

## Workflow 統合

1. core relation graph collector は TypeScript/Bun のままにし、docs/source/tests/PLAN/state/logs から再構築できるようにする。
2. optional adapter は workflow/profile rules で allow-list された場合だけ実行する。
3. raw adapter output は bounded evidence として保存する。
4. 正規化済み rows は後続で `tool_runs`、`graph_nodes`、`dependency_edges`、`impact_results`、`graph_snapshots`、`diagram_artifacts`、`findings` へ書き込む。
5. gate は正規化済み rows だけを消費する。

## 安全・品質ルール

- external tools は adapter であり、authoring source ではない。
- adapter availability が missing でも finding として扱い、無関係な local checks は invalid にしない。
- Mermaid は GitHub contexts で render されるため、Markdown evidence では優先する。
- DOT/Graphviz と D2 は optional renderer profile であり、implicit install してはならない。
- external tools の auto-fix/delete behavior は、将来の PLAN が explicit human approval と rollback evidence を追加するまで対象外にする。

## 残作業

- TDD Red 後に PLAN-L7-32 relation graph pure functions を実装する。
- dependency-cruiser、Knip、Madge、Graphviz、Mermaid、D2 の optional adapter profile probe を追加する。
- A-124 graph と diagram projection rows の DB collector/rebuild を追加する。
- adapter probe route は PLAN-L6-33 / PLAN-L7-34 / PLAN-REVERSE-34 とする。
