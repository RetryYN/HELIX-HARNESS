# P19 保存方式の比較（行・列・LSM・文書・wide-column・時系列）の観察（D06 Data / Database）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、容量、期間、比、段数、件数等）は持ち込まない。製品の性能値・benchmark値も持ち込まない（RFCに載っている計測結果も写していない）。技術選定・採用推奨・優劣の結論ではない。

埋めるgap：[SCF-B-0155 D06](../../brain-domain-material-inventory-20261004/materials/D06-data-database.md) §4「保存方式の比較（関係DB、document、key-value、時系列、検索index等）と適用条件」。旧HELIXに比較の記述は見つからなかった（同§5）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| cockroachdb/cockroach | https://github.com/cockroachdb/cockroach | d30c905fff79ef825adc96bcc647f1872a90f2ff（default branch: master） | NOASSERTION（LICENSE冒頭：「CockroachDB Software License」） | false | 2026-10-05 | 関係モデルをKV（LSM）の上に載せる分散SQL。`docs/RFCS/` に、行のKVへの写し方、文書型（JSONB）と転置index、時系列の自己保存、consensus logの保存先を、Alternatives・Drawbacks付きで書いたRFCがある。RFCごとにStatus（completed／accepted／postponed／in progress）が付いている |
| tikv/rfcs | https://github.com/tikv/rfcs | 235429bc2d43e4f92e10629d6f3791415591ea6e（master） | Apache-2.0 | false | 2026-10-05 | 分散KV（TiKV）のRFC集。LSM（RocksDB）を分割単位ごとに分ける設計と、LSMの書込み停止（write stall）を上位の流量制御へ置き換える設計を、運用上の理由とともに書いている |
| apache/cassandra | https://github.com/apache/cassandra | b15526b4816518e415aa1046d7eb98232a0c1151（trunk） | Apache-2.0 | false | 2026-10-05 | wide-column型の分散DB。repository内の公式文書（`doc/`）に、LSMをB-treeと対比した選択理由、compaction戦略の選び方、query-firstのdata model、tombstoneの扱いがある |
| facebook/rocksdb | https://github.com/facebook/rocksdb | c2b86f3ec0ca714e0f63872c3fc610c54ec1b301（main） | GPL-2.0（GitHub APIの値。README 29行目はGPLv2とApache 2.0のdual licenseと書き、root に `COPYING` と `LICENSE.Apache` がある） | false | 2026-10-05 | 上の3つ（CockroachDB旧版、TiKV、Cassandraの比較対象）が前提にするLSMの埋込みKV。amplificationの3軸とcompaction方式・値の分離を公開headerのcommentで説明している。copyleftの可能性があるため構造の観察だけにした |
| prometheus/prometheus | https://github.com/prometheus/prometheus | 961c9ba40923ca4d7adf4a7a9167e56d0406df83（main） | Apache-2.0 | false | 2026-10-05 | 時系列専用の保存（TSDB）。`tsdb/docs/` の形式文書と `db.go`・`block.go` で、時間で区切った不変block、block単位の保持、tombstoneによる削除、追記順の制約を読める |
| duckdb/duckdb | https://github.com/duckdb/duckdb | 80e17fc252edd6d9e9b090ae00a1100daef4876a（default branch: v2.0-cyanoptera） | MIT | false | 2026-10-05 | 分析用の列指向DB（README 18行目「analytical database system」）。row group・列segment・統計による読み飛ばし・vector単位の版情報・列ごとの圧縮選択をheaderとcheckpoint処理で読める |

（tikv/tikv もmetadataだけ取得した。default branchはmaster、固定commitは c61d92c26a4d96a575386f5e32179550556e2c29、SPDXはApache-2.0、archivedはfalse。本文は読んでおらず、観察には使っていない。）

## 観察

### P19-O01 関係の行をKVへ写すときに、複数列を1つの値へまとめる単位（column family）を置く
- 出典：cockroach、`docs/RFCS/20151214_sql_column_families.md` 行1–13（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20151214_sql_column_families.md#L1-L13）、行15–64、行66–101（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20151214_sql_column_families.md#L66-L101）、行117–137、行139–180（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20151214_sql_column_families.md#L139-L180）。信頼性ラベル：primary（公式repository内のRFC、Status: completed）。本文確認：済
- 何をしているか：
  - それまでのSQL→KVの写し方は「主キー以外の列1つにつき1つのkey/value」で、keyは `/<tableID>/<indexID>/<primaryKeyColumns...>/<columnID>` だった（行17–22）。
  - RFCは、keyの末尾を `<familyID>` に替え、値に `<columnID>/<columnVal>` の並びを入れて、1つのkeyに複数列を載せる（行76–90）。NULLの列は値に含めない。
  - 列をどのfamilyに入れるかは、列の追加時に決める。既定は型の性質による発見的規則（固定長の列はまとめ、長さ制限のない文字列・bytesは別familyにする）で、SQL構文で利用者が上書きできる（行98–101、117–134）。規則は列の作成時にだけ効くので、後から規則を見直しても互換の問題は起きない、と書いている（行136–137）。
  - 単一列のfamilyは旧形式と同じencodingにし、旧データと互換を保つ（行92–96）。
- 解いている問題と前提：key・MVCCの時刻・checksum・transactionのwrite intentが「key 1つごと」にかかるため、列ごとにkeyを分けると行あたりの固定費が列数に比例する（行24–64）。keyにMVCCの時刻が付くことが前提である（行24–25）。KV層の保存がLSMであることはRFCに書かれておらず、本書の推論である。
- 必要な入力：列の型（固定長か可変長か）、同時に読み書きされる列の組、更新の粒度。
- trade-off・失敗の仕方：Drawbacks（行139–148）は、旧形式を互換のために残すこと、`UPDATE` がfamily内の他列の旧値も読む必要があることを挙げる。代案として、KV層に行と列の概念を持たせるBigtable／HBase型のAPI（列ごとにkeyは分けたまま、networkでは行keyを1回だけ送る）を代案として挙げ、その欠点を、column familyの変更よりずっと侵襲的に見えると書き、KV APIの利用者全員が変わる必要があるか、という問いで結んでいる（行152–168）。不採用の理由を明言してはいない。
- 反例・適用しない場合：Cassandraはwide-column型で、partition内の行をclustering keyの順に1つのpartitionへ並べ、列の写し方をKV利用者側ではなく保存形式側に持つ（P19-O09）。DuckDBは列ごとに別のsegmentへ置き、行をまとめない（P19-O14）。
- 互換・非互換：P19-O02（同じKVの上に文書型を載せる）、P19-O09（wide-columnの行の並べ方）と比べられる。Future Work（行202–207）は、familyにmetadataを足して別の保存方式（RocksDBのcolumn family等）へ割り当てる可能性に触れているが、本RFCでは行っていない。
- 限界：family割当ての閾値（bytes数）と計測結果は持ち込まない。RFC本文の計測結果（行209–232）は観察の根拠にしていない。

