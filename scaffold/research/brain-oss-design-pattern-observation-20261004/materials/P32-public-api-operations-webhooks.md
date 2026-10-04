# P32 外部へ公開するAPIの運用（webhookの署名・再送・重複、廃止予定の告知、SDK生成と破壊的変更の検出、changelog）の観察（D05 API / Integration）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、timeout、期間、回数、寸法等）は持ち込まない。技術選定・採用推奨ではない。
値の線引き：既定の挙動（非数値。例：省略時にどの既定を使うか、どの状態を対象から外すか）は書くが、数値の既定値・期間・回数・上限は、出典に書かれていても写さない。実際の秘密鍵、署名、tokenの例も写さない。

埋めるgap：[D05](../../brain-domain-material-inventory-20261004/materials/D05-api-integration.md) §4「外部へ公開するAPIの運用（利用者への告知、SDK、portal、webhookの署名・再送）」。P10（API style・版・rate limit）で読んだ箇所（stripe/openapiの版とwebhook endpointの版固定、K8sのdeprecation policy、Kongのfield deprecation等）とは重ねていない。portal（開発者向けの公開サイト）は、今回読んだrepositoryに実装がなく、§gapに回した。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| standard-webhooks/standard-webhooks | https://github.com/standard-webhooks/standard-webhooks | 7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b（default branch: main） | Apache-2.0 | false | 2026-10-05 | 送信側・受信側の両方に向けたwebhookの規約（署名対象、header、再送、status codeの扱い、SSRF）を1つの仕様文書に置き、参照実装のlibraryを同じrepoに持つ |
| ietf-wg-httpapi/deprecation-header | https://github.com/ietf-wg-httpapi/deprecation-header | 9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51（main） | NOASSERTION（`LICENSE.md`冒頭は「# License」の見出しと、contribution guidelinesを参照せよという文だけで、license名は書かれていない） | true | 2026-10-05 | 廃止予定を実行時に伝える`Deprecation` header、`deprecation` link relation、`Sunset` headerとの関係を定めるIETF HTTPAPI WGのInternet-Draftの作業repo。固定commitの本文はeditor's copy（最終commitはdraft 09をRFC editorへ送る変更）で、RFCとして公開された本文は本repoにない |
| svix/svix-webhooks | https://github.com/svix/svix-webhooks | 88f4352aabb830711af77b5403bbeedfc6372fab（main） | MIT | false | 2026-10-05 | Standard Webhooksと同じ署名方式で送る送信側server（Rust）。header名は設定で切り替える（既定は`svix-*`、`whitelabel_headers`が真のとき`webhook-*`）。再送、endpointの無効化、鍵のrotation、一括回復、SSRF対策が実装として読める |
| stripe/stripe-node | https://github.com/stripe/stripe-node | fe645f63d645011aca38dff9e245c1cf7b9ae60e（master） | MIT | false | 2026-10-05 | 独自形式の署名header（Standard Webhooksと異なる）を検証する受信側SDK。thin event通知、SDKの版とAPI版の固定、changelogでの破壊的変更の印が同じrepoにある |
| oasdiff/oasdiff | https://github.com/oasdiff/oasdiff | 96875ca35b275a88233fdad19af86820a5f1bfdb（main） | Apache-2.0 | false | 2026-10-05 | 2つのOpenAPI文書の差から破壊的変更とchangelogを作るtool（Go）。deprecated・`x-sunset`・安定度・semverの版番号を検査規則として持つ |
| OpenAPITools/openapi-generator | https://github.com/OpenAPITools/openapi-generator | 099d598b7f10bc671a8bedb6e55ac7851fc904ee（master） | Apache-2.0 | false | 2026-10-05 | OpenAPIから多言語のSDK（client）を生成するtool（Java）。template解決順、利用者による上書き、再生成時の保護（ignore file）、生成物の記録（`.openapi-generator/FILES`）が読める |

（P10で読んだstripe/openapiは今回読んでいない。stripe-nodeはP10と別のrepoで、webhook検証とSDKの版の箇所だけを読んだ。）

## 観察

### P32-O01 署名の対象にmessage id・送信時刻・本文を含め、複数の署名を並べて鍵を無停止で切り替える
- 出典：
  - standard-webhooks、`spec/standard-webhooks.md` 行131–143（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L131-L143）、行163–165（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L163-L165）、行203–217（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L203-L217）
  - svix-webhooks、`server/svix-server/src/worker.rs` 行174–196（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L174-L196）、行291–331（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L291-L331）、`server/svix-server/src/core/message_app.rs` 行187–201（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/message_app.rs#L187-L201）、`server/svix-server/src/v1/endpoints/endpoint/secrets.rs` 行41–92（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/endpoint/secrets.rs#L41-L92）
  - 信頼性ラベル：primary（公式source repositoryの仕様文書とコード）。本文確認：済
- 何をしているか：
  - 仕様は、webhookのmetadataとして「送信の試行の時刻」と「eventに付く一意な識別子」を挙げ、安全な署名方式は本文とこの2つの両方を検証すべき（should）と書く。署名する内容は、id・timestamp・本文を`.`で連結したもの（`msg_id.timestamp.payload`）である。idとtimestampは利用者が制御できないようにし、少なくとも`.`を含ませないことが重要だと書く。
  - 試行の時刻は再送のたびに更新され、eventの発生時刻とは別である。idは再送しても変わらない。
  - headerは`webhook-id`・`webhook-timestamp`・`webhook-signature`の3つで、`webhook-signature`は空白区切りの署名の列である。列にしている理由として、仕様は鍵の無停止のrotation（漏洩時など）を挙げる。新旧の鍵で両方に署名して送り、受信側はどれか1つが一致するまで試せばよい、と書く。
  - Svixの`sign_msg`は、`{msg_id}.{timestamp}.{body}`を、endpointの有効な鍵それぞれで署名し、鍵の種別に応じた版識別子を付けて空白で連結する。`prepare_dispatch`は、試行を作る時点の時刻で署名し、同じ時刻をheaderに入れる。
  - Svixの署名方式はStandard Webhooksと同じで、header名は設定で切り替える。`generate_msg_headers`は、`whitelabel_headers`が真のときだけ`webhook-id`・`webhook-timestamp`・`webhook-signature`を使い、偽なら`svix-id`・`svix-timestamp`・`svix-signature`を使う（`worker.rs` 行219–227、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L219-L227）。設定の既定は偽で、commentは既定を`Svix-`接頭辞と書く（`config.default.toml` 行99–100、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/config.default.toml#L99-L100）。
  - `valid_signing_keys`は、現在の鍵に、失効時刻を過ぎていない旧鍵を加えて返す。`rotate_key`は、現在の鍵を「現在時刻＋猶予期間」で失効する旧鍵へ移し、新しい鍵（指定がなければ生成）を現在の鍵にする。未失効の旧鍵が上限を超える場合は、`limit_reached`のbad requestを返す。
- 解いている問題と前提：webhookは送信元の分からないHTTP requestとして届くので、受信側は本文の改竄と、捕捉したrequestの再送（replay）を区別したい。鍵の切替の間も配送を止めない。送信側と受信側が鍵を共有するか、受信側が送信側の公開鍵を信頼できることが前提である。
- 必要な入力：署名に含めるmetadataの集合、id・timestampに許す文字、鍵のrotationの猶予期間と旧鍵の数の上限（値は持ち込まない）。
- trade-off・失敗の仕方：
  - 仕様は、送る本文と署名した本文が1byteでも違えば検証が失敗すること、受信側がJSONとしてparseして再serializeすると失敗する、という失敗の型を挙げている（行165）。
  - Svixの`rotate_key`は旧鍵の数に上限を設け、超えたrotationを拒否する。短い間に繰り返しrotationすると、旧鍵の失効を待つまで切り替えられない。
- 反例・適用しない場合：stripe-nodeが検証するStripeの形式は、署名する内容が`{timestamp}.{payload}`で、message idを含まない（P32-O03）。
- 互換・非互換：P32-O02（署名の版識別子）、P32-O03（受信側の検証）、P32-O05（idを重複排除のkeyに使う）と組み合わさる。
- 限界：猶予期間・旧鍵の上限の値は持ち込まない。Svixの鍵の暗号化保存（`cfg.encryption`）は読んでいない。

