---
layer: L4
sub_doc: basic-design
status: confirmed
freeze_blocking: false
pair_artifact: docs/test-design/helix/visualization-surface-boundary.md
plan: docs/plans/PLAN-L4-52-visualization-surface-boundary.md
---

# 可視化 view の L4 基本設計 — extension surface / Webview 境界 / CSP / read-only action

## §0 位置づけ

`PLAN-L3-12` confirmed（`docs/design/helix/L3-requirements/visualization-requirements.md`、
HR-FR-VIS-01..07、Project/Harness 2 root、read-only + CLI copy）を VSCode extension の
基本設計へ降下させる。本書は surface 構成・data 境界・Webview 境界・read-only action 境界を
確定し、view-model 関数契約・graph IR 変換（L6）と extension/Webview 実装（L7）は行わない。

正本 source は `VisualizationSnapshot`（`src/state-db/visualization-read-model.ts`、
`buildVisualizationSnapshot(db)`）の deterministic JSON に限定し、LLM 生成図・要約を view の
正本にしない（L3 §4 不変条件 1 を継承）。

## §1 extension surface 構成（HR-FR-VIS-01）

top-level を **2 root** に分割する（L3 §1 情報設計判断）。両 root は同一 `VisualizationSnapshot`
を source とし、同じ field は同じ値を出す（root 間で数値定義を変えない）。

| root | Tree View 配下 view | first surface | Webview panel | 正本 source field |
|------|---------------------|---------------|---------------|-------------------|
| Project | Layer progress | Tree View（PLAN/gate/artifact 階層） | 集計 bar/detail | `progress.artifacts` / `progress.plans` / `progress.gates` |
| Project | Design/test pair | Tree View（pair 有無階層） | orphan graph | `graph.*` ＋ `drilldowns.relation_graph_command` |
| Project | Relation/dependency | —（Webview のみ） | Mermaid graph パネル | `graph.nodes` / `graph.edges` / `graph.latest_snapshot_id` / `graph.latest_snapshot_hash` / `graph.latest_node_count` / `graph.latest_edge_count` |
| Project | Runtime evidence | Tree View（evidence 種別階層） | evidence timeline/detail | `evidence.test_runs` / `evidence.runtime_verification` / `evidence.guardrail_decisions` |
| Harness | Harness growth | Tree View（資産クラス別現在値） | 時系列 trend panel | `progress.*` 現在値 ＋ `graph.latest_snapshot_id` / `graph.latest_snapshot_hash` / `graph.latest_node_count` / `graph.latest_edge_count`（L6 で時系列 field 新設） |
| Harness | Skill/agent telemetry | Tree View（skill/model 一覧） | metrics table/trend | `evidence.skill_invocations` / `evidence.model_runs` |

- **境界の機械検出**: Project root は対象プロジェクトの現在地・工程表・L12 設計カバレッジ・駆動モデル・
  closure/evidence・runtime evidence を所有する。Harness root は HELIX/HARNESS 自体の成長・skill/model
  telemetry・ハーネス運用メトリクスを所有する。L6 view-model は `view_boundaries.project` /
  `view_boundaries.harness` を出力し、`owned_views` / `source_fields` / `excluded_fields` により
  view の混入を機械検出できるようにする。特に `project_current_location.*` と ZIP/L12 fit は Project view
  側、`evidence.skill_invocations` / `evidence.model_runs` は Harness view 側を主 surface とする。
- **Tree View first**: 一覧/階層 navigation は Tree View に寄せ、graph/timeline/trend など VS Code
  native view で表現しづらい描画のみ Webview panel に置く（Webview を濫用しない）。
- **階層構造**: 「view 種別 → 集計 bucket → 個別 row」の 3 段を既定にし、row から drill-down（§4）へ接続する。
- **activation events**: extension は view container を開いた時にのみ activate（`onView:*`）。起動時 eager
  activation・background polling は持たない。snapshot 取得は view 表示/明示 refresh のみ。
- **commands**: 登録するのは **CLI copy 系のみ**（`drilldowns` の CLI/table pointer をクリップボードへ）。
  mutation コマンド・実行導線・外部 API 呼出コマンドは登録しない（§4）。

## §2 data 境界（HR-FR-VIS-01 / 02）

