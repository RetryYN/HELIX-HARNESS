# P22 Frontendの性能とresponsiveの観察（D04 Frontend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（指標の閾値、寸法、breakpoint、既定値、件数上限、間隔等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：[D04 Frontend](../../brain-domain-material-inventory-20261004/materials/D04-frontend.md)§4の「responsive・browser対応の設計」「frontendの性能（bundle、描画、画像）」（いずれも旧台帳で`todo`、D04-M07）。[P09](P09-frontend-state-data-fetching.md)は状態管理とdata取得を扱い、性能の定量評価とSSRのhydrationを未読としていた。本書はその残りのうち、部分的なhydration、streaming描画、code分割と遅延読込、画像の応答的な配信、性能指標の測り方と予算、layoutの応答性を扱う。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| withastro/astro | https://github.com/withastro/astro | 4c1470a7f907fe678ef5e7dceaa972ca83d297da（default branch: main） | NOASSERTION（root `LICENSE` 冒頭は「MIT License」。APIの値はNOASSERTION） | false | 2026-10-05 | islands（client directive）とserver islands（`server:defer`）を、runtimeのcustom elementと描画関数で行単位に読める。画像のlayout別のsrcset生成と、画像serviceの差替え境界も同じrepoにある |
| vercel/next.js | https://github.com/vercel/next.js | ba80ee48fc319735151c3ad6d9bb9a8180c9f09e（canary） | MIT | false | 2026-10-05 | Suspense境界単位のstreaming、static shell、HTTP statusの制約、Web Vitalsとの対応を、repo内の公式docs（`docs/`）で明文化している。`next/dynamic` と `next/image` の実装も読める |
| QwikDev/qwik | https://github.com/QwikDev/qwik | 5c51580a7059881db63c2a4a7f02acd04d2a13b9（main） | MIT | false | 2026-10-05 | hydrationを行わない「resumability」の実装（global listenerとlazy import）と、確率で順位付けするbundleの先読みqueueがあり、Astroの部分hydrationとの対照になる |
| GoogleChrome/web-vitals | https://github.com/GoogleChrome/web-vitals | 31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404（main） | Apache-2.0 | false | 2026-10-05 | 実利用者の環境（field）で指標を測るlibrary。指標objectの形（value、delta、id、rating、navigationType）、確定の契機、原因の分解（attribution）を読める |
| GoogleChrome/lighthouse | https://github.com/GoogleChrome/lighthouse | db0f40a444a53c6edacc120eb917beceabc00401（main）。budget機能の観察は削除直前の c220a33c4d18ff6b682b426f2beeee554a28336c（削除commit eafd9bee207dc7c6467bcaf3b2f259e0b6105303 の親） | Apache-2.0 | false | 2026-10-05 | 実験室（lab）での測定と採点、測定のばらつきの文書、および性能予算（`budget.json`）の構造と、それをcoreから外した経緯（issue・PR）を読める |
| tailwindlabs/tailwindcss | https://github.com/tailwindlabs/tailwindcss | fa81d697fe572a10ac150d18964a093a7a874081（main） | MIT | false | 2026-10-05 | viewport基準のbreakpointとcontainer queryを、同じtoken名前空間とvariantの仕組みで生成しており、layoutの応答性の構造を行単位で読める |

（lighthouseのbudgetは固定commitのHEADに存在しないため、削除直前の親commitで読んだ。2つのcommitを区別して引用する。）

## 観察

### P22-O01 島（island）ごとに、hydrationの契機を宣言で選び、streaming中の到着と親子の順序を島のruntimeで整える
- 出典：astro、`packages/astro/src/runtime/client/visible.ts` 行4–35（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/client/visible.ts#L4-L35）、`idle.ts` 行3–21（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/client/idle.ts#L3-L21）、`media.ts` 行3–20（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/client/media.ts#L3-L20）、`packages/astro/src/runtime/server/astro-island.ts` 行63–101（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/astro-island.ts#L63-L101）、行109–120（retry）、行139–191（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/astro-island.ts#L139-L191）、行193–207（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/astro-island.ts#L193-L207）、行258–259（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/astro-island.ts#L258-L259）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - 各directiveは `ClientDirective = (load, options, el)` という同じ形の関数である。`load()` がcomponentのmoduleとrenderer（hydrator）を読み込み、返った `hydrate()` を呼ぶ。directiveは「いつ `load` を呼ぶか」だけを決める。
  - `visible` は `IntersectionObserver` で子要素の可視化を待つ（`astro-island` が `display: contents` のため、子を観測するとcommentにある）。`idle` は `requestIdleCallback` を使い、無いbrowserでは `setTimeout` に落とす。`media` は `matchMedia` が一致したとき、または変化したときに読む。`load` と `only` は即時に読む。
  - `astro-island` の `start()` は、属性 `client` のdirectiveが未登録なら `astro:<directive>` eventを待ってから再試行する。module読込の失敗は `astro:hydration-error` eventとして出し、directiveへ例外を漏らさない。読込に失敗したmoduleは、cacheを避けるquery付きURLで1回だけ再試行する（行109–120。browserのmodule mapが失敗をURL単位で保持するため、とcommentにある）。
  - `connectedCallback` は、`await-children` 属性があり文書がまだ読込中なら、子要素の到着を `MutationObserver` で待つ。島の末尾に置かれる `astro:end` のcomment nodeを見つけたら起動する。commentが消された場合に備え、`DOMContentLoaded` も最後の手段として待つ（行71–91のcomment）。
  - `hydrate` は、祖先に `ssr` 属性の残る島（未hydrate）があれば、その `astro:hydrate` eventを待ってから自分をhydrateする。commentは「top-downにhydrateする」ためと書く。hydrate後に `ssr` 属性を外して `astro:hydrate` eventを出す（行258–259）。
- 解いている問題と前提：server描画したpageのうち、対話が必要な部分だけにclientのcodeを送り、その読込と実行の時点を部品ごとにずらす。page全体を1回でhydrateしない。部品の境界が描画時に分かっていることが前提である。HTMLをstreamingで送ると、custom elementの `connectedCallback` が子要素の到着前に走りうる。入れ子の島では、親のhydrateが子を作り直すことがある（行197–198のcomment）。
- 必要な入力：部品ごとの契機の種類（即時、idle、可視、media条件、client専用）、可視判定の余白などの選択肢、部品のmodule URLとrendererのURL、島の終端の印、親子関係（DOM上の入れ子）。
- trade-off・失敗の仕方：
  - 契機を遅らせるほど、利用者が最初に操作したときに読込が始まり、反応が遅れうる（directiveは読込の開始時点だけを決め、先読みはしない）。`idle` の代替経路は待ち時間の固定値に依存する（値は持ち込まない）。`media` は条件が一度も一致しなければ読み込まない。
  - 終端の印が中間のproxy等で消されると、`DOMContentLoaded` まで起動が遅れる。親が遅いdirective（例：可視待ち）なら、子も親を待つ。
