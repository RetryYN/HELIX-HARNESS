---
title: "HELIX L3 要件 — 資産/進捗 可視化 view 要件（Tree View / graph panel / evidence drill-down / read-only 境界）"
layer: L3
kind: add-design
status: confirmed
freeze_blocking: false
created: 2026-07-06
updated: 2026-07-07
owner: FE lead (Opus) / PO 承認 2026-07-07（charter §3）
plan: PLAN-L3-12-visualization-requirements
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l1: docs/design/helix/L1-requirements/pillar-requirements.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
next_pair_freeze: L12
---

# HELIX L3 要件 — 資産/進捗 可視化 view 要件

## §0 位置づけ

本書は `PLAN-L3-12` の L3 設計正本である。上流は次の 3 点で、いずれも本書で変更しない。

- `PLAN-DISCOVERY-10`（S4 `decision_outcome: confirmed` / `promotion_strategy: reuse-with-hardening`）:
  Tree View を first surface、Webview を graph/detail panel に限定、Mermaid 互換 graph IR、
  read-only + CLI copy まで、正本 = Markdown・harness.db・relation graph・runtime evidence。
- L1 `pillar-requirements.md` §2.8（asset/progress visualization 要求。親 = HBR-P9 / HBR-P4 /
  関連要求 = HBR-P7 / HNFR-P3 / HNFR-AC / HNFR-P8）。
- `VisualizationSnapshot`（`src/state-db/visualization-read-model.ts`、`buildVisualizationSnapshot(db)`、
  `PLAN-L7-206` で S3 verified）: 既存 harness.db projection を query-only で束ねた read-only response。
  UI はこの deterministic JSON を読み、LLM 生成図・要約を正本にしない。

本書は view の要件 ID（`HR-FR-VIS-01..`）と acceptance ID（`HAC-VIS-*` / `HAT-VIS-*`）を確定するだけで、
VSCode extension・Webview・CSP・view-model 関数・graph IR 変換の実装はしない（L4/L5/L6/L7 の後続 PLAN）。
本書は L1/L3 confirmed 正本の意味単位を上書きせず、`pillar-functional-requirements.md` §0.1 の
「visualization は下流実装 frontier」区分に従い、confirmed 46 件へ混ぜない別枠 frontier として追跡する。

## §1 View 別要件（surface 割り付け・正本 source・oracle）

`PLAN-DISCOVERY-10` 候補 View 5 種に、PO 指示（2026-07-07「プロジェクト進捗と HARNESS の成長の両方を
見たい」）による Harness growth view を加えた 6 種を、VS Code first surface = Tree View（一覧/階層
navigation）と Webview = graph/detail panel に割り付ける。プロジェクト進捗 = Layer progress view、
ハーネス自体の成長 = Harness growth view が対応し、両者を同一 surface 上で参照できることを要件とする。各 view の正本 source は `VisualizationSnapshot` の対応 field
に限定する。

| View | first surface | Webview panel | 正本 source（VisualizationSnapshot field） | 主 oracle |
|------|---------------|---------------|---------------------------------------------|-----------|
| Layer progress | Tree View（PLAN/gate/artifact の階層） | 集計 bar/detail | `progress.artifacts` / `progress.plans` / `progress.gates` | metric 数が DB source と一致、空 DB は 0 + warning |
| Design/test pair | Tree View（pair 有無の階層） | orphan graph | `graph.nodes` / `graph.edges` ＋ `drilldowns.relation_graph_command`。**注**: 現行 `graph.*` は全 node/edge 種別込みの総数（`node_type`/`edge_kind` フィルタなし）。pair edge に絞ったフィルタ済み count は L6 view-model 契約で専用 field を新設して定義する | orphan node は 0 か明示表示、edge は DB 再現可能。総数一致 oracle（HAC-VIS-02a）の対象は L6 で定義するフィルタ済み集計とする |
| Relation/dependency | — | Mermaid graph panel | `graph.nodes` / `graph.edges` / `graph.latest_snapshot_*` | 描画 node/edge 数が graph_nodes / dependency_edges（または latest snapshot count）と一致 |
| Runtime evidence | Tree View（evidence 種別の階層） | evidence timeline / detail | `evidence.test_runs` / `evidence.runtime_verification` / `evidence.guardrail_decisions` | `projection_only_unverified` / `missing_runtime_provenance` を runtime_verified / accepted と混同しない |
| Skill/agent telemetry | Tree View（skill/model の一覧） | metrics table / trend | `evidence.skill_invocations` / `evidence.model_runs` | 各 metric row が evidence path（`drilldowns`）へ deterministic に戻れる |
| Harness growth（ハーネス成長トレンド） | Tree View（資産クラス別の現在値） | 時系列 trend panel | `progress.*` の現在値 ＋ `graph.latest_snapshot_*` 系列（snapshot 履歴）・evidence timestamp 系列。時系列集計の field 契約は L6 view-model で新設する | 各時点の値が snapshot / evidence timestamp から DB 再現可能。履歴が無い期間は補間・捏造せず「記録なし」を明示 |