### P19-O02 関係DBの中に文書型（JSONB）を置き、取り出しの形からencodingを選び、検索は転置indexで補う
- 出典：cockroach、`docs/RFCS/20171005_jsonb_encoding.md` 行1–43（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20171005_jsonb_encoding.md#L1-L43）、行221–244（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20171005_jsonb_encoding.md#L221-L244）。`docs/RFCS/20171020_inverted_indexes.md` 行16–55、行143–172（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20171020_inverted_indexes.md#L143-L172）、行529–557（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20171020_inverted_indexes.md#L529-L557）。信頼性ラベル：primary（RFC、いずれもStatus: accepted）。本文確認：済
- 何をしているか：
  - JSONB encoding RFCは、encodingを評価する軸として、取り出し・decodeの速さ、encodeの速さ、大きさ（圧縮のしやすさ）、柔軟さを挙げる（行28–34）。「既知の項目を持つ構造化dataには関係modelがある」ので、逆側の「項目が未知で多いかもしれない非構造化data」を想定する、と書く（行36–39）。
  - 想定する取り出しの形は「文書全体ではなく一部の項目を取り出す」ことで、そのために不要なdecodeを減らす形式（Postgresのjsonbに倣う、項目の位置表を先頭に置く形式）を選ぶ（行18–20、41–43）。
  - JSONBのkey encoding（indexのkeyとして並べること）は、数値のkey encodingの難しさを理由に、この時点では許さない（行14–16）。
  - 文字列のまま保存する案は、大きく、項目の取り出しに全体のparseが要るとして退けた。BSONは、項目数が少なく構造化された文書向けで、位置表もkeyの整列もなく、転置indexを持たないMongoDBの前提に合わせた形式だとして退けた（行221–244）。
  - 転置index RFCは、通常の二次indexは値の前方一致の比較しか扱えず、「JSONのある経路にある値を持つ行」を全件走査なしに探せない、という問題から始める（行51–55）。JSONの葉ごとに「経路＋値」をkeyにし、主キーを指す行をKVへ書く（行143–172）。
- 解いている問題と前提：同じ関係DBの中で、schemaの決まらない項目を持つdataを扱うこと。保存先は順序付きKVで、indexもKVの範囲走査で引けることが前提である。
- 必要な入力：文書のどの部分を、どの頻度で取り出すか（全体か一部か）。どの検索条件（keyの存在、経路と値の一致、範囲）を速くしたいか。項目の集合が既知か未知か。
- trade-off・失敗の仕方：転置indexのDrawbacks（行529–535）は、値1つから上限なく多数のindex keyが生まれ、indexが非常に大きくなると書く。代わりに計算列への通常indexを使えば小さくなるが、利用者がどのkeyにindexが要るかを前もって知っている必要がある。配列の入れ子情報をkeyから省く案は、keyが短くなる代わりに入れ子の区別が失われ、問い合わせ後の絞り込みが増えるとして退けた（行539–557）。
- 反例・適用しない場合：Cassandraはjoinを持たず、query-firstで非正規化した表を作るよう勧め、文書型ではなくtableを問い合わせごとに複製する方向を採る（P19-O09）。
- 互換・非互換：P19-O01（同じKVへの写し方）と、Prometheusの転置index（labelのpostings、P19-O12）と比べられる。Prometheusは「label＝値」から系列への対応をblockごとに持つ。
- 限界：bit配置・header長などの形式の値は持ち込まない。RFCのStatusはacceptedであり、本書は固定commitの実装を読んでいない（設計文書と実装の区別は§BRAINの属性の未決事項）。

### P19-O03 時系列を汎用KVの中に「時間の塊」として置き、古いdataは解像度を下げて残す（rollup／culling）
- 出典：cockroach、`docs/RFCS/20160901_time_series_culling.md` 行1–32（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20160901_time_series_culling.md#L1-L32）、行36–50、行196–255（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20160901_time_series_culling.md#L196-L255）、行257–267、行315–348（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20160901_time_series_culling.md#L315-L348）。信頼性ラベル：primary（RFC、Status: in progress）。本文確認：済
- 何をしているか：
  - CockroachDBは自分の内部metricsを、自分のKVの中に保存する。1つの系列の、壁時計で区切った一定時間分の標本を1つのkeyに入れる（行40–42。keyは系列名・発生源・解像度・区切りの開始時刻からなる、行44–48の例）。
  - 古い高解像度dataを見つけて、keyごとに「和・件数・最小・最大」を持つ1標本へ縮め（downsample）、別のkey空間（低解像度）へ書き、元のkeyを消す（行203–217）。低解像度dataはそれ以上縮めず、古くなれば消す（行196–201）。
  - 複数nodeが同じkeyを同時に処理しても、低解像度の書込みと削除が冪等なので安全だ、と書く（行219–224）。
  - 実装は段階に分ける：まず削除だけ、次に縮約、最後に解像度をまたぐquery（行242–255）。
- 解いている問題と前提：書くだけで消さない時系列が、外部dataがなくても容量を食い続けること（行9–20）。単純に閾値より古いdataを消すのではなく、履歴の評価のために粗いdataを残す。
- 必要な入力：解像度の段（何をどこまで縮めるか）、縮約で残す統計量、古さの判定基準、解像度をまたぐqueryの扱い。
- trade-off・失敗の仕方：
  - Drawbacks（行257–267）：nodeごとに周期処理が増える。系列の配置によっては、削除の後に空のrangeが連なり、range数に比例する処理の負担になりうる。
  - 書込み時に高・低両方の解像度へ同時にmergeする当初の設計（Immediate Rollups）は、replica整合性検査のための変更で、engine側のmergeが集計ではなく間引きになったため成り立たなくなった。理由は、raft commandの再実行（replay）があるためだと書く（行315–332）。
  - 1つの区切り（key）の分がそろった時点で縮める案（Opportunistic Rollups）は、直近の時間が低解像度で見えないこと、縮約済みかのmetadataが要ることを理由に採らなかった（行334–348）。
- 反例・適用しない場合：Prometheusは時系列専用の保存を持ち、時間で区切った不変blockを丸ごと消して保持期間を守る（P19-O12）。Prometheus本体の、今回読んだ範囲には、解像度を下げて残す仕組みは見当たらなかった。CassandraはTTL付きの時系列向けに、時間窓でSSTableをまとめ、期限切れのSSTableを丸ごと落とすcompaction戦略を持つ（P19-O08）。
- 互換・非互換：P19-O12（block単位の保持）、P19-O08（TWCS）と、同じ「古い時系列をどう減らすか」を別の層で解いている。
- 限界：解像度・区切りの長さ・容量見積りの数値は持ち込まない。Statusがin progressであり、固定commitの実装がRFCどおりかは確認していない。

### P19-O04 同期書込みが多いconsensus logと、非同期でよい状態機械の書込みを、別の保存engineへ分ける（RFC自体はpostponed）
- 出典：cockroach、`docs/RFCS/20170605_dedicated_raft_storage.md` 行1–18（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20170605_dedicated_raft_storage.md#L1-L18）、行20–64、行239–298（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20170605_dedicated_raft_storage.md#L239-L298）、行300–333、行339–344、行412–469（https://github.com/cockroachdb/cockroach/blob/d30c905fff79ef825adc96bcc647f1872a90f2ff/docs/RFCS/20170605_dedicated_raft_storage.md#L412-L469）。信頼性ラベル：primary（RFC、Status: postponed）。本文確認：済
- 何をしているか：
  - 当時は1つのRocksDBに、状態機械の変更とconsensusの状態（raft log、HardState）を両方書いていた（行12–18）。raft logは応答前に同期して永続化する必要があり、RocksDBの同期書込みはそれ以前の非同期書込みもまとめて永続化するため、状態機械側の非同期化の利点が失われる（行20–64）。
  - RFCは、storeごとに2つ目のRocksDBを置き、raft logのkeyとHardStateだけをそちらへ書く（行239–249）。移行は、両方へ書いて読み比べてから旧側を外す段階を踏む（行253–262）。
  - raft logを切り詰める前に、切り詰める項目の適用結果が主engineで永続化済みであることを確かめる必要があり、そのために主engineを明示的に同期する、という順序の制約を挙げる（行274–292）。
  - 既存clusterの移行は、offlineのstore単位の移行で足りるとし、online移行の案は範囲外にした（行300–333）。
