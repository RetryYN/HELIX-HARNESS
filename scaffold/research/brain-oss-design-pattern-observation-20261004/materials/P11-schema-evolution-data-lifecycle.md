# P11 schemaの版の進化とdataのlifecycleの観察（D06 Data / Database）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| xataio/pgroll | https://github.com/xataio/pgroll | 777a5350e09012b29d26b9611122046d8a96fc1c | Apache-2.0 | false | 2026-10-04 | expand/contractを、版ごとのview schemaと双方向triggerで実装している一次資料 |
| github/gh-ost | https://github.com/github/gh-ost | f7a42f6b8028e96d3c8abd47a4da38baedb1161d | MIT | false | 2026-10-04 | online migrationをghost tableとbinlogで行い、cut-overとrevertの設計文書がある |
| apache/avro | https://github.com/apache/avro | 28cb08c15543c8c2dd8d186db2029bfe760940a5 | Apache-2.0 | false | 2026-10-04 | writer schemaとreader schemaの解決規則（互換性の規則）の仕様と実装 |
| Apicurio/apicurio-registry | https://github.com/Apicurio/apicurio-registry | 2ec70f01c3229108f7d6bab2bb742796bbc83ca3 | Apache-2.0 | false | 2026-10-04 | 互換性levelの定義、規則の階層、版の状態遷移（deprecation／sunset） |
| ariga/atlas | https://github.com/ariga/atlas | 1317a57674f3795de395f535a258c088d7f767bf | Apache-2.0 | false | 2026-10-04 | migration directoryの完全性sum、部分適用の記録、破壊的変更・後方非互換変更の静的検査 |

（flyway/flyway〔a549f5dd1ac80fbe7bc8103dfcd2d556c606c39c、Apache-2.0〕とliquibaseは、メタデータだけ取得し、本文は読んでいない。）

## 観察

### P11-O01 2段階の版移行（start＝追加だけ／complete＝削除）と、版ごとのview schema
- 出典：pgroll、`docs/concepts.md` 行5–25（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/docs/concepts.md#L5-L25）、`pkg/roll/execute.go` 行33–255（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/roll/execute.go#L33-L255）、`ensureView` 行319–366（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/roll/execute.go#L319-L366）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：`Roll.Start` は `Validate` → `StartDDLOperations` → `performBackfills` の順に進む。`StartDDLOperations` は、状態storeに「進行中のmigration」を1件作る（`state.Start`）。各 `Operation.Start` が返す `DBAction` 群を `Coordinator` で実行し、`BackfillTask` を `backfill.Job` に集める。最後に `<schema>_<version>` という名前のPostgres schemaを作り、表ごとにviewを作る（`ensureViews`）。viewでは、論理列名から物理列名へ別名を付け、列のdefaultも付け直している。`Complete` は、前の版のview schemaを `DROP SCHEMA ... CASCADE` し、各opの `Complete` actionを実行して、状態を完了にする。`Rollback` は新しい版のview schemaを消し、opを逆順に `Rollback` する。
- 解いている問題と前提：旧版と新版のclientを同時に動かしたまま、破壊的なschema変更を行う。concepts.mdは、start段階では追加的な変更だけを行い、complete段階で非追加的な変更（drop）を行うと書いている（行11–15）。clientは、接続ごとの`search_path`でどの版を見るかを選ぶ前提である。
- 必要な入力：migrationの名前（版schemaの名前になる）、op列、版ごとに接続先を切り替えるclient側の仕組み、completeを実行してよい時点の判断（全clientが新版へ移ったこと）。
- trade-off・失敗の仕方：opの実行に失敗すると、自動で `Rollback` を呼び、二つの失敗を `errors.Join` で返す（行113–121）。PG14以前では、viewに `security_invoker` を付けられない分岐がある（行332–340）。completeの時点を決める判断は、tool内にない。
- 反例・適用しない場合：gh-ost（P11-O03）は版を並べず、表を1回で差し替える。Atlas（P11-O08）は版を並べず、ファイルを順番に適用する。
- 互換・非互換：P11-O02（双方向backfill）を前提とする。P11-O10（soft delete）と組み合わせて使われる。P11-O03とは、同時に2版を生かすかどうかで対立する。
- 限界：Postgresのschema、view、search_pathに依存した成立である。HELIXでは未評価の候補素材にすぎない。

