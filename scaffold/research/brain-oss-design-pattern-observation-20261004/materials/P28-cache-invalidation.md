# P28 cacheの無効化方式の比較の観察（D01 Software Architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、期間、回数、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：SCF-B-0155 D01 §4「性能の構造（cache、索引、N+1、負荷の集中点）をarchitectureの判断として扱う知識」のうち、第3弾P17の§見つからなかったこと・gapに残った「書込み時の無効化、TTL、stale-while-revalidate、版付きkeyといった無効化の方式を実装として比べられるrepoは、今回の5本には含まれていない」。本書は、TTL、書込み時の無効化、tag・依存による無効化、stale-while-revalidate、版付きkey、cache stampedeの防止が、どの入力で何を決め、失敗するとどうなるかを観察した。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| rails/rails | https://github.com/rails/rails | 4088f9d2ef00f9b85493362fb6f4b2526bd5d314（default branch: main） | MIT | false | 2026-10-05 | server側のkey-value cacheで、entry単位のTTL、版付きkey（`cache_version`による再利用可能なkey）、templateのdigestをkeyに含める方式、`touch`による入れ子fragmentの無効化（Russian doll caching）、`race_condition_ttl`による殺到の抑止を1つのframeworkで持つ |
| vercel/next.js | https://github.com/vercel/next.js | ba80ee48fc319735151c3ad6d9bb9a8180c9f09e（canary） | MIT | false | 2026-10-05 | tagによる無効化を「tagごとの無効化時刻」で表し、読込み時に照合する。pathの無効化をtagへ写す。stale-while-revalidateと、複数instance間での無効化の伝搬の責務分担を設計文書に書いている |
| TanStack/query | https://github.com/TanStack/query | ec8c6de8842445c29d3ea2edca51593e095abb5a（main） | MIT | false | 2026-10-05 | client側のquery結果cache。本書は、時間による鮮度判定（`staleTime`）と明示的無効化（`invalidateQueries`）の合成、keyの前方一致による無効化範囲の決め方を読んだ。P09のO02（`matchQuery`、`partialMatchKey`、`invalidateQueries`）、O03（`isStale`、`isStaleByTime`、`invalidate`）、O06（`fetch`）と同じpath・同じ機能が重なる。P09とは別の固定commit（P09は`f9fe54c960ffe39affe89a7b3dd8a69e6b194fda`、本書は`ec8c6de8842445c29d3ea2edca51593e095abb5a`）で、同じ機能をもう一度観察した。2つのrevisionの差は照合していない |
| varnishcache/varnish-cache | https://github.com/varnishcache/varnish-cache | 0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e（master） | NOASSERTION（LICENSE冒頭：「The compilation of software known as "Varnish Cache" is distributed under the following terms:」に続き、同fileに`SPDX-License-Identifier: BSD-2-Clause`の行がある） | true | 2026-10-05 | HTTP reverse proxy cache。期限切れ後も一定期間配る`grace`、同じobjectへの要求を1つのbackend要求に合流させるwaiting list、条件式で後から絞り込む`ban`、即時削除の`purge`を、C実装と利用者向け文書の両方で読める |
| apollographql/apollo-client | https://github.com/apollographql/apollo-client | 9659425dd0f1395d0fd7897ef882ab1082391dc2（main） | MIT | false | 2026-10-05 | 正規化cache（entity単位）。書込みのたびにfield単位の依存を辿って読み直しを起こす方式と、`evict`・到達可能性による`gc`を持つ。P09では正規化とoptimistic layerを読んだ。本書では無効化と除去の経路を読んだ |

（varnishcache/varnish-cacheはGitHub上でarchivedがtrueである。固定commitの内容だけを観察し、後継の開発場所は確認していない。）

## 観察

### P28-O01 entryごとの期限（TTL）と、読込み時の遅延判定
- 出典：rails、`activesupport/lib/active_support/cache/entry.rb` 行8–50（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache/entry.rb#L8-L50）、`activesupport/lib/active_support/cache.rb` 行496–530（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache.rb#L496-L530）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - `Entry`は値、期限、版（version）を持つ。期限は`expires_in`または`expires_at`から作られ、`expired?`は作成時刻と期限を現在時刻と比べる。
  - `Store#read`は、entryを読んだ後、期限切れなら`delete_entry`して`nil`を返す。版が合わなければ（P28-O02）削除せずに`nil`を返す。どちらも`payload[:hit] = false`として計測eventに記録する。
- 解いている問題と前提：元dataの変更をcacheが知らなくても、古い値が出続ける時間に上限を置く。期限切れは書込み側ではなく、次の読込み側が判定する（遅延判定）。
- 必要な入力：entryごとの期限（storeの既定、呼出しごとの上書き、`fetch`のblock内で値から決める`WriteOptions`、同file 442–453）。
- trade-off・失敗の仕方：期限の間は、元dataが変わっても古い値が返る。期限切れの判定が読込み時なので、読まれないentryは期限後も残る（追出しはstoreの実装に委ねる。guideのSolid Cacheの節、`guides/source/caching_with_rails.md` 行761–773）。期限が同時に切れると再計算が重なる（P28-O04）。
- 反例・適用しない場合：Apollo（P28-O14）は`src/cache`に期限の概念を持たない。Next.js（P28-O05）は期限と別に、tagの無効化時刻を照合する。
- 互換・非互換：P28-O02（版）と同じ`read`で併用される。P28-O04は期限切れの直後の挙動を変える。
- 限界：期限の値は持ち込まない。このrepoで成立していることは、HELIXで成立することを意味しない。

### P28-O02 安定したkeyと変わる版の分離（recyclable cache key / cache versioning）
- 出典：rails、`activerecord/lib/active_record/integration.rb` 行18–32、63–121（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/integration.rb#L63-L121）、`activesupport/lib/active_support/cache.rb` 行1056–1065（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache.rb#L1056-L1065）、`activesupport/lib/active_support/cache/entry.rb` 行38–40、`guides/source/caching_with_rails.md` 行253–260（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/caching_with_rails.md#L253-L260）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `cache_versioning`が有効なら、`cache_key`はmodel名とidだけの安定したkeyを返し、`cache_version`は`updated_at`から作った版を返す。無効なら、`cache_key`自体にtimestampを含める（旧方式）。
  - `normalize_version`は、呼出しの`:version`か、keyが`cache_version`に応答すればその値を使う。keyが配列なら各要素の版を連結する。
  - `Entry#mismatched?`は、保存時の版と要求時の版が両方あり、異なる場合にtrueを返す。`read`・`fetch`はこれをmissとして扱う（P28-O01）。
  - guideは、keyと版を分けることで、recordが何度更新されても同じkeyへ上書きし、古いentryが溜まらないと説明する。
