# P09 Frontendの状態管理とdata取得の境界の観察（D04 Frontend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| TanStack/query | https://github.com/TanStack/query | f9fe54c960ffe39affe89a7b3dd8a69e6b194fda（main） | MIT | false | 2026-10-04 | server stateの専用cacheとして、query key、stale判定、GC、invalidation、observerを1つのcoreに持つ。さらに「client stateを置き換えるか」の境界を公式docsで明文化している |
| vercel/swr | https://github.com/vercel/swr | 9ed1240a4cf799e316a793c22c6800cc6482d389（main） | MIT | false | 2026-10-04 | stale-while-revalidate型。request重複排除とmutationの競合を、timestampで解く実装がcoreに露出している。tagによる無効化も直近で追加された（PR #4336） |
| reduxjs/redux-toolkit（RTK Query） | https://github.com/reduxjs/redux-toolkit | e7a8b318df28aaf50ced1e65cd4636b7508263b2（master） | MIT | false | 2026-10-04 | API sliceで事前に宣言したtagによる無効化、購読の参照数によるGC、immer patchによるrollbackを持つ。正規化cacheを「あえて採らない」理由を一次docsに書いている |
| pmndrs/zustand | https://github.com/pmndrs/zustand | d7a5583cffd80af515f7dfb69583c95cbdc9e2ce（main） | MIT | false | 2026-10-04 | client state側の最小store。外部storeとselector購読の構造を見るため |
| apollographql/apollo-client | https://github.com/apollographql/apollo-client | 9659425dd0f1395d0fd7897ef882ab1082391dc2（main） | MIT | false | 2026-10-04 | 正規化cache（entity単位）とoptimistic layerを持つ。RTK Query／TanStackの「query結果単位cache」と対になる比較対象 |

本文はすべて、上記commitに固定したclone（`scratchpad/oss/<repo>`、`--filter=blob:none`、hooksPath無効でcheckout）で読んだ。コード・test・build・installは実行していない。

## 観察

### P09-O01 server stateとclient stateの責務を分ける宣言
- 出典：
  - TanStack/query `docs/framework/react/guides/does-this-replace-client-state.md` 行6–15、32–39（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/docs/framework/react/guides/does-this-replace-client-state.md#L6-L39）
  - apollo-client `docs/source/local-state/reactive-variables.mdx` 行6–8（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/docs/source/local-state/reactive-variables.mdx#L6-L8）、`src/cache/inmemory/reactiveVars.ts` 行59–80（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/src/cache/inmemory/reactiveVars.ts#L59-L80）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStackは自身を「server-state library」とし、Redux／MobX／Zustandを「client-state library」と分類している。例として、global stateに入っていた`projects`、`teams`、`tasks`、`users`をquery cacheへ移すと、`themeMode`と`sidebarStatus`だけが残る、という分け方を示している。
  - Apolloは、cacheの外に置くlocal stateとして`makeVar`（reactive variable）を持つ。変数を書き換えると、その変数を読んだcacheのdependencyをdirtyにし（`getCacheInfo(cache).dep.dirty(rv)`）、broadcastする。server stateとlocal stateは別の入れ物だが、同じreactivity経路で再計算される。
- 解いている問題と前提：非同期のserver dataをclient storeで手書き管理すると、connector、reducer、loading／error状態が定型コードとして増える。docsは、移行後に残るglobal client stateは小さいと述べる。一方で、visual designerや音楽制作appのように同期的なclient-only stateが大きいappは例外として明記している（行15）。
- 必要な入力：各stateの由来（serverが正本か、clientだけのものか）を事前に分類しておくこと。
- trade-off・失敗の仕方：TanStackはclient state管理の代替ではないと明記している（行15）。境界を誤ってserver dataをclient storeに複製すると、同期の責任がアプリ側に戻る（docsの主張の範囲）。
- 反例・適用しない場合：
  - RTK QueryはRedux storeの中にserver cacheを置く。通常のRedux actionとして見えることを利点に挙げている（`docs/rtk-query/comparison.md` 行17–36）。物理的には同じstoreに入り、境界はslice単位で引かれる。
  - Apolloはreactive varを経由させ、local stateもGraphQL queryから読めるようにしている。
- 互換・非互換：O10（client store）と組み合わせる前提の構造。O08（正規化cache）では、境界がcache内部のfield policyにまで入り込む。
- 限界：docsの主張であり、効果の計測ではない。HELIXでこの分類が成立するかは別途の判断になる。

