# P10 API styleと版の方式・rate limit・公開APIの運用の観察（D05 API / Integration）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| aip-dev/google.aip.dev | https://github.com/aip-dev/google.aip.dev | 23e176e7333ea3bc6b085f9950a5da03d2bbfc72 | NOASSERTION（`LICENSE.md`冒頭で本文はCC-BY-4.0、コード例はApache-2.0と表記） | false | 2026-10-04 | URL版（channel／release）、header・query版（日付版）、visibility版を1つの規約群で並べて定義しており、互換性の分類と安定度も同じ場所にある |
| kubernetes/community | https://github.com/kubernetes/community | b0e9e677be6c9b178368d57b86e9f548fcbd575f | Apache-2.0 | false | 2026-10-04 | URL group/version方式で、内部hubを介した変換、field単位のfeature gate、互換規則の実務手順が一次文書として揃っている |
| kubernetes/website（補助） | https://github.com/kubernetes/website | 77db41e9c776b614fdb31de4cc6c8e9a70673817 | CC-BY-4.0 | false | 2026-10-04 | deprecation policyの正本がこのrepoにある（`content/en/docs/reference/deprecation-policy.md`） |
| envoyproxy/ratelimit | https://github.com/envoyproxy/ratelimit | bd88831c6756bc1929a5b54584a027508928899b | Apache-2.0 | false | 2026-10-04 | 中央集約型のrate limit service。descriptorとfixed window counter、shadow mode、protocol版の廃止履歴がある |
| Kong/kong | https://github.com/Kong/kong | 8927af6d5efa3e58a59101943ba61e0c1997e96b | Apache-2.0 | false | 2026-10-04 | gateway pluginとしてのrate limit（local／cluster／redis policy、fault_tolerant）と、設定項目のdeprecation・version skewへの対応がある |
| stripe/openapi | https://github.com/stripe/openapi | 2d691abcb499470ffd7536614b8901348697c8cf | MIT | false | 2026-10-04 | 日付＋release名の版、event・webhookの版固定、changelog配布、v1とv2のpathが1つの公開specに同居する実例 |

## 観察

### P10-O01 URL major版＋安定度channelのin-place更新（channel-based / release-based versioning）
- 出典：aip-dev/google.aip.dev、`aip/general/0185.md` 行15–90・162–192（https://github.com/aip-dev/google.aip.dev/blob/23e176e7333ea3bc6b085f9950a5da03d2bbfc72/aip/general/0185.md#L15-L90 、 #L162-L192）。信頼性ラベル：primary。本文確認：済
- 何をしているか：major版番号をprotobuf package末尾とREST URI pathの先頭に置く。minor／patch番号は外に出さない（L17–28）。major版ごとにalpha／beta／stableのchannelを最大1つずつ持つ。stable以外は版文字列に`v1beta`のように安定度を付ける。各channelはin-placeで更新される（L51–61）。beta⊇stable、alpha⊇betaという包含関係を義務にしている（L63–65）。release-based方式では`v1beta1`のように連番を付けた個別releaseを並べ、非互換な変更は連番を上げて別releaseにする。stableは常に単一channelである（L168–192）。
- 解いている問題と前提：利用者が移行作業なしで新機能を受け取ることと、非互換変更を版の境界に閉じ込めることを両立させる。新旧のmajor版を1つのclientで同時に使える移行期間を設けること（L34–38）、新しいmajor版が旧版に依存しないこと（L30–32）が前提になっている。
- 必要な入力：major版の境界、各channelの安定度、deprecation期間（推奨値の記載はあるが持ち込まない）、要素ごとのdeprecated注釈。
- trade-off・失敗の仕方：「pre-deprecatedのまま昇格してはならない」（L81–83）という規則は、deprecated要素が上位channelへ漏れる失敗を防ぐためのもの。release-basedは新規serviceではあまり使わないと明記されている（L164–166）。
- 反例・適用しない場合：同じ文書のinterface-based方式（O02）は、alpha／betaのchannelをpreview版で置き換える（L133–137）。Stripe（O08）はURLに`/v1/`と`/v2/`を持ちながら、日付版を並行して使う。
- 互換・非互換：O03（major内の互換規則）を前提にする。O05（K8sのgroup/version）と同型。O02とは同じAPIでは択一である。
- 限界：Googleの統一API基盤が前提になっている。HELIXで成立することを意味しない。推奨期間の値は持ち込まない。

