# P26 B-tree・WAL・MVCCを採る保存設計の観察（D06 Data / Database）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、容量、page寸法、件数、間隔、比等）は持ち込まない。製品の性能値・benchmark値も持ち込まない（README等に書かれた数値も写していない）。技術選定・採用推奨・優劣の結論ではない。

埋めるgap：[SCF-B-0155 D06](../../brain-domain-material-inventory-20261004/materials/D06-data-database.md) §4「保存方式の比較（関係DB、document、key-value、時系列、検索index等）と適用条件」のうち、第3弾の[P19](P19-storage-model-choice.md)がLSM側に偏り、B-treeを採る保存engineの設計文書を読めなかった部分（P19 §見つからなかったこと）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| postgres/postgres | https://github.com/postgres/postgres | 3ff475ac12ec8d8d07cf3fd86144659285a59d83（default branch: master） | NOASSERTION（`COPYRIGHT`冒頭：「PostgreSQL Database Management System … Portions Copyright (c) 1996-2026, PostgreSQL Global Development Group … Permission to use, copy, modify, and distribute this software and its …」） | false | 2026-10-05 | 関係DBのheap＋B-tree index＋WAL＋MVCCの組合せ。`access/nbtree/README`、`access/heap/README.HOT`、`access/transam/README`という設計READMEがsource treeにあり、分割・削除・並行制御・回復・可視性・vacuumを設計者の言葉で読める。GitHub上のrepositoryは公式のmirrorである |
| sqlite/sqlite | https://github.com/sqlite/sqlite | e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e（master） | NOASSERTION（`LICENSE.md`冒頭：「License Information … SQLite Is Public Domain」） | false | 2026-10-05 | 単一fileのDB。rollback journalとWALの2つのjournal方式を同じpagerの上に持ち、不変条件と状態機械をsource commentと`doc/`に書いている。GitHub上のrepositoryは公式Fossil repositoryのmirrorである（`README.md` 行19–25） |
| etcd-io/bbolt | https://github.com/etcd-io/bbolt | 4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6（main） | MIT | false | 2026-10-05 | 埋込みのB+tree key-value store（Go）。WALを持たず、copy-on-writeと2枚のmeta pageでatomic commitを行う。WALを採る2 repoとの対照になる。READMEに他DBとの比較と制約が書かれている |
| wiredtiger/wiredtiger | https://github.com/wiredtiger/wiredtiger | e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7（develop） | NOASSERTION（`LICENSE`冒頭：「Copyright (c) 2014-present MongoDB, Inc. … either version 2 or version 3 of the GNU General Public License」）。copyleftのため構造の観察だけにした | false | 2026-10-05 | in-placeで上書きしない（no-overwrite）B-treeに、checkpoint、任意のWAL、古い版を別tableに置くhistory storeを組み合わせる。`src/docs/arch-*.dox`に設計文書がある。heapを上書きするPostgreSQLとの対照になる |

## 観察

### P26-O01 右隣へのlinkとhigh keyで、並行するpage分割を検出する（Lehman & YaoのB-tree）
- 出典：postgres、`src/backend/access/nbtree/README` 行6–49（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L6-L49）、行57–110（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L57-L110）、行112–164（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L112-L164）。信頼性ラベル：primary（公式source repositoryの設計文書）。本文確認：済
- 何をしているか：
  - 各pageに右隣のpageへのlink（right-link）と、そのpageに置けるkeyの上限（high key）を持たせる。下りてきた検索は、検索keyがhigh keyより大きければ並行して分割されたと判断し、right-linkを辿る（行17–29）。
  - keyを各levelで一意にするため、heapのTIDを同順位の決着に使う（行42–49）。
  - 原典のL&Yとの違いとして、in-memoryのbufferを複数backendで共有するので、pageを読む間だけpage単位のread lockを取る（行63–68）。逆方向のscanのためleft-linkも持ち、分割時に元の右隣のleft-linkも更新する（行75–86）。
  - index scanはleaf page上の一致をまとめてbackend側へ写し、page lockを持たずにheapを読む。項目は既存のpage境界を越えて移動しないので、scanはpageの「間」で止まっていても取りこぼしも重複もしない（行88–104）。
  - lockは原則として次のpageを取る前に離す。右または上へ動くときだけ次を取ってから離すことを許し、左または下へは許さない（deadlockを避けるため）（行106–110）。
  - 根の分割は他のpageと同じ手順で行い、meta-data pageの根pointerを差し替える。古い根を読んだ検索もright-linkで追いつける（行112–123）。
  - 親の場所を上昇時にpivotの区切りkeyではなく子のblock番号で探すことで、同じlevelでのlock結合を省く。楽観的なLanin & Shashaの方式と比べ、親子のlockを保守的に結合する方を「はるかに単純」として選んでいる（行139–156）。
  - 可変長keyのため、分割は件数ではなくbyte数を均すように行う（行158–164）。
- 解いている問題と前提：多数の読み手と書き手が同じB-treeを並行に使うときに、読み手が下りる途中でlockを持ち続けずに済むようにすること。page単位の物理lock（buffer lock）と、pageを共有するbuffer poolが前提である。
- 必要な入力：key順序（比較関数）、keyを一意にする決着属性、pageごとのlevel番号、meta-data pageの根pointer。
- trade-off・失敗の仕方：READMEは、原典にないread lockを取ることで「並行性を下げるが正しさを保証する」と書く（行67–68）。上昇時に根より上のlevelへ入る必要が出た場合は、根から下り直す（稀なため効率化しない、行125–137）。
- 反例・適用しない場合：bboltは書き手を1つに限り、読み手は古い版のpageを読むため、page単位のlockによる並行分割の検出を要しない（P26-O13）。WiredTigerのB-treeはin-memoryのpage構造に更新listを連ねる（P26-O14）。分割の並行制御は今回読んでいない。
- 互換・非互換：P26-O02（pageの削除）は同じright-linkの仕組みで並行する削除から回復する。P26-O04（分割を2つのWAL recordに分ける）はこのright-linkがあるから中間状態でも検索できる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。page寸法や1 pageあたりの件数等の値は持ち込まない。

### P26-O02 空になったpageを2段階で外し、参照し得る読み手がいなくなるまで再利用しない（half-deadとdrain）
- 出典：postgres、`src/backend/access/nbtree/README` 行232–328（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L232-L328）、行383–441（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L383-L441）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - pageの削除は、完全に空になったleaf pageからだけ始める。部分的に空いたpage同士の併合はしない（逆方向のscanが項目を見落とし得るため、行235–239）。各levelの最右pageは削除しない（行239–241）。
  - 第1段で、親から対象への下向きlinkを外し、対象のkey空間を右隣へ移し、対象をhalf-deadにする。以後の検索はhalf-deadのpageを無視して右へ進む（行247–259）。右隣が同じ親の子でない場合は親のkey空間が変わるため禁止する（行270–277）。
  - 第2段で、左隣、対象、右隣の順にlockを取り、横のlinkを付け替えて対象をdeletedにする（行279–282）。親の最後の子を消すときは、祖先へ遡って複数の子を持つ親を見つけ、そこから下の鎖ごと外す（行284–317）。
  - 削除したpageはすぐには再利用しない。参照し得る読み手が残る間はtombstoneとして横のlinkを保ち、読み手はそれを見て右へ進んで回復する（行319–325、386–392）。再利用してよいかは、削除時点のすべてのsnapshotが消えたかで判定する（Lanin & Shashaの「drain technique」）。削除したpageに次のtransaction番号を記し、それが全員から見えるようになったらfree space mapへ置く（行394–401）。
  - 新しく削除したpageを同じVACUUMの終わりに再判定できるようにした変更を、版の履歴として書いている（行403–424）。