### P32-O02 署名方式（対称・非対称）を署名ごとの版識別子で区別し、鍵の表示形式に接頭辞を付ける
- 出典：standard-webhooks、`spec/standard-webhooks.md` 行167–201（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L167-L201）、`libraries/javascript/src/index.ts` 行39–62（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/libraries/javascript/src/index.ts#L39-L62）、行96–103（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/libraries/javascript/src/index.ts#L96-L103）。svix-webhooks、`server/svix-server/src/worker.rs` 行184–194（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L184-L194）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、対称（HMAC-SHA256）と非対称（ed25519）の両方を許し、consumerごと、または同じconsumerでも切り替えてよいとする。署名には版識別子（対称は`v1`、非対称は`v1a`）を前置する。
  - 鍵を利用者に見せるときは、種別ごとの接頭辞を付けたbase64で表す（対称の秘密鍵、非対称の秘密鍵、非対称の公開鍵で接頭辞が異なる）。理由として、形式が一意なら、実装が追加の設定なしに正しい方式を選べ、鍵を想定どおりに使えることを挙げる。
  - 仕様の追加の考慮事項は、対称の鍵はendpointごとに一意にすべき（should）、非対称を優先すべき（prefer）、受信側は公開鍵と方式の信頼listを持ち、requestの追加headerから読んだ公開鍵を信頼しないこと、を挙げる。
  - JavaScriptの参照実装`Webhook`は、接頭辞があれば除いてbase64 decodeする（`format: "raw"`を指定した場合はそのまま使う）。`verify`は、署名の列のうち版識別子が`v1`のものだけを比較し、それ以外の識別子は読み飛ばす。この実装の範囲では、`v1a`（非対称）の検証は行われない。
  - Svixの`sign_msg`は、鍵の種別（`Hmac256`／`Ed25519`）から`v1`／`v1a`を選んで前置する。
- 解いている問題と前提：方式を後から追加・移行しても、既存の受信側が知らない識別子を無視して動き続けられるようにする。
- 必要な入力：方式の集合と識別子、鍵の表示形式、受信側が受け入れる方式の信頼list。
- trade-off・失敗の仕方：仕様は、対称の鍵は送受信双方の安全を自分で管理できない場合に非対称を勧め、非対称は対称よりCPU負荷が高くなりうる（can be more CPU intensive）と書く（行181–190、https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L181-L190）。受信側の実装が知らない識別子を読み飛ばす作りでは、送信側が非対称だけで署名すると、その受信側では一致する署名がなく失敗になる（JavaScript実装の`verify`は、一致がなければ`No matching signature found`を投げる。行117、https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/libraries/javascript/src/index.ts#L117-L117）。
- 反例・適用しない場合：stripe-nodeの検証は、headerの`t=`と、期待するscheme名のkeyだけを拾う。scheme名は`EXPECTED_SCHEME`（`v1`）で固定され、検証の経路から引数として変えられない（`Webhooks.ts` 行241、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L241-L241、行259、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L259-L259、行511、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L511-L511）（P32-O03）。
- 互換・非互換：P32-O01（複数署名の列）の上に成り立つ。
- 限界：鍵長の範囲は持ち込まない。他言語の参照実装（Go、Python等）が`v1a`を検証するかは読んでいない。

### P32-O03 受信側の検証：生の本文、定数時間比較、時刻の許容幅と、その検査の順序
- 出典：
  - standard-webhooks、`spec/standard-webhooks.md` 行227–234（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L227-L234）、`libraries/javascript/src/index.ts` 行71–118（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/libraries/javascript/src/index.ts#L71-L118）、行136–150（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/libraries/javascript/src/index.ts#L136-L150）
  - stripe-node、`src/Webhooks.ts` 行335–340（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L335-L340）、行342–420（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L342-L420）、行444–502（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L444-L502）、行504–532（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L504-L532）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、対称署名の比較に定数時間の比較関数を使うこと（使わないとtiming攻撃で署名のoracleになりうる）、`webhook-timestamp`が現在時刻から許容幅の中にあることの検証（replay対策）を挙げる。
  - JavaScript実装の`verify`は、headerの名前を小文字に正規化し、3つのheaderのどれかがなければ失敗する。次に`verifyTimestamp`で時刻を検査する（parseできない、古すぎる、未来すぎる、のいずれも失敗）。その後、署名を計算して、受け取った署名の列と`timingSafeEqual`で比較する。一致すれば、既定ではJSONとしてparseして返す（`jsonParse: false`なら返さない）。
  - stripe-nodeの`verifyHeader`は、header文字列を`,`で分け、`t=`の値と期待するschemeの値を集める（`parseHeader`）。本文がstringでもbyte列でもない場合（parse済みのobjectなど）は`suspectPayloadType`として印を付ける。`validateComputedSignature`は、まず署名の一致を`secureCompare`で調べ、一致がなければ、payloadの型が疑わしい場合と、そうでない場合とで別の説明（生の本文を渡しているか、転送で本文が変わっていないか、secretに空白が含まれていないか）を付けて失敗させる。署名が一致した後で、受信時刻（`receivedAt`の指定がなければ現在時刻）とheaderの時刻の差を、`tolerance`が正の場合だけ検査する。この検査は「古すぎる」側だけで、未来側の検査は今回読んだ行にない。
- 解いている問題と前提：署名の検証が通る前に本文を信頼しない。改竄と古いrequestの再送を区別する。受信側の時計が合っていることが前提である（standard-webhooksの`skills/receiving-webhooks/SKILL.md` 行126–136、https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/skills/receiving-webhooks/SKILL.md#L126-L136 は、時計のずれを検証失敗の原因の1つに挙げる）。
- 必要な入力：生の本文（parse前のbyte列）、署名header、secret、許容幅（値は持ち込まない）、受信時刻の基準。
- trade-off・失敗の仕方：
  - 2つの実装で、時刻と署名の検査の順序が逆である（standard-webhooksは時刻が先、stripe-nodeは署名が先）。時刻の検査が片側か両側かも異なる。
  - stripe-nodeは、失敗の説明に原因の候補（parse済みobjectを渡した、転送で整形が変わった、secretの空白）を入れる。standard-webhooks実装の失敗messageは原因の候補を含まない。
- 反例・適用しない場合：stripe-nodeの`constructEventWithoutVerification`は、検証済みの入力や信頼できる経路（cloud providerのevent基盤等）から来た本文を検証なしに組み立てる経路として、別に用意されている（`src/Webhooks.ts` 行99–107、200–202。https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L99-L107 、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L200-L202）。
- 互換・非互換：P32-O01（署名対象）、P32-O04（許容幅の省略時の扱い）。
- 限界：許容幅の値は持ち込まない。`timingSafeEqual`と`secureCompare`の実装本体は読んでいない。

### P32-O04 時刻の許容幅を「省略」「0」で指定したときの意味を版で変え、その変更を破壊的変更として告知する
- 出典：stripe-node、`CHANGELOG.md` 行36–40（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L36-L40）、`src/Webhooks.ts` 行137–172（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L137-L172）、行240–287（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L240-L287）、行422–443（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L422-L443）、`src/stripe.core.ts` 行1686–1717（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/stripe.core.ts#L1686-L1717）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 23.0.0のchangelogは、⚠️の印を付けた項目として次を記録している。`verifyHeader`／`verifyHeaderAsync`は、以前は`tolerance`を省略すると時刻の検査を飛ばしていたが、既定の許容幅を使うようにした。`constructEvent`に0を渡すと時刻の検査を飛ばすようにした（以前は0でも既定の許容幅で検査していた）。
  - 固定commitのコードでは、`constructEvent`と`verifyHeader`は`tolerance ?? Webhook.DEFAULT_TOLERANCE`で既定を補う（`??`は省略・nullのときだけ既定に置き換え、0はそのまま渡す）。`validateComputedSignature`のdoc commentは、0で時刻の検査を飛ばすと書き、この関数は主にtestやoffline処理向けで、届いた順に処理する統合は`constructEvent`を使うべきだと書く。
  - 一方、thin event通知を検証する`parseEventNotification`は、`tolerance || this.webhooks.DEFAULT_TOLERANCE`で既定を補う（行1711）。`||`は0も既定に置き換えるので、この経路では0を渡しても時刻の検査は飛ばない。changelogの記載は`verifyHeader`と`constructEvent`だけを挙げており、`parseEventNotification`には触れていない。