- 解いている問題と前提：書込みの「永続化の要否」が異なる2種類の負荷が、同じ保存engineを共有することで互いに干渉する問題。どちらもLSMのKVであり、raftの永続化要件が前提である。
- 必要な入力：書込みの種類ごとの永続化要件（同期・非同期）、読み出しの形（logは順次読みと前方の切り詰め）、2つの保存先の間の順序制約（切り詰めと適用の永続化）。
- trade-off・失敗の仕方：
  - Drawbacks（行339–344、412）：2つのinstanceはdiskやOSのbufferを共有するため、思ったほど分離されない、と自ら計測で示している（計測値は持ち込まない）。
  - 代案として、raft log専用のWALを自作する案を検討した。1つのstoreに多数のreplicaがあり、replicaごとにfileを分けるのは成り立たず、複数の書込み点を持つ共有WALが要るが、既存の実装は少数の書込み点しか想定していない。実装の手間と複雑さに見合わないとして退け、調整したRocksDBを使い続ける判断を書いている（行414–460）。
  - RFC全体はStatus: postponedで、採用されたわけではない。
- 反例・適用しない場合：TiKVは逆向きに、raft logを専用engineに置いたうえで、状態機械側のLSMを分割単位（region）ごとに分ける（P19-O05）。
- 互換・非互換：P19-O05と、「1つのLSMに何を同居させるか」の分け方で対になる。P19-O07（Cassandraのcommit logの同期方式）と、同期と非同期の書込みの扱いで比べられる。
- 限界：計測値・設定値は持ち込まない。postponedのRFCであり、後の版でどう解かれたか（Pebbleへの移行等）は本書では読んでいない。

### P19-O05 LSMを分割単位（region）ごとに物理的に分け、split・merge・snapshotをfile操作へ寄せる
- 出典：tikv/rfcs、`text/0093-rocksdb-per-region.md` 行1–26（https://github.com/tikv/rfcs/blob/235429bc2d43e4f92e10629d6f3791415591ea6e/text/0093-rocksdb-per-region.md#L1-L26）、行28–77（https://github.com/tikv/rfcs/blob/235429bc2d43e4f92e10629d6f3791415591ea6e/text/0093-rocksdb-per-region.md#L28-L77）、行79–129、行157–173、行186–192（https://github.com/tikv/rfcs/blob/235429bc2d43e4f92e10629d6f3791415591ea6e/text/0093-rocksdb-per-region.md#L157-L192）。信頼性ラベル：primary（公式RFC repository）。本文確認：済
- 何をしているか：
  - それまでは多数のregionが1つのKV用RocksDBを共有していた。RFCは、regionごとに独立したRocksDB（tablet）を持たせ、raft logは別のraft engineに置く（行8、28–30）。tabletの名前に「作成時のraft log index」を含め、新旧のtabletを並べて置き、古い方への問い合わせが終わってから消せるようにする（行32–36）。
  - block cache・統計・rate limiter・compaction filterはtablet間で共有し、流量・compactionの並行数・memoryを一括で制御する（行38）。
  - memtableは、全tabletで共有して分けて書き出す案と、tabletごとに持つ案を比べ、前者は実装が複雑で小さなfileが増えるとして後者を選んだ（行56–62）。
  - tabletごとのWALはrandom writeを生むので、KV側のWALを無効にし、状態（region状態、tablet index）をraft engineへ移す。永続化の順序（snapshot適用やsplitの完了は、tablet indexをraft engineへ永続化した後）を明示している（行68–77）。
  - snapshotはtabletのcheckpoint（hardlink）で作り、split・mergeは凍結したmemtableとSSTのhardlinkで新tabletを作る（行83–129）。
- 解いている問題と前提：1 instanceが大きくなると、SST数によるlock競合、region単位で読み書きするのにregionをまたぐ不要なcompaction、snapshot生成や削除によるLSMの形の変化が問題になる（行18–24）。読み書きがregion単位で閉じることが前提である。
- 必要な入力：分割単位（region）と、その単位で読み書きが閉じているか。共有する資源（cache、rate limiter）と分ける資源（memtable、WAL）の区別。永続化の順序。
- trade-off・失敗の仕方：
  - Drawbacks（行190–192）：既存構成よりOOMになりやすい。memtableごとにbloom filterが確保されるため、tabletが多いと負荷がなくてもmemoryを使う（行64）。
  - 旧構成からのdata移行は「ほぼ不可能」とし、小さなregionを先にmergeしてから段階的にtablet化する移行段階を置く。旧architectureのcodeも残す必要がある（行159–173）。
  - 再起動でlock待ちの間に参照のないtabletが残りうるので、起動時の点検や周期的なGCが要る（行89）。
- 反例・適用しない場合：CockroachDBのRFC（P19-O04）は、状態機械を1つのengineに置いたまま、consensus logだけを分ける案だった。Cassandraはtable単位でSSTableを持つ（P19-O07）。
- 互換・非互換：P19-O06（LSMの流量制御）と組み合わさる。tabletごとに別のengineを使う「heterogeneous」構成の可能性にも触れている（行186–188）。
- 限界：tabletの大きさ・file数・移行時間などの数値と計測結果は持ち込まない。tikv/tikv本体の実装は読んでいない。

### P19-O06 LSMの書込み停止（write stall）を止め、上位の受付層で滑らかに絞る
- 出典：tikv/rfcs、`text/0067-substitute-rocksdb-write-stall.md` 行6–13（https://github.com/tikv/rfcs/blob/235429bc2d43e4f92e10629d6f3791415591ea6e/text/0067-substitute-rocksdb-write-stall.md#L6-L13）、行15–46、行48–68（https://github.com/tikv/rfcs/blob/235429bc2d43e4f92e10629d6f3791415591ea6e/text/0067-substitute-rocksdb-write-stall.md#L48-L68）、行70–111、行117–120。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - RocksDBのwrite stallは、memtable数、L0のSST数、compaction待ちのbytesが条件を超えたときに、全column familyの書込み速度を一律に落とす・止める仕組みである（行17–42）。
  - RFCは、diskの負荷が高いときにwrite stallでQPSが急変することを問題にし、RaftDBとKvDBが持つRocksDBのwrite stallを外し、TiKVの受付（scheduler）層に限流器を置く（行11–13、53–55）。外し方はDBごとに違う（下記）。絞り方は、`ServerIsBusy` を返すか、token bucketで遅延させるかの2つ（行55）。
  - 指標ごとに扱いを分ける：compaction待ちbytesは推定値で不正確なので速度ではなく「棄却率」を傾向から決め、急変を避けるため連続関数と移動平均で滑らかにする（行82–105）。memtable・L0のfile数は周期的に見て、AIMD（加算増・乗算減）で書込み速度を調整する（行107–111）。
  - write stallを完全に無効にするのは、raft log用のDB（RaftDB）だけである。書込み主体で読みが少ないためだと書く（行72–74）。KV用のDB（KvDB）は、L0・memtableによるwrite stallを無効にし、compaction待ちbytesのwrite stallは、followerの書込みを絞らないことへの退避として高い閾値で残す（行76–78）。followerの書込みは、遅いfollowerがraft group全体を止めないよう、絞らない（行64–68）。
  - 比較として、Pebbleはwrite stallをなくしていることを挙げる（行44–46）。
