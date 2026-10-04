# P31 Backendの時間に依存する処理の観察（瞬間・暦日・壁時計、timezone、tz database、clock）（D03 Backend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、timeout、日付、期間、offsetの量、容量等）は持ち込まない。既定の挙動（非数値。例：どの解決方針が既定か）は書くが、数値の既定値は書かない。技術選定・採用推奨ではない。

P08（background job・batch・並行制御）はschedulerのmisfireとleaderのleaseで時刻を扱った。本書はD03 §gap「時間に依存する処理（timezone、締め、期限、clockのずれ）」のうち、値の型の区別、timezoneと夏時間による欠落・重複時刻の解決、tz databaseの更新、testでの時計の差し替え、単調時計と壁時計の使い分けを扱う。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| tc39/proposal-temporal | https://github.com/tc39/proposal-temporal | e8cc03fc970a65a3359e8870e3b35e687ac94e55（default branch: main） | NOASSERTION（LICENSE冒頭：「Copyright (c) 2017, 2018, 2019, 2020 Ecma International. All rights reserved.」「made available under the "BSD License"」） | false | 2026-10-05 | ECMAScriptの日時APIの提案。型を「瞬間」「壁時計」「zone付き」に分け、曖昧・欠落時刻の解決をoptionとして持つ。説明文書（docs）とreference polyfillの両方を同じrepositoryで読める |
| nodatime/nodatime | https://github.com/nodatime/nodatime | 4dd26f1ddfa71e14418ebd279258d0bb5c087d34（main） | Apache-2.0 | false | 2026-10-05 | .NETの日時library。壁時計→瞬間の対応を0／1／2件の分類として返し、解決方針を関数の合成で表す。`IClock`と`FakeClock`でclock injectionを型として持ち、tz dataを版付きの資源として同梱する |
| eggert/tz | https://github.com/eggert/tz | 83f40cf091e90137edf09a23367dd040d156c97a（main） | NOASSERTION（LICENSE冒頭：「Unless specified below, all files in the tz code and data (including this LICENSE file) are in the public domain.」。一部のfileはBSD 3-clause） | false | 2026-10-05 | tz database（tzdb）の開発repository。名前の安定性、改名時のlink、将来予測の不確かさ、更新の伝播について、data提供側の設計文書を読める |
| golang/go | https://github.com/golang/go | 6f5c275ebdc454197fff5f1496521c8f81e20eef（master） | BSD-3-Clause | false | 2026-10-05 | 1つの`Time`値に壁時計と単調時計の両方の読みを持たせる設計と、tz dataの探索順・埋込みfallbackを、package文書とコードで読める。testの偽の時計（`testing/synctest`）もある |
| moment/luxon | https://github.com/moment/luxon | f427515a38f6a671f8de663e6bcc040ed81f114e（master） | MIT | false | 2026-10-05 | JavaScriptの日時library。重複時刻の解決を「未定義」と明記し、欠落時刻は前へ送る。現在時刻の取得をprocess全体の設定（`Settings.now`）で差し替える。他repoとの対照になる |
| google/guava | https://github.com/google/guava | 74fb73b20e17e1b3fa072d7754af493217f86781（master） | Apache-2.0 | false | 2026-10-05 | 経過時間専用の時刻源`Ticker`と、testで差し替える`FakeTicker`。壁時計用の`IClock`系との対照になる |

（golang/goとgoogle/guavaはsparse checkoutで、`src/time`、`src/testing/synctest`、`guava/src/com/google/common/base`、`guava-testlib/src/com/google/common/testing`だけを取得した。）

## 観察

### P31-O01 時刻の値を「瞬間」「壁時計（暦日・時刻）」「zone付き」の型に分ける
- 出典：
  - proposal-temporal、`docs/README.md` 行15–23（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/README.md#L15-L23）、行33–34（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/README.md#L33-L34）
  - proposal-temporal、`docs/timezone.md` 行8–35（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L8-L35）、行52–60（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L52-L60）
  - nodatime、`src/NodaTime/ZonedClock.cs` 行10–56（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/ZonedClock.cs#L10-L56）
  - golang/go、`src/time/time.go` 行99–124（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L99-L124）
  - luxon、`docs/zones.md` 行35–46（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/zones.md#L35-L46）
  - 信頼性ラベル：primary（公式source repositoryの文書・コード）。本文確認：済
- 何をしているか：
  - Temporalは、zoneを持たない型（`PlainDate`、`PlainTime`、`PlainDateTime`等。名前を`Plain`で始める）、瞬間だけを持つ`Instant`、瞬間とzoneとcalendarを持つ`ZonedDateTime`を別のclassにする。READMEは、型を分けることで、実際には不明な値に0、UTC、localのzoneを誤って仮定するbugを防ぐと書く（行23）。`timezone.md`は「timestamp」という語をDBごとに意味が違うため避けると書き、DBの`TIMESTAMP`型が製品ごとに瞬間・local時刻の秒数・時刻と無関係な単調値と意味が分かれる例を挙げる（行32–35）。
  - Noda Timeの`ZonedClock`は、`IClock`（瞬間を返す）にzoneとcalendarを添えて、瞬間（`GetCurrentInstant`）とzone付きの値（`GetCurrentZonedDateTime`）を別のmethodで返す。
  - Goは型を分けない。`Time`は瞬間を表し、`Location`は解釈のためのzoneで、`In`／`Local`／`UTC`で付け替えても瞬間は変わらない（行117–120）。直列化（`MarshalJSON`等）はoffsetを保存するがlocation名を保存しないため、夏時間の情報を失うと書く（行122–124）。
  - Luxonの`DateTime`も、瞬間とzoneの組を1つの型で持つ。文書はzoneを「社会的なmetadata」と呼び、zoneが書式と計算（`plus`、`startOf`）の夏時間の扱いに影響すると書く（行39–44）。offsetだけを変えることは原則として扱わず、zoneを変える（行46）。
- 解いている問題と前提：同じ「日時」の表記が、世界共通の瞬間を指すのか、ある土地の壁時計の読みを指すのか、日付だけなのかが値から分からないと、変換時に暗黙のzoneが入る。前提は、壁時計とUTCの対応が地域の当局の決定で変わることである（`timezone.md` 行12–13）。
- 必要な入力：各値が瞬間か、壁時計の読みか、暦日か、の区別。壁時計の読みを瞬間へ変えるときのzone。
- trade-off・失敗の仕方：型を分けると、変換のたびにzoneと解決方針（P31-O03）を明示する手間が増える。Go・Luxonのように1つの型にすると変換は簡単だが、直列化でzone名が落ちる（Go 行122–124）など、型から読み取れない情報の欠落が起きる。
- 反例・適用しない場合：Temporal `timezone.md`の例は、瞬間型から壁時計型へ変換するとoffsetが失われ、戻すと元と違う瞬間になりうることを示している（行178–186、https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L178-L186）。型を分けても、変換の往復で情報が失われる箇所は残る。
- 互換・非互換：P31-O02（壁時計→瞬間の変換）、P31-O06（保存形式）の前提になる。P31-O10（単調時計）は、Goでは同じ`Time`型の中に置かれる。
- 限界：型の名前と数はrepository固有である。HELIXの値の型を定めるものではない。