- 解いている問題と前提：省略時の既定を「検査しない」にしておくと、利用者が気づかずにreplay対策を外してしまう。既定を安全側へ変えることは、旧版で検査なしに通っていた入力を落とすので、利用者に告知が要る。
- 必要な入力：引数の「省略」と「0」をそれぞれ何と解釈するか、既定の許容幅（値は持ち込まない）、変更を利用者へ知らせる経路（changelogの印、major版）。
- trade-off・失敗の仕方：同じ`tolerance`引数でも、`constructEvent`（0で検査を飛ばす）と`parseEventNotification`（0でも既定で検査する）で解釈が分かれている。これは今回読んだ行の範囲での観察で、意図した差か、報告されたissueがあるかは確認していない。
- 反例・適用しない場合：standard-webhooksのJavaScript実装は、許容幅を定数として持ち、`verify`の引数で変えられない（P32-O03）。
- 互換・非互換：P32-O03（検査の順序）、P32-O14（changelogの⚠️とmajor版）。
- 限界：許容幅の値は持ち込まない。PR #2876の本文と議論は読んでいない。

### P32-O05 重複の排除を誰が担うか：受信側はidを冪等keyに使い、送信側は投入時のevent idを一意にする
- 出典：
  - standard-webhooks、`spec/standard-webhooks.md` 行133–137（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L133-L137）、行234（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L234-L234）、`skills/receiving-webhooks/SKILL.md` 行22–30（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/skills/receiving-webhooks/SKILL.md#L22-L30）、行75–77（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/skills/receiving-webhooks/SKILL.md#L75-L77）
  - svix-webhooks、`server/svix-server/src/v1/endpoints/message.rs` 行333–341（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/message.rs#L333-L341）、行430–459（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/message.rs#L430-L459）、`server/svix-server/src/core/idempotency.rs` 行1–11（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/idempotency.rs#L1-L11）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、idが「失敗して再送されても変わらない」ので冪等keyとしてよく使われ、consumerは悪意・誤り・network障害で複数回届いても1回だけ処理できる、と書く。検証の考慮事項として、`webhook-id`を冪等keyとして使い、同じwebhookを誤って2回以上処理することを防ぐ、を挙げる（保存先と期間の例が書かれているが、値は持ち込まない）。
  - JavaScriptの参照実装`verify`（P32-O03）は、idを読むが、保存や既読の判定はしない。重複排除は受信側の実装に残る。
  - 同repoの`SKILL.md`（受信側向けの手引き）は、公式libraryが署名と時刻の許容幅を検証し「replay攻撃から守る」と書く。今回読んだJavaScript実装の範囲では、replay対策は時刻の許容幅の検査に限られ、許容幅の中での同じidの再送は検出しない。手引きの記述と実装の範囲がどう対応するか（許容幅の検査だけを指しているか）は、本文からは決められない。
  - 送信側のSvixは、message作成APIのdoc commentで、任意の`eventId`は一定期間だけ一意性を検証し、同じ`eventId`のmessageが環境内のどのapplicationにでも既にあれば（any application in your environment）409 conflictを返す、と書く（期間の値は持ち込まない）。作成はmessageと本文を1つのDB transactionで挿入し、一意制約の違反を`http_error_on_conflict`でconflictに変える。transactionの後で、配送対象のendpointがあれば、配送taskをqueueへ送る。
  - Svixは、API全体に`Idempotency-Key`のmiddlewareを持つ。module docは、同じkeyのrequestには、cacheした最初のresponseを返すと書く。
- 解いている問題と前提：at-least-onceの配送（P32-O06）では、受信側に同じeventが複数回届く。送信側では、利用者がmessage作成APIを再試行すると、同じeventが二重に投入されうる。
- 必要な入力：受信側で既読idを保持する場所と期間、送信側で一意性を検証する範囲と期間（値は持ち込まない）、一意性の違反を呼出し側へどう返すか。
- trade-off・失敗の仕方：Svixの`eventId`の一意性は期間を限ったもので、doc commentは、期間を過ぎると検証しないと書く。受信側の既読idの保持にも期間があり、どちらも期間の外の重複は防がない。
- 反例・適用しない場合：stripe-nodeの受信側の検証（P32-O03）は、署名対象にidを含まず、今回読んだ範囲に既読idの管理はない。stripe-nodeの`Idempotency-Key`（`src/RequestSender.ts`）はAPI呼出し側の再試行のためのもので、webhookの受信とは別である（本文は読んでいない）。
- 互換・非互換：P32-O01（idは署名対象に入っているので、受信側はidを信頼してkeyにできる）、P32-O06（再送）、P32-O07（手動再送・一括回復でも同じidが再び届く）。
- 限界：保持期間・cacheの期間は持ち込まない。Svixのmessageの一意制約の定義（migration）は読んでいない。

### P32-O06 配送の成功判定、再送の予定表、`Retry-After`とjitter
- 出典：
  - standard-webhooks、`spec/standard-webhooks.md` 行248–256（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L248-L256）、行273–286（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L273-L286）
  - svix-webhooks、`server/svix-server/src/worker.rs` 行377–427（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L377-L427）、行500–545（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L500-L545）、行548–633（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L548-L633）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、2xxの応答だけを成功とし、それ以外（2xx以外のstatus、timeout、接続のresetなど）を失敗とする。再送は送信側の責任で、成功するか配送不能と判断するまで続ける。指数backoffの予定表と、ランダムなjitterの付加を推奨する（例の予定表の値は持ち込まない）。
  - status codeの扱いとして、仕様は次を提案する（suggested）。3xxは失敗とし、redirectを追うより宛先URLの更新を勧める。410 Goneは受信側がもう受け取りたくない印なので、endpointを無効にして送信を止めるべき（should）。429と502・504は、送信を絞ること（throttle）を勧める。`retry-after` headerがあれば、次の試行の予定に考慮すべき（should）。
  - Svixの`make_http_call`は、応答のstatusが成功（2xx）なら成功、それ以外は失敗とし、失敗のときは`Retry-After`をparseして持ち回る。network errorも失敗として記録する（status codeは0）。
  - `handle_failed_dispatch`は、試行回数が設定`retry_schedule`の長さより小さければ、その段の待ち時間から次の時刻を計算し、試行回数を1つ増やしたtaskを遅延付きでqueueへ送る。尽きていれば次の試行を作らない（P32-O07）。
  - `calculate_retry_delay`は、errorの型がtimeout、またはHTTP errorの型で429の場合に、待ち時間を下限で底上げすると書かれている。`Retry-After`があれば、その値を段の待ち時間の一定倍の範囲に収める（`limit_retry_delay`）。最後に上下一定割合のjitterを掛ける。
- 解いている問題と前提：受信側の一時的な障害から自動で回復し、同時に、受信側の過負荷を再送で悪化させない。送信側が、試行ごとの結果（status、本文の一部、所要時間）を記録できることが前提である。
- 必要な入力：成功とみなすstatusの範囲、再送の予定表、`Retry-After`をどこまで信じるかの上限、jitterの幅、受信側の過負荷を示すstatusの集合（値は持ち込まない）。
- trade-off・失敗の仕方：
  - 仕様は410を「endpointを無効にする」印として挙げるが、Svixの`make_http_call`は2xx以外を一律に失敗として扱い、今回読んだ`worker.rs`の範囲では410を特別に扱う分岐は見当たらなかった。
  - Svixの`make_http_call`は、2xx以外の応答を`Error::generic`で包んで`FailedDispatch`へ渡す。`Error::generic`は`ErrorType::Generic`を作る（`error.rs` 行38–41、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/error.rs#L38-L41）。このため、2xx以外の応答（429を含む）は、`calculate_retry_delay`の`ErrorType::Http`で429を判定する分岐に当たらない。この分岐の待ち時間の底上げが効くのは、timeoutの型と、`ErrorType::Http`として渡される経路だけである（後者がどこで作られるかは読んでいない）。
  - 予定表を使い切るまで、同じeventが繰り返し届く。受信側は重複を前提にする必要がある（P32-O05）。
- 反例・適用しない場合：stripe-nodeは受信側SDKで、再送の制御はStripe側にあり、本repoにはない。
- 互換・非互換：P32-O05（重複の排除）、P32-O07（尽きた後の扱い）。P08-O11（job queueのretry・backoff）と同じ形の問題を、HTTPの宛先に対して解いている。
- 限界：予定表の段数・待ち時間、jitterの割合、下限、`Retry-After`の上限倍率は持ち込まない。Svixのredirectの追従の有無は読んでいない。