- 反例・適用しない場合：Qwikはhydrationそのものを行わず、eventの発生時に該当する関数だけを読む（P22-O07）。Next.jsはSuspense境界単位のselective hydrationで、hydrationの順序をReactが利用者の操作に応じて決める（P22-O05）。
- 互換・非互換：P22-O02（server island）とは、clientで遅らせるかserverで遅らせるかで異なり、併用できる。P22-O03のstreamingと同じ「到着順と起動順のずれ」を、島のruntimeという別の層で解いている。
- 限界：directiveの種類、既定の待ち時間、再試行の待ち時間・回数はこのrepo固有であり、持ち込まない。

### P22-O02 serverでの描画を遅らせる島（server island）：fallbackを先に送り、後から別requestで差し替える
- 出典：astro、`packages/astro/src/runtime/server/render/server-islands.ts` 行35–40（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/render/server-islands.ts#L35-L40）、行88–102（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/render/server-islands.ts#L88-L102）、行177–241（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/runtime/server/render/server-islands.ts#L177-L241）、行249–264。issue：withastro/astro#17870（https://github.com/withastro/astro/issues/17870、closed）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `server:defer` の付いた部品は、初回のHTMLでは `fallback` slotだけを描き、続けて小さなinline scriptを置く（`render`）。scriptは `/_server-islands/<componentId>` へfetchし、応答がstatus 200かつ `text/html` のときだけ、開始commentからscriptまでの間のnodeを応答のHTMLで置き換える（`replaceServerIsland`）。
  - 部品のexport名、props、slotは、描画結果が持つ鍵（`this.result.key`、行177）で暗号化してから送る（`encryptString`、用途ごとに `export:`／`props:`／`slots:` の文脈を付ける）。propsとslotは、空なら暗号化せず空文字列にする（行186–195）。鍵がrequestごとに異なるかは、この範囲には書かれておらず、確かめていない。
  - URLの長さが上限内ならGETにして `<link rel="preload" as="fetch">` をheadに足し、超えるならPOSTでbodyに入れる（`isWithinURLLimit`。上限値は持ち込まない）。
- 解いている問題と前提：利用者ごとに異なる部分（個人化など）のためにpage全体を動的にせず、残りを静的に配信できるようにする。部品のserver側の再描画endpointがあることが前提である。
- 必要な入力：遅らせる部品の指定、fallbackの内容、propsの暗号化鍵、endpointのbase path。
- trade-off・失敗の仕方：
  - 差替えは追加の往復を要する。応答がstatus 200以外か `text/html` 以外なら、何も起きずfallbackが残る（関数冒頭の条件）。
  - GETにできる大きさかどうかで、preloadの有無とcache可能性が変わる。
  - #17870は、server island内でMDXから描いた部品のscoped CSSが出力されない不具合の報告である。遅延境界をまたぐと、page単位で集める資源（CSS）の収集が漏れうる例である（closedで、修正の内容は読んでいない）。
- 反例・適用しない場合：Next.jsは同じ問題を、1本の応答の中でSuspense境界ごとにstreamingして解く（P22-O03）。別requestにはしない。
- 互換・非互換：P22-O03の「static shellと動的部分の分離」と目的は同じで、配送の単位（1本のstream／島ごとのrequest）が異なる。P22-O01（client側の遅延）と併用できる。
- 限界：URL長の上限と暗号方式の詳細は持ち込まない。

### P22-O03 Suspense境界を独立したstreamingの単位にし、static shellを先に送る
- 出典：next.js、`docs/01-app/02-guides/streaming.mdx` 行37–57（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L37-L57）、行59–111、行243–297（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L243-L297）、行371–380（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L371-L380）。信頼性ラベル：primary（公式repo内の設計文書）。本文確認：済
- 何をしているか：
  - 非同期の処理が解決する前に描ける部分（layout、navigation、Suspenseのfallback）を「static shell」と呼び、先に送る。各Suspense境界の中身は、準備でき次第、fallbackと差し替えるinline scriptとcomponent payloadを付けて流す。境界どうしは互いを待たない。
  - `loading.js` を置くと、同じ階層のpageを自動でSuspense境界に包む（layoutの内側、pageの外側）。
  - 文書は「動的なaccess（`params`、`cookies()` など）を、それを使う部品まで押し下げる」ことを勧める。layoutの最上部で `await` すると、その下全体がshellから外れる。
  - prerender時に動的な処理を見つけると、最も近いSuspense境界まで遡る。境界が無ければbuildが失敗する（blocking route error）。上位の `loading.js` があればそこで止まるが、page全体がfallbackに置き換わる。
- 解いている問題と前提：遅いdata取得1つがpage全体の送出を止めないようにする。HTTPのchunked転送と、Reactのserver rendererが境界単位でHTMLを出せることが前提である。
- 必要な入力：境界の位置、fallbackの内容、どの入力が動的か（request時にしか分からないか）の区別。
- trade-off・失敗の仕方：境界が粗いとfallbackの範囲が広がり、細かいと差替えが増える。文書は `loading.js` と `<Suspense>` の違いを、範囲、設定の手間、遷移時の先読み有無で表にしている（`loading.js` は遷移時に先読みされ、Suspenseは既定では先読みされない）。
- 反例・適用しない場合：Astroのserver islandは、遅い部分を別requestにする（P22-O02）。Qwikは描画の分割ではなく、client側の実行codeを分割する（P22-O07）。
- 互換・非互換：P22-O04（streaming開始後はstatusを変えられない）が直接の制約になる。P22-O05（指標への影響）とともに読む必要がある。
- 限界：文書の例に出てくる時間の値は持ち込まない。React側の境界の発動条件（何が境界をfallbackに落とすか）は、React repoを読んでいない。

### P22-O04 streamingを始めた後はHTTPのstatusとheaderを変えられない、という制約から導かれる規則
- 出典：next.js、`docs/01-app/02-guides/streaming.mdx` 行382–386（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L382-L386）、行611–621（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L611-L621）、行675–685、行687–729（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L687-L729）、行731–781（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L731-L781）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 最初のchunkでstatusを確定させるため、streaming中に起きたerrorは最も近い `error.js` 境界がその部分だけを置き換える。statusは変えない。
  - streaming開始後の `notFound()` は404にできず、`<meta name="robots" content="noindex">` を流し込む。開始後の `redirect()` はclient側のredirectになる。本当のstatusが要るなら、`notFound()` を最初の `await` やSuspense境界より前に置く。
  - HTMLしか解釈しないbotには、user agentで判別して、metadataの解決を待ってから送る。
  - 途中の層（reverse proxy、CDN、serverless、圧縮、client）がbufferすると、streamingの効果が失われると列挙し、確かめ方（DevToolsのtiming、chunkの観測、bot用user agentでの比較）を行731以降に書いている。