### P31-O02 壁時計→瞬間の変換結果を「一意」「重複（曖昧）」「欠落（存在しない）」に分類して返す
- 出典：
  - nodatime、`src/NodaTime/TimeZones/ZoneLocalMapping.cs` 行14–49（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/ZoneLocalMapping.cs#L14-L49）
  - nodatime、`src/NodaTime/TimeZones/Resolvers.cs` 行150–162（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/Resolvers.cs#L150-L162）
  - proposal-temporal、`docs/timezone.md` 行124–141（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L124-L141）
  - proposal-temporal、`polyfill/lib/ecmascript.mjs` 行1870–1922（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/polyfill/lib/ecmascript.mjs#L1870-L1922）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Noda Timeの`DateTimeZone.MapLocal`は`ZoneLocalMapping`を返す。docは結果を、一意（1回だけ起きる）、曖昧（offsetの変化で2回起きる）、不可能（offsetの変化で起きない）の3種に分ける。`CreateMappingResolver`が返す関数は、件数（`Count`）が0なら欠落用の解決関数に、1ならその値に、2なら重複用の解決関数に振り分け、それ以外は「起きないはず」として例外にする。欠落用の関数には、欠落の前後のzone区間（`EarlyInterval`、`LateInterval`）が渡される。
  - Temporalの文書は、offsetが後ろへ戻ると同じ壁時計が繰り返され、前へ進むと壁時計が飛ばされると説明し、どちらも2つのoffsetのどちらかを選ぶか例外にするかの判断が要ると書く（行141）。polyfillの`DisambiguatePossibleEpochNanoseconds`は、候補の瞬間の配列（`GetPossibleEpochNanoseconds`の結果）の長さで分岐する。1件ならそれを返し、2件以上なら方針に従って先頭か末尾を返す。0件（欠落）の場合は、前後のoffsetの差を求め、壁時計をその差だけずらしてから再び候補を求める。
- 解いている問題と前提：壁時計→瞬間の対応は、zoneのoffsetが変わる前後で1対1にならない（`timezone.md` 行126）。瞬間→壁時計は常に1対1である（同 行39）。
- 必要な入力：zoneの規則（tz data。P31-O07・O08）、変換する壁時計の値、0件・2件の場合の方針（P31-O03）。
- trade-off・失敗の仕方：分類を呼出し側に見せると、呼出し側が3つの場合を扱う必要がある。Noda Timeは、分類そのもの（`MapLocal`）と、方針を合成した変換（P31-O03）の両方を公開している。
- 反例・適用しない場合：Luxonは分類を持たない。重複かどうかを判定せず、欠落の場合だけ`wasHole`という印を残す（P31-O04）。Goの`time.Date`も、どちらの瞬間を返すかを保証しない（P31-O04）。
- 互換・非互換：P31-O03（方針の選択）、P31-O05（日の始まり）はこの分類を使う。P31-O04とは、分類を持つか持たないかで対立する。
- 限界：polyfillはreference実装であり、規範は仕様本文（`spec/`）である。本書は仕様本文を読んでいない。

### P31-O03 欠落・重複の解決方針を、呼出し側が選ぶoptionまたは関数の合成として持つ
- 出典：
  - proposal-temporal、`docs/timezone.md` 行190–204（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L190-L204）、行210–226（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L210-L226）、行253–257（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L253-L257）
  - nodatime、`src/NodaTime/TimeZones/Resolvers.cs` 行27–46（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/Resolvers.cs#L27-L46）、行48–106（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/Resolvers.cs#L48-L106）、行108–136（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/Resolvers.cs#L108-L136）
  - issue：nodatime/nodatime#295（https://github.com/nodatime/nodatime/issues/295）、PR #365（https://github.com/nodatime/nodatime/pull/365、merge済み）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Temporalは、瞬間でない値から瞬間型を作るmethodに`disambiguation` optionを持たせる。値は`'compatible'`（既定）、`'earlier'`、`'later'`、`'reject'`で、`'reject'`は`RangeError`を投げる。`'compatible'`は、重複では`'earlier'`、欠落では`'later'`と同じ結果になり、文書は旧来の`Date`、moment.js、Luxon、date-fns、RFC 5545（iCalendar）と同じ挙動だと書く（行197–198）。option を持つmethodは3つが列挙されている（行200–204）。
  - Noda Timeは、重複用（`AmbiguousTimeResolver`：`ReturnEarlier`、`ReturnLater`、`ThrowWhenAmbiguous`）と欠落用（`SkippedTimeResolver`：`ReturnEndOfIntervalBefore`、`ReturnStartOfIntervalAfter`、`ReturnForwardShifted`、`ThrowWhenSkipped`）を別の関数型にし、`CreateMappingResolver`で組み合わせる。既製の組合せとして、どちらでも例外にする`StrictResolver`と、例外にしない`LenientResolver`（重複は早い方、欠落は欠落の幅だけ前へ送る）を持つ。
  - `LenientResolver`のdocは、version 2.0で、実際によく見られる使い方に合わせて組合せを変えたと書く（行129–131）。#295は、毎日同じ壁時計に動くjobの例を挙げ、欠落時に区間の始まりへ寄せると欠落の幅と違う量だけずれること、重複時に後の方を待つと最初の時刻に動かないことを理由に、前へ送る解決関数の追加と`LenientResolver`の組合せの変更を提案した。PR #365でmergeされている。
- 解いている問題と前提：欠落・重複の扱いは用途で変わり、1つの既定では足りない。前提は、呼出し側が用途（予定の実行、利用者入力、data移行等）を知っていることである。
- 必要な入力：重複時に早い方・遅い方・例外のどれにするか、欠落時に前の区間の終わり・後の区間の始まり・幅だけ送る・例外のどれにするか。
- trade-off・失敗の仕方：
  - 既定が「例外にしない」方針の場合、欠落・重複は黙って解決され、呼出し側は気づかない。Temporalの既定`'compatible'`はこの側である。
  - Noda Timeは既定の組合せをversion 2.0で変えており（行129–131）、同じcodeの結果がlibraryの版で変わった例である。
  - 欠落時の「区間の始まりへ寄せる」と「幅だけ送る」は、結果の壁時計が異なる（#295）。
- 反例・適用しない場合：Luxonは方針を選ばせない（P31-O04）。Temporalの文書の例のcomment（`timezone.md` 行243）は、前へ進む遷移の例で「`'later'` is same as `'compatible'` for backwards transitions」と書いており、本文（行192、226）の説明と表記が食い違う。
- 互換・非互換：P31-O02の分類を前提にする。P31-O05（日の始まり）、P31-O06（保存値のoffsetとの衝突）は別の方針軸である。P08-O09（misfire）は、予定時刻の取りこぼしの方針であり、本観察の欠落時刻の方針とは別だが、毎日同じ壁時計に動くjobでは両方が関わる（#295の例）。
- 限界：方針の名前と既定はrepository固有である。どの方針を既定にするかを本書は扱わない。

### P31-O04 解決方針を持たず「未定義」「保証しない」と明記する設計と、欠落の印だけを残す設計
- 出典：
  - luxon、`docs/zones.md` 行224–243（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/zones.md#L224-L243）、行245–259（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/zones.md#L245-L259）
  - luxon、`src/datetime.js` 行105–128（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/datetime.js#L105-L128）、行1184–1195（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/datetime.js#L1184-L1195）
  - golang/go、`src/time/time.go` 行1716–1734（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L1716-L1734）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Luxonの文書は、欠落時刻からDateTimeを作ると前へ送られ、日単位の計算で欠落に入った場合も前へ送ると書く（行228–243）。重複時刻については、どちらの瞬間になるかは未定義で、現状の挙動は保証しないと書く（行249–257）。理由として、Luxonはzoneの規則を直接持たず、その時刻が曖昧かを知るには毎回近くの時刻を調べる必要があり、それを行わないと書く（行259）。
  - `fixOffset`は、推定したoffsetで仮のUTCを求め、zoneにその時点のoffsetを問い合わせ、違えば差だけ動かして再び問い合わせる。2回目も一致しなければ「hole time」として扱い、3番目の戻り値を真にする（行126–127のcomment）。この値はDateTimeの`wasHole`として公開される（行1184–1195）。
  - Goの`time.Date`のdocは、夏時間の遷移で飛ばされる・繰り返される時刻について、選ばれるzoneと時刻はwell-definedではなく、遷移に関わる2つのzoneのどちらかで正しい時刻を返すが、どちらかは保証しないと書く（行1726–1731）。