### P09-O02 serialized keyをcache単位にし、prefixや述語で選んで無効化する
- 出典：
  - TanStack/query `packages/query-core/src/utils.ts` 行205–250（`matchQuery`）、行323–333（`hashKey`）、行343–374（`partialMatchKey`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/utils.ts#L205-L374）
  - `packages/query-core/src/queryClient.ts` 行494–513（`invalidateQueries`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/queryClient.ts#L494-L513）
  - vercel/swr `src/_internal/utils/mutate.ts` 行70–88（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/_internal/utils/mutate.ts#L70-L88）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStack
    - 配列のquery keyを、object keyを並べ替えた決定的なJSON文字列（`hashKey`）にしてcache entryを識別する。
    - `matchQuery`は、`queryKey`（exactまたはprefixの`partialMatchKey`）、`type`（active／inactive）、`stale`、`fetchStatus`、`predicate`の組で対象を選ぶ。
    - `invalidateQueries`は、一致したqueryに`invalidate()`の印を付けてから、`refetchType`に従ってrefetchする。既定ではactiveなqueryだけをrefetchする。「無効の印付け」と「再取得」が別の段になっている。
  - SWR：`mutate`の第1引数に関数を渡すと、cacheの全keyを走査し、filterに合うkeyへ`mutateByKey`を適用する。infiniteとsubscriptionの特殊keyは除外する。
- 解いている問題と前提：mutation後、どのcache entryが古くなったかをアプリが列挙する必要がある。keyを階層的な配列として設計できること（例：資源種別→id）が前提になる。
- 必要な入力：key命名の規約（階層順序、引数objectの扱い）。keyと取得関数の対応。
- trade-off・失敗の仕方：
  - keyの設計が対象の粒度と合わないと、無効化が過大または過小になる。
  - SWR PR #4336（https://github.com/vercel/swr/pull/4336）の本文は、同じ資源がversionやquery引数の違う複数のkeyに分かれると「全permutationを知らないと無効化できない」問題を挙げ、tagを追加した理由にしている（O05）。
- 反例・適用しない場合：RTK Queryはkeyのprefixではなく、endpoint定義で宣言したtagで無効化する（O05）。Apolloはentity IDによる正規化で、多くの更新を自動で反映する（O08）。
- 互換・非互換：O03（staleの印と再取得の分離）、O05（tag）と併用されている。
- 限界：hash方式（JSON化）の前提は、keyがserialize可能であること。値の既定（どのtypeをrefetchするか等）は持ち込まない。

### P09-O03 「古い」の判定と「再取得の契機」を分ける
- 出典：
  - TanStack/query `packages/query-core/src/query.ts` 行495–537（`isStale`、`isStaleByTime`）、行642–646（`invalidate`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/query.ts#L495-L646）
  - `packages/query-core/src/queryObserver.ts` 行915–968（`shouldFetchOn`、`shouldFetchOptionally`、`isStale`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/queryObserver.ts#L915-L968）
  - vercel/swr `src/index/use-swr.ts` 行814–842（focus／reconnect時のrevalidate）（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/index/use-swr.ts#L814-L842）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStack：`Query`は、dataが無い、invalidated、`dataUpdatedAt`からの経過、の3つで「stale」を判定する。`'static'`は常にfreshとする。observerがいる場合は、observerごとの`staleTime`と`enabled`を真の判定元にしている（行496–497のコメント）。
  - 再取得の契機（mount、window focus、reconnect）は`QueryObserver`側の`shouldFetchOn`が判定する。`enabled`が`false`でなく、かつ`staleTime`が`'static'`でない場合に限り、契機の値が`'always'`なら取得、`false`なら抑止、それ以外はstaleの場合だけ取得する。`enabled`が`false`または`staleTime`が`'static'`なら、契機の値によらず取得しない（`queryObserver.ts` 行922–930）。focusの検出は`focusManager`（`visibilitychange`を購読し、`setEventListener`で差し替え可能）に分離されている。
  - SWR：hookごとに`onRevalidate`がFOCUS／RECONNECT／MUTATE／ERROR／UNLOADのeventを受け取る。FOCUSは`focusThrottleInterval`で間引き、`isActive()`のときだけ重複排除付きで再検証する。
- 解いている問題と前提：画面へ戻った時や回線復帰時に、古いdataを表示したまま裏で更新する（stale-while-revalidate）。dataの鮮度は資源ごとに違うことを前提に、閾値をquery／observer単位で与える。
- 必要な入力：資源ごとの鮮度要件。どのeventを再取得の契機にするか。
- trade-off・失敗の仕方：`invalidate()`は印を付けるだけでrefetchしない（docコメント行634–641）。印だけ付いて契機が来なければ、表示は古いまま残る。observerが複数あり`staleTime`が異なる場合、判定はobserverのどれか（`some`）に従う。
- 反例・適用しない場合：
  - RTK Queryは時間ベースのstaleを中心にしていない。`refetchOnMountOrArgChange`、`refetchOnFocus`、`refetchOnReconnect`と、tagの無効化で再取得する（`docs/rtk-query/usage/cache-behavior.mdx` 見出し行155、217、296、375）。
  - zustandにはこの概念が無い。
- 互換・非互換：O02、O06と併用される。
- 限界：staleの時間、focusの間引き間隔などの既定値は持ち込まない。