情報設計判断（設計者裁量で確定）:

- **top-level 分割 = 「Project view」/「Harness view」の 2 root**（PO 指示 2026-07-07
  「ハーネス view とプロジェクト view で分けるといい」）。Tree View の最上位を 2 分割し、
  Project root = 載せている product work の進捗（Layer progress / Design-test pair /
  Relation-dependency / Runtime evidence）、Harness root = ハーネス自身の状態と成長
  （Harness growth / Skill-agent telemetry）を割り付ける。両 root は同一 `VisualizationSnapshot`
  を source とし、root 間で数値定義を変えない（同じ field は同じ値）。
- first surface は Tree View に寄せる。graph/timeline/trend など VS Code native view で表現しづらい描画のみ
  Webview panel に置く（VS Code Webview UX guideline: Webview を濫用しない）。
- 階層構造は「view 種別 → 集計 bucket → 個別 row」の 3 段を既定にし、row から drill-down（§4）へ接続する。
- 空状態表現: `VisualizationSnapshot.warnings`（例: `artifact_progress is empty`）を Tree View の説明 node
  として表示し、0 件を「成功」や「該当なし（正常）」と誤読させない。
- エラー表現: source field 欠落・count 乖離・projection-only 混入は、成功 UI に混ぜず warning/error node として
  分離表示する（捏造した緑を出さない）。

## §2 要件（HR-FR-VIS）

| ID | 親（L1） | 要件（機械強制/検証可能） | 主な受入 |
|----|----------|----------------------------|----------|
| HR-FR-VIS-01 | HBR-P9 / HBR-P4 | 候補 View 5 種 ＋ Harness growth view の計 6 view を、Tree View 最上位の 2 root（Project view = 進捗系 4 view / Harness view = Harness growth・Skill-agent telemetry）に分類した上で Tree View（first surface）と Webview graph/detail panel へ割り付け、各 view は `VisualizationSnapshot` の対応 field のみを正本 source にする。LLM 生成図・free-form 要約を view の正本にしない | HAC-VIS-01a / HAC-VIS-01b |
| HR-FR-VIS-02 | HBR-P9 | graph/progress/evidence view の描画 node/edge/metric 数は DB source（graph_nodes / dependency_edges / latest snapshot count / projection 集計）と一致し、乖離時は成功を捏造せず warning/error として表示する | HAC-VIS-02a / HAC-VIS-02b |
| HR-FR-VIS-03 | HBR-P7 / HNFR-P3 | runtime evidence view は `runtime_verified` と `projection_only_unverified` / `missing_runtime_provenance` を分離表示し、projection-only を accepted runtime verification として昇格表示しない | HAC-VIS-03a / HAC-VIS-03b |
| HR-FR-VIS-04 | HBR-P9 | 空 DB（cold start）では全 view が 0 を表示し、`VisualizationSnapshot.warnings` を全 view 共通の共有 banner として表示する（view 別 warning は要求しない）。成功・mock・非ゼロ値を捏造しない | HAC-VIS-04a / HAC-VIS-04b |
| HR-FR-VIS-05 | HNFR-P8 / HNFR-AC | view は read-only 描画 + CLI command copy までに限定し、command 実行・外部 API・設定変更・branch/ruleset mutation は action-binding approval 境界（HNFR-P8 / XR-2）に置き、approval なしに実行しない。secret / provider transcript / machine-local absolute path を view state に保持しない | HAC-VIS-05a / HAC-VIS-05b |
| HR-FR-VIS-06 | HBR-P9 / HNFR-P3 | 各表示要素は `VisualizationSnapshot.drilldowns` の CLI/table pointer を用い、evidence path（DB row / docs / CLI command）へ deterministic に戻れる。drill-down 先が無い、または LLM 要約を根拠にする表示を許さない | HAC-VIS-06a / HAC-VIS-06b |
| HR-FR-VIS-07 | HBR-P9 / HBR-P4 | プロジェクト進捗（Layer progress）と並置して、ハーネス自体の成長（PLAN / artifact / gate / test / skill 等の資産クラス別 count の時系列トレンド）を表示する。各時点の値は snapshot 履歴・evidence timestamp から DB 再現可能とし、履歴が無い期間は補間・捏造せず「記録なし」を明示する。時系列集計 field は L6 view-model 契約で新設する | HAC-VIS-07a / HAC-VIS-07b |