- 解いている問題と前提：LSMはcompactionが書込みに追いつかないと読み増幅が増え、最終的に書込みを止める。停止を保存engineの中で急に起こすと、利用者からはlatencyの急変に見える。RFCは「長めの応答時間は許容するが、latencyの急上昇は望まない」と書く（行13）。
- 必要な入力：どの指標が読み増幅・容量の危険を表すか、絞る場所（engine内か受付層か）、絞り方（遅延か拒否か）、再試行する上位（TiDB）の振舞い。
- trade-off・失敗の仕方：棄却率と待ちbytesが釣り合うと待ちbytesが減らなくなるので、stall状態が続いた時間に比例する項を足す（行105）。上位の再試行がbackoffで長くなるため、回復後は早く知らせる必要がある（行57）。代案は「write stallを無効にして何も絞らない」「RocksDBの設定値を上げる」（行117–120）。
- 反例・適用しない場合：Cassandraの文書は、memtableのflush待ちが閾値を超えると書込みを止める、と書くだけで、受付層での段階的な絞りは今回読んだ範囲になかった（P19-O07）。
- 互換・非互換：P19-O05（tablet間で共有するrate limiter）、P19-O11（RocksDBのcompaction方式による増幅の違い）の前提になる。
- 限界：閾値、係数、段数、bucketの大きさは持ち込まない。AIMDの説明（行111）は、増える傾向のときに書込み速度へ係数を掛け、減る傾向のときに一定量を引く、と書いており、名前（加算増・乗算減）と逆向きにも読める。本書は原文の記述をそのまま示すだけにし、どちらが意図かは判断していない。

### P19-O07 書込みを優先するLSMを選び、B-treeと比べて何を捨てたかを公式文書に書く（commit logの同期方式も選ばせる）
- 出典：cassandra、`doc/modules/cassandra/pages/architecture/storage-engine.adoc` 行1–16（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/architecture/storage-engine.adoc#L1-L16）、行19–34、行44–58（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/architecture/storage-engine.adoc#L44-L58）、行86–112、行114–161、行163–211（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/architecture/storage-engine.adoc#L163-L211）。信頼性ラベル：primary（公式repository内の文書）。本文確認：済
- 何をしているか：
  - 保存engineは書込み中心の負荷に最適化しており、B-treeではなくLSMを採り、読み出しを伴わない書込み経路にしている、と書く（行3）。その代わりに読み性能と書込み増幅（write amplification）にtrade-offがあり、読みはbloom filterで補う、compactionは同じdataを何度も書き直す背景I/Oになる、と明記する（行5–7）。
  - 書込みは commit log → memtable → flush → 不変のSSTable の順で進む（行9–16）。SSTableは書いた後に二度と書き換えず、1つのpartitionは複数のSSTableにまたがる（行165–168）。SSTableはdata本体とpartition index、row index、bloom filter、統計などの部品fileからなる（行170–196）。
  - commit logの同期方式を `batch`（fsyncしてから応答）と `periodic`（すぐ応答し、周期的に同期）から選ばせ、`periodic` では予期しない停止で同期周期分以上を失いうると注記する（行44–58）。
  - memtableの実装を差し替えられる（skip listとtrie）。table定義ごとに選べる（行114–161）。
- 解いている問題と前提：書込みを止めずに多量に受けること。読みはpartition key経由で行うことが前提である（P19-O09）。
- 必要な入力：読み書きの比、許容できる書込み増幅と背景I/O、停止時に失ってよい書込みの範囲（同期方式の選択）。
- trade-off・失敗の仕方：memtableのflush待ちが閾値を超えると、次のflushが成功するまで書込みを止める（行107）。`batch` 方式では、commit logを別の専用deviceに置くことを勧めている（行54–58）。
- 反例・適用しない場合：DuckDBは分析用の列指向で、書込みはrow group単位の追記と、checkpoint時の列ごとの書き直しで扱う（P19-O14）。B-treeを採る保存engineの設計文書は、今回の6 repoには含めていない（§見つからなかったこと）。
- 互換・非互換：P19-O08（compaction戦略）、P19-O10（削除のtombstone）、P19-O11（RocksDBの増幅の3軸）と同じLSMの系統。P19-O04（同期と非同期の書込みの干渉）と比べられる。
- 限界：segment長・周期・容量などの既定値は文書に書かれているが持ち込まない。

### P19-O08 compaction戦略を負荷の形（更新・削除の多さ、時系列か、読みの多さ）に合わせてtableごとに選ぶ
- 出典：cassandra、`doc/modules/cassandra/pages/managing/operating/compaction/overview.adoc` 行79–96（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/managing/operating/compaction/overview.adoc#L79-L96）、`twcs.adoc` 行1–32（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/managing/operating/compaction/twcs.adoc#L1-L32）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、負荷ごとに最適化したcompaction戦略を用意し、負荷に合うものを選ぶよう書く（overview 行81–82）。
    - UCS：多くの負荷に向き、新しい負荷に勧める。不変の時系列と、更新・削除の多い負荷の両方を扱う設計（行84–88）。
    - STCS：他の戦略が合わないときの退避先として既定にしている。厳密な時系列でない負荷や、LCSのI/Oが高すぎる場合に向く（行89–91）。
    - LCS：読みの多い負荷、更新・削除の多い負荷に向き、不変の時系列には向かない（行92–94）。
    - TWCS：TTL付きでほぼ不変の時系列向け（行95–96）。
  - TWCSは、時間窓ごとにSSTableをまとめ、窓が閉じたら1つにまとめてそれ以上compactionしない。期限切れになった窓のSSTableを丸ごと落とせるので、STCS・LCSより確実に容量を回収できる（twcs 行7–17）。
- 解いている問題と前提：LSMのcompactionは、読み増幅・書込み増幅・容量増幅のどれを減らすかで方式が変わる。dataが時刻順に入り、まとめて期限切れになるなら、時間で区切る方式が使える。
- 必要な入力：更新・削除の頻度、dataが時刻順に入るか、TTLで期限切れにするか、読みの多さ、diskの種類。
- trade-off・失敗の仕方：TWCSは、新旧のdataが同じSSTableに混ざると利点を失う。混ざる経路として、利用者が新旧dataを同じ書込み経路へ混ぜる場合と、古いdataの読み出しによるread repairが古いdataを現在のmemtableへ引き込む場合を挙げ、CQLの `USING TIMESTAMP` で時刻を明示する問い合わせを避けるよう書く（twcs 行23–32）。
- 反例・適用しない場合：Prometheusは時系列専用で、compactionの方式を利用者に選ばせず、時間で区切ったblockを段階的にまとめ、保持期間外のblockを丸ごと消す（P19-O12）。RocksDBは同じ選択肢をengineの設定（compaction style）として持つ（P19-O11）。
- 互換・非互換：P19-O10（tombstoneはcompactionで消える）、P19-O03・O12（古い時系列の減らし方）と関係する。
- 限界：文書上は、既定がSTCS（overview 行90、`doc/modules/cassandra/partials/default-compaction-strategy.adoc` 行1–4 https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/partials/default-compaction-strategy.adoc#L1-L4 ）、新しいtableへの推奨がUCS（overview 行85、`doc/modules/cassandra/partials/ucs-recommend.adoc` 行1–4 https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/partials/ucs-recommend.adoc#L1-L4 ）で、既定と推奨を分けて書いており整合している。実装の既定は、`src/` を読んでいないため確認していない。窓の長さ等の値は持ち込まない。

