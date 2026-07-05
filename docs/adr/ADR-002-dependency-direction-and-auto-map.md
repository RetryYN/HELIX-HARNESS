# ADR-002: 依存方向ルール (schema 安定核) + 依存マップ自動生成・構想 vs 実装 drift チェック

- **Status**: accepted
- **Date**: 2026-05-29
- **Deciders**: PM (Opus) + PO (ユーザー)
- **関連**: `docs/design/harness/L4-basic-design/architecture.md` §3 / `docs/design/harness/L5-detailed-design/module-decomposition.md` §4・§7 / `docs/adr/ADR-001-helix-harness-redesign-and-language.md` / improvement-backlog IMP-032

## Context

HELIX-HARNESS の core が module 化する (cli/schema/lint/plan/vmodel/runtime/doctor + 将来 workflow/adapter ...) なかで、module 間の依存が複雑化する。逆依存や循環依存が混入すると保守が破綻し、テスト容易性も失われる。

L4 architecture §3 / L5 module-decomposition §4 で「**全依存は schema へ一方向・循環禁止・fs は副作用端点に隔離**」を設計したが、**設計宣言と実装 (実 import グラフ) が時間とともに乖離しないか**を継続検証する仕組みが必要。

PO 意図 (2026-05-29): HELIX-HARNESS の state/DB を構築する際に **依存関係の自動マップ生成機能**を入れる想定。**構想 (設計が宣言する依存方向) と実装 (実 import) でどれだけ差が出るかをチェックし、修正したい**。

## Decision

1. **依存方向ルールを正式採択**: 全依存は `schema` へ向かう一方向 (schema は何も import しない安定核)。`cli`/`doctor` が最外 (副作用層)。**循環依存禁止** (D-03=0)。`fs` (Node built-in) は依存方向ルール対象外の副作用アクセスとし、core ロジック (`analyzeX(docs?)` pure) と `loadX()` (fs 端点) を分離する。
2. **依存マップ自動生成 + 構想 vs 実装 drift lint を機能化** (将来、IMP-032): 実 import グラフを機械生成し、設計 doc が宣言する「期待依存マップ」(architecture §3 / module-decomposition §4 を形式化したもの) と照合。乖離 (逆依存 / 循環 / 想定外 edge) を **fail-close で検出**。OSS 候補 = `knip` / `madge` (L3 §7.1 tech-fork 調査)。

## Rationale

- 既存 lint 群 (g3-trace / fr-registry / doc-consistency / entity-coverage) と同じ「**設計 ↔ 実装の機械的整合**」哲学。zod で enum drift を根絶したのと同様、**依存 drift をグラフ照合で根絶**する。
- 「構想 vs 実装の差を測って修正する」= dogfooding の中核。harness 自身が自分の依存構造を監査できることは、対象リポジトリへの harness 価値の実証にもなる。
- 循環依存は core の根幹リスク (architecture §3 の D-03=0 保証) であり、ADR で固定して将来 module 追加時の必須参照点にする価値が高い。

## 検討した代替案

| 案 | 判定 | 理由 |
|----|------|------|
| 手動レビューのみ | 却下 | module 増加で drift 見逃しが不可避。機械検証でないと D-03=0 を保証できない |
| ADR 化しない (§3/§4 のまま) | 却下 | 構造の根幹で将来必ず参照される判断。履歴・却下理由が散逸する |
| 依存方向を強制しない (自由 import) | 却下 | 循環・テスト不能・保守破綻のリスク。安定核 (schema) 設計が崩れる |

## Consequences

- (+) 依存構造が機械検証可能になり、循環・逆依存を CI/doctor で fail-close できる。
- (+) **構想 (設計) と実装の gap を定量化・可視化し修正できる** (PO 意図の実現)。
- (+) 将来 module 追加時の依存判断の正本が ADR として残る。
- (−) dependency-map auto-gen + drift lint の実装コスト (L7、IMP-032)。OSS (knip/madge) 流用で緩和。
- (−) 「期待依存マップ」を設計 doc から形式化する作業が必要 (architecture §3 を機械可読形式へ)。

## Follow-up

- **IMP-032** として「依存マップ自動生成 + 構想 vs 実装 drift lint」を L7 で起票。architecture §3 を「期待依存マップ」(YAML/JSON) として形式化し、実 import グラフと照合。
- **最小スライス実装済 (IMP-075、PLAN-L7-16)**: 上記 IMP-032 (import グラフの循環/逆依存/想定外 edge 照合、knip/madge) の前段として、**「architecture §3.1 building block 集合 ⊇ `src/` 実在 module」の包含 drift** を `src/lint/module-drift.ts` (doctor `checkModuleDrift`、warn-first) で実装した。これは A-103 で発見した impl→design back-fill 漏れ (handover/setup/web を「将来」放置した meta-drift) の再発防止網 (U-MDRIFT-005 が実 repo 孤児0 を CI 担保)。**IMP-032 本体 (import グラフ drift) は引き続き carry** — module 集合包含と import edge 照合は別検査 (前者=module の有無、後者=module 間の依存方向)。
- module-decomposition §7 の「ADR-002 候補」を本 ADR (accepted) 参照に更新。
- L6 機能設計で drift lint のアルゴリズム (グラフ構築 + 照合 + 差分レポート) を pseudocode 化。
## A-124 Addendum: cross-artifact graph と tool adapter 選定