### P32-O07 恒常的な失敗：endpointの自動無効化、運用者向けの通知webhook、手動再送と期間指定の一括回復
- 出典：
  - standard-webhooks、`spec/standard-webhooks.md` 行256（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L256-L256）、行311–325（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L311-L325）
  - svix-webhooks、`server/svix-server/src/worker.rs` 行101–172（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L101-L172）、行447–498（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L447-L498）、行634–708（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L634-L708）、行578–584（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L578-L584）、`server/svix-server/src/core/operational_webhooks.rs` 行95–110（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/operational_webhooks.rs#L95-L110）、行135–140（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/operational_webhooks.rs#L135-L140）、`server/svix-server/src/core/message_app.rs` 行124–159（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/message_app.rs#L124-L159）、`server/svix-server/src/v1/endpoints/endpoint/recovery.rs` 行24–87（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/endpoint/recovery.rs#L24-L87）、行110–158（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/endpoint/recovery.rs#L110-L158）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、長期間失敗し続ける場合に、別の経路（emailなど）で利用者へ通知することを重要（important）とし、以後のendpointへの配送を無効にすることを推奨する（recommended）と、2つを書き分けている。追加機能として、失敗したmessageの一覧と理由を見せること、特定のwebhookや期間の失敗を手動で再送させること、endpoint管理APIを挙げる。
  - Svixは、再送の予定表を使い切った後にだけ`process_endpoint_failure`を呼ぶ。cacheに「最初の失敗時刻」がなければ現在時刻を入れて無効化はしない。既にあり、設定の猶予期間を超えていれば無効化を返す。cacheの値には猶予期間より長い有効期限を付けており、commentは、ときどきの失敗では無効化されないためだと説明する（行128–129、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L128-L129。倍率は持ち込まない）。成功した配送は、このcacheの値を消す（`process_endpoint_success`）。commentは、`first_failure_at`は無効化した後にだけPostgresへ保存され、それまではcacheに有効期限付きで置かれる、と書く（行82–83、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/worker.rs#L82-L83）。
  - 無効化するときは、endpointの`disabled`と`first_failure_at`をDBへ書き、運用者向けの`endpoint.disabled`を送る。commentは、`first_failure_at`は無効化の後にだけPostgresへ保存され、それまではcacheにだけある、と書く。
  - 運用者向けの通知（operational webhook）は、`endpoint.disabled`、endpointの作成・更新・削除、`message.attempt.exhausted`・`failing`・`recovered`の種類を持つ。試行回数が一定に達した時点で`failing`を送り、その後に成功すると`recovered`を送る。送信先URLが設定されていなければ、何も送らない（行140）。
  - 配送対象の選び方（`filtered_endpoints`）は、無効・削除済みのendpointを常に除く。手動（`Manual`）の試行はevent typeとchannelの絞り込みを通らずに配送対象になるが、無効のendpointは手動でも除かれる。
  - `recover_failed_webhooks`は、pathで指定した1つのendpointについて、指定期間に失敗だけで成功のないmessageを取得する。queryはmsg_idで`distinct_on`・`order_by`し、cursorはmessage attemptのidで進めてbatch取得する（`recovery.rs` 行38–60、https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/v1/endpoints/endpoint/recovery.rs#L38-L60）。取得したものを`Manual`の試行としてqueueへ送る（期間と件数に上限がある。値は持ち込まない）。処理はbackgroundで行い、APIは202で実行中の状態を返す。
  - 手動の試行が失敗した場合は、次の試行を作らない（`handle_failed_dispatch`の最初の分岐）。
- 解いている問題と前提：受信側が長く止まっている間に再送を続けても配送できず、送信側の資源を消費する。止めた後に、受信側が回復してから取りこぼしを取り戻す手段が要る。
- 必要な入力：無効化までの猶予期間、失敗を「忘れる」期間、運用通知の送信先、一括回復の期間と件数の上限（値は持ち込まない）。
- trade-off・失敗の仕方：
  - 無効化の判定は「予定表を使い切った失敗」が猶予期間をまたいで続いたかで決まり、個々のstatus（410など）は判定に入らない（P32-O06）。
  - 最初の失敗時刻はcacheにあるので、cacheが消えると判定が最初からやり直しになる。
  - 一括回復で再送されたmessageは、受信側から見ると同じidの再配送である（P32-O05）。
- 反例・適用しない場合：endpointの再有効化の経路は今回読んでいない。
- 互換・非互換：P32-O06（予定表を使い切った後の段）、P32-O05。
- 限界：猶予期間、試行回数のしきい値、一括回復の上限は持ち込まない。

### P32-O08 thin payloadとfull payloadの選択、およびthin通知から本体を後で取得するSDKの経路
- 出典：standard-webhooks、`spec/standard-webhooks.md` 行75–115（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L75-L115）、行240–246（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L240-L246）。stripe-node、`src/Webhooks.ts` 行125–135（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/Webhooks.ts#L125-L135）、`src/stripe.core.ts` 行1629–1684（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/stripe.core.ts#L1629-L1684）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、payloadにfull（event時点の関連entityの全情報）とthin（影響を受けたentityの識別子と、変更の情報の一部だけ）の2つの取り方があり、二者択一ではない（thinに、よく使うfieldだけ足してよい）と書く。fullの利点は追加のAPI呼出しなしに情報が揃うこと。thinの利点として、性能、生成側の柔軟さ、将来への耐性（thinは後からfullにできるが逆はできない）、dataの流れの制御（thinでは利用者が明示的に取得するので、取得を監査でき制限できる）を挙げる。
  - event typeは、payloadの型（schema）を示し、同じevent typeのpayloadは常に同じschemaであるべき（should）とする。受信側がendpointごとに受け取るevent typeを選び、送信側で絞り込むことを推奨する。
  - stripe-nodeは、thin event通知（`object`が`v2.core.event`）と、従来のsnapshot event（`object`が`event`）を別の関数で受ける。`constructEvent`にthin通知を渡すと、`parseEventNotification`にsnapshotを渡すと、どちらもerrorにする。`_buildEventNotification`は、通知objectに`fetchEvent`（event本体の取得）と`fetchRelatedObject`（関連objectのURLの取得）を付ける。commentは、通知本文の`id`をpathに入れるときにencodeする理由を、pathやqueryの断片の注入を防ぐためだと書く。
- 解いている問題と前提：webhookで送るdataの量と、受信側がAPIで取得する量の配分を決める。thinの場合は、受信側がAPIの認証情報と取得の権限を持つことが前提である。
- 必要な入力：eventごとにpayloadへ含めるfield、event typeの命名と階層、受信側の取得APIと権限。
- trade-off・失敗の仕方：thinでは、受信側の取得時点の状態がevent時点と違いうる（仕様はこの点を書いておらず、本書の推論である）。stripe-nodeは、2種類のpayloadを取り違えた呼出しをerrorにして、取り違えを早く見つける。
- 反例・適用しない場合：P10-O08のstripe/openapiでは、snapshotのeventは生成時のAPI版で描画される。thin通知が版とどう関係するかは今回読んでいない。
- 互換・非互換：P32-O05（thin通知でもidで重複を判定する）。
- 限界：payloadの大きさの推奨値は持ち込まない。

### P32-O09 利用者が登録する宛先URLへの送信でのSSRF対策
- 出典：standard-webhooks、`spec/standard-webhooks.md` 行300–306（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L300-L306）、行292–298（https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L292-L298）。svix-webhooks、`server/svix-server/src/core/webhook_http_client.rs` 行140–148（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/webhook_http_client.rs#L140-L148）、行211–235（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/webhook_http_client.rs#L211-L235）、行600–660（https://github.com/svix/svix-webhooks/blob/88f4352aabb830711af77b5403bbeedfc6372fab/server/svix-server/src/core/webhook_http_client.rs#L600-L660）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 仕様は、webhookは利用者が任意のURLを登録でき、内部のwebhook基盤から呼ばれるため、SSRFに特に弱いと書く。主な対策として、内部IPを除外するproxyを通すことと、webhook worker（またはproxy）を内部serviceへ届かないprivate subnetに置くことの2つを挙げる。ほかに、HTTPSの強制（署名は改竄を防ぐが暗号化はしない）と、固定の送信元IP（受信側のfirewall向け）を運用上の考慮として挙げる。
  - Svixは、送信の直前に、URLのhostがIP literalなら、許可されないIPで、設定のwhitelist subnetにも含まれないものを`BlockedIp`で拒否する（`blocked_ip`）。hostが名前の場合は、DNS resolver（`NonLocalDnsResolver`）が解決結果から許可されないIPを除き、whitelistのsubnetか名前に一致すれば残す。残りが空なら`BlockedIp`を返す。