### P09-O04 購読者の参照数でcacheの寿命を決め、無購読になったら遅延して回収する
- 出典：
  - TanStack/query `packages/query-core/src/removable.ts` 行10–60（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/removable.ts#L10-L60）
  - `packages/query-core/src/query.ts` 行336–340（`optionalRemove`）、行592–616（`removeObserver`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/query.ts#L336-L616）
  - redux-toolkit `packages/toolkit/src/query/core/buildMiddleware/cacheCollection.ts` 行48–53、153–201（https://github.com/reduxjs/redux-toolkit/blob/e7a8b318df28aaf50ced1e65cd4636b7508263b2/packages/toolkit/src/query/core/buildMiddleware/cacheCollection.ts#L153-L201）
  - redux-toolkit `docs/rtk-query/usage/cache-behavior.mdx` 行17–29
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStack：`Query`と`Mutation`は抽象基底`Removable`を継承する。最後のobserverが外れると`scheduleGc`を呼び、`gcTime`の経過後に`optionalRemove`を実行する。observerが0件かつfetchがidleのときだけcacheから外す。`gcTime`は見た中で最長の値を保持する（`updateGcTime`）。
    - 外れる時点でfetch中の場合、abort signalが使われているか、fetchが`paused`かつ状態が`pending`であれば、revertを伴うcancelをする。それ以外はretryだけを止め、結果はcacheに入れる（行598–609、条件は行601–606）。
  - RTK Query：購読をreference countとして数える（docs行29）。無購読になるとendpoint単位または全体の`keepUnusedDataFor`で遅延removeを予約する。発火時に再度無購読かを確認し、実行中のqueryをabortしてから`removeQueryResult`を出す。
- 解いている問題と前提：component単位でmount／unmountが頻繁に起きるUIで、直後の再mountにはcacheを返しつつ、使われないdataを溜めない。
- 必要な入力：資源ごとの保持期間の方針。server側描画で回収しない扱い（TanStackはserver環境で既定値を変えている。値は持ち込まない）。
- trade-off・失敗の仕方：
  - RTKはbrowserの`setTimeout`が32bitで溢れると即時発火する問題に対し、上限で丸めて防御している（行48–51、166–177のコメント）。
  - TanStackのコメントは、transportがcancel非対応なら「結果をcacheできるようにqueryを続行させる」としている（行598–599）。
- 反例・適用しない場合：
  - SWRのcoreには、この形の参照数GCは見当たらなかった（`provider`のcacheをそのまま保持。詳細は未読）。
  - Apolloは正規化storeのGCを別機構（`docs/source/caching/garbage-collection.mdx`、未読）として持つ。
  - zustandのstoreは明示resetまで残る。
- 互換・非互換：O02のcache単位を前提にしている。O08（正規化）では、entity参照の到達可能性で回収するため、単位が異なる。
- 限界：保持期間の値は持ち込まない。

### P09-O05 宣言したtagで無効化し、競合を避けるため実行中のrequestが落ち着くまで遅らせる
- 出典：
  - redux-toolkit `packages/toolkit/src/query/core/buildMiddleware/invalidationByTags.ts` 行23–142（https://github.com/reduxjs/redux-toolkit/blob/e7a8b318df28aaf50ced1e65cd4636b7508263b2/packages/toolkit/src/query/core/buildMiddleware/invalidationByTags.ts#L23-L142）
  - `packages/toolkit/src/query/createApi.ts` 行162–171（https://github.com/reduxjs/redux-toolkit/blob/e7a8b318df28aaf50ced1e65cd4636b7508263b2/packages/toolkit/src/query/createApi.ts#L162-L171）
  - `docs/rtk-query/internal/buildMiddleware/invalidationByTags.mdx` 行101–105
  - PR #3116（https://github.com/reduxjs/redux-toolkit/pull/3116、本文確認済）
  - vercel/swr `src/_internal/utils/cache.ts` 行59–87（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/_internal/utils/cache.ts#L59-L87）、PR #4336（https://github.com/vercel/swr/pull/4336、本文確認済）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - RTK
    - endpoint定義の`providesTags`／`invalidatesTags`から、actionごとにtagを算出する（`calculateProvidedByThunk`）。mutationが成功、またはvalue付きで失敗した時、および`api.util.invalidateTags`が出された時に、`pendingTagInvalidations`へ積む。
    - `invalidationBehavior === 'delayed'`の場合、query／mutationのpending数（counterで追跡）が0になるまで保留する。
    - 実行時には`selectInvalidatedBy`で対象cache keyを求める。購読者が0のentryはremoveし、購読者がいればrefetchする。
  - SWR：`registerTags`はkeyとtagを双方向のmap（`tagKeys`／`keyTags`）で持ち、request決着時のtagで置き換える。`revalidateTag`はtagに属する全keyへ`internalMutate`をかける。
- 解いている問題と前提：
  - PR #3116は次の競合を記述している：query Qが開始し、mutation Mが完了してtag Tを無効化する（この時点でTを提供するqueryは無い）。その後QがTを提供して完了すると、古いdataが残る。
  - 解決策として、query／mutationが実行中ならtagの無効化を保留し、全部が決着してから適用する。同時に、並行するmutationの無効化が自動でまとまる（#2203も解消）。
  - SWR PR #4336は、同じ資源が複数keyへ分かれる場合に、低entropyのtag 1つで無効化できるようにする目的を書いている。