### P11-O02 版の向きを判定するtriggerと、batch単位のbackfill（双方向の同期）
- 出典：pgroll、`pkg/backfill/templates/function.go` 行5–31（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/backfill/templates/function.go#L5-L31）、`pkg/backfill/backfill.go` 行145–195（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/backfill/backfill.go#L145-L195）、`pkg/migrations/types.go` 行225–256（`Up`／`Down`のSQL式）。issue #583（https://github.com/xataio/pgroll/issues/583）、#646（https://github.com/xataio/pgroll/issues/646）。信頼性ラベル：primary。本文確認：済
- 何をしているか：opは、列を複製したうえで、利用者が書く `up`（旧→新）と `down`（新→旧）のSQL式を受け取る。trigger関数は、書込みsessionの `search_path` が最新の版schemaかどうかで向きを判定する。`up` の向きでは新列へ、`down` の向きでは旧列へ値を入れる。同時に、`needs_backfill` 列をfalseにする。既存行には `Backfill.Start` が、主キー（主キーがなければ `needs_backfill` 列）の順にbatchで「自分自身へのUPDATE」をかけ、triggerを発火させる。triggerはbackfillより先に作る（`performBackfills` 内の `CreateTriggers`）。
- 解いている問題と前提：新旧の列が共存する期間に、どちらの版から書かれても両方の列を整合させる。表に主キーがあるか、補助列で進捗を追えることが前提である。
- 必要な入力：変換式 `up`／`down`（両方向で値を写せる変換であること）、batchの大きさと間隔（値は持ち込まない）、backfillの対象表。
- trade-off・失敗の仕方：#583は、INSERTの多い表でbackfillが終わらない事例を報告している。triggerが新しい行を処理済みにしているのに、backfillが追いかけ続けるという内容である。#646は、同じ表へのbackfillが複数のopで重複する問題である。backfillに失敗するとrollbackへ戻る（`execute.go` 行368–389）。
- 反例・適用しない場合：gh-ostはtriggerを明示的に使わない（P11-O03）。triggerが書込みと同じtransactionに乗り、負荷が増すことを避けるためである。
- 互換・非互換：P11-O01に必須である。P11-O03とは、同期の経路（trigger／binlog）で対立する。
- 限界：変換式が可逆でない変更では成立しない。batchの値、間隔、閾値は持ち込まない。

### P11-O03 triggerを使わない非同期の複製（binlogを変更履歴として読むghost table）
- 出典：gh-ost、`doc/triggerless-design.md` 行5–32と行93–144（https://github.com/github/gh-ost/blob/f7a42f6b8028e96d3c8abd47a4da38baedb1161d/doc/triggerless-design.md#L5-L144）。信頼性ラベル：primary。本文確認：済
- 何をしているか：ghost tableを作って `ALTER` をかけ、原表と共有する列と一意keyを選ぶ。原表をchunk単位でcopyし、gh-ost自身がreplicaとしてbinlogを受信して、原表へのDMLをghost tableへ適用する。この二つのtaskを単一の接続で交互に流す（行54–65、101–109）。changelog表には、heartbeatと状態のhintを書く。
- 解いている問題と前提：triggerを使う方式（同期型、またはchangelog表を使う非同期型）では、書込みのたびに追加の書込みが同じtransactionで発生する。gh-ostは、この負荷とlock競合を切り離す。前提は、MySQLのrow形式のbinlog、replicaの利用、移行中にthrottleで止められることである（行111–117）。replicaで移行し、cut-over後に元へ戻してchecksumを比べる「試験移行」もできる（行118–124）。
- 必要な入力：binlogの形式と保持、原表と新表に共有の一意key、throttleの条件（値は持ち込まない）。
- trade-off・失敗の仕方：文書自体が「No free meals」として、表の全量が通信路を流れること、toolのコードが非同期・並行で複雑になることを挙げている（行134–144）。
- 反例・適用しない場合：pgrollは、同じ問題（移行中の書込みの追従）をtriggerで解き、旧版と新版を同時に提供する（P11-O02）。gh-ostは1版だけを持ち、最後に差し替える。
- 互換・非互換：P11-O04（cut-over）とP11-O10（revert・旧表の扱い）と一体で使われる。P11-O01・O02とは対立する案である。
- 限界：MySQLのreplication protocolに固有である。