### P10-O02 日付形式の版識別子をheaderまたはqueryで送る（interface-based versioning）
- 出典：aip-dev/google.aip.dev、`aip/general/0185.md` 行92–160（https://github.com/aip-dev/google.aip.dev/blob/23e176e7333ea3bc6b085f9950a5da03d2bbfc72/aip/general/0185.md#L92-L160）、`aip/general/0184.md` 行19–125（https://github.com/aip-dev/google.aip.dev/blob/23e176e7333ea3bc6b085f9950a5da03d2bbfc72/aip/general/0184.md#L19-L125）。信頼性ラベル：primary。本文確認：済
- 何をしているか：requestは版識別子を`X-Goog-Api-Version` headerか`$apiVersion` query（どちらか一方）で送る（0184 L96–98）。識別子の形式は`[VARIANT-]YYYY-MM-DD[-DECORATOR]`で、日付は単調増加とし、同じvariant内での重複を禁じる（0184 L23–42）。`preview`・`experimental`のdecoratorで安定度を表し、GA版はdecoratorを持たない（0184 L44–67）。ただし、private GAの版はdecorator付きの識別子を使う例外がある（0184 L52–54、L65–67）。clientは識別子の内部構造を仮定せず、等値比較だけをする（0184 L83–90）。producer側はRPC・field・enum値に「存在する版の範囲」を注釈し、その範囲から「API screen」を作る。screenはproxyでのrequest／responseの整形、文書、Discovery Document、client libraryの生成に使われる（0185 L142–152）。保存表現は版に依存しない単一の形で持つ（0185 L112–114）。
- 解いている問題と前提：versioningの範囲を単一interfaceまで細かくし、consumerが自分の都合で版を上げられるようにする（0185 L94–101）。proxyが要素単位の注釈から応答を整形できる基盤が前提になっている。
- 必要な入力：要素ごとの版範囲の注釈、版を束ねてpublishする単位、previewの期限と告知手順。
- trade-off・失敗の仕方：**版指定が無いrequestの扱いが2文書で食い違っている。** 0185 L121–124は「producerの既定版、consumerのoverride、既定が無い場合のerror」を設定次第としている。0184 L113–114は「400で失敗しなければならない」としている。0184は2026-08-17作成（L133）で、0185より新しい。どちらが優先かは文書内に記述が無い。previewは呼出し時の互換を保とうとするが、upgrade時の互換は与えない（0181 L137–145）。
- 反例・適用しない場合：data plane APIのように特別な制約があるものは別形式を使ってよい（0184 L88–90）。K8s（O05）はURL path版だけで、header版を持たない。
- 互換・非互換：O04（call-time互換とupgrade互換の分離）と組になる。O08（Stripeの日付版）と同系統だが、Stripeは識別子にrelease名を含める。O01とは択一。
- 限界：proxyでの整形基盤が前提になっている。識別子の最大長などの値は持ち込まない。

### P10-O03 互換性を3種類に分け、major内で許す変更を列挙する
- 出典：aip-dev/google.aip.dev、`aip/general/0180.md` 行19–99・152–258・271–286（https://github.com/aip-dev/google.aip.dev/blob/23e176e7333ea3bc6b085f9950a5da03d2bbfc72/aip/general/0180.md#L19-L99 ほか）。信頼性ラベル：primary。本文確認：済
- 何をしているか：互換性をsource・wire・semanticの3種に分ける（L29–41）。major内での追加は許可するが、次の条件を付ける：新しい必須fieldを追加しない、追加fieldの既定動作は追加前と同じにする、serverがこれまで埋めていたfieldは埋め続ける（L56–73）。enum値の追加は、request専用のenumなら自由で、response側では文書化と注意を求める（L74–81）。rename＝removeとaddであり、removeは禁止（L89–99）。fileの移動、oneofへの出し入れ、型変更は生成コードを壊すので禁止（L101–119）。値の形式・既定値・既定値の直列化の仕方を変えることも破壊的変更とする（L163–258）。
- 解いている問題と前提：利用者の言語や更新時期を制御できない公開APIを前提にしている。範囲の狭いAPIは自分で要件を考えるよう注記している（L47–52）。
- 必要な入力：transport形式（protobuf／JSONを前提とする、L43–45）、各fieldの既定値と直列化の規則。
- trade-off・失敗の仕方：判断の余地を認めており、広く読みすぎるとどんな変更もできなくなると明記している（L159–161）。後からpaginationを入れた場合の誤動作（L67–71）、string長の上限を上げたことによる利用者側DBの破損（L273–280）が失敗例として書かれている。
- 反例・適用しない場合：K8s（O07）はenum値の追加を「互換ではない」と分類している（api_changes.md L470–478）。Stripe（O08）はenum値の追加を月次の非破壊changelogに「new value」として載せている（`openapi/upcoming-changes/rest.md` L2・L4・L6）。同じ変更でも分類が分かれる。
- 互換・非互換：O01・O02の前提。O05（round-trip規則）と並ぶ。
- 限界：文書自身が「網羅ではなく指標」（L25–27）と書いている。