- 必要な入力：資源の種類とidによるtagの語彙。endpointごとにどのtagを提供し、どのtagを無効化するかの宣言。
- trade-off・失敗の仕方：
  - `createApi.ts`のdocコメント（行167–169）は、query／mutationが常に走り続けていると、delayedの無効化が無期限に遅れうることを明記している。
  - `'immediately'`では、実行中のqueryが無効化済みtagを提供しても再取得されない（行165–166）。
- 反例・適用しない場合：
  - TanStackはtagを持たず、key prefixと述語で選ぶ（O02）。
  - Apolloは正規化でentityを共有し、多くの更新に無効化を要しない。ただしlistへの追加は手動である（O08）。
- 互換・非互換：O02とは代替関係（同じ問題への別解）。O07の「rollbackの代わりに無効化する」選択肢の土台になる。
- 限界：保留する条件（全request）や上限は、このrepoの選択である。

### P09-O06 実行中requestの共有（重複排除）と、遅れた応答・重なったmutationの破棄
- 出典：
  - vercel/swr `src/index/use-swr.ts` 行513–515、580–663（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/index/use-swr.ts#L513-L663）
  - vercel/swr `src/_internal/utils/mutate.ts` 行99–116、128–130、172–186、202–203（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/_internal/utils/mutate.ts#L99-L203）
  - TanStack/query `packages/query-core/src/query.ts` 行665–684（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/query.ts#L665-L684）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SWR
    - provider単位のglobal state（`FETCH`、`MUTATION`、`PRELOAD`、`EVENT_REVALIDATORS`）を持つ。`FETCH[key]`は（promise、開始timestamp）の組で、存在すれば後続のhookはそれを待つ（重複排除）。
    - 応答が来た時、`FETCH[key]`の開始時刻が自分の`startAt`と違えば、後発のrequestがあるので自分の結果を捨てる。
    - `MUTATION[key]`は（開始、終了）の組である。fetch開始がmutation開始・終了以前、またはmutationが未終了の場合も結果を捨てる。コメントで3つのcaseを図示している（行627–637）。
    - `mutate`側は、開始時に`MUTATION[key]`を記録する。非同期の結果を待った後、開始時刻が書き換わっていれば（別のmutationが来ていれば）cacheを更新しない。終了時刻を記録した後、`FETCH`／`PRELOAD`を消して重複排除を外し、再検証する。
  - TanStack：`Query.fetch`は、fetchStatusがidleでなく、retryerがrejectedでなければ、既存の`retryer.promise`を返す。`cancelRefetch`かつdataありの場合は、silent cancelしてから新規に取得する。
- 解いている問題と前提：同じkeyを複数componentが同時に購読する画面と、速い連続操作で応答順が入れ替わる通信を前提にしている。
- 必要な入力：requestを同一とみなす単位（key）。後発優先か、既存の共有か、の方針。
- trade-off・失敗の仕方：
  - 捨てた結果は`onDiscarded`で通知される（SWR行616–620、650–654）。
  - SWRは、mutation中に始まったfetchを捨てる代わりに、mutation終了時に再検証をかける（コメント行638）。
  - TanStackは、retryerがrejectedの場合に、pendingに見えても必ず再開する防御を入れている（行671–674のコメント）。
- 反例・適用しない場合：
  - RTKは同じ問題（mutationとqueryの重なり）を、無効化の保留で扱う（O05）。
  - Apolloの楽観的更新はlayerで隔離する（O08）。
- 互換・非互換：O07（SWRの楽観的更新）は、このtimestamp機構と一体になっている。
- 限界：重複排除の間隔などの値は持ち込まない。時刻比較は単一clientのprocess内に限る。

### P09-O07 楽観的更新の3つの持ち方：snapshotをcontextで返す／committed値を退避する／逆patchを残す
- 出典：
  - TanStack/query `docs/framework/react/guides/optimistic-updates.md` 行6、44、84–125（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/docs/framework/react/guides/optimistic-updates.md#L84-L125）
  - vercel/swr `src/_internal/utils/mutate.ts` 行132–150、178–185（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/_internal/utils/mutate.ts#L132-L185）
  - redux-toolkit `packages/toolkit/src/query/core/buildThunks.ts` 行302–317、407–462（https://github.com/reduxjs/redux-toolkit/blob/e7a8b318df28aaf50ced1e65cd4636b7508263b2/packages/toolkit/src/query/core/buildThunks.ts#L407-L462）
  - redux-toolkit `docs/rtk-query/usage/manual-cache-updates.mdx` 行50–71、236–240
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStackには2つの経路がある。
    - UI経路：cacheは触らず、`useMutation`の`variables`と`isPending`で仮の項目を描く。errorでも`variables`は消えない（行44）。
    - cache経路：`onMutate`で関連queryを`cancelQueries`し、`getQueryData`でsnapshotを取り、`setQueryData`で楽観値を書く。返り値（`onMutateResult`）を`onError`でのrollbackに使い、`onSettled`で`invalidateQueries`する（行102–123）。
  - SWR
    - cache entryに、画面表示用の`data`と、退避用の`_c`（committed data）を持つ。`optimisticData`は`data`へ書き、直前のcommitted値を`_c`へ退避する。
    - 失敗し、`rollbackOnError`が真なら`data`を`_c`へ戻す。
    - O06のtimestampで、他のmutationと競合していればrollbackもしない。
  - RTK
    - `updateQueryData`は、immerの`produceWithPatches`で`patches`／`inversePatches`を作る。`PatchCollection.undo`は逆patchを`patchQueryData`として再dispatchする。
    - draft化できない値は、root `replace`のpatchで代替する（行444–452）。