### P11-O04 sentry表と2接続で行う原子的なcut-over（失敗すると切替前に戻る）
- 出典：gh-ost、`doc/cut-over.md` 行1–21（https://github.com/github/gh-ost/blob/f7a42f6b8028e96d3c8abd47a4da38baedb1161d/doc/cut-over.md#L1-L21）、`go/logic/migrator.go` の `cutOver` 行875–965、`waitForEventsUpToLock` 行967–1007、`atomicCutOver` 行1055–1162（https://github.com/github/gh-ost/blob/f7a42f6b8028e96d3c8abd47a4da38baedb1161d/go/logic/migrator.go#L875-L1162）。two-step方式の説明は `doc/triggerless-design.md` 行81–87（https://github.com/github/gh-ost/blob/f7a42f6b8028e96d3c8abd47a4da38baedb1161d/doc/triggerless-design.md#L81-L87）。設計の議論はissue #82（https://github.com/github/gh-ost/issues/82、closed）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`cutOver` は、まずthrottleし、postpone flag fileがある間は待つ。heartbeatの遅れが大きい間も待つ。次にghost tableをANALYZEし、atomic方式とtwo-step方式を切り替える。`atomicCutOver` では、接続Aがsentry表（`_del`名）を作り、原表と一緒にlockする（`AtomicCutOverMagicLock`）。続いて `waitForEventsUpToLock` が、changelogへ書いたchallenge値をbinlogから読み戻すまで待ち、backlogを消化する。接続Bは `RENAME` を発行してblockされる。`RENAME` がPROCESSLISTに現れたことを確かめてから、Aはsentry表を消し、unlockする。
- 解いている問題と前提：MySQLでは、lockを持つ接続自身は表を入れ替えられない。two-step方式では、表が存在しない瞬間がある。issue #82は、どの接続がどの時点で死んでも、lockが解けて `RENAME` が失敗し、元の状態に戻ることを列挙している。成否はghost tableが残っているかどうかで判定する。
- 必要な入力：cut-overのlock待ちの上限（値は持ち込まない）、postponeの制御（flag file、対話command）、two-step方式を許すかどうか。
- trade-off・失敗の仕方：cut-overは、retryすることを前提にしている（コメント行955–957付近）。ANALYZEの失敗はretryさせず致命とする、というコメントがある（行923–930）。two-step方式は「table outage」を伴うと明記されている（`doc/triggerless-design.md` 行81–87）。
- 反例・適用しない場合：pgrollのcompleteは、表の差替えではなく、旧版のviewの削除と列の改名で済ませる（P11-O01）。
- 互換・非互換：P11-O03の終端である。P11-O10（revert）の起点になる。
- 限界：MySQLのlockの優先規則（blockされたRENAMEがDMLより優先される）に依存している。timeoutの値は持ち込まない。