- 解いている問題と前提：書込み時に無効化を明示しなくても、元dataの版がkeyに付随して変わることで古いentryを読まなくする。版のもとになる列（既定は`updated_at`）が、内容の変更のたびに確実に変わることが前提である。
- 必要な入力：版のもとになる値（timestamp列、または`cache_version`の上書き）、keyに含める依存の集合（配列で複数のrecordを渡す）。
- trade-off・失敗の仕方：
  - 版の値を変えない更新（`updated_at`を動かさない一括更新など）では、古い値が返り続ける。どの更新が版を動かすかは利用側に残る。
  - `mismatched?`は保存側・要求側の一方でも版が`nil`なら一致とみなす（行38–40）。版を持たないkeyと持つkeyを混ぜると、版による判定が効かない。
  - 版を毎回keyに含める旧方式は、更新のたびに新しいkeyが増え、古いkeyの回収をstoreの追出しに委ねる（`cache_helper.rb`のcomment 行32–36は、版を分けることで「cache trash」を出さないと書く）。
- 反例・適用しない場合：groupcache（P17-O12）は値を不変にし、変更を新しいkeyで表す（版をkeyへ入れる側の極端な形）。Next.js（P28-O05）は版ではなくtagの無効化時刻で照合する。
- 互換・非互換：P28-O03（templateのdigestをkeyに足す）、P28-O01（期限）と合成される。
- 限界：timestampの書式・精度の値は持ち込まない。

### P28-O03 templateの依存木のdigestをkeyに含め、入れ子のfragmentを親の`touch`で無効化する（Russian doll caching）
- 出典：rails、`actionview/lib/action_view/helpers/cache_helper.rb` 行26–60、244–276（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionview/lib/action_view/helpers/cache_helper.rb#L26-L60 、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionview/lib/action_view/helpers/cache_helper.rb#L244-L276）、`guides/source/caching_with_rails.md` 行308–391、398–444（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/caching_with_rails.md#L398-L444）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - fragmentのkeyは、template path、template木のdigest、渡したrecordの組である。digestは`Digestor.digest`がtemplate fileの内容と、`render`呼出しから推論した依存（implicit）、特別なcomment `Template Dependency:` で宣言した依存（explicit）から作る。templateを変えるとdigestが変わり、別のentryになる。
  - `skip_digest: true`でdigestを外せる（commentは、memcachedのように正確なkeyを知らないと手で消せない場合に使うと書く）。
  - 入れ子のfragmentでは、内側のrecordが更新されても外側のkeyの版は変わらない。guideは、`belongs_to :product, touch: true`で子の更新時に親の`updated_at`も更新し、外側を無効化する方法を示す。外側を作り直すとき、変わっていない内側のfragmentは再利用される。
- 解いている問題と前提：表示の部品が入れ子になっているときに、1件の変更で全体を作り直さずに済ませ、かつ外側が古いまま残らないようにする。dataの依存はmodelの関連（`touch`）で、codeの依存はtemplateのdigestで表す。
- 必要な入力：fragmentが依存するrecordの集合、modelの親子関係と`touch`の宣言、helperの中に隠れた`render`の依存宣言。
- trade-off・失敗の仕方：
  - guide（行384–391）は、cacheしたblockが呼ぶhelperを変えてもdigestは変わらないと明記し、templateにcommentを足してdigestを変える回避策を示す。依存の推論が届かない所では古いfragmentが残る。
  - `touch`を宣言し忘れると、外側のfragmentが古い内容を出し続ける（guide 行427–444）。
  - `touch`は子の書込みのたびに親の行も更新するので、書込みが親へ伝搬する（親の行への書込みが増えることは本文からの推論で、guideに数値の記載はない）。
- 反例・適用しない場合：Apollo（P28-O14）はfieldの依存を実行時に記録し、宣言を要しない。Next.js（P28-O07）はpathの階層をtagへ写して上位の無効化を表す。
- 互換・非互換：P28-O02の版が前提になる。
- 限界：digestのhash方式はこのrepo固有である。

### P28-O04 期限切れ直後の再計算の殺到を、古い値の期限を延ばして抑える（`race_condition_ttl`）
- 出典：rails、`activesupport/lib/active_support/cache.rb` 行382–397、454–480、1106–1119（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache.rb#L382-L397 、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache.rb#L1106-L1119）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `fetch`は、読んだentryを`handle_expired_entry`に通す。entryが期限切れで、`race_condition_ttl`が正で、期限切れからの経過がその範囲内なら、古いentryの期限を「今＋`race_condition_ttl`」に延ばして書き戻し、自分はmissとして再計算に進む。範囲外なら削除する。
  - doc commentは、延長した窓の間、他のprocessは古い値を使い続け、最初のprocessが新しい値を書いた後は新しい値を使うと書く。最初のprocessが再計算に失敗した場合は、延長した窓が過ぎた後に別のprocessが再計算できる。
- 解いている問題と前提：同じkeyの期限が切れた瞬間に、多数のprocessが同時に再計算する（doc commentは「dog pile effect」と呼ぶ）ことを避ける。古い値を短時間出してよいことが前提である。
- 必要な入力：期限切れ後に古い値を使ってよい時間幅、期限（P28-O01）。
- trade-off・失敗の仕方：
  - 今回読んだ`handle_expired_entry`は、読込みと書戻しを別の操作で行い、compare-and-setやlockを使っていない（行1106–1119）。延長の書戻しより前に読んだprocessは、それぞれ再計算に進みうる（codeからの推論で、実害の報告は確認していない）。
  - 期限切れから時間幅を超えて最初に読まれた場合はentryが削除され、殺到の抑止は効かない（行1109、1115）。
  - 延長中は古い値が返る。
- 反例・適用しない場合：Varnish（P28-O12）は、同じobjectへの要求を待ち行列で1本のbackend要求に合流させる。Next.js（P28-O08）はprocess内の`Batcher`で同じkeyの再生成を合流させる。groupcache（P17-O12）はsingleflightで合流させる。
- 互換・非互換：P28-O01の期限が前提。P28-O08・O12のstale-while-revalidateと目的が重なるが、Railsは再計算を呼出し元のrequestの中で同期的に行う（背景での再生成ではない）。
- 限界：時間幅の値は持ち込まない。

### P28-O05 tagの無効化を「tagごとの無効化時刻」で記録し、読込み時にentryの作成時刻と比べる
- 出典：next.js、`packages/next/src/server/lib/incremental-cache/tags-manifest.external.ts` 行1–43（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/lib/incremental-cache/tags-manifest.external.ts#L1-L43）、`packages/next/src/server/lib/cache-handlers/default.ts` 行127–137、199–243（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/lib/cache-handlers/default.ts#L199-L243）、`packages/next/src/server/lib/cache-handlers/types.ts` 行6–66（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/lib/cache-handlers/types.ts#L6-L66）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `tagsManifest`はtagから`{ stale, expired }`（いずれも時刻）へのmapで、「use cache」handlerと従来のfile-system cacheで共有される（comment）。
  - `updateTags(tags, durations)`は、`durations`があればそのtagの`stale`を今に、`expire`が与えられれば`expired`を「今＋期間」にする。`durations`がなければ`expired`を今にする（即時の期限切れ）。entry自体は消さない。
  - 既定handlerの`get`は、entryの`timestamp`より後にtagが`expired`になっていればmiss（`areTagsExpired`）、`stale`が`timestamp`より後なら`revalidate = -1`にして返す（`areTagsStale`）。`types.ts`のcommentは、負の`revalidate`は次の読込みで背景の再生成を強いる、と書く。
  - `CacheEntry`は`timestamp`（作成時刻）、`revalidate`（再生成を始める経過時間）、`expire`（使ってよい上限）を持つ。
