# D06 Data / Database：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「dataの意味と持ち主、entityの分類と不変条件、table・index・制約、schemaの変更と移行・巻戻し、派生data（projection、読みmodel）」を扱うと仮に読む。DB serverの配置・冗長・backupの基盤はD07（INFRA候補のDatabase Infrastructure、Backup／Restore）に置いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D06-M01 | LEGACY-ASSET-959AA9A446E3F1F16B7A | `.claude/agents/db-schema.md` | 27–65 | 86b699829325d80489fdd369efd06d40907f23c5542a31ac6e29a23a9c64e41a | table設計の原則（主key、作成・更新時刻、論理削除、第3正規形を基本に性能要件で非正規化を判断）、FKと削除時の動作（RESTRICT／CASCADE／SET NULL）、indexの種類と用途の表、migrationの手順（up・downを作り、往復を確かめ、staging、整合性確認、本番）、性能（実行計画、N+1、connection pool）、seedの種類 | Design Unit候補「table設計の原則」、Part候補「FKの削除時動作の選び方」「indexの種類と用途」 | 旧agent設定の一般論で、PostgreSQLを想定した語（GIN／GiST、VACUUM）を含む。「UUID推奨」（28）の根拠は「分散対応」の一語で、trade-off（大きさ、順序性）を持たない。既存DT-MSG-002が同じ資産を出典にしている |
| D06-M02 | LEGACY-ASSET-BDEA31FD6C091F282674 | `docs/skills/db.md` | 48–72 | 29ec2eab85790aa36c1b4f370b3da209b2f13983270dc3d45a2a88a8084e3f37 | 層ごとにDBで決めること（entityと不変条件を平文で、ER図と列・型・PK／FK・null可否、migrationの順序付きDDLと可逆性、indexとquery access pattern、破壊的migrationの巻戻し）、testで覆う物（正常の挿入・更新、制約違反、migration段の冪等性）、migrationは追加を先に（nullableで足してから必須に、新tableを足してから旧を消す） | Pattern候補「追加先行のschema変更」、Design Unit候補「schema変更で決めること」 | `harness.db`の運用（36–46）はHELIX固有。numbered migration fileの形式（65–66）はHELIXの実装規約 |
| D06-M03 | LEGACY-ASSET-BF64B4AE03DD092532C2 | `docs/skills/data-migration.md` | 33–80 | 740036c144d992c031ea7563b75356ade5cf7ac17b137b612c8110ea782f2398 | 移行設計の4節（before、after、field単位で独立にtestできる変換規則、巻戻しの手順とそのtrigger）、strangler figの段階（旧読み旧書き→両方書き→新読み両方書き→新だけ→旧を消す）と段ごとの検証（件数、checksum、結合test）、整合性の確認項目、冪等な移行、行単位の失敗を記録して継続、主観でなく測れるtriggerで巻き戻す | Pattern候補「段階的なdata移行（strangler fig）」、Part候補「移行の整合性検証」 | 高い汎用性。TypeScriptで書く規則（67）・onboarding（82–86）はHELIX固有。既存DT-MSG-002が同じ資産を出典にしている |
| D06-M04 | LEGACY-ASSET-18BB86CC5625C31430B8 | `docs/skills/ci-deploy-and-rollback.md` | 87–92 | fc185660f4ce7ee517453b9367eb7fc349f23824511e923ef7e9a6eef31e26e9 | 1回のdeployで安全なschema変更（nullable・default付きの列追加、並行index作成、新table）、複数deployに分ける変更（列の改名＝追加→両方書き→新読み→旧削除、NOT NULL追加はbackfill先行、大きなbackfillは背景job）、1回でしてはいけない変更（staging無しの型変更、lockを取るtable再構築） | Pattern候補「expand／contractによるschema変更」、Anti-Pattern候補「lockを取る再構築を1回のdeployで行う」 | 既存DT-MSG-002・DT-SDOP-003が同じ考え（expand／contract）を持つ |
| D06-M05 | LEGACY-ASSET-A4DD57E39031B1402494 | `docs/design/harness/L4-basic-design/data.md` | 19–44、79–93、102–115 | b94e3ec801d6275af18976abdd88eaff44da23494ce654dbde9c3fa2ebaae1c6 | entityの分類（集約root、子entity、値object、読みmodel、command）の棚卸し表、IDを値objectとして扱い採番は集約rootの起票時に確定、不変条件を集約ごとに書き機械検査の手段を対にする表 | Design Unit候補「entity分類の棚卸し」、Part候補「不変条件と検査手段の対」 | 中身はHELIX自身のdomain（PLAN、FR、gate等）で固有。表の形だけが汎用候補。D02-M04（集約境界、整合性規則）と同じ資産の別の行 |
| D06-M06 | LEGACY-ASSET-8771887517A619A2D501 | `docs/adr/ADR-007-harness-db-sqlite-projection.md` | 18–39 | 50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf | DBを「正本ではなく再構築できる投影」として使う決定、secret・PII・raw transcriptを保存せずID・理由・要約だけを持つ、投影と入力の不一致は記録して黙って直さない、重いORMを入れない理由、決定を新しいADR無しに書き換えたことを決定史の消失として扱った経緯 | Pattern候補「再構築できるprojection DB」、Anti-Pattern候補「投影の不一致の黙った修復」「採択済み決定のin-place反転」 | HELIX自身のstate DBの判断で固有。SQLite・Bunの選択は素材にしない |
| D06-M07 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 602–608、654–660、716–720、1208–1218 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「データベース設計書」を`done`（実体は`docs/skills/db.md`）、「用語集・データディクショナリ」を`done`、「イベント・メッセージスキーマ設計書」「JSON型・スキーマ設計書」「永続化マッピング設計書」を`todo`と記録していたこと | gapの根拠 | 旧の自己評価 |