### P19-O09 joinを持たないwide-column型で、問い合わせから表を設計し（query-first）、非正規化を前提にする
- 出典：cassandra、`doc/modules/cassandra/pages/developing/data-modeling/data-modeling_rdbms.adoc` 行17–39（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/developing/data-modeling/data-modeling_rdbms.adoc#L17-L39）、行41–78、行80–110（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/developing/data-modeling/data-modeling_rdbms.adoc#L80-L110）、行112–140（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/developing/data-modeling/data-modeling_rdbms.adoc#L112-L140）。`architecture/storage-engine.adoc` 行204–206。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - joinはできない。joinに当たるものが要るなら、clientで行うか、joinの結果を表す非正規化した2つ目のtableを作る。後者を勧める（行22–29）。
  - 表をまたぐ参照整合性（外部キー、cascade削除）はない（行31–39）。
  - 関係modelは概念domainの名詞からtableを作り、queryを後から書くが、Cassandraはqueryのmodelから始め、主なquery pathを支えるtableを作る（行80–100）。
  - tableごとに別のfileへ保存されるので、関係する列は同じtableに置く。partitionはnodeをまたいで分割されない保存の単位なので、1つのqueryで探すpartition数を最小にするのが設計の目標になる（行112–125）。
  - 並び順は設計時の決定で、tableのclustering columnで固定される（行127–140）。保存engine側では、partitionはtokenの順、partition内の行はclustering keyの順に並ぶ（storage-engine.adoc 行204–206）。
- 解いている問題と前提：分散したpartition単位の保存で、問い合わせを1 partitionの読みに閉じたい。問い合わせの形が前もって分かっていることが前提である。
- 必要な入力：主なquery pathの一覧、各queryが引くpartition key、並べたい順序、重複して持つdataの更新経路。
- trade-off・失敗の仕方：文書自身が、query-firstは設計を縛りすぎるという批判を挙げたうえで、queryを考え抜くのは関係domainを考え抜くのと同じく妥当であり、queryの要件が変わってdataを組み直す必要が出るのはRDBMSでtableを誤った場合と変わらない、として退けている（行102–110）。queryの要件が変わればdataの組み直しが要ること自体は認めている。非正規化した複数tableの同期は、利用者が管理するか、materialized viewでserverに任せる（行72–78）。
- 反例・適用しない場合：CockroachDBは関係modelを保ったまま、KVへの写し方（P19-O01）と、文書型・転置index（P19-O02）でschemaの決まらないdataを扱う。文書は、関係DBでも、請求書のように「その時点の文書」を保全する必要があるときは意図して非正規化する、と書く（行55–65）。
- 互換・非互換：P19-O01（行の写し方）、P19-O02（関係DB内の文書型）と、「問い合わせの形をどこで受け止めるか」で比べられる。P19-O10（削除がtombstoneになる）とあわせて、更新・削除の多い設計の負担になる。
- 限界：例として出るdomain（hotel等）は持ち込まない。

### P19-O10 削除を「時刻付きの削除印（tombstone）の追記」として扱い、複製の遅れによる復活を猶予期間で防ぐ
- 出典：cassandra、`doc/modules/cassandra/pages/managing/operating/compaction/tombstones.adoc` 行5–25（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/managing/operating/compaction/tombstones.adoc#L5-L25）、行27–52（https://github.com/apache/cassandra/blob/b15526b4816518e415aa1046d7eb98232a0c1151/doc/modules/cassandra/pages/managing/operating/compaction/tombstones.adoc#L27-L52）、行54–58。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 削除を挿入として扱い、時刻付きの削除印（tombstone）を書込み経路に通してSSTableへ書く。tombstoneは猶予期間（grace period）を持ち、期間後のcompactionで消える（行9–12）。TTLが切れたdataも、猶予期間中は削除済みと同じに扱う（行14–19）。
  - 値をその場で消さない理由は分散にある。tombstoneより前の時刻の値は、問い合わせで無視される（行23–25）。
  - 削除時に停止していたreplicaが、他のreplicaがtombstoneを消した後に戻ると、古いdataを生きていると誤認し、repairで広げてしまう（zombie）。猶予期間はこれを防ぐための時間で、tableごとに設定する（行27–44）。
  - tombstoneとそれが消すdataが別のSSTableにある場合、両方を含むcompactionでなければ消せない（行56–58）。
- 解いている問題と前提：不変のSSTableと、複製が遅れて届く分散環境で、削除を確実に全replicaへ伝えること。
- 必要な入力：猶予期間（nodeの停止がどれだけ続きうるか、repairの周期）、TTLの有無。
- trade-off・失敗の仕方：猶予期間が終わるまでnodeが戻らないと、削除を取りこぼしうる（行48–50）。削除が多いとtombstoneがSSTableに溜まり、compactionの負担と読みの負担になる（compaction戦略の選択、P19-O08）。
- 反例・適用しない場合：Prometheusのtombstoneは複製のためではなく、不変blockを書き換えずに削除を表すためのもので、blockの書き直し（CleanTombstones）で消す（P19-O12）。DuckDBはrow groupの版情報に削除idを持ち、MVCCの可視性として削除を表す（P19-O14）。
- 互換・非互換：P19-O07（不変SSTable）、P19-O08（compaction）の前提になる。
- 限界：猶予期間の既定値は文書に書かれているが持ち込まない。

### P19-O11 LSMの増幅3軸（書込み・読み・容量）を設定で動かせるようにし、compaction方式と値の分離を選ばせる
- 出典：rocksdb、`README.md` 行1–15（https://github.com/facebook/rocksdb/blob/c2b86f3ec0ca714e0f63872c3fc610c54ec1b301/README.md#L1-L15）、`include/rocksdb/advanced_options.h` 行27–37（https://github.com/facebook/rocksdb/blob/c2b86f3ec0ca714e0f63872c3fc610c54ec1b301/include/rocksdb/advanced_options.h#L27-L37）、行71–83、行1070–1094（https://github.com/facebook/rocksdb/blob/c2b86f3ec0ca714e0f63872c3fc610c54ec1b301/include/rocksdb/advanced_options.h#L1070-L1094）。信頼性ラベル：primary（公式repository内のREADMEと公開headerのcomment）。本文確認：済（構造の観察だけ。コードは写していない）
- 何をしているか：
  - READMEは、LSM設計で書込み増幅（WAF）・読み増幅（RAF）・容量増幅（SAF）の間を柔軟に調整できると説明する（行11–15）。
  - compaction方式を列挙型で選ばせる：level、universal、FIFO、背景compactionなし（利用者が明示的にcompactionを依頼する）（行27–37）。
  - FIFO方式は、table fileの合計が上限に達したら最古のfileを消す方式で、小さなfileをまとめるcompactionは任意に有効にする（行71–83）。
  - 大きな値をSSTとは別のblob fileに書き、SSTには参照だけを置く設定がある。大きな値の書込み増幅を減らす代わりに、読みに間接参照が1段増える、とcommentに書く。この分離は `enable_blob_files` を有効にした場合だけ働き、既定では無効である（行1070–1081）。有効にしたうえで `min_blob_size` を設定すると、それ未満の値は従来どおりSSTに置かれる。有効にして `min_blob_size` を設定しなければ、すべての値がblob fileに入る。`min_blob_size` は `enable_blob_files` が有効でなければ作用しない（行1084–1094）。値は持ち込まない。
