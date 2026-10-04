# D03 Backend：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「server側の処理の中身：入力の検証、業務規則の実行、transaction、errorの分類と伝え方、途中停止からの回復、副作用の扱い、batch」を扱うと仮に読む。外へ見せる契約（endpoint、互換）はD05、永続化の構造はD06に置いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D03-M01 | LEGACY-ASSET-D492D527A60A660722FF | `.claude/agents/be-logic.md` | 41–53 | b1d9a75378b40fd6d7fea643654f1a9a8d04471824e08c27c07c3ead86f834a9 | transaction境界をService層に置く、Unit of Work、楽観lock（版番号）と悲観lock（SELECT FOR UPDATE）、errorの伝搬（Domain Error→Application Error→応答への変換）、errorの分類（domain：NotFound／Conflict／Validation、infra：Database／ExternalService） | Pattern候補「transaction境界の置き場」、Design Unit候補「lockの方式の比較（楽観／悲観）」、Part候補「errorの分類と層ごとの変換」 | 旧AI agentへの短い指示文。楽観／悲観の使い分けの条件（競合頻度等）を持たない。D02-M01と同じ資産の別の行 |
| D03-M02 | LEGACY-ASSET-EF44FCF2D722F986E609 | `.claude/agents/be-api.md` | 47–50、63–73 | f4f9c9645c248a3e998ee5b92307ce0b04edc6421dc1eb4779820c867e489cbd | 入力検証を3段に分ける（入力層：型・必須、業務層：重複・権限、DB層：UNIQUE・FK・CHECK制約）、log・監視の点（request／responseのlogでPIIをmask、error率・latency、遅いquery）、errorの応答に内部情報（stack trace、DB error、file path）を出さない | Pattern候補「多層の入力検証」、Anti-Pattern候補「内部情報を含むerror応答」 | 汎用だが旧agent設定の列挙。endpointの形（26–45）はD05、認証（52–56）はD08で扱う |
| D03-M03 | LEGACY-ASSET-7873E44594456A8F925A | `docs/design/harness/L5-detailed-design/internal-processing.md` | 58–106 | 048755e3729a7deaaedc8259f3334859d408f0d99487e7459f9d1ed93b4e8072 | 操作ごとの事前条件・事後条件（失敗時に状態を変えない原子性、read-only操作は状態不変）・操作を跨ぐ不変条件の表、失敗の統一形式（理由、根拠、利用者が次に取る行動、終了code） | Design Unit候補「操作契約（事前・事後・不変）」、Part候補「失敗の応答の欄（理由と次の行動）」 | 表の行（`plan draft`、`gate`等）はHELIX自身のCLI操作で固有。既存DT-MSG-004（単体の振る舞い）が同じ資産を出典にしている。本書は知識recordの観点で参照するだけ |
| D03-M04 | LEGACY-ASSET-656F75AF81EE933415D9 | `docs/design/harness/L5-detailed-design/durability-boundaries.md` | 11–75 | b6c4c6f58259b6c09f6cd52a64ab1fb7b04114a41d2b1089fdc5b9730f8666d5 | 例外由来のsecret・PII・pathを漏らさない診断（原文ではなく有限の分類とdigestを返す）、同一directoryのtemp→fsync→renameによる原子的な書込み、排他claimでwriterを直列化、crash時の状態をmissing／corrupt／uncommitted／committed／ambiguousに分類しcorruptをmissing扱いしない、外部副作用は「意図」を永続化した後にだけ開始し、結果の証明が無い曖昧な状態は自動retryしない | Pattern候補「意図を先に記録する副作用」、Pattern候補「crash後の状態分類と曖昧状態の停止」、Part候補「原子的なfile publish」 | 単一machineのfile stateを前提にした設計でHELIX固有の部分が多い（plan、epoch、doctor）。分散環境・DBのtransactionへそのまま一般化できるかは未評価。既存DT-MSG-004が回復の欄で同じ資産を使っている |
| D03-M07 | LEGACY-ASSET-944C5027F71733A26597 | `docs/design/helix/L6-function-design/github-execution-episode-state.md` | 20–34 | 330d022abac6401f5baea62b7d497d5093b9e224b47f98df4852a9fc14c84e91 | event・transactional outbox・現在のprojectionを1つのDB transactionでcommitする、preimageのrevisionと冪等keyが一致する遷移だけ受理する、同じkeyで同じpayloadの再送は既存の結果を返し違うpayloadはconflictにする、eventの列からprojectionを再構築して保存済みprojectionとのdigest差を拒否する | Pattern候補「transactional outbox」の適用例、Part候補「冪等keyとpayloadの照合」「eventからのprojection再構築の照合」 | 適用対象はHELIX自身のGitHub作業episodeで固有。汎用patternとHELIXでの適用例を分けて記録する必要がある（L2-011）。outboxの送達側（relay、再送、順序）の設計はこの資産に無い |
| D03-M05 | LEGACY-ASSET-F917D3633DEB1097048E | `docs/skills/code-minimalism.md` | 84–101 | d4dd7517112f27462e5d081d787e5da3271b610b88f5b6a7fc5d15624f9e7a3c | codeに直書きしない値の見分け方（環境で変わる、秘密、業務が決めた数字、人が読む文字列、特定利用者の匂い、時刻・locale前提）と、直せないときに負債として記録する作法 | Anti-Pattern候補「業務値・環境値・時刻前提のhardcode」 | 例示の作法（debt-register）はHELIXの運用。見分け方の6観点は汎用候補 |
| D03-M06 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 551–555、615–619、790–794 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「バッチ設計書」「ロジック設計書」「停止・再開・実行記録設計」を`todo`と記録していたこと（ロジック設計は「汎用ロジック設計skillは無い」） | gapの根拠 | 旧の自己評価 |

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-004-logic-design.md` | decision table、状態×イベント、異常系、冪等性・排他 | 業務規則と冪等性の設計の欄は既にある |
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-004-unit-behavior.md` | 入出力の契約、副作用、失敗の分類、回復 | D03-M03・M04を既に出典にしている |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-001-logging.md` | log、相関ID、masking | D03-M02のlogの点と重なる |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「機能・画面・API・入出力」（ZIP 23 io、24 logic） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| Transactional Outbox、Saga | 広く知られた設計pattern名（複数の書籍・公開文書） | 旧にはoutboxの適用例（D03-M07）があるが、patternとしての成立条件・送達側・代替（Saga、補償）との比較が無い。L2-004の比較例（Compensating Transaction）とも対応する | 特定の出典に依存しない名前として扱う。実装の採用ではない |
| The Twelve-Factor App | 公開文書（https://12factor.net/） | 設定を環境から渡す、processを使い捨てにできる等の観点。D03-M05のhardcodeの観点を実行形態側から補う | 文書の利用条件は要確認。前提がPaaS寄りで、全対象には当てはまらない |
| Idempotency-Key HTTP header | IETFのInternet-Draft | 再送されるrequestの重複処理を防ぐ鍵の扱い | 2026-10時点の状態（RFC化の有無）は要確認。D05とも関係する |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| batch・background jobの設計（分割、再実行、途中再開、重複排除、締め時刻） | 旧台帳でバッチ設計書・停止再開設計が`todo`（D03-M06） |
| 分散した副作用の一貫性をpatternとして比べる知識（outbox、saga、補償の適用条件と失敗の仕方） | D03-M04は単一machineのfile、D03-M07はHELIX自身へのoutbox適用例だけ。`saga`は旧の要求候補に語として出る（§5）が、補償の設計知識は無い |
| 並行実行の制御（同時更新、lockの粒度、deadlock、楽観lockの失敗時の振る舞い） | D03-M01は方式名の列挙だけで、使い分けの条件と失敗の扱いを持たない |
| 時間に依存する処理（timezone、締め、期限、clockのずれ） | D03-M05が直書きの危険を言うだけで、設計の知識は無い |
| 性能の観点（N+1、無制限取得、cache）のbackend側の扱い | 旧D06のdb-schemaに一部（N+1、connection pool）があるのみ。旧台帳は性能設計書を`todo`（D01-M12） |

## 5. 検索範囲と結果

- 範囲：`.claude/agents/`（be-logic、be-api、db-schema）、`docs/skills/`（debugging-and-error-recovery、error-fix、code-minimalism、incremental-implementation）、`docs/design/harness/L5-detailed-design/`、`docs/design/harness/L6-function-design/`の見出し、`docs/design/design-catalog.yaml`の`detail`区分。
- 語：`transaction`、`lock`、`retry`、`冪等`、`idempotency`、`batch`、`バッチ`、`saga`、`outbox`、`queue`、`error`。
- 結果：backendの一般知識は旧agent設定2件（be-logic、be-api）に短くあるだけで少ない。`outbox`はHELIX自身のGitHub作業episodeの設計（D03-M07、`docs/design/helix/L3-requirements/github-merge-admission-requirements.md` 96–110も同じ対象）に適用例としてあった。`saga`は`docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md` 63（UTH-FR-032）に「単一transaction saga」という語で出るだけで、補償の設計知識ではなかった。`docs/skills/debugging-and-error-recovery.md`・`error-fix.md`はHELIXの不具合対応の手順で、backend設計の知識ではないため素材にしなかった。`docs/design/harness/L6-function-design/`の大半（closure、handover、plan等）はHELIX自身の機能設計で素材にしなかった。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D03-M01・M02は旧AI agentへの指示文、D03-M03・M04は旧の詳細設計。同じ領域の素材でも由来の種類が違い、記録の仕方が未決 |
| 適用scope | D03-M04の回復の分類は単一machine・file前提。DB・分散環境への適用可否を書けるだけの根拠が無い |
| 評価根拠 | D03-M04は旧で実装されたかどうかが本書では確かめられない（旧testを証拠にしない）。評価の主体と対象revisionが未決 |
| 限界・反例 | D03-M01の楽観／悲観lockは、どの条件でどちらが失敗するかを持たない。L2-003のfailure mode・negative caseの補い方が未決 |
| 版 | 旧資産は一時点の記述で、後続で上書きされた可能性がある（例：D03-M03の操作表はPLAN-L5-06・07で追補）。どの版を素材にしたかを記録する単位が未決 |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D03-M02の入力検証はD05（API）・D08（Security）とも関係する。relationの種類（affects、depends_on等、L2-005）は未決 |
