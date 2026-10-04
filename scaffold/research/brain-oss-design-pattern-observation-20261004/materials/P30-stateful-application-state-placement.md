# P30 状態を持つapplicationの責務の置き場：sessionの保存先・失効・固定化対策・store差し替え境界の観察（D02 Application architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、timeout、有効期間、長さ、件数、容量等）は持ち込まない。技術選定・採用推奨ではない。
値の線引き：既定の挙動（どの保存先が既定か、既定でどの条件のときに保存するか等の非数値の挙動）は書く。数値の既定値・上限・期間は、出典に書かれていても写さない。
扱う範囲：D02 §gap「状態を持つapplication（session、cache、background job）の責務の置き場」のうち、sessionの置き場と、process内に状態を持たない設計を扱う。cacheの無効化はP28、background jobの実行構造はP08で扱っており、本書では重ねない（cacheはsessionの保存先として使う場合だけを扱う）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| spring-projects/spring-session | https://github.com/spring-projects/spring-session | f064cfc746c1d2b32247d70629b3959eb52736c6（default branch: main） | Apache-2.0 | false | 2026-10-05 | sessionの保存先をapplication containerから切り離す専用の部品。store interface（`SessionRepository`）、session IDの受渡し（`HttpSessionIdResolver`）、保存の時機（`SaveMode`・`FlushMode`）が別々の型として読める |
| rails/rails | https://github.com/rails/rails | 4088f9d2ef00f9b85493362fb6f4b2526bd5d314（main） | MIT | false | 2026-10-05 | 既定の保存先がclient側（暗号化cookie）で、server側storeと同じ抽象（`AbstractSecureStore`）に並べている。security guideがcookie保存の限界（replay、失効）と固定化対策を書いている |
| django/django | https://github.com/django/django | a461af8ce48762d7ec602260aaff81014ddccbcb（main） | BSD-3-Clause | false | 2026-10-05 | 既定の保存先がDBで、cache・cached_db・file・署名cookieを同じ`SessionBase`の差し替えとして持つ。login時のID再発行と、認証情報に結び付けた失効を実装で読める |
| expressjs/session | https://github.com/expressjs/session | 96ebea4b6cd805584fba04523773b1b918a836d7（master） | MIT | false | 2026-10-05 | cookieにはIDだけを置き、dataはserver側storeに置くmiddleware。store実装に求めるmethodを必須・推奨・任意に分けて文書化している。保存するかどうかの判定（hash比較）と並行requestの上書きの注意がある |
| heroku/12factor | https://github.com/heroku/12factor | 1385d2c80bac38c25647651f6f5ec769561828dc（main） | MIT | false | 2026-10-05 | process内に状態を持たない設計（Processes）と、保存先を差し替え可能な外部資源として扱う考え方（Backing services）の原文。sticky sessionへの立場が明記されている |

（5 repositoryとも、cloneは`git clone --filter=blob:none --no-checkout`の後に固定commitをcheckoutした。rails/railsとdjango/djangoはsparse checkoutで、session・auth・guide・docsの該当directoryだけを取り出した。）

## 観察

### P30-O01 processに状態を持たず、残す必要のあるdataは外部の保存先へ置く（stateless process）
- 出典：12factor、`content/en/processes.md` 行8–14（https://github.com/heroku/12factor/blob/1385d2c80bac38c25647651f6f5ec769561828dc/content/en/processes.md#L8-L14）、`content/en/concurrency.md` 行8–12（https://github.com/heroku/12factor/blob/1385d2c80bac38c25647651f6f5ec769561828dc/content/en/concurrency.md#L8-L12）。expressjs/session、`README.md` 行36–39（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L36-L39）、`index.js` 行150–155（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L150-L155）。信頼性ラベル：primary（公式source repositoryの文書とコード）。本文確認：済
- 何をしているか：
  - 12factorのProcessesは、processはstatelessでshare-nothingであり、残す必要のあるdataは状態を持つbacking service（典型的にはDB）に置く、と書く（行8）。processのmemoryやfilesystemは、1つのtransactionの間だけの短いcacheとして使ってよいが、後続のrequestやjobで使えると仮定しない（行10）。理由として、同じ種類のprocessが複数動けば後続requestは別のprocessに届きうること、1 processでもdeploy・設定変更・再配置による再起動でlocalの状態が消えることを挙げる。
  - 同文書は、session dataをprocessのmemoryに置き、同じ利用者の後続requestを同じprocessへ回すsticky sessionを、twelve-factorに反するものとし、使うべきでない・頼るべきでないと書く（行14）。session stateは、時間で失効する機能を持つdatastoreが候補になる、と書く（同行）。
  - Concurrencyは、share-nothingで水平に分割できるprocessであることが、並行度を増やす操作を単純にする、と書く（行12）。
  - expressjs/sessionの既定の保存先`MemoryStore`は、READMEで、意図的にproduction向けに設計していない、多くの条件でmemoryを漏らす、1 processを越えてscaleしない、debugと開発用である、と警告されている（行36–39）。`NODE_ENV`がproductionで`MemoryStore`を使っている場合は、起動時に警告を出す（`index.js` 行150–155）。
- 解いている問題と前提：processを任意に増減・再起動できる実行環境で、利用者の状態が特定のprocessに縛られないこと。前提は、requestがどのprocessに届くかをapplicationが制御しないこと（load balancerやprocess managerが決める）。
- 必要な入力：どのdataが「残す必要がある」か（1 request・1 transactionで捨ててよいものとの区別）、外部の保存先（DB、時間で失効するdatastore等）、process数を増減する運用の有無。
- trade-off・失敗の仕方：保存先への往復がrequestごとに増える。保存先が新しい依存先・障害点になる（P30-O14のstore切断時の扱い）。12factor自身は、sticky sessionを使わない代わりに何を払うかを定量的には書いていない。
- 反例・適用しない場合：保存先をclient（cookie）に置く方式（P30-O07）は、server側に共有storeを置かずにprocessをstatelessに保つ別解である。12factorの文書は「datastoreが候補」とだけ書き、cookie保存には触れていない。開発用・単一processの場合、express-sessionはin-process storeを既定にしている（ただし警告付き）。
- 互換・非互換：P30-O02（保存先の差し替え）、P30-O03（store interface）の前提になる。sticky sessionを前提にする設計とは非互換。12factorの`disposability.md`（workerの停止時にjobをqueueへ戻す、jobをreentrantにする）は、P08-O04・O05の主題（止まったjobの救出、lockの失効）と重なる。P08自身は12factorを出典にしていない。
- 限界：12factorは方法論の文書であり、実装ではない。「should never be used」は同文書の立場であり、HELIXで成立する規則を意味しない。

### P30-O02 保存先を、設定だけで付け替えられる外部資源として扱う（attached resource）
- 出典：12factor、`content/en/backing-services.md` 行8–14（https://github.com/heroku/12factor/blob/1385d2c80bac38c25647651f6f5ec769561828dc/content/en/backing-services.md#L8-L14）。django、`django/contrib/sessions/middleware.py` 行12–22（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/middleware.py#L12-L22）。rails、`guides/source/action_controller_overview.md` 行1211–1221（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/action_controller_overview.md#L1211-L1221）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 12factorは、networkごしに使う保存先・queue・cache等をbacking serviceと呼び、localのものと第三者のものをcodeの上で区別しない、と書く（行8）。どちらもconfigに置いたURL等の位置情報で参照し、付け替えにはconfigの資源handleだけを変えればよい、とする（同行）。不調なDBを外して、backupから復元した新しいDBを付け直す例を挙げる（行14）。
  - DjangoのSessionMiddlewareは、生成時に設定`SESSION_ENGINE`が指すmoduleをimportし、その`SessionStore` classを使う（行15–18）。requestごとにcookieから取り出したsession keyで`SessionStore`を生成する（行20–22）。保存先の選択は設定値1つで、middleware側のcodeは保存先を知らない。
  - Railsのguideは、`config.session_store`に保存先の種類（例：`:cache_store`）を渡して選ぶ、と書く（行1215–1221）。