- 解いている問題と前提：同じLSMの埋込みKVを、負荷の違う多数の利用者（P19-O04・O05・O06の上位system等）が使う。どの増幅を減らすかは利用者の負荷で決まる。
- 必要な入力：値の大きさの分布、更新の多さ、dataが期限で消えるか（FIFOに向くか）、読みの形。
- trade-off・失敗の仕方：値の分離は読みに間接参照を足し、blob fileのGCが別に要る（行1073–1076の関連設定の列挙）。FIFOは古いfileを丸ごと消すので、古いdataを残す必要がある用途には使えない。
- 反例・適用しない場合：Cassandraは同じ選択をtableごとのcompaction戦略として利用者に見せる（P19-O08）。TiKVは、RocksDBの内部の書込み停止の全部または一部を外し（DBごとに異なる）、上位で制御する（P19-O06）。
- 互換・非互換：P19-O07・O08（LSMの系統）、P19-O06（write stall）と関係する。
- 限界：GitHub APIのSPDXはGPL-2.0であり、構造の観察だけにした。上限・閾値・既定値は持ち込まない。wikiは読んでいない（repository外）。

### P19-O12 時系列を「時間で区切った不変block＋書込み中のhead」に分け、保持はblock単位の削除、個別削除はtombstoneで表す
- 出典：prometheus、`tsdb/docs/usage.md` 行15–28（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/docs/usage.md#L15-L28）、`tsdb/docs/format/index.md` 行1–34、`tsdb/docs/format/tombstones.md` 行1–31（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/docs/format/tombstones.md#L1-L31）、`tsdb/db.go` 行2245–2345（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/db.go#L2245-L2345）、行2803–2827（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/db.go#L2803-L2827）、`tsdb/block.go` 行614–686（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/block.go#L614-L686）。信頼性ラベル：primary（公式repository内の形式文書とコード）。本文確認：済
- 何をしているか：
  - `DB` は、compactor、head、永続化したblockからなる。headはWAL、活動中の系列、postings（label＝値から系列への転置index）、tombstoneを持つ（usage.md 行15–28）。blockごとのindex fileは、symbol table、系列、label index、postings、目次（TOC）からなる（index.md 行1–34）。
  - 保持（retention）はblock単位で判断する。blockを新しい順に並べ、compaction済みで不要になったblock、時間の保持を超えたblock、容量の保持を超えたblockを削除対象にする（db.go 行2245–2277）。時間の保持は最新blockとの時刻差で、容量の保持はheadの大きさを含めた累積で判断し、超えた点から後ろのblockをすべて対象にする（行2279–2345）。
  - 個別の削除（`DB.Delete`）は、時間範囲が重なるblockとheadへ並行に適用し、原子性はblockごとにしか保証しない、とcommentに書く（行2803–2827）。block内ではdataを書き換えず、該当系列の時間区間をtombstone fileに書く（block.go 行614–680）。tombstoneの解消は、tombstoneのあるblockを書き直すことで行う（行682–686）。
- 解いている問題と前提：時刻順にほぼ追記だけされ、古いものから期限で消える時系列を、更新を伴わずに保存すること。queryは時間範囲とlabelの条件で引く。
- 必要な入力：保持の基準（時間、容量、容量の割合）、blockの時間幅、削除の要件（範囲削除が要るか、原子性の範囲）。
- trade-off・失敗の仕方：容量の割合による保持を設定していても、fsの大きさが取れない場合は割合の判定を飛ばし、固定の容量上限へ戻す（db.go 行2313–2321。警告logを出す）。削除はblockをまたいで原子的でない（行2803）。tombstoneは書き直すまで容量を減らさない。
- 反例・適用しない場合：CockroachDBは汎用KVの中で古い時系列を縮約して残す（P19-O03）。Cassandraは時系列をTWCSの時間窓で扱い、削除はtombstoneの猶予期間で扱う（P19-O08、P19-O10）。
- 互換・非互換：P19-O13（headへの追記の制約）と対になる。P19-O02（転置index）とはpostingsの持ち方で比べられる。
- 限界：保持期間・block幅・segment長などの既定値は持ち込まない。原設計の解説はrepository外（README 14–18行目が外部の記事と論文へのlinkを置く）で、本書では読んでいない。

### P19-O13 時系列の追記に順序の制約を置き、「古すぎる・順序違い」の書込みを拒否する（順序違いの受入れは後から窓として足す）
- 出典：prometheus、`tsdb/docs/usage.md` 行30–55（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/docs/usage.md#L30-L55）、行57–66、`tsdb/db.go` 行198–205、行1369–1385（https://github.com/prometheus/prometheus/blob/961c9ba40923ca4d7adf4a7a9167e56d0406df83/tsdb/db.go#L1369-L1385）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 追記は、headの最小有効時刻より古い標本を「out of bounds」として拒否する。理由として、生成されるblockが前のblockと重ならないこと（queryを単純にする）と、標本が永続化中の区間（compaction window）に入らないこと（ingestionとlockなしで並行して動くため）を挙げる（usage.md 行43–51）。
  - 系列ごとに、順序違いの標本と、最新時刻に別の値を持つ標本も拒否する（行53）。別のappenderから入った標本との順序違いは `Commit()` で拒否されうる（行55）。
  - querierは作成時点でcommit済みのdataしか見ない（行64）。WALへの書込みは直列化される（行40–41）。
  - 後から、順序違いを一定の時間窓だけ受け入れる設定（`OutOfOrderTimeWindow`）が加わっている。有効にすると、head用に別のlog（WBL）を作り、順序違い用のcompactionと、時間の重なるqueryを有効にする。無効に戻しても、順序違い用のcompactionと重なりqueryは、再起動まで、または順序違いの標本がすべてcompactionされるまで有効のまま残る（db.go 行1369–1385、特に行1383）。この値は実行中に変わりうる（行198–201）。
- 解いている問題と前提：時刻順に入る前提で、block間の重なりをなくし、永続化とingestionをlockなしで並行させる。順序違いが例外的であることが前提である。
- 必要な入力：入力の時刻がどの程度乱れるか、遅れて届くdataを受け入れるか捨てるか、重なるblockをqueryがどう扱うか。
- trade-off・失敗の仕方：順序の制約は、遅れて届くdataを失う。順序違いを受け入れると、別のlog・compaction・重なりqueryが要り、設定を戻しても仕組みはすぐには外れない（db.go 行1380–1383）。
- 反例・適用しない場合：CassandraのTWCSは順序違いを拒否せず、混ざると容量回収の利点を失う、という形で負担を利用者へ返す（P19-O08）。
- 互換・非互換：P19-O12（不変block）の前提になる。
- 限界：時間窓・容量の既定値は持ち込まない。