- 解いている問題と前提：段階的な送出と、HTTPのstatusによる意味の伝達（404、redirect、検索engineの扱い）が両立しないことへの対処。
- 必要な入力：どの判定（存在確認、認可、redirect）をstreaming開始前に終えるか、bot判定の規則、配信経路の各層がbufferするかどうか。
- trade-off・失敗の仕方：判定を前に寄せるほどshellの送出が遅れる。文書は、Cache Components使用時に、prerender時にしか無い入力にshellが依存すると、人には表示できてもbotには描画が失敗しうると書く（行685）。配信経路の設定次第で、実装を変えずに効果が消える。
- 反例・適用しない場合：Astroのserver islandは別requestなので、本体のstatusは島の描画に影響されない（P22-O02）。ただし島の失敗はfallbackが残るだけになる。
- 互換・非互換：P22-O03の前提条件である。
- 限界：client側のbuffer閾値など、文書中の値は持ち込まない。bot判定の一覧は読んでいない。

### P22-O05 描画の分割と性能指標の対応を、指標ごとに書き分ける
- 出典：next.js、`docs/01-app/02-guides/streaming.mdx` 行572–609（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/streaming.mdx#L572-L609）。信頼性ラベル：primary。本文確認：済
- 何をしているか：文書は、streamingが各指標にどう効くかを分けて書いている。
  - TTFB・FCP：shellを先に送るので、data取得時間から切り離される。
  - LCP：LCPの要素がSuspense境界の内側にあると、差替えまで描かれない。要素を境界の外か上に置き、画像には `next/image` の `preload` で `<link rel="preload">` を先頭chunkに入れる。preloadは取得の開始を早めるだけで、描画の時点は境界の差替えに従う。
  - CLS：fallbackと中身の大きさが違うとlayoutがずれる。fallbackを中身と同じ寸法にし、領域を予約する。
  - INP：境界ごとにhydrationを分け（selective hydration）、操作された部分を優先する。境界が無いとpage全体を1回の長い処理でhydrateする。
  - 文書は「境界があればReactはそれを使いうる。遅い回線や混んだCPUでは予期せずfallbackに落ちうる。要らない境界を足さない」と注意している（行586）。
- 解いている問題と前提：描画の分割は、ある指標を良くし、別の指標を悪くしうる。設計の判断を、指標ごとの効き方に分解して書く。
- 必要な入力：pageのLCP要素は何か、fallbackの寸法、どの部分が操作されやすいか。
- trade-off・失敗の仕方：境界を増やすとINPとTTFBに効くが、LCP要素を内側に入れるとLCPが遅れる。境界の発動は実行時の負荷に依存する。
- 反例・適用しない場合：web-vitalsのattributionは、LCPを時間の部分（TTFB、資源の読込待ち、読込時間、描画待ち）に分けて、どこが遅いかを実測で示す（P22-O11）。文書の推論を、実測で確かめる側の仕組みである。
- 互換・非互換：P22-O03、P22-O10（画像のpreload）、P22-O11（指標の測り方）と組み合わさる。
- 限界：指標の閾値は持ち込まない。文書の主張は設計上の説明であり、本書は効果を検証していない。

### P22-O06 client側の部品の遅延読込：`lazy`＋Suspenseと、server描画を外す選択
- 出典：next.js、`packages/next/src/shared/lib/lazy-dynamic/loadable.tsx` 行41–75（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/shared/lib/lazy-dynamic/loadable.tsx#L41-L75）、`docs/01-app/02-guides/lazy-loading.mdx` 行15–20、62–68（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/docs/01-app/02-guides/lazy-loading.mdx#L15-L68）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Loadable` は、loaderを `React.lazy` に渡し、`ssr: false` または `loading` 部品が指定された場合だけSuspenseで包む（それ以外はFragment）。
  - `ssr` が真なら、server描画中に `PreloadChunks` で部品のCSS等を先読みする（commentは、未styleの表示のちらつきを避けるためと書く）。偽なら `BailoutToCSRForNextDynamic` で包み、serverでは描かずclientで描く。
  - 文書は、Server Componentは自動でcode分割され、遅延読込の対象はClient Componentだと書く。`ssr: false` はServer Componentでは使えない。
- 解いている問題と前提：初回のJavaScriptから、すぐには要らない部品を外す。browser APIに依存する部品をserverで描かない。
- 必要な入力：部品ごとに、server描画するか、読込中に何を出すか、どの段階で読むか（文書の例では、検索入力の後で外部libraryを読む）。
- trade-off・失敗の仕方：`ssr: false` の部品は初回HTMLに中身が無く、表示が遅れ、layoutがずれうる。Suspenseで包まない場合、読込中の表示は呼出し側の境界に委ねられる。
- 反例・適用しない場合：Qwikは開発者が分割点を書かず、`$` の付いた関数がすべて分割候補になる（P22-O07）。Astroは部品単位の島で分割する（P22-O01）。
- 互換・非互換：P22-O03（Suspense境界）を共有する。
- 限界：bundlerごとの分割規則（webpack／Turbopack）は読んでいない。

### P22-O07 hydrationをせず、event listenerと状態をHTMLへ直列化して再開する（resumability）
- 出典：qwik、`packages/docs/src/routes/docs/(qwik)/concepts/resumable/index.mdx` 行18–74（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/docs/src/routes/docs/(qwik)/concepts/resumable/index.mdx#L18-L74）、行86–117、`packages/qwik/src/qwikloader.ts` 行1–12、389–432（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/qwik/src/qwikloader.ts#L389-L432）、`packages/docs/src/routes/docs/(qwikrouter)/guides/bundle/index.mdx` 行72–85、133–135（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/docs/src/routes/docs/(qwikrouter)/guides/bundle/index.mdx#L72-L85）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、hydrationを「listener、component tree、application stateの3つをclientで復元すること」と定義し、その費用を「pageの全component codeの取得」と「templateの再実行」と書く。Qwikはこの3つをSSR時に集めてHTMLへ直列化する。
  - listenerは要素の属性（chunkのURLとsymbol名）として書かれる。文書（`resumable/index.mdx` 行72）は、Qwikloaderが要素ごとの多数のlistenerではなく単一のglobal listenerを置くと書く。実装 `qwikloader.ts` 冒頭のcomment（行4）は「browserのeventを特定し、それらにglobal listenerを置く」と書き、listenerはeventの種類ごとに置かれる（要素ごとではない）。eventが起きると、targetから祖先へ遡って属性を探し、capture段階とbubble段階を分けて処理し、該当symbolを `import()` して実行する（`processElementEvent`）。
  - 文書は、直列化できない型（classのprototype、Stream）を制約として明記し、そうした処理はclient専用にするよう書く。アプリも「直列化を前提に書く必要がある」とする。
  - bundle guideは、symbolの束ね方を「1つのchunk」と「symbolごとのchunk」の間の調整として説明し、どれが一緒に使われるかは静的には決められず、実行時の利用の観測が要ると書く（行133–135）。