## §3 受入条件（HAC-VIS）

| AC-ID | 前提/操作 | 実行 | 期待 |
|-------|-----------|------|------|
| HAC-VIS-01a | 6 view を surface に割り付ける | view→source マッピングを検査 | 各 view が Project / Harness いずれかの root 配下で Tree View または Webview panel に割り付き、正本 source が `VisualizationSnapshot` の実在 field を指す |
| HAC-VIS-01b | view が snapshot 外（LLM 生成/free-form）を正本に使う | view 契約を検査 | 正本違反として fail し、補助説明を正本に昇格させない |
| HAC-VIS-02a | graph/progress/evidence view を描画する | 描画 count と DB source を突き合わせ | node/edge/metric 数が、その view が使用する定義済み集計（全体 count または L6 view-model 契約で明示するフィルタ済み count）と一致する。view ごとの集計方法は実装契約で一意に明示する |
| HAC-VIS-02b | 描画 count が source と乖離 | 一致検査を実行 | 成功を捏造せず、乖離を warning/error として分離表示する |
| HAC-VIS-03a | runtime evidence view を描画する | verification class 別集計を検査 | `runtime_verified` と `projection_only_unverified` / `missing_runtime_provenance` が分離表示される |
| HAC-VIS-03b | projection-only row を accepted として表示しようとする | runtime evidence 集計を検査 | accepted runtime verification への昇格表示を拒否し、`VisualizationSnapshot.warnings` を surface する |
| HAC-VIS-04a | 空 DB（cold start）で view を開く | snapshot を読む | 各 view が 0 を表示し、`VisualizationSnapshot.warnings` は view 別ではなく **全 view 共通の共有 banner** として表示される（現行実装の warning は `artifact_progress is empty` の 1 件のみ。graph/evidence/skill 系の空状態 warning 追加は後続 L5/L6 の `warnings` 拡張タスクとし §6 に記載） |
| HAC-VIS-04b | 空 DB で非ゼロ/mock を表示しようとする | cold start 描画を検査 | 成功・偽データ捏造を拒否し、空状態 node を出す |
| HAC-VIS-05a | view の action surface を確認する | 導線を検査 | read-only 描画 + CLI command copy のみで、mutation 導線が無い。secret / transcript / 絶対 path を state に持たない |
| HAC-VIS-05b | view から command 実行/外部 API/config mutation を試行 | action 境界を検査 | action-binding approval（actor/tool/target/params/timestamp/expiry、L1 §2.8 タプル準拠）なしに実行せず、deny または approval-bound にする |
| HAC-VIS-06a | 表示要素（node/row/metric）を選択する | drill-down を実行 | `drilldowns` の CLI/table pointer で DB row / docs path / CLI command へ deterministic に到達する |
| HAC-VIS-06b | drill-down 先が無い、または LLM 要約を根拠にする | drill-down 契約を検査 | evidence path 欠落・LLM 正本化を fail とし、deterministic pointer を要求する |
| HAC-VIS-07a | Harness growth view を描画する | 時系列 series の各点を DB source（snapshot 履歴 / evidence timestamp 集計）と突き合わせ | 各時点の値が DB から再現でき、Layer progress view と同一 surface 上で並置参照できる |
| HAC-VIS-07b | snapshot 履歴の無い期間を描画する | trend 描画を検査 | 補間・推定値で埋めず「記録なし」を明示し、成長を捏造しない |

## §4 不変条件

1. 正本は Markdown・harness.db projection・relation graph・runtime evidence であり、LLM 生成図・要約は補助説明に限る。
2. view の描画数（node/edge/metric）は DB source から再現でき、乖離は成功に混ぜず warning/error に落とす。
3. `projection_only_unverified` / `missing_runtime_provenance` は runtime verified / accepted に昇格表示しない。
4. 空 DB は 0 + warning で表現し、空を「正常・該当なし」と誤読させる緑を出さない。
5. view は read-only first。mutation 導線（command 実行・外部 API・config・branch/ruleset）は action-binding
   approval 境界（HNFR-P8 / XR-2）に置き、read-only 描画は approval 対象外にとどめる。
