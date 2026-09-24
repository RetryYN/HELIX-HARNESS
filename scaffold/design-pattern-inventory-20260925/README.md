# 設計パターン・設計ユニット候補の調査

status: research_scaffold（候補整理。採用・不採用、要求、設計、実装の決定ではない）
authority_effect: none
source package: `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`
source package SHA-256: `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`

## 目的と境界

HELIX Concept（`docs/concept/helix-concept.md` §3「機構の役割」）とPO判断記録（`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`）を受け、旧テンプレート群から将来検討できる設計パターン、設計ユニット、パーツ、および導出物の候補を調査した。ここにある分類、profile対応、依存は調査者による対応づけであり、要求入力の質問もPO判断ではない。

ZIPのテンプレート、YAML、ツール、生成物は参照しただけである。ZIP内のコード・ツールは実行せず、テンプレートを現行pathへコピーしていない。候補の採否、権利、顧客データの利用、責務境界、正本の置き方は決めていない。

## 入力と出典

| 出典 | 確認できた内容 | 調査上の扱い |
|---|---|---|
| `archive/reference-sources/README.md` | `v1-fixed`と`_v1`はいずれも703ファイル。261ファイル差があり、`v1-fixed`が旧採用マトリクスの参照版。ZIPはread-only資料 | 版の同定根拠 |
| ZIP `hybrid-docgen/docs/catalog.yaml` | 22区分、179設計項目。項目ID、カテゴリ、状態、テンプレート番号、既定粒度 | 候補出典の索引。`done`等をHELIXでの採否と解釈しない |
| ZIP `hybrid-docgen/docs/profiles.yaml` | PoC、Standard、Enterprise、Web、Mobile、Desktop、CLI、APIServiceの8 profile | システム種別と規模に応じた候補適用範囲の参考 |
| ZIP `hybrid-docgen/docs/NN_…yaml` | 01〜122の番号付き文書122件。設計項目の記述例・source | 各候補のsource出典 |
| ZIP `hybrid-docgen/templates/` | 番号付きYAML雛形70件（YAML全体では76ファイル） | 空スケルトンとして参照。候補表ではdocsの項目番号とtemplatesの実ファイルを区別 |
| 旧HELIX `root/docs/migration/source-manifests/hybrid-vmodel-source.v1.json` | `adopted_entry_count: 21`、21件のpathとSHA-256 | 旧HELIXが採用対象として記録したZIP entryの一次一覧 |
| ZIP `hybrid-docgen/tools/` | `schedule.py`、`assign.py`、`diagram_dsl.py`、`derive_traces.py`、`impact.py`、`scope.py`、`build.py`等 | 可能な導出・依存の資料。実行・移植はしていない |
| `docs/concept/helix-concept.md` | BRAINが設計テンプレ等から汎用構造を取り出し、製品のヘリックスコアへ提供。製品固有の意味・設計はコアが保持 | 現行の上流意図 |
| `docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md` | パターン抽出、設計ユニット・パーツ、要求段階の入力質問、工程表・遷移図・実装優先順位の導出案 | PO判断の記録。未確定事項も保持 |
| 旧HELIX `root/docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md` | HVM-ADOPT-01〜05、HVM-COMP-01〜03、HVM-REJECT-01〜03。§4は5つの採用概念群、§5は補完、§6は非採用 | 旧判断との対応表。現行採否を生成しない |
| 旧HELIX `root/docs/design/helix/L4-basic-design/design-template-json-authority.md` | template JSON・instance JSON・graph JSON、適用条件、設計portfolio、pair graph、生成viewの責務案 | 旧設計の別系統。ZIPとの接続は旧時点で未成立 |

## 候補のまとまり

以下はcatalogの179項目を意味上の束にまとめた調査候補である。候補束は採用単位ではない。番号は主として`docs/`内の項目例であり、`templates/`内に同番号の雛形があるとは限らない。各profileはZIPの定義に基づく適用候補で、HELIXにおける必要性・必須化を意味しない。Standardはカタログの状態を維持するprofile、PoCは最小集合、Enterpriseは広い集合と高リスク領域の詳細化、Web等はクライアント・サービス特性による追加項目が中心。