- 解いている問題と前提：応答を待たずに操作結果を見せる。失敗時に元の状態へ戻せることを前提にしている。
- 必要な入力：楽観値をどう作るか（serverの応答形との一致）。失敗時の方針（rollbackか、再取得か）。同一資源への並行mutationの有無。
- trade-off・失敗の仕方：
  - RTK docs（行66–70）は、短時間に重なるmutationでは`.undo`でrollbackすると競合が起きうると述べる。代わりに、失敗時はtagを無効化して再取得するのが「simplest and safest」としている。
  - RTKは、mutationの`onQueryStarted`以外での手動cache更新を避けるよう勧めている。cacheをserver状態の反映と見るため（行236–240）。
  - TanStackのcache経路は、先に`cancelQueries`して進行中のrefetchによる上書きを防ぐ手順を含む。
- 反例・適用しない場合：Apolloは、楽観値をcanonicalなentityとは別のlayerに置き、自動で除去する（O08）。snapshotや逆patchをアプリが持たない。
- 互換・非互換：O05（失敗時に無効化する経路）、O06（SWRの競合判定）と結合している。O08とは同じ問題への別解。
- 限界：UI上の表示の仕方（docs例の不透明度など）は持ち込まない。

### P09-O08 正規化entity cacheと、楽観値を積み重ねるlayer
- 出典：
  - apollo-client `docs/source/caching/overview.mdx` 行57–68、121（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/docs/source/caching/overview.mdx#L57-L68）
  - `src/cache/inmemory/helpers.ts` 行37–62（`defaultDataIdFromObject`）
  - `src/cache/inmemory/policies.ts` 行425–486（`identify`）
  - `src/cache/inmemory/entityStore.ts` 行735–760（`CacheGroup`）、859–929（`Layer.addLayer`／`removeLayer`）（https://github.com/apollographql/apollo-client/blob/9659425dd0f1395d0fd7897ef882ab1082391dc2/src/cache/inmemory/entityStore.ts#L859-L929）
  - `src/cache/inmemory/inMemoryCache.ts` 行735–755
  - `docs/source/performance/optimistic-ui.mdx` 行64–76
  - `docs/source/data/mutations.mdx` 行253–289、386–392
  - `docs/source/caching/cache-configuration.mdx` 行325–331
  - 反対側の一次資料：redux-toolkit `docs/rtk-query/usage/cache-behavior.mdx` 行383–405（https://github.com/reduxjs/redux-toolkit/blob/e7a8b318df28aaf50ced1e65cd4636b7508263b2/docs/rtk-query/usage/cache-behavior.mdx#L383-L405）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 正規化
    - 応答中のobjectを`__typename`と`id`（または`_id`、またはtype policyの`keyFields`）で識別する。`Type:id`のcache IDでflatなtableに格納し、親からは参照（`__ref`）にする。
    - `Policies.identify`は、type policyの`keyFn`または`dataIdFromObject`を辿ってIDを決める。
  - 楽観的更新
    - `Root`の上に`Layer`をlinked listで積む（`addLayer(id, replay)`）。
    - `removeLayer(id)`は、同じIDのlayerをすべて外す。上のlayerはreplayで再構築する。外す際、値が変わるfieldだけをdirtyにする。
    - 楽観layer群と非楽観rootは、別々の`CacheGroup`で依存を追跡する。
    - docsは、楽観値をcanonicalとは別に保存し、応答時に除去して本値で上書き、errorなら破棄すると説明している。
- 解いている問題と前提：同じentityが複数のqueryに現れても、1か所の更新を全queryへ伝える。GraphQLの`__typename`と、安定した識別fieldを前提にしている。
- 必要な入力：型ごとの識別fieldの規約。mutation応答に変更したobjectを含めること（`mutations.mdx` 行293–295の推奨）。
- trade-off・失敗の仕方：
  - 新規作成したobjectはcacheに入るが、それを含むlist（例：`ROOT_QUERY.todos`）は自動では更新されない。`update`関数と`cache.modify`が要る（`mutations.mdx` 行388–390）。または、mutation後に`refetchQueries`で再取得する（同 行253–289「Refetching queries」）。
  - 正規化を無効にした型は親へ埋め込まれ、直接はaccessできない（`cache-configuration.mdx` 行325–331）。
  - RTK docsは、完全な正規化共有cacheを「hard problem」とし、あえて実装しないと明記している。同じobjectがquery結果ごとに複製され、整合は共通tagの無効化と再取得で取る。代わりに`selectFromResult`や`transformResponse`＋`createEntityAdapter`を案内している。