- 解いている問題と前提：1つのdataに依存する多数のentryを、entryを列挙せずに無効化する。無効化は「tagの時刻を進める」という1回の書込みで済み、各entryは読まれたときに判定される。entryの作成時刻と無効化時刻が比較可能であること（同じ時計）が前提である。
- 必要な入力：entryに付けるtagの集合（`cacheTag()`、`fetch`の`next.tags`）、無効化を即時にするか、古い値を一度出して背景で再生成するか（P28-O06）。
- trade-off・失敗の仕方：
  - 判定は時刻の大小なので、entryの作成時刻と無効化時刻を別の時計で付けると判定がずれる（設計上の前提からの推論。時計のずれを扱う記述は見つけていない）。
  - 既定のmanifestはprocessのmemory上にあり、`updateTags`のcommentには「TODO: update file-system-cache?」が残っている（行223）。複数instanceでの伝搬はP28-O09。
  - entry自体は消えないので、容量の管理はhandlerの追出しに委ねる（`types.ts`のcommentは、Next.jsはentryをstoreから消さず、handlerが自前の仕組みを持つ必要があると書く、行89–91）。
- 反例・適用しない場合：Varnishの`ban`（P28-O13）も「後から足した条件を、読込み時にそれより古いobjectにだけ当てる」点で同型だが、tagではなく任意の条件式で表す。TanStack（P28-O11）はkeyの前方一致でentryを列挙し、その場でflagを立てる。
- 互換・非互換：P28-O06・O07がこの仕組みの上に乗る。P28-O08のstale-while-revalidateと`revalidate = -1`で接続する。
- 限界：期間の値は持ち込まない。

### P28-O06 無効化の強さを呼出しで選ぶ：古い値を一度出して背景で作り直すか、即時に期限切れにするか（`revalidateTag`と`updateTag`）
- 出典：next.js、`packages/next/src/server/web/spec-extension/revalidate.ts` 行28–76、216–263（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/web/spec-extension/revalidate.ts#L28-L76 、https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/web/spec-extension/revalidate.ts#L216-L263）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `revalidateTag(tag, profile)`は第2引数に`cacheLife`のprofile名か`{ expire }`を取る。第2引数を省いた呼出しは非推奨の警告を出す。
  - `updateTag(tag)`はprofileなしで`revalidate`を呼び、即時の期限切れになる。Server Action以外（`workStore`がない、またはroute handler）から呼ぶとerrorを投げる。doc commentは「read-your-own-writes」のためと書く。
  - `revalidate`は、render中、cacheされる関数の中、build時のgeneratorの中では呼べない（それぞれ専用のerror）。呼べる場合は`pendingRevalidatedTags`へtagとprofileを積み、同じtagとprofileの組が既にあれば時刻だけ更新する（commentは、最後の無効化が古さを決めるため、と書く）。
  - profileがない、またはprofileの`expire`が0のときだけ`pathWasRevalidated`を立てる。commentは、stale-while-revalidateの更新ではServer Actionが自分の書込みを引き戻さないよう、pathを無効化済みにしない、と書く。
- 解いている問題と前提：書込みをした本人には直後に新しい値を見せたい（read-your-own-writes）一方、それ以外の無効化では古い値を許して再生成の負荷を平らにしたい。どちらを選ぶかを呼出し側のAPIで分ける。
- 必要な入力：無効化を起こす文脈（Server Action、route handler等）、書込み直後に自分の結果を読む必要があるか、古い値を許す期間（profile）。
- trade-off・失敗の仕方：profile付きの`revalidateTag`の直後に同じ利用者が読むと、古い値が一度返りうる（`stale`の扱い、P28-O05）。`updateTag`はServer Action内に限られ、route handlerからは使えない（行61–69、TODO commentあり）。
- 反例・適用しない場合：TanStackの`invalidateQueries`は`refetchType`で再取得の範囲を選ぶが、古い値を返すかどうかの選択は`staleTime`と画面の状態に依存する（P28-O10・O11）。Railsは`Store#write`・`Store#delete`という公開のwrite／delete APIを持つ（`activesupport/lib/active_support/cache.rb` 行674–695、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activesupport/lib/active_support/cache.rb#L674-L695）。ただし、O02で観察したrecordのcache-version方式の中では、書込みのたびに無効化を個別に呼ぶ必要はなく、recordの版の変化（P28-O02）で古いentryを読まなくする。
- 互換・非互換：P28-O05の`stale`／`expired`の2つの時刻に対応する。
- 限界：profile名・既定のprofileの値は持ち込まない。

### P28-O07 pathによる無効化を、階層の各段に自動で付けたtag（soft tag）へ写す
- 出典：next.js、`packages/next/src/server/web/spec-extension/revalidate.ts` 行105–136（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/web/spec-extension/revalidate.ts#L105-L136）、`docs/01-app/02-guides/how-revalidation-works.mdx` 行39–53（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/how-revalidation-works.mdx#L39-L53）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書によれば、routeのpathから接頭辞付きのsoft tagが自動で作られる。pathの各段にlayoutのtag、末端にrouteのtagが付く。`revalidatePath`は、同じtagの仕組み（P28-O05）を使って、pathに対応するtagを無効化する。
  - `revalidatePath(path, type)`は、pathを正規化してsoft tagにする。`type`（`layout`／`page`）があればtagに付ける。動的なroute（`[id]`等）で`type`がない場合は「既定では効果がない」と警告する。rootと`/index`は相互にtagを足す。長さの上限を超えたpathは警告して何もしない。
- 解いている問題と前提：利用者が個々のentryのtagを知らなくても、URLの階層で無効化の範囲を指定できるようにする。pathの階層が依存の階層に対応していることが前提である。
- 必要な入力：無効化するpath、そのpathをlayoutとして扱うかpageとして扱うか、動的routeかどうか。
- trade-off・失敗の仕方：
  - 警告文：動的routeで`type`を省くと、「既定では効果がない」（has no effect by default）という警告を出す（行122–126）。
  - 制御の流れ：この警告の後もreturnせず、`type`の付かないsoft tagで`revalidate`を呼び、再検証の要求を登録する（行118–135）。登録されたtagが動的routeのentryに当たらないために「既定では効果がない」と警告している、と読める（警告文からの推論。entry側のsoft tagの作られ方は読んでいない）。
  - 早期return：長すぎるpathだけは、警告した後に`revalidate`を呼ばずにreturnする（行111–116）。
  - いずれも例外ではなく警告なので、呼出し側は失敗を検出しにくい。