- 解いている問題と前提：保存先の種類や所在を変えるときに、applicationのcodeを変えないこと。前提は、保存先がP30-O03のような共通のinterfaceを満たすこと。
- 必要な入力：保存先の位置情報を置くconfig、保存先ごとの実装（adapter）、どの実装を使うかの選択値。
- trade-off・失敗の仕方：差し替え可能なのはinterfaceの範囲に限られる。保存先ごとに保証（永続性、失効の仕組み、一意性の確認）が違い、差し替えると挙動が変わる（P30-O09のcacheの追い出し、P30-O13の期限切れの掃除）。12factorの文書は、data移行の手順には触れていない。
- 反例・適用しない場合：Djangoのdocsは、local-memory cacheはmulti-processで安全でなく、そのためproductionにはおそらく良い選択ではない（原文「probably not a good choice」）と書く（`docs/topics/http/sessions.txt` 行61–69、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L61-L69、P30-O09）。設定で付け替えられても、全ての組合せが成り立つわけではない。
- 互換・非互換：P30-O03（store interface）とP30-O04（ID受渡しの分離）と組み合わさる。
- 限界：12factorの「without any code changes」は文書の主張で、検証結果ではない。

### P30-O03 sessionの保存先を、小さなmethod集合のinterfaceで差し替える（store abstraction）
- 出典：spring-session、`spring-session-core/src/main/java/org/springframework/session/SessionRepository.java` 行28–73（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/SessionRepository.java#L28-L73）、`spring-session-docs/modules/ROOT/pages/index.adoc` 行20–45（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-docs/modules/ROOT/pages/index.adoc#L20-L45）。django、`django/contrib/sessions/backends/base.py` 行453–524（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L453-L524）、`docs/topics/http/sessions.txt` 行773–808（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L773-L808）。expressjs/session、`README.md` 行508–580（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L508-L580）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Spring Session `SessionRepository<S>`は、`createSession`、`save`、`findById`、`deleteById`の4 methodだけを持つ。`createSession`のjavadocは、実装が変更を追跡して差分だけを保存するような最適化を許す、と書く（行30–42）。`save`のjavadocは、変更を即時に永続化する実装では何もしないことがある、と書く（行44–55）。docsは、in-memoryのsessionが分散環境で他のapplicationから読めない問題を挙げ、共有のsession storageと、storeを変えてもapplication codeを変えずに済む抽象を、Spring Sessionが解く問題として説明する（index.adoc 行20–45）。
  - Django `SessionBase`は、子classが実装すべきmethodとして`exists`、`create`、`save`、`delete`、`load`を持ち、未実装なら`NotImplementedError`を出す（行453–510）。`clear_expired`は、その保存先でできなければ`NotImplementedError`、保存先自身に期限切れの仕組みがあって不要ならno-opにする、と取り決めている（行515–524）。async版（`aexists`等）は、既定では同期版を`sync_to_async`で包む（行463–464、476–477等）。docsは、同じmethod集合を全`SessionStore`が実装すると書く（sessions.txt 行781–789）。
  - expressjs/sessionのREADMEは、storeが`EventEmitter`であることと、methodを3種に分けることを定める（行508–520）。必須（moduleが常に呼ぶ）は`destroy`、`get`、`set`。推奨（あれば呼ぶ）は`touch`。任意（moduleは呼ばないが、storeの形をそろえるためのもの）は`all`、`clear`、`length`である（行522–580）。`get`は、見つからない場合にerrorなしで`null`／`undefined`を返す、`error.code === 'ENOENT'`は見つからない場合と同じに扱う、と取り決めている（行558–560）。
- 解いている問題と前提：保存先（memory、RDB、KVS、cache、cookie）を、session利用側のcodeから切り離すこと。前提は、sessionがIDで引けるkey-valueの塊として表せること。
- 必要な入力：生成・取得・保存・削除の操作、見つからない場合の返し方、期限切れの掃除をstore側が持つかどうか、同期・非同期の別。
- trade-off・失敗の仕方：interfaceが小さいほど、保存先ごとの違い（索引、失効event、原子性）は外に出ない。Spring Sessionは索引付きの検索を別interfaceに分けている（P30-O06）。expressの「推奨」methodは、実装されていない場合の動作が変わる（`touch`がなければ`resave`の設定が要るかもしれない、P30-O13）。
- 反例・適用しない場合：Railsの`CookieStore`は、同じ抽象（`AbstractSecureStore`）を継承しながら、server側に保存先を持たない（P30-O07）。Djangoの`signed_cookies`の`exists`は常に`False`を返し、docstringは「共有資源と話すときに意味がある」と書く（`backends/signed_cookies.py` 行51–57、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/signed_cookies.py#L51-L57）。interfaceの一部が意味を持たない保存先がある。
- 互換・非互換：P30-O02（設定による選択）、P30-O04（IDの受渡しを別interfaceにする）と組み合わさる。
- 限界：method名・method数は各repo固有で、HELIXへ持ち込まない。

### P30-O04 session IDの受渡し（cookie／header）と保存先を別の部品にし、filterで要求の外側を包む
- 出典：spring-session、`spring-session-core/src/main/java/org/springframework/session/web/http/HttpSessionIdResolver.java` 行33–65（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/HttpSessionIdResolver.java#L33-L65）、`HeaderHttpSessionIdResolver.java` 行25–56（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/HeaderHttpSessionIdResolver.java#L25-L56）、`SessionRepositoryFilter.java` 行41–72（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/SessionRepositoryFilter.java#L41-L72）、行133–148（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/SessionRepositoryFilter.java#L133-L148）、行217–234（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/SessionRepositoryFilter.java#L217-L234）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `HttpSessionIdResolver`は、requestからIDの候補を取り出す`resolveSessionIds`、新しいIDをclientへ知らせる`setSessionId`、IDがもう有効でないことをclientへ知らせる`expireSession`の3 methodを持つ（行33–65）。cookieを使う`CookieHttpSessionIdResolver`が既定で、headerを使う`HeaderHttpSessionIdResolver`は、session作成時にresponse headerでIDを返し、無効化時に空のheaderを返す（行25–56）。
  - `SessionRepositoryFilter`はrequestとresponseを包み、`HttpSession`を`SessionRepository`由来のsessionで置き換える（行41–54）。class commentは、このfilterを`HttpSession`に触れるfilterやresponseをcommitしうるfilterより前に置かなければならない、と書く（行68–72）。
  - `doFilterInternal`は、後続のfilter chainを`try`で呼び、`finally`で`commitSession`を呼ぶ（行142–147）。`commitSession`は、現在のsessionがなく、request中に無効化されていれば`expireSession`を呼ぶ（行219–223）。sessionがあれば`sessionRepository.save`を呼び、requestで受け取ったIDが有効でなかったか、IDが変わっていれば、`setSessionId`で新しいIDをclientへ返す（行224–233）。