| 候補ユニット／パーツ | ZIPの主な設計項目・テンプレート例 | profile候補 | 要求段階で尋ねる入力候補 | 依存候補 |
|---|---|---|---|---|
| 企画・要求・要求台帳 | `kikaku` 01、`youkyu` 02、`youken` 03、`req_register` 43、`usecase_list` 02 | 8種共通候補。PoCは簡易、Standard既定、各system profileでは採用記載 | 利用者と解決したいこと、成功条件、対象範囲、優先度（MoSCoW）、制約、利用場面 | domain、用語、受入基準、テーラリング |
| ドメイン・業務フロー | `domain`・`bounded_ctx`・`aggregate` 27、`domain_event` 39、`workflow` 19、`glossary` 30 | 8種共通候補。業務・データ複雑性に応じて粒度候補 | 用語、業務主体、業務規則、境界、状態・イベント、例外 | 要求・ユースケース、データ項目、状態遷移、権限 |
| システム構成・境界・外部接続 | `sysconf`・`tenant`・`api_list` 04、`integration` 42、`extif_spec` 17、`externalization` 32 | 8種共通候補。Web/APIServiceでAPI・連携、Enterpriseでセキュリティ等の詳細候補 | 実行場所、利用環境、外部system、接続方向、データ境界、分離要件、交換可能性 | 要求、security/privacy、data、deployment、contract/schema |
| 機能・画面・API・入出力 | `func_list`・`screen_list`・`api_list` 04、`func_detail`・`screen_spec` 05、`io` 23、`logic` 24 | Web/Mobile/Desktopに加え、CLI/APIServiceのprofileもscreen_list・screen_specを採用記載。画面要素が各対象で何を意味するかは旧profile記述の事実として保持し、HELIX上の要否は未決 | 利用者操作、入出力、応答、エラー、権限、非同期動作、互換性 | 要求・use case、domain、data、component、security、検証 |
| データ・永続化・イベント | `data_item` 03、`db_table` 05、`db_view` 17、`db` 22、`event_schema` 39、`crud` 04 | 8種共通候補。データ利用のある対象で適用を検討 | データ項目、所有者、保存期間、機密性、整合性、検索・更新、移行 | domain、privacy、tenant境界、API、logging、backup/DR |
| 品質属性・安全・プライバシー | `security`・`authz`・`appsec` 10、`privacy` 36、`nfr_grid` 58、`perf_design` 69 | Enterpriseで詳細化候補。各system profileで採用記載 | 脅威、権限主体、機密情報、性能・可用性目標、法令・契約、外部送信 | 構成、data、identity、operation、検証・負例 |
| クライアント別パーツ | `fe_design` 72等、Mobile系 `mobile_arch`・`offline_sync`・`push_perms`・`app_dist`・`mobile_sec`、Desktop系 `desk_arch`・`desk_pkg`・`desk_update`・`desk_sign`・`desk_os`・`desk_sec`、CLI系 `cli_arch`・`cli_cfg`・`cli_dist`、API系 `api_gov`・`api_portal`・`api_webhook` | Web / Mobile / Desktop / CLI / APIServiceの該当profile | 画面・端末・OS・配布方式、offline要否、push/permission、CLI操作・設定、API利用者・version・webhook | システム構成、identity/security、release、observability、契約 |
| SaaS・tenant・課金 | `billing` 54、`tenant_lifecycle` 55、`quota` 60、`residency` 59、`finops` 64 | Web/Enterprise等で対象候補。8profileの採否は個別条件次第 | tenantモデル、料金・計量単位、上限、公平性、region、解約・データ処理 | identity、data separation、billing、operation、privacy |
| 検証・受入・テスト | `verification`・`test_tech`・`test_data`・`coverage_crit`・`contract_test` 28、`bdd` 29、UT/IT/ST/AT 06〜09、性能・security test 101/102 | 8種共通候補。PoCは一部簡易、Enterpriseでは重点領域の詳細化候補 | 利用者が成功とみなす例、境界値、失敗時の振る舞い、品質閾値、データ条件 | 要求・設計、trace、security/performance、環境 |
| 運用・復旧・観測 | `ops` 11、`measurement` 20、`logging` 21、`maintenance` 34、`dr_bcp` 35、`incident` 62、`restart` 50 | Standard/Enterprise等で対象候補。PoCでは簡略/対象外項目がある | 運用主体、SLO/KPI、ログ範囲、保持、障害分類、復旧目標、保守・EOL | 構成、security、計測、deployment、incident response |
| 開発工程・変更・テーラリング | `wbs`、`trace`、`tailoring` 52、`mgmt`・`change` 14、`proj_plan` 103、`release_strategy` 61 | 全profileの適用候補。規模・リスクに応じた詳細度差 | 期限・マイルストーン、依存、release単位、変更頻度、利用可能資源、対象外理由 | 要求優先度、設計依存、V-pair、受入・運用条件 |
| 図・構造表現 | `diagrams.yaml`: 構成、画面/状態遷移、ER、sequence、component、DFD、job、wireframe、deployment、agent等 | 関連するユニットの必要情報とprofileに従う候補 | 表したい問い、対象ノード、境界、状態・イベント、読み手 | 各図が参照するdomain、構成、API、data、workflow |
| AI agent・ガードレール | `agent`・`agent_guard` 40、`ai_verification` 49、`model_gov` 70 | AIを使う対象で候補。PoCにもAI検証項目がある | AIの役割、使えるtool/data、禁止操作、根拠提示、評価方法、人への引継ぎ条件 | security、privacy、logging、test/eval、operation |