- 解いている問題と前提：pageの大きさに比例して起動時のcodeの取得と実行が増える問題。serverとclientで同じ状態を直列化できることが前提である。
- 必要な入力：直列化できる状態の設計、symbolとchunkの対応表（manifest）、利用の観測data（束ね方の最適化に使う場合）。
- trade-off・失敗の仕方：最初の操作のときに初めてcodeを取りに行くので、先読みが無いと操作の反応が遅れる（その対策がP22-O08）。直列化できない値は使えない。開発時はsymbolごとにchunkが分かれ、本番と配送の形が違う（bundle guide 行76）。
- 反例・適用しない場合：Astro（P22-O01）とNext.js（P22-O03）は、どちらも部品単位または境界単位でhydrationを行う。
- 互換・非互換：P22-O08（先読みqueue）が前提として要る。P22-O01の「部分的なhydration」とは、復元の単位をeventのhandlerまで細かくする点で異なる。
- 限界：直列化の形式の詳細は読んでいない。文書のfront matterの更新日付は古く、本文の例は属性名 `q-e:` を使っている。全文が固定commitの実装と一致するかは確かめていない。

### P22-O08 bundleの依存graphと確率でqueueを順位付けし、同時の先読み数を絞る
- 出典：qwik、`packages/qwik/src/core/preloader/queue.ts` 行43–80（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/qwik/src/core/preloader/queue.ts#L43-L80）、行95–175（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/qwik/src/core/preloader/queue.ts#L95-L175）、行206–234、`packages/qwik/src/core/preloader/constants.ts` 行12–25（https://github.com/QwikDev/qwik/blob/5c51580a7059881db63c2a4a7f02acd04d2a13b9/packages/qwik/src/core/preloader/constants.ts#L12-L25）、`packages/docs/src/routes/docs/(qwikrouter)/guides/bundle/index.mdx` 行155–157、194–196。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 各bundleは「読まれない確率」を持ち、queueはその昇順に並ぶ。bundleの確率が上がると、依存graphを辿って依存先の確率も調整する。確実に要るもの（静的import）とほぼ確実なもの（動的import）は上限なしで先読みし、それ以外は同時先読み数の上限内で先読みする。小さな変化は伝播させない。
  - 先読みは `<link rel="modulepreload">`（未対応browserでは `preload`）をheadへ足して行い、完了したらlinkを外して次を出す。commentは、Chromeが後から足したmodulepreloadを高優先にしないので、同時に出す数を絞り、高優先のbundleが来たらすぐ出せるようにすると書く（行43–51）。
  - 処理は一定時間ごとにmain threadへ譲る（macro taskで続きを回す）。
- 解いている問題と前提：遅延読込（P22-O07）の欠点である最初の操作時の待ちを、取得の先回りで減らす。build時にbundleの依存graphと取込み確率が作られていることが前提である。
- 必要な入力：bundleの依存graph、取込み確率、同時先読み数の上限、main threadへ譲る間隔。
- trade-off・失敗の仕方：確率の推定が外れると、使わないbundleを取得するか、要るbundleが間に合わない。上限を緩めると帯域を奪い合い、締めると先読みが遅れる。
- 反例・適用しない場合：bundle guide（行155–157、194–196）は、service workerがmanifestを持って先読みする仕組みとして説明している。固定commitのcode（`preloader/`）はmodulepreloadのlinkを使っており、文書と実装の説明が一致していない。どちらが現行の正かは、本書では判断していない。Astroの `client:visible` は先読みせず、可視になってから読む（P22-O01）。
- 互換・非互換：P22-O07と一体である。P22-O02のpreload link（server islandのfetch先）とは、先読みの対象（module／HTML断片）が異なる。
- 限界：同時先読み数の上限、確率の閾値、譲る間隔の値は持ち込まない。

### P22-O09 画像の応答的な配信（1）：layoutの種類から、候補の幅の集合と `sizes` を導く
- 出典：astro、`packages/astro/src/assets/layout.ts` 行34–121（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/assets/layout.ts#L34-L121）、`packages/astro/src/assets/services/service.ts` 行42–140（https://github.com/withastro/astro/blob/4c1470a7f907fe678ef5e7dceaa972ca83d297da/packages/astro/src/assets/services/service.ts#L42-L140）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `getWidths` は、layoutの種類で候補幅の集合を決める。full-widthは「原画像以下の全候補」、fixedは「指定幅とその倍密度（原画像が小さければ原寸）」、constrainedは「指定幅、その倍、候補のうち倍幅と原寸の小さい方以下」を昇順にする。constrainedでも、指定幅と倍幅を含むすべての候補が `w <= maxSize`（倍幅と原寸の小さい方）で絞られる（行74–81）。full-widthは幅を要しないが、それ以外のlayoutで幅が無ければ空を返す（行57–63）。
  - `getSizesAttribute` は、同じlayoutの種類から `sizes` 属性を作る（constrainedは「viewportが指定幅より広ければ指定幅、そうでなければviewport幅」、fixedは指定幅、full-widthはviewport幅）。
  - 画像の変換は `ImageService` interfaceに分けられている。共通の `getURL`、`getSrcSet`、`getHTMLAttributes`（commentはCLSを避けるためwidthとheightを返す例を挙げる）、`validateOptions` に加えて、自前で変換するservice（`LocalImageService`）だけが `parseURL` と `transform` を持つ。外部の画像CDNを使うserviceはURLを返すだけでよい。
- 解いている問題と前提：画面の幅と画素密度に応じて、必要以上に大きい画像を送らない。原画像の寸法が分かっていること、候補幅の一覧（device幅の代表値）を持つことが前提である。
- 必要な入力：layoutの種類、表示上の幅、原画像の寸法、候補幅の一覧、変換を自前で行うか外部に委ねるか。
- trade-off・失敗の仕方：候補が多いほど変換結果が増える（固定commitは、静的生成用に少ない候補の一覧を別に持つ）。`sizes` が実際のlayoutと食い違うと、browserは誤った候補を選ぶ。
- 反例・適用しない場合：Next.jsは、layoutの種類ではなく、利用者が書いた `sizes` 文字列の中のviewport比から候補を絞る（P22-O10）。
- 互換・非互換：P22-O10と同じ問題への別解。P22-O05（CLSとLCP）に直接効く。
- 限界：候補幅の一覧（device名の付いた値）と倍率は持ち込まない。