- 解いている問題と前提：ブラウザ（cookie）とAPI client（header）のように、IDの運び方が違うclientに同じ保存先を使うこと。前提は、IDの運び方がsessionの保存の仕方と独立に決められること。
- 必要な入力：IDの運び方（cookie名またはheader名）、無効化をclientへ伝える方法、filterの順序。
- trade-off・失敗の仕方：filterの順序に依存する。docsは、このfilterを`HttpSession`に触れる全ての処理より前に置くことが重要だと書く（`spring-session-docs/modules/ROOT/pages/http-session.adoc` 行142、https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-docs/modules/ROOT/pages/http-session.adoc#L142-L142）。順序が誤ると、置き換え前の`HttpSession`を使う処理が残りうる（本書の推論。docsとclass commentは順序の要件だけを書く）。cookieを使う場合、responseがcommitされた後は新しいsessionを作れず、`IllegalStateException`になる（`SessionRepositoryFilter.java` 行308–311、https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/SessionRepositoryFilter.java#L308-L311）。
- 反例・適用しない場合：Railsのguideは、どの保存先でもsession IDは常にcookieに置き、URLでIDを渡すことは安全性が低いので許さない、と書く（`guides/source/action_controller_overview.md` 行1170–1185、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/action_controller_overview.md#L1170-L1185）。IDの運び方を差し替え点にしていない。Djangoのmiddlewareも設定`SESSION_COOKIE_NAME`のcookieから読む（`django/contrib/sessions/middleware.py` 行20–22、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/middleware.py#L20-L22）。
- 互換・非互換：P30-O03（保存先interface）と直交する。P30-O10（ID再発行）の結果は`setSessionId`経由でclientに届く。
- 限界：header名の例は出典の例示であり、持ち込まない。

### P30-O05 sessionの書込みを「変更した属性だけ」にするか「全部」にするか、いつ書くかを分ける（SaveMode／FlushMode、差分保存）
- 出典：spring-session、`spring-session-core/src/main/java/org/springframework/session/SaveMode.java` 行26–47（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/SaveMode.java#L26-L47）、`FlushMode.java` 行26–42（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/FlushMode.java#L26-L42）、`spring-session-data-redis/src/main/java/org/springframework/session/data/redis/RedisSessionRepository.java` 行116–156（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-data-redis/src/main/java/org/springframework/session/data/redis/RedisSessionRepository.java#L116-L156）、行296–335（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-data-redis/src/main/java/org/springframework/session/data/redis/RedisSessionRepository.java#L296-L335）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `SaveMode`は3値を持つ。`ON_SET_ATTRIBUTE`は、`setAttribute`で変えた属性だけを保存し、javadocは、並行度の高い環境で並行requestによる属性の上書きの危険を小さくする、と書く。`ON_GET_ATTRIBUTE`は、それに読んだ属性も加える。`ALWAYS`は、操作に関係なく全属性を保存し、javadocは、並行requestによる上書きの危険を大きくする、と書く（行26–47）。
  - `FlushMode`は2値を持つ。`ON_SAVE`は`SessionRepository#save`が呼ばれたときだけ書き、javadocはweb環境ではふつうresponseのcommit時だと書く。`IMMEDIATE`は、session作成や属性設定のたびにすぐ書く（行26–42）。
  - `RedisSessionRepository`では、`RedisSession`が`delta`（変更のmap）を持ち、`saveDelta`はdeltaが空なら何もせず、空でなければhashへ`putAll`した後、最終access時刻と非活動の許容時間から期限（`expireAt`）を設定し直す（行325–335）。`FlushMode.IMMEDIATE`のときは、属性設定等のたびに`save`を呼ぶ（行296–300）。
  - `save`は、新規でないsessionについて、元のIDのkeyが存在しなければ`IllegalStateException("Session was invalidated")`を出す（行126–133）。`findById`は、取り出したsessionが期限切れなら削除して`null`を返す（行144–148）。
- 解いている問題と前提：同じsessionを使う並行requestが、互いの変更を古い値で上書きすること（lost update）を減らすこと。前提は、保存先が属性単位の部分更新（Redisのhash等）をできること。
- 必要な入力：属性単位で書けるか、並行requestの頻度、読んだだけの属性を書き戻す必要があるか（中身が可変objectの場合等）、書込みの時機。
- trade-off・失敗の仕方：差分保存は、同じ属性を並行に変えた場合の衝突は防がない（javadocは「危険を小さくする」と書き、なくすとは書いていない）。`ON_GET_ATTRIBUTE`・`ALWAYS`は、読んだ属性を書き戻すため、上書きの範囲が広がる。docsは、期限切れによるkeyの削除と保存が並行すると、Redisの`HSET`がkeyを作り直し、必須の項目を欠いたsessionが残りうると書く（`spring-session-docs/modules/ROOT/pages/configuration/redis.adoc` 行281–290、https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-docs/modules/ROOT/pages/configuration/redis.adoc#L281-L290）。
- 反例・適用しない場合：expressjs/sessionは属性単位ではなく、session全体のhashを比べて全体を保存するかを決める（P30-O14）。Django `SessionMiddleware`も、変更の有無（`modified`）で全体を保存する（P30-O14）。cookie保存（P30-O07）では、responseのcookieが丸ごと置き換わり、部分更新の概念がない。
- 互換・非互換：P30-O14（保存判定）と同じ問題を別の粒度で解いている。P30-O13（期限の延長）と、`saveDelta`での`expireAt`設定でつながる。
- 限界：Redis以外のrepository（JDBC等）の差分保存は今回読んでいない。enumの名前・値の数は持ち込まない。

### P30-O06 「ある利用者の全session」を引くための索引を、別のinterfaceと別のrepository実装に分ける
- 出典：spring-session、`spring-session-core/src/main/java/org/springframework/session/FindByIndexNameSessionRepository.java` 行30–70（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/FindByIndexNameSessionRepository.java#L30-L70）、`spring-session-docs/modules/ROOT/pages/configuration/redis.adoc` 行108–128（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-docs/modules/ROOT/pages/configuration/redis.adoc#L108-L128）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `FindByIndexNameSessionRepository`は`SessionRepository`を拡張し、索引名と値でsessionを探す`findByIndexNameAndIndexValue`と、principal名（利用者名）の索引で探す`findByPrincipalName`を足す（行30–70）。principal名の索引について、javadocは、Spring Sessionは認証の仕組みを知らないので、索引を埋めるのは開発者の責務だと書く（行32–37）。
  - docsは、Redisについて、索引を持たない`RedisSessionRepository`と、索引を持つ`RedisIndexedSessionRepository`を選ぶよう書く（行109–126）。前者はID以外の条件での検索が非効率で、後者は追加のdata構造を保ち、sessionの期限切れと削除にも対応する（原文「supports session expiration and deletion」）、と書く。後者をRedis Clusterで使うと、eventを1つのnodeからしか購読しないため、別nodeで起きたeventの索引が掃除されないことがある、と注意している（行128）。
- 解いている問題と前提：利用者単位の操作（全端末からのlogout、同時login数の把握等）のために、IDではなく利用者からsessionを引くこと。前提は、認証層がsessionにprincipal名を書き込むこと。
- 必要な入力：索引にする属性、索引を書き込む主体、索引の掃除をどのeventで行うか。
- trade-off・失敗の仕方：索引は追加の書込みと掃除を要する。掃除がeventに依存する場合、eventを取りこぼすと索引が残る（docsのcluster注意）。索引を埋めるのが開発者の責務なので、埋め忘れると検索結果が欠ける。
- 反例・適用しない場合：索引を持たないrepositoryでは、利用者単位の失効は保存先だけではできない。Djangoは、利用者の認証情報（password由来のHMAC）をsessionに入れて照合することで、passwordの変更時に他のsessionを無効にする（P30-O12）。索引で全sessionを引くのではなく、各requestで照合する別の解き方である。cookie保存（P30-O07）では、server側にsessionの一覧がない。
- 互換・非互換：P30-O12（照合による失効）と、同じ「利用者単位の失効」を別の構造で解く。P30-O03の最小interfaceを拡張する形をとる。
- 限界：`RedisIndexedSessionRepository`の本体（索引の書込みとevent処理）は読んでいない。docsの記述に依っている。