### P10-O04 安定度ごとの約束と、deprecation期間を「指定時に決める」規則
- 出典：aip-dev/google.aip.dev、`aip/general/0181.md` 行21–88・95–176（https://github.com/aip-dev/google.aip.dev/blob/23e176e7333ea3bc6b085f9950a5da03d2bbfc72/aip/general/0181.md#L21-L176）。信頼性ラベル：primary。本文確認：済
- 何をしているか：alphaは個別に連絡できる既知の利用者に限り、破壊的変更を前提にする（L23–29）。betaは公開し、破壊的変更は許すが、deprecation期間を**beta指定時に**決めておく（L33–45）。stableの廃止手順もstable指定時に定めることを義務にしている（L65–68）。stableでの局所的な破壊的変更は、新しいmajor版と同等以上の重みで扱う。Googleでは統治チームの承認が要る（L72–81）。セキュリティや規制による緊急変更は安定度に関係なく許され、deprecationは約束しない（L85–88）。interface-based方式では、producerが責任を持つ「call-time互換」と、consumerが責任を持つ「upgrade互換」を分けている（L97–109）。
- 解いている問題と前提：廃止の期限を後から決めると利用者が計画を立てられない。そこで、安定度のラベルを付ける時点で期限の契約を固定する。
- 必要な入力：安定度ごとの期間（推奨値の記載はあるが持ち込まない）、例外を承認する主体。
- trade-off・失敗の仕方：緊急変更の例外条項は「deprecationを約束しない」と書いており、利用者側の保証に穴があることを明示している。
- 反例・適用しない場合：K8s（O07）は期間をrelease数と月数で一律に固定し、指定時に個別に決める方式を取っていない。
- 互換・非互換：O01・O02・O07と組になる。
- 限界：GCPの製品段階とは同一でないと注記している（L16–19）。

### P10-O05 内部hub表現を介した多版変換とround-trip義務（K8s）
- 出典：kubernetes/community、`contributors/devel/sig-architecture/api_changes.md` 行63–148・382–454（https://github.com/kubernetes/community/blob/b0e9e677be6c9b178368d57b86e9f548fcbd575f/contributors/devel/sig-architecture/api_changes.md#L63-L148 、 #L382-L454）。kubernetes/website、`content/en/docs/reference/deprecation-policy.md` 行53–114（https://github.com/kubernetes/website/blob/77db41e9c776b614fdb31de4cc6c8e9a70673817/content/en/docs/reference/deprecation-policy.md#L53-L114）。信頼性ラベル：primary。本文確認：済
- 何をしているか：versioned API同士は直接変換せず、内部表現を中心にした「star」で変換する（api_changes L74–81）。書込みの流れは、受け取った版で既定値を適用し、内部へ変換して検証し、storage版へ変換して保存する。読出しは逆の順で、任意の対応版で返す（L85–102）。互換の6条件を定めている。以前成功した呼出しは成功し続ける、変更を使わない呼出しは同じ挙動、round-tripで情報を失わない、rollbackできる、など（L129–143）。同じ版の中でfield名を変えると、新旧の二重表現がPUTやPATCHで衝突する（L397–454）。policy側でも、要素の削除はgroup版を上げたときに限る（Rule #1）、版間のround-trip（Rule #2）、preferred版とstorage版は新旧両方を扱えるreleaseを出した後でなければ進めない（Rule #4b）と定めている。
- 解いている問題と前提：複数版を同時に提供しつつ、保存されたobjectを壊さずに、upgradeとrollbackを両方可能にする。etcdに保存されたobjectが長く残ることが前提になっている。
- 必要な入力：内部型、各版の型、変換関数と既定値関数、storage版の選択。
- trade-off・失敗の仕方：保存済みの版はdecodeできる状態を保たなければならず、提供を止めても変換能力は残す（policy L98–104）。新しい版を、追加と同じreleaseでpreferred版やstorage版にしてはならない（api_changes L493–495）。
- 反例・適用しない場合：AIP（O02）は保存表現を版非依存の単一形にして、proxyで整形する。Stripe（O08）は内部の変換機構を公開repoに出していない。
- 互換・非互換：O06・O07と組になる。O03と互換規則が一部重なる。
- 限界：etcdと宣言的なcontrol plane固有の前提がある。release間隔などの値は持ち込まない。