候補表で挙げた文書番号は`docs/`のsource番号である。対応する番号付き雛形が`templates/`にある場合は以下に示す。記載のない番号は対応する番号付き雛形がなく、`docs/`の記述例だけを参照した。

| 候補束 | `docs/`内の主なsource | `templates/`内の該当雛形 |
|---|---|---|
| 企画・要求・要求台帳 | 01、02、03、43 | 01、02、03（43の番号付き雛形なし） |
| ドメイン・業務フロー | 19、27、30、39 | 19、27、30、39 |
| システム構成・境界・外部接続 | 04、17、32、42 | 04、17、32、42 |
| 機能・画面・API・入出力 | 04、05、23、24 | 04、05、23、24 |
| データ・永続化・イベント | 03、04、05、17、22、39 | 03、04、17、22、39 |
| 品質属性・安全・プライバシー | 10、36、58、69 | 10、36 |
| クライアント別パーツ | Web 72〜75、Mobile 76〜81、Desktop 82〜87、CLI 88〜90、API 91〜93 | 該当する番号付き雛形なし |
| SaaS・tenant・課金 | 54、55、59、60、64 | 該当する番号付き雛形なし |
| 検証・受入・テスト | 06〜09、28、29、101、102 | 06〜09、28、29 |
| 運用・復旧・観測 | 11、20、21、34、35、50、62 | 11、20、21、34、35、50 |
| 開発工程・変更・テーラリング | 14、52、61、103、112〜121 | 14、52、112〜121（61、103の番号付き雛形なし） |
| 図・構造表現 | `diagrams.yaml` | 番号付き雛形なし |
| AI agent・ガードレール | 40、49、70 | 40、49（70の番号付き雛形なし） |

### 設計パターン候補（意味のまとまり）