- 解いている問題と前提：zoneの規則の全体に触れられない（Luxonは環境の`Intl`経由でzoneを扱う。`docs/zones.md` 行63、https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/zones.md#L61-L72）、または毎回の判定の費用を避けたい場合に、曖昧さの判定を行わない。
- 必要な入力：なし（呼出し側は方針を渡せない）。重複・欠落を避けたい場合は、呼出し側が瞬間型やoffset付きの値で扱う必要がある。
- trade-off・失敗の仕方：重複時刻の結果が、作り方（直接作るか、日の加算・減算で到達するか）で変わる（Luxon 行252–254の例）。保証しないと明記されているため、library更新で挙動が変わっても互換性の破壊にならない。
- 反例・適用しない場合：TemporalとNoda Timeは方針を選ばせる（P31-O03）。
- 互換・非互換：P31-O02・O03と対立する。P31-O13（無効値の通知）とは、欠落を例外にしない点で同じ側にある。
- 限界：Luxonの「現状の挙動」は文書自身が保証しないと書いており、本書もそれを挙動の根拠にしない。

### P31-O05 「その日の始まり」を0時ではなく、その日の最初に存在する瞬間として求める
- 出典：
  - nodatime、`src/NodaTime/DateTimeZone.cs` 行290–329（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/DateTimeZone.cs#L290-L329）
  - proposal-temporal、`polyfill/lib/ecmascript.mjs` 行1415–1422（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/polyfill/lib/ecmascript.mjs#L1415-L1422）
  - proposal-temporal、`docs/timezone.md` 行98–106（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L98-L106）
  - proposal-temporal、`docs/zoneddatetime.md` 行11–15（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/zoneddatetime.md#L11-L15）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Noda Timeの`AtStartOfDay(LocalDate)`は、その日の0時を`MapLocal`で対応づける。一意または重複なら早い方のoffsetを使う。0時が欠落していれば、後の区間の始まり（遷移の瞬間）を返す。その瞬間が別の日付になる場合（日全体が飛ばされた場合）は`SkippedTimeException`を投げる。commentは、日全体が飛ばされた実例を挙げている（行315）。
  - Temporalのpolyfillは、`YYYY-MM-DD[Zone]`形式の文字列（時刻なし）を「start-of-day」として扱い、offsetを書けない形式なので`GetStartOfDay`へ回す（行1415–1422）。文書は、`PlainDate`から時刻を省いてzone付きの値を作ると、その日の始まりになると書く（`timezone.md` 行104）。`zoneddatetime.md`は、日の長さや日の始まりの時刻が夏時間や政治的変更で日ごとに違いうることを、zone付きの型の用途に挙げる（行15）。
- 解いている問題と前提：締めや日次集計の境界を「その日の0時」と書くと、0時が存在しない日や2回ある日に境界が定まらない。前提は、日付とzoneの組から境界の瞬間を求めることである。
- 必要な入力：暦日、zone、重複時に早い方を使うかどうか（Noda Timeは固定で早い方）。
- trade-off・失敗の仕方：日全体が欠落する場合、Noda Timeは例外にする。境界を例外なしに求めたい呼出し側は、別の扱いが要る。
- 反例・適用しない場合：締めを瞬間（UTC）で定義する場合や、zoneを持たない暦日だけで扱う場合は、この変換は要らない。
- 互換・非互換：P31-O02（分類）を使う。P31-O03の`'earlier'`／`ReturnEarlier`と同じ向きの選択を、日の始まりに固定している。
- 限界：業務上の締め時刻（営業日、締め日の繰り延べ等）の設計は、今回読んだ範囲になかった（§見つからなかったこと）。

### P31-O06 未来の予定の保存：壁時計＋zoneで持つか、offset付きで持つか、保存時と現在の規則が食い違ったときの解決
- 出典：
  - proposal-temporal、`docs/cookbook.md` 行223–226（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/cookbook.md#L223-L226）
  - proposal-temporal、`docs/cookbook/localTimeForFutureEvents.mjs` 行29–37（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/cookbook/localTimeForFutureEvents.mjs#L29-L37）
  - proposal-temporal、`docs/timezone.md` 行285–315（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L285-L315）
  - proposal-temporal、`polyfill/lib/ecmascript.mjs` 行1424–1478（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/polyfill/lib/ecmascript.mjs#L1424-L1478）
  - eggert/tz、`theory.html` 行622–631（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L622-L631）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Temporalのcookbookは、未来の会議を「暦日と壁時計」と「zone」の2つの文字列で保存する例を示す。瞬間で保存しない理由として、それまでに夏時間の規則が変わっても会議は同じ壁時計で開かれるため、規則が変われば瞬間が変わると書く（行224–226）。例は、変換時に`disambiguation: 'reject'`を指定している（`.mjs` 行34）。
  - 文字列にoffsetとzoneの両方を保存した後でzoneの定義が変わると、保存したoffsetが現在の規則と食い違う。`ZonedDateTime.from`の`offset` optionはこの食い違いを解く。`'use'`はoffsetを使い瞬間を保つ（壁時計は変わりうる）、`'ignore'`はzoneから求め壁時計を保つ（瞬間は変わりうる）、`'prefer'`はoffsetが有効なら使い無効ならzoneから求める、`'reject'`は`RangeError`を投げる。`from`の既定は`'reject'`で、文書は「明らかな既定の解決がないため」と書く。`with`の既定は`'prefer'`で、壁時計の一部を変えたときに重複区間の中で瞬間が意図せず動くのを防ぐためと書く（行305–312）。
  - polyfillの`InterpretISODateTimeOffset`は、offsetがない、または`'ignore'`なら`disambiguation`に回す。内部の`offsetBehaviour`が`'exact'`か、optionが`'use'`ならoffsetで瞬間を求める（`'exact'`がどの入力で設定されるかは、今回読んだ行の範囲の外である）。それ以外（`'prefer'`、`'reject'`）は、候補の瞬間のうちoffsetが一致するものを探す。一致がなければ`'reject'`は例外、`'prefer'`は`disambiguation`に回す。
  - tzの`theory.html`は、tzdbは未来の時刻を予測しており、将来政府が規則を変えると現在の予測は誤りになること、規則変更の前に行った変換に頼るとsoftwareが誤りうることを、会議の予定の例で書く（行624–630）。
- 解いている問題と前提：未来の予定は、保存した時点の規則と、実行する時点の規則が違いうる。前提は、予定の意味が「その土地の壁時計」なのか「世界共通の瞬間」なのかを、保存する側が知っていることである。
- 必要な入力：予定の意味（壁時計か瞬間か）、保存形式（offsetを含めるか、zone名を含めるか）、読み戻したときに食い違ったら瞬間・壁時計・例外のどれを優先するか。
- trade-off・失敗の仕方：壁時計＋zoneで保存すると、規則変更に追随するが、変換は読み出しのたびに現在の規則で行われる。offset付きで保存すると、保存時の規則が固定されるが、規則変更後に食い違う。Goの直列化はoffsetだけを保存してzone名を落とすため（P31-O01）、この判断に必要な情報が残らない。
- 反例・適用しない場合：過去の出来事の記録（ログ、監査）は瞬間として保存し、規則変更の影響を受けない（`timezone.md` 行287–288は、変更はほぼ常に将来向きだと書く。ただし同 行50は過去の範囲の修正もありうると書く、https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L48-L50）。
- 互換・非互換：P31-O03（`disambiguation`）と組み合わさる。P31-O07（tz dataの更新）が、食い違いの発生源である。P31-O09（zoneの分割）とも関係する。
- 限界：保存形式の文字列の文法（RFC 9557等）は本書の範囲外で、読んでいない。