### P30-O07 session data全体をclient側の暗号化・署名cookieに置く（cookie store）
- 出典：rails、`actionpack/lib/action_dispatch/middleware/session/cookie_store.rb` 行11–51（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L11-L51）、行64–75（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L64-L75）、行124–126（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L124-L126）、`guides/source/action_controller_overview.md` 行1187–1198（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/action_controller_overview.md#L1187-L1198）。django、`django/contrib/sessions/backends/signed_cookies.py` 行6–24（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/signed_cookies.py#L6-L24）、行85–95（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/signed_cookies.py#L85-L95）、`docs/topics/http/sessions.txt` 行119–144（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L119-L144）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Railsの`CookieStore`はRailsの既定のsession storeで、session dataを`secret_key_base`で暗号化したcookieに置く（class comment 行11–25）。cookie jarは`request.cookie_jar.signed_or_encrypted`で、設定に応じて署名または暗号化のjarが選ばれる（行124–126）。生成時に`cookie_only = true`を設定し、`same_site`が渡されていなければrequestの設定から決める（行64–68）。session IDもcookieの中のdataとして持つ（`persistent_session_id!` 行105–109、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L105-L109）。commentは、`secret_key_base`を変えると既存の全sessionが無効になる、と書く（行39–42）。guideは、cookieの容量の上限に縛られること、model instanceのような複雑なobjectをsessionに置かないことを書く（行1194–1198）。
  - Djangoの`signed_cookies`は、session keyそのものを、session dataを署名・圧縮して直列化した文字列にする（`_get_session_key` 行85–95）。`load`は署名を検証して取り出し、署名の不一致や復元の失敗（どの例外でも）ではsessionを作り直して空を返す（行6–24）。docsは、dataは署名されているが暗号化されておらず、clientが読める、と警告する（sessions.txt 行132–136）。clientがcookieの全体を保存できずにdataを落とした場合も、改ざんと同じく無効になる、と書く（行138–142）。
- 解いている問題と前提：server側に共有storeを置かずに、どのprocessでもsessionを読めるようにすること（P30-O01の別解）。前提は、server全体で共有する秘密鍵があること、session dataがcookieの容量に収まること。
- 必要な入力：署名・暗号化の鍵、鍵の更新の手順、sessionに置くdataの範囲（容量、秘匿の要否）。
- trade-off・失敗の仕方：
  - server側に記録がないため、失効と再送の扱いが弱い（P30-O08）。
  - 鍵の変更が全sessionの失効になる（Rails comment 行39–42）。Railsのsecurity guideは、古い値を回さずに`secret_key_base`を変えると全利用者が再loginになる、と書く（`guides/source/security.md` 行330–332、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L330-L332）。
  - Djangoの方式はdataがclientに読める。Railsは既定で暗号化する。同じ「cookieに置く」でも、秘匿の有無が違う。
- 反例・適用しない場合：expressjs/sessionは、cookieにはIDだけを置き、dataはserver側に置くと明記している（`README.md` 行28–29、https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L28-L29）。cookieのIDには署名を付け、秘密は配列で複数持てて、先頭で署名し全要素で検証する（同 行334–357、https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L334-L357）。Djangoの既定はDB保存である（P30-O09）。
- 互換・非互換：P30-O08（freshnessの限界）と一体で読む。P30-O06（server側索引）とは非互換（server側にsession一覧がない）。P21（鍵・秘密の管理）の鍵の更新と関係する。
- 限界：cookieの容量の数値は出典に書かれているが持ち込まない。Railsの暗号の詳細（`ActionDispatch::Cookies`の実装）は読んでいない。

### P30-O08 client側保存では「最新であること（freshness）」とlogoutによる失効を保証できない
- 出典：django、`docs/topics/http/sessions.txt` 行146–159（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L146-L159）。rails、`guides/source/security.md` 行294–302（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L294-L302）、行433–447（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L433-L447）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Djangoのdocsは、MACはdataの真正性と完全性を保証するが、clientが最後に受け取ったものを返しているという新しさ（freshness）は保証できず、用途によってはreplay攻撃にさらされる、と書く（行146–153）。server側に記録を持つ他の保存先はlogout時にsessionを無効にできるが、cookie保存のsessionはlogoutで無効にならず、盗まれたcookieはlogout後も使える、と書く（行153–157）。cookieが「古い」と判定されるのは、設定した有効期間より古い場合だけだ、と書く（行158–159）。
  - Railsのsecurity guideは、cookieはclientに保存され、期限切れのcookieの内容をclientが保持・他の機械へ複製しうるので、秘匿すべきdataを置かないこと（行296）、cookieはclientが先に消しうるので、永続的なdataはserver側に置くこと（行298）、session cookieは自ら無効にならず悪用されうるので、保存した時刻で古いcookieをapplicationが無効にするのがよいかもしれない、と書く（行300–302）。
  - 同guideのreplay攻撃の節は、残高をsessionに置き、購入後に古いcookieを差し戻すと残高が戻る例を挙げる（行437–443）。一度だけ有効なnonceで防げるが、serverが全nonceを追跡する必要があり、application serverが複数あるとさらに複雑で、nonceをDBに置くとcookie保存の目的（DBに触れないこと）を損なう、と書く（行445）。最善の対策は、その種のdataをsessionでなくDBに置き、sessionには利用者IDだけを置くことだ、とする（行447）。
- 解いている問題と前提：保存先の選択が、どの種類のdataをsessionに置けるかを決めること。前提は、clientが過去のcookieを保持・再送できること。
- 必要な入力：sessionに置くdataの種類（認証の識別子だけか、残高のような業務状態か）、logoutでの即時失効が必要か、server側に記録を持てるか。
- trade-off・失敗の仕方：server側記録を持たないことで得た利点（P30-O07）と、失効・freshnessの保証が引き換えになる。Railsのguideが挙げるnonceによる対策は、server側の記録を再び持ち込むことになる（guide自身がそう書く）。
- 反例・適用しない場合：server側に記録を持つ保存先（DB、cache、外部store）は、logout時に記録を消して失効できる（Djangoのdocs 行153–155）。Djangoのpassword由来HMACによる照合（P30-O12）は、cookie保存でもpassword変更時の失効に効く可能性があるが、logoutだけでの失効にはならない（本書の推論。docsの記述ではない）。
- 互換・非互換：P30-O07と一体。P30-O13（server側の期限切れ）と対照になる。
- 限界：guideの「may be a good idea」は推奨の度合いが弱い記述であり、必須として読まない。

### P30-O09 cacheをsessionの保存先にする場合：追い出し＝logoutになること、DBとの書込み順序
- 出典：django、`docs/topics/http/sessions.txt` 行34–39（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L34-L39）、行52–99（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L52-L99）、`django/contrib/sessions/backends/cached_db.py` 行34–51（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/cached_db.py#L34-L51）、行88–93（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/cached_db.py#L88-L93）。rails、`actionpack/lib/action_dispatch/middleware/session/cache_store.rb` 行9–58（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cache_store.rb#L9-L58）、行62–68（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cache_store.rb#L62-L68）、`guides/source/action_controller_overview.md` 行1200–1207（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/action_controller_overview.md#L1200-L1207）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Djangoの既定はDB保存である（docs 行36–39）。cacheだけに置く`cache`は、DBへの永続化を避けるので速いが、cacheが満杯になるかcache serverが再起動すると追い出しが起き、session dataが失われ、利用者のlogoutも起きる、と書く（行89–94）。永続化の設定が十分と確信できなければ`cached_db`を選ぶよう書く（行96–99）。local-memory cacheはmulti-processで安全でなく、そのためproductionにはおそらく良い選択ではない（原文「probably not a good choice」）、と警告の中で書く（行61–69）。
  - `cached_db`はwrite-through cacheで、書込みはDB、cacheの順に行う（docs 行78–82）。実装でも`save`は親（DB）の`save`の後にcacheへ`set`し、cacheの失敗は例外をlogに残して握りつぶす（`cached_db.py` 行88–93）。読込みはまずcacheを見て、なければDBから読んでcacheに入れ直す（行34–51）。cache keyが不正でcacheが例外を出した場合も、cacheになかったものとして扱う（行37–40）。
  - Railsの`CacheStore`は、`ActiveSupport::Cache::Store`にsessionを置く（行9–13）。commentは、重要なdataを置かず、長く保つ必要のないsessionに向く、と書く。guideは、既存のcache基盤を追加の管理なしに使える利点と、dataがいつでも消えうる欠点を書く（行1200–1207）。session IDの衝突確認は設定で有効にした場合だけ行い、既定は追加の書込みを避けるために無効、とcommentに書く（行21–24）。保存のkeyには`sid.private_id`を使い、読込みは`private_id`で見つからなければ`public_id`でも探す（行62–68）。