- **要求から型付き構造を導く**：要求・義務を設計対象へ結び、ID、種別、依存、検証側を追跡可能にする候補。根拠例は02/03/28/29/43/99と旧JSON authorityの`DesignPortfolioPlanner`。
- **プロファイルと粒度で設計範囲を絞る**：system種別・規模・riskに応じて必要候補と詳細さを明示する候補。根拠は`catalog.yaml`、`profiles.yaml`、52。
- **依存関係を有向グラフで表す**：ユニット間の先行・参照・V-pair・循環を表現する候補。根拠例は98/99、`traceability.yaml`、`build.py deps/check`の説明、旧matrix HVM-ADOPT-03。
- **設計と図を共通構造から投影する**：遷移図・構成図等の構造を機械可読な宣言にし、図を派生表示とする候補。根拠は`diagrams.yaml`、`diagram_dsl.py`、旧JSON authorityの`graph JSON`/`GeneratedViewProjector`。
- **変更影響から再確認範囲を導く**：上流・下流・検証・本文参照へ変更の影響を展開する候補。根拠は`impact.py`の記述と旧matrix HVM-ADOPT-03。
- **運用までを設計coverageに含める**：計測・ログ・保守・障害・復旧を設計候補に含める。根拠は11/20/21/34/35/62と旧matrix HVM-ADOPT-05。

これらは候補パターンであり、汎用patternとしてBRAINが保持するか、製品コアの意味として保持するかは別途未決である。

## 導出成果物候補と材料

| 導出物候補 | 参照材料 | ZIP内の根拠（実行していない） | 注意点 |
|---|---|---|---|
| 工程表・作業順候補 | 設計ユニット依存、有効profile、Vレベル、要求優先度、先行関係 | `wbs.yaml`、107、`schedule.py`説明 | 日程・担当・進捗の確定主体と、単なる順序候補の境界が未決 |
| 状態遷移図 | 状態、イベント、ガード、遷移元・先、要求/受入条件 | `diagrams.yaml`、19、39、`diagram_dsl.py` | 「遷移図」が画面、業務、job、開発workflowのどれを指すか未決 |
| 依存図 | ユニット間依存、参照、trace、pair関係 | 98/99、`traceability.yaml`、`build.py deps/check`説明 | 依存種別と循環許容条件を定義する必要があるが、ここでは決めない |
| 影響範囲 | 変更対象、上流・下流trace、参照、検証edge | `impact.py`の説明 | 意味上の影響評価を機械的到達可能性だけで代替できるとはしない |
| 実装優先順位候補 | MoSCoW要求優先度、WSJF（遅延コスト÷作業規模の目安）、設計依存、工程先行関係 | 02、43、112、`build.py deps/check`、`schedule.py`。旧L5 `requirement-refinement-authority.md`「実装順」、旧L6 `issue-scope-authority-gates.md` `stable_topological_order` | ZIPは順位計算器を持たない。PO判断記録も材料の接続を旧HELIXとの差分と記載。出力は候補で、決定者・tie-breakは未決 |

## 旧HELIX採用マトリクスとの対応

旧matrixのIDと本調査候補の対応を示す。これは過去の旧HELIX判断の記録であり、本PRでの採用・不採用判断ではない。

| 旧matrix | 旧文書で確認できる判断 | この候補調査との接点 |
|---|---|---|
| HVM-ADOPT-01 | YAML SSOT・typed specの考え方 | 要求から型付き構造を導く、依存図 |
| HVM-ADOPT-02 | catalog/profile/tailoring | 全候補ユニットのprofile・粒度対応 |
| HVM-ADOPT-03 | traceability/deps/impact | 依存図、影響範囲、設計portfolio |
| HVM-ADOPT-04 | WBS/工程表とVレベル | 工程表・作業順候補、V-pair |
| HVM-ADOPT-05 | 運用・ログ・KPI・保守・incident | 運用・復旧・観測ユニット |
| HVM-COMP-01〜03 | runtime evidence、動的Project view、approval/action境界の補完 | 導出結果のauthority・表示・実行境界に関係する旧判断 |
| HVM-REJECT-01 | Python generator / Excel builderをHELIX core runtimeへ移植しない | ZIP toolsは資料参照のみ。本調査では実行・移植しない |
| HVM-REJECT-02 | 53文書を全案件で一律必須化しない | 179項目をprofile別候補として扱い、一律必須とは記載しない |
| HVM-REJECT-03 | Excel buildを完了証跡の正本にしない | 出力候補は設計の導出物として記録し、完了証跡としない |