### P31-O07 tz databaseを「将来予測を含み、名前は安定、offsetと境界は安定でない」dataとして更新し続ける
- 出典：
  - eggert/tz、`theory.html` 行609–617（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L609-L617）、行1279–1344（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L1279-L1344）
  - eggert/tz、`tz-link.html` 行223–232（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/tz-link.html#L223-L232）、行278–325（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/tz-link.html#L278-L325）
  - proposal-temporal、`docs/timezone.md` 行41–50（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L41-L50）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - tzの`theory.html`は、tzdbは権威あるdataではなく誤りを含むと書き、権威あるdataが要る利用者は各国の標準機関等にあたるよう書く（行610–615）。
  - 安定した interface として、zone名の集合、library関数、`zic`等のprogram、入出力の形式、表fileの形式、版番号（各releaseの`version` fileの1行目）を列挙する（行1283–1315）。releaseのinterface変更は最近のreleaseとの互換を保つよう努めると書き、dataが新しい`zic`の機能に頼らないことで古い`zic`で新しいdataを処理できる例を挙げる（行1318–1323）。列挙にないものは安定性が低いとし、特定のUTC offsetや略称に頼らないよう書く（行1329–1333）。zoneの境界も安定したinterfaceではなく、zoneが分割されうると書く（行1336–1343）。
  - `tz-link.html`は、releaseに固定の予定はないこと、多くの下流の配布者はreleaseを待ってから製品の更新を作ること、統合・test・配布に費用と時間がかかり、古い機器は更新されず古い規則を使い続けることを書く（行302–317）。tzの変更は多くの場合OSの更新で利用者に届くとも書く（行224–227）。
  - Temporalの文書も、IANA tzdbは政治的変更に応じて年に何度か更新され、通常は将来の値だけが変わるが、過去の範囲が修正されることもあると書く（行48–50）。
- 解いている問題と前提：地域の時刻の規則は政府が変え、予告が短いこともある（`tz-link.html` 行20、https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/tz-link.html#L18-L22）。dataは予測を含むため、配布後も正しさが変わる。
- 必要な入力：利用側が使っているtzdbの版、更新の経路（OS、runtime、library同梱、自前配布）、どのinterface（名前、offset、境界）に依存しているか。
- trade-off・失敗の仕方：更新が利用者に届くまでに時間がかかり、届かない機器も残る（`tz-link.html` 行314–317）。offsetや略称に頼ると、dataの修正で結果が変わる（`theory.html` 行1329–1333）。
- 反例・適用しない場合：UTCや固定offsetだけを扱う処理は、zoneの規則の更新の影響を受けない。ただしTemporalの文書は、固定offsetの識別子は政治的変更でその土地のoffsetが変わりうるため勧めないと書く（`docs/README.md` 行200、https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/README.md#L198-L201）。
- 互換・非互換：P31-O08（利用側がtz dataをどこから得るか）、P31-O09（名前の改名・統合）、P31-O06（保存値との食い違い）の前提になる。
- 限界：tzの文書にある期間の目安（予告の長さ等）は持ち込まない。tzの議論の場（mailing list）は読んでいない。

### P31-O08 利用側のtz dataの供給元と版：同梱資源、探索順と埋込みfallback、実行環境への委任
- 出典：
  - nodatime、`src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs` 行34–55（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs#L34-L55）、行133–169（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs#L133-L169）、行349–353（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs#L349-L353）、行402–413（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs#L402-L413）
  - golang/go、`src/time/zoneinfo.go` 行652–701（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/zoneinfo.go#L652-L701）
  - golang/go、`src/time/zoneinfo_read.go` 行531–569（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/zoneinfo_read.go#L531-L569）
  - golang/go、`src/time/zoneinfo_unix.go` 行21–26（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/zoneinfo_unix.go#L21-L26）
  - golang/go、`src/time/tzdata/tzdata.go` 行5–18（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/tzdata/tzdata.go#L5-L18）
  - luxon、`docs/zones.md` 行61–72（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/zones.md#L61-L72）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Noda Timeは、tz dataを独自形式の資源としてassemblyに同梱し、`TzdbDateTimeZoneSource.Default`で遅延読込みする。利用者は`FromStream`で別のdata fileを読み込める（docは、textのtzdbから更新版のfileを作る手順はuser guideにあると書く）。`TzdbVersion`はtzdbの版名を、`VersionId`はtzdbとWindows zone対応表の版を合わせた文字列を返す。`Validate`は、読込み時には自動で行われないが、同梱dataは生成時に検証済みで、出所が不確かなdataのときに明示的に呼ぶと書く。
  - Goの`LoadLocation`のdocは、探索先を順に、環境変数`ZONEINFO`が指すdirectoryまたはzip、Unixではsystemの標準の場所、`$GOROOT/lib/time/zoneinfo.zip`、`time/tzdata` packageをimportしていればその埋込みdata、と列挙する（行661–667）。固定commitのコードでは、`ZONEINFO`を試した後（行685–694）、`loadLocation`がplatformの場所（Unixでは`platformZoneSources`）を順に試し（`zoneinfo_read.go` 行532–542）、次に埋込みdata（行543–553）、最後に`GOROOT`のzip（行554–564）を試す。docの列挙とコードの試行順は、埋込みdataとGOROOTのzipの順が異なる。
  - `time/tzdata`のpackage文書は、importされていれば、systemでtzdata fileが見つからないときに埋込みdataを使うと書き、このpackageは通常libraryではなくprogramのmain packageがimportするべきで、libraryがtz dataを同梱するかを決めるべきではないと書く（行13–15）。
  - Luxonは、IANA zoneを実行環境の`Intl` API経由で扱い、環境がそのzoneを扱えない場合は無効なDateTime（理由`unsupported zone`）になる（行63–72）。
- 解いている問題と前提：tz dataは更新され続け（P31-O07）、実行環境ごとに入っている版が違う。どの版で計算したかを利用側が制御・確認できるかが問題になる。
- 必要な入力：data の供給元（OS、runtime、library同梱、自前のfile）、版の確認手段、dataが見つからないときのfallbackと誤りの扱い。
- trade-off・失敗の仕方：
  - 同梱（Noda Time、Goの`time/tzdata`）は、環境に依らず同じ版を使えるが、libraryやprogramを更新しないとdataが古いままになる。
  - 環境に委ねる（Goのsystemの場所、Luxonの`Intl`）は、OSの更新に追随するが、環境ごとに版や扱えるzoneが違う。
  - Goは、探索先で誤りがあっても次の探索先を試し続け、後の探索先で見つかれば成功を返す。どこにも見つからなかったときだけ、記録しておいた最初の誤り（`ENOENT`以外のもの）を返し、それも無ければ「unknown time zone」を返す（`zoneinfo_read.go` 行539–541、565–568）。
- 反例・適用しない場合：UTCと固定offsetだけを使う処理（Goの`LoadLocation`は`""`と`"UTC"`でUTCを直接返す、行669–671）は、dataを探さない。
- 互換・非互換：P31-O07（dataの更新）、P31-O09（識別子の同値性）と組み合わさる。P31-O13（未知のzoneの扱い）とも関係する。
- 限界：Goのdocとコードの順の違いが意図か誤りかは、今回の範囲では確かめていない（関連issueを検索していない）。Unix以外のplatformの探索先は読んでいない。