- 解いている問題と前提：DBより速い保存先を使いつつ、追い出しによるsession喪失をどこまで許すかを選ぶこと。前提は、cacheが追い出し・再起動でdataを失いうること。
- 必要な入力：sessionの喪失（強制logout）を許せるか、cacheの永続化設定、DBとの二重書込みの順序、cacheの失敗をrequestの失敗にするか。
- trade-off・失敗の仕方：cacheだけの方式は、cacheの容量・再起動がそのまま利用者のlogoutになる。`cached_db`は、cacheへの書込みが失敗するとDBとcacheが食い違いうる（docs 行79–82は、成功したDB書込みを失敗させないために例外を握る、と理由を書く）。docsの`versionchanged`は、以前の版では削除の失敗は握っていなかったと書く（行101–104、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L101-L104）。
- 反例・適用しない場合：12factorは、session stateの置き場の候補として時間で失効するdatastoreを挙げる（P30-O01）。追い出しの扱いには触れていない。cookie保存（P30-O07）には追い出しがない。
- 互換・非互換：P30-O02（設定による付け替え）で選ばれる候補の1つ。cacheそのものの無効化の構造はP28で扱う。
- 限界：Railsの`private_id`／`public_id`の意味はRack側で定義されており、本repoの範囲では読んでいない。両方で探す理由もcommentにない。

### P30-O10 login時にsession IDを作り直す（固定化対策）と、そのときdataを引き継ぐかどうか
- 出典：django、`django/contrib/auth/__init__.py` 行169–198（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/auth/__init__.py#L169-L198）、`django/contrib/sessions/backends/base.py` 行417–440（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L417-L440）、`docs/topics/http/sessions.txt` 行397–404（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L397-L404）。rails、`guides/source/security.md` 行464–476（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L464-L476）。expressjs/session、`session/store.js` 行50–56（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/session/store.js#L50-L56）、`README.md` 行982–1020（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L982-L1020）。spring-session、`spring-session-core/src/main/java/org/springframework/session/Session.java` 行41–46（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/Session.java#L41-L46）、`RedisSessionRepository.java` 行314–323（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-data-redis/src/main/java/org/springframework/session/data/redis/RedisSessionRepository.java#L314-L323）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Djangoの`login`は、sessionに既にlogin済みの利用者がいる場合に、その利用者が別人か、保存した認証hashが今の利用者のものと一致しなければ、`flush`で空の新しいsessionにする（commentは、別の利用者のsessionの再利用を避けるため、と書く）。同じ利用者で認証hashも一致する場合は、`flush`も`cycle_key`もせず、IDは替わらない。sessionにlogin済みの利用者がいない（未login）場合だけ、`cycle_key`でdataを保ったままIDを替える（行177–189）。docstringは、匿名のsessionで設定したdataはlogin後も残る、と書く（行170–174）。最後にCSRF tokenも`rotate_token`で替える（行197）。
  - `cycle_key`は、今のdataを保ったまま新しいkeyで`create`し、古いkeyのdataを削除する（`base.py` 行431–440）。`flush`は、dataを空にし、保存先から削除し、keyを`None`にする（行417–424）。docsは、`login`が固定化を緩和するために`cycle_key`を呼ぶ、と書く（sessions.txt 行402–404）。
  - Railsのsecurity guideは、最も有効な対策はlogin成功後に新しいIDを発行して古いIDを無効にすることだとし、`reset_session`を挙げる（行466–472）。この操作はsessionの値を消すので、必要な値は新しいsessionへ移す必要がある、と書く（行474）。
  - expressjs/sessionの`Store.prototype.regenerate`は、今のIDを`destroy`してから`generate`で新しいIDと空のsessionを作る（`store.js` 行50–56）。READMEのlogin例は、固定化への対策として`regenerate`の後に利用者情報を入れて`save`し、logout例は、利用者情報を消して`save`した後に`regenerate`する（行986–1019）。
  - Spring Session `Session.changeSessionId`はIDを替える（`Session.java` 行41–46）。Redis実装は、保存時にIDが変わっていれば、元のkeyを新しいkeyへ`rename`する（dataは保たれる。`RedisSessionRepository.java` 行314–323）。
- 解いている問題と前提：攻撃者が知っているIDを利用者に使わせ、login後にそのIDで同じsessionを共有する固定化攻撃（Railsの`guides/source/security.md` 行449–462が手順を書く。https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L449-L462）を、login時にIDを替えることで無効にすること。
- 必要な入力：IDを替える時点（login、logout、権限の変化）、匿名時のdataを引き継ぐか、別人のsessionが残っていた場合の扱い。
- trade-off・失敗の仕方：
  - IDだけ替えてdataを保つ方式（Djangoの`cycle_key`、Springの`changeSessionId`）は、匿名時に置かれたdataを引き継ぐ。Djangoでdataを保ってIDを替えるのは未loginのsessionからloginする場合だけで、別人の認証が残っているか認証hashが一致しない場合は`flush`に切り替え、同じ利用者でhashも一致する再loginではIDを替えない。
  - dataを捨てる方式（Railsの`reset_session`、expressの`regenerate`）は、引き継ぐ値をapplicationが移す必要がある。
  - expressでは、IDの再発行をmiddlewareが自動で行わない（READMEの例でapplicationが呼ぶ）。呼び忘れると対策がない。Djangoは`login`の中で行う。
- 反例・適用しない場合：Djangoの`signed_cookies`では、`cycle_key`は`save`を呼ぶだけで（`signed_cookies.py` 行75–80、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/signed_cookies.py#L75-L80）、keyはdataの署名文字列なので、dataが変わればkeyも変わる。古いcookieをserver側で無効にはしない（P30-O08）。Spring Sessionの本repoは`changeSessionId`を提供するが、login時に呼ぶのは認証層の側であり、その呼出し側（Spring Security）は今回読んでいない。
- 互換・非互換：P30-O11（未知のIDを採用しない）と組み合わさって固定化を防ぐ。P30-O04（新しいIDをclientへ返す経路）を使う。
- 限界：Railsの`reset_session`の実装（`ActionController::Metal`・`Request#reset_session`）は今回読んでいない。guideの記述に依っている。