- 反例・適用しない場合：TanStack（P28-O11）は配列のquery keyの前方一致で範囲を決める。Railsはmodelの関連を`touch`で辿る（P28-O03）。
- 互換・非互換：P28-O05の上に乗る。
- 限界：tagの接頭辞・長さの上限の値は持ち込まない。

### P28-O08 stale-while-revalidateと、同じkeyの再生成の合流、再生成失敗時の古い値の保持
- 出典：next.js、`packages/next/src/server/response-cache/index.ts` 行118–145、373–400、488–514、579–606（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/response-cache/index.ts#L373-L400 、https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/response-cache/index.ts#L579-L606）、`docs/01-app/02-guides/how-revalidation-works.mdx` 行16–23、`packages/next/src/server/lib/cache-handlers/default.ts` 行1–13、68–81、154–197。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `ResponseCache`は、前回のentryがあり、on-demandの再検証でなく、`isStale`が`-1`（`expire`を過ぎた、またはtagが期限切れ）でなければ、まず古いentryで応答を確定させる。古くなければそこで終わり、古ければ再生成に進む（背景）。`isStale === -1`のときは古い値で応答せず、再生成を待つ（comment 行384–388）。
  - 再生成は原則`revalidateBatcher`を通り、同じkeyの再生成は1つのpromiseに合流する。例外として、prefetchのrequestで前回のentryが無い場合は、batcherを通らずに`handleRevalidate`を直接呼ぶ（行404–424。commentは、進行中の背景再生成に合流すると、fallback shellではなく具体的な結果がprefetchへ渡り、結果がrequestの時機で変わるため、と書く）。`getBatcher`はkeyとon-demandかどうかの組で合流する（commentは、on-demandの再検証が通常のrequestを塞がないため、と書く）。
  - 再生成が例外を投げるか失敗結果を返すと、`retainPreviousCacheEntry`が前回の成功した値を、短い再検証間隔で書き戻す（commentは「Retain the previous successful value and delay retries」）。
  - 既定のmemory上のhandler（`default.ts`）のcommentは、memory上のcacheは壊れやすく、stale-while-revalidateで温める価値が低いので、本番では古いentryを期限切れ・missとして扱う、と書く（開発serverは例外）。同handlerは、書込み中の同じkeyへの`get`を`pendingSets`で待たせる。
- 解いている問題と前提：再生成の待ち時間を利用者に見せず、同時の再生成を1本にまとめ、再生成が失敗しても配信を止めない。古い値を一定期間出してよいことが前提である。
- 必要な入力：再生成を始める経過時間（`revalidate`）、使ってよい上限（`expire`）、再生成失敗時に古い値を保持する期間（値は持ち込まない）。
- trade-off・失敗の仕方：
  - 合流はprocess内のBatcherに限られる（今回読んだ範囲）。複数instanceでは各instanceが再生成しうる（P28-O09の文書は、instance間の調整をhandlerの責務としている）。
  - 背景の再生成の失敗は、利用者が既に古い値を受け取っているので`console.error`に出すだけで、応答には出ない（行436–444）。
  - 保持の書戻しは失敗した再生成のたびに起こり、間隔は前回の設定から決まる。
- 反例・適用しない場合：Railsの`race_condition_ttl`（P28-O04）は再計算を同期的に行い、合流ではなく「古い値の期限延長」で他を待たせない。Varnish（P28-O12）はgrace中なら待たず、grace外なら待ち行列に並べる。
- 互換・非互換：P28-O05の`revalidate = -1`、P28-O06のprofileと組み合わさる。
- 限界：保持期間の上下限の値は持ち込まない。

### P28-O09 複数instance間の無効化の伝搬を、cache handlerの2つのhook（`updateTags`／`refreshTags`）に委ね、可用性を優先する
- 出典：next.js、`docs/01-app/02-guides/how-revalidation-works.mdx` 行55–96（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/how-revalidation-works.mdx#L55-L96）、`packages/next/src/server/lib/cache-handlers/types.ts` 行68–117（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/server/lib/cache-handlers/types.ts#L68-L117）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、load balancerの後ろに複数instanceがある場合、無効化は既定でinstanceに閉じ、他のinstanceは知るまで古い値を出し続けると書く。
  - 文書は、`updateTags()`（無効化時に呼ばれる）で共有storage（Redis、DB等）へ無効化eventを書くことを、handlerの実装に求める契約として示す（文書 行61。`types.ts` 行112–115のcommentは「If applicable」にtags manifestを更新する、と書く）。既定のhandler（`default.ts` 行218–243）の`updateTags`は、process memory上のmap（`tagsManifest`）を書くだけで、共有storageへは書かない。`refreshTags()`はrequestの最初のcache読込みの前に呼ばれ、共有storageから無効化を読んで手元のtag状態を更新する（`types.ts`のcommentは、そのhandlerから何も読まないrequestでは呼ばれないと書く）。
  - `getExpiration(tags)`はsoft tagの最新の無効化時刻を返し、`Infinity`を返すとsoft tagを`get`へ渡して判定させる。
  - 文書の「Graceful Degradation」は、可用性を厳密な一貫性より優先すると書く。cacheの書込み失敗では応答は返り、entryは失われる。読込み失敗ではhandlerが`undefined`（miss）を返すべきで、例外はrender errorとして伝わる。`refreshTags()`が例外を投げるとrequestの失敗になるので捕まえ、最後に知っているtag状態で続けるよう求めている。HTMLとRSC payloadを別のTTLでcacheすると内容が食い違うとも書く。
- 解いている問題と前提：無効化eventの配送をframeworkが持たず、共有storageの選択を利用側に委ねたまま、どこで何を同期すべきかを契約として示す。
- 必要な入力：無効化eventを置く共有storage、各instanceがそれを読む時機、読めないときに古い値で続けるか失敗させるか。
- trade-off・失敗の仕方：伝搬の遅れの間、instanceごとに違う内容が返る（文書 行72–74）。`refreshTags()`の例外を捕まえると古い値が出続け、捕まえないとrequestが失敗する。保証は文書上の契約で、handlerの実装に依存する。
- 反例・適用しない場合：Varnishの`ban`（P28-O13）は1つのcache process内のlistで、複数nodeへの配送はrepo内では扱っていない（今回読んだ範囲）。TanStack（P28-O11）はclientごとのcacheで、他clientへの伝搬を持たない。
- 互換・非互換：P28-O05の時刻による判定を前提にする（共有するのはentryではなくtagの時刻）。
- 限界：Redis等の例はrepository内の文書の記述で、本書は共有storageの実装を読んでいない。