Date: 2026-06-09

先行する ADR-002 decision は依存方向と最初の `module-drift` slice を対象にする。A-124 では対象を module 集合 drift から cross-artifact relation graph へ拡張する:

- source import graph
- design が宣言する expected dependencies
- doc/PLAN/FR references
- test から source / artifact への edges
- DB projection の source-to-table edges
- 生成された diagram artifacts

relation graph は `harness.db` へ投影し、diagrams として export できなければならない。DB は authoring source ではなく、再構築可能な projection として扱う。

### Tool 調査サマリ

| tool | 役割 | 採用方針 |
|---|---|---|
| `dependency-cruiser` | JS/TS dependencies を project rules で検証・可視化する。循環依存、禁止依存、missing package dependencies、orphans、DOT output に有用。 | dependency rules と graph export の優先 optional adapter。 |
| `knip` | TypeScript/JavaScript projects の未使用 dependencies、exports、files を検出する。 | dead-node / unused edge detection 用の optional adapter。 |
| `madge` | dependency graphs を生成し、循環依存を検出する。 | rules では dependency-cruiser を優先し、これは optional lightweight helper とする。 |
| Graphviz DOT | 大規模 graph を SVG/PDF/PNG へ render する。 | large graph snapshots と CI artifacts 用の optional renderer。 |
| Mermaid | GitHub で render できる Markdown-native diagrams。 | small/medium workflow と relation views 用の優先 documentation diagram format。 |
| D2 | SVG/PNG/PDF への CLI export を持つ text-to-diagram language。 | architecture/review diagrams を読みやすくする optional renderer。 |

### Decision

外部 tool を source of truth にしない。core graph collector は TypeScript/Bun で実装し、normalized rows を `harness.db` へ書き込む。外部 tool は adapters として扱う:

1. tool を実行する。
2. raw output を evidence として保存する。
3. `graph_nodes`、`dependency_edges`、`tool_runs`、`findings`、`diagram_artifacts` へ normalize する。
4. gate は normalized rows のみで判定する。

### 最初の implementation slice

1. `src/**/*.ts` と `tests/**/*.ts` から source import graph を構築する。
2. Markdown path/ID references から doc reference graph を構築する。
3. 両方を `graph_nodes` と `dependency_edges` へ project する。
4. `impact_results` を計算する `ut-tdd graph impact --changed <path>` を追加する。
5. `ut-tdd graph export --format mermaid|dot --scope <scope>` を追加する。
6. graph projection が欠けている場合は doctor を warn-first にし、G7/accept で impact rules が有効な場合は fail-close へ wire する。

## A-125 Addendum: MCP server と external verification profile 選定

Date: 2026-06-09

A-124 graph は UT-TDD に impact 対象を伝える。A-125 は、その impact を検証するためにどの external capability を activate すべきかを定義する。2026-06-09 の web research では、scope に含める候補として以下を選定した:

| candidate | 役割 | 採用方針 |
|---|---|---|
| MCP Registry | namespace/installation metadata を含む public MCP servers の discovery metadata。 | metadata source としてのみ使い、security scanner とは扱わない。 |
| MCP Inspector | MCP servers の testing/debugging に使う interactive/CLI developer tool。 | configured MCP profile ごとの優先 smoke tool。 |
| Microsoft Playwright MCP | exploratory automation、screenshots、self-healing/browser-state-heavy loops 用の browser automation MCP。 | optional interactive verification profile。deterministic CI では Playwright/Vitest tests を優先する。 |
| GitHub MCP Server | GitHub issue/PR/repo/actions/code-security toolsets。 | optional workflow automation profile。default profile は read-only または narrow toolset にする。 |
| modelcontextprotocol reference servers | filesystem/git/memory/fetch/postgres/sqlite reference capabilities。 | controlled local/reference profiles のみ。default filesystem/git profiles は workspace-scoped とする。 |
| Docker MCP Toolkit | profiles、signed/attested images、OAuth handling、runtime resource constraints を備えた containerized MCP gateway。 | Docker Desktop が利用可能な場合の優先 team/enterprise runtime profile。 |
| Vitest Browser Mode + Playwright provider | browser-native component/UI tests。 | UI/browser-targeted changes 用の optional test profile。 |
| Testcontainers for Node.js | integration tests 用の disposable databases/services。 | Docker が利用可能な場合の DB/service contract verification 用 optional test profile。 |
| MSW | Browser/Node API mocking。 | API-bound test stabilization と fixture reuse 用の optional test profile。 |

### Decision

External tools は default では globally install せず、有効化もしない。HELIX-HARNESS はそれらを **profiles** として model 化する:

1. `mcp_server_profiles` / `verification_profiles` は allowed commands、package refs、risk tier、auth/network/Docker requirements、trigger signals を定義する。
2. relation graph の impact expansion は `verification_recommendations` 経由で profiles を推薦する。
3. `ut-tdd mcp profile probe` と MCP Inspector smoke により profile が callable であることを証明する。
4. runs は `mcp_server_runs`、`tool_runs`、`test_runs`、normalized `external_tool_findings` として永続化する。
5. gate decisions は normalized DB rows と bounded evidence files のみを使う。

### セキュリティ方針

- read-only かつ narrow toolsets を優先する。
- home directories を filesystem/git MCP profiles へ mount しない。
- credentials、raw provider transcripts、unredacted MCP payloads を DB に保存しない。
- registry/catalog metadata は discovery input として扱い、安全性の証明とは扱わない。
- Docker MCP Toolkit は resource limits、signing/attestation、OAuth handling、profile isolation が利用可能な場合の優先 packaged option とする。

### 最初の implementation slice

1. profile schema と generated local config path を追加する。
2. first slice 実装済み: `ut-tdd mcp profile list --json` と `ut-tdd mcp profile probe <name>` は、packages を install せずに catalog と readiness checks を公開する。
3. readiness gate 実装済み: `ut-tdd mcp inspect <name> --method tools/list` は target MCP profile checks と MCP Inspector profile checks を組み合わせ、default では external inspection を拒否する。実際の Inspector server invocation は後続 scope に残す。
4. first slice 実装済み: `ut-tdd verify recommend --changed <path>` は changed-file signals を profile triggers へ map し、Mermaid impact evidence を出力できる。DB-backed relation graph expansion は別の A-124 scope として残す。
5. first slice 実装済み: `ut-tdd verify run --profile <name> --dry-run` と built-in profile execution。disabled external profiles には明示的な `--allow-external`、package/auth/Docker readiness、wired runner を要求する。`--save-evidence` は normalized JSON を `.ut-tdd/evidence/verification-profiles/` 配下に永続化する。
6. recommended-but-unavailable profiles では doctor を warn-first にし、profile rules が有効化された後の G7/accept でのみ fail-close へ wire する。

## A-126 Addendum: canonical document export 選定

Date: 2026-06-09

A-126 は dependency/relation graph decision を canonical document conversion へ拡張する。対象は generic review reporting ではなく、UT-TDD source documents を人間が読みやすい spreadsheet / Excel / PPTX formats へ変換することである:

- concept / planning documents
- requirements / acceptance documents
- detailed design documents
- PLAN and ADR documents
- test-design と evidence-summary の documents
- architecture/workflow visuals 用の optional diagram-to-deck bridge としての D2 PPTX export

### Tool 調査サマリ

| tool | 役割 | 採用方針 |
|---|---|---|
| CSV / Markdown summary | document matrices と summaries 用の built-in conversion outputs。 | default。external dependency は不要。 |
| ExcelJS | TypeScript definitions を持つ Node/browser 向け Excel workbook creation/manipulation。 | structured requirements/design/trace workbooks 用の optional XLSX renderer candidate。 |
| SheetJS CE | 広範な JavaScript spreadsheet format support。 | compatibility が重要な場合の optional spreadsheet renderer/parser candidate。 |
| PptxGenJS | JavaScript/TypeScript OOXML PowerPoint generation。 | concept、requirements、design、ADR、PLAN、test-design decks 用の optional PPTX renderer candidate。 |
| D2 PPTX export | diagram を PPTX へ export する。 | architecture/workflow visuals 用の optional diagram-to-deck renderer。 |

### Decision

生成された spreadsheet/deck files は source-of-truth documents ではない。source of truth は canonical Markdown/docs、normalized DB projection、明示的な review/gate/handover evidence である。

1. canonical documents を structured document projection へ parse する。
2. source path、section ID、FR/AC/AT/PLAN/ADR IDs、status、trace、evidence links を保持する。
3. その projection から deterministic export dataset を構築する。
4. rendering 前に dataset を redact する。
5. default では CSV / Markdown を render する。
6. XLSX / PPTX は readiness evidence を伴う optional renderer profiles 経由でのみ render する。
7. artifact metadata を `document_export_runs`、`document_export_datasets`、`document_export_artifacts` に保存する。
8. gate は canonical docs、normalized rows、recorded human decisions で判定し、手動編集された Office files では判定しない。

### 最初の implementation slice

将来の L7 work では以下を実装できる:

1. concept、requirements、detailed design、PLAN、ADR、test-design docs からの `parseCanonicalDocumentStructure`。
2. document matrices と deck outlines 用の `buildDocumentExportDataset`。
3. CSV と Markdown のみを対象にした `renderDocumentExport`。
4. ExcelJS / SheetJS / PptxGenJS / D2 用の optional renderer probes。
5. TDD Red と PLAN route の後に限る `ut-tdd export docs --kind requirements|concept|design|plan|adr|test-design --format csv|md|xlsx|pptx`。