### P10-O06 既存の安定版へfeature gate付きのalpha fieldを入れる（field単位の版）
- 出典：kubernetes/community、`api_changes.md` 行1169–1291（https://github.com/kubernetes/community/blob/b0e9e677be6c9b178368d57b86e9f548fcbd575f/contributors/devel/sig-architecture/api_changes.md#L1169-L1291）。反例の根拠としてkubernetes/kubernetes issue #30819（https://github.com/kubernetes/kubernetes/issues/30819 、closed、本文確認済）。信頼性ラベル：primary。本文確認：済
- 何をしているか：安定版に未成熟なfieldを無条件には追加しない（L1171–1173）。代わりに、API serverへfeature gateを追加し、fieldをoptional・`omitempty`・`+featureGate=`タグ付きにする（L1225–1262）。gateがoffのとき、createでは値を消す。updateでは既存objectに値が無い場合に限って消す。これにより、新規利用を防ぎつつ既存データを守る。保存先はstrategyの`PrepareForCreate`/`PrepareForUpdate`である（L1266–1291）。
- 解いている問題と前提：利用されて初めて安定度を確かめられる機能を、新しいAPI版を作らずに出したい。updateで消さないのは、次のreleaseで既定onになったとき、一つ前のserverがupdateでデータを落とさないようにするため（L1269–1271）。
- 必要な入力：gate名、gateの段階、fieldの説明にalphaであることを書くこと。
- trade-off・失敗の仕方：以前のannotation方式を捨てた理由は#30819に書かれている。具体的には、発見できない、文書に出ない、導入前に仕込まれた危険な値がupgrade時に発火する「time-bomb」（init containerの実例）、同じ版の中でfieldへ移行できないこと（L1218–1221）。
- 反例・適用しない場合：AIP（O02）のvisibility labelは、gateではなく許可リストで要素を見せる（0185 L196–248）。Stripe（O08）は`/preview/`という別のspecに分けて配る。
- 互換・非互換：O05を前提にする。O02の要素単位の版注釈と目的が近い。
- 限界：単一のcontrol planeが前提である。gateの段階や既定値の扱いは持ち込まない。

### P10-O07 安定度trackごとの廃止寿命と、廃止APIの実行時シグナル（Warning header・監査注釈・metric）
- 出典：kubernetes/website、`content/en/docs/reference/deprecation-policy.md` 行23–114・279–318・495–504（https://github.com/kubernetes/website/blob/77db41e9c776b614fdb31de4cc6c8e9a70673817/content/en/docs/reference/deprecation-policy.md#L23-L114 、 #L279-L318）。kubernetes/community、`api_changes.md` 行456–538（https://github.com/kubernetes/community/blob/b0e9e677be6c9b178368d57b86e9f548fcbd575f/contributors/devel/sig-architecture/api_changes.md#L456-L538）。信頼性ラベル：primary。本文確認：済
- 何をしているか：GA・beta・alphaのtrackごとに寿命の規則を置く。版を、より不安定なtrackの版で置き換えることは禁止（Rule #3、L77–81）。寿命はrelease数と月数で定める（Rule #4a、L83–92。値は持ち込まない）。廃止されたendpointへのrequestには、`Warning` headerを返し、audit eventに`k8s.io/deprecated`注釈を付け、削除予定releaseのlabel付きでgauge metricを立てる（L290–304）。非互換変更は事前にmailing listで告知し、PRに`release-note-action-required` labelを付けてrelease noteへ載せる。誤って壊した場合はrevertする（api_changes L518–524）。
- 解いている問題と前提：利用者のupgradeとrollback、および版のskew範囲をbetaの寿命で覆う（L90–92）。betaが放置されて本番利用が溜まることを防ぐ。
- 必要な入力：各track別の寿命、削除予定release、告知の経路。
- trade-off・失敗の仕方：既存の版を壊す変更を原則禁止とする根拠は、各Rule（Rule #1 L53、Rule #2 L66、Rule #3 L77、Rule #4a L83）と、例外条項の中の「可能な限りnever breaks users」という表明（L502–503）である。例外条項（L495–504）そのものは、policyに収まらない場合をSIG等と議論し、例外は全てrelease noteで告知すると定める。enum値の追加は互換ではないとし、将来値を足す予定のenumは最初のreleaseで「未知値の扱い」を文書化させる（api_changes L470–478）。
- 反例・適用しない場合：AIP（O04）は期間を指定時に決める方式。envoy ratelimit（O10）は自分のprotocolの廃止をREADMEの箇条書きの履歴だけで扱っている。
- 互換・非互換：O05・O06と組になる。O12（Kongのremoval_in_version）とは、「削除予定版を機械可読に持つ」という点が共通する。
- 限界：一定のrelease周期を持つ単一製品が前提である。