### P22-O10 画像の応答的な配信（2）：`sizes` の有無で幅記述子と密度記述子を切り替え、遅延読込と先読みの矛盾を検出する
- 出典：next.js、`packages/next/src/shared/lib/get-img-props.ts` 行160–201（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/shared/lib/get-img-props.ts#L160-L201）、行255–276（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/shared/lib/get-img-props.ts#L255-L276）、行425–433、行526–546、行634–668（https://github.com/vercel/next.js/blob/ba80ee48fc319735151c3ad6d9bb9a8180c9f09e/packages/next/src/shared/lib/get-img-props.ts#L634-L668）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `getWidths` は、`sizes` があればその中のviewport比（`vw`）を正規表現で拾い、最小の比で候補を下から切って幅記述子（`w`）のsrcsetにする。`sizes` が無く幅だけがあれば、その幅と倍幅のそれぞれについて、それ以上で最小の候補（無ければ最大の候補）を選び（行195–196）、密度記述子（`x`）にする（commentは、3倍密度を出さない理由を高密度画面の実効解像度で説明している）。どちらも無ければdevice幅の候補で `w` にし、`sizes` を全幅にする。
  - 生成するimg属性では `src` を最後に置く。commentは、Reactが属性を順に更新するので、`src` が先だとSafariが `srcset` と `sizes` の更新前に取得を始め、余分なrequestになると書く（行269–274）。
  - 遅延読込は、`priority`（非推奨）も `preload` も無く、`loading` が `lazy` か未指定のときに有効になる。`data:`／`blob:` のURLは最適化も遅延もしない。`preload` と `loading="lazy"` の同時指定などは、開発時にerrorにする。
  - 開発時（非production）には、`PerformanceObserver` で `largest-contentful-paint` を観測し、LCPと判定された画像が、遅延読込で、`placeholder` が `empty` で、URLが `data:`／`blob:` でない場合に、`loading="eager"` を勧める警告を出す（行644–650）。
- 解いている問題と前提：画像の取得量と、LCP要素の取得の遅れの両方を抑える。既定を遅延読込にしたうえで、LCPになった画像だけを例外にする判断を、開発者に実測で促す。
- 必要な入力：`sizes` 文字列、表示幅、候補幅の一覧、どの画像がLCP要素になるか。
- trade-off・失敗の仕方：`sizes` に `vw` 以外の単位しか無いと、全候補が出る。遅延読込が既定なので、LCP画像に指定を忘れるとLCPが遅れる（警告は開発時のみで、productionでは出ない）。
- 反例・適用しない場合：Astroはlayoutの種類から `sizes` を生成し、利用者に `sizes` を書かせない（P22-O09）。
- 互換・非互換：P22-O05（LCP画像の `preload`）、P22-O11（LCPの測り方）と組み合わさる。開発時の警告は、P22-O11と同じbrowser APIを使った測定の利用例である。
- 限界：候補幅の既定一覧と倍率は持ち込まない。画像最適化endpoint側（変換、cache、remoteの許可）は読んでいない。

### P22-O11 実利用環境（field）での指標の測り方：指標object、確定の契機、評価と閾値の分離、原因の分解
- 出典：web-vitals、`src/lib/bindReporter.ts` 行19–58（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/src/lib/bindReporter.ts#L19-L58）、`src/lib/initMetric.ts` 行23–69（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/src/lib/initMetric.ts#L23-L69）、`src/onLCP.ts` 行183–188、210–273（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/src/onLCP.ts#L210-L273）、`src/types/lcp.ts` 行32–69（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/src/types/lcp.ts#L32-L69）、`README.md` 行216–254（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/README.md#L216-L254）、行890–896、行1271–1280（https://github.com/GoogleChrome/web-vitals/blob/31b81e02f3ecf1eb5e405fdf6b1784e2bd51e404/README.md#L1271-L1280）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 指標は `name`、`value`、`delta`、`id`、`rating`、`navigationType`、`entries` などを持つobjectとして報告される。`navigationType` は、渡された値、bfcacheからの復帰、prerender、破棄後の復元、navigation entryの種類の順で決まる（`initMetric`）。
  - `bindReporter` は、閾値の組（2つの境界）を受け取り、報告のたびに `rating` を3段階で付ける。閾値は指標ごとの定数として別にexportされる（値は持ち込まない）。報告は、呼出し時の `forceReport` か設定の `reportAllChanges` が真のときだけ行う（行42）。そのうえで、前回との差（`delta`）が0でないとき、または前回値がまだ無いとき（差が0でも）に報告する（行45–49）。
  - LCPは、最初の信頼できる入力（keydown、click）か `visibilitychange` で確定させる。確定処理はidle時に回し、INPへの影響を避ける（issue #383を参照するcomment）。scrollは、programから発生させられるので確定の契機にしない（commentでissue #75を参照）。pageが一度隠れた後の描画は数えない。bfcacheから戻ったら、新しい `id` で別の訪問として測り直す。
  - attribution buildは、指標に `attribution` を足す。LCPでは対象要素のselector、画像のURL、および `timeToFirstByte`、`resourceLoadDelay`、`resourceLoadDuration`、`elementRenderDelay` の4つの部分に分解する。
  - READMEは、送信先が上書きを許すなら `id` で値を置き換え、許さないなら `delta` を足し合わせる、という2つの集計方法を示す。`reportAllChanges` は、入力ごとではなく値が変わったときだけ報告するもので、本番での使用は勧めないと書く。
  - 制約として、iframe内を測れないこと（同一originでも各frameに入れてpostMessageで集める必要がある）、そのためiframeのあるpageでは集計の定義が公開のfield dataと異なることを明記している（行1271–1280）。
- 解いている問題と前提：実利用者の環境で、いつ値が確定したかが分からない指標（LCP、CLS、INP）を、送信可能な形にする。browserのPerformance APIがあることが前提で、未対応のbrowserでは報告されない。
- 必要な入力：指標ごとの閾値の組、送信先の集計方式（上書きか差分の合算か）、soft navigation（SPAの画面遷移）を別の訪問として扱うか、attributionで何を送るか。
- trade-off・失敗の仕方：確定の契機の選び方で値が変わる（scrollを除くなど）。soft navigationの扱いは対応browserとそれ以外で報告が異なる（README 行273、293）。attributionは資源のtiming entryをbufferするため、memoryを使う（README 行927）。
- 反例・適用しない場合：Lighthouseは実験室の1回の読込を、模擬した回線・CPUで測り、採点する（P22-O12）。同じ名前の指標でも、測る環境と定義が違う。
- 互換・非互換：P22-O10の開発時警告は、同じ `largest-contentful-paint` entryを使う。P22-O13（予算）が閾値をどこに持つかと関係する。
- 限界：指標の閾値、bufferの件数は持ち込まない。INP、CLSの実装は見出しとtypeだけを読み、本体は読んでいない。