外部dataの取り込み（watermark、tombstone、schema driftの隔離、鮮度、field分類）は`docs/design/helix/L5-detail/product-data-connector.md`にあり、D05-M08として記録した。本書ではrelationで結ぶ候補として参照するだけにした。

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-002-data-migration-rollback.md` | dataの意味と所有、識別と削除、schema変更の分類、移行の段階、backfill、巻戻し | D06-M01〜M04を既に出典にしている。本書は知識recordの観点で参照するだけ |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-002-nonfunctional.md` D | 移行性 | 案件全体の移行計画の欄 |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-003-maintainability-runbook.md` | deployとrollbackの運用、expand／contract | D06-M04と重なる |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「データ・永続化・イベント」（ZIP 03、05、17、22、39） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| Designing Data-Intensive Applications（Kleppmann） | 書籍 | 複製、分割、transactionの分離level、整合性modelの比較。旧はD06-M01の一般論と単一machineの投影（D06-M06）だけで、分散dataの知識が無い。L2-004の比較例（Strong／Eventual Consistency）とも対応する | 書籍の本文を写さない |
| ISO/IEC 25012（data品質model） | 国際規格 | dataの品質特性（正確性、完全性、一貫性、最新性等）。旧はdataの品質を特性として分けていない | 規格本文は有償。版は要確認 |
| Refactoring Databases（Ambler、Sadalage） | 書籍 | schema変更の型の語彙。D06-M04のexpand／contractの出典側の観点 | 既存DT-MSG-002もexpand／contractを参照している。重ねて採らない |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| 分散したdataの整合性（複製の遅れ、分割、分離level、結果整合の扱い） | 旧は単一machine（SQLite、file）を前提にしている。D02-M04に即時／結果整合の区別があるだけ |
| 保存方式の比較（関係DB、document、key-value、時系列、検索index等）と適用条件 | 旧に比較の記述は見つからなかった（§5） |
| dataのlifecycle（保持期間、archive、purge、法令による保持） | D05-M08にretentionの受領記録があるだけ。旧台帳はプライバシー設計を`todo`（D08で扱う） |
| event・message・JSONのschema設計と版の進化 | 旧台帳で`todo`（D06-M07） |
| data modelと永続化の写像（ORMの使い方、集約とtableの対応） | 旧台帳で永続化マッピング設計が`todo`（D06-M07）。ADR-007は重いORMを入れない判断だけ |
| query性能の設計（access patternからindexを導く、N+1の回避）の詳しい知識 | D06-M01に項目名がある程度。旧台帳は性能設計書を`todo`（D01-M12） |

## 5. 検索範囲と結果

- 範囲：`.claude/agents/db-schema.md`、`docs/skills/`（db、data-migration、ci-deploy-and-rollback、harness-observability）、`docs/adr/`（ADR-001、ADR-007）、`docs/design/harness/L4-basic-design/data.md`、`L5-detailed-design/physical-data.md`の見出し、`docs/design/helix/L5-detail/product-data-connector.md`、`docs/design/design-catalog.yaml`の`data`区分。
- 語：`schema`、`migration`、`index`、`正規化`、`FK`、`transaction`、`replica`、`sharding`、`backup`、`projection`、`CQRS`、`retention`。
- 結果：schema変更と移行の知識（D06-M02〜M04）は旧skillの中で比較的まとまっている。`sharding`・`read replica`は0件。`backup`・`restore`は多数出るが、大半はHELIX自身のstate・release・incidentの文脈で、DBの設計知識ではなかった（D07で扱う）。`physical-data.md`はHELIX自身のJSON stateの物理schemaで、素材にしなかった。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D06-M01（agent設定）、D06-M02〜M04（skill）、D06-M05・M06（HELIX自身の設計判断）で由来の種類が違う。記録の仕方が未決 |
| 適用scope | D06-M01の原則は関係DB（主にPostgreSQL）前提。他の保存方式へ当てはまるかを書く根拠が無い。適用scopeに保存方式・規模を持たせるかが未決 |
| 評価根拠 | D06-M03のstrangler figの段階は、旧で実データの移行に使われたかを本書では確かめていない。評価の主体と対象が未決 |
| 限界・反例 | D06-M01の「UUID推奨」「3NFを基本」は条件付きの推奨で、反対側の条件（順序性が要る、集計が主）を持たない。L2-003のnegative caseをどこから補うかが未決 |
| 版 | D06-M04とDT-MSG-002・DT-SDOP-003は同じ考えを別の文書で持つ。同じ知識を複数の素材から指すときのidentity（L2-008）の付け方が未決 |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D06-M05はD02と、D06-M06はD07（観測の基盤）と、D05-M08は本領域と関係する。relationの種類は未決（L2-005） |