### P10-O08 日付＋release名の版、生成時の版でpayloadを固定、月次changelogの配布（Stripe）
- 出典：stripe/openapi、`latest/openapi.spec3.yaml` 行2–14（`info.version`と`x-stripeReleasePhase`、https://github.com/stripe/openapi/blob/2d691abcb499470ffd7536614b8901348697c8cf/latest/openapi.spec3.yaml#L2-L14）、行29242–29249（`/v1/events`の説明）、行186265–186269（`webhook_endpoint.api_version`）。`openapi/upcoming-changes/README.md` 行1–4、`openapi/upcoming-changes/rest.md` 行1–7。`README.md` 行7–31・37–40。releases v2538–v2540の本文（gh apiで本文を確認）。信頼性ラベル：primary。本文確認：済
- 何をしているか：spec自身の`info.version`が「日付.release名」の形をしており、同じ場所にrelease phaseとaudienceの拡張fieldを持つ。eventは**生成時のAPI版で描画され**、現在の版や`Stripe-Version` headerには従わない（L29245–29249）。webhook endpointの`api_version`は作成後に変更できない（L186267–186268）。upcoming-changes/README（L1）は、月次で非破壊の版を出し、年に2回、破壊的変更を含む版から始まる新releaseを出す運用を述べている。言語別のupcoming-changesファイルに、次の月次releaseのchangelog項目（field追加、enum新値の追加）を置く（rest.md L1–7）。配布するspecは、GA（`/latest/`）、preview（`/preview/`）、legacyのv1のみ（`/openapi/`、引き続き毎release更新）に分かれる。public spec（`spec3`）とSDK用spec（`spec3.sdk`、deprecated endpointやpre-releaseを含む）も分けている（README L9–40）。同じspecの中に`/v1/`と`/v2/`のpathが並存している。
- 解いている問題と前提：利用者のaccountやendpointごとに版を固定し、非同期の通知（webhook）のpayload形を受信側の版に合わせ続ける。specは公開されていない生成器で作られる（README L116–118）。
- 必要な入力：版を固定する主体（webhook endpointなど）、release名と日付、release phase。
- trade-off・失敗の仕方：events一覧が返すデータは生成時の版の形であり、呼出し側の版とずれ得ることをAPI説明文に明記している。版ごとの変換実装はこのrepoに無く、観察できない。
- 反例・適用しない場合：AIP（O02）は識別子を「意味的に不透明な等値比較だけの文字列」とする（0184 L83–87）。Stripeは名前のsuffixにrelease系列の意味を持たせている（README上の運用説明から読める範囲に限る）。K8sは版をURLに置き、payload形はrequestした版で決まる（O05）。
- 互換・非互換：O02（日付版）と同系統。O03とはenum追加の扱いが異なる。O01（URLのmajor版）と併存する例でもある。
- 限界：Stripeの公開repoは生成物だけである。版の変換やpinningの実装は確認できない。周期や件数は持ち込まない。

### P10-O09 descriptor＋固定窓で作るcounter keyと、近接・超過の判定（envoy ratelimit）
- 出典：envoyproxy/ratelimit、`src/limiter/cache_key.go` 行15–100（https://github.com/envoyproxy/ratelimit/blob/bd88831c6756bc1929a5b54584a027508928899b/src/limiter/cache_key.go#L15-L100）、`src/limiter/base_limiter.go` 行59–168、`src/redis/fixed_cache_impl.go` 行65–242、`README.md` 行262–335・1294–1298。issue #185（https://github.com/envoyproxy/ratelimit/issues/185）、#269（https://github.com/envoyproxy/ratelimit/issues/269）は本文とコメントを確認済。信頼性ラベル：primary。本文確認：済
- 何をしているか：`CacheKeyGenerator.GenerateCacheKey`は、prefix＋domain＋descriptorの各entry（key_value）＋窓の開始時刻からkeyを作る（L66–94）。`share_threshold`があればwildcard patternでentryの値を置き換え、counterを共有する（L73–80）。`BaseRateLimiter.GenerateCacheKeys`は、limitの無いdescriptorには空keyを返して配列の長さを揃える（L68–70）。Redis実装の`DoLimit`は次の順で処理する。(1)local cacheに「超過済みkey」があればRedisへ行かない。(2)`stopCacheKeyIncrementWhenOverlimit`が有効なら、事前にGETして近接・超過を調べる。(3)pipelineでincrementとTTL（jitter付き）を送る。(4)increment後の値から`GetResponseDescriptorStatus`がOK／OVER_LIMITとlimit残量を決める（L117–241）。超過になったkeyは、窓の長さをTTLにしてlocal cacheへ入れる（base_limiter L136–148）。負のhitは、下限を床で止めたLuaスクリプトでcounterを戻し、常にOKを返す（L18–27、L176–190）。設定はYAMLのdomain／descriptor木で、`replaces`で他のruleの評価を外せる（README L270–334）。
- 解いている問題と前提：多数のEnvoyから共有counterへ問い合わせる中央service。実装上の方式は固定窓である（#269のmaintainer回答では、sliding window PRは放置されてcloseされた）。
- 必要な入力：domain、descriptorの構成、単位ごとのlimit、backend（Redis／Memcached）、local cacheの容量。
- trade-off・失敗の仕方：#185では、拒否された呼出しもcounterを増やすため、途中でlimitを引き上げても同じ窓の中では回復しないことが報告された。maintainerは、CASなどの追加状態が無いと解決が難しいと回答している。`getHitsAddendValue`（fixed_cache_impl L65–93）はこの問題への設定可能な緩和策として読める。ただし#185との直接の関連付けはコード上に無い。月単位を固定日数で数えると暦とずれるため、opt-inで暦月に切り替える（README L1425–1436）。
- 反例・適用しない場合：Kong（O11）はincrementの前にusageを読み、超過を判定する。
- 互換・非互換：O10（応答の合成）と一体。O11と同じ問題を別のやり方で解いている。
- 限界：比率、TTL、jitterの既定値は持ち込まない。

