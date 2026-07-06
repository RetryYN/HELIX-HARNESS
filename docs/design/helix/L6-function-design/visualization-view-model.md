---
layer: L6
sub_doc: function-spec
status: draft
freeze_blocking: false
pair_artifact: docs/test-design/helix/visualization-view-model.md
plan: docs/plans/PLAN-L6-58-visualization-view-model.md
---

> **L6 contract marker**: `buildVisualizationViewModel(snapshot: VisualizationSnapshot) => VisualizationViewModel` は unit-test 粒度の contract。pre: 入力は `buildVisualizationSnapshot(db)` が返した schema `visualization-snapshot.v1` の deterministic JSON（不正 schema は fail-close で error）。post: U-VVM-001..006 の oracle が全て green のときだけ合格。invariant: view-model の全 field は入力 snapshot から純関数的に導出され（副作用・DB 再クエリ・LLM 生成・現在時刻依存なし）、同一 snapshot → deep equal。描画数は snapshot の対応 count と一致し、乖離・空状態・projection-only は成功へ混ぜず warnings/error として分離される。

# 可視化 view-model の L6 機能設計

## §1 範囲

`PLAN-L3-12`（HR-FR-VIS-01..07）と L4 surface 境界
（`docs/design/helix/L4-basic-design/visualization-surface-boundary.md`）を、実装可能な
view-model 関数契約へ降下させる。`VisualizationSnapshot`（`src/state-db/visualization-read-model.ts`）
の既存 field の意味は変えず、L3 が L6 送りにした 3 点をここで契約化する。

1. pair edge フィルタ済み count field（Design/test pair view の総数一致 oracle 対象）。
2. view 別空状態 warnings 拡張（graph/evidence/skill 系）。
3. Harness growth 時系列 series field（snapshot 履歴 / evidence timestamp 由来、補間禁止）。

対象外: VSCode extension / Webview 実装（L7）、harness.db schema 変更（query-only 読取で賄えない場合は要
escalate）。本 view-model は snapshot の再クエリを行わず、snapshot に既に含まれる値のみを整形する。

## §2 関数契約

正本 = `buildVisualizationViewModel`（純関数、snapshot in / view-model out）。個別 view builder は
その内部 helper とし、いずれも副作用と現在時刻依存を持たない。

| 関数 | 契約 |
|---|---|
| `buildVisualizationViewModel(snapshot)` | 6 view 分の ViewModel と共有 warnings banner を含む `VisualizationViewModel` を返す。全 field は snapshot から純関数導出。root 間で同一 field は同一値。 |
| `buildLayerProgressView(snapshot)` | `progress.artifacts/plans/gates` を bucket→row の 2 段へ整形。metric 数は snapshot 値と一致。空は 0 + 共有 warning 参照。各 row に `drilldowns.artifact_progress_command` pointer を付す。 |
| `buildDesignTestPairView(snapshot)` | `graph.*` から pair edge に絞った **フィルタ済み count**（`pair_edges` / `orphan_nodes`）を算出。現行 `graph.nodes/edges` は全種別総数のため、pair 集計は本 view-model が定義する専用 field で表す。orphan は 0 か明示表示。 |
| `buildRelationGraphView(snapshot)` | `graph.nodes` / `graph.edges` / `graph.latest_snapshot_*` を Mermaid 互換 graph IR（§3）へ変換。描画 node/edge 数は snapshot（または latest snapshot count）と一致。 |
| `buildRuntimeEvidenceView(snapshot)` | `evidence.test_runs` / `runtime_verification` / `guardrail_decisions` を verification class 別に整形。`runtime_verified` と `projection_only_unverified` / `missing_runtime_provenance` を分離し、後者を accepted へ昇格しない。 |
| `buildSkillAgentTelemetryView(snapshot)` | `evidence.skill_invocations` / `model_runs` を metric row へ整形。各 row は `drilldowns` pointer へ戻れる。 |
| `buildHarnessGrowthView(snapshot)` | `progress.*` 現在値 ＋ 時系列 series（§4 の `growth_series`）を整形。履歴の無い期間は補間せず `recorded: false` 点で表す。Layer progress と同一 surface 前提で数値定義を共有。 |

`VisualizationViewModel` shape（骨子）:

```
{
  generated_from: "visualization-snapshot.v1";   // 入力 schema_version をそのまま反映
  source_clock: string | null;                    // snapshot.source_clock を透過
  project: { layer_progress; design_test_pair; relation_graph; runtime_evidence };
  harness: { harness_growth; skill_agent_telemetry };
  shared_warnings: string[];                        // snapshot.warnings を全 view 共通 banner として保持
}
```

各 view row は `{ label; value; drilldown: { kind: "cli" | "table" | "docs"; pointer: string } | null }`
を基本形とし、pointer は snapshot の `drilldowns`（CLI command 文字列 / table 名）に限定する。絶対 path・
解決済み実 path・secret・transcript を持たない（L3 §4 不変条件 6 / L4 §3）。

## §3 Mermaid 互換 graph IR

Relation/dependency view と Design/test pair orphan graph の共通 IR。

- **node/edge IR**: `nodes: Array<{ id; label; group }>` / `edges: Array<{ from; to; kind }>`。id は
  snapshot 由来の deterministic key（生成順ではなくキー整列で安定化）。
- **deterministic 生成**: 同一 snapshot → 同一 IR（node/edge の順序を id 昇順で正規化）。乱数・時刻・
  Map 反復順に依存しない。