- 解いている問題と前提：読み手がlevelの間でlockもpinも持たずに下りる設計（P26-O01）では、読み手が無関係に再利用されたpageに着くと誤った結果を返す。削除と再利用を分け、再利用を読み手の消滅に結びつける（行426–435）。
- 必要な入力：pageの状態（live、half-dead、deleted）、削除時点のtransaction番号、全snapshotのうち最も古いもの（P26-O09のxmin horizon）。
- trade-off・失敗の仕方：判定は「必要以上に強い」が実装が単純だと書く（行394–396）。副作用として、次にXIDを割り当てるtransactionがcommitするまでに取られたsnapshotも待ち、snapshotを持たない実行中のXIDも待つ（行399–401）。部分的に空いたpageは併合しないため、空き領域の再利用は空になったpageに限られる。
- 反例・適用しない場合：bboltは古いpageをpending listに置き、最も古い読み取りtransactionより前のものだけを解放する（P26-O13）。同じ「読み手がいなくなるまで再利用しない」を、page tombstoneではなくtransaction番号の集合で表す。WiredTigerは、古いcheckpointが参照するblockを、そのcheckpointが消えるまで再利用しない（P26-O14）。
- 互換・非互換：P26-O01のright-linkが前提。P26-O04（中断した削除は次のVACUUMが続ける）と組み合わさる。P26-O09（horizonの計算）に依存する。
- 限界：再利用までの期間等の値は持ち込まない。

### P26-O03 indexの項目の削除を、VACUUMとの干渉回避と「既知の死」の印による遅延削除に分ける
- 出典：postgres、`src/backend/access/nbtree/README` 行166–230（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L166-L230）、行443–472（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L443-L472）、行510–543（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L510-L543）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - VACUUMはleafの項目を消す前に、そのpageの「cleanup lock」（他にpinがない状態）を取る。目的はB-tree自体の正しさではなく、heap側のTID（行の位置）がVACUUMにより再利用されることに備えていないindex scanとの干渉回避である（行169–181）。pinを保たないscanもあるので、VACUUMは削除対象のないleafも含めてすべてのleafでcleanup lockを取る（行195–202）。
  - 大半のindex scanはpinを保たずにheapを読み、代わりにMVCC snapshotで誤った結果を防ぐ。この場合TIDの再利用自体は防げない（行448–459）。index-only scanはpinを離せない。visibility mapだけを見るため、TIDが再利用されたことに気づけないからである（行461–472）。
  - VACUUMはindexを物理順に線形scanする。scan中の分割で、未読の項目が読み終えた低い番号のpageへ移る場合に備え、各pageに「vacuum cycle ID」を置く。開始後に分割され、right-linkが低い番号を指すpageに出会ったら、一時的にそちらを辿る（行207–230）。この判定は偽陽性を許し、偽陰性を許さない（行227–230）。
  - 読み手がheapの行を全員にとって死んでいると知ったら、index側の項目にLP_DEADの印を付ける（行513–518）。印を付けるのはplain index scanだけで、bitmap scanでは付けない。heapとindexを同期して訪れるのはplain scanだけだからである（行518–520）。印はshare lockで付けられ（heapのhint bitに似る）、物理的な削除はexclusive lockで後でまとめて行う（行525–532）。削除時のWAL recordには、standbyでの衝突判定に使うhorizonを載せる（行530–534）。
- 解いている問題と前提：heapとindexが別構造で、indexがheapの位置（TID）を指す設計では、heapの行の回収とindexの項目の回収を同期しないと、indexが無関係な行を指す。全件をVACUUMで掃除すると費用が大きいので、読み手が得た知識を印として残し、分割の前に安く消す。
- 必要な入力：heapの行の可視性（P26-O09）、pageのpin・lockの状態、vacuum cycle ID。
- trade-off・失敗の仕方：pinを保つ方式は「かなり粗い」ので、できるだけ避けると書く（行183–187）。pinを長く保つと、idleなcursorがVACUUMを長時間止め得る（行450–454）。線形scanでは項目を2度見ることがあり、件数の統計が不正確になり得る（行224–227）。
- 反例・適用しない場合：HOT（P26-O08）は、indexの項目を増やさない更新の範囲でpage内だけの回収を可能にし、この同期の費用を避ける。WiredTigerはindexとheapを分けた構造ではなく、各tableをB-treeで持つため、TIDの再利用という問題は今回読んだ文書には現れない。
- 互換・非互換：P26-O10（VACUUMの3 phase）のphase IIがこのindex掃除である。P26-O01の「scanはpageの間で止まる」性質が、LP_DEADの項目をすぐ消してよい根拠になる（行525–527）。
- 限界：bottom-up deletion（行556以降）とdeduplicationは見出しと冒頭だけを読んだ。

### P26-O04 複数pageにまたがる変更を、それぞれ単独で整合する原子的なWAL recordの列に分け、中断を次の操作で完了させる
- 出典：postgres、`src/backend/access/nbtree/README` 行620–700（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/nbtree/README#L620-L700）、`src/backend/access/transam/README` 行471–486（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/README#L471-L486）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 分割を伴う挿入は、そのlevelの変更（右隣のleft-link更新を含む）を1 recordにし、親への挿入を別のrecordにする（nbtree README 行633–637）。分割した左pageにINCOMPLETE_SPLITの印を付け、親への挿入と同時に印を消す（行666–672）。
  - 2つのrecordの間でcrashすると親からの下向きlinkが欠けるが、検索は左隣のright-linkで見つけるので正しく動く（行642–647）。欠けたlinkは、次にその場所へ挿入する操作が見つけたときに作る（行652–655）。
  - VACUUMで直さない理由として、linkを足すのに分割が要り得て、空き容量不足でVACUUMが失敗すると、容量を空けるためのVACUUMが終わらなくなることを挙げる（行656–661）。
  - pageの削除も、half-deadにする段と横のlinkを外す段を別recordにし、中断したら次のVACUUMが続ける（行688–692）。
  - 版の履歴として、以前はrecovery末尾で未完了の分割・削除を完了させていたが、recoveryが複雑になり、crash回復の場合しか直らなかったため、次の挿入やVACUUMで遅延して直す方式に改めたと書く（行694–700）。
  - transam/READMEは同じ考えを一般規則として、中間状態は自己整合でなければならず、replayがどの2つのrecordの間で止まっても系が完全に機能すること、と書く（行471–474）。
- 解いている問題と前提：lockの都合で1つのWAL recordにできない多段の構造変更を、crashや空き容量不足などの途中失敗から安全にする。検索が中間状態でも正しく動くこと（P26-O01）が前提である。
- 必要な入力：中間状態を示すpage上の印、中間状態を見つけた操作が完了させる手順。
- trade-off・失敗の仕方：欠けた下向きlinkが多いと性能が落ちる（行646–647）。未完了の分割をもう一度分割すると、親の挿入位置を見つけられない（行647–650）ため、見つけた時点で完了させる必要がある。
- 反例・適用しない場合：bboltは変更をcommitでまとめて新しいpageへ書き、meta pageの差し替えで一度に見せる（P26-O13）ため、中間状態を外に見せない。SQLiteのrollback journalも、journalから元の内容に戻すことでtransaction単位の原子性を得る（P26-O11）。
- 互換・非互換：P26-O05（WALの基本規則）の上に立つ。P26-O02（2段階の削除）と同じ型である。
- 限界：WAL recordの形式（`Constructing a WAL record`、transam README 行489以降）は読んでいない。

### P26-O05 dataのpageを書く前にWALを永続化させる規則を、pageのLSNとbuffer管理で強制し、checkpoint後の最初の変更でpage全体を記録する
- 出典：postgres、`src/backend/access/transam/README` 行399–469（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/README#L399-L469）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - WALの目的をcrash回復とし、point-in-time recoveryとlog shippingによるhot standbyにも使えると書く（行402–405）。
  - 各data page（heap・index）に、そのpageに影響した最新のWAL recordの位置（LSN）を記す。buffer管理は、dirtyなpageを書き出す前に、そのLSNまでWALをflushしたことを確かめる（行407–415）。この照合は共有buffer管理にだけあり、一時table用のlocal bufferにはないので、一時tableの操作をWALに記録してはならない（行416–418）。
  - replay時は、pageのLSNがrecordの位置以上なら適用済みと判定する（行420–422）。
  - pageの書込みが原子的であるという仮定は実際には成り立たないことが多いので、checkpoint後にそのpageへ影響する最初のrecordにpage全体の写しを入れ、replayではその写しで復元する。「checkpoint後の最初の変更」は、pageの旧LSNが直近のcheckpointのredo位置より前かで判定する（行424–435）。
  - WALを伴う操作の手順を、bufferのpinとexclusive lock、critical sectionの開始、bufferへの変更、dirtyの印、WAL recordの挿入とpageのLSN更新、critical sectionの終了、lockの解放の順で定める（行437–469）。critical section内の誤りはPANICにする。共有bufferに未記録の変更が残り、それをdiskへ出してはならないからである（行442–446）。