- 反例・適用しない場合：RTK QueryとTanStack Queryはquery結果単位でcacheする（RTK `comparison.md` 行84の比較表で、RTK QueryとReact Queryの正規化は「no」、ApolloとUrqlは「yes」。この表にSWRは含まれない）。SWRも値をkeyごとに保持し、無効化をkey単位で行う（O02の`mutate`によるkey走査、O05の`tagKeys`／`keyTags`）。ただし、SWRが正規化をしないと明記した一次docsは読んでいない。
- 互換・非互換：O02／O05（結果単位の無効化）とは設計の分岐点にあたる。O07とは楽観値の隔離方法が異なる。
- 限界：GraphQLのschemaと型名を前提にしている。REST等へそのまま当てはまることを示すものではない。

### P09-O09 再描画を絞る：構造共有、読まれたfieldの追跡、selector購読
- 出典：
  - TanStack/query `packages/query-core/src/utils.ts` 行388–400、542–565（`replaceEqualDeep`、`replaceData`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/utils.ts#L542-L565）
  - `packages/query-core/src/queryObserver.ts` 行343–366（`trackResult`／`trackProp`）、782–815（`shouldNotifyListeners`）（https://github.com/TanStack/query/blob/f9fe54c960ffe39affe89a7b3dd8a69e6b194fda/packages/query-core/src/queryObserver.ts#L343-L815）
  - `docs/framework/react/guides/render-optimizations.md` 行8–12
  - vercel/swr `src/index/use-swr.ts` 行252–270、663、1005–1023（https://github.com/vercel/swr/blob/9ed1240a4cf799e316a793c22c6800cc6482d389/src/index/use-swr.ts#L1005-L1023）
  - pmndrs/zustand `src/react.ts` 行17–37（https://github.com/pmndrs/zustand/blob/d7a5583cffd80af515f7dfb69583c95cbdc9e2ce/src/react.ts#L17-L37）、`docs/learn/guides/prevent-rerenders-with-use-shallow.md` 行6–12
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TanStack
    - 新dataのうち、旧dataと深く等しい部分木は旧参照を再利用する（構造共有）。
    - observerは結果objectをProxyで包み、読まれたpropertyを`#trackedProps`に記録する。変化したpropertyが追跡集合に含まれるときだけlistenerへ通知する（`notifyOnChangeProps`で上書き可能）。
  - SWR：返却objectの`data`／`error`／`isValidating`／`isLoading`をgetterにし、読まれたものを`stateDependencies`へ記録する。`isEqual`は依存したfieldだけを比べる。fetch結果も`compare`で等しければcache側の参照を保つ。
  - zustand：`useStore`はReactの`useSyncExternalStore`にstoreの`subscribe`と`selector(getState())`を渡す（`src/react.ts` 行30–34）。zustandのcode自身は比較をしない。selector出力を`Object.is`で比べて再描画を決めるのは、Reactの`useSyncExternalStore`の仕様による（React側の実装はこのrepoに無く、読んでいない。zustandのdocs 行8は「Object.isで変化した場合に再描画する」と書く）。毎回新しいobjectを返すselectorには`useShallow`を使う。
- 解いている問題と前提：fetchのたびにJSON parseで参照が変わり、全consumerが再描画される問題。
- 必要な入力：dataがJSON互換であること（構造共有の前提）。consumerごとに必要な部分の指定。
- trade-off・失敗の仕方：
  - TanStackはnon-production時に構造共有の例外を捕捉し、「JSON serializable」であることを要求するerrorを出してから再throwする（`utils.ts` 行553–561）。
  - docsは`structuralSharing: false`や独自関数での回避を案内している。
  - 再帰の深さに上限を設けている（値は持ち込まない）。
- 反例・適用しない場合：
  - RTKは`selectFromResult`で部分を選ぶ（cache-behavior.mdx 行401）。
  - Apolloは`CacheGroup`の依存追跡とresult cachingで再計算を絞る（O08）。
- 互換・非互換：O10（selector購読）と共通の基盤（外部store＋購読）を持つ。
- 限界：深さの上限など内部の値は持ち込まない。

### P09-O10 framework非依存のvanilla storeと、framework adapterの分離（SSRではrequestごとにstoreを作る）
- 出典：
  - pmndrs/zustand `src/vanilla.ts` 行60–100（https://github.com/pmndrs/zustand/blob/d7a5583cffd80af515f7dfb69583c95cbdc9e2ce/src/vanilla.ts#L60-L100）
  - `src/react.ts` 行53–64
  - `docs/learn/guides/nextjs.md` 行6–35（https://github.com/pmndrs/zustand/blob/d7a5583cffd80af515f7dfb69583c95cbdc9e2ce/docs/learn/guides/nextjs.md#L6-L35）
  - `docs/learn/guides/immutable-state-and-merging.md` 行33–36
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `createStore`は、閉包内の`state`と`listeners`のSetだけを持つ。`setState`、`getState`、`getInitialState`、`subscribe`をAPIとして返す。
    - `setState`は、部分値または更新関数を受ける。`Object.is`で変化があれば、1階層だけ`Object.assign`でmergeする（`replace`の指定、または非objectの値なら置換）。そのうえで全listenerに（新、旧）を通知する。
  - React側の`create`は、vanilla storeを作ってhookへ束ね、APIをhookに付与するだけである。
  - TanStackのcore（`query-core`）とRTK Queryのcore（`query/core`、`comparison.md` 行33で「UI-agnostic」と明記）も、同様にframework非依存のcoreとadapterに分かれている。