### P30-O11 clientが送ってきた未知のIDを採用せず、新しいIDを発行する
- 出典：django、`django/contrib/sessions/backends/db.py` 行32–56（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/db.py#L32-L56）、行68–79（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/db.py#L68-L79）、`django/contrib/sessions/backends/cache.py` 行26–36（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/cache.py#L26-L36）、`django/contrib/sessions/backends/base.py` 行197–202（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L197-L202）。expressjs/session、`index.js` 行494–526（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L494-L526）、行584–607（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L584-L607）。spring-session、`SessionRepositoryFilter.java` 行279–323（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-core/src/main/java/org/springframework/session/web/http/SessionRepositoryFilter.java#L279-L323）。rails、`cache_store.rb` 行35–40（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/actionpack/lib/action_dispatch/middleware/session/cache_store.rb#L35-L40）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Djangoの`db`は、keyと「期限がまだ来ていない」条件で行を探し、見つからなければ`_session_key`を`None`にする（`db.py` 行32–41）。`SuspiciousOperation`の場合はsecurity loggerに警告を残す（行38–40）。`create`は新しいkeyを生成し、`must_create=True`で保存して、一意でなければ生成し直す（行68–79）。新しいkeyの生成は、保存先に存在しないkeyが出るまで乱数を引き直す（`base.py` 行197–202）。`cache`も、cacheになければ`_session_key`を`None`にする（`cache.py` 行26–36）。
  - expressjs/sessionは、cookieからIDを読めなければ`generate`で新しいsessionを作る（`index.js` 行494–500）。読めても、storeの`get`がsessionを返さなければ（`ENOENT`以外のerrorは除く）`generate`する（行502–526）。cookieの値は`s:`接頭辞付きの署名を検証し、検証に失敗した値は使わない（行595–606）。
  - Spring Sessionの`getSession(create)`は、requestのIDでsessionが見つからなければ、そのIDを無効として記録し（`INVALID_SESSION_ID_ATTR`）、作成が求められていれば`sessionRepository.createSession()`で新しいID のsessionを作る（行296–322）。
  - Railsの`CacheStore#find_session`は、IDがないかcacheにsessionがなければ、`generate_sid`で新しいIDを作り、空のsessionを返す（行35–40）。
- 解いている問題と前提：攻撃者が自分で決めたIDをclientに送らせても、server側に記録のないIDをそのまま採用しないことで、IDを「作って配る」種類の固定化を防ぐこと（P30-O10で扱う、有効なIDを入手して配る攻撃とは別）。前提は、server側に記録を持つ保存先であること。
- 必要な入力：IDの存在確認の手段、期限切れの判定、ID生成の乱数源、署名の検証。
- trade-off・失敗の仕方：存在確認のたびに保存先を読む。Djangoの`cache`は、cacheが黙って失敗する場合に、keyの衝突なのかcacheの不在なのかを区別できないので、一定回数作り直して失敗したら例外を出す、とcommentに書く（`cache.py` 行48–65、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/cache.py#L48-L65）。回数の値は持ち込まない。
- 反例・適用しない場合：cookie保存（P30-O07）では、署名が通ればclientの持つ値をそのまま使う。「存在しないID」という概念がない。Djangoのdocsは、subdomainが親domain全体へcookieを設定できるため、信頼できないsubdomainがあると、攻撃者が自分の有効なsession keyを利用者に送り込む固定化が成り立つ、と書く（sessions.txt 行744–760、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L744-L760）。未知IDの拒否だけでは、有効なIDの送り込みは防げない。
- 互換・非互換：P30-O10（login時の再発行）と補い合う。P30-O03のinterfaceのうち「見つからない場合の返し方」に依存する。
- 限界：Railsの`AbstractSecureStore`の親（Rack）の挙動は読んでいない。Railsの観察は`CacheStore`の`find_session`に限る。

### P30-O12 sessionを認証情報（password由来のHMAC）に結び付け、変更時に他のsessionを無効にする
- 出典：django、`django/contrib/auth/__init__.py` 行278–319（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/auth/__init__.py#L278-L319）、`django/contrib/auth/base_user.py` 行132–149（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/auth/base_user.py#L132-L149）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `get_session_auth_hash`は、利用者のpassword欄のHMACを返す（docstring「Return an HMAC of the password field.」）（`base_user.py` 行132–136）。`login`は、このhashをsessionの`HASH_SESSION_KEY`に保存する（`django/contrib/auth/__init__.py` 行195、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/auth/__init__.py#L195-L195）。
  - `get_user`は、sessionから利用者を引いた後、利用者が`get_session_auth_hash`を持っていれば、sessionに保存したhashと今のhashを定時間比較する（行295–304）。一致しなければ、設定`SECRET_KEY_FALLBACKS`の各秘密で計算したhashと比べ、どれかと一致すれば`cycle_key`して今のhashに書き換える（行305–314）。どれとも一致しなければ`flush`して、匿名の利用者として扱う（行315–319）。
- 解いている問題と前提：passwordを変えたときに、他の端末で残っているsessionを、利用者単位の索引なしで無効にすること。前提は、各requestで利用者の行を読むこと（`backend.get_user`）。
- 必要な入力：認証情報のうち変化を検知したい値（password）、HMACの秘密、秘密の更新時に旧秘密で作ったhashを受け入れる手順。
- trade-off・失敗の仕方：passwordの変更以外の理由（端末の紛失等）で特定のsessionだけを無効にすることはできない（本書の推論。比較の対象がpassword由来の値だけであることから）。秘密を変えたとき、旧秘密を`SECRET_KEY_FALLBACKS`に置かないと、全sessionが一致せず`flush`される（行305–317の分岐から）。
- 反例・適用しない場合：Spring Sessionは、principal名の索引で利用者の全sessionを引く（P30-O06）。各requestでの照合ではなく、索引による一括操作である。Railsのsecurity guideは、IPやuser agentのような利用者固有の性質をsessionに保存して毎回照合する対策を挙げるが、proxyの背後ではIPがsession中に変わりうると注意している（`guides/source/security.md` 行476、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L476-L476）。
- 互換・非互換：P30-O10（login時の`flush`／`cycle_key`の判定にも同じhashを使う）。P30-O07（cookie保存）とも併用できる構造である（hashはsession dataに入る）。
- 限界：Djangoのdocs（auth側の「Session invalidation on password change」）は今回読んでいない。

### P30-O13 期限切れsessionの掃除を、保存先の仕組み・定期処理・利用者のどこに置くか
- 出典：django、`docs/topics/http/sessions.txt` 行698–719（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/http/sessions.txt#L698-L719）、`django/contrib/sessions/backends/base.py` 行515–524（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L515-L524）。spring-session、`spring-session-jdbc/src/main/java/org/springframework/session/jdbc/JdbcIndexedSessionRepository.java` 行274–281（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-jdbc/src/main/java/org/springframework/session/jdbc/JdbcIndexedSessionRepository.java#L274-L281）、行647–655（https://github.com/spring-projects/spring-session/blob/f064cfc746c1d2b32247d70629b3959eb52736c6/spring-session-jdbc/src/main/java/org/springframework/session/jdbc/JdbcIndexedSessionRepository.java#L647-L655）。expressjs/session、`README.md` 行275–293（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L275-L293）、行295–314（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L295-L314）、行570–580（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L570-L580）。rails、`guides/source/security.md` 行478–496（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/security.md#L478-L496）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Djangoは、期限切れsessionの自動削除を提供しない、と明記する（docs 行711）。DB保存では、利用者がlogoutしなければ行が残り続ける（行705–709）。掃除用の管理command `clearsessions`を定期的に呼ぶのは利用者の仕事だとする（行711–715）。cacheは古いdataを自動で消し、cookie保存はdataが利用者のbrowserにあるので、この問題がない、と書く（行717–719）。`clear_expired`の取り決め（不可能なら`NotImplementedError`、保存先に仕組みがあればno-op）は、この違いをinterfaceに表している（`base.py` 行515–524）。
  - Spring Session JDBCは、cron式が無効化の値でなければ、repository初期化時にtask schedulerを作り、`cleanUpExpiredSessions`を定期実行する（行274–281）。`cleanUpExpiredSessions`は、期限時刻が現在時刻より前の行をtransactionの中で一括削除する（行647–655）。Redis実装は、保存のたびにkeyの期限を設定し直し（P30-O05）、読込み時に期限切れなら削除する。
  - expressjs/sessionのREADMEは、storeの`touch`を「推奨」とし、storeが非活動のsessionを自動で消す場合に、そのsessionが活動中だと知らせて非活動timerを戻すために使う、と書く（行570–580）。`resave`については、storeが`touch`を実装していれば`false`にしてよく、実装せずにstoreが期限を設定するなら`true`が要るかもしれない、と書く（行289–293）。`rolling`は、responseのたびにcookieを設定し直して期限の計測を戻す（行295–305）。
  - Railsのsecurity guideは、cookieの期限はclientが編集できるので、server側でsessionを失効させる方が安全だとし、DBのsessionを最終更新時刻で掃除する例を挙げる（行482–490）。定期的にaccessされ続ければ失効しないので、作成時刻の列を足して、作成から長いものも消すよう書く（行492–496）。