- 解いている問題と前提：変更をdata pageへ即時に書かずに、WALだけを先に永続化してcommitを速くしつつ、crash後にWALのreplayで整合状態へ戻すこと。部分書込み（torn page）が起こり得ることを前提にする。
- 必要な入力：pageごとのLSN欄、直近のcheckpointのredo位置、buffer管理がWALのflush位置を参照できること。
- trade-off・失敗の仕方：page全体の写しはWALの量を増やす代わりに、data storage自体よりも信頼できる（recordのCRCで検査できる）と書く（行432–433）。critical section内の失敗はprocess単位ではなくPANICになる。
- 反例・適用しない場合：bboltはWALを持たず、copy-on-writeの新しいpageを書いてfsyncし、その後でmeta pageを書いてfsyncする2段の書込みで同じ問題を解く（P26-O13）。SQLiteのrollback journalは、変更前の内容をjournalへ書いて同期してからdatabase fileを上書きする（P26-O11）。WALとは記録の向き（変更後か変更前か）が逆である。WiredTigerはblockを上書きしないので、page全体の写しという手段を要しない（P26-O14）。
- 互換・非互換：P26-O06（WALを書かないhint）、P26-O07（checkpointのredo位置）と対になる。
- 限界：WAL segmentの大きさ、flushの間隔等の値は持ち込まない。

### P26-O06 WALを書かない変更（hint）と、commit時にWALのflushを待たない選択（非同期commit）を、規則の例外として明示する
- 出典：postgres、`src/backend/access/transam/README` 行629–664（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/README#L629-L664）、行777–830（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/README#L777-L830）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - crash後に再構成できる情報で、性能のためだけに書く情報（hint）は、WAL recordなしでdata pageに書いてよい。そのときは`MarkBufferDirtyHint()`でdirtyにする（行632–636）。checksumが有効でbufferがcleanなら、部分書込みに備えてpage全体の写しのrecordを入れる（行638–641）。WAL recordを省くなら`MarkBufferDirty()`を必ず置き換えよ、と書く（行644–646）。
  - heap pageのall-visibleの印は、visibility mapのbitが立つならpage側の印も立つ、という不変条件を持ち、消すときは常に永続的な変更として扱う（行648–656）。条件によってはpageのLSNを更新してはならない理由も書く（行658–664）。
  - 非同期commitでは、commit recordのflushを待たずにLSNを共有memoryに記して先へ進む。abort recordはflushしない（crash後はabortとみなされるので）（行780–787）。relationを消すtransactionや、取消しできないfile systemの変更を伴うutility commandは同期commitを強制する（行789–794）。
  - 背景のwriterが定期的にWALを書き出し、非同期commitがdiskへ届くまでの最悪の遅れを、待ち時間の設定の倍数で上限付ける（行796–813。倍数と設定値は持ち込まない）。
  - 非同期commitでは、transaction状態のhint bitをWALより先にdiskへ出してはならない。commitのLSNまでWALがflushされていなければhint bitの設定を遅らせる（行822–830）。
- 解いている問題と前提：WAL規則（P26-O05）を全変更へ一律に当てると費用が大きい。再構成できる情報と、失われてもtransactionの意味が変わらない範囲を見分けて例外にする。
- 必要な入力：情報が再構成可能かの区別、checksumの有無、各transactionのcommit LSN、flush済みのWAL位置。
- trade-off・失敗の仕方：非同期commitは、crash時に直近のcommitを失い得る代わりにcommitの待ちを省く。hintを誤って`MarkBufferDirty()`のままにすると部分書込みの危険を招く（行644–646）。
- 反例・適用しない場合：WiredTigerは「commit-level」と「checkpoint-level」の永続性を対象ごとに選ばせ、flushを省く選択では、application crashには耐えるがsystem crashには耐えない、と段階を名前で分ける（P26-O14）。bboltはfsyncを省く`DB.NoSync`を、壊れた状態を残し得る唯一の例外として挙げる（README 行828–829、P26-O13）。
- 互換・非互換：P26-O05の例外として成り立つ。P26-O09（可視性判定がhint bitを更新する）と結びつく。
- 限界：設定名は出典の識別子として書いた。既定値は持ち込まない。

### P26-O07 online checkpointで、開始位置の印（redo record）と完了の印を分け、checkpoint中もWALの挿入を止めない
- 出典：postgres、`src/backend/access/transam/xlog.c` 行7641–7676（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/xlog.c#L7641-L7676）、行7967–7988（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/xlog.c#L7967-L7988）、`src/backend/postmaster/checkpointer.c` 行5–26（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/postmaster/checkpointer.c#L5-L26）。信頼性ラベル：primary（source codeのcomment）。本文確認：済
- 何をしているか：
  - shutdownでないcheckpointでは、何かをdiskへflushする前に、checkpointの論理位置に`XLOG_CHECKPOINT_REDO` recordを入れる。recoveryはそこからreplayを始める。全部を書き終えたら`XLOG_CHECKPOINT_ONLINE` recordを書き、先のredo recordを指す。これによりcheckpoint中も他のWAL recordを書ける（xlog.c 行7657–7666）。
  - shutdown時は並行するWAL挿入がないので、1つのrecordが完了の印とreplay開始位置を兼ねる（行7668–7672）。
  - checkpointの片側にまとまって起こるべき操作群（例：transactionの終了）がある。commit recordがredo位置の直前に入った場合、redo位置からのreplayではそのrecordを再生しないので、transaction状態の更新もflushに含める必要がある。そのため、commitのcritical sectionにいるbackendを待つ（行7967–7979）。commit recordの挿入とtransaction状態の更新が別のlockで守られた2段であることが、この問題の原因だと書く（行7985–7988）。
  - checkpointは専用processが行い、時間経過または要求で起動する。WAL segmentの充足による起動はbackendが合図する（checkpointer.c 行5–11）。checkpointerが予期せず落ちたら、postmasterはbackendのcrashと同じに扱い、残りのbackendを止めてrecoveryの周期を始める。第一の理由は、共有memoryが壊れているかもしれないことである。加えて、共有memoryが壊れていなくても、次のcheckpointでfsyncすべきfileの情報を失っているので、再起動を強制する必要があると補足する（行21–26）。
- 解いている問題と前提：checkpointを長く走らせても書込みを止めないこと。WALのreplay開始位置を、checkpointが書き終えた内容と矛盾しない位置に置くこと。
- 必要な入力：redo位置、commit中のbackendの集合（delayChkptFlags）、fsync待ちfileの一覧。
- trade-off・失敗の仕方：待つべきでないtransactionまで待つ「fuzzy」な判定を、挿入を長く止めるよりよいとして選んでいる（行7981–7984）。commentは、この関数が忙しい系では長時間かかり得ると書く（行7665–7666）。
- 反例・適用しない場合：SQLiteのWAL modeのcheckpointは、WALのframeをdatabase fileへ書き戻す（backfill）操作で、読み手の印が許す範囲までしか進めない（P26-O12）。WiredTigerのcheckpointはsnapshot isolationのtransactionの中で行い、dirty pageを新しいblockへ書いてmetadataを最後に更新する（P26-O14）。bboltには独立したcheckpointがない（commitごとにmeta pageを差し替える、P26-O13）。
- 互換・非互換：P26-O05（checkpoint後の最初の変更でpage全体を記録）がこのredo位置を使う。
- 限界：checkpointの間隔、完了目標の比等の値は持ち込まない。`CreateCheckPoint`の本体は、上記のcomment以外を読んでいない。