### P31-O09 zone識別子の改名・統合・分割への備え：backward link、同値性の判定、正規化の不可視化
- 出典：
  - eggert/tz、`theory.html` 行303–318（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L303-L318）、行384–392（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L384-L392）、行1336–1343（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/theory.html#L1336-L1343）
  - eggert/tz、`backward` 行13–15（https://github.com/eggert/tz/blob/83f40cf091e90137edf09a23367dd040d156c97a/backward#L13-L15）
  - proposal-temporal、`docs/zoneddatetime.md` 行37–69（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/zoneddatetime.md#L37-L69）
  - nodatime、`src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs` 行172–182（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/TzdbDateTimeZoneSource.cs#L172-L182）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - tzの命名指針は、名前を変えたら旧い綴りを`backward` fileに新しい綴りへのlinkとして置き、旧い綴りが使い続けられるようにすると書く（行311–313）。`backward`はもとは省略可能として設計されたが、現在は配布で通常使われると書く（行389–392、`backward` 行13–15）。zoneの境界は安定したinterfaceではなく、未来の予定にzone名を記録するapplicationは、それまでの間のzoneの分割に耐えるべきだと書く（行1340–1343）。
  - Temporalの文書は、改名・統合された識別子をECMAScriptでは同値として扱い、同値性は`ZonedDateTime.prototype.equals`で調べ、文字列の`===`で比べないよう例示する（行42–49）。正規の識別子は1つで、`Intl.supportedValuesOf('timeZone')`と`Temporal.Now.timeZoneId()`だけが正規の識別子に限られ、それ以外では正規化は観測できず、tzdbの変更が既存applicationに与える影響を小さくすると書く（行58–60）。tzdbはbuild optionで同値なzoneが変わり、ECMAScript実装は一般に、国codeごとに少なくとも1つの正規識別子を保ち、異なる国codeの識別子を同値にしないbuild optionを使うと書く（行64–66。「generally」であり、必須とは書いていない）。
  - Noda Timeの`TzdbDateTimeZoneSource`は、正規ID表（`CanonicalIdMap`）から、正規IDごとの別名の一覧（`Aliases`）を作る（行176–179）。
- 解いている問題と前提：保存したzone名は、後のtzdbで別名になり、統合され、分割されうる。名前の文字列比較では同じzoneを同じと判定できない。
- 必要な入力：保存するzone名、同値性の判定手段（libraryの比較、正規化表）、分割されたときにどの名前へ移すかの判断。
- trade-off・失敗の仕方：正規化して保存すると、tzdbやbuild optionが変わったときに正規名自体が変わりうる。正規化を観測させない設計（Temporal）は、その影響を小さくする代わりに、同値性の判定にlibraryのAPIを要する。
- 反例・適用しない場合：固定offsetの識別子は、IANAの識別子と同値にならない（Temporal 行56）。
- 互換・非互換：P31-O07（dataの更新）、P31-O06（未来の予定の保存）。
- 限界：tzのbuild option（`backzone`等）の詳細は読んでいない。

### P31-O10 単調時計と壁時計の使い分け：1つの値に両方の読みを持たせるか、経過時間専用の型を分けるか
- 出典：
  - golang/go、`src/time/time.go` 行10–81（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L10-L81）、行126–139（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L126-L139）、行140–161（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L140-L161）、行1198–1212（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L1198-L1212）
  - issue：golang/go#12914（https://github.com/golang/go/issues/12914、closed）
  - guava、`guava/src/com/google/common/base/Ticker.java` 行19–54（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava/src/com/google/common/base/Ticker.java#L19-L54）
  - guava、`guava/src/com/google/common/base/Stopwatch.java` 行36–92（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava/src/com/google/common/base/Stopwatch.java#L36-L92）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Goのpackage文書は、OSが提供する壁時計は時刻同期で変わり、単調時計は変わらないとし、「壁時計は時刻を告げるため、単調時計は時間を測るため」と書く（行12–14）。APIを分けず、`time.Now`が返す`Time`に両方の読みを持たせ、時刻を告げる操作は壁時計を、比較と引き算は単調時計を使う（行15–20）。両方の`Time`が単調時計の読みを持つ場合だけ比較・引き算は単調時計だけで行い、どちらかが持たなければ壁時計に戻る（行48–52）。暦の計算（`AddDate`、`Round`、`Truncate`）とzoneの付け替え（`In`、`Local`、`UTC`）は単調時計の読みを落とす（行42–46）。単調時計の読みはprocessの外では意味がないため、直列化と`Format`はそれを含めず、構築子と復元は単調時計なしの`Time`を作る（行61–68）。sleep中に単調時計が止まるsystemがあり、その場合は引き算が実際の経過を反映しないことがあるとも書く（行54–59）。
  - `Time`の内部表現は、1bitの印で単調時計の読みの有無を表し、ある場合は別のfieldに単調時計の読みを置く（行144–151）。`Sub`は両方が印を持つときだけ単調時計の差を使う（行1199–1201）。`==`はlocationと単調時計の読みも比べるため、map keyやDBのkeyに使う前にlocationを揃え、単調時計の読みを落とすよう書く（行131–139）。
  - #12914は、標準libraryに単調時計へのAPIがなく経過時間を確実に測れないという報告で、closedである。
  - Guavaの`Ticker`は、任意の固定点からの経過nanosecondsを返す時刻源で、docは経過時間の測定だけに使え、壁時計には使えないと警告する（行24）。既定の実装は`System.nanoTime`を読む。`Stopwatch`のdocは、壁時計の読みの差は時計の補正の影響を受け経過時間の測定として信頼できず、`Stopwatch`は既定で`nanoTime`を使うため影響を受けないと書く（行39–44）。Android向けに、sleep中も進む時刻源を`Ticker`として渡す例を示す（行82–92）。
- 解いている問題と前提：期限（deadline）やtimeout、経過時間の測定に壁時計を使うと、時刻同期や手動変更で負の経過や跳躍が起きる。前提は、測定が同じprocessの中で完結することである。
- 必要な入力：その値を「時刻を告げる」ために使うか「時間を測る」ために使うかの区別、process外へ出すか、sleep中の経過を含めたいか。
- trade-off・失敗の仕方：
  - Goの方式は利用者が使い分けを意識しなくてよいが、`==`の比較、直列化での読みの欠落、暦の計算での読みの除去など、同じ型の中で挙動が分かれる。
  - Guavaの方式は型で分けるが、`Ticker`の値は任意の固定点からの経過nanosecondsであり（`Ticker.java` 行20–21、https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava/src/com/google/common/base/Ticker.java#L20-L21）、壁時計との対応がない。
  - どちらも、process・機械をまたぐ期限には使えない（P08-O08のleaseは、DBの時刻とnodeの単調時計を組み合わせていた）。
- 反例・適用しない場合：過去の出来事の記録や、利用者に見せる時刻は壁時計（瞬間）を使う。
- 互換・非互換：P31-O12（単調時計の差し替え）と対になる。P31-O11（壁時計の差し替え）とは差し替える対象が違う。
- 限界：Goの内部表現のbit幅や表せる範囲の値は持ち込まない。#12914の議論の経過（提案の版）は本文の冒頭だけを読み、設計文書（golang/proposal）は読んでいない。