- **count 一致 oracle**: IR の node/edge 数が、その view が使う定義済み集計（Relation view = `graph.nodes` /
  `graph.edges` または latest snapshot count、pair view = §2 のフィルタ済み `pair_edges` / `orphan_nodes`）
  と一致する。乖離時は IR を捏造せず warning を立てる。
- **cycle 表示**: 依存 graph に cycle があれば cycle 参加 edge を `kind: "cycle"` で標識する（描画側で強調）。
  cycle 検出は IR 生成の一部として deterministic に行い、集計数を変えない。

注: 現行 `VisualizationSnapshot.graph.*` は集計 count のみで生の node/edge リストを持たない。生リストが必要な
描画は `drilldowns.relation_graph_command`（`helix graph export --format mermaid`）へ委譲し、view-model は
count 一致検査と IR 枠の契約を担う。生リスト取り込みが必要になった場合は snapshot 側の拡張として要 escalate
（本 view-model は snapshot を再クエリしない invariant を破らない）。

## §4 snapshot 拡張 field（L3 送り 3 点の契約化）

L3 は下記を「L6 view-model 契約で新設」と送った（HR-FR-VIS-02/04/07）。view-model の出力 field として定義し、
入力 snapshot に生 series が無い場合の欠落表現も契約する。

1. **pair フィルタ済み count**（`design_test_pair.pair_edges` / `.orphan_nodes`）: 全種別総数
   （`graph.nodes/edges`）と別に、pair 種別に限定した count。総数一致 oracle（HAC-VIS-02a）の対象はこの
   フィルタ済み集計。snapshot が pair 種別を区別する field を持たない現状では、view-model は「pair 集計は
   未提供」を warnings で明示し 0 捏造しない（生 pair 種別の取り込みは snapshot 拡張として要 escalate）。
2. **view 別空状態 warnings**（graph/evidence/skill）: 現行 `warnings` は artifact empty と projection-only
   混入の 2 系統のみ。view-model は各 view の source count が全 0 のとき対応 warning key を **共有 banner**
   へ追加する（L4 §5 / HAC-VIS-04a: view 別表示ではなく全 view 共通 banner）。既存 warnings を上書きせず追記。
3. **Harness growth 時系列 series**（`harness_growth.growth_series`）: 資産クラス別 count の時点列
   `Array<{ at: string; class: string; value: number; recorded: boolean }>`。source は snapshot 履歴 /
   evidence timestamp。**補間・推定禁止**: 履歴の無い期間は点を作らないか `recorded: false` とし「記録なし」を
   明示する（HAC-VIS-07b）。現行 snapshot は履歴系列を保持しないため、series が空のときは
   「時系列の記録なし」warning を立て、成長を捏造しない。時系列 source の snapshot 保持は後続の read-model
   拡張タスク（要 escalate 対象、schema 変更を伴う場合）。

## §5 drill-down 契約（HR-FR-VIS-06）

- 各 ViewModel row の `drilldown` は `VisualizationSnapshot.drilldowns` の CLI/table pointer を指し、
  DB row / docs path / CLI command へ deterministic に到達する。
- pointer が無い row は `drilldown: null` を明示し、LLM 要約や推測 path を根拠にしない（欠落を捏造で埋めない）。
- pointer は文字列（CLI command / table 名 / docs 相対 path）に限定し、machine-local absolute path を
  解決・保持しない。

## §6 Test oracle 設計

後続 L7 実装 PLAN で test 新設と同時に pair test-design（`docs/test-design/harness/L7-unit-test-design.md`）
へ oracle 行を宣言する（oracle-test-trace gate: 宣言 oracle は test citation 必須のため、宣言は実装スライスと
同時に行う）。予定 oracle（実装時に `tests/visualization-view-model.test.ts` を新設して cover する。本 doc
起草時点で当該テストは未存在）:

- U-VVM-001: fixture snapshot（非ゼロ progress/graph/evidence）から `buildVisualizationViewModel` が
  6 view + shared_warnings を deterministic に返す（同一入力 → deep equal、副作用なし）。
- U-VVM-002: 各 view の描画 count が snapshot 対応 field と一致する（Layer progress = `progress.*`、
  Relation = `graph.nodes/edges` または latest snapshot count、Design/test pair = §4 フィルタ済み count）。
- U-VVM-003: Mermaid 互換 graph IR が deterministic（node/edge を id 昇順に正規化、同一 snapshot → 同一 IR）
  で、node/edge 数が定義済み集計と一致し、cycle edge が `kind:"cycle"` で標識される。
- U-VVM-004: 空 DB snapshot（全 0 + `warnings` に artifact empty）で全 view が 0 を返し、graph/evidence/skill
  系の空状態 warning が **共有 banner** へ追記され、非ゼロ・mock を捏造しない（HAC-VIS-04）。
- U-VVM-005: `projection_only_unverified` / `missing_runtime_provenance` を含む snapshot で Runtime evidence
  view がそれらを `runtime_verified` / accepted へ昇格せず分離し、対応 warning を surface する（HAC-VIS-03）。
- U-VVM-006: Harness growth の `growth_series` が snapshot 履歴を持たないとき補間せず「記録なし」を表現し
  （空 series + warning）、履歴があるときは各点が snapshot / evidence timestamp から再現可能（HAC-VIS-07）。
  drill-down pointer は全 view で `drilldowns` 由来か `null` のいずれかであり、絶対 path・LLM 要約を持たない
  （HAC-VIS-06）。