### P10-O10 rate limit判定の合成：shadow mode、quota group、error伝播、応答header、protocol版の廃止履歴（envoy ratelimit）
- 出典：envoyproxy/ratelimit、`src/service/ratelimit.go` 行206–402・572–663（https://github.com/envoyproxy/ratelimit/blob/bd88831c6756bc1929a5b54584a027508928899b/src/service/ratelimit.go#L206-L402）、`src/limiter/base_limiter.go` 行159–165、`README.md` 行124–137・336–344・798–808・998–1010。信頼性ラベル：primary。本文確認：済
- 何をしているか：`shouldRateLimitWorker`は、descriptorごとの状態からOverallCodeを合成する。通常のdescriptorは1つでも超過すれば全体がOVER_LIMITになる。quota modeのdescriptorはbackendとmodelの組でgroupにまとめる。group内はOR、group間はAND（全groupが超過したときだけOVER_LIMIT）で、別modelへのfailoverを残す（L233–308）。残量が最も小さいdescriptorから`RateLimit-*`系のheaderを作り、単位別の`RateLimit-Limit-<Unit>`も作る（L310–329、L360–402）。ruleごとのshadow modeは、判定と統計はそのまま行い、結果だけをOKに変える（base_limiter L159–165）。全体のshadow modeは最終codeを上書きして統計を数える（L331–335、README L998–1010）。Redisのerrorやservice errorは、panicをrecoverしてgRPCのerrorとして呼出し側へ返す（L634–657）。fail-openかfail-closedかは、このservice内では決めていない。初期設定が無い状態で起動するかどうかもflagで選ぶ（README L807–808）。READMEは、旧独自protoから`v2 rls.proto`、`v3 rls.proto`への移行を、tagとcommitを付けた箇条書きの履歴として残している（L129–137）。
- 解いている問題と前提：既存のservice群へrate limitを段階的に導入する（shadow）。複数backendへのfailoverを判断する材料（dynamic metadata）を返す。最終的な拒否は呼出し側のproxyが行う。
- 必要な入力：shadowの範囲、quota groupを決めるdescriptorのentry、header名の設定。
- trade-off・失敗の仕方：error時にどう振る舞うかが呼出し側に委ねられているため、閉じるか開くかの方針はこのservice単体では決まらない。protocol版の廃止履歴は告知期間を持たない記録である。
- 反例・適用しない場合：Kong（O11）は`fault_tolerant`でfail-openかどうかをplugin自身が決める。
- 互換・非互換：O09と一体。O07（廃止の実行時シグナル）とは、廃止の通知方法が対照的。
- 限界：Envoyとの連携が前提である。

### P10-O11 gateway pluginのrate limit：usageを先に読み、後でincrementする／policyの切替／fault_tolerant（Kong）
- 出典：Kong/kong、`kong/plugins/rate-limiting/handler.lua` 行28–217（https://github.com/Kong/kong/blob/8927af6d5efa3e58a59101943ba61e0c1997e96b/kong/plugins/rate-limiting/handler.lua#L28-L217）、`schema.lua` 行7–98・198–220、`policies/init.lua` 行177–299・301–440。信頼性ラベル：primary。本文確認：済
- 何をしているか：`get_identifier`がservice、consumer、credential、header、pathのいずれかから集計の主体を決め、決まらなければforwarded IPを使う（handler L60–86）。`get_usage`は、second〜yearの各期間についてpolicyの`usage`で現在値を読み、残量が0以下ならその期間を`stop`にする（L89–114）。access phaseでは、`X-RateLimit-*-<Period>`と`RateLimit-Limit/Remaining/Reset`を記録し、超過時は`Retry-After`を付けて`error_code`で応答する（L152–206）。incrementは、policyが`redis`で`sync_rate`が実時間でない場合は同期呼出しで行い（handler L208–209）、それ以外はtimerで非同期に行う（L211–215）。policyは`local`（共有メモリのincr）、`cluster`（DB）、`redis`の3種類（DBless構成（`database=off`）または`role=control_plane`ではclusterを選べない、schema L39–70、条件はL45）。redisのusageは、local cacheに値が無いとき（実時間の場合は常に）Luaのincrを行い、読取りと加算を1回で済ませる（policies L387–435、Lua部分はL406–415）。実時間の場合、incrementはusageで加算済みとして何もしない（L370–372）。実時間でない場合、usageでincrした分はlocal deltaを-1にして補正し（L430–435）、cacheの有効期間中はlocalの値を返す（L387–390）。incrementではlocal deltaを溜め、一定間隔でpipeline同期する（L177–299、L374–377）。schemaは期間の上下関係を検証する（長い期間のlimitが短い期間より小さいと拒否、L10–23）。
- 解いている問題と前提：gatewayの各nodeで低遅延に判定する。中央storeへの依存度をpolicyで選ぶ。
- 必要な入力：期間ごとのlimit、集計の主体、policy、store障害時の方針。
- trade-off・失敗の仕方：`fault_tolerant`がtrueなら、storeの障害時にrate limitを実質無効にして通す。falseならclientに500を返す（schemaのdescriptionに明記、L93）。local／clusterでは読取りと非同期incrementが分かれており、同時requestでの超過許容がコードの構造から読める（直接の記述は確認できず）。redisの同期失敗時はlocal counterをclearして捨てる（policies L182–186、L203–206）。同期timerがblockされる異常は`emerg`ログで知らせる（L263–266）。
- 反例・適用しない場合：envoy ratelimit（O09）は、先にincrementしてから判定し、超過keyをlocal cacheに入れる。
- 互換・非互換：O09と同じ問題を別の順序で解いている。O12（同じpluginの設定の版管理）と同じファイル内にある。
- 限界：期間の種類、同期間隔の下限、既定の応答codeとmessageは持ち込まない。