### P19-O14 分析用の列指向：行の塊（row group）の中に列ごとのsegmentを持ち、統計で読み飛ばし、版情報はvector単位、圧縮は列ごとにcheckpoint時に選ぶ
- 出典：duckdb、`src/include/duckdb/storage/table/row_group.hpp` 行109–116（https://github.com/duckdb/duckdb/blob/80e17fc252edd6d9e9b090ae00a1100daef4876a/src/include/duckdb/storage/table/row_group.hpp#L109-L116）、行157–162、行187–198（https://github.com/duckdb/duckdb/blob/80e17fc252edd6d9e9b090ae00a1100daef4876a/src/include/duckdb/storage/table/row_group.hpp#L157-L198）、`src/include/duckdb/storage/table/chunk_info.hpp` 行26–52（https://github.com/duckdb/duckdb/blob/80e17fc252edd6d9e9b090ae00a1100daef4876a/src/include/duckdb/storage/table/chunk_info.hpp#L26-L52）、`src/storage/table/column_data_checkpointer.cpp` 行117–152、行172–260（https://github.com/duckdb/duckdb/blob/80e17fc252edd6d9e9b090ae00a1100daef4876a/src/storage/table/column_data_checkpointer.cpp#L172-L260）、行284–299。`README.md` 行18。信頼性ラベル：primary（公式repositoryのheaderとコード）。本文確認：済
- 何をしているか：
  - row groupは、版情報（挿入・削除の情報）と、列ごとの `ColumnData` の並びを持つ（row_group.hpp 行109–116）。
  - 走査の前に、filterをrow group全体の統計（zonemap）と照らし、row group全体を読み飛ばせるかを判断する。segmentごとの統計でも読み飛ばす（行157–162）。
  - 追記は版情報へ行を足し、commitで確定し、取り消しで戻す。削除は版管理へ記録する（行187–198）。
  - 版情報はvector（row group内の行の小さな塊）単位で持ち、挿入id・削除idがすべての行で同じなら定数として、違えば行ごとの配列として持つ。削除側は「全部同じ」「一部削除でidは1つ（maskで表す）」「行ごとのid」の3状態に分ける（chunk_info.hpp 行26–52）。
  - checkpoint時に、列ごとに候補の圧縮方式すべてでanalyzeを走らせ、最終の評価値が最も小さい方式を選ぶ。適用できない方式は候補から外す（column_data_checkpointer.cpp 行172–254）。方式を強制する設定がある場合も、非圧縮だけは退避先として残す（行139–150）。変更のある列は、既存segmentを捨てて書き直す（行284–299）。
- 解いている問題と前提：分析queryは多くの行の少数の列を読む。列ごとに同じ型の値が並ぶので、dataに合わせた圧縮と統計による読み飛ばしが効く。更新・削除は版情報として持ち、checkpointでsegmentを書き直す（引用の範囲で確認できるのはこの構造まで）。更新・削除が少ない負荷を想定している、というのは本書の推論で、引用したREADME・header・checkpointerは負荷の頻度を前提として書いていない。checkpoint以前に更新が見えないという意味ではない。
- 必要な入力：queryが読む列と行の割合、filterに使う列、dataの分布（圧縮の効き方）、更新・削除の頻度、checkpointの契機。
- trade-off・失敗の仕方：変更のある列はcheckpointで書き直すので、細かい更新が多いと書き直しが増える（行284–299から読める構造。実際の負荷は本書では確かめていない）。どの方式も適用できなければ致命的なerrorとする（行258–260）。
- 反例・適用しない場合：Cassandra・RocksDB・TiKVは行（key/value）単位のLSMで、書込みを優先する（P19-O07、O11、O05）。CockroachDBは列をfamilyでまとめて1つの値に入れ、行単位の取り出しを優先する（P19-O01）。
- 互換・非互換：P19-O01と、列を「まとめる」か「分ける」かで対になる。P19-O10・O12（削除の表し方）とは、削除を版情報（MVCCの可視性）として持つ点で異なる。
- 限界：row groupやvectorの大きさ、評価値の式は持ち込まない。default branchが `v2.0-cyanoptera` で、開発中の版の構造である可能性がある。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 読み書きの形から保存の並びを決める | CockroachDB：行をKVへ写し、同時に使う列をfamilyで1つの値にまとめる（O01） | DuckDB：row group内で列ごとにsegmentを分け、統計で読み飛ばす（O14）。Cassandra：partitionとclustering keyで並びを設計時に固定する（O09） | 1行全体を読むか、多数行の少数列を読むか。問い合わせの形が前もって決まっているか |
| schemaの決まらないdata | CockroachDB：関係DBの中に文書型を置き、一部の項目を取り出す前提のencodingを選び、検索は転置indexで補う（O02） | Cassandra：joinを持たず、queryごとに非正規化したtableを作る（O09） | 項目が未知か既知か。queryの形が先に決まるか |
| 書込みの永続化と負荷の分離 | CockroachDB：consensus logを別engineへ分ける案（postponed）（O04） | TiKV：raft logは別engineのまま、状態機械のLSMをregionごとに分ける（O05）。Cassandra：commit logの同期方式（batch／periodic）を選ばせる（O07） | 書込みが同期か非同期か。読み書きが分割単位に閉じるか |
| LSMの増幅の調整 | Cassandra：tableごとにcompaction戦略を選ぶ（O08） | RocksDB：engine設定でcompaction方式と値の分離を選ぶ（O11） | 利用者にtable単位で見せるか、engine利用者の設定に置くか |
| compactionが追いつかないとき | RocksDB：engine内でwrite stall（O06の背景） | TiKV：RaftDBはwrite stallを外し、KvDBはL0・memtableのstallを外して待ちbytesのstallだけ高い閾値で残し、受付層で棄却率・AIMDで滑らかに絞る（O06）。Cassandra：flush待ちが閾値を超えると書込みを止める（O07） | latencyの急変を許すか。上位に再試行の仕組みがあるか |
| 削除 | Cassandra：tombstoneを追記し、猶予期間後のcompactionで消す（複製の遅れへの対策）（O10） | Prometheus：不変blockにtombstone fileを書き、blockの書き直しで消す（O12）。DuckDB：row groupの版情報に削除idを持つ（O14） | 複製が遅れて届くか。保存単位が不変か。MVCCで可視性を判定するか |
| 古い時系列の扱い | Prometheus：時間で区切ったblockを、時間・容量の保持でblock単位に消す（O12） | CockroachDB：汎用KVの中で縮約して低解像度で残す（O03）。Cassandra：TWCSで時間窓ごとのSSTableを丸ごと落とす（O08）。RocksDB：FIFOで最古のfileを消す（O11） | 古いdataを粗くしてでも残すか。時系列専用の保存か汎用KVか |
| 時刻の順序違い | Prometheus：headの最小有効時刻より古い・順序違いの書込みを拒否し、受け入れる場合は窓と別logを足す（O13） | Cassandra TWCS：拒否しないが、混ざると容量回収の利点を失う（O08） | 遅れて届くdataを捨ててよいか。blockの重なりをqueryが扱えるか |