### 旧HELIXが記録した採用21 entry

旧source manifest `hybrid-vmodel-source.v1.json` はZIP内entry（ファイル）を単位として21件を列挙し、各pathとSHA-256を固定している。これは旧HELIXでの選定記録であり、本調査や現行HELIXでの採否ではない。採用記録entryと本調査候補・旧matrixの概念群との対応は次のとおり。

| 旧entry（path末尾） | 本調査候補との接点 | 旧matrix上の関連 |
|---|---|---|
| `docs/107_Vモデル・レベル定義.yaml` | 工程・V-pair候補 | HVM-ADOPT-04 |
| `docs/99_型付きスペック・自動検出設計書.yaml` | typed declaration・ID・依存候補 | HVM-ADOPT-01、03 |
| `docs/catalog.yaml` | 179項目の設計候補一覧 | HVM-ADOPT-02 |
| `docs/profiles.yaml` | 8 profileの適用候補 | HVM-ADOPT-02 |
| `docs/52_文書化方針・テーラリング設計.yaml` | profile・粒度の調整候補 | HVM-ADOPT-02 |
| `docs/112_プロダクトバックログ.yaml` | 優先順位材料・作業候補 | HVM-ADOPT-04との接点。MoSCoW/WSJF自体の記録とは区別 |
| `docs/113_ユーザーストーリーマッピング.yaml` | 要求・利用者価値の分解候補 | HVM-ADOPT-04との接点 |
| `docs/114_見積り・ベロシティ設計.yaml` | 作業規模・工程計画材料候補 | HVM-ADOPT-04との接点 |
| `docs/115_リリースプラン.yaml` | release単位・工程表候補 | HVM-ADOPT-04 |
| `docs/116_スプリント計画.yaml` | 先行関係・短期工程候補 | HVM-ADOPT-04 |
| `docs/117_DoR・DoD.yaml` | 着手・完了条件候補 | HVM-ADOPT-04との接点 |
| `docs/118_デイリースクラム・進行記録.yaml` | 作業進捗の記録候補 | HVM-ADOPT-04との接点 |
| `docs/119_スプリントレビュー記録.yaml` | 受入・review観点候補 | HVM-ADOPT-03との接点 |
| `docs/120_レトロスペクティブ記録.yaml` | 改善材料候補 | HVM-ADOPT-05との接点 |
| `docs/121_バーンダウン・ベロシティ実績.yaml` | 工程実績・計測候補 | HVM-ADOPT-04、05との接点 |
| `docs/29_受入基準・BDDシナリオ.yaml` | 受入・検証・trace候補 | HVM-ADOPT-03 |
| `tools/build.py` | source宣言・検出・依存の参照元 | HVM-ADOPT-01との意味上の接点。ただしHVM-REJECT-01はPython generator/Excel builderのcore runtime移植を非採用 |
| `tools/spec_check.py` | 参照・整合性検出の参照元 | HVM-ADOPT-01、03との接点 |
| `tools/spec_types.py` | typed spec検査の参照元 | HVM-ADOPT-01との接点 |
| `tools/assign.py` | 要求・検証作業の割当表現候補 | HVM-ADOPT-04との接点 |
| `tools/schedule.py` | 工程・先行関係の検査と導出物候補 | HVM-ADOPT-04との接点 |

Manifestのentry採用とmatrixの概念採用は異なる粒度である。特にtools entryがmanifestに含まれることは、Python実装を現行core runtimeへ移植する判断を意味しない。matrix §4は5概念群を採用対象として記録し、§6 HVM-REJECT-01〜03は移植・一律必須化・Excelを完了証跡の正本とする扱いを採らないと記す。

## 未決の点とPO向け質問案

以下は既存PO判断の未決点を保った質問案であり、回答を前提とする判断は置いていない。