### P26-O08 indexの列を変えない更新を同じpage内の版の鎖にして、page単位で古い版を回収する（HOT）
- 出典：postgres、`src/backend/access/heap/README.HOT` 行6–50（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/README.HOT#L6-L50）、行53–140（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/README.HOT#L53-L140）、行199–282（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/README.HOT#L199-L282）、行439–445（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/README.HOT#L439-L445）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - page単位の回収は、回収する行を指すindex項目を探して消す費用のため通常は実用的でない。keyを再計算してindexを引く手もあるが、不変と称して実は不変でない利用者定義関数があると、index項目を見つけられずにindexが壊れる（行18–32）。
  - HOTは2つの限られた場合を扱う。indexが参照する列（部分indexの述語に出る列も含む）を変えない更新と、変えた列がblock単位の要約index（BRIN等）にだけ使われる更新である（行34–46）。
  - 新しい版を同じpageに置き、indexが参照する列が同じなら新しいindex項目を作らない。古い版に`HEAP_HOT_UPDATED`、新しい版に`HEAP_ONLY_TUPLE`の印を付け、indexは鎖の根のline pointerを指したまま、検索は鎖を辿る（行56–80）。
  - 古い版が誰にも見えなくなったら、根のline pointerを新しい版への転送（redirect）に変え、中間の版のline pointerは丸ごと消す（行82–111）。indexが参照する列が変わるか、同じpageに場所がなければ鎖は終わり、通常の更新になる（行113–122）。鎖をpageをまたいで延ばすとpage内だけで回収できる性質を失うので、しない（行116–121）。
  - prune（line pointerの短絡）とdefragment（空き領域を1か所へ寄せる）は、cleanup lockを待たずに取れた場合だけ行い、取れなければ先送りする（行228–239）。READMEは「現在予定しているheuristic」として、prune可能の印があり、空きが一定より少ないか、直前の更新が空き不足で失敗したpageに最初に触れたときに行う、と書き、規則は変わり得ると断っている（行254–259。比率等の値は持ち込まない）。READMEはこれを受けて、UPDATE、DELETE、SELECTが回収を起こし得るが、行を読まないINSERTでは起こらないことが多い（行270–274）。
  - 「死んだ行をline pointerだけに縮める」案は、以前line pointerの膨張を恐れて却下されていたと書き、上限で被害を抑える（行261–268）。
  - HOTは、indexのkeyを再計算するvacuum方式を将来にわたり閉ざすと書く（行442–445）。
- 解いている問題と前提：MVCCで更新ごとに新しい版を作るheapで、indexの列を変えない更新のたびにindex項目が増え、古い版の回収がindex全体のVACUUMを待つ問題。版の鎖をpage内に閉じることが前提である。
- 必要な入力：更新された列とindexが参照する列の集合、pageの空き、cleanup lockの取得可否、版の可視性（P26-O09）。
- trade-off・失敗の仕方：cleanup lockを取れないと、更新がHOTにならず別pageへ新しい版を置くことになる（行237–239）。更新中のqueryが古い版をpinしているので、更新の直前にdefragmentすることはできない（行241–247）。統計の扱いは「さらに手を入れる必要があるだろう」と書く（行288–298）。
- 反例・適用しない場合：WiredTigerは新しい版だけをuser tableに書き、古い版を別のhistory store tableへ移す（P26-O14）。古い版と新しい版を同じpageに並べない。bboltは更新のたびに経路上のpageをcopy-on-writeし、版はpage単位で表す（P26-O13）。
- 互換・非互換：P26-O03（index項目の回収）の費用を避ける手段である。P26-O10（VACUUM）はHOTの鎖の死んだ項目も同様に掃除する（行280–282）。
- 限界：CREATE INDEX（CONCURRENTLY）とHOTの鎖の関係（行301–436）は見出しと一部しか読んでいない。

### P26-O09 snapshotの取得とtransactionの終了を直列化し、全snapshotの下限（horizon）で古い版の回収可否を決める
- 出典：postgres、`src/backend/access/transam/README` 行224–339（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/transam/README#L224-L339）、`src/backend/access/heap/heapam_visibility.c` 行6–56（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/heapam_visibility.c#L6-L56）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 正しさの要件を「snapshot Aがtransaction Xをcommit済みとみなし、Xのいずれかのsnapshotがtransaction Yをcommit済みとみなしたなら、AもYをcommit済みとみなす」と定式化する（transam README 行241–244）。
  - 実際には、snapshotを取る間はどのtransactionも実行中集合から出られないという、必要より強いが単純な規則を強制する。snapshotの取得は共有lock、transaction終了時の解除は排他lockで行う（行246–257）。この制約はXIDを持つtransactionに限り、読み取り専用transactionはlockなしで終われる（行265–270）。XIDはtransaction開始時ではなく、必要になったときに割り当てる（行272–275）。
  - 各backendは自分のsnapshotのうち最小のxminを公開する。`ComputeXidHorizons`はそれと実行中のXIDの最小をとり、全系のsnapshotの下限を求める（行296–318）。snapshotの取得は性能上重要なので正確な計算をせず、「これより古い削除行は消せる」「これより新しい削除行は消せない」の2つの近似の境界を更新し、必要なときだけ正確な計算に戻る（行320–329）。horizonは「有効な下限」であればよく、並行する2回の計算が同じになる保証はない（行331–339）。
  - 可視性判定の関数群は、判定の途中でcommit・abortが分かればhint bitを更新する（heapam_visibility.c 行6–11）。非MVCC snapshotでは「実行中か」を「commit済みか」より先に確かめる。commitの記録とprocess配列からの除去の間に両方が真になる窓があるからである（行13–27）。abort判定は、crash時に実行中だったtransactionをabortとみなさない関数を使わず、消去法で決める（行29–31）。
  - 可視性の種類（MVCC、更新用、自身、dirty、vacuum用、TOAST用、全件）を別の関数に分けている（行38–56）。
- 解いている問題と前提：MVCCで、各読み手が一貫した版を見ることと、どの古い版がもう誰にも見えないか（回収してよいか）を決めること。transaction番号の単調増加と、共有memory上のprocess配列が前提である。
- 必要な入力：実行中XIDの集合、最後に完了したXID、各backendのxmin、commit・abortの永続記録（pg_xact）。
- trade-off・失敗の仕方：規則は「必要より強い」が単純で、他の問題にも役立つと書く（行248–250）。XIDやxminの読書きは原子的であることを前提にし、読み手は値を1回だけ読むよう注意を要する（行289–294）。古いsnapshotが残る限りhorizonが進まず、古い版を回収できない（この帰結はP26-O02・O10で使われる）。
- 反例・適用しない場合：bboltは書き手が1つで、読み手は開始時のmeta pageのtransaction番号を見るだけで可視性が決まる（P26-O13）。SQLiteのWAL modeでは、読み手は開始時のWALの最後のframe番号（mxFrame）を記録し、それ以降を無視することでsnapshotを得る（P26-O12）。WiredTigerはsnapshotに加えてtimestampで可視性を決め、古い版の回収をtimestampの下限（oldest timestamp）に結びつける（P26-O14）。
- 互換・非互換：P26-O02、P26-O08、P26-O10はこのhorizonに依存する。
- 限界：subtransactionとpg_subtrans（行148–222、342–397）は読んでいない。直列化可能分離（`storage/lmgr/README-SSI`）は読んでいない。