- 解いている問題と前提：利用者がlogoutしないまま放置されたsessionの記録が溜まることと、操作中のsessionを途中で失効させないこと。前提は、保存先ごとに失効の仕組み（期限付きkey、cacheの追い出し、なし）が違うこと。
- 必要な入力：最終access時刻・作成時刻の記録、非活動の期限と絶対の期限の区別、掃除を実行する主体（保存先、application内のscheduler、外部のcron）。
- trade-off・失敗の仕方：
  - 掃除をapplicationの外（cron）に置くと、設定し忘れると記録が溜まる（Djangoのdocs）。application内のschedulerに置くと、process数だけ同じ掃除が走りうる（Spring Session JDBCの`cleanUpExpiredSessions`の実装は一括DELETEで、process間の排他は今回読んだ範囲にない）。
  - 非活動の期限だけでは、定期accessで延命される（Railsのguide 行492）。
  - 期限の延長（touch・rolling）は、requestごとの書込みを増やす。
- 反例・適用しない場合：cookie保存では、server側に掃除の対象がない（Djangoのdocs 行718–719）。ただし失効の保証も弱い（P30-O08）。
- 互換・非互換：P30-O05（保存時に期限を設定し直す）、P30-O09（cacheの追い出し）。application内のschedulerで定期処理を走らせる構造は、P08（periodic job、leaderの有無）と同じ問題を持つ。
- 限界：期限の長さ、cron式、掃除の頻度の値は、出典に書かれていても持ち込まない（Railsのguideの例の時間、Djangoのdocsが例に挙げる実行頻度等）。

### P30-O14 sessionを保存するかどうかの判定（変更の検出、未初期化sessionの扱い、失敗時の扱い）
- 出典：expressjs/session、`index.js` 行443–492（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L443-L492）、行651–667（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L651-L667）、行175–199（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/index.js#L175-L199）、`README.md` 行316–327（https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L316-L327）。django、`django/contrib/sessions/middleware.py` 行24–84（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/middleware.py#L24-L84）、`django/contrib/sessions/backends/base.py` 行242–255（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L242-L255）。rails、`guides/source/action_controller_overview.md` 行1158–1160（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/guides/source/action_controller_overview.md#L1158-L1160）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - expressjs/sessionは、sessionを読み込んだ時点と応答時点で、`cookie`属性を除いたsession objectのJSONのhashを比べて変更を判定する（`hash` 行651–667、`isModified` 行444–446）。`shouldSave`は、`saveUninitialized`が無効で、まだ保存しておらず、cookieのIDと今のIDが違う（新しいsession）場合は変更があったときだけ保存し、それ以外は保存済みのhashと違えば保存する（行459–469）。`shouldSetCookie`は、新しいsessionなら`saveUninitialized`が有効か変更があったときにcookieを設定する（行483–492）。READMEは、`saveUninitialized`を無効にすると、login sessionの実装、server側の容量の節約、cookieの設定に許可を要する法令への対応、sessionのない並行requestの競合に役立つ、と書く（行316–323）。
  - storeが`disconnect` eventを出した後は、`connect` eventまで、requestをsessionなしとして次へ進める（行175–199）。
  - Djangoの`SessionMiddleware.process_response`は、sessionが空でcookieがあればcookieを削除する（行36–45）。空でなく、変更されたか、設定で毎回保存する場合に保存し、cookieを設定し直す（行50–79）。5xxのresponseでは保存しない（行58–60）。保存時に`UpdateError`（保存先から既に消えていた）なら、「並行requestでlogoutした等で、requestの完了前にsessionが削除された」として`SessionInterrupted`を出す（行61–68）。sessionにaccessした場合は`Vary: Cookie`を付ける（行47–49、82–83）。`SessionBase._get_session`は、最初のaccessで初めて保存先から読む（遅延読込み、`base.py` 行242–255）。
  - Railsのguideも、sessionは遅延読込みで、actionの中で触れなければ読まれない、と書く（行1158–1160）。
- 解いている問題と前提：変更のないrequestで保存先に書かないこと、空のsessionのためにcookieや記録を作らないこと、並行requestによる上書きや、削除済みsessionの復活を避けること。
- 必要な入力：変更の検出方法（hash比較、`modified` flag）、未初期化sessionを保存するか、失敗したresponseで保存するか、保存先が使えないときの扱い。
- trade-off・失敗の仕方：
  - expressのREADMEは、`resave`を有効にすると、並行requestの一方の変更が、変更のない他方の終了時に上書きされる競合が起きうる、と書く（`README.md` 行277–282、https://github.com/expressjs/session/blob/96ebea4b6cd805584fba04523773b1b918a836d7/README.md#L277-L282）。
  - Djangoの`modified` flagは、`__setitem__`でkeyに値を代入したときに立つ（`base.py` 行57–59、https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/contrib/sessions/backends/base.py#L57-L59）。session内の可変objectの中身を書き換えた場合に立つかどうかは、今回読んだ範囲では確かめていない（docsの該当節は読んでいない）。
  - storeの切断時にsessionなしで進めるexpressの方式は、認証が要るrouteでは未login扱いになりうる（本書の推論）。
- 反例・適用しない場合：Spring Sessionは、属性単位の差分保存で同じ問題を解く（P30-O05）。session全体の変更判定ではない。
- 互換・非互換：P30-O05（保存の粒度）、P30-O13（`resave`と`touch`の関係）。
- 限界：expressの`saveUninitialized`・`resave`の既定値（真偽）とその廃止予告はREADMEにあるが、HELIXの既定値として持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| sessionの置き場（既定） | Rails：暗号化cookie（O07） | Django：DB（O09）。express：in-process `MemoryStore`（productionで警告、O01）。Spring Session：利用者が選ぶrepository | server側に共有storeを持つか。processを複数動かすか |
| processとsessionの関係 | 12factor：processはstateless、sticky sessionを使わない（O01） | Spring Session：in-memoryのsessionを共有storeへ置き換える部品を提供（O03） | 方法論の文書か、置き換えの部品か |
| 保存先の差し替え点 | Django：`SESSION_ENGINE`で`SessionStore`を選ぶ（O02）。express：store objectを渡す | Spring Session：`SessionRepository`の実装を選ぶ（O03）。Rails：`config.session_store` | 設定値で選ぶか、objectを渡すか |
| IDの運び方 | Spring Session：`HttpSessionIdResolver`でcookie／headerを差し替える（O04） | Rails：常にcookie、URLでは渡さない。Django：設定名のcookie | API clientを同じ仕組みで扱うか |
| 保存の粒度 | Spring Session：属性単位の差分（`SaveMode`）（O05） | express：session全体のhash比較。Django：`modified` flagで全体（O14） | 保存先が部分更新できるか |
| 固定化対策（login時） | Django：`login`の中で、未loginなら`cycle_key`（data保持）、別人またはhash不一致なら`flush`、同じ利用者でhash一致なら何もしない（O10） | Rails：`reset_session`（data破棄）。express：`regenerate`をapplicationが呼ぶ（data破棄）。Spring Session：`changeSessionId`（data保持、呼ぶのは認証層） | 匿名時のdataを引き継ぐか。再発行をframeworkが自動で行うか |
| 未知IDの扱い | Django／express／Spring Session／Rails CacheStore：保存先にないIDを採用せず新しいIDを発行（O11） | cookie保存（Rails CookieStore、Django signed_cookies）：署名が通ればclientの値を使う（O07） | server側に記録があるか |
| 利用者単位の失効 | Spring Session：principal名の索引で全sessionを引く（O06） | Django：password由来HMACを毎request照合（O12） | 索引を保てるか。各requestで利用者を読むか |
| 期限切れの掃除 | Django：利用者がcronで`clearsessions`（O13） | Spring Session JDBC：application内scheduler。Redis：keyの期限。cookie：不要（ただし失効は弱い） | 保存先に失効の仕組みがあるか |
| 保存先の障害 | Django `cached_db`：cacheの失敗をlogして続行（O09） | express：store切断中はsessionなしで続行（O14）。Django `cache`：作成に繰り返し失敗したら例外（O11） | sessionの喪失と、requestの失敗のどちらを許すか |

