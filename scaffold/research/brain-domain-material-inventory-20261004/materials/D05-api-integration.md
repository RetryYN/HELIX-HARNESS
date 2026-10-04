# D05 API / Integration：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「境界をどこに引き何が越えるか、endpointの形、提供者と利用者の契約と互換、版と廃止、外部serviceとの接続（隔離、失敗時の振る舞い、再送・冪等）、外部dataの取り込み」を扱うと仮に読む。処理の中身はD03、保存の構造はD06に置いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D05-M01 | LEGACY-ASSET-429C82941E059B0F3D12 | `docs/skills/api-and-interface-design.md` | 39–65 | 721b1067ec8cafa5e5063eac2b573077b0da3c6c67fdfef48c8610432509e50b | 境界を越えるたびに記録する物（発生元の画面・操作、対象component、dataの向き＝read／write／event、両側のschemaの持ち主）、機能設計では転送方式を書かず「actor、trigger、観測できる応答」だけを書く、基本設計で関数signature・command・HTTP routeへ解決する | Design Unit候補「境界の横断の記述」、Pattern候補「境界を先に名付け、転送方式を後で決める」 | 層番号（L2／L3／L4）は旧世代のもの。PLANの`requires`・`placeholder_dep`の運用（58、71–76）はHELIX固有 |
| D05-M02 | LEGACY-ASSET-E2D57A016FBD3D312CFA | `docs/skills/api-contract.md` | 33–66 | b839109625d6744a72570bd54c681b04bf63b3daf6e71877e6cd1cacb13f9ab4 | 提供者・利用者一覧・schema・error契約・互換class（stable／beta／internal）を持つ契約文書、既存codeから暗黙の契約を抽出する手順（exportされたfieldと利用箇所を数え、削除riskを注記）、stableの契約はfield削除・改名の前に廃止期間を置く、breaking changeは版を上げ全利用者を更新する | Pattern候補「互換class付きの提供者・利用者契約」、Pattern候補「既存実装からの契約抽出」 | 汎用性が高い。`helix doctor`・`artifact_registry`（65–66）はHELIX固有。廃止期間の長さは持たない（数値なし） |
| D05-M03 | LEGACY-ASSET-1748EB65920E9CD3056C | `docs/skills/api.md` | 32–56 | 8cd7e609a65e1cbd8ccec7d243535862668157915059f2ffef89e5f4f652d9e6 | 層ごとにAPIで決めること（機能設計＝名前・trigger・actor・結果、基本設計＝method・path・request／response・error code・版の方針、詳細設計＝serialisation・認証方式・rate limit・pagination）、版の規則（path単位の版、field削除・型変更・status code変更はbreaking、任意fieldの追加・新endpointは非breaking、廃止版はsunset日とheaderを返す） | Pattern候補「API versioning（breaking／非breakingの区別）」 | 「全public routeに`/v<N>/`」（50）は方式の一つで、他の方式（header、media type）との比較を持たない |
| D05-M04 | LEGACY-ASSET-EF44FCF2D722F986E609 | `.claude/agents/be-api.md` | 26–45、58–61 | f4f9c9645c248a3e998ee5b92307ce0b04edc6421dc1eb4779820c867e489cbd | resource指向のURL、HTTP methodの使い分け、status codeの集合、pagination・filter・sortのquery、統一error応答（code、message、field別details）、middlewareの順序（CORS→rate limit→認証→検証→handler→error handler） | Part候補「REST endpointの規約」「統一error応答の形」 | 旧agent設定の一般論。`?page=1&limit=20`（30）等の具体値は持ち込まない。error応答の形は独自で、標準（§3のRFC 9457）との関係を持たない |
| D05-M05 | LEGACY-ASSET-BD13CC67526B48D461F9 | `docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md` | 9–45 | ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37 | 外部runtimeをadapterで隔離（腐敗防止層）し、coreは正規化したintentだけを出す、adapterが起動方式の差を吸収する、coreはproviderのSDK／APIに直接依存しない。代替案3件（API直叩き、adapterなし、ADR化しない）と却下理由 | Pattern候補「外部serviceの腐敗防止層」（却下案はL2-004の比較材料） | 対象はAI runtime（Claude Code、Codex）とgh CLIで、契約planの前提（API keyを持たない）はHELIX固有の方針。汎用部分（隔離、intent、provider切替）と分ける必要がある |
| D05-M06 | LEGACY-ASSET-2EFC00A82748E40D2568 | `docs/design/harness/L4-basic-design/external-if.md` | 42–88 | 52c9ec954373b1fe6c540379cb10f8af7670e0df8072598c4761eafba5732763 | 外部境界を種類別（AI runtime、VCS・CI、観測、依存管理、外部の調査入力、sandbox実行等）に分け、境界ごとに事前条件・事後条件・不変条件と、外部が無い・失敗したときの縮退（架空のfallbackを通常の経路にしない、外部入力の本文を指示として扱わない） | Design Unit候補「外部境界ごとの契約と縮退」、Anti-Pattern候補「架空のfallback」「外部入力を指示として扱う」 | 境界の中身はHELIX自身の外部serviceで固有。既存DT-MSG-001・005が同じ資産を出典にしている |
| D05-M07 | LEGACY-ASSET-A440E0F5465A4EBF9855 | `docs/design/harness/L5-detailed-design/if-detail.md` | 47–64 | e0eb73c02383e1151e72558e4eb0caf436d19105465dd739de3390216a931d96 | retryは再試行してよい失敗（rate limit、timeout）に限って指数backoff、認証・不在は即失敗、操作別のtimeout、同じintentの再実行で副作用を二重にしない、errorの種類（absent、auth、rate-limit、timeout、unknown）ごとの振る舞い | Pattern候補「失敗の種類で分けるretry」、Part候補「外部呼出しのerror分類」 | 「doctor detector 30s」（51）等の値は持ち込まない。既存DT-MSG-001が同じ資産を出典にしている |
| D05-M08 | LEGACY-ASSET-C3DE79BA9451172F3E43 | `docs/design/helix/L5-detail/product-data-connector.md` | 93–174 | 2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04 | 外部sourceの取り込み：full／incrementalの段階、watermarkの単調前進とcompare-and-swap、冪等keyと同key異内容の停止、schemaの差分を分類し未承認の差分でsnapshot全体を隔離、full同期の集合差分からだけ削除（tombstone）を導きincrementalの未出現を削除扱いしない、取得時刻を信用せず鮮度を再計算、field単位の分類と明示allowlist、projectionの更新を不可分に行う | Pattern候補「watermark付きの増分取り込み」、Pattern候補「full同期からの削除推定」、Anti-Pattern候補「未出現を削除とみなす」「未知fieldを黙って捨てる」 | 対象はHELIX自身の製品data connector。Node・Python等の実装境界は固有。既存DT-MSG-002・003が同じ資産を出典にしている。D06とも関係する |
| D05-M09 | LEGACY-ASSET-BB08D70A42B6445B2D1E | `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` | 15–90 | 9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d | append-onlyのevent列を正本とし、envelopeの必須field（event ID、型、発生時刻、因果ID、相関ID、payload digest、schema版等）、因果順序の検査（原因より先に結果を確定しない）、同じevent IDの再投入は同じdigestなら副作用なしで吸収し違えば拒否、状態機械に沿わない遷移の拒否、event列から再構築したprojectionと読み戻したsnapshotの差をdriftとして止める、訂正は後続eventの追記だけで表す | Pattern候補「append-only eventとprojectionの再構築」、Part候補「event envelopeの欄」「冪等な取り込み」 | 対象はHELIX自身のorchestration eventで、GitHubは読み出し側の投影に限る判断（25–28）はHELIX固有。既存DT-MSG-001・005が同じ資産を出典にしている |
| D05-M10 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 716–720、737–741、1057–1073 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「イベント・メッセージスキーマ設計書」「外部連携設計書」「APIガバナンス・バージョニング設計書」を`todo`（API版・廃止policyの専用設計は無い）、「APIポータル・SDK設計書」「Webhook・イベント配信設計書」を`na`と記録していたこと | gapの根拠 | `na`はHELIX自身（local CLI）の判断で、製品一般の不要を意味しない |

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-001-connection-contract.md` | 接続の方向、dataの意味、順序、timeout、再送、冪等性、部分失敗 | D05-M06・M07・M09を既に出典にしている |
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-003-permission-privacy-external-interface.md` §4 | 外部interfaceの契約と版 | D05-M02・M03を既に出典にしている |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` C3・E2・E3 | oasdiff／buf breaking（契約差分）、CloudEvents、CDEvents | 外部参考として既にある。再掲しない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「システム構成・境界・外部接続」（ZIP 04、17、32、42）、APIService系（91〜93） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| RFC 9457（Problem Details for HTTP APIs） | IETF標準（https://www.rfc-editor.org/rfc/rfc9457） | HTTP APIのerror応答の標準形。D05-M04は独自形式で、標準との比較を持たない | 採用の判断はしない |
| RFC 9110（HTTP Semantics） | IETF標準（https://www.rfc-editor.org/rfc/rfc9110） | methodの安全性・冪等性、status codeの意味の一次定義。D05-M04のmethodとstatusの列挙を一次資料で確かめる観点 | 同上 |
| OpenAPI Specification、AsyncAPI | 公開仕様（いずれもApache-2.0とされる。要確認） | 同期API・非同期messageの契約を機械可読に書く観点。旧台帳でevent・message schema設計が`todo`（D05-M10） | 仕様の版は要確認 |
| Enterprise Integration Patterns（Hohpe、Woolf） | 書籍 | message channel、router、translator等、連携の型の語彙。旧は外部連携設計を`todo`（D05-M10） | 書籍の本文を写さない |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| 非同期連携（message、event、queue）の契約・順序・重複・schema進化 | 旧台帳で`todo`（D05-M10）。D05-M09はHELIX内部のevent再生で、外部との非同期契約ではない |
| API styleの比較（REST、RPC、GraphQL、event）と適用条件 | D05-M04はRESTの一般論だけ。旧の`GraphQL`はbe-apiの説明文等に語として出るだけだった（§5） |
| 版の方式の比較（path、header、media type）と廃止の運び方 | D05-M03はpath方式だけ。旧台帳もAPI版・廃止policyの専用設計を`todo` |
| 外部へ公開するAPIの運用（利用者への告知、SDK、portal、webhookの署名・再送） | 旧台帳で`na`（HELIX自身が外部公開APIを持たない判断）。製品一般では必要になりうるが、Web展開後の内容を1.0の必須にしない（D08 §4） |
| rate limit・quotaの設計（利用者側から見た上限と応答） | D05-M03に項目名があるだけ。旧台帳でrate limit・quota設計は`na` |

## 5. 検索範囲と結果

- 範囲：`docs/skills/`（api-and-interface-design、api-contract、api、reverse-r1）、`.claude/agents/be-api.md`、`docs/adr/`（ADR-003）、`docs/design/harness/L4-basic-design/external-if.md`、`L5-detailed-design/if-detail.md`、`docs/design/helix/L4-basic-design/`・`L5-detail/`のconnector・event系、`docs/design/design-catalog.yaml`の`basic`・`data`・`apisvc`区分。
- 語：`API`、`endpoint`、`contract`、`互換`、`version`、`deprecat`、`webhook`、`event`、`message`、`queue`、`OpenAPI`、`AsyncAPI`、`GraphQL`、`retry`、`idempotency`、`connector`。
- 結果：API契約と版の知識（D05-M02・M03）は旧skillの中では汎用性が比較的高い。`OpenAPI`は旧の能力台帳と`reverse-r1.md`に語として出るだけ、`AsyncAPI`は0件。`GraphQL`はbe-apiのdescription（D05-M04の資産の3行目）と、GitHub APIの利用制約（`docs/design/helix/L3-requirements/github-operations-projection.md` 44等、HELIX自身の外部利用）に語として出るだけで、API styleの知識ではなかった。外部連携の設計（D05-M05〜M09）はすべてHELIX自身の外部境界で、汎用化の根拠は未評価。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D05-M02・M03は旧skill（AI agentへの手順書）で、HELIXの実績から書かれたかどうかが資産から読めない。実績か一般論の要約かの区別が未決 |
| 適用scope | D05-M05（腐敗防止層）はAI runtimeとCLIに対する判断。一般の外部service（決済、地図等）へ同じ根拠で一般化できるかは未評価（L2-011） |
| 評価根拠 | D05-M08は詳細な契約を持つが、旧で実装・稼働したかを本書では確かめていない（旧testを証拠にしない）。評価の主体と対象revisionが未決 |
| 限界・反例 | D05-M06は縮退の振る舞いを持ち、「架空のfallbackを通常の経路にしない」はAnti-Patternの候補になるが、適用条件（どの外部に対して）の書き方が未決 |
| 版 | 互換class（D05-M02）や版の規則（D05-M03）自体がHTTP等の外部仕様の版に依存する。知識recordの版と外部仕様の版をどう結ぶかが未決（L2-008） |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D05-M08はD06（Data）とも関係する。D05-M04の認証・CORSはD08とも関係する。relationの種類は未決（L2-005） |