### P22-O12 実験室（lab）での測定：端末の種類ごとの採点曲線と、ばらつきへの対処
- 出典：lighthouse（HEAD）、`core/audits/metrics/largest-contentful-paint.js` 行35–96（https://github.com/GoogleChrome/lighthouse/blob/db0f40a444a53c6edacc120eb917beceabc00401/core/audits/metrics/largest-contentful-paint.js#L35-L96）、`docs/variability.md` 行1–21（https://github.com/GoogleChrome/lighthouse/blob/db0f40a444a53c6edacc120eb917beceabc00401/docs/variability.md#L1-L21）、行51–63（https://github.com/GoogleChrome/lighthouse/blob/db0f40a444a53c6edacc120eb917beceabc00401/docs/variability.md#L51-L63）、行79–94。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 指標のauditは、`defaultOptions` に端末の種類（mobile／desktop）ごとの採点の制御点（`p10` と `median`）を持ち、`Audit.computeLogNormalScore` で測定値を0〜1の点に変換する。commentは、制御点をHTTP Archiveの分布の百分位から取ったと書く（値と百分位は持ち込まない）。実行時は `context.settings.formFactor` で制御点を選ぶ。
  - `variability.md` は、ばらつきの源（page自体の非決定性、手元の回線、幹線網、web server、client hardware、資源の奪い合い、browserの非決定性）を表にし、模擬throttling、DevTools throttling、throttlingなしのそれぞれがどれを緩和するかを書く。
  - 対処として、十分な性能の専用機で回す、同じ機械で並行に回さない、外部要因を隔てる、複数回測って中央値などの集約値で判断する、を挙げる。
- 解いている問題と前提：同じcodeでも測るたびに値が変わる中で、比較可能な数値を得る。模擬throttlingは、観測した処理時間を使って読込を再計算する方式である（throttling.mdは読んでいない）。
- 必要な入力：端末の種類、throttlingの方式、測定回数と集約の方法、測定環境の条件。
- trade-off・失敗の仕方：文書は、page内のA/B testなどの非決定性はどの方式でも緩和できないと書く。共有の機械や共有coreの環境では結果が不安定になる。採点の制御点は分布から決めた値で、改訂されうる。
- 反例・適用しない場合：web-vitalsは実利用者の環境で測り、ばらつきを除かずに分布として集める（P22-O11）。
- 互換・非互換：P22-O13（予算）の判定対象になる値を作る側である。
- 限界：制御点、推奨する機械の性能、回数、費用の値は持ち込まない。Performance全体の重み付けはrepo外の文書へのlinkで、読んでいない。

### P22-O13 性能予算（budget）の構造：timing・資源の大きさ・資源の数、pathでの適用、そしてcoreから外した経緯
- 出典：lighthouse（削除直前の親commit）、`docs/performance-budgets.md` 行1–10（https://github.com/GoogleChrome/lighthouse/blob/c220a33c4d18ff6b682b426f2beeee554a28336c/docs/performance-budgets.md#L1-L10）、行102–174（https://github.com/GoogleChrome/lighthouse/blob/c220a33c4d18ff6b682b426f2beeee554a28336c/docs/performance-budgets.md#L102-L174）、`core/config/budget.js` 行136–152（https://github.com/GoogleChrome/lighthouse/blob/c220a33c4d18ff6b682b426f2beeee554a28336c/core/config/budget.js#L136-L152）、行284–331（https://github.com/GoogleChrome/lighthouse/blob/c220a33c4d18ff6b682b426f2beeee554a28336c/core/config/budget.js#L284-L331）。lighthouse（HEAD）、`changelog.md` 行1233–1236（https://github.com/GoogleChrome/lighthouse/blob/db0f40a444a53c6edacc120eb917beceabc00401/changelog.md#L1233-L1236）。issue：GoogleChrome/lighthouse#15203（https://github.com/GoogleChrome/lighthouse/issues/15203）、PR #15950（https://github.com/GoogleChrome/lighthouse/pull/15950、merge済み）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `budget.json` はbudget objectの配列で、各objectは `path`、`options`（first partyのhostname）、`timings`（指標ごとの上限）、`resourceSizes`（資源の種類ごとの転送量の上限）、`resourceCounts`（資源の種類ごとの数の上限）を持つ。資源の種類には `third-party` と `total` が含まれる。
  - `path` はrobots.txt形式のpatternで、複数が一致したら最後に書かれたものを使う（`getMatchingBudget` は配列を後ろから探す）。文書は「全体の予算を先に、上書きする予算を後に」書くよう求める。
  - 知らないpropertyや重複した種類は、読込時にerrorにする（`assertNoExcessProperties` は行296・302、`assertNoDuplicateStrings` は `resourceSizes`／`resourceCounts`／`timings` ごとに行311–328）。
  - issue #15203は、予算が「core scoringの上にある第二の採点とreport」で構造的に収まりが悪く、code量も大きいとして、coreからの削除を提案した。代替として、Lighthouse CIの `assert` が `budgets.json` を判定形式として扱えること、結果をexit statusに反映すること、より多くの条件を書けることを挙げた。PR #15950で削除され、changelogではv12の破壊的変更に「remove budgets」とある。
- 解いている問題と前提：性能の劣化を、指標の値と、その原因になる資源の量の両方で、pageごとに上限として表し、自動で検出する。測定値が安定して比較できることが前提である（P22-O12）。
- 必要な入力：適用するpageのpattern、指標ごとの上限、資源の種類ごとの大きさと数の上限、first partyの範囲、違反時にどう扱うか（reportに出すか、CIを止めるか）。
- trade-off・失敗の仕方：
  - 測定器の中に予算の判定を持つと、測定と判定の責務が混ざる（#15203の主張）。判定を外に出すと、別の道具の導入が要る。
  - 予算の判定結果がreport内のauditに埋もれ、CIの成否に直結しない（#15203が挙げた欠点）。
  - 「最後に一致したもの」を使う規則は、書く順序を誤ると全体の予算が上書きされずに残る。
- 反例・適用しない場合：web-vitalsは閾値で `rating` を付けるだけで、予算の違反判定や停止はしない（P22-O11）。
- 互換・非互換：P22-O12の値を入力にする。P22-O11のfieldの値に同じ形の予算を当てる仕組みは、読んだ範囲では見つからなかった。
- 限界：予算の値は持ち込まない。Lighthouse CIのrepositoryは読んでおらず、`assert` の形式はissueの記述に限る。

