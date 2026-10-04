# P17 性能の構造と負荷の制御の観察（D01 Software architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、timeout、比、件数上限等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：SCF-B-0155 D01 §4「性能の構造（cache、索引、N+1、負荷の集中点）をarchitectureの判断として扱う知識」。旧HELIXの台帳自身が性能設計書を`todo`と記録していた（D01-M12）。本書は、そのうち「cache層と無効化」「同一要求の合流」「接続pool」「backpressure」「適応的な同時実行数制限」「overload時のshedding」「circuit breaking」について、どの入力で何を決め、どこに置かれるかを観察した。索引とN+1は扱っていない（§見つからなかったこと・gap）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| Netflix/concurrency-limits | https://github.com/Netflix/concurrency-limits | 78a74b9878d38c4c048b0304ce12a162ab7b7222（default branch: main） | Apache-2.0 | false | 2026-10-05 | 同時実行数の上限を、固定値ではなく遅延と破棄の観測から推定する（TCP輻輳制御の転用）。上限の推定（Limit）と適用（Limiter）が別の型に分かれており、partition、LIFO待ち、gRPC・servletへの組込みを行単位で読める |
| resilience4j/resilience4j | https://github.com/resilience4j/resilience4j | 7e3ab5252ed380b596e25240f19376a4435570b8（master） | Apache-2.0 | false | 2026-10-05 | in-processのcircuit breaker（失敗率・遅い呼出し率による状態機械）、bulkhead（semaphore型とthread pool型）、cache、decoratorの合成順を1つのlibraryで持つ |
| golang/groupcache | https://github.com/golang/groupcache | 2c02b8208cf8c02a3e358cb1d9b60950647543fc（master） | Apache-2.0 | false | 2026-10-05 | 同一keyの読込みを合流させるsingleflightの原型と、key所有者をconsistent hashで決める分散cache。値を不変として「無効化しない」設計を明記している |
| envoyproxy/envoy | https://github.com/envoyproxy/envoy | 57f7346d40d5f681a2d677123508c9827d0c8e02（main） | Apache-2.0 | false | 2026-10-05 | proxy層で、資源の数によるcircuit breaker、retry budget、outlier検出、資源の圧力に応じたoverload manager（load shed point）、adaptive concurrency filter、接続poolを持つ。network層に置いた場合の構造を読める |
| pgbouncer/pgbouncer | https://github.com/pgbouncer/pgbouncer | 7d38761c8f6c757238fde9f942cf9fe0cd272ae3（master） | NOASSERTION（`COPYRIGHT`冒頭で「ISC License」と表記） | false | 2026-10-05 | DB接続のpool。接続をいつ返すか（pool mode）がsession状態の契約を決めること、client接続数とserver接続数の差が待ち行列になること、待ち時間でreserve poolを開くことをdocsとCで読める |

envoyは大きいため、sparse checkoutで次の範囲だけを取得した：`source/common/upstream`、`source/server`、`source/extensions/filters/http/adaptive_concurrency`、`docs/root/intro/arch_overview/upstream`、`docs/root/configuration/operations/overload_manager`、`docs/root/configuration/http/http_filters`ほか（§検索範囲と結果）。

## 観察

### P17-O01 同時実行数の上限を「取得・解放と結果の通知」の契約で表す（Limiter／Listener）
- 出典：concurrency-limits、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/Limiter.java` 行20–61（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/Limiter.java#L20-L61）、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/AbstractLimiter.java` 行159–185（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/AbstractLimiter.java#L159-L185）、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/SimpleLimiter.java` 行50–76（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/SimpleLimiter.java#L50-L76）、`README.md` 行5–16（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/README.md#L5-L16）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - `Limiter.acquire(context)` は、上限を超えていれば空の `Optional` を返し、取れれば `Listener` を返す。呼出し側は処理の終了時に `onSuccess`（遅延を標本にする）、`onIgnore`（意味のある遅延が測れなかったので標本にしない）、`onDropped`（外部の上限やtimeoutで落ちた。loss型の推定は強く下げる）のどれかを必ず呼ぶ。
  - `AbstractLimiter.createListener` は、取得時刻と取得時点の実行中件数を閉じ込め、`onSuccess`／`onDropped` で `Limit.onSample(開始時刻, 経過時間, 実行中件数, 破棄したか)` を呼ぶ。`onIgnore` は件数を戻すだけで標本にしない。
  - `SimpleLimiter` は、上限の変更通知（`onNewLimit`）で、調整可能なsemaphoreの許可数を増減する。上限の推定（`Limit`）と適用（`Limiter`）は別の型である。
  - READMEは、RPSの固定上限は自動scaleする大規模系ではすぐ古くなると書き、同時実行数（Little's Law）で考える前提と、遅延で待ち行列を検知しtimeoutと拒否で強く下げるという原則を挙げる。
- 解いている問題と前提：上限値を運用者が事前に決められない環境で、上限を観測から決める。READMEは、各nodeが自分の局所的な上限を推定して適用すると書く（README 行9）。node間で上限を調整する仕組みは今回読んだ範囲に無かったが、READMEが「調整しない」と明記しているわけではない（推論）。
- 必要な入力：結果の分類（成功、標本にしない失敗、破棄）、遅延の計測点（取得から解放まで）、取得時の実行中件数。bypassする要求の判定（`bypassLimitResolverInternal`、AbstractLimiter 行93–115）。
- trade-off・失敗の仕方：呼出し側が `Listener` を呼び忘れると件数が戻らない。契約は型で強制されず、呼出し側の規律に依存する。結果の分類を誤ると、推定が誤った方向へ動く（P17-O03）。
- 反例・適用しない場合：resilience4jのbulkhead（P17-O09）は上限を設定値として持ち、観測で動かさない。envoyのcircuit breaker（P17-O10）も設定値（runtimeで上書き可）である。
- 互換・非互換：P17-O02（上限の推定）、P17-O03（結果の分類）、P17-O04（partition）、P17-O05（待ち方）の土台になる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。初期上限・最大上限などの値は持ち込まない。

### P17-O02 遅延から待ち行列の長さを推定して上限を増減する（Vegas型・AIMD型と、標本の窓）
- 出典：concurrency-limits、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/VegasLimit.java` 行32–41、244–321（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/VegasLimit.java#L244-L321）、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/AIMDLimit.java` 行102–112（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/AIMDLimit.java#L102-L112）、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/WindowedLimit.java` 行132–168（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limit/WindowedLimit.java#L132-L168）。issue：Netflix/concurrency-limits#72（https://github.com/Netflix/concurrency-limits/issues/72）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `VegasLimit._update` は、負荷のないときの遅延（`rtt_noload`）と標本の遅延から、待ち行列の推定長 `limit × (1 − rtt_noload / rtt)` を計算する。破棄（drop）があれば上限を下げる。実行中件数が上限に近くなければ上限を動かさない（commentは「上向きのdriftを防ぐ」）。推定長がごく小さい（待ち行列がない）ときは大きな幅で上げる段があり（行296–297）、それより大きいが小さめなら上げ、大きければ下げ、中間なら据え置く。増減幅とその境目は、現在の上限の関数として与える。
  - 標本の回数が「推定上限に比例する回数（jitter付き）」に達したら、その標本を新しい `rtt_noload` として測り直す（`shouldProbe`、行244–246）。より小さい遅延を見たときも `rtt_noload` を更新する。どちらの場合も早期returnし、その標本では上限を更新しない（行254–272）。
  - `AIMDLimit._update` は、破棄または経過時間がtimeoutを超えたら上限を乗算で下げ、実行中件数が上限に近いときだけ加算で上げる（loss型）。
  - `WindowedLimit.onSample` は、標本を窓に貯め、窓の終わりに1つのthreadだけが集約値（遅延、最大実行中件数、破棄の有無）を下位の `Limit` に渡す。標本数が足りない窓は捨てる。極端に短い遅延は標本にしない。