### P10-O12 設定fieldのdeprecationを機械可読に持ち、旧版のnodeへは逆変換して配る（Kong）
- 出典：Kong/kong、`kong/plugins/rate-limiting/schema.lua` 行101–194（https://github.com/Kong/kong/blob/8927af6d5efa3e58a59101943ba61e0c1997e96b/kong/plugins/rate-limiting/schema.lua#L101-L194）、`kong/plugins/rate-limiting/clustering/compat/redis_translation.lua` 行1–23、`kong/clustering/compat/checkers.lua` 行15–21・224–247、`kong/clustering/compat/removed_fields.lua` 行1–36。信頼性ラベル：primary。本文確認：済
- 何をしているか：旧形式の平坦なfield（`redis_host`など）を`shorthand_fields`として残す。各項目に`deprecation = { replaced_with, message, removal_in_version }`を持たせ、`func`で新しい入れ子形式（`redis.host`）へ写像する（schema L101–194。「Kong 4.0で削除予定」とTODOで明記）。逆方向として、control planeが古いdata planeへ設定を配るとき、版の閾値ごとのchecker（3.6.0未満向け）が`redis_translation.adapter`で新形式を旧形式へ戻す（checkers L224–247）。戻したときは「incompatible with dataplane version … and will revert to older schema」という警告を出す（L15–21）。版ごとの`removed_fields`表で、旧data planeが知らないfieldを除去する（removed_fields L1–36）。
- 解いている問題と前提：control planeとdata planeの版skewを許しつつ、設定schemaを進化させる。新形式を正本にし、旧形式は入力側の互換と出力側の逆変換で吸収する。
- 必要な入力：fieldごとの置換先と削除予定版、data planeの版ごとの除去・変換表。
- trade-off・失敗の仕方：逆変換では情報が落ちることがある（removed_fieldsでの除去）。それは警告ログでしか伝わらない。
- 反例・適用しない場合：K8s（O05）はserver側で全版間をround-tripさせ、情報を落とさないことを義務にしている。Stripe（O08）は受信側の版でpayloadを描画する。
- 互換・非互換：O05（双方向の変換）・O08（受信側の版に合わせる）と目的が近いが、Kongは情報の欠落を許している点が異なる。O07の「削除予定版を明示する」と共通する。
- 限界：版番号の閾値は持ち込まない。schema基盤側で`deprecation`をどう処理するか（警告の出し方）は読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 版をどこで指定するか | AIP：URL major＋channel（O01）、またはheader・queryの日付版（O02） | K8s：URLのgroup/version（O05）。Stripe：URLの`/v1`・`/v2`と日付＋release名の版の併用、webhookはendpoint作成時に固定（O08） | proxyでの要素単位の整形基盤があるか。保存objectが版をまたいで残るか。非同期のpayloadがあるか |
| 多版をどう実装するか | K8s：内部hubを介したstar変換とround-trip義務（O05） | AIP IBV：版非依存の保存形と要素の版範囲注釈でproxyが整形（O02）。Kong：新形式を正本にして、旧node向けに逆変換・除去（O12） | 情報欠落を許すか。変換をserver内とproxyのどちらに置くか |
| enum値の追加は互換か | AIP：requestでは自由、responseは注意して可（O03） | K8s：互換ではない（O07）。Stripe：月次の非破壊changelogに「new value」として載せる（O08） | clientが全値を網羅して扱う前提か、未知値を許す前提か |
| 未成熟な機能を安定版でどう出すか | K8s：feature gate付きoptional field（O06） | AIP：preview版・visibility label（O02、0185 L196–248）。Stripe：`/preview/` specを分けて配る（O08） | 単一のcontrol planeか、公開SaaSか |
| deprecation期間をいつ決めるか | AIP：安定度を指定した時点で決める（O04） | K8s：trackごとにrelease数と月数で一律（O07）。Kong：fieldごとに`removal_in_version`（O12）。envoy ratelimit：履歴の記録のみ（O10） | 定期releaseがあるか。利用者を個別に把握しているか |
| 廃止を利用者へどう知らせるか | K8s：Warning header、audit注釈、metric、release note（O07） | Stripe：GitHub releaseとupcoming-changesのchangelog（O08）。Kong：警告ログ（O12） | 呼出し時に通知できるか、配布物で通知するか |
| counterの更新順序 | envoy ratelimit：increment後に判定、超過keyはlocal cacheで遮断（O09） | Kong：usageを読んでから判定し、incrementは原則非同期（redisの非実時間では同期呼出しでlocal deltaを溜め、redisはlocal cacheが無いときusageの時点でincrする。実時間ならusage時のincrが原子的な読取りと加算になる、O11） | 中央serviceか、gatewayの各nodeか。遅延と正確さのどちらを優先するか |
| storeが障害を起こしたとき | envoy ratelimit：errorを呼出し側へ返し、判断を委ねる（O10） | Kong：`fault_tolerant`でfail-openかどうかをplugin設定で決める（O11） | 拒否の主体が別のproxyか、plugin自身か |
| 導入時の安全策 | envoy ratelimit：ruleごと・全体のshadow mode（O10） | Kong：該当機構は観察範囲に無い | 既存のservice群へ段階的に導入する前提か |