### P22-O14 layoutの応答性：viewport基準のbreakpointとcontainer queryを、同じtoken名前空間と順序付けで生成する
- 出典：tailwindcss、`packages/tailwindcss/src/variants.ts` 行1002–1110（https://github.com/tailwindlabs/tailwindcss/blob/fa81d697fe572a10ac150d18964a093a7a874081/packages/tailwindcss/src/variants.ts#L1002-L1110）、行1112–1221（https://github.com/tailwindlabs/tailwindcss/blob/fa81d697fe572a10ac150d18964a093a7a874081/packages/tailwindcss/src/variants.ts#L1112-L1221）、`packages/tailwindcss/src/utils/compare-breakpoints.ts` 行1–48（https://github.com/tailwindlabs/tailwindcss/blob/fa81d697fe572a10ac150d18964a093a7a874081/packages/tailwindcss/src/utils/compare-breakpoints.ts#L1-L48）、`packages/tailwindcss/src/utilities.ts` 行6064–6083（https://github.com/tailwindlabs/tailwindcss/blob/fa81d697fe572a10ac150d18964a093a7a874081/packages/tailwindcss/src/utilities.ts#L6064-L6083）。issue：tailwindlabs/tailwindcss#14204（https://github.com/tailwindlabs/tailwindcss/issues/14204、closed、v3系の報告）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - viewport基準のbreakpointは、theme の `--breakpoint` 名前空間のtokenごとに静的variant（名前付き）を登録し、`@media (width >= 値)` を生成する。`min-*`／`max-*` は任意の値も受ける。
  - container queryは、別の `--container` 名前空間を使い、`@`／`@min`／`@max` variantで `@container (width >= 値)` 等を生成する。modifierを付けると名前付きcontainerを対象にする。対になる `@container` utilityは `container-type`（既定はinline-size）と、modifierがあれば `container-name` を出す。
  - どちらも、variantの並び順を、tokenの解決値で比べて決める（`compareBreakpointVariants`）。目的は、CSSの後勝ちの規則で小さい条件が大きい条件を上書きしないようにすることと考えられる（この理由は観察からの推論で、出典のcommentには書かれていない）。`var(` を含む値は解決値が `null` になり、昇順では先頭、降順では末尾に置かれる（`variants.ts` 行1014–1017、1043）。
  - `compareBreakpoints` は、まず単位（またはCSS関数名）で群に分け、群の間は群名（単位名）の文字列順、群の中は数値順で比べる（行24–28）。数値で比べられないもの（`calc` 等）は文字列順にして結果を安定させる。
- 解いている問題と前提：画面全体の幅ではなく、部品が置かれた領域の幅に応じてlayoutを変える（container query）。viewportの条件と同じ書き方・順序規則で扱えるようにする。寸法の値はtheme tokenとして利用側が持つ前提である。
- 必要な入力：breakpointのtokenの集合、containerの幅のtokenの集合、どの要素をcontainerにするか（container-type、名前）。
- trade-off・失敗の仕方：
  - 単位の違うbreakpointが混ざると、群ごとにしか順序付けできず、cascadeの順序が意図とずれうる。#14204（v3系）は、既定のbreakpoint（別単位）を一部だけ上書きした結果、単位が混在し、小さい条件のclassが大きい条件を上書きした報告で、maintainerは「単位が揃っていなければ並べ替えず、利用者が意図した順と見なす」とv3の挙動を説明している。固定commit（v4系）の `compareBreakpoints` は群ごとに比べる実装で、v3と同じ挙動かは確かめていない。
  - container queryは、祖先にcontainer指定が無いと効かない（utilityとvariantが分かれているため、片方だけ書く誤りがありうる）。
- 反例・適用しない場合：Astroの画像の `sizes`（P22-O09）は、viewport幅だけを条件にしており、containerの幅は使わない。画像の候補選択はbrowserがviewport基準で行うためである（この理由は観察からの推論で、出典の記述ではない）。
- 互換・非互換：P22-O09・O10（画像の `sizes`）とは、layoutの応答性をCSSで表すか、取得する資源の選択で表すかで役割が分かれる。[P06](P06-typography-grid-tokens.md)（design token）のtoken名前空間の観察と関係する。
- 限界：breakpointとcontainer幅の値（`theme.css` の既定token）は持ち込まない。browserのcontainer queryの対応状況は読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| clientのcodeをどの単位で、いつ実行するか | Astro：島（部品）ごとにdirectiveで契機を宣言してhydrateする（O01） | Qwik：hydrationをせず、eventが起きたhandlerだけを読む（O07）。Next.js：Suspense境界ごとのselective hydration（O05） | 状態とlistenerをHTMLへ直列化できるか。部品境界を描画時に保持するか |
| 遅い部分でpage全体を止めない | Next.js：1本の応答の中で境界ごとにstreamingする（O03） | Astro server island：fallbackを先に出し、島ごとに別requestで差し替える（O02） | HTTPのstatusを本体で保ちたいか（O04）。追加の往復を許すか |
| 遅延読込の欠点（初回操作の待ち）への対処 | Qwik：依存graphと確率で順位付けした先読みqueue（O08） | Astro `client:visible`：先読みせず可視時に読む（O01） | build時に依存graphと確率を持つか |
| 画像の候補幅と `sizes` | Astro：layoutの種類から候補幅と `sizes` を生成する（O09） | Next.js：利用者の `sizes` のviewport比から候補を絞り、無ければ密度記述子（O10） | `sizes` を利用者に書かせるか、layoutの宣言から導くか |
| 指標の測定環境 | web-vitals：実利用者の環境で、確定の契機を決めて報告し、原因を分解する（O11） | Lighthouse：模擬した回線・CPUで1回の読込を測り、採点する。ばらつきは複数回の集約で扱う（O12） | 実環境の分布が要るか、変更前後の比較が要るか |
| 予算の判定をどこに置くか | Lighthouse（v12前）：測定器のcoreに `budget.json` の判定を持つ（O13） | Lighthouse（v12以降）：coreから外し、CI側の `assert` に委ねる（O13、#15203）。web-vitals：`rating` を付けるだけ（O11） | 測定と判定の責務を分けるか。CIの成否に直結させるか |
| layoutの応答の条件 | Tailwind：viewport条件（`--breakpoint`）とcontainer条件（`--container`）を同じ順序規則で生成（O14） | Astro画像：viewport基準の `sizes` だけ（O09） | 部品の置かれた領域の幅を条件にできるか |