### P11-O05 writer schemaとreader schemaの解決規則（互換性の判定を規則として定義）
- 出典：avro、`doc/content/en/docs/++version++/Specification/_index.md` 行285–288と行681–725（https://github.com/apache/avro/blob/28cb08c15543c8c2dd8d186db2029bfe760940a5/doc/content/en/docs/%2B%2Bversion%2B%2B/Specification/_index.md#L681-L725）、alias 行263–277、Parsing Canonical Formとfingerprint 行727–746。実装は `lang/java/avro/src/main/java/org/apache/avro/SchemaCompatibility.java` 行52–60、190–250、393–446、497–499（https://github.com/apache/avro/blob/28cb08c15543c8c2dd8d186db2029bfe760940a5/lang/java/avro/src/main/java/org/apache/avro/SchemaCompatibility.java#L393-L446）。信頼性ラベル：primary。本文確認：済
- 何をしているか：仕様は、dataにwriter schemaを必ず添えることを求めている。そのうえで、reader schemaとの差を規則で解決する。主な規則は次のとおり。fieldは名前で照合する。writerにだけあるfieldは無視する。readerにだけあるfieldは、defaultがあれば使い、なければerrorにする。enumは、未知の記号をreaderのdefaultで受ける。型には昇格表がある。名前の変更はaliasで吸収する。Java実装の `checkReaderWriterCompatibility(reader, writer)` は、`ReaderWriterCompatibilityChecker` で再帰的に判定する。判定結果はmemo化し、再帰型の循環は「反証されるまで互換」とみなして打ち切る（行236–241）。非互換は `SchemaIncompatibilityType`（NAME_MISMATCH、FIXED_SIZE_MISMATCH、MISSING_ENUM_SYMBOLS、READER_FIELD_MISSING_DEFAULT_VALUE、TYPE_MISMATCH、MISSING_UNION_BRANCH）で分類し、schema内の位置をJSON pointerの形で返す。
- 解いている問題と前提：書いた時点と読む時点でsoftwareの版が違っても、保存済みのdataを読めるようにする。writer schemaが常に手に入る前提である（file headerの `avro.schema`、RPCでの交換）。
- 必要な入力：writer schemaの保存方法（dataに同梱するか、fingerprintで参照するか）、各fieldのdefault、enumのdefault、aliasの方針。
- trade-off・失敗の仕方：defaultのない追加fieldは、旧dataを読めなくする（READER_FIELD_MISSING_DEFAULT_VALUE）。canonical formは `doc` と `aliases` を落とす（行739）。このため、fingerprintが同じでもaliasによる解決が違うことがありうる、と読める（推論。issueでの確認はしていない）。
- 反例・適用しない場合：pgroll・gh-ost・Atlasは、保存済みの物理dataを書き換えて新しいschemaへ揃える。Avroは、dataを書き換えずに読む側で解決する。
- 互換・非互換：P11-O06（Apicurioの互換性level）が、この判定関数を「どの版の対に、どちらの向きで適用するか」で包んでいる。
- 限界：直列化の形式に固有である。RDBMSのschema移行にそのまま対応するものではない。

### P11-O06 互換性level（向き×推移性）と規則の階層（global／group／artifact）
- 出典：Apicurio、`schema-util/common/src/main/java/io/apicurio/registry/rules/compatibility/CompatibilityLevel.java` 行8–45（https://github.com/Apicurio/apicurio-registry/blob/2ec70f01c3229108f7d6bab2bb742796bbc83ca3/schema-util/common/src/main/java/io/apicurio/registry/rules/compatibility/CompatibilityLevel.java#L8-L45）、`AbstractCompatibilityChecker.java` 行16–110（https://github.com/Apicurio/apicurio-registry/blob/2ec70f01c3229108f7d6bab2bb742796bbc83ca3/schema-util/common/src/main/java/io/apicurio/registry/rules/compatibility/AbstractCompatibilityChecker.java#L16-L110）、`app/src/main/java/io/apicurio/registry/rules/app/compatibility/CompatibilityRuleExecutor.java` 行42–67、`docs/modules/ROOT/pages/getting-started/assembly-intro-to-registry-rules.adoc` 行23、47–59、81–83。信頼性ラベル：primary。本文確認：済
- 何をしているか：levelは、BACKWARD、FORWARD、FULLのそれぞれに「直前の版だけ」と「全履歴（_TRANSITIVE）」の2種類があり、これにNONEを加えたものである。型ごとのcheckerが実装するのは、片方向の `isBackwardsCompatibleWith(existing, proposed)` だけである。FORWARDは引数を入れ替えて呼び、FULLは両方向の差分の和をとり、TRANSITIVEは既存の版を新しい順にすべて検査する。`CompatibilityRuleExecutor` は、NONEなら何もしない。非互換なら、差分の一覧を `RuleViolationException` として版の追加を拒否する。規則はartifact、group、globalの順に優先する。上位の規則を下位で外すには、同じ規則をNONEで上書きする（docs 行59）。抽象checkerは「非互換（差分を返す）」と「判定不能（例外）」を分けるよう、実装者に求めている（行95–101）。
- 解いている問題と前提：registryに版を追加する時点で、consumerを壊す変更を止める。どの向き（新reader対旧data、旧reader対新data）の互換を保証するかを、artifactごとに選べる前提である。
- 必要な入力：artifactごとのlevel、規則の設定権限（docs 行81：管理者はglobal・group・artifactの全階層、開発者はgroupとartifactだけ）、参照されるschemaの解決結果。
- trade-off・失敗の仕方：TRANSITIVEは、全履歴を毎回比較する。コードに「遅くなりうる」というTODOがある（行82–83）。差分は `Set` で重複を除くため、`CompatibilityDifference` の `equals`／`hashCode` の一貫性に依存する（行102–104）。
- 反例・適用しない場合：Avro本体は、levelの概念を持たず、対の判定だけを提供する（P11-O05）。Atlasは「後方非互換」を改名の検出だけで警告する（P11-O09）。
- 互換・非互換：P11-O05を内側に持つ。P11-O07（版の状態）と同じregistryで併用される。
- 限界：levelの名称と意味はregistryに固有である。HELIXの互換規則として採るかどうかは未評価である。