### P26-O10 VACUUMを状態機械として3 phaseに分け、使うmemoryに上限を置き、transaction番号の周回に備えて凍結を進める
- 出典：postgres、`src/backend/access/heap/vacuumlazy.c` 行6–36（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/vacuumlazy.c#L6-L36）、行38–119（https://github.com/postgres/postgres/blob/3ff475ac12ec8d8d07cf3fd86144659285a59d83/src/backend/access/heap/vacuumlazy.c#L38-L119）。信頼性ラベル：primary（source codeのcomment）。本文確認：済
- 何をしているか：
  - phase Iでheapのpageをscanし、行をprune・凍結し、死んだ行のTIDをTID storeに溜める。TID storeが満ちるか、scanが終わったらphase IIでindexから該当項目を消し、phase IIIでheapの該当項目を回収する（行6–13）。indexがなければphase IIを省き、死んだ項目がごく少ないか、周回を避けるfailsafeが作動したらphase II・IIIを省くことがある（行15–18）。
  - TID storeが満ちたら、phase Iを中断してII・IIIを行い、storeを空にして再開する（行20–22）。commentは、phaseは実際には状態機械の状態に近いと書く（行24–26）。死んだTIDの記録に使うmemoryに上限を置き、どれほど大きなrelationでも有限のmemoryでVACUUMできるようにする（行104–114）。
  - VACUUMには通常（normal）と積極的（aggressive）がある。積極的なVACUUMは、relfrozenxidを進めてtransaction番号の周回を避けるため、凍結されていない全行を見る（行44–46）。通常のVACUUMは、visibility mapで全可視とされたpageを飛ばせるが、次の積極的なVACUUMの負担を減らすため、一部を先回りして凍結する（eager scan）（行49–58）。先回りの成功数には全体の上限、失敗数には領域ごとの上限を置く（行64–87。率と領域の大きさは持ち込まない）。
  - pageのcleanup lockをすぐ取れなければ、通常のVACUUMはprune・凍結を飛ばしてよい。その場合、死んだ行とindex項目を取りこぼし得る（行92–97）。
  - 3 phaseの後、末尾の空pageでrelationを切り詰め、統計を更新する（行34–36）。
- 解いている問題と前提：MVCCで溜まる古い版を、index（P26-O03）とheapの両方から整合して回収すること。有限の番号空間を周回するtransaction番号のため、古い行を「凍結」しないと可視性判定が破綻するという前提がある。
- 必要な入力：horizon（P26-O09）、visibility map（全可視・全凍結のbit）、memoryの上限、relationごとの凍結済みの境界。
- trade-off・失敗の仕方：先回りの凍結は、次の積極的なVACUUMまでに再び凍結が外れれば無駄になる。上限はその損失を抑えるためと書く（行64–70）。cleanup lockを待たないことで進捗を優先し、取りこぼしを許す。
- 反例・適用しない場合：bboltには周回する番号の凍結という問題が現れない（今回読んだ範囲。古いpageは最古の読み手より前ならfreelistへ戻す、P26-O13）。WiredTigerでは、古い版はhistory storeにあり、checkpointが全員から見える範囲を超えたtombstoneだけのpageを消す（P26-O14）。
- 互換・非互換：P26-O03（phase IIの中身）、P26-O08（HOTのpruneと同じ関数）、P26-O09（horizon）に依存する。
- 限界：`SKIP_PAGES_THRESHOLD`等の定数と既定のmemory量は持ち込まない。並列index vacuum（`vacuumparallel.c`）、autovacuumの起動条件は読んでいない。

### P26-O11 単一fileのDBで、変更前の内容をrollback journalへ書いて同期してから上書きする（不変条件と、ERROR状態を持つpagerの状態機械）
- 出典：sqlite、`doc/pager-invariants.txt` 行1–76（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/doc/pager-invariants.txt#L1-L76）、`src/pager.c` 行14–30（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/pager.c#L14-L30）、行134–169（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/pager.c#L134-L169）、行280–342（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/pager.c#L280-L342）、行5165–5195（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/pager.c#L5165-L5195）。信頼性ラベル：primary（公式Fossil repositoryのmirror上の設計文書とsource comment）。本文確認：済
- 何をしているか：
  - pagerは、database fileとは別のjournal fileで原子的なcommitとrollbackを行い、file lockで書き手の排他と読み書きの排他を行う（pager.c 行14–19）。不変条件はrollback journalのときだけ成り立ち、WAL、memory、OFFのjournal modeには当てはまらない（行28–30）。
  - 「上書きしてよいpage」を、transaction開始時の内容がjournalへ書かれて同期済みであるか、開始時にfreelistの葉であったか、開始時のfile末尾より後のpageであるか、と定義する（pager-invariants.txt 行6–16）。pageは、同じsectorの全pageが上書きしてよい場合（または原子的なpage書込みの最適化が効く単一page変更の場合）に限り上書きする（行18–25）。
  - database fileへの全書込みを同期してから、journalを削除・切詰め・zero化する（行39–40）。journalの未同期の変更の任意の部分集合が失われても、rollback後のfileはtransaction開始時と論理的に同等である（行51–54）。fileは各transactionの開始と終了で整形式である（行69–70）。書く前にEXCLUSIVE lock、読む前にSHARED lockを要する（行72–76）。fileを変更したときは、EXCLUSIVE lockを離す前にheader内の特定範囲の少なくとも1 bitを変え、そのbit patternが一定の回数のtransaction内で繰り返さないことを定める（行62–67。byteの位置と周期の値は持ち込まない）。目的は原文に書かれていない（他の接続が変更を検出するためという読みは推論である）。
  - pagerは7状態（OPEN、READER、WRITER_LOCKED、WRITER_CACHEMOD、WRITER_DBMOD、WRITER_FINISHED、ERROR）の状態機械で、遷移ごとに担当する関数を図に書く（pager.c 行134–169）。
  - rollback中のIO errorなどで、memory上のcacheとfileの一致を確かめられなくなったらERROR状態に入る。READERへ戻ると以後の読み手が壊れたcacheを見て、書き手に昇格すればfileを壊し得るからである。全transactionが放棄されたらOPENへ戻り、cacheを捨て、次の読み取り開始時に必要ならhot journalのrollbackを行う（行282–307）。読み取り専用文でのmemory解放中の書込み失敗もERRORに入れる。b-tree層が読み取り専用文の失敗ではrollbackしないためである（行325–330）。
  - 「hot journal」（再生が必要なjournal）は、journalがあり、誰もRESERVED以上のlockを持たず、database fileが空でなく、journalの先頭が空でない場合とする（行5168–5175）。super-journalの欠如による偽陽性は再生処理が判定し直す（行5183–5188）。
- 解いている問題と前提：server processを持たない単一fileのDBを、複数processがfile lockだけで共有し、電源断やcrashでもtransaction単位の原子性を保つこと。VFSのsync（`xSync`）が書込みの壁として働くことが前提である（行1–4）。
- 必要な入力：sectorとpageの関係、syncの有無の設定、file lockの段階、journalのheader。
- trade-off・失敗の仕方：書き手は1つで、書込み中は読み手とも排他になる（lockの段階による）。syncを切る設定では「書いた時点で同期済み」とみなされ（行1–4）、保証の前提が変わる。
- 反例・適用しない場合：同じSQLiteのWAL modeは、変更前ではなく変更後のpageをWALへ追記し、読み手と書き手を並行させる（P26-O12）。pager.cは、WAL接続はWRITER_DBMODとWRITER_FINISHEDに入らないと書く（行340–342）。PostgreSQLはWAL（変更後の記録）で回復する（P26-O05）。bboltはjournalを持たず、copy-on-writeとmeta pageで同じ原子性を得る（P26-O13）。
- 互換・非互換：P26-O12と排他（同じfileはどちらかのjournal modeで使う）。
- 限界：`pager.c`の状態の詳細（行172–279）とjournalの形式は一部しか読んでいない。