### P31-O11 壁時計のclock injection：interfaceを注入するか、process全体の設定を差し替えるか、注入点を持たないか
- 出典：
  - nodatime、`src/NodaTime/IClock.cs` 行9–31（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/IClock.cs#L9-L31）
  - nodatime、`src/NodaTime/SystemClock.cs` 行10–37（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/SystemClock.cs#L10-L37）
  - nodatime、`src/NodaTime.Testing/FakeClock.cs` 行7–20（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime.Testing/FakeClock.cs#L7-L20）、行154–186（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime.Testing/FakeClock.cs#L154-L186）
  - luxon、`src/settings.js` 行10–40（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/settings.js#L10-L40）、行42–58（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/settings.js#L42-L58）、行170–179（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/settings.js#L170-L179）
  - luxon、`src/datetime.js` 行804–818（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/datetime.js#L804-L818）
  - proposal-temporal、`docs/now.md` 行8–12（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/now.md#L8-L12）
  - issue：tc39/proposal-temporal#3323（https://github.com/tc39/proposal-temporal/issues/3323、closed）、#603（https://github.com/tc39/proposal-temporal/issues/603、open）、PR #1367（https://github.com/tc39/proposal-temporal/pull/1367、open・未merge）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Noda Timeの`IClock`は現在の瞬間を返す1 methodのinterfaceである。docは、`SystemClock.Instance`を直接呼ぶことは厳密には誤りではないが、production codeの書き方としては強く勧めず、`IClock`を必要とする所へ渡すことで`NodaTime.Testing`の`FakeClock`を使ったtestを書けるようにすることを勧める（`IClock.cs` 行13–18）。`SystemClock`のdocは、使い捨てのcode以外では、注入する値を用意する1か所だけで参照するよう勧める（行12–14）。
  - `FakeClock`は、初期の瞬間を与え、`Advance`系と`Reset`で進め・戻し、`AutoAdvance`を設定すると読むたびに進む。`GetCurrentInstant`は現在値を返してから`AutoAdvance`だけ進める（行164–172）。docは、`AutoAdvance`が0なら`Reset`と`Advance`以外では時刻が変わらないこと、負の値にもでき、systemの時計の奇妙な挙動を模せることを書く（行178–185）。
  - Luxonは、現在時刻を返す関数を`Settings.now`としてprocess全体で差し替えられる（`settings.js` 行31–40）。既定zoneも`Settings.defaultZone`で差し替え、既存のinstanceには影響しない（行42–58）。`resetCaches`は「testでだけ必要なはず」と書く（行170–172）。`fromObject`は、`opts.specificOffset`が指定されていない場合に限り、`opts.overrideNow`があればそれを、なければ`Settings.now()`を、仮のoffsetを求める基準時刻に使う（`datetime.js` 行815–818）。`specificOffset`が指定されていれば、それを仮のoffsetにする。`overrideNow`は`Interval`のISO文字列解析が終端の解析で開始時刻を渡すために使っている（`src/interval.js` 行152–160、https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/interval.js#L152-L160）。今回読んだ`fromObject`のjsdocの引数一覧（行788–793、https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/datetime.js#L788-L793）には、`overrideNow`は載っていない。
  - Temporalの`Temporal.Now`は、system の現在時刻・zoneを返すmethodの集まりで、文書は呼ぶたびに値が変わるため同じ値を複数か所で使うなら変数に保存するよう書く（`now.md` 行10）。#3323は、`java.time`の`InstantSource`の考え方を挙げ、`Temporal.Now`をinterfaceとして渡すcookbook例を求めた。repositoryのmember（author_association: MEMBER）は、cookbook例のPR #1367が準備中だが古くなっていると答え、#603に寄せてcloseした。#603（open）は、`Temporal`と同じinterfaceを持ち、date、time、zone、tzdataの版を作成者の制御下に置ける「locked-down」なobjectのcookbook例を求めており、用途にtestを含めている。
- 解いている問題と前提：現在時刻に依存するcode（期限判定、締めの判定）をtestで決定的にする。前提は、現在時刻の取得箇所を1か所に集められることである。
- 必要な入力：現在時刻の取得をどの単位（interfaceの引数、DI container、process全体の設定）で差し替えるか、testで時刻を進める手段、zoneも差し替えるか。
- trade-off・失敗の仕方：
  - interfaceの注入（Noda Time）は、すべての利用箇所へ`IClock`を渡す必要がある。
  - process全体の設定（Luxon）は、渡す手間がないが、並行して動くtestや別のcomponentに影響する。#3323の起票者も、自分が所有しない変数を差し替えたくないとcommentしている。
  - 注入点を標準で持たない（Temporal）場合、利用者が包む必要があり、その方法は文書化の途中である（#603、PR #1367がopen）。
- 反例・適用しない場合：現在時刻を引数として受け取る純粋な関数にすれば、clockの注入自体が要らない、というのは本書の推論である。#603は、Elmのような純粋関数的な環境を、locked-downなobjectの用途の1つとして挙げているだけで、注入が要らないとは書いていない。
- 互換・非互換：P31-O12（単調時計の差し替え）と同じ考え方を、壁時計に当てたものである。P31-O01の`ZonedClock`は、注入したclockにzoneを添える。
- 限界：Noda Timeのuser guide（別repository）は読んでいない。

### P31-O12 testでの時刻の進め方：偽の単調時計を手で進めるか、待ちが尽きたときだけ偽の時計を進めるか
- 出典：
  - guava、`guava-testlib/src/com/google/common/testing/FakeTicker.java` 行32–45（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava-testlib/src/com/google/common/testing/FakeTicker.java#L32-L45）、行56–62（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava-testlib/src/com/google/common/testing/FakeTicker.java#L56-L62）、行77–89（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava-testlib/src/com/google/common/testing/FakeTicker.java#L77-L89）、行106–109（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava-testlib/src/com/google/common/testing/FakeTicker.java#L106-L109）
  - guava、`guava/src/com/google/common/base/Stopwatch.java` 行76–78（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava/src/com/google/common/base/Stopwatch.java#L76-L78）、行114–139（https://github.com/google/guava/blob/74fb73b20e17e1b3fa072d7754af493217f86781/guava/src/com/google/common/base/Stopwatch.java#L114-L139）
  - golang/go、`src/testing/synctest/synctest.go` 行18–43（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/testing/synctest/synctest.go#L18-L43）、行45–93（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/testing/synctest/synctest.go#L45-L93）、行95–99（https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/testing/synctest/synctest.go#L95-L99）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Guavaの`FakeTicker`は、testで値を手で進める`Ticker`で、読むたびに一定量進める設定（`setAutoIncrementStep`）を持つ。自動増分は負の値を拒否する（行86）。`advance(long)`は、今回読んだ行の範囲では負の値を検査せずに加算する（行60–61）。`Stopwatch`は時刻源を引数に取る構築子（`createUnstarted(Ticker)`、`createStarted(Ticker)`）を持ち、docはtestで偽の`Ticker`を渡すよう書く（行76–78）。
  - Goの`testing/synctest`は、隔離された「bubble」の中で`time`packageが偽の時計を使い、bubbleごとに時計を持つ。時刻は、bubble内のすべてのgoroutineが「durably blocked」（同じbubble内の別のgoroutineによってのみ解除されうる待ち）になったときだけ進む。そのとき、`Wait`が呼ばれていれば戻り、そうでなければ少なくとも1つのgoroutineを解除する次の時刻まで進め、それもなければdeadlockとして`Test`がpanicする（行69–75）。mutexのlock、I/O、system callはdurably blockingではないと書く（行86–93）。bubble内で作ったchannel、timer、tickerをbubble外から操作するとpanicする（行97–99）。