- extension は `VisualizationSnapshot` JSON **のみ**を読む。取得経路は `helix` CLI（read-only 出力）
  または read-model 関数呼出の 1 経路に固定し、view は他の source を混ぜない。
- extension は **書込み・LLM 生成・外部 API・harness.db への query 発行を持たない**。集計は read-model 側で
  完結し、extension は表示専用（描画数の一致検査は L6 view-model oracle が担保）。
- 描画数（node/edge/metric）が source と乖離した場合は成功を捏造せず warning/error node として分離表示する
  （L3 §4 不変条件 2、`warnings` の surface は §5 と L6 で拡張）。
- `source_clock` を各 view の「as of」表示に用い、snapshot の鮮度を偽らない。

## §3 Webview 境界（HR-FR-VIS-05）

- **CSP**: `default-src 'none'` 基調。`script-src` / `style-src` は nonce 付きの extension bundle のみ許可、
  `img-src` は `webview.cspSource` + `data:` 限定。`connect-src` は付与しない（外部 fetch 不可）。
  inline script は nonce necessity のもの以外禁止。
- **localResourceRoots**: extension の bundle ディレクトリのみに限定し、workspace 任意 path を露出しない。
- **postMessage 契約**: extension → Webview は `VisualizationSnapshot` 由来の read-only view data のみ渡す。
  Webview → extension は「drill-down pointer の copy 要求」「panel 種別切替」等の read-only intent のみ受理し、
  実行・書込・path 解決を伴う message は受理しない（未知 type は破棄）。
- **非保持境界**: Webview state / postMessage payload に secret・provider transcript・machine-local
  absolute path を載せない（L3 §4 不変条件 6）。drill-down は CLI command 文字列・DB table 名・
  docs 相対 path の pointer までとし、絶対 path を解決した実 path を渡さない。

## §4 read-only action 境界（HR-FR-VIS-05）

- view の action は **read-only 描画 + CLI command copy まで**。command 実行・外部 API・設定変更・
  branch/ruleset mutation の導線を置かない。
- copy はクリップボードまでで完結し、コマンドを実行しない。実行は利用者が別途 terminal で行う（approval
  境界の外に出さない）。
- mutation を伴う操作は action-binding approval 境界（HNFR-P8 / XR-2、actor/tool/target/params/
  timestamp/expiry タプル）に置き、approval なしに実行しない。初回 slice に action surface を入れない
  （L3 §6 継承）。
- agent dispatch trace view（旧 PLAN-219 由来）は初回 6 view に含めない（対象外）。

## §5 空状態・エラー表現

- 空 DB（cold start）は全 view が 0 を表示し、`VisualizationSnapshot.warnings` を **全 view 共通の
  共有 banner** として surface する（HR-FR-VIS-04、view 別 warning は要求しない）。0 件を「成功・該当なし
  （正常）」と誤読させる緑を出さない。
- 現行実装の warning は `artifact_progress is empty` と projection-only 混入の 2 系統のみ。graph/evidence/
  skill 系の空状態 warning 追加、および Harness growth の時系列 field は L6 view-model 契約で新設する（§6）。
- `projection_only_unverified` / `missing_runtime_provenance` は `runtime_verified` / accepted へ昇格
  表示しない（HR-FR-VIS-03、L3 §4 不変条件 3）。

## §6 後続へ送る境界（L6 view-model へ）

- 6 view の `VisualizationSnapshot -> ViewModel` 純関数契約と Mermaid 互換 graph IR。
- pair edge フィルタ済み count field、graph/evidence/skill 系の空状態 warnings 拡張、Harness growth の
  時系列集計 series field（HR-FR-VIS-07）。
- drill-down pointer の deterministic 経路契約。

## §7 trace（HR-FR-VIS ↔ L4 境界）

| HR-FR-VIS | L4 で確定した境界 |
|-----------|-------------------|
| 01 | §1 surface 構成（2 root / 6 view 割り付け / activation） |
| 02 | §2 data 境界（single source / 乖離は warning 分離） |
| 03 | §5（verification class 分離、非昇格） |
| 04 | §5（cold start 0 + 共有 banner warning） |
| 05 | §3 Webview 境界 ＋ §4 read-only action 境界 |
| 06 | §3 postMessage の drill-down pointer 契約（詳細経路は L6） |
| 07 | §6（Harness growth 時系列は L6 送り） |