### P26-O12 単一fileのDBのWAL：変更後のpageをframeとして追記し、読み手は開始時のframe位置で版を固定し、checkpointは読み手の印が許す範囲まで書き戻す
- 出典：sqlite、`src/wal.c` 行13–117（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/wal.c#L13-L117）、行127–151（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/wal.c#L127-L151）、行233–248（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/wal.c#L233-L248）、行340–392（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/src/wal.c#L340-L392）、`doc/wal-lock.md` 行22–71（https://github.com/sqlite/sqlite/blob/e8cbe2c96a69b2c674947f2efff4c7d1ada8b66e/doc/wal-lock.md#L22-L71）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - WALはheaderと0個以上のframeからなり、各frameは1 pageの変更後の内容を持つ。commitの印を持つframeを書いたときにtransactionがcommitする。WALの内容は定期的にdatabase fileへ書き戻す（checkpoint）（wal.c 行18–25）。WALは使い回し、checkpoint後は先頭から上書きする。frameに付けたchecksumとcounterで、有効なframeと過去の残りを区別する（行27–32）。
  - frameが有効なのは、frame headerのsaltがWAL headerのsaltと一致し、checksumがheaderから当該frameまでの連鎖計算と一致する場合に限る（行59–68）。checkpointのたびにsaltを変え、crash後に新旧のframeが同時に有効とみなされて一緒に書き戻されることを防ぐ（行95–98）。checkpointは、WALのsync、書き戻し、database fileのsyncの順で行い、syncを書込みの壁として使う（行89–93）。
  - 読み手は、pageをWALから探し、commit frameまたはその前にある最後の有効な版を読み、なければdatabase fileを読む（行102–108）。読み取り開始時にWALの最後の有効frameの番号（mxFrame）を記録し、以後はそれより後を無視するので、複数の読み手が異なる版を同時に見られる（行110–117）。
  - WALの探索を速くするwal-indexは共有memory（実装上はmmapしたfile）に置く。共有memoryを要するため、network file system上ではWAL modeを使えない（行129–133）。wal-indexは一時的で、crash後はWALから再構成する。そのため機種依存の形式でよい（行139–146）。項目は増える順に追加されるので、開始時期の異なる読み手が同じhash tableを各自の上限で読める。rollback時は上限を下げて項目を消す（行233–248）。
  - checkpointは、使用中の全読み手の印（aReadMark）以下のframeだけを書き戻せる。全frameが書き戻し済みなら、新しい読み手はWALを無視してdatabase fileだけを読む印を選ぶ（行372–382）。全frameが書き戻し済みで、WALを使う読み手がいなければ、書き手はWALを先頭へ戻して書き始める（行384–389）。書き戻しの試み数と完了数を分けて記録し、checkpoint中のcrashを区別する（行348–353）。
  - `doc/wal-lock.md`は、接続数が0から1になるときのrecovery、読み手、書き手、checkpointerが取るlockとその順序を書く（行22–71）。
- 解いている問題と前提：単一fileのDBで、読み手と書き手（1つ）を並行させること。全接続が同じmachineで共有memoryを使えることが前提である。
- 必要な入力：WAL header（salt、checkpoint番号）、frameごとのpage番号とcommit印、wal-index、読み手の印の配列、lockの順序。
- trade-off・失敗の仕方：WALを使う読み手が残る間はWALを先頭へ戻せず、checkpointも読み手の印より先へ進めない（行372–389。読み手が長く残るとWALが伸び続けるという帰結は、今回読んだcommentからの推論である）。wal-indexは、pageのframeがWALのどこにでも現れ得るため、WALが大きいと読み手のscanが遅くなる問題への対策である（行119–125）。network file systemでは使えない。
- 反例・適用しない場合：rollback journal mode（P26-O11）は共有memoryを要しないが、読み手と書き手を並行させない。PostgreSQLのWALはbuffer管理とpageのLSNで書き出しを制御し、checkpointはredo位置からのreplayを前提にする（P26-O05・O07）。bboltはWALを持たない（P26-O13）。
- 互換・非互換：P26-O11と排他。P26-O09と同じく「読み手が見ている版を消さない」ことを、snapshotではなくframe番号の印で表す。
- 限界：hash tableの寸法、係数、lock番号、header内の位置等の値は持ち込まない。checkpointの種類（PASSIVE、FULL、RESTART、TRUNCATE）の本体（`sqlite3WalCheckpoint`）は読んでいない。

### P26-O13 WALを持たないcopy-on-writeのB+tree：書き手を1つに限り、dirty pageを書いて同期してから2枚のmeta pageの片方を差し替える
- 出典：bbolt、`README.md` 行152–168（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/README.md#L152-L168）、行208–228（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/README.md#L208-L228）、行781–835（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/README.md#L781-L835）、行837–905（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/README.md#L837-L905）、行947–954（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/README.md#L947-L954）、`db.go` 行792–871（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/db.go#L792-L871）、行1141–1162（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/db.go#L1141-L1162）、`tx.go` 行193–271（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/tx.go#L193-L271）、`internal/freelist/shared.go` 行141–171（https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/internal/freelist/shared.go#L141-L171）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 読み書きtransactionは同時に1つだけで、読み取り専用transactionはいくつでも開ける。各transactionは開始時点の一貫した版を見る（README 行154–156）。`beginRWTx`は書き手lock（`rwlock`）を取って1つに限る（db.go 行845–847）。読み取り専用transactionはmmapの共有lockを取り、自分のtransaction番号をfreelistに登録する（行798–823）。
  - commitでは、削除のあったnodeを再均衡し、dirtyなnodeをpageへ書き出し（spill）、`NoFreelistSync`が無効のときだけ新しいfreelistを書き（有効なら書かない、tx.go 行219–227）、必要ならfileを伸ばし、dirty pageを書いてから、meta pageを書く（tx.go 行193–271）。READMEはこれを2段の書込みとして説明する。dirty pageを書いてfsyncし、次にtransaction番号を進めた新しいmeta pageを書いてもう一度fsyncする。crashしてもmeta pageが指さない部分書込みのpageは無視され、部分書込みのmeta pageはchecksumで無効になる（README 行947–954）。
  - 現在のmetaを得る`db.meta()`は、2枚のmeta pageのうちtransaction番号の大きい方が検証に通ればそれを使い、通らなければ前の方を使う（db.go 行1141–1157）。開くときだけでなく、transactionの初期化でmetaを写すとき（`tx.go` 行47–53、https://github.com/etcd-io/bbolt/blob/4dc08f7187c709d355a8bcf334fcbcf7d7cfedf6/tx.go#L47-L53）など、現在のmetaを得るたびに呼ばれる。
  - 書き手の開始時に、開いている最古の読み取りtransactionより前に解放されたpageを使用可能に戻し、読み手の番号の間の範囲も解放する（db.go 行870、shared.go 行141–158）。
  - `DB.Batch()`は並行するUpdateをまとめるが、一部が失敗すると関数を複数回呼ぶので、関数は冪等でなければならない（README 行221–228）。
  - READMEは、関係DB、LSM（LevelDB・RocksDB）、LMDBと比べた選択を書く。LSMはWALと多段の整列fileでrandom書込みを最適化し、boltはB+treeと単一fileを使う、両方にtrade-offがある（行802–807）。LMDBからの移植で、単一の書き手と複数の読み手によるlock-freeのMVCCを採る。性能のための危険な操作を許さず、例外は`DB.NoSync`だけとする（行821–829。README中の性能の数値は持ち込まない）。
- 解いている問題と前提：埋込みで単一processから使うkey-value storeで、WALなしにserializableなtransactionとcrash時の原子性を得ること。file全体へのexclusive lockで複数processの共有をしない（行857–858）。
- 必要な入力：2枚のmeta page（transaction番号、checksum、根とfreelistの位置）、freelist、開いている読み取りtransactionの番号。
- trade-off・失敗の仕方：
  - READMEは、読み中心の負荷に向き、random書込みは遅くなり得ると書く（行842–844）。copy-on-writeのため、長い読み取りtransactionが古いpageの回収を止める（行849–850）。
  - pageの配置上、fileを切り詰められず、大量に削除しても容量は戻らない（行886–891）。
  - mmapのremapは読み取りtransactionが開いている間できないため、同じgoroutineで入れ子にtransactionを開くとdeadlockし得る（行163–168）。
  - 初期化中の電源断で壊れ得ることを既知の制約として書く（行901–905。etcd-io/etcdのissueを参照しているが、本文は読んでいない）。
- 反例・適用しない場合：PostgreSQLはheapの行をpage内で更新し、WALで回復する（P26-O05・O08）。SQLiteは書き手1つという点は同じだが、rollback journalまたはWALでpageを上書きする（P26-O11・O12）。WiredTigerも上書きしないが、blockの再利用を古いcheckpointの消滅に結びつける（P26-O14）。
- 互換・非互換：P26-O02と同じ「読み手がいなくなるまで再利用しない」を、transaction番号の集合で表す。P26-O05のWAL規則とは代替関係にある。
- 限界：fill percent、page寸法、件数の目安等の値は持ち込まない。`node.go`の分割・再均衡の本体と`internal/freelist`の他の実装（hashmap・array）は読んでいない。