- 解いている問題と前提：timeoutや経過時間に依存するcodeを、実時間を待たずに決定的にtestする。Guavaは時刻源を注入できること（P31-O10）、Goはtest対象が`time`packageの待ち（`time.Sleep`、timer）を使うことを前提にする。
- 必要な入力：時刻を誰が進めるか（test codeが明示的に、または待ちが尽きたときにruntimeが）、自動で進めるかどうか、外部I/Oを含むか。
- trade-off・失敗の仕方：
  - 手で進める方式（Guava、Noda Timeの`FakeClock`）は、時刻の進み方をtestが完全に決めるが、待ちを含むcodeでは、test側が進めるtimingを合わせる必要がある。
  - 待ちが尽きたら進める方式（Go）は、待ちを含む並行codeでも実時間を待たないが、I/Oやmutexの待ちはdurably blockingに数えないため、それらを含むcodeでは時刻が進まない、またはbubble外の事象に依存する。
  - 負の時刻の進みを、Noda Timeの`FakeClock`は自動増分でも許し（P31-O11）、Guavaの`FakeTicker`は自動増分では拒む。偽の時計で何を模せるかがlibraryごとに違う。
- 反例・適用しない場合：壁時計の差し替えはP31-O11が扱う。Goの偽の時計は`time`package全体に効くため、注入点を設けない既存codeにも効く。
- 互換・非互換：P31-O10（単調時計）、P31-O11（壁時計の注入）。
- 限界：bubbleの初期時刻の値は持ち込まない。`synctest`の実装（runtime側）は読んでいない。

### P31-O13 存在しない時刻・未知のzone・食い違いを、例外にするか、無効な値として伝播させるか
- 出典：
  - luxon、`docs/validity.md` 行1–26（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/validity.md#L1-L26）、行28–45（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/validity.md#L28-L45）、行47–51（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/validity.md#L47-L51）、行67–76（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/validity.md#L67-L76）
  - luxon、`src/settings.js` 行154–168（https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/src/settings.js#L154-L168）
  - nodatime、`src/NodaTime/TimeZones/Resolvers.cs` 行96–121（https://github.com/nodatime/nodatime/blob/4dd26f1ddfa71e14418ebd279258d0bb5c087d34/src/NodaTime/TimeZones/Resolvers.cs#L96-L121）
  - proposal-temporal、`docs/timezone.md` 行346–363（https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L346-L363）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Luxonは、暦の単位のあふれ、存在しないzone、矛盾した情報（曜日と日付）から作ったDateTimeを、例外にせず無効な値にする（後の2つは行37–45）。無効な値は`isValid`が偽で、primitiveを返すgetterは退化した値を返し、他のLuxon objectを返すmethodは無効な値を返す（行7–26）。`invalidReason`（一貫したcode）と`invalidExplanation`で理由を示す。`Settings.throwOnInvalid`を真にすると、無効な値を作るときに例外を投げる（行67–74）。文書は、それ以外の一部の誤り（例は存在しない単位名の設定）は、dataの問題よりprogrammerの誤りである可能性が高いという判断から例外にすると書く（行47–51）。どの誤りがこれに当たるかの一覧は、今回読んだ範囲にない。
  - Noda Timeは、欠落・重複を例外にする解決関数（`ThrowWhenSkipped`、`ThrowWhenAmbiguous`）と、両方を例外にする`StrictResolver`を持つ。例外の型を欠落（`SkippedTimeException`）と重複（`AmbiguousTimeException`）で分ける。
  - Temporalは、`'reject'`を選ぶと、曖昧・欠落時刻やoffsetの食い違いで`RangeError`を投げる。文書の例は、保存時の規則で書かれた文字列を既定の`from`で読むと例外になることを示す（行349–353）。
- 解いている問題と前提：時刻の誤りが、data（利用者入力、古い保存値）由来か、programmer由来かで、扱いを分けたい。
- 必要な入力：誤りの種類（欠落、重複、未知のzone、offsetの食い違い、範囲外）ごとに、例外・無効値・自動解決のどれにするか。
- trade-off・失敗の仕方：無効な値を伝播させる方式は、どこで無効になったかが分かりにくい。Luxonの文書は、黙って失敗するためdebugが難しいと書き（行55、https://github.com/moment/luxon/blob/f427515a38f6a671f8de663e6bcc040ed81f114e/docs/validity.md#L53-L56）、理由のcodeと例外化の設定を用意している。例外にする方式は、呼出し側がすべての経路で例外を扱う必要がある。
- 反例・適用しない場合：既定で自動解決する方式（Temporalの`'compatible'`、Noda Timeの`LenientResolver`、Luxonの欠落時刻の前送り）は、誤りとして通知しない（P31-O03・O04）。
- 互換・非互換：P31-O03（解決方針）、P31-O08（未知のzone）。
- 限界：Luxonの`throwOnInvalid`はprocess全体の設定であり、P31-O11の`Settings.now`と同じくprocess全体に効く。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 値の型（O01） | Temporal：zoneなし（`Plain*`）、瞬間（`Instant`）、zone付き（`ZonedDateTime`）を別class | Go・Luxon：瞬間＋解釈用のzoneを1つの型で持つ。Goの直列化はzone名を落とす | 変換時にzoneを明示させたいか、型の数を少なくしたいか |
| 壁時計→瞬間の分類（O02） | Noda Time：`ZoneLocalMapping`の件数0／1／2で分類を公開 | Temporal：候補の瞬間の配列の長さで内部分岐。Luxon・Go：分類を持たない（O04） | zoneの規則全体に触れられるか |
| 欠落・重複の解決（O03・O04） | Temporal：`disambiguation`（既定は`'compatible'`）。Noda Time：重複用と欠落用の解決関数の合成、既製の`StrictResolver`／`LenientResolver` | Luxon：欠落は前送り、重複は未定義。Go：どちらか保証しない | 用途ごとに方針を選ばせるか、費用を避けて未定義にするか |
| 日の始まり（O05） | Noda Time：0時が欠落なら遷移の瞬間、日全体の欠落は例外 | Temporal：時刻なしの日付はstart-of-dayとして解決 | 締めや日次の境界を壁時計で定義するか瞬間で定義するか |
| 未来の予定の保存（O06） | Temporal cookbook：壁時計＋zoneで保存し、読むたびに現在の規則で変換 | Temporal `offset` option：offset付き保存値と現在の規則の食い違いを`use`／`ignore`／`prefer`／`reject`で解決 | 予定の意味が壁時計か瞬間か |
| tz dataの供給元（O08） | Noda Time：同梱資源＋`FromStream`＋版の取得＋明示的な`Validate`。Go `time/tzdata`：main packageが埋込みを選ぶ | Go：環境変数・systemの場所・GOROOTのzipを探索。Luxon：実行環境の`Intl`に委ねる | 版を利用側で固定したいか、OSの更新に追随したいか |
| 識別子の改名・統合（O09） | tz：旧名を`backward`のlinkで残す | Temporal：同値性は`equals`で判定、正規化は観測させない。Noda Time：別名の一覧を公開 | 名前を文字列として比べるか、libraryの同値性に委ねるか |
| 経過時間の測定（O10） | Go：1つの`Time`に壁時計と単調時計の読みを持たせ、操作ごとに使い分け | Guava：経過時間専用の`Ticker`と`Stopwatch`を別の型にする | APIを分けたくないか、型で誤用を防ぎたいか |
| 壁時計の差し替え（O11） | Noda Time：`IClock`を注入し、testで`FakeClock` | Luxon：`Settings.now`をprocess全体で差し替え。Temporal：標準の注入点なし（cookbook例がopen） | 渡す手間とprocess全体への影響のどちらを取るか |
| testでの時刻の進め方（O12） | Guava `FakeTicker`・Noda Time `FakeClock`：testが明示的に進める（自動増分も可） | Go `synctest`：bubble内の全goroutineが待ちに入ったときだけ偽の時計を進める | 待ちを含む並行codeをtestするか |
| 誤りの通知（O13） | Noda Time・Temporal：例外（欠落と重複で例外の型を分ける／`RangeError`） | Luxon：既定は無効値の伝播、`throwOnInvalid`で例外化 | data由来の誤りとprogrammer由来の誤りを分けるか |