### P28-O10 鮮度を「経過時間」と「無効化flag」の論理和で決め、無効化を受け付けない`'static'`を別に置く
- 出典：TanStack/query、`packages/query-core/src/query.ts` 行500–575（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/packages/query-core/src/query.ts#L500-L575）、`docs/framework/react/guides/important-defaults.md` 行8–24（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/docs/framework/react/guides/important-defaults.md#L8-L24）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `isStaleByTime(staleTime)`は、dataがなければstale、`'static'`なら常にfresh、`isInvalidated`ならstale、それ以外は`dataUpdatedAt`からの経過時間で判定する（この順）。
  - `isStale()`は、observerがあれば各observerの結果の`isStale`のいずれか（observerごとの`staleTime`と`enabled`を反映）、なければ「dataがない、または無効化済み」で判定する。
  - `isStatic()`は、observerのいずれかが`staleTime: 'static'`ならtrueを返す。
  - 文書は、`staleTime`を無限にした場合は手動の無効化で古くできるが、`'static'`は`invalidateQueries`でも古くならず、`refetchOn*: "always"`も止めると書く。起動時に読むfeature flagや権限のように、実行中に変わらないdataに使うよう示している。
- 解いている問題と前提：時間による鮮度（TTLに相当）と、変更を知った側からの明示的な無効化を、同じ「stale」という1つの状態にまとめる。staleは「すぐ消す」ではなく「次の機会に再取得する」を意味する（取得の契機はmount、focus、再接続等）。
- 必要な入力：queryごとの`staleTime`（数値、無限、`'static'`）、無効化を受け付けるdataかどうか。
- trade-off・失敗の仕方：既定ではcacheしたdataを直ちにstaleとみなすため、再取得が多くなる（文書 行8–10）。`'static'`を付けたqueryは`invalidateQueries`でも再取得されず、サーバ側で変わっても反映されない（`refetchQueries`も`isStatic()`のqueryを除く、`queryClient.ts` 行546）。同じqueryに異なる`staleTime`のobserverがあると、`isStale()`はいずれかがstaleならstaleになり、`isStatic()`はいずれかが`'static'`ならstaticになる。
- 反例・適用しない場合：Rails（P28-O01）の期限切れは削除（miss）で、staleのまま使い続ける状態がない（`race_condition_ttl`を除く）。Next.js（P28-O05）は`stale`と`expired`を2つの時刻として分ける。
- 互換・非互換：P28-O11の`invalidate()`がflagを立てる。
- 限界：`staleTime`等の既定値は持ち込まない。

### P28-O11 keyの前方一致で無効化の範囲を選び、flagを立ててから画面に出ているものだけを再取得する（`invalidateQueries`）
- 出典：TanStack/query、`packages/query-core/src/queryClient.ts` 行476–558（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/packages/query-core/src/queryClient.ts#L476-L558）、`packages/query-core/src/query.ts` 行670–722（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/packages/query-core/src/query.ts#L670-L722）、`packages/query-core/src/utils.ts` 行205–252、343–370（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/packages/query-core/src/utils.ts#L205-L252）、`docs/framework/react/guides/query-invalidation.md` 行6–24（https://github.com/TanStack/query/blob/ec8c6de8842445c29d3ea2edca51593e095abb5a/docs/framework/react/guides/query-invalidation.md#L6-L24）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `invalidateQueries(filters)`は、filterに合う全queryの`invalidate()`を呼び（`isInvalidated`を立てて通知するだけで、それ自体は再取得しない）、`refetchType`が`'none'`でなければ`refetchQueries`を呼ぶ。再取得の対象は`refetchType`、なければ`type`、なければ`'active'`である。`'active'`は、`enabled`が`false`に解決されないobserverを1つ以上持つqueryを指す（`query.ts` 行465–473の`isActive()`）。
  - `matchQuery`は、`exact`ならhashの一致、そうでなければ`partialMatchKey`（配列のkeyの前方一致、objectは部分一致）でqueryを選ぶ。さらに`type`（active／inactive）、`stale`、`fetchStatus`、`predicate`で絞る。
  - `refetchQueries`は、disabledと`isStatic()`のqueryを除き、既定で`cancelRefetch: true`で`fetch`を呼ぶ。`Query.fetch`は、取得中で、dataがあり`cancelRefetch`なら実行中の取得を黙って取り消して新しく始める。それ以外は実行中のpromiseを返す（同じqueryの取得の合流）。
  - 文書は、正規化cacheのようにdataを手で書き換えるのではなく、「targeted invalidation, background-refetching」を勧めると書く。
- 解いている問題と前提：書込み（mutation）の後に、影響を受けたqueryを階層的なkeyで指定して古くする。画面に出ていないqueryは再取得せず、次に使われるときまで遅らせる。query keyの階層が依存の階層を表すことが前提である。
- 必要な入力：query keyの設計（どの接頭辞でまとめるか）、完全一致にするか、再取得の範囲（active／inactive／all／none）、実行中の取得を取り消すか。
- trade-off・失敗の仕方：
  - 前方一致の範囲はkeyの設計で決まり、keyの階層と依存が合っていなければ、無効化漏れか過剰な再取得になる（文書の例は、より具体的なkeyを渡すと親のkeyのqueryは無効化されないことを示す、行55–75）。
  - 既定の`cancelRefetch: true`は、書込み前に始まった取得を取り消して、書込み後の値を取り直す。`false`にすると実行中の取得を返すので、書込み前の値が返りうる（取消しの意図はdoc commentから、書込み前の値が返ることは構造からの推論）。
- 反例・適用しない場合：Apollo（P28-O14）は正規化cacheで、書込みでentityを更新すると依存するqueryが読み直される。Next.js（P28-O05）はtagを明示的に付ける。
- 互換・非互換：P28-O10のflagを立てる側である。P09のO02（`matchQuery`、`partialMatchKey`、`invalidateQueries`）、O03（`isStale`、`isStaleByTime`、`invalidate`）、O06（`fetch`）と同じpath・同じ機能が重なる。本書は、P09とは別の固定commitで同じ機能をもう一度観察した。
- 限界：P09は`f9fe54c960ffe39affe89a7b3dd8a69e6b194fda`、本書は`ec8c6de8842445c29d3ea2edca51593e095abb5a`を読んだ。2つのrevisionの差は照合していない。