- 解いている問題と前提：React外（event handler、test、他framework）からも同じstateを読み書きする。storeはmodule state（global変数）として置けることが前提にある。
- 必要な入力：stateの形と、更新を行う関数の置き場（store内のactionか、外部関数か。docsに両方の指針がある）。
- trade-off・失敗の仕方：
  - `set`は1階層しかmergeしない。nested objectは明示的にspreadする必要がある（immutable-state-and-merging.md 行35–36）。
  - Next.js docsは次を挙げている：
    - server側では同時requestがあるため、storeをrequestごとに作り、共有しない。
    - SSRとclientの初期値が異なるとhydration errorになる。
    - React Server Componentはstoreを読み書きしない。
    - 結論として「No global stores」を推奨している（行15–35）。
  - 同docsは、議論（discussions #2740）に基づいて更新予定と注記しており（行6–7）、内容は確定していない。
- 反例・適用しない場合：
  - Apolloのreactive varはcacheと結合し、queryの再計算と連動する（O01）。
  - RTK QueryはRedux storeの一部としてserver cacheを持つ。
- 互換・非互換：O01の「client state側」の受け皿。O09のselector購読と一体になっている。
- 限界：Next.js固有の事情を含む。HELIXのframeworkやruntimeで同じ制約が成立するとは限らない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| mutation後、どのcacheを古いとみなすか | TanStack：key prefix／述語で選び、`invalidate`印→activeのみrefetch（O02） | RTK：endpointに宣言したtagで選ぶ。購読者0ならremove、ありならrefetch（O05）。SWRはkey filterに加え、tagを後から追加（PR #4336） | hookをその場で定義するか、API sliceで事前に一元定義するか（RTK `comparison.md` 行30）。同じ資源が多数のkeyへ分かれるか |
| 同じentityが複数の結果に現れる | Apollo：`Type:id`で正規化し1か所に保持。list追加は`update`／`cache.modify`で手当て（O08） | RTK：結果ごとに複製し、共通tagの無効化と再取得で整合を取る（あえて正規化しない）（O08） | GraphQLの`__typename`とid規約の有無。正規化の実装・理解コストをどう見るか（RTK docsの理由） |
| 楽観的更新のrollback | TanStack：`onMutate`のsnapshotを返し、`onError`で書き戻す | SWR：committed値を`_c`へ退避して戻す。RTK：immerの`inversePatches`で`undo`。Apollo：楽観layerを外してreplay（O07／O08） | 並行mutationの頻度（RTK docsは、重なる場合は無効化を推奨）。cacheが結果単位か、entity単位か |
| queryとmutationの実行時間の重なり | SWR：fetch／mutationの開始・終了timestampを比較し、古い応答を捨てる（O06） | RTK：pending数が0になるまでtagの無効化を保留（O05、PR #3116） | 単一key単位で判定するか、全request単位で判定するか。保留が無期限になる失敗を許容するか |
| cacheの寿命 | TanStack：observerが0件→`gcTime`後に`optionalRemove`（O04） | RTK：購読reference count→`keepUnusedDataFor`後に、abortしてremove（O04） | 時間の単位と設定の階層（endpoint単位か、query単位か）。timerの上限に対する防御 |
| 再描画の抑制 | TanStack／SWR：返却objectで読まれたfieldを追跡し、それだけ比較。加えて構造共有／compare（O09） | zustand：selector出力の`Object.is`（Reactの`useSyncExternalStore`による）＋`useShallow`（O09） | 返り値が固定形の結果objectか、任意の形のstore sliceか |
| server stateとclient stateの置き場 | TanStack：server cacheは専用。client stateは別のlibraryに残す（O01） | Apollo：reactive varとして、同じreactivityでlocal stateも扱う。RTK：同じRedux storeのslice（O01／O10） | 既存storeとの統合やDevToolsを重視するか（RTK）、GraphQLで統一して読むか（Apollo） |