### P11-O07 版の状態機械（ENABLED／DEPRECATED／SUNSET／DISABLED）によるdeprecationの段階
- 出典：Apicurio、`app/src/main/java/io/apicurio/registry/storage/VersionStateExt.java` 行14–78（https://github.com/Apicurio/apicurio-registry/blob/2ec70f01c3229108f7d6bab2bb742796bbc83ca3/app/src/main/java/io/apicurio/registry/storage/VersionStateExt.java#L14-L78）、`docs/modules/ROOT/pages/getting-started/assembly-usage-telemetry.adoc` 行225–290、`docs/modules/ROOT/pages/getting-started/assembly-artifact-reference.adoc` 行145–165。信頼性ラベル：primary。本文確認：済
- 何をしているか：`VersionStateExt` は、許される遷移を状態ごとの集合として持ち、`applyState` で遷移を検証する（不正なら `InvalidVersionStateException`）。DEPRECATEDの版にaccessがあると、警告をlogに出す。telemetryの文書は、deprecation-readiness endpointで、その版を使っているconsumerの一覧と、deprecateしてよいかを返す。手順は、consumerがいないことを確かめてからDEPRECATED、次にSUNSETへ移し、削除する流れである。
- 解いている問題と前提：版を一度に消さず、利用者に移行期間を与え、実際の利用の観測にもとづいて退役を進める。consumerの取得が観測できる前提である（usage telemetry）。
- 必要な入力：状態の意味の定義、遷移表、利用の観測手段、移行期限の決め方（値は持ち込まない）。
- trade-off・失敗の仕方：文書とコードが食い違っている。telemetry文書（行266）は、SUNSETにはDEPRECATEDを経由する必要があると書く。Javadoc（行21）も、ENABLEDからの遷移先をDISABLEDとDEPRECATEDと書く。しかし遷移表の実体（行34）は、ENABLED→SUNSETを許している。artifact-reference（行151）は、状態を3つ（ENABLED／DISABLED／DEPRECATED）としか書いていない。状態機械の正本が1箇所にまとまっていない例として記録する。
- 反例・適用しない場合：pgrollとgh-ostは、版をcomplete時やcut-over時に即座に退役させ、中間の状態を持たない（P11-O01、P11-O10）。
- 互換・非互換：P11-O06と併用される。P11-O10（旧表の保持・削除の明示許可）とは、「退役前に猶予を置く」という点が共通する。
- 限界：期限や判定の閾値は持ち込まない。

### P11-O08 migration directoryの連鎖hash（atlas.sum）と、文の単位での部分適用の記録
- 出典：Atlas、`sql/migrate/dir.go` 行655–681（`NewHashFile`）と行790–830（`Validate`）（https://github.com/ariga/atlas/blob/1317a57674f3795de395f535a258c088d7f767bf/sql/migrate/dir.go#L655-L830）、checkpoint 行65–75、175–200、906–919。`sql/migrate/migrate.go` 行238–251（`Revision`）、637–654（`ExecOrder`）、835–893（https://github.com/ariga/atlas/blob/1317a57674f3795de395f535a258c088d7f767bf/sql/migrate/migrate.go#L835-L893）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`NewHashFile` は、hash関数をfileごとにresetせず、file名と内容を順に書き足す。このため、各行のhashはそれまでのfileすべてに依存する（連鎖）。`atlas:sum ignore` directiveを持つfileは、内容をhashから外す。`Validate` はsum fileと実際のdirectoryを比べ、不一致を追加・編集・削除のどれかとして、行と位置付きの `ChecksumError` で返す。DBの側では、`Revision` が `Applied`／`Total`／`PartialHashes` を持つ。文を1つ実行するたびにrevisionを書き、再実行時には、適用済みの文のhashが変わっていれば `HistoryChangedError` にする。順序は `ExecOrderLinear`（既定。順序外のfileはerror）、`LinearSkip`（飛ばす）、`NonLinear`（実行する）から選ぶ。checkpoint fileは、そこから先だけを適用の起点にする。
- 解いている問題と前提：適用済みのmigrationが後から書き換えられること、順序外にfileが挿入されること、途中で失敗した後のresumeに対処する。複数の開発者が同じdirectoryにfileを足す前提である。
- 必要な入力：fileの命名と版の順序、sum fileをreviewの対象として扱う運用、順序外のfileを許すかどうか。
- trade-off・失敗の仕方：連鎖hashのため、中間のfileを1つ編集すると以降の行がすべて変わる。原因の特定は、`Validate` が最初の不一致の行を返すことで補っている。部分適用の記録は、DDLがtransactionに乗らないDBを前提にした防御と読める（推論）。
- 反例・適用しない場合：pgrollは、履歴をDBの表で `parent` 参照の一意制約により線形に保ち（P11-O10）、file側のhashを持たない。
- 互換・非互換：P11-O10と同じ問題（履歴の線形性）を別の場所で解いている。P11-O09とは独立である。
- 限界：hashの形式や長さは持ち込まない。