## 見つからなかったこと・gap
- 業務上の締め（営業日、締め日が休日のときの繰り延べ、会計期間の境界）の設計は、6 repoのどれにも見当たらなかった。見つかったのは、暦日の始まりの瞬間を求める部品（P31-O05）までである。
- 複数の機械の間の時計のずれ（clock skew）を扱う設計文書は、6 repoとも見つからなかった。GoとGuavaの単調時計はprocess内の測定に限ると明記されている（P31-O10）。機械をまたぐ期限やleaseは、P08-O08（DBの時刻と単調時計の組合せ）で扱った範囲に留まる。
- 期限（deadline）を永続化して別processで判定する方式（壁時計で保存し、単調時計で待つ等）を説明した文書は、読んだ範囲になかった。
- うるう秒は、Temporal（`docs/timezone.md` 行30、https://github.com/tc39/proposal-temporal/blob/e8cc03fc970a65a3359e8870e3b35e687ac94e55/docs/timezone.md#L29-L30）とGo（`src/time/time.go` 行7–8、https://github.com/golang/go/blob/6f5c275ebdc454197fff5f1496521c8f81e20eef/src/time/time.go#L5-L8）が無視すると書いている。うるう秒を扱う側の設計（tzの`leapseconds`系）は読んでいない。
- Temporalの`'compatible'`がmoment.js等と同じ挙動だという記述（`docs/timezone.md` 行197）は、各libraryの実装で確かめていない。Luxonの文書は重複時の挙動を未定義としており（P31-O04）、この記述との関係は確認していない。
- tz dataの更新を、稼働中のprocessへ再起動なしに反映する仕組みは、Noda Timeの`FromStream`（新しいsourceを作る）以外に見当たらなかった。既存のzone objectを差し替える手順は読んでいない。
- ADR形式の設計記録は、6 repoとも見当たらなかった。判断の根拠はdoc comment、文書、issueにあった（例外：Noda Timeの#295、Goの#12914）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し（golang/goとgoogle/guavaはsparse checkout）、固定commitをcheckoutした（`core.hooksPath`を無効化）。読むだけで、build・test・script・hook・package managerは実行していない。issue・PRは`gh api`で読んだ。
- proposal-temporal：`docs/README.md`（1–140、198–201）、`docs/timezone.md`（全体）、`docs/zoneddatetime.md`（1–75）、`docs/now.md`（1–60）、`docs/cookbook.md`（205–235）、`docs/cookbook/localTimeForFutureEvents.mjs`（全体）、`polyfill/lib/ecmascript.mjs`（1405–1480、1870–1935）。issue #3323（本文とcomment）、#603（本文）、#1568（題名と状態のみ）、PR #1367（状態のみ）。読んでいないもの：`spec/`（仕様本文）、`polyfill/lib/now.mjs`、`docs/instant.md`・`plaindatetime.md`の本文、`meetings/`。
- nodatime：`src/NodaTime/IClock.cs`、`SystemClock.cs`、`ZonedClock.cs`（1–60）、`DateTimeZone.cs`（285–330）、`TimeZones/Resolvers.cs`（全体）、`TimeZones/ZoneLocalMapping.cs`（1–60）、`TimeZones/TzdbDateTimeZoneSource.cs`（28–182、340–420）、`src/NodaTime.Testing/FakeClock.cs`（全体）。issue #295（本文）、PR #365（merge状態のみ）。読んでいないもの：user guide（別repositoryのnodatime.org）、`NodaTime.TzdbCompiler`、`data/`の中身、`LocalDateTime`・`Instant`の本体。
- eggert/tz：`theory.html`（300–400、609–640、1279–1345）、`tz-link.html`（18–22、215–232、276–330）、`backward`（1–30）、`LICENSE`（冒頭）。読んでいないもの：`NEWS`の本文、`zic.c`・`localtime.c`等のコード、`leapseconds`系、`backzone`、`CONTRIBUTING`。
- golang/go：`src/time/time.go`（1–175、1198–1223、1716–1734）、`src/time/zoneinfo.go`（640–714）、`src/time/zoneinfo_read.go`（531–569）、`src/time/zoneinfo_unix.go`（21–33、60–65）、`src/time/zoneinfo_goroot.go`（全体）、`src/time/tzdata/tzdata.go`（1–40）、`src/testing/synctest/synctest.go`（1–140）。issue #12914（本文の冒頭）。読んでいないもの：`src/runtime/time.go`等のruntime側、`synctest`のruntime実装、Unix以外の`zoneinfo_*.go`、golang/proposalの設計文書。
- luxon：`src/settings.js`（全体）、`src/datetime.js`（105–165、625–645、785–820、1180–1196。`wasHole`・`Settings.now()`・`overrideNow`はgrepで該当行だけ）、`src/interval.js`（140–165）、`docs/zones.md`（20–75、180–260）、`docs/validity.md`（全体）。読んでいないもの：`src/zones/IANAZone.js`、`src/impl/`の大半、`docs/math.md`。
- guava：`guava/src/com/google/common/base/Ticker.java`（全体）、`Stopwatch.java`（1–145）、`guava-testlib/src/com/google/common/testing/FakeTicker.java`（全体）。読んでいないもの：`com.google.common.time`系（存在を確認していない）、`Stopwatch`のtest。
- 検索した語：`disambiguat`、`ambigu`、`offset`、`persist`、`future`、`now`、`overrideNow`、`wasHole`、`throwOnInvalid`、`monoton`、`LoadLocation`、`tzdata`、`backward`、`stab`、`announce`、`release`。GitHub issue検索：proposal-temporalで「Now mock／fake／testing clock」「Temporal.now test」「mocking」、luxonで「ambiguous DST」（該当なし）、nodatimeで「LenientResolver」。
- 選ばなかった候補：moment/moment（luxonと同じ組織で、luxonの方が文書が新しいため）、java.timeのsource（openjdk/jdkはGPL-2.0 with Classpath exceptionで、規模が大きいため今回は読んでいない。#3323が`InstantSource`に言及していることだけ確認した）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：仕様の提案の説明文書（Temporal docs）、reference実装（Temporal polyfill）、libraryのdoc commentとコード（Noda Time、Go、Luxon、Guava）、data提供側の設計文書（tz）が混在する。Goのdocの探索順とコードの試行順が異なる例（P31-O08）のように、文書と実装が食い違うときの由来の区別が未決。
- scope：観察は日時libraryとdataの境界に限る。HELIXのD03で、どの層（値の型、保存形式、job、test基盤）へ対応させるかは未決。P08（scheduler）と本書の境界（毎日同じ壁時計に動くjobの欠落・重複）の扱いも未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。tzdbは版名（release名）を持ち、Noda TimeはそれをAPIで返す。観察の版をcommit SHAで持つか、data・製品のrelease版で持つかは未決。open のissue・PR（Temporal #603、PR #1367）は、後で状態が変わりうる。
- license：proposal-temporalとeggert/tzはSPDXが`NOASSERTION`で、LICENSEの冒頭の文言を併記した。記録の仕方は未決。
- 状態：全観察（P31-O01〜O13）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