- 解いている問題と前提：利用者が登録したURLを踏み台にして、送信側の内部networkやcloudのmetadataへ到達させる攻撃を防ぐ。
- 必要な入力：許可しないIPの範囲、例外として許可するsubnetと名前、proxyやnetworkの分離の構成。
- trade-off・失敗の仕方：Svixは、IP literalの検査とDNS解決の検査を別の場所に置いている。名前で登録されたURLは、解決のたびに検査される。whitelistに名前を入れると、その名前が解決するIPはすべて許可される（行654）。
- 反例・適用しない場合：受信側SDK（stripe-node）は宛先を持たないので、この問題は送信側だけにある。
- 互換・非互換：P32-O07（endpointの登録と管理API）。
- 限界：`is_allowed`の範囲の定義と、redirect時の再検査は読んでいない。

### P32-O10 廃止予定を実行時のresponse headerで伝える：`Deprecation`、`deprecation` link relation、`Sunset`
- 出典：ietf-wg-httpapi/deprecation-header、`draft-ietf-httpapi-deprecation-header.md` 行53–60（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L53-L60）、行70–96（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L70-L96）、行98–121（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L98-L121）、行123–136（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L123-L136）、行167–171（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L167-L171）、行223–250（https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L223-L250）。信頼性ラベル：primary（IETF WGの公式作業repoのdraft本文）。本文確認：済
- 何をしているか：
  - `Deprecation` response headerは、responseが示すresourceが廃止された、または廃止される日時を伝える。値はStructured FieldsのDateでなければならない（MUST）。日時は未来（その日に廃止される）でも過去（その日に廃止された）でもよい。
  - 廃止すること自体はresourceの振る舞いを変えない、と2箇所で書く（行57、136）。headerがあっても、resourceの意味や機能の変化を示すものではない。
  - scopeは、原則としてそのresponseのresourceだけである。resourceが文書化してscopeを広げてもよいが、その規則を知らない利用者には見えないこと、廃止の情報はhintにすぎず依存できないこと、client applicationは廃止の情報なしでも動くように作るべき（should）ことを書く。例として、API全体の廃止をhome documentだけに載せる形を挙げる。
  - `deprecation` link relationは、廃止の方針・移行の案内の文書を指す。`Deprecation` headerがなく、linkだけがある応答は「まだ廃止されていないが、廃止の方針がどこにあるか」を示す。方針の例として、廃止日の何日前から告知するか、廃止してから告知するか、を文書に書く形を挙げる（日数の値は持ち込まない）。
  - `Sunset` header（参照先のRFC 8594。本文は読んでいない）は、resourceが応答しなくなる見込みの時点を伝える。`Sunset`の時刻は`Deprecation`の時刻より前であってはならない（MUST NOT）。前になっている場合、client側の開発者はresourceの開発者に確認すべき（SHOULD）。2つのheaderの日付の書式は、歴史的な理由で異なると注記している。
  - security considerationsは、`Deprecation`をhint（保証ではない）として扱うべき（should）とし、過去の日付の場合、client側の開発者は以前と同じ振る舞いが続くと仮定してはならない（MUST no longer assume）と書く。HTTPSでない場合、`Link` headerの内容は安全・完全性が保証されないと注意する。
  - 付録の実装状況には、同じ概念を独自header名や`Warning` headerで実装していた例が並ぶ（RFC化の際に削る節と明記。行177–179、https://github.com/ietf-wg-httpapi/deprecation-header/blob/9addc0a297d64d4d1b5fbd876a09f0f4e25f9d51/draft-ietf-httpapi-deprecation-header.md#L177-L179）。
- 解いている問題と前提：利用者が文書を読まなくても、実際の呼出しの中で廃止を知れるようにする。利用者のclientやtoolがheaderを読む（logに出す、警告する）ことが前提である。
- 必要な入力：廃止日、終了日（任意）、方針と移行案内の文書のURL、告知のscope（resource単位かAPI全体か）。
- trade-off・失敗の仕方：headerはhintであり、利用者がheaderを読まなければ届かない。scopeを広げる使い方は、その規則を知らない利用者には狭い意味で読まれる。
- 反例・適用しない場合：P10-O07のK8sは、`Deprecation`ではなく`Warning` headerと監査注釈・metricで廃止APIへの呼出しを知らせる。
- 互換・非互換：P32-O11（OpenAPI文書の`deprecated`・`x-sunset`は、同じ情報を設計時の文書に持つ）。
- 限界：本repoはarchivedで、固定commitの本文はeditor's copyである。RFCとして公開された最終本文との差は確認していない。`Sunset`のRFC本文は読んでいない。

### P32-O11 OpenAPI文書の`deprecated`と`x-sunset`から、削除の時期を機械で検査する
- 出典：oasdiff、`docs/DEPRECATION.md` 行1–57（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/DEPRECATION.md#L1-L57）、`checker/check_api_deprecation.go` 行47–155（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/checker/check_api_deprecation.go#L47-L155）、`checker/check_api_removed.go` 行28–116（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/checker/check_api_removed.go#L28-L116）、`checker/check_api_sunset_changed.go` 行17–98（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/checker/check_api_sunset_changed.go#L17-L98）、行118–131（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/checker/check_api_sunset_changed.go#L118-L131）、`checker/rules.go` 行170–193（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/checker/rules.go#L170-L193）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、OpenAPIの`deprecated` flagを付けることは破壊的変更ではなく、付けた後なら削除しても破壊的変更として扱わない、と書く。`x-sunset`拡張に削除予定日を書くと、その日以降の削除は破壊的変更でなく、それより早い削除は破壊的変更になる。
  - 猶予期間の強制（`--deprecation-days-stable`、`--deprecation-days-beta`）を指定すると、`x-sunset`が必須になり、廃止の時点から猶予期間以上先の日付でなければ、廃止そのものが破壊的変更として報告される（日数の値は持ち込まない）。安定度`draft`・`alpha`の猶予は0として扱われる（`getDeprecationDays`）。
  - `APIDeprecationCheck`の分岐順：`deprecated`が外れた（reactivated）ならINFO。安定度が不正なら別の検査に任せて飛ばす。`x-sunset`がない場合、猶予期間が正ならERR（sunset missing）、そうでなければINFO（endpoint deprecated）。日付をparseできなければERR。日付までの日数が猶予期間に満たなければERR。それ以外はINFO（deprecated with sunset）。
  - `checkAPIRemoval`の分岐順：`deprecated`でなければ「廃止なしの削除」（ERR）。`x-sunset`がなければ「廃止ありの削除」（INFO）。日付をparseできなければERR。今日が予定日より前なら「予定日前の削除」（ERR）。それ以外は報告しない。path全体の削除では、安定度`alpha`・`draft`の操作を対象から外す（行43）。
  - `rules.go`は、各検査IDに既定の水準（ERR／INFO）、変化の向き、領域、種類（lifecycle／existence）、効果を表の形で持つ。
  - `APISunsetChangedCheck`は、廃止済みの操作で`x-sunset`が消えた場合をERRにする。日付が変わった場合は、旧日付が新日付より後（前倒し）で、かつ新日付までの日数が猶予期間に満たない場合にERRにする。
- 解いている問題と前提：廃止の告知から削除までの段取りを、API定義文書の差分だけでCIの段階で検査する。API定義文書が実装と一致していることが前提である。
- 必要な入力：`deprecated`の印、削除予定日、安定度ごとの猶予期間、検査の時点の日付。
- trade-off・失敗の仕方：
  - 文書（`docs/DEPRECATION.md` 行31–33、https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/DEPRECATION.md#L31-L33）は、猶予期間を強制しない形でも「`x-sunset`を前の日付へ変えると破壊的変更になる」と書く。固定commitの`APISunsetChangedCheck`では、条件が「前倒し」かつ「新日付までの日数が猶予期間未満」で、猶予期間が0の場合は新日付が今日より前のときだけERRになる。文書の記述とコードの条件が一致する範囲は限られる（今回読んだ行の範囲での観察）。
  - 判定が実行時の日付（`time.Now()`）に依存するので、同じ差分でも検査する日によって結果が変わる。
  - 文書は、propertyの廃止は検出し日付も検査するが、廃止済みpropertyの削除は他のpropertyの削除と同じ扱いになる、と限界を書く（行57、issue #858を参照）。