### P11-O09 破壊的変更・後方非互換変更の静的検査（既定の重大度の差と、事前checkの提案）
- 出典：Atlas、`sql/sqlcheck/destructive/destructive.go` 行21–143（https://github.com/ariga/atlas/blob/1317a57674f3795de395f535a258c088d7f767bf/sql/sqlcheck/destructive/destructive.go#L21-L143）、`sql/sqlcheck/incompatible/incompatible.go` 行19–93（https://github.com/ariga/atlas/blob/1317a57674f3795de395f535a258c088d7f767bf/sql/sqlcheck/incompatible/incompatible.go#L19-L93）。信頼性ラベル：primary。本文確認：済
- 何をしているか：destructive analyzerは、schemaの削除（DS101）、表の削除（DS102）、非virtual列の削除（DS103）を診断する。同じfile内で作って消す一時的なもの（`SpanTemporary`）は除外する。「空であること／NULLであることを確かめる事前check」を `SuggestedFixes` として提案し、その文も生成する。incompatible analyzerは、表の改名（BC101）と列の改名（BC102）を診断する。旧名のviewを後で作った場合や、旧列を作り直した場合（`wasAddedBack`）は除外する。既定の重大度に差がある。destructiveは `New` でErrorを有効にしているが（行29）、incompatibleは有効にしていない（報告のみ）。
- 解いている問題と前提：migration fileをreviewする時点で、dataの損失やclientの破損を機械的に見つける。変更が `schema.Change` の型として解析できる前提である。
- 必要な入力：analyzerごとにerrorとするか報告に留めるかの設定、例外とする変更の扱い。
- trade-off・失敗の仕方：改名の検出はparserに依存し、parserがviewの作成を判定できない場合は除外されない（`ViewForRenamedT` 行96–111）。型の変更（狭める方向）などは、このanalyzerの対象外である（別のanalyzerがあるかは未確認）。
- 反例・適用しない場合：pgrollは、改名を版のviewで吸収し、非互換として止めない（P11-O01）。Apicurioは、互換性を差分の集合として判定し、追加そのものを拒否する（P11-O06）。
- 互換・非互換：P11-O08と同じlint/CIの経路で使われる。P11-O06の「拒否」とは強さが違う。
- 限界：診断codeの体系はAtlasに固有である。