### P28-O12 期限切れ後の配信猶予（grace）と、同じobjectへの要求の待ち合わせ（request coalescing）を1つの検索で決める
- 出典：varnish-cache、`bin/varnishd/cache/cache_hash.c` 行505–584、640–689（https://github.com/varnishcache/varnish-cache/blob/0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e/bin/varnishd/cache/cache_hash.c#L640-L689）、`doc/sphinx/users-guide/vcl-grace.rst` 行19–50、72–110、139–146（https://github.com/varnishcache/varnish-cache/blob/0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e/doc/sphinx/users-guide/vcl-grace.rst#L19-L110）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `HSH_Lookup`は、同じhashのobject一覧を走査し、取得中（busy）のobjectがあれば`busy_found`を立て、期限内のobjectがあればhitとする。期限切れのものは、最も新しいものを`exp_oc`として覚える。
  - 走査後、取得中のobjectがなければ、自分用のbusy objectを作る（自分がbackendへ取りに行く）。`exp_oc`が`grace`内なら`HSH_GRACE`で古いobjectを返し、そうでなければ`HSH_MISS`。
  - 取得中のobjectがあれば、`exp_oc`が`grace`内なら待たずに古いobjectを返す（comment「we do not wait on the busy object if in grace」）。`grace`外ならrequestをwaiting listに入れて`HSH_BUSY`を返し、取得完了まで待たせる。
  - 文書は、複数clientが同じpageを求めるとbackendへ1本だけ送り他を待たせること（request coalescing）、待ち行列が大きくなるとthundering herdと待ち時間の問題が起こり、graceで古いobjectを出しながら新しい版を取りに行くことを説明する。`keep`はgraceの後も条件付きGET（304）の候補としてobjectを残す。`req.grace`でbackendが健全なときだけgraceを短くする例、背景取得が5xxを返したら`abandon`してcacheへ入れない例も示す。
- 解いている問題と前提：期限切れの瞬間の殺到（stampede）と、取得中の待ち時間を、同じ判定で扱う。HTTPの応答として古い内容を出してよいことと、cacheが1つのprocessで同じhashの状態を持つことが前提である。
- 必要な入力：objectごとの`ttl`、`grace`、`keep`、request側でgraceを絞る値（`req.grace`）、backendの健全性。
- trade-off・失敗の仕方：
  - grace外で取得中のobjectがあると、後続requestは待ち行列で待つ（文書は「nobody likes to wait」と書く）。
  - backendが失敗し続けると、grace内の古いobjectが出続ける。文書はこれをbackend障害からの保護として示し、背景取得の失敗結果をcacheへ入れない設定を別に書く。
  - 文書（行102–110）は、旧版ではtestを書かないと`keep`だけ残ったobjectが配られえたことと、現行では`vcl_miss`へ進むことを記録している（挙動が版で変わった例）。
- 反例・適用しない場合：Railsの`race_condition_ttl`（P28-O04）は合流せず、古い値の期限を延ばす。Next.js（P28-O08）は応答を古い値で確定させ、再生成を背景で合流させる。TanStack（P28-O11）は、`cancelRefetch`が偽か、dataがまだ無い場合に限り、同じqueryの実行中のpromiseを返して合流させる（既定の`cancelRefetch: true`では、取得中でdataがあれば実行中の取得を取り消して新しく始める）。
- 互換・非互換：P28-O13の`ban`判定が同じ走査の中で行われる。
- 限界：grace・keepの値は持ち込まない（文書の例示の値も写していない）。

### P28-O13 条件式による後からの無効化（ban list）を、object側の「最後に確認したban」の位置で遅延評価し、即時削除（purge）と分ける
- 出典：varnish-cache、`doc/sphinx/users-guide/purging.rst` 行17–19、67–121、193–202（https://github.com/varnishcache/varnish-cache/blob/0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e/doc/sphinx/users-guide/purging.rst#L67-L121）、`bin/varnishd/cache/cache_ban.c` 行247–262、631–722（https://github.com/varnishcache/varnish-cache/blob/0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e/bin/varnishd/cache/cache_ban.c#L631-L722）、`bin/varnishd/cache/cache_hash.c` 行540–555、790–845（https://github.com/varnishcache/varnish-cache/blob/0038dd19804fd92cd8bd4bfe92e5a515a57d5e8e/bin/varnishd/cache/cache_hash.c#L790-L845）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、新しい内容があることをcacheへ知らせる方法として、HTTP purge、ban、強制miss（`req.hash_always_miss`）の3つを挙げる。
  - purgeは、hashで選んだobjectとそのvariantを捨てる。`HSH_Purge`は、`ttl`・`grace`・`keep`がすべて0なら即時削除（`OC_F_DYING`）とし、取得中（busy）のobjectは所有者に特権があるため対象にしない（comment）。
  - banは、cache内の既存objectへの「filter」で、任意のmetadataの条件式で表す。新しく入る内容は止めない。`BAN_NewObjCore`は、新しいobjectに最新のbanへの参照を持たせる。`BAN_CheckObject`は、hitしたobjectについて、最新のbanからそのobjectが持つbanまでの間（objectより新しいban）だけを評価し、一致すればobjectを除き、一致しなければobjectの参照を最新のbanへ進める。
  - `HSH_Lookup`は、走査中のobjectにban判定をかけ、一致したら`OC_F_DYING`にして除く（`ban_any_variant`で、合わないvariantをいくつまで検査するかを制御する）。
  - 文書によれば、`obj.*`だけを条件にするbanは背景の`ban lurker`がobjectを走査して除く。`req.*`を使うbanはlurkerで評価できない（request objectがない）ので、lurker向けにはbackend応答のheaderへURLを写してから`obj.http.*`で条件を書くtemplateを示す。cache内の最古のobjectより古いbanは評価せずに捨てられる。
- 解いている問題と前提：正確なkeyを知らない多数のobject（host全体、URLのpattern等）を、一覧を作らずに無効化する。無効化の登録は即時、実際の除去は読込み時か背景で行う。
- 必要な入力：無効化の条件式（URL、host、header等のmetadata）、条件がobject側の属性だけで書けるか（lurkerが使えるか）、即時に消す必要があるか（purge）。
- trade-off・失敗の仕方：
  - 文書は、TTLが長くめったに読まれないobjectが多いとbanが溜まり、CPU使用と性能に影響しうると書く。
  - `req.*`を使うbanは、objectが読まれるまで評価されず、lurkerで片付かない。
  - lookup時のvariantの検査は、多いと全banを全variantに当てる遅延になりうる（文書 行95–103）。文書は次のmajor版で既定を変える予定も書いている（値は持ち込まない）。
  - 強制missは古いobjectを消さず、期限か追出しまで残す（文書 行196–202）。
- 反例・適用しない場合：Next.js（P28-O05）は条件式ではなくtagの集合で、判定はtagの時刻比較である。Apollo（P28-O14）の`evict`はid（と任意のfield）を指定する即時の除去である。
- 互換・非互換：P28-O12のlookupの中で評価される。P28-O05とは「登録は1回、判定は読込み時」という形が共通する。
- 限界：今回はban式の構文解析（`cache_ban_build.c`）と`ban lurker`の実装（`cache_ban_lurker.c`）は冒頭の著作権表示しか読んでいない。