## 見つからなかったこと・gap
- Stripeの版変換やpinningの実装は公開repoに無く、観察できない（specは公開されていない生成器で作られる）。日付版の「request→内部→応答」の変換構造は、AIP（O02）の規約文でしか確認していない。
- AIP-184とAIP-185の間で、版指定が無いrequestの扱いが食い違っている（O02）。どちらが優先かの根拠は見つからなかった。
- token bucketやsliding windowの実装は、今回のrepoでは観察していない（envoy ratelimitは固定窓。#269によればsliding window PRはcloseされた）。
- K8sの`Warning` header出力の実装（kubernetes/kubernetes本体のコード）は読んでいない。観察は文書の範囲に限る。
- Kongの`deprecation`処理（schema基盤側）と、local／clusterでの超過許容を明示する記述は確認していない。
- grpc-gatewayとenvoy本体のlocal rate limitは対象外にした。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- aip：`aip/general/0180.md`（全文）、`0181.md`（全文）、`0184.md`（全文）、`0185.md`（全文）、`LICENSE.md`冒頭。`0182.md`は見出しのみ。それ以外のAIPは読んでいない。
- kubernetes/community：`contributors/devel/sig-architecture/api_changes.md` 行63–180・382–540・1087–1300。それ以外の範囲（declarative validation、code生成など）は読んでいない。
- kubernetes/website：`content/en/docs/reference/deprecation-policy.md` 行23–125・279–324・495–504（見出しは全体を確認）。CLI、feature gate、metricのdeprecationの節は読んでいない。
- kubernetes/kubernetes：issue #30819の本文（コメントは未読）。
- envoyproxy/ratelimit：`README.md`の該当節、`src/limiter/cache_key.go`（全文）、`src/limiter/base_limiter.go` 行18–200、`src/redis/fixed_cache_impl.go` 行61–245、`src/service/ratelimit.go` 行206–410・572–663、`src/settings/settings.go`（grepのみ）。Memcached実装、xDS provider、`config_impl.go`は読んでいない。issue検索は「month」「redis error」など。#185、#269は本文とコメントを読んだ。
- Kong/kong：`kong/plugins/rate-limiting/`の`handler.lua`・`schema.lua`（全文）、`policies/init.lua` 行168–441、`clustering/compat/redis_translation.lua`、`kong/clustering/compat/checkers.lua` 行1–40・215–260、`removed_fields.lua` 行1–40。`policies/cluster.lua`、migrations、`daos.lua`、`kong/db/schema`は読んでいない。issue検索（「rate-limiting race condition」「rate limiting accuracy」）は0件だった。
- stripe/openapi：`README.md`、`latest/README.md`、`openapi/README.md`、`openapi/upcoming-changes/README.md`・`rest.md`・`python.md`、`latest/openapi.spec3.yaml`（info、`/v1/events`の説明、`webhook_endpoint`、`/v2/`のpathをgrepで抽出し一部を読んだ）。releases v2538–v2540の本文。fixturesとSDK specは読んでいない。
- 外部repositoryのコード、script、test、build、hookは一切実行していない（clone・checkout・読取り・grepのみ）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：規約文書（AIP、K8s policy）、実装コード（ratelimit、Kong）、生成物と運用説明（Stripe）が混在している。BRAIN上で区別する属性値がまだ決まっていない。
- scope：「公開API（不特定consumer）」前提のもの（AIP-180 L47–52が明示）と、「内部やgateway設定」前提のもの（Kong O12）を、同じパターン名で扱うかどうかが未決。
- 評価根拠：全観察が未評価の候補素材である。外部repoで採用されていることをHELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路）。
- 版：観察は固定commitに紐づく。AIPは本文中にChangelogを持ち（0180 L288–299）、0184は新しく作成されたもの。素材の版を固定commitで持つか、文書内の版で持つかが未決。
- 状態：すべて「未評価」。AIP-184と185の食い違いのように、出典内部で矛盾している素材の状態表現が未決。