### P11-O10 旧物の論理削除→確定削除の2段階、および履歴の線形性をDBの制約で守る
- 出典：pgroll、`pkg/migrations/op_drop_table.go` 行17–59（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/migrations/op_drop_table.go#L17-L59）、`pkg/migrations/op_common.go` 行58–71、`pkg/state/init.sql` 行131–156（https://github.com/xataio/pgroll/blob/777a5350e09012b29d26b9611122046d8a96fc1c/pkg/state/init.sql#L131-L156）、同 行4–80（event triggerによる `inferred` migrationの記録）。gh-ost、`doc/command-line-flags.md` 行261–269、319–325、506–508、`doc/revert.md` 行1–19（https://github.com/github/gh-ost/blob/f7a42f6b8028e96d3c8abd47a4da38baedb1161d/doc/revert.md#L1-L19）。信頼性ラベル：primary。本文確認：済
- 何をしているか：pgrollの `OpDropTable.Start` は、表を `_pgroll_del_` 接頭辞へ改名するだけである（soft delete）。`Complete` で実際にdropし、`Rollback` で元の名前へ戻す。履歴の表 `migrations` は、`(schema, parent)` の一意index（history_is_linear）、parentのない行はschemaごとに1つ（only_first_migration_without_parent）という制約を持つ。未完了の行については、コメントは「同時にactiveなmigrationは1つ」とするが、index `only_one_active` は `(schema, name, done) WHERE done = FALSE` であり、nameを含むため、schemaごとの未完了1件を実体としては保証しない（行145–148。コメント上の意図として記録する）。表は`resulting_schema` にop適用後のschemaを保存する。pgroll外で行われたDDLも、event triggerが `inferred` 型として記録する。gh-ostは、原表を `_<table>_del` に改名して残し、dropは `--ok-to-drop-table` で明示した場合だけ行う（大きな表のdropは長いlockになるため）。revertは、checkpoint表に記録したcut-over時点のbinlog座標から旧表を追従させ、もう一度cut-overする。
- 解いている問題と前提：移行直後に戻せる期間を設け、旧物の最終削除を別の判断にする。gh-ostのrevertは、checkpoint表とbinlogが残っていることを前提にしている。
- 必要な入力：旧物を残す期間、削除を許す主体、revertの可否を判断する情報（revert.mdは、逆向きの移行がdata損失を伴うかを先に確かめるよう求めている。行15–19）。
- trade-off・失敗の仕方：revert.mdは、NOT NULLでdefaultのない列を削除した後に行が追加された場合や、列の幅を広げた後に長い値が入った場合は、revertが失敗すると明記している。
- 反例・適用しない場合：Atlasは旧物を残す仕組みを持たず、削除の前に「空であることの確認」を提案するだけである（P11-O09）。Apicurioは版の単位で状態を段階的に移す（P11-O07）。
- 互換・非互換：P11-O01、O04と組み合わせて使われる。P11-O08とは、履歴の線形性をDBの制約で守るか、fileのhashで守るかで対になる。
- 限界：保持期間の値は持ち込まない。本文に記した改名の接頭辞（`_pgroll_del_`、`_<table>_del`）は各toolの実装の観察であり、HELIXの命名規則として持ち込むものではない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 移行中に新旧のclientを動かす | pgroll：版ごとのview schemaで2版を同時に提供（O01） | gh-ost：1版のまま、ghost tableへ複製して最後に差し替え（O03/O04） | Postgresのview・search_pathを使えるか。clientが版を選べるか |
| 移行中の書込みの追従 | pgroll：同じtransaction内のtriggerで `up`／`down` を適用（O02） | gh-ost：binlogを非同期に読み、単一の接続で適用（O03） | 書込みの負荷をDB内で負うか、tool側で負うか。binlogが使えるか |
| 互換性の判定 | Avro：reader/writerの対を規則で解決（O05） | Apicurio：対の判定を、向き×推移性のlevelで包み、登録時に拒否（O06）。Atlas：改名と削除を静的に診断（O09） | dataを書き換えずに読む側で解決するか、保存側で揃えるか |
| 適用履歴の改ざん・順序外の検出 | Atlas：file側の連鎖hashと、文の単位の部分hash（O08） | pgroll：DBの表のparent一意制約と、外部DDLのinferred記録（O10） | migrationの正本がfileか、DB内の状態か |
| 旧物の退役 | pgroll／gh-ost：論理削除→complete時、または明示許可でdrop（O10） | Apicurio：DEPRECATED→SUNSET→削除の状態機械と利用の観測（O07） | 退役の対象が物理表か、公開した契約の版か |
| 戻し方 | pgroll：完了前ならrollbackでviewを消して逆順に戻す（O01） | gh-ost：完了後でも、checkpointとbinlogから逆向きにcut-over（O10） | 完了の前に戻すか後に戻すか。逆向きの変換が損失なしか |