### P28-O14 正規化cacheで、書込みのたびにfield単位の依存を辿って読み直しを起こし、除去は`evict`と到達可能性の`gc`に分ける（期限を持たない）
- 出典：apollo-client、`src/cache/inmemory/entityStore.ts` 行123–222、224–280、386–403、550–610、731–794（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/src/cache/inmemory/entityStore.ts#L123-L222 、https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/src/cache/inmemory/entityStore.ts#L386-L403 、https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/src/cache/inmemory/entityStore.ts#L550-L610）、`src/cache/inmemory/inMemoryCache.ts` 行625–649、`docs/source/caching/garbage-collection.mdx` 行45–70（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/docs/source/caching/garbage-collection.mdx#L45-L70）、`docs/source/caching/cache-interaction.mdx` 行614–642。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 読込みは`CacheGroup.depend(dataId, storeFieldName)`で、どのentityのどのfieldに依存したかを記録する。引数付きのfieldは、引数込みの名前と短い名前の両方に依存を張る。
  - `merge`（書込み）は、`this.group.caching`が有効なときだけ（行162）、値が変わったfieldを`dirty`にする。entityが新しく現れたら`__exists`も`dirty`にする。引数付きfieldで`keyArgs`が設定されていなければ、短い名前も`dirty`にする（commentは、引数の違う値どうしの関係を仮定できないので、安全側に倒して同名の全値を無効化する、と書く）。`__exists`の`dirty`は、依存graphから結果を「forget」する。
  - `modify`はfieldごとの関数で値を書き換え、`DELETE`で削除、`INVALIDATE`で値を変えずに`dirty`だけ起こす（文書 行614–642）。
  - `evict`はidと任意のfield名を指定して除き、data上で何も消えなくてもfield名があれば`dirty`にする（commentは、custom readの計算fieldに依存するqueryのため、と書く）。`InMemoryCache.evict`は、最も外側の更新で、かつ`options.broadcast !== false`のときだけ、最後に監視中のqueryへ通知する（行645）。
  - `gc`は、`retain`されたidとroot（ROOT_QUERY等）から参照を辿り、到達できないentityをroot layerから消す。文書は、`evict`の後は他のobjectが到達不能になりうるので`gc`を呼ぶよう書き、`evict`したobjectへの参照（dangling reference）は既定で残すと書く。list fieldの既定の`read`はdangling referenceを自動で除くが、単一参照のfieldは`canRead`を使う`read`関数で利用側が扱う。
  - `src/cache`配下のtest以外のTypeScript fileを`ttl`、`expir`、`maxAge`、`staleTime`でgrepし、該当は0件だった（期限による無効化を持たない）。
- 解いている問題と前提：同じentityが多数のqueryに現れるとき、1回の書込みで全queryの表示を整合させる。entityに安定したid（`keyFields`）があることと、書込みがcacheを通ることが前提である。
- 必要な入力：entityのid、引数付きfieldの`keyArgs`、`evict`するidとfield、`gc`の根として`retain`するid、dangling referenceの扱い（`read`関数）。
- trade-off・失敗の仕方：
  - cacheの外でserver側のdataが変わった場合、cacheは知る手段を持たない（期限がない）。利用側が`evict`・`modify`・再取得で無効化する。
  - `keyArgs`がないと、1つの引数の値の書込みで同名fieldの全値が無効化され、読み直しが過剰になる。
  - `evict`だけでは参照元が残り、`gc`を呼ばないと到達不能なentityが残る。dangling referenceの扱いを誤ると、単一参照のfieldが欠けたdataを返す。
- 反例・適用しない場合：TanStack（P28-O11）は正規化をせず、query単位のkeyで無効化する。Rails（P28-O02）は版付きkeyで、依存の追跡をしない。
- 互換・非互換：P09（正規化とoptimistic layer）と同じrepo・同じ固定commit（`9659425dd0f1395d0fd7897ef882ab1082391dc2`）である。P09は`entityStore.ts`の行735–760（`CacheGroup`）と行859–929を引いており、本書の行731–794（`CacheGroup`）はP09の行735–760と同じpath・同じ機能が重なる。本書は、その機能を無効化（`depend`／`dirty`）の観点でもう一度観察した。同じcommitなので、revisionの差はない。
- 限界：`optimism`（依存追跡のlibrary）の本体は別repositoryで、読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 時間による鮮度 | Rails：entryの期限。期限切れは読込み時に削除しmiss（O01） | TanStack：`staleTime`の経過か無効化flagでstale。staleは再取得の契機で、値は使える（O10）。Next.js：`revalidate`（作り直し開始）と`expire`（使用上限）の2段（O05・O08）。Varnish：`ttl`・`grace`・`keep`の3段（O12）。Apollo：期限なし（O14） | 古い値を出してよい時間をどう段に分けるか。期限切れを「消す」か「作り直しの契機」にするか |
| 書込み時の無効化 | Apollo：書込みのたびに変わったfieldの依存を`dirty`にする（O14） | TanStack：書込み後に利用側が`invalidateQueries`を呼ぶ（O11）。Next.js：`revalidateTag`／`updateTag`（O06）。Rails：O02のrecordのcache-version方式の中では、個別の無効化呼出しを要さず版の変化で表す（O02）。公開のwrite／delete API（`Store#write`／`Store#delete`）は別にある | 書込みがcacheを通るか。依存をcacheが自動で追うか、利用側が指定するか |
| 依存・範囲の指定 | Next.js：明示tagとpathのsoft tag（O05・O07） | TanStack：keyの前方一致（O11）。Rails：record配列とtemplate digest、`touch`の伝搬（O02・O03）。Varnish：任意の条件式（O13）。Apollo：実行時のfield依存（O14） | 依存を宣言するか、key設計に埋め込むか、実行時に記録するか |
| 無効化の評価時機 | Next.js：tagの時刻を進め、読込み時にentryの作成時刻と比べる（O05） | Varnish：ban listに追加し、hit時にobjectより新しいbanだけ評価、背景のlurkerも除く（O13）。TanStack：該当queryを列挙してflagを立てる（O11） | entryを列挙できるか。条件がobject側の属性だけで書けるか |
| stale-while-revalidate | Next.js：古い値で応答を確定し背景で再生成。失敗時は古い値を保持（O08） | Varnish：grace内は古いobjectを返し取得を1本だけ起こす（O12）。TanStack：staleでも値を出し、mount・focus等で背景再取得（O10） | 古い値を出せる上限を誰が決めるか（応答の性質、利用側） |
| 版付きkey | Rails：安定keyと版を分け、版不一致をmissにして同じkeyへ上書き（O02） | Rails（旧方式）：keyに版を含め、古いkeyは追出しに任せる（O02）。groupcache：値不変で新しいkey（P17-O12） | 古いentryの回収をcacheの上書きでするか、追出しに任せるか |
| stampedeの防止 | Rails：古い値の期限を延ばして他を待たせない。原子的操作は使っていない（O04） | Varnish：busy objectのwaiting listで合流、grace内は待たない（O12）。Next.js：process内のBatcherで合流（O08）。TanStack：`cancelRefetch`が偽か、dataが無い場合に限り実行中のpromiseを返す。既定の`cancelRefetch: true`でdataがあれば取り消して新しく始める（O11） | 合流をprocess内に閉じるか。待たせるか古い値を返すか |
| 複数nodeへの伝搬 | Next.js：`updateTags`／`refreshTags`をhandlerへ委ね、失敗時は最後の状態で続ける（O09） | Rails：共有store（memcached、Redis等）を使えば版の照合は共有される（O02、storeの実装は読んでいない）。Varnish・TanStack・Apollo：今回読んだ範囲に伝搬の仕組みなし | cacheの実体を共有するか、無効化eventだけを共有するか |