- 反例・適用しない場合：P10-O04のAIPは、廃止期間を安定度を指定する時点で決める規則であり、文書の差分から日付を検査する仕組みではない。
- 互換・非互換：P32-O10（実行時のheaderで同じ情報を伝える）、P32-O12（水準の変更と安定度）。
- 限界：猶予期間の値は持ち込まない。parameter・propertyの廃止の検査（`RequestParameterDeprecationCheck`等）の本体は読んでいない。

### P32-O12 破壊的変更を3水準（ERR／WARN／INFO）で分類し、安定度・版番号・changelogへつなぐ
- 出典：oasdiff、`docs/BREAKING-CHANGES.md` 行1–5（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L1-L5）、行32–57（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L32-L57）、行59–64（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L59-L64）、行117–147（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L117-L147）、行154–180（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L154-L180）、行187–189（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/BREAKING-CHANGES.md#L187-L189）、`docs/STABILITY.md` 行1–38（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/STABILITY.md#L1-L38）、`docs/VERSIONING.md` 行1–53（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/VERSIONING.md#L1-L53）、`docs/CHANGELOG-TEMPLATE.md` 行10–35（https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/CHANGELOG-TEMPLATE.md#L10-L35）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 検査をERR（確実な破壊的変更）、WARN（機械では確定できない潜在的な破壊的変更）、INFO（非破壊）の3水準に分ける。`breaking`はERRとWARNだけを、`changelog`は指定水準以上を出す（既定はINFOで全件）。説明やexampleだけの編集は`changelog`に含めない。
  - 判定の基準は、serverが実際に受け付けるものではなく、OpenAPI定義が宣言する契約である。理由として、gatewayやvalidatorが非準拠のrequestを拒否し、生成されたSDKが型付きのcodeになってcompileが通らなくなることを挙げる。WARNは定義に判断材料が足りない場合に限り、一部の構成でだけ壊れる変更はERRにする、と書く。
  - 各検査の水準は、利用者がfileで変更・無効化できる。tool自身も、比較が厳密でない場合（`allOf`）や、仕様から誰も壊れないと分かる場合（`readOnly`等）は、検査の宣言より低い水準で報告し、理由をcommentに書く。利用者が水準を設定した検査は、この引下げを行わない。
  - 特定の変更をignore fileで除外できる。fileは任意のtext形式でよく、文書は、破壊的変更の記録を兼ねられると書く。
  - `x-extensible-enum`拡張を使うと、response（とcallback）のenumへの値の追加を許す。文書は、受信側が未知の値に既定の処理で対応する必要があると書く。
  - 安定度（`x-stability-level`：`draft`→`alpha`→`beta`→`stable`）で検査の対象を絞る。既定の閾値は`beta`で、`draft`・`alpha`は検査から外れる。印のないendpointは`stable`として常に含まれる。安定度の上げ下げも、離れる側の水準が閾値以上の場合に報告する。
  - semverの版番号（`info.version`）との照合：破壊的変更があるのにmajorが上がっていない場合を3つの検査IDで報告する。既定はINFOで、それだけではbuildを落とさない。報告するのは両方の版がsemverの場合だけで、どちらかがsemverでなければ（日付の版など）推測せず飛ばす（`VERSIONING.md` 行47、https://github.com/oasdiff/oasdiff/blob/96875ca35b275a88233fdad19af86820a5f1bfdb/docs/VERSIONING.md#L47-L47）。非破壊の変更にどの版上げが要るかは検査しない。
  - changelogのtemplateは、変更をendpoint単位またはsection単位にまとめ、各変更に本文・破壊的かどうか・commentを持たせる。
  - 既知の限界として、callbackの検査がない、と書く（行189）。
- 解いている問題と前提：API定義の変更を、利用者への影響の強さで仕分けて、CIで止める・changelogに載せる・版番号を上げる、の判断に使う。API定義が実装の正本であることが前提である。
- 必要な入力：base（前の定義）とrevision（新しい定義）、検査ごとの水準の方針、安定度の閾値、buildを落とす水準（`--fail-on`）、版番号の方式。
- trade-off・失敗の仕方：
  - 寛容なserverでは実際には壊れない変更もERRになる（文書が意図として明記）。
  - semverの照合は既定でbuildを落とさないので、方針として強制するには利用者が水準を上げる必要がある。
  - callbackの検査がないので、OpenAPIの`callbacks`で表したwebhookの契約の変更は、この範囲では検査されない（行189）。OpenAPI 3.1の`webhooks`の扱いは読んでいない。
- 反例・適用しない場合：P10-O03のAIP・P10-O07のK8sは、互換性の分類を規約の文書として人が適用する。oasdiffは同じ種類の分類を検査規則として機械で適用する。stripe-nodeは、response enumの値の追加を、SDKの型を弱める変更として扱いつつ破壊的とはしない方針を文書にしている（P32-O14）。
- 互換・非互換：P32-O11（廃止と削除）、P32-O13（SDK生成。oasdiffは、生成されたSDKのcompile失敗を判定基準の理由に挙げる）、P32-O14。
- 限界：検査の一覧（数百とされる）の個々は読んでいない。差分engine（`docs/DIFF.md`）は読んでいない。

### P32-O13 OpenAPIからのSDK生成：templateの解決順、利用者による上書きと追加、再生成で守るfileと生成物の記録
- 出典：openapi-generator、`docs/templating.md` 行10–27（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/docs/templating.md#L10-L27）、`modules/openapi-generator/src/main/java/org/openapitools/codegen/templating/GeneratorTemplateContentLocator.java` 行53–135（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/templating/GeneratorTemplateContentLocator.java#L53-L135）、`docs/customization.md` 行6–75（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/docs/customization.md#L6-L75）、行227–265（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/docs/customization.md#L227-L265）、`modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java` 行148–160（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L148-L160）、行199–223（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L199-L223）、行1357–1362（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L1357-L1362）、行1963–2051（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L1963-L2051）、`modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultCodegen.java` 行5003–5005（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultCodegen.java#L5003-L5005）、`modules/openapi-generator/src/main/resources/typescript-fetch/apis.mustache` 行109–119（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/resources/typescript-fetch/apis.mustache#L109-L119）、`docs/release-summary.md` 行6–16（https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/docs/release-summary.md#L6-L16）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 生成は、OpenAPI 2.0と3.xの文書を同じ内部modelへ正規化し、generator（言語ごとの変換logic）がmodelを加工して、templateへ適用する、という2段の構造である。
  - templateの解決は`GeneratorTemplateContentLocator`が行う。javadocは優先順を、(1) 利用者のtemplate dirのlibrary別folder、(2) 利用者のtemplate dir、(3) 組込みtemplateのlibrary別folder、(4) 組込みtemplate、と書く。コードはこの後に、(5) 追加の共有組込みtemplate dir（`additionalEmbeddedTemplateDirs`）を順に探す段を持ち、javadocの列挙にはこの段がない。解決結果はtemplate名ごとにcacheされる。
  - 利用者のtemplateは、既存のtemplateを上書きするだけで、新しいtemplateは作れない（templating.md 行27）。5.0.0以降は、設定fileの`files`で、追加のtemplateと出力名・種類（API、Model、SupportingFiles等）を指定できる。文書は、組込みと同じ出力先になる名前の違うtemplateを定義すると、重複や「後にcompileした方が上書きする」未定義の挙動になると書く（行75）。
  - 再生成で上書きしないfileを、出力dirの根の`.openapi-generator-ignore`（`.gitignore`に似た書式）で指定する。CLIで別のignore fileを指定した場合、読めなければ警告を出し、出力dirにあるignore fileへ戻る（`DefaultGenerator` 行148–160）。
  - 生成の種類（api、model、supporting files、webhooks）は、どれも指定しなければ全部を生成し、1つでも指定すれば指定しないものは生成しない（行199–223）。
  - 生成後、`.openapi-generator/VERSION`に生成器の版を、`.openapi-generator/FILES`に今回生成したfileの相対pathを並べて書く。javadocは、FILESはCIや、古い生成物を残さない再生成に向く、と書く。VERSIONとFILESは、どちらも`generateMetadata`が真の場合だけ書く（行1970、https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L1970-L1970、行2001、https://github.com/OpenAPITools/openapi-generator/blob/099d598b7f10bc671a8bedb6e55ac7851fc904ee/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultGenerator.java#L2001-L2001）。FILESはさらに、dry runでなく、supporting filesを生成する場合だけ書く（行1357–1362）。今回読んだ範囲では、FILESに載らない古いfileを生成器自身が消す処理は見当たらない。
  - 操作の`deprecated`は`isDeprecated`としてmodelへ写され（`DefaultCodegen` 行5003–5005）、templateがそれを使って生成codeに廃止の印を付ける（typescript-fetchでは`@deprecated`のdoc comment）。
  - 生成器自身の版の規則は、majorを「fallbackのない破壊的変更」、minorを「fallbackのある破壊的変更を許す」、patchを「破壊的変更なし」と定める（release-summary）。minorの例に、custom templateに切り替えれば旧挙動になるtemplateの変更を挙げる。