## 見つからなかったこと・gap
- dataの保持期間・archive・削除のpolicy（行単位のretention、TTL、法定保存など）は、読んだ5 repositoryのどれにも、schema移行と結び付いた形では見つからなかった。見つかったlifecycleは、旧schemaの物（表、版）の退役だけである（O07、O10）。
- 保存方式の比較（RDBMS、文書、列指向、event store等）を一次資料として扱う箇所は、今回の範囲にはない。Avroの「dataにwriter schemaを同梱する」（O05）が保存形式側の唯一の観察である。
- expand/contractの「complete（contract）してよい時点」を判定する機構は、pgroll内にない（人や外部が判断する）。Apicurioのdeprecation-readinessが、利用の観測で近いことをしている。
- Avroの、canonical form（aliasを落とす）とalias解決の関係について、issueでの確認はしていない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- pgroll：`README.md` 行1–80、`docs/concepts.md` 全体、`pkg/roll/execute.go` 全体、`pkg/migrations/op_common.go` 行1–80、`pkg/migrations/op_drop_table.go` 全体、`pkg/migrations/types.go` 行225–260、`pkg/backfill/backfill.go` 行1–250（grepと部分読み）、`pkg/backfill/templates/function.go` 全体、`pkg/state/init.sql` 行1–180。issueの検索語「backfill」（in:title）。#583と#646の本文を読んだ。`docs/operations/`、`pkg/sql2pgroll`、`pkg/state/state.go` は読んでいない。
- gh-ost：`doc/triggerless-design.md` 全体、`doc/cut-over.md` 全体、`doc/revert.md` 全体、`doc/command-line-flags.md` の該当節（grep：ok-to-drop-table、_del、initially-drop、timestamp-old-table）、`go/logic/migrator.go` 行875–1162。issue #82の本文を読んだ。`go/logic/applier.go` は関数位置のgrepだけで、本文は読んでいない。`doc/resume.md`、`throttle.md` は読んでいない。
- avro：Specification `++version++` の行263–288、447–470、681–746。`SchemaCompatibility.java` 行43–135、190–262、393–499（grep併用）。他言語の実装、版ごとの旧spec（1.11.x、1.12.0）は読んでいない。
- Apicurio：`CompatibilityLevel.java` 行1–46、`AbstractCompatibilityChecker.java` 全体、`CompatibilityRuleExecutor.java` 全体、`VersionStateExt.java` 全体、`adr/0001-confluent-schema-registry-compatibility.md` 行1–60、docsの `assembly-intro-to-registry-rules.adoc`（grep）、`assembly-usage-telemetry.adoc` 行225–310、`assembly-artifact-reference.adoc` 行145–175。型ごとのchecker（Avro、Protobuf、JSON Schema）の実装は読んでいない。`git grep` は、blob:noneのcloneで全blobを取得し始めたため中断した。
- Atlas：`sql/migrate/dir.go` 行28–75、114–330、655–830、906–936、`sql/migrate/migrate.go` 行238–270、637–656、835–893、`sql/sqlcheck/destructive/destructive.go` 行1–145、`sql/sqlcheck/incompatible/incompatible.go` 行1–120。`sql/sqlcheck/datadepend`、`condrop`、`doc/` 配下の文書は読んでいない。
- flyway・liquibase：メタデータの取得だけで、本文は読んでいない。
- 外部repositoryのコード、script、test、build、install、hookは一切実行していない（clone、checkout、閲覧のみ）。cloneは scratchpad/oss/{pgroll,gh-ost,atlas,avro,apicurio-registry} に置いた。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全件が外部OSSの一次資料（source、設計文書、issue）からの観察である。「外部観察」と「HELIX内の判断」を区別する分類値は未決である。
- scope：観察は、物理schemaの移行（pgroll、gh-ost、Atlas）、直列化形式の互換（Avro）、契約registryの版管理（Apicurio）の3層にまたがる。D06 Data／Databaseのどの下位区分に属させるかは未決である。
- 評価根拠：すべて未評価の候補素材である。外部での運用実績（例：gh-ostがreplicaで継続的に試験移行している記述）を、HELIXでの成立根拠にしない。評価の経路はHELIXBRAIN-L2-026／027（2.0）に委ねる。
- 版：引用はすべて上表の固定commitに紐付く。上流が更新されたときに再照合する規則は未決である。
- 状態：全観察が「未評価」である。O07の文書とコードの食い違いのように、出典の内部で不整合がある観察へ付ける注記の形式は未決である。