### P26-O14 上書きしないB-treeに、checkpoint・任意のWAL・古い版を別に置くhistory storeを組み合わせ、永続性を「committed／durable／stable」の段階で名付ける
- 出典：wiredtiger、`src/docs/arch-btree.dox` 行1–43（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-btree.dox#L1-L43）、行69–100（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-btree.dox#L69-L100）、`src/docs/arch-block.dox` 行7–16（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-block.dox#L7-L16）、行84–89（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-block.dox#L84-L89）、`src/docs/arch-checkpoint.dox` 行5–84（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-checkpoint.dox#L5-L84）、行143–151（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-checkpoint.dox#L143-L151）、`src/docs/arch-hs.dox` 行3–46（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-hs.dox#L3-L46）、`src/docs/arch-logging.dox` 行3–6、36–47（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-logging.dox#L3-L47）、`src/docs/durability-overview.dox` 行11–81（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/durability-overview.dox#L11-L81）、`src/docs/arch-rts.dox` 行3–40（https://github.com/wiredtiger/wiredtiger/blob/e7f693af4d3914b0a8525cf3a0eb4c1cfebc66d7/src/docs/arch-rts.dox#L3-L40）。信頼性ラベル：primary（公式source repositoryの設計文書）。本文確認：済。GPLのため構造の観察だけにした
- 何をしているか：
  - tableをB-treeで表し、根と内部pageはkeyと子への参照、葉はkeyと値を持つ。pageは設定の上限に達すると分割する。pageにはin-memoryとon-diskの2つの表現がある（arch-btree 行3–11）。葉の既存の項目への更新は更新listとして連ね、読み手のtimestampに応じて古い値や削除が見え得る（行37–43）。
  - blockを上書きしない（no-overwrite）。書き直すblockはfile内の新しい位置へ書く（arch-block 行13–14）。理由は、上書き中のcrashでblockの状態が不明になることである（行84–89）。
  - checkpointは、crash時に回復を始められる既知の時点で、snapshot isolationのtransactionの中で行う（arch-checkpoint 行5–13）。手順を、lockの取得、evictionによるdirty量の削減、prepare（transactionの開始と対象treeの収集）、data fileの各treeのdirty pageの書出し（reconcile）、history storeのcheckpoint（data fileの書出しがhistory storeへの書込みを生むので後にする）、fileのflush、metadataのcheckpoint（最後）に分ける（行29–84）。2つのcheckpointを保ち、最新の位置を別のfile（turtle file）に書く（行83–84）。全員から見える終了時刻を持つpageはcheckpoint中に削除可能と印を付けるが、古いcheckpointが参照する間は再利用しない（行145–151）。
  - history storeは、古い読み手のための過去の版を、最新版とは別の1つのtableに置く。user tableには最新の更新だけを書く（arch-hs 行3–12）。keyはtableの識別子、record key、開始timestamp、counterの組で、値に停止timestampを持つ。停止timestampが最古のtimestampより前で、停止transactionが全員から見えるとき、そのtombstoneは全員から見えるとみなされ、それだけを含むpageはcheckpointが消せる（行14–46）。
  - WAL（logging）は設定したときだけ使い、直近のcheckpoint以後の変更を回復するためにある（arch-logging 行3–6）。自動のlog削除は直近のcheckpointより前のlogを消すが、backup cursorやlog cursorが開いている間は止める（行36–47）。
  - 永続性を3段階で名付ける。commitが成功して返ればcommitted、全変更が安定な記憶に書かれればdurable、durableで、かつapplicationの分散transaction管理で取り消せなくなればstableである（durability-overview 行11–21）。永続性は「checkpoint-level」（次のcheckpointの完了でdurable）と「commit-level」（commit前にlogを書いてflush）から対象ごとに選び、flushを省けばapplication crashには耐えるがsystem crashには耐えない（行36–56）。stable timestampより新しいcommitは、durableでもまだ取り消し得る（行58–70）。
  - rollback to stable（RTS）は、stable timestampより新しい変更や、回復checkpointのsnapshotでcommitされていない変更を取り除き、on-diskの不安定な版を最新の安定な版で置き換える（arch-rts 行3–37）。RTSは排他的なaccessを要する（行39–40）。
- 解いている問題と前提：古い版を最新版と同じpageに置かずに長い読み手へ応え、上書きをせずにcrash時の整合を得ること。上位のapplication（分散transaction）がstable timestampを管理する前提がある（durability-overview 行11–14）。
- 必要な入力：stable timestampとoldest timestamp、checkpointの一覧とmetadata、history storeのkey（tableの識別子・key・timestamp）、対象ごとの永続性の設定。
- trade-off・失敗の仕方：durability-overviewは、保証を弱めるほどstorageとの往復が減る、と書く（行27–29）。arch-btreeは、range truncateが非transactionalであるという利用者向けの留保を、logを使うtreeでの2つの既知の不具合への備えとして残していると書く（行71–100）。上書きしないので、空いたblockがfile末尾になければcompactionが要る（arch-checkpoint 行150–151）。
- 反例・適用しない場合：PostgreSQLは古い版をheapの同じpageに置き（P26-O08）、pageを上書きしてWALで守る（P26-O05）。bboltは上書きしない点が近いが、checkpointを持たず、commitごとにmeta pageを差し替える（P26-O13）。
- 互換・非互換：P26-O09のhorizonに当たるものを、timestampとtransaction idの両方で表す。P26-O06の「同期の選択」を、対象ごとの永続性の段階として名前に出している。
- 限界：GPLのため構造の観察だけにし、codeは読んでいない。eviction（`arch-eviction.dox`）、timestamp model（`arch-timestamp.dox`、`timestamp-*.dox`）、snapshot（`arch-snapshot.dox`）、disaggregated storage（`arch-disagg-*.dox`）は読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| crash時の原子性（どの向きを記録するか） | PostgreSQL：変更後をWALに書き、pageのLSNでWALを先に永続化する（O05）。SQLite WAL：変更後のpageをframeとして追記する（O12） | SQLite rollback journal：変更前をjournalに書いて同期してから上書きする（O11）。bbolt：WALなしにcopy-on-writeと2枚のmeta page（O13）。WiredTiger：上書きしないblockとcheckpoint、WALは任意（O14） | pageを上書きするか。複数の書き手がいるか。checkpointの外の変更を回復する必要があるか |
| 部分書込み（torn page）への備え | PostgreSQL：checkpoint後の最初の変更でpage全体をWALへ（O05） | bbolt：meta pageのchecksumと2枚の切替（O13）。WiredTiger：上書きしない（O14）。SQLite：sector単位の上書き可否の不変条件（O11） | storageのpage書込みが原子的か。上書きするか |
| 読み手が見る版の固定 | PostgreSQL：snapshotとXIDの集合、取得と終了の直列化（O09） | SQLite WAL：開始時のmxFrame（O12）。bbolt：開始時のmeta pageのtransaction番号（O13）。WiredTiger：snapshotとtimestamp（O14） | 書き手が複数か1つか。版をどこに置くか（同じpage、WAL、古いpage、別table） |
| 古い版の置き場所 | PostgreSQL：heapの同じpageの版の鎖（O08） | WiredTiger：別のhistory store table（O14）。bbolt：copy-on-writeで残る古いpage（O13）。SQLite：WAL内の古いframe（O12） | 最新版の読みを速くするか、古い版の回収をpage内で閉じるか |
| 古い版・pageの回収の条件 | PostgreSQL：horizonより古いものをVACUUMとHOTのpruneで回収（O08・O09・O10）。index pageは削除時の番号が全員から見えたら再利用（O02） | bbolt：最古の読み取りtransactionより前を解放（O13）。SQLite：読み手の印を超えない範囲で書き戻し、WALを使う読み手がいなければ先頭へ戻す（O12）。WiredTiger：全員から見えるtombstoneだけのpageをcheckpointが消し、blockは古いcheckpointが消えるまで残す（O14） | 回収をbackgroundの掃除にするか、書き手・checkpointの処理に含めるか |
| B-treeの並行する構造変更 | PostgreSQL：right-linkとhigh key、page単位のread lock、親子のlock結合（O01） | bbolt：書き手1つでcommit時にまとめて分割・再均衡（O13） | 書き手の数。読み手が古い版を見るか、最新のpageを見るか |
| 多段の構造変更の中断 | PostgreSQL：段ごとに原子的なWAL record、途中の印を次の操作が完了させる（O04） | bbolt・WiredTiger：新しいpage・blockを書き、metaの差し替えで一度に見せる（O13・O14） | pageを上書きするか、metaの差し替えで切り替えるか |
| 永続性の選択 | PostgreSQL：非同期commit、hintのWAL省略、同期を強制する操作の列挙（O06） | WiredTiger：checkpoint-level／commit-level、committed／durable／stableの段階（O14）。bbolt：`NoSync`を唯一の例外とする（O13）。SQLite：syncを切ると前提が変わる（O11） | 取り消せない外部作用があるか。上位にtransaction管理があるか |