- 解いている問題と前提：API定義からSDKを多言語で作り、利用者や提供者が生成物の一部だけを手で直しても、再生成で失わないようにする。API定義が完全で正しいことが前提である。
- 必要な入力：OpenAPI文書、generatorとlibraryの選択、上書きするtemplate、再生成で守るfileのpattern、生成の種類の選択。
- trade-off・失敗の仕方：
  - templateを上書きすると、生成器の版上げで組込みtemplateや「template bound variables」が変わったとき、利用者のtemplateが追随しない。生成器の版の規則は、template bound variablesの大きな変更をmajorの例に挙げている。
  - ignore fileで守ったfileは、API定義の変更に追随しない。
  - FILESは記録だけで、古いfileの掃除は利用側に残る（今回読んだ範囲での観察）。
- 反例・適用しない場合：stripe-nodeの`src/apiVersion.ts`は先頭に「OpenAPI specから生成したfile」とcommentがあるが、生成器はこのrepoになく（P10-O08ではstripe/openapiのREADMEが生成器を公開していないと書いていた）、生成の構造は読めない（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/apiVersion.ts#L1-L4）。
- 互換・非互換：P32-O12（oasdiffは、生成SDKのcompile失敗を破壊的変更の判定理由に挙げる）、P32-O11（`deprecated`は生成codeの廃止の印にもなる）、P32-O14。
- 限界：生成の種類の既定やlibraryの数などの値は持ち込まない。generatorごとの差（言語別のtemplate）は、typescript-fetchの1 templateだけを読んだ。webhooks（OpenAPI 3.1）の生成は、入口（`generateWebhooks`）の存在だけを確認した。

### P32-O14 SDKの版とAPI版の対応、型の保証と破壊的変更の線引き、changelogでの印と固定の告知
- 出典：stripe-node、`README.md` 行162–174（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L162-L174）、行248–250（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L248-L250）、行577–605（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L577-L605）、行652–654（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L652-L654）、`src/stripe.core.ts` 行1174–1179（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/src/stripe.core.ts#L1174-L1179）、`CHANGELOG.md` 行8–40（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L8-L40）、行207–209（https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L207-L209）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TypeScriptの型は常に最新のAPIの形を表す。APIが後方非互換に変わると、新しいAPI版ができ、SDKのmajor版を出す。一方、実行時には壊れないが型の保証を弱める変更（例：新しいrequest parameterを渡したときだけ返るresponse enumの新しい値）は、SDKの方針では破壊的とせず、minor版の更新で新しい型errorが出ることがある、と明記する。READMEは、この方針を、古く不正確な型か、はるかに頻繁なmajor版か、の2つの代案より良いと判断している、と書く。
  - enumには、旧API版でも値が追加されうる「open」と、API版を変えない限り追加されない「closed」がある。openのenumの型は、既知の値に加えて任意の文字列を表す型を含む。
  - clientの`apiVersion`を指定しなければ、SDKのreleaseの時点の版を使う（`props.apiVersion || DEFAULT_API_VERSION`。既定の版は生成された`apiVersion.ts`の定数）。changelogは、版ごとに「pinned API versionを変える」ことを冒頭に書く。
  - changelogは、破壊的変更（breaking changes）の項目に⚠️を前置する。過去のmajor版の冒頭で、⚠️を破壊的変更の印と説明している（行530、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L530-L530、行597、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L597-L597、行873、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/CHANGELOG.md#L873-L873）。23.0.0では、型の削除、関数の削除、`tolerance`の意味の変更、Node.jsの最低版の引上げ等に⚠️が付く。多くの項目にPRの番号のlinkを付ける（linkのない項目もある）。
  - preview機能は、版に`-beta.X`（public preview）・`-alpha.X`（private preview）の接尾辞を付けた別のSDKで配る。private previewは`-alpha.X`の版で配り、機能によっては別の承認が要ると書く（行607–609、https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L607-L609）。preview SDKの間では、major版を上げずに破壊的変更がありうるので、版を厳密に固定することを勧める。preview機能の一部は、`Stripe-Version` headerに機能名と版を付けて指定する。
  - 新機能と修正は最新のmajor版にだけ出し、古いmajor版は使えるが更新されない、と書く。
- 解いている問題と前提：API版（サービス側の契約）とSDKの版（利用者が依存するpackage）の2つの版を、利用者が追えるように対応づける。SDKがAPI定義から生成されることが前提である。
- 必要な入力：API版の識別子、SDKの版の方式、破壊的とみなす変更の線引き（実行時か型か）、previewの配布経路、古いmajor版の支援の範囲。
- trade-off・失敗の仕方：minor版の更新で型errorが出うることを、方針として受け入れている。古いAPI版を使い続ける利用者は、型が合わない箇所を自分で抑止する必要がある（README 行125–135で`@ts-ignore`の使用を案内。https://github.com/stripe/stripe-node/blob/fe645f63d645011aca38dff9e245c1cf7b9ae60e/README.md#L125-L135 。本文は見出しと要旨だけ確認）。
- 反例・適用しない場合：oasdiffは、`x-extensible-enum`を使うとresponse enumへの値の追加を許すという扱いを文書化している（P32-O12。ほかの条件で追加を許すかは読んでいない）。stripe-nodeはopen enumという区分をSDKの型で表す。P10-O08のstripe/openapiは、enumの新しい値を月次の非破壊のchangelogに載せていた。
- 互換・非互換：P32-O04（⚠️の項目の一例）、P32-O12（版番号と破壊的変更の照合）、P32-O13（生成SDK）。
- 限界：古いmajor版の支援期間、Node.jsの支援方針の値は持ち込まない。changelogを生成する仕組み（`.hark/changes/`の断片fileの存在は確認した）の本体は読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 署名の対象 | standard-webhooks／Svix：`msg_id.timestamp.body`（O01） | stripe-node（Stripe形式）：`timestamp.payload`、idを含まない（O03） | idを署名で保護して冪等keyに使うか |
| 鍵の切替 | standard-webhooks：署名の列に新旧の署名を並べる。Svix：旧鍵に失効時刻、数に上限（O01） | stripe-node：headerに同じschemeの値が複数あれば、どれかが一致すればよい（`parseHeader`は同じschemeの値を全部集める）（O03） | 送信側が旧鍵の期限を管理するか |
| 署名方式の識別 | standard-webhooks：`v1`／`v1a`と鍵の接頭辞（O02） | stripe-node：期待するscheme名は`v1`で固定（`EXPECTED_SCHEME`）（O03） | 対称・非対称の両方を許すか |
| 検証の順序 | standard-webhooks実装：時刻→署名、時刻は両側（O03） | stripe-node：署名→時刻、時刻は古い側だけ、0の扱いは経路で異なる（O03・O04） | 失敗の説明を詳しくするか、replay対策の厳しさ |
| 重複の排除 | standard-webhooks：受信側がidを冪等keyにする（推奨）、libraryは保持しない（O05） | Svix（送信側）：`eventId`の期間付き一意性と409、APIの`Idempotency-Key`（O05） | 重複を送信側で防ぐか受信側で吸収するか |
| 再送と停止 | standard-webhooks：指数backoff＋jitter、410で無効化、429・502・504で減速（推奨）（O06） | Svix：設定の予定表＋jitter＋`Retry-After`の範囲制限、尽きた後に猶予期間をまたぐ失敗で無効化（410の特別扱いは見当たらない）（O06・O07） | 個々のstatusで止めるか、失敗の継続時間で止めるか |
| 取りこぼしの回復 | standard-webhooks：手動再送・範囲指定の再送を推奨（O07） | Svix：期間指定の一括回復（失敗のみで成功のないmessage）、手動試行は再送しない（O07） | 回復を誰が起動するか |
| payloadの量 | standard-webhooks：thin／fullの比較（O08） | stripe-node：thin通知とsnapshotを別関数で受け、通知から本体を取得（O08） | 受信側がAPIの権限を持つか、監査したいか |
| 廃止の告知（実行時） | deprecation-header：`Deprecation`＋link＋`Sunset`、hint扱い（O10） | P10-O07 K8s：`Warning` header・監査注釈・metric | 利用者のclientがheaderを読むか |
| 廃止の告知（定義・CI） | oasdiff：`deprecated`＋`x-sunset`＋猶予期間を差分で検査（O11） | openapi-generator：`deprecated`を生成codeの廃止の印にする（O13） | 告知の受け手が提供者のCIか、SDKの利用者か |
| 破壊的変更の線引き | oasdiff：定義の契約で判定、ERR／WARN／INFO、`x-extensible-enum`ならresponse enumへの追加を許すと文書化（O12） | stripe-node：実行時に壊れるかで判定し、型を弱める変更は非破壊、open enum（O14） | 型付きSDKの利用者を基準にするか、実行時を基準にするか |
| 版番号の連動 | oasdiff：破壊的変更とsemverのmajorの照合（既定INFO）（O12） | stripe-node：API版の変更とSDKのmajor版、changelogに固定版と⚠️（O14）。openapi-generator：生成器自身のmajor／minor／patchの規則（O13） | 版の方式がsemverか日付か |