- 解いている問題と前提：上限を超えた負荷が、まず待ち行列の伸び（遅延の増加）として現れるという前提で、資源の限界に達する前に上限を下げる。
- 必要な入力：遅延の標本、破棄の有無、実行中件数、無負荷時遅延の測り直しの周期、増減の関数（値は持ち込まない）。
- trade-off・失敗の仕方：
  - 無負荷時遅延の推定が古くなると、正常な遅延の伸びを待ち行列と誤認する。測り直しはその対策だが、測り直しの標本自体が負荷時の値になりうる。
  - #72は、server側のrate limit（429）で落とされるclientで、窓が長いとVegasが上手く追従しないという質問である（commentは1件で、maintainerではない参加者（author_association NONE）の意見。本文は質問の範囲で読んだ）。遅延でなく拒否で上限が現れる環境では、delay型の前提が崩れる。
- 反例・適用しない場合：上限が外部のrate limitで決まる場合（#72）。処理時間が要求ごとに大きく異なる場合は、遅延の伸びが待ち行列を表さない（本repoでは、これを直接論じた文書は見つけていない）。
- 互換・非互換：P17-O06（envoyのgradient controller）と同じ問題を別の式で解く。P17-O01の `onSample` の入力を使う。
- 限界：境目・増減幅・測り直しの周期などの値は持ち込まない。

### P17-O03 統合の境界で「何を破棄とみなすか」を決める（gRPC server／client）
- 出典：concurrency-limits、`concurrency-limits-grpc/src/main/java/com/netflix/concurrency/limits/grpc/server/ConcurrencyLimitServerInterceptor.java` 行155–220（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-grpc/src/main/java/com/netflix/concurrency/limits/grpc/server/ConcurrencyLimitServerInterceptor.java#L155-L220）、`concurrency-limits-grpc/src/main/java/com/netflix/concurrency/limits/grpc/client/ConcurrencyLimitClientInterceptor.java` 行74–90（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-grpc/src/main/java/com/netflix/concurrency/limits/grpc/client/ConcurrencyLimitClientInterceptor.java#L74-L90）、`README.md` 行44–90（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/README.md#L44-L90）。issue：#162（https://github.com/Netflix/concurrency-limits/issues/162、題名「Unavailable is misleading」）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - server側は、callのclose時にstatusが `DEADLINE_EXCEEDED` なら `onDropped`、それ以外のstatusはerrorを含めて `onSuccess` とする。clientのcancelは `onDropped`、handler内の未捕捉例外は `onIgnore` とする。上限超過時は、既定で `UNAVAILABLE` を返してcallを閉じる（statusとtrailerは差し替え可能）。
  - client側は、OKなら `onSuccess`、`UNAVAILABLE` なら `onDropped`、それ以外は `onIgnore` とする。
  - READMEは、server側にはdelay型（Vegas）を、client側にはloss型（AIMD）か複合型を推奨し、client側のlimiterの用途として、(1) 依存先の遅延から自分を守るためにfail fastして劣化した応答を返すこと、(2) 他serviceを呼ぶbatchで、依存先へ不要な負荷をかけないbackpressureとして働くことの2つを挙げる（README 行74）。
- 解いている問題と前提：上限の推定（P17-O02）は結果の分類に依存するが、何が過負荷の兆候かはprotocolと配置（server／client）で異なる。serverの拒否（`UNAVAILABLE`）をclientが破棄として数えることで、serverの過負荷がclientの上限低下に伝わる。
- 必要な入力：protocolのstatusと過負荷の対応、拒否を示すstatus、cancelやtimeoutの扱い。
- trade-off・失敗の仕方：server側では、業務errorも速く返れば成功の標本になり、上限を押し上げる方向に働く。clientは `UNAVAILABLE` を一律に破棄とみなすため、過負荷以外の理由の `UNAVAILABLE` でも上限が下がりうる。これらの分類の失敗の仕方は、codeの分岐からの推論であり、issueでの報告は確認していない。これとは別に、#162は、上限超過時に返すstatusを `UNAVAILABLE` から `RESOURCE_EXHAUSTED` に変える提案である（serverが落ちているように見えるため）。結果の分類ではなく、拒否の伝え方についての論点である。
- 反例・適用しない場合：resilience4jのcircuit breaker（P17-O07）は、例外の分類を述語として利用者に渡し、成功・失敗・無視をconfigで決める。envoyのoutlier検出（P17-O10）は、local起因とupstream起因のerrorを分けて数えるかを選べる。
- 互換・非互換：P17-O01の契約の実体。P17-O07の分類（ignore／record）と同じ問題を、固定の対応表で解いている。
- 限界：status名はgRPC固有である。