1. HELIXで設計テンプレから取り出した汎用の型や構造を、どのような形で役立てたいですか。製品ごとの設計や用語を、HELIX全体で共通にしたい部分と、それぞれの製品に残したい部分はどこですか。
2. 設計ユニットをつなぐ「コネクタ」は、どのような仕事をするものとして考えていますか。機構間の通信を担うHELIX-CONNECTとの関係に、意図はありますか。
3. BRAINが稼働中に担う理解、計画、予測、診断、レビュー、配置案は、今後どのような役割として残したいですか。
4. 設計項目の選択やprofileへの当てはめについて、最終的に誰がどのような情報を見て決めることを期待しますか。ここでいう「profile」は、PoCやWebなど対象の種類に応じて設計候補を絞る設定です。
5. 設計ユニットから工程表や実装順を出すとき、どのような情報があれば判断に使えますか。MoSCoW（必須・望ましい等の優先度）、WSJF（遅延コストと作業規模から優先度を考える方法）、設計依存、工程の先行関係のうち、どれをどのように見たいですか。
6. 「遷移図」として、どのような対象の変化を見たいですか。利用者操作、業務状態、データ状態、jobの進行、開発工程など、思い描いている例はありますか。
7. 設計テンプレから学ぶ「学習」は、共通構造の蓄積、検索・再利用、モデル調整など、どのような変化を指していますか。また、いつから利用できる状態を期待しますか。
8. 「原本」と「正本」は、それぞれ何を指す言葉としてお使いですか。HELIXが保持するものと利用者へ渡す成果物との対応について、POの意図を教えてください。

## 参照位置・調査範囲

- 現行Concept: `docs/concept/helix-concept.md` §1、§3「機構の役割」BRAIN・HARNESSのコア、設計パターン、1.0土台。
- PO判断: `docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`「PO発言と判断」「Conceptへ反映した内容」「旧HELIXとの対応」「未確定の点」。
- 旧資産: `archive/legacy-generation-2026-09-14/root/docs/migration/source-manifests/hybrid-vmodel-source.v1.json`（21 entryとdigest）、`root/docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md` §1〜§9、`root/docs/design/helix/L4-basic-design/design-template-json-authority.md` §1〜§7、`root/docs/design/helix/L5-detail/requirement-refinement-authority.md`「実装順」、`root/docs/design/helix/L6-function-design/issue-scope-authority-gates.md` `AcyclicGraphV1.stable_topological_order`。
- ZIP内出典: `hybrid-docgen/docs/catalog.yaml`（22区分・179項目）、`profiles.yaml`、`docs/NN_…yaml`（番号付き122件）、`templates/`（番号付き雛形70件）、`docs/98_編み目式Vモデル設計術.yaml`、`99_型付きスペック・自動検出設計書.yaml`、`107_Vモデル・レベル定義.yaml`、`112_プロダクトバックログ.yaml`〜`121_バーンダウン・ベロシティ実績.yaml`、`tools/{schedule,assign,diagram_dsl,derive_traces,impact,scope,build}.py`。いずれもread-only閲覧。
- ZIPの別版差分・SHA: `archive/reference-sources/README.md`。

## 未解決・限界

- 21 entryのpathとdigestはmanifestで特定でき、個別対応表を上に記録した。各entryとConcept上の最終的な意味・現行採否を同一視しない。
- 旧matrixの採用判断は概念群、source manifestの21件はZIP entry、catalogの項目は179設計項目で、それぞれの粒度を区別する。
- profileの定義は旧ZIPのsystem/profile前提であり、HELIX-HARNESSやBRAINの必要範囲へ自動変換できない。
- 要求入力候補はPOへの質問項目ではなく、テンプレートから抽出した質問テーマである。実際の質問文・入力のauthority・保存先は未定。
- 導出物の具体アルゴリズム、順位付けの決定主体、図の意味、ヘリックスコア/BRAIN/OS/Intelligenceの責務、原本・正本の用語対応は未決。