## 見つからなかったこと・gap
- 開発者portal（APIの文書・鍵の発行・利用状況を利用者に見せるsite）の実装は、今回読んだrepositoryになかった。standard-webhooksは、失敗の一覧と手動再送、endpoint管理APIを推奨として挙げるだけで、画面の構造は書いていない。Svixの管理画面（app portal）は本repoに含まれていない。
- 利用者への告知の経路（email、dashboard、status page等）の実装は、Svixの運用webhook（送信先URLが設定された場合だけ）以外に見当たらなかった。告知の対象者をどう選ぶか（廃止APIの実際の利用者を特定する等）は、どのrepoにもなかった。
- 廃止APIの実際の利用状況を計測して告知に使う仕組み（P10-O07のK8sのmetricに当たるもの）は、今回の6 repoにはなかった。
- `Sunset` header（RFC 8594）の公式repoは探さず、本文は読んでいない。deprecation-headerのdraftが参照する範囲で記録した。
- webhook契約の版（payloadのschemaの版を変えるとき、既存endpointへどう移行させるか）は、standard-webhooksの「Migrating the payload」節（行335–339、https://github.com/standard-webhooks/standard-webhooks/blob/7537d2a2d3d52d8f2e0ecd12527af4a9307fd81b/spec/standard-webhooks.md#L335-L339。旧payloadへ追記、切替日前のendpointだけ二重化、新event typeを作る、の3案）を見ただけで、実装は見ていない。P10-O08のStripe（endpoint作成時に版を固定）が別の解き方である。
- OpenAPIの`callbacks`・`webhooks`で書いたwebhookの契約の破壊的変更検出は、oasdiffの既知の限界（callbackの検査なし）にあたり、他に検査する仕組みは見当たらなかった。
- ADR形式の設計記録は、6 repoとも見当たらなかった（判断の根拠は仕様文書、docs、code comment、changelogにある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`（`core.hooksPath`を無効化）し、固定commitから必要なfileだけを`git show`または`git checkout <sha> -- <path>`で取り出して読んだ。build、test、script、hook、package managerは実行していない。GitHub APIはrepositoryのmetadata（default branch、SPDX、archived）の取得に使った。
- standard-webhooks：`spec/standard-webhooks.md`（全体）、`libraries/javascript/src/index.ts`（全体）、`skills/receiving-webhooks/SKILL.md`（全体）、treeの一覧。読んでいないもの：他言語のlibrary（C#、Elixir、Go、Java、PHP、Python、Ruby、Rust）、`timing_safe_equal.ts`、test。
- deprecation-header：`draft-ietf-httpapi-deprecation-header.md`（全体）、`README.md`、`LICENSE.md`、最終commitのmessage。読んでいないもの：`published/`配下の過去のdraft、Sunset（RFC 8594）の本文。
- svix-webhooks：`server/svix-server/src/worker.rs`（60–280、286–730）、`src/core/message_app.rs`（124–201）、`src/core/operational_webhooks.rs`（95–175）、`src/core/webhook_http_client.rs`（138–245、598–660）、`src/core/idempotency.rs`（1–40）、`src/v1/endpoints/endpoint/secrets.rs`（全体）、`src/v1/endpoints/endpoint/recovery.rs`（全体）、`src/v1/endpoints/message.rs`（330–462とgrepの結果）。`config.default.toml`（`whitelabel_headers`の99–100行だけ）、`src/error.rs`（30–45）。読んでいないもの：`cfg.rs`と`config.default.toml`の他の設定値（値は持ち込まないため）、`queue/`、`db/`のmigration、`core/cryptography.rs`、`is_allowed`の定義、endpointのCRUDと再有効化、他言語のclient library、bridge。
- stripe-node：`src/Webhooks.ts`（全体）、`src/stripe.core.ts`（1170–1185、1615–1775）、`src/apiVersion.ts`、`README.md`（版・enum・preview・supportの節）、`CHANGELOG.md`（8–40、197–215とgrepの結果）。grepした語：`parseEventNotification`、`EventNotification`、`idempot`。読んでいないもの：`StripeEventNotificationHandler.ts`の本体、`RequestSender.ts`の本体、`crypto/`、`platform/`の`secureCompare`、`.hark/changes/`の各file、PR #2876の議論。
- oasdiff：`docs/BREAKING-CHANGES.md`、`docs/DEPRECATION.md`、`docs/STABILITY.md`、`docs/VERSIONING.md`、`docs/CHANGELOG-TEMPLATE.md`（1–71）、`checker/check_api_deprecation.go`、`checker/check_api_removed.go`、`checker/check_api_sunset_changed.go`（いずれも全体）、`checker/rules.go`（122–195）。読んでいないもの：他の数百の検査file、`diff/`（差分engine）、`docs/DIFF.md`・`CHECKS.md`、test data、`formatters/`の本体。
- openapi-generator：`docs/templating.md`（1–60）、`docs/customization.md`（1–80、165–275）、`docs/release-summary.md`（全体）、`GeneratorTemplateContentLocator.java`（全体）、`DefaultGenerator.java`（140–225、848–900、1340–1365、1500–1530、1960–2057）、`DefaultCodegen.java`（5000–5008とgrepの結果）、`typescript-fetch/apis.mustache`（grepの結果と105–125）。読んでいないもの：`TemplateManager.java`、`CodegenIgnoreProcessor.java`の本体、他の言語のgenerator・template、`docs/usage.md`の本文、`docs/file-post-processing.md`の本文。
- 検索した語：`webhook`、`signature`、`tolerance`、`idempot`、`retry`、`Retry-After`、`disable`、`recover`、`blocked`、`deprecated`、`sunset`、`stability`、`version`、`FILES`、`ignore`。
- 選ばなかった候補：RFC 8594（Sunset）の公式repo（deprecation-headerのdraftが関係を書いているため、今回は探していない）、stripe/openapi（P10で読んだため重ねない）、Svixの他言語client（受信側検証はstandard-webhooksとstripe-nodeで足りると判断した）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：standard-webhooksの仕様とdeprecation-headerのdraftは「規約の文書」、Svix・stripe-node・oasdiff・openapi-generatorは「実装」である。standard-webhooksの`SKILL.md`は、AI agent向けの手引きとして書かれた文書で、実装の範囲と記述がずれる箇所がある（P32-O05）。規約・実装・手引きの由来を区別して記録するかは未決。
- scope：観察は、外部へ公開するAPIの運用のうち、webhookの送受信、廃止の告知、SDKの生成、破壊的変更の検出に限っている。D05の旧台帳ではHELIX自身が外部公開APIを持たないとして`na`であり、Web展開後の内容を1.0の必須にしない（D08 §4）。どの製品に当てはめるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。deprecation-headerはarchivedで、本文はRFC公開前のeditor's copyである。最終本文（RFC）とdraftのどちらを版の正本とするかは未決。stripe-nodeの`tolerance`の扱い（P32-O04）のように、版の間で意味が変わった箇所がある。
- 状態：全観察（P32-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