## 見つからなかったこと・gap
- B-treeとLSMを同じ観点で比べた設計文書は、4 repoのうちbbolt READMEの比較節（O13）にしか見つからなかった。PostgreSQLとSQLiteの設計READMEには、LSMを選ばなかった理由の記述は見当たらなかった。
- InnoDB（MySQL）のundo logによる版管理（古い版を別領域に置く方式）は、WiredTigerのhistory store（O14）と近いが、repositoryを読んでいない（mysql/mysql-serverはGPLで、今回は4 repoに留めた）。
- PostgreSQLの直列化可能分離（`storage/lmgr/README-SSI`）、行lock（`heap/README.tuplock`）、buffer管理（`storage/buffer/README`）は存在を確認しただけで読んでいない。MVCCの可視性のうち、行lockと更新の衝突の扱いは本書に含まれない。
- SQLiteのB-tree本体（`src/btree.c`）の分割・削除の設計は、source commentを読んでいない。SQLiteで観察したのはpagerとWALの層だけである。
- 4 repoとも、ADR形式の設計記録は見当たらなかった。判断の根拠は設計README、source comment、`.dox`文書にある。版の履歴（PostgreSQL 14での変更、9.4以前の方式）はREADMEの本文に書かれていた（O02・O04）。
- failureの根拠としてissueを読んでいない。bboltのREADMEが挙げる既知の問題（etcd-io/etcd #16596、etcd-io/bbolt #562・PR #611・#726）は、READMEの記述だけを確認し、issue・PRの本文は読んでいない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：4 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し、固定commitをcheckoutした（hooksPathを無効化）。postgresとwiredtigerはsparse checkoutで設計文書と一部のsourceだけを取り出した。読むだけで、build・test・script・hookは実行していない。metadataは`gh api repos/<owner>/<repo>`で取得した。
- postgres：`src/backend/access/nbtree/README`（1–330、383–560、620–700、見出し一覧）、`src/backend/access/heap/README.HOT`（1–140、199–300、436–448、見出し一覧）、`src/backend/access/transam/README`（224–345、399–488、629–666、777–830、見出し一覧）、`src/backend/access/heap/vacuumlazy.c`（1–140）、`src/backend/access/heap/heapam_visibility.c`（1–75）、`src/backend/postmaster/checkpointer.c`（1–45）、`src/backend/access/transam/xlog.c`（7641–7678、7965–7990、`redo point`のgrep結果）、`COPYRIGHT`（冒頭）、`README.md`（冒頭）。読んでいないもの：nbtree READMEの`Page deletion and backwards scans`以降の一部（330–382）、bottom-up deletion・suffix truncation・deduplication（556以降、771–1082）、`Scans during Recovery`（702–770）、transam READMEのsubtransaction・pg_xact・WAL record構築・REDO・file system操作（148–222、342–398、489–628、666–776、887以降）、`README.tuplock`、`README-SSI`、`storage/buffer/README`、`storage/freespace/README`、各`.c`の本体。
- sqlite：`doc/pager-invariants.txt`（全体）、`doc/wal-lock.md`（全体）、`src/wal.c`（1–300、335–400、`starv`・`sqlite3WalCheckpoint`のgrep結果）、`src/pager.c`（14–30、130–175、280–345、5160–5200、`journal`のgrep結果）、`LICENSE.md`（冒頭）、`README.md`（mirrorの記述）。読んでいないもの：`src/btree.c`、`src/pager.c`のjournal形式と状態の詳細（172–279）、`src/wal.c`のcheckpoint・recoveryの本体、`doc/vfs-shm.txt`、`doc/F2FS.txt`。
- bbolt：`README.md`（152–250、781–980、見出し一覧）、`db.go`（792–880、1135–1170）、`tx.go`（170–290、594–625）、`internal/freelist/shared.go`（136–171、`readonlyTXIDs`のgrep結果）。読んでいないもの：`node.go`、`bucket.go`、`cursor.go`、`compact.go`、`internal/freelist`のhashmap・array実装、`page-allocation`のissue comment（README 行893・907が参照する旧boltdb/boltのissue）。
- wiredtiger：`src/docs/arch-btree.dox`（全体）、`arch-checkpoint.dox`（全体）、`arch-hs.dox`（1–80）、`arch-logging.dox`（1–60）、`arch-transaction.dox`（1–70）、`arch-rts.dox`（1–40）、`arch-block.dox`（5–20、80–95）、`durability-overview.dox`（全体）、`LICENSE`（冒頭）。`arch-transaction.dox`は観察の出典にしていない（lifecycleの図の確認のみ）。読んでいないもの：`arch-eviction.dox`、`arch-snapshot.dox`、`arch-timestamp.dox`、`timestamp-*.dox`、`arch-concurrency.dox`、`arch-disagg-*.dox`、`src/`のcode全体（GPLのため）。
- 検索した語：`Lehman`、`high key`、`right-link`、`half-dead`、`drain`、`cleanup lock`、`LP_DEAD`、`INCOMPLETE_SPLIT`、`LSN`、`full page`、`hint`、`asynchronous commit`、`redo point`、`REDO`、`horizon`、`xmin`、`wraparound`、`freeze`、`hot journal`、`rollback journal`、`mxFrame`、`aReadMark`、`nBackfill`、`starv`（wal.c、該当なし）、`meta`、`freelist`、`ReleasePendingPages`、`no-overwrite`、`overwrite`、`history store`、`stable`、`tombstone`。
- 選ばなかった候補：mysql/mysql-server（InnoDBのundo log。GPLで、今回は4 repoに留めた）、LMDB（bboltのREADMEが移植元と書く。GitHub上の公式repositoryを確認していない）、cockroachdb/pebble・facebook/rocksdb（LSM側。P19で扱った）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。設計README・`.dox`文書（設計者の説明）と、source codeのcomment（実装の近くの説明）を区別して出典に書いたが、BRAINでこの2つの強さを分けるかは未決。PostgreSQLとSQLiteはGitHub上のmirrorから読んだ。mirrorを一次の出典とみなす扱いも未決。
- scope：観察は単一nodeの保存engineの内部（page、WAL、版、回収）に限る。P19（保存方式の比較）とP03（分散dataの整合性）との境界、つまり保存engineの内部の知識を、HELIXのD06のどの層（schema設計、運用、選定）へ対応させるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。PostgreSQLのREADMEは、版ごとの方式の変化（O02のPostgreSQL 14、O04の9.4以前）を本文に書いている。製品のrelease版とcommit SHAのどちらを主キーにするかは未決。
- license：SPDXが`NOASSERTION`のもの（postgres、sqlite、wiredtiger）は、LICENSE・COPYRIGHT fileの冒頭の文言を併記した。WiredTigerはGPLのため構造の観察だけにした。
- 状態：全観察（P26-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
