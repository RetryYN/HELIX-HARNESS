# DT-MSG-002 データ・migration・rollback（意味と所有、schema変更、移行、巻戻し、backfill）

status: scaffold（seed候補。採否なし）
authority_effect: none

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-MSG-002`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-BRAIN（汎用の構造）。製品への適用と設計義務の導出はHELIX-HARNESS-CORE（HARNESS-L2-009） |
| 適用条件 | 永続するdata（DB、file、projection、外部のstore）を追加・変更・削除する変更。schemaまたはdataの形を変える場合は§3〜§6をrequired、data構造を変えない変更は§1・§2だけ（§3〜§6は理由付きN/A） |
| 適用判定の記録 | required／conditional／N/A／unresolvedと、理由・判断者・対象revision・再評価条件（DST-HARNESS-006、DT-VT-001 §2の形） |
| 必須入力 | dataが表す意味と正本の持ち主（要求から）。消してよいdata・戻せなくてよいdataについて要求が定めていること。保持・削除の要求。変更前の形（before）。**data loss（戻せない変更）を許すかどうかは要求側・人の判断であり、設計者やAIが補わない。欠けたら上流へ戻す（DST-HARNESS-004）** |
| 関係 | DT-SDOP-002 D（移行の方式・リハーサル・停止時間・告知など、案件全体としての移行計画の値）、DT-SDOP-002 C・DT-SDOP-003（デプロイ・ロールバック方式とexpand／contractの運用側）、DT-SDOP-004 §3（dataの状態遷移）、DT-MSG-001（dataが接続を越える場合）、DT-MSG-003 §2・§3（分類・保持・削除）、DT-VT-105（L5↔L8） |
| 区分 | unit（1つのstore）またはconnection（storeと読み書きする側の間）。複数のstoreを跨ぐ移行は、加えてDT-MSG-005を使う |
| 対（V-pair） | 主にL4↔L9（dataの所有と境界）とL5↔L8（変換規則・巻戻し手順・整合の確かめ方）。検証の方法はDT-VT-104・105 |
| 計測 | 数値（件数の許容差、閾値、所要時間、停止時間）を置かない。値は要求とL3以降で導く |
| 1.0の境界 | — （HELIX自身の実行環境のbackup・restore・rollbackは現行HELIXINFRASTRUCTURE-L2-005が扱う。本templateはその要求の意味を変えない） |
| 出典 | design-template-system-requirements.md 82行（data、migration、rollback）。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 段階の名前と並びは材料であり、どの段階を省けるかは対象のriskと要求で決める。DBの種類ごとの具体的な安全な操作は実装の段で確かめる |
| 置き換え | 正式なdata・migration templateが入ったら`superseded`とし、各欄の行き先を対応づける |

### 不成立例（negative oracle）

- 列名と型だけを書き、dataが何を表すか、誰が正本を持つかを書かない。
- 変更前の形（before）を記録せず、変更後（after）だけを書く。
- 変換規則が「適宜変換」のように、項目ごとに独立して確かめられる形になっていない。
- 巻戻し（rollback）の手順と、巻き戻すと決める合図（trigger）を、移行を始める前に決めていない。
- 戻せない変更（列の削除、型の縮小、data変換）を、戻せないことと許した根拠（要求・人の判断）なしに入れる。
- 段階ごとの確かめ（件数、合計、checksum等）を書かず、次の段階へ進む条件がない。
- backfillをmigrationの中で一度に行い、途中で止まったときの再開・二重実行の扱いがない。
- 一部の行が失敗したとき、黙って飛ばす。または失敗した行を残さない。
- 削除を物理削除だけで扱い、削除の記録・関係の始末・保持の要求を確かめない。
- 「主観的に不安」なだけで巻き戻す、または巻き戻しの基準がないまま本番へ出す。

### 正例と境界の負例

- 正例：列のrename。before／after、項目ごとの変換規則、段階（新列を追加→両方へ書く→新列を読む→旧列を使う物が0件と確認→旧列を削除）、段階ごとの確かめ方、巻戻しの手順とtrigger（「L3で導く値を超えたら」と未決の行き先）が書かれ、旧列の削除だけを戻せない段として要求の根拠を持つ。
- 境界の負例：読むだけの集計viewを追加する変更。永続dataの形を変えないので§3〜§6は理由付きN/A。§1（意味と所有）は書く。

### 完了条件

§1・§2が埋まっている。schemaまたはdataの形を変える場合は§3〜§6が埋まっている、または理由付きN/Aである。戻せない段は、許した根拠（要求ID・判断記録）を持つ。巻戻しのtriggerが移行の開始前に決まっている（値が未決なら未決の行き先）。各段階の確かめ方が、§7（検証への対応）でDT-VT-105の対象caseへ引き渡されている。**完了条件を満たしても、移行が安全であること・要求を満たすことを意味しない。**

## 設計の要点

- migrationは戻せなさの最前線である。戻せる手順のないschema変更を設計しない。戻せない段は、それを許す判断を上流から受け取る。
- 追加が先、削除は最後（expand／contract）。必須にする前に任意で足し、旧を消す前に新を足す。
- 段階を一つずつ進め、段階の境目で確かめてから次へ進む。確かめられない段階は進めない。
- 巻き戻す基準は、問題が起きてからではなく、始める前に決める。
- dataが変わった巻戻しでは、appを戻す前にdataを戻し、戻した後の整合を確かめる。
- 削除は「消した」という記録として扱い、関係を黙って落とさない。

## 本体

### 1. dataの意味と所有

| 対象（entity／table／file） | 表す意味 | 正本の持ち主 | 書いてよい者 | 読む者（consumer） | 不変条件 |
|---|---|---|---|---|---|
| | | | | | |

- projection（他から作り直せる派生物）か、正本か：
- 派生物の場合、作り直しの元と、作り直したときに同じ結果になるか：

### 2. 識別と削除

- identityの決め方（表示名や取得順に依らない決め方か）：
- 削除の扱い：論理削除／tombstone（削除の記録）／物理削除。物理削除の場合は保持の要求と根拠（DT-MSG-003 §3）
- 削除したときの関係（参照）の始末：

### 3. schema変更の分類

| 変更 | 分類（追加／任意→必須／rename／型変更／削除／意味の変更） | 戻せるか | 戻せない場合の根拠（要求ID・判断記録） |
|---|---|---|---|
| | | | |

- before（現行の形）：
- after（目標の形）：
- 項目ごとの変換規則（各規則は単独で確かめられる形で）：

### 4. 移行の段階

| 段階 | 読む先 | 書く先 | 次へ進む条件（確かめ方） | 戻すときの手順 |
|---|---|---|---|---|
| 0 | 旧 | 旧 | 基準の記録 | — |
| 1 | 旧 | 両方 | | |
| 2 | 新 | 両方 | | |
| 3 | 新 | 新 | | |
| 4 | 旧を削除 | — | 旧を使う物が0件 | 戻せない段（§3の根拠） |

段階の並びは例である。省く段階は理由を書く。案件全体の移行方式（一括／段階）、リハーサル、停止時間、告知はDT-SDOP-002 Dに書く。

### 5. backfill

- 対象と件数の見込み（値はL3以降）：
- 移行と分けて行うか（大きいbackfillはmigrationの外で行う）：
- 途中で止まったときの再開点、二重に実行しても安全か：
- 失敗した行の扱い（識別子を残し、最後にまとめる。黙って飛ばさない）：

### 6. 巻戻し（rollback）

| 項目 | 記入 |
|---|---|
| 巻き戻すtrigger | 整合の確かめの失敗、変更後のerror等。値はL3以降。移行開始前に決める |
| 手順 | dataが変わった場合はdataを先に戻す |
| 戻した後の確かめ | |
| 戻せない段 | §3・§4の根拠 |

### 7. 検証への対応

| 欄 | 確かめる内容 | DT-VT-105の観点 | oracle ID |
|---|---|---|---|
| §3 変換規則 | 規則ごと | | |
| §4 段階の境目 | 件数・合計・抜き取り照合等 | | |
| §6 巻戻し | 戻した後に移行前の状態へ戻ること | | |

## 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| `LEGACY-ASSET-BF64B4AE03DD092532C2` `docs/skills/data-migration.md` 33–39・41–52・54–60・68–70・76–80（SHA-256 `740036c144d992c031ea7563b75356ade5cf7ac17b137b612c8110ea782f2398`） | before／after／transform rules（項目ごとに独立して確かめられる）／rollbackの4区分、段階移行（Phase 0〜4）と境目ごとの確かめ、件数・抜き取り・制約違反0・巻戻しの双方向の確かめ、二重実行しても安全・失敗行を黙って飛ばさない、巻き戻しのtriggerを移行前に測れる形で決める（主観で巻き戻さない） | 実装言語の指定（TypeScript／Node）、`helix doctor`・`.helix/audit/`・`harness.db`、FR-L1-44のonboardingは持ち込まない | 旧runtime・旧CLIは現行の経路ではない。実装技術はL3以降で選ぶ |
| `LEGACY-ASSET-BDEA31FD6C091F282674` `docs/skills/db.md` 48–61・63–70（SHA-256 `29ec2eab85790aa36c1b4f370b3da209b2f13983270dc3d45a2a88a8084e3f37`） | L3でentityと不変条件を言葉で書く、L4で変更の順序と戻せるかを書く、L5で破壊的変更の巻戻しを明示、additive first、破壊的migrationはdata lossが意図され許されたことの証拠を要する | `src/state-db/migrations/`の番号付けfile、`helix db rebuild`、PLAN `review_evidence`は持ち込まない | 旧の置き場所と旧PLAN形式は現行の経路ではない。「許された証拠」は現行では要求IDまたは判断記録で表す |
| `LEGACY-ASSET-18BB86CC5625C31430B8` `docs/skills/ci-deploy-and-rollback.md` 66–70・72–78・87–92（SHA-256 `fc185660f4ce7ee517453b9367eb7fc349f23824511e923ef7e9a6eef31e26e9`） | 巻戻しの基準をdeploy前に決める、dataが変わった場合はappを戻す前にdataを戻して整合を確かめる、rename等はexpand-contractで段階的に、NOT NULLの追加はbackfillが先、大きいbackfillはinlineでなくbackground | 「約15分」等の数値例、smoke testの具体、`npm run`系のgateは持ち込まない | 数値は置かない。deploy・smokeの運用はDT-SDOP-003とDT-VTの範囲 |
| `LEGACY-ASSET-959AA9A446E3F1F16B7A` `.claude/agents/db-schema.md` 15–17・47–54（SHA-256 `86b699829325d80489fdd369efd06d40907f23c5542a31ac6e29a23a9c64e41a`） | migrationは戻せなさの最前線、巻戻し手順のないschema変更を提案しない、破壊的なdata操作は上へ上げる、up＋downを作りup→down→upで確かめる | PK方式・index・seed管理等の個別の推奨は持ち込まない | 製品・DBごとの選択でありseedの普遍的な欄ではない。旧agent定義は参照のみ |
| `LEGACY-ASSET-C3DE79BA9451172F3E43` `docs/design/helix/L5-detail/product-data-connector.md` 128–140・156–173（SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`） | identityを表示名や取得順に依らず決める、tombstoneで削除を記録し関係をsilent dropしない、incrementalの未出現を削除と扱わない、複数の更新を一つのtransactionで行いwatermarkを先に進めない | `HIL_*` failure token、Node／Pythonの分担、`harness.db`は持ち込まない | 判定の考え方だけを汎用の欄にする |
| `LEGACY-ASSET-95E14F385D8C1F71C209` `docs/skills/deprecation-cutover.md` 33–41（SHA-256 `cc83066540bb93976343e4d4044b943c77fd1572e9dfe51473b3f223ff6dc089`） | 置き換え先が動いてから旧を消す、参照0件を削除の条件にする、置き換え先が壊れていたときの巻戻し経路を先に決める | `HELIX_*`命名、`helix doctor asset-drift`は持ち込まない | 旧CLIと旧命名規則は現行の経路ではない |

旧HELIXの物は「migration」「DB」「deploy」に分かれており、dataの意味と所有（§1）と削除（§2）を移行と同じtemplateで扱う形は見つからなかった（検索範囲は`materials/legacy-source-inventory.md` §2）。§1・§2を同じtemplateに置く束ね方は新規案である。

### 参考資料（PO提供の参照用ZIP。旧HELIXの資産ではない）

| 参照 | 使った点 | 使わない点 |
|---|---|---|
| `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`（SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`）内 `hybrid-docgen/templates/13_移行設計・計画書.yaml` 11–18（entry SHA-256 `e8f3b1f7cd8f575635d5b81e804705a0100b8d3dc18c140747263275fa48aa3b`） | 切戻し（rollback）を独立の章に置く構成 | 方針・日程・リハーサル・カットオーバー手順・チェックリストの章は案件全体の移行計画であり、DT-SDOP-002 Dの範囲として本templateに重ねない。旧HELIXも`docs/design/design-catalog.yaml` 528–535で移行設計・計画書の充足先を`data-migration.md`・`deprecation-cutover.md`としていた。ZIP内のtoolは実行しない |