## 見つからなかったこと・gap
- 書込みと無効化の順序（DBへの書込みとcacheの無効化の間に別のrequestが古い値を書き戻す競合、いわゆる「delete後のset」）を扱う仕組みは、5 repoとも見当たらなかった。Railsの版付きkey（O02）は版を読込み時に照合するので、版が書込みと一緒に変わる限りこの競合を避けるが、そう明記した文書は見つけていない。
- 無効化eventの配送の信頼性（欠落、重複、順序）を扱う実装は見つからなかった。Next.jsは配送をcache handlerに委ね、文書に契約だけを書いている（O09）。共有storageのhandler実装は読んでいない。
- 時計のずれ：Next.jsのtag判定は時刻の比較（O05）だが、instance間の時計のずれを扱う記述は見つけていない。
- 負のcache（存在しないことのcache）と、その無効化：Varnishのhit-for-miss・hit-for-pass（`OC_F_HFM`／`OC_F_HFP`）を`HSH_Lookup`で見たが、作られる条件は読んでいない。Railsの`skip_nil`は名前だけ確認した。
- 確率的な早期再計算（期限前に確率で再計算を始める方式）は、5 repoとも見当たらなかった。
- Railsの`race_condition_ttl`の非原子性（O04）について、問題として報告されたissueは検索していない。
- ADR形式の設計記録は、5 repoとも見当たらなかった（根拠はcode comment、guide、docs）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し、sparse checkoutで範囲を限ってから固定commitをcheckoutした（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない。GitHub APIはmetadata（default branch、SPDX、archived、HEAD commit、description、最終push）の取得に使った。
- rails：`activesupport/lib/active_support/cache.rb`（375–530, 1020–1135）、`activesupport/lib/active_support/cache/entry.rb`（1–90）、`activerecord/lib/active_record/integration.rb`（15–130）、`actionview/lib/action_view/helpers/cache_helper.rb`（24–70, 176–298の見出し、244–298）、`guides/source/caching_with_rails.md`（見出し全体、236–445, 761–775）。読んでいないもの：各store（`redis_cache_store.rb`、`mem_cache_store.rb`等）の本体、`ActionView::Digestor`の本体、`delete_matched`、`ActiveRecord::Base#touch`の実装、Solid Cache（別repo）。
- next.js：`packages/next/src/server/web/spec-extension/revalidate.ts`（全体）、`packages/next/src/server/lib/incremental-cache/tags-manifest.external.ts`（全体）、`packages/next/src/server/lib/cache-handlers/default.ts`（全体）、`packages/next/src/server/lib/cache-handlers/types.ts`（全体）、`packages/next/src/server/response-cache/index.ts`（112–150, 370–470, 488–621）、`docs/01-app/02-guides/how-revalidation-works.mdx`（全体）。読んでいないもの：`incremental-cache/index.ts`・`file-system-cache.ts`、`lib/batcher`の本体、`use-cache`のwrapper、`cacheLife`のprofile定義、CDN向け文書。
- TanStack/query：`packages/query-core/src/query.ts`（498–600, 668–740）、`queryClient.ts`（205–230, 470–560, 610–640）、`utils.ts`（205–260, 343–370）、`docs/framework/react/guides/query-invalidation.md`（1–80）、`important-defaults.md`（1–40）。読んでいないもの：`invalidations-from-mutations.md`、`queryObserver.ts`の`isStale`計算、`queryCache.ts`。P09と同じpath・同じ機能（`matchQuery`、`partialMatchKey`、`invalidateQueries`、`isStale`、`isStaleByTime`、`invalidate`、`fetch`）は、P09とは別の固定commitで読み直した。2つのrevisionの差は照合していない。
- varnish-cache：`bin/varnishd/cache/cache_hash.c`（505–690, 790–860）、`cache_ban.c`（244–262, 631–722、`grep`による該当行）、`cache_ban_lurker.c`（冒頭の著作権表示のみ）、`doc/sphinx/users-guide/purging.rst`（全体）、`vcl-grace.rst`（全体）、`LICENSE`（冒頭）。読んでいないもの：`cache_ban_build.c`、`cache_ban_lurker.c`の本体、`cache_expire.c`、`hsh_rush`系、VCLの組込み定義。
- apollo-client：`src/cache/inmemory/entityStore.ts`（95–112, 123–300, 380–410, 550–640, 730–800）、`inMemoryCache.ts`（620–660）、`docs/source/caching/garbage-collection.mdx`（40–112）、`cache-interaction.mdx`（610–642）。読んでいないもの：`policies.ts`（`keyArgs`の処理）、`readFromStore.ts`、`writeToStore.ts`、`optimism`（別repo）。
- 検索した語：`race_condition_ttl`、`cache_version`、`mismatched`、`expired`、`digest`、`touch`、`revalidateTag`、`updateTag`、`revalidatePath`、`tagsManifest`、`stale`、`expire`、`Batcher`、`retainPreviousCacheEntry`、`refreshTags`、`invalidateQueries`、`isStaleByTime`、`static`、`cancelRefetch`、`partialMatchKey`、`grace`、`busy`、`waitinglist`、`BAN_CheckObject`、`HSH_Purge`、`evict`、`gc`、`retain`、`dirty`、`INVALIDATE`、`ttl`／`expir`／`maxAge`／`staleTime`（apollo `src/cache`、test以外で該当0件）。
- 選ばなかった候補：facebook/memcache系やRedisのclient-side caching（server側cacheの実装として候補にしたが、今回は5 repoで足りると判断して読んでいない）、golang/groupcache（P17で読んだため再読しない）、Polly・cachetools等の汎用cache library（読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。Next.jsのO09は利用者向けの設計文書（docs）が主な根拠で、handler実装による保証ではない。codeと文書のどちらに由来するかの区別をBRAINの属性としてどう持つかは未決。
- scope：観察はserver側のkey-value cache（Rails）、frameworkの応答cache（Next.js）、HTTP reverse proxy（Varnish）、client側のquery cache（TanStack、Apollo）にまたがる。HELIXのD01で、どの層（data、application、edge、client）へ対応させるかは未決。P09（D04）と同じrepoの別箇所を、主な領域をどちらにするかも未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。Next.jsの`revalidateTag`の第2引数のように、上流の非推奨化でAPIの意味が変わりうる。Varnishは文書自身が版による挙動の変化と次版での既定の変更予定を書いており、archivedでもある。再観察の要否は未決。
- 状態：全観察（P28-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