## 見つからなかったこと・gap
- browser対応（対応browserの範囲の決め方、polyfill、段階的な機能縮退）の設計規則は、読んだ範囲では見つからなかった。web-vitalsのREADMEに `Browser Support` 節（行1258）があるが、本文は読んでいない。D04のgap「responsive・browser対応の設計」のうちbrowser対応側は、本書では埋まっていない。
- bundleの大きさの予算と、bundle分析（何がどれだけ入っているか）の仕組みは、Lighthouseの `resourceSizes`（O13）以外に読んでいない。Next.jsのbundle analyzer、size-limit系の道具は対象外にした。
- fontの配信（読込戦略、layoutのずれ）は読んでいない。Next.jsの `next/font` とAstroのfont機能は対象外にした。
- 実利用環境の値（field）に予算を当て、劣化を検出する仕組みは、読んだ範囲では見つからなかった（O13の互換欄）。
- Reactの境界の発動条件（何が境界をfallbackに落とすか）は、Next.jsの文書がReactの文書へlinkしているだけで、React repoは読んでいない。
- Qwikのbundle guideと実装の不一致（service workerかmodulepreloadか、O08）について、移行の判断記録（ADR、issue）は探していない。
- ADR形式の設計記録は、6 repoとも見当たらなかった（根拠は公式docs、code comment、issue、changelogにある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout`（core.hooksPathを無効化）し、固定commitのfileを `git show <sha>:<path>` で読んだ。読むだけで、build・test・script・hook・package managerは実行していない。`gh api`／`gh issue`／`gh pr`／`gh search` の呼出しは約15回。
- astro：`packages/astro/src/runtime/client/{visible,idle,media,only,load}.ts`（全体）、`runtime/server/astro-island.ts`（1–270）、`runtime/server/render/server-islands.ts`（全体）、`assets/layout.ts`（全体）、`assets/services/service.ts`（1–140、目次）、root `LICENSE`（冒頭）。issue #17870。検索した語：`server island`（issue）。読んでいないもの：`runtime/server/render/streaming.ts`、`core/client-directive/*`、`assets/services/sharp.ts`、`transitions/`、withastro/docs（別repo）。
- next.js：`docs/01-app/02-guides/streaming.mdx`（全体の見出しと本文。codeの例は読み飛ばした）、`docs/01-app/02-guides/lazy-loading.mdx`（見出しと本文）、`packages/next/src/shared/lib/lazy-dynamic/loadable.tsx`（全体）、`shared/lib/get-img-props.ts`（158–280、420–435、520–550、620–672）、`server/app-render/create-component-tree.tsx`（`loading` の出現箇所のみ）。読んでいないもの：`client/components/layout-router.tsx`、`docs/.../loading.mdx`、`images.mdx`（config）、`image-loader.ts`、画像最適化endpoint、`next/font`。
- qwik：`packages/docs/src/routes/docs/(qwik)/concepts/resumable/index.mdx`（全体）、`docs/(qwikrouter)/guides/bundle/index.mdx`（見出しと本文）、`packages/qwik/src/qwikloader.ts`（1–12、380–530）、`core/preloader/queue.ts`（1–300）、`core/preloader/constants.ts`（全体）。読んでいないもの：`core/preloader/bundle-graph.ts`、`bridge.ts`、optimizer（Rust）、`advanced/qwikloader`・`concepts/progressive` の文書、repo内のblog記事（blogは根拠にしない方針のため除外）。
- web-vitals：`src/lib/bindReporter.ts`、`initMetric.ts`（全体）、`src/onLCP.ts`（全体）、`src/types/base.ts`（1–140）、`src/types/lcp.ts`（32–110）、`README.md`（見出し、216–256、873–937、1271–1281）。読んでいないもの：`onINP.ts`、`onCLS.ts`、`lib/InteractionManager.ts`、`lib/softNavs.ts`、`attribution/*` の実装本体。
- lighthouse：HEADの `core/audits/metrics/largest-contentful-paint.js`（全体）、`docs/variability.md`（全体）、`docs/scoring.md`（冒頭）、`changelog.md`（1180–1240、budgetの出現箇所）。親commitの `docs/performance-budgets.md`（全体）、`core/config/budget.js`（目次、136–165、284–340）。`git log --diff-filter=D` で削除commitを特定。issue #15203（本文と一部のcomment）、PR #15950（題名・本文・状態）。読んでいないもの：`core/scoring.js`、`docs/throttling.md`、`core/audits/performance-budget.js`・`timing-budget.js` の本体、GoogleChrome/lighthouse-ci（別repo）。
- tailwindcss：`packages/tailwindcss/src/variants.ts`（330–470の目次、1000–1235）、`src/utils/compare-breakpoints.ts`（全体）、`src/utilities.ts`（6060–6092）、`theme.css`（`--breakpoint` の出現箇所のみ。値は持ち込まない）。issue #14204（本文とmaintainerのcomment）。検索した語：`mixed units breakpoints`、`rem px breakpoints sorting`（後者は該当なし）。読んでいないもの：v3系のcode、`@tailwindcss/container-queries`（旧plugin）。
- 検索した語（code）：`hydrat`、`preload`、`prefetch`、`IntersectionObserver`、`requestIdleCallback`、`Suspense`、`loading`、`sizes`、`srcSet`、`largest-contentful-paint`、`budget`、`container`、`breakpoint`。
- 選ばなかった候補：facebook/react（selective hydrationの実装。範囲が大きく、Next.jsの文書の記述で代えた）、GoogleChrome/lighthouse-ci（予算の判定の移行先。今回は6 repoの上限に合わせ、issueの記述に留めた）、sveltejs/kit、remix-run/react-router（streaming。Next.jsと同種のため省いた）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。Next.jsとQwikの観察の多くはrepo内の公式文書に拠っており、codeの観察とは根拠の強さが異なる。Qwikでは文書と実装が食い違う箇所がある（O08）。文書由来と実装由来の区別をどう記録するかは未決。
- scope：観察は、描画の分割、clientのcode配送、画像配送、指標の測定、layoutの条件に限っている。D04のどの層（設計の知識、実装の型、検証の手段）へ対応させるかは未決。O11〜O13の測定・予算は、検証技法（SCF-B-0153の領域）とも重なり、主な領域の決め方は未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。Next.jsの文書にある指標への効果（O05）は、本書では検証していない。
- 版：固定commit SHAで版を表す。Lighthouseのbudgetは、現行版に存在しない機能を削除前のcommitで観察しており、「廃止された設計」をどう扱うか（反例とするか、検討履歴とするか）は未決。Tailwindの#14204はv3系の報告で、固定commit（v4系）との違いを確かめていない。指標の定義と閾値は版で変わる（D04 §3の注記）。再観察の要否は未決。
- 状態：全観察（P22-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