### P17-O04 全体の上限を超えたときだけ効くpartitionの保証と、拒否前の遅延
- 出典：concurrency-limits、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/AbstractPartitionedLimiter.java` 行56–92、128–133、226–263、291–295（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/AbstractPartitionedLimiter.java#L226-L263）、`README.md` 行38–40、52。issue：#234（https://github.com/Netflix/concurrency-limits/issues/234、open）、#120（https://github.com/Netflix/concurrency-limits/issues/120、open、返信なし）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - partitionごとに全体上限に対する割合を持ち、全体上限の変更時（`onNewLimit`、行291–295）に各partitionの上限を割合から再計算する（`updateLimit`、行128–133）。計算は切上げで下限を1とするため、commentは、partitionの上限の合計が全体上限を超えうると書いている（行129–131）。contextからpartition名を引く解決関数を順に試し、どれにも当たらなければ「unknown」partitionに入れる。
  - `acquire` は、全体の実行中件数が全体上限未満なら、partitionの上限を見ずに取得させる。全体上限以上のときだけ、partitionの上限で取得を判定する。commentは、partitionは硬い上限ではなく、全体に余裕があれば超過（burst）を許すと説明している。
  - 拒否するとき、partitionに遅延が設定されていれば、遅延中のthread数が上限未満の場合に限りsleepしてから拒否する（行250–260）。builderのcommentは、event loopのdirect executorでは勧めないと書く（行69–77）。
- 解いている問題と前提：live／batchのような種類の違う要求が同じ上限を共有するとき、過負荷時に重要な種類へ容量を保証する（README 行38–40）。種類の識別は信頼できる情報（READMEはTLS証明書とserver側の対応表を推奨）に基づく前提である（README 行52）。
- 必要な入力：partitionの識別方法、各partitionの割合（合計が全体以下）、未識別の要求の扱い、拒否前に遅延させるかどうか。
- trade-off・失敗の仕方：
  - #234は、全体上限の判定（`getInflight() >= getLimit()`）と件数の加算が原子的でないため、並行する要求が同時に「上限未満」と判定して全体上限を超えうる、と報告している（open）。
  - #120は、割合の配分では「batchを飢えさせてliveに全量を渡す」とREADMEが述べる挙動をどう実現するかが分からない、という質問で、返信はない。
  - 拒否前のsleepは呼出し側を遅らせるbackpressureだが、threadを保持する。
- 反例・適用しない場合：envoyのcircuit breakerは、partitionではなくrouting priorityごとに別の上限を持つ（P17-O10）。pgbouncerはuser×databaseの組ごとにpoolを分ける（P17-O13）。
- 互換・非互換：P17-O01の上に載る。P17-O05（LIFO待ち）と組み合わせられる（decoratorの形）。
- 限界：割合・遅延・遅延thread数の上限の値は持ち込まない。

### P17-O05 上限に達したときに待たせる場合の順序（LIFOの待ち行列、上限付きbacklog、期限）
- 出典：concurrency-limits、`concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/LifoBlockingLimiter.java` 行28–37、96–104、180–262（https://github.com/Netflix/concurrency-limits/blob/78a74b9878d38c4c048b0304ce12a162ab7b7222/concurrency-limits-core/src/main/java/com/netflix/concurrency/limits/limiter/LifoBlockingLimiter.java#L180-L262）。resilience4j、`resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/SemaphoreBulkhead.java` 行186–225、305–335（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/SemaphoreBulkhead.java#L186-L225）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `LifoBlockingLimiter` は、下位のlimiterで取れなければ、backlogの件数が上限未満の場合に限り、待ち行列の先頭に入れて待つ。解放のたびに先頭（最後に来た要求）から取得を試みる。待ちの期限は固定値か、contextから求める関数（commentは要求のdeadlineから決める例を挙げる）で与える。期限切れや割込みの直前に取得できていた場合は、その取得を返して失わないようにしている。classのcommentは「遅延より可用性を優先し、成功時の遅延を低く保ちtimeoutを減らすためにLIFOで処理する」と書く。
  - resilience4jの `SemaphoreBulkhead.acquirePermissionAsync` は、待っている要求がなく許可が取れれば即時に許可する。待ち時間の設定が0なら即時に拒否する。それ以外は待ちの登録とtimeoutの予約を行い、`grantPendingPermissions` がFIFO順に許可を渡す。期限切れ・取消し済みの待ちには許可を渡さず、許可を戻す。
- 解いている問題と前提：上限に達したときに即時に拒否せず短く待たせることで、瞬間的な超過を吸収する。待ちの上限と期限がないと、障害中に待ち行列が無制限に伸びる（LIFOのcomment 行187）。
- 必要な入力：待たせるか即時に拒否するか、backlogの上限、待ちの期限（固定か要求ごとか）、順序（LIFOかFIFOか）。
- trade-off・失敗の仕方：LIFOは、最も古い待ちを後回しにするため、その要求は期限切れになりやすい。代わりに、新しい要求は期限内に処理されやすい。FIFOは公平だが、過負荷が続くと全員の待ちが期限近くまで伸びる。この比較を両repoが文書で論じているわけではなく、LIFO側のclass commentに理由が書かれているだけである。
- 反例・適用しない場合：LIFOの待ちはthreadを止めるので、threading modelが待ちを許す場合に限る（LifoのclassのcommentとP17-O04の遅延と同じ制約）。pgbouncerは待ちの順序ではなく、待ち時間（`query_wait_timeout`）とreserve poolで扱う（P17-O13）。
- 互換・非互換：P17-O01（下位limiterをdecorateする）。P17-O09（bulkhead）のFIFOと対照になる。
- 限界：backlogの上限と期限の値は持ち込まない。

### P17-O06 proxyに置く適応的な同時実行数制限（gradient、minRTTの定期的な測り直し、jitter）
- 出典：envoy、`docs/root/configuration/http/http_filters/adaptive_concurrency_filter.rst` 行9–119（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/docs/root/configuration/http/http_filters/adaptive_concurrency_filter.rst#L9-L119）。信頼性ラベル：primary（公式repository内のdocs）。本文確認：済（docsのみ。`gradient_controller.cc` は存在だけ確認し、本文は読んでいない）
- 何をしているか：
  - filterは、cluster内の全hostへの未完了要求数の上限を、完了した要求の遅延標本から計算する。
  - minRTTは、上限を最小値に固定した期間の遅延として定期的に測る。上限が連続して最小値に張り付いた場合にも測り直す。測り直しの開始はjitterで遅らせ、cluster内の全hostが同時に測り直しに入らないようにする。
  - 上限は `gradient × 旧上限 + headroom` で更新し、gradientは `(minRTT + buffer) / sampleRTT` である。headroomは上限の平方根に固定され、設定できない（停滞を防ぐために必須だとdocsは書く）。
  - 測り直し用の同時実行数と、通常時の下限を別の設定に分けられる。
- 解いている問題と前提：P17-O02と同じく、遅延の伸びで過負荷を検知する。docsの「Limitations」は、filterがそのclusterへの要求をすべて通す（filterを通らない要求がない）ことと、local clusterのfilter chainに置くことを前提に挙げる。
- 必要な入力：遅延の集約方法（percentile）、更新周期、測り直しの条件と並行度、jitter、下限。
- trade-off・失敗の仕方：docsは、minRTTの測り直し中は上限が大きく下がるため503が増えうると明記し、retry（別hostへのretry述語）を勧めている。測り直しそのものが可用性を一時的に下げる。
- 反例・適用しない場合：filterを通らない経路で同じclusterへ要求が流れる構成（docsのLimitations）。
- 互換・非互換：P17-O02（libraryとしてprocess内に置く）とは、置き場所（process内か、proxyか）が違う。P17-O10（retry budget）とは、測り直し中の503をretryで吸収する点で関係する。
- 限界：docsの例にある値は持ち込まない。controllerの実装は読んでいない。

### P17-O07 呼出し結果による状態機械としてのcircuit breaker（closed／open／half-open、無効・計測のみ・強制open）
- 出典：resilience4j、`resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerStateMachine.java` 行194–245、263–267、594–668、687–755、793–795、909–982、1079–1195（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerStateMachine.java#L194-L245 、https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerStateMachine.java#L1079-L1195）、`resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/CircuitBreakerConfig.java` 行275–310、`resilience4j-all/src/main/java/io/github/resilience4j/decorators/Decorators.java` 行22–42（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-all/src/main/java/io/github/resilience4j/decorators/Decorators.java#L22-L42）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 例外は、まず「無視する」述語で判定し、該当すれば許可を返して数えない。次に「記録する」述語に該当すれば失敗、該当しなければ成功として数える。戻り値も述語で失敗とみなせる（`onResult`）。さらに `transitionOnResult` 関数で、結果から直接openへ遷移させ、待ち時間か待ち終了時刻を指定できる（`TransitionCheckResult`）。ただし、これが効くのはCLOSEDだけで、他の状態の `handlePossibleTransition` は何もしない（行793–795等）。CLOSEDでopenを求めながら待ち時間も終了時刻も無い結果は `IllegalArgumentException` になる（行640–650）。また、この関数が評価されるのは、記録対象・成功扱いの例外と、失敗とみなされなかったnullでない戻り値の場合に限られる。無視された例外、失敗とみなされた戻り値、`onSuccess` の経路では評価されない（行206–245、263–267）。
  - CLOSEDは常に許可し、閾値以上になったら1回だけopenへ遷移する（`compareAndSet`）。OPENは、待ち時間が過ぎていれば呼出し時にhalf-openへ遷移して許可を判定し、過ぎていなければ拒否する。待ち時間はopenになった回数（`attempts`）の関数で求める（行697–699）。自動遷移を有効にすると、scheduleでhalf-openへ移る。
  - HALF_OPENは、許可数を数えて試験呼出しだけを通し、その結果が閾値以上ならopen、閾値未満（`BELOW_THRESHOLDS`）ならclosedへ移る。half-openに留まれる最大時間と、その後に移る状態を設定した場合に限り、時間が過ぎたらその状態へ移る（行1097–1105）。
  - 上の3状態のほかに、DISABLED（常に許可）、METRICS_ONLY（常に許可し、閾値超過のeventだけを1回出す）、FORCED_OPEN（常に拒否）がある。
  - `Decorators` のcommentは、builderに並べた順に内側から包むこと（例：Fallback(Retry(CircuitBreaker(Supplier)))）と、各decoratorが例外を失敗とみなすかを独立に決めることを書く。
- 解いている問題と前提：依存先が壊れているときに呼出しを止めて速く失敗させ、依存先の回復を試験呼出しで確かめる。判定はprocess内の呼出し結果だけに基づき、他のinstanceと状態を共有しない。
- 必要な入力：失敗とみなす例外・戻り値、無視する例外、open中の待ち時間（回数に応じて変えるか）、half-openの試験呼出し数と最大滞在時間、自動遷移の有無、導入時に計測だけ行うか。
- trade-off・失敗の仕方：closedからopenへの遷移と並行して完了した呼出しの結果も、遷移後の状態で記録する（OPENの `onError`／`onSuccess` のcomment 行774–789）。half-openの許可数を使い切ると、結果が出るまで他の呼出しはすべて拒否される。decoratorの順序によって、retryがopenによる拒否（`CallNotPermittedException`）を再試行するかどうかが変わりうる（`Decorators` のcommentの例と「各decoratorが失敗かを独立に決める」という記述から読める推論で、retry側の実装は読んでいない）。
- 反例・適用しない場合：envoyの「circuit breaker」（P17-O10）は資源の数の上限で、呼出し結果の状態機械ではない。envoyで呼出し結果によって送り先を外す仕組みはoutlier検出である（P17-O10）。
- 互換・非互換：P17-O08（判定の窓）を使う。P17-O03（結果の分類）と同じ問題を述語で解く。P17-O09（bulkhead）とdecoratorとして合成される。
- 限界：状態名は製品固有である。待ち時間・試験呼出し数の値は持ち込まない。

### P17-O08 circuit breakerの判定窓：件数窓／時間窓、最小呼出し数、遅い呼出しを別の軸で数える
- 出典：resilience4j、`resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerMetrics.java` 行100–199、260–279（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerMetrics.java#L100-L199）、`CircuitBreakerConfig.java` 行52、82、225。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 呼出しを、経過時間が「遅い」の閾値を超えたかどうかと、成功か失敗かの組で4種（SUCCESS、SLOW_SUCCESS、ERROR、SLOW_ERROR）に分けて窓に記録する。
  - 窓に入った呼出し数が最小呼出し数に満たなければ、判定しない（`BELOW_MINIMUM_CALLS_THRESHOLD`）。満たせば、失敗率と遅い呼出し率をそれぞれの閾値と比べ、どちらが閾値以上か（両方、失敗率、遅さ、なし）を返す（判定は「以上」、行148–157）。どちらかが閾値以上ならopenの対象になる。
  - 窓の種類は、直近N件の件数窓と、直近N秒の時間窓から選ぶ（`SlidingWindowType`）。それぞれに、同期型とlock-free型の実装がある。
  - 呼出しが拒否された件数は、判定とは別のcounterで数える（行100–102）。
- 解いている問題と前提：依存先が「失敗はしないが遅い」状態でも呼出し側の資源（threadや接続）を占有するため、遅さを失敗と同格の開放条件にする。標本が少ないときの誤判定を最小呼出し数で防ぐ。
- 必要な入力：窓の種類と大きさ、最小呼出し数、失敗率と遅い呼出し率の閾値、「遅い」とみなす経過時間。
- trade-off・失敗の仕方：件数窓は、流量が少ないと古い呼出しが長く残る。時間窓は、流量が少ないと最小呼出し数に届かず判定しない。遅さの閾値は依存先の遅延分布に依存する。
- 反例・適用しない場合：concurrency-limits（P17-O02）は遅延を上限の推定に使い、呼出しを止める判定には使わない。envoyのoutlier検出は、連続失敗（inline）と期間ごとの成功率（定期）を別の検出型として持つ（P17-O10）。
- 互換・非互換：P17-O07の判定の入力。P17-O02と、遅延を「止める」側に使うか「絞る」側に使うかで分かれる。
- 限界：窓の大きさ・閾値の値は持ち込まない。

### P17-O09 bulkhead：semaphore型とthread pool型の隔離、実行時の上限変更
- 出典：resilience4j、`resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/SemaphoreBulkhead.java` 行136–181、294–303（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/SemaphoreBulkhead.java#L136-L181）、`resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/FixedThreadPoolBulkhead.java` 行44–47、88–93、145、162–164（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-bulkhead/src/main/java/io/github/resilience4j/bulkhead/internal/FixedThreadPoolBulkhead.java#L88-L93）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - semaphore型は、同時呼出し数の上限をsemaphoreで表し、同期呼出しは設定の最大待ち時間だけ取得を待つ（`tryEnterBulkhead`）。取れなければ `BulkheadFullException` を投げる。割込みで取れなかった場合は別の例外にする。`changeConfig` は、上限の差分だけsemaphoreを取得または解放し、実行時に上限を変える。
  - thread pool型は、core・maxのthread数とkeep-alive時間、上限付きqueue（容量0なら直接受渡しのqueue）を持つ `ThreadPoolExecutor` で実行する（行88–93）。拒否handlerは設定で差し替えられ（行93）、`BulkheadFullException` に変換するのは `RejectedExecutionException` が投げられた場合に限る（行162–164）。差し替えたhandlerが例外を投げない場合の扱いは読んでいない。呼出し側のcontextを実行threadへ渡す仕組み（`ContextPropagator`）を持つ。
- 解いている問題と前提：1つの依存先の遅延が、呼出し側の全threadを占有して他の機能まで止めること（資源の枯渇の連鎖）を、依存先ごとに資源を分けて防ぐ。
- 必要な入力：隔離の単位（依存先ごと等）、同時実行数、待ち時間、thread pool型の場合はthread数とqueue容量、contextの受渡し。
- trade-off・失敗の仕方：semaphore型は呼出し側のthreadで実行するため、timeoutで処理を打ち切れない（打ち切りは別のtime limiterの役割）。thread pool型はthreadの切替えとcontextの受渡しの費用がかかる。上限を下げる `changeConfig` は、使用中の許可が戻るまで `acquireUninterruptibly` で待つ（行141–142）。
- 反例・適用しない場合：concurrency-limits（P17-O01）は上限を観測で変える。bulkheadの上限は設定で与え、必要なら `changeConfig` で外から変える。
- 互換・非互換：P17-O05（FIFOの非同期待ち）、P17-O07（decoratorとして合成）。pgbouncerのuser×database単位のpool（P17-O13）は、DB接続について同じ隔離をproxyで行う。
- 限界：上限・thread数・queue容量の値は持ち込まない。

### P17-O10 proxyの資源数によるcircuit breaker、retry budget、outlier検出（結果による送り先の除外）
- 出典：envoy、`docs/root/intro/arch_overview/upstream/circuit_breaking.rst` 行6–85（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/docs/root/intro/arch_overview/upstream/circuit_breaking.rst#L6-L85）、`source/common/upstream/resource_manager_impl.h` 行24–111、157–212（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/source/common/upstream/resource_manager_impl.h#L157-L212）、`docs/root/intro/arch_overview/upstream/outlier.rst` 行6–80（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/docs/root/intro/arch_overview/upstream/outlier.rst#L6-L80）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - envoyの「circuit breaker」は、upstream clusterごと・routing priorityごとの資源の数の上限である。接続数、接続待ちの要求数、未完了の要求数、未完了のretry数、接続pool数を、それぞれ上限と比べる。超えたら対応するoverflow counterを加算し、HTTPでは過負荷を示すheaderを付ける。上限はworker thread間で共有し、node間では調整しない（docsは「fully distributed (not coordinated)」と書く）。
  - `ResourceManagerImpl` のcommentは、実装が正しさより単純さを優先していると明記し、次の2点を挙げる。worker間で資源を均さないので高競合時に偏りうること。atomicを使っても一時的に上限を超えうること。
  - retryの上限は、固定値の代わりにbudgetにできる。budgetは、未完了の要求数と接続待ちの要求数の和（または固定窓内の要求数）に対する割合として計算し、最小並行retry数を下限にする（行183–212）。docsは、retryの総量の爆発による連鎖障害を防ぐためにbudgetを勧めている（行43–48）。
  - outlier検出は、filterが報告したerror・timeout・resetから、連続失敗（inline）や期間ごとの成功率（定期）などでhostを外れ値と判定し、load balancingの対象から外す（ejection）。外されたhostの割合が上限を超える場合は外さない。外す時間は、連続で外された回数に比例して伸び、最大値で止まる。local起因とupstream起因のerrorを分けて数えるかを選べる。clusterを複数のfilter chainが共有すると、1つのchainの判定が他のchainにも及ぶと注記している。
- 解いている問題と前提：アプリごとにcodeを書かずに、network層で速く失敗させ、下流へbackpressureをかける（docs 行6–10）。
- 必要な入力：clusterとpriorityごとの各資源の上限、retryの上限かbudget（割合、下限、窓）、外れ値の検出型と外す割合の上限、外す時間の基準と最大値、errorの起因の区別。
- trade-off・失敗の仕方：
  - 上限は結果整合であり、threadの競合で超えうる（docs 行74–77、header comment）。最大接続数を超えても、選ばれたhostには最低1本の接続を確保するため、実際の接続数は上限を超えうる（docs 行14–25）。
  - retry budgetは要求量に比例するため、流量が少ないと下限が支配する。
  - outlier検出は、外す割合の上限を超えると外さないため、cluster全体が劣化している場合は劣化したhostにも送り続ける。
- 反例・適用しない場合：resilience4j（P17-O07）は呼出し結果による状態機械をcircuit breakerと呼ぶ。同じ語が、envoyでは資源数の上限を、resilience4jでは結果による遮断を指す。比べるときは語ではなく仕組みで対応させる必要がある（envoyで後者に近いのはoutlier検出）。
- 互換・非互換：P17-O06（測り直し中の503をretryで吸収するとbudgetを消費する）、P17-O11（overload managerはproxy自身の資源、circuit breakerはupstreamへの資源を守る）、P17-O13（接続pool）。
- 限界：docsとcodeにある既定値は持ち込まない。outlierの実装（`outlier_detection_impl.cc`）は読んでいない。

### P17-O11 資源の圧力をtriggerで状態に変え、行動とload shed pointへ配る（overload manager）
- 出典：envoy、`docs/root/configuration/operations/overload_manager/overload_manager.rst` 行95–111、113–157、196–279、286–322、382–417（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/docs/root/configuration/operations/overload_manager/overload_manager.rst#L196-L279）、`source/server/overload_manager_impl.cc` 行29–80、449–474、526–550、763–793、942–963（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/source/server/overload_manager_impl.cc#L449-L474 、https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/source/server/overload_manager_impl.cc#L526-L550 、https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/source/server/overload_manager_impl.cc#L942-L963）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - resource monitor（heap、cgroup memory、下流の接続数等）が圧力を0〜1の値で報告する。triggerは圧力を行動の状態に変える。threshold triggerは閾値以上で飽和、未満で非活性の2値にする。scaled triggerは、2つの閾値の間で線形に0〜1の値を返す。
  - 1つの行動（overload action）に複数のtriggerがある場合、状態はtriggerの状態の最大値である（`OverloadAction::updateResourcePressure`）。
  - 行動には、新しい要求を即時に拒否する、keepaliveを止めて接続をdrainする、新しい接続の受付を止める、heapを縮める、timeoutを短くする、memoryを多く使うstreamをresetする、などがある。timeoutの短縮は、scaled triggerの値で通常のtimeoutと最小timeoutの間を補間する。
  - load shed pointは、接続とstreamの生涯の要所（TCP accept、header decode後、codec、router、接続poolの新規接続等）に置く判定点である。`shouldShedLoad` は、triggerの状態の最大値を確率として、Bernoulli試行で落とすかどうかを決める。docsは、load shed pointは急な負荷に反応しやすく、overload actionは処理が進んでいない接続やstreamを落とす場合に向く、と書き分けている。
  - 圧力は定期的に更新する。前回の更新がまだ終わっていないresourceは更新を飛ばし（skipped_updates）、monitorが失敗した場合は失敗counterだけを加算して圧力を更新しない（行942–963）。
- 解いている問題と前提：proxy自身の資源（主にmemory）が尽きる前に、段階的に負荷を落とす。圧力の測定（monitor）、状態への変換（trigger）、落とし方（action／shed point）を分け、それぞれを拡張できるようにしている。
- 必要な入力：監視する資源と圧力の定義、triggerの型と閾値、資源ごとの行動、どの段階（接続、stream、upstream接続）で落とすか、更新周期。
- trade-off・失敗の仕方：
  - monitorの失敗時は直前の圧力が残るため、失敗が続くと状態が古いまま固定される（コードから読める範囲の観察で、実害の報告は確認していない）。
  - 確率的shedは、同じ状態でも要求ごとに結果が異なる。docsは、HTTP/2で `GOAWAY` と同時に接続を強制closeするshed pointを「破壊的」とし、使うなら非常に高い閾値でと注記している。
- 反例・適用しない場合：concurrency-limits（P17-O01〜O05）は資源の圧力ではなく遅延と結果から上限を決める。overload managerは遅延を見ない。
- 互換・非互換：P17-O10（upstream側の資源）と、守る対象が違う。P17-O06（filter）と同じproxyに併置できる。
- 限界：docsの例とcodeにある閾値・周期の値は持ち込まない。各monitorの実装（`source/extensions/resource_monitors`）は読んでいない。

### P17-O12 同一keyの読込みの合流（singleflight）と、key所有者による分散cache、無効化しない前提
- 出典：groupcache、`singleflight/singleflight.go` 行17–64（https://github.com/golang/groupcache/blob/2c02b8208cf8c02a3e358cb1d9b60950647543fc/singleflight/singleflight.go#L17-L64）、`groupcache.go` 行145–168、241–298、308–368（https://github.com/golang/groupcache/blob/2c02b8208cf8c02a3e358cb1d9b60950647543fc/groupcache.go#L241-L298 、https://github.com/golang/groupcache/blob/2c02b8208cf8c02a3e358cb1d9b60950647543fc/groupcache.go#L308-L368）、`README.md` 行10–60（https://github.com/golang/groupcache/blob/2c02b8208cf8c02a3e358cb1d9b60950647543fc/README.md#L10-L60）。issue：golang/groupcache#161（https://github.com/golang/groupcache/issues/161、closed）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `singleflight.Group.Do(key, fn)` は、同じkeyの実行中の呼出しがあれば、後から来た呼出しを待たせ、同じ結果（値とerror）を返す。完了したらkeyをmapから消すので、結果は保持しない（cacheではない）。
  - `Group.load` は、singleflightの中でcacheを再確認する。commentは、singleflightは時間的に重なった呼出ししか合流できず、cache missの後に2つの読込みが直列に走りうるため、と説明している。次に、consistent hashでkeyの所有peerを選び、所有者が他peerならRPCで取りに行く。RPCが失敗したら自分で読む。自分で読んだ値は、所有者用のcache（mainCache）に入れる。
  - 他peerから取った値は、一部の確率でhotCacheに入れる（commentのTODOは、本来はQPS等で判断したいと書く）。hotCacheは、所有者でないkeyの人気の高い値を複製し、特定peerのnetworkへの集中を避ける。
  - 2つのcacheの合計が上限を超えたら、hotCacheがmainCacheに比べて一定以上大きければhotCacheから、そうでなければmainCacheから、古いものを追い出す（commentは「good-enough-for-now」と書く）。
  - READMEは、memcachedとの違いとして、cache miss時の読込みを調整して「thundering herd」を防ぐこと、版付きの値・期限・明示的な追出しを持たない（keyに対する値は常に同じ）ことを挙げる。
- 解いている問題と前提：cache missが同時に多数起きたときに、元のdata sourceへの読込みが殺到すること。値が不変である（変更は新しいkeyで表す）ことを前提に、無効化の問題をなくしている。
- 必要な入力：keyの設計（版をkeyに含めるか）、所有者の決め方（peer集合とhash）、cacheの容量、hotCacheへの複製の判断。
- trade-off・失敗の仕方：
  - singleflightは、errorも待っていた全員に返す。#161では、一時的なerrorの場合にretryしたいという質問に、contributorが「singleflightはerrorが同時の呼出し全員に当てはまる場合のために作られている」と答え、関数自身の中でretryすることを示唆している。
  - 値を変えられないので、更新されうるdataには、keyに版を含めるなどの設計が利用者側に要る。
  - peerの集合が変わると、keyの所有者が変わり、mainCacheの内容が無駄になる（consistent hashの実装は読んでいない）。
- 反例・適用しない場合：resilience4jのcache（P17-O14）は、合流の仕組みを持たない。更新が頻繁で、keyに版を含められないdata。
- 互換・非互換：P17-O14と、miss時の合流の有無で対照になる。hotCacheは、SCF-B-0155 D01 §4のgapが挙げる「負荷の集中点」（特定nodeへの集中）を、値の複製で解く例である。
- 限界：容量・複製の確率・追出しの比の値は持ち込まない。`consistenthash`、`http.go`、`lru` は読んでいない。

### P17-O13 接続poolを「いつ接続を返すか」で分け、client数とserver数の差を待ち行列にする（pgbouncer）
- 出典：pgbouncer、`doc/config.md` 行83–223、364–393、667–699、741–757、1081–1103（https://github.com/pgbouncer/pgbouncer/blob/7d38761c8f6c757238fde9f942cf9fe0cd272ae3/doc/config.md#L83-L223 、https://github.com/pgbouncer/pgbouncer/blob/7d38761c8f6c757238fde9f942cf9fe0cd272ae3/doc/config.md#L667-L699）、`doc/usage.md` 行26–50（https://github.com/pgbouncer/pgbouncer/blob/7d38761c8f6c757238fde9f942cf9fe0cd272ae3/doc/usage.md#L26-L50）、`src/objects.c` 行1913–1955（https://github.com/pgbouncer/pgbouncer/blob/7d38761c8f6c757238fde9f942cf9fe0cd272ae3/src/objects.c#L1913-L1955）、`src/janitor.c` 行326–358（https://github.com/pgbouncer/pgbouncer/blob/7d38761c8f6c757238fde9f942cf9fe0cd272ae3/src/janitor.c#L326-L358）。envoy、`docs/root/intro/arch_overview/upstream/connection_pooling.rst` 行126–154（https://github.com/envoyproxy/envoy/blob/57f7346d40d5f681a2d677123508c9827d0c8e02/docs/root/intro/arch_overview/upstream/connection_pooling.rst#L126-L154）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - pool modeは、server接続をpoolへ返す時点を決める。sessionはclientの切断時、transactionはtransactionの終了時、statementはqueryの終了時に返す（statementでは複数文のtransactionを禁止する）。
  - `server_reset_query` は、session modeで接続を返すときにsession状態を消すqueryを送る。docsは、transaction modeでは各transactionが別の接続（別のsession状態）に当たるので、clientはsession機能を使ってはならず、reset queryは使わないと書く。session機能を使うアプリをtransaction modeで動かす壊れた構成のために、毎回resetする設定（`server_reset_query_always`）があり、docsは「非決定的な破損を決定的な破損に変える」と説明している。
  - server接続の上限はuser×databaseの組（pool）ごとに持ち、database単位・user単位の上限も重ねられる。client接続の上限は別に持ち、docsは、client側上限とserver側上限の差を「待ち行列の大きさ」と考えられると書く（行185–188、216–219）。
  - `launch_new_connection` は、poolが満杯で、先頭の待ちclientの待ち時間がreserve poolの待ち時間を超えていれば、reserve poolの範囲で接続を追加する（warning logを出す）。cancel要求が待っている場合は、通常の上限を超えて接続を作れる（commentあり、行1913–1925）。
  - janitorは、待ち時間が `query_wait_timeout`（database単位・user単位で上書き可）を超えたclientを切断する。docsは、無効にすると無期限に待たせると書く。
  - envoyの接続poolは、cluster×host×protocol（priority、socket option、transport socketなどでも分かれる）ごと、かつworker threadごとに持つ。activeまたはpassiveのhealth checkingを設定している場合、hostが利用可能から利用不可へ遷移すると、そのhostへのpoolの全接続を閉じる（docs 行150–154）。
- 解いている問題と前提：接続を開く費用（DB側の接続数の限界）を下げるために、多数のclient接続を少数のserver接続へ多重化する。多重化の粒度を細かくするほど、client側が使えるsession状態が減る。
- 必要な入力：アプリがsession状態（一時table、session変数、advisory lock、名前付きprepared statement等）を使うか、poolを分ける単位、client側とserver側の上限、待ち時間の上限、reserve poolの条件、接続の寿命とidle時間。
- trade-off・失敗の仕方：
  - transaction modeでsession機能を使うと、状態が別のclientに漏れたり消えたりする（docs 行680–683、694–697）。protocolレベルのprepared statementは追跡・書換えで対応するが、SQLレベルの `PREPARE` は対象外である（行388–393）。
  - database・user単位の上限に達した場合、あるpoolのclientを閉じても、そのserver接続がidle timeoutで閉じるまで、別のpoolは接続を得られない（行169–174、204–209）。
  - envoyのpoolはworkerごとに持つため、pool数はworker数に比例して増える（docs 行142–143）。接続数もworker数に応じて増えるというのは、この記述からの推論である（circuit breakerの上限は全workerの合計に掛かる、P17-O10）。
- 反例・適用しない場合：session状態に依存するアプリ（transaction／statement modeを使えない）。
- 互換・非互換：P17-O09（依存先ごとの資源の隔離）、P17-O10（envoyでは接続数・接続待ち要求数がcircuit breakerの上限になる）、P17-O05（待ちの扱い：pgbouncerは待ち時間で切る）。
- 限界：pool sizeや各timeoutの既定値は持ち込まない。pgbouncerのsourceは上記の関数だけを読んだ。

### P17-O14 cacheの障害時に元の処理へ素通しする（fail-open）cache decoratorと、その副作用
- 出典：resilience4j、`resilience4j-cache/src/main/java/io/github/resilience4j/cache/internal/CacheImpl.java` 行65–101、184–202（https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-cache/src/main/java/io/github/resilience4j/cache/internal/CacheImpl.java#L65-L101 、https://github.com/resilience4j/resilience4j/blob/7e3ab5252ed380b596e25240f19376a4435570b8/resilience4j-cache/src/main/java/io/github/resilience4j/cache/internal/CacheImpl.java#L184-L202）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - JCache（`javax.cache.Cache`）を包み、`computeIfAbsent` で、まずcacheを読み、無ければ `cache.invoke` に `ComputeIfAbsent` のentry processorを渡して、値を計算して書き込む。
  - cacheの読込みで例外が出たら、warning logとerror eventを出して、missとして扱う。`invoke` で例外が出たら、同じくlogとeventを出したうえで、supplierを直接呼んで値を返す（commentは「fallback」と書く）。
  - 有効期限、無効化、追出しの方針は、包んでいるJCacheの実装と設定に委ねている（このclassには無い）。
- 解いている問題と前提：cacheを性能の補助と位置づけ、cacheが壊れていても業務処理は続ける。
- 必要な入力：cacheの実装（期限・追出し・無効化はそちらで決める）、cache障害を許容するかどうか。
- trade-off・失敗の仕方：
  - `invoke` の例外には、entry processorの中で呼んだsupplier自身の例外も含まれうる。その場合、fallbackでsupplierがもう一度呼ばれる（今回読んだcodeから読める経路で、issueでの報告は確認していない）。supplierが副作用を持つと二重に実行される。
  - cacheが落ちると、全呼出しが元の処理へ素通しされ、元の処理への負荷が一度に戻る。合流の仕組み（P17-O12）は無い。
- 反例・適用しない場合：groupcache（P17-O12）は、miss時の読込みを合流させ、所有者だけが読む。
- 互換・非互換：P17-O12と対照。P17-O07（circuit breaker）と組み合わせると、cache障害時に素通しされた負荷を依存先側で止める構成になりうるが、そう組み合わせた例は今回のrepoで見ていない。
- 限界：JCache側の期限・追出しの値は扱わない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 同時実行数の上限をどう決めるか | concurrency-limits：遅延と破棄の観測から推定し、上限を動かす（O01・O02）。envoy adaptive concurrency：proxyでgradientとminRTTの測り直しで動かす（O06） | resilience4j bulkhead：設定値（外から `changeConfig`）（O09）。envoy circuit breaker：設定値（runtimeで上書き可）（O10）。pgbouncer：設定値（O13） | 上限を事前に知れるか。autoscaleで変わるか。process内かproxyか |
| 上限に達した要求をどうするか | concurrency-limits：即時拒否、またはLIFOで期限付きに待たせる（O05）。partition超過は遅延後に拒否（O04） | resilience4j：待ち時間0なら即時拒否、それ以外はFIFOで期限付き（O05・O09）。pgbouncer：待ち行列で待たせ、待ち時間の上限で切断、reserve poolを開く（O13） | 待ちの順序（遅延優先か公平か）。threadを止めてよいか |
| 何を過負荷・失敗とみなすか | concurrency-limits：protocolのstatusを固定の対応で分類（O03） | resilience4j：例外・戻り値の述語を利用者が渡す（O07）。envoy outlier：local起因とupstream起因を分けるか選べる（O10） | libraryがprotocolを知っているか |
| 依存先が壊れたときに止める仕組み | resilience4j：失敗率と遅い呼出し率による状態機械、half-openで試験（O07・O08） | envoy：資源数の上限（circuit breaker）とhostの除外（outlier検出、除外時間は回数で伸びる）（O10） | 同じ「circuit breaker」の語が別の仕組みを指す。process内の1依存先か、clusterの複数hostか |
| retryの総量の抑制 | envoy：要求量に対する割合のretry budgetと下限（O10） | resilience4j：decoratorの順序で、retryがopenによる拒否を再試行するかが決まる（O07）。budgetは今回読んだ範囲で見ていない | retryをproxyが一元的に持つか、呼出し側のcodeが持つか |
| 自身の資源が尽きそうなとき | envoy overload manager：monitor→trigger→action／load shed point、確率的に落とす（O11） | concurrency-limits：資源を直接は見ず、遅延の伸びで上限を下げる（O02） | 資源（memory等）を直接測れるか |
| cache missの殺到 | groupcache：singleflightで合流し、所有者だけが読む。値は不変で無効化しない（O12） | resilience4j cache：合流なし。cache障害時は素通し（O14） | 値を不変にできるか。cacheを分散させるか |
| 接続の多重化 | pgbouncer：返す時点（session／transaction／statement）でsession状態の契約が決まる（O13） | envoy：protocolの多重化（HTTP/2・3のstream）と、worker×host×protocolごとのpool（O13） | session状態を持つprotocolか |

## 見つからなかったこと・gap
- 索引とN+1（D01 §4のgapに含まれる観点）は、今回のrepoでは扱っていない。ORMやquery plannerのrepoを読む必要がある。
- cacheの無効化：groupcacheは値を不変にして無効化を持たない（O12）。resilience4jはJCacheに委ねる（O14）。書込み時の無効化、TTL、stale-while-revalidate、版付きkeyといった無効化の方式を実装として比べられるrepoは、今回の5本には含まれていない。
- 分散した（node間で調整する）同時実行数制限：envoyのcircuit breakerは、node間で調整しないと明記している（circuit_breaking.rst 行9–10）。concurrency-limitsのREADMEは各nodeが局所的な上限を持つと書く（行9）だけで、調整しないことの明記はない（今回読んだ範囲に調整の仕組みが無かったことからの推論）。全体の上限を共有する実装は今回見ていない（rate limitの共有counterはP10-O09で観察済み）。
- concurrency-limitsのGradient2Limit、`BlockingAdaptiveExecutor`（#231は既定値でthreadが無制限に作られうるという報告、題名のみ確認）、servlet統合は読んでいない。
- envoyのoutlier検出の実装、各resource monitor、adaptive concurrencyのcontroller実装、接続poolの実装（`source/common/conn_pool`）は読んでいない。docsとheaderの範囲の観察である。
- resilience4jのrate limiter、time limiter、hedge、retryは読んでいない（rate limitはP10、retryはP08-O11で別に観察している）。
- ADR形式の設計記録は、5 repoとも見当たらなかった。判断の根拠はcode comment、docs、issueにある。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。envoyはsparse checkoutで範囲を限った。読むだけで、build・test・script・hookは実行していない。GitHub APIはmetadata（default branch、SPDX、archived、HEAD commit）とissueの取得に使った。
- concurrency-limits：`README.md`（全体）、`Limiter.java`（全体）、`limiter/AbstractLimiter.java`（全体）、`limiter/SimpleLimiter.java`（全体）、`limiter/AbstractPartitionedLimiter.java`（44–137のcomment、190–300）、`limiter/LifoBlockingLimiter.java`（comment、178–262）、`limit/VegasLimit.java`（30–80、240–321）、`limit/AIMDLimit.java`（timeout関連、100–112）、`limit/WindowedLimit.java`（25–60、132–168）、gRPCのserver・client interceptor（status対応の箇所）。issue #234、#120、#72（本文）、#162、#231（題名）。読んでいないもの：`Gradient2Limit.java`、`executors/BlockingAdaptiveExecutor.java`、servlet、spectator、`limit/window/*`。
- resilience4j：`CircuitBreakerStateMachine.java`（190–245、594–680、687–790、905–985、1079–1200）、`CircuitBreakerMetrics.java`（60–200、258–280）、`CircuitBreakerConfig.java`（定数と `TransitionCheckResult`、52–310の該当行）、`SemaphoreBulkhead.java`（95、130–335）、`FixedThreadPoolBulkhead.java`（44–93、140–195の該当行）、`resilience4j-cache/.../CacheImpl.java`（全体）、`resilience4j-all/.../Decorators.java`（20–45）。読んでいないもの：`resilience4j-core/.../metrics/*` の窓の実装、ratelimiter、timelimiter、hedge、retry、spring統合。
- groupcache：`README.md`（全体）、`singleflight/singleflight.go`（全体）、`groupcache.go`（84–170、212–370）。issue #161（本文と返信）、ほかsingleflight関連のissue 5件は題名のみ。読んでいないもの：`consistenthash/`、`http.go`、`peers.go`、`lru/`。
- envoy：`docs/root/intro/arch_overview/upstream/circuit_breaking.rst`（全体）、`outlier.rst`（1–80）、`connection_pooling.rst`（全体）、`docs/root/configuration/operations/overload_manager/overload_manager.rst`（1–420）、`docs/root/configuration/http/http_filters/adaptive_concurrency_filter.rst`（1–140）、`source/common/upstream/resource_manager_impl.h`（20–230）、`source/server/overload_manager_impl.cc`（28–80、449–550、760–795、936–966）。読んでいないもの：`outlier_detection_impl.cc`、`adaptive_concurrency/controller/gradient_controller.cc`、`source/common/conn_pool/*`、`source/extensions/resource_monitors/*`、`api/envoy/config/overload/v3/overload.proto`（存在のみ確認）。
- pgbouncer：`doc/config.md`（83–225、364–400、665–760、1073–1120）、`doc/usage.md`（25–62）、`src/objects.c`（1895–1960）、`src/janitor.c`（320–365）、`COPYRIGHT`（冒頭）。読んでいないもの：`src/server.c`、`src/client.c`、prepared statementの追跡の実装、peer機能。
- 検索した語：`acquire`、`onDropped`、`partition`、`backlog`、`LIFO`、`probe`、`circuit`、`HALF_OPEN`、`slowCall`、`minimumNumberOfCalls`、`Bulkhead`、`singleflight`、`hotCache`、`populateCache`、`overload`、`shouldShedLoad`、`retry_budget`、`max_ejection_percent`、`pool_mode`、`reserve_pool`、`query_wait_timeout`、`server_reset_query`。GitHub issue検索：concurrency-limitsで「limit」、groupcacheで「singleflight」。
- 選ばなかった候補：golang/sync（`x/sync/singleflight`。groupcacheの版で合流の構造は読めると判断し、読んでいない。両者の差分は確認していない）、Netflix/Hystrix（circuit breakerとbulkheadは、今回はresilience4jで観察することにし、読んでいない）、varnishcache等のHTTP cache（無効化の比較は今回の範囲外にした。§見つからなかったこと）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。envoyの観察（O06・O10・O11）は、docsとheaderに基づく部分と、codeに基づく部分が混在する。設計文書と実装が食い違うときの由来の区別をどう記録するかは未決（README§後続の(a)）。openのissue（#234等）は、上流で修正されると根拠が古くなる。確かめ直す時期は未決（同(d)）。
- scope：同じ語（circuit breaker）が製品によって別の仕組みを指す（O07とO10）。BRAINで語をkeyにするか、仕組み（資源数の上限、結果による遮断、送り先の除外）をkeyにするかは未決。観察の主な領域も未決である。D01（architectureの判断）とD07（infrastructure）のどちらに置くか、またはまたがるものとして扱うか（同(b)）。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。pgbouncerはSPDXが`NOASSERTION`で、`COPYRIGHT`の表記でISCと読んだ（同(e)）。
- 状態：全観察（P17-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