6. view state に secret・provider transcript・machine-local absolute path を保持しない。
7. drill-down は `VisualizationSnapshot.drilldowns` の CLI/table pointer による deterministic 経路とし、
   LLM 生成の要約を drill-down 根拠にしない。

## §5 旧 HELIX inventory 採用可否台帳（inventory-first 実施証跡）

旧 HELIX（`RetryYN/ai-dev-kit-vscode`、read-only 参照）の可視化系機能を突き合わせた結果
（2026-07-06 に同 repo の shallow clone に対する一次確認済み。旧 HELIX に VSCode extension /
Webview / TreeView 実装は存在せず、可視化は CLI text snapshot と Mermaid/graphviz 生成の 2 系統のみ）。
**照合対象の PLAN 群はいずれも `status:draft` / `is_reference:true` の設計止まりで実コードはほぼ無い**。
したがって採用は **設計概念のみ移植し、TS/Bun でゼロから実装**する（ADR-001 厳守・bulk import 禁止・Python
runtime 非持込）。旧識別子・旧 runtime 前提は harden して harness の仕組みへ従属させる。

| 旧 HELIX 資産 | 出所 | 概念 | 判定 | 理由 / harden 方針 |
|----------------|------|------|------|--------------------|
| helix dashboard | `cli/helix-dashboard` | read-only 静的 snapshot、対話型 UI はスコープ外という設計哲学 | adopt-concept | 集約カウンタを TS 再実装し、data source を harness.db 読取（`VisualizationSnapshot`）へ置換。静的 read-only 哲学を Tree View first に継承 |
| ADR Decision Graph | 旧 PLAN-131 / 149 / 192 | frontmatter relation field（supersedes / influences / contradicts）+ DAG + Mermaid 色分け + cycle 検出の gate 化 | adopt-concept | PLAN/ADR 依存 graph の雛形として Relation/dependency view と graph IR に採取。cycle 検出は後続 gate 候補 |
| axis-10 relation-graph | `axis_10_relation_graph.py` | 複数ソースを hub-and-spoke Mermaid graph に統合 | adopt-concept | graph IR 集約の概念土台。複数 projection を 1 graph に束ねる考えを TS 側 graph IR（後続 L6）へ移植 |
| agent dispatch trace viz | 旧 PLAN-219 | dispatch DAG + critical path 強調 | adopt-concept | 将来 view 候補。**初回 slice の 6 view には含めない**（対象外と明記）。Skill/agent telemetry の発展形として後続で判断 |
| cross-session knowledge graph | 旧 PLAN-208 | セッション横断の知識 graph | skip | L3 粒度に対して過大。visualization 初回 slice の範囲を超える |
| handover diff/merge UI | 旧 PLAN-209（Flask） | handover の diff/merge 対話 UI | skip | read-only 方針・Tree View first と不整合。mutation 導線を持つため §4-5 の read-only 境界に反する |
| statusLine context warning | 旧 PLAN-112 | statusLine への context 警告表示 | skip | 資産・進捗可視化の主眼外。visualization view の情報設計とは別関心 |

## §6 後続実装境界

- L4: VSCode extension adapter 境界、Tree View / Webview 境界、CSP / localResourceRoots policy、
  read-only action 境界、provider transcript 非保存。
- L5: visualization read-model 契約、graph IR 契約、drill-down 契約。pair edge フィルタ済み count field と
  graph/evidence/skill 系の空状態 warning の `VisualizationSnapshot.warnings` 拡張、および
  Harness growth view の時系列集計 field（HR-FR-VIS-07）はここで契約化する。
- L6: layer tree / Mermaid 互換 graph IR / runtime evidence timeline / drill-down pointer の view-model 関数。
- L7: 先に VSCode Tree View prototype、次に Webview graph/detail panel。
- 初回 slice に action surface を入れない。command 実行・外部 API・branch/ruleset mutation は
  action-binding approval のまま残す。agent dispatch trace view（旧 PLAN-219 由来）は初回 6 view に含めない。
- 本書は `PLAN-L7-141` 中央 web dashboard を完成扱いにせず、`PLAN-M-02` identifier cutover とも独立である。
</content>
</invoke>