## 見つからなかったこと・gap
- sticky sessionを前提にした実装（load balancer側の親和性設定と、application側の扱い）は、5 repoのどれにも実装としては見当たらなかった。12factorが否定の立場を書くだけで、sticky sessionを使う場合の失敗の仕方（process停止時のsession喪失）を詳しく書いた一次資料は、今回の範囲にない。
- 同じsessionへの並行requestで、同じ属性を両方が変えた場合の衝突検出（version番号、CAS）は、どのrepoにも見当たらなかった。Spring Sessionの`SaveMode`とexpressの注意書きは、上書きの範囲を狭めるだけである（O05、O14）。
- Spring Sessionで、login時に`changeSessionId`を呼ぶ主体（Spring Securityのsession固定化対策）は、別repositoryのため読んでいない。`spring-session-docs/modules/ROOT/pages/spring-security.adoc`も読んでいない。
- Railsの`reset_session`の実装、Rackの`Rack::Session::Abstract::PersistedSecure`（`private_id`／`public_id`の定義）は、rails/railsの外または今回のsparse checkoutの外で、読んでいない。
- background job（D02 gapの3つ目の要素）の状態の置き場は、P08で扱った。本書では12factorのDisposability（jobをqueueに戻す、reentrantにする）を読んだが、観察には立てていない（P08-O04・O05と重なるため）。
- WebSocketや長時間接続でのsessionの扱い（Spring Sessionの`web/socket`配下）は読んでいない。
- 設計判断の記録（ADR）は、5 repoとも見当たらなかった。判断の根拠はcode comment、javadoc、guide、docsにある。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し、固定commitをcheckout（`core.hooksPath`を無効化）。rails／djangoはsparse checkout。読むだけで、build・test・script・hook・package managerは実行していない。`gh api`はmetadataとHEADの取得に使った。
- spring-session：`spring-session-core/.../SessionRepository.java`（全体）、`Session.java`（28–50と主要method名）、`SaveMode.java`、`FlushMode.java`、`FindByIndexNameSessionRepository.java`（全体）、`web/http/SessionRepositoryFilter.java`（40–392）、`HttpSessionIdResolver.java`（全体）、`HeaderHttpSessionIdResolver.java`（25–60）、`spring-session-data-redis/.../RedisSessionRepository.java`（116–160、296–339と`delta`周辺）、`spring-session-jdbc/.../JdbcIndexedSessionRepository.java`（270–282、645–660、削除queryの定義）、`spring-session-docs/.../index.adoc`（20–58）、`configuration/redis.adoc`（108–130、281–300）、`http-session.adoc`（見出し）。読んでいないもの：`RedisIndexedSessionRepository`本体、`ReactiveRedis*`、`MapSessionRepository`、`CookieHttpSessionIdResolver`・`DefaultCookieSerializer`本体、`spring-security.adoc`、`web/socket`配下、samples。
- rails：`actionpack/lib/action_dispatch/middleware/session/abstract_store.rb`（全体）、`cookie_store.rb`（全体）、`cache_store.rb`（全体）、`guides/source/security.md`（281–335、433–515）、`guides/source/action_controller_overview.md`（1101–1240）。読んでいないもの：`mem_cache_store.rb`、`cookies.rb`、`ActionDispatch::Request::Session`、Rack側の`Persisted`／`PersistedSecure`、`activerecord-session_store`（別repository）、`secret_key_base`のrotationの節（334以降）。
- django：`django/contrib/sessions/middleware.py`（全体）、`backends/base.py`（1–50、182–270、401–528）、`backends/db.py`（30–150）、`backends/cache.py`（26–103）、`backends/cached_db.py`（全体）、`backends/signed_cookies.py`（全体）、`django/contrib/auth/__init__.py`（165–200、230–260の見出し、278–320）、`auth/base_user.py`（132–150）、`docs/topics/http/sessions.txt`（34–166、395–410、698–722、744–812）。読んでいないもの：`backends/file.py`、`base_session.py`、`serializers.py`、`docs/topics/auth/default.txt`（password変更時の失効の説明）、`docs/ref/settings.txt`。
- expressjs/session：`README.md`（24–42、275–375、508–582、946–1024）、`index.js`（140–200、380–400、440–535、584–672）、`session/store.js`（50–56）、`session/session.js`（121–127）、`session/memory.js`（15–60）。読んでいないもの：`session/cookie.js`、`index.js`の`wrapmethods`・`inflate`の残り、`README.md`の「Compatible Session Stores」の一覧（第三者のstore）。
- 12factor：`content/en/processes.md`、`backing-services.md`、`concurrency.md`（1–14）、`disposability.md`（全体）。読んでいないもの：他言語版、`config.md`。
- 検索した語：`session`、`fixation`、`reset_session`、`cycle_key`、`flush`、`regenerate`、`changeSessionId`、`sticky`、`stateless`、`expire`、`clear_expired`、`clearsessions`、`cleanUpExpiredSessions`、`touch`、`resave`、`saveUninitialized`、`SaveMode`、`FlushMode`、`HttpSessionIdResolver`、`FindByIndexName`、`replay`、`freshness`、`private_id`、`disconnect`、`MemoryStore`。
- 選ばなかった候補：rack/rack（Railsのsession抽象の親。今回はrails側の観察で足りると判断し、読んでいない）、rails/activerecord-session_store（DB保存のRails実装。guideの記述で存在を確認したのみ）、pallets/flask（署名cookieのsession。Djangoの`signed_cookies`と同じ型のため選ばなかった）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：コード（Spring Session、Django、express-session、Railsのstore）、framework付属の文書（Rails guide、Django docs、Spring Session docs、express-session README）、方法論の文書（12factor）が混在する。12factorは実装を伴わない立場の表明であり、コードやguideと同列に扱えるかが未決。Rails guideやDjango docsの「may be a good idea」「recommended」といった推奨の強さを、知識の属性としてどう残すかも未決。
- scope：観察はweb applicationのrequest／responseに結び付いたsessionに限っている。HELIXのD02で、session以外の「状態を持つapplication」（長時間接続、process内の計算結果）へ同じ構造を当ててよいかは評価していない。securityの観察（O08、O10〜O12）をD08に結ぶかD02に置くかも未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。Djangoのdocsには`versionchanged`（O09）、express-sessionのREADMEには既定値の廃止予告（O14）があり、上流の版で挙動が変わることが文書の中に書かれている。再観察の要否と時期は未決。
- 状態：全観察（P30-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