## 見つからなかったこと・gap
- B-treeを採る保存engine（関係DBのheap＋B-tree index、埋込みのB-tree KV等）の設計文書は、今回の6 repoに含めていない。B-treeとLSMの対比は、Cassandraの文書の一文（P19-O07）でしか読んでいない。B-tree側が何を選び何を捨てたかは、別の観察が要る。
- CockroachDBの現行の保存engine（Pebble）への移行の判断は、`docs/RFCS/` のファイル名と本文の語（pebble）で探したが、移行そのものを扱うRFCは見つからなかった（Pebbleは別repositoryで、読んでいない）。
- Prometheus TSDBの原設計の説明はrepository外（README 14–18行目のlink先）で、primaryの基準に合わないため読んでいない。repository内には形式文書とコードしかなく、「なぜ時間で区切ったblockにしたか」を直接書いた設計文書は見つからなかった。
- DuckDBは、列指向を選んだ理由や圧縮方式の比較を書いた設計文書をrepository内に見つけられなかった（READMEの位置付けとheaderのcommentからの観察にとどまる）。
- 検索index（全文検索engine）、key-value cache、graph DBの保存方式は扱っていない。CockroachDBの転置index（P19-O02）とPrometheusのpostings（P19-O12）を読んだだけである。
- 6 repoとも、保存方式の選択を「業務要件（法令の保持、監査）」から導く記述は見つからなかった。Cassandraの文書が、請求書を当時の文書として保全するための非正規化に触れているだけである（P19-O09）。
- ADR形式の記録は、6 repoとも見当たらなかった。判断の根拠はRFC（CockroachDB、TiKV）、公式文書（Cassandra）、header comment（RocksDB、DuckDB）、形式文書（Prometheus）にある。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、sparse-checkoutで対象のdirectoryに絞って固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない。`gh api` はmetadata（default branch、HEADのcommit、SPDX、archived）の取得に使った。
- cockroach：`docs/RFCS/20151214_sql_column_families.md`（全体）、`20170605_dedicated_raft_storage.md`（1–140、239–503）、`20171005_jsonb_encoding.md`（1–90、221–246、見出し）、`20171020_inverted_indexes.md`（1–80、143–175、529–574、見出し）、`20160901_time_series_culling.md`（1–80、196–349、見出し）、`LICENSE`（冒頭）。ファイル名で探した語：`storage`、`pebble`、`rocks`、`column`、`inverted`、`engine`、`family`、`lsm`、`mvcc`、`json`、`time`。本文で探した語：`pebble`、`leveldb`、`b-tree`、`btree`、`columnar`、`lsm`。読んでいないもの：`20170601_raft_sstable_sideloading.md`、`20150729_segmented_storage.md`、`20170925_jsonb_scope.md`、`pkg/` 配下の実装すべて。
- tikv/rfcs：`text/0093-rocksdb-per-region.md`（全体）、`text/0067-substitute-rocksdb-write-stall.md`（全体）、`text/` の一覧。読んでいないもの：`0082-dynamic-size-region.md`、`0044-versioned-kv.md`、`0110-periodic-full-compaction.md`、`media/` の図、tikv/tikv本体。
- cassandra：`doc/modules/cassandra/pages/architecture/storage-engine.adoc`（全体）、`developing/data-modeling/data-modeling_rdbms.adoc`（1–140）、`managing/operating/compaction/overview.adoc`（76–100の範囲）、`twcs.adoc`（1–40）、`tombstones.adoc`（1–60）、`partials/default-compaction-strategy.adoc`・`partials/ucs-recommend.adoc`（全体、照合担当の指摘後に読んだ）。探した語：`storage`、`cep`、`query`、`denormal`、`join`、`strategy`、`workload`、`time series`。読んでいないもの：`ucs.adoc`、`lcs.adoc`、`stcs.adoc`、`architecture/dynamo.adoc`・`guarantees.adoc`、`data-modeling_*.adoc` の他のfile、`src/` の実装、`BtiFormat.md`。
- rocksdb：`README.md`（1–29）、`include/rocksdb/advanced_options.h`（20–40、71–100、1060–1100）、`COPYING` と `LICENSE.Apache` の冒頭。探した語：`CompactionStyle`、`FIFO`、`enable_blob_files`、`min_blob_size`。読んでいないもの：`docs/_posts`（blog記事のため根拠にしない）、`docs/_docs`、`db/` 等の実装、GitHub wiki（repository外）。
- prometheus：`tsdb/README.md`（全体）、`tsdb/docs/usage.md`（全体）、`tsdb/docs/format/README.md`、`index.md`（1–40）、`tombstones.md`（全体）、`chunks.md`（1–40）、`head_chunks.md`（1–40）、`tsdb/db.go`（195–206、305–320、1365–1400、2240–2360、2800–2835）、`tsdb/block.go`（610–700）。探した語：`retention`、`OutOfOrder`、`out-of-order`、`BlockRanges`、`deletable`、`Delete`、`CleanTombstones`、`ErrOutOfOrderSample`。読んでいないもの：`compact.go`、`head*.go` の本体、`ooo_head*.go`、`docs/format/wal.md`・`memory_snapshot.md`、`docs/bstream.md`、READMEのlink先（repository外）。
- duckdb：`README.md`（18行目付近）、`src/include/duckdb/storage/table/row_group.hpp`（105–200）、`chunk_info.hpp`（24–56）、`column_data.hpp`・`update_segment.hpp`・`column_data_checkpointer.hpp`・`optimistic_data_writer.hpp` のcomment行、`src/storage/table/column_data_checkpointer.cpp`（112–300）。探した語：`analyze`、`best`、`score`、`forced`。読んでいないもの：`src/storage/compression/` の各方式、`write_ahead_log`、`single_file_block_manager`、`update_segment.cpp` の本体、公式サイトの文書（repository外）。
- 選ばなかった候補：tikv/tikv（metadataのみ）、cockroachdb/pebble、PostgreSQL・SQLite（B-tree側。今回は6 repoで量の上限に達したため読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：RFC（CockroachDB、TiKV）は提案時点の設計で、Status（completed／accepted／postponed／in progress）が実装との距離を示す。P19-O04はpostponedで、採られなかった案である。採られなかった案を反例とするか、検討の履歴とするかは未決。公式文書（Cassandra）、header comment（RocksDB、DuckDB）、形式文書とコード（Prometheus）は由来の種類がそれぞれ違い、記録の仕方は未決。
- scope：観察は保存engineとdata modelの境界に限っている。HELIXのD06で、保存方式の比較を「業務dataの設計」に当てるか、「HELIX自身の状態の保存」（旧のSQLite、file）に当てるかは未決。D06 §6の「適用scopeに保存方式・規模を持たせるか」の問いに、本書は外部の実例を足すだけである。
- 評価根拠：HELIXでの成功・失敗の証拠はない。RFCに含まれる計測結果は本書に持ち込んでおらず、評価根拠にもしていない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。DuckDBはdefault branchが開発版の名前であり、Cassandraのcompaction戦略は、文書上は既定（STCS）と推奨（UCS）を分けて書いているが、実装の既定は確認していない（P19-O08）。再観察の要否と、文書と実装が食い違うときの扱いは未決。
- 状態：全観察（P19-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