## 見つからなかったこと・gap
- frontend性能の定量評価（bundle size、描画回数の測定結果）は、どのrepoでも一次資料として読んでいない。RTK `comparison.md`にbundle sizeの節（行49）はあるが、未読である。
- SWRに参照数ベースのGCがあるかは確認できていない。`cache.ts`の残り部分と`infinite`は未読。
- ApolloのGC（`garbage-collection.mdx`、`cache.gc()`）と、`cache.evict`による無効化は未読。O04の比較は不完全である。
- XState（statelyai/xstate）は読んでいない。UI stateを状態機械として扱う観察が欠けている。
- offline・永続化（TanStackの`onlineManager`／`network-mode.md`、zustandの`persist` middleware、RTKの`persistence-and-rehydration.mdx`）は未読。
- SSRのhydration（TanStackの`hydration.ts`、RTKの`extractRehydrationInfo`）は、zustandのdocs以外は未読。
- 失敗事例として読んだissue／PRは、RTK #3116とSWR #4336の2件に限る。RTK #2203、#3105、zustand discussions #2740は本文を読んでいない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- TanStack/query（f9fe54c）：
  - `packages/query-core/src/query.ts`（行330–360、490–700）
  - `removable.ts`（1–60）
  - `utils.ts`（205–260、320–400、535–570）
  - `queryClient.ts`（480–535）
  - `queryObserver.ts`（330–368、780–815、905–970）
  - `focusManager.ts`（grepのみ）
  - docs：`does-this-replace-client-state.md`（全文）、`optimistic-updates.md`（grep抽出行）、`render-optimizations.md`（行8–12）
  - 未読：`mutation.ts`、`mutationCache.ts`、`hydration.ts`、`onlineManager.ts`、`infiniteQueryBehavior.ts`、`streamedQuery.ts`、`important-defaults.md`
- vercel/swr（9ed1240）：
  - `src/_internal/utils/mutate.ts`（40–219）
  - `src/_internal/utils/cache.ts`（40–110）
  - `src/index/use-swr.ts`（250–275、505–520、580–665、805–860、1000–1023）
  - `src/_internal/types.ts`（tags部分のgrep）
  - PR #4336
  - 未読：`infinite/`、`mutation/`（useSWRMutation）、`subscription/`、`preload.ts`
- redux-toolkit（e7a8b31）：
  - `packages/toolkit/src/query/core/buildMiddleware/invalidationByTags.ts`（全文）
  - `cacheCollection.ts`（48–60、150–204）
  - `buildThunks.ts`（300–320、405–465）
  - `createApi.ts`（160–180）
  - docs：`comparison.md`（17–48、78–90）、`usage/cache-behavior.mdx`（17–30、383–408）、`usage/manual-cache-updates.mdx`（50–72、227–245）、`internal/buildMiddleware/invalidationByTags.mdx`（95–125）
  - PR #3116
  - 未読：`buildSlice.ts`、`buildInitiate.ts`、`setupListeners.ts`（grepのみ）、`polling.ts`、`queryLifecycle.ts`
- pmndrs/zustand（d7a5583）：
  - `src/vanilla.ts`（55–100）、`src/react.ts`（全文）
  - docs：`learn/guides/prevent-rerenders-with-use-shallow.md`（1–20）、`nextjs.md`（1–40）、`immutable-state-and-merging.md`（grep抽出行）
  - 未読：`middleware/`（persist、devtools、immer）、`slices-pattern.md`、`ssr-and-hydration.md`
- apollo-client（9659425）：
  - `src/cache/inmemory/entityStore.ts`（735–760、855–935）
  - `policies.ts`（420–500）
  - `helpers.ts`（35–62）
  - `inMemoryCache.ts`（725–760）
  - `reactiveVars.ts`（59–80）
  - docs：`caching/overview.mdx`（57–70と見出しgrep）、`caching/cache-configuration.mdx`（325–331）、`data/mutations.mdx`（253–289、293–300、386–392）、`performance/optimistic-ui.mdx`（64–76）、`local-state/reactive-variables.mdx`（1–30）
  - 未読：`readFromStore.ts`、`writeToStore.ts`、`garbage-collection.mdx`、`core/QueryManager`系
- 検索した語：`invalidat*`、`staleTime`、`isStale`、`gcTime`、`keepUnusedDataFor`、`optimistic*`、`rollback`、`undo`、`inversePatches`、`dedupe`、`FETCH[`、`MUTATION[`、`tags`、`revalidateTag`、`invalidationBehavior`、`normaliz*`、`keyFields`、`addLayer`／`removeLayer`、`trackResult`、`stateDependencies`、`useSyncExternalStore`、`visibilitychange`
- gh apiの呼出しは約15回（metadata、commit SHA、PR本文2件、PR検索1回）。本文はcloneで読んだ。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全観察は外部OSSの一次source／docsから導いたものである（「外部観察」）。HELIX内の実績や判断ではない。外部由来をBRAINでどの種別として表すか（HELIXBRAIN-L2-026／027の2.0経路）は未決。
- scope：O08はGraphQL（`__typename`）を前提にし、O10のSSR部分はNext.js固有である。framework・protocolに依存するscopeの付け方は未決。
- 評価根拠：本記録はコード構造とdocsの主張の観察に限る。性能や正しさを検証したものではない。外部での採用実績をHELIXでの有効性の根拠にしない。評価の方法と主体は未決。
- 版：引用はすべて上記の固定commitに限る。上流の更新（例：zustandのNext.js guideは「更新予定」と注記）による陳腐化を、どう検知・再照合するかは未決。
- 状態：全10件は「未評価の候補素材」。HELIX-BRAINへの登録・採否・選定は行っていない。
